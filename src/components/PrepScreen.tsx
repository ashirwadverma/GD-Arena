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
      <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card border border-brand-500/40 text-brand-300 text-sm font-bold shadow-lg shadow-brand-500/15">
        <Clock className="w-4 h-4 text-brand-accent animate-spin-slow" />
        <span>Preparation Time: {secondsLeft}s Remaining</span>
      </div>

      {/* Topic Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 backdrop-blur-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Assigned GD Topic
          </span>
          {caseStudy && (
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 flex items-center space-x-1">
              <BookOpen className="w-3 h-3" />
              <span>Case-Study Decision Mode</span>
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
          &ldquo;{topic}&rdquo;
        </h2>

        {/* Case Study Scenario Box (Feature C3) */}
        {caseStudy && (
          <div className="p-4 rounded-2xl bg-surface-100/80 border border-cyan-500/30 text-left space-y-2 text-xs text-slate-300">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>{caseStudy.company}: Scenario Background</span>
            </div>
            <p className="leading-relaxed">{caseStudy.scenario}</p>
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-200 font-semibold">
              🎯 Group Goal: {caseStudy.promptQuestion}
            </div>
          </div>
        )}

        {/* Candidate Assigned Role Card (Feature C2) */}
        {FEATURES.enableRoleAssignment && roleConfig && roleConfig.id !== 'none' && (
          <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-500/40 text-left space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-brand-300 text-xs">
                Your Assigned Role: {roleConfig.title}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-cyan-300 font-mono text-[10px]">
                Active Strategy
              </span>
            </div>
            <p className="text-slate-300">{roleConfig.description}</p>
            <p className="text-brand-300 font-semibold text-[11px]">
              💡 Strategy Tip: {roleConfig.strategyTip}
            </p>
          </div>
        )}
      </div>

      {/* B2: STRUCTURE COACH FOR FIRST SPEECH */}
      {FEATURES.enableStructureCoach && (
        <div className="glass-card rounded-3xl p-6 border border-brand-500/30 shadow-xl text-left space-y-3">
          <div className="flex items-center space-x-2 text-brand-300 font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Structure Coach · 3-Step Formula to Crack the First Speech</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-surface-100/70 border border-white/5 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-400">
                <Compass className="w-3.5 h-3.5" />
                <span>1. Define Scope</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Frame the problem into 2 clear pillars (e.g. Economical vs Ethical).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-100/70 border border-white/5 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                <Award className="w-3.5 h-3.5" />
                <span>2. State Stance</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Declare your core viewpoint with clarity and reasoned conviction.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-100/70 border border-white/5 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
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
      <div>
        <button
          onClick={onFinishPrep}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent hover:from-brand-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 inline-flex items-center space-x-2.5 transition-all transform hover:scale-105 cursor-pointer"
        >
          <span>Ready Now · Launch Discussion</span>
          <Play className="w-4 h-4 fill-white" />
        </button>
      </div>
    </div>
  );
};
