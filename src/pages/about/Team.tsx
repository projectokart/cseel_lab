import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/seo/SEOHead";

import PageTransition from "@/components/shared/PageTransition";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const teamMembers = [
  { name: "Dr. Priya Sharma", role: "Founder & CEO", initials: "PS" },
  { name: "Rahul Verma", role: "CTO", initials: "RV" },
  { name: "Ananya Gupta", role: "Head of Content", initials: "AG" },
  { name: "Vikram Singh", role: "Lead Developer", initials: "VS" },
  { name: "Meera Patel", role: "Education Specialist", initials: "MP" },
  { name: "Arjun Nair", role: "Product Designer", initials: "AN" },
];

const Team = () => (
  <Layout>
    <PageTransition>
      <SEOHead
        title="Our Team | Scientists & Educators Behind CSEEL India"
        description="Meet the passionate team of scientists, educators, and innovators behind CSEEL — India's leading experimental science learning platform."
        keywords="CSEEL team, science educators India, CSEEL founders"
        canonical="https://www.cseel.org/team"
      />
      <section className="hero-gradient py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Team</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet the passionate people behind CSEEL.
          </p>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl">
          {teamMembers.map((m) => (
            <div key={m.name} className="text-center p-6 bg-card border border-border rounded-xl">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {m.initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold text-foreground">{m.name}</h3>
              <p className="text-sm text-muted-foreground">{m.role}</p>
            </div>
          ))}
        </div>
      </section>
    </PageTransition>
  </Layout>
);

export default Team;
