import React, { useState, useEffect } from "react";
import { UserRoundKey } from 'lucide-react';
import "../App.css";
import { API } from "../services/api";
import { toast } from "react-toastify";
import { signInWithPopup } from "firebase/auth";
import { getRedirectResult } from "firebase/auth";
import { auth, provider } from "../config/firebase";

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
      setLoading(true); // ✅ START LOADING

const res = await API.post("/auth/login", {
        email,
        password,
      });
      console.log({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);

    } catch (err) {
    toast.error(err.response?.data?.message || "Invalid credentials"); // ✅ toast
  } finally {
    setLoading(false); // ✅ STOP LOADING
  }
  };

  const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    // OPTIONAL: send to backend
    // await API.post("/auth/google", { email: user.email });

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
      <div className="auth-glass">
        <h2>Welcome Back</h2>

        <div className="input-group">
          <input
  type="email"
  required
  autoFocus
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
          <label>Email</label>
        </div>

        <div className="input-group password-group">
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              required
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
            <label>Password</label>
          </div>
        </div>

        <button
  className="auth-btn"
  onClick={handleLogin}
  disabled={loading || Object.keys(errors).length > 0}
>
  {loading ? "Logging in..." : "Login"}
</button>

        <button className="google-btn" onClick={handleGoogleLogin}>
          Continue with Google
        </button>

        <p className="switch-text">
          Don’t have an account? <span onClick={switchToRegister}>Register</span>
        </p>
      </div>
    </div>
  );
};

export default Login;