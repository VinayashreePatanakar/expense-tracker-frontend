import React, { useState, useEffect } from "react";
import { LayoutDashboard, CreditCard, UserRoundPen, ArrowLeftRight, BarChart3, User, LogOut } from "lucide-react";
import Dashboard from "./Dashboard";
import Transactions from "./Transactions";
import Reports from "./Reports";
import Profile from "./Profile";
import { getAllTransactions } from "../services/api";

const MainLayout = ({ user} ) => {
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
        return <Dashboard transactions={transactions} user={user}/>;
    }
  };

  return (
  <div style={{ display: "flex", height: "100vh", background: "#f3f4f6" }}>
    
    {/* Sidebar */}
    <div
      style={{
        width: "220px",
        background: "#111827",
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

    {/* Main Area */}
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

      {/* ✅ Glass Navbar */}
      <div
        style={{
          height: "70px",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "rgba(255,255,255,0.6)",
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 30px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <h3 style={{ margin: 0 }}>Welcome, {user?.name}</h3>

        {/* Profile Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          
          {/* Avatar Circle */}
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#2563eb",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Logout
          </button>

        </div>
      </div>

      {/* Page Content */}
      <div style={{ flex: 1, padding: "30px" }}>
        {renderPage()}
      </div>

    </div>
  </div>
);
};

export default MainLayout;
