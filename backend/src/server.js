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
import portfolioRecalcRouter from './routes/portfolioRecalc.js';

import { authMiddleware } from "./middlewares/authMiddleware.js";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Spawn background Python price service
spawnPythonPriceService();

// ----------------------
// Public / Unauthenticated Routes
// ----------------------
app.use("/api/auth", authRoutes); // login, signup, logout

// ----------------------
// Protected Routes
// ----------------------
app.use("/api/me", authMiddleware, meRouter); // current user info
app.use("/api/portfolio", authMiddleware, portfolioRoute); // portfolios
app.use("/api/portfolio", authMiddleware, portfolioPositionRoute);
app.use("/api/transactions", authMiddleware, transactionRoute);
app.use('/api/portfolio', portfolioRecalcRouter);

// ----------------------
// Other API routes (decide if auth required)
// ----------------------
app.use("/api", tickersRouter); // leave public if needed
app.use("/api", failedRouter);  // leave public if needed
app.use("/api/dashboard", authMiddleware, dashboardRouter); // optional: protect dashboard

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