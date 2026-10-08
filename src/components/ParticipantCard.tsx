'use client';

import React from 'react';
import { PersonaId, PersonaStance, CandidateRole } from '@/lib/types';
import { PERSONAS } from '@/lib/personas';
import { CANDIDATE_ROLES } from '@/lib/roles';
import { AudioVisualizer } from './AudioVisualizer';
import { Bot, User, MicOff, AlertCircle, Hand } from 'lucide-react';
import { FEATURES } from '@/config/features';

interface ParticipantCardProps {
  id: PersonaId | 'user';
  isSpeaking: boolean;
  isThinking?: boolean;
  wasInterrupted?: boolean;
  wantsToSpeak?: boolean;
  stance?: PersonaStance;
  candidateRole?: CandidateRole;
  talkSharePct?: number;
  isMuted?: boolean;
  micVolume?: number;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  id,
  isSpeaking,
  isThinking = false,
  wasInterrupted = false,
  wantsToSpeak = false,
  stance = 'neutral',
  candidateRole = 'none',
  talkSharePct,
  isMuted = false,
  micVolume = 0,
}) => {
  const isUser = id === 'user';
  const persona = !isUser ? PERSONAS[id as PersonaId] : null;
  const roleConfig = isUser ? CANDIDATE_ROLES[candidateRole] : null;

  const name = isUser ? 'You (Candidate)' : persona?.name || 'AI Participant';
  const role = isUser ? (roleConfig?.id !== 'none' ? roleConfig?.title : 'Student') : persona?.role || 'Panelist';
  const avatar = isUser ? '🎓' : persona?.avatar || '🤖';
  const colorGradient = isUser
    ? 'from-emerald-500 to-teal-600'
    : persona?.avatarColor || 'from-indigo-500 to-purple-600';

  const userHasSound = isUser && (isSpeaking || micVolume > 8);

  const getStanceBadge = (st: PersonaStance) => {
    if (st === 'for') return { label: 'PRO', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (st === 'against') return { label: 'CON', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    return { label: 'NEUTRAL', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
  };

  const stanceData = getStanceBadge(stance);

  return (
    <div
      className={`relative rounded-3xl p-4 transition-all duration-200 border flex flex-col items-center justify-between min-h-[175px] text-center backdrop-blur-xl ${
        userHasSound
          ? 'bg-[#c6f135]/10 border-[#c6f135] shadow-2xl shadow-[#c6f135]/30 scale-[1.03] ring-2 ring-[#c6f135]/50'
          : isSpeaking
          ? 'bg-purple-950/40 border-purple-500/80 shadow-2xl shadow-purple-500/30 scale-[1.03] ring-2 ring-purple-500/50'
          : isThinking
          ? 'bg-[#111116] border-amber-500/50 shadow-lg shadow-amber-500/10 animate-pulse'
          : 'glass-card border-white/5 hover:border-white/15'
      }`}
    >
      {/* Top badges bar */}
      <div className="w-full flex items-center justify-between text-[10px] font-semibold text-slate-400">
        <div className="flex items-center space-x-1.5">
          {!isUser ? (
            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/10 font-mono text-[9px]">
              <Bot className="w-3 h-3 text-purple-400" />
              <span>AI</span>
            </span>
          ) : (
            <span
              className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-lg border font-mono text-[9px] ${
                userHasSound
                  ? 'bg-[#c6f135] text-black font-bold animate-pulse'
                  : 'bg-[#c6f135]/20 text-[#c6f135] border-[#c6f135]/30'
              }`}
            >
              <User className="w-3 h-3" />
              <span>{userHasSound ? 'Speaking' : 'Candidate'}</span>
            </span>
          )}

          {/* A4: Stance Badge */}
          {FEATURES.enableStanceTracking && !isUser && id !== 'dr_nair' && (
            <span className={`px-1.5 py-0.5 rounded-lg border font-mono text-[9px] ${stanceData.color}`}>
              {stanceData.label}
            </span>
          )}

          {/* C2: Candidate Role Tag on User Card */}
          {FEATURES.enableRoleAssignment && isUser && candidateRole && candidateRole !== 'none' && (
            <span className="px-1.5 py-0.5 rounded-lg bg-[#c6f135]/20 text-[#c6f135] border border-[#c6f135]/30 text-[9px] font-bold font-mono">
              {roleConfig?.badge}
            </span>
          )}

          {wasInterrupted && (
            <span className="px-1.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-0.5 animate-bounce font-mono text-[9px]">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>Cut off</span>
            </span>
          )}
        </div>

        {talkSharePct !== undefined && (
          <span className="text-[10px] text-[#c6f135] font-mono glass-pill px-1.5 py-0.5 rounded-lg border border-[#c6f135]/20">
            {talkSharePct}%
          </span>
        )}
      </div>

      {/* Avatar with dynamic glow ring & A1 wants to speak badge */}
      <div className="relative my-2">
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorGradient} flex items-center justify-center text-3xl shadow-lg transition-transform duration-200 ${
            userHasSound || isSpeaking ? 'scale-110 shadow-purple-500/40 motion-safe:animate-bounce-short' : ''
          }`}
        >
          <span>{avatar}</span>
        </div>

        {/* Pulsing ring (disabled under prefers-reduced-motion) */}
        {(userHasSound || isSpeaking) && (
          <div
            className={`absolute -inset-1.5 rounded-2xl blur-sm -z-10 motion-safe:animate-pulse ${
              userHasSound ? 'bg-[#c6f135]/50' : 'bg-purple-500/50'
            }`}
          />
        )}

        {/* A1: Wants to Speak (Hand Raised) Badge */}
        {FEATURES.enableWantsToSpeakIndicator && wantsToSpeak && !isSpeaking && (
          <div
            className="absolute -top-2 -right-2 bg-gradient-to-tr from-amber-500 to-[#c6f135] text-black font-bold rounded-full p-1.5 shadow-lg border border-white/30 animate-bounce cursor-help"
            title={`${name} wants to make a point!`}
          >
            <Hand className="w-3.5 h-3.5" />
          </div>
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
        <p className="text-[10px] text-slate-400 truncate max-w-[140px] mx-auto">{role}</p>
      </div>

      {/* Speaking State Waveform */}
      <div className="w-full mt-2 pt-2 border-t border-white/5 h-6 flex items-center justify-center">
        {userHasSound || isSpeaking ? (
          <AudioVisualizer
            isActive={true}
            color={userHasSound ? 'bg-[#c6f135]' : 'bg-purple-400'}
            barCount={8}
          />
        ) : isThinking ? (
          <span className="text-[10px] text-amber-400 font-medium flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Thinking...</span>
          </span>
        ) : wantsToSpeak ? (
          <span className="text-[10px] text-amber-300 font-semibold flex items-center space-x-1">
            <Hand className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Wants to speak</span>
          </span>
        ) : (
          <span className="text-[10px] text-slate-500 font-mono">[ LISTENING ]</span>
        )}
      </div>
    </div>
  );
};
