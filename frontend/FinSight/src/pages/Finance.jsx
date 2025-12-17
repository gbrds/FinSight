import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  CreditCard,
  X,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

const BACKEND_URL = "http://localhost:3001";

const Finance = () => {
  // States
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Modals
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [editingTx, setEditingTx] = useState(null);
  const [formData, setFormData] = useState({
    merchant: "",
    amount: "",
    category: "",
    description: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  });

  // Fetch User Finance Data on Load
  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("userData");
        if (!storedUser) {
          setError("No user found. Please log in.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        const uId = user.id || user._id;
        setUserId(uId);

        const response = await fetch(
          `${BACKEND_URL}/api/finance/userdata/${uId}`
        );
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const userData = await response.json();

        setTransactions(userData.transactions || []);
        setAccounts(userData.accounts || []);
        setCategories(userData.categories || []);
      } catch (err) {
        console.error("Error loading finance data:", err);
        setError("Could not load financial history.");
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);
  // Open Modal for New Transaction
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
    setShowModal(true);
  };

  // Open Modal Popup for Editing Transaction
  const openEditModal = (tx) => {
    const category = categories.find((c) => c.id === tx.category_id);
    setEditingTx(tx);
    setFormData({
      merchant: tx.merchant,
      amount: Math.abs(tx.amount),
      category: category ? category.name : "",
      description: tx.description || "",
      type: tx.amount < 0 ? "expense" : "income",
      date: new Date(tx.created_at).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit both CREATE and UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Basic Validation
    if (!formData.amount || !formData.merchant || !formData.category) {
      alert("Please fill in required fields (Merchant, Amount, Category).");
      return;
    }

    // 2. Calculate correct +/- amount
    const finalAmount =
      formData.type === "expense"
        ? -Math.abs(Number(formData.amount))
        : Math.abs(Number(formData.amount));

    try {
      if (editingTx) {
        // UPDATE (EDIT) LOGIC
        const response = await fetch(
          `${BACKEND_URL}/api/finance/transactions/${editingTx.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: userId,
              merchant: formData.merchant,
              amount: finalAmount,
              category: formData.category,
              description: formData.description,
              created_at: formData.date,
            }),
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to update");
        }
      } else {
        //  CREATE (ADD) LOGIC
        if (!accounts.length) return alert("No account found");

        const newTx = {
          userId: userId,
          accountId: accounts[0].id,
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
        };

        const response = await fetch(
          `${BACKEND_URL}/api/finance/transactions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTx),
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to create");
        }
      }

      window.location.reload();
    } catch (err) {
      console.error("Submission Error:", err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/finance/transactions/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete");
      }
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete Error:", err);
      alert(`Error deleting: ${err.message}`);
    }
  };

  // CALCULATIONS
  const totalBalance = transactions.reduce(
    (acc, t) => acc + Number(t.amount),
    0
  );
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const formatMoney = (amount) =>
    amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const categoryTotals = categories
    .map((cat) => {
      const amount = transactions
        .filter((t) => t.category_id === cat.id && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return { category: cat.name, amount, color: cat.color || "#8884d8" };
    })
    .filter((c) => c.amount > 0);

  // TRANSACTION ROW COMPONENT
  const TransactionRow = ({ tx }) => {
    const category = categories.find((c) => c.id === tx.category_id);
    return (
      <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors group">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
            <CreditCard size={18} />
          </div>
          <div>
            <div className="font-bold text-white">{tx.merchant}</div>
            <div className="text-xs text-gray-500">
              {tx.description && tx.description !== "Manual Entry" ? (
                <span className="text-gray-400 italic mr-2">
                  {tx.description} •{" "}
                </span>
              ) : null}
              {new Date(tx.created_at).toLocaleDateString()} •{" "}
              {category?.name || "Uncategorized"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`font-bold ${
              tx.amount > 0 ? "text-green-400" : "text-white"
            }`}
          >
            {tx.amount > 0 ? "+" : ""}${formatMoney(Math.abs(tx.amount))}
          </div>

          {/* Edit/Delete buttons */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => openEditModal(tx)}
              className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-blue-400 transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => handleDelete(tx.id)}
              className="p-1.5 bg-gray-700 hover:bg-red-900/50 rounded text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading)
    return <div className="p-10 text-white">Loading Financial Data...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6 relative">
      <h1 className="text-2xl font-bold text-white">Personal Finance</h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Wallet size={20} />
            </div>
            <span className="text-gray-400 text-sm">Total Balance</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${formatMoney(totalBalance)}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <TrendingUp size={20} />
            </div>
            <span className="text-gray-400 text-sm">Total Income</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${formatMoney(totalIncome)}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <TrendingDown size={20} />
            </div>
            <span className="text-gray-400 text-sm">Expenses</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${formatMoney(totalExpenses)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART */}
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
          <div className="space-y-3 mt-4">
            {categoryTotals.map((item) => (
              <div key={item.category} className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-300">{item.category}</span>
                </div>
                <span className="font-medium text-white">
                  ${formatMoney(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TRANSACTIONS LIST */}
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
                onClick={() => setShowAllTransactions(true)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                View All
              </button>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            {transactions.slice(0, 5).map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
            {transactions.length === 0 && (
              <p className="text-gray-500 text-center">No transactions yet.</p>
            )}
          </div>
        </div>
      </div>

      {/*  SHARED POPUP ADD / EDIT*/}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingTx ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Merchant / Name *
                </label>
                <input
                  required
                  name="merchant"
                  type="text"
                  value={formData.merchant}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Amount *
                  </label>
                  <input
                    required
                    name="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
                    onChange={handleInputChange}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Category *
                </label>
                <select
                  required
                  name="category"
                  value={formData.category}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    Select a Category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Date</label>
                <input
                  required
                  name="date"
                  type="date"
                  value={formData.date}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Description (Optional)
                </label>
                <input
                  name="description"
                  type="text"
                  value={formData.description}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                  onChange={handleInputChange}
                />
              </div>

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

      {/* VIEW ALL POPUP */}
      {showAllTransactions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">All Transactions</h2>
              <button
                onClick={() => setShowAllTransactions(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="text-center text-gray-500">
                  No transactions found
                </div>
              ) : (
                transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
