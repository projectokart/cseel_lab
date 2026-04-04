import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/shared/PageTransition";
import { Calendar, MapPin, Users, Clock, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const events = [
  {
    id: "stem-science-fair-2026",
    title: "STEM Science Fair 2026",
    date: "April 15, 2026",
    time: "9:00 AM – 5:00 PM",
    location: "Bhubaneswar Convention Center",
    type: "Science Fair",
    seats: "500+ seats",
    desc: "Annual STEM fair featuring student projects, live experiments, and guest lectures from leading scientists.",
    fullDesc: `The STEM Science Fair 2026 is CSEEL's flagship annual event that brings together the brightest young minds from across Odisha and India. This full-day event showcases hundreds of student projects spanning robotics, chemistry, environmental science, and more.

Highlights include:
• 200+ student science project exhibitions
• Live experiment demonstrations by CSEEL educators
• Guest lectures from renowned scientists and researchers
• Awards in 10 categories across age groups (Class 6–12)
• Networking sessions for students, teachers, and institutions

This is a must-attend event for anyone passionate about science education in India.`,
    agenda: [
      { time: "9:00 AM", activity: "Registration & Welcome" },
      { time: "10:00 AM", activity: "Inauguration Ceremony" },
      { time: "11:00 AM", activity: "Project Exhibitions Open" },
      { time: "1:00 PM", activity: "Lunch Break" },
      { time: "2:00 PM", activity: "Guest Lectures" },
      { time: "4:00 PM", activity: "Awards Ceremony" },
      { time: "5:00 PM", activity: "Closing" },
    ],
  },
  {
    id: "teacher-development-summit",
    title: "Teacher Development Summit",
    date: "April 28, 2026",
    time: "10:00 AM – 4:00 PM",
    location: "CSEEL Campus, Bhubaneswar",
    type: "Workshop",
    seats: "100 seats",
    desc: "Full-day professional development event for science educators focusing on NEP 2020 implementation.",
    fullDesc: `The Teacher Development Summit is a hands-on professional development workshop designed exclusively for science educators. Focused on NEP 2020 implementation, this event equips teachers with modern pedagogical tools and strategies.

What you'll gain:
• In-depth NEP 2020 curriculum alignment strategies
• Hands-on training with CSEEL's virtual lab platform
• Peer learning sessions with 100+ educators
• Certificate of participation from CSEEL
• Resource kit with ready-to-use lesson plans

Seats are limited to 100 participants to ensure an interactive, quality experience.`,
    agenda: [
      { time: "10:00 AM", activity: "Welcome & Introduction" },
      { time: "10:30 AM", activity: "NEP 2020 Deep Dive Session" },
      { time: "12:00 PM", activity: "Virtual Lab Hands-on Training" },
      { time: "1:00 PM", activity: "Lunch" },
      { time: "2:00 PM", activity: "Peer Learning Circles" },
      { time: "3:00 PM", activity: "Resource Sharing & Q&A" },
      { time: "4:00 PM", activity: "Certificate Distribution" },
    ],
  },
  {
    id: "national-science-olympiad",
    title: "National Science Olympiad",
    date: "May 10, 2026",
    time: "8:00 AM – 6:00 PM",
    location: "Online + Offline",
    type: "Competition",
    seats: "Open",
    desc: "Inter-school science competition covering Physics, Chemistry, Biology, and Mathematics.",
    fullDesc: `The National Science Olympiad by CSEEL is a prestigious inter-school competition that challenges students in Physics, Chemistry, Biology, and Mathematics. Open to all students from Class 6 to Class 12, this hybrid event allows participation both online and at designated exam centres.

Competition details:
• 4 subjects: Physics, Chemistry, Biology, Mathematics
• 3 rounds: Preliminary (online), Semi-Final, Grand Final
• Cash prizes and scholarships for top performers
• Participation certificates for all students
• School-level trophies for top performing institutions

Register your school today — no seat limit!`,
    agenda: [
      { time: "8:00 AM", activity: "Online Portal Opens" },
      { time: "9:00 AM", activity: "Preliminary Round Begins" },
      { time: "12:00 PM", activity: "Lunch Break" },
      { time: "1:00 PM", activity: "Semi-Final Round" },
      { time: "3:30 PM", activity: "Grand Final" },
      { time: "5:00 PM", activity: "Results & Prize Distribution" },
      { time: "6:00 PM", activity: "Closing Ceremony" },
    ],
  },
  {
    id: "cseel-open-lab-day",
    title: "CSEEL Open Lab Day",
    date: "May 25, 2026",
    time: "10:00 AM – 2:00 PM",
    location: "CSEEL Labs, Bhubaneswar",
    type: "Open Day",
    seats: "200 seats",
    desc: "Explore our state-of-the-art labs, meet our educators, and experience hands-on experiments first-hand.",
    fullDesc: `CSEEL Open Lab Day is your chance to step inside our world-class science labs and experience the future of science education. Whether you're a student, parent, or school administrator, this event is designed to showcase what CSEEL has to offer.

Experience includes:
• Guided tours of our Physics, Chemistry, and Biology labs
• Live demonstrations of virtual and physical experiments
• One-on-one interactions with CSEEL educators
• Introduction to CSEEL's online learning platform
• Special discount offers for institutions registering on the day

A perfect opportunity for schools considering CSEEL partnerships.`,
    agenda: [
      { time: "10:00 AM", activity: "Welcome & Campus Overview" },
      { time: "10:30 AM", activity: "Lab Tours Begin (Batch-wise)" },
      { time: "11:30 AM", activity: "Live Experiment Demonstrations" },
      { time: "12:30 PM", activity: "Refreshments" },
      { time: "1:00 PM", activity: "Meet the Educators Session" },
      { time: "1:30 PM", activity: "Q&A & Institution Enquiries" },
      { time: "2:00 PM", activity: "Closing" },
    ],
  },
];

const typeColors: Record<string, string> = {
  "Science Fair": "bg-blue-100 text-blue-700",
  "Workshop": "bg-green-100 text-green-700",
  "Competition": "bg-red-100 text-red-700",
  "Open Day": "bg-purple-100 text-purple-700",
};

const RegistrationModal = ({ event, open, onClose }: { event: typeof events[0]; open: boolean; onClose: () => void }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", school: "", participants: "1" });
  const [loading, setLoading] = useState(false);

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
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" placeholder="Your full name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" type="email" placeholder="you@email.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="school">School / Institution</Label>
            <Input id="school" placeholder="Your school or institution name" value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="participants">Number of Participants *</Label>
            <Input id="participants" type="number" min="1" max="50" required value={form.participants} onChange={e => setForm(f => ({ ...f, participants: e.target.value }))} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Confirm Registration"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
          <Button onClick={() => navigate("/events/upcoming")}>Back to Events</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageTransition>
        {/* Hero */}
        <section className="about-hero-gradient py-16 text-primary-foreground">
          <div className="container mx-auto px-4 max-w-4xl">
            <button onClick={() => navigate("/events/upcoming")} className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 mb-6 transition-opacity">
              <ArrowLeft className="h-4 w-4" /> Back to Events
            </button>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold mb-4 inline-block ${typeColors[event.type] || "bg-gray-100 text-gray-700"}`}>{event.type}</span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-5 text-sm opacity-90">
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {event.date}</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {event.time}</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location}</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {event.seats}</span>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 max-w-4xl grid md:grid-cols-3 gap-8">
            {/* Left: Details */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-3">About This Event</h2>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed">{event.fullDesc}</div>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Event Agenda</h2>
                <div className="border border-border rounded-xl overflow-hidden">
                  {event.agenda.map((item, i) => (
                    <div key={i} className={`flex gap-4 px-5 py-3 ${i % 2 === 0 ? "bg-muted/40" : "bg-background"}`}>
                      <span className="text-sm font-semibold text-primary min-w-[80px]">{item.time}</span>
                      <span className="text-sm text-foreground">{item.activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Register Card */}
            <div className="md:col-span-1">
              <div className="sticky top-24 bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-lg">Reserve Your Spot</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {event.date}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {event.time}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {event.location}</div>
                  <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> {event.seats}</div>
                  <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /> {event.type}</div>
                </div>
                <Button className="w-full" onClick={() => setShowModal(true)}>Register Now</Button>
                <p className="text-xs text-muted-foreground text-center">Free registration • Confirmation via email</p>
              </div>
            </div>
          </div>
        </section>

        <RegistrationModal event={event} open={showModal} onClose={() => setShowModal(false)} />
      </PageTransition>
    </Layout>
  );
};

export default EventDetail;