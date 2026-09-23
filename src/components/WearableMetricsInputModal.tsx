import React, { useState } from 'react';
import { 
  X, 
  Watch, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Flame, 
  Activity, 
  Compass, 
  Gauge, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { WearableWorkloadMetrics, DEFAULT_WEARABLE_METRICS, SentinelStatus, valutaEffettiDominoWearable } from '../types/wearable';

interface WearableMetricsInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (metrics: WearableWorkloadMetrics) => void;
  initialMetrics?: Partial<WearableWorkloadMetrics>;
}

export default function WearableMetricsInputModal({
  isOpen,
  onClose,
  onSave,
  initialMetrics
}: WearableMetricsInputModalProps) {
  const [metrics, setMetrics] = useState<WearableWorkloadMetrics>(() => ({
    ...DEFAULT_WEARABLE_METRICS,
    ...initialMetrics
  }));

  if (!isOpen) return null;

  const updateField = <K extends keyof WearableWorkloadMetrics>(field: K, val: WearableWorkloadMetrics[K]) => {
    setMetrics(prev => ({ ...prev, [field]: val }));
  };

  const loadPreset = (preset: 'ottimale' | 'sentinella' | 'spike' | 'lca' | 'maratona') => {
    switch (preset) {
      case 'ottimale':
        setMetrics({
          acwr: 1.05,
          cumulativeWorkload: 680,
          mechanicalLoad: 42,
          imuStatus: 'Attivo (100Hz)',
          accelerometerPeak: 4.8,
          gyroscopeAngularVelocity: 260,
          impactsTibia: 7.2,
          velocity: 11.5,
          distance: 8.4,
          steps: 9200,
          biomechanicAlterations: 3.5,
          fatigueIndex: 28,
          sentinelSignal: 'verde',
          musculoskeletalInjuriesOutcome: 'Nessun evento lesivo attivo - Integrità muscoloscheletrica ottimale'
        });
        break;
      case 'sentinella':
        setMetrics({
          acwr: 1.38,
          cumulativeWorkload: 1450,
          mechanicalLoad: 58,
          imuStatus: 'Attivo (100Hz)',
          accelerometerPeak: 5.6,
          gyroscopeAngularVelocity: 340,
          impactsTibia: 9.8,
          velocity: 12.0,
          distance: 14.5,
          steps: 16500,
          biomechanicAlterations: 7.8,
          fatigueIndex: 55,
          sentinelSignal: 'gialla',
          musculoskeletalInjuriesOutcome: 'Segnale Sentinella Attivo: micro-alterazione cadenza e appoggio'
        });
        break;
      case 'spike':
        setMetrics({
          acwr: 1.68,
          cumulativeWorkload: 1620,
          mechanicalLoad: 72,
          imuStatus: 'Calibrato (200Hz)',
          accelerometerPeak: 7.4,
          gyroscopeAngularVelocity: 390,
          impactsTibia: 13.8,
          velocity: 13.8,
          distance: 16.0,
          steps: 18400,
          biomechanicAlterations: 12.5,
          fatigueIndex: 68,
          sentinelSignal: 'rossa',
          musculoskeletalInjuriesOutcome: 'Sospetta periostite tibiale e sovraccarico trabecolare'
        });
        break;
      case 'lca':
        setMetrics({
          acwr: 1.42,
          cumulativeWorkload: 1100,
          mechanicalLoad: 64,
          imuStatus: 'Calibrato (200Hz)',
          accelerometerPeak: 8.2,
          gyroscopeAngularVelocity: 480,
          impactsTibia: 10.2,
          velocity: 14.5,
          distance: 9.5,
          steps: 11000,
          biomechanicAlterations: 14.2,
          fatigueIndex: 82,
          sentinelSignal: 'rossa',
          musculoskeletalInjuriesOutcome: 'Instabilità dinamica rotulea e ritardo propriocettivo (Rischio LCA)'
        });
        break;
      case 'maratona':
        setMetrics({
          acwr: 1.48,
          cumulativeWorkload: 1980,
          mechanicalLoad: 92,
          imuStatus: 'Attivo (100Hz)',
          accelerometerPeak: 6.2,
          gyroscopeAngularVelocity: 310,
          impactsTibia: 10.8,
          velocity: 10.8,
          distance: 35.0,
          steps: 33400,
          biomechanicAlterations: 9.0,
          fatigueIndex: 76,
          sentinelSignal: 'gialla',
          musculoskeletalInjuriesOutcome: 'Fascite plantare da carico e indolenzimento miotendineo diffuso'
        });
        break;
    }
  };

  const detectedDomino = valutaEffettiDominoWearable(metrics);

  const handleSave = () => {
    onSave(metrics);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0b0c12] border border-cyan-500/30 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-[0_0_60px_rgba(6,182,212,0.15)] relative max-h-[92vh] flex flex-col my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Scheda Tecnica Parametri & Metriche Wearable
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Monitoraggio Carico di Lavoro, Sensori IMU & Sintesi AI
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets selector */}
        <div className="py-3 shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
            Profili Rapidi di Test (Smartwatch Simulator):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadPreset('ottimale')}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all"
            >
              🏃 Ottimale (ACWR 1.05)
            </button>
            <button
              onClick={() => loadPreset('sentinella')}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all"
            >
              🟡 Luce Gialla (Sentinella)
            </button>
            <button
              onClick={() => loadPreset('spike')}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition-all"
            >
              🔴 Spike ACWR & Tibia
            </button>
            <button
              onClick={() => loadPreset('lca')}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all"
            >
              ⚡ Fatica & Rischio LCA
            </button>
            <button
              onClick={() => loadPreset('maratona')}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all"
            >
              🏔️ Carico Meccanico 92kJ
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto pr-1 space-y-6 flex-1 py-2">
          {/* [1] Metriche di Carico di Lavoro */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 text-cyan-400">
              <Gauge className="w-4 h-4" />
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold">
                [1] Metriche di Carico di Lavoro (Workload Parameters)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  ACWR (Acute-to-Chronic Ratio)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="3"
                    value={metrics.acwr}
                    onChange={(e) => updateField('acwr', parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">
                    {metrics.acwr >= 1.5 ? '⚠️ Danger' : 'Ottimale'}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 block">Range ideale: 0.8 - 1.3 (&gt;1.5 = Pericolo)</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Carico Cumulativo (AU)
                </label>
                <input 
                  type="number" 
                  step="10" 
                  min="0"
                  value={metrics.cumulativeWorkload}
                  onChange={(e) => updateField('cumulativeWorkload', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">Stress meccanico totale accumulato</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Carico Meccanico (kJ / AU)
                </label>
                <input 
                  type="number" 
                  step="1" 
                  min="0"
                  value={metrics.mechanicalLoad}
                  onChange={(e) => updateField('mechanicalLoad', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">Forze fisiche esterne muscoloscheletriche</span>
              </div>
            </div>
          </div>

          {/* [2] Sensori Fisici e Parametri Biomeccanici (IMU) */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 text-emerald-400">
              <Compass className="w-4 h-4" />
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold">
                [2] Sensori Fisici e Parametri Biomeccanici (IMU Metrics)
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Stato IMU
                </label>
                <select
                  value={metrics.imuStatus}
                  onChange={(e) => updateField('imuStatus', e.target.value as any)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Attivo (100Hz)">Attivo (100Hz)</option>
                  <option value="Calibrato (200Hz)">Calibrato (200Hz)</option>
                  <option value="Risparmio Energetico (50Hz)">Risparmio (50Hz)</option>
                  <option value="Disconnesso">Disconnesso</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Accelerometro (g)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={metrics.accelerometerPeak}
                  onChange={(e) => updateField('accelerometerPeak', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[9px] text-slate-500 mt-0.5 block">Picco 3 assi</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Giroscopio (deg/s)
                </label>
                <input 
                  type="number" 
                  step="5" 
                  value={metrics.gyroscopeAngularVelocity}
                  onChange={(e) => updateField('gyroscopeAngularVelocity', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[9px] text-slate-500 mt-0.5 block">Velocità angolare</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Impatti Tibia (g)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={metrics.impactsTibia}
                  onChange={(e) => updateField('impactsTibia', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[9px] text-slate-500 mt-0.5 block">Forza urto tibiale</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Velocità (km/h)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={metrics.velocity}
                  onChange={(e) => updateField('velocity', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Distanza (km)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={metrics.distance}
                  onChange={(e) => updateField('distance', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] text-slate-300 block mb-1">
                  Passi Totali
                </label>
                <input 
                  type="number" 
                  step="100" 
                  value={metrics.steps}
                  onChange={(e) => updateField('steps', parseInt(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* [3] Metriche Avanzate di Sintesi */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 text-purple-400">
              <Zap className="w-4 h-4" />
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold">
                [3] Metriche Avanzate di Sintesi (AI & Clinical Outcomes)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Alterazioni Biomeccaniche (%)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0"
                  max="100"
                  value={metrics.biomechanicAlterations}
                  onChange={(e) => updateField('biomechanicAlterations', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">Asimmetria posturale / appoggio dx-sx</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Indice di Fatica (%)
                </label>
                <input 
                  type="number" 
                  step="1" 
                  min="0"
                  max="100"
                  value={metrics.fatigueIndex}
                  onChange={(e) => updateField('fatigueIndex', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">Decadimento efficienza del gesto</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Segnale Sentinella
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('sentinelSignal', 'verde')}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      metrics.sentinelSignal === 'verde'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-black/50 text-slate-500 border-white/10 hover:text-white'
                    }`}
                  >
                    🟢 Verde
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('sentinelSignal', 'gialla')}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      metrics.sentinelSignal === 'gialla'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-black/50 text-slate-500 border-white/10 hover:text-white'
                    }`}
                  >
                    🟡 Gialla
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('sentinelSignal', 'rossa')}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      metrics.sentinelSignal === 'rossa'
                        ? 'bg-red-500/20 text-red-300 border-red-500'
                        : 'bg-black/50 text-slate-500 border-white/10 hover:text-white'
                    }`}
                  >
                    🔴 Rossa
                  </button>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 block">Deviazione statistica dal comportamento</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">
                Infortuni Muscoloscheletrici Outcome (Tracciamento Clinico)
              </label>
              <input 
                type="text" 
                value={metrics.musculoskeletalInjuriesOutcome}
                onChange={(e) => updateField('musculoskeletalInjuriesOutcome', e.target.value)}
                placeholder="Es. Periostite tibiale, Tendinopatia Achillea, Assenza lesioni..."
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Real-time Domino Alerts Preview */}
          {detectedDomino.length > 0 && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 mb-2 text-red-300">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Attenzione: {detectedDomino.length} Effetto Domino Innescato dai Parametri Attuali
                </span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-300">
                {detectedDomino.map(d => (
                  <li key={d.id}>
                    <strong className="text-white">{d.titolo}</strong>: {d.incrocioParametri}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-400 font-mono">
            Parametri salvati localmente e sincronizzati con il motore quantistico.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Check className="w-4 h-4" /> Applica e Calibra Metriche
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
