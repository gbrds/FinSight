// services/portfolioPositionService.js
import { v4 as uuidv4 } from "uuid";
import * as portfolioRepo from "../repositories/portfolioRepository.js";

/**
 * Add a position to a portfolio
 * - Enforces symbol uppercase
 * - Links live_price_id if exists
 * - Creates row with quantity = 0, avg_buy_price = 0, status = open
 */
export async function addPosition({ portfolio_id, symbol, user_id }) {
  try {
    if (!portfolio_id || !symbol || !user_id) {
      throw new Error("portfolio_id, symbol, and user_id are required");
    }

    symbol = symbol.toUpperCase();

    // 1️⃣ Check if position already exists
    const existingPositions = await portfolioRepo.getPortfolioPositionsWithLivePrices(portfolio_id);
    const existing = existingPositions.find((p) => p.symbol === symbol);
    if (existing) return existing;

    // 2️⃣ Link live price if exists
    const livePrice = existingPositions.find((p) => p.symbol === symbol)?.live_prices ?? null;
    const live_price_id = livePrice?.id ?? null;

    // 3️⃣ Insert portfolio position
    const now = new Date();
    const positionData = {
      id: uuidv4(),
      portfolio_id,
      symbol,
      live_price_id,
      quantity: 0,
      avg_buy_price: 0,
      status: "open",
      opened_at: null,
      closed_at: null,
      last_updated: now,
    };

    const inserted = await portfolioRepo.insertPortfolioPosition(positionData);

    return inserted;
  } catch (err) {
    console.error("[portfolioPositionService] addPosition error:", err);
    return null;
  }
}

/**
 * Fetch positions by portfolio_id with live prices and metrics
 */
export async function getPositionsByPortfolioId(portfolio_id) {
  try {
    const positions = await portfolioRepo.getPortfolioPositionsWithLivePrices(portfolio_id);

    return positions.map((pos) => ({
      ...pos,
      quantity: Number(pos.quantity ?? 0),
      avg_buy_price: Number(pos.avg_buy_price ?? 0),
      price: Number(pos.live_prices?.price ?? 0),
    }));
  } catch (err) {
    console.error("[portfolioPositionService] getPositionsByPortfolioId error:", err);
    return [];
  }
}