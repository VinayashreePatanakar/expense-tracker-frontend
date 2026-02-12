import axios from "axios";

const API_URL = "http://localhost:5000/api/transactions";

export const getTransactions = (date) => axios.get(API_URL, { params: { date } });
export const addTransaction = (data) => {return axios.post(API_URL, data)};
export const deleteTransaction = (id) => axios.delete(`${API_URL}/${id}`);
export const updateTransaction = (id, data) => axios.put(`${API_URL}/${id}`, data);