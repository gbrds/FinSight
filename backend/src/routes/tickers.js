// routes/tickers.js
import express from "express";
import { supabaseAdmin as supabase } from "../clients/supabaseClient.js";

const router = express.Router();

router.get("/tickers", async (_req, res) => {
  try {
    // 1. Live prices
    const { data: live, error: liveError } = await supabase
      .from("live_prices")
      .select("symbol");

    if (liveError) throw liveError;

    // 2. Pending fetch (not fetched yet)
    const { data: pending, error: pendingError } = await supabase
      .from("pending_fetch")
      .select("symbol")
      .eq("fetched", false);

    if (pendingError) throw pendingError;

    const tickers = [
      ...(live?.map(r => r.symbol) || []),
      ...(pending?.map(r => r.symbol) || []),
    ];

    res.json({ tickers });
  } catch (err) {
    console.error("[/tickers]", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;