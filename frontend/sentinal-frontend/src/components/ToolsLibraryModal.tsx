import React, { useState } from 'react';
import { ToolDefinition, ToolCategory } from '../types';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  Play, 
  Code, 
  FileText, 
  X, 
  Check, 
  TerminalSquare, 
  Globe, 
  Database, 
  CheckCircle2, 
  FileCode2,
  Sparkles,
  Sliders
} from 'lucide-react';

interface ToolsLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: ToolDefinition[];
  onToggleTool: (toolId: string) => void;
  onAddTool: (tool: Omit<ToolDefinition, 'id'>) => void;
  onDeleteTool: (toolId: string) => void;
}

const CATEGORIES: { key: ToolCategory; label: string }[] = [
  { key: 'coding', label: 'Code & Sandboxes' },
  { key: 'search', label: 'Web & Grounding' },
  { key: 'data', label: 'Data & SQL' },
  { key: 'system', label: 'System & Files' },
  { key: 'custom', label: 'Custom User Tools' },
];

export const ToolsLibraryModal: React.FC<ToolsLibraryModalProps> = ({
  isOpen,
  onClose,
  tools,
  onToggleTool,
  onAddTool,
  onDeleteTool,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'test'>('browse');
  const [selectedToolForTest, setSelectedToolForTest] = useState<ToolDefinition | null>(tools[0] || null);
  const [testInputJson, setTestInputJson] = useState('{\n  "query": "React 19 hooks"\n}');
  const [testResult, setTestResult] = useState<string | null>(null);

  // New Tool Form State
  const [toolName, setToolName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ToolCategory>('custom');
  const [schemaJson, setSchemaJson] = useState('{\n  "input": "string // Required input payload"\n}');
  const [mockOutput, setMockOutput] = useState('Execution succeeded with payload.');

  if (!isOpen) return null;

  const handleCreateTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim() || !displayName.trim()) return;

    onAddTool({
      name: toolName.trim().toLowerCase().replace(/\s+/g, '_'),
      displayName: displayName.trim(),
      description: description.trim() || 'Custom user tool definition for autonomous agent loop.',
      category,
      isEnabled: true,
      isCustom: true,
      parametersSchema: schemaJson,
      mockOutputTemplate: mockOutput,
      icon: 'Wrench',
    });

    setToolName('');
    setDisplayName('');
    setDescription('');
    setActiveTab('browse');
  };

  const runTestTool = () => {
    if (!selectedToolForTest) return;
    try {
      JSON.parse(testInputJson);
    } catch {
      setTestResult('⚠️ Error: Input must be valid JSON');
      return;
    }

    setTestResult(`[Dispatching ${selectedToolForTest.name}...]\n${selectedToolForTest.mockOutputTemplate || 'Execution completed successfully in 120ms.'}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#141414] border border-[#262626] shadow-2xl text-zinc-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 font-heading">
                Agent Tools & API Library
              </h2>
              <p className="text-xs text-zinc-400">
                Inspect, enable, or author custom tools available to the multi-phase agent engine.
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

        {/* Tab Selector */}
        <div className="flex items-center px-6 border-b border-[#262626] bg-[#111111] text-xs font-semibold select-none">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'browse'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Installed Tools ({tools.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            + Author New Tool
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('test')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'test'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tool Testing Sandbox
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#141414]">
          {/* 1. BROWSE TAB */}
          {activeTab === 'browse' && (
            <div className="space-y-3">
              {tools.map(tool => (
                <div
                  key={tool.id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between ${
                    tool.isEnabled
                      ? 'bg-[#181818] border-[#262626] shadow-sm'
                      : 'bg-[#101010] border-[#202020] opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3 flex-1 pr-4">
                    <div className="p-2.5 rounded-xl bg-[#222222] text-rose-400 border border-[#2e2e2e] mt-0.5">
                      <TerminalSquare className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-zinc-100 font-heading">
                          {tool.displayName}
                        </h4>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#222222] text-zinc-400 border border-[#2e2e2e]">
                          {tool.name}
                        </span>
                        {tool.isCustom && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Custom
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {tool.description}
                      </p>

                      <div className="pt-2">
                        <details className="text-[11px] text-zinc-500">
                          <summary className="cursor-pointer hover:text-zinc-300 font-mono">
                            View Parameters Schema
                          </summary>
                          <pre className="mt-1 p-2.5 rounded-xl bg-[#0e0e0e] border border-[#262626] font-mono text-zinc-300 overflow-x-auto text-[11px]">
                            {tool.parametersSchema}
                          </pre>
                        </details>
                      </div>
                    </div>
                  </div>

                  {/* Toggle & Action */}
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => onToggleTool(tool.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        tool.isEnabled ? 'bg-rose-600' : 'bg-[#2a2a2a]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          tool.isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    {tool.isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteTool(tool.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-[#222222] transition-colors"
                        title="Delete custom tool"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. CREATE TAB */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateTool} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                    Tool Identifier (Function Name)
                  </label>
                  <input
                    type="text"
                    id="input-tool-name"
                    value={toolName}
                    onChange={(e) => setToolName(e.target.value)}
                    placeholder="e.g. github_pr_analyzer"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e0e] border border-[#262626] text-sm text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                    Display Label
                  </label>
                  <input
                    type="text"
                    id="input-tool-display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. GitHub PR Analyzer"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e0e] border border-[#262626] text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                  Description & Agent Prompt Directive
                </label>
                <input
                  type="text"
                  id="input-tool-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what the tool does and when the agent should dispatch it..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e0e] border border-[#262626] text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                  Parameters JSON Schema
                </label>
                <textarea
                  id="input-tool-schema"
                  value={schemaJson}
                  onChange={(e) => setSchemaJson(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e0e] border border-[#262626] text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                  Mock Output Template / Response
                </label>
                <textarea
                  id="input-tool-output-template"
                  value={mockOutput}
                  onChange={(e) => setMockOutput(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e0e] border border-[#262626] text-xs text-emerald-300 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="submit"
                  id="btn-save-tool"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Custom Tool</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. TEST TAB */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                  Select Tool to Dispatch
                </label>
                <select
                  value={selectedToolForTest?.id}
                  onChange={(e) => {
                    const t = tools.find(x => x.id === e.target.value);
                    if (t) setSelectedToolForTest(t);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e0e] border border-[#262626] text-sm text-zinc-100 font-medium focus:outline-none focus:border-rose-500"
                >
                  {tools.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.displayName} ({t.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                  Input JSON Payload
                </label>
                <textarea
                  value={testInputJson}
                  onChange={(e) => setTestInputJson(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e0e] border border-[#262626] text-xs font-mono text-zinc-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="button"
                onClick={runTestTool}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Tool Call</span>
              </button>

              {testResult && (
                <div className="p-3.5 rounded-xl bg-[#0e0e0e] border border-[#262626] font-mono text-xs text-zinc-200 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Console Output:</span>
                  <pre className="whitespace-pre-wrap text-emerald-400">{testResult}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
