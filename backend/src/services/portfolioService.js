import { loginUser } from "./supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

/** 
 
Create a new portfolio for a user
@param {string} email - User email for login
@param {string} password - User password
@param {string} name - Portfolio name
@returns {object} created portfolio*/
export async function createPortfolio(email, password, name) {
  try {
    const { userClient, userId } = await loginUser(email, password);

    const { data, error } = await userClient
      .from("portfolios")
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          name,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("[createPortfolio] DB error:", err);
    throw err;
  }
}

/** 
 
Fetch portfolios for a user
@param {string} email - User email for login
@param {string} password - User password
@returns {array} portfolios*/
export async function getUserPortfolios(email, password) {
  try {
    const { userClient } = await loginUser(email, password);

    const { data, error } = await userClient
      .from("portfolios")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("[getUserPortfolios] DB error:", err);
    throw err;
  }
}
