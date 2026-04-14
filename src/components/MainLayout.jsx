import React, { useState, useEffect } from "react";
import "../App.css";
import Dashboard from "./Dashboard";
import Transactions from "./Transactions";
import Reports from "./Reports";
import Profile from "./Profile";
import { getAllTransactions } from "../services/api";
import '@fortawesome/fontawesome-free/css/all.min.css';

const MainLayout = ({ user }) => {
  const [activePage, setActivePage] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);

  // ✅ GLOBAL DARK MODE (ONLY HERE)
  const [darkMode, setDarkMode] = useState(false);

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
        return (
          <Dashboard
            transactions={transactions}
            user={user}
            darkMode={darkMode}   // ✅ PASS HERE
          />
        );
    }
  };

  return (
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
      <div style={{ display: "flex", height: "105vh" }}>

        {/* Sidebar */}
        <div
          style={{
            width: "250px",
           background: darkMode ? "#1e293b" : "var(--sidebar-bg)",
            color: darkMode ? "#fff" : "var(--nav-text)",
            padding: "20px",
            marginTop: "-30px",   // 👈 move up
          }}
        >
          <h2 style={{ marginBottom: "30px" }}>Expense Tracker</h2>

          <div className={`nav ${activePage === "dashboard" ? "active" : ""}`} onClick={() => setActivePage("dashboard")}>
            Dashboard
          </div>
          <div className={`nav ${activePage === "transactions" ? "active" : ""}`} onClick={() => setActivePage("transactions")}>
            Transactions
          </div>
          <div className={`nav ${activePage === "reports" ? "active" : ""}`} onClick={() => setActivePage("reports")}>
            Budget
          </div>
          <div className={`nav ${activePage === "profile" ? "active" : ""}`} onClick={() => setActivePage("profile")}>
            Profile
          </div>
        </div>

        {/* Main Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Navbar */}
          <div
            style={{
              height: "50px",
              backdropFilter: "blur(12px)",
              background: darkMode
                ? "rgba(15,23,42,0.7)"
                : "rgba(255,255,255,0.6)",
              borderBottom: darkMode
                ? "1px solid #334155"
                : "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 30px",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>
                Welcome, {user?.name}
              </h3>
              <p style={{ color: darkMode ? "#94A3B8" : "#6b7280" }}>
                Here’s your financial overview
              </p>
            </div>

            <div className="nav-icons">

  {/* Theme Toggle */}
  <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
    <i className={`fa-solid ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
  </button>

  {/* Avatar */}
  <div className="avatar-wrapper">
    <div className="avatar">
      {user?.profileImage ? (
        <img src={user.profileImage} alt="user" />
      ) : (
        <i className="fa-solid fa-user"></i>
      )}
    </div>

    <div className="user-tooltip">
      <p><strong>{user?.name}</strong></p>
      <p>{user?.email}</p>
    </div>
  </div>

  {/* Logout */}
  <button
    className="icon-btn"
    onClick={() => {
      localStorage.clear();
      window.location.reload();
    }}
  >
    <i className="fa-solid fa-arrow-right-from-bracket"></i>
  </button>

</div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: "30px" }}>
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;