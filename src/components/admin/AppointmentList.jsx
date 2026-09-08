import React, { useState, useEffect } from 'react';
import { appointmentsApi, barbersApi, servicesApi, formatDate, formatPrice, formatPhone } from '../../lib/storage';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

const STATUS_MAP = {
  scheduled: { label: 'Agendado', className: 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20' },
  completed: { label: 'Concluído', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  cancelled: { label: 'Cancelado', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function AppointmentList() {
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [filterBarberId, setFilterBarberId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showCount, setShowCount] = useState(20);

  const load = () => {
    setBarbers(barbersApi.getAll());
    setServices(servicesApi.getAll());
    setAppointments(appointmentsApi.getAll());
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
  }, []);

  const getBarber = (id) => barbers.find(b => b.id === id);
  const getService = (id) => services.find(s => s.id === id);

  const filtered = appointments
    .filter(a => {
      if (filterBarberId !== 'all' && a.barber_id !== filterBarberId) return false;
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (filterDate && a.date !== filterDate) return false;
      if (searchPhone) {
        const q = searchPhone.replace(/\D/g, '');
        const p = a.client_phone.replace(/\D/g, '');
        if (!p.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const da = a.date + a.start_time;
      const db = b.date + b.start_time;
      return db.localeCompare(da); // newest first
    });

  const handleCancel = (id) => {
    if (!window.confirm('Cancelar este agendamento?')) return;
    appointmentsApi.cancel(id);
    addToast('Agendamento cancelado', 'info');
    load();
  };

  const handleComplete = (id) => {
    appointmentsApi.update(id, { status: 'completed' });
    addToast('Marcado como concluído', 'success');
    load();
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-dark-800 rounded-2xl border border-dark-600 p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="Buscar por WhatsApp..."
            value={searchPhone}
            onChange={e => setSearchPhone(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-dark-700 border border-dark-500 text-neutral-200 text-sm placeholder-neutral-600 focus:outline-none focus:border-brand-yellow"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select value={filterBarberId} onChange={e => setFilterBarberId(e.target.value)}
            className="h-9 px-3 rounded-xl bg-dark-700 border border-dark-500 text-neutral-200 text-sm focus:outline-none focus:border-brand-yellow">
            <option value="all">Todos os barbeiros</option>
            {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="h-9 px-3 rounded-xl bg-dark-700 border border-dark-500 text-neutral-200 text-sm focus:outline-none focus:border-brand-yellow">
            <option value="all">Todos os status</option>
            <option value="scheduled">Agendados</option>
            <option value="completed">Concluídos</option>
            <option value="cancelled">Cancelados</option>
          </select>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="h-9 px-3 rounded-xl bg-dark-700 border border-dark-500 text-neutral-200 text-sm focus:outline-none focus:border-brand-yellow" />
          {(filterBarberId !== 'all' || filterStatus !== 'all' || filterDate || searchPhone) && (
            <button onClick={() => { setFilterBarberId('all'); setFilterStatus('all'); setFilterDate(''); setSearchPhone(''); }}
              className="h-9 px-3 rounded-xl bg-dark-700 border border-dark-500 text-neutral-400 hover:text-neutral-200 text-sm transition-all btn-press">
              Limpar
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-neutral-500">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-dark-800 rounded-2xl border border-dark-600">
          <p className="text-neutral-500">Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.slice(0, showCount).map(a => {
              const barber = getBarber(a.barber_id);
              const service = getService(a.service_id);
              const statusInfo = STATUS_MAP[a.status] || STATUS_MAP.scheduled;
              return (
                <div key={a.id} className={`bg-dark-800 rounded-2xl border border-dark-600 p-4 ${a.status === 'cancelled' ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-neutral-50">{a.client_name}</p>
                      <p className="text-xs text-neutral-500 font-mono">{a.client_phone}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs font-bold text-brand-yellow bg-brand-yellow/10 px-2 py-0.5 rounded-full font-mono">
                        {a.booking_code}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-400">
                    <span>{a.date} · {a.start_time}</span>
                    <span>{service?.name}</span>
                    <span>{barber?.name}</span>
                    <span className="font-semibold text-neutral-300">{formatPrice(service?.price)}</span>
                  </div>
                  {a.status === 'scheduled' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-dark-600">
                      <button onClick={() => handleComplete(a.id)} className="flex-1 h-8 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold hover:bg-green-500/20 transition-all btn-press">
                        ✓ Concluído
                      </button>
                      <button onClick={() => handleCancel(a.id)} className="flex-1 h-8 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-all btn-press">
                        × Cancelar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {filtered.length > showCount && (
            <div className="text-center">
              <Button variant="secondary" onClick={() => setShowCount(c => c + 20)}>
                Carregar mais ({filtered.length - showCount} restantes)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
