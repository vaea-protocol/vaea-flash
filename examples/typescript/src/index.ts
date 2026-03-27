import { Connection, Keypair, TransactionInstruction } from "@solana/web3.js";
import { VaeaFlash } from "@vaea/flash";

/**
 * VAEA Flash — Arbitrage Example (TypeScript)
 *
 * Demonstrates borrowing SOL via flash loan, executing custom
 * arbitrage instructions, and repaying atomically.
 *
 * Usage:
 *   RPC_URL=https://... WALLET_PRIVATE_KEY=<base58> npx ts-node src/index.ts
 */
async function main() {
  console.log("⚡ VAEA Flash — Arbitrage Example\n");

  // ────────────────────────────────────────
  // 1. Connect wallet & RPC
  // ────────────────────────────────────────
  const rpcUrl = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");

  const keyBytes = Uint8Array.from(
    JSON.parse(process.env.WALLET_PRIVATE_KEY || "[]")
  );
  if (keyBytes.length !== 64) {
    console.error("Set WALLET_PRIVATE_KEY (JSON array of 64 bytes)");
    process.exit(1);
  }
  const wallet = Keypair.fromSecretKey(keyBytes);
  console.log(`Wallet: ${wallet.publicKey.toBase58()}`);

  // ────────────────────────────────────────
  // 2. Initialize VAEA Flash
  // ────────────────────────────────────────
  const flash = new VaeaFlash({ source: "sdk" });

  // ────────────────────────────────────────
  // 3. Check capacity
  // ────────────────────────────────────────
  const capacity = await flash.getCapacity();
  const sol = capacity.tokens.find((t) => t.symbol === "SOL");
  if (sol) {
    console.log(
      `SOL available: ${sol.max_amount.toLocaleString()} (${sol.route_type})`
    );
    console.log(`Fee: ${sol.fee_sdk.total_pct}%`);
  }

  // ────────────────────────────────────────
  // 4. Get a quote
  // ────────────────────────────────────────
  const BORROW = 500;
  const quote = await flash.getQuote("SOL", BORROW);

  console.log(`\nQuote for ${BORROW} SOL:`);
  console.log(`  Route: ${quote.route.type}`);
  console.log(`  Total fee: ${quote.fee_breakdown.total_fee_pct}%`);
  console.log(
    `  Cost: ${quote.fee_breakdown.total_fee_sol.toFixed(4)} SOL ($${quote.fee_breakdown.total_fee_usd.toFixed(2)})`
  );

  // ────────────────────────────────────────
  // 5. Execute flash loan
  // ────────────────────────────────────────
  console.log("\n🚀 Executing flash loan...");

  const sig = await flash.execute({
    token: "SOL",
    amount: BORROW,
    maxFeeBps: 5,
    onFunds: async (ixs: TransactionInstruction[]) => {
      // ── Insert your arbitrage logic here ──
      // Example: swap SOL→USDC on Jupiter, swap USDC→SOL on Orca
      // ixs.push(jupiterSwapIx);
      // ixs.push(orcaSwapIx);
      console.log("  → Injected arbitrage instructions");
      return ixs;
    },
  });

  console.log(`\n🎉 Success!`);
  console.log(`TX: ${sig}`);
  console.log(`https://solscan.io/tx/${sig}`);
}

main().catch(console.error);
