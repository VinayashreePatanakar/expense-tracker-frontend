import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import Transactions from "./Transactions";
import Reports from "./Reports";
import Profile from "./Profile";
import { getAllTransactions } from "../services/api";

const MainLayout = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);

  // ✅ Fetch ALL transactions once
  const fetchAllData = async () => {
    try {
      const res = await getAllTransactions();
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "transactions":
        return (
          <Transactions
            transactions={transactions}
            setTransactions={setTransactions}
            refreshAll={fetchAllData}
          />
        );
      case "reports":
        return <Reports transactions={transactions} />;
      case "profile":
        return <Profile />;
      default:
        return <Dashboard transactions={transactions} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          background: "#1f2937",
          color: "#fff",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: "30px" }}>Expense Tracker</h2>

        <div className="nav" onClick={() => setActivePage("dashboard")}>
          Dashboard
        </div>
        <div className="nav" onClick={() => setActivePage("transactions")}>
          Transactions
        </div>
        <div className="nav" onClick={() => setActivePage("reports")}>
          Reports
        </div>
        <div className="nav" onClick={() => setActivePage("profile")}>
          Profile
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px", background: "#f3f4f6" }}>
        {renderPage()}
      </div>
    </div>
  );
};

export default MainLayout;
