import { supabase } from './supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Add a buy/sell transaction for a position
 * Updates position quantity, avg_price, status, and realized PnL
 */
export async function addTransaction({
  position_id,
  type,
  quantity,
  price,
  fee = 0,
  currency = 'USD'
}) {
  try {
    if (!['buy', 'sell'].includes(type)) {
      throw new Error(`Invalid transaction type: ${type}`);
    }
    if (quantity <= 0) {
      throw new Error('Quantity must be > 0');
    }

    const now = new Date().toISOString();

    // ------------------------
    // 1️⃣ Fetch position
    // ------------------------
    const { data: pos, error: posErr } = await supabase
      .from('portfolio_positions')
      .select('*')
      .eq('id', position_id)
      .single();

    if (posErr) throw posErr;

    // ------------------------
    // 2️⃣ Prevent oversell
    // ------------------------
    if (type === 'sell' && pos.quantity < quantity) {
      throw new Error('Cannot sell more than current position quantity');
    }

    // ------------------------
    // 3️⃣ Calculate realized PnL
    // ------------------------
    let realizedPnl = 0;

    if (type === 'sell') {
      realizedPnl =
        (price - pos.avg_buy_price) * quantity - fee;
    }

    // ------------------------
    // 4️⃣ Insert transaction
    // ------------------------
    const txId = uuidv4();

    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .insert([{
        id: txId,
        position_id,
        type,
        quantity,
        price,
        fee,
        currency,
        realized_pnl: realizedPnl, // 🧮
        executed_at: now,
        created_at: now
      }])
      .select()
      .single();

    if (txError) throw txError;

    // ------------------------
    // 5️⃣ Update position
    // ------------------------
    let newQuantity = pos.quantity;
    let newAvgPrice = pos.avg_buy_price;
    let newStatus = pos.status;
    let openedAt = pos.opened_at;
    let closedAt = pos.closed_at;
    let newRealizedPnl = pos.realized_pnl ?? 0;

    if (type === 'buy') {
      newQuantity += quantity;

      newAvgPrice =
        pos.quantity === 0
          ? price
          : ((pos.avg_buy_price * pos.quantity) + (price * quantity)) / newQuantity;

      newStatus = 'open';
      if (!openedAt) openedAt = now;
      closedAt = null;
    }

    if (type === 'sell') {
      newQuantity -= quantity;
      newRealizedPnl += realizedPnl; // 🧮

      if (newQuantity === 0) {
        newStatus = 'closed';
        closedAt = now;
      } else {
        newStatus = 'open';
      }
    }

    const { data: updatedPos, error: updateErr } = await supabase
      .from('portfolio_positions')
      .update({
        quantity: newQuantity,
        avg_buy_price: newAvgPrice,
        status: newStatus,
        opened_at: openedAt,
        closed_at: closedAt,
        realized_pnl: newRealizedPnl, // 🧮
        last_updated: now
      })
      .eq('id', position_id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return {
      transaction: txData,
      updatedPosition: updatedPos
    };

  } catch (err) {
    console.error('[transactionService] addTransaction error:', err.message);
    throw err;
  }
}