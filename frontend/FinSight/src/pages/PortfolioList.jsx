import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { mockPortfolios } from "../data/mockData";
import { useState } from "react";
import CreatePortfolioModal from "../../components/CreatePortfolioModal.jsx";


function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PortfolioList = () => {
  const totalNetWorth = mockPortfolios.reduce(
    (acc, curr) => acc + curr.value,
    0
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">My Portfolios</h1>
          <p className="text-gray-400 text-sm">
            Total Net Worth across all accounts
          </p>
          <div className="text-3xl font-bold text-green-400 mt-1">
            ${totalNetWorth.toLocaleString()}
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Plus size={18} />
          <span>Create Portfolio</span>
        </button>
            <CreatePortfolioModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onCreate={(name) => {
        console.log("New portfolio name:", name);
        // hiljem: API / state / backend
      }}
    />
      </div>

      {/* Grid of Portfolios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPortfolios.map((portfolio) => (
          <Link
            to={`/portfolios/${portfolio.id}`}
            key={portfolio.id}
            className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all hover:bg-gray-800/50"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-800 rounded-xl group-hover:bg-gray-700 transition-colors">
                <Wallet className="text-green-500" size={24} />
              </div>
              <span className="px-2 py-1 bg-gray-800 text-xs text-gray-400 rounded uppercase font-semibold">
                {portfolio.type}
              </span>
            </div>

            {/* Main Numbers */}
            <h3 className="text-lg font-bold text-gray-100 mb-1 group-hover:text-green-400 transition-colors">
              {portfolio.name}
            </h3>
            <div className="text-2xl font-bold text-white mb-4">
              ${portfolio.value.toLocaleString()}
            </div>

            {/* Footer Stats */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  portfolio.change >= 0 ? "text-green-400" : "text-red-400"
                )}
              >
                {portfolio.change >= 0 ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
                <span>{portfolio.changePercent}%</span>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <TrendingUp size={14} />
                <span>${portfolio.cash.toLocaleString()} Cash</span>
              </div>
            </div>
          </Link>
        ))}

        {/* "Add New" Empty State Card */}
        <button className="border border-dashed border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-green-400 hover:border-green-500/50 hover:bg-green-500/5 transition-all min-h-[200px]">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
            <Plus size={24} />
          </div>
          <span className="font-medium">Open New Account</span>
        </button>
      </div>
    </div>
  );
};

export default PortfolioList;
