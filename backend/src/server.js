// server.js
import express from "express";
import cors from "cors";
import { spawnPythonPriceService } from "./services/pythonService.js";
import { recalcPortfolioMetrics } from "./services/portfolioMetricsAtomicService.js";

import tickersRouter from "./routes/tickers.js";
import authRoutes from "./routes/authRoutes.js";
import failedRouter from "./routes/failed.js";
import dashboardRouter from "./routes/dashboardRoute.js";
import meRouter from "./routes/meRoute.js";
import portfolioRoute from "./routes/portfolioRoute.js";
import portfolioPositionRoute from "./routes/portfolioPositionRoute.js";
import transactionRoute from "./routes/transactionRoute.js";
import portfolioRecalcRouter from "./routes/portfolioRecalc.js";
import financeRouter from "./routes/financeRoutes.js";
import categorieRouter from "./routes/categorieRoute.js";
import portfolioDetailRoute from "./routes/portfolioDetailRoute.js";
import portfolioSummaryRoute from "./routes/portfolioSummaryRoute.js";

import { authMiddleware } from "./middlewares/authMiddleware.js";
import { supabaseAdmin as supabase } from "./clients/supabaseClient.js";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ----------------------
// Start Python price service
// ----------------------
spawnPythonPriceService();

// ----------------------
// Recalculate all portfolios at startup (ADMIN)
// ----------------------
async function recalcAllPortfolios() {
  try {
    const { data: portfolios, error } = await supabaseAdmin
      .from("portfolios")
      .select("id");

    if (error) throw error;
    if (!portfolios?.length) return;

    console.log(
      `[INIT] Recalculating metrics for ${portfolios.length} portfolios...`
    );
    for (const p of portfolios) {
      await recalcPortfolioMetrics(p.id);
      console.log(`[INIT] Metrics recalculated for portfolio ${p.id}`);
    }
    console.log("[INIT] All portfolio metrics recalculated.");
  } catch (err) {
    console.error("[INIT] Failed to recalc portfolios:", err.message);
  }
}

recalcAllPortfolios();

// ----------------------
// Public / Unauthenticated Routes
// ----------------------
app.use("/api/auth", authRoutes);

// ----------------------
// Protected Routes (require auth token)
// ----------------------
app.use("/api/me", authMiddleware, meRouter);
app.use("/api/portfolio", authMiddleware, portfolioRoute);
app.use("/api/portfolio", authMiddleware, portfolioPositionRoute);
app.use("/api/transactions", authMiddleware, transactionRoute);
app.use("/api/portfolio", authMiddleware, portfolioRecalcRouter);
app.use("/api/finance", authMiddleware, financeRouter);
app.use("/api/finance/categories", authMiddleware, categorieRouter);
app.use("/api/dashboard", authMiddleware, dashboardRouter);
app.use("/api/portfolio", authMiddleware, portfolioDetailRoute);

// ----------------------
// NEW: Portfolio summary route
// ----------------------
app.use("/api/portfolio-summary", authMiddleware, portfolioSummaryRoute);

// ----------------------
// Other API routes (public if needed)
// ----------------------
app.use("/api", tickersRouter);
app.use("/api", failedRouter);

// ----------------------
// Health / root
// ----------------------
app.get("/", (_, res) => {
  res.send("Backend running. Python price service should log updates here.");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
