import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  /* =========================
     Fetch User Data
  ========================== */
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (userData && userData._id && token) {
      axios
        .get(`http://localhost:5000/api/users/${userData._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch((err) => console.error(err));
    }
  }, []);

  /* =========================
     Handle Input Change
  ========================== */
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  /* =========================
     Save Profile
  ========================== */
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        user,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(res.data);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     Change Password
  ========================== */
  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/users/change-password/${user._id}`,
        passwordData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>👤 Profile Settings</h2>

      {/* Name */}
      <input
        type="text"
        name="name"
        value={user.name || ""}
        onChange={handleChange}
        disabled={!editMode}
        placeholder="Name"
        style={inputStyle}
      />

      {/* Email */}
      <input
        type="email"
        name="email"
        value={user.email || ""}
        onChange={handleChange}
        disabled={!editMode}
        placeholder="Email"
        style={inputStyle}
      />

      {!editMode ? (
        <button style={buttonStyle} onClick={() => setEditMode(true)}>
          Edit Profile
        </button>
      ) : (
        <button style={buttonStyle} onClick={handleSave}>
          Save Profile
        </button>
      )}

      <hr style={{ margin: "30px 0" }} />

      {/* Change Password */}
      <h3>🔐 Change Password</h3>

      <input
        type={showPassword ? "text" : "password"}
        name="currentPassword"
        placeholder="Current Password"
        value={passwordData.currentPassword}
        onChange={handlePasswordChange}
        style={inputStyle}
      />

      <input
        type={showPassword ? "text" : "password"}
        name="newPassword"
        placeholder="New Password"
        value={passwordData.newPassword}
        onChange={handlePasswordChange}
        style={inputStyle}
      />

      <div style={{ marginBottom: "10px" }}>
        <input
          type="checkbox"
          onChange={() => setShowPassword(!showPassword)}
        />{" "}
        Show Password
      </div>

      <button style={buttonStyle} onClick={handleChangePassword}>
        Update Password
      </button>
    </div>
  );
};

/* =========================
   Styles
========================= */
const containerStyle = {
  maxWidth: "500px",
  margin: "auto",
  background: "#fff",
  padding: "30px",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "10px",
  width: "100%",
  backgroundColor: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default Profile;
