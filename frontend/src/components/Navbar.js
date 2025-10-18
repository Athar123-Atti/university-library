import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ user, onLogout, theme, setTheme }) {
  const location = useLocation();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        background: theme === "dark" ? "#121212" : "#f8f9fa",
        color: theme === "dark" ? "#fff" : "#000",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Left: Logo */}
      <div style={{ fontWeight: "bold", fontSize: 20 }}>
        📚 University Library
      </div>

      {/* Center: Nav Links */}
      <div style={{ display: "flex", gap: 20 }}>
        <Link
          to="/quran"
          style={{
            textDecoration: "none",
            color:
              location.pathname === "/quran"
                ? theme === "dark"
                  ? "#4dabf7"
                  : "#007bff"
                : theme === "dark"
                ? "#ccc"
                : "#333",
            fontWeight: 600,
          }}
        >
          Quran
        </Link>

        <Link
          to="/library"
          style={{
            textDecoration: "none",
            color:
              location.pathname === "/library"
                ? theme === "dark"
                  ? "#4dabf7"
                  : "#007bff"
                : theme === "dark"
                ? "#ccc"
                : "#333",
            fontWeight: 600,
          }}
        >
          Library
        </Link>
      </div>

      {/* Right: Theme Toggle & User */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{
            background: "none",
            border: "1px solid #888",
            borderRadius: 8,
            padding: "4px 10px",
            cursor: "pointer",
            color: theme === "dark" ? "#fff" : "#000",
          }}
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>

        <div style={{ fontWeight: 600 }}>
          {user?.username || "User"}
        </div>

        <button
          onClick={onLogout}
          style={{
            background: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "5px 10px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
