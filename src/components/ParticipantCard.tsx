'use client';

import React from 'react';
import { PersonaId } from '@/lib/types';
import { PERSONAS } from '@/lib/personas';
import { AudioVisualizer } from './AudioVisualizer';
import { Bot, User, Mic, MicOff, AlertCircle } from 'lucide-react';

interface ParticipantCardProps {
  id: PersonaId | 'user';
  isSpeaking: boolean;
  isThinking?: boolean;
  wasInterrupted?: boolean;
  talkSharePct?: number;
  isMuted?: boolean;
  micVolume?: number;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  id,
  isSpeaking,
  isThinking = false,
  wasInterrupted = false,
  talkSharePct,
  isMuted = false,
  micVolume = 0,
}) => {
  const isUser = id === 'user';
  const persona = !isUser ? PERSONAS[id as PersonaId] : null;

  const name = isUser ? 'You (Candidate)' : persona?.name || 'AI Participant';
  const role = isUser ? 'Student' : persona?.role || 'Panelist';
  const avatar = isUser ? '🎓' : persona?.avatar || '🤖';
  const colorGradient = isUser
    ? 'from-emerald-500 to-teal-600'
    : persona?.avatarColor || 'from-indigo-500 to-purple-600';

  const userHasSound = isUser && (isSpeaking || micVolume > 8);

  return (
    <div
      className={`relative rounded-2xl p-4 transition-all duration-200 border flex flex-col items-center justify-between min-h-[165px] text-center ${
        userHasSound
          ? 'bg-emerald-950/40 border-emerald-400 shadow-xl shadow-emerald-500/25 scale-[1.03] ring-2 ring-emerald-500/50'
          : isSpeaking
          ? 'bg-surface-50 border-brand-400 shadow-xl shadow-brand-500/25 scale-[1.03] ring-2 ring-brand-500/40'
          : isThinking
          ? 'bg-surface-100/90 border-amber-500/50 shadow-lg shadow-amber-500/10 animate-pulse'
          : 'bg-surface-100/60 border-white/5 hover:border-white/10 hover:bg-surface-100'
      }`}
    >
      {/* Top badges */}
      <div className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400">
        <div className="flex items-center space-x-1">
          {!isUser ? (
            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px]">
              <Bot className="w-3 h-3" />
              <span>AI</span>
            </span>
          ) : (
            <span className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border text-[10px] ${
              userHasSound
                ? 'bg-emerald-500 text-white font-bold animate-pulse'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              <User className="w-3 h-3" />
              <span>{userHasSound ? 'Speaking...' : 'You'}</span>
            </span>
          )}
          {wasInterrupted && (
            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] flex items-center space-x-0.5 animate-bounce">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>Cut off</span>
            </span>
          )}
        </div>

        {talkSharePct !== undefined && (
          <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">
            {talkSharePct}% share
          </span>
        )}
      </div>

      {/* Avatar with dynamic glow ring */}
      <div className="relative my-2">
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorGradient} flex items-center justify-center text-3xl shadow-lg transition-transform duration-200 ${
            userHasSound || isSpeaking ? 'scale-110 shadow-brand-500/40 animate-bounce-short' : ''
          }`}
        >
          <span>{avatar}</span>
        </div>

        {(userHasSound || isSpeaking) && (
          <div className={`absolute -inset-1.5 rounded-2xl blur-sm -z-10 animate-pulse ${
            userHasSound ? 'bg-emerald-400/40' : 'bg-brand-400/30'
          }`} />
        )}

        {isUser && isMuted && (
          <div className="absolute -bottom-1 -right-1 bg-rose-600 rounded-full p-1 text-white shadow-md border border-white/20">
            <MicOff className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Name and Role */}
      <div className="w-full">
        <h4 className="text-sm font-bold text-slate-100 flex items-center justify-center space-x-1">
          <span>{name}</span>
        </h4>
        <p className="text-[11px] text-slate-400 truncate max-w-[140px] mx-auto">{role}</p>
      </div>

      {/* Speaking state / waveform / thinking */}
      <div className="w-full mt-2 pt-2 border-t border-white/5 h-6 flex items-center justify-center">
        {userHasSound || isSpeaking ? (
          <AudioVisualizer
            isActive={true}
            color={userHasSound ? 'bg-emerald-400' : 'bg-brand-400'}
            barCount={8}
          />
        ) : isThinking ? (
          <span className="text-[10px] text-amber-400 font-medium flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Thinking...</span>
          </span>
        ) : (
          <span className="text-[10px] text-slate-500 font-mono">Listening</span>
        )}
      </div>
    </div>
  );
};
