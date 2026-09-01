import React from 'react';
import { Shield, Lock, Activity, Server, Cpu, Radio } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';
import { useWorkspace } from '../../context/WorkspaceContext';

export const Header = ({ onOpenTelemetry }) => {
  const { telemetry, connectionStatus, isConnected } = useWebSocket();
  const { currentSessionId, conversations } = useWorkspace();

  const currentConv = conversations.find((c) => c.id === currentSessionId);

  return (
    <header className="h-12 bg-[#090b10] border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-20">
      {/* Left: Active project / task title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono truncate">
          <Shield size={14} className="text-sky-400 flex-shrink-0" />
          <span className="text-slate-300 font-medium">AegisAI</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 truncate max-w-[220px] sm:max-w-sm">
            {currentConv?.title || 'Sovereign Multimodal Workspace'}
          </span>
        </div>
      </div>

      {/* Right: Airgap status pills and GPU glance */}
      <div className="flex items-center gap-3 font-mono text-[11px]">
        {/* Airgap status flags */}
        <div className="hidden md:flex items-center gap-2 bg-[#0e121a] px-2.5 py-1 rounded-full border border-slate-800">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LOCAL
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-sky-400">SECURE</span>
          <span className="text-slate-600">•</span>
          <span className="text-purple-400">AIR-GAPPED</span>
        </div>

        {/* GPU & Telemetry Button */}
        <button
          onClick={onOpenTelemetry}
          className="flex items-center gap-2 bg-[#0e121a] hover:bg-[#141924] text-slate-300 hover:text-slate-100 px-2.5 py-1 rounded-md border border-slate-800 transition-colors"
          title="Open Sovereign Telemetry"
        >
          <Cpu size={13} className="text-sky-400" />
          <span className="hidden sm:inline">GPU:</span>
          <span className="text-sky-300 font-bold">{telemetry?.gpu_util_pct || 0}%</span>
          <span className="text-slate-600">•</span>
          <span className="text-purple-300">{telemetry?.vram_used_gb || 0}GB</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
