import { CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function Simulation() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Simulation</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Dry-run any flash loan <strong>without spending SOL</strong>. Uses Solana{"'"}s <code>simulateTransaction</code> with <code>sigVerify: false</code> to test against live on-chain state.</p>

    <Callout type="info">Simulation uses <code>instructions[]</code> (not <code>onFunds</code>) — you pass your pre-built instructions directly.</Callout>

    <h2 id="real-time-fees" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Real-Time Fee Calculation</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>
      All fees displayed in the dashboard and returned by the API are <strong>calculated in real-time</strong> by the VAEA scanner. For synthetic routes, the scanner compares the <Tag>fair market price</Tag> (Jupiter Price API) against the <Tag>actual execution price</Tag> (Jupiter Quote) every 10 seconds.
    </p>
    <DocTable headers={['Component', 'Method', 'Update Frequency']} rows={[
      ['VAEA Fee', <Tag>Fixed 3 bps (SDK) / 5 bps (UI)</Tag>, 'Constant'],
      ['Swap Cost (Direct)', 'None — borrowed directly', 'N/A'],
      ['Swap Cost (Synthetic)', <span>Price-vs-Quote: <code>1 - (quote_rate / fair_rate)</code></span>, '~60s per token'],
      ['Total Fee', <span>VAEA fee + swap cost</span>, <Tag color="sky">Live</Tag>],
    ]} />
    <Callout type="tip">The <code>/v1/quote</code> endpoint returns the exact fee breakdown for any token and amount. Use it to show users their real cost before execution.</Callout>

    <h2 id="code" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Code Examples</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>Simulate a direct route (SOL) and a synthetic route (WIF) to see the fee difference:</p>
    <CodeTabs
      ts={`// Direct route — fixed 0.03% fee
const solSim = await flash.simulate({
  token: 'SOL',
  amount: 5000,
  instructions: [myArbInstruction],
  slippageBps: 50,
  maxFeeBps: 15,  // fee guard: abort if fee > 0.15%
});

// Synthetic route — real-time fee from Jupiter quote
const wifSim = await flash.simulate({
  token: 'WIF',
  amount: 50000,
  instructions: [myArbInstruction],
  maxFeeBps: 30,  // higher guard for synthetic
});

if (solSim.success) {
  console.log('SOL simulation passed! CU:', solSim.computeUnits);
  console.log('Fee:', solSim.feeBreakdown.total_fee_pct, '%');
}
if (wifSim.success) {
  console.log('WIF simulation passed! CU:', wifSim.computeUnits);
  console.log('Fee:', wifSim.feeBreakdown.total_fee_pct, '%');
}`}
      rust={`let result = flash.simulate(SimulateParams {
    token: "WIF".into(),
    amount: 50_000.0,
    instructions: vec![my_arb_ix],
    slippage_bps: Some(50),
    max_fee_bps: Some(30), // fee guard
    ..Default::default()
}).await?;

if result.success {
    println!("CU: {}", result.compute_units);
    println!("Fee: {}%", result.fee_breakdown.total_fee_pct);
}`}
      python={`result = await flash.simulate(
    token="WIF", amount=50_000,
    instructions=[my_arb_ix],
    max_fee_bps=30,  # fee guard
)
if result.success:
    print(f"CU: {result.compute_units}")
    print(f"Fee: {result.fee_breakdown.total_fee_pct}%")`}
    />

    <h2 id="response" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Response Schema</h2>
    <DocTable headers={['Field', 'Type', 'Description']} rows={[
      [<code>success</code>, <code>boolean</code>, 'Whether simulation passed successfully'],
      [<code>computeUnits</code>, <code>number</code>, 'Exact CU consumed — use to set compute budget'],
      [<code>feeBreakdown</code>, <code>FeeBreakdown</code>, 'Detailed fee: vaea_fee, swap_fee, total_fee_pct, total_fee_usd'],
      [<code>logs</code>, <code>string[]</code>, 'Full program execution logs'],
      [<code>error</code>, <code>string | undefined</code>, 'Error details if simulation failed (JSON)'],
    ]} />

    <h2 id="use-cases" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Use Cases</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
      {[
        { title: 'Strategy Testing', desc: 'Validate new arb strategies against live state without risk' },
        { title: 'CU Estimation', desc: 'Get exact compute units to optimize your compute budget request' },
        { title: 'Fee Verification', desc: 'Confirm real-time fees match your profitability threshold before execution' },
        { title: 'CI/CD', desc: 'Run simulated flash loans in your test suite on every commit' },
      ].map(u => (
        <div key={u.title} style={{ background: 'white', borderRadius: 16, padding: '14px 16px', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: 4 }}>{u.title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{u.desc}</div>
        </div>
      ))}
    </div>
    <Callout type="tip">The SDK automatically adds a 1.4M CU budget limit and uses <code>replaceRecentBlockhash: true</code> — no wallet signing required.</Callout>
  </>);
}
