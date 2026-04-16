import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { API } from "../services/api";

const Profile = () => {
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const [showCurrent, setShowCurrent] = useState(false);
const [showNew, setShowNew] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);
const [capsLock, setCapsLock] = useState(false);

const [passwordData, setPasswordData] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const getStrengthClass = (password) => {
  if (!password) return "";
  if (password.length < 6) return "weak";
  if (password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/))
    return "strong";
  return "medium";
};


const isPasswordValid =
  passwordData.currentPassword &&
  passwordData.newPassword.length >= 6 &&
  passwordData.newPassword === passwordData.confirmPassword;

  const handleKeyEvent = (e) => {
  setCapsLock(e.getModifierState("CapsLock"));
};

const generateStrongPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }

  setPasswordData({
    ...passwordData,
    newPassword: pass,
    confirmPassword: pass,
  });

  toast.success("Strong password generated!");
};

const handlePasswordChange = (e) => {
  setPasswordData({
    ...passwordData,
    [e.target.name]: e.target.value,
  });
};


const handleChangePassword = async () => {
  try {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
  return toast.error("Please fill all fields");
}

if (passwordData.newPassword.length < 6) {
  return toast.error("Password must be at least 6 characters");
}

if (passwordData.newPassword !== passwordData.confirmPassword) {
  return toast.error("Passwords do not match");
}

console.log("Sending:", {
  oldPassword: passwordData.currentPassword,
  newPassword: passwordData.newPassword,
});

    await API.put(`/users/change-password/${user._id}`, {
  oldPassword: passwordData.currentPassword,
  newPassword: passwordData.newPassword,
});

    toast.success("Password updated!");

    // ✅ reset fields
   setPasswordData({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

  } catch (err) {
    console.log("ERROR:", err.response?.data);
    toast.error(err.response?.data?.message || "Error updating password");
  }
};

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));

    if (userData?._id) {
      API.get(`/users/${userData._id}`)
        .then((res) => {
          setUser(res.data);
        })
        .catch(console.error);
    }
  }, []);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  /* ================= HANDLE SAVE ================= */
const handleSave = async () => {
  try {
    const formData = new FormData();

    formData.append("name", user.name);
    formData.append("email", user.email);
    formData.append("currency", user.currency);

    if (user.profilePic instanceof File) {
      formData.append("profilePic", user.profilePic);
    }

    const res = await API.put(`/users/${user._id}`, formData);

    console.log("UPDATED USER:", res.data);

    // ✅ FORCE STATE UPDATE
    setUser({ ...res.data });

    // ✅ UPDATE LOCAL STORAGE
    localStorage.setItem("user", JSON.stringify({
      ...JSON.parse(localStorage.getItem("user")),
      ...res.data
    }));

    setEditMode(false);

    // ✅ RE-FETCH FROM DB (VERY IMPORTANT FIX)
    const fresh = await API.get(`/users/${user._id}`);
    setUser(fresh.data);

    toast.success("Profile updated!");
  } catch (err) {
    console.error(err);
    toast.error("Update failed");
  }
};

  /* ================= PROFILE IMAGE ================= */
const getProfileImage = () => {
  if (user.profilePic instanceof File) {
    return URL.createObjectURL(user.profilePic);
  }

  if (user.profilePic) {
    return `${import.meta.env.VITE_API_URL.replace("/api", "")}${user.profilePic}`;
  }

  return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
};

useEffect(() => {
  console.log("USER STATE UPDATED:", user);
}, [user]); 

  return (
    <div className="profile-container">
      
      {/* PROFILE HEADER */}
      <div className="profile-header">
        <img src={getProfileImage()} className="profile-avatar" />

        {editMode && (
          <input
            type="file"
            onChange={(e) =>
              setUser({ ...user, profilePic: e.target.files[0] })
            }
          />
        )}

        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>

      {/* PERSONAL INFO */}
      <div className="profile-card">
        <h3>Personal Info</h3>

        <input
          name="name"
          value={user.name || ""}
          onChange={handleChange}
          disabled={!editMode}
        />

        <input
          name="email"
          value={user.email || ""}
          onChange={handleChange}
          disabled={!editMode}
        />

         {/* ✅ CURRENCY DROPDOWN */}
        <select
          name="currency"
          value={user.currency || "INR"}
          onChange={handleChange}
          disabled={!editMode}
        >
          <option value="INR">₹ INR</option>
          <option value="USD">$ USD</option>
        </select>

        {!editMode ? (
          <button onClick={() => setEditMode(true)}>Edit</button>
        ) : (
          <>
            <button onClick={() => setEditMode(false)}>Cancel</button>
            <button onClick={handleSave}>Save</button>
          </>
        )}

<div className="profile-card">
  <h3>🔐 Change Password</h3>

  {/* CURRENT PASSWORD */}
  <div className="input-group">
    <label>Current Password</label>
    <div className="password-wrapper">
      <input
        type={showCurrent ? "text" : "password"}
        value={passwordData.currentPassword}
        onChange={(e) =>
          setPasswordData({
            ...passwordData,
            currentPassword: e.target.value,
          })
        }
        onKeyUp={handleKeyEvent}
        onKeyDown={handleKeyEvent}
        placeholder="Enter current password"
      />
      <i
        className={`fa ${showCurrent ? "fa-eye-slash" : "fa-eye"}`}
        onClick={() => setShowCurrent(!showCurrent)}
      />
    </div>

    {capsLock && <p className="caps-warning">⚠️ Caps Lock is ON</p>}
  </div>

  {/* NEW PASSWORD */}
  <div className="input-group">
    <label>New Password</label>
    <div className="password-wrapper">
      <input
        type={showNew ? "text" : "password"}
        value={passwordData.newPassword}
        onChange={(e) =>
          setPasswordData({
            ...passwordData,
            newPassword: e.target.value,
          })
        }
        onKeyUp={handleKeyEvent}
        onKeyDown={handleKeyEvent}
        placeholder="Enter new password"
      />
      <i
        className={`fa ${showNew ? "fa-eye-slash" : "fa-eye"}`}
        onClick={() => setShowNew(!showNew)}
      />
    </div>

    {/* Strength */}
    <div className="strength-bar">
      <div
        className={`strength-fill ${getStrengthClass(
          passwordData.newPassword
        )}`}
      />
    </div>

    {/* Tooltip */}
    <small className="password-hint">
      Must include uppercase, number, symbol
    </small>

    {/* AI Suggestion */}
    <button className="btn-secondary" onClick={generateStrongPassword}>
      💡 Suggest Strong Password
    </button>
  </div>

  {/* CONFIRM PASSWORD */}
  <div className="input-group">
    <label>Confirm Password</label>
    <div className="password-wrapper">
      <input
        type={showConfirm ? "text" : "password"}
        value={passwordData.confirmPassword}
        onChange={(e) =>
          setPasswordData({
            ...passwordData,
            confirmPassword: e.target.value,
          })
        }
        placeholder="Confirm password"
      />
      <i
        className={`fa ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}
        onClick={() => setShowConfirm(!showConfirm)}
      />
    </div>

    {passwordData.confirmPassword &&
      passwordData.confirmPassword !== passwordData.newPassword && (
        <p className="error-text">Passwords do not match</p>
      )}
  </div>

  {/* BUTTON */}
  <button
    className="btn-primary full-btn"
    onClick={handleChangePassword}
    disabled={!isPasswordValid}
  >
    Update Password
  </button>
</div>
      </div>
    </div>
  );
};

export default Profile;