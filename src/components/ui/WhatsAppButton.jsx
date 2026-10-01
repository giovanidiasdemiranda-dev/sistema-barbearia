import React, { useState } from 'react';
import { shopsApi, whatsappLink, formatPhone } from '../../lib/storage';
export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  return <div className="fixed bottom-6 right-6 z-30">
    {open && <div className="mb-3 p-4 rounded-2xl bg-dark-800 border border-dark-500 shadow-2xl space-y-3"><p className="text-sm text-neutral-300">Escolha a unidade</p>{shopsApi.getActive().map(shop => <a key={shop.id} href={whatsappLink(shop.id)} target="_blank" rel="noopener noreferrer" className="block text-sm text-green-400 hover:underline">{shop.name}<span className="block text-xs text-neutral-400">{formatPhone(shop.phone.slice(2))}</span></a>)}</div>}
    <button onClick={() => setOpen(v => !v)} aria-expanded={open} className="rounded-full bg-green-600 hover:bg-green-500 text-white px-5 py-4 font-bold text-sm shadow-lg">{open ? 'Fechar contatos' : 'Atendimento WhatsApp'}</button>
  </div>;
}
