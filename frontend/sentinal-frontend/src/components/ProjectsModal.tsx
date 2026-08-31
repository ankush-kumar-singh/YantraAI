import React, { useState } from 'react';
import { Project } from '../types';
import { 
  FolderPlus, 
  Folder, 
  X, 
  Check, 
  Trash2, 
  Terminal, 
  BookOpen, 
  Bot, 
  Layers, 
  FileText, 
  Plus,
  Sparkles
} from 'lucide-react';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onDeleteProject: (id: string) => void;
  onSelectProject: (id: string) => void;
}

const PROJECT_COLORS = [
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
];

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  onCreateProject,
  onDeleteProject,
  onSelectProject,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      name: name.trim(),
      description: description.trim() || 'Custom workspace project for specialized local LLM reasoning.',
      color,
      icon: 'Folder',
      systemPrompt: systemPrompt.trim() || 'You are an expert specialist dedicated to this project workspace.',
      filesCount: 0,
    });

    setName('');
    setDescription('');
    setSystemPrompt('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#141414] border border-[#262626] shadow-2xl text-zinc-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 font-heading">
                Projects & Workspaces
              </h2>
              <p className="text-xs text-zinc-400">
                Organize conversations, configure project-specific system instructions, and file context.
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#141414]">
          {/* Create Project Toggle */}
          {!isCreating ? (
            <button
              type="button"
              id="btn-show-create-project-form"
              onClick={() => setIsCreating(true)}
              className="flex items-center justify-center space-x-2 w-full py-3.5 rounded-xl border border-dashed border-[#333333] hover:border-rose-500/70 bg-[#181818] hover:bg-rose-500/5 text-sm font-semibold text-zinc-300 hover:text-rose-300 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="p-4 rounded-xl bg-[#181818] border border-[#262626] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-100 font-heading">New Project Details</h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                  Project Name
                </label>
                <input
                  type="text"
                  id="input-project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Distributed Database Engine"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e0e] border border-[#262626] text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                  Description
                </label>
                <input
                  type="text"
                  id="input-project-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of project goals..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e0e] border border-[#262626] text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                  Project Accent Color
                </label>
                <div className="flex items-center space-x-2">
                  {PROJECT_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#181818]' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Custom System Prompt */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                  Project System Instructions
                </label>
                <textarea
                  id="input-project-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={3}
                  placeholder="Specific role, constraints, or knowledge rules for chats in this project..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e0e] border border-[#262626] text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] border border-[#2e2e2e] text-xs font-medium text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-new-project"
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
                >
                  Create Project
                </button>
              </div>
            </form>
          )}

          {/* Existing Projects List */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Active Projects ({projects.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.map(proj => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl bg-[#181818] border border-[#262626] hover:border-[#383838] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Folder className="w-4 h-4 flex-shrink-0" style={{ color: proj.color }} />
                        <h4 className="text-sm font-bold text-zinc-100 font-heading truncate max-w-[180px]">
                          {proj.name}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteProject(proj.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
                      {proj.description}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-[#262626] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectProject(proj.id);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg bg-[#222222] hover:bg-[#2a2a2a] border border-[#2e2e2e] text-xs font-medium text-rose-300 transition-colors"
                    >
                      Open Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
