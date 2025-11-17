// src/api.js
import axios from "axios";

// 🔹 Auto-detect correct API base URL
const baseURL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : `http://${window.location.hostname}:5000/api`);

console.log("📡 Using API baseURL:", baseURL);

const api = axios.create({
  baseURL,
  timeout: 15000,
});

export default api;
