// src/services/authService.js
import { supabasePublic as supabase } from "../clients/supabaseClient.js";
import {
  createUserProfile,
  getActiveUserById,
  softDeleteUserById,
} from "../repositories/userRepository.js";

/**
 * Signup user and return session
 */
export async function signupUser({ email, fullName, password }) {
  if (!email || !fullName || !password)
    throw new Error("Email, password, full name required");

  // 1️⃣ Supabase signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: fullName } },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("User creation failed");

  const user = data.user;

  // 2️⃣ Optionally create a row in Prisma users table
  try {
    await createUserProfile({
      id: user.id,
      display_name: fullName,
      currency_default: "EUR",
    });
  } catch (err) {
    console.warn("Could not create user profile row:", err.message);
    // Not blocking signup
  }

  // 3️⃣ Return session tokens
  return {
    sessionToken: data.session?.access_token || null,
    refreshToken: data.session?.refresh_token || null,
    user,
  };
}

/**
 * Login user (blocks deleted accounts)
 */
export async function loginUser({ email, password }) {
  if (!email || !password) throw new Error("Email and password required");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error("Invalid email or password");

  const userId = data.user.id;

  // Try fetching profile from Prisma
  let profile = null;
  try {
    profile = await getActiveUserById(userId);
  } catch (err) {
    console.warn("Could not fetch user profile immediately:", err.message);
  }

  return {
    sessionToken: data.session?.access_token,
    refreshToken: data.session?.refresh_token,
    user: profile || { id: userId, email: data.user.email, display_name: data.user.user_metadata?.display_name },
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
  await softDeleteUserById(userId);

  return true;
}