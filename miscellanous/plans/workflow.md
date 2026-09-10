# YantraAI — Project Workflow & Development Plan

## 1. Project Overview

YantraAI is a secure, local-first AI workbench designed to process confidential documents and provide intelligent assistance without unnecessarily sending sensitive data to external cloud AI services.

The final system will combine:

- Local LLMs
- RAG (Retrieval-Augmented Generation)
- Conversation memory
- Agentic workflows
- Multimodal AI
- Document processing
- Python / data-analysis tools
- Excel tools
- File generation
- Multiple specialized AI models
- A unified user interface

The main objective is:

> Build a modular, local-first, agentic AI system where the user interacts with one interface while YantraAI automatically decides whether to use RAG, an LLM, a vision model, or a tool.

---

# 2. Current Project Status

YantraAI currently has a **functional local RAG foundation**.

The following components are already implemented and tested:

- PDF ingestion
- PDF text extraction
- Page-wise processing
- Section detection
- Text chunking
- Local embeddings
- ChromaDB vector storage
- Semantic retrieval
- Distance-based filtering
- Basic section-aware retrieval
- RAG prompt construction
- Local Qwen LLM generation
- Conversation memory
- Follow-up question handling
- Source metadata
- Source display
- Basic hallucination prevention

The current system is still a **RAG prototype** and has not yet been converted into the final FastAPI + LangGraph architecture.

---

# 3. Current Implemented Architecture

The currently working architecture is:

```text
                    USER
                      │
                      ▼
              Interactive RAG
                      │
                      ▼
              Query Processing
                      │
                      ▼
             Section Detection
                      │
                      ▼
            Query Embedding
                      │
                      ▼
                ChromaDB
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
                Qwen LLM
                      │
                      ▼
              Answer + Sources

This architecture is currently implemented as a Python-based local application.

4. Document Processing
4.1 PDF Ingestion

Status:

✅ Completed

PDF documents can be placed inside:

documents/

The system automatically processes available PDF documents.

4.2 Text Extraction

Status:

✅ Completed

PyMuPDF is currently used for PDF text extraction.

The extraction process works page-by-page.

Basic flow:

PDF
 │
 ▼
PyMuPDF
 │
 ▼
Page-wise Text
4.3 Section Detection

Status:

✅ Implemented
🟡 Needs improvement

The system currently attempts to identify document sections using section/header information and keyword-based logic.

This allows retrieval to consider the likely relevant section when processing a question.

Current limitation:

Keyword-based section detection
        ↓
May sometimes select an incorrect section

Future improvement:

Better heading detection
Document structure awareness
Semantic section matching
Improved query-to-section mapping
5. Text Chunking

Status:

✅ Implemented
🟡 Needs improvement

Large document text is divided into smaller chunks before embedding.

Current chunking is primarily word/text based.

Current flow:

Large Document Text
        │
        ▼
Chunking
        │
        ▼
Smaller Text Chunks
        │
        ▼
Embedding

Future improvements:

Better chunk size
Chunk overlap optimization
Semantic chunking
Document-aware chunking
Section-aware chunking
Better handling of tables and structured content
6. Embedding System

Status:

✅ Completed

Current embedding model:

nomic-embed-text

The embedding model runs locally through Ollama.

Current embedding dimension:

768

The embedding process is:

Document Chunk
      │
      ▼
nomic-embed-text
      │
      ▼
768-dimensional Vector

The same embedding model is currently used for query embedding.

7. Vector Database

Status:

✅ Completed

Current vector database:

ChromaDB

Current collection:

yantra_documents

The vector database stores document chunks together with metadata.

Current metadata includes:

filename
page
section
chunk

Basic architecture:

Text Chunk
    │
    ▼
Embedding
    │
    ▼
ChromaDB
    │
    ├── Vector
    └── Metadata
8. Current Retrieval System

Status:

✅ Functional
🟡 Needs optimization

Current retrieval flow:

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
Retrieved Candidates
      │
      ▼
Distance Filtering
      │
      ▼
Relevant Chunks
      │
      ▼
Context Construction

The system uses semantic similarity to retrieve relevant document chunks.

A distance/relevance threshold is also used to prevent obviously irrelevant chunks from being passed to the LLM.

9. Current RAG Generation

Status:

✅ Completed

After retrieval, the relevant chunks are inserted into the RAG prompt.

Current flow:

User Question
      │
      ▼
Retrieved Context
      │
      ▼
RAG Prompt
      │
      ▼
Qwen3:1.7b
      │
      ▼
Answer

Current generation model:

qwen3:1.7b

The LLM is instructed to answer using the retrieved document context.

10. Conversation Memory

Status:

✅ Completed

YantraAI currently maintains recent conversation context.

Stored information includes:

User Question
Assistant Answer

This allows follow-up questions.

Example:

User:
What algorithms are included?

Assistant:
The document includes supervised and unsupervised algorithms...

User:
What about the unsupervised ones?

Assistant:
...

The previous conversation can help resolve references and incomplete follow-up questions.

Conversation memory is considered an important part of the final YantraAI architecture and should be retained during future RAG and agent development.

11. Source Information

Status:

✅ Completed

The RAG response currently provides source-related information such as:

Source
Page
Section
Chunk
Distance

This provides basic traceability between the generated answer and the original document.

Future frontend implementation should convert this into a cleaner source/citation interface.

12. Hallucination Control

Status:

✅ Basic implementation completed

YantraAI is designed to avoid freely generating information when the required information is not present in the retrieved document context.

For example:

User:
What is quantum computing?

If the relevant information is not sufficiently available in the indexed document, the system should respond with something similar to:

I could not find this information in the document.

This establishes an important RAG principle:

Insufficient Evidence
        ↓
Do Not Freely Invent
        ↓
Return "Not Found in Document"

Future improvements will make this grounding mechanism more reliable.

13. Current RAG Testing

The current RAG system has been tested with questions including:

What is supervised learning?

What topics are covered in AI?

What are 1NF, 2NF and 3NF?

What is a functional dependency?

Explain normalization in DBMS.

What is logistic regression?

What is PCA?

What is quantum computing?

Testing has been used to verify:

Retrieval quality
Document grounding
Section detection
Answer generation
Source information
Follow-up questions
Out-of-context questions
14. Current RAG Limitations

Although the RAG system is functional, several improvements are still required.

14.1 Retrieval Quality

Status:

🟡 Needs improvement

Some questions retrieve a broad/general section instead of the exact relevant chunk.

Example:

Question:
What is PCA?

Possible problem:

Machine Learning Section
        ↓
Retrieved
        ↓
Exact PCA explanation
        ↓
Not always retrieved

The goal is:

Question
   ↓
Exact relevant chunk
   ↓
Correct context
   ↓
Correct answer
14.2 Section Detection

Status:

🟡 Needs improvement

Current section detection is partly keyword-based.

This can cause incorrect section selection for ambiguous questions.

Future improvements:

Semantic section matching
Better heading extraction
Section embeddings
Query-section relevance scoring
14.3 Chunking

Status:

🟡 Needs improvement

Current chunking works but is not yet optimized for all document structures.

Future improvements:

Semantic chunking
Section-aware chunking
Better overlap
Table-aware processing
Document-specific chunking strategies
14.4 Reranking

Status:

🟡 Partially implemented

A reranker component exists in the project but is not yet fully integrated into the complete retrieval pipeline.

Target:

Vector Search
      │
      ▼
Top-K Candidates
      │
      ▼
Reranker
      │
      ▼
Top Relevant Chunks
      │
      ▼
LLM
15. Improved Target RAG Pipeline

The next version of the RAG pipeline should become:

User Question
      │
      ▼
Query Understanding
      │
      ▼
Conversation Context
      │
      ▼
Query Rewriting
      │
      ▼
Query Embedding
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
Relevance Filtering
      │
      ▼
Relevant Context
      │
      ▼
RAG Prompt
      │
      ▼
Local LLM
      │
      ▼
Answer + Sources

The major improvement is:

Vector Search
      ↓
Reranker
      ↓
Relevant Context
      ↓
LLM

instead of directly sending the first retrieved chunks to the LLM.

16. Query Understanding & Rewriting

Status:

⬜ Future implementation

Before retrieval, YantraAI should understand what the user is asking.

Target flow:

User Query
    │
    ▼
Query Understanding
    │
    ▼
Conversation Context
    │
    ▼
Query Rewriting
    │
    ▼
Search Query

This becomes particularly important for follow-up questions.

Example:

User:
What algorithms are discussed?

User:
Which of them are unsupervised?

The second question can be transformed internally into something more explicit such as:

Which algorithms discussed in the current document are unsupervised?

The original conversation should still remain available to the system.

17. Hybrid Retrieval

Status:

⬜ Optional future improvement

If semantic retrieval alone is not sufficient, YantraAI can introduce hybrid retrieval.

Possible architecture:

                User Query
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
   Semantic Search       Keyword Search
          │                   │
          └─────────┬─────────┘
                    ▼
              Combined Results
                    │
                    ▼
                Reranker
                    │
                    ▼
             Relevant Context

Hybrid retrieval should only be added if evaluation shows that it improves retrieval quality.

18. Retrieval Evaluation

Status:

⬜ Future implementation

Retrieval should eventually be evaluated using a fixed test set.

Evaluation should measure:

Question
   ↓
Retrieved Chunks
   ↓
Was the correct chunk retrieved?

Important metrics can include:

Top-K retrieval accuracy
Recall
Precision
Reranker improvement
Relevance score
Answer grounding
Hallucination rate
Response latency

The purpose is to make RAG improvements measurable instead of relying only on manual testing.

19. Current Project Structure

Current project structure:

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

This is the current prototype structure.

As the project grows, the codebase should gradually be modularized.

20. Target Project Structure

The target architecture should move toward:

YantraAI/

│
├── app/
│   │
│   ├── api/
│   │   ├── routes/
│   │   └── dependencies/
│   │
│   ├── rag/
│   │   ├── ingestion/
│   │   ├── retrieval/
│   │   ├── reranking/
│   │   ├── prompting/
│   │   └── memory/
│   │
│   ├── models/
│   │   ├── llm/
│   │   ├── embeddings/
│   │   └── vision/
│   │
│   ├── agent/
│   │   ├── graph/
│   │   ├── nodes/
│   │   └── router/
│   │
│   ├── tools/
│   │   ├── python/
│   │   ├── excel/
│   │   ├── files/
│   │   └── documents/
│   │
│   └── core/
│       ├── config/
│       ├── logging/
│       └── security/
│
├── documents/
├── chroma_db/
├── generated/
│
├── tests/
│
├── README.md
├── workflow.md
└── requirements.txt

The structure should be introduced gradually rather than rewriting the entire project at once.

21. FastAPI Backend

Status:

⬜ Not implemented

The current terminal-based application will eventually be converted into a FastAPI backend.

Target architecture:

Frontend
    │
    │ HTTP Request
    ▼
FastAPI
    │
    ▼
Agent / RAG
    │
    ▼
Response

Potential endpoints:

POST /chat

POST /upload

POST /search

POST /ingest

GET /documents

GET /health

FastAPI should become the central interface between the frontend and backend services.

22. LangGraph Agent Architecture

Status:

⬜ Not implemented

LangGraph will eventually become the workflow/orchestration layer.

Target:

START
  │
  ▼
Query Analyzer
  │
  ▼
Router
  │
  ├──────────► RAG
  │
  ├──────────► General LLM
  │
  ├──────────► Vision
  │
  └──────────► Tools
                  │
                  ▼
          Response Generator
                  │
                  ▼
                 END

The purpose of LangGraph is to control the workflow instead of placing all decision-making logic inside one large Python file.

23. Agent Routing

Status:

⬜ Future implementation

YantraAI should eventually determine which capability is required for a user request.

Example:

User Query
    │
    ▼
Query Analyzer
    │
    ▼
Routing Decision

Possible routes:

Document Question
        ↓
       RAG

General Question
        ↓
   General LLM

Image Question
        ↓
   Vision Model

Data Analysis
        ↓
   Python Tool

Excel Request
        ↓
   Excel Tool

File Operation
        ↓
    File Tool
24. Model Router

Status:

⬜ Future implementation

YantraAI should not use one model for every task.

The future model router will select an appropriate local model based on the task.

Example:

General Reasoning
        ↓
General LLM

Document Question
        ↓
RAG + LLM

Image Understanding
        ↓
Vision Model

Coding / Python
        ↓
Coding Model

Complex Reasoning
        ↓
Stronger Local Model

Model selection will depend on:

Accuracy
Memory Requirement
Inference Speed
Latency
Hardware Availability

Priority:

Accuracy
   >
Memory Requirement
   >
Speed

Lightweight models should be preferred when they provide acceptable quality.

25. Local Model Strategy

Status:

🟡 Current Qwen implementation completed
⬜ Multi-model architecture pending

The current generation model is:

qwen3:1.7b

The current embedding model is:

nomic-embed-text

Both are being used locally.

Future models should be added only after benchmarking.

Do not install large models unnecessarily.

Model selection should be based on actual hardware performance rather than model size alone.

26. Tool Engine

Status:

⬜ Future implementation

The future tool engine will allow YantraAI to perform actions instead of only generating text.

Initial tools:

File Tool
Python Tool
Excel Tool
Document Tool

Example:

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
27. Python / Data Analysis Tool

Status:

⬜ Future implementation

The Python tool will allow the agent to perform controlled data-analysis tasks.

Potential capabilities:

CSV analysis
Data cleaning
EDA
Statistics
Calculations
Charts
Data transformations

Example:

User
  ↓
"Analyze this CSV"
  ↓
LangGraph
  ↓
Python Tool
  ↓
Analysis
  ↓
Response

Execution should be isolated and controlled for security.

28. Excel Tool

Status:

⬜ Future implementation

The Excel tool will allow YantraAI to work with spreadsheet files.

Potential capabilities:

Read XLSX
Create XLSX
Modify XLSX
Data analysis
Pivot-style summaries
Charts
Formatting
Reports

Example:

User
  ↓
"Create an Excel summary from this data"
  ↓
Agent
  ↓
Python / Excel Tool
  ↓
XLSX
29. File & Document Tools

Status:

⬜ Future implementation

Potential document operations:

Read files
Create files
Modify files
Summarize documents
Generate reports
Convert structured results into documents

Future output formats:

DOCX
PDF
XLSX
CSV
PPTX
30. Multimodal AI

Status:

⬜ Future implementation

YantraAI should eventually support:

Images
PDFs
Tables
Charts
Scanned Documents

A vision model can be introduced for:

Image Understanding
Document Image Analysis
Chart Understanding
Scanned Document Processing
OCR-like Workflows

The vision pipeline will remain separate from the normal text-only RAG pipeline where appropriate.

31. Frontend

Status:

⬜ Future implementation

Possible frontend stack:

React / Next.js

The frontend should eventually provide:

Chat Interface

File Upload

Document List

Source Citations

Conversation History

Tool Status

Generated Files

Model Information

Loading / Processing Status

The user should not need to understand the internal model architecture.

32. Final User Experience

Example 1:

User:

What does this document say about normalization?

Target flow:

Frontend
   ↓
FastAPI
   ↓
LangGraph
   ↓
RAG
   ↓
Query Processing
   ↓
ChromaDB
   ↓
Reranker
   ↓
Relevant Context
   ↓
Local LLM
   ↓
Answer + Sources
   ↓
User

Example 2:

User:

Analyze this CSV and create an Excel summary.

Target flow:

Frontend
   ↓
FastAPI
   ↓
LangGraph
   ↓
Query Analyzer
   ↓
Tool Router
   ↓
Python / Excel Tool
   ↓
Generate XLSX
   ↓
Return File
   ↓
User

Example 3:

User:

Explain this image.

Target flow:

Frontend
   ↓
FastAPI
   ↓
LangGraph
   ↓
Vision Route
   ↓
Vision Model
   ↓
Response
   ↓
User
33. Final Architecture

The final YantraAI architecture should become:

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
              │            │            │
              ▼            ▼            ▼
             RAG      MODEL ROUTER    TOOLS
              │            │            │
              │            │            ├── Python
              │            │            ├── Excel
              │            │            ├── Files
              │            │            └── Documents
              │            │
              │            ├── Local LLM
              │            └── Vision Model
              │
              ├── ChromaDB
              ├── Reranker
              ├── Documents
              └── Conversation Memory
                           │
                           ▼
                  RESPONSE GENERATOR
                           │
                           ▼
                         USER
34. Local / Distributed Architecture

YantraAI is intended to remain local-first.

The architecture should support running different services on different machines when required.

Conceptually:

                Secure Network
                     │
       ┌─────────────┼─────────────┐
       │             │             │
       ▼             ▼             ▼
   RAG Service    LLM Service   Vision Service
       │             │             │
       └─────────────┼─────────────┘
                     │
                     ▼
                 Main API

Machines do not need to be physically connected to the same LAN in the final architecture.

Communication should happen through authenticated APIs over a secure network.

For development/testing, secure tunneling or VPN-based connectivity may be used.

The exact distributed architecture will be finalized after the local prototype is stable.

35. Hardware Benchmarking Strategy

Before distributing models across machines, benchmark actual hardware performance.

Important measurements:

RAM Usage

Model Size

Inference Speed

CPU Utilization

GPU Utilization

Response Latency

Concurrent Requests

System Stability

Model deployment should be based on benchmarking rather than simply assigning the largest available model to the most powerful machine.

Large models should not be downloaded on every machine unnecessarily.

36. Security Architecture

YantraAI follows a local-first security principle.

Preferred flow:

User Data
    ↓
Controlled Infrastructure
    ↓
Local Processing
    ↓
Local Models
    ↓
Local Vector Database
    ↓
Response

Sensitive documents should not unnecessarily leave the controlled environment.

Future security features:

Authentication

Authorization

API Keys / Tokens

Encrypted Communication

Access Control

Audit Logs

Document Permissions

Service Authentication

Security will become increasingly important once multiple services communicate through APIs.

37. Development Phases
Phase 1 — RAG Foundation

Status:

✅ Mostly Completed

Completed:

PDF ingestion
Text extraction
Page-wise processing
Section detection
Chunking
Embeddings
ChromaDB
Semantic search
Distance filtering
RAG prompting
Qwen generation
Conversation memory
Source metadata
Basic hallucination control
Phase 2 — RAG Improvement

Status:

🟡 Current Priority

Tasks:

Better chunking
Better section detection
Query rewriting
Conversation-aware retrieval
Reranking integration
Better relevance threshold
Improved metadata
Hybrid retrieval if required
Retrieval evaluation
Answer grounding evaluation

Goal:

Question
   ↓
Correct Retrieval
   ↓
Correct Context
   ↓
Correct Answer
Phase 3 — FastAPI Backend

Status:

⬜ Pending

Tasks:

Create FastAPI application
Create /chat endpoint
Create /upload endpoint
Create /search endpoint
Create /ingest endpoint
Create /documents endpoint
Create /health endpoint
Connect existing RAG pipeline

Goal:

Frontend
   ↓
FastAPI
   ↓
Existing RAG
   ↓
Response
Phase 4 — LangGraph

Status:

⬜ Pending

Tasks:

Create graph
Create query analyzer
Create routing node
Create RAG node
Create LLM node
Create tool nodes
Create response generation node
Integrate conversation memory

Goal:

User Query
    ↓
Analyzer
    ↓
Router
    ↓
Required Capability
    ↓
Response
Phase 5 — Model Routing

Status:

⬜ Pending

Tasks:

Benchmark available models
Select general LLM
Select coding model
Select vision model
Create model service interface
Create routing logic
Implement fallback logic
Phase 6 — Remote Local Model Services

Status:

⬜ Pending

Tasks:

Expose selected model services through APIs
Implement service authentication
Implement secure communication
Add health checks
Add timeout handling
Add fallback handling
Benchmark network latency
Phase 7 — Tool Engine

Status:

⬜ Pending

Tasks:

File Tool
Python Tool
Excel Tool
Document Tool
Tool validation
Tool execution control
Tool result handling
Phase 8 — Multimodal AI

Status:

⬜ Pending

Tasks:

Vision model
Image understanding
Scanned document processing
Chart understanding
Table understanding
Multimodal document workflows
Phase 9 — Frontend

Status:

⬜ Pending

Tasks:

Chat UI
File upload
Document management
Conversation history
Source display
Tool status
Model status
Generated file display
Phase 10 — File Generation

Status:

⬜ Pending

Target outputs:

DOCX
PDF
XLSX
CSV
PPTX
Phase 11 — Security & Production Hardening

Status:

⬜ Pending

Tasks:

Authentication
Authorization
API security
Encrypted communication
Access control
Audit logging
Document permissions
Service monitoring
Error handling
Phase 12 — Final Integration & Demo

Status:

⬜ Pending

Tasks:

Integrate all services
End-to-end testing
Performance testing
RAG evaluation
Agent evaluation
Tool testing
Security testing
UI testing
Error handling
Demo preparation
Documentation
38. Immediate Development Priority

The current priority should remain:

1. Stabilize Current RAG
          ↓
2. Improve Retrieval
          ↓
3. Integrate Reranker
          ↓
4. Add Query Rewriting
          ↓
5. Evaluate Retrieval
          ↓
6. Create FastAPI Backend
          ↓
7. Add LangGraph
          ↓
8. Add Model Routing
          ↓
9. Add Tool Engine
          ↓
10. Add Multimodal Support
          ↓
11. Build Frontend
          ↓
12. Add File Generation
          ↓
13. Security Hardening
          ↓
14. Final Integration
          ↓
15. Demo + Testing

The immediate goal is not to implement every feature simultaneously.

The priority is to build a stable foundation and add each layer incrementally.

39. Development Rules
Rule 1 — Do Not Duplicate Existing Functionality

Before creating a new component, inspect the current implementation.

Reuse existing functionality wherever possible.

Rule 2 — Keep Components Modular

Avoid one extremely large Python file.

Target separation:

rag/
models/
tools/
api/
agent/
frontend/
tests/
Rule 3 — Clear Input / Output Contracts

Every service should have a clearly defined input and output.

Example:

Retriever

Input:
Query

Output:
Retrieved Chunks + Metadata
Reranker

Input:
Query + Candidates

Output:
Ranked Candidates
LLM

Input:
Prompt + Context

Output:
Generated Response
Rule 4 — Test Components Independently

Every major component should be tested before integration.

Examples:

Embedding Test
Retrieval Test
Reranker Test
LLM Test
Memory Test
API Test
Tool Test
Rule 5 — Protect the Embedding Configuration

Current embedding model:

nomic-embed-text

Current dimension:

768

Do not change the embedding model randomly.

If the embedding model changes, existing vectors should be re-embedded and the relevant ChromaDB collection should be recreated or migrated appropriately.

Rule 6 — Preserve Conversation Memory

Conversation memory is an important requirement of YantraAI.

Future RAG and agent architecture must continue supporting context-aware follow-up questions.

Rule 7 — Benchmark Before Model Deployment

Do not select models only based on parameter count.

Benchmark:

Accuracy
RAM
Latency
Inference Speed
CPU/GPU Usage
Concurrent Requests
Rule 8 — Build Incrementally

Do not rewrite the entire project when adding a new feature.

Preferred approach:

Existing Working System
        ↓
Small Improvement
        ↓
Test
        ↓
Integrate
        ↓
Next Improvement
40. Current Position
PDF Ingestion             ✅
Text Extraction           ✅
Page-wise Processing      ✅
Chunking                  ✅
Embeddings                ✅
ChromaDB                  ✅
Semantic Search            ✅
Distance Filtering         ✅
Section Detection          ✅
RAG Prompt                 ✅
Qwen LLM                   ✅
Conversation Memory        ✅
Follow-up Questions        ✅
Source Metadata            ✅
Basic Hallucination Control ✅

Better Chunking            🟡
Better Retrieval           🟡
Better Section Detection   🟡
Reranking Integration      🟡
Query Rewriting            ⬜
Hybrid Retrieval           ⬜
Retrieval Evaluation       ⬜

FastAPI                    ⬜
LangGraph                  ⬜
Model Router               ⬜
Remote Model APIs          ⬜
Tool Engine                ⬜
Python Tool                ⬜
Excel Tool                 ⬜
File Tool                  ⬜
Document Tool              ⬜
Vision                     ⬜
Frontend                   ⬜
DOCX/PDF/XLSX/PPTX         ⬜
Authentication             ⬜
Authorization              ⬜
Audit Logging              ⬜
Final Integration          ⬜

Legend:

✅ Completed
🟡 Implemented / Needs Improvement
⬜ Not Implemented Yet
41. Final Target Workflow

The final user workflow should be:

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
                           ▼
                    QUERY ANALYZER
                           │
                           ▼
                         ROUTER
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
         RAG          MODEL ROUTER        TOOLS
          │                │                │
          │                │          ┌─────┼─────┐
          │                │          │     │     │
          ▼                ▼          ▼     ▼     ▼
      ChromaDB         Local LLM    Python Excel Files
          │             Vision              │
      Reranker          Models              │
          │                                 │
          └────────────────┬────────────────┘
                           │
                           ▼
                  RESPONSE GENERATOR
                           │
                           ▼
                         USER
42. Final Objective

YantraAI should eventually behave like a single intelligent AI workbench.

The user should simply provide a request:

Ask a question
Upload a document
Analyze data
Analyze an image
Create a report
Create an Excel file
Generate a presentation

YantraAI should automatically determine:

What does the user need?
        ↓
Which information is required?
        ↓
Which model should be used?
        ↓
Is RAG required?
        ↓
Is a tool required?
        ↓
Is a vision model required?
        ↓
What output should be generated?

The user should not need to manually select the model, RAG pipeline, or tool.

43. One-Line Project Status
YantraAI currently has a functional local RAG foundation with
PDF ingestion, embeddings, ChromaDB retrieval, Qwen generation,
conversation memory, source metadata, and basic grounding.

The immediate next step is to improve retrieval quality and
reranking, followed by converting the system into a FastAPI +
LangGraph based modular agent architecture.