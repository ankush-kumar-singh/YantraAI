/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const WebSocket = require('ws');

/**
 * Binds background interval timers to an active socket connection.
 * Sends global hardware telemetry (GPU/VRAM) every 4 seconds
 * and network sovereignty audits every 5 seconds.
 */
function startBackgroundEmitters(ws) {
  let auditCount = 0;

  // 1. Hardware Telemetry Gauge updates (every 4s)
  const telemetryInterval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) {
      clearInterval(telemetryInterval);
      return;
    }

    const randomGpuUtil = Math.floor(45 + Math.random() * 30); // 45% - 75%
    const randomVramUsed = Math.floor(32 + Math.random() * 10); // 32GB - 42GB

    const envelope = {
      type: 'telemetry',
      session_id: null,
      seq: 0,
      timestamp: new Date().toISOString(),
      payload: {
        gpu_util_pct: randomGpuUtil,
        vram_used_gb: randomVramUsed,
        vram_total_gb: 80,
        vram_by_model: [
          { model_id: 'model-reasoning-qwen', gb: 24 },
          { model_id: 'model-coding-qwen', gb: 12 }
        ]
      }
    };

    ws.send(JSON.stringify(envelope));
  }, 4000);

  // 2. Sovereignty Network Audit Logs (every 5s)
  const auditInterval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) {
      clearInterval(auditInterval);
      return;
    }

    auditCount++;
    const isMockBlockAttempt = Math.random() > 0.7;

    let payload;
    if (isMockBlockAttempt) {
      payload = {
        event: 'attempt',
        verdict: 'blocked',
        process: 'pdf-ocr-worker',
        destination: '0.0.0.0 (no route — sandbox network disabled)',
        count_since_start: auditCount
      };
    } else {
      payload = {
        event: 'heartbeat_ok',
        verdict: 'allowed',
        process: null,
        destination: null,
        count_since_start: auditCount
      };
    }

    const envelope = {
      type: 'network_audit',
      session_id: null,
      seq: 0,
      timestamp: new Date().toISOString(),
      payload
    };

    ws.send(JSON.stringify(envelope));
  }, 5000);

  // Clear intervals immediately on close to prevent resource leaks
  ws.on('close', () => {
    clearInterval(telemetryInterval);
    clearInterval(auditInterval);
  });
}

module.exports = { startBackgroundEmitters };
