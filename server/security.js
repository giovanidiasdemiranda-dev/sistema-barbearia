import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function fail(status, message) { const error = new Error(message); error.status = status; throw error; }
export const hash = value => createHash('sha256').update(value).digest('hex');
export const token = () => randomBytes(32).toString('hex');
export function passwordHash(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function checkPassword(password, stored) {
  if (typeof password !== 'string' || password.length > 200 || !stored?.includes(':')) return false;
  const [salt, digest] = stored.split(':');
  const expected = Buffer.from(digest, 'hex');
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export function checkOrigin(req) {
  const origin = req.headers.origin;
  const expected = process.env.APP_ORIGIN || `http://${req.headers.host}`;
  try { if (new URL(origin).origin === new URL(expected).origin) return; } catch { /* reject missing or invalid origin */ }
  fail(403, 'Origem da solicitação não permitida.');
}
export async function rateLimit(db, req, scope, limit = 10, interval = 15 * 60 * 1000) {
  const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const ref = db.collection('rate_limits').doc(hash(`${scope}:${ip}`));
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const previous = snap.data();
    const now = Date.now();
    const active = previous && previous.until > now;
    if (active && previous.count >= limit) fail(429, 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
    tx.set(ref, { count: active ? previous.count + 1 : 1, until: active ? previous.until : now + interval, expiresAt: new Date(now + interval) });
  });
}
export async function authConfig(db) {
  const ref = db.collection('private').doc('admin');
  const snap = await ref.get();
  if (snap.exists) return snap.data();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12 || password.length > 200) fail(503, 'Configure uma senha administrativa de pelo menos 12 caracteres no servidor.');
  const initial = { password: passwordHash(password), version: token() };
  return db.runTransaction(async tx => {
    const current = await tx.get(ref);
    if (current.exists) return current.data();
    tx.set(ref, initial);
    return initial;
  });
}
function cookieToken(req) {
  return String(req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('tlbc_session='))?.slice(13) || '';
}
export function sessionCookie(res, value, age = 28800) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `tlbc_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure}`);
}
export async function requireAdmin(db, req) {
  const value = cookieToken(req);
  if (!/^[a-f0-9]{64}$/.test(value)) fail(401, 'Sua sessão expirou. Entre novamente.');
  const session = (await db.collection('sessions').doc(hash(value)).get()).data();
  if (!session || session.until <= Date.now()) fail(401, 'Sua sessão expirou. Entre novamente.');
  const config = await authConfig(db);
  if (session.version !== config.version) fail(401, 'Sua sessão expirou. Entre novamente.');
  return session;
}
export async function logout(db, req, res) {
  const value = cookieToken(req);
  if (/^[a-f0-9]{64}$/.test(value)) await db.collection('sessions').doc(hash(value)).delete();
  sessionCookie(res, '', 0);
}
