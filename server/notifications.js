import { readData } from './data.js';
import { fail } from './security.js';

export function whatsappConfigured() {
  return ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_TEMPLATE_NAME', 'WHATSAPP_API_VERSION'].every(key => Boolean(process.env[key]));
}

// Accepted is not a delivery receipt. Uncertain sends must not be retried automatically.
export async function notifyBooking(db, id, fetchImpl = fetch) {
  const ref = db.collection('notifications').doc(id);
  const job = await db.runTransaction(async tx => {
    const current = (await tx.get(ref)).data();
    if (!current || ['accepted', 'sending', 'unknown'].includes(current.status)) return null;
    if (!whatsappConfigured()) { tx.set(ref, { ...current, status: 'not_configured' }); return null; }
    if (current.attempts >= 3) return null;
    const sending = { ...current, status: 'sending', attempts: current.attempts + 1, updated_at: new Date().toISOString() };
    tx.set(ref, sending);
    return sending;
  });
  if (!job) return (await ref.get()).data()?.status || 'not_configured';
  const data = await readData(db);
  const a = data.appointments.find(item => item.id === id);
  if (!a || a.status !== 'scheduled') { await ref.update({ status: 'cancelled' }); return 'cancelled'; }
  const values = [a.shop_name, a.barber_name, a.client_name, a.client_phone, a.service_name, a.date.split('-').reverse().join('/'), a.start_time];
  let status = 'unknown', messageId = '';
  try {
    const version = process.env.WHATSAPP_API_VERSION, sender = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!/^v\d+\.\d+$/.test(version) || !/^\d+$/.test(sender)) fail(503, 'Configuração de WhatsApp inválida.');
    const result = await fetchImpl(`https://graph.facebook.com/${version}/${sender}/messages`, {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: job.recipient, type: 'template', template: {
        name: process.env.WHATSAPP_TEMPLATE_NAME, language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'pt_BR' },
        components: [{ type: 'body', parameters: values.map(value => ({ type: 'text', text: String(value || '—') })) }],
      } }),
    });
    const body = await result.json().catch(() => ({}));
    status = result.ok && body.messages?.[0]?.id ? 'accepted' : (result.status < 500 ? 'failed' : 'unknown');
    messageId = body.messages?.[0]?.id || '';
  } catch { /* preserve the confirmed booking */ }
  await ref.update({ status, message_id: messageId, updated_at: new Date().toISOString() });
  return status;
}
