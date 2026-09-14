import React, { useState } from 'react';
import { CROSS_PARAMETER_PROBLEMS, CrossParameterProblem } from '../data/medicalCategoriesData';
import { AlertCircle, ChevronDown, ChevronUp, Zap, FileText, ArrowRight, ShieldAlert, Sparkles, Activity } from 'lucide-react';

interface CrossParameterAnalysisProps {
  onGeneratePdf: () => void;
  onOpenDominoModal: () => void;
}

export default function CrossParameterAnalysis({ onGeneratePdf, onOpenDominoModal }: CrossParameterAnalysisProps) {
  const [expandedId, setExpandedId] = useState<string>('glicemia_colesterolo_ictus');

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? '' : id));
  };

  return (
    <div className="w-full bg-[#0d0f12] border border-white/10 rounded-2xl p-3 mt-4 shadow-2xl relative overflow-hidden">
      {/* Background subtle styling */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Sinergia e Fisiopatologia Clinica
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-semibold">
              Matrice Incroci Critici
            </span>
          </div>
          <h3 className="text-sm md:text-base font-medium text-white tracking-wide">
            Problematiche Dovute agli Incroci dei Parametri
          </h3>
          <p className="text-slate-400 text-[11px] md:text-xs font-light mt-1 max-w-2xl leading-relaxed">
            I singoli biomarcatori isolati raccontano solo una parte della storia. Quando più parametri alterati si intersecano, innescano reazioni a catena che sfociano in eventi acuti o disfunzioni croniche d&apos;organo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDominoModal}
            className="animate-domino-pulse px-3 py-1.5 rounded-full text-[10px] bg-gradient-to-r from-red-600/30 to-amber-600/30 border border-red-500/60 text-white text-[10px] font-semibold uppercase tracking-wider flex items-center gap-2 hover:brightness-125 transition-all cursor-pointer shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Effetto Domino Globale</span>
          </button>
          
          <button
            onClick={onGeneratePdf}
            className="px-3 py-1.5 rounded-full text-[10px] bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Report PDF</span>
          </button>
        </div>
      </div>

      {/* Cards list */}
      <div className="mt-5 space-y-4 relative z-10">
        {CROSS_PARAMETER_PROBLEMS.map((problem) => {
          const isExpanded = expandedId === problem.id;
          const isPrimary = problem.id === 'glicemia_colesterolo_ictus';

          return (
            <div
              key={problem.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isPrimary
                  ? 'border-red-500/50 bg-gradient-to-b from-red-950/20 via-black/40 to-black/60 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
                  : 'border-white/10 bg-black/40 hover:border-white/20'
              }`}
            >
              {/* Card Header clickable */}
              <div
                onClick={() => toggleExpand(problem.id)}
                className="p-3 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border text-white bg-white/5 border-white/10">
                      {problem.urgenza}
                    </span>
                    {isPrimary && (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-500 text-black animate-pulse">
                        Priorità Clinica Massima
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm md:text-base font-medium text-white tracking-wide flex items-center gap-2">
                    {problem.titolo}
                  </h4>

                  <p className="text-[11px] md:text-xs text-slate-300 font-light">
                    {problem.sottotitolo}
                  </p>

                  {/* Parametri coinvolti pills */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {problem.parametriCoinvolti.map((param, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 flex items-center gap-1.5"
                      >
                        <span>{param.icon}</span>
                        <span>{param.nome}</span>
                        <span className="text-[9px] text-slate-400">({param.categoria})</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                    {isExpanded ? 'Comprimi' : 'Vedi Dinamica'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-3 md:px-4 pb-4 pt-2 border-t border-white/5 space-y-4 animate-in fade-in duration-300">
                  {/* Fasi sequenziali */}
                  <div>
                    <h5 className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Sequenza Fisiopatologica a Cascata:
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {problem.fasi.map((fase, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-3 rounded-lg bg-black/60 border border-white/10 flex flex-col justify-between space-y-2 relative overflow-hidden"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                                {fase.fase}
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${fase.badgeColor}`}>
                                {fase.badge}
                              </span>
                            </div>
                            <h6 className="text-xs font-semibold text-white">
                              {fase.nome}
                            </h6>
                            <p className="text-[11px] text-slate-300 font-light leading-relaxed">
                              {fase.descrizione}
                            </p>
                          </div>

                          {fIdx < problem.fasi.length - 1 && (
                            <div className="hidden md:flex justify-end pt-2 text-slate-600">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Esito Clinico & Prevenzione */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/20 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4" />
                        Esito Clinico Potenzialmente Fatale
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {problem.conseguenzaClinica}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        Azione Clinica e Diagnostica Consigliata
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {problem.indicazioniMediche}
                      </p>
                    </div>
                  </div>

                  {/* Interconnection Action Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      onClick={onOpenDominoModal}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1.5 underline decoration-amber-500/50 underline-offset-4 cursor-pointer"
                    >
                      <span>Visualizza come questa alterazione scatena l&apos;Effetto Domino su tutti gli organi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={onGeneratePdf}
                      className="w-full sm:w-auto px-3 py-1.5 rounded-lg text-[10px] bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Includi questa analisi nel Report PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
