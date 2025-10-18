// src/api.js

import axios from "axios";

// 🔹 Ye automatically decide karega kis URL se connect karna hai:
const api = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api" // 💻 Local backend (jab tum laptop pe run karte ho)
      : "https://university-library.onrender.com/api", // 🌐 Render backend (mobile / deployed)
});

export default api;
