import prisma from "../clients/prismaClient.js";

export const TickerRepository = {
  async getLiveSymbols() {
    return prisma.live_prices.findMany({ select: { symbol: true } });
  },

  async getPendingSymbols() {
    return prisma.pending_fetch.findMany({
      select: { symbol: true },
      where: { fetched: false },
    });
  },
};
