// services/portfolioDetailService.js
import * as portfolioRepo from "../repositories/portfolioRepository.js";

/**
 * Get portfolio details with positions and their calculated metrics
 */
export async function getPortfolioDetail({ portfolio_id, user_id }) {
  try {
    // 1️⃣ Fetch portfolio (user check included)
    const portfolios = await portfolioRepo.findPortfoliosByUserId(user_id);
    const portfolio = portfolios.find((p) => p.id === portfolio_id);
    if (!portfolio) return null;

    // 2️⃣ Fetch positions with metrics + live prices
    const positionsRaw = await portfolioRepo.getPortfolioPositionsWithLivePrices(portfolio_id);

    // 3️⃣ Map positions with calculated metrics
    const positions = positionsRaw.map((pos) => {
      const price = pos.live_prices?.price || 0;
      const quantity = Number(pos.quantity ?? 0);
      const avgBuy = Number(pos.avg_buy_price ?? 0);

      const value = quantity * price;
      const totalPL = (price - avgBuy) * quantity;

      const dayChange = Number(pos.live_prices?.day_change ?? 0);

      return {
        ...pos,
        quantity,
        avg_buy_price: avgBuy,
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
    console.error("[portfolioDetailService] getPortfolioDetail error:", err);
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
    console.error("[portfolioDetailService] createTransaction error:", err);
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
    console.error("[portfolioDetailService] createPosition error:", err);
    return null;
  }
}