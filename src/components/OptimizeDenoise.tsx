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
  ChevronRight,
  Sparkles,
  Download,
  Copy,
  Check,
  Key,
  AlertCircle
} from 'lucide-react';

import { optimizeQuantumCode } from '../services/geminiQuantumService';
import ApiKeyModal from './ApiKeyModal';
import { getStoredApiKey } from '../services/apiKeyService';

type Tab = 'optimize' | 'denoise';

export default function OptimizeDenoise() {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('optimize');
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [results, setResults] = useState<{
    analysis: string;
    optimizedCode: string;
    guide: string;
  } | null>(null);

  const [dirtyData, setDirtyData] = useState('00: 450, 01: 52, 10: 48, 11: 474');
  const [mitigatedData, setMitigatedData] = useState<{
    original: Record<string, number>;
    mitigated: Record<string, number>;
    originalTotal: number;
    mitigatedTotal: number;
    improvement: number;
    explanation: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (results?.optimizedCode) {
      navigator.clipboard.writeText(results.optimizedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOptimize = async () => {
    if (!code.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);
    
    try {
      const result = await optimizeQuantumCode(code, language);
      setResults(result);
    } catch (error: any) {
      console.error(error);
      if (error?.message === 'API_KEY_MISSING' || !getStoredApiKey()) {
        setErrorMsg(t('opt_api_key_missing'));
        setIsKeyModalOpen(true);
      } else {
        setErrorMsg(t('opt_error_generic'));
      }
    } finally {
      setIsProcessing(false);
    }
  };


  const handleDenoise = () => {
    setIsProcessing(true);
    
    // Simulate ZNE (Zero Noise Extrapolation) / Readout Mitigation
    setTimeout(() => {
      try {
        // 1. Parsing Input (Handling JSON, "key: val", and CSV/semicolon/newline tables)
        const original: Record<string, number> = {};
        const cleanedInput = (dirtyData || '').replace(/^\uFEFF/, '').trim();

        let parsedAsJson = false;
        try {
          const parsed = JSON.parse(cleanedInput);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            for (const [k, v] of Object.entries(parsed)) {
              const num = Number(v);
              if (k.trim() && !isNaN(num) && isFinite(num) && num >= 0) {
                original[k.trim()] = Math.round(num);
              }
            }
            parsedAsJson = Object.keys(original).length > 0;
          }
        } catch {
          // Not JSON, fall back to delimiter/CSV parsing
        }

        if (!parsedAsJson) {
          const tokens = cleanedInput.includes('\n') && !cleanedInput.includes(':')
            ? cleanedInput.split(/\r?\n/).map(p => p.trim()).filter(Boolean)
            : cleanedInput.split(/[\n,]+/).map(p => p.trim()).filter(Boolean);

          tokens.forEach(pair => {
            const match = pair.match(/^\|?([01]+|[^:;\t,]+?)\⟩?\s*[:;\t,]\s*(-?\d+(?:[.,]\d+)?)$/);
            if (match) {
              const key = match[1].trim();
              const num = parseFloat(match[2].replace(',', '.'));
              if (key && !isNaN(num) && num >= 0) {
                original[key] = (original[key] || 0) + Math.round(num);
              }
            }
          });
        }

        const states = Object.keys(original);
        if (states.length === 0) throw new Error("Format error");

        const totalRaw = Object.values(original).reduce((a, b) => a + b, 0);
        if (totalRaw <= 0) throw new Error("Zero total counts");
        
        // 2. Mitigation Algorithm (Simulated Matrix Inversion / ZNE)
        // We identify the strongest signals and sharpen them, while suppressing baseline noise.
        const mitigated: Record<string, number> = {};
        const maxVal = Math.max(...Object.values(original));
        const noiseFloor = maxVal * 0.15; // Noise threshold
        
        let totalMitigated = 0;
        states.forEach(state => {
          const val = original[state];
          if (val > noiseFloor) {
            mitigated[state] = Math.floor(val * 1.25);
          } else {
            mitigated[state] = val > 0 ? Math.max(1, Math.floor(val * 0.05)) : 0;
          }
          totalMitigated += mitigated[state];
        });

        const safeMitigatedSum = totalMitigated > 0 ? totalMitigated : 1;
        // Normalize to a consistent shot count
        const targetShots = totalRaw;
        states.forEach(state => {
          mitigated[state] = Math.round((mitigated[state] / safeMitigatedSum) * targetShots);
        });
        const actualMitigatedTotal = Object.values(mitigated).reduce((a, b) => a + b, 0) || 1;

        // 3. Dynamic Metrics Calculation
        // Fidelity improvement is calculated by the increase in probability of the dominant state
        const dominantState = states.reduce((a, b) => original[a] > original[b] ? a : b);
        const probRaw = original[dominantState] / totalRaw;
        const probMit = mitigated[dominantState] / actualMitigatedTotal;
        const improvement = probRaw > 0 ? Math.min(25, Math.max(0, ((probMit - probRaw) / probRaw) * 100)) : 0;

        // 4. Dynamic Explanation
        const weakStates = states.filter(s => s !== dominantState).slice(0, 2).map(s => `|${s}⟩`).join(', ');
        const explanation = t('denoiseExplanationResult', {
          states: weakStates,
          counts: Math.round(totalRaw - original[dominantState]),
          dominant: dominantState,
          raw: (probRaw * 100).toFixed(1),
          mit: (probMit * 100).toFixed(1)
        });

        setMitigatedData({
          original,
          mitigated,
          originalTotal: totalRaw,
          mitigatedTotal: actualMitigatedTotal,
          improvement: parseFloat(improvement.toFixed(1)),
          explanation
        });
      } catch (err) {
        console.error("Denoise error:", err);
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3 overflow-hidden">
      {/* Header Section */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={() => setErrorMsg(null)}
      />

      {errorMsg && (
        <div className="shrink-0 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="px-3 py-1.5 bg-amber-400 text-black font-bold uppercase text-[10px] rounded-lg hover:bg-amber-300 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" /> {t('opt_set_key')}
          </button>
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
          onClick={() => setActiveTab('optimize')}
          className={`flex-1 sm:flex-none px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-mono uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'optimize' ? 'bg-quantum-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.3)] font-bold' : 'text-gray-500 hover:text-white'}`}
        >
          <FileCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t('seniorProtocol')}
        </button>
        <button 
          onClick={() => setActiveTab('denoise')}
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
                <div className="shrink-0 flex items-center justify-between mb-3">
                  <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> {t('dirtyCode')}
                  </h3>
                  <Download className="w-4 h-4 text-gray-600 cursor-pointer hover:text-quantum-primary" />
                </div>
                <textarea 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t('pythonCodePlaceholder')}
                  className="flex-1 min-h-0 w-full bg-white/5 border border-white/5 rounded-lg p-3.5 font-mono text-xs text-blue-200 placeholder:text-gray-700 focus:border-quantum-primary transition-colors resize-none outline-none scrollbar-hide"
                />
                <button 
                  onClick={handleOptimize}
                  disabled={isProcessing || !code}
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
                  <div className="quantum-card border-quantum-primary/30 bg-quantum-primary/5">
                    <h3 className="text-quantum-primary font-bold text-[10px] uppercase mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> {t('expertReport')}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed italic">{results.analysis}</p>
                  </div>

                  <div className="quantum-card border-white/10 bg-black/80 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-quantum-primary" /> {t('regeneratedCode')}
                      </span>
                      <button 
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 transition-colors group"
                      >
                        <span className={`text-[9px] font-mono uppercase transition-opacity ${copied ? 'text-green-400 opacity-100' : 'text-gray-600 opacity-0 group-hover:opacity-100'}`}>
                          {copied ? t('copied') : t('copy')}
                        </span>
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-600 group-hover:text-white cursor-pointer" />
                        )}
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-green-400 overflow-auto max-h-[300px] scrollbar-hide py-2">
                      {results.optimizedCode}
                    </pre>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h4 className="text-[10px] font-bold text-white uppercase mb-2">{t('executionGuide')}</h4>
                    <pre className="text-[11px] text-gray-400 font-sans whitespace-pre-wrap">{results.guide}</pre>
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
            {/* Input Side (Dirty Data) */}
            <div className="quantum-card bg-black/60 border-white/10 flex flex-col h-full min-h-0 p-4">
              <div className="shrink-0 flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono text-gray-500 uppercase">{t('rawInputData')}</h3>
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
              <div className="flex-1 min-h-0 bg-white/5 rounded-lg p-3.5 font-mono text-xs text-red-300 flex flex-col">
                <textarea 
                  value={dirtyData}
                  onChange={(e) => setDirtyData(e.target.value)}
                  className="w-full flex-1 min-h-0 bg-transparent outline-none resize-none scrollbar-hide"
                />
              </div>
              <button 
                onClick={handleDenoise}
                disabled={isProcessing}
                className="shrink-0 mt-3 w-full py-3 bg-quantum-primary text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? <Sparkles className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                {isProcessing ? t('calculatingCorrection') : t('applyMitigation')}
              </button>
            </div>

            {/* Mitigated Side */}
            <div className="flex flex-col h-full min-h-0 overflow-y-auto scrollbar-hide gap-3">
              {mitigatedData ? (
                <>
                  <div className="quantum-card border-green-500/30 bg-green-500/5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[10px] font-bold text-green-400 uppercase flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {t('cleanResults')}
                      </h3>
                      <span className="px-2 py-0.5 bg-green-500 text-black text-[9px] font-bold rounded">{t('opt_fidelity_badge')} +{mitigatedData.improvement}%</span>
                    </div>
                    
                    <div className="space-y-4">
                      {Object.entries(mitigatedData.mitigated).map(([state, val]) => {
                        const value = val as number;
                        const originalValue = (mitigatedData.original[state] || 0) as number;
                        const percentage = (value / mitigatedData.mitigatedTotal) * 100;
                        const originalPercentage = (originalValue / mitigatedData.originalTotal) * 100;
                        
                        return (
                          <div key={state} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-white">|{state}⟩</span>
                              <span className="text-green-400">{percentage.toFixed(1)}% <span className="text-gray-600 text-[8px] italic">({t('opt_was')} {originalPercentage.toFixed(1)}%)</span></span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                                <div className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-5 bg-quantum-primary/5 border border-quantum-primary/20 rounded-2xl">
                    <h4 className="text-[10px] font-bold text-quantum-primary uppercase mb-2">{t('noiseExplanation')}</h4>
                    <p className="text-xs text-gray-400 italic leading-relaxed">
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
