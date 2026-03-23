import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";

import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, BarChart3, Users, ClipboardList } from "lucide-react";

const benefits = [
  { icon: BookOpen, title: "Rich Content Library", desc: "Access hundreds of curriculum-aligned experiments and simulations ready to assign." },
  { icon: ClipboardList, title: "Assignment Management", desc: "Create, assign, and track experiments with built-in grading tools." },
  { icon: BarChart3, title: "Progress Analytics", desc: "Monitor student performance with detailed reports and analytics dashboards." },
  { icon: Users, title: "Class Management", desc: "Organize students into classes with unique codes for easy enrollment." },
];

const ForEducators = () => (
  <Layout>
    <PageTransition>
      <SEOHead
        title="Science Platform for Educators & Teachers India | CSEEL"
        description="CSEEL empowers science teachers in India with virtual lab tools, curriculum-aligned experiments, and professional development. Trusted by 1000+ educators across India."
        keywords="science platform teachers India, educator science tools, virtual lab teachers, science teacher professional development India, CBSE teacher science"
        canonical="https://www.cseel.org/for-educators"
      />
      <section className="about-hero-gradient py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">For Educators</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Empower your teaching with virtual labs that bring science to life in your classroom.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="mt-6">Get Started Free</Button>
          </Link>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {benefits.map((b) => (
            <div key={b.title} className="flex gap-4 p-6 bg-card border border-border rounded-xl">
              <b.icon className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageTransition>
  </Layout>
);

export default ForEducators;
