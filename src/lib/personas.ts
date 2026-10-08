import { Persona, PersonaId } from './types';

export const PERSONAS: Record<PersonaId, Persona> = {
  dr_nair: {
    id: 'dr_nair',
    name: 'Dr. Nair',
    role: 'Moderator',
    avatar: '👨‍🏫',
    avatarColor: 'from-amber-500 to-orange-600',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    specialty: 'Time Allocation & Neutral Facilitation',
    acousticHz: '115 - 165 Hz (Baritone)',
    voiceGender: 'male',
    pitch: 0.95,
    rate: 0.95,
    talkativeness: 0.2,
    tagline: 'Structured, neutral, time-aware anchor',
    personality:
      'Neutral, calm, structured, time-aware moderator. Redirects when discussions drift, ensures everyone gets a chance, announces time checks, and opens/closes the discussion formally.',
    openingLine:
      'Good day everyone and welcome to this group discussion. Our topic today is "{topic}". You have {duration_min} minutes. Please maintain decorum, build on points constructively, and be respectful. Who would like to initiate the discussion?',
    cannedLines: [
      'Let us keep our focus strictly on the core theme of the topic.',
      'Thank you for that perspective. Let us hear from someone who has not spoken yet.',
      'We are approaching the halfway mark. Let us explore the counter-arguments as well.',
      'One minute remaining, everyone. Let us begin concluding our thoughts.',
      'Thank you all for an engaging and insightful discussion. Time is up.',
    ],
  },
  arjun: {
    id: 'arjun',
    name: 'Arjun',
    role: 'The Dominator',
    avatar: '⚡',
    avatarColor: 'from-rose-500 to-red-600',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    specialty: 'High-Pace Early Agenda Setter',
    acousticHz: '130 - 190 Hz (Dynamic)',
    voiceGender: 'male',
    pitch: 0.9,
    rate: 1.1,
    talkativeness: 0.85,
    tagline: 'Fast, assertive, initiates boldly',
    personality:
      'Aggressive, assertive, high talkativeness, interrupts quickly, speaks with strong conviction and urgency. Loves to set the early agenda and challenge weak claims.',
    cannedLines: [
      'I completely disagree! If you look at the ground reality, speed of execution is what truly matters.',
      'Let me cut right to the chase here. The main bottleneck is not policy, it is implementation.',
      'Hold on, we cannot ignore the economic fallout of that approach.',
      'To build on that, if we do not act immediately, market competition will wipe out any first-mover advantage.',
    ],
  },
  meera: {
    id: 'meera',
    name: 'Meera',
    role: 'The Analyst',
    avatar: '📊',
    avatarColor: 'from-blue-500 to-indigo-600',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    specialty: 'Statistical Framing & Case Logic',
    acousticHz: '210 - 275 Hz (Clear Mezzo)',
    voiceGender: 'female',
    pitch: 1.1,
    rate: 1.0,
    talkativeness: 0.6,
    tagline: 'Structured, data-oriented, balanced',
    personality:
      'Structured, data-driven, analytical. Frames points into categories (e.g. short-term vs long-term, economic vs societal). Builds logically on previous speakers.',
    cannedLines: [
      'Looking at this systematically, we need to bifurcate the issue into infrastructural capacity versus adoption readiness.',
      'Arjun makes a valid observation, but statistical trends indicate consumer behavior is much more nuanced.',
      'If we quantify the ROI on this, the numbers suggest a hybrid framework yields the highest sustainable impact.',
      'Let us examine the evidence. Historically, similar transitions took at least five years to show measurable returns.',
    ],
  },
  kabir: {
    id: 'kabir',
    name: 'Kabir',
    role: 'The Quiet One',
    avatar: '🎯',
    avatarColor: 'from-emerald-500 to-teal-600',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    specialty: 'Ethical Nuance & Concise Synthesis',
    acousticHz: '105 - 150 Hz (Deep Bass)',
    voiceGender: 'male',
    pitch: 0.85,
    rate: 0.9,
    talkativeness: 0.25,
    tagline: 'Quiet, insightful, speaks when invited',
    personality:
      'Calm, observant, low talkativeness. Speaks rarely, but delivers sharp, high-impact synthesized points when addressed directly or after prolonged silence.',
    cannedLines: [
      'If I may add a concise point, both arguments miss the fundamental ethical question at stake here.',
      'Synthesizing what has been said, the true challenge is not technology, but human behavioral trust.',
      'I agree with the student here. Grassroots accessibility is where the real battle will be won.',
      'Let us simplify this: without regulatory safeguards, any rapid scaling carries systemic vulnerabilities.',
    ],
  },
  sana: {
    id: 'sana',
    name: 'Sana',
    role: 'The Drifter',
    avatar: '💡',
    avatarColor: 'from-purple-500 to-pink-600',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    specialty: 'Out-of-the-Box Analogies & Trends',
    acousticHz: '230 - 320 Hz (Bright Soprano)',
    voiceGender: 'female',
    pitch: 1.2,
    rate: 1.05,
    talkativeness: 0.55,
    tagline: 'Creative, tangent-prone, brings wildcards',
    personality:
      'Lively, anecdotal, creative. Tends to drift into creative tangents or pop culture/startup analogies before being gently re-anchored by the moderator.',
    cannedLines: [
      'This actually reminds me of what happened with global fintech apps during the pandemic surge!',
      'What if we look at this from a lifestyle and Gen-Z perception angle rather than pure corporate balance sheets?',
      'I was reading about how decentralized communities solved a similar dilemma using gamified incentives.',
      'Maybe an unconventional parallel here is how electric vehicles struggled before charging infrastructure became widespread.',
    ],
  },
  rohan: {
    id: 'rohan',
    name: 'Rohan',
    role: 'The Diplomat',
    avatar: '⚖️',
    avatarColor: 'from-cyan-500 to-blue-600',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    specialty: 'Consensus Building & Devil\'s Advocate',
    acousticHz: '120 - 175 Hz (Resonant)',
    voiceGender: 'male',
    pitch: 1.0,
    rate: 0.98,
    talkativeness: 0.5,
    tagline: 'Conciliatory, bridges opposing sides',
    personality:
      'Diplomatic, consensus builder, plays devil\'s advocate smoothly. Bridges opposing arguments between Arjun and Meera, asking probing questions.',
    cannedLines: [
      'I think Arjun and Meera are actually highlighting two sides of the same coin here.',
      'Can we find a middle ground where short-term agility does not compromise long-term compliance?',
      'Let me play devil\'s advocate for a second: what happens if our primary assumption about market stability fails?',
      'Building on the student\'s perspective, a phased rollout effectively mitigates both risk dimensions.',
    ],
  },
};


export function getPanelPersonas(panelSize: number): Persona[] {
  // Panel size 3: Arjun, Meera, Kabir
  // Panel size 4: Arjun, Meera, Kabir, Sana
  // Panel size 5: Arjun, Meera, Kabir, Sana, Rohan
  const base: PersonaId[] = ['arjun', 'meera', 'kabir'];
  if (panelSize >= 4) base.push('sana');
  if (panelSize >= 5) base.push('rohan');
  return base.map((id) => PERSONAS[id]);
}
