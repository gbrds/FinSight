import prisma from "../clients/prismaClient.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Fetch a portfolio position by ID
 */
export async function findPositionById(position_id) {
  return prisma.portfolio_positions.findUnique({
    where: { id: position_id },
  });
}

/**
 * Create a transaction
 */
export async function createTransaction({
  position_id,
  type,
  quantity,
  price,
  fee = 0,
  currency = "USD",
  realized_pnl = 0,
  executed_at = new Date(),
}) {
  return prisma.transactions.create({
    data: {
      id: uuidv4(),
      position_id,
      type,
      quantity,
      price,
      fee,
      currency,
      realized_pnl,
      executed_at,
    },
  });
}

/**
 * Update a portfolio position after a transaction
 */
export async function updatePositionAfterTransaction(position_id, updates) {
  return prisma.portfolio_positions.update({
    where: { id: position_id },
    data: updates,
  });
}