import React, { useEffect, useRef, useState } from 'react';
import { 
  Message, 
  Model, 
  ChatMode, 
  Conversation 
} from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AgentPhaseViewer } from './AgentPhaseViewer';
import { ProviderIcon } from './ProviderIcon';
import { 
  Copy, 
  Check, 
  RotateCw, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  User 
} from 'lucide-react';

interface MessageListProps {
  conversation: Conversation | null;
  selectedModel: Model;
  activeMode: ChatMode;
  onSendMessage: (text: string, mode: ChatMode) => void;
  onRegenerateLastMessage?: () => void;
  isStreaming?: boolean;
  searchQuery?: string;
  activeMatchIndex?: number;
  renderCenteredPromptInput?: React.ReactNode;
}

export const MessageList: React.FC<MessageListProps> = ({
  conversation,
  selectedModel,
  activeMode,
  onSendMessage,
  onRegenerateLastMessage,
  isStreaming,
  searchQuery,
  activeMatchIndex,
  renderCenteredPromptInput,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, isStreaming]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const messages = conversation?.messages || [];

  // Empty State matching the exact reference screenshot
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center space-y-4 animate-fade-in">
          {/* Centered Glowing Feather Logo + Title */}
          <div className="flex items-center space-x-3.5">
            <ProviderIcon provider="Custom" name="Sentinel" size={40} className="w-10 h-10 drop-shadow-md" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-heading">
              Sentinel
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-zinc-400 font-normal">
            Contact: Sentinel
          </p>

          {/* Centered Floating Prompt Input Capsule */}
          <div className="w-full pt-4">
            {renderCenteredPromptInput}
          </div>
        </div>
      </div>
    );
  }

  // Active message stream
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl w-full mx-auto">
      {messages.map((message, index) => {
        const isUser = message.role === 'user';
        const isLastAssistant = !isUser && index === messages.length - 1;

        return (
          <div
            key={message.id}
            className={`flex flex-col space-y-2 group animate-fade-in ${
              isUser ? 'items-end' : 'items-start'
            }`}
          >
            {/* Message Author Header */}
            <div className="flex items-center space-x-2 text-xs text-zinc-400 select-none px-1">
              {!isUser ? (
                <>
                  <ProviderIcon 
                    provider={selectedModel.provider} 
                    name={message.modelId || selectedModel.name} 
                    className="w-4 h-4" 
                  />
                  <span className="font-semibold text-zinc-200">
                    {message.modelId || selectedModel.name}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-medium text-zinc-400">You</span>
                  <div className="w-5 h-5 rounded-full bg-[#467f37] text-white flex items-center justify-center text-[10px] font-semibold">
                    Li
                  </div>
                </>
              )}
            </div>

            {/* Message Body */}
            <div
              className={`w-full rounded-2xl transition-all ${
                isUser
                  ? 'bg-[#2a2a2a] text-zinc-100 px-4 py-3 max-w-xl self-end text-sm leading-relaxed border border-[#333333]'
                  : 'bg-transparent text-zinc-200 px-1 py-1 max-w-full text-sm leading-relaxed'
              }`}
            >
              {/* Agent Run Viewer if in Agent Mode */}
              {message.agentRun && (
                <div className="mb-4">
                  <AgentPhaseViewer agentRun={message.agentRun} />
                </div>
              )}

              {/* Attachments if any */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {message.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-[#1f1f1f] border border-[#333] text-xs text-zinc-300"
                    >
                      {att.previewUrl ? (
                        <img src={att.previewUrl} alt={att.name} className="w-4 h-4 rounded object-cover" />
                      ) : (
                        <span className="text-blue-400 font-mono">#</span>
                      )}
                      <span className="truncate max-w-[120px]">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Markdown Content */}
              <MarkdownRenderer content={message.content} />

              {/* Streaming Indicator */}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-zinc-400 animate-pulse align-middle" />
              )}
            </div>

            {/* Message Action Bar (Copy, Regenerate, Thumbs) for Assistant messages */}
            {!isUser && !message.isStreaming && (
              <div className="flex items-center space-x-1 px-1 text-zinc-500 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleCopy(message.id, message.content)}
                  className="p-1 rounded-md hover:bg-[#282828] hover:text-zinc-300 transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedId === message.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {isLastAssistant && onRegenerateLastMessage && (
                  <button
                    type="button"
                    onClick={onRegenerateLastMessage}
                    className="p-1 rounded-md hover:bg-[#282828] hover:text-zinc-300 transition-colors"
                    title="Regenerate response"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  className="p-1 rounded-md hover:bg-[#282828] hover:text-zinc-300 transition-colors"
                  title="Helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  className="p-1 rounded-md hover:bg-[#282828] hover:text-zinc-300 transition-colors"
                  title="Not helpful"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};
