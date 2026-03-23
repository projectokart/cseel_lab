import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";

import { Link } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerChildren, { staggerItem } from "@/components/StaggerChildren";
import { motion } from "framer-motion";

const teamMembers = [
  {
    name: "Catherine Gasse",
    title: "Chief People Officer",
    image: "https://cdn.prod.website-files.com/6320bb946c79f421bd3b702f/67d09c375fc0591b6041a3ef_About%20Us-Headshot-07.png",
    bio: "Catherine's leadership centers on empowering others to do their best work, creating an environment where talent can flourish and innovation can take root.",
  },
  {
    name: "Bjørn Toft Madsen",
    title: "Chief Product & Technology Officer",
    image: "https://cdn.prod.website-files.com/6320bb946c79f421bd3b702f/676da6f6eebf5298444b9584_About%20Us-Headshot-06.png",
    bio: "Bjorn oversees Product Management and Software Engineering teams. He was instrumental in three Xbox hardware launches.",
  },
];

const AboutUs = () => {
  return (
    <PageTransition>
      <SEOHead
        title="About CSEEL | Center for Scientific Exploration & Experimental Learning India"
        description="Learn about CSEEL — India's leading experimental science education organization. Our mission, vision, and the team driving science learning for students and educators across India."
        keywords="about CSEEL, science education organization India, experimental learning center, CSEEL team, science platform India"
        canonical="https://www.cseel.org/about-us"
      />
      <Layout>
        {/* Hero */}
        <section className="about-hero-gradient py-20 overflow-hidden">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal>
              <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">About CSEEL</h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="max-w-3xl mx-auto text-primary-foreground/90 leading-relaxed">
                CSEEL (Center for Scientific Exploration & Experimental Learning) is a visionary initiative dedicated to revolutionizing science education in India. Our mission is to bridge the gap between theoretical knowledge and practical understanding through immersive, hands-on, and inquiry-based learning experiences.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Our Purpose */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <ScrollReveal direction="left">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Our Purpose</h2>
                  <p className="text-muted-foreground mb-4">
                    CSEEL creates a dynamic and safe space where students can carry out real experiments, work with scientific equipment, and explore complex STEM concepts through practical application. Our goal is to replace passive learning with active scientific discovery.
                  </p>
                  <p className="text-muted-foreground">
                    Unlike virtual labs, CSEEL is fully physical—students touch, test, build, and innovate using real materials. This makes learning more meaningful, especially in fields that demand tactile understanding and precision.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.1}>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                    src="https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif"
                    alt="Students learning"
                    className="w-full h-80 object-cover"
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className="py-16 hero-gradient">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">Our Approach</h2>
            </ScrollReveal>
            <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Experiential Learning", desc: "Students learn by doing — observing, experimenting, analyzing, and solving real-world problems." },
                { title: "NEP 2020 Aligned", desc: "Aligned with India's National Education Policy focusing on learner-centred pedagogy and scientific temper." },
                { title: "Hands-on Labs", desc: "Physical labs with real equipment that let students touch, test, build, and innovate." },
              ].map((item) => (
                <motion.div key={item.title} variants={staggerItem} className="bg-background p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-lg font-bold text-primary mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">Our Team</h2>
            </ScrollReveal>
            <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" staggerDelay={0.15}>
              {teamMembers.map((member) => (
                <motion.div key={member.name} variants={staggerItem} className="bg-background border border-border rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm text-primary mb-3">{member.title}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 about-hero-gradient">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">Ready to Transform Learning?</h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Discover how CSEEL can help your institution deliver impactful science education.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/compare-plans"
                  className="inline-flex items-center px-8 py-3 bg-background text-primary font-semibold rounded-full hover:bg-primary-light transition-colors"
                >
                  Compare Plans
                </Link>
              </motion.div>
            </ScrollReveal>
          </div>
        </section>
      </Layout>
    </PageTransition>
  );
};

export default AboutUs;
