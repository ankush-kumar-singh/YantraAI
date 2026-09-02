# YantraAI — Amardeep MacBook Setup

## Role

Amardeep's MacBook will run the **Qwen3 1.7B** reasoning model.

The RAG system runs on Ankush's PC.

### Architecture

Amardeep MacBook

- Tailscale IP: `100.90.30.71`
- Ollama
- Qwen3 1.7B
- `generator_rem.py`

  |
  | Tailscale
  v

Ankush PC

- Tailscale IP: `100.87.210.43`
- RAG Server
- Retrieval
- ChromaDB
- Reranker
- Embeddings

Flow:

User Query
    ↓
Amardeep
    ↓
generator_rem.py
    ↓
Ankush RAG Server
    ↓
Retrieval + Reranker
    ↓
Relevant Context
    ↓
Qwen3 1.7B
    ↓
Final Answer

# Step 1 — Connect Tailscale

Open Tailscale on the MacBook and make sure it is **Connected**.

Then:

```bash
tailscale status
```

Test Ankush:

```bash
tailscale ping 100.87.210.43
```

The ping must succeed before continuing.

# Step 2 — Check Python

```bash
python3 --version
```

# Step 3 — Go to YantraAI

If the project is in Downloads:

```bash
cd ~/Downloads/YantraAI
cd "rag pipeline"
```

Check files:

```bash
ls
```

# Step 4 — Install Dependencies

```bash
pip3 install requests ollama
```

If the project has a requirements file:

```bash
pip3 install -r ../requirements.txt
```

# Step 5 — Check Ollama

```bash
ollama --version
```

```bash
ollama list
```

# Step 6 — Download Qwen3 1.7B

```bash
ollama pull qwen3:1.7b
```

Verify:

```bash
ollama list
```

You should see:

```text
qwen3:1.7b
```

# Step 7 — Test Qwen3 1.7B

```bash
ollama run qwen3:1.7b
```

Test:

```text
What is data?
```

Exit:

```text
/bye
```

# Step 8 — Test Ankush's RAG Server

Ankush must be running `rag_server.py`.

RAG Server:

```text
http://100.87.210.43:8000
```

From Amardeep:

```bash
curl http://100.87.210.43:8000/health
```

Expected:

```json
{
  "status": "ok",
  "service": "YantraAI Distributed RAG",
  "node": "Ankush",
  "version": "2.0"
}
```

# Step 9 — Configure generator_rem.py

Inside the `rag pipeline` folder, use `generator_rem.py`.

For Amardeep, these values must be:

```python
RAG_SERVER_URL = "http://100.87.210.43:8000"

REASONING_MODEL = "qwen3:1.7b"

REQUEST_TIMEOUT = 120
```

Do not use:

```python
REASONING_MODEL = "qwen3:8b"
```

That is for Riya.

Keep:

```python
REASONING_MODEL = "qwen3:1.7b"
```

# Step 10 — Run YantraAI

From the `rag pipeline` folder:

```bash
python3 generator_rem.py
```

Expected:

```text
YantraAI Remote Mode

RAG Server      : http://100.87.210.43:8000
Reasoning Model : qwen3:1.7b

Checking RAG connection...
RAG Status: CONNECTED
```

# Step 11 — Select User Role

When prompted:

```text
Enter user role (admin/technical/onsite):
```

For testing:

```text
technical
```

# Step 12 — Test RAG

Ask a question that exists in the documents.

Example:

```text
What is normalization?
```

Expected stages:

```text
[1/3] Searching RAG...
[2/3] Context received.
[3/3] Qwen3 1.7B reasoning...
```

Then the final answer and sources should be displayed.

# Step 13 — Exit

Use:

```text
exit
```

or:

```text
quit
```

# Troubleshooting

## RAG Status: NOT CONNECTED

Check:

```bash
tailscale status
```

Then:

```bash
tailscale ping 100.87.210.43
```

Then:

```bash
curl http://100.87.210.43:8000/health
```

Also confirm Ankush is running:

```text
python rag_server.py
```

## Qwen3 1.7B Not Found

```bash
ollama list
```

If missing:

```bash
ollama pull qwen3:1.7b
```

## Python Module Error

```bash
pip3 install requests ollama
```

# Important Rules

1. Amardeep does **not** run the RAG server.
2. Amardeep does **not** need Ankush's ChromaDB.
3. Amardeep does **not** need the embedding model.
4. Amardeep does **not** need the reranker.
5. Amardeep runs Qwen3 1.7B and `generator_rem.py`.
6. Ankush's RAG server must be running during remote testing.
7. Tailscale must be connected.
8. Keep `generator.py` unchanged.
9. Use `generator_rem.py` for the distributed/remote setup.
10. Do not change Ankush's RAG server IP.

# Final Configuration

Amardeep:

```text
Tailscale IP : 100.90.30.71
Model        : qwen3:1.7b
Generator    : generator_rem.py
```

Ankush:

```text
Tailscale IP : 100.87.210.43
Service      : Distributed RAG Server
Port         : 8000
```

Remote RAG URL:

```text
http://100.87.210.43:8000
```
