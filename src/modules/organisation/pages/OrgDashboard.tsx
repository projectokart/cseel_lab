import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, TrendingUp, ArrowRight, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const OrgDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]             = useState({ teachers: 0, students: 0, classes: 0, submissions: 0 });
  const [recentClasses, setRecentClasses] = useState<any[]>([]);
  const [org, setOrg]                 = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Get org profile from organisations table
      const { data: orgData } = await supabase.from("organisations").select("*").eq("user_id", user.id).maybeSingle();
      if (orgData) setOrg(orgData);

      const [teachers, students, classes, submissions] = await Promise.all([
        supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
        supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("classes").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("submissions").select("id", { count: "exact", head: true }),
      ]);
      setStats({ teachers: teachers.count || 0, students: students.count || 0, classes: classes.count || 0, submissions: submissions.count || 0 });

      const { data: cls } = await supabase.from("classes").select("id, name, created_at, class_code").eq("is_active", true).order("created_at", { ascending: false }).limit(5);
      if (cls) setRecentClasses(cls);
    };
    fetchData();
  }, [user]);

  const statCards = [
    { label: "Teachers",    value: stats.teachers,    icon: GraduationCap, color: "text-blue-600",   bg: "bg-blue-50",   to: "/org/teachers" },
    { label: "Students",    value: stats.students,    icon: Users,         color: "text-green-600",  bg: "bg-green-50",  to: "/org/students" },
    { label: "Classes",     value: stats.classes,     icon: BookOpen,      color: "text-purple-600", bg: "bg-purple-50", to: "/org/classes"  },
    { label: "Submissions", value: stats.submissions, icon: TrendingUp,    color: "text-orange-600", bg: "bg-orange-50", to: "/org/reports"  },
  ];

  return (
    <div className="space-y-6">
      {/* Org info card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <h1 className="text-xl font-bold text-foreground">{org?.org_name || "Organisation Dashboard"}</h1>
          <div className="flex flex-wrap gap-4 mt-2">
            {org?.district && org?.state && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {org.district}, {org.state}
              </span>
            )}
            {org?.phone && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> {org.phone}
              </span>
            )}
            {org?.pincode && (
              <span className="text-sm text-muted-foreground">PIN: {org.pincode}</span>
            )}
          </div>
          {org?.address && <p className="text-xs text-muted-foreground mt-1">{org.address}</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <Link key={c.to} to={c.to}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${c.bg}`}>
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
                <p className="text-sm text-muted-foreground">{c.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Recent Classes</CardTitle>
          <Link to="/org/classes" className="flex items-center gap-1 text-xs text-primary hover:underline">View all <ArrowRight className="h-3 w-3" /></Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentClasses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No classes yet</p>
          ) : (
            <div className="divide-y divide-border">
              {recentClasses.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-6 py-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground flex-1">{c.name}</span>
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{c.class_code}</span>
                  <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgDashboard;
