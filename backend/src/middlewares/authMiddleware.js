import { supabase } from "../services/supabaseClient.js";

/**
 * Auth middleware with auto-refresh
 * Sets req.user and req.token for downstream handlers
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Missing Authorization header" });

    let token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ error: "Invalid Authorization header" });

    // Try getting user with the access token
    let { data, error } = await supabase.auth.getUser(token);

    // If token expired, attempt refresh using refresh token
    if (error || !data.user) {
      const refreshToken = req.headers["x-refresh-token"];
      if (!refreshToken) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      const refreshRes = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      if (refreshRes.error || !refreshRes.data.session) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      // Update token to new access token
      token = refreshRes.data.session.access_token;
      data = { user: refreshRes.data.session.user };

      // Optionally send new token back to frontend in header
      res.setHeader("x-access-token", token);
    }

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
