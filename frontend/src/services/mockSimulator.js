/**
 * AegisAI Sovereign Agent Simulation Engine
 * 
 * NOTE: This file provides an isolated, spec-compliant simulation fallback for 
 * offline demonstrations or frontend testing when the FastAPI backend is not running.
 * It strictly adheres to the universal envelope schema and event types.
 */

class MockAgentSimulator {
  constructor() {
    this.telemetryInterval = null;
    this.networkAuditInterval = null;
    this.networkAuditCount = 142;
  }

  /**
   * Start background telemetry & airgap network audit emitters
   */
  startBackgroundEmitters(dispatchCallback) {
    if (this.telemetryInterval) clearInterval(this.telemetryInterval);
    if (this.networkAuditInterval) clearInterval(this.networkAuditInterval);

    // Periodic telemetry every 4s matching spec 4.9
    this.telemetryInterval = setInterval(() => {
      const gpuPct = 48 + Math.floor(Math.random() * 12);
      const vramUsed = 36 + Math.floor(Math.random() * 6);
      dispatchCallback({
        type: 'telemetry',
        session_id: null,
        seq: 0,
        timestamp: new Date().toISOString(),
        payload: {
          gpu_util_pct: gpuPct,
          vram_used_gb: vramUsed,
          vram_total_gb: 80,
          vram_by_model: [
            { model_id: 'model-reasoning-qwen', gb: 24 },
            { model_id: 'model-ocr-nougat', gb: 8 },
          ],
        },
      });
    }, 4000);

    // Periodic network audit every 5s matching spec 4.9
    this.networkAuditInterval = setInterval(() => {
      this.networkAuditCount++;
      dispatchCallback({
        type: 'network_audit',
        session_id: null,
        seq: 0,
        timestamp: new Date().toISOString(),
        payload: {
          event: 'heartbeat_ok',
          verdict: 'enforced',
          process: 'aegis-airgap-kernel',
          destination: '0.0.0.0 (BLOCKED)',
          count_since_start: this.networkAuditCount,
        },
      });
    }, 5000);
  }

  stopBackgroundEmitters() {
    if (this.telemetryInterval) clearInterval(this.telemetryInterval);
    if (this.networkAuditInterval) clearInterval(this.networkAuditInterval);
  }

  /**
   * Process client envelope and emit simulated server responses
   */
  handleClientEnvelope(envelope, dispatchCallback) {
    const { type, session_id, payload } = envelope;

    if (type === 'user_message') {
      this._simulateAgentExecution(session_id, payload, dispatchCallback);
    } else if (type === 'approval_action') {
      // Echo approval update
      dispatchCallback({
        type: 'heartbeat',
        session_id,
        seq: 99,
        timestamp: new Date().toISOString(),
        payload: { text: `Deliverable ${payload.artifact_id} ${payload.action === 'approve' ? 'approved' : 'rejected'}` },
      });
    }
  }

  /**
   * Run realistic multi-phase agent execution
   */
  _simulateAgentExecution(sessionId, payload, dispatch) {
    const prompt = (payload.prompt || '').toLowerCase();
    const hasImage = payload.attachments?.some(a => a.type?.startsWith('image/') || /\.(png|jpg|jpeg|webp)$/i.test(a.name));
    const hasDoc = payload.attachments?.some(a => /\.(pdf|docx|txt|xlsx)$/i.test(a.name));
    const isCode = prompt.includes('code') || prompt.includes('audit') || prompt.includes('python') || prompt.includes('calculate');

    let stepCounter = 1;

    // Helper to send envelopes with timing
    const emit = (type, payloadObj, delayMs) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          dispatch({
            type,
            session_id: sessionId,
            seq: stepCounter++,
            timestamp: new Date().toISOString(),
            payload: payloadObj,
          });
          resolve();
        }, delayMs);
      });
    };

    (async () => {
      // 1. Initial Heartbeat
      await emit('heartbeat', { text: 'Initializing sovereign orchestrator...' }, 150);

      // 2. Model Routing
      let modelId = 'model-reasoning-qwen';
      let category = 'reasoning';
      let reason = 'Multi-step industrial reasoning required.';
      let vram = 24.0;

      if (hasImage) {
        modelId = 'model-vision-internvl';
        category = 'vision';
        reason = 'Image/Schematic optical inspection detected.';
        vram = 32.0;
      } else if (isCode) {
        modelId = 'model-coding-deepseek';
        category = 'coding';
        reason = 'Python calculation & sandbox verification requested.';
        vram = 28.0;
      }

      await emit('model_route', {
        model_id: modelId,
        category,
        reason,
        vram_gb: vram,
        load_status: 'loaded',
      }, 400);

      // 3. Phased Plan
      const planSteps = [
        { id: 'p1', phase: 'planning', title: 'Parse query parameters & security constraints', status: 'running' },
        { id: 'p2', phase: 'evaluation', title: hasImage ? 'Execute local Vision feature extraction' : (hasDoc ? 'Run local OCR & layout parsing' : 'Search internal SOPs via local RAG'), status: 'pending' },
        { id: 'p3', phase: 'execution', title: isCode ? 'Execute isolated Python sandbox stress model' : 'Verify compliance against ISO/ASME guidelines', status: 'pending' },
        { id: 'p4', phase: 'synthesis', title: 'Synthesize deliverables & generate verification artifact', status: 'pending' },
      ];

      await emit('plan', { steps: planSteps }, 500);

      // 4. Step 1 Completion
      await emit('plan_update', { id: 'p1', status: 'completed' }, 700);
      await emit('plan_update', { id: 'p2', status: 'running' }, 200);

      // 5. Tool Step (Vision / OCR / RAG)
      if (hasImage) {
        await emit('tool_step', {
          plan_step_id: 'p2',
          tool_call: {
            toolId: 'tool-vision',
            toolName: 'vision_analyzer',
            inputParams: { target: 'equipment_inspection.jpg', resolution: '4K' },
            outputResult: null,
            durationMs: 0,
            status: 'running',
          },
        }, 600);

        await emit('tool_step_update', {
          plan_step_id: 'p2',
          tool_call: {
            toolId: 'tool-vision',
            toolName: 'vision_analyzer',
            inputParams: { target: 'equipment_inspection.jpg', resolution: '4K' },
            outputResult: {
              detectedComponent: 'Industrial Centrifugal Impeller / Pump Casing',
              confidence: 0.984,
              observations: [
                'Surface oxidation and micro-pitting detected on flange perimeter',
                'Gasket alignment within 0.12mm tolerance limit',
                'Serial tag #AG-8820-K verified against local inventory database',
              ],
            },
            durationMs: 820,
            status: 'success',
          },
        }, 1100);
      } else {
        await emit('tool_step', {
          plan_step_id: 'p2',
          tool_call: {
            toolId: 'tool-rag',
            toolName: 'vector_knowledge_retriever',
            inputParams: { query: payload.prompt, top_k: 3, source: 'ASME_Section_VIII_Manual' },
            outputResult: null,
            durationMs: 0,
            status: 'running',
          },
        }, 600);

        await emit('tool_step_update', {
          plan_step_id: 'p2',
          tool_call: {
            toolId: 'tool-rag',
            toolName: 'vector_knowledge_retriever',
            inputParams: { query: payload.prompt, top_k: 3, source: 'ASME_Section_VIII_Manual' },
            outputResult: {
              matches: 3,
              topSimilarity: 0.942,
              summary: 'Found 3 corresponding clauses regarding structural safety factors and wall thickness.',
            },
            durationMs: 460,
            status: 'success',
          },
        }, 900);
      }

      await emit('plan_update', { id: 'p2', status: 'completed' }, 400);
      await emit('plan_update', { id: 'p3', status: 'running' }, 200);

      // 6. Tool Step 2: Code Execution Sandbox
      await emit('tool_step', {
        plan_step_id: 'p3',
        tool_call: {
          toolId: 'tool-code-execution',
          toolName: 'sandbox_python_executor',
          inputParams: {
            code: 'import math\ndef calc_safety_margin(p_psi, d_in, t_in, s_psi):\n    pr = (p_psi * d_in) / (2 * s_psi * 0.85)\n    return round(t_in - pr, 4)\nprint(f"Safety Allowance: {calc_safety_margin(450, 24, 0.625, 18000)} in")',
          },
          outputResult: null,
          durationMs: 0,
          status: 'running',
        },
      }, 700);

      await emit('tool_step_update', {
        plan_step_id: 'p3',
        tool_call: {
          toolId: 'tool-code-execution',
          toolName: 'sandbox_python_executor',
          inputParams: { code: 'calc_safety_margin(450, 24, 0.625, 18000)' },
          outputResult: {
            stdout: 'Safety Allowance: 0.2721 in\n[SANDBOX] Memory: 14MB | CPU: 0.04s | Egress: 0 bytes (AIRGAP)\n',
            exit_code: 0,
          },
          durationMs: 610,
          status: 'success',
        },
      }, 1000);

      await emit('plan_update', { id: 'p3', status: 'completed' }, 300);
      await emit('plan_update', { id: 'p4', status: 'running' }, 200);

      // 7. Citation
      await emit('citation', {
        marker: 1,
        source_name: 'ASME Section VIII Pressure Vessel Guidelines',
        location: 'Page 14, Clause UG-99 (Hydrostatic Testing & Wall Allowances)',
        snippet_preview: 'Minimum design metal temperature and calculated allowable stress limits shall not exceed 18,000 psi for welded carbon steel shell components under standard operating cycles.',
        kb_source: true,
      }, 500);

      // 8. Artifact
      const artifactId = `art-deliverable-${Date.now().toString().slice(-4)}`;
      await emit('artifact', {
        id: artifactId,
        title: 'ASME_Industrial_Inspection_Audit_Report.docx',
        type: 'file',
        fileType: 'word',
        sizeBytes: 164200,
        link: `/api/files/${artifactId}`,
        previewLink: `/api/files/${artifactId}/preview`,
        citedSources: [1],
        requiresApproval: true,
      }, 600);

      // 9. Streaming message chunks
      const fullResponse = `Based on the autonomous multi-stage analysis conducted on local hardware, here are the key findings:\n\n` +
        `1. **Structural & Wall Thickness Evaluation**: The calculated wall thickness allowance yields a positive buffer of **0.2721 inches**, well within ASME UG-99 safety limits [1].\n` +
        `2. **Visual & Surface Integrity**: Flange perimeter shows localized micro-pitting; recommended preventative seal re-greasing during Q3 maintenance.\n` +
        `3. **Sovereignty & Security Compliance**: 100% of reasoning, vector retrieval, and Python sandbox execution occurred inside the air-gapped environment. **Zero external network egress bytes logged**.\n\n` +
        `The formal inspection memo has been compiled and staged for review below.`;

      const words = fullResponse.split(' ');
      for (let i = 0; i < words.length; i += 4) {
        const chunk = words.slice(i, i + 4).join(' ') + ' ';
        await emit('message_chunk', { content: chunk }, 90);
      }

      await emit('plan_update', { id: 'p4', status: 'completed' }, 200);

      // 10. Final turn resolution
      await emit('final', {
        message_id: `msg-final-${Date.now()}`,
        content: fullResponse,
        citations: [1],
        artifact_ids: [artifactId],
        tokens_used: 542,
        tokens_per_sec: 58.4,
        total_duration_ms: 5400,
      }, 300);
    })();
  }
}

export const mockSimulator = new MockAgentSimulator();
export default mockSimulator;
