import React, { useState } from 'react';
import { CROSS_PARAMETER_PROBLEMS, CrossParameterProblem } from '../data/medicalCategoriesData';
import { AlertCircle, Zap, ArrowRight, Sparkles, X, Layers } from 'lucide-react';
import type { ScreeningResult } from './MedicalScreening';
import { valutaIncrociClinici } from '../lib/quantumHealthEngine';

interface CrossParameterAnalysisProps {
  result?: ScreeningResult | null;
}

function checkIsProblemCritical(problemId: string, result?: ScreeningResult | null): boolean {
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
      if (result.vitali?.status === 'Non Idoneo' && result.infiammatorio?.status === 'Non Idoneo' && result.score < 35) return true;
      return false;

    case 'rabdomiolisi_danno_renale':
      if (result.organo?.status === 'Non Idoneo' && result.vitali?.status === 'Non Idoneo' && result.score < 30) return true;
      return false;

    case 'sepsi_infezione_sistemica':
      if (result.infiammatorio?.status === 'Non Idoneo' && result.score < 40) return true;
      return false;

    default:
      return false;
  }
}

export default function CrossParameterAnalysis({ result }: CrossParameterAnalysisProps) {
  const [selectedProblem, setSelectedProblem] = useState<CrossParameterProblem | null>(null);

  return (
    <div id="domino-effect-section" className="w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-amber-500/10 rounded-[2.5rem] blur-3xl -z-10" />

      {/* GUIDA ESPLICATIVA DEI MODULI SOTTOSTANTI */}
      <div className="mb-8 p-4 sm:p-6 rounded-[2rem] bg-[#0c0d12] border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Guida ai Moduli Sottostanti
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                Incroci Clinici Fisiologici
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              <strong className="text-white font-medium">Cosa mostrano i moduli sotto:</strong> I quadranti interattivi seguenti mostrano esattamente dove e come la reazione a catena ad &quot;Effetto Domino&quot; si manifesta nel tuo corpo incrociando i tuoi specifici biomarcatori. Tocca o clicca su ciascun modulo per esplorare la sequenza a 3 fasi tra i parametri accoppiati, il danno clinico temuto e le indicazioni mediche per arrestarlo.
            </p>
          </div>
        </div>
      </div>

      {/* TITOLO SEZIONE MODULI */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 px-2">
        <div>
          <div className="flex items-center gap-2 text-red-400 font-mono text-[10px] uppercase tracking-widest font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500/80" />
            Moduli delle Interconnessioni Critiche
          </div>
          <h3 className="text-xl sm:text-2xl font-light text-white tracking-wide mt-1">
            Mappa delle Reazioni a Catena della Salute
          </h3>
        </div>
        <div className="text-[11px] font-mono text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
          Seleziona un quadrante per aprire l&apos;analisi di dettaglio
        </div>
      </div>

      {/* LA GRIGLIA DEI MODULI (Bento Grid Responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 bg-[#0f0f0f] border border-white/5 p-3 sm:p-5 rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-white/[0.01] pointer-events-none mix-blend-overlay" />
        
        {CROSS_PARAMETER_PROBLEMS.map((problem) => {
          const isCritical = checkIsProblemCritical(problem.id, result);
          
          return (
            <div
              key={problem.id}
              onClick={() => setSelectedProblem(problem)}
              className={`group cursor-pointer relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between min-h-[150px] sm:min-h-[160px] border ${
                isCritical 
                  ? 'border-2 border-red-500/80 bg-gradient-to-br from-red-950/40 to-black/80 hover:border-red-400 led-pulse-red shadow-[0_0_30px_rgba(239,68,68,0.25)]' 
                  : 'border-white/5 bg-[#141414] hover:bg-white/5 hover:border-white/20'
              }`}
            >
              {/* Decorative Glow */}
              <div className={`absolute -right-10 -top-10 w-24 h-24 blur-3xl rounded-full transition-all duration-700 group-hover:scale-150 ${isCritical ? 'bg-red-500/25' : 'bg-white/5'}`} />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border truncate transition-all ${
                    isCritical 
                      ? 'text-red-200 border-red-500 bg-red-500/20 led-pulse-badge-red' 
                      : 'text-slate-300 border-white/10 bg-white/5'
                  }`}>
                    {problem.urgenza}
                  </span>
                  <div className="w-7 h-7 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-all shrink-0">
                    <ArrowRight className="w-3.5 h-3.5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                  </div>
                </div>

                <div className="mt-auto pr-10">
                  <h4 className={`text-sm sm:text-base font-medium tracking-wide leading-snug mb-1.5 ${isCritical ? 'text-red-100 font-semibold' : 'text-white'}`}>
                    {problem.titolo}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-light line-clamp-2 leading-relaxed">
                    {problem.sottotitolo}
                  </p>
                </div>
              </div>

              {/* Parametri Overlay al fondo */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex -space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {problem.parametriCoinvolti.map((p, idx) => (
                  <div key={idx} className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#141414] flex items-center justify-center text-[10px] shadow-xl" title={p.nome}>
                    {p.icon}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

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

