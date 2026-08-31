import React, { useState } from 'react';
import { Sparkles, X, Globe, Search, CheckCircle2, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface DeepResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartResearch: (topic: string) => void;
}

export const DeepResearchModal: React.FC<DeepResearchModalProps> = ({
  isOpen,
  onClose,
  onStartResearch,
}) => {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<'standard' | 'deep' | 'exhaustive'>('deep');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onStartResearch(`[Deep Research • ${depth.toUpperCase()}] ${topic.trim()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#141414] border border-[#262626] shadow-2xl text-zinc-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 font-heading">
                Odysseus Deep Research Engine
              </h2>
              <p className="text-xs text-zinc-400">
                Multi-hop query decomposition, cross-verification, and comprehensive synthesis.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[#141414]">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
              Research Objective / Topic
            </label>
            <textarea
              id="input-research-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Compare Quantization Techniques for 70B LLMs (AWQ vs GPTQ vs EXL2) and benchmark memory efficiency."
              rows={3}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e0e] border border-[#262626] text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
              Investigation Depth
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDepth('standard')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  depth === 'standard' ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-bold' : 'bg-[#181818] border-[#262626] text-zinc-400 hover:border-[#383838]'
                }`}
              >
                Standard (3-5 hops)
              </button>
              <button
                type="button"
                onClick={() => setDepth('deep')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  depth === 'deep' ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-bold' : 'bg-[#181818] border-[#262626] text-zinc-400 hover:border-[#383838]'
                }`}
              >
                Deep (8-12 hops)
              </button>
              <button
                type="button"
                onClick={() => setDepth('exhaustive')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  depth === 'exhaustive' ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-bold' : 'bg-[#181818] border-[#262626] text-zinc-400 hover:border-[#383838]'
                }`}
              >
                Exhaustive (Full graph)
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] text-xs text-zinc-400 space-y-1">
            <div className="flex items-center space-x-1.5 text-zinc-300 font-medium">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Multi-Source Evaluation Pipeline:</span>
            </div>
            <p className="text-[11px]">
              The agent will dispatch multi-step search queries, evaluate citation authenticity, verify code assertions in sandbox, and generate a full research monograph.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] border border-[#2e2e2e] text-xs font-medium text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md flex items-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Deep Research</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
