// backend/src/services/reportingService.js
import { supabase } from './supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get detailed portfolio report
 * Includes positions, unrealized PnL, and totals
 */
export async function getPortfolioReport(portfolio_id) {
  const { data, error } = await supabase
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

  let totalValue = 0;
  let totalUnrealized = 0;
  let totalRealized = 0;

  const positions = data.map(p => {
    const m = p.portfolio_position_metrics?.[0];
    if (m) {
      totalValue += m.market_value;
      totalUnrealized += m.unrealized_pnl;
    }
    totalRealized += p.realized_pnl ?? 0;

    return {
      symbol: p.symbol,
      quantity: p.quantity,
      avgBuyPrice: p.avg_buy_price,
      status: p.status,
      currentPrice: m?.current_price ?? null,
      marketValue: m?.market_value ?? null,
      unrealizedPnl: m?.unrealized_pnl ?? null,
      unrealizedPnlPct: m?.unrealized_pnl_pct ?? null,
      realizedPnl: p.realized_pnl ?? 0,
      lastUpdated: m?.updated_at ?? null
    };
  });

  return {
    portfolioId: portfolio_id,
    totalValue,
    totalUnrealizedPnl: totalUnrealized,
    totalRealizedPnl: totalRealized,
    positions
  };
}

/**
 * Snapshot current portfolio equity for historical tracking
 * Inserts a row into portfolio_equity_curve
 */
export async function snapshotPortfolioEquity(portfolio_id) {
  // 1️⃣ Get current portfolio report
  const report = await getPortfolioReport(portfolio_id);

  // 2️⃣ Prepare snapshot
  const snapshotId = uuidv4();
  const now = new Date().toISOString();
  const { totalValue, totalUnrealizedPnl, totalRealizedPnl } = report;

  // 3️⃣ Insert into equity curve table
  const { data, error } = await supabase
    .from('portfolio_equity_curve')
    .insert([{
      id: snapshotId,
      portfolio_id,
      timestamp: now,
      total_value: totalValue,
      unrealized_pnl: totalUnrealizedPnl,
      realized_pnl: totalRealizedPnl
    }])
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Fetch historical equity curve for a portfolio
 */
export async function getEquityCurve(portfolio_id, limit = 100) {
  const { data, error } = await supabase
    .from('portfolio_equity_curve')
    .select('*')
    .eq('portfolio_id', portfolio_id)
    .order('timestamp', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}