// services/portfolioSummaryService.js
import { getUserPortfolios } from './portfolioService.js';
import { getPositionsByPortfolioId } from './portfolioPositionService.js'; // we'll need this

/**
 * Fetches all portfolios for a user with computed total value
 * totalValue = sum of (position.quantity * live_price.price) + portfolio.cash
 */
export async function getUserPortfoliosWithTotals(user_id) {
  try {
    // 1️⃣ Get all portfolios
    const portfolios = await getUserPortfolios(user_id);

    // 2️⃣ For each portfolio, fetch positions and compute total value
    const portfoliosWithTotals = await Promise.all(
      portfolios.map(async (p) => {
        const positions = await getPositionsByPortfolioId(p.id);

        // Sum positions value (quantity * price)
        const positionsValue = positions.reduce((sum, pos) => {
          const price = pos.price ?? 0;
          const qty = pos.quantity ?? 0;
          return sum + price * qty;
        }, 0);

        const totalValue = (p.cash ?? 0) + positionsValue;

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
    console.error('[portfolioSummaryService] getUserPortfoliosWithTotals error:', err);
    return { portfolios: [], totalValueAll: 0 };
  }
}
