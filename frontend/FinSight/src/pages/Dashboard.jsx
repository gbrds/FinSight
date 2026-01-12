import React, { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, DollarSign, Activity } from "lucide-react";
import { authFetch } from "../services/api.js";
import EquityAreaChart from "../components/EquityAreaChart";

const Dashboard = ({ showEquityChart = true }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalValue: 0,
    totalCash: 0,
    topHoldings: [],
    dayChange: 0,
    dayChangePercent: 0,
    equityCurve: [],
  });
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No login token found. Please log in.");

      const res = await authFetch("/api/dashboard");
      if (res.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      if (!res.ok) throw new Error(`Failed to fetch dashboard data (HTTP ${res.status})`);

      const data = await res.json();

      setDashboardData({
        totalValue: data.totalValue ?? 0,
        totalCash: data.totalCash ?? 0,
        topHoldings: data.topHoldings ?? [],
        dayChange: data.dayChange ?? 0,
        dayChangePercent: data.dayChangePercent ?? 0,
        equityCurve: data.equityCurve ?? [],
      });
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Failed to load dashboard. Please try again.");
      setDashboardData({
        totalValue: 0,
        totalCash: 0,
        topHoldings: [],
        dayChange: 0,
        dayChangePercent: 0,
        equityCurve: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-white p-6">Loading dashboard...</div>;
  if (error) return <div className="text-red-400 p-6">{error}</div>;

  const isPositive = dashboardData.dayChange >= 0;

  const formatUSD = (num) =>
    Number(num || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatPercent = (num) =>
    Number(num || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  console.log(
    "[Dashboard] equityCurve",
    dashboardData.equityCurve.slice(0, 5)
  );

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Portfolio Value */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Portfolio Value</p>
              <h2 className="text-3xl font-bold text-white mt-1">${formatUSD(dashboardData.totalValue)}</h2>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
          <div className={`flex items-center gap-2 text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span className="font-semibold">${formatUSD(dashboardData.dayChange)}</span>
            <span>({formatPercent(dashboardData.dayChangePercent)}%)</span>
            <span className="text-gray-500 ml-1">Today</span>
          </div>
        </div>

        {/* Buying Power */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium">Buying Power</p>
              <h2 className="text-3xl font-bold text-white mt-1">${formatUSD(dashboardData.totalCash)}</h2>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Activity className="text-blue-500" size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm">Available cash to trade</p>
        </div>
      </div>

      {/* Equity Chart */}
      {showEquityChart && <EquityAreaChart data={dashboardData.equityCurve} />}

      {/* Top Holdings Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h3 className="font-bold text-lg">Top Holdings</h3>
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
              {dashboardData.topHoldings.length > 0 ? (
                dashboardData.topHoldings.map((stock) => {
                  const price = Number(stock.currentPrice) || 0;
                  const pnl = Number(stock.unrealizedPnl) || 0;
                  const value = Number(stock.marketValue) || 0;

                  return (
                    <tr key={stock.uniqueKey} className="hover:bg-gray-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{stock.symbol ?? "—"}</div>
                        <div className="text-xs text-gray-500">{stock.name ?? "—"}</div>
                      </td>
                      <td className="p-4 text-gray-300">${formatUSD(price)}</td>
                      <td className={`p-4 font-medium ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {pnl >= 0 ? "+" : ""}{formatUSD(pnl)}
                      </td>
                      <td className="p-4 text-right font-medium text-white">${formatUSD(value)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 p-4">
                    No holdings yet. Add your first asset to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;