import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { authFetch } from "../services/api";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PortfolioDetail = () => {
  const { id } = useParams();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newSymbol, setNewSymbol] = useState("");
  const [addingPosition, setAddingPosition] = useState(false);

  // Modal state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [activePosition, setActivePosition] = useState(null);
  const [transactionInput, setTransactionInput] = useState({
    qty: "",
    price: "",
    type: "buy",
  });

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/portfolio/${id}`);
      if (!res.ok) throw new Error("Failed to load portfolio");
      const data = await res.json();
      setPortfolioData(data);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio(); // initial load

    const interval = setInterval(() => {
      loadPortfolio();
    }, 60000); // refresh every 60 sec

    return () => clearInterval(interval);
  }, [id]);

  const handleAddPosition = async () => {
    if (!newSymbol) return;
    setAddingPosition(true);
    try {
      const res = await authFetch(`/api/portfolio/${id}/position`, {
        method: "POST",
        body: JSON.stringify({ symbol: newSymbol }),
      });
      if (!res.ok) throw new Error("Failed to add position");
      setNewSymbol("");
      await loadPortfolio();
    } catch (err) {
      console.error("Add position error:", err);
    } finally {
      setAddingPosition(false);
    }
  };

  const openTransactionModal = (position) => {
    setActivePosition(position);
    setTransactionInput({ qty: "", price: "", type: "buy" });
    setShowTransactionModal(true);
  };

  const handleAddTransaction = async () => {
    if (!transactionInput.qty || !transactionInput.price || !activePosition) return;
    try {
      const res = await authFetch(`/api/portfolio/${id}/transaction`, {
        method: "POST",
        body: JSON.stringify({
          position_id: activePosition.id,
          type: transactionInput.type,
          quantity: Number(transactionInput.qty),
          price: Number(transactionInput.price),
        }),
      });
      if (!res.ok) throw new Error("Transaction failed");
      setShowTransactionModal(false);
      await loadPortfolio();
    } catch (err) {
      console.error("Add transaction error:", err);
    }
  };

  if (loading) return <div className="text-white">Loading portfolio...</div>;
  if (!portfolioData) return <div className="text-white">Portfolio not found</div>;

  const { portfolio, positions, totals } = portfolioData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/portfolios"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Portfolios</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">{portfolio.name}</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            Total Value
          </p>
          <h2 className="text-2xl font-bold text-white mt-1">
            ${totals.totalValue.toLocaleString()}
          </h2>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            Total Gain/Loss
          </p>
          <div
            className={cn(
              "flex items-center gap-2 mt-1 font-bold text-xl",
              totals.totalGainLoss >= 0 ? "text-green-400" : "text-red-400"
            )}
          >
            <span>
              {totals.totalGainLoss >= 0 ? "+" : ""}${totals.totalGainLoss.toLocaleString()}
            </span>
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>

      {/* Add Position */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Enter symbol..."
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none"
        />
        <button
          onClick={handleAddPosition}
          disabled={addingPosition}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          {addingPosition ? "Adding..." : "Add Position"}
        </button>
      </div>

      {/* Holdings Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {positions.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">No positions yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800/50 text-gray-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-4 min-w-[150px]">Stock</th>
                  <th className="p-4 text-right">Quantity</th>
                  <th className="p-4 text-right">Avg. Cost</th>
                  <th className="p-4 text-right">Last Price</th>
                  <th className="p-4 text-right">Unrealized P/L</th>
                  <th className="p-4 text-right">Realized P/L</th>
                  <th className="p-4 text-right">Total P/L</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {positions.map((stock) => {
                  const unrealizedPL =
                    stock.quantity && stock.price
                      ? (stock.price - stock.avg_buy_price) * stock.quantity
                      : 0;
                  const realizedPL = stock.realized_pnl ?? 0;
                  const totalPL = unrealizedPL + realizedPL;

                  return (
                    <tr key={stock.id} className="hover:bg-gray-800/40 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-xs text-white">
                            {stock.symbol[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white">{stock.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right text-gray-300">{stock.quantity}</td>
                      <td className="p-4 text-right text-gray-300">
                        ${stock.avg_buy_price?.toFixed(2) ?? "0.00"}
                      </td>
                      <td className="p-4 text-right font-medium text-white">
                        ${stock.price?.toFixed(2) ?? "0.00"}
                      </td>
                      <td
                        className={cn(
                          "p-4 text-right font-medium",
                          unrealizedPL >= 0 ? "text-green-400" : "text-red-400"
                        )}
                      >
                        ${unrealizedPL.toFixed(2)}
                      </td>
                      <td
                        className={cn(
                          "p-4 text-right font-medium",
                          realizedPL >= 0 ? "text-green-400" : "text-red-400"
                        )}
                      >
                        ${realizedPL.toFixed(2)}
                      </td>
                      <td
                        className={cn(
                          "p-4 text-right font-bold",
                          totalPL >= 0 ? "text-green-400" : "text-red-400"
                        )}
                      >
                        ${totalPL.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        {/* Always show Add Transaction button */}
                        <button
                          onClick={() => openTransactionModal(stock)}
                          className="text-gray-500 hover:text-white p-2 rounded hover:bg-gray-700 transition-colors"
                        >
                          Add Transaction
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && activePosition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-80">
            <h2 className="text-white font-bold mb-4">Add Transaction - {activePosition.symbol}</h2>
            <input
              type="number"
              placeholder="Quantity"
              value={transactionInput.qty}
              onChange={(e) =>
                setTransactionInput((prev) => ({ ...prev, qty: e.target.value }))
              }
              className="w-full mb-2 px-3 py-2 rounded bg-gray-800 text-white"
            />
            <input
              type="number"
              placeholder="Price"
              value={transactionInput.price}
              onChange={(e) =>
                setTransactionInput((prev) => ({ ...prev, price: e.target.value }))
              }
              className="w-full mb-2 px-3 py-2 rounded bg-gray-800 text-white"
            />
            <select
              value={transactionInput.type}
              onChange={(e) =>
                setTransactionInput((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full mb-4 px-3 py-2 rounded bg-gray-800 text-white"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTransactionModal(false)}
                className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTransaction}
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDetail;