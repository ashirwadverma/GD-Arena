'use client';

import React from 'react';
import { Volume2, Mic } from 'lucide-react';

interface LiveCaptionsProps {
  speakerName: string | null;
  text: string;
  isInterim?: boolean;
  isUser?: boolean;
}

export const LiveCaptions: React.FC<LiveCaptionsProps> = ({
  speakerName,
  text,
  isInterim = false,
  isUser = false,
}) => {
  if (!text && !speakerName) {
    return (
      <div className="w-full rounded-2xl bg-surface-100/70 border border-white/5 p-4 text-center text-xs text-slate-500 italic flex items-center justify-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />
        <span>Room is open. Speak anytime or wait for the next panelist...</span>
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-2xl p-4 transition-all duration-200 border backdrop-blur-md ${
        isUser
          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-100'
          : 'bg-surface-100/90 border-brand-500/30 text-slate-100'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
        <div className="flex items-center space-x-2">
          {isUser ? (
            <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
          ) : (
            <Volume2 className="w-4 h-4 text-brand-400 animate-pulse" />
          )}
          <span className={isUser ? 'text-emerald-400 font-bold' : 'text-brand-300 font-bold'}>
            {speakerName || (isUser ? 'You' : 'Speaking')}
          </span>
          {isInterim && (
            <span className="text-[10px] text-amber-400 font-normal italic">transcribing...</span>
          )}
        </div>
      </div>
      <p className="text-sm md:text-base leading-relaxed font-medium">
        {text}
        {isInterim && <span className="inline-block w-1.5 h-4 ml-1 bg-brand-400 animate-pulse" />}
      </p>
    </div>
  );
};
