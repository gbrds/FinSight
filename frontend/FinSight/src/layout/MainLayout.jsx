import React, { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PieChart,
  TrendingUp,
  Wallet,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  User,
  LogOut,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
  <Link
    to={path}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
      active
        ? "bg-green-500/10 text-green-400 border-r-2 border-green-500"
        : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
    )}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

const MainLayout = ({ setSession }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("userData");

      // Optional: call backend logout endpoint
      await fetch("http://localhost:3001/api/auth/logout", {
        method: "POST",
      });

      // Clear session state
      setSession(null);

      // Navigate to login page
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-100 font-sans overflow-hidden">
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed md:relative z-50 h-full w-64 bg-[#0a0a0a] border-r border-gray-800 flex flex-col p-4 transition-transform duration-300 ease-in-out",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-black">
              F
            </div>
            <span className="text-xl font-bold tracking-tight">FinSight</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            path="/"
            active={location.pathname === "/"}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <SidebarItem
            icon={PieChart}
            label="My Portfolios"
            path="/portfolios"
            active={location.pathname.startsWith("/portfolios")}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <SidebarItem
            icon={TrendingUp}
            label="Market Research"
            path="/stocks"
            active={location.pathname.startsWith("/stocks")}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <SidebarItem
            icon={Wallet}
            label="Personal Finance"
            path="/finance"
            active={location.pathname.startsWith("/finance")}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </nav>

        <div className="pt-4 border-t border-gray-800">
          <SidebarItem
            icon={Settings}
            label="Settings"
            path="/settings"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col w-full min-w-0">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-4 md:px-8 bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-gray-400"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="relative hidden sm:block w-64 md:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></span>
            </button>

            {/* PROFILE DROPDOWN START */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs hover:bg-green-500 hover:text-black transition-colors"
              >
                US
              </button>

              {/* The Menu Itself */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-xl py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-800">
                    <p className="text-sm font-bold text-white">John Doe</p>
                    <p className="text-xs text-gray-500 truncate">user@example.com</p>
                  </div>

                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <User size={16} />
                    Profile & Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0a0a0a]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;