import { supabase } from "../services/supabaseClient.js";

/**
 * Checks Bearer token from headers, validates session, and sets req.user
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Missing Authorization header" });

    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ error: "Invalid Authorization header" });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user)
      return res.status(401).json({ error: "Invalid or expired token" });

    req.user = {
      id: data.user.id,
      token,
    };
    next();
  } catch (err) {
    console.error("[authMiddleware] error:", err.message);
    res.status(401).json({ error: "Unauthorized" });
  }
}
