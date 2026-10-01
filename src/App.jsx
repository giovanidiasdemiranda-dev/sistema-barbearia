import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import BookingPage from './pages/BookingPage';
import AdminLogin from './pages/AdminLogin';
import { initStorage, initFirebaseSync, refreshData, loadAdminData } from './lib/storage';
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Initialize localStorage with seed data

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    initStorage();
    let active = true;
    refreshData().catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setReady(true); });
    const stop = initFirebaseSync();
    return () => { active = false; stop(); };
  }, []);
  if (!ready) return <div className="min-h-dvh bg-dark-950 text-neutral-300 grid place-items-center">Carregando a barbearia…</div>;
  return (
    <BrowserRouter>
      <ToastProvider>
        {error && <div role="alert" className="fixed bottom-0 inset-x-0 z-[70] bg-amber-950 text-amber-100 text-sm px-4 py-3 text-center">{error} <button className="underline ml-2" onClick={() => window.location.reload()}>Tentar novamente</button></div>}
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
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    loadAdminData().then(() => { if (active) setState('ready'); }).catch(err => {
      if (active) { setError(err.message); setState(err.status === 401 ? 'unauthorized' : 'error'); }
    });
    const expired = () => setState('unauthorized');
    window.addEventListener('tlbc_session_expired', expired);
    return () => { active = false; window.removeEventListener('tlbc_session_expired', expired); };
  }, []);
  if (state === 'unauthorized') return <Navigate to="/admin/login" replace />;
  if (state === 'error') return <div className="p-8 text-neutral-100" role="alert">{error} <button onClick={() => window.location.reload()} className="underline">Tentar novamente</button></div>;
  if (state === 'loading') return <div className="p-8 text-neutral-300">Verificando acesso…</div>;
  return <Suspense fallback={<div className="p-8 text-neutral-300">Carregando painel…</div>}><AdminDashboard /></Suspense>;
}

