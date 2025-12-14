import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ---------------------------
// Resolve directory of this file
// ---------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env located in backend root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ---------------------------
// Public/anon client for login & normal tasks
// ---------------------------
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------------------------
// Service key client for admin tasks (user creation)
// ---------------------------
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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