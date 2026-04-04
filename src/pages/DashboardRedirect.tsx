import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
  </div>
);

const DashboardRedirect = () => {
  const { roles, loading, rolesLoading } = useAuth();
  if (loading || rolesLoading) return <Spinner />;
  if (roles.includes("organisation")) return <Navigate to="/org"     replace />;
  if (roles.includes("teacher"))      return <Navigate to="/teacher" replace />;
  if (roles.includes("student"))      return <Navigate to="/student" replace />;
  return <Navigate to="/user" replace />;
};

export default DashboardRedirect;
