'use client';

import React from 'react';
import {
  Mic,
  LayoutDashboard,
  TableProperties,
  BookOpen,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot,
  ShieldCheck,
  Flame,
  Award,
} from 'lucide-react';

export type MainNavTab = 'arena' | 'dashboard' | 'sessions' | 'topics' | 'personas' | 'settings';

interface SidebarProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  sessionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  sessionsCount,
}) => {
  const navItems = [
    {
      id: 'arena' as MainNavTab,
      label: 'Practice Arena',
      icon: Mic,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Voice-First AI Group Discussion',
    },
    {
      id: 'dashboard' as MainNavTab,
      label: 'Analytics Hub',
      icon: LayoutDashboard,
      badge: undefined,
      description: 'Readiness & Performance Trends',
    },
    {
      id: 'sessions' as MainNavTab,
      label: 'Sessions Table',
      icon: TableProperties,
      badge: sessionsCount > 0 ? `${sessionsCount}` : undefined,
      badgeColor: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
      description: 'Verifiable Assessment History',
    },
    {
      id: 'topics' as MainNavTab,
      label: 'Topic Catalog',
      icon: BookOpen,
      badge: '15+',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      description: 'Curated Placement Themes & Cases',
    },
    {
      id: 'personas' as MainNavTab,
      label: 'AI Panelists',
      icon: Users,
      badge: '6 Agents',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Persona Matrix & Voices',
    },
    {
      id: 'settings' as MainNavTab,
      label: 'Settings & Audio',
      icon: Settings,
      badge: undefined,
      description: 'TTS Calibration & Flags',
    },
  ];

  return (
    <aside
      className={`relative z-40 transition-all duration-300 ease-in-out shrink-0 flex flex-col justify-between glass-card border-r border-white/10 backdrop-blur-2xl bg-[#0c0c0f]/95 min-h-screen ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Header Section */}
      <div className="p-4 space-y-6">
        {/* Brand Section */}
        <div className="flex items-center justify-between">
          <div
            onClick={() => onSelectTab('arena')}
            className="flex items-center space-x-3 cursor-pointer group overflow-hidden"
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-900 via-indigo-900 to-[#c6f135]/40 border border-[#c6f135]/40 flex items-center justify-center shadow-lg shadow-[#c6f135]/15 group-hover:scale-105 transition-transform">
                <span className="text-xl text-[#c6f135] font-black group-hover:rotate-45 transition-transform duration-300">
                  ✳
                </span>
              </div>
            </div>

            {!isCollapsed && (
              <div className="leading-tight animate-fade-in">
                <div className="flex items-center space-x-1.5">
                  <span className="text-base font-black tracking-tight text-white">
                    GD Arena
                  </span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-[#c6f135]/20 text-[#c6f135] border border-[#c6f135]/30">
                    AI SAAS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Placement Simulator</p>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl glass-pill text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer hidden md:flex items-center justify-center"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-[#c6f135]" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5 pt-2" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-2xl transition-all duration-200 cursor-pointer group relative ${
                  isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-950/90 to-indigo-950/70 text-white shadow-lg border border-[#c6f135]/50 shadow-[#c6f135]/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-xl transition-colors ${
                      isActive ? 'bg-[#c6f135] text-black font-black' : 'text-slate-400 group-hover:text-[#c6f135]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>

                  {!isCollapsed && (
                    <div className="text-left leading-tight truncate">
                      <div
                        className={`text-xs font-bold truncate ${
                          isActive ? 'text-[#c6f135]' : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{item.description}</div>
                    </div>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isActive
                        ? 'bg-[#c6f135]/20 text-[#c6f135] border-[#c6f135]/40'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-xl bg-surface-100 border border-white/10 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Status Widget */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {!isCollapsed ? (
          <div className="p-3.5 rounded-2xl bg-surface-100/80 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#c6f135] flex items-center justify-center text-black text-[10px] font-black">
                  GD
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Candidate Mode</div>
                  <div className="text-[9px] text-[#c6f135] flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c6f135] animate-pulse" />
                    <span>Tier-A Engine Active</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">v2.4</span>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center space-x-1 pt-1 border-t border-white/5 font-mono">
              <ShieldCheck className="w-3 h-3 text-[#c6f135] shrink-0" />
              <span className="truncate">Browser-Only Privacy</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="w-9 h-9 rounded-2xl bg-surface-100 border border-white/10 flex items-center justify-center text-[#c6f135]"
              title="Candidate Mode Active"
            >
              <Award className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
