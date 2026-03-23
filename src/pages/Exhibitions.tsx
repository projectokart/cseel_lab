import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";

import PageTransition from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { Image, MapPin, Calendar, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const exhibitions = [
  { title: "Wonders of Chemistry", subject: "Chemistry", location: "CSEEL Lab 1", open: "Mon–Sat, 10AM–4PM", desc: "An interactive walk-through of chemical reactions, molecular models, and the periodic table.", img: "https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg" },
  { title: "Life Under the Microscope", subject: "Biology", location: "CSEEL Lab 2", open: "Mon–Sat, 10AM–4PM", desc: "Explore the world of cells, microorganisms, and ecosystems through interactive displays.", img: "https://png.pngtree.com/thumb_back/fw800/background/20241007/pngtree-biology-laboratory-nature-and-science-plants-with-biochemistry-structure-on-green-image_16319180.jpg" },
  { title: "Forces & Motion", subject: "Physics", location: "CSEEL Lab 3", open: "Mon–Sat, 10AM–4PM", desc: "Experience Newton's laws, electromagnetism, and optics through hands-on interactive exhibits.", img: "https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg" },
];

const Exhibitions = () => (
  <Layout>
    <PageTransition>
      <SEOHead
        title="National Science Exhibitions India | CSEEL Science Fairs"
        description="Participate in CSEEL's national and international science exhibitions in India. Showcase your science projects, compete with students nationwide, and win recognition."
        keywords="national science exhibition India, science fair India, science competition students India, science expo India, student science project exhibition"
        canonical="https://www.cseel.org/exhibitions"
      />
      <section className="about-hero-gradient py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Science Exhibitions</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">Visit our permanent science exhibitions — open to students, educators, and science enthusiasts.</p>
        </div>
      </section>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exhibitions.map((ex) => (
              <div key={ex.title} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <img src={ex.img} alt={ex.title} className="w-full h-44 object-cover" />
                <div className="p-5">
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">{ex.subject}</span>
                  <h3 className="text-lg font-bold text-foreground mt-1 mb-2">{ex.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{ex.desc}</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {ex.location}</div>
                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {ex.open}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/contact-us" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors">
              Book a School Visit <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  </Layout>
);

export default Exhibitions;
