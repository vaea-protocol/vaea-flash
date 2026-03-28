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
    { problem: 'Existing flash loans only cover SOL, USDC, USDT', solution: 'VAEA covers 27 tokens including LSTs, majors, stablecoins, and mid-caps' },
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
  apiUrl: 'https://api.vaea.fi',
  source: 'sdk',
  connection: new Connection('https://api.mainnet-beta.solana.com'),
  wallet: Keypair.fromSecretKey(/* your key */),
});

// 2. Execute flash loan (~100ms with Turbo)
const sig = await flash.executeLocal({
  token: 'SOL',
  amount: 1000,          // borrow 1,000 SOL
  onFunds: async () => {
    // Your logic here: arb, liquidation, swap...
    return [myArbitrageInstruction];
  },
});

console.log('Transaction:', sig);`,
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
    typescript: `// Turbo Mode: ~100ms, zero API calls
const sig = await flash.executeLocal({
  token: 'mSOL',
  amount: 500,
  onFunds: async () => [myLiquidationIx],
}, {
  retry: { maxAttempts: 3, strategy: 'escalate' },
  priorityMicroLamports: 50_000,
});

// Or use localBuild() for full control
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
  { symbol: 'VIRTUAL', swap: 'Jupiter', slippage: '~0.1%', totalFee: '~0.16%' },
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

export const TURBO_MODE = {
  title: 'Turbo Mode — Local Instruction Builder',
  tagline: 'Build flash loan instructions in ~91 microseconds. Zero API calls. Zero HTTP. Works offline.',
  description: `Standard flash loan SDKs need 2–4 RPC calls before you can even sign the transaction. VAEA's Turbo Mode builds begin_flash and end_flash instructions 100% locally using a hardcoded token registry and deterministic PDA derivation. No API call, no network dependency.`,
  comparison: [
    { sdk: 'VAEA Turbo', calls: '0 HTTP + 2 RPC', time: '~100ms' },
    { sdk: 'VAEA Standard', calls: '1 HTTP + 2 RPC', time: '~180ms' },
    { sdk: 'Jupiter Perps', calls: '2-3 RPC', time: '~200-400ms' },
    { sdk: 'Marginfi', calls: '3-4 RPC', time: '~300-500ms' },
  ],
  code: `import { localBuild, TOKEN_REGISTRY } from '@vaea/flash';

// ~0.09ms — builds instructions locally, no network
const { beginFlash, endFlash, expectedFeeNative } = localBuild({
  payer: wallet.publicKey,
  token: 'SOL',
  amount: 1000,
});

// Use with executeLocal() for the fastest path
const sig = await flash.executeLocal({
  token: 'SOL',
  amount: 1000,
  onFunds: async () => [myArbIx],
});`,
};

export const SIMULATE = {
  title: 'Simulation — Dry-Run Before Sending',
  tagline: 'Test your flash loan transaction without risking any SOL.',
  description: `The simulate() method uses Solana's simulateTransaction with sigVerify: false to test your complete flash loan flow. You get exact compute unit consumption, full program logs, and error details — all without sending a real transaction.`,
  code: `const result = await flash.simulate({
  token: 'SOL',
  amount: 1000,
  onFunds: async () => [myArbIx],
});

console.log(result.success);       // true/false
console.log(result.computeUnits);  // exact CU consumed
console.log(result.logs);          // full program logs
if (result.error) {
  console.log(result.error);       // error details
}`,
};

export const MULTI_FLASH = {
  title: 'Multi-Token Flash Loans',
  tagline: 'Borrow multiple tokens atomically in a single transaction.',
  description: `VAEA uses unique PDA seeds per token (flash + payer + token_mint), enabling simultaneous flash loans on different tokens with no collision. The SDK builds a nested sandwich pattern: all borrows first, then your logic, then all repays in reverse order.`,
  pattern: 'begin_flash(SOL) → begin_flash(USDC) → [your logic] → end_flash(USDC) → end_flash(SOL)',
  code: `const ixs = await flash.borrowMulti({
  loans: [
    { token: 'SOL', amount: 1000 },
    { token: 'USDC', amount: 50000 },
  ],
  onFunds: async () => [myComplexArbIx],
});`,
};

export const PROFITABILITY = {
  title: 'Profitability Calculator',
  tagline: 'Know if your strategy is profitable before sending the transaction.',
  description: `The isProfitable() method fetches a real-time quote and calculates your net profit after all costs: VAEA fee, swap fees, network fee, priority fee, and Jito tip. Returns a clear recommendation: "send" (profit > 2x costs), "wait" (marginal), or "abort" (unprofitable).`,
  code: `const result = await flash.isProfitable({
  token: 'SOL',
  amount: 1000,
  expectedRevenue: 0.5,    // expected profit in SOL
  jitoTip: 0.01,           // Jito bundle tip
  priorityFee: 0.001,      // priority fee
});

console.log(result.profitable);      // true
console.log(result.netProfit);       // 0.189 SOL
console.log(result.recommendation);  // 'send'
console.log(result.breakdown);       // detailed cost breakdown`,
};

export const SMART_RETRY = {
  title: 'Smart Retry',
  tagline: 'Automatic recovery from blockhash expiry and network congestion.',
  description: `The SDK classifies errors into three categories: expired blockhash (rebuild TX), congestion (escalate priority fee), and program errors (never retry). This prevents wasting SOL on retrying bugs while automatically recovering from transient network issues.`,
  code: `const sig = await flash.execute({
  token: 'SOL',
  amount: 1000,
  onFunds: async () => [myArbIx],
}, {
  retry: {
    maxAttempts: 3,
    strategy: 'escalate',  // priority fee ×1.5 each retry
  },
  priorityMicroLamports: 1000,
});`,
  errorClasses: [
    { type: 'Blockhash Expired', action: 'Rebuild TX with fresh blockhash', retried: true },
    { type: 'Congestion', action: 'Escalate priority fee ×1.5, wait 400ms', retried: true },
    { type: 'Program Error', action: 'Never retried — your logic has a bug', retried: false },
  ],
};

export const API_ENDPOINTS = [
  {
    method: 'GET', path: '/v1/capacity',
    desc: 'Returns real-time borrowing capacity for all 27 supported tokens. Data refreshes every 2 seconds from on-chain liquidity scanning.',
    params: [],
    response: `{
  "tokens": [
    {
      "symbol": "SOL",
      "name": "Solana",
      "route_type": "direct",
      "source_protocol": "marginfi",
      "max_amount": 245000,
      "max_amount_usd": 36750000,
      "fee_sdk": { "bps": 3, "pct": 0.03, "total_pct": 0.03 },
      "status": "available"
    }
  ],
  "updated_at": 1711533600
}`,
  },
  {
    method: 'GET', path: '/v1/quote',
    desc: 'Get a fee quote for a specific token and amount before executing. Returns exact fee breakdown, route details, and validity window.',
    params: [
      { name: 'token', type: 'string', required: true, desc: 'Token symbol (e.g. SOL, mSOL, TRUMP)' },
      { name: 'amount', type: 'number', required: true, desc: 'Amount to borrow (in token units)' },
      { name: 'source', type: 'string', required: false, desc: '"sdk" (0.03%) or "ui" (0.05%)' },
    ],
    response: `{
  "token": "mSOL",
  "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
  "amount_requested": 1000,
  "source": "sdk",
  "route": {
    "type": "synthetic",
    "steps": [
      { "action": "borrow", "protocol": "marginfi", "token": "SOL" },
      { "action": "swap", "protocol": "sanctum", "token": "mSOL" }
    ]
  },
  "fee_breakdown": {
    "source_fee": 0, "swap_in_fee": 0.03,
    "vaea_fee": 0.03, "total_fee_pct": 0.09
  },
  "price_impact": 0.03,
  "valid_until": 1711533660,
  "valid_for_slots": 150
}`,
  },
  {
    method: 'POST', path: '/v1/build',
    desc: 'Build serialized flash loan instructions (prefix + suffix) ready to sandwich your user instructions. The backend is pure CPU — zero RPC calls during build.',
    params: [
      { name: 'token', type: 'string', required: true, desc: 'Token symbol' },
      { name: 'amount', type: 'number', required: true, desc: 'Borrow amount in token units' },
      { name: 'user_pubkey', type: 'string', required: true, desc: 'Borrower wallet address (base58)' },
      { name: 'source', type: 'string', required: false, desc: '"sdk" or "ui" (affects fee)' },
      { name: 'slippage_bps', type: 'number', required: false, desc: 'Max slippage in bps (default: 50)' },
      { name: 'max_fee_bps', type: 'number', required: false, desc: 'Reject if fee exceeds this' },
    ],
    response: `{
  "prefix_instructions": [{ "program_id": "...", "data": "...", "accounts": [...] }],
  "suffix_instructions": [{ "program_id": "...", "data": "...", "accounts": [...] }],
  "lookup_tables": ["DjncKSi9KqtnFx6hFYa7ARmwJ7B4Y7UH3XpR2XEuXNJr"],
  "estimated_fee_lamports": 300000,
  "valid_for_slots": 150
}`,
  },
  {
    method: 'GET', path: '/v1/health',
    desc: 'System health check — returns backend status and upstream protocol availability.',
    params: [],
    response: `{
  "status": "operational",
  "timestamp": 1711533600,
  "components": { "rpc": "ok", "cache": "ok" },
  "sources": {
    "marginfi": "ok",
    "kamino": "ok",
    "save": "degraded"
  }
}`,
  },
];

export const ERRORS = [
  { code: 'INSUFFICIENT_LIQUIDITY', desc: 'Requested amount exceeds available pool capacity across all sources.', fix: 'Reduce the borrow amount or try a different token. Check /v1/capacity for real-time availability.' },
  { code: 'TOKEN_NOT_SUPPORTED', desc: 'The requested token is not in the VAEA Flash registry (27 tokens supported).', fix: 'Check the supported tokens list. Use the exact symbol (case-sensitive).' },
  { code: 'FEE_TOO_HIGH', desc: 'The calculated fee exceeds the max_fee_bps parameter you specified.', fix: 'Increase maxFeeBps or switch to a token with a direct route (lower fees).' },
  { code: 'SLIPPAGE_EXCEEDED', desc: 'Swap slippage on a synthetic route exceeded the tolerance.', fix: 'Increase slippage_bps or reduce the amount (less market impact). Use calculateSlippageBps() for optimal values.' },
  { code: 'TX_EXPIRED', desc: 'The quote or built transaction has expired (blockhash is stale).', fix: 'Rebuild with a fresh quote. Use Smart Retry to auto-recover from expired blockhashes.' },
  { code: 'REPAY_FAILED', desc: 'The repayment amount doesn\'t match the borrowed amount + fee.', fix: 'Ensure your logic returns the exact borrowed amount. Check for rounding.' },
  { code: 'ROUTE_UNAVAILABLE', desc: 'All source protocols are temporarily unavailable for this token.', fix: 'Retry in a few seconds. Check /v1/health for protocol status.' },
  { code: 'SIMULATION_FAILED', desc: 'Transaction simulation failed before sending.', fix: 'Check your user instructions for errors. Use simulate() to debug.' },
  { code: 'API_ERROR', desc: 'General API error (missing wallet, invalid config).', fix: 'Verify your VaeaFlash configuration. Check that wallet and connection are set for execute().' },
  { code: 'NETWORK_ERROR', desc: 'Failed to reach the VAEA API server.', fix: 'Check your network connection. Use executeLocal() for zero API dependency.' },
];

export const FAQ = [
  { q: 'Do I need collateral to use VAEA Flash?', a: 'No. Flash loans are uncollateralized by design. You borrow and repay within the same transaction. If repayment fails, the entire transaction reverts atomically.' },
  { q: 'What happens if my transaction fails mid-execution?', a: 'Nothing. Solana transactions are atomic — either everything succeeds or everything reverts. Your borrowed tokens are returned automatically. You only pay the transaction fee.' },
  { q: 'How is VAEA different from Jupiter Flash Loan?', a: 'Jupiter only supports tokens available on Jupiter Lend (SOL, USDC, USDT, etc.). VAEA extends this to 27 tokens via synthetic routing — including LSTs (mSOL, JitoSOL, bSOL), majors (TRUMP, PENGU), stablecoins (PYUSD, USDS, EURC) and mid-caps (BONK, WIF). One SDK, any token.' },
  { q: 'What are "direct" vs "synthetic" routes?', a: 'Direct routes borrow the token natively from a lending protocol (cheapest, 0.03% fee). Synthetic routes flash borrow SOL, swap it to the target token via Sanctum or Jupiter, then swap back on repayment (slightly higher fee due to swap costs).' },
  { q: 'Can I flash loan multiple tokens in one transaction?', a: 'Yes. Use borrowMulti() to borrow multiple tokens atomically with a nested sandwich pattern. Each token has its own PDA, so there are no collisions.' },
  { q: 'What is Turbo Mode?', a: 'Turbo Mode (executeLocal / localBuild) builds flash loan instructions 100% locally — no API calls, no HTTP, no network dependency. It reduces TX construction time from ~180ms to ~100ms, which is critical for competitive bots.' },
  { q: 'Is there a maximum borrow amount?', a: 'The limit depends on real-time pool liquidity. Check /v1/capacity for current limits. For large amounts, VAEA automatically splits across multiple protocols.' },
  { q: 'Which networks are supported?', a: 'Solana mainnet-beta and devnet. Devnet is available for testing with mock liquidity.' },
  { q: 'Do you store any user data?', a: 'No. VAEA Flash has zero database and zero data retention. We read on-chain state only. No tracking, no cookies, no accounts.' },
  { q: 'What if the VAEA API is down?', a: 'Use executeLocal() or localBuild() — these build instructions 100% locally and don\'t depend on the API. Only the RPC connection to Solana is required.' },
];

export const JITO_BUNDLES = {
  title: 'Jito Bundle Integration',
  tagline: 'Send flash loans via Jito Block Engine for bundle privacy and atomic execution.',
  description: 'Add 2 lines to any executeLocal() call to send your flash loan as a Jito bundle. Your transaction is never exposed in the public mempool — it goes directly to Jito validators. Tip is auto-calculated based on the current Jito tip floor.',
  code: `const sig = await flash.executeLocal({
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
    region: 'amsterdam',  // nearest Block Engine
  },
});`,
  tipStrategies: [
    { strategy: "'min'", amount: '~1–5K lamports', use: 'Low-value opportunities, testing' },
    { strategy: "'competitive'", amount: '~10–50K lamports', use: 'Recommended for most bots' },
    { strategy: "'aggressive'", amount: '100K+ lamports', use: 'High-value liquidations, critical arbs' },
    { strategy: 'number', amount: 'Exact lamports', use: 'Full manual control' },
  ],
  gives: [
    'Bundle privacy — TX not in public mempool',
    'Auto-calculated tip based on Jito tip floor',
    'Smart retry with tip escalation on failure',
    'Zero new npm dependencies — pure fetch()',
  ],
  doesNot: [
    'Guarantee landing in X blocks — tip is competitive',
    'Provide full MEV protection — bundles are private, not invulnerable',
  ],
};
