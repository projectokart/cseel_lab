import Layout from "@/components/layout/Layout";
import { useState, useEffect, useMemo } from "react";
import { Play, MonitorPlay, ChevronRight, ExternalLink, Search } from "lucide-react";
import PageTransition from "@/components/shared/PageTransition";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";

// --- HERO SLIDER IMAGES ---
const heroImages = [
  "https://www.thoughtco.com/thmb/kbjOeU1CqYiCzmKIH0FtZ4LrBEQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-556450927-58b5b1d95f9b586046b7f7d9.jpg",
  "https://cdn.mos.cms.futurecdn.net/ide7QUU2eMp8ePMs6JAwR6-1200-80.jpg",
  "https://i.pinimg.com/originals/33/2b/3b/332b3b6ee4ff9e2bb34ac529e39ab5ec.jpg",
  "https://www.ase.org.uk/sites/default/files/Spacestation%20by%20S%2BB%20UK.JPG"
];

// --- VIDEO DATABASE ---
const demoVideos = [
  { 
    id: 1, 
    title: "Chemistry: Virtual Titration Lab", 
    subject: "Chemistry", 
    thumbnail: "https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg",
    videoUrl: "https://youtu.be/TOyDzOc2AaI?si=MWYCv8SdmqDAU1qP" 
  },
  { 
    id: 2, 
    title: "Physics: Kinetic Energy & Motion", 
    subject: "Physics", 
    thumbnail: "https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg",
    videoUrl: "https://youtu.be/pVnc3BhLbcI" 
  },
  { 
    id: 3, 
    title: "Biology: Cell Division (Mitosis)", 
    subject: "Biology", 
    thumbnail: "https://png.pngtree.com/thumb_back/fw800/background/20241007/pngtree-biology-laboratory-nature-and-science-plants-with-biochemistry-structure-on-green-image_16319180.jpg",
    videoUrl: "https://youtu.be/wZozOrFluiw"
  },
  { 
    id: 4, 
    title: "Mathematics: 3D Geometry Visuals", 
    subject: "Math", 
    thumbnail: "https://wallpaperaccess.com/full/933515.jpg",
    videoUrl: "https://youtu.be/kkGeOWYOFoA?si=9ZG1vI5GrhKB58hx"
  },
  { 
    id: 5, 
    title: "Art: Virtual Museum Simulation", 
    subject: "Art", 
    thumbnail: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=1000",
    videoUrl: "https://www.youtube.com/watch?v=4993sBLVVEw"
  },
  { 
    id: 6, 
    title: "English: 3D Literature Storytelling", 
    subject: "English", 
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000",
    videoUrl: "https://www.youtube.com/watch?v=R_fP9t4oXic"
  },
];

const Demo = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [heroIdx, setHeroIdx] = useState(0);

  // Auto-slide logic for Hero
  useEffect(() => {
    const timer = setInterval(() => setHeroIdx((p) => (p + 1) % heroImages.length), 4000);
    return () => clearInterval(timer);
  }, []);

  // Filter Logic
  const filteredVideos = useMemo(() => {
    return demoVideos.filter((v) => {
      const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "All" || v.subject === filter;
      return matchSearch && matchFilter;
    });
  }, [search, filter]);

  const handleWatchVideo = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <PageTransition>
      <Layout>
        {/* --- 1. HERO SECTION (YOUR CUSTOM LAYOUT) --- */}
        <section className="relative pt-20 pb-16 bg-[#F8FAFC] overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Content */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.8 }}
              >
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Visual Learning</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-extrabold text-[#0F172A] mb-6 tracking-tight leading-tight">
                    Explore our <br />
                    <span className="text-blue-600">Video Demos</span>
                  </h1>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Don't just take our word for it—watch how Cseel transforms science education through high-fidelity 3D simulations.
                  </p>
                  <button className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                    Request Full Access <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>

              {/* Right Slider Section */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative">
                  <div className="relative w-full aspect-[16/9] rounded-[2rem] overflow-hidden shadow-2xl border-[8px] border-white z-10 bg-slate-200">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={heroIdx}
                        src={heroImages[heroIdx]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  </div>
                  {/* Blue SVG Ornaments */}
                  <svg viewBox="0 0 449 449" className="absolute -top-10 -right-10 w-40 h-40 opacity-30 z-0">
                    <circle cx="224" cy="224" r="223.5" stroke="#3b82f6" strokeWidth="2"></circle>
                  </svg>
                  <svg viewBox="0 0 449 449" className="absolute -bottom-10 -left-10 w-40 h-40 opacity-30 z-0">
                    <circle cx="224" cy="224" r="223.5" stroke="#3b82f6" strokeWidth="2"></circle>
                  </svg>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- 2. STICKY FILTER BAR (LOVABLE UI STYLE) --- */}
        <div className="sticky top-0 z-[300] bg-white/80 backdrop-blur-xl border-b border-slate-100 py-4 shadow-sm">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <MonitorPlay size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Lab Walkthroughs</h2>
             </div>

             {/* Search Bar Inline */}
             <div className="relative w-full md:max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search demo..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>

             {/* Subject Filters */}
             <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                {["All", "Physics", "Chemistry", "Biology", "Math", "Art", "English"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                      filter === f 
                      ? "bg-[#0F172A] text-white border-[#0F172A] shadow-md" 
                      : "bg-white text-slate-500 border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* --- 3. VIDEO GRID --- */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <AnimatePresence mode="popLayout">
                {filteredVideos.map((v) => (
                  <motion.div 
                    key={v.id} 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group flex flex-col"
                  >
                    {/* VIDEO CONTAINER WITH OVERLAY BUTTON */}
                    <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-5 shadow-lg border border-slate-50 bg-slate-50">
                      <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" />
                      
                      {/* OVERLAY WITH "WATCH DEMO" BUTTON */}
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/60 transition-all duration-500 flex items-center justify-center px-6">
                          <motion.button 
                            onClick={() => handleWatchVideo(v.videoUrl)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-white/95 backdrop-blur-sm text-blue-600 rounded-xl font-bold text-xs shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 group/btn"
                          >
                            Watch Demo Video
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link group-hover/btn:translate-x-0.5 transition-transform">
                                <path d="M15 3h6v6"></path>
                                <path d="M10 14 21 3"></path>
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            </svg>
                          </motion.button>
                      </div>

                      <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-black text-blue-600 rounded-full uppercase">
                          {v.subject}
                      </span>
                    </div>

                    <div className="px-4">
                      <h3 className="text-xl font-extrabold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                          {v.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-2">
                        Immersive virtual walkthrough for {v.subject} curriculum.
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredVideos.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-400 font-medium">
                    No demo videos found for "{search}"
                </div>
              )}
            </div>
          </div>
        </section>

        {/* --- 4. CTA SECTION --- */}
        <section className="py-24 bg-[#0F172A] text-white text-center relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Ready for a Live Deep-Dive?</h2>
                <p className="text-slate-400 mb-10 max-w-xl mx-auto">Get a personalized demo with our experts to discuss your specific curriculum needs.</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button className="px-10 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20">Book 1-on-1 Session</button>
                    <button className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-all">Download Catalog</button>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"></div>
        </section>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </Layout>
    </PageTransition>
  );
};

export default Demo;
