import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, ListOrdered, Shield } from 'lucide-react';
import PlanStep from './PlanStep';

export const AgentPlan = ({ steps = [], isLive = false }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!steps || steps.length === 0) return null;

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-[#10141d]/95 border border-slate-800/90 rounded-lg overflow-hidden my-2.5 text-xs transition-all">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#0a0d13] hover:bg-[#121622] transition-colors border-b border-slate-800/60"
      >
        <div className="flex items-center gap-2 font-mono">
          {isOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
          <ListOrdered size={14} className="text-sky-400" />
          <span className="font-semibold text-slate-200">Sovereign Agent Plan</span>
          <span className="text-[11px] text-slate-400">
            ({completedCount}/{steps.length} steps)
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Mini progress bar */}
          <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-slate-400">{progressPct}%</span>
        </div>
      </button>

      {/* Plan Steps List */}
      {isOpen && (
        <div className="px-4 py-3 bg-[#0e121b]/70 space-y-1">
          {steps.map((step, idx) => (
            <PlanStep
              key={step.id || idx}
              step={step}
              isLast={idx === steps.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentPlan;
