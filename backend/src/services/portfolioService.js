import { supabase } from './supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

export async function createPortfolio({ user_id, name }) {
  try {
    const id = uuidv4();
    const { data, error } = await supabase
      .from('portfolios')
      .insert([{ id, user_id, name }])
      .select();

    if (error) throw error;
    return (data && data[0]) || null;
  } catch (err) {
    console.error('[portfolioService] createPortfolio error:', err.message);
    return null;
  }
}

export async function getUserPortfolios(user_id) {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[portfolioService] getUserPortfolios error:', err.message);
    return [];
  }
}
