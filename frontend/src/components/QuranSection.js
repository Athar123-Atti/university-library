/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* translators to prefetch via api.alquran.cloud */
const translators = [
  { key: "ur.jalandhry", label: "Urdu (Jalandhry)" },
  { key: "en.asad", label: "English (Asad)" },
];

const QuranSection = ({ darkMode: parentDark = false }) => {
  // keep original states and behavior but improve UX
  const [localDark, setLocalDark] = useState(parentDark || false);
  const darkMode = parentDark ?? localDark;

  const [surahList, setSurahList] = useState([]);
  const [currentSurah, setCurrentSurah] = useState(null);
  const [currentPara, setCurrentPara] = useState(null);
  const [translations, setTranslations] = useState({});
  const [playingSurah, setPlayingSurah] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [lastReadAyah, setLastReadAyah] = useState(null);
  const [selectedTranslationKey, setSelectedTranslationKey] = useState(translators[0].key);
  const [viewMode, setViewMode] = useState("surah"); // "surah" or "para"

  // Reading mode (compact / comfortable)
  const [readingMode, setReadingMode] = useState("comfortable"); // comfortable | compact

  // show floating scroll-to-top
  const [showScrollTop, setShowScrollTop] = useState(false);

  const audioRef = useRef(null);
  const ayahRefs = useRef({});
  const syncingRef = useRef(false);
  const rafRef = useRef(null);
  const prefetchAbortRef = useRef(false);

  // simple debounce for search
  const searchDebounceRef = useRef(null);

  const paraList = [
    { number: 1, name: "Para 1", start: { surah: 1, ayah: 1 }, end: { surah: 2, ayah: 141 } },
    { number: 2, name: "Para 2", start: { surah: 2, ayah: 142 }, end: { surah: 2, ayah: 252 } },
    { number: 3, name: "Para 3", start: { surah: 2, ayah: 253 }, end: { surah: 3, ayah: 92 } },
    { number: 4, name: "Para 4", start: { surah: 3, ayah: 93 }, end: { surah: 4, ayah: 23 } },
    { number: 5, name: "Para 5", start: { surah: 4, ayah: 24 }, end: { surah: 4, ayah: 147 } },
    { number: 6, name: "Para 6", start: { surah: 4, ayah: 148 }, end: { surah: 5, ayah: 81 } },
    { number: 7, name: "Para 7", start: { surah: 5, ayah: 82 }, end: { surah: 6, ayah: 110 } },
    { number: 8, name: "Para 8", start: { surah: 6, ayah: 111 }, end: { surah: 7, ayah: 87 } },
    { number: 9, name: "Para 9", start: { surah: 7, ayah: 88 }, end: { surah: 8, ayah: 40 } },
    { number: 10, name: "Para 10", start: { surah: 8, ayah: 41 }, end: { surah: 9, ayah: 92 } },
    { number: 11, name: "Para 11", start: { surah: 9, ayah: 93 }, end: { surah: 11, ayah: 5 } },
    { number: 12, name: "Para 12", start: { surah: 11, ayah: 6 }, end: { surah: 12, ayah: 52 } },
    { number: 13, name: "Para 13", start: { surah: 12, ayah: 53 }, end: { surah: 15, ayah: 99 } },
    { number: 14, name: "Para 14", start: { surah: 16, ayah: 1 }, end: { surah: 17, ayah: 111 } },
    { number: 15, name: "Para 15", start: { surah: 18, ayah: 1 }, end: { surah: 20, ayah: 135 } },
    { number: 16, name: "Para 16", start: { surah: 21, ayah: 1 }, end: { surah: 22, ayah: 78 } },
    { number: 17, name: "Para 17", start: { surah: 23, ayah: 1 }, end: { surah: 25, ayah: 20 } },
    { number: 18, name: "Para 18", start: { surah: 26, ayah: 1 }, end: { surah: 28, ayah: 88 } },
    { number: 19, name: "Para 19", start: { surah: 29, ayah: 1 }, end: { surah: 33, ayah: 30 } },
    { number: 20, name: "Para 20", start: { surah: 33, ayah: 31 }, end: { surah: 36, ayah: 27 } },
    { number: 21, name: "Para 21", start: { surah: 36, ayah: 28 }, end: { surah: 39, ayah: 31 } },
    { number: 22, name: "Para 22", start: { surah: 40, ayah: 1 }, end: { surah: 46, ayah: 35 } },
    { number: 23, name: "Para 23", start: { surah: 47, ayah: 1 }, end: { surah: 52, ayah: 49 } },
    { number: 24, name: "Para 24", start: { surah: 53, ayah: 1 }, end: { surah: 58, ayah: 8 } },
    { number: 25, name: "Para 25", start: { surah: 59, ayah: 1 }, end: { surah: 66, ayah: 12 } },
    { number: 26, name: "Para 26", start: { surah: 67, ayah: 1 }, end: { surah: 70, ayah: 35 } },
    { number: 27, name: "Para 27", start: { surah: 71, ayah: 1 }, end: { surah: 77, ayah: 50 } },
    { number: 28, name: "Para 28", start: { surah: 78, ayah: 1 }, end: { surah: 114, ayah: 6 } },
    { number: 29, name: "Para 29", start: { surah: 114, ayah: 7 }, end: { surah: 114, ayah: 15 } },
    { number: 30, name: "Para 30", start: { surah: 114, ayah: 16 }, end: { surah: 114, ayah: 6 } },
  ];

  // Fetch Surah List
  useEffect(() => {
    let mounted = true;
    fetch("https://api.alquran.cloud/v1/surah")
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setSurahList(d.data || []);
      })
      .catch((e) => console.error("Surah list error:", e));
    return () => (mounted = false);
  }, []);

  // Bookmarks / Last Read / ReadingMode from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("quranBookmarks");
    if (stored) setBookmarks(JSON.parse(stored));
    const lr = localStorage.getItem("quranLastRead");
    if (lr) setLastReadAyah(JSON.parse(lr));
    const rm = localStorage.getItem("quranReadingMode");
    if (rm) setReadingMode(rm);
  }, []);

  useEffect(() => {
    localStorage.setItem("quranBookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("quranLastRead", JSON.stringify(lastReadAyah));
  }, [lastReadAyah]);

  // persist reading mode
  useEffect(() => {
    localStorage.setItem("quranReadingMode", readingMode);
  }, [readingMode]);

  // show/hide scroll top button based on scroll
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const smoothScrollTo = useCallback((element) => {
    if (!element) return;
    // center the element smoothly
    const target = element.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + element.getBoundingClientRect().height / 2;
    window.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (lastReadAyah && ayahRefs.current[lastReadAyah]) {
      smoothScrollTo(ayahRefs.current[lastReadAyah]);
    }
  }, [currentSurah, currentPara, lastReadAyah, smoothScrollTo]);

  const keyFor = (s, a) => `${s}-${a}`;

  // Fetch Surah
  const fetchSurah = async (surahNumber) => {
    try {
      prefetchAbortRef.current = false;
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const json = await res.json();
      if (json?.data) {
        setCurrentSurah(json.data);
        setCurrentPara(null);
        setAudioProgress(0);
        // reset ayahRefs and translations prefetch
        ayahRefs.current = {};
        prefetchTranslationsForSurah(surahNumber, json.data.numberOfAyahs);
      }
    } catch (err) {
      console.error("fetchSurah", err);
    }
  };

  // Fetch Para
  const fetchPara = async (paraNumber) => {
    try {
      const p = paraList.find((x) => x.number === paraNumber);
      if (!p) return;
      const ayahs = [];
      for (let s = p.start.surah; s <= p.end.surah; s++) {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${s}`);
        const json = await res.json();
        if (json?.data) {
          const startAyah = s === p.start.surah ? p.start.ayah : 1;
          const endAyah = s === p.end.surah ? p.end.ayah : json.data.numberOfAyahs;
          for (let a = startAyah; a <= endAyah; a++) {
            ayahs.push({ surah: s, ayah: a, text: json.data.ayahs[a - 1].text });
          }
        }
      }
      setCurrentPara({ ...p, ayahs });
      setCurrentSurah(null);
      ayahRefs.current = {};
    } catch (err) {
      console.error("fetchPara", err);
    }
  };

  // Prefetch translations (batched, cancellable)
  const prefetchTranslationsForSurah = async (surahNumber, ayahCount) => {
    const chunk = 10; // slightly bigger chunk to reduce requests
    prefetchAbortRef.current = false;

    for (let i = 1; i <= ayahCount; i += chunk) {
      if (prefetchAbortRef.current) break;
      const batch = Array.from({ length: Math.min(chunk, ayahCount - i + 1) }, (_, k) => i + k);
      try {
        // map translators to fetch requests per ayah in parallel
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
      } catch (e) {
        // non-fatal
      }
      // small pause to be gentle on the API
      await new Promise((res) => setTimeout(res, 60));
    }
  };

  // Audio play/pause Surah (improved rAF sync and safer cleanup)
  const handlePlayPause = (surah) => {
    if (!surah) return;
    const sNum = surah.number;
    const url = surah.audio || `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${sNum}.mp3`;

    // stop if same surah playing
    if (audioRef.current && playingSurah === sNum) {
      audioRef.current.pause();
      setPlayingSurah(null);
      setAudioProgress(0);
      syncingRef.current = false;
      cancelAnimationFrame(rafRef.current);
      audioRef.current = null;
      return;
    }

    // stop previous audio
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
      cancelAnimationFrame(rafRef.current);
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
        // basic approximate ayah sync if currentSurah loaded
        if (currentSurah && syncingRef.current) {
          const total = currentSurah.numberOfAyahs;
          const frac = audio.currentTime / (audio.duration || 1);
          const approximateIndex = Math.min(total, Math.max(1, Math.round(frac * total)));
          const k = keyFor(currentSurah.number, approximateIndex);
          if (ayahRefs.current[k]) {
            const el = ayahRefs.current[k];
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.25 || rect.bottom > window.innerHeight * 0.75) {
              // gentle scroll using our smoothScrollTo
              smoothScrollTo(el);
            }
          }
        }
      } catch {}
      rafRef.current = requestAnimationFrame(update);
    };

    const ended = () => {
      setPlayingSurah(null);
      setAudioProgress(0);
      syncingRef.current = false;
      cancelAnimationFrame(rafRef.current);
      audioRef.current = null;
    };

    audio.addEventListener("ended", ended);
    audio.addEventListener("play", () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    });
    audio.addEventListener("pause", () => {
      cancelAnimationFrame(rafRef.current);
    });

    audio.play().catch((e) => {
      console.error("audio play failed", e);
      setPlayingSurah(null);
      cancelAnimationFrame(rafRef.current);
      audioRef.current = null;
    });
  };

  // Bookmark toggle
  const toggleBookmark = (surahNumber, ayahNumber) => {
    const k = keyFor(surahNumber, ayahNumber);
    setBookmarks((prev) => {
      const next = prev.includes(k) ? prev.filter((x) => x !== k) : [k, ...prev];
      return next;
    });
    setLastReadAyah(k);
  };

  // Share Ayah (copy to clipboard fallback to prompt ok)
  const shareAyah = async (surahNumber, ayahNumber) => {
    const k = keyFor(surahNumber, ayahNumber);
    const tr = translations[k] || {};
    const arabic = currentSurah?.ayahs?.[ayahNumber - 1]?.text || "";
    const ur = tr["ur.jalandhry"] || "";
    const en = tr["en.asad"] || "";
    const text = `${arabic}\n\nUrdu: ${ur}\nEnglish: ${en}`;
    try {
      await navigator.clipboard.writeText(text);
      // light UI feedback — use native alert as minimal
      alert("Ayah copied to clipboard!");
    } catch {
      prompt("Copy this text:", text);
    }
  };

  // Filter Surah list (debounced input handled via setter)
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return surahList;
    return surahList.filter((s) => (s.englishName || s.name || "").toLowerCase().includes(q));
  }, [surahList, searchQuery]);

  // Animation variants
  const listVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
  const itemVariants = { hidden: { opacity: 0, x: -14 }, visible: { opacity: 1, x: 0 }, hover: { scale: 1.02 } };

  /* -------------------
     STYLING: Glassy, Royal Blue & Gold accents (enhanced)
     ------------------- */

  const rootBg = darkMode
    ? "linear-gradient(180deg, rgba(6,10,16,1) 0%, rgba(12,20,30,1) 100%)"
    : "linear-gradient(180deg, rgba(245,249,255,1) 0%, rgba(233,249,255,1) 100%)";

  const panelBase = {
    borderRadius: 18,
    padding: 18,
    transition: "all 0.35s cubic-bezier(.2,.9,.3,1)",
    backdropFilter: "blur(8px)",
  };

  const glassLight = {
    background: darkMode
      ? "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.03))"
      : "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.6))",
    border: darkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(255,255,255,0.6)",
  };

  const glassAccent = {
    boxShadow: darkMode ? "0 8px 30px rgba(2,8,23,0.6)" : "0 6px 20px rgba(10,20,40,0.06)",
  };

  const gold = "#ffd86b";
  const royal = "#0d6efd"; // Royal blue accent
  const shimmer = "linear-gradient(90deg, rgba(13,110,253,0.16), rgba(255,216,107,0.16))";

  // helper: scroll to top
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Keyboard shortcuts: space toggle play/pause for current surah; "L" last read; M toggle reading
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " " && currentSurah) {
        e.preventDefault();
        handlePlayPause(currentSurah);
      } else if ((e.key === "l" || e.key === "L") && lastReadAyah) {
        const el = ayahRefs.current[lastReadAyah];
        if (el) smoothScrollTo(el);
      } else if ((e.key === "m" || e.key === "M")) {
        setReadingMode((rm) => (rm === "comfortable" ? "compact" : "comfortable"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentSurah, lastReadAyah, smoothScrollTo]);

  // clickable progress bar seek (for playingSurah)
  const seekAudio = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    audioRef.current.currentTime = pct * audioRef.current.duration;
    setAudioProgress(pct * 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      prefetchAbortRef.current = true;
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // UX: clever input handler with debounce
  const onSearchChange = (v) => {
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(v);
    }, 180);
  };

  return (
    <div
      style={{
        padding: 18,
        fontFamily: "Poppins, Noto Naskh Arabic, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        WebkitFontSmoothing: "antialiased",
        background: rootBg,
        minHeight: "100vh",
      }}
      className="quran-root"
    >
      <div style={{ padding: 18, borderRadius: 16, minHeight: "70vh", transition: "background .35s ease" }}>
        <div style={{ ...panelBase, ...glassLight, ...glassAccent, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: 20 }}>
          {/* Header Left */}
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <motion.img
              src="https://cdn-icons-png.flaticon.com/512/4729/4729848.png"
              alt="logo"
              whileHover={{ rotate: -6, scale: 1.04 }}
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
              style={{ width: 64, height: 64, borderRadius: 14, boxShadow: "0 6px 18px rgba(13,110,253,0.12)" }}
            />
            <div>
              <div style={{ fontWeight: 900, fontSize: 22, color: darkMode ? gold : royal, letterSpacing: 0.5 }}>الْقُرْآنُ الْکَرِيمُ</div>
              <div style={{ fontSize: 12, color: darkMode ? "#bfcfdc" : "#556", marginTop: 3 }}>Recitation • Translation (Urdu / English)</div>
            </div>
          </div>

          {/* Header Right (controls) */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Translation selector */}
            <motion.select
              value={selectedTranslationKey}
              onChange={(e) => setSelectedTranslationKey(e.target.value)}
              whileTap={{ scale: 0.985 }}
              style={{
                padding: "8px 10px",
                borderRadius: 12,
                border: 0,
                outline: "none",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
                color: darkMode ? "#e8eef7" : "#153e4a",
                fontWeight: 600,
                cursor: "pointer",
                transition: "transform .18s ease",
              }}
            >
              {translators.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </motion.select>

            {/* Search */}
            <motion.input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Surah..."
              whileFocus={{ scale: 1.01 }}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: 0,
                outline: "none",
                width: 180,
                background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.85)",
                boxShadow: darkMode ? "inset 0 1px 0 rgba(255,255,255,0.02)" : "inset 0 1px 0 rgba(0,0,0,0.04)",
                color: darkMode ? "#e8eef7" : "#123",
                transition: "all .18s ease",
              }}
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => {
                setCurrentSurah(null);
                setCurrentPara(null);
                setSearchQuery("");
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: `linear-gradient(90deg, ${royal}, ${gold})`,
                color: "#fff",
                fontWeight: 700,
                boxShadow: "0 6px 20px rgba(13,110,253,0.18)",
                transformOrigin: "center",
              }}
            >
              Reset
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => setViewMode(viewMode === "surah" ? "para" : "surah")}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)",
                color: darkMode ? "#e8eef7" : "#0b5564",
                fontWeight: 700,
                boxShadow: darkMode ? "0 6px 20px rgba(0,0,0,0.45)" : "0 6px 14px rgba(0,0,0,0.06)",
              }}
            >
              {viewMode === "surah" ? "View Para" : "View Surah"}
            </motion.button>

            {/* Reading mode toggle */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => setReadingMode(readingMode === "comfortable" ? "compact" : "comfortable")}
              title="Toggle reading mode (M)"
              style={{
                padding: "8px 10px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: readingMode === "comfortable" ? `linear-gradient(90deg, ${royal}, ${gold})` : "rgba(255,255,255,0.06)",
                color: "#fff",
                fontWeight: 700,
                boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
              }}
            >
              {readingMode === "comfortable" ? "Comfort" : "Compact"}
            </motion.button>

            {/* Theme quick toggle (local override only) */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => setLocalDark((d) => !d)}
              title="Toggle theme"
              style={{
                padding: "8px 10px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(13,110,253,0.12)",
                color: darkMode ? "#e8eef7" : "#0b5564",
                fontWeight: 700,
                boxShadow: "0 6px 10px rgba(0,0,0,0.06)",
              }}
            >
              {darkMode ? "Dark" : "Light"}
            </motion.button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", gap: 18, marginTop: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Sidebar list */}
          {viewMode === "surah" ? (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              style={{
                width: 330,
                maxHeight: 560,
                overflowY: "auto",
                padding: 12,
                borderRadius: 14,
                ...glassLight,
                ...glassAccent,
                position: "relative",
              }}
            >
              {filtered.length === 0 && <div style={{ padding: 12, color: darkMode ? "#cbd5e1" : "#406c79" }}>{searchQuery ? "No surah found" : "Loading..."}</div>}
              <AnimatePresence>
                {filtered.map((s) => (
                  <motion.div
                    key={s.number}
                    onClick={() => fetchSurah(s.number)}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.995 }}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      cursor: "pointer",
                      marginBottom: 10,
                      background: currentSurah?.number === s.number ? (darkMode ? "linear-gradient(90deg,#071a2b, #092235)" : "linear-gradient(90deg,#f0fdff,#dff7ff)") : "transparent",
                      border: currentSurah?.number === s.number ? `1px solid ${gold}` : "1px solid rgba(255,255,255,0.02)",
                      transition: "all .18s ease",
                      boxShadow: currentSurah?.number === s.number ? `0 8px 30px rgba(13,110,253,0.08)` : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 800, color: darkMode ? "#e8eef7" : "#04354a" }}>{s.number}. {s.englishName}</div>
                      <div style={{ fontSize: 11, color: darkMode ? "#9fb0c2" : "#3b6f7a" }}>{s.revelationType}</div>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, color: darkMode ? "#98a9b8" : "#456" }}>Ayahs: {s.numberOfAyahs}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              style={{
                width: 330,
                maxHeight: 560,
                overflowY: "auto",
                padding: 12,
                borderRadius: 14,
                ...glassLight,
                ...glassAccent,
              }}
            >
              <AnimatePresence>
                {paraList.map((p) => (
                  <motion.div
                    key={p.number}
                    onClick={() => fetchPara(p.number)}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.995 }}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      cursor: "pointer",
                      marginBottom: 10,
                      background: currentPara?.number === p.number ? (darkMode ? "linear-gradient(90deg,#071a2b, #092235)" : "linear-gradient(90deg,#f0fdff,#dff7ff)") : "transparent",
                      border: currentPara?.number === p.number ? `1px solid ${gold}` : "1px solid rgba(255,255,255,0.02)",
                      transition: "all .18s ease",
                    }}
                  >
                    <div style={{ fontWeight: 800, color: darkMode ? "#e8eef7" : "#04354a" }}>{p.number}. {p.name}</div>
                    <div style={{ marginTop: 6, fontSize: 12, color: darkMode ? "#98a9b8" : "#456" }}>
                      From Surah {p.start.surah}, Ayah {p.start.ayah} to Surah {p.end.surah}, Ayah {p.end.ayah}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Content Area */}
          <div style={{ flex: 1, minWidth: 360 }}>
            {!currentSurah && !currentPara ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 20, ...panelBase, ...glassLight }}>
                <div style={{ fontSize: 16, color: darkMode ? "#cfe9f5" : "#123", fontWeight: 700 }}>Select a Surah or Para from the list to view content.</div>
                <div style={{ marginTop: 10, color: darkMode ? "#9fb0c2" : "#456" }}>Use Play to listen, Bookmark to save, and Share to copy the ayah text.</div>
              </motion.div>
            ) : currentSurah ? (
              <div>
                {/* Surah header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 20, color: darkMode ? gold : royal }}>{currentSurah.name} — <span style={{ color: darkMode ? "#d6e8f5" : "#2b5566", fontWeight: 600 }}>{currentSurah.englishName}</span></h2>
                    <div style={{ fontSize: 12, color: "#8899a6" }}>Surah #{currentSurah.number} • Ayahs: {currentSurah.numberOfAyahs}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <motion.button whileHover={{ scale: 1.04 }} onClick={() => handlePlayPause(currentSurah)} style={{
                      padding: "10px 14px", borderRadius: 12, border: "none",
                      background: playingSurah === currentSurah.number ? `linear-gradient(90deg,#ff6b6b, #dc3545)` : `linear-gradient(90deg, ${royal}, ${gold})`,
                      color: "#fff", cursor: "pointer", fontWeight: 800, boxShadow: "0 10px 30px rgba(13,110,253,0.12)"
                    }}>
                      {playingSurah === currentSurah.number ? "⏸ Stop" : "🔊 Play"}
                    </motion.button>
                    {/* quick jump to last read */}
                    <motion.button whileHover={{ scale: 1.04 }} onClick={() => {
                      if (lastReadAyah && ayahRefs.current[lastReadAyah]) smoothScrollTo(ayahRefs.current[lastReadAyah]);
                    }} style={{
                      padding: "10px 14px", borderRadius: 12, border: "none",
                      background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)",
                      color: darkMode ? "#e8eef7" : "#0b5564", cursor: "pointer", fontWeight: 700
                    }}>
                      ⤴ Last Read
                    </motion.button>
                  </div>
                </div>

                {/* Audio progress (clickable to seek) */}
                {playingSurah === currentSurah.number && (
                  <motion.div layout style={{ width: "100%", height: 12, background: darkMode ? "rgba(255,255,255,0.03)" : "#eef6fb", borderRadius: 12, marginBottom: 14, overflow: "hidden", cursor: "pointer" }} onClick={seekAudio}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${audioProgress}%` }} transition={{ ease: "linear" }} style={{ height: "100%", background: `linear-gradient(90deg, ${royal}, ${gold})`, boxShadow: "0 8px 30px rgba(13,110,253,0.12)" }} />
                  </motion.div>
                )}

                {/* Bismillah */}
                {currentSurah.number !== 9 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", marginBottom: 16, fontSize: 24, fontWeight: 700, color: darkMode ? gold : royal, fontFamily: "Noto Naskh Arabic, serif" }}>
                    بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ
                  </motion.div>
                )}

                {/* Ayahs */}
                <div style={{ maxHeight: 560, overflowY: "auto", paddingRight: 12 }}>
                  <AnimatePresence>
                    {currentSurah.ayahs.map((ayahObj, idx) => {
                      const ayahNumber = idx + 1;
                      const k = keyFor(currentSurah.number, ayahNumber);
                      const tr = translations[k] || {};
                      const isBook = bookmarks.includes(k);

                      // reading-mode styles (enhanced)
                      const ayahPadding = readingMode === "compact" ? 10 : 18;
                      const ayahFontSize = readingMode === "compact" ? 20 : 22;
                      const ayahCardBg = darkMode ? "linear-gradient(135deg,#071428,#0d2136)" : "linear-gradient(135deg,#ffffff,#f7fffb)";

                      return (
                        <motion.div key={k} ref={(el) => (ayahRefs.current[k] = el)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 18 } }}
                          exit={{ opacity: 0, y: 10 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.995 }}
                          style={{
                            padding: ayahPadding,
                            marginBottom: 14,
                            borderRadius: 14,
                            background: ayahCardBg,
                            color: darkMode ? "#e8eef7" : "#111",
                            boxShadow: darkMode ? "0 12px 30px rgba(0,0,0,0.45)" : "0 6px 20px rgba(20,30,50,0.04)",
                            border: `1px solid ${darkMode ? "rgba(255,255,255,0.02)" : "rgba(10,20,40,0.02)"}`,
                            transition: "all 0.25s ease",
                          }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div style={{ minWidth: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: darkMode ? "#9fb0c2" : "#0b5564" }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(13,110,253,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                                {ayahNumber}
                              </div>
                            </div>

                            <div style={{ flex: 1, textAlign: "right" }}>
                              <div style={{ fontSize: ayahFontSize, lineHeight: 1.6, direction: "rtl", fontWeight: 800, fontFamily: "Noto Naskh Arabic, serif", color: darkMode ? gold : royal }}>
                                {ayahObj.text}
                              </div>

                              <div style={{ marginTop: 10, color: darkMode ? "#cfe6f6" : "#2b3b3f", display: "grid", gap: 8 }}>
                                <div style={{ fontSize: 14 }}>
                                  <span style={{ fontWeight: 700, color: darkMode ? "#e8eef7" : "#0b5564" }}>Urdu:</span> <span style={{ marginLeft: 6 }}>{tr["ur.jalandhry"] || "Loading..."}</span>
                                </div>
                                <div style={{ fontSize: 14 }}>
                                  <span style={{ fontWeight: 700, color: darkMode ? "#e8eef7" : "#0b5564" }}>English:</span> <span style={{ marginLeft: 6 }}>{tr["en.asad"] || "Loading..."}</span>
                                </div>
                              </div>

                              <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                <motion.button whileHover={{ scale: 1.03 }} onClick={() => toggleBookmark(currentSurah.number, ayahNumber)} style={{ padding: "8px 12px", borderRadius: 10, border: 0, background: isBook ? "#ffc107" : "#6c757d", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                                  {isBook ? "Saved" : "Bookmark"}
                                </motion.button>

                                <motion.button whileHover={{ scale: 1.03 }} onClick={() => { setLastReadAyah(k); smoothScrollTo(ayahRefs.current[k]); }} style={{ padding: "8px 12px", borderRadius: 10, border: 0, background: `linear-gradient(90deg, ${royal}, ${gold})`, color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                                  Mark read
                                </motion.button>

                                <motion.button whileHover={{ scale: 1.03 }} onClick={() => shareAyah(currentSurah.number, ayahNumber)} style={{ padding: "8px 12px", borderRadius: 10, border: 0, background: "#6f42c1", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
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
            ) : (
              // Para view (kept content/logic intact)
              <div style={{ maxHeight: 560, overflowY: "auto", paddingRight: 8 }}>
                {currentPara.ayahs.map((ayahObj) => {
                  const ayahStyle = {
                    color: darkMode ? "#fff" : "#05202a",
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: 2,
                    textAlign: "right",
                    direction: "rtl",
                    marginBottom: 12,
                    padding: 12,
                    borderRadius: 12,
                    background: darkMode ? "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))" : "linear-gradient(135deg,#f5fbff,#f7fff7)",
                    boxShadow: darkMode ? "0 8px 30px rgba(0,0,0,0.5)" : "0 6px 18px rgba(0,0,0,0.04)",
                  };
                  return (
                    <div key={`${ayahObj.surah}-${ayahObj.ayah}`} style={ayahStyle}>
                      {ayahObj.text} ★
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Floating controls */}
        <div style={{ position: "fixed", right: 20, bottom: 24, display: "flex", flexDirection: "column", gap: 10, zIndex: 1200 }}>
          {showScrollTop && (
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.05 }} onClick={scrollToTop} style={{ padding: 10, borderRadius: 12, border: "none", background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.95)", boxShadow: "0 10px 30px rgba(0,0,0,0.12)", cursor: "pointer" }}>
              ⬆ Top
            </motion.button>
          )}

          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.04 }} onClick={() => {
            if (playingSurah && audioRef.current) {
              audioRef.current.pause();
            } else if (currentSurah) {
              handlePlayPause(currentSurah);
            }
          }} style={{ padding: 10, borderRadius: 12, border: "none", background: playingSurah ? "linear-gradient(90deg,#ff6b6b,#dc3545)" : `linear-gradient(90deg, ${royal}, ${gold})`, color: "#fff", boxShadow: "0 10px 30px rgba(13,110,253,0.12)", cursor: "pointer" }}>
            {playingSurah ? "⏸" : "▶"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default QuranSection;
