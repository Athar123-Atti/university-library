// backend/server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.json());

// CORS: allow all for now; for production restrict to your frontend domain (set via env FRONTEND_ORIGIN)
const frontendOrigin = process.env.FRONTEND_ORIGIN || "*";
app.use(cors({ origin: frontendOrigin }));

const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = path.join(__dirname, "uploads");
const BOOKS_DB = path.join(__dirname, "books.json");

// ensure upload dir
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// simple JSON file storage helpers
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

// multer config: store files in uploads with timestamp prefix
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    const name = `${Date.now()}_${safe}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
});

// Serve uploaded files statically at /uploads
app.use("/uploads", express.static(UPLOAD_DIR));

/* -------------------- 🔹 EMAIL / OTP -------------------- */
/**
 * SMTP config (set these in Render environment variables):
 * - SMTP_USER (email or username)
 * - SMTP_PASS (app password or SMTP password / API key)
 * - SMTP_HOST (optional, e.g. smtp.gmail.com or smtp.sendgrid.net)
 * - SMTP_PORT (optional, e.g. 465 or 587)
 * - SMTP_SECURE (optional, "true" or "false")
 *
 * Recommended: use SendGrid / Mailgun / Postmark in production.
 * If using Gmail, enable 2FA and create an App Password. Put it in SMTP_PASS.
 */

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : true;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// quick verify transporter (log any errors but continue)
transporter.verify().then(() => {
  console.log("✅ SMTP transporter verified");
}).catch((err) => {
  console.warn("⚠️ SMTP transporter verify failed - emails may not send:", err && err.message ? err.message : err);
});

// OTP store: { email: { otp: '123456', expiresAt: Date } }
const otpStore = {};

// helper to generate OTP and send email
const generateAndSendOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const ttlMs = 5 * 60 * 1000; // 5 minutes
  otpStore[email] = { otp, expiresAt: Date.now() + ttlMs };

  const fromName = process.env.EMAIL_FROM_NAME || "University Portal";
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    html: `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
  return otp;
};

// endpoint: send otp
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  try {
    await generateAndSendOtp(email);
    console.log(`OTP generated & emailed to ${email}`);
    return res.json({ success: true, msg: "OTP sent to email" });
  } catch (err) {
    console.error("Email send error:", err && err.message ? err.message : err);
    return res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
});

// endpoint: verify otp
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, error: "Email & OTP required" });

  const entry = otpStore[email];
  if (!entry) return res.json({ success: false, error: "Invalid or expired OTP" });
  if (Date.now() > entry.expiresAt) {
    delete otpStore[email];
    return res.json({ success: false, error: "OTP expired" });
  }
  if (entry.otp.toString() !== otp.toString()) {
    return res.json({ success: false, error: "Invalid OTP" });
  }

  // success
  delete otpStore[email];
  return res.json({ success: true });
});

/* -------------------- 🔹 BOOK UPLOAD SYSTEM -------------------- */

/**
 * GET /api/books
 */
app.get("/api/books", (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db });
});

/**
 * POST /api/upload
 */
app.post("/api/upload", upload.single("file"), (req, res) => {
  const { department, semester, title } = req.body;
  if (!department || !semester || !title || !req.file) {
    if (req.file && req.file.path) fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, error: "department, semester, title and file are required" });
  }

  const db = readDB();
  const key = `${department}-sem${semester}`;
  const entry = {
    title,
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    uploadedAt: new Date().toISOString(),
    sizeBytes: req.file.size || 0,
  };
  db[key] = db[key] ? [...db[key], entry] : [entry];
  writeDB(db);

  return res.json({ success: true, data: entry });
});

/**
 * DELETE /api/book
 */
app.delete("/api/book", (req, res) => {
  const { department, semester, filename } = req.body;
  if (!department || !semester || !filename) {
    return res.status(400).json({ success: false, error: "department, semester and filename required" });
  }
  const db = readDB();
  const key = `${department}-sem${semester}`;
  const list = db[key] || [];
  const idx = list.findIndex((b) => b.filename === filename);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "File not found in DB" });
  }

  const filePath = path.join(UPLOAD_DIR, filename);
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) { console.error("unlink", e); }

  list.splice(idx, 1);
  db[key] = list;
  writeDB(db);

  return res.json({ success: true });
});

/* -------------------- 🔹 HEALTH CHECK -------------------- */
app.get("/api/ping", (req, res) => res.json({ success: true, time: Date.now() }));

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
