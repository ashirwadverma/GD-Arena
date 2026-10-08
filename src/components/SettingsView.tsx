'use client';

import React, { useState, useEffect } from 'react';
import { FEATURES } from '@/config/features';
import {
  Settings,
  Mic,
  Volume2,
  Sliders,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Database,
  Trash2,
  Award,
} from 'lucide-react';

interface SettingsViewProps {
  onOpenMicCheck: () => void;
  onClearHistory: () => Promise<void>;
  sessionsCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenMicCheck,
  onClearHistory,
  sessionsCount,
}) => {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [testSpeechText, setTestSpeechText] = useState<string>(
    'Welcome to GD Arena. Your microphone and speech synthesis are calibrated for live group discussion practice.'
  );
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [flags, setFlags] = useState<Record<string, boolean>>({ ...FEATURES });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && !selectedVoice) {
          setSelectedVoice(voices[0].name);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoice]);

  const handlePlayVoiceTest = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlayingVoice(true);

    const utterance = new SpeechSynthesisUtterance(testSpeechText);
    const chosen = availableVoices.find((v) => v.name === selectedVoice);
    if (chosen) utterance.voice = chosen;

    utterance.onend = () => setIsPlayingVoice(false);
    utterance.onerror = () => setIsPlayingVoice(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleFlag = (key: string) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Update runtime features object
      (FEATURES as any)[key] = next[key];
      return next;
    });
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all recorded discussion history from browser IndexedDB?')) {
      await onClearHistory();
      alert('History cleared successfully.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-surface-200 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
          <Settings className="w-3.5 h-3.5 text-brand-accent" />
          <span>Device & Audio Engine Calibration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Arena Preferences & Settings</h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Verify your hardware input levels, test local browser voices, inspect feature flags, and manage local data.
        </p>
      </div>

      {/* HARDWARE & VOICE CALIBRATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Microphone Check */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-brand-300 font-bold text-sm">
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>Microphone & VAD Threshold</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ensure your browser microphone permissions are granted and verify live input volume meter.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-100/80 border border-white/5 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span>Web Audio VAD Subsystem</span>
              <span className="text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Instant &lt;150ms barge-in interruption is enabled on modern Chromium & WebKit browsers.
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenMicCheck}
            className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>Launch Mic Check & Visualizer</span>
          </button>
        </div>

        {/* SpeechSynthesis Voice Tester */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-brand-300 font-bold text-sm">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Browser SpeechSynthesis Acoustics</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Test available local OS speech synthesis voices for the AI panelists.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Detected System Voices ({availableVoices.length})
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-100 border border-white/10 text-xs text-white outline-none cursor-pointer"
            >
              {availableVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handlePlayVoiceTest}
            className="w-full py-3 rounded-2xl bg-surface-100 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>{isPlayingVoice ? 'Stop Audio Test' : 'Test Selected Voice Audio'}</span>
          </button>
        </div>
      </div>

      {/* FEATURE FLAGS LIVE INSPECTOR */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-4 h-4 text-brand-accent" />
            <h3 className="text-sm font-bold text-white">Runtime Feature Flags Inspector</h3>
          </div>
          <span className="text-[10px] text-brand-300 font-mono">src/config/features.ts</span>
        </div>

        <p className="text-xs text-slate-400">
          All enhancements are wrapped in typed feature flags. Toggle any flag below to test or disable specific subsystems instantly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {Object.entries(flags).map(([key, isEnabled]) => (
            <div
              key={key}
              onClick={() => handleToggleFlag(key)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isEnabled
                  ? 'bg-brand-950/40 border-brand-500/40 text-white'
                  : 'bg-surface-100/40 border-white/5 text-slate-400'
              }`}
            >
              <span className="text-xs font-mono font-medium truncate pr-2">{key}</span>
              {isEnabled ? (
                <ToggleRight className="w-5 h-5 text-brand-accent shrink-0" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* DATA MANAGEMENT */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-slate-400" />
            <span>Local Browser Storage (IndexedDB)</span>
          </h4>
          <p className="text-xs text-slate-400">
            Currently storing {sessionsCount} practice sessions locally in your browser.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearAll}
          className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Saved History</span>
        </button>
      </div>
    </div>
  );
};
