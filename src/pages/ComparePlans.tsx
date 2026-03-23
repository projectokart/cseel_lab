import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";

import { Link } from "react-router-dom";
import { CheckCircle, Star } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerChildren, { staggerItem } from "@/components/StaggerChildren";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Rakesh Sharma",
    title: "Associate Professor, Delhi University",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQasrbD4o8y03QK0ogqw8jJtrRMkApA8HLtDw&s",
    quote: "My goal is for students to have experiences that simulate the hands-on labs they would encounter if they were in person.",
  },
  {
    name: "Vivek Sharma",
    title: "Korean Embassy",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQihhZf7her-3KOsNQwuB3q9IwxNcWbGGGxkQ&s",
    quote: "Fortunately for us, instructors found everything they needed in Cseel. It just worked perfectly for our distance learning.",
  },
  {
    name: "Caitlyn Montross",
    title: "Assistant Professor, Daemen University",
    image: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66fed812d849b3068dc5ec11_Caitlyn-Montross-Daemen-University.avif",
    quote: "One way I engage my students is by using Cseel as a fun, curious game that drives their scientific inquiry.",
  },
];

const plans = [
  {
    name: "Cseel Explorer™",
    description: "Start your journey with hands-on learning in a real lab environment.",
    price: "₹1,00,000",
    priceNote: "Per School / Year",
    subNote: "Annual term for high-impact learning.",
    features: ["Access to 1000+ modules", "Teacher Dashboard", "Standard Support"],
    cta: "Get Started",
    ctaLink: "/contact-us",
    popular: false,
  },
  {
    name: "Cseel Advanced",
    description: "Expand your reach with more experiments and flexible student engagement.",
    price: "Custom",
    priceNote: "Contact for Quote",
    subNote: "Tailored for growing institutions.",
    features: ["Everything in Explorer", "Advanced Analytics", "Priority Support", "LMS Integration"],
    cta: "Contact Sales",
    ctaLink: "/contact-us",
    popular: true,
  },
  {
    name: "Cseel Elite",
    description: "Full program support for institutions looking to transform STEM learning.",
    price: "Enterprise",
    priceNote: "Custom Solutions",
    subNote: "Complete digital transformation.",
    features: ["Everything in Advanced", "Custom Experiment Design", "On-site Training", "Dedicated Manager"],
    cta: "Contact Sales",
    ctaLink: "/contact-us",
    popular: false,
  },
];

const ComparePlans = () => {
  return (
    <PageTransition>
      <SEOHead
        title="CSEEL Plans & Pricing | Science Lab Subscription India"
        description="Compare CSEEL subscription plans for schools, colleges, and individual learners. Affordable pricing for virtual science labs and hands-on experiment kits in India."
        keywords="CSEEL pricing India, science lab subscription India, school science plan, virtual lab pricing India"
        canonical="https://www.cseel.org/compare-plans"
      />
      <Layout>
        {/* 1. PRICING SECTION (AB UPAR HAI) */}
        <section className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Choose Your Plan</h1>
                <p className="text-slate-500 max-w-xl mx-auto">Scale your science department with Cseel's flexible virtual lab solutions.</p>
              </div>
            </ScrollReveal>

            <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto" staggerDelay={0.1}>
              {plans.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={staggerItem}
                  whileHover={{ y: -10 }}
                  className={`flex flex-col h-full rounded-3xl p-8 transition-all duration-300 bg-white ${
                    plan.popular 
                    ? 'border-2 border-primary shadow-2xl relative scale-105 z-10' 
                    : 'border border-slate-200 shadow-sm'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                      Most Popular
                    </span>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{plan.priceNote}</p>
                  </div>

                  <div className="flex-1 space-y-4 mb-8">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] opacity-50">Features</p>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-600 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={plan.ctaLink}
                    className={`w-full text-center py-4 rounded-xl font-bold text-xs transition-all tracking-widest uppercase ${
                      plan.popular
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* 2. CUSTOMER RESULTS (AB NICHE HAI) */}
        <section className="py-20 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="flex flex-col items-center text-center mb-16">
                <div className="flex gap-1 mb-4 text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    Customers See the Results with Cseel
                </h2>
                <p className="text-slate-500">Real stories from world-class educators.</p>
              </div>
            </ScrollReveal>

            <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.12}>
              {testimonials.map((t) => (
                <motion.div 
                    key={t.name} 
                    variants={staggerItem} 
                    className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-primary/20 rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all border-2 border-transparent group-hover:border-primary" />
                    <div>
                        <p className="font-bold text-slate-900">{t.name}</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">{t.title}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute -top-4 -left-2 text-6xl text-slate-200 font-serif opacity-50">“</span>
                    <p className="text-sm text-slate-600 italic leading-relaxed relative z-10">
                        {t.quote}
                    </p>
                  </div>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>
      </Layout>
    </PageTransition>
  );
};

export default ComparePlans;
