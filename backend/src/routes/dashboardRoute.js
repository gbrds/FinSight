import express from "express";
import * as dashboardService from "../services/dashboardService.js";

const router = express.Router();

// GET /api/dashboard
router.get("/", async (req, res) => {
  try {
    const dashboardData = await dashboardService.getUserDashboard(req.user.id);
    res.json(dashboardData);
  } catch (err) {
    console.error("[dashboardRoute] GET / error:", err.message);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

export default router;