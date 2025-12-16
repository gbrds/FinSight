import { supabase } from "./supabaseClient.js";

// Helper to find category ID (Internal use only)
async function getCategoryId(categoryName) {
  if (!categoryName) return null;
  const { data } = await supabase
    .from("finance_categories")
    .select("id")
    .ilike("name", categoryName)
    .maybeSingle();
  return data ? data.id : null;
}

/**
 * Creates a "Bank" account for a specific User ID
 */
export async function createBankAccount(userId, accountName, initialBalance) {
  // 1. Check if it already exists
  const { data: existingAccount } = await supabase
    .from("finance_accounts")
    .select("id, name")
    .eq("user_id", userId)
    .eq("name", accountName)
    .maybeSingle();

  if (existingAccount) {
    return { data: existingAccount, created: false };
  }

  // 2. Create it
  const { data, error } = await supabase
    .from("finance_accounts")
    .insert([
      {
        user_id: userId,
        name: accountName,
        type: "Bank",
        balance: initialBalance,
        currency: "USD",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return { data, created: true };
}

/**
 * Adds transactions for a specific User & Account
 */
export async function addTransactions(userId, accountId, transactions) {
  const formattedTransactions = [];

  for (const t of transactions) {
    let categoryId = await getCategoryId(t.category);

    formattedTransactions.push({
      account_id: accountId,
      amount: t.amount,
      merchant: t.merchant,
      description: t.description,
      category_id: categoryId,
      currency: t.currency || "USD",
      created_at: t.created_at || new Date(),
      paid_at: t.created_at || new Date(),
      source: t.source || "Manual",
    });
  }

  const { data, error } = await supabase
    .from("finance_transactions")
    .insert(formattedTransactions)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Fetches and logs all finance-related data for a user
 */
export async function logUserFinanceData(userId) {
  try {
    // 1. Get Accounts and Categories (These have user_id)
    const [
      { data: accounts, error: accErr },
      { data: categories, error: catErr },
    ] = await Promise.all([
      supabase.from("finance_accounts").select("*").eq("user_id", userId),
      supabase.from("finance_categories").select("*").eq("user_id", userId),
    ]);

    if (accErr || catErr) throw accErr || catErr;

    // 2. Get Transactions (Must query by account_id, NOT user_id)
    let transactions = [];
    if (accounts && accounts.length > 0) {
      const accountIds = accounts.map((a) => a.id);
      const { data: txData, error: txErr } = await supabase
        .from("finance_transactions")
        .select("*")
        .in("account_id", accountIds); // Query by Account IDs

      if (txErr) throw txErr;
      transactions = txData;
    }

    console.group("📊 User Finance Data");
    console.log("🏦 Accounts:", accounts);
    console.log("📁 Categories:", categories);
    console.log("💸 Transactions:", transactions);
    console.groupEnd();

    return { accounts, categories, transactions };
  } catch (error) {
    console.error("❌ Failed to fetch user finance data:", error);
    return null;
  }
}
