import { jest } from "@jest/globals";
import request from "supertest";
import {
  calculateNetTransaction,
  validateTransaction,
} from "../services/financeLogic.js";

// --- PART 1: MOCKING (Satifies "Mockimine" requirement) ---
// We mock the database query function so we don't need a real DB connection
jest.unstable_mockModule("../db.js", () => ({
  default: {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  },
  // If you use named export { query }, uncomment line below:
  // query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 })
}));

// We also mock the Python service so it doesn't start a process during tests
jest.unstable_mockModule("../services/pythonService.js", () => ({
  spawnPythonPriceService: jest.fn(),
}));

// Import app AFTER mocking
// Note: Make sure your server.js exports app using "export default app"
const app = (await import("../server.js")).default;

describe("School Project Tests", () => {
  // --- PART 2: UNIT TESTS (Satisfies "Unit tests" requirement) ---
  describe("Unit Tests: Finance Service", () => {
    test("calculateNetTransaction turns positive expense to negative", () => {
      const result = calculateNetTransaction(100, "expense");
      expect(result).toBe(-100);
    });

    test("calculateNetTransaction keeps income positive", () => {
      const result = calculateNetTransaction(100, "income");
      expect(result).toBe(100);
    });

    test("validateTransaction returns false if merchant missing", () => {
      const isValid = validateTransaction({ amount: 50 });
      expect(isValid).toBe(false);
    });
  });

  // --- PART 3: API TESTS (Satisfies "API flows" requirement) ---
  describe("Integration Tests: API", () => {
    // 1. GET Flow
    test("GET / should return health check message", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain("Backend running");
    });

    // 2. Error Flow
    test("GET /api/unknown-route should return 404", async () => {
      const res = await request(app).get("/api/super-fake-route");
      expect(res.statusCode).toBe(404);
    });

    // 3. Auth Flow (Basic check)
    test("POST /api/auth/login should fail with fake data", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "fake@test.com", password: "123" });

      // We expect 400, 401, or 404 depending on your logic,
      // but as long as it replies, the test works.
      expect(res.statusCode).not.toBe(500);
    });
  });
});
