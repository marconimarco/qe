import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../lib/TranslationContext';
import { 
  Globe, 
  ArrowLeft, 
  Sparkles, 
  Activity, 
  HelpCircle, 
  Zap, 
  Database, 
  Maximize2 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface VariousQuantumInterfaceProps {
  onBack?: () => void;
}

export default function VariousQuantumInterface({ onBack }: VariousQuantumInterfaceProps) {
  const { t } = useTranslation();
  const [chaosMultiplier, setChaosMultiplier] = useState(1.4);
  const [selectedSources, setSelectedSources] = useState<string[]>(['finance_api', 'climate_data']);
  const [isSimulating, setIsSimulating] = useState(false);

  // Heterogeneous sources list
  const sources = [
    { id: 'finance_api', label: 'Banca & API Finanziaria', icon: 'Landmark', desc: 'Dati di transazioni globali interbancarie.' },
    { id: 'climate_data', label: 'Rilevamento Climatico', icon: 'Sun', desc: 'Fluttuazioni termiche in tempo reale.' },
    { id: 'satellite_ping', label: 'Latenza Satellitare', icon: 'Compass', desc: 'Deriva di rete GPS e Starlink.' },
    { id: 'grid_telemetry', label: 'Griglia Energetica IoT', icon: 'Zap', desc: 'Ondulazioni nei flussi di smart grid.' }
  ];

  // Dynamic simulation predictions based on chaos
  const [chaosResult, setChaosResult] = useState({
    entropyRatio: 0.74,
    butterflyThreshold: 0.82,
    quantumEntangledStates: 4,
    timeSeries: [
      { step: '0ns', entanglement: 12, ripple: 24 },
      { step: '10ns', entanglement: 34, ripple: 32 },
      { step: '20ns', entanglement: 58, ripple: 48 },
      { step: '30ns', entanglement: 79, ripple: 72 },
      { step: '40ns', entanglement: 91, ripple: 89 },
      { step: '50ns', entanglement: 42, ripple: 110 },
      { step: '60ns', entanglement: 88, ripple: 145 },
    ]
  });

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(s => s !== sourceId) 
        : [...prev, sourceId]
    );
  };

  const handleSimulateChaos = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const sourceCountFactor = selectedSources.length * 1.5;
      const baseEntropy = Math.min(0.99, 0.4 + (chaosMultiplier / 5) * sourceCountFactor);
      const baseButterfly = parseFloat((Math.random() * 0.2 + 0.75).toFixed(2));
      
      const newSeries = Array.from({ length: 7 }, (_, idx) => {
        const tns = idx * 10;
        const entanglementWeight = Math.round(40 + Math.sin(idx + chaosMultiplier) * 35 * sourceCountFactor);
        const rippleWeight = Math.round((idx * 20 + chaosMultiplier * 30) * Math.min(1.8, baseEntropy + 0.5));
        
        return {
          step: `${tns}ns`,
          entanglement: Math.min(100, Math.max(0, entanglementWeight)),
          ripple: Math.min(250, Math.max(0, rippleWeight))
        };
      });

      setChaosResult({
        entropyRatio: parseFloat(baseEntropy.toFixed(2)),
        butterflyThreshold: baseButterfly,
        quantumEntangledStates: selectedSources.length * 2,
        timeSeries: newSeries
      });
      setIsSimulating(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Back navigation header */}
      {onBack && (
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-full text-gray-400 hover:text-quantum-primary hover:border-quantum-primary/50 transition-all font-mono text-[10px] sm:text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('back')}</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-quantum-secondary uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5 animate-spin" />
            <span>Butterfly Effect Analyzer</span>
          </div>
        </div>
      )}

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="quantum-card p-4 bg-black/40 border border-white/10 rounded-xl relative backdrop-blur-md">
          <span className="text-[8px] font-mono uppercase tracking-widest text-quantum-primary/60">Entangled Entropy (Chaos)</span>
          <div className="text-2xl font-black font-display text-white mt-1">{(chaosResult.entropyRatio * 100).toFixed(0)}%</div>
          <p className="text-[7px] text-gray-500 font-mono uppercase mt-0.5">ESTIMATED FLUCTUATION INTENSITY</p>
        </div>

        <div className="quantum-card p-4 bg-black/40 border border-white/10 rounded-xl relative backdrop-blur-md">
          <span className="text-[8px] font-mono uppercase tracking-widest text-quantum-secondary/60">Core Synchronicity</span>
          <div className="text-2xl font-black font-display text-white mt-1">{(chaosResult.butterflyThreshold * 100).toFixed(1)}%</div>
          <p className="text-[7px] text-gray-500 font-mono uppercase mt-0.5">RESONANCE AT CURRENT EXTREMES</p>
        </div>

        <div className="quantum-card p-4 bg-black/40 border border-white/10 rounded-xl relative backdrop-blur-md">
          <span className="text-[8px] font-mono uppercase tracking-widest text-emerald-400/60">Active Channel Nodes</span>
          <div className="text-2xl font-black font-display text-emerald-400 mt-1">{chaosResult.quantumEntangledStates}</div>
          <p className="text-[7px] text-gray-500 font-mono uppercase mt-0.5">SYSTEMIC CONNECTIONS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Source selection & Sliders - spans 5 cols */}
        <div className="lg:col-span-5 quantum-card p-5 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-white mb-2 pb-2 border-b border-white/5 flex items-center gap-2">
              <Database className="w-4 h-4 text-quantum-primary" />
              Heterogeneous Entanglement Sources
            </h3>
            
            <p className="text-[9px] text-gray-500 leading-relaxed font-mono uppercase">
              Select networks to inject into the quantum chamber to measure the global butterfly effect.
            </p>

            <div className="space-y-2.5">
              {sources.map(src => {
                const isActive = selectedSources.includes(src.id);
                return (
                  <button
                    key={src.id}
                    onClick={() => toggleSource(src.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center bg-black/50 ${
                      isActive 
                        ? 'border-quantum-primary shadow-[0_0_15px_rgba(0,242,255,0.1)]' 
                        : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/20'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-quantum-primary' : 'text-gray-300'}`}>
                        {src.label}
                      </div>
                      <div className="text-[8px] text-gray-500 font-mono mt-0.5 truncate">{src.desc}</div>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center p-0.5 ${isActive ? 'border-quantum-primary' : 'border-white/20'}`}>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-quantum-primary animate-pulse" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Chaos factor slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] font-mono uppercase text-gray-400">
                <span>Chaos Sensitivity Multiplier</span>
                <span className="text-quantum-secondary font-bold">{chaosMultiplier.toFixed(2)}x</span>
              </div>
              <input 
                type="range" min="0.5" max="3.0" step="0.05"
                value={chaosMultiplier}
                onChange={(e) => setChaosMultiplier(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#9d00ff]"
              />
            </div>
          </div>

          <button
            onClick={handleSimulateChaos}
            disabled={isSimulating || selectedSources.length === 0}
            className="w-full bg-[#9d00ff]/10 hover:bg-[#9d00ff]/20 text-[#9d00ff] border border-[#9d00ff]/30 rounded-xl py-3 text-[10px] font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSimulating ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-current text-[#9d00ff]" />
            )}
            {isSimulating ? "Sincronizzazione in corso..." : "Avvia Risonanza Caos"}
          </button>
        </div>

        {/* Chaos visualizations chart - spans 7 cols */}
        <div className="lg:col-span-7 quantum-card p-5 bg-black/40 border border-white/10 rounded-2xl flex flex-col justify-between backdrop-blur-md min-h-[400px]">
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-white mb-1">Entanglement Chaos Mapping</h3>
            <p className="text-[9px] text-gray-500 font-mono uppercase mb-4">Heterogeneous ripple propagation across timescale dimensions</p>
          </div>

          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chaosResult.timeSeries} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1e" vertical={false} />
                <XAxis dataKey="step" stroke="#444" tick={{ fill: '#777', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#444" tick={{ fill: '#777', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#222', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                />
                
                {/* Entanglement curve */}
                <Area 
                  type="monotone" 
                  dataKey="entanglement" 
                  stroke="#00f2ff" 
                  fillOpacity={0.15} 
                  fill="url(#colorEntanglement)" 
                  strokeWidth={2}
                />
                
                {/* Global ripple weight (butterfly chaos) */}
                <Area 
                  type="monotone" 
                  dataKey="ripple" 
                  stroke="#9d00ff" 
                  fillOpacity={0.15} 
                  fill="url(#colorRipple)" 
                  strokeWidth={2}
                />

                <defs>
                  <linearGradient id="colorEntanglement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f2ff" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="colorRipple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9d00ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#9d00ff" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-white/5 pt-3.5 mt-2 flex gap-3 text-left">
            <div className="flex-1">
              <span className="text-[7.5px] font-mono uppercase text-gray-500 select-none block">System Impact</span>
              <p className="text-[9.5px] text-gray-400 font-mono uppercase mt-0.5 leading-relaxed tracking-tighter">
                Il crollo statistico delle variabili entrate suggerisce un effetto farfalla controllato del 
                <span className="text-quantum-secondary font-bold"> {(chaosResult.entropyRatio * 1.5).toFixed(0)}X</span> rispetto ai benchmark centralizzati classici.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
