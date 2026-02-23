import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const MonthlySummary = ({ transactions }) => {
  const [fromDate, setFromDate] = useState(""); // start date
  const [toDate, setToDate] = useState("");     // end date
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);

  // Step 1: Filter transactions based on date range
  useEffect(() => {
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      end.setDate(end.getDate() + 1); // include end date
      setFilteredTransactions(
        transactions.filter((t) => {
          const tDate = new Date(t.date);
          return tDate >= start && tDate < end;
        })
      );
    } else {
      setFilteredTransactions(transactions);
    }
  }, [fromDate, toDate, transactions]);

  // Step 2: Group filtered transactions by month
  const monthlyDataMap = {};
  filteredTransactions.forEach((t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey] = { month: monthKey, income: 0, expense: 0 };
    }
    if (t.amount > 0) {
      monthlyDataMap[monthKey].income += t.amount;
    } else {
      monthlyDataMap[monthKey].expense += Math.abs(t.amount);
    }
  });

  const monthlyData = Object.values(monthlyDataMap).sort((a, b) => (a.month > b.month ? 1 : -1));

  const COLORS = { income: "#2ecc71", expense: "#e74c3c" };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "1rem",
        borderRadius: "12px",
        boxShadow: "2px 2px 15px rgba(0,0,0,0.05)",
        marginBottom: "1rem",
      }}
    >
      <h3 style={{ textAlign: "center", color: "#ff7f50" }}>Monthly Summary</h3>

      {/* Date range filter */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div>
          <label>From: </label>
          <input
            type="date"
            value={fromDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <label>To: </label>
          <input
            type="date"
            value={toDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {monthlyData.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa" }}>No transactions in selected range</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
            <Bar dataKey="income" fill={COLORS.income} />
            <Bar dataKey="expense" fill={COLORS.expense} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MonthlySummary;