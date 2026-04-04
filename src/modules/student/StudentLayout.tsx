import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, FlaskConical, ClipboardList, Trophy, LogOut, Menu, X, GraduationCap, Home } from "lucide-react";
import { useState } from "react";

const StudentLayout = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/student" },
    { label: "My Experiments", icon: FlaskConical, to: "/student/experiments" },
    { label: "Assignments", icon: ClipboardList, to: "/student/assignments" },
    { label: "Scores", icon: Trophy, to: "/student/scores" },
  ];

  const handleLogout = async () => { await signOut(); navigate("/login"); };

  return (
    <div className="min-h-screen flex bg-muted">
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link to="/student" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-primary">Student Panel</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
        </div>

        {/* Home button */}
        <div className="px-4 pt-3">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors w-full"
          >
            <Home className="h-4 w-4" /> Go to Homepage
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {items.map((item) => (
            <Link
              key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.to ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
            >
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 truncate">{user?.email}</p>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-destructive hover:underline"><LogOut className="h-4 w-4" /> Sign Out</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-background border-b border-border px-4 py-3 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></button>
          <span className="font-bold text-primary">Student Panel</span>
          <Link to="/" className="ml-auto flex items-center gap-1 text-xs text-primary font-medium hover:underline">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
};

export default StudentLayout;