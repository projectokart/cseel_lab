import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FlaskConical, School, Eye, Mail, MessageSquareQuote } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0, experiments: 0, visits: 0, messages: 0, testimonials: 0, logos: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [users, experiments, visits, messages, testimonials, logos] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("experiments").select("id", { count: "exact", head: true }),
        supabase.from("page_visits").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("logos").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        users: users.count || 0,
        experiments: experiments.count || 0,
        visits: visits.count || 0,
        messages: messages.count || 0,
        testimonials: testimonials.count || 0,
        logos: logos.count || 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
    { label: "Experiments", value: stats.experiments, icon: FlaskConical, color: "text-accent-foreground" },
    { label: "Page Visits", value: stats.visits, icon: Eye, color: "text-primary" },
    { label: "Messages", value: stats.messages, icon: Mail, color: "text-destructive" },
    { label: "Testimonials", value: stats.testimonials, icon: MessageSquareQuote, color: "text-primary" },
    { label: "Logos", value: stats.logos, icon: School, color: "text-accent-foreground" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
