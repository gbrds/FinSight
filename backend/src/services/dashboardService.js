import { recalcPortfolioMetrics } from './portfolioMetricsAtomicService.js';
import * as portfolioService from './portfolioService.js';
import * as reportingService from './reportingService.js';

/**
 * Fetch dashboard data for a user
 */
export async function getUserDashboard(userId) {
  try {
    if (!userId) {
      // No userId provided, return empty dashboard
      return {
        totalValue: 0,
        totalCash: 0,
        topHoldings: [],
        message: "No user ID provided. Please log in.",
      };
    }

    const portfolios = await portfolioService.getUserPortfolios(userId);

    if (!portfolios || portfolios.length === 0) {
      // New user with no portfolios
      return {
        totalValue: 0,
        totalCash: 0,
        topHoldings: [],
        message: "You have no portfolios yet. Add your first portfolio to get started.",
      };
    }

    let totalValue = 0;
    let totalCash = 0;
    const topHoldings = [];

    for (const portfolio of portfolios) {
      // recalc metrics safely
      try {
        const metrics = await recalcPortfolioMetrics(portfolio.id);
        totalValue += metrics?.totalValue ?? 0;
        totalCash += metrics?.cash ?? 0;
      } catch (err) {
        console.warn(`[dashboardService] Failed to recalc metrics for portfolio ${portfolio.id}`, err);
      }

      // fetch report safely
      try {
        const report = await reportingService.getPortfolioReport(portfolio.id);
        if (Array.isArray(report?.positions)) {
          topHoldings.push(...report.positions);
        }
      } catch (err) {
        console.warn(`[dashboardService] Failed to fetch report for portfolio ${portfolio.id}`, err);
      }
    }

    return {
      totalValue,
      totalCash,
      topHoldings,
      message: topHoldings.length === 0
        ? "You have no holdings yet. Add your first asset to get started."
        : null,
    };
  } catch (err) {
    console.error('[dashboardService] getUserDashboard error:', err);
    return {
      totalValue: 0,
      totalCash: 0,
      topHoldings: [],
      message: "Failed to fetch dashboard. Please try again later.",
    };
  }
}