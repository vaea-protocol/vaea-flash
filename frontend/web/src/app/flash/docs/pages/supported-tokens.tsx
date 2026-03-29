import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function SupportedTokens() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Supported Tokens</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>VAEA Flash supports <Tag>30 tokens</Tag> across two route types: <strong>Direct Route</strong> (8 tokens, 0.03%) and <strong>Synthetic Route</strong> (22 tokens, ~0.06–0.16%).</p>

    <h2 id="direct" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Direct Route (8 Tokens)</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>Borrowed directly from lending protocols with a flat <strong>0.03%</strong> VAEA fee. No swap needed.</p>
    <DocTable headers={['Token', 'Primary Source', 'Fallback', 'Total Fee']} rows={[
      [<strong>SOL</strong>, 'Marginfi', 'Kamino → Save', <Tag>0.03%</Tag>],
      [<strong>USDC</strong>, 'Marginfi', 'Kamino → Save', <Tag>0.03%</Tag>],
      [<strong>USDT</strong>, 'Marginfi', 'Save', <Tag>0.03%</Tag>],
      [<strong>cbBTC</strong>, 'Kamino', '—', <Tag>0.03%</Tag>],
      [<strong>JupSOL</strong>, 'Marginfi', '—', <Tag>0.03%</Tag>],
      [<strong>JitoSOL</strong>, 'Marginfi', '—', <Tag>0.03%</Tag>],
      [<strong>JUP</strong>, 'Marginfi', '—', <Tag>0.03%</Tag>],
      [<strong>JLP</strong>, 'Kamino', '—', <Tag>0.03%</Tag>],
    ]} />

    <h2 id="synthetic" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Synthetic Route (22 Tokens)</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>Borrowed via a swap — VAEA borrows a base token (SOL/USDC) from a lending protocol, then swaps to your target token. Total fee = VAEA (0.03%) + swap cost.</p>

    <h3 id="lst" style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 8, marginTop: 24 }}>LSTs via Sanctum (~0.06%)</h3>
    <DocTable headers={['Token', 'Swap Provider', 'Swap Cost', 'Total Fee']} rows={[
      [<strong>mSOL</strong>, 'Sanctum', '~0.03%', <Tag color="sky">~0.06%</Tag>],
      [<strong>bSOL</strong>, 'Sanctum', '~0.03%', <Tag color="sky">~0.06%</Tag>],
      [<strong>INF</strong>, 'Sanctum', '~0.03%', <Tag color="sky">~0.06%</Tag>],
      [<strong>laineSOL</strong>, 'Sanctum', '~0.03%', <Tag color="sky">~0.06%</Tag>],
    ]} />

    <h3 id="majors" style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 8, marginTop: 24 }}>Majors via Jupiter (~0.09%)</h3>
    <DocTable headers={['Token', 'Swap Provider', 'Total Fee']} rows={[
      [<strong>TRUMP</strong>, 'Jupiter', <Tag color="orange">~0.09%</Tag>],
      [<strong>PENGU</strong>, 'Jupiter', <Tag color="orange">~0.09%</Tag>],
    ]} />

    <h3 id="midcaps" style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 8, marginTop: 24 }}>Mid-caps via Jupiter (~0.10–0.16%)</h3>
    <DocTable headers={['Token', 'Swap Provider', 'Total Fee']} rows={[
      [<strong>BONK</strong>, 'Jupiter', <Tag color="coral">~0.10%</Tag>],
      [<strong>WIF</strong>, 'Jupiter', <Tag color="coral">~0.11%</Tag>],
      [<strong>RAY</strong>, 'Jupiter', <Tag color="coral">~0.11%</Tag>],
      [<strong>HNT</strong>, 'Jupiter', <Tag color="coral">~0.13%</Tag>],
      [<strong>RNDR</strong>, 'Jupiter', <Tag color="coral">~0.13%</Tag>],
      [<strong>JITO</strong>, 'Jupiter', <Tag color="coral">~0.11%</Tag>],
      [<strong>KMNO</strong>, 'Jupiter', <Tag color="coral">~0.13%</Tag>],
    ]} />

    <h3 id="stables" style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 8, marginTop: 24 }}>Stablecoins via Jupiter (~0.06–0.10%)</h3>
    <DocTable headers={['Token', 'Total Fee']} rows={[
      [<strong>PYUSD</strong>, <Tag color="sky">~0.06%</Tag>],
      [<strong>USDS</strong>, <Tag color="sky">~0.06%</Tag>],
      [<strong>USD1</strong>, <Tag color="orange">~0.08%</Tag>],
      [<strong>USDG</strong>, <Tag color="orange">~0.08%</Tag>],
      [<strong>EURC</strong>, <Tag color="coral">~0.10%</Tag>],
    ]} />

    <h3 id="infra" style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 8, marginTop: 24 }}>Infrastructure / Cross-chain via Jupiter (~0.10–0.15%)</h3>
    <DocTable headers={['Token', 'Swap Provider', 'Total Fee']} rows={[
      [<strong>wETH</strong>, 'Jupiter', <Tag color="orange">~0.10%</Tag>],
      [<strong>PYTH</strong>, 'Jupiter', <Tag color="coral">~0.14%</Tag>],
      [<strong>W</strong>, 'Jupiter', <Tag color="coral">~0.15%</Tag>],
      [<strong>ORCA</strong>, 'Jupiter', <Tag color="orange">~0.11%</Tag>],
    ]} />
    <Callout type="info">Swap costs are estimates based on current market conditions. Actual costs may vary ±0.02% depending on liquidity depth and trade size.</Callout>
  </>);
}
