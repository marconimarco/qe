import React from 'react';
import { 
  Watch, 
  Activity, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Compass, 
  ShieldCheck, 
  Gauge, 
  ChevronRight,
  Flame,
  ArrowRight
} from 'lucide-react';
import { WearableWorkloadMetrics, valutaEffettiDominoWearable } from '../types/wearable';

interface WearableWorkloadDashboardProps {
  metrics: WearableWorkloadMetrics;
  onEdit?: () => void;
}

export default function WearableWorkloadDashboard({ metrics, onEdit }: WearableWorkloadDashboardProps) {
  const dominoAlerts = valutaEffettiDominoWearable(metrics);

  const getSentinelColor = () => {
    switch (metrics.sentinelSignal) {
      case 'rossa':
        return {
          bg: 'bg-red-500/20 text-red-300 border-red-500/40',
          dot: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]',
          label: 'Luce Rossa (Anomalia Severa / Stop Consigliato)'
        };
      case 'gialla':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse',
          label: 'Luce Gialla (Segnale Sentinella Attivo - Rischio Sovraccarico)'
        };
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]',
          label: 'Luce Verde (Cinematica & Carico Fisiologici)'
        };
    }
  };

  const sentinel = getSentinelColor();

  const acwrStatus = metrics.acwr > 1.45 
    ? { text: 'Danger Zone (Spike di Carico)', color: 'text-red-400', badge: 'bg-red-500/10 border-red-500/30' }
    : metrics.acwr < 0.8
    ? { text: 'Under-training', color: 'text-yellow-400', badge: 'bg-yellow-500/10 border-yellow-500/30' }
    : { text: 'Sweet Spot (Carico Ottimale)', color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30' };

  return (
    <div className="w-full bg-[#0c0d14] border border-cyan-500/20 rounded-3xl p-5 sm:p-7 shadow-[0_0_40px_rgba(6,182,212,0.06)] relative overflow-hidden my-8">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Watch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                Telemetria Smartwatch & Sensori IMU
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                • {metrics.imuStatus}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide mt-1">
              Monitoraggio del Carico, Biomeccanica & Segnali Sentinella
            </h3>
          </div>
        </div>

        {/* Sentinel Indicator */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-xs font-mono font-semibold ${sentinel.bg}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${sentinel.dot}`} />
            <span>{sentinel.label}</span>
          </div>
          {onEdit && (
            <button 
              onClick={onEdit}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all hover:text-white"
            >
              Modifica Dati
            </button>
          )}
        </div>
      </div>

      {/* 3 Main Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* [1] Metriche di Carico di Lavoro */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Gauge className="w-4 h-4" /> [1] Carico di Lavoro
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${acwrStatus.badge} ${acwrStatus.color}`}>
                {acwrStatus.text}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs text-slate-400">ACWR (Acute-to-Chronic)</span>
                  <span className={`text-xl font-bold font-mono ${acwrStatus.color}`}>{metrics.acwr.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div className="w-[40%] bg-emerald-500/60 h-full" title="Sweet Spot (0.8 - 1.3)" />
                  <div className="w-[20%] bg-amber-500/60 h-full" title="Attenzione (1.3 - 1.5)" />
                  <div className="w-[40%] bg-red-500/60 h-full" title="Danger Zone (> 1.5)" />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono">
                  <span>0.8</span>
                  <span className="text-emerald-400">Ottimale</span>
                  <span>1.3</span>
                  <span className="text-red-400">&gt;1.5 Danger</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Carico Cumulativo</span>
                  <span className="text-base font-bold text-white font-mono">{metrics.cumulativeWorkload}</span>
                  <span className="text-[10px] text-slate-500 ml-1">AU</span>
                </div>
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Carico Meccanico</span>
                  <span className="text-base font-bold text-white font-mono">{metrics.mechanicalLoad}</span>
                  <span className="text-[10px] text-slate-500 ml-1">kJ</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 leading-relaxed">
            Rapporto acuto/cronico: quantifica lo stress progressivo rispetto allo storico a 28 giorni.
          </div>
        </div>

        {/* [2] Sensori Fisici e Parametri Biomeccanici (IMU) */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> [2] Sensori IMU & Forze
              </span>
              <span className="text-[10px] font-mono text-slate-400">Triassiale 3D</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">Impatti Tibia</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-base font-bold font-mono ${metrics.impactsTibia >= 11 ? 'text-red-400' : 'text-white'}`}>
                    {metrics.impactsTibia}g
                  </span>
                  <span className="text-[9px] text-slate-500">{metrics.impactsTibia >= 11 ? '⚠️ Picco' : 'Fisiol.'}</span>
                </div>
              </div>

              <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">Accelerometro</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-bold font-mono text-white">{metrics.accelerometerPeak}g</span>
                  <span className="text-[9px] text-slate-500">Peak</span>
                </div>
              </div>

              <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">Giroscopio</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-bold font-mono text-white">{metrics.gyroscopeAngularVelocity}</span>
                  <span className="text-[9px] text-slate-500">deg/s</span>
                </div>
              </div>

              <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">Velocità Media</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-bold font-mono text-white">{metrics.velocity}</span>
                  <span className="text-[9px] text-slate-500">km/h</span>
                </div>
              </div>

              <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">Distanza</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-bold font-mono text-white">{metrics.distance}</span>
                  <span className="text-[9px] text-slate-500">km</span>
                </div>
              </div>

              <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">Passi Totali</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-bold font-mono text-white">{metrics.steps.toLocaleString('it-IT')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 leading-relaxed">
            Misurazioni continue da accelerometro triassiale e giroscopio per rilevazione impatti e postura.
          </div>
        </div>

        {/* [3] Metriche Avanzate di Sintesi */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> [3] Metriche Avanzate AI
              </span>
              <span className="text-[10px] font-mono text-slate-400">Algoritmo Predittivo</span>
            </div>

            <div className="space-y-3.5">
              <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Alterazioni Biomeccaniche</span>
                  <span className="text-[10px] text-slate-500">Asimmetria d'appoggio dx/sx</span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold font-mono ${metrics.biomechanicAlterations >= 8 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {metrics.biomechanicAlterations}%
                  </span>
                  <span className="text-[9px] block text-slate-500">{metrics.biomechanicAlterations >= 8 ? 'Sbilanciato' : 'Fisiologico'}</span>
                </div>
              </div>

              <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Indice di Fatica</span>
                  <span className="text-[10px] text-slate-500">Decadimento efficienza gesto</span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold font-mono ${metrics.fatigueIndex >= 65 ? 'text-red-400' : metrics.fatigueIndex >= 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {metrics.fatigueIndex}%
                  </span>
                  <span className="text-[9px] block text-slate-500">{metrics.fatigueIndex >= 65 ? 'Elevato' : 'Controllato'}</span>
                </div>
              </div>

              <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-1">Infortuni Muscoloscheletrici Outcome</span>
                <span className="text-xs font-mono text-slate-200 block truncate">
                  {metrics.musculoskeletalInjuriesOutcome}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 leading-relaxed">
            Incrocio intelligente delle asimmetrie con il Segnale Sentinella per identificare eventi lesivi latenti.
          </div>
        </div>
      </div>

      {/* INCROCI DEI PARAMETRI ED EFFETTI DOMINO SULLA SALUTE */}
      {dominoAlerts.length > 0 && (
        <div className="mt-7 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-red-400" />
            <h4 className="text-sm font-mono uppercase tracking-widest text-red-400 font-bold">
              Effetti Domino Biomeccanici Rilevati ({dominoAlerts.length})
            </h4>
          </div>

          <div className="space-y-4">
            {dominoAlerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-4 rounded-2xl border ${alert.colore} relative overflow-hidden`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-sm text-white tracking-wide">
                      {alert.titolo}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 w-fit">
                    {alert.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {alert.descrizione}
                </p>

                {/* 3 Step Domino Progression */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-3">
                  {alert.fasiDomino.map((f, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-black/50 border border-white/5">
                      <span className="text-[9px] font-mono uppercase text-cyan-400 block font-bold mb-0.5">
                        {f.fase}: {f.nome}
                      </span>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {f.descrizione}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-white/5 flex items-start gap-2 text-xs text-slate-300">
                  <span className="font-bold text-cyan-400 font-mono text-[10px] uppercase shrink-0 mt-0.5">
                    Prescrizione Clinica:
                  </span>
                  <span>{alert.raccomandazioneClinica}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
