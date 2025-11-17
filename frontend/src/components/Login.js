/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";

const backendURL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://clever-tuna.ngrok-free.app";

export default function Login({ onLogin }) {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState("login");
  const [signup, setSignup] = useState({ username: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [otpInput, setOtpInput] = useState("");
  const [tempUser, setTempUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🌌 Realistic Galaxy Background */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars = Array.from({ length: 250 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8,
      alpha: Math.random(),
      twinkle: Math.random() * 0.02 + 0.005,
    }));

    const shootingStars = [];

    const createShootingStar = () => {
      if (Math.random() < 0.03) {
        shootingStars.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.5,
          len: Math.random() * 80 + 100,
          speed: Math.random() * 10 + 12,
          angle: Math.random() * 0.5 - 0.25,
          alpha: 1,
        });
      }
    };

    function drawNebula() {
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        width / 1.2
      );
      gradient.addColorStop(0, "rgba(50,100,255,0.25)");
      gradient.addColorStop(0.5, "rgba(150,50,200,0.15)");
      gradient.addColorStop(1, "rgba(10,10,20,0.8)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      drawNebula();

      // Stars
      stars.forEach((s) => {
        s.alpha += s.twinkle * (Math.random() < 0.5 ? -1 : 1);
        if (s.alpha < 0.2) s.alpha = 0.2;
        if (s.alpha > 1) s.alpha = 1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Shooting stars
      shootingStars.forEach((ss, i) => {
        ctx.strokeStyle = `rgba(255,255,255,${ss.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.len, ss.y + ss.len * ss.angle);
        ctx.stroke();
        ss.x += ss.speed;
        ss.y -= ss.speed * ss.angle;
        ss.alpha -= 0.02;
        if (ss.alpha <= 0) shootingStars.splice(i, 1);
      });

      createShootingStar();
      requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* 📨 Signup → Send OTP */
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!signup.username || !signup.email || !signup.password)
      return setError("Please fill all fields.");

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(signup.email))
      return setError("Invalid email format. Please check your email.");

    try {
      setLoading(true);
      const res = await fetch(`${backendURL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signup.email }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setTempUser(signup);
        setMode("verify");
      } else setError(data.error || "Failed to send OTP.");
    } catch (err) {
      console.error("Signup error:", err);
      setLoading(false);
      setError("Server not reachable. Check backend or URL.");
    }
  };

  /* ✅ Verify OTP */
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const res = await fetch(`${backendURL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: tempUser.email, otp: otpInput }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        users.push({ ...tempUser });
        localStorage.setItem("users", JSON.stringify(users));
        onLogin({ username: tempUser.username, email: tempUser.email });
      } else setError(data.error || "Invalid OTP");
    } catch (err) {
      console.error("Verify error:", err);
      setLoading(false);
      setError("Verification failed. Server not reachable.");
    }
  };

  /* 🔐 Local Login */
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find(
      (u) => u.email === loginForm.email && u.password === loginForm.password
    );
    if (!found) return setError("Invalid credentials.");
    onLogin({ username: found.username, email: found.email });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />

      <div style={cardStyle}>
        <h2 style={headingStyle}>
          {mode === "login"
            ? "Welcome Back ✨"
            : mode === "signup"
            ? "Create Account 🚀"
            : "Verify OTP 🔐"}
        </h2>

        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <input
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              style={inputStyle}
            />
            {error && <div style={{ color: "tomato", marginBottom: 10 }}>{error}</div>}
            <button style={buttonStyle} type="submit">
              Login
            </button>
            <p style={{ marginTop: 15, fontSize: 13 }}>
              New here?{" "}
              <button style={linkStyle} onClick={() => setMode("signup")}>
                Sign Up
              </button>
            </p>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={handleSignup}>
            <input
              placeholder="Username"
              value={signup.username}
              onChange={(e) => setSignup({ ...signup, username: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Email"
              value={signup.email}
              onChange={(e) => setSignup({ ...signup, email: e.target.value })}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={signup.password}
              onChange={(e) => setSignup({ ...signup, password: e.target.value })}
              style={inputStyle}
            />
            {error && <div style={{ color: "tomato", marginBottom: 10 }}>{error}</div>}
            <button style={buttonStyle} type="submit">
              {loading ? "Sending..." : "Send OTP"}
            </button>
            <p style={{ marginTop: 15, fontSize: 13 }}>
              Already have an account?{" "}
              <button style={linkStyle} onClick={() => setMode("login")}>
                Login
              </button>
            </p>
          </form>
        )}

        {mode === "verify" && (
          <form onSubmit={handleVerify}>
            <p style={{ marginBottom: 10 }}>Check your email for OTP 📩</p>
            <input
              placeholder="Enter OTP"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              style={inputStyle}
            />
            {error && <div style={{ color: "tomato", marginBottom: 10 }}>{error}</div>}
            <button style={buttonStyle} type="submit">
              {loading ? "Verifying..." : "Verify & Register"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* 🎨 Styles */
const cardStyle = {
  position: "relative",
  zIndex: 2,
  width: 390,
  padding: "50px 40px",
  borderRadius: 25,
  backdropFilter: "blur(25px)",
  background: "rgba(255,255,255,0.05)",
  boxShadow: "0 0 60px rgba(100,150,255,0.35), inset 0 0 40px rgba(255,255,255,0.08)",
  color: "#fff",
  textAlign: "center",
};

const headingStyle = {
  marginBottom: 25,
  fontWeight: 700,
  fontSize: 28,
  color: "#87CEFA",
  textShadow: "0 0 25px rgba(135,206,250,0.8)",
};

const inputStyle = {
  width: "100%",
  padding: 14,
  marginBottom: 18,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  outline: "none",
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 500,
  boxShadow: "inset 0 0 10px rgba(135,206,250,0.25)",
};

const buttonStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 14,
  background: "linear-gradient(90deg,#5DADE2,#2E86C1,#1B4F72)",
  color: "#fff",
  border: 0,
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  boxShadow: "0 0 25px rgba(100,150,255,0.6)",
};

const linkStyle = {
  background: "none",
  border: 0,
  color: "#5DADE2",
  cursor: "pointer",
  fontWeight: 600,
  textShadow: "0 0 10px #3498DB",
};
