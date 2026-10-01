import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import handler from './server/app.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (/^(FIREBASE_|WHATSAPP_|ADMIN_PASSWORD$|APP_ORIGIN$)/.test(key) && !process.env[key]) process.env[key] = value
  }
  return {
  plugins: [react(), {
    name: 'local-server-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.split('?')[0].match(/^\/api(?:\/login)?$/)) return next()
        let body = ''
        for await (const chunk of req) {
          body += chunk
          if (Buffer.byteLength(body) > 150000) { res.statusCode = 413; return res.end('Solicitação muito grande') }
        }
        req.body = body || undefined
        res.status = code => { res.statusCode = code; return res }
        res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)) }
        await handler(req, res)
      })
    },
  }],
  server: {
    host: true,
  },
  }
})
