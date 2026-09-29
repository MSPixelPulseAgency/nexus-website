import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingHelp from "./components/FloatingHelp";
import GuidancePrompt from "./components/GuidancePrompt";
import ScrollManager from "./components/ScrollManager";
import { CartProvider } from "./context/CartContext";
import HomePage from "./pages/HomePage";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage"));
const CourseOutlinePage = lazy(() => import("./pages/CourseOutlinePage"));
const ResourceGuidePage = lazy(() => import("./pages/ResourceGuidePage"));
const AdmissionsPage = lazy(() => import("./pages/AdmissionsPage"));
const StudentSupportPage = lazy(() => import("./pages/StudentSupportPage"));
const OnlineLearningPage = lazy(() => import("./pages/OnlineLearningPage"));
const AcademicPlanningPage = lazy(() => import("./pages/AcademicPlanningPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const InquiryPage = lazy(() => import("./pages/InquiryPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const PathwayPage = lazy(() => import("./pages/PathwayPage"));
const VideosPage = lazy(() => import("./pages/VideosPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const BrandGuidelinesPage = lazy(() => import("./pages/BrandGuidelinesPage"));

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollManager />
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Header />
        <main id="main-content" tabIndex="-1">
        <Suspense fallback={<div className="route-loader" role="status" aria-live="polite"><span className="route-loader-bar" aria-hidden="true" /><div className="route-loader-shell" aria-hidden="true"><span /><span /><span /></div><strong>Loading Nexus page…</strong></div>}>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/team" element={<TeamPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/grade-9" element={<CoursesPage gradeOverride="9" />} />
          <Route path="/courses/grade-10" element={<CoursesPage gradeOverride="10" />} />
          <Route path="/courses/grade-11" element={<CoursesPage gradeOverride="11" />} />
          <Route path="/courses/grade-12" element={<CoursesPage gradeOverride="12" />} />
          <Route path="/courses/:slug/outline" element={<CourseOutlinePage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/student-support" element={<StudentSupportPage />} />
          <Route path="/online-learning" element={<OnlineLearningPage />} />
          <Route path="/academic-planning" element={<AcademicPlanningPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/inquiry" element={<InquiryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/enroll" element={<RegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/checkout" element={<RegisterPage />} />
          <Route path="/credit-recovery" element={<PathwayPage slug="credit-recovery" />} />
          <Route path="/upgrade-courses" element={<PathwayPage slug="upgrade-courses" />} />
          <Route path="/adult-education" element={<PathwayPage slug="adult-education" />} />
          <Route path="/mature-students" element={<PathwayPage slug="mature-students" />} />
          <Route path="/ossd" element={<PathwayPage slug="ossd" />} />
          <Route path="/ouac" element={<PathwayPage slug="ouac" />} />
          <Route path="/ocas" element={<PathwayPage slug="ocas" />} />
          <Route path="/student-resources/videos" element={<VideosPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/understanding-course-codes" element={<ResourceGuidePage slug="understanding-course-codes" />} />
          <Route path="/ossd-requirements" element={<PathwayPage slug="ossd" />} />
          <Route path="/university-planning" element={<ResourceGuidePage slug="university-planning" />} />
          <Route path="/college-planning" element={<ResourceGuidePage slug="college-planning" />} />
          <Route path="/parent-guardian-guide" element={<ResourceGuidePage slug="parent-guardian-guide" />} />
          <Route path="/why-nexus" element={<AboutPage />} />
          <Route path="/brand-guidelines" element={<BrandGuidelinesPage />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/accessibility" element={<LegalPage type="accessibility" />} />
          <Route path="/policies" element={<LegalPage type="policies" />} />
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        </main>
        <GuidancePrompt />
        <FloatingHelp />
        <Footer />
      </CartProvider>
    </BrowserRouter>
  );
}
