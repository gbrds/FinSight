import express from "express";
import {
  createBankAccount,
  addTransactions,
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

// GET /api/finance/transactions?user_id=...
router.get("/transactions", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) return res.status(400).json({ error: "Missing user_id" });

    const { data, error } = await supabase
      .from("finance_transactions")
      .select("*")
      .eq("user_id", user_id)
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

    // Fetch accounts
    const { data: accounts, error: accError } = await supabase
      .from("finance_accounts")
      .select("*")
      .eq("user_id", userId);
    if (accError) throw accError;

    // Fetch categories
    const { data: categories, error: catError } = await supabase
      .from("finance_categories")
      .select("*")
      .eq("user_id", userId);
    if (catError) throw catError;

    // Fetch transactions
    const { data: transactions, error: txError } = await supabase
      .from("finance_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (txError) throw txError;

    res.json({ accounts, categories, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
