# YantraAI — PS 117 Distributed Project Completion Plan

## 1. Objective

Build YantraAI as a **distributed, local-first AI platform** where each team laptop performs a specialized role according to its hardware capability.

The system should demonstrate the PS 117 requirements while remaining:

- Stable
- Smooth
- Resource-aware
- Offline/local-first
- Fault tolerant
- Modular
- Independently testable per node

The distributed setup avoids forcing every laptop to run every large model.

---

# 2. Final Distributed Architecture

```text
                         ┌──────────────────────────────┐
                         │       RIYA — MASTER         │
                         │          24 GB RAM           │
                         │                              │
                         │ FastAPI / API Gateway       │
                         │ LangGraph Orchestrator      │
                         │ Model Router                │
                         │ Qwen3 8B                    │
                         │ Optional Qwen3 14B          │
                         └──────────────┬───────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              │                         │                         │
              ▼                         ▼                         ▼
   ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
   │ ANKUSH — RAG NODE  │   │ SAKSHI — VISION    │   │ AMARDEEP — TOOL     │
   │       16 GB        │   │       8 GB          │   │       M1 8 GB       │
   │                    │   │                    │   │                    │
   │ Qwen3 8B           │   │ Qwen3-VL 2B        │   │ Qwen3 4B            │
   │ nomic-embed-text   │   │ OCR                │   │ Coder 3B            │
   │ ChromaDB           │   │ Image/PDF analysis  │   │ Word/Excel/PPT/PDF  │
   │ Reranker           │   │                    │   │ Python tools        │
   └────────────────────┘   └────────────────────┘   └────────────────────┘
              │                         │                         │
              └─────────────────────────┼─────────────────────────┘
                                        │
                                        ▼
                           ┌─────────────────────────┐
                           │ SUMIT — SANDBOX / QA    │
                           │          8 GB            │
                           │                         │
                           │ Qwen2.5-Coder 3B        │
                           │ Qwen3 4B fallback       │
                           │ Code execution          │
                           │ Testing / validation    │
                           └─────────────────────────┘

                           ANISH
                           ─────
                           Laptop currently damaged.
                           Architecture / orchestration work.
                           Model assignment after repair.
```

---

# 3. Team Responsibilities

## Riya — Master / Orchestrator

### Hardware
- 24 GB RAM
- Intel Core Ultra 5 125H
- Integrated graphics

### Models
- **Qwen3 8B** — production/default reasoning model
- **Qwen3 14B** — optional high-quality benchmark mode

### Responsibilities
- FastAPI API gateway
- LangGraph orchestration
- Model router
- Worker discovery
- Health checks
- Request aggregation
- Fallback handling
- Final response synthesis
- Authentication/session layer if required

### APIs

```text
POST /chat
POST /route
GET  /workers
GET  /health
```

---

# 4. Ankush — RAG / Knowledge Node

### Hardware
- 16 GB RAM
- Intel Core i5-1235U

### Models
- **Qwen3 8B**
- **nomic-embed-text**

### Components
- Document ingestion
- Chunking
- Embedding
- ChromaDB
- Retrieval
- Reranking
- RAG answer generation

### APIs

```text
POST /rag/ingest
POST /rag/query
POST /rag/search
POST /rag/reindex
GET  /rag/health
```

### Pipeline

```text
Document
   ↓
Parser / OCR
   ↓
Chunking
   ↓
nomic-embed-text
   ↓
ChromaDB
   ↓
Retriever
   ↓
Reranker
   ↓
Qwen3 8B
   ↓
Context / Answer
```

Use the existing 768-dimensional embedding setup consistently. Do not randomly change the production embedding model because changing it requires re-embedding the vector collection.

---

# 5. Sakshi — Vision / Multimodal Node

### Hardware
- 8 GB RAM
- Intel Core i5-1135G7
- NVIDIA MX350, 2 GB VRAM

### Model
- **Qwen3-VL 2B**

### Other components
- OCR
- PDF-to-image processing
- Image preprocessing
- Multimodal analysis

### APIs

```text
POST /vision/analyze
POST /vision/ocr
POST /vision/document
GET  /vision/health
```

### Pipeline

```text
PDF / Image / Scan
        ↓
       OCR
        ↓
Image + Text
        ↓
Qwen3-VL 2B
        ↓
Structured Findings
        ↓
Riya
```

Do not use large 7B/8B vision models on this machine as the default because of the 8 GB system RAM and 2 GB VRAM.

---

# 6. AmarDeep — Tool / Document Node

### Hardware
- Apple M1
- 8 GB RAM

### Models
- **Qwen3 4B**
- **Qwen2.5-Coder 3B**

### Main responsibility

This node should primarily provide executable tools rather than heavy model inference.

### Tools

```text
Python execution
Excel generation
Word generation
PowerPoint generation
PDF generation
File operations
Data processing
```

### Libraries

```text
openpyxl
python-docx
python-pptx
reportlab
pandas
numpy
```

### APIs

```text
POST /tools/python
POST /tools/excel
POST /tools/word
POST /tools/ppt
POST /tools/pdf
GET  /tools/health
```

---

# 7. Sumit — Coding Sandbox / QA Node

### Hardware
- 8 GB RAM
- 11th Gen Intel i5

### Models
- **Qwen2.5-Coder 3B**
- **Qwen3 4B** — fallback

### Responsibilities
- Code generation support
- Sandboxed execution
- Test execution
- Output validation
- Error detection
- Retry/fix loop
- File validation

### APIs

```text
POST /sandbox/run
POST /sandbox/test
POST /sandbox/validate
GET  /sandbox/health
```

### Coding flow

```text
User
 ↓
Riya Router
 ↓
Sumit
 ↓
Qwen2.5-Coder 3B
 ↓
Sandbox
 ↓
Execute
 ↓
Test
 ↓
PASS / FAIL
 ↓
Retry if required
 ↓
Final result
```

---

# 8. Anish

Anish's laptop is currently damaged.

### Current responsibility

- Architecture
- LangGraph design
- Worker communication
- Routing logic
- Failure handling
- Documentation
- Integration planning

After the laptop is repaired, assign a model based on its actual CPU/RAM/GPU specifications.

---

# 9. Automatic Model / Worker Routing

The master node should not hard-code every request to one machine.

Create a **Worker Registry**.

Example:

```json
{
  "workers": {
    "riya": {
      "role": "master",
      "models": ["qwen3:8b"],
      "status": "healthy"
    },
    "ankush": {
      "role": "rag",
      "models": ["qwen3:8b", "nomic-embed-text"],
      "status": "healthy"
    },
    "sakshi": {
      "role": "vision",
      "models": ["qwen3-vl:2b"],
      "status": "healthy"
    },
    "amardeep": {
      "role": "tools",
      "models": ["qwen3:4b", "qwen2.5-coder:3b"],
      "status": "healthy"
    },
    "sumit": {
      "role": "sandbox",
      "models": ["qwen2.5-coder:3b", "qwen3:4b"],
      "status": "healthy"
    }
  }
}
```

---

# 10. Hardware-Aware Routing

The router should consider:

- Task type
- Model capability
- Worker availability
- RAM usage
- Active requests
- Response latency
- Health status

Example:

```text
Request: Reasoning
        ↓
Check available models
        ↓
Qwen3 14B → high RAM usage → avoid
Qwen3 8B  → healthy         → select
        ↓
Execute
```

This makes routing **hardware-aware instead of model-size-only**.

---

# 11. Health Check System

Every worker should expose:

```text
GET /health
```

Example:

```json
{
  "status": "healthy",
  "worker": "sakshi",
  "model": "qwen3-vl:2b",
  "ram_usage": 48,
  "active_requests": 0
}
```

The master periodically checks worker health.

---

# 12. Failure / Fallback

A worker failure must not crash the complete system.

Example:

```text
Vision request
      ↓
Sakshi
      ↓
OFFLINE
      ↓
Router detects failure
      ↓
Fallback vision worker/model
      ↓
Continue request
```

Similarly:

```text
RAG Node unavailable
        ↓
Fallback RAG capability on Master
        ↓
Continue
```

---

# 13. PS 117 End-to-End Demo Flow

Use one strong end-to-end scenario:

> Analyze an uploaded engineering/inspection document, retrieve relevant internal knowledge, perform reasoning, generate/verify code if required, and create a final deliverable.

### Distributed execution

```text
                         USER
                           ↓
                    RIYA MASTER
                           ↓
                    LangGraph
                           ↓
                    Task Router
                           ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
     SAKSHI             ANKUSH             SUMIT
     Vision              RAG              Sandbox
        ↓                  ↓                  ↓
      OCR             ChromaDB          Code/Test
        ↓                  ↓                  ↓
        └──────────────────┼──────────────────┘
                           ↓
                       AMARDEEP
                           ↓
                    Word / Excel / PPT
                           ↓
                         RIYA
                           ↓
                    Final Response
```

---

# 14. Example Demo

### User

```text
Analyze this maintenance drawing and
prepare a maintenance recommendation using
our internal manuals.
```

### Step 1 — Master

Riya receives the request.

```text
Task detection:
Vision + RAG + Document generation
```

### Step 2 — Vision

Riya sends the image/document to Sakshi.

```text
OCR
 ↓
Qwen3-VL 2B
 ↓
Detected components / observations
```

### Step 3 — RAG

Riya sends relevant query to Ankush.

```text
Query
 ↓
Embedding
 ↓
ChromaDB
 ↓
Reranking
 ↓
Relevant manual sections
```

### Step 4 — Reasoning

Riya's Qwen3 8B combines:

```text
Vision findings
+
Retrieved knowledge
+
User request
```

### Step 5 — Deliverable

Riya sends the structured result to AmarDeep.

```text
python-docx
 ↓
Maintenance Recommendation.docx
```

### Step 6 — Validation

If code/calculation is required:

```text
Sumit
 ↓
Sandbox
 ↓
Execute
 ↓
Validate
```

### Step 7 — Final response

Riya returns:

```text
Findings
+
Evidence
+
Recommendation
+
Generated document
```

---

# 15. Stability Rules

## Rule 1 — Do not run every model simultaneously

Avoid:

```text
Qwen3
+
Coder
+
Vision
+
ChromaDB
+
FastAPI
+
React
```

on a low-RAM machine.

Load/use only the required model.

## Rule 2 — 8 GB machines use small models

```text
General → Qwen3 4B
Coding  → Qwen2.5-Coder 3B
Vision  → Qwen3-VL 2B
```

## Rule 3 — 16 GB machine

```text
General → Qwen3 8B
Coding  → Qwen2.5-Coder 7B
Vision  → Qwen3-VL 4B
```

## Rule 4 — 24 GB machine

Production default:

```text
General → Qwen3 8B
Coding  → Qwen2.5-Coder 7B
Vision  → Qwen3-VL 4B
```

Optional benchmark:

```text
General → Qwen3 14B
Coding  → Qwen2.5-Coder 14B
Vision  → Qwen3-VL 8B
```

## Rule 5 — Same embedding model

Use:

```text
nomic-embed-text
```

across the RAG deployment.

---

# 16. Network Architecture

Use a private LAN/Wi-Fi network.

Example:

```text
Riya       → 192.168.1.10:8000
Ankush     → 192.168.1.11:8001
Sakshi     → 192.168.1.12:8002
AmarDeep   → 192.168.1.13:8003
Sumit      → 192.168.1.14:8004
```

The exact IP addresses should be assigned dynamically or through DHCP reservation rather than hard-coded permanently.

Master configuration:

```text
RIYA_MASTER_URL
ANKUSH_RAG_URL
SAKSHI_VISION_URL
AMARDEEP_TOOLS_URL
SUMIT_SANDBOX_URL
```

---

# 17. Recommended Project Structure

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
└── docker/
```

---

# 18. Completion Checklist

## Master

- [ ] FastAPI gateway
- [ ] LangGraph workflow
- [ ] Model router
- [ ] Worker registry
- [ ] Health checks
- [ ] Timeout handling
- [ ] Retry handling
- [ ] Fallback handling
- [ ] Final response aggregation

## RAG

- [ ] Document ingestion
- [ ] OCR/parser
- [ ] Chunking
- [ ] nomic embeddings
- [ ] ChromaDB
- [ ] Retrieval
- [ ] Reranking
- [ ] Citation/source tracking
- [ ] RAG API

## Vision

- [ ] OCR
- [ ] Image preprocessing
- [ ] Qwen3-VL 2B
- [ ] PDF/image endpoint
- [ ] Structured output

## Tools

- [ ] Python execution
- [ ] Excel generation
- [ ] Word generation
- [ ] PPT generation
- [ ] PDF generation
- [ ] File operations

## Sandbox

- [ ] Isolated execution
- [ ] Timeout
- [ ] Resource limits
- [ ] Test execution
- [ ] Output validation
- [ ] Failure reporting

## Frontend

- [ ] Chat interface
- [ ] File upload
- [ ] Model/worker status
- [ ] RAG source display
- [ ] Tool execution status
- [ ] Generated file download
- [ ] Error/fallback status

## Integration

- [ ] All workers reachable
- [ ] Health checks working
- [ ] Router working
- [ ] RAG working
- [ ] Vision working
- [ ] Sandbox working
- [ ] Document generation working
- [ ] Fallback tested
- [ ] Full end-to-end demo tested

---

# 19. Final Distributed Deployment

| Team Member | Node | Primary Model(s) | Main Responsibility |
|---|---|---|---|
| **Riya** | Master | Qwen3 8B | Orchestration + routing |
| **Ankush** | RAG | Qwen3 8B + nomic-embed-text | Knowledge/RAG |
| **Sakshi** | Vision | Qwen3-VL 2B | OCR + multimodal |
| **AmarDeep** | Tools | Qwen3 4B + Coder 3B | File/document tools |
| **Sumit** | Sandbox/QA | Coder 3B + Qwen3 4B | Code execution/testing |
| **Anish** | Architecture | After laptop repair | LangGraph/integration |

---

# 20. Definition of Done

The distributed YantraAI project is considered complete when:

1. Every active worker starts independently.
2. Master can discover all workers.
3. Master can check worker health.
4. User requests are automatically routed.
5. RAG works through the RAG node.
6. Image/PDF analysis works through the Vision node.
7. Coding requests can be generated and sandbox-tested.
8. Word/Excel/PPT/PDF files can be generated.
9. Worker failures trigger fallback instead of crashing the whole system.
10. The complete PS 117 demo works end-to-end over the private network.
11. The system can operate locally without requiring external model APIs.
12. Logs clearly show which worker/model handled each task.
13. Latency, RAM usage and failure cases are benchmarked before the final demo.

---

# 21. Final Principle

**Do not distribute randomly. Distribute by capability.**

```text
Riya      → Brain / Orchestrator
Ankush    → Knowledge / RAG
Sakshi    → Vision
AmarDeep  → Tools / Documents
Sumit     → Code / Sandbox / QA
Anish     → Architecture / Integration
```

This gives YantraAI a practical distributed architecture where the available hardware is used efficiently while maintaining PS 117 functionality and demo stability.
