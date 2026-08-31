import React, { useState, useMemo } from 'react';
import { 
  Conversation, 
  Project, 
  Model, 
  ToolDefinition, 
  AppSettings, 
  ThemeMode, 
  ChatMode,
  AgentWorkflowTemplate,
  KnowledgeSource,
  WorkbenchFile,
  SandboxJob,
  SandboxExecutionLog,
  SecurityAuditItem
} from '../types';
import { ActiveNavTab } from './OdysseusRail';
import { ProviderIcon } from './ProviderIcon';
import { 
  Folder, 
  FolderPlus, 
  SquarePen, 
  Pin, 
  Trash2, 
  Edit3, 
  MoreVertical, 
  Plus, 
  Search, 
  Check, 
  X, 
  Wrench, 
  Brain, 
  FileText, 
  Settings, 
  Sliders, 
  Sparkles,
  Bot,
  Play,
  RotateCcw,
  Upload,
  Download,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  ChevronRight,
  ChevronDown,
  FileCode,
  FileSpreadsheet,
  FileCheck,
  Layers,
  Database,
  ScanText,
  Eye,
  Activity,
  HardDrive,
  Copy,
  Archive,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock
} from 'lucide-react';

interface SecondarySidebarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewTask: (projectId?: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePinConversation: (id: string) => void;
  onDuplicateConversation: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
  onExportConversation?: (id: string) => void;
  onMoveToProject: (conversationId: string, projectId?: string) => void;
  
  // Projects
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onDeleteProject: (id: string) => void;
  
  // Tools & Workflows
  tools: ToolDefinition[];
  workflows: AgentWorkflowTemplate[];
  onToggleTool: (toolId: string) => void;
  onAddTool: (tool: Omit<ToolDefinition, 'id'>) => void;
  onUpdateTool: (tool: ToolDefinition) => void;
  onDeleteTool: (toolId: string) => void;
  onRunWorkflow: (workflow: AgentWorkflowTemplate) => void;
  
  // Models
  models: Model[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  onAddModel: (model: Omit<Model, 'id'>) => void;
  onSetDefaultModelForCategory: (modelId: string, category: 'reasoning' | 'coding' | 'ocr' | 'vision') => void;
  autoRoutingEnabled: boolean;
  onToggleAutoRouting: () => void;
  
  // Knowledge Base
  knowledgeSources: KnowledgeSource[];
  onAddKnowledgeSource: (source: Omit<KnowledgeSource, 'id' | 'lastSynced'>) => void;
  onDeleteKnowledgeSource: (id: string) => void;
  
  // Files
  files: WorkbenchFile[];
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onUploadFile: (file: File) => void;
  
  // Sandbox
  sandboxJobs: SandboxJob[];
  sandboxLogs: SandboxExecutionLog[];
  onKillSandboxJob: (id: string) => void;
  
  // Security
  securityAudit: SecurityAuditItem[];
  
  // Settings & Theme
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
  onResetWorkspace: () => void;
}

export const SecondarySidebar: React.FC<SecondarySidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewTask,
  onDeleteConversation,
  onRenameConversation,
  onTogglePinConversation,
  onDuplicateConversation,
  onArchiveConversation,
  onExportConversation,
  onMoveToProject,
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  tools,
  workflows,
  onToggleTool,
  onAddTool,
  onUpdateTool,
  onDeleteTool,
  onRunWorkflow,
  models,
  selectedModelId,
  onSelectModel,
  onAddModel,
  onSetDefaultModelForCategory,
  autoRoutingEnabled,
  onToggleAutoRouting,
  knowledgeSources,
  onAddKnowledgeSource,
  onDeleteKnowledgeSource,
  files,
  onDeleteFile,
  onRenameFile,
  onUploadFile,
  sandboxJobs,
  sandboxLogs,
  onKillSandboxJob,
  securityAudit,
  settings,
  onSaveSettings,
  theme,
  onToggleTheme,
  onExportBackup,
  onImportBackup,
  onResetWorkspace,
}) => {
  // 1. Chats Panel State
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [activeKebabId, setActiveKebabId] = useState<string | null>(null);

  // 2. Projects Panel State
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    'proj-coding': true,
    'proj-research': false,
    'proj-autonomous-agent': true,
  });
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // 3. Agents & Tools Panel State
  const [toolsActiveTab, setToolsActiveTab] = useState<'tools' | 'workflows'>('tools');
  const [isAddToolModalOpen, setIsAddToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolDefinition | null>(null);
  const [newToolForm, setNewToolForm] = useState({
    name: '',
    displayName: '',
    description: '',
    category: 'core' as any,
    sandboxed: true,
    timeoutSec: 30,
    memoryLimitMB: 1024,
    parametersSchema: '{\n  "input": "string"\n}',
    icon: 'Wrench',
  });

  // 4. Models Panel State
  const [modelFilterCategory, setModelFilterCategory] = useState<'all' | 'reasoning' | 'coding' | 'ocr' | 'vision'>('all');
  const [modelSortBy, setModelSortBy] = useState<'name' | 'vram' | 'status'>('vram');
  const [isAddModelModalOpen, setIsAddModelModalOpen] = useState(false);
  const [newModelForm, setNewModelForm] = useState({
    name: '',
    category: 'reasoning' as any,
    weightsPath: '',
    quantization: 'Q4_K_M',
    vramGB: 16,
    description: '',
  });

  // 5. Knowledge Base State
  const [isAddKnowledgeModalOpen, setIsAddKnowledgeModalOpen] = useState(false);
  const [newKnowledgePath, setNewKnowledgePath] = useState('');
  const [newKnowledgeName, setNewKnowledgeName] = useState('');
  const [newKnowledgeCategory, setNewKnowledgeCategory] = useState<any>('Technical Documents');

  // 6. Files State
  const [filesActiveSection, setFilesActiveSection] = useState<'all' | 'generated' | 'uploaded'>('all');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [fileSearchQuery, setFileSearchQuery] = useState('');

  // 7. Security Modal State
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);

  // Helper to resolve model color swatch and category
  const getModelMeta = (modelId?: string) => {
    const m = models.find((mod) => mod.id === modelId) || models[0];
    return {
      name: m?.name || 'Sentinel Orchestrator',
      colorSwatch: m?.colorSwatch || '#6366f1',
      category: m?.category || 'reasoning',
    };
  };

  // Chats Grouping (Today, This Week, Earlier + Pinned)
  const filteredAndGroupedChats = useMemo(() => {
    const query = chatSearchQuery.toLowerCase().trim();
    const filtered = conversations.filter((c) => {
      if (!query) return true;
      const titleMatch = c.title.toLowerCase().includes(query);
      const msgMatch = c.messages.some((m) => m.content.toLowerCase().includes(query));
      return titleMatch || msgMatch;
    });

    const now = Date.now();
    const oneDay = 86400000;
    const todayCutoff = now - oneDay;
    const weekCutoff = now - oneDay * 7;

    const pinned: Conversation[] = [];
    const today: Conversation[] = [];
    const thisWeek: Conversation[] = [];
    const earlier: Conversation[] = [];

    filtered.forEach((c) => {
      if (c.isPinned) {
        pinned.push(c);
      } else if (c.updatedAt >= todayCutoff) {
        today.push(c);
      } else if (c.updatedAt >= weekCutoff) {
        thisWeek.push(c);
      } else {
        earlier.push(c);
      }
    });

    return { pinned, today, thisWeek, earlier };
  }, [conversations, chatSearchQuery]);

  // Render Status Dot per 3-color rule
  const renderStatusDot = (status?: string) => {
    switch (status) {
      case 'in_progress':
      case 'running':
      case 'loading':
      case 'indexing':
        return <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" title="Running / Pending" />;
      case 'awaiting_approval':
      case 'stale':
        return <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" title="Awaiting Approval" />;
      case 'failed':
      case 'blocked':
      case 'killed':
        return <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" title="Error / Blocked" />;
      case 'completed':
      case 'loaded':
      case 'synced':
      case 'success':
      default:
        return <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Healthy / Completed" />;
    }
  };

  // Render a Single Chat Row
  const renderChatRow = (c: Conversation) => {
    const isSelected = activeConversationId === c.id;
    const modelMeta = getModelMeta(c.modelId);
    const dateStr = new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div
        key={c.id}
        className={`group relative flex items-center justify-between px-2 py-1.5 rounded-xl transition-all cursor-pointer ${
          isSelected
            ? 'bg-[#242424] text-white border border-[#333333]'
            : 'hover:bg-[#1e1e1e] text-zinc-300 border border-transparent'
        }`}
        onClick={() => onSelectConversation(c.id)}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {/* Model Swatch Dot */}
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: modelMeta.colorSwatch }}
            title={`Model: ${modelMeta.name}`}
          />

          {/* Title & Mode Tag */}
          <div className="flex flex-col min-w-0 flex-1">
            {editingConvId === c.id ? (
              <input
                type="text"
                autoFocus
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => {
                  if (editingTitle.trim()) onRenameConversation(c.id, editingTitle.trim());
                  setEditingConvId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editingTitle.trim()) onRenameConversation(c.id, editingTitle.trim());
                    setEditingConvId(null);
                  }
                }}
                className="bg-[#121212] px-1.5 py-0.5 rounded text-xs text-white border border-blue-500 focus:outline-none"
              />
            ) : (
              <div className="flex items-center space-x-1.5 truncate">
                <span className="truncate text-xs font-medium">{c.title}</span>
              </div>
            )}

            <div className="flex items-center space-x-1.5 text-[10px] text-zinc-500 mt-0.5">
              {/* Mode Tag (Agent vs Tool) */}
              <span className={`px-1 py-0.2 rounded font-mono uppercase text-[9px] ${
                c.mode === 'agent' 
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
                {c.mode === 'agent' ? 'Agent' : 'Tool'}
              </span>
              <span>•</span>
              <span>{dateStr}</span>
            </div>
          </div>
        </div>

        {/* Status Dot + Kebab Menu */}
        <div className="flex items-center space-x-1.5 flex-shrink-0 ml-1.5">
          {renderStatusDot(c.status || 'completed')}

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveKebabId(activeKebabId === c.id ? null : c.id);
              }}
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-[#2e2e2e] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {activeKebabId === c.id && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveKebabId(null); }} />
                <div 
                  className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-[#1c1c1c] border border-[#2e2e2e] shadow-2xl p-1 z-50 animate-fade-in text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setEditingConvId(c.id);
                      setEditingTitle(c.title);
                      setActiveKebabId(null);
                    }}
                    className="flex items-center space-x-2 w-full px-2 py-1 rounded hover:bg-[#282828] text-zinc-300"
                  >
                    <Edit3 className="w-3 h-3 text-zinc-400" />
                    <span>Rename</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePinConversation(c.id);
                      setActiveKebabId(null);
                    }}
                    className="flex items-center space-x-2 w-full px-2 py-1 rounded hover:bg-[#282828] text-zinc-300"
                  >
                    <Pin className="w-3 h-3 text-zinc-400" />
                    <span>{c.isPinned ? 'Unpin' : 'Pin to Top'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDuplicateConversation(c.id);
                      setActiveKebabId(null);
                    }}
                    className="flex items-center space-x-2 w-full px-2 py-1 rounded hover:bg-[#282828] text-zinc-300"
                  >
                    <Copy className="w-3 h-3 text-zinc-400" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onExportConversation) onExportConversation(c.id);
                      setActiveKebabId(null);
                    }}
                    className="flex items-center space-x-2 w-full px-2 py-1 rounded hover:bg-[#282828] text-zinc-300"
                  >
                    <Archive className="w-3 h-3 text-zinc-400" />
                    <span>Export</span>
                  </button>
                  <div className="h-px bg-[#2a2a2a] my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteConversation(c.id);
                      setActiveKebabId(null);
                    }}
                    className="flex items-center space-x-2 w-full px-2 py-1 rounded hover:bg-rose-500/20 text-rose-400"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isCollapsed) return null;

  return (
    <aside 
      className="w-72 sm:w-76 h-full bg-[#161616] text-zinc-300 flex flex-col border-r border-[#242424] select-none flex-shrink-0 z-20 overflow-hidden text-xs"
      id="secondary-navigation-sidebar"
    >
      {/* 1. CHATS PANEL */}
      {activeTab === 'chats' && (
        <div className="flex flex-col h-full overflow-hidden p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white text-sm">Chats</span>
              <span className="px-1.5 py-0.5 rounded bg-[#242424] text-zinc-400 text-[10px] font-mono">
                {conversations.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNewTask()}
              className="p-1 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-zinc-200 hover:text-white border border-[#333] flex items-center space-x-1 px-2"
              title="New Task"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">New</span>
            </button>
          </div>

          {/* Search Box (Searching Chat & OCR'd document content) */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search chat text & OCR docs..."
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-xs"
            />
            {chatSearchQuery && (
              <button
                type="button"
                onClick={() => setChatSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Chat Groups List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Pinned Section */}
            {filteredAndGroupedChats.pinned.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center space-x-1 px-1 text-[10px] text-amber-400/80 font-semibold uppercase tracking-wider">
                  <Pin className="w-3 h-3" />
                  <span>Pinned</span>
                </div>
                {filteredAndGroupedChats.pinned.map(renderChatRow)}
              </div>
            )}

            {/* Today */}
            {filteredAndGroupedChats.today.length > 0 && (
              <div className="space-y-1">
                <p className="px-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Today</p>
                {filteredAndGroupedChats.today.map(renderChatRow)}
              </div>
            )}

            {/* This Week */}
            {filteredAndGroupedChats.thisWeek.length > 0 && (
              <div className="space-y-1">
                <p className="px-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">This Week</p>
                {filteredAndGroupedChats.thisWeek.map(renderChatRow)}
              </div>
            )}

            {/* Earlier */}
            {filteredAndGroupedChats.earlier.length > 0 && (
              <div className="space-y-1">
                <p className="px-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Earlier</p>
                {filteredAndGroupedChats.earlier.map(renderChatRow)}
              </div>
            )}

            {conversations.length === 0 && (
              <div className="py-12 text-center text-zinc-500 text-xs">
                No active conversations yet. Click "+ New" to start.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PROJECTS PANEL */}
      {activeTab === 'projects' && (
        <div className="flex flex-col h-full overflow-hidden p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="font-semibold text-white text-sm">Projects</span>
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(true)}
              className="p-1 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-zinc-200 hover:text-white border border-[#333] flex items-center space-x-1 px-2"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">+ New Project</span>
            </button>
          </div>

          {/* New Project Form Inline */}
          {isNewProjectModalOpen && (
            <div className="p-2.5 rounded-xl bg-[#1f1f1f] border border-[#333] space-y-2">
              <p className="text-xs font-semibold text-white">Create New Workspace</p>
              <input
                type="text"
                autoFocus
                placeholder="Project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#3a3a3a] text-xs text-white focus:outline-none"
              />
              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-2 py-1 rounded text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newProjectName.trim()) {
                      onCreateProject({
                        name: newProjectName.trim(),
                        description: 'Project workspace',
                        color: '#3b82f6',
                        icon: 'folder',
                        systemPrompt: 'You are a specialized engineer in this workspace.',
                        statusSummary: '0 active, 0 awaiting approval',
                      });
                      setNewProjectName('');
                      setIsNewProjectModalOpen(false);
                    }
                  }}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {/* Accordion List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {projects.map((proj) => {
              const isExpanded = !!expandedProjects[proj.id];
              const projectSessions = conversations.filter((c) => c.projectId === proj.id);

              return (
                <div key={proj.id} className="rounded-xl bg-[#1c1c1c] border border-[#282828] overflow-hidden">
                  {/* Project Header Bar */}
                  <div
                    className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-[#222222] transition-colors"
                    onClick={() =>
                      setExpandedProjects((prev) => ({ ...prev, [proj.id]: !prev[proj.id] }))
                    }
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                      <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-zinc-100 truncate">{proj.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {proj.statusSummary || `${projectSessions.length} active sessions`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNewTask(proj.id);
                      }}
                      className="p-1 rounded hover:bg-[#2e2e2e] text-zinc-400 hover:text-white"
                      title="New task in this project"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Inline Sessions List (Accordion Body) */}
                  {isExpanded && (
                    <div className="border-t border-[#262626] bg-[#171717] p-1.5 space-y-1">
                      {projectSessions.map(renderChatRow)}
                      {projectSessions.length === 0 && (
                        <p className="py-2 text-center text-[11px] text-zinc-500">
                          No active sessions. Click "+" to start one.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. AGENTS & TOOLS PANEL */}
      {activeTab === 'tools' && (
        <div className="flex flex-col h-full overflow-hidden p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="font-semibold text-white text-sm">Agents & Tools</span>
            {toolsActiveTab === 'tools' && (
              <button
                type="button"
                onClick={() => setIsAddToolModalOpen(true)}
                className="p-1 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-zinc-200 hover:text-white border border-[#333] flex items-center space-x-1 px-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">+ Add Tool</span>
              </button>
            )}
          </div>

          {/* Split Tabs: Tools vs Agent Workflows */}
          <div className="flex rounded-xl bg-[#1c1c1c] p-1 border border-[#2a2a2a]">
            <button
              type="button"
              onClick={() => setToolsActiveTab('tools')}
              className={`flex-1 py-1 text-center rounded-lg font-medium transition-all ${
                toolsActiveTab === 'tools'
                  ? 'bg-[#2a2a2a] text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tools ({tools.length})
            </button>
            <button
              type="button"
              onClick={() => setToolsActiveTab('workflows')}
              className={`flex-1 py-1 text-center rounded-lg font-medium transition-all ${
                toolsActiveTab === 'workflows'
                  ? 'bg-[#2a2a2a] text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Agent Workflows ({workflows.length})
            </button>
          </div>

          {/* Add / Edit Tool Modal Form */}
          {(isAddToolModalOpen || editingTool) && (
            <div className="p-3 rounded-xl bg-[#1f1f1f] border border-[#333] space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  {editingTool ? `Edit Tool: ${editingTool.name}` : 'Register New Tool'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddToolModalOpen(false);
                    setEditingTool(null);
                  }}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase font-semibold">Tool Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. custom_calc_tool"
                  value={editingTool ? editingTool.name : newToolForm.name}
                  onChange={(e) =>
                    editingTool
                      ? setEditingTool({ ...editingTool, name: e.target.value })
                      : setNewToolForm({ ...newToolForm, name: e.target.value, displayName: e.target.value })
                  }
                  className="w-full px-2.5 py-1 rounded bg-[#141414] border border-[#3a3a3a] text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase font-semibold">Description</label>
                <textarea
                  rows={2}
                  placeholder="Explain inputs, outputs, and safety scope..."
                  value={editingTool ? editingTool.description : newToolForm.description}
                  onChange={(e) =>
                    editingTool
                      ? setEditingTool({ ...editingTool, description: e.target.value })
                      : setNewToolForm({ ...newToolForm, description: e.target.value })
                  }
                  className="w-full px-2.5 py-1 rounded bg-[#141414] border border-[#3a3a3a] text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-semibold">Timeout (Sec)</label>
                  <input
                    type="number"
                    value={editingTool ? (editingTool.timeoutSec || 30) : newToolForm.timeoutSec}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 30;
                      if (editingTool) setEditingTool({ ...editingTool, timeoutSec: val });
                      else setNewToolForm({ ...newToolForm, timeoutSec: val });
                    }}
                    className="w-full px-2.5 py-1 rounded bg-[#141414] border border-[#3a3a3a] text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-semibold">Memory Limit (MB)</label>
                  <input
                    type="number"
                    value={editingTool ? (editingTool.memoryLimitMB || 1024) : newToolForm.memoryLimitMB}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1024;
                      if (editingTool) setEditingTool({ ...editingTool, memoryLimitMB: val });
                      else setNewToolForm({ ...newToolForm, memoryLimitMB: val });
                    }}
                    className="w-full px-2.5 py-1 rounded bg-[#141414] border border-[#3a3a3a] text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-400 font-mono">✓ Air-gapped Sandbox Enforced</span>
                <button
                  type="button"
                  onClick={() => {
                    if (editingTool) {
                      onUpdateTool(editingTool);
                      setEditingTool(null);
                    } else if (newToolForm.name.trim()) {
                      onAddTool({
                        name: newToolForm.name.trim(),
                        displayName: newToolForm.displayName.trim() || newToolForm.name.trim(),
                        description: newToolForm.description.trim(),
                        category: newToolForm.category,
                        isEnabled: true,
                        sandboxed: true,
                        timeoutSec: newToolForm.timeoutSec,
                        memoryLimitMB: newToolForm.memoryLimitMB,
                        permissions: ['sandbox:exec'],
                        parametersSchema: newToolForm.parametersSchema,
                        icon: 'Wrench',
                      });
                      setIsAddToolModalOpen(false);
                      setNewToolForm({
                        name: '',
                        displayName: '',
                        description: '',
                        category: 'core',
                        sandboxed: true,
                        timeoutSec: 30,
                        memoryLimitMB: 1024,
                        parametersSchema: '{\n  "input": "string"\n}',
                        icon: 'Wrench',
                      });
                    }
                  }}
                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  Save Tool
                </button>
              </div>
            </div>
          )}

          {/* Tools Tab Content */}
          {toolsActiveTab === 'tools' && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {tools.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl bg-[#1c1c1c] border border-[#282828] space-y-2 hover:border-[#383838] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-[#262626] flex items-center justify-center text-blue-400 font-mono text-xs">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-zinc-100 font-mono">{t.name}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingTool(t)}
                        className="px-2 py-0.5 rounded bg-[#242424] hover:bg-[#2e2e2e] text-zinc-300 text-[10px] font-medium border border-[#333]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleTool(t.id)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${
                          t.isEnabled ? 'bg-emerald-500' : 'bg-[#333]'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                            t.isEnabled ? 'left-4.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">{t.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-[#262626] font-mono">
                    <span>Timeout: {t.timeoutSec || 30}s</span>
                    <span>Mem: {t.memoryLimitMB || 1024}MB</span>
                    <span className="text-emerald-400">Sandboxed: Y</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Agent Workflows Tab Content */}
          {toolsActiveTab === 'workflows' && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="p-3 rounded-xl bg-[#1c1c1c] border border-[#282828] space-y-2.5 hover:border-[#383838] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-100">{wf.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-mono border border-purple-500/20">
                      {wf.stepsCount} Steps
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">{wf.description}</p>

                  <div className="flex flex-wrap gap-1">
                    {wf.toolsUsed.map((toolName) => (
                      <span
                        key={toolName}
                        className="px-1.5 py-0.5 rounded bg-[#242424] text-zinc-300 text-[10px] font-mono border border-[#333]"
                      >
                        {toolName}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#262626]">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Last Run: {wf.lastRun ? new Date(wf.lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => onRunWorkflow(wf)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. MODELS PANEL */}
      {activeTab === 'models' && (
        <div className="flex flex-col h-full overflow-hidden p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="font-semibold text-white text-sm">Model Registry</span>
            <button
              type="button"
              onClick={() => setIsAddModelModalOpen(true)}
              className="p-1 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-zinc-200 hover:text-white border border-[#333] flex items-center space-x-1 px-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">+ Add Model</span>
            </button>
          </div>

          {/* Auto-Routing Toggle Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a]">
            <div className="flex flex-col">
              <span className="font-semibold text-white">Auto-routing Engine</span>
              <span className="text-[10px] text-zinc-400">Routes queries to specialized models automatically</span>
            </div>
            <button
              type="button"
              onClick={onToggleAutoRouting}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                autoRoutingEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {autoRoutingEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center space-x-1">
              <span>Category:</span>
              <select
                value={modelFilterCategory}
                onChange={(e) => setModelFilterCategory(e.target.value as any)}
                className="bg-[#1c1c1c] border border-[#333] rounded px-1.5 py-0.5 text-zinc-200 focus:outline-none text-xs"
              >
                <option value="all">All</option>
                <option value="reasoning">Reasoning</option>
                <option value="coding">Coding</option>
                <option value="ocr">OCR</option>
                <option value="vision">Vision</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <span>Sort:</span>
              <select
                value={modelSortBy}
                onChange={(e) => setModelSortBy(e.target.value as any)}
                className="bg-[#1c1c1c] border border-[#333] rounded px-1.5 py-0.5 text-zinc-200 focus:outline-none text-xs"
              >
                <option value="vram">VRAM</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {/* Add Model Modal */}
          {isAddModelModalOpen && (
            <div className="p-3 rounded-xl bg-[#1f1f1f] border border-[#333] space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Register Open-Weight Model</span>
                <button type="button" onClick={() => setIsAddModelModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Model Name (e.g. DeepSeek-Coder-33B)..."
                value={newModelForm.name}
                onChange={(e) => setNewModelForm({ ...newModelForm, name: e.target.value })}
                className="w-full px-2 py-1 rounded bg-[#141414] border border-[#3a3a3a] text-xs text-white"
              />
              <input
                type="text"
                placeholder="Weights File Path (/models/llm/...)..."
                value={newModelForm.weightsPath}
                onChange={(e) => setNewModelForm({ ...newModelForm, weightsPath: e.target.value })}
                className="w-full px-2 py-1 rounded bg-[#141414] border border-[#3a3a3a] text-xs text-white font-mono"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newModelForm.category}
                  onChange={(e) => setNewModelForm({ ...newModelForm, category: e.target.value as any })}
                  className="bg-[#141414] border border-[#3a3a3a] rounded px-2 py-1 text-zinc-200"
                >
                  <option value="reasoning">Main Reasoning</option>
                  <option value="coding">Coding Model</option>
                  <option value="ocr">OCR Model</option>
                  <option value="vision">Vision Model</option>
                </select>
                <input
                  type="number"
                  placeholder="VRAM (GB)"
                  value={newModelForm.vramGB}
                  onChange={(e) => setNewModelForm({ ...newModelForm, vramGB: parseFloat(e.target.value) || 16 })}
                  className="px-2 py-1 rounded bg-[#141414] border border-[#3a3a3a] text-xs text-white font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (newModelForm.name.trim()) {
                    onAddModel({
                      name: newModelForm.name.trim(),
                      provider: 'Local Ollama',
                      category: newModelForm.category,
                      tag: `${newModelForm.category.toUpperCase()} Model`,
                      description: 'Custom registered open-weight local model.',
                      contextWindow: '64k',
                      isLocal: true,
                      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                      iconName: 'Cpu',
                      vramGB: newModelForm.vramGB,
                      loadStatus: 'loaded',
                      weightsPath: newModelForm.weightsPath,
                      quantization: newModelForm.quantization,
                      colorSwatch: '#8b5cf6',
                    });
                    setIsAddModelModalOpen(false);
                    setNewModelForm({
                      name: '',
                      category: 'reasoning',
                      weightsPath: '',
                      quantization: 'Q4_K_M',
                      vramGB: 16,
                      description: '',
                    });
                  }
                }}
                className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium"
              >
                Register Model
              </button>
            </div>
          )}

          {/* Model Cards List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {models
              .filter((m) => modelFilterCategory === 'all' || m.category === modelFilterCategory)
              .map((m) => {
                const isSelected = selectedModelId === m.id;
                const swatch = m.colorSwatch || '#6366f1';

                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl bg-[#1c1c1c] border transition-all ${
                      isSelected
                        ? 'border-blue-500/60 bg-[#202020] shadow-md'
                        : 'border-[#282828] hover:border-[#383838]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {/* Consistent Model Swatch */}
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: swatch }}
                        />
                        <span className="font-bold text-white text-xs">{m.name}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {renderStatusDot(m.loadStatus || 'loaded')}
                        <span className="text-[10px] text-zinc-400 uppercase font-mono">
                          {m.loadStatus || 'loaded'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#262626] text-blue-400 font-semibold text-[10px] font-mono">
                        {m.tag}
                      </span>
                      {m.vramGB ? (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          VRAM: {m.vramGB} GB
                        </span>
                      ) : null}
                    </div>

                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{m.description}</p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#262626]">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Context: {m.contextWindow}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectModel(m.id);
                          if (m.category) onSetDefaultModelForCategory(m.id, m.category);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-[#242424] hover:bg-[#2e2e2e] text-zinc-300 border border-[#333]'
                        }`}
                      >
                        {isSelected ? '✓ Active Default' : 'Set as Default'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 5. KNOWLEDGE BASE PANEL */}
      {activeTab === 'knowledge' && (
        <div className="flex flex-col h-full overflow-hidden p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="font-semibold text-white text-sm">Knowledge Base</span>
            <button
              type="button"
              onClick={() => setIsAddKnowledgeModalOpen(true)}
              className="p-1 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-zinc-200 hover:text-white border border-[#333] flex items-center space-x-1 px-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">+ Add Source</span>
            </button>
          </div>

          {/* Local Vector DB Badge (Sovereignty Proof) */}
          <div className="flex items-center space-x-2 p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
            <Lock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[11px] font-medium">
              Local vector DB — no external embedding calls
            </span>
          </div>

          {/* Add Source Modal (Only local file path accepted) */}
          {isAddKnowledgeModalOpen && (
            <div className="p-3 rounded-xl bg-[#1f1f1f] border border-[#333] space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Index Local Directory / Document</span>
                <button type="button" onClick={() => setIsAddKnowledgeModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Source Title..."
                value={newKnowledgeName}
                onChange={(e) => setNewKnowledgeName(e.target.value)}
                className="w-full px-2 py-1 rounded bg-[#141414] border border-[#3a3a3a] text-xs text-white"
              />
              <input
                type="text"
                placeholder="Local Path: /data/knowledge/..."
                value={newKnowledgePath}
                onChange={(e) => setNewKnowledgePath(e.target.value)}
                className="w-full px-2 py-1 rounded bg-[#141414] border border-[#3a3a3a] text-xs text-white font-mono"
              />
              <select
                value={newKnowledgeCategory}
                onChange={(e) => setNewKnowledgeCategory(e.target.value as any)}
                className="w-full bg-[#141414] border border-[#3a3a3a] rounded px-2 py-1 text-zinc-200"
              >
                <option value="Manuals">Manuals</option>
                <option value="SOPs">SOPs</option>
                <option value="Policies">Policies</option>
                <option value="Technical Documents">Technical Documents</option>
                <option value="Previous Reports">Previous Reports</option>
                <option value="Past Correspondence">Past Correspondence</option>
                <option value="Internal Documentation">Internal Documentation</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  if (newKnowledgeName.trim() && newKnowledgePath.trim()) {
                    onAddKnowledgeSource({
                      name: newKnowledgeName.trim(),
                      category: newKnowledgeCategory,
                      syncStatus: 'synced',
                      documentCount: Math.floor(Math.random() * 50) + 10,
                      localPath: newKnowledgePath.trim(),
                      fileSizeMB: 14.2,
                    });
                    setIsAddKnowledgeModalOpen(false);
                    setNewKnowledgeName('');
                    setNewKnowledgePath('');
                  }
                }}
                className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                Index Locally
              </button>
            </div>
          )}

          {/* Grouped Knowledge Sources */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {[
              'Manuals',
              'SOPs',
              'Policies',
              'Technical Documents',
              'Previous Reports',
              'Past Correspondence',
              'Internal Documentation',
            ].map((catName) => {
              const catSources = knowledgeSources.filter((k) => k.category === catName);
              if (catSources.length === 0) return null;

              return (
                <div key={catName} className="space-y-1.5">
                  <p className="px-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">
                    {catName}
                  </p>
                  {catSources.map((ks) => (
                    <div
                      key={ks.id}
                      className="p-2.5 rounded-xl bg-[#1c1c1c] border border-[#282828] space-y-1.5 hover:border-[#383838] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 min-w-0">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="font-semibold text-zinc-100 text-xs leading-snug">{ks.name}</span>
                        </div>
                        {renderStatusDot(ks.syncStatus)}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
                        <span>{ks.documentCount} docs ({ks.fileSizeMB} MB)</span>
                        <span>Synced {new Date(ks.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. FILES PANEL */}
      {activeTab === 'files' && (
        <div className="flex flex-col h-full overflow-hidden p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="font-semibold text-white text-sm">Workbench Files</span>
            <label className="p-1 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-zinc-200 hover:text-white border border-[#333] flex items-center space-x-1 px-2 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Upload</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUploadFile(f);
                }}
              />
            </label>
          </div>

          {/* Sub-Section Split: Generated vs Uploaded */}
          <div className="flex rounded-xl bg-[#1c1c1c] p-1 border border-[#2a2a2a]">
            <button
              type="button"
              onClick={() => setFilesActiveSection('all')}
              className={`flex-1 py-1 text-center rounded-lg font-medium transition-all ${
                filesActiveSection === 'all' ? 'bg-[#2a2a2a] text-white shadow' : 'text-zinc-400'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilesActiveSection('generated')}
              className={`flex-1 py-1 text-center rounded-lg font-medium transition-all ${
                filesActiveSection === 'generated' ? 'bg-[#2a2a2a] text-white shadow' : 'text-zinc-400'
              }`}
            >
              Generated
            </button>
            <button
              type="button"
              onClick={() => setFilesActiveSection('uploaded')}
              className={`flex-1 py-1 text-center rounded-lg font-medium transition-all ${
                filesActiveSection === 'uploaded' ? 'bg-[#2a2a2a] text-white shadow' : 'text-zinc-400'
              }`}
            >
              Uploaded
            </button>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {files
              .filter((f) => filesActiveSection === 'all' || f.type === filesActiveSection)
              .map((file) => (
                <div
                  key={file.id}
                  className="p-2.5 rounded-xl bg-[#1c1c1c] border border-[#282828] space-y-1.5 hover:border-[#383838] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      {file.fileType === 'word' && <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                      {file.fileType === 'excel' && <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                      {file.fileType === 'powerpoint' && <Layers className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                      {file.fileType === 'code' && <FileCode className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                      {file.fileType === 'pdf' && <FileCheck className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                      <span className="font-semibold text-zinc-100 truncate text-xs">{file.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteFile(file.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {file.previewSnippet && (
                    <p className="text-[10px] text-zinc-400 line-clamp-2 font-mono bg-[#141414] p-1.5 rounded-lg border border-[#242424]">
                      {file.previewSnippet}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span className="capitalize">{file.type}</span>
                    <span>{(file.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 7. SANDBOX PANEL */}
      {activeTab === 'sandbox' && (
        <div className="flex flex-col h-full overflow-hidden p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="font-semibold text-white text-sm">Sandbox Runtime</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
              AIR-GAPPED
            </span>
          </div>

          {/* Live Status Card */}
          <div className="p-3 rounded-xl bg-[#1c1c1c] border border-[#282828] space-y-2">
            <p className="text-xs font-semibold text-white">Isolation & Security Guarantees</p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Process isolation</span>
                <span className="text-emerald-400 font-bold">✓ SECCOMP-bpf</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>Filesystem isolation</span>
                <span className="text-emerald-400 font-bold">✓ Read-only Mounts</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>Network access</span>
                <span className="text-emerald-400 font-bold">✓ Disabled (0 external)</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300 pt-1 border-t border-[#2a2a2a] font-mono text-[10px]">
                <span>CPU Cap: {settings.sandboxCpuCap || 4} cores</span>
                <span>RAM Cap: {settings.sandboxMemoryCapMB || 8192} MB</span>
              </div>
            </div>
          </div>

          {/* Active Jobs List */}
          <div className="space-y-1.5">
            <p className="px-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">
              Active Executions ({sandboxJobs.length})
            </p>
            {sandboxJobs.map((job) => (
              <div key={job.id} className="p-2.5 rounded-xl bg-[#1c1c1c] border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white font-mono text-xs">{job.name}</span>
                  <button
                    type="button"
                    onClick={() => onKillSandboxJob(job.id)}
                    className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-[10px] font-medium"
                  >
                    Kill Job
                  </button>
                </div>
                <p className="text-[10px] font-mono text-zinc-400 bg-[#121212] p-1 rounded truncate">
                  {job.command}
                </p>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Elapsed: {job.elapsedSeconds}s</span>
                  <span>CPU: {job.cpuPercent}% | RAM: {job.memoryMB}MB</span>
                </div>
              </div>
            ))}
            {sandboxJobs.length === 0 && (
              <p className="py-2 text-center text-zinc-500 text-[11px]">No active background executions.</p>
            )}
          </div>

          {/* Recent Executions Log */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            <p className="px-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">
              Recent Execution Logs
            </p>
            {sandboxLogs.map((log) => (
              <div key={log.id} className="p-2 rounded-xl bg-[#1c1c1c] border border-[#262626] space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-zinc-300 truncate max-w-[180px]">{log.command}</span>
                  <span className="text-emerald-400 font-bold">Exit: {log.exitCode}</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                  <span>Duration: {log.durationMs}ms</span>
                  <span>Output: {log.outputSizeKB} KB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. SECURITY PANEL */}
      {activeTab === 'security' && (
        <div className="flex flex-col h-full overflow-hidden p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="font-semibold text-white text-sm">Security & Air-Gap</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Live External Calls Counter */}
          <div className="p-3 rounded-xl bg-[#1c1c1c] border border-emerald-500/30 text-center space-y-1">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-3xl font-bold font-mono text-emerald-400">0</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider">External API Calls</p>
            <p className="text-[10px] text-zinc-400">100% of tensor matrices & vector indexes compute locally.</p>
          </div>

          {/* Offline Operation Checklist */}
          <div className="p-3 rounded-xl bg-[#1c1c1c] border border-[#282828] space-y-2">
            <p className="text-xs font-semibold text-white">Sovereignty Proof Checklist</p>
            <div className="space-y-1 text-[11px]">
              {[
                'No cloud APIs',
                'No external LLM APIs',
                'No external OCR APIs',
                'No external vector DB',
                'No external file processing',
                'Local model inference',
                'Local storage',
              ].map((item) => (
                <div key={item} className="flex items-center justify-between text-zinc-300 py-0.5">
                  <span>{item}</span>
                  <span className="text-emerald-400 font-bold">✓ Active</span>
                </div>
              ))}
            </div>
          </div>

          {/* View Full Audit Log Button */}
          <button
            type="button"
            onClick={() => setIsAuditLogModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-medium text-xs border border-blue-500/30 flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>View Full Audit Log</span>
          </button>

          {/* Audit Log Modal */}
          {isAuditLogModalOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-[#1c1c1c] border border-[#333] rounded-2xl p-4 space-y-3 max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-[#2e2e2e]">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-white text-sm">Sovereign Air-Gap Security Audit Ledger</span>
                  </div>
                  <button type="button" onClick={() => setIsAuditLogModalOpen(false)} className="text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {securityAudit.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-xl bg-[#141414] border border-[#2a2a2a] space-y-1 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-200 font-semibold">{item.event}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'blocked' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[10px]">{item.details}</p>
                      <span className="text-[9px] text-zinc-600">
                        Timestamp: {new Date(item.timestamp).toISOString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAuditLogModalOpen(false)}
                    className="px-4 py-1.5 rounded-xl bg-[#262626] hover:bg-[#303030] text-white text-xs font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 9. NOTES PANEL (Kept exactly as requested) */}
      {activeTab === 'notes' && (
        <div className="flex flex-col h-full overflow-hidden p-3 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="font-semibold text-white text-sm">Notes & Scratchpad</span>
          </div>
          <p className="text-[11px] text-zinc-400">Workspace Notes, Templates & Snippets</p>
          <textarea
            placeholder="Write notes, snippets, or prompt templates here..."
            className="w-full flex-1 p-3 rounded-xl bg-[#1c1c1c] border border-[#2d2d2d] text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:border-zinc-500"
          />
        </div>
      )}

      {/* 10. SETTINGS PANEL */}
      {activeTab === 'settings' && (
        <div className="flex flex-col h-full overflow-y-auto p-3 space-y-3.5 pr-1">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="font-semibold text-white text-sm">Workbench Settings</span>
          </div>

          {/* Profile & Role */}
          <div className="p-3 rounded-xl bg-[#1c1c1c] border border-[#282828] space-y-2">
            <p className="text-xs font-semibold text-white">Profile & Role</p>
            <div className="space-y-1 text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-400">User:</span>
                <span className="font-medium text-white">{settings.userName || 'Alex Mercer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Role:</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px]">
                  {settings.userRole || 'Lead Engineer'}
                </span>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="p-3 rounded-xl bg-[#1c1c1c] border border-[#282828] space-y-2">
            <p className="text-xs font-semibold text-white">Appearance</p>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Theme</span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="px-2.5 py-1 rounded bg-[#242424] hover:bg-[#2e2e2e] text-zinc-200 border border-[#333]"
              >
                Toggle ({theme})
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-3 rounded-xl bg-[#1c1c1c] border border-[#282828] space-y-2">
            <p className="text-xs font-semibold text-white">Notification Preferences</p>
            <div className="space-y-1.5 text-zinc-300">
              <label className="flex items-center justify-between">
                <span>Approval requests</span>
                <input
                  type="checkbox"
                  checked={settings.notifyOnApproval}
                  onChange={(e) => onSaveSettings({ ...settings, notifyOnApproval: e.target.checked })}
                  className="rounded bg-[#141414]"
                />
              </label>
              <label className="flex items-center justify-between">
                <span>Task completion</span>
                <input
                  type="checkbox"
                  checked={settings.notifyOnTaskCompletion}
                  onChange={(e) => onSaveSettings({ ...settings, notifyOnTaskCompletion: e.target.checked })}
                  className="rounded bg-[#141414]"
                />
              </label>
            </div>
          </div>

          {/* Defaults */}
          <div className="p-3 rounded-xl bg-[#1c1c1c] border border-[#282828] space-y-2">
            <p className="text-xs font-semibold text-white">Defaults</p>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Default Mode</span>
              <select
                value={settings.defaultMode}
                onChange={(e) => onSaveSettings({ ...settings, defaultMode: e.target.value as any })}
                className="bg-[#141414] border border-[#333] rounded px-2 py-0.5 text-zinc-200"
              >
                <option value="agent">Agent (Autonomous)</option>
                <option value="normal">Tool (Single-step)</option>
              </select>
            </div>
          </div>

          {/* Data & Sessions */}
          <div className="p-3 rounded-xl bg-[#1c1c1c] border border-[#282828] space-y-2">
            <p className="text-xs font-semibold text-white">Data & Sessions</p>
            <button
              type="button"
              onClick={onExportBackup}
              className="w-full py-1.5 rounded bg-[#242424] hover:bg-[#2e2e2e] text-zinc-200 border border-[#333]"
            >
              Export All Sessions
            </button>
            <button
              type="button"
              onClick={onResetWorkspace}
              className="w-full py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
            >
              Clear Local Cache & Reset
            </button>
          </div>

          {/* About */}
          <div className="p-3 rounded-xl bg-[#1c1c1c] border border-[#282828] space-y-1 text-zinc-400 text-[11px]">
            <p className="text-xs font-semibold text-white">About Sentinel Sovereign Workbench</p>
            <p>Version 2.4.0-airgap</p>
            <p className="text-emerald-400">Offline Verified Node</p>
          </div>
        </div>
      )}
    </aside>
  );
};
