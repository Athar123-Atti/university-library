import React, { useState, useEffect, useRef } from "react";

// 🧩 Backend base URL auto-detect
const backendURL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://clever-tuna.ngrok-free.app";


export default function Login({ onLogin }) {
  const canvasRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const cardCanvasRef = useRef(null);

  const [mode, setMode] = useState("login"); // login | signup | verify
  const [signup, setSignup] = useState({ username: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  // eslint-disable-next-line no-unused-vars
  const [sentOtp, setSentOtp] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [tempUser, setTempUser] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 🌌 Background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.2,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random(),
      dAlpha: Math.random() * 0.02,
    }));

    const shootingStars = [];
    const createShootingStar = () => {
      if (Math.random() < 0.05) {
        shootingStars.push({
          x: Math.random() * width,
          y: (Math.random() * height) / 2,
          length: Math.random() * 150 + 100,
          speed: Math.random() * 12 + 12,
          angle: Math.random() * 0.3 + 0.7,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        star.alpha += star.dAlpha;
        if (star.alpha > 1) star.alpha = 1;
        if (star.alpha < 0) star.alpha = 0;
        star.x += star.dx;
        star.y += star.dy;
        if (star.x < 0 || star.x > width) star.dx *= -1;
        if (star.y < 0 || star.y > height) star.dy *= -1;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
        ctx.shadowColor = "white";
        ctx.shadowBlur = 10;
        ctx.fill();
      });

      shootingStars.forEach((s, i) => {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - s.length * Math.cos(s.angle),
          s.y - s.length * Math.sin(s.angle)
        );
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 25;
        ctx.shadowColor = "white";
        ctx.stroke();

        s.x += s.speed * Math.cos(s.angle);
        s.y += s.speed * Math.sin(s.angle);
        if (s.x > width || s.y > height) shootingStars.splice(i, 1);
      });

      createShootingStar();
      requestAnimationFrame(draw);
    };

    draw();
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 📨 Signup → Send OTP
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!signup.username || !signup.email || !signup.password) {
      setError("Please fill username, email and password.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${backendURL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signup.email }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setTempUser(signup);
       
        setMode("verify");
      } else {
        setError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      setLoading(false);
      setError("Server not running or mobile can't reach backend.");
    }
  };

  // ✅ Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!tempUser) return setError("No signup in progress.");
    try {
      setLoading(true);
      const res = await fetch(`${backendURL}/verify-otp`, {
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
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch {
      setLoading(false);
      setError("Verification failed. Check backend connection.");
    }
  };

  // 🔐 Login
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

  // 🌟 UI same as before
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg,#050505,#0f2027)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />

      <div
        className="login-card"
        style={{
          position: "relative",
          zIndex: 1,
          width: 370,
          borderRadius: 25,
          padding: "45px 35px",
          backdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.05)",
          boxShadow: "0 0 30px rgba(47,128,237,0.6),0 10px 40px rgba(0,0,0,0.5)",
          color: "#fff",
          textAlign: "center",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <h2 style={{ marginBottom: 30, fontWeight: 700, fontSize: 26, color: "#2f80ed" }}>
          {mode === "login" ? "Login" : mode === "signup" ? "Sign Up" : "Verify OTP"}
        </h2>

        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <input placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} style={neonInputStyle} />
            <input type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} style={neonInputStyle} />
            {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
            <button style={neonButtonStyle} type="submit">Login</button>
            <div style={{ marginTop: 12, fontSize: 13 }}>
              New user? <button style={linkStyle} onClick={() => { setMode("signup"); setError(""); }}>Sign up</button>
            </div>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={handleSignup}>
            <input placeholder="Username" value={signup.username} onChange={(e) => setSignup({ ...signup, username: e.target.value })} style={neonInputStyle} />
            <input placeholder="Email" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} style={neonInputStyle} />
            <input type="password" placeholder="Password" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} style={neonInputStyle} />
            {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
            {msg && <div style={{ color: "lightgreen", marginBottom: 8 }}>{msg}</div>}
            <button style={neonButtonStyle} type="submit">{loading ? "Sending..." : "Send OTP"}</button>
            <div style={{ marginTop: 12, fontSize: 13 }}>
              Already registered? <button style={linkStyle} onClick={() => { setMode("login"); setError(""); }}>Login</button>
            </div>
          </form>
        )}

        {mode === "verify" && (
          <form onSubmit={handleVerify}>
            <div style={{ marginBottom: 8 }}>OTP generated — check email.</div>
            <input placeholder="Enter OTP" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} style={neonInputStyle} />
            {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
            {msg && <div style={{ color: "lightgreen", marginBottom: 8 }}>{msg}</div>}
            <button style={neonButtonStyle} type="submit">{loading ? "Verifying..." : "Verify & Register"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

const neonInputStyle = {
  width: "100%",
  padding: 14,
  marginBottom: 18,
  borderRadius: 12,
  border: "none",
  outline: "none",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 500,
  boxShadow: "0 0 10px rgba(47,128,237,0.6), inset 0 0 6px rgba(47,128,237,0.3)",
  transition: "0.3s all",
  textShadow: "0 0 8px #2f80ed",
};

const neonButtonStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 14,
  background: "#2f80ed",
  color: "#fff",
  border: 0,
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  boxShadow: "0 0 10px #2f80ed,0 4px 15px rgba(0,0,0,0.3)",
  transition: "0.3s all",
};

const linkStyle = {
  background: "none",
  border: 0,
  color: "#2f80ed",
  cursor: "pointer",
  fontWeight: 600,
};
