# Santinal Sovereign Backend Integration & Interface Design Specification

This document details the exact REST APIs and WebSocket communication protocols required to connect the Santinal React frontend to a compliant production backend.

---

## 1. Connection Architecture

* **REST API URL:** `http://<host>:<port>/api`
* **WebSocket URL:** `ws://<host>:<port>/ws?session_token=<token>` (or `wss://` on TLS)
* **Tab Multiplexing:** Clients open exactly **one WebSocket connection per browser tab**. A single socket carries every conversation; messages are routed internally by their `session_id` payload field.

---

## 2. Universal WebSocket Envelope

Every message sent or received via the WebSocket connection MUST use this envelope format:

```json
{
  "type": "string - discriminator matching event types below",
  "session_id": "string - the conversation/task session identifier",
  "seq": 0, // monotonically increasing integer per session_id for packet ordering
  "timestamp": "2026-08-31T00:15:32.100Z", // ISO 8601 string
  "payload": { } // event-specific payload object
}
```

---

## 3. WebSocket: Client → Server Events

### 3.1 `user_message` (Initiating a Chat Turn)
Sent when the user submits a prompt.
```json
{
  "type": "user_message",
  "session_id": "conv_1042",
  "payload": {
    "conversation_id": "conv_1042",
    "project_id": "proj-coding", // optional
    "run_mode": "agent", // "normal" (plain chat) | "agent" (agent planner loop) | "tool" (isolated tool run)
    "tool_id": null, // required only when run_mode is "tool"
    "prompt": "Run security audit on code.py",
    "model_mode": "auto", // "auto" (routing orchestrator) | "manual" (user-selected model)
    "requested_model_id": "model-coding-qwen", // null if model_mode is auto
    "active_tools": ["tool-file-read", "tool-code-execution"], // list of allowed tools
    "attachments": [
      { "id": "att-1", "name": "code.py", "size": 1048, "type": "text/x-python" }
    ],
    "temperature": 0.2,
    "top_p": 0.95,
    "max_tokens": 4096
  }
}
```

### 3.2 `session_control` (Turn Interruption or State Actions)
Used to cancel, resume, or branch execution paths.
```json
{
  "type": "session_control",
  "session_id": "conv_1042",
  "payload": {
    "action": "cancel" // "cancel" | "resume" | "regenerate" | "branch",
    "since_seq": 12, // required only for "resume"
    "message_id": "msg-123" // required only for "regenerate"/"branch"
  }
}
```

### 3.3 `approval_action` (User Feedback on Artifacts)
Sent when the user approves or rejects deliverables.
```json
{
  "type": "approval_action",
  "session_id": "conv_1042",
  "payload": {
    "artifact_id": "art-inspection-memo",
    "action": "approve", // "approve" | "request_changes" | "reject"
    "comment": "Approved for download.",
    "approved_by": "Engineer Alex Mercer"
  }
}
```

### 3.4 Custom Registry Upserts (`tool_upsert` / `model_upsert` / `kb_source_upsert`)
Allows the client to add or modify server registry configs.
```json
{
  "type": "tool_upsert",
  "payload": {
    "tool": {
      "id": "custom-torque-calc",
      "name": "torque_calc",
      "displayName": "Torque Calculator",
      "description": "Computes specs from material + diameter",
      "category": "custom",
      "isEnabled": true,
      "parametersSchema": "{}"
    }
  }
}
```

---

## 4. WebSocket: Server → Client Events

### 4.1 `heartbeat` (Lightweight Status)
Sent to indicate live processing status.
```json
{ "type": "heartbeat", "session_id": "conv_1042", "payload": { "text": "Analyzing query..." } }
```

### 4.2 `model_route` (Routing Decision)
Sent when the orchestrator assigns a model to the request.
```json
{
  "type": "model_route",
  "session_id": "conv_1042",
  "payload": {
    "model_id": "model-coding-qwen",
    "category": "coding",
    "reason": "Python calculations detected.",
    "vram_gb": 34.0,
    "load_status": "loaded"
  }
}
```

### 4.3 `plan` / `plan_update` (Agent Phased Plan)
Sets and updates the checklist for autonomous agent execution.
```json
{
  "type": "plan",
  "session_id": "conv_1042",
  "payload": {
    "steps": [
      { "id": "p1", "phase": "planning", "title": "Analyze parameters", "status": "running" },
      { "id": "p2", "phase": "evaluation", "title": "Verify wall thickness", "status": "pending" }
    ]
  }
}
```
`plan_update` is sent when a step changes status:
```json
{ "type": "plan_update", "session_id": "conv_1042", "payload": { "id": "p1", "status": "completed" } }
```

### 4.4 `tool_step` / `tool_step_update` (Sandbox Tool Execution)
Emitted during tool invocations inside the sandbox.
```json
{
  "type": "tool_step",
  "session_id": "conv_1042",
  "payload": {
    "plan_step_id": "p2",
    "tool_call": {
      "toolId": "tool-code-execution",
      "toolName": "code_execution",
      "inputParams": { "code": "print('running')" },
      "outputResult": null,
      "durationMs": 0,
      "status": "running"
    }
  }
}
```
Update when completed:
```json
{
  "type": "tool_step_update",
  "session_id": "conv_1042",
  "payload": {
    "plan_step_id": "p2",
    "tool_call": {
      "toolId": "tool-code-execution",
      "toolName": "code_execution",
      "inputParams": { "code": "print('running')" },
      "outputResult": { "stdout": "running\n", "exit_code": 0 },
      "durationMs": 850,
      "status": "success"
    }
  }
}
```

### 4.5 `citation` (Information Grounding)
Sent to ground answers using local PDF/SOP pages.
```json
{
  "type": "citation",
  "session_id": "conv_1042",
  "payload": {
    "marker": 1,
    "source_name": "ASME Section VIII pressure Guidelines",
    "location": "Page 14, Clause UG-99",
    "snippet_preview": "Wall thickness tolerances mapped.",
    "kb_source": true
  }
}
```

### 4.6 `artifact` (Deliverable Memo)
Adds a generated report directly to the Workbench files.
```json
{
  "type": "artifact",
  "session_id": "conv_1042",
  "payload": {
    "id": "art-inspection-memo",
    "title": "ASME_Inspection_Memo_Draft.docx",
    "type": "file",
    "fileType": "word",
    "sizeBytes": 152000,
    "link": "http://localhost:8080/api/files/art-inspection-memo",
    "previewLink": "http://localhost:8080/api/files/art-inspection-memo/preview",
    "citedSources": [1],
    "requiresApproval": true
  }
}
```

### 4.7 `message_chunk` (Streaming Token Chunks)
Appends text characters sequentially to the active assistant chat block.
```json
{
  "type": "message_chunk",
  "session_id": "conv_1042",
  "payload": {
    "content": "Analyzing pressure boundaries..."
  }
}
```

### 4.8 `final` (Turn Resolution close out)
Completes the query, terminates streaming state, and logs usage stats.
```json
{
  "type": "final",
  "session_id": "conv_1042",
  "payload": {
    "message_id": "msg-final-1",
    "content": "All structural and pressure constraints verified successfully. Refer to the draft memo in Workbench files.",
    "citations": [1],
    "artifact_ids": ["art-inspection-memo"],
    "tokens_used": 680,
    "tokens_per_sec": 48.5,
    "total_duration_ms": 7500
  }
}
```

### 4.9 Global Background Emitters (No active `session_id`)
* **`telemetry` (every 4s):**
  ```json
  {
    "type": "telemetry",
    "session_id": null,
    "payload": {
      "gpu_util_pct": 52,
      "vram_used_gb": 38,
      "vram_total_gb": 80,
      "vram_by_model": [
        { "model_id": "model-reasoning-qwen", "gb": 24 },
        { "model_id": "model-coding-qwen", "gb": 12 }
      ]
    }
  }
  ```
* **`network_audit` (every 5s):**
  ```json
  {
    "type": "network_audit",
    "session_id": null,
    "payload": {
      "event": "heartbeat_ok", // "attempt" | "heartbeat_ok"
      "verdict": "allowed", // "allowed" | "blocked" | "enforced"
      "process": null,
      "destination": null,
      "count_since_start": 42
    }
  }
  ```

---

## 5. REST API Specifications

### 5.1 `/api/conversations` (Sidebar Chat Storage)
* **`GET /api/conversations`**
  * **Response:** Array of `Conversation` objects:
    ```json
    [
      {
        "id": "conv_1",
        "title": "Inspection Audit",
        "createdAt": 1756540800000,
        "updatedAt": 1756540800000,
        "mode": "agent",
        "modelId": "model-reasoning-qwen",
        "messages": []
      }
    ]
    ```
* **`GET /api/conversations/:id`**
  * **Response:** Array of `Message` items.
* **`POST /api/conversations`**
  * **Request:** Array of `Conversation` (full backup) or a single `Conversation` mapping.
  * **Response:** Saved array of `Conversation`.
* **`PATCH /api/conversations/:id`**
  * **Request:** `{ "title": "New Title" }` or other metadata modifications.
* **`DELETE /api/conversations/:id`**
  * **Response:** `{ "status": "deleted" }`

### 5.2 `/api/projects` (Workspaces Manager)
* **`GET /api/projects`**
  * **Response:** Array of `Project` objects.
* **`POST /api/projects`**
  * **Request:** `{ "name": "New Project", "description": "Docs", "color": "#333", "icon": "folder", "systemPrompt": "System directives" }`

### 5.3 `/api/models` (Model Catalog)
* **`GET /api/models`**
  * **Response:** Array of `Model` entries.
* **`POST /api/models`**
  * **Request:** `{ "name": "LLM Model", "category": "reasoning", "vramGB": 16 }`
  * **Response:** Created `Model` with `loadStatus: "loading"` (to transition to `"loaded"`).

### 5.4 `/api/tools` (Sandbox Tools Registry)
* **`GET /api/tools`**
  * **Response:** Array of `ToolDefinition` entries.
* **`POST /api/tools`**
  * **Request:** `ToolDefinition` (payload containingdisplayName, parametersSchema, description, category).

### 5.5 `/api/kb/sources` (Vector Database Sources)
* **`GET /api/kb/sources`**
  * **Response:** Array of `KnowledgeSource` entries.
* **`POST /api/kb/sources`**
  * **Request:** `{ "name": "Guideline PDF", "category": "Manuals", "localPath": "/path" }`
  * **Response:** Created `KnowledgeSource` with `syncStatus: "indexing"`.

### 5.6 `/api/settings` (App Preferences)
* **`GET /api/settings`**
  * **Response:** AppSettings JSON matching `types.ts` specification.
* **`PATCH /api/settings`**
  * **Request:** Merges parameters into current backend settings.

### 5.7 `/api/upload` (Document Uploads)
* **`POST /api/upload`** (Multi-part File upload)
  * **Response:** `{ "file_id": "f_1234", "name": "original_filename.pdf" }`

### 5.8 `/api/files/:id` & `/api/files/:id/preview` (Deliverable downloads & visual panel render)
* **`GET /api/files/:id`**
  * **Response:** File buffer download.
* **`GET /api/files/:id/preview`**
  * **Response:** Raw HTML structure preview:
    ```html
    <div class="p-4">
      <p>ASME wall thickness calculations hold status: PASS</p>
    </div>
    ```
