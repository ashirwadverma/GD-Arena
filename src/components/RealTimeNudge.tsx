'use client';

import React from 'react';
import { Lightbulb, X } from 'lucide-react';

interface RealTimeNudgeProps {
  message: string | null;
  onDismiss: () => void;
}

export const RealTimeNudge: React.FC<RealTimeNudgeProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-500/40 rounded-xl p-3 flex items-start justify-between space-x-3 text-amber-200 text-xs shadow-lg shadow-amber-500/10 animate-fade-in backdrop-blur-md">
      <div className="flex items-start space-x-2.5">
        <div className="p-1 rounded-lg bg-amber-500/30 text-amber-300 mt-0.5">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-amber-300 block text-[11px] uppercase tracking-wider">
            Coach Tip
          </span>
          <p className="text-slate-200 text-xs mt-0.5 leading-snug">{message}</p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-amber-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
