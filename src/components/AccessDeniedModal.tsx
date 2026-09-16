import React from 'react';
import { ShieldAlert, Lock, X, ArrowRight, UserCheck } from 'lucide-react';
import { CurrentUserSession, getIconPermissionDetails } from '../services/authService';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  iconId: string;
  iconName?: string;
  currentUser: CurrentUserSession;
}

export default function AccessDeniedModal({
  isOpen,
  onClose,
  iconId,
  iconName,
  currentUser
}: AccessDeniedModalProps) {
  if (!isOpen) return null;

  const iconDetails = getIconPermissionDetails(iconId);
  const displayName = iconName || iconDetails?.name || iconId;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none text-white">
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-[#16121e] via-[#0f0e17] to-[#0a0a0f] border border-red-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.25)] flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full" />

        {/* Header with Close */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-2xl text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Accesso Risorsa Negato
                </span>
              </div>
              <h3 className="text-base font-display font-black uppercase tracking-wider text-white mt-1">
                Icona Non Autorizzata
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature info card */}
        <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl mb-4 font-mono">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
            Funzionalità Richiesta:
          </div>
          <div className="text-sm font-bold text-red-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            {displayName}
          </div>
          {iconDetails?.description && (
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed font-sans">
              {iconDetails.description}
            </p>
          )}
        </div>

        {/* Explanation text */}
        <div className="space-y-2.5 font-mono text-xs text-gray-300 mb-5 bg-black/40 p-3.5 rounded-xl border border-white/5">
          <p className="leading-relaxed">
            L'Amministratore di Sistema (<span className="text-quantum-primary font-bold">Chief Security Officer</span>) ha configurato i permessi del tuo profilo bloccando l'accesso a questa specifica icona.
          </p>
          <div className="pt-2 border-t border-white/5 flex flex-col gap-1 text-[10px] text-gray-400">
            <div>Account: <span className="text-white font-bold">{currentUser.name}</span> (@{currentUser.username})</div>
            <div>Ruolo corrente: <span className="text-cyan-300 font-bold uppercase">{currentUser.role}</span></div>
            <div>ID Icona: <span className="font-mono text-gray-500">{iconId}</span></div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-red-500/80 to-red-600 hover:from-red-500 hover:to-red-500 text-white font-display font-bold uppercase text-xs rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Ho Capito</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
