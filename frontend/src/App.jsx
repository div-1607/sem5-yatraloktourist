import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LiveLocationProvider } from './context/LiveLocationContext';
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

// New Feature Module Pages
import GeofencingLivePage from './pages/GeofencingLivePage';
import RecommendationsHubPage from './pages/RecommendationsHubPage';
import CrowdSafetyForecastPage from './pages/CrowdSafetyForecastPage';
import AnalyticsIntelligencePage from './pages/AnalyticsIntelligencePage';
import AdminGeofenceManager from './pages/AdminGeofenceManager';

const AdminLayout = ({ children }) => {
  return (
    <div className="bg-black-deep text-slate-100 min-h-screen">
      {children}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <LiveLocationProvider>
        <Router>
        <div className="flex flex-col min-h-screen bg-black-deep text-slate-100 selection:bg-blue-electric selection:text-white">
          {/* Luxury Dark Glass Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(10, 31, 68, 0.88)',
                color: '#F8FAFC',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(59, 130, 246, 0.2)',
                fontSize: '13px',
                fontWeight: '600',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#050505',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#050505',
                },
              },
            }}
          />

          {/* Sticky Glass Navbar */}
          <Navbar />

          {/* Main Route Content */}
          <main className="flex-grow">
            <Routes>
              {/* Public & Feature Module Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/destinations" element={<DestinationsListPage />} />
              <Route path="/destinations/:id" element={<DestinationDetailsPage />} />
              <Route path="/crowd-safety" element={<CrowdSafetyForecastPage />} />
              <Route path="/crowd-indicator" element={<CrowdIndicatorPage />} />
              <Route path="/geofencing" element={<GeofencingLivePage />} />
              <Route path="/tracking" element={<GeofencingLivePage />} />
              <Route path="/recommendations" element={<RecommendationsHubPage />} />
              <Route path="/analytics" element={<AnalyticsIntelligencePage />} />

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
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Routes>
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path="/destinations" element={<AdminDestinations />} />
                        <Route path="/geofences" element={<AdminGeofenceManager />} />
                        <Route path="/users" element={<AdminUsers />} />
                        <Route path="/sos" element={<AdminSOS />} />
                        <Route path="/analytics" element={<AnalyticsIntelligencePage />} />
                      </Routes>
                    </AdminLayout>
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
      </LiveLocationProvider>
    </AuthProvider>
  );
}

export default App;
