import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, FileText, Check, Lock, ExternalLink, 
  ChevronRight, LogOut, ArrowRight, Eye, Shield
} from 'lucide-react';
import { CurrentUserSession, acceptAgreementsForUser } from '../services/authService';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import DisclaimerModal from './DisclaimerModal';

interface FirstLoginAgreementModalProps {
  currentUser: CurrentUserSession;
  onAccepted: (updatedUser: CurrentUserSession) => void;
  onDecline: () => void;
}

export default function FirstLoginAgreementModal({
  currentUser,
  onAccepted,
  onDecline
}: FirstLoginAgreementModalProps) {
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canProceed = acceptedDisclaimer && acceptedPrivacy;

  const handleConfirm = () => {
    if (!canProceed) {
      setErrorMessage('You must accept both the General Disclaimer (88 Articles) and the Privacy Policy to access the platform.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = acceptAgreementsForUser(currentUser.id);
      setIsSubmitting(false);
      if (res.success && res.session) {
        onAccepted(res.session);
      } else {
        setErrorMessage('An error occurred while recording your consent. Please try again.');
      }
    }, 400);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-fadeIn select-none text-white font-sans overflow-y-auto">
        {/* Glow behind modal */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-amber-500/10 blur-[160px] rounded-full" />
          <div className="absolute top-1/4 left-1/3 w-[400px] h-[350px] bg-quantum-primary/10 blur-[140px] rounded-full" />
        </div>

        <div 
          className="relative z-10 w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] bg-gradient-to-b from-[#141a29] to-[#0a0e17] border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header (Fixed at top) */}
          <div className="flex items-start gap-3 sm:gap-4 border-b border-white/10 p-4 sm:p-6 bg-black/30 shrink-0">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-amber-500/20 to-quantum-primary/20 border border-amber-500/40 rounded-xl sm:rounded-2xl text-amber-400 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-quantum-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-lg font-display font-bold uppercase tracking-wider text-white">
                  Mandatory Legal Consent
                </h2>
                <span className="px-2 py-0.5 text-[8px] sm:text-[9px] font-mono uppercase bg-quantum-primary/15 text-quantum-primary border border-quantum-primary/40 rounded-full font-bold">
                  First B2B Access
                </span>
              </div>
              <p className="text-xs text-gray-300 font-mono mt-0.5 sm:mt-1 truncate">
                Welcome, <strong className="text-white">{currentUser.name}</strong> (@{currentUser.username})
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-400 font-mono mt-0.5 line-clamp-2 sm:line-clamp-none">
                Pursuant to Art. 6 and Art. 88, formal acceptance is required prior to accessing quantum engines.
              </p>
            </div>
          </div>

          {/* Scrollable Center Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3 sm:space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl sm:rounded-2xl flex items-center gap-2.5 text-red-200 text-xs font-mono animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Accept All on Mobile banner */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-mono">
              <span className="text-gray-300 text-[11px]">Accept both with 1-click:</span>
              <button
                type="button"
                onClick={() => {
                  setAcceptedDisclaimer(true);
                  setAcceptedPrivacy(true);
                  setErrorMessage(null);
                }}
                className="px-2.5 py-1 bg-quantum-primary/20 hover:bg-quantum-primary/30 text-quantum-primary border border-quantum-primary/40 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
              >
                ✓ Select All
              </button>
            </div>

            {/* Agreements checklist */}
            <div className="space-y-3">
              {/* Disclaimer Item */}
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                acceptedDisclaimer 
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}>
                <div className="flex items-start justify-between gap-2.5">
                  <label className="flex items-start gap-2.5 sm:gap-3 cursor-pointer flex-1 min-w-0">
                    <input
                      id="checkbox-accept-disclaimer"
                      type="checkbox"
                      checked={acceptedDisclaimer}
                      onChange={(e) => {
                        setAcceptedDisclaimer(e.target.checked);
                        setErrorMessage(null);
                      }}
                      className="mt-0.5 sm:mt-1 w-5 h-5 sm:w-4 sm:h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500 shrink-0"
                    />
                    <div className="font-mono text-xs min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-white text-xs sm:text-sm">
                          General Disclaimer (88 Articles)
                        </span>
                        <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 uppercase font-bold">
                          B2B Contract
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 leading-relaxed">
                        I declare that I have reviewed and specifically approved all 88 articles, including limitation of liabilities (Art. 22) and forum selection (Art. 81-82).
                      </p>
                    </div>
                  </label>

                  <button
                    type="button"
                    id="view-disclaimer-first-login-btn"
                    onClick={() => setIsDisclaimerOpen(true)}
                    className="px-2 py-1.5 sm:px-2.5 bg-white/5 hover:bg-amber-500/20 text-amber-300 border border-white/10 hover:border-amber-500/40 rounded-lg sm:rounded-xl text-[10px] font-mono flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                    title="Read full Disclaimer text"
                  >
                    <Eye className="w-3 h-3" />
                    <span className="hidden xs:inline sm:inline">Read</span>
                  </button>
                </div>
              </div>

              {/* Privacy Policy Item */}
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                acceptedPrivacy 
                  ? 'bg-quantum-primary/10 border-quantum-primary/40 shadow-[0_0_15px_rgba(0,242,255,0.1)]' 
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}>
                <div className="flex items-start justify-between gap-2.5">
                  <label className="flex items-start gap-2.5 sm:gap-3 cursor-pointer flex-1 min-w-0">
                    <input
                      id="checkbox-accept-privacy"
                      type="checkbox"
                      checked={acceptedPrivacy}
                      onChange={(e) => {
                        setAcceptedPrivacy(e.target.checked);
                        setErrorMessage(null);
                      }}
                      className="mt-0.5 sm:mt-1 w-5 h-5 sm:w-4 sm:h-4 rounded border-gray-600 text-quantum-primary focus:ring-quantum-primary cursor-pointer accent-cyan-400 shrink-0"
                    />
                    <div className="font-mono text-xs min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-white text-xs sm:text-sm">
                          Privacy Policy (NIST FIPS 203)
                        </span>
                        <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 bg-quantum-primary/20 text-quantum-primary rounded border border-quantum-primary/30 uppercase font-bold">
                          Data Protection
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 leading-relaxed">
                        I accept policies on quantum log processing, volatile RAM wipe protocol (Automatic Flush), and post-quantum cryptographic protection (ML-KEM-768).
                      </p>
                    </div>
                  </label>

                  <button
                    type="button"
                    id="view-privacy-first-login-btn"
                    onClick={() => setIsPrivacyOpen(true)}
                    className="px-2 py-1.5 sm:px-2.5 bg-white/5 hover:bg-quantum-primary/20 text-quantum-primary border border-white/10 hover:border-quantum-primary/40 rounded-lg sm:rounded-xl text-[10px] font-mono flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                    title="Read full Privacy Policy text"
                  >
                    <Eye className="w-3 h-3" />
                    <span className="hidden xs:inline sm:inline">Read</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Buttons (Always visible on mobile without scrolling off-screen) */}
          <div className="p-3 sm:p-5 border-t border-white/10 bg-black/50 shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              id="decline-agreements-btn"
              onClick={onDecline}
              className="px-4 py-2.5 sm:py-2.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-xs font-mono rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Decline & Exit</span>
            </button>

            <button
              id="accept-and-enter-dashboard-btn"
              onClick={handleConfirm}
              disabled={!canProceed || isSubmitting}
              className={`px-5 py-3 sm:py-2.5 rounded-xl font-display font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                canProceed && !isSubmitting
                  ? 'bg-gradient-to-r from-quantum-primary to-cyan-300 text-black shadow-[0_0_25px_rgba(0,242,255,0.4)] hover:from-cyan-300 hover:to-quantum-primary active:scale-[0.98]'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Registering Consent...</span>
                </>
              ) : (
                <>
                  <span>I Accept & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modals for Reading Agreements */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
        canEdit={currentUser.role === 'admin'}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </>
  );
}
