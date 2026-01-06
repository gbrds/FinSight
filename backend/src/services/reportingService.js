import { supabaseAdmin as supabase } from "../clients/supabaseClient.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetch portfolio positions + metrics and aggregate totals
 */
export async function getPortfolioReport(portfolio_id) {
  let positions = [];
  let totalValue = 0;
  let totalUnrealized = 0;
  let totalRealized = 0;
  let totalPositionsValue = 0;
  let cashBalance = 0; // if you track cash separately

  try {
    const { data: rows, error } = await supabase
      .from('portfolio_positions')
      .select(`
        id,
        symbol,
        quantity,
        avg_buy_price,
        status,
        realized_pnl,
        portfolio_position_metrics (
          current_price,
          market_value,
          unrealized_pnl,
          unrealized_pnl_pct,
          updated_at
        )
      `)
      .eq('portfolio_id', portfolio_id);

    if (error) throw error;

    positions = (rows || []).map(p => {
      // Pick the latest metric by updated_at
      const metrics = Array.isArray(p.portfolio_position_metrics) ? p.portfolio_position_metrics : [];
      const latestMetric = metrics.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0] || {};

      const marketValue = latestMetric.market_value ?? 0;
      const unrealizedPnl = latestMetric.unrealized_pnl ?? 0;

      totalValue += marketValue;
      totalUnrealized += unrealizedPnl;
      totalRealized += p.realized_pnl ?? 0;
      totalPositionsValue += marketValue;

      return {
        symbol: p.symbol ?? "—",
        quantity: p.quantity ?? 0,
        avgBuyPrice: p.avg_buy_price ?? 0,
        status: p.status ?? "unknown",
        currentPrice: latestMetric.current_price ?? 0,
        marketValue,
        unrealizedPnl,
        unrealizedPnlPct: latestMetric.unrealized_pnl_pct ?? 0,
        realizedPnl: p.realized_pnl ?? 0,
        lastUpdated: latestMetric.updated_at ?? null
      };
    });
  } catch (err) {
    console.error(`[reportingService] Failed fetch positions for ${portfolio_id}:`, err.message);
  }

  return {
    portfolioId: portfolio_id,
    totalValue,
    totalUnrealizedPnl: totalUnrealized,
    totalRealizedPnl: totalRealized,
    positions,
    totalPositionsValue,
    cashBalance
  };
}

/**
 * Insert equity snapshot, avoiding duplicates
 */
export async function snapshotPortfolioEquity(portfolio_id) {
  try {
    const report = await getPortfolioReport(portfolio_id);

    // Check last snapshot to avoid duplicates
    const { data: lastSnapshot } = await supabase
      .from('portfolio_equity_curve')
      .select('timestamp')
      .eq('portfolio_id', portfolio_id)
      .order('timestamp', { ascending: false })
      .limit(1);

    const now = new Date().toISOString();
    if (lastSnapshot?.[0]?.timestamp === now) {
      return { snapshotId: lastSnapshot[0].id, timestamp: now };
    }

    const snapshotId = uuidv4();
    const { error } = await supabase
      .from('portfolio_equity_curve')
      .insert([{
        id: snapshotId,
        portfolio_id,
        timestamp: now,
        total_value: report.totalValue,
        cash_balance: report.cashBalance,
        positions_value: report.totalPositionsValue,
        unrealized_pnl: report.totalUnrealizedPnl,
        realized_pnl: report.totalRealizedPnl
      }]);

    if (error) throw error;

    return { snapshotId, timestamp: now };
  } catch (err) {
    console.error(`[reportingService] Failed snapshot for ${portfolio_id}:`, err.message);
    return { snapshotId: null, timestamp: null };
  }
}

/**
 * Fetch equity curve for a portfolio
 */
export async function getEquityCurve(portfolio_id, limit = 100) {
  try {
    const { data, error } = await supabase
      .from('portfolio_equity_curve')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`[reportingService] Failed fetch equity curve for ${portfolio_id}:`, err.message);
    return [];
  }
}

export async function getUserEquityCurve(user_id, limit = 200) {
  try {
    // 1️⃣ Fetch user portfolios
    const { data: portfolios, error: pErr } = await supabase
      .from("portfolios")
      .select("id")
      .eq("user_id", user_id);

    if (pErr) throw pErr;
    if (!portfolios?.length) return [];

    const portfolioIds = portfolios.map(p => p.id);

    // 2️⃣ Fetch equity curves
    const { data, error } = await supabase
      .from("portfolio_equity_curve")
      .select("portfolio_id, timestamp, total_value")
      .in("portfolio_id", portfolioIds)
      .order("timestamp", { ascending: true })
      .limit(limit * portfolioIds.length);

    if (error) throw error;

    // 3️⃣ Aggregate across portfolios
    const aggregated = {};

    for (const row of data) {
      const t = row.timestamp;
      if (!aggregated[t]) {
        aggregated[t] = { date: t, totalValue: 0 };
      }
      aggregated[t].totalValue += row.total_value ?? 0;
    }

    return Object.values(aggregated).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  } catch (err) {
    console.error("[reportingService] getUserEquityCurve error:", err.message);
    return [];
  }
}
