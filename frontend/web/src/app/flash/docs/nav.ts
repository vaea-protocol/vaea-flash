/* ═══ VAEA Flash Docs — Navigation Registry ═══ */

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  icon: string;
  headings: { id: string; label: string; level: 2 | 3 }[];
}

export interface NavGroup {
  title: string;
  pages: DocPage[];
}

export const NAV: NavGroup[] = [
  {
    title: 'Getting Started',
    pages: [
      { slug: 'introduction', title: 'Introduction', description: 'What is VAEA Flash — overview, features, audiences', icon: '📖',
        headings: [{ id: 'why', label: 'Why VAEA Flash', level: 2 }, { id: 'features', label: 'Key Features', level: 2 }, { id: 'audiences', label: 'Who Is It For', level: 2 }, { id: 'status', label: 'Status & Roadmap', level: 2 }] },
      { slug: 'quickstart', title: 'Quick Start', description: 'Install, initialize, and execute your first flash loan in 5 minutes', icon: '🚀',
        headings: [{ id: 'install', label: 'Installation', level: 2 }, { id: 'init', label: 'Initialize Client', level: 2 }, { id: 'first-loan', label: 'First Flash Loan', level: 2 }, { id: 'under-hood', label: 'Under the Hood', level: 2 }, { id: 'modes', label: 'Execution Modes', level: 2 }, { id: 'devnet', label: 'Devnet Testing', level: 2 }] },
    ],
  },
  {
    title: 'Core Concepts',
    pages: [
      { slug: 'architecture', title: 'Architecture', description: 'Sandwich pattern, PDAs, multi-protocol routing, security model', icon: '🏗️',
        headings: [{ id: 'sandwich', label: 'Sandwich Pattern', level: 2 }, { id: 'pdas', label: 'Program Accounts', level: 2 }, { id: 'routing', label: 'Multi-Protocol Routing', level: 2 }, { id: 'alt', label: 'Address Lookup Tables', level: 2 }, { id: 'security', label: 'Security Model', level: 2 }] },
      { slug: 'supported-tokens', title: 'Supported Tokens', description: '30 tokens — direct route (8) and synthetic route (22)', icon: '🪙',
        headings: [{ id: 'direct', label: 'Direct Route (8)', level: 2 }, { id: 'synthetic', label: 'Synthetic Route (22)', level: 2 }, { id: 'lst', label: 'LSTs via Sanctum', level: 3 }, { id: 'majors', label: 'Majors via Jupiter', level: 3 }, { id: 'midcaps', label: 'Mid-caps', level: 3 }, { id: 'stables', label: 'Stablecoins', level: 3 }] },
      { slug: 'routing', title: 'Routing & Routes', description: 'Direct vs synthetic routing, protocol priority, swap providers, fallback', icon: '🔀',
        headings: [{ id: 'how', label: 'How Routing Works', level: 2 }, { id: 'priority', label: 'Protocol Priority', level: 2 }, { id: 'swap', label: 'Swap Providers', level: 2 }, { id: 'fallback', label: 'Fallback Behavior', level: 2 }] },
      { slug: 'fees', title: 'Fees & Pricing', description: '0.03% SDK fee — transparent model, fee calculator, comparison', icon: '💰',
        headings: [{ id: 'model', label: 'Fee Model', level: 2 }, { id: 'calculator', label: 'Fee Calculator', level: 2 }, { id: 'direct-example', label: 'Direct Route Example', level: 2 }, { id: 'synthetic-example', label: 'Synthetic Example', level: 2 }, { id: 'comparison', label: 'Fee Comparison', level: 2 }] },
    ],
  },
  {
    title: 'Features',
    pages: [
      { slug: 'turbo-mode', title: 'Turbo Mode', description: '~91µs local build, zero API calls, 2000× faster', icon: '⚡',
        headings: [{ id: 'comparison', label: 'Latency Comparison', level: 2 }, { id: 'code', label: 'Code Examples', level: 2 }, { id: 'how', label: 'How It Works', level: 2 }, { id: 'local-build', label: 'localBuild() API', level: 2 }, { id: 'when', label: 'When to Use', level: 2 }, { id: 'borrow-vs-execute', label: 'borrowLocal() vs executeLocal()', level: 2 }] },
      { slug: 'simulation', title: 'Simulation', description: 'Dry-run flash loans without spending SOL', icon: '🔬',
        headings: [{ id: 'code', label: 'Code Examples', level: 2 }, { id: 'response', label: 'Response Schema', level: 2 }, { id: 'use-cases', label: 'Use Cases', level: 2 }] },
      { slug: 'multi-token-flash', title: 'Multi-Token Flash', description: 'Borrow multiple tokens in a single atomic TX', icon: '🔗',
        headings: [{ id: 'pattern', label: 'Transaction Pattern', level: 2 }, { id: 'code', label: 'Code Examples', level: 2 }, { id: 'pda', label: 'PDA Isolation', level: 2 }, { id: 'limits', label: 'Limits', level: 2 }] },
      { slug: 'profitability-check', title: 'Profitability Check', description: 'Cost estimation and profit analysis before sending', icon: '📊',
        headings: [{ id: 'code', label: 'Usage', level: 2 }, { id: 'levels', label: 'Recommendation Levels', level: 2 }, { id: 'breakdown', label: 'Cost Breakdown', level: 2 }] },
      { slug: 'smart-retry', title: 'Smart Retry', description: 'Auto retry with priority fee escalation', icon: '🔄',
        headings: [{ id: 'how', label: 'How It Works', level: 2 }, { id: 'code', label: 'Code Examples', level: 2 }, { id: 'errors', label: 'Error Classification', level: 2 }] },
      { slug: 'jito-bundles', title: 'Jito Bundles', description: 'Private MEV-protected bundles via Block Engine', icon: '🛡️',
        headings: [{ id: 'code', label: 'Code Examples', level: 2 }, { id: 'tips', label: 'Tip Strategies', level: 2 }, { id: 'gives', label: 'What Jito Gives You', level: 2 }, { id: 'limits', label: 'Limitations', level: 2 }, { id: 'regions', label: 'Block Engine Regions', level: 2 }, { id: 'poll', label: 'pollBundleStatus()', level: 2 }] },
      { slug: 'warm-cache', title: 'Warm Cache', description: 'Pre-warm PDAs and lookup tables for instant TX', icon: '🔥',
        headings: [{ id: 'code', label: 'Usage', level: 2 }, { id: 'cached', label: 'What Gets Cached', level: 2 }, { id: 'api', label: 'Advanced API', level: 2 }] },
      { slug: 'fee-guard', title: 'Fee Guard', description: 'Max fee protection — auto-reject expensive TXs', icon: '🚧',
        headings: [{ id: 'code', label: 'Usage', level: 2 }, { id: 'recommended', label: 'Recommended Settings', level: 2 }] },
      { slug: 'auto-slippage', title: 'Auto Slippage', description: 'Dynamic slippage calculation per token', icon: '🎯',
        headings: [{ id: 'code', label: 'Usage', level: 2 }, { id: 'by-token', label: 'Slippage by Token', level: 2 }, { id: 'manual', label: 'Calculate Manually', level: 2 }] },
    ],
  },
  {
    title: 'Developer Reference',
    pages: [
      { slug: 'rest-api', title: 'REST API', description: 'HTTP endpoints, parameters, response schemas', icon: '🌐',
        headings: [{ id: 'capacity', label: 'GET /v1/capacity', level: 2 }, { id: 'quote', label: 'GET /v1/quote', level: 2 }, { id: 'build', label: 'POST /v1/build', level: 2 }, { id: 'parse', label: 'parseApiInstruction()', level: 2 }, { id: 'health', label: 'GET /v1/health', level: 2 }, { id: 'limits', label: 'Rate Limits', level: 2 }] },
      { slug: 'sdk-utilities', title: 'SDK Utilities', description: 'Helper methods: getTokenCapacity, getHealth', icon: '🔧',
        headings: [{ id: 'token-capacity', label: 'getTokenCapacity()', level: 2 }, { id: 'health', label: 'getHealth()', level: 2 }] },
      { slug: 'error-codes', title: 'Error Codes', description: 'Complete error reference — codes, causes, fixes', icon: '🔴',
        headings: [{ id: 'sdk-errors', label: 'SDK Error Codes', level: 2 }, { id: 'onchain', label: 'On-Chain Errors (Anchor)', level: 2 }, { id: 'handling', label: 'Error Handling', level: 2 }] },
      { slug: 'faq', title: 'FAQ', description: 'Frequently asked questions', icon: '❓',
        headings: [{ id: 'what', label: 'What is a flash loan?', level: 2 }, { id: 'difference', label: 'How is VAEA different?', level: 2 }, { id: 'devnet', label: 'Can I use devnet?', level: 2 }, { id: 'cost', label: 'How much does it cost?', level: 2 }, { id: 'sdk', label: 'Which SDK?', level: 2 }] },
    ],
  },
  {
    title: 'Coming Soon',
    pages: [
      { slug: 'zero-cpi-integration', title: 'Zero-CPI Integration', description: 'Protocol-level flash loan verification without CPI overhead', icon: '🔌',
        headings: [{ id: 'overview', label: 'Overview', level: 2 }, { id: 'problem', label: 'The Problem', level: 2 }, { id: 'solution', label: 'Zero-CPI Pattern', level: 2 }, { id: 'cpi-budget', label: 'CPI Depth Comparison', level: 2 }, { id: 'usage', label: 'Integration Example', level: 2 }] },
      { slug: 'vsol-v2', title: 'vSOL — Unlimited Flash', description: 'Unlimited flash loans via synthetic mint/burn — zero congestion', icon: '✨',
        headings: [{ id: 'vision', label: 'Vision', level: 2 }, { id: 'problem', label: 'The Problem Today', level: 2 }, { id: 'solution', label: 'How vSOL Works', level: 2 }, { id: 'congestion', label: 'Zero Congestion', level: 2 }, { id: 'security', label: 'Security Model', level: 2 }, { id: 'roadmap', label: 'Roadmap', level: 2 }] },
    ],
  },
];

export const ALL_PAGES = NAV.flatMap(g => g.pages);
export const SLUGS = ALL_PAGES.map(p => p.slug);
