import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Cpu, 
  Zap, 
  Code2, 
  Send, 
  User, 
  Bot, 
  CheckCircle2, 
  RotateCcw,
  Layout,
  Play,
  FileCode,
  Copy,
  Check,
  BrainCircuit,
  Settings2,
  BarChart4
} from 'lucide-react';
import { useTranslation } from '../lib/TranslationContext';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  type?: 'question' | 'summary' | 'allocation';
}

interface AssetData {
  name: string;
  q1?: number; // RY
  q2?: number; // RX
  q3?: string; // RZ
}

interface SharedData {
  q4?: string; // SX
  q5?: string; // X
  q6?: boolean; // CNOT
}

interface Props {
  onSwitchToBI?: () => void;
}

export default function CrossCode({ onSwitchToBI }: Props) {
  const { t } = useTranslation();
  
  // Interview State
  const [phase, setPhase] = useState<'init' | 'asset_loop' | 'global' | 'allocation' | 'finished'>('init');
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState(1); // 1: Q1, 2: Q2, 3: Q3
  const [globalStep, setGlobalStep] = useState(4); // Starts from Q4

  // Data Store
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [shared, setShared] = useState<SharedData>({});
  const [numAssets, setNumAssets] = useState(0);

  // Chat/UI State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pythonCode, setPythonCode] = useState('');
  const [qasmCode, setQasmCode] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial Message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        text: t('cross_welcome'),
      },
      {
        id: 'q0',
        role: 'bot',
        text: t('cross_q0'),
        type: 'question'
      }
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (role: 'user' | 'bot', text: string, type?: 'question' | 'summary' | 'allocation') => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text, type }]);
  };

  const parseNumAssets = (text: string) => {
    const match = text.match(/\d+/);
    let n = match ? parseInt(match[0]) : 1;
    
    // Attempt to extract names
    let names: string[] = [];
    if (text.includes(':')) {
      names = text.split(':')[1].split(',').map(s => s.trim()).filter(Boolean);
      if (names.length > n) n = names.length;
    }
    
    setNumAssets(n);
    // Pad names if needed
    while(names.length < n) names.push(`Asset ${names.length + 1}`);
    names = names.slice(0, n);
    
    const initialAssets = names.map(name => ({ name }));
    setAssets(initialAssets);
    return { n, names };
  };

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    const userVal = input.trim();
    addMessage('user', userVal);
    setInput('');
    setIsProcessing(true);

    setTimeout(() => {
      processInterview(userVal);
      setIsProcessing(false);
    }, 400);
  };

  const processInterview = (val: string) => {
    if (phase === 'init') {
      const { n, names } = parseNumAssets(val);
      setPhase('asset_loop');
      addMessage('bot', t('cross_start_analysis', { count: n }));
      addMessage('bot', t('cross_q1', { name: names[0] }), 'question');
    } 
    else if (phase === 'asset_loop') {
      const currentAsset = assets[currentAssetIndex];
      const newAssets = [...assets];

      if (currentSubStep === 1) {
        newAssets[currentAssetIndex].q1 = parseFloat(val) || 0;
        setAssets(newAssets);
        setCurrentSubStep(2);
        addMessage('bot', t('cross_q2', { name: currentAsset.name }), 'question');
      } 
      else if (currentSubStep === 2) {
        if (val.toUpperCase() !== 'NO') {
          newAssets[currentAssetIndex].q2 = parseFloat(val) || 0;
          setAssets(newAssets);
        }
        setCurrentSubStep(3);
        addMessage('bot', t('cross_q3', { name: currentAsset.name }), 'question');
      } 
      else if (currentSubStep === 3) {
        newAssets[currentAssetIndex].q3 = val;
        setAssets(newAssets);
        
        if (currentAssetIndex < numAssets - 1) {
          const nextIndex = currentAssetIndex + 1;
          setCurrentAssetIndex(nextIndex);
          setCurrentSubStep(1);
          addMessage('bot', t('cross_next_asset', { name: newAssets[nextIndex].name }));
          addMessage('bot', t('cross_q1_repeat', { name: newAssets[nextIndex].name }), 'question');
        } else {
          setPhase('global');
          addMessage('bot', t('cross_individual_complete'));
          addMessage('bot', t('cross_q4'), 'question');
        }
      }
    } 
    else if (phase === 'global') {
      if (globalStep === 4) {
        if (val.toUpperCase() !== 'NO') setShared(prev => ({ ...prev, q4: val }));
        setGlobalStep(5);
        addMessage('bot', t('cross_q5'), 'question');
      } 
      else if (globalStep === 5) {
        if (val.toUpperCase() !== 'NO') setShared(prev => ({ ...prev, q5: val }));
        setGlobalStep(6);
        addMessage('bot', t('cross_q6'), 'question');
      } 
      else if (globalStep === 6) {
        setShared(prev => ({ ...prev, q6: val.toUpperCase() === 'SI' || val.toUpperCase() === 'YES' }));
        setPhase('allocation');
        showAllocationOptions();
      }
    }
  };

  const showAllocationOptions = () => {
    let activeVars = 0;
    assets.forEach(a => {
      activeVars += 1; // Q1
      if (a.q2 !== undefined) activeVars += 1;
      activeVars += 1; // Q3
    });
    if (shared.q4) activeVars += 1;
    if (shared.q5) activeVars += 1;

    // AI Rec Logic
    // Option A: 1 Qubit per Asset + 1 shared if Q4/Q5 (if we want to be smart)
    // For simplicity, let's say AI Rec (N) = AssetsCount + (Q4?1:0) + (Q5?1:0)
    const nA = numAssets + (shared.q4 ? 1 : 0) + (shared.q5 ? 1 : 0);
    const nB = activeVars; // One per variable

    addMessage('bot', t('cross_summary', { vars: activeVars, assets: numAssets }), 'summary');
    addMessage('bot', t('cross_ai_hint', { qubits: nA }), 'allocation');
    
    // We'll use buttons in the UI for allocation choice
  };

  const finalizeAllocation = (choice: 'A' | 'B' | 'C', manualN?: number) => {
    let N = 1;
    let alloc: { assetQubits: number[], q4Qubit?: number, q5Qubit?: number } = { assetQubits: [] };

    const nA = numAssets + (shared.q4 ? 1 : 0) + (shared.q5 ? 1 : 0);
    let totalVars = 0;
    assets.forEach(a => {
        totalVars += 2; // Q1, Q3 (Q2 optional)
        if (a.q2 !== undefined) totalVars += 1;
    });
    if (shared.q4) totalVars += 1;
    if (shared.q5) totalVars += 1;

    if (choice === 'A') {
      N = nA;
      assets.forEach((_, i) => alloc.assetQubits.push(i));
      let nextQ = numAssets;
      if (shared.q4) alloc.q4Qubit = nextQ++;
      if (shared.q5) alloc.q5Qubit = nextQ++;
    } else if (choice === 'B') {
      N = totalVars;
      let nextQ = 0;
      assets.forEach(() => {
        alloc.assetQubits.push(nextQ);
        nextQ += (assets[0].q2 !== undefined ? 3 : 2); // Approximation for simple logic
      });
      // Correct precision logic:
      let q = 0;
      assets.forEach((_, i) => {
          alloc.assetQubits[i] = q; // Q1 qubit
          q += (assets[i].q2 !== undefined ? 2 : 1) + 1; // plus Q3
      });
      if (shared.q4) alloc.q4Qubit = q++;
      if (shared.q5) alloc.q5Qubit = q++;
      N = q;
    } else {
      N = manualN || 1;
      assets.forEach((_, i) => alloc.assetQubits.push(i % N));
      if (shared.q4) alloc.q4Qubit = (assets.length) % N;
      if (shared.q5) alloc.q5Qubit = (assets.length + 1) % N;
    }

    N = Math.min(Math.max(N, 1), 10);
    generateResults(N, alloc);
    setPhase('finished');
  };

  const generateResults = (N: number, alloc: any) => {
    let py = '';
    let qasm = '';
    let guide = '';

    assets.forEach((a, i) => {
      const qIdx = alloc.assetQubits[i];
      const ryVal = (a.q1 || 0) / 10;
      
      py += `# [ASSET ${i + 1}] ${a.name}: Tasso ${a.q1}% (Ry rotation)\n`;
      py += `circuit.ry(${ryVal.toFixed(4)}, qr[${qIdx}])\n`;
      qasm += `// [ASSET ${i + 1}] ${a.name}: Tasso ${a.q1}% (Ry rotation)\n`;
      qasm += `ry(${ryVal.toFixed(4)}) q[${qIdx}];\n`;
      guide += `Qubit q[${qIdx}] ➔ Trascina [ RY ] | Parametro: ${ryVal.toFixed(4)} (per ${a.name})\n`;

      if (a.q2 !== undefined) {
        const rxVal = a.q2 / 10;
        py += `# [ASSET ${i + 1}] ${a.name}: Rischio Fisso ${a.q2}% (Rx rotation)\n`;
        py += `circuit.rx(${rxVal.toFixed(4)}, qr[${qIdx}])\n`;
        qasm += `// [ASSET ${i + 1}] ${a.name}: Rischio Fisso ${a.q2}% (Rx rotation)\n`;
        qasm += `rx(${rxVal.toFixed(4)}) q[${qIdx}];\n`;
        guide += `Qubit q[${qIdx}] ➔ Trascina [ RX ] | Parametro: ${rxVal.toFixed(4)} (per ${a.name})\n`;
      }

      const t = a.q3?.toLowerCase() || '';
      let rzAngle = 'np.pi / 8';
      let rzQasm = '0.3927';
      if (t.includes('anni') || t.includes('anno')) { rzAngle = 'np.pi / 2'; rzQasm = '1.5708'; }
      else if (t.includes('mesi') || t.includes('mese')) { rzAngle = 'np.pi / 4'; rzQasm = '0.7854'; }
      
      py += `# [ASSET ${i + 1}] ${a.name}: Scadenza ${a.q3} (Rz phase)\n`;
      py += `circuit.rz(${rzAngle}, qr[${qIdx}])\n\n`;
      qasm += `// [ASSET ${i + 1}] ${a.name}: Scadenza ${a.q3} (Rz phase)\n`;
      qasmGates: qasm += `rz(${rzQasm}) q[${qIdx}];\n\n`;
      guide += `Qubit q[${qIdx}] ➔ Trascina [ RZ ] | Parametro: ${rzQasm} (per ${a.name})\n`;
    });

    if (shared.q4) {
      const qIdx = alloc.q4Qubit !== undefined ? alloc.q4Qubit : 0;
      py += `# [SCENARIO] Pareggio 50/50: ${shared.q4} (Sx gate)\n`;
      py += `circuit.sx(qr[${qIdx}])\n\n`;
      qasm += `// [SCENARIO] Pareggio 50/50: ${shared.q4} (Sx gate)\n`;
      qasm += `sx q[${qIdx}];\n\n`;
      guide += `Qubit q[${qIdx}] ➔ Trascina [ SX ] (per ${shared.q4})\n`;
    }

    if (shared.q5) {
      const qIdx = alloc.q5Qubit !== undefined ? alloc.q5Qubit : 0;
      if (shared.q6) {
        // CNOT logic
        const controlQ = alloc.assetQubits[0];
        const targetQ = qIdx;
        py += `# [RELAZIONE] Causa: ${assets[0].name} ➔ Target: ${shared.q5} (CNOT gate)\n`;
        py += `circuit.cx(qr[${controlQ}], qr[${targetQ}])\n\n`;
        qasm += `// [RELAZIONE] Causa: ${assets[0].name} ➔ Target: ${shared.q5} (CNOT gate)\n`;
        qasm += `cx q[${controlQ}], q[${targetQ}];\n\n`;
        guide += `Qubit q[${controlQ}] ➔ [ • ] Controllo | Qubit q[${targetQ}] ➔ [ ⊕ ] Target CNOT\n`;
      } else {
        py += `# [EMERGENZA] Switch di Blocco: ${shared.q5} (X gate)\n`;
        py += `circuit.x(qr[${qIdx}])\n\n`;
        qasm += `// [EMERGENZA] Switch di Blocco: ${shared.q5} (X gate)\n`;
        qasm += `x q[${qIdx}];\n\n`;
        guide += `Qubit q[${qIdx}] ➔ Trascina [ X ] (per ${shared.q5})\n`;
      }
    }

    const pyFinal = `[START_PYTHON]
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

# CONFIGURAZIONE HARDWARE ASSEGNATA
qr = QuantumRegister(${N}, 'q')
cr = ClassicalRegister(${N}, 'c')
circuit = QuantumCircuit(qr, cr)

# --- ASSEGNAZIONE VARIABILI E COSTANTI DA QUESTIONARIO ---
${py}
# Misurazione individuale obbligatoria
circuit.measure(qr, cr)
[END_PYTHON]`;

    let measures = '';
    for(let i=0; i<N; i++) measures += `measure q[${i}] -> c[${i}];\n`;

    const qasmFinal = `[START_COMPOSER]
### 1. GUIDA VISIVA AI PULSANTI (GATE) DA TRASCINARE
${guide}

### 2. CODICE OPENQASM 2.0 (PANNELLO DI DESTRA)
OPENQASM 2.0;
include "qelib1.inc";

qreg q[${N}];
creg c[${N}];

${qasm}
// Misurazione esplicita per qubit
${measures}
[END_COMPOSER]`;

    setPythonCode(pyFinal);
    setQasmCode(qasmFinal);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const startReset = () => {
    setPhase('init');
    setCurrentAssetIndex(0);
    setCurrentSubStep(1);
    setGlobalStep(4);
    setAssets([]);
    setShared({});
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        text: t('cross_welcome'),
      },
      {
        id: 'q0',
        role: 'bot',
        text: t('cross_q0'),
        type: 'question'
      }
    ]);
    setPythonCode('');
    setQasmCode('');
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-black/60 to-black/40 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-quantum-primary to-transparent opacity-30" />
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="p-3 sm:p-4 bg-quantum-primary/10 rounded-xl sm:rounded-2xl border border-quantum-primary/20 shadow-[0_0_20px_rgba(0,242,255,0.1)]">
            <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8 text-quantum-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-display font-black text-white uppercase tracking-tighter">
              Cross Code <span className="text-quantum-primary">{t('cross_ai_engine')}</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-gray-500 font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                {t('cross_interface_v35')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <button 
            onClick={onSwitchToBI}
            className="flex-1 sm:flex-none px-3 py-2 bg-quantum-primary text-black hover:bg-quantum-secondary hover:text-white rounded-lg sm:rounded-xl transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)] flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest"
          >
            <BarChart4 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {t('cross_bi_btn')}
          </button>
          <button 
            onClick={startReset}
            className="flex-1 sm:flex-none px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg sm:rounded-xl transition-all border border-white/5 flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest"
          >
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {t('cross_reset')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-[500px] lg:h-[750px]">
        {/* INTERVIEW CHAT */}
        <div className="quantum-card bg-black/60 flex flex-col h-full overflow-hidden border-white/10 backdrop-blur-2xl relative shadow-2xl">
          <div className="flex items-center justify-between mb-2 pb-4 border-b border-white/5 mx-6 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-quantum-primary" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('cross_guided_transpiler')}</span>
            </div>
            <div className="px-2 py-1 bg-quantum-primary/5 border border-quantum-primary/20 rounded-md">
                <span className="text-[9px] font-mono text-quantum-primary">PHASE: {phase.toUpperCase()}</span>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-6 px-6 pr-4 scrollbar-hide py-4"
          >
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`p-2.5 rounded-xl h-fit shrink-0 shadow-lg ${m.role === 'user' ? 'bg-quantum-secondary/20 order-last' : 'bg-quantum-primary/20'}`}>
                    {m.role === 'user' ? <User className="w-4 h-4 text-quantum-secondary" /> : <Bot className="w-4 h-4 text-quantum-primary" />}
                  </div>
                  <div className={`p-5 rounded-2xl text-[11px] leading-relaxed font-mono relative overflow-hidden ${
                    m.role === 'user' 
                      ? 'bg-quantum-secondary/10 border border-quantum-secondary/30 text-quantum-secondary' 
                      : 'bg-white/5 border border-white/10 text-gray-300'
                  }`}>
                    {m.role === 'bot' && <div className="absolute top-0 left-0 w-1 h-full bg-quantum-primary/30" />}
                    <p className="whitespace-pre-line relative z-10">{m.text}</p>
                    
                    {m.type === 'allocation' && phase === 'allocation' && (
                      <div className="mt-8 grid grid-cols-1 gap-3">
                         <button 
                          onClick={() => finalizeAllocation('A')}
                          className="group relative p-4 bg-quantum-primary/5 hover:bg-quantum-primary/20 border border-quantum-primary/40 rounded-2xl transition-all text-left"
                         >
                            <div className="flex items-center gap-3 mb-1">
                                <span className="bg-quantum-primary text-black text-[9px] font-black px-1.5 rounded">{t('cross_op_a')}</span>
                                <span className="text-white text-[10px] font-bold">{t('cross_op_a_title')}</span>
                            </div>
                            <p className="text-[9px] text-gray-500 leading-tight">{t('cross_op_a_desc')}</p>
                         </button>

                         <button 
                          onClick={() => finalizeAllocation('B')}
                          className="group relative p-4 bg-quantum-secondary/5 hover:bg-quantum-secondary/20 border border-quantum-secondary/40 rounded-2xl transition-all text-left"
                         >
                            <div className="flex items-center gap-3 mb-1">
                                <span className="bg-quantum-secondary text-black text-[9px] font-black px-1.5 rounded">{t('cross_op_b')}</span>
                                <span className="text-white text-[10px] font-bold">{t('cross_op_b_title')}</span>
                            </div>
                            <p className="text-[9px] text-gray-500 leading-tight">{t('cross_op_b_desc')}</p>
                         </button>

                         <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-gray-700 text-white text-[9px] font-black px-1.5 rounded">{t('cross_op_c')}</span>
                                <span className="text-white text-[10px] font-bold">{t('cross_op_c_title')}</span>
                            </div>
                            <div className="flex gap-2">
                                {[1,2,3,4,5].map(n => (
                                    <button 
                                        key={n}
                                        onClick={() => finalizeAllocation('C', n)}
                                        className="flex-1 py-1.5 bg-white/5 hover:bg-quantum-primary hover:text-black border border-white/10 rounded-lg text-[10px] font-bold transition-all"
                                    >
                                        {n}Q
                                    </button>
                                ))}
                            </div>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {isProcessing && (
                <div className="flex justify-start">
                    <div className="flex gap-4 items-center">
                        <div className="p-2.5 bg-quantum-primary/10 rounded-xl">
                            <Bot className="w-4 h-4 text-quantum-primary animate-pulse" />
                        </div>
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-quantum-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-quantum-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-quantum-primary rounded-full animate-bounce" />
                        </div>
                    </div>
                </div>
            )}
          </div>

          {(phase !== 'finished' && phase !== 'allocation') && (
            <div className="mt-4 flex gap-3 p-6 pt-4 border-t border-white/5 bg-black/20">
              <div className="flex-1 relative">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t('cross_sending')}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white placeholder:text-gray-700 focus:ring-1 focus:ring-quantum-primary/50 outline-none font-mono transition-all backdrop-blur-md"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none opacity-20">
                    <span className="w-1 h-3 bg-quantum-primary rounded-full" />
                    <span className="w-1 h-2 bg-quantum-primary rounded-full" />
                    <span className="w-1 h-4 bg-quantum-primary rounded-full" />
                </div>
              </div>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="p-4 bg-quantum-primary text-black rounded-2xl hover:bg-quantum-secondary hover:text-white transition-all shadow-[0_0_30px_rgba(0,242,255,0.2)] disabled:opacity-30 flex items-center justify-center min-w-[60px]"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* OUTPUT GENERATION */}
        <div className="flex flex-col h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {phase !== 'finished' ? (
              <motion.div 
                key="empty"
                className="flex-1 flex flex-col items-center justify-center quantum-card bg-black/40 border-dashed border-white/10 relative group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-quantum-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <Settings2 className="w-16 h-16 text-gray-800/50 mb-6 group-hover:rotate-180 transition-transform duration-[2000ms]" />
                <h3 className="text-[12px] font-black text-gray-500 uppercase tracking-[0.4em]">Hardware Standby</h3>
                <p className="text-[9px] text-gray-600 mt-4 text-center max-w-[240px] font-mono leading-relaxed uppercase tracking-wider">
                  {t('cross_standby_desc')}
                </p>
                <div className="mt-8 flex gap-2">
                    {[1,2,3].map(i => (
                        <span key={i} className={`w-1.5 h-1.5 rounded-full bg-gray-800 animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                className="flex-1 flex flex-col gap-6 overflow-hidden pb-4"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {/* Python Block */}
                <div className="flex-[0.8] flex flex-col quantum-card bg-black/90 overflow-hidden border-quantum-primary/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-quantum-primary/10 rounded-md">
                        <Code2 className="w-3.5 h-3.5 text-quantum-primary" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.1em] opacity-80">Qiskit Runtime</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(pythonCode, 'python')}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors group relative"
                    >
                      {copiedType === 'python' ? <Check className="w-4 h-4 text-green-500 animate-in zoom-in" /> : <Copy className="w-4 h-4 text-gray-500 group-hover:text-quantum-primary" />}
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto bg-black/60 rounded-xl border border-white/5 custom-scrollbar">
                    <pre className="text-[11px] font-mono text-quantum-primary/80 p-6 leading-relaxed">
                        <code>{pythonCode}</code>
                    </pre>
                  </div>
                </div>

                {/* OpenQASM Block */}
                <div className="flex-[1.2] flex flex-col quantum-card bg-black/90 overflow-hidden border-quantum-secondary/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-quantum-secondary/10 rounded-md">
                        <FileCode className="w-3.5 h-3.5 text-quantum-secondary" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.1em] opacity-80">IBM Composer Output</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(qasmCode, 'qasm')}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                    >
                      {copiedType === 'qasm' ? <Check className="w-4 h-4 text-green-500 animate-in zoom-in" /> : <Copy className="w-4 h-4 text-gray-500 group-hover:text-quantum-secondary" />}
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto bg-black/60 rounded-xl border border-white/5 custom-scrollbar">
                    <pre className="text-[11px] font-mono text-quantum-secondary/80 p-6 leading-relaxed">
                         <code>{qasmCode}</code>
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* IBM Quantum Composer Inspired Section - Always Visible at the Bottom */}
      <div className="w-full quantum-card bg-black/80 p-5 sm:p-8 border-white/10 shadow-3xl backdrop-blur-3xl overflow-hidden mt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-white/10 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <Layout className="w-5 h-5 text-quantum-primary" />
            <h3 className="text-xs sm:text-[14px] font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.3em]">IBM Quantum Composer <span className="text-quantum-primary">Inspired</span></h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <span className="text-[8px] sm:text-[9px] font-mono text-gray-400">Backend: ibm_oslo (Simulated)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
          {/* Gate Palette (adattato agli asset) */}
          <div className="xl:col-span-3 space-y-4 sm:space-y-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">{t('bi_gate_palette')}</h4>
              <div className="grid grid-cols-4 sm:grid-cols-2 gap-2 sm:gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 sm:p-3 bg-quantum-primary/20 border border-quantum-primary/40 rounded-lg sm:rounded-xl flex flex-col items-center gap-1 sm:gap-2 group transition-all hover:bg-quantum-primary/30"
                >
                  <span className="text-[10px] sm:text-xs font-black text-quantum-primary">RY</span>
                  <span className="text-[7px] text-gray-400 uppercase font-mono group-hover:text-white transition-colors truncate w-full text-center">{assets[0]?.name || 'ASSET_1'}</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 sm:p-3 bg-quantum-secondary/20 border border-quantum-secondary/40 rounded-lg sm:rounded-xl flex flex-col items-center gap-1 sm:gap-2 group transition-all hover:bg-quantum-secondary/30"
                >
                  <span className="text-[10px] sm:text-xs font-black text-quantum-secondary">RZ</span>
                  <span className="text-[7px] text-gray-400 uppercase font-mono group-hover:text-white transition-colors truncate w-full text-center">{assets[1]?.name || 'ASSET_2'}</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 sm:p-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl flex flex-col items-center gap-1 sm:gap-2 group transition-all hover:bg-white/20"
                >
                  <span className="text-[10px] sm:text-xs font-black text-white px-2">X</span>
                  <span className="text-[7px] text-gray-400 uppercase font-mono group-hover:text-white transition-colors">NOT</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 sm:p-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl flex flex-col items-center gap-1 sm:gap-2 group transition-all hover:bg-white/20"
                >
                  <span className="text-[10px] sm:text-xs font-black text-white px-2">H</span>
                  <span className="text-[7px] text-gray-400 uppercase font-mono group-hover:text-white transition-colors truncate">SUP</span>
                </motion.button>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-quantum-primary/5 rounded-2xl border border-quantum-primary/10">
               <p className="text-[9px] text-gray-400 font-mono italic leading-relaxed">
                 {t('cross_gate_desc')}
               </p>
            </div>
          </div>

          {/* Circuit Area */}
          <div className="xl:col-span-9 overflow-hidden">
            <div className="relative border border-white/10 bg-black/40 rounded-2xl sm:rounded-3xl p-4 sm:p-10 overflow-x-auto scrollbar-hide min-h-[300px] sm:min-h-[350px]">
              <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} 
              />
              
              <div className="relative z-10 min-w-[500px]">
                {/* Qubit Line 0 */}
                <div className="flex items-center gap-6 relative z-10 mb-16">
                  <div className="flex flex-col items-center w-16">
                    <span className="text-[11px] font-mono text-white font-bold leading-none">q[0]</span>
                    <span className="text-[8px] text-quantum-primary uppercase mt-1 font-black truncate w-full text-center">{assets[0]?.name || 'ASSET_1'}</span>
                  </div>
                  <div className="h-[2px] flex-1 bg-white/20 relative flex items-center">
                    <motion.div 
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute left-16 w-12 h-12 bg-quantum-primary text-black flex items-center justify-center font-black rounded-lg text-sm shadow-[0_0_20px_rgba(0,242,255,0.5)] cursor-move border border-white/20"
                    >
                      RY
                    </motion.div>
                    <div className="absolute left-40 w-10 h-10 bg-white/10 text-white flex items-center justify-center font-black rounded-full scale-75 border border-white/40 shadow-inner">
                      •
                    </div>
                  </div>
                </div>

                {/* Qubit Line 1 */}
                <div className="flex items-center gap-6 relative z-10 mb-8">
                  <div className="flex flex-col items-center w-16">
                    <span className="text-[11px] font-mono text-white font-bold leading-none">q[{assets.length > 1 ? 1 : 0}]</span>
                    <span className="text-[8px] text-quantum-secondary uppercase mt-1 font-black truncate w-full text-center">{assets[1]?.name || 'ASSET_2'}</span>
                  </div>
                  <div className="h-[2px] flex-1 bg-white/20 relative flex items-center">
                    <motion.div 
                      animate={{ x: [0, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                      className="absolute left-64 w-12 h-12 bg-quantum-secondary text-black flex items-center justify-center font-black rounded-lg text-sm shadow-[0_0_20px_rgba(255,111,0,0.4)] cursor-move border border-white/20"
                    >
                      RZ
                    </motion.div>
                    <div className="absolute left-40 w-10 h-10 bg-white/10 text-white flex items-center justify-center font-black rounded-lg text-xs border border-white/40 shadow-inner bg-black/40">
                      ⊕
                    </div>
                    {/* Connection Line */}
                    <div className="absolute left-[10.4rem] bottom-full h-16 w-[2px] bg-gradient-to-b from-white/40 via-white/10 to-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                  </div>
                </div>
              </div>

              {/* Measurement Line */}
              <div className="absolute right-12 top-0 bottom-0 w-[2px] bg-red-500/20 border-r border-dashed border-red-500/30 flex items-center justify-center">
                 <span className="rotate-90 text-[8px] font-mono text-red-500/50 uppercase tracking-[0.5em] translate-y-20">Measure_Block</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-6 px-0 sm:px-4">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-quantum-primary" />
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-mono">
                    {t('cross_angle')}: <span className="text-white">θ1 = 0.450 rad</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-quantum-secondary" />
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-mono">
                    {t('cross_phase')}: <span className="text-white">φ1 = 0.785 rad</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <button 
                  onClick={startReset}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg sm:rounded-xl transition-all text-[9px] sm:text-[10px] font-bold uppercase text-gray-400 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {t('cross_reset_circuit')}
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-quantum-primary text-black rounded-lg sm:rounded-xl transition-all text-[9px] sm:text-[10px] font-black uppercase shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 active:scale-95">
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {t('cross_run_backend')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add global styles for scrollbar if not exists
const styles = `
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
`;
