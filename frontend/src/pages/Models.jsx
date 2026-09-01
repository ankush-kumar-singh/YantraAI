import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Eye,
  Code2,
  FileText,
  HardDrive,
  Zap,
  Play,
  Power,
  Shield,
  AlertTriangle,
  RefreshCw,
  Server,
  Layers,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useWebSocket } from '../context/WebSocketContext';
import modelsApi from '../services/models.api';

export const Models = () => {
  const { telemetry } = useWebSocket();

  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromBackend, setIsFromBackend] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [benchmarkingModelId, setBenchmarkingModelId] = useState(null);
  const [vramWarning, setVramWarning] = useState(null);

  // Total system VRAM from hardware telemetry (defaults to 80.0 GB if unconfigured)
  const totalSystemVram = telemetry?.vram_total_gb || 80.0;

  const fetchModels = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await modelsApi.getModels();
      setModels(res.models || []);
      setIsFromBackend(Boolean(res.isFromBackend));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch models from backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Compute allocated VRAM from loaded models
  const calculatedAllocatedVram = models
    .filter((m) => m.status === 'loaded')
    .reduce((acc, m) => acc + (m.vramGB || 0), 0);

  // Ensure allocated VRAM never exceeds total VRAM
  const allocatedVram = Math.min(
    telemetry?.vram_used_gb !== undefined && isFromBackend
      ? telemetry.vram_used_gb
      : calculatedAllocatedVram,
    totalSystemVram
  );

  const availableVram = Math.max(0, totalSystemVram - allocatedVram);
  const vramUsagePct = Math.min(100, Math.round((allocatedVram / totalSystemVram) * 100));

  const getModelIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'vision':
        return <Eye size={18} className="text-purple-400" />;
      case 'coding':
        return <Code2 size={18} className="text-cyan-400" />;
      case 'ocr':
        return <FileText size={18} className="text-amber-400" />;
      case 'reasoning':
      default:
        return <Cpu size={18} className="text-sky-400" />;
    }
  };

  const toggleLoad = async (model) => {
    setVramWarning(null);

    if (model.status === 'loaded') {
      // Unload model
      try {
        await modelsApi.unloadModel(model.id);
        setModels((prev) =>
          prev.map((m) => (m.id === model.id ? { ...m, status: 'standby' } : m))
        );
      } catch (err) {
        console.error('Failed to unload model:', err);
      }
    } else {
      // Check VRAM headroom before loading
      const projectedVram = allocatedVram + (model.vramGB || 0);
      if (projectedVram > totalSystemVram) {
        setVramWarning(
          `Insufficient VRAM headroom: Loading "${model.name}" requires ${model.vramGB} GB, but only ${availableVram.toFixed(
            1
          )} GB is available out of ${totalSystemVram} GB. Please unload another model first.`
        );
        return;
      }

      // Load model
      try {
        await modelsApi.loadModel(model.id);
        setModels((prev) =>
          prev.map((m) => (m.id === model.id ? { ...m, status: 'loaded' } : m))
        );
      } catch (err) {
        console.error('Failed to load model:', err);
      }
    }
  };

  const runBenchmark = (modelId) => {
    setBenchmarkingModelId(modelId);
    setTimeout(() => {
      setBenchmarkingModelId(null);
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
      {/* Header & Connection Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2.5">
            <Cpu className="text-sky-400" size={20} />
            <span>Local Model Engine & Unified VRAM Allocator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero cloud AI endpoints. All models execute locally via on-premises GPU cluster.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Data Source Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e121a] border border-slate-800 text-xs font-mono">
            <Server size={13} className={isFromBackend ? 'text-emerald-400' : 'text-amber-400'} />
            <span className="text-slate-400">Source:</span>
            <span className={isFromBackend ? 'text-emerald-300' : 'text-amber-300'}>
              {isFromBackend ? 'FastAPI /api/models' : 'Isolated Local Mock'}
            </span>
          </div>

          <button
            onClick={fetchModels}
            disabled={isLoading}
            className="p-2 rounded-lg bg-[#0e121a] hover:bg-[#141924] text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            title="Refresh models from backend"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-sky-400' : ''} />
          </button>
        </div>
      </div>

      {/* VRAM Headroom Warning Alert */}
      {vramWarning && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-start justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{vramWarning}</span>
          </div>
          <button
            onClick={() => setVramWarning(null)}
            className="text-amber-400 hover:text-amber-200 font-mono text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Unified VRAM Pool Dashboard */}
      <div className="bg-[#0e121a] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-purple-400" />
            <span className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider">
              Unified Hardware VRAM Pool (80.0 GB Total)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              Allocated:{' '}
              <strong className="text-purple-300 font-bold">
                {allocatedVram.toFixed(1)} / {totalSystemVram.toFixed(1)} GB
              </strong>
            </div>
            <div className="text-slate-600">•</div>
            <div className="text-emerald-400">
              Free Headroom: <strong>{availableVram.toFixed(1)} GB</strong>
            </div>
            <div className="text-slate-600">•</div>
            <div className="text-sky-400">
              Usage: <strong>{vramUsagePct}%</strong>
            </div>
          </div>
        </div>

        {/* Multi-Segment VRAM Bar */}
        <div className="w-full h-3 bg-[#080a0f] rounded-full overflow-hidden border border-slate-800 flex">
          {models
            .filter((m) => m.status === 'loaded')
            .map((m) => {
              const segPct = ((m.vramGB || 0) / totalSystemVram) * 100;
              const colorClass =
                m.category === 'reasoning'
                  ? 'bg-sky-500'
                  : m.category === 'vision'
                  ? 'bg-purple-500'
                  : m.category === 'coding'
                  ? 'bg-cyan-500'
                  : 'bg-amber-500';
              return (
                <div
                  key={m.id}
                  className={`h-full ${colorClass} transition-all duration-300 border-r border-[#080a0f]`}
                  style={{ width: `${segPct}%` }}
                  title={`${m.name}: ${m.vramGB} GB (${segPct.toFixed(1)}%)`}
                />
              );
            })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Reasoning (Qwen)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>OCR (Nougat)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Vision (InternVL)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>Coding (DeepSeek)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-800" />
            <span>Unallocated Headroom</span>
          </div>
        </div>
      </div>

      {/* Model Cards Grid */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <LoadingSpinner size="lg" />
          <span className="text-xs font-mono">Querying Local Model Catalog...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => {
            const isLoaded = model.status === 'loaded';
            return (
              <div
                key={model.id}
                className={`bg-[#0e121a] border rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                  isLoaded
                    ? 'border-slate-700/90 shadow-md'
                    : 'border-slate-800/60 opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  {/* Top Title and Status */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-[#080a0f] border border-slate-800 flex-shrink-0">
                        {getModelIcon(model.category)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-100 text-sm font-mono truncate">
                          {model.name}
                        </h3>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          {model.category}
                        </span>
                      </div>
                    </div>

                    <StatusBadge status={model.status} size="xs" />
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {model.description}
                  </p>

                  {/* Technical Spec Matrix */}
                  <div className="grid grid-cols-2 gap-2 bg-[#080a0f] p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] mb-4">
                    <div>
                      <span className="text-slate-500 block">Parameters:</span>
                      <span className="text-slate-200">{model.params}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Quantization:</span>
                      <span className="text-slate-200">{model.quantization}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Context Window:</span>
                      <span className="text-slate-200">{model.contextWindow}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">VRAM Footprint:</span>
                      <span className="text-purple-300 font-bold">{model.vramGB} GB</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs font-mono">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Zap size={12} className="text-amber-400" />
                    <span>{model.latencyTokensPerSec} tokens/sec</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runBenchmark(model.id)}
                      disabled={benchmarkingModelId === model.id || !isLoaded}
                      className={`px-2.5 py-1 rounded text-[11px] transition-colors flex items-center gap-1 border ${
                        isLoaded
                          ? 'bg-[#151c28] hover:bg-[#1f293d] text-slate-300 border-slate-700'
                          : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      <Play size={11} />
                      <span>{benchmarkingModelId === model.id ? 'Testing...' : 'Test Speed'}</span>
                    </button>

                    <button
                      onClick={() => toggleLoad(model)}
                      className={`px-2.5 py-1 rounded text-[11px] transition-colors flex items-center gap-1 ${
                        isLoaded
                          ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
                      }`}
                    >
                      <Power size={11} />
                      <span>{isLoaded ? 'Unload' : 'Load to VRAM'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Models;
