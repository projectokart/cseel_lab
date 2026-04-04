import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/seo/SEOHead";

import PageTransition from "@/components/shared/PageTransition";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Award, Calendar, CheckCircle } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";

const programs = [
  { icon: GraduationCap, title: "Foundation Program", duration: "3 Days", desc: "Introduction to experiential learning methodologies and CSEEL platform usage.", topics: ["NEP 2020 alignment", "Hands-on lab setup", "Student engagement techniques"] },
  { icon: BookOpen, title: "Advanced Curriculum Integration", duration: "5 Days", desc: "Deep dive into integrating CSEEL experiments with existing school curriculum.", topics: ["Subject-wise experiment mapping", "Assessment strategies", "Digital lab management"] },
  { icon: Users, title: "Master Trainer Program", duration: "7 Days", desc: "Train-the-trainer program to build internal capacity within institutions.", topics: ["Leadership in STEAM education", "Peer mentoring", "Impact measurement"] },
];

const TeacherTraining = () => (
  <Layout>
    <PageTransition>
      <SEOHead
        title="Science Teacher Training Programs India | CSEEL Professional Development"
        description="Join CSEEL's science teacher training programs in India. Online and offline workshops, certifications, and professional development for school and college science educators."
        keywords="science teacher training India, teacher professional development science, science workshop teachers India, teacher certification science India"
        canonical="https://www.cseel.org/teacher-training"
      />
      <section className="about-hero-gradient py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3 opacity-70">Professional Development</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Teacher Training Programs</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Empowering educators with the skills and confidence to deliver world-class experiential science education.
          </p>
          <Link to="/contact-us">
            <Button size="lg" variant="secondary" className="mt-6">Register for Training</Button>
          </Link>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">Training Programs</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {programs.map((p) => (
              <div key={p.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <p.icon className="h-10 w-10 text-primary mb-4" />
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3">{p.duration}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{p.desc}</p>
                <ul className="space-y-2">
                  {p.topics.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <Award className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Certified by CSEEL</h2>
          <p className="text-muted-foreground mb-6">All participants receive an official CSEEL Teacher Training Certificate recognized by partner institutions across India.</p>
          <Link to="/contact-us">
            <Button className="rounded-full px-8">Get Certified →</Button>
          </Link>
        </div>
      </section>
    </PageTransition>
  </Layout>
);

export default TeacherTraining;
