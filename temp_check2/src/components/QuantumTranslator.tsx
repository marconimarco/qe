import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../lib/TranslationContext';
import { 
  Code2, 
  Layers, 
  Terminal, 
  Sparkles, 
  Play, 
  RefreshCw, 
  Copy, 
  ChevronRight,
  Info,
  Upload,
  Download
} from 'lucide-react';

type Mode = 'python' | 'composer' | 'qasm';

export default function QuantumTranslator() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('python');
  const [circuit, setCircuit] = useState<string[]>(['H', 'CX', 'MEASURE']);
  const [pythonCode, setPythonCode] = useState('');
  const [qasmCode, setQasmCode] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const gates = ['H', 'X', 'Y', 'Z', 'CX', 'CCX', 'MEASURE', 'RESET'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      setIsTranslating(true);
      
      // Mock parsing logic
      // In a real app, we'd use regex or a parser to extract gates
      let newCircuit: string[] = [];
      
      if (file.name.endsWith('.py')) {
        // Better mock parsing for Python sequences
        const matches = content.match(/qc\.(h|cx|x|y|z|measure|reset|ccx)\(/gi);
        if (matches) {
          newCircuit = matches.map(m => {
            const gate = m.split('.')[1].split('(')[0].toUpperCase();
            return gate === 'MEASURE' ? 'MEASURE' : gate;
          });
        }
      } else if (file.name.endsWith('.qasm')) {
        // Better mock parsing for QASM sequences
        const lines = content.split('\n');
        lines.forEach(line => {
          const l = line.trim().toLowerCase();
          if (l.startsWith('h ')) newCircuit.push('H');
          else if (l.startsWith('cx ')) newCircuit.push('CX');
          else if (l.startsWith('x ')) newCircuit.push('X');
          else if (l.startsWith('y ')) newCircuit.push('Y');
          else if (l.startsWith('z ')) newCircuit.push('Z');
          else if (l.startsWith('measure ')) newCircuit.push('MEASURE');
          else if (l.startsWith('reset ')) newCircuit.push('RESET');
          else if (l.startsWith('ccx ')) newCircuit.push('CCX');
        });
      }

      if (newCircuit.length === 0) {
        newCircuit = ['H', 'CX', 'MEASURE']; // Fallback robusto
      }

      setCircuit(newCircuit.slice(0, 12)); // Limite di visualizzazione
      setTimeout(() => setIsTranslating(false), 800);
    };
    reader.readAsText(file);
  };

  const downloadFile = (content: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    generateCodes();
  }, [circuit]);

  const generateCodes = () => {
    // Basic Mock Translation Logic
    const qasm = `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[2];\ncreg c[2];\n${circuit.map(g => {
      if (g === 'H') return 'h q[0];';
      if (g === 'CX') return 'cx q[0],q[1];';
      if (g === 'MEASURE') return 'measure q -> c;';
      return `${g.toLowerCase()} q[0];`;
    }).join('\n')}`;

    const py = `from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2, 2)\n${circuit.map(g => {
      if (g === 'H') return 'qc.h(0)';
      if (g === 'CX') return 'qc.cx(0, 1)';
      if (g === 'MEASURE') return 'qc.measure([0,1], [0,1])';
      return `qc.${g.toLowerCase()}(0)`;
    }).join('\n')}\n\nqc.draw('mpl')`;

    setQasmCode(qasm);
    setPythonCode(py);
  };

  const handleTranslate = () => {
    setIsTranslating(true);
    setTimeout(() => setIsTranslating(false), 800);
  };

  const addGate = (gate: string) => {
    if (circuit.length < 12) {
      setCircuit([...circuit, gate]);
      handleTranslate();
    }
  };

  const removeGate = (index: number) => {
    const newCircuit = [...circuit];
    newCircuit.splice(index, 1);
    setCircuit(newCircuit);
    handleTranslate();
  };

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    counts: Record<string, number>;
    fidelity: number;
    jobId: string;
  } | null>(null);

  const handleRunBackend = () => {
    setIsExecuting(true);
    setExecutionResult(null);
    
    // Simulate Cloud Queue and Execution
    setTimeout(() => {
      const results: Record<string, number> = {
        '00': Math.random() * 0.5,
        '01': Math.random() * 0.2,
        '10': Math.random() * 0.2,
        '11': Math.random() * 0.6,
      };
      
      // Normalize
      const total = Object.values(results).reduce((a, b) => a + b, 0);
      Object.keys(results).forEach(k => results[k] = (results[k] / total) * 1024);

      setExecutionResult({
        counts: results,
        fidelity: 0.94 + Math.random() * 0.05,
        jobId: `job-${Math.random().toString(36).substring(7).toUpperCase()}`
      });
      setIsExecuting(false);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 pb-20">
      {/* Visual Composer (Method 2) */}
      <div className="lg:col-span-12">
        <div className="quantum-card border-quantum-secondary/30 bg-black/60 h-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-white font-display font-bold flex items-center gap-2 text-lg uppercase tracking-wider">
                <Layers className="w-5 h-5 text-quantum-secondary" />
                {t('composerTitle')}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{t('composerSubtitle')}</p>
            </div>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[11px] font-mono text-gray-400 hover:text-white hover:border-quantum-secondary transition-all cursor-pointer group shadow-[0_0_15px_rgba(157,0,255,0.08)]">
                <Upload className="w-4.5 h-4.5 group-hover:text-quantum-secondary group-hover:scale-110 transition-transform" />
                <span className="font-bold tracking-widest uppercase">{t('uploadSource')}</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".py,.qasm,.txt" />
              </label>
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                {(['composer', 'python', 'qasm'] as Mode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-4 py-1.5 rounded-md text-[10px] font-mono uppercase transition-all ${
                      mode === m ? 'bg-quantum-secondary text-white shadow-[0_0_15px_rgba(157,0,255,0.4)]' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {m === 'composer' ? t('visualMode') : t(m)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 pb-6 border-b border-white/5">
              {gates.map(gate => (
                <button
                  key={gate}
                  onClick={() => addGate(gate)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white font-bold font-mono hover:border-quantum-secondary hover:text-quantum-secondary transition-all active:scale-95"
                >
                  {gate}
                </button>
              ))}
            </div>

            {/* Visual Stave */}
            <div className="relative py-12 px-8 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden min-h-[200px]">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px)', backgroundSize: '100% 40px' }} />
              
              <div className="relative flex items-center gap-4 flex-wrap z-10">
                <span className="font-mono text-quantum-secondary text-sm mr-4">q[0] ───</span>
                <AnimatePresence mode="popLayout">
                  {circuit.map((gate, i) => (
                    <motion.div
                      key={`${gate}-${i}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={() => removeGate(i)}
                      className="w-12 h-12 rounded border border-quantum-secondary bg-quantum-secondary/20 flex items-center justify-center text-[10px] font-bold text-white cursor-pointer hover:bg-quantum-secondary transition-colors group shadow-[0_0_15px_rgba(157,0,255,0.2)]"
                    >
                      {gate}
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 rounded-full p-0.5">
                        <Terminal className="w-2 h-2" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="w-12 h-12 rounded border border-dashed border-gray-700 flex items-center justify-center text-gray-700 font-mono text-[10px]">
                  +
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Editors */}
      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Python Mode (Method 1) */}
        <div className="quantum-card border-white/10 bg-black/60 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-mono text-white/60 uppercase">Python (Qiskit v1.0)</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(pythonCode);
                }}
                className="p-1.5 hover:bg-white/5 rounded transition-colors"
                title={t('copyToClipboard')}
              >
                <Copy className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button 
                onClick={() => downloadFile(pythonCode, 'circuit.py')}
                className="p-1.5 hover:bg-white/5 rounded transition-colors"
                title={t('downloadPython')}
              >
                <Download className="w-3.5 h-3.5 text-quantum-secondary" />
              </button>
            </div>
          </div>
          <div className="flex-1 font-mono text-xs text-blue-100 leading-relaxed overflow-auto scrollbar-hide py-2">
            <pre className={isTranslating ? 'animate-pulse opacity-50' : ''}>
              {pythonCode}
            </pre>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-[9px] text-gray-500 uppercase">
             <Terminal className="w-3 h-3" /> {t('pythonLabel')}
          </div>
        </div>

        {/* OpenQASM Mode (Method 3) */}
        <div className="quantum-card border-white/10 bg-black/60 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-quantum-primary" />
              <span className="text-[10px] font-mono text-white/60 uppercase">OpenQASM 2.0 (ASM)</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(qasmCode);
                }}
                className="p-1.5 hover:bg-white/5 rounded transition-colors"
                title={t('copyToClipboard')}
              >
                <Copy className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button 
                onClick={() => downloadFile(qasmCode, 'circuit.qasm')}
                className="p-1.5 hover:bg-white/5 rounded transition-colors"
                title={t('downloadQasm')}
              >
                <Download className="w-3.5 h-3.5 text-quantum-primary" />
              </button>
            </div>
          </div>
          <div className="flex-1 font-mono text-xs text-quantum-primary/80 leading-relaxed overflow-auto scrollbar-hide py-2">
            <pre className={isTranslating ? 'animate-pulse opacity-50' : ''}>
              {qasmCode}
            </pre>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-[9px] text-gray-500 uppercase">
             <RefreshCw className="w-3 h-3" /> {t('qasmLabel')}
          </div>
        </div>
      </div>

      {/* Backend Results Sidebar/Overlay */}
      <AnimatePresence>
        {(isExecuting || executionResult) && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="lg:col-span-12 quantum-card border-quantum-secondary bg-quantum-secondary/5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-display font-bold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-quantum-secondary" />
                {t('backendResults')}
              </h3>
              {executionResult && (
                <button onClick={() => setExecutionResult(null)} className="text-gray-500 hover:text-white capitalize text-[10px]">{t('close')}</button>
              )}
            </div>

            {isExecuting ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-8 h-8 text-quantum-secondary animate-spin" />
                <div className="text-center">
                  <p className="text-sm text-white font-mono uppercase tracking-widest">{t('submittingToBackend')}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-1 italic">{t('queueStatus')}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <p className="text-[10px] font-mono text-gray-500 uppercase mb-4">{t('measurementHistogram')}</p>
                  <div className="flex items-end gap-2 h-40">
                    {Object.entries(executionResult!.counts).map(([state, val]) => {
                      const count = val as number;
                      return (
                        <div key={state} className="flex-1 flex flex-col items-center gap-2">
                          <div className="text-[9px] text-gray-400 font-mono">{Math.round(count)}</div>
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${(count / 1024) * 100}%` }}
                            className="w-full bg-quantum-secondary/40 border-t-2 border-quantum-secondary rounded-t-sm"
                          />
                          <div className="text-[10px] text-white font-mono">{state}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-[9px] text-gray-500 uppercase font-mono">{t('jobID')}</p>
                    <p className="text-xs text-white font-mono">{executionResult!.jobId}</p>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-[9px] text-gray-500 uppercase font-mono">{t('quantumFidelity')}</p>
                    <p className="text-xs text-green-400 font-mono">{(executionResult!.fidelity * 100).toFixed(2)}%</p>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-[9px] text-gray-500 uppercase font-mono">{t('status')}</p>
                    <p className="text-[10px] text-quantum-secondary flex items-center gap-1 font-mono">
                      <Play className="w-2.5 h-2.5 fill-current" /> {t('completed')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Info */}
      <div className="lg:col-span-12 p-6 bg-quantum-secondary/5 border border-quantum-secondary/20 rounded-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="p-4 bg-quantum-secondary/20 rounded-full">
          <Sparkles className="w-10 h-10 text-quantum-secondary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-white font-bold uppercase tracking-wider mb-2">{t('autoSync')}</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t('autoSyncDesc')}
          </p>
        </div>
        <button 
          onClick={handleRunBackend}
          disabled={isExecuting}
          className="flex items-center gap-2 px-8 py-4 bg-quantum-secondary text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(157,0,255,0.4)] transition-all uppercase tracking-widest text-xs disabled:opacity-50"
        >
          {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isExecuting ? t('running') : t('runOnBackend')}
        </button>
      </div>
    </div>
  );
}
