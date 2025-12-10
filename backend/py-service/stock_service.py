import asyncio
import json
from datetime import datetime
import yfinance as yf
import aiohttp

REFRESH_INTERVAL = 60

price_cache = {}
resolved_symbols = {}
manual_override = set()  # persistent failed symbols

TICKERS_URL = "http://localhost:3001/api/tickers"
FAILED_URL = "http://localhost:3001/api/failed"


# ----------------------------
# Load failed tickers (persistent)
# ----------------------------
async def load_failed_from_backend():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(FAILED_URL) as resp:
                data = await resp.json()
                failed = data.get("failed", [])

                manual_override.update(failed)
                print(f"[INIT] Loaded failed tickers: {failed}")
    except Exception as e:
        print(f"[INIT ERROR] Could not load failed tickers: {e}")


# ----------------------------
# Backend tickers (only unfetched)
# ----------------------------
async def get_tickers():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(TICKERS_URL) as resp:
                data = await resp.json()
                raw = data.get("tickers", [])

                # Filter out known failed tickers
                tickers = [t for t in raw if t not in manual_override]

                print(f"[DEBUG] Tickers from backend: {tickers}")
                return tickers
    except Exception as e:
        print(f"[ERROR] Backend fetch failed: {e}")
        return []


# ----------------------------
# Price fetcher
# ----------------------------
async def fetch_prices(tickers):
    results = {}

    for ticker in tickers:

        if ticker in manual_override:
            results[ticker] = {
                "price": None,
                "error": "manual_override",
                "original": ticker,
                "used_symbol": None,
                "timestamp": datetime.utcnow().isoformat()
            }
            continue

        # Try cached resolution first
        symbols_to_try = [resolved_symbols.get(ticker, ticker)]

        # If it's likely a stock name, also try -USD (crypto)
        if "-" not in ticker:
            symbols_to_try.append(ticker + "-USD")

        entry = None

        for sym in symbols_to_try:
            try:
                t = yf.Ticker(sym)
                hist = t.history(period="1d", interval="1m")

                if hist.empty:
                    raise Exception("Empty data")

                price = float(hist["Close"].iloc[-1])

                entry = {
                    "price": price,
                    "error": None,
                    "original": ticker,
                    "used_symbol": sym,
                    "timestamp": datetime.utcnow().isoformat()
                }

                resolved_symbols[ticker] = sym
                break

            except Exception as e:
                entry = {
                    "price": None,
                    "error": str(e),
                    "original": ticker,
                    "used_symbol": sym,
                    "timestamp": datetime.utcnow().isoformat()
                }

        results[ticker] = entry
        price_cache[ticker] = entry

        # Permanent failure? Do not try again
        if entry["price"] is None:
            manual_override.add(ticker)

    return {
        "prices": price_cache,
        "manual_required": {t: v for t, v in price_cache.items() if v["price"] is None}
    }


# ----------------------------
# Main Loop
# ----------------------------
async def main_loop():
    await load_failed_from_backend()

    while True:
        tickers = await get_tickers()
        data = await fetch_prices(tickers)

        # ALWAYS print clean JSON only
        print(json.dumps(data), flush=True)

        await asyncio.sleep(REFRESH_INTERVAL)


if __name__ == "__main__":
    try:
        asyncio.run(main_loop())
    except KeyboardInterrupt:
        print("[STOP] Python service stopped.")