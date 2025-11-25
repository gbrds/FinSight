import yfinance as yf
import json
import sys

# ---------------------------
# Fetch latest closing prices
# ---------------------------
def fetch_prices(tickers):
    results = {}

    for ticker in tickers:
        try:
            t = yf.Ticker(ticker)
            hist = t.history(period="1d")

            if hist.empty:
                results[ticker] = {
                    "price": None,
                    "error": "No data returned"
                }
                continue

            price = float(hist["Close"].iloc[-1])

            results[ticker] = {
                "price": price,
                "error": None
            }

        except Exception as e:
            results[ticker] = {
                "price": None,
                "error": str(e)
            }

    return results


# ---------------------------
# Entry point for Node usage
# ---------------------------
if __name__ == "__main__":
    # Example usage:
    # python fetch_prices.py "AAPL,TSLA,MSFT"
    raw = sys.argv[1] if len(sys.argv) > 1 else ""

    if not raw:
        print(json.dumps({"error": "No tickers provided"}))
        sys.exit(1)

    tickers = raw.split(",")

    data = fetch_prices(tickers)
    print(json.dumps(data))