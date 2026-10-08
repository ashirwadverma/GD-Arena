'use client';

import React, { useState } from 'react';
import { PERSONAS } from '@/lib/personas';
import { PersonaId } from '@/lib/types';
import {
  Users,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Target,
  ShieldAlert,
  Mic,
  Award,
} from 'lucide-react';

export const PanelExplorerView: React.FC = () => {
  const [playingPersona, setPlayingPersona] = useState<PersonaId | null>(null);

  const personaList = Object.values(PERSONAS);

  const handleTestVoice = (personaId: PersonaId, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (playingPersona === personaId) {
      window.speechSynthesis.cancel();
      setPlayingPersona(null);
      return;
    }

    window.speechSynthesis.cancel();
    setPlayingPersona(personaId);

    const persona = PERSONAS[personaId];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = persona.pitch || 1.0;
    utterance.rate = persona.rate || 1.0;
    utterance.onend = () => setPlayingPersona(null);
    utterance.onerror = () => setPlayingPersona(null);

    // Try to match voice gender
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) =>
      persona.voiceGender === 'female'
        ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha')
        : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george')
    );
    if (matchedVoice) utterance.voice = matchedVoice;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-surface-200 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
          <Users className="w-3.5 h-3.5 text-brand-accent" />
          <span>Multi-Agent Behavioral Matrix</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">AI Panelist Personas & Voice Profiles</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Get to know the 6 autonomous AI agents you will interact with in the GD arena. Each panelist has distinct conversational assertiveness, voice acoustics, and tactical bidding traits.
        </p>
      </div>

      {/* PERSONAS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {personaList.map((persona) => {
          const isPlaying = playingPersona === persona.id;
          const sampleAudioLine =
            persona.openingLine ||
            `Hello, I'm ${persona.name}. In our group discussions, I focus on ${persona.tagline}. Let's test your ideas.`;

          return (
            <div
              key={persona.id}
              className="glass-card p-6 rounded-3xl border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Avatar & Role Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${persona.avatarColor} flex items-center justify-center text-2xl shadow-lg`}
                    >
                      {persona.avatar}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{persona.name}</h3>
                      <p className="text-xs text-brand-300 font-semibold">{persona.role}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &ldquo;{persona.tagline}&rdquo;
                </p>

                {/* Personality & Behavioral Trait */}
                <div className="p-3 rounded-2xl bg-surface-100/80 border border-white/5 space-y-1 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Conversational Dynamics:
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{persona.personality}</p>
                </div>

                {/* Talkativeness Gauge */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Assertiveness & Bidding Urge</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {Math.round(persona.talkativeness * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
                      style={{ width: `${Math.round(persona.talkativeness * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Voice Preview Button */}
              <div className="pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => handleTestVoice(persona.id, sampleAudioLine)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    isPlaying
                      ? 'bg-brand-500 text-white shadow-lg animate-pulse'
                      : 'bg-surface-100 hover:bg-white/10 text-slate-200 border border-white/10'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Stop Voice Test</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-brand-accent" />
                      <span>Test Browser Voice Acoustics</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
