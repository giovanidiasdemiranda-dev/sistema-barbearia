// Storage Layer — LocalStorage-based data persistence
// Replace with Supabase when credentials are available

const KEYS = {
  BARBERS: 'tlbc_barbers',
  SERVICES: 'tlbc_services',
  APPOINTMENTS: 'tlbc_appointments',
  WORKING_HOURS: 'tlbc_working_hours',
  BLOCKED_SLOTS: 'tlbc_blocked_slots',
  SHOPS: 'tlbc_shops',
};

// ─── Seed Data ───────────────────────────────────────────────────
const seedShops = [
  { id: 'shop-1', name: 'Sede Colômbia', address: 'Rua Principal, 123', is_active: true },
  { id: 'shop-2', name: 'Filial Central', address: 'Av. Libertador, 456', is_active: true },
];
const seedBarbers = [
  {
    id: 'barber-1',
    shop_id: 'shop-1',
    name: 'Carlos Mendez',
    bio: 'Especialista em cortes clássicos e fade. 8 anos de experiência.',
    photo_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    initials: 'CM',
    color: '#FCD116',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'barber-2',
    shop_id: 'shop-1',
    name: 'Rafael Silva',
    bio: 'Expert em barba e design de rosto. Mestre do razor.',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    initials: 'RS',
    color: '#003893',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'barber-3',
    shop_id: 'shop-2',
    name: 'Diego Rojas',
    bio: 'Cortes modernos e tendências. Do degradê ao skin fade.',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    initials: 'DR',
    color: '#CE1126',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const seedServices = [
  { id: 'svc-1', name: 'Corte Clássico', description: 'Corte tradicional com tesoura e pente', price: 45, duration_minutes: 30, is_active: true },
  { id: 'svc-2', name: 'Corte + Barba', description: 'Corte completo com modelagem de barba', price: 75, duration_minutes: 60, is_active: true },
  { id: 'svc-3', name: 'Barba Completa', description: 'Modelagem, hidratação e acabamento', price: 40, duration_minutes: 30, is_active: true },
  { id: 'svc-4', name: 'Skin Fade', description: 'Degradê perfeito na máquina zero a zero', price: 55, duration_minutes: 45, is_active: true },
  { id: 'svc-5', name: 'Combo Premium', description: 'Corte + barba + sobrancelha + hidratação', price: 100, duration_minutes: 90, is_active: true },
  { id: 'svc-6', name: 'Sobrancelha', description: 'Design e alinhamento de sobrancelha', price: 20, duration_minutes: 15, is_active: true },
  { id: 'svc-7', name: 'Corte Infantil', description: 'Corte especial para crianças até 12 anos', price: 35, duration_minutes: 30, is_active: true },
  { id: 'svc-8', name: 'Pigmentação', description: 'Coloração e disfarce de grisalhos', price: 60, duration_minutes: 45, is_active: true },
];

// Working hours: 0=Sunday, 1=Monday, ..., 6=Saturday
const generateWorkingHours = (barberId) => [
  { id: `wh-${barberId}-0`, barber_id: barberId, day_of_week: 0, start_time: null, end_time: null, is_off: true },
  { id: `wh-${barberId}-1`, barber_id: barberId, day_of_week: 1, start_time: '09:00', end_time: '19:00', is_off: false },
  { id: `wh-${barberId}-2`, barber_id: barberId, day_of_week: 2, start_time: '09:00', end_time: '19:00', is_off: false },
  { id: `wh-${barberId}-3`, barber_id: barberId, day_of_week: 3, start_time: '09:00', end_time: '19:00', is_off: false },
  { id: `wh-${barberId}-4`, barber_id: barberId, day_of_week: 4, start_time: '09:00', end_time: '19:00', is_off: false },
  { id: `wh-${barberId}-5`, barber_id: barberId, day_of_week: 5, start_time: '09:00', end_time: '20:00', is_off: false },
  { id: `wh-${barberId}-6`, barber_id: barberId, day_of_week: 6, start_time: '09:00', end_time: '17:00', is_off: false },
];

// ─── Seed Appointments ──────────────────────────────────────────
const seedAppointmentsData = [
  // Week 1 of Sep (01 to 05) - All completed
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-1', price: 45, date: '2026-09-01', start_time: '10:00', end_time: '10:30', client_name: 'Marcos Paulo', client_phone: '(11) 98111-2233', status: 'completed' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-2', price: 75, date: '2026-09-01', start_time: '14:00', end_time: '15:00', client_name: 'Felipe Dias', client_phone: '(11) 98222-3344', status: 'completed' },
  { shop_id: 'shop-2', barber_id: 'barber-3', service_id: 'svc-5', price: 100, date: '2026-09-02', start_time: '11:00', end_time: '12:30', client_name: 'Ricardo Gomes', client_phone: '(11) 98333-4455', status: 'completed' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-4', price: 55, date: '2026-09-02', start_time: '15:30', end_time: '16:15', client_name: 'João Vitor', client_phone: '(11) 98444-5566', status: 'completed' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-3', price: 40, date: '2026-09-03', start_time: '09:30', end_time: '10:00', client_name: 'Marcelo Lima', client_phone: '(11) 98555-6677', status: 'completed' },
  { shop_id: 'shop-2', barber_id: 'barber-3', service_id: 'svc-2', price: 75, date: '2026-09-03', start_time: '16:00', end_time: '17:00', client_name: 'Alexandre Cruz', client_phone: '(11) 98666-7788', status: 'completed' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-5', price: 100, date: '2026-09-04', start_time: '10:30', end_time: '12:00', client_name: 'Pedro Henrique', client_phone: '(11) 98777-8899', status: 'completed' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-4', price: 55, date: '2026-09-04', start_time: '14:30', end_time: '15:15', client_name: 'Renan Castro', client_phone: '(11) 98888-9900', status: 'completed' },
  { shop_id: 'shop-2', barber_id: 'barber-3', service_id: 'svc-2', price: 75, date: '2026-09-04', start_time: '17:00', end_time: '18:00', client_name: 'Danilo Silva', client_phone: '(11) 98999-0011', status: 'completed' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-2', price: 75, date: '2026-09-05', start_time: '09:00', end_time: '10:00', client_name: 'Gabriel Farias', client_phone: '(11) 97000-1122', status: 'completed' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-5', price: 100, date: '2026-09-05', start_time: '11:00', end_time: '12:30', client_name: 'Lucas Pires', client_phone: '(11) 97111-2233', status: 'completed' },
  { shop_id: 'shop-2', barber_id: 'barber-3', service_id: 'svc-4', price: 55, date: '2026-09-05', start_time: '14:00', end_time: '14:45', client_name: 'Guilherme Neves', client_phone: '(11) 97222-3344', status: 'completed' },

  // Week 2 (Current Week: 2026-09-07 to 2026-09-13)
  // Monday (Today, 07/09)
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-2', price: 75, date: '2026-09-07', start_time: '09:30', end_time: '10:30', client_name: 'Lucas Santos', client_phone: '(11) 98765-4321', status: 'completed' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-4', price: 55, date: '2026-09-07', start_time: '11:00', end_time: '11:45', client_name: 'Matheus Costa', client_phone: '(11) 96543-2109', status: 'completed' },
  { shop_id: 'shop-2', barber_id: 'barber-3', service_id: 'svc-5', price: 100, date: '2026-09-07', start_time: '14:00', end_time: '15:30', client_name: 'Gabriel Oliveira', client_phone: '(11) 97654-3210', status: 'completed' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-1', price: 45, date: '2026-09-07', start_time: '16:30', end_time: '17:00', client_name: 'Rodrigo Lima', client_phone: '(11) 95432-1098', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-3', price: 40, date: '2026-09-07', start_time: '18:00', end_time: '18:30', client_name: 'Felipe Almeida', client_phone: '(11) 94321-0987', status: 'scheduled' },

  // Tuesday (08/09)
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-5', price: 100, date: '2026-09-08', start_time: '10:00', end_time: '11:30', client_name: 'Bruno Carvalho', client_phone: '(11) 93210-9876', status: 'scheduled' },
  { shop_id: 'shop-2', barber_id: 'barber-3', service_id: 'svc-4', price: 55, date: '2026-09-08', start_time: '13:30', end_time: '14:15', client_name: 'Thiago Pereira', client_phone: '(11) 92109-8765', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-1', price: 45, date: '2026-09-08', start_time: '15:00', end_time: '15:30', client_name: 'André Silva', client_phone: '(11) 91098-7654', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-2', price: 75, date: '2026-09-08', start_time: '17:00', end_time: '18:00', client_name: 'Vinícius Souza', client_phone: '(11) 90987-6543', status: 'scheduled' },

  // Wednesday (09/09)
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-2', price: 75, date: '2026-09-09', start_time: '09:00', end_time: '10:00', client_name: 'Leonardo Martins', client_phone: '(11) 99876-5432', status: 'scheduled' },
  { shop_id: 'shop-2', barber_id: 'barber-3', service_id: 'svc-5', price: 100, date: '2026-09-09', start_time: '11:30', end_time: '13:00', client_name: 'Eduardo Rocha', client_phone: '(11) 98123-4567', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-1', price: 45, date: '2026-09-09', start_time: '14:00', end_time: '14:30', client_name: 'Guilherme Castro', client_phone: '(11) 97234-5678', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-4', price: 55, date: '2026-09-09', start_time: '16:30', end_time: '17:15', client_name: 'Henrique Ramos', client_phone: '(11) 96345-6789', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-3', price: 40, date: '2026-09-09', start_time: '18:30', end_time: '19:00', client_name: 'Gustavo Barbosa', client_phone: '(11) 95456-7890', status: 'scheduled' },

  // Thursday (10/09)
  { shop_id: 'shop-2', barber_id: 'barber-3', service_id: 'svc-2', price: 75, date: '2026-09-10', start_time: '10:00', end_time: '11:00', client_name: 'Lucas Moura', client_phone: '(11) 94567-8901', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-4', price: 55, date: '2026-09-10', start_time: '14:00', end_time: '14:45', client_name: 'Fernando Dias', client_phone: '(11) 93678-9012', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-5', price: 100, date: '2026-09-10', start_time: '16:00', end_time: '17:30', client_name: 'Marcelo Ribeiro', client_phone: '(11) 92789-0123', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-1', price: 45, date: '2026-09-10', start_time: '18:00', end_time: '18:30', client_name: 'Caio Moreira', client_phone: '(11) 91890-1234', status: 'scheduled' },

  // Friday (11/09)
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-5', price: 100, date: '2026-09-11', start_time: '09:30', end_time: '11:00', client_name: 'Arthur Nogueira', client_phone: '(11) 90901-2345', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-2', price: 75, date: '2026-09-11', start_time: '11:30', end_time: '12:30', client_name: 'Daniel Farias', client_phone: '(11) 99012-3456', status: 'scheduled' },
  { shop_id: 'shop-2', barber_id: 'barber-3', service_id: 'svc-4', price: 55, date: '2026-09-11', start_time: '14:00', end_time: '14:45', client_name: 'Renan Cardoso', client_phone: '(11) 98123-4560', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-1', price: 45, date: '2026-09-11', start_time: '15:30', end_time: '16:00', client_name: 'Murilo Guimarães', client_phone: '(11) 97234-5601', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-2', price: 75, date: '2026-09-11', start_time: '17:00', end_time: '18:00', client_name: 'Samuel Pires', client_phone: '(11) 96345-6712', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-3', price: 40, date: '2026-09-11', start_time: '19:00', end_time: '19:30', client_name: 'Otávio Leal', client_phone: '(11) 95456-7823', status: 'scheduled' },

  // Saturday (12/09)
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-5', price: 100, date: '2026-09-12', start_time: '09:00', end_time: '10:30', client_name: 'Igor Teodoro', client_phone: '(11) 94567-8934', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-2', price: 75, date: '2026-09-12', start_time: '10:30', end_time: '11:30', client_name: 'Victor Hugo', client_phone: '(11) 93678-9045', status: 'scheduled' },
  { shop_id: 'shop-2', barber_id: 'barber-3', service_id: 'svc-4', price: 55, date: '2026-09-12', start_time: '12:00', end_time: '12:45', client_name: 'Alex Sandro', client_phone: '(11) 92789-0156', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-2', price: 75, date: '2026-09-12', start_time: '13:30', end_time: '14:30', client_name: 'Leandro Paiva', client_phone: '(11) 91890-1267', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-5', price: 100, date: '2026-09-12', start_time: '15:00', end_time: '16:30', client_name: 'Cauã Freitas', client_phone: '(11) 90901-2378', status: 'scheduled' },
  { shop_id: 'shop-2', barber_id: 'barber-3', service_id: 'svc-1', price: 45, date: '2026-09-12', start_time: '16:30', end_time: '17:00', client_name: 'Davi Lucca', client_phone: '(11) 99012-3489', status: 'scheduled' },

  // Weeks 3 & 4 (14 to 28 Sep) - Pipeline
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-2', price: 75, date: '2026-09-15', start_time: '10:00', end_time: '11:00', client_name: 'Bernardo Ramos', client_phone: '(11) 98111-9988', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-5', price: 100, date: '2026-09-16', start_time: '14:00', end_time: '15:30', client_name: 'Enzo Gabriel', client_phone: '(11) 98222-8877', status: 'scheduled' },
  { shop_id: 'shop-2', barber_id: 'barber-3', service_id: 'svc-4', price: 55, date: '2026-09-18', start_time: '16:00', end_time: '16:45', client_name: 'Joaquim Silva', client_phone: '(11) 98333-7766', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-5', price: 100, date: '2026-09-19', start_time: '11:00', end_time: '12:30', client_name: 'Felipe Santana', client_phone: '(11) 98444-6655', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-2', service_id: 'svc-2', price: 75, date: '2026-09-22', start_time: '15:00', end_time: '16:00', client_name: 'Nicolas Ferreira', client_phone: '(11) 98555-5544', status: 'scheduled' },
  { shop_id: 'shop-2', barber_id: 'barber-3', service_id: 'svc-5', price: 100, date: '2026-09-25', start_time: '13:30', end_time: '15:00', client_name: 'Heitor Azevedo', client_phone: '(11) 98666-4433', status: 'scheduled' },
  { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-2', price: 75, date: '2026-09-26', start_time: '10:00', end_time: '11:00', client_name: 'Lorenzo Moreira', client_phone: '(11) 98777-3322', status: 'scheduled' },
];

const buildSeedAppointments = () => seedAppointmentsData.map((a, i) => ({
  id: `seed-appt-${i + 1}`,
  booking_code: `TLBC-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  created_at: '2026-09-01T08:00:00Z',
  ...a,
}));

// ─── Init / Seed ─────────────────────────────────────────────────
const VERSION_KEY = 'tlbc_version_4';
export function initStorage() {
  if (!localStorage.getItem(VERSION_KEY)) {
    localStorage.clear();
    localStorage.setItem(VERSION_KEY, 'true');
    localStorage.setItem(KEYS.SHOPS, JSON.stringify(seedShops));
    localStorage.setItem(KEYS.BARBERS, JSON.stringify(seedBarbers));
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(seedServices));
    const hours = seedBarbers.flatMap(b => generateWorkingHours(b.id));
    localStorage.setItem(KEYS.WORKING_HOURS, JSON.stringify(hours));
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(buildSeedAppointments()));
    localStorage.setItem(KEYS.BLOCKED_SLOTS, JSON.stringify([]));
    return;
  }

  if (!localStorage.getItem(KEYS.SHOPS)) {
    localStorage.setItem(KEYS.SHOPS, JSON.stringify(seedShops));
  }
  if (!localStorage.getItem(KEYS.BARBERS)) {
    localStorage.setItem(KEYS.BARBERS, JSON.stringify(seedBarbers));
  }
  if (!localStorage.getItem(KEYS.SERVICES)) {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(seedServices));
  }
  if (!localStorage.getItem(KEYS.WORKING_HOURS)) {
    const hours = seedBarbers.flatMap(b => generateWorkingHours(b.id));
    localStorage.setItem(KEYS.WORKING_HOURS, JSON.stringify(hours));
  }
  if (!localStorage.getItem(KEYS.APPOINTMENTS)) {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.BLOCKED_SLOTS)) {
    localStorage.setItem(KEYS.BLOCKED_SLOTS, JSON.stringify([]));
  }
}

// ─── Generic helpers ─────────────────────────────────────────────
function getAll(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}
function saveAll(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tlbc_storage_update', { detail: { key } }));
  }
}
function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── SHOPS ─────────────────────────────────────────────────────
export const shopsApi = {
  getAll: () => getAll(KEYS.SHOPS),
  getActive: () => getAll(KEYS.SHOPS).filter(s => s.is_active),
  getById: (id) => getAll(KEYS.SHOPS).find(s => s.id === id),
};

// ─── BARBERS ─────────────────────────────────────────────────────
export const barbersApi = {
  getAll: () => getAll(KEYS.BARBERS),
  getActive: () => getAll(KEYS.BARBERS).filter(b => b.is_active),
  getByShop: (shopId) => getAll(KEYS.BARBERS).filter(b => b.is_active && b.shop_id === shopId),
  getById: (id) => getAll(KEYS.BARBERS).find(b => b.id === id),
  create: (data) => {
    const barbers = getAll(KEYS.BARBERS);
    const newBarber = { id: genId(), is_active: true, created_at: new Date().toISOString(), ...data };
    barbers.push(newBarber);
    saveAll(KEYS.BARBERS, barbers);
    // Add default working hours
    const hours = getAll(KEYS.WORKING_HOURS);
    const newHours = generateWorkingHours(newBarber.id);
    saveAll(KEYS.WORKING_HOURS, [...hours, ...newHours]);
    return newBarber;
  },
  update: (id, data) => {
    const barbers = getAll(KEYS.BARBERS).map(b => b.id === id ? { ...b, ...data } : b);
    saveAll(KEYS.BARBERS, barbers);
    return barbers.find(b => b.id === id);
  },
  delete: (id) => {
    saveAll(KEYS.BARBERS, getAll(KEYS.BARBERS).filter(b => b.id !== id));
    saveAll(KEYS.WORKING_HOURS, getAll(KEYS.WORKING_HOURS).filter(h => h.barber_id !== id));
  },
};

// ─── SERVICES ─────────────────────────────────────────────────────
export const servicesApi = {
  getAll: () => getAll(KEYS.SERVICES),
  getActive: () => getAll(KEYS.SERVICES).filter(s => s.is_active),
  getById: (id) => getAll(KEYS.SERVICES).find(s => s.id === id),
  create: (data) => {
    const services = getAll(KEYS.SERVICES);
    const newService = { id: genId(), is_active: true, ...data };
    services.push(newService);
    saveAll(KEYS.SERVICES, services);
    return newService;
  },
  update: (id, data) => {
    const services = getAll(KEYS.SERVICES).map(s => s.id === id ? { ...s, ...data } : s);
    saveAll(KEYS.SERVICES, services);
    return services.find(s => s.id === id);
  },
  delete: (id) => saveAll(KEYS.SERVICES, getAll(KEYS.SERVICES).filter(s => s.id !== id)),
};

// ─── WORKING HOURS ─────────────────────────────────────────────────
export const workingHoursApi = {
  getByBarber: (barberId) => getAll(KEYS.WORKING_HOURS).filter(h => h.barber_id === barberId),
  update: (id, data) => {
    const hours = getAll(KEYS.WORKING_HOURS).map(h => h.id === id ? { ...h, ...data } : h);
    saveAll(KEYS.WORKING_HOURS, hours);
  },
  isBarberWorkingOnDate: (barberId, date) => {
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const hours = getAll(KEYS.WORKING_HOURS).find(h => h.barber_id === barberId && h.day_of_week === dayOfWeek);
    return hours && !hours.is_off;
  },
  getHoursForDate: (barberId, date) => {
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    return getAll(KEYS.WORKING_HOURS).find(h => h.barber_id === barberId && h.day_of_week === dayOfWeek);
  },
};

// ─── BLOCKED SLOTS ─────────────────────────────────────────────────
export const blockedSlotsApi = {
  getAll: () => getAll(KEYS.BLOCKED_SLOTS),
  getByBarberAndDate: (barberId, date) =>
    getAll(KEYS.BLOCKED_SLOTS).filter(b => b.barber_id === barberId && b.date === date),
  create: (data) => {
    const slots = getAll(KEYS.BLOCKED_SLOTS);
    const newSlot = { id: genId(), ...data };
    slots.push(newSlot);
    saveAll(KEYS.BLOCKED_SLOTS, slots);
    return newSlot;
  },
  delete: (id) => saveAll(KEYS.BLOCKED_SLOTS, getAll(KEYS.BLOCKED_SLOTS).filter(s => s.id !== id)),
};

// ─── APPOINTMENTS ─────────────────────────────────────────────────
export const appointmentsApi = {
  getAll: () => getAll(KEYS.APPOINTMENTS),
  getByDate: (date) => getAll(KEYS.APPOINTMENTS).filter(a => a.date === date && a.status !== 'cancelled'),
  getByBarberAndDate: (barberId, date) =>
    getAll(KEYS.APPOINTMENTS).filter(a => a.barber_id === barberId && a.date === date && a.status !== 'cancelled'),
  getByPhone: (phone) => {
    const clean = phone.replace(/\D/g, '');
    return getAll(KEYS.APPOINTMENTS).filter(a => a.client_phone.replace(/\D/g, '').includes(clean));
  },
  getByCode: (code) => getAll(KEYS.APPOINTMENTS).find(a => a.booking_code === code.toUpperCase()),
  create: (data) => {
    const appointments = getAll(KEYS.APPOINTMENTS);
    const booking_code = generateBookingCode();
    
    // Auto-fetch price from service if not provided
    let price = data.price;
    if (price === undefined && data.service_id) {
      const svc = servicesApi.getById(data.service_id);
      if (svc) price = svc.price;
    }

    const newAppointment = {
      id: genId(),
      booking_code,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      price: price || 0,
      ...data,
    };
    appointments.push(newAppointment);
    saveAll(KEYS.APPOINTMENTS, appointments);
    return newAppointment;
  },
  update: (id, data) => {
    const appointments = getAll(KEYS.APPOINTMENTS).map(a => a.id === id ? { ...a, ...data } : a);
    saveAll(KEYS.APPOINTMENTS, appointments);
    return appointments.find(a => a.id === id);
  },
  cancel: (id) => {
    const appointments = getAll(KEYS.APPOINTMENTS).map(a =>
      a.id === id ? { ...a, status: 'cancelled', cancelled_at: new Date().toISOString() } : a
    );
    saveAll(KEYS.APPOINTMENTS, appointments);
  },
  cancelByCode: (code) => {
    const appointments = getAll(KEYS.APPOINTMENTS).map(a =>
      a.booking_code === code.toUpperCase()
        ? { ...a, status: 'cancelled', cancelled_at: new Date().toISOString() }
        : a
    );
    saveAll(KEYS.APPOINTMENTS, appointments);
  },
  clearAll: () => {
    saveAll(KEYS.APPOINTMENTS, []);
  },
};

// ─── Available Time Slots ─────────────────────────────────────────
export function getAvailableSlots(barberId, date, durationMinutes) {
  const workingHours = workingHoursApi.getHoursForDate(barberId, date);
  if (!workingHours || workingHours.is_off) return [];

  const { start_time, end_time } = workingHours;
  if (!start_time || !end_time) return [];

  // Check if date is blocked entirely
  const blocked = blockedSlotsApi.getByBarberAndDate(barberId, date);
  const appointments = appointmentsApi.getByBarberAndDate(barberId, date);

  const slots = [];
  const [startH, startM] = start_time.split(':').map(Number);
  const [endH, endM] = end_time.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let m = startMinutes; m + durationMinutes <= endMinutes; m += 30) {
    const slotStart = m;
    const slotEnd = m + durationMinutes;
    const timeStr = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

    // Check if today — skip past times
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (slotStart <= nowMinutes + 30) continue;
    }

    // Check against existing appointments
    const hasAppointment = appointments.some(a => {
      const [aH, aM] = a.start_time.split(':').map(Number);
      const [eH, eM] = a.end_time.split(':').map(Number);
      const aStart = aH * 60 + aM;
      const aEnd = eH * 60 + eM;
      return slotStart < aEnd && slotEnd > aStart;
    });

    // Check against blocked slots
    const isBlocked = blocked.some(b => {
      if (!b.start_time) return true; // full day block
      const [bH, bM] = b.start_time.split(':').map(Number);
      const [beH, beM] = b.end_time.split(':').map(Number);
      const bStart = bH * 60 + bM;
      const bEnd = beH * 60 + beM;
      return slotStart < bEnd && slotEnd > bStart;
    });

    slots.push({ time: timeStr, available: !hasAppointment && !isBlocked });
  }

  return slots;
}

// ─── Helpers ─────────────────────────────────────────────────────
function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  return value;
}
