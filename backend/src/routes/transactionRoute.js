// routes/transactionRoute.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addTransaction } from "../services/transactionService.js";

const router = express.Router();

// POST /api/transaction
// Add a transaction to a portfolio position
router.post("/", authMiddleware, async (req, res) => {
  try {
    const payload = req.body;

    // Prisma repo does not need userToken anymore
    const result = await addTransaction(payload);

    if (!result.transaction) {
      return res.status(400).json({ error: "Transaction failed" });
    }

    res.json(result);
  } catch (err) {
    console.error("[transactionRoute] POST / error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
