import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/seo/SEOHead";

import PageTransition from "@/components/shared/PageTransition";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FlaskConical, Cpu, Leaf, Calculator, Zap, Microscope } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";

const workshops = [
  { icon: FlaskConical, title: "Chemistry in Action", subject: "Chemistry", age: "Class 8–12", duration: "1 Day", desc: "Hands-on experiments covering titration, pH analysis, electrochemistry and more." },
  { icon: Microscope, title: "Biology Exploration", subject: "Biology", age: "Class 6–12", duration: "1 Day", desc: "Cell structure, DNA extraction, photosynthesis and hands-on microscopy sessions." },
  { icon: Zap, title: "Physics Fundamentals", subject: "Physics", age: "Class 8–12", duration: "1 Day", desc: "Newton's laws, optics, electricity and magnetism through real experiments." },
  { icon: Cpu, title: "Engineering & Robotics", subject: "Engineering", age: "Class 9–12", duration: "2 Days", desc: "Build working robots and circuits — introduction to electronics and automation." },
  { icon: Calculator, title: "Mathematics Visualized", subject: "Mathematics", age: "Class 6–10", duration: "1 Day", desc: "3D geometry, probability experiments, and mathematical modeling activities." },
  { icon: Leaf, title: "Environmental Science", subject: "Environment", age: "Class 6–10", duration: "1 Day", desc: "Soil testing, water quality analysis, and sustainability projects." },
];

const Workshops = () => (
  <Layout>
    <PageTransition>
      <SEOHead
        title="Science Workshops for Students & Schools India | CSEEL"
        description="CSEEL conducts hands-on science workshops for students, schools, and colleges across India. Chemistry, Biology, Physics, Robotics, and STEM workshops available."
        keywords="science workshops India, student science workshop, school STEM workshop India, robotics workshop India, science camp India"
        canonical="https://www.cseel.org/workshops"
      />
      <section className="about-hero-gradient py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3 opacity-70">Hands-On Learning</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">CSEEL Workshops</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Intensive one and two-day workshops that bring science alive through real experiments and guided discovery.
          </p>
          <Link to="/contact-us">
            <Button size="lg" variant="secondary" className="mt-6">Book a Workshop</Button>
          </Link>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-4">Workshop Catalog</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">Choose from our range of subject-specific workshops designed for different age groups.</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {workshops.map((w) => (
              <div key={w.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <w.icon className="h-9 w-9 text-primary" />
                  <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">{w.duration}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{w.title}</h3>
                <p className="text-xs text-primary font-semibold mb-3">{w.subject} · {w.age}</p>
                <p className="text-sm text-muted-foreground">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 hero-gradient text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">Bring a Workshop to Your School</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">We come to you! Our facilitators travel across India to conduct workshops at your premises.</p>
          <Link to="/contact-us">
            <Button className="rounded-full px-8">Request Workshop →</Button>
          </Link>
        </div>
      </section>
    </PageTransition>
  </Layout>
);

export default Workshops;
