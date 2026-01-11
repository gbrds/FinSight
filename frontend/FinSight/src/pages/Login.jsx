import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";

const BACKEND_URL = "http://localhost:3001";

const Login = ({ setSession }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailConfirmNotice, setEmailConfirmNotice] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setEmailConfirmNotice(false);
    setLoading(true);

    try {
      const endpoint = isLogin
        ? `${BACKEND_URL}/api/auth/login`
        : `${BACKEND_URL}/api/auth/signup`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Authentication failed");

      // 🔐 SIGNUP FLOW WITH EMAIL CONFIRM
      if (!isLogin && data.status === "EMAIL_CONFIRM_REQUIRED") {
        setEmailConfirmNotice(true);
        setIsLogin(true); // switch to login view
        return;
      }

      // ✅ LOGGED IN (login OR signup without email confirm)
      if (data.status !== "EMAIL_CONFIRM_REQUIRED") {
        const token = data.sessionToken;      // must exist
        const refreshToken = data.refreshToken;
        const user = data.user;

        if (!token) throw new Error("No session token returned");

        // Save to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userData", JSON.stringify(user));

        // Update session in state
        setSession({ token, user });

        navigate("/"); // redirect to dashboard
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    try {
      if (!formData.email) return;
      const res = await fetch(`${BACKEND_URL}/api/auth/resend-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (!res.ok) throw new Error("Failed to resend confirmation email");
      alert("Confirmation email resent! Check your inbox.");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-8">
        <img
          src={logo}
          alt="FinSight Logo"
          className="w-12 h-12 object-contain"
        />
        <span className="text-3xl font-bold text-white tracking-tight">
          FinSight
        </span>
      </div>

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-gray-400 text-center mb-4 text-sm">
          {isLogin
            ? "Enter your credentials to access your portfolio."
            : "Start tracking your wealth today."}
        </p>

        {/* ✅ Email confirm alert */}
        {emailConfirmNotice && (
          <div className="mb-4 text-sm text-green-400 text-center bg-green-500/10 border border-green-500/30 rounded-xl p-3">
            ✅ Account created! Please check your email and confirm your address
            before logging in.
            <button
              onClick={handleResendConfirmation}
              className="ml-2 underline text-green-200 hover:text-green-100"
            >
              Resend
            </button>
          </div>
        )}

        {/* ✅ Error message */}
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4 text-center">{errorMessage}</p>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                onChange={handleChange}
                value={formData.fullName}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              value={formData.email}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
              value={formData.password}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition-transform active:scale-95 mt-4 disabled:opacity-50"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-400 hover:text-green-400 transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;