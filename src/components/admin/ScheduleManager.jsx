import useStore from '../../lib/useStore';
import React, { useState } from 'react';
import { barbersApi, workingHoursApi, blockedSlotsApi } from '../../lib/storage';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useToast } from '../../lib/useToast';

const DAYS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

export default function ScheduleManager() {
  const { addToast } = useToast();
  useStore();
  const barbers = barbersApi.getActive();
  const [selection, setSelectedBarberId] = useState(null);
  const selectedBarberId = barbers.some(b => b.id === selection) ? selection : barbers[0]?.id;
  const workingHours = workingHoursApi.getByBarber(selectedBarberId);
  const blocked = blockedSlotsApi.getAll().filter(b => b.barber_id === selectedBarberId);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({ date: '', start_time: '', end_time: '', reason: '', full_day: false });

  const handleHourChange = async (id, field, value) => {
    try {
    await workingHoursApi.update(id, { [field]: value });
    addToast('Horário atualizado', 'success');
    } catch (error) { addToast(error.message, 'error'); }
  };

  const handleAddBlock = async () => {
    try {
    if (!blockForm.date) { addToast('Data obrigatória', 'error'); return; }
    if (!blockForm.full_day && (!blockForm.start_time || !blockForm.end_time)) { addToast('Preencha o início e o fim ou marque dia inteiro.', 'error'); return; }
    await blockedSlotsApi.create({
      barber_id: selectedBarberId,
      date: blockForm.date,
      start_time: blockForm.full_day ? null : blockForm.start_time || null,
      end_time: blockForm.full_day ? null : blockForm.end_time || null,
      reason: blockForm.reason,
    });
    addToast('Bloqueio adicionado', 'success');
    setIsBlockOpen(false);
    setBlockForm({ date: '', start_time: '', end_time: '', reason: '', full_day: false });
    } catch (error) { addToast(error.message, 'error'); }
  };

  const handleDeleteBlock = async (id) => {
    try {
    await blockedSlotsApi.delete(id);
    addToast('Bloqueio removido', 'info');
    } catch (error) { addToast(error.message, 'error'); }
  };

  const selectedBarber = barbers.find(b => b.id === selectedBarberId);

  return (
    <div className="space-y-6">
      {/* Barber selector */}
      {barbers.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {barbers.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBarberId(b.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all btn-press ${
                selectedBarberId === b.id
                  ? 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30'
                  : 'bg-dark-700 text-neutral-400 border-dark-500 hover:border-dark-400'
              }`}
            >
              {b.name.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {barbers.length === 0 && (
        <p className="text-neutral-500 text-center py-8">Nenhum barbeiro ativo</p>
      )}

      {selectedBarber && (
        <>
          {/* Working hours per day */}
          <div className="bg-dark-800 rounded-2xl border border-dark-600 overflow-hidden">
            <div className="px-5 py-4 border-b border-dark-600">
              <h3 className="font-semibold text-neutral-50">Horários de {selectedBarber.name.split(' ')[0]}</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Configure os horários de funcionamento por dia</p>
            </div>
            <div className="divide-y divide-dark-600">
              {workingHours.sort((a,b) => a.day_of_week - b.day_of_week).map(h => (
                <div key={h.id} className="flex items-center gap-3 px-5 py-3 flex-wrap">
                  <div className="w-24 shrink-0">
                    <p className="text-sm font-medium text-neutral-300">{DAYS[h.day_of_week]}</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!h.is_off}
                      onChange={e => handleHourChange(h.id, 'is_off', !e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-9 h-5 rounded-full transition-all ${!h.is_off ? 'bg-brand-yellow' : 'bg-dark-500'} relative shrink-0`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${!h.is_off ? 'left-4' : 'left-0.5'}`} />
                    </div>
                    <span className="text-xs text-neutral-500">{h.is_off ? 'Folga' : 'Aberto'}</span>
                  </label>
                  {!h.is_off && (
                    <div className="flex items-center gap-2 ml-auto">
                      <input
                        type="time"
                        value={h.start_time || '09:00'}
                        onChange={e => handleHourChange(h.id, 'start_time', e.target.value)}
                        className="h-8 px-2 rounded-lg bg-dark-700 border border-dark-500 text-neutral-200 text-sm focus:outline-none focus:border-brand-yellow"
                      />
                      <span className="text-neutral-600 text-xs">até</span>
                      <input
                        type="time"
                        value={h.end_time || '19:00'}
                        onChange={e => handleHourChange(h.id, 'end_time', e.target.value)}
                        className="h-8 px-2 rounded-lg bg-dark-700 border border-dark-500 text-neutral-200 text-sm focus:outline-none focus:border-brand-yellow"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Blocked slots */}
          <div className="bg-dark-800 rounded-2xl border border-dark-600 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
              <div>
                <h3 className="font-semibold text-neutral-50">Bloqueios e Folgas</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Datas específicas bloqueadas</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIsBlockOpen(true)}>
                + Bloquear data
              </Button>
            </div>
            {blocked.length === 0 ? (
              <div className="px-5 py-8 text-center text-neutral-600 text-sm">Nenhum bloqueio cadastrado</div>
            ) : (
              <div className="divide-y divide-dark-600">
                {blocked.sort((a,b) => a.date.localeCompare(b.date)).map(b => (
                  <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-200">{b.date}</p>
                      <p className="text-xs text-neutral-500">
                        {!b.start_time ? 'Dia inteiro' : `${b.start_time} - ${b.end_time}`}
                        {b.reason && ` · ${b.reason}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteBlock(b.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Block modal */}
      <Modal isOpen={isBlockOpen} onClose={() => setIsBlockOpen(false)} title="Bloquear data / horário">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Data *</label>
            <input type="date" value={blockForm.date} onChange={e => setBlockForm(p => ({...p, date: e.target.value}))}
              className="w-full h-11 px-4 rounded-xl bg-dark-700 border border-dark-500 text-neutral-200 text-sm focus:outline-none focus:border-brand-yellow" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={blockForm.full_day} onChange={e => setBlockForm(p => ({...p, full_day: e.target.checked}))} className="sr-only" />
            <div className={`w-9 h-5 rounded-full transition-all ${blockForm.full_day ? 'bg-brand-yellow' : 'bg-dark-500'} relative`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${blockForm.full_day ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className="text-sm text-neutral-300">Dia inteiro</span>
          </label>
          {!blockForm.full_day && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Início</label>
                <input type="time" value={blockForm.start_time} onChange={e => setBlockForm(p => ({...p, start_time: e.target.value}))}
                  className="w-full h-11 px-4 rounded-xl bg-dark-700 border border-dark-500 text-neutral-200 text-sm focus:outline-none focus:border-brand-yellow" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Fim</label>
                <input type="time" value={blockForm.end_time} onChange={e => setBlockForm(p => ({...p, end_time: e.target.value}))}
                  className="w-full h-11 px-4 rounded-xl bg-dark-700 border border-dark-500 text-neutral-200 text-sm focus:outline-none focus:border-brand-yellow" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Motivo (opcional)</label>
            <input type="text" value={blockForm.reason} onChange={e => setBlockForm(p => ({...p, reason: e.target.value}))}
              placeholder="Ex: Férias, feriado..."
              className="w-full h-11 px-4 rounded-xl bg-dark-700 border border-dark-500 text-neutral-200 text-sm focus:outline-none focus:border-brand-yellow placeholder-neutral-600" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={() => setIsBlockOpen(false)}>Cancelar</Button>
            <Button variant="primary" fullWidth onClick={handleAddBlock}>Adicionar bloqueio</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
