import React, { useState, useEffect } from "react";
import "../App.css";
import { API } from "../services/api";
import { toast } from "react-toastify";

import FrontPage1 from "../images/FrontPage1.png";

const Register = ({ setUser, switchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [strength, setStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validate()) return;
    try {
       setLoading(true);

      const res = await API.post("/auth/register", {
        name,
        email,
        password,
      }); 

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || "User already exists");
    } finally {
      setLoading(false);
    }
  };

  const validate = (data = { name, email, password }) => {
    const newErrors = {};

    if (!data.name) {
      newErrors.name = "Name is required";
    }

    if (!data.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!data.password) {
      newErrors.password = "Password is required";
    } else if (data.password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (!password) {
      setStrength("");
      return;
    }

    let score = 0;

    if (password.length > 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) setStrength("weak");
    else if (score === 2 || score === 3) setStrength("medium");
    else setStrength("strong");
  }, [password]);

  useEffect(() => {
    validate();
  }, [name, email, password]);

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        
        {/* LEFT SIDE: DESIGN IMAGE PANEL */}
          <div 
            className="auth-image-side" 
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${FrontPage1})` }}
          >
          <div className="brand-logo">
            <span>SpendSync</span>
          </div>
        {/*   <div className="auth-carousel-text">
            <h3>Plan Today,<br />Secure Tomorrow</h3>
            <p>Set budgets, track real-time progress, and achieve your financial goals seamlessly.</p>
          </div> */}
          <div className="carousel-dots">
            <span className="dot"></span>
            <span className="dot active"></span>
            <span className="dot"></span>
          </div>
        </div>

        {/* RIGHT SIDE: AUTHENTICATION FORM */}
        <div className="auth-form-side">
          <div className="auth-form-header">
            <h2>Create Account</h2>
            <p className="switch-text">
              Already have an account? <span onClick={switchToLogin}>Login</span>
            </p>
          </div>

          <form onSubmit={handleRegister} className="auth-fields-stack">
            <div className="input-group">
              <input 
                type="text" 
                value={name} 
                required 
                placeholder="Full Name"
                onBlur={() => setTouched({ ...touched, name: true })} 
                autoFocus 
                onChange={(e) => {
                  setName(e.target.value);
                  validate({ name: e.target.value, email, password });
                }} 
              />
              {touched.name && errors.name && (
                <p className="error-text">{errors.name}</p>
              )}
            </div>

            <div className="input-group">
              <input 
                type="email" 
                value={email} 
                required 
                placeholder="Email address"
                onBlur={() => setTouched({ ...touched, email: true })} 
                onChange={(e) => {
                  setEmail(e.target.value);
                  validate({ name, email: e.target.value, password });
                }} 
              />
              {touched.email && errors.email && (
                <p className="error-text">{errors.email}</p>
              )}
            </div>

            <div className="input-group password-group">
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  required
                  placeholder="Enter your password"
                  onBlur={() => setTouched({ ...touched, password: true })}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validate({ name, email, password: e.target.value });
                  }}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="error-text">{errors.password}</p>
              )}
            </div>

            <div className="strength-container">
              <div className="strength-bar">
                <div className={`strength-fill ${strength}`}></div>
              </div>
              {strength && (
                <p className={`strength-text ${strength}`}>
                  Password is {strength}
                </p>
              )}
            </div>

            <button className="auth-btn" type="submit" disabled={loading || Object.keys(errors).length > 0}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};

export default Register;