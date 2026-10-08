'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SetupScreen } from '@/components/SetupScreen';
import { MicCheckModal } from '@/components/MicCheckModal';
import { PrepScreen } from '@/components/PrepScreen';
import { ArenaRoom } from '@/components/ArenaRoom';
import { ReportView } from '@/components/ReportView';
import { HistoryModal } from '@/components/HistoryModal';
import { Segment, FeedbackReport, SessionData, PersonaId } from '@/lib/types';
import { getPanelPersonas } from '@/lib/personas';
import { saveSessionToDb } from '@/lib/db';
import { Loader2, ShieldCheck } from 'lucide-react';

type AppStep = 'SETUP' | 'PREP' | 'ROOM' | 'REPORT_GENERATING' | 'REPORT_VIEW';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>('SETUP');
  const [isMicModalOpen, setIsMicModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isDebugOpen, setIsDebugOpen] = useState<boolean>(false);

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

      setCurrentStep('REPORT_VIEW');
    } catch (err) {
      console.error('Error fetching report:', err);
      // Fallback
      setCurrentStep('SETUP');
    }
  };

  const handleSelectHistorySession = (session: SessionData) => {
    if (session.report) {
      setCurrentReport(session.report);
      setCurrentStep('REPORT_VIEW');
      setIsHistoryOpen(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen bg-background">
      {/* Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onToggleDebug={() => setIsDebugOpen((prev) => !prev)}
        isDebugOpen={isDebugOpen}
      />

      {/* Main Interactive Flow */}
      <main className="flex-1 flex flex-col justify-center">
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
          <div className="text-center py-20 px-4 space-y-6 max-w-md mx-auto animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/30">
              <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Synthesizing GD Performance</h2>
              <p className="text-xs text-slate-400">
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
      </main>

      {/* Saved History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={handleSelectHistorySession}
      />

      {/* Footer */}
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
  );
}
