import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/seo/SEOHead";

import PageTransition from "@/components/shared/PageTransition";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FlaskConical, Gamepad2, Trophy, BookOpenCheck } from "lucide-react";

const benefits = [
  { icon: FlaskConical, title: "Hands-On Experiments", desc: "Perform virtual experiments just like in a real lab — safely and interactively." },
  { icon: Gamepad2, title: "Interactive Simulations", desc: "Engage with 3D simulations that make complex concepts easy to understand." },
  { icon: Trophy, title: "Earn & Track Progress", desc: "Complete experiments, take quizzes, and track your learning journey." },
  { icon: BookOpenCheck, title: "Curriculum Aligned", desc: "All content is mapped to your school syllabus for relevant learning." },
];

const ForStudents = () => (
  <Layout>
    <PageTransition>
      <SEOHead
        title="Science Experiments & Simulations for Students India | CSEEL"
        description="CSEEL helps students in India learn science by doing. Explore virtual labs, hands-on experiments, and science projects aligned with CBSE, ICSE, and state boards."
        keywords="science experiments students India, virtual lab students, CBSE science students, ICSE science practical, science project India, online science learning"
        canonical="https://www.cseel.org/for-students"
      />
      <section className="about-hero-gradient py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">For Students</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Learn science by doing — explore virtual labs and experiments from anywhere.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="mt-6">Start Learning</Button>
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

export default ForStudents;
