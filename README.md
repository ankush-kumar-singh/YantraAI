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

# YantraAI 🤖

> **A distributed, local-first AI platform designed to intelligently coordinate specialized AI capabilities across multiple nodes.**

YantraAI is a modular AI platform built around a **distributed architecture**, where different nodes handle different types of workloads.

Instead of running every model and service on a single machine, YantraAI distributes tasks across specialized nodes such as:

* 🧠 AI orchestration
* 📚 Knowledge & RAG
* 👁️ Vision & OCR
* 🛠️ Tool execution
* 💻 Code generation & sandboxing
* 📄 Document generation
* 🔍 Validation & quality assurance

The system is designed to be **resource-aware, fault-tolerant, local-first, modular, and scalable**.

---

## ✨ Features

* 🧠 **Intelligent Task Routing**
* 🌐 **Distributed AI Architecture**
* 📚 **Retrieval-Augmented Generation**
* 👁️ **Multimodal & Vision Processing**
* 🔎 **OCR & Document Understanding**
* 🛠️ **Tool & File Execution**
* 💻 **Code Generation & Sandboxed Execution**
* 📄 **Dynamic Document Generation**
* 🔐 **Role-Aware Processing**
* ❤️ **Worker Health Monitoring**
* 🛡️ **Fault Tolerance & Fallbacks**
* 💬 **Conversational AI**
* 🏠 **Local-First AI Processing**
* ⚡ **Hardware-Aware Model Selection**

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────────┐
                         │          USER           │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │   MASTER / ORCHESTRATOR │
                         │                         │
                         │ FastAPI                 │
                         │ LangGraph               │
                         │ Task Router             │
                         │ Worker Registry         │
                         │ Health Monitoring       │
                         └────────────┬────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                ▼                     ▼                     ▼
       ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
       │   RAG NODE     │    │  VISION NODE   │    │   TOOL NODE    │
       │                │    │                │    │                │
       │ Documents      │    │ OCR            │    │ Python         │
       │ Embeddings     │    │ Images         │    │ Word           │
       │ ChromaDB       │    │ PDFs           │    │ Excel          │
       │ Retrieval      │    │ Multimodal AI  │    │ PowerPoint     │
       │ Reranking      │    │                │    │ PDF            │
       └───────┬────────┘    └───────┬────────┘    └───────┬────────┘
               │                     │                     │
               └─────────────────────┼─────────────────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │   SANDBOX / QA      │
                          │                     │
                          │ Code Execution      │
                          │ Testing             │
                          │ Validation          │
                          │ Error Detection     │
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │  RESPONSE / OUTPUT  │
                          └─────────────────────┘
```

---

<<<<<<< HEAD
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
=======
# 🧠 How YantraAI Works

YantraAI follows a **Master–Worker architecture**.

The Master receives the user's request and determines what capabilities are required.

For example:

```text
User Request
      ↓
Task Understanding
      ↓
Capability Detection
      ↓
Worker Selection
      ↓
Task Execution
      ↓
Result Validation
      ↓
Response Aggregation
      ↓
Final Answer
```

A single request can involve multiple workers.

For example:

```text
User
 ↓
Master
 ↓
Vision → OCR
 ↓
RAG → Retrieve Knowledge
 ↓
Reasoning → Analyze Information
 ↓
Sandbox → Validate Calculation/Code
 ↓
Tools → Generate Document
 ↓
Master → Final Response
```

---

# 🔀 Intelligent Task Routing

YantraAI does not send every request to the same model.

The routing system considers:

* Task type
* Required capability
* Available models
* Worker health
* Resource availability
* Current workload
* Response latency
* Fallback options

Example:

```text
Request
   ↓
"What is written in this scanned document?"
   ↓
Vision Task
   ↓
Vision Worker
   ↓
OCR + Multimodal Analysis
   ↓
Result
```

Another example:

```text
Request
   ↓
"Search our internal documentation for this topic."
   ↓
Knowledge Task
   ↓
RAG Worker
   ↓
Retrieval + Reranking
   ↓
Relevant Context
```

---

# 📚 RAG & Knowledge System

The knowledge layer allows YantraAI to work with organizational documents.

Supported document types include:

```text
PDF
DOCX
TXT
JSON
CSV
```

### RAG Pipeline

```text
Document
    ↓
Document Parser
    ↓
Chunking
    ↓
Embedding Generation
    ↓
Vector Database
    ↓
Semantic Retrieval
    ↓
Reranking
    ↓
Relevant Context
    ↓
LLM
    ↓
Grounded Answer
```

### Components

* Document ingestion
* Text extraction
* Chunking
* Embeddings
* ChromaDB
* Semantic search
* Metadata filtering
* Reranking
* Context construction
* LLM generation

The system is designed to answer using retrieved information rather than relying entirely on the model's pretrained knowledge.

---

# 👁️ Vision & OCR

The Vision node handles visual and scanned information.

```text
Image / PDF / Scan
        ↓
Image Processing
        ↓
OCR
        ↓
Multimodal Model
        ↓
Structured Information
        ↓
Master
```

Possible workloads:

* Scanned PDFs
* Images
* Documents
* Tables
* Diagrams
* Forms
* Visual inspection
* Text extraction

---

# 🛠️ Tool System

YantraAI can delegate real-world operations to specialized tools.

Examples:

```text
Python Execution
Data Processing
Excel Generation
Word Generation
PowerPoint Generation
PDF Generation
File Operations
```

The tool layer separates **reasoning** from **execution**.

```text
AI Reasoning
     ↓
Tool Selection
     ↓
Tool Execution
     ↓
Result
     ↓
AI Interpretation
```

---

# 💻 Coding & Sandbox

The coding subsystem provides controlled code generation and execution.

```text
User Request
      ↓
Code Generation
      ↓
Sandbox
      ↓
Execution
      ↓
Testing
      ↓
Validation
      ↓
PASS / FAIL
```

If execution fails:

```text
Error
  ↓
Analyze Error
  ↓
Generate Fix
  ↓
Execute Again
  ↓
Validate
```

The sandbox is designed to isolate code execution from the main orchestration layer.

---

# 📄 Document Generation

YantraAI can transform structured information into usable documents.

```text
Information
     ↓
AI Processing
     ↓
Structured JSON
     ↓
Document Generator
     ↓
┌────────┬────────┬────────┐
│  DOCX  │  PDF   │ Excel  │
└────────┴────────┴────────┘
```

This enables automated generation of:

* Reports
* Tables
* Documents
* Spreadsheets
* Presentations
* Structured outputs

---

# 💬 Conversational AI

YantraAI supports conversational interactions where previous messages can be maintained as context.

```text
User
 ↓
Question
 ↓
AI Response
 ↓
Conversation Memory
 ↓
Follow-up Question
 ↓
Context-aware Response
```

Example:

```text
User:
What is normalization?

AI:
Normalization is...

User:
Why do we need it?

AI:
It reduces redundancy...
```

---

# 🔐 Role-Aware Knowledge Access

YantraAI can apply role-based access to information.

Documents can contain metadata such as:

```json
{
  "document_id": "DOC_XXXX",
  "category": "technical"
}
```

During retrieval, the system can filter information according to the user's permissions and role.

This helps prevent unrelated or unauthorized information from entering the AI context.

---

# ❤️ Worker Health Monitoring

Each worker exposes a health endpoint.

```text
GET /health
```

The Master monitors:

* Worker availability
* Model availability
* Active requests
* Resource usage
* Response status

Example:

```json
{
  "status": "healthy",
  "worker": "rag",
  "active_requests": 0
}
>>>>>>> 48a42b655e8c1183cb54b89ec6f33fdc674e7e0d
```

---

<<<<<<< HEAD
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
=======
# 🛡️ Fault Tolerance

YantraAI is designed so that failure of one worker does not necessarily stop the complete platform.

```text
Primary Worker
      ↓
   Failure
      ↓
Health Monitor
      ↓
Fallback Detection
      ↓
Alternative Worker
      ↓
Continue Processing
```

The system can use:

* Health checks
* Timeouts
* Retries
* Fallback workers
* Graceful error handling
* Worker status tracking

---

# ⚡ Hardware-Aware AI

Different machines have different hardware capabilities.

YantraAI therefore avoids treating every machine equally.

The router can consider:

```text
Task
 ↓
Model Capability
 ↓
Hardware Capability
 ↓
Current Resource Usage
 ↓
Worker Health
 ↓
Best Available Node
```

This prevents unnecessarily loading large models on low-resource machines.

---

# 🌐 Distributed Communication

The nodes communicate through APIs over a private network.

Example:

```text
Master
  │
  ├── RAG Worker
  │
  ├── Vision Worker
  │
  ├── Tool Worker
  │
  └── Sandbox Worker
```

Each worker can run independently and expose its own API.

This makes the system:

* Modular
* Independently testable
* Easier to debug
* Easier to scale
* Easier to replace

---

# 🔌 Example APIs

### Master

```text
POST /chat
POST /route
GET  /workers
GET  /health
```

### RAG

```text
POST /rag/ingest
POST /rag/query
POST /rag/search
POST /rag/reindex
GET  /rag/health
```

### Vision

```text
POST /vision/analyze
POST /vision/ocr
POST /vision/document
GET  /vision/health
```

### Tools

```text
POST /tools/python
POST /tools/excel
POST /tools/word
POST /tools/ppt
POST /tools/pdf
GET  /tools/health
```

### Sandbox

```text
POST /sandbox/run
POST /sandbox/test
POST /sandbox/validate
GET  /sandbox/health
```

---

# 📁 Project Structure

```text
yantraai/
│
├── master/
│   ├── main.py
│   ├── router.py
│   ├── graph.py
│   ├── registry.py
│   └── health.py
│
├── workers/
│   ├── rag/
│   │   ├── main.py
│   │   ├── embeddings.py
│   │   ├── retriever.py
│   │   └── reranker.py
│   │
│   ├── vision/
│   │   ├── main.py
│   │   ├── ocr.py
│   │   └── vision.py
│   │
│   ├── tools/
│   │   ├── main.py
│   │   ├── python.py
│   │   ├── excel.py
│   │   ├── word.py
│   │   └── ppt.py
│   │
│   └── sandbox/
│       ├── main.py
│       ├── executor.py
│       └── validator.py
│
├── frontend/
│
├── shared/
│   ├── schemas.py
│   ├── config.py
│   └── logging.py
│
├── tests/
│
├── docker/
│
├── requirements.txt
├── models.txt
└── README.md
```

---

# 🧰 Technology Stack

| Layer               | Technology                 |
| ------------------- | -------------------------- |
| Backend             | Python                     |
| API                 | FastAPI                    |
| Orchestration       | LangGraph                  |
| LLM Runtime         | Ollama                     |
| LLMs                | Qwen Family                |
| Embeddings          | nomic-embed-text           |
| Vector Database     | ChromaDB                   |
| Reranking           | BGE Reranker               |
| OCR                 | OCR Pipeline               |
| Document Processing | Python Libraries           |
| Data Processing     | Pandas / NumPy             |
| Word                | python-docx                |
| Excel               | openpyxl                   |
| PowerPoint          | python-pptx                |
| PDF                 | ReportLab                  |
| Communication       | REST APIs                  |
| Architecture        | Distributed Master–Worker |

---

# 🚀 Installation

## Clone the Repository

```bash
git clone <repository-url>
cd yantraai
```

## Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🦙 Local Model Setup

YantraAI uses local model runtimes so that the core AI workflow can operate without depending on external model APIs.

Example:

```bash
ollama list
```

Required models depend on the worker being deployed.

Typical capabilities include:

```text
Qwen3
Qwen3-VL
Qwen2.5-Coder
nomic-embed-text
```

---

# ▶️ Running YantraAI

Each worker can be started independently.

```bash
python master/main.py
```

```bash
python workers/rag/main.py
```

```bash
python workers/vision/main.py
```

```bash
python workers/tools/main.py
```

```bash
python workers/sandbox/main.py
```

Once the workers are running, the Master can discover and communicate with them.

---

# 🧪 Testing

Each component should be independently tested.

### Master

```text
✓ Routing
✓ Worker discovery
✓ Health checks
✓ Retry handling
✓ Fallback handling
✓ Response aggregation
```

### RAG

```text
✓ Document ingestion
✓ Chunking
✓ Embeddings
✓ Retrieval
✓ Reranking
✓ Metadata filtering
✓ Answer generation
```

### Vision

```text
✓ OCR
✓ Image processing
✓ PDF processing
✓ Multimodal analysis
```

### Tools

```text
✓ Python execution
✓ DOCX generation
✓ Excel generation
✓ PPT generation
✓ PDF generation
```

### Sandbox

```text
✓ Code execution
✓ Testing
✓ Validation
✓ Timeout handling
✓ Error handling
```

---

# 🎯 End-to-End Example

A complete YantraAI workflow can look like this:

```text
User uploads document
        ↓
Master receives request
        ↓
Task analysis
        ↓
Vision Worker
        ↓
OCR + Visual Analysis
        ↓
RAG Worker
        ↓
Internal Knowledge Retrieval
        ↓
Master
        ↓
Reasoning & Decision Making
        ↓
Sandbox Worker
        ↓
Code / Calculation Validation
        ↓
Tool Worker
        ↓
Report Generation
        ↓
Master
        ↓
Final Answer + Generated File
```

This allows multiple specialized AI capabilities to work together as a single system.

---

# 📈 Why Distributed?

Running every model and service on one machine can cause:

* High RAM usage
* Model conflicts
* Slow inference
* Resource contention
* Difficult debugging
* Reduced reliability

YantraAI distributes workloads according to capability.

```text
                ONE AI PLATFORM
                       │
       ┌───────────────┼───────────────┐
       ↓               ↓               ↓
   Knowledge         Vision          Tools
       │               │               │
       └───────────────┼───────────────┘
                       ↓
                    Sandbox
                       ↓
                  Final Output
```

---

# 🔮 Future Scope

YantraAI can be extended with:

* Advanced hybrid search
* Better multimodal understanding
* More sophisticated agent workflows
* Dynamic model loading
* GPU-aware routing
* Distributed queues
* Authentication
* Fine-grained permissions
* Streaming responses
* Monitoring dashboards
* Distributed logging
* Docker-based deployment
* Kubernetes deployment
* More AI workers
* Additional document formats
* Advanced OCR
* Voice input/output

---

# 📋 Project Checklist

### Core Platform

* [ ] Master API
* [ ] LangGraph orchestration
* [ ] Intelligent router
* [ ] Worker registry
* [ ] Health monitoring
* [ ] Retry mechanism
* [ ] Fallback mechanism

### Knowledge

* [ ] Document ingestion
* [ ] Chunking
* [ ] Embeddings
* [ ] Vector database
* [ ] Retrieval
* [ ] Reranking
* [ ] Metadata filtering

### Vision

* [ ] OCR
* [ ] Image processing
* [ ] PDF analysis
* [ ] Multimodal processing

### Tools

* [ ] Python execution
* [ ] Word generation
* [ ] Excel generation
* [ ] PowerPoint generation
* [ ] PDF generation

### Sandbox

* [ ] Code execution
* [ ] Testing
* [ ] Validation
* [ ] Timeout control
* [ ] Error handling

### Integration

* [ ] Worker communication
* [ ] End-to-end workflow
* [ ] Failure recovery
* [ ] Performance testing
* [ ] Resource monitoring
* [ ] Final PS 117 demonstration

---

# 👥 Team

* Riya
* Ankush
* Sakshi
* AmarDeep
* Sumit
* Anish

---

# 🏁 Definition of Done

YantraAI is considered complete when:

* All required workers can run independently.
* The Master can discover and communicate with workers.
* Tasks are routed according to capability and resources.
* RAG can retrieve and use internal knowledge.
* Vision can process images and scanned documents.
* Tools can perform required operations.
* Code can be executed and validated through the sandbox.
* Generated documents can be produced.
* Worker failures are handled gracefully.
* The complete workflow works over the local network.
* The system can operate using local AI models.
* The complete PS 117 demonstration works end-to-end.

---

# 🚀 YantraAI

```text
          DISTRIBUTED
               +
          LOCAL-FIRST
               +
       HARDWARE-AWARE
               +
          MULTIMODAL
               +
             RAG
               +
       TOOL EXECUTION
               +
          SANDBOXING
               +
        FAULT TOLERANCE
               ↓
            YANTRAAI
```

> **One platform. Multiple specialized AI workers. One intelligent system.**
>>>>>>> 48a42b655e8c1183cb54b89ec6f33fdc674e7e0d
