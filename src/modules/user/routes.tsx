import { lazy } from "react";
import { Route } from "react-router-dom";
import UserLayout from "./UserLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

const UserDashboard  = lazy(() => import("./pages/UserDashboard"));
const UserProfile    = lazy(() => import("./pages/UserProfile"));
const UserProjects   = lazy(() => import("./pages/UserProjects"));
const UserSelections = lazy(() => import("./pages/UserSelections"));
const UserSettings   = lazy(() => import("./pages/UserSettings"));

export const userRoutes = (
  <Route
    path="/user"
    element={<ProtectedRoute><UserLayout /></ProtectedRoute>}
  >
    <Route index             element={<UserDashboard />} />
    <Route path="profile"    element={<UserProfile />} />
    <Route path="projects"   element={<UserProjects />} />
    <Route path="selections" element={<UserSelections />} />
    <Route path="settings"   element={<UserSettings />} />
  </Route>
);
