// routes/dashboardRoute.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getUserDashboard } from "../services/dashboardService.js";

const router = express.Router();

/**
 * GET /api/dashboard/:userId
 * Returns dashboard data for a user
 */
router.get("/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    // Use dashboardService to fetch all dashboard data
    const dashboardData = await getUserDashboard(userId);

    // Ensure all keys exist for front-end safety
    res.json({
      totalValue: dashboardData.totalValue ?? 0,
      totalCash: dashboardData.totalCash ?? 0,
      topHoldings: Array.isArray(dashboardData.topHoldings) ? dashboardData.topHoldings : [],
      dayChange: dashboardData.dayChange ?? 0,
      dayChangePercent: dashboardData.dayChangePercent ?? 0,
      message: dashboardData.message || null,
    });
  } catch (err) {
    console.error("[dashboardRoute] Unexpected error:", err.message);

    // Fallback dashboard
    res.json({
      totalValue: 0,
      totalCash: 0,
      topHoldings: [],
      dayChange: 0,
      dayChangePercent: 0,
      message: "Failed to fetch dashboard. Please try again later.",
    });
  }
});

export default router;
