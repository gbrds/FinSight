import prisma from "../clients/prismaClient.js";

export const LivePriceRepository = {
  async upsertPrice(symbol, price, currency = "USD", scrapedAt = new Date()) {
    return prisma.live_prices.upsert({
      where: { symbol },
      update: { price, currency, scraped_at: scrapedAt },
      create: { symbol, price, currency, scraped_at: scrapedAt },
    });
  },

  async insertHistory(symbol, price, recordedAt = new Date()) {
    return prisma.price_history.create({
      data: { symbol, price, recorded_at: recordedAt },
    });
  },

  async deletePendingFetch(symbol) {
    return prisma.pending_fetch.deleteMany({ where: { symbol } });
  },

  async markPendingFetched(symbol) {
    return prisma.pending_fetch.upsert({
      where: { symbol },
      update: { fetched: true },
      create: { symbol, fetched: true },
    });
  },
};