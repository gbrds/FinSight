import { v4 as uuidv4 } from "uuid";
import * as repo from "../repositories/reportingRepository.js";

/**
 * Fetch portfolio positions + metrics and aggregate totals
 */
export async function getPortfolioReport(portfolio_id) {
  let positions = [];
  let totalValue = 0;
  let totalUnrealized = 0;
  let totalRealized = 0;
  let totalPositionsValue = 0;
  let cashBalance = 0; // handled separately in portfolioMetrics

  try {
    const rows = await repo.getPortfolioPositionsWithMetrics(portfolio_id);

    positions = rows.map((p) => {
      // ✅ Use latest_metric from the repo
      const latestMetric = p.latest_metric ?? {};
      const marketValue = latestMetric.market_value ?? 0;
      const unrealizedPnl = latestMetric.unrealized_pnl ?? 0;

      totalValue += marketValue;
      totalUnrealized += unrealizedPnl;
      totalRealized += p.realized_pnl ?? 0;
      totalPositionsValue += marketValue;

      return {
        symbol: p.symbol ?? "—",
        quantity: p.quantity ?? 0,
        avgBuyPrice: p.avg_buy_price ?? 0,
        status: p.status ?? "unknown",
        currentPrice: latestMetric.current_price ?? 0,
        marketValue,
        unrealizedPnl,
        unrealizedPnlPct: latestMetric.unrealized_pnl_pct ?? 0,
        realizedPnl: p.realized_pnl ?? 0,
        lastUpdated: latestMetric.updated_at ?? null,
      };
    });
  } catch (err) {
    console.error(`[reportingService] Failed fetch positions for ${portfolio_id}:`, err.message);
  }

  return {
    portfolioId: portfolio_id,
    totalValue,
    totalUnrealizedPnl: totalUnrealized,
    totalRealizedPnl: totalRealized,
    positions,
    totalPositionsValue,
    cashBalance,
  };
}

/**
 * Insert equity snapshot, avoiding duplicates
 */
export async function snapshotPortfolioEquity(portfolio_id) {
  try {
    const report = await getPortfolioReport(portfolio_id);

    const lastSnapshot = await repo.getLastEquitySnapshot(portfolio_id);
    const now = new Date();
    if (lastSnapshot?.timestamp?.getTime() === now.getTime()) {
      return { snapshotId: lastSnapshot.id, timestamp: now };
    }

    const snapshotId = uuidv4();
    await repo.insertEquityCurve({
      id: snapshotId,
      portfolio_id,
      timestamp: now,
      total_value: report.totalValue,
      cash_balance: report.cashBalance,
      positions_value: report.totalPositionsValue,
      unrealized_pnl: report.totalUnrealizedPnl,
      realized_pnl: report.totalRealizedPnl,
    });

    return { snapshotId, timestamp: now };
  } catch (err) {
    console.error(`[reportingService] Failed snapshot for ${portfolio_id}:`, err.message);
    return { snapshotId: null, timestamp: null };
  }
}

/**
 * Fetch equity curve for a portfolio
 */
export async function getEquityCurve(portfolio_id, limit = 100) {
  try {
    return await repo.getEquityCurveByPortfolio(portfolio_id, limit);
  } catch (err) {
    console.error(`[reportingService] Failed fetch equity curve for ${portfolio_id}:`, err.message);
    return [];
  }
}

/**
 * Fetch equity curve aggregated for a user
 */
export async function getUserEquityCurve(user_id) {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const portfolios = await repo.getUserPortfolios(user_id);
  if (!portfolios?.length) return [];

  const portfolioIds = portfolios.map(p => p.id);
  const rows = await repo.getEquityCurveByPortfolios(portfolioIds);

  const aggregated = {};

  for (const row of rows) {
    if (new Date(row.timestamp) < since) continue;

    const key = row.timestamp.toISOString();
    if (!aggregated[key]) {
      aggregated[key] = {
        date: row.timestamp,
        totalValue: 0,
      };
    }

    aggregated[key].totalValue += Number(row.total_value ?? 0);
  }

  return Object.values(aggregated)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}