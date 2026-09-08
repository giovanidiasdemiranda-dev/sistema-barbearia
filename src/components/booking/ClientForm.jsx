import React, { useState } from 'react';
import { formatPrice, formatDate, formatPhone } from '../../lib/storage';

export default function ClientForm({ booking, onConfirm, onBack }) {
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const handlePhone = (e) => setPhone(formatPhone(e.target.value));

  const validate = () => {
    const errs = {};
    if (!name.trim() || name.trim().length < 2) errs.name  = 'Informe seu nome completo';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10)                      errs.phone = 'Informe um WhatsApp válido com DDD';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    onConfirm({ name: name.trim(), phone });
  };

  const { shop, barber, service, date, time } = booking;

  return (
    <div className="space-y-6">
      {/* Booking Summary Card */}
      <div className="bg-dark-900/50 rounded-2xl border border-dark-600/50 overflow-hidden shadow-inner-glow">
        <div className="px-5 py-4 border-b border-dark-600/50 flex items-center justify-between">
          <p className="text-xs text-brand-yellow font-bold uppercase tracking-widest">Resumo da Reserva</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <SummaryRow icon={<MapPinIcon />} label="Unidade" value={shop?.name} />
          <SummaryRow icon={<BarberIcon />} label="Profissional" value={barber?.name} />
          <SummaryRow icon={<ScissorsIcon />} label="Serviço" value={`${service?.name} — ${formatPrice(service?.price || 0)}`} accent />
          <SummaryRow icon={<CalendarIcon />} label="Data" value={date ? formatDate(date) : ''} />
          <SummaryRow icon={<ClockIcon />} label="Horário" value={time} accent />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="client-name" className="block text-xs font-semibold text-neutral-400 mb-1.5">
            Nome completo <span className="text-brand-yellow" aria-hidden>*</span>
          </label>
          <input
            id="client-name"
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
            autoComplete="name"
            placeholder="Seu nome"
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={`
              w-full h-12 px-4 rounded-xl border text-sm font-medium text-neutral-50
              bg-dark-700 placeholder:text-neutral-600
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 focus:border-brand-yellow
              ${errors.name ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : 'border-dark-500 hover:border-dark-400'}
            `}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              {errors.name}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="client-phone" className="block text-xs font-semibold text-neutral-400 mb-1.5">
            WhatsApp <span className="text-brand-yellow" aria-hidden>*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
              <WhatsAppIcon />
              <div className="w-px h-4 bg-dark-500" />
            </div>
            <input
              id="client-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={e => { handlePhone(e); if (errors.phone) setErrors(p => ({ ...p, phone: '' })); }}
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              aria-required="true"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={`
                w-full h-12 pl-14 pr-4 rounded-xl border text-sm font-medium text-neutral-50
                bg-dark-700 placeholder:text-neutral-600
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 focus:border-brand-yellow
                ${errors.phone ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : 'border-dark-500 hover:border-dark-400'}
              `}
            />
          </div>
          {errors.phone ? (
            <p id="phone-error" role="alert" className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              {errors.phone}
            </p>
          ) : (
            <p className="text-xs text-neutral-600 mt-1.5">
              Usado apenas para confirmação do agendamento.
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full h-13 rounded-xl font-semibold text-sm text-dark-900 mt-2
            bg-brand-yellow hover:bg-brand-yellow-light
            transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]
            disabled:opacity-60 disabled:cursor-not-allowed
            btn-press shadow-glow-yellow hover:shadow-glow-yellow-lg
            flex items-center justify-center gap-2
          "
          style={{ height: '52px' }}
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Confirmando...
            </>
          ) : (
            <>
              Confirmar Agendamento
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </>
          )}
        </button>

        <p className="text-xs text-neutral-700 text-center">
          Ao confirmar, você concorda com nossa política de agendamento.
        </p>
      </form>
    </div>
  );
}

// ── Summary Row ──────────────────────────────────────────────────
function SummaryRow({ icon, label, value, accent }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-neutral-600 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-2xs text-neutral-600 font-medium">{label}</p>
        <p className={`text-sm font-medium truncate ${accent ? 'text-brand-yellow' : 'text-neutral-200'}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────
function BarberIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function ScissorsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/>
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
