import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { mockPortfolioHoldings } from "../data/mockData";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PortfolioDetail = () => {
  const { id } = useParams();

  // Calculate summary stats dynamically based on the mock data
  const totalValue = mockPortfolioHoldings.reduce(
    (acc, curr) => acc + curr.value,
    0
  );
  const dayChangeTotal = mockPortfolioHoldings.reduce(
    (acc, curr) => acc + curr.value * (curr.dayChange / 100),
    0
  );
  const totalGainLoss = mockPortfolioHoldings.reduce(
    (acc, curr) => acc + (curr.value - curr.quantity * curr.avgCost),
    0
  );

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation */}
      <div>
        <Link
          to="/portfolios"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Portfolios</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">
          Portfolio Details (ID: {id})
        </h1>
      </div>

      {/* 2. Summary Cards (Top Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            Total Value
          </p>
          <h2 className="text-2xl font-bold text-white mt-1">
            ${totalValue.toLocaleString()}
          </h2>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            Today's Change
          </p>
          <div
            className={cn(
              "flex items-center gap-2 mt-1 font-bold text-xl",
              dayChangeTotal >= 0 ? "text-green-400" : "text-red-400"
            )}
          >
            <span>
              {dayChangeTotal >= 0 ? "+" : ""}${dayChangeTotal.toFixed(2)}
            </span>
            <span className="text-sm font-medium bg-gray-800 px-2 py-0.5 rounded">
              0.85%
            </span>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            Total Gain/Loss
          </p>
          <div
            className={cn(
              "flex items-center gap-2 mt-1 font-bold text-xl",
              totalGainLoss >= 0 ? "text-green-400" : "text-red-400"
            )}
          >
            <span>
              {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toLocaleString()}
            </span>
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>

      {/* 3. Action Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by ticker or company..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4. Holdings Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800/50 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4 min-w-[150px]">Stock</th>
                <th className="p-4 text-right">Quantity</th>
                <th className="p-4 text-right">Avg. Cost</th>
                <th className="p-4 text-right">Last Price</th>
                <th className="p-4 text-right">Current Value</th>
                <th className="p-4 text-right">Day's P/L</th>
                <th className="p-4 text-right">Total P/L</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {mockPortfolioHoldings.map((stock) => {
                const totalPL = (stock.price - stock.avgCost) * stock.quantity;
                const dayPL = stock.value * (stock.dayChange / 100);

                return (
                  <tr
                    key={stock.id}
                    className="hover:bg-gray-800/40 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-xs text-white">
                          {stock.symbol[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white">
                            {stock.symbol}
                          </div>
                          <div className="text-xs text-gray-500">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right text-gray-300">
                      {stock.quantity}
                    </td>
                    <td className="p-4 text-right text-gray-300">
                      ${stock.avgCost.toFixed(2)}
                    </td>
                    <td className="p-4 text-right font-medium text-white">
                      ${stock.price.toFixed(2)}
                    </td>
                    <td className="p-4 text-right font-bold text-white">
                      ${stock.value.toLocaleString()}
                    </td>

                    {/* Day P/L */}
                    <td
                      className={cn(
                        "p-4 text-right font-medium",
                        stock.dayChange >= 0 ? "text-green-400" : "text-red-400"
                      )}
                    >
                      <div className="flex flex-col items-end">
                        <span>
                          {stock.dayChange >= 0 ? "+" : ""}${dayPL.toFixed(2)}
                        </span>
                        <span className="text-xs opacity-80">
                          {stock.dayChange}%
                        </span>
                      </div>
                    </td>

                    {/* Total P/L */}
                    <td
                      className={cn(
                        "p-4 text-right font-medium",
                        totalPL >= 0 ? "text-green-400" : "text-red-400"
                      )}
                    >
                      <div className="flex flex-col items-end">
                        <span>
                          {totalPL >= 0 ? "+" : ""}${totalPL.toLocaleString()}
                        </span>
                        <span className="text-xs opacity-80">
                          {stock.totalChange}%
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <button className="text-gray-500 hover:text-white p-2 rounded hover:bg-gray-700 transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetail;
