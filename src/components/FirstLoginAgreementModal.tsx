import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, LogOut, ArrowRight, Eye
} from 'lucide-react';
import { CurrentUserSession, acceptAgreementsForUser } from '../services/authService';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import DisclaimerModal from './DisclaimerModal';
import { useTranslation } from '../lib/TranslationContext';

interface FirstLoginAgreementModalProps {
  currentUser: CurrentUserSession;
  onAccepted: (updatedUser: CurrentUserSession) => void;
  onDecline: () => void;
  stepBadge?: string;
}

const AGREEMENT_COPY: Record<string, {
  title: string;
  badge: string;
  welcome: string;
  subtitle: string;
  selectAllPrompt: string;
  selectAllBtn: string;
  disclaimerTitle: string;
  disclaimerTag: string;
  disclaimerDesc: string;
  ndaEulaTitle: string;
  ndaEulaTag: string;
  ndaEulaDesc: string;
  privacyTitle: string;
  privacyTag: string;
  privacyDesc: string;
  readBtn: string;
  declineBtn: string;
  acceptBtn: string;
  submittingBtn: string;
  errMissing: string;
  errSave: string;
}> = {
  it: {
    title: 'Consenso Legale Obbligatorio',
    badge: 'Passaggio 2 di 2 • Documentazione Legale',
    welcome: 'Benvenuto,',
    subtitle: 'Ai sensi degli Art. 6 e 88, prima di accedere ai motori quantistici è obbligatorio leggere e fleggare l’accettazione di Disclaimer, NDA, EULA e Privacy Policy.',
    selectAllPrompt: 'Accetta tutti i documenti legali con 1 clic:',
    selectAllBtn: '✓ Seleziona Tutto',
    disclaimerTitle: 'General Disclaimer & Condizioni di Servizio (88 Articoli)',
    disclaimerTag: 'Contratto B2B',
    disclaimerDesc: 'Dichiaro di aver letto e approvato specificamente tutti gli 88 articoli, inclusa la limitazione di responsabilità (Art. 22), la validazione umana obbligatoria (Art. 15–16) e il foro competente (Art. 81–82).',
    ndaEulaTitle: 'NDA (Accordo di Riservatezza) & EULA (Licenza d’Uso)',
    ndaEulaTag: 'NDA + EULA',
    ndaEulaDesc: 'Accetto integralmente il Non-Disclosure Agreement (riservatezza per 3 anni post-cessazione, tutela segreti industriali e Art. 38) e l’End-User License Agreement B2B (licenza non esclusiva/revocabile Art. 40, divieto di reverse engineering, scraping e condivisione account Art. 8, 32, 47).',
    privacyTitle: 'Privacy Policy (NIST FIPS 203 // ML-KEM-768)',
    privacyTag: 'Protezione Dati',
    privacyDesc: 'Accetto le politiche sul trattamento dati aziendali, audit log di esecuzione OpenQASM e protocollo di cancellazione immediata dalla memoria volatile (Automatic Flush).',
    readBtn: 'Leggi',
    declineBtn: 'Rifiuta ed Esci',
    acceptBtn: 'Accetto e Accedo alla Piattaforma',
    submittingBtn: 'Registrazione Consenso...',
    errMissing: 'Devi fleggare tutti i documenti richiesti (Disclaimer 88 Articoli, NDA & EULA e Privacy Policy) per accedere alla piattaforma.',
    errSave: 'Errore durante la registrazione del consenso. Riprova.',
  },
  en: {
    title: 'Mandatory Legal Consent',
    badge: 'Step 2 of 2 • Legal Documentation',
    welcome: 'Welcome,',
    subtitle: 'Pursuant to Art. 6 and Art. 88, formal acceptance of the General Disclaimer, NDA, EULA, and Privacy Policy is required before accessing quantum engines.',
    selectAllPrompt: 'Accept all legal documents with 1 click:',
    selectAllBtn: '✓ Select All',
    disclaimerTitle: 'General Disclaimer & Terms of Service (88 Articles)',
    disclaimerTag: 'B2B Contract',
    disclaimerDesc: 'I declare that I have reviewed and specifically approved all 88 articles, including limitation of liabilities (Art. 22), mandatory human-in-the-loop validation (Art. 15–16), and forum selection (Art. 81–82).',
    ndaEulaTitle: 'NDA (Non-Disclosure Agreement) & EULA (End-User License Agreement)',
    ndaEulaTag: 'NDA + EULA',
    ndaEulaDesc: 'I fully accept the Non-Disclosure Agreement (3-year post-termination confidentiality, trade secret protection, Art. 38) and the B2B End-User License Agreement (revocable non-exclusive license Art. 40, prohibition of reverse engineering, scraping, and account sharing Art. 8, 32, 47).',
    privacyTitle: 'Privacy Policy (NIST FIPS 203 // ML-KEM-768)',
    privacyTag: 'Data Protection',
    privacyDesc: 'I accept policies on quantum execution audit logs, volatile RAM wipe protocol (Automatic Flush), and post-quantum cryptographic protection (ML-KEM-768).',
    readBtn: 'Read',
    declineBtn: 'Decline & Exit',
    acceptBtn: 'I Accept & Enter Platform',
    submittingBtn: 'Registering Consent...',
    errMissing: 'You must check all required legal documents (General Disclaimer, NDA & EULA, and Privacy Policy) to access the platform.',
    errSave: 'An error occurred while recording your consent. Please try again.',
  },
  de: {
    title: 'Verpflichtende Rechtliche Zustimmung',
    badge: 'Schritt 2 von 2 • Rechtsdokumentation',
    welcome: 'Willkommen,',
    subtitle: 'Gemäß Art. 6 und Art. 88 ist vor dem Zugriff auf die Quanten-Engines die ausdrückliche Annahme von Disclaimer, NDA, EULA und Datenschutzerklärung erforderlich.',
    selectAllPrompt: 'Alle Rechtsdokumente mit 1 Klick akzeptieren:',
    selectAllBtn: '✓ Alle auswählen',
    disclaimerTitle: 'Allgemeiner Haftungsausschluss & AGB (88 Artikel)',
    disclaimerTag: 'B2B-Vertrag',
    disclaimerDesc: 'Ich bestätige die Prüfung und ausdrückliche Genehmigung aller 88 Artikel einschließlich Haftungsbeschränkung (Art. 22), menschlicher Pflichtprüfung (Art. 15–16) und Gerichtsstand (Art. 81–82).',
    ndaEulaTitle: 'NDA (Geheimhaltungsvereinbarung) & EULA (Lizenzvertrag)',
    ndaEulaTag: 'NDA + EULA',
    ndaEulaDesc: 'Ich akzeptiere die Geheimhaltungsvereinbarung (NDA) sowie den B2B-Endbenutzer-Lizenzvertrag (EULA) einschließlich Reverse-Engineering- und Weitergabeverbot.',
    privacyTitle: 'Datenschutzerklärung (NIST FIPS 203 // ML-KEM-768)',
    privacyTag: 'Datenschutz',
    privacyDesc: 'Ich akzeptiere die Richtlinien zu Quanten-Audit-Logs, flüchtiger RAM-Löschung (Automatic Flush) und Post-Quanten-Schutz.',
    readBtn: 'Lesen',
    declineBtn: 'Ablehnen & Beenden',
    acceptBtn: 'Akzeptieren & Plattform betreten',
    submittingBtn: 'Zustimmung wird gespeichert...',
    errMissing: 'Sie müssen alle erforderlichen Rechtsdokumente (Disclaimer, NDA & EULA und Datenschutz) ankreuzen.',
    errSave: 'Fehler beim Speichern Ihrer Zustimmung. Bitte erneut versuchen.',
  },
  fr: {
    title: 'Consentement Légal Obligatoire',
    badge: 'Étape 2 sur 2 • Documentation Légale',
    welcome: 'Bienvenue,',
    subtitle: "Conformément aux Art. 6 et 88, l'acceptation formelle de l'Avertissement (Disclaimer), du NDA, du CLUF/EULA et de la Politique de Confidentialité est requise avant l'accès.",
    selectAllPrompt: 'Accepter tous les documents en 1 clic :',
    selectAllBtn: '✓ Tout sélectionner',
    disclaimerTitle: 'Avertissement Général & Conditions (88 Articles)',
    disclaimerTag: 'Contrat B2B',
    disclaimerDesc: "Je déclare avoir examiné et approuvé les 88 articles, y compris la limitation de responsabilité (Art. 22), la validation humaine obligatoire (Art. 15–16) et la juridiction compétente (Art. 81–82).",
    ndaEulaTitle: 'NDA (Accord de Confidentialité) & EULA / CLUF (Licence)',
    ndaEulaTag: 'NDA + EULA',
    ndaEulaDesc: "J'accepte pleinement l'accord de confidentialité (NDA) et le contrat de licence B2B (EULA), incluant l'interdiction de rétro-ingénierie et de partage de compte.",
    privacyTitle: 'Politique de Confidentialité (NIST FIPS 203 // ML-KEM-768)',
    privacyTag: 'Protection des Données',
    privacyDesc: "J'accepte les règles sur les journaux d'audit quantiques, l'effacement RAM (Automatic Flush) et la protection post-quantique.",
    readBtn: 'Lire',
    declineBtn: 'Refuser et Quitter',
    acceptBtn: 'Accepter et Accéder à la Plateforme',
    submittingBtn: 'Enregistrement du consentement...',
    errMissing: 'Vous devez cocher tous les documents légaux requis (Disclaimer, NDA & EULA, Confidentialité).',
    errSave: "Une erreur s'est produite lors de l'enregistrement. Veuillez réessayer.",
  },
  zh: {
    title: '强制性法律同意声明',
    badge: '第 2 步（共 2 步）• 法律文件确认',
    welcome: '欢迎，',
    subtitle: '根据第 6 条和第 88 条规定，在访问量子计算引擎前，必须阅读并勾选同意免责声明、NDA、EULA 及隐私政策。',
    selectAllPrompt: '一键勾选全部法律文件：',
    selectAllBtn: '✓ 全选',
    disclaimerTitle: '通用免责声明与服务条款（88 条）',
    disclaimerTag: 'B2B 合同',
    disclaimerDesc: '本人声明已审阅并同意全部 88 项条款，包括责任限制（第 22 条）、强制人工审核（第 15–16 条）及管辖法院（第 81–82 条）。',
    ndaEulaTitle: 'NDA（保密协议）与 EULA（最终用户许可协议）',
    ndaEulaTag: 'NDA + EULA',
    ndaEulaDesc: '本人完全同意保密协议（NDA）及 B2B 最终用户许可协议（EULA），包括禁止逆向工程、禁止数据抓取与禁止账号共享条款。',
    privacyTitle: '隐私政策（NIST FIPS 203 // ML-KEM-768）',
    privacyTag: '数据保护',
    privacyDesc: '本人同意量子审计日志、易失性内存即时擦除协议（Automatic Flush）及后量子加密保护规范。',
    readBtn: '阅读',
    declineBtn: '拒绝并退出',
    acceptBtn: '同意并进入平台',
    submittingBtn: '正在记录同意状态...',
    errMissing: '您必须勾选全部法律文件（免责声明、NDA 与 EULA 及隐私政策）方可进入平台。',
    errSave: '记录您的同意时发生错误，请重试。',
  },
  ja: {
    title: '必須法的同意事項',
    badge: 'ステップ 2 / 2 • 法的文書確認',
    welcome: 'ようこそ、',
    subtitle: '第6条および第88条に基づき、量子エンジンへアクセスする前に免責事項、NDA、EULA、およびプライバシーポリシーへの同意が必須です。',
    selectAllPrompt: 'すべての法的文書をワンクリックで同意：',
    selectAllBtn: '✓ すべて選択',
    disclaimerTitle: '一般免責事項および利用規約（全88条）',
    disclaimerTag: 'B2B 契約',
    disclaimerDesc: '責任制限（第22条）、必須の人間による検証（第15–16条）、および専属的合意管轄（第81–82条）を含む全88条を確認し承諾します。',
    ndaEulaTitle: 'NDA（秘密保持契約）および EULA（エンドユーザー使用許諾契約）',
    ndaEulaTag: 'NDA + EULA',
    ndaEulaDesc: '秘密保持契約（NDA）およびB2B使用許諾契約（EULA）（リバースエンジニアリング・アカウント共有禁止等）に全面的に同意します。',
    privacyTitle: 'プライバシーポリシー（NIST FIPS 203 // ML-KEM-768）',
    privacyTag: 'データ保護',
    privacyDesc: '量子実行監査ログ、揮発性メモリ即時消去（Automatic Flush）、耐量子暗号保護ポリシーに同意します。',
    readBtn: '読む',
    declineBtn: '拒否して終了',
    acceptBtn: '同意してプラットフォームへ進む',
    submittingBtn: '同意を記録中...',
    errMissing: 'プラットフォームにアクセスするには、すべての法的文書（免責事項、NDA/EULA、プライバシーポリシー）にチェックを入れる必要があります。',
    errSave: '同意の記録中にエラーが発生しました。もう一度お試しください。',
  },
};

export default function FirstLoginAgreementModal({
  currentUser,
  onAccepted,
  onDecline,
  stepBadge,
}: FirstLoginAgreementModalProps) {
  const { language } = useTranslation();
  const copy = AGREEMENT_COPY[language] || AGREEMENT_COPY.it;

  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [acceptedNdaEula, setAcceptedNdaEula] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canProceed = acceptedDisclaimer && acceptedNdaEula && acceptedPrivacy;

  const handleConfirm = () => {
    if (!canProceed) {
      setErrorMessage(copy.errMissing);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = acceptAgreementsForUser(currentUser.id);
      setIsSubmitting(false);
      if (res.success && res.session) {
        onAccepted(res.session);
      } else {
        setErrorMessage(copy.errSave);
      }
    }, 300);
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
                  {copy.title}
                </h2>
                <span className="px-2 py-0.5 text-[8px] sm:text-[9px] font-mono uppercase bg-quantum-primary/15 text-quantum-primary border border-quantum-primary/40 rounded-full font-bold">
                  {stepBadge || copy.badge}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-mono mt-0.5 sm:mt-1 truncate">
                {copy.welcome} <strong className="text-white">{currentUser.name}</strong> (@{currentUser.username})
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-400 font-mono mt-0.5 leading-relaxed">
                {copy.subtitle}
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

            {/* Quick Accept All banner */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-mono">
              <span className="text-gray-300 text-[11px]">{copy.selectAllPrompt}</span>
              <button
                type="button"
                id="select-all-agreements-btn"
                onClick={() => {
                  setAcceptedDisclaimer(true);
                  setAcceptedNdaEula(true);
                  setAcceptedPrivacy(true);
                  setErrorMessage(null);
                }}
                className="px-2.5 py-1 bg-quantum-primary/20 hover:bg-quantum-primary/30 text-quantum-primary border border-quantum-primary/40 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer shrink-0"
              >
                {copy.selectAllBtn}
              </button>
            </div>

            {/* Agreements checklist */}
            <div className="space-y-3">
              {/* 1. Disclaimer Item */}
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
                          {copy.disclaimerTitle}
                        </span>
                        <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 uppercase font-bold">
                          {copy.disclaimerTag}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 leading-relaxed">
                        {copy.disclaimerDesc}
                      </p>
                    </div>
                  </label>

                  <button
                    type="button"
                    id="view-disclaimer-first-login-btn"
                    onClick={() => setIsDisclaimerOpen(true)}
                    className="px-2 py-1.5 sm:px-2.5 bg-white/5 hover:bg-amber-500/20 text-amber-300 border border-white/10 hover:border-amber-500/40 rounded-lg sm:rounded-xl text-[10px] font-mono flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{copy.readBtn}</span>
                  </button>
                </div>
              </div>

              {/* 2. NDA & EULA Item */}
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                acceptedNdaEula 
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}>
                <div className="flex items-start justify-between gap-2.5">
                  <label className="flex items-start gap-2.5 sm:gap-3 cursor-pointer flex-1 min-w-0">
                    <input
                      id="checkbox-accept-nda-eula"
                      type="checkbox"
                      checked={acceptedNdaEula}
                      onChange={(e) => {
                        setAcceptedNdaEula(e.target.checked);
                        setErrorMessage(null);
                      }}
                      className="mt-0.5 sm:mt-1 w-5 h-5 sm:w-4 sm:h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-emerald-400 shrink-0"
                    />
                    <div className="font-mono text-xs min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {copy.ndaEulaTitle}
                        </span>
                        <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 uppercase font-bold">
                          {copy.ndaEulaTag}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 leading-relaxed">
                        {copy.ndaEulaDesc}
                      </p>
                    </div>
                  </label>

                  <button
                    type="button"
                    id="view-nda-eula-first-login-btn"
                    onClick={() => setIsDisclaimerOpen(true)}
                    className="px-2 py-1.5 sm:px-2.5 bg-white/5 hover:bg-emerald-500/20 text-emerald-300 border border-white/10 hover:border-emerald-500/40 rounded-lg sm:rounded-xl text-[10px] font-mono flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{copy.readBtn}</span>
                  </button>
                </div>
              </div>

              {/* 3. Privacy Policy Item */}
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
                          {copy.privacyTitle}
                        </span>
                        <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 bg-quantum-primary/20 text-quantum-primary rounded border border-quantum-primary/30 uppercase font-bold">
                          {copy.privacyTag}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 leading-relaxed">
                        {copy.privacyDesc}
                      </p>
                    </div>
                  </label>

                  <button
                    type="button"
                    id="view-privacy-first-login-btn"
                    onClick={() => setIsPrivacyOpen(true)}
                    className="px-2 py-1.5 sm:px-2.5 bg-white/5 hover:bg-quantum-primary/20 text-quantum-primary border border-white/10 hover:border-quantum-primary/40 rounded-lg sm:rounded-xl text-[10px] font-mono flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{copy.readBtn}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Buttons */}
          <div className="p-3 sm:p-5 border-t border-white/10 bg-black/50 shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              id="decline-agreements-btn"
              onClick={onDecline}
              className="px-4 py-2.5 sm:py-2.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-xs font-mono rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{copy.declineBtn}</span>
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
                  <span>{copy.submittingBtn}</span>
                </>
              ) : (
                <>
                  <span>{copy.acceptBtn}</span>
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

