import { supabase, supabaseAdmin } from "./supabaseClient.js";

/**
 * Creates a new user in Supabase Auth and your 'users' table
 */
export async function signupUser({ email, password, fullName }) {
  if (!email || !password || !fullName) {
    throw new Error("Email, password, and full name are required.");
  }

  // 1️⃣ Create user in Auth table (service key)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: fullName },
  });
  if (error) throw error;

  // Safely extract the auth ID
  const userId = data?.user?.id || data?.id;
  if (!userId) throw new Error("Failed to get new user's auth ID");

  // 2️⃣ Insert into 'users' table
  const { error: dbError } = await supabaseAdmin.from("users").insert([
    {
      id: userId, // must be explicit to match auth ID
      display_name: fullName,
      currency_default: "EUR",
      settings: {},
    },
  ]);
  if (dbError) throw dbError;

  return { message: "User created successfully", userId };
}

/**
 * Logs in a user via Supabase Auth (anon key)
 */
export async function loginUser({ email, password }) {
  if (!email || !password) throw new Error("Email and password are required");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  const userId = data?.user?.id;
  if (!userId) throw new Error("Failed to get user ID after login");

  // Fetch user's profile from 'users' table
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (profileError) throw profileError;

  return {
    sessionToken: data.session.access_token,
    user: profile,
  };
}