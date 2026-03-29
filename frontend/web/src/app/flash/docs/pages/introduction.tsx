import { Code, CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function Introduction() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em', lineHeight: 1.15 }}>Introduction</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>
      VAEA Flash is the <strong>universal flash loan layer for Solana</strong>. It lets you borrow any SPL token — SOL, stablecoins, LSTs, mid-caps — in a <strong>single atomic transaction</strong>, with no collateral required.
    </p>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>
      One SDK call. Any token. From <Tag>0.03%</Tag> fee. ~<Tag color="purple">100ms</Tag> latency.
    </p>

    <Code code={`const sig = await flash.executeLocal({
  token: 'mSOL',
  amount: 5000,
  onFunds: async (ixs) => {
    ixs.push(myArbitrageInstruction);
    return ixs;
  },
});`} lang="typescript" />

    <h2 id="why" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Why VAEA Flash</h2>
    <DocTable
      headers={['Problem', 'VAEA Solution']}
      rows={[
        ['Existing flash loans only cover SOL, USDC, USDT', <><Tag>30 tokens</Tag> — LSTs, majors, mid-caps, stablecoins</>],
        ['Each protocol has its own incompatible SDK', <><Tag>One SDK</Tag>, one call, any token</>],
        ['No flash loans for mSOL, JitoSOL, BONK, TRUMP…', <><Tag color="purple">Synthetic routing</Tag> via Sanctum & Jupiter</>],
        ['If a source is full, there\'s no fallback', <><Tag color="coral">Automatic</Tag> multi-protocol fallback</>],
        ['TX building requires multiple RPC calls (~300ms)', <><Tag color="orange">Turbo Mode</Tag>: local build in ~91µs</>],
      ]}
    />

    <h2 id="features" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Key Features</h2>
    <DocTable
      headers={['Feature', 'Description']}
      rows={[
        [<strong>27 Tokens</strong>, 'Widest flash loan coverage on Solana — direct borrowing from Marginfi, Kamino, Save + synthetic routes via Sanctum & Jupiter'],
        [<strong>3 SDKs</strong>, 'TypeScript, Rust, Python — identical API surface, same features across all three'],
        [<strong>Turbo Mode</strong>, 'Build instructions locally in ~91µs — zero API calls, zero HTTP, only 2 RPC calls to send'],
        [<strong>Jito Bundles</strong>, 'Send as private bundle via Block Engine — invisible to MEV bots, auto-calculated tip'],
        [<strong>Smart Retry</strong>, 'Automatic retry with escalating priority fees — classifies retryable vs fatal errors'],
        [<strong>Simulation</strong>, 'Dry-run any flash loan against live state — no SOL spent, zero risk'],
        [<strong>Multi-Token Flash</strong>, 'Borrow 2-4 different tokens in a single atomic transaction'],
        [<strong>Profitability Check</strong>, 'Estimate all costs and get send/wait/abort recommendation before TX'],
        [<strong>Fee Guard</strong>, 'Set max fee limit — auto-reject transactions exceeding your cost threshold'],
        [<strong>Warm Cache</strong>, 'Pre-compute PDAs and lookup tables at boot for instant subsequent calls'],
        [<strong>Auto Slippage</strong>, 'Dynamic slippage calculation based on token liquidity and trade size'],
      ]}
    />

    <h2 id="audiences" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Who Is It For</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 24 }}>
      {[
        { icon: '🤖', title: 'Liquidation Bots', desc: 'Flash loan collateral tokens (JitoSOL, mSOL) to liquidate lending positions without owning the asset. ~100ms with Turbo Mode.' },
        { icon: '📊', title: 'Arbitrage Bots', desc: 'Instant capital on any token pair. Flash, arb, repay — zero upfront capital. Multi-token flash for cross-pair strategies.' },
        { icon: '🏗️', title: 'DeFi Protocols', desc: 'Integrate VAEA Flash to offer leverage, looping, or collateral swaps to your users via SDK or REST API.' },
        { icon: '👨‍💻', title: 'Solo Developers', desc: 'Build with flash loans in minutes. No routing code, no pool management, no RPC lookups.' },
      ].map(a => (
        <div key={a.title} style={{ background: 'white', borderRadius: 16, padding: '16px 18px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{a.icon}</div>
          <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: 6 }}>{a.title}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{a.desc}</div>
        </div>
      ))}
    </div>

    <h2 id="status" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Status & Roadmap</h2>
    <Callout type="warn">
      VAEA Flash is currently deployed on <strong>Solana Devnet</strong>. Mainnet launch is expected in <strong>April 2026</strong>. The SDKs, API, and documentation are production-ready — only the on-chain program isn{"'"}t live on mainnet yet.
    </Callout>
    <DocTable
      headers={['', 'Status']}
      rows={[
        ['Program (Devnet)', <Tag>✅ Live</Tag>],
        ['Program (Mainnet)', <Tag color="orange">April 2026</Tag>],
        ['TypeScript SDK', <Tag>✅ Published</Tag>],
        ['Rust SDK', <Tag>✅ Published</Tag>],
        ['Python SDK', <Tag>✅ Published</Tag>],
        ['REST API', <Tag>✅ Live</Tag>],
        ['Documentation', <Tag>✅ Complete</Tag>],
      ]}
    />
  </>);
}
