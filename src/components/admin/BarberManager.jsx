import React, { useState, useEffect } from 'react';
import { barbersApi } from '../../lib/storage';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

const COLORS = ['#F5C518','#22C55E','#3B82F6','#EC4899','#8B5CF6','#F97316','#14B8A6','#EF4444'];

function EmptyForm() {
  return { name: '', bio: '', photo_url: '', color: '#F5C518', is_active: true };
}

export default function BarberManager() {
  const { addToast } = useToast();
  const [barbers, setBarbers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EmptyForm());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const load = () => setBarbers(barbersApi.getAll());
  useEffect(load, []);

  const openCreate = () => { setEditingId(null); setForm(EmptyForm()); setErrors({}); setIsOpen(true); };
  const openEdit = (b) => { setEditingId(b.id); setForm({ name: b.name, bio: b.bio || '', photo_url: b.photo_url || '', color: b.color || '#F5C518', is_active: b.is_active }); setErrors({}); setIsOpen(true); };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nome obrigatório';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const initials = form.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
    if (editingId) {
      barbersApi.update(editingId, { ...form, initials });
      addToast('Barbeiro atualizado', 'success');
    } else {
      barbersApi.create({ ...form, initials });
      addToast('Barbeiro criado', 'success');
    }
    load();
    setIsOpen(false);
    setLoading(false);
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Excluir barbeiro "${name}"? Esta ação não pode ser desfeita.`)) return;
    barbersApi.delete(id);
    addToast('Barbeiro excluído', 'info');
    load();
  };

  const toggleActive = (b) => {
    barbersApi.update(b.id, { is_active: !b.is_active });
    addToast(`${b.name} ${b.is_active ? 'desativado' : 'ativado'}`, 'info');
    load();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      addToast('Por favor, selecione uma imagem válida.', 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      addToast('Erro ao ler a imagem.', 'error');
      e.target.value = '';
    };
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        addToast('Erro ao carregar a imagem. Tente outro formato.', 'error');
      };
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.8 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setForm((p) => ({ ...p, photo_url: dataUrl }));
        } catch (err) {
          console.error(err);
          addToast('Erro ao processar a imagem.', 'error');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    
    // Clear input so selecting the same file again triggers onChange
    e.target.value = '';
  };

  const f = (field) => (e) => { setForm(p => ({ ...p, [field]: e.target.value })); if (errors[field]) setErrors(p => ({ ...p, [field]: undefined })); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-neutral-400 text-sm">{barbers.length} barbeiro{barbers.length !== 1 ? 's' : ''}</p>
        <Button variant="primary" size="sm" onClick={openCreate}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5v14"/></svg>}
        >
          Novo barbeiro
        </Button>
      </div>

      {barbers.length === 0 ? (
        <EmptyState text="Nenhum barbeiro cadastrado" />
      ) : (
        <div className="space-y-3">
          {barbers.map(b => (
            <div key={b.id} className="bg-dark-800 rounded-2xl border border-dark-600 p-4 flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-dark-900 shrink-0 overflow-hidden"
                style={{ backgroundColor: b.color || '#F5C518' }}
              >
                {b.photo_url ? (
                  <img src={b.photo_url} alt={b.name} className="w-full h-full object-cover" />
                ) : (
                  b.initials || b.name.slice(0,2).toUpperCase()
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-neutral-50">{b.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.is_active ? 'bg-green-500/10 text-green-400' : 'bg-neutral-800 text-neutral-600'}`}>
                    {b.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 truncate">{b.bio}</p>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleActive(b)} title={b.is_active ? 'Desativar' : 'Ativar'} className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-dark-700 transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {b.is_active ? <><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></> : <><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></>}
                  </svg>
                </button>
                <button onClick={() => openEdit(b)} title="Editar" className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-dark-700 transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => handleDelete(b.id, b.name)} title="Excluir" className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editingId ? 'Editar barbeiro' : 'Novo barbeiro'}>
        <div className="space-y-4">
          <Field label="Nome *" error={errors.name}>
            <input type="text" value={form.name} onChange={f('name')} placeholder="Nome completo" className={inputCls(errors.name)} />
          </Field>
          <Field label="Bio / Especialidade">
            <textarea value={form.bio} onChange={f('bio')} placeholder="Ex: Especialista em fade..." rows={2} className={`${inputCls()} resize-none`} />
          </Field>
          <Field label="Foto do Barbeiro (Upload)">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-dark-900 shrink-0 overflow-hidden border-2 border-white/10" style={{ backgroundColor: form.color || '#F5C518' }}>
                {form.photo_url ? <img src={form.photo_url} alt="Preview" className="w-full h-full object-cover" /> : (form.name ? form.name.slice(0,2).toUpperCase() : '??')}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handlePhotoUpload}
                  className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-yellow/10 file:text-brand-yellow hover:file:bg-brand-yellow/20 cursor-pointer"
                />
                <p className="text-xs text-neutral-500 mt-2">Escolha do seu celular ou PC.</p>
              </div>
            </div>
          </Field>
          <Field label="Cor do avatar">
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm(p => ({...p, color: c}))}
                  className={`w-8 h-8 rounded-full border-2 transition-all btn-press ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </Field>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({...p, is_active: e.target.checked}))} className="sr-only" />
              <div className={`w-10 h-6 rounded-full transition-all ${form.is_active ? 'bg-brand-yellow' : 'bg-dark-500'} relative`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.is_active ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm text-neutral-300">Ativo</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button variant="primary" fullWidth onClick={handleSave} loading={loading ? 'Salvando...' : false}>
              {editingId ? 'Salvar alterações' : 'Criar barbeiro'}
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

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-dark-800 rounded-2xl border border-dark-600">
      <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center mb-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        </svg>
      </div>
      <p className="text-neutral-500">{text}</p>
    </div>
  );
}
