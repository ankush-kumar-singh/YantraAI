import React from 'react';
import { Conversation, Project } from '../types';
import { Brain, X, Cpu, HardDrive, ShieldCheck, Sparkles } from 'lucide-react';

interface BrainMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  projects: Project[];
}

export const BrainMemoryModal: React.FC<BrainMemoryModalProps> = ({
  isOpen,
  onClose,
  conversations,
  projects,
}) => {
  if (!isOpen) return null;

  const totalMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0);
  const totalAgentRuns = conversations.filter(c => c.mode === 'agent').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#141414] border border-[#262626] shadow-2xl text-zinc-200 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 font-heading">
                Odysseus Brain & Memory Matrix
              </h2>
              <p className="text-xs text-zinc-400">
                Vector memory, contextual embeddings, and session state.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-[#222222] border border-transparent hover:border-[#2e2e2e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 bg-[#141414]">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] text-center">
              <span className="text-xl font-bold text-rose-400 font-mono">{conversations.length}</span>
              <p className="text-[11px] text-zinc-400 mt-1">Active Sessions</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] text-center">
              <span className="text-xl font-bold text-amber-400 font-mono">{totalMessages}</span>
              <p className="text-[11px] text-zinc-400 mt-1">Indexed Messages</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] text-center">
              <span className="text-xl font-bold text-emerald-400 font-mono">{totalAgentRuns}</span>
              <p className="text-[11px] text-zinc-400 mt-1">Agent Traces</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-zinc-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Local Memory Isolation Guarantee</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              All memory indices and conversation vectors stay 100% inside your browser environment and local LLM runtime. No telemetry or embeddings are transmitted to external servers.
            </p>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-[#262626] bg-[#181818] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] border border-[#2e2e2e] text-xs font-semibold text-zinc-200 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
