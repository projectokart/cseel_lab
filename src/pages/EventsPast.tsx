import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { Calendar, Users, MapPin, Award } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const pastEvents = [
  { title: "Annual STEM Expo 2025", date: "Nov 20, 2025", location: "Bhubaneswar", participants: "800+", highlight: "50 school projects showcased", img: "https://www.ase.org.uk/sites/default/files/Spacestation%20by%20S%2BB%20UK.JPG" },
  { title: "Teacher Training Summit 2025", date: "Sep 14, 2025", location: "CSEEL Campus", participants: "120 teachers", highlight: "NEP 2020 curriculum workshop", img: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif" },
  { title: "National Science Olympiad 2025", date: "Jul 5, 2025", location: "Online", participants: "2000+ students", highlight: "34 schools participated", img: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66be608d71d32863b2bf5487_Students-Desk-Classroom-Laptop-reverse.avif" },
];

const EventsPast = () => (
  <Layout>
    <PageTransition>
      <section className="about-hero-gradient py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Past Events</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">Relive the highlights from our previous science education events.</p>
        </div>
      </section>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastEvents.map((e) => (
              <div key={e.title} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <img src={e.img} alt={e.title} className="w-full h-48 object-cover" />
                <div className="p-5">
                  <h3 className="font-bold text-foreground mb-2">{e.title}</h3>
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {e.date}</div>
                    <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</div>
                    <div className="flex items-center gap-1"><Users className="h-3 w-3" /> {e.participants}</div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                    <Award className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-xs font-medium text-primary">{e.highlight}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  </Layout>
);

export default EventsPast;
