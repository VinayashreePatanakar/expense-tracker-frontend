import React from "react";

const TransactionList = ({ transactions, onDelete, onEdit }) => {
  return (
    <ul>
      {transactions.map((t) => (
        <li key={t._id} style={{ marginBottom: "0.5rem" }}>
          <span style={{ color: t.amount > 0 ? "green" : "red" }}>
            {t.text} : ${Math.abs(t.amount).toFixed(2)}
          </span>
          <button
            style={{ marginLeft: "1rem" }}
            onClick={() => onEdit(t)}
          >
            Edit
          </button>
          <button
            style={{ marginLeft: "0.5rem", color: "red" }}
            onClick={() => onDelete(t._id)}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TransactionList;
