import { supabase } from "./supabaseClient.js";

export async function saveLivePrices(prices) {
  console.log("[saveLivePrices] Got:", Object.keys(prices));

  for (const symbol in prices) {
    const entry = prices[symbol];
    const original = entry.original;
    const used = entry.used_symbol;
    const price = entry.price;

    try {
      // -------------------------------------------------------
      // FAILED FETCH — mark pending_fetch as fetched=true
      // -------------------------------------------------------
      if (!price) {
        console.log(`[FAIL] ${original} → marking fetched=true`);

        const { error } = await supabase
          .from("pending_fetch")
          .upsert(
            { symbol: original, fetched: true },
            { onConflict: ["symbol"] }
          );

        if (error) console.error("[DB ERROR] pending_fetch fail:", error);
        continue;
      }

      // -------------------------------------------------------
      // SUCCESS — save into live_prices
      // -------------------------------------------------------
      console.log(`[OK] Saving price for ${used}: ${price}`);

      const now = new Date().toISOString();

      const { error: lpErr } = await supabase
        .from("live_prices")
        .upsert(
          { symbol: used, price, currency: "USD", scraped_at: now },
          { onConflict: ["symbol"] }
        );

      if (lpErr) {
        console.error("[DB ERROR] live_prices:", lpErr);
        continue;
      }

      // -------------------------------------------------------
      // ALSO INSERT INTO price_history  
      // Trigger will auto-delete old candles
      // -------------------------------------------------------
      const { error: histErr } = await supabase
        .from("price_history")
        .insert({
          symbol: used,
          price,
          recorded_at: now,
        });

      if (histErr) {
        console.error("[DB ERROR] price_history insert:", histErr);
        // continue; // still safe to clean pending_fetch
      }

      // -------------------------------------------------------
      // CLEANUP pending_fetch
      // -------------------------------------------------------
      const { error: delErr } = await supabase
        .from("pending_fetch")
        .delete()
        .eq("symbol", original);

      if (delErr) console.error("[DB ERROR] cleanup:", delErr);
      else console.log(`[CLEANUP] Removed ${original} from pending_fetch`);

    } catch (err) {
      console.error("[UNHANDLED ERROR] saveLivePrices:", err);
    }
  }
}