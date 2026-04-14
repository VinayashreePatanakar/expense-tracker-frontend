import React, { useState, useEffect, useMemo } from "react";
import { getBudget, saveBudget } from "../services/api";

const Reports = ({ transactions = [] }) => {
  const [budgets, setBudgets] = useState({});
  const [totalBudget, setTotalBudget] = useState(0);
  const [editMode, setEditMode] = useState(false);

  // ✅ Dynamic categories from transactions
  const categories = useMemo(() => {
    const unique = new Set();
    transactions.forEach((t) => {
      if (t.category) unique.add(t.category);
    });
    return Array.from(unique);
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [useSameBudget, setUseSameBudget] = useState(true);

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

  // ✅ FETCH BUDGET FROM DB
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await getBudget(
          useSameBudget ? "default" : selectedMonth
        );

        if (res.data) {
          setBudgets(res.data.categories || {});
          setTotalBudget(res.data.totalBudget || 0);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchBudget();
  }, [selectedMonth, useSameBudget]);

  // ✅ HANDLERS
  const handleBudgetChange = (category, value) => {
    setBudgets({ ...budgets, [category]: parseFloat(value) || 0 });
  };

  const handleTotalChange = (value) => {
    setTotalBudget(parseFloat(value) || 0);
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
      alert("Budget saved successfully 🚀");
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ SUMMARY
  const totalSpent = Object.values(spent).reduce((a, b) => a + b, 0);
  const remainingTotal = totalBudget - totalSpent;

  return (
    <div className="budget-container">
      {/* HEADER */}
      <div className="budget-header">
        <h2>💰 Budget Dashboard</h2>

        {!editMode ? (
          <button className="btn-primary" onClick={() => setEditMode(true)}>
            Edit Budget
          </button>
        ) : (
          <div className="action-buttons">
            <button className="btn-primary" onClick={saveBudgets}>
              Save
            </button>
            <button className="btn-cancel" onClick={() => setEditMode(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* MONTH + TOGGLE */}
      <div className="budget-controls">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={useSameBudget}
            onChange={() => setUseSameBudget(!useSameBudget)}
          />
          Same budget for all months
        </label>
      </div>

      {/* SUMMARY */}
      <div className="budget-summary">
        <div className="budget-box total">
          <h4>Total</h4>
          <p>₹{totalBudget}</p>
        </div>

        <div className="budget-box spent">
          <h4>Spent</h4>
          <p>₹{totalSpent}</p>
        </div>

        <div className="budget-box remaining">
          <h4>Remaining</h4>
          <p>₹{remainingTotal}</p>
        </div>
      </div>

      {/* TOTAL BUDGET */}
      <div className="budget-total-card">
        <h3>Total Monthly Budget</h3>

        {editMode ? (
          <input
            type="number"
            value={totalBudget}
            onChange={(e) => handleTotalChange(e.target.value)}
          />
        ) : (
          <h1>₹ {totalBudget.toFixed(2)}</h1>
        )}
      </div>

      {/* CATEGORY GRID */}
      <div className="budget-grid">
        {categories.map((cat) => {
          const used = spent[cat] || 0;
          const limit = budgets[cat] || 0;

          const remaining = limit - used;
          const percent = limit ? (used / limit) * 100 : 0;
          const isOver = used > limit;

          return (
            <div
              key={cat}
              className={`budget-card ${isOver ? "over-budget" : ""}`}
            >
              <div className="card-header">
                <h4>{cat}</h4>
                <span className={isOver ? "danger-text" : ""}>
                  {percent.toFixed(0)}%
                </span>
              </div>

              {/* Budget */}
              {editMode ? (
                <input
                  type="number"
                  value={limit}
                  onChange={(e) =>
                    handleBudgetChange(cat, e.target.value)
                  }
                />
              ) : (
                <p className="amount">₹ {limit.toFixed(2)}</p>
              )}

              {/* Spent */}
              <p className="spent-text">
                Spent: ₹ {used.toFixed(2)}
              </p>

              {/* Remaining */}
              <p className={`remaining ${isOver ? "danger-text" : ""}`}>
                Remaining: ₹ {remaining.toFixed(2)}
              </p>

              {/* Progress */}
              <div className="progress">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>

              {/* Warning */}
              {isOver && (
                <p className="warning-text">
                  ⚠ Over Budget by ₹ {(used - limit).toFixed(2)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;