import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, BookmarkCheck, FlaskConical, ArrowRight, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, experiments: 0 });
  const [profile, setProfile] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, projectsRes, expsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_projects").select("id, title, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
        supabase.from("experiments").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (projectsRes.data) {
        setRecentProjects(projectsRes.data);
        setStats(s => ({ ...s, projects: projectsRes.data.length }));
      }
      setStats(s => ({ ...s, experiments: expsRes.count || 0 }));
    };
    fetchData();
  }, [user]);

  const initials = (profile?.display_name || user?.email || "U").slice(0, 2).toUpperCase();
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    { label: "My Projects",    value: stats.projects,    icon: FolderOpen,    to: "/user/projects",    color: "text-blue-600",  bg: "bg-blue-50"  },
    { label: "Lab Experiments", value: stats.experiments, icon: FlaskConical, to: "/simulations",       color: "text-green-600", bg: "bg-green-50" },
  ];

  const statusColor: Record<string, string> = {
    active:    "bg-green-100 text-green-700",
    completed: "bg-blue-100  text-blue-700",
    paused:    "bg-gray-100  text-gray-600",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6 flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/30">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-foreground">{greeting()}, {profile?.display_name || "there"}!</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
          <Link to="/user/profile" className="ml-auto">
            <Button variant="outline" size="sm" className="gap-1"><User className="h-3.5 w-3.5" /> Edit Profile</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statCards.map((c) => (
          <Link key={c.to} to={c.to}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${c.bg}`}>
                  <c.icon className={`h-6 w-6 ${c.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{c.value}</p>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/user/selections">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <BookmarkCheck className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-foreground">My Selections</p>
                <p className="text-xs text-muted-foreground">Saved experiments</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/simulations">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-foreground">Browse Experiments</p>
                <p className="text-xs text-muted-foreground">Explore science labs</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/user/settings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <User className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-foreground">Account Settings</p>
                <p className="text-xs text-muted-foreground">Password & preferences</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Projects</CardTitle>
            <Link to="/user/projects">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">View all <ArrowRight className="h-3 w-3" /></Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentProjects.map((p) => (
                <Link key={p.id} to={`/my-project/${p.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors">
                  <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground flex-1 truncate">{p.title}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[p.status] || "bg-gray-100 text-gray-600"}`}>
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;
