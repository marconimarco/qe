import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Check, LogOut, X } from 'lucide-react';
import { useTranslation } from '../lib/TranslationContext';

interface TrialDisclaimerModalProps {
  onAccept: () => void;
  onDecline?: () => void;
  onClose?: () => void;
  readOnly?: boolean;
  isFirstLoginFlow?: boolean;
  stepBadge?: string;
}

const TRIAL_COPY: Record<string, {
  badge: string;
  step1Badge: string;
  title: string;
  greeting: string;
  body: string;
  warning: string;
  checkbox: string;
  acceptBtn: string;
  declineBtn: string;
  closeBtn: string;
}> = {
  it: {
    badge: 'INFORMATIVA LEGALE • VERSIONE SPERIMENTALE',
    step1Badge: 'PASSAGGIO 1 DI 2 • VERSIONE TRIAL DI PROVA',
    title: 'AVVISO IMPORTANTE: VERSIONE TRIAL DI PROVA',
    greeting: 'Gentile Utente,',
    body: "Si informa che questa applicazione è attualmente rilasciata esclusivamente come versione trial di prova e sperimentale. Sebbene i documenti legali (EULA, NDA e Disclaimer) facciano riferimento alla versione definitiva del prodotto, l'utente riconosce e accetta che il software potrebbe contenere bug, anomalie o malfunzionamenti.",
    warning: "Lo sviluppatore e l'organizzazione non si assumono alcuna responsabilità per eventuali danni, interruzioni operative o perdite di dati derivanti dall'utilizzo dell'applicazione in questa fase di collaudo e prova.",
    checkbox: "Dichiaro di aver letto, compreso e accetto che l'applicazione è una versione trial di prova",
    acceptBtn: 'Accetto e Prosegui',
    declineBtn: 'Rifiuta ed Esci',
    closeBtn: 'Chiudi',
  },
  en: {
    badge: 'LEGAL NOTICE • EXPERIMENTAL TRIAL VERSION',
    step1Badge: 'STEP 1 OF 2 • TRIAL EVALUATION VERSION',
    title: 'IMPORTANT NOTICE: TRIAL EVALUATION VERSION',
    greeting: 'Dear User,',
    body: 'Please note that this application is currently released exclusively as an experimental trial evaluation version. Although the legal documents (EULA, NDA, and Disclaimer) refer to the final commercial product, you acknowledge and accept that the software may contain bugs, anomalies, or malfunctions.',
    warning: 'The developer and organization assume no liability for any damages, operational interruptions, or data loss resulting from the use of this application during this testing and trial phase.',
    checkbox: 'I declare that I have read, understood, and accept that this application is a trial evaluation version',
    acceptBtn: 'Accept & Continue',
    declineBtn: 'Decline & Exit',
    closeBtn: 'Close',
  },
  de: {
    badge: 'RECHTLICHER HINWEIS • EXPERIMENTELLE TESTVERSION',
    step1Badge: 'SCHRITT 1 VON 2 • TRIAL-TESTVERSION',
    title: 'WICHTIGER HINWEIS: TRIAL-TESTVERSION',
    greeting: 'Sehr geehrte(r) Nutzer(in),',
    body: 'Diese Anwendung wird derzeit ausschließlich als experimentelle Testversion bereitgestellt. Obwohl die Rechtsdokumente (EULA, NDA und Haftungsausschluss) auf das Endprodukt verweisen, erkennt der Nutzer an, dass die Software Fehler oder Störungen enthalten kann.',
    warning: 'Der Entwickler und die Organisation übernehmen keine Haftung für Schäden, Betriebsunterbrechungen oder Datenverluste während dieser Test- und Prüfphase.',
    checkbox: 'Ich bestätige, dass ich verstanden habe und akzeptiere, dass diese Anwendung eine Trial-Testversion ist',
    acceptBtn: 'Akzeptieren & Weiter',
    declineBtn: 'Ablehnen & Beenden',
    closeBtn: 'Schließen',
  },
  fr: {
    badge: 'MENTION LÉGALE • VERSION EXPÉRIMENTALE D’ESSAI',
    step1Badge: 'ÉTAPE 1 SUR 2 • VERSION D’ESSAI (TRIAL)',
    title: 'AVIS IMPORTANT : VERSION D’ESSAI (TRIAL)',
    greeting: 'Cher utilisateur,',
    body: "Cette application est actuellement fournie exclusivement en version d'essai expérimentale. Bien que les documents juridiques (CLUF/EULA, NDA et clause de non-responsabilité) fassent référence au produit final, l'utilisateur reconnaît que le logiciel peut contenir des anomalies ou dysfonctionnements.",
    warning: "Le développeur et l'organisation déclinent toute responsabilité pour tout dommage, interruption opérationnelle ou perte de données résultant de l'utilisation durant cette phase d'essai.",
    checkbox: "Je déclare avoir lu, compris et j'accepte que l'application soit une version d'essai (Trial)",
    acceptBtn: 'Accepter et Continuer',
    declineBtn: 'Refuser et Quitter',
    closeBtn: 'Fermer',
  },
  zh: {
    badge: '法律声明 • 试验试用版本',
    step1Badge: '第 1 步（共 2 步）• 试用评估版本',
    title: '重要提示：试用评估版本',
    greeting: '尊敬的用户：',
    body: '本应用目前仅作为试验试用版本发布。尽管法律文件（EULA、NDA 及免责声明）指向最终正式版本，用户仍确认并接受软件在测试期间可能存在缺陷、异常或故障。',
    warning: '开发者及所属机构不对在测试和试用阶段使用本应用所导致的任何损失、业务中断或数据丢失承担责任。',
    checkbox: '本人声明已阅读、理解并接受本应用为试验试用版本',
    acceptBtn: '同意并继续',
    declineBtn: '拒绝并退出',
    closeBtn: '关闭',
  },
  ja: {
    badge: '法的通知 • 実験的トライアル版',
    step1Badge: 'ステップ 1 / 2 • トライアル評価版',
    title: '重要なお知らせ：トライアル評価版',
    greeting: 'ユーザーの皆様へ',
    body: '本アプリケーションは現在、実験的なトライアル評価版としてのみ提供されています。法的文書（EULA、NDA、免責事項）は製品版を参照していますが、本ソフトウェアに不具合や異常が含まれる可能性があることを承諾するものとします。',
    warning: '開発者および組織は、本テスト・試用期間中の利用に起因する損害、業務中断、データ損失について一切の責任を負いません。',
    checkbox: '本アプリケーションがトライアル評価版であることを読み、理解し、同意します',
    acceptBtn: '同意して続行',
    declineBtn: '拒否して終了',
    closeBtn: '閉じる',
  },
};

export default function TrialDisclaimerModal({
  onAccept,
  onDecline,
  onClose,
  readOnly = false,
  isFirstLoginFlow = false,
  stepBadge,
}: TrialDisclaimerModalProps) {
  const { language } = useTranslation();
  const copy = TRIAL_COPY[language] || TRIAL_COPY.it;
  const [isAccepted, setIsAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!readOnly && !isAccepted) return;
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

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={copy.closeBtn}
          >
            <X className="w-4 h-4" />
          </button>
        )}

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
            {stepBadge || (isFirstLoginFlow ? copy.step1Badge : copy.badge)}
          </span>

          {/* Titolo */}
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            {copy.title}
          </h2>
        </div>

        {/* Testo del corpo */}
        <div className="px-6 sm:px-8 py-2 space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold text-slate-100 text-sm sm:text-base">
            {copy.greeting}
          </p>
          <p>{copy.body}</p>

          {/* Box di avviso ambra evidenziato */}
          <div className="bg-amber-950/25 border border-amber-900/40 p-4 rounded-2xl flex items-start gap-3.5 text-amber-200/90 shadow-inner">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm leading-relaxed font-medium">
              {copy.warning}
            </p>
          </div>
        </div>

        {/* Form di accettazione con checkbox e pulsante */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-4 sm:pt-6 flex flex-col gap-5 border-t border-slate-800/60 mt-2 bg-slate-950/40">
          {!readOnly && (
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  id="checkbox-accept-trial"
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
                {copy.checkbox}
              </span>
            </label>
          )}

          {/* Pulsanti di azione */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
            {onDecline && (
              <button
                type="button"
                id="decline-trial-btn"
                onClick={onDecline}
                className="px-5 py-3.5 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-xs sm:text-sm font-mono rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{copy.declineBtn}</span>
              </button>
            )}

            <button
              id="accept-trial-btn"
              type={readOnly && onClose ? 'button' : 'submit'}
              onClick={readOnly && onClose ? onClose : undefined}
              disabled={!readOnly && !isAccepted}
              className={`flex-1 py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all duration-200 ${
                readOnly || isAccepted
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 font-bold hover:brightness-110 active:scale-[0.99] shadow-lg shadow-amber-500/20 cursor-pointer'
                  : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <CheckCircle className={`w-5 h-5 ${readOnly || isAccepted ? 'text-slate-950' : 'text-slate-500'}`} />
              <span>{readOnly ? copy.closeBtn : copy.acceptBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

