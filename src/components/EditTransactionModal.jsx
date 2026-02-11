import React, { useState, useEffect } from "react";
import { addTransaction, updateTransaction } from "../services/api";

const ExpenseForm = ({ refresh, editingTransaction, clearEditing }) => {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income"); // "income" or "expense"

  // Pre-fill form when editing
  useEffect(() => {
    if (editingTransaction) {
      setText(editingTransaction.text);
      setAmount(Math.abs(editingTransaction.amount)); // show positive value
      setType(editingTransaction.amount >= 0 ? "income" : "expense");
    } else {
      setText("");
      setAmount("");
      setType("income");
    }
  }, [editingTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim() || Number(amount) === 0) return alert("Invalid input");

    // Convert amount: income positive, expense negative
    const finalAmount = type === "income" ? Number(amount) : -Number(amount);

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, {
          text,
          amount: finalAmount,
        });
        clearEditing();
      } else {
        await addTransaction({ text, amount: finalAmount });
      }

      // Reset form
      setText("");
      setAmount("");
      setType("income");
      refresh();
    } catch (err) {
      console.error("Error:", err.response?.data || err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter title..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Enter amount..."
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <div style={{ margin: "0.5rem 0" }}>
        <label>
          <input
            type="radio"
            name="type"
            value="income"
            checked={type === "income"}
            onChange={(e) => setType(e.target.value)}
          />
          Income
        </label>

        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            name="type"
            value="expense"
            checked={type === "expense"}
            onChange={(e) => setType(e.target.value)}
          />
          Expense
        </label>
      </div>

      <button type="submit">
        {editingTransaction ? "Update" : "Add"} {type === "income" ? "Income" : "Expense"}
      </button>

      {editingTransaction && (
        <button
          type="button"
          onClick={clearEditing}
          style={{ marginLeft: "1rem" }}
        >
          Cancel
        </button>
      )}
    </form>
  );
};

export default ExpenseForm;