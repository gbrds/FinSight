import React, { useState } from "react";
import { User, Mail, Shield, LogOut, Camera, Trash2 } from "lucide-react";

const BACKEND_URL = "http://localhost:3001";

const Settings = ({ setSession }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("userData") || "{}");

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setSession(null);
  };

  // Soft delete account
  const handleDelete = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No session token");

      const res = await fetch(`${BACKEND_URL}/api/auth/delete`, {
        method: "POST", // ✅ MUST be POST
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      // Cleanup + logout
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      setSession(null);
      setShowDeleteModal(false);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Profile & Settings</h1>

      {/* Profile Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-900">
            <span className="text-3xl font-bold text-gray-400">
              {user.display_name?.[0] || "U"}
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={24} className="text-white" />
          </div>
        </div>

        <div className="flex-1 space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">
                Full Name
              </label>
              <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl">
                <User size={18} className="text-gray-500" />
                <span className="text-white">{user.display_name}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">
                Email Address
              </label>
              <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl">
                <Mail size={18} className="text-gray-500" />
                <span className="text-white">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout + Delete */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="bg-red-500/10 border border-red-500/50 text-red-500 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white"
          >
            <LogOut size={20} /> Log Out
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-700/10 border border-red-700/50 text-red-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 hover:text-white"
          >
            <Trash2 size={20} /> Delete Account
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4">
            <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
            <p className="text-gray-400 text-sm">
              This will permanently disable your account.
            </p>

            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-700 rounded-xl disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;