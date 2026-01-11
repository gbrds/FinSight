import * as financeRepository from "../repositories/financeRepository.js";

// --- Create Bank Account ---
export async function createBankAccount(
  userId,
  accountName,
  initialBalance,
  type = "bank",
  currency = "USD"
) {
  if (!userId) throw new Error("User ID is required");
  if (!accountName || typeof accountName !== "string")
    throw new Error("Account name is required");

  const cleanName = accountName.trim();
  if (!cleanName) throw new Error("Account name cannot be empty");

  const existingAccounts = await financeRepository.getAccountsByUserId(userId);
  const match = existingAccounts.find((acc) => acc.name === cleanName);

  if (match) {
    return { data: match, created: false };
  }

  const newAccount = await financeRepository.createAccount(
    userId,
    cleanName,
    type,
    initialBalance,
    currency
  );
  return { data: newAccount, created: true };
}

// --- Add Transactions ---
export async function addTransactions(userId, accountId, transactions) {
  if (!accountId) throw new Error("Account ID is required");
  if (!Array.isArray(transactions) || transactions.length === 0) return [];

  const results = [];

  for (const t of transactions) {
    const txData = {
      amount: t.amount,
      merchant: t.merchant,
      description: t.description,
      category_id: t.category,
      currency: t.currency,
      source: t.source,
      date: t.created_at || t.date,
    };

    const newTx = await financeRepository.createBankingTransaction(
      userId,
      accountId,
      txData
    );
    results.push(newTx);
  }

  return results;
}

// --- Update Transaction ---
export async function updateTransaction(userId, transactionId, updates) {
  if (!transactionId) throw new Error("Transaction ID is required");
  if (!updates || Object.keys(updates).length === 0)
    throw new Error("No updates provided");

  if (updates.category) {
    updates.category_id = updates.category;
    delete updates.category;
  }

  return await financeRepository.updateBankingTransaction(
    transactionId,
    updates
  );
}

// --- Delete Transaction ---
export async function deleteTransaction(transactionId) {
  if (!transactionId) throw new Error("Transaction ID is required");

  await financeRepository.deleteBankingTransaction(transactionId);

  return { message: "Deleted successfully" };
}

// --- Log User Finance Data ---
export async function logUserFinanceData(userId) {
  try {
    const [accounts, categories, transactions] = await Promise.all([
      financeRepository.getAccountsByUserId(userId),
      financeRepository.getCategoriesByUserId(userId),
      financeRepository.getBankingTransactions(userId),
    ]);

    return { accounts, categories, transactions };
  } catch (error) {
    console.error("Failed to fetch user finance data:", error);
    // Return empty arrays to prevent frontend crashes
    return { accounts: [], categories: [], transactions: [] };
  }
}
