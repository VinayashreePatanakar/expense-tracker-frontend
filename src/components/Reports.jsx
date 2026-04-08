import React, { useState, useEffect } from "react";

const Reports = () => {
  const [budgets, setBudgets] = useState({});
  const [totalBudget, setTotalBudget] = useState(0);
  const [editMode, setEditMode] = useState(false);

  const categories = ["Food", "Transport", "Entertainment", "Utilities", "General"];

  useEffect(() => {
    const storedBudgets = localStorage.getItem("budgets");
    const storedTotal = localStorage.getItem("totalBudget");
    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    }
    if (storedTotal) {
      setTotalBudget(parseFloat(storedTotal));
    }
  }, []);

  const handleBudgetChange = (category, value) => {
    setBudgets({ ...budgets, [category]: parseFloat(value) || 0 });
  };

  const handleTotalChange = (value) => {
    setTotalBudget(parseFloat(value) || 0);
  };

  const saveBudgets = () => {
    localStorage.setItem("budgets", JSON.stringify(budgets));
    localStorage.setItem("totalBudget", totalBudget.toString());
    setEditMode(false);
    alert("Budgets saved!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Budget Settings</h2>

      {!editMode ? (
        <div>
          <h3>Total Monthly Budget: ${totalBudget.toFixed(2)}</h3>
          <h3>Category Budgets:</h3>
          <ul>
            {categories.map((cat) => (
              <li key={cat}>
                {cat}: ${budgets[cat] ? budgets[cat].toFixed(2) : "0.00"}
              </li>
            ))}
          </ul>
          <button onClick={() => setEditMode(true)}>Edit Budgets</button>
        </div>
      ) : (
        <div>
          <h3>Set Total Monthly Budget:</h3>
          <input
            type="number"
            value={totalBudget}
            onChange={(e) => handleTotalChange(e.target.value)}
            placeholder="Total Budget"
          />

          <h3>Set Budgets per Category:</h3>
          {categories.map((cat) => (
            <div key={cat} style={{ marginBottom: "10px" }}>
              <label>{cat}: </label>
              <input
                type="number"
                value={budgets[cat] || ""}
                onChange={(e) => handleBudgetChange(cat, e.target.value)}
                placeholder="Budget amount"
              />
            </div>
          ))}

          <button onClick={saveBudgets}>Save Budgets</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Reports;
