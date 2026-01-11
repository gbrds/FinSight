import * as transactionRepo from "../repositories/transactionRepository.js";

/**
 * Add a transaction to a portfolio position and update position metrics
 * @param {Object} payload
 *   - position_id
 *   - type: "buy" | "sell"
 *   - quantity
 *   - price
 *   - fee (optional)
 *   - currency (optional, default USD)
 */
export async function addTransaction(payload) {
  const { position_id, type, quantity, price, fee = 0, currency = "USD" } = payload;
  const now = new Date();

  if (!["buy", "sell"].includes(type)) throw new Error(`Invalid transaction type: ${type}`);
  if (quantity <= 0) throw new Error("Quantity must be > 0");

  try {
    // 1️⃣ Fetch position
    const position = await transactionRepo.findPositionById(position_id);
    if (!position) throw new Error("Position not found");

    if (type === "sell" && position.quantity < quantity)
      throw new Error("Cannot sell more than position quantity");

    // 2️⃣ Compute realized PnL
    let realizedPnl = 0;
    if (type === "sell") realizedPnl = (price - position.avg_buy_price) * quantity - fee;

    // 3️⃣ Create transaction
    const transaction = await transactionRepo.createTransaction({
      position_id,
      type,
      quantity,
      price,
      fee,
      currency,
      realized_pnl: realizedPnl,
      executed_at: now,
    });

    // 4️⃣ Calculate updated position values
    let newQuantity = position.quantity;
    let newAvgPrice = position.avg_buy_price;
    let newStatus = position.status;
    let openedAt = position.opened_at;
    let closedAt = position.closed_at;
    let newRealizedPnl = position.realized_pnl ?? 0;

    if (type === "buy") {
      newQuantity += quantity;
      newAvgPrice =
        position.quantity === 0
          ? price
          : (position.avg_buy_price * position.quantity + price * quantity) / newQuantity;
      newStatus = "open";
      if (!openedAt) openedAt = now;
      closedAt = null;
    } else {
      newQuantity -= quantity;
      newRealizedPnl += realizedPnl;
      newStatus = newQuantity === 0 ? "closed" : "open";
      if (newQuantity === 0) closedAt = now;
    }

    // 5️⃣ Update position
    const updatedPosition = await transactionRepo.updatePositionAfterTransaction(position_id, {
      quantity: newQuantity,
      avg_buy_price: newAvgPrice,
      status: newStatus,
      opened_at: openedAt,
      closed_at: closedAt,
      realized_pnl: newRealizedPnl,
      last_updated: now,
    });

    return { transaction, updatedPosition };
  } catch (err) {
    console.error("[transactionService] addTransaction error:", err);
    return { transaction: null, updatedPosition: null };
  }
}