import React, { useState, useEffect } from "react";
import MainLayout from "./components/MainLayout";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";

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
      <div>
        {showRegister ? (
          <>
            <Register setUser={setUser} />
            <p onClick={() => setShowRegister(false)}>Already have account? <span className="login-btn">Login</span></p>
          </>
        ) : (
          <>
            <Login setUser={setUser} />
            <p onClick={() => setShowRegister(true)}>Create new account? <span className="register-btn" >Register</span></p>
          </>
        )}
      </div>
    );
  }

  return <MainLayout />;
}

export default App;