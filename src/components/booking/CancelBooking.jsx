import React, { useState } from 'react';
import { appointmentsApi, formatDate, formatTime, barbersApi, servicesApi } from '../../lib/storage';

const STATES = { idle: 'idle', found: 'found', cancelled: 'cancelled', error: 'error' };

export default function CancelBooking({ onBack }) {
  const [code,         setCode]         = useState('');
  const [phone,        setPhone]        = useState('');
  const [state,        setState]        = useState(STATES.idle);
  const [appointment,  setAppointment]  = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setErrorMsg('');

    await new Promise(r => setTimeout(r, 500));

    const appt = appointmentsApi.getByCode(code.trim());
    setLoading(false);

    if (!appt) {
      setErrorMsg('Agendamento não encontrado. Verifique o código e tente novamente.');
      setState(STATES.error);
      return;
    }
    if (appt.status === 'cancelled') {
      setErrorMsg('Este agendamento já foi cancelado.');
      setState(STATES.error);
      return;
    }

    // Validate phone (at least last 4 digits match)
    const digits = phone.replace(/\D/g, '');
    const apptDigits = appt.client_phone.replace(/\D/g, '');
    if (digits.length >= 4 && !apptDigits.endsWith(digits.slice(-4))) {
      setErrorMsg('Código ou WhatsApp não conferem. Verifique e tente novamente.');
      setState(STATES.error);
      return;
    }

    setAppointment(appt);
    setState(STATES.found);
  };

  const handleCancel = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    appointmentsApi.cancel(appointment.id);
    setLoading(false);
    setConfirmOpen(false);
    setState(STATES.cancelled);
  };

  const barber  = appointment ? barbersApi.getById(appointment.barber_id) : null;
  const service = appointment ? servicesApi.getById(appointment.service_id) : null;

  // ── Cancelled ─────────────────────────────────────────────────
  if (state === STATES.cancelled) {
    return (
      <div className="page-enter flex flex-col items-center text-center py-8 gap-4">
        <div className="w-16 h-16 rounded-full bg-neutral-800 border border-dark-500 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-100">Agendamento cancelado</h2>
          <p className="text-sm text-neutral-500 mt-1">Seu horário foi cancelado com sucesso.</p>
        </div>
        <button
          onClick={onBack}
          className="mt-2 px-6 py-2.5 rounded-xl bg-dark-700 border border-dark-500 text-sm font-medium text-neutral-300 hover:border-dark-400 hover:text-neutral-100 transition-all btn-press"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          aria-label="Voltar"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-50 hover:bg-dark-700 transition-all btn-press"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-semibold text-neutral-50">Cancelar agendamento</h1>
          <p className="text-xs text-neutral-600">Informe o código e WhatsApp</p>
        </div>
      </div>

      {/* Search Form */}
      {state !== STATES.found && (
        <form onSubmit={handleSearch} className="space-y-3">
          <div>
            <label htmlFor="cancel-code" className="block text-xs font-semibold text-neutral-400 mb-1.5">
              Código de reserva
            </label>
            <input
              id="cancel-code"
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)); setState(STATES.idle); setErrorMsg(''); }}
              placeholder="Ex: ABC123"
              maxLength={6}
              className="
                w-full h-12 px-4 rounded-xl border border-dark-500 text-sm font-mono font-semibold
                text-neutral-50 bg-dark-700 placeholder:text-neutral-600 tracking-widest uppercase
                focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 focus:border-brand-yellow
                hover:border-dark-400 transition-all
              "
            />
          </div>
          <div>
            <label htmlFor="cancel-phone" className="block text-xs font-semibold text-neutral-400 mb-1.5">
              Últimos 4 dígitos do WhatsApp
            </label>
            <input
              id="cancel-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 4)); setState(STATES.idle); setErrorMsg(''); }}
              placeholder="9999"
              maxLength={4}
              className="
                w-full h-12 px-4 rounded-xl border border-dark-500 text-sm font-mono font-semibold
                text-neutral-50 bg-dark-700 placeholder:text-neutral-600 tracking-widest
                focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 focus:border-brand-yellow
                hover:border-dark-400 transition-all
              "
            />
          </div>

          {/* Error */}
          {state === STATES.error && errorMsg && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 animate-slide-down">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              <p className="text-xs text-red-400">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 4}
            className="
              w-full h-12 rounded-xl font-semibold text-sm
              bg-dark-700 border border-dark-500 text-neutral-200
              hover:border-dark-400 hover:bg-dark-600 hover:text-neutral-50
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200 btn-press
              flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              'Buscar agendamento'
            )}
          </button>
        </form>
      )}

      {/* Found State */}
      {state === STATES.found && appointment && (
        <div className="space-y-4 page-enter">
          <div className="bg-dark-800 rounded-2xl border border-dark-500 overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-600/50">
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Agendamento encontrado</p>
            </div>
            <div className="divide-y divide-dark-600/40">
              <DetailRow label="Código" value={appointment.booking_code} mono />
              <DetailRow label="Barbeiro" value={barber?.name} />
              <DetailRow label="Serviço" value={service?.name} />
              <DetailRow label="Data" value={formatDate(appointment.date)} />
              <DetailRow label="Horário" value={formatTime(appointment.start_time)} accent />
              <DetailRow label="Cliente" value={appointment.client_name} />
            </div>
          </div>

          <button
            onClick={() => setConfirmOpen(true)}
            className="
              w-full h-12 rounded-xl font-semibold text-sm
              bg-red-500/10 border border-red-500/30 text-red-400
              hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300
              transition-all duration-200 btn-press
              flex items-center justify-center gap-2
            "
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
            Cancelar este agendamento
          </button>

          <button
            onClick={() => setState(STATES.idle)}
            className="w-full text-sm text-neutral-600 hover:text-neutral-400 transition-colors text-center"
          >
            Buscar outro agendamento
          </button>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmOpen(false)} />
          <div className="relative w-full max-w-sm bg-dark-800 rounded-2xl border border-dark-500 shadow-modal p-5 animate-slide-up">
            <h2 id="confirm-title" className="text-base font-bold text-neutral-50 mb-2">Cancelar agendamento?</h2>
            <p className="text-sm text-neutral-500 mb-5">
              Esta ação não pode ser desfeita. O horário ficará disponível novamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 h-11 rounded-xl text-sm font-medium bg-dark-700 border border-dark-500 text-neutral-300 hover:border-dark-400 transition-all btn-press"
              >
                Manter
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 h-11 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-all btn-press disabled:opacity-60 flex items-center justify-center"
              >
                {loading ? (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : 'Cancelar sim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, accent, mono }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 gap-4">
      <p className="text-xs text-neutral-600 shrink-0">{label}</p>
      <p className={`text-sm font-semibold text-right truncate ${accent ? 'text-brand-yellow' : 'text-neutral-200'} ${mono ? 'font-mono tracking-widest' : ''}`}>
        {value || '—'}
      </p>
    </div>
  );
}
