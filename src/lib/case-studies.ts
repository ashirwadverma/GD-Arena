import { CaseStudyScenario } from './types';

export const CASE_STUDIES: CaseStudyScenario[] = [
  {
    id: 'case_tech_crisis',
    title: 'Fintech Security Breach & Transparency Dilemma',
    company: 'NeoPay Inc.',
    scenario:
      'NeoPay discovered an unexploited vulnerability exposing 2 million user PAN and transaction records. Patching requires a 12-hour full service blackout during festive shopping weekend, costing $4M in revenue and panic. Marketing wants silent overnight hotfix; Security wants public disclosure.',
    promptQuestion:
      'Should NeoPay initiate an immediate full public shutdown and disclosure, or deploy a discreet hotfix without alarming markets?',
    options: [
      'Option A: Immediate transparent public shutdown with compensatory credits.',
      'Option B: Phased silent patching with internal forensic monitoring.',
      'Option C: Hybrid disclosure after vulnerability verification with regulatory authorities.',
    ],
  },
  {
    id: 'case_ai_ethics',
    title: 'Automated Hiring Algorithm Bias vs Speed',
    company: 'GlobalTalent AI',
    scenario:
      'A proprietary AI screening tool accelerated candidate filtering by 80%, but internal audits show historical training data penalizes women returning from career breaks. Retraining delays campus hiring for 6 months.',
    promptQuestion:
      'Should GlobalTalent halt the AI tool completely and revert to manual review, or deploy demographic adjustments while continuing usage?',
    options: [
      'Option A: Complete halt and revert to manual human panel review.',
      'Option B: Apply algorithmic post-hoc weighting and proceed.',
      'Option C: Hybrid human-in-the-loop audit for all borderline candidates.',
    ],
  },
  {
    id: 'case_startup_pivot',
    title: 'B2C Hypergrowth Burn vs B2B Enterprise Pivot',
    company: 'QuickDrop Logistics',
    scenario:
      'QuickDrop has 6 months of cash runway. 10-minute grocery delivery burns $1.5M/month with 40% user churn. A Fortune 500 retailer offered a $15M enterprise software contract, but it requires laying off 60% of the rider fleet.',
    promptQuestion:
      'Should QuickDrop pivot entirely to B2B enterprise software or double-down on high-density B2C micro-warehouses?',
    options: [
      'Option A: Full B2B software pivot with severance support.',
      'Option B: Retain core B2C in tier-1 metros and license software in parallel.',
      'Option C: Raise bridge debt financing to subsidize B2C unit economics.',
    ],
  },
];
