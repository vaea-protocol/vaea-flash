import { Code, CodeTabs } from '../components/CodeBlock';
import { Callout } from '../components/Callout';
import { DocTable, Tag } from '../components/DocTable';

export default function ErrorCodes() {
  return (<>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.03em' }}>Error Codes</h1>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.92rem' }}>Complete error reference — all SDK and on-chain error codes, their causes, and how to fix them.</p>

    <h2 id="sdk-errors" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>SDK Error Codes</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>These are thrown as <code>VaeaError</code> instances in the SDK. Access via <code>err.code</code>.</p>
    <DocTable headers={['Code', 'Cause', 'Fix', 'Retried?']} rows={[
      [<code>INSUFFICIENT_LIQUIDITY</code>, 'No protocol has enough liquidity', 'Try smaller amount or different token', <Tag color="coral">❌</Tag>],
      [<code>TOKEN_NOT_SUPPORTED</code>, 'Token not in VAEA registry', 'Check supported tokens page', <Tag color="coral">❌</Tag>],
      [<code>SLIPPAGE_EXCEEDED</code>, 'Swap price moved beyond tolerance', 'Increase slippageBps or retry later', <Tag>✅</Tag>],
      [<code>FEE_TOO_HIGH</code>, 'Fee exceeds your maxFeeBps', 'Increase limit or skip this opportunity', <Tag color="coral">❌</Tag>],
      [<code>REPAY_FAILED</code>, 'Token repay instruction failed', 'Ensure enough tokens to repay loan + fee', <Tag color="coral">❌</Tag>],
      [<code>TX_EXPIRED</code>, 'Blockhash expired before landing', 'Smart Retry handles this automatically', <Tag>✅</Tag>],
      [<code>SOURCE_UNAVAILABLE</code>, 'Source protocol is down or degraded', 'Wait or try different token', <Tag color="coral">❌</Tag>],
      [<code>PROGRAM_PAUSED</code>, 'VAEA program is paused by admin', 'Wait for unpause', <Tag color="coral">❌</Tag>],
      [<code>INVALID_AMOUNT</code>, 'Amount is zero or negative', 'Use a positive amount', <Tag color="coral">❌</Tag>],
      [<code>INSUFFICIENT_SOL_FOR_FEE</code>, 'Not enough SOL for gas + fee', 'Fund wallet with SOL', <Tag color="coral">❌</Tag>],
      [<code>API_ERROR</code>, 'VAEA API returned an error', 'Use executeLocal() to bypass API', <Tag color="coral">❌</Tag>],
      [<code>NETWORK_ERROR</code>, 'Cannot reach VAEA API', 'Check connectivity, use executeLocal()', <Tag color="coral">❌</Tag>],
    ]} />

    <h2 id="onchain" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>On-Chain Errors (Anchor)</h2>
    <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.88rem' }}>These errors come from the <strong>on-chain program</strong>. They appear as <code>Custom(600X)</code> in transaction logs.</p>
    <DocTable headers={['Code', 'Anchor ID', 'Message', 'Cause']} rows={[
      [<code>MissingEndFlash</code>, <Tag>6000</Tag>, 'end_flash instruction missing from transaction', 'begin_flash was called but end_flash is not in the TX'],
      [<code>MissingBeginFlash</code>, <Tag>6001</Tag>, 'begin_flash instruction missing from transaction', 'end_flash called without a matching begin_flash before it'],
      [<code>MissingRepay</code>, <Tag>6002</Tag>, 'Source protocol repay instruction not found', 'Source protocol repay was expected but not found'],
      [<code>FeeMismatch</code>, <Tag>6003</Tag>, 'Fee amount does not match expected fee from config', 'expected_fee_lamports is below the calculated minimum'],
      [<code>Paused</code>, <Tag>6004</Tag>, 'Program is paused', 'Admin has paused the program via update_config'],
      [<code>ZeroAmount</code>, <Tag>6005</Tag>, 'Amount must be greater than zero', 'Tried to borrow 0 tokens'],
      [<code>InsufficientSolForFee</code>, <Tag>6006</Tag>, 'Insufficient SOL to pay the flash loan fee', 'Payer wallet too low to cover the fee transfer'],
      [<code>Unauthorized</code>, <Tag>6007</Tag>, 'Caller is not the authorized authority', 'Admin-only instruction called by non-authority'],
      [<code>SlotExpired</code>, <Tag>6008</Tag>, 'Transaction is too old (exceeded 150 slots)', 'TX sat in mempool too long'],
      [<code>InvalidSysvarInstructions</code>, <Tag>6009</Tag>, 'Invalid Sysvar Instructions account', 'Wrong account passed as sysvar_instructions'],
    ]} />

    <h2 id="handling" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 10, marginTop: 40, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Error Handling</h2>
    <CodeTabs
      ts={`import { VaeaFlash, VaeaError } from '@vaea/flash';

try {
  const sig = await flash.executeLocal(params);
} catch (err) {
  if (err instanceof VaeaError) {
    switch (err.code) {
      case 'FEE_TOO_HIGH':
        console.log(\`Fee \${err.meta?.actualFeeBps} bps > max \${err.meta?.maxFeeBps}\`);
        break;
      case 'TOKEN_NOT_SUPPORTED':
        console.log('Supported:', err.meta?.supported);
        break;
      case 'INSUFFICIENT_LIQUIDITY':
        console.log('Try smaller amount');
        break;
      case 'TX_EXPIRED':
        console.log('Enable smart retry to handle this');
        break;
      default:
        console.log(\`VAEA Error [\${err.code}]: \${err.message}\`);
    }
  } else {
    throw err;  // Not a VAEA error — rethrow
  }
}`}
      rust={`match flash.execute(params).await {
    Ok(sig) => println!("Success: {}", sig),
    Err(VaeaError::Protocol { code: VaeaErrorCode::FeeTooHigh, .. }) => {
        println!("Fee too high");
    },
    Err(VaeaError::Protocol { code: VaeaErrorCode::InsufficientLiquidity, .. }) => {
        println!("Try smaller amount");
    },
    Err(e) => eprintln!("Error: {:?}", e),
}`}
      python={`from vaea_flash import VaeaError, VaeaErrorCode

try:
    sig = await flash.execute_local(params)
except VaeaError as e:
    if e.code == VaeaErrorCode.FEE_TOO_HIGH:
        print(f"Fee too high: {e.meta}")
    elif e.code == VaeaErrorCode.INSUFFICIENT_LIQUIDITY:
        print("Try smaller amount")
    else:
        print(f"VAEA Error [{e.code}]: {e.message}")`}
    />
    <Callout type="tip">Enable <a href="/flash/docs/smart-retry" style={{color:'var(--emerald)'}}>Smart Retry</a> to automatically handle <code>TX_EXPIRED</code> and <code>SLIPPAGE_EXCEEDED</code> errors.</Callout>
  </>);
}
