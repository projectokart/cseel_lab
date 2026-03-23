import { useState, useMemo, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import {
  Search, ShoppingCart, Plus, Minus, X, Star, Download,
  Package, ArrowRight, Check, Heart, Filter, ArrowUpDown,
  Truck, Shield, RefreshCw
} from "lucide-react";

type Product = {
  id: string;
  scientific_name: string;
  name?: string;
  common_names: string[] | null;
  specification: string | null;
  description?: string | null;
  category: string;
  price: number;
  original_price: number | null;
  rating: number;
  reviews?: number;
  current_stock: number;
  stock?: number;
  image_url: string | null;
  warning: string | null;
  safety: string | null;
  tag?: string | null;
  includes?: string[] | null;
};
type CartItem = Product & { qty: number };

const FALLBACK: any[] = [
  { id:"m1", name:"Basic Chemistry Kit", description:"Complete chemistry lab kit for Class 9-12. Includes beakers, test tubes, chemicals, and safety equipment.", category:"Chemistry", price:1299, original_price:1599, rating:4.8, reviews:234, stock:50, image_url:"https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg", tag:"Bestseller", includes:["20x Test Tubes","5x Beakers","Safety Goggles","Chemicals Set","Lab Manual"] },
  { id:"m2", name:"Physics Mechanics Kit", description:"Comprehensive physics mechanics kit covering Newton's laws, pendulum, and inclined plane experiments.", category:"Physics", price:2199, original_price:2799, rating:4.7, reviews:187, stock:30, image_url:"https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", tag:"New", includes:["Pendulum Set","Inclined Plane","Weights & Pulleys","Spring Scale","Activity Guide"] },
  { id:"m3", name:"Biology Microscope Kit", description:"Professional student microscope with 40x-1000x magnification. Includes 25 prepared slides.", category:"Biology", price:3499, original_price:4299, rating:4.9, reviews:312, stock:20, image_url:"https://png.pngtree.com/thumb_back/fw800/background/20241007/pngtree-biology-laboratory-nature-and-science-plants-with-biochemistry-structure-on-green-image_16319180.jpg", tag:"Bestseller", includes:["Student Microscope 1000x","25 Prepared Slides","Blank Slides","Cover Slips","Immersion Oil"] },
  { id:"m4", name:"Electronics Circuit Kit", description:"Learn basic electronics with this complete breadboard circuit kit. Build 50+ circuits.", category:"Electronics", price:1799, original_price:2199, rating:4.6, reviews:156, stock:45, image_url:"https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", tag:"", includes:["Breadboard","Component Kit","Digital Multimeter","Power Supply","Project Manual"] },
  { id:"m5", name:"Robotics Starter Kit", description:"Build and program your first robot! Complete Arduino-based robotics kit for beginners.", category:"Robotics", price:4999, original_price:6499, rating:4.8, reviews:98, stock:15, image_url:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf944f3df098f183b92727_Lab-Scientists-Beakers-edit.avif", tag:"Popular", includes:["Arduino UNO","Robot Chassis","Motor Driver","Sensors Kit","USB Cable","Beginner Guide"] },
  { id:"m6", name:"Environmental Science Kit", description:"Test soil, water, and air quality with this comprehensive environmental science kit.", category:"Environment", price:999, original_price:1299, rating:4.5, reviews:143, stock:60, image_url:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif", tag:"", includes:["pH Testing Kit","Soil Test Strips","Water Test Kit","Air Quality Monitor","Data Recording Book"] },
  { id:"m7", name:"Math Manipulatives Set", description:"Visual math learning tools including fraction bars, geometry shapes, and number lines.", category:"Mathematics", price:799, original_price:999, rating:4.4, reviews:89, stock:80, image_url:"https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", tag:"", includes:["Fraction Bars Set","Geometry Shapes","Number Line","Algebra Tiles","Teacher Guide"] },
  { id:"m8", name:"Advanced Chemistry Lab Set", description:"Professional-grade chemistry lab set for higher education. Includes titration, chromatography equipment.", category:"Chemistry", price:5999, original_price:7499, rating:4.9, reviews:67, stock:10, image_url:"https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg", tag:"Pro", includes:["Burette & Stand","Chromatography Setup","Electrochemistry Kit","Chemical Reagents","Safety Equipment"] },
];

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
const discount = (p: number, op: number) => Math.round((1 - p / op) * 100);

const tagColor: Record<string,string> = {
  Bestseller:"bg-orange-500 text-white", New:"bg-green-500 text-white",
  Popular:"bg-blue-500 text-white", Pro:"bg-purple-600 text-white",
};

const SORT_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Top Rated", value: "rating" },
  { label: "Best Discount", value: "discount" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

const Materials = () => {
  const { addItem, isInCart, items: cartItems, totalItems, totalPrice, removeItem, updateQty: updateCartQty } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSort, setActiveSort] = useState("popular");
  const [ordering, setOrdering] = useState(false);
  const [orderForm, setOrderForm] = useState({ name:"", email:"", phone:"", institution:"", address:"" });

  // Sheet state — same as Simulations
  const [sheetMode, setSheetMode] = useState<"filter" | "sort" | null>(null);
  const [tempCategory, setTempCategory] = useState("All");
  const [tempSort, setTempSort] = useState("popular");
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);

  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from("lab_materials")
          .select("id, scientific_name, common_names, specification, category, price, original_price, rating, current_stock, stock, image_url, warning, safety")
          .eq("is_active", true)
          .order("scientific_name");
        if (!error && data && data.length > 0) {
          setProducts(data.map((m: any) => ({
            ...m,
            name: m.scientific_name,
            common_names: Array.isArray(m.common_names) ? m.common_names : [],
            original_price: m.original_price || m.price,
            stock: m.current_stock,
            rating: m.rating || 4.0,
          })));
        }
      } catch { }
      setLoading(false);
    };
    load();
  }, []);

  const CAT_LABELS: Record<string,string> = {
    CHE:"Chemical", GLS:"Glassware", EQP:"Equipment", BIO:"Biological",
    ELC:"Electrical", SAF:"Safety", CON:"Consumable", PHY:"Physics", MIC:"Microscopy", MSR:"Measurement"
  };
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category)))], [products]);

  const filtered = useMemo(() => {
    let arr = products.filter(p =>
      (activeCategory === "All" || p.category === activeCategory) &&
      (!search ||
        p.scientific_name.toLowerCase().includes(search.toLowerCase()) ||
        (p.common_names || []).some((n: string) => n.toLowerCase().includes(search.toLowerCase()))
      )
    );
    if (activeSort === "price-asc") return [...arr].sort((a,b) => a.price - b.price);
    if (activeSort === "price-desc") return [...arr].sort((a,b) => b.price - a.price);
    if (activeSort === "rating") return [...arr].sort((a,b) => b.rating - a.rating);
    if (activeSort === "discount") return [...arr].sort((a,b) => discount(b.price,b.original_price) - discount(a.price,a.original_price));
    return [...arr].sort((a,b) => b.reviews - a.reviews);
  }, [products, search, activeCategory, activeSort]);

  // Sheet handlers — same as Simulations
  const openSheet = (mode: "filter" | "sort") => {
    setTempCategory(activeCategory);
    setTempSort(activeSort);
    setSheetMode(mode);
  };
  const closeSheet = () => setSheetMode(null);
  const applySheet = () => {
    setActiveCategory(tempCategory);
    setActiveSort(tempSort);
    closeSheet();
  };
  const resetSheet = () => {
    if (sheetMode === "filter") setTempCategory("All");
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
    dragStartY.current = null;
    dragCurrentY.current = 0;
  };

  const activeFilterCount = (activeCategory !== "All" ? 1 : 0);
  const isSortActive = activeSort !== "popular";

  // Sheet body
  const SheetBody = () => (
    <>
      {sheetMode === "filter" && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setTempCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    tempCategory === cat
                      ? "bg-black text-white border-black shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}>
                  {tempCategory === cat && <Check size={10} strokeWidth={3}/>}
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {sheetMode === "sort" && (
        <div className="flex flex-col gap-2">
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setTempSort(opt.value)}
              className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-medium border transition-all ${
                tempSort === opt.value
                  ? "bg-gray-50 border-gray-900 text-gray-900"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              <span>{opt.label}</span>
              {tempSort === opt.value && <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center"><Check size={11} strokeWidth={3} className="text-white"/></span>}
            </button>
          ))}
        </div>
      )}
    </>
  );

  const addToCart = (p: Product) => { addItem(p.id, 1); };
  const updateQty = (id: string, delta: number) => {
    const item = cartItems.find(i => i.lab_material_id === id);
    if (item) updateCartQty(id, item.quantity + delta);
  };
  const removeFromCart = (id: string) => removeItem(id);
  const toggleWishlist = (id: string) =>
    setWishlist(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);

  const cartTotal = totalPrice;
  const cartCount = totalItems;
  const cartSavings = cartItems.reduce((s, c) => s + 0, 0);
  const cart = cartItems.map(i => ({ ...i, id: i.lab_material_id, name: i.scientific_name, qty: i.quantity } as any));

  const exportCart = () => {
    const rows = ["Item,Category,Qty,Unit Price,Total",
      ...cart.map(c=>`"${c.name}","${c.category}",${c.qty},${c.price},${c.price*c.qty}`),
      `Total,,,, ${cartTotal}`].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows],{type:"text/csv"}));
    a.download = "cseel-order.csv"; a.click();
    toast({ title:"Cart exported!" });
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.name||!orderForm.email||!orderForm.phone) {
      toast({ title:"Error", description:"Name, email and phone required", variant:"destructive" }); return;
    }
    setOrdering(true);
    const itemsList = cart.map(c=>`${c.name} x${c.qty} = ${fmt(c.price*c.qty)}`).join("\n");
    await supabase.from("contact_messages").insert({
      name:orderForm.name, email:orderForm.email, phone:orderForm.phone,
      institution:orderForm.institution,
      message:`LAB MATERIALS ORDER\n\nItems:\n${itemsList}\n\nTotal: ${fmt(cartTotal)}\nSavings: ${fmt(cartSavings)}\n\nDelivery Address: ${orderForm.address}`,
      type:"lab_order",
    });
    setOrdering(false);
    toast({ title:"Order Placed! 🎉", description:"We'll contact you within 24 hours." });
    setOrderOpen(false); setCartOpen(false);
    setOrderForm({name:"",email:"",phone:"",institution:"",address:""});
  };

  return (
    <PageTransition>
      <Layout>
        {/* Hero */}
        <section className="about-hero-gradient py-8">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground mb-1">Lab Materials & Kits</h1>
              <p className="text-primary-foreground/80 text-sm">Premium science kits · Free delivery on orders above ₹2000</p>
              <div className="flex items-center gap-4 mt-3 text-primary-foreground/70 text-xs">
                <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5"/>Free Delivery</span>
                <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5"/>Quality Assured</span>
                <span className="flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5"/>Easy Returns</span>
              </div>
            </div>
            <button onClick={()=>setCartOpen(true)} className="relative flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-full shadow-lg hover:bg-white/90 transition-colors">
              <ShoppingCart className="h-5 w-5"/>Cart
              {cartCount>0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>
        </section>

        {/* STICKY HEADER — same style as Simulations */}
        <div className="sticky top-0 z-[300] bg-white/95 backdrop-blur-md border-b shadow-sm">
          <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} strokeWidth={2.5}/>
              </span>
              <input
                type="text" placeholder="Search lab kits..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
              />
            </div>
            <button onClick={() => setCartOpen(true)} className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <ShoppingCart size={18} strokeWidth={2.5} className="text-gray-600"/>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          <div className="max-w-screen-xl mx-auto px-4 pb-2 flex flex-col gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
              {/* Filter button */}
              <button onClick={() => openSheet("filter")}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold flex-shrink-0 hover:bg-gray-50 transition-colors shadow-sm relative">
                <Filter size={14} strokeWidth={2.5}/>
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white rounded-full text-[9px] flex items-center justify-center font-black">{activeFilterCount}</span>
                )}
              </button>
              {/* Sort button */}
              <button onClick={() => openSheet("sort")}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold flex-shrink-0 hover:bg-gray-50 transition-colors shadow-sm relative">
                <ArrowUpDown size={14} strokeWidth={2.5}/>
                Sort
                {isSortActive && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white rounded-full text-[9px] flex items-center justify-center font-black">1</span>
                )}
              </button>
              <div className="h-4 w-[1px] bg-gray-300 flex-shrink-0 mx-1"/>
              {/* Category quick chips */}
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                    activeCategory === cat
                      ? "bg-black text-white border-black shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-gray-50 md:border-none">
              <p className="text-[10px] md:text-[11px] text-gray-400 uppercase font-black tracking-widest">
                Showing <span className="text-gray-900">{filtered.length}</span> of <span className="text-gray-900">{products.length}</span> Kits
              </p>
              {activeSort !== "popular" && (
                <span className="text-[10px] font-bold text-primary">
                  {SORT_OPTIONS.find(s => s.value === activeSort)?.label}
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-[2px] w-full bg-gray-50 overflow-hidden">
            <motion.div className="h-full bg-primary" initial={{width:0}}
              animate={{width: products.length > 0 ? `${filtered.length / products.length * 100}%` : "0%"}}
              transition={{duration: 0.4}}/>
          </div>
        </div>

        {/* ===== BOTTOM SHEET — same as Simulations ===== */}
        <AnimatePresence>
          {sheetMode && (
            <>
              <motion.div key="backdrop"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                transition={{duration:0.2}}
                className="fixed inset-0 bg-black/40 z-[350]"
                onClick={closeSheet}
              />

              {/* MOBILE — bottom sheet */}
              <motion.div key="sheet-mobile" ref={sheetRef}
                initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
                transition={{type:"spring", damping:30, stiffness:300}}
                className="md:hidden fixed bottom-0 left-0 right-0 z-[360] bg-white rounded-t-3xl"
                style={{maxHeight:"85vh", overflowY:"auto"}}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
                  <div className="w-10 h-1 bg-gray-200 rounded-full"/>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 sticky top-5 bg-white z-10">
                  <button onClick={resetSheet} className="text-sm text-gray-500 font-medium">Reset</button>
                  <h2 className="text-[15px] font-bold text-gray-900">{sheetMode === "filter" ? "Filters" : "Sort by"}</h2>
                  <button onClick={closeSheet} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full">
                    <X size={14} strokeWidth={2.5}/>
                  </button>
                </div>
                <div className="px-5 py-5"><SheetBody/></div>
                <div className="px-5 pb-8 pt-2 sticky bottom-0 bg-white border-t border-gray-50">
                  <button onClick={applySheet} className="w-full py-3.5 bg-black text-white rounded-2xl text-sm font-bold tracking-wide active:scale-[0.98] transition-all">
                    Show {filtered.length} Results
                  </button>
                </div>
              </motion.div>

              {/* DESKTOP — left side panel */}
              <motion.div key="sheet-desktop"
                initial={{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}}
                transition={{type:"spring", damping:30, stiffness:300}}
                className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-[360] bg-white shadow-2xl"
                style={{width:"360px"}}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <button onClick={resetSheet} className="text-sm text-gray-500 font-medium hover:text-gray-800">Reset</button>
                  <h2 className="text-[15px] font-bold text-gray-900">{sheetMode === "filter" ? "Filters" : "Sort by"}</h2>
                  <button onClick={closeSheet} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200">
                    <X size={15} strokeWidth={2.5}/>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6"><SheetBody/></div>
                <div className="px-6 py-5 border-t border-gray-100">
                  <button onClick={applySheet} className="w-full py-4 bg-black text-white rounded-2xl text-sm font-bold tracking-wide hover:bg-gray-900 active:scale-[0.98] transition-all">
                    Show {filtered.length} Results
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product grid */}
        <section className="py-6 bg-[#f7f8fa] min-h-screen">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_,i)=>(
                  <div key={i} className="bg-white rounded-2xl h-80 animate-pulse"/>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {filtered.map((p,i)=>{
                  const inCart = cartItems.find(c=>c.lab_material_id===p.id);
                  const wishlisted = wishlist.includes(p.id);
                  const disc = discount(p.price, p.original_price);
                  return (
                    <motion.div key={p.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all group flex flex-col cursor-pointer"
                      onClick={()=>setQuickView(p)}>
                      {/* Image */}
                      <div className="relative overflow-hidden bg-gray-50 aspect-square">
                        <img src={p.image_url} alt={p.scientific_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"/>
                        {p.tag && <span className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black uppercase rounded-full ${tagColor[p.tag]||"bg-gray-500 text-white"}`}>{p.tag}</span>}
                        {disc>0 && <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full">{disc}% OFF</span>}
                        <button
                          onClick={e=>{e.stopPropagation();toggleWishlist(p.id);}}
                          className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${wishlisted?"bg-red-500 text-white":"bg-white/90 text-gray-400 hover:text-red-500"}`}>
                          <Heart className="h-3.5 w-3.5" fill={wishlisted?"currentColor":"none"}/>
                        </button>
                        {p.stock<=10 && p.stock>0 && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-orange-500/90 text-white text-[9px] font-bold rounded-full">Only {p.stock} left</span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-3 flex flex-col flex-1">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-0.5">{CAT_LABELS[p.category] || p.category}</p>
                        <h3 className="text-xs md:text-sm font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-primary transition-colors">{p.scientific_name}</h3>

                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">
                            {[1,2,3,4,5].map(s=>(
                              <Star key={s} className={`h-2.5 w-2.5 ${s<=Math.round(p.rating)?"text-yellow-400 fill-yellow-400":"text-gray-200 fill-gray-200"}`}/>
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-500">({p.reviews})</span>
                        </div>

                        <div className="flex items-baseline gap-1.5 mb-3">
                          <span className="text-base md:text-lg font-black text-gray-900">{fmt(p.price)}</span>
                          {p.original_price>p.price && <span className="text-[10px] text-gray-400 line-through">{fmt(p.original_price)}</span>}
                        </div>

                        <div className="mt-auto" onClick={e=>e.stopPropagation()}>
                          {inCart ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 border-2 border-primary rounded-full px-2.5 py-1 flex-1 justify-center">
                                <button onClick={()=>updateQty(p.id,-1)} className="text-primary"><Minus className="h-3 w-3"/></button>
                                <span className="text-sm font-black text-primary w-4 text-center">{inCart?.quantity || 0}</span>
                                <button onClick={()=>updateQty(p.id,1)} className="text-primary"><Plus className="h-3 w-3"/></button>
                              </div>
                              <button onClick={()=>setCartOpen(true)} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full">Cart</button>
                            </div>
                          ) : (
                            <button onClick={()=>addToCart(p)} className="w-full py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                              <Plus className="h-3.5 w-3.5"/> Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Quick View Modal */}
        <AnimatePresence>
          {quickView && (
            <>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 z-[350]" onClick={()=>setQuickView(null)}/>
              <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
                className="fixed inset-0 z-[360] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-gray-900">Product Details</h3>
                    <button onClick={()=>setQuickView(null)}><X className="h-5 w-5 text-gray-400"/></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="aspect-square bg-gray-50">
                      <img src={quickView.image_url} alt={quickView.scientific_name} className="w-full h-full object-cover"/>
                    </div>
                    <div className="p-5 flex flex-col">
                      {quickView.tag && <span className={`self-start text-[9px] font-black uppercase px-2 py-0.5 rounded-full mb-2 ${tagColor[quickView.tag]||"bg-gray-200"}`}>{quickView.tag}</span>}
                      <h2 className="text-lg font-black text-gray-900 mb-2">{quickView.scientific_name}</h2>
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex">{[1,2,3,4,5].map(s=><Star key={s} className={`h-3.5 w-3.5 ${s<=Math.round(quickView.rating)?"text-yellow-400 fill-yellow-400":"text-gray-200 fill-gray-200"}`}/>)}</div>
                        <span className="text-xs text-gray-500">{quickView.rating} ({quickView.reviews} reviews)</span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-black text-gray-900">{fmt(quickView.price)}</span>
                        {quickView.original_price>quickView.price && <>
                          <span className="text-sm text-gray-400 line-through">{fmt(quickView.original_price)}</span>
                          <span className="text-sm font-bold text-green-600">{discount(quickView.price,quickView.original_price)}% off</span>
                        </>}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{quickView.description}</p>
                      {quickView.includes?.length>0 && (
                        <div className="mb-4">
                          <p className="text-xs font-black text-gray-700 uppercase tracking-wide mb-2">What's Included:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {quickView.includes.map((item:string,i:number)=>(
                              <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-medium rounded-full flex items-center gap-1">
                                <Check className="h-2.5 w-2.5"/>{item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className={`text-xs font-bold mb-4 ${quickView.stock>10?"text-green-600":quickView.stock>0?"text-orange-500":"text-red-500"}`}>
                        {quickView.stock>10?"In Stock":quickView.stock>0?`Only ${quickView.stock} left!`:"Out of Stock"}
                      </p>
                      {(() => {
                        const inCart = cart.find(c=>c.id===quickView.id);
                        return inCart ? (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 border-2 border-primary rounded-full px-4 py-2">
                              <button onClick={()=>updateQty(quickView.id,-1)}><Minus className="h-4 w-4 text-primary"/></button>
                              <span className="font-black text-primary">{inCart?.quantity || 0}</span>
                              <button onClick={()=>updateQty(quickView.id,1)}><Plus className="h-4 w-4 text-primary"/></button>
                            </div>
                            <button onClick={()=>{setQuickView(null);setCartOpen(true);}} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-full text-sm">View Cart</button>
                          </div>
                        ) : (
                          <button onClick={()=>{addToCart(quickView);}} disabled={quickView.stock===0}
                            className="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            <ShoppingCart className="h-4 w-4"/> Add to Cart
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Cart Sidebar */}
        <AnimatePresence>
          {cartOpen && (
            <>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 z-[350]" onClick={()=>setCartOpen(false)}/>
              <motion.div initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",damping:30,stiffness:300}}
                className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-[360] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary"/> Cart ({cartCount} items)</h3>
                  <button onClick={()=>setCartOpen(false)} className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-full"><X className="h-4 w-4"/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.length===0 ? (
                    <div className="text-center py-20 text-gray-300">
                      <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30"/>
                      <p className="text-sm text-gray-500">Your cart is empty</p>
                      <button onClick={()=>setCartOpen(false)} className="mt-4 text-primary text-sm font-bold hover:underline">Continue Shopping</button>
                    </div>
                  ) : cart.map(item=>(
                    <div key={item.id} className="flex gap-3 border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-colors">
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">{item.name}</p>
                        <p className="text-[10px] text-primary font-medium mt-0.5">{item.category}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5 border border-gray-200 rounded-full px-2.5 py-0.5">
                            <button onClick={()=>updateQty(item.id,-1)} className="text-gray-400 hover:text-gray-900 transition-colors"><Minus className="h-3 w-3"/></button>
                            <span className="text-xs font-black w-4 text-center">{item.qty}</span>
                            <button onClick={()=>updateQty(item.id,1)} className="text-gray-400 hover:text-gray-900 transition-colors"><Plus className="h-3 w-3"/></button>
                          </div>
                          <span className="text-sm font-black text-gray-900">{fmt(item.price*item.qty)}</span>
                          <button onClick={()=>removeFromCart(item.id)} className="text-gray-200 hover:text-red-500 transition-colors"><X className="h-3.5 w-3.5"/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {cart.length>0 && (
                  <div className="p-4 border-t bg-gray-50 space-y-3">
                    {cartSavings>0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-600 font-bold">You save</span>
                        <span className="text-green-600 font-black">{fmt(cartSavings)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-700">Total ({cartCount} items)</span>
                      <span className="text-xl font-black text-gray-900">{fmt(cartTotal)}</span>
                    </div>
                    <button onClick={exportCart} className="w-full py-2 border border-gray-200 bg-white text-gray-600 text-xs font-medium rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5">
                      <Download className="h-3.5 w-3.5"/> Export as CSV
                    </button>
                    <button onClick={()=>setOrderOpen(true)} className="w-full py-3 bg-primary text-white font-black rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm">
                      <Package className="h-4 w-4"/> Place Order <ArrowRight className="h-4 w-4"/>
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Order Modal */}
        <AnimatePresence>
          {orderOpen && (
            <div className="fixed inset-0 bg-black/60 z-[380] flex items-center justify-center p-4">
              <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b">
                  <h3 className="font-black text-gray-900 flex items-center gap-2"><Package className="h-5 w-5 text-primary"/> Place Order</h3>
                  <button onClick={()=>setOrderOpen(false)} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center"><X className="h-4 w-4"/></button>
                </div>
                <form onSubmit={handleOrder} className="p-5 space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <p className="text-xs font-black text-gray-700 uppercase tracking-wide mb-2">Order Summary</p>
                    {cart.map(c=>(
                      <div key={c.id} className="flex justify-between text-xs text-gray-600 py-0.5">
                        <span className="truncate flex-1 mr-2">{c.name} ×{c.qty}</span>
                        <span className="font-bold flex-shrink-0">{fmt(c.price*c.qty)}</span>
                      </div>
                    ))}
                    <div className="border-t border-primary/20 mt-2 pt-2 flex justify-between">
                      <span className="text-sm font-black text-gray-900">Total</span>
                      <span className="text-sm font-black text-primary">{fmt(cartTotal)}</span>
                    </div>
                  </div>
                  {[
                    {label:"Full Name *", key:"name", type:"text", required:true},
                    {label:"Email *", key:"email", type:"email", required:true},
                    {label:"Phone *", key:"phone", type:"tel", required:true},
                    {label:"School / Institution", key:"institution", type:"text", required:false},
                    {label:"Delivery Address *", key:"address", type:"text", required:true},
                  ].map(f=>(
                    <div key={f.key}>
                      <label className="text-xs font-bold text-gray-700 block mb-1">{f.label}</label>
                      <input type={f.type} required={f.required} value={(orderForm as any)[f.key]}
                        onChange={e=>setOrderForm(prev=>({...prev,[f.key]:e.target.value}))}
                        className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"/>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={()=>setOrderOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={ordering} className="flex-1 py-2.5 bg-primary text-white rounded-full text-sm font-black hover:bg-primary/90 disabled:opacity-60">
                      {ordering?"Placing...":"Confirm Order"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      </Layout>
    </PageTransition>
  );
};

export default Materials;