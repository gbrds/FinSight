import { loginUser } from "./supabaseClient.js";

async function getCategoryId(userClient, categoryName) {
  if (!categoryName) return null;

  const { data } = await userClient
    .from("finance_categories")
    .select("id")
    .ilike("name", categoryName)
    .maybeSingle();

  return data ? data.id : null;
}

// Create Bank Account
export async function createBankAccount(
  email,
  password,
  accountName,
  initialBalance
) {
  try {
    const { userClient, userId } = await loginUser(email, password);

    const { data: existingAccount } = await userClient
      .from("finance_accounts")
      .select("id, name")
      .eq("user_id", userId)
      .eq("name", accountName)
      .maybeSingle();

    if (existingAccount) {
      return { data: existingAccount, created: false, userClient };
    }

    const { data, error } = await userClient
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

    return { data, created: true, userClient };
  } catch (err) {
    console.error("[createBankAccount] Error:", err.message);
    throw err;
  }
}

//  Add Transactions
export async function addTransactions(
  email,
  password,
  accountId,
  transactions
) {
  try {
    const { userClient } = await loginUser(email, password);
    const formattedTransactions = [];

    for (const t of transactions) {
      let categoryId = await getCategoryId(userClient, t.category);

      if (!categoryId) {
        console.warn(`⚠️ Hoiatus: Kategooriat '${t.category}' ei leitud!`);
      }

      formattedTransactions.push({
        account_id: accountId,
        amount: t.amount,
        merchant: t.merchant,
        description: t.description,
        category_id: categoryId,
        currency: t.currency || "USD",
        created_at: t.created_at,
        paid_at: t.created_at,
        source: t.source || "Manual",
      });
    }

    const { data, error } = await userClient
      .from("finance_transactions")
      .insert(formattedTransactions)
      .select();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("[addTransactions] Error:", err.message);
    throw err;
  }
}
