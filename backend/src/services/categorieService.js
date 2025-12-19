// services/categorieService.js
import { getUserSupabase } from "./supabaseUserClient.js";

/**
 * Fetch all categories for a given user
 */
export async function getCategories(userId, token) {
  const supabase = getUserSupabase(token);
  const { data, error } = await supabase
    .from("finance_categories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Create a new category
 */
export async function createCategory(userId, token, name, color) {
  const supabase = getUserSupabase(token);

  const { data, error } = await supabase
    .from("finance_categories")
    .insert([
      {
        user_id: userId,
        name,
        color: color || "#8884d8",
      },
    ])
    .select() // <-- important to return the inserted row
    .single(); // <-- ensures you get a single object instead of array

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete a category by ID
 */
export async function deleteCategory(userId, token, categoryId) {
  const supabase = getUserSupabase(token);
  const { data, error } = await supabase
    .from("finance_categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return data;
}