/* src/components/QuranSection.js */
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* translators to prefetch via api.alquran.cloud */
const translators = [
  { key: "ur.jalandhry", label: "Urdu (Jalandhry)" },
  { key: "en.asad", label: "English (Asad)" },
];

const QuranSection = ({ darkMode: parentDark = false }) => {
  // eslint-disable-next-line no-unused-vars
  const [localDark, setLocalDark] = useState(parentDark || false);
  const darkMode = parentDark ?? localDark;
  const [surahList, setSurahList] = useState([]);
  const [currentSurah, setCurrentSurah] = useState(null);
  const [translations, setTranslations] = useState({});
  const [playingSurah, setPlayingSurah] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [lastReadAyah, setLastReadAyah] = useState(null);
  const [selectedTranslationKey, setSelectedTranslationKey] = useState(translators[0].key);

  const audioRef = useRef(null);
  const ayahRefs = useRef({});
  const syncingRef = useRef(false);

  // load surah list
  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then((r) => r.json())
      .then((d) => setSurahList(d.data || []))
      .catch((e) => console.error("Surah list error:", e));
  }, []);

  // load bookmarks/lastRead
  useEffect(() => {
    const stored = localStorage.getItem("quranBookmarks");
    if (stored) setBookmarks(JSON.parse(stored));
    const lr = localStorage.getItem("quranLastRead");
    if (lr) setLastReadAyah(JSON.parse(lr));
  }, []);

  useEffect(() => {
    localStorage.setItem("quranBookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("quranLastRead", JSON.stringify(lastReadAyah));
  }, [lastReadAyah]);

  useEffect(() => {
    if (lastReadAyah && ayahRefs.current[lastReadAyah]) {
      ayahRefs.current[lastReadAyah].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentSurah, lastReadAyah]);

  const keyFor = (s, a) => `${s}-${a}`;

  const fetchSurah = async (surahNumber) => {
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const json = await res.json();
      if (json?.data) {
        setCurrentSurah(json.data);
        setAudioProgress(0);
        prefetchTranslationsForSurah(surahNumber, json.data.numberOfAyahs);
      }
    } catch (err) {
      console.error("fetchSurah", err);
    }
  };

  const prefetchTranslationsForSurah = async (surahNumber, ayahCount) => {
    const chunk = 8;
    for (let i = 1; i <= ayahCount; i += chunk) {
      const batch = Array.from({ length: Math.min(chunk, ayahCount - i + 1) }, (_, k) => i + k);
      await Promise.all(
        batch.map(async (ayahNumber) => {
          const k = keyFor(surahNumber, ayahNumber);
          if (translations[k]) return;
          const obj = {};
          for (const t of translators) {
            try {
              const r = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/${t.key}`);
              const j = await r.json();
              obj[t.key] = j?.data?.text || "";
            } catch {
              obj[t.key] = "";
            }
          }
          setTranslations((p) => ({ ...p, [k]: obj }));
        })
      );
      await new Promise((res) => setTimeout(res, 80));
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = (surah) => {
    const sNum = surah.number;
    const url = surah.audio || `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${sNum}.mp3`;

    if (audioRef.current && playingSurah === sNum) {
      audioRef.current.pause();
      setPlayingSurah(null);
      setAudioProgress(0);
      syncingRef.current = false;
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingSurah(sNum);
    syncingRef.current = true;

    const update = () => {
      try {
        if (audio.duration && !isNaN(audio.duration)) {
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
        if (currentSurah && syncingRef.current) {
          const total = currentSurah.numberOfAyahs;
          const frac = audio.currentTime / (audio.duration || 1);
          const approximateIndex = Math.min(total, Math.max(1, Math.round(frac * total)));
          const k = keyFor(currentSurah.number, approximateIndex);
          if (ayahRefs.current[k]) ayahRefs.current[k].scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } catch {}
    };
    const ended = () => {
      setPlayingSurah(null);
      setAudioProgress(0);
      syncingRef.current = false;
    };

    audio.addEventListener("timeupdate", update);
    audio.addEventListener("ended", ended);

    audio.play().catch((e) => {
      console.error("audio play failed", e);
      setPlayingSurah(null);
    });
  };

  const toggleBookmark = (surahNumber, ayahNumber) => {
    const k = keyFor(surahNumber, ayahNumber);
    setBookmarks((prev) => {
      const next = prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k];
      return next;
    });
    setLastReadAyah(k);
  };

  const shareAyah = async (surahNumber, ayahNumber) => {
    const k = keyFor(surahNumber, ayahNumber);
    const tr = translations[k] || {};
    const arabic = currentSurah?.ayahs?.[ayahNumber - 1]?.text || "";
    const ur = tr["ur.jalandhry"] || "";
    const en = tr["en.asad"] || "";
    const text = `${arabic}\n\nUrdu: ${ur}\nEnglish: ${en}`;
    try {
      await navigator.clipboard.writeText(text);
      alert("Ayah copied to clipboard!");
    } catch {
      prompt("Copy this text:", text);
    }
  };

  const filtered = surahList.filter((s) =>
    (s.englishName || s.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-3">
      <div style={{
        background: darkMode ? "rgba(12,14,18,0.85)" : "rgba(255,255,255,0.95)",
        padding: 20, borderRadius: 14, boxShadow: darkMode ? "0 20px 60px rgba(0,0,0,0.7)" : "0 12px 40px rgba(10,20,60,0.08)",
        transition: "all 0.3s ease"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <motion.img whileHover={{ scale: 1.1 }} src="https://cdn-icons-png.flaticon.com/512/4729/4729848.png" alt="logo" style={{ width: 56, borderRadius: 12 }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 22 }}>الْقُرْآنُ الْکَرِيمُ</div>
              <div style={{ fontSize: 12, color: darkMode ? "#bfcfdc" : "#556" }}>Recitation • Translation (Urdu/English)</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select value={selectedTranslationKey} onChange={(e) => setSelectedTranslationKey(e.target.value)} style={{ padding: 8, borderRadius: 10, border: "1px solid #ccc", transition: "all 0.3s" }}>
              {translators.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Surah..." style={{ padding: 8, borderRadius: 10, border: "1px solid #ccc", transition: "all 0.3s" }} />
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setCurrentSurah(null); setSearchQuery(""); }} style={{ padding: 8, borderRadius: 10, border: 0, background: "#0d6efd", color: "#fff", cursor: "pointer" }}>Reset</motion.button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {/* Surah list */}
          <div style={{
            width: 300, maxHeight: 460, overflowY: "auto", padding: 8, borderRadius: 12,
            background: darkMode ? "#071226" : "#e9fbff"
          }}>
            {filtered.length === 0 && <div style={{ padding: 12 }}>{searchQuery ? "No surah found" : "Loading..."}</div>}
            <AnimatePresence>
              {filtered.map((s) => (
                <motion.div key={s.number} onClick={() => fetchSurah(s.number)}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  whileHover={{ scale: 1.03, backgroundColor: darkMode ? "#0f1724" : "#dff7ff" }}
                  style={{
                    padding: 12, borderRadius: 10, cursor: "pointer", marginBottom: 8,
                    background: currentSurah?.number === s.number ? (darkMode ? "#0f1724" : "#dff7ff") : "transparent",
                    transition: "all 0.2s"
                  }}>
                  <div style={{ fontWeight: 700 }}>{s.number}. {s.englishName}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{s.revelationType} • Ayahs: {s.numberOfAyahs}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Surah & Ayahs */}
          <div style={{ flex: 1 }}>
            {!currentSurah ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 16 }}>Select a surah from the left list to view ayahs and translations.</motion.div>
            ) : (
              <div>
                {/* Surah Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <h2 style={{ margin: 0 }}>{currentSurah.name} — {currentSurah.englishName}</h2>
                    <div style={{ fontSize: 12, color: "#888" }}>Surah #{currentSurah.number} • Ayahs: {currentSurah.numberOfAyahs}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => handlePlayPause(currentSurah)} style={{
                      padding: "8px 12px", borderRadius: 8, border: 0,
                      background: playingSurah === currentSurah.number ? "#dc3545" : "#198754",
                      color: "#fff", cursor: "pointer"
                    }}>
                      {playingSurah === currentSurah.number ? "⏸ Stop" : "🔊 Play"}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => {
                      const firstKey = keyFor(currentSurah.number, 1);
                      ayahRefs.current[firstKey]?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }} style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}>Go to first</motion.button>
                  </div>
                </div>

                {/* Audio Progress */}
                {playingSurah === currentSurah.number && (
                  <motion.div layout style={{ width: "100%", height: 8, background: "#e9ecef", borderRadius: 8, marginBottom: 12 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${audioProgress}%` }} transition={{ ease: "linear" }} style={{ height: "100%", background: "#ffcc00", borderRadius: 8 }} />
                  </motion.div>
                )}

                {/* Bismillah */}
                {currentSurah.number !== 9 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", marginBottom: 12, fontSize: 22, fontWeight: 700, color: darkMode ? "#ffd86b" : "#0d6efd", fontFamily: "Noto Naskh Arabic, serif" }}>
                    بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ
                  </motion.div>
                )}

                {/* Ayahs */}
                <div style={{ maxHeight: 520, overflowY: "auto", paddingRight: 8 }}>
                  <AnimatePresence>
                    {currentSurah.ayahs.map((ayahObj, idx) => {
                      const ayahNumber = idx + 1;
                      const k = keyFor(currentSurah.number, ayahNumber);
                      const tr = translations[k] || {};
                      const isBook = bookmarks.includes(k);
                      return (
                        <motion.div key={k} ref={(el) => (ayahRefs.current[k] = el)}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                          whileHover={{ scale: 1.02 }}
                          style={{
                            padding: 14, marginBottom: 12, borderRadius: 14,
                            background: darkMode ? "linear-gradient(135deg,#071428,#0d2136)" : "linear-gradient(135deg,#e9f6ff,#f6fff0)",
                            color: darkMode ? "#e8eef7" : "#111",
                            boxShadow: darkMode ? "0 12px 30px rgba(0,0,0,0.5)" : "0 6px 20px rgba(20,30,50,0.05)",
                            transition: "all 0.3s"
                          }}>
                          <div style={{ display: "flex", gap: 12 }}>
                            <div style={{ minWidth: 36, fontWeight: 800, opacity: 0.9 }}>{ayahNumber}</div>
                            <div style={{ flex: 1, textAlign: "right" }}>
                              <div style={{ fontSize: 20, lineHeight: 1.7, direction: "rtl", fontWeight: 700 }}>{ayahObj.text}</div>
                              <div style={{ marginTop: 10, color: darkMode ? "#d6d6d6" : "#333" }}>
                                <div><strong>Urdu:</strong> {tr["ur.jalandhry"] || "Loading..."}</div>
                                <div style={{ marginTop: 6 }}><strong>English:</strong> {tr["en.asad"] || "Loading..."}</div>
                              </div>

                              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                                <motion.button whileHover={{ scale: 1.05 }} onClick={() => toggleBookmark(currentSurah.number, ayahNumber)} style={{ padding: "6px 10px", borderRadius: 8, border: 0, background: isBook ? "#ffc107" : "#6c757d", color: "#fff", cursor: "pointer" }}>
                                  {isBook ? "Saved" : "Bookmark"}
                                </motion.button>

                                <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setLastReadAyah(k); ayahRefs.current[k]?.scrollIntoView({ behavior: "smooth", block: "center" }); }} style={{ padding: "6px 10px", borderRadius: 8, border: 0, background: "#0d6efd", color: "#fff", cursor: "pointer" }}>
                                  Mark read
                                </motion.button>

                                <motion.button whileHover={{ scale: 1.05 }} onClick={() => shareAyah(currentSurah.number, ayahNumber)} style={{ padding: "6px 10px", borderRadius: 8, border: 0, background: "#6f42c1", color: "#fff", cursor: "pointer" }}>
                                  Share
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranSection;
