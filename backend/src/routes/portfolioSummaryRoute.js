import express from "express";
import { getUserPortfoliosWithTotals } from "../services/portfolioSummaryService.js";

const router = express.Router();

/**
 * GET /api/portfolio-summary
 * Auth middleware is already applied in server.js
 */
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const summary = await getUserPortfoliosWithTotals(userId);

    res.json(summary);
  } catch (err) {
    console.error("[portfolio-summary]", err);
    res.status(500).json({ error: "Failed to fetch portfolio summary" });
  }
});

export default router;