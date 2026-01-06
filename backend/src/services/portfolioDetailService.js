// services/portfolioDetailService.js
import { supabasePublic as supabase } from "../clients/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Get portfolio details with positions and their calculated metrics
 */
export async function getPortfolioDetail({ portfolio_id, user_id }) {
  try {
    // 1️⃣ Get portfolio
    const { data: portfolioArr, error: portErr } = await supabase
      .from("portfolios")
      .select("*")
      .eq("id", portfolio_id)
      .eq("user_id", user_id)
      .limit(1);

    if (portErr) throw portErr;
    const portfolio = portfolioArr?.[0];
    if (!portfolio) return null;

    // 2️⃣ Get positions for portfolio + live prices
    const { data: positionsArr, error: posErr } = await supabase
      .from("portfolio_positions")
      .select(`
        *,
        live_prices:live_price_id(*)
      `)
      .eq("portfolio_id", portfolio_id);

    if (posErr) throw posErr;

    // 3️⃣ Map positions with calculated metrics
    const positions = positionsArr.map((pos) => {
      const price = pos.live_prices?.price || 0;
      const value = pos.quantity * price;
      const totalPL = (price - pos.avg_buy_price) * pos.quantity;
      const dayChange = pos.live_prices?.day_change ?? 0;

      return {
        ...pos,
        price,
        value,
        totalPL,
        dayChange,
      };
    });

    // 4️⃣ Calculate totals
    const totalValue = positions.reduce((acc, p) => acc + p.value, 0);
    const totalGainLoss = positions.reduce((acc, p) => acc + p.totalPL, 0);
    const dayChangeTotal = positions.reduce(
      (acc, p) => acc + p.value * (p.dayChange / 100),
      0
    );

    return {
      portfolio,
      positions,
      totals: { totalValue, totalGainLoss, dayChangeTotal },
    };
  } catch (err) {
    console.error("[portfolioDetailService] getPortfolioDetail error:", err.message);
    return null;
  }
}

/**
 * Create a transaction for a position
 */
export async function createTransaction(userToken, payload) {
  try {
    const { addTransaction } = await import("./transactionService.js");
    return await addTransaction(userToken, payload);
  } catch (err) {
    console.error("[portfolioDetailService] createTransaction error:", err.message);
    return { transaction: null, updatedPosition: null };
  }
}

/**
 * Add a new position to a portfolio
 */
export async function createPosition({ portfolio_id, symbol, user_id }) {
  try {
    const { addPosition } = await import("./portfolioPositionService.js");
    return await addPosition({ portfolio_id, symbol, user_id });
  } catch (err) {
    console.error("[portfolioDetailService] createPosition error:", err.message);
    return null;
  }
}