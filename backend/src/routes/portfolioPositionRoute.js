// routes/portfolioPositionRoute.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addPosition } from "../services/portfolioPositionService.js";

const router = express.Router();

/**
 * POST /api/portfolio/add-position
 * Body: { portfolio_id, symbol }
 * Requires authMiddleware
 */
router.post("/add-position", authMiddleware, async (req, res) => {
  try {
    const { portfolio_id, symbol } = req.body;
    const user_id = req.user?.id;

    if (!user_id) return res.status(401).json({ error: "Unauthorized" });

    const position = await addPosition({ portfolio_id, symbol, user_id });

    if (!position) return res.status(500).json({ error: "Failed to add position" });

    res.json(position);
  } catch (err) {
    console.error("[portfolioPositionRoute] POST /add-position error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;