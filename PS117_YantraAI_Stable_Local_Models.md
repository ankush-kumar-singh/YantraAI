# PS 117 — YantraAI Local Model Setup

## Goal

Every working team laptop should be able to run the complete PS 117 prototype **individually**, without depending on another machine.

The priority is:

- Stable operation
- Smooth inference
- Minimum RAM pressure
- No unnecessary large models
- Local/offline capability
- Coverage of PS 117 requirements
- One model loaded at a time where possible

---

# 1. Recommended Model Stack

PS 117 does **not** require a large number of foundation models.

Use four core model categories:

1. General / Reasoning LLM
2. Coding LLM
3. Vision / Multimodal LLM
4. Embedding model for RAG

Other capabilities such as OCR, sandbox execution, Word/Excel/PPT generation and document processing should be handled by software tools rather than additional foundation models.

---

# 2. Ankush — 16 GB RAM

### Hardware
- CPU: Intel Core i5-1235U
- RAM: 16 GB
- GPU: Intel Iris Xe integrated graphics

### Recommended models

| Purpose | Model |
|---|---|
| General / Reasoning | **Qwen3 8B** |
| Coding | **Qwen2.5-Coder 7B** |
| Vision | **Qwen3-VL 4B** |
| Embeddings | **nomic-embed-text** |

### Recommended role
Primary RAG/Core AI development machine.

### Important
Do not run all three foundation models simultaneously.

Use the model router to load/use the required model for the current task.

---

# 3. Riya — 24 GB RAM

### Hardware
- CPU: Intel Core Ultra 5 125H
- RAM: 24 GB
- GPU: Intel integrated graphics

### Smooth/default models

| Purpose | Model |
|---|---|
| General / Reasoning | **Qwen3 8B** |
| Coding | **Qwen2.5-Coder 7B** |
| Vision | **Qwen3-VL 4B** |
| Embeddings | **nomic-embed-text** |

### Optional quality/benchmark models

| Purpose | Optional model |
|---|---|
| General | Qwen3 14B |
| Coding | Qwen2.5-Coder 14B |
| Vision | Qwen3-VL 8B |

### Recommendation
Keep the 8B / 7B / 4B stack as the **production/demo default**.

Use 14B / 8B-VL only for benchmarking or higher-quality testing. The goal is smooth operation, not maximum model size.

---

# 4. AmarDeep — 8 GB Apple M1

### Hardware
- Apple M1
- RAM: 8 GB

### Recommended models

| Purpose | Model |
|---|---|
| General / Reasoning | **Qwen3 4B** |
| Coding | **Qwen2.5-Coder 3B** |
| Vision | **Qwen3-VL 2B** |
| Embeddings | **nomic-embed-text** |

### Recommended role
FastAPI/backend and integration development.

This lightweight stack is preferred to avoid excessive memory pressure on an 8 GB machine.

---

# 5. Sakshi — 8 GB + MX350

### Hardware
- Intel Core i5-1135G7
- RAM: 8 GB
- GPU: NVIDIA MX350, 2 GB VRAM

### Recommended models

| Purpose | Model |
|---|---|
| General / Reasoning | **Qwen3 4B** |
| Coding | **Qwen2.5-Coder 3B** |
| Vision | **Qwen3-VL 2B** |
| Embeddings | **nomic-embed-text** |

### Important
The MX350 has only 2 GB VRAM, so do not design the system around large 7B/8B models on this machine.

The 4B / 3B / 2B stack is the safer choice for stability.

---

# 6. Sumit — 8 GB

### Hardware
- 8 GB RAM
- 11th Gen Intel i5

### Recommended models

| Purpose | Model |
|---|---|
| General / Reasoning | **Qwen3 4B** |
| Coding | **Qwen2.5-Coder 3B** |
| Vision | **Qwen3-VL 2B** |
| Embeddings | **nomic-embed-text** |

### Recommended role
Tools + QA/testing.

The lightweight models are sufficient for testing the complete local pipeline.

---

# 7. Anish — Laptop Currently Damaged

Do not install local models until the laptop is repaired.

After repair, select the model sizes based on the actual CPU/RAM/GPU specifications.

Until then, Anish can work on:

- LangGraph architecture
- Agent workflow
- Model-router logic
- Prompt design
- Test cases
- Documentation
- Research
- GitHub issues
- Integration planning

---

# 8. Model Size Strategy

## 8 GB Machines

Use:

```text
General  → Qwen3 4B
Coding   → Qwen2.5-Coder 3B
Vision   → Qwen3-VL 2B
RAG      → nomic-embed-text
```

## 16 GB Machine

Use:

```text
General  → Qwen3 8B
Coding   → Qwen2.5-Coder 7B
Vision   → Qwen3-VL 4B
RAG      → nomic-embed-text
```

## 24 GB Machine

Default:

```text
General  → Qwen3 8B
Coding   → Qwen2.5-Coder 7B
Vision   → Qwen3-VL 4B
RAG      → nomic-embed-text
```

Optional benchmark mode:

```text
General  → Qwen3 14B
Coding   → Qwen2.5-Coder 14B
Vision   → Qwen3-VL 8B
```

---

# 9. Do NOT Run All Models Together

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
+
Browser
```

especially on 8 GB machines.

Instead:

```text
                    YantraAI
                       |
                 Model Router
                       |
          +------------+------------+
          |            |            |
       General       Coding       Vision
       Qwen3         Coder        Qwen-VL
          |            |            |
          +------------+------------+
                       |
                    Response
```

Only the model required for the current task should be active whenever possible.

---

# 10. RAG / Embedding Model

Keep the same embedding model across all machines:

**nomic-embed-text**

Current YantraAI RAG uses a 768-dimensional embedding space.

Do not randomly change the embedding model in the production collection because changing it requires re-embedding the existing vectors.

Recommended:

```text
Document
   ↓
Parser / OCR
   ↓
nomic-embed-text
   ↓
ChromaDB
   ↓
Retriever
   ↓
Reranker
   ↓
Qwen3
   ↓
Answer
```

---

# 11. Vision / Multimodal Pipeline

PS 117 requires support for scanned PDFs, images, handwritten content and engineering-style visual information.

Recommended pipeline:

```text
Scanned PDF / Image
        ↓
      OCR
        ↓
Image + Extracted Text
        ↓
   Vision Model
        ↓
      Qwen3
        ↓
       RAG
        ↓
Answer / Deliverable
```

For OCR, use an offline document/OCR library such as PaddleOCR or Docling rather than adding another large foundation model.

---

# 12. Coding Pipeline

PS 117 requires code generation and execution/verification.

Use:

```text
User Request
     ↓
Coding Model
     ↓
Generated Code
     ↓
Sandbox
     ↓
Execute
     ↓
Test Result
     ↓
Fix / Retry
     ↓
Final Answer
```

The coding model is not enough by itself; the sandbox is required for safe verification.

---

# 13. Document Generation

Do not install separate AI models for Word, Excel or PowerPoint.

Use normal Python libraries:

```text
Word  → python-docx
Excel → openpyxl
PPT   → python-pptx
PDF   → reportlab
```

The LLM generates the content/structure and the Python tool creates the actual file.

---

# 14. Final Recommended Deployment

| Member | RAM | General | Coding | Vision | Embedding |
|---|---:|---|---|---|---|
| **Ankush** | 16 GB | Qwen3 8B | Coder 7B | VL 4B | nomic |
| **Riya** | 24 GB | Qwen3 8B | Coder 7B | VL 4B | nomic |
| **AmarDeep** | 8 GB | Qwen3 4B | Coder 3B | VL 2B | nomic |
| **Sakshi** | 8 GB | Qwen3 4B | Coder 3B | VL 2B | nomic |
| **Sumit** | 8 GB | Qwen3 4B | Coder 3B | VL 2B | nomic |
| **Anish** | Damaged | Decide after repair | Decide after repair | Decide after repair | nomic |

---

# 15. Bottom Line

### 8 GB
**Qwen3 4B + Coder 3B + VL 2B + nomic-embed-text**

### 16 GB
**Qwen3 8B + Coder 7B + VL 4B + nomic-embed-text**

### 24 GB
**Qwen3 8B + Coder 7B + VL 4B + nomic-embed-text**

with **14B / 8B-VL only as optional benchmark models**.

The goal is:

> **Every working laptop should independently demonstrate the PS 117 pipeline without relying on another team's machine, while keeping model sizes appropriate to its RAM and avoiding simultaneous loading of unnecessary models.**
