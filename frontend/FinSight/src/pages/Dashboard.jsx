import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
} from "lucide-react";
import {
  mockPortfolioSummary,
  mockHoldings,
  mockMarketNews,
} from "../data/mockData";

const Dashboard = () => {
  const isPositive = mockPortfolioSummary.dayChange >= 0;

  return (
    <div className="space-y-6">
      {/* 1. Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Value Card */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium">
                Total Portfolio Value
              </p>
              <h2 className="text-3xl font-bold text-white mt-1">
                ${mockPortfolioSummary.totalValue.toLocaleString()}
              </h2>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
          <div
            className={`flex items-center gap-2 text-sm ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            <span className="font-semibold">
              ${mockPortfolioSummary.dayChange.toLocaleString()}
            </span>
            <span>({mockPortfolioSummary.dayChangePercent}%)</span>
            <span className="text-gray-500 ml-1">Today</span>
          </div>
        </div>

        {/* Buying Power Card */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium">Buying Power</p>
              <h2 className="text-3xl font-bold text-white mt-1">
                ${mockPortfolioSummary.buyingPower.toLocaleString()}
              </h2>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Activity className="text-blue-500" size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm">Available cash to trade</p>
        </div>

        {/* Quick Action Placeholder */}
        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl flex flex-col justify-center items-center cursor-pointer hover:bg-green-500/20 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <span className="text-black text-2xl font-bold">+</span>
          </div>
          <p className="text-green-400 font-semibold">Add New Asset</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Main Chart / Holdings Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Placeholder */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-80 flex flex-col justify-center items-center text-gray-500">
            <p>Portfolio Performance Chart</p>
            <p className="text-xs text-gray-600">
              (We will install Recharts here next)
            </p>
          </div>

          {/* Holdings List  */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">Top Holdings</h3>
              <button className="text-sm text-green-400 hover:text-green-300">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="p-4">Symbol</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Change</th>
                    <th className="p-4 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {mockHoldings.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-white">
                          {stock.symbol}
                        </div>
                        <div className="text-xs text-gray-500">
                          {stock.name}
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">
                        ${stock.price.toFixed(2)}
                      </td>
                      <td
                        className={`p-4 font-medium ${
                          stock.change >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {stock.change > 0 ? "+" : ""}
                        {stock.changePercent}%
                      </td>
                      <td className="p-4 text-right font-medium text-white">
                        ${stock.value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. News Feed  */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit">
          <h3 className="font-bold text-lg mb-4">Market News</h3>
          <div className="space-y-4">
            {mockMarketNews.map((news) => (
              <div key={news.id} className="group cursor-pointer">
                <div className="flex gap-2 text-xs text-green-400 mb-1">
                  <span>{news.source}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-500">{news.time}</span>
                </div>
                <h4 className="font-medium text-gray-200 group-hover:text-green-400 transition-colors leading-snug">
                  {news.headline}
                </h4>
                <div className="mt-2 flex gap-2">
                  {news.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
