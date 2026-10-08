'use client';

import React from 'react';
import { FloorContext } from '@/lib/state-machine';
import { calculateBids } from '@/lib/state-machine';
import { Terminal, X, Zap, Activity } from 'lucide-react';

interface DebugOverlayProps {
  context: FloorContext;
  isOpen: boolean;
  onClose: () => void;
  latencyMs?: number;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({
  context,
  isOpen,
  onClose,
  latencyMs = 0,
}) => {
  if (!isOpen) return null;

  const bids = calculateBids(context);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto rounded-2xl bg-surface-300/95 border border-brand-500/40 p-4 shadow-2xl backdrop-blur-xl text-xs font-mono text-slate-200">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
        <div className="flex items-center space-x-2 text-brand-400">
          <Terminal className="w-4 h-4" />
          <span className="font-bold uppercase tracking-wider">Engine Inspector</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Core state machine */}
        <div className="bg-surface-200 p-2.5 rounded-xl border border-white/5 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Floor State:</span>
            <span className="font-bold text-amber-300">{context.state}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Phase:</span>
            <span className="text-brand-300">{context.phase}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Active Speaker:</span>
            <span className="text-emerald-400">{context.currentSpeakerId || 'None (Floor Open)'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Consecutive AI:</span>
            <span>{context.consecutiveAiTurns} / 2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Patience:</span>
            <span>{context.patienceMs}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Last Latency:</span>
            <span className="text-cyan-400">{latencyMs}ms</span>
          </div>
        </div>

        {/* Bidding Matrix */}
        <div>
          <h5 className="font-semibold text-slate-400 text-[11px] mb-1.5 flex items-center space-x-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>AI Bidding Scores (Highest Speaks):</span>
          </h5>
          <div className="space-y-1">
            {bids.map((b, idx) => (
              <div
                key={b.personaId}
                className={`p-1.5 rounded-lg border text-[11px] flex items-center justify-between ${
                  idx === 0
                    ? 'bg-brand-500/20 border-brand-500/40 text-white font-bold'
                    : 'bg-surface-200/60 border-white/5 text-slate-400'
                }`}
              >
                <span>
                  {idx + 1}. {b.personaId}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500 font-normal">
                    (t:{b.breakdown.talkativeness} s:{b.breakdown.silenceTerm})
                  </span>
                  <span className="text-brand-300">{b.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Segments count */}
        <div className="text-[10px] text-slate-500 flex justify-between border-t border-white/5 pt-2">
          <span>Total Recorded Turns:</span>
          <span>{context.segments.length}</span>
        </div>
      </div>
    </div>
  );
};
