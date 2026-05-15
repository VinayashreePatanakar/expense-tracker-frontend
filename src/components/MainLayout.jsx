import React, { useState, useEffect } from "react";
import "../App.css";
import Dashboard from "./Dashboard";
import Transactions from "./Transactions";
import Reports from "./Reports";
import Profile from "./Profile";
import { getAllTransactions } from "../services/api";
import '@fortawesome/fontawesome-free/css/all.min.css';

const MainLayout = ({ user: initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [activePage, setActivePage] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // ✅ GLOBAL DARK MODE (ONLY HERE)
  const [darkMode, setDarkMode] = useState(false);

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false); // Close mobile menu when switching to desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
  document.body.style.overflow = isMobileOpen ? "hidden" : "auto";
}, [isMobileOpen]);

  const renderPage = () => {
    switch (activePage) {
      case "transactions":
        return (
          <Transactions
            transactions={transactions}
            setTransactions={setTransactions}
            user={user}   // ✅ ADD THIS
            refreshAll={fetchAllData}
          />
        );
      case "reports":
        return <Reports transactions={transactions} user={user}/>;
      case "profile":
        return <Profile user={user} setUser={setUser} />;
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
      <div style={{ display: "flex", minHeight: "100vh" }}>

{/* Sidebar */}
<div
  className={`sidebar  ${collapsed ? "collapsed" : ""}  ${isMobileOpen ? "open" : ""}`}
  style={{
    background: darkMode ? "rgba(15, 23, 42, 0.98)" : "var(--sidebar-bg)",
    color: darkMode ? "#fff" : "var(--nav-text)",
    padding: "20px",
    marginTop: "0",
  }}
>

  {/* 🔥 COLLAPSE BUTTON (TOP RIGHT) */}
  <div className="sidebar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginTop: "0", marginBottom: "20px" }}>
    <h2
      className="sidebar-title"
      onClick={() => {
        setActivePage("dashboard");
        setIsMobileOpen(false);
      }}
      style={{ margin: 0 }}
    >
      {collapsed && !isMobileOpen ? "SS" : "SpendSync"}
    </h2>

    {isMobileOpen && isMobile ? (
      <button
        className="icon-btn close-sidebar-btn"
        onClick={() => setIsMobileOpen(false)}
        aria-label="Close sidebar"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    ) : (
      <button
        className="collapse-btn"
        onClick={() => {
          if (isMobile) {
            setIsMobileOpen(false);
          } else {
            setCollapsed(prev => !prev);
          }
        }}
      >
        <i
          className={`fa-solid ${collapsed ? "fa-bars" : "fa-xmark"}`}
          style={{ marginRight: "6px" }}
        ></i>
      </button>
    )}
  </div>

<div className="nav-container">   

<div
  className={`nav ${activePage === "dashboard" ? "active" : ""}`}
  onClick={() => {
  setActivePage("dashboard");
  setIsMobileOpen(false); // 👈 close on mobile
}}
>
  <i className="fa-solid fa-chart-line"></i>
  {(!collapsed || isMobile) && <span style={{ opacity: 0.8 }}>Dashboard</span>}
</div>

<div
  className={`nav ${activePage === "transactions" ? "active" : ""}`}
  onClick={() => {
  setActivePage("transactions");
  setIsMobileOpen(false); // 👈 close on mobile
}}
>
  <i className="fa-solid fa-receipt"></i>
  {(!collapsed || isMobile) && <span style={{ opacity: 0.8 }}>Transactions</span>}
</div>

<div
  className={`nav ${activePage === "reports" ? "active" : ""}`}
  onClick={() => {
  setActivePage("reports");
  setIsMobileOpen(false); // 👈 close on mobile
}}
>
  <i className="fa-solid fa-wallet"></i>
  {(!collapsed || isMobile) && <span style={{ opacity: 0.8 }}>Budget</span>}
</div>

<div
  className={`nav ${activePage === "profile" ? "active" : ""}`}
  onClick={() => {
  setActivePage("profile");
  setIsMobileOpen(false); // 👈 close on mobile
}}
>
  <i className="fa-solid fa-user"></i>
  {(!collapsed || isMobile) && <span style={{ opacity: 0.8 }}>Profile Settings</span>}
</div>
    </div>
  </div>

    {isMobileOpen && (
      <div
        className="sidebar-overlay open"
        onClick={() => setIsMobileOpen(false)}
      />
    )}

        {/* Main Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Navbar */}
          <div
            className="navbar-top"
            style={{
              height: "80px",
              backdropFilter: "blur(12px)",
              background: darkMode
                ? "rgba(15,23,42,0.7)"
                : "rgba(255, 255, 255, 0.12)",
              borderBottom: darkMode
                ? "1px solid rgba(255, 255, 255, 0.12)"
                : "1px solid rgba(0, 0, 0, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0",
              width:"100%",
            }}
          >
            {isMobile && (
            <button
  className="icon-btn"
  onClick={() => setIsMobileOpen(true)}
  style={{ marginRight: "-40px" }}
>
  <i className="fa-solid fa-bars"></i>
</button>
)}
            <div>
              <h3 style={{ margin: 10 }}>
                Welcome {user?.name}
              </h3>
            </div>

            <div className="nav-icons">

  {/* Theme Toggle */}
  <div className="tooltip-wrapper">
  <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
    <i className={`fa-solid ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
  </button>
  <span className="tooltip">
    {darkMode ? "Light Mode" : "Dark Mode"}
  </span>
</div>

  <div className="tooltip-wrapper"
  onClick={() => {
    setActivePage("profile");
    setIsMobileOpen(false);
  }}
  style={{ cursor: "pointer" }}
  >
  <div className="avatar">
  {user?.profilePic ? (
    <img
      src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${user.profilePic}`}
      alt="user"
    />
  ) : (
    <i className="fa-solid fa-user"></i>
  )}
</div>
  <span className="tooltip">{user?.name}</span>
</div>

  {/* Logout */}
<div className="tooltip-wrapper logout">
  <button
    className="icon-btn"
    onClick={() => {
      localStorage.clear();
      window.location.reload();
    }}
  >
    <i className="fa-solid fa-arrow-right-from-bracket"></i>
  </button>
  <span className="tooltip">Logout</span>
</div>

</div>
          </div>

          {/* Content */}
          <div className="page-wrapper">
  <div key={activePage} className="page-content">
    {renderPage()}
  </div>
</div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;