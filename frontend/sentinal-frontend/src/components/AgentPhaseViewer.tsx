import React, { useState } from 'react';
import { 
  AgentRunDetails, 
  AgentStep, 
  AgentPhase 
} from '../types';
import { 
  Compass, 
  Search, 
  Hammer, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  TerminalSquare, 
  FileCode, 
  AlertCircle,
  Cpu,
  Layers,
  Check,
  Copy
} from 'lucide-react';

interface AgentPhaseViewerProps {
  agentRun: AgentRunDetails;
  isStreaming?: boolean;
}

const PHASE_CONFIG: Record<AgentPhase, { label: string; icon: React.FC<{ className?: string }>; color: string; bgActive: string; borderActive: string }> = {
  planning: {
    label: 'Planning Phase',
    icon: Compass,
    color: 'text-amber-400',
    bgActive: 'bg-amber-500/10 text-amber-300',
    borderActive: 'border-amber-500/40',
  },
  evaluation: {
    label: 'Evaluation Phase',
    icon: Search,
    color: 'text-blue-400',
    bgActive: 'bg-blue-500/10 text-blue-300',
    borderActive: 'border-blue-500/40',
  },
  building: {
    label: 'Building Phase',
    icon: Hammer,
    color: 'text-rose-400',
    bgActive: 'bg-rose-500/10 text-rose-300',
    borderActive: 'border-rose-500/40',
  },
  output: {
    label: 'Output Phase',
    icon: Sparkles,
    color: 'text-emerald-400',
    bgActive: 'bg-emerald-500/10 text-emerald-300',
    borderActive: 'border-emerald-500/40',
  },
};

export const AgentPhaseViewer: React.FC<AgentPhaseViewerProps> = ({ agentRun, isStreaming }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTabPhase, setActiveTabPhase] = useState<AgentPhase>(agentRun.currentPhase);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const phasesList: AgentPhase[] = ['planning', 'evaluation', 'building', 'output'];
  const currentStep = agentRun.steps.find(s => s.phase === agentRun.currentPhase) || agentRun.steps[0];

  const handleCopyArtifact = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="my-4 rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden shadow-xl transition-all">
      {/* Top Agent Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-3 bg-[#181818] border-b border-[#262626] cursor-pointer select-none hover:bg-[#1d1d1d] transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Cpu className="w-4 h-4" />
            {isStreaming && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-wider uppercase text-rose-400 font-mono">
                Autonomous Agent Loop
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs font-medium text-zinc-300 capitalize">
                {PHASE_CONFIG[agentRun.currentPhase]?.label}
              </span>
            </div>
            
            {agentRun.thoughtSummary && (
              <p className="text-xs text-zinc-400 line-clamp-1 max-w-xl">
                {agentRun.thoughtSummary}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Progress Pill */}
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-[#141414] border border-[#262626] text-xs">
            <div className="w-12 bg-[#222222] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-rose-500 to-amber-400 h-full transition-all duration-300"
                style={{ width: `${agentRun.progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-zinc-300 text-[11px]">{agentRun.progressPercent}%</span>
          </div>

          {agentRun.totalDurationMs > 0 && (
            <span className="hidden sm:inline-flex items-center space-x-1 text-xs text-zinc-500 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{(agentRun.totalDurationMs / 1000).toFixed(1)}s</span>
            </span>
          )}

          <button 
            type="button" 
            className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            title={isExpanded ? "Collapse Agent Details" : "Expand Agent Details"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Execution Phases Container */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Phase Stepper Tabs (4 Bento Tiles) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {phasesList.map((phase) => {
              const step = agentRun.steps.find(s => s.phase === phase);
              const config = PHASE_CONFIG[phase];
              const Icon = config.icon;
              const isCurrent = agentRun.currentPhase === phase;
              const isDone = step?.status === 'completed';
              const isRunning = step?.status === 'running';

              return (
                <button
                  key={phase}
                  type="button"
                  onClick={() => setActiveTabPhase(phase)}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                    activeTabPhase === phase
                      ? 'bg-[#1e1e1e] border-[#383838] shadow-md ring-1 ring-rose-500/20'
                      : 'bg-[#171717] border-[#262626] hover:bg-[#1c1c1c] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                      <span className="text-xs font-semibold text-zinc-200">
                        {config.label.replace(' Phase', '')}
                      </span>
                    </div>

                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isRunning ? (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-zinc-700" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span className="capitalize">{step?.status || 'Pending'}</span>
                    {step?.durationMs && <span>{(step.durationMs / 1000).toFixed(2)}s</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Phase Details Content (Bento Sub-Container) */}
          <div className="rounded-xl border border-[#262626] bg-[#101010] p-4 space-y-3">
            {(() => {
              const selectedStep = agentRun.steps.find(s => s.phase === activeTabPhase) || agentRun.steps[0];
              const config = PHASE_CONFIG[activeTabPhase];
              const Icon = config.icon;

              if (!selectedStep) {
                return <p className="text-xs text-zinc-500">Phase not initialized.</p>;
              }

              return (
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#262626]">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 font-heading">
                        {selectedStep.title}
                      </h4>
                    </div>

                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-mono capitalize border ${
                      selectedStep.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : selectedStep.status === 'running'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 animate-pulse'
                        : 'bg-[#181818] text-zinc-400 border-[#262626]'
                    }`}>
                      {selectedStep.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mt-2.5">
                    {selectedStep.description}
                  </p>

                  {/* Logs Feed */}
                  {selectedStep.logs && selectedStep.logs.length > 0 && (
                    <div className="mt-3 rounded-xl bg-[#0a0a0a] p-3 border border-[#222222] font-mono text-[11.5px] space-y-1 text-zinc-400">
                      <div className="flex items-center space-x-1.5 text-zinc-500 mb-1 font-semibold uppercase text-[10px] tracking-wider">
                        <TerminalSquare className="w-3 h-3 text-rose-400" />
                        <span>Execution Trace Log</span>
                      </div>
                      {selectedStep.logs.map((log, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <span className="text-zinc-600 select-none">&gt;</span>
                          <span className="text-zinc-300">{log}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tool Call Cards */}
                  {selectedStep.toolCalls && selectedStep.toolCalls.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block font-mono">
                        Dispatched Tool Calls ({selectedStep.toolCalls.length})
                      </span>
                      {selectedStep.toolCalls.map((tc, idx) => (
                        <div key={idx} className="rounded-xl bg-[#141414] border border-[#262626] p-3 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-blue-400" />
                              <span className="font-mono font-semibold text-rose-300">{tc.toolName}</span>
                            </div>
                            <span className="text-zinc-500 font-mono text-[10px]">
                              {tc.durationMs}ms
                            </span>
                          </div>

                          <div className="bg-[#0a0a0a] rounded-lg p-2.5 text-[11px] font-mono text-zinc-400 overflow-x-auto border border-[#222222]">
                            <span className="text-zinc-600 block mb-0.5">// Input Payload</span>
                            <pre className="text-zinc-300">{JSON.stringify(tc.inputParams, null, 2)}</pre>
                          </div>

                          {tc.outputResult && (
                            <div className="bg-[#0a0a0a] rounded-lg p-2.5 text-[11px] font-mono text-emerald-400 overflow-x-auto border border-emerald-950/60">
                              <span className="text-zinc-600 block mb-0.5">// Tool Output Result</span>
                              <pre className="whitespace-pre-wrap">{tc.outputResult}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Artifacts Preview */}
                  {selectedStep.artifacts && selectedStep.artifacts.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block font-mono">
                        Generated Artifacts ({selectedStep.artifacts.length})
                      </span>
                      {selectedStep.artifacts.map((art) => (
                        <div key={art.id} className="rounded-xl bg-[#141414] border border-[#262626] p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileCode className="w-3.5 h-3.5 text-amber-400" />
                              <span className="font-mono text-xs font-semibold text-zinc-200">{art.title}</span>
                              <span className="px-1.5 py-0.2 rounded bg-[#202020] text-[10px] text-zinc-400 uppercase font-mono">
                                {art.language || art.type}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyArtifact(art.id, art.content)}
                              className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#202020] hover:bg-[#282828] text-zinc-300 text-xs transition-colors"
                            >
                              {copiedCodeId === art.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="bg-[#0a0a0a] rounded-lg p-2.5 font-mono text-xs text-zinc-300 overflow-x-auto max-h-48 border border-[#222222]">
                            <pre>{art.content}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
