/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const WebSocket = require('ws');

// In-memory scheduler map to track active timeouts per session ID
const activeTimers = new Map();

function trackTimeout(sessionId, timeoutId) {
  if (!activeTimers.has(sessionId)) {
    activeTimers.set(sessionId, []);
  }
  activeTimers.get(sessionId).push(timeoutId);
}

function cancelSession(sessionId) {
  const timers = activeTimers.get(sessionId);
  if (timers) {
    timers.forEach(t => clearTimeout(t));
    activeTimers.delete(sessionId);
    console.log(`[Simulator] Cancelled scheduled triggers for session: ${sessionId}`);
  }
}

function sendEnvelope(ws, type, sessionId, seqCounter, payload) {
  if (ws.readyState !== WebSocket.OPEN) return;

  const currentSeq = seqCounter.get(sessionId) || 0;
  const nextSeq = currentSeq + 1;
  seqCounter.set(sessionId, nextSeq);

  const envelope = {
    type,
    session_id: sessionId,
    seq: nextSeq,
    timestamp: new Date().toISOString(),
    payload
  };

  ws.send(JSON.stringify(envelope));
}

// ==========================================
// CANNED SEQUENCE GENERATORS
// ==========================================

function playNormalSequence(ws, sessionId, seqCounter, prompt) {
  console.log(`[Simulator] Playing "normal" mode sequence for session: ${sessionId}`);
  
  // Step 1: Heartbeat (500ms)
  const t1 = setTimeout(() => {
    sendEnvelope(ws, 'heartbeat', sessionId, seqCounter, { text: 'Formulating direct response...' });
  }, 500);
  trackTimeout(sessionId, t1);

  // Step 2: Final response (1500ms)
  const t2 = setTimeout(() => {
    sendEnvelope(ws, 'final', sessionId, seqCounter, {
      message_id: `msg-${Date.now()}`,
      content: `This is a direct, simulated answer from the sovereign mock backend. You queried:\n> "${prompt}"\n\nAll calculations and analysis were processed on-premise. No cloud routing occurred.`,
      tokens_used: 120,
      tokens_per_sec: 48.0,
      total_duration_ms: 1500
    });
    activeTimers.delete(sessionId); // Clean up active session tracking
  }, 1500);
  trackTimeout(sessionId, t2);
}

function playToolSequence(ws, sessionId, seqCounter, prompt, toolId) {
  console.log(`[Simulator] Playing "tool" mode sequence for session: ${sessionId}, tool: ${toolId}`);
  
  const targetToolId = toolId || 'tool-code-execution';

  // Step 1: Optional Model Route (400ms)
  const t1 = setTimeout(() => {
    if (targetToolId === 'tool-ocr' || targetToolId === 'tool-vision-analyze') {
      sendEnvelope(ws, 'model_route', sessionId, seqCounter, {
        model_id: targetToolId === 'tool-ocr' ? 'model-ocr-paddle' : 'model-vision-internvl',
        category: targetToolId === 'tool-ocr' ? 'ocr' : 'vision',
        reason: 'Specialized visual schematic mapping triggered.',
        vram_gb: targetToolId === 'tool-ocr' ? 2.8 : 9.6,
        load_status: 'loaded'
      });
    }
  }, 400);
  trackTimeout(sessionId, t1);

  // Step 2: Tool Step Running (1000ms)
  const t2 = setTimeout(() => {
    sendEnvelope(ws, 'tool_step', sessionId, seqCounter, {
      plan_step_id: null,
      tool_call: {
        toolId: targetToolId,
        toolName: targetToolId.replace('tool-', ''),
        inputParams: { command: 'verify --target inputs' },
        outputResult: null,
        durationMs: 0,
        status: 'running'
      }
    });
  }, 1000);
  trackTimeout(sessionId, t2);

  // Step 3: Tool Step Completed (2000ms)
  const t3 = setTimeout(() => {
    sendEnvelope(ws, 'tool_step_update', sessionId, seqCounter, {
      plan_step_id: null,
      tool_call: {
        toolId: targetToolId,
        toolName: targetToolId.replace('tool-', ''),
        inputParams: { command: 'verify --target inputs' },
        outputResult: { exit_code: 0, stdout: 'Check completed. Operational parameters verified.' },
        durationMs: 1000,
        status: 'success'
      }
    });
  }, 2000);
  trackTimeout(sessionId, t3);

  // Step 4: Final response closes turn (3000ms)
  const t4 = setTimeout(() => {
    sendEnvelope(ws, 'final', sessionId, seqCounter, {
      message_id: `msg-${Date.now()}`,
      content: `Deterministic execution of tool **${targetToolId}** completed successfully in local sandbox.`,
      tokens_used: 180,
      tokens_per_sec: 55.4,
      total_duration_ms: 3000
    });
    activeTimers.delete(sessionId);
  }, 3000);
  trackTimeout(sessionId, t4);
}

function playAgentSequence(ws, sessionId, seqCounter, prompt, activeTools = []) {
  console.log(`[Simulator] Playing "agent" mode multi-phase loop for session: ${sessionId}`);

  // Checks for error/blocked prompt injections
  const cleanPrompt = prompt.toLowerCase();
  const injectError = cleanPrompt.includes('fail') || cleanPrompt.includes('error');
  const injectBlocked = cleanPrompt.includes('blocked') || cleanPrompt.includes('network');

  if (injectBlocked) {
    sendEnvelope(ws, 'network_audit', sessionId, seqCounter, {
      event: 'attempt',
      verdict: 'blocked',
      process: 'agent-scheduler',
      destination: 'api.openai.com (blocked — sandbox network disabled)',
      count_since_start: 99
    });
  }

  // Step 1: Heartbeat (500ms)
  const t1 = setTimeout(() => {
    sendEnvelope(ws, 'heartbeat', sessionId, seqCounter, { text: 'Running task routing checks...' });
  }, 500);
  trackTimeout(sessionId, t1);

  // Step 2: Model routing decision (1200ms)
  const t2 = setTimeout(() => {
    const isCode = cleanPrompt.includes('code') || cleanPrompt.includes('python');
    const isOcr = cleanPrompt.includes('ocr') || cleanPrompt.includes('scan');
    const isVision = cleanPrompt.includes('image') || cleanPrompt.includes('drawing') || cleanPrompt.includes('defect');

    let modelId = 'model-reasoning-qwen';
    let category = 'reasoning';
    let vramGB = 41.2;
    let reason = 'Complex textual requirement analysis.';

    if (isCode) {
      modelId = 'model-coding-qwen';
      category = 'coding';
      vramGB = 34.0;
      reason = 'Python calculation and code building detected.';
    } else if (isOcr) {
      modelId = 'model-ocr-paddle';
      category = 'ocr';
      vramGB = 2.8;
      reason = 'Scanned document tabular parse requested.';
    } else if (isVision) {
      modelId = 'model-vision-internvl';
      category = 'vision';
      vramGB = 9.6;
      reason = 'Schematic spatial defect inspection required.';
    }

    sendEnvelope(ws, 'model_route', sessionId, seqCounter, {
      model_id: modelId,
      category,
      reason,
      vram_gb: vramGB,
      load_status: 'loaded'
    });
  }, 1200);
  trackTimeout(sessionId, t2);

  // Step 3: Plan Formulation (2000ms)
  const t3 = setTimeout(() => {
    sendEnvelope(ws, 'plan', sessionId, seqCounter, {
      steps: [
        { id: 'p1', phase: 'planning', title: 'Parse query parameters', status: 'running' },
        { id: 'p2', phase: 'evaluation', title: 'Cross-reference knowledge base', status: 'pending' },
        { id: 'p3', phase: 'building', title: 'Synthesize verified report memo', status: 'pending' }
      ]
    });
  }, 2000);
  trackTimeout(sessionId, t3);

  // If error injection requested, interrupt here
  if (injectError) {
    const tErr = setTimeout(() => {
      sendEnvelope(ws, 'error', sessionId, seqCounter, {
        code: 'TOOL_TIMEOUT',
        message: 'Simulated sandbox execution timed out partway through loop.',
        plan_step_id: 'p2'
      });
      activeTimers.delete(sessionId);
    }, 3200);
    trackTimeout(sessionId, tErr);
    return;
  }

  // Step 4: Step 1 completes, Step 2 running & calls RAG (3500ms)
  const t4 = setTimeout(() => {
    sendEnvelope(ws, 'plan_update', sessionId, seqCounter, { id: 'p1', status: 'completed' });
    sendEnvelope(ws, 'plan_update', sessionId, seqCounter, { id: 'p2', status: 'running' });
    
    // Call rag_search
    sendEnvelope(ws, 'tool_step', sessionId, seqCounter, {
      plan_step_id: 'p2',
      tool_call: {
        toolId: 'tool-rag-search',
        toolName: 'rag_search',
        inputParams: { query: 'ASME compliance wall thickness guidelines' },
        outputResult: null,
        durationMs: 0,
        status: 'running'
      }
    });
  }, 3500);
  trackTimeout(sessionId, t4);

  // Step 5: RAG completes, Step 2 completes (4800ms)
  const t5 = setTimeout(() => {
    sendEnvelope(ws, 'tool_step_update', sessionId, seqCounter, {
      plan_step_id: 'p2',
      tool_call: {
        toolId: 'tool-rag-search',
        toolName: 'rag_search',
        inputParams: { query: 'ASME compliance wall thickness guidelines' },
        outputResult: { matches: 2, top_snippet: 'ASME Section VIII Div 1 wall thickness formula requirements satisfied.' },
        durationMs: 1300,
        status: 'success'
      }
    });
    sendEnvelope(ws, 'plan_update', sessionId, seqCounter, { id: 'p2', status: 'completed' });
  }, 4800);
  trackTimeout(sessionId, t5);

  // Step 6: Step 3 running & emits artifact (6200ms)
  const t6 = setTimeout(() => {
    sendEnvelope(ws, 'plan_update', sessionId, seqCounter, { id: 'p3', status: 'running' });

    // Emit generated artifact (e.g. document memo)
    sendEnvelope(ws, 'artifact', sessionId, seqCounter, {
      id: 'art-inspection-memo',
      title: 'ASME_Inspection_Memo_Draft.docx',
      type: 'file',
      fileType: 'word',
      sizeBytes: 152000,
      link: `http://${ws.upgradeReqHeaders?.host || 'localhost:8080'}/api/files/art-inspection-memo`,
      previewLink: `http://${ws.upgradeReqHeaders?.host || 'localhost:8080'}/api/files/art-inspection-memo/preview`,
      citedSources: [1],
      requiresApproval: true
    });
  }, 6200);
  trackTimeout(sessionId, t6);

  // Step 7: Citations & Step 3 completes (7400ms)
  const t7 = setTimeout(() => {
    sendEnvelope(ws, 'citation', sessionId, seqCounter, {
      marker: 1,
      source_name: 'ASME Section VIII Pressure Vessel Guidelines',
      location: 'Section UG-99 page 4',
      snippet_preview: 'Design parameters and hold tolerances validated.',
      kb_source: true
    });
    sendEnvelope(ws, 'plan_update', sessionId, seqCounter, { id: 'p3', status: 'completed' });
  }, 7400);
  trackTimeout(sessionId, t7);

  // Step 8: Final closeout response (8500ms)
  const t8 = setTimeout(() => {
    sendEnvelope(ws, 'final', sessionId, seqCounter, {
      message_id: `msg-${Date.now()}`,
      content: `The autonomous agent analysis has completed successfully.\n\nVerified pressure limits against ASME criteria. A draft memo **ASME_Inspection_Memo_Draft.docx** has been compiled and saved to Workbench.`,
      citations: [1],
      artifact_ids: ['art-inspection-memo'],
      tokens_used: 820,
      tokens_per_sec: 64.2,
      total_duration_ms: 8500
    });
    activeTimers.delete(sessionId);
  }, 8500);
  trackTimeout(sessionId, t8);
}

module.exports = {
  cancelSession,
  playNormalSequence,
  playToolSequence,
  playAgentSequence,
  sendEnvelope
};
