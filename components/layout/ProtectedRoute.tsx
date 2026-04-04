import { useAuth, AppRole } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
}

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading, rolesLoading, roles } = useAuth();

  // Wait for both auth AND roles to load — prevents race condition
  if (loading || rolesLoading) return <Spinner />;

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Role check — redirect to their correct dashboard
  if (requiredRole && !roles.includes(requiredRole)) {
    if (roles.includes("organisation")) return <Navigate to="/org"     replace />;
    if (roles.includes("teacher"))      return <Navigate to="/teacher" replace />;
    if (roles.includes("student"))      return <Navigate to="/student" replace />;
    return <Navigate to="/user" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
