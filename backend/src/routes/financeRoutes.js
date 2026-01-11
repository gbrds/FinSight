import express from "express";
import {
  createBankAccount,
  addTransactions,
  logUserFinanceData,
  updateTransaction,
  deleteTransaction,
} from "../services/financeService.js";

const router = express.Router();

// --- Create Bank Account ---
router.post("/account", async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountName, name, initialBalance, balance, type, currency } =
      req.body;

    const finalName = accountName || name;
    const finalBalance = initialBalance || balance;

    if (!finalName)
      return res.status(400).json({ error: "Account name is required" });

    const result = await createBankAccount(
      userId,
      finalName,
      finalBalance,
      type,
      currency
    );

    res
      .status(200)
      .json({
        message: result.created ? "Account created" : "Account exists",
        data: result.data,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Add Transactions ---
router.post("/transactions", async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId, transactions } = req.body;

    if (!accountId)
      return res.status(400).json({ error: "Account ID is required" });
    if (!Array.isArray(transactions) || transactions.length === 0)
      return res.status(400).json({ error: "Transactions required" });

    const data = await addTransactions(userId, accountId, transactions);
    res
      .status(201)
      .json({
        message: `Successfully added ${data.length} transactions`,
        data,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Update Transaction ---
router.put("/transactions/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0)
      return res.status(400).json({ error: "No updates provided" });

    const updatedTx = await updateTransaction(userId, id, updates);
    res.json({ message: "Transaction updated", data: updatedTx });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Delete Transaction ---
router.delete("/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteTransaction(id);
    res.json({ message: result.message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Get All Transactions for User ---
router.get("/transactions", async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await logUserFinanceData(userId);
    if (!data) return res.status(404).json({ error: "No finance data found" });

    // Flatten to transactions
    res.json(data.transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Get Full User Finance Data ---
router.get("/userdata", async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await logUserFinanceData(userId);

    if (!data)
      return res.status(404).json({ error: "Failed to retrieve user data" });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
