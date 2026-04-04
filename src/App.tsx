import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

// ─── Dashboard Modules ─────────────────────────────────────────────────────────
import { userRoutes }    from "@/modules/user/routes";
import { orgRoutes }     from "@/modules/organisation/routes";
import { teacherRoutes } from "@/modules/teacher/routes";
import { studentRoutes } from "@/modules/student/routes";

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
  </div>
);

// ─── Public Pages ──────────────────────────────────────────────────────────────
const Index            = lazy(() => import("./pages/home/Index"));
const AboutUs          = lazy(() => import("./pages/about/AboutUs"));
const ComparePlans     = lazy(() => import("./pages/marketing/ComparePlans"));
const Simulations      = lazy(() => import("./pages/experiments/Simulations"));
const ContactUs        = lazy(() => import("./pages/support/ContactUs"));
const Demo             = lazy(() => import("./pages/marketing/Demo"));
const Art              = lazy(() => import("./pages/content/Art"));
const Projects         = lazy(() => import("./pages/projects/Projects"));
const ProjectDetail    = lazy(() => import("./pages/projects/ProjectDetail"));
const ExperimentDetail = lazy(() => import("./pages/experiments/ExperimentDetail"));
const Login            = lazy(() => import("./pages/auth/Login"));
const ResetPassword    = lazy(() => import("./pages/auth/ResetPassword"));
const NotFound         = lazy(() => import("./pages/NotFound"));
const WhyCseel         = lazy(() => import("./pages/marketing/WhyCseel"));
const ForEducators     = lazy(() => import("./pages/marketing/ForEducators"));
const ForStudents      = lazy(() => import("./pages/marketing/ForStudents"));
const ForInstitutions  = lazy(() => import("./pages/marketing/ForInstitutions"));
const OurStory         = lazy(() => import("./pages/about/OurStory"));
const Team             = lazy(() => import("./pages/about/Team"));
const Blog             = lazy(() => import("./pages/blog/Blog"));
const BlogDetail       = lazy(() => import("./pages/blog/BlogDetail"));
const Help             = lazy(() => import("./pages/support/Help"));
const GetSupport       = lazy(() => import("./pages/support/GetSupport"));
const Careers          = lazy(() => import("./pages/support/Careers"));
const Terms            = lazy(() => import("./pages/legal/Terms"));
const Privacy          = lazy(() => import("./pages/legal/Privacy"));
const Cart             = lazy(() => import("./pages/shop/Cart"));
const TeacherTraining  = lazy(() => import("./pages/marketing/TeacherTraining"));
const Workshops        = lazy(() => import("./pages/marketing/Workshops"));
const Research         = lazy(() => import("./pages/content/Research"));
const Materials        = lazy(() => import("./pages/shop/Materials"));
const Safety           = lazy(() => import("./pages/content/Safety"));
const MediaArchive     = lazy(() => import("./pages/content/MediaArchive"));
const EventsUpcoming   = lazy(() => import("./pages/events/EventsUpcoming"));
const EventsPast       = lazy(() => import("./pages/events/EventsPast"));
const EventDetail      = lazy(() => import("./pages/events/EventDetail"));
const Exhibitions      = lazy(() => import("./pages/events/Exhibitions"));
const UserProject         = lazy(() => import("./pages/user/UserProject"));
const FeedPage            = lazy(() => import("./pages/social/FeedPage"));
const PostDetailPage      = lazy(() => import("./pages/social/PostDetailPage"));
const ChannelsPage        = lazy(() => import("./pages/social/ChannelsPage"));
const ChannelDetailPage   = lazy(() => import("./pages/social/ChannelDetailPage"));
const DashboardRedirect = lazy(() => import("./pages/DashboardRedirect"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 10, retry: 1 } },
});

const AnimatedRoutes = () => (
  <AnimatePresence mode="wait">
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"                     element={<Index />} />
        <Route path="/about-us"             element={<AboutUs />} />
        <Route path="/compare-plans"        element={<ComparePlans />} />
        <Route path="/simulations"          element={<Simulations />} />
        <Route path="/hands-on-experiments" element={<Simulations />} />
        <Route path="/contact-us"           element={<ContactUs />} />
        <Route path="/demo"                 element={<Demo />} />
        <Route path="/art"                  element={<Art />} />
        <Route path="/projects"             element={<Projects />} />
        <Route path="/project/:id"          element={<ProjectDetail />} />
        <Route path="/experiment/:id"       element={<ExperimentDetail />} />
        <Route path="/login"                element={<Login />} />
        <Route path="/reset-password"       element={<ResetPassword />} />
        <Route path="/why-cseel"            element={<WhyCseel />} />
        <Route path="/for-educators"        element={<ForEducators />} />
        <Route path="/for-students"         element={<ForStudents />} />
        <Route path="/for-institutions"     element={<ForInstitutions />} />
        <Route path="/our-story"            element={<OurStory />} />
        <Route path="/team"                 element={<Team />} />
        <Route path="/blog"                 element={<Blog />} />
        <Route path="/blog/:slug"           element={<BlogDetail />} />
        <Route path="/help"                 element={<Help />} />
        <Route path="/get-support"          element={<GetSupport />} />
        <Route path="/careers"             element={<Careers />} />
        <Route path="/terms"               element={<Terms />} />
        <Route path="/privacy"             element={<Privacy />} />
        <Route path="/cart"                element={<Cart />} />
        <Route path="/teacher-training"    element={<TeacherTraining />} />
        <Route path="/workshops"           element={<Workshops />} />
        <Route path="/research"            element={<Research />} />
        <Route path="/materials"           element={<Materials />} />
        <Route path="/safety"             element={<Safety />} />
        <Route path="/media-archive"       element={<MediaArchive />} />
        <Route path="/events/upcoming"     element={<EventsUpcoming />} />
        <Route path="/events/past"         element={<EventsPast />} />
        <Route path="/events/:id"          element={<EventDetail />} />
        <Route path="/exhibitions"         element={<Exhibitions />} />

        {/* Standalone protected */}
        <Route path="/my-project/:id" element={<ProtectedRoute><UserProject /></ProtectedRoute>} />

        {/* Smart dashboard redirect */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

        {/* Dashboard Modules */}
        {userRoutes}
        {orgRoutes}
        {teacherRoutes}
        {studentRoutes}

        {/* Social / Community */}
        <Route path="/feed"              element={<FeedPage />} />
        <Route path="/feed/:id"          element={<PostDetailPage />} />
        <Route path="/channels"          element={<ChannelsPage />} />
        <Route path="/channels/:id"      element={<ChannelDetailPage />} />

        {/* Legacy redirects */}
        <Route path="/profile"       element={<Navigate to="/user/profile"    replace />} />
        <Route path="/settings"      element={<Navigate to="/user/settings"   replace />} />
        <Route path="/my-projects"   element={<Navigate to="/user/projects"   replace />} />
        <Route path="/my-selections" element={<Navigate to="/user/selections" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </AnimatePresence>
);

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
