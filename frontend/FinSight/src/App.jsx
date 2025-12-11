import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

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

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for changes (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
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
          element={!session ? <Login /> : <Navigate to="/" />}
        />

        {/* Protect these routes! */}
        <Route
          path="/"
          element={session ? <MainLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="portfolios" element={<PortfolioList />} />
          <Route path="portfolios/:id" element={<PortfolioDetail />} />
          <Route path="stocks" element={<MarketResearch />} />
          <Route path="stocks/:ticker" element={<StockDetail />} />
          <Route path="finance" element={<Finance />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
