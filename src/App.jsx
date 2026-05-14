import React, { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import MainLayout from "./components/MainLayout";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return (
      <>
        {showRegister ? (
          <Register
            setUser={setUser}
            switchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login
            setUser={setUser}
            switchToRegister={() => setShowRegister(true)}
          />
        )}

        <ToastContainer position="top-right" autoClose={2000} />
      </>
    );
  }

  return (
    <>
      <MainLayout user={user} />
      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}

export default App;