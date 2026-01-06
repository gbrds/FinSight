// components/TransactionModal.jsx
import React from "react";
import { X } from "lucide-react";

const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  categories,
  editingTx,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {editingTx ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Merchant / Name *</label>
            <input
              required
              name="merchant"
              type="text"
              value={formData.merchant}
              onChange={onChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Amount *</label>
              <input
                required
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={onChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={onChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Category *</label>
            <select
              required
              name="category"
              value={formData.category}
              onChange={onChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
            >
              <option value="" disabled>Select a Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option> // use id
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
              onChange={onChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Description (Optional)</label>
            <input
              name="description"
              type="text"
              value={formData.description}
              onChange={onChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
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
  );
};

export default TransactionModal;