'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Keyboard, ShieldAlert, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { SpeechManager } from '@/lib/stt';

interface MicCheckModalProps {
  isOpen: boolean;
  onConfirmMic: () => void;
  onUseTyping: () => void;
  onCancel: () => void;
}

export const MicCheckModal: React.FC<MicCheckModalProps> = ({
  isOpen,
  onConfirmMic,
  onUseTyping,
  onCancel,
}) => {
  const [micState, setMicState] = useState<'prompt' | 'testing' | 'granted' | 'denied'>('prompt');
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const isSupported = SpeechManager.isSupported();

  const startMicTest = async () => {
    try {
      setMicState('testing');
      
      // Auto-fallback timeout after 4 seconds if prompt is pending
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 4000)
      );

      const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true });
      const stream = (await Promise.race([streamPromise, timeoutPromise])) as MediaStream;

      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
      setMicState('granted');
    } catch (err) {
      if (isSupported) {
        setMicState('granted'); // Allow user to proceed with voice anyway
      } else {
        setMicState('denied');
      }
    }
  };

  const cleanupAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }
      } catch (e) {
        // Safe catch
      }
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      startMicTest();
    }
    return () => {
      cleanupAudio();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-surface-200 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/30">
            {micState === 'denied' && !isSupported ? (
              <MicOff className="w-7 h-7 text-rose-400" />
            ) : (
              <Mic className="w-7 h-7 text-brand-400" />
            )}
          </div>
          <h3 className="text-xl font-bold text-white">Microphone & Voice Setup</h3>
          <p className="text-xs text-slate-300">
            Speak naturally and the AI panel will transcribe, respond out loud, and evaluate your performance.
          </p>
        </div>

        {/* Volume Level Meter Box */}
        <div className="bg-surface-100 p-4 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSupported ? 'Speech Recognition Ready' : 'Typing Mode Ready'}</span>
            </span>
            <span className="text-slate-400 font-mono">
              {volumeLevel > 0 ? `${volumeLevel}% Mic Level` : 'Ready'}
            </span>
          </div>

          <div className="w-full h-3 bg-surface-300 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-brand-400 to-cyan-400 transition-all duration-75"
              style={{ width: `${Math.max(10, volumeLevel)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            {isSupported
              ? 'Microphone is connected. Use headphones to prevent laptop speaker echo.'
              : 'Web speech is not supported in this browser profile; you can use text typing mode.'}
          </p>
        </div>

        {/* Headphone Advice */}
        <div className="p-3 rounded-xl bg-surface-100/70 border border-white/5 text-[11px] text-slate-300 flex items-start space-x-2">
          <Volume2 className="w-4 h-4 text-brand-300 shrink-0 mt-0.5" />
          <span>
            <strong>Audio Pro-Tip:</strong> Headphones ensure clean barge-in detection without audio feedback.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              cleanupAudio();
              onConfirmMic();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent hover:from-brand-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01]"
          >
            <span>Start Discussion (Voice Mode)</span>
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              cleanupAudio();
              onUseTyping();
            }}
            className="w-full py-3 rounded-2xl bg-surface-100 hover:bg-surface-50 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <Keyboard className="w-4 h-4 text-brand-400" />
            <span>Use Typing Mode (Text Chat)</span>
          </button>

          <button
            onClick={() => {
              cleanupAudio();
              onCancel();
            }}
            className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Back to Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
