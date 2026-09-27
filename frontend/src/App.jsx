import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingSOS from './components/FloatingSOS';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DestinationsListPage from './pages/DestinationsListPage';
import DestinationDetailsPage from './pages/DestinationDetailsPage';
import CrowdIndicatorPage from './pages/CrowdIndicatorPage';
import TouristDashboard from './pages/TouristDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminDestinations from './pages/AdminDestinations';
import AdminUsers from './pages/AdminUsers';
import AdminSOS from './pages/AdminSOS';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-navy-950 text-slate-100 selection:bg-amber-500 selection:text-navy-950">
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#06122B',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                fontSize: '12px',
                fontWeight: '600',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#06122B',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#06122B',
                },
              },
            }}
          />

          {/* Sticky Glass Navbar */}
          <Navbar />

          {/* Main Route Content */}
          <main className="flex-grow">
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/destinations" element={<DestinationsListPage />} />
              <Route path="/destinations/:id" element={<DestinationDetailsPage />} />
              <Route path="/crowd-safety" element={<CrowdIndicatorPage />} />

              {/* Tourist Protected Pages */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <TouristDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Pages */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/destinations"
                element={
                  <AdminRoute>
                    <AdminDestinations />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/sos"
                element={
                  <AdminRoute>
                    <AdminSOS />
                  </AdminRoute>
                }
              />
            </Routes>
          </main>

          {/* Global Floating SOS Emergency Trigger */}
          <FloatingSOS />

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
