// services/portfolioSummaryService.js
import * as portfolioRepo from "../repositories/portfolioRepository.js";
import { getPositionsByPortfolioId } from "./portfolioPositionService.js";

/**
 * Fetches all portfolios for a user with computed total value
 * totalValue = sum of (position.quantity * live_price.price) + portfolio.cash
 */
export async function getUserPortfoliosWithTotals(user_id) {
  try {
    // 1️⃣ Get all portfolios for the user
    const portfolios = await portfolioRepo.findPortfoliosByUserId(user_id);

    // 2️⃣ For each portfolio, fetch positions and compute total value
    const portfoliosWithTotals = await Promise.all(
      portfolios.map(async (p) => {
        const positions = await getPositionsByPortfolioId(p.id);

        const positionsValue = positions.reduce((sum, pos) => {
          const price = pos.price ?? 0;
          const qty = pos.quantity ?? 0;
          return sum + price * qty;
        }, 0);

        const totalValue = (p.cash_balance ?? 0) + positionsValue;

        return {
          ...p,
          positions,
          totalValue,
        };
      })
    );

    // 3️⃣ Compute total value of all portfolios
    const totalValueAll = portfoliosWithTotals.reduce(
      (sum, p) => sum + p.totalValue,
      0
    );

    return { portfolios: portfoliosWithTotals, totalValueAll };
  } catch (err) {
    console.error("[portfolioSummaryService] getUserPortfoliosWithTotals error:", err);
    return { portfolios: [], totalValueAll: 0 };
  }
}