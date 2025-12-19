// services/api.js
const BACKEND_URL = "http://localhost:3001";

export const authFetch = async (url, options = {}) => {
  try {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    // Merge default headers with extraHeaders and user-provided headers
    const headers = {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.extraHeaders || {}),
      ...(options.headers || {}),
    };

    const res = await fetch(url.startsWith("http") ? url : BACKEND_URL + url, {
      ...options,
      headers,
    });

    // Update access token if backend returns a new one
    const newToken = res.headers.get("x-access-token");
    if (newToken) localStorage.setItem("token", newToken);

    return res;
  } catch (err) {
    console.error("authFetch error:", err);
    throw err;
  }
};