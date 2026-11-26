import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../lib/TranslationContext';
import {
  Wand2,
  ShieldAlert,
  Zap,
  Terminal,
  FileCode,
  BarChart3,
  Cpu,
  CheckCircle2,
  Sparkles,
  Download,
  Copy,
  Check,
  AlertCircle,
  SlidersHorizontal
} from 'lucide-react';

import {
  optimizeQuantumCode,
  mitigateQuantumCounts,
  NoiseOptimizationResponse,
  NoiseMitigationResponse
} from '../services/geminiQuantumService';

type Tab = 'optimize' | 'denoise';
type MitigationMethod = 'readout' | 'zne';

function parseCountsInput(rawText: string): Record<string, number> {
  const original: Record<string, number> = {};
  const cleanedInput = (rawText || '').replace(/^\uFEFF/, '').trim();
  if (!cleanedInput) {
    throw new Error('Inserisci i conteggi di misura prima di applicare la mitigazione.');
  }

  try {
    const parsed = JSON.parse(cleanedInput);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const [k, v] of Object.entries(parsed)) {
        const num = Number(v);
        if (k.trim() && Number.isFinite(num) && num >= 0) {
          original[k.trim()] = Math.round(num);
        }
      }
      if (Object.keys(original).length > 0) return original;
    }
  } catch {
    // Fall back to line/comma parsing
  }

  const tokens = cleanedInput.includes('\n') && !cleanedInput.includes(':')
    ? cleanedInput.split(/\r?\n/).map((p) => p.trim()).filter(Boolean)
    : cleanedInput.split(/[\n,]+/).map((p) => p.trim()).filter(Boolean);

  tokens.forEach((pair) => {
    const match = pair.match(/^\|?([01]+|[^:;\t,]+?)\⟩?\s*[:;\t,]\s*(-?\d+(?:[.,]\d+)?)$/);
    if (match) {
      const key = match[1].trim();
      const num = parseFloat(match[2].replace(',', '.'));
      if (key && Number.isFinite(num) && num >= 0) {
        original[key] = (original[key] || 0) + Math.round(num);
      }
    }
  });

  if (Object.keys(original).length === 0) {
    throw new Error('Formato conteggi non riconosciuto. Usa es: "00: 450, 01: 52, 10: 48, 11: 474" o JSON.');
  }
  return original;
}

export default function OptimizeDenoise() {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('optimize');
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<NoiseOptimizationResponse | null>(null);

  const [dirtyData, setDirtyData] = useState('00: 450, 01: 52, 10: 48, 11: 474');
  const [mitigationMethod, setMitigationMethod] = useState<MitigationMethod>('readout');
  const [error01Pct, setError01Pct] = useState<number>(2.5);
  const [error10Pct, setError10Pct] = useState<number>(4.0);
  const [zneScale2Data, setZneScale2Data] = useState('00: 390, 01: 112, 10: 108, 11: 414');
  const [zneScale1Factor, setZneScale1Factor] = useState<number>(1);
  const [zneScale2Factor, setZneScale2Factor] = useState<number>(3);
  const [mitigatedData, setMitigatedData] = useState<NoiseMitigationResponse | null>(null);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (results?.optimizedCode) {
      navigator.clipboard.writeText(results.optimizedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadOptimized = () => {
    if (!results?.optimizedCode) return;
    const isPy = results.metrics?.detectedFormat === 'PYTHON_QISKIT' || results.optimizedCode.includes('QuantumCircuit');
    const ext = isPy ? 'py' : 'qasm';
    const blob = new Blob([results.optimizedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `circuito_pulito_anti_rumore.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleCode = (kind: 'qasm' | 'python') => {
    setErrorMsg(null);
    if (kind === 'qasm') {
      setCode(`OPENQASM 3.0;
include "stdgates.inc";

qubit[3] q;
bit[3] c;

h q[0];
h q[0]; // gate auto-inverso ridondante
rz(0.785398) q[0];
rz(0.785398) q[0]; // due rotazioni da fondere
x q[1];
id q[1];
x q[1]; // doppia X superflua
ry(0) q[2]; // angolo nullo
h q[0];
cx q[0], q[1];
cx q[1], q[2];
cx q[1], q[2]; // doppio CX ridondante

measure q -> c;`);
    } else {
      setCode(`from qiskit import QuantumCircuit

qc = QuantumCircuit(3, 3)
qc.h(0)
qc.h(0)
qc.rz(0.5, 0)
qc.rz(0.5, 0)
qc.x(1)
qc.x(1)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)
qc.cx(1, 2)
qc.measure([0, 1, 2], [0, 1, 2])`);
    }
  };

  const handleOptimize = async () => {
    if (!code.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const result = await optimizeQuantumCode(code, language, true);
      setResults(result);
    } catch (error: any) {
      setErrorMsg(error?.message || t('opt_error_generic'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDenoise = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const baseCounts = parseCountsInput(dirtyData);

      let response: NoiseMitigationResponse;
      if (mitigationMethod === 'zne') {
        const scaledCounts = parseCountsInput(zneScale2Data);
        response = await mitigateQuantumCounts({
          method: 'zne',
          zneRuns: [
            { scale: zneScale1Factor, counts: baseCounts },
            { scale: zneScale2Factor, counts: scaledCounts },
          ],
          language,
          useGemini: true,
        });
      } else {
        response = await mitigateQuantumCounts({
          method: 'readout',
          counts: baseCounts,
          error01: Math.max(0, Math.min(0.45, error01Pct / 100)),
          error10: Math.max(0, Math.min(0.45, error10Pct / 100)),
          language,
          useGemini: true,
        });
      }

      setMitigatedData(response);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Errore durante la mitigazione matematica dei conteggi.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3 overflow-hidden">
      {errorMsg && (
        <div className="shrink-0 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="shrink-0 p-3.5 sm:p-4 bg-quantum-primary/5 border border-quantum-primary/20 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-3 sm:gap-5 text-center sm:text-left">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-quantum-primary/20 flex items-center justify-center shrink-0">
          <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-quantum-primary" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-white uppercase tracking-tight">{t('geminiExpert')}</h2>
          <p className="text-xs text-gray-400 mt-0.5 max-w-2xl leading-snug">
            {t('geminiExpertDesc')}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex bg-white/5 border border-white/10 rounded-xl p-1 w-full sm:w-fit">
        <button
          onClick={() => {
            setErrorMsg(null);
            setActiveTab('optimize');
          }}
          className={`flex-1 sm:flex-none px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-mono uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'optimize' ? 'bg-quantum-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.3)] font-bold' : 'text-gray-500 hover:text-white'}`}
        >
          <FileCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t('seniorProtocol')}
        </button>
        <button
          onClick={() => {
            setErrorMsg(null);
            setActiveTab('denoise');
          }}
          className={`flex-1 sm:flex-none px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-mono uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'denoise' ? 'bg-quantum-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.3)] font-bold' : 'text-gray-500 hover:text-white'}`}
        >
          <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t('denoisePostJob')}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'optimize' ? (
          <motion.div
            key="optimize"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch overflow-y-auto lg:overflow-hidden scrollbar-hide"
          >
            {/* Input Side */}
            <div className="flex flex-col h-full min-h-0">
              <div className="quantum-card flex-1 min-h-0 bg-black/60 border-white/10 flex flex-col p-4">
                <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-quantum-primary" /> {t('dirtyCode')}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => loadSampleCode('qasm')}
                      className="px-2 py-1 text-[9px] font-mono rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 cursor-pointer"
                    >
                      Test OpenQASM
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSampleCode('python')}
                      className="px-2 py-1 text-[9px] font-mono rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 cursor-pointer"
                    >
                      Test Python
                    </button>
                  </div>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t('pythonCodePlaceholder')}
                  className="flex-1 min-h-0 w-full bg-white/5 border border-white/5 rounded-lg p-3.5 font-mono text-xs text-blue-200 placeholder:text-gray-700 focus:border-quantum-primary transition-colors resize-none outline-none scrollbar-hide"
                />
                <button
                  onClick={handleOptimize}
                  disabled={isProcessing || !code.trim()}
                  className="shrink-0 mt-3 w-full py-3 bg-quantum-primary text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {isProcessing ? t('processingProtocol') : t('regenerateCode')}
                </button>
              </div>
            </div>

            {/* Results Side */}
            <div className="flex flex-col h-full min-h-0 overflow-y-auto scrollbar-hide gap-3">
              {results ? (
                <>
                  {results.metrics && (
                    <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10">
                        <span className="text-gray-500 block uppercase text-[8px]">Gate Prima → Dopo</span>
                        <span className="text-quantum-primary font-bold text-xs">
                          {results.metrics.originalGateCount} → {results.metrics.optimizedGateCount}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10">
                        <span className="text-gray-500 block uppercase text-[8px]">Gate Rimossi / Fusi</span>
                        <span className="text-emerald-400 font-bold text-xs">
                          -{results.metrics.gatesRemoved} ({results.metrics.rotationsMerged} fuse)
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10">
                        <span className="text-gray-500 block uppercase text-[8px]">Motore Utilizzato</span>
                        <span className={`font-bold text-[10px] ${results.aiUsed ? 'text-purple-300' : 'text-cyan-300'}`}>
                          {results.aiUsed ? 'Gemini AI + AST' : 'AST Deterministico'}
                        </span>
                      </div>
                    </div>
                  )}

                  {results.aiNote && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[10px] text-amber-200 font-mono">
                      {results.aiNote}
                    </div>
                  )}

                  <div className="quantum-card border-quantum-primary/30 bg-quantum-primary/5 p-3.5">
                    <h3 className="text-quantum-primary font-bold text-[10px] uppercase mb-1.5 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> {t('expertReport')}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed">{results.analysis}</p>
                  </div>

                  <div className="quantum-card border-white/10 bg-black/80 flex flex-col p-3.5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-quantum-primary" /> {t('regeneratedCode')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDownloadOptimized}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[9px] font-mono text-gray-300 hover:text-quantum-primary cursor-pointer"
                          title="Scarica codice pulito"
                        >
                          <Download className="w-3 h-3" /> Scarica
                        </button>
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5 transition-colors group cursor-pointer"
                        >
                          <span className={`text-[9px] font-mono uppercase ${copied ? 'text-green-400' : 'text-gray-400 group-hover:text-white'}`}>
                            {copied ? t('copied') : t('copy')}
                          </span>
                          {copied ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                    <pre className="text-[11px] font-mono text-green-400 overflow-auto max-h-[260px] scrollbar-hide py-1">
                      {results.optimizedCode}
                    </pre>
                  </div>

                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl">
                    <h4 className="text-[10px] font-bold text-white uppercase mb-1.5">{t('executionGuide')}</h4>
                    <pre className="text-[11px] text-gray-300 font-sans whitespace-pre-wrap leading-relaxed">{results.guide}</pre>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <Cpu className="w-12 h-12 text-gray-800 mb-4" />
                  <p className="text-sm text-gray-500 italic max-w-xs">{t('emptyOptimizePrompt')}</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="denoise"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch overflow-y-auto lg:overflow-hidden scrollbar-hide"
          >
            {/* Input Side (Dirty Data + Calibration Parameters) */}
            <div className="quantum-card bg-black/60 border-white/10 flex flex-col h-full min-h-0 p-4 gap-3">
              <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-mono text-gray-400 uppercase">{t('rawInputData')}</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={mitigationMethod}
                    onChange={(e) => setMitigationMethod(e.target.value as MitigationMethod)}
                    className="bg-black/80 border border-white/15 rounded-lg px-2 py-1 text-[10px] font-mono text-quantum-primary focus:outline-none"
                  >
                    <option value="readout">Inversione Matrice Readout (M⁻¹)</option>
                    <option value="zne">ZNE Richardson (Multi-Scala)</option>
                  </select>
                  <label className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded cursor-pointer hover:bg-white/10 transition-colors">
                    <Download className="w-3.5 h-3.5 text-quantum-primary" />
                    <span className="text-[9px] font-mono text-gray-400 uppercase">{t('load_file_btn')}</span>
                    <input
                      type="file"
                      accept=".json,.txt,.csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (rev) => {
                          const content = ((rev.target?.result as string) || '').replace(/^\uFEFF/, '');
                          setDirtyData(content);
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              {mitigationMethod === 'readout' ? (
                <div className="shrink-0 grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-[10px]">
                  <div>
                    <label className="text-gray-400 block text-[9px] mb-1 flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3 text-quantum-primary" /> Errore P(1|0) %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={44}
                      step={0.1}
                      value={error01Pct}
                      onChange={(e) => setError01Pct(Number(e.target.value))}
                      className="w-full bg-black/70 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-quantum-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block text-[9px] mb-1">Errore P(0|1) %</label>
                    <input
                      type="number"
                      min={0}
                      max={44}
                      step={0.1}
                      value={error10Pct}
                      onChange={(e) => setError10Pct(Number(e.target.value))}
                      className="w-full bg-black/70 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-quantum-primary focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="shrink-0 grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-[10px]">
                  <div>
                    <label className="text-gray-400 block text-[9px] mb-1">Scala Rumore 1 (es. 1x)</label>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={zneScale1Factor}
                      onChange={(e) => setZneScale1Factor(Number(e.target.value))}
                      className="w-full bg-black/70 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-quantum-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block text-[9px] mb-1">Scala Rumore 2 (es. 3x)</label>
                    <input
                      type="number"
                      min={1}
                      step={0.5}
                      value={zneScale2Factor}
                      onChange={(e) => setZneScale2Factor(Number(e.target.value))}
                      className="w-full bg-black/70 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-quantum-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-0 flex flex-col gap-2">
                <div className="flex-1 min-h-0 bg-white/5 rounded-lg p-3 font-mono text-xs text-red-300 flex flex-col">
                  <textarea
                    value={dirtyData}
                    onChange={(e) => setDirtyData(e.target.value)}
                    placeholder='00: 450, 01: 52, 10: 48, 11: 474'
                    className="w-full flex-1 min-h-0 bg-transparent outline-none resize-none scrollbar-hide"
                  />
                </div>

                {mitigationMethod === 'zne' && (
                  <div className="flex-1 min-h-0 bg-white/5 rounded-lg p-3 font-mono text-xs text-amber-200 flex flex-col">
                    <span className="text-[9px] text-gray-400 uppercase mb-1">Conteggi alla scala rumore {zneScale2Factor}x</span>
                    <textarea
                      value={zneScale2Data}
                      onChange={(e) => setZneScale2Data(e.target.value)}
                      className="w-full flex-1 min-h-0 bg-transparent outline-none resize-none scrollbar-hide"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleDenoise}
                disabled={isProcessing}
                className="shrink-0 w-full py-3 bg-quantum-primary text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? <Sparkles className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                {isProcessing ? t('calculatingCorrection') : t('applyMitigation')}
              </button>
            </div>

            {/* Mitigated Side */}
            <div className="flex flex-col h-full min-h-0 overflow-y-auto scrollbar-hide gap-3">
              {mitigatedData ? (
                <>
                  {mitigatedData.aiNote && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[10px] text-amber-200 font-mono">
                      {mitigatedData.aiNote}
                    </div>
                  )}

                  <div className="quantum-card border-green-500/30 bg-green-500/5 p-4">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                      <h3 className="text-[10px] font-bold text-green-400 uppercase flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {mitigatedData.method === 'ZNE_RICHARDSON'
                          ? 'ZNE Richardson Reale'
                          : `Matrice Inversa (M⁻¹)^⊗${mitigatedData.numQubits}`}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-white/10 text-gray-200 text-[9px] font-mono rounded">
                          Shift L1: {mitigatedData.l1ShiftPct}%
                        </span>
                        <span className="px-2 py-0.5 bg-green-500 text-black text-[9px] font-bold rounded">
                          {t('opt_fidelity_badge')} {mitigatedData.fidelityDeltaPct >= 0 ? '+' : ''}{mitigatedData.fidelityDeltaPct}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      {Object.entries(mitigatedData.mitigated).map(([state, val]) => {
                        const value = val as number;
                        const originalValue = (mitigatedData.original[state] || 0) as number;
                        const percentage = (value / mitigatedData.totalShots) * 100;
                        const originalPercentage = (originalValue / mitigatedData.totalShots) * 100;

                        return (
                          <div key={state} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-white">|{state}⟩ ({value} shots)</span>
                              <span className="text-green-400">
                                {percentage.toFixed(1)}%{' '}
                                <span className="text-gray-500 text-[9px] italic">
                                  ({t('opt_was')} {originalPercentage.toFixed(1)}% · {originalValue})
                                </span>
                              </span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                              <div
                                className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 bg-quantum-primary/5 border border-quantum-primary/20 rounded-2xl">
                    <h4 className="text-[10px] font-bold text-quantum-primary uppercase mb-2 flex items-center justify-between">
                      <span>{t('noiseExplanation')}</span>
                      <span className="text-[9px] text-gray-400">
                        {mitigatedData.aiUsed ? `Diagnosi ${mitigatedData.aiModel}` : 'Analisi Matematica Reale'}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {mitigatedData.explanation}
                    </p>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <BarChart3 className="w-12 h-12 text-gray-800 mb-4" />
                  <p className="text-sm text-gray-500 italic max-w-xs">{t('emptyDenoisePrompt')}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
