import React, { useState, useEffect } from 'react';
import { Conversation } from '../types';
import { Search, MessageSquare, Compass, ArrowRight, X, Clock } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  conversations,
  onSelectConversation,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = conversations.filter(c => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchesTitle = c.title.toLowerCase().includes(q);
    const matchesMessages = c.messages.some(m => m.content.toLowerCase().includes(q));
    return matchesTitle || matchesMessages;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#141414] border border-[#262626] shadow-2xl text-zinc-200 overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#262626] bg-[#181818]">
          <Search className="w-5 h-5 text-rose-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            id="global-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations, code blocks, or agent steps..."
            autoFocus
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#222222]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Feed */}
        <div className="p-3 overflow-y-auto space-y-1 divide-y divide-[#222222] flex-1 bg-[#141414]">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">
              No conversations matching &quot;{query}&quot;
            </div>
          ) : (
            results.map(conv => (
              <button
                key={conv.id}
                type="button"
                onClick={() => {
                  onSelectConversation(conv.id);
                  onClose();
                }}
                className="w-full p-3 rounded-xl hover:bg-[#1c1c1c] border border-transparent hover:border-[#262626] transition-colors flex items-start justify-between text-left group"
              >
                <div className="space-y-1 flex-1 pr-3">
                  <div className="flex items-center space-x-2">
                    {conv.mode === 'agent' ? (
                      <Compass className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-zinc-100 font-heading group-hover:text-rose-300 transition-colors">
                      {conv.title}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-zinc-400 line-clamp-1">
                    {conv.messages[0]?.content || 'Empty session'}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-zinc-500 font-mono">
                  <span className="hidden sm:inline">{new Date(conv.updatedAt).toLocaleDateString()}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-rose-400 transition-opacity" />
                </div>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-[#262626] bg-[#111111] text-[11px] text-zinc-500 font-mono flex items-center justify-between">
          <span>Navigate with mouse or tap</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
