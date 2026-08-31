export type ThemeMode = 'dark' | 'light' | 'odyssey' | 'oled';

export type ChatMode = 'normal' | 'agent';

export interface Model {
  id: string;
  name: string;
  provider: 'Local Ollama' | 'LM Studio' | 'vLLM' | 'Anthropic' | 'OpenAI' | 'Google' | 'Custom';
  category?: 'reasoning' | 'coding' | 'ocr' | 'vision';
  tag: string;
  description: string;
  contextWindow: string;
  parameters?: string;
  isLocal: boolean;
  localEndpoint?: string;
  badgeColor: string;
  iconName: string;
  vramGB?: number;
  loadStatus?: 'loaded' | 'idle' | 'loading';
  weightsPath?: string;
  quantization?: string;
  colorSwatch?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  systemPrompt: string;
  createdAt: number;
  filesCount?: number;
  statusSummary?: string;
}

export type ToolCategory = 'core' | 'coding' | 'search' | 'data' | 'system' | 'custom' | 'ocr' | 'vision' | 'rag';

export interface ToolDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: ToolCategory;
  isEnabled: boolean;
  isCustom?: boolean;
  sandboxed?: boolean;
  timeoutSec?: number;
  memoryLimitMB?: number;
  permissions?: string[];
  parametersSchema: string;
  mockOutputTemplate?: string;
  icon: string;
}

export interface AgentWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  stepsCount: number;
  toolsUsed: string[];
  tags: string[];
  lastRun?: number;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  category: 'Manuals' | 'SOPs' | 'Policies' | 'Technical Documents' | 'Previous Reports' | 'Past Correspondence' | 'Internal Documentation';
  syncStatus: 'synced' | 'indexing' | 'stale';
  lastSynced: number;
  documentCount: number;
  localPath: string;
  fileSizeMB: number;
}

export interface WorkbenchFile {
  id: string;
  name: string;
  type: 'generated' | 'uploaded';
  fileType: 'word' | 'excel' | 'powerpoint' | 'csv' | 'code' | 'pdf' | 'image' | 'drawing';
  sizeBytes: number;
  createdAt: number;
  previewSnippet?: string;
  path?: string;
}

export interface SandboxJob {
  id: string;
  name: string;
  command: string;
  status: 'running' | 'completed' | 'failed' | 'killed';
  elapsedSeconds: number;
  startedAt: number;
  cpuPercent: number;
  memoryMB: number;
}

export interface SandboxExecutionLog {
  id: string;
  command: string;
  exitCode: number;
  durationMs: number;
  outputSizeKB: number;
  timestamp: number;
  status: 'success' | 'failed' | 'timeout';
}

export interface SecurityAuditItem {
  id: string;
  timestamp: number;
  event: string;
  category: 'external_call_blocked' | 'sandbox_boundary' | 'permission_check' | 'local_db_query';
  status: 'blocked' | 'allowed' | 'enforced';
  details: string;
}

export type AgentPhase = 'planning' | 'evaluation' | 'building' | 'output';

export interface ToolCallExecution {
  toolId: string;
  toolName: string;
  inputParams: Record<string, any>;
  outputResult: any;
  durationMs: number;
  status: 'pending' | 'running' | 'success' | 'failed';
  planStepId?: string | null;
}

export interface AgentArtifact {
  id: string;
  title: string;
  type: 'code' | 'file' | 'diff' | 'json' | 'markdown';
  language?: string;
  content: string;
}

export interface AgentStep {
  id: string;
  phase: AgentPhase;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  logs: string[];
  toolCalls?: ToolCallExecution[];
  artifacts?: AgentArtifact[];
  durationMs?: number;
}

export interface AgentRunDetails {
  currentPhase: AgentPhase;
  steps: AgentStep[];
  progressPercent: number;
  totalDurationMs: number;
  isFinished: boolean;
  thoughtSummary?: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  contentSnippet?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelId?: string;
  mode?: ChatMode;
  agentRun?: AgentRunDetails;
  attachments?: Attachment[];
  isStreaming?: boolean;
  feedback?: 'like' | 'dislike' | null;
  tokensUsed?: number;
  tokensPerSec?: number;
  citations?: { marker: number; sourceName: string; location: string; snippetPreview: string; kbSource: boolean }[];
  runMode?: 'normal' | 'agent' | 'tool';
  toolId?: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  projectId?: string;
  mode: ChatMode;
  modelId: string;
  status?: 'completed' | 'in_progress' | 'awaiting_approval' | 'failed';
  messages: Message[];
  systemPrompt?: string;
  tags?: string[];
  runMode?: 'normal' | 'agent' | 'tool';
}

export interface AppSettings {
  theme: ThemeMode;
  defaultModelId: string;
  defaultMode: ChatMode;
  autoRoutingEnabled: boolean;
  userName: string;
  userRole: 'Lead Engineer' | 'Supervisor' | 'Approver' | 'Auditor';
  density: 'compact' | 'comfortable';
  notifyOnApproval: boolean;
  notifyOnTaskCompletion: boolean;
  notifyOnModelLoad: boolean;
  retentionPolicy: '30_days' | '90_days' | '1_year' | 'indefinite';
  localEndpointUrl: string;
  enableLocalApiBridge: boolean;
  streamSimulationSpeed: number;
  soundEffects: boolean;
  codeWordWrap: boolean;
  showTokenStats: boolean;
  customSystemPrompt: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  sandboxCpuCap: number; // e.g. 4 cores
  sandboxMemoryCapMB: number; // e.g. 8192 MB
  sandboxTimeoutSec: number; // e.g. 120s
}
