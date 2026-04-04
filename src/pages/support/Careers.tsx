import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/seo/SEOHead";

import PageTransition from "@/components/shared/PageTransition";
import { Briefcase } from "lucide-react";

const Careers = () => (
  <Layout>
    <PageTransition>
      <SEOHead
        title="Careers at CSEEL | Join India's Leading Science Education Platform"
        description="Join the CSEEL team! We're hiring science educators, developers, and content creators passionate about transforming science education in India. Explore open positions."
        keywords="careers CSEEL, science education jobs India, edtech jobs India, science teacher jobs India"
        canonical="https://www.cseel.org/careers"
      />
      <section className="hero-gradient py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Careers</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our team and help transform science education across India.
          </p>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Briefcase className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-4">No Open Positions Right Now</h2>
          <p className="text-muted-foreground mb-6">
            We're always looking for talented individuals who are passionate about education and technology. 
            Send your resume to <a href="mailto:careers@cseel.org" className="text-primary hover:underline">careers@cseel.org</a> and we'll keep you in mind for future opportunities.
          </p>
        </div>
      </section>
    </PageTransition>
  </Layout>
);

export default Careers;
