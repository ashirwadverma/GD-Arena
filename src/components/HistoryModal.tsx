'use client';

import React, { useEffect, useState } from 'react';
import { getAllSessionsFromDb, deleteSessionFromDb } from '@/lib/db';
import { SessionData } from '@/lib/types';
import { X, Calendar, Clock, Award, Trash2, ArrowRight } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (session: SessionData) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectSession,
}) => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getAllSessionsFromDb();
      setSessions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteSessionFromDb(id);
    await loadHistory();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-surface-200 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Your GD Practice History</h3>
              <p className="text-xs text-slate-400">Past performance reports stored locally</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Loading past practice rooms...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm space-y-2">
              <p>No practice sessions completed yet.</p>
              <p className="text-xs text-slate-500">
                Complete a group discussion to get instant evidence-backed feedback!
              </p>
            </div>
          ) : (
            sessions.map((ses) => {
              const dateStr = new Date(ses.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              const score = ses.report?.overallScore || 'N/A';

              return (
                <div
                  key={ses.id}
                  onClick={() => onSelectSession(ses)}
                  className="p-4 rounded-2xl bg-surface-100/70 hover:bg-surface-50 border border-white/5 hover:border-brand-500/40 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-1">
                      {ses.topic}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{dateStr}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{Math.round(ses.durationSeconds / 60)} min</span>
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        {ses.panel.length} AI Panelists
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {ses.report && (
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-brand-300">
                          {score} <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 font-medium">Verified</div>
                      </div>
                    )}

                    <button
                      onClick={(e) => handleDelete(e, ses.id)}
                      className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="p-2 rounded-xl bg-white/5 text-slate-400 group-hover:text-brand-300 group-hover:bg-brand-500/20 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
