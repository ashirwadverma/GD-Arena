import {
  PersonaId,
  FloorState,
  Segment,
  BiddingCandidate,
  TurnIntent,
  DiscussionPhase,
} from './types';
import { PERSONAS, getPanelPersonas } from './personas';

export interface FloorContext {
  state: FloorState;
  phase: DiscussionPhase;
  topic: string;
  panel: PersonaId[];
  patienceMs: number;
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
}

export function createInitialContext(
  topic: string,
  panelSize: number,
  patienceMs: number = 1200
): FloorContext {
  const panel = getPanelPersonas(panelSize).map((p) => p.id);
  return {
    state: 'SETUP',
    phase: 'PREP',
    topic,
    panel,
    patienceMs,
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
  };
}

/**
 * Calculates bidding scores for all eligible AI participants
 */
export function calculateBids(
  context: FloorContext,
  nowMs: number = Date.now()
): BiddingCandidate[] {
  const { panel, segments, lastSpeakerId } = context;
  const recentSegments = segments.slice(-4);
  const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;
  const lastSegmentText = lastSegment ? lastSegment.text.toLowerCase() : '';

  const candidates: BiddingCandidate[] = [];

  for (const personaId of panel) {
    const persona = PERSONAS[personaId];
    if (!persona) continue;

    // 1. Base talkativeness (0.0 to 1.0)
    let talkativenessTerm = persona.talkativeness * 1.5;

    // 2. Addressed by name term (+2.0 if named in last turn)
    let addressedByNameTerm = 0;
    const personaFirstName = persona.name.toLowerCase().split(' ')[0];
    if (lastSegmentText.includes(personaFirstName)) {
      addressedByNameTerm = 2.0;
    }

    // 3. Silence term (+0.3 per second since last spoke, capped at 2.5)
    let secondsSinceLastSpoke = 30; // default high if never spoke
    for (let i = segments.length - 1; i >= 0; i--) {
      if (segments[i].speakerId === personaId) {
        secondsSinceLastSpoke = (nowMs - segments[i].endMs) / 1000;
        break;
      }
    }
    const silenceTerm = Math.min(2.5, Math.max(0, secondsSinceLastSpoke * 0.3));

    // 4. Penalty if spoke in the last turn (-1.5)
    const lastTurnPenalty = lastSpeakerId === personaId ? -1.5 : 0;

    // 5. Penalty if spoke twice in last 4 turns (-0.8)
    const spokeCountRecent = recentSegments.filter((s) => s.speakerId === personaId).length;
    const recentTurnPenalty = spokeCountRecent >= 2 ? -0.8 : 0;

    // 6. Random jitter (0 to 0.4)
    const jitter = Math.random() * 0.4;

    const totalScore =
      talkativenessTerm +
      addressedByNameTerm +
      silenceTerm +
      lastTurnPenalty +
      recentTurnPenalty +
      jitter;

    candidates.push({
      personaId,
      score: Number(totalScore.toFixed(3)),
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

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

/**
 * Selects the next speaker based on bidding and turn constraints
 */
export function selectNextAiSpeaker(context: FloorContext): {
  speakerId: PersonaId;
  intent: TurnIntent;
  mustDirectlyAddressStudent: boolean;
} {
  const bids = calculateBids(context);
  const highestBidder = bids[0];

  // If 2 consecutive AI turns already happened, we enforce student inclusion
  const mustDirectlyAddressStudent = context.consecutiveAiTurns >= 2;

  // Determine intent based on speaker persona & context
  let intent: TurnIntent = 'agree_and_extend';

  if (mustDirectlyAddressStudent) {
    intent = 'invite_student';
  } else if (highestBidder.personaId === 'arjun') {
    intent = Math.random() > 0.4 ? 'challenge' : 'bring_example';
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
