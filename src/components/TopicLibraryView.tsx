'use client';

import React, { useState } from 'react';
import { TOPIC_CATEGORIES, TopicItem } from '@/lib/topics';
import { CASE_STUDIES } from '@/lib/case-studies';
import {
  BookOpen,
  Search,
  Sparkles,
  Play,
  Briefcase,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface TopicLibraryViewProps {
  onSelectTopicToPractice: (topic: string, caseStudyId?: string) => void;
}

export const TopicLibraryView: React.FC<TopicLibraryViewProps> = ({ onSelectTopicToPractice }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = ['All', 'Current affairs', 'Abstract', 'Opinion', 'Case-based'];

  const allTopics: TopicItem[] = TOPIC_CATEGORIES.flatMap((c) => c.topics);

  const filteredTopics = allTopics.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      !searchTerm.trim() ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-surface-200 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-brand-accent" />
          <span>Curated Placement & Case Study Repository</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          GD Topic & Strategic Case Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Explore high-frequency placement themes across technology disruption, macroeconomics, ethical dilemmas, abstract reasoning, and business decision cases.
        </p>
      </div>

      {/* FILTER & SEARCH */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search topics by keyword, company, or concept..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-100 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                  : 'glass-pill text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TOPICS & CASES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map((topic) => {
          const isCase = topic.category === 'Case-based';
          return (
            <div
              key={topic.id}
              className="glass-card p-6 rounded-3xl border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isCase
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : topic.category === 'Current affairs'
                        ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
                        : topic.category === 'Abstract'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {topic.category}
                  </span>
                  {isCase && (
                    <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                      <Briefcase className="w-3 h-3 text-amber-400" />
                      <span>Decision Room</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors leading-snug">
                  {topic.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">{topic.description}</p>

                {/* Starter Points Preview */}
                {topic.starterPoints?.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Key Discussion Pillars:
                    </span>
                    <ul className="space-y-1">
                      {topic.starterPoints.slice(0, 2).map((pt, i) => (
                        <li key={i} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                          <span className="text-brand-400 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Tier-1 Campus Tested</span>
                <button
                  type="button"
                  onClick={() => onSelectTopicToPractice(topic.title, topic.caseStudyId)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <span>Practice Topic</span>
                  <Play className="w-3 h-3 fill-white" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
