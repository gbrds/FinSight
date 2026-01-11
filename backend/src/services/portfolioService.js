import { v4 as uuidv4 } from "uuid";
import * as portfolioRepo from "../repositories/portfolioRepository.js";

export async function createPortfolio({ user_id, name }) {
  try {
    const id = uuidv4();
    const portfolio = await portfolioRepo.insertPortfolio({ id, user_id, name });
    return portfolio || null;
  } catch (err) {
    console.error('[portfolioService] createPortfolio error:', err.message);
    return null;
  }
}

export async function getUserPortfolios(user_id) {
  try {
    const portfolios = await portfolioRepo.findPortfoliosByUserId(user_id);
    return portfolios || [];
  } catch (err) {
    console.error('[portfolioService] getUserPortfolios error:', err.message);
    return [];
  }
}