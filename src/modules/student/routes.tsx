import { lazy } from "react";
import { Route } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

const StudentDashboard   = lazy(() => import("./pages/StudentDashboard"));
const StudentExperiments = lazy(() => import("./pages/StudentExperiments"));
const StudentAssignments = lazy(() => import("./pages/StudentAssignments"));
const StudentScores      = lazy(() => import("./pages/StudentScores"));

export const studentRoutes = (
  <Route
    path="/student"
    element={<ProtectedRoute requiredRole="student"><StudentLayout /></ProtectedRoute>}
  >
    <Route index              element={<StudentDashboard />} />
    <Route path="experiments" element={<StudentExperiments />} />
    <Route path="assignments" element={<StudentAssignments />} />
    <Route path="scores"      element={<StudentScores />} />
  </Route>
);
