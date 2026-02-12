import React, { useEffect, useState } from "react";
import TransactionList from "./components/TransactionList";
import ExpenseForm from "./components/ExpenseForm";
import Dashboard from "./components/Dashboard";
import { getTransactions, addTransaction, deleteTransaction, updateTransaction } from "./services/api";

function App() {
  const [transactions, setTransactions] = useState([]);

  const income = transactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
  const total = income + expense;

  const [editingTransaction, setEditingTransaction] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

const fetchTransactions = async () => {
  try {
    const res = await getTransactions(selectedDate);
    setTransactions(res.data);
  } catch (err) {
    console.error(err);
  }
};

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    fetchTransactions();
  };

  const handleUpdate = async (id, updatedData) => {
    await updateTransaction(id, updatedData);
    fetchTransactions();
  };

  const handleAdd = async (data) => {
    await addTransaction(data);
    fetchTransactions();
  };

  const handleEdit = (transaction) => {
  setEditingTransaction(transaction);
};

useEffect(() => {
  fetchTransactions();
}, [selectedDate]);

// If the currently editing transaction was deleted, clear the form
useEffect(() => {
  if (
    editingTransaction &&
    !transactions.find((t) => t._id === editingTransaction._id)
  ) {
    setEditingTransaction(null);
  }
}, [transactions, editingTransaction]);


  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", fontFamily: "'Poppins', sans-serif", color: "#333" }}>
      <h1 style={{ textAlign: "center", color: "#ff7f50" }}>Expense Tracker</h1>
      <h2>Hello Vinayashree(make_name_automatic)</h2>
      <h4>Welcome back</h4>
      <div style={{
        background: "#fff9f3",
        padding: "1rem",
        borderRadius: "12px",
        boxShadow: "2px 2px 15px rgba(0,0,0,0.05)",
        marginBottom: "1rem",
        textAlign: "center"
      }}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Select Date: </label>
          <input
            type="date"
            value={selectedDate}
            max={new Date().toISOString().split("T")[0]} // 🔥 THIS LINE
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "0.4rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <h2>Total Balance: ${total.toFixed(2)}</h2>
        <h3 style={{ color: "#2b7a2b" }}>Income: ${income.toFixed(2)}</h3>
        <h3 style={{ color: "#7a2b2b" }}>Expense: ${expense.toFixed(2)}</h3>
      </div>

      <Dashboard transactions={transactions} />

      <ExpenseForm
        refresh={fetchTransactions}
        selectedDate={selectedDate}
        editingTransaction={editingTransaction}
        clearEditing={() => setEditingTransaction(null)}
      />
      <TransactionList
        transactions={transactions}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onEdit={handleEdit}   // ✅ THIS MUST EXIST
      />
    </div>
  );
}

export default App;