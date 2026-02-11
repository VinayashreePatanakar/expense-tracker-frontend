import React, { useEffect, useState } from "react";
import ExpenseForm from "./components/ExpenseForm";
import TransactionList from "./components/TransactionList";
import EditTransactionModal from "./components/EditTransactionModal";
import { getTransactions, addTransaction, deleteTransaction, updateTransaction } from "./services/api";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Calculate totals
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const total = income + expense;

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      setTransactions(res.data);
    } catch (err) {
      console.error("Fetch Error:", err.response?.data || err);
    }
  };

  // Delete transaction
  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      fetchTransactions();
    } catch (err) {
      console.error("Delete Error:", err.response?.data || err);
    }
  };

  // Open edit modal
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
  };

  // Close edit modal
  const handleCloseModal = () => {
    setEditingTransaction(null);
  };

  // Update transaction
  const handleUpdate = async (id, updatedData) => {
    try {
      await updateTransaction(id, updatedData);
      fetchTransactions();
      handleCloseModal();
    } catch (err) {
      console.error("Update Error:", err.response?.data || err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTransactions();
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      <h1>Expense Tracker</h1>

      <div style={{ marginBottom: "1rem" }}>
        <h2>Total Balance: ${total.toFixed(2)}</h2>
        <h3 style={{ color: "green" }}>Income: ${income.toFixed(2)}</h3>
        <h3 style={{ color: "red" }}>Expense: ${expense.toFixed(2)}</h3>
      </div>

      {/* Add transaction form */}
      <ExpenseForm
  refresh={fetchTransactions}
  editingTransaction={editingTransaction}
  clearEditing={() => setEditingTransaction(null)}
/>

<TransactionList
  transactions={transactions}
  onDelete={handleDelete}
  onEdit={handleEdit} // sets the editingTransaction state
/>
    </div>
  );
}

export default App;
