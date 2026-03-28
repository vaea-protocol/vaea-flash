/**
 * VAEA Flash — Comprehensive Devnet Live Tests
 * Tests all program instructions against the real deployed program.
 */

const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY, sendAndConfirmTransaction } = require('@solana/web3.js');
const fs = require('fs');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════
//  Config
// ═══════════════════════════════════════════════════════════

const PROGRAM_ID = new PublicKey('HoYiwkNB7a3gmZXEkTqLkborNDc976vKEUAzBm8YpK5E');
const RPC_URL = 'https://api.devnet.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

// Load local keypair
const keypairData = JSON.parse(fs.readFileSync(
  process.env.HOME + '/.config/solana/id.json', 'utf-8'
));
const payer = Keypair.fromSecretKey(Uint8Array.from(keypairData));

console.log('═══════════════════════════════════════════');
console.log(' VAEA Flash — Devnet Live Tests');
console.log('═══════════════════════════════════════════');
console.log(`Program: ${PROGRAM_ID.toBase58()}`);
console.log(`Payer:   ${payer.publicKey.toBase58()}`);
console.log();

// ═══════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════

function anchorDisc(name) {
  const hash = crypto.createHash('sha256').update(`global:${name}`).digest();
  return hash.subarray(0, 8);
}

function findPDA(seeds) {
  return PublicKey.findProgramAddressSync(seeds, PROGRAM_ID);
}

const [configPDA] = findPDA([Buffer.from('config')]);
const [feeVaultPDA] = findPDA([Buffer.from('fee_vault')]);
const [flashStatePDA] = findPDA([Buffer.from('flash'), payer.publicKey.toBuffer()]);

console.log(`Config PDA:     ${configPDA.toBase58()}`);
console.log(`Fee Vault PDA:  ${feeVaultPDA.toBase58()}`);
console.log(`Flash State PDA: ${flashStatePDA.toBase58()}`);
console.log();

// Build instruction data helpers
function initConfigData(feeBps, uiFeeBps) {
  const disc = anchorDisc('init_config');
  const buf = Buffer.alloc(12);
  disc.copy(buf, 0);
  buf.writeUInt16LE(feeBps, 8);
  buf.writeUInt16LE(uiFeeBps, 10);
  return buf;
}

function beginFlashData(tokenMint, amount, feeLamports) {
  const disc = anchorDisc('begin_flash');
  const buf = Buffer.alloc(8 + 32 + 8 + 8);
  disc.copy(buf, 0);
  tokenMint.toBuffer().copy(buf, 8);
  buf.writeBigUInt64LE(BigInt(amount), 40);
  buf.writeBigUInt64LE(BigInt(feeLamports), 48);
  return buf;
}

function endFlashData(amountRepaid) {
  const disc = anchorDisc('end_flash');
  const buf = Buffer.alloc(16);
  disc.copy(buf, 0);
  buf.writeBigUInt64LE(BigInt(amountRepaid), 8);
  return buf;
}

function updateConfigData(newFeeBps) {
  const disc = anchorDisc('update_config');
  const buf = Buffer.alloc(8 + 1 + 1 + 2 + 1 + 1); // disc + none(authority) + some(fee) + none(ui_fee) + none(paused)
  disc.copy(buf, 0);
  buf[8] = 0;   // None for new_authority
  buf[9] = 1;   // Some for new_fee_bps
  buf.writeUInt16LE(newFeeBps, 10);
  buf[12] = 0;  // None for new_ui_fee_bps
  buf[13] = 0;  // None for new_paused
  return buf;
}

function updateConfigPauseData(paused) {
  const disc = anchorDisc('update_config');
  const buf = Buffer.alloc(8 + 1 + 1 + 1 + 1 + 1);
  disc.copy(buf, 0);
  buf[8] = 0;   // None for new_authority
  buf[9] = 0;   // None for new_fee_bps
  buf[10] = 0;  // None for new_ui_fee_bps
  buf[11] = 1;  // Some for new_paused
  buf[12] = paused ? 1 : 0;
  return buf;
}

function withdrawFeesData(amount) {
  const disc = anchorDisc('withdraw_fees');
  const buf = Buffer.alloc(16);
  disc.copy(buf, 0);
  buf.writeBigUInt64LE(BigInt(amount), 8);
  return buf;
}

function closeConfigData() {
  return anchorDisc('close_config');
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  process.stdout.write(`  ${name}... `);
  try {
    await fn();
    console.log('✅ PASS');
    passed++;
  } catch (e) {
    console.log(`❌ FAIL: ${e.message?.substring(0, 120)}`);
    failed++;
  }
}

async function testExpectFail(name, fn) {
  process.stdout.write(`  ${name}... `);
  try {
    await fn();
    console.log('❌ FAIL (should have thrown)');
    failed++;
  } catch (e) {
    console.log('✅ PASS (correctly rejected)');
    passed++;
  }
}

// ═══════════════════════════════════════════════════════════
//  Tests
// ═══════════════════════════════════════════════════════════

async function runTests() {
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`Payer balance: ${balance / 1e9} SOL`);
  console.log();

  // ─── TEST 1: Init Config ───
  console.log('── TEST GROUP 1: init_config ──');

  await test('1.1 Init config PDA (fee=3bps, ui_fee=5bps)', async () => {
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: configPDA, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: initConfigData(3, 5),
    });
    const tx = new Transaction().add(ix);
    const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
    console.log(`(sig: ${sig.substring(0, 20)}...)`);
  });

  await test('1.2 Config PDA exists and is owned by program', async () => {
    const acc = await connection.getAccountInfo(configPDA);
    if (!acc) throw new Error('Config PDA not found');
    if (!acc.owner.equals(PROGRAM_ID)) throw new Error(`Wrong owner: ${acc.owner}`);
  });

  await testExpectFail('1.3 Double init should fail', async () => {
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: configPDA, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: initConfigData(3, 5),
    });
    const tx = new Transaction().add(ix);
    await sendAndConfirmTransaction(connection, tx, [payer]);
  });

  console.log();

  // ─── TEST 2: begin_flash + end_flash (atomic) ───
  console.log('── TEST GROUP 2: Atomic Flash Loan ──');

  const tokenMint = new PublicKey('So11111111111111111111111111111111111111112');
  const FLASH_AMOUNT = 10_000_000; // 0.01 SOL
  const FLASH_FEE = 3000; // 3 bps of 10M = 3000 lamports

  await test('2.1 Atomic begin_flash + end_flash succeeds', async () => {
    const beginIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: configPDA, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: beginFlashData(tokenMint, FLASH_AMOUNT, FLASH_FEE),
    });

    const endIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: feeVaultPDA, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: endFlashData(0),
    });

    const tx = new Transaction().add(beginIx, endIx);
    const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
    console.log(`(sig: ${sig.substring(0, 20)}...)`);
  });

  await test('2.2 Fee vault received fee', async () => {
    const acc = await connection.getAccountInfo(feeVaultPDA);
    if (!acc) throw new Error('Fee vault not found');
    if (acc.lamports < FLASH_FEE) throw new Error(`Vault only has ${acc.lamports}, expected >= ${FLASH_FEE}`);
    console.log(`(vault: ${acc.lamports} lamports)`);
  });

  await test('2.3 Flash state PDA was closed', async () => {
    const acc = await connection.getAccountInfo(flashStatePDA);
    if (acc !== null) throw new Error('Flash state should be closed');
  });

  console.log();

  // ─── TEST 3: Rejections ───
  console.log('── TEST GROUP 3: Rejection Tests ──');

  await testExpectFail('3.1 begin_flash without end_flash', async () => {
    const beginIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: configPDA, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: beginFlashData(tokenMint, FLASH_AMOUNT, FLASH_FEE),
    });
    const tx = new Transaction().add(beginIx);
    await sendAndConfirmTransaction(connection, tx, [payer]);
  });

  await testExpectFail('3.2 begin_flash with amount=0', async () => {
    const beginIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: configPDA, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: beginFlashData(tokenMint, 0, 0),
    });
    const endIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: feeVaultPDA, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: endFlashData(0),
    });
    const tx = new Transaction().add(beginIx, endIx);
    await sendAndConfirmTransaction(connection, tx, [payer]);
  });

  await testExpectFail('3.3 begin_flash with fee=0 (below minimum)', async () => {
    const beginIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: configPDA, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: beginFlashData(tokenMint, FLASH_AMOUNT, 0),
    });
    const endIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: feeVaultPDA, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: endFlashData(0),
    });
    const tx = new Transaction().add(beginIx, endIx);
    await sendAndConfirmTransaction(connection, tx, [payer]);
  });

  console.log();

  // ─── TEST 4: update_config ───
  console.log('── TEST GROUP 4: Config Management ──');

  await test('4.1 Update fee from 3 bps to 10 bps', async () => {
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: configPDA, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      ],
      data: updateConfigData(10),
    });
    const tx = new Transaction().add(ix);
    await sendAndConfirmTransaction(connection, tx, [payer]);
  });

  await test('4.2 Flash loan with new fee (10 bps)', async () => {
    // 10M * 10 / 10000 = 10000 lamports min fee
    const newFee = 10000;
    const beginIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: configPDA, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: beginFlashData(tokenMint, FLASH_AMOUNT, newFee),
    });
    const endIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: feeVaultPDA, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: endFlashData(0),
    });
    const tx = new Transaction().add(beginIx, endIx);
    await sendAndConfirmTransaction(connection, tx, [payer]);
  });

  await test('4.3 Restore fee to 3 bps', async () => {
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: configPDA, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      ],
      data: updateConfigData(3),
    });
    const tx = new Transaction().add(ix);
    await sendAndConfirmTransaction(connection, tx, [payer]);
  });

  console.log();

  // ─── TEST 5: Pause/Unpause ───
  console.log('── TEST GROUP 5: Pause Mechanism ──');

  await test('5.1 Pause the program', async () => {
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: configPDA, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      ],
      data: updateConfigPauseData(true),
    });
    const tx = new Transaction().add(ix);
    await sendAndConfirmTransaction(connection, tx, [payer]);
  });

  await testExpectFail('5.2 Flash loan rejected when paused', async () => {
    const beginIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: configPDA, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: beginFlashData(tokenMint, FLASH_AMOUNT, FLASH_FEE),
    });
    const endIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: feeVaultPDA, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: endFlashData(0),
    });
    const tx = new Transaction().add(beginIx, endIx);
    await sendAndConfirmTransaction(connection, tx, [payer]);
  });

  await test('5.3 Unpause the program', async () => {
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: configPDA, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      ],
      data: updateConfigPauseData(false),
    });
    const tx = new Transaction().add(ix);
    await sendAndConfirmTransaction(connection, tx, [payer]);
  });

  await test('5.4 Flash loan works after unpause', async () => {
    const beginIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: configPDA, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: beginFlashData(tokenMint, FLASH_AMOUNT, FLASH_FEE),
    });
    const endIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: feeVaultPDA, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: endFlashData(0),
    });
    const tx = new Transaction().add(beginIx, endIx);
    await sendAndConfirmTransaction(connection, tx, [payer]);
  });

  console.log();

  // ─── TEST 6: Withdraw Fees ───
  console.log('── TEST GROUP 6: Withdraw Fees ──');

  await test('6.1 Check vault balance', async () => {
    const acc = await connection.getAccountInfo(feeVaultPDA);
    console.log(`(vault: ${acc.lamports} lamports)`);
  });

  await test('6.2 Withdraw fees from vault', async () => {
    const acc = await connection.getAccountInfo(feeVaultPDA);
    // Withdraw all except rent minimum (890880)
    const withdrawable = acc.lamports - 890880;
    if (withdrawable <= 0) {
      console.log('(nothing to withdraw)');
      return;
    }
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: configPDA, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: feeVaultPDA, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: withdrawFeesData(withdrawable),
    });
    const tx = new Transaction().add(ix);
    await sendAndConfirmTransaction(connection, tx, [payer]);
    console.log(`(withdrew ${withdrawable} lamports)`);
  });

  await testExpectFail('6.3 Withdraw by non-authority should fail', async () => {
    const fakeWallet = Keypair.generate();
    // Fund fake wallet
    const transferIx = SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: fakeWallet.publicKey,
      lamports: 100_000_000,
    });
    const fundTx = new Transaction().add(transferIx);
    await sendAndConfirmTransaction(connection, fundTx, [payer]);

    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: configPDA, isSigner: false, isWritable: true },
        { pubkey: fakeWallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: feeVaultPDA, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: withdrawFeesData(1000),
    });
    const tx = new Transaction().add(ix);
    await sendAndConfirmTransaction(connection, tx, [fakeWallet]);
  });

  console.log();

  // ─── TEST 7: Multi-flash in sequence ───
  console.log('── TEST GROUP 7: Sequential Flash Loans ──');

  for (let i = 0; i < 3; i++) {
    await test(`7.${i + 1} Flash loan #${i + 1} (sequential)`, async () => {
      const beginIx = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: flashStatePDA, isSigner: false, isWritable: true },
          { pubkey: configPDA, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: beginFlashData(tokenMint, FLASH_AMOUNT * (i + 1), FLASH_FEE * (i + 1)),
      });
      const endIx = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: flashStatePDA, isSigner: false, isWritable: true },
          { pubkey: feeVaultPDA, isSigner: false, isWritable: true },
          { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: endFlashData(0),
      });
      const tx = new Transaction().add(beginIx, endIx);
      await sendAndConfirmTransaction(connection, tx, [payer]);
    });
  }

  console.log();

  // ─── TEST 8: Sandwich (user IX between begin/end) ───
  console.log('── TEST GROUP 8: Sandwich Test ──');

  await test('8.1 begin_flash → dummy_ix → end_flash', async () => {
    const beginIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: configPDA, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: beginFlashData(tokenMint, 50_000_000, 15000),
    });
    // Dummy: self-transfer 0 lamports (simulates arb)
    const dummyIx = SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: payer.publicKey,
      lamports: 0,
    });
    const endIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: flashStatePDA, isSigner: false, isWritable: true },
        { pubkey: feeVaultPDA, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: endFlashData(0),
    });
    const tx = new Transaction().add(beginIx, dummyIx, endIx);
    await sendAndConfirmTransaction(connection, tx, [payer]);
  });

  console.log();

  // ═══════════════════════════════════════════════════════════
  //  Results
  // ═══════════════════════════════════════════════════════════
  
  const finalBalance = await connection.getBalance(payer.publicKey);
  const vaultAcc = await connection.getAccountInfo(feeVaultPDA);
  
  console.log('═══════════════════════════════════════════');
  console.log(` RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`Payer balance: ${finalBalance / 1e9} SOL`);
  console.log(`Fee vault: ${vaultAcc ? vaultAcc.lamports : 0} lamports`);
  console.log('═══════════════════════════════════════════');
  
  if (failed > 0) process.exit(1);
}

runTests().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
