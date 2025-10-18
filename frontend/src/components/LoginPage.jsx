import React, { useState } from "react";

export default function LoginPage({ onLoginSuccess }) {
  const [step, setStep] = useState(1); // 1=signup, 2=otp, 3=login
  const [user, setUser] = useState({ email: "", phone: "", otp: "", password: "" });

  const handleSignup = (e) => {
    e.preventDefault();
    if (!user.email && !user.phone) return alert("Email ya Phone zaroori hai");
    setStep(2);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (user.otp === "1234") {
      alert("OTP Verified ✅");
      setStep(3);
    } else {
      alert("Galat OTP ❌ (try 1234)");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (user.password.length < 4) return alert("Password kam az kam 4 letters ka ho");
    alert("Login Successful ✅");
    onLoginSuccess(); // App.js me state change
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="bg-gray-800 bg-opacity-70 p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition hover:scale-[1.02]">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
          {step === 1 ? "Sign Up" : step === 2 ? "Verify OTP" : "Login"}
        </h1>

        {step === 1 && (
          <form onSubmit={handleSignup}>
            <input
              type="email"
              placeholder="Email"
              className="w-full mb-3 p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full mb-3 p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
              Get OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <input
              type="text"
              placeholder="Enter OTP (1234)"
              className="w-full mb-3 p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => setUser({ ...user, otp: e.target.value })}
            />
            <button className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg transition">
              Verify OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Set Password"
              className="w-full mb-3 p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
            <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
              Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
