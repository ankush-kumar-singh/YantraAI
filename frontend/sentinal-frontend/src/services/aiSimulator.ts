import { ChatMode, Message, AgentStep, ToolCallExecution, AgentArtifact, ToolDefinition, Model } from '../types';

export interface GenerateOptions {
  prompt: string;
  mode: ChatMode;
  model: Model;
  activeTools: ToolDefinition[];
  conversationHistory: Message[];
  systemPrompt?: string;
  onUpdate: (partialMessage: Partial<Message>) => void;
  signal?: AbortSignal;
}

export async function executeAiResponse(options: GenerateOptions): Promise<void> {
  const { prompt, mode, model, activeTools, onUpdate, signal } = options;

  if (mode === 'agent') {
    await runAgentLoop(prompt, model, activeTools, onUpdate, signal);
  } else {
    await runNormalChat(prompt, model, onUpdate, signal);
  }
}

// ==========================================
// 1. NORMAL CHAT STREAMING SIMULATOR
// ==========================================
async function runNormalChat(
  prompt: string,
  model: Model,
  onUpdate: (partialMessage: Partial<Message>) => void,
  signal?: AbortSignal
): Promise<void> {
  const startTime = Date.now();
  const responseText = generateNormalResponseText(prompt, model);
  
  let currentContent = '';
  const tokens = responseText.split(/(?<=\s|[\n.,;:!?])/);
  let totalTokens = 0;

  for (let i = 0; i < tokens.length; i++) {
    if (signal?.aborted) return;
    
    currentContent += tokens[i];
    totalTokens++;
    const elapsedSec = Math.max((Date.now() - startTime) / 1000, 0.1);
    const tokensPerSec = Math.round((totalTokens / elapsedSec) * 10) / 10;

    onUpdate({
      content: currentContent,
      isStreaming: i < tokens.length - 1,
      tokensUsed: totalTokens + Math.floor(prompt.length / 4),
      tokensPerSec,
    });

    // Realistic token streaming delay (15-28ms)
    await sleep(20 + Math.floor(Math.random() * 15));
  }

  onUpdate({
    content: responseText,
    isStreaming: false,
  });
}

// ==========================================
// 2. MULTI-PHASE AGENT EXECUTION LOOP
// ==========================================
async function runAgentLoop(
  prompt: string,
  model: Model,
  activeTools: ToolDefinition[],
  onUpdate: (partialMessage: Partial<Message>) => void,
  signal?: AbortSignal
): Promise<void> {
  const startTime = Date.now();
  const stepsPlan = createDynamicAgentPlan(prompt, activeTools);
  
  const steps: AgentStep[] = stepsPlan.map((s, idx) => ({
    ...s,
    status: idx === 0 ? 'running' : 'pending',
  }));

  // Initial Agent Run state
  onUpdate({
    content: '',
    isStreaming: true,
    agentRun: {
      currentPhase: 'planning',
      steps: [...steps],
      progressPercent: 10,
      totalDurationMs: 0,
      isFinished: false,
      thoughtSummary: `Agent initialized with ${model.name}. Analyzing task parameters and scheduling tools...`,
    },
  });

  await sleep(600);

  // Phase 1: Planning
  if (signal?.aborted) return;
  steps[0].status = 'running';
  steps[0].logs.push(`Decomposing query: "${prompt.slice(0, 75)}${prompt.length > 75 ? '...' : ''}"`);
  steps[0].logs.push(`Identified core objectives and tool availability: [${activeTools.map(t => t.displayName).join(', ')}]`);
  onUpdate({
    agentRun: {
      currentPhase: 'planning',
      steps: [...steps],
      progressPercent: 25,
      totalDurationMs: Date.now() - startTime,
      isFinished: false,
      thoughtSummary: 'Task plan formulated. Transitioning to Environmental & Tool Evaluation.',
    }
  });
  await sleep(750);
  steps[0].status = 'completed';
  steps[0].durationMs = Date.now() - startTime;

  // Phase 2: Evaluation
  if (signal?.aborted) return;
  steps[1].status = 'running';
  steps[1].logs.push('Evaluating execution prerequisites and runtime constraints...');
  onUpdate({
    agentRun: {
      currentPhase: 'evaluation',
      steps: [...steps],
      progressPercent: 50,
      totalDurationMs: Date.now() - startTime,
      isFinished: false,
      thoughtSummary: 'Inspecting dependencies, verifying data structures, and performing pre-flight sandbox runs.',
    }
  });

  await sleep(850);
  if (steps[1].toolCalls && steps[1].toolCalls.length > 0) {
    for (const tool of steps[1].toolCalls) {
      tool.status = 'running';
      onUpdate({ agentRun: { currentPhase: 'evaluation', steps: [...steps], progressPercent: 55, totalDurationMs: Date.now() - startTime, isFinished: false } });
      await sleep(500);
      tool.status = 'success';
      steps[1].logs.push(`Tool execution result received from [${tool.toolName}].`);
    }
  }
  steps[1].status = 'completed';
  steps[1].durationMs = 950;

  // Phase 3: Building / Execution
  if (signal?.aborted) return;
  steps[2].status = 'running';
  steps[2].logs.push('Generating code modules and applying strict type annotations...');
  onUpdate({
    agentRun: {
      currentPhase: 'building',
      steps: [...steps],
      progressPercent: 75,
      totalDurationMs: Date.now() - startTime,
      isFinished: false,
      thoughtSummary: 'Building production-ready solution, running AST linting pass, and verifying output.',
    }
  });

  await sleep(1000);
  if (steps[2].toolCalls && steps[2].toolCalls.length > 0) {
    for (const tool of steps[2].toolCalls) {
      tool.status = 'running';
      onUpdate({ agentRun: { currentPhase: 'building', steps: [...steps], progressPercent: 82, totalDurationMs: Date.now() - startTime, isFinished: false } });
      await sleep(600);
      tool.status = 'success';
    }
  }
  steps[2].status = 'completed';
  steps[2].durationMs = 1400;

  // Phase 4: Output Synthesis & Final Stream
  if (signal?.aborted) return;
  steps[3].status = 'running';
  steps[3].logs.push('Synthesizing comprehensive response and compiling documentation.');
  onUpdate({
    agentRun: {
      currentPhase: 'output',
      steps: [...steps],
      progressPercent: 95,
      totalDurationMs: Date.now() - startTime,
      isFinished: false,
      thoughtSummary: 'All agent phases successfully executed. Rendering final artifacts and instructions.',
    }
  });

  await sleep(400);
  steps[3].status = 'completed';
  steps[3].durationMs = 600;

  const finalOutputMarkdown = generateAgentFinalMarkdown(prompt, model, steps);

  // Stream the final output markdown
  let currentOutput = '';
  const tokens = finalOutputMarkdown.split(/(?<=\s|[\n.,;:!?])/);
  for (let i = 0; i < tokens.length; i++) {
    if (signal?.aborted) return;
    currentOutput += tokens[i];
    
    onUpdate({
      content: currentOutput,
      isStreaming: i < tokens.length - 1,
      tokensUsed: 1200 + tokens.length,
      tokensPerSec: 62.8,
      agentRun: {
        currentPhase: 'output',
        steps: [...steps],
        progressPercent: 100,
        totalDurationMs: Date.now() - startTime,
        isFinished: i === tokens.length - 1,
        thoughtSummary: 'Completed multi-phase autonomous execution successfully.',
      }
    });

    if (i % 2 === 0) {
      await sleep(14);
    }
  }
}

// Helpers
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createDynamicAgentPlan(prompt: string, activeTools: ToolDefinition[]): AgentStep[] {
  const isCodeQuery = /code|react|hook|typescript|python|bug|function|api|algorithm|database|cache/i.test(prompt);
  const isResearchQuery = /research|paper|explain|compare|evaluate|physics|history|benchmark/i.test(prompt);

  const pythonTool = activeTools.find(t => t.name === 'python_sandbox');
  const webTool = activeTools.find(t => t.name === 'web_search_grounding');
  const linterTool = activeTools.find(t => t.name === 'code_linter_verifier');
  const fileTool = activeTools.find(t => t.name === 'file_reader_writer');

  return [
    {
      id: 'step-1-plan',
      phase: 'planning',
      title: 'Phase 1: Task Planning & Strategy',
      description: 'Decomposed the query into sequential sub-tasks, identified invariants, and allocated compute budgets.',
      status: 'pending',
      logs: [],
    },
    {
      id: 'step-2-eval',
      phase: 'evaluation',
      title: 'Phase 2: Environment & Knowledge Evaluation',
      description: 'Evaluated algorithmic constraints, inspected reference dependencies, and executed sandbox validation.',
      status: 'pending',
      logs: [],
      toolCalls: webTool ? [
        {
          toolId: webTool.id,
          toolName: webTool.name,
          inputParams: { query: prompt.slice(0, 50), maxResults: 3 },
          outputResult: `Grounding sources verified: 3 authoritative references indexed.`,
          durationMs: 310,
          status: 'pending'
        }
      ] : undefined
    },
    {
      id: 'step-3-build',
      phase: 'building',
      title: 'Phase 3: Execution & Artifact Building',
      description: 'Engineered code artifacts, performed AST validation, and generated test assertions.',
      status: 'pending',
      logs: [],
      toolCalls: isCodeQuery && linterTool ? [
        {
          toolId: linterTool.id,
          toolName: linterTool.name,
          inputParams: { language: 'typescript', code: 'export function solution() { ... }' },
          outputResult: 'AST Type check: 0 errors. High cohesion score (98/100).',
          durationMs: 190,
          status: 'pending'
        }
      ] : pythonTool ? [
        {
          toolId: pythonTool.id,
          toolName: pythonTool.name,
          inputParams: { code: 'print("Running verification suite...")' },
          outputResult: 'All 12 unit assertion checks passed in 0.04s.',
          durationMs: 220,
          status: 'pending'
        }
      ] : undefined,
      artifacts: isCodeQuery ? [
        {
          id: 'art-gen-1',
          title: 'solution_artifact.ts',
          type: 'code',
          language: 'typescript',
          content: `// Generated and verified by Local Agent Engine\nexport function optimizedProcess<T>(items: T[]): T[] {\n  return items.filter(Boolean);\n}`
        }
      ] : undefined
    },
    {
      id: 'step-4-out',
      phase: 'output',
      title: 'Phase 4: Synthesis & Output Verification',
      description: 'Compiled final deliverable with step-by-step reasoning, complete code listings, and deployment guidelines.',
      status: 'pending',
      logs: [],
    }
  ];
}

function generateNormalResponseText(prompt: string, model: Model): string {
  const p = prompt.toLowerCase();

  if (p.includes('react') || p.includes('hook') || p.includes('frontend')) {
    return `### Modern React Architecture

Here is a recommended approach tailored to your question about **${prompt.trim()}**:

\`\`\`tsx
import React, { useState, useTransition, useId } from 'react';

interface ComponentProps {
  initialValue?: string;
  onCommit?: (val: string) => void;
}

export const ModernComponent: React.FC<ComponentProps> = ({ 
  initialValue = '', 
  onCommit 
}) => {
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const inputId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setValue(nextVal);
    startTransition(() => {
      onCommit?.(nextVal);
    });
  };

  return (
    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 space-y-3">
      <label htmlFor={inputId} className="text-sm font-semibold text-zinc-300">
        Interactive Input
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={handleChange}
        className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
        placeholder="Type here..."
      />
      {isPending && <p className="text-xs text-rose-400 animate-pulse">Syncing state...</p>}
    </div>
  );
};
\`\`\`

#### Key Highlights:
1. **useTransition**: Prevents UI blocking during expensive state updates.
2. **useId**: Guarantees accessible HTML ID pairing between label and input.
3. **Clean Tailwind Tokens**: High-contrast, accessibility-tested color palette.`;
  }

  if (p.includes('python') || p.includes('data') || p.includes('script')) {
    return `### Python Solution

Here is a clean, typed Python 3.11 implementation for your query:

\`\`\`python
from dataclasses import dataclass
from typing import List, Optional
import time

@dataclass(slots=True, frozen=True)
class DataRecord:
    id: str
    value: float
    timestamp: float = time.time()

class StreamProcessor:
    def __init__(self, threshold: float = 0.5) -> None:
        self.threshold = threshold
        self._history: List[DataRecord] = []

    def process(self, record: DataRecord) -> Optional[DataRecord]:
        if record.value >= self.threshold:
            self._history.append(record)
            return record
        return None

# Example usage
processor = StreamProcessor(threshold=0.75)
item = processor.process(DataRecord(id="sensor_01", value=0.92))
print(f"Processed: {item}")
\`\`\`

- **Memory Efficient**: Uses \`slots=True\` for reduced memory overhead.
- **Strict Typing**: Standard Python \`typing\` with explicit return signatures.`;
  }

  return `### Response from ${model.name}

You asked:
> "${prompt}"

Here is a direct, structured breakdown:

1. **Core Concept**: The core idea revolves around clean separation of concerns, deterministic execution, and minimal runtime overhead.
2. **Implementation Strategy**:
   - Establish strict type contracts upfront.
   - Maintain idempotent operations so side effects can be safely re-run.
   - Optimize for readability and ergonomics first, then apply memory profiling where necessary.

\`\`\`typescript
// Quick architectural pattern
export interface ExecutionContext {
  traceId: string;
  timestamp: number;
  environment: 'local-llm' | 'cloud';
}

export function executeTask<T>(task: () => Promise<T>, ctx: ExecutionContext): Promise<T> {
  console.log(\`[\${ctx.traceId}] Executing on \${ctx.environment} at \${new Date(ctx.timestamp).toISOString()}\`);
  return task();
}
\`\`\`

Feel free to ask follow-up questions or switch to **Agent Mode** to run multi-phase autonomous execution on this!`;
}

function generateAgentFinalMarkdown(prompt: string, model: Model, steps: AgentStep[]): string {
  return `### Agent Workflow Execution Completed

The autonomous agent loop on **${model.name}** has completed all 4 sequential phases:
- **Planning**: Deconstructed goals & bounded runtime constraints.
- **Evaluation**: Executed environment checks and tool grounding.
- **Building**: Synthesized verified code & validated AST signatures.
- **Output**: Formatted complete production artifact.

---

#### Solution Summary
For your request: \`${prompt.trim()}\`

\`\`\`typescript
/**
 * Production-ready module generated via Local Agent Loop
 * Model: ${model.name} (${model.provider})
 */

export interface SystemConfig {
  retries: number;
  timeoutMs: number;
  concurrency: number;
}

export class TaskEngine {
  private config: SystemConfig;

  constructor(config: Partial<SystemConfig> = {}) {
    this.config = {
      retries: 3,
      timeoutMs: 5000,
      concurrency: 4,
      ...config
    };
  }

  public async runBatch<T, R>(items: T[], worker: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = [];
    const queue = [...items];

    const workers = Array.from({ length: this.config.concurrency }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item === undefined) break;
        const res = await worker(item);
        results.push(res);
      }
    });

    await Promise.all(workers);
    return results;
  }
}
\`\`\`

#### Verification Report:
- **Phase Duration**: Completed in ~${steps.reduce((acc, s) => acc + (s.durationMs || 500), 0)}ms.
- **Linter Status**: Clean, zero syntax or runtime type discrepancies.
- **Local Persistence**: Workspace state saved to browser storage.`;
}
