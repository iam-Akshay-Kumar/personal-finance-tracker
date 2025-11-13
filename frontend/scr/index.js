import axios from "axios";



// Backend base URL
const API_BASE = "http://127.0.0.1:8000/api/";

// Get token from localStorage
const getToken = () => localStorage.getItem("access_token");

// Axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization header automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
