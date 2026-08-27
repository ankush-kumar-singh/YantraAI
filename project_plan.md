Hardware & Deployment Strategy

YantraAI is being developed across a small multi-machine environment.

Current setup:

Team Members: 6
Usable Laptops: 5

Available systems approximately:

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

One additional machine is currently unavailable and is therefore excluded from the deployment plan.

Deployment Principle

The system should not require every component to run on every laptop.

Instead, depending on hardware capabilities, services can eventually be distributed across available machines:

Machine
   │
   ├── RAG
   ├── LLM
   ├── Vision
   └── Tools

The exact service distribution will be decided after benchmarking.

Benchmarking Criteria

Before distributing models and services, each machine should be evaluated using:

RAM Usage
Model Size
Inference Speed
CPU Utilization
GPU Utilization
Response Latency
Concurrent Requests

Large models should not be installed unnecessarily on every machine.

Multi-Machine Architecture

The final system should support communication between different machines through APIs.

                    YantraAI
                       │
                 ┌─────┴─────┐
                 │   API     │
                 └─────┬─────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    Machine A      Machine B      Machine C
        │              │              │
      RAG/          Model/         Vision/
     Backend        Service        Service
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
                  Final Response

For development and testing, secure networking or tunneling can be used.

For production, communication should use:

HTTPS / TLS
Authentication
Authorization
API Keys / Tokens
Network Restrictions
Development Architecture

YantraAI development will focus on building the system module-by-module, rather than implementing everything simultaneously.

RAG
 │
 ▼
FastAPI
 │
 ▼
LangGraph
 │
 ├── RAG
 ├── LLM
 ├── Vision
 └── Tools
 │
 ▼
Frontend
 │
 ▼
Final Integration

Each component should have a clear interface so that it can later be connected to other components or moved to another machine.

Current Project Progress
PDF Ingestion             ✅
Text Extraction           ✅
Chunking                  ✅
Embeddings                ✅
ChromaDB                  ✅
Semantic Search            ✅
Section Detection          ✅
RAG Prompt                 ✅
Qwen LLM                   ✅
Conversation Memory        ✅
Contextual Queries         ✅
Source Metadata            ✅
Distance Filtering         ✅

Reranking                  🟡
Better Retrieval            🟡
Query Rewriting             🟡
Hybrid Search               ⬜
Retrieval Evaluation        ⬜

FastAPI                     ⬜
LangGraph                   ⬜
Model Router                ⬜
Remote Model APIs           ⬜
Tool Engine                 ⬜
Vision                      ⬜
Frontend                    ⬜
File Generation             ⬜
Authentication              ⬜
Final Integration           ⬜
Immediate Development Roadmap
1. Stabilize Current RAG
        ↓
2. Improve Retrieval
        ↓
3. Integrate Reranking
        ↓
4. Add Query Rewriting
        ↓
5. Build FastAPI Backend
        ↓
6. Add LangGraph
        ↓
7. Add Model Routing
        ↓
8. Add Tool Engine
        ↓
9. Add Multi-Machine APIs
        ↓
10. Add Vision / Multimodal AI
        ↓
11. Build Frontend
        ↓
12. Add File Generation
        ↓
13. Add Security
        ↓
14. Final Integration
        ↓
15. Testing & Demo