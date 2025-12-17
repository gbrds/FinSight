import express from "express";
import cors from "cors";
import { spawnPythonPriceService } from "./services/pythonService.js";
import tickersRouter from "./routes/tickers.js";
import authRoutes from "./routes/authRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import { logUserFinanceData } from "./services/financeService.js";

const app = express();
const PORT = 3001;

// Enable CORS for frontend
app.use(cors({ origin: "http://localhost:5173" }));

// Parse JSON bodies
app.use(express.json());

// Start Python price service
spawnPythonPriceService();

// Mount routers
app.use("/tickers", tickersRouter);
app.use("/api/auth", authRoutes);
app.use("/api/finance", financeRoutes);

// Health check
app.get("/", (_, res) => {
  res.send("Backend running. Python price service should log updates here.");
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // 🔍 TEMP DEBUG TEST
  await logUserFinanceData("f85b3b68-8991-48b2-84fd-5dbcca3ab267");
});
