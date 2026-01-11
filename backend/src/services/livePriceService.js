import { LivePriceRepository } from "../repositories/LivePriceRepository.js";

export async function saveLivePrices(prices) {
  const symbols = Object.keys(prices);
  if (!symbols.length) return;

  for (const key of symbols) {
    const entry = prices[key];
    const original = entry.original ?? key;
    const used = entry.used_symbol ?? key;
    const price = entry.price;
    const now = new Date();

    try {
      if (price == null || Number.isNaN(price)) {
        console.log(`[FAIL] ${original} → marking fetched=true`);
        await LivePriceRepository.markPendingFetched(original);
        continue;
      }

      console.log(`[OK] ${used} → ${price}`);
      await LivePriceRepository.upsertPrice(used, price, "USD", now);
      await LivePriceRepository.insertHistory(used, price, now);
      await LivePriceRepository.deletePendingFetch(original);

    } catch (err) {
      console.error("[UNHANDLED] saveLivePrices:", err);
    }
  }
}