import React, { useState, useEffect } from "react";
import { UserRoundKey } from 'lucide-react';
import "../App.css";
import { API } from "../services/api";
import { toast } from "react-toastify";
import { signInWithPopup } from "firebase/auth";
import { getRedirectResult } from "firebase/auth";
import { auth, provider } from "../config/firebase";

import FrontPage4 from "../images/FrontPage4.png"; // Adjust the number based on which image you want

const Login = ({ setUser, switchToRegister  }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getRedirectResult(auth);
      if (result) {
        const user = result.user;
        console.log(user);
      }
    };

    fetchUser();
  }, []);

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email,
        password,
      });
      console.log({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);

    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      setUser({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      });

    } catch (err) {
      toast.error("Google login failed");
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validate();
  }, [email, password]);

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* LEFT SIDE: DESIGN IMAGE PANEL */}
          <div 
            className="auth-image-side" 
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${FrontPage4})` }}
          >
          <div className="brand-logo">
            <UserRoundKey size={28} />
            <span>SpendSync</span>
          </div>
         {/*  <div className="auth-carousel-text">
            <h3>Smart Spending,<br />Better Future</h3>
            <p>Track, analyze, and manage your expenses with absolute ease.</p>
          </div> */}
          <div className="carousel-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>

        {/* RIGHT SIDE: AUTHENTICATION FORM */}
        <div className="auth-form-side">
          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p className="switch-text">
              Don’t have an account? <span onClick={switchToRegister}>Register</span>
            </p>
          </div>

          <div className="auth-fields-stack">
            <div className="input-group">
              <input
                type="email"
                required
                autoFocus
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group password-group">
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <button
              className="auth-btn"
              onClick={handleLogin}
              disabled={loading || Object.keys(errors).length > 0}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="divider">
              <span>Or register with</span>
            </div>

            <div className="social-auth-row">
              <button className="google-btn" onClick={handleGoogleLogin}>
                <i className="fa-brands fa-google"></i> Google
              </button>
              <button className="apple-btn" type="button">
                <i className="fa-brands fa-apple"></i> Apple
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;