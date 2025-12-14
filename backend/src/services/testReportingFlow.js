// backend/testReportingFlow.js
import { supabase } from './supabaseClient.js';
import { createPortfolio, getUserPortfolios } from './portfolioService.js';
import { addPosition } from './portfolioPositionService.js';
import { addTransaction } from './transactionService.js';
import { getPortfolioReport, snapshotPortfolioEquity, getEquityCurve } from './reportingService.js';
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
    const portfolioName = "PnL Test Portfolio";
    const portfolio = await createPortfolio({ user_id, name: portfolioName });
    console.log("🗂 Created portfolio:", portfolio);

    // ------------------------
    // 3️⃣ Add position
    // ------------------------
    const symbol = "AAPL";
    const position = await addPosition({ portfolio_id: portfolio.id, symbol });
    console.log("📌 Added position:", position);

    // ------------------------
    // 4️⃣ Add transactions
    // ------------------------
    const transactions = [
      { type: 'buy', quantity: 10, price: 150 },
      { type: 'buy', quantity: 5, price: 160 },
      { type: 'sell', quantity: 8, price: 170 }
    ];

    for (const tx of transactions) {
      const result = await addTransaction({
        position_id: position.id,
        ...tx
      });
      console.log(`💸 Added ${tx.type} transaction:`, result.transaction);
    }

    // ------------------------
    // 5️⃣ Snapshot equity curve
    // ------------------------
    const snapshot = await snapshotPortfolioEquity(portfolio.id);
    console.log("📈 Snapshot saved to equity curve:", snapshot);

    // ------------------------
    // 6️⃣ Fetch current portfolio report
    // ------------------------
    const report = await getPortfolioReport(portfolio.id);
    console.log("📊 Current portfolio report:", report);

    // ------------------------
    // 7️⃣ Fetch equity curve history
    // ------------------------
    const history = await getEquityCurve(portfolio.id);
    console.log("📈 Equity curve history:", history);

    // ------------------------
    // 8️⃣ Sign out
    // ------------------------
    await supabase.auth.signOut();
    console.log("👋 Logged out, session ended.");

  } catch (err) {
    console.error("❌ Error during reporting test flow:", err);
  }
}

main();