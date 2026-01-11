// routes/portfolioPositionRoute.js
import express from "express";
import { addPosition } from "../services/portfolioPositionService.js";

const router = express.Router();

/**
 * POST /api/portfolio/:portfolioId/position
 * Body: { symbol }
 * Requires authMiddleware
 */
router.post("/:portfolioId/position", async (req, res) => {
  try {
    const portfolio_id = req.params.portfolioId; // <-- frontend uses URL param
    const { symbol } = req.body;
    const user_id = req.user?.id;

    if (!user_id) return res.status(401).json({ error: "Unauthorized" });
    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    const position = await addPosition({ portfolio_id, symbol, user_id });

    if (!position) return res.status(500).json({ error: "Failed to add position" });

    // Return minimal position object for frontend table
    res.json({
      id: position.id,
      symbol: position.symbol,
      quantity: position.quantity,
      avg_buy_price: position.avg_buy_price,
      realized_pnl: 0, // default until transactions added
      price: position.live_prices?.price ?? 0,
    });
  } catch (err) {
    console.error("[portfolioPositionRoute] POST /:portfolioId/position error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;