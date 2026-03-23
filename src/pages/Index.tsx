import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import SEOHead from "@/components/SEOHead";
import OffersSection from "@/components/OffersSection";
import AnnouncementBar from "@/components/AnnouncementBar";
import OfferPopup from "@/components/OfferPopup";

const logoUrls = Array.from({ length: 12 }, (_, i) =>
  `https://www.jigyasu.co.in/assets/images/logo${i + 1}.png`
);

const catalogItems = [
  { title: "Chemistry", image: "https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg", link: "/simulations" },
  { title: "Biology", image: "https://png.pngtree.com/thumb_back/fw800/background/20241007/pngtree-biology-laboratory-nature-and-science-plants-with-biochemistry-structure-on-green-image_16319180.jpg", link: "/simulations" },
  { title: "Physics", image: "https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", link: "/simulations" },
  { title: "Technology", image: "https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", link: "/simulations" },
  { title: "Engineering", image: "https://img.freepik.com/premium-photo/engineer-inspects-assembled-products-engineering_697211-20295.jpg", link: "/simulations" },
  { title: "Art", image: "https://www.poolewood.co.uk/wp-content/uploads/woodworking-525x311.jpg", link: "/simulations" },
  { title: "Mathematics", image: "https://wallpaperaccess.com/full/1308246.jpg", link: "/simulations" },
];

const heroImages = [
  "https://www.thoughtco.com/thmb/kbjOeU1CqYiCzmKIH0FtZ4LrBEQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-556450927-58b5b1d95f9b586046b7f7d9.jpg",
  "https://cdn.mos.cms.futurecdn.net/ide7QUU2eMp8ePMs6JAwR6-1200-80.jpg",
  "https://i.pinimg.com/originals/33/2b/3b/332b3b6ee4ff9e2bb34ac529e39ab5ec.jpg",
  "https://www.ase.org.uk/sites/default/files/Spacestation%20by%20S%2BB%20UK.JPG",
  "https://png.pngtree.com/thumb_back/fw800/background/20240801/pngtree-botanical-research-in-a-modern-lab-with-microscope-and-plants-image_16123408.jpg",
  "https://wallpaperaccess.com/full/758537.png"
];

// Counter animation hook
function useCountUp(target: number, duration = 2000, suffix = "") {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

// Scroll-reveal hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

// Animated stat card
function StatCard({ value, label, desc, delay = 0, suffix = "" }: { value: number; label: string; desc: string; delay?: number; suffix?: string }) {
  const { count, ref } = useCountUp(value, 1800);
  const { ref: revealRef, visible } = useScrollReveal();
  return (
    <div
      ref={revealRef as any}
      className="p-6 md:p-8 rounded-2xl bg-primary-light transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div ref={ref} className="text-3xl md:text-5xl font-bold text-primary mb-2">
        +{count}%
      </div>
      <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">{label}{suffix && <sup className="text-xs">{suffix}</sup>}</h3>
      <p className="text-xs md:text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

// Feature row
function FeatureRow({
  tag, title, desc, checks, imgSrc, imgAlt, reverse = false, delay = 0,
}: {
  tag: string; title: string; desc: string; checks: { title: string; body: string }[];
  imgSrc: string; imgAlt: string; reverse?: boolean; delay?: number;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(50px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className={reverse ? "order-1 lg:order-2" : ""}>
        <p className="text-sm font-semibold text-primary mb-2">{tag}</p>
        <h2 className="text-xl md:text-3xl font-bold text-foreground mb-4">{title}</h2>
        <p className="text-sm md:text-base text-muted-foreground mb-6">{desc}</p>
        <div className="space-y-4">
          {checks.map((c, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground text-sm md:text-base">{c.title}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`rounded-2xl overflow-hidden shadow-lg group ${reverse ? "order-2 lg:order-1" : ""}`}>
        <img src={imgSrc} alt={imgAlt} className="w-full h-52 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
    </div>
  );
}

// Hero image slider
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % heroImages.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl aspect-video max-w-3xl mx-auto">
      {heroImages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt="CSEEL Lab"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{ background: i === current ? "white" : "rgba(255,255,255,0.5)", transform: i === current ? "scale(1.4)" : "scale(1)" }}
          />
        ))}
      </div>
    </div>
  );
}

// ReadMore text component matching cseel.org
function HeroText() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="max-w-3xl mx-auto mb-6 md:mb-8">
      <div
        className="text-muted-foreground leading-relaxed text-sm md:text-base"
        style={{
          textAlign: "justify",
          display: expanded ? "block" : "-webkit-box",
          WebkitLineClamp: expanded ? "unset" : 3,
          WebkitBoxOrient: "vertical" as any,
          overflow: expanded ? "visible" : "hidden",
          transition: "all 0.3s ease",
        }}
      >
        At CSEEL, we share the vision of the National Education Policy (<strong>NEP</strong>) 2020
        to transform Indian education from <strong>rote memorization</strong> to{" "}
        <strong>experiential, inquiry-based, competency-focused</strong>, and{" "}
        <strong>hands-on</strong> learning.
        <br /><br />
        At CSEEL, we believe the best way to learn science is by doing it.
        Students learn science most effectively when they <strong>observe</strong>,{" "}
        <strong>experiment</strong>, <strong>analyse</strong>, <strong>build</strong>, and{" "}
        <strong>solve real-world problems</strong>, rather than only reading from textbooks.
        Through <strong>experiential learning</strong> and <strong>hands on learning</strong>, students
        discover how things work and why they work, building strong conceptual understanding
        and a deep connection with the world around them.
        <br /><br />
        This approach strongly aligns with <strong>NEP 2020's</strong> emphasis on{" "}
        <strong>learning by doing</strong>, <strong>learner-centred pedagogy</strong>,{" "}
        <strong>development of scientific temper</strong>, and{" "}
        <strong>real-life application of knowledge</strong>, ensuring that learning is meaningful,
        engaging, and future-ready.
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-muted-foreground font-bold text-sm mt-2 hover:underline cursor-pointer"
      >
        {expanded ? "Read Less" : "Read More"}
      </button>
    </div>
  );
}

const Index = () => {
  const heroReveal = useScrollReveal();
  const metricsReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  return (
    <PageTransition>
      <SEOHead
        title="CSEEL | India's #1 Hands-On Science Learning Platform"
        description="CSEEL offers hands-on science experiments, virtual lab simulations, STEM education, teacher training, and national science exhibitions for students and educators across India. Aligned with CBSE, ICSE & NCERT."
        keywords="science education India, hands-on science experiments, virtual science lab India, STEM education India, CSEEL, experimental learning India, science exhibitions India"
        canonical="https://www.cseel.org/"
      />
    <Layout>
      <AnnouncementBar />
      <OfferPopup />
      {/* ─── Hero ─── */}
      <section className="hero-gradient py-10 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          {/* Title */}
          <div style={{ animation: "fadeSlideUp 0.8s ease forwards" }}>
            <h1 style={{ fontSize: "clamp(26px, 5vw, 42px)", lineHeight: 1.3, letterSpacing: "0.3px" }}>
              <span className="text-foreground font-light whitespace-nowrap">
                Welcome to <span className="font-bold text-primary">C.S.E.E.L</span>
              </span>
              <br />
              <span className="block mt-1.5 text-primary/65 font-normal" style={{ fontSize: "clamp(14px, 2.8vw, 18px)" }}>
                Center for Scientific Exploration and Experiential Learning
              </span>
            </h1>
          </div>

          {/* Description with Read More */}
          <div style={{ animation: "fadeSlideUp 0.8s ease 0.2s both" }}>
            <HeroText />
          </div>

          {/* CTA Buttons - stacked on mobile, inline on desktop */}
          <div
            className="flex flex-col md:flex-row justify-center gap-3 md:gap-4 mb-8 md:mb-12 max-w-sm md:max-w-none mx-auto"
            style={{ animation: "fadeSlideUp 0.8s ease 0.5s both" }}
          >
            <Link
              to="/compare-plans"
              className="group px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg md:rounded-full hover:bg-primary-hover transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
            >
              Our Plans <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/demo"
              className="group px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg md:rounded-full hover:bg-primary-light transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Play className="w-4 h-4" /> Live Lab Tour
            </Link>
          </div>

          {/* Hero Image Slider */}
          <div style={{ animation: "fadeSlideUp 0.9s ease 0.65s both" }}>
            <HeroSlider />
          </div>
        </div>
      </section>
<OffersSection />
      {/* ─── Stats ─── */}
      <section className="py-16" style={{ backgroundColor: "hsl(var(--achievement-bg))" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Research Backed</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Why Hands-On Science Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <StatCard value={42} label="Higher Retention Rate" desc="Students engaged in hands-on STEAM/STEM learning show up to 42% higher knowledge retention." delay={0} suffix="¹" />
            <StatCard value={25} label="Engagement" desc="Gamified, interactive STEAM environments increase student engagement and motivation by 25%." delay={150} suffix="²" />
            <div
              className="p-6 md:p-8 rounded-2xl bg-primary-light transition-all duration-700"
              style={{ animation: "fadeSlideUp 0.7s ease 0.4s both" }}
            >
              <div className="text-3xl md:text-5xl font-bold text-primary mb-2">≧ C</div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">Higher Academic Success<sup className="text-xs">³</sup></h3>
              <p className="text-xs md:text-sm text-muted-foreground">Students earning C or higher in foundational science courses are more likely to persist in STEAM careers.</p>
            </div>
          </div>
         
        </div>
      </section>

      {/* ─── Logo Carousel ─── */}
      <section className="py-6 bg-background"> {/* py-12 ko py-6 kiya height kam karne ke liye */}
  <div className="container mx-auto px-4 text-center mb-4"> {/* mb-8 ko mb-4 kiya */}
    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
      CSEEL Powers Opportunity Through STEAM.
    </h2>
  </div>
  
  <div className="overflow-hidden py-4 relative"> {/* py-8 ko py-4 kiya */}
    {/* Gradients */}
    <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }} />
    <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }} />
    
    <div className="flex animate-scroll-logos items-center" style={{ width: "fit-content" }}>
      {[...logoUrls, ...logoUrls, ...logoUrls].map((url, i) => (
        <img
          key={i}
          src={url}
          alt="Partner logo"
          // h-16 md:h-20 ko h-20 md:h-28 kiya size badhane ke liye
          className="h-20 md:h-28 w-auto mx-8 md:mx-14 opacity-60 hover:opacity-100 transition-opacity duration-300 object-contain flex-shrink-0"
          // maxWidth ko 160px se 220px kiya
          style={{ minWidth: "100px", maxWidth: "220px" }}
        />
      ))}
    </div>
  </div>
</section>

      {/* ─── Key Metrics ─── */}
      <section className="py-16 hero-gradient" ref={metricsReveal.ref as any}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Our Impact</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">CSEEL by the Numbers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-16">
            {[
              { num: "20,000+", label: "Active Learners" },
              { num: "1000+", label: "Concept Based Experiments" },
              { num: "25+", label: "Schools Empowered" },
            ].map((m, i) => (
              <div
                key={i}
                style={{
                  opacity: metricsReveal.visible ? 1 : 0,
                  transform: metricsReveal.visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
                  transition: "all 0.6s ease",
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                <div className="text-5xl font-bold text-primary mb-2">{m.num}</div>
                <p className="font-semibold text-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature Rows ─── */}
{/* ─── Feature Rows ─── */}
<section className="py-16 bg-background">
  <div className="container mx-auto px-4 space-y-12">
    <div className="text-center mb-4">
      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Why CSEEL</p>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">Built for Real Learning Outcomes</h2>
    </div>
    
    {/* Feature 1: Soft Blue/Slate Background */}
    <div className="bg-[#e3eefb] rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch" style={{ opacity: 1, transform: 'translateY(0px)', transition: 'opacity 0.7s, transform 0.7s' }}>
        {/* Content Section */}
        <div className="p-8 md:p-12">
          <p className="text-sm font-semibold text-primary mb-2">No need for extra grading or planning time</p>
          <h2 className="text-xl md:text-3xl font-bold text-foreground mb-4">Students look forward to learning at their own pace</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6">Educators assign CSEEL experimental labs to actively engage students—without increasing their already busy workloads. Higher engagement naturally leads to better understanding, improved grades, and stronger retention.</p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big h-5 w-5 text-primary mt-0.5 flex-shrink-0"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
              <div>
                <p className="font-semibold text-foreground text-sm md:text-base">C- to B+ Grade Improvement</p>
                <p className="text-xs md:text-sm text-muted-foreground">CSEEL helps students improve their academic performance by an average of one full letter grade or more.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big h-5 w-5 text-primary mt-0.5 flex-shrink-0"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
              <div>
                <p className="font-semibold text-foreground text-sm md:text-base">82% Student Engagement</p>
                <p className="text-xs md:text-sm text-muted-foreground">82% of students using CSEEL report high levels of engagement, participation, and interest in learning.</p>
              </div>
            </div>
          </div>
        </div>
        {/* Image Section */}
        <div className="relative w-full h-48 lg:h-auto lg:min-h-full overflow-hidden group">
          <img src="https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif" alt="Student learning remotely" className="w-full h-full lg:absolute lg:inset-0 object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
      </div>
    </div>

    {/* Feature 2: Soft Indigo/Lavender Background */}
    <div className="bg-[#fff1f1] rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch" style={{ opacity: 1, transform: 'translateY(0px)', transition: 'opacity 0.7s 100ms, transform 0.7s' }}>
        {/* Image Section - order-last on mobile, order-first on desktop for reverse look */}
        <div className="relative w-full h-48 lg:h-auto lg:min-h-full overflow-hidden group lg:order-first order-last">
          <img src="https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf944f3df098f183b92727_Lab-Scientists-Beakers-edit.avif" alt="Scientists in lab" className="w-full h-full lg:absolute lg:inset-0 object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        {/* Content Section */}
        <div className="p-8 md:p-12">
          <p className="text-sm font-semibold text-primary mb-2">Higher Pass Rates. Stronger Retention.</p>
          <h2 className="text-xl md:text-3xl font-bold text-foreground mb-4">Improved Student Success</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6">CSEEL has been proven to increase student grades, pass rates, and overall academic performance.</p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big h-5 w-5 text-primary mt-0.5 flex-shrink-0"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
              <div>
                <p className="font-semibold text-foreground text-sm md:text-base">34% Reduction in DFW Rates</p>
                <p className="text-xs md:text-sm text-muted-foreground">Institutions using CSEEL have observed a 34% decrease in DFW rates across multiple semesters.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big h-5 w-5 text-primary mt-0.5 flex-shrink-0"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
              <div>
                <p className="font-semibold text-foreground text-sm md:text-base">93% Positive Student Experience</p>
                <p className="text-xs md:text-sm text-muted-foreground">93% of students report a positive learning experience with CSEEL.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Feature 3: Soft Teal/Emerald Background */}
    <div className="bg-[#eafff1] rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch" style={{ opacity: 1, transform: 'translateY(0px)', transition: 'opacity 0.7s 100ms, transform 0.7s' }}>
        {/* Content Section */}
        <div className="p-8 md:p-12">
          <p className="text-sm font-semibold text-primary mb-2">Increase Access</p>
          <h2 className="text-xl md:text-3xl font-bold text-foreground mb-4">Dismantle Barriers to Achievement</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6">Expand STEM equity and access among your students. Cseel is designed to meet diverse student needs and offer a more consistent, accessible science learning experience.</p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big h-5 w-5 text-primary mt-0.5 flex-shrink-0"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
              <div>
                <p className="font-semibold text-foreground text-sm md:text-base">24% Learning Gains for Struggling Students</p>
                <p className="text-xs md:text-sm text-muted-foreground">The lowest-performing students show an average 24% improvement in pre-to-post test knowledge.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big h-5 w-5 text-primary mt-0.5 flex-shrink-0"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
              <div>
                <p className="font-semibold text-foreground text-sm md:text-base">Trusted by Educators</p>
                <p className="text-xs md:text-sm text-muted-foreground">9 out of 10 educators say they would recommend CSEEL to other teachers or institutions.</p>
              </div>
            </div>
          </div>
        </div>
        {/* Image Section */}
        <div className="relative w-full h-48 lg:h-auto lg:min-h-full overflow-hidden group">
          <img src="https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66be608d71d32863b2bf5487_Students-Desk-Classroom-Laptop-reverse.avif" alt="Students in classroom" className="w-full h-full lg:absolute lg:inset-0 object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
      </div>
    </div>

  </div>
</section>
      {/* ─── Catalog ─── */}
      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Subjects</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Explore the CSEEL Catalog</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {catalogItems.map((item, i) => (
              <CatalogCard key={item.title} item={item} delay={i * 60} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/simulations"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary-hover transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              View the Full Experimental Library <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Testimonial ─── */}
      <TestimonialSection />

      {/* ─── Awards ─── */}
      <AwardsSection />

      {/* ─── Easy to Use ─── */}
      <EasySection />

      {/* ─── Final CTA ─── */}
      <section className="py-16 hero-gradient" ref={ctaReveal.ref as any}>
        <div className="container mx-auto px-4">
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            style={{
              opacity: ctaReveal.visible ? 1 : 0,
              transform: ctaReveal.visible ? "translateY(0)" : "translateY(40px)",
              transition: "all 0.7s ease",
            }}
          >
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Get Started</p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Find the Plan That Works For You</h2>
              <p className="text-muted-foreground mb-6">
                See our plan options, learn more about virtual labs, and find out how easy it is to get started with Cseel.
              </p>
              <Link
                to="/compare-plans"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary-hover transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                Compare Plans <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg group">
              <img
                src="https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66c366924698e845aff6397c_Group-Laptop-Labster-edit-2.avif"
                alt="Students with laptop"
                className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Global keyframes */}
      <style>{`
        .t-slide{flex:0 0 88%;min-width:0;padding:0 12px;box-sizing:border-box}
        @media(min-width:640px){.t-slide{flex:0 0 56%!important}}
        @media(min-width:1024px){.t-slide{flex:0 0 35%!important}}
        @keyframes t-exit-left  { from{opacity:1;transform:translateX(0)}   to{opacity:0;transform:translateX(-60px)} }
        @keyframes t-exit-right { from{opacity:1;transform:translateX(0)}   to{opacity:0;transform:translateX(60px)}  }
        @keyframes t-enter-right{ from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)}   }
        @keyframes t-enter-left { from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:translateX(0)}   }
        .t-exit-left  { animation: t-exit-left  0.4s cubic-bezier(0.4,0,0.6,1) forwards; }
        .t-exit-right { animation: t-exit-right 0.4s cubic-bezier(0.4,0,0.6,1) forwards; }
        .t-enter-right{ animation: t-enter-right 0.55s cubic-bezier(0.0,0,0.2,1) forwards; }
        .t-enter-left { animation: t-enter-left  0.55s cubic-bezier(0.0,0,0.2,1) forwards; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </Layout>
    </PageTransition>
  );
};

// Catalog card with staggered scroll reveal
function CatalogCard({ item, delay }: { item: { title: string; image: string; link: string }; delay: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.9)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        transitionDelay: `${delay}ms`,
      }}
    >
      <Link
        to={item.link}
        className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 aspect-square block hover:-translate-y-1"
      >
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent flex items-end p-3">
          <h3 className="text-primary-foreground font-semibold text-sm">{item.title}</h3>
        </div>
      </Link>
    </div>
  );
}

const FALLBACK_TESTIMONIALS = [
  { id:"f1", name:"Sunil Lakra", role:"Science Teacher", institution:"DAV School, Delhi", quote:"CSEEL emphasizes the theory behind the labs. It's much easier for students to carry knowledge forward into advanced classes without missing core concepts.", initials:"SL", cardBg:"#EBF4FA", avatarBg:"#C7E2F5", avatarColor:"#0a5c8a", starColor:"#0a5c8a", iconColor:"#0a5c8a" },
  { id:"f2", name:"Priya Sharma", role:"KV Teacher", institution:"Kendriya Vidyalaya, Mumbai", quote:"The hands-on experiments have transformed how my students engage with science. Their curiosity and participation has increased manifold since we started.", initials:"PS", cardBg:"#EAF5F0", avatarBg:"#B8E4D4", avatarColor:"#0F6E56", starColor:"#0F6E56", iconColor:"#0F6E56" },
  { id:"f3", name:"Rajesh Kumar", role:"Physics Educator", institution:"DPS School, Bengaluru", quote:"Virtual simulations are perfectly aligned with our CBSE curriculum. Students practice experiments at home which has greatly improved their practical exam scores.", initials:"RA", cardBg:"#EEF0FA", avatarBg:"#C9CFF5", avatarColor:"#3730A3", starColor:"#3730A3", iconColor:"#3730A3" },
  { id:"f4", name:"Anita Verma", role:"Biology Teacher", institution:"Navodaya Vidyalaya, Pune", quote:"The interactive experiments keep students engaged longer. I've seen remarkable improvement in my students' understanding of complex biological processes with CSEEL.", initials:"AV", cardBg:"#F0F7EE", avatarBg:"#C3DFB8", avatarColor:"#276B1A", starColor:"#276B1A", iconColor:"#276B1A" },
  { id:"f5", name:"Vikram Singh", role:"Chemistry Professor", institution:"St. Xavier's College, Chennai", quote:"CSEEL bridges theory and practice beautifully. My college students arrive at labs with much better conceptual clarity, reducing experiment failures significantly.", initials:"VS", cardBg:"#F5EEF8", avatarBg:"#DCC5E8", avatarColor:"#6B21A8", starColor:"#6B21A8", iconColor:"#6B21A8" },
];

function TestimonialSection() {
  const [items, setItems] = useState<any[]>(FALLBACK_TESTIMONIALS);
  const [current, setCurrent] = useState(0);
  const { ref, visible } = useScrollReveal();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    duration: 28,
    slidesToScroll: 1,
  });

  useEffect(() => {
    supabase.from("testimonials").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => { if (data && data.length > 0) setItems(data); });
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setCurrent(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  return (
    <section
      className="py-20 overflow-hidden"
      style={{ background: "#F8F9FA" }}
      ref={ref as any}
    >
      <div
        className="container mx-auto px-6 max-w-7xl"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "all 0.7s ease" }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-8">
          <div>
            <h2 style={{ fontSize:"clamp(2rem,4vw,3rem)", fontWeight:500, color:"#202124", letterSpacing:"-0.02em", lineHeight:1.2, marginBottom:16 }}>
              Trusted by Teachers<br/>
              <span style={{ color:"#5F6368" }}>across the nation.</span>
            </h2>

          </div>
          {/* Arrows */}
          <div style={{ display:"flex", gap:12, flexShrink:0 }}>
            <button
              onClick={() => emblaApi?.scrollPrev()}
              style={{ width:48, height:48, borderRadius:"50%", background:"white", border:"1px solid #DADCE0", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s", color:"#5F6368" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#F1F3F4"; (e.currentTarget as HTMLElement).style.color="#202124"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="white"; (e.currentTarget as HTMLElement).style.color="#5F6368"; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              style={{ width:48, height:48, borderRadius:"50%", background:"white", border:"1px solid #DADCE0", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s", color:"#5F6368" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#F1F3F4"; (e.currentTarget as HTMLElement).style.color="#202124"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="white"; (e.currentTarget as HTMLElement).style.color="#5F6368"; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        {/* Embla */}
        <div ref={emblaRef} style={{ overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"stretch" }}>
            {items.map((t, i) => {
              const THEMES = [
                { cardBg:"#EBF4FA", avatarBg:"#C7E2F5", color:"#0a5c8a" },
                { cardBg:"#EAF5F0", avatarBg:"#B8E4D4", color:"#0F6E56" },
                { cardBg:"#F5EEF8", avatarBg:"#DCC5E8", color:"#6B21A8" },
                { cardBg:"#FFF7ED", avatarBg:"#FED7AA", color:"#9A3412" },
                { cardBg:"#EEF2FF", avatarBg:"#C7D2FE", color:"#3730A3" },
              ];
              const theme = THEMES[i % THEMES.length];
              const cardBg = t.cardBg || theme.cardBg;
              const avatarBg = t.avatarBg || theme.avatarBg;
              const avatarColor = t.avatarColor || theme.color;
              const starColor = t.starColor || theme.color;
              const iconColor = t.iconColor || theme.color;
              const initials = t.initials || t.name?.slice(0,2).toUpperCase();
              return (
                <div key={t.id||i} className="t-slide">
                  <div
                    style={{
                      background: cardBg,
                      borderRadius:28,
                      border:"1px solid rgba(0,0,0,0.07)",
                      padding:"32px",
                      height:"100%",
                      display:"flex",
                      flexDirection:"column",
                      transition:"border-color 0.3s, box-shadow 0.3s",
                      cursor:"default",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.10)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    {/* Avatar + name */}
                    <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
                      <div style={{ width:52, height:52, borderRadius:"50%", background:avatarBg, display:"flex", alignItems:"center", justifyContent:"center", color:avatarColor, fontWeight:700, fontSize:15, flexShrink:0 }}>
                        {t.photo_url ? (
                          <img src={t.photo_url} alt={t.name} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} />
                        ) : initials}
                      </div>
                      <div>
                        <p style={{ fontWeight:500, color:"#202124", fontSize:15, lineHeight:1.3 }}>{t.name}</p>
                        <p style={{ fontSize:13, color:"#5F6368", marginTop:2 }}>{t.institution || t.role}</p>
                      </div>
                    </div>

                    {/* Quote */}
                    <p style={{ color:"#3C4043", fontSize:16, lineHeight:1.7, flex:1 }}>
                      "{t.quote}"
                    </p>

                    {/* Footer */}
                    <div style={{ marginTop:24, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ color:starColor, fontSize:16, letterSpacing:2 }}>★★★★★</div>
                      <svg style={{ width:22, height:22, color:iconColor, fill:iconColor }} viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:40 }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => emblaApi?.scrollTo(i)}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === current ? "#4285F4" : "#DADCE0",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

      </div>
    </section>
  );
}


function AwardsSection() {
  const { ref, visible } = useScrollReveal();
  const awardImgs = [
    "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66b6088ed6f732140b977d32_gsv.avif",
    "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66b6088eb79f5af91f5f4c8e_promise.avif",
    "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66b6088e74ca012dd9db92f8_edtech.avif",
    "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66b6088eb05eb79120a532a2_advocate.avif",
    "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66b6088e98414361f6b7c4e3_leader.avif",
    "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66b6088e39ada1f2e6d15101_ability.avif",
  ];
  return (
    <section className="py-16 hero-gradient" ref={ref as any}>
      <div className="container mx-auto px-4">
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.7s ease",
          }}
        >
          <div className="text-center mb-8 lg:hidden">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Recognition</p>
            <h2 className="text-2xl font-bold text-foreground">Award-Winning Platform</h2>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {awardImgs.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Award badge"
                className="h-20 w-20 object-contain transition-transform duration-300 hover:scale-110"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "scale(1)" : "scale(0.7)",
                  transition: "all 0.5s ease",
                  transitionDelay: `${i * 80}ms`,
                }}
              />
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Recognition</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Award-Winning Learning Platform</h2>
            <p className="text-muted-foreground mb-6">
              Cseel has earned recognition for our research-based learning architecture, best-in-class customer support, and student impact. Learn why our virtual lab simulations have received more than 10 prestigious education awards.
            </p>
            <Link
              to="/about-us"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary-hover transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Learn More About Cseel <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function EasySection() {
  const { ref, visible } = useScrollReveal();
  const cards = [
    { tag: "LMS Integration", title: "Stay with your LMS or use our Course Manager", desc: "Assign CSEEL right from your LMS! Explore and select content, and monitor student results, all without having to leave your course page." },
    { tag: "Course Mapping", title: "Easily match Cseel to your curriculum", desc: "Browse our Catalog to find virtual labs that match your curriculum, or get our course mapping service with Advanced or Elite plans." },
    { tag: "Technical Support", title: "Get live support whenever you need it", desc: "Our award-winning support team is ready to help you and your students at every step via Live Chat, Help Center, and training guides." },
  ];
  return (
    <section className="py-16 bg-background" ref={ref as any}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease" }}>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Simple to Start</p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">We Make it Easy to Use CSEEL in STEM Courses</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((c, i) => (
            <div
              key={i}
              className="p-8 rounded-xl border border-border text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s, translateY 0.3s",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <div className="text-sm font-semibold text-primary mb-2">{c.tag}</div>
              <h3 className="text-lg font-bold text-foreground mb-3">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Index;