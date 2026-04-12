import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error("❌ VITE_API_URL is missing!");
}

export const API = axios.create({
  baseURL: BASE_URL || "http://localhost:5000/api", // fallback for safety,
});

console.log("API URL:", BASE_URL);

// 🔥 Automatically attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = token;
  }

  return req;
});

// ---------------- Transactions ----------------

export const getTransactions = (date) =>
  API.get("/transactions", { params: { date } });

export const addTransaction = (data) =>
  API.post("/transactions", data);

export const deleteTransaction = (id) =>
  API.delete(`/transactions/${id}`);

export const updateTransaction = (id, data) =>
  API.put(`/transactions/${id}`, data);

export const getAllTransactions = () =>
  API.get("/transactions");