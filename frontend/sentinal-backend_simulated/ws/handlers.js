/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const {
  cancelSession,
  playNormalSequence,
  playToolSequence,
  playAgentSequence,
  sendEnvelope
} = require('./cannedSequences');

// In-memory seq counters map tracked per session ID
const seqCounters = new Map();

/**
 * Parses client messages and routes them to sequences or acknowledgements.
 */
function handleIncomingMessage(ws, messageStr) {
  let message;
  try {
    message = JSON.parse(messageStr);
  } catch (e) {
    console.error('[Simulator] Failed to parse client message JSON:', e);
    return;
  }

  const { type, session_id, payload } = message;
  const targetSessionId = session_id || 'global';

  // Initialize seq counter if absent
  if (!seqCounters.has(targetSessionId)) {
    seqCounters.set(targetSessionId, 0);
  }

  console.log(`[Simulator] Received event "${type}" for session ID: ${targetSessionId}`);

  switch (type) {
    case 'user_message': {
      const runMode = payload.run_mode || 'normal';
      const prompt = payload.prompt || '';
      const activeTools = payload.active_tools || [];

      // Cancel any active running schedule first
      cancelSession(targetSessionId);

      if (runMode === 'agent') {
        playAgentSequence(ws, targetSessionId, seqCounters, prompt, activeTools);
      } else if (runMode === 'tool') {
        playToolSequence(ws, targetSessionId, seqCounters, prompt, payload.tool_id);
      } else {
        playNormalSequence(ws, targetSessionId, seqCounters, prompt);
      }
      break;
    }

    case 'session_control': {
      const action = payload.action;
      if (action === 'cancel') {
        cancelSession(targetSessionId);
      } else if (action === 'resume') {
        // Acknowledge and resume by playing normal reply
        cancelSession(targetSessionId);
        playNormalSequence(ws, targetSessionId, seqCounters, 'Resuming active session.');
      } else if (action === 'regenerate' || action === 'branch') {
        // Rerun loop simulation
        cancelSession(targetSessionId);
        playAgentSequence(ws, targetSessionId, seqCounters, 'Regenerating previous response.');
      }
      break;
    }

    case 'approval_action': {
      // Immediate approve/request changes acknowledgement
      sendEnvelope(ws, 'approval_ack', targetSessionId, seqCounters, {
        artifact_id: payload.artifact_id,
        status: 'approved'
      });
      break;
    }

    case 'tool_upsert': {
      sendEnvelope(ws, 'tool_upsert_ack', targetSessionId, seqCounters, {
        id: payload.tool ? payload.tool.id : 'custom_tool',
        status: 'created'
      });
      break;
    }

    case 'model_upsert': {
      sendEnvelope(ws, 'model_upsert_ack', targetSessionId, seqCounters, {
        id: payload.model ? payload.model.id : 'custom_model',
        status: 'created'
      });
      break;
    }

    case 'kb_source_upsert': {
      sendEnvelope(ws, 'kb_source_upsert_ack', targetSessionId, seqCounters, {
        id: payload.source ? payload.source.id : 'custom_source',
        status: 'created'
      });
      break;
    }

    case 'settings_update': {
      console.log('[Simulator] Settings updated locally:', payload);
      break;
    }

    default:
      console.warn(`[Simulator] Unknown event type received from client: ${type}`);
  }
}

module.exports = { handleIncomingMessage };
