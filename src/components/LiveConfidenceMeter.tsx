'use client';

import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp, Gauge, Volume2, Mic, Flame } from 'lucide-react';
import { FEATURES } from '@/config/features';

interface LiveConfidenceMeterProps {
  wpm: number;
  talkSharePct: number;
  fillerCount: number;
  fillerPerMinute: number;
}

export const LiveConfidenceMeter: React.FC<LiveConfidenceMeterProps> = ({
  wpm,
  talkSharePct,
  fillerCount,
  fillerPerMinute,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!FEATURES.enableLiveConfidenceMeter) return null;

  // Pace indicator
  const getPaceStatus = (speed: number) => {
    if (speed === 0) return { text: 'Ready', color: 'text-slate-400' };
    if (speed >= 110 && speed <= 160) return { text: 'Optimal (120-150)', color: 'text-emerald-400' };
    if (speed < 110) return { text: 'Slow (<110)', color: 'text-amber-400' };
    return { text: 'Fast (>160)', color: 'text-rose-400' };
  };

  const pace = getPaceStatus(wpm);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="w-full glass-card rounded-2xl border border-white/10 p-3 shadow-xl backdrop-blur-xl text-xs transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-200">
          <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-500/30">
            <Gauge className="w-3.5 h-3.5 text-brand-accent" />
          </div>
          <span className="font-bold text-xs">Live Confidence & Delivery Meter</span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          title={isExpanded ? 'Collapse Confidence Meter' : 'Expand Confidence Meter'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-3 gap-2.5 mt-2.5 pt-2.5 border-t border-white/5 animate-fade-in">
          {/* Speaking Pace */}
          <div className="bg-surface-100/60 p-2.5 rounded-xl border border-white/5 space-y-0.5 text-center">
            <span className="text-[10px] text-slate-400 font-medium block">Speaking Pace</span>
            <div className="text-base font-black text-white">
              {wpm} <span className="text-[10px] font-normal text-slate-400">WPM</span>
            </div>
            <span className={`text-[9px] font-semibold block ${pace.color}`}>{pace.text}</span>
          </div>

          {/* Talk Share */}
          <div className="bg-surface-100/60 p-2.5 rounded-xl border border-white/5 space-y-0.5 text-center">
            <span className="text-[10px] text-slate-400 font-medium block">Room Talk Share</span>
            <div className="text-base font-black text-brand-300">{talkSharePct}%</div>
            <span className="text-[9px] text-slate-400 block">Target: 20-30%</span>
          </div>

          {/* Filler Word Count */}
          <div className="bg-surface-100/60 p-2.5 rounded-xl border border-white/5 space-y-0.5 text-center">
            <span className="text-[10px] text-slate-400 font-medium block">Filler Words</span>
            <div
              className={`text-base font-black ${
                fillerPerMinute > 3 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {fillerCount} <span className="text-[10px] font-normal text-slate-400">total</span>
            </div>
            <span className="text-[9px] text-slate-400 block">
              {fillerPerMinute} / min
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
