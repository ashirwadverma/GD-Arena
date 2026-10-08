'use client';

import React, { useState } from 'react';
import { CURATED_TOPICS, DEFAULT_TOPIC } from '@/lib/topics';
import { PERSONAS, getPanelPersonas } from '@/lib/personas';
import { PersonaId } from '@/lib/types';
import {
  Sparkles,
  Users,
  Clock,
  Sliders,
  ShieldCheck,
  ChevronRight,
  Check,
  Zap,
  Bot,
  Mic,
  Keyboard,
  Activity,
  Award,
  ArrowUpRight,
  TrendingUp,
  Volume2,
  Lock,
} from 'lucide-react';

interface SetupScreenProps {
  onStartRoom: (config: {
    topic: string;
    panelSize: number;
    durationMinutes: number;
    patienceMs: number;
    useTypingMode: boolean;
  }) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartRoom }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(DEFAULT_TOPIC.title);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [panelSize, setPanelSize] = useState<number>(4);
  const [durationMinutes, setDurationMinutes] = useState<number>(2);
  const [patienceMs, setPatienceMs] = useState<number>(1200);
  const [useTypingMode, setUseTypingMode] = useState<boolean>(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [isCheckingTopic, setIsCheckingTopic] = useState<boolean>(false);

  const activeTopicString = isCustom ? customTopic : selectedTopic;
  const activePanel = getPanelPersonas(panelSize);

  const categories = ['All', ...CURATED_TOPICS.map((c) => c.category)];
  const filteredTopics =
    selectedCategory === 'All'
      ? CURATED_TOPICS.flatMap((c) => c.topics)
      : CURATED_TOPICS.find((c) => c.category === selectedCategory)?.topics || [];

  const handleStart = async () => {
    if (!activeTopicString.trim()) {
      setModerationError('Please select or type a discussion topic.');
      return;
    }

    if (isCustom) {
      setIsCheckingTopic(true);
      setModerationError(null);
      try {
        const res = await fetch('/api/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: customTopic }),
        });
        const data = await res.json();
        if (!data.allowed) {
          setModerationError(data.reason || 'This topic is flagged. Please refine it.');
          setIsCheckingTopic(false);
          return;
        }
      } catch (err) {}
      setIsCheckingTopic(false);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {}
    }

    onStartRoom({
      topic: activeTopicString,
      panelSize,
      durationMinutes,
      patienceMs,
      useTypingMode,
    });
  };

  return (
    <div className="relative w-full overflow-hidden bg-grid-pattern bg-radial-glow py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-80 right-10 w-[450px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* HERO SECTION */}
        <div className="text-center space-y-5 max-w-4xl mx-auto pt-4">
          {/* Floating Pill Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-pill border border-brand-400/30 text-brand-300 text-xs font-semibold shadow-lg shadow-brand-500/10 animate-float">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
            <span>Next-Gen Placement Simulator · Multi-Agent Spoken GD</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
            <span className="text-slate-300 font-normal">LLOYD Hackathon PS2</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
            Experience Real Spoken GDs with{' '}
            <span className="bg-gradient-to-r from-brand-300 via-brand-accent to-cyan-200 bg-clip-text text-transparent">
              Autonomous AI Agents
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Step into a high-pressure placement group discussion with 3 to 5 distinct AI personalities and an authoritative moderator. Receive verifiable evidence-backed feedback linking to your exact spoken words.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-semibold text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>&lt;150ms Instant Barge-In</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              <span>0% Hallucination Quote Guard</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>6-Dimension Placement Rubric</span>
            </div>
          </div>
        </div>

        {/* MAIN BENTO CONFIGURATION HUB */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/10 backdrop-blur-2xl space-y-10">
          {/* BENTO ROW 1: TOPIC CATALOG & CUSTOM PROMPT */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-accent flex items-center justify-center text-white text-xs font-bold shadow-md shadow-brand-500/20">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Select Placement GD Topic</h3>
                  <p className="text-xs text-slate-400">Curated high-frequency campus placement themes</p>
                </div>
              </div>

              {/* Mode Toggle: Curated vs Custom */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustom(!isCustom);
                    setModerationError(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl glass-pill hover:bg-white/10 text-xs font-semibold text-brand-300 hover:text-white transition-all border border-brand-500/30 cursor-pointer"
                >
                  {isCustom ? '← View Curated Topics' : '+ Enter Custom Topic'}
                </button>
              </div>
            </div>

            {/* Category Filter Pills (if not custom) */}
            {!isCustom && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                        : 'glass-pill text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Topic Grid or Custom Input Box */}
            {!isCustom ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {filteredTopics.map((t) => {
                  const isSelected = selectedTopic === t.title;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTopic(t.title)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-brand-950/50 border-brand-400 shadow-xl shadow-brand-500/20 ring-1 ring-brand-400'
                          : 'glass-card-hover border-white/5 bg-surface-100/40'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-bold text-slate-100 leading-snug">{t.title}</h4>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0 ml-2 shadow-sm">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{t.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <textarea
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Is Artificial General Intelligence an existential risk or a driver of human abundance?"
                  rows={3}
                  className="w-full glass-card border border-white/10 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500/60 transition-colors"
                />
                <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Custom topics are vetted for safety before starting the arena.</span>
                </p>
              </div>
            )}

            {moderationError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {moderationError}
              </div>
            )}
          </div>

          {/* BENTO ROW 2: AI PANEL MATRIX & PERSONAS */}
          <div className="space-y-4 pt-6 border-t border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-accent flex items-center justify-center text-white text-xs font-bold shadow-md shadow-brand-500/20">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Panel Matrix ({panelSize} Autonomous Panelists)</h3>
                  <p className="text-xs text-slate-400">Click panel sizes or persona cards directly to configure the panel</p>
                </div>
              </div>

              {/* Panel Size Tabs */}
              <div className="flex items-center space-x-1.5 glass-pill p-1 rounded-2xl border border-white/10">
                {[3, 4, 5].map((size) => {
                  const isSelected = panelSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setPanelSize(size)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/30 ring-1 ring-brand-400'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{size} Panelists</span>
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Persona Avatar Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
              {/* Dr. Nair (Moderator) */}
              <div className="glass-card p-4 rounded-2xl border border-amber-500/40 text-center space-y-1.5 shadow-lg shadow-amber-500/5 relative">
                <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  Anchor
                </span>
                <div className="text-3xl my-1">{PERSONAS.dr_nair.avatar}</div>
                <h5 className="text-xs font-bold text-amber-300">{PERSONAS.dr_nair.name}</h5>
                <p className="text-[10px] text-slate-400 line-clamp-1">{PERSONAS.dr_nair.role}</p>
              </div>

              {/* Arjun */}
              <div
                onClick={() => setPanelSize(Math.max(3, panelSize))}
                className="glass-card p-4 rounded-2xl border border-white/10 hover:border-brand-400/50 text-center space-y-1.5 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="text-3xl my-1">{PERSONAS.arjun.avatar}</div>
                <h5 className="text-xs font-bold text-slate-100">{PERSONAS.arjun.name}</h5>
                <p className="text-[10px] text-slate-400 line-clamp-1">{PERSONAS.arjun.role}</p>
              </div>

              {/* Meera */}
              <div
                onClick={() => setPanelSize(Math.max(3, panelSize))}
                className="glass-card p-4 rounded-2xl border border-white/10 hover:border-brand-400/50 text-center space-y-1.5 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="text-3xl my-1">{PERSONAS.meera.avatar}</div>
                <h5 className="text-xs font-bold text-slate-100">{PERSONAS.meera.name}</h5>
                <p className="text-[10px] text-slate-400 line-clamp-1">{PERSONAS.meera.role}</p>
              </div>

              {/* Kabir */}
              <div
                onClick={() => setPanelSize(Math.max(3, panelSize))}
                className="glass-card p-4 rounded-2xl border border-white/10 hover:border-brand-400/50 text-center space-y-1.5 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="text-3xl my-1">{PERSONAS.kabir.avatar}</div>
                <h5 className="text-xs font-bold text-slate-100">{PERSONAS.kabir.name}</h5>
                <p className="text-[10px] text-slate-400 line-clamp-1">{PERSONAS.kabir.role}</p>
              </div>

              {/* Sana (Active if panelSize >= 4) */}
              <div
                onClick={() => setPanelSize(panelSize >= 4 ? 3 : 4)}
                className={`glass-card p-4 rounded-2xl border text-center space-y-1.5 cursor-pointer transition-all hover:scale-[1.02] ${
                  panelSize >= 4
                    ? 'border-brand-400/60 bg-brand-950/30'
                    : 'border-dashed border-white/10 opacity-40 hover:opacity-80'
                }`}
                title="Click to toggle Sana"
              >
                <div className="text-3xl my-1">{PERSONAS.sana.avatar}</div>
                <h5 className="text-xs font-bold text-slate-100">{PERSONAS.sana.name}</h5>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {panelSize >= 4 ? PERSONAS.sana.role : '+ Add to Panel'}
                </p>
              </div>

              {/* Rohan (Active if panelSize >= 5) */}
              <div
                onClick={() => setPanelSize(panelSize >= 5 ? 4 : 5)}
                className={`glass-card p-4 rounded-2xl border text-center space-y-1.5 cursor-pointer transition-all hover:scale-[1.02] ${
                  panelSize >= 5
                    ? 'border-brand-400/60 bg-brand-950/30'
                    : 'border-dashed border-white/10 opacity-40 hover:opacity-80'
                }`}
                title="Click to toggle Rohan"
              >
                <div className="text-3xl my-1">{PERSONAS.rohan.avatar}</div>
                <h5 className="text-xs font-bold text-slate-100">{PERSONAS.rohan.name}</h5>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {panelSize >= 5 ? PERSONAS.rohan.role : '+ Add to Panel'}
                </p>
              </div>
            </div>
          </div>

          {/* BENTO ROW 3: INTERACTION MODE & SESSION CONTROLS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
            {/* Input Mode Switcher */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-accent flex items-center justify-center text-white text-xs font-bold shadow-md shadow-brand-500/20">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Interaction Mode</h3>
                  <p className="text-xs text-slate-400">Choose voice or keyboard input</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUseTypingMode(false)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3.5 ${
                    !useTypingMode
                      ? 'bg-emerald-950/50 border-emerald-400 text-white ring-1 ring-emerald-400 shadow-xl shadow-emerald-500/20'
                      : 'glass-card-hover border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${!useTypingMode ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/5 text-slate-400'}`}>
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">Spoken Voice</div>
                    <div className="text-[10px] text-slate-400">Microphone + Live STT</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUseTypingMode(true)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3.5 ${
                    useTypingMode
                      ? 'bg-brand-950/50 border-brand-400 text-white ring-1 ring-brand-400 shadow-xl shadow-brand-500/20'
                      : 'glass-card-hover border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${useTypingMode ? 'bg-brand-500 text-white shadow-md' : 'bg-white/5 text-slate-400'}`}>
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">Typing Mode</div>
                    <div className="text-[10px] text-slate-400">Text Chat Fallback</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Session Duration */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-accent flex items-center justify-center text-white text-xs font-bold shadow-md shadow-brand-500/20">
                  4
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Session Duration</h3>
                  <p className="text-xs text-slate-400">From quick demo to full-length round</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { mins: 2, label: '2 min', tag: 'Judge Demo' },
                  { mins: 5, label: '5 min', tag: 'Fast' },
                  { mins: 8, label: '8 min', tag: 'Standard' },
                  { mins: 10, label: '10 min', tag: 'Deep' },
                ].map((item) => (
                  <button
                    key={item.mins}
                    type="button"
                    onClick={() => setDurationMinutes(item.mins)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      durationMinutes === item.mins
                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 border-brand-400 text-white ring-1 ring-brand-400 shadow-lg shadow-brand-500/30'
                        : 'glass-card border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className="text-[9px] uppercase tracking-wider text-brand-200 mt-0.5 font-mono">
                      {item.tag}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BENTO ROW 4: AI PATIENCE SLIDER */}
          <div className="space-y-3 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-brand-accent" />
                <span>AI Turn Patience Delay</span>
              </label>
              <span className="text-xs font-mono font-bold text-brand-300 glass-pill px-3 py-1 rounded-xl border border-white/10">
                {(patienceMs / 1000).toFixed(1)}s Pause Threshold
              </span>
            </div>
            <input
              type="range"
              min={600}
              max={2500}
              step={100}
              value={patienceMs}
              onChange={(e) => setPatienceMs(Number(e.target.value))}
              className="w-full accent-brand-500 h-2.5 bg-surface-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Fast-Paced Competition (0.6s)</span>
              <span>Standard Placement Prep (1.2s default)</span>
              <span>Patient & Forgiving (2.5s)</span>
            </div>
          </div>

          {/* MASTER LAUNCH BUTTON */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStart}
              disabled={isCheckingTopic}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent hover:from-brand-500 hover:to-cyan-400 text-white font-black text-base md:text-lg shadow-2xl shadow-brand-500/40 flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer animate-shimmer"
            >
              <span>{isCheckingTopic ? 'Verifying Topic...' : 'Enter Group Discussion Arena'}</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* NICTIO-STYLE FEATURE HIGHLIGHTS BENTO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-500/30">
              <Zap className="w-5 h-5 text-brand-accent" />
            </div>
            <h4 className="text-base font-bold text-white">Natural Turn-Taking Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-factor bidding algorithm calculates urge scores based on talkativeness, peer references, and dead-air fillers.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white">Evidence-Backed Feedback</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every score and critique links to verified literal quotes from your speech. Zero hallucinated commentary.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <h4 className="text-base font-bold text-white">Instant Barge-In Interruption</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI panelists stop talking within 150ms when you speak, allowing natural conversational flow and real-time floor claiming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
