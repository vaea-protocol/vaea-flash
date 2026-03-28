/**
 * VAEA Flash — Local Instruction Builder
 *
 * Constructs begin_flash and end_flash instructions 100% client-side.
 * Eliminates the HTTP call to /v1/build — saves ~80-100ms per TX.
 *
 * This is possible because ALL instruction data is deterministic:
 * - PDA seeds: [b"flash", payer, token_mint], [b"config"], [b"fee_vault"]
 * - Discriminators: sha256("global:begin_flash")[..8]
 * - Account lists: 5 fixed accounts per IX
 * - Fee: 3 bps (SDK) / 5 bps (UI) — hardcoded in programme
 *
 * Zero RPC, zero HTTP, zero external dependency.
 */

import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from '@solana/web3.js';
import { createHash } from 'crypto';
import { VAEA_PROGRAM_ID } from './types';

// ═══════════════════════════════════════════════════════════
//  Constants (mirrored from backend/vaea-core/src/constants.rs)
// ═══════════════════════════════════════════════════════════

const PROGRAM_ID = new PublicKey(VAEA_PROGRAM_ID);

/** SDK fee: 3 bps (0.03%) */
export const FEE_BPS_SDK = 3;
/** UI fee: 5 bps (0.05%) */
export const FEE_BPS_UI = 5;

/** Token registry — all mints and decimals for local IX construction */
export const TOKEN_REGISTRY: Record<string, { mint: PublicKey; decimals: number }> = {
  SOL:      { mint: new PublicKey('So11111111111111111111111111111111111111112'),   decimals: 9 },
  USDC:     { mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), decimals: 6 },
  USDT:     { mint: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'), decimals: 6 },
  JitoSOL:  { mint: new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'), decimals: 9 },
  JupSOL:   { mint: new PublicKey('jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v'), decimals: 9 },
  JUP:      { mint: new PublicKey('JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'), decimals: 6 },
  JLP:      { mint: new PublicKey('27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4'), decimals: 6 },
  cbBTC:    { mint: new PublicKey('cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij'),  decimals: 8 },
  mSOL:     { mint: new PublicKey('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'), decimals: 9 },
  bSOL:     { mint: new PublicKey('bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1'), decimals: 9 },
  INF:      { mint: new PublicKey('5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm'), decimals: 9 },
  laineSOL: { mint: new PublicKey('LAinEtNLgpmCP9Rvsf5Hn8W6EhNiKLZQti1xfWMLy6X'), decimals: 9 },
  BONK:     { mint: new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'), decimals: 5 },
  WIF:      { mint: new PublicKey('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'), decimals: 6 },
  RAY:      { mint: new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'), decimals: 6 },
  HNT:      { mint: new PublicKey('hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux'), decimals: 8 },
  RNDR:     { mint: new PublicKey('rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof'), decimals: 8 },
  JITO:     { mint: new PublicKey('jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL'), decimals: 9 },
  KMNO:     { mint: new PublicKey('KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS'), decimals: 6 },
  TRUMP:    { mint: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'), decimals: 6 },
  PENGU:    { mint: new PublicKey('2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv'), decimals: 6 },
  VIRTUAL:  { mint: new PublicKey('HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC'), decimals: 9 },
  PYUSD:    { mint: new PublicKey('2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo'), decimals: 6 },
  USDS:     { mint: new PublicKey('USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA'), decimals: 6 },
  USD1:     { mint: new PublicKey('USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB'), decimals: 6 },
  USDG:     { mint: new PublicKey('2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH'), decimals: 6 },
  EURC:     { mint: new PublicKey('HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr'), decimals: 6 },
};

// ═══════════════════════════════════════════════════════════
//  Anchor Discriminators (pre-computed, never change)
// ═══════════════════════════════════════════════════════════

function anchorDiscriminator(name: string): Buffer {
  return createHash('sha256')
    .update(`global:${name}`)
    .digest()
    .subarray(0, 8);
}

// Cache them — they're constants
const DISC_BEGIN_FLASH = anchorDiscriminator('begin_flash');
const DISC_END_FLASH = anchorDiscriminator('end_flash');

// ═══════════════════════════════════════════════════════════
//  PDA derivation (deterministic, no RPC needed)
// ═══════════════════════════════════════════════════════════

/** Derive flash_state PDA: [b"flash", payer, token_mint] */
function deriveFlashState(payer: PublicKey, tokenMint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('flash'), payer.toBuffer(), tokenMint.toBuffer()],
    PROGRAM_ID,
  )[0];
}

/** Derive config PDA: [b"config"] */
function deriveConfig(): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from('config')], PROGRAM_ID)[0];
}

/** Derive fee_vault PDA: [b"fee_vault"] */
function deriveFeeVault(): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from('fee_vault')], PROGRAM_ID)[0];
}

// Cache static PDAs (they never change)
const CONFIG_PDA = deriveConfig();
const FEE_VAULT_PDA = deriveFeeVault();

// ═══════════════════════════════════════════════════════════
//  LocalBuilder — the core
// ═══════════════════════════════════════════════════════════

export interface LocalBuildParams {
  /** Payer public key */
  payer: PublicKey;
  /** Token symbol (e.g. "SOL", "mSOL") or mint PublicKey */
  token: string | PublicKey;
  /** Amount in human units (e.g. 1000 for 1000 SOL) */
  amount: number;
  /** Fee source: 'sdk' (3 bps) or 'ui' (5 bps) */
  source?: 'sdk' | 'ui';
}

export interface LocalBuildResult {
  /** begin_flash instruction */
  beginFlash: TransactionInstruction;
  /** end_flash instruction */
  endFlash: TransactionInstruction;
  /** Token mint used */
  tokenMint: PublicKey;
  /** Decimals for this token */
  decimals: number;
  /** Expected fee in native units */
  expectedFeeNative: bigint;
}

/**
 * Build begin_flash and end_flash instructions 100% locally.
 *
 * **Zero network calls.** ~0.1ms execution time.
 *
 * @example
 * ```typescript
 * const { beginFlash, endFlash } = localBuild({
 *   payer: wallet.publicKey,
 *   token: 'SOL',
 *   amount: 1000,
 * });
 * const tx = new Transaction().add(beginFlash, myArbIx, endFlash);
 * ```
 */
export function localBuild(params: LocalBuildParams): LocalBuildResult {
  // 1. Resolve token
  let tokenMint: PublicKey;
  let decimals: number;

  if (params.token instanceof PublicKey) {
    tokenMint = params.token;
    // Find decimals from registry
    const entry = Object.values(TOKEN_REGISTRY).find(
      t => t.mint.equals(params.token as PublicKey)
    );
    decimals = entry?.decimals ?? 9; // default to 9 for unknown
  } else {
    const entry = TOKEN_REGISTRY[params.token];
    if (!entry) {
      throw new Error(`Unknown token: ${params.token}. Use PublicKey for custom tokens.`);
    }
    tokenMint = entry.mint;
    decimals = entry.decimals;
  }

  // 2. Calculate fee
  const feeBps = params.source === 'ui' ? FEE_BPS_UI : FEE_BPS_SDK;
  const decimalsFactor = BigInt(10 ** decimals);
  const amountNative = BigInt(Math.floor(params.amount * Number(decimalsFactor)));
  const expectedFeeNative = amountNative * BigInt(feeBps) / 10_000n;

  // 3. Derive PDA
  const flashState = deriveFlashState(params.payer, tokenMint);

  // 4. Build begin_flash instruction data
  const beginData = Buffer.alloc(8 + 32 + 8 + 8); // disc + mint + amount + fee
  DISC_BEGIN_FLASH.copy(beginData, 0);
  tokenMint.toBuffer().copy(beginData, 8);
  beginData.writeBigUInt64LE(amountNative, 40);
  beginData.writeBigUInt64LE(expectedFeeNative, 48);

  const beginFlash = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: params.payer, isSigner: true, isWritable: true },
      { pubkey: flashState,   isSigner: false, isWritable: true },
      { pubkey: CONFIG_PDA,   isSigner: false, isWritable: false },
      { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId,    isSigner: false, isWritable: false },
    ],
    data: beginData,
  });

  // 5. Build end_flash instruction data
  const endData = Buffer.alloc(8 + 8); // disc + amount_repaid
  DISC_END_FLASH.copy(endData, 0);
  endData.writeBigUInt64LE(amountNative, 8);

  const endFlash = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: params.payer,    isSigner: true,  isWritable: true },
      { pubkey: flashState,      isSigner: false, isWritable: true },
      { pubkey: FEE_VAULT_PDA,   isSigner: false, isWritable: true },
      { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId,    isSigner: false, isWritable: false },
    ],
    data: endData,
  });

  return { beginFlash, endFlash, tokenMint, decimals, expectedFeeNative };
}
