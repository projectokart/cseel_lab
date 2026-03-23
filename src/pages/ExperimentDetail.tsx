import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, FlaskConical, GraduationCap, BookOpen,
  Beaker, ListOrdered, CheckCircle, PlayCircle,
  Monitor, ChevronLeft, ChevronRight, ZoomIn, X,
  AlertTriangle, Package, ShoppingCart,
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
  Biology:     "bg-green-100 text-green-700 border-green-200",
  Chemistry:   "bg-blue-100 text-blue-700 border-blue-200",
  Physics:     "bg-purple-100 text-purple-700 border-purple-200",
  Engineering: "bg-orange-100 text-orange-700 border-orange-200",
  Mathematics: "bg-red-100 text-red-700 border-red-200",
  Technology:  "bg-cyan-100 text-cyan-700 border-cyan-200",
};

const DIFF_COLOR: Record<string, string> = {
  easy:         "bg-green-50 text-green-600 border-green-200",
  medium:       "bg-yellow-50 text-yellow-700 border-yellow-200",
  intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200",
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

// ─── IMAGE SLIDER ─────────────────────────────────────────────────────────────
const ImageSlider = ({ images }: { images: string[] }) => {
  const [active, setActive]     = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const ts = useRef<number | null>(null);
  const te = useRef<number | null>(null);

  if (!images.length) return null;

  const prev = () => setActive(a => (a - 1 + images.length) % images.length);
  const next = () => setActive(a => (a + 1) % images.length);

  return (
    <>
      <div
        className="relative w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-md group mb-3 cursor-zoom-in"
        onTouchStart={e => { ts.current = e.touches[0].clientX; }}
        onTouchMove={e  => { te.current = e.touches[0].clientX; }}
        onTouchEnd={() => {
          if (!ts.current || !te.current) return;
          const d = ts.current - te.current;
          if (Math.abs(d) > 50) d > 0 ? next() : prev();
          ts.current = null; te.current = null;
        }}
        onClick={() => setLightbox(true)}
      >
        <img key={active} src={images[active]} alt="" className="w-full h-full object-cover transition-opacity duration-300" />
        <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn className="h-4 w-4 text-gray-600" />
        </div>
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full pointer-events-none">
            {active + 1} / {images.length}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === active ? "border-primary shadow-sm scale-105" : "border-transparent hover:border-gray-300 opacity-70 hover:opacity-100"}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center">
            <X className="h-5 w-5 text-white" />
          </button>
          <img src={images[active]} alt="" className="max-w-full max-h-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
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
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-primary">{icon}</span>
          <span className="text-sm font-bold text-foreground">{title}</span>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 bg-white border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
};

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
  const { addItem, isInCart } = useCart();

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);

      // Fetch experiment
      const { data } = await supabase.from("experiments").select("*").eq("id", id).single();
      const exp = data ? (data as Experiment) : (FALLBACK.find(e => e.id === id) ?? null);
      setExperiment(exp);

      // Fetch admin settings for visibility
      try {
        const { data: sData } = await (supabase as any)
          .from("admin_settings")
          .select("key, value");
        if (sData && sData.length > 0) {
          const s: any = {};
          sData.forEach((r: any) => { s[r.key] = r.value; });
          setSettings(prev => ({ ...prev, ...s }));
        }
      } catch { /* ignore */ }

      // Fetch linked lab materials via experiment_materials join table
      try {
        const { data: emData } = await (supabase as any)
          .from("experiment_materials")
          .select("material_id, quantity, unit")
          .eq("experiment_id", id);

        if (emData && emData.length > 0) {
          const ids = emData.map((r: any) => r.material_id).filter(Boolean);
          if (ids.length > 0) {
            const { data: mats } = await (supabase as any)
              .from("lab_materials")
              .select("id, scientific_name, common_names, specification, category, warning, safety, handling, storage, price, original_price, stock, current_stock, rating, image_url, vendor_id")
              .in("id", ids)
              .eq("is_active", true);
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
      } catch { /* ignore */ }

      setLoading(false);
    })();
  }, [id]);

  if (loading) return (
    <PageTransition><Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading experiment...</p>
        </div>
      </div>
    </Layout></PageTransition>
  );

  if (!experiment) return (
    <PageTransition><Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <FlaskConical className="h-12 w-12 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700">Experiment Not Found</h2>
        <Link to="/hands-on-experiments" className="flex items-center gap-2 text-primary font-semibold hover:underline text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Library
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

        {/* Breadcrumb */}
        <div className="border-b bg-white sticky top-0 z-20">
          <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-sm min-w-0">
            <Link to="/hands-on-experiments" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary font-medium transition-colors shrink-0">
              <ArrowLeft className="h-4 w-4" /> Experiment Library
            </Link>
            <span className="text-gray-300 shrink-0">/</span>
            <span className="text-foreground font-medium truncate">{experiment.title}</span>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-3xl">

          {/* Image Slider */}
          <ImageSlider images={allImages} />

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-5 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${subjectCls}`}>
              {experiment.subject}
            </span>
            {experiment.class && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                <GraduationCap className="h-3 w-3" /> {experiment.class}
              </span>
            )}
            {experiment.difficulty && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${diffCls}`}>
                {experiment.difficulty}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight mb-6">
            {experiment.title}
          </h1>

          {/* CTA Buttons */}
          {(hasDemo || hasVideo) && (
            <div className="flex flex-wrap gap-3 mb-6">
              {hasDemo && (
                <a href={experiment.demo_link!} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-full text-sm hover:bg-primary/90 transition-colors shadow-sm">
                  <Monitor className="h-4 w-4" /> Start Simulation
                </a>
              )}
              {hasVideo && (
                <a href={experiment.video_link!} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-border text-foreground font-semibold rounded-full text-sm hover:bg-gray-50 transition-colors">
                  <PlayCircle className="h-4 w-4 text-primary" /> Watch Video
                </a>
              )}
            </div>
          )}

          {/* Content sections */}
          <div className="space-y-3">

            {/* About */}
            {experiment.description && (
              <Section icon={<BookOpen className="h-4 w-4" />} title="About this Experiment">
                <p className="text-sm text-muted-foreground leading-relaxed">{experiment.description}</p>
              </Section>
            )}

            {/* Materials (plain text from experiments table) */}
            {materialLines.length > 0 && (
              <Section icon={<Beaker className="h-4 w-4" />} title="Materials Required">
                <ul className="space-y-2">
                  {materialLines.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Lab Materials — Table format */}
            {labMaterials.length > 0 && (
              <Section icon={<Package className="h-4 w-4" />} title="Lab Materials Required">
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs w-10">#</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs">Scientific Name</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs hidden sm:table-cell">Specification</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs w-24">Quantity</th>
                        {settings.show_material_price && (
                          <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs w-20">Price</th>
                        )}
                        {settings.show_material_add_to_cart && (
                          <th className="px-4 py-2.5 w-10"></th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {labMaterials.map((mat, idx) => {
                        const inCart = isInCart(mat.id);
                        return (
                          <tr key={mat.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setSelectedMat(mat)}
                                className="text-left hover:text-primary transition-colors group"
                              >
                                <p className="font-semibold text-foreground group-hover:text-primary text-sm leading-tight">
                                  {mat.scientific_name}
                                </p>
                                {mat.common_names && mat.common_names.length > 0 && (
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">
                                    {mat.common_names.slice(0, 2).join(", ")}
                                  </p>
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell max-w-[160px]">
                              <span className="line-clamp-2">{mat.specification || "—"}</span>
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-foreground">
                              {mat.quantity
                                ? <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">{mat.quantity}{mat.unit ? ` ${mat.unit}` : ""}</span>
                                : <span className="text-muted-foreground">—</span>}
                            </td>
                            {settings.show_material_price && (
                              <td className="px-4 py-3">
                                <span className="text-sm font-bold text-primary">₹{mat.price?.toFixed(0)}</span>
                                {settings.show_material_stock && (
                                  <p className={`text-[10px] mt-0.5 ${mat.current_stock < 5 ? "text-red-500" : "text-green-600"}`}>
                                    {mat.current_stock < 1 ? "Out of stock" : mat.current_stock < 5 ? `${mat.current_stock} left` : "In stock"}
                                  </p>
                                )}
                              </td>
                            )}
                            {settings.show_material_add_to_cart && (
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => addItem(mat.id, 1)}
                                  title={inCart ? "Already in cart" : "Add to cart"}
                                  className={`p-1.5 rounded-lg transition-colors ${inCart ? "text-green-600 bg-green-50" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}
                                >
                                  {inCart
                                    ? <CheckCircle className="h-4 w-4" />
                                    : <ShoppingCart className="h-4 w-4" />}
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
              <Section icon={<ListOrdered className="h-4 w-4" />} title="Step-by-Step Procedure">
                <ol className="space-y-3">
                  {procedureLines.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Precautions */}
            {precautionLines.length > 0 && (
              <Section icon={<AlertTriangle className="h-4 w-4" />} title="Precautions">
                <ul className="space-y-2">
                  {precautionLines.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-foreground leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Outcome */}
            {outcomeLines.length > 0 && (
              <Section icon={<CheckCircle className="h-4 w-4" />} title="Expected Outcome">
                {outcomeLines.length === 1 ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">{outcomeLines[0]}</p>
                ) : (
                  <ul className="space-y-2">
                    {outcomeLines.map((point, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            )}

            {/* Video */}
            {hasVideo && (
              <Section icon={<PlayCircle className="h-4 w-4" />} title="Video Explanation" defaultOpen={false}>
                <div className="rounded-xl overflow-hidden aspect-video bg-gray-900">
                  {ytEmbed ? (
                    <iframe
                      src={ytEmbed}
                      title="Experiment video"
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <video src={experiment.video_link!} controls className="w-full h-full" />
                  )}
                </div>
              </Section>
            )}

          </div>

          {/* Back button */}
          <div className="mt-8 pt-6 border-t border-border">
            <Link to="/hands-on-experiments"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-full text-sm hover:bg-primary/90 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to All Experiments
            </Link>
          </div>

        </div>
      </Layout>

      {/* Material Detail Modal */}
      {selectedMat && (
        <LabMaterialDetail material={selectedMat} onClose={() => setSelectedMat(null)} />
      )}

    </PageTransition>
  );
};

export default ExperimentDetail;