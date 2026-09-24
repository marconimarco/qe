import React, { useState } from 'react';
import { CROSS_PARAMETER_PROBLEMS, CrossParameterProblem } from '../data/medicalCategoriesData';
import { AlertCircle, Zap, ArrowRight, Sparkles, X, Layers } from 'lucide-react';
import type { ScreeningResult } from './MedicalScreening';
import { valutaIncrociClinici } from '../lib/quantumHealthEngine';

interface CrossParameterAnalysisProps {
  result?: ScreeningResult | null;
  onClose?: () => void;
}

export function checkIsProblemCritical(problemId: string, result?: ScreeningResult | null): boolean {
  if (!result) return false;

  const esami = result.quantumReport?.configurazione_pagina_health?.livello_2_3_biomarcatori_rilevati?.valori_normalizzati_assegnati;
  const incroci = esami ? valutaIncrociClinici(esami) : null;

  switch (problemId) {
    case 'glicemia_colesterolo_ictus':
      if (incroci?.tempesta_perfetta_coronarie?.stato === 'CRITICO') return true;
      if (result.metabolici?.status === 'Non Idoneo' && (result.heartRisk === 'high' || result.vitali?.status === 'Non Idoneo')) return true;
      return false;

    case 'ipertensione_infiammazione_rene':
      if (result.vitali?.status === 'Non Idoneo' && result.organo?.status === 'Non Idoneo') return true;
      return false;

    case 'grasso_viscerale_disbiosi_fegato':
      if (incroci?.blocco_metabolico_grasso_viscerale?.stato === 'CRITICO') return true;
      if (result.metabolici?.status === 'Non Idoneo' && result.organo?.status === 'Non Idoneo') return true;
      return false;

    case 'cid_coagulazione_disseminata':
      if (result.vitali?.status === 'Non Idoneo' && result.infiammatorio?.status === 'Non Idoneo' && result.score < 50) return true;
      return false;

    case 'rabdomiolisi_danno_renale':
      if (result.organo?.status === 'Non Idoneo' && result.vitali?.status === 'Non Idoneo' && result.score < 50) return true;
      return false;

    case 'sepsi_infezione_sistemica':
      if (result.infiammatorio?.status === 'Non Idoneo' && (result.score < 50 || result.vitali?.status === 'Non Idoneo')) return true;
      return false;

    case 'sindrome_metabolica_tripla':
      if (result.metabolici?.status === 'Non Idoneo' && (result.vitali?.status === 'Non Idoneo' || result.score < 60)) return true;
      return false;

    case 'pancreatite_ipertrigliceridemia':
      if (result.metabolici?.status === 'Non Idoneo' && result.organo?.status === 'Non Idoneo') return true;
      if (incroci?.blocco_metabolico_grasso_viscerale?.stato === 'CRITICO' && result.score < 55) return true;
      return false;

    case 'iperuricemia_gotta_nefropatia':
      if (result.organo?.status === 'Non Idoneo' && (result.metabolici?.status === 'Non Idoneo' || result.infiammatorio?.status === 'Non Idoneo')) return true;
      return false;

    case 'diabete_microangiopatia_nefropatia':
      if (result.metabolici?.status === 'Non Idoneo' && result.organo?.status === 'Non Idoneo') return true;
      if (incroci?.tempesta_perfetta_coronarie?.stato === 'CRITICO' && result.organo?.status === 'Non Idoneo') return true;
      return false;

    case 'ipercalcemia_aritmia_calcoli':
      if (result.vitali?.status === 'Non Idoneo' && result.organo?.status === 'Non Idoneo' && result.score < 55) return true;
      return false;

    case 'ipertrofia_cardiaca_scompenso_bnp':
      if (result.vitali?.status === 'Non Idoneo' && (result.heartRisk === 'high' || result.score < 55)) return true;
      return false;

    case 'autoimmunita_tiroide_flogosi_poliglandolare':
      if (result.infiammatorio?.status === 'Non Idoneo' && result.metabolici?.status === 'Non Idoneo') return true;
      return false;

    case 'acwr_impatti_frattura_stress': {
      const wm = result.wearableMetrics || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('quantum_medical_wearable_metrics') || '{}') : null);
      if (wm?.acwr >= 1.45 && wm?.impactsTibia >= 10) return true;
      if (result.vitali?.status === 'Non Idoneo' && result.score < 55) return true;
      return false;
    }

    case 'fatica_giroscopio_rottura_lca': {
      const wm = result.wearableMetrics || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('quantum_medical_wearable_metrics') || '{}') : null);
      if (wm?.fatigueIndex >= 65 && (wm?.biomechanicAlterations >= 8 || wm?.sentinelSignal !== 'verde')) return true;
      if (result.headRisk === 'high' || (result.vitali?.status === 'Non Idoneo' && result.score < 50)) return true;
      return false;
    }

    case 'carico_cumulativo_sentinella_overtraining': {
      const wm = result.wearableMetrics || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('quantum_medical_wearable_metrics') || '{}') : null);
      if (wm?.cumulativeWorkload >= 1300 || wm?.sentinelSignal === 'gialla' || wm?.sentinelSignal === 'rossa') return true;
      if (result.infiammatorio?.status === 'Non Idoneo' && result.score < 60) return true;
      return false;
    }

    case 'carico_meccanico_rabdomiolisi_renale': {
      const wm = result.wearableMetrics || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('quantum_medical_wearable_metrics') || '{}') : null);
      if (wm?.steps >= 20000 && wm?.mechanicalLoad >= 65) return true;
      if (result.organo?.status === 'Non Idoneo' && result.score < 55) return true;
      return false;
    }

    default:
      return false;
  }
}

export type ProblemSeverity = 'red' | 'orange' | 'green';

export function getProblemSeverity(problem: CrossParameterProblem, result?: ScreeningResult | null): ProblemSeverity {
  if (!result) return 'green';

  // 1. STATO ROSSO (Critico / Allerta attiva)
  if (checkIsProblemCritical(problem.id, result)) {
    return 'red';
  }

  const wm = result.wearableMetrics || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('quantum_medical_wearable_metrics') || '{}') : null);

  // Verifica se almeno una delle categorie coinvolte è alterata
  const cats = problem.parametriCoinvolti.map(p => p.categoria.toLowerCase());
  const hasMetabolici = cats.some(c => c.includes('metabolic'));
  const hasVitali = cats.some(c => c.includes('vital'));
  const hasOrgano = cats.some(c => c.includes('organ') || c.includes('renal') || c.includes('epatic'));
  const hasInfiammatorio = cats.some(c => c.includes('infiammat') || c.includes('immun'));
  const hasWearable = cats.some(c => c.includes('wearable') || c.includes('biomeccanic') || c.includes('carico'));

  const anyInvolvedAltered =
    (hasMetabolici && result.metabolici?.status === 'Non Idoneo') ||
    (hasVitali && result.vitali?.status === 'Non Idoneo') ||
    (hasOrgano && result.organo?.status === 'Non Idoneo') ||
    (hasInfiammatorio && result.infiammatorio?.status === 'Non Idoneo');

  if (anyInvolvedAltered) {
    return 'orange';
  }

  // Rischio d'organo o cardiovascolare medio/alto
  if ((hasVitali || hasMetabolici) && (result.heartRisk === 'high' || result.heartRisk === 'medium')) {
    return 'orange';
  }
  if (result.headRisk === 'high' || (result.headRisk === 'medium' && hasVitali)) {
    return 'orange';
  }

  // Pre-allarmi telemetria wearable
  if (hasWearable || problem.id.includes('acwr') || problem.id.includes('fatica') || problem.id.includes('carico')) {
    if (wm) {
      if (wm.acwr >= 1.30 || wm.fatigueIndex >= 45 || wm.cumulativeWorkload >= 1050 || wm.sentinelSignal === 'gialla' || wm.sentinelSignal === 'rossa' || wm.biomechanicAlterations >= 6) {
        return 'orange';
      }
    }
  }

  // Score globale di screening border-line
  if (result.score < 75 && (problem.urgenza.includes('🟠') || problem.urgenza.includes('🟡') || problem.urgenza.includes('Alta') || problem.urgenza.includes('Media'))) {
    return 'orange';
  }

  // 3. STATO VERDE (Fisiologico / Stabile)
  return 'green';
}

export default function CrossParameterAnalysis({ result, onClose }: CrossParameterAnalysisProps) {
  const [selectedProblem, setSelectedProblem] = useState<CrossParameterProblem | null>(null);

  // Ordina i quadranti rigorosamente per colore: prima ROSSI, poi ARANCIONI
  // Se tutti i quadranti sono verdi, la modale non mostra elementi non rilevanti
  const severityOrder: Record<ProblemSeverity, number> = { red: 0, orange: 1, green: 2 };

  const nonGreenProblems = React.useMemo(() => {
    return CROSS_PARAMETER_PROBLEMS
      .map(problem => ({ problem, severity: getProblemSeverity(problem, result) }))
      .filter(({ severity }) => severity === 'red' || severity === 'orange')
      .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [result]);

  const redCount = nonGreenProblems.filter(p => p.severity === 'red').length;
  const orangeCount = nonGreenProblems.filter(p => p.severity === 'orange').length;

  return (
    <div id="domino-effect-section" className="w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-amber-500/10 rounded-[2.5rem] blur-3xl -z-10" />

      {/* HEADER DELLA MAPPA: TITOLO, BADGE DI CONTEGGIO COLORI E CHIUDI */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 px-1">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Sorveglianza Quantistica ad Effetto Domino
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
              {CROSS_PARAMETER_PROBLEMS.length} Quadranti Totali
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-light text-white tracking-wide">
            Mappa delle Reazioni a Catena della Salute
          </h3>
        </div>

        {/* Breakdown conteggio colori e pulsante chiudi */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            {redCount > 0 && (
              <span className="px-2 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 led-pulse-badge-red font-bold">
                🔴 {redCount} Rossi (Critici)
              </span>
            )}
            {orangeCount > 0 && (
              <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                🟠 {orangeCount} Arancioni (Attenzione)
              </span>
            )}
            {nonGreenProblems.length === 0 && (
              <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                🟢 Tutti Fisiologici
              </span>
            )}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer ml-1"
              title="Chiudi pop-up"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* GUIDA SINTETICA COMPATTA */}
      <div className="mb-4 p-3 sm:p-3.5 rounded-xl bg-[#0c0d12] border border-cyan-500/30 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
          <Layers className="w-4 h-4" />
        </div>
        <p className="text-xs text-slate-300 font-light leading-relaxed">
          <strong className="text-white font-medium">Reazioni a Catena Attive:</strong> Sono visualizzati esclusivamente i quadranti che richiedono attenzione clinica, prioritizzati partendo dallo stato <strong className="text-red-400">Rosso (Critico)</strong> e proseguendo con <strong className="text-amber-400">Arancione (Attenzione)</strong>. I quadranti verdi (stabili) sono esclusi. Clicca su un quadrante per analizzarne la cascata domino.
        </p>
      </div>

      {/* GRIGLIA DEI QUADRANTI COMPATTA (Mostra solo quadranti Rossi e Arancioni) */}
      {nonGreenProblems.length === 0 ? (
        <div className="bg-[#0f0f0f] border border-emerald-500/30 p-8 rounded-2xl text-center flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">🟢</span>
          <span className="text-emerald-400 font-mono font-bold text-sm">Nessuna Reazione a Catena Attiva</span>
          <p className="text-xs text-slate-400 max-w-md">Tutti i quadranti dell'effetto domino sono in stato fisiologico ottimale e privi di perturbazioni.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 bg-[#0f0f0f] border border-white/5 p-2.5 sm:p-3.5 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.01] pointer-events-none mix-blend-overlay" />
          
          {nonGreenProblems.map(({ problem, severity }) => {
            const isRed = severity === 'red';
            const isOrange = severity === 'orange';
            
            return (
              <div
                key={problem.id}
                onClick={() => setSelectedProblem(problem)}
                className="group cursor-pointer relative overflow-hidden rounded-xl p-[1.5px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl select-none"
              >
                {/* FASCIO DI LUCE CONTINUO CHE SCORRE LUNGO IL BORDO (BORDER BEAM) */}
                <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                  <div
                    className={`absolute -inset-[150%] ${
                      isRed
                        ? 'animate-beam-spin-red'
                        : 'animate-beam-spin-orange'
                    }`}
                    style={{
                      background: isRed
                        ? 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(239, 68, 68, 0.4) 300deg, #ff1744 335deg, #ffffff 355deg, transparent 360deg)'
                        : 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(245, 158, 11, 0.4) 300deg, #f59e0b 335deg, #ffffff 355deg, transparent 360deg)',
                    }}
                  />
                </div>

                {/* Sfondo e Contenuto Interno */}
                <div className={`relative w-full h-full rounded-[10.5px] p-3 flex flex-col justify-between min-h-[115px] z-10 transition-colors ${
                  isRed
                    ? 'bg-gradient-to-br from-[#1c080d] via-[#12080a] to-[#0a0a0c]'
                    : 'bg-gradient-to-br from-[#1a1107] via-[#120e08] to-[#0a0a0c]'
                }`}>
                  {/* Contorno di base sottile */}
                  <div className={`absolute inset-0 rounded-[10.5px] border pointer-events-none ${
                    isRed ? 'border-red-500/40' : 'border-amber-500/35'
                  }`} />

                  {/* Header card compatto */}
                  <div className="flex items-center justify-between gap-1.5 mb-1.5 relative z-10">
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider truncate flex items-center gap-1 ${
                      isRed 
                        ? 'text-red-200 border-red-500/50 bg-red-500/20 led-pulse-badge-red' 
                        : 'text-amber-200 border-amber-500/40 bg-amber-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isRed ? 'bg-red-400 animate-pulse' : 'bg-amber-400'
                      }`} />
                      {isRed ? 'Critico' : 'Attenzione'}
                    </span>

                    <div className="w-5 h-5 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-all shrink-0">
                      <ArrowRight className="w-2.5 h-2.5 -rotate-45 group-hover:rotate-0 transition-transform duration-200" />
                    </div>
                  </div>

                  {/* Titolo e sottotitolo compatto */}
                  <div className="my-auto pr-1 relative z-10">
                    <h4 className={`text-xs sm:text-[13px] font-medium tracking-tight leading-snug line-clamp-2 ${
                      isRed ? 'text-red-100 font-semibold' : 'text-amber-100'
                    }`}>
                      {problem.titolo}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-light line-clamp-1 mt-0.5 leading-tight">
                      {problem.sottotitolo}
                    </p>
                  </div>

                  {/* Footer con icone parametri coinvolti e link cascata */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 relative z-10">
                    <div className="flex items-center -space-x-1">
                      {problem.parametriCoinvolti.slice(0, 4).map((p, idx) => (
                        <div 
                          key={idx} 
                          className="w-4 h-4 rounded-full bg-[#181818] border border-white/10 flex items-center justify-center text-[8px] shadow" 
                          title={p.nome}
                        >
                          {p.icon}
                        </div>
                      ))}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 group-hover:text-cyan-300 transition-colors">
                      Cascata →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dettaglio Singolo Problema */}
      {selectedProblem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-[1.8rem] sm:rounded-[2rem] w-full max-w-4xl max-h-[92vh] overflow-y-auto relative shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/5 p-4 sm:p-6 z-20 flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border text-white bg-white/5 border-white/10">
                    {selectedProblem.urgenza}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedProblem.parametriCoinvolti.map((p, idx) => (
                      <span key={idx} className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                        {p.icon} {p.nome}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-white leading-tight">
                  {selectedProblem.titolo}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedProblem(null)}
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shrink-0 cursor-pointer"
                title="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 md:p-8 space-y-8">
              <p className="text-xs sm:text-sm md:text-base text-slate-300 font-light leading-relaxed">
                {selectedProblem.sottotitolo}
              </p>

              {/* Fasi Sequenziali */}
              <div>
                <h5 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4 sm:mb-6 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Sequenza Fisiopatologica a Cascata (I 3 Passi dell&apos;Incrocio)
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  {selectedProblem.fasi.map((fase, fIdx) => (
                    <div key={fIdx} className="p-4 sm:p-5 rounded-2xl bg-[#141414] border border-white/5 relative group hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          {fase.fase}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${fase.badgeColor}`}>
                          {fase.badge}
                        </span>
                      </div>
                      <h6 className="text-xs sm:text-sm font-medium text-white mb-2 leading-snug">
                        {fase.nome}
                      </h6>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        {fase.descrizione}
                      </p>
                      
                      {fIdx < selectedProblem.fasi.length - 1 && (
                        <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black border border-white/10 items-center justify-center z-10 text-slate-500">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Esito & Azione */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    Esito Clinico Potenzialmente Grave
                  </div>
                  <p className="text-xs sm:text-sm text-red-200/80 font-light leading-relaxed">
                    {selectedProblem.conseguenzaClinica}
                  </p>
                </div>
                
                <div className="p-4 sm:p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    Azione Medica Consigliata
                  </div>
                  <p className="text-xs sm:text-sm text-cyan-200/80 font-light leading-relaxed">
                    {selectedProblem.indicazioniMediche}
                  </p>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="pt-4 border-t border-white/10 flex justify-center">
                <button
                  onClick={() => setSelectedProblem(null)}
                  className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono uppercase tracking-widest transition-all cursor-pointer"
                >
                  Chiudi Dettaglio
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

