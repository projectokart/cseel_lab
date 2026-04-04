import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, Settings, HelpCircle, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ROLE_COLORS: Record<string, string> = {
  organisation: "bg-purple-100 text-purple-700",
  teacher:      "bg-blue-100 text-blue-700",
  student:      "bg-green-100 text-green-700",
  moderator:    "bg-orange-100 text-orange-700",
};

const ROLE_LABELS: Record<string, string> = {
  organisation: "Organisation",
  teacher:      "Teacher",
  student:      "Student",
  moderator:    "Moderator",
};

const TopBar = () => {
  const { user, isTeacher, isStudent, isOrganisation, signOut, roles } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const initials    = displayName.slice(0, 2).toUpperCase();
  const primaryRole = roles[0] || "user";

  const dashboardPath = isOrganisation
    ? "/org"
    : isTeacher
    ? "/teacher"
    : isStudent
    ? "/student"
    : "/user";

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="bg-topbar text-topbar-foreground text-xs md:text-sm border-b border-border/10 relative z-[600]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between md:justify-end items-center py-2 md:py-2.5 gap-2 md:gap-8">
          <Link to="/" className="flex-1 md:flex-none text-center hover:text-primary transition-colors whitespace-nowrap">Home</Link>
          <Link to="/feed" className="flex-1 md:flex-none text-center hover:text-primary transition-colors whitespace-nowrap">Community</Link>
          <Link to="/get-support" className="flex-1 md:flex-none text-center hover:text-primary transition-colors whitespace-nowrap">Get Support</Link>
          <Link to="/contact-us" className="flex-1 md:flex-none text-center hover:text-primary transition-colors whitespace-nowrap">Contact Us</Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none">
                <Avatar className="h-7 w-7 border border-primary-foreground/30">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline font-semibold max-w-[120px] truncate">{displayName}</span>
                <ChevronDown className="h-3 w-3 hidden md:inline" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${ROLE_COLORS[primaryRole] || "bg-gray-100 text-gray-600"}`}>
                    {ROLE_LABELS[primaryRole] || "User"}
                  </span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(dashboardPath)}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`${dashboardPath}/profile` === "/user/profile" ? "/user/profile" : dashboardPath)}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/help")}>
                  <HelpCircle className="mr-2 h-4 w-4" /> Help
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="flex-1 md:flex-none text-center md:text-right font-bold hover:text-primary transition-colors whitespace-nowrap">Login</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;