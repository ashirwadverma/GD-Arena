export type PersonaId = 'dr_nair' | 'arjun' | 'meera' | 'kabir' | 'sana' | 'rohan';

export interface Persona {
  id: PersonaId;
  name: string;
  role: string;
  avatar: string;
  avatarColor: string;
  voiceGender: 'male' | 'female';
  pitch: number;
  rate: number;
  talkativeness: number; // 0.0 - 1.0
  personality: string;
  openingLine?: string;
  tagline: string;
  cannedLines: string[];
}

export type DiscussionPhase = 'PREP' | 'OPENING' | 'DISCUSSION' | 'CLOSING_ROUND' | 'ENDED';

export type FloorState =
  | 'SETUP'
  | 'MIC_CHECK'
  | 'PREP'
  | 'MODERATOR_OPENING'
  | 'LIVE_IDLE'
  | 'STUDENT_SPEAKING'
  | 'AI_THINKING'
  | 'AI_SPEAKING'
  | 'CLOSING_ROUND'
  | 'ENDED'
  | 'DEGRADED';

export type TurnIntent =
  | 'opening'
  | 'agree_and_extend'
  | 'challenge'
  | 'ask_question'
  | 'bring_example'
  | 'redirect'
  | 'summarise'
  | 'drift'
  | 'invite_student'
  | 'time_check'
  | 'closing_statement';

export interface Segment {
  id: string;
  speakerId: PersonaId | 'user';
  speakerName: string;
  startMs: number;
  endMs: number;
  text: string;
  interrupted?: boolean;
  wordsSpoken?: number;
  phase?: DiscussionPhase;
}

export interface BiddingCandidate {
  personaId: PersonaId;
  score: number;
  breakdown: {
    talkativeness: number;
    addressedByNameTerm: number;
    silenceTerm: number;
    lastTurnPenalty: number;
    recentTurnPenalty: number;
    jitter: number;
  };
}

export interface EvidenceItem {
  segmentId: string;
  quote: string;
  note: string;
  verified?: boolean;
}

export interface DimensionFeedback {
  name:
    | 'starting_the_discussion'
    | 'quality_of_ideas'
    | 'building_on_others'
    | 'listening_and_synthesis'
    | 'handling_interruptions'
    | 'ending_strongly';
  title: string;
  score: number; // 1 to 5
  summary: string;
  strengths: string[];
  improvements: string[];
  evidence: EvidenceItem[];
}

export interface MissedOpening {
  afterSegmentId: string;
  context: string;
  suggestion: string;
}

export interface SessionStats {
  totalDurationSeconds: number;
  userTalkSharePct: number;
  userSpeakingSeconds: number;
  userTurnsCount: number;
  userAvgTurnWords: number;
  speakingPaceWpm: number;
  timeToFirstContributionSeconds: number;
  longestSilenceSeconds: number;
  studentInterruptedAiCount: number;
  aiInterruptedStudentCount: number;
  fillerWordsCount: number;
  fillerWordsPerMinute: number;
  fillerBreakdown: Record<string, number>;
  questionsAskedCount: number;
  referencesToOthersCount: number;
  speakersShare: {
    speakerId: string;
    speakerName: string;
    seconds: number;
    percentage: number;
  }[];
}

export interface FeedbackReport {
  id: string;
  sessionId: string;
  topic: string;
  createdAt: string;
  stats: SessionStats;
  overallScore: number;
  overallVerdict: string;
  dimensions: DimensionFeedback[];
  missedOpenings: MissedOpening[];
  top3Actions: string[];
  transcript: Segment[];
}

export interface SessionData {
  id: string;
  createdAt: string;
  topic: string;
  panelSize: number;
  panel: PersonaId[];
  durationSeconds: number;
  patienceMs: number;
  typingMode: boolean;
  segments: Segment[];
  stats?: SessionStats;
  report?: FeedbackReport;
}
