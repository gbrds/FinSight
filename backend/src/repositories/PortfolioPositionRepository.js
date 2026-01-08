// src/repositories/portfolioPositionRepository.js
import prisma from "../clients/prismaClient.js";

export async function addPosition({ id, portfolio_id, symbol, live_price_id, quantity = 0, avg_buy_price = 0, status = "open", opened_at = null, closed_at = null }) {
  return prisma.portfolio_positions.create({
    data: {
      id,
      portfolio_id,
      symbol,
      live_price_id,
      quantity,
      avg_buy_price,
      status,
      opened_at,
      closed_at,
    },
  });
}

export async function getPositionsByPortfolioId(portfolio_id) {
  return prisma.portfolio_positions.findMany({
    where: { portfolio_id },
    include: {
      live_prices: true,
      portfolio_position_metrics: true,
    },
  });
}

export async function getPositionById(id) {
  return prisma.portfolio_positions.findUnique({
    where: { id },
    include: {
      live_prices: true,
      portfolio_position_metrics: true,
    },
  });
}

export async function updatePosition(id, updates) {
  return prisma.portfolio_positions.update({
    where: { id },
    data: updates,
  });
}