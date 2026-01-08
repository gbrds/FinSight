// src/services/authService.js
import { supabaseAdmin as supabase } from "../clients/supabaseClient.js";
import {
  createUserProfile,
  getActiveUserById,
  softDeleteUserById,
} from "../repositories/userRepository.js";

/**
 * Signup user
 * - Auto-login if email confirmation is disabled
 * - Otherwise require verification
 */
export async function signupUser({ email, fullName, password }) {
  if (!email || !fullName || !password) {
    throw new Error("Email, password, full name required");
  }

  // 1️⃣ Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: fullName } },
  });

  if (error || !data.user) {
    throw new Error(error?.message || "User creation failed");
  }

  const userId = data.user.id;

  // 2️⃣ Create profile row (best-effort)
  try {
    await createUserProfile({
      id: userId,
      display_name: fullName,
      currency_default: "EUR",
    });
  } catch (err) {
    console.warn("Could not create user profile row:", err.message);
  }

  // 3️⃣ EMAIL CONFIRMATION ON? Supabase returns NO session when confirmation is required
  if (!data.session) {
    return {
      status: "EMAIL_CONFIRM_REQUIRED",
      user: {
        id: userId,
        email: data.user.email,
        display_name: fullName,
      },
    };
  }

  // 4️⃣ EMAIL CONFIRMATION OFF → auto-login
  const profile = await getActiveUserById(userId);
  return {
    status: "LOGGED_IN",
    sessionToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: profile,
  };
}

/**
 * Login user (blocks deleted accounts)
 */
export async function loginUser({ email, password }) {
  if (!email || !password) throw new Error("Email and password required");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    throw new Error("Invalid email or password");
  }

  const userId = data.user.id;

  // 🔒 Enforce soft-delete rule
  const profile = await getActiveUserById(userId);
  if (!profile) {
    await supabase.auth.signOut();
    throw new Error("Account doesn't exist");
  }

  return {
    sessionToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: profile,
  };
}

/**
 * Logout
 */
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return true;
}

/**
 * Soft delete user
 */
export async function softDeleteUser(token) {
  if (!token) throw new Error("Missing auth token");

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("Invalid or expired token");

  const userId = data.user.id;
  console.log("softDeleteUser userId:", userId);
  await softDeleteUserById(userId);

  return true;
}
