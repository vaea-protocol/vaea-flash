use std::env;
use dotenv::dotenv;
use solana_client::rpc_client::RpcClient;
use solana_sdk::signature::{Keypair, Signer};
use vaea_flash_sdk::{VaeaFlash, BorrowParams};

/// Example: Liquidation bot using VAEA Flash (Rust)
///
/// Borrows JitoSOL to liquidate an undercollateralized lending position,
/// captures the liquidation bonus, and repays the flash loan.
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    println!("⚡ VAEA Flash — Liquidation Bot Example (Rust)\n");

    // 1. Setup
    let rpc_url = env::var("RPC_URL")
        .unwrap_or_else(|_| "https://api.mainnet-beta.solana.com".to_string());
    let secret_key = env::var("WALLET_PRIVATE_KEY")
        .expect("WALLET_PRIVATE_KEY must be set");
    
    let decoded = bs58::decode(&secret_key).into_vec()?;
    let payer = Keypair::from_bytes(&decoded)?;
    println!("Wallet: {}", payer.pubkey());

    // 2. Initialize VAEA Flash
    let flash = VaeaFlash::with_rpc(
        "https://api.vaea.fi",
        &rpc_url,
        &payer,
    )?;

    // 3. Check capacity before borrowing
    let capacity = flash.get_capacity().await?;
    let jitosol_cap = capacity.iter()
        .find(|t| t.symbol == "JitoSOL")
        .expect("JitoSOL not found in capacity list");
    
    println!("JitoSOL available: {} (${:.0})", 
        jitosol_cap.max_amount, jitosol_cap.max_amount_usd);

    // 4. Get a quote
    let borrow_amount = 200.0; // 200 JitoSOL
    let quote = flash.get_quote("JitoSOL", borrow_amount).await?;
    
    println!("\nQuote for {} JitoSOL:", borrow_amount);
    println!("  Route: {:?}", quote.route_type);
    println!("  Fee: {}%", quote.fee.total_pct);

    // 5. Build liquidation instruction
    // In production, this would be a real Marginfi/Kamino liquidation IX
    let liquidation_ix = solana_sdk::instruction::Instruction {
        program_id: solana_sdk::pubkey!("MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA"),
        accounts: vec![], // Populate with real accounts
        data: vec![],     // Populate with real data
    };

    // 6. Execute flash loan
    println!("\n🚀 Executing flash loan...");
    let sig = flash.execute(BorrowParams {
        token: "JitoSOL".into(),
        amount: borrow_amount,
        instructions: vec![liquidation_ix],
        slippage_bps: Some(50),
        max_fee_bps: Some(15), // Max 0.15% fee
    }).await?;

    println!("🎉 Success! TX: {}", sig);
    println!("🔗 https://solscan.io/tx/{}", sig);

    Ok(())
}
