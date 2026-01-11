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
  const positions = await prisma.portfolio_positions.findMany({
    where: { portfolio_id },
    include: {
      portfolio_position_metrics: true,
      live_prices: true, // includes `price`
    },
  });

  // Convert Decimal fields to Number
  return positions.map((pos) => ({
    ...pos,
    quantity: Number(pos.quantity ?? 0),
    avg_buy_price: Number(pos.avg_buy_price ?? 0),
    realized_pnl: Number(pos.realized_pnl ?? 0),
    last_updated: pos.last_updated ? new Date(pos.last_updated) : null,
    live_prices: pos.live_prices
      ? { ...pos.live_prices, price: Number(pos.live_prices.price ?? 0), day_change: Number(pos.live_prices.day_change ?? 0) }
      : null,
    portfolio_position_metrics: pos.portfolio_position_metrics
      ? {
          ...pos.portfolio_position_metrics,
          current_price: Number(pos.portfolio_position_metrics.current_price ?? 0),
          market_value: Number(pos.portfolio_position_metrics.market_value ?? 0),
          unrealized_pnl: Number(pos.portfolio_position_metrics.unrealized_pnl ?? 0),
          unrealized_pnl_pct: Number(pos.portfolio_position_metrics.unrealized_pnl_pct ?? 0),
          updated_at: pos.portfolio_position_metrics.updated_at ? new Date(pos.portfolio_position_metrics.updated_at) : null,
        }
      : null,
  }));
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
  return Number(portfolio?.cash_balance ?? 0);
}

export async function insertEquityCurve(snapshot) {
  return prisma.portfolio_equity_curve.create({
    data: snapshot,
  });
}

export async function insertPortfolioPosition({
  id,
  portfolio_id,
  symbol,
  quantity = 0,
  avg_buy_price = 0,
  status = "open",
  opened_at = null,
  closed_at = null,
  live_price_id = null,
}) {
  const position = await prisma.portfolio_positions.create({
    data: {
      id,
      portfolio_id,
      symbol,
      quantity,
      avg_buy_price,
      status,
      opened_at,
      closed_at,
      live_price_id,
    },
    include: {
      live_prices: true,
      portfolio_position_metrics: true,
    },
  });

  // Convert Decimal fields
  return {
    ...position,
    quantity: Number(position.quantity ?? 0),
    avg_buy_price: Number(position.avg_buy_price ?? 0),
    realized_pnl: Number(position.realized_pnl ?? 0),
    live_prices: position.live_prices
      ? { ...position.live_prices, price: Number(position.live_prices.price ?? 0), day_change: Number(position.live_prices.day_change ?? 0) }
      : null,
    portfolio_position_metrics: position.portfolio_position_metrics
      ? {
          ...position.portfolio_position_metrics,
          current_price: Number(position.portfolio_position_metrics.current_price ?? 0),
          market_value: Number(position.portfolio_position_metrics.market_value ?? 0),
          unrealized_pnl: Number(position.portfolio_position_metrics.unrealized_pnl ?? 0),
          unrealized_pnl_pct: Number(position.portfolio_position_metrics.unrealized_pnl_pct ?? 0),
        }
      : null,
  };
}