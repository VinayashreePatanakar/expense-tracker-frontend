import React, { useState, useMemo, useEffect } from "react";
import "../App.css";
import {
  BarChart,
  PieChart,
  Pie,
  Cell,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import * as XLSX from "xlsx";
import { LineChart, Line } from "recharts";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import * as htmlToImage from "html-to-image";

const Dashboard = ({ transactions, user }) => {

  //Add Global Dark Mode Support
  const [darkMode, setDarkMode] = useState(false);

  //Add Toggle (Monthly / Weekly + Stacked)
  const [viewMode, setViewMode] = useState("monthly");
  const [stacked, setStacked] = useState(false);

// Define colors for slices
const COLORS = [
  "#4fd1c5",
  "#c6d615",
  "#c66a4a",
  "#2f7de1",
  "#f87171",
  "#b44dc0",
  "#7c5cd6",
  "#3b82f6",
  "#14b8a6",
];

  // ✅ Default: current month first & last day
const now = new Date();

// First day of current month (LOCAL)
const firstDayDate = new Date(now.getFullYear(), now.getMonth(), 1);

// Today's date (LOCAL)
const todayDate = new Date();

// Helper to format yyyy-mm-dd (for input type="date")
const formatInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const firstDay = formatInputDate(firstDayDate);
const today = formatInputDate(todayDate);

const [fromDate, setFromDate] = useState(firstDay);
const [toDate, setToDate] = useState(today);

const [showPicker, setShowPicker] = useState(false);

const [range, setRange] = useState([
  {
    startDate: new Date(fromDate),
    endDate: new Date(toDate),
    key: "selection",
  },
]);

// ================= PAGINATION =================
const ITEMS_PER_PAGE = 5;
const [currentPage, setCurrentPage] = useState(1);

  // ✅ Filter transactions based on selected date range
  const filteredTransactions = useMemo(() => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999); // include full end day

    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= from && transactionDate <= to;
    });
  }, [transactions, fromDate, toDate]);

  // Reset page when date filter changes
useEffect(() => {
  setCurrentPage(1);
}, [fromDate, toDate]);

   // ✅ Put this FIRST
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB");
}

  // Running balance chart data
  // ✅ Then useMemo
const balanceChartData = useMemo(() => {
  const sorted = [...filteredTransactions]
    .map((t) => ({
      ...t,
      timestamp: new Date(t.date).getTime(),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  let runningBalance = 0;

  return sorted.map((t) => {
    runningBalance += Number(t.amount);

    return {
      timestamp: t.timestamp,
      balance: runningBalance,
    };
  });
}, [filteredTransactions]);

console.log("balanceChartData: "+balanceChartData);

// Category-wise Pie Chart Data and summary chart data (for selected date range)
const categoryChartData = useMemo(() => {
  const categoryMap = {};
  let totalExpense = 0;

  filteredTransactions.forEach((t) => {
    // Only take expenses
    if (t.amount < 0) {
      const category = t.category || "General";
      const expenseAmount = Math.abs(t.amount);

      if (!categoryMap[category]) {
        categoryMap[category] = { category, amount: 0 };
      }

      categoryMap[category].amount += expenseAmount;
      totalExpense += expenseAmount;
    }
  });

  return Object.values(categoryMap).map((c) => ({
    ...c,
    percent: totalExpense
      ? ((c.amount / totalExpense) * 100).toFixed(2)
      : 0,
  }));
}, [filteredTransactions]);

  // ✅ Calculations
  const income = filteredTransactions
    .filter((t) => t.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expense = filteredTransactions
    .filter((t) => t.amount < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const totalBalance = income - expense;
  const transactionCount = filteredTransactions.length;

  // ✅ Monthly chart data (group by month)
const monthlyMap = {}; 
transactions
  .filter((t) => t.date >= fromDate && t.date <= toDate)
  .forEach((t) => {
    const date = new Date(t.date);
    const monthName = date.toLocaleString("default", { month: "short" });

    if (!monthlyMap[monthName]) {
      monthlyMap[monthName] = { month: monthName, income: 0, expense: 0 };
    }

    if (t.amount > 0) {
      monthlyMap[monthName].income += t.amount;
    } else {
      monthlyMap[monthName].expense += Math.abs(t.amount);
    }
  });

// ✅ Monthly chart data (group by month between fromDate and toDate)

const chartData = useMemo(() => {
  const map = {};
  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999);

  transactions.forEach((t) => {
    const d = new Date(t.date);
    if (d >= from && d <= to) {

      let key;

      if (viewMode === "monthly") {
        key = d.toLocaleString("default", { month: "short", year: "numeric" });
      } else {
        const week = Math.ceil(d.getDate() / 7);
        key = `Week ${week} - ${d.toLocaleString("default", { month: "short" })}`;
      }

      if (!map[key]) {
        map[key] = { period: key, income: 0, expense: 0 };
      }

      if (t.amount > 0) {
        map[key].income += Number(t.amount);
      } else {
        map[key].expense += Math.abs(Number(t.amount));
      }
    }
  });

  return Object.values(map);
}, [transactions, fromDate, toDate, viewMode]);

console.log("Monthly Chart Data:", chartData);

console.log("Transactions:", transactions);

const renderAnimatedLabel = (props) => {
  const { x, y, width, value } = props;

  return (
    <text
      x={x + width / 2}
      y={y - 10}
      textAnchor="middle"
      fill={darkMode ? "#fff" : "#111"}
      style={{ fontSize: 12, fontWeight: 600 }}
    >
      ₹{value}
    </text>
  );
};

// ================= PAGINATED TRANSACTIONS =================
const sortedTransactions = [...filteredTransactions].sort((a, b) => {
  return new Date(b.date) - new Date(a.date);
});

const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
const endIndex = startIndex + ITEMS_PER_PAGE;

const paginatedTransactions = sortedTransactions.slice(
  startIndex,
  endIndex
);

  console.log(transactions.map(t => t.date));

  const exportChart = () => {
  const node = document.getElementById("chart-export");

  htmlToImage.toPng(node).then((dataUrl) => {
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = dataUrl;
    link.click();
  });
};

  return (
    //Add this main wrapper around everything
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
      <div
  style={{
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  }}
>
  <h2 style={{ margin: 0 }}>
    Welcome back, <span style={{ color: "#2563eb" }}>{user?.name}</span> 👋
  </h2>
  <p style={{ color: "#6b7280", marginTop: "5px" }}>
    Here’s your financial overview
  </p>
</div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 15 }}>
        <button
          className="btn-primary"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
      {/* ================= SUMMARY  CARDS ================= */}
    <div className="summary-grid">
        <div className="summary-card income"><h4>Income</h4><p>₹{income}</p></div>
        <div className="summary-card expense"><h4>Expense</h4><p>₹{expense}</p></div>
        <div className="summary-card balance"><h4>Balance</h4><p>₹{totalBalance}</p></div>
        <div className="summary-card transactions"><h4>Transactions</h4><p>{transactionCount}</p></div>
      </div>

      {/* ================= DATE FILTER ================= */}
 <div className="date-filter-wrapper">
   <div className="date-picker" onClick={()=>setShowPicker(!showPicker)}>
    {format(new Date(fromDate), "dd/MM/yyyy")} -{" "}
    {format(new Date(toDate), "dd/MM/yyyy")}
  </div>

  {showPicker && (
     <div className="date-picker-popup">
      <DateRange
        editableDateInputs={true}
        onChange={(item) => setRange([item.selection])}
        moveRangeOnFirstSelection={false}
        ranges={range}
        months={2}
        direction="horizontal"
        maxDate={new Date()}   // ✅ This disables future dates
      />

      <div className="picker-actions">
        <button
          onClick={() => setShowPicker(false)}
          style={{
            padding: "8px 15px",
            borderRadius: "6px",
            border: "none",
            background: "#6c757d",
            color: "#fff",
          }}
        >
          Cancel
        </button>

        <button
          onClick={() => {
            setFromDate(
              format(range[0].startDate, "yyyy-MM-dd")
            );
            setToDate(
              format(range[0].endDate, "yyyy-MM-dd")
            );
            setShowPicker(false);
          }}
          style={{
            padding: "8px 15px",
            borderRadius: "6px",
            border: "none",
            background: "#2563eb",
            color: "#fff",
          }}
        >
          Apply
        </button>
      </div>
    </div>
  )}
</div>

<div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
  <button onClick={() => setViewMode("monthly")} className="btn-primary">
    Monthly
  </button>
  <button onClick={() => setViewMode("weekly")} className="btn-primary">
    Weekly
  </button>
  <button onClick={() => setStacked(!stacked)} className="btn-primary">
    {stacked ? "Grouped" : "Stacked"}
  </button>
</div>

  {/* ================= 2-COLUMN CHART LAYOUT ================= */}
 <div className="charts-grid">
   {/* LEFT COLUMN */}
    <div className="left-column">
    {/* Monthly Income vs Expense */}
   <div className="chart-card">
  <h3 style={{ marginBottom: "20px" }}>
    Monthly Income vs Expense
  </h3>

  {chartData.length === 0 ? (
    <p className="empty-state">No data available</p>
  ) : (
  <ResponsiveContainer width="100%" height={320}>
  <BarChart data={chartData} barGap={8} barCategoryGap="20%">
    <defs>
      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
        <stop offset="100%" stopColor="#16a34a" stopOpacity={0.8} />
      </linearGradient>

      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
        <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
      </linearGradient>
    </defs>

    <CartesianGrid
  strokeDasharray="3 3"
  vertical={false}
  stroke={darkMode ? "#334155" : "#e5e7eb"}
/>
    <XAxis
  dataKey="period"
  tick={{ fill: darkMode ? "#cbd5e1" : "#374151" }}
  axisLine={false}
  tickLine={false}
/>
    <YAxis
  tick={{ fill: darkMode ? "#cbd5e1" : "#374151" }}
  axisLine={false}
  tickLine={false}
/>
    <Tooltip
      contentStyle={{
        backgroundColor: "#fff",          
        borderRadius: "10px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
      }}
      formatter={(value, name) => [
        `₹${value}`,
        name === "income" ? "Income" : "Expense",
      ]}
    />
    <Legend />

    <Bar
      dataKey="income"
      fill="url(#incomeGradient)"
      radius={[8, 8, 0, 0]}
      animationDuration={1000}
      animationEasing="ease-out"
      label={renderAnimatedLabel}
    />
    <Bar
      dataKey="expense"
      fill="url(#expenseGradient)"
      radius={[8, 8, 0, 0]}
      animationDuration={1000}
      animationEasing="ease-out"
      label={renderAnimatedLabel}
    />
  </BarChart>
</ResponsiveContainer>
  )}
</div>

{/* Account Balance Line Chart */}
<div className="chart-card">
    <h3 style={{ marginBottom: "20px" }}>Account Balance Over Time</h3>

    {balanceChartData.length === 0 ? (
      <p style={{ textAlign: "center", marginTop: "100px" }}>No data available</p>
    ) : (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={balanceChartData}>
  <XAxis
    dataKey="timestamp"
    tickFormatter={(value) =>
      new Date(value).toLocaleDateString("en-GB")
    }
  />
  <YAxis />
  <Tooltip
    labelFormatter={(value) =>
      new Date(value).toLocaleDateString("en-GB")
    }
  />
  <Legend />
  <Line
  type="monotone"
  dataKey="balance"
  stroke="#3b82f6"
  strokeWidth={3}
  dot={{ r: 5 }}
  activeDot={{ r: 8 }}
  animationDuration={1200}
  style={{ filter: "drop-shadow(0px 4px 10px rgba(59,130,246,0.4))" }}
/>
</LineChart>
      </ResponsiveContainer>
    )}
    </div>
  </div>

 {/* -------- Category-wise Pie Chart && RIGHT COLUMN-------- */}
<div className="right-column">
  <div className="chart-card pie-chart-card">
  <h3>Total Expenses</h3>
  <p className="sub-title">
    {formatDate(fromDate)} - {formatDate(toDate)}
  </p>

  {categoryChartData.length === 0 ? (
    <p className="empty-state">
      No data available
    </p>
  ) : (
    <div className="pie-responsive-wrapper">
      {/* -------- Donut Chart -------- */}
      <ResponsiveContainer width="100%" height={450}>
        <PieChart>
          <Pie
            data={categoryChartData}
            dataKey="amount"
            nameKey="category"
            cx="40%"
            cy="45%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            labelLine={false}
            label={(props) => {
                        const { cx, cy, midAngle, outerRadius, percent, index } = props;

                        // Hide very small slices (less than 5%)
                        if (percent < 0.05) return null;

                        const RADIAN = Math.PI / 180;

                        // Position outside the pie
                        const radius = outerRadius + 25;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        const sliceColor = COLORS[index % COLORS.length]; // 👈 get slice color

                        return (
                          <text
                            x={x}
                            y={y}
                            fill={sliceColor}        // 👈 label color same as slice
                            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            fontWeight="bold"
                            fontSize={14}
                            transform={`rotate(40, ${x}, ${y})`} // <-- angle changed here
                          >
                            {categoryChartData[index].category}
                          </text>
                        );
                      }}
          >
            {categoryChartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                        style={{
                          filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.25))",
                        }}
                      />
                      ))}
                    </Pie>
                    <text
  x="40%"
  y="46%"
  textAnchor="middle"
  dominantBaseline="middle"
  style={{
    fontSize: 18,
    fontWeight: 600,
    fill: darkMode ? "#fff" : "#111",
  }}
>
  ₹{expense}
</text>
                    <Tooltip
                      formatter={(value, name, props) => {
                        const c = props.payload;
                        return [`₹${c.amount.toFixed(0)} (${c.percent}%)`, c.category];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

{/* -------- Responsive Legend Below -------- */}
                <div className="pie-legend-below">
                  {categoryChartData.map((item, index) => (
                    <div key={index} className="legend-item-below">
                      <span className="color-box-below" style={{ background: COLORS[index % COLORS.length] }} />
                      <span className="legend-name-below">{item.category}</span>
                      <span className="legend-value-below">₹{item.amount.toFixed(0)} ({item.percent}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>  

      <button className="btn-primary" onClick={exportChart}>
      Export Chart
    </button>

      {/* ================= RECENT TRANSACTIONS ================= */}
      <div className="transactions-card">
        <h3>Recent Transactions</h3>

        {paginatedTransactions.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          <table className="recent-transactions">
  <thead>
    <tr>
      <th>Date</th>
      <th>Category</th>
      <th>Name</th>
      <th>Amount</th>
      <th>Payment Mode</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    {paginatedTransactions.map((t, idx) => (
      <tr key={idx}>
        <td>{formatDate(t.date)}</td>
        <td>{t.category}</td>
        <td>{t.text}</td>
        <td className={t.amount > 0 ? "income" : "expense"}>₹{t.amount}</td>
        <td>{t.mode}</td>
        <td>{t.description}</td>
      </tr>
    ))}
  </tbody>
</table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;