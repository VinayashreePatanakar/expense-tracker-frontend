import React, { useEffect, useState } from "react";
import { addTransaction, updateTransaction } from "../services/api";

const categories = ["General", "Food", "Transport", "Shopping", "Bills", "Others"];

const ExpenseForm = ({ refresh, editingTransaction, clearEditing, selectedDate }) => {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("General"); // ✅ state for category

  useEffect(() => {
    if (editingTransaction) {
      setText(editingTransaction.text);
      setAmount(String(Math.abs(editingTransaction.amount)));
      setType(editingTransaction.amount >= 0 ? "income" : "expense");
      setCategory(editingTransaction.category || "General"); // ✅ prefill category
    } else {
      setText("");
      setAmount("");
      setType("income");
      setCategory("General");
    }
  }, [editingTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || Number(amount) === 0) return alert("Invalid input");

    const finalAmount = type === "income" ? Number(amount) : -Number(amount);

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, {
          text,
          amount: finalAmount,
          date: selectedDate,
          category, // ✅ send selected category
        });
        clearEditing();
      } else {
        await addTransaction({ text, amount: finalAmount, date: selectedDate, category }); // ✅ send category
      }

      setText("");
      setAmount("");
      setType("income");
      setCategory("General");
      refresh();
    } catch (err) {
      console.error(err.response?.data || err);
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

      <div style={{ marginBottom: "0.5rem" }}>
        <label>Category: </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">
        {editingTransaction ? "Update" : "Add"} {type === "income" ? "Income" : "Expense"}
      </button>

      {editingTransaction && (
        <button type="button" onClick={clearEditing} style={{ marginLeft: "1rem" }}>
          Cancel
        </button>
      )}
    </form>
  );
};

export default ExpenseForm;
