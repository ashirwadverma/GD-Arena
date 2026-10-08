import { CandidateRole, RoleConfig } from './types';

export const CANDIDATE_ROLES: Record<CandidateRole, RoleConfig> = {
  none: {
    id: 'none',
    title: 'Free Participant',
    badge: '🎓 Candidate',
    description: 'Participate freely without specific role constraints.',
    strategyTip: 'Contribute naturally, build on peers, and share your perspective.',
  },
  first_speaker: {
    id: 'first_speaker',
    title: 'Opening Anchor (First Speaker)',
    badge: '🚀 First Speaker',
    description: 'Must initiate the discussion immediately after the moderator finishes the opening statement.',
    strategyTip: 'Define the topic scope and preview 2-3 pillars within the first 30 seconds.',
  },
  contrarian: {
    id: 'contrarian',
    title: 'Contrarian (Devil\'s Advocate)',
    badge: '⚔️ Contrarian',
    description: 'Must challenge consensus points politely with counter-evidence or alternative perspectives.',
    strategyTip: 'Use phrasing like "While that point has merit, consider what happens if we look at the unintended consequences..."',
  },
  summarizer: {
    id: 'summarizer',
    title: 'Synthesizer & Closing Summarizer',
    badge: '🎯 Summarizer',
    description: 'Must synthesize opposing viewpoints midway and deliver a comprehensive closing synthesis.',
    strategyTip: 'Acknowledge both sides by name and formulate a balanced 3-step action roadmap.',
  },
};
