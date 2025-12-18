import { supabase } from './supabaseClient.js';

export async function recalcPortfolioMetrics(portfolio_id) {
  const now = new Date().toISOString();

  let positionsValue = 0;
  let unrealizedPnl = 0;
  let realizedPnl = 0;
  let cash = 0;

  try {
    // 1️⃣ Fetch positions + live prices (fixed join)
    const { data: rows, error: fetchError } = await supabase
      .from('portfolio_positions')
      .select(`
        id,
        portfolio_id,
        symbol,
        quantity,
        avg_buy_price,
        realized_pnl,
        live_prices:live_price_id (
          price
        )
      `)
      .eq('portfolio_id', portfolio_id);

    if (fetchError) throw fetchError;

    // 2️⃣ Calculate metrics & upsert position metrics
    for (const row of rows) {
      const price = row.live_prices?.price;
      if (price == null) continue; // skip if no live price

      const marketValue = row.quantity * price;
      const unrealized = (price - row.avg_buy_price) * row.quantity;

      positionsValue += marketValue;
      unrealizedPnl += unrealized;
      realizedPnl += row.realized_pnl ?? 0;

      try {
        await supabase
          .from('portfolio_position_metrics')
          .upsert(
            {
              position_id: row.id,
              portfolio_id: row.portfolio_id,
              symbol: row.symbol,
              current_price: price,
              market_value: marketValue,
              unrealized_pnl: unrealized,
              unrealized_pnl_pct:
                row.quantity && row.avg_buy_price
                  ? unrealized / (row.avg_buy_price * row.quantity)
                  : 0,
              updated_at: now,
            },
            { onConflict: ['position_id'] }
          );
      } catch (err) {
        console.error(
          `[portfolioMetricsAtomicService] Failed upsert metrics for position ${row.id}:`,
          err.message
        );
      }
    }

    // 3️⃣ Fetch cash balance
    try {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('cash_balance')
        .eq('id', portfolio_id)
        .maybeSingle();

      cash = portfolio?.cash_balance ?? 0;
    } catch (err) {
      console.error(
        `[portfolioMetricsAtomicService] Failed fetch cash for ${portfolio_id}:`,
        err.message
      );
    }

    const totalValue = positionsValue + cash;

    // 4️⃣ Insert equity curve snapshot
    try {
      await supabase.from('portfolio_equity_curve').insert({
        portfolio_id,
        timestamp: now,
        total_value: totalValue,
        cash_balance: cash,
        positions_value: positionsValue,
        unrealized_pnl: unrealizedPnl,
        realized_pnl: realizedPnl,
      });
    } catch (err) {
      console.error(
        `[portfolioMetricsAtomicService] Failed insert equity curve for ${portfolio_id}:`,
        err.message
      );
    }

    return { portfolio_id, totalValue, cash, positionsValue, unrealizedPnl, realizedPnl };
  } catch (err) {
    console.error(
      `[portfolioMetricsAtomicService] Unexpected error for ${portfolio_id}:`,
      err.message
    );
    return { portfolio_id, totalValue: 0, cash: 0, positionsValue: 0, unrealizedPnl: 0, realizedPnl: 0 };
  }
}