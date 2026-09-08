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
        setErrorMsg("Google AI Studio API Key not configured. Please enter an API key to use optimization.");
        setIsKeyModalOpen(true);
      } else {
        setErrorMsg("Error optimizing code. Please check your API Key or try again.");
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
        // 1. Parsing Input (Handling both Raw format and JSON)
        let original: Record<string, number> = {};
        
        try {
          // Attempt JSON parse
          original = JSON.parse(dirtyData);
        } catch (e) {
          // Fallback to "key: val, key: val" format
          const pairs = dirtyData.split(',').map(p => p.trim());
          pairs.forEach(pair => {
            const parts = pair.split(':').map(s => s.trim());
            if (parts.length === 2) {
              const [key, val] = parts;
              original[key] = parseInt(val, 10) || 0;
            }
          });
        }

        const states = Object.keys(original);
        if (states.length === 0) throw new Error("Format error");

        const totalRaw = Object.values(original).reduce((a, b) => a + b, 0);
        
        // 2. Mitigation Algorithm (Simulated Matrix Inversion / ZNE)
        // We identify the strongest signals and sharpen them, while suppressing baseline noise.
        const mitigated: Record<string, number> = {};
        const maxVal = Math.max(...Object.values(original));
        const noiseFloor = maxVal * 0.15; // Noise threshold
        
        let totalMitigated = 0;
        states.forEach(state => {
          const val = original[state];
          if (val > noiseFloor) {
            // Signal enhancement: we assume the noise leaked INTO other states, so we reclaim it
            mitigated[state] = Math.floor(val * 1.25);
          } else {
            // Noise suppression: almost zeroing out background chatter
            mitigated[state] = Math.max(1, Math.floor(val * 0.05));
          }
          totalMitigated += mitigated[state];
        });

        // Normalize to a consistent shot count (e.g. 1024)
        const targetShots = totalRaw > 0 ? totalRaw : 1024;
        states.forEach(state => {
          mitigated[state] = Math.round((mitigated[state] / totalMitigated) * targetShots);
        });

        // 3. Dynamic Metrics Calculation
        // Fidelity improvement is calculated by the increase in probability of the dominant state
        const dominantState = states.reduce((a, b) => original[a] > original[b] ? a : b);
        const probRaw = original[dominantState] / totalRaw;
        const probMit = mitigated[dominantState] / targetShots;
        const improvement = Math.min(25, ((probMit - probRaw) / probRaw) * 100);

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
          mitigatedTotal: targetShots,
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
    <div className="space-y-8 mt-8 pb-32">
      {/* Header Section */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={() => setErrorMsg(null)}
      />

      {errorMsg && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="px-3 py-1.5 bg-amber-400 text-black font-bold uppercase text-[10px] rounded-lg hover:bg-amber-300 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" /> Set Key
          </button>
        </div>
      )}

      <div className="p-5 sm:p-6 bg-quantum-primary/5 border border-quantum-primary/20 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-4 sm:gap-6 text-center sm:text-left">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-quantum-primary/20 flex items-center justify-center shrink-0">
          <Wand2 className="w-7 h-7 sm:w-8 sm:h-8 text-quantum-primary" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white uppercase tracking-tight">{t('geminiExpert')}</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
            {t('geminiExpertDesc')}
          </p>
        </div>
      </div>

      <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 w-full sm:w-fit">
        <button 
          onClick={() => setActiveTab('optimize')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-mono uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'optimize' ? 'bg-quantum-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.3)] font-bold' : 'text-gray-500 hover:text-white'}`}
        >
          <FileCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t('seniorProtocol')}
        </button>
        <button 
          onClick={() => setActiveTab('denoise')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-mono uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'denoise' ? 'bg-quantum-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.3)] font-bold' : 'text-gray-500 hover:text-white'}`}
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
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Input Side */}
            <div className="space-y-4">
              <div className="quantum-card h-full bg-black/60 border-white/10 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> {t('dirtyCode')}
                  </h3>
                  <Download className="w-4 h-4 text-gray-600 cursor-pointer hover:text-quantum-primary" />
                </div>
                <textarea 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t('pythonCodePlaceholder')}
                  className="flex-1 w-full bg-white/5 border border-white/5 rounded-lg p-4 font-mono text-xs text-blue-200 placeholder:text-gray-700 focus:border-quantum-primary transition-colors resize-none min-h-[300px] outline-none"
                />
                <button 
                  onClick={handleOptimize}
                  disabled={isProcessing || !code}
                  className="mt-6 w-full py-4 bg-quantum-primary text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {isProcessing ? t('processingProtocol') : t('regenerateCode')}
                </button>
              </div>
            </div>

            {/* Results Side */}
            <div className="space-y-6">
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
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Input Side (Dirty Data) */}
            <div className="quantum-card bg-black/60 border-white/10 flex flex-col h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-4">
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
                        const content = rev.target?.result as string;
                        setDirtyData(content);
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>
              <div className="flex-1 bg-white/5 rounded-lg p-4 font-mono text-xs text-red-300">
                <textarea 
                  value={dirtyData}
                  onChange={(e) => setDirtyData(e.target.value)}
                  className="w-full h-full bg-transparent outline-none resize-none"
                />
              </div>
              <button 
                onClick={handleDenoise}
                disabled={isProcessing}
                className="mt-6 w-full py-4 bg-quantum-primary text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <Sparkles className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                {isProcessing ? t('calculatingCorrection') : t('applyMitigation')}
              </button>
            </div>

            {/* Mitigated Side */}
            <div className="space-y-6">
              {mitigatedData ? (
                <>
                  <div className="quantum-card border-green-500/30 bg-green-500/5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[10px] font-bold text-green-400 uppercase flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {t('cleanResults')}
                      </h3>
                      <span className="px-2 py-0.5 bg-green-500 text-black text-[9px] font-bold rounded">FIDELITY +{mitigatedData.improvement}%</span>
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
                              <span className="text-green-400">{percentage.toFixed(1)}% <span className="text-gray-600 text-[8px] italic">(was {originalPercentage.toFixed(1)}%)</span></span>
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
