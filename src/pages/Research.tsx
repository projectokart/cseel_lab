import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";

import PageTransition from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, FileText, Users, TrendingUp } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const areas = [
  { icon: Search, title: "Experiential Learning Outcomes", desc: "Measuring how hands-on experiments improve conceptual retention and scientific reasoning in K-12 students." },
  { icon: FileText, title: "Curriculum Alignment Research", desc: "Analyzing alignment of practical lab activities with NEP 2020 competency frameworks and board examinations." },
  { icon: Users, title: "Teacher Efficacy Studies", desc: "Understanding how professional development impacts teacher confidence and delivery of STEAM subjects." },
  { icon: TrendingUp, title: "Learning Analytics", desc: "Using platform data to identify learning patterns, predict outcomes and personalize content delivery." },
];

const Research = () => (
  <Layout>
    <PageTransition>
      <SEOHead
        title="Science Research Programs India | CSEEL Research & Innovation"
        description="CSEEL supports science research and innovation programs for students and educators across India. Explore research opportunities, publications, and collaborations."
        keywords="science research India, student research program India, science innovation India, science research students"
        canonical="https://www.cseel.org/research"
      />
      <section className="about-hero-gradient py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3 opacity-70">Evidence-Based Education</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Research Programs</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            CSEEL is committed to advancing the science of science education through rigorous research and data-driven insights.
          </p>
          <Link to="/contact-us">
            <Button size="lg" variant="secondary" className="mt-6">Collaborate with Us</Button>
          </Link>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">Research Focus Areas</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {areas.map((a) => (
              <div key={a.title} className="flex gap-4 p-6 bg-card border border-border rounded-xl hover:shadow-md transition-shadow">
                <a.icon className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Partner with CSEEL Research</h2>
          <p className="text-muted-foreground mb-6">We collaborate with universities, NGOs, and government bodies to conduct large-scale educational research. If you're interested in joint research, reach out to our team.</p>
          <Link to="/contact-us">
            <Button className="rounded-full px-8">Get in Touch →</Button>
          </Link>
        </div>
      </section>
    </PageTransition>
  </Layout>
);

export default Research;
