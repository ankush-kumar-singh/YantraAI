/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Conversation, 
  Message, 
  Project, 
  ToolDefinition, 
  Model, 
  AppSettings, 
  ThemeMode, 
  ChatMode, 
  Attachment,
  AgentWorkflowTemplate,
  KnowledgeSource,
  WorkbenchFile,
  SandboxJob,
  SandboxExecutionLog,
  SecurityAuditItem
} from './types';
import { storageService } from './services/storage';
import { wsManager } from './services/websocketManager';
import { eventDispatcherInstance } from './services/eventDispatcher';
import { OdysseusRail, ActiveNavTab } from './components/OdysseusRail';
import { SecondarySidebar } from './components/SecondarySidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { PromptInputBar } from './components/PromptInputBar';

export default function App() {
  // 1. Core Persistent State
  const [conversations, setConversations] = useState<Conversation[]>(() => storageService.getConversations());
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => storageService.getActiveConversationId());
  const [projects, setProjects] = useState<Project[]>(() => storageService.getProjects());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tools, setTools] = useState<ToolDefinition[]>(() => storageService.getTools());
  const [workflows, setWorkflows] = useState<AgentWorkflowTemplate[]>(() => storageService.getWorkflows());
  const [models, setModels] = useState<Model[]>(() => storageService.getModels());
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(() => storageService.getKnowledgeSources());
  const [files, setFiles] = useState<WorkbenchFile[]>(() => storageService.getFiles());
  const [sandboxJobs, setSandboxJobs] = useState<SandboxJob[]>(() => storageService.getSandboxJobs());
  const [sandboxLogs, setSandboxLogs] = useState<SandboxExecutionLog[]>(() => storageService.getSandboxLogs());
  const [securityAudit, setSecurityAudit] = useState<SecurityAuditItem[]>(() => storageService.getSecurityAudit());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [theme, setTheme] = useState<ThemeMode>(() => storageService.getTheme());
  const [wsStatus, setWsStatus] = useState<{ connected: boolean; useSimulator: boolean }>({ connected: false, useSimulator: true });

  // 2. Active Session State
  const [selectedModelId, setSelectedModelId] = useState<string>(settings.defaultModelId);
  const [activeMode, setActiveMode] = useState<ChatMode>(settings.defaultMode);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 3. Navigation & Sidebar State
  const [activeRailTab, setActiveRailTab] = useState<ActiveNavTab>('chats');
  const [isSecondarySidebarOpen, setIsSecondarySidebarOpen] = useState<boolean>(true);

  // 4. In-Chat Search State
  const [isInChatSearchOpen, setIsInChatSearchOpen] = useState<boolean>(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState<string>('');
  const [currentSearchMatchIndex, setCurrentSearchMatchIndex] = useState<number>(0);

  // Auto-Save modifications to Storage
  useEffect(() => {
    storageService.saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    if (activeConversationId) {
      storageService.saveActiveConversationId(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    storageService.saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    storageService.saveTools(tools);
  }, [tools]);

  useEffect(() => {
    storageService.saveWorkflows(workflows);
  }, [workflows]);

  useEffect(() => {
    storageService.saveModels(models);
  }, [models]);

  useEffect(() => {
    storageService.saveKnowledgeSources(knowledgeSources);
  }, [knowledgeSources]);

  useEffect(() => {
    storageService.saveFiles(files);
  }, [files]);

  useEffect(() => {
    storageService.saveSandboxJobs(sandboxJobs);
  }, [sandboxJobs]);

  useEffect(() => {
    storageService.saveSandboxLogs(sandboxLogs);
  }, [sandboxLogs]);

  useEffect(() => {
    storageService.saveSecurityAudit(securityAudit);
  }, [securityAudit]);

  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storageService.saveTheme(theme);
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'theme-odyssey', 'theme-oled');
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'oled') {
      root.classList.add('dark', 'theme-oled');
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  // Connect WebSocket & fetch initial data from server REST API on mount
  useEffect(() => {
    const sessionToken = localStorage.getItem('session_token') || 'mock-token-' + Date.now();
    localStorage.setItem('session_token', sessionToken);
    wsManager.connect(sessionToken);

    const syncWithServer = async () => {
      try {
        const serverConvs = await storageService.fetchConversationsFromServer();
        setConversations(serverConvs);
      } catch (e) {
        console.warn('Conversations REST API not available, using offline storage.');
      }
      try {
        const serverProjects = await storageService.fetchProjectsFromServer();
        setProjects(serverProjects);
      } catch {}
      try {
        const serverTools = await storageService.fetchToolsFromServer();
        setTools(serverTools);
      } catch {}
      try {
        const serverModels = await storageService.fetchModelsFromServer();
        setModels(serverModels);
      } catch {}
      try {
        const serverKnowledge = await storageService.fetchKnowledgeSourcesFromServer();
        setKnowledgeSources(serverKnowledge);
      } catch {}
      try {
        const serverAudit = await storageService.fetchSecurityAuditFromServer();
        setSecurityAudit(serverAudit);
      } catch {}
      try {
        const serverSettings = await storageService.fetchSettingsFromServer();
        setSettings(serverSettings);
      } catch {}
    };
    syncWithServer();
  }, []);

  // Set up event listeners for incoming WebSocket events
  useEffect(() => {
    const handleModelRoute = (e: any) => {
      const { session_id, payload } = e;
      setConversations(prev => prev.map(c => {
        if (c.id === session_id) {
          return {
            ...c,
            messages: c.messages.map((m, idx) => {
              if (idx === c.messages.length - 1 && m.role === 'assistant') {
                return { ...m, modelId: payload.model_id };
              }
              return m;
            })
          };
        }
        return c;
      }));
    };

    const handlePlan = (e: any) => {
      const { session_id, payload } = e;
      setConversations(prev => prev.map(c => {
        if (c.id === session_id) {
          return {
            ...c,
            messages: c.messages.map((m, idx) => {
              if (idx === c.messages.length - 1 && m.role === 'assistant') {
                return {
                  ...m,
                  agentRun: {
                    currentPhase: payload.steps.find((s: any) => s.status === 'running')?.phase || 'planning',
                    steps: payload.steps,
                    progressPercent: Math.round((payload.steps.filter((s: any) => s.status === 'completed').length / payload.steps.length) * 100) || 10,
                    totalDurationMs: m.agentRun?.totalDurationMs || 0,
                    isFinished: false
                  }
                };
              }
              return m;
            })
          };
        }
        return c;
      }));
    };

    const handleMessageChunk = (e: any) => {
      const { session_id, payload } = e;
      setConversations(prev => prev.map(c => {
        if (c.id === session_id) {
          return {
            ...c,
            messages: c.messages.map((m, idx) => {
              if (idx === c.messages.length - 1 && m.role === 'assistant') {
                return { ...m, content: payload.content, isStreaming: true };
              }
              return m;
            })
          };
        }
        return c;
      }));
    };

    const handleFinal = (e: any) => {
      const { session_id, payload } = e;
      setConversations(prev => prev.map(c => {
        if (c.id === session_id) {
          return {
            ...c,
            status: 'completed',
            messages: c.messages.map((m, idx) => {
              if (idx === c.messages.length - 1 && m.role === 'assistant') {
                return {
                  ...m,
                  content: payload.content,
                  isStreaming: false,
                  citations: payload.citations,
                  tokensUsed: payload.tokens_used,
                  tokensPerSec: payload.tokens_per_sec,
                  agentRun: m.agentRun ? {
                    ...m.agentRun,
                    progressPercent: 100,
                    isFinished: true,
                    totalDurationMs: payload.total_duration_ms
                  } : undefined
                };
              }
              return m;
            })
          };
        }
        return c;
      }));
      setIsStreaming(false);
    };

    const handleTelemetry = (e: any) => {
      const { payload } = e;
      if (payload.vram_by_model) {
        setModels(prev => prev.map(m => {
          const match = payload.vram_by_model.find((x: any) => x.model_id === m.id);
          if (match) {
            return { ...m, vramGB: match.gb, loadStatus: 'loaded' };
          }
          return m;
        }));
      }
    };

    const handleNetworkAudit = (e: any) => {
      const { payload } = e;
      const newAuditItem: SecurityAuditItem = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        event: payload.event,
        category: payload.verdict === 'blocked' ? 'external_call_blocked' : 'sandbox_boundary',
        status: payload.verdict === 'allowed' ? 'allowed' : 'blocked',
        details: payload.process 
          ? `Network call block: ${payload.process} attempted to connect to ${payload.destination}` 
          : 'System audit heartbeat verification passed.'
      };
      setSecurityAudit(prev => [newAuditItem, ...prev]);
    };

    const handleSandboxUpdate = (e: any) => {
      const { payload } = e;
      if (payload.jobs) {
        setSandboxJobs(payload.jobs);
      }
      if (payload.recent_executions) {
        setSandboxLogs(payload.recent_executions);
      }
    };

    const handleError = (e: any) => {
      const { session_id } = e;
      setConversations(prev => prev.map(c => {
        if (c.id === session_id) {
          return { ...c, status: 'failed' };
        }
        return c;
      }));
      setIsStreaming(false);
    };

    const handleConnectionStatus = (e: any) => {
      setWsStatus(e.payload);
    };

    eventDispatcherInstance.addEventListener('model_route', handleModelRoute);
    eventDispatcherInstance.addEventListener('plan', handlePlan);
    eventDispatcherInstance.addEventListener('message_chunk', handleMessageChunk);
    eventDispatcherInstance.addEventListener('final', handleFinal);
    eventDispatcherInstance.addEventListener('telemetry', handleTelemetry);
    eventDispatcherInstance.addEventListener('network_audit', handleNetworkAudit);
    eventDispatcherInstance.addEventListener('sandbox_update', handleSandboxUpdate);
    eventDispatcherInstance.addEventListener('error', handleError);
    eventDispatcherInstance.addEventListener('connection_status', handleConnectionStatus);

    return () => {
      eventDispatcherInstance.removeEventListener('model_route', handleModelRoute);
      eventDispatcherInstance.removeEventListener('plan', handlePlan);
      eventDispatcherInstance.removeEventListener('message_chunk', handleMessageChunk);
      eventDispatcherInstance.removeEventListener('final', handleFinal);
      eventDispatcherInstance.removeEventListener('telemetry', handleTelemetry);
      eventDispatcherInstance.removeEventListener('network_audit', handleNetworkAudit);
      eventDispatcherInstance.removeEventListener('sandbox_update', handleSandboxUpdate);
      eventDispatcherInstance.removeEventListener('error', handleError);
      eventDispatcherInstance.removeEventListener('connection_status', handleConnectionStatus);
    };
  }, []);

  // Current active entities
  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;
  const currentModel = models.find(m => m.id === selectedModelId) || models[0];
  const activeProject = projects.find(p => p.id === selectedProjectId);

  // 5. Handlers
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setSelectedModelId(conv.modelId);
      setActiveMode(conv.mode);
      if (conv.projectId) setSelectedProjectId(conv.projectId);
    }
  };

  const handleNewTask = (projectId?: string) => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Task',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mode: activeMode,
      modelId: selectedModelId,
      projectId: projectId || selectedProjectId || undefined,
      status: 'in_progress',
      messages: [],
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
  };

  const handleDuplicateChat = (convId?: string) => {
    const target = convId ? conversations.find(c => c.id === convId) : activeConversation;
    if (!target) return;
    const duplicatedConv: Conversation = {
      ...target,
      id: `conv-${Date.now()}`,
      title: `${target.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [...target.messages],
    };
    setConversations(prev => [duplicatedConv, ...prev]);
    setActiveConversationId(duplicatedConv.id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, title: newTitle, updatedAt: Date.now() };
      }
      return c;
    }));
  };

  const handleTogglePinConversation = (id: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, isPinned: !c.isPinned };
      }
      return c;
    }));
  };

  const handleMoveToProject = (convId: string, projId?: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === convId) {
        return { ...c, projectId: projId };
      }
      return c;
    }));
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    if (activeConversationId) {
      setConversations(prev => prev.map(c => {
        if (c.id === activeConversationId) {
          return { ...c, modelId };
        }
        return c;
      }));
    }
  };

  const handleSetDefaultModelForCategory = (modelId: string, category: 'reasoning' | 'coding' | 'ocr' | 'vision') => {
    setSelectedModelId(modelId);
    setSettings(prev => ({ ...prev, defaultModelId: modelId }));
  };

  const handleStopStreaming = () => {
    if (activeConversationId) {
      wsManager.cancel(activeConversationId);
    }
    setIsStreaming(false);
  };

  const handleSendMessage = async (text: string, mode: ChatMode = activeMode, attachments: Attachment[] = []) => {
    if ((!text.trim() && attachments.length === 0) || isStreaming) return;

    let convId = activeConversationId;
    let targetConv = conversations.find(c => c.id === convId);

    // Create new task conversation if none exists
    if (!convId || !targetConv) {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: text.length > 35 ? `${text.substring(0, 35)}...` : text || 'New Task',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        mode: mode,
        modelId: selectedModelId,
        projectId: selectedProjectId || undefined,
        status: 'in_progress',
        messages: [],
        runMode: mode === 'agent' ? 'agent' : 'normal',
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      convId = newConv.id;
      targetConv = newConv;
    } else if (targetConv.messages.length === 0) {
      const generatedTitle = text.length > 35 ? `${text.substring(0, 35)}...` : text;
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: generatedTitle } : c));
    }

    const userMessageId = `msg-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const assistantMessageId = `msg-${Date.now() + 1}`;
    const assistantPlaceholderMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelId: selectedModelId,
      mode: mode,
      isStreaming: true,
      runMode: mode === 'agent' ? 'agent' : 'normal',
    };

    setConversations(prev => prev.map(c => {
      if (c.id === convId) {
        return {
          ...c,
          updatedAt: Date.now(),
          status: 'in_progress',
          messages: [...c.messages, userMessage, assistantPlaceholderMessage],
        };
      }
      return c;
    }));

    setIsStreaming(true);

    const activeToolsList = tools.filter(t => t.isEnabled);
    wsManager.sendUserMessage({
      conversation_id: convId,
      project_id: selectedProjectId || null,
      run_mode: mode === 'agent' ? 'agent' : 'normal',
      tool_id: null,
      prompt: text,
      model_mode: settings.autoRoutingEnabled ? 'auto' : 'manual',
      requested_model_id: settings.autoRoutingEnabled ? null : selectedModelId,
      active_tools: activeToolsList.map(t => t.id),
      attachments: attachments.map(a => ({
        id: a.id,
        name: a.name,
        size: a.size,
        type: a.type
      })),
      temperature: settings.temperature,
      top_p: settings.topP,
      max_tokens: settings.maxTokens
    }, {
      currentModel,
      activeTools: activeToolsList,
      systemPrompt: activeProject?.systemPrompt || settings.customSystemPrompt
    });
  };

  const handleRegenerateLastMessage = () => {
    if (!activeConversation || activeConversation.messages.length < 2 || isStreaming) return;
    const lastUserIndex = [...activeConversation.messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIndex === -1) return;
    
    const userMsgIndex = activeConversation.messages.length - 1 - lastUserIndex;
    const userMsg = activeConversation.messages[userMsgIndex];

    setConversations(prev => prev.map(c => {
      if (c.id === activeConversation.id) {
        return {
          ...c,
          messages: c.messages.slice(0, userMsgIndex + 1),
        };
      }
      return c;
    }));

    if (activeConversationId) {
      wsManager.regenerate(activeConversationId, userMsg.id);
    }

    handleSendMessage(userMsg.content, activeConversation.mode, userMsg.attachments || []);
  };

  // Keyboard Shortcuts (⌘N for new task, ⌘K for chat panel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewTask();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSecondarySidebarOpen(true);
        setActiveRailTab('chats');
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsInChatSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasMessages = (activeConversation?.messages?.length || 0) > 0;
  const activeToolsCount = tools.filter(t => t.isEnabled).length;
  const hasRunningJobs = sandboxJobs.some(j => j.status === 'running');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1a1a1a] text-zinc-100 font-sans select-none">
      {/* 1. Left Icon Rail (10 spec icons + avatar) */}
      <OdysseusRail
        activeTab={activeRailTab}
        onSelectTab={(tab) => {
          setActiveRailTab(tab);
          setIsSecondarySidebarOpen(true);
        }}
        onNewTask={() => handleNewTask()}
        isSecondarySidebarOpen={isSecondarySidebarOpen}
        onToggleSecondarySidebar={() => setIsSecondarySidebarOpen(!isSecondarySidebarOpen)}
        currentTheme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenSettings={() => {
          setActiveRailTab('settings');
          setIsSecondarySidebarOpen(true);
        }}
        activeModel={currentModel}
        activeToolsCount={activeToolsCount}
        hasRunningJobs={hasRunningJobs}
        isSecurityBlocked={false}
        userRole={settings.userRole}
        userName={settings.userName}
      />

      {/* 2. Secondary Sidebar Flyout Panels */}
      <SecondarySidebar
        activeTab={activeRailTab}
        onSelectTab={setActiveRailTab}
        isCollapsed={!isSecondarySidebarOpen}
        onToggleCollapse={() => setIsSecondarySidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewTask={handleNewTask}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePinConversation={handleTogglePinConversation}
        onDuplicateConversation={handleDuplicateChat}
        onExportConversation={(id) => {
          const conv = conversations.find(c => c.id === id);
          if (!conv) return;
          const blob = new Blob([JSON.stringify(conv, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `session_${conv.id}.json`;
          a.click();
        }}
        onMoveToProject={handleMoveToProject}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onCreateProject={(p) => setProjects(prev => [...prev, { ...p, id: `proj-${Date.now()}`, createdAt: Date.now() }])}
        onDeleteProject={(id) => setProjects(prev => prev.filter(p => p.id !== id))}
        tools={tools}
        workflows={workflows}
        onToggleTool={(id) => setTools(prev => prev.map(t => t.id === id ? { ...t, isEnabled: !t.isEnabled } : t))}
        onAddTool={(t) => setTools(prev => [...prev, { ...t, id: `tool-${Date.now()}` }])}
        onUpdateTool={(updated) => setTools(prev => prev.map(t => t.id === updated.id ? updated : t))}
        onDeleteTool={(id) => setTools(prev => prev.filter(t => t.id !== id))}
        onRunWorkflow={(wf) => {
          handleSendMessage(`Execute workflow "${wf.name}": ${wf.description}`, 'agent');
          setWorkflows(prev => prev.map(w => w.id === wf.id ? { ...w, lastRun: Date.now() } : w));
        }}
        models={models}
        selectedModelId={selectedModelId}
        onSelectModel={handleSelectModel}
        onAddModel={(m) => setModels(prev => [...prev, { ...m, id: `model-${Date.now()}` }])}
        onSetDefaultModelForCategory={handleSetDefaultModelForCategory}
        autoRoutingEnabled={settings.autoRoutingEnabled}
        onToggleAutoRouting={() => setSettings(prev => ({ ...prev, autoRoutingEnabled: !prev.autoRoutingEnabled }))}
        knowledgeSources={knowledgeSources}
        onAddKnowledgeSource={(ks) => setKnowledgeSources(prev => [...prev, { ...ks, id: `ks-${Date.now()}`, lastSynced: Date.now() }])}
        onDeleteKnowledgeSource={(id) => setKnowledgeSources(prev => prev.filter(k => k.id !== id))}
        files={files}
        onDeleteFile={(id) => setFiles(prev => prev.filter(f => f.id !== id))}
        onRenameFile={(id, newName) => setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f))}
        onUploadFile={(file) => {
          const newF: WorkbenchFile = {
            id: `file-${Date.now()}`,
            name: file.name,
            type: 'uploaded',
            fileType: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.xlsx') ? 'excel' : file.name.endsWith('.py') ? 'code' : 'word',
            sizeBytes: file.size,
            createdAt: Date.now(),
            previewSnippet: `Uploaded document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
          };
          setFiles(prev => [newF, ...prev]);
        }}
        sandboxJobs={sandboxJobs}
        sandboxLogs={sandboxLogs}
        onKillSandboxJob={(id) => setSandboxJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'killed' } : j))}
        securityAudit={securityAudit}
        settings={settings}
        onSaveSettings={setSettings}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onExportBackup={() => {
          const data = storageService.exportFullBackup();
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `sentinel_sovereign_backup_${Date.now()}.json`;
          a.click();
        }}
        onImportBackup={(jsonStr) => {
          const ok = storageService.importBackup(jsonStr);
          if (ok) {
            setConversations(storageService.getConversations());
            setProjects(storageService.getProjects());
            setTools(storageService.getTools());
            setWorkflows(storageService.getWorkflows());
            setModels(storageService.getModels());
            setKnowledgeSources(storageService.getKnowledgeSources());
            setFiles(storageService.getFiles());
          }
          return ok;
        }}
        onResetWorkspace={() => {
          storageService.resetToDefaults();
          setConversations(storageService.getConversations());
          setProjects(storageService.getProjects());
          setTools(storageService.getTools());
          setWorkflows(storageService.getWorkflows());
          setModels(storageService.getModels());
          setKnowledgeSources(storageService.getKnowledgeSources());
          setFiles(storageService.getFiles());
          setSandboxJobs(storageService.getSandboxJobs());
          setSandboxLogs(storageService.getSandboxLogs());
          setSecurityAudit(storageService.getSecurityAudit());
        }}
      />

      {/* 3. Main Stage: Chat Header + Message Stream / Centered Empty State + Prompt Bar + Footer (Unchanged) */}
      <main className="flex-1 flex flex-col h-full bg-[#1e1e1e] relative overflow-hidden">
        {/* Top Header */}
        <ChatHeader
          conversation={activeConversation}
          models={models}
          selectedModel={currentModel}
          onSelectModel={handleSelectModel}
          projects={projects}
          onNewChat={() => handleNewTask()}
          onDuplicateChat={() => handleDuplicateChat()}
          isSearchOpen={isInChatSearchOpen}
          onToggleSearch={() => setIsInChatSearchOpen(!isInChatSearchOpen)}
          searchQuery={inChatSearchQuery}
          onSearchQueryChange={setInChatSearchQuery}
          currentMatchIndex={currentSearchMatchIndex}
          totalMatches={0}
          onNextMatch={() => {}}
          onPrevMatch={() => {}}
          wsStatus={wsStatus}
        />

        {/* Middle Message / Empty Stage */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <MessageList
            conversation={activeConversation}
            selectedModel={currentModel}
            activeMode={activeMode}
            onSendMessage={handleSendMessage}
            onRegenerateLastMessage={handleRegenerateLastMessage}
            isStreaming={isStreaming}
            searchQuery={inChatSearchQuery}
            activeMatchIndex={currentSearchMatchIndex}
            renderCenteredPromptInput={
              !hasMessages ? (
                <PromptInputBar
                  onSendMessage={handleSendMessage}
                  isStreaming={isStreaming}
                  onStopStreaming={handleStopStreaming}
                  selectedModel={currentModel}
                  activeMode={activeMode}
                  isCentered={true}
                />
              ) : undefined
            }
          />

          {/* If there are messages, render the prompt bar docked at the bottom */}
          {hasMessages && (
            <div className="w-full bg-gradient-to-t from-[#1e1e1e] via-[#1e1e1e] to-transparent pt-2">
              <PromptInputBar
                onSendMessage={handleSendMessage}
                isStreaming={isStreaming}
                onStopStreaming={handleStopStreaming}
                selectedModel={currentModel}
                activeMode={activeMode}
                isCentered={false}
              />
            </div>
          )}
        </div>

        {/* Footer matching reference design */}
        <footer className="py-2.5 px-4 text-center text-[11px] text-zinc-500 bg-[#1e1e1e] select-none flex-shrink-0">
          <span>Sentinel v0.8.7 - Every AI for Everyone.</span>
          <span className="mx-2 text-zinc-600">·</span>
          <a href="#" className="hover:underline hover:text-zinc-400">Privacy policy</a>
          <span className="mx-1 text-zinc-600">|</span>
          <a href="#" className="hover:underline hover:text-zinc-400">Terms of service</a>
        </footer>
      </main>
    </div>
  );
}
