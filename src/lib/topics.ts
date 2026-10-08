export interface TopicCategory {
  category: string;
  topics: {
    id: string;
    title: string;
    description: string;
    starterPoints: string[];
  }[];
}

export const CURATED_TOPICS: TopicCategory[] = [
  {
    category: 'Technology & AI',
    topics: [
      {
        id: 'ai-jobs',
        title: 'Will Generative AI Replace Entry-Level Software Engineers or 10x Them?',
        description: 'Explore developer productivity, code generation vs architectural thinking, and the future of tech hiring.',
        starterPoints: [
          'Automation of boilerplate code versus critical reasoning',
          'Shift from writing syntax to system design and prompt orchestration',
          'Impact on campus placement hiring bars in 2025-2026',
        ],
      },
      {
        id: 'tech-monopolies',
        title: 'Big Tech Monopolies: Innovators of Growth or Stiflers of Competition?',
        description: 'Debate open-source vs proprietary walled gardens, acquisitions, and antitrust regulations.',
        starterPoints: [
          'Capital power funding moonshots and LLMs',
          'Antitrust interventions and market consolidation',
          'Startup ecosystem survivability',
        ],
      },
      {
        id: 'data-privacy-india',
        title: 'Digital Personal Data Protection: Balancing National Innovation with Individual Privacy',
        description: 'Discuss compliance burden on startups versus consumer consent in high-growth digital economies.',
        starterPoints: [
          'Cross-border data transfers and sovereignty',
          'Startup agility vs compliance costs',
          'Surveillance risks vs AI training dataset rights',
        ],
      },
    ],
  },
  {
    category: 'Economy & Business Strategy',
    topics: [
      {
        id: 'moonlighting',
        title: 'Moonlighting & Gig Economy: Professional Right or Breach of Corporate Integrity?',
        description: 'Examine remote work culture, IP ownership, conflict of interest, and fair compensation.',
        starterPoints: [
          'Skill monetization in inflation vs company loyalty',
          'Non-compete clauses and intellectual property leakages',
          'Outcome-based versus hour-based employee evaluation',
        ],
      },
      {
        id: 'startup-profitability',
        title: 'Growth at All Costs vs Unit Economics: Has the Startup Funding Winter Fixed Tech Priorities?',
        description: 'Compare venture-subsidized customer acquisition with sustainable cash flow positive business models.',
        starterPoints: [
          'Free cash flow versus market capture velocity',
          'Layoffs and down-rounds in post-2022 era',
          'Sustainable job creation in Indian tech hubs',
        ],
      },
      {
        id: 'fintech-cashless',
        title: 'UPI & Digital Payments: Has India Truly Outgrown Cash or Are We in a Tier-1 Bubble?',
        description: 'Evaluate rural penetration, server downtimes, transaction charges, and financial inclusion.',
        starterPoints: [
          'Merchant adoption and zero-MDR sustainability',
          'Cyber-fraud vulnerability in semi-literate demographics',
          'Digital rupee (CBDC) vs private fintech players',
        ],
      },
    ],
  },
  {
    category: 'Social & Campus Dilemmas',
    topics: [
      {
        id: 'workplace-wfh',
        title: 'Mandatory Return to Office (RTO) vs Permanent Remote Work: What Drives Real Innovation?',
        description: 'Analyze serendipity in watercooler chats versus deep work productivity and employee mental health.',
        starterPoints: [
          'Junior mentorship and cultural osmosis in person',
          'Commute fatigue, urban cost of living, and tier-2/3 employment',
          'Hybrid compromise models',
        ],
      },
      {
        id: 'esg-greenwashing',
        title: 'Corporate ESG Commitments: Genuine Climate Action or Pure PR Greenwashing?',
        description: 'Debate carbon credits, renewable investments, and regulatory accountability for Fortune 500 companies.',
        starterPoints: [
          'Short-term shareholder pressure vs long-term sustainability',
          'Measurement standards and greenwashing audit loopholes',
          'Consumer willingness to pay green premiums',
        ],
      },
    ],
  },
];

export const DEFAULT_TOPIC = CURATED_TOPICS[0].topics[0];
