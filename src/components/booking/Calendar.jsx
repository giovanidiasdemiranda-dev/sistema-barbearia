import React, { useState } from 'react';
import { workingHoursApi, blockedSlotsApi } from '../../lib/storage';

const MONTHS       = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const WEEKDAYS     = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isDateAvailable(barberId, dateStr) {
  const working = workingHoursApi.isBarberWorkingOnDate(barberId, dateStr);
  if (!working) return false;
  const blocked    = blockedSlotsApi.getByBarberAndDate(barberId, dateStr);
  const fullDayBlock = blocked.find(b => !b.start_time);
  return !fullDayBlock;
}

export default function Calendar({ barberId, selectedDate, onSelectDate }) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr    = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const canGoPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth();
  const maxDate   = new Date(today.getFullYear(), today.getMonth() + 3, 0);
  const canGoNext = new Date(viewYear, viewMonth) < new Date(maxDate.getFullYear(), maxDate.getMonth());

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="select-none">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          aria-label="Mês anterior"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-50 hover:bg-dark-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150 btn-press"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className="text-center">
          <p className="font-semibold text-neutral-50 text-base">
            {MONTHS[viewMonth]}
          </p>
          <p className="text-xs text-neutral-600 mt-0.5">{viewYear}</p>
        </div>

        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          aria-label="Próximo mês"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-50 hover:bg-dark-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150 btn-press"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`text-center text-xs font-semibold py-1 ${i === 0 || i === 6 ? 'text-neutral-700' : 'text-neutral-500'}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-y-1.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;

          const dateStr    = toDateStr(viewYear, viewMonth, day);
          const isPast     = dateStr < todayStr;
          const isToday    = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const available  = !isPast && (barberId ? isDateAvailable(barberId, dateStr) : true);
          const isWeekend  = new Date(dateStr + 'T12:00:00').getDay() % 6 === 0;

          return (
            <div key={dateStr} className="flex items-center justify-center">
              <button
                onClick={() => available && onSelectDate(dateStr)}
                disabled={!available}
                aria-label={`${day} de ${MONTHS[viewMonth]}${isToday ? ' (hoje)' : ''}`}
                aria-pressed={isSelected}
                className={`
                  cal-day w-9 h-9 rounded-full text-sm font-medium
                  flex items-center justify-center relative
                  disabled:cursor-not-allowed
                  ${isSelected
                    ? 'bg-brand-yellow text-dark-900 font-bold shadow-glow-yellow'
                    : available
                      ? isToday
                        ? 'text-brand-yellow ring-1 ring-brand-yellow/40 hover:bg-brand-yellow/10'
                        : isWeekend
                          ? 'text-neutral-400 hover:bg-dark-700 hover:text-neutral-200'
                          : 'text-neutral-200 hover:bg-dark-700 hover:text-white'
                      : isPast
                        ? 'text-neutral-800'
                        : 'text-neutral-700 line-through decoration-neutral-700'
                  }
                `}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-5 pt-4 border-t border-dark-600/50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-brand-yellow" />
          <span className="text-xs text-neutral-600">Selecionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full ring-1 ring-brand-yellow/40" />
          <span className="text-xs text-neutral-600">Hoje</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-dark-600 opacity-40" />
          <span className="text-xs text-neutral-600">Indisponível</span>
        </div>
      </div>
    </div>
  );
}
