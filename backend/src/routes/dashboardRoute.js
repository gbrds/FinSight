import express from "express";
import { supabase } from "../services/supabaseClient.js";
import { getUserPortfolios } from "../services/portfolioService.js";
import { recalcPortfolioMetrics } from "../services/portfolioMetricsAtomicService.js";
import { getPortfolioReport } from "../services/reportingService.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Missing auth token" });

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user || data.user.id !== userId)
      return res.status(401).json({ error: "Invalid or expired token" });
  } catch (err) {
    console.error("[dashboardRoute] Auth failed:", err.message);
    return res.status(500).json({ error: "Auth verification failed" });
  }

  try {
    const portfolios = await getUserPortfolios(userId);
    if (!Array.isArray(portfolios) || portfolios.length === 0)
      return res.json({ totalValue: 0, totalCash: 0, topHoldings: [], dayChange: 0, dayChangePercent: 0 });

    let totalValue = 0, totalCash = 0, allPositions = [];

    for (const p of portfolios) {
      const metrics = await recalcPortfolioMetrics(p.id).catch(err => {
        console.error(`[dashboardRoute] Metrics failed for ${p.id}:`, err.message);
        return { totalValue: 0, cash: 0 };
      });

      totalValue += metrics.totalValue ?? 0;
      totalCash += metrics.cash ?? 0;

      const report = await getPortfolioReport(p.id).catch(err => {
        console.error(`[dashboardRoute] Report failed for ${p.id}:`, err.message);
        return { positions: [] };
      });

      if (Array.isArray(report.positions)) allPositions.push(...report.positions);
    }

    allPositions = allPositions.filter(Boolean);
    allPositions.sort((a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0));
    const topHoldings = allPositions.slice(0, 10);

    const dayChange = allPositions.reduce((sum, pos) => sum + (pos.unrealizedPnl ?? 0), 0);
    const dayChangePercent = totalValue ? (dayChange / (totalValue - dayChange)) * 100 : 0;

    res.json({ totalValue, totalCash, topHoldings, dayChange, dayChangePercent });
  } catch (err) {
    console.error("[dashboardRoute] Unexpected error:", err.message);
    res.json({ totalValue: 0, totalCash: 0, topHoldings: [], dayChange: 0, dayChangePercent: 0 });
  }
});

export default router;