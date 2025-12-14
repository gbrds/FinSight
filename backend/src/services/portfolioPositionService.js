import { supabase } from './supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Add a position to a portfolio
 * Checks live_prices first; if not found, adds to pending_fetch
 */
export async function addPosition({ portfolio_id, symbol }) {
  try {
    // 1️⃣ Check if position already exists
    const { data: existingPos, error: existErr } = await supabase
      .from('portfolio_positions')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('symbol', symbol)
      .limit(1);

    if (existErr) throw existErr;
    if (existingPos?.length > 0) return existingPos[0]; // already exists

    // 2️⃣ Check live_prices
    const { data: liveData, error: liveErr } = await supabase
      .from('live_prices')
      .select('symbol')
      .eq('symbol', symbol)
      .limit(1);

    if (liveErr) throw liveErr;

    if (!liveData?.length) {
      // Add to pending_fetch
      await supabase.from('pending_fetch').upsert({ symbol, fetched: false }, { onConflict: ['symbol'] });
    }

    // 3️⃣ Insert new position (quantity/avg_buy_price = 0, open=true)
    const id = uuidv4();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('portfolio_positions')
      .insert([{
        id,
        portfolio_id,
        symbol,
        quantity: 0,
        avg_buy_price: 0,
        status: 'open',
        opened_at: null,
        closed_at: null,
        last_updated: now
      }])
      .select()
      .single();

    if (error) throw error;
    return data;

  } catch (err) {
    console.error('[portfolioPositionService] addPosition error:', err);
    throw err;
  }
}