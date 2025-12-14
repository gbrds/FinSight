import { createBankAccount, addTransactions } from "./financeService.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
dotenv.config({ path: path.resolve(dirname, ".env") });

(async () => {
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;

  if (!email || !password) {
    console.error(" Error: Credentials missing from .env");
    process.exit(1);
  }

  console.log(` STARTING FULL INTEGRATION TEST`);

  try {
    console.log(" Step 1: Getting Bank Account");

    const { data: bankAccount } = await createBankAccount(
      email,
      password,
      "Chase Checking",
      8500.0
    );

    console.log(
      `   -> Using Account: ${bankAccount.name} (ID: ${bankAccount.id})`
    );

    // TEHINGUTE LISAMINE
    console.log(" Step 4: Injecting History");

    const transactions = [
      {
        amount: -1850.0,
        merchant: "Luxury Apartments",
        description: "Monthly Rent",
        category: "Housing",
        currency: "USD",
        created_at: new Date(Date.now() - 86400000 * 2),
      },
      {
        amount: -65.2,
        merchant: "Whole Foods",
        description: "Weekly Groceries",
        category: "Food & Dining",
        currency: "USD",
        created_at: new Date(Date.now() - 86400000 * 5),
      },
      {
        amount: 4200.0,
        merchant: "Tech Corp Inc.",
        description: "Salary",
        category: "Income",
        currency: "USD",
        source: "Direct Deposit",
        created_at: new Date(Date.now() - 86400000 * 15),
      },
      {
        amount: -1.0,
        merchant: "Dollar Test",
        description: "Simple test",
        category: "Shopping",
        currency: "USD",
        created_at: new Date(),
      },
    ];

    const result = await addTransactions(
      email,
      password,
      bankAccount.id,
      transactions
    );

    console.log(` Success: Added ${result.length} transactions!`);
  } catch (err) {
    console.error("TEST FAILED:", err);
  }
})();
