import { supabase } from './supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new portfolio for a user
 * @param {Object} param0
 * @param {string} param0.user_id - auth.uid()
 * @param {string} param0.name - portfolio name
 * @returns inserted portfolio
 */
export async function createPortfolio({ user_id, name }) {
  try {
    const id = uuidv4();
    const { data, error } = await supabase
      .from('portfolios')
      .insert([{ id, user_id, name }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[portfolioService] createPortfolio error:', err);
    throw err;
  }
}

/**
 * Get portfolios of a user
 * @param {string} user_id
 * @returns array of portfolios
 */
export async function getUserPortfolios(user_id) {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[portfolioService] getUserPortfolios error:', err);
    throw err;
  }
}