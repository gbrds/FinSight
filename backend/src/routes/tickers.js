// routes/tickers.js
import express from "express";
import { supabase } from "../services/supabaseClient.js";

const router = express.Router();

router.get("/api/tickers", async (req, res) => {
  try {
    // 1. Fetch all live prices
    const { data: live, error: liveError } = await supabase
      .from("live_prices")
      .select("symbol");

    if (liveError) return res.status(500).json({ error: liveError.message });

    // 2. Fetch pending tickers where fetched = false
    const { data: pending, error: pendingError } = await supabase
      .from("pending_fetch")
      .select("symbol")
      .eq("fetched", false);

    if (pendingError) return res.status(500).json({ error: pendingError.message });

    // Combine lists for Python
    const tickers = [
      ...(live?.map(r => r.symbol) || []),
      ...(pending?.map(r => r.symbol) || [])
    ];

    res.json({ tickers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;