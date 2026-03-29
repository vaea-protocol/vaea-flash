// ═══ Documentation Content — public-facing, no internal secrets ═══

export const SECTIONS = [
  { id: 'overview', label: 'Overview', group: 'Getting Started' },
  { id: 'quickstart', label: 'Quick Start', group: 'Getting Started' },
  { id: 'architecture', label: 'Architecture', group: 'Concepts' },
  { id: 'routing', label: 'Routing Logic', group: 'Concepts' },
  { id: 'fees', label: 'Fee Model', group: 'Concepts' },
  { id: 'turbo', label: 'Turbo Mode', group: 'Features' },
  { id: 'simulate', label: 'Simulation', group: 'Features' },
  { id: 'multiflash', label: 'Multi-Token Flash', group: 'Features' },
  { id: 'profitability', label: 'Profitability Check', group: 'Features' },
  { id: 'retry', label: 'Smart Retry', group: 'Features' },
  { id: 'jito', label: 'Jito Bundles', group: 'Features' },
  { id: 'warmcache', label: 'Warm Cache', group: 'Features' },
  { id: 'feeguard', label: 'Fee Guard', group: 'Features' },
  { id: 'slippage', label: 'Auto Slippage', group: 'Features' },
  { id: 'api', label: 'REST API', group: 'Reference' },
  { id: 'sdk', label: 'SDK Reference', group: 'Reference' },
  { id: 'usecases', label: 'Use Cases', group: 'Guides' },
  { id: 'errors', label: 'Error Codes', group: 'Reference' },
  { id: 'faq', label: 'FAQ', group: 'Support' },
];

export const OVERVIEW_CONTENT = {
  tagline: 'The universal flash loan layer for Solana',
  intro: `VAEA Flash lets you borrow any SPL token — SOL, stablecoins, LSTs, mid-caps — in a single atomic transaction, with no collateral required. One SDK call, any token, from 0.03% fee, ~100ms latency.`,
  whyExists: [
    { problem: 'Existing flash loans only cover SOL, USDC, USDT', solution: 'VAEA covers 26 tokens including LSTs, majors, stablecoins, and mid-caps' },
    { problem: 'Each protocol has its own incompatible SDK', solution: 'One SDK, one line of code, any token' },
    { problem: 'No flash loans for mSOL, JitoSOL, BONK, TRUMP...', solution: 'Synthetic routing via Sanctum & Jupiter' },
    { problem: 'TX construction requires RPC lookups (~300ms)', solution: 'Turbo Mode: local build in ~91µs, zero HTTP calls' },
    { problem: 'If a source is full, there\'s no fallback', solution: 'Automatic multi-protocol fallback' },
  ],
  audiences: [
    { icon: '🤖', title: 'Liquidation Bots', desc: 'Flash loan collateral tokens (JitoSOL, mSOL) to liquidate lending positions without owning the asset. ~100ms latency with Turbo Mode.' },
    { icon: '📊', title: 'Arbitrage Bots', desc: 'Instant capital on any token pair. Flash, arb, repay — zero upfront capital. Multi-token flash for cross-pair strategies.' },
    { icon: '🏗️', title: 'DeFi Protocols', desc: 'Integrate VAEA Flash to offer leverage, looping, or collateral swaps to your users.' },
    { icon: '👨‍💻', title: 'Solo Developers', desc: 'Build with flash loans in minutes. No routing code, no pool management, no RPC lookups.' },
  ],
  stats: [
    { label: 'Supported Tokens', value: '27' },
    { label: 'Protocols Integrated', value: '4' },
    { label: 'SDKs Available', value: '3' },
    { label: 'Min Fee (Direct)', value: '0.03%' },
  ],
};

export const QUICKSTART = {
  install: {
    typescript: 'npm install @vaea/flash @solana/web3.js',
    rust: 'cargo add vaea-flash-sdk',
    python: 'pip install vaea-flash',
  },
  firstLoan: {
    typescript: `import { VaeaFlash } from '@vaea/flash';
import { Connection, Keypair } from '@solana/web3.js';

// 1. Initialize client
const flash = new VaeaFlash({
  connection: new Connection('https://api.mainnet-beta.solana.com'),
  wallet: Keypair.fromSecretKey(/* your key */),
  source: 'sdk',  // 0.03% fee
});

// 2. Execute flash loan (~100ms with Turbo)
const sig = await flash.executeLocal({
  token: 'SOL',
  amount: 1000,          // borrow 1,000 SOL
  onFunds: async (ixs) => {
    // Your logic here: arb, liquidation, swap...
    ixs.push(myArbitrageInstruction);
    return ixs;
  },
});

console.log('Transaction:', sig);
flash.destroy();`,
    rust: `use vaea_flash_sdk::{VaeaFlash, BorrowParams};

// 1. Initialize client
let flash = VaeaFlash::with_rpc(
    "https://api.vaea.fi",
    "https://api.mainnet-beta.solana.com",
    &payer,
)?;

// 2. Execute flash loan
let sig = flash.execute(BorrowParams {
    token: "SOL".into(),
    amount: 1000.0,
    instructions: vec![my_arb_ix],
    slippage_bps: Some(50),
    max_fee_bps: Some(10),
}).await?;

println!("Transaction: {}", sig);`,
    python: `from vaea_flash import VaeaFlash, VaeaConfig

# 1. Initialize client
async with VaeaFlash(VaeaConfig(
    api_url="https://api.vaea.fi",
    source="sdk",
)) as flash:
    # 2. Get a quote first
    quote = await flash.get_quote("SOL", 1000)
    print(f"Fee: {quote.fee_breakdown.total_fee_pct}%")

    # 3. Execute flash loan
    ixs = await flash.borrow(
        token="SOL",
        amount=1000,
        user_pubkey=str(wallet.pubkey()),
        user_instructions=[my_arb_ix],
    )`,
  },
  advancedConfig: {
    typescript: `// Turbo Mode + Jito: ~100ms, zero API, private bundle
const sig = await flash.executeLocal({
  token: 'mSOL',
  amount: 500,
  onFunds: async (ixs) => {
    ixs.push(myLiquidationIx);
    return ixs;
  },
}, {
  sendVia: 'jito',
  jito: { tip: 'competitive', region: 'amsterdam' },
  retry: { maxAttempts: 3, strategy: 'adaptive' },
  priorityMicroLamports: 50_000,
});

// Or use localBuild() for full TX control
import { localBuild } from '@vaea/flash';

const { beginFlash, endFlash } = localBuild({
  payer: wallet.publicKey,
  token: 'SOL',
  amount: 1000,
});
// beginFlash + your IXs + endFlash = complete TX`,
    rust: `// Advanced: simulate before sending
let sim = flash.simulate(&BorrowParams {
    token: "mSOL".into(),
    amount: 500.0,
    instructions: vec![liquidation_ix],
    slippage_bps: Some(50),
    max_fee_bps: Some(15),
}).await?;

if sim.success {
    println!("CU used: {}", sim.compute_units);
    let sig = flash.execute(params).await?;
}`,
    python: `# Check profitability before executing
result = await flash.is_profitable(
    token="SOL",
    amount=1000,
    expected_revenue=0.5,  # expected profit in SOL
    jito_tip=0.01,
    priority_fee=0.001,
)
if result.recommendation == "send":
    ixs = await flash.borrow(
        token="SOL",
        amount=1000,
        user_pubkey=str(wallet.pubkey()),
        user_instructions=[my_arb_ix],
    )`,
  },
};

export const TOKENS_DIRECT = [
  { symbol: 'SOL', source: 'Marginfi', fee: '0%', fallback: 'Kamino → Save' },
  { symbol: 'USDC', source: 'Marginfi', fee: '0%', fallback: 'Kamino → Save' },
  { symbol: 'USDT', source: 'Marginfi', fee: '0%', fallback: 'Save' },
  { symbol: 'cbBTC', source: 'Kamino', fee: '0%', fallback: '—' },
  { symbol: 'JupSOL', source: 'Marginfi', fee: '0%', fallback: '—' },
  { symbol: 'JitoSOL', source: 'Marginfi', fee: '0%', fallback: '—' },
  { symbol: 'JUP', source: 'Marginfi', fee: '0%', fallback: '—' },
  { symbol: 'JLP', source: 'Kamino', fee: '0%', fallback: '—' },
];

export const TOKENS_SYNTHETIC = [
  // LSTs via Sanctum
  { symbol: 'mSOL', swap: 'Sanctum', slippage: '~0.03%', totalFee: '~0.09%' },
  { symbol: 'bSOL', swap: 'Sanctum', slippage: '~0.03%', totalFee: '~0.09%' },
  { symbol: 'INF', swap: 'Sanctum', slippage: '~0.02%', totalFee: '~0.08%' },
  { symbol: 'laineSOL', swap: 'Sanctum', slippage: '~0.05%', totalFee: '~0.11%' },
  // Majors via Jupiter
  { symbol: 'TRUMP', swap: 'Jupiter', slippage: '~0.1%', totalFee: '~0.16%' },
  { symbol: 'PENGU', swap: 'Jupiter', slippage: '~0.1%', totalFee: '~0.16%' },
  // Mid-caps via Jupiter
  { symbol: 'BONK', swap: 'Jupiter', slippage: '~0.1-0.5%', totalFee: '~0.16%' },
  { symbol: 'WIF', swap: 'Jupiter', slippage: '~0.1-0.5%', totalFee: '~0.16%' },
  { symbol: 'RAY', swap: 'Jupiter', slippage: 'variable', totalFee: 'variable' },
  { symbol: 'HNT', swap: 'Jupiter', slippage: 'variable', totalFee: 'variable' },
  { symbol: 'RNDR', swap: 'Jupiter', slippage: 'variable', totalFee: 'variable' },
  { symbol: 'JITO', swap: 'Jupiter', slippage: 'variable', totalFee: 'variable' },
  { symbol: 'KMNO', swap: 'Jupiter', slippage: 'variable', totalFee: 'variable' },
  // Stablecoins via Jupiter
  { symbol: 'PYUSD', swap: 'Jupiter', slippage: '~0.01%', totalFee: '~0.07%' },
  { symbol: 'USDS', swap: 'Jupiter', slippage: '~0.01%', totalFee: '~0.07%' },
  { symbol: 'USD1', swap: 'Jupiter', slippage: '~0.01%', totalFee: '~0.07%' },
  { symbol: 'USDG', swap: 'Jupiter', slippage: '~0.01%', totalFee: '~0.07%' },
  { symbol: 'EURC', swap: 'Jupiter', slippage: '~0.02%', totalFee: '~0.08%' },
];

// ═══════════════════════════════════════════════════════════
//  Feature Documentation — each feature is a full doc page
//  Structure: sections[] (what/when/how), code {ts/rust/py},
//  useCases[], tips[]
// ═══════════════════════════════════════════════════════════

export const TURBO_MODE = {
  title: 'Turbo Mode — Local Instruction Builder',
  tagline: 'Build flash loan instructions in ~91 microseconds. Zero API calls. Zero HTTP. Works offline.',
  sections: [
    { heading: 'What is Turbo Mode?', paragraphs: [
      'Turbo Mode builds your begin_flash and end_flash instructions 100% locally using a hardcoded token registry and deterministic PDA derivation. No API call, no HTTP, no network dependency.',
      'Standard flash loan SDKs need 2–4 RPC calls before you can even construct the transaction. VAEA\'s Turbo Mode does it in 91 microseconds — that\'s 10,000× faster than an HTTP round-trip.',
    ]},
    { heading: 'When to use it', paragraphs: [
      'Use Turbo Mode for any latency-sensitive application: MEV bots, arbitrage, liquidation bots, or any scenario where milliseconds matter.',
      'Turbo Mode is the default recommendation for all new integrations. Standard mode (via API) is only needed if you need server-side fee validation via maxFeeBps.',
    ]},
    { heading: 'How it works', paragraphs: [
      '1. localBuild() computes PDA addresses from seeds ["flash", payer, token_mint] — pure math, no network.',
      '2. It constructs begin_flash and end_flash instructions with hardcoded discriminators.',
      '3. executeLocal() wraps this: localBuild → getBlockhash (only RPC call) → sign → send.',
      'Critical path: localBuild (<1ms) → getBlockhash (~50ms) → sendTransaction (~50ms) = ~100ms total.',
    ]},
  ],
  comparison: [
    { sdk: 'VAEA Turbo', calls: '0 HTTP + 2 RPC', time: '~100ms' },
    { sdk: 'VAEA Standard', calls: '1 HTTP + 2 RPC', time: '~180ms' },
    { sdk: 'Jupiter Perps', calls: '2-3 RPC', time: '~200-400ms' },
    { sdk: 'Marginfi', calls: '3-4 RPC', time: '~300-500ms' },
  ],
  code: {
    typescript: `// Method 1: executeLocal() — simplest, recommended
const sig = await flash.executeLocal({
  token: 'SOL',
  amount: 1000,
  onFunds: async (ixs) => {
    ixs.push(myArbitrageInstruction);
    return ixs;
  },
});

// Method 2: localBuild() — full control
import { localBuild } from '@vaea/flash';
const { beginFlash, endFlash, expectedFeeNative } = localBuild({
  payer: wallet.publicKey, token: 'SOL', amount: 1000,
});
const tx = new Transaction().add(beginFlash, myArbIx, endFlash);`,
    rust: `// Turbo mode — coming soon in Rust SDK
let sig = flash.execute(BorrowParams {
    token: "SOL".into(), amount: 1000.0,
    instructions: vec![my_arb_ix],
    ..Default::default()
}).await?;`,
    python: `# Turbo mode — coming soon in Python SDK
ixs = await flash.borrow(
    token="SOL", amount=1000,
    user_pubkey=str(wallet.pubkey()),
    user_instructions=[my_arb_ix],
)`,
  },
  useCases: [
    { title: 'Arbitrage Bot', desc: 'Scan pools → detect opportunity → executeLocal() in ~100ms before the price moves.' },
    { title: 'Liquidation Bot', desc: 'Monitor unhealthy accounts → flash borrow collateral token → liquidate → repay.' },
    { title: 'Offline TX Prep', desc: 'Use localBuild() to pre-build transactions during websocket event processing, then sign+send when ready.' },
  ],
  tips: [
    'executeLocal() automatically uses the VAEA Address Lookup Table for ~124 bytes savings per TX.',
    'The token registry is hardcoded — update the SDK version when VAEA adds new tokens.',
    'Combine with sendVia: "jito" for turbo build + Jito bundle privacy.',
  ],
};

export const SIMULATE = {
  title: 'Simulation — Dry-Run Before Sending',
  tagline: 'Test your flash loan transaction without risking any SOL.',
  sections: [
    { heading: 'What is Simulation?', paragraphs: [
      'The simulate() method uses Solana\'s simulateTransaction with sigVerify: false to test your complete flash loan flow. You get exact compute unit consumption, full program logs, and error details — all without sending a real transaction.',
    ]},
    { heading: 'When to use it', paragraphs: [
      'Use simulate() when developing a new strategy, debugging a failing transaction, or validating instructions before committing real SOL.',
      'Particularly useful for: testing complex multi-instruction flows, measuring exact CU for compute budget, and catching errors before they cost you fees.',
    ]},
    { heading: 'How it works', paragraphs: [
      '1. Builds the complete flash loan transaction (same as execute).',
      '2. Sends to simulateTransaction with sigVerify: false — no signature needed.',
      '3. Returns: success/failure, compute units consumed, full logs, and error details.',
      'Simulation is free — you never pay, even if it fails.',
    ]},
  ],
  code: {
    typescript: `const result = await flash.simulate({
  token: 'SOL',
  amount: 1000,
  onFunds: async (ixs) => {
    ixs.push(myArbIx);
    return ixs;
  },
});

console.log(result.success);       // true/false
console.log(result.computeUnits);  // exact CU consumed
console.log(result.logs);          // full program logs
if (result.error) console.log(result.error);`,
    rust: `let sim = flash.simulate(&BorrowParams {
    token: "SOL".into(), amount: 1000.0,
    instructions: vec![my_arb_ix],
    ..Default::default()
}).await?;

if sim.success {
    println!("CU used: {}", sim.compute_units);
    let sig = flash.execute(params).await?;
}`,
    python: `result = await flash.simulate(
    token="SOL", amount=1000,
    user_pubkey=str(wallet.pubkey()),
    user_instructions=[my_arb_ix],
)
print(f"Success: {result.success}, CU: {result.compute_units}")`,
  },
  useCases: [
    { title: 'Strategy Testing', desc: 'Validate a new arbitrage strategy without risking SOL. Check CU consumption to optimize compute budget.' },
    { title: 'Debug Failing TX', desc: 'When execute() throws an error, switch to simulate() to get full logs and pinpoint the failing instruction.' },
    { title: 'CI/CD Pipeline', desc: 'Include simulate() in your test suite to catch regressions before deployment.' },
  ],
  tips: [
    'sigVerify: false means you don\'t need the actual signer — useful for testing with public keys only.',
    'Simulation uses current on-chain state — results may differ if state changes between sim and real TX.',
    'Combine with isProfitable() to validate both technical correctness and economic viability.',
  ],
};

export const MULTI_FLASH = {
  title: 'Multi-Token Flash Loans',
  tagline: 'Borrow multiple tokens atomically in a single transaction.',
  sections: [
    { heading: 'What are Multi-Token Flash Loans?', paragraphs: [
      'VAEA allows you to borrow multiple different tokens in the same transaction using a nested sandwich pattern.',
      'Each token gets its own PDA with unique seeds ["flash", payer, token_mint], so there are no collisions between simultaneous loans.',
    ]},
    { heading: 'When to use it', paragraphs: [
      'Use borrowMulti() for strategies that require capital in multiple assets simultaneously: cross-pair arbitrage, multi-collateral liquidations, or complex DeFi compositions.',
    ]},
    { heading: 'Transaction Structure', paragraphs: [
      'The SDK builds a nested sandwich: begin_flash(SOL) → begin_flash(USDC) → [your logic] → end_flash(USDC) → end_flash(SOL).',
      'The innermost end_flash is verified first, then the outer one. All must succeed or the entire TX reverts.',
    ]},
  ],
  pattern: 'begin_flash(SOL) → begin_flash(USDC) → [your logic] → end_flash(USDC) → end_flash(SOL)',
  code: {
    typescript: `const ixs = await flash.borrowMulti({
  loans: [
    { token: 'SOL', amount: 1000 },
    { token: 'USDC', amount: 50000 },
  ],
  onFunds: async (ixs) => {
    // You now have both SOL and USDC
    ixs.push(myTriangularArbIx);
    return ixs;
  },
});`,
    rust: `let ixs = flash.borrow_multi(vec![
    BorrowParams { token: "SOL".into(), amount: 1000.0, ..Default::default() },
    BorrowParams { token: "USDC".into(), amount: 50000.0, ..Default::default() },
], vec![my_triangular_arb_ix]).await?;`,
    python: `ixs = await flash.borrow_multi(
    loans=[
        {"token": "SOL", "amount": 1000},
        {"token": "USDC", "amount": 50000},
    ],
    user_instructions=[my_triangular_arb_ix],
)`,
  },
  useCases: [
    { title: 'Triangular Arbitrage', desc: 'Borrow SOL + USDC, swap through 3 pools (SOL→BONK→USDC→SOL), profit from price discrepancies.' },
    { title: 'Multi-Collateral Liquidation', desc: 'Borrow JitoSOL + mSOL to liquidate a position with multiple collateral types.' },
    { title: 'Portfolio Rebalancing', desc: 'Flash borrow multiple tokens to rebalance a position atomically — no partial fills.' },
  ],
  tips: [
    'Each additional token adds ~23,000 CU. Stay under Solana\'s 1.4M CU limit.',
    'The end_flash order must be the reverse of begin_flash (LIFO pattern).',
    'Multi-flash works with both direct and synthetic tokens. Mixing is supported.',
  ],
};

export const PROFITABILITY = {
  title: 'Profitability Calculator',
  tagline: 'Know if your strategy is profitable before sending the transaction.',
  sections: [
    { heading: 'What is the Profitability Calculator?', paragraphs: [
      'isProfitable() fetches a real-time fee quote and calculates your net profit after all costs: VAEA fee, swap fees, network fee, priority fee, and Jito tip.',
      'Returns a clear recommendation: "send" (profit > 2× costs), "wait" (marginal), or "abort" (unprofitable).',
    ]},
    { heading: 'When to use it', paragraphs: [
      'Call isProfitable() before every flash loan in your bot. It prevents sending unprofitable transactions.',
      'Particularly important for synthetic routes (higher fees) and high-congestion periods (expensive priority fees).',
    ]},
    { heading: 'Cost Breakdown', paragraphs: [
      'Factors in: VAEA fee (0.03%), swap fees (synthetic only), Solana base fee (~5000 lamports), priority fee, and Jito tip.',
      'All costs are denominated in the borrowed token for easy comparison with your expected revenue.',
    ]},
  ],
  code: {
    typescript: `const result = await flash.isProfitable({
  token: 'SOL',
  amount: 1000,
  expectedRevenue: 0.5,    // expected profit in SOL
  jitoTip: 0.01,           // Jito tip (optional)
  priorityFee: 0.001,      // priority fee (optional)
});

console.log(result.profitable);      // true
console.log(result.netProfit);       // 0.189 SOL
console.log(result.recommendation);  // 'send' | 'wait' | 'abort'
console.log(result.breakdown);       // detailed cost breakdown`,
    rust: `let result = flash.is_profitable(ProfitabilityParams {
    token: "SOL".into(), amount: 1000.0,
    expected_revenue: 0.5,
    jito_tip: Some(0.01),
    priority_fee: Some(0.001),
}).await?;

if result.recommendation == "send" {
    let sig = flash.execute(params).await?;
}`,
    python: `result = await flash.is_profitable(
    token="SOL", amount=1000,
    expected_revenue=0.5,
    jito_tip=0.01, priority_fee=0.001,
)
if result.recommendation == "send":
    ixs = await flash.borrow(...)`,
  },
  useCases: [
    { title: 'Arb Bot Decision Loop', desc: 'scan → detect spread → isProfitable() → if "send": execute, if "abort": skip.' },
    { title: 'Fee Spike Protection', desc: 'During congestion, prevents trades where priority fees eat your profit.' },
    { title: 'Route Comparison', desc: 'Compare profitability across different tokens/amounts to find the best strategy.' },
  ],
  tips: [
    '"send" = profit > 2× total costs. This margin accounts for price movement.',
    '"wait" = profitable but marginal. Consider increasing priorityFee for faster landing.',
    'The calculator calls /v1/quote under the hood — factor in ~5ms in your latency budget.',
  ],
};

export const SMART_RETRY = {
  title: 'Smart Retry',
  tagline: 'Automatic recovery from blockhash expiry and network congestion.',
  sections: [
    { heading: 'What is Smart Retry?', paragraphs: [
      'The SDK classifies errors into three categories: expired blockhash (rebuild TX), congestion (escalate priority fee ×1.5), and program errors (never retry — your logic has a bug).',
    ]},
    { heading: 'When to use it', paragraphs: [
      'Smart Retry is enabled by default. Customize with the retry config object.',
      'Disable with strategy: "none" for time-sensitive MEV where stale opportunities should not be retried.',
    ]},
    { heading: 'Error Classification', paragraphs: [
      'Blockhash Expired: TX took too long. SDK rebuilds with a fresh blockhash and resends.',
      'Congestion: TX dropped due to low priority. SDK multiplies priority fee by 1.5× and resends after 400ms.',
      'Program Error: Your instructions contain a bug. Never retried — fix your code.',
    ]},
  ],
  code: {
    typescript: `const sig = await flash.executeLocal({
  token: 'SOL',
  amount: 1000,
  onFunds: async (ixs) => {
    ixs.push(myArbIx);
    return ixs;
  },
}, {
  retry: {
    maxAttempts: 3,
    strategy: 'adaptive',       // 'adaptive' | 'none'
    onRetry: (attempt, reason) => {
      console.log("Retry #" + attempt + ": " + reason);
    },
  },
  priorityMicroLamports: 1000,  // 1000 → 1500 → 2250
});

// Disable retry
await flash.executeLocal(params, {
  retry: { maxAttempts: 1, strategy: 'none' },
});`,
    rust: `let sig = flash.execute(BorrowParams {
    token: "SOL".into(), amount: 1000.0,
    instructions: vec![my_arb_ix],
    ..Default::default()
}).await?; // retries on network errors`,
    python: `ixs = await flash.borrow(
    token="SOL", amount=1000,
    user_pubkey=str(wallet.pubkey()),
    user_instructions=[my_arb_ix],
)`,
  },
  errorClasses: [
    { type: 'Blockhash Expired', action: 'Rebuild TX with fresh blockhash', retried: true },
    { type: 'Congestion', action: 'Escalate priority fee ×1.5, wait 400ms', retried: true },
    { type: 'Program Error', action: 'Never retried — fix your code', retried: false },
  ],
  useCases: [
    { title: 'High-Frequency Bot', desc: 'maxAttempts: 2 with adaptive. Quick recovery without stale opportunities.' },
    { title: 'Reliable Execution', desc: 'maxAttempts: 5 for maximum reliability. Each retry escalates priority fee.' },
    { title: 'Time-Critical MEV', desc: 'strategy: "none". Single attempt — if it fails, the opportunity is stale.' },
  ],
  tips: [
    'Default config (3 attempts, adaptive) works well for ~90% of use cases.',
    'Priority fee escalation: 1000 → 1500 → 2250 micro-lamports per CU.',
    'Smart retry also works with sendVia: "jito" — escalates tip on failure.',
  ],
};

export const JITO_BUNDLES = {
  title: 'Jito Bundle Integration',
  tagline: 'Send flash loans via Jito Block Engine for bundle privacy and atomic execution.',
  sections: [
    { heading: 'What are Jito Bundles?', paragraphs: [
      'Jito is a Block Engine for Solana that lets you submit transactions as private "bundles". Your TX is never in the public mempool — it goes directly to Jito validators.',
      'VAEA integrates Jito natively: add 2 options to any executeLocal() call.',
    ]},
    { heading: 'When to use it', paragraphs: [
      'Use Jito bundles when you need privacy: your flash loan + arb/liquidation should not be visible to other bots before it lands.',
    ]},
    { heading: 'How tips work', paragraphs: [
      'Jito requires a SOL tip (SystemProgram.transfer to a Jito tip account) as the last instruction. VAEA auto-calculates this based on your chosen strategy.',
      'If the bundle fails, you don\'t pay the tip — it\'s the last instruction and only executes on success.',
    ]},
    { heading: 'Limitations', paragraphs: [
      'Jito does NOT have a devnet block engine. Testing is mainnet-only.',
      'Landing is NOT guaranteed — Jito is a competitive auction.',
      'Bundles are private from the public mempool, but not invulnerable to all MEV.',
    ]},
  ],
  code: {
    typescript: `const sig = await flash.executeLocal({
  token: 'SOL',
  amount: 1000,
  onFunds: async (ixs) => {
    ixs.push(myArbitrageInstruction);
    return ixs;
  },
}, {
  sendVia: 'jito',
  jito: {
    tip: 'competitive',   // 'min' | 'competitive' | 'aggressive' | number
    region: 'amsterdam',  // 'mainnet' | 'amsterdam' | 'ny' | 'tokyo'
  },
});

// Exact tip amount
await flash.executeLocal(params, {
  sendVia: 'jito',
  jito: { tip: 50_000 },  // 50,000 lamports
});`,
    rust: `// Jito integration — coming soon in Rust SDK`,
    python: `# Jito integration — coming soon in Python SDK`,
  },
  tipStrategies: [
    { strategy: "'min'", amount: '~1–5K lamports', use: 'Low-value, testing' },
    { strategy: "'competitive'", amount: '~10–50K lamports', use: 'Recommended for most bots' },
    { strategy: "'aggressive'", amount: '100K+ lamports', use: 'High-value liquidations' },
    { strategy: 'number', amount: 'Exact lamports', use: 'Full manual control' },
  ],
  gives: [
    'Bundle privacy — TX not in public mempool',
    'Auto-calculated tip based on Jito tip floor',
    'Smart retry with tip escalation on failure',
    'Zero new npm dependencies — pure fetch()',
    '6 Block Engine regions for lowest latency',
  ],
  doesNot: [
    'Guarantee landing in X blocks — tip is competitive',
    'Provide full MEV protection — bundles are private, not invulnerable',
    'Work on devnet — Jito is mainnet only',
  ],
  useCases: [
    { title: 'Private Liquidation', desc: 'Flash borrow JitoSOL → liquidate → repay. No other bot can see your TX.' },
    { title: 'Stealth Arbitrage', desc: 'Detect discrepancy → execute via Jito → extract value privately.' },
    { title: 'High-Priority Flash', desc: 'Use aggressive tip for critical time-sensitive operations.' },
  ],
  tips: [
    'Start with "competitive" tip and adjust based on landing rate.',
    'Use closest region to your RPC node for lowest latency.',
    'Combine isProfitable() + Jito: check profitability BEFORE paying tip.',
    'Jito module is lazy-loaded — zero overhead if you don\'t use it.',
  ],
};

export const WARM_CACHE = {
  title: 'Warm Cache — Background Pre-Warming',
  tagline: 'Keep capacity data hot. First getCapacity() call is instant.',
  sections: [
    { heading: 'What is Warm Cache?', paragraphs: [
      'The SDK polls /v1/capacity in the background every 2s, keeping token availability always fresh in memory.',
      'When you call getCapacity(), data returns instantly from cache instead of making a network request.',
    ]},
    { heading: 'When to use it', paragraphs: [
      'Enable preWarm for bots that need instant capacity data. Essential when reacting to external signals (websocket, Yellowstone geyser).',
    ]},
  ],
  code: {
    typescript: `const flash = new VaeaFlash({
  connection, wallet,
  preWarm: true,           // enable background polling
  refreshInterval: 2000,   // every 2s (default)
});

// First call is instant — data already cached
const capacity = await flash.getCapacity();
const solAvailable = capacity.tokens
  .find(t => t.symbol === 'SOL')?.max_amount;

flash.destroy();  // cleanup background poller`,
    rust: `// Warm cache — coming soon in Rust SDK`,
    python: `# Warm cache — coming soon in Python SDK`,
  },
  tips: [
    'Call flash.destroy() when done to stop the background poller.',
    'Default 2s interval matches the backend scanner frequency.',
  ],
};

export const FEE_GUARD = {
  title: 'Fee Guard — Auto-Rejection',
  tagline: 'Reject transactions where the fee exceeds your threshold.',
  sections: [
    { heading: 'What is Fee Guard?', paragraphs: [
      'Set maxFeeBps on any borrow or execute call. If the fee exceeds your threshold, the SDK throws VaeaError("FEE_TOO_HIGH") before sending.',
      'Protects against unexpected fee spikes, especially on synthetic routes.',
    ]},
    { heading: 'When to use it', paragraphs: [
      'Use maxFeeBps on every production call. Set it based on your strategy\'s profit margin.',
    ]},
  ],
  code: {
    typescript: `const sig = await flash.execute({
  token: 'mSOL',
  amount: 500,
  onFunds: async (ixs) => { ixs.push(myIx); return ixs; },
  maxFeeBps: 15,  // reject if fee > 0.15%
});
// Throws VaeaError('FEE_TOO_HIGH') if exceeded

// In Turbo mode, use isProfitable() instead:
const profit = await flash.isProfitable({
  token: 'mSOL', amount: 500, expectedRevenue: 0.1,
});
if (profit.recommendation !== 'abort') {
  await flash.executeLocal({ ... });
}`,
    rust: `let sig = flash.execute(BorrowParams {
    token: "mSOL".into(), amount: 500.0,
    max_fee_bps: Some(15),
    ..Default::default()
}).await?;`,
    python: `ixs = await flash.borrow(
    token="mSOL", amount=500,
    max_fee_bps=15,
)`,
  },
  tips: [
    'Recommended: 5 bps for direct routes, 20 bps for synthetic routes.',
    'In Turbo mode, use isProfitable() instead (no API call for fee check).',
  ],
};

export const SLIPPAGE_CONTROL = {
  title: 'Auto Slippage',
  tagline: 'Calculate optimal slippage based on route type and market conditions.',
  sections: [
    { heading: 'What is Auto Slippage?', paragraphs: [
      'calculateSlippageBps() computes optimal slippage tolerance based on: risk preference, route type (direct vs synthetic), and current price impact.',
    ]},
    { heading: 'Slippage Modes', paragraphs: [
      '"auto" — Balanced. Adapts to route type. Recommended for most strategies.',
      '"aggressive" — Minimal tolerance. Tight pricing, but TX may fail under volatility.',
      '"safe" — Wide tolerance. For large amounts or volatile tokens.',
      'number — Exact bps value for full manual control.',
    ]},
  ],
  code: {
    typescript: `import { calculateSlippageBps } from '@vaea/flash';

// Auto — balanced
calculateSlippageBps('auto', 'synthetic', 0.05);   // → 45 bps

// Aggressive — tight
calculateSlippageBps('aggressive', 'direct', 0.01); // → 5 bps

// Safe — wide tolerance
calculateSlippageBps('safe', 'synthetic', 0.5);      // → 150 bps

// Exact — manual
calculateSlippageBps(25, 'direct', 0);               // → 25 bps`,
    rust: `use vaea_flash_sdk::calculate_slippage_bps;
let bps = calculate_slippage_bps("auto", "synthetic", 0.05);`,
    python: `from vaea_flash import calculate_slippage_bps
bps = calculate_slippage_bps("auto", "synthetic", 0.05)`,
  },
  tips: [
    'Direct routes: slippage is essentially 0. Use "auto" or "aggressive".',
    'Volatile tokens (BONK, WIF): use "safe" or 100+ bps manually.',
    'Slippage only applies to synthetic routes — direct routes borrow at face value.',
  ],
};

export const API_ENDPOINTS = [
  {
    method: 'GET', path: '/v1/capacity',
    desc: 'Returns real-time borrowing capacity for all 26 tokens. Refreshes every 2s.',
    params: [],
    response: `{
  "tokens": [{
    "symbol": "SOL", "name": "Solana",
    "route_type": "direct", "source_protocol": "marginfi",
    "max_amount": 245000, "max_amount_usd": 36750000,
    "fee_sdk": { "bps": 3, "pct": 0.03, "total_pct": 0.03 },
    "status": "available"
  }],
  "updated_at": 1711533600
}`,
  },
  {
    method: 'GET', path: '/v1/quote',
    desc: 'Fee quote for a token and amount. Returns exact fee breakdown and route details.',
    params: [
      { name: 'token', type: 'string', required: true, desc: 'Token symbol (SOL, mSOL, TRUMP...)' },
      { name: 'amount', type: 'number', required: true, desc: 'Borrow amount in token units' },
      { name: 'source', type: 'string', required: false, desc: '"sdk" (0.03%) or "ui" (0.05%)' },
    ],
    response: `{
  "token": "mSOL", "amount_requested": 1000,
  "route": { "type": "synthetic", "steps": [
    { "action": "borrow", "protocol": "marginfi", "token": "SOL" },
    { "action": "swap", "protocol": "sanctum", "token": "mSOL" }
  ]},
  "fee_breakdown": { "source_fee": 0, "swap_in_fee": 0.03, "vaea_fee": 0.03, "total_fee_pct": 0.09 },
  "valid_for_slots": 150
}`,
  },
  {
    method: 'POST', path: '/v1/build',
    desc: 'Build flash loan instructions (prefix + suffix). Pure CPU, zero RPC during build.',
    params: [
      { name: 'token', type: 'string', required: true, desc: 'Token symbol' },
      { name: 'amount', type: 'number', required: true, desc: 'Borrow amount' },
      { name: 'user_pubkey', type: 'string', required: true, desc: 'Wallet address (base58)' },
      { name: 'source', type: 'string', required: false, desc: '"sdk" or "ui"' },
      { name: 'slippage_bps', type: 'number', required: false, desc: 'Max slippage (default: 50)' },
      { name: 'max_fee_bps', type: 'number', required: false, desc: 'Reject if fee exceeds this' },
    ],
    response: `{
  "prefix_instructions": [{ "program_id": "...", "data": "...", "accounts": [...] }],
  "suffix_instructions": [{ "program_id": "...", "data": "...", "accounts": [...] }],
  "lookup_tables": ["DjncKSi9KqtnFx6hFYa7ARmwJ7B4Y7UH3XpR2XEuXNJr"],
  "estimated_fee_lamports": 300000, "valid_for_slots": 150
}`,
  },
  {
    method: 'GET', path: '/v1/health',
    desc: 'System health check — backend status and upstream protocol availability.',
    params: [],
    response: `{
  "status": "operational", "timestamp": 1711533600,
  "components": { "rpc": "ok", "cache": "ok" },
  "sources": { "marginfi": "ok", "kamino": "ok", "save": "degraded" }
}`,
  },
];

export const ERRORS = [
  { code: 'INSUFFICIENT_LIQUIDITY', desc: 'Amount exceeds available pool capacity.', fix: 'Reduce amount or try another token. Check /v1/capacity.' },
  { code: 'TOKEN_NOT_SUPPORTED', desc: 'Token not in VAEA registry (27 supported).', fix: 'Check supported tokens list. Case-sensitive.' },
  { code: 'FEE_TOO_HIGH', desc: 'Fee exceeds your maxFeeBps threshold.', fix: 'Increase maxFeeBps or use a direct route (lower fees).' },
  { code: 'SLIPPAGE_EXCEEDED', desc: 'Swap slippage exceeded tolerance.', fix: 'Increase slippage_bps or reduce amount. Use calculateSlippageBps().' },
  { code: 'TX_EXPIRED', desc: 'Blockhash is stale.', fix: 'Rebuild with fresh quote. Smart Retry auto-recovers this.' },
  { code: 'REPAY_FAILED', desc: 'Repayment amount doesn\'t match borrowed + fee.', fix: 'Ensure your logic returns exact borrowed amount.' },
  { code: 'ROUTE_UNAVAILABLE', desc: 'All source protocols temporarily unavailable.', fix: 'Retry in a few seconds. Check /v1/health.' },
  { code: 'SIMULATION_FAILED', desc: 'TX simulation failed.', fix: 'Check your instructions. Use simulate() to debug.' },
  { code: 'API_ERROR', desc: 'Missing wallet, invalid config.', fix: 'Verify VaeaFlash config. Check wallet and connection.' },
  { code: 'NETWORK_ERROR', desc: 'Failed to reach VAEA API.', fix: 'Check network. Use executeLocal() for zero API dependency.' },
];

export const FAQ = [
  { q: 'Do I need collateral?', a: 'No. Flash loans are uncollateralized. You borrow and repay within the same atomic transaction.' },
  { q: 'What if my TX fails mid-execution?', a: 'Nothing happens. Solana transactions are atomic — everything reverts. You only pay the base TX fee.' },
  { q: 'How is VAEA different from Jupiter Flash Loan?', a: 'Jupiter only supports tokens on Jupiter Lend. VAEA covers 26 tokens via synthetic routing — LSTs, majors, stablecoins, and mid-caps.' },
  { q: 'What are direct vs synthetic routes?', a: 'Direct = borrow natively (0.03% fee). Synthetic = borrow SOL, swap to target via Sanctum/Jupiter, swap back on repay (higher fee).' },
  { q: 'Can I flash multiple tokens at once?', a: 'Yes. borrowMulti() borrows multiple tokens atomically with a nested sandwich pattern.' },
  { q: 'What is Turbo Mode?', a: 'Turbo Mode builds instructions locally — no API calls. Reduces latency from ~180ms to ~100ms.' },
  { q: 'Is there a max borrow amount?', a: 'Limited by real-time pool liquidity. Check /v1/capacity. VAEA auto-splits across protocols.' },
  { q: 'Which networks?', a: 'Devnet (live) and mainnet-beta (April 2026).' },
  { q: 'Do you store user data?', a: 'No. Zero database, zero data retention. On-chain reads only.' },
  { q: 'What if the API is down?', a: 'Use executeLocal() — builds instructions locally. Only needs Solana RPC.' },
  { q: 'Can I use Jito bundles?', a: 'Yes. Add sendVia: "jito" to executeLocal(). Private bundles with auto-calculated tip.' },
  { q: 'How to test without real SOL?', a: 'simulate() for free dry-runs, or devnet with airdropped SOL.' },
];
