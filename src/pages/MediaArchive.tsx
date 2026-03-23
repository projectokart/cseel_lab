import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { Play, Image, FileText, Download } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useState } from "react";

const categories = ["All", "Videos", "Photos", "Press", "Events"];

const mediaItems = [
  { type: "video", category: "Videos", title: "CSEEL Lab Tour — Bhubaneswar Center", thumbnail: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif", date: "Jan 2026" },
  { type: "video", category: "Videos", title: "NEP 2020 Experiential Learning Showcase", thumbnail: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf944f3df098f183b92727_Lab-Scientists-Beakers-edit.avif", date: "Dec 2025" },
  { type: "photo", category: "Photos", title: "Students at Chemistry Lab — DAV School", thumbnail: "https://davcsp.org/File/50/Slider_40e21c0d-d24b-42cf-9023-30a8c9ca0712_davcamp-1.jpeg", date: "Nov 2025" },
  { type: "photo", category: "Photos", title: "Teacher Training Workshop — Delhi", thumbnail: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66be608d71d32863b2bf5487_Students-Desk-Classroom-Laptop-reverse.avif", date: "Oct 2025" },
  { type: "press", category: "Press", title: "CSEEL Featured in Education Today Magazine", thumbnail: "https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg", date: "Sep 2025" },
  { type: "event", category: "Events", title: "Science Exhibition 2025 — Highlights", thumbnail: "https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", date: "Aug 2025" },
  { type: "video", category: "Videos", title: "Student Testimonials — Class 10 Biology", thumbnail: "https://png.pngtree.com/thumb_back/fw800/background/20241007/pngtree-biology-laboratory-nature-and-science-plants-with-biochemistry-structure-on-green-image_16319180.jpg", date: "Jul 2025" },
  { type: "photo", category: "Photos", title: "CSEEL Kit Distribution — Rural Schools", thumbnail: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66c366924698e845aff6397c_Group-Laptop-Labster-edit-2.avif", date: "Jun 2025" },
  { type: "press", category: "Press", title: "CSEEL Wins Best EdTech Award 2025", thumbnail: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66b6088ed6f732140b977d32_gsv.avif", date: "May 2025" },
];

const MediaArchive = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? mediaItems : mediaItems.filter(m => m.category === active);

  return (
    <Layout>
      <PageTransition>
        <section className="about-hero-gradient py-20 text-center text-primary-foreground">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Media Archive</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Photos, videos, press coverage, and event highlights from the CSEEL journey.
            </p>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 justify-center flex-wrap mb-10">
              {categories.map((c) => (
                <button key={c} onClick={() => setActive(c)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${active === c ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filtered.map((item, i) => (
                <div key={i} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.type === "video" ? <Play className="h-10 w-10 text-white" /> : <Image className="h-10 w-10 text-white" />}
                    </div>
                    <span className="absolute top-3 left-3 text-xs px-2 py-1 bg-black/60 text-white rounded-full">{item.category}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
};

export default MediaArchive;
