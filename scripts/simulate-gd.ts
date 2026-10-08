import { calculateSessionStats } from '../src/lib/stats';
import { sanitizeReportEvidence } from '../src/lib/evidence-validator';
import { calculateBids, createInitialContext } from '../src/lib/state-machine';
import { Segment, DimensionFeedback } from '../src/lib/types';

async function runSimulation() {
  console.log('=== [GD Arena] Starting Orchestrator & Evidence Simulation ===\n');

  const topic = 'Will Generative AI Replace Entry-Level Software Engineers or 10x Them?';
  const context = createInitialContext(topic, 4, 1200);

  // 1. Test Bidding Engine
  console.log('1. Testing AI Bidding Engine...');
  const bids = calculateBids(context);
  console.log('Initial Bidding Scores:');
  bids.forEach((b, i) => {
    console.log(`  ${i + 1}. [${b.personaId}] Total Score: ${b.score}`);
  });

  // 2. Simulated GD Conversation Turns
  console.log('\n2. Simulating Multi-turn Group Discussion...');
  const now = Date.now();
  const simulatedSegments: Segment[] = [
    {
      id: 'seg_1',
      speakerId: 'dr_nair',
      speakerName: 'Dr. Nair',
      startMs: now,
      endMs: now + 5000,
      text: 'Good day everyone. Our topic is whether generative AI will replace or empower entry-level software developers. Who will open?',
      phase: 'OPENING',
    },
    {
      id: 'seg_2',
      speakerId: 'user',
      speakerName: 'You',
      startMs: now + 6000,
      endMs: now + 16000,
      text: 'Thank you moderator. I believe AI will fundamentally 10x developer productivity rather than replace junior engineers, because critical system design and business logic require human contextual judgment.',
      phase: 'DISCUSSION',
    },
    {
      id: 'seg_3',
      speakerId: 'arjun',
      speakerName: 'Arjun',
      startMs: now + 17000,
      endMs: now + 24000,
      text: 'I disagree with the candidate on the timeline! Look at the speed at which LLMs write unit tests and boilerplate code today.',
      phase: 'DISCUSSION',
    },
    {
      id: 'seg_4',
      speakerId: 'meera',
      speakerName: 'Meera',
      startMs: now + 25000,
      endMs: now + 34000,
      text: 'Building on what was said, empirical studies show that developers using AI complete tasks 55% faster, but security vulnerabilities increase if code is not properly reviewed.',
      phase: 'DISCUSSION',
    },
    {
      id: 'seg_5',
      speakerId: 'user',
      speakerName: 'You',
      startMs: now + 35000,
      endMs: now + 48000,
      text: 'As Meera pointed out regarding security, that is exactly why engineering roles will shift toward prompt orchestration and architectural verification rather than basic syntax typing.',
      phase: 'DISCUSSION',
    },
  ];

  // 3. Test Deterministic Layer 1 Stats Calculation
  console.log('\n3. Testing Layer 1 Deterministic Stats Calculation...');
  const stats = calculateSessionStats(simulatedSegments, 60, now);
  console.log(`- Talk Share: ${stats.userTalkSharePct}%`);
  console.log(`- Speaking Pace: ${stats.speakingPaceWpm} WPM`);
  console.log(`- Turns Taken: ${stats.userTurnsCount}`);
  console.log(`- Time to First Entry: ${stats.timeToFirstContributionSeconds}s`);
  console.log(`- References to Others: ${stats.referencesToOthersCount}`);
  console.log(`- Filler Words Count: ${stats.fillerWordsCount}`);

  // 4. Test Evidence Validation (PRD Section 8.3)
  console.log('\n4. Testing Evidence Validation & Anti-Hallucination Guard...');
  const testDimensions: DimensionFeedback[] = [
    {
      name: 'building_on_others',
      title: 'Building on Others',
      score: 4,
      summary: 'Strong reference to peers',
      strengths: ['Named Meera explicitly'],
      improvements: ['None'],
      evidence: [
        {
          segmentId: 'seg_5',
          quote: 'As Meera pointed out regarding security',
          note: 'Direct peer citation',
        },
        {
          segmentId: 'seg_5',
          quote: 'This is a fabricated fake quote that was never spoken',
          note: 'Should be automatically dropped by validator',
        },
      ],
    },
  ];

  const sanitized = sanitizeReportEvidence(testDimensions, simulatedSegments);
  console.log('Evidence items before sanitization:', testDimensions[0].evidence.length);
  console.log('Evidence items after sanitization:', sanitized[0].evidence.length);

  if (sanitized[0].evidence.length === 1 && sanitized[0].evidence[0].verified) {
    console.log('✅ PASS: Fabricated quote was successfully dropped and real quote verified!');
  } else {
    console.error('❌ FAIL: Evidence validation check failed.');
  }

  console.log('\n=== Simulation Completed Successfully ===');
}

runSimulation().catch(console.error);
