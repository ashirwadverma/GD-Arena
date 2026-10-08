'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Sidebar, MainNavTab } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { SessionsTableView } from '@/components/SessionsTableView';
import { TopicLibraryView } from '@/components/TopicLibraryView';
import { PanelExplorerView } from '@/components/PanelExplorerView';
import { SettingsView } from '@/components/SettingsView';
import { SetupScreen } from '@/components/SetupScreen';
import { MicCheckModal } from '@/components/MicCheckModal';
import { PrepScreen } from '@/components/PrepScreen';
import { ArenaRoom } from '@/components/ArenaRoom';
import { ReportView } from '@/components/ReportView';
import { HistoryModal } from '@/components/HistoryModal';
import { Segment, FeedbackReport, SessionData, PersonaId } from '@/lib/types';
import { getPanelPersonas } from '@/lib/personas';
import { saveSessionToDb, getAllSessionsFromDb, deleteSessionFromDb } from '@/lib/db';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';

type AppStep = 'SETUP' | 'PREP' | 'ROOM' | 'REPORT_GENERATING' | 'REPORT_VIEW';

export default function Home() {
  const [activeNavTab, setActiveNavTab] = useState<MainNavTab>('arena');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [currentStep, setCurrentStep] = useState<AppStep>('SETUP');
  const [isMicModalOpen, setIsMicModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isDebugOpen, setIsDebugOpen] = useState<boolean>(false);

  // Sessions list loaded from IndexedDB
  const [sessionsList, setSessionsList] = useState<SessionData[]>([]);

  // Configuration State
  const [topic, setTopic] = useState<string>('');
  const [panelSize, setPanelSize] = useState<number>(4);
  const [durationMinutes, setDurationMinutes] = useState<number>(2);
  const [patienceMs, setPatienceMs] = useState<number>(1200);
  const [difficulty, setDifficulty] = useState<any>('realistic');
  const [candidateRole, setCandidateRole] = useState<any>('none');
  const [caseStudyId, setCaseStudyId] = useState<string | undefined>(undefined);
  const [useTypingMode, setUseTypingMode] = useState<boolean>(false);

  // Report State
  const [currentReport, setCurrentReport] = useState<FeedbackReport | null>(null);

  // Refresh sessions from IndexedDB
  const refreshSessions = useCallback(async () => {
    try {
      const data = await getAllSessionsFromDb();
      setSessionsList(data);
    } catch (e) {
      console.warn('Failed to load sessions from IndexedDB:', e);
    }
  }, []);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // Keyboard shortcut for debug overlay ('`')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        setIsDebugOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartFromSetup = (config: {
    topic: string;
    panelSize: number;
    durationMinutes: number;
    patienceMs: number;
    useTypingMode: boolean;
    difficulty: any;
    candidateRole: any;
    caseStudyId?: string;
  }) => {
    setTopic(config.topic);
    setPanelSize(config.panelSize);
    setDurationMinutes(config.durationMinutes);
    setPatienceMs(config.patienceMs);
    setUseTypingMode(config.useTypingMode);
    setDifficulty(config.difficulty);
    setCandidateRole(config.candidateRole);
    setCaseStudyId(config.caseStudyId);
    setCurrentStep('PREP');
    setActiveNavTab('arena');
  };

  const handleFinishPrep = () => {
    setCurrentStep('ROOM');
  };

  const handleFinishDiscussion = async (
    segments: Segment[],
    totalDurationSeconds: number
  ) => {
    setCurrentStep('REPORT_GENERATING');

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          duration_s: totalDurationSeconds,
          segments,
          candidateRole,
          difficulty,
          caseStudyId,
        }),
      });

      if (!res.ok) {
        throw new Error('Report generation failed');
      }

      const report: FeedbackReport = await res.json();
      setCurrentReport(report);

      // Save to IndexedDB with dynamic panelist list
      const activePanelIds = getPanelPersonas(panelSize).map((p) => p.id);
      const sessionData: SessionData = {
        id: report.sessionId || `ses_${Date.now()}`,
        createdAt: new Date().toISOString(),
        topic,
        panelSize,
        panel: activePanelIds,
        durationSeconds: totalDurationSeconds,
        patienceMs,
        typingMode: useTypingMode,
        difficulty,
        candidateRole,
        caseStudyId,
        segments,
        stats: report.stats,
        report,
      };
      await saveSessionToDb(sessionData);
      await refreshSessions();

      setCurrentStep('REPORT_VIEW');
    } catch (err) {
      console.error('Error fetching report:', err);
      setCurrentStep('SETUP');
    }
  };

  const handleSelectHistorySession = (session: SessionData) => {
    if (session.report) {
      setCurrentReport(session.report);
      setCurrentStep('REPORT_VIEW');
      setActiveNavTab('arena');
      setIsHistoryOpen(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    await deleteSessionFromDb(id);
    await refreshSessions();
  };

  const handleClearAllHistory = async () => {
    for (const s of sessionsList) {
      await deleteSessionFromDb(s.id);
    }
    await refreshSessions();
  };

  const handleSelectTopicFromLibrary = (chosenTopic: string, chosenCaseId?: string) => {
    setTopic(chosenTopic);
    setCaseStudyId(chosenCaseId);
    setCurrentStep('SETUP');
    setActiveNavTab('arena');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-row overflow-x-hidden font-sans">
      {/* Sidebar Navigation (Desktop) */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeNavTab}
          onSelectTab={(tab) => {
            setActiveNavTab(tab);
            if (tab === 'arena' && currentStep === 'REPORT_VIEW' && !currentReport) {
              setCurrentStep('SETUP');
            }
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          sessionsCount={sessionsList.length}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72">
            <Sidebar
              activeTab={activeNavTab}
              onSelectTab={(tab) => {
                setActiveNavTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileSidebarOpen(false)}
              sessionsCount={sessionsList.length}
            />
          </div>
        </div>
      )}

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header Bar */}
        <Header
          activeTab={activeNavTab}
          onSelectTab={setActiveNavTab}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          onToggleDebug={() => setIsDebugOpen((prev) => !prev)}
          isDebugOpen={isDebugOpen}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 flex flex-col justify-start">
          {/* TAB 1: PRACTICE ARENA */}
          {activeNavTab === 'arena' && (
            <>
              {currentStep === 'SETUP' && (
                <SetupScreen onStartRoom={handleStartFromSetup} />
              )}

              {currentStep === 'PREP' && (
                <PrepScreen
                  topic={topic}
                  candidateRole={candidateRole}
                  caseStudyId={caseStudyId}
                  onFinishPrep={handleFinishPrep}
                />
              )}

              {currentStep === 'ROOM' && (
                <ArenaRoom
                  topic={topic}
                  panelSize={panelSize}
                  durationMinutes={durationMinutes}
                  patienceMs={patienceMs}
                  difficulty={difficulty}
                  candidateRole={candidateRole}
                  caseStudyId={caseStudyId}
                  useTypingMode={useTypingMode}
                  onFinishDiscussion={handleFinishDiscussion}
                  onLeave={() => setCurrentStep('SETUP')}
                  isDebugOpen={isDebugOpen}
                  onToggleDebug={() => setIsDebugOpen((prev) => !prev)}
                />
              )}

              {currentStep === 'REPORT_GENERATING' && (
                <div className="text-center py-24 px-4 space-y-6 max-w-md mx-auto animate-fade-in">
                  <div className="w-16 h-16 rounded-3xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/30">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white">Synthesizing GD Performance</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Calculating Layer 1 talk metrics, verifying literal transcript quotes, and evaluating 6 placement dimensions...
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 'REPORT_VIEW' && currentReport && (
                <ReportView
                  report={currentReport}
                  onRestart={() => {
                    setCurrentReport(null);
                    setCurrentStep('SETUP');
                  }}
                />
              )}
            </>
          )}

          {/* TAB 2: ANALYTICS DASHBOARD */}
          {activeNavTab === 'dashboard' && (
            <DashboardView
              sessions={sessionsList}
              onStartNewDiscussion={() => {
                setCurrentStep('SETUP');
                setActiveNavTab('arena');
              }}
              onViewSession={handleSelectHistorySession}
            />
          )}

          {/* TAB 3: SESSIONS NAVIGATION TABLE */}
          {activeNavTab === 'sessions' && (
            <SessionsTableView
              sessions={sessionsList}
              onViewSession={handleSelectHistorySession}
              onDeleteSession={handleDeleteSession}
              onStartNewDiscussion={() => {
                setCurrentStep('SETUP');
                setActiveNavTab('arena');
              }}
            />
          )}

          {/* TAB 4: TOPIC & CASE LIBRARY */}
          {activeNavTab === 'topics' && (
            <TopicLibraryView onSelectTopicToPractice={handleSelectTopicFromLibrary} />
          )}

          {/* TAB 5: AI PANEL EXPLORER */}
          {activeNavTab === 'personas' && <PanelExplorerView />}

          {/* TAB 6: SETTINGS & CALIBRATION */}
          {activeNavTab === 'settings' && (
            <SettingsView
              onOpenMicCheck={() => setIsMicModalOpen(true)}
              onClearHistory={handleClearAllHistory}
              sessionsCount={sessionsList.length}
            />
          )}
        </main>

        {/* Global Mic Check Modal */}
        <MicCheckModal
          isOpen={isMicModalOpen}
          onConfirmMic={() => setIsMicModalOpen(false)}
          onUseTyping={() => {
            setUseTypingMode(true);
            setIsMicModalOpen(false);
          }}
          onCancel={() => setIsMicModalOpen(false)}
        />

        {/* History Modal */}
        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectSession={handleSelectHistorySession}
        />

        {/* Global Footer */}
        <footer className="w-full border-t border-white/5 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <span>GD Arena © {new Date().getFullYear()}</span>
            <span>·</span>
            <span>LLOYD Hackathon PS2</span>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Browser-Side Privacy: Audio is never stored</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
