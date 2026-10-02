import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MemoryDb } from './memory-db.js';
import { createBooking, readData, publicData, mutateData, manageBooking, slotsFor } from '../server/data.js';
import { makeHandler } from '../server/app.js';
import { availableSlots, localDate, whatsappLink, bookingWhatsappLink } from '../shared/booking.js';

function input(overrides = {}) {
  let offset = 1;
  let date = localDate(new Date(Date.now() + offset * 86400000));
  while (new Date(`${date}T12:00:00Z`).getUTCDay() === 0) date = localDate(new Date(Date.now() + ++offset * 86400000));
  return { shop_id: 'shop-1', barber_id: 'barber-1', service_id: 'svc-1', client_name: 'Cliente de teste', client_phone: '51999999999', date, start_time: '10:00', request_id: randomUUID(), ...overrides };
}

test('two concurrent reservations cannot occupy the same barber and time', async () => {
  const db = new MemoryDb();
  const results = await Promise.allSettled([createBooking(db, input()), createBooking(db, input())]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.status, 409);
  assert.equal((await readData(db)).appointments.length, 1);
});

test('existing reservations from the old site keep their time slot occupied', async () => {
  const db = new MemoryDb();
  const body = input();
  await db.collection('app_data').doc('tlbc_appointments').set({ items: [{
    id: 'legacy-appointment', booking_code: 'LEGACY', shop_id: body.shop_id,
    barber_id: body.barber_id, service_id: body.service_id, date: body.date,
    start_time: body.start_time, end_time: '10:45', status: 'scheduled',
    client_name: 'Cliente anterior', client_phone: '(51) 99999-9999', price: 35,
  }] });
  await assert.rejects(createBooking(db, body), { status: 409 });
  assert.equal((await readData(db)).appointments.length, 1);
});
test('repeating the same request returns the same reservation and private link', async () => {
  const db = new MemoryDb(), body = input();
  const [a, b] = await Promise.all([createBooking(db, body), createBooking(db, body)]);
  assert.equal(a.appointment.id, b.appointment.id);
  assert.equal(a.manageToken, b.manageToken);
  assert.equal(b.repeated, true);
  assert.ok(!('booking_code' in a.appointment));
  assert.ok(!('manage_hash' in a.appointment));
});
test('server owns price, duration, status, shop assignment and collision checks', async () => {
  const db = new MemoryDb();
  const result = await createBooking(db, input({ price: 0, end_time: '10:01', status: 'completed' }));
  assert.equal(result.appointment.price, 35);
  assert.equal(result.appointment.end_time, '10:45');
  assert.equal(result.appointment.status, 'scheduled');
  await assert.rejects(createBooking(db, input({ start_time: '10:30' })), { status: 409 });
  await assert.rejects(createBooking(db, input({ shop_id: 'shop-2' })), { status: 400 });
  await assert.rejects(createBooking(db, input({ date: '2026-02-30' })), { status: 400 });
  await assert.rejects(createBooking(db, input({ client_phone: '123' })), { status: 400 });
});
test('failed persistence never creates a confirmed reservation', async () => {
  const db = new MemoryDb(); db.failWrites = true;
  await assert.rejects(createBooking(db, input()));
  assert.equal(db.records.size, 0);
});
test('private link cancels only its own reservation and releases the slot', async () => {
  const db = new MemoryDb(), body = input();
  const a = await createBooking(db, body);
  await assert.rejects(manageBooking(db, '0'.repeat(64), true), { status: 404 });
  const cancelled = await manageBooking(db, a.manageToken, true);
  assert.equal(cancelled.status, 'cancelled');
  assert.equal((await manageBooking(db, a.manageToken, true)).status, 'cancelled');
  assert.ok(slotsFor(await readData(db), body.barber_id, body.date, body.service_id).some(s => s.time === body.start_time && s.available));
});
test('public catalog never includes customer records, management hashes or private block reasons', async () => {
  const db = new MemoryDb(); await createBooking(db, input());
  const data = await readData(db);
  data.blocked_slots.push({ id: 'block', barber_id: 'barber-1', date: input().date, reason: 'private reason' });
  const encoded = JSON.stringify(publicData(data));
  assert.ok(!encoded.includes('Cliente de teste'));
  assert.ok(!encoded.includes('51999999999'));
  assert.ok(!encoded.includes('manage_hash'));
  assert.ok(!encoded.includes('private reason'));
});
test('unit phones and the São Paulo date remain correct after midnight UTC', () => {
  assert.match(whatsappLink('shop-1'), /^https:\/\/wa.me\/5551982266759\?/);
  assert.match(whatsappLink('shop-2'), /^https:\/\/wa.me\/5551981380060\?/);
  assert.equal(localDate(new Date('2026-10-02T01:30:00Z')), '2026-10-01');
  const slots = availableSlots({ barberId: 'b', date: '2026-10-01', duration: 30, hours: [{ barber_id: 'b', day_of_week: 4, start_time: '09:00', end_time: '20:00' }], blocked: [], appointments: [], now: new Date('2026-10-02T01:30:00Z') });
  assert.deepEqual(slots, []);
});
test('booking message opens the selected unit with reservation details ready to send', () => {
  for (const [shop_id, phone] of [['shop-1', '5551982266759'], ['shop-2', '5551981380060']]) {
    const appointment = { shop_id, shop_name: 'Unidade', barber_name: 'Barbeiro', client_name: 'Cliente', client_phone: '51999999999', service_name: 'Corte', date: '2026-10-02', start_time: '10:00' };
    const url = new URL(bookingWhatsappLink(appointment));
    assert.equal(url.hostname, 'wa.me');
    assert.equal(url.pathname, `/${phone}`);
    const message = url.searchParams.get('text');
    for (const detail of ['Unidade', 'Barbeiro', 'Cliente', '51999999999', 'Corte', '02/10/2026', '10:00']) assert.ok(message.includes(detail));
  }
});
test('barber creation requires a unit and creates working hours in the same transaction', async () => {
  const db = new MemoryDb();
  await assert.rejects(mutateData(db, { resource: 'barbers', operation: 'create', input: { name: 'Teste' } }), { status: 400 });
  const barber = await mutateData(db, { resource: 'barbers', operation: 'create', input: { name: 'Teste', shop_id: 'shop-1' } });
  assert.equal((await readData(db)).working_hours.filter(h => h.barber_id === barber.id).length, 7);
  await assert.rejects(mutateData(db, { resource: 'working_hours', operation: 'update', id: `wh-${barber.id}-1`, input: { start_time: '20:00', end_time: '09:00' } }), { status: 400 });
});
test('review completion is atomic and cannot produce duplicate reviews', async () => {
  const db = new MemoryDb(), a = await createBooking(db, input());
  const operation = { resource: 'reviews', operation: 'create', input: { appointment_id: a.appointment.id, rating: 5, text: 'Bom atendimento' } };
  await mutateData(db, operation);
  const data = await readData(db);
  assert.equal(data.appointments[0].status, 'completed');
  assert.equal(data.reviews.length, 1);
  await assert.rejects(mutateData(db, operation), { status: 409 });
  await assert.rejects(manageBooking(db, a.manageToken, true), { status: 409 });
  await assert.rejects(mutateData(db, { resource: 'barbers', operation: 'delete', id: 'barber-1' }), { status: 409 });
});

async function call(handler, action, { body, cookie, origin = 'http://localhost', method = body === undefined ? 'GET' : 'POST', query = '' } = {}) {
  const headers = {};
  const res = { code: 200, setHeader: (k, v) => { headers[k] = v; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  await handler({ url: `/api?action=${action}${query}`, method, headers: { origin, host: 'localhost', cookie, 'x-forwarded-for': '127.0.0.1' }, body }, res);
  return { status: res.code, data: res.data, headers };
}
test('API rejects unauthenticated writes, forged cookies, foreign origins and unknown operations', async () => {
  const db = new MemoryDb(), handler = makeHandler(() => db);
  assert.equal((await call(handler, 'mutate', { body: { resource: 'barbers', operation: 'delete', id: 'barber-1' } })).status, 401);
  assert.equal((await call(handler, 'data', { query: '&admin=1', cookie: 'tlbc_session=' + 'a'.repeat(64) })).status, 401);
  assert.equal((await call(handler, 'booking', { body: input(), origin: 'https://other.example' })).status, 403);
  assert.equal((await call(handler, 'booking', { method: 'GET' })).status, 405);
  assert.equal((await call(handler, 'clearAll', { body: {} })).status, 404);
});
test('login, session, password change and logout use secure server-side sessions', async () => {
  const old = process.env.ADMIN_PASSWORD; process.env.ADMIN_PASSWORD = 'a-long-test-password';
  try {
    const db = new MemoryDb(), handler = makeHandler(() => db);
    assert.equal((await call(handler, 'login', { body: { password: 'admin123' } })).status, 401);
    const login = await call(handler, 'login', { body: { password: process.env.ADMIN_PASSWORD } });
    assert.equal(login.status, 200);
    assert.match(login.headers['Set-Cookie'], /HttpOnly; SameSite=Strict/);
    const cookie = login.headers['Set-Cookie'].split(';')[0];
    assert.equal((await call(handler, 'session', { cookie })).status, 200);
    assert.equal((await call(handler, 'password', { cookie, body: { currentPassword: process.env.ADMIN_PASSWORD, newPassword: 'another-long-password' } })).status, 200);
    assert.equal((await call(handler, 'session', { cookie })).status, 401);
    const next = await call(handler, 'login', { body: { password: 'another-long-password' } });
    const nextCookie = next.headers['Set-Cookie'].split(';')[0];
    assert.equal((await call(handler, 'logout', { cookie: nextCookie, body: {} })).status, 200);
    assert.equal((await call(handler, 'session', { cookie: nextCookie })).status, 401);
  } finally { if (old === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = old; }
});
test('repeated incorrect login attempts are rate limited', async () => {
  const db = new MemoryDb();
  await db.collection('private').doc('admin').set({ password: 'salt:' + '00'.repeat(64), version: 'test' });
  const handler = makeHandler(() => db);
  for (let i = 0; i < 8; i++) assert.equal((await call(handler, 'login', { body: { password: 'wrong' } })).status, 401);
  assert.equal((await call(handler, 'login', { body: { password: 'wrong' } })).status, 429);
});
test('booking API saves without requesting an automatic WhatsApp notification', async () => {
  const db = new MemoryDb();
  const handler = makeHandler(() => db);
  const result = await call(handler, 'booking', { body: input() });
  assert.equal(result.status, 201);
  assert.equal((await readData(db)).appointments.length, 1);
  assert.equal(db.records.has('notifications/' + result.data.appointment.id), false);
  assert.equal((await call(handler, 'retry', { body: { id: result.data.appointment.id } })).status, 404);
});
