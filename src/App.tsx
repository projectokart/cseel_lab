import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import AboutUs from "./pages/AboutUs";
import ComparePlans from "./pages/ComparePlans";
import Simulations from "./pages/Simulations";
import ContactUs from "./pages/ContactUs";
import Demo from "./pages/Demo";
import Art from "./pages/Art";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ExperimentDetail from "./pages/ExperimentDetail";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import WhyCseel from "./pages/WhyCseel";
import ForEducators from "./pages/ForEducators";
import ForStudents from "./pages/ForStudents";
import ForInstitutions from "./pages/ForInstitutions";
import OurStory from "./pages/OurStory";
import Team from "./pages/Team";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Help from "./pages/Help";
import GetSupport from "./pages/GetSupport";
import Careers from "./pages/Careers";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cart from "./pages/Cart";
import TeacherTraining from "./pages/TeacherTraining";
import Workshops from "./pages/Workshops";
import Research from "./pages/Research";
import Materials from "./pages/Materials";
import Safety from "./pages/Safety";
import MediaArchive from "./pages/MediaArchive";
import EventsUpcoming from "./pages/EventsUpcoming";
import EventsPast from "./pages/EventsPast";
import EventDetail from "./pages/EventDetail";
import Exhibitions from "./pages/Exhibitions";

// NEW
import UserProject from "./pages/UserProject";
import MySelections from "./pages/MySelections";
import MyProjectsPage from "./pages/MyProjectsPage";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminExperiments from "./pages/admin/AdminExperiments";
import AdminLogos from "./pages/admin/AdminLogos";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminContent from "./pages/admin/AdminContent";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminLabMaterials from "./pages/admin/AdminLabMaterials";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";

// Teacher
import TeacherLayout from "./pages/teacher/TeacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import TeacherProgress from "./pages/teacher/TeacherProgress";

// Student
import StudentLayout from "./pages/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentExperiments from "./pages/student/StudentExperiments";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentScores from "./pages/student/StudentScores";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<Index />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/compare-plans" element={<ComparePlans />} />
        <Route path="/simulations" element={<Simulations />} />
        <Route path="/hands-on-experiments" element={<Simulations />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/art" element={<Art />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/experiment/:id" element={<ExperimentDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/why-cseel" element={<WhyCseel />} />
        <Route path="/for-educators" element={<ForEducators />} />
        <Route path="/for-students" element={<ForStudents />} />
        <Route path="/for-institutions" element={<ForInstitutions />} />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/team" element={<Team />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/help" element={<Help />} />
        <Route path="/get-support" element={<GetSupport />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/teacher-training" element={<TeacherTraining />} />
        <Route path="/workshops" element={<Workshops />} />
        <Route path="/research" element={<Research />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/media-archive" element={<MediaArchive />} />
        <Route path="/events/upcoming" element={<EventsUpcoming />} />
        <Route path="/events/past" element={<EventsPast />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/exhibitions" element={<Exhibitions />} />

        {/* Protected */}
        <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/my-project/:id" element={<ProtectedRoute><UserProject /></ProtectedRoute>} />
        <Route path="/my-selections" element={<ProtectedRoute><MySelections /></ProtectedRoute>} />
        <Route path="/my-projects" element={<ProtectedRoute><MyProjectsPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="experiments"   element={<AdminExperiments />} />
          <Route path="logos"         element={<AdminLogos />} />
          <Route path="testimonials"  element={<AdminTestimonials />} />
          <Route path="users"         element={<AdminUsers />} />
          <Route path="analytics"     element={<AdminAnalytics />} />
          <Route path="messages"      element={<AdminMessages />} />
          <Route path="content"       element={<AdminContent />} />
          <Route path="blog"          element={<AdminBlog />} />
          <Route path="support"       element={<AdminSupport />} />
          <Route path="promotions"    element={<AdminPromotions />} />
          <Route path="vendors"       element={<AdminVendors />} />
          <Route path="lab-materials" element={<AdminLabMaterials />} />
          <Route path="orders"        element={<AdminOrders />} />
          <Route path="settings"      element={<AdminSettings />} />
        </Route>

        {/* Teacher */}
        <Route path="/teacher" element={<ProtectedRoute requiredRole="teacher"><TeacherLayout /></ProtectedRoute>}>
          <Route index element={<TeacherDashboard />} />
          <Route path="classes"     element={<TeacherClasses />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="progress"    element={<TeacherProgress />} />
        </Route>

        {/* Student */}
        <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentLayout /></ProtectedRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="experiments" element={<StudentExperiments />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="scores"      element={<StudentScores />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <AnimatedRoutes />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;