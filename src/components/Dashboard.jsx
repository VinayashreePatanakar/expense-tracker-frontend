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
import { getCurrencySymbol } from "../utils/currency";

const Dashboard = ({ transactions, user, darkMode }) => {

  const theme = {
  bg: darkMode ? "#0F172A" : "#F9FAFB",
  card: darkMode ? "#1E293B" : "#FFFFFF",
  text: darkMode ? "#F1F5F9" : "#111827",
  subtext: darkMode ? "#94A3B8" : "#6B7280",
  border: darkMode ? "#334155" : "#E5E7EB",
};

const symbol = getCurrencySymbol(user?.currency);

  //Add Toggle (Monthly / Weekly + Stacked)
  const [viewMode, setViewMode] = useState("monthly");
  const [stacked, setStacked] = useState(false);

// Define colors for slices
const COLORS = [
  "#A52A2A",
  "#c6d615",
  "#c66a4a",
  "#2f7de1",
  "#8B8000",
  "#DC143C",
  "#008080",
  "#630330",
  "#a98ff0",
  "#F4BB44",
  "#e0909d",
  "#14b8a6",
  "#9F2B68"
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

const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

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

  return sorted.map((t, index) => {
    runningBalance += Number(t.amount);

    return {
      timestamp: new Date(t.date).getTime() + index * 1000, // 👈 add spacing 
      balance: runningBalance,
      change: Number(t.amount), // ✅ ADD THIS
    };
  });
}, [filteredTransactions]);

useEffect(() => {
  console.table(balanceChartData);
}, [balanceChartData]);

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

console.table(chartData);

console.log("Transactions:", transactions);

const renderAnimatedLabel = (props) => {
  const { x, y, width, value } = props;

  return (
    <text
      x={x + width / 2}
      y={y - 10}
      textAnchor="middle"
      fill={theme.text}
      style={{ fontSize: 12, fontWeight: 600 }}
    >
      {symbol}{value}
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

  //console.log(transactions.map(t => t.date));

const exportChart = async () => {
  const node = document.getElementById("chart-export");

  if (!node) {
    console.error("Chart element not found!");
    return;
  }

  try {
    const dataUrl = await htmlToImage.toPng(node, {
      cacheBust: true,
      skipFonts: true,
      backgroundColor: darkMode ? "#0F172A" : "#ffffff",
      pixelRatio: 2,
    });

    const link = document.createElement("a");
    link.download = "expense-chart.png";
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Export failed:", error);
  }
};

  return (
    //Add this main wrapper around everything
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
<div className="dashboard-header">
        <h2>Dashboard</h2>
      </div>

      {/* ================= SUMMARY  CARDS ================= */}
    <div className="summary-grid">
        <div className="summary-card income"><h4>Income</h4><p>{symbol}{income}</p></div>
        <div className="summary-card expense"><h4>Expense</h4><p>{symbol}{expense}</p></div>
        <div className="summary-card balance"><h4>Balance</h4><p>{symbol}{totalBalance}</p></div>
        <div className="summary-card transactions"><h4>Transactions</h4><p>{transactionCount}</p></div>
      </div>

      {/* ================= DATE FILTER ================= */}
 <div className="date-filter-wrapper" style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap", // responsive
  gap: "10px",
  marginBottom: "15px"
}}>

  {/* LEFT SIDE */}
  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
    
    {/* Date Picker */}
    <div className="date-picker" onClick={() => setShowPicker(!showPicker)}>
      {format(new Date(fromDate), "dd/MM/yyyy")} -{" "}
      {format(new Date(toDate), "dd/MM/yyyy")}
    </div>

    {/* Buttons */}
    <button onClick={() => setViewMode("monthly")} className="btn-primary-dashboard">
      Monthly
    </button>

    <button onClick={() => setViewMode("weekly")} className="btn-primary-dashboard">
      Weekly
    </button>

    <button onClick={() => setStacked(!stacked)} className="btn-primary-dashboard">
      {stacked ? "Grouped" : "Stacked"}
    </button>

  </div>

  {/* RIGHT SIDE */}
  <button className="btn-primary-dashboard export-button" onClick={exportChart}>
     <i className="fa-solid fa-download"></i> Export Chart
  </button>

  {/* DATE PICKER POPUP */}
  {showPicker && (
    <div className="date-picker-popup">
      <DateRange
        editableDateInputs={true}
        onChange={(item) => setRange([item.selection])}
        moveRangeOnFirstSelection={false}
        ranges={range}
        months={window.innerWidth < 768 ? 1 : 2}
        direction={window.innerWidth < 768 ? "vertical" : "horizontal"}
        maxDate={new Date()}
      />

      <div className="picker-actions">
        <button onClick={() => setShowPicker(false)}>Cancel</button>

        <button
          onClick={() => {
            setFromDate(format(range[0].startDate, "yyyy-MM-dd"));
            setToDate(format(range[0].endDate, "yyyy-MM-dd"));
            setShowPicker(false);
          }}
        >
          Apply
        </button>
      </div>
    </div>
  )}

</div>


  {/* ================= 2-COLUMN CHART LAYOUT ================= */}
 <div className="charts-grid" id="chart-export">
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
  <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 200 : 300}>
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
  stroke={theme.border}
/>
    <XAxis
  dataKey="period"
  tick={{ fill: theme.subtext }}
  axisLine={false}
  tickLine={false}
/>
    <YAxis
  tick={{ fill: theme.subtext }}
  axisLine={false}
  tickLine={false}
/>
    <Tooltip
      contentStyle={{
        backgroundColor: darkMode ? "#1E293B" : "#fff",
        border: `1px solid ${theme.border}`,         
        borderRadius: "10px",
        boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
      }}
      formatter={(value, name) => [
        `${symbol}${value}`,
        name === "income" ? "Income" : "Expense",
      ]}
    />

<Legend wrapperStyle={{ paddingBottom: 10 }} />
    <Bar
      dataKey="expense"
      name="Expense"
      fill="url(#expenseGradient)"
      radius={[8, 8, 0, 0]}
      animationDuration={1000}
      animationEasing="ease-out"
      label={renderAnimatedLabel}
    />
    <Bar
      dataKey="income"
      name="Income"
      fill="url(#incomeGradient)"
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
      <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 200 : 300}>
        <LineChart data={balanceChartData}>
  <XAxis
  dataKey="timestamp"
  tickFormatter={(value) =>
    new Date(value).toLocaleDateString("en-GB")
  }
/>
  <YAxis />

  {/* ✅ REPLACE TOOLTIP HERE */}
  <Tooltip
    labelFormatter={(value) =>
      new Date(value).toLocaleDateString("en-GB")
    }
    formatter={(value, name) => {
      if (name === "Balance") {
        return [`${symbol}${value}`, "Balance"];
      }
      return value;
    }}
    content={({ active, payload, label }) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;

        return (
          <div
            style={{
              background: darkMode ? "#1E293B" : "#fff",
              padding: "10px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
            }}
          >
            <p>
  {new Date(label).toLocaleDateString("en-GB")}
</p>
            <p>
              <strong>Balance:</strong> {symbol}{data.balance}
            </p>
            <p
              style={{
                color: data.change > 0 ? "green" : "red",
              }}
            >
              <strong>Change:</strong> {symbol}{data.change}
            </p>
          </div>
        );
      }
      return null;
    }}
  />

  <Legend />

  <Line
    type="monotone"
    dataKey="balance"
    name="Balance"
    stroke="#3b82f6"
    strokeWidth={3}
    dot={{ r: 5 }}
    activeDot={{ r: 8 }}
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
      <ResponsiveContainer width="100%" height={348}>
        <PieChart className="pie-chart">
          <Pie
            data={categoryChartData}
            dataKey="amount"
            nameKey="category"
            cx="55%"
            cy="45%"
            innerRadius={isMobile ? 60 : 80}
            outerRadius={isMobile ? 90 : 120}
            paddingAngle={6}
            labelLine={false}
            label={(props) => {
                      if (isMobile) return null; // ✅ hide labels on mobile

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
                    <text className="pie-chart-expense"
  x="53%"
  y="46%"
  textAnchor="middle"
  dominantBaseline="middle"
  style={{
    fontSize: 18,
    fontWeight: 600,
     fill: "var(--text-primary)",  // ✅ THIS LINE
  }}
>
  {symbol}{expense}
</text>
                    <Tooltip
                      formatter={(value, name, props) => {
                        const c = props.payload;
                        return [`${symbol}${c.amount.toFixed(0)} (${c.percent}%)`, c.category];
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
                      <span className="legend-value-below">{symbol}{item.amount.toFixed(0)} ({item.percent}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>  

      {/* ================= RECENT TRANSACTIONS ================= */}
      <div className="transactions-card">
        <h3>Recent Transactions</h3>

        {paginatedTransactions.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          <div className="table-container">
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
        <td className={t.amount > 0 ? "income" : "expense"}>{symbol}{t.amount}</td>
        <td>{t.mode}</td>
        <td>{t.description}</td>
      </tr>
    ))}
  </tbody>
</table>
    </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;