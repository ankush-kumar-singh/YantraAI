import React, { useState } from 'react';
import { 
  SquarePen, 
  MessageSquare, 
  Folder, 
  Wrench, 
  Brain, 
  BookOpen, 
  FileText, 
  Terminal, 
  ShieldCheck, 
  FileCode2, 
  Settings,
  Sun,
  Moon,
  ShieldAlert
} from 'lucide-react';
import { ThemeMode, Model } from '../types';

export type ActiveNavTab = 
  | 'chats' 
  | 'projects' 
  | 'tools' 
  | 'models' 
  | 'knowledge' 
  | 'files' 
  | 'sandbox' 
  | 'security' 
  | 'notes' 
  | 'settings';

interface OdysseusRailProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  onNewTask: () => void;
  isSecondarySidebarOpen: boolean;
  onToggleSecondarySidebar: () => void;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  activeModel?: Model;
  activeToolsCount?: number;
  hasRunningJobs?: boolean;
  isSecurityBlocked?: boolean;
  userRole?: string;
  userName?: string;
}

export const OdysseusRail: React.FC<OdysseusRailProps> = ({
  activeTab,
  onSelectTab,
  onNewTask,
  isSecondarySidebarOpen,
  onToggleSecondarySidebar,
  currentTheme,
  onToggleTheme,
  onOpenSettings,
  activeModel,
  activeToolsCount = 7,
  hasRunningJobs = false,
  isSecurityBlocked = false,
  userRole = 'Lead Engineer',
  userName = 'Alex Mercer',
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleTabClick = (tab: ActiveNavTab) => {
    if (!isSecondarySidebarOpen) {
      onToggleSecondarySidebar();
    }
    onSelectTab(tab);
  };

  return (
    <aside 
      className="relative flex flex-col justify-between items-center w-14 h-full bg-[#121212] border-r border-[#222222] select-none z-30 flex-shrink-0 py-2.5"
      id="main-navigation-rail"
    >
      {/* Top Action Icons (12 icons strictly ordered according to spec) */}
      <div className="flex flex-col items-center space-y-1 w-full">
        {/* 1. Sidebar Collapse/Expand Toggle */}
        <button
          type="button"
          id="btn-toggle-sidebar"
          onClick={onToggleSecondarySidebar}
          className={`p-2 rounded-xl transition-colors ${
            isSecondarySidebarOpen 
              ? 'text-zinc-200 hover:bg-[#202020]' 
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#202020]'
          }`}
          title={isSecondarySidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="4" />
            <path d="M9 3v18" />
          </svg>
        </button>

        {/* 2. New Task (Pencil-Square) */}
        <button
          type="button"
          id="btn-rail-new-task"
          onClick={onNewTask}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-[#202020] transition-colors relative"
          title="New Task (⌘N)"
        >
          <SquarePen className="w-4.5 h-4.5" />
        </button>

        {/* 3. Chats (Speech Bubble) */}
        <button
          type="button"
          id="btn-rail-chats"
          onClick={() => handleTabClick('chats')}
          className={`p-2 rounded-xl transition-colors relative ${
            isSecondarySidebarOpen && activeTab === 'chats'
              ? 'bg-[#242424] text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#202020]'
          }`}
          title="Chats & History"
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>

        {/* 4. Projects (Folder) */}
        <button
          type="button"
          id="btn-rail-projects"
          onClick={() => handleTabClick('projects')}
          className={`p-2 rounded-xl transition-colors ${
            isSecondarySidebarOpen && activeTab === 'projects'
              ? 'bg-[#242424] text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#202020]'
          }`}
          title="Project Workspaces"
        >
          <Folder className="w-4.5 h-4.5" />
        </button>

        {/* 5. Agents & Tools (Wrench / Toolbox) */}
        <button
          type="button"
          id="btn-rail-tools"
          onClick={() => handleTabClick('tools')}
          className={`p-2 rounded-xl transition-colors relative ${
            isSecondarySidebarOpen && activeTab === 'tools'
              ? 'bg-[#242424] text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#202020]'
          }`}
          title="Agents & Tools Registry"
        >
          <Wrench className="w-4.5 h-4.5" />
          {activeToolsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono flex items-center justify-center font-bold">
              {activeToolsCount}
            </span>
          )}
        </button>

        {/* 6. Models (Brain) */}
        <button
          type="button"
          id="btn-rail-models"
          onClick={() => handleTabClick('models')}
          className={`p-2 rounded-xl transition-colors relative ${
            isSecondarySidebarOpen && activeTab === 'models'
              ? 'bg-[#242424] text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#202020]'
          }`}
          title="Model Registry (Reasoning, Coding, OCR, Vision)"
        >
          <Brain className="w-4.5 h-4.5" />
          {/* Active Model Color Swatch Indicator Dot */}
          <span 
            className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full border border-black shadow"
            style={{ backgroundColor: activeModel?.colorSwatch || '#6366f1' }}
            title={`Active Model: ${activeModel?.name || 'Qwen-72B'}`}
          />
        </button>

        {/* 7. Knowledge Base (Book / Database) */}
        <button
          type="button"
          id="btn-rail-knowledge"
          onClick={() => handleTabClick('knowledge')}
          className={`p-2 rounded-xl transition-colors relative ${
            isSecondarySidebarOpen && activeTab === 'knowledge'
              ? 'bg-[#242424] text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#202020]'
          }`}
          title="Knowledge Base & Local Vector DB"
        >
          <BookOpen className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" title="Vector DB Synced" />
        </button>

        {/* 8. Files (Document) */}
        <button
          type="button"
          id="btn-rail-files"
          onClick={() => handleTabClick('files')}
          className={`p-2 rounded-xl transition-colors relative ${
            isSecondarySidebarOpen && activeTab === 'files'
              ? 'bg-[#242424] text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#202020]'
          }`}
          title="Files (Generated Deliverables & Uploads)"
        >
          <FileText className="w-4.5 h-4.5" />
        </button>

        {/* 9. Sandbox (Terminal / Box) */}
        <button
          type="button"
          id="btn-rail-sandbox"
          onClick={() => handleTabClick('sandbox')}
          className={`p-2 rounded-xl transition-colors relative ${
            isSecondarySidebarOpen && activeTab === 'sandbox'
              ? 'bg-[#242424] text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#202020]'
          }`}
          title="Isolated Code Execution Sandbox"
        >
          <Terminal className="w-4.5 h-4.5" />
          <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${hasRunningJobs ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
        </button>

        {/* 10. Security (Shield) */}
        <button
          type="button"
          id="btn-rail-security"
          onClick={() => handleTabClick('security')}
          className={`p-2 rounded-xl transition-colors relative ${
            isSecondarySidebarOpen && activeTab === 'security'
              ? 'bg-[#242424] text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#202020]'
          }`}
          title="Security & Air-Gap Proof"
        >
          {isSecurityBlocked ? (
            <ShieldAlert className="w-4.5 h-4.5 text-rose-400" />
          ) : (
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
          )}
          <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${isSecurityBlocked ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
        </button>

        {/* 11. Notes (Pencil / Notepad) */}
        <button
          type="button"
          id="btn-rail-notes"
          onClick={() => handleTabClick('notes')}
          className={`p-2 rounded-xl transition-colors ${
            isSecondarySidebarOpen && activeTab === 'notes'
              ? 'bg-[#242424] text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#202020]'
          }`}
          title="Workspace Notes & Scratchpad"
        >
          <FileCode2 className="w-4.5 h-4.5" />
        </button>

        {/* 12. Settings (Gear) */}
        <button
          type="button"
          id="btn-rail-settings"
          onClick={() => handleTabClick('settings')}
          className={`p-2 rounded-xl transition-colors ${
            isSecondarySidebarOpen && activeTab === 'settings'
              ? 'bg-[#242424] text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#202020]'
          }`}
          title="Workbench Settings & Roles"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Bottom Profile Avatar & Role Badge */}
      <div className="relative flex flex-col items-center">
        <button
          type="button"
          id="user-profile-button"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-xs transition-transform active:scale-95 shadow-md relative"
          title={`User: ${userName} (${userRole})`}
        >
          <span>{userName.split(' ').map(n => n[0]).join('').substring(0, 2) || 'SE'}</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#121212]" />
        </button>

        {/* User / Settings Popup Menu */}
        {isProfileMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
            <div className="absolute bottom-full left-10 mb-2 w-64 rounded-2xl bg-[#1c1c1c] border border-[#2e2e2e] shadow-2xl p-2 z-50 animate-fade-in text-zinc-200">
              <div className="px-3 py-2 border-b border-[#2a2a2a] mb-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">{userName}</p>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono border border-blue-500/30">
                    {userRole}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">Sovereign Air-Gapped Node</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onOpenSettings();
                  setIsProfileMenuOpen(false);
                }}
                className="flex items-center space-x-2.5 w-full px-3 py-2 rounded-xl text-xs hover:bg-[#282828] text-zinc-300 hover:text-white transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                <span>Preferences & Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                  setIsProfileMenuOpen(false);
                }}
                className="flex items-center space-x-2.5 w-full px-3 py-2 rounded-xl text-xs hover:bg-[#282828] text-zinc-300 hover:text-white transition-colors text-left"
              >
                {currentTheme === 'light' ? <Moon className="w-4 h-4 text-zinc-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                <span>Toggle Theme ({currentTheme})</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
