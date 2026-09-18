import React from 'react';
import { X, AlertTriangle, FileText, Download, ShieldAlert, Sparkles, ArrowDown } from 'lucide-react';
import { DOMINO_EFFECT_STEPS } from '../data/medicalCategoriesData';

interface DominoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DominoModal({ isOpen, onClose }: DominoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-3xl bg-[#0f1115] border border-red-500/40 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.25)] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />

        {/* Modal Header */}
        <div className="p-4 md:p-6 pb-4 border-b border-white/10 flex items-start justify-between gap-4 bg-gradient-to-b from-red-950/20 to-transparent">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                  Connessione Globale Sistemica
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
                ⚠️ ATTENZIONE: Il Corpo umano funziona ad &quot;Effetto Domino&quot;
              </h2>
              <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                Un problema di salute non rimane mai isolato. Quando una categoria crolla, trascina inevitabilmente le altre dietro di sé:
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all shrink-0 cursor-pointer"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: The 4 Domino Steps */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">
          <div className="space-y-3">
            {DOMINO_EFFECT_STEPS.map((step, idx) => (
              <React.Fragment key={step.step}>
                <div className={`p-4 md:p-5 rounded-2xl border ${step.border} ${step.bg} transition-all hover:scale-[1.01] flex items-start gap-4`}>
                  <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 text-lg shadow-inner">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        {step.titolo}
                      </span>
                    </div>
                    <p className="text-slate-200 text-xs md:text-sm leading-relaxed font-light">
                      {step.descrizione}
                    </p>
                  </div>
                </div>

                {idx < DOMINO_EFFECT_STEPS.length - 1 && (
                  <div className="flex justify-center -my-1 text-slate-600">
                    <ArrowDown className="w-4 h-4 animate-bounce" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Callout Box */}
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/30 to-red-950/40 border border-red-500/40 text-center space-y-2 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-widest font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Spezzare la reazione a catena in tempo</span>
            </div>
            <p className="text-white text-sm md:text-base font-medium leading-relaxed max-w-xl mx-auto">
              &quot;Non aspettare che il domino sia completo. Scarica il report e spezza la catena prima che i parametri vitali vadano in allarme.&quot;
            </p>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-6 border-t border-white/10 bg-black/40 flex flex-col items-center justify-center gap-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 rounded-full border border-white/10 text-slate-400 hover:text-white text-xs font-mono uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer"
          >
            Chiudi Finestra
          </button>
        </div>
      </div>
    </div>
  );
}
