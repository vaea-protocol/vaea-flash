import { CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function Simulation() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Simulation</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Dry-run any flash loan <strong>without spending SOL</strong>. Uses Solana{"'"}s <code>simulateTransaction</code> with <code>sigVerify: false</code> to test against live on-chain state.</p>

    <Callout type="info">Simulation uses <code>instructions[]</code> (not <code>onFunds</code>) — you pass your pre-built instructions directly.</Callout>

    <h2 id="code" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Code Examples</h2>
    <CodeTabs
      ts={`const result = await flash.simulate({
  token: 'SOL',
  amount: 5000,
  instructions: [myArbInstruction],  // TransactionInstruction[]
  slippageBps: 50,                   // optional
  maxFeeBps: 15,                     // optional fee guard
});

if (result.success) {
  console.log('Simulation passed! CU:', result.computeUnits);
  console.log('Logs:', result.logs);
} else {
  console.error('Failed:', result.error);
  // Fix your logic before spending real SOL
}`}
      rust={`let result = flash.simulate(SimulateParams {
    token: "SOL".into(),
    amount: 5000.0,
    instructions: vec![my_arb_ix],
    slippage_bps: Some(50),
    ..Default::default()
}).await?;

if result.success {
    println!("CU: {}", result.compute_units);
}`}
      python={`result = await flash.simulate(
    token="SOL", amount=5000,
    instructions=[my_arb_ix],
)
if result.success:
    print(f"CU: {result.compute_units}")`}
    />

    <h2 id="response" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Response Schema</h2>
    <DocTable headers={['Field', 'Type', 'Description']} rows={[
      [<code>success</code>, <code>boolean</code>, 'Whether simulation passed successfully'],
      [<code>computeUnits</code>, <code>number</code>, 'Exact CU consumed — use to set compute budget'],
      [<code>logs</code>, <code>string[]</code>, 'Full program execution logs'],
      [<code>error</code>, <code>string | undefined</code>, 'Error details if simulation failed (JSON)'],
    ]} />

    <h2 id="use-cases" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Use Cases</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
      {[
        { title: 'Strategy Testing', desc: 'Validate new arb strategies against live state without risk' },
        { title: 'CU Estimation', desc: 'Get exact compute units to optimize your compute budget request' },
        { title: 'Debugging', desc: 'Read program logs to diagnose why a transaction fails' },
        { title: 'CI/CD', desc: 'Run simulated flash loans in your test suite' },
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
