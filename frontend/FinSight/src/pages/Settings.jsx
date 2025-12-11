import React from "react";
import { User, Mail, Shield, LogOut, Camera } from "lucide-react";

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Profile & Settings</h1>

      {/* 1. Profile Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-900">
            <span className="text-3xl font-bold text-gray-400">JD</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={24} className="text-white" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">
                Full Name
              </label>
              <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <User size={18} className="text-gray-500" />
                <span className="text-white font-medium">John Doe</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">
                Email Address
              </label>
              <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <Mail size={18} className="text-gray-500" />
                <span className="text-white font-medium">john@example.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Preferences & Danger Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* App Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Shield size={20} className="text-green-500" />
            Security & Preferences
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl">
              <span className="text-gray-300">Dark Mode</span>
              <div className="w-10 h-6 bg-green-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl">
              <span className="text-gray-300">Currency</span>
              <select className="bg-transparent text-white font-bold outline-none">
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logout Zone */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white mb-2">Session Management</h3>
            <p className="text-sm text-gray-400">
              Log out of your account on this device.
            </p>
          </div>

          <button className="w-full mt-6 bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
