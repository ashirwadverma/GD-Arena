'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Play, Lightbulb, Compass, Award, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { CandidateRole } from '@/lib/types';
import { CANDIDATE_ROLES } from '@/lib/roles';
import { CASE_STUDIES } from '@/lib/case-studies';
import { FEATURES } from '@/config/features';

interface PrepScreenProps {
  topic: string;
  candidateRole?: CandidateRole;
  caseStudyId?: string;
  onFinishPrep: () => void;
}

export const PrepScreen: React.FC<PrepScreenProps> = ({
  topic,
  candidateRole = 'none',
  caseStudyId,
  onFinishPrep,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(20);
  const roleConfig = CANDIDATE_ROLES[candidateRole];
  const caseStudy = caseStudyId ? CASE_STUDIES.find((c) => c.id === caseStudyId) : null;

  useEffect(() => {
    if (secondsLeft <= 0) {
      onFinishPrep();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onFinishPrep]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-fade-in text-center">
      {/* Timer Pill */}
      <div className="inline-flex items-center space-x-2.5 px-5 py-2.5 rounded-full bg-[#111116] border border-[#c6f135]/40 text-[#c6f135] text-xs font-mono font-bold shadow-lg shadow-[#c6f135]/15">
        <Clock className="w-4 h-4 text-[#c6f135] animate-spin-slow" />
        <span className="tracking-wider">[ TIME REMAINING: {secondsLeft}s ]</span>
      </div>

      {/* Topic Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 backdrop-blur-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="section-tag">
            [ ASSIGNED TOPIC ]
          </span>
          {caseStudy && (
            <span className="section-tag text-purple-300 border-purple-500/30 bg-purple-950/40 flex items-center space-x-1">
              <BookOpen className="w-3 h-3" />
              <span>[ CASE STUDY MODE ]</span>
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug tracking-tight">
          &ldquo;{topic}&rdquo;
        </h2>

        {/* Case Study Scenario Box (Feature C3) */}
        {caseStudy && (
          <div className="p-4 rounded-2xl bg-black/50 border border-purple-500/30 text-left space-y-2 text-xs text-slate-300">
            <div className="flex items-center space-x-2 text-purple-300 font-bold">
              <Sparkles className="w-4 h-4 text-[#c6f135]" />
              <span>{caseStudy.company}: Scenario Background</span>
            </div>
            <p className="leading-relaxed">{caseStudy.scenario}</p>
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-[#c6f135]/20 text-[#c6f135] font-semibold">
              🎯 Group Goal: {caseStudy.promptQuestion}
            </div>
          </div>
        )}

        {/* Candidate Assigned Role Card (Feature C2) */}
        {FEATURES.enableRoleAssignment && roleConfig && roleConfig.id !== 'none' && (
          <div className="p-4 rounded-2xl bg-[#111116] border border-[#c6f135]/30 text-left space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#c6f135] text-xs font-mono">
                [ YOUR ROLE: {roleConfig.title.toUpperCase()} ]
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#c6f135]/20 text-[#c6f135] font-mono text-[10px] font-bold">
                Active Strategy
              </span>
            </div>
            <p className="text-slate-300">{roleConfig.description}</p>
            <p className="text-[#c6f135] font-semibold text-[11px]">
              💡 Strategy Tip: {roleConfig.strategyTip}
            </p>
          </div>
        )}
      </div>

      {/* B2: STRUCTURE COACH FOR FIRST SPEECH */}
      {FEATURES.enableStructureCoach && (
        <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl text-left space-y-3">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-[#c6f135]" />
            <span className="font-mono text-xs text-[#c6f135]">[ STRUCTURE COACH · 3-STEP OPENING FORMULA ]</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
                <Compass className="w-3.5 h-3.5 text-[#c6f135]" />
                <span>1. Define Scope</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Frame the problem into 2 clear pillars (e.g. Economical vs Ethical).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
                <Award className="w-3.5 h-3.5 text-[#c6f135]" />
                <span>2. State Stance</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Declare your core viewpoint with clarity and reasoned conviction.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-[#c6f135]" />
                <span>3. Invite Peers</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Conclude by inviting peers to expand on counter-perspectives.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Skip Button */}
      <div className="pt-2">
        <button
          onClick={onFinishPrep}
          className="btn-video-pill text-sm md:text-base px-8 py-4 cursor-pointer inline-flex items-center space-x-3 group"
        >
          <div className="btn-video-pill-icon w-8 h-8">
            →
          </div>
          <span>Ready Now · Launch Discussion</span>
        </button>
      </div>
    </div>
  );
};

