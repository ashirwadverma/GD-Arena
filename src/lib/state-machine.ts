import {
  PersonaId,
  FloorState,
  Segment,
  BiddingCandidate,
  TurnIntent,
  DiscussionPhase,
  DifficultyPreset,
  PersonaStance,
  StudentClaim,
} from './types';
import { PERSONAS, getPanelPersonas } from './personas';
import { DIFFICULTY_PRESETS } from './difficulties';
import { FEATURES } from '@/config/features';

export interface FloorContext {
  state: FloorState;
  phase: DiscussionPhase;
  topic: string;
  panel: PersonaId[];
  patienceMs: number;
  difficulty: DifficultyPreset;
  currentSpeakerId: PersonaId | 'user' | null;
  activeSegment: Partial<Segment> | null;
  segments: Segment[];
  consecutiveAiTurns: number;
  lastSpeakerId: PersonaId | 'user' | null;
  lastTurnEndTimeMs: number;
  sessionStartTimeMs: number;
  closingQueue: (PersonaId | 'user')[];
  closingCurrentIndex: number;
  isAudioPlaying: boolean;
  abortController: AbortController | null;
  // A3: Persona memory within session
  studentClaims: StudentClaim[];
  // A4: Stance tracking
  stances: Record<PersonaId, PersonaStance>;
}

export function createInitialContext(
  topic: string,
  panelSize: number,
  patienceMs: number = 1200,
  difficulty: DifficultyPreset = 'realistic'
): FloorContext {
  const panel = getPanelPersonas(panelSize).map((p) => p.id);
  const diffConfig = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.realistic;

  // Initial stance distribution
  const initialStances: Record<PersonaId, PersonaStance> = {
    dr_nair: 'neutral',
    arjun: 'against',
    meera: 'neutral',
    kabir: 'neutral',
    sana: 'for',
    rohan: 'neutral',
  };

  return {
    state: 'SETUP',
    phase: 'PREP',
    topic,
    panel,
    patienceMs: patienceMs || diffConfig.defaultPatienceMs,
    difficulty,
    currentSpeakerId: null,
    activeSegment: null,
    segments: [],
    consecutiveAiTurns: 0,
    lastSpeakerId: null,
    lastTurnEndTimeMs: Date.now(),
    sessionStartTimeMs: Date.now(),
    closingQueue: [],
    closingCurrentIndex: 0,
    isAudioPlaying: false,
    abortController: null,
    studentClaims: [],
    stances: initialStances,
  };
}

/**
 * Calculates bidding scores and "wants to speak" flags for all eligible AI participants
 */
export function calculateBids(
  context: FloorContext,
  nowMs: number = Date.now()
): BiddingCandidate[] {
  const { panel, segments, lastSpeakerId, difficulty } = context;
  const diffConfig = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.realistic;

  const recentSegments = segments.slice(-4);
  const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;
  const lastSegmentText = lastSegment ? lastSegment.text.toLowerCase() : '';

  const candidates: BiddingCandidate[] = [];

  for (const personaId of panel) {
    const persona = PERSONAS[personaId];
    if (!persona) continue;

    // 1. Base talkativeness
    let talkativenessTerm = persona.talkativeness * 1.5;

    // 2. Addressed by name term (+2.0 if named in last turn)
    let addressedByNameTerm = 0;
    const personaFirstName = persona.name.toLowerCase().split(' ')[0];
    if (lastSegmentText.includes(personaFirstName)) {
      addressedByNameTerm = 2.0;
    }

    // 3. Silence term (+0.3 per second since last spoke, capped at 2.5)
    let secondsSinceLastSpoke = 30;
    for (let i = segments.length - 1; i >= 0; i--) {
      if (segments[i].speakerId === personaId) {
        secondsSinceLastSpoke = (nowMs - segments[i].endMs) / 1000;
        break;
      }
    }
    const silenceTerm = Math.min(2.5, Math.max(0, secondsSinceLastSpoke * 0.3));

    // 4. Penalty if spoke in last turn
    const lastTurnPenalty = lastSpeakerId === personaId ? -1.5 : 0;

    // 5. Penalty if spoke twice in last 4 turns
    const spokeCountRecent = recentSegments.filter((s) => s.speakerId === personaId).length;
    const recentTurnPenalty = spokeCountRecent >= 2 ? -0.8 : 0;

    // 6. Random jitter scaled by difficulty
    const jitter = Math.random() * (diffConfig.jitter || 0.3);

    const totalScore =
      talkativenessTerm +
      addressedByNameTerm +
      silenceTerm +
      lastTurnPenalty +
      recentTurnPenalty +
      jitter;

    // A1: Determine if AI wants to speak (above urge threshold and not currently speaking)
    const wantsToSpeak =
      FEATURES.enableWantsToSpeakIndicator &&
      totalScore >= 2.4 &&
      context.currentSpeakerId !== personaId;

    candidates.push({
      personaId,
      score: Number(totalScore.toFixed(3)),
      wantsToSpeak,
      breakdown: {
        talkativeness: Number(talkativenessTerm.toFixed(2)),
        addressedByNameTerm,
        silenceTerm: Number(silenceTerm.toFixed(2)),
        lastTurnPenalty,
        recentTurnPenalty,
        jitter: Number(jitter.toFixed(2)),
      },
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

/**
 * Extracts student key claims for persona memory (Feature A3)
 */
export function extractStudentClaims(segments: Segment[]): StudentClaim[] {
  const userSegments = segments.filter((s) => s.speakerId === 'user');
  const claims: StudentClaim[] = [];

  for (const seg of userSegments) {
    const text = seg.text.trim();
    if (text.length > 20) {
      // Pick first sentence or core statement
      const sentence = text.split(/[.?!]/)[0].trim();
      if (sentence.length > 15) {
        claims.push({
          id: `claim_${seg.id}`,
          text: sentence.slice(0, 100),
          timestampMs: seg.startMs,
        });
      }
    }
  }

  return claims.slice(-5); // Keep last 5 claims
}

/**
 * Selects the next speaker based on bidding and turn constraints
 */
export function selectNextAiSpeaker(context: FloorContext): {
  speakerId: PersonaId;
  intent: TurnIntent;
  mustDirectlyAddressStudent: boolean;
} {
  const diffConfig = DIFFICULTY_PRESETS[context.difficulty] || DIFFICULTY_PRESETS.realistic;
  const bids = calculateBids(context);
  const highestBidder = bids[0];

  const cap = diffConfig.consecutiveAiTurnCap || 2;
  const mustDirectlyAddressStudent = context.consecutiveAiTurns >= cap;

  let intent: TurnIntent = 'agree_and_extend';

  if (mustDirectlyAddressStudent) {
    intent = 'invite_student';
  } else if (highestBidder.personaId === 'arjun') {
    intent = Math.random() < diffConfig.challengeWeight ? 'challenge' : 'bring_example';
  } else if (highestBidder.personaId === 'meera') {
    intent = Math.random() > 0.3 ? 'agree_and_extend' : 'bring_example';
  } else if (highestBidder.personaId === 'kabir') {
    intent = 'summarise';
  } else if (highestBidder.personaId === 'sana') {
    intent = Math.random() > 0.5 ? 'drift' : 'bring_example';
  } else if (highestBidder.personaId === 'rohan') {
    intent = Math.random() > 0.5 ? 'agree_and_extend' : 'challenge';
  }

  return {
    speakerId: highestBidder.personaId,
    intent,
    mustDirectlyAddressStudent,
  };
}
