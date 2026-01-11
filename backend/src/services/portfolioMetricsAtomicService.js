// services/portfolioMetricsAtomicService.js
import * as portfolioRepo from "../repositories/portfolioRepository.js";

export async function recalcPortfolioMetrics(portfolio_id) {
  const now = new Date();
  let positionsValue = 0;
  let unrealizedPnl = 0;
  let realizedPnl = 0;
  let cash = 0;

  try {
    // 1️⃣ Fetch positions with live prices
    const positions = await portfolioRepo.getPortfolioPositionsWithLivePrices(portfolio_id);

    for (const pos of positions) {
      const price = pos.live_prices?.price;
      if (price == null) continue;

      const marketValue = pos.quantity * price;
      const unrealized = (price - pos.avg_buy_price) * pos.quantity;

      positionsValue += marketValue;
      unrealizedPnl += unrealized;
      realizedPnl += pos.realized_pnl ?? 0;

      // 2️⃣ Upsert metrics
      try {
        await portfolioRepo.upsertPositionMetrics({
          position_id: pos.id,
          portfolio_id: pos.portfolio_id,
          symbol: pos.symbol,
          current_price: price,
          market_value: marketValue,
          unrealized_pnl: unrealized,
          unrealized_pnl_pct: pos.quantity && pos.avg_buy_price ? unrealized / (pos.avg_buy_price * pos.quantity) : 0,
          updated_at: now,
        });
      } catch (err) {
        console.error(`[portfolioMetricsAtomicService] Failed upsert metrics for ${pos.id}:`, err.message);
      }
    }

    // 3️⃣ Fetch cash balance
    try {
      cash = await portfolioRepo.getPortfolioCashBalance(portfolio_id);
    } catch (err) {
      console.error(`[portfolioMetricsAtomicService] Failed fetch cash for ${portfolio_id}:`, err.message);
    }

    const totalValue = positionsValue + cash;

    // 4️⃣ Insert equity curve snapshot
    try {
      await portfolioRepo.insertEquityCurve({
        portfolio_id,
        timestamp: now,
        total_value: totalValue,
        cash_balance: cash,
        positions_value: positionsValue,
        unrealized_pnl: unrealizedPnl,
        realized_pnl: realizedPnl,
      });
    } catch (err) {
      console.error(`[portfolioMetricsAtomicService] Failed insert equity curve for ${portfolio_id}:`, err.message);
    }

    return { portfolio_id, totalValue, cash, positionsValue, unrealizedPnl, realizedPnl };
  } catch (err) {
    console.error(`[portfolioMetricsAtomicService] Unexpected error for ${portfolio_id}:`, err.message);
    return { portfolio_id, totalValue: 0, cash: 0, positionsValue: 0, unrealizedPnl: 0, realizedPnl: 0 };
  }
};