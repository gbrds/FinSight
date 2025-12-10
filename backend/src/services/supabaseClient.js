// backend/src/services/supabaseClient.js
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

// ---------------------------
// Create Supabase client
// ---------------------------
console.log("[SUPABASE CHECK]", process.env.SUPABASE_URL); // should print actual URL

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);