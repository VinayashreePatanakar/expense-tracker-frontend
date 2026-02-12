import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#2ecc71", "#e74c3c", "#f1c40f", "#3498db", "#9b59b6", "#e67e22", "#95a5a6"];

const Dashboard = ({ transactions }) => {
  // Total Income & Expense
  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // Group by category
  const categoryMap = {};
  transactions.forEach(t => {
    const cat = t.category || "General";
    if (!categoryMap[cat]) categoryMap[cat] = 0;
    categoryMap[cat] += Math.abs(t.amount);
  });

  const categoryData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    value: categoryMap[cat]
  }));

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
      <h3 style={{ textAlign: "center", color: "#ff7f50" }}>Income vs Expense</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={[
              { name: "Income", value: income },
              { name: "Expense", value: expense },
            ]}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {[
              { name: "Income", value: income },
              { name: "Expense", value: expense },
            ].map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>

      {/* Category-wise chart */}
      <h3 style={{ textAlign: "center", color: "#ff7f50", marginTop: "1rem" }}>
        Spending by Category
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={categoryData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-cat-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Dashboard;
