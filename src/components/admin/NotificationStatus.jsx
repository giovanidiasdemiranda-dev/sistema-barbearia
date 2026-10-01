import React, { useState } from 'react';
import { notificationInfo, retryNotification } from '../../lib/storage';
import { useToast } from '../../lib/useToast';
export default function NotificationStatus({ appointmentId }) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const info = notificationInfo();
  const job = info.items.find(n => n.id === appointmentId);
  if (!job) return null;
  const labels = { accepted: 'Aviso encaminhado ao WhatsApp', not_configured: 'Aviso pendente: WhatsApp não configurado', pending: 'Aviso aguardando envio', failed: 'Falha no aviso por WhatsApp', sending: 'Aviso em processamento; confira o WhatsApp', unknown: 'Envio sem confirmação; confira o WhatsApp', cancelled: 'Aviso cancelado' };
  async function retry() {
    setLoading(true);
    try { const result = await retryNotification(appointmentId); addToast(result.status === 'accepted' ? 'Aviso encaminhado' : 'Confira a situação do aviso antes de tentar novamente.', 'info'); }
    catch (error) { addToast(error.message, 'error'); }
    finally { setLoading(false); }
  }
  return <div className="text-xs text-neutral-400 mt-2"><span>{labels[job.status] || 'Aviso pendente'}</span>{info.configured && ['failed', 'pending', 'not_configured'].includes(job.status) && job.attempts < 3 && <button disabled={loading} onClick={retry} className="ml-2 text-brand-yellow underline">{loading ? 'Enviando…' : 'Enviar aviso'}</button>}</div>;
}
