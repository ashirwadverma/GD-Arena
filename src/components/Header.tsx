'use client';

import React from 'react';
import { Bot, Sparkles, History, Terminal, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onToggleDebug: () => void;
  isDebugOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory, onToggleDebug, isDebugOpen }) => {
  return (
    <header className="w-full sticky top-0 z-50 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-5 py-2.5 rounded-2xl shadow-xl shadow-black/40 border border-white/10 backdrop-blur-xl">
        {/* Brand Logo with Glowing Aura */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-accent flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-brand-500/20 blur-sm -z-10 group-hover:bg-brand-500/40 transition-colors" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                GD Arena
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-brand-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AI SaaS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Voice-First Group Discussion Simulator
            </p>
          </div>
        </div>

        {/* Center Pill: Live Status Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full glass-pill border border-white/10 text-[11px] text-slate-300 font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span>Real-time Voice Orchestration Active</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl glass-pill hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all hover:border-brand-500/40 cursor-pointer"
            title="View Past Sessions"
          >
            <History className="w-3.5 h-3.5 text-brand-300" />
            <span className="hidden sm:inline">History</span>
          </button>

          <button
            onClick={onToggleDebug}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isDebugOpen
                ? 'bg-brand-600 text-white border-brand-400 shadow-md shadow-brand-500/40'
                : 'glass-pill hover:bg-white/10 border-white/10 text-slate-300'
            }`}
            title="Toggle Engine Inspector (` key)"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Debugger</span>
          </button>
        </div>
      </div>
    </header>
  );
};
