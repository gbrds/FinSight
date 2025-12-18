import express from 'express';
import { addPosition } from '../services/portfolioPositionService.js';
const router = express.Router();

/**
 * POST /api/portfolio/add-position
 * Body: { portfolio_id, symbol }
 * Requires authMiddleware on server.js
 */
router.post('/add-position', async (req, res) => {
  const { portfolio_id, symbol } = req.body;
  const user_id = req.user?.id;

  if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

  const position = await addPosition({ portfolio_id, symbol, user_id });

  if (!position) return res.status(500).json({ error: 'Failed to add position' });

  res.json(position);
});

export default router;