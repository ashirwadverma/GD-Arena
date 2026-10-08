export interface TopicItem {
  id: string;
  title: string;
  category: 'Current affairs' | 'Abstract' | 'Opinion' | 'Case-based';
  description: string;
  starterPoints: string[];
  caseStudyId?: string;
}

export interface TopicCategoryGroup {
  category: 'Current affairs' | 'Abstract' | 'Opinion' | 'Case-based';
  topics: TopicItem[];
}

export const TOPIC_CATEGORIES: TopicCategoryGroup[] = [
  {
    category: 'Current affairs',
    topics: [
      {
        id: 'ai-workforce',
        title: 'Generative AI & Tech Hiring: Automation of Entry-Level Roles vs Augmented Engineering',
        category: 'Current affairs',
        description: 'Analyze the impact of LLMs on junior coding jobs, system design thinking, and 2026 hiring benchmarks.',
        starterPoints: [
          'Shift from syntax writing to prompt engineering and architectural verification',
          'Productivity gains versus junior mentorship pipelines in tech companies',
          'Campus placement criteria transformation',
        ],
      },
      {
        id: 'data-sovereignty',
        title: 'Digital Data Protection Laws: Balancing National Innovation with Individual Privacy Rights',
        category: 'Current affairs',
        description: 'Debate regulatory compliance burdens on startups versus consumer consent in high-growth digital economies.',
        starterPoints: [
          'Cross-border data flows versus national security',
          'Startup compliance costs versus Big Tech market consolidation',
          'AI training dataset rights and surveillance safeguards',
        ],
      },
      {
        id: 'fintech-inclusion',
        title: 'Digital Rupee (CBDC) & UPI: Is Cash Obsolete or Are We in a Tier-1 Metro Bubble?',
        category: 'Current affairs',
        description: 'Evaluate rural digital literacy, cybersecurity risks, transaction server downtimes, and zero-MDR sustainability.',
        starterPoints: [
          'Merchant viability under zero transaction charges',
          'Cyber-fraud vulnerability in semi-literate demographics',
          'Financial inclusion beyond tier-1 cities',
        ],
      },
      {
        id: 'semiconductor-race',
        title: 'Global Chip War & Semiconductor Fabs: National Self-Reliance vs Supply Chain Realities',
        category: 'Current affairs',
        description: 'Examine multi-billion dollar semiconductor subsidies, water & power requirements, and geopolitical tech decoupling.',
        starterPoints: [
          'Capital expenditure return horizons in wafer fabrication',
          'Geopolitical tech alliances versus local supply vulnerabilities',
          'Talent scarcity in microelectronics engineering',
        ],
      },
    ],
  },
  {
    category: 'Abstract',
    topics: [
      {
        id: 'black-and-white',
        title: 'Is Grey the Reality, or an Excuse for the Lack of Conviction?',
        category: 'Abstract',
        description: 'Explore moral relativism, situational leadership, and ethical decisiveness in corporate governance.',
        starterPoints: [
          'Nuance versus moral ambiguity in business decisions',
          'Pragmatic compromise versus uncompromising integrity',
          'Leadership under high-stake ambiguity',
        ],
      },
      {
        id: 'silence-vs-speech',
        title: 'Silence Speaks Louder Than Words: Strategic Restraint vs Necessary Assertion',
        category: 'Abstract',
        description: 'Debate active listening and diplomatic restraint versus vocal intervention and bold narrative control.',
        starterPoints: [
          'Speaking for visibility versus speaking with substance',
          'Power dynamics in corporate boardrooms',
          'Active observation as a strategic advantage in discussions',
        ],
      },
      {
        id: 'speed-vs-direction',
        title: 'Speed is Irrelevant if You Are Going in the Wrong Direction',
        category: 'Abstract',
        description: 'Examine startup blitzscaling versus deliberate strategic alignment and unit economics.',
        starterPoints: [
          'First-mover advantage versus sustainable market architecture',
          'Agility versus foundational technical debt',
          'Pacing in personal career development',
        ],
      },
      {
        id: 'constraints-creativity',
        title: 'Constraints Foster Creativity: Abundance vs Scarcity in Problem Solving',
        category: 'Abstract',
        description: 'Analyze how resource limits spark frugal innovation (Jugaad) versus how venture capital abundance breeds complacency.',
        starterPoints: [
          'Budget caps driving architectural optimization',
          'Over-funding leading to reckless customer acquisition',
          'Psychological resilience under constraints',
        ],
      },
    ],
  },
  {
    category: 'Opinion',
    topics: [
      {
        id: 'mandatory-rto',
        title: 'Mandatory Return to Office (RTO) vs Permanent Remote Work: What Drives Real Innovation?',
        category: 'Opinion',
        description: 'Debate serendipity in watercooler chats versus deep work productivity, commute fatigue, and global talent pools.',
        starterPoints: [
          'Junior mentorship and cultural osmosis in person',
          'Commute fatigue, urban cost of living, and tier-2/3 employment',
          'Hybrid compromise models and outcome-based evaluation',
        ],
      },
      {
        id: 'moonlighting-ethics',
        title: 'Moonlighting & Side Hustles: Professional Right or Breach of Corporate Integrity?',
        category: 'Opinion',
        description: 'Examine remote work culture, skill monetization in inflation, IP ownership, and employee loyalty.',
        starterPoints: [
          'Fair compensation versus exclusive employment contracts',
          'Intellectual property leakages and conflict of interest',
          'Output-driven performance evaluation versus 9-to-5 time tracking',
        ],
      },
      {
        id: 'esg-action',
        title: 'Corporate ESG Commitments: Genuine Sustainability or Sophisticated Greenwashing?',
        category: 'Opinion',
        description: 'Evaluate carbon credit loopholes, renewable energy transitions, and quarterly shareholder return pressures.',
        starterPoints: [
          'Short-term quarterly stock pressure vs multi-decade climate goals',
          'Independent audit standards and greenwashing loopholes',
          'Consumer willingness to pay sustainable price premiums',
        ],
      },
      {
        id: 'college-degrees-relevance',
        title: 'Are Four-Year Engineering Degrees Obsolete in the Age of Skill-First Micro-Credentials?',
        category: 'Opinion',
        description: 'Discuss curriculum lag versus foundational problem solving, peer networking, and specialized bootcamps.',
        starterPoints: [
          'Academic curriculum freshness vs industry velocity',
          'Foundational mathematics and thinking frameworks',
          'Signaling value of pedigree in top-tier placement filters',
        ],
      },
    ],
  },
  {
    category: 'Case-based',
    topics: [
      {
        id: 'case_tech_crisis',
        title: 'Case Study: NeoPay Data Security Vulnerability & Transparency Dilemma',
        category: 'Case-based',
        description: 'Reach consensus on whether a fintech should shut down services publicly for 12 hours or deploy a silent hotfix.',
        starterPoints: [
          'Immediate brand trust vs panic-induced stock crash',
          'Compliance obligations under privacy regulations',
          'Compensatory measures and communication roadmaps',
        ],
        caseStudyId: 'case_tech_crisis',
      },
      {
        id: 'case_ai_ethics',
        title: 'Case Study: GlobalTalent AI Hiring Bias vs Fast Campus Scale',
        category: 'Case-based',
        description: 'Resolve how an AI talent platform must address statistical bias against women returning from career breaks.',
        starterPoints: [
          'Speed of recruitment versus demographic fairness',
          'Algorithmic post-hoc adjustments vs human-in-the-loop review',
          'Legal and reputational liability in campus placements',
        ],
        caseStudyId: 'case_ai_ethics',
      },
      {
        id: 'case_startup_pivot',
        title: 'Case Study: QuickDrop Logistics – B2C Hypergrowth Burn vs B2B Enterprise Pivot',
        category: 'Case-based',
        description: 'Determine whether a 10-minute delivery startup with 6 months cash should pivot to enterprise software.',
        starterPoints: [
          'Survival runway versus valuation multiples',
          'Severance and rider fleet transition ethics',
          'Hybrid licensing opportunities',
        ],
        caseStudyId: 'case_startup_pivot',
      },
    ],
  },
];

export const ALL_CURATED_TOPICS = TOPIC_CATEGORIES.flatMap((c) => c.topics);
export const CURATED_TOPICS = TOPIC_CATEGORIES;
export const DEFAULT_TOPIC = TOPIC_CATEGORIES[0].topics[0];
