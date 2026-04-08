import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL  || "http://localhost:5000/api",
});

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