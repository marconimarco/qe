import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Check } from 'lucide-react';

interface TrialDisclaimerModalProps {
  onAccept: () => void;
}

export default function TrialDisclaimerModal({ onAccept }: TrialDisclaimerModalProps) {
  const [isAccepted, setIsAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAccepted) return;
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto">
      {/* Bagliori ambra/rossi sfumati di sfondo */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[450px] bg-amber-500/15 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[350px] bg-red-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[300px] bg-orange-600/10 blur-[140px] rounded-full" />
      </div>

      {/* Card modale */}
      <div 
        className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-800/80 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superiore decorativa a gradiente ambra/arancio */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shrink-0" />

        {/* Intestazione */}
        <div className="p-6 sm:p-8 pb-4 sm:pb-6 flex flex-col items-center text-center">
          {/* Icona ShieldAlert con bagliore pulsante */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-amber-500/30 rounded-2xl blur-lg animate-ping opacity-30" />
            <div className="relative p-3.5 bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-red-500/20 border border-amber-500/40 rounded-2xl text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 animate-pulse" />
            </div>
          </div>

          {/* Badge/Tag superiore */}
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-[11px] sm:text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-3 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            INFORMATIVA LEGALE • VERSIONE SPERIMENTALE
          </span>

          {/* Titolo */}
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            AVVISO IMPORTANTE: VERSIONE TRIAL DI PROVA
          </h2>
        </div>

        {/* Testo del corpo */}
        <div className="px-6 sm:px-8 py-2 space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold text-slate-100 text-sm sm:text-base">
            Gentile Utente,
          </p>
          <p>
            Si informa che questa applicazione è attualmente rilasciata esclusivamente come versione trial di prova e sperimentale. Sebbene i documenti legali (EULA, NDA e Disclaimer) facciano riferimento alla versione definitiva del prodotto, l'utente riconosce e accetta che il software potrebbe contenere bug, anomalie o malfunzionamenti.
          </p>

          {/* Box di avviso ambra evidenziato */}
          <div className="bg-amber-950/25 border border-amber-900/40 p-4 rounded-2xl flex items-start gap-3.5 text-amber-200/90 shadow-inner">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm leading-relaxed font-medium">
              Lo sviluppatore e l'organizzazione non si assumono alcuna responsabilità per eventuali danni, interruzioni operative o perdite di dati derivanti dall'utilizzo dell'applicazione in questa fase di collaudo e prova.
            </p>
          </div>
        </div>

        {/* Form di accettazione con checkbox e pulsante */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-4 sm:pt-6 flex flex-col gap-5 border-t border-slate-800/60 mt-2 bg-slate-950/40">
          {/* Casella di controllo obbligatoria */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={isAccepted}
                onChange={(e) => setIsAccepted(e.target.checked)}
                className="sr-only"
              />
              <div 
                className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${
                  isAccepted
                    ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-800/80 border-slate-700 group-hover:border-amber-500/50'
                }`}
              >
                {isAccepted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
            <span className="text-xs sm:text-sm text-slate-200 group-hover:text-white transition-colors leading-relaxed">
              Dichiaro di aver letto, compreso e accetto che l'applicazione è una versione trial di prova
            </span>
          </label>

          {/* Pulsante di azione */}
          <button
            type="submit"
            disabled={!isAccepted}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all duration-200 ${
              isAccepted
                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 font-bold hover:brightness-110 active:scale-[0.99] shadow-lg shadow-amber-500/20 cursor-pointer'
                : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed opacity-50'
            }`}
          >
            <CheckCircle className={`w-5 h-5 ${isAccepted ? 'text-slate-950' : 'text-slate-500'}`} />
            <span>Accetto e Prosegui</span>
          </button>
        </form>
      </div>
    </div>
  );
}
