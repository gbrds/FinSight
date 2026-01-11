export const calculateNetTransaction = (amount, type) => {
  if (!amount) throw new Error("Amount missing");

  const num = parseFloat(amount);

  // Logic: Expenses become negative
  if (type === "expense" && num > 0) {
    return -num;
  }
  return num;
};

export const validateTransaction = (data) => {
  if (!data.merchant || !data.amount) return false;
  return true;
};
