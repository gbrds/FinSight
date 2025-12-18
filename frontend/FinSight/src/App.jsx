import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import PortfolioList from "./pages/PortfolioList";
import PortfolioDetail from "./pages/PortfolioDetail";
import StockDetail from "./pages/StockDetail";
import MarketResearch from "./pages/MarketResearch";
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

// ⚡ Safe JSON parse helper
function safeJSONParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    const user = safeJSONParse(localStorage.getItem("userData"));

    if (token && user) {
      setSession({ token, user });
    }
    setLoading(false);
  }, []);

  if (loading)
    return (
      <div className="h-screen bg-black flex items-center justify-center text-green-500">
        Loading FinSight...
      </div>
    );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!session ? <Login setSession={setSession} /> : <Navigate to="/" />}
        />

        <Route
          path="/"
          element={session ? <MainLayout setSession={setSession} /> : <Navigate to="/login" />}
        >
        <Route index element={<Dashboard />} />
        <Route path="portfolios" element={<PortfolioList session={session} />} />
        <Route path="portfolios/:id" element={<PortfolioDetail />} />
        <Route path="stocks" element={<MarketResearch />} />
        <Route path="stocks/:ticker" element={<StockDetail />} />
        <Route path="finance" element={<Finance />} />
        <Route path="settings" element={<Settings setSession={setSession} />} />
      </Route>
    </Routes>
    </BrowserRouter >
  );
}

export default App;