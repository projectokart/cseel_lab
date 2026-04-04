import { lazy } from "react";
import { Route } from "react-router-dom";
import TeacherLayout from "./TeacherLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

const TeacherDashboard   = lazy(() => import("./pages/TeacherDashboard"));
const TeacherClasses     = lazy(() => import("./pages/TeacherClasses"));
const TeacherAssignments = lazy(() => import("./pages/TeacherAssignments"));
const TeacherProgress    = lazy(() => import("./pages/TeacherProgress"));

export const teacherRoutes = (
  <Route
    path="/teacher"
    element={<ProtectedRoute requiredRole="teacher"><TeacherLayout /></ProtectedRoute>}
  >
    <Route index              element={<TeacherDashboard />} />
    <Route path="classes"     element={<TeacherClasses />} />
    <Route path="assignments" element={<TeacherAssignments />} />
    <Route path="progress"    element={<TeacherProgress />} />
  </Route>
);
