import { spawn } from "child_process";

export function getLivePrices(symbols) {
  return new Promise((resolve, reject) => {
    const py = spawn("python", ["python/fetch_prices.py", symbols.join(",")]);

    let data = "";

    py.stdout.on("data", chunk => data += chunk);
    py.stderr.on("data", err => console.error("PYTHON ERROR:", err.toString()));

    py.on("close", () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject("Failed to parse Python output: " + e);
      }
    });
  });
}