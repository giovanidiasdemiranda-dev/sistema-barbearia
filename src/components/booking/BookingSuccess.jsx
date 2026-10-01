import React, { useState } from 'react';
import { formatDate, formatPrice, shopsApi, managementLink, whatsappLink } from '../../lib/storage';

export default function BookingSuccess({ appointment, barber, service, onNewBooking }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const shop = shopsApi.getById(appointment.shop_id);
  const link = managementLink(appointment.manageToken);
  const message = 'Olá! Tenho um agendamento em ' + (shop?.name || appointment.shop_name) + ', dia ' + appointment.date.split('-').reverse().join('/') + ' às ' + appointment.start_time + ', com ' + (barber?.name || appointment.barber_name) + '. Meu nome é ' + appointment.client_name + '.';
  async function copyLink() {
    try { await navigator.clipboard.writeText(link); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }
  return <div className="space-y-5 py-4">
    <div className="text-center"><div className="text-4xl mb-3">✓</div><h2 className="text-2xl font-bold text-neutral-50">Agendamento confirmado!</h2><p className="text-neutral-400 text-sm mt-2">Sua reserva foi salva na agenda da unidade.</p></div>
    <dl className="rounded-2xl bg-dark-800 border border-dark-500 p-5 space-y-3 text-sm">
      <div><dt className="text-neutral-500">Unidade</dt><dd className="text-white font-semibold">{shop?.name || appointment.shop_name}</dd><dd className="text-neutral-400">{shop?.address}</dd></div>
      <div><dt className="text-neutral-500">Barbeiro</dt><dd>{barber?.name || appointment.barber_name}</dd></div>
      <div><dt className="text-neutral-500">Serviço</dt><dd>{service?.name || appointment.service_name} · {formatPrice(appointment.price)}</dd></div>
      <div><dt className="text-neutral-500">Data e horário</dt><dd className="text-brand-yellow font-semibold">{formatDate(appointment.date)} · {appointment.start_time}</dd></div>
    </dl>
    <p className="text-sm text-neutral-400">{appointment.notificationStatus === 'accepted' ? 'O aviso do agendamento foi encaminhado ao WhatsApp da unidade.' : 'A reserva está confirmada. O aviso por WhatsApp ainda não foi confirmado; você pode falar com a unidade pelo botão abaixo.'}</p>
    <div className="rounded-xl border border-dark-500 p-4 space-y-2"><p className="text-sm text-neutral-300">Guarde seu link privado para consultar ou cancelar. Quem tiver esse link poderá acessar sua reserva.</p><button onClick={copyLink} className="text-brand-yellow font-semibold text-sm underline">{copied ? 'Link copiado!' : 'Copiar link da minha reserva'}</button>{copyError && <input aria-label="Link privado da reserva" readOnly value={link} onFocus={e => e.target.select()} className="w-full p-2 text-xs bg-dark-700 text-white" />}</div>
    <a href={whatsappLink(appointment.shop_id, message)} target="_blank" rel="noopener noreferrer" className="flex justify-center rounded-xl bg-green-600/20 border border-green-600/30 text-green-400 py-3 font-semibold">Falar com a unidade no WhatsApp</a>
    <button onClick={onNewBooking} className="w-full py-3 rounded-xl bg-dark-700 border border-dark-500 text-neutral-200">Fazer novo agendamento</button>
  </div>;
}
