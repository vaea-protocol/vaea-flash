import { Code, CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function WarmCache() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Warm Cache</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Keep capacity data hot with a <strong>background poller</strong>. Eliminates cold-start penalty on your first call.</p>

    <h2 id="code" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Usage</h2>
    <CodeTabs
      ts={`const flash = new VaeaFlash({
  apiUrl: 'https://api.vaea.fi',
  connection,
  wallet,
  preWarm: true,  // polls /v1/capacity every 2s
});

// First getCapacity() is instant — data already cached
const capacity = await flash.getCapacity();

// When done, clean up the background poller
flash.destroy();`}
      rust={`let flash = VaeaFlash::with_rpc(
    "https://api.vaea.fi",
    rpc_url, &payer,
)?.with_warm_cache(true);

let capacity = flash.get_capacity().await?;`}
      python={`async with VaeaFlash(VaeaConfig(
    api_url="https://api.vaea.fi",
    pre_warm=True,
)) as flash:
    capacity = await flash.get_capacity()`}
    />

    <h2 id="cached" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>What Gets Cached</h2>
    <DocTable headers={['Data', 'Without Warm Cache', 'With Warm Cache']} rows={[
      ['Borrowing capacity', '~20ms (API call)', <Tag>Instant</Tag>],
      ['Token routes', '~20ms (API call)', <Tag>Instant</Tag>],
      ['Fee quotes', '~20ms (API call)', <Tag>Instant</Tag>],
      ['Protocol health', '~20ms (API call)', <Tag>Instant</Tag>],
    ]} />
    <Callout type="info">The poller runs every <strong>2 seconds</strong> in the background. Data is always fresh for MEV/arbitrage use cases.</Callout>

    <h2 id="api" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Advanced API</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>For bots that need direct access to the Warm Cache instance:</p>
    <Code code={`import { WarmCache } from '@vaea/flash';

const cache = new WarmCache('https://api.vaea.fi', 2000);
await cache.start(); // first refresh is synchronous

// Check if cache has data
console.log(cache.isWarm());  // true

// Get cached data instantly
const capacity = cache.getCapacity();

// Get a single token
const sol = cache.getTokenCapacity('SOL');
console.log(sol?.max_amount, sol?.status);

// Listen for updates (called every 2s)
cache.onUpdate((newCapacity) => {
  console.log('Cache updated:', newCapacity.tokens.length, 'tokens');
});

// Cleanup
cache.stop();`} lang="typescript" />
    <DocTable headers={['Method', 'Returns', 'Description']} rows={[
      [<code>start()</code>, <code>Promise&lt;void&gt;</code>, 'Start polling — first refresh is synchronous'],
      [<code>stop()</code>, <code>void</code>, 'Stop background polling'],
      [<code>isWarm()</code>, <code>boolean</code>, 'Whether cache has data loaded'],
      [<code>getCapacity()</code>, <code>CapacityResponse | null</code>, 'Get all cached capacity data'],
      [<code>getTokenCapacity(symbol)</code>, <code>TokenCapacity | null</code>, 'Get capacity for a single token'],
      [<code>onUpdate(handler)</code>, <code>void</code>, 'Register a listener for capacity updates'],
    ]} />
    <Callout type="tip">Always call <code>cache.stop()</code> / <code>flash.destroy()</code> when shutting down to stop the background poller and prevent resource leaks.</Callout>
  </>);
}
