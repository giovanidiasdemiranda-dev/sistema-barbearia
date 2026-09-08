import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import BookingPage from './pages/BookingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { initStorage } from './lib/storage';

// Initialize localStorage with seed data
initStorage();

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Public booking */}
          <Route path="/" element={<BookingPage />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminRoute />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

function AdminRoute() {
  const isAuth = localStorage.getItem('tlbc_admin_auth') === 'true';
  if (!isAuth) return <Navigate to="/admin/login" replace />;
  return <AdminDashboard />;
}
