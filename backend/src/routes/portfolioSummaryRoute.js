// routes/portfolioSummaryRoute.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getUserPortfoliosWithTotals } from "../services/portfolioSummaryService.js";

const router = express.Router();

/**
 * GET /api/portfolio/summary
 * Returns all portfolios for the logged-in user with computed totals
 */
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id; // authMiddleware sets this
    const data = await getUserPortfoliosWithTotals(user_id);
    res.json(data);
  } catch (err) {
    console.error("[portfolioSummaryRoute] GET /summary error:", err.message);
    res.status(500).json({ error: "Failed to fetch portfolio summary" });
  }
});

export default router;