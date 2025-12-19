import express from "express";
import cors from "cors";
import { spawnPythonPriceService } from "./services/pythonService.js";
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

import { authMiddleware } from "./middlewares/authMiddleware.js";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Start Python price service
spawnPythonPriceService();

// ----------------------
// Public / Unauthenticated Routes
// ----------------------
app.use("/api/auth", authRoutes); // login, signup, logout, verify token

// ----------------------
// Protected Routes (require auth token)
// ----------------------
app.use("/api/me", authMiddleware, meRouter); // current user info
app.use("/api/portfolio", authMiddleware, portfolioRoute); // portfolios
app.use("/api/portfolio", authMiddleware, portfolioPositionRoute); // positions
app.use("/api/transactions", authMiddleware, transactionRoute); // transactions
app.use("/api/portfolio", authMiddleware, portfolioRecalcRouter); // recalc
app.use("/api/finance", authMiddleware, financeRouter); // finance data
app.use("/api/finance/categories", authMiddleware, categorieRouter); // finance categories
app.use("/api/dashboard", authMiddleware, dashboardRouter); // dashboard

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