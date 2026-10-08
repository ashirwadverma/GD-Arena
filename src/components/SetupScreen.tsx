import React, { useState } from 'react';
import { CURATED_TOPICS, DEFAULT_TOPIC, TopicCategoryGroup, TopicItem } from '@/lib/topics';
import { PERSONAS, getPanelPersonas } from '@/lib/personas';
import { CandidateRole, DifficultyPreset, PersonaId } from '@/lib/types';
import { DIFFICULTY_PRESETS } from '@/lib/difficulties';
import { CANDIDATE_ROLES } from '@/lib/roles';
import { CASE_STUDIES } from '@/lib/case-studies';
import { FEATURES } from '@/config/features';
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
  UserCheck,
  Gauge,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

interface SetupScreenProps {
  onStartRoom: (config: {
    topic: string;
    panelSize: number;
    durationMinutes: number;
    patienceMs: number;
    useTypingMode: boolean;
    difficulty: DifficultyPreset;
    candidateRole: CandidateRole;
    caseStudyId?: string;
  }) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartRoom }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(DEFAULT_TOPIC.title);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [panelSize, setPanelSize] = useState<number>(4);
  const [durationMinutes, setDurationMinutes] = useState<number>(2);
  const [difficulty, setDifficulty] = useState<DifficultyPreset>('realistic');
  const [patienceMs, setPatienceMs] = useState<number>(DIFFICULTY_PRESETS.realistic.defaultPatienceMs);
  const [candidateRole, setCandidateRole] = useState<CandidateRole>('none');
  const [selectedCaseStudyId, setSelectedCaseStudyId] = useState<string | undefined>(undefined);
  const [useTypingMode, setUseTypingMode] = useState<boolean>(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [isCheckingTopic, setIsCheckingTopic] = useState<boolean>(false);

  const activeTopicString = isCustom ? customTopic : selectedTopic;
  const activePanel = getPanelPersonas(panelSize);

  const categories: string[] = ['All', ...CURATED_TOPICS.map((c: TopicCategoryGroup) => c.category)];
  const filteredTopics: TopicItem[] =
    selectedCategory === 'All'
      ? CURATED_TOPICS.flatMap((c: TopicCategoryGroup) => c.topics)
      : CURATED_TOPICS.find((c: TopicCategoryGroup) => c.category === selectedCategory)?.topics || [];

  const handleDifficultyChange = (newDiff: DifficultyPreset) => {
    setDifficulty(newDiff);
    setPatienceMs(DIFFICULTY_PRESETS[newDiff].defaultPatienceMs);
  };

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
      difficulty,
      candidateRole,
      caseStudyId: selectedCaseStudyId,
    });
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#080808] bg-grid-pattern py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Ambient Violet Glow Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-purple-900/25 via-indigo-950/20 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[400px] right-0 w-[500px] h-[350px] bg-[#c6f135]/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* HERO SECTION (MATCHING VIDEO FRAME 00:06 - 00:07) */}
        <div className="relative pt-6 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Headline, Rating, Subtitle, Video-style CTA */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Section Tag */}
              <div className="inline-flex items-center space-x-2">
                <span className="text-xl text-[#c6f135] font-black">✳</span>
                <span className="section-tag">[ AI GROUP DISCUSSION ARENA ]</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
                Turn Speaking Data Into{' '}
                <span className="text-[#c6f135] underline decoration-[#c6f135]/40 underline-offset-8">
                  Placement Action
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
                Empowering engineering and MBA graduates to make smarter, bolder speaking contributions through real-time multi-agent GD simulations.
              </p>

              {/* Rating & CTA Button Row */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
                  <span className="font-black text-white text-sm">4.9★</span>
                  <span className="text-[11px] text-slate-400">Trusted by top campus recruiters</span>
                </div>

                <button
                  type="button"
                  onClick={handleStart}
                  disabled={isCheckingTopic}
                  className="btn-video-pill cursor-pointer"
                >
                  <div className="btn-video-pill-icon">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <span>{isCheckingTopic ? 'Verifying...' : 'Start Practice Discussion'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Hero Visual Backdrop with Floating Metric Card & Tag Pills */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              {/* Purple/Violet Glow Backdrop */}
              <div className="relative w-full aspect-square max-w-[380px] rounded-3xl bg-gradient-to-b from-purple-950/60 via-indigo-950/40 to-[#080808] border border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#c6f135]/10 rounded-full blur-2xl pointer-events-none" />

                {/* Floating Metric Card (Matching Video "Energy Saved" Card) */}
                <div className="p-4 rounded-2xl bg-[#141419]/90 border border-white/15 backdrop-blur-xl space-y-2 shadow-xl animate-float">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#c6f135]" />
                      <span>Live Speech Telemetry</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#c6f135] animate-pulse" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-white font-mono">135 WPM</span>
                    <span className="text-[10px] text-[#c6f135] font-bold">Optimal Pace</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-[#c6f135] rounded-full" />
                  </div>
                </div>

                {/* Interactive Tag Chips Floating Around (Matching Video UI) */}
                <div className="flex flex-wrap gap-2 pt-4">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300">
                    ⚡ Instant Barge-In (&lt;150ms)
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#c6f135]/10 border border-[#c6f135]/30 text-[11px] font-semibold text-[#c6f135]">
                    🎯 0% Quote Hallucinations
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300">
                    📊 6-Dimension Placement Rubric
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Partner Ribbon (Matching Video Frame 00:07) */}
          <div className="pt-10 border-b border-white/5 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-6 text-slate-500 font-mono text-xs font-bold uppercase tracking-wider opacity-60">
              <span className="flex items-center space-x-1.5">
                <span className="text-white">◆</span>
                <span>CATALOG</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="text-white">■</span>
                <span>CLANDESTINE</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="text-white">▲</span>
                <span>CODECRAFT_</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="text-white">●</span>
                <span>ENNLABS</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="text-white">✦</span>
                <span>HEXSMITH</span>
              </span>
            </div>
          </div>
        </div>

        {/* MAIN BENTO CONFIGURATION HUB */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/10 backdrop-blur-2xl space-y-10">
          {/* BENTO ROW 1: TOPIC CATALOG */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="section-tag">[ 01 · TOPIC CATALOG ]</span>
                <h3 className="text-lg font-bold text-white">Select Placement GD Topic</h3>
              </div>

              {/* Mode Toggle: Curated vs Custom */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustom(!isCustom);
                    setModerationError(null);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#c6f135] border border-[#c6f135]/30 cursor-pointer transition-colors"
                >
                  {isCustom ? '← View Curated Topics' : '+ Enter Custom Topic'}
                </button>
              </div>
            </div>

            {/* Category Filter Pills (if not custom) */}
            {!isCustom && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {categories.map((cat: string) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#c6f135] text-black shadow-md shadow-[#c6f135]/25 font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
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
                {filteredTopics.map((t: TopicItem) => {
                  const isSelected = selectedTopic === t.title;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTopic(t.title)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-950/40 border-[#c6f135] shadow-xl shadow-[#c6f135]/15 ring-1 ring-[#c6f135]'
                          : 'glass-card-hover border-white/5 bg-surface-100/40'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-bold text-slate-100 leading-snug">{t.title}</h4>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#c6f135] text-black flex items-center justify-center shrink-0 ml-2 shadow-sm font-black text-xs">
                              ✓
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
                  className="w-full bg-surface-100 border border-white/10 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-[#c6f135] transition-colors"
                />
                <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c6f135]" />
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

          {/* BENTO ROW 2: AI PANEL MATRIX */}
          <div className="space-y-4 pt-6 border-t border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="section-tag">[ 02 · AI PANEL MATRIX ]</span>
                <h3 className="text-lg font-bold text-white">
                  Autonomous Panelists ({panelSize} Agents)
                </h3>
              </div>

              {/* Panel Size Tabs */}
              <div className="flex items-center space-x-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
                {[3, 4, 5].map((size) => {
                  const isSelected = panelSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setPanelSize(size)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#c6f135] text-black shadow-md shadow-[#c6f135]/30'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{size} Panelists</span>
                      {isSelected && <Check className="w-3 h-3 text-black font-black" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Persona Avatar Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
              {/* Dr. Nair */}
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
                className="glass-card p-4 rounded-2xl border border-white/10 hover:border-[#c6f135]/50 text-center space-y-1.5 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="text-3xl my-1">{PERSONAS.arjun.avatar}</div>
                <h5 className="text-xs font-bold text-slate-100">{PERSONAS.arjun.name}</h5>
                <p className="text-[10px] text-slate-400 line-clamp-1">{PERSONAS.arjun.role}</p>
              </div>

              {/* Meera */}
              <div
                onClick={() => setPanelSize(Math.max(3, panelSize))}
                className="glass-card p-4 rounded-2xl border border-white/10 hover:border-[#c6f135]/50 text-center space-y-1.5 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="text-3xl my-1">{PERSONAS.meera.avatar}</div>
                <h5 className="text-xs font-bold text-slate-100">{PERSONAS.meera.name}</h5>
                <p className="text-[10px] text-slate-400 line-clamp-1">{PERSONAS.meera.role}</p>
              </div>

              {/* Kabir */}
              <div
                onClick={() => setPanelSize(Math.max(3, panelSize))}
                className="glass-card p-4 rounded-2xl border border-white/10 hover:border-[#c6f135]/50 text-center space-y-1.5 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="text-3xl my-1">{PERSONAS.kabir.avatar}</div>
                <h5 className="text-xs font-bold text-slate-100">{PERSONAS.kabir.name}</h5>
                <p className="text-[10px] text-slate-400 line-clamp-1">{PERSONAS.kabir.role}</p>
              </div>

              {/* Sana */}
              <div
                onClick={() => setPanelSize(panelSize >= 4 ? 3 : 4)}
                className={`glass-card p-4 rounded-2xl border text-center space-y-1.5 cursor-pointer transition-all hover:scale-[1.02] ${
                  panelSize >= 4
                    ? 'border-[#c6f135]/60 bg-purple-950/30'
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

              {/* Rohan */}
              <div
                onClick={() => setPanelSize(panelSize >= 5 ? 4 : 5)}
                className={`glass-card p-4 rounded-2xl border text-center space-y-1.5 cursor-pointer transition-all hover:scale-[1.02] ${
                  panelSize >= 5
                    ? 'border-[#c6f135]/60 bg-purple-950/30'
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

          {/* BENTO ROW 3: DIFFICULTY PRESETS & ROLE ASSIGNMENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
            {/* Difficulty Presets */}
            {FEATURES.enableDifficultyPresets && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="section-tag">[ 03 · DIFFICULTY LEVEL ]</span>
                  <h3 className="text-sm font-bold text-white">Assertiveness & Turn Pacing</h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {(['friendly', 'realistic', 'tough', 'slow'] as DifficultyPreset[]).map((presetKey) => {
                    const preset = DIFFICULTY_PRESETS[presetKey];
                    const isSelected = difficulty === presetKey;
                    return (
                      <button
                        key={presetKey}
                        type="button"
                        onClick={() => handleDifficultyChange(presetKey)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-purple-950/60 border-[#c6f135] ring-1 ring-[#c6f135] shadow-lg shadow-[#c6f135]/15'
                            : 'glass-card border-white/5 hover:border-white/20 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#c6f135]' : 'text-slate-200'}`}>
                            {preset.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#c6f135]" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                          {preset.tagline}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Role Assignment */}
            {FEATURES.enableRoleAssignment && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="section-tag">[ 04 · ROLE ASSIGNMENT ]</span>
                  <h3 className="text-sm font-bold text-white">Candidate Strategy Role (Optional)</h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {(['none', 'first_speaker', 'contrarian', 'summarizer'] as CandidateRole[]).map((rKey) => {
                    const rConfig = CANDIDATE_ROLES[rKey];
                    const isSelected = candidateRole === rKey;
                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => setCandidateRole(rKey)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-purple-950/60 border-[#c6f135] ring-1 ring-[#c6f135] shadow-lg shadow-[#c6f135]/15'
                            : 'glass-card border-white/5 hover:border-white/20 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#c6f135]' : 'text-slate-200'}`}>
                            {rConfig.badge}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#c6f135]" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                          {rConfig.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Case Study Scenario Selector (if Case-based category is active) */}
          {FEATURES.enableCaseStudyMode && selectedCategory === 'Case-based' && (
            <div className="space-y-3 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <span className="section-tag">[ CASE STUDY DECISION ROOM ]</span>
                <h3 className="text-sm font-bold text-white">Debate Dilemma & Reach Consensus</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {CASE_STUDIES.map((cs) => {
                  const isSelected = selectedCaseStudyId === cs.id || selectedTopic.includes(cs.company);
                  return (
                    <div
                      key={cs.id}
                      onClick={() => {
                        setSelectedCaseStudyId(cs.id);
                        setSelectedTopic(`[Case Study: ${cs.company}] ${cs.title}`);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'bg-purple-950/60 border-[#c6f135] ring-1 ring-[#c6f135] shadow-lg shadow-[#c6f135]/15'
                          : 'glass-card border-white/5 hover:border-[#c6f135]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c6f135]/20 text-[#c6f135] font-bold">
                          {cs.company}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#c6f135]" />}
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{cs.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                        {cs.scenario}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BENTO ROW 4: INTERACTION MODE & DURATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
            {/* Input Mode */}
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="section-tag">[ 05 · INPUT MODE ]</span>
                <h3 className="text-sm font-bold text-white">Voice vs Keyboard</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUseTypingMode(false)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3.5 ${
                    !useTypingMode
                      ? 'bg-purple-950/60 border-[#c6f135] text-white ring-1 ring-[#c6f135] shadow-lg shadow-[#c6f135]/20'
                      : 'glass-card-hover border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${!useTypingMode ? 'bg-[#c6f135] text-black shadow-md' : 'bg-white/5 text-slate-400'}`}>
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
                      ? 'bg-purple-950/60 border-[#c6f135] text-white ring-1 ring-[#c6f135] shadow-lg shadow-[#c6f135]/20'
                      : 'glass-card-hover border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${useTypingMode ? 'bg-[#c6f135] text-black shadow-md' : 'bg-white/5 text-slate-400'}`}>
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">Typing Mode</div>
                    <div className="text-[10px] text-slate-400">Text Chat Fallback</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="section-tag">[ 06 · DURATION ]</span>
                <h3 className="text-sm font-bold text-white">Discussion Timer</h3>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { mins: 2, label: '2 min', tag: 'Demo' },
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
                        ? 'bg-[#c6f135] border-[#c6f135] text-black font-bold shadow-lg shadow-[#c6f135]/30'
                        : 'glass-card border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className={`text-[9px] uppercase tracking-wider font-mono mt-0.5 ${durationMinutes === item.mins ? 'text-black/80' : 'text-[#c6f135]'}`}>
                      {item.tag}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MASTER LAUNCH BUTTON (VIDEO SIGNATURE PILL STYLE) */}
          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={handleStart}
              disabled={isCheckingTopic}
              className="w-full py-5 rounded-full bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 border border-[#c6f135]/50 hover:border-[#c6f135] text-white font-black text-base md:text-lg shadow-2xl shadow-[#c6f135]/20 flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-[#c6f135] text-black flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                →
              </div>
              <span>{isCheckingTopic ? 'Verifying Topic...' : 'Enter Group Discussion Arena'}</span>
            </button>
          </div>
        </div>

        {/* 3 HIGHLIGHT METRICS (MATCHING VIDEO FRAME 00:09) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="section-tag">[ REAL-TIME ]</span>
              <div className="w-8 h-8 rounded-xl bg-[#c6f135]/20 text-[#c6f135] flex items-center justify-center">
                ⚡
              </div>
            </div>
            <h4 className="text-base font-bold text-white">&lt;150ms Instant Barge-In</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI panelists stop talking instantly when you speak, allowing natural conversational flow and real-time floor claiming.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="section-tag">[ VERIFIED ]</span>
              <div className="w-8 h-8 rounded-xl bg-[#c6f135]/20 text-[#c6f135] flex items-center justify-center">
                ✦
              </div>
            </div>
            <h4 className="text-base font-bold text-white">0% Quote Hallucination</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every score and critique links to verified literal quotes from your speech. Zero invented commentary in placement feedback.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="section-tag">[ EVALUATION ]</span>
              <div className="w-8 h-8 rounded-xl bg-[#c6f135]/20 text-[#c6f135] flex items-center justify-center">
                ★
              </div>
            </div>
            <h4 className="text-base font-bold text-white">6-Dimension Placement Rubric</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Objective assessment across topic initiation, idea depth, peer building, active listening, and final synthesis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
