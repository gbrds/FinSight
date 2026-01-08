import express from "express";
import { TickerRepository } from "../repositories/TickerRepository.js";

const router = express.Router();

router.get("/tickers", async (req, res) => {
  try {
    const live = await TickerRepository.getLiveSymbols();
    const pending = await TickerRepository.getPendingSymbols();

    const tickers = [
      ...(live?.map(r => r.symbol) || []),
      ...(pending?.map(r => r.symbol) || []),
    ];

    res.json({ tickers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
