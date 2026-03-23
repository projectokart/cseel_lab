import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, FlaskConical, Image, MessageSquareQuote,
  Users, BarChart3, Mail, LogOut, Menu, X, Settings, Home,
  FileText, HeadphonesIcon, Megaphone, Beaker, Building2, ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

const sidebarItems = [
  { label: "Dashboard",       icon: LayoutDashboard,    to: "/admin" },
  { label: "Experiments",     icon: FlaskConical,        to: "/admin/experiments" },
  { label: "Lab Materials",   icon: Beaker,              to: "/admin/lab-materials" },
  { label: "Vendors",         icon: Building2,           to: "/admin/vendors" },
  { label: "Orders",          icon: ShoppingBag,         to: "/admin/orders" },
  { label: "Blog",            icon: FileText,            to: "/admin/blog" },
  { label: "Support Tickets", icon: HeadphonesIcon,      to: "/admin/support" },
  { label: "Logos",           icon: Image,               to: "/admin/logos" },
  { label: "Testimonials",    icon: MessageSquareQuote,  to: "/admin/testimonials" },
  { label: "Users",           icon: Users,               to: "/admin/users" },
  { label: "Analytics",       icon: BarChart3,           to: "/admin/analytics" },
  { label: "Messages",        icon: Mail,                to: "/admin/messages" },
  { label: "Content",         icon: Settings,            to: "/admin/content" },
  { label: "Promotions",      icon: Megaphone,           to: "/admin/promotions" },
  { label: "Settings",        icon: SlidersHorizontal,   to: "/admin/settings" },
];

const AdminLayout = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await signOut(); navigate("/login"); };

  return (
    <div className="min-h-screen flex bg-muted">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="CSEEL" className="h-8 w-8" />
            <span className="font-bold text-primary">Admin Panel</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pt-3">
          <Link to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors w-full">
            <Home className="h-4 w-4" /> Go to Homepage
          </Link>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
          <p className="text-xs text-muted-foreground mb-2 truncate">{user?.email}</p>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-destructive hover:underline">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-background border-b border-border px-4 py-3 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-primary">CSEEL Admin</span>
          <Link to="/" className="ml-auto flex items-center gap-1 text-xs text-primary font-medium hover:underline">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;