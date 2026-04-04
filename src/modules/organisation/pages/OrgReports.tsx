import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

const COLORS = ["hsl(207,90%,40%)", "hsl(207,90%,55%)", "hsl(207,90%,70%)", "hsl(0,80%,60%)", "hsl(140,60%,45%)"];

const OrgReports = () => {
  const [bySubject, setBySubject] = useState<{ subject: string; count: number }[]>([]);
  const [submissionsByMonth, setSubmissionsByMonth] = useState<any[]>([]);
  const [roleBreakdown, setRoleBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [expsRes, subsRes, rolesRes] = await Promise.all([
        supabase.from("experiments").select("subject").eq("is_active", true),
        supabase.from("submissions").select("submitted_at"),
        supabase.from("user_roles").select("role"),
      ]);

      // Experiments by subject
      if (expsRes.data) {
        const counts: Record<string, number> = {};
        expsRes.data.forEach(e => { counts[e.subject] = (counts[e.subject] || 0) + 1; });
        setBySubject(Object.entries(counts).map(([subject, count]) => ({ subject, count })).sort((a, b) => b.count - a.count).slice(0, 8));
      }

      // Submissions by month (last 6 months)
      if (subsRes.data) {
        const now = new Date();
        const months: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months[d.toLocaleString("default", { month: "short" })] = 0;
        }
        subsRes.data.forEach(s => {
          if (!s.submitted_at) return;
          const d = new Date(s.submitted_at);
          const monthKey = d.toLocaleString("default", { month: "short" });
          if (monthKey in months) months[monthKey]++;
        });
        setSubmissionsByMonth(Object.entries(months).map(([month, count]) => ({ month, count })));
      }

      // Role breakdown
      if (rolesRes.data) {
        const counts: Record<string, number> = {};
        rolesRes.data.forEach(r => { counts[r.role] = (counts[r.role] || 0) + 1; });
        setRoleBreakdown(Object.entries(counts).map(([name, value]) => ({ name, value })));
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-20 text-muted-foreground text-sm">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Organisation-wide analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Experiments by Subject</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bySubject} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(207,90%,40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Submissions (Last 6 Months)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={submissionsByMonth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(140,60%,40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">User Role Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-6">
            <PieChart width={160} height={160}>
              <Pie data={roleBreakdown} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value">
                {roleBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
            <div className="space-y-2">
              {roleBreakdown.map((r, i) => (
                <div key={r.name} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-foreground capitalize font-medium">{r.name}</span>
                  <span className="text-muted-foreground ml-auto">{r.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrgReports;
