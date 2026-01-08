// src/routes/authRoutes.js
import express from "express";
import { supabaseAdmin } from "../clients/supabaseClient.js";
import {
  signupUser,
  loginUser,
  logoutUser,
  softDeleteUser,
} from "../services/authService.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ---------------- Signup ----------------
router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const result = await signupUser({ email, password, fullName });

    if (!result.sessionToken) {
      // Email confirmation required
      return res.status(200).json({
        status: "EMAIL_CONFIRM_REQUIRED",
        user: result.user,
      });
    }

    // Auto-login flow
    res.status(200).json({
      status: "LOGGED_IN",
      user: result.user,
      sessionToken: result.sessionToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- Resend confirmation email ----------------
router.post("/resend-confirmation", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Email is required");

    const { error } = await supabaseAdmin.auth.admin.resendVerificationEmail({ email });
    if (error) throw new Error(error.message);

    res.status(200).json({ message: "Confirmation email resent" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- Login ----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });

    res.status(200).json({
      status: "LOGGED_IN",
      sessionToken: result.sessionToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch {
    res.status(401).json({ error: "Invalid email or password" });
  }
});

// ---------------- Logout ----------------
router.post("/logout", async (_req, res) => {
  try {
    await logoutUser();
    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- Soft delete account ----------------
router.post("/delete", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.split(" ")[1];
    const success = await softDeleteUser(token);

    if (!success) {
      return res.status(404).json({ message: "User already deleted or not found" });
    }

    res.status(200).json({ message: "Account deleted" });
  } catch (err) {
    console.error("[DELETE /delete] Error:", err);
    res.status(400).json({ error: err.message });
  }
});

// ---------------- Verify token ----------------
router.get("/verify", authMiddleware, (req, res) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

// ---------------- Refresh token ----------------
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new Error("Missing refresh token");

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) throw new Error(error?.message || "Failed to refresh");

    res.json({
      sessionToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

export default router;