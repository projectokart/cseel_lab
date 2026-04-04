import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/shared/PageTransition";
import { Shield, AlertTriangle, Eye, Hand, Flame, Wind } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";

const rules = [
  { icon: Eye, title: "Eye Protection", color: "text-blue-500", desc: "Always wear safety goggles when working with chemicals, heating substances, or any experiment involving flying particles." },
  { icon: Hand, title: "Hand Safety", color: "text-green-500", desc: "Wear appropriate gloves when handling chemicals, hot materials, or sharp instruments. Never touch your face during experiments." },
  { icon: Flame, title: "Fire Safety", color: "text-red-500", desc: "Keep flammable materials away from open flames. Know the location of fire extinguishers. Never leave heating experiments unattended." },
  { icon: Wind, title: "Ventilation", color: "text-purple-500", desc: "Always work in well-ventilated areas when using chemicals with strong odors. Use fume hoods when available." },
  { icon: AlertTriangle, title: "Chemical Safety", color: "text-yellow-500", desc: "Read all labels before use. Never mix unknown chemicals. Dispose of chemical waste as per lab protocols." },
  { icon: Shield, title: "General Precautions", color: "text-primary", desc: "No food or drinks in the lab. Tie back long hair. Report any accidents immediately to the supervising teacher." },
];

const manuals = [
  { title: "General Lab Safety Manual", desc: "Comprehensive safety guidelines for all science laboratories.", pages: "24 pages" },
  { title: "Chemistry Lab Manual", desc: "Specific protocols for handling chemicals, acids, and bases safely.", pages: "18 pages" },
  { title: "Biology Lab Manual", desc: "Safe handling of biological specimens, microscopes, and dissection tools.", pages: "16 pages" },
  { title: "Physics Lab Manual", desc: "Electrical safety, optics handling, and mechanics experiment precautions.", pages: "14 pages" },
  { title: "Emergency Response Guide", desc: "Step-by-step procedures for common lab accidents and first aid.", pages: "10 pages" },
];

const Safety = () => (
  <Layout>
    <PageTransition>
      <section className="about-hero-gradient py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4">
          <Shield className="h-16 w-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Lab Safety & Manuals</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Safety is our top priority. Every CSEEL experiment is designed with comprehensive safety guidelines to ensure a secure learning environment.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">Core Safety Rules</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {rules.map((r) => (
              <div key={r.title} className="bg-card border border-border rounded-xl p-6">
                <r.icon className={`h-9 w-9 ${r.color} mb-3`} />
                <h3 className="text-base font-bold text-foreground mb-2">{r.title}</h3>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4 max-w-3xl">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Safety Manuals</h2>
          </ScrollReveal>
          <div className="space-y-4">
            {manuals.map((m) => (
              <div key={m.title} className="flex items-center justify-between bg-background p-4 rounded-xl border border-border hover:shadow-sm transition-shadow">
                <div>
                  <h3 className="font-semibold text-foreground">{m.title}</h3>
                  <p className="text-sm text-muted-foreground">{m.desc}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-xs text-muted-foreground">{m.pages}</p>
                  <button className="text-xs text-primary font-semibold hover:underline mt-1">Download PDF</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  </Layout>
);

export default Safety;
