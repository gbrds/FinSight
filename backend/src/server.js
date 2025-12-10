import express from "express";
import { spawnPythonPriceService } from "./services/pythonService.js";
import tickersRouter from "./routes/tickers.js";

const app = express();
const PORT = 3001;

// Start Python price service
spawnPythonPriceService();

// Mount ticker endpoint
app.use(tickersRouter);

app.get("/", (_, res) => {
  res.send("Backend running. Python price service should log updates here.");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});