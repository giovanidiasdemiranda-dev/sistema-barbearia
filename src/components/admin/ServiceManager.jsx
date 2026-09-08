import React, { useState, useEffect } from 'react';
import { servicesApi, formatPrice } from '../../lib/storage';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

function EmptyForm() {
  return { name: '', description: '', price: '', duration_minutes: '30', is_active: true };
}

export default function ServiceManager() {
  const { addToast } = useToast();
  const [services, setServices] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EmptyForm());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const load = () => setServices(servicesApi.getAll());
  useEffect(load, []);

  const openCreate = () => { setEditingId(null); setForm(EmptyForm()); setErrors({}); setIsOpen(true); };
  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({ name: s.name, description: s.description || '', price: String(s.price), duration_minutes: String(s.duration_minutes), is_active: s.is_active });
    setErrors({});
    setIsOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nome obrigatório';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errs.price = 'Preço inválido';
    if (!form.duration_minutes || isNaN(Number(form.duration_minutes))) errs.duration = 'Duração inválida';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const data = { name: form.name, description: form.description, price: Number(form.price), duration_minutes: Number(form.duration_minutes), is_active: form.is_active };
    if (editingId) {
      servicesApi.update(editingId, data);
      addToast('Serviço atualizado', 'success');
    } else {
      servicesApi.create(data);
      addToast('Serviço criado', 'success');
    }
    load();
    setIsOpen(false);
    setLoading(false);
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Excluir serviço "${name}"?`)) return;
    servicesApi.delete(id);
    addToast('Serviço excluído', 'info');
    load();
  };

  const f = (field) => (e) => { setForm(p => ({ ...p, [field]: e.target.value })); if (errors[field]) setErrors(p => ({ ...p, [field]: undefined })); };

  const DURATIONS = [15, 30, 45, 60, 75, 90, 120];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-neutral-400 text-sm">{services.length} serviço{services.length !== 1 ? 's' : ''}</p>
        <Button variant="primary" size="sm" onClick={openCreate}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5v14"/></svg>}
        >
          Novo serviço
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {services.map(s => (
            <div key={s.id} className="bg-dark-800 rounded-2xl border border-dark-600 p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-neutral-50">{s.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.is_active ? 'bg-green-500/10 text-green-400' : 'bg-neutral-800 text-neutral-600'}`}>
                    {s.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {s.description && <p className="text-sm text-neutral-500 truncate">{s.description}</p>}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-bold text-brand-yellow">{formatPrice(s.price)}</span>
                  <span className="text-xs text-neutral-600">·</span>
                  <span className="text-xs text-neutral-500">{s.duration_minutes} min</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(s)} title="Editar" className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-dark-700 transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => handleDelete(s.id, s.name)} title="Excluir" className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editingId ? 'Editar serviço' : 'Novo serviço'}>
        <div className="space-y-4">
          <Field label="Nome *" error={errors.name}>
            <input type="text" value={form.name} onChange={f('name')} placeholder="Ex: Corte Clássico" className={inputCls(errors.name)} />
          </Field>
          <Field label="Descrição">
            <textarea value={form.description} onChange={f('description')} placeholder="Breve descrição do serviço..." rows={2} className={`${inputCls()} resize-none`} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço (R$) *" error={errors.price}>
              <input type="number" min="0" step="0.01" value={form.price} onChange={f('price')} placeholder="0,00" className={inputCls(errors.price)} />
            </Field>
            <Field label="Duração *" error={errors.duration}>
              <select value={form.duration_minutes} onChange={f('duration_minutes')} className={`${inputCls(errors.duration)} cursor-pointer`}>
                {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({...p, is_active: e.target.checked}))} className="sr-only" />
            <div className={`w-10 h-6 rounded-full transition-all ${form.is_active ? 'bg-brand-yellow' : 'bg-dark-500'} relative`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.is_active ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm text-neutral-300">Serviço ativo</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button variant="primary" fullWidth onClick={handleSave} loading={loading ? 'Salvando...' : false}>
              {editingId ? 'Salvar' : 'Criar serviço'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputCls = (error) => `
  w-full h-11 px-4 rounded-xl bg-dark-700 border text-neutral-50 placeholder-neutral-600 text-sm
  transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 focus:border-brand-yellow
  ${error ? 'border-red-500' : 'border-dark-500 hover:border-dark-400'}
`;

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-dark-800 rounded-2xl border border-dark-600">
      <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center mb-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/>
        </svg>
      </div>
      <p className="text-neutral-500">Nenhum serviço cadastrado</p>
    </div>
  );
}
