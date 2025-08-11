import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus, FolderPlus, Edit2, Trash2, GripVertical, X,
  CalendarDays, Menu, Flag, Filter, Pin, StickyNote, Sun, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
export default function TodoApp() {
  // ===== Storage Keys =====
  const CATS_KEY = "todo:categories";
  const TASKS_KEY = "todo:tasks";
  const COLORS_KEY = "todo:catColors";
  const THEME_KEY = "todo:theme";
  const LANG_KEY = "todo:lang";

  // ===== Theme =====
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || "dark"; } catch { return "dark"; }
  });
  useEffect(() => { try { localStorage.setItem(THEME_KEY, theme); } catch {} }, [theme]);

  // ===== Language =====
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || "en"; } catch { return "en"; }
  });
  useEffect(() => { try { localStorage.setItem(LANG_KEY, lang); } catch {} }, [lang]);
  const isAR = lang === "ar";
  const dir = isAR ? "rtl" : "ltr";

  // ===== i18n strings =====
  const S = useMemo(() => ({
    en: {
      appTitle: "To-Do List",
      sections: "Sections",
      new: "New",
      sectionName: "Section name",
      add: "Add",
      all: "All",
      general: "General",
      noTasks: "No tasks in this section yet",
      stats: (d, l, t) => `${d} done • ${l} left • ${t} total`,
      dateLocale: "en-US",
      priority: "Set priority",
      urgent: "Urgent",
      low: "Low",
      notes: "Task Notes",
      notesPh: "Write more details about this task…",
      rename: "Rename Section",
      newName: "New name",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      deleteTitle: "Delete Section",
      deleteMsg: "This will move all tasks in this section to General. Continue?",
      confirmReset: "Delete all data? Sections and tasks will be permanently removed.",
      limitSections: "Sorry, you can't add more than 5 sections.",
      langBtn: "AR",
      menu: "Menu",
      priorityBtn: "Priority",
      deleteBtn: "Delete",
      pin: "Pin",
      unpin: "Unpin",
      notesBtn: "Notes",
      light: "Light",
      dark: "Dark",
    },
    ar: {
      appTitle: "قائمة المهام",
      sections: "الأقسام",
      new: "جديد",
      sectionName: "اسم القسم",
      add: "إضافة",
      all: "الكل",
      general: "عام",
      noTasks: "لا توجد مهام في هذا القسم بعد",
      stats: (d, l, t) => `${d} منجزة • ${l} متبقية • ${t} الإجمالي`,
      dateLocale: "ar",
      priority: "تعيين الأولوية",
      urgent: "عاجلة",
      low: "منخفضة",
      notes: "ملاحظات المهمة",
      notesPh: "اكتب تفاصيل أكثر عن هذه المهمة…",
      rename: "إعادة تسمية القسم",
      newName: "الاسم الجديد",
      cancel: "إلغاء",
      save: "حفظ",
      delete: "حذف",
      deleteTitle: "حذف القسم",
      deleteMsg: "سيتم نقل كل المهام في هذا القسم إلى قسم «عام». هل تريد المتابعة؟",
      confirmReset: "هل تريد حذف كل البيانات؟ سيتم مسح الأقسام والمهام نهائيًا.",
      limitSections: "عذرًا، لا يمكنك إضافة أكثر من 5 أقسام.",
      langBtn: "EN",
      menu: "القائمة",
      priorityBtn: "الأولوية",
      deleteBtn: "حذف",
      pin: "تثبيت",
      unpin: "إلغاء التثبيت",
      notesBtn: "ملاحظات",
      light: "فاتح",
      dark: "داكن",
    }
  }), []);
  const t = (k, ...args) => {
    const pack = S[lang]; const val = pack[k];
    return typeof val === "function" ? val(...args) : val;
  };

  // ===== Theme-dependent classes =====
  const T = useMemo(() => {
    const dark = theme === "dark";
    return {
      root: dark ? "bg-[#0b0f1a] text-white" : "bg-[#f6f8fb] text-gray-900",
      header: dark ? "border-white/10 bg-[#0b0f1a]/80" : "border-gray-200 bg-white/70",
      card: dark ? "bg-white/5" : "bg-white",
      border: dark ? "border-white/10" : "border-gray-200",
      input: dark ? "bg-[#0f1629] text-white placeholder:text-white/40" : "bg-white text-gray-900 placeholder:text-gray-400",
      stat: dark ? "text-white/70" : "text-gray-600",
      progressTrack: dark ? "bg-white/10" : "bg-gray-200",
      listItem: dark ? "bg-[#0f1629]" : "bg-white",
      hoverRow: dark ? "hover:bg-white/10" : "hover:bg-gray-50",
      menuBg: dark ? "bg-[#0f1629]" : "bg-white",
      menuTextDanger: dark ? "text-rose-400 hover:bg-rose-500/10" : "text-rose-600 hover:bg-rose-50",
      emptyText: dark ? "text-white/60" : "text-gray-500",
      emptyBorder: dark ? "border-white/10" : "border-gray-200",
      pillUrgent: dark ? "bg-rose-500/20 text-rose-300" : "bg-rose-100 text-rose-700",
      pillLow: dark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700",
      pillPinned: dark ? "bg-white/10 text-white/80" : "bg-gray-100 text-gray-700",
    };
  }, [theme, lang]);

  // ===== Category colors palette =====
  const PALETTE = ["bg-rose-400","bg-amber-400","bg-emerald-400","bg-cyan-400","bg-sky-400","bg-blue-400","bg-indigo-400","bg-violet-400","bg-fuchsia-400"];

  // ===== Categories =====
  const [categories, setCategories] = useState(() => {
    try { const raw = localStorage.getItem(CATS_KEY); if (raw) return JSON.parse(raw); return ["general"]; } catch { return ["general"]; }
  });
  const [active, setActive] = useState("all");

  // Colors mapping {cat: class}
  const [catColors, setCatColors] = useState(() => {
    try { const raw = localStorage.getItem(COLORS_KEY); if (raw) return JSON.parse(raw);} catch {}
    return { general: PALETTE[2] };
  });

  // New Section inline form
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatError, setNewCatError] = useState("");
  const newCatRef = useRef(null);

  // ===== Tasks =====
  const [tasks, setTasks] = useState(() => {
    try { const raw = localStorage.getItem(TASKS_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });

  // ===== Persist =====
  useEffect(() => { try { localStorage.setItem(CATS_KEY, JSON.stringify(categories)); } catch {} }, [categories]);
  useEffect(() => { try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); } catch {} }, [tasks]);
  useEffect(() => { try { localStorage.setItem(COLORS_KEY, JSON.stringify(catColors)); } catch {} }, [catColors]);

  // ===== Helpers =====
  const sanitize = (s) => (s || "").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/[<>]/g, "").trim();
  const uid = () => Math.random().toString(36).slice(2, 10);
  const labelOf = (cat) => (cat === "general" ? t("general") : cat === "all" ? t("all") : cat);
  const colorOf = (cat) => catColors[cat] || "bg-white/40";

  // ===== Sounds (Web Audio) =====
  const audioCtxRef = useRef(null);
  const ensureCtx = () => {
    const AudioCtx = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
    if (!AudioCtx) return null;
    audioCtxRef.current = audioCtxRef.current || new AudioCtx();
    return audioCtxRef.current;
  };
  const playDone = () => {
    try { const ctx = ensureCtx(); if (!ctx) return; const t0 = ctx.currentTime;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "triangle"; o.frequency.setValueAtTime(880, t0);
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.18, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28); o.connect(g); g.connect(ctx.destination);
      o.start(t0); o.stop(t0 + 0.3);
    } catch {}
  };
  const playDelete = () => {
    try { const ctx = ensureCtx(); if (!ctx) return; const t0 = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(300, t0); o.frequency.exponentialRampToValueAtTime(240, t0 + 0.18);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.06, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22); o.connect(g); g.connect(ctx.destination);
      o.start(t0); o.stop(t0 + 0.24);
      const bufferSize = 0.16 * ctx.sampleRate; const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0); for (let i=0;i<bufferSize;i++) data[i]=(Math.random()*2-1)*(1-i/bufferSize);
      const noise = ctx.createBufferSource(); noise.buffer = noiseBuffer;
      const lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=750; lp.Q.value=0.7;
      const gN = ctx.createGain(); gN.gain.setValueAtTime(0.0001, t0); gN.gain.linearRampToValueAtTime(0.03, t0 + 0.01);
      gN.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14); noise.connect(lp); lp.connect(gN); gN.connect(ctx.destination);
      noise.start(t0); noise.stop(t0 + 0.16);
    } catch {}
  };

  // ===== Actions: tasks =====
  const addTask = (text) => {
    const txt = sanitize(text); if (!txt) return;
    const target = active === "all" ? "general" : active;
    setTasks((arr) => [...arr, { id: uid(), text: txt, done: false, category: target, priority: "normal", pinned: false, note: "" }]);
  };
  const toggleTask = (id) => {
    setTasks((arr) => arr.map((t) => {
      if (t.id === id) {
        const newDone = !t.done; if (newDone) playDone();
        return { ...t, done: newDone };
      }
      return t;
    }));
  };
  const deleteTask = (id) => { playDelete(); setTasks((arr) => arr.filter((t) => t.id !== id)); };
  const setPriority = (id, p) => setTasks((arr)=> arr.map(t=> t.id===id? {...t, priority: p}: t));
  const togglePin = (id) => setTasks((arr)=> arr.map(t=> t.id===id? {...t, pinned: !t.pinned}: t));
  const setNote = (id, value) => setTasks((arr)=> arr.map(t=> t.id===id? {...t, note: value}: t));

  // ===== Actions: categories =====
  const createCategory = () => {
    const clean = sanitize(newCatName);
    if (!clean || clean === "all" || clean === "general") return;
    const customCount = categories.filter(c => c !== "general").length;
    if (customCount >= 5) {
      const msg = t("limitSections");
      alert(msg);
      setNewCatError(msg);
      setNewCatOpen(true); setTimeout(() => newCatRef.current?.focus(), 0);
    } else {
      if (!categories.includes(clean)) {
        setCategories((cs) => [...cs, clean]);
        const used = Object.keys(catColors).length; const color = PALETTE[used % PALETTE.length];
        setCatColors((m) => ({ ...m, [clean]: color }));
      }
      setActive(clean); setNewCatName(""); setNewCatError(""); setNewCatOpen(false);
    }
  };
  const renameCategory = (oldName, newName) => {
    const clean = sanitize(newName || "");
    if (!clean || clean === oldName || oldName === "general" || oldName === "all" || clean === "all" || clean === "general" || categories.includes(clean)) return;
    setCategories((cs) => cs.map((c) => (c === oldName ? clean : c)));
    setTasks((arr) => arr.map((t) => (t.category === oldName ? { ...t, category: clean } : t)));
    setCatColors((m) => { const { [oldName]: oldColor, ...rest } = m; return { ...rest, [clean]: oldColor || PALETTE[0] }; });
    if (active === oldName) setActive(clean);
  };
  const deleteCategory = (cat) => {
    if (cat === "general" || cat === "all") return;
    setCategories((cs) => cs.filter((c) => c !== cat));
    setTasks((arr) => arr.map((t) => (t.category === cat ? { ...t, category: "general" } : t)));
    setCatColors((m) => { const { [cat]: _, ...rest } = m; return rest; });
    if (active === cat) setActive("all");
  };

  // Drag & drop reorder (sections)
  const dragCat = useRef(null);
  const onDragStart = (cat) => (e) => { if (cat === "all") return; dragCat.current = cat; e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (cat) => (e) => { if (cat === "all") return; e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const onDrop = (overCat) => (e) => {
    e.preventDefault(); if (overCat === "all") return; const from = dragCat.current; dragCat.current = null; if (!from || from === overCat) return;
    setCategories((cs) => { const arr = [...cs]; const i = arr.indexOf(from); const j = arr.indexOf(overCat); if (i === -1 || j === -1) return cs; arr.splice(i,1); arr.splice(j,0,from); return arr; });
  };

  // ===== Section context menu =====
  const [secMenu, setSecMenu] = useState({ open: false, x: 0, y: 0, cat: null });
  const secMenuRef = useRef(null);
  const openSecMenu = (e, cat) => { e.preventDefault(); if (cat === "all") return; setSecMenu({ open: true, x: e.clientX, y: e.clientY, cat }); };
  useEffect(() => {
    const onDocClick = (e) => { if (!secMenu.open) return; if (secMenuRef.current && !secMenuRef.current.contains(e.target)) setSecMenu((m) => ({ ...m, open: false })); };
    const onEsc = (e) => { if (e.key === "Escape") setSecMenu((m) => ({ ...m, open: false })); };
    document.addEventListener("mousedown", onDocClick); document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDocClick); document.removeEventListener("keydown", onEsc); };
  }, [secMenu.open]);

  const [renameModal, setRenameModal] = useState({ open: false, cat: null, value: "" });
  const [deleteModal, setDeleteModal] = useState({ open: false, cat: null });
  const [noteModal, setNoteModal] = useState({ open: false, id: null, value: "" });

  // ===== UI derived =====
  const [prioFilter, setPrioFilter] = useState('all');
  const inputRef = useRef(null);
  const today = useMemo(
    () => new Intl.DateTimeFormat(S[lang].dateLocale, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date()),
    [lang]
  );
  const baseTasks = useMemo(() => active === 'all' ? tasks : tasks.filter((t) => t.category === active), [tasks, active]);
  const filtered = useMemo(() => prioFilter === 'all' ? baseTasks : baseTasks.filter((t)=> (t.priority||'normal') === prioFilter), [baseTasks, prioFilter]);
  const visibleTasks = useMemo(() => {
    const pinned = filtered.filter(t=> t.pinned);
    const rest = filtered.filter(t=> !t.pinned);
    return [...pinned, ...rest];
  }, [filtered]);
  const doneCount = visibleTasks.filter((t) => t.done).length;
  const progress = visibleTasks.length ? Math.round((doneCount / visibleTasks.length) * 100) : 0;

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Per-task small menu
  const [taskMenu, setTaskMenu] = useState({ open: false, x: 0, y: 0, id: null });
  const taskMenuRef = useRef(null);
  const openTaskMenu = (e, id) => { e.preventDefault(); setTaskMenu({ open: true, x: e.clientX, y: e.clientY, id }); };
  useEffect(()=>{
    const onDoc = (e) => { if (!taskMenu.open) return; if (taskMenuRef.current && !taskMenuRef.current.contains(e.target)) setTaskMenu((m)=> ({...m, open:false})); };
    const onEsc = (e) => { if (e.key==='Escape') setTaskMenu((m)=> ({...m, open:false})); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onEsc);
    return ()=>{ document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onEsc); };
  }, [taskMenu.open]);

  // ===== Animated gradient background =====
  const gradientCss = `@keyframes gradientMove { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
    @keyframes floatSlow { 0% { transform: translateY(0px); } 100% { transform: translateY(-16px); } }`;

  // ===== Progress Ring =====
  const ProgressRing = ({ value }) => {
    const dark = theme === 'dark';
    const r = 18; const c = 2 * Math.PI * r; const off = c * (1 - (value || 0)/100);
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0 sm:w-12 sm:h-12 w-10 h-10">
        <circle cx="24" cy="24" r={r} stroke={dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)"} strokeWidth="6" fill="none" />
        <circle cx="24" cy="24" r={r} stroke="url(#grad)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 24 24)" />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399"/>
            <stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
        <text x="24" y="27" textAnchor="middle" fontSize="10" fill={dark?"white":"#111827"} opacity="0.8">{value}%</text>
      </svg>
    );
  };

  // ===== Reset All =====
  const resetAll = () => {
    if (!confirm(t("confirmReset"))) return;
    try {
      localStorage.removeItem(CATS_KEY);
      localStorage.removeItem(TASKS_KEY);
      localStorage.removeItem(COLORS_KEY);
    } catch {}
    setCategories(["general"]);
    setCatColors({ general: PALETTE[2] });
    setTasks([]);
    setActive("all");
    setPrioFilter("all");
  };

  // === NEW: corners based on language (fix add bar in RTL) ===
  const inputCorner = isAR ? "rounded-r-xl" : "rounded-l-xl";
  const btnCorner   = isAR ? "rounded-l-xl" : "rounded-r-xl";

  return (
    <div className={`min-h-screen ${T.root}`} dir={dir}>
      <style>{gradientCss}</style>
      <div className="fixed inset-0 -z-10 opacity-70" style={{
        backgroundImage: theme==='dark'
          ? "radial-gradient(40% 60% at 10% 20%, rgba(34,211,238,0.10) 0%, rgba(34,211,238,0.0) 60%), radial-gradient(35% 55% at 90% 80%, rgba(129,140,248,0.12) 0%, rgba(129,140,248,0.0) 60%), radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0) 70%)"
          : "radial-gradient(40% 60% at 10% 20%, rgba(34,211,238,0.10) 0%, rgba(34,211,238,0.0) 60%), radial-gradient(35% 55% at 90% 80%, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0.0) 60%), radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.06) 0%, rgba(99,102,241,0) 70%)" ,
        backgroundSize: "200% 200%",
        animation: "gradientMove 14s ease-in-out infinite alternate"
      }} />
      <div className={`pointer-events-none fixed inset-x-0 top-0 -z-10 h-56 sm:h-64 animate-[floatSlow_6s_ease-in-out_infinite_alternate] ${theme==='dark'? 'bg-gradient-to-b from-white/5 to-transparent':'bg-gradient-to-b from-black/5 to-transparent'}`} />

      <header className={`sticky top-0 z-40 border-b ${T.header} backdrop-blur`}>
        <div className="mx-auto max-w-6xl p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                className={`sm:hidden rounded-lg border ${T.border} ${theme==='dark'? 'bg-white/5':'bg-white'} p-2`}
                onClick={()=>setSidebarOpen(s=>!s)} title={t("menu")}>
                <Menu className="h-5 w-5"/>
              </button>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{t("appTitle")}</h1>
              <span className={`hidden sm:inline text-sm ${T.stat}`}>• {labelOf(active)}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={resetAll}
                className={`rounded-lg border ${T.border} ${theme==='dark' ? 'bg-white/5 hover:bg-white/10 text-rose-300' : 'bg-white hover:bg-rose-50 text-rose-700'} p-2`}
                title="Reset all">
                <Trash2 className="h-4 w-4" />
              </button>

              {/* Theme */}
              <button
                onClick={()=> setTheme(theme==='dark'? 'light':'dark')}
                className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border ${T.border} ${theme==='dark'? 'bg-white/5 hover:bg-white/10':'bg-white hover:bg-gray-50'} px-2.5 py-1.5 sm:px-3 sm:py-2`}
                title={theme==='dark'? t("light") : t("dark")}>
                {theme==='dark'? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
                <span className="text-xs sm:text-sm font-medium">{theme==='dark'? t("light") : t("dark")}</span>
              </button>

              {/* Language */}
              <button
                onClick={()=> setLang(l => l === "en" ? "ar" : "en")}
                className={`inline-flex items-center gap-2 rounded-xl border ${T.border} ${theme==='dark'? 'bg-white/5 hover:bg-white/10':'bg-white hover:bg-gray-50'} px-3 py-2`}
                title="Language">
                <span className="text-sm font-medium">{S[lang].langBtn}</span>
              </button>
            </div>
          </div>

          {/* Row 2 */}
          <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
            <ProgressRing value={progress} />
            <div className={`flex items-center gap-2 rounded-xl border ${T.border} ${theme==='dark'? 'bg-white/5':'bg-white'} px-3 py-1.5`}>
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm">{today}</span>
            </div>

            {/* Priority filter */}
            <div className={`hidden sm:flex items-center gap-2 rounded-xl border ${T.border} ${theme==='dark'? 'bg-white/5':'bg-white'} px-2 py-1.5`}>
              <Filter className="h-4 w-4 opacity-80"/>
              <div className={`flex overflow-hidden rounded-lg border ${T.border}`}>
                <button onClick={()=>setPrioFilter('all')} className={`px-2 py-1 text-xs ${prioFilter==='all'?(theme==='dark'? 'bg-white/10':'bg-gray-100'):(theme==='dark'? 'hover:bg-white/5':'hover:bg-gray-50')}`}>{t("all")}</button>
                <button onClick={()=>setPrioFilter('urgent')} className={`px-2 py-1 text-xs ${prioFilter==='urgent'?(theme==='dark'? 'bg-white/10 text-rose-300':'bg-rose-50 text-rose-700'):(theme==='dark'? 'hover:bg-white/5':'hover:bg-gray-50')}`}>{t("urgent")}</button>
                <button onClick={()=>setPrioFilter('low')} className={`px-2 py-1 text-xs ${prioFilter==='low'?(theme==='dark'? 'bg-white/10 text-emerald-300':'bg-emerald-50 text-emerald-700'):(theme==='dark'? 'hover:bg-white/5':'hover:bg-gray-50')}`}>{t("low")}</button>
              </div>
            </div>
            <div className={`sm:hidden flex items-center gap-2 rounded-xl border ${T.border} ${theme==='dark'? 'bg-white/5':'bg-white'} px-2 py-1.5`}>
              <Filter className="h-4 w-4 opacity-80"/>
              <select value={prioFilter} onChange={(e)=>setPrioFilter(e.target.value)} className="bg-transparent text-xs focus:outline-none">
                <option value="all">{t("all")}</option>
                <option value="urgent">{t("urgent")}</option>
                <option value="low">{t("low")}</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4 sm:grid-cols-[260px_1fr]">
        {/* Backdrop */}
        {sidebarOpen && (
          <button className="sm:hidden fixed inset-0 z-40 bg-black/40" onClick={()=>setSidebarOpen(false)} aria-label="Close sidebar" />
        )}

        {/* Sidebar */}
        <aside className={`${sidebarOpen? 'sm:block fixed left-0 top-0 z-50 h-full w-[85%] max-w-xs p-3' : 'hidden sm:block p-3'} relative rounded-2xl border ${T.border} ${T.card} shadow-[0_8px_30px_rgb(0,0,0,0.12)]`}>
          <div className={`mb-2 flex items-center justify-between text-xs uppercase tracking-wide ${T.stat}`}>
            <span>{t("sections")}</span>
            <button onClick={() => { setNewCatOpen((v) => !v); setTimeout(() => newCatRef.current?.focus(), 0); }} className={`inline-flex items-center gap-2 rounded-lg border ${T.border} ${theme==='dark'? 'bg-white/5 hover:bg-white/10':'bg-white hover:bg-gray-50'} px-2 py-1 text-[11px]`} title={t("new")}>
              <FolderPlus className="h-3.5 w-3.5" /> {t("new")}
            </button>
          </div>

          {/* New section form */}
          {newCatOpen && (
            <>
              <div className="mb-1 grid grid-cols-[1fr_auto] items-stretch gap-2">
                <input ref={newCatRef} value={newCatName} onChange={(e) => { setNewCatName(e.target.value); setNewCatError(""); }} onKeyDown={(e) => { if (e.key === "Enter") createCategory(); if (e.key === "Escape") { setNewCatOpen(false); setNewCatName(""); } }} placeholder={t("sectionName")} className={`h-[44px] w-full rounded-lg border ${T.border} ${T.input} px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40`} />
                <button onClick={createCategory} className="h-[44px] shrink-0 rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white hover:bg-cyan-500">{t("add")}</button>
              </div>
              {newCatError && (<div className="mb-2 text-rose-600 text-xs">{newCatError}</div>)}
            </>
          )}

          <div className="flex flex-wrap gap-2 sm:block">
            {/* All */}
            <div key="all" className={`group mb-2 flex items-center justify-between rounded-xl px-2 py-1.5 transition ${T.hoverRow} ${active === "all" ? (theme==='dark'? 'bg-white/10':'bg-gray-100') : ''}`} onClick={() => setActive("all")}>
              <span className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${theme==='dark'?'bg-white/40':'bg-gray-400'}`}></span>
                {t("all")}
              </span>
            </div>

            {/* Real categories */}
            <AnimatePresence>
              {categories.map((cat) => (
                <motion.div key={cat} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} transition={{duration:0.18}} draggable onDragStart={onDragStart(cat)} onDragOver={onDragOver(cat)} onDrop={onDrop(cat)} onContextMenu={(e) => openSecMenu(e, cat)} className={`group mb-2 flex items-center justify-between rounded-xl px-2 py-1.5 transition ${T.hoverRow} ${ active === cat ? (theme==='dark'? 'bg-white/10':'bg-gray-100') : '' }`}>
                  <button onClick={() => setActive(cat)} className="flex flex-1 items-center gap-2 text-left">
                    <GripVertical className={`h-4 w-4 cursor-grab ${theme==='dark'?'opacity-60':'text-gray-400'}`} />
                    <span className={`h-2.5 w-2.5 rounded-full ${colorOf(cat)}`} />
                    <span className="truncate">{labelOf(cat)}</span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Context menu */}
          {secMenu.open && (
            <div ref={secMenuRef} className={`absolute z-50 min-w-[180px] overflow-hidden rounded-xl border ${T.border} ${T.menuBg} p-1 shadow-xl`} style={{ left: Math.min(secMenu.x - (document.body.getBoundingClientRect().left || 0), 260), top: Math.max(8, secMenu.y - 80) }}>
              <button onClick={() => { setRenameModal({ open: true, cat: secMenu.cat, value: labelOf(secMenu.cat) }); setSecMenu({ ...secMenu, open: false }); }} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left ${theme==='dark'? 'hover:bg-white/10':'hover:bg-gray-50'}`}><Edit2 className="h-4 w-4" /> {t("rename")}</button>
              {secMenu.cat !== "general" && (
                <button onClick={() => { setDeleteModal({ open: true, cat: secMenu.cat }); setSecMenu({ ...secMenu, open: false }); }} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left ${T.menuTextDanger}`}><Trash2 className="h-4 w-4" /> {t("delete")}</button>
              )}
            </div>
          )}
        </aside>

        {/* Content */}
        <main className={`relative rounded-2xl border ${T.border} ${T.card} p-3 sm:p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]`}>
          {/* Add (fixed corners for RTL/LTR) */}
          <div className="mb-3 sm:mb-4 flex w-full">
            <input
              ref={inputRef}
              type="text"
              placeholder={isAR ? "أضف مهمة…" : "Add a task…"}
              className={`flex-1 ${inputCorner} border ${T.border} ${T.input} p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/40`}
              onKeyDown={(e) => { if (e.key === "Enter") { addTask(e.target.value); e.target.value = ""; } }}
            />
            <button
              onClick={() => { const el = inputRef.current; if (!el) return; addTask(el.value); el.value = ""; el.focus(); }}
              className={`group ${btnCorner} bg-gradient-to-br from-cyan-500 to-blue-500 px-4 sm:px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:from-cyan-400 hover:to-blue-400 active:translate-y-px`}
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4 transition-transform group-active:-rotate-12" /> {t("add")}
              </span>
            </button>
          </div>

          {/* Stats / progress */}
          <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div className={`text-sm ${T.stat}`}>{t("stats", doneCount, visibleTasks.length - doneCount, visibleTasks.length)}</div>
            <div className={`h-2 w-full overflow-hidden rounded-full ${T.progressTrack} sm:w-1/2`}><div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${progress}%` }} /></div>
          </div>

          {/* List */}
          {visibleTasks.length === 0 ? (
            <div className={`rounded-xl border border-dashed ${T.emptyBorder} p-6 sm:p-8 text-center ${T.emptyText}`}>{t("noTasks")}</div>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence>
                {visibleTasks.map((task) => (
                  <motion.li key={task.id} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, scale:0.98, y:-6}} transition={{duration:0.18}} className={`flex items-center justify-between gap-2 rounded-xl border ${T.border} ${T.listItem} p-3`}>
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button onClick={() => toggleTask(task.id)} className={`h-5 w-5 shrink-0 rounded-md border ${theme==='dark'? (task.done ? 'border-emerald-400 bg-emerald-500/30':'border-white/20') : (task.done ? 'border-emerald-500 bg-emerald-100':'border-gray-300')}`} aria-label="toggle" />
                      {active === "all" && (<span className={`h-2.5 w-2.5 shrink-0 rounded-full ${colorOf(task.category)}`} title={labelOf(task.category)} />)}
                      <span className={`text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed ${task.done ? (theme==='dark' ? 'text-white/40 line-through' : 'text-gray-400 line-through') : ''}`}>
                        {task.text}
                      </span>
                      {task.priority === 'urgent' && (<span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs inline-flex items-center gap-1 ${T.pillUrgent}`}><Flag className="h-3 w-3"/> {t("urgent")}</span>)}
                      {task.priority === 'low' && (<span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs ${T.pillLow}`}>{t("low")}</span>)}
                      {task.pinned && (<span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs inline-flex items-center gap-1 ${T.pillPinned}`}><Pin className="h-3 w-3"/>{isAR? "مثبّت": "Pinned"}</span>)}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={()=> setNoteModal({ open:true, id: task.id, value: task.note || "" })} title={t("notesBtn")} className={`rounded-md px-2 py-1 ${theme==='dark'? 'text-white/80 hover:bg-white/10':'text-gray-700 hover:bg-gray-100'}`}><StickyNote className="h-4 w-4"/></button>
                      <button onClick={()=> togglePin(task.id)} title={task.pinned? t("unpin"): t("pin")} className={`rounded-md px-2 py-1 ${task.pinned? 'text-amber-500' : (theme==='dark'? 'text-white/80 hover:bg-white/10':'text-gray-700 hover:bg-gray-100')}`}><Pin className="h-4 w-4"/></button>
                      <button onClick={(e)=> openTaskMenu(e, task.id)} title={t("priorityBtn")} className={`rounded-md px-2 py-1 ${theme==='dark'? 'text-white/80 hover:bg-white/10':'text-gray-700 hover:bg-gray-100'}`}>⋯</button>
                      <button onClick={() => deleteTask(task.id)} className={`rounded-md px-2 py-1 ${theme==='dark'? 'text-rose-400 hover:bg-rose-500/10':'text-rose-600 hover:bg-rose-50'}`} title={t("deleteBtn")}>✕</button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          {/* Task priority menu */}
          {taskMenu.open && (
            <div ref={taskMenuRef} className={`fixed z-50 min-w-[180px] overflow-hidden rounded-xl border ${T.border} ${T.menuBg} p-1 shadow-xl`} style={{ left: Math.min(taskMenu.x, window.innerWidth - 190), top: Math.min(taskMenu.y, window.innerHeight - 120) }}>
              <div className={`px-3 py-1 text-xs uppercase tracking-wide ${T.stat}`}>{t("priority")}</div>
              <button onClick={()=> { setPriority(taskMenu.id, 'urgent'); setTaskMenu({...taskMenu, open:false}); }} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left ${theme==='dark'? 'hover:bg-white/10 text-rose-300':'hover:bg-rose-50 text-rose-700'}`}><Flag className="h-4 w-4"/> {t("urgent")}</button>
              <button onClick={()=> { setPriority(taskMenu.id, 'low'); setTaskMenu({...taskMenu, open:false}); }} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left ${theme==='dark'? 'hover:bg-white/10':'hover:bg-emerald-50'}`}>{t("low")}</button>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {renameModal.open && (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center ${theme==='dark'? 'bg-black/50':'bg-black/30'} p-4`}>
          <div className={`w-full max-w-sm rounded-2xl border ${T.border} ${T.menuBg} p-4 shadow-xl`}>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold">{t("rename")}</h3><button onClick={() => setRenameModal({ open: false, cat: null, value: "" })} className={`rounded p-1 ${theme==='dark'? 'hover:bg-white/10':'hover:bg-gray-100'}`}><X className="h-4 w-4" /></button></div>
            <input autoFocus value={renameModal.value} onChange={(e) => setRenameModal((m) => ({ ...m, value: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { renameCategory(renameModal.cat, renameModal.value); setRenameModal({ open: false, cat: null, value: "" }); } }} placeholder={t("newName")} className={`mb-3 w-full rounded-lg border ${T.border} ${T.input} p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/40`} />
            <div className="flex justify-end gap-2"><button onClick={() => setRenameModal({ open: false, cat: null, value: "" })} className={`rounded-lg px-3 py-1.5 ${theme==='dark'? 'text-white/70 hover:bg-white/10':'text-gray-700 hover:bg-gray-100'}`}>{t("cancel")}</button><button onClick={() => { renameCategory(renameModal.cat, renameModal.value); setRenameModal({ open: false, cat: null, value: "" }); }} className="rounded-lg bg-cyan-600 px-3 py-1.5 font-semibold text-white hover:bg-cyan-500">{t("save")}</button></div>
          </div>
        </div>
      )}

      {deleteModal.open && (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center ${theme==='dark'? 'bg-black/50':'bg-black/30'} p-4`}>
          <div className={`w-full max-w-sm rounded-2xl border ${T.border} ${T.menuBg} p-4 shadow-xl`}>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold">{t("deleteTitle")}</h3><button onClick={() => setDeleteModal({ open: false, cat: null })} className={`rounded p-1 ${theme==='dark'? 'hover:bg-white/10':'hover:bg-gray-100'}`}><X className="h-4 w-4" /></button></div>
            <p className={`${theme==='dark'? 'text-white/80':'text-gray-700'} mb-4`}>{t("deleteMsg")}</p>
            <div className="flex justify-end gap-2"><button onClick={() => setDeleteModal({ open: false, cat: null })} className={`rounded-lg px-3 py-1.5 ${theme==='dark'? 'text-white/70 hover:bg-white/10':'text-gray-700 hover:bg-gray-100'}`}>{t("cancel")}</button><button onClick={() => { deleteCategory(deleteModal.cat); setDeleteModal({ open: false, cat: null }); }} className="rounded-lg bg-rose-600 px-3 py-1.5 font-semibold text-white hover:bg-rose-500">{t("delete")}</button></div>
          </div>
        </div>
      )}

      {noteModal.open && (
        <div className={`fixed inset-0 z-[65] flex items-center justify-center ${theme==='dark'? 'bg-black/50':'bg-black/30'} p-4`}>
          <div className={`w-full max-w-sm rounded-2xl border ${T.border} ${T.menuBg} p-4 shadow-xl`}>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold">{t("notes")}</h3><button onClick={() => setNoteModal({ open: false, id: null, value: "" })} className={`rounded p-1 ${theme==='dark'? 'hover:bg-white/10':'hover:bg-gray-100'}`}><X className="h-4 w-4" /></button></div>
            <textarea value={noteModal.value} onChange={(e)=> setNoteModal((m)=> ({...m, value: e.target.value}))} placeholder={t("notesPh")} className={`mb-3 min-h-[120px] w-full rounded-lg border ${T.border} ${T.input} p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/40`} />
            <div className="flex justify-end gap-2"><button onClick={() => setNoteModal({ open: false, id: null, value: "" })} className={`rounded-lg px-3 py-1.5 ${theme==='dark'? 'text-white/70 hover:bg-white/10':'text-gray-700 hover:bg-gray-100'}`}>{t("cancel")}</button><button onClick={() => { setNote(noteModal.id, noteModal.value); setNoteModal({ open: false, id: null, value: "" }); }} className="rounded-lg bg-cyan-600 px-3 py-1.5 font-semibold text-white hover:bg-cyan-500">{t("save")}</button></div>
          </div>
        </div>
      )}

      <footer className={`p-6 text-center text-xs ${theme==='dark'? 'opacity-70':'text-gray-500'}`}>by Murtadha & GPT5</footer>
    </div>
  );
}
