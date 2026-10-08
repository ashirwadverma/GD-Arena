'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar, MainNavTab } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { HistoryModal } from '@/components/HistoryModal';
import { SoundFrequencyAnalyzer } from '@/components/SoundFrequencyAnalyzer';
import { SessionData } from '@/lib/types';
import { getAllSessionsFromDb, deleteSessionFromDb } from '@/lib/db';

export default function DashboardPage() {
  const router = useRouter();
  const [sessionsList, setSessionsList] = useState<SessionData[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const refreshSessions = useCallback(async () => {
    try {
      const data = await getAllSessionsFromDb();
      setSessionsList(data);
    } catch (e) {
      console.warn('Failed to load sessions for Dashboard:', e);
    }
  }, []);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const handleNavTabChange = (tab: MainNavTab) => {
    if (tab === 'arena') {
      router.push('/');
    } else if (tab === 'dashboard') {
      // Stay on dashboard
    } else {
      router.push(`/?tab=${tab}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-slate-100 flex flex-col font-sans selection:bg-[#c6f135] selection:text-black">
      {/* Top Header */}
      <Header
        activeTab="dashboard"
        onSelectTab={handleNavTabChange}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        onToggleDebug={() => {}}
        isDebugOpen={false}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab="dashboard"
          onSelectTab={handleNavTabChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          sessionsCount={sessionsList.length}
        />

        {/* Dashboard Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#080808] relative">
          {/* Ambient Glow mesh */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-[#c6f135]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto space-y-6">
            <DashboardView
              sessions={sessionsList}
              onStartNewDiscussion={() => router.push('/')}
              onViewSession={() => router.push('/?tab=sessions')}
            />
          </div>
        </main>
      </div>

      {/* Sound Frequency Analyzer floating widget */}
      <SoundFrequencyAnalyzer />

      {/* History modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={() => {
          setIsHistoryOpen(false);
          router.push('/?tab=sessions');
        }}
      />
    </div>
  );
}

