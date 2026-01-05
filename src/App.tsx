import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import Layout from './components/common/Layout';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-nexus-black text-nexus-green">Loading...</div>;

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes (No Navbar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Main Layout Routes */}
        <Route element={<Layout />}>
          {/* Public Pages */}
          <Route path="/" element={
            <div className="container mx-auto py-20 text-center text-nexus-white">
              <h1 className="text-4xl font-bold mb-4">Welcome to Nexus <span className="text-nexus-green">4D</span></h1>
              <p className="text-gray-400">Your journey to excellence starts here.</p>
            </div>
          } />

          {/* Protected Pages */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div className="text-white p-8">Dashboard Placeholder</div>} />
            <Route path="/my-courses" element={<div className="text-white p-8">My Courses Placeholder</div>} />
          </Route>

          {/* Placeholders for PRD Links */}
          <Route path="/courses" element={<div className="text-white p-8">Courses Placeholder</div>} />
          <Route path="/about" element={<div className="text-white p-8">About Us Placeholder</div>} />
          <Route path="/contact" element={<div className="text-white p-8">Contact Us Placeholder</div>} />
          <Route path="/tutor-application" element={<div className="text-white p-8">Become a Tutor Placeholder</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
