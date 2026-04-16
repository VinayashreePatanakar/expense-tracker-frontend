import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { API } from "../services/api";

const Profile = () => {
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

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
    return `http://localhost:5000${user.profilePic}`; // 👈 HARD FIX
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
      </div>
    </div>
  );
};

export default Profile;