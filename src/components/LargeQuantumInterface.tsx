import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../lib/TranslationContext';
import { 
  Cpu, 
  TrendingUp, 
  Code2, 
  Activity, 
  Download, 
  Copy, 
  Check, 
  ChevronRight, 
  Sparkles, 
  Sliders,
  Play
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function LargeQuantumInterface() {
  const { t, language } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Interactive inputs for B2B Macro scenario
  const [inflationRate, setInflationRate] = useState(4.2);
  const [gdpStress, setGdpStress] = useState(25);
  const [interestRates, setInterestRates] = useState(3.5);
  const [selectedPreset, setSelectedPreset] = useState<'standard' | 'high_inflation' | 'global_recession'>('standard');

  const [activeTab, setActiveTab] = useState<'matrix' | 'code' | 'insights'>('matrix');

  // Simulated results based on the parameters
  const [simulationResult, setSimulationResult] = useState({
    advantageScore: 94.6,
    classicalTimeS: 1240,
    quantumTimeS: 0.12,
    fidelity: 99.82,
    probabilities: [
      { state: '|0000⟩', probability: 4.2 },
      { state: '|0010⟩', probability: 3.1 },
      { state: '|0100⟩', probability: 1.5 },
      { state: '|0101⟩', probability: 42.8 },
      { state: '|1010⟩', probability: 28.4 },
      { state: '|1100⟩', probability: 12.1 },
      { state: '|1111⟩', probability: 8.3 },
    ]
  });

  const loadPreset = (preset: 'standard' | 'high_inflation' | 'global_recession') => {
    setSelectedPreset(preset);
    if (preset === 'standard') {
      setInflationRate(4.2);
      setGdpStress(25);
      setInterestRates(3.5);
    } else if (preset === 'high_inflation') {
      setInflationRate(8.5);
      setGdpStress(45);
      setInterestRates(5.5);
    } else {
      setInflationRate(1.2);
      setGdpStress(80);
      setInterestRates(1.0);
    }
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      // Calculate realistic probability shifts based on inputs
      const multiplier = (inflationRate + gdpStress/10 + interestRates) / 10;
      const baseProb = Math.min(85, Math.max(10, 42.8 * multiplier));
      const secondProb = Math.max(5, 40 - baseProb / 2);
      
      setSimulationResult({
        advantageScore: parseFloat((85 + Math.random() * 14).toFixed(1)),
        classicalTimeS: Math.round(1000 + (inflationRate * 120)),
        quantumTimeS: parseFloat((0.08 + Math.random() * 0.1).toFixed(3)),
        fidelity: parseFloat((99.5 + Math.random() * 0.4).toFixed(2)),
        probabilities: [
          { state: '|0000⟩', probability: parseFloat((Math.random() * 6).toFixed(1)) },
          { state: '|0010⟩', probability: parseFloat((Math.random() * 5).toFixed(1)) },
          { state: '|0100⟩', probability: parseFloat((Math.random() * 3).toFixed(1)) },
          { state: '|0101⟩', probability: parseFloat(baseProb.toFixed(1)) },
          { state: '|1010⟩', probability: parseFloat(secondProb.toFixed(1)) },
          { state: '|1100⟩', probability: parseFloat((20 - secondProb/2).toFixed(1)) },
          { state: '|1111⟩', probability: parseFloat((5 + Math.random() * 5).toFixed(1)) },
        ]
      });
      setIsSimulating(false);
    }, 1200);
  };

  const codeString = `# Qiskit v1.x script generated for Macroeconomic Portfolio Optimization
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram
import numpy as np

# Portfolio & Macro parameters
inflation = ${inflationRate} / 100.0
gdp_shock = ${gdpStress} / 100.0
rates = ${interestRates} / 100.0

# Initialize 4-qubit circuit with state initialization
qc = QuantumCircuit(4, 4)

# Apply state preparation representative of macroeconomic parameters
qc.ry(2 * np.arccos(np.sqrt(1 - inflation)), 0)
qc.ry(2 * np.arccos(np.sqrt(1 - gdp_shock)), 1)
qc.ry(2 * np.arccos(np.sqrt(1 - rates)), 2)

# Entangle market variables with dynamic correlation gates
qc.cx(0, 1)
qc.cx(1, 2)
qc.cx(2, 3)

# Variational Ansätze for portfolio search space
qc.h(3)
qc.cx(3, 0)
qc.p(np.pi / 4, 1)

# Measurement back to classical registers
qc.measure_all()

# Run simulation on high-performance AerSimulator
simulator = AerSimulator()
compiled_circuit = qc.decompose()
result = simulator.run(compiled_circuit, shots=1024).result()
counts = result.get_counts()

print("Optimal state sequence found:", counts)`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Upper Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="quantum-card p-4 flex items-center justify-between bg-black/40 border border-white/10 rounded-xl relative overflow-hidden backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#00f2ff]/60">Quantum Advantage Status</span>
            <div className="text-2xl font-bold font-display text-white">{simulationResult.advantageScore}%</div>
            <p className="text-[8px] text-gray-500 font-mono">VS CLASSICAL ALGORITHMS</p>
          </div>
          <Cpu className="w-8 h-8 text-quantum-primary animate-pulse" />
        </div>
        
        <div className="quantum-card p-4 flex items-center justify-between bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-purple-400">Time Complexity Ratio</span>
            <div className="text-xl font-bold font-display text-white">
              {simulationResult.classicalTimeS}s <span className="text-gray-500 text-xs">vs</span> {simulationResult.quantumTimeS}s
            </div>
            <p className="text-[8px] text-gray-500 font-mono">CLASSICAL VS QUANTUM HARDWARE</p>
          </div>
          <TrendingUp className="w-8 h-8 text-quantum-secondary" />
        </div>

        <div className="quantum-card p-4 flex items-center justify-between bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400">System Fidelity</span>
            <div className="text-2xl font-bold font-display text-emerald-400">{simulationResult.fidelity}%</div>
            <p className="text-[8px] text-gray-500 font-mono">ERROR RATE ESTIMATION</p>
          </div>
          <Activity className="w-8 h-8 text-emerald-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters Column */}
        <div className="quantum-card p-5 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md flex flex-col gap-5 justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-3">
              <Sliders className="w-4 h-4 text-quantum-primary" />
              <h3 className="text-xs uppercase font-mono tracking-wider text-white font-bold">Scenario Parameters</h3>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => loadPreset('standard')}
                className={`py-1.5 rounded text-[8px] font-mono uppercase tracking-wider border transition-all ${
                  selectedPreset === 'standard' 
                    ? 'bg-[#00f2ff]/10 border-[#00f2ff] text-white' 
                    : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                Standard
              </button>
              <button 
                onClick={() => loadPreset('high_inflation')}
                className={`py-1.5 rounded text-[8px] font-mono uppercase tracking-wider border transition-all ${
                  selectedPreset === 'high_inflation' 
                    ? 'bg-[#00f2ff]/10 border-[#00f2ff] text-white' 
                    : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                Inflation
              </button>
              <button 
                onClick={() => loadPreset('global_recession')}
                className={`py-1.5 rounded text-[8px] font-mono uppercase tracking-wider border transition-all ${
                  selectedPreset === 'global_recession' 
                    ? 'bg-[#00f2ff]/10 border-[#00f2ff] text-white' 
                    : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                Recession
              </button>
            </div>

            {/* Inflation Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono uppercase text-gray-400">
                <span>Inflation rate</span>
                <span className="text-[#00f2ff] font-bold">{inflationRate}%</span>
              </div>
              <input 
                type="range" min="0" max="15" step="0.1"
                value={inflationRate}
                onChange={(e) => setInflationRate(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00f2ff]"
              />
            </div>

            {/* GDP Stress Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono uppercase text-gray-400">
                <span>GDP Stress multiplier</span>
                <span className="text-[#00f2ff] font-bold">{gdpStress}%</span>
              </div>
              <input 
                type="range" min="0" max="100" step="1"
                value={gdpStress}
                onChange={(e) => setGdpStress(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00f2ff]"
              />
            </div>

            {/* Central Bank Interest Rates Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono uppercase text-gray-400">
                <span>Central Bank Rates</span>
                <span className="text-[#00f2ff] font-bold">{interestRates}%</span>
              </div>
              <input 
                type="range" min="0" max="8" step="0.1"
                value={interestRates}
                onChange={(e) => setInterestRates(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00f2ff]"
              />
            </div>
          </div>

          <button 
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/30 rounded-xl py-3 text-[10px] font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isSimulating ? (
              <Activity className="w-4 h-4 animate-spin text-[#00f2ff]" />
            ) : (
              <Play className="w-4 h-4 fill-current text-[#00f2ff]" />
            )}
            {isSimulating ? 'Esecuzione Calcolo...' : 'Simula Scenari Macro'}
          </button>
        </div>

        {/* Results Visual & Code Tab Columns */}
        <div className="lg:col-span-2 quantum-card bg-black/40 border border-white/10 rounded-2xl flex flex-col backdrop-blur-md overflow-hidden min-h-[400px]">
          {/* Tabs header */}
          <div className="flex border-b border-white/5 bg-white/[0.02]">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex-1 py-3 text-[10px] font-mono uppercase tracking-wider font-bold border-b-2 transition-all ${
                activeTab === 'matrix' 
                  ? 'border-quantum-primary text-quantum-primary bg-[#00f2ff]/5' 
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              State Probability Distribution
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-3 text-[10px] font-mono uppercase tracking-wider font-bold border-b-2 transition-all ${
                activeTab === 'code' 
                  ? 'border-quantum-secondary text-quantum-secondary bg-purple-500/5' 
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              Auto-Generated Qiskit
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-5 relative min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeTab === 'matrix' ? (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="h-full w-full min-h-[280px]"
                >
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={simulationResult.probabilities} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="state" stroke="#555" tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }} />
                      <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#222', borderRadius: '8px' }}
                        itemStyle={{ color: '#00f2ff', fontSize: '11px', fontFamily: 'monospace' }}
                        labelStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'sans-serif', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="probability" fill="url(#probabilityGlow)" radius={[4, 4, 0, 0]} />
                      <defs>
                        <linearGradient id="probabilityGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00f2ff" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#9d00ff" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between border border-white/10 bg-white/[0.03] p-1.5 rounded-lg mb-3">
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest pl-2">VQE_Macro_Portfolio_Opt.py</span>
                    <button 
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/80 rounded border border-white/10 text-gray-400 hover:text-white text-[9px] font-mono transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[10px] text-[#00f2ff]/80 font-mono overflow-auto p-4 bg-black/50 border border-white/5 rounded-xl h-[220px] scrollbar-hide">
                    {codeString}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
