import { lazy } from "react";
import { Route } from "react-router-dom";
import OrgLayout from "./OrgLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

const OrgDashboard = lazy(() => import("./pages/OrgDashboard"));
const OrgTeachers  = lazy(() => import("./pages/OrgTeachers"));
const OrgStudents  = lazy(() => import("./pages/OrgStudents"));
const OrgClasses   = lazy(() => import("./pages/OrgClasses"));
const OrgReports   = lazy(() => import("./pages/OrgReports"));
const OrgSettings  = lazy(() => import("./pages/OrgSettings"));

export const orgRoutes = (
  <Route
    path="/org"
    element={<ProtectedRoute requiredRole="organisation"><OrgLayout /></ProtectedRoute>}
  >
    <Route index            element={<OrgDashboard />} />
    <Route path="teachers"  element={<OrgTeachers />} />
    <Route path="students"  element={<OrgStudents />} />
    <Route path="classes"   element={<OrgClasses />} />
    <Route path="reports"   element={<OrgReports />} />
    <Route path="settings"  element={<OrgSettings />} />
  </Route>
);
