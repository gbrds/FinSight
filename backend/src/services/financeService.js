import { supabase } from "./supabaseClient.js";

// --- Create Bank Account ---
export async function createBankAccount(userId, accountName, initialBalance, type = "bank", currency = "USD") {
  if (!userId) throw new Error("User ID is required");
  if (!accountName || typeof accountName !== "string") throw new Error("Account name is required");

  const cleanName = accountName.trim();
  if (!cleanName) throw new Error("Account name cannot be empty");

  const cleanBalance = Number(initialBalance) || 0;

  const { data: existingAccount, error: findError } = await supabase
    .from("finance_accounts")
    .select("id, name, balance")
    .eq("user_id", userId)
    .eq("name", cleanName)
    .maybeSingle();

  if (findError) throw findError;
  if (existingAccount) return { data: existingAccount, created: false };

  const { data, error } = await supabase
    .from("finance_accounts")
    .insert([{ user_id: userId, name: cleanName, type, balance: cleanBalance, currency }])
    .select()
    .single();

  if (error) throw error;

  return { data, created: true };
}

// --- Add transactions ---
export async function addTransactions(userId, accountId, transactions) {
  if (!accountId) throw new Error("Account ID is required");
  if (!Array.isArray(transactions) || transactions.length === 0) return [];

  const formattedTransactions = transactions.map((t) => ({
    account_id: accountId,
    amount: t.amount,
    merchant: t.merchant,
    description: t.description,
    category_id: t.category || null,
    currency: t.currency || "USD",
    created_at: t.created_at,
    paid_at: t.created_at,
    source: t.source || "Manual",
  }));

  // Insert transactions
  const { data, error } = await supabase
    .from("finance_transactions")
    .insert(formattedTransactions)
    .select();

  if (error) throw error;

  // Update account balance in JS
  const totalAmount = data.reduce((sum, tx) => sum + Number(tx.amount), 0);

  const { data: account, error: accountErr } = await supabase
    .from("finance_accounts")
    .select("balance")
    .eq("id", accountId)
    .single();
  if (accountErr) throw accountErr;

  const newBalance = Number(account.balance) + totalAmount;

  const { error: balanceError } = await supabase
    .from("finance_accounts")
    .update({ balance: newBalance })
    .eq("id", accountId);
  if (balanceError) throw balanceError;

  return data;
}

// --- Update Transaction ---
export async function updateTransaction(userId, transactionId, updates) {
  if (!transactionId) throw new Error("Transaction ID is required");
  if (!updates || Object.keys(updates).length === 0) throw new Error("No updates provided");

  if (updates.category) {
    updates.category_id = updates.category;
    delete updates.category;
  }

  // Get old transaction
  const { data: oldTxData, error: fetchError } = await supabase
    .from("finance_transactions")
    .select("*")
    .eq("id", transactionId)
    .single();
  if (fetchError) throw fetchError;
  if (!oldTxData) throw new Error("Transaction not found");

  const oldAmount = Number(oldTxData.amount);
  const newAmount = Number(updates.amount ?? oldTxData.amount);

  // Update transaction
  const { data: updatedData, error: updateError } = await supabase
    .from("finance_transactions")
    .update(updates)
    .eq("id", transactionId)
    .select();
  if (updateError) throw updateError;

  // Update account balance by difference
  const diff = newAmount - oldAmount;
  if (diff !== 0) {
    const { data: account, error: accountErr } = await supabase
      .from("finance_accounts")
      .select("balance")
      .eq("id", oldTxData.account_id)
      .single();
    if (accountErr) throw accountErr;

    const newBalance = Number(account.balance) + diff;

    const { error: balanceError } = await supabase
      .from("finance_accounts")
      .update({ balance: newBalance })
      .eq("id", oldTxData.account_id);
    if (balanceError) throw balanceError;
  }

  return updatedData[0];
}

// --- Delete Transaction ---
export async function deleteTransaction(transactionId) {
  if (!transactionId) throw new Error("Transaction ID is required");

  // Get transaction
  const { data: txData, error: fetchError } = await supabase
    .from("finance_transactions")
    .select("*")
    .eq("id", transactionId)
    .single();
  if (fetchError) throw fetchError;
  if (!txData) throw new Error("Transaction not found");

  // Subtract amount from account balance
  const { data: account, error: accountErr } = await supabase
    .from("finance_accounts")
    .select("balance")
    .eq("id", txData.account_id)
    .single();
  if (accountErr) throw accountErr;

  const newBalance = Number(account.balance) - Number(txData.amount);

  const { error: balanceError } = await supabase
    .from("finance_accounts")
    .update({ balance: newBalance })
    .eq("id", txData.account_id);
  if (balanceError) throw balanceError;

  // Delete transaction
  const { data, error: deleteError } = await supabase
    .from("finance_transactions")
    .delete()
    .eq("id", transactionId)
    .select();
  if (deleteError) throw deleteError;

  return { message: "Deleted successfully" };
}

// --- Log User Finance Data ---
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

    return { accounts: accountsRes.data, categories: categoriesRes.data, transactions };
  } catch (error) {
    console.error("Failed to fetch user finance data:", error);
    return null;
  }
}