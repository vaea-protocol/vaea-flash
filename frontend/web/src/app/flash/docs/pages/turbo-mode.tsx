import { Code, CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function TurboMode() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Turbo Mode</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Build flash loan instructions <strong>100% locally</strong> in <Tag color="purple">~91µs</Tag> — no API call, no HTTP, no network. 2,000× faster than a round-trip.</p>

    <h2 id="comparison" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Latency Comparison</h2>
    <DocTable headers={['SDK', 'Network Calls', 'Build Time', 'Total Latency']} rows={[
      [<strong>VAEA Turbo</strong>, '0 HTTP + 2 RPC', <Tag color="purple">~91µs</Tag>, <Tag>~100ms</Tag>],
      ['VAEA Standard', '1 HTTP + 2 RPC', '~5ms', '~180ms'],
      ['Jupiter Perps', '2-3 RPC', '~15ms', '~200-400ms'],
      ['Marginfi Flash', '3-4 RPC', '~20ms', '~300-500ms'],
      ['Solend Flash', '4+ RPC', '~30ms', '~400-600ms'],
    ]} />

    <h2 id="code" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Code Examples</h2>
    <CodeTabs
      ts={`// Turbo mode — zero API calls, ~91µs build
const sig = await flash.executeLocal({
  token: 'SOL',
  amount: 1000,
  onFunds: async (ixs) => {
    ixs.push(buyInstruction);
    ixs.push(sellInstruction);
    return ixs;
  },
});`}
      rust={`let sig = flash.execute_local(BorrowParams {
    token: "SOL".into(),
    amount: 1000.0,
    on_funds: Box::new(|ixs| {
        ixs.push(buy_ix);
        ixs.push(sell_ix);
        Ok(ixs)
    }),
}).await?;`}
      python={`sig = await flash.execute_local(
    token="SOL",
    amount=1000,
    on_funds=lambda ixs: ixs + [buy_ix, sell_ix],
)`}
    />

    <h2 id="how" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>How It Works</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>The SDK contains a hardcoded token registry and replicates the backend{"'"}s instruction builder locally:</p>
    <ol style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.9, paddingLeft: 22, marginBottom: 24 }}>
      <li><strong>PDA derivation</strong> — computes flash vault, user state, config accounts</li>
      <li><strong>Account resolution</strong> — derives token accounts, ATAs, lookup table addresses</li>
      <li><strong>Instruction assembly</strong> — builds the borrow → your IXs → repay sandwich</li>
    </ol>

    <h2 id="local-build" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>localBuild() API</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.92rem' }}>For full control, use <code>localBuild()</code> to get raw instructions without executing:</p>
    <Code code={`import { localBuild, VAEA_LOOKUP_TABLE } from '@vaea/flash';
import { TransactionMessage, VersionedTransaction } from '@solana/web3.js';

// ~0.09ms — builds begin_flash + end_flash instructions
const { beginFlash, endFlash, expectedFeeNative } = localBuild({
  payer: wallet.publicKey,
  token: 'SOL',
  amount: 1000,
});

// Build your own VersionedTransaction
const { blockhash } = await connection.getLatestBlockhash();
const message = new TransactionMessage({
  payerKey: wallet.publicKey,
  recentBlockhash: blockhash,
  instructions: [beginFlash, myArbIx, endFlash],
}).compileToV0Message([VAEA_LOOKUP_TABLE]);

const tx = new VersionedTransaction(message);
tx.sign([wallet]);
const sig = await connection.sendTransaction(tx, { skipPreflight: true });`} lang="typescript" />

    <h2 id="when" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>When to Use</h2>
    <DocTable headers={['Criteria', 'Turbo (executeLocal)', 'Standard (execute)']} rows={[
      ['Speed', <Tag>~100ms</Tag>, '~180ms'],
      ['API dependency', 'None', 'VAEA API required'],
      ['Offline capable', '✅ Yes', '❌ No'],
      ['Route updates', '❌ Uses cached registry', '✅ Always fresh'],
      ['Best for', 'Bots, HFT, production', 'General use, prototyping'],
    ]} />
    <Callout type="tip">Pre-warm with <code>flash.warmCache()</code> at boot for even faster first execution. Combine with <code>sendVia: {"'"}jito{"'"}</code> for private MEV-protected execution.</Callout>

    <h2 id="borrow-vs-execute" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>borrowLocal() vs executeLocal()</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>Two levels of control — choose based on how much you want the SDK to handle:</p>
    <DocTable headers={['Method', 'Returns', 'Sends TX?', 'Use Case']} rows={[
      [<code>borrowLocal(params)</code>, <code>TransactionInstruction[]</code>, <Tag color="coral">❌ No</Tag>, 'Get instructions — you build, sign, send'],
      [<code>executeLocal(params, opts)</code>, <><code>string</code> (tx signature)</>, <Tag>✅ Yes</Tag>, 'One-liner: build + sign + send + confirm'],
    ]} />
    <Code code={`// borrowLocal() — full control over the transaction
const ixs = await flash.borrowLocal({
  token: 'SOL', amount: 1000,
  onFunds: async () => [myArbIx],
});
// ixs = [beginFlash, myArbIx, endFlash]
// → Build your own VersionedTransaction, add compute budget, sign, send

// executeLocal() — one-liner, SDK handles everything
const sig = await flash.executeLocal({
  token: 'SOL', amount: 1000,
  onFunds: async () => [myArbIx],
}, { priorityMicroLamports: 5000 });`} lang="typescript" />
  </>);
}
