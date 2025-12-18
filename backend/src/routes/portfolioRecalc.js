// routes/portfolioRecalc.js
import express from 'express';
import { recalcPortfolioMetrics } from '../services/portfolioMetricsAtomicService.js';

const router = express.Router();

// POST /api/portfolio/recalc
router.post('/recalc', async (req, res) => {
  try {
    const { portfolio_id } = req.body;
    if (!portfolio_id) return res.status(400).json({ error: 'Missing portfolio_id' });

    // Optional: check ownership
    // Could fetch portfolio and verify req.user.id === portfolio.user_id

    const result = await recalcPortfolioMetrics(portfolio_id);
    res.json(result);
  } catch (err) {
    console.error('[portfolioRecalc route] error:', err.message);
    res.status(500).json({ error: 'Failed to recalc portfolio metrics' });
  }
});

export default router;