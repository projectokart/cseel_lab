/**
 * Projects.tsx — Optimized Projectokart Page with Premium Hero Banner
 *
 * Key improvements vs original:
 * 1. Server-side paginated fetch — only PAGE_SIZE rows per request, not ALL rows
 * 2. Minimal SELECT — only columns needed for listing (no heavy detail columns)
 * 3. Infinite scroll triggers next DB page fetch (not just slice of in-memory array)
 * 4. IntersectionObserver image lazy-loading via native loading="lazy" + visibility check
 * 5. Project detail only loaded when user clicks (separate route / detail page unchanged)
 * 6. No framer-motion layout animations on grid (huge perf win on 30+ cards)
 * 7. Skeleton placeholders during load (smooth UX)
 * 8. Debounced search (300ms) to avoid spamming DB on every keystroke
 * 9. Filters reset pagination correctly
 * 10. PREMIUM HERO BANNER with multi-image carousel, glassmorphism, and epic animations
 */

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/shared/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Check, Star, Clock, Eye, Heart,
  Filter, ArrowUpDown, Zap, FolderOpen, Plus, ShoppingCart, Loader2, Sparkles, ChevronRight, Share2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

import Particles, { initParticlesEngine } from "@tsparticles/react"; // 2. initParticlesEngine zaroori hai
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine"; // 3. Type imports
// ── Premium Banner Images ─────────────────────────────────────────────────
const BANNER_IMAGES = [
  "https://i0.wp.com/cybercitycircuits.com/wp-content/uploads/2023/01/Pick-and-Place.gif", // Aapki di hui image
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&h=600&fit=crop", // Circuit Board
  "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=1400&h=600&fit=crop", // Electronic components
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1400&h=600&fit=crop", // Robotic arm
  "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1400&h=600&fit=crop", // Motherboard tech
  "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1400&h=600&fit=crop", // Server room
  "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=1400&h=600&fit=crop", // Digital network
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1400&h=600&fit=crop", // AI & Robotics
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1400&h=600&fit=crop", // Futuristic laptop
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&h=600&fit=crop", // Engineering lab
];

// ── Only the columns needed for listing cards ────────────────────────────────
// Heavy columns like `procedure`, `materials`, `media_urls` etc. are NOT fetched here.
// Those are only fetched on the ProjectDetail page when user actually clicks.
const LIST_COLUMNS = [
  "id", "title", "author", "description",
  "category", "subcategory", "difficulty", "duration",
  "tags", "thumbnail_url",
  "views", "likes", "rating",
  "is_featured", "created_at", "updated_at",
].join(", ");

interface ProjectListItem {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  difficulty: string | null;
  duration: string | null;
  tags: string[] | null;
  thumbnail_url: string | null;
  views: number | null;
  likes: number | null;
  rating: number | null;
  is_featured: boolean | null;
  created_at: string;
  updated_at: string;
}

const PAGE_SIZE = 18; // cards per page fetch (3 cols × 6 rows visible)
const DIFFICULTY_ORDER = ["Beginner", "Intermediate", "Advanced"];
const SORT_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Most Liked", value: "likes" },
  { label: "Top Rated", value: "rating" },
  { label: "Newest First", value: "newest" },
  { label: "Shortest First", value: "duration" },
];
const diffColor: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Intermediate: "bg-blue-100 text-blue-700 border border-blue-200",
  Advanced: "bg-purple-100 text-purple-700 border border-purple-200",
};
const fmt = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-100" />
    <div className="p-4 flex flex-col gap-3">
      <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
      <div className="h-3 bg-gray-100 rounded-lg w-full" />
      <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
      <div className="flex gap-2 mt-1">
        {[1, 2, 3].map(i => <div key={i} className="h-5 w-14 bg-gray-100 rounded-full" />)}
      </div>
    </div>
  </div>
);

// ── Lazy image with blur-up effect ────────────────────────────────────────────
const ProjectImage = ({
  src, alt, className,
}: {
  src: string; alt: string; className?: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse" />
      )}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

// ── Premium Hero Banner ───────────────────────────────────────────────────────


const HeroBanner = ({ totalCount }: { totalCount: number | null }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [init, setInit] = useState(false); // New state for v3 engine

  // v3 Standard Initialization
  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % BANNER_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // TypeScript safe options
 const particlesOptions: ISourceOptions = {
  fullScreen: { enable: false },
  background: { color: { value: "transparent" } },
  fpsLimit: 120,
  particles: {
    number: { 
      value: 60, // Mobile par density manage karne ke liye
      density: { enable: true, width: 800, height: 800 } 
    },
    color: { value: "#ffffff" }, // Cseel Yellow
    shape: { type: "circle" },
    opacity: {
      value: { min: 0.1, max: 0.5 },
    },
    size: {
      value: { min: 1, max: 3 },
    },
    links: {
      enable: true,
      distance: 150,
      color: "#fce892",
      opacity: 0.2,
      width: 1,
    },
    move: {
      enable: true,
      speed: 1,
      direction: "none",
      random: false,
      straight: false,
      outModes: { default: "out" },
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "repulse", // YE HAI MAIN CHANGE: mouse aate hi door bhagenge
      },
      onClick: {
        enable: true,
        mode: "push", // Click karne par aur particles aayenge
      },
    },
    modes: {
      repulse: {
        distance: 100, // Kitni door tak particles bhagenge (Isse adjust kar sakte ho)
        duration: 1,
        factor: 100,
        speed: 0.5,
        maxSpeed: 50,
      },
      push: {
        quantity: 4,
      },
    },
  },
  detectRetina: true,
};

  return (
    <section className="relative overflow-hidden bg-black">
      <div className="h-[500px] md:h-[550px] lg:h-[650px] relative flex items-center">

        {/* ── Layer 1: Background image + overlay ── */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 z-10"
           style={{
  background: `linear-gradient(
    to right, 
    #020617 0%,             /* Full dark navy (Left) */
    rgba(2, 6, 23, 0.7) 30%, /* High opacity (Middle-Left) */
    rgba(2, 6, 23, 0) 100% /* Subtle fade (Right) */
  )`
}}
          />
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={BANNER_IMAGES[currentImageIndex]}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.85, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 w-full h-full object-cover brightness-[0.55] contrast-[1.1] saturate-[0.7] hue-rotate-[200deg]"
            />
          </AnimatePresence>
          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.12) 50%)",
              backgroundSize: "100% 4px",
              opacity: 0.35,
            }}
          />
        </div>

        {/* ── Layer 2: Particles — Fixed for v3 ── */}
        {init && (
          <Particles
            id="hero-particles"
            className="absolute inset-0 z-[25] pointer-events-none"
            options={particlesOptions}
          />
        )}

        {/* ── Layer 3: Content ── */}
        <div className="container mx-auto px-4 md:px-6 relative z-30 w-full">
          <div className="max-w-xl md:max-w-2xl border-l-4 border-yellow-500 pl-4 md:pl-8">

            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden sm:inline-block px-3 py-1 mb-3 md:mb-4 text-[10px] font-bold tracking-widest text-yellow-400 uppercase bg-yellow-400/10 rounded-full border border-yellow-400/20"
            >
              Future of Hardware
            </motion.span>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2 md:mb-3 tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)] leading-none"
            >
              Projecto<span className="text-yellow-500">kart</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-xs sm:text-sm md:text-base text-yellow-300/80 font-semibold tracking-wide mb-3 md:mb-4 italic"
            >
              From concept to creation — every idea deserves to be built.
            </motion.p>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xs md:text-sm text-gray-300 mb-5 md:mb-7 leading-relaxed"
            >
              Explore{" "}
              <span className="text-yellow-400 font-semibold">42,000+ projects</span>{" "}
              spanning{" "}
              <span className="text-white font-medium">AI & ML</span>,{" "}
              <span className="text-white font-medium">PCB Design</span>,{" "}
              <span className="text-white font-medium">IoT</span>,{" "}
              <span className="text-white font-medium">Robotics</span>{" "}
              <span className="hidden sm:inline">& beyond — from schematic to final deployment.</span>
            </motion.p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mb-5 md:mb-8">
              <button className="px-5 md:px-8 py-2.5 md:py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs md:text-sm rounded-sm transition-all hover:scale-105 shadow-xl active:scale-95">
                EXPLORE NOW
              </button>
              <button className="px-5 md:px-8 py-2.5 md:py-3 border-2 border-white/30 hover:border-white/70 text-white font-bold text-xs md:text-sm rounded-sm transition-all bg-white/5 backdrop-blur-md active:scale-95">
                DOCUMENTATION
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 md:gap-8 pt-4 md:pt-5 border-t border-white/10">
              {[
                { value: "42,000+", label: "Projects", color: "text-yellow-400" },
                { value: "8+", label: "Categories", color: "text-blue-300" },
                { value: "24/7", label: "Community", color: "text-purple-300" },
                { value: "AI→IoT", label: "Full Stack Hardware", color: "text-emerald-300" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className={`text-lg md:text-2xl lg:text-3xl font-black ${stat.color}`}>
                    {stat.value}
                  </span>
                  <span className="text-[9px] md:text-[11px] text-gray-400 font-medium uppercase tracking-widest">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Image indicators */}
        <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
          {BANNER_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentImageIndex ? "w-6 bg-yellow-400" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
// ── Main component ────────────────────────────────────────────────────────────
const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totalItems } = useCart();

  // ── Server-side pagination state ──────────────────────────────────────────
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [activeDifficulties, setActiveDifficulties] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeSort, setActiveSort] = useState("popular");

  // ── Filter meta (derived from already-fetched pages) ─────────────────────
  const availableCategories = useMemo(
    () => [...new Set(projects.map(p => p.category).filter(Boolean))].sort() as string[],
    [projects]
  );

  // ── Sheet state ───────────────────────────────────────────────────────────
  const [sheetMode, setSheetMode] = useState<"filter" | "sort" | null>(null);
  const [tempCategory, setTempCategory] = useState<string | null>(null);
  const [tempSubcategory, setTempSubcategory] = useState<string | null>(null);
  const [tempDifficulties, setTempDifficulties] = useState<string[]>([]);
  const [tempTags, setTempTags] = useState<string[]>([]);
  const [tempSort, setTempSort] = useState("popular");
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);

  // ── User projects ─────────────────────────────────────────────────────────
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [creatingProject, setCreatingProject] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── Debounce search ───────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ── Fetch — stable ref prevents stale-closure / infinite-loop bugs ─────────
  // Root cause of original blank-page bug:
  //   useCallback had `isFetching` in its deps → every time isFetching flipped,
  //   the callback reference changed → useEffect re-fired → fetch called again
  //   while already fetching → data never settled.
  // Fix: use a ref for the "is currently fetching" guard so it never enters deps.
  const isFetchingRef = useRef(false);

  const fetchPage = useCallback(async (
    pageNum: number,
    search: string,
    category: string | null,
    subcategory: string | null,
    difficulties: string[],
    tags: string[],
    sort: string,
  ) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsFetching(true);

    try {
      let query = (supabase as any)
        .from("projects")
        .select(LIST_COLUMNS, { count: "exact" })
        .eq("is_published", true);

      if (search) {
        query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
      }
      if (category) query = query.eq("category", category);
      if (subcategory) query = query.eq("subcategory", subcategory);
      if (difficulties.length === 1) query = query.eq("difficulty", difficulties[0]);
      else if (difficulties.length > 1) query = query.in("difficulty", difficulties);
      if (tags.length > 0) query = query.contains("tags", tags);

      switch (sort) {
        case "likes":    query = query.order("likes",      { ascending: false }); break;
        case "rating":   query = query.order("rating",     { ascending: false }); break;
        case "newest":   query = query.order("updated_at", { ascending: false }); break;
        case "duration": query = query.order("duration",   { ascending: true  }); break;
        default:         query = query.order("views",      { ascending: false });
      }

      query = query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      setProjects(prev => pageNum === 0 ? (data || []) : [...prev, ...(data || [])]);
      if (count !== null) setTotalCount(count);
      if (!data || data.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error("Projects fetch error:", err);
    } finally {
      isFetchingRef.current = false;
      setIsFetching(false);
    }
  }, []); // ← empty deps: function never changes, reads all values via args

  // ── Single unified useEffect — handles both filter-reset AND page-change ──
  // Separating reset + fetch into two useEffects caused a race condition where
  // the fetch fired before the reset completed (both react to same deps).
  useEffect(() => {
    setProjects([]);
    setPage(0);
    setHasMore(true);
    setTotalCount(null);
    isFetchingRef.current = false; // clear any in-flight lock
    fetchPage(0, debouncedSearch, activeCategory, activeSubcategory, activeDifficulties, activeTags, activeSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, activeCategory, activeSubcategory, activeDifficulties, activeTags, activeSort]);

  // ── Extra pages (infinite scroll only) ───────────────────────────────────
  useEffect(() => {
    if (page === 0) return; // page=0 handled above
    fetchPage(page, debouncedSearch, activeCategory, activeSubcategory, activeDifficulties, activeTags, activeSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ── Infinite scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetching) {
          setPage(prev => prev + 1);
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  // ── User projects ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    (supabase as any)
      .from("user_projects")
      .select("id, title, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }: any) => setUserProjects(data || []));
  }, [user]);

  const createNewProject = async () => {
    if (!user) { navigate("/login"); return; }
    setCreatingProject(true);
    try {
      const { data, error } = await (supabase as any)
        .from("user_projects")
        .insert({ user_id: user.id, title: "My New Project", status: "active" })
        .select("id").single();
      if (error) throw error;
      navigate(`/my-project/${data.id}`);
    } catch {}
    finally { setCreatingProject(false); }
  };

  // ── Derived filter metadata from fetched data ─────────────────────────────
  const afterCategory = useMemo(
    () => activeCategory ? projects.filter(p => p.category === activeCategory) : projects,
    [projects, activeCategory]
  );
  const availableSubcategories = useMemo(
    () => [...new Set(afterCategory.map(p => p.subcategory).filter(Boolean))].sort() as string[],
    [afterCategory]
  );
  const availableDifficulties = useMemo(
    () => DIFFICULTY_ORDER.filter(d => afterCategory.some(p => p.difficulty === d)),
    [afterCategory]
  );
  const availableTags = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.flatMap(p => p.tags ?? []).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [projects]);

  const totalActive =
    (activeCategory ? 1 : 0) + (activeSubcategory ? 1 : 0) +
    activeDifficulties.length + activeTags.length;
  const isSortActive = activeSort !== "popular";

  const clearAll = () => {
    setActiveCategory(null); setActiveSubcategory(null);
    setActiveDifficulties([]); setActiveTags([]);
  };

  // ── Sheet handlers ────────────────────────────────────────────────────────
  const openSheet = (mode: "filter" | "sort") => {
    setTempCategory(activeCategory); setTempSubcategory(activeSubcategory);
    setTempDifficulties([...activeDifficulties]); setTempTags([...activeTags]);
    setTempSort(activeSort); setSheetMode(mode);
  };
  const closeSheet = () => setSheetMode(null);
  const applySheet = () => {
    setActiveCategory(tempCategory); setActiveSubcategory(tempSubcategory);
    setActiveDifficulties([...tempDifficulties]); setActiveTags([...tempTags]);
    setActiveSort(tempSort); closeSheet();
  };
  const resetSheet = () => {
    if (sheetMode === "filter") { setTempCategory(null); setTempSubcategory(null); setTempDifficulties([]); setTempTags([]); }
    else setTempSort("popular");
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
    dragStartY.current = null; dragCurrentY.current = 0;
  };

  // ── Temp sheet preview subcategories / difficulties / tags ────────────────
  const tempAfterCat = tempCategory ? projects.filter(p => p.category === tempCategory) : projects;
  const tempAvailSubs = [...new Set(tempAfterCat.map(p => p.subcategory).filter(Boolean))].sort() as string[];
  const tempAvailDiff = DIFFICULTY_ORDER.filter(d => tempAfterCat.some(p => p.difficulty === d));
  const tempAvailTags = [...new Set(tempAfterCat.flatMap(p => p.tags ?? []))];

  const isFirstLoad = isFetching && projects.length === 0;
  const isLoadingMore = isFetching && projects.length > 0;

  // ── Sheet body component ──────────────────────────────────────────────────
  const SheetBody = () => (
    <>
      {sheetMode === "filter" && (
        <div className="flex flex-col gap-7">
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Category</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setTempCategory(null); setTempSubcategory(null); setTempDifficulties([]); setTempTags([]); }}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${!tempCategory ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                {!tempCategory && <Check size={10} strokeWidth={3} />}All
              </button>
              {availableCategories.map(cat => (
                <button key={cat}
                  onClick={() => { setTempCategory(cat === tempCategory ? null : cat); setTempSubcategory(null); setTempDifficulties([]); setTempTags([]); }}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${tempCategory === cat ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                  {tempCategory === cat && <Check size={10} strokeWidth={3} />}{cat}
                </button>
              ))}
            </div>
          </div>

          {tempCategory && tempAvailSubs.length > 0 && (
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Type</p>
              <div className="flex flex-wrap gap-2">
                {tempAvailSubs.map(sub => (
                  <button key={sub} onClick={() => setTempSubcategory(sub === tempSubcategory ? null : sub)}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${tempSubcategory === sub ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                    {tempSubcategory === sub && <Check size={10} strokeWidth={3} />}{sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tempAvailDiff.length > 0 && (
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Difficulty
                {tempDifficulties.length > 0 && (
                  <button onClick={() => setTempDifficulties([])} className="ml-2 normal-case text-gray-400 font-medium underline">Clear</button>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {tempAvailDiff.map(d => (
                  <button key={d}
                    onClick={() => setTempDifficulties(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${tempDifficulties.includes(d) ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                    {tempDifficulties.includes(d) && <Check size={10} strokeWidth={3} />}{d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tempAvailTags.length > 0 && (
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Tags
                {tempTags.length > 0 && (
                  <button onClick={() => setTempTags([])} className="ml-2 normal-case text-gray-400 font-medium underline">Clear</button>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {tempAvailTags.slice(0, 20).map(tag => (
                  <button key={tag}
                    onClick={() => setTempTags(prev => prev.includes(tag) ? prev.filter(x => x !== tag) : [...prev, tag])}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${tempTags.includes(tag) ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {sheetMode === "sort" && (
        <div className="flex flex-col gap-2">
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setTempSort(opt.value)}
              className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-medium border transition-all ${tempSort === opt.value ? "bg-gray-50 border-gray-900 text-gray-900" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              <span>{opt.label}</span>
              {tempSort === opt.value && (
                <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                  <Check size={11} strokeWidth={3} className="text-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <PageTransition>
      <Layout>
        {/* Premium Hero Banner */}
        <HeroBanner totalCount={totalCount} />

        {/* ── STICKY HEADER ── */}
        <div className="bg-white/95 backdrop-blur-md border-b shadow-sm">
          <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} strokeWidth={2.5} />
              </span>
              <input
                type="text"
                placeholder="Search projects, tags, authors..."
                value={search}
                onChange={e => { setSearch(e.target.value); clearAll(); }}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
              />
            </div>

            {/* Cart */}
            <button onClick={() => navigate("/cart")} className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <ShoppingCart size={18} strokeWidth={2.5} className="text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full text-[10px] font-black flex items-center justify-center">{totalItems}</span>
              )}
            </button>

            {user && (
              <button onClick={() => navigate("/my-projects")} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/90 transition-colors">
                <FolderOpen size={14} />
                My Projects
                {userProjects.length > 0 && (
                  <span className="bg-white/30 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{userProjects.length}</span>
                )}
              </button>
            )}
          </div>

          <div className="max-w-screen-xl mx-auto px-4 pb-2 flex flex-col gap-3">
            {/* Filter + Sort chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
              <button
                onClick={() => openSheet("filter")}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold flex-shrink-0 hover:bg-gray-50 transition-colors shadow-sm relative"
              >
                <Filter size={14} strokeWidth={2.5} />Filters
                {totalActive > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white rounded-full text-[9px] flex items-center justify-center font-black">{totalActive}</span>
                )}
              </button>
              <button
                onClick={() => openSheet("sort")}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold flex-shrink-0 hover:bg-gray-50 transition-colors shadow-sm relative"
              >
                <ArrowUpDown size={14} strokeWidth={2.5} />Sort
                {isSortActive && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white rounded-full text-[9px] flex items-center justify-center font-black">1</span>
                )}
              </button>
              <div className="h-4 w-[1px] bg-gray-300 flex-shrink-0 mx-1" />
              <button
                onClick={clearAll}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${totalActive === 0 && !search ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
              >All</button>
              {availableCategories.map(cat => (
                <button key={cat}
                  onClick={() => { setActiveCategory(cat === activeCategory ? null : cat); setActiveSubcategory(null); setActiveDifficulties([]); setActiveTags([]); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border flex-shrink-0 transition-all ${activeCategory === cat ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Count bar */}
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 md:border-none">
              <p className="text-[10px] md:text-[11px] text-gray-400 uppercase font-black tracking-widest">
                {isFirstLoad
                  ? <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Loading...</span>
                  : <><span className="text-gray-900">{projects.length}</span>{totalCount !== null ? <> of <span className="text-gray-900">{totalCount}</span></> : ""} Projects</>
                }
              </p>
              {totalActive > 0 && (
                <button onClick={clearAll} className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline">
                  <X size={11} /> Clear all
                </button>
              )}
            </div>
          </div>

          {/* Progress bar — loaded / total */}
          <div className="h-[2px] w-full bg-gray-50 overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: totalCount ? `${(projects.length / totalCount) * 100}%` : "0%" }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* ── RESULTS GRID ── */}
        <section className="py-6 bg-gray-50/30 min-h-screen">
          <div className="container mx-auto px-4 max-w-7xl">

            {/* First-load skeletons */}
            {isFirstLoad && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Cards — no layout animation for perf; only fade-in on mount */}
            {!isFirstLoad && (
              <>
                {projects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                    {projects.map((p, i) => (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/project/${p.id}`)}
                        className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer flex flex-col"
                        style={{
                          // Stagger fade-in only for first page
                          animation: i < PAGE_SIZE
                            ? `fadeInUp 0.3s ease forwards ${Math.min(i * 0.03, 0.5)}s`
                            : undefined,
                          opacity: i < PAGE_SIZE ? 0 : 1,
                        }}
                      >
                        {/* Thumbnail */}
                        <div className="relative h-40 overflow-hidden bg-gray-50 flex-shrink-0">
                          <ProjectImage
                            src={p.thumbnail_url ?? ""}
                            alt={p.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {p.is_featured && (
                            <span className="absolute top-3 left-3 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase rounded-full flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5" />Featured
                            </span>
                          )}
                          {p.difficulty && (
                            <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${diffColor[p.difficulty] ?? "bg-gray-100 text-gray-700 border border-gray-300"}`}>
                              {p.difficulty}
                            </span>
                          )}
                          <div className="absolute bottom-3 left-3 flex items-center gap-1">
                            {p.category && <span className="px-2 py-0.5 bg-black/60 backdrop-blur text-white text-[9px] font-bold rounded-full">{p.category}</span>}
                            {p.subcategory && <span className="px-2 py-0.5 bg-black/40 backdrop-blur text-white/80 text-[9px] rounded-full">{p.subcategory}</span>}
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="p-3 flex flex-col flex-1">
                          <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{p.description}</p>
                          {(p.tags ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {(p.tags ?? []).slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-medium rounded-full">{tag}</span>
                              ))}
                            </div>
                          )}
                          <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{fmt(p.views ?? 0)}</span>
                              <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{fmt(p.likes ?? 0)}</span>
                              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />{p.rating ?? "—"}</span>
                            </div>
                            {p.duration && <span className="flex items-center gap-1 text-[10px] text-gray-400"><Clock className="h-3 w-3" />{p.duration}</span>}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!user) { navigate("/login"); return; }
                                setCreatingProject(true);
                                try {
                                  await (supabase as any)
                                    .from("user_projects")
                                    .insert({ user_id: user.id, title: p.title, description: p.description, status: "active" });
                                  navigate("/my-projects");
                                } catch {}
                                finally { setCreatingProject(false); }
                              }}
                              className="flex-1 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1.5"
                            >
                              {creatingProject ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                              Start this Project
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const url = `${window.location.origin}/project/${p.id}`;
                                if (navigator.share) {
                                  try { await navigator.share({ title: p.title, text: p.description ?? "", url }); } catch {}
                                } else {
                                  await navigator.clipboard.writeText(url);
                                  const t = e.currentTarget as HTMLButtonElement;
                                  const orig = t.innerHTML;
                                  t.innerHTML = "✓";
                                  t.style.color = "#22c55e";
                                  setTimeout(() => { t.innerHTML = orig; t.style.color = ""; }, 1500);
                                }
                              }}
                              title="Share project"
                              className="px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all flex items-center justify-center"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No projects found</h3>
                    <p className="text-sm text-gray-400 mb-6">{totalActive > 0 ? "Try removing some filters" : "No projects match your search"}</p>
                    <button onClick={() => { clearAll(); setSearch(""); }} className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-colors">
                      Clear all filters
                    </button>
                  </div>
                )}

                {/* Load more skeletons when fetching next page */}
                {isLoadingMore && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
                  </div>
                )}
              </>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="py-10 flex justify-center">
              {!hasMore && projects.length > 0 && (
                <span className="text-[10px] font-black text-gray-200 uppercase tracking-widest">End of Projects</span>
              )}
            </div>
          </div>
        </section>

        {/* ── BOTTOM SHEET ── */}
        <AnimatePresence>
          {sheetMode && (
            <>
              <motion.div key="backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 z-[350]"
                onClick={closeSheet}
              />

              {/* Mobile sheet */}
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
                    Apply Filters
                  </button>
                </div>
              </motion.div>

              {/* Desktop side drawer */}
              <motion.div key="sheet-desktop"
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-[360] bg-white shadow-2xl"
                style={{ width: "360px" }}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <button onClick={resetSheet} className="text-sm text-gray-500 font-medium hover:text-gray-800 transition-colors">Reset</button>
                  <h2 className="text-[15px] font-bold text-gray-900">{sheetMode === "filter" ? "Filters" : "Sort by"}</h2>
                  <button onClick={closeSheet} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <X size={15} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6"><SheetBody /></div>
                <div className="px-6 py-5 border-t border-gray-100">
                  <button onClick={applySheet} className="w-full py-4 bg-black text-white rounded-2xl text-sm font-bold tracking-wide hover:bg-gray-900 active:scale-[0.98] transition-all">
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </Layout>
    </PageTransition>
  );
};

export default Projects;
