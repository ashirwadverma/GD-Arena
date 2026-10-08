'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Play, Lightbulb, Compass, Award } from 'lucide-react';

interface PrepScreenProps {
  topic: string;
  onFinishPrep: () => void;
}

export const PrepScreen: React.FC<PrepScreenProps> = ({ topic, onFinishPrep }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(20);

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
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 animate-fade-in text-center">
      {/* Timer Pill */}
      <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-surface-100 border border-brand-500/40 text-brand-300 text-sm font-bold shadow-lg shadow-brand-500/10">
        <Clock className="w-4 h-4 text-brand-accent animate-spin-slow" />
        <span>Preparation Time: {secondsLeft}s Remaining</span>
      </div>

      {/* Topic Card */}
      <div className="bg-surface-200 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-4">
        <span className="text-xs uppercase tracking-wider font-extrabold text-brand-400">
          Your Assigned GD Topic
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-white leading-snug">
          &ldquo;{topic}&rdquo;
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Take a moment to formulate 2 to 3 core pillars (e.g. Economical, Technological, Ethical)
          before the moderator initiates the discussion.
        </p>
      </div>

      {/* Quick Placement Strategy Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        <div className="p-4 rounded-2xl bg-surface-100/80 border border-white/5 space-y-2">
          <div className="flex items-center space-x-2 text-brand-400 font-bold text-xs">
            <Compass className="w-4 h-4" />
            <span>1. Anchor Framework</span>
          </div>
          <p className="text-xs text-slate-400">
            Define the scope early. Categorize into short-term vs long-term impact.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-100/80 border border-white/5 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
            <Lightbulb className="w-4 h-4" />
            <span>2. Build on Peers</span>
          </div>
          <p className="text-xs text-slate-400">
            Reference other participants by name (e.g. &ldquo;Building on Meera&rsquo;s point...&rdquo;).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-100/80 border border-white/5 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
            <Award className="w-4 h-4" />
            <span>3. Summarize Concisely</span>
          </div>
          <p className="text-xs text-slate-400">
            In the closing round, balance both perspectives with an actionable recommendation.
          </p>
        </div>
      </div>

      {/* Skip Button */}
      <div>
        <button
          onClick={onFinishPrep}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-xl shadow-brand-500/25 inline-flex items-center space-x-2 transition-all transform hover:scale-105"
        >
          <span>Ready Now · Start Moderator Opening</span>
          <Play className="w-4 h-4 fill-white" />
        </button>
      </div>
    </div>
  );
};
