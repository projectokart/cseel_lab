import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const upcomingEvents = [
  { title: "STEM Science Fair 2026", date: "April 15, 2026", location: "Bhubaneswar, Odisha", type: "Exhibition", seats: "500+", desc: "Annual inter-school science fair showcasing student experiments and innovations.", img: "https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg" },
  { title: "Teacher Development Summit", date: "May 3–4, 2026", location: "New Delhi", type: "Conference", seats: "200", desc: "Two-day summit for science educators on NEP 2020 implementation and experiential pedagogy.", img: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66be608d71d32863b2bf5487_Students-Desk-Classroom-Laptop-reverse.avif" },
  { title: "Robotics & Engineering Workshop", date: "June 10, 2026", location: "Pune, Maharashtra", type: "Workshop", seats: "60", desc: "Hands-on robotics workshop for Class 9–12 students. Build and program your own robot!", img: "https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg" },
];

const pastEvents = [
  { title: "Science & Society Symposium 2025", date: "December 2025", location: "Hyderabad", type: "Symposium", desc: "National symposium on role of hands-on science in building scientific temper.", img: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif" },
  { title: "CSEEL Annual Exhibition 2025", date: "October 2025", location: "Bhubaneswar", type: "Exhibition", desc: "Showcase of 200+ student projects from CSEEL partner schools.", img: "https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf944f3df098f183b92727_Lab-Scientists-Beakers-edit.avif" },
  { title: "NEP 2020 Educator Workshop", date: "August 2025", location: "Multiple Cities", type: "Workshop", desc: "10-city workshop series training 500+ educators in experiential learning.", img: "https://davcsp.org/File/50/Slider_40e21c0d-d24b-42cf-9023-30a8c9ca0712_davcamp-1.jpeg" },
];

const Events = () => {
  const { type } = useParams<{ type: string }>();
  // Also detect from URL path for /exhibitions route
  const path = window.location.pathname;
  const isPast = type === "past";
  const isExhibitions = type === "exhibitions" || path.includes("/exhibitions");
  const events = isPast ? pastEvents : upcomingEvents;

  return (
    <Layout>
      <PageTransition>
        <section className="about-hero-gradient py-20 text-center text-primary-foreground">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isPast ? "Past Events" : isExhibitions ? "Exhibitions" : "Upcoming Events"}
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              {isPast ? "Highlights from CSEEL's journey — workshops, fairs, and summits." : "Join us at our upcoming events across India."}
            </p>
            <div className="flex gap-3 justify-center mt-6 flex-wrap">
              <Link to="/events/upcoming"><Button variant={!isPast ? "secondary" : "outline"} className="border-white text-white hover:bg-white/10">Upcoming</Button></Link>
              <Link to="/events/past"><Button variant={isPast ? "secondary" : "outline"} className="border-white text-white hover:bg-white/10">Past Events</Button></Link>
              <Link to="/exhibitions"><Button variant={isExhibitions ? "secondary" : "outline"} className="border-white text-white hover:bg-white/10">Exhibitions</Button></Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="space-y-8">
              {events.map((ev, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="flex flex-col md:flex-row gap-6 bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                      <img src={ev.img} alt={ev.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">{ev.type}</span>
                        <h3 className="text-xl font-bold text-foreground mt-3 mb-2">{ev.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{ev.desc}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{ev.date}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{ev.location}</span>
                          {'seats' in ev && <span className="flex items-center gap-1"><Users className="h-4 w-4" />{ev.seats} seats</span>}
                        </div>
                      </div>
                      {!isPast && (
                        <Link to="/contact-us" className="mt-4">
                          <Button variant="outline" size="sm" className="gap-1">Register <ArrowRight className="h-3 w-3" /></Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
};

export default Events;
