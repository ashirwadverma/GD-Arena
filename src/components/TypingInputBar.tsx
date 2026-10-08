'use client';

import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

interface TypingInputBarProps {
  onSendText: (text: string) => void;
  disabled?: boolean;
}

export const TypingInputBar: React.FC<TypingInputBarProps> = ({ onSendText, disabled = false }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendText(input.trim());
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex items-center space-x-2 bg-surface-100/90 border border-white/10 rounded-2xl p-2 backdrop-blur-md focus-within:border-brand-500/50 transition-colors"
    >
      <div className="pl-2 text-slate-400">
        <MessageSquare className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={disabled ? 'Wait for your turn or barge in...' : 'Type your contribution (press Enter to speak)...'}
        disabled={disabled}
        className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none px-2"
      />
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all"
      >
        <span>Send</span>
        <Send className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};
