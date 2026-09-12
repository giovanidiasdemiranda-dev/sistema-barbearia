import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar, { BottomNav } from '../components/admin/Sidebar';
import DayView from '../components/admin/DayView';
import WeekView from '../components/admin/WeekView';
import BarberManager from '../components/admin/BarberManager';
import ServiceManager from '../components/admin/ServiceManager';
import ScheduleManager from '../components/admin/ScheduleManager';
import AppointmentList from '../components/admin/AppointmentList';
import ReviewManager from '../components/admin/ReviewManager';
import AdminFinance from './AdminFinance';

const SECTION_TITLES = {
  hoje:       { title: 'Agenda do Dia',   subtitle: 'Visualize os agendamentos de hoje' },
  semana:     { title: 'Agenda Semanal',  subtitle: 'Visão geral da semana' },
  financeiro: { title: 'Financeiro',      subtitle: 'Controle de faturamento semanal' },
  barbeiros:  { title: 'Barbeiros',       subtitle: 'Gerencie sua equipe' },
  servicos:   { title: 'Serviços',        subtitle: 'Catálogo de serviços e preços' },
  horarios:   { title: 'Horários',        subtitle: 'Configure horários de funcionamento e folgas' },
  clientes:   { title: 'Clientes',        subtitle: 'Pesquise clientes e gerencie agendamentos' },
  avaliacoes: { title: 'Avaliações',      subtitle: 'Gerencie os depoimentos dos clientes' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('hoje');

  // Auth guard
  useEffect(() => {
    if (localStorage.getItem('tlbc_admin_auth') !== 'true') {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  // Detect current section from URL path
  useEffect(() => {
    const path = window.location.pathname.split('/admin/')[1] || 'hoje';
    setCurrentSection(path);
  });

  const section = SECTION_TITLES[currentSection] || SECTION_TITLES.hoje;

  return (
    <div className="min-h-dvh flex bg-dark-900">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile drawer */}
      {drawerOpen && <Sidebar onClose={() => setDrawerOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass border-b border-dark-600">
          <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-50 hover:bg-dark-700 transition-all btn-press"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/>
              </svg>
            </button>

            {/* Logo (mobile) */}
            <img src="/logo.png" alt="The Latin Barber's Club" className="h-8 w-auto lg:hidden" />

            {/* Page title */}
            <div className="hidden lg:block">
              <h1 className="text-base font-semibold text-neutral-50">{section.title}</h1>
              <p className="text-xs text-neutral-500">{section.subtitle}</p>
            </div>

            <div className="flex-1" />

            {/* Today date */}
            <p className="text-sm text-neutral-500 hidden sm:block">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 lg:px-6 py-6 pb-24 lg:pb-6 overflow-auto">
          <Routes>
            <Route index element={<Navigate to="hoje" replace />} />
            <Route path="hoje"       element={<DayView />} />
            <Route path="semana"     element={<WeekView />} />
            <Route path="financeiro" element={<AdminFinance />} />
            <Route path="barbeiros"  element={<BarberManager />} />
            <Route path="servicos"   element={<ServiceManager />} />
            <Route path="horarios"   element={<ScheduleManager />} />
            <Route path="clientes"   element={<AppointmentList />} />
            <Route path="avaliacoes" element={<ReviewManager />} />
          </Routes>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav onOpenMenu={() => setDrawerOpen(true)} />
    </div>
  );
}
