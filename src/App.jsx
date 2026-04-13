import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { authConfig } from './auth/authConfig';

// Pages
import Dashboard from './pages/Dashboard';
import TransactionReport from './pages/TransactionReport';
import QRPage from './pages/QRPage';
import LanguageUpdate from './pages/LanguageUpdate';
import HelpSupport from './pages/HelpSupport';
// import MerchantOnboarding from './pages/MerchantOnboarding';
import Callback from './pages/Callback';
import Layout from './components/layout/Layout';

// Mock Login Pages
import Landing from './pages/Landing';
import LoginMobile from './pages/LoginMobile';
import LoginVpa from './pages/LoginVpa';

// Auth Guard Component
const ProtectedRoute = ({ children }) => {
  const auth = useAuth();

  // Use mock Auth if it's set in localStorage
  const isMockAuth = localStorage.getItem('mockAuthenticated') === 'true';

  if (!isMockAuth) {
    if (auth.isLoading) {
      return <div className="flex items-center justify-center h-screen">Loading Auth...</div>;
    }

    if (auth.error) {
      return <div className="text-red-500 text-center mt-10">Oops... {auth.error.message}</div>;
    }

    if (!auth.isAuthenticated) {
      // Navigate to the custom pre-sign-in landing page instead of Authentik
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider {...authConfig}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login-mobile" element={<LoginMobile />} />
        <Route path="/login-vpa" element={<LoginVpa />} />

        <Route path="/callback" element={<Callback />} />
        <Route path="/sso/logout" element={<div>Logged out successfully.</div>} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<TransactionReport />} />
          <Route path="qr" element={<QRPage />} />
          {/* <Route path="onboarding" element={<MerchantOnboarding />} /> */}
          <Route path="language" element={<LanguageUpdate />} />
          <Route path="help" element={<HelpSupport />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
