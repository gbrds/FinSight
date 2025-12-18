import express from "express";
import {
  createBankAccount,
  addTransactions,
  logUserFinanceData,
  updateTransaction,
  deleteTransaction,
} from "../services/financeService.js";
import { supabase } from "../services/supabaseClient.js";

const router = express.Router();
// POST /api/finance/account
router.post("/account", async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountName, initialBalance } = req.body;

    const result = await createBankAccount(userId, accountName, initialBalance);
    res.status(200).json({
      message: result.created ? "Account created" : "Account retrieved",
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/finance/transactions
router.post("/transactions", async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId, transactions } = req.body;

    if (!accountId) throw new Error("Account ID is required");

    const data = await addTransactions(userId, accountId, transactions);
    res.status(201).json({
      message: `Successfully added ${data.length} transactions`,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/finance/transactions/:id
router.put("/transactions/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    delete updates.userId; // Security cleanup

    const updatedTx = await updateTransaction(userId, id, updates);

    res.json({ message: "Transaction updated", data: updatedTx });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/finance/transactions/:id
router.delete("/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTransaction(id);
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/finance/transactions
router.get("/transactions", async (req, res) => {
  try {
    const user_id = req.user.id;

    const { data: accounts } = await supabase
      .from("finance_accounts")
      .select("id")
      .eq("user_id", user_id);

    if (!accounts || accounts.length === 0) return res.json([]);

    const accountIds = accounts.map((a) => a.id);

    const { data, error } = await supabase
      .from("finance_transactions")
      .select("*")
      .in("account_id", accountIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/finance/userdata
router.get("/userdata", async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await logUserFinanceData(userId);
    if (!data) throw new Error("Failed to retrieve user data");
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
