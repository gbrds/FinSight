// src/repositories/reportingRepository.js
import prisma from "../clients/prismaClient.js";

// Fetch positions + latest metrics for a portfolio
export async function getPortfolioPositionsWithMetrics(portfolio_id) {
  return prisma.portfolio_positions.findMany({
    where: { portfolio_id },
    include: {
      portfolio_position_metrics: {
        orderBy: { updated_at: "desc" },
        take: 1,
      },
    },
  });
}

// Insert equity curve snapshot
export async function insertEquityCurve(snapshot) {
  return prisma.portfolio_equity_curve.create({
    data: snapshot,
  });
}

// Fetch last equity curve snapshot to avoid duplicates
export async function getLastEquitySnapshot(portfolio_id) {
  return prisma.portfolio_equity_curve.findFirst({
    where: { portfolio_id },
    orderBy: { timestamp: "desc" },
  });
}

// Fetch equity curve for a portfolio
export async function getEquityCurveByPortfolio(portfolio_id, limit = 100) {
  return prisma.portfolio_equity_curve.findMany({
    where: { portfolio_id },
    orderBy: { timestamp: "asc" },
    take: limit,
  });
}

// Fetch all portfolios for a user
export async function getUserPortfolios(user_id) {
  return prisma.portfolios.findMany({
    where: { user_id },
    select: { id: true },
  });
}

// Fetch equity curves for multiple portfolio IDs
export async function getEquityCurveByPortfolios(portfolioIds, limit = 100) {
  return prisma.portfolio_equity_curve.findMany({
    where: { portfolio_id: { in: portfolioIds } },
    orderBy: { timestamp: "asc" },
    take: limit * portfolioIds.length,
  });
}