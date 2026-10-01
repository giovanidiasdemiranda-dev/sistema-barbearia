import { randomUUID } from 'node:crypto';
import { seedShops, seedBarbers, seedServices, generateWorkingHours } from '../shared/catalog.js';
import { shopContact, normalizePhone, validDate, minutes, availableSlots, timeAt } from '../shared/booking.js';
import { fail, hash, token } from './security.js';

export const KEYS = ['shops', 'barbers', 'services', 'working_hours', 'blocked_slots', 'appointments', 'reviews'];
const defaults = { shops: seedShops, barbers: seedBarbers, services: seedServices, working_hours: seedBarbers.flatMap(b => generateWorkingHours(b.id)), blocked_slots: [], appointments: [], reviews: [] };
export const refFor = (db, key) => db.collection('app_data').doc(`tlbc_${key}`);
export async function readData(db, tx) {
  const pairs = await Promise.all(KEYS.map(async key => {
    const snap = await (tx ? tx.get(refFor(db, key)) : refFor(db, key).get());
    const items = snap.exists ? snap.data().items : structuredClone(defaults[key]);
    if (!Array.isArray(items)) fail(503, 'Não foi possível carregar a agenda. Entre em contato com a unidade.');
    return [key, key === 'shops' ? items.map(shopContact) : items];
  }));
  return Object.fromEntries(pairs);
}
export function writeData(db, tx, key, items) {
  if (Buffer.byteLength(JSON.stringify(items)) > 850000) fail(409, 'O limite da agenda foi atingido. Solicite manutenção antes de continuar.');
  tx.set(refFor(db, key), { items });
}
export function publicData(data) {
  return {
    shops: data.shops.filter(s => s.is_active).map(({ id, name, address, phone, is_active }) => ({ id, name, address, phone, is_active })),
    barbers: data.barbers.filter(b => b.is_active).map(({ id, shop_id, name, bio, photo_url, initials, color, is_active }) => ({ id, shop_id, name, bio, photo_url, initials, color, is_active })),
    services: data.services.filter(s => s.is_active),
    working_hours: data.working_hours,
    blocked_slots: data.blocked_slots.map(({ id, barber_id, date, start_time, end_time }) => ({ id, barber_id, date, start_time, end_time })),
    appointments: [],
    reviews: data.reviews.map(({ id, name, role, text, rating, barber_name, created_at }) => ({ id, name: String(name || '').split(' ')[0], role, text, rating, barber_name, created_at })),
  };
}
export function safeAppointment(appointment) {
  const { manage_hash: _hash, request_id: _request, ...safe } = appointment;
  return safe;
}
export function adminData(data) { return { ...data, appointments: data.appointments.map(safeAppointment) }; }
export function slotsFor(data, barberId, date, serviceId, now) {
  const barber = data.barbers.find(b => b.id === barberId && b.is_active);
  const service = data.services.find(s => s.id === serviceId && s.is_active);
  if (!barber || !service || !data.shops.some(s => s.id === barber.shop_id && s.is_active)) return [];
  if (service.id === 'svc-16' && barber.id !== 'barber-3') return [];
  return availableSlots({ barberId, date, duration: service.duration_minutes, hours: data.working_hours, blocked: data.blocked_slots, appointments: data.appointments, now });
}
export async function createBooking(db, input) {
  const { shop_id, barber_id, service_id, date, start_time, request_id } = input;
  const client_name = String(input.client_name || '').trim();
  const client_phone = normalizePhone(input.client_phone);
  if (client_name.length < 2 || client_name.length > 100 || !client_phone) fail(400, 'Informe um nome e telefone válidos com DDD.');
  if (![shop_id, barber_id, service_id].every(v => typeof v === 'string' && v.length <= 100) || !validDate(date) || !Number.isFinite(minutes(start_time))) fail(400, 'Revise a unidade, o profissional, o serviço e o horário.');
  if (!/^[a-zA-Z0-9-]{20,80}$/.test(request_id || '')) fail(400, 'Atualize a página e tente novamente.');
  const fingerprint = hash(JSON.stringify({ shop_id, barber_id, service_id, date, start_time, client_name, client_phone }));
  const requestRef = db.collection('booking_requests').doc(hash(request_id));
  const id = randomUUID(), manageToken = token();
  return db.runTransaction(async tx => {
    const previous = await tx.get(requestRef);
    const data = await readData(db, tx);
    if (previous.exists) {
      const saved = previous.data();
      if (saved.fingerprint !== fingerprint) fail(409, 'Este envio já foi utilizado. Atualize a página para uma nova reserva.');
      const appointment = data.appointments.find(a => a.id === saved.appointmentId);
      if (!appointment) fail(409, 'A reserva anterior não está disponível. Entre em contato com a unidade.');
      return { appointment: safeAppointment(appointment), manageToken: saved.manageToken, repeated: true };
    }
    const barber = data.barbers.find(b => b.id === barber_id && b.shop_id === shop_id && b.is_active);
    const service = data.services.find(s => s.id === service_id && s.is_active);
    const shop = data.shops.find(s => s.id === shop_id && s.is_active);
    if (!barber || !service || !shop) fail(400, 'A unidade, o barbeiro ou o serviço não está disponível.');
    if (!slotsFor(data, barber_id, date, service_id).some(s => s.time === start_time && s.available)) fail(409, 'Este horário não está mais disponível. Escolha outro horário.');
    const appointment = { id, shop_id, barber_id, service_id, client_name, client_phone, date, start_time,
      end_time: timeAt(minutes(start_time) + service.duration_minutes), price: service.price, status: 'scheduled', created_at: new Date().toISOString(),
      shop_name: shop.name, barber_name: barber.name, service_name: service.name, manage_hash: hash(manageToken) };
    writeData(db, tx, 'appointments', [...data.appointments, appointment]);
    tx.set(requestRef, { fingerprint, appointmentId: id, manageToken, expiresAt: new Date(Date.now() + 86400000) });
    tx.set(db.collection('notifications').doc(id), { appointment_id: id, status: 'pending', attempts: 0, recipient: shop.phone, created_at: new Date().toISOString() });
    return { appointment: safeAppointment(appointment), manageToken, repeated: false };
  });
}
export async function manageBooking(db, manageToken, cancel = false) {
  if (!/^[a-f0-9]{64}$/.test(manageToken || '')) fail(404, 'Link de agendamento inválido.');
  return db.runTransaction(async tx => {
    const data = await readData(db, tx);
    const appointment = data.appointments.find(a => a.manage_hash === hash(manageToken));
    if (!appointment) fail(404, 'Agendamento não encontrado.');
    if (cancel && appointment.status !== 'cancelled') {
      if (appointment.status !== 'scheduled' || new Date(`${appointment.date}T${appointment.start_time}:00-03:00`).getTime() <= Date.now()) fail(409, 'Este atendimento não pode ser cancelado pelo site. Fale com a unidade.');
      appointment.status = 'cancelled';
      appointment.cancelled_at = new Date().toISOString();
      writeData(db, tx, 'appointments', data.appointments);
    }
    return safeAppointment(appointment);
  });
}

function text(value, max = 100, required = true) {
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) fail(400, 'Preencha os campos corretamente.');
  return value.trim();
}
function clean(resource, input, data) {
  if (resource === 'barbers') {
    const name = text(input.name);
    if (!data.shops.some(s => s.id === input.shop_id && s.is_active)) fail(400, 'Selecione a unidade do barbeiro.');
    const photo = text(input.photo_url || '', 110000, false);
    if (photo && !/^https:\/\//.test(photo) && !/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(photo)) fail(400, 'Use uma foto JPG, PNG, WebP ou um endereço HTTPS.');
    return { name, shop_id: input.shop_id, bio: text(input.bio || '', 500, false), photo_url: photo, color: /^#[a-f\d]{6}$/i.test(input.color) ? input.color : '#F5C518', initials: name.split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase(), is_active: input.is_active !== false };
  }
  if (resource === 'services') {
    const price = Number(input.price), duration = Number(input.duration_minutes);
    if (!Number.isFinite(price) || price <= 0 || price > 10000 || !Number.isInteger(duration) || duration < 5 || duration > 480) fail(400, 'Informe um preço positivo e duração entre 5 e 480 minutos.');
    return { name: text(input.name), description: text(input.description || '', 500, false), price, duration_minutes: duration, is_active: input.is_active !== false };
  }
  if (resource === 'working_hours') {
    const start = input.start_time || '09:00', end = input.end_time || '20:00';
    if (!Number.isFinite(minutes(start)) || !Number.isFinite(minutes(end)) || minutes(start) >= minutes(end)) fail(400, 'O encerramento deve ser posterior à abertura.');
    return { start_time: start, end_time: end, is_off: Boolean(input.is_off) };
  }
  if (resource === 'blocked_slots') {
    if (!data.barbers.some(b => b.id === input.barber_id) || !validDate(input.date)) fail(400, 'Selecione um barbeiro e uma data válidos.');
    if ((input.start_time || input.end_time) && (!Number.isFinite(minutes(input.start_time)) || !Number.isFinite(minutes(input.end_time)) || minutes(input.start_time) >= minutes(input.end_time))) fail(400, 'Informe um intervalo válido ou marque dia inteiro.');
    return { barber_id: input.barber_id, date: input.date, start_time: input.start_time || null, end_time: input.end_time || null, reason: text(input.reason || '', 300, false) };
  }
  if (resource === 'appointments') {
    if (!['scheduled', 'cancelled', 'completed'].includes(input.status)) fail(400, 'Situação inválida.');
    return { status: input.status, ...(input.status === 'cancelled' ? { cancelled_at: new Date().toISOString() } : {}) };
  }
  if (resource === 'reviews') {
    const appt = data.appointments.find(a => a.id === input.appointment_id);
    if (!appt || appt.status !== 'scheduled' || data.reviews.some(r => r.appointment_id === appt.id)) fail(409, 'Atendimento indisponível ou avaliação já registrada.');
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) fail(400, 'A nota deve ser de 1 a 5.');
    return { name: appt.client_name, role: 'Cliente verificado', text: text(input.text || '', 1000, false), rating: input.rating, barber_name: appt.barber_name || data.barbers.find(b => b.id === appt.barber_id)?.name || '', appointment_id: appt.id };
  }
  fail(400, 'Operação inválida.');
}

export async function mutateData(db, { resource, operation, id, input = {} }) {
  const allowed = { barbers: ['create', 'update', 'delete'], services: ['create', 'update', 'delete'], working_hours: ['update'], blocked_slots: ['create', 'delete'], appointments: ['update'], reviews: ['create', 'delete'] };
  if (!allowed[resource]?.includes(operation) || typeof input !== 'object' || input === null || Array.isArray(input)) fail(400, 'Operação inválida.');
  return db.runTransaction(async tx => {
    const data = await readData(db, tx);
    const items = [...data[resource]];
    const index = items.findIndex(item => item.id === id);
    if (operation !== 'create' && index < 0) fail(404, 'Registro não encontrado. Atualize a página.');
    let item;
    if (operation === 'delete') {
      if (resource === 'barbers' || resource === 'services') {
        const field = resource === 'barbers' ? 'barber_id' : 'service_id';
        if (data.appointments.some(a => a[field] === id)) fail(409, 'Este cadastro tem histórico de atendimentos. Desative-o para preservar a agenda.');
      }
      items.splice(index, 1);
      if (resource === 'barbers') writeData(db, tx, 'working_hours', data.working_hours.filter(h => h.barber_id !== id));
    } else {
      if (resource === 'appointments' && items[index].status !== 'scheduled') fail(409, 'Este atendimento já foi encerrado.');
      const fields = clean(resource, { ...(items[index] || {}), ...input }, data);
      item = operation === 'create' ? { id: randomUUID(), ...fields, created_at: new Date().toISOString() } : { ...items[index], ...fields };
      if (operation === 'create') items.push(item); else items[index] = item;
      if (resource === 'barbers' && operation === 'create') writeData(db, tx, 'working_hours', [...data.working_hours, ...generateWorkingHours(item.id)]);
      if (resource === 'reviews' && operation === 'create') {
        writeData(db, tx, 'appointments', data.appointments.map(a => a.id === item.appointment_id ? { ...a, status: 'completed' } : a));
      }
    }
    writeData(db, tx, resource, items);
    return item ? (resource === 'appointments' ? safeAppointment(item) : item) : null;
  });
}
