import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ClipboardList, TrendingUp } from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ classes: 0, students: 0, assignments: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data: classes } = await supabase.from("classes").select("id").eq("teacher_id", user.id);
      const classIds = classes?.map((c) => c.id) || [];
      
      let students = 0;
      let assignments = 0;
      if (classIds.length > 0) {
        const { count: sc } = await supabase.from("class_enrollments").select("id", { count: "exact", head: true }).in("class_id", classIds);
        const { count: ac } = await supabase.from("assignments").select("id", { count: "exact", head: true }).eq("teacher_id", user.id);
        students = sc || 0;
        assignments = ac || 0;
      }
      setStats({ classes: classes?.length || 0, students, assignments });
    };
    fetchStats();
  }, [user]);

  const cards = [
    { label: "My Classes", value: stats.classes, icon: BookOpen },
    { label: "Total Students", value: stats.students, icon: Users },
    { label: "Assignments", value: stats.assignments, icon: ClipboardList },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-foreground">{c.value}</div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;
