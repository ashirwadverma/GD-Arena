'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Mic, MicOff, Volume2, Sparkles, Zap, ChevronDown, ChevronUp, Radio, Sliders } from 'lucide-react';

interface SoundFrequencyAnalyzerProps {
  embedded?: boolean;
  onFrequencyUpdate?: (freq: number, db: number) => void;
}

export const SoundFrequencyAnalyzer: React.FC<SoundFrequencyAnalyzerProps> = ({
  embedded = false,
  onFrequencyUpdate,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [dominantFrequency, setDominantFrequency] = useState<number>(0);
  const [decibels, setDecibels] = useState<number>(-60);
  const [clarityScore, setClarityScore] = useState<number>(0);
  const [frequencyBand, setFrequencyBand] = useState<'Silent' | 'Bass' | 'Speech Core' | 'Presence' | 'Brilliance'>('Silent');
  const [isExpanded, setIsExpanded] = useState<boolean>(!embedded);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Frequency pitch detection using peak bin detection with quadratic interpolation
  const analyzeFrequency = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current || !audioContextRef.current) return;

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeDomainData = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeDomainData);

    // 1. Calculate RMS / Decibels
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = (timeDomainData[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / bufferLength);
    const currentDb = rms > 0 ? Math.max(-60, Math.round(20 * Math.log10(rms))) : -60;
    setDecibels(currentDb);

    // 2. Detect Dominant Frequency (Peak in speech band 80Hz - 3500Hz)
    const sampleRate = audioContextRef.current.sampleRate;
    const binSize = sampleRate / analyser.fftSize;

    let maxVal = 0;
    let peakIndex = 0;

    // Search specifically within human voice frequencies (80Hz to 4000Hz)
    const minBin = Math.floor(80 / binSize);
    const maxBin = Math.min(bufferLength - 1, Math.floor(4000 / binSize));

    for (let i = minBin; i <= maxBin; i++) {
      if (frequencyData[i] > maxVal) {
        maxVal = frequencyData[i];
        peakIndex = i;
      }
    }

    let detectedHz = 0;
    if (maxVal > 25) { // Threshold to ignore background hiss
      detectedHz = Math.round(peakIndex * binSize);
      setDominantFrequency(detectedHz);

      // Determine vocal band
      if (detectedHz < 150) {
        setFrequencyBand('Bass');
      } else if (detectedHz <= 1000) {
        setFrequencyBand('Speech Core');
      } else if (detectedHz <= 3000) {
        setFrequencyBand('Presence');
      } else {
        setFrequencyBand('Brilliance');
      }

      // Compute speech resonance clarity index (ratio of speech frequencies to noise)
      let speechEnergy = 0;
      let totalEnergy = 0;
      for (let i = 0; i < bufferLength; i++) {
        const val = frequencyData[i];
        totalEnergy += val;
        const freq = i * binSize;
        if (freq >= 120 && freq <= 2500) {
          speechEnergy += val;
        }
      }
      const clarity = totalEnergy > 0 ? Math.min(100, Math.round((speechEnergy / totalEnergy) * 100)) : 0;
      setClarityScore(clarity);

      if (onFrequencyUpdate) {
        onFrequencyUpdate(detectedHz, currentDb);
      }
    } else {
      setDominantFrequency(0);
      setFrequencyBand('Silent');
      setClarityScore(0);
    }

    // 3. Render High-Definition Frequency Spectrum on Canvas
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background subtle grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const barWidth = (width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength / 2; i++) {
      const barHeight = (frequencyData[i] / 255) * height;

      // Gradient color matching neon lime and electric purple theme
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(198, 241, 53, 0.2)');
      gradient.addColorStop(0.5, 'rgba(198, 241, 53, 0.85)');
      gradient.addColorStop(1, '#a855f7');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

      // Top glow cap on active peaks
      if (barHeight > 10) {
        ctx.fillStyle = '#c6f135';
        ctx.fillRect(x, height - barHeight - 2, barWidth - 1, 2);
      }

      x += barWidth;
    }

    animFrameRef.current = requestAnimationFrame(analyzeFrequency);
  }, [onFrequencyUpdate]);

  const startListening = async () => {
    try {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Keep raw frequency profile
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      setIsListening(true);
      animFrameRef.current = requestAnimationFrame(analyzeFrequency);
    } catch (err) {
      console.warn('Microphone access denied for frequency analysis:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsListening(false);
    setDominantFrequency(0);
    setDecibels(-60);
    setFrequencyBand('Silent');
    setClarityScore(0);
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Content for embedded or standalone widget
  return (
    <div
      className={`glass-card rounded-3xl border border-white/10 transition-all overflow-hidden ${
        embedded
          ? 'p-5 bg-[#0e0e14]/90'
          : 'fixed bottom-6 right-6 z-40 max-w-sm w-full p-4 bg-[#0a0a0f]/95 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl border-[#c6f135]/30'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isListening ? 'bg-[#c6f135] text-black shadow-lg shadow-[#c6f135]/30' : 'bg-white/5 text-slate-400'}`}>
            <Activity className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-xs text-white tracking-wide">ACOUSTIC FREQUENCY ANALYZER</span>
              <span className="section-tag py-0 px-1 text-[8px]">[ FFT 512 ]</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {isListening ? 'Live Vocal Spectrum Tracking' : 'Standby · Ready to Analyze'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-[#c6f135] text-black hover:scale-105 shadow-md shadow-[#c6f135]/20'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-3 h-3" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-3 h-3" />
                <span>Analyze Mic</span>
              </>
            )}
          </button>

          {!embedded && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg text-slate-400 hover:text-white bg-white/5"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Metrics & Canvas Visualizer */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Live Frequency Canvas */}
          <div className="relative rounded-2xl bg-black/80 border border-white/10 p-2 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={320}
              height={70}
              className="w-full h-[70px] rounded-xl block"
            />
            {/* Frequency Marker Legend */}
            <div className="flex justify-between px-1 pt-1 text-[8px] font-mono text-slate-500">
              <span>80Hz</span>
              <span>250Hz</span>
              <span>500Hz</span>
              <span>1kHz</span>
              <span>2.5kHz</span>
              <span>4kHz</span>
            </div>

            {!isListening && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs text-xs text-slate-400 font-mono space-x-2">
                <Radio className="w-3.5 h-3.5 text-[#c6f135] animate-pulse" />
                <span>Click &ldquo;Analyze Mic&rdquo; to test sound frequency</span>
              </div>
            )}
          </div>

          {/* Real-time Telemetry Cards */}
          <div className="grid grid-cols-3 gap-2">
            {/* Peak Frequency / Pitch */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Pitch (Hz)</span>
              <div className="text-base font-black text-[#c6f135] font-mono mt-0.5">
                {dominantFrequency > 0 ? `${dominantFrequency} Hz` : '--'}
              </div>
              <span className="text-[8px] text-slate-500 truncate block">
                {dominantFrequency > 0 ? frequencyBand : 'Idle'}
              </span>
            </div>

            {/* Sound Level / Decibels */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Level (dB)</span>
              <div className="text-base font-black text-purple-300 font-mono mt-0.5">
                {isListening ? `${decibels} dB` : '--'}
              </div>
              <span className="text-[8px] text-slate-500 truncate block">
                {decibels > -25 ? 'Strong Peak' : decibels > -45 ? 'Optimal Room' : 'Whisper/Quiet'}
              </span>
            </div>

            {/* Vocal Clarity Index */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Speech Clarity</span>
              <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                {clarityScore > 0 ? `${clarityScore}%` : '--'}
              </div>
              <span className="text-[8px] text-slate-500 truncate block">
                {clarityScore > 70 ? 'Crisp Resonant' : clarityScore > 40 ? 'Moderate' : 'Muffled'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
