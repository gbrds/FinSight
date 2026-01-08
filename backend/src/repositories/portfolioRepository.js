// src/repositories/portfolioRepository.js
import prisma from "../clients/prismaClient.js";

export async function insertPortfolio({ id, user_id, name }) {
  return prisma.portfolios.create({
    data: { id, user_id, name },
  });
}

export async function findPortfoliosByUserId(user_id) {
  return prisma.portfolios.findMany({
    where: { user_id },
  });
}

export async function getPortfolioPositionsWithLivePrices(portfolio_id) {
  return prisma.portfolio_positions.findMany({
    where: { portfolio_id },
    include: {
      portfolio_position_metrics: true,
      live_prices: true, // includes `price`
    },
  });
}

export async function upsertPositionMetrics(metrics) {
  return prisma.portfolio_position_metrics.upsert({
    where: { position_id: metrics.position_id },
    update: {
      portfolio_id: metrics.portfolio_id,
      symbol: metrics.symbol,
      current_price: metrics.current_price,
      market_value: metrics.market_value,
      unrealized_pnl: metrics.unrealized_pnl,
      unrealized_pnl_pct: metrics.unrealized_pnl_pct,
      updated_at: metrics.updated_at,
    },
    create: metrics,
  });
}

export async function getPortfolioCashBalance(portfolio_id) {
  const portfolio = await prisma.portfolios.findUnique({
    where: { id: portfolio_id },
    select: { cash_balance: true },
  });
  return portfolio?.cash_balance ?? 0;
}

export async function insertEquityCurve(snapshot) {
  return prisma.portfolio_equity_curve.create({
    data: snapshot,
  });
}