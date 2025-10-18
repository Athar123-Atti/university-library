/* eslint-disable no-restricted-globals */
import React, { useEffect, useState } from "react";

const STORAGE_KEY = "library_books";
const readBooks = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const saveBooks = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

export default function AddBook() {
  const [book, setBook] = useState({ title: "", author: "", department: "", semester: 1 });
  const [message, setMessage] = useState("");
  const [allBooks, setAllBooks] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => setAllBooks(readBooks()), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!book.title || !book.author || !book.department) {
      setMessage("Please fill required fields.");
      return;
    }
    const arr = readBooks();
    if (editingId) {
      const next = arr.map(b => b.id === editingId ? { ...b, ...book } : b);
      saveBooks(next);
      setAllBooks(next);
      setMessage("Book updated.");
      setEditingId(null);
    } else {
      const newBook = { ...book, id: Date.now() };
      arr.push(newBook);
      saveBooks(arr);
      setAllBooks(arr);
      setMessage("Book added successfully.");
    }
    setBook({ title: "", author: "", department: "", semester: 1 });
    setTimeout(()=>setMessage(""), 2500);
  };

  const handleEdit = (b) => { setBook({ title: b.title, author: b.author, department: b.department, semester: b.semester }); setEditingId(b.id); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleDelete = (id) => { if (!confirm("Delete this book?")) return; const arr = readBooks().filter(b => b.id !== id); saveBooks(arr); setAllBooks(arr); };

  return (
    <div className="container">
      <h3>Add / Edit Book</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth:520, display:"flex", flexDirection:"column", gap:10 }}>
        <input placeholder="Book title" value={book.title} onChange={(e)=>setBook({...book,title:e.target.value})} style={{padding:8,borderRadius:8,border:"1px solid #ddd"}} />
        <input placeholder="Author" value={book.author} onChange={(e)=>setBook({...book,author:e.target.value})} style={{padding:8,borderRadius:8,border:"1px solid #ddd"}} />
        <input placeholder="Department (exact name)" value={book.department} onChange={(e)=>setBook({...book,department:e.target.value})} style={{padding:8,borderRadius:8,border:"1px solid #ddd"}} />
        <input type="number" min={1} max={8} value={book.semester} onChange={(e)=>setBook({...book,semester:Number(e.target.value)})} style={{padding:8,borderRadius:8,border:"1px solid #ddd"}} />
        <div style={{ display:"flex", gap:8 }}>
          <button type="submit" className="btn btn-primary">{editingId ? "Update" : "Save"}</button>
          {editingId && <button type="button" className="btn btn-ghost" onClick={()=>{ setEditingId(null); setBook({ title:"", author:"", department:"", semester:1 }); }}>Cancel</button>}
        </div>
      </form>
      {message && <div className="mt-2" style={{ color: "green" }}>{message}</div>}

      <div style={{ marginTop:18 }}>
        <h4>All Books ({allBooks.length})</h4>
        <div style={{ display:"grid", gap:8 }}>
          {allBooks.map(b => (
            <div key={b.id} className="book-item" style={{ padding:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontWeight:700 }}>{b.title}</div>
                <div style={{ fontSize:13, opacity:0.8 }}>{b.author} • {b.department} • Sem {b.semester}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn btn-ghost" onClick={()=>handleEdit(b)}>Edit</button>
                <button className="btn btn-danger" onClick={()=>handleDelete(b.id)}>Delete</button>
              </div>
            </div>
          ))}
          {allBooks.length===0 && <div style={{ color:"#666" }}>No books yet. Add one above.</div>}
        </div>
      </div>
    </div>
  );
}
