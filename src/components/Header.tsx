import React from 'react';
import { Sparkles, History, Terminal, ShieldCheck, Zap, Menu, Mic, Play } from 'lucide-react';
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
        return 'Settings & Calibration';
      default:
        return 'Practice Arena';
    }
  };

  return (
    <header className="w-full sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3 transition-all border-b border-white/5 bg-[#080808]/90 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button, Asterisk Logo & Breadcrumbs */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-xl glass-pill text-slate-300 hover:text-white border border-white/10 md:hidden cursor-pointer"
            aria-label="Toggle Mobile Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div
            onClick={() => onSelectTab('arena')}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <span className="text-xl text-[#c6f135] font-black group-hover:rotate-45 transition-transform duration-300">
              ✳
            </span>
            <span className="text-base font-black text-white tracking-tight">
              GD Arena
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">/</span>

          <span className="hidden sm:inline-block text-[11px] font-bold text-[#c6f135] bg-[#c6f135]/10 px-2.5 py-0.5 rounded-full border border-[#c6f135]/20 font-mono">
            {getTabTitle()}
          </span>
        </div>

        {/* Center Pill: Live Audio Subsystem Status */}
        <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 font-medium">
          <div className="w-2 h-2 rounded-full bg-[#c6f135] animate-pulse shadow-sm shadow-[#c6f135]" />
          <span>Autonomous Multi-Agent Voice Engine</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5">
          {activeTab !== 'arena' && (
            <button
              type="button"
              onClick={() => onSelectTab('arena')}
              className="btn-video-pill cursor-pointer"
            >
              <div className="btn-video-pill-icon">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <span>Enter Arena</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleDebug}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              isDebugOpen
                ? 'bg-[#c6f135] text-black border-[#c6f135] shadow-md shadow-[#c6f135]/30'
                : 'glass-pill hover:bg-white/10 border-white/10 text-slate-300'
            }`}
            title="Toggle Engine Inspector (` key)"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-mono">Debugger</span>
          </button>
        </div>
      </div>
    </header>
  );
};
