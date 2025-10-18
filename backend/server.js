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

/* -------------------- 🔹 CORS -------------------- */
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || "*",
  "https://university-library-frontend.onrender.com", // your frontend URL
  "https://university-library.onrender.com", // backend URL
  "http://localhost:5173",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

/* -------------------- 🔹 BASIC SETUP -------------------- */
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = path.join(__dirname, "uploads");
const BOOKS_DB = path.join(__dirname, "books.json");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* -------------------- 🔹 HELPERS -------------------- */
const readDB = () => {
  try {
    if (!fs.existsSync(BOOKS_DB)) return {};
    const raw = fs.readFileSync(BOOKS_DB, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    console.error("readDB error", e);
    return {};
  }
};
const writeDB = (obj) => {
  try {
    fs.writeFileSync(BOOKS_DB, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.error("writeDB error", e);
  }
};

/* -------------------- 🔹 UPLOAD CONFIG -------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });
app.use("/uploads", express.static(UPLOAD_DIR));

/* -------------------- 🔹 EMAIL / OTP -------------------- */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter
  .verify()
  .then(() => console.log("✅ SMTP transporter verified"))
  .catch((err) => console.warn("⚠️ SMTP verify failed:", err?.message || err));

const otpStore = {};
const generateAndSendOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "University Portal"}" <${
      process.env.EMAIL_FROM || process.env.SMTP_USER
    }>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

/* -------------------- 🔹 OTP ENDPOINTS -------------------- */
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });
  try {
    await generateAndSendOtp(email);
    console.log(`OTP sent to ${email}`);
    res.json({ success: true, msg: "OTP sent" });
  } catch (err) {
    console.error("Email send error:", err.message);
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, error: "Email & OTP required" });
  const entry = otpStore[email];
  if (!entry) return res.json({ success: false, error: "Invalid or expired OTP" });
  if (Date.now() > entry.expiresAt) {
    delete otpStore[email];
    return res.json({ success: false, error: "OTP expired" });
  }
  if (entry.otp !== otp) return res.json({ success: false, error: "Invalid OTP" });
  delete otpStore[email];
  res.json({ success: true });
});

/* -------------------- 🔹 BOOK ROUTES -------------------- */
app.get("/api/books", (req, res) => res.json({ success: true, data: readDB() }));

app.post("/api/upload", upload.single("file"), (req, res) => {
  const { department, semester, title } = req.body;
  if (!department || !semester || !title || !req.file)
    return res.status(400).json({ success: false, error: "All fields required" });

  const db = readDB();
  const key = `${department}-sem${semester}`;
  const entry = {
    title,
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    uploadedAt: new Date().toISOString(),
  };
  db[key] = db[key] ? [...db[key], entry] : [entry];
  writeDB(db);
  res.json({ success: true, data: entry });
});

/* -------------------- 🔹 HEALTH CHECK -------------------- */
app.get("/", (req, res) => res.send("✅ Backend is live and running."));
app.get("/api/ping", (req, res) => res.json({ success: true, time: Date.now() }));

/* -------------------- 🔹 START SERVER -------------------- */
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on port ${PORT}`));
