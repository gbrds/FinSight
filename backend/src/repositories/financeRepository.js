import prisma from "../clients/prismaClient.js";

// --- CATEGORIES ---
export async function createCategory(userId, name, color) {
  return await prisma.finance_categories.create({
    data: { user_id: userId, name, color: color || "#cccccc" },
  });
}

export async function getCategoriesByUserId(userId) {
  return await prisma.finance_categories.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "asc" },
  });
}

export async function deleteCategory(categoryId) {
  return await prisma.$transaction([
    prisma.finance_transactions.updateMany({
      where: { category_id: categoryId },
      data: { category_id: null },
    }),
    prisma.finance_categories.delete({ where: { id: categoryId } }),
  ]);
}

// --- ACCOUNTS ---
export async function createAccount(userId, name, type, balance, currency) {
  return await prisma.finance_accounts.create({
    data: {
      user_id: userId,
      name,
      type,
      balance: balance ? parseFloat(balance) : 0,
      currency: currency || "USD",
    },
  });
}

export async function getAccountsByUserId(userId) {
  return await prisma.finance_accounts.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "asc" },
  });
}

export async function getAccountById(accountId) {
  return await prisma.finance_accounts.findUnique({
    where: { id: accountId },
  });
}

// --- BANKING TRANSACTIONS ---

export async function createBankingTransaction(userId, accountId, txData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the transaction
    const newTx = await tx.finance_transactions.create({
      data: {
        account_id: accountId,
        amount: parseFloat(txData.amount),
        merchant: txData.merchant || "Unknown",
        description: txData.description || "",
        category_id: txData.category_id || null,
        currency: txData.currency || "USD",
        source: txData.source || "Manual",
        paid_at: txData.date ? new Date(txData.date) : new Date(),
      },
    });

    // 2. Update Account Balance
    await tx.finance_accounts.update({
      where: { id: accountId },
      data: { balance: { increment: newTx.amount } },
    });

    return newTx;
  });
}

export async function getBankingTransactions(userId) {
  return await prisma.finance_transactions.findMany({
    where: {
      finance_accounts: {
        user_id: userId,
      },
    },
    include: {
      finance_categories: true,
      finance_accounts: true,
    },
    orderBy: { paid_at: "desc" },
  });
}

export async function updateBankingTransaction(transactionId, updates) {
  return await prisma.$transaction(async (tx) => {
    const oldTx = await tx.finance_transactions.findUnique({
      where: { id: transactionId },
    });
    if (!oldTx) throw new Error("Transaction not found");

    let balanceDiff = 0;
    if (updates.amount !== undefined) {
      const newAmount = parseFloat(updates.amount);
      balanceDiff = newAmount - parseFloat(oldTx.amount);
    }

    const dataToUpdate = { ...updates };
    if (dataToUpdate.amount)
      dataToUpdate.amount = parseFloat(dataToUpdate.amount);
    if (dataToUpdate.date) {
      dataToUpdate.paid_at = new Date(dataToUpdate.date);
      delete dataToUpdate.date;
    }

    const updatedTx = await tx.finance_transactions.update({
      where: { id: transactionId },
      data: dataToUpdate,
    });

    if (balanceDiff !== 0) {
      await tx.finance_accounts.update({
        where: { id: oldTx.account_id },
        data: { balance: { increment: balanceDiff } },
      });
    }

    return updatedTx;
  });
}

export async function deleteBankingTransaction(transactionId) {
  return await prisma.$transaction(async (tx) => {
    const txRecord = await tx.finance_transactions.findUnique({
      where: { id: transactionId },
    });

    if (!txRecord) throw new Error("Transaction not found");

    await tx.finance_accounts.update({
      where: { id: txRecord.account_id },
      data: { balance: { decrement: txRecord.amount } },
    });

    return await tx.finance_transactions.delete({
      where: { id: transactionId },
    });
  });
}
