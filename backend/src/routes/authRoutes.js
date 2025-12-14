import express from "express";
import { signupUser, loginUser } from "../services/authService.js";

const router = express.Router();

// -----------------------------
// Signup
// -----------------------------
router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    const result = await signupUser({ email, password, fullName });
    res.status(200).json({ message: result.message });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Signup failed" });
  }
});

// -----------------------------
// Login
// -----------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const loginResult = await loginUser({ email, password });

    res.status(200).json({
      sessionToken: loginResult.sessionToken,
      user: loginResult.user,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Login failed" });
  }
});

export default router;