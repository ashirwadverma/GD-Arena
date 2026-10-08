'use client';

import React from 'react';
import { Segment, PersonaId } from '@/lib/types';
import { PERSONAS } from '@/lib/personas';
import { MessageSquare, AlertCircle } from 'lucide-react';

interface TranscriptViewerProps {
  segments: Segment[];
  highlightedSegmentId?: string | null;
  onSegmentClick?: (segment: Segment) => void;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  segments,
  highlightedSegmentId,
  onSegmentClick,
}) => {
  if (segments.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-slate-500 italic">
        No utterances recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {segments.map((seg) => {
        const isUser = seg.speakerId === 'user';
        const persona = !isUser ? PERSONAS[seg.speakerId as PersonaId] : null;
        const isHighlighted = highlightedSegmentId === seg.id;

        return (
          <div
            key={seg.id}
            id={`seg-${seg.id}`}
            onClick={() => onSegmentClick?.(seg)}
            className={`p-3.5 rounded-2xl border transition-all duration-300 ${
              isHighlighted
                ? 'bg-brand-500/20 border-brand-400 shadow-lg shadow-brand-500/20 ring-2 ring-brand-400'
                : isUser
                ? 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40'
                : 'bg-surface-100/60 border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-base">{isUser ? '🎓' : persona?.avatar || '🤖'}</span>
                <span
                  className={`font-bold ${
                    isUser ? 'text-emerald-400' : 'text-slate-200'
                  }`}
                >
                  {seg.speakerName}
                </span>
                {isUser ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                    Candidate
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 font-mono">
                    {persona?.role || 'AI Panelist'}
                  </span>
                )}
              </div>

              {seg.interrupted && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                  <AlertCircle className="w-2.5 h-2.5" />
                  <span>Interrupted</span>
                </span>
              )}
            </div>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed pl-6">
              &ldquo;{seg.text}&rdquo;
            </p>
          </div>
        );
      })}
    </div>
  );
};
