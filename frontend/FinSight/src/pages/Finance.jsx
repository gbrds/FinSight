import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import SummaryCard from "../components/SummaryCard";
import TransactionRow from "../components/TransactionRow";
import CreateBankAccountModal from "../components/CreateBankAccountModal";

const BACKEND_URL = "http://localhost:3001";

// 1. Accept session as a prop
const Finance = ({ session }) => {
  // --- States ---
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAccountId, setCurrentAccountId] = useState(null);

  // --- Modals ---
  const [showTxModal, setShowTxModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // --- Form Data ---
  const [formData, setFormData] = useState({
    merchant: "",
    amount: "",
    category: "",
    description: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  });

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#8884d8");

  // Secure Fetch
  const secureFetch = async (endpoint, options = {}) => {
    const token = session?.token;

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${BACKEND_URL}${endpoint}`;

    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    return res;
  };

  const refreshFinance = () => fetchFinanceData(currentAccountId);

  // --- Fetch Finance Data ---
  const fetchFinanceData = async (accountId = null) => {
    try {
      setLoading(true);
      const res = await secureFetch("/api/finance/userdata");
      if (!res.ok) throw new Error("Failed to load finance data");

      const data = await res.json();
      setAccounts(data.accounts || []);
      setTransactions(data.transactions || []);
      setCategories(data.categories || []);

      if (!currentAccountId && data.accounts.length) {
        setCurrentAccountId(accountId || data.accounts[0].id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error loading finance data");
    } finally {
      setLoading(false);
    }
  };

  // Run on mount (and when session/token changes)
  useEffect(() => {
    if (session?.token) {
      fetchFinanceData();
    }
  }, [session]);

  // --- Transaction Handlers ---
  const openAddModal = () => {
    setEditingTx(null);
    setFormData({
      merchant: "",
      amount: "",
      category: "",
      description: "",
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    });
    setShowTxModal(true);
  };

  const openEditModal = (tx) => {
    setEditingTx(tx);
    setFormData({
      merchant: tx.merchant,
      amount: Math.abs(tx.amount),
      category: tx.category_id || "",
      description: tx.description || "",
      type: tx.amount < 0 ? "expense" : "income",
      date: new Date(tx.created_at).toISOString().split("T")[0],
    });
    setShowTxModal(true);
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmitTx = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.merchant || !formData.category) {
      return alert("Merchant, Amount, and Category are required.");
    }

    const finalAmount =
      formData.type === "expense"
        ? -Math.abs(Number(formData.amount))
        : Math.abs(Number(formData.amount));

    try {
      let response;

      if (editingTx) {
        response = await secureFetch(
          `/api/finance/transactions/${editingTx.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              merchant: formData.merchant,
              amount: finalAmount,
              category: formData.category,
              description: formData.description,
              created_at: formData.date,
            }),
          }
        );
      } else {
        if (!currentAccountId) return setShowBankModal(true);

        response = await secureFetch("/api/finance/transactions", {
          method: "POST",
          body: JSON.stringify({
            accountId: currentAccountId,
            transactions: [
              {
                merchant: formData.merchant,
                amount: finalAmount,
                category: formData.category,
                description: formData.description,
                currency: "USD",
                created_at: formData.date,
              },
            ],
          }),
        });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Operation failed");

      await fetchFinanceData(currentAccountId);
      setShowTxModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTx = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      const res = await secureFetch(`/api/finance/transactions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete transaction");

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      await refreshFinance();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Category Handlers ---
  const handleCreateCategory = async () => {
    if (!newCategoryName) return alert("Category name required");
    try {
      const res = await secureFetch("/api/finance/categories", {
        method: "POST",
        body: JSON.stringify({
          name: newCategoryName,
          color: newCategoryColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add category");

      setCategories((prev) => [...prev, data]);
      setNewCategoryName("");
      setNewCategoryColor("#8884d8");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const res = await secureFetch(`/api/finance/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete category");

      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Bank Account Handler ---
  const handleCreateBankAccount = async ({
    accountName,
    type,
    currency,
    balance,
  }) => {
    try {
      const res = await secureFetch("/api/finance/account", {
        method: "POST",
        body: JSON.stringify({
          accountName,
          type,
          currency,
          initialBalance: Number(balance) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");

      await fetchFinanceData();
      return data.data;
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  // --- Computed Values ---
  const displayedTransactions = transactions.filter(
    (t) => t.account_id === currentAccountId
  );

  const totalBalance = displayedTransactions.reduce(
    (acc, t) => acc + Number(t.amount),
    0
  );
  const totalIncome = displayedTransactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpenses = displayedTransactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const categoryTotals = categories
    .map((cat) => {
      const amount = displayedTransactions
        .filter((t) => t.category_id === cat.id && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return { category: cat.name, amount, color: cat.color || "#8884d8" };
    })
    .filter((c) => c.amount > 0);

  const formatMoney = (amount) =>
    amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  if (loading)
    return <div className="p-10 text-white">Loading Financial Data...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="space-y-6 relative">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Personal Finance</h1>
        <div className="flex items-center gap-3">
          <select
            value={currentAccountId || ""}
            onChange={async (e) => {
              const selectedId = e.target.value;
              setCurrentAccountId(selectedId);
              await fetchFinanceData(selectedId);
            }}
            className="bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (${Number(acc.balance).toFixed(2)})
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowBankModal(true)}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={16} /> Add Account
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          icon={<Wallet size={20} />}
          title="Total Balance"
          value={`$${formatMoney(totalBalance)}`}
          color="bg-blue-500/10 text-blue-500"
        />
        <SummaryCard
          icon={<TrendingUp size={20} />}
          title="Total Income"
          value={`$${formatMoney(totalIncome)}`}
          color="bg-green-500/10 text-green-500"
        />
        <SummaryCard
          icon={<TrendingDown size={20} />}
          title="Expenses"
          value={`$${formatMoney(totalExpenses)}`}
          color="bg-red-500/10 text-red-500"
        />
      </div>

      {/* Chart + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:col-span-1">
          <h2 className="font-bold text-white mb-6">Spending by Category</h2>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryTotals}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {categoryTotals.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${formatMoney(value)}`}
                  contentStyle={{ backgroundColor: "#111827", border: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-xs text-gray-500">Total Expenses</div>
              <div className="font-bold text-white">
                ${formatMoney(totalExpenses)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-white">Recent Transactions</h2>
            <div className="flex gap-3">
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <Plus size={16} /> Add
              </button>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Categories
              </button>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            {displayedTransactions.slice(0, 5).map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                categories={categories}
                openEditModal={openEditModal}
                handleDelete={handleDeleteTx}
                formatMoney={formatMoney}
              />
            ))}
            {displayedTransactions.length === 0 && (
              <p className="text-gray-500 text-center">No transactions yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingTx ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <button
                onClick={() => setShowTxModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitTx} className="space-y-4">
              <input
                type="text"
                name="merchant"
                placeholder="Merchant"
                value={formData.merchant}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
                required
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
                required
              />
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
              />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all"
              >
                {editingTx ? "Update Transaction" : "Save Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Manage Categories
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    ></div>
                    <span className="text-gray-300">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <input
                type="text"
                placeholder="New Category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
              />
              <input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="w-full h-10 p-0 rounded-lg border-0"
              />
              <button
                onClick={handleCreateCategory}
                className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold transition-all"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {showBankModal && (
        <CreateBankAccountModal
          onClose={() => setShowBankModal(false)}
          onCreate={handleCreateBankAccount}
        />
      )}
    </div>
  );
};

export default Finance;
