import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/seo/SEOHead";

import PageTransition from "@/components/shared/PageTransition";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowRight, Clock } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { events } from "./EventDetail";

const typeColors: Record<string, string> = {
  "Science Fair": "bg-blue-100 text-blue-700",
  "Workshop": "bg-green-100 text-green-700",
  "Competition": "bg-red-100 text-red-700",
  "Open Day": "bg-purple-100 text-purple-700",
};

type EventType = typeof events[0];

const RegistrationModal = ({ event, open, onClose }: { event: EventType | null; open: boolean; onClose: () => void }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", school: "", participants: "1" });
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      toast.success("Registration successful! You'll receive a confirmation email shortly.");
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Register for {event.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{event.date} • {event.location}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="reg-name">Full Name *</Label>
            <Input id="reg-name" placeholder="Your full name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="reg-email">Email Address *</Label>
            <Input id="reg-email" type="email" placeholder="you@email.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="reg-phone">Phone Number *</Label>
            <Input id="reg-phone" type="tel" placeholder="+91 XXXXX XXXXX" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="reg-school">School / Institution</Label>
            <Input id="reg-school" placeholder="Your school or institution name" value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="reg-participants">Number of Participants *</Label>
            <Input id="reg-participants" type="number" min="1" max="50" required value={form.participants} onChange={e => setForm(f => ({ ...f, participants: e.target.value }))} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Confirm Registration"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EventsUpcoming = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRegister = (ev: React.MouseEvent, event: EventType) => {
    ev.stopPropagation();
    setSelectedEvent(event);
    setModalOpen(true);
  };

  return (
    <Layout>
      <PageTransition>
      <SEOHead
        title="Upcoming Science Events & Workshops India 2026 | CSEEL"
        description="Browse upcoming science events, workshops, exhibitions, and competitions by CSEEL across India in 2026. Register early and secure your spot."
        keywords="upcoming science events India 2026, science workshop 2026 India, science exhibition 2026, STEM event India"
        canonical="https://www.cseel.org/events/upcoming"
      />
        <section className="about-hero-gradient py-20 text-center text-primary-foreground">
          <div className="container mx-auto px-4">
            <p className="text-sm font-semibold uppercase tracking-widest opacity-70 mb-3">Events</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Upcoming Events</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">Join us at our upcoming science education events, workshops, and competitions.</p>
          </div>
        </section>
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-6">
              {events.map((e) => (
                <ScrollReveal key={e.id}>
                  <div
                    onClick={() => navigate(`/events/${e.id}`)}
                    className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer hover:border-primary/30 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="text-center bg-primary/10 rounded-xl p-4 min-w-[80px] group-hover:bg-primary/20 transition-colors">
                        <Calendar className="h-6 w-6 text-primary mx-auto mb-1" />
                        <div className="text-xs font-bold text-primary">{e.date.split(",")[0]}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{e.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${typeColors[e.type] || "bg-gray-100 text-gray-700"}`}>{e.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{e.desc}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {e.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {e.seats}</span>
                        </div>
                      </div>
                      <button
                        onClick={(ev) => handleRegister(ev, e)}
                        className="flex-shrink-0 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/90 transition-colors flex items-center gap-1"
                      >
                        Register <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <RegistrationModal event={selectedEvent} open={modalOpen} onClose={() => setModalOpen(false)} />
      </PageTransition>
    </Layout>
  );
};

export default EventsUpcoming;