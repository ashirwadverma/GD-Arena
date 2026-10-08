import { Segment, SessionStats, PersonaId } from './types';
import { PERSONAS } from './personas';

const FILLER_WORDS = ['um', 'uh', 'like', 'basically', 'you know', 'matlab', 'toh', 'actually', 'literally', 'sort of', 'kind of'];

const OTHER_NAMES = ['dr. nair', 'dr nair', 'nair', 'arjun', 'meera', 'kabir', 'sana', 'rohan'];

export function calculateSessionStats(
  segments: Segment[],
  totalDurationSeconds: number,
  sessionStartMs: number
): SessionStats {
  const userSegments = segments.filter((s) => s.speakerId === 'user');
  const aiSegments = segments.filter((s) => s.speakerId !== 'user');

  // Compute talk durations per speaker
  const speakerTimes: Record<string, number> = {};
  speakerTimes['user'] = 0;
  Object.keys(PERSONAS).forEach((pId) => {
    speakerTimes[pId] = 0;
  });

  segments.forEach((seg) => {
    const duration = Math.max(1, (seg.endMs - seg.startMs) / 1000);
    speakerTimes[seg.speakerId] = (speakerTimes[seg.speakerId] || 0) + duration;
  });

  const totalSpeakingSeconds = Object.values(speakerTimes).reduce((a, b) => a + b, 0) || 1;
  const userSpeakingSeconds = speakerTimes['user'] || 0;
  const userTalkSharePct = Math.min(100, Math.round((userSpeakingSeconds / totalSpeakingSeconds) * 100));

  // Word count & turns
  const userTurnsCount = userSegments.length;
  let totalUserWords = 0;
  userSegments.forEach((s) => {
    const words = s.text.trim().split(/\s+/).filter(Boolean).length;
    totalUserWords += words;
  });

  const userAvgTurnWords = userTurnsCount > 0 ? Math.round(totalUserWords / userTurnsCount) : 0;
  const userMinutes = Math.max(userSpeakingSeconds / 60, 0.1);
  const speakingPaceWpm = userSpeakingSeconds > 0 ? Math.round(totalUserWords / userMinutes) : 0;

  // Time to first contribution
  let timeToFirstContributionSeconds = 0;
  if (userSegments.length > 0) {
    const firstUserTime = userSegments[0].startMs;
    timeToFirstContributionSeconds = Math.max(0, Math.round((firstUserTime - sessionStartMs) / 1000));
  } else {
    timeToFirstContributionSeconds = totalDurationSeconds;
  }

  // Longest silence by student
  let longestSilenceSeconds = 0;
  if (userSegments.length > 0) {
    let lastUserEnd = sessionStartMs;
    userSegments.forEach((seg) => {
      const gap = (seg.startMs - lastUserEnd) / 1000;
      if (gap > longestSilenceSeconds) {
        longestSilenceSeconds = gap;
      }
      lastUserEnd = seg.endMs;
    });
    // Check end gap
    const finalGap = (sessionStartMs + totalDurationSeconds * 1000 - lastUserEnd) / 1000;
    if (finalGap > longestSilenceSeconds) {
      longestSilenceSeconds = finalGap;
    }
  } else {
    longestSilenceSeconds = totalDurationSeconds;
  }
  longestSilenceSeconds = Math.round(Math.max(0, longestSilenceSeconds));

  // Interruptions
  let studentInterruptedAiCount = 0;
  let aiInterruptedStudentCount = 0;

  segments.forEach((seg) => {
    if (seg.interrupted) {
      if (seg.speakerId === 'user') {
        aiInterruptedStudentCount++;
      } else {
        studentInterruptedAiCount++;
      }
    }
  });

  // Filler words
  const fillerBreakdown: Record<string, number> = {};
  let totalFillers = 0;
  const userAllText = userSegments.map((s) => s.text.toLowerCase()).join(' ');

  FILLER_WORDS.forEach((filler) => {
    // Regex boundary matching
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = userAllText.match(regex);
    const count = matches ? matches.length : 0;
    if (count > 0) {
      fillerBreakdown[filler] = count;
      totalFillers += count;
    }
  });

  const fillerWordsPerMinute = Number((totalFillers / userMinutes).toFixed(1));

  // Questions asked by user
  let questionsAskedCount = 0;
  userSegments.forEach((seg) => {
    const txt = seg.text.trim();
    if (
      txt.endsWith('?') ||
      /^(what|how|why|can we|do you|is it|could|should we|what do you think)\b/i.test(txt)
    ) {
      questionsAskedCount++;
    }
  });

  // References to other participants
  let referencesToOthersCount = 0;
  userSegments.forEach((seg) => {
    const lower = seg.text.toLowerCase();
    const hasName = OTHER_NAMES.some((name) => lower.includes(name));
    const hasCollabPhrase = /(agree with|building on|as mentioned by|counter to|disagree with|as you said|point made by)/i.test(
      lower
    );
    if (hasName || hasCollabPhrase) {
      referencesToOthersCount++;
    }
  });

  // Build speakers share list
  const speakersShare = [
    {
      speakerId: 'user',
      speakerName: 'You',
      seconds: Math.round(userSpeakingSeconds),
      percentage: userTalkSharePct,
    },
    ...Object.entries(PERSONAS).map(([pId, p]) => {
      const sec = Math.round(speakerTimes[pId] || 0);
      const pct = Math.round((sec / totalSpeakingSeconds) * 100);
      return {
        speakerId: pId,
        speakerName: p.name,
        seconds: sec,
        percentage: pct,
      };
    }),
  ].filter((s) => s.seconds > 0 || s.speakerId === 'user');

  return {
    totalDurationSeconds,
    userTalkSharePct,
    userSpeakingSeconds: Math.round(userSpeakingSeconds),
    userTurnsCount,
    userAvgTurnWords,
    speakingPaceWpm,
    timeToFirstContributionSeconds,
    longestSilenceSeconds,
    studentInterruptedAiCount,
    aiInterruptedStudentCount,
    fillerWordsCount: totalFillers,
    fillerWordsPerMinute,
    fillerBreakdown,
    questionsAskedCount,
    referencesToOthersCount,
    speakersShare,
  };
}
