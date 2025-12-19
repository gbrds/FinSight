// components/TransactionRow.jsx
import React from "react";
import { CreditCard, Pencil, Trash2 } from "lucide-react";

const TransactionRow = ({ tx, categories, openEditModal, handleDelete, formatMoney }) => {
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
            {tx.description && tx.description !== "Manual Entry" && (
              <span className="text-gray-400 italic mr-2">{tx.description} • </span>
            )}
            {new Date(tx.created_at).toLocaleDateString()} • {category?.name || "Uncategorized"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className={`font-bold ${tx.amount > 0 ? "text-green-400" : "text-white"}`}>
          {tx.amount > 0 ? "+" : ""}${formatMoney(Math.abs(tx.amount))}
        </div>
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

export default TransactionRow;