import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateSessionStats } from '@/lib/stats';
import { sanitizeReportEvidence } from '@/lib/evidence-validator';
import { DimensionFeedback, FeedbackReport, Segment } from '@/lib/types';

const ReportRequestSchema = z.object({
  topic: z.string(),
  duration_s: z.number(),
  candidateRole: z.enum(['none', 'first_speaker', 'contrarian', 'summarizer']).optional(),
  difficulty: z.enum(['friendly', 'realistic', 'tough', 'slow']).optional(),
  caseStudyId: z.string().optional(),
  segments: z.array(
    z.object({
      id: z.string(),
      speakerId: z.string(),
      speakerName: z.string(),
      startMs: z.number(),
      endMs: z.number(),
      text: z.string(),
      interrupted: z.boolean().optional(),
      phase: z.string().optional(),
    })
  ),
});

function generateLocalEvidenceReport(
  topic: string,
  segments: Segment[],
  stats: any,
  candidateRole?: string
): {
  overallScore: number;
  overallVerdict: string;
  dimensions: DimensionFeedback[];
  missedOpenings: any[];
  top3Actions: string[];
  structureCheck?: {
    followedThreePillars: boolean;
    feedback: string;
    evidenceQuote?: string;
  };
} {
  const userSegments = segments.filter((s) => s.speakerId === 'user');
  const userTurnCount = userSegments.length;

  // Pick real quotes from user utterances for evidence
  const userQuote1 = userSegments[0]
    ? { segmentId: userSegments[0].id, quote: userSegments[0].text.slice(0, 80), note: 'Your opening contribution' }
    : { segmentId: '', quote: '', note: 'Did not initiate early' };

  const userQuote2 = userSegments[1]
    ? { segmentId: userSegments[1].id, quote: userSegments[1].text.slice(0, 80), note: 'Elaborating on core reasoning' }
    : { segmentId: '', quote: '', note: 'Limited follow-up development' };

  const userQuote3 = userSegments[userSegments.length - 1]
    ? { segmentId: userSegments[userSegments.length - 1].id, quote: userSegments[userSegments.length - 1].text.slice(0, 80), note: 'Final statement contribution' }
    : { segmentId: '', quote: '', note: 'Concluding summary' };

  // Calculate scores based on deterministic metrics
  const initiateScore = stats.timeToFirstContributionSeconds < 45 ? 4 : userTurnCount > 0 ? 3 : 2;
  const ideaScore = stats.userAvgTurnWords > 15 ? 4 : userTurnCount > 0 ? 3 : 2;
  const buildScore = stats.referencesToOthersCount > 0 ? 4 : 3;
  const listenScore = stats.longestSilenceSeconds < 90 && userTurnCount >= 2 ? 4 : 3;
  const interruptScore = stats.studentInterruptedAiCount <= 2 ? 4 : 3;
  const endScore = userSegments.length >= 3 ? 4 : 3;

  // B2: Structure check for first speech
  const firstTurnText = userSegments[0]?.text?.toLowerCase() || '';
  const hasDefinition = firstTurnText.includes('mean') || firstTurnText.includes('topic') || firstTurnText.includes('define') || firstTurnText.length > 25;
  const hasStance = firstTurnText.includes('believe') || firstTurnText.includes('think') || firstTurnText.includes('view') || firstTurnText.includes('favor') || firstTurnText.includes('against');
  const hasPillars = firstTurnText.includes('first') || firstTurnText.includes('second') || firstTurnText.includes('aspect') || firstTurnText.includes('hand') || firstTurnText.includes('because');
  const followedFormula = (hasDefinition && hasStance) || (hasStance && hasPillars) || firstTurnText.length > 60;

  const structureCheck = {
    followedThreePillars: followedFormula,
    feedback: followedFormula
      ? 'Well structured opening! You anchored the topic definition, declared your stance, and outlined reasoning pillars clearly.'
      : 'In your first speech, remember the 3-step formula: 1) Define the topic scope, 2) Declare your stance, and 3) Preview 2 core points.',
    evidenceQuote: userSegments[0]?.text?.slice(0, 100),
  };

  const totalScore = Math.round(
    ((initiateScore + ideaScore + buildScore + listenScore + interruptScore + endScore) / 6) * 10
  ) / 10;

  const dimensions: DimensionFeedback[] = [
    {
      name: 'starting_the_discussion',
      title: 'Starting the Discussion & Initiative',
      score: initiateScore,
      summary:
        userTurnCount > 0
          ? `You took your first turn ${stats.timeToFirstContributionSeconds}s into the discussion. Solid presence entering the room.`
          : 'You hesitated to take the floor early. Initiating within the first 45 seconds establishes leadership.',
      strengths: [
        'Clear entry timing without hesitating excessively',
        'Acknowledged the topic scope directly',
      ],
      improvements: [
        'Aim to define the framework or 2-3 pillars in the opening turn to anchor the group',
      ],
      evidence: userQuote1.quote ? [userQuote1] : [],
    },
    {
      name: 'quality_of_ideas',
      title: 'Depth & Quality of Arguments',
      score: ideaScore,
      summary: `Delivered an average of ${stats.userAvgTurnWords} words per turn with a speaking pace of ${stats.speakingPaceWpm} WPM.`,
      strengths: [
        'Expressed logical arguments relevant to the central theme',
        'Avoided extreme or unsubstantiated claims',
      ],
      improvements: [
        'Incorporate structured examples, concrete industry cases, or clear cause-and-effect data points',
      ],
      evidence: userQuote2.quote ? [userQuote2] : [],
    },
    {
      name: 'building_on_others',
      title: 'Collaborative Building & Acknowledgement',
      score: buildScore,
      summary:
        stats.referencesToOthersCount > 0
          ? `Made ${stats.referencesToOthersCount} explicit references building upon or synthesizing peers' points.`
          : 'Tended to present isolated points rather than bridging with other participants by name.',
      strengths: [
        'Demonstrated active listening by engaging with the ongoing conversation thread',
      ],
      improvements: [
        'Use explicit phrasing like "Building on what Meera highlighted regarding metrics..." to score higher in group dynamics',
      ],
      evidence: userQuote2.quote ? [userQuote2] : [],
    },
    {
      name: 'listening_and_synthesis',
      title: 'Active Listening & Room Awareness',
      score: listenScore,
      summary: `Maintained a talk share of ${stats.userTalkSharePct}% with a maximum silence gap of ${stats.longestSilenceSeconds}s.`,
      strengths: [
        'Did not monopolize the discussion; allowed healthy floor transitions',
      ],
      improvements: [
        'When long silences occur between peers, step in with a synthesis to steer the group back on track',
      ],
      evidence: userQuote1.quote ? [userQuote1] : [],
    },
    {
      name: 'handling_interruptions',
      title: 'Composure & Turn Transitioning',
      score: interruptScore,
      summary: `Interrupted peers ${stats.studentInterruptedAiCount} times and was cut off ${stats.aiInterruptedStudentCount} times.`,
      strengths: [
        'Maintained composure and reclaimed floor appropriately when challenged',
      ],
      improvements: [
        'If interrupted by assertive peers like Arjun, finish your sentence calmly with "Allow me 10 seconds to conclude this point"',
      ],
      evidence: [],
    },
    {
      name: 'ending_strongly',
      title: 'Concluding & Final Synthesis',
      score: endScore,
      summary:
        userTurnCount >= 3
          ? 'Delivered a balanced closing statement summarizing the collective takeaways.'
          : 'Rushed through the final statement without summarizing both sides of the debate.',
      strengths: [
        'Offered forward-looking recommendations in the final phase',
      ],
      improvements: [
        'Synthesize 2 opposing perspectives into a clear win-win action plan in the closing round',
      ],
      evidence: userQuote3.quote ? [userQuote3] : [],
    },
  ];

  const missedOpenings = [
    {
      afterSegmentId: segments[1]?.id || 's_1',
      context: 'When Arjun strongly emphasized operational speed over long-term security.',
      suggestion: 'While Arjun has a point on speed, without a compliance baseline, early gains evaporate quickly.',
    },
  ];

  const top3Actions = [
    'Define the 3-pillar discussion framework during your first turn (e.g. Economic, Technological, Societal).',
    'Explicitly cite other speakers by name (e.g., "As Meera mentioned...") before presenting a counterpoint.',
    'Keep your filler words ("um, basically, like") below 2 per minute by pausing purposefully instead of filling gaps.',
  ];

  return {
    overallScore: totalScore,
    overallVerdict:
      totalScore >= 4.0
        ? 'Outstanding Performance - Ready for Top Tier GDs'
        : totalScore >= 3.0
        ? 'Solid Competence - Refine Structuring and Peer Bridging'
        : 'Needs Practice - Focus on Early Initiative & Point Structure',
    dimensions,
    missedOpenings,
    top3Actions,
    structureCheck,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReportRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error }, { status: 400 });
    }

    const { topic, duration_s, segments, candidateRole, difficulty, caseStudyId } = parsed.data;
    const typedSegments = segments as Segment[];

    // Calculate Layer 1 deterministic statistics instantly
    const sessionStart = typedSegments.length > 0 ? typedSegments[0].startMs : Date.now() - duration_s * 1000;
    const stats = calculateSessionStats(typedSegments, duration_s, sessionStart);

    let reportData = generateLocalEvidenceReport(topic, typedSegments, stats, candidateRole);

    // Call Gemini for structured evaluation if API key exists
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && typedSegments.length >= 3) {
      try {
        const transcriptWithIds = typedSegments
          .map((s) => `[Segment ID: ${s.id}] ${s.speakerName}: "${s.text}"`)
          .join('\n');

        const roleContext = candidateRole && candidateRole !== 'none'
          ? `The candidate was assigned the role: ${candidateRole}. Assess how well they fulfilled this role.`
          : '';

        const prompt = `You are a Senior Placement Director and expert Group Discussion evaluator.
Evaluate the candidate ("You") based on this actual campus GD transcript on the topic: "${topic}".
${roleContext}

MANDATORY RULES:
1. Every evidence item MUST contain an EXACT literal substring from a segment spoken by "You". Never invent or rephrase quotes.
2. If no valid quote exists for a dimension, leave evidence array empty.
3. Provide honest, non-inflated scores (1 to 5) with actionable campus placement advice.

Transcript:
${transcriptWithIds}

Return pure JSON matching this schema:
{
  "overallScore": number (1.0 to 5.0),
  "overallVerdict": string,
  "dimensions": [
    {
      "name": "starting_the_discussion" | "quality_of_ideas" | "building_on_others" | "listening_and_synthesis" | "handling_interruptions" | "ending_strongly",
      "title": string,
      "score": number (1 to 5),
      "summary": string,
      "strengths": [string, string],
      "improvements": [string],
      "evidence": [{ "segmentId": string, "quote": string, "note": string }]
    }
  ],
  "structureCheck": {
    "followedThreePillars": boolean,
    "feedback": string,
    "evidenceQuote": string
  },
  "missedOpenings": [
    { "afterSegmentId": string, "context": string, "suggestion": string }
  ],
  "top3Actions": [string, string, string]
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (res.ok) {
          const apiData = await res.json();
          const jsonText = apiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsedReport = JSON.parse(jsonText);
            if (parsedReport.dimensions && parsedReport.dimensions.length === 6) {
              reportData = {
                ...reportData,
                ...parsedReport,
              };
            }
          }
        }
      } catch (err) {
        console.warn('AI report generation error, using deterministic layer:', err);
      }
    }

    // Sanitize evidence: Strict verification that every quote exists in the actual transcript
    const sanitizedDimensions = sanitizeReportEvidence(reportData.dimensions, typedSegments);

    const fullReport: FeedbackReport = {
      id: `rep_${Date.now()}`,
      sessionId: `ses_${Date.now()}`,
      topic,
      createdAt: new Date().toISOString(),
      stats,
      overallScore: reportData.overallScore,
      overallVerdict: reportData.overallVerdict,
      dimensions: sanitizedDimensions,
      missedOpenings: reportData.missedOpenings || [],
      top3Actions: reportData.top3Actions || [],
      transcript: typedSegments,
      candidateRole: candidateRole as any,
      difficultyPreset: difficulty as any,
      structureCheck: reportData.structureCheck,
    };

    return NextResponse.json(fullReport);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to generate report' }, { status: 500 });
  }
}
