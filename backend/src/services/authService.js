import { supabase } from "./supabaseClient.js";

/**
 * Signup user and create profile row
 */
export async function signupUser({ email, fullName, password }) {
  if (!email || !fullName || !password) {
    throw new Error("Email, password, and full name are required.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: fullName },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("User creation failed");

  const user = data.user;

  const { error: profileError } = await supabase
    .from("users")
    .insert({
      id: user.id,
      display_name: fullName,
      currency_default: "EUR",
      settings: {},
      deleted: false,
    });

  if (profileError) throw new Error(profileError.message);

  return { user };
}

/**
 * Login user (blocks deleted accounts)
 */
export async function loginUser({ email, password }) {
  if (!email || !password) throw new Error("Email and password are required");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Signin failed");

  const userId = data.user.id;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .eq("deleted", false)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile) throw new Error("Account has been deleted");

  return {
    sessionToken: data.session.access_token,
    user: profile,
  };
}

/**
 * Logout (frontend-driven, kept for symmetry)
 */
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return true;
}

/**
 * Soft delete user profile
 */
export async function softDeleteUser(token) {
  if (!token) throw new Error("Missing auth token");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    throw new Error("Invalid or expired token");
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ deleted: true })
    .eq("id", user.id);

  if (updateError) throw updateError;

  return true;
}