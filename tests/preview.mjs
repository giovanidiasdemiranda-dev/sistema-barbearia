// Local UI test fixture. No credentials, real database, or outgoing messages.
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { MemoryDb } from './memory-db.js';
import { makeHandler } from '../server/app.js';
import { passwordHash } from '../server/security.js';
const db = new MemoryDb();
await db.collection('private').doc('admin').set({ password: passwordHash('somente-teste-local'), version: 'local-fixture' });
const handler = makeHandler(() => db, async (_db, id) => {
  await db.collection('notifications').doc(id).update({ status: 'not_configured' });
  return 'not_configured';
});
const server = await createServer({ configFile: false, plugins: [react(), {
  name: 'test-api', configureServer(vite) {
    vite.middlewares.use(async (req, res, next) => {
      if (!req.url.startsWith('/api?')) return next();
      let body = '';
      for await (const chunk of req) body += chunk;
      req.body = body || undefined;
      res.status = code => { res.statusCode = code; return res; };
      res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
      await handler(req, res);
    });
  },
}], server: { host: '127.0.0.1', port: 5180, strictPort: true } });
await server.listen();
console.log('Local test fixture: http://127.0.0.1:5180 (test data only)');
