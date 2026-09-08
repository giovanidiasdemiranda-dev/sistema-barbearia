const localtunnel = require('localtunnel');

let tunnel = null;

async function startTunnel() {
  try {
    tunnel = await localtunnel({
      port: 5173,
      subdomain: 'latinbarbersclub'
    });

    console.log('Tunnel online:', tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel closed. Reconnecting in 3s...');
      setTimeout(startTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
      setTimeout(startTunnel, 3000);
    });

  } catch (err) {
    console.error('Failed to start tunnel:', err.message);
    setTimeout(startTunnel, 3000);
  }
}

startTunnel();

// Keep process running
setInterval(() => {}, 1000 * 60);
