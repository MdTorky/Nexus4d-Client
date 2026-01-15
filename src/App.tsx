import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import Layout from './components/common/Layout';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Courses from './pages/Courses';
import TutorApplication from './pages/TutorApplication';
import AdminDashboard from './pages/AdminDashboard';
import TutorDashboard from './pages/TutorDashboard';
import CourseEditor from './pages/CourseEditor';
import CourseDetail from './pages/CourseDetail';
import TutorProfile from './pages/TutorProfile';
import UserProfile from './pages/UserProfile';
import CoursePlayer from './pages/CoursePlayer';
import MyCourses from './pages/MyCourses';
import { FullScreenLoader } from './components/ui/Loader';
import Deactivated from './pages/Deactivated';
import AboutUs from './pages/AboutUs';

import ContactUs from './pages/ContactUs';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

// ... (existing imports)

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) return <FullScreenLoader />;

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

// Admin Route Wrapper
const AdminRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullScreenLoader />;

  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes (No Navbar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/deactivated" element={<Deactivated />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Main Layout Routes */}
        <Route element={<Layout />}>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/tutors/:id" element={<TutorProfile />} />
          <Route path="/users/:id" element={<UserProfile />} />

          {/* Protected Pages */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<div className="text-white p-8">Dashboard Placeholder</div>} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/tutor-application" element={<TutorApplication />} />

            {/* Tutors can VIEW course details (using same component but read-only mode logic can be inside) */}
            <Route path="/tutor/courses/:id/edit" element={<CourseEditor />} />

            {/* Course Player (Protected) */}
            <Route path="/courses/:id/learn" element={<CoursePlayer />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/courses/create" element={<CourseEditor />} />
            <Route path="/admin/courses/:id/edit" element={<CourseEditor />} />
          </Route>

          {/* Placeholders for PRD Links */}
          <Route path="/about" element={<AboutUs />} />

          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/tutor-dashboard" element={<TutorDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
