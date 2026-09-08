import React, { useState, useEffect } from 'react';
import { appointmentsApi, barbersApi, servicesApi, formatPrice } from '../../lib/storage';

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function getWeekDates(baseDate) {
  const d = new Date(baseDate + 'T12:00:00');
  const day = d.getDay();
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const nd = new Date(d);
    nd.setDate(d.getDate() - day + i);
    dates.push(nd.toISOString().split('T')[0]);
  }
  return dates;
}

const STATUS_COLORS = {
  scheduled: 'bg-brand-yellow/15 border-brand-yellow/30 text-brand-yellow',
  completed: 'bg-green-500/15 border-green-500/30 text-green-300',
  cancelled: 'bg-neutral-800 border-neutral-700 text-neutral-600 line-through',
};

export default function WeekView() {
  const [baseDate, setBaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);

  const weekDates = getWeekDates(baseDate);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setBarbers(barbersApi.getAll());
    setServices(servicesApi.getAll());
    const all = weekDates.flatMap(d => appointmentsApi.getByDate(d));
    setAppointments(all);
  }, [baseDate]);

  const changeWeek = (delta) => {
    const d = new Date(baseDate + 'T12:00:00');
    d.setDate(d.getDate() + delta * 7);
    setBaseDate(d.toISOString().split('T')[0]);
  };

  const getService = (id) => services.find(s => s.id === id);
  const getBarber = (id) => barbers.find(b => b.id === id);

  return (
    <div className="space-y-4">
      {/* Week nav */}
      <div className="flex items-center gap-3">
        <button onClick={() => changeWeek(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-dark-700 border border-dark-500 text-neutral-400 hover:text-neutral-50 transition-all btn-press">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <p className="text-sm font-medium text-neutral-300">
          {weekDates[0]} — {weekDates[6]}
        </p>
        <button onClick={() => changeWeek(1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-dark-700 border border-dark-500 text-neutral-400 hover:text-neutral-50 transition-all btn-press">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <button onClick={() => setBaseDate(today)} className="h-9 px-3 rounded-xl bg-dark-700 border border-dark-500 text-neutral-400 hover:text-neutral-200 text-sm transition-all btn-press">
          Hoje
        </button>
      </div>

      {/* Week grid (responsive scroll on mobile) */}
      <div className="overflow-x-auto pb-3 custom-scrollbar">
        <div className="min-w-[640px] grid grid-cols-7 gap-2">
        {weekDates.map((date, idx) => {
          const dayAppts = appointments.filter(a => a.date === date);
          const isToday = date === today;
          const [y, m, d] = date.split('-').map(Number);
          return (
            <div key={date} className="flex flex-col gap-1">
              {/* Day header */}
              <div className={`text-center py-2 rounded-xl ${isToday ? 'bg-brand-yellow/10 border border-brand-yellow/30' : ''}`}>
                <p className={`text-xs font-semibold ${isToday ? 'text-brand-yellow' : 'text-neutral-500'}`}>
                  {DAYS[idx]}
                </p>
                <p className={`text-base font-bold ${isToday ? 'text-brand-yellow' : 'text-neutral-300'}`}>
                  {d}
                </p>
                <p className="text-xs text-neutral-700">{MONTHS_SHORT[m-1]}</p>
              </div>

              {/* Appointments */}
              <div className="space-y-1 min-h-[60px]">
                {dayAppts.slice(0, 4).map(a => {
                  const service = getService(a.service_id);
                  const barber = getBarber(a.barber_id);
                  return (
                    <div
                      key={a.id}
                      title={`${a.start_time} — ${a.client_name}\n${service?.name}\n${barber?.name}`}
                      className={`p-1.5 rounded-lg border text-center cursor-default transition-all ${STATUS_COLORS[a.status] || STATUS_COLORS.scheduled}`}
                    >
                      <p className="text-xs font-bold">{a.start_time}</p>
                      <p className="text-xs truncate">{a.client_name.split(' ')[0]}</p>
                    </div>
                  );
                })}
                {dayAppts.length > 4 && (
                  <p className="text-center text-xs text-neutral-600">+{dayAppts.length - 4}</p>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-dark-800 rounded-2xl border border-dark-600 p-4">
        <p className="text-sm font-semibold text-neutral-300 mb-3">Resumo da semana</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-neutral-50">{appointments.filter(a => a.status !== 'cancelled').length}</p>
            <p className="text-xs text-neutral-600">Agendamentos</p>
          </div>
          <div>
            <p className="text-xl font-bold text-neutral-50">{appointments.filter(a => a.status === 'completed').length}</p>
            <p className="text-xs text-neutral-600">Concluídos</p>
          </div>
          <div>
            <p className="text-xl font-bold text-brand-yellow">
              {formatPrice(
                appointments
                  .filter(a => a.status !== 'cancelled')
                  .reduce((s, a) => s + (getService(a.service_id)?.price || 0), 0)
              )}
            </p>
            <p className="text-xs text-neutral-600">Receita</p>
          </div>
        </div>
      </div>
    </div>
  );
}
