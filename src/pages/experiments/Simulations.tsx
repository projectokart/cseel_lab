import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/seo/SEOHead";
import LazyImage from "@/components/shared/LazyImage";

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import PageTransition from "@/components/shared/PageTransition";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ArrowUpDown, X, Check, BookmarkCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { getExperimentList, onListUpdate, startRealtimeSync } from "@/cache/experimentCache";
const disciplines = ["All", "Chemistry", "Biology", "Physics", "Engineering", "Technology", "Mathematics"];
const ALL_DISCIPLINES = ["Chemistry", "Biology", "Physics", "Engineering", "Technology", "Mathematics"];
const ALL_LEVELS = ["Higher Education", "High School"];
const SORT_OPTIONS = [
  { label: "Most Popular", value: "popularity" },
  { label: "Newest First", value: "newest" },
  { label: "A → Z", value: "az" },
  { label: "Z → A", value: "za" },
];

const PAGE_SIZE = 30; // max 30 per page

const CardItem = ({
  sim, isSelected, onToggle, onNavigate,
}: {
  sim: any; isSelected: boolean; onToggle: () => void; onNavigate: () => void;
}) => {
  return (
    <div className={`relative flex flex-row md:flex-col items-center md:items-stretch gap-3 md:gap-0 border rounded-2xl p-3 md:p-0 hover:shadow-xl transition-all bg-white h-full select-none overflow-hidden ${
      isSelected ? "border-green-400" : "border-gray-100"
    }`}>
      {/* Image — lazy loaded, only navigates */}
      <div
        onClick={(e) => { e.stopPropagation(); onNavigate(); }}
        className="w-24 h-24 md:w-full md:h-48 flex-shrink-0 overflow-hidden rounded-xl md:rounded-b-none md:rounded-t-2xl bg-gray-100 cursor-pointer"
      >
        <LazyImage
          src={sim.thumbnail_url || "https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg"}
          alt={sim.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Text */}
      <div
        onClick={(e) => { e.stopPropagation(); onNavigate(); }}
        className="flex-1 min-w-0 pr-2 md:px-5 md:pt-4 md:pb-12 cursor-pointer"
      >
        <span className="text-[9px] md:text-[10px] font-black text-primary uppercase mb-1 block">
          {sim.subject}
        </span>
        <h3 className="text-[13px] md:text-lg font-bold text-gray-900 leading-tight line-clamp-2">
          {sim.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 md:mt-4">
          <span className="text-[10px] text-gray-500 font-medium px-2 py-0.5 bg-gray-100 rounded">
            {sim.class || "Higher Ed"}
          </span>
          {sim.difficulty && (
            <span className="text-[10px] text-gray-500 font-medium px-2 py-0.5 bg-gray-100 rounded">
              {sim.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Desktop select button */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="hidden md:flex absolute bottom-0 right-0 p-4 z-10"
      >
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggle(); }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
            isSelected ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {isSelected ? <><Check size={11} strokeWidth={3} /> Selected</> : <>+ Select</>}
        </button>
      </div>

      {/* Mobile circle button */}
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggle(); }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="md:hidden flex-shrink-0 flex items-center justify-center p-3 -m-3 mr-[-8px] z-10"
      >
        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          isSelected ? "bg-green-500 border-green-500" : "bg-white border-gray-300"
        }`}>
          {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
        </div>
      </button>

      {isSelected && <div className="absolute inset-0 rounded-2xl ring-2 ring-green-400 pointer-events-none" />}
    </div>
  );
};

const Simulations = () => {
  const [search, setSearch] = useState("");
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [activeDisciplines, setActiveDisciplines] = useState<string[]>([]);
  const [activeLevel, setActiveLevel] = useState("Higher Education");
  const [activeSort, setActiveSort] = useState("popularity");

  const navigate = useNavigate();
  const { totalItems, isInCart, selectedIds, toggleSelect: cartToggle } = useCart();

  const toggleSelect = (sim: any) => {
    cartToggle({ id: sim.id, title: sim.title, subject: sim.subject, thumbnail_url: sim.thumbnail_url, class: sim.class });
  };

  const [sheetMode, setSheetMode] = useState<"filter" | "sort" | null>(null);
  const [tempDisciplines, setTempDisciplines] = useState<string[]>([]);
  const [tempLevel, setTempLevel] = useState("Higher Education");
  const [tempSort, setTempSort] = useState("popularity");

  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

 useEffect(() => {
  startRealtimeSync();
  const load = async () => {
    setLoading(true);
    const list = await getExperimentList();
    setExperiments(list);
    setLoading(false);
  };
  load();
  const unsub = onListUpdate((freshList) => setExperiments(freshList));
  return () => { unsub(); };  // ← yeh change karo, boolean return nahi hoga
}, []);

  const fallbackData = [
    { id: "static-1", title: "Absorption In the Small and Large Intestines", subject: "Biology", class: "Higher Education", thumbnail_url: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif", created_at: "2024-01-01", popularity: 90 },
    { id: "static-2", title: "Acid-Base Titration", subject: "Chemistry", class: "Higher Education", thumbnail_url: "https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg", created_at: "2024-02-01", popularity: 85 },
    { id: "static-3", title: "Newton's Laws of Motion", subject: "Physics", class: "High School", thumbnail_url: "https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", created_at: "2024-03-01", popularity: 80 },
    { id: "static-4", title: "Cell Structure and Function", subject: "Biology", class: "High School", thumbnail_url: "https://png.pngtree.com/thumb_back/fw800/background/20241007/pngtree-biology-laboratory-nature-and-science-plants-with-biochemistry-structure-on-green-image_16319180.jpg", created_at: "2024-04-01", popularity: 75 },
    { id: "static-5", title: "Electrochemistry Fundamentals", subject: "Chemistry", class: "Higher Education", thumbnail_url: "https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg", created_at: "2024-05-01", popularity: 70 },
    { id: "static-6", title: "Circuit Design Basics", subject: "Engineering", class: "Higher Education", thumbnail_url: "https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", created_at: "2024-06-01", popularity: 65 },
    { id: "static-7", title: "DNA Extraction Lab", subject: "Biology", class: "Higher Education", thumbnail_url: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf944f3df098f183b92727_Lab-Scientists-Beakers-edit.avif", created_at: "2024-07-01", popularity: 60 },
    { id: "static-8", title: "Thermodynamics Exploration", subject: "Physics", class: "Higher Education", thumbnail_url: "https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", created_at: "2024-08-01", popularity: 55 },
  ];

  const allExperiments = experiments.length > 0 ? experiments : fallbackData;

  const filtered = useMemo(() => {
    let result = allExperiments.filter((sim) => {
      const matchSearch = sim.title.toLowerCase().includes(search.toLowerCase());
      const matchLevel = (sim.class || "Higher Education") === activeLevel;
      const matchDiscipline = activeDisciplines.length === 0 || activeDisciplines.includes(sim.subject);
      return matchSearch && matchLevel && matchDiscipline;
    });
    return [...result].sort((a, b) => {
      if (activeSort === "az") return a.title.localeCompare(b.title);
      if (activeSort === "za") return b.title.localeCompare(a.title);
      if (activeSort === "newest") return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      return (b.popularity || 0) - (a.popularity || 0);
    });
  }, [search, activeLevel, activeDisciplines, activeSort, allExperiments]);

  const displayed = filtered.slice(0, visibleCount);

  // Reset on filter change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, activeLevel, activeDisciplines, activeSort]);


  // Infinite scroll — sentinel observe karo
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < filtered.length) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, filtered.length]);

  const tempFiltered = useMemo(() => {
    return allExperiments.filter((sim) => {
      const matchSearch = sim.title.toLowerCase().includes(search.toLowerCase());
      const matchLevel = (sim.class || "Higher Education") === tempLevel;
      const matchDiscipline = tempDisciplines.length === 0 || tempDisciplines.includes(sim.subject);
      return matchSearch && matchLevel && matchDiscipline;
    });
  }, [search, tempLevel, tempDisciplines, allExperiments]);

  const availableDisciplines = useMemo(() => {
    return ALL_DISCIPLINES.filter((d) =>
      allExperiments.some((sim) =>
        (sim.class || "Higher Education") === tempLevel &&
        sim.subject === d &&
        sim.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [tempLevel, allExperiments, search]);

  const openSheet = (mode: "filter" | "sort") => {
    setTempDisciplines([...activeDisciplines]);
    setTempLevel(activeLevel);
    setTempSort(activeSort);
    setSheetMode(mode);
  };
  const closeSheet = () => setSheetMode(null);
  const applySheet = () => {
    setActiveDisciplines([...tempDisciplines]);
    setActiveLevel(tempLevel);
    setActiveSort(tempSort);
    closeSheet();
  };
  const resetSheet = () => {
    if (sheetMode === "filter") { setTempDisciplines([]); setTempLevel("Higher Education"); }
    else setTempSort("popularity");
  };
  const toggleTempDiscipline = (d: string) => {
    setTempDisciplines((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };
  const handleTouchStart = (e: React.TouchEvent) => { dragStartY.current = e.touches[0].clientY; };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    dragCurrentY.current = delta;
    if (sheetRef.current && delta > 0) sheetRef.current.style.transform = `translateY(${delta}px)`;
  };
  const handleTouchEnd = () => {
    if (dragCurrentY.current > 80) closeSheet();
    else if (sheetRef.current) sheetRef.current.style.transform = "";
    dragStartY.current = null;
    dragCurrentY.current = 0;
  };

  const activeFilterCount = activeDisciplines.length + (activeLevel !== "Higher Education" ? 1 : 0);
  const isSortActive = activeSort !== "popularity";

  const SheetBody = () => (
    <>
      {sheetMode === "filter" && (
        <div className="flex flex-col gap-7">
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Level</p>
            <div className="flex flex-col gap-2">
              {ALL_LEVELS.map((l) => (
                <button key={l} onClick={() => setTempLevel(l)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                    tempLevel === l ? "bg-gray-50 border-gray-900 text-gray-900" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}>
                  <span>{l}</span>
                  {tempLevel === l && <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center"><Check size={11} strokeWidth={3} className="text-white" /></span>}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Discipline
              {tempDisciplines.length > 0 && <button onClick={() => setTempDisciplines([])} className="ml-2 normal-case text-gray-400 font-medium underline">Clear</button>}
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_DISCIPLINES.map((d) => {
                const isAvailable = availableDisciplines.includes(d);
                const isSel = tempDisciplines.includes(d);
                return (
                  <button key={d} onClick={() => isAvailable && toggleTempDiscipline(d)} disabled={!isAvailable}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSel ? "bg-black text-white border-black shadow-md"
                        : isAvailable ? "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                    }`}>
                    {isSel && <Check size={10} strokeWidth={3} />}{d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {sheetMode === "sort" && (
        <div className="flex flex-col gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setTempSort(opt.value)}
              className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-medium border transition-all ${
                tempSort === opt.value ? "bg-gray-50 border-gray-900 text-gray-900" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              <span>{opt.label}</span>
              {tempSort === opt.value && <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center"><Check size={11} strokeWidth={3} className="text-white" /></span>}
            </button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <PageTransition>
      <SEOHead
        title="Virtual Science Lab Simulations India | Chemistry, Biology, Physics | CSEEL"
        description="Explore 200+ virtual science lab simulations for Chemistry, Biology, Physics, Engineering & Mathematics. Aligned with CBSE, ICSE, NCERT. Free demo available. CSEEL India."
        keywords="virtual science lab India, online science simulations, chemistry experiments India, biology virtual lab, physics simulations CBSE, ICSE science practical, NCERT experiments, hands-on science India"
        canonical="https://www.cseel.org/simulations"
        schema={{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Virtual Science Lab Simulations", "description": "200+ virtual science lab simulations for Indian students", "url": "https://www.cseel.org/simulations"}}
      />
      <Layout>
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-[300] bg-white/95 backdrop-blur-md border-b shadow-sm">
          <div className="max-w-screen-md mx-auto px-4 py-3 flex items-center gap-3">
            <div className="relative flex-1 group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} strokeWidth={2.5} />
              </span>
              <input
                type="text"
                placeholder="Search experiments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" />
            </div>
            <button onClick={() => navigate("/my-selections")} className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors" title="My Selected Experiments">
              <BookmarkCheck size={18} strokeWidth={2.5} className="text-gray-600" />
              <AnimatePresence>
                {selectedIds.length > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                    {selectedIds.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          <div className="max-w-7xl mx-auto px-4 pb-2 flex flex-col gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
              <button onClick={() => openSheet("filter")}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold flex-shrink-0 hover:bg-gray-50 transition-colors shadow-sm relative">
                <Filter size={14} strokeWidth={2.5} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white rounded-full text-[9px] flex items-center justify-center font-black">{activeFilterCount}</span>
                )}
              </button>
              <button onClick={() => openSheet("sort")}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold flex-shrink-0 hover:bg-gray-50 transition-colors shadow-sm relative">
                <ArrowUpDown size={14} strokeWidth={2.5} />
                Sort
                {isSortActive && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white rounded-full text-[9px] flex items-center justify-center font-black">1</span>
                )}
              </button>
              <div className="h-4 w-[1px] bg-gray-300 flex-shrink-0 mx-1"></div>
              {disciplines.map((d) => (
                <button key={d}
                  onClick={() => setActiveDisciplines(d === "All" ? [] : [d])}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                    (d === "All" && activeDisciplines.length === 0) || activeDisciplines.includes(d)
                      ? 'bg-black text-white border-black shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}>
                  {d}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-gray-50 md:border-none">
              <p className="text-[10px] md:text-[11px] text-gray-400 uppercase font-black tracking-widest">
                Showing <span className="text-gray-900">{displayed.length}</span> of <span className="text-gray-900">{filtered.length}</span> Labs
              </p>
              <div className="flex gap-6">
                {["Higher Education", "High School"].map((l) => (
                  <button key={l} onClick={() => setActiveLevel(l)}
                    className={`text-[11px] md:text-xs font-bold transition-all relative py-1 ${
                      activeLevel === l ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary' : 'text-gray-400 hover:text-gray-600'
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[2px] w-full bg-gray-50 overflow-hidden">
            <motion.div className="h-full bg-primary" initial={{ width: 0 }}
              animate={{ width: filtered.length > 0 ? `${Math.min(visibleCount / filtered.length * 100, 100)}%` : "0%" }}
              transition={{ duration: 0.4 }} />
          </div>
        </div>

        {/* HERO */}
        <section className="about-hero-gradient py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-xl">
              <ScrollReveal direction="left">
                <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">Experimental Library</h1>
                <p className="text-primary-foreground/80 mb-6 text-sm">Turn every concept into a hands-on experience.</p>
                <div className="flex items-center gap-3">
                  <Link to="/compare-plans" className="px-6 py-2 bg-background text-primary font-semibold rounded-full text-sm inline-block">View Plans</Link>
                  <Link to="/demo" className="px-6 py-2 bg-transparent border border-primary-foreground text-primary-foreground font-semibold rounded-full text-sm inline-block hover:bg-primary-foreground/10 transition-colors">View Demo</Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* RESULTS */}
        <section className="py-6 bg-gray-50/30 min-h-screen">
          <div className="container mx-auto px-4 max-w-7xl">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse flex flex-row md:flex-col gap-3 md:gap-0 p-3 md:p-0">
                    <div className="w-24 h-24 md:w-full md:h-48 flex-shrink-0 rounded-xl md:rounded-none bg-gray-200" />
                    <div className="flex-1 flex flex-col gap-2 py-1 md:p-4">
                      <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-4/5" />
                      <div className="h-3 bg-gray-100 rounded w-3/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {displayed.length > 0 ? (
                  displayed.map((sim, i) => (
                    <div
                      key={sim.id}
                      style={{
                        animation: i < PAGE_SIZE
                          ? `fadeInUp 0.25s ease forwards ${Math.min(i * 0.025, 0.4)}s`
                          : undefined,
                        opacity: i < PAGE_SIZE ? 0 : 1,
                      }}
                    >
                      <CardItem
                        sim={sim}
                        isSelected={selectedIds.includes(sim.id)}
                        onToggle={() => toggleSelect(sim)}
                        onNavigate={() => navigate(`/experiment/${sim.id}`)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-gray-400 text-sm">No simulations found matching your filters.</p>
                  </div>
                )}
              </div>
            )}

            {/* INFINITE SCROLL SENTINEL */}
            <div ref={sentinelRef} className="py-10 flex justify-center">
              {visibleCount < filtered.length ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading more...</span>
                </div>
              ) : (
                filtered.length > 0 && <span className="text-[10px] font-black text-gray-200 uppercase tracking-widest">End of Catalog</span>
              )}
            </div>
          </div>
        </section>

        {/* SHEET */}
        <AnimatePresence>
          {sheetMode && (
            <>
              <motion.div key="backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 z-[350]"
                onClick={closeSheet}
              />
              <motion.div key="sheet-mobile" ref={sheetRef}
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="md:hidden fixed bottom-0 left-0 right-0 z-[360] bg-white rounded-t-3xl"
                style={{ maxHeight: "85vh", overflowY: "auto" }}
                onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
              >
                <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
                  <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 sticky top-5 bg-white z-10">
                  <button onClick={resetSheet} className="text-sm text-gray-500 font-medium">Reset</button>
                  <h2 className="text-[15px] font-bold text-gray-900">{sheetMode === "filter" ? "Filters" : "Sort by"}</h2>
                  <button onClick={closeSheet} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full"><X size={14} strokeWidth={2.5} /></button>
                </div>
                <div className="px-5 py-5"><SheetBody /></div>
                <div className="px-5 pb-8 pt-2 sticky bottom-0 bg-white border-t border-gray-50">
                  <button onClick={applySheet} className="w-full py-3.5 bg-black text-white rounded-2xl text-sm font-bold tracking-wide active:scale-[0.98] transition-all">
                    Show {sheetMode === "filter" ? tempFiltered.length : filtered.length} Results
                  </button>
                </div>
              </motion.div>
              <motion.div key="sheet-desktop"
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-[360] bg-white shadow-2xl"
                style={{ width: "360px" }}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <button onClick={resetSheet} className="text-sm text-gray-500 font-medium hover:text-gray-800 transition-colors">Reset</button>
                  <h2 className="text-[15px] font-bold text-gray-900">{sheetMode === "filter" ? "Filters" : "Sort by"}</h2>
                  <button onClick={closeSheet} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X size={15} strokeWidth={2.5} /></button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6"><SheetBody /></div>
                <div className="px-6 py-5 border-t border-gray-100">
                  <button onClick={applySheet} className="w-full py-4 bg-black text-white rounded-2xl text-sm font-bold tracking-wide hover:bg-gray-900 active:scale-[0.98] transition-all">
                    Show {sheetMode === "filter" ? tempFiltered.length : filtered.length} Results
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}@keyframes fadeInUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </Layout>
    </PageTransition>
  );
};

export default Simulations;