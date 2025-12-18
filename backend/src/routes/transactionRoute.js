import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addTransaction } from "../services/transactionService.js";

const router = express.Router();

// Protected route
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userToken = req.user.token; // must include token from authMiddleware
    const payload = req.body;

    const result = await addTransaction(userToken, payload);

    if (!result.transaction) {
      return res.status(400).json({ error: "Transaction failed" });
    }

    res.json(result);
  } catch (err) {
    console.error("[transactionRoute] error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;