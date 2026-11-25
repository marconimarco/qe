import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Activity, Cpu, Play, CheckCircle2, Server, FileText, Download, Copy, Check } from 'lucide-react';
import { CodeBlockWithCopy, IstogrammaQuantisticoUniversale, IbmQuantumComposerMockup } from './TestPage';
import { useTranslation } from '../lib/TranslationContext';
import { getAgentUi } from '../lib/agentAiTranslations';

interface EndInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  qasmCode: string;
  pythonCode: string;
  jsonCode: string;
  interviewText?: string;
  onDownloadInterview?: () => void;
  theta: number;
  phi: number;
  targetAlgoritmo: string;
  sector: string;
  scenarioType?: 'quantum' | 'classical';
  fonteDati?: 'utente' | 'demo';
  onSendToIBM: () => void;
}

function BlochSphere({ theta, phi, targetAlgoritmo }: { theta: number; phi: number; targetAlgoritmo: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let currentTheta = 0;
    let currentPhi = 0;
    let time = 0;

    const targetThetaDeg = Math.max(0, Math.min(180, theta));
    const targetPhiDeg = ((phi % 360) + 360) % 360;

    const render = () => {
      currentTheta += (targetThetaDeg - currentTheta) * 0.05;
      currentPhi += (targetPhiDeg - currentPhi) * 0.05;
      time += 0.02;

      const isQuantum = targetAlgoritmo.startsWith('Qiskit_');
      const size = 280;
      const center = size / 2;
      const radius = 100;
      const radTheta = (currentTheta * Math.PI) / 180;
      const radPhi = (currentPhi * Math.PI) / 180;

      ctx.clearRect(0, 0, size, size);

      const gradient = ctx.createRadialGradient(center, center, radius * 0.2, center, center, radius * 1.5);
      gradient.addColorStop(0, targetAlgoritmo === 'IDLE' ? 'rgba(30, 41, 59, 0.2)' : (isQuantum ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'));
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(center, center, radius, radius * 0.3, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(center, center, radius * 0.3, radius, 0, 0, 2 * Math.PI);
      ctx.stroke();

      const innerGrad = ctx.createRadialGradient(center - radius * 0.3, center - radius * 0.3, radius * 0.1, center, center, radius);
      innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fill();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(time * 0.2);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.3, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(-time * 0.15);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.3, Math.PI / 2, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.2)';
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(center, center - radius - 15); ctx.lineTo(center, center + radius + 15);
      ctx.moveTo(center - radius - 15, center); ctx.lineTo(center + radius + 15, center);
      ctx.strokeStyle = 'rgba(99, 115, 139, 0.3)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#06b6d4'; ctx.font = 'bold 10px monospace'; ctx.fillText('|0⟩', center - 18, center - radius - 5);
      ctx.fillStyle = '#ec4899'; ctx.fillText('|1⟩', center - 18, center + radius + 12);

      const x3d = radius * Math.sin(radTheta) * Math.cos(radPhi + time);
      const y3d = radius * Math.sin(radTheta) * Math.sin(radPhi + time) * 0.3;
      const z3d = radius * Math.cos(radTheta);

      const x = center + x3d;
      const y = center - z3d + y3d;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(x, y);
      const vecColor = targetAlgoritmo === 'IDLE' ? '#94a3b8' : (isQuantum ? '#f59e0b' : '#10b981');
      ctx.strokeStyle = vecColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = vecColor;
      ctx.fill();
      ctx.shadowBlur = 10;
      ctx.shadowColor = vecColor;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [theta, phi, targetAlgoritmo]);

  return <canvas ref={canvasRef} width={280} height={280} className="w-full max-w-[280px] mx-auto" />;
}

const INTERVIEW_MODAL_COPY: Record<string, {
  title: string;
  autoBadge: string;
  downloadBtn: string;
}> = {
  it: {
    title: 'Report Completo & Intervista (.txt: Intervista + CSV + Pop-up + Codici)',
    autoBadge: 'Report completo scaricato in automatico',
    downloadBtn: 'Scarica Tutto (.txt)',
  },
  en: {
    title: 'Complete Report & Interview (.txt: Interview + CSV + Pop-up + Code)',
    autoBadge: 'Full report auto-downloaded',
    downloadBtn: 'Download All (.txt)',
  },
  de: {
    title: 'Vollständiger Bericht & Interview (.txt: Interview + CSV + Pop-up + Code)',
    autoBadge: 'Vollständiger Bericht automatisch heruntergeladen',
    downloadBtn: 'Alles herunterladen (.txt)',
  },
  fr: {
    title: 'Rapport Complet & Entretien (.txt : Entretien + CSV + Pop-up + Codes)',
    autoBadge: 'Rapport complet téléchargé automatiquement',
    downloadBtn: 'Tout télécharger (.txt)',
  },
  zh: {
    title: '完整报告与访谈记录 (.txt：访谈 + CSV + 弹窗结果 + 代码)',
    autoBadge: '完整报告已自动下载',
    downloadBtn: '下载全部 (.txt)',
  },
  ja: {
    title: '完全レポート＆インタビュー (.txt：対話 + CSV + ポップアップ結果 + コード)',
    autoBadge: '完全レポートを自動ダウンロード済み',
    downloadBtn: 'すべてダウンロード (.txt)',
  },
};

export default function EndInterviewModal({
  isOpen, onClose, qasmCode, pythonCode, jsonCode, interviewText = '', onDownloadInterview, theta, phi, targetAlgoritmo, sector, scenarioType = 'quantum', fonteDati = 'utente', onSendToIBM
}: EndInterviewModalProps) {
  const { language } = useTranslation();
  const ui = getAgentUi(language);
  const interviewCopy = INTERVIEW_MODAL_COPY[language] || INTERVIEW_MODAL_COPY.it;
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const isQuantumScenario = scenarioType === 'quantum' && targetAlgoritmo.startsWith('Qiskit_');

  const handleCopyTranscript = () => {
    if (!interviewText) return;
    navigator.clipboard?.writeText(interviewText)?.catch(() => {});
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2200);
  };

  let parsedThetaRad: number | null = null;
  try {
    const parsed = JSON.parse(jsonCode || '{}');
    if (typeof parsed?.theta_radianti === 'number' && !isNaN(parsed.theta_radianti)) {
      parsedThetaRad = parsed.theta_radianti;
    }
  } catch {
    // ignore invalid json
  }
  const thetaDeg = parsedThetaRad !== null ? (parsedThetaRad * 180) / Math.PI : theta;
  const thetaRad = parsedThetaRad !== null ? parsedThetaRad : (theta * Math.PI) / 180;
  const phiDeg = phi;
  const phiRad = (phi * Math.PI) / 180;
  const quantumOutcome = ui.modalOutcomeQuantumHtml(thetaRad.toFixed(4));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl bg-slate-950 border border-white/20 rounded-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Activity className={`w-5 h-5 ${isQuantumScenario ? 'text-amber-400' : 'text-emerald-400'}`} />
                <h2 className="font-mono text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                  {ui.modalTitle}
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    isQuantumScenario
                      ? 'bg-purple-950/70 text-purple-300 border-purple-500/40'
                      : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {isQuantumScenario ? ui.modalPipelineQuantum : ui.modalPipelineClassical}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold flex items-center gap-1.5 ${
                    fonteDati === 'utente'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-sky-950/80 text-sky-300 border-sky-500/50 shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                  }`}
                  title={fonteDati === 'utente' ? ui.modalSourceUserDesc : ui.modalSourceDemoDesc}
                  >
                    {fonteDati === 'utente' ? ui.modalSourceUserShort : ui.modalSourceDemoShort}
                  </span>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-slate-700">

              {/* Banner Informativo Fonte Dati */}
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono shadow-sm ${
                fonteDati === 'utente'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-sky-950/40 border-sky-500/40 text-sky-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{fonteDati === 'utente' ? '📂' : '📦'}</span>
                  <div>
                    <div className="font-bold">
                      {fonteDati === 'utente' ? ui.modalSourceUserBanner : ui.modalSourceDemoBanner}
                    </div>
                    <div className="text-[11px] opacity-90 mt-0.5">
                      {fonteDati === 'utente' ? ui.modalSourceUserTitle : ui.modalSourceDemoTitle}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider shrink-0 border ${
                  fonteDati === 'utente'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                }`}>
                  {fonteDati === 'utente' ? ui.modalBadgeUser : ui.modalBadgeDemo}
                </span>
              </div>

              {/* Codici Generati */}
              <div className="flex flex-col gap-4">
                <h3 className="font-mono text-sm font-bold text-cyan-300 border-b border-white/10 pb-2">
                  {isQuantumScenario ? ui.modalSectionQuantum : ui.modalSectionClassical}
                </h3>
                <div className={`grid grid-cols-1 ${isQuantumScenario ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
                  <div className="flex flex-col gap-2 min-h-[200px]">
                    <CodeBlockWithCopy
                      code={jsonCode || "{\n  \"status\": \"idle\"\n}"}
                      language="json"
                      title={ui.modalManifestTitle}
                    />
                  </div>
                  <div className="flex flex-col gap-2 min-h-[200px]">
                    <CodeBlockWithCopy
                      code={pythonCode || "# Python"}
                      language="python"
                      title={isQuantumScenario ? ui.modalPythonQuantumTitle : ui.modalPythonClassicalTitle}
                    />
                  </div>
                  {isQuantumScenario && (
                    <div className="flex flex-col gap-2 min-h-[200px]">
                      <CodeBlockWithCopy
                        code={qasmCode || "// OpenQASM 3.0"}
                        language="qasm"
                        title={ui.modalQasmTitle}
                      />
                    </div>
                  )}
                </div>

                {/* Trascrizione completa dell'intervista insieme ai codici */}
                {interviewText && (
                  <div className="rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-xl flex flex-col mt-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-900/90 border-b border-white/10 text-[11px] font-mono">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-cyan-300 font-semibold tracking-wide">
                          {interviewCopy.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
                          {interviewCopy.autoBadge}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyTranscript}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 border border-white/15 text-white text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          {copiedTranscript ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">{ui.copiedCodeBtn}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-300" />
                              <span>{ui.copyCodeBtn}</span>
                            </>
                          )}
                        </button>
                        {onDownloadInterview && (
                          <button
                            type="button"
                            onClick={onDownloadInterview}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-cyan-300" />
                            <span>{interviewCopy.downloadBtn}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <pre className="p-3.5 text-[11px] font-mono text-slate-200 overflow-auto max-h-[220px] leading-relaxed bg-slate-950/90 whitespace-pre-wrap break-words">
                      <code>{interviewText}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Grafici: Bloch, Istogramma & IBM Quantum Composer */}
              {isQuantumScenario ? (
                <div className="flex flex-col gap-6 border-t border-white/10 pt-8">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono text-sm font-bold text-amber-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        {ui.modalBlochTitle}
                      </h3>
                      <span className="text-[10px] font-mono bg-amber-950/70 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                        plot_bloch_multivector | Statevector 3D
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-4 bg-slate-900/60 border border-amber-500/20 rounded-xl shadow-inner w-full flex flex-col items-center">
                          <BlochSphere theta={thetaDeg} phi={phiDeg} targetAlgoritmo={targetAlgoritmo} />
                          <div className="mt-3 text-center font-mono text-[11px] text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-white/5 w-full">
                            <span>{ui.modalCoordsLabel} </span>
                            <span className="text-amber-400 font-bold">Theta = {thetaRad.toFixed(4)} rad ({thetaDeg.toFixed(1)}°)</span>
                            <span className="text-slate-400 mx-2">|</span>
                            <span className="text-cyan-400 font-bold">Phi = {phiRad.toFixed(4)} rad ({phiDeg.toFixed(1)}°)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <h4 className="font-mono text-xs font-bold text-slate-300">{ui.modalProbTitle}</h4>
                        <IstogrammaQuantisticoUniversale theta_radianti={thetaRad} settore={sector} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono text-sm font-bold text-cyan-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        {ui.modalComposerTitle}
                      </h3>
                      <button
                        onClick={() => window.open('https://quantum.ibm.com/composer', '_blank')}
                        className="flex items-center gap-1.5 text-[11px] font-mono bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 px-2.5 py-1 rounded border border-cyan-500/40 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{ui.modalOpenComposer}</span>
                      </button>
                    </div>

                    <div className="mt-1">
                      <IbmQuantumComposerMockup
                        targetAlgoritmo={targetAlgoritmo}
                        getActionDescription={() => ui.composerActionDesc}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-900/60 border border-emerald-500/20 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">{ui.modalHpcStatusLabel}</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {ui.modalHpcStatusVal}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">SciPy SLSQP · Markowitz</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-white/10 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">{ui.modalHpcTargetLabel}</span>
                      <span className="text-sm font-bold text-white font-mono mt-0.5 block">{ui.modalHpcTargetVal}</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{ui.modalHpcTargetSub}</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-white/10 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">{ui.modalHpcMathLabel}</span>
                      <span className="text-sm font-bold text-cyan-400 font-mono mt-0.5 block">NumPy / SciPy / ML</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{ui.modalHpcMathSub}</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-white/10 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">{ui.modalHpcNoiseLabel}</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">{ui.modalHpcNoiseVal}</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{ui.modalHpcNoiseSub}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                    <Server className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <h4 className="font-mono text-xs font-bold text-emerald-400">{ui.modalHpcSummaryTitle}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {ui.modalHpcSummaryBody}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Descrizione Semplice */}
              <div className="flex flex-col gap-2 p-4 bg-slate-900/60 border border-white/10 rounded-xl">
                <h4 className="font-mono text-xs font-bold text-cyan-400">{ui.modalOutcomeTitle}</h4>
                <div className="text-sm font-sans text-slate-300 leading-relaxed">
                  {isQuantumScenario ? (
                    <p>
                      {quantumOutcome.part1}
                      <strong className="text-amber-300">{quantumOutcome.bold1}</strong> /
                      <strong className="text-amber-300">{quantumOutcome.bold2}</strong>
                      {quantumOutcome.part2}
                      <strong className="text-cyan-300">{quantumOutcome.bold3}</strong>
                      {quantumOutcome.part3}
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2 list-disc list-inside text-xs text-slate-300 font-mono">
                      {ui.modalOutcomeClassicalItems.map((item, idx) => (
                        <li key={idx}>
                          <strong className="text-white">{item.bold}</strong> {item.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Domanda finale e Pulsante Condizionale */}
              {isQuantumScenario ? (
                <div className="flex flex-col items-center justify-center gap-6 mt-4 p-8 bg-slate-900/80 border border-amber-500/30 rounded-xl text-center">
                  <div className="flex flex-col gap-2 max-w-xl mx-auto">
                    <Cpu className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <h3 className="font-bold text-lg text-white font-mono">{ui.modalHwExecTitle}</h3>
                    <p className="text-sm text-slate-400">
                      {ui.modalHwExecDesc}
                    </p>
                  </div>

                  <button
                    onClick={onSendToIBM}
                    className="flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold font-mono rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
                  >
                    <Play className="w-5 h-5" />
                    <span>{ui.sendToIbmBtn}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 mt-4 p-6 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="flex flex-col gap-1 max-w-xl mx-auto">
                    <h3 className="font-bold text-base text-white font-mono">{ui.modalClassicalDoneTitle}</h3>
                    <p className="text-xs text-slate-300">
                      {ui.modalClassicalDoneDesc}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    {ui.modalCloseBtn}
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}