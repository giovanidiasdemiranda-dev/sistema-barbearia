import React, { useState, useEffect } from 'react';
import { appointmentsApi, barbersApi, servicesApi, reviewsApi, formatDate, formatPrice } from '../../lib/storage';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';
import ReviewModal from '../ui/ReviewModal';

const STATUS_MAP = {
  scheduled: { label: 'Agendado', className: 'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20' },
  completed: { label: 'Concluído', className: 'bg-green-500/10 text-green-400 border border-green-500/20' },
  cancelled: { label: 'Cancelado', className: 'bg-red-500/10 text-red-400 border border-red-500/20' },
};

export default function DayView() {
  const { addToast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedBarberId, setSelectedBarberId] = useState('all');
  const [reviewAppt, setReviewAppt] = useState(null);

  const load = () => {
    const allBarbers = barbersApi.getAll();
    const allServices = servicesApi.getAll();
    const appts = appointmentsApi.getByDate(date);
    setBarbers(allBarbers);
    setServices(allServices);
    setAppointments(appts);
  };

  useEffect(() => {
    load();
    const handleUpdate = () => load();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('tlbc_storage_update', handleUpdate);
    const interval = setInterval(load, 2000);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('tlbc_storage_update', handleUpdate);
      clearInterval(interval);
    };
  }, [date]);

  const filtered = selectedBarberId === 'all'
    ? appointments
    : appointments.filter(a => a.barber_id === selectedBarberId);

  const sorted = [...filtered].sort((a, b) => a.start_time.localeCompare(b.start_time));

  const getBarber = (id) => barbers.find(b => b.id === id);
  const getService = (id) => services.find(s => s.id === id);

  const handleCancel = (id) => {
    if (!window.confirm('Cancelar este agendamento?')) return;
    appointmentsApi.cancel(id);
    addToast('Agendamento cancelado', 'info');
    load();
  };

  const handleCompleteClick = (appt) => {
    setReviewAppt(appt);
  };

  const handleReviewSubmit = ({ rating, text }) => {
    // 1. Create the review
    const barber = getBarber(reviewAppt.barber_id);
    reviewsApi.create({
      name: reviewAppt.client_name,
      role: 'Cliente verificado', // Could be dynamic, but let's default for now
      text: text,
      rating: rating,
      barber_name: barber?.name,
      appointment_id: reviewAppt.id
    });

    // 2. Mark appointment as completed
    appointmentsApi.update(reviewAppt.id, { status: 'completed' });
    
    addToast('Atendimento concluído e avaliação salva!', 'success');
    setReviewAppt(null);
    load();
  };

  const stats = {
    total: filtered.length,
    revenue: filtered.filter(a => a.status === 'scheduled' || a.status === 'completed')
      .reduce((sum, a) => sum + (getService(a.service_id)?.price || 0), 0),
  };

  const changeDate = (days) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-5">
      {/* Date nav */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => changeDate(-1)} aria-label="Dia anterior" className="w-9 h-9 flex items-center justify-center rounded-xl bg-dark-700 border border-dark-500 text-neutral-400 hover:text-neutral-50 hover:border-dark-400 transition-all btn-press">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="h-9 px-3 rounded-xl bg-dark-700 border border-dark-500 text-neutral-200 text-sm focus:outline-none focus:border-brand-yellow"
          />
          <button onClick={() => changeDate(1)} aria-label="Próximo dia" className="w-9 h-9 flex items-center justify-center rounded-xl bg-dark-700 border border-dark-500 text-neutral-400 hover:text-neutral-50 hover:border-dark-400 transition-all btn-press">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button onClick={() => setDate(new Date().toISOString().split('T')[0])} className="h-9 px-3 rounded-xl bg-dark-700 border border-dark-500 text-neutral-400 hover:text-neutral-200 text-sm transition-all btn-press">
            Hoje
          </button>
        </div>

        {/* Barber filter */}
        <select
          value={selectedBarberId}
          onChange={e => setSelectedBarberId(e.target.value)}
          className="h-9 px-3 rounded-xl bg-dark-700 border border-dark-500 text-neutral-200 text-sm focus:outline-none focus:border-brand-yellow"
        >
          <option value="all">Todos os barbeiros</option>
          {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Agendamentos" value={stats.total} icon="📅" />
        <StatCard label="Receita prevista" value={formatPrice(stats.revenue)} icon="💰" />
      </div>

      {/* Appointments */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-dark-800 rounded-2xl border border-dark-600">
          <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <p className="text-neutral-500 font-medium">Nenhum agendamento</p>
          <p className="text-sm text-neutral-700 mt-1">para {formatDate(date)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(a => {
            const barber = getBarber(a.barber_id);
            const service = getService(a.service_id);
            const statusInfo = STATUS_MAP[a.status] || STATUS_MAP.scheduled;
            return (
              <div
                key={a.id}
                className={`bg-dark-800 rounded-2xl border border-dark-600 p-4 card-hover ${a.status === 'cancelled' ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {/* Time */}
                    <div className="text-center shrink-0">
                      <p className="text-lg font-bold text-brand-yellow font-mono">{a.start_time}</p>
                      <p className="text-xs text-neutral-600">{a.end_time}</p>
                    </div>
                    {/* Divider */}
                    <div className="w-px h-10 bg-dark-500" />
                    {/* Info */}
                    <div>
                      <p className="font-semibold text-neutral-50">{a.client_name}</p>
                      <p className="text-sm text-neutral-400">{service?.name} · {barber?.name}</p>
                      <p className="text-sm text-neutral-600 font-mono">{a.client_phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-sm font-bold text-neutral-200">{formatPrice(service?.price)}</span>
                  </div>
                </div>

                {a.status === 'scheduled' && (
                  <div className="flex gap-2 pt-3 border-t border-dark-600">
                    <button
                      onClick={() => handleCompleteClick(a)}
                      className="flex-1 h-9 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold hover:bg-green-500/20 transition-all btn-press"
                    >
                      ✓ Concluído
                    </button>
                    <button
                      onClick={() => handleCancel(a.id)}
                      className="flex-1 h-9 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-all btn-press"
                    >
                      × Cancelar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Avaliação */}
      {reviewAppt && (
        <ReviewModal
          isOpen={!!reviewAppt}
          onClose={() => setReviewAppt(null)}
          onSubmit={handleReviewSubmit}
          clientName={reviewAppt.client_name}
          barberName={getBarber(reviewAppt.barber_id)?.name}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-dark-800 rounded-2xl border border-dark-600 p-4">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-neutral-50">{value}</p>
    </div>
  );
}
