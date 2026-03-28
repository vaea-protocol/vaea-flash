import { Code, CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function JitoBundles() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Jito Bundles</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Send flash loans as <strong>private, atomic bundles</strong> via Jito Block Engine. Your transaction bypasses the public mempool — invisible to MEV bots.</p>

    <h2 id="code" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Code Examples</h2>
    <CodeTabs
      ts={`const sig = await flash.executeLocal({
  token: 'SOL',
  amount: 5000,
  onFunds: async (ixs) => {
    ixs.push(myLiquidationIx);
    return ixs;
  },
}, {
  sendVia: 'jito',
  jito: {
    tip: 'competitive',    // auto-calculated tip
    region: 'amsterdam',   // nearest Block Engine
  },
});`}
      rust={`let sig = flash.execute_local(
    params,
    ExecuteOptions {
        send_via: SendVia::Jito,
        jito: JitoConfig { tip: TipStrategy::Competitive, region: "amsterdam".into() },
        ..Default::default()
    },
).await?;`}
      python={`sig = await flash.execute_local(
    params,
    send_via="jito",
    jito={"tip": "competitive", "region": "amsterdam"},
)`}
    />

    <h2 id="tips" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Tip Strategies</h2>
    <DocTable headers={['Strategy', 'Tip Amount', 'Use Case']} rows={[
      [<Tag color="sky">min</Tag>, '~1–5K lamports', 'Low-value opportunities, testing'],
      [<Tag>competitive</Tag>, '~10–50K lamports', 'Recommended for most bots — good balance'],
      [<Tag color="coral">aggressive</Tag>, '100K+ lamports', 'High-value liquidations, time-critical arbs'],
      [<Tag color="default">number</Tag>, 'Exact lamports', 'Full manual control over tip amount'],
    ]} />

    <h2 id="gives" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>What Jito Gives You</h2>
    <ul style={{ fontSize: '0.88rem', lineHeight: 1.9, paddingLeft: 22, color: 'var(--text-2)', marginBottom: 24 }}>
      <li>✅ <strong>Bundle privacy</strong> — your TX is not visible in the public mempool</li>
      <li>✅ <strong>Frontrun protection</strong> — MEV bots can{"'"}t see your transaction before it lands</li>
      <li>✅ <strong>Auto-calculated tip</strong> — based on Jito tip floor with your chosen strategy</li>
      <li>✅ <strong>Smart Retry compatible</strong> — escalates tip amount on retry failure</li>
      <li>✅ <strong>Zero new dependencies</strong> — uses pure <code>fetch()</code> to Block Engine API</li>
    </ul>

    <h2 id="limits" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Limitations</h2>
    <ul style={{ fontSize: '0.88rem', lineHeight: 1.9, paddingLeft: 22, color: 'var(--text-2)', marginBottom: 24 }}>
      <li>❌ <strong>No landing guarantee</strong> — tip is competitive, not a hard guarantee of inclusion</li>
      <li>❌ <strong>Not full MEV protection</strong> — bundles are private, but not invulnerable to all MEV</li>
    </ul>
    <Callout type="warn">Jito Block Engine is <strong>mainnet only</strong>. There is no devnet support. Bundle testing requires mainnet SOL.</Callout>

    <h2 id="regions" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Block Engine Regions</h2>
    <DocTable headers={['Region', 'URL']} rows={[
      [<Tag>mainnet</Tag>, <code>mainnet.block-engine.jito.wtf</code>],
      ['amsterdam', <code>amsterdam.mainnet.block-engine.jito.wtf</code>],
      ['frankfurt', <code>frankfurt.mainnet.block-engine.jito.wtf</code>],
      ['ny', <code>ny.mainnet.block-engine.jito.wtf</code>],
      ['tokyo', <code>tokyo.mainnet.block-engine.jito.wtf</code>],
      ['slc', <code>slc.mainnet.block-engine.jito.wtf</code>],
    ]} />

    <h2 id="poll" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>pollBundleStatus()</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>After sending a bundle, poll the Block Engine to verify it landed. The SDK does this automatically with <code>sendVia: {"'"}jito{"'"}</code>, but you can use it directly:</p>
    <Code code={`import { sendJitoBundle, pollBundleStatus, resolveBlockEngineUrl } from '@vaea/flash';

const url = resolveBlockEngineUrl('amsterdam');
const bundleId = await sendJitoBundle(url, [signedTx]);

// Poll every 500ms until confirmed (max 30s)
const signature = await pollBundleStatus(url, bundleId, 30_000);
console.log('Bundle landed:', signature);`} lang="typescript" />
    <Callout type="info">Tip calculation: <code>min</code> = floor (~1K lamports), <code>competitive</code> = floor × 3 (~10-50K), <code>aggressive</code> = max(100K, floor × 5). The SDK fetches the current tip floor from the Block Engine.</Callout>
  </>);
}
