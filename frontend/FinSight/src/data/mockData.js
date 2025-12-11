export const mockPortfolioSummary = {
  totalValue: 128432.5,
  dayChange: 1203.0,
  dayChangePercent: 0.94,
  buyingPower: 15873.1,
};
export const mockPortfolioHistory = [
  { date: "Sep", value: 120000 },
  { date: "Oct", value: 123500 },
  { date: "Nov", value: 122000 },
  { date: "Dec", value: 125000 },
  { date: "Jan", value: 128432 },
  { date: "Feb", value: 132000 },
];
export const mockHoldings = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 173.5,
    change: 2.3,
    changePercent: 1.34,
    value: 25400,
    shares: 146,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 483.16,
    change: 4.5,
    changePercent: 0.98,
    value: 14200,
    shares: 29,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 182.41,
    change: -0.97,
    changePercent: -0.53,
    value: 32000,
    shares: 175,
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 455.0,
    change: 11.2,
    changePercent: 2.52,
    value: 8900,
    shares: 19,
  },
];

export const mockMarketNews = [
  {
    id: 1,
    source: "Motley Fool",
    time: "53m ago",
    headline:
      "2 Artificial Intelligence Stocks That Can Have Their Nvidia Moment in 2026",
    tags: ["NVDA", "AI"],
  },
  {
    id: 2,
    source: "Bloomberg",
    time: "2h ago",
    headline:
      "Dow Jones Futures: Market Rally Ideal For ABC Investing; AI Giants Fed Loom",
    tags: ["Market", "Economy"],
  },
  {
    id: 3,
    source: "Yahoo Finance",
    time: "4h ago",
    headline: "Why Amazon Stock Is Jumping Today",
    tags: ["AMZN"],
  },
];
export const mockPortfolios = [
  {
    id: 1,
    name: "Main Growth",
    type: "Brokerage",
    value: 128432.5,
    change: 1203.0,
    changePercent: 0.94,
    cash: 15873.1,
  },
  {
    id: 2,
    name: "Retirement (Roth)",
    type: "Retirement",
    value: 84200.0,
    change: 320.5,
    changePercent: 0.38,
    cash: 4200.0,
  },
  {
    id: 3,
    name: "High Risk / Crypto",
    type: "Speculative",
    value: 12500.0,
    change: -450.2,
    changePercent: -3.4,
    cash: 150.0,
  },
];
export const mockPortfolioHoldings = [
  {
    id: 1,
    symbol: "AAPL",
    name: "Apple Inc.",
    quantity: 50,
    avgCost: 145.0,
    price: 173.5,
    dayChange: 1.34,
    totalChange: 19.65,
    value: 8675.0,
  },
  {
    id: 2,
    symbol: "MSFT",
    name: "Microsoft Corp.",
    quantity: 30,
    avgCost: 320.0,
    price: 483.16,
    dayChange: 0.98,
    totalChange: 51.0,
    value: 14494.8,
  },
  {
    id: 3,
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    quantity: 15,
    avgCost: 130.0,
    price: 179.0,
    dayChange: 2.15,
    totalChange: 37.69,
    value: 2685.0,
  },
  {
    id: 4,
    symbol: "TSLA",
    name: "Tesla, Inc.",
    quantity: 20,
    avgCost: 260.0,
    price: 455.0,
    dayChange: -1.5,
    totalChange: 75.0,
    value: 9100.0,
  },
  {
    id: 5,
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    quantity: 25,
    avgCost: 105.0,
    price: 142.0,
    dayChange: 0.5,
    totalChange: 35.23,
    value: 3550.0,
  },
];
export const mockStockDetail = {
  symbol: "AAPL",
  name: "Apple Inc.",
  price: 173.5,
  change: 2.3,
  changePercent: 1.34,
  marketCap: "2.7T",
  peRatio: "28.5",
  dividendYield: "0.55%",
  volume: "54.2M",
  high52: "199.62",
  low52: "124.17",
  about:
    "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
  news: [
    {
      id: 1,
      source: "Reuters",
      title: "Apple settles with EU over tap-to-pay tech",
      time: "2h ago",
    },
    {
      id: 2,
      source: "CNBC",
      title: "Why tech stocks are rallying today",
      time: "5h ago",
    },
  ],
};
export const mockExpenses = [
  { category: "Housing", amount: 1200, color: "#10b981" }, // Green
  { category: "Food & Dining", amount: 450, color: "#3b82f6" }, // Blue
  { category: "Transportation", amount: 300, color: "#f59e0b" }, // Amber
  { category: "Entertainment", amount: 150, color: "#8b5cf6" }, // Purple
  { category: "Shopping", amount: 200, color: "#ec4899" }, // Pink
];

export const mockTransactions = [
  {
    id: 1,
    merchant: "Uber",
    date: "Today, 2:30 PM",
    amount: -24.5,
    category: "Transportation",
  },
  {
    id: 2,
    merchant: "Trader Joes",
    date: "Yesterday",
    amount: -85.2,
    category: "Food & Dining",
  },
  {
    id: 3,
    merchant: "Monthly Rent",
    date: "Oct 1",
    amount: -1200.0,
    category: "Housing",
  },
  {
    id: 4,
    merchant: "Freelance Payment",
    date: "Oct 1",
    amount: 3500.0,
    category: "Income",
    isIncome: true,
  },
];
