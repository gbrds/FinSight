import express from "express";
import { signupUser, loginUser } from "../services/authService.js";

const router = express.Router();

// -----------------------------
// Signup with auto-login
// -----------------------------
router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // 1️⃣ Create user in Auth + Users
    await signupUser({ email, password, fullName });

    // 2️⃣ Auto-login after signup
    const loginResult = await loginUser({ email, password });

    // 3️⃣ Return session and user for frontend
    res.status(200).json({
      message: "User created and logged in successfully",
      sessionToken: loginResult.sessionToken,
      user: loginResult.user,
    });
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
    res.status(400).json({ error: err.macessage || "Login failed" });
  }
});

export default router;
