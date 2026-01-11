import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import CreatePortfolioModal from "../../components/CreatePortfolioModal";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { authFetch } from "../services/api.js";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PortfolioList = ({ session }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch portfolios with totals
  const fetchPortfolios = async () => {
    if (!session?.token) return;

    try {
      const res = await authFetch("http://localhost:3001/api/portfolio-summary");
      if (!res.ok) throw new Error(`Failed to fetch portfolios (HTTP ${res.status})`);
      const data = await res.json();
      setPortfolios(data.portfolios || []);
    } catch (err) {
      console.error("Failed to fetch portfolios:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, [session]);

  const handleCreatePortfolio = async (name) => {
    if (!session?.token) return;

    try {
      const res = await fetch("http://localhost:3001/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error(`Failed to create portfolio (HTTP ${res.status})`);
      const newPortfolio = await res.json();
      setPortfolios((prev) => [...prev, newPortfolio]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create portfolio:", err.message);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-green-500">
        Loading portfolios...
      </div>
    );

  // Formatting helpers
  const formatUSD = (num) =>
    Number(num || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatPercent = (num) =>
    Number(num || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalValueAll = portfolios.reduce((sum, p) => sum + (p.totalValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Portfolios</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Plus size={18} />
          <span>Create Portfolio</span>
        </button>
      </div>

      {/* Total across all portfolios */}
      {portfolios.length > 0 && (
        <div className="text-white font-bold text-xl mb-4">
          Total Portfolio Value: ${formatUSD(totalValueAll)}
        </div>
      )}

      {/* Grid of Portfolios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => {
          const change = portfolio.change ?? 0;
          const changePercent = portfolio.changePercent ?? 0;
          const cash = portfolio.cash ?? 0;
          const isPositive = change >= 0;

          return (
            <Link
              to={`/portfolios/${portfolio.id}`}
              key={portfolio.id}
              className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all hover:bg-gray-800/50"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-gray-800 rounded-xl group-hover:bg-gray-700 transition-colors">
                  <Wallet className="text-green-500" size={24} />
                </div>
                <span className="px-2 py-1 bg-gray-800 text-xs text-gray-400 rounded uppercase font-semibold">
                  {portfolio.type || "Brokerage"}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-100 mb-1 group-hover:text-green-400 transition-colors">
                {portfolio.name}
              </h3>
              <div className="text-2xl font-bold text-white mb-4">
                ${formatUSD(portfolio.totalValue)}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                {/* % Change */}
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    isPositive ? "text-green-400" : "text-red-400"
                  )}
                >
                  {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  <span>{formatPercent(changePercent)}%</span>
                </div>

                {/* Cash */}
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <TrendingUp size={14} />
                  <span>${formatUSD(cash)} Cash</span>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Add New Portfolio Card */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="border border-dashed border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-green-400 hover:border-green-500/50 hover:bg-green-500/5 transition-all min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
            <Plus size={24} />
          </div>
          <span className="font-medium">Create Portfolio</span>
        </button>
      </div>

      {/* Create Portfolio Modal */}
      {isModalOpen && <CreatePortfolioModal onClose={() => setIsModalOpen(false)} onCreate={handleCreatePortfolio} />}
    </div>
  );
};

export default PortfolioList;
