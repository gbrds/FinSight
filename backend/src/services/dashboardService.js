// src/services/dashboardService.js
import { recalcPortfolioMetrics } from './portfolioMetricsAtomicService.js';
import * as portfolioService from './portfolioService.js';
import * as reportingService from './reportingService.js';

/**
 * Fetch and aggregate dashboard data for a user
 */
export async function getUserDashboard(userId) {
  try {
    if (!userId) {
      return {
        totalValue: 0,
        totalCash: 0,
        topHoldings: [],
        dayChange: 0,
        dayChangePercent: 0,
        equityCurve: [],
        message: "No user ID provided. Please log in.",
      };
    }

    const portfolios = await portfolioService.getUserPortfolios(userId);
    if (!portfolios || portfolios.length === 0) {
      return {
        totalValue: 0,
        totalCash: 0,
        topHoldings: [],
        dayChange: 0,
        dayChangePercent: 0,
        equityCurve: [],
        message: "You have no portfolios yet. Add your first portfolio to get started.",
      };
    }

    let totalValue = 0;
    let totalCash = 0;
    const positionsMap = new Map(); // merge positions by symbol

    for (const portfolio of portfolios) {
      // Recalculate portfolio metrics safely
      let metrics = { totalValue: 0, cash: 0 };
      try {
        metrics = await recalcPortfolioMetrics(portfolio.id);
      } catch (err) {
        console.warn(`[dashboardService] Failed recalc metrics for portfolio ${portfolio.id}:`, err.message);
      }

      totalValue += metrics.totalValue ?? 0;
      totalCash += metrics.cash ?? 0;

      // Fetch portfolio positions safely
      let report = { positions: [] };
      try {
        report = await reportingService.getPortfolioReport(portfolio.id);
      } catch (err) {
        console.warn(`[dashboardService] Failed fetch report for portfolio ${portfolio.id}:`, err.message);
      }

      // Merge positions by symbol
      if (Array.isArray(report.positions)) {
        for (const pos of report.positions) {
          const key = pos.symbol;
          if (!positionsMap.has(key)) {
            positionsMap.set(key, { ...pos, portfolioIds: [portfolio.id] });
          } else {
            const existing = positionsMap.get(key);
            existing.marketValue += pos.marketValue ?? 0;
            existing.unrealizedPnl += pos.unrealizedPnl ?? 0;
            existing.quantity += pos.quantity ?? 0;
            existing.portfolioIds.push(portfolio.id);
            existing.currentPrice = pos.currentPrice ?? existing.currentPrice;
          }
        }
      }
    }

    // Convert map to array, sort by marketValue, take top 10
    const allPositions = Array.from(positionsMap.values());
    allPositions.sort((a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0));
    const topHoldings = allPositions.slice(0, 10).map(pos => ({
      ...pos,
      uniqueKey: `${pos.symbol}-${pos.portfolioIds.join('-')}`,
    }));

    // Calculate day change across all positions
    const dayChange = allPositions.reduce((sum, pos) => sum + (pos.unrealizedPnl ?? 0), 0);
    const dayChangePercent = totalValue ? (dayChange / (totalValue - dayChange)) * 100 : 0;

    // Fetch equity curve for the last 7 days
    let equityCurve = [];
    try {
      equityCurve = await reportingService.getUserEquityCurve(userId);
    } catch (err) {
      console.warn(`[dashboardService] Failed fetch equity curve for user ${userId}:`, err.message);
    }

    return {
      totalValue,
      totalCash,
      topHoldings,
      dayChange,
      dayChangePercent,
      equityCurve,
      message: topHoldings.length === 0 ? "You have no holdings yet. Add your first asset to get started." : null,
    };
  } catch (err) {
    console.error('[dashboardService] getUserDashboard error:', err);
    return {
      totalValue: 0,
      totalCash: 0,
      topHoldings: [],
      dayChange: 0,
      dayChangePercent: 0,
      equityCurve: [],
      message: "Failed to fetch dashboard. Please try again later.",
    };
  }
}