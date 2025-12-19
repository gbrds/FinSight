// routes/portfolioSummaryRoute.js
import express from 'express';
import { getUserPortfoliosWithTotals } from '../services/portfolioSummaryService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const user_id = req.user.id; // auth middleware sets this
    const data = await getUserPortfoliosWithTotals(user_id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch portfolio summary' });
  }
});

export default router;
