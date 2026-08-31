import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  Square, 
  Paperclip, 
  Mic, 
  X, 
  FileText 
} from 'lucide-react';
import { ChatMode, Model, Attachment } from '../types';

interface PromptInputBarProps {
  onSendMessage: (text: string, mode: ChatMode, attachments: Attachment[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  selectedModel: Model;
  activeMode?: ChatMode;
  placeholderText?: string;
  isCentered?: boolean;
}

export const PromptInputBar: React.FC<PromptInputBarProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  selectedModel,
  activeMode = 'normal',
  placeholderText,
  isCentered = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!inputText.trim() && attachments.length === 0) || isStreaming) return;
    onSendMessage(inputText.trim(), activeMode, attachments);
    setInputText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setInputText((prev) => (prev ? `${prev} Summarize the main points` : 'Refactor this algorithm for concurrency.'));
        setIsRecording(false);
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  const placeholder = placeholderText || `Message ${selectedModel.name || 'Sentinel'}`;

  return (
    <div className={`w-full ${isCentered ? 'max-w-2xl' : 'max-w-3xl'} mx-auto px-4 ${isCentered ? 'pt-6 pb-2' : 'pb-4 pt-2'}`}>
      {/* Sleek rounded capsule matching Sentinel reference design */}
      <div className="relative rounded-3xl bg-[#262626] border border-[#333333] shadow-lg focus-within:border-[#4a4a4a] transition-all p-2 sm:p-2.5">
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-1 pb-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-[#1c1c1c] border border-[#333333] text-xs text-zinc-200"
              >
                {att.previewUrl ? (
                  <img src={att.previewUrl} alt={att.name} className="w-4 h-4 rounded object-cover" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span className="max-w-[120px] truncate">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          id="main-chat-prompt-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full px-3 py-1.5 bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none min-h-[38px] max-h-[200px]"
        />

        {/* Controls Bar: Paperclip on left, Mic & Send on right */}
        <div className="flex items-center justify-between px-1 pt-1">
          {/* Left: Paperclip / Attachment */}
          <div className="flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
              id="file-upload-input"
            />
            <button
              type="button"
              id="btn-attach-file"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-[#333333] transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Right: Microphone + Send Button */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              id="btn-toggle-voice"
              onClick={toggleRecording}
              className={`p-2 rounded-full transition-colors ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'text-zinc-400 hover:text-white hover:bg-[#333333]'
              }`}
              title={isRecording ? 'Listening...' : 'Voice Input'}
            >
              <Mic className="w-4.5 h-4.5" />
            </button>

            {isStreaming ? (
              <button
                type="button"
                id="btn-stop-generation"
                onClick={onStopStreaming}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#383838] hover:bg-[#444444] text-white transition-all active:scale-95"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                id="btn-send-message"
                onClick={handleSubmit}
                disabled={!inputText.trim() && attachments.length === 0}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95 ${
                  inputText.trim() || attachments.length > 0
                    ? 'bg-[#3d3d3d] hover:bg-[#4d4d4d] text-white cursor-pointer'
                    : 'bg-[#2e2e2e] text-zinc-500 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
