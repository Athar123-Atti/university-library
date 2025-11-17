// backend/server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(express.json());

/* -------------------- 🔹 CORS FIX -------------------- */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://192.168.10.8:3000",
  "http://192.168.10.8:5173",
  process.env.FRONTEND_ORIGIN,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* -------------------- 🔹 CONFIG -------------------- */
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* -------------------- 🔹 EMAIL / OTP -------------------- */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter
  .verify()
  .then(() => console.log("✅ SMTP ready"))
  .catch((err) => console.warn("⚠️ SMTP verify failed:", err.message));

const otpStore = {};

app.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, error: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    await transporter.sendMail({
      from: `"E-Library" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    console.log(`📧 OTP sent to ${email}: ${otp}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ OTP send error:", err);
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
});

app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const entry = otpStore[email];
  if (!entry)
    return res.json({ success: false, error: "Invalid or expired OTP" });
  if (Date.now() > entry.expiresAt)
    return res.json({ success: false, error: "OTP expired" });
  if (entry.otp !== otp)
    return res.json({ success: false, error: "Invalid OTP" });
  delete otpStore[email];
  res.json({ success: true });
});

/* -------------------- 🔹 USER AUTH (TEMP) -------------------- */
const users = {};

app.post("/api/signup", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, error: "Email and password required" });

  if (users[email])
    return res.status(400).json({ success: false, error: "User already exists" });

  users[email] = { email, password };
  console.log(`🆕 New user registered: ${email}`);
  res.json({ success: true, message: "Signup successful" });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users[email];
  if (!user)
    return res.status(400).json({ success: false, error: "User not found" });
  if (user.password !== password)
    return res.status(400).json({ success: false, error: "Invalid credentials" });
  res.json({ success: true, message: "Login successful" });
});

/* -------------------- 🔹 FILE UPLOAD -------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${safeName}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

app.use("/uploads", express.static(UPLOAD_DIR));

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, error: "File required" });
  res.json({ success: true, filename: req.file.filename });
});

/* -------------------- 🔹 HEALTH CHECK -------------------- */
app.get("/", (req, res) => res.send("✅ University Library backend is live"));
app.get("/api/ping", (req, res) => res.json({ success: true, time: Date.now() }));

/* -------------------- 🔹 START SERVER -------------------- */
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
