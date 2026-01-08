import express from "express";
import { FailedTickerRepository } from "../repositories/FailedTickerRepository.js";

const router = express.Router();

router.get("/failed", async (req, res) => {
  try {
    const data = await FailedTickerRepository.getAllSymbols();
    const failed = data?.map(r => r.symbol) || [];
    res.json({ failed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
