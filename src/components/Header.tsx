'use client';

import React from 'react';
import { Bot, Sparkles, History, Terminal, ShieldCheck, Zap, Menu, Mic, Play } from 'lucide-react';
import { MainNavTab } from './Sidebar';

interface HeaderProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onToggleMobileSidebar: () => void;
  onToggleDebug: () => void;
  isDebugOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onToggleMobileSidebar,
  onToggleDebug,
  isDebugOpen,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'arena':
        return 'Practice Arena';
      case 'dashboard':
        return 'Performance Analytics';
      case 'sessions':
        return 'Sessions Navigation Table';
      case 'topics':
        return 'Topic & Case Library';
      case 'personas':
        return 'AI Panelist Personas';
      case 'settings':
        return 'Settings & Audio Calibration';
      default:
        return 'Practice Arena';
    }
  };

  return (
    <header className="w-full sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3 transition-all border-b border-white/5 bg-surface-200/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Breadcrumbs */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-xl glass-pill text-slate-300 hover:text-white border border-white/10 md:hidden cursor-pointer"
            aria-label="Toggle Mobile Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span
              onClick={() => onSelectTab('arena')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:inline"
            >
              GD Arena
            </span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="text-white font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
              {getTabTitle()}
            </span>
          </div>
        </div>

        {/* Center Pill: Live Audio Subsystem Status */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full glass-pill border border-white/10 text-[11px] text-slate-300 font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span>Local Voice Engine: SpeechSynthesis & Web Speech API</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {activeTab !== 'arena' && (
            <button
              type="button"
              onClick={() => onSelectTab('arena')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start GD</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleDebug}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isDebugOpen
                ? 'bg-brand-600 text-white border-brand-400 shadow-md shadow-brand-500/40'
                : 'glass-pill hover:bg-white/10 border-white/10 text-slate-300'
            }`}
            title="Toggle Engine Inspector (` key)"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Debugger</span>
          </button>
        </div>
      </div>
    </header>
  );
};
