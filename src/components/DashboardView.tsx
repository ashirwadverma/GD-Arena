'use client';

import React from 'react';
import { SessionData, PersonaId } from '@/lib/types';
import { PERSONAS } from '@/lib/personas';
import {
  Award,
  TrendingUp,
  Clock,
  Mic,
  MessageSquare,
  Sparkles,
  Zap,
  Target,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  BarChart3,
  Flame,
  PieChart,
  Users,
} from 'lucide-react';

interface DashboardViewProps {
  sessions: SessionData[];
  onStartNewDiscussion: () => void;
  onViewSession: (session: SessionData) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  onStartNewDiscussion,
  onViewSession,
}) => {
  const totalSessions = sessions.length;

  // Aggregate Metrics
  const avgScore =
    totalSessions > 0
      ? Math.round(
          (sessions.reduce((acc, s) => acc + (s.report?.overallScore || 3.0), 0) / totalSessions) *
            10
        ) / 10
      : 0;

  const avgTalkShare =
    totalSessions > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + (s.stats?.userTalkSharePct || 20), 0) / totalSessions
        )
      : 0;

  const avgWpm =
    totalSessions > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + (s.stats?.speakingPaceWpm || 130), 0) / totalSessions
        )
      : 0;

  const avgFillers =
    totalSessions > 0
      ? Math.round(
          (sessions.reduce((acc, s) => acc + (s.stats?.fillerWordsPerMinute || 0), 0) /
            totalSessions) *
            10
        ) / 10
      : 0;

  const totalSpeakingMins =
    totalSessions > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + (s.stats?.userSpeakingSeconds || 0), 0) / 60
        )
      : 0;

  // Readiness Index: Derived from average scores and volume
  const readinessIndex = Math.min(
    100,
    Math.round(((avgScore / 5.0) * 0.7 + Math.min(totalSessions, 10) / 10 * 0.3) * 100)
  );

  // Recent Sessions (up to 5)
  const recentSessions = sessions.slice(0, 5);

  // Dimension Averages
  const dimensionKeys = [
    { key: 'starting_the_discussion', label: 'Starting & Initiative' },
    { key: 'quality_of_ideas', label: 'Idea Depth & Structure' },
    { key: 'building_on_others', label: 'Collaborative Building' },
    { key: 'listening_and_synthesis', label: 'Active Listening & Room Care' },
    { key: 'handling_interruptions', label: 'Composure & Floor Claiming' },
    { key: 'ending_strongly', label: 'Concluding Synthesis' },
  ];

  const dimensionScores: Record<string, number> = {};
  dimensionKeys.forEach(({ key }) => {
    let sum = 0;
    let count = 0;
    sessions.forEach((s) => {
      const dim = s.report?.dimensions.find((d) => d.name === key);
      if (dim) {
        sum += dim.score;
        count++;
      }
    });
    dimensionScores[key] = count > 0 ? Math.round((sum / count) * 10) / 10 : 3.5;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="bg-surface-200 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
            <span>Placement Readiness Intelligence Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Campus Placement & GD Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time telemetry tracking your speaking pace, floor-holding capability, collaboration metrics, and argument structuring across simulations.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={onStartNewDiscussion}
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent hover:from-brand-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-brand-500/30 flex items-center space-x-2 transition-all transform hover:scale-105 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Live GD Arena</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS BENTO GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Placement Readiness Index */}
        <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Placement Readiness
            </span>
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {totalSessions > 0 ? `${readinessIndex}%` : 'N/A'}
            </span>
            {totalSessions > 0 && (
              <span className="text-xs font-bold text-emerald-400">
                {readinessIndex >= 80 ? 'Tier-1 Ready' : 'In Training'}
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 via-brand-accent to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, readinessIndex)}%` }}
            />
          </div>
        </div>

        {/* Average GD Score */}
        <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Average Score
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-300">
              {totalSessions > 0 ? avgScore.toFixed(1) : '—'}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 5.0</span>
          </div>
          <p className="text-[10px] text-slate-400">Across {totalSessions} completed practice rounds</p>
        </div>

        {/* Average Talk Share */}
        <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg Talk Share
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-cyan-300">
              {totalSessions > 0 ? `${avgTalkShare}%` : '—'}
            </span>
            <span className="text-[10px] text-slate-400">Target: 20-30%</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {totalSpeakingMins} total minutes of spoken contributions
          </p>
        </div>

        {/* Speaking Pace & Fillers */}
        <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pace & Fillers
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-300">
              {totalSessions > 0 ? `${avgWpm}` : '—'}
            </span>
            <span className="text-xs font-bold text-slate-400">WPM</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {totalSessions > 0 ? `${avgFillers} filler words/min` : 'Clean speech tracking active'}
          </p>
        </div>
      </div>

      {/* DETAILED INSIGHTS: 6-DIMENSION RADAR & RECENT PROGRESSION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Dimension Placement Mastery */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-brand-500/20 text-brand-300">
                <Target className="w-4 h-4 text-brand-accent" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">6-Dimension Rubric Mastery</h3>
                <p className="text-xs text-slate-400">Based on verified campus placement evaluation standards</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">*General guidelines</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {dimensionKeys.map(({ key, label }) => {
              const score = dimensionScores[key] || 3.0;
              const pct = (score / 5.0) * 100;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">{label}</span>
                    <span className="font-mono font-bold text-brand-300">{score.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 via-brand-400 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Persona Confrontation Matrix */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-brand-300 font-bold text-sm">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>AI Panel Opponent Matrix</span>
            </div>
            <p className="text-xs text-slate-400">
              Practice facing varied conversational dynamics and assertive tactics.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-2xl bg-surface-100/80 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <span className="text-xl">⚡</span>
                <div>
                  <span className="font-bold text-slate-200">Arjun (Dominator)</span>
                  <p className="text-[10px] text-slate-400">Fast cut-ins & counter-arguments</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px]">
                High Pressure
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-100/80 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <span className="text-xl">📊</span>
                <div>
                  <span className="font-bold text-slate-200">Meera (Analytical)</span>
                  <p className="text-[10px] text-slate-400">Data evidence & metric probing</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                Fact Driven
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-100/80 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <span className="text-xl">🎙️</span>
                <div>
                  <span className="font-bold text-amber-300">Dr. Nair (Anchor)</span>
                  <p className="text-[10px] text-slate-400">Time-checks & neutral steer</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                Moderator
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onStartNewDiscussion}
              className="w-full py-2.5 rounded-xl bg-surface-100 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Customise Next Panel</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-brand-300" />
            </button>
          </div>
        </div>
      </div>

      {/* RECENT SESSIONS TABLE WIDGET */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white">Recent GD Simulations</h3>
          </div>
          <span className="text-xs text-slate-400">
            {recentSessions.length} of {totalSessions} total sessions
          </span>
        </div>

        {recentSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-3 px-3 font-semibold">Topic</th>
                  <th className="py-3 px-3 font-semibold">Date</th>
                  <th className="py-3 px-3 font-semibold">Score</th>
                  <th className="py-3 px-3 font-semibold">Talk Share</th>
                  <th className="py-3 px-3 font-semibold">Pace</th>
                  <th className="py-3 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 max-w-xs font-bold text-slate-200 truncate">
                      {session.topic}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(session.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-bold border ${
                          (session.report?.overallScore || 0) >= 4.0
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : (session.report?.overallScore || 0) >= 3.0
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {(session.report?.overallScore || 3.0).toFixed(1)} / 5.0
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-cyan-300 font-mono whitespace-nowrap">
                      {session.stats?.userTalkSharePct || 0}%
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 font-mono whitespace-nowrap">
                      {session.stats?.speakingPaceWpm || 0} WPM
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewSession(session)}
                        className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow cursor-pointer text-xs"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto text-slate-400">
              <Mic className="w-6 h-6 text-brand-300" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">No Practice Sessions Recorded Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Step into the arena to experience your first voice-first group discussion with autonomous AI panelists.
              </p>
            </div>
            <button
              type="button"
              onClick={onStartNewDiscussion}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              Start First GD Round
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
