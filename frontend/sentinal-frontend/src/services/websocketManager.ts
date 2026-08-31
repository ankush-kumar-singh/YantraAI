/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eventDispatcher } from './eventDispatcher';
import { executeAiResponse } from './aiSimulator';
import { Model, ToolDefinition } from '../types';

export interface UserMessagePayload {
  conversation_id: string;
  project_id?: string | null;
  run_mode: 'normal' | 'agent' | 'tool';
  tool_id?: string | null;
  prompt: string;
  model_mode: 'auto' | 'manual';
  requested_model_id?: string | null;
  active_tools: string[];
  attachments?: any[];
  system_prompt_override?: string | null;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

class WebSocketManager {
  private socket: WebSocket | null = null;
  private seqBySession: Map<string, number> = new Map();
  private lastSeqSeenBySession: Map<string, number> = new Map();
  private reconnectTimeout: number | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 10000;
  private isConnected = false;
  private token: string | null = null;
  
  // Simulation / Fallback Mode properties
  private useSimulator = true;
  private simulationInterval: number | null = null;
  private telemetryCount = 0;

  constructor() {
    // Start continuous telemetry & network audit flow
    this.startTelemetryTimer();
  }

  public connect(token: string): void {
    this.token = token;
    this.useSimulator = false; // Try real WebSocket first
    
    // Initial connection dispatch
    eventDispatcher({
      type: 'connection_status',
      payload: { connected: false, useSimulator: false }
    });
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || 'localhost:3000';
    const url = `${protocol}//${host}/ws?session_token=${token}`;

    console.log(`Connecting to WebSocket at ${url}...`);
    try {
      this.socket = new WebSocket(url);
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established successfully.');
        this.isConnected = true;
        this.reconnectDelay = 1000; // Reset backoff delay
        this.useSimulator = false;

        // Dispatch connection event
        eventDispatcher({
          type: 'connection_status',
          payload: { connected: true, useSimulator: false }
        });

        // Resume active sessions with last seen sequence numbers
        this.lastSeqSeenBySession.forEach((lastSeq, sessionId) => {
          this.resumeSession(sessionId, lastSeq);
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.session_id && parsed.seq !== undefined) {
            this.lastSeqSeenBySession.set(parsed.session_id, parsed.seq);
          }
          eventDispatcher(parsed);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.socket.onerror = (error) => {
        console.warn('WebSocket connection encountered an error.', error);
      };

      this.socket.onclose = () => {
        console.warn('WebSocket connection closed.');
        this.isConnected = false;
        this.socket = null;
        
        // If we failed to connect on first load, enable simulator mode
        if (this.reconnectDelay === 1000) {
          console.info('Switching to simulated offline execution mode.');
          this.useSimulator = true;
        }

        // Dispatch connection event
        eventDispatcher({
          type: 'connection_status',
          payload: { connected: false, useSimulator: this.useSimulator }
        });

        this.scheduleReconnect();
      };
    } catch (e) {
      console.error('Failed to create WebSocket instance:', e);
      this.useSimulator = true;
      
      // Dispatch connection event
      eventDispatcher({
        type: 'connection_status',
        payload: { connected: false, useSimulator: true }
      });

      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    console.log(`Scheduling reconnect in ${this.reconnectDelay}ms...`);
    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      if (this.token) {
        this.connect(this.token);
      }
    }, this.reconnectDelay);
  }

  private nextSeq(sessionId: string): number {
    const seq = (this.seqBySession.get(sessionId) ?? 0) + 1;
    this.seqBySession.set(sessionId, seq);
    return seq;
  }

  private send(type: string, sessionId: string, payload: any): void {
    const envelope = {
      type,
      session_id: sessionId,
      seq: this.nextSeq(sessionId),
      timestamp: new Date().toISOString(),
      payload
    };

    if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(envelope));
    } else {
      console.warn(`WebSocket is offline. Message of type "${type}" skipped/queued locally.`);
    }
  }

  // ==========================================
  // Client -> Server Events
  // ==========================================

  public sendUserMessage(
    payload: UserMessagePayload,
    modelContext?: { currentModel: Model; activeTools: ToolDefinition[]; systemPrompt?: string }
  ): void {
    if (!this.useSimulator && this.isConnected) {
      this.send('user_message', payload.conversation_id, payload);
    } else {
      console.log('Running user message in simulator fallback mode...');
      this.runSimulation(payload, modelContext);
    }
  }

  public cancel(sessionId: string): void {
    if (!this.useSimulator && this.isConnected) {
      this.send('session_control', sessionId, { action: 'cancel' });
    } else {
      console.log(`Simulation cancelled for session ${sessionId}`);
    }
  }

  public resumeSession(sessionId: string, sinceSeq: number): void {
    if (this.isConnected) {
      this.send('session_control', sessionId, { action: 'resume', since_seq: sinceSeq });
    }
  }

  public regenerate(sessionId: string, messageId: string): void {
    if (!this.useSimulator && this.isConnected) {
      this.send('session_control', sessionId, { action: 'regenerate', message_id: messageId });
    }
  }

  public branch(sessionId: string, fromMessageId: string): void {
    if (!this.useSimulator && this.isConnected) {
      this.send('session_control', sessionId, { action: 'branch', from_message_id: fromMessageId });
    }
  }

  public sendApprovalAction(sessionId: string, artifactId: string, action: 'approve' | 'request_changes' | 'reject', comment = '', approvedBy = 'user'): void {
    if (!this.useSimulator && this.isConnected) {
      this.send('approval_action', sessionId, {
        artifact_id: artifactId,
        action,
        comment,
        approved_by: approvedBy
      });
    } else {
      console.log(`Simulated approval action: ${action} on artifact ${artifactId} in session ${sessionId}`);
    }
  }

  public sendToolUpsert(tool: ToolDefinition): void {
    if (!this.useSimulator && this.isConnected) {
      this.send('tool_upsert', 'global', { tool });
    }
  }

  public sendModelUpsert(model: Model): void {
    if (!this.useSimulator && this.isConnected) {
      this.send('model_upsert', 'global', { model });
    }
  }

  public sendKbSourceUpsert(source: any): void {
    if (!this.useSimulator && this.isConnected) {
      this.send('kb_source_upsert', 'global', { source });
    }
  }

  // ==========================================
  // Local Simulator Fallback Execution Loop
  // ==========================================

  private async runSimulation(
    payload: UserMessagePayload,
    modelContext?: { currentModel: Model; activeTools: ToolDefinition[]; systemPrompt?: string }
  ): Promise<void> {
    const convId = payload.conversation_id;
    
    // Set fallback context
    const currentModel = modelContext?.currentModel || {
      id: payload.requested_model_id || 'qwen-72b',
      name: payload.requested_model_id || 'Qwen-2.5-72B',
      provider: 'Local Ollama',
      tag: 'local',
      description: 'Reasoning model',
      contextWindow: '32k',
      isLocal: true,
      badgeColor: '#F5A623',
      iconName: 'brain'
    } as Model;

    const activeTools = modelContext?.activeTools || [];
    const systemPrompt = modelContext?.systemPrompt || '';

    try {
      // Simulate websocket events by translating executeAiResponse callbacks
      await executeAiResponse({
        prompt: payload.prompt,
        mode: payload.run_mode === 'tool' ? 'normal' : payload.run_mode, // map to simulator chat mode
        model: currentModel,
        activeTools,
        conversationHistory: [],
        systemPrompt,
        onUpdate: (partialMsg) => {
          if (partialMsg.modelId) {
            eventDispatcher({
              type: 'model_route',
              session_id: convId,
              payload: { model_id: partialMsg.modelId }
            });
          }

          if (partialMsg.agentRun) {
            eventDispatcher({
              type: 'plan',
              session_id: convId,
              payload: { steps: partialMsg.agentRun.steps }
            });
          }

          if (partialMsg.content !== undefined) {
            if (partialMsg.isStreaming === false) {
              // Final payload close out
              eventDispatcher({
                type: 'final',
                session_id: convId,
                payload: {
                  message_id: `msg-${Date.now()}`,
                  content: partialMsg.content,
                  citations: partialMsg.citations || [],
                  tokens_used: partialMsg.tokensUsed || 350,
                  tokens_per_sec: partialMsg.tokensPerSec || 45.5,
                  total_duration_ms: partialMsg.agentRun?.totalDurationMs || 3000
                }
              });
            } else {
              // Intermediate content stream
              eventDispatcher({
                type: 'message_chunk',
                session_id: convId,
                payload: { content: partialMsg.content }
              });
            }
          }
        }
      });
    } catch (err) {
      console.error('Simulation execution error:', err);
      eventDispatcher({
        type: 'error',
        session_id: convId,
        payload: { code: 'SIMULATOR_ERROR', message: 'Failed to run client-side simulation fallback.' }
      });
    }
  }

  // ==========================================
  // Continuous Idle Telemetry & Network Auditing
  // ==========================================

  private startTelemetryTimer(): void {
    if (this.simulationInterval) {
      window.clearInterval(this.simulationInterval);
    }

    this.simulationInterval = window.setInterval(() => {
      this.telemetryCount++;

      // 1. Dispatch global hardware telemetry event
      const activeGpuUtil = Math.round(50 + Math.random() * 20);
      const activeVram = Math.round(35 + Math.random() * 5);
      eventDispatcher({
        type: 'telemetry',
        payload: {
          gpu_util_pct: activeGpuUtil,
          vram_used_gb: activeVram,
          vram_total_gb: 80,
          vram_by_model: [
            { model_id: 'qwen2.5-72b', gb: 25 },
            { model_id: 'codellama-34b', gb: 13 }
          ]
        }
      });

      // 2. Periodically dispatch sovereignty network audits (every 3 iterations)
      if (this.telemetryCount % 3 === 0) {
        const verdicts = ['allowed', 'blocked', 'enforced'];
        const isAttempt = Math.random() > 0.6;
        
        if (isAttempt) {
          eventDispatcher({
            type: 'network_audit',
            payload: {
              event: 'attempt',
              verdict: 'blocked',
              process: 'pdf-ocr-worker',
              destination: '0.0.0.0 (no route — sandbox network disabled)',
              count_since_start: this.telemetryCount
            }
          });
        } else {
          eventDispatcher({
            type: 'network_audit',
            payload: {
              event: 'heartbeat_ok',
              verdict: 'allowed',
              process: null,
              destination: null,
              count_since_start: this.telemetryCount
            }
          });
        }
      }
    }, 5000);
  }
}

export const wsManager = new WebSocketManager();
