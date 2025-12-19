// components/CreateBankAccountModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

const CreateBankAccountModal = ({ onClose, onCreate }) => {
  const [accountName, setAccountName] = useState("");
  const [type, setType] = useState("checking");
  const [currency, setCurrency] = useState("USD");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accountName.trim()) {
      alert("Account name is required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3001/api/finance/account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountName: accountName.trim(), // must match backend
          type,
          currency,
          initialBalance: Number(balance) || 0, // backend expects `initialBalance`
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to create account");

      // Pass the input values (not the returned object) to parent
      onCreate?.({ accountName: accountName.trim(), type, currency, balance: Number(balance) || 0 });

      onClose();
    } catch (err) {
      console.error("Create account failed:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Create Bank Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Name */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Account Name *</label>
            <input
              required
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Account Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Initial Balance</label>
            <input
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBankAccountModal;