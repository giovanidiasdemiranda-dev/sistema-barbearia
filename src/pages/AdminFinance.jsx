import React, { useState, useEffect, useMemo } from 'react';
import { appointmentsApi, shopsApi, barbersApi, servicesApi, formatPrice } from '../lib/storage';

// Helper: Get start (Sunday/Monday) and end of week
function getWeekRange(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay(); // 0 is Sunday
  // Adjust so week starts on Monday (1) or Sunday (0). Let's use Monday (1) to Sunday (0)
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  
  const start = new Date(d);
  start.setDate(d.getDate() + diffToMonday);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + i);
    days.push(dayDate.toISOString().split('T')[0]);
  }
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    days,
  };
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function AdminFinance() {
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Today reference
  const todayStr = new Date().toISOString().split('T')[0];
  const [currentBaseDate, setCurrentBaseDate] = useState(todayStr);

  // Week boundaries
  const weekInfo = useMemo(() => getWeekRange(currentBaseDate), [currentBaseDate]);

  // Month reference (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => todayStr.slice(0, 7));

  // Weekly & Monthly Goals (Stored or default)
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    return Number(localStorage.getItem('tlbc_weekly_goal')) || 4500;
  });
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    return Number(localStorage.getItem('tlbc_monthly_goal')) || 18000;
  });

  const [expandedDay, setExpandedDay] = useState(todayStr);

  useEffect(() => {
    setShops(shopsApi.getAll());
    loadAllAppointments();
  }, []);

  const loadAllAppointments = () => {
    setLoading(true);
    setTimeout(() => {
      const all = appointmentsApi.getAll().filter(a => a.status !== 'cancelled');
      setAppointments(all);
      setLoading(false);
    }, 250);
  };

  // Filtered by shop
  const shopAppointments = useMemo(() => {
    if (selectedShopId === 'all') return appointments;
    return appointments.filter(a => a.shop_id === selectedShopId);
  }, [appointments, selectedShopId]);

  // ─── WEEK VIEW CALCULATIONS ───────────────────────────────────────
  const weekAppointments = useMemo(() => {
    return shopAppointments.filter(a => a.date >= weekInfo.start && a.date <= weekInfo.end);
  }, [shopAppointments, weekInfo]);

  const weekRevenue = useMemo(() => {
    return weekAppointments.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  }, [weekAppointments]);

  const weekCompletedCount = useMemo(() => {
    return weekAppointments.filter(a => a.status === 'completed').length;
  }, [weekAppointments]);

  const weekProgressPercent = Math.min(100, Math.round((weekRevenue / (weeklyGoal || 1)) * 100));

  // Day by day breakdown for current week
  const weekDaysData = useMemo(() => {
    return weekInfo.days.map((dateStr, idx) => {
      const dayAppts = weekAppointments.filter(a => a.date === dateStr);
      const dayRevenue = dayAppts.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
      const dayCompleted = dayAppts.filter(a => a.status === 'completed').length;
      const isToday = dateStr === todayStr;
      const [, m, d] = dateStr.split('-');

      return {
        dateStr,
        dayName: WEEKDAY_NAMES[idx],
        dateFormatted: `${d}/${m}`,
        appointments: dayAppts,
        revenue: dayRevenue,
        count: dayAppts.length,
        completedCount: dayCompleted,
        isToday,
      };
    });
  }, [weekInfo, weekAppointments, todayStr]);

  // Barbers performance this week
  const weekBarbersData = useMemo(() => {
    const map = {};
    weekAppointments.forEach(a => {
      if (!map[a.barber_id]) {
        const barber = barbersApi.getById(a.barber_id);
        map[a.barber_id] = {
          id: a.barber_id,
          name: barber?.name || 'Barbeiro',
          photo_url: barber?.photo_url,
          revenue: 0,
          count: 0,
          completedCount: 0,
        };
      }
      map[a.barber_id].revenue += Number(a.price) || 0;
      map[a.barber_id].count += 1;
      if (a.status === 'completed') map[a.barber_id].completedCount += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [weekAppointments]);

  // ─── MONTH VIEW CALCULATIONS ──────────────────────────────────────
  const monthAppointments = useMemo(() => {
    return shopAppointments.filter(a => a.date && a.date.startsWith(selectedMonth));
  }, [shopAppointments, selectedMonth]);

  const monthRevenue = useMemo(() => {
    return monthAppointments.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  }, [monthAppointments]);

  const monthCompletedRevenue = useMemo(() => {
    return monthAppointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  }, [monthAppointments]);

  const monthProgressPercent = Math.min(100, Math.round((monthRevenue / (monthlyGoal || 1)) * 100));

  const monthTotalClients = monthAppointments.length;

  const monthAvgTicket = monthTotalClients > 0 ? monthRevenue / monthTotalClients : 0;

  // Month week-by-week breakdown (1 to 5)
  const monthWeeksBreakdown = useMemo(() => {
    const weeks = [
      { label: 'Semana 1 (01 a 07)', start: 1, end: 7, revenue: 0, count: 0 },
      { label: 'Semana 2 (08 a 14)', start: 8, end: 14, revenue: 0, count: 0 },
      { label: 'Semana 3 (15 a 21)', start: 15, end: 21, revenue: 0, count: 0 },
      { label: 'Semana 4 (22 a 28)', start: 22, end: 28, revenue: 0, count: 0 },
      { label: 'Semana 5 (29 a 31)', start: 29, end: 31, revenue: 0, count: 0 },
    ];

    monthAppointments.forEach(a => {
      const dayNum = parseInt(a.date.split('-')[2], 10);
      const w = weeks.find(item => dayNum >= item.start && dayNum <= item.end);
      if (w) {
        w.revenue += Number(a.price) || 0;
        w.count += 1;
      }
    });

    const maxRev = Math.max(...weeks.map(w => w.revenue), 1);
    return weeks.map(w => ({
      ...w,
      percent: Math.round((w.revenue / maxRev) * 100),
    }));
  }, [monthAppointments]);

  // Top services in month
  const monthServicesBreakdown = useMemo(() => {
    const map = {};
    monthAppointments.forEach(a => {
      if (!map[a.service_id]) {
        const svc = servicesApi.getById(a.service_id);
        map[a.service_id] = {
          name: svc?.name || 'Serviço',
          price: svc?.price || a.price,
          count: 0,
          revenue: 0,
        };
      }
      map[a.service_id].count += 1;
      map[a.service_id].revenue += Number(a.price) || 0;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [monthAppointments]);

  // Revenue by Shop (Sede Colômbia vs Filial Central)
  const monthShopsBreakdown = useMemo(() => {
    const map = {};
    monthAppointments.forEach(a => {
      const shopId = a.shop_id || 'shop-1';
      if (!map[shopId]) {
        const shop = shopsApi.getById(shopId);
        map[shopId] = {
          id: shopId,
          name: shop?.name || 'Unidade',
          revenue: 0,
          count: 0,
        };
      }
      map[shopId].revenue += Number(a.price) || 0;
      map[shopId].count += 1;
    });
    return Object.values(map);
  }, [monthAppointments]);

  // Barbers ranking for the month
  const monthBarbersData = useMemo(() => {
    const map = {};
    monthAppointments.forEach(a => {
      if (!map[a.barber_id]) {
        const barber = barbersApi.getById(a.barber_id);
        map[a.barber_id] = {
          id: a.barber_id,
          name: barber?.name || 'Barbeiro',
          photo_url: barber?.photo_url,
          revenue: 0,
          count: 0,
        };
      }
      map[a.barber_id].revenue += Number(a.price) || 0;
      map[a.barber_id].count += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [monthAppointments]);

  // ─── NAVIGATORS ──────────────────────────────────────────────────
  const changeWeek = (deltaWeeks) => {
    const d = new Date(currentBaseDate + 'T12:00:00');
    d.setDate(d.getDate() + deltaWeeks * 7);
    setCurrentBaseDate(d.toISOString().split('T')[0]);
  };

  const changeMonth = (deltaMonths) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + deltaMonths, 1);
    const newY = d.getFullYear();
    const newM = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  const selectedMonthDisplay = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return `${MONTH_NAMES[m - 1]} de ${y}`;
  }, [selectedMonth]);

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-6xl mx-auto page-enter pb-28">
      {/* ─── TOP HEADER ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Gestão Financeira & Metas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400">
            Acompanhe o faturamento mensal, planejamento semanal e metas da barbearia
          </p>
        </div>

        {/* Shop selector filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedShopId}
            onChange={e => setSelectedShopId(e.target.value)}
            className="w-full sm:w-auto h-11 px-4 rounded-xl bg-dark-800 border border-dark-600 text-sm font-semibold text-neutral-100 outline-none focus:border-brand-yellow cursor-pointer shadow-sm"
          >
            <option value="all">📍 Todas as Unidades</option>
            {shops.map(s => (
              <option key={s.id} value={s.id}>📍 {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── TAB SELECTOR (Planejamento Semanal vs Faturamento Mensal) ─ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-dark-800/80 p-1.5 rounded-2xl border border-dark-600/60">
        <div className="flex w-full sm:w-auto gap-1">
          <button
            onClick={() => setViewMode('week')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 btn-press ${
              viewMode === 'week'
                ? 'bg-brand-yellow text-dark-950 shadow-md font-black'
                : 'text-neutral-400 hover:text-white hover:bg-dark-700/50'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M7 14h10M7 18h10"/>
            </svg>
            Planejamento Semanal
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 btn-press ${
              viewMode === 'month'
                ? 'bg-brand-yellow text-dark-950 shadow-md font-black'
                : 'text-neutral-400 hover:text-white hover:bg-dark-700/50'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
            </svg>
            Faturamento do Mês
          </button>
        </div>

        {/* Date / Month Navigators */}
        {viewMode === 'week' ? (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => changeWeek(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-700 hover:bg-dark-600 text-neutral-300 transition-colors btn-press"
              aria-label="Semana anterior"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span className="text-xs sm:text-sm font-bold text-neutral-200 px-2 text-center">
              {weekInfo.start.split('-').reverse().slice(0,2).join('/')} a {weekInfo.end.split('-').reverse().slice(0,2).join('/')}
            </span>
            <button
              onClick={() => changeWeek(1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-700 hover:bg-dark-600 text-neutral-300 transition-colors btn-press"
              aria-label="Próxima semana"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button
              onClick={() => setCurrentBaseDate(todayStr)}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-dark-700 hover:bg-dark-600 text-brand-yellow transition-colors btn-press"
            >
              Hoje
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => changeMonth(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-700 hover:bg-dark-600 text-neutral-300 transition-colors btn-press"
              aria-label="Mês anterior"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span className="text-xs sm:text-sm font-bold text-neutral-200 px-3 text-center capitalize">
              {selectedMonthDisplay}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-700 hover:bg-dark-600 text-neutral-300 transition-colors btn-press"
              aria-label="Próximo mês"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-40 rounded-3xl" />
          <div className="skeleton h-64 rounded-3xl" />
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ─── TAB 1: PLANEJAMENTO SEMANAL ─────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {viewMode === 'week' && (
            <div className="space-y-6 animate-fade-in">
              {/* Main Weekly Revenue Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Hero Stat */}
                <div className="md:col-span-2 bg-gradient-to-br from-brand-yellow via-yellow-400 to-amber-500 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-glow-yellow-lg text-dark-950 flex flex-col justify-between min-h-[190px]">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-black uppercase tracking-widest text-dark-900/80 bg-dark-950/10 px-3 py-1 rounded-full">
                        Faturamento da Semana
                      </span>
                      <span className="text-xs font-bold text-dark-900/90">
                        {weekInfo.start.split('-').reverse().slice(0,2).join('/')} — {weekInfo.end.split('-').reverse().slice(0,2).join('/')}
                      </span>
                    </div>

                    <h2 className="text-4xl sm:text-5xl font-black text-dark-950 tabular-nums tracking-tighter my-2">
                      {formatPrice(weekRevenue)}
                    </h2>

                    {/* Weekly Goal Progress Bar */}
                    <div className="mt-4 bg-dark-950/15 p-3 rounded-2xl border border-dark-950/10">
                      <div className="flex items-center justify-between text-xs font-bold text-dark-900 mb-1.5">
                        <span>Meta Semanal: {formatPrice(weeklyGoal)}</span>
                        <span>{weekProgressPercent}% atingido</span>
                      </div>
                      <div className="w-full bg-dark-950/20 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-dark-950 h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${weekProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Decorative Icon Watermark */}
                  <svg className="absolute -bottom-10 -right-6 w-48 h-48 text-dark-950/10 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.2V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                  </svg>
                </div>

                {/* Sub KPI Stats */}
                <div className="flex flex-col gap-3">
                  <div className="flex-1 bg-dark-800 rounded-2xl border border-dark-600/60 p-5 flex flex-col justify-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Cortes na Semana</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-black text-white tabular-nums">{weekAppointments.length}</p>
                      <span className="text-xs font-semibold text-green-400">({weekCompletedCount} concluídos)</span>
                    </div>
                  </div>

                  <div className="flex-1 bg-dark-800 rounded-2xl border border-dark-600/60 p-5 flex flex-col justify-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Ticket Médio</p>
                    <p className="text-3xl font-black text-brand-yellow tabular-nums">
                      {formatPrice(weekAppointments.length > 0 ? weekRevenue / weekAppointments.length : 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── QUADRO DIÁRIO DO PLANEJAMENTO (Segunda a Domingo) ── */}
              <div className="bg-dark-800 rounded-3xl border border-dark-600/60 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                      <span>📅</span> Planejamento Diário da Semana
                    </h3>
                    <p className="text-xs text-neutral-400">Clique em um dia para ver os clientes agendados</p>
                  </div>
                </div>

                {/* 7 Days Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {weekDaysData.map(day => {
                    const isSelected = expandedDay === day.dateStr;
                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => setExpandedDay(day.dateStr)}
                        className={`text-left p-3.5 rounded-2xl border transition-all duration-200 btn-press flex flex-col justify-between ${
                          day.isToday
                            ? 'bg-brand-yellow/10 border-brand-yellow/60 shadow-[0_0_15px_rgba(252,209,22,0.15)]'
                            : isSelected
                            ? 'bg-dark-700 border-neutral-400'
                            : 'bg-dark-900/60 border-dark-600/50 hover:bg-dark-700/40 hover:border-dark-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-black uppercase ${day.isToday ? 'text-brand-yellow' : 'text-neutral-400'}`}>
                            {day.dayName}
                          </span>
                          {day.isToday && (
                            <span className="px-1.5 py-0.5 rounded bg-brand-yellow text-dark-950 font-black text-[10px] uppercase tracking-wider">
                              Hoje
                            </span>
                          )}
                        </div>

                        <p className="text-lg font-black text-white tabular-nums mb-1">
                          {day.dateFormatted}
                        </p>

                        <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                          <p className="text-xs font-bold text-brand-yellow tabular-nums">
                            {formatPrice(day.revenue)}
                          </p>
                          <p className="text-[11px] text-neutral-400 font-medium">
                            {day.count} {day.count === 1 ? 'corte' : 'cortes'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Day Details Drawer / Expansion */}
                {expandedDay && (
                  <div className="mt-6 pt-6 border-t border-dark-600/60 animate-fade-in">
                    {(() => {
                      const selectedDayData = weekDaysData.find(d => d.dateStr === expandedDay);
                      if (!selectedDayData) return null;

                      return (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
                              <span>Horários de</span>
                              <span className="text-brand-yellow font-black capitalize">
                                {selectedDayData.dayName}, {selectedDayData.dateFormatted}
                              </span>
                              <span className="text-xs bg-dark-700 text-neutral-300 px-2.5 py-0.5 rounded-full">
                                {selectedDayData.count} agendamento(s)
                              </span>
                            </h4>
                            <span className="text-sm font-black text-brand-yellow">
                              Total: {formatPrice(selectedDayData.revenue)}
                            </span>
                          </div>

                          {selectedDayData.appointments.length === 0 ? (
                            <div className="text-center py-6 text-neutral-500 text-sm bg-dark-900/40 rounded-2xl border border-dark-700/40">
                              Nenhum agendamento cadastrado para este dia.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {selectedDayData.appointments.map(a => {
                                const barber = barbersApi.getById(a.barber_id);
                                const svc = servicesApi.getById(a.service_id);
                                const isCompleted = a.status === 'completed';

                                return (
                                  <div
                                    key={a.id}
                                    className="p-3.5 rounded-2xl bg-dark-900/70 border border-dark-600/50 flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-10 h-10 rounded-xl bg-dark-800 border border-dark-600 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-xs font-black text-brand-yellow">{a.start_time}</span>
                                      </div>
                                      <div className="truncate">
                                        <p className="text-sm font-bold text-neutral-100 truncate">{a.client_name}</p>
                                        <p className="text-xs text-neutral-400 truncate">
                                          {svc?.name || 'Corte'} • {barber?.name?.split(' ')[0]}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="text-right shrink-0 ml-3">
                                      <p className="text-sm font-black text-brand-yellow tabular-nums">
                                        {formatPrice(a.price)}
                                      </p>
                                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        isCompleted ? 'bg-green-500/15 text-green-400' : 'bg-brand-yellow/15 text-brand-yellow'
                                      }`}>
                                        {isCompleted ? 'Feito' : 'Marcado'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* ─── DESEMPENHO DOS BARBEIROS NA SEMANA ────────────────── */}
              <div className="bg-dark-800 rounded-3xl border border-dark-600/60 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                    <span>💈</span> Faturamento por Barbeiro nesta Semana
                  </h3>
                  <span className="text-xs text-neutral-400">Comissão de 50%</span>
                </div>

                {weekBarbersData.length === 0 ? (
                  <p className="text-neutral-500 text-center py-6 text-sm">Nenhum atendimento nesta semana.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {weekBarbersData.map(b => {
                      const sharePercent = weekRevenue > 0 ? Math.round((b.revenue / weekRevenue) * 100) : 0;
                      return (
                        <div
                          key={b.id}
                          className="bg-dark-900/60 border border-dark-600/50 p-4 rounded-2xl flex flex-col justify-between"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={b.photo_url || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100'}
                              alt={b.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-brand-yellow/40"
                            />
                            <div>
                              <p className="text-sm font-bold text-white">{b.name}</p>
                              <p className="text-xs text-neutral-400">{b.count} atendimentos</p>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-dark-700/60">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-400">Total Faturado:</span>
                              <span className="font-bold text-brand-yellow tabular-nums">{formatPrice(b.revenue)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-400">Comissão (50%):</span>
                              <span className="font-semibold text-green-400 tabular-nums">{formatPrice(b.revenue * 0.5)}</span>
                            </div>
                            <div className="w-full bg-dark-700 h-1.5 rounded-full overflow-hidden mt-2">
                              <div className="bg-brand-yellow h-full rounded-full" style={{ width: `${sharePercent}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ─── TAB 2: FATURAMENTO DO MÊS ───────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {viewMode === 'month' && (
            <div className="space-y-6 animate-fade-in">
              {/* Grand Monthly Card */}
              <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-700 rounded-3xl border border-brand-yellow/30 p-6 sm:p-10 relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-xs font-black uppercase tracking-wider mb-4">
                    <span>🇨🇴</span> Relatório Mensal — {selectedMonthDisplay}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-neutral-400">
                    Faturamento Consolidado do Mês
                  </p>
                  
                  <h2 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow tabular-nums tracking-tighter my-3">
                    {formatPrice(monthRevenue)}
                  </h2>

                  {/* Monthly Goal & Status */}
                  <div className="mt-6 max-w-xl">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-300 mb-2">
                      <span>Meta Mensal: {formatPrice(monthlyGoal)}</span>
                      <span className="text-brand-yellow">{monthProgressPercent}% Atingido</span>
                    </div>
                    <div className="w-full bg-dark-950 h-3 rounded-full overflow-hidden border border-dark-600/50 p-0.5">
                      <div
                        className="bg-gradient-to-r from-brand-yellow to-yellow-400 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${monthProgressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sub KPI row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-dark-600/60">
                  <div>
                    <p className="text-xs text-neutral-500 font-semibold uppercase">Total Atendimentos</p>
                    <p className="text-2xl font-black text-white mt-1 tabular-nums">{monthTotalClients}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 font-semibold uppercase">Ticket Médio</p>
                    <p className="text-2xl font-black text-brand-yellow mt-1 tabular-nums">{formatPrice(monthAvgTicket)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 font-semibold uppercase">Já Concluído</p>
                    <p className="text-2xl font-black text-green-400 mt-1 tabular-nums">{formatPrice(monthCompletedRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 font-semibold uppercase">Projeção Estimada</p>
                    <p className="text-2xl font-black text-neutral-200 mt-1 tabular-nums">
                      {formatPrice(Math.round(monthRevenue * 1.35))}
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── EVOLUÇÃO SEMANAL DO MÊS (Gráfico de Distribuição) ── */}
              <div className="bg-dark-800 rounded-3xl border border-dark-600/60 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                    <span>📊</span> Distribuição Semanal de {selectedMonthDisplay}
                  </h3>
                </div>

                <div className="space-y-4">
                  {monthWeeksBreakdown.map((week, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-bold text-neutral-300">{week.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-neutral-500 font-medium">{week.count} cortes</span>
                          <span className="font-black text-brand-yellow tabular-nums">{formatPrice(week.revenue)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-dark-900 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-brand-yellow via-yellow-300 to-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${week.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── COMPARATIVO POR UNIDADE & RANKING DE SERVIÇOS ───── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Unidades (Lojas) */}
                <div className="bg-dark-800 rounded-3xl border border-dark-600/60 p-5 sm:p-6 flex flex-col justify-between">
                  <h3 className="text-base font-bold text-neutral-100 mb-4 flex items-center gap-2">
                    <span>📍</span> Faturamento por Unidade
                  </h3>

                  <div className="space-y-4">
                    {monthShopsBreakdown.map(shop => {
                      const sharePercent = monthRevenue > 0 ? Math.round((shop.revenue / monthRevenue) * 100) : 0;
                      return (
                        <div key={shop.id} className="p-4 rounded-2xl bg-dark-900/60 border border-dark-600/50">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-bold text-white">{shop.name}</span>
                            <span className="text-sm font-black text-brand-yellow tabular-nums">{formatPrice(shop.revenue)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                            <span>{shop.count} clientes atendidos</span>
                            <span>{sharePercent}% do total</span>
                          </div>
                          <div className="w-full bg-dark-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-blue h-full rounded-full" style={{ width: `${sharePercent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Serviços Mais Rentáveis */}
                <div className="bg-dark-800 rounded-3xl border border-dark-600/60 p-5 sm:p-6">
                  <h3 className="text-base font-bold text-neutral-100 mb-4 flex items-center gap-2">
                    <span>✂️</span> Serviços Mais Lucrativos do Mês
                  </h3>

                  <div className="space-y-3">
                    {monthServicesBreakdown.slice(0, 5).map((svc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark-900/50 border border-dark-700/50">
                        <div>
                          <p className="text-sm font-bold text-neutral-200">{svc.name}</p>
                          <p className="text-xs text-neutral-400">{svc.count}x realizados</p>
                        </div>
                        <p className="text-sm font-black text-brand-yellow tabular-nums">{formatPrice(svc.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ─── RANKING DE BARBEIROS NO MÊS ─────────────────────── */}
              <div className="bg-dark-800 rounded-3xl border border-dark-600/60 p-5 sm:p-6">
                <h3 className="text-base font-bold text-neutral-100 mb-4 flex items-center gap-2">
                  <span>🏆</span> Ranking da Equipe no Mês
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {monthBarbersData.map((barber, index) => {
                    const medals = ['🥇 1º Lugar', '🥈 2º Lugar', '🥉 3º Lugar'];
                    return (
                      <div
                        key={barber.id}
                        className={`p-5 rounded-2xl border text-center flex flex-col items-center justify-between ${
                          index === 0
                            ? 'bg-gradient-to-b from-brand-yellow/15 to-dark-900 border-brand-yellow/50 shadow-glow-yellow'
                            : 'bg-dark-900/60 border-dark-600/50'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-yellow mb-3">
                          {medals[index] || `#${index + 1}`}
                        </span>

                        <img
                          src={barber.photo_url || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100'}
                          alt={barber.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-brand-yellow mb-3"
                        />

                        <h4 className="text-base font-black text-white">{barber.name}</h4>
                        <p className="text-xs text-neutral-400 mb-4">{barber.count} atendimentos</p>

                        <div className="w-full pt-3 border-t border-dark-700/60">
                          <p className="text-xs text-neutral-500 uppercase font-semibold">Faturamento Gerado</p>
                          <p className="text-xl font-black text-brand-yellow tabular-nums mt-0.5">
                            {formatPrice(barber.revenue)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
