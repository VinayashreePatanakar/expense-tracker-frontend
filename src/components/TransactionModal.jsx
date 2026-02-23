import React, { useState, useEffect } from "react";
import { addTransaction, updateTransaction } from "../services/api";

const categories = ["General", "Rent/Mortgage", "Food", "Utilities", "Entertainment", "Transportation", "Insurance", "Health care", "Shopping", "Clothing", "Bills", "Vacation", "Others"];

const TransactionModal = ({ close, setTransactions, editingData }) => {
const [form, setForm] = useState({
  text: "",
  amount: "",
  category: "General",
  type: "expense",
  mode: "debit",
  description: "",   // ✅ ADD THIS
});

    // Get local date in YYYY-MM-DD format
 const today = new Date();

const todayDate = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0"),
].join("-");

  const [selectedDate, setSelectedDate] = useState(todayDate);

useEffect(() => {
  if (editingData) {
    setForm({
      text: editingData.text,
      amount: Math.abs(editingData.amount),
      category: editingData.category,
      type: editingData.amount > 0 ? "income" : "expense",
      mode: editingData.mode || "debit",
      description: editingData.description || "",   // ✅
    });

    setSelectedDate(
      editingData.date
        ? editingData.date.split("T")[0]
        : todayDate
    );
  }
}, [editingData]);

  const handleSubmit = async () => {
    if (!form.text || !form.amount) return alert("Fill all fields");

    const finalAmount =
      form.type === "income"
        ? Number(form.amount)
        : -Number(form.amount);

const payload = {
  text: form.text,
  amount: finalAmount,
  category: form.category,
  mode: form.mode,
  description: form.description,   // ✅
  date: selectedDate,
};

    if (editingData) {
      const res = await updateTransaction(editingData._id, payload);
      console.log("Updated Response:", res.data);
      setTransactions((prev) =>
        prev.map((t) =>
          t._id === editingData._id ? res.data : t
        )
      );
    } else {
      const res = await addTransaction(payload);
      setTransactions((prev) => [...prev, res.data]);
    }

    close();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>New Transaction</h3>

        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="income"
              checked={form.type === "income"}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
            />
            Income
          </label>

          <label>
            <input
              type="radio"
              value="expense"
              checked={form.type === "expense"}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
            />
            Expense
          </label>
        </div>

        <input
          type="text"
          placeholder="Enter name"
          value={form.text}
          onChange={(e) =>
            setForm({ ...form, text: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Enter amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
        />

         <input
            type="date"
            value={selectedDate}
            max={todayDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />

        <select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

          <div className="radio-group">
          <label>
            <input
              type="radio"
              value="cash"
              checked={form.mode === "cash"}
              onChange={(e) =>
                setForm({ ...form, mode: e.target.value })
              }
            />
            Cash
          </label>

          <label>
            <input
              type="radio"
              value="debit"
              checked={form.mode === "debit"}
              onChange={(e) =>
                setForm({ ...form, mode: e.target.value })
              }
            />
            Debit Card
          </label>

          <label>
            <input
              type="radio"
              value="credit"
              checked={form.mode === "credit"}
              onChange={(e) =>
                setForm({ ...form, mode: e.target.value })
              }
            />
            Credit Card
          </label>

           <label>
            <input
              type="radio"
              value="swish"
              checked={form.mode === "swish"}
              onChange={(e) =>
                setForm({ ...form, mode: e.target.value })
              }
            />
            Swish
          </label>
        </div>

        <textarea
  placeholder="Enter description"
  value={form.description}
  onChange={(e) =>
    setForm({ ...form, description: e.target.value })
  }
/>

        <div className="modal-actions">
          <button className="btn-primary" onClick={handleSubmit}>
            {editingData ? "Update" : "Add"}
          </button>
          <button className="btn-cancel" onClick={close}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dateInput: {
    padding: "0.5rem",
    borderRadius: "12px",
    border: "1px solid #ccc",
    minWidth: "150px",
    textAlign: "center",
  },
};

export default TransactionModal;