// ═══ Documentation Content — public-facing, no internal secrets ═══

export const SECTIONS = [
  { id: 'overview', label: 'Overview', group: 'Getting Started' },
  { id: 'quickstart', label: 'Quick Start', group: 'Getting Started' },
  { id: 'architecture', label: 'Architecture', group: 'Concepts' },
  { id: 'routing', label: 'Routing Logic', group: 'Concepts' },
  { id: 'fees', label: 'Fee Model', group: 'Concepts' },
  { id: 'api', label: 'REST API', group: 'Reference' },
  { id: 'sdk', label: 'SDK Reference', group: 'Reference' },
  { id: 'usecases', label: 'Use Cases', group: 'Guides' },
  { id: 'errors', label: 'Error Codes', group: 'Reference' },
  { id: 'faq', label: 'FAQ', group: 'Support' },
];

export const OVERVIEW_CONTENT = {
  tagline: 'The universal flash loan layer for Solana',
  intro: `VAEA Flash lets you borrow any SPL token — SOL, stablecoins, LSTs, mid-caps — in a single atomic transaction, with no collateral required. One SDK call, any token, from 0.03%.`,
  whyExists: [
    { problem: 'Existing flash loans only cover SOL, USDC, USDT', solution: 'VAEA covers 21+ tokens including LSTs and mid-caps' },
    { problem: 'Each protocol has its own incompatible SDK', solution: 'One SDK, one line of code, any token' },
    { problem: 'No flash loans for mSOL, JitoSOL, BONK...', solution: 'Synthetic routing via Sanctum & Jupiter' },
    { problem: 'If a source is full, there\'s no fallback', solution: 'Automatic multi-protocol fallback' },
  ],
  audiences: [
    { icon: '🤖', title: 'Liquidation Bots', desc: 'Flash loan collateral tokens (JitoSOL, mSOL) to liquidate lending positions without owning the asset.' },
    { icon: '📊', title: 'Arbitrage Bots', desc: 'Instant capital on any token pair. Flash, arb, repay — zero upfront capital needed.' },
    { icon: '🏗️', title: 'DeFi Protocols', desc: 'Integrate VAEA Flash to offer leverage, looping, or collateral swaps to your users.' },
    { icon: '👨‍💻', title: 'Solo Developers', desc: 'Build with flash loans in minutes. No routing code, no pool management.' },
  ],
  stats: [
    { label: 'Supported Tokens', value: '21+' },
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

// 2. Execute flash loan
const sig = await flash.execute({
  token: 'SOL',
  amount: 1000,          // borrow 1,000 SOL
  onFunds: async (ixs) => {
    // Your logic here: arb, liquidation, swap...
    ixs.push(myArbitrageInstruction);
    return ixs;
  },
  maxFeeBps: 10,         // reject if fee > 0.10%
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
    print(f"Fee: {quote.fee_total_pct}%")

    # 3. Execute flash loan
    result = await flash.borrow(
        token="SOL",
        amount=1000,
        user_pubkey=str(wallet.pubkey()),
        user_instructions=[my_arb_ix],
    )
    print(f"Transaction: {result.signature}")`,
  },
  advancedConfig: {
    typescript: `// Advanced: custom slippage, priority fee, multi-token
const sig = await flash.execute({
  token: 'mSOL',
  amount: 500,
  onFunds: async (ixs) => {
    ixs.push(myLiquidationIx);
    return ixs;
  },
  maxFeeBps: 15,         // max 0.15% for synthetic route
  slippageBps: 50,       // 0.5% slippage tolerance
  priorityFee: 100_000,  // priority fee in microlamports
  simulate: true,        // dry-run before sending
});`,
    rust: `// Advanced: custom slippage
let sig = flash.execute(BorrowParams {
    token: "mSOL".into(),
    amount: 500.0,
    instructions: vec![liquidation_ix],
    slippage_bps: Some(50),   // 0.5% slippage
    max_fee_bps: Some(15),    // max 0.15%
}).await?;`,
    python: `# Advanced: with quote validation
quote = await flash.get_quote("mSOL", 500)
if quote.fee_total_pct < 0.15:
    result = await flash.borrow(
        token="mSOL",
        amount=500,
        user_pubkey=str(wallet.pubkey()),
        user_instructions=[liquidation_ix],
        slippage_bps=50,
    )`,
  },
};

export const TOKENS_DIRECT = [
  { symbol: 'SOL', source: 'Jupiter Lend', fee: '0%', fallback: 'Marginfi → Kamino → Save' },
  { symbol: 'USDC', source: 'Jupiter Lend', fee: '0%', fallback: 'Marginfi → Kamino → Save' },
  { symbol: 'USDT', source: 'Jupiter Lend', fee: '0%', fallback: 'Marginfi → Save' },
  { symbol: 'cbBTC', source: 'Jupiter Lend', fee: '0%', fallback: 'Kamino' },
  { symbol: 'JupSOL', source: 'Jupiter Lend', fee: '0%', fallback: '—' },
  { symbol: 'JitoSOL', source: 'Jupiter Lend', fee: '0%', fallback: 'Marginfi' },
  { symbol: 'JUP', source: 'Jupiter Lend', fee: '0%', fallback: '—' },
  { symbol: 'JLP', source: 'Jupiter Lend', fee: '0%', fallback: '—' },
];

export const TOKENS_SYNTHETIC = [
  { symbol: 'mSOL', swap: 'Sanctum', slippage: '~0.03%', totalFee: '~0.09%' },
  { symbol: 'bSOL', swap: 'Sanctum', slippage: '~0.03%', totalFee: '~0.09%' },
  { symbol: 'INF', swap: 'Sanctum', slippage: '~0.02%', totalFee: '~0.08%' },
  { symbol: 'laineSOL', swap: 'Sanctum', slippage: '~0.05%', totalFee: '~0.11%' },
  { symbol: 'BONK', swap: 'Jupiter', slippage: '~0.1-0.5%', totalFee: '~0.16%' },
  { symbol: 'WIF', swap: 'Jupiter', slippage: '~0.1-0.5%', totalFee: '~0.16%' },
  { symbol: 'PYTH', swap: 'Jupiter', slippage: 'variable', totalFee: 'variable' },
  { symbol: 'RAY', swap: 'Jupiter', slippage: 'variable', totalFee: 'variable' },
  { symbol: 'HNT', swap: 'Jupiter', slippage: 'variable', totalFee: 'variable' },
  { symbol: 'RNDR', swap: 'Jupiter', slippage: 'variable', totalFee: 'variable' },
  { symbol: 'JITO', swap: 'Jupiter', slippage: 'variable', totalFee: 'variable' },
  { symbol: 'KMNO', swap: 'Jupiter', slippage: 'variable', totalFee: 'variable' },
  { symbol: 'wETH', swap: 'Jupiter', slippage: '~0.05%', totalFee: '~0.11%' },
];

export const API_ENDPOINTS = [
  {
    method: 'GET', path: '/v1/capacity',
    desc: 'Returns real-time borrowing capacity for all supported tokens.',
    params: [],
    response: `{
  "tokens": [
    {
      "symbol": "SOL",
      "name": "Solana",
      "route_type": "direct",
      "source_protocol": "jupiter_lend",
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
    desc: 'Get a fee quote for a specific token and amount before executing.',
    params: [
      { name: 'token', type: 'string', required: true, desc: 'Token symbol (e.g. SOL, mSOL)' },
      { name: 'amount', type: 'number', required: true, desc: 'Amount to borrow (in token units)' },
    ],
    response: `{
  "token": "mSOL",
  "amount": 1000,
  "route_type": "synthetic",
  "source_protocol": "jupiter_lend",
  "swap_protocol": "sanctum",
  "fee": {
    "source_pct": 0,
    "vaea_pct": 0.03,
    "swap_pct": 0.06,
    "total_pct": 0.09
  },
  "estimated_slippage_pct": 0.02,
  "expires_at": 1711533660
}`,
  },
  {
    method: 'POST', path: '/v1/build',
    desc: 'Build serialized flash loan instructions ready to sign and send.',
    params: [
      { name: 'token', type: 'string', required: true, desc: 'Token symbol' },
      { name: 'amount', type: 'number', required: true, desc: 'Borrow amount' },
      { name: 'user_pubkey', type: 'string', required: true, desc: 'Borrower wallet address' },
      { name: 'user_instructions', type: 'string[]', required: false, desc: 'Base64-encoded user instructions' },
      { name: 'max_fee_bps', type: 'number', required: false, desc: 'Max acceptable fee (default: 50)' },
    ],
    response: `{
  "transaction": "base64_serialized_tx...",
  "blockhash": "...",
  "fee_breakdown": { ... },
  "expires_at": 1711533660
}`,
  },
  {
    method: 'GET', path: '/v1/health',
    desc: 'System health check — returns backend status and upstream protocol availability.',
    params: [],
    response: `{
  "status": "operational",
  "uptime_pct": 99.97,
  "protocols": {
    "jupiter_lend": "ok",
    "marginfi": "ok",
    "kamino": "ok",
    "save": "degraded"
  },
  "cache_age_ms": 1200
}`,
  },
];

export const ERRORS = [
  { code: 'INSUFFICIENT_LIQUIDITY', desc: 'Requested amount exceeds available pool capacity across all sources.', fix: 'Reduce the borrow amount or try a different token. Check /v1/capacity for real-time availability.' },
  { code: 'TOKEN_NOT_SUPPORTED', desc: 'The requested token is not in the VAEA Flash registry.', fix: 'Check the supported tokens list. Use the exact symbol (case-sensitive).' },
  { code: 'FEE_TOO_HIGH', desc: 'The calculated fee exceeds the max_fee_bps parameter you specified.', fix: 'Increase maxFeeBps or switch to a token with a direct route (lower fees).' },
  { code: 'SLIPPAGE_EXCEEDED', desc: 'Swap slippage on a synthetic route exceeded the tolerance.', fix: 'Increase slippage_bps or reduce the amount (less market impact).' },
  { code: 'TX_EXPIRED', desc: 'The quote or built transaction has expired (60s TTL).', fix: 'Rebuild with a fresh quote. Avoid delays between quote and execution.' },
  { code: 'REPAY_FAILED', desc: 'The repayment amount doesn\'t match the borrowed amount + fee.', fix: 'Ensure your logic returns the exact borrowed amount. Check for rounding.' },
  { code: 'ROUTE_UNAVAILABLE', desc: 'All source protocols are temporarily unavailable for this token.', fix: 'Retry in a few seconds. Check /v1/health for protocol status.' },
  { code: 'SIMULATION_FAILED', desc: 'Transaction simulation failed before sending.', fix: 'Check your user instructions for errors. Enable simulate: true to debug.' },
];

export const FAQ = [
  { q: 'Do I need collateral to use VAEA Flash?', a: 'No. Flash loans are uncollateralized by design. You borrow and repay within the same transaction. If repayment fails, the entire transaction reverts atomically.' },
  { q: 'What happens if my transaction fails mid-execution?', a: 'Nothing. Solana transactions are atomic — either everything succeeds or everything reverts. Your borrowed tokens are returned automatically. You only pay the transaction fee.' },
  { q: 'How is VAEA different from Jupiter Flash Loan?', a: 'Jupiter only supports tokens available on Jupiter Lend (SOL, USDC, USDT, etc.). VAEA extends this to 21+ tokens via synthetic routing — including LSTs (mSOL, JitoSOL, bSOL) and mid-caps (BONK, WIF, PYTH). One SDK, any token.' },
  { q: 'What are "direct" vs "synthetic" routes?', a: 'Direct routes borrow the token natively from a lending protocol (cheapest, ~0.03% fee). Synthetic routes flash borrow SOL, swap it to the target token via Sanctum or Jupiter, then swap back on repayment (slightly higher fee due to swap costs).' },
  { q: 'Can I flash loan multiple tokens in one transaction?', a: 'Yes. You can chain multiple VAEA Flash calls within a single Solana transaction. Each borrow-repay pair is independent.' },
  { q: 'Is there a maximum borrow amount?', a: 'The limit depends on real-time pool liquidity. Check /v1/capacity for current limits. For large amounts, VAEA automatically splits across multiple protocols.' },
  { q: 'Which networks are supported?', a: 'Solana mainnet-beta and devnet. Devnet is available for testing with mock liquidity.' },
  { q: 'Do you store any user data?', a: 'No. VAEA Flash has zero database and zero data retention. We read on-chain state only. No tracking, no cookies, no accounts.' },
];
