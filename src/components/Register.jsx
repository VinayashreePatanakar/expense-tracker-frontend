import React, { useState, useEffect } from "react";
import "../App.css";
import { API } from "../services/api";
import { toast } from "react-toastify";

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

      // Auto login after register
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
      <div className="auth-glass">
        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <input type="text" value={name} required onBlur={() => setTouched({ ...touched, name: true })} autoFocus onChange={(e) => {
  setName(e.target.value);
  validate({ name: e.target.value, email, password });
}} />
            <label>Name</label>
            {touched.name && errors.name && (
              <p className="error-text">{errors.name}</p>
            )}
          </div>

          <div className="input-group">
            <input type="email" value={email} required onBlur={() => setTouched({ ...touched, email: true })} onChange={(e) => {
  setEmail(e.target.value);
  validate({ name, email: e.target.value, password });
}} />
            <label>Email</label>
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
              <label>Password</label>
            </div>
            {touched.password && errors.password && (
              <p className="error-text">{errors.password}</p>
            )}
          </div>

          <div className="strength-bar">
            <div className={`strength-fill ${strength}`}></div>
          </div>

          <p className={`strength-text ${strength}`}>
            {strength && `Password is ${strength}`}
          </p>

          <button className="auth-btn" type="submit" disabled={loading || Object.keys(errors).length > 0}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="switch-text">
          Already have an account?{" "}
          <span onClick={switchToLogin}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Register;