import React, { useEffect, useState } from 'react';
import { formatPrice, formatDate, formatTime, barbersApi, servicesApi } from '../../lib/storage';

export default function BookingSuccess({ appointment, barber, service, onNewBooking }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const barberData  = barber  || (appointment?.barber_id  ? barbersApi.getById(appointment.barber_id)  : null);
  const serviceData = service || (appointment?.service_id ? servicesApi.getById(appointment.service_id) : null);

  const copyCode = () => {
    if (appointment?.booking_code) {
      navigator.clipboard.writeText(appointment.booking_code).catch(() => {});
    }
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Agendei um horário:\n\n` +
      `📋 Código: *${appointment?.booking_code}*\n` +
      `✂️ Barbeiro: ${barberData?.name}\n` +
      `💈 Serviço: ${serviceData?.name}\n` +
      `📅 Data: ${appointment?.date ? formatDate(appointment.date) : ''}\n` +
      `⏰ Horário: ${appointment?.start_time ? formatTime(appointment.start_time) : ''}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className={`flex-1 flex flex-col items-center justify-center px-4 py-8 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="w-full max-w-sm">

        {/* Checkmark circle */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            {/* Outer ring pulse */}
            <div className="absolute inset-0 rounded-full bg-brand-yellow/20 animate-ping" style={{ animationDuration: '2s', animationIterationCount: '2' }} />
            {/* Main circle */}
            <div className="relative w-20 h-20 rounded-full bg-brand-yellow flex items-center justify-center shadow-glow-yellow-lg animate-scale-in">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0A0A0A"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="checkmark-path"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-50 mb-1">Agendado! 🎉</h2>
          <p className="text-sm text-neutral-500">
            Seu horário está confirmado. Até lá!
          </p>
        </div>

        {/* Booking Code */}
        <button
          onClick={copyCode}
          aria-label="Copiar código de reserva"
          title="Clique para copiar"
          className="
            w-full rounded-2xl bg-brand-yellow/10 border border-brand-yellow/30
            px-4 py-3 mb-4 text-center
            hover:bg-brand-yellow/15 transition-all duration-150 btn-press
            group
          "
        >
          <p className="text-xs text-neutral-500 mb-1">Código de reserva</p>
          <p className="text-3xl font-black tracking-widest text-brand-yellow tabular-nums">
            {appointment?.booking_code}
          </p>
          <p className="text-2xs text-neutral-600 mt-1 group-hover:text-neutral-400 transition-colors">
            Toque para copiar · Guarde para cancelar
          </p>
        </button>

        {/* Details Card */}
        <div className="bg-dark-800 rounded-2xl border border-dark-500 overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-dark-600/50">
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Detalhes do agendamento</p>
          </div>
          <div className="divide-y divide-dark-600/40">
            <DetailRow icon={<BarberIcon />} label="Barbeiro" value={barberData?.name} />
            <DetailRow icon={<ScissorsIcon />} label="Serviço" value={serviceData?.name} sub={serviceData ? formatPrice(serviceData.price) : undefined} />
            <DetailRow icon={<CalendarIcon />} label="Data" value={appointment?.date ? formatDate(appointment.date) : '—'} />
            <DetailRow
              icon={<ClockIcon />}
              label="Horário"
              value={appointment?.start_time ? formatTime(appointment.start_time) : '—'}
              accent
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={openWhatsApp}
            className="
              w-full h-12 rounded-xl font-semibold text-sm
              bg-green-600/20 border border-green-600/30 text-green-400
              hover:bg-green-600/30 hover:border-green-500/50
              transition-all duration-200 btn-press
              flex items-center justify-center gap-2
            "
          >
            <WhatsAppIcon />
            Compartilhar no WhatsApp
          </button>

          <button
            onClick={onNewBooking}
            className="
              w-full h-12 rounded-xl font-semibold text-sm
              bg-dark-700 border border-dark-500 text-neutral-300
              hover:border-dark-400 hover:text-neutral-100 hover:bg-dark-600
              transition-all duration-200 btn-press
            "
          >
            Fazer novo agendamento
          </button>
        </div>

        <p className="text-xs text-neutral-700 text-center mt-5">
          Para cancelar, use o código acima na opção "Cancelar agendamento".
        </p>
      </div>
    </div>
  );
}

// ── Detail Row ───────────────────────────────────────────────────
function DetailRow({ icon, label, value, sub, accent }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-neutral-600 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-600">{label}</p>
        <p className={`text-sm font-semibold truncate ${accent ? 'text-brand-yellow' : 'text-neutral-100'}`}>
          {value || '—'}
        </p>
      </div>
      {sub && <p className="text-sm font-medium text-neutral-400 shrink-0 tabular-nums">{sub}</p>}
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────
function BarberIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function ScissorsIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/></svg>;
}
function CalendarIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
}
function ClockIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function WhatsAppIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
}
