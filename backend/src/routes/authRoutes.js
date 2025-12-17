import express from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  softDeleteUser,
} from "../services/authService.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const result = await signupUser({ email, password, fullName });
    res.status(200).json({ message: "User created", user: result.user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });

    res.status(200).json(result);
  } catch {
    // 🚨 NEVER leak auth reasons
    res.status(401).json({
      error: "Invalid email or password",
    });
  }
});

// Logout
router.post("/logout", async (_req, res) => {
  try {
    await logoutUser();
    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Soft delete account
router.post("/delete", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.split(" ")[1];
    await softDeleteUser(token);

    res.status(200).json({ message: "Account deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
