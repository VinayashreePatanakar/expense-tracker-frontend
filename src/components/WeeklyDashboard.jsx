import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const WeeklyDashboard = ({ transactions }) => {
  // Get last 7 days dates
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  }).reverse();

  // Aggregate income and expense per day
  const data = last7Days.map(date => {
    const dailyTransactions = transactions.filter(t => t.date === date);
    const income = dailyTransactions
      .filter(t => t.amount > 0)
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = dailyTransactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    return { date, Income: income, Expense: expense };
  });

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
      <h3 style={{ textAlign: "center", color: "#ff7f50" }}>Weekly Income vs Expense</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" height={36}/>
          <Bar dataKey="Income" fill="#2ecc71" />
          <Bar dataKey="Expense" fill="#e74c3c" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyDashboard;
