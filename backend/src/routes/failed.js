// routes/failed.js
import express from "express";
import { supabase } from "../services/supabaseClient.js";

const router = express.Router();

router.get("/failed", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("failed_tickers") // or wherever you persist blacklisted tickers
      .select("symbol");

    if (error) return res.status(500).json({ error: error.message });

    const failed = data?.map(r => r.symbol) || [];
    res.json({ failed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;