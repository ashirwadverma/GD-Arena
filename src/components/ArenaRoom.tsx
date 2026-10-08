'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FloorContext,
  createInitialContext,
  calculateBids,
  selectNextAiSpeaker,
} from '@/lib/state-machine';
import { PersonaId, Segment, DiscussionPhase, FloorState } from '@/lib/types';
import { PERSONAS } from '@/lib/personas';
import { SpeechManager } from '@/lib/stt';
import { TTSManager } from '@/lib/tts';
import { ParticipantCard } from './ParticipantCard';
import { LiveCaptions } from './LiveCaptions';
import { RealTimeNudge } from './RealTimeNudge';
import { TypingInputBar } from './TypingInputBar';
import { DebugOverlay } from './DebugOverlay';
import {
  Clock,
  Mic,
  MicOff,
  FastForward,
  Volume2,
  Award,
  Sparkles,
} from 'lucide-react';

interface ArenaRoomProps {
  topic: string;
  panelSize: number;
  durationMinutes: number;
  patienceMs: number;
  useTypingMode: boolean;
  onFinishDiscussion: (segments: Segment[], totalDurationSeconds: number) => void;
  onLeave: () => void;
  isDebugOpen: boolean;
  onToggleDebug: () => void;
}

export const ArenaRoom: React.FC<ArenaRoomProps> = ({
  topic,
  panelSize,
  durationMinutes,
  patienceMs,
  useTypingMode,
  onFinishDiscussion,
  onLeave,
  isDebugOpen,
  onToggleDebug,
}) => {
  const totalSeconds = durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [phase, setPhase] = useState<DiscussionPhase>('OPENING');
  const [floorState, setFloorState] = useState<FloorState>('MODERATOR_OPENING');
  const [currentSpeakerId, setCurrentSpeakerId] = useState<PersonaId | 'user' | null>('dr_nair');
  const [activeCaption, setActiveCaption] = useState<{ speakerName: string; text: string; isInterim?: boolean; isUser?: boolean }>({
    speakerName: 'Dr. Nair (Moderator)',
    text: 'Good day everyone. Let us commence the discussion...',
  });
  const [segments, setSegments] = useState<Segment[]>([]);
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(useTypingMode);
  const [lastLatencyMs, setLastLatencyMs] = useState<number>(240);
  const [soundVolume, setSoundVolume] = useState<number>(1.0);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [userMicVolume, setUserMicVolume] = useState<number>(0);

  // Engine references
  const contextRef = useRef<FloorContext>(createInitialContext(topic, panelSize, patienceMs));
  const sttRef = useRef<SpeechManager | null>(null);
  const ttsRef = useRef<TTSManager | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const endOfTurnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUtteranceBufferRef = useRef<string>('');
  const userSpeakingStartMsRef = useRef<number>(0);
  const lastUserActivityMsRef = useRef<number>(Date.now());
  const aiSpeechStartTimeRef = useRef<number>(0);

  // WebAudio VAD references
  const micAudioCtxRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micAnimFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Sync state into contextRef
  useEffect(() => {
    contextRef.current.phase = phase;
    contextRef.current.state = floorState;
    contextRef.current.currentSpeakerId = currentSpeakerId;
    contextRef.current.segments = segments;
    contextRef.current.patienceMs = patienceMs;
  }, [phase, floorState, currentSpeakerId, segments, patienceMs]);

  // Initial setup for STT, TTS, and live VAD
  useEffect(() => {
    const tts = new TTSManager();
    tts.setVolume(soundVolume);
    ttsRef.current = tts;

    if (!useTypingMode) {
      // 1. Initialize SpeechManager
      sttRef.current = new SpeechManager({
        onSpeechStart: () => {
          handleStudentSpeechStart();
        },
        onInterimResult: (transcript) => {
          handleStudentInterimResult(transcript);
        },
        onFinalResult: (transcript) => {
          handleStudentFinalResult(transcript);
        },
        onError: (err) => {
          console.warn('STT Error:', err);
        },
        onStatusChange: (listening) => {
          // listening state
        },
      });

      sttRef.current.start();

      // 2. Real-time WebAudio Visualizer and VAD Stream
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            micStreamRef.current = stream;
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const audioCtx = new AudioCtx();
              micAudioCtxRef.current = audioCtx;
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 256;
              micAnalyserRef.current = analyser;
              const source = audioCtx.createMediaStreamSource(stream);
              source.connect(analyser);

              const bufferLength = analyser.frequencyBinCount;
              const dataArray = new Uint8Array(bufferLength);

              const checkVolume = () => {
                if (!micAnalyserRef.current) return;
                micAnalyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / bufferLength;
                const vol = Math.min(100, Math.round((avg / 128) * 100));
                setUserMicVolume(vol);

                // Auto barge-in on vocal input (> 14% level)
                if (vol > 14 && contextRef.current.state !== 'STUDENT_SPEAKING') {
                  handleStudentSpeechStart();
                }

                micAnimFrameRef.current = requestAnimationFrame(checkVolume);
              };
              checkVolume();
            }
          })
          .catch((err) => {
            console.warn('Microphone stream error:', err);
          });
      }
    }

    // Start with Moderator opening utterance
    runModeratorOpening();

    return () => {
      sttRef.current?.stop();
      ttsRef.current?.stopAll();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (endOfTurnTimerRef.current) clearTimeout(endOfTurnTimerRef.current);

      if (micAnimFrameRef.current) cancelAnimationFrame(micAnimFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (micAudioCtxRef.current) {
        try {
          if (micAudioCtxRef.current.state !== 'closed') {
            micAudioCtxRef.current.close().catch(() => {});
          }
        } catch (e) {}
      }
    };
  }, []);

  // Main 1-second interval timer
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleDiscussionEnd();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;

        // If 1 minute remaining, transition to CLOSING_ROUND
        if (next <= 60 && phase === 'DISCUSSION') {
          setPhase('CLOSING_ROUND');
          triggerModeratorClosing();
        }

        // Silent coaching nudge checks (PRD S2)
        const msSinceLastSpoke = Date.now() - lastUserActivityMsRef.current;
        if (msSinceLastSpoke > 60000 && !nudgeMessage && phase === 'DISCUSSION') {
          setNudgeMessage('You haven\'t contributed in over a minute. Jump in with a counter-example or synthesize the room!');
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, phase, nudgeMessage]);

  // 1. Moderator opening statement
  const runModeratorOpening = async () => {
    setFloorState('MODERATOR_OPENING');
    setCurrentSpeakerId('dr_nair');
    const openingText = `Good day everyone, and welcome to this group discussion. Our topic today is: "${topic}". We have ${durationMinutes} minutes. Please be structured, build constructively, and respect each other. Who would like to open the floor?`;

    setActiveCaption({
      speakerName: 'Dr. Nair (Moderator)',
      text: openingText,
      isUser: false,
    });

    const seg: Segment = {
      id: `seg_${Date.now()}`,
      speakerId: 'dr_nair',
      speakerName: 'Dr. Nair',
      startMs: Date.now(),
      endMs: Date.now() + 4000,
      text: openingText,
      phase: 'OPENING',
    };

    setSegments((prev) => [...prev, seg]);
    contextRef.current.lastSpeakerId = 'dr_nair';
    sttRef.current?.setAiSpeakingContext(openingText);

    ttsRef.current?.enqueue({
      id: seg.id,
      text: openingText,
      personaId: 'dr_nair',
      onEnd: () => {
        setPhase('DISCUSSION');
        setFloorState('LIVE_IDLE');
        setCurrentSpeakerId(null);
        sttRef.current?.setAiSpeakingContext('');
        resetDeadAirTimer();
      },
    });
  };

  // 2. Dead air filler timer (PRD 6.2 rule 6: if 5-6s nobody speaks, highest bidder fills gap)
  const resetDeadAirTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (contextRef.current.state === 'LIVE_IDLE' && contextRef.current.phase === 'DISCUSSION') {
        triggerNextAiTurn();
      }
    }, 5500);
  }, []);

  // 3. BARGE-IN: Student starts speaking (stops AI audio immediately)
  const handleStudentSpeechStart = () => {
    lastUserActivityMsRef.current = Date.now();
    setNudgeMessage(null);

    // If an AI was speaking, interrupt immediately
    if (contextRef.current.state === 'AI_SPEAKING' || contextRef.current.state === 'AI_THINKING') {
      ttsRef.current?.stopAll();
      contextRef.current.abortController?.abort();

      // Mark previous AI segment as interrupted
      setSegments((prev) => {
        if (prev.length === 0) return prev;
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.speakerId !== 'user') {
          last.interrupted = true;
        }
        return copy;
      });
    }

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (endOfTurnTimerRef.current) clearTimeout(endOfTurnTimerRef.current);

    setFloorState('STUDENT_SPEAKING');
    setCurrentSpeakerId('user');
    userSpeakingStartMsRef.current = Date.now();
  };

  // 4. Student speech interim caption
  const handleStudentInterimResult = (transcript: string) => {
    currentUtteranceBufferRef.current = transcript;
    setActiveCaption({
      speakerName: 'You (Candidate)',
      text: transcript,
      isInterim: true,
      isUser: true,
    });

    // Reset end-of-turn patience timer
    if (endOfTurnTimerRef.current) clearTimeout(endOfTurnTimerRef.current);
    endOfTurnTimerRef.current = setTimeout(() => {
      finalizeStudentTurn(currentUtteranceBufferRef.current);
    }, patienceMs);
  };

  // 5. Student speech final result
  const handleStudentFinalResult = (transcript: string) => {
    currentUtteranceBufferRef.current = transcript;
    setActiveCaption({
      speakerName: 'You (Candidate)',
      text: transcript,
      isInterim: false,
      isUser: true,
    });

    if (endOfTurnTimerRef.current) clearTimeout(endOfTurnTimerRef.current);
    endOfTurnTimerRef.current = setTimeout(() => {
      finalizeStudentTurn(transcript);
    }, patienceMs);
  };

  // 6. Finalize student turn into transcript and trigger AI response
  const finalizeStudentTurn = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || cleanText.length < 2) {
      setFloorState('LIVE_IDLE');
      setCurrentSpeakerId(null);
      resetDeadAirTimer();
      return;
    }

    const startMs = userSpeakingStartMsRef.current || Date.now() - 3000;
    const endMs = Date.now();

    const newSegment: Segment = {
      id: `seg_${Date.now()}`,
      speakerId: 'user',
      speakerName: 'You',
      startMs,
      endMs,
      text: cleanText,
      phase: contextRef.current.phase,
    };

    setSegments((prev) => [...prev, newSegment]);
    contextRef.current.lastSpeakerId = 'user';
    contextRef.current.consecutiveAiTurns = 0; // Reset consecutive AI turns

    currentUtteranceBufferRef.current = '';
    setFloorState('LIVE_IDLE');
    setCurrentSpeakerId(null);

    // AI reacts to student turn
    setTimeout(() => {
      triggerNextAiTurn();
    }, 400);
  };

  // 7. Trigger next AI turn via Bidding & SSE API
  const triggerNextAiTurn = async () => {
    if (contextRef.current.state === 'STUDENT_SPEAKING') return;

    if (contextRef.current.consecutiveAiTurns >= 2) {
      resetDeadAirTimer();
    }

    const { speakerId, intent } = selectNextAiSpeaker(contextRef.current);
    const persona = PERSONAS[speakerId];

    setFloorState('AI_THINKING');
    setCurrentSpeakerId(speakerId);
    aiSpeechStartTimeRef.current = Date.now();

    const abortController = new AbortController();
    contextRef.current.abortController = abortController;

    try {
      const startTime = performance.now();

      const res = await fetch('/api/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          topic,
          phase: contextRef.current.phase,
          persona_id: speakerId,
          intent,
          time_remaining_s: secondsRemaining,
          turns: contextRef.current.segments.slice(-10).map((s) => ({
            speaker: s.speakerName,
            text: s.text,
          })),
        }),
      });

      const latency = Math.round(performance.now() - startTime);
      setLastLatencyMs(latency);

      if (!res.ok) {
        throw new Error('Turn API request failed');
      }

      setFloorState('AI_SPEAKING');
      contextRef.current.consecutiveAiTurns += 1;
      contextRef.current.lastSpeakerId = speakerId;

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  const sentence = data.text;
                  fullText += (fullText ? ' ' : '') + sentence;

                  setActiveCaption({
                    speakerName: persona.name,
                    text: fullText,
                    isUser: false,
                  });

                  sttRef.current?.setAiSpeakingContext(sentence);

                  ttsRef.current?.enqueue({
                    id: `utt_${Date.now()}`,
                    text: sentence,
                    personaId: speakerId,
                    onEnd: () => {},
                  });
                }
              } catch (e) {}
            }
          }
        }
      }

      // Record final segment
      if (fullText) {
        const seg: Segment = {
          id: `seg_${Date.now()}`,
          speakerId,
          speakerName: persona.name,
          startMs: aiSpeechStartTimeRef.current,
          endMs: Date.now(),
          text: fullText,
          phase: contextRef.current.phase,
        };
        setSegments((prev) => [...prev, seg]);
      }

      // Schedule next action when speech completes
      setTimeout(() => {
        if (contextRef.current.state === 'AI_SPEAKING' && contextRef.current.currentSpeakerId === speakerId) {
          setFloorState('LIVE_IDLE');
          setCurrentSpeakerId(null);
          sttRef.current?.setAiSpeakingContext('');
          resetDeadAirTimer();
        }
      }, 2000);
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      const fallback = persona.cannedLines[0] || 'I agree with the points raised.';
      setActiveCaption({ speakerName: persona.name, text: fallback });
      setFloorState('LIVE_IDLE');
      setCurrentSpeakerId(null);
      resetDeadAirTimer();
    }
  };

  // 8. Moderator closing round
  const triggerModeratorClosing = () => {
    ttsRef.current?.stopAll();
    setCurrentSpeakerId('dr_nair');
    setFloorState('CLOSING_ROUND');

    const closingPrompt = 'We have reached the final minute. I invite each candidate to present a 20-second concluding synthesis.';
    setActiveCaption({ speakerName: 'Dr. Nair (Moderator)', text: closingPrompt });

    ttsRef.current?.enqueue({
      id: `closing_mod_${Date.now()}`,
      text: closingPrompt,
      personaId: 'dr_nair',
      onEnd: () => {
        setFloorState('LIVE_IDLE');
        setCurrentSpeakerId(null);
      },
    });
  };

  // 9. End discussion and forward to Report
  const handleDiscussionEnd = () => {
    ttsRef.current?.stopAll();
    sttRef.current?.stop();
    setFloorState('ENDED');
    onFinishDiscussion(contextRef.current.segments, totalSeconds - secondsRemaining || totalSeconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const activePanelList = contextRef.current.panel;

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 space-y-6 animate-fade-in relative">
      {/* Top Status & Timer Bar */}
      <div className="bg-surface-200 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {phase} Phase
            </span>
            <span className="text-xs text-slate-400 font-medium">Topic:</span>
          </div>
          <h2 className="text-sm md:text-base font-bold text-white line-clamp-1">
            {topic}
          </h2>
        </div>

        {/* Controls: Timer, Fast Forward, Mic, Volume Booster, Finish */}
        <div className="flex items-center space-x-3">
          {/* Timer Display */}
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-surface-100 border border-white/10 font-mono text-sm font-bold text-slate-100">
            <Clock className="w-4 h-4 text-brand-accent animate-pulse" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Fast-Forward (Judge Demo shortcut) */}
          <button
            onClick={() => setSecondsRemaining(30)}
            className="px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center space-x-1"
            title="Fast forward to Closing Round"
          >
            <FastForward className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Fast Forward</span>
          </button>

          {/* Mic Mute / Unmute */}
          {!useTypingMode && (
            <button
              onClick={() => {
                if (isMicMuted) {
                  sttRef.current?.start();
                  setIsMicMuted(false);
                } else {
                  sttRef.current?.stop();
                  setIsMicMuted(true);
                }
              }}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                isMicMuted
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              }`}
              title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {/* AI Sound Volume Booster */}
          <div className="relative">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-2 rounded-xl bg-surface-100 hover:bg-surface-50 border border-white/10 text-xs font-semibold text-brand-300 hover:text-white transition-all flex items-center space-x-1"
              title="Adjust AI Voice Sound Volume"
            >
              <Volume2 className="w-4 h-4 text-brand-400" />
              <span className="hidden md:inline font-mono">{Math.round(soundVolume * 100)}%</span>
            </button>

            {showVolumeSlider && (
              <div className="absolute right-0 top-12 z-30 p-3.5 rounded-2xl bg-surface-300 border border-brand-500/40 shadow-2xl backdrop-blur-xl w-52 space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-200">
                  <span>AI Sound Level</span>
                  <span className="text-brand-300 font-mono">{Math.round(soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={soundVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSoundVolume(val);
                    ttsRef.current?.setVolume(val);
                  }}
                  className="w-full accent-brand-500 h-2 bg-surface-100 rounded-lg cursor-pointer"
                />
                <div className="text-[10px] text-slate-400 text-center">
                  Boosted for maximum clarity & volume
                </div>
              </div>
            )}
          </div>

          {/* Finish & Generate Report */}
          <button
            onClick={handleDiscussionEnd}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Finish & Report</span>
          </button>
        </div>
      </div>

      {/* Real-time Coaching Nudge (PRD S2) */}
      <RealTimeNudge
        message={nudgeMessage}
        onDismiss={() => setNudgeMessage(null)}
      />

      {/* Live Discussion Grid of Participants */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Moderator Card */}
        <ParticipantCard
          id="dr_nair"
          isSpeaking={currentSpeakerId === 'dr_nair'}
          isThinking={floorState === 'AI_THINKING' && currentSpeakerId === 'dr_nair'}
        />

        {/* User (Candidate) Card with Live Mic Audio Level */}
        <ParticipantCard
          id="user"
          isSpeaking={currentSpeakerId === 'user'}
          isMuted={isMicMuted}
          micVolume={userMicVolume}
        />

        {/* AI Panelists */}
        {activePanelList.map((pId) => (
          <ParticipantCard
            key={pId}
            id={pId}
            isSpeaking={currentSpeakerId === pId}
            isThinking={floorState === 'AI_THINKING' && currentSpeakerId === pId}
          />
        ))}
      </div>

      {/* Subtitles & Captions Bar */}
      <div className="space-y-3">
        <LiveCaptions
          speakerName={activeCaption.speakerName}
          text={activeCaption.text}
          isInterim={activeCaption.isInterim}
          isUser={activeCaption.isUser}
        />

        {/* Text Input (always available for rapid typing) */}
        <TypingInputBar
          onSendText={(txt) => {
            handleStudentSpeechStart();
            handleStudentFinalResult(txt);
          }}
        />
      </div>

      {/* Debug Engine Overlay */}
      <DebugOverlay
        context={contextRef.current}
        isOpen={isDebugOpen}
        onClose={onToggleDebug}
        latencyMs={lastLatencyMs}
      />
    </div>
  );
};
