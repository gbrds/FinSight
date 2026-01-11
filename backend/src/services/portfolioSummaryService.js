// services/portfolioSummaryService.js
import * as portfolioRepo from "../repositories/portfolioRepository.js";

/**
 * Fetches all portfolios for a user with computed total value and daily % change
 */
export async function getUserPortfoliosWithTotals(user_id) {
  try {
    // 1️⃣ Get all portfolios
    const portfolios = await portfolioRepo.findPortfoliosByUserId(user_id);

    // 2️⃣ For each portfolio, get positions and compute metrics
    const portfoliosWithTotals = await Promise.all(
      portfolios.map(async (p) => {
        const positions = await portfolioRepo.getPortfolioPositionsWithLivePrices(p.id);

        const positionsValue = positions.reduce((sum, pos) => {
          const price = pos.live_prices?.price ?? 0;
          const qty = pos.quantity ?? 0;
          return sum + price * qty;
        }, 0);

        // Calculate total cost for % change
        const totalCost = positions.reduce((sum, pos) => {
          const cost = (pos.avg_buy_price ?? 0) * (pos.quantity ?? 0);
          return sum + cost;
        }, 0);

        // % change
        const changePercent = totalCost > 0 ? ((positionsValue - totalCost) / totalCost) * 100 : 0;

        // Cash
        const cash = await portfolioRepo.getPortfolioCashBalance(p.id);

        return {
          ...p,
          positions,
          totalValue: positionsValue + cash,
          cash,
          changePercent,
        };
      })
    );

    // Total across all portfolios
    const totalValueAll = portfoliosWithTotals.reduce((sum, p) => sum + p.totalValue, 0);

    return { portfolios: portfoliosWithTotals, totalValueAll };
  } catch (err) {
    console.error("[portfolioSummaryService] getUserPortfoliosWithTotals error:", err);
    return { portfolios: [], totalValueAll: 0 };
  }
}