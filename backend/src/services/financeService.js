import { supabase } from "./supabaseClient.js";

// Find category ID by name
async function getCategoryId(userId, categoryName) {
  if (!categoryName) return null;
  const { data } = await supabase
    .from("finance_categories")
    .select("id")
    .eq("user_id", userId)
    .ilike("name", categoryName)
    .maybeSingle();
  return data ? data.id : null;
}
//  Bulk category lookup (for faster initial imports)
async function getCategoryMap(userId) {
  const { data } = await supabase
    .from("finance_categories")
    .select("id, name")
    .eq("user_id", userId);

  if (!data) return {};
  return data.reduce((acc, cat) => {
    acc[cat.name.toLowerCase()] = cat.id;
    return acc;
  }, {});
}

// EXPORTED FUNCTIONS

export async function createBankAccount(userId, accountName, initialBalance) {
  const { data: existingAccount } = await supabase
    .from("finance_accounts")
    .select("id, name")
    .match({ user_id: userId, name: accountName })
    .maybeSingle();

  if (existingAccount) {
    return { data: existingAccount, created: false };
  }

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

export async function addTransactions(userId, accountId, transactions) {
  const categoryMap = await getCategoryMap(userId);

  const formattedTransactions = transactions.map((t) => {
    const catName = t.category ? t.category.toLowerCase() : null;
    const categoryId = catName ? categoryMap[catName] : null;

    return {
      account_id: accountId,
      amount: t.amount,
      merchant: t.merchant,
      description: t.description,
      category_id: categoryId,
      currency: t.currency || "USD",
      created_at: t.created_at,
      paid_at: t.created_at,
      source: t.source || "Manual",
    };
  });

  const { data, error } = await supabase
    .from("finance_transactions")
    .insert(formattedTransactions)
    .select();

  if (error) throw error;
  return data;
}

// Update a single transaction
export async function updateTransaction(userId, transactionId, updates) {
  // 1. Handle Category Logic
  if (updates.category) {
    const newCatId = await getCategoryId(userId, updates.category);
    if (newCatId) {
      updates.category_id = newCatId;
    }
    delete updates.category;
  }

  // 2. Perform Update
  const { data, error } = await supabase
    .from("finance_transactions")
    .update(updates)
    .eq("id", transactionId)
    .select();

  if (error) throw error;

  // 3. Manually check if a row was actually updated
  if (!data || data.length === 0) {
    throw new Error("Transaction not found or permission denied.");
  }

  return data[0];
}

// Delete a single transaction
export async function deleteTransaction(transactionId) {
  const { data, error } = await supabase
    .from("finance_transactions")
    .delete()
    .eq("id", transactionId)
    .select();

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error(
      "Delete failed: Permission denied or transaction not found."
    );
  }

  return { message: "Deleted successfully" };
}

export async function logUserFinanceData(userId) {
  try {
    const [accountsRes, categoriesRes] = await Promise.all([
      supabase.from("finance_accounts").select("*").eq("user_id", userId),
      supabase.from("finance_categories").select("*").eq("user_id", userId),
    ]);

    if (accountsRes.error) throw accountsRes.error;
    if (categoriesRes.error) throw categoriesRes.error;

    let transactions = [];
    if (accountsRes.data.length > 0) {
      const accountIds = accountsRes.data.map((a) => a.id);
      const { data: txData, error: txErr } = await supabase
        .from("finance_transactions")
        .select("*")
        .in("account_id", accountIds)
        .order("created_at", { ascending: false });

      if (txErr) throw txErr;
      transactions = txData;
    }

    return {
      accounts: accountsRes.data,
      categories: categoriesRes.data,
      transactions,
    };
  } catch (error) {
    console.error("Failed to fetch user finance data:", error);
    return null;
  }
}
