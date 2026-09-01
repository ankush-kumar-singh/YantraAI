# 🛡 AegisAI — Sovereign Multimodal AI Workbench

> **"Sovereign Multimodal AI Workbench — Secure. Local. Intelligent."**

A complete, enterprise-grade, air-gapped AI Workbench designed for confidential industrial and government organizations. Built with React, Tailwind CSS, REST API service layers, and live streaming WebSocket agent protocol.

---

## 🌟 Visual Inspiration & UI Architecture

Inspired by the focused, minimal, dark workstation aesthetic:
- **Left Sidebar**: Collapsible dark navigation rail with New Task, `Ctrl+K` Global Search palette, Workspace threads, and dynamic Air-Gap Status badge.
- **Central Workspace**: Clean, distraction-free welcome screen with sovereign branding and bottom-anchored multimodal command bar.
- **Agentic Live Trace**: Real-time heartbeat thinking indicators, model routing decisions (Reasoning, Vision, Coding, OCR), phased execution checklists, Python sandbox outputs, vision defect cards, OCR tables, grounded citations, and deliverable artifacts with interactive approval workflows.

---

## ⚙️ Environment Configuration

Set the following environment variables in `.env`:

```env
# FastAPI Backend REST API URL
VITE_API_BASE_URL=http://localhost:8000/api

# Live Agent Event WebSocket URL
VITE_WS_URL=ws://localhost:8000/ws

# Graceful interactive demo fallback when backend is offline
# Set to 'false' in strict production air-gapped environments
VITE_ENABLE_SIMULATOR_FALLBACK=true

# Defaults
VITE_DEFAULT_RUN_MODE=agent
VITE_DEFAULT_MODEL_MODE=auto
VITE_APP_ORGANIZATION=Sovereign Air-Gapped Facility
```

---

## 🔌 Universal WebSocket Envelope Protocol

The frontend strictly implements the backend communication standard:

### 1. Envelope Format
```json
{
  "type": "string",
  "session_id": "conv_1042",
  "seq": 1,
  "timestamp": "2026-08-31T10:30:15.000Z",
  "payload": {}
}
```

### 2. Handled Server-to-Client Events
- `heartbeat`: Active status pill (`"Analyzing query..."`, `"Executing sandbox..."`)
- `model_route`: Orchestrator decision (`model_id`, `category`, `reason`, `vram_gb`, `load_status`)
- `plan` & `plan_update`: Autonomous phased checklist (`planning`, `evaluation`, `execution`, `synthesis`)
- `tool_step` & `tool_step_update`: Real-time execution of Python Sandbox, Vision Analysis, OCR Extraction, and RAG vector search
- `citation`: Grounded source references with page/clause and expandable snippets
- `artifact`: Deliverables (`.docx`, `.xlsx`, `.pdf`) with Preview modal, Download, and Operator Approval actions (`approve`, `request_changes`, `reject`)
- `message_chunk`: Sequential token streaming to assistant message block
- `final`: Turn resolution with usage metrics (`tokens_used`, `tokens_per_sec`, `total_duration_ms`)
- `telemetry` & `network_audit`: Background GPU utilization %, VRAM pool breakdown, and 0 external egress firewall proofs

---

## 🚀 Running the Project

```bash
# Navigate to project
cd aegis-ai-workbench

# Install dependencies (if not already installed)
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 📁 Application Pages & Routes

1. **`/` or `/workspace`**: Main AI Workbench with streaming chat, live agent trace, file attachments, and artifact approvals.
2. **`/documents`**: Air-gapped file repository with drag-and-drop upload, OCR triggers, and RAG vector indexing status.
3. **`/knowledge-base`**: Local vector knowledge sources (ASME, ISO, SOPs) and cosine similarity playground.
4. **`/models`**: Local model registry (Qwen 32B, InternVL2 26B, DeepSeek Coder 33B, Nougat OCR) with VRAM monitoring.
5. **`/tools`**: Sandbox tool registry with parameter schema viewer and test invocation sandbox.
6. **`/tasks`**: Autonomous agent task monitor with execution stage timelines.
7. **`/audit-logs`**: Immutable audit logs proving 0 cloud API calls and exportable sovereignty compliance certificate.
8. **`/security`**: Sovereignty & airgap infrastructure dashboard.
9. **`/settings`**: Centralized backend endpoints and inference parameters.
10. **`Ctrl+K`**: Instant global search command palette.
