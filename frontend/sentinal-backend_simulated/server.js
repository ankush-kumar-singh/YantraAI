/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const routes = require('./rest/routes');
const { handleIncomingMessage } = require('./ws/handlers');
const { startBackgroundEmitters } = require('./ws/backgroundEmitters');

const app = express();
const PORT = 8080;

// Enable CORS for frontend Vite dev port (supporting ports 3000 and 5173)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api', routes);

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, request) => {
  console.log('[Simulator] Client WebSocket connected.');

  // Attach request headers to WebSocket instance to locate host details dynamically
  ws.upgradeReqHeaders = request.headers;

  ws.on('message', (message) => {
    handleIncomingMessage(ws, message);
  });

  ws.on('close', () => {
    console.log('[Simulator] Client WebSocket disconnected.');
  });

  // Start continuous GPU VRAM and network auditing intervals
  startBackgroundEmitters(ws);
});

// Handle WebSocket upgrade checks on path `/ws`
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Listen on all network interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`  Sovereign Mock Backend Simulator Online`);
  console.log(`  REST API endpoints: http://localhost:${PORT}/api`);
  console.log(`  WebSocket Endpoint: ws://localhost:${PORT}/ws`);
  console.log(`==================================================`);
});
