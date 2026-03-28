import { Code, CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function MultiTokenFlash() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Multi-Token Flash</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Borrow <strong>multiple different tokens</strong> in a single atomic transaction. Essential for cross-token arbitrage strategies.</p>

    <h2 id="pattern" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Transaction Pattern</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>Multi-token flash uses a <strong>nested sandwich</strong> — borrows are stacked, then repaid in reverse order:</p>
    <Code code={`┌──────────────────────────────────────────────┐
│            Single Atomic Transaction         │
│                                              │
│  IX 1:  begin_flash(SOL, 1000)               │
│  IX 2:  begin_flash(USDC, 50000)             │
│                                              │
│  IX 3:  your_arb_ix(SOL → DEX_A)            │
│  IX 4:  your_arb_ix(USDC → DEX_B)           │
│                                              │
│  IX 5:  end_flash(USDC)                      │
│  IX 6:  end_flash(SOL)                       │
│                                              │
│  All or nothing — atomic execution           │
└──────────────────────────────────────────────┘`} lang="text" />

    <h2 id="code" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Code Examples</h2>
    <CodeTabs
      ts={`const sig = await flash.borrowMulti({
  loans: [
    { token: 'SOL', amount: 1000 },
    { token: 'USDC', amount: 50000 },
  ],
  onFunds: async (ixs) => {
    ixs.push(arbSolIx);
    ixs.push(arbUsdcIx);
    return ixs;
  },
});`}
      rust={`let sig = flash.borrow_multi(vec![
    BorrowParams { token: "SOL".into(), amount: 1000.0, ..Default::default() },
    BorrowParams { token: "USDC".into(), amount: 50000.0, ..Default::default() },
], |ixs| { ixs.push(arb_sol_ix); Ok(ixs) }).await?;`}
      python={`sig = await flash.borrow_multi(
    loans=[
        {"token": "SOL", "amount": 1000},
        {"token": "USDC", "amount": 50000},
    ],
    on_funds=lambda ixs: ixs + [arb_sol_ix, arb_usdc_ix],
)`}
    />

    <h2 id="pda" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>PDA Isolation</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>Each token gets its own PDA — <code>[&quot;flash&quot;, payer, token_mint]</code>. This prevents cross-token collisions and allows independent routing for each borrow.</p>

    <h2 id="limits" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Limits</h2>
    <DocTable headers={['Constraint', 'Value', 'Reason']} rows={[
      ['Max tokens per TX', <Tag>4</Tag>, 'Transaction size limit (1232 bytes)'],
      ['Each token independently routed', '✅', 'Each uses its own source/fallback'],
      ['Partial repay', '❌ All or nothing', 'Atomicity guarantee'],
    ]} />
    <Callout type="tip">Keep multi-token borrows to 2-3 tokens max. Each borrow adds ~200 bytes and ~5,000 CU to the transaction.</Callout>
  </>);
}
