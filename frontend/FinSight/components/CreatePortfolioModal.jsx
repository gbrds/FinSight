import React, { useState } from "react";
import { X } from "lucide-react";

const CreatePortfolioModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name);
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            Create New Portfolio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Portfolio Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Long Term Investments"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Create Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePortfolioModal;