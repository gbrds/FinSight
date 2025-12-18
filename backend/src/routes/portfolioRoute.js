import express from "express";
import { createPortfolio, getUserPortfolios } from "../services/portfolioService.js";

const router = express.Router();

// Create portfolio
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const user_id = req.user.id;
    if (!name) return res.status(400).json({ error: "Portfolio name is required" });

    const portfolio = await createPortfolio({ user_id, name });
    if (!portfolio) return res.status(500).json({ error: "Failed to create portfolio" });

    res.json(portfolio);
  } catch (err) {
    console.error("[portfolioRoute] POST / error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all portfolios for user
router.get("/", async (req, res) => {
  try {
    const user_id = req.user.id;
    const portfolios = await getUserPortfolios(user_id);
    res.json(portfolios);
  } catch (err) {
    console.error("[portfolioRoute] GET / error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
