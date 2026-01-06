import express from "express";
import { supabasePublic as supabase } from "../clients/supabaseClient.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// now token validation is in middleware
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .maybeSingle();

    if (profileError) return res.status(500).json({ error: profileError.message });

    res.json({ user: profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;