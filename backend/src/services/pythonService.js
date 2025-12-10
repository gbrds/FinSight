import { spawn } from "child_process";
import { saveLivePrices } from "./livePriceService.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function spawnPythonPriceService() {
  const pythonPath = path.resolve(__dirname, "../../py-service/venv/Scripts/python.exe");
  const scriptPath = path.resolve(__dirname, "../../py-service/stock_service.py");

  const py = spawn(pythonPath, [scriptPath], { shell: true });

  console.log("Starting Python price service...");

  py.stdout.on("data", data => {
    const lines = data.toString().split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("{")) {
        try {
          const msg = JSON.parse(trimmed);
          if (msg.prices) saveLivePrices(msg.prices);
          if (msg.manual_required) {
            const failed = Object.keys(msg.manual_required);
            if (failed.length) console.log("[MANUAL TICKERS]:", failed);
          }
        } catch (err) {
          console.error("[PYTHON JSON ERROR]:", err.message);
        }
      } else {
        console.log("[PYTHON OUT]:", trimmed);
      }
    }
  });

  py.stderr.on("data", err => console.error("[PYTHON ERR]:", err.toString()));
  py.on("close", code => console.log(`[PYTHON EXIT] code ${code}`));

  return py;
}