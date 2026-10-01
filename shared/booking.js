export const TIME_ZONE = 'America/Sao_Paulo';
export const UNIT_PHONES = { 'shop-1': '5551982266759', 'shop-2': '5551981380060' };

export function shopContact(shop) {
  return { ...shop, phone: UNIT_PHONES[shop.id] || shop.phone || '' };
}

export function whatsappLink(shopId, text = 'Olá! Gostaria de agendar um horário.') {
  const phone = UNIT_PHONES[shopId];
  return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : null;
}

export function bookingWhatsappLink(appointment) {
  const message = `Olá! Acabei de agendar na ${appointment.shop_name} com ${appointment.barber_name}.\n` +
    `Cliente: ${appointment.client_name}\nWhatsApp: ${appointment.client_phone}\n` +
    `Serviço: ${appointment.service_name}\nData: ${appointment.date.split('-').reverse().join('/')} às ${appointment.start_time}.`;
  return whatsappLink(appointment.shop_id, message);
}

export function localDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = type => parts.find(p => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function minutes(time) {
  if (typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function timeAt(value) {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function normalizePhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 || digits.length === 13) {
    if (!digits.startsWith('55')) return '';
    digits = digits.slice(2);
  }
  return /^[1-9]{2}(?:[2-5]\d{7}|9\d{8})$/.test(digits) ? digits : '';
}

export function availableSlots({ barberId, date, duration, hours, blocked, appointments, now = new Date() }) {
  if (!validDate(date) || !Number.isInteger(duration) || duration < 5 || duration > 480) return [];
  const today = localDate(now);
  const max = new Date(`${today}T12:00:00Z`);
  max.setUTCDate(max.getUTCDate() + 90);
  if (date < today || date > max.toISOString().slice(0, 10)) return [];
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const work = hours.find(h => h.barber_id === barberId && h.day_of_week === weekday);
  if (!work || work.is_off) return [];
  const start = minutes(work.start_time), end = minutes(work.end_time);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return [];
  const busy = appointments.filter(a => a.barber_id === barberId && a.date === date && a.status !== 'cancelled');
  const blocks = blocked.filter(b => b.barber_id === barberId && b.date === date);
  const clock = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
  const threshold = minutes(clock) + 30;
  const slots = [];
  for (let m = start; m + duration <= end; m += 15) {
    if (date === today && m <= threshold) continue;
    const overlaps = range => m < minutes(range.end_time) && m + duration > minutes(range.start_time);
    slots.push({ time: timeAt(m), available: !busy.some(overlaps) && !blocks.some(b => !b.start_time || overlaps(b)) });
  }
  return slots;
}
