import { supabasePublic as supabase } from "../clients/supabaseClient.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * Add a position to a portfolio
 * - Enforces symbol uppercase
 * - Links live_price_id if exists
 * - Enqueues pending_fetch if live price missing
 * - Works with ANON key + RLS (requires user_id)
 */
export async function addPosition({ portfolio_id, symbol, user_id }) {
  try {
    if (!portfolio_id || !symbol || !user_id) {
      throw new Error("portfolio_id, symbol, and user_id are required");
    }

    symbol = symbol.toUpperCase();

    // 1️⃣ Check if position already exists (RLS will filter by user via portfolio_id)
    const { data: existing, error: existErr } = await supabase
      .from('portfolio_positions')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('symbol', symbol)
      .limit(1);

    if (existErr) throw existErr;
    if (existing?.length) return existing[0];

    // 2️⃣ Check live_prices
    let live_price_id = null;
    const { data: liveData, error: liveErr } = await supabase
      .from('live_prices')
      .select('id')
      .eq('symbol', symbol)
      .limit(1);

    if (liveErr && liveErr.code !== 'PGRST116') throw liveErr;
    if (liveData?.length) live_price_id = liveData[0].id;
    else {
      // 3️⃣ Enqueue pending fetch
      await supabase
        .from('pending_fetch')
        .upsert({ symbol, fetched: false }, { onConflict: ['symbol'] });
    }

    // 4️⃣ Insert portfolio_positions row
    const now = new Date().toISOString();
    const { data: inserted, error: insertErr } = await supabase
      .from('portfolio_positions')
      .insert([{
        id: uuidv4(),
        portfolio_id,
        symbol,
        live_price_id,
        quantity: 0,
        avg_buy_price: 0,
        status: 'open',
        opened_at: null,
        closed_at: null,
        last_updated: now
      }])
      .select()
      .single();

    if (insertErr) throw insertErr;

    return inserted;
  } catch (err) {
    console.error('[portfolioPositionService] addPosition error:', err);
    return null;
  }
}

export async function getPositionsByPortfolioId(portfolio_id) {
  try {
    const { data, error } = await supabase
      .from('portfolio_positions')
      .select(`
        *,
        live_prices (price)
      `)
      .eq('portfolio_id', portfolio_id);

    if (error) throw error;

    // Map price from live_prices
    return data.map(pos => ({
      ...pos,
      price: pos.live_prices?.price ?? 0,
    }));
  } catch (err) {
    console.error('[portfolioPositionService] getPositionsByPortfolioId error:', err);
    return [];
  }
}
