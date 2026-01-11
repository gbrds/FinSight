import { supabaseAdmin } from "../clients/supabaseClient.js";

export const LivePriceRepository = {
  async upsertPrice(symbol, price, currency = "USD", scrapedAt = new Date()) {
    const { error } = await supabaseAdmin
      .from("live_prices")
      .upsert(
        {
          symbol,
          price,
          currency,
          scraped_at: scrapedAt,
        },
        { onConflict: "symbol" }
      );

    if (error) throw error;
  },

  async insertHistory(symbol, price, recordedAt = new Date()) {
    const { error } = await supabaseAdmin
      .from("price_history")
      .insert({
        symbol,
        price,
        recorded_at: recordedAt,
      });

    if (error) throw error;
  },

  async deletePendingFetch(symbol) {
    const { error } = await supabaseAdmin
      .from("pending_fetch")
      .delete()
      .eq("symbol", symbol);

    if (error) throw error;
  },

  async markPendingFetched(symbol) {
    const { error } = await supabaseAdmin
      .from("pending_fetch")
      .upsert(
        { symbol, fetched: true },
        { onConflict: "symbol" }
      );

    if (error) throw error;
  },
};