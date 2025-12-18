// routes/dashboardRoute.js
import express from "express";
import { getUserEquityCurve } from "../services/reportingService.js";
import { supabase } from "../services/supabaseClient.js";

const router = express.Router();

/**
 * GET /api/dashboard/:userId
 */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // 1️⃣ Fetch portfolios
    const { data: portfolios, error: pErr } = await supabase
      .from("portfolios")
      .select("id, cash_balance")
      .eq("user_id", userId);

    if (pErr) throw pErr;

    const portfolioIds = portfolios.map(p => p.id);

    // 2️⃣ Fetch latest position metrics (for top holdings)
    const { data: metrics } = await supabase
      .from("portfolio_position_metrics")
      .select("*")
      .in("portfolio_id", portfolioIds);

    // Aggregate by symbol
    const bySymbol = {};
    for (const m of metrics || []) {
      if (!bySymbol[m.symbol]) {
        bySymbol[m.symbol] = {
          symbol: m.symbol,
          currentPrice: m.current_price ?? 0,
          marketValue: 0,
          unrealizedPnl: 0,
        };
      }
      bySymbol[m.symbol].marketValue += m.market_value ?? 0;
      bySymbol[m.symbol].unrealizedPnl += m.unrealized_pnl ?? 0;
    }

    const topHoldings = Object.values(bySymbol)
      .sort((a, b) => b.marketValue - a.marketValue)
      .slice(0, 5);

    // 3️⃣ Equity curve (THIS IS THE GRAPH DATA)
    const equityCurve = await getUserEquityCurve(userId);

    // 4️⃣ Totals
    const totalValue = equityCurve.at(-1)?.totalValue ?? 0;
    const totalCash = portfolios.reduce(
      (sum, p) => sum + (p.cash_balance ?? 0),
      0
    );

    res.json({
      totalValue,
      totalCash,
      topHoldings,
      equityCurve,
      dayChange: 0, // optional later
      dayChangePercent: 0,
    });
  } catch (err) {
    console.error("[dashboardRoute] error:", err.message);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

export default router;
