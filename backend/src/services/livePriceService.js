import { supabaseAdmin as supabase } from "../clients/supabaseClient.js";

export async function saveLivePrices(prices) {
  const symbols = Object.keys(prices);
  console.log("[saveLivePrices] Incoming symbols:", symbols);

  if (symbols.length === 0) {
    console.log("[saveLivePrices] Nothing to save");
    return;
  }

  for (const key of symbols) {
    const entry = prices[key];

    const original = entry.original ?? key;
    const used = entry.used_symbol ?? key;
    const price = entry.price;

    const now = new Date().toISOString();

    try {
      /* =======================================================
         FAILED FETCH → mark pending_fetch as fetched = true
         ======================================================= */
      if (price === null || price === undefined || Number.isNaN(price)) {
        console.log(`[FAIL] ${original} → no price, marking fetched=true`);

        const { error } = await supabase
          .from("pending_fetch")
          .upsert(
            {
              symbol: original,
              fetched: true,
            },
            { onConflict: "symbol" }
          );

        if (error) {
          console.error("[DB ERROR] pending_fetch upsert:", error);
        }

        continue;
      }

      /* =======================================================
         SUCCESS → upsert live_prices
         ======================================================= */
      console.log(`[OK] ${used} → ${price}`);

      const { error: liveErr } = await supabase
        .from("live_prices")
        .upsert(
          {
            symbol: used,
            price,
            currency: "USD",
            scraped_at: now,
          },
          { onConflict: "symbol" }
        );

      if (liveErr) {
        console.error("[DB ERROR] live_prices upsert:", liveErr);
        continue;
      }

      /* =======================================================
         INSERT price_history (append-only)
         ======================================================= */
      const { error: histErr } = await supabase
        .from("price_history")
        .insert({
          symbol: used,
          price,
          recorded_at: now,
        });

      if (histErr) {
        console.error("[DB ERROR] price_history insert:", histErr);
        // non-fatal
      }

      /* =======================================================
         CLEAN pending_fetch
         ======================================================= */
      const { error: delErr } = await supabase
        .from("pending_fetch")
        .delete()
        .eq("symbol", original);

      if (delErr) {
        console.error("[DB ERROR] pending_fetch delete:", delErr);
      } else {
        console.log(`[CLEANUP] ${original} removed from pending_fetch`);
      }
    } catch (err) {
      console.error("[UNHANDLED] saveLivePrices:", err);
    }
  }
}