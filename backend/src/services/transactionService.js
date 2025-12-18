import { v4 as uuidv4 } from "uuid";
import { getUserSupabase } from "./supabaseUserClient.js"; // NEW helper

export async function addTransaction(userToken, { position_id, type, quantity, price, fee = 0, currency = "USD" }) {
  try {
    if (!["buy", "sell"].includes(type)) throw new Error(`Invalid transaction type: ${type}`);
    if (quantity <= 0) throw new Error("Quantity must be > 0");

    const supabase = getUserSupabase(userToken);
    const now = new Date().toISOString();

    // Fetch position
    const { data: posArr, error: posErr } = await supabase
      .from("portfolio_positions")
      .select("*")
      .eq("id", position_id);

    if (posErr) throw posErr;
    const pos = posArr?.[0];
    if (!pos) throw new Error("Position not found");

    if (type === "sell" && pos.quantity < quantity) throw new Error("Cannot sell more than quantity");

    let realizedPnl = 0;
    if (type === "sell") realizedPnl = (price - pos.avg_buy_price) * quantity - fee;

    const txId = uuidv4();
    const { data: txData, error: txErr } = await supabase
      .from("transactions")
      .insert([{
        id: txId,
        position_id,
        type,
        quantity,
        price,
        fee,
        currency,
        realized_pnl: realizedPnl,
        executed_at: now
      }])
      .select();

    if (txErr) throw txErr;

    // Update position
    let newQuantity = pos.quantity, newAvgPrice = pos.avg_buy_price;
    let newStatus = pos.status, openedAt = pos.opened_at, closedAt = pos.closed_at;
    let newRealizedPnl = pos.realized_pnl ?? 0;

    if (type === "buy") {
      newQuantity += quantity;
      newAvgPrice = pos.quantity === 0 ? price : ((pos.avg_buy_price * pos.quantity) + (price * quantity)) / newQuantity;
      newStatus = "open";
      if (!openedAt) openedAt = now;
      closedAt = null;
    } else {
      newQuantity -= quantity;
      newRealizedPnl += realizedPnl;
      newStatus = newQuantity === 0 ? "closed" : "open";
      if (newQuantity === 0) closedAt = now;
    }

    const { data: updatedPosArr, error: updateErr } = await supabase
      .from("portfolio_positions")
      .update({
        quantity: newQuantity,
        avg_buy_price: newAvgPrice,
        status: newStatus,
        opened_at: openedAt,
        closed_at: closedAt,
        realized_pnl: newRealizedPnl,
        last_updated: now
      })
      .eq("id", position_id)
      .select();

    if (updateErr) throw updateErr;

    return { transaction: txData?.[0] || null, updatedPosition: updatedPosArr?.[0] || null };
  } catch (err) {
    console.error("[transactionService] addTransaction error:", err.message);
    return { transaction: null, updatedPosition: null };
  }
}