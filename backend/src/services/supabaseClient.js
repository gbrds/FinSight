// backend/src/services/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ---------------------------
// Resolve directory of this file
// ---------------------------
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Load .env located in backend root
dotenv.config({ path: path.resolve(dirname, "../../.env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// ---------------------------
// Base client (anon/service) for general tasks
// ---------------------------
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------------------------
// Login user and return RLS-respecting client
// ---------------------------
export async function loginUser(email, password) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: loginData, error: loginError } =
    await client.auth.signInWithPassword({ email, password });

  if (loginError) throw loginError;

  // Return a client that uses the session access token
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${loginData.session.access_token}`,
      },
    },
  });

  return { userClient, userId: loginData.user.id };
}
