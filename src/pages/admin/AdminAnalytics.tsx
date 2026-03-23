import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(207, 90%, 30%)", "hsl(207, 90%, 50%)", "hsl(207, 90%, 70%)", "hsl(0, 84%, 60%)", "hsl(210, 40%, 60%)"];

const AdminAnalytics = () => {
  const [visitsByPage, setVisitsByPage] = useState<{ page: string; count: number }[]>([]);
  const [usersByRole, setUsersByRole] = useState<{ role: string; count: number }[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // Visits by page
      const { data: visits } = await supabase.from("page_visits").select("page");
      if (visits) {
        const pageCounts: Record<string, number> = {};
        visits.forEach((v) => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1; });
        setVisitsByPage(Object.entries(pageCounts).map(([page, count]) => ({ page, count })).sort((a, b) => b.count - a.count));
        setTotalVisits(visits.length);
      }

      // Users by role
      const { data: roles } = await supabase.from("user_roles").select("role");
      if (roles) {
        const roleCounts: Record<string, number> = {};
        roles.forEach((r) => { roleCounts[r.role] = (roleCounts[r.role] || 0) + 1; });
        setUsersByRole(Object.entries(roleCounts).map(([role, count]) => ({ role, count })));
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Page Visits</CardTitle></CardHeader>
          <CardContent>
            {visitsByPage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={visitsByPage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="page" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(207, 90%, 30%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No visit data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Users by Role</CardTitle></CardHeader>
          <CardContent>
            {usersByRole.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={usersByRole} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={100} label>
                    {usersByRole.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No role data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary-light">
                <div className="text-2xl font-bold text-primary">{totalVisits}</div>
                <div className="text-sm text-muted-foreground">Total Page Views</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary-light">
                <div className="text-2xl font-bold text-primary">{visitsByPage.length}</div>
                <div className="text-sm text-muted-foreground">Unique Pages</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary-light">
                <div className="text-2xl font-bold text-primary">{usersByRole.reduce((a, b) => a + b.count, 0)}</div>
                <div className="text-sm text-muted-foreground">Role Assignments</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary-light">
                <div className="text-2xl font-bold text-primary">{usersByRole.length}</div>
                <div className="text-sm text-muted-foreground">Active Roles</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
