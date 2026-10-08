'use client';

import React, { useState, useMemo } from 'react';
import { SessionData, PersonaId } from '@/lib/types';
import { PERSONAS } from '@/lib/personas';
import {
  Table,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Mic,
  Award,
  Sparkles,
  PieChart,
  Volume2,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import { CANDIDATE_ROLES } from '@/lib/roles';

interface SessionsTableViewProps {
  sessions: SessionData[];
  onViewSession: (session: SessionData) => void;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onStartNewDiscussion: () => void;
}

export const SessionsTableView: React.FC<SessionsTableViewProps> = ({
  sessions,
  onViewSession,
  onDeleteSession,
  onStartNewDiscussion,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'score-desc' | 'score-asc' | 'talkshare-desc'>('date-desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredAndSortedSessions = useMemo(() => {
    let list = [...sessions];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.topic.toLowerCase().includes(q) ||
          s.report?.overallVerdict?.toLowerCase().includes(q) ||
          (s.candidateRole && s.candidateRole.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Case-based') {
        list = list.filter((s) => s.caseStudyId || s.topic.toLowerCase().includes('case study'));
      } else if (selectedCategory === 'Custom') {
        list = list.filter((s) => !s.topic.startsWith('[') && !s.caseStudyId);
      }
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'score-desc') {
        return (b.report?.overallScore || 0) - (a.report?.overallScore || 0);
      }
      if (sortBy === 'score-asc') {
        return (a.report?.overallScore || 0) - (b.report?.overallScore || 0);
      }
      if (sortBy === 'talkshare-desc') {
        return (b.stats?.userTalkSharePct || 0) - (a.stats?.userTalkSharePct || 0);
      }
      return 0;
    });

    return list;
  }, [sessions, searchTerm, selectedCategory, sortBy]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this recorded session?')) {
      setDeletingId(id);
      await onDeleteSession(id);
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Sessions Navigation Table</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono font-bold">
              {filteredAndSortedSessions.length} records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete verifiable archive of all multi-agent practice rounds, statistics, and placement scores.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartNewDiscussion}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>New Discussion Round</span>
        </button>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by topic, verdict keyword, or role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-100 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-100 border border-white/10 text-xs text-slate-300 outline-none cursor-pointer"
          >
            <option value="All">All Formats</option>
            <option value="Case-based">Case Studies</option>
            <option value="Custom">Standard Topics</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-surface-100 border border-white/10 text-xs text-slate-300 outline-none cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="score-desc">Highest Score</option>
            <option value="score-asc">Lowest Score</option>
            <option value="talkshare-desc">Highest Talk Share</option>
          </select>
        </div>
      </div>

      {/* SESSIONS DATA TABLE */}
      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        {filteredAndSortedSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-surface-100/60 text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Discussion Topic & Format</th>
                  <th className="py-3.5 px-3 font-semibold">Date & Time</th>
                  <th className="py-3.5 px-3 font-semibold">Panel</th>
                  <th className="py-3.5 px-3 font-semibold">Score / 5.0</th>
                  <th className="py-3.5 px-3 font-semibold">Talk Share</th>
                  <th className="py-3.5 px-3 font-semibold">Speaking Pace</th>
                  <th className="py-3.5 px-3 font-semibold">Fillers</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAndSortedSessions.map((session) => {
                  const score = session.report?.overallScore || 3.0;
                  const isHigh = score >= 4.0;
                  const isMid = score >= 3.0 && score < 4.0;
                  const roleConfig = session.candidateRole ? CANDIDATE_ROLES[session.candidateRole] : null;

                  return (
                    <tr
                      key={session.id}
                      onClick={() => onViewSession(session)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      {/* Topic & Role */}
                      <td className="py-4 px-4 max-w-sm space-y-1">
                        <div className="font-bold text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-1">
                          {session.topic}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {session.caseStudyId && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                              Case Study
                            </span>
                          )}
                          {roleConfig && roleConfig.id !== 'none' && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
                              {roleConfig.title}
                            </span>
                          )}
                          {session.difficulty && (
                            <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-[10px] font-mono capitalize">
                              {session.difficulty}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-3 text-slate-400 whitespace-nowrap">
                        <div className="text-slate-300 font-medium">
                          {new Date(session.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(session.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Panel Avatars */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex items-center -space-x-1.5">
                          {session.panel.map((pId) => {
                            const p = PERSONAS[pId];
                            return (
                              <span
                                key={pId}
                                className="w-6 h-6 rounded-full bg-surface-100 border border-white/20 flex items-center justify-center text-xs shadow"
                                title={p?.name}
                              >
                                {p?.avatar || '🤖'}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                            isHigh
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : isMid
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {score.toFixed(1)} / 5.0
                        </span>
                      </td>

                      {/* Talk Share */}
                      <td className="py-4 px-3 font-mono text-cyan-300 whitespace-nowrap">
                        {session.stats?.userTalkSharePct || 0}%
                      </td>

                      {/* Pace */}
                      <td className="py-4 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {session.stats?.speakingPaceWpm || 0} WPM
                      </td>

                      {/* Fillers */}
                      <td className="py-4 px-3 font-mono whitespace-nowrap">
                        <span
                          className={
                            (session.stats?.fillerWordsPerMinute || 0) > 3
                              ? 'text-rose-400'
                              : 'text-slate-300'
                          }
                        >
                          {session.stats?.fillerWordsPerMinute || 0} /min
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap space-x-1">
                        <button
                          type="button"
                          onClick={() => onViewSession(session)}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow cursor-pointer text-xs inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Report</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, session.id)}
                          disabled={deletingId === session.id}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer inline-flex items-center"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto text-slate-400">
              <Table className="w-6 h-6 text-brand-300" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">No Sessions Match Your Filters</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try refining your search keyword or clearing the format filters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/10 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
