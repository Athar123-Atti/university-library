import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function UniversityLibrary() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    async function fetchExcel() {
      try {
        // 👇 Yeh naam tumhare public folder wali file se match hona chahiye
        const response = await fetch("/Library_Stock_List.xlsx");

        if (!response.ok) throw new Error("Excel file not found in /public");

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Find the header row (where "Title" is found)
        const headerRowIndex = rawData.findIndex((row) =>
          row.some(
            (cell) =>
              typeof cell === "string" &&
              cell.toLowerCase().includes("title")
          )
        );

        if (headerRowIndex === -1) {
          console.error("❌ Header row not found in Excel");
          return;
        }

        const headers = rawData[headerRowIndex].map((h) => String(h || "").trim());
        const dataRows = rawData.slice(headerRowIndex + 1);

        const formattedBooks = dataRows
          .map((row) => {
            const record = {};
            headers.forEach((key, i) => {
              record[key] = row[i];
            });
            return {
              title: record["Title"] || "",
              edition: record["Edition"] || "",
              author: record["Author"] || "",
            };
          })
          .filter((b) => b.title);

        console.log("📚 Books loaded:", formattedBooks.length, formattedBooks);
        setBooks(formattedBooks);
      } catch (err) {
        console.error("⚠️ Error reading Excel file:", err);
      }
    }

    fetchExcel();
  }, []);

  // Search filter
  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dark / Light Theme
  const theme = {
    background: darkMode ? "#161b22" : "#ffffff",
    text: darkMode ? "#e6edf3" : "#222",
    headerBg: darkMode ? "#1f2937" : "#007bff",
    headerText: "#ffffff",
    borderColor: darkMode ? "#30363d" : "#d0d0d0",
    hoverBg: darkMode ? "#1e2632" : "#f0f8ff",
    searchBg: darkMode ? "#0e1117" : "#fff",
    scrollbarTrack: darkMode ? "#161b22" : "#f1f1f1",
    scrollbarThumb: darkMode ? "#30363d" : "#ccc",
  };

  return (
    <div
      style={{
        padding: "30px 20px",
        fontFamily: "'Inter', sans-serif",
        backgroundColor: theme.background,
        minHeight: "100vh",
        transition: "background-color 0.6s ease, color 0.6s ease",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
          color: theme.text,
          transition: "color 0.6s ease",
        }}
      >
        🎓 Thal University Library List
      </h2>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <input
          type="text"
          placeholder="🔍 Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px 15px",
            width: "70%",
            maxWidth: "600px",
            borderRadius: 8,
            border: `1px solid ${theme.borderColor}`,
            backgroundColor: theme.searchBg,
            color: theme.text,
            fontSize: 16,
            outline: "none",
            transition: "all 0.5s ease",
          }}
        />
      </div>

      <div
        style={{
          backgroundColor: theme.background,
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${theme.borderColor}`,
          transition: "all 0.6s ease",
        }}
      >
        <div
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: `${theme.scrollbarThumb} ${theme.scrollbarTrack}`,
            transition: "all 0.4s ease",
          }}
        >
          <style>
            {`
              div::-webkit-scrollbar { width: 10px; }
              div::-webkit-scrollbar-track { background: ${theme.scrollbarTrack}; border-radius: 6px; }
              div::-webkit-scrollbar-thumb { background-color: ${theme.scrollbarThumb}; border-radius: 6px; transition: background 0.3s ease; }
              div::-webkit-scrollbar-thumb:hover { background-color: ${darkMode ? "#555" : "#999"}; }
              tr:hover td { background-color: ${theme.hoverBg}; transition: background-color 0.3s ease; }

              .switch { position: relative; display: inline-block; width: 50px; height: 24px; }
              .switch input { opacity: 0; width: 0; height: 0; }
              .slider {
                position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                background-color: #ccc; transition: 0.5s ease; border-radius: 24px; box-shadow: 0 0 5px rgba(0,0,0,0.2);
              }
              .slider:before {
                position: absolute; content: "";
                height: 18px; width: 18px;
                left: 3px; bottom: 3px;
                background-color: white; transition: 0.5s ease; border-radius: 50%;
                box-shadow: 0 0 2px rgba(0,0,0,0.2);
              }
              input:checked + .slider { background-color: #2196f3; box-shadow: 0 0 15px #2196f3; }
              input:checked + .slider:before { transform: translateX(26px); }
            `}
          </style>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: theme.text,
              transition: "color 0.6s ease",
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                zIndex: 5,
                backgroundColor: theme.headerBg,
                color: theme.headerText,
                transition: "background-color 0.6s ease, color 0.6s ease",
              }}
            >
              <tr>
                <th style={{ padding: "12px 15px", borderRight: `2px solid ${theme.borderColor}` }}>#</th>
                <th style={{ padding: "12px 15px", borderRight: `2px solid ${theme.borderColor}` }}>Title</th>
                <th style={{ padding: "12px 15px", borderRight: `2px solid ${theme.borderColor}`, textAlign: "center" }}>Edition</th>
                <th style={{ padding: "12px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Author
                  <label className="switch">
                    <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                    <span className="slider"></span>
                  </label>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book, index) => (
                  <tr key={index}>
                    <td style={{ padding: "10px 15px", borderRight: `2px solid ${theme.borderColor}` }}>{index + 1}</td>
                    <td style={{ padding: "10px 15px", borderRight: `2px solid ${theme.borderColor}` }}>{book.title}</td>
                    <td style={{ padding: "10px 15px", borderRight: `2px solid ${theme.borderColor}`, textAlign: "center" }}>{book.edition || "—"}</td>
                    <td style={{ padding: "10px 15px" }}>{book.author || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                    No books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
