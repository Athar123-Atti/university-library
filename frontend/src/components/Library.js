/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-globals */
/* src/components/UniversityLibrary.js */
import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEPARTMENTS = [
  "Department of Computer Science",
  "Department of Information Technology",
  "Department of Software Engineering",
  "Department of Biological Sciences",
  "Department of Physics",
  "Department of Chemistry",
  "Department of Mathematics",
  "Department of Business Administration",
  "Department of Commerce",
  "Department of Economics",
  "Department of English",
  "Department of Urdu",
  "Department of Islamic Studies",
  "Department of Sports Sciences",
  "Department of Communication & Media Studies",
  "Department of Education",
  "Department of Psychology",
  "Department of Social Work",
  "Department of Sociology",
  "Department of International Relations",
];

const STORAGE_KEY = "universityBooks";
const ADMIN_KEY = "university_admin_authenticated";
const ADMIN_SECRET = "atti542399";

const BACKEND_ENABLED = true;
const BACKEND_URL = "http://localhost:5000";

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes + 1) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`;
};

export default function UniversityLibrary({ darkMode = false }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [semester, setSemester] = useState(null);

  const [backendBooks, setBackendBooks] = useState({});
  const [localBooks, setLocalBooks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });

  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(ADMIN_KEY) === "1");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");

  const [newBook, setNewBook] = useState({ title: "", pdfFile: null });
  const [semesterBookQuery, setSemesterBookQuery] = useState("");

  const keyFor = (dept, sem) => `${dept}-sem${sem}`;

  useEffect(() => {
    if (!BACKEND_ENABLED) return;
    const fetchBooks = async () => {
      try {
        const r = await fetch(`${BACKEND_URL}/api/books`);
        const j = await r.json();
        if (j?.success) setBackendBooks(j.data || {});
      } catch (e) {
        console.warn("Failed to reach backend, fallback to localStorage.", e);
      }
    };
    fetchBooks();
    const interval = setInterval(fetchBooks, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localBooks));
    } catch {}
  }, [localBooks]);

  const filteredDepartments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEPARTMENTS;
    return DEPARTMENTS.filter((d) => d.toLowerCase().includes(q));
  }, [query]);

  const tryAdminAuth = () => {
    setShowAdminModal(true);
    setAdminPassInput("");
  };

  const confirmAdminAuth = () => {
    if (adminPassInput === ADMIN_SECRET) {
      setIsAdmin(true);
      localStorage.setItem(ADMIN_KEY, "1");
      setShowAdminModal(false);
      alert("Admin unlocked.");
    } else alert("Incorrect password.");
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem(ADMIN_KEY);
  };

  const getRawList = (dept, sem) => {
    const key = keyFor(dept, sem);
    if (BACKEND_ENABLED && backendBooks && backendBooks[key]) return backendBooks[key];
    return localBooks[key] || [];
  };

  const addBook = async () => {
    if (!selected || !semester) return alert("Select department & semester");
    if (!newBook.title || !newBook.pdfFile) return alert("Provide title & file");

    if (BACKEND_ENABLED) {
      const fd = new FormData();
      fd.append("department", selected);
      fd.append("semester", semester);
      fd.append("title", newBook.title);
      fd.append("file", newBook.pdfFile);
      try {
        const r = await fetch(`${BACKEND_URL}/api/upload`, { method: "POST", body: fd });
        const j = await r.json();
        if (j?.success) {
          const r2 = await fetch(`${BACKEND_URL}/api/books`);
          const j2 = await r2.json();
          if (j2?.success) setBackendBooks(j2.data || {});
          setNewBook({ title: "", pdfFile: null });
          alert("Uploaded to server ✅");
        } else alert("Upload failed: " + (j.error || "unknown"));
      } catch (e) {
        console.error(e);
        alert("Failed to upload to server. Check backend.");
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const key = keyFor(selected, semester);
      const arr = localBooks[key] ? [...localBooks[key]] : [];
      const entry = {
        title: newBook.title,
        pdfData: dataUrl,
        uploadedAt: new Date().toISOString(),
        sizeBytes: newBook.pdfFile.size || 0,
      };
      setLocalBooks({ ...localBooks, [key]: [...arr, entry] });
      setNewBook({ title: "", pdfFile: null });
      alert("Saved locally (fallback).");
    };
    reader.readAsDataURL(newBook.pdfFile);
  };

  const deleteBook = async (index) => {
    if (!isAdmin) return;
    if (!confirm("Delete this book?")) return;

    if (BACKEND_ENABLED) {
      const key = keyFor(selected, semester);
      const list = backendBooks[key] || [];
      const entry = list[index];
      if (!entry?.filename) return alert("Cannot delete — entry missing filename on server.");
      try {
        const r = await fetch(`${BACKEND_URL}/api/book`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ department: selected, semester, filename: entry.filename }),
        });
        const j = await r.json();
        if (j?.success) {
          const r2 = await fetch(`${BACKEND_URL}/api/books`);
          const j2 = await r2.json();
          if (j2?.success) setBackendBooks(j2.data || {});
          alert("Deleted on server.");
        } else alert("Delete failed: " + (j.error || "unknown"));
      } catch (e) {
        console.error(e);
        alert("Failed to contact server");
      }
      return;
    }

    const key = keyFor(selected, semester);
    const arr = [...(localBooks[key] || [])];
    arr.splice(index, 1);
    setLocalBooks({ ...localBooks, [key]: arr });
    alert("Deleted locally.");
  };

  const filteredList = useMemo(() => {
    const q = semesterBookQuery.trim().toLowerCase();
    return q ? getRawList(selected, semester).filter((b) => (b.title || "").toLowerCase().includes(q)) : getRawList(selected, semester);
  }, [selected, semester, semesterBookQuery, backendBooks, localBooks]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // 🌈 Fully modern & stylish color palette
  const colors = {
    bgMain: darkMode ? "#0d111b" : "#f4f7ff",
    card: darkMode ? "#1f2135" : "#ffffff",
    primary: "#6366f1", // deep violet
    secondary: "#14b8a6", // teal
    danger: "#ef4444", // red
    hoverShadow: darkMode ? "0 15px 35px rgba(0,0,0,0.6)" : "0 15px 35px rgba(0,0,0,0.15)",
    inputBg: darkMode ? "#2b2f4c" : "#f1f5f9",
    semesterGradients: [
      ["#FF7F50", "#a6c1ee"],
      ["#ffecd2", "#fcb69f"],
      ["#cfd9df", "#e2ebf0"],
      ["#a1c4fd", "#c2e9fb"],
      ["#fdfbfb", "#ebedee"],
      ["#84fab0", "#8fd3f4"],
      ["#d9a7c7", "#fffcdc"],
      ["#ff9a9e", "#fecfef"],
    ],
    outlineGradient: ["#6ee7b7", "#3b82f6"],
  };

  return (
    <div style={{ minHeight: "100vh", padding: 20, fontFamily: "'Inter', sans-serif", background: colors.bgMain, color: darkMode ? "#e0e0e0" : "#111", transition: "all 0.3s" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>🎓 University Library</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search departments..."
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              minWidth: 200,
              border: "none",
              background: colors.inputBg,
              color: darkMode ? "#fff" : "#111",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              transition: "all 0.3s",
            }}
          />
          <button
            onClick={() => { setSelected(null); setSemester(null); setQuery(""); }}
            style={{ padding: "10px 14px", borderRadius: 12, background: colors.primary, color: "#fff", border: "none", cursor: "pointer", transition: "all 0.3s" }}
          >
            Reset
          </button>
          {!isAdmin ? (
            <button
              onClick={tryAdminAuth}
              style={{ padding: "10px 14px", borderRadius: 12, background: colors.secondary, color: "#fff", border: "none", cursor: "pointer", transition: "all 0.3s" }}
            >
              🔐 Admin
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontWeight: 500 }}>Admin</span>
              <button
                onClick={logoutAdmin}
                style={{ padding: "8px 12px", borderRadius: 12, background: colors.danger, color: "#fff", border: "none", cursor: "pointer" }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Departments */}
      {!selected ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}
        >
          <AnimatePresence>
            {filteredDepartments.map((d, i) => (
              <motion.div
                key={d}
                onClick={() => setSelected(d)}
                variants={cardVariants}
                whileHover={{ scale: 1.06, boxShadow: colors.hoverShadow }}
                style={{
                  padding: 22,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${colors.semesterGradients[i % 8][0]}, ${colors.semesterGradients[i % 8][1]})`,
                  cursor: "pointer",
                  color: "#111",
                  fontWeight: 600,
                  transition: "all 0.3s",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16 }}>{d}</div>
                <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Click to view semesters</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : !semester ? (
        <div>
          <button onClick={() => setSelected(null)} style={{ padding: "8px 12px", marginBottom: 12, borderRadius: 12, background: colors.primary, color: "#fff", border: "none", cursor: "pointer" }}>⬅ Back</button>
          <h3 style={{ fontSize: 22, marginBottom: 12 }}>{selected}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 16 }}>
            <motion.div
              key="outline"
              onClick={() => setSemester("outline")}
              variants={cardVariants}
              whileHover={{ scale: 1.05, boxShadow: colors.hoverShadow }}
              style={{
                padding: 18,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${colors.outlineGradient[0]}, ${colors.outlineGradient[1]})`,
                color: "#fff",
                cursor: "pointer",
                textAlign: "center",
                fontWeight: 600,
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              }}
            >
              📘 Course Outline
            </motion.div>
            {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
              <motion.div
                key={s}
                onClick={() => setSemester(s)}
                variants={cardVariants}
                whileHover={{ scale: 1.05, boxShadow: colors.hoverShadow }}
                style={{
                  padding: 18,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${colors.semesterGradients[s % 8][0]}, ${colors.semesterGradients[s % 8][1]})`,
                  color: "#111",
                  cursor: "pointer",
                  textAlign: "center",
                  fontWeight: 600,
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                }}
              >
                Semester {s}
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => setSemester(null)} style={{ padding: "8px 12px", marginBottom: 12, borderRadius: 12, background: colors.primary, color: "#fff", border: "none", cursor: "pointer" }}>⬅ Back</button>
          <h3 style={{ fontSize: 22, marginBottom: 12 }}>{selected} — {semester === "outline" ? "Course Outline" : `Semester ${semester}`}</h3>

          {/* Search & Add */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <input
              value={semesterBookQuery}
              onChange={(e) => setSemesterBookQuery(e.target.value)}
              placeholder="Search books..."
              style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: colors.inputBg, flex: "1 1 200px", color: darkMode ? "#fff" : "#111" }}
            />
            {isAdmin && (
              <>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook((b) => ({ ...b, title: e.target.value }))}
                  placeholder="Book title"
                  style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: colors.inputBg, flex: "1 1 150px", color: darkMode ? "#fff" : "#111" }}
                />
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setNewBook((b) => ({ ...b, pdfFile: e.target.files[0] }))}
                  style={{ borderRadius: 12 }}
                />
                <button
                  onClick={addBook}
                  style={{ padding: "10px 16px", borderRadius: 12, background: colors.secondary, color: "#fff", border: "none", cursor: "pointer" }}
                >
                  Upload
                </button>
              </>
            )}
          </div>

          {/* Books Grid */}
          <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            <AnimatePresence>
              {filteredList.map((b, i) => {
                const viewUrl = b.pdfData
                  ? URL.createObjectURL(new Blob([Uint8Array.from(atob(b.pdfData.split(",")[1]), (c) => c.charCodeAt(0))], { type: "application/pdf" }))
                  : b.filepath
                  ? `${BACKEND_URL}/${b.filepath}`
                  : "#";

                return (
                  <motion.div
                    key={i}
                    variants={cardVariants}
                    whileHover={{ scale: 1.03, boxShadow: colors.hoverShadow }}
                    style={{ padding: 16, borderRadius: 14, background: colors.card, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{b.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{formatBytes(b.sizeBytes)}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                      <a href={viewUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 10, background: colors.primary, color: "#fff", fontSize: 13, textDecoration: "none" }}>View PDF</a>
                      {isAdmin && (
                        <button onClick={() => deleteBook(i)} style={{ padding: "6px 0", flex: 1, borderRadius: 10, background: colors.danger, color: "#fff", fontSize: 13 }}>Delete</button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Admin Modal */}
      {showAdminModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{ background: colors.card, padding: 24, borderRadius: 16, minWidth: 300, display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Enter Admin Password</h3>
            <input
              type="password"
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ccc" }}
            />
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAdminModal(false)} style={{ padding: "6px 12px", borderRadius: 12 }}>Cancel</button>
              <button onClick={confirmAdminAuth} style={{ padding: "6px 12px", borderRadius: 12, background: colors.secondary, color: "#fff" }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
