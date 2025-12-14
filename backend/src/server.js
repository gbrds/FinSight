import express from "express";
import cors from "cors";
import { spawnPythonPriceService } from "./services/pythonService.js";
import tickersRouter from "./routes/tickers.js";
import authRoutes from "./routes/authRoutes.js";

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

// Health check
app.get("/", (_, res) => {
  res.send("Backend running. Python price service should log updates here.");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});