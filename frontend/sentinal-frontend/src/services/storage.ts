/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Conversation, 
  Project, 
  ToolDefinition, 
  Model, 
  AppSettings, 
  ThemeMode,
  AgentWorkflowTemplate,
  KnowledgeSource,
  WorkbenchFile,
  SandboxJob,
  SandboxExecutionLog,
  SecurityAuditItem
} from '../types';
import { 
  DEFAULT_MODELS, 
  DEFAULT_PROJECTS, 
  DEFAULT_TOOLS, 
  SEED_CONVERSATIONS, 
  DEFAULT_SETTINGS,
  DEFAULT_WORKFLOWS,
  DEFAULT_KNOWLEDGE_SOURCES,
  DEFAULT_FILES,
  DEFAULT_SANDBOX_JOBS,
  DEFAULT_SANDBOX_LOGS,
  DEFAULT_SECURITY_AUDIT
} from '../data/initialData';

const STORAGE_KEYS = {
  CONVERSATIONS: 'sovereign_conversations_v2',
  ACTIVE_CONV_ID: 'sovereign_active_conv_id_v2',
  PROJECTS: 'sovereign_projects_v2',
  TOOLS: 'sovereign_tools_v2',
  WORKFLOWS: 'sovereign_workflows_v2',
  MODELS: 'sovereign_models_v2',
  KNOWLEDGE: 'sovereign_knowledge_v2',
  FILES: 'sovereign_files_v2',
  SANDBOX_JOBS: 'sovereign_sandbox_jobs_v2',
  SANDBOX_LOGS: 'sovereign_sandbox_logs_v2',
  SECURITY_AUDIT: 'sovereign_security_audit_v2',
  SETTINGS: 'sovereign_settings_v2',
  THEME: 'sovereign_theme_v2',
};

export const storageService = {
  // ==========================================
  // Conversations API
  // ==========================================
  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (!data) {
        this.saveConversations(SEED_CONVERSATIONS);
        return SEED_CONVERSATIONS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load conversations from localStorage', e);
      return SEED_CONVERSATIONS;
    }
  },

  async fetchConversationsFromServer(): Promise<Conversation[]> {
    const res = await fetch('/api/conversations');
    if (!res.ok) throw new Error('Failed to fetch conversations from server');
    const data = await res.json();
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache server conversations to localStorage', e);
    }
    return data;
  },

  saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to localStorage', e);
    }

    fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversations)
    }).catch(err => console.warn('REST API saveConversations failed:', err));
  },

  getActiveConversationId(): string | null {
    try {
      const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_CONV_ID);
      return id || (SEED_CONVERSATIONS[0]?.id ?? null);
    } catch {
      return null;
    }
  },

  saveActiveConversationId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONV_ID, id);
    } catch (e) {
      console.error('Failed to save active conversation id', e);
    }
  },

  // ==========================================
  // Projects API
  // ==========================================
  getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!data) {
        this.saveProjects(DEFAULT_PROJECTS);
        return DEFAULT_PROJECTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_PROJECTS;
    }
  },

  async fetchProjectsFromServer(): Promise<Project[]> {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch projects from server');
    const data = await res.json();
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache projects to localStorage', e);
    }
    return data;
  },

  saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects', e);
    }

    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projects)
    }).catch(err => console.warn('REST API saveProjects failed:', err));
  },

  // ==========================================
  // Tools API
  // ==========================================
  getTools(): ToolDefinition[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOOLS);
      if (!data) {
        this.saveTools(DEFAULT_TOOLS);
        return DEFAULT_TOOLS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_TOOLS;
    }
  },

  async fetchToolsFromServer(): Promise<ToolDefinition[]> {
    const res = await fetch('/api/tools');
    if (!res.ok) throw new Error('Failed to fetch tools from server');
    const data = await res.json();
    try {
      localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache tools to localStorage', e);
    }
    return data;
  },

  saveTools(tools: ToolDefinition[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(tools));
    } catch (e) {
      console.error('Failed to save tools', e);
    }

    fetch('/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tools)
    }).catch(err => console.warn('REST API saveTools failed:', err));
  },

  // ==========================================
  // Workflows Registry
  // ==========================================
  getWorkflows(): AgentWorkflowTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
      if (!data) {
        this.saveWorkflows(DEFAULT_WORKFLOWS);
        return DEFAULT_WORKFLOWS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_WORKFLOWS;
    }
  },

  saveWorkflows(workflows: AgentWorkflowTemplate[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
    } catch (e) {
      console.error('Failed to save workflows', e);
    }
  },

  // ==========================================
  // Models API
  // ==========================================
  getModels(): Model[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MODELS);
      if (!data) {
        this.saveModels(DEFAULT_MODELS);
        return DEFAULT_MODELS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_MODELS;
    }
  },

  async fetchModelsFromServer(): Promise<Model[]> {
    const res = await fetch('/api/models');
    if (!res.ok) throw new Error('Failed to fetch models from server');
    const data = await res.json();
    try {
      localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache models to localStorage', e);
    }
    return data;
  },

  saveModels(models: Model[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(models));
    } catch (e) {
      console.error('Failed to save models', e);
    }

    fetch('/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(models)
    }).catch(err => console.warn('REST API saveModels failed:', err));
  },

  // ==========================================
  // Knowledge Sources API
  // ==========================================
  getKnowledgeSources(): KnowledgeSource[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE);
      if (!data) {
        this.saveKnowledgeSources(DEFAULT_KNOWLEDGE_SOURCES);
        return DEFAULT_KNOWLEDGE_SOURCES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_KNOWLEDGE_SOURCES;
    }
  },

  async fetchKnowledgeSourcesFromServer(): Promise<KnowledgeSource[]> {
    const res = await fetch('/api/kb/sources');
    if (!res.ok) throw new Error('Failed to fetch knowledge sources from server');
    const data = await res.json();
    try {
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache knowledge sources to localStorage', e);
    }
    return data;
  },

  saveKnowledgeSources(sources: KnowledgeSource[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(sources));
    } catch (e) {
      console.error('Failed to save knowledge sources', e);
    }

    fetch('/api/kb/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sources)
    }).catch(err => console.warn('REST API saveKnowledgeSources failed:', err));
  },

  // ==========================================
  // Files / Deliverables API
  // ==========================================
  getFiles(): WorkbenchFile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FILES);
      if (!data) {
        this.saveFiles(DEFAULT_FILES);
        return DEFAULT_FILES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_FILES;
    }
  },

  saveFiles(files: WorkbenchFile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
    } catch (e) {
      console.error('Failed to save files', e);
    }
  },

  // ==========================================
  // Isolated Sandbox API
  // ==========================================
  getSandboxJobs(): SandboxJob[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SANDBOX_JOBS);
      if (!data) {
        this.saveSandboxJobs(DEFAULT_SANDBOX_JOBS);
        return DEFAULT_SANDBOX_JOBS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_SANDBOX_JOBS;
    }
  },

  saveSandboxJobs(jobs: SandboxJob[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SANDBOX_JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.error('Failed to save sandbox jobs', e);
    }
  },

  getSandboxLogs(): SandboxExecutionLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SANDBOX_LOGS);
      if (!data) {
        this.saveSandboxLogs(DEFAULT_SANDBOX_LOGS);
        return DEFAULT_SANDBOX_LOGS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_SANDBOX_LOGS;
    }
  },

  saveSandboxLogs(logs: SandboxExecutionLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SANDBOX_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save sandbox logs', e);
    }
  },

  // ==========================================
  // Security Auditing API
  // ==========================================
  getSecurityAudit(): SecurityAuditItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SECURITY_AUDIT);
      if (!data) {
        this.saveSecurityAudit(DEFAULT_SECURITY_AUDIT);
        return DEFAULT_SECURITY_AUDIT;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_SECURITY_AUDIT;
    }
  },

  async fetchSecurityAuditFromServer(): Promise<SecurityAuditItem[]> {
    const res = await fetch('/api/security/audit-log');
    if (!res.ok) throw new Error('Failed to fetch security audit log from server');
    const data = await res.json();
    try {
      localStorage.setItem(STORAGE_KEYS.SECURITY_AUDIT, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache security audit to localStorage', e);
    }
    return data;
  },

  saveSecurityAudit(items: SecurityAuditItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SECURITY_AUDIT, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save security audit', e);
    }

    fetch('/api/security/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items)
    }).catch(err => console.warn('REST API saveSecurityAudit failed:', err));
  },

  // ==========================================
  // App Settings API
  // ==========================================
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async fetchSettingsFromServer(): Promise<AppSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings from server');
    const data = await res.json();
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache settings to localStorage', e);
    }
    return { ...DEFAULT_SETTINGS, ...data };
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }

    fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).catch(err => console.warn('REST API saveSettings failed:', err));
  },

  // ==========================================
  // Pure-UI Local Preferences (localStorage ONLY)
  // ==========================================
  getTheme(): ThemeMode {
    try {
      const theme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
      return theme || 'dark';
    } catch {
      return 'dark';
    }
  },

  saveTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  },

  // ==========================================
  // Workspace Backup & Recovery
  // ==========================================
  exportFullBackup(): string {
    const backup = {
      version: '2.0-sovereign',
      exportedAt: new Date().toISOString(),
      conversations: this.getConversations(),
      projects: this.getProjects(),
      tools: this.getTools(),
      workflows: this.getWorkflows(),
      models: this.getModels(),
      knowledgeSources: this.getKnowledgeSources(),
      files: this.getFiles(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.conversations) this.saveConversations(parsed.conversations);
      if (parsed.projects) this.saveProjects(parsed.projects);
      if (parsed.tools) this.saveTools(parsed.tools);
      if (parsed.workflows) this.saveWorkflows(parsed.workflows);
      if (parsed.models) this.saveModels(parsed.models);
      if (parsed.knowledgeSources) this.saveKnowledgeSources(parsed.knowledgeSources);
      if (parsed.files) this.saveFiles(parsed.files);
      if (parsed.settings) this.saveSettings(parsed.settings);
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  },

  resetToDefaults(): void {
    localStorage.clear();
    this.saveConversations(SEED_CONVERSATIONS);
    this.saveProjects(DEFAULT_PROJECTS);
    this.saveTools(DEFAULT_TOOLS);
    this.saveWorkflows(DEFAULT_WORKFLOWS);
    this.saveModels(DEFAULT_MODELS);
    this.saveKnowledgeSources(DEFAULT_KNOWLEDGE_SOURCES);
    this.saveFiles(DEFAULT_FILES);
    this.saveSandboxJobs(DEFAULT_SANDBOX_JOBS);
    this.saveSandboxLogs(DEFAULT_SANDBOX_LOGS);
    this.saveSecurityAudit(DEFAULT_SECURITY_AUDIT);
    this.saveSettings(DEFAULT_SETTINGS);
    this.saveTheme('dark');
  }
};
