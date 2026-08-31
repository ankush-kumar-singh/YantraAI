import React, { useState } from 'react';
import { 
  Model, 
  Project, 
  Conversation 
} from '../types';
import { ProviderIcon } from './ProviderIcon';
import { 
  ChevronDown, 
  Copy, 
  Plus, 
  Bookmark, 
  Search, 
  X, 
  ChevronUp, 
  Edit3 
} from 'lucide-react';

interface ChatHeaderProps {
  conversation: Conversation | null;
  models: Model[];
  selectedModel: Model;
  onSelectModel: (modelId: string) => void;
  projects: Project[];
  onNewChat: () => void;
  onDuplicateChat?: () => void;
  
  // In-Chat Search State & Handlers
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  currentMatchIndex: number;
  totalMatches: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  wsStatus?: { connected: boolean; useSimulator: boolean };
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  models,
  selectedModel,
  onSelectModel,
  projects,
  onNewChat,
  onDuplicateChat,
  isSearchOpen,
  onToggleSearch,
  searchQuery,
  onSearchQueryChange,
  currentMatchIndex,
  totalMatches,
  onNextMatch,
  onPrevMatch,
  wsStatus,
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  return (
    <header className="h-13 bg-[#1e1e1e] border-b border-[#2a2a2a] px-4 flex items-center justify-between z-20 select-none flex-shrink-0">
      {/* Left: Model Selector Pill + Duplicate + New Chat (Reference Match) */}
      <div className="flex items-center space-x-2">
        {/* Model Selector Pill Button */}
        <div className="relative">
          <button
            type="button"
            id="header-model-selector-pill"
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#262626] hover:bg-[#303030] text-zinc-100 font-medium text-xs border border-[#333333] transition-colors shadow-sm"
          >
            <ProviderIcon provider={selectedModel.provider} name={selectedModel.name} className="w-4 h-4" />
            <span className="font-semibold">{selectedModel.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Model Switcher Dropdown */}
          {isModelDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsModelDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-1.5 w-64 rounded-xl bg-[#242424] border border-[#383838] shadow-2xl p-1.5 z-50 animate-fade-in text-xs">
                <p className="px-2 py-1 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Select AI Model</p>
                {models.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSelectModel(m.id);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-left transition-colors ${
                      selectedModel.id === m.id ? 'bg-[#333333] text-white font-medium' : 'hover:bg-[#2c2c2c] text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <ProviderIcon provider={m.provider} name={m.name} className="w-4 h-4" />
                      <span className="truncate">{m.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0 ml-2">{m.provider}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Duplicate / Branch Chat Icon Button */}
        <button
          type="button"
          onClick={onDuplicateChat || onNewChat}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
          title="Duplicate or branch conversation"
        >
          {/* Custom Dual Rectangle Fork/Duplicate icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>

        {/* Plus / New Chat Icon Button */}
        <button
          type="button"
          onClick={onNewChat}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
          title="New chat (⌘N)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Right: In-Chat Search / Bookmark / Connection Status */}
      <div className="flex items-center space-x-3">
        {/* WebSocket Connection Status Symbol */}
        {wsStatus && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-[#262626] border border-[#333] text-[10px] text-zinc-400 font-mono font-semibold select-none shadow-sm transition-colors">
            <span className={`w-2 h-2 rounded-full ${
              wsStatus.connected 
                ? 'bg-emerald-500 animate-pulse border border-emerald-400' 
                : wsStatus.useSimulator 
                  ? 'bg-amber-500 border border-amber-400' 
                  : 'bg-rose-500 animate-ping border border-rose-400'
            }`} />
            <span>
              {wsStatus.connected 
                ? 'CONNECTED' 
                : wsStatus.useSimulator 
                  ? 'SIMULATION' 
                  : 'RECONNECTING'}
            </span>
          </div>
        )}

        {isSearchOpen ? (
          <div className="flex items-center bg-[#171717] border border-[#3a3a3a] rounded-xl px-2.5 py-1 text-xs space-x-2">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              autoFocus
              placeholder="Find in chat..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="bg-transparent text-white placeholder-zinc-500 focus:outline-none w-32 sm:w-44 text-xs"
            />
            {totalMatches > 0 && (
              <span className="text-[10px] text-zinc-400 font-mono">
                {currentMatchIndex + 1}/{totalMatches}
              </span>
            )}
            <button
              type="button"
              onClick={onPrevMatch}
              className="p-0.5 rounded hover:bg-[#2a2a2a] text-zinc-400 hover:text-white"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onNextMatch}
              className="p-0.5 rounded hover:bg-[#2a2a2a] text-zinc-400 hover:text-white"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onToggleSearch}
              className="p-0.5 rounded hover:bg-[#2a2a2a] text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleSearch}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
            title="Search in current chat (⌘F)"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
          title="Bookmark conversation"
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
