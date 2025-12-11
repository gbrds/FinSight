import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Wallet, TrendingDown, TrendingUp, CreditCard } from "lucide-react";
import { mockExpenses, mockTransactions } from "../data/mockData";

const Finance = () => {
  const totalExpenses = mockExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Personal Finance</h1>

      {/* 1. Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <Wallet size={20} />
            </div>
            <span className="text-gray-400 text-sm">Monthly Income</span>
          </div>
          <div className="text-2xl font-bold text-white">$5,200.00</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <TrendingDown size={20} />
            </div>
            <span className="text-gray-400 text-sm">Expenses</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${totalExpenses.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <TrendingUp size={20} />
            </div>
            <span className="text-gray-400 text-sm">Savings Rate</span>
          </div>
          <div className="text-2xl font-bold text-green-400">32%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Spending Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:col-span-1">
          <h2 className="font-bold text-white mb-6">Spending by Category</h2>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockExpenses}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {mockExpenses.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-xs text-gray-500">Total</div>
              <div className="font-bold text-white">${totalExpenses}</div>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {mockExpenses.map((item) => (
              <div key={item.category} className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-300">{item.category}</span>
                </div>
                <span className="font-medium text-white">${item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Transaction History */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-white">Recent Transactions</h2>
            <button className="text-sm text-green-400">View All</button>
          </div>
          <div className="space-y-4">
            {mockTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-white">{tx.merchant}</div>
                    <div className="text-xs text-gray-500">
                      {tx.date} • {tx.category}
                    </div>
                  </div>
                </div>
                <div
                  className={`font-bold ${
                    tx.isIncome ? "text-green-400" : "text-white"
                  }`}
                >
                  {tx.isIncome ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
