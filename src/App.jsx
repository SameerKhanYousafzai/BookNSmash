import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import ForgotPassword from './pages/auth/ForgotPassword';

// Main Pages
import Home from './pages/Home';
import Matches from './pages/matches/Matches';
import CreateMatch from './pages/matches/CreateMatch';
import Events from './pages/events/Events';
import EventDetail from './pages/events/EventDetail';
import Venues from './pages/venues/Venues';
import VenueDetail from './pages/venues/VenueDetail';
import Community from './pages/community/Community';
import PlayerProfile from './pages/community/PlayerProfile';
import TeamProfile from './pages/community/TeamProfile';
import Shop from './pages/shop/Shop';
import ProductDetail from './pages/shop/ProductDetail';
import Sponsorship from './pages/Sponsorship';
import UserProfile from './pages/UserProfile';
import Unauthorized from './pages/Unauthorized';

// Admin Pages
import WeeklyDashboard from './pages/admin/WeeklyDashboard';
import MonthlyDashboard from './pages/admin/MonthlyDashboard';
import YearlyDashboard from './pages/admin/YearlyDashboard';

import './App.css';

/**
 * Main App Component
 * Implements complete routing with authentication and role-based access control
 * 
 * Route Structure:
 * - Public routes: Login, Register, Admin Login
 * - Protected routes: All user-facing pages (requires authentication)
 * - Admin routes: Dashboard pages (requires ADMIN role)
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes - No Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected User Routes - With Main Layout */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<UserProfile />} />

            {/* Matches */}
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/create" element={<CreateMatch />} />

            {/* Events */}
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />

            {/* Venues */}
            <Route path="/venues" element={<Venues />} />
            <Route path="/venues/:id" element={<VenueDetail />} />

            {/* Community */}
            <Route path="/community" element={<Community />} />
            <Route path="/community/player/:id" element={<PlayerProfile />} />
            <Route path="/community/team/:id" element={<TeamProfile />} />

            {/* Shop */}
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/product/:id" element={<ProductDetail />} />

            {/* Sponsorship */}
            <Route path="/sponsorship" element={<Sponsorship />} />
          </Route>

          {/* Admin Routes - With Admin Layout */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard/weekly" replace />} />
            <Route path="dashboard/weekly" element={<WeeklyDashboard />} />
            <Route path="dashboard/monthly" element={<MonthlyDashboard />} />
            <Route path="dashboard/yearly" element={<YearlyDashboard />} />
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
