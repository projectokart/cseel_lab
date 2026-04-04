import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/shared/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, FlaskConical, GraduationCap, BookOpen,
  Beaker, ListOrdered, CheckCircle, PlayCircle,
  Monitor, ChevronLeft, ChevronRight, ZoomIn, X,
  AlertTriangle, Package, ShoppingCart, Heart, Share2,
  Bookmark, Target, Image as ImageIcon, Sparkles, Calculator, BarChart2,
  Code2, Map, HelpCircle, ClipboardList, Trophy, MessageSquare,
  Link2, ThumbsUp, RotateCcw, Play, ChevronDown, Layers,
  ExternalLink, Clock, Star, Zap, Eye,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import LabMaterialDetail, { LabMaterialData } from "@/components/LabMaterialDetail";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Experiment {
  id: string;
  title: string;
  subject: string;
  class: string | null;
  difficulty: string | null;
  description: string | null;
  thumbnail_url: string | null;
  images?: string[] | null;
  materials: string | null;
  procedure: string | null;
  outcome: string | null;
  precautions?: string | null;
  video_link: string | null;
  demo_link: string | null;
}

interface LabMaterial extends LabMaterialData {
  quantity?: string | null;
  unit?: string | null;
}

interface AdminSettings {
  show_material_price: boolean;
  show_material_stock: boolean;
  show_material_warning: boolean;
  show_material_safety: boolean;
  show_material_add_to_cart: boolean;
}

// ─── FALLBACK DATA ────────────────────────────────────────────────────────────
const FALLBACK: Experiment[] = [
  {
    id: "static-1", title: "Absorption In the Small and Large Intestines",
    subject: "Biology", class: "Higher Education", difficulty: "Intermediate",
    description: "Explore how nutrients are absorbed in the intestinal lining through this detailed hands-on experiment. Students will examine the role of villi, microvilli, and active transport mechanisms in nutrient absorption.",
    thumbnail_url: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif",
    images: [],
    materials: "Microscope\nPrepared slides of intestinal tissue\nColoured pencils\nLab notebook\nSafety gloves",
    procedure: "Set up the microscope and focus on low power first.\nPlace the prepared intestinal tissue slide on the stage.\nObserve under low, medium, and high magnification.\nIdentify villi, microvilli, and epithelial cells.\nSketch and label the structures in your lab notebook.",
    outcome: "Students will identify structural adaptations of the intestinal lining that increase surface area for absorption.",
    precautions: "Handle microscope slides with care to avoid breakage.\nDo not touch the slide surface.\nWash hands before and after the experiment.",
    video_link: "", demo_link: "",
  },
  {
    id: "static-2", title: "Acid-Base Titration",
    subject: "Chemistry", class: "Higher Education", difficulty: "Intermediate",
    description: "Determine the concentration of an unknown acid or base solution through careful titration.",
    thumbnail_url: "https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg",
    images: [],
    materials: "Burette (50 mL) + Retort stand\nConical flask (250 mL) × 3\nNaOH solution (0.1 M)\nUnknown HCl solution\nPhenolphthalein indicator\nSafety goggles + Lab gloves",
    procedure: "Rinse the burette with NaOH solution, then fill to the zero mark.\nPipette exactly 25 mL of the unknown HCl solution into a conical flask.\nAdd 2–3 drops of phenolphthalein indicator to the flask.\nTitrate slowly, adding NaOH dropwise while swirling.\nStop when a faint pink colour persists for 30 seconds.\nRecord volume of NaOH used. Repeat 3 times for accuracy.",
    outcome: "Students will determine the concentration of the unknown acid using C₁V₁ = C₂V₂.",
    precautions: "Wear safety goggles and gloves at all times.\nHandle NaOH with care — highly corrosive.\nDispose of chemicals as per lab guidelines.",
    video_link: "https://www.youtube.com/watch?v=UM8lWnWQNjI", demo_link: "",
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const SUBJECT_COLOR: Record<string, string> = {
  Biology:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  Chemistry:   "bg-sky-50 text-sky-700 border-sky-200",
  Physics:     "bg-violet-50 text-violet-700 border-violet-200",
  Engineering: "bg-orange-50 text-orange-700 border-orange-200",
  Mathematics: "bg-rose-50 text-rose-700 border-rose-200",
  Technology:  "bg-cyan-50 text-cyan-700 border-cyan-200",
};

const DIFF_COLOR: Record<string, string> = {
  easy:         "bg-green-50 text-green-600 border-green-200",
  medium:       "bg-amber-50 text-amber-700 border-amber-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  hard:         "bg-red-50 text-red-600 border-red-200",
};

const CAT_COLOR: Record<string, string> = {
  CHE: "bg-blue-100 text-blue-700",
  GLS: "bg-cyan-100 text-cyan-700",
  EQP: "bg-orange-100 text-orange-700",
  BIO: "bg-green-100 text-green-700",
  ELC: "bg-yellow-100 text-yellow-700",
  SAF: "bg-red-100 text-red-700",
  CON: "bg-purple-100 text-purple-700",
  PHY: "bg-indigo-100 text-indigo-700",
  MIC: "bg-teal-100 text-teal-700",
  MSR: "bg-pink-100 text-pink-700",
};

const getYoutubeId = (url: string) =>
  url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] ?? null;

const parseLines = (text: string) =>
  text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

// ─── IMAGE + VIDEO SLIDER ─────────────────────────────────────────────────────
// Last thumbnail slot is always the video (if available)
const ImageSlider = ({
  images,
  videoLink,
  saved,
  onSave,
  onLike,
  liked,
  likes,
  onShare,
  onWhatsApp,
}: {
  images: string[];
  videoLink: string | null;
  saved: boolean; onSave: () => void;
  liked: boolean; likes: number; onLike: () => void;
  onShare: () => void; onWhatsApp: () => void;
}) => {
  const ytId   = videoLink ? videoLink.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] : null;
  const ytEmbed = ytId ? `https://www.youtube.com/embed/${ytId}` : null;
  // total slots: images + (video if exists) — video is always at index 1 (second position)
  const hasVideo = !!(ytEmbed || videoLink);
  const VIDEO_IDX  = hasVideo ? 1 : -1; // second position (index 1)
  // Build ordered slots: [img0, VIDEO, img1, img2, ...]
  const totalSlots = images.length + (hasVideo ? 1 : 0);

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const ts = useRef<number | null>(null);
  const te = useRef<number | null>(null);

  if (totalSlots === 0) return null;

  // Slot → actual image index mapping:
  // slot 0 → images[0], slot 1 → VIDEO (if hasVideo), slot 2+ → images[1], images[2]...
  const isVideoSlot = (i: number) => hasVideo && i === VIDEO_IDX;
  const imageForSlot = (i: number): string => {
    if (!hasVideo) return images[i];
    if (i === 0) return images[0];
    return images[i - 1]; // shift after video slot
  };
  const prev = () => setActive(a => (a - 1 + totalSlots) % totalSlots);
  const next = () => setActive(a => (a + 1) % totalSlots);

  return (
    <>
      {/* ── Main viewer ── */}
      <div
        className="relative w-full bg-gray-100 rounded-xl overflow-hidden shadow group mb-1.5"
        style={{ height: "clamp(180px, 48vw, 340px)", cursor: isVideoSlot(active) ? "default" : "zoom-in" }}
        onTouchStart={e => { ts.current = e.touches[0].clientX; }}
        onTouchMove={e  => { te.current = e.touches[0].clientX; }}
        onTouchEnd={() => {
          if (!ts.current || !te.current) return;
          const d = ts.current - te.current;
          if (Math.abs(d) > 50) d > 0 ? next() : prev();
          ts.current = null; te.current = null;
        }}
        onClick={() => { if (!isVideoSlot(active)) setLightbox(true); }}
      >
        {isVideoSlot(active) ? (
          ytEmbed ? (
            <iframe src={ytEmbed} title="Video" className="w-full h-full" allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          ) : (
            <video src={videoLink!} controls className="w-full h-full bg-black" onClick={e => e.stopPropagation()} />
          )
        ) : (
          <>
            <img key={active} src={imageForSlot(active)} alt="" className="w-full h-full object-cover transition-opacity duration-300" />
            <div className="absolute top-2 left-2 w-6 h-6 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <ZoomIn className="h-3 w-3 text-white" />
            </div>
          </>
        )}

        {/* Save icon — top-right of image */}
        <button
          onClick={e => { e.stopPropagation(); onSave(); }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow transition-all z-10 ${saved ? "bg-amber-400 text-white" : "bg-black/40 text-white hover:bg-black/60"}`}
          title={saved ? "Saved" : "Save"}
        >
          <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-white" : ""}`} />
        </button>

        {/* Prev/Next arrows */}
        {totalSlots > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ChevronLeft className="h-3.5 w-3.5 text-white" />
            </button>
            <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-8 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ChevronRight className="h-3.5 w-3.5 text-white" />
            </button>
          </>
        )}

        {/* Slide counter */}
        {totalSlots > 1 && !isVideoSlot(active) && (
          <span className="absolute bottom-2 left-2 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded-full pointer-events-none">
            {active + 1} / {totalSlots}
          </span>
        )}
        {isVideoSlot(active) && (
          <span className="absolute bottom-2 left-2 text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded-full pointer-events-none flex items-center gap-0.5">
            <PlayCircle className="h-2.5 w-2.5" /> Video
          </span>
        )}
      </div>

      {/* ── Thumbnails row + action icons on same row ── */}
      <div className="flex items-center gap-1.5">
        {/* Thumbnails scrollable — same order as main slots */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1 min-w-0">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const isVid = isVideoSlot(i);
            const isActive = i === active;
            if (isVid) {
              return (
                <button key={`vid-${i}`} onClick={() => setActive(i)}
                  className={`shrink-0 w-11 h-11 rounded-md overflow-hidden border-2 transition-all flex items-center justify-center ${isActive ? "border-red-500 shadow-sm scale-105 bg-red-50" : "border-transparent bg-gray-100 opacity-70 hover:opacity-100 hover:border-gray-300"}`}>
                  <PlayCircle className={`h-5 w-5 ${isActive ? "text-red-500" : "text-gray-400"}`} />
                </button>
              );
            }
            return (
              <button key={i} onClick={() => setActive(i)}
                className={`shrink-0 w-11 h-11 rounded-md overflow-hidden border-2 transition-all ${isActive ? "border-primary shadow-sm scale-105" : "border-transparent hover:border-gray-300 opacity-60 hover:opacity-100"}`}>
                <img src={imageForSlot(i)} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>

        {/* Action icons — right of thumbnails, compact */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          {/* Like */}
          <button onClick={onLike}
            className={`flex items-center gap-0.5 h-8 px-2 rounded-lg text-[10px] font-bold border transition-all ${liked ? "bg-red-50 border-red-200 text-red-500" : "bg-muted border-border text-muted-foreground hover:text-red-500"}`}>
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-red-500" : ""}`} />
            <span>{likes}</span>
          </button>
          {/* Share */}
          <button onClick={onShare} title="Copy link"
            className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
            <Share2 className="h-3.5 w-3.5" />
          </button>
          {/* WhatsApp */}
          <button onClick={onWhatsApp} title="WhatsApp"
            className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-green-600 hover:border-green-300 transition-all">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && !isVideoSlot(active) && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center">
            <X className="h-4 w-4 text-white" />
          </button>
          <img src={imageForSlot(active)} alt="" className="max-w-full max-h-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
};

// ─── COLLAPSIBLE SECTION ──────────────────────────────────────────────────────
const Section = ({
  icon, title, children, defaultOpen = true,
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const sectionId = `section-${title.replace(/\s+/g, "-").replace(/[&]/g, "").toLowerCase()}`;
  return (
    <div id={sectionId} className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50/80 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <span className="text-xs font-bold text-foreground uppercase tracking-wide">{title}</span>
        </div>
        <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 bg-white border-t border-border/60">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── SIDEBAR MENU (Desktop: always open | Mobile: capsule tab) ────────────────
const SIDEBAR_ITEMS = [
  { icon: "sports_score",        label: "Aim & Theory" },
  { icon: "menu_book",           label: "About" },
  { icon: "science",             label: "Materials Required" },
  { icon: "inventory_2",         label: "Lab Materials" },
  { icon: "format_list_numbered",label: "Procedure" },
  { icon: "warning_amber",       label: "Precautions" },
  { icon: "task_alt",            label: "Expected Outcome" },
  { icon: "play_circle",         label: "Images & Video Demo" },
  { icon: "auto_awesome",        label: "Interactive Animation" },
  { icon: "calculate",           label: "Calculation & Formulae" },
  { icon: "bar_chart",           label: "Graph & Plot" },
  { icon: "code",                label: "Code Verification" },
  { icon: "account_tree",        label: "Mind Map" },
  { icon: "help_outline",        label: "Theory Questions" },
  { icon: "quiz",                label: "MCQ Assessment" },
  { icon: "emoji_events",        label: "Student Test" },
  { icon: "forum",               label: "Lab Discussion" },
  { icon: "link",                label: "Related Experiments" },
  { icon: "layers",              label: "Related Projects" },
];

// Load Google Material Symbols font once
if (typeof document !== "undefined" && !document.getElementById("mat-sym-font")) {
  const link = document.createElement("link");
  link.id = "mat-sym-font";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0";
  document.head.appendChild(link);
}

const SidebarMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [navH, setNavH] = useState(0);

  // Detect the page's top navbar height so sidebar starts below it
  useEffect(() => {
    const measure = () => {
      // Try common nav selectors used by CSEEL Layout
      const nav =
        document.querySelector("nav.bg-background") ||
        document.querySelector("nav") ||
        document.querySelector("header") ||
        document.querySelector("[class*='bg-topbar']") ||
        document.querySelector("[class*='navbar']");
      if (nav) {
        setNavH((nav as HTMLElement).offsetHeight);
      } else {
        setNavH(64); // fallback
      }
    };
    measure();
    window.addEventListener("resize", measure);
    // Re-measure after a tick in case nav renders late
    const t = setTimeout(measure, 300);
    return () => { window.removeEventListener("resize", measure); clearTimeout(t); };
  }, []);

  const scrollTo = (label: string) => {
    const sectionId = `section-${label.replace(/\s+/g, "-").replace(/[&]/g, "").toLowerCase()}`;
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = navH + 48; // nav + sticky breadcrumb
      const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    // Close on mobile only
    if (window.innerWidth <= 1024) onClose();
  };

  const sidebarTop = navH > 0 ? navH : 64;
  const sidebarHeight = `calc(100vh - ${sidebarTop}px)`;

  return (
    <>
      {/* ── Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0');
        .mat-icon { font-family: 'Material Symbols Rounded'; font-weight: normal; font-style: normal;
          font-size: 18px; line-height: 1; letter-spacing: normal; text-transform: none;
          display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr;
          font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased; }

        /* Hide Chrome extension floating buttons */
        body > *[style*="z-index: 2147483647"],
        body > *[id^="crx"], body > *[id^="chrome-extension"],
        #gemini-fullpage-floating-button,
        [id*="gemini"][class*="float"],
        .__chromeExtension,
        [class*="chrome-ext"],
        div[style*="position: fixed"][style*="z-index: 214748"],
        div[style*="position:fixed"][style*="z-index:214748"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        .sidebar-sheet {
          position: fixed;
          left: 0;
          width: 240px;
          z-index: 1200;
          background: linear-gradient(180deg, #003c6e 0%, #006fcc 100%);
          box-shadow: 4px 0 20px rgba(0,60,110,0.22);
          display: flex; flex-direction: column;
          transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1);
          border-right: 1px solid rgba(214, 237, 255, 0.15);
        }
        @media (min-width: 1025px) {
          .sidebar-sheet { transform: translateX(0) !important; }
          .sidebar-capsule-tab { display: none !important; }
          .sidebar-mobile-overlay { display: none !important; }
          .experiment-main-content { margin-left: 240px !important; }
        }
        @media (max-width: 1024px) {
          .sidebar-sheet { transform: translateX(-100%); }
          .sidebar-sheet.sidebar-open { transform: translateX(0); }
          .experiment-main-content { margin-left: 0 !important; }
          .sidebar-capsule-tab {
            position: fixed; left: 0;
            width: 26px; height: 64px;
            background: rgba(0, 60, 110, 0.85);
            border-radius: 0 16px 16px 0;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; z-index: 1199; color: #ffffff;
            box-shadow: 2px 0 8px rgba(0,60,110,0.2);
            opacity: 0; transition: opacity 0.4s ease;
            backdrop-filter: blur(6px);
            transform: translateY(-50%);
          }
          .sidebar-capsule-tab.tab-visible { opacity: 1; }
        }
        .sidebar-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500;
          cursor: pointer;
          border-radius: 6px; margin: 2px 8px; transition: all 0.18s;
          border: 1px solid transparent;
        }
        .sidebar-item:hover {
          background: rgba(255,255,255,0.15); color: #ffffff;
          border-color: rgba(214, 237, 255, 0.3); padding-left: 18px;
        }
        .sidebar-item .mat-icon { color: rgba(255,255,255,0.75); font-size: 18px; flex-shrink: 0; transition: color 0.18s; }
        .sidebar-item:hover .mat-icon { color: #ffffff; }
        .sidebar-logo {
          padding: 14px 16px 11px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          flex-shrink: 0;
          display: flex; align-items: center; gap: 8px;
        }
        .sidebar-logo span { color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1px; }
        .sidebar-scroll { overflow-y: auto; flex: 1; padding: 6px 0 20px; }
        .sidebar-scroll::-webkit-scrollbar { width: 2px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(214, 237, 255, 0.25); border-radius: 4px; }
        .sidebar-mobile-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1198;
          backdrop-filter: blur(2px);
        }
      `}</style>

      {/* Mobile overlay */}
      {open && <div className="sidebar-mobile-overlay" onClick={onClose} />}

      {/* Sidebar panel — starts exactly below navbar */}
      <div
        className={`sidebar-sheet ${open ? "sidebar-open" : ""}`}
        style={{ top: sidebarTop, height: sidebarHeight }}
      >
        <div className="sidebar-logo">
          <span className="mat-icon" style={{ color: "rgba(255,255,255,0.9)", fontSize: 18 }}>format_list_bulleted</span>
          <span>CONTENTS</span>
        </div>
        <div className="sidebar-scroll">
          {SIDEBAR_ITEMS.map(({ icon, label }, i) => (
            <div key={i} className="sidebar-item" onClick={() => scrollTo(label)}>
              <span className="mat-icon">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Mobile capsule tab (Smart Hide — shows on scroll/touch/move, hides after 2s)
const SidebarCapsuleTab = ({ onClick, sidebarOpen }: { onClick: () => void; sidebarOpen: boolean }) => {
  const [visible, setVisible] = useState(false);
  const [navH, setNavH] = useState(64);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const measure = () => {
      const nav = document.querySelector("nav") || document.querySelector("header");
      if (nav) setNavH((nav as HTMLElement).offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    setTimeout(measure, 300);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const showTab = useCallback(() => {
    if (window.innerWidth > 1024) return;
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!sidebarOpen) setVisible(false);
    }, 2000);
  }, [sidebarOpen]);

  useEffect(() => {
    window.addEventListener("scroll", showTab);
    window.addEventListener("touchstart", showTab);
    window.addEventListener("mousemove", showTab);
    showTab();
    return () => {
      window.removeEventListener("scroll", showTab);
      window.removeEventListener("touchstart", showTab);
      window.removeEventListener("mousemove", showTab);
    };
  }, [showTab]);

  useEffect(() => {
    if (sidebarOpen) setVisible(false);
  }, [sidebarOpen]);

  // Center in visible area below navbar
  const topPx = navH + (window.innerHeight - navH) / 2;

  return (
    <div
      className={`sidebar-capsule-tab ${visible ? "tab-visible" : ""}`}
      style={{ top: topPx }}
      onClick={onClick}
      title="Open Contents"
    >
      <span className="mat-icon" style={{ fontSize: 15, fontFamily: "'Material Symbols Rounded'" }}>chevron_right</span>
    </div>
  );
};

// Keep IndexModal name alias for backward compatibility (now uses SidebarMenu)
const IndexModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <SidebarMenu open={open} onClose={onClose} />
);

// ─── AIM & THEORY ─────────────────────────────────────────────────────────────
const AimTheory = ({ subject }: { subject: string }) => (
  <Section icon={<Target className="h-3.5 w-3.5" />} title="Aim & Theory">
    <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 mb-3">
      <p className="text-xs leading-relaxed text-foreground">
        To verify the laws of reflection using a plane mirror, establishing that the angle of incidence (θᵢ) always equals the angle of reflection (θᵣ) with respect to the normal at the point of incidence.
      </p>
    </div>
    <div className="grid grid-cols-4 gap-2">
      {[
        { label: "Principle", value: "θᵢ = θᵣ" },
        { label: "Subject", value: subject },
        { label: "Type", value: "Specular" },
        { label: "Medium", value: "Air" },
      ].map(({ label, value }) => (
        <div key={label} className="bg-muted rounded-lg p-2 border border-border text-center">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
          <p className="text-xs font-bold text-foreground truncate">{value}</p>
        </div>
      ))}
    </div>
  </Section>
);

// ─── VISUAL DEMO ──────────────────────────────────────────────────────────────
const VisualDemo = ({ videoLink }: { videoLink: string | null }) => {
  const ytId = videoLink ? videoLink.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] : null;
  const embed = ytId ? `https://www.youtube.com/embed/${ytId}` : null;
  return (
    <Section icon={<ImageIcon className="h-3.5 w-3.5" />} title="Images & Video Demo" defaultOpen={false}>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { emoji: "🪞", label: "Fig 1: Mirror Setup" },
          { emoji: "📐", label: "Fig 2: Normal & Pins" },
          { emoji: "💡", label: "Fig 3: Laser Ray (45°)" },
        ].map(({ emoji, label }) => (
          <div key={label} className="rounded-lg border border-border overflow-hidden">
            <div className="aspect-[4/3] bg-muted flex items-center justify-center text-2xl opacity-60">{emoji}</div>
            <p className="text-[10px] text-muted-foreground px-2 py-1">{label}</p>
          </div>
        ))}
      </div>
      {embed && (
        <div className="rounded-xl overflow-hidden aspect-video bg-gray-900">
          <iframe src={embed} title="Video walkthrough" className="w-full h-full" allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      )}
    </Section>
  );
};

// ─── INTERACTIVE ANIMATION ────────────────────────────────────────────────────
const ReflectionAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(45);

  const draw = useCallback((deg: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H * 0.7;
    ctx.beginPath(); ctx.moveTo(40, cy); ctx.lineTo(W - 40, cy);
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.setLineDash([6, 4]);
    ctx.moveTo(cx, cy - H * 0.55); ctx.lineTo(cx, cy + 28);
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1; ctx.stroke();
    ctx.setLineDash([]);
    const rad = deg * Math.PI / 180;
    const len = Math.min(W, H) * 0.44;
    const ix = cx - Math.sin(rad) * len, iy = cy - Math.cos(rad) * len;
    ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(cx, cy);
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2.5; ctx.stroke();
    const rx = cx + Math.sin(rad) * len, ry = cy - Math.cos(rad) * len;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rx, ry);
    ctx.strokeStyle = "#6366f1"; ctx.lineWidth = 2.5; ctx.stroke();
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
    g.addColorStop(0, "rgba(255,255,255,0.85)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 44, -Math.PI / 2 - rad, -Math.PI / 2);
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 44, -Math.PI / 2, -Math.PI / 2 + rad);
    ctx.strokeStyle = "#6366f1"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = "600 11px Inter,sans-serif";
    ctx.fillStyle = "#f59e0b"; ctx.fillText(`θᵢ=${deg}°`, cx - 86, cy - 14);
    ctx.fillStyle = "#6366f1"; ctx.fillText(`θᵣ=${deg}°`, cx + 52, cy - 14);
    ctx.font = "9px Inter"; ctx.fillStyle = "#94a3b8";
    ctx.fillText("Normal", cx + 4, cy - H * 0.52);
    ctx.fillText("Mirror", W - 66, cy - 7);
  }, []);

  useEffect(() => { draw(angle); }, [angle, draw]);
  useEffect(() => {
    const ro = new ResizeObserver(() => draw(angle));
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [angle, draw]);

  return (
    <Section icon={<Sparkles className="h-3.5 w-3.5" />} title="Interactive Animation" defaultOpen={false}>
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <label className="text-xs text-muted-foreground">Angle of Incidence:</label>
        <input type="range" min={10} max={80} value={angle}
          onChange={e => setAngle(Number(e.target.value))}
          className="flex-1 min-w-[100px] accent-primary" />
        <span className="font-mono text-primary font-bold text-xs min-w-[36px]">{angle}°</span>
      </div>
      <div className="rounded-xl overflow-hidden bg-[#030712]" style={{ height: 240 }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>
    </Section>
  );
};

// ─── CALCULATION & FORMULAE ───────────────────────────────────────────────────
const Calculation = () => {
  const rows = [
    { trial: 1, ti: 30, tr: 30 }, { trial: 2, ti: 40, tr: 40 },
    { trial: 3, ti: 50, tr: 50 }, { trial: 4, ti: 60, tr: 60 },
  ];
  return (
    <Section icon={<Calculator className="h-3.5 w-3.5" />} title="Calculation & Formulae" defaultOpen={false}>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 text-center">
          <p className="font-mono text-lg text-primary font-bold">θᵢ = θᵣ</p>
          <p className="text-[10px] text-muted-foreground mt-1">Angle of Incidence = Angle of Reflection</p>
        </div>
        <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 text-center">
          <p className="font-mono text-sm text-primary font-semibold">n₁ sin(θᵢ) = n₁ sin(θᵣ)</p>
          <p className="text-[10px] text-muted-foreground mt-1">Generalized form</p>
        </div>
      </div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Observation Table</p>
      <div className="overflow-x-auto rounded-lg border border-border mb-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              {["Trial", "θᵢ (°)", "θᵣ (°)", "θᵢ − θᵣ", "Verified?"].map(h => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ trial, ti, tr }) => (
              <tr key={trial} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2">{trial}</td>
                <td className="px-3 py-2 text-center">{ti}</td>
                <td className="px-3 py-2 text-center">{tr}</td>
                <td className="px-3 py-2 text-center text-green-600 font-semibold">0</td>
                <td className="px-3 py-2 text-center text-green-600 font-semibold">✓</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { val: "0°", unit: "Avg Error" },
          { val: "100%", unit: "Success Rate" },
          { val: "4", unit: "Trials" },
        ].map(({ val, unit }) => (
          <div key={unit} className="bg-muted border border-border rounded-lg p-2.5 text-center">
            <p className="text-xl font-extrabold text-green-600">{val}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{unit}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

// ─── GRAPH & PLOT ─────────────────────────────────────────────────────────────
const GraphPlot = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth, H = 220;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const pad = { l: 48, r: 20, t: 20, b: 42 };
    const gW = W - pad.l - pad.r, gH = H - pad.t - pad.b;
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const x = pad.l + i * (gW / 5);
      ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + gH); ctx.stroke();
      const y = pad.t + i * (gH / 5);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + gW, y); ctx.stroke();
    }
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + gH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t + gH); ctx.lineTo(pad.l + gW, pad.t + gH); ctx.stroke();
    const pts: [number, number][] = [[30, 30], [40, 40], [50, 50], [60, 60], [70, 70]];
    const maxV = 90;
    const toX = (v: number) => pad.l + (v / maxV) * gW;
    const toY = (v: number) => pad.t + gH - (v / maxV) * gH;
    const grad = ctx.createLinearGradient(toX(20), 0, toX(80), 0);
    grad.addColorStop(0, "#818cf8"); grad.addColorStop(1, "#6366f1");
    ctx.beginPath();
    pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(toX(x), toY(y)) : ctx.lineTo(toX(x), toY(y)));
    ctx.strokeStyle = grad; ctx.lineWidth = 2.5; ctx.stroke();
    pts.forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(toX(x), toY(y), 4, 0, Math.PI * 2);
      ctx.fillStyle = "#6366f1"; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    });
    ctx.fillStyle = "#94a3b8"; ctx.font = "10px Inter";
    [0, 30, 60, 90].forEach(v => {
      ctx.fillText(String(v), pad.l - 24, toY(v) + 4);
      if (v > 0) ctx.fillText(String(v), toX(v) - 5, pad.t + gH + 14);
    });
    ctx.fillStyle = "#64748b"; ctx.font = "10px Inter";
    ctx.fillText("θᵢ (degrees)", pad.l + gW / 2 - 35, H - 4);
    ctx.save(); ctx.translate(12, pad.t + gH / 2 + 28); ctx.rotate(-Math.PI / 2);
    ctx.fillText("θᵣ (degrees)", 0, 0); ctx.restore();
  }, []);

  return (
    <Section icon={<BarChart2 className="h-3.5 w-3.5" />} title="Graph & Plot" defaultOpen={false}>
      <div className="bg-muted border border-border rounded-lg p-2">
        <canvas ref={canvasRef} height={220} style={{ width: "100%", display: "block", borderRadius: 6 }} />
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-1.5">
        θᵢ vs θᵣ — straight line through origin (slope = 1), confirming law of reflection.
      </p>
    </Section>
  );
};

// ─── CODE SNIPPETS ────────────────────────────────────────────────────────────
const CODE_SNIPPETS: Record<string, string> = {
  Python: `# Reflection Law Verification
import numpy as np
import matplotlib.pyplot as plt

def verify_reflection(angles_i):
    return [theta_i for theta_i in angles_i]

angles_i = [30, 40, 50, 60, 70]
angles_r = verify_reflection(angles_i)
plt.plot(angles_i, angles_r, 'o-', color='#6366f1')
plt.xlabel('θᵢ (degrees)')
plt.ylabel('θᵣ (degrees)')
plt.title('θᵢ vs θᵣ — Law of Reflection')
plt.show()`,
  JavaScript: `// Reflection Law — JavaScript
function verifyReflection(anglesI) {
  return anglesI.map(theta_i => {
    const theta_r = theta_i;
    console.log(\`θᵢ = \${theta_i}° → θᵣ = \${theta_r}° ✓\`);
    return { theta_i, theta_r, verified: theta_i === theta_r };
  });
}
const results = verifyReflection([30, 40, 50, 60, 70]);
console.log('All verified:', results.every(r => r.verified));`,
  "C++": `// Reflection Law — C++
#include <iostream>
#include <vector>
using namespace std;
bool checkReflection(double ti, double tr) {
    return ti == tr;
}
int main() {
    vector<double> angles = {30, 40, 50, 60, 70};
    for (auto t : angles)
        cout << "θᵢ=" << t << " θᵣ=" << t
             << (checkReflection(t, t) ? " ✓" : " ✗") << endl;
    return 0;
}`,
  MATLAB: `% Reflection Law — MATLAB
theta_i = [30, 40, 50, 60, 70];
theta_r = theta_i;
disp('Angle Verification:')
for k = 1:length(theta_i)
    fprintf('θᵢ=%d° θᵣ=%d° Diff=%d\\n', ...
            theta_i(k), theta_r(k), theta_i(k)-theta_r(k));
end
plot(theta_i, theta_r, 'o-b', 'LineWidth', 2)`,
};

const CodeVerification = () => {
  const [active, setActive] = useState("Python");
  return (
    <Section icon={<Code2 className="h-3.5 w-3.5" />} title="Code Verification" defaultOpen={false}>
      <div className="flex gap-1.5 flex-wrap mb-2">
        {Object.keys(CODE_SNIPPETS).map(lang => (
          <button key={lang} onClick={() => setActive(lang)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-all ${active === lang ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border hover:text-primary"}`}>
            {lang}
          </button>
        ))}
      </div>
      <pre className="bg-[#070d1a] text-green-300 text-[10px] rounded-lg p-3 overflow-x-auto leading-relaxed font-mono">
        <code>{CODE_SNIPPETS[active]}</code>
      </pre>
    </Section>
  );
};

// ─── MIND MAP ─────────────────────────────────────────────────────────────────
const MindMap = () => (
  <Section icon={<Map className="h-3.5 w-3.5" />} title="Mind Map" defaultOpen={false}>
    <div className="bg-muted border border-border rounded-lg overflow-hidden" style={{ aspectRatio: "16/7" }}>
      <svg viewBox="0 0 800 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow3"><feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <ellipse cx="400" cy="160" rx="75" ry="38" fill="#eef2ff" stroke="#6366f1" strokeWidth="2" filter="url(#glow3)"/>
        <text x="400" y="155" textAnchor="middle" fill="#4f46e5" fontWeight="800" fontSize="12">REFLECTION</text>
        <text x="400" y="170" textAnchor="middle" fill="#6366f1" fontSize="9">of Light</text>
        <line x1="325" y1="145" x2="220" y2="80" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7"/>
        <ellipse cx="185" cy="65" rx="60" ry="26" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1.5"/>
        <text x="185" y="61" textAnchor="middle" fill="#7c3aed" fontWeight="700" fontSize="10">Laws</text>
        <text x="185" y="74" textAnchor="middle" fill="#64748b" fontSize="8">θᵢ = θᵣ</text>
        <line x1="130" y1="55" x2="80" y2="35" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
        <text x="68" y="30" textAnchor="middle" fill="#94a3b8" fontSize="9">Same plane</text>
        <line x1="130" y1="73" x2="80" y2="90" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
        <text x="68" y="95" textAnchor="middle" fill="#94a3b8" fontSize="9">Normal ref.</text>
        <line x1="325" y1="175" x2="200" y2="230" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7"/>
        <ellipse cx="165" cy="248" rx="65" ry="26" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.5"/>
        <text x="165" y="244" textAnchor="middle" fill="#16a34a" fontWeight="700" fontSize="10">Types</text>
        <text x="165" y="257" textAnchor="middle" fill="#64748b" fontSize="8">Regular / Diffuse</text>
        <line x1="105" y1="248" x2="55" y2="238" stroke="#16a34a" strokeWidth="1" opacity="0.5"/>
        <text x="42" y="236" textAnchor="middle" fill="#94a3b8" fontSize="9">Specular</text>
        <line x1="105" y1="258" x2="55" y2="270" stroke="#16a34a" strokeWidth="1" opacity="0.5"/>
        <text x="42" y="275" textAnchor="middle" fill="#94a3b8" fontSize="9">Diffuse</text>
        <line x1="475" y1="145" x2="580" y2="80" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7"/>
        <ellipse cx="618" cy="65" rx="68" ry="26" fill="#fffbeb" stroke="#d97706" strokeWidth="1.5"/>
        <text x="618" y="61" textAnchor="middle" fill="#d97706" fontWeight="700" fontSize="10">Materials</text>
        <text x="618" y="74" textAnchor="middle" fill="#64748b" fontSize="8">Mirror, Surface</text>
        <line x1="680" y1="55" x2="730" y2="35" stroke="#d97706" strokeWidth="1" opacity="0.5"/>
        <text x="740" y="30" textAnchor="middle" fill="#94a3b8" fontSize="9">Plane mirror</text>
        <line x1="680" y1="73" x2="730" y2="90" stroke="#d97706" strokeWidth="1" opacity="0.5"/>
        <text x="740" y="95" textAnchor="middle" fill="#94a3b8" fontSize="9">Curved mirror</text>
        <line x1="475" y1="175" x2="590" y2="230" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7"/>
        <ellipse cx="625" cy="248" rx="75" ry="26" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5"/>
        <text x="625" y="244" textAnchor="middle" fill="#2563eb" fontWeight="700" fontSize="10">Applications</text>
        <text x="625" y="257" textAnchor="middle" fill="#64748b" fontSize="8">Mirrors, Periscopes</text>
        <line x1="694" y1="248" x2="740" y2="238" stroke="#2563eb" strokeWidth="1" opacity="0.5"/>
        <text x="750" y="236" textAnchor="middle" fill="#94a3b8" fontSize="9">Telescope</text>
        <line x1="694" y1="258" x2="740" y2="272" stroke="#2563eb" strokeWidth="1" opacity="0.5"/>
        <text x="750" y="275" textAnchor="middle" fill="#94a3b8" fontSize="9">Periscope</text>
      </svg>
    </div>
  </Section>
);

// ─── THEORY QUESTIONS ─────────────────────────────────────────────────────────
const THEORY_QA = [
  { q: "Q1. State the two laws of reflection of light.", a: "The two laws are: (1) The angle of incidence equals the angle of reflection (θᵢ = θᵣ). (2) The incident ray, reflected ray, and the normal to the reflecting surface all lie in the same plane." },
  { q: "Q2. What is the difference between specular and diffuse reflection?", a: "Specular reflection occurs on smooth surfaces where parallel rays reflect as parallel rays, forming a clear image. Diffuse reflection occurs on rough surfaces where rays scatter in all directions, illuminating surroundings without forming a clear image." },
  { q: "Q3. Why is the normal drawn at the point of incidence?", a: "The normal is the reference perpendicular to the surface at the exact hit point. All angles in reflection laws are measured from this normal, not the surface, ensuring accurate measurement." },
  { q: "Q4. If the mirror is rotated by 10°, the reflected ray rotates by?", a: "The reflected ray rotates by 20° (twice the mirror rotation). This is because rotating the mirror by 10° changes both the angle of incidence and reflection relative to the new normal. This principle is used in optical galvanometers." },
];

const TheoryQuestions = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Section icon={<HelpCircle className="h-3.5 w-3.5" />} title="Theory Questions" defaultOpen={false}>
      <div className="flex flex-col gap-1.5">
        {THEORY_QA.map(({ q, a }, i) => (
          <div key={i} className="border border-border rounded-lg overflow-hidden bg-muted/20">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/50 transition-colors">
              <span className="text-xs font-semibold text-foreground">{q}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground shrink-0 ml-2 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="px-3 pb-3 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/60">
                {a}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
};

// ─── MCQ ASSESSMENT ───────────────────────────────────────────────────────────
interface MCQItem { q: string; opts: string[]; correct: number; explanation: string; }
const MCQS: MCQItem[] = [
  { q: "What is the angle of reflection when angle of incidence is 55°?", opts: ["35°", "90°", "55°", "110°"], correct: 2, explanation: "By the first law of reflection, θᵣ = θᵢ = 55°." },
  { q: "The incident ray, reflected ray, and normal all lie in the same ______.", opts: ["Axis", "Plane", "Line", "Circle"], correct: 1, explanation: "This is the Second Law of Reflection." },
  { q: "If the mirror is rotated 15°, the reflected ray rotates by ______.", opts: ["15°", "7.5°", "30°", "45°"], correct: 2, explanation: "Reflected ray rotates by twice the mirror rotation angle." },
];

const MCQCard = ({ item, index }: { item: MCQItem; index: number }) => {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="bg-muted/20 border border-border rounded-lg p-3 mb-2">
      <p className="text-xs font-semibold mb-2 text-foreground">
        <span className="text-primary mr-1">Q{index + 1}.</span>{item.q}
      </p>
      <div className="flex flex-col gap-1.5">
        {item.opts.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === item.correct;
          const answered = selected !== null;
          let cls = "bg-white border-border text-foreground";
          if (answered && isCorrect) cls = "bg-green-50 border-green-300 text-green-700";
          else if (answered && isSelected && !isCorrect) cls = "bg-red-50 border-red-300 text-red-700";
          return (
            <button key={i} disabled={answered} onClick={() => setSelected(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs text-left transition-all ${cls} ${!answered ? "hover:border-primary/40 hover:bg-primary/5" : ""}`}>
              <span className={`w-3 h-3 rounded-full border-2 shrink-0 ${answered && isCorrect ? "border-green-500 bg-green-500" : answered && isSelected ? "border-red-500 bg-red-500" : "border-muted-foreground"}`} />
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <p className="text-[10px] text-green-600 mt-2 font-medium">✓ {item.explanation}</p>
      )}
    </div>
  );
};

const MCQAssessment = () => (
  <Section icon={<ClipboardList className="h-3.5 w-3.5" />} title="MCQ Assessment" defaultOpen={false}>
    {MCQS.map((item, i) => <MCQCard key={i} item={item} index={i} />)}
  </Section>
);

// ─── STUDENT TEST ─────────────────────────────────────────────────────────────
const TEST_QS: MCQItem[] = [
  { q: "For a plane mirror, the image is always ______.", opts: ["Real and inverted", "Virtual and erect", "Real and erect", "Virtual and inverted"], correct: 1, explanation: "Plane mirror always forms a virtual, erect image." },
  { q: "Angle of incidence = 0° means the ray hits the mirror ______.", opts: ["At 90° to normal", "At an angle", "Perpendicularly (along normal)", "Parallel to mirror"], correct: 2, explanation: "When angle = 0°, ray is along the normal, hitting perpendicularly." },
  { q: "Diffuse reflection is caused by ______.", opts: ["Smooth polished surfaces", "Rough irregular surfaces", "Transparent surfaces", "Curved mirrors only"], correct: 1, explanation: "Rough surfaces scatter parallel rays in random directions." },
];

const StudentTest = () => {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const [secs, setSecs] = useState(300);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setStarted(true); setDone(false); setAnswers([null, null, null]); setSecs(300);
    timerRef.current = setInterval(() => {
      setSecs(s => { if (s <= 1) { clearInterval(timerRef.current!); setDone(true); return 0; } return s - 1; });
    }, 1000);
  };
  const reset = () => {
    clearInterval(timerRef.current!); setStarted(false); setDone(false);
    setAnswers([null, null, null]); setSecs(300);
  };
  const score = answers.filter((a, i) => a === TEST_QS[i].correct).length;
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <Section icon={<Trophy className="h-3.5 w-3.5" />} title="Student Test" defaultOpen={false}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">Score: <strong className="text-green-600">{score} / 3</strong></span>
        <span className="font-mono text-amber-600 font-bold text-xs">{mm}:{ss}</span>
      </div>
      <div className="flex gap-2 mb-3">
        <button onClick={start} disabled={started && !done}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
          <Play className="h-3 w-3" /> Start Test
        </button>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-muted transition-all">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>
      {started && (
        <div>
          {TEST_QS.map((item, i) => (
            <div key={i} className="bg-muted/20 border border-border rounded-lg p-3 mb-2">
              <p className="text-xs font-semibold mb-2"><span className="text-primary mr-1">T{i + 1}.</span>{item.q}</p>
              <div className="flex flex-col gap-1.5">
                {item.opts.map((opt, j) => {
                  const answered = answers[i] !== null || done;
                  const isCorrect = j === item.correct;
                  let cls = "bg-white border-border";
                  if (answered && isCorrect) cls = "bg-green-50 border-green-300 text-green-700";
                  else if (answered && answers[i] === j) cls = "bg-red-50 border-red-300 text-red-700";
                  return (
                    <button key={j} disabled={answered}
                      onClick={() => setAnswers(a => { const n = [...a]; n[i] = j; return n; })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs text-left ${cls} ${!answered ? "hover:border-primary/40" : ""}`}>
                      <span className={`w-3 h-3 rounded-full border-2 shrink-0 ${answered && isCorrect ? "border-green-500 bg-green-500" : answered && answers[i] === j ? "border-red-500 bg-red-500" : "border-muted-foreground"}`} />
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      {(done || (started && answers.every(a => a !== null))) && (
        <div className="text-center bg-muted border border-border rounded-lg p-4 mt-1">
          <p className="text-4xl font-extrabold text-green-600 mb-1">{score}/3</p>
          <p className="text-xs text-muted-foreground mb-2">Review the sections above for mistakes.</p>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-700" style={{ width: `${Math.round(score / 3 * 100)}%` }} />
          </div>
        </div>
      )}
    </Section>
  );
};

// ─── LAB DISCUSSION ───────────────────────────────────────────────────────────
interface Comment { id: number; name: string; time: string; text: string; likes: number; initials: string; color: string; }
const SEED_COMMENTS: Comment[] = [
  { id: 1, name: "Aryan Kumar", time: "2 hours ago", text: "All five trials gave θᵢ = θᵣ with zero error! Laser setup made it much easier than optical pins.", likes: 12, initials: "AK", color: "from-emerald-500 to-blue-500" },
  { id: 2, name: "Prof. J. Mishra", time: "5 hours ago", text: "Great experiment! The law holds for curved mirrors too — the normal is drawn to the centre of curvature. Try concave/convex experiments next.", likes: 24, initials: "PJ", color: "from-violet-600 to-pink-500" },
];

const CommentItem = ({ comment }: { comment: Comment }) => {
  const [likes, setLikes] = useState(comment.likes);
  return (
    <div className="flex gap-2.5 py-2.5 border-b border-border/50 last:border-0">
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${comment.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
        {comment.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-foreground">{comment.name}</span>
          <span className="text-[10px] text-muted-foreground">{comment.time}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{comment.text}</p>
        <div className="flex gap-3 mt-1">
          <button onClick={() => setLikes(l => l + 1)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">
            <ThumbsUp className="h-3 w-3" /> {likes}
          </button>
          <button className="text-[10px] text-muted-foreground hover:text-primary transition-colors">💬 Reply</button>
        </div>
      </div>
    </div>
  );
};

// Full-screen comments popup
const CommentsPopup = ({
  open, onClose, comments, onPost
}: {
  open: boolean; onClose: () => void;
  comments: Comment[]; onPost: (text: string) => void;
}) => {
  const [text, setText] = useState("");
  if (!open) return null;
  const handlePost = () => {
    if (!text.trim()) return;
    onPost(text.trim());
    setText("");
  };
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: "min(92vw, 680px)", maxHeight: "88vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-white">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Lab Discussion</span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">{comments.length}</span>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
            <X className="h-3.5 w-3.5 text-gray-600" />
          </button>
        </div>

        {/* Post area */}
        <div className="px-5 py-3 border-b border-border/60 bg-gray-50/50">
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">YO</div>
            <div className="flex-1 flex flex-col gap-2">
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder="Share your lab findings or ask a question..."
                className="w-full bg-white border border-border rounded-xl px-3 py-2.5 text-xs resize-none min-h-[60px] focus:outline-none focus:border-primary/60 transition-colors shadow-sm" />
              <div className="flex gap-2">
                <button onClick={handlePost}
                  className="px-4 py-1.5 bg-primary text-white rounded-full text-[10px] font-semibold hover:bg-primary/90 transition-colors shadow-sm">Post Comment</button>
                <button onClick={() => setText("")}
                  className="px-3 py-1.5 border border-border rounded-full text-[10px] font-semibold hover:bg-muted transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments scrollable list */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">No comments yet. Be the first!</div>
          ) : (
            comments.map(c => <CommentItem key={c.id} comment={c} />)
          )}
        </div>
      </div>
    </div>
  );
};

const LabDiscussion = () => {
  const [comments, setComments] = useState<Comment[]>(SEED_COMMENTS);
  const [text, setText] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);

  const post = (txt: string) => {
    setComments(c => [{
      id: Date.now(), name: "You", time: "Just now", text: txt,
      likes: 0, initials: "YO", color: "from-primary to-indigo-400"
    }, ...c]);
  };

  const handleInlinePost = () => {
    if (!text.trim()) return;
    post(text.trim());
    setText("");
  };

  return (
    <Section icon={<MessageSquare className="h-3.5 w-3.5" />} title="Lab Discussion">
      {/* Compact post area */}
      <div className="flex gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">YO</div>
        <div className="flex-1 flex flex-col gap-2">
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Share your lab findings or ask a question..."
            className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-xs resize-none min-h-[52px] focus:outline-none focus:border-primary transition-colors" />
          <div className="flex gap-2">
            <button onClick={handleInlinePost}
              className="px-3 py-1.5 bg-primary text-white rounded-full text-[10px] font-semibold hover:bg-primary/90 transition-colors">Post Comment</button>
            <button onClick={() => setText("")}
              className="px-3 py-1.5 border border-border rounded-full text-[10px] font-semibold hover:bg-muted transition-colors">Cancel</button>
          </div>
        </div>
      </div>

      {/* Fixed-height comment box — always visible, scrollable inside */}
      <div className="rounded-xl border border-border overflow-hidden" style={{ maxHeight: 220, overflowY: "auto" }}>
        <div className="px-3 py-1">
          {comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No comments yet.</p>
          ) : (
            comments.slice(0, 3).map(c => <CommentItem key={c.id} comment={c} />)
          )}
        </div>
      </div>

      {/* Show More button */}
      <button
        onClick={() => setPopupOpen(true)}
        className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-[10px] font-semibold text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
      >
        <MessageSquare className="h-3 w-3" />
        Show all {comments.length} comment{comments.length !== 1 ? "s" : ""}
        <ChevronDown className="h-3 w-3" />
      </button>

      {/* Full-screen popup */}
      <CommentsPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        comments={comments}
        onPost={post}
      />
    </Section>
  );
};

// ─── RELATED EXPERIMENTS (always visible, horizontal scroll — Projects-page card style, compact) ──
const RELATED = [
  { id: "r1", title: "Refraction of Light", subject: "Optics", exp: "Exp 05", time: "50 min", difficulty: "Intermediate", views: 9800, likes: 720, rating: 4.7, img: "https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", desc: "Explore how light bends as it passes from one medium to another using a glass slab and pins." },
  { id: "r2", title: "Concave Mirror — Focal Length", subject: "Optics", exp: "Exp 06", time: "40 min", difficulty: "Beginner", views: 7200, likes: 540, rating: 4.6, img: "https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg", desc: "Determine the focal length of a concave mirror using the parallax method." },
  { id: "r3", title: "Dispersion through Prism", subject: "Wave Optics", exp: "Exp 08", time: "35 min", difficulty: "Intermediate", views: 11400, likes: 890, rating: 4.8, img: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf944f3df098f183b92727_Lab-Scientists-Beakers-edit.avif", desc: "Observe the dispersion of white light into a spectrum using a glass prism." },
  { id: "r4", title: "Total Internal Reflection", subject: "Optics", exp: "Exp 09", time: "45 min", difficulty: "Advanced", views: 6800, likes: 490, rating: 4.5, img: "https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", desc: "Demonstrate total internal reflection and determine the critical angle experimentally." },
  { id: "r5", title: "Interference of Light", subject: "Wave Optics", exp: "Exp 11", time: "55 min", difficulty: "Advanced", views: 5200, likes: 380, rating: 4.6, img: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif", desc: "Study Young's double slit experiment to observe constructive and destructive interference." },
  { id: "r6", title: "Refracting Telescope", subject: "Optics", exp: "Exp 12", time: "60 min", difficulty: "Intermediate", views: 8100, likes: 610, rating: 4.7, img: "https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", desc: "Build a simple refracting telescope and measure its magnifying power using two convex lenses." },
];

const EXP_DIFF_COLOR: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced: "bg-purple-100 text-purple-700",
};

const fmtNum = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

const RelatedExperiments = () => (
  <div className="mt-1">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Link2 className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-bold text-foreground uppercase tracking-wide">Related Experiments</span>
      </div>
      <Link to="/hands-on-experiments" className="text-[10px] text-primary font-semibold hover:underline">View All →</Link>
    </div>
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
      {RELATED.map((exp) => (
        <div key={exp.id}
          className="snap-start shrink-0 w-48 group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all cursor-pointer flex flex-col">
          {/* Image */}
          <div className="relative h-28 overflow-hidden bg-gray-50 flex-shrink-0">
            <img src={exp.img} alt={exp.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${EXP_DIFF_COLOR[exp.difficulty]}`}>
              {exp.difficulty}
            </span>
            <div className="absolute bottom-2 left-2 flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur text-white text-[9px] font-bold rounded-full">{exp.subject}</span>
              <span className="px-1.5 py-0.5 bg-black/40 backdrop-blur text-white/80 text-[9px] rounded-full">{exp.exp}</span>
            </div>
          </div>
          {/* Body */}
          <div className="p-2.5 flex flex-col flex-1">
            <h3 className="text-[11px] font-bold text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">{exp.title}</h3>
            <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{exp.desc}</p>
            <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2 text-[9px] text-gray-400 font-medium">
                <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{fmtNum(exp.views)}</span>
                <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" />{fmtNum(exp.likes)}</span>
                <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />{exp.rating}</span>
              </div>
              <span className="flex items-center gap-0.5 text-[9px] text-gray-400"><Clock className="h-2.5 w-2.5" />{exp.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── RELATED PROJECTS (always visible, horizontal scroll — Projects-page card style, compact) ────
const PROJECTS = [
  { id: "p1", title: "Smart Mirror with Face Detection", author: "TechMakers", difficulty: "Advanced", category: "Electronics", subcategory: "IoT", tags: ["OpenCV", "RPi", "AI"], duration: "8 hrs", views: 28700, likes: 1920, rating: 4.9, img: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf944f3df098f183b92727_Lab-Scientists-Beakers-edit.avif", desc: "Build a smart mirror with embedded display showing weather, news, and face recognition.", featured: true },
  { id: "p2", title: "Solar Concentrator Model", author: "GreenTech", difficulty: "Intermediate", category: "Physics", subcategory: "Solar", tags: ["Solar", "DIY", "Optics"], duration: "4 hrs", views: 12400, likes: 890, rating: 4.6, img: "https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", desc: "Use parabolic mirrors to concentrate solar energy and boil water using no electricity.", featured: false },
  { id: "p3", title: "Microscope from Smartphone", author: "OpticHacks", difficulty: "Beginner", category: "Optics", subcategory: "DIY", tags: ["Low-Cost", "Phone", "Lens"], duration: "2 hrs", views: 9800, likes: 760, rating: 4.9, img: "https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg", desc: "Convert any smartphone into a 40x microscope using a tiny ball lens — costs under ₹50.", featured: false },
  { id: "p4", title: "Laser Security Alarm System", author: "SafetyNet", difficulty: "Intermediate", category: "Electronics", subcategory: "Security", tags: ["Arduino", "Laser", "Alert"], duration: "3 hrs", views: 18400, likes: 1340, rating: 4.7, img: "https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", desc: "Build a laser tripwire security system that triggers a buzzer and SMS alert on intrusion.", featured: false },
  { id: "p5", title: "Periscope Design & Build", author: "RepurposeIt", difficulty: "Beginner", category: "Engineering", subcategory: "Optics", tags: ["Cardboard", "Mirrors", "DIY"], duration: "1.5 hrs", views: 6200, likes: 450, rating: 4.5, img: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif", desc: "Design and build a functional periscope from cardboard and plane mirrors.", featured: false },
  { id: "p6", title: "Rainbow Projector with Prism", author: "ArtScience", difficulty: "Beginner", category: "Art + Science", subcategory: "Creative", tags: ["Prism", "Light", "Creative"], duration: "1 hr", views: 7800, likes: 560, rating: 4.7, img: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66be608d71d32863b2bf5487_Students-Desk-Classroom-Laptop-reverse.avif", desc: "Project a full spectrum rainbow on your wall using a glass prism and sunlight.", featured: false },
];

const PROJ_DIFF_COLOR: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced: "bg-purple-100 text-purple-700",
};

const RelatedProjects = () => (
  <div className="mt-1">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Layers className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-bold text-foreground uppercase tracking-wide">Related Projects</span>
      </div>
      <Link to="/projects" className="text-[10px] text-primary font-semibold hover:underline">Browse All →</Link>
    </div>
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
      {PROJECTS.map((p) => (
        <div key={p.id}
          className="snap-start shrink-0 w-48 group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all cursor-pointer flex flex-col">
          {/* Image */}
          <div className="relative h-28 overflow-hidden bg-gray-50 flex-shrink-0">
            <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {p.featured && (
              <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase rounded-full flex items-center gap-0.5">
                <Zap className="h-2 w-2" />Featured
              </span>
            )}
            <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${PROJ_DIFF_COLOR[p.difficulty]}`}>
              {p.difficulty}
            </span>
            <div className="absolute bottom-2 left-2 flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur text-white text-[9px] font-bold rounded-full">{p.category}</span>
              <span className="px-1.5 py-0.5 bg-black/40 backdrop-blur text-white/80 text-[9px] rounded-full">{p.subcategory}</span>
            </div>
          </div>
          {/* Body */}
          <div className="p-2.5 flex flex-col flex-1">
            <h3 className="text-[11px] font-bold text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
            <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{p.desc}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {p.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-medium rounded-full">{tag}</span>
              ))}
            </div>
            <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2 text-[9px] text-gray-400 font-medium">
                <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{fmtNum(p.views)}</span>
                <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" />{fmtNum(p.likes)}</span>
                <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />{p.rating}</span>
              </div>
              <span className="flex items-center gap-0.5 text-[9px] text-gray-400"><Clock className="h-2.5 w-2.5" />{p.duration}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const ExperimentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [experiment, setExperiment]     = useState<Experiment | null>(null);
  const [labMaterials, setLabMaterials] = useState<LabMaterial[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedMat, setSelectedMat]   = useState<LabMaterialData | null>(null);
  const [settings, setSettings]         = useState<AdminSettings>({
    show_material_price: true, show_material_stock: true,
    show_material_warning: true, show_material_safety: true,
    show_material_add_to_cart: true,
  });
  // Social / UI state
  const [liked, setLiked]       = useState(false);
  const [likes, setLikes]       = useState(342);
  const [saved, setSaved]       = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const { addItem, isInCart } = useCart();

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("experiments").select("*").eq("id", id).single();
      const exp = data ? (data as Experiment) : (FALLBACK.find(e => e.id === id) ?? null);
      setExperiment(exp);
      try {
        const { data: sData } = await (supabase as any).from("admin_settings").select("key, value");
        if (sData && sData.length > 0) {
          const s: any = {};
          sData.forEach((r: any) => { s[r.key] = r.value; });
          setSettings(prev => ({ ...prev, ...s }));
        }
      } catch { }
      try {
        const { data: emData } = await (supabase as any)
          .from("experiment_materials").select("material_id, quantity, unit").eq("experiment_id", id);
        if (emData && emData.length > 0) {
          const ids = emData.map((r: any) => r.material_id).filter(Boolean);
          if (ids.length > 0) {
            const { data: mats } = await (supabase as any)
              .from("lab_materials")
              .select("id, scientific_name, common_names, specification, category, warning, safety, handling, storage, price, original_price, stock, current_stock, rating, image_url, vendor_id")
              .in("id", ids).eq("is_active", true);
            const qtyMap: Record<string, { quantity: string; unit: string }> = {};
            emData.forEach((r: any) => { qtyMap[r.material_id] = { quantity: r.quantity, unit: r.unit }; });
            setLabMaterials((mats || []).map((m: any) => ({
              ...m,
              common_names: Array.isArray(m.common_names) ? m.common_names : [],
              quantity: qtyMap[m.id]?.quantity || null,
              unit: qtyMap[m.id]?.unit || null,
            })));
          }
        }
      } catch { }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return (
    <PageTransition><Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Loading experiment...</p>
        </div>
      </div>
    </Layout></PageTransition>
  );

  if (!experiment) return (
    <PageTransition><Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <FlaskConical className="h-10 w-10 text-gray-300" />
        <h2 className="text-lg font-bold text-gray-700">Experiment Not Found</h2>
        <Link to="/hands-on-experiments" className="flex items-center gap-2 text-primary font-semibold hover:underline text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Library
        </Link>
      </div>
    </Layout></PageTransition>
  );

  const allImages = [
    ...(experiment.thumbnail_url ? [experiment.thumbnail_url] : []),
    ...(Array.isArray(experiment.images) ? experiment.images : []),
 
 
 
  ].filter(Boolean).slice(0, 5) as string[];

  const subjectCls = SUBJECT_COLOR[experiment.subject] || "bg-gray-100 text-gray-600 border-gray-200";
  const diffCls    = DIFF_COLOR[(experiment.difficulty || "").toLowerCase()] || "bg-gray-50 text-gray-500 border-gray-200";

  const materialLines   = experiment.materials   ? parseLines(experiment.materials)   : [];
  const procedureLines  = experiment.procedure   ? parseLines(experiment.procedure)   : [];
  const outcomeLines    = experiment.outcome     ? parseLines(experiment.outcome)     : [];
  const precautionLines = experiment.precautions ? parseLines(experiment.precautions) : [];

  const ytId    = experiment.video_link ? getYoutubeId(experiment.video_link) : null;
  const ytEmbed = ytId ? `https://www.youtube.com/embed/${ytId}` : null;
  const hasVideo = !!(experiment.video_link);
  const hasDemo  = !!(experiment.demo_link);

  return (
    <PageTransition>
      <Layout>

        {/* Sticky Breadcrumb */}
        <div className="border-b bg-white/95 backdrop-blur sticky top-0 z-20">
          <div className="w-full py-2.5 flex justify-center px-4">
            <div className="w-full max-w-4xl flex items-center gap-2 text-xs min-w-0">
            <Link to="/hands-on-experiments" className="flex items-center gap-1 text-muted-foreground hover:text-primary font-medium transition-colors shrink-0">
              <ArrowLeft className="h-3.5 w-3.5" /> Experiments
            </Link>
            <span className="text-gray-300 shrink-0">/</span>
            <span className="text-foreground font-medium truncate">{experiment.title}</span>
            </div>
          </div>
        </div>

        <div className="w-full py-5 flex justify-center px-4">
          <div className="w-full max-w-4xl">

          {/* Image + Video Slider (video as last thumbnail) */}
          <ImageSlider
            images={allImages}
            videoLink={experiment.video_link}
            saved={saved} onSave={() => setSaved(s => !s)}
            liked={liked} likes={likes}
            onLike={() => { setLiked(l => !l); setLikes(n => liked ? n - 1 : n + 1); }}
            onShare={() => navigator.clipboard.writeText(window.location.href).catch(() => {})}
            onWhatsApp={() => { const u = encodeURIComponent(window.location.href); window.open(`https://wa.me/?text=${u}`, "_blank"); }}
          />

          {/* Badges + Title row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-4 mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${subjectCls}`}>
              {experiment.subject}
            </span>
            {experiment.class && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                <GraduationCap className="h-2.5 w-2.5" /> {experiment.class}
              </span>
            )}
            {experiment.difficulty && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${diffCls}`}>
                {experiment.difficulty}
              </span>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight mb-3">
            {experiment.title}
          </h1>

          {/* CTA Buttons — only Simulation */}
          {hasDemo && (
            <div className="flex flex-wrap gap-2 mb-2 mt-2">
              <a href={experiment.demo_link!} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-semibold rounded-full text-xs hover:bg-primary/90 transition-colors shadow-sm">
                <Monitor className="h-3.5 w-3.5" /> Start Simulation
              </a>
            </div>
          )}

          {/* Content Sections */}
          <div className="space-y-2 mt-2">

            {/* Aim & Theory */}
            <AimTheory subject={experiment.subject} />

            {/* About */}
            {experiment.description && (
              <Section icon={<BookOpen className="h-3.5 w-3.5" />} title="About this Experiment">
                <p className="text-xs text-muted-foreground leading-relaxed">{experiment.description}</p>
              </Section>
            )}

            {/* Materials (plain text) */}
            {materialLines.length > 0 && (
              <Section icon={<Beaker className="h-3.5 w-3.5" />} title="Materials Required">
                <ul className="space-y-1.5">
                  {materialLines.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Lab Materials — Compact Table */}
            {labMaterials.length > 0 && (
              <Section icon={<Package className="h-3.5 w-3.5" />} title="Lab Materials Required">
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left px-3 py-2 font-semibold text-muted-foreground w-8">#</th>
                        <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Name</th>
                        <th className="text-left px-3 py-2 font-semibold text-muted-foreground hidden sm:table-cell">Specification</th>
                        <th className="text-left px-3 py-2 font-semibold text-muted-foreground w-20">Qty</th>
                        {settings.show_material_price && (
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground w-16">Price</th>
                        )}
                        {settings.show_material_add_to_cart && (
                          <th className="px-3 py-2 w-8"></th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {labMaterials.map((mat, idx) => {
                        const inCart = isInCart(mat.id);
                        return (
                          <tr key={mat.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="px-3 py-2 text-[10px] text-muted-foreground font-mono">{idx + 1}</td>
                            <td className="px-3 py-2">
                              <button onClick={() => setSelectedMat(mat)} className="text-left hover:text-primary transition-colors group">
                                <p className="font-semibold text-foreground group-hover:text-primary text-xs leading-tight">{mat.scientific_name}</p>
                                {mat.common_names && mat.common_names.length > 0 && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[160px]">{mat.common_names.slice(0, 2).join(", ")}</p>
                                )}
                              </button>
                            </td>
                            <td className="px-3 py-2 text-[10px] text-muted-foreground hidden sm:table-cell max-w-[140px]">
                              <span className="line-clamp-2">{mat.specification || "—"}</span>
                            </td>
                            <td className="px-3 py-2 text-[10px] font-mono text-foreground">
                              {mat.quantity
                                ? <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">{mat.quantity}{mat.unit ? ` ${mat.unit}` : ""}</span>
                                : <span className="text-muted-foreground">—</span>}
                            </td>
                            {settings.show_material_price && (
                              <td className="px-3 py-2">
                                <span className="text-xs font-bold text-primary">₹{mat.price?.toFixed(0)}</span>
                                {settings.show_material_stock && (
                                  <p className={`text-[9px] mt-0.5 ${mat.current_stock < 5 ? "text-red-500" : "text-green-600"}`}>
                                    {mat.current_stock < 1 ? "Out" : mat.current_stock < 5 ? `${mat.current_stock} left` : "In stock"}
                                  </p>
                                )}
                              </td>
                            )}
                            {settings.show_material_add_to_cart && (
                              <td className="px-3 py-2">
                                <button onClick={() => addItem(mat.id, 1)} title={inCart ? "Already in cart" : "Add to cart"}
                                  className={`p-1.5 rounded-lg transition-colors ${inCart ? "text-green-600 bg-green-50" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}>
                                  {inCart ? <CheckCircle className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* Procedure */}
            {procedureLines.length > 0 && (
              <Section icon={<ListOrdered className="h-3.5 w-3.5" />} title="Step-by-Step Procedure">
                <ol className="space-y-2">
                  {procedureLines.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                      <span className="text-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Precautions */}
            {precautionLines.length > 0 && (
              <Section icon={<AlertTriangle className="h-3.5 w-3.5" />} title="Precautions">
                <ul className="space-y-1.5">
                  {precautionLines.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className="h-3 w-3 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-foreground leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Outcome */}
            {outcomeLines.length > 0 && (
              <Section icon={<CheckCircle className="h-3.5 w-3.5" />} title="Expected Outcome">
                {outcomeLines.length === 1 ? (
                  <p className="text-xs text-muted-foreground leading-relaxed">{outcomeLines[0]}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {outcomeLines.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" /> {point}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            )}

            {/* Interactive Animation */}
            <ReflectionAnimation />

            {/* Calculation & Formulae */}
            <Calculation />

            {/* Graph & Plot */}
            <GraphPlot />

            {/* Code Verification */}
            <CodeVerification />

            {/* Mind Map */}
            <MindMap />

            {/* Theory Questions */}
            <TheoryQuestions />

            {/* MCQ Assessment */}
            <MCQAssessment />

            {/* Student Test */}
            <StudentTest />

            {/* Lab Discussion */}
            <LabDiscussion />

          </div>

          {/* ── ALWAYS VISIBLE: Related Experiments + Related Projects ── */}
          <div className="mt-6 space-y-6 pt-5 border-t border-border">
            <RelatedExperiments />
            <RelatedProjects />
          </div>

          {/* Back button */}
          <div className="mt-6 pt-5 border-t border-border">
            <Link to="/hands-on-experiments"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-white font-semibold rounded-full text-xs hover:bg-primary/90 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to All Experiments
            </Link>
          </div>

          </div>
        </div>
      </Layout>

      {/* Index Modal / Sidebar */}
      <IndexModal open={indexOpen} onClose={() => setIndexOpen(false)} />

      {/* Mobile capsule tab */}
      <SidebarCapsuleTab onClick={() => setIndexOpen(true)} sidebarOpen={indexOpen} />

      {/* Material Detail Modal */}
      {selectedMat && (
        <LabMaterialDetail material={selectedMat} onClose={() => setSelectedMat(null)} />
      )}

    </PageTransition>
  );
};

export default ExperimentDetail;