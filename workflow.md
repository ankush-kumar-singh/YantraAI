# YantraAI — Project Workflow & Development Plan

## 1. Project Overview

YantraAI is a secure, on-premise AI workbench designed to process confidential documents and provide intelligent assistance without sending sensitive data to external cloud services.

The system will combine:

* Local LLMs
* RAG (Retrieval-Augmented Generation)
* Agentic workflows
* Multimodal AI
* Document processing
* Python/Excel tools
* File generation
* Multiple specialized AI models

The final system should allow a user to ask questions, analyze documents, execute tools, and generate useful outputs through a single interface.

---

# 2. Overall Architecture

```text
                         USER
                           │
                           ▼
                  ┌────────────────┐
                  │    FRONTEND    │
                  │ React / Next.js│
                  └───────┬────────┘
                          │
                          ▼
                  ┌────────────────┐
                  │    FastAPI     │
                  │    BACKEND     │
                  └───────┬────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │    AGENT ORCHESTRATOR  │
              │       LangGraph        │
              └───────────┬────────────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │MODEL ROUTER│   │ RAG ENGINE │   │ TOOL ENGINE│
   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
         │                 │                │
    ┌────┼────┐            ▼          ┌─────┼─────┐
    ▼    ▼    ▼       Vector DB       ▼     ▼     ▼
   LLM  LLM Vision      Chroma       File  Python Excel
                                      Tool   Tool  Tool
         │                 │
         └────────┬────────┘
                  ▼
           FINAL RESPONSE
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
      DOCX       XLSX      PPTX
```

---

# 3. CURRENT STATUS

## Already Implemented

The basic RAG system is currently working.

### Document Processing

* PDF files can be placed inside `documents/`
* PDFs are automatically detected
* PDF text is extracted using PyMuPDF
* Documents are processed page-by-page
* Sections can be detected
* Large text is divided into chunks

### Embeddings

Current embedding model:

```text
nomic-embed-text
```

Embedding dimension:

```text
768
```

The embedding model runs locally through Ollama.

### Vector Database

Current vector database:

```text
ChromaDB
```

Current collection:

```text
yantra_documents
```

Metadata stored with chunks includes:

```text
filename
page
section
chunk
```

### Retrieval

The system currently:

1. Receives a user question
2. Creates an embedding
3. Searches ChromaDB
4. Retrieves relevant chunks
5. Applies distance threshold
6. Uses section detection when possible
7. Builds document context

### LLM

Current generation model:

```text
qwen3:1.7b
```

The model receives the retrieved document context and generates the answer.

### Conversation Memory

The system stores recent:

```text
User question
Assistant answer
```

This allows follow-up questions such as:

```text
User: What algorithms are included?

User: What about the unsupervised ones?
```

The previous conversation can help resolve references.

### Source Information

The RAG response currently shows:

```text
Source
Page
Section
Chunk
Distance
```

This provides basic traceability for answers.

---

# 4. CURRENT PROJECT STRUCTURE

```text
YantraAI/
│
├── documents/
│   ├── dbms_comprehensive_notes.pdf
│   ├── Machine_Learning_Complete_Notes.pdf
│   └── my_file.pdf
│
├── chroma_db/
│   └── ChromaDB files
│
├── ingest.py
├── insteractive_rag.py
├── rag.py
├── search.py
├── embeddings.py
├── create_embeddings.py
├── chunk_text.py
├── extract_text.py
├── reranker.py
├── demo.py
│
├── README.md
└── workflow.md
```

---

# 5. CURRENT RAG FLOW

```text
PDF
 │
 ▼
PyMuPDF
 │
 ▼
Text Extraction
 │
 ▼
Section Detection
 │
 ▼
Text Chunking
 │
 ▼
nomic-embed-text
 │
 ▼
768-dimensional Embedding
 │
 ▼
ChromaDB
```

When the user asks a question:

```text
User Question
     │
     ▼
Section Detection
     │
     ▼
Question Embedding
     │
     ▼
ChromaDB Search
     │
     ▼
Relevant Chunks
     │
     ▼
Context Construction
     │
     ▼
RAG Prompt
     │
     ▼
Qwen
     │
     ▼
Answer + Sources
```

---

# 6. CURRENT RAG TESTING

The system has already been tested with questions such as:

```text
What is supervised learning?

What topics are covered in AI?

What are 1NF, 2NF and 3NF?

What is a functional dependency?

Explain normalization in DBMS.

What is logistic regression?

What is PCA?

What is quantum computing?
```

The system correctly demonstrates an important RAG property:

If information is not sufficiently available in the retrieved document context, it should respond:

```text
I could not find this information in the document.
```

This prevents the LLM from freely inventing answers.

---

# 7. CURRENT LIMITATIONS

The current system is a working RAG prototype, but it is not yet the final YantraAI architecture.

Main limitations:

### 1. Retrieval Quality

Some questions retrieve a general section instead of the exact relevant chunk.

Example:

```text
"What is PCA?"
```

may retrieve the Machine Learning section but fail to retrieve the exact PCA content.

### 2. Section Detection

Keyword-based section detection is currently being used.

This can sometimes incorrectly assign a question to a section.

### 3. Chunking

Current chunking is primarily word-based.

Better semantic/document-aware chunking will be required.

### 4. Reranking

A reranker exists in the project but needs to be properly integrated into the complete retrieval pipeline.

### 5. Single-Process Architecture

Currently the system is mainly a Python terminal application.

It needs to become:

```text
Frontend
    ↓
FastAPI
    ↓
Agent
    ↓
RAG / Models / Tools
```

### 6. No Central Multi-Device Architecture Yet

Models currently run locally on individual machines.

The team needs to expose selected services through APIs so machines can communicate remotely.

---

# 8. TARGET RAG PIPELINE

The improved RAG pipeline should become:

```text
User Question
      │
      ▼
Query Understanding
      │
      ▼
Query Rewriting
      │
      ▼
Embedding
      │
      ▼
Vector Search
      │
      ▼
Top-K Candidates
      │
      ▼
Reranking
      │
      ▼
Relevant Context
      │
      ▼
LLM
      │
      ▼
Answer + Sources
```

The important improvement is:

```text
Vector Search
      ↓
Reranker
      ↓
LLM
```

instead of directly sending the first retrieved chunks to the LLM.

---

# 9. FUTURE AGENT ARCHITECTURE

LangGraph will become the main orchestrator.

Possible flow:

```text
                    USER QUERY
                        │
                        ▼
                 QUERY ANALYZER
                        │
                        ▼
                 ROUTING DECISION
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
      RAG            TOOL USE         GENERAL LLM
       │                │                │
       ▼                ▼                ▼
 Document Search    Python/Excel      Local Model
       │            File Operations
       │                │
       └────────────────┼────────────────┘
                        ▼
                 RESPONSE GENERATOR
                        │
                        ▼
                    USER
```

---

# 10. MODEL ROUTER

Instead of using one model for everything, YantraAI should route tasks to suitable local models.

Example:

```text
General reasoning
        ↓
General LLM

Document question
        ↓
RAG + LLM

Image understanding
        ↓
Vision model

Coding / Python
        ↓
Coding model

Large complex task
        ↓
Stronger model
```

The exact models will be finalized after testing available hardware.

Priority:

```text
Accuracy
    >
Memory requirement
    >
Speed
```

For the prototype, lightweight models should be preferred if they provide acceptable quality.

---

# 11. MULTI-LAPTOP DEPLOYMENT

The team members are working from different locations.

Therefore, the system should NOT depend on all laptops being physically connected to the same LAN.

Instead:

```text
Laptop A
   │
   │ API
   ▼
Internet / Secure Network
   │
   ├──────────────► Laptop B
   │
   ├──────────────► Laptop C
   │
   └──────────────► Laptop D
```

Each laptop can run one service/model.

Example:

```text
Machine 1 → Main backend / RAG
Machine 2 → LLM service
Machine 3 → Vision model
Machine 4 → Tools / processing
```

Communication should happen through APIs.

For development/testing, tools such as a secure tunnel or VPN can be used.

The final production architecture should use proper authentication and secure networking.

---

# 12. HARDWARE STRATEGY

Current available systems include machines with approximately:

```text
Machine A:
Intel i5-1235U
16 GB RAM
Intel Iris Xe

Machine B:
Apple M1
8 GB RAM

Machine C:
Intel i5 11th Gen
8 GB RAM
NVIDIA MX350 2 GB

Machine D:
Intel Core Ultra 5 125H
24 GB RAM
Integrated Intel Graphics

Machine E:
Intel i5 8th Gen
8 GB RAM
```

Anish's machine should currently be excluded because it is not available.

The final model distribution should be decided after benchmarking:

```text
RAM usage
Model size
Inference speed
CPU/GPU utilization
Response latency
Concurrent requests
```

Do NOT download large models on every machine unnecessarily.

---

# 13. TEAM DEVELOPMENT PLAN

## Phase 1 — RAG Core

Status:

```text
MOSTLY DONE
```

Tasks:

* PDF ingestion
* Text extraction
* Chunking
* Embeddings
* ChromaDB
* Retrieval
* RAG prompting
* Conversation memory
* Source metadata

---

## Phase 2 — Improve RAG

Tasks:

* Better chunking
* Better metadata
* Query rewriting
* Hybrid retrieval if required
* Reranking
* Better relevance threshold
* Better section handling
* Retrieval evaluation

Goal:

```text
Question
   ↓
Correct chunk
   ↓
Correct answer
```

---

# 14. PHASE 3 — FASTAPI

Convert the current terminal application into an API.

Example endpoints:

```text
POST /chat
POST /upload
POST /search
POST /ingest
GET  /documents
GET  /health
```

Example:

```text
Frontend
   │
   │ POST /chat
   ▼
FastAPI
   │
   ▼
RAG / Agent
   │
   ▼
Response
```

---

# 15. PHASE 4 — LANGGRAPH

Create agent nodes such as:

```text
START
  ↓
Query Analyzer
  ↓
Router
  ├── RAG
  ├── LLM
  ├── Vision
  └── Tools
        ↓
Response Generator
        ↓
      END
```

LangGraph should control the workflow rather than putting all logic into one large Python file.

---

# 16. PHASE 5 — TOOL ENGINE

Tools will allow the agent to perform actions instead of only answering questions.

Initial tools:

```text
File Tool
Python Tool
Excel Tool
Document Tool
```

Examples:

```text
"Analyze this CSV"
        ↓
Python Tool

"Create an Excel report"
        ↓
Excel Tool

"Summarize this PDF"
        ↓
RAG

"Create a DOCX report"
        ↓
Document Tool
```

---

# 17. PHASE 6 — MULTIMODAL AI

Add support for:

```text
Images
PDFs
Tables
Charts
Scanned documents
```

Vision models can be used for image understanding and OCR-like workflows where required.

---

# 18. PHASE 7 — FRONTEND

Frontend should eventually provide:

```text
Chat interface
File upload
Document list
Source citations
Tool status
Generated files
Model information
Conversation history
```

Possible stack:

```text
React / Next.js
```

---

# 19. FINAL USER EXPERIENCE

The user should not need to know which model or tool is being used.

Example:

```text
User:
Analyze this PDF and create an Excel summary.
```

System:

```text
Frontend
   ↓
FastAPI
   ↓
LangGraph
   ↓
Document/RAG Agent
   ↓
Python/Excel Tool
   ↓
Generate XLSX
   ↓
Return file
```

Another example:

```text
User:
What does this document say about normalization?
```

Flow:

```text
Frontend
   ↓
FastAPI
   ↓
LangGraph
   ↓
RAG
   ↓
ChromaDB
   ↓
Reranker
   ↓
LLM
   ↓
Answer + Sources
```

---

# 20. FINAL OUTPUT TYPES

The system should eventually support:

```text
Question Answer
      ↓
Chat Response

Report Request
      ↓
DOCX / PDF

Data Analysis
      ↓
XLSX / CSV

Presentation Request
      ↓
PPTX

Image Understanding
      ↓
Vision Response
```

---

# 21. SECURITY PRINCIPLE

YantraAI is intended to be on-premise/local-first.

Sensitive documents should not be unnecessarily sent to external cloud AI services.

Preferred architecture:

```text
User Data
   ↓
Local / Controlled Infrastructure
   ↓
Local Models
   ↓
Local Vector Database
   ↓
Response
```

Security features to add later:

```text
Authentication
Authorization
API keys / tokens
Encrypted communication
Access control
Audit logs
Document permissions
```

---

# 22. DEVELOPMENT RULES

### Rule 1

Do not duplicate existing functionality.

Before creating a new component, check the current code.

### Rule 2

Keep components modular.

Prefer:

```text
rag/
models/
tools/
api/
agent/
frontend/
```

instead of one huge Python file.

### Rule 3

Every service should have a clear input/output contract.

### Rule 4

Test every major component independently before integration.

### Rule 5

Do not change the embedding model randomly.

If the embedding model changes, the ChromaDB collection must be recreated/re-embedded because embedding dimensions must match.

Current configuration:

```text
nomic-embed-text
768 dimensions
```

### Rule 6

Use Git branches for separate features.

Example:

```text
main
 ├── rag-improvement
 ├── fastapi
 ├── langgraph
 ├── frontend
 └── tools
```

---

# 23. IMMEDIATE PRIORITY

The goal right now is NOT to build every feature.

First create a stable working prototype.

Priority order:

```text
1. Fix and stabilize RAG
        ↓
2. Improve retrieval + reranking
        ↓
3. Create FastAPI backend
        ↓
4. Add LangGraph
        ↓
5. Connect local model services
        ↓
6. Add tools
        ↓
7. Build frontend
        ↓
8. Add file generation
        ↓
9. Final integration
        ↓
10. Demo + testing
```

---

# 24. CURRENT POSITION

```text
PDF Ingestion          ✅
Text Extraction        ✅
Chunking               ✅
Embeddings             ✅
ChromaDB               ✅
Semantic Search        ✅
Section Detection      ✅
RAG Prompt             ✅
Qwen LLM               ✅
Conversation Memory    ✅
Source Metadata        ✅

Reranking              🟡
Better Retrieval       🟡
FastAPI                ⬜
LangGraph              ⬜
Model Router           ⬜
Remote Model APIs      ⬜
Tool Engine            ⬜
Vision                 ⬜
Frontend               ⬜
DOCX/XLSX/PPTX         ⬜
Authentication         ⬜
Final Integration      ⬜
```

Legend:

```text
✅ Completed
🟡 Needs improvement
⬜ Not implemented yet
```

---

# 25. FINAL TARGET

The final YantraAI should work like this:

```text
                         USER
                           │
                           ▼
                       FRONTEND
                           │
                           ▼
                        FASTAPI
                           │
                           ▼
                      LANGGRAPH
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
             RAG        MODEL ROUTER   TOOLS
              │            │            │
           ChromaDB      Local LLMs   Python
           Reranker      Vision        Excel
           Documents     Models        Files
              │            │            │
              └────────────┼────────────┘
                           ▼
                    RESPONSE GENERATOR
                           │
                           ▼
                         USER
```

The main objective is:

> **Build a modular, local-first, agentic AI system where the user interacts with one interface while YantraAI automatically decides whether to use RAG, an LLM, a vision model, or a tool.**

---

# 26. ONE-LINE PROJECT STATUS

```text
YantraAI currently has a functional local RAG foundation.
The next major step is converting this foundation into a
FastAPI + LangGraph based multi-model agent architecture.
```
