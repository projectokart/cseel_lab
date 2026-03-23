import { useState, useMemo, useRef, useEffect } from "react";
import LazyImage from "@/components/LazyImage";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Check, Star, Clock, Eye, Heart, Filter, ArrowUpDown, Zap, FolderOpen, Plus, ShoppingCart, FlaskConical, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const ALL_PROJECTS = [
  { id:"p1", title:"Arduino Weather Station with OLED Display", author:"TechMakers", difficulty:"Intermediate", category:"Electronics", subcategory:"IoT", tags:["Arduino","Sensors","OLED"], duration:"3 hrs", views:12400, likes:892, rating:4.8, img:"https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", desc:"Build a fully functional weather station that displays temperature, humidity, and pressure on an OLED screen.", featured:true, updated:"2026-02-10" },
  { id:"p2", title:"Raspberry Pi Smart Home Automation Hub", author:"HomeGeeks", difficulty:"Advanced", category:"Electronics", subcategory:"Smart Home", tags:["Raspberry Pi","Python","Automation"], duration:"8 hrs", views:28700, likes:1920, rating:4.9, img:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf944f3df098f183b92727_Lab-Scientists-Beakers-edit.avif", desc:"Turn your Raspberry Pi into a complete smart home controller with voice commands and mobile app.", featured:true, updated:"2026-03-01" },
  { id:"p3", title:"Solar-Powered Plant Watering System", author:"GreenTech", difficulty:"Beginner", category:"Agriculture", subcategory:"Automation", tags:["Solar","Soil Sensor","Arduino"], duration:"2 hrs", views:8200, likes:640, rating:4.6, img:"https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", desc:"Automate your plant watering using soil moisture sensors and solar power for an eco-friendly garden.", featured:false, updated:"2026-01-20" },
  { id:"p4", title:"DIY Oscilloscope using STM32", author:"EmbeddedPro", difficulty:"Advanced", category:"Electronics", subcategory:"Instruments", tags:["STM32","C++","Display"], duration:"12 hrs", views:19800, likes:1340, rating:4.7, img:"https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", desc:"Build a 2-channel digital oscilloscope with triggering, cursors, and FFT analysis on a TFT display.", featured:true, updated:"2026-02-28" },
  { id:"p5", title:"ML-Powered Gesture Recognition Glove", author:"AIBuilders", difficulty:"Advanced", category:"Machine Learning", subcategory:"Wearables", tags:["TensorFlow","BLE","Python"], duration:"10 hrs", views:31200, likes:2100, rating:4.9, img:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif", desc:"Create a smart glove that recognizes hand gestures using ML to control computers and games.", featured:true, updated:"2026-03-05" },
  { id:"p6", title:"3D Printed Robot Arm with 6-DOF", author:"RoboticsTech", difficulty:"Intermediate", category:"Robotics", subcategory:"Manipulators", tags:["3D Print","Servo","Arduino"], duration:"20 hrs", views:44500, likes:3200, rating:4.8, img:"https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg", desc:"A fully articulated 6-DOF robotic arm with inverse kinematics, Python controller, and gripper.", featured:true, updated:"2026-02-15" },
  { id:"p7", title:"LoRa Forest Fire Detector", author:"SafetyNet", difficulty:"Intermediate", category:"Environment", subcategory:"Safety", tags:["LoRa","Fire Detection","Alert"], duration:"5 hrs", views:7800, likes:520, rating:4.5, img:"https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", desc:"Deploy low-power LoRa nodes in forests to detect fire and send instant SMS alerts over 10km range.", featured:false, updated:"2026-01-08" },
  { id:"p8", title:"AI Attendance System with Face Recognition", author:"SchoolTech", difficulty:"Intermediate", category:"Machine Learning", subcategory:"Computer Vision", tags:["OpenCV","Face Recognition","Python"], duration:"6 hrs", views:22100, likes:1680, rating:4.7, img:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66be608d71d32863b2bf5487_Students-Desk-Classroom-Laptop-reverse.avif", desc:"Automate school attendance using facial recognition on a Raspberry Pi with a CSV log.", featured:false, updated:"2026-02-20" },
  { id:"p9", title:"Bluetooth Controlled RC Crawler", author:"OffRoadFab", difficulty:"Beginner", category:"Robotics", subcategory:"RC Vehicles", tags:["Bluetooth","Motor Driver","Android"], duration:"4 hrs", views:15600, likes:1200, rating:4.6, img:"https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", desc:"Build an off-road RC crawler controlled by your Android phone via Bluetooth with live camera feed.", featured:false, updated:"2026-01-30" },
  { id:"p10", title:"DIY ECG Heart Monitor on Arduino", author:"MedTechDIY", difficulty:"Intermediate", category:"Health", subcategory:"Bio-signals", tags:["ECG","AD8232","Heart Monitor"], duration:"3 hrs", views:18400, likes:1450, rating:4.8, img:"https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg", desc:"Record and display real ECG signals on Arduino serial plotter using the AD8232 ECG module.", featured:false, updated:"2026-03-10" },
  { id:"p11", title:"Voice Controlled Smart Mirror", author:"MirrorMakers", difficulty:"Advanced", category:"Electronics", subcategory:"Smart Home", tags:["Magic Mirror","Raspberry Pi","Voice"], duration:"15 hrs", views:36900, likes:2780, rating:4.9, img:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif", desc:"Build a two-way mirror with an embedded display showing weather, news, calendar, and voice commands.", featured:true, updated:"2026-02-25" },
  { id:"p12", title:"CNC Pen Plotter from Old CD Drives", author:"RepurposeIt", difficulty:"Beginner", category:"Fabrication", subcategory:"CNC", tags:["CNC","Stepper Motor","GRBL"], duration:"6 hrs", views:9400, likes:730, rating:4.5, img:"https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", desc:"Repurpose old CD drive steppers into a working CNC pen plotter that draws vector images.", featured:false, updated:"2026-01-15" },
  { id:"p13", title:"Aquaponics Monitoring System", author:"FarmHack", difficulty:"Beginner", category:"Agriculture", subcategory:"Monitoring", tags:["pH Sensor","Water","NodeMCU"], duration:"4 hrs", views:5400, likes:320, rating:4.3, img:"https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", desc:"Monitor pH, temperature, and water levels in your aquaponics tank and get alerts on your phone.", featured:false, updated:"2026-01-05" },
  { id:"p14", title:"Autonomous Line Following Robot", author:"BotBuilders", difficulty:"Beginner", category:"Robotics", subcategory:"Autonomous", tags:["IR Sensor","PID","Arduino"], duration:"3 hrs", views:21000, likes:1560, rating:4.7, img:"https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", desc:"Build a fast PID-controlled line follower robot that navigates complex tracks with precision.", featured:false, updated:"2026-02-05" },
  { id:"p15", title:"Indoor Air Quality Monitor", author:"CleanAir", difficulty:"Intermediate", category:"Environment", subcategory:"Monitoring", tags:["MQ135","PM2.5","WiFi"], duration:"4 hrs", views:13200, likes:980, rating:4.6, img:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif", desc:"Monitor indoor air quality with CO2, PM2.5, VOC sensors and get Telegram alerts on your phone.", featured:false, updated:"2026-03-08" },
  { id:"p16", title:"EEG Brainwave Visualizer", author:"NeuroHacks", difficulty:"Advanced", category:"Health", subcategory:"Neuroscience", tags:["EEG","Brainwave","Python"], duration:"14 hrs", views:27600, likes:2010, rating:4.8, img:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf944f3df098f183b92727_Lab-Scientists-Beakers-edit.avif", desc:"Build a brainwave visualizer using EEG headset data, FFT analysis and real-time Python dashboard.", featured:true, updated:"2026-03-12" },
];

const PAGE_SIZE = 30;

const DIFFICULTY_ORDER = ["Beginner","Intermediate","Advanced"];
const SORT_OPTIONS = [
  {label:"Most Popular", value:"popular"},
  {label:"Most Liked", value:"likes"},
  {label:"Top Rated", value:"rating"},
  {label:"Newest First", value:"newest"},
  {label:"Shortest First", value:"duration"},
];
const diffColor:Record<string,string> = {Beginner:"bg-green-100 text-green-700",Intermediate:"bg-blue-100 text-blue-700",Advanced:"bg-purple-100 text-purple-700"};
const fmt = (n:number) => n>=1000?(n/1000).toFixed(1)+"k":String(n);


const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totalItems, selectedIds } = useCart();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // User's DB projects
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    if (user) fetchUserProjects();
  }, [user]);

  const fetchUserProjects = async () => {
    setLoadingProjects(true);
    try {
      const { data } = await (supabase as any)
        .from("user_projects")
        .select("id, title, description, status, selected_experiment_id, created_at, experiments(title, thumbnail_url)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      setUserProjects(data || []);
    } catch { } finally { setLoadingProjects(false); }
  };

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
    } catch { } finally { setCreatingProject(false); }
  };

  // Active filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string|null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string|null>(null);
  const [activeDifficulties, setActiveDifficulties] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeSort, setActiveSort] = useState("popular");

  // Sheet state — same as Simulations
  const [sheetMode, setSheetMode] = useState<"filter"|"sort"|null>(null);
  const [tempCategory, setTempCategory] = useState<string|null>(null);
  const [tempSubcategory, setTempSubcategory] = useState<string|null>(null);
  const [tempDifficulties, setTempDifficulties] = useState<string[]>([]);
  const [tempTags, setTempTags] = useState<string[]>([]);
  const [tempSort, setTempSort] = useState("popular");
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number|null>(null);
  const dragCurrentY = useRef<number>(0);

  // ---- Layered filtering ----
  const afterSearch = useMemo(() => ALL_PROJECTS.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some(t=>t.toLowerCase().includes(search.toLowerCase()))
  ), [search]);

  const availableCategories = useMemo(()=>[...new Set(afterSearch.map(p=>p.category))].sort(),[afterSearch]);
  const afterCategory = useMemo(()=> activeCategory ? afterSearch.filter(p=>p.category===activeCategory) : afterSearch, [afterSearch,activeCategory]);
  const availableSubcategories = useMemo(()=>[...new Set(afterCategory.map(p=>p.subcategory))].sort(),[afterCategory]);
  const afterSubcategory = useMemo(()=> activeSubcategory ? afterCategory.filter(p=>p.subcategory===activeSubcategory) : afterCategory, [afterCategory,activeSubcategory]);
  const availableDifficulties = useMemo(()=>DIFFICULTY_ORDER.filter(d=>afterSubcategory.some(p=>p.difficulty===d)),[afterSubcategory]);
  const afterDifficulty = useMemo(()=> activeDifficulties.length>0 ? afterSubcategory.filter(p=>activeDifficulties.includes(p.difficulty)) : afterSubcategory, [afterSubcategory,activeDifficulties]);
  const availableTags = useMemo(()=>{
    const counts:Record<string,number>={};
    afterDifficulty.flatMap(p=>p.tags).forEach(t=>{counts[t]=(counts[t]||0)+1;});
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([t])=>t);
  },[afterDifficulty]);
  const afterTags = useMemo(()=> activeTags.length>0 ? afterDifficulty.filter(p=>activeTags.every(t=>p.tags.includes(t))) : afterDifficulty, [afterDifficulty,activeTags]);

  const finalResults = useMemo(()=>{
    const arr=[...afterTags];
    switch(activeSort){
      case"likes": return arr.sort((a,b)=>b.likes-a.likes);
      case"rating": return arr.sort((a,b)=>b.rating-a.rating);
      case"newest": return arr.sort((a,b)=>b.updated.localeCompare(a.updated));
      case"duration": return arr.sort((a,b)=>parseInt(a.duration)-parseInt(b.duration));
      default: return arr.sort((a,b)=>b.views-a.views);
    }
  },[afterTags,activeSort]);

  const paginatedResults = finalResults.slice(0, visibleCount);


  // Reset on filter/search change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, activeCategory, activeSubcategory, activeDifficulties, activeTags, activeSort]);

  // Infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < finalResults.length) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, finalResults.length));
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, finalResults.length]);

  const totalActive = (activeCategory?1:0)+(activeSubcategory?1:0)+activeDifficulties.length+activeTags.length;
  const isSortActive = activeSort !== "popular";

  const clearAll = ()=>{ setActiveCategory(null); setActiveSubcategory(null); setActiveDifficulties([]); setActiveTags([]); };

  // Sheet handlers
  const openSheet = (mode:"filter"|"sort") => {
    setTempCategory(activeCategory);
    setTempSubcategory(activeSubcategory);
    setTempDifficulties([...activeDifficulties]);
    setTempTags([...activeTags]);
    setTempSort(activeSort);
    setSheetMode(mode);
  };
  const closeSheet = () => setSheetMode(null);
  const applySheet = () => {
    setActiveCategory(tempCategory);
    setActiveSubcategory(tempSubcategory);
    setActiveDifficulties([...tempDifficulties]);
    setActiveTags([...tempTags]);
    setActiveSort(tempSort);
    closeSheet();
  };
  const resetSheet = () => {
    if (sheetMode==="filter") { setTempCategory(null); setTempSubcategory(null); setTempDifficulties([]); setTempTags([]); }
    else setTempSort("popular");
  };

  const handleTouchStart = (e:React.TouchEvent) => { dragStartY.current = e.touches[0].clientY; };
  const handleTouchMove = (e:React.TouchEvent) => {
    if (dragStartY.current===null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    dragCurrentY.current = delta;
    if (sheetRef.current && delta>0) sheetRef.current.style.transform = `translateY(${delta}px)`;
  };
  const handleTouchEnd = () => {
    if (dragCurrentY.current>80) closeSheet();
    else if (sheetRef.current) sheetRef.current.style.transform="";
    dragStartY.current=null; dragCurrentY.current=0;
  };

  // Temp layered for sheet preview count
  const tempAfterSearch = afterSearch;
  const tempAfterCat = tempCategory ? tempAfterSearch.filter(p=>p.category===tempCategory) : tempAfterSearch;
  const tempAvailSubs = [...new Set(tempAfterCat.map(p=>p.subcategory))].sort();
  const tempAfterSub = tempSubcategory ? tempAfterCat.filter(p=>p.subcategory===tempSubcategory) : tempAfterCat;
  const tempAvailDiff = DIFFICULTY_ORDER.filter(d=>tempAfterSub.some(p=>p.difficulty===d));
  const tempAfterDiff = tempDifficulties.length>0 ? tempAfterSub.filter(p=>tempDifficulties.includes(p.difficulty)) : tempAfterSub;
  const tempAvailTags = [...new Set(tempAfterDiff.flatMap(p=>p.tags))];
  const tempAfterTags = tempTags.length>0 ? tempAfterDiff.filter(p=>tempTags.every(t=>p.tags.includes(t))) : tempAfterDiff;
  const previewCount = sheetMode==="filter" ? tempAfterTags.length : finalResults.length;

  const SheetBody = () => (
    <>
      {sheetMode==="filter" && (
        <div className="flex flex-col gap-7">
          {/* Category */}
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Category</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>{setTempCategory(null);setTempSubcategory(null);setTempDifficulties([]);setTempTags([]);}}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${!tempCategory?"bg-black text-white border-black shadow-md":"bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                {!tempCategory&&<Check size={10} strokeWidth={3}/>}All
              </button>
              {availableCategories.map(cat=>(
                <button key={cat} onClick={()=>{setTempCategory(cat===tempCategory?null:cat);setTempSubcategory(null);setTempDifficulties([]);setTempTags([]);}}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${tempCategory===cat?"bg-black text-white border-black shadow-md":"bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                  {tempCategory===cat&&<Check size={10} strokeWidth={3}/>}{cat}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory */}
          {tempCategory && tempAvailSubs.length>0 && (
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Type</p>
              <div className="flex flex-wrap gap-2">
                {tempAvailSubs.map(sub=>(
                  <button key={sub} onClick={()=>setTempSubcategory(sub===tempSubcategory?null:sub)}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${tempSubcategory===sub?"bg-black text-white border-black shadow-md":"bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                    {tempSubcategory===sub&&<Check size={10} strokeWidth={3}/>}{sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty */}
          {tempAvailDiff.length>0 && (
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Difficulty
                {tempDifficulties.length>0 && <button onClick={()=>setTempDifficulties([])} className="ml-2 normal-case text-gray-400 font-medium underline">Clear</button>}
              </p>
              <div className="flex flex-wrap gap-2">
                {tempAvailDiff.map(d=>(
                  <button key={d} onClick={()=>setTempDifficulties(prev=>prev.includes(d)?prev.filter(x=>x!==d):[...prev,d])}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${tempDifficulties.includes(d)?"bg-black text-white border-black shadow-md":"bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                    {tempDifficulties.includes(d)&&<Check size={10} strokeWidth={3}/>}{d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tempAvailTags.length>0 && (
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Tags
                {tempTags.length>0 && <button onClick={()=>setTempTags([])} className="ml-2 normal-case text-gray-400 font-medium underline">Clear</button>}
              </p>
              <div className="flex flex-wrap gap-2">
                {tempAvailTags.slice(0,20).map(tag=>(
                  <button key={tag} onClick={()=>setTempTags(prev=>prev.includes(tag)?prev.filter(x=>x!==tag):[...prev,tag])}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${tempTags.includes(tag)?"bg-black text-white border-black":"bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {sheetMode==="sort" && (
        <div className="flex flex-col gap-2">
          {SORT_OPTIONS.map(opt=>(
            <button key={opt.value} onClick={()=>setTempSort(opt.value)}
              className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-medium border transition-all ${tempSort===opt.value?"bg-gray-50 border-gray-900 text-gray-900":"bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              <span>{opt.label}</span>
              {tempSort===opt.value&&<span className="w-5 h-5 bg-black rounded-full flex items-center justify-center"><Check size={11} strokeWidth={3} className="text-white"/></span>}
            </button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <PageTransition>
      <Layout>
        {/* Hero */}
        <section className="about-hero-gradient py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-xl">
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">Projectokart</h1>
              <p className="text-primary-foreground/80 text-sm mb-5">Browse {ALL_PROJECTS.length}+ open-source projects. Filter, explore, and build.</p>
            </div>
          </div>
        </section>



        {/* STICKY HEADER — exactly like Simulations */}
        <div className="sticky top-0 z-[300] bg-white/95 backdrop-blur-md border-b shadow-sm">
          <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} strokeWidth={2.5}/>
              </span>
              <input type="text" placeholder="Search projects, tags, authors..."
                value={search} onChange={e=>{setSearch(e.target.value);clearAll();}}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"/>
            </div>
            {/* Cart button */}
            <button onClick={() => navigate("/cart")} className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <ShoppingCart size={18} strokeWidth={2.5} className="text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full text-[10px] font-black flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            {/* My Projects button */}
            {user && (
              <button onClick={() => navigate("/my-projects")}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/90 transition-colors">
                <FolderOpen size={14} />
                My Projects
                {userProjects.length > 0 && (
                  <span className="bg-white/30 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{userProjects.length}</span>
                )}
              </button>
            )}
          </div>

          <div className="max-w-screen-xl mx-auto px-4 pb-2 flex flex-col gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
              {/* Filter button */}
              <button onClick={()=>openSheet("filter")}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold flex-shrink-0 hover:bg-gray-50 transition-colors shadow-sm relative">
                <Filter size={14} strokeWidth={2.5}/>
                Filters
                {totalActive>0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white rounded-full text-[9px] flex items-center justify-center font-black">{totalActive}</span>}
              </button>
              {/* Sort button */}
              <button onClick={()=>openSheet("sort")}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold flex-shrink-0 hover:bg-gray-50 transition-colors shadow-sm relative">
                <ArrowUpDown size={14} strokeWidth={2.5}/>
                Sort
                {isSortActive && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white rounded-full text-[9px] flex items-center justify-center font-black">1</span>}
              </button>
              <div className="h-4 w-[1px] bg-gray-300 flex-shrink-0 mx-1"/>
              {/* Quick category chips */}
              <button onClick={clearAll}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${totalActive===0&&!search?"bg-black text-white border-black shadow-md":"bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                All
              </button>
              {availableCategories.map(cat=>(
                <button key={cat} onClick={()=>{setActiveCategory(cat===activeCategory?null:cat);setActiveSubcategory(null);setActiveDifficulties([]);setActiveTags([]);}}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border flex-shrink-0 transition-all ${activeCategory===cat?"bg-black text-white border-black shadow-md":"bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-gray-50 md:border-none">
              <p className="text-[10px] md:text-[11px] text-gray-400 uppercase font-black tracking-widest">
Showing <span className="text-gray-900">{paginatedResults.length}</span> of <span className="text-gray-900">{finalResults.length}</span> Projects
              </p>
              {totalActive>0 && (
                <button onClick={clearAll} className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline">
                  <X size={11}/> Clear all
                </button>
              )}
            </div>
          </div>

          <div className="h-[2px] w-full bg-gray-50 overflow-hidden">
            <motion.div className="h-full bg-primary" initial={{width:0}}
              animate={{width:`${(finalResults.length/ALL_PROJECTS.length)*100}%`}} transition={{duration:0.4}}/>
          </div>
        </div>

        {/* RESULTS */}
        <section className="py-6 bg-gray-50/30 min-h-screen">
          <div className="container mx-auto px-4 max-w-7xl">
            <AnimatePresence mode="popLayout">
              {finalResults.length>0 ? (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {paginatedResults.map((p,i)=>(
                    <motion.div key={p.id} layout
                      initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.95}}
                      transition={{delay:i*0.03}}
                      onClick={()=>navigate(`/project/${p.id}`)}
                      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all cursor-pointer flex flex-col">
                      <div className="relative h-48 overflow-hidden bg-gray-50 flex-shrink-0">
                        <LazyImage src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
                        {p.featured&&<span className="absolute top-3 left-3 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase rounded-full flex items-center gap-1"><Zap className="h-2.5 w-2.5"/>Featured</span>}
                        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${diffColor[p.difficulty]}`}>{p.difficulty}</span>
                        <div className="absolute bottom-3 left-3 flex items-center gap-1">
                          <span className="px-2 py-0.5 bg-black/60 backdrop-blur text-white text-[9px] font-bold rounded-full">{p.category}</span>
                          <span className="px-2 py-0.5 bg-black/40 backdrop-blur text-white/80 text-[9px] rounded-full">{p.subcategory}</span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.desc}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {p.tags.slice(0,3).map(tag=><span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-medium rounded-full">{tag}</span>)}
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                          <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3"/>{fmt(p.views)}</span>
                            <span className="flex items-center gap-1"><Heart className="h-3 w-3"/>{fmt(p.likes)}</span>
                            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400 fill-yellow-400"/>{p.rating}</span>
                          </div>
                          <span className="flex items-center gap-1 text-[10px] text-gray-400"><Clock className="h-3 w-3"/>{p.duration}</span>
                        </div>

                        {/* Start Project button */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!user) { navigate("/login"); return; }
                            setCreatingProject(true);
                            try {
                              const { error } = await (supabase as any)
                                .from("user_projects")
                                .insert({ user_id: user.id, title: p.title, description: p.desc, status: "active" });
                              if (error) throw error;
                              navigate("/my-projects");
                            } catch { } finally { setCreatingProject(false); }
                          }}
                          className="mt-3 w-full py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" /> Start this Project
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="py-24 text-center">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">No projects found</h3>
                  <p className="text-sm text-gray-400 mb-6">{totalActive>0?"Try removing some filters":"No projects match your search"}</p>
                  <button onClick={()=>{clearAll();setSearch("");}} className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-colors">
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {/* INFINITE SCROLL SENTINEL */}
            <div ref={sentinelRef} className="py-10 flex justify-center">
              {visibleCount < finalResults.length ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading more...</span>
                </div>
              ) : (
                finalResults.length > 0 && <span className="text-[10px] font-black text-gray-200 uppercase tracking-widest">End of Projects</span>
              )}
            </div>
          </div>
        </section>

        {/* ===== BOTTOM SHEET — exactly same as Simulations ===== */}
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
                transition={{type:"spring",damping:30,stiffness:300}}
                className="md:hidden fixed bottom-0 left-0 right-0 z-[360] bg-white rounded-t-3xl"
                style={{maxHeight:"85vh",overflowY:"auto"}}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
                  <div className="w-10 h-1 bg-gray-200 rounded-full"/>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 sticky top-5 bg-white z-10">
                  <button onClick={resetSheet} className="text-sm text-gray-500 font-medium">Reset</button>
                  <h2 className="text-[15px] font-bold text-gray-900">{sheetMode==="filter"?"Filters":"Sort by"}</h2>
                  <button onClick={closeSheet} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full"><X size={14} strokeWidth={2.5}/></button>
                </div>
                <div className="px-5 py-5"><SheetBody/></div>
                <div className="px-5 pb-8 pt-2 sticky bottom-0 bg-white border-t border-gray-50">
                  <button onClick={applySheet} className="w-full py-3.5 bg-black text-white rounded-2xl text-sm font-bold tracking-wide active:scale-[0.98] transition-all">
                    Show {previewCount} Results
                  </button>
                </div>
              </motion.div>

              {/* DESKTOP — left side panel */}
              <motion.div key="sheet-desktop"
                initial={{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}}
                transition={{type:"spring",damping:30,stiffness:300}}
                className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-[360] bg-white shadow-2xl"
                style={{width:"360px"}}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <button onClick={resetSheet} className="text-sm text-gray-500 font-medium hover:text-gray-800 transition-colors">Reset</button>
                  <h2 className="text-[15px] font-bold text-gray-900">{sheetMode==="filter"?"Filters":"Sort by"}</h2>
                  <button onClick={closeSheet} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <X size={15} strokeWidth={2.5}/>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6"><SheetBody/></div>
                <div className="px-6 py-5 border-t border-gray-100">
                  <button onClick={applySheet} className="w-full py-4 bg-black text-white rounded-2xl text-sm font-bold tracking-wide hover:bg-gray-900 active:scale-[0.98] transition-all">
                    Show {previewCount} Results
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      </Layout>
    </PageTransition>
  );
};

export default Projects;