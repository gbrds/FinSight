import React from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Share2,
  TrendingUp,
  DollarSign,
  BarChart2,
  Clock,
  Newspaper,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { mockPortfolioHistory, mockStockDetail } from "../data/mockData"; // Reusing history for chart

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const StockDetail = () => {
  const { ticker } = useParams();
  const isPositive = mockStockDetail.change >= 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Top Header (Ticker & Price) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-xl text-white">
              {ticker || "AAPL"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white leading-none">
                {mockStockDetail.name}
              </h1>
              <span className="text-gray-400 font-medium">
                NASDAQ: {ticker || "AAPL"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <h2 className="text-4xl font-bold text-white">
            ${mockStockDetail.price}
          </h2>
          <div
            className={cn(
              "flex items-center gap-2 font-medium text-lg",
              isPositive ? "text-green-400" : "text-red-400"
            )}
          >
            <span>
              {isPositive ? "+" : ""}
              {mockStockDetail.change} ({mockStockDetail.changePercent}%)
            </span>
            <span className="text-xs text-gray-500 font-normal uppercase">
              Today
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (Chart & Stats) - Takes up 2/3 */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Container */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-200">Price Performance</h3>
              <div className="flex bg-gray-800 rounded-lg p-1">
                {["1D", "1W", "1M", "YTD", "1Y"].map((t) => (
                  <button
                    key={t}
                    className="px-3 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPortfolioHistory}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="#374151"
                    opacity={0.2}
                  />
                  <XAxis dataKey="date" hide />
                  <YAxis
                    orientation="right"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #374151",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#colorStock)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Statistics Grid */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Key Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
              {[
                { label: "Market Cap", value: mockStockDetail.marketCap },
                { label: "P/E Ratio", value: mockStockDetail.peRatio },
                { label: "Div Yield", value: mockStockDetail.dividendYield },
                { label: "Avg Volume", value: mockStockDetail.volume },
                { label: "52 Wk High", value: mockStockDetail.high52 },
                { label: "52 Wk Low", value: mockStockDetail.low52 },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-gray-500 text-xs uppercase font-medium">
                    {stat.label}
                  </p>
                  <p className="text-white font-bold mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div>
            <h3 className="font-bold text-white mb-2">
              About {mockStockDetail.name}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {mockStockDetail.about}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN (Actions & News) - Takes up 1/3 */}
        <div className="space-y-6">
          {/* Trade Panel */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-6">
            <div className="flex justify-between mb-6">
              <button className="flex-1 py-2 text-center font-bold bg-green-500 text-black rounded-l-lg hover:bg-green-400 transition">
                Buy
              </button>
              <button className="flex-1 py-2 text-center font-bold bg-gray-800 text-gray-300 rounded-r-lg hover:bg-gray-700 transition">
                Sell
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Buying Power</span>
                <span className="text-white font-medium">$15,873.10</span>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Shares</span>
                <input
                  type="number"
                  placeholder="0"
                  className="bg-transparent text-right text-white font-bold outline-none w-20"
                />
              </div>
              <div className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Market Price</span>
                <span className="text-white font-bold">
                  ${mockStockDetail.price}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                <span className="text-gray-300 font-medium">
                  Estimated Cost
                </span>
                <span className="text-xl font-bold text-white">$0.00</span>
              </div>
              <button className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition-colors mt-2">
                Submit Order
              </button>
            </div>
          </div>

          {/* News Feed */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Newspaper size={18} className="text-gray-400" />
              <span>Related News</span>
            </h3>
            <div className="space-y-4">
              {mockStockDetail.news.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <p className="text-xs text-green-400 mb-1 flex items-center gap-1">
                    {item.source} <span className="text-gray-600">•</span>{" "}
                    {item.time}
                  </p>
                  <h4 className="text-sm font-medium text-gray-300 group-hover:text-green-400 transition leading-snug">
                    {item.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
