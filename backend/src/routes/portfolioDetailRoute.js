// routes/portfolioDetailRoute.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getPortfolioDetail,
  createTransaction,
  createPosition,
} from "../services/portfolioDetailService.js";

const router = express.Router();

/**
 * GET /api/portfolio/:id
 * Returns portfolio detail with positions
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const portfolio_id = req.params.id;
    const user_id = req.user.id;

    const detail = await getPortfolioDetail({ portfolio_id, user_id });

    res.json(detail);
  } catch (err) {
    console.error("[portfolioDetailRoute] GET /:id error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/portfolio/:id/transaction
 * Add a transaction to a position
 * Body: { position_id, type, quantity, price, fee?, currency? }
 */
router.post("/:id/transaction", authMiddleware, async (req, res) => {
  try {
    const userToken = req.user.token;
    const payload = req.body;

    const result = await createTransaction(userToken, payload);

    if (!result.transaction) {
      return res.status(400).json({ error: "Transaction failed" });
    }

    res.json(result);
  } catch (err) {
    console.error("[portfolioDetailRoute] POST /transaction error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/portfolio/:id/position
 * Add a new position to a portfolio
 * Body: { symbol }
 */
router.post("/:id/position", authMiddleware, async (req, res) => {
  try {
    const portfolio_id = req.params.id;
    const symbol = req.body.symbol;
    const user_id = req.user.id;

    const result = await createPosition({ portfolio_id, symbol, user_id });

    if (!result) return res.status(400).json({ error: "Failed to add position" });

    res.json(result);
  } catch (err) {
    console.error("[portfolioDetailRoute] POST /position error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;