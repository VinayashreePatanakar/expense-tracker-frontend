import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getBudget, saveBudget } from "../services/api";
import { CATEGORIES } from "../constants/categories";
import { getCurrencySymbol } from "../utils/currency";

const Reports = ({ transactions = [], user }) => {
  const [budgets, setBudgets] = useState({});
  const [editMode, setEditMode] = useState(false);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("none"); // spent | remaining | budget
  const [sortOrder, setSortOrder] = useState("desc"); // asc | desc

  const [editingRows, setEditingRows] = useState({});
  
  const symbol = getCurrencySymbol(user?.currency);

const toggleEditRow = (cat) => {
  setEditingRows((prev) => ({
    ...prev,
    [cat]: true, // ✅ force edit mode ON
  }));
};

const saveSingleRow = async (cat) => {
  try {
    const payload = {
      month: useSameBudget ? "default" : selectedMonth,
      totalBudget,
      categories: budgets,
    };

    await saveBudget(payload);

    // ✅ disable edit after save
    setEditingRows((prev) => ({
      ...prev,
      [cat]: false,
    }));

  } catch (err) {
    console.error(err);
  }
};

  // ✅ Dynamic categories from transactions
 const categories = useMemo(() => {
  const txnCategories = transactions.map(t => t.category);

  return Array.from(new Set([...CATEGORIES, ...txnCategories]));
}, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [useSameBudget, setUseSameBudget] = useState(true);

  const totalBudget = useMemo(() => {
  return Object.values(budgets).reduce((sum, val) => sum + val, 0);
}, [budgets]);

  // ✅ FIXED DATE + SPENT CALCULATION
  const spent = useMemo(() => { 
    const totals = {};

    transactions.forEach((t) => {
      const txnMonth = new Date(t.date).toISOString().slice(0, 7);

      if (t.amount < 0 && txnMonth === selectedMonth) {
        const cat = t.category || "General";
        totals[cat] = (totals[cat] || 0) + Math.abs(t.amount);
      }
    });

    return totals;
  }, [transactions, selectedMonth]);

  const tableData = useMemo(() => {
  let data = categories.map((cat) => {
    const used = spent[cat] || 0;
    const limit = budgets[cat] || 0;
    const remaining = limit - used;

    return { cat, used, limit, remaining };
  });

  // 🔍 FILTER
  if (search) {
    data = data.filter((item) =>
      item.cat.toLowerCase().includes(search.toLowerCase())
    );
  }

  // 🔽 SORT
  if (sortBy !== "none") {
    data.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }

  return data;
}, [categories, spent, budgets, search, sortBy, sortOrder]);

  // ✅ FETCH BUDGET FROM DB

const fetchBudget = useCallback(async () => {
  try {
    const key = useSameBudget ? "default" : selectedMonth;

    let res = await getBudget(key);

    // 🧠 If NO data for that month → fallback to default
    if (!res.data && !useSameBudget) {
      const defaultRes = await getBudget("default");

      if (defaultRes.data) {
        setBudgets(defaultRes.data.categories || {});

        // 🔥 AUTO-SAVE into that month (important)
        await saveBudget({
          month: selectedMonth,
          totalBudget: Object.values(defaultRes.data.categories || {})
            .reduce((a, b) => a + b, 0),
          categories: defaultRes.data.categories,
        });

        return;
      }
    }

    if (res.data) {
      setBudgets(res.data.categories || {});
    }

  } catch (err) {
    console.error(err);
  }
}, [selectedMonth, useSameBudget]);
  
useEffect(() => {
  fetchBudget();
}, [fetchBudget]);

  const handleBudgetChange = (category, value) => {
    setBudgets({ ...budgets, [category]: parseFloat(value) || 0 });
  };

  // ✅ SAVE
const saveBudgets = async () => {
  try {
    const payload = {
      month: useSameBudget ? "default" : selectedMonth,
      totalBudget,
      categories: budgets,
    };

    await saveBudget(payload);
    await fetchBudget();

    setEditMode(false); // ✅ MOVE THIS BEFORE ALERT

  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  const updated = {};

  categories.forEach(cat => {
    updated[cat] = budgets[cat] || 0;
  });

  setBudgets(updated);
}, [categories]);

  // ✅ SUMMARY
  const totalSpent = Object.values(spent).reduce((a, b) => a + b, 0);
  const remainingTotal = totalBudget - totalSpent;

  const alerts = useMemo(() => {
  const messages = [];

  tableData.forEach(({ cat, used, limit }) => {
    if (!limit) return;

    const percent = (used / limit) * 100;

    if (percent > 100) {
      messages.push(`🚨 ${cat}: Overspent by ${(used - limit).toFixed(0)}`);
    } else if (percent > 80) {
      messages.push(`⚠️ ${cat}: ${percent.toFixed(0)}% used`);
    }
  });

  return messages;
}, [tableData]);

  return (
    <div className="budget-container">
      {/* HEADER */}
      <div className="budget-header">
        <h2>Budget Dashboard</h2>
      </div>

      {/* SUMMARY */}
      <div className="budget-summary">
        <div className="budget-box total">
          <h4>Total Budget</h4>
          <p>{symbol}{totalBudget}</p>
        </div>

        <div className="budget-box spent">
          <h4>Spent</h4>
          <p>{symbol}{totalSpent}</p>
        </div>

        <div className="budget-box remaining">
          <h4>Remaining</h4>
          <p>{symbol}{remainingTotal}</p>
        </div>
      </div>

      {/* CATEGORY GRID */}
      <div className="budget-table-container">
  {/* 🔍 SEARCH + SORT */}
 <div className="table-controls">

    {/* LEFT SECTION */}
    <div className="controls-left">
      <div className="month-picker">
        <label>Month</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      <label className="toggle">
        <input
          type="checkbox"
          checked={useSameBudget}
          onChange={() => setUseSameBudget(!useSameBudget)}
        />
        <span style={{ marginTop: "20px", marginLeft: "-10px"}}>Same budget</span>
      </label>
    </div>

    {/* RIGHT SECTION */}
    <div className="controls-right">

      <div className="search-box">
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select className="form-control"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="none">Sort</option>
        <option value="used">Spent</option>
        <option value="remaining">Remaining</option>
        <option value="limit">Budget</option>
      </select>

      <button
        className="sort-btn"
        onClick={() =>
          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        }
      >
        {sortOrder === "asc" ? "↑" : "↓"}
      </button>

    </div>

  </div>
   {/* {alerts.length > 0 && (
  <div className="alerts-box">
    {alerts.map((msg, i) => (
      <p key={i}>{msg}</p>
    ))}
  </div>
)}

  {/* 📊 TABLE */}
  <div className="table-container">
  <table className="budget-table">
    <thead>
      <tr>
        <th>Category</th>
        <th>Budget</th>
        <th>Spent</th>
        <th>Remaining</th>
        <th>%</th>
        <th>Edit</th>
        <th>Save</th>
      </tr>
    </thead>

    <tbody>
      {tableData.map(({ cat, used, limit, remaining }) => {
        const percent = limit ? (used / limit) * 100 : 0;

        let statusClass = "safe";
        if (percent > 100) statusClass = "danger";
        else if (percent > 80) statusClass = "warning";

        return (
          <tr key={cat} className={`row-${statusClass}`}>
  <td>{cat}</td>

  {/* BUDGET INPUT */}
<td>
  {editingRows[cat] ? (
    <input
      type="number"
      value={limit}
      onChange={(e) =>
        handleBudgetChange(cat, e.target.value)
      }
    />
  ) : (
    `${symbol} ${limit.toFixed(2)}`
  )}
</td>

  <td>{symbol} {used.toFixed(2)}</td>
  <td>
  {symbol} {remaining.toFixed(2)}

  {percent > 100 && (
    <div className="inline-alert danger">
      Overspent
    </div>
  )}

  {percent > 80 && percent <= 100 && (
    <div className="inline-alert warning">
      {percent.toFixed(0)}% used
    </div>
  )}
</td>

  {/* 📊 PROGRESS BAR */}
  <td style={{ width: "180px" }}>
    <div className="table-progress">
      <div
        className={`table-progress-fill ${statusClass}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
    <small>{percent.toFixed(0)}%</small>
  </td>

  {/* ✏️ EDIT BUTTON */}
 <td>
  <button
    className="edit-btn"
    onClick={() => toggleEditRow(cat)}
    disabled={editingRows[cat]}  // ✅ disable if already editing
  >
    ✏️
  </button>
</td>

<td>
  <button
    className="save-btn"
    onClick={() => saveSingleRow(cat)}
    disabled={!editingRows[cat]} // ✅ enable ONLY when editing
  >
    💾
  </button>
</td>
</tr>
        );
      })}
    </tbody>
  </table>
  </div>
</div>
    </div>
  );
};

export default Reports;