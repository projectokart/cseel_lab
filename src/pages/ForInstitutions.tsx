import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";

import PageTransition from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, BarChart3, Shield, HeadphonesIcon, Layers, Globe } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const features = [
  { icon: Layers, title: "Scalable Deployment", desc: "Deploy across 10 or 10,000 students with the same ease. Multi-campus, multi-branch support built in." },
  { icon: BarChart3, title: "Institution-Wide Analytics", desc: "Aggregate dashboards showing learning outcomes, engagement rates, and performance trends across your entire institution." },
  { icon: Shield, title: "Data Security & Compliance", desc: "Enterprise-grade security with role-based access, data encryption, and compliance with Indian data protection regulations." },
  { icon: HeadphonesIcon, title: "Dedicated Account Manager", desc: "A dedicated CSEEL representative to handle onboarding, training, and ongoing support for your institution." },
  { icon: Globe, title: "LMS Integration", desc: "Seamless integration with Google Classroom, Microsoft Teams, and other popular Learning Management Systems." },
  { icon: Building2, title: "Custom Branding", desc: "White-label options available for institutions wanting a branded learning experience for their students." },
];

const ForInstitutions = () => (
  <Layout>
    <PageTransition>
      <SEOHead
        title="Science Programs for Schools & Colleges India | CSEEL Institutional Plans"
        description="CSEEL offers institutional plans for schools and colleges in India. Get access to virtual science labs, experiment kits, teacher training, and curriculum mapping services."
        keywords="science program schools India, college science platform, institutional science plan India, school STEM program India, virtual lab school India"
        canonical="https://www.cseel.org/for-institutions"
      />
      <section className="about-hero-gradient py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3 opacity-70">Enterprise Solutions</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">For Institutions</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Transform your institution's science program with CSEEL's enterprise platform — built for scale, compliance, and measurable impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link to="/contact-us"><Button size="lg" variant="secondary">Request a Demo</Button></Link>
            <Link to="/compare-plans"><Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">View Plans</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">Enterprise Features</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <f.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 hero-gradient text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">Trusted by 25+ Schools Across India</h2>
          <p className="text-muted-foreground mb-6">Join a growing network of forward-thinking institutions transforming science education.</p>
          <Link to="/contact-us">
            <Button className="rounded-full px-8">Start a Conversation →</Button>
          </Link>
        </div>
      </section>
    </PageTransition>
  </Layout>
);

export default ForInstitutions;
