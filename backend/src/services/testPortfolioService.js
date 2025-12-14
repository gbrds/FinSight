// testPortfolioFlow.js
import { supabase } from './supabaseClient.js';
import { createPortfolio } from './portfolioService.js';
import { addPosition } from './portfolioPositionService.js';
import { addTransaction } from './transactionService.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    // ------------------------
    // 1️⃣ Login user
    // ------------------------
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: process.env.USER_EMAIL,
      password: process.env.USER_PASSWORD
    });

    if (loginError) throw new Error(`Login failed: ${loginError.message}`);
    const user_id = loginData.user.id;
    console.log("✅ Logged in as user:", user_id);

    // ------------------------
    // 2️⃣ Create portfolio
    // ------------------------
    const portfolioName = "Test Portfolio";
    const portfolio = await createPortfolio({ user_id, name: portfolioName });
    console.log("🗂 Created portfolio:", portfolio);

    // ------------------------
    // 3️⃣ Add position
    // ------------------------
    const symbol = "AAPL"; // Example symbol
    const position = await addPosition({ portfolio_id: portfolio.id, symbol });

    console.log("📌 Added position:", position);

    // Check if symbol went to pending_fetch
    const { data: pending, error: pendingErr } = await supabase
      .from('pending_fetch')
      .select('*')
      .eq('symbol', symbol)
      .maybeSingle();

    if (pendingErr) {
      console.error("⚠️ Error checking pending_fetch:", pendingErr.message);
    } else if (pending) {
      console.log(`⚠️ Symbol ${symbol} added to pending_fetch!`);
    } else {
      console.log(`✅ Symbol ${symbol} is fine, no pending_fetch entry.`);
    }

    // ------------------------
    // 4️⃣ Add transaction
    // ------------------------
    const transactionData = {
      position_id: "f453e1bc-024d-4b23-a941-22f68afa2bbd",
      type: "sell",
      quantity: 5,
      price: 160,
      fee: 0
    };
    const transaction = await addTransaction(transactionData);
    console.log("💸 Added transaction:", transaction);

    // ------------------------
    // 5️⃣ Fetch updated position to see new quantity / avg_price
    // ------------------------
    const { data: updatedPos, error: posErr } = await supabase
      .from("portfolio_positions")
      .select("*")
      .eq("id", position.id)
      .single();

    if (posErr) throw new Error(`Failed to fetch updated position: ${posErr.message}`);
    console.log("🔄 Updated position after transaction:", updatedPos);

    // ------------------------
    // 6️⃣ Sign out
    // ------------------------
    await supabase.auth.signOut();
    console.log("👋 Logged out, session ended.");

  } catch (err) {
    console.error("❌ Error during test flow:", err);
  }
}

main();