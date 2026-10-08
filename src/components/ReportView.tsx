import React, { useState, useEffect, useRef } from 'react';
import { FeedbackReport, PerformanceDelta, SessionData } from '@/lib/types';
import { TranscriptViewer } from './TranscriptViewer';
import { getAllSessionsFromDb } from '@/lib/db';
import { CANDIDATE_ROLES } from '@/lib/roles';
import { FEATURES } from '@/config/features';
import {
  Award,
  Clock,
  Mic,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Volume2,
  VolumeX,
  PieChart,
  Quote,
  ShieldCheck,
  ChevronDown,
  Printer,
  History,
  Target,
  UserCheck,
} from 'lucide-react';

interface ReportViewProps {
  report: FeedbackReport;
  onRestart: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, onRestart }) => {
  const [highlightedSegmentId, setHighlightedSegmentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feedback' | 'transcript' | 'stats'>('feedback');
  const [playingMissedIndex, setPlayingMissedIndex] = useState<number | null>(null);
  const [previousSession, setPreviousSession] = useState<SessionData | null>(null);
  const [deltas, setDeltas] = useState<PerformanceDelta | null>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);

  const { stats, dimensions, missedOpenings, top3Actions, overallScore, overallVerdict } = report;

  // Fetch previous session from IndexedDB to compute Before-and-After progress (B4)
  useEffect(() => {
    let isMounted = true;
    async function loadHistoryDelta() {
      try {
        const allSessions = await getAllSessionsFromDb();
        // Exclude current session
        const olderSessions = allSessions.filter(
          (s) => s.id !== report.sessionId && s.report?.id !== report.id
        );

        if (olderSessions.length > 0 && olderSessions[0].stats && isMounted) {
          const prev = olderSessions[0];
          setPreviousSession(prev);

          if (prev.stats) {
            const computedDelta: PerformanceDelta = {
              talkShareDeltaPct: stats.userTalkSharePct - prev.stats.userTalkSharePct,
              wpmDelta: stats.speakingPaceWpm - prev.stats.speakingPaceWpm,
              fillerPerMinDelta: stats.fillerWordsPerMinute - prev.stats.fillerWordsPerMinute,
              firstEntryDeltaSeconds:
                stats.timeToFirstContributionSeconds - prev.stats.timeToFirstContributionSeconds,
              overallScoreDelta:
                Math.round((overallScore - (prev.report?.overallScore || 3.0)) * 10) / 10,
            };
            setDeltas(computedDelta);
          }
        }
      } catch (err) {
        console.warn('Failed to load history for delta comparison:', err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    }

    loadHistoryDelta();
    return () => {
      isMounted = false;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [report]);

  // Audio Replay for Missed Openings (B3)
  const handlePlayMissedOpening = (text: string, index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (playingMissedIndex === index) {
      window.speechSynthesis.cancel();
      setPlayingMissedIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    setPlayingMissedIndex(index);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setPlayingMissedIndex(null);
    utterance.onerror = () => setPlayingMissedIndex(null);

    window.speechSynthesis.speak(utterance);
  };

  const scrollToQuote = (segmentId: string) => {
    setHighlightedSegmentId(segmentId);
    setActiveTab('transcript');
    setTimeout(() => {
      const el = document.getElementById(`seg-${segmentId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 3.0) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-surface-200 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Evidence-Verified Placement Assessment</span>
              </div>
              {report.candidateRole && report.candidateRole !== 'none' && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Role: {CANDIDATE_ROLES[report.candidateRole]?.title || report.candidateRole}</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
              &ldquo;{report.topic}&rdquo;
            </h1>
            <p className="text-sm font-semibold text-brand-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <span>{overallVerdict}</span>
            </p>
          </div>

          {/* Score Badge Card */}
          <div className="flex items-center space-x-4 bg-surface-100/90 border border-white/10 p-5 rounded-2xl shrink-0">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-brand-300 via-white to-brand-accent bg-clip-text text-transparent">
                {overallScore.toFixed(1)}
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Overall Score / 5.0
              </span>
            </div>

            <div className="h-10 w-px bg-white/10" />

            <button
              onClick={onRestart}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Practise Again</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 mt-8 pt-4 border-t border-white/5">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            6-Dimension Feedback & Quotes
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Instant Deterministic Stats
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'transcript'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Full Verifiable Transcript ({report.transcript.length} Turns)
          </button>
        </div>
      </div>

      {/* B4: BEFORE-AND-AFTER PROGRESS DELTA CARD */}
      {FEATURES.enableBeforeAfterProgress && (
        <div className="bg-surface-200/90 border border-white/10 rounded-3xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Progress vs Previous Session
              </h3>
            </div>
            <span className="text-[10px] text-slate-500">
              *Benchmark targets are general guidelines for placement training
            </span>
          </div>

          {deltas ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Talk Share Delta */}
              <div className="p-3 rounded-2xl bg-surface-100/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Talk Share</span>
                  <span className="text-sm font-black text-white">{stats.userTalkSharePct}%</span>
                </div>
                <div
                  className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                    deltas.talkShareDeltaPct >= 0
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {deltas.talkShareDeltaPct >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {deltas.talkShareDeltaPct > 0 ? '+' : ''}
                    {deltas.talkShareDeltaPct}%
                  </span>
                </div>
              </div>

              {/* Speaking Pace Delta */}
              <div className="p-3 rounded-2xl bg-surface-100/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Speaking Pace</span>
                  <span className="text-sm font-black text-white">{stats.speakingPaceWpm} WPM</span>
                </div>
                <div
                  className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                    Math.abs(stats.speakingPaceWpm - 135) <= Math.abs(stats.speakingPaceWpm - deltas.wpmDelta - 135)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {deltas.wpmDelta >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {deltas.wpmDelta > 0 ? '+' : ''}
                    {deltas.wpmDelta} WPM
                  </span>
                </div>
              </div>

              {/* Filler Words Delta */}
              <div className="p-3 rounded-2xl bg-surface-100/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Fillers / Min</span>
                  <span className="text-sm font-black text-white">{stats.fillerWordsPerMinute}</span>
                </div>
                <div
                  className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                    deltas.fillerPerMinDelta <= 0
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {deltas.fillerPerMinDelta <= 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  <span>
                    {deltas.fillerPerMinDelta > 0 ? '+' : ''}
                    {deltas.fillerPerMinDelta}/min
                  </span>
                </div>
              </div>

              {/* Score Delta */}
              <div className="p-3 rounded-2xl bg-surface-100/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Overall Score</span>
                  <span className="text-sm font-black text-white">{overallScore.toFixed(1)}</span>
                </div>
                <div
                  className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                    deltas.overallScoreDelta >= 0
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {deltas.overallScoreDelta >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {deltas.overallScoreDelta > 0 ? '+' : ''}
                    {deltas.overallScoreDelta.toFixed(1)} pts
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-surface-100/50 border border-white/5 text-xs text-slate-400 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <span>
                First session saved in your browser history! Complete another practice round to track your progression deltas.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Layer 1: Instant Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-surface-200 border border-white/5 text-center space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">Talk Share</span>
          <div className="text-xl font-black text-brand-300">{stats.userTalkSharePct}%</div>
          <span className="text-[10px] text-slate-500 block">Target: 20-30%</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-200 border border-white/5 text-center space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">Speaking Pace</span>
          <div className="text-xl font-black text-emerald-400">
            {stats.speakingPaceWpm} <span className="text-xs font-normal">WPM</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Ideal: 120-150 WPM</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-200 border border-white/5 text-center space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">First Entry</span>
          <div className="text-xl font-black text-cyan-400">{stats.timeToFirstContributionSeconds}s</div>
          <span className="text-[10px] text-slate-500 block">Lead in &lt; 45s</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-200 border border-white/5 text-center space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">Turns Taken</span>
          <div className="text-xl font-black text-purple-400">{stats.userTurnsCount}</div>
          <span className="text-[10px] text-slate-500 block">Avg {stats.userAvgTurnWords} words</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-200 border border-white/5 text-center space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">Peer References</span>
          <div className="text-xl font-black text-amber-400">{stats.referencesToOthersCount}</div>
          <span className="text-[10px] text-slate-500 block">Collaborative score</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-200 border border-white/5 text-center space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">Filler Words</span>
          <div
            className={`text-xl font-black ${
              stats.fillerWordsPerMinute > 3 ? 'text-rose-400' : 'text-slate-200'
            }`}
          >
            {stats.fillerWordsPerMinute} <span className="text-xs font-normal">/min</span>
          </div>
          <span className="text-[10px] text-slate-500 block">{stats.fillerWordsCount} total fillers</span>
        </div>
      </div>

      {/* TAB 1: 6-DIMENSION FEEDBACK & VERIFIED EVIDENCE */}
      {activeTab === 'feedback' && (
        <div className="space-y-8">
          {/* B2: STRUCTURE COACH FIRST SPEECH EVALUATION */}
          {FEATURES.enableStructureCoach && report.structureCheck && (
            <div
              className={`p-6 rounded-3xl border shadow-xl space-y-3 ${
                report.structureCheck.followedThreePillars
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-brand-950/30 border-brand-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white font-bold text-sm">
                  <Target className="w-5 h-5 text-brand-accent" />
                  <span>Structure Coach · Opening Speech Assessment</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    report.structureCheck.followedThreePillars
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {report.structureCheck.followedThreePillars ? 'Formula Followed' : 'Needs Structuring'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{report.structureCheck.feedback}</p>
              {report.structureCheck.evidenceQuote && (
                <div className="p-3 rounded-2xl bg-surface-100/80 border border-white/5 text-xs text-slate-300 italic">
                  &ldquo;{report.structureCheck.evidenceQuote}&rdquo;
                </div>
              )}
            </div>
          )}

          {/* Top 3 Actionable Takeaways */}
          {top3Actions.length > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-900/30 via-surface-200 to-brand-900/30 border border-brand-500/30 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-brand-300 font-bold text-sm">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span>Top 3 Placement Action Items for Next Discussion</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {top3Actions.map((act, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-surface-100/80 border border-white/5 text-xs text-slate-200 flex items-start space-x-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {i + 1}
                    </span>
                    <span className="leading-snug">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* B3: Missed Openings Replay with Audio Playback */}
          {missedOpenings.length > 0 && (
            <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Missed Openings &ldquo;What You Could Have Said&rdquo; Replay</span>
                </div>
                <span className="text-[10px] text-amber-400/80">Click &ldquo;Hear it&rdquo; to speak suggestion</span>
              </div>
              <div className="space-y-3">
                {missedOpenings.map((m, idx) => {
                  const isPlaying = playingMissedIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-surface-100/90 border border-amber-500/20 text-xs space-y-2.5"
                    >
                      <p className="text-slate-300 font-medium">{m.context}</p>
                      <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-200 font-medium italic border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="leading-relaxed">💡 &ldquo;{m.suggestion}&rdquo;</div>
                        {FEATURES.enableMissedOpeningsAudioReplay && (
                          <button
                            type="button"
                            onClick={() => handlePlayMissedOpening(m.suggestion, idx)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                              isPlaying
                                ? 'bg-amber-400 text-slate-950 shadow-md animate-pulse'
                                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                            }`}
                          >
                            {isPlaying ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5" />
                                <span>Stop Audio</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Hear it</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6 Dimensions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dimensions.map((dim) => {
              const scoreClass = getScoreColor(dim.score);
              return (
                <div
                  key={dim.name}
                  className="p-6 rounded-3xl bg-surface-200 border border-white/5 hover:border-brand-500/30 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-100">{dim.title}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${scoreClass}`}>
                        {dim.score} / 5.0
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{dim.summary}</p>

                    {/* Strengths */}
                    {dim.strengths?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                          Strengths Observed:
                        </span>
                        <ul className="space-y-1">
                          {dim.strengths.map((s, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-slate-300 flex items-start space-x-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {dim.improvements?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                          To Improve:
                        </span>
                        <ul className="space-y-1">
                          {dim.improvements.map((imp, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-slate-300 flex items-start space-x-1.5"
                            >
                              <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Evidence Quotes Chips */}
                  {dim.evidence && dim.evidence.length > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 flex items-center space-x-1">
                        <Quote className="w-3 h-3 text-brand-accent" />
                        <span>Verified Spoken Quote (Click to View):</span>
                      </span>
                      {dim.evidence.map((ev, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => scrollToQuote(ev.segmentId)}
                          className="w-full text-left p-2.5 rounded-xl bg-brand-950/40 hover:bg-brand-900/60 border border-brand-500/30 text-xs text-slate-200 transition-all group cursor-pointer"
                        >
                          <div className="italic text-brand-200 group-hover:text-white line-clamp-2">
                            &ldquo;{ev.quote}&rdquo;
                          </div>
                          {ev.note && (
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Note: {ev.note}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INSTANT STATS DETAILED BREAKDOWN */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Speaker Share Distribution */}
          <div className="bg-surface-200 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-brand-400" />
              <span>Room Talk Share Breakdown</span>
            </h3>

            <div className="space-y-3">
              {stats.speakersShare.map((spk) => (
                <div key={spk.speakerId} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={spk.speakerId === 'user' ? 'text-emerald-400' : 'text-slate-300'}>
                      {spk.speakerName} {spk.speakerId === 'user' ? '(You)' : ''}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {spk.percentage}% ({spk.seconds}s)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        spk.speakerId === 'user'
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-brand-600 to-brand-400'
                      }`}
                      style={{ width: `${Math.max(2, spk.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filler Word Distribution */}
          <div className="bg-surface-200 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Detected Filler Words & Crutch Phrases</span>
            </h3>
            {Object.keys(stats.fillerBreakdown).length === 0 ? (
              <p className="text-xs text-emerald-400">
                Excellent! Zero repetitive filler words were detected during your spoken turns.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.fillerBreakdown).map(([word, count]) => (
                  <span
                    key={word}
                    className="px-3 py-1.5 rounded-xl bg-surface-100 border border-white/10 text-xs text-slate-200 font-mono"
                  >
                    &ldquo;{word}&rdquo;: <strong className="text-amber-400">{count}x</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FULL TRANSCRIPT WITH QUOTE LOCATOR */}
      {activeTab === 'transcript' && (
        <div className="bg-surface-200 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-brand-400" />
              <span>Full Verifiable Discussion Transcript</span>
            </h3>
            <span className="text-xs text-slate-400">
              {report.transcript.length} recorded utterances
            </span>
          </div>

          <TranscriptViewer
            segments={report.transcript}
            highlightedSegmentId={highlightedSegmentId}
            onSegmentClick={(seg) => setHighlightedSegmentId(seg.id)}
          />
        </div>
      )}
    </div>
  );
};
