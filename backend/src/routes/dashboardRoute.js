// routes/dashboardRoute.js
import express from "express";
import { supabase } from "../services/supabaseClient.js";
import { getUserDashboard } from "../services/dashboardService.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Missing auth token" });

  try {
    // Verify token
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user || data.user.id !== userId)
      return res.status(401).json({ error: "Invalid or expired token" });
  } catch (err) {
    console.error("[dashboardRoute] Auth failed:", err.message);
    return res.status(500).json({ error: "Auth verification failed" });
  }

  try {
    // Use dashboardService to fetch user dashboard safely
    const dashboard = await getUserDashboard(userId);

    // Ensure full dashboard object for front-end
    res.json({
      totalValue: dashboard.totalValue ?? 0,
      totalCash: dashboard.totalCash ?? 0,
      topHoldings: Array.isArray(dashboard.topHoldings) ? dashboard.topHoldings : [],
      dayChange: dashboard.dayChange ?? 0,
      dayChangePercent: dashboard.dayChangePercent ?? 0,
      message: dashboard.message ?? null,
    });
  } catch (err) {
    console.error("[dashboardRoute] Unexpected error:", err.message);

    // Fallback safe response
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