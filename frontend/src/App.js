import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import QuranSection from "./components/QuranSection";
import UniversityLibrary from "./components/Library";
import Navbar from "./components/Navbar";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("loggedUser");
    return u ? JSON.parse(u) : null;
  });

  const [theme, setTheme] = useState(() => localStorage.getItem("app_theme") || "light");

  useEffect(() => {
    localStorage.setItem("app_theme", theme);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme]);

  const handleLogin = (userObj) => {
    setUser(userObj);
    localStorage.setItem("loggedUser", JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("loggedUser");
  };

  return (
    <Router>
      {user ? (
        <>
          <Navbar user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme} />
          <main className="main-wrap">
            <Routes>
              <Route path="/quran" element={<QuranSection darkMode={theme === "dark"} />} />
              <Route path="/library" element={<UniversityLibrary darkMode={theme === "dark"} />} />
              <Route path="/*" element={<Navigate to="/quran" replace />} />
            </Routes>
          </main>
        </>
      ) : (
        <Routes>
          <Route path="/*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      )}
    </Router>
  );
}
