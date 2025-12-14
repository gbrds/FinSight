import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showVerificationMsg, setShowVerificationMsg] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- SIGN IN LOGIC ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        alert("Login Successful!");
        navigate("/"); // Redirect to Dashboard
      } else {
        // --- SIGN UP LOGIC ---
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { display_name: formData.fullName }, // Saves name to user metadata
          },
        });

        if (error) throw error;
        setShowVerificationMsg(true);
        setLoading(false);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center font-bold text-black text-xl">
          F
        </div>
        <span className="text-3xl font-bold text-white tracking-tight">
          FinSight
        </span>
      </div>

      {/* --- NEW VERIFICATION CARD --- */}
      {showVerificationMsg ? (
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Check your inbox
          </h2>
          <p className="text-gray-400 mb-6 leading-relaxed">
            We've sent a verification link to{" "}
            <span className="text-white font-medium">{formData.email}</span>.
          </p>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8 flex items-start gap-3 text-left">
            <AlertCircle
              className="text-yellow-500 shrink-0 mt-0.5"
              size={20}
            />
            <p className="text-yellow-200/80 text-sm">
              Can't find it? Check your <strong>Spam</strong> or{" "}
              <strong>Junk</strong> folder. The link expires in 24 hours.
            </p>
          </div>

          <button
            onClick={() => {
              setShowVerificationMsg(false);
              setIsLogin(true); // Switch to Login mode
            }}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        /* --- ORIGINAL LOGIN/SIGNUP FORM --- */
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-400 text-center mb-8 text-sm">
            {isLogin
              ? "Enter your credentials to access your portfolio."
              : "Start tracking your wealth today."}
          </p>

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
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="John Doe"
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
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                placeholder="name@example.com"
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
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition-transform active:scale-95 mt-4 disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
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
      )}
    </div>
  );
};

export default Login;
