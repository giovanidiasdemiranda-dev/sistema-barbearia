import React, { useEffect, useState } from 'react';
import { savedBookings, manageBooking, formatDate, whatsappLink } from '../../lib/storage';

export default function CancelBooking({ onBack }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState('');
  const [confirm, setConfirm] = useState(null);
  useEffect(() => {
    let active = true;
    const hashToken = window.location.hash.startsWith('#reserva=') ? window.location.hash.slice(9) : '';
    const records = hashToken ? [{ token: hashToken }] : savedBookings().slice().reverse();
    Promise.allSettled(records.map(async record => ({ ...await manageBooking(record.token), token: record.token }))).then(results => {
      if (!active) return;
      setBookings(results.filter(r => r.status === 'fulfilled').map(r => r.value));
      if (results.some(r => r.status === 'rejected')) setError('Não foi possível carregar uma ou mais reservas. Use o link privado ou tente novamente mais tarde.');
      setLoading(false);
    });
    return () => { active = false; };
  }, []);
  async function openLink(e) {
    e.preventDefault(); setError(''); setBusy('search');
    try {
      const value = new URL(link);
      if (value.origin !== window.location.origin || !value.hash.startsWith('#reserva=')) throw new Error('Cole o link privado recebido ao agendar neste site.');
      const token = value.hash.slice(9);
      const appointment = await manageBooking(token);
      setBookings([{ ...appointment, token }]);
    } catch (err) { setError(err.message); }
    finally { setBusy(''); }
  }
  async function cancel() {
    setBusy(confirm.id); setError('');
    try { const next = await manageBooking(confirm.token, true); setBookings(list => list.map(a => a.id === next.id ? { ...next, token: a.token } : a)); setConfirm(null); }
    catch (err) { setError(err.message); }
    finally { setBusy(''); }
  }
  return <div className="p-5 space-y-5">
    <button onClick={onBack} className="text-neutral-400 text-sm">← Voltar</button>
    <h2 className="text-xl font-bold">Meus agendamentos</h2>
    <p className="text-sm text-neutral-400">As reservas feitas neste navegador aparecem aqui. Em outro aparelho, use o link privado que você guardou.</p>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {loading && <p role="status">Carregando reservas…</p>}
    {!loading && !bookings.length && <p className="text-neutral-400 text-sm">Nenhuma reserva encontrada neste aparelho.</p>}
    {bookings.map(a => <article key={a.id} className="bg-dark-800 border border-dark-500 rounded-2xl p-4 space-y-2">
      <h3 className="font-semibold">{a.shop_name || 'Sua unidade'} · {a.barber_name}</h3>
      <p className="text-sm text-neutral-300">{a.service_name} · {formatDate(a.date)} às {a.start_time}</p>
      <p className="text-sm text-brand-yellow">{({ scheduled: 'Agendado', completed: 'Concluído', cancelled: 'Cancelado' })[a.status]}</p>
      {a.status === 'scheduled' && <button disabled={!!busy} onClick={() => setConfirm(a)} className="text-sm text-red-300 underline disabled:opacity-50">Cancelar esta reserva</button>}
      <a className="block text-sm text-green-400" href={whatsappLink(a.shop_id, 'Olá! Preciso de ajuda com meu agendamento de ' + a.date + ' às ' + a.start_time + '. Meu nome é ' + a.client_name + '.')} target="_blank" rel="noopener noreferrer">Falar com a unidade</a>
    </article>)}
    {confirm && <div role="alertdialog" aria-label="Confirmar cancelamento" className="p-4 rounded-xl border border-red-400/30 bg-dark-700 space-y-3"><p>Cancelar a reserva de {confirm.start_time} em {formatDate(confirm.date)}?</p><div className="flex gap-4"><button disabled={!!busy} onClick={cancel} className="text-red-300 font-semibold">{busy ? 'Cancelando…' : 'Sim, cancelar'}</button><button disabled={!!busy} onClick={() => setConfirm(null)}>Manter reserva</button></div></div>}
    <form onSubmit={openLink} className="space-y-2"><label htmlFor="reservation-link" className="block text-sm text-neutral-400">Abrir pelo link privado</label><input id="reservation-link" type="url" required value={link} onChange={e => setLink(e.target.value)} placeholder="Cole o link da reserva" className="w-full p-3 rounded-xl bg-dark-700 border border-dark-500 text-sm"/><button disabled={!!busy} className="text-brand-yellow font-semibold text-sm">Consultar reserva</button></form>
    <p className="text-xs text-neutral-500">Reservas antigas feitas por código podem ser consultadas ou canceladas diretamente com a unidade.</p>
  </div>;
}
