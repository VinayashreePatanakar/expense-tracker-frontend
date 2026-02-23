import React from "react";

const TransactionList = ({ transactions, onDelete, onEdit }) => {
  return (
    <div style={styles.container}>
      {transactions.length === 0 && <p style={styles.empty}>No transactions yet ✨</p>}

      {transactions.map((t) => (
        <div key={t._id} style={styles.card}>
          <div>
            <h4 style={styles.title}>{t.text}</h4>
            <p style={{ ...styles.amount, color: t.amount > 0 ? "#2ecc71" : "#e74c3c" }}>
              {t.amount > 0 ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
            </p>
            <p style={styles.category}>Category: {t.category || "General"}</p> {/* ✅ show category */}
            <p style={styles.category}>Mode: {t.mode || "debit"}</p>
            <p style={styles.category}>Description: {t.description || "-"}</p>
          </div>

          <div style={styles.actions}>
            <button style={styles.editBtn} onClick={() => onEdit && onEdit(t)}>
              Edit
            </button>
            <button style={styles.deleteBtn} onClick={() => onDelete(t._id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: { marginTop: "1rem" },
  card: {
    background: "#ffffff",
    padding: "1rem",
    borderRadius: "16px",
    marginBottom: "0.8rem",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  title: { margin: 0, fontSize: "1rem" },
  amount: { margin: "0.3rem 0 0", fontWeight: "bold", fontSize: "1.1rem" },
  category: { margin: "0.3rem 0 0", fontSize: "0.9rem", color: "#555" }, // ✅ style
  actions: { display: "flex", gap: "0.5rem" },
  editBtn: {
    padding: "0.4rem 0.8rem",
    borderRadius: "8px",
    border: "none",
    background: "#74b9ff",
    color: "white",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "0.4rem 0.8rem",
    borderRadius: "8px",
    border: "none",
    background: "#ff7675",
    color: "white",
    cursor: "pointer",
  },
  empty: { textAlign: "center", color: "#aaa" },
};

export default TransactionList;
