/* eslint-disable no-restricted-globals */
/* src/components/UniversityLibrary.js */
import React, { useMemo, useState, useEffect } from "react";

/*
  This version integrates with the backend upload service.
  - Set BACKEND_ENABLED true to enable server-backed storage.
  - BACKEND_URL should point to backend server (e.g. http://localhost:5000)
  - If backend is down, component falls back to localStorage mode ("universityBooks" key).
*/

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

const STORAGE_KEY = "universityBooks"; // local fallback
const ADMIN_KEY = "university_admin_authenticated";
const ADMIN_SECRET = "atti542399";

// Toggle these values as needed
const BACKEND_ENABLED = true; // set to false to force localStorage only
const BACKEND_URL = "http://localhost:5000"; // change if your backend runs elsewhere

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

  // state: if using backend, backendBooks is the DB object; else localBooks fallback
  const [backendBooks, setBackendBooks] = useState({});
  const [localBooks, setLocalBooks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
  });

  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(ADMIN_KEY) === "1");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");

  // upload form
  const [newBook, setNewBook] = useState({ title: "", pdfFile: null });

  // filters & pagination (same as before)
  const [semesterBookQuery, setSemesterBookQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sizeFilter, setSizeFilter] = useState("any");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  // helper key
  const keyFor = (dept, sem) => `${dept}-sem${sem}`;

  // Load from backend (if enabled)
  useEffect(() => {
    if (!BACKEND_ENABLED) return;
    const fetchBooks = async () => {
      try {
        const r = await fetch(`${BACKEND_URL}/api/books`);
        const j = await r.json();
        if (j?.success) {
          setBackendBooks(j.data || {});
        } else {
          console.warn("Backend responded without success, falling back to localStorage.");
        }
      } catch (e) {
        console.warn("Failed to reach backend, falling back to localStorage.", e);
      }
    };
    fetchBooks();
    // also poll every 8s while component mounted (keeps UI fresh)
    const iv = setInterval(fetchBooks, 8000);
    return () => clearInterval(iv);
  }, []);

  // persist localBooks when changed (for fallback mode)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(localBooks)); } catch {}
  }, [localBooks]);

  // departments filter
  const filteredDepartments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEPARTMENTS;
    return DEPARTMENTS.filter((d) => d.toLowerCase().includes(q));
  }, [query]);

  // Admin modal methods
  const tryAdminAuth = () => { setShowAdminModal(true); setAdminPassInput(""); };
  const confirmAdminAuth = () => {
    if (adminPassInput === ADMIN_SECRET) {
      setIsAdmin(true);
      localStorage.setItem(ADMIN_KEY, "1");
      setShowAdminModal(false);
      alert("Admin unlocked.");
    } else alert("Incorrect password.");
  };
  const logoutAdmin = () => { setIsAdmin(false); localStorage.removeItem(ADMIN_KEY); };

  // Helper: get current list depending on backend enabled or fallback
  const getRawList = (dept, sem) => {
    const key = keyFor(dept, sem);
    if (BACKEND_ENABLED && backendBooks && backendBooks[key]) return backendBooks[key];
    return localBooks[key] || [];
  };

  // Upload handler that calls backend when enabled, otherwise stores locally (base64)
  const addBook = async () => {
    if (!selected || !semester) { alert("Select department & semester"); return; }
    if (!newBook.title || !newBook.pdfFile) { alert("Provide title & file"); return; }

    if (BACKEND_ENABLED) {
      // build formdata
      const fd = new FormData();
      fd.append("department", selected);
      fd.append("semester", semester);
      fd.append("title", newBook.title);
      fd.append("file", newBook.pdfFile);

      try {
        const r = await fetch(`${BACKEND_URL}/api/upload`, { method: "POST", body: fd });
        const j = await r.json();
        if (j?.success) {
          // refresh backend list immediately
          const r2 = await fetch(`${BACKEND_URL}/api/books`);
          const j2 = await r2.json();
          if (j2?.success) setBackendBooks(j2.data || {});
          setNewBook({ title: "", pdfFile: null });
          alert("Uploaded to server ✅");
        } else {
          alert("Upload failed: " + (j.error || "unknown"));
        }
      } catch (e) {
        console.error(e);
        alert("Failed to upload to server. Check backend.");
      }
      return;
    }

    // fallback: read file as base64 and store in localBooks (same shape as backend entries)
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
      const updated = { ...localBooks, [key]: [...arr, entry] };
      setLocalBooks(updated);
      setNewBook({ title: "", pdfFile: null });
      alert("Saved locally (fallback).");
    };
    reader.readAsDataURL(newBook.pdfFile);
  };

  // Delete handler (backend or local)
  const deleteBook = async (index) => {
    if (!isAdmin) return;
    if (!confirm("Delete this book?")) return;

    if (BACKEND_ENABLED) {
      // Need filename from backend entry
      const key = keyFor(selected, semester);
      const list = backendBooks[key] || [];
      const entry = list[index];
      if (!entry || !entry.filename) {
        alert("Cannot delete — entry missing filename on server.");
        return;
      }
      try {
        const r = await fetch(`${BACKEND_URL}/api/book`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ department: selected, semester, filename: entry.filename }),
        });
        const j = await r.json();
        if (j?.success) {
          // refresh
          const r2 = await fetch(`${BACKEND_URL}/api/books`);
          const j2 = await r2.json();
          if (j2?.success) setBackendBooks(j2.data || {});
          alert("Deleted on server.");
        } else {
          alert("Delete failed: " + (j.error || "unknown"));
        }
      } catch (e) {
        console.error(e);
        alert("Failed to contact server");
      }
      return;
    }

    // fallback local
    const key = keyFor(selected, semester);
    const arr = localBooks[key] ? [...localBooks[key]] : [];
    arr.splice(index, 1);
    const updated = { ...localBooks, [key]: arr };
    setLocalBooks(updated);
    alert("Deleted locally.");
  };

  // Build filtered/sorted/paginated list (works for backend entries too)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const baseList = useMemo(() => getRawList(selected, semester), [backendBooks, localBooks, selected, semester]);
  const searchedList = useMemo(() => {
    const q = semesterBookQuery.trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter((b) => (b.title || "").toLowerCase().includes(q));
  }, [baseList, semesterBookQuery]);

  const sizeFilteredList = useMemo(() => {
    if (sizeFilter === "any") return searchedList;
    return searchedList.filter((b) => {
      const s = b.sizeBytes || 0;
      if (sizeFilter === "small") return s < 100 * 1024;
      if (sizeFilter === "med") return s >= 100 * 1024 && s <= 2 * 1024 * 1024;
      if (sizeFilter === "large") return s > 2 * 1024 * 1024;
      return true;
    });
  }, [searchedList, sizeFilter]);

  const dateFilteredList = useMemo(() => {
    if (!dateFrom && !dateTo) return sizeFilteredList;
    return sizeFilteredList.filter((b) => {
      const uploaded = new Date(b.uploadedAt);
      if (dateFrom) { const from = new Date(dateFrom + "T00:00:00"); if (uploaded < from) return false; }
      if (dateTo) { const to = new Date(dateTo + "T23:59:59"); if (uploaded > to) return false; }
      return true;
    });
  }, [sizeFilteredList, dateFrom, dateTo]);

  const sortedList = useMemo(() => {
    const arr = [...dateFilteredList];
    switch (sortBy) {
      case "newest": arr.sort((a,b)=> new Date(b.uploadedAt)-new Date(a.uploadedAt)); break;
      case "oldest": arr.sort((a,b)=> new Date(a.uploadedAt)-new Date(b.uploadedAt)); break;
      case "az": arr.sort((a,b)=> (a.title||"").localeCompare(b.title||"")); break;
      case "za": arr.sort((a,b)=> (b.title||"").localeCompare(a.title||"")); break;
      case "size-asc": arr.sort((a,b)=> (a.sizeBytes||0)-(b.sizeBytes||0)); break;
      case "size-desc": arr.sort((a,b)=> (b.sizeBytes||0)-(a.sizeBytes||0)); break;
      default: break;
    }
    return arr;
  }, [dateFilteredList, sortBy]);

  const totalItems = sortedList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=> { if (currentPage > totalPages) setCurrentPage(1); }, [totalPages]);

  const paginatedList = useMemo(()=> {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedList.slice(start, start + itemsPerPage);
  }, [sortedList, currentPage, itemsPerPage]);

  // UI card style
  const cardStyle = { padding: 12, borderRadius: 10, transition: "transform .14s ease, box-shadow .14s ease" };

  return (
    <div style={{ padding: 12 }}>
      <div style={{
        background: darkMode ? "rgba(12,14,18,0.85)" : "rgba(255,255,255,0.98)",
        padding: 18, borderRadius: 12,
        boxShadow: darkMode ? "0 10px 40px rgba(0,0,0,0.6)" : "0 8px 24px rgba(10,20,40,0.04)"
      }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>🎓 University Library</h2>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search departments..." style={{ padding: 8, borderRadius: 8, minWidth: 220 }} />
            <button onClick={()=>{ setSelected(null); setSemester(null); setQuery(""); }} style={{ padding: 8, borderRadius: 8 }}>Reset</button>

            {!isAdmin ? (
              <button onClick={tryAdminAuth} title="Admin login" style={{ padding: "6px 10px", borderRadius: 8, background: "#0d6efd", color: "#fff", border: "none" }}>🔐 Admin</button>
            ) : (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, opacity: 0.9 }}>Admin</span>
                <button onClick={logoutAdmin} style={{ padding: "6px 10px", borderRadius: 8, background: "#dc3545", color: "#fff", border: "none" }}>Logout Admin</button>
              </div>
            )}
          </div>
        </div>

        {/* content */}
        {!selected ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
            {filteredDepartments.map((d)=>(
              <div key={d} onClick={()=>setSelected(d)} style={{ ...cardStyle, background: darkMode ? "linear-gradient(135deg,#142433,#1b2f40)" : "linear-gradient(135deg,#bde0fe,#a2d2ff)", cursor:"pointer" }}
                onMouseEnter={(e)=>e.currentTarget.style.transform="translateY(-6px)"} onMouseLeave={(e)=>e.currentTarget.style.transform="translateY(0)"}>
                <div style={{ fontWeight:700 }}>{d}</div>
                <div style={{ fontSize:13, opacity:0.9 }}>Click to view semesters</div>
              </div>
            ))}
          </div>
        ) : !semester ? (
          <div>
            <button onClick={()=>setSelected(null)} style={{ padding: 8, marginBottom: 12 }}>⬅ Back</button>
            <h3>{selected}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
              {Array.from({length:8},(_,i)=>i+1).map((s)=>(
                <div key={s} onClick={()=>setSemester(s)} style={{ ...cardStyle, background: darkMode ? "#0f1724" : "#fff6d8", cursor: "pointer" }} onMouseEnter={(e)=>e.currentTarget.style.transform="translateY(-6px)"} onMouseLeave={(e)=>e.currentTarget.style.transform="translateY(0)"}>
                  Semester {s}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button onClick={()=>setSemester(null)} style={{ padding: 8, marginBottom: 12 }}>⬅ Back</button>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <h3 style={{ margin:0 }}>{selected} — Semester {semester}</h3>
              <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
                <input value={semesterBookQuery} onChange={(e)=>{ setSemesterBookQuery(e.target.value); setCurrentPage(1); }} placeholder="Search books in this semester..." style={{ padding:8, borderRadius:8, minWidth:220 }} />
              </div>
            </div>

            {/* Filters */}
            <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:12, flexWrap:"wrap" }}>
              <label>Sort:
                <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} style={{ padding:6, borderRadius:6 }}>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="az">Title A→Z</option>
                  <option value="za">Title Z→A</option>
                  <option value="size-desc">Size ↓</option>
                  <option value="size-asc">Size ↑</option>
                </select>
              </label>

              <label>Size:
                <select value={sizeFilter} onChange={(e)=>{ setSizeFilter(e.target.value); setCurrentPage(1); }} style={{ padding:6, borderRadius:6 }}>
                  <option value="any">Any</option>
                  <option value="small">Small (&lt;100 KB)</option>
                  <option value="med">Medium (100 KB - 2 MB)</option>
                  <option value="large">Large (&gt;2 MB)</option>
                </select>
              </label>

              <label>From:
                <input type="date" value={dateFrom} onChange={(e)=>{ setDateFrom(e.target.value); setCurrentPage(1); }} style={{ padding:6, borderRadius:6 }} />
              </label>
              <label>To:
                <input type="date" value={dateTo} onChange={(e)=>{ setDateTo(e.target.value); setCurrentPage(1); }} style={{ padding:6, borderRadius:6 }} />
              </label>

              <label style={{ marginLeft:"auto" }}>Items per page:
                <select value={itemsPerPage} onChange={(e)=>{ setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ padding:6, borderRadius:6 }}>
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                </select>
              </label>
            </div>

            {/* Admin upload (uses backend if enabled) */}
            {isAdmin && (
              <div style={{ marginTop:14, padding:12, borderRadius:10, background: darkMode ? "linear-gradient(135deg,#071428,#09213a)" : "#f0f8ff", marginBottom:14 }}>
                <h4 style={{ marginTop:0 }}>📚 Upload PDF (Admin)</h4>
                <input type="text" placeholder="Book Title" value={newBook.title} onChange={(e)=>setNewBook({...newBook, title:e.target.value})} style={{ width:"100%", padding:8, marginBottom:8, borderRadius:8 }} />
                <input type="file" accept="application/pdf" onChange={(e)=>setNewBook({...newBook, pdfFile: e.target.files?.[0] || null})} style={{ width:"100%", padding:8, marginBottom:8, borderRadius:8 }} />
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={addBook} style={{ padding:"8px 12px", borderRadius:8, background:"#198754", color:"#fff", border:0 }}>➕ Upload Book</button>
                  <button onClick={()=>setNewBook({ title:"", pdfFile:null })} style={{ padding:"8px 12px", borderRadius:8 }}>Cancel</button>
                </div>
                <div style={{ marginTop:8, fontSize:13, opacity:0.9 }}>If backend available, files are saved on server and visible to everyone. Otherwise they save locally in your browser.</div>
              </div>
            )}

            {/* books listing */}
            <div style={{ marginTop:12 }}>
              {totalItems === 0 ? (
                <div style={{ padding:12, borderRadius:8, background:"#f4f6f8" }}>No books match filters. {isAdmin ? "Upload one above." : ""}</div>
              ) : (
                <>
                  <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
                    {paginatedList.map((b, idx) => {
                      const globalIndex = (currentPage - 1) * itemsPerPage + idx;
                      return (
                        <li key={globalIndex} style={{ ...cardStyle, background: darkMode ? "linear-gradient(135deg,#071428,#0d2136)" : "#e9f6ff", boxShadow: darkMode ? "0 10px 25px rgba(0,0,0,0.45)" : "0 8px 18px rgba(0,0,0,0.06)" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                            <div style={{ flex:1 }}>
                              <strong style={{ fontSize:16 }}>{b.title}</strong>
                              <div style={{ fontSize:13, opacity:0.85, marginTop:6 }}>Size: {formatBytes(b.sizeBytes || 0)} • Uploaded: {b.uploadedAt ? new Date(b.uploadedAt).toLocaleString() : "—"}</div>
                            </div>

                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                              {/* download/preview logic depends on backend vs local */}
                              {BACKEND_ENABLED && b.url ? (
                                <>
                                  <a href={`${BACKEND_URL}${b.url}`} target="_blank" rel="noreferrer" style={{ padding:"6px 10px", borderRadius:6, background:"#198754", color:"#fff", textDecoration:"none", textAlign:"center" }}>📥 Download</a>
                                  <button onClick={() => window.open(`${BACKEND_URL}${b.url}`, "_blank")} style={{ padding:"6px 10px", borderRadius:6, background:"#0d6efd", color:"#fff", border:0 }}>👁 Preview</button>
                                </>
                              ) : (
                                <>
                                  <a href={b.pdfData} target="_blank" rel="noreferrer" style={{ padding:"6px 10px", borderRadius:6, background:"#198754", color:"#fff", textDecoration:"none", textAlign:"center" }}>📥 Download</a>
                                  <button onClick={() => window.open(b.pdfData, "_blank")} style={{ padding:"6px 10px", borderRadius:6, background:"#0d6efd", color:"#fff", border:0 }}>👁 Preview</button>
                                </>
                              )}

                              {isAdmin && (
                                <button onClick={()=>deleteBook(globalIndex)} style={{ padding:"6px 10px", borderRadius:6, background:"#dc3545", color:"#fff", border:0 }}>🗑 Delete</button>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* pagination */}
                  <div style={{ marginTop:14, display:"flex", gap:8, alignItems:"center", justifyContent:"center", flexWrap:"wrap" }}>
                    <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} style={{ padding:"6px 10px", borderRadius:6 }}>Prev</button>
                    {Array.from({ length: totalPages }).map((_,i)=> {
                      const p = i+1;
                      if (totalPages > 9) {
                        if (p===1 || p===totalPages || (p>=currentPage-2 && p<=currentPage+2)) {
                          return <button key={p} onClick={()=>setCurrentPage(p)} style={{ padding:"6px 10px", borderRadius:6, background: currentPage===p ? "#0d6efd" : undefined, color: currentPage===p ? "#fff" : undefined }}>{p}</button>;
                        }
                        if (p===2 && currentPage>4) return <span key="dots1">…</span>;
                        if (p===totalPages-1 && currentPage<totalPages-3) return <span key="dots2">…</span>;
                        return null;
                      }
                      return <button key={p} onClick={()=>setCurrentPage(p)} style={{ padding:"6px 10px", borderRadius:6, background: currentPage===p ? "#0d6efd" : undefined, color: currentPage===p ? "#fff" : undefined }}>{p}</button>;
                    })}
                    <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} style={{ padding:"6px 10px", borderRadius:6 }}>Next</button>
                    <div style={{ marginLeft:12, fontSize:13, opacity:0.85 }}>Page {currentPage} of {totalPages} • {totalItems} result(s)</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Admin modal */}
      {showAdminModal && (
        <div onClick={()=>setShowAdminModal(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
          <div onClick={(e)=>e.stopPropagation()} style={{ width:380, background: darkMode ? "#071428" : "#fff", color: darkMode ? "#e6f0ff" : "#0b1220", padding:18, borderRadius:10 }}>
            <h3 style={{ marginTop:0 }}>Admin Login</h3>
            <div style={{ fontSize:13, opacity:0.9, marginBottom:10 }}>Enter admin password to enable Admin Mode (only you should know it).</div>
            <input type="password" value={adminPassInput} onChange={(e)=>setAdminPassInput(e.target.value)} placeholder="Password" style={{ width:"100%", padding:8, marginBottom:10, borderRadius:8 }} />
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={()=>setShowAdminModal(false)} style={{ padding:"8px 12px", borderRadius:8 }}>Cancel</button>
              <button onClick={confirmAdminAuth} style={{ padding:"8px 12px", borderRadius:8, background:"#198754", color:"#fff", border:"none" }}>Unlock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
