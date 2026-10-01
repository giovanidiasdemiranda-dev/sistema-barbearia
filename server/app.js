import { getDb } from './db.js';
import { fail, hash, token, passwordHash, checkPassword, authConfig, rateLimit, checkOrigin, requireAdmin, sessionCookie, logout } from './security.js';
import { readData, publicData, adminData, slotsFor, createBooking, manageBooking, mutateData } from './data.js';

export function makeHandler(dbProvider = getDb) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    try {
      const url = new URL(req.url, 'http://localhost');
      const action = req.query?.action || url.searchParams.get('action') || (url.pathname === '/api/login' ? 'login' : '');
      const methods = { data: 'GET', availability: 'GET', session: 'GET', login: 'POST', logout: 'POST', password: 'POST', booking: 'POST', manage: 'POST', mutate: 'POST' };
      if (!methods[action]) fail(404, 'Rota não encontrada.');
      if (methods[action] !== req.method) { res.setHeader('Allow', methods[action]); fail(405, 'Método não permitido.'); }
      if (req.method === 'POST') checkOrigin(req);
      let body = req.body || {};
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { fail(400, 'Solicitação inválida.'); } }
      if (!body || typeof body !== 'object' || Array.isArray(body) || Buffer.byteLength(JSON.stringify(body)) > 150000) fail(400, 'Solicitação inválida ou muito grande.');
      const db = dbProvider();
      if (action === 'login') {
        await rateLimit(db, req, 'login', 8);
        const config = await authConfig(db);
        if (!checkPassword(body.password, config.password)) fail(401, 'Senha incorreta.');
        const value = token();
        await db.collection('sessions').doc(hash(value)).set({ version: config.version, until: Date.now() + 28800000, expiresAt: new Date(Date.now() + 28800000) });
        sessionCookie(res, value);
        return res.status(200).json({ success: true });
      }
      if (action === 'session') { await requireAdmin(db, req); return res.status(200).json({ authenticated: true }); }
      if (action === 'logout') { await logout(db, req, res); return res.status(200).json({ success: true }); }
      if (action === 'password') {
        await requireAdmin(db, req);
        await rateLimit(db, req, 'password', 5);
        const config = await authConfig(db);
        if (!checkPassword(body.currentPassword, config.password)) fail(401, 'A senha atual não confere.');
        if (typeof body.newPassword !== 'string' || body.newPassword.length < 12 || body.newPassword.length > 200) fail(400, 'Use uma senha de 12 a 200 caracteres.');
        const next = { password: passwordHash(body.newPassword), version: token() };
        await db.runTransaction(async tx => {
          const ref = db.collection('private').doc('admin');
          const current = await tx.get(ref);
          if (current.data()?.version !== config.version) fail(409, 'A senha foi alterada em outra sessão. Entre novamente.');
          tx.set(ref, next);
        });
        await logout(db, req, res);
        return res.status(200).json({ success: true });
      }
      if (action === 'data') {
        const admin = url.searchParams.get('admin') === '1';
        if (admin) await requireAdmin(db, req);
        const data = await readData(db);
        const result = admin ? adminData(data) : publicData(data);
        return res.status(200).json(result);
      }
      if (action === 'availability') {
        const data = await readData(db);
        return res.status(200).json({ slots: slotsFor(data, url.searchParams.get('barber'), url.searchParams.get('date'), url.searchParams.get('service')) });
      }
      if (action === 'booking') {
        await rateLimit(db, req, 'booking', 15);
        const result = await createBooking(db, body);
        return res.status(result.repeated ? 200 : 201).json(result);
      }
      if (action === 'manage') {
        await rateLimit(db, req, 'manage', 60);
        return res.status(200).json({ appointment: await manageBooking(db, body.token, body.cancel === true) });
      }
      await requireAdmin(db, req);
      return res.status(200).json({ item: await mutateData(db, body) });
    } catch (error) {
      const status = error.status || 503;
      if (!error.status) console.error('API failure:', error.code || error.name);
      return res.status(status).json({ error: error.status ? error.message : 'Não foi possível salvar ou carregar os dados. Tente novamente.' });
    }
  };
}
export default makeHandler();
