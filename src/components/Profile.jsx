import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { API } from "../services/api";

const Profile = () => {
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef(null);

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

    {/* HEADER */}
    <div className="profile-header modern">
      <div className="avatar-upload">
        <img src={getProfileImage()} className="profile-avatar" />

        {editMode && (
          <>
            <label htmlFor="fileUpload" className="edit-icon">
              <i className="fa fa-camera"></i>
            </label>
            <input
              id="fileUpload"
              type="file"
              hidden
              onChange={(e) =>
                setUser({ ...user, profilePic: e.target.files[0] })
              }
            />
          </>
        )}
      </div>

      <div>
        <h2>{user.name}</h2>
        <p className="subtitle">{user.email}</p>
      </div>
    </div>

    {/* PERSONAL INFO */}
    <div className="profile-section">
      <div className="profile-card">
        <h3 className="card-title">Personal Information</h3>

        {!editMode ? (
          <button className="btn-primary" onClick={() => setEditMode(true)}>
            Edit
          </button>
        ) : (
          <div className="action-buttons">
            <button className="btn-cancel" onClick={() => setEditMode(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        )}
      </div>

      <div className="profile-grid">
        <div>
          <label>Name</label>
          <input
            name="name"
            value={user.name || ""}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            name="email"
            value={user.email || ""}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>

        <div>
          <label>Currency</label>
          <select
            name="currency"
            value={user.currency || "INR"}
            onChange={handleChange}
            disabled={!editMode}
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
          </select>
        </div>
      </div>
    </div>

    {/* PASSWORD SECTION */}
    <div className="profile-card password-card">
      <div className="card-header">
        <h3>🔐 Security</h3>
      </div>

      <div className="password-section">

        {/* CURRENT */}
        <div className="input-group">
          <label>Current Password</label>
          <div className="password-wrapper">
            <input
              type={showCurrent ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              name="currentPassword"
              onKeyUp={handleKeyEvent}
              onKeyDown={handleKeyEvent}
            />
            <i
              className={`fa ${showCurrent ? "fa-eye-slash" : "fa-eye"}`}
              onClick={() => setShowCurrent(!showCurrent)}
            />
          </div>
          {capsLock && <p className="caps-warning">Caps Lock is ON</p>}
        </div>

        {/* NEW */}
        <div className="input-group">
          <label>New Password</label>
          <div className="password-wrapper">
            <input
              type={showNew ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              name="newPassword"
            />
            <i
              className={`fa ${showNew ? "fa-eye-slash" : "fa-eye"}`}
              onClick={() => setShowNew(!showNew)}
            />
          </div>

          <div className="strength-bar">
            <div className={`strength-fill ${getStrengthClass(passwordData.newPassword)}`} />
          </div>

          <div className="password-actions">
            <small>Use strong password (A-Z, number, symbol)</small>
            <button onClick={generateStrongPassword} className="btn-secondary">
              Suggest
            </button>
          </div>
        </div>

        {/* CONFIRM */}
        <div className="input-group">
          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              name="confirmPassword"
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