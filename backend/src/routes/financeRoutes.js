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
    const { userId, accountName, initialBalance } = req.body;
    if (!userId) throw new Error("User ID is required");

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
    const { userId, accountId, transactions } = req.body;
    if (!userId || !accountId)
      throw new Error("User ID and Account ID are required");

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
    const { id } = req.params;
    const updates = req.body;
    const userId = updates.userId;
    if (!userId)
      return res.status(400).json({ error: "User ID required for updates" });

    // Clean up body before sending to service
    delete updates.userId;

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

// GET /api/finance/transactions?user_id=123
router.get("/transactions", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "Missing user_id" });

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

// GET /api/finance/userdata/:userId
router.get("/userdata/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await logUserFinanceData(userId);
    if (!data) throw new Error("Failed to retrieve user data");
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
