// routes/failed.js
import express from "express";

const router = express.Router();

router.get("/failed", async (_req, res) => {
  // No failed tickers persisted yet
  res.json({ failed: [] });
});

export default router;