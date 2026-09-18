# YantraAI — SIH 2026 PPT Content & Structure

> **Purpose:** Complete 6-slide content plan for the YantraAI Smart India Hackathon 2026 presentation.
>
> **Presentation Rules:** Maximum 6 slides including title, concise points only, no long paragraphs, use diagrams/infographics where useful, clearly highlight innovation and uniqueness.

---

## Slide 1 — Title Slide

### Title
**YANTRA AI**

### Tagline
**Local-First Distributed AI Platform**

### Details
- **Smart India Hackathon 2026**
- **Problem Statement ID:** `[PS ID]`
- **Team ID:** `[TEAM ID]`
- **Team Name:** `[TEAM NAME]`
- **Institute:** `[COLLEGE / UNIVERSITY]`

### Visual
- Optional simple background showing multiple computers/nodes connected through an AI network.
- **Do not use a technical architecture diagram on this slide.**

### Structure

```text
                 YANTRA AI
       Local-First Distributed AI Platform

              [AI Network Visual]

          Smart India Hackathon 2026
       PS ID | Team ID | Team Name
              Institute
```

---

# Slide 2 — Proposed Solution

## Detailed Explanation

- Connects multiple computers into a **distributed AI network**.
- Intelligently assigns tasks to **suitable nodes and AI models**.
- Uses **RAG** to retrieve relevant local knowledge before generation.
- Selects AI models based on **task complexity and available resources**.

## How It Addresses the Problem

- Reduces dependence on **cloud AI and continuous internet**.
- Utilizes **existing computers** instead of requiring one high-end machine.
- Prevents resource overload through **resource-aware routing**.
- Provides **fallback** when a node becomes unavailable.

## Innovation & Uniqueness

- Combines **Local AI + Distributed Computing + RAG + Intelligent Routing**.
- Enables **multiple resource-limited systems to collaboratively run AI**.
- **Resource-aware and fault-tolerant** architecture.
- **Privacy-focused** local processing.
- **Admin-controlled** roles and data access.

## Architecture Diagram

```text
                    USER QUERY
                        |
                        v
              +-------------------+
              |  YantraAI Gateway |
              +---------+---------+
                        |
                        v
              +-------------------+
              | Query + Resource  |
              | Analysis / Router |
              +---------+---------+
                        |
             +----------+----------+
             |          |          |
             v          v          v
         RAG Node    Light AI   Powerful AI
             |          Node        Node
             +----------+----------+
                        |
                        v
              Context + Reasoning
                        |
                        v
                 FINAL RESPONSE
```

### Key Message

**Local AI + Distributed Computing + RAG + Intelligent Routing**

---

# Slide 3 — Technical Approach

## Technologies to Be Used

### Programming
- Python
- JavaScript

### Backend & Orchestration
- FastAPI
- LangGraph

### AI / RAG
- Qwen3
- Ollama
- ChromaDB
- Nomic Embeddings
- BGE Reranker

### Networking
- Tailscale / Local Network

### Hardware
- Multiple heterogeneous computers acting as AI nodes

## Methodology & Implementation Flow

```text
                         USER
                          |
                          v
                     USER QUERY
                          |
                          v
                +-------------------+
                | API Gateway /     |
                | Master Node       |
                +---------+---------+
                          |
                          v
                +-------------------+
                | Query Analysis +  |
                | Resource Check    |
                +---------+---------+
                          |
                          v
                +-------------------+
                | Intelligent       |
                | Model/Node Router |
                +---------+---------+
                          |
                    +-----+-----+
                    |           |
                    v           v
                RAG Node      AI Node
                    |           |
                    v           v
             Relevant Context  Model
                    |         Reasoning
                    +-----+-----+
                          |
                          v
                 RESPONSE GENERATION
                          |
                          v
                         USER
```

## Core Technical Principles

- **Resource-Aware Routing**
- **Local-First Processing**
- **Fault Tolerance**
- **Admin-Controlled Access**
- **Modular Node Architecture**

---

# Slide 4 — Feasibility and Viability

## Feasibility of the Idea

- Uses **open-source AI models and frameworks**.
- Works across computers with **different hardware capabilities**.
- Modular architecture supports **incremental deployment**.
- Can operate over **local network / Tailscale**.
- Uses existing computing infrastructure.

## Potential Challenges & Risks

- Limited **RAM / CPU / GPU** on some nodes.
- Network or node failures.
- Large models may cause **high resource usage and latency**.
- Distributed systems require proper **access control and coordination**.

## Strategies for Overcoming Challenges

- **Resource-aware model routing**
- **Automatic fallback**
- **Lightweight / quantized models**
- **Node health monitoring**
- **Admin-controlled roles and restricted access**

## Challenge → Mitigation

```text
Low Resources     → Lightweight / Quantized Models

Node Failure       → Automatic Fallback

High Latency       → Local Routing + Efficient Inference

Access Risks       → Admin-Controlled Roles

Resource Overload  → Resource-Aware Scheduling
```

## Viability Statement

**YantraAI can scale by adding available computing nodes instead of depending on a single powerful machine.**

---

# Slide 5 — Impact and Benefits

## Potential Impact on Target Audience

### Target Audience
- Students
- Educational Institutions
- Organizations
- Resource-constrained environments

### Impact
- Access AI using **existing computing resources**.
- Supports AI applications in **low-connectivity environments**.
- Enables **collaborative computing**.
- Provides controlled access to **organizational knowledge through RAG**.

## Benefits

### Social
- Wider access to AI.
- Supports resource-constrained environments.
- Enables collaborative AI usage.

### Economic
- Reduces cloud dependency.
- Reduces requirement for dedicated high-end hardware.
- Utilizes existing infrastructure.

### Environmental
- Better utilization of existing hardware.
- Avoids unnecessary computation.
- Resource-aware processing can reduce wasted compute.

### Privacy & Security
- Supports local processing of sensitive data.
- Controlled document access.
- Admin-managed permissions.

## Impact Visual

```text
                         YANTRA AI
                             |
          +------------------+------------------+
          |                  |                  |
          v                  v                  v
       SOCIAL            ECONOMIC         ENVIRONMENTAL
          |                  |                  |
     Access to AI       Lower Cost       Efficient Use
     Collaboration      Existing HW      of Resources
          |
          +------------------+
                   |
                   v
          PRIVACY & SECURITY
                   |
             Local Processing
             Controlled Access
```

---

# Slide 6 — Research and References

## Research Papers

### 1. Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
- Lewis et al., 2020
- **arXiv:** `2005.11401`
- Relevance: Foundation for the RAG component of YantraAI.

### 2. Distributed / Edge-Assisted Collaborative LLM Deployment
- Select a final peer-reviewed/research reference that directly supports the distributed/edge AI architecture used in YantraAI.
- Relevance: Supports distributed model execution and collaborative AI infrastructure.

## Technology References

| Technology | Purpose |
|---|---|
| **LangGraph** | AI workflow orchestration |
| **ChromaDB** | Vector database and RAG retrieval |
| **Ollama** | Local LLM deployment and inference |
| **FastAPI** | Backend API framework |
| **Nomic Embeddings** | Document embeddings |
| **BGE Reranker** | Retrieval reranking |

## Research Focus

**Distributed AI • Local LLMs • RAG • Resource-Aware Computing • Fault-Tolerant AI**

## Reference Links

- RAG Paper: https://arxiv.org/abs/2005.11401
- LangGraph: https://langchain-ai.github.io/langgraph/
- ChromaDB: https://docs.trychroma.com/
- Ollama: https://docs.ollama.com/
- FastAPI: https://fastapi.tiangolo.com/

---

# Final 6-Slide Overview

| Slide | Title | Main Content | Visual |
|---|---|---|---|
| **1** | YantraAI | Title, tagline, team details | Optional background |
| **2** | Proposed Solution | Explanation, problem addressing, innovation | **Architecture Diagram** |
| **3** | Technical Approach | Technologies, methodology, implementation | **Workflow Diagram** |
| **4** | Feasibility & Viability | Feasibility, risks, mitigation | Challenge → Solution |
| **5** | Impact & Benefits | Target audience, social/economic/environmental/privacy benefits | **Impact Infographic** |
| **6** | Research & References | Papers, technologies, research focus | No major diagram |

---

# Presentation Story

The complete PPT should communicate YantraAI in this order:

**Problem → Proposed Solution → How It Works → Feasibility → Impact → Research**

## Important Presentation Rules

1. Keep the presentation to **6 slides maximum**, including the title slide.
2. Use **concise bullet points**, not paragraphs.
3. Prefer **diagrams and infographics** over excessive text.
4. Make YantraAI's **innovation and uniqueness** clearly visible.
5. Keep each slide focused only on its **specified SIH template topic**.
6. Do not overload slides with implementation-level details that are unnecessary for evaluation.
