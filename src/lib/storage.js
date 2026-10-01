import { seedShops, seedBarbers, seedServices, generateWorkingHours } from '../../shared/catalog.js';
import { shopContact, normalizePhone } from '../../shared/booking.js';
export { localDate, whatsappLink } from '../../shared/booking.js';

const empty = () => ({ shops: seedShops.map(shopContact), barbers: seedBarbers, services: seedServices, working_hours: seedBarbers.flatMap(b => generateWorkingHours(b.id)), blocked_slots: [], appointments: [], reviews: [], notifications: [] });
let cache = empty();
export const storeSnapshot = () => cache;
let adminMode = false;
let refreshInFlight = null;
let generation = 0;
function updated() {
  for (const key of ['tlbc_shops', 'tlbc_barbers', 'tlbc_services', 'tlbc_working_hours', 'tlbc_blocked_slots', 'tlbc_appointments', 'tlbc_reviews']) {
    window.dispatchEvent(new CustomEvent('tlbc_storage_update', { detail: { key } }));
  }
}
export function initStorage() {
  // Stop trusting legacy flags. Do not erase existing local data during migration.
  try { localStorage.removeItem('tlbc_admin_auth'); localStorage.removeItem('tlbc_admin_password'); } catch { /* storage may be unavailable */ }
}
export async function request(action, body, query = {}) {
  const params = new URLSearchParams({ action, ...query });
  const res = await fetch('/api?' + params, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', headers: body === undefined ? {} : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const error = new Error(data.error || 'Não foi possível conectar ao servidor. Tente novamente.'); error.status = res.status; throw error; }
  return data;
}
export async function refreshData() {
  if (refreshInFlight) return refreshInFlight;
  const version = generation;
  refreshInFlight = request('data', undefined, adminMode ? { admin: '1' } : {}).then(data => {
    if (version === generation) { cache = data; updated(); }
  }).catch(error => {
    if (error.status === 401 && adminMode && version === generation) {
      cache = empty(); adminMode = false; generation++; updated(); window.dispatchEvent(new Event('tlbc_session_expired'));
    }
    throw error;
  }).finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}
export async function loadAdminData() {
  await request('session');
  if (refreshInFlight) await refreshInFlight.catch(() => {});
  adminMode = true; generation++;
  await refreshData();
}
export async function logoutAdmin() {
  await request('logout', {});
  adminMode = false; generation++; cache = empty(); updated();
}
export function initFirebaseSync() {
  // Compatibility name: browsers now read only the server API, never Firestore directly.
  const refresh = () => { if (!document.hidden) refreshData().catch(() => {}); };
  const timer = setInterval(refresh, 15000);
  window.addEventListener('focus', refresh);
  return () => { clearInterval(timer); window.removeEventListener('focus', refresh); };
}
async function mutate(resource, operation, id, input) {
  const { item } = await request('mutate', { resource, operation, id, input });
  // The mutation has committed even if the following read temporarily fails.
  try { await refreshData(); } catch { window.dispatchEvent(new CustomEvent('tlbc_toast', { detail: { type: 'info', message: 'Alteração salva. Atualize a página para recarregar a lista.' } })); }
  return item;
}
const api = resource => ({ getAll: () => cache[resource] || [], getById: id => (cache[resource] || []).find(item => item.id === id),
  create: input => mutate(resource, 'create', undefined, input), update: (id, input) => mutate(resource, 'update', id, input), delete: id => mutate(resource, 'delete', id) });
export const shopsApi = { ...api('shops'), getActive: () => cache.shops.filter(s => s.is_active) };
export const barbersApi = { ...api('barbers'), getActive: () => cache.barbers.filter(b => b.is_active), getByShop: id => cache.barbers.filter(b => b.is_active && b.shop_id === id) };
export const servicesApi = { ...api('services'), getActive: () => cache.services.filter(s => s.is_active) };
export const workingHoursApi = { ...api('working_hours'), getByBarber: id => cache.working_hours.filter(h => h.barber_id === id),
  getHoursForDate: (id, date) => cache.working_hours.find(h => h.barber_id === id && h.day_of_week === new Date(date + 'T12:00:00Z').getUTCDay()),
  isBarberWorkingOnDate: (id, date) => { const h = workingHoursApi.getHoursForDate(id, date); return h && !h.is_off; } };
export const blockedSlotsApi = { ...api('blocked_slots'), getByBarberAndDate: (id, date) => cache.blocked_slots.filter(b => b.barber_id === id && b.date === date) };
export const appointmentsApi = { ...api('appointments'),
  getByDate: date => cache.appointments.filter(a => a.date === date && a.status !== 'cancelled'),
  getByBarberAndDate: (id, date) => cache.appointments.filter(a => a.barber_id === id && a.date === date && a.status !== 'cancelled'),
  getByPhone: phone => { const digits = normalizePhone(phone); return digits ? cache.appointments.filter(a => normalizePhone(a.client_phone) === digits) : []; },
  create: async data => {
    const result = await request('booking', data);
    const appointment = { ...result.appointment, manageToken: result.manageToken, notificationStatus: result.notificationStatus };
    try {
      const previous = savedBookings().filter(a => a.id !== appointment.id);
      localStorage.setItem('tlbc_my_bookings', JSON.stringify([...previous, { id: appointment.id, token: result.manageToken }].slice(-30)));
    } catch { /* the private link remains available to copy on the success screen */ }
    return appointment;
  },
  cancel: id => mutate('appointments', 'update', id, { status: 'cancelled' }),
};
export const reviewsApi = { ...api('reviews'), getAll: () => [...cache.reviews].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)) };
export const notificationInfo = () => ({ configured: cache.whatsappConfigured, items: cache.notifications || [] });
export async function retryNotification(id) { const result = await request('retry', { id }); await refreshData(); return result; }
export async function getAvailableSlots(barberId, date, serviceId) { return (await request('availability', undefined, { barber: barberId, date, service: serviceId })).slots; }
export function savedBookings() { try { const data = JSON.parse(localStorage.getItem('tlbc_my_bookings') || '[]'); return Array.isArray(data) ? data.filter(a => /^[a-f0-9]{64}$/.test(a.token || '')) : []; } catch { return []; } }
export async function manageBooking(token, cancel = false) { return (await request('manage', { token, cancel })).appointment; }
export function managementLink(token) { return window.location.origin + '/#reserva=' + token; }

export function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}
export const formatCurrency = formatPrice;

export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, d));
}

export function formatTime(timeStr) {
  const [h, m] = timeStr.split(':');
  return `${h}:${m}`;
}

export function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length === 10) return '(' + digits.slice(0,2) + ') ' + digits.slice(2,6) + '-' + digits.slice(6);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  return value;
}


export function calendarDate(date) { return [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-'); }
