import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Activity, Network, Cpu, Play } from 'lucide-react';
import { CodeBlockWithCopy, IstogrammaQuantisticoUniversale } from './TestPage';

interface EndInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  qasmCode: string;
  pythonCode: string;
  jsonCode: string;
  theta: number;
  phi: number;
  targetAlgoritmo: string;
  sector: string;
  onSendToIBM: () => void;
}

function BlochSphere({ theta, phi, targetAlgoritmo }: { theta: number; phi: number; targetAlgoritmo: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let currentTheta = 0;
    let currentPhi = 0;
    let time = 0;

    const render = () => {
      currentTheta += (theta - currentTheta) * 0.05;
      currentPhi += (phi - currentPhi) * 0.05;
      time += 0.02;

      const isQuantum = targetAlgoritmo.startsWith('Qiskit_');
      const size = 280;
      const center = size / 2;
      const radius = 100;
      const radTheta = (currentTheta * Math.PI) / 180;
      const radPhi = (currentPhi * Math.PI) / 180;

      ctx.clearRect(0, 0, size, size);

      const gradient = ctx.createRadialGradient(center, center, radius * 0.2, center, center, radius * 1.5);
      gradient.addColorStop(0, targetAlgoritmo === 'IDLE' ? 'rgba(30, 41, 59, 0.2)' : (isQuantum ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'));
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(center, center, radius, radius * 0.3, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(center, center, radius * 0.3, radius, 0, 0, 2 * Math.PI);
      ctx.stroke();

      const innerGrad = ctx.createRadialGradient(center - radius*0.3, center - radius*0.3, radius * 0.1, center, center, radius);
      innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fill();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(time * 0.2);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.3, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(-time * 0.15);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.3, Math.PI / 2, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.2)';
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(center, center - radius - 15); ctx.lineTo(center, center + radius + 15);
      ctx.moveTo(center - radius - 15, center); ctx.lineTo(center + radius + 15, center);
      ctx.strokeStyle = 'rgba(99, 115, 139, 0.3)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#06b6d4'; ctx.font = 'bold 10px monospace'; ctx.fillText('|0⟩', center - 18, center - radius - 5);
      ctx.fillStyle = '#ec4899'; ctx.fillText('|1⟩', center - 18, center + radius + 12);

      const x3d = radius * Math.sin(radTheta) * Math.cos(radPhi + time);
      const y3d = radius * Math.sin(radTheta) * Math.sin(radPhi + time) * 0.3;
      const z3d = radius * Math.cos(radTheta);
      
      const x = center + x3d;
      const y = center - z3d + y3d;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(x, y);
      const vecColor = targetAlgoritmo === 'IDLE' ? '#94a3b8' : (isQuantum ? '#f59e0b' : '#10b981');
      ctx.strokeStyle = vecColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = vecColor;
      ctx.fill();
      ctx.shadowBlur = 10;
      ctx.shadowColor = vecColor;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [theta, phi, targetAlgoritmo]);

  return <canvas ref={canvasRef} width={280} height={280} className="w-full max-w-[280px] mx-auto" />;
}

export default function EndInterviewModal({
  isOpen, onClose, qasmCode, pythonCode, jsonCode, theta, phi, targetAlgoritmo, sector, onSendToIBM
}: EndInterviewModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-slate-950 border border-white/20 rounded-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50">
            <h2 className="font-mono text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Risultati dell'Intervista Strategica
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 scrollbar-thin scrollbar-thumb-slate-700">
            
            {/* Codici Generati */}
            <div className="flex flex-col gap-4">
              <h3 className="font-mono text-sm font-bold text-cyan-300 border-b border-white/10 pb-2">Codici Generati</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2 min-h-[200px]">
                  <CodeBlockWithCopy
                    code={jsonCode || "{\n  \"status\": \"idle\"\n}"}
                    language="json"
                    title="📋 Manifest JSON"
                  />
                </div>
                <div className="flex flex-col gap-2 min-h-[200px]">
                  <CodeBlockWithCopy
                    code={pythonCode || "# Codice Python in attesa"}
                    language="python"
                    title="🐍 Qiskit Python (HPC)"
                  />
                </div>
                <div className="flex flex-col gap-2 min-h-[200px]">
                  <CodeBlockWithCopy
                    code={qasmCode || "// Circuito OpenQASM in attesa"}
                    language="qasm"
                    title="⚛️ OpenQASM (Quantum)"
                  />
                </div>
              </div>
            </div>

            {/* Grafici: Bloch & Istogramma */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-t border-white/10 pt-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <h4 className="font-mono text-xs font-bold text-slate-300">Sfera di Bloch (Stato Quantistico)</h4>
                <div className="p-4 bg-slate-900/50 border border-white/5 rounded-xl shadow-inner w-full flex justify-center">
                  <BlochSphere theta={theta} phi={phi} targetAlgoritmo={targetAlgoritmo} />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-mono text-xs font-bold text-slate-300">Distribuzione di Probabilità</h4>
                <IstogrammaQuantisticoUniversale theta_radianti={theta} settore={sector} />
              </div>
            </div>

            {/* Descrizione Semplice */}
            <div className="flex flex-col gap-2 p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
              <h4 className="font-mono text-xs font-bold text-emerald-400">Interpretazione dei Risultati</h4>
              <p className="text-sm font-sans text-slate-300 leading-relaxed">
                Il codice Qiskit Python ha calcolato i parametri basandosi sul {sector}. 
                {targetAlgoritmo.startsWith('Qiskit_') 
                  ? " L'algoritmo quantistico scelto mappa le correlazioni tramite entanglement."
                  : " L'algoritmo classico simulerà lo scenario mediante HPC (High Performance Computing)."}
                <br /><br />
                L'angolo calcolato (Theta = {theta.toFixed(3)} rad) indica la propensione del sistema verso uno stato eccitato (|1⟩), rappresentando le probabilità ottimali per le scelte strategiche del tuo scenario.
              </p>
            </div>

            {/* Domanda finale e Pulsante */}
            <div className="flex flex-col items-center justify-center gap-6 mt-4 p-8 bg-slate-900/80 border border-amber-500/30 rounded-xl text-center">
              <div className="flex flex-col gap-2 max-w-xl mx-auto">
                <Cpu className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h3 className="font-bold text-lg text-white font-mono">Simulazione su Hardware Reale</h3>
                <p className="text-sm text-slate-400">
                  Avendo già prodotto il codice OpenQASM, vuoi inviarlo al computer quantistico IBM per l'elaborazione su QPU reale?
                </p>
              </div>
              
              <button 
                onClick={onSendToIBM}
                className="flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold font-mono rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                <Play className="w-5 h-5" />
                <span>SEND TO IBM QUANTUM</span>
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
