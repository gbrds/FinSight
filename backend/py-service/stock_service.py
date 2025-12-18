import asyncio
import json
from datetime import datetime
import yfinance as yf
import aiohttp

REFRESH_INTERVAL = 60

TICKERS_URL = "http://localhost:3001/api/tickers"
FAILED_URL = "http://localhost:3001/api/failed"

price_cache = {}
resolved_symbols = {}
blacklist = set()  # permanent failures


# --------------------------------------------------
# Load permanently failed tickers from backend
# --------------------------------------------------
async def load_blacklist():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(FAILED_URL) as resp:
                if resp.status != 200:
                    print(f"[INIT] Failed list HTTP {resp.status}")
                    return

                if "application/json" not in resp.headers.get("Content-Type", ""):
                    print("[INIT] Failed list returned non-JSON")
                    return

                data = await resp.json()
                failed = data.get("failed", [])
                blacklist.update(failed)

                print(f"[INIT] Loaded blacklist: {failed}")

    except Exception as e:
        print(f"[INIT ERROR] Blacklist load failed: {e}")


# --------------------------------------------------
# Fetch tickers from backend
# --------------------------------------------------
async def get_tickers():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(TICKERS_URL) as resp:

                if resp.status != 200:
                    text = await resp.text()
                    print(f"[ERROR] Tickers HTTP {resp.status}: {text[:200]}")
                    return []

                if "application/json" not in resp.headers.get("Content-Type", ""):
                    text = await resp.text()
                    print(f"[ERROR] Tickers non-JSON: {text[:200]}")
                    return []

                data = await resp.json()
                raw = data.get("tickers", [])

                # Remove permanently blacklisted symbols
                tickers = [t for t in raw if t not in blacklist]

                print(f"[DEBUG] Backend tickers: {tickers}")
                return tickers

    except Exception as e:
        print(f"[ERROR] Backend fetch failed: {e}")
        return []


# --------------------------------------------------
# Fetch prices (one failure = permanent blacklist)
# --------------------------------------------------
async def fetch_prices(tickers):
    results = {}

    for ticker in tickers:
        if ticker in blacklist:
            continue

        symbols_to_try = []

        # Use cached resolution first
        if ticker in resolved_symbols:
            symbols_to_try.append(resolved_symbols[ticker])
        else:
            symbols_to_try.append(ticker)

            # heuristic: crypto fallback
            if "-" not in ticker:
                symbols_to_try.append(f"{ticker}-USD")

        success = False
        last_error = None

        for sym in symbols_to_try:
            try:
                t = yf.Ticker(sym)
                hist = t.history(period="1d", interval="1m")

                if hist.empty:
                    raise Exception("Empty price history")

                price = float(hist["Close"].iloc[-1])

                entry = {
                    "price": price,
                    "error": None,
                    "original": ticker,
                    "used_symbol": sym,
                    "timestamp": datetime.utcnow().isoformat()
                }

                resolved_symbols[ticker] = sym
                price_cache[ticker] = entry
                results[ticker] = entry
                success = True
                break

            except Exception as e:
                last_error = str(e)

        # Permanent failure → blacklist
        if not success:
            blacklist.add(ticker)

            entry = {
                "price": None,
                "error": last_error,
                "original": ticker,
                "used_symbol": None,
                "timestamp": datetime.utcnow().isoformat()
            }

            price_cache[ticker] = entry
            results[ticker] = entry

    return {
        "prices": results,
        "manual_required": {
            t: v for t, v in results.items() if v["price"] is None
        }
    }


# --------------------------------------------------
# Main loop
# --------------------------------------------------
async def main():
    await load_blacklist()

    while True:
        tickers = await get_tickers()
        data = await fetch_prices(tickers)

        # STRICT protocol: JSON messages prefixed
        print("__JSON__" + json.dumps(data), flush=True)

        await asyncio.sleep(REFRESH_INTERVAL)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("[STOP] Python service stopped.")