import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Mock data for the "Screener" view
const marketMovers = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 182.41,
    change: 2.15,
    type: "gainer",
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    price: 164.2,
    change: 1.85,
    type: "gainer",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 455.0,
    change: -1.5,
    type: "loser",
  },
  {
    symbol: "PLTR",
    name: "Palantir Technologies",
    price: 24.5,
    change: 5.2,
    type: "gainer",
  },
];

const watchList = [
  { symbol: "AAPL", name: "Apple Inc.", price: 173.5, change: 1.34 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.0, change: -0.45 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 483.16, change: 0.98 },
];

const MarketResearch = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-8">
      {/* 1. Big Search Hero Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Find Your Next Investment
        </h1>
        <p className="text-gray-400 mb-6">
          Search for stocks, ETFs, and market data.
        </p>

        <div className="max-w-xl mx-auto relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Search symbol (e.g. AAPL, BTC)..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-green-500 transition-colors text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Market Movers (Gainers/Losers) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Trending Today</h2>
            <button className="text-green-400 text-sm hover:underline">
              View Market Map
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketMovers.map((stock) => (
              <Link
                to={`/stocks/${stock.symbol}`}
                key={stock.symbol}
                className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center hover:bg-gray-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center bg-gray-800",
                      stock.type === "gainer"
                        ? "text-green-500"
                        : "text-red-500"
                    )}
                  >
                    {stock.type === "gainer" ? (
                      <TrendingUp size={20} />
                    ) : (
                      <TrendingDown size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">
                      {stock.symbol}
                    </h3>
                    <p className="text-xs text-gray-500">{stock.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">${stock.price}</p>
                  <p
                    className={cn(
                      "text-xs font-bold",
                      stock.type === "gainer"
                        ? "text-green-400"
                        : "text-red-400"
                    )}
                  >
                    {stock.type === "gainer" ? "+" : ""}
                    {stock.change}%
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 3. Your Watchlist (Sidebar Style) */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-white">My Watchlist</h2>
            <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {watchList.map((stock) => (
              <Link
                to={`/stocks/${stock.symbol}`}
                key={stock.symbol}
                className="flex justify-between items-center group cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg -mx-2 transition-colors"
              >
                <div>
                  <div className="font-bold text-gray-200 group-hover:text-green-400">
                    {stock.symbol}
                  </div>
                  <div className="text-xs text-gray-500">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">${stock.price}</div>
                  <div
                    className={cn(
                      "text-xs",
                      stock.change >= 0 ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change}%
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button className="w-full mt-6 py-3 border border-gray-700 rounded-xl text-gray-400 text-sm hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center gap-2">
            <span>View Full Watchlist</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketResearch;
