import EndInterviewModal from "./EndInterviewModal";
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Send, Terminal, Loader2, Sparkles, Cpu, RotateCcw, 
  CheckCircle2, Layers, Zap, Shield, Database, Activity, Compass, 
  HelpCircle, ChevronRight, Sliders, Upload, Copy, Check, Calendar, 
  FileText, FileCheck, Search, Download, Lock, AlertTriangle, Play
} from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import aiStudioPrompt from '../promptText.txt?raw';
import { getStoredApiKey } from '../services/apiKeyService';
import { getDemoCsvBySector } from "../engines/demoCsv";
import { generateQiskitCode, generateQiskitPythonCode, generateClassicalHpcPythonCode, parseCsv1Deterministic, parseCsv2MatrixDeterministic, classifyUploadedCsv, validaMatriceFile2, MAX_QUANTUM_QUBITS } from "../engines/codeGenerators";
import { getTaxonomicSector, purgeParasiticStrings, getScenarioEntanglementProfile } from "../engines/taxonomicEngine";
import { 
  CurrentUserSession, 
  isAgentAiCategoryAllowedForUser, 
  getCurrentSession,
  logUserAccess
} from "../services/authService";
import { LanguageCode } from '../types';
import { useTranslation } from '../lib/TranslationContext';
import { getAgentUi, getLocalizedSectorName } from '../lib/agentAiTranslations';
import { getLocalizedTestScenario } from '../lib/scenarioTranslations';

export interface SectorScenario {
  id: string;
  name: string;
  type: 'quantum' | 'classical';
  modelCode: string;
  focus: string;
  description: string;
}

export interface ContenitoreQuantistico {
  settore: string;
  scenario: string;
  strategia: string;
  entanglement: 'cx' | 'cp' | 'none';
  theta_radianti: number;
  thetas_radianti?: number[];
  phi_radianti: number;
  predisposizione_grafico?: boolean;
}

/**
 * Parsa il JSON universale e renderizza la UI in modo coerente e data-driven al 100%.
 * Include una valvola di sicurezza Regex per estrarre la verità direttamente dal circuito.
 */

export function renderizzaInterfacciaUniversaleBlindata(jsonDaGemini: string, codicePythonDaGemini: string, language: LanguageCode = 'it'): string {
  const ui = getAgentUi(language);
  try {
    const dati: ContenitoreQuantistico = JSON.parse(jsonDaGemini);

    let rad: number | null = null;

    const matchRy = codicePythonDaGemini.match(/qc\.ry\(([\d.]+),\s*q\[0\]\)/);
    if (matchRy) {
      rad = parseFloat(matchRy[1]);
    }

    if (rad === null) {
      const matchPesi = codicePythonDaGemini.match(/PESI_RISOLTI\s*=\s*\[\s*\{[^}]*"peso":\s*([\d.]+)/);
      if (matchPesi) {
        const peso = parseFloat(matchPesi[1]);
        rad = 2.0 * Math.asin(Math.sqrt(Math.max(0.0, Math.min(1.0, peso))));
      }
    }

    if (rad === null) {
      const matchAnyPeso = codicePythonDaGemini.match(/"peso":\s*([\d.]+)/);
      if (matchAnyPeso) {
        const peso = parseFloat(matchAnyPeso[1]);
        rad = 2.0 * Math.asin(Math.sqrt(Math.max(0.0, Math.min(1.0, peso))));
      }
    }

    if (rad === null) {
      const matchThetas = codicePythonDaGemini.match(/thetas\s*=\s*\[([\d.]+)/);
      if (matchThetas) {
        rad = parseFloat(matchThetas[1]);
      }
    }

    const radSafe: number = (rad !== null && !isNaN(rad))
      ? rad
      : (dati.theta_radianti ?? 0);

    const thetaGradi = Math.round((radSafe * 180) / Math.PI);
    const ampiezza0 = Math.round(Math.pow(Math.cos(radSafe / 2), 2) * 100);
    const ampiezza1 = Math.round(Math.pow(Math.sin(radSafe / 2), 2) * 100);

    const tax = getTaxonomicSector(dati.settore, '', language);
    const sLower = (dati.settore || '').toLowerCase();
    const stratLower = (dati.strategia || '').toLowerCase();
    const isPrudente = stratLower.includes('prudent') || stratLower.includes('conservat') || stratLower.includes('vorsicht') || stratLower.includes('rischio') || stratLower.includes('穩健') || stratLower.includes('稳健') || stratLower.includes('慎重') || stratLower.includes('tutela') || stratLower.includes('protection') || stratLower.includes('schütz') || stratLower.includes('stabilité');

    const fisicaEntanglement = dati.entanglement === 'cx'
      ? ui.entCxDesc
      : dati.entanglement === 'cp'
      ? ui.entCpDesc
      : ui.entNoneDesc;

    let macroDescrizione = ui.defaultMacroDesc;
    if (ui.sectorMacroDescs[tax.id]) {
      macroDescrizione = ui.sectorMacroDescs[tax.id];
    } else {
      for (const [k, v] of Object.entries(ui.sectorMacroDescs)) {
        if (sLower.includes(k)) {
          macroDescrizione = v;
          break;
        }
      }
    }

    const localizedSector = getLocalizedSectorName(dati.settore, language);

    const outputBase = `${ui.reportTitle}
${ui.reportScope(localizedSector, dati.scenario, dati.strategia)}

${ui.reportSec1Title}
${ui.reportSec1State(radSafe.toFixed(4), thetaGradi, isPrudente, ampiezza1, ampiezza0)}
${ui.reportSec1Topo(fisicaEntanglement)}
${ui.reportSec1Synth(macroDescrizione)}

${ui.reportSec2Title}
${ui.reportSec2Frontier}
${ui.reportSec2Action}

${ui.reportFooterNote}`;

    return outputBase;

  } catch (error) {
    console.error("Errore critico pipeline quantistica:", error);
    return ui.defaultMacroDesc;
  }
}

// Funzione per scaricare qualsiasi file CSV lato client
export const triggerCsvDownload = (filename: string, content: string) => {
  try {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Errore durante il download del file CSV:', err);
  }
};

/**
 * Validazione preventiva del file caricato (Regola Feedback Visivo e Anti-Malformazione).
 * Controlla:
 * 1. Almeno 1 riga non-commento.
 * 2. Almeno 2 righe dati oltre l'intestazione.
 * 3. Almeno 2 colonne.
 * 4. Una colonna con nome riconoscibile (id_risorsa, id, asset, o parole chiave del peso).
 */
export function validaFileCaricato(contenuto: string, nomeFile: string, language: LanguageCode = 'it'): { valido: boolean; messaggio?: string; righe?: number; colonne?: number } {
  const ui = getAgentUi(language);
  const cleanContent = (contenuto || '').replace(/^\uFEFF/, '');
  if (!cleanContent.trim()) {
    return { valido: false, messaggio: ui.csvErrEmpty(nomeFile) };
  }

  // 1. Righe non-commento
  const lines = cleanContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  if (lines.length < 1) {
    return { valido: false, messaggio: ui.csvErrNoValidRows(nomeFile) };
  }

  // 2. Almeno 2 righe dati oltre l'intestazione
  if (lines.length < 3) {
    return { valido: false, messaggio: ui.csvErrFewRows(nomeFile, Math.max(0, lines.length - 1)) };
  }

  // 3. Rilevamento delimitatore e verifica colonne (almeno 2 colonne)
  const headerLine = lines[0];
  const delim = headerLine.includes(';') ? ';' : (headerLine.includes('\t') ? '\t' : ',');
  const headerCols = headerLine.split(delim).map(c => c.trim().toLowerCase().replace(/^['"]|['"]$/g, ''));

  if (headerCols.length < 2) {
    return { valido: false, messaggio: ui.csvErrFewCols(nomeFile, headerCols.length) };
  }

  // 4. Verifica rigorosa con lo stesso parser deterministico usato nella compilazione quantistica/classica
  try {
    const { risorse } = parseCsv1Deterministic(cleanContent);
    if (risorse.length < 2) {
      return { valido: false, messaggio: ui.csvErrFewRows(nomeFile, risorse.length) };
    }
    return {
      valido: true,
      messaggio: ui.csvValidSummary(risorse.length, headerCols.length),
      righe: risorse.length,
      colonne: headerCols.length
    };
  } catch (err: any) {
    return {
      valido: false,
      messaggio: err?.message || ui.csvErrBadHeaders(nomeFile, 'id_risorsa, id, asset', 'priorita_peso, peso, weight, score')
    };
  }
}

// Componente CodeBlock con pulsante per copiare il codice con 1 clic
export function CodeBlockWithCopy({ code, language, title }: { code: string; language: string; title: string }) {
  const { language: appLanguage } = useTranslation();
  const ui = getAgentUi(appLanguage);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-white/20 bg-slate-950 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-white/10 text-[11px] font-mono shrink-0">
        <span className="text-cyan-300 font-semibold tracking-wide flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          {title}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 border border-white/15 text-white text-[11px] font-semibold transition-all cursor-pointer"
        >
          {copied ? (
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
      </div>
      <pre className="p-3.5 text-[11px] font-mono text-slate-200 overflow-auto leading-relaxed flex-1 bg-slate-950/90 border-t border-white/5">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Componente pulsante per CSV (Download o Copia)
function CsvButton({ filename, content, label }: { filename: string; content: string; label: string }) {
  const { language } = useTranslation();
  const ui = getAgentUi(language);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="flex items-stretch shadow-sm">
       <button
         onClick={() => triggerCsvDownload(filename, content)}
         className="px-2.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-l text-[11px] font-mono text-cyan-200 flex items-center gap-1.5 transition-all"
       >
         <Download className="w-3.5 h-3.5 text-cyan-400" /> {label}
       </button>
       <button
         type="button"
         onClick={handleCopy}
         className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 border-l-0 rounded-r text-[11px] font-mono text-slate-300 flex items-center transition-all cursor-pointer"
         title={ui.copyClipboardTooltip}
       >
         {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
       </button>
    </div>
  );
}

const SECTOR_DATA: Record<string, { icon: string; scenarios: SectorScenario[] }> = {
  "Finanza e Mercati": {
    icon: "💼",
    scenarios: [
      { id: "fin-q-1", name: "Hedging Multilivello Cross-Asset (Ottimizzazione Combinatoria)", type: "quantum", modelCode: "Qiskit_QUBO", focus: "Ottimizzazione", description: "Ottimizzazione combinatoria su derivati e copertura swap cross-asset" },
      { id: "fin-q-2", name: "Ottimizzazione Portafoglio con Vincoli di Cardinalità (QUBO)", type: "quantum", modelCode: "Qiskit_QUBO", focus: "Ottimizzazione", description: "Risoluzione combinatoria per ribilanciamento pesi ed esclusione titoli" },
      { id: "fin-q-3", name: "Allocazione Capitali per Requisiti Solvibilità (Basel IV)", type: "quantum", modelCode: "Qiskit_QAE", focus: "Stima Rischio", description: "Calcolo deterministico requisiti di capitale e buffer di riserva" },
      { id: "fin-q-4", name: "Arbitraggio di Volatilità su Opzioni Index-Linked", type: "quantum", modelCode: "Qiskit_AngleOpt", focus: "Arbitraggio", description: "Mappatura su piano angolare dei delta di volatilità implicita" },
      { id: "fin-q-5", name: "Ottimizzazione Portafoglio Socialmente Responsabile (ESG)", type: "quantum", modelCode: "Qiskit_QAOA", focus: "Sostenibilità", description: "Vincoli multipli di sostenibilità e massimizzazione Sharpe ratio" },
      { id: "fin-q-6", name: "Market Timing Esatto per Liquidazione Asset", type: "quantum", modelCode: "Qiskit_AngleOpt", focus: "Market Timing", description: "Individuazione del momento ottimale di disinvestimento a minimo slippage" },
      { id: "fin-q-7", name: "Selezione Paniere Sintetico per Tracking ETF", type: "quantum", modelCode: "Qiskit_QUBO", focus: "Asset Tracking", description: "Selezione combinatoria di sottoinsiemi di titoli per replicare l'indice" },
      { id: "fin-q-8", name: "Hedging Rischio Valutario su Contratti Fornitori", type: "quantum", modelCode: "Qiskit_QAE", focus: "Forex Hedging", description: "Stima rapida dell'esposizione forex multi-valuta su forniture estere" },
      { id: "fin-q-9", name: "Ribilanciamento Dinamico Fondo a Rischio Target", type: "quantum", modelCode: "Qiskit_QAOA", focus: "Portfolio Rebalancing", description: "Adeguamento continuo pesi di portafoglio a volatilità controllata" },
      { id: "fin-q-10", name: "Arbitraggio Triangolare su Coppie di Valute FX", type: "quantum", modelCode: "Qiskit_AngleOpt", focus: "Forex Arbitrage", description: "Mappatura istantanea delle discrepanze di prezzo cross-currency" },
      { id: "fin-q-11", name: "Valutazione del Rischio Sistemico Interbancario", type: "quantum", modelCode: "Qiskit_QUBO", focus: "Rischio Sistemico", description: "Analisi dell'effetto contagio e stabilità dei nodi bancari interconnessi" },
      { id: "fin-q-12", name: "Stress Testing Macroeconomico Monte Carlo Accelerato", type: "quantum", modelCode: "Qiskit_QAE", focus: "Monte Carlo", description: "Simulazioni accelerate di scenari macroeconomici avversi" },
      { id: "fin-q-13", name: "Pricing di Derivati Esotici Multi-Sottostante", type: "quantum", modelCode: "Qiskit_QAE", focus: "Pricing Derivati", description: "Valutazione rapida del fair value di contratti strutturati complessi" },
      { id: "fin-q-14", name: "Stima del Value at Risk (VaR) e Conditional VaR", type: "quantum", modelCode: "Qiskit_QAE", focus: "Value at Risk", description: "Campionamento stocastico per code di probabilità estreme" },
      { id: "fin-q-15", name: "Rilevamento Anomalie e Riciclaggio (AML)", type: "quantum", modelCode: "Qiskit_QML", focus: "Machine Learning", description: "Classificazione avanzata per pattern di transazioni anomale" },
      { id: "fin-q-16", name: "Valutazione Rischio di Controparte (CVA)", type: "quantum", modelCode: "Qiskit_QAE", focus: "Credit Risk", description: "Calcolo Credit Valuation Adjustment su portafogli bilaterali" },
      { id: "fin-q-17", name: "Clustering di Titoli Obbligazionari", type: "quantum", modelCode: "Qiskit_QML", focus: "Machine Learning", description: "Raggruppamento per rendimento e duration tramite kernel avanzati" },
      { id: "fin-q-18", name: "Scoring Creditizio Aziendale Non Lineare", type: "quantum", modelCode: "Qiskit_QML", focus: "Machine Learning", description: "Valutazione del merito creditizio con classificatore multidimensionale" },
      { id: "fin-q-19", name: "Calcolo Probabilità di Default su Mutui Subprime", type: "quantum", modelCode: "Qiskit_QAE", focus: "Credit Risk", description: "Stima probabilistica delle code di insolvenza su cartolarizzazioni" },
      { id: "fin-c-1", name: "Algoritmo di Trading ad Alta Frequenza (HFT) e Order Book Matching", type: "classical", modelCode: "Python_HPC_HFT", focus: "Calcolo ad Alta Velocità", description: "Matching a bassissima latenza con thread paralleli ad alta efficienza" },
      { id: "fin-c-2", name: "Analisi del Sentiment Finanziario da Notizie e Social (LLM)", type: "classical", modelCode: "Python_HPC_LLM", focus: "NLP", description: "Estrazione indicatori di mercato da fonti informative globali" },
      { id: "fin-c-3", name: "Backtesting Storico Parallelo su Dati Tick-by-Tick", type: "classical", modelCode: "Python_HPC_Backtest", focus: "Simulazione Parallela", description: "Simulazione parallela di strategie di trading su serie storiche ad alta frequenza" },
      { id: "fin-c-4", name: "Previsione Serie Storiche Prezzi con Reti Neurali LSTM/Transformer", type: "classical", modelCode: "Python_HPC_LSTM", focus: "Deep Learning", description: "Modello predittivo temporale su dati tick-by-tick ad alta risoluzione" },
      { id: "fin-c-5", name: "Riconoscimento Pattern Tecnici su Grafici Candlestick (CNN)", type: "classical", modelCode: "Python_HPC_CNN", focus: "Computer Vision", description: "Riconoscimento automatico formazioni grafiche candlestick su grafici" },
      { id: "fin-c-6", name: "Calcolo Black-Scholes Analitico per Grandi Volumi di Contratti", type: "classical", modelCode: "Python_HPC_AVX", focus: "Calcolo Stocastico", description: "Elaborazione analitica simultanea di milioni di opzioni vanilla" },
      { id: "fin-c-7", name: "Scoring di Affidabilità Creditizia su Dati Transazionali (XGBoost)", type: "classical", modelCode: "Python_HPC_XGBoost", focus: "Machine Learning", description: "Valutazione del merito creditizio su dati transazionali tramite gradient boosting" }
    ]
  },
  "Logistica e Supply Chain": {
    icon: "🚚",
    scenarios: [
      { id: "log-q-1", name: "Vehicle Routing Problem con Finestre Temporali (VRPTW)", type: "quantum", modelCode: "Qiskit_VRPTW", focus: "Ottimizzazione", description: "Ottimizzazione percorsi furgoni e consegne programmate con scadenze" },
      { id: "log-q-2", name: "Ottimizzazione del Carico Container 3D (Bin Packing)", type: "quantum", modelCode: "Qiskit_BinPacking", focus: "Ottimizzazione 3D", description: "Mappatura geometrica del volume e distribuzione del baricentro" },
      { id: "log-q-3", name: "Schedulazione Turni Equipaggi Portuali/Aeroportuali", type: "quantum", modelCode: "Qiskit_QAOA", focus: "Turnistica", description: "Assegnazione turni con vincoli stringenti di orario e riposo" },
      { id: "log-q-4", name: "Pianificazione Flotta Droni per Consegne Ultimo Miglio", type: "quantum", modelCode: "Qiskit_DroneRouting", focus: "Routing Flotte", description: "Gestione nodi aerei con vincoli di autonomia energetica e meteo" },
      { id: "log-q-5", name: "Instradamento Multi-Modale (Nave, Treno, Camion)", type: "quantum", modelCode: "Qiskit_Multimodal", focus: "Intermodalità", description: "Sincronizzazione orari e nodi logistici intermodali terra-mare-ferro" },
      { id: "log-q-6", name: "Allocazione Gate Aeroportuali per Voli Internazionali", type: "quantum", modelCode: "Qiskit_GateAllocation", focus: "Pianificazione Gate", description: "Ottimizzazione piazzali e finger per minimizzare ritardi e coincidenze passeggeri" },
      { id: "log-q-7", name: "Ottimizzazione delle Scorte di Sicurezza Multi-Echelon", type: "quantum", modelCode: "Qiskit_QAE", focus: "Gestione Scorte", description: "Minimizzazione rischio stockout attraverso la supply chain a livelli" },
      { id: "log-q-8", name: "Valutazione Rischio di Interruzione della Catena di Fornitura", type: "quantum", modelCode: "Qiskit_SupplyRisk", focus: "Supply Risk", description: "Modellazione della resilienza contro blocchi doganali e geopolitici" },
      { id: "log-q-9", name: "Analisi Vulnerabilità della Rete di Distribuzione (Graph Theory)", type: "quantum", modelCode: "Qiskit_GraphTheory", focus: "Analisi Grafi", description: "Identificazione colli di bottiglia e nodi critici a rischio isolamento" },
      { id: "log-q-10", name: "Magazzino: Orchestrazione Flussi Stoccaggio e Cross-Docking (QAOA)", type: "quantum", modelCode: "Qiskit_QAOA", focus: "Cross-Docking", description: "Sincronizzazione banchine di scarico/carico senza stazionamento a terra" },
      { id: "log-q-11", name: "Commerciale: Previsione Domanda Prodotti Freschi (QML Anti-Spreco)", type: "quantum", modelCode: "Qiskit_QML", focus: "Quantum ML", description: "Previsione non lineare della deperibilità per azzerare lo scarto alimentare" },
      { id: "log-q-12", name: "Pricing Dinamico e Markdown Ottimale per Prodotti a Scadenza", type: "quantum", modelCode: "Qiskit_QAE", focus: "Pricing Dinamico", description: "Curve di sconto temporali per massimizzare il recupero del margine residuo" },
      { id: "log-q-13", name: "Spazio: Ottimizzazione Layout Scaffale e Allocazione Merci (Knapsack)", type: "quantum", modelCode: "Qiskit_Knapsack", focus: "Knapsack Spaziale", description: "Allocazione planogramma con vincoli di facciate visive, capienza e rotazione" },
      { id: "log-q-14", name: "Marketing & CRM: Iper-Personalizzazione e Clustering Promozioni (Q-Means)", type: "quantum", modelCode: "Qiskit_QML", focus: "Clustering CRM", description: "Segmentazione quantistica dei panieri di spesa e offerte mirate in tempo reale" },
      { id: "log-c-1", name: "Previsione della Domanda di Vendita con Gradient Boosting (XGBoost)", type: "classical", modelCode: "Python_HPC_XGBoost", focus: "Machine Learning", description: "Stima dei volumi di riordino per magazzini regionali" },
      { id: "log-c-2", name: "Tracciamento Visivo Automatico Colli con Telecamere OCR (YOLO)", type: "classical", modelCode: "Python_HPC_YOLO", focus: "Computer Vision", description: "Riconoscimento e instradamento pacchi su nastro trasportatore" },
      { id: "log-c-3", name: "Monitoraggio Flotta GPS e Geofencing in Tempo Reale (GIS)", type: "classical", modelCode: "Python_HPC_GIS", focus: "Geolocalizzazione GIS", description: "Tracciamento coordinate e calcolo ETA dinamico con traffico" },
      { id: "log-c-4", name: "Simulazione Discreta di Magazzino (Digital Twin) (DES)", type: "classical", modelCode: "Python_HPC_DES", focus: "Simulazione", description: "Stress testing layout logistico contro picchi stagionali" }
    ]
  },
  "Energia e Utilities": {
    icon: "⚡",
    scenarios: [
      { id: "ene-q-1", name: "Unit Commitment e Dispacciamento Ottimale Rete Elettrica (OPF)", type: "quantum", modelCode: "Qiskit_OPF", focus: "Dispacciamento", description: "Bilanciamento carichi istantanei su centrali di generazione" },
      { id: "ene-q-2", name: "Pianificazione Posizionamento Turbine Eoliche Offshore", type: "quantum", modelCode: "Qiskit_WindOpt", focus: "Fluidodinamica", description: "Minimizzazione effetto scia e massimizzazione resa di campo" },
      { id: "ene-q-3", name: "Schedulazione Ricarica Intelligente Flotte Veicoli Elettrici (V2G)", type: "quantum", modelCode: "Qiskit_V2G", focus: "Smart Charging", description: "Sincronizzazione ricarica con surplus solare ed eolico in rete" },
      { id: "ene-q-4", name: "Ottimizzazione Idraulica Pompe-Turbine per Bacini Idroelettrici", type: "quantum", modelCode: "Qiskit_HydroPump", focus: "Idroelettrico", description: "Calibrazione oraria dei cicli di pompaggio per massimizzare il profitto energetico" },
      { id: "ene-q-5", name: "Configurazione Topologica Microgrid in Caso di Blackout", type: "quantum", modelCode: "Qiskit_Microgrid", focus: "Resilienza Rete", description: "Riconfigurazione commutatori per isolare sezioni guaste e mantenere utenze critiche" },
      { id: "ene-q-6", name: "Analisi Stabilità Transitoria della Rete con Energia Rinnovabile", type: "quantum", modelCode: "Qiskit_GridStability", focus: "Stabilità Rete", description: "Monitoraggio inerzia di rete con elevata penetrazione di inverter solari ed eolici" },
      { id: "ene-q-7", name: "Simulazione Invecchiamento Celle Batteria al Litio", type: "quantum", modelCode: "Qiskit_BatteryAging", focus: "Simulazione Chimica", description: "Modellazione microscopica dei dendriti di litio per prolungare la vita utile" },
      { id: "ene-c-1", name: "Previsione Irraggiamento Solare e Produzione Fotovoltaica (LSTM)", type: "classical", modelCode: "Python_HPC_LSTM", focus: "Deep Learning", description: "Analisi meteo oraria per previsione immissione in rete" },
      { id: "ene-c-2", name: "Manutenzione Predittiva Turbine a Gas tramite Sensori di Vibrazione", type: "classical", modelCode: "Python_HPC_Vibration", focus: "Sensoristica", description: "Analisi FFT e individuazione anomalie sui cuscinetti del rotore" },
      { id: "ene-c-3", name: "Dispacciamento Energetico e Ottimizzazione della Rete Elettrica (OPF)", type: "classical", modelCode: "Python_HPC_GridOPF", focus: "Gestione Rete", description: "Gestione dei flussi di potenza e massimizzazione della longevità della rete elettrica" },
      { id: "ene-c-4", name: "Ottimizzazione Termica degli Edifici (HVAC) con Reinforcement Learning", type: "classical", modelCode: "Python_HPC_RL", focus: "Reinforcement Learning", description: "Regolazione pompe di calore per minimizzazione consumi kWh e comfort" },
      { id: "ene-c-5", name: "Manutenzione Stradale Ottimizzata tramite Dati Accelerometro Bus", type: "classical", modelCode: "Python_HPC_RoadMaint", focus: "Machine Learning", description: "Mappatura automatica buche e dissesti stradali da telemetria veicolare" }
    ]
  },
  "Chimica, Farmaceutica e Materiali": {
    icon: "🧪",
    scenarios: [
      { id: "chem-q-1", name: "Calcolo Stato Fondamentale di Molecole Complesse (VQE)", type: "quantum", modelCode: "Qiskit_VQE", focus: "Chimica Computazionale", description: "Diagonalizzazione hamiltoniana molecolare con ansatz variazionale" },
      { id: "chem-q-2", name: "Simulazione Catalizzatori per Fissazione Azoto (Sintesi Ammoniaca)", type: "quantum", modelCode: "Qiskit_CatalystSim", focus: "Catalisi", description: "Modellazione molecolare centri Fe-Mo a basso consumo energetico" },
      { id: "chem-q-3", name: "Screening Molecolare per Inibitori Enzimatici (Drug Discovery)", type: "quantum", modelCode: "Qiskit_DrugScreen", focus: "Drug Discovery", description: "Valutazione docking conformazionale ad alta affinità di legame" },
      { id: "chem-q-4", name: "Progettazione Polimeri ad Alta Conducibilità per Celle a Combustibile", type: "quantum", modelCode: "Qiskit_PolymerFuel", focus: "Scienza Materiali", description: "Simulazione del trasporto protonico in membrane a scambio ionico" },
      { id: "chem-q-5", name: "Modellazione Materiali Superconduttori ad Alta Temperatura", type: "quantum", modelCode: "Qiskit_Superconduct", focus: "Fisica dello Stato Solido", description: "Risoluzione modello di Hubbard bidimensionale per correlazioni elettroniche forti" },
      { id: "chem-q-6", name: "Ottimizzazione del Folding di Catene Peptidiche", type: "quantum", modelCode: "Qiskit_PeptideFolding", focus: "Biochimica", description: "Ricerca conformazione tridimensionale a minima energia libera" },
      { id: "chem-q-7", name: "Scoperta di Catalizzatori per la Cattura della CO2 (MOF Materials)", type: "quantum", modelCode: "Qiskit_CO2Capture", focus: "Cattura Carbonio", description: "Selezione strutture metallo-organiche porose ad alto assorbimento selettivo" },
      { id: "chem-q-8", name: "Sviluppo di Elettrolizzatori ad Alta Efficienza per Idrogeno Verde", type: "quantum", modelCode: "Qiskit_HydrogenElectr", focus: "Idrogeno Verde", description: "Simulazione reazione di evoluzione dell'ossigeno (OER) su elettrodi avanzati" },
      { id: "chem-c-1", name: "Predizione Struttura Terziaria Proteine con AlphaFold / ESMFold", type: "classical", modelCode: "Python_HPC_AlphaFold", focus: "Deep Learning", description: "Calcolo tridimensionale da sequenza aminoacidica con modelli profondi" },
      { id: "chem-c-2", name: "Dinamica Molecolare su Traiettorie Atomiche", type: "classical", modelCode: "Python_HPC_CUDA", focus: "Dinamica Molecolare", description: "Simulazione traiettorie atomiche su finestre temporali di microsecondi" },
      { id: "chem-c-3", name: "Generazione di Nuove Molecole con Modelli Diffusivi / VAE", type: "classical", modelCode: "Python_HPC_MolGen", focus: "AI Generativa", description: "Sintesi de novo di composti chimici con proprietà farmacologiche target" },
      { id: "chem-c-4", name: "Tossicologia Predittiva e ADMET in Silico (GNN)", type: "classical", modelCode: "Python_HPC_GNN", focus: "Graph Neural Net", description: "Valutazione assorbimento, distribuzione, metabolismo ed escrezione di composti" },
      { id: "chem-c-5", name: "Massimizzazione dell'Efficienza dei Biocarburanti dalle Alghe", type: "classical", modelCode: "Python_HPC_Biofuels", focus: "Machine Learning", description: "Ottimizzazione fotobioreattori e accumulo lipidico tramite modelli predittivi" },
      { id: "chem-c-6", name: "Formulazione di Vernici Ecologiche Senza Composti Organici Volatili", type: "classical", modelCode: "Python_HPC_EcoPaint", focus: "Machine Learning", description: "Predizione viscosità e adesione di resine a base acquosa a basso impatto" },
      { id: "chem-c-7", name: "Ottimizzazione della Combustione dell'Idrogeno nelle Turbine Industriali (CFD)", type: "classical", modelCode: "Python_HPC_CFD", focus: "Fluidodinamica (CFD)", description: "Simulazione fluidodinamica per prevenire flashback e controllare emissioni NOx" }
    ]
  },
  "Produzione e Manifattura": {
    icon: "⚙️",
    scenarios: [
      { id: "man-q-1", name: "Job-Shop Scheduling Problem su Macchine CNC Multitasking", type: "quantum", modelCode: "Qiskit_JobShop", focus: "Schedulazione", description: "Sequenziamento lavorazioni per minimizzare il makespan complessivo" },
      { id: "man-q-2", name: "Ottimizzazione del Taglio Lamiere e Vetro (Cutting Stock Problem)", type: "quantum", modelCode: "Qiskit_CuttingStock", focus: "Ottimizzazione Taglio", description: "Riduzione scarti lineari e 2D su lotti di produzione pesante" },
      { id: "man-q-3", name: "Bilanciamento Linea di Assemblaggio con Vincoli Ergonomici", type: "quantum", modelCode: "Qiskit_Assembly", focus: "Bilanciamento Linea", description: "Distribuzione carichi operatore e tempi ciclo stazioni" },
      { id: "man-q-4", name: "Pianificazione Manutenzione Impianti Industriali ad Alta Complessità", type: "quantum", modelCode: "Qiskit_MaintOpt", focus: "Manutenzione", description: "Sincronizzazione fermo macchine per ridurre impatto sui deliverable" },
      { id: "man-q-5", name: "Configurazione Flessibile Isole Robotizzate di Saldatura", type: "quantum", modelCode: "Qiskit_RobotWeld", focus: "Robotica", description: "Assegnazione percorsi utensile e sequenze di giunzione su scocche metalliche" },
      { id: "man-c-1", name: "Controllo Qualità Automatico con Telecamere e Reti Convoluzionali (CNN)", type: "classical", modelCode: "Python_HPC_CNN", focus: "Computer Vision", description: "Scansione ad alta velocità di difetti superficiali e crepe microscopiche" },
      { id: "man-c-2", name: "Manutenzione Predittiva su Cuscinetti con Analisi Spettrale FFT", type: "classical", modelCode: "Python_HPC_FFT", focus: "Signal Processing", description: "Prevenzione grippaggi e usura su mandrini di fresatura" },
      { id: "man-c-3", name: "Ottimizzazione Parametri di Stampaggio Iniezione Plastica", type: "classical", modelCode: "Python_HPC_Injection", focus: "Machine Learning", description: "Regolazione pressione, temperatura e tempo di raffreddamento" },
      { id: "man-c-4", name: "Riconoscimento Anomalie Acustiche su Presse Industriali (CNN Audio)", type: "classical", modelCode: "Python_HPC_Acoustic", focus: "Audio Analysis", description: "Identificazione disallineamenti meccanici dal rumore operativo della pressa" }
    ]
  },
  "Sicurezza, Telecomunicazioni e Reti": {
    icon: "🛡️",
    scenarios: [
      { id: "sec-q-1", name: "Distribuzione Chiavi di Sicurezza (QKD) e Monitoraggio Intercettazioni", type: "quantum", modelCode: "Qiskit_QKD", focus: "Crittografia Quantistica", description: "Protocollo di sicurezza avanzata con verifica polarizzazione fotonica" },
      { id: "sec-q-2", name: "Ottimizzazione Instradamento Traffico Rete 5G/6G Core", type: "quantum", modelCode: "Qiskit_Network5G", focus: "Routing di Rete", description: "Instradamento dinamico pacchetti a minima latenza e jitter" },
      { id: "sec-q-3", name: "Pianificazione Frequenze e Celle per Stazioni Radio Base (Antenne)", type: "quantum", modelCode: "Qiskit_FreqPlan", focus: "Telecomunicazioni", description: "Assegnazione bande senza sovrapposizione e interferenze co-canale" },
      { id: "sec-q-4", name: "Rilevamento Attacchi DDoS Tramite Correlazione di Traffico", type: "quantum", modelCode: "Qiskit_DDoSQCorr", focus: "Cybersecurity", description: "Riconoscimento anomalie distribuite prima del collasso di banda" },
      { id: "sec-q-5", name: "Allocazione Risorse di Rete per Network Slicing", type: "quantum", modelCode: "Qiskit_NetworkSlicing", focus: "Network Slicing", description: "Ripartizione garantita di banda e latenza per servizi mission-critical 5G/6G" },
      { id: "sec-c-1", name: "Rilevamento Malware Tramite Analisi del Bytecode ed Euristica", type: "classical", modelCode: "Python_HPC_Malware", focus: "Cybersecurity", description: "Isolamento binari sospetti e sandboxing dinamico automatizzato" },
      { id: "sec-c-2", name: "Analisi Log Firewall per Prevenzione Intrusioni (SIEM)", type: "classical", modelCode: "Python_HPC_SIEM", focus: "Analisi Log & Eventi", description: "Aggregazione flussi syslog paralleli e correlazione eventi di sicurezza" },
      { id: "sec-c-3", name: "Crittografia Post-Quantum (PQC: Kyber, Dilithium)", type: "classical", modelCode: "Python_HPC_PQC", focus: "Crittografia PQC", description: "Implementazione algoritmi lattice-based resistenti alle future minacce" },
      { id: "sec-c-4", name: "Riconoscimento Facciale e Biometrico per Controllo Accessi", type: "classical", modelCode: "Python_HPC_Biometric", focus: "Computer Vision", description: "Verifica dell'identità in tempo reale con estrazione feature biometriche" },
      { id: "sec-c-5", name: "Rilevamento di Attacchi Ransomware e Propagazione Laterale in Rete", type: "classical", modelCode: "Python_HPC_Ransomware", focus: "Cybersecurity", description: "Monitoraggio attività di crittografia file anomala e blocco rapido host" },
      { id: "sec-c-6", name: "Smascheramento di Attacchi DDoS Coordinati da Botnet Globali", type: "classical", modelCode: "Python_HPC_Botnet", focus: "Network Security", description: "Filtraggio traffico sintetico malevolo mediante analisi spettrale dei flussi" }
    ]
  },
  "Sanità e Genomica": {
    icon: "🧬",
    scenarios: [
      { id: "san-q-1", name: "Screening Virtuale di Farmaci su Miliardi di Molecole (Grover Search)", type: "quantum", modelCode: "Qiskit_Grover", focus: "Drug Discovery", description: "Ricerca mirata su database molecolari per amplificare legami ad alta affinità" },
      { id: "san-q-2", name: "Ottimizzazione dei Piani di Radioterapia Oncologica Lineare (IGRT)", type: "quantum", modelCode: "Qiskit_IGRT", focus: "Radioterapia", description: "Conformazione fascio ionizzante a tutela dei tessuti sani adiacenti" },
      { id: "san-q-3", name: "Previsione delle Anomalie nel Ripiegamento Proteico (Protein Folding)", type: "quantum", modelCode: "Qiskit_ProteinFold", focus: "Bioinformatica", description: "Identificazione stati intermedi correlati a patologie complesse" },
      { id: "san-q-4", name: "Diagnostica Precoce del Cancro da Dati di Sequenziamento DNA (GWAS)", type: "quantum", modelCode: "Qiskit_GWAS", focus: "Genomica", description: "Correlazione mutazioni poligeniche su dataset genomici complessi" },
      { id: "san-q-5", name: "Ottimizzazione dei Turni delle Sale Operatorie Ospedaliere", type: "quantum", modelCode: "Qiskit_ORSchedule", focus: "Turnistica Sanitaria", description: "Allocazione spazi operatori con urgenze e disponibilità anestesisti" },
      { id: "san-q-6", name: "Analisi Farmacogenomica per Terapie Personalizzate Cardiovascolari", type: "quantum", modelCode: "Qiskit_PharmacoGen", focus: "Farmacogenomica", description: "Personalizzazione del dosaggio farmacologico in base al profilo genetico" },
      { id: "san-q-7", name: "Monitoraggio e Previsione della Diffusione Epidemica (Modelli SIR)", type: "quantum", modelCode: "Qiskit_QAE", focus: "Epidemiologia", description: "Modellazione stocastica avanzata della trasmissione virale su popolazioni" },
      { id: "san-q-8", name: "Elaborazione Ultrarapida di Immagini da Risonanza Magnetica (RMN)", type: "quantum", modelCode: "Qiskit_QMRI", focus: "Imaging Medico", description: "Ricostruzione compressa dell'immagine per dimezzare i tempi di scansione" },
      { id: "san-q-9", name: "Ottimizzazione delle Catene di Distribuzione dei Vaccini a Breve Scadenza", type: "quantum", modelCode: "Qiskit_VaccineColdChain", focus: "Catena del Freddo", description: "Gestione catena del freddo estremo (-80°C) e scadenze critiche" },
      { id: "san-q-10", name: "Identificazione di Biomarcatori Rari per Malattie Neurodegenerative", type: "quantum", modelCode: "Qiskit_BioMarkers", focus: "Biomarcatori", description: "Screening di mutazioni rare e proteine malformate in campioni biologici" },
      { id: "san-q-11", name: "Ottimizzazione dei Piani di Trattamento del Diabete tramite Microinfusori", type: "quantum", modelCode: "Qiskit_DiabetesOpt", focus: "Dispositivi Medici", description: "Calibrazione predittiva dell'infusione basale di insulina in continuo" },
      { id: "san-q-12", name: "Modellazione delle Interazioni tra Microbioma Intestinale e Sistema Immunitario", type: "quantum", modelCode: "Qiskit_Microbiome", focus: "Microbiomica", description: "Simulazione delle reti simbiotiche tra ceppi batterici e citochine infiammatorie" },
      { id: "san-q-13", name: "Progettazione di Scaffold Biocompatibili per la Stampa 3D di Organi", type: "quantum", modelCode: "Qiskit_BioScaffold", focus: "Medicina Rigenerativa", description: "Ottimizzazione della porosità e resistenza meccanica per la crescita cellulare" },
      { id: "san-q-14", name: "Selezione dei Donatori per il Trapianto di Midollo Osseo (HLA)", type: "quantum", modelCode: "Qiskit_HLA", focus: "Compatibilità Trapianti", description: "Massimizzazione della compatibilità antigenica complessa donatore-ricevente" },
      { id: "san-q-15", name: "Ottimizzazione dei Parametri di Ventilazione Meccanica in Terapia Intensiva", type: "quantum", modelCode: "Qiskit_VentilationOpt", focus: "Terapia Intensiva", description: "Regolazione volumetrica e pressoria dinamica per prevenire barotraumi polmonari" },
      { id: "san-q-16", name: "Ricerca di Nuovi Antibiotici contro i Superbatteri Resistenti (MRSA)", type: "quantum", modelCode: "Qiskit_Antibiotics", focus: "Farmacologia", description: "Progettazione peptidica specifica per penetrare le membrane batteriche resistenti" },
      { id: "san-q-17", name: "Ottimizzazione dei Flussi di Pronto Soccorso tramite Triage Intelligente", type: "quantum", modelCode: "Qiskit_TriageOpt", focus: "Triage Ospedaliero", description: "Prioritizzazione dinamica dei codici di gravità e gestione barelle" },
      { id: "san-q-18", name: "Analisi dei Dati di Espressione Genica su Singola Cellula (scRNA-seq)", type: "quantum", modelCode: "Qiskit_SingleCell", focus: "Biologia Molecolare", description: "Clustering ad altissima dimensionalità delle popolazioni cellulari" },
      { id: "san-c-1", name: "Diagnostica e Classificazione di Tumori da Immagini Radiografiche (CNN)", type: "classical", modelCode: "Python_HPC_TumorCNN", focus: "Computer Vision", description: "Segmentazione automatica lesioni polmonari e mammarie ad alta risoluzione" },
      { id: "san-c-2", name: "Analisi Predittiva della Cartella Clinica Elettronica per Rischio Riammissioni", type: "classical", modelCode: "Python_HPC_XGBoost", focus: "Machine Learning", description: "Valutazione score di fragilità post-operatoria del paziente ricoverato" },
      { id: "san-c-3", name: "Estrazione Informazioni Cliniche da Report Medici non Strutturati (NLP/LLM)", type: "classical", modelCode: "Python_HPC_ClinicalLLM", focus: "NLP", description: "Normalizzazione cartelle non strutturate secondo codifica ICD-10" },
      { id: "san-c-4", name: "Modellazione e Simulazione dell'Evoluzione Epidemica Territoriale", type: "classical", modelCode: "Python_HPC_Epidemic", focus: "Simulazione Dinamica", description: "Simulazione a base di agenti per la diffusione pandemica su larga scala" }
    ]
  }
};
export default function TestPage({ 
  onBack, 
  onOpenIbm, 
  setSharedQasm,
  currentUser
}: { 
  onBack: () => void; 
  onOpenIbm?: () => void; 
  setSharedQasm?: (code: string) => void; 
  currentUser?: CurrentUserSession | null;
}) {
  const { language } = useTranslation();
  const ui = getAgentUi(language);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; kind?: 'csv_upload' | 'csv_confirm' | 'sim_complete' | 'demo_csv' }[]>([
    { role: 'model', text: ui.welcomeMessage }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'model') {
      setMessages([{ role: 'model', text: ui.welcomeMessage }]);
    }
  }, [language]);

  // User and permissions live sync
  const [liveUser, setLiveUser] = useState<CurrentUserSession | null>(currentUser || getCurrentSession());
  const [categoryDeniedModal, setCategoryDeniedModal] = useState<{ isOpen: boolean; sectorName: string } | null>(null);

  useEffect(() => {
    setLiveUser(currentUser || getCurrentSession());
  }, [currentUser]);

  // Interview state progression
  // 0: Categoria, 1: Scenario, 2: CSV, 3A: Periodo, 3B: Strategia, 4A: Infrastruttura, 4B: Vincolo, 4C: Chiusura, 5: Completed
  const [currentPhase, setCurrentPhase] = useState<'0_cat' | '1_scen' | '2_csv' | '3a_per' | '3b_strat' | '4a_infra' | '4b_vinc' | '4c_depth' | '4d_close' | '5_done'>('0_cat');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedScenario, setSelectedScenario] = useState<SectorScenario | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [selectedInfra, setSelectedInfra] = useState<'quantum' | 'classical'>('quantum');
  const [showEndModal, setShowEndModal] = useState(false);
  const [finalQasm, setFinalQasm] = useState("");
  const [finalPython, setFinalPython] = useState("");
  const [finalJson, setFinalJson] = useState("");
  const [selectedVincolo, setSelectedVincolo] = useState<'blocco_rigido' | 'legame_morbido' | 'nessun_vincolo'>('blocco_rigido');

  // Live listener for real-time permission revocation
  useEffect(() => {
    const handlePermissionsUpdated = () => {
      const fresh = getCurrentSession();
      setLiveUser(fresh);
      if (selectedSector && !isAgentAiCategoryAllowedForUser(fresh, selectedSector)) {
        setSelectedSector('');
        setSelectedScenario(null);
        setCurrentPhase('0_cat');
        setCategoryDeniedModal({ isOpen: true, sectorName: selectedSector });
      }
    };
    window.addEventListener('quantum_user_permissions_updated', handlePermissionsUpdated);
    return () => {
      window.removeEventListener('quantum_user_permissions_updated', handlePermissionsUpdated);
    };
  }, [selectedSector]);

  const { csv1: currentCsv1, csv2: currentCsv2 } = getDemoCsvBySector(
    selectedSector || "", 
    selectedScenario?.id || "", 
    selectedVincolo || "blocco_rigido", 
    selectedStrategy || "aggressiva"
  );

  // CSV Uploaded info state (visual feedback in chat & sidebar)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; rows: number }[]>([]);
  const [customCsv1Content, setCustomCsv1Content] = useState<string | null>(null);
  const [customCsv2Content, setCustomCsv2Content] = useState<string | null>(null);
  const [uploadedFile1Name, setUploadedFile1Name] = useState<string>('1_anagrafica_risorse.csv');
  const [uploadedFile2Name, setUploadedFile2Name] = useState<string>('2_matrice_connessioni.csv');
  const [isDemoActive, setIsDemoActive] = useState<boolean>(true);
  const [csvValidation, setCsvValidation] = useState<{ valido: boolean; partialMissing?: 'file1' | 'file2'; messaggio?: string; righe?: number; colonne?: number } | null>(null);
  const [customPeriodInput, setCustomPeriodInput] = useState<string>('');
  
  // Date precise personalizzate da calendario (es. dal 01/04/26 al 23/06/26)
  const [startDateInput, setStartDateInput] = useState<string>('2026-04-01');
  const [endDateInput, setEndDateInput] = useState<string>('2026-06-23');

  const calculateDaysDifference = (start: string, end: string): number | null => {
    if (!start || !end) return null;
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = d2.getTime() - d1.getTime();
    if (isNaN(diffTime) || diffTime <= 0) return null;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDateToIT = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const shortYear = y.length === 4 ? y.slice(2) : y;
    return `${d}/${m}/${shortYear}`;
  };

  const handleApplyDateRange = () => {
    if (!startDateInput || !endDateInput) return;
    const days = calculateDaysDifference(startDateInput, endDateInput);
    if (!days) {
      alert(ui.dateErrAlert);
      return;
    }
    const formattedStart = formatDateToIT(startDateInput);
    const formattedEnd = formatDateToIT(endDateInput);
    handleQuickClick(ui.preciseDatesMsg(formattedStart, formattedEnd, days));
  };

  const [copiedInterview, setCopiedInterview] = useState<boolean>(false);
  const [scenarioSearch, setScenarioSearch] = useState<string>('');

  // Bloch Sphere State
  const [targetAlgoritmo, setTargetAlgoritmo] = useState<string>('IDLE');
  const [assetSector, setAssetSector] = useState<string>('N/A');
  const [vincoloStile, setVincoloStile] = useState<string>('N/A');
  const [theta, setTheta] = useState<number>(0);
  const [phi, setPhi] = useState<number>(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pendingAutoDownloadRef = useRef<boolean>(false);

  const formatInterviewText = (msgs: typeof messages) => {
    if (!msgs || msgs.length === 0) return '';
    return msgs.map(m => {
      const sender = m.role === 'model' ? 'Solution Architect AI' : ui.userRoleLabel;
      return `[${sender}]\n${m.text}\n`;
    }).join('\n----------------------------------------\n\n');
  };

  const buildCompleteBundleTxt = (overrideMsgs?: typeof messages) => {
    const msgsToUse = overrideMsgs || messages;
    const interviewStr = formatInterviewText(msgsToUse);
    if (!interviewStr) return '';

    const now = new Date();
    const effectiveSector = (assetSector && assetSector !== 'N/A' ? assetSector : selectedSector) || 'Finanza e Mercati';
    const effectiveScenarioId = selectedScenario?.id || '';
    const effectiveVincolo = vincoloStile !== 'N/A' ? vincoloStile : (selectedVincolo || 'blocco_rigido');
    const effectiveStrategy = selectedStrategy || 'Prudente';
    const effectivePeriod = selectedPeriod || ui.presets[1]?.val || '1 Trimestre';
    const isClassicalScenario =
      selectedScenario?.type === 'classical' ||
      selectedInfra === 'classical' ||
      targetAlgoritmo.startsWith('Python_HPC_');

    const effectiveTargetAlgo =
      targetAlgoritmo !== 'IDLE'
        ? targetAlgoritmo
        : isClassicalScenario
          ? 'Python_HPC_' + (selectedScenario?.modelCode || 'Pipeline')
          : 'Qiskit_' + (selectedScenario?.modelCode || 'QAOA');

    const taxSector = getTaxonomicSector(effectiveSector, effectiveScenarioId, language);
    const localizedScenarioName = selectedScenario
      ? getLocalizedTestScenario(selectedScenario, language).name
      : taxSector.name;

    const { csv1: demoCsv1, csv2: demoCsv2 } = getDemoCsvBySector(
      effectiveSector,
      effectiveScenarioId,
      effectiveVincolo,
      effectiveStrategy
    );
    const effectiveCsv1 = customCsv1Content ?? demoCsv1;
    const effectiveCsv2 = customCsv2Content ?? demoCsv2;
    const file1Label = uploadedFile1Name || '1_anagrafica_risorse_guida.csv';
    const file2Label =
      uploadedFile2Name ||
      (effectiveCsv2 && effectiveCsv2.trim()
        ? '2_matrice_connessioni_guida.csv'
        : 'Nessuna matrice vincoli (risorse indipendenti)');

    const hasCompletedOutput =
      currentPhase === '5_done' ||
      Boolean(finalPython) ||
      Boolean(finalJson) ||
      msgsToUse.some(m => m.kind === 'sim_complete' || m.text.includes('[SIMULAZIONE COMPLETATA'));

    const lines: string[] = [];
    const hr = '================================================================================';
    const subHr = '--------------------------------------------------------------------------------';

    lines.push(hr);
    lines.push('QUANTUM ENTERPRISE ENGINE - REPORT COMPLETO ELABORAZIONE & INTERVISTA');
    lines.push(hr);
    lines.push(`Data / Ora Esportazione : ${now.toLocaleString('it-IT')}`);
    lines.push(`Categoria / Settore     : ${taxSector.name} (${effectiveSector})`);
    lines.push(
      `Scenario Selezionato    : ${localizedScenarioName}${selectedScenario ? ` [ID: ${selectedScenario.id} | Modello: ${selectedScenario.modelCode}]` : ''}`
    );
    lines.push(
      `Tipo Pipeline           : ${isClassicalScenario ? ui.modalPipelineClassical : ui.modalPipelineQuantum}`
    );
    lines.push(`Algoritmo Target        : ${effectiveTargetAlgo}`);
    lines.push(`Arco Temporale          : ${effectivePeriod}`);
    lines.push(`Strategia Operativa     : ${effectiveStrategy}`);
    lines.push(`Stile Vincoli / Graph   : ${effectiveVincolo}`);
    lines.push(
      `Fonte Dati CSV          : ${isDemoActive ? ui.modalSourceDemoShort : ui.modalSourceUserShort}`
    );
    lines.push(`File 1 (Risorse)        : ${file1Label}`);
    lines.push(`File 2 (Matrice)        : ${file2Label}`);
    lines.push('');

    lines.push(hr);
    lines.push('SEZIONE 1 - TRASCRIZIONE COMPLETA INTERVISTA (FASE 0 -> OUTPUT)');
    lines.push(hr);
    lines.push(interviewStr);
    lines.push('');

    lines.push(hr);
    lines.push('SEZIONE 2 - FILE CSV UTILIZZATI PER IL CALCOLO');
    lines.push(hr);
    lines.push(`--- FILE 1: ${file1Label} ---`);
    lines.push(effectiveCsv1 && effectiveCsv1.trim() ? effectiveCsv1.trim() : '[Nessun contenuto File 1 disponibile]');
    lines.push('');
    lines.push(`--- FILE 2: ${file2Label} ---`);
    lines.push(
      effectiveCsv2 && effectiveCsv2.trim()
        ? effectiveCsv2.trim()
        : '[Nessuna matrice di connessione caricata: risorse trattate come indipendenti]'
    );
    lines.push('');

    if (hasCompletedOutput) {
      const effectiveQasm = isClassicalScenario
        ? ''
        : finalQasm ||
          generateQiskitCode(
            effectiveSector,
            effectiveCsv1,
            effectiveCsv2,
            effectiveVincolo,
            effectiveStrategy
          );

      const effectivePython =
        finalPython ||
        (isClassicalScenario
          ? generateClassicalHpcPythonCode(
              effectiveSector,
              selectedScenario?.name || effectiveScenarioId || 'Scenario Classico',
              effectiveScenarioId || 'HPC-Model',
              effectiveCsv1,
              effectiveCsv2,
              effectiveStrategy,
              file1Label,
              file2Label,
              isDemoActive
            )
          : generateQiskitPythonCode(
              effectiveSector,
              effectiveCsv1,
              effectiveCsv2,
              effectiveVincolo,
              effectiveStrategy,
              file1Label,
              file2Label,
              isDemoActive,
              selectedScenario?.modelCode || '' // <-- AGGIUNTO QUI
            ));

      const fallbackThetaRad = (theta * Math.PI) / 180;
      const fallbackPhiRad = (phi * Math.PI) / 180;
      const effectiveJson =
        finalJson ||
        JSON.stringify(
          isClassicalScenario
            ? {
                settore: taxSector.name,
                scenario: localizedScenarioName,
                infrastruttura: 'HPC / GPU / CPU Multi-Core',
                modello: selectedScenario?.modelCode || 'Machine Learning / Pipeline Classica',
                strategia: effectiveStrategy,
                entanglement: 'nessuno (calcolo convenzionale classico)',
                calcolo_quantistico: false,
                predisposizione_grafico: false,
              }
            : {
                settore: taxSector.name,
                scenario: localizedScenarioName,
                strategia: effectiveStrategy,
                entanglement:
                  effectiveVincolo === 'nessun_vincolo'
                    ? 'none'
                    : effectiveVincolo === 'blocco_rigido'
                      ? 'cx'
                      : 'cp',
                theta_radianti: parseFloat(fallbackThetaRad.toFixed(6)),
                thetas_radianti: [parseFloat(fallbackThetaRad.toFixed(6))],
                phi_radianti: parseFloat(fallbackPhiRad.toFixed(6)),
                predisposizione_grafico: true,
              },
          null,
          2
        );

      lines.push(hr);
      lines.push('SEZIONE 3 - RISULTATI, PARAMETRI E GRAFICI DEL POP-UP FINALE');
      lines.push(hr);

      if (!isClassicalScenario) {
        let parsedThetaRad: number | null = null;
        let parsedThetas: number[] = [];
        let parsedPhiRad: number | null = null;
        try {
          const parsedObj = JSON.parse(effectiveJson || '{}');
          if (typeof parsedObj?.theta_radianti === 'number' && !isNaN(parsedObj.theta_radianti)) {
            parsedThetaRad = parsedObj.theta_radianti;
          }
          if (Array.isArray(parsedObj?.thetas_radianti)) {
            parsedThetas = parsedObj.thetas_radianti.filter((x: unknown) => typeof x === 'number' && !isNaN(x));
          }
          if (typeof parsedObj?.phi_radianti === 'number' && !isNaN(parsedObj.phi_radianti)) {
            parsedPhiRad = parsedObj.phi_radianti;
          }
        } catch {
          // ignore JSON parse issues
        }

        const thetaRadVal = parsedThetaRad !== null ? parsedThetaRad : (theta * Math.PI) / 180;
        const thetaDegVal = (thetaRadVal * 180) / Math.PI;
        const phiDegVal = phi;
        const phiRadVal = parsedPhiRad !== null ? parsedPhiRad : (phi * Math.PI) / 180;

        const p0Val = Math.pow(Math.cos(thetaRadVal / 2), 2);
        const p1Val = Math.pow(Math.sin(thetaRadVal / 2), 2);
        const count0Val = Math.round(p0Val * 1024);
        const count1Val = Math.round(p1Val * 1024);

        let label0 = ui.histDefault0;
        let label1 = ui.histDefault1;
        const sLower = effectiveSector.toLowerCase();
        if (taxSector.id === 'finanza' || sLower.includes('finanz')) {
          label0 = ui.histFin0;
          label1 = ui.histFin1;
        } else if (taxSector.id === 'chimica' || sLower.includes('chimic') || sLower.includes('farmaceutica') || sLower.includes('materiali')) {
          label0 = ui.histChem0;
          label1 = ui.histChem1;
        } else if (taxSector.id === 'manifattura' || sLower.includes('produzion') || sLower.includes('manifattura')) {
          label0 = ui.histMan0;
          label1 = ui.histMan1;
        } else if (taxSector.id === 'sicurezza' || sLower.includes('sicurezz') || sLower.includes('telecomunicazion') || sLower.includes('reti')) {
          label0 = ui.histSec0;
          label1 = ui.histSec1;
        } else if (taxSector.id === 'sanita' || sLower.includes('sanità') || sLower.includes('sanita') || sLower.includes('genomica')) {
          label0 = ui.histSan0;
          label1 = ui.histSan1;
        }

        const quantumOutcome = ui.modalOutcomeQuantumHtml(thetaRadVal.toFixed(4));

        lines.push(`[1] ${ui.modalBlochTitle}`);
        lines.push(`  - ${ui.modalCoordsLabel} Theta = ${thetaRadVal.toFixed(6)} rad (${thetaDegVal.toFixed(2)}°) | Phi = ${phiRadVal.toFixed(6)} rad (${phiDegVal.toFixed(2)}°)`);
        if (parsedThetas.length > 0) {
          lines.push(`  - Vettore Completo Thetas (rad): [${parsedThetas.map(v => v.toFixed(6)).join(', ')}]`);
        }

        try {
          const { risorse } = parseCsv1Deterministic(effectiveCsv1);
          if (risorse.length > 0) {
            lines.push('  - Mappatura Dettagliata Qubit (FIFO da File 1):');
            risorse.slice(0, MAX_QUANTUM_QUBITS).forEach((r, idx) => {
              const w = Math.max(0.0, Math.min(1.0, r.peso));
              const tRad = 2.0 * Math.asin(Math.sqrt(w));
              const tDeg = (tRad * 180) / Math.PI;
              const pct1 = (w * 100).toFixed(2);
              const pct0 = ((1 - w) * 100).toFixed(2);
              lines.push(
                `    * q[${idx}] -> ${r.id} | peso=${w.toFixed(4)} | theta=${tRad.toFixed(6)} rad (${tDeg.toFixed(2)}°) | |1>=${pct1}% | |0>=${pct0}%`
              );
            });
          }
        } catch {
          // ignore CSV parse detail errors
        }

        lines.push('');
        lines.push(`[2] ${ui.modalProbTitle} (1024 shots - Qubit di riferimento q[0])`);
        lines.push(`  - Stato |0> (${label0}): ${(p0Val * 100).toFixed(2)}% (~${count0Val} / 1024 shots)`);
        lines.push(`  - Stato |1> (${label1}): ${(p1Val * 100).toFixed(2)}% (~${count1Val} / 1024 shots)`);
        lines.push('');
        lines.push(`[3] ${ui.modalComposerTitle}`);
        lines.push(`  - Stato Composer : ${ui.composerCompiled}`);
        lines.push(`  - Descrizione    : ${ui.composerActionDesc}`);
        lines.push('  - Link IBM Cloud : https://quantum.ibm.com/composer');
        lines.push('');
        lines.push(`[4] ${ui.modalOutcomeTitle}`);
        lines.push(
          `  ${quantumOutcome.part1}${quantumOutcome.bold1} / ${quantumOutcome.bold2}${quantumOutcome.part2}${quantumOutcome.bold3}${quantumOutcome.part3}`
        );
        lines.push(`  ${ui.modalHwExecTitle}: ${ui.modalHwExecDesc}`);
      } else {
        lines.push(`[1] Metriche Engine HPC Classico`);
        lines.push(`  - ${ui.modalHpcStatusLabel}: ${ui.modalHpcStatusVal} (SciPy SLSQP · Markowitz)`);
        lines.push(`  - ${ui.modalHpcTargetLabel}: ${ui.modalHpcTargetVal} (${ui.modalHpcTargetSub})`);
        lines.push(`  - ${ui.modalHpcMathLabel}: NumPy / SciPy / ML (${ui.modalHpcMathSub})`);
        lines.push(`  - ${ui.modalHpcNoiseLabel}: ${ui.modalHpcNoiseVal} (${ui.modalHpcNoiseSub})`);
        lines.push('');
        lines.push(`[2] ${ui.modalHpcSummaryTitle}`);
        lines.push(`  ${ui.modalHpcSummaryBody}`);
        lines.push('');
        lines.push(`[3] ${ui.modalOutcomeTitle}`);
        ui.modalOutcomeClassicalItems.forEach(item => {
          lines.push(`  - ${item.bold} ${item.text}`);
        });
        lines.push(`  ${ui.modalClassicalDoneTitle}: ${ui.modalClassicalDoneDesc}`);
      }
      lines.push('');

      lines.push(hr);
      lines.push(`SEZIONE 4 - ${ui.modalManifestTitle}`);
      lines.push(hr);
      lines.push(effectiveJson || '{}');
      lines.push('');

      lines.push(hr);
      lines.push(
        `SEZIONE 5 - ${isClassicalScenario ? ui.modalPythonClassicalTitle : ui.modalPythonQuantumTitle}`
      );
      lines.push(hr);
      lines.push(effectivePython || '# Python script non disponibile');
      lines.push('');

      if (!isClassicalScenario) {
        lines.push(hr);
        lines.push(`SEZIONE 6 - ${ui.modalQasmTitle}`);
        lines.push(hr);
        lines.push(effectiveQasm || '// OpenQASM 3.0 non disponibile');
        lines.push('');
      } else {
        lines.push(subHr);
        lines.push('NOTA OPENQASM 3.0: Scenario Classico HPC - nessun circuito quantistico OpenQASM richiesto.');
        lines.push(subHr);
        lines.push('');
      }
    }

    return lines.join('\n');
  };

  const downloadInterviewTxt = (contentToDownload: string, isCompleteReport = true) => {
    if (!contentToDownload) return;
    try {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

      const sanitizeFilenamePart = (val: string) =>
        val
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fff\u3040-\u30ff]+/g, '_')
          .replace(/^_+|_+$/g, '');

      const rawSectorName = assetSector && assetSector !== 'N/A' ? assetSector : selectedSector;
      const localizedCategoryName = rawSectorName ? getLocalizedSectorName(rawSectorName, language) : '';
      const localizedScenarioName = selectedScenario
        ? getLocalizedTestScenario(selectedScenario, language).name
        : '';

      const categorySlug = localizedCategoryName ? sanitizeFilenamePart(localizedCategoryName) : '';
      const scenarioSlug = localizedScenarioName ? sanitizeFilenamePart(localizedScenarioName).slice(0, 120).replace(/_+$/g, '') : '';
      const subjectSlug = [categorySlug, scenarioSlug].filter(Boolean).join('_-_');
      const docType = isCompleteReport ? 'report_completo' : 'intervista';
      const filename = subjectSlug
        ? `${subjectSlug}_${docType}_${timestamp}.txt`
        : `agent_ai_${docType}_${timestamp}.txt`;

      const blob = new Blob([contentToDownload], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Errore durante il download del file TXT:', err);
    }
  };

  const fullInterviewText = useMemo(
    () => formatInterviewText(messages),
    [messages, ui.userRoleLabel]
  );

  // Scarica automaticamente il pacchetto completo .txt (intervista + CSV + risultati pop-up + JSON + Python + QASM) sul PC ogni volta che si conclude un calcolo
  useEffect(() => {
    if (!pendingAutoDownloadRef.current) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || (lastMsg.kind !== 'sim_complete' && !lastMsg.text.includes('[SIMULAZIONE COMPLETATA'))) return;
    pendingAutoDownloadRef.current = false;
    const bundleToDownload = buildCompleteBundleTxt(messages);
    if (bundleToDownload) {
      downloadInterviewTxt(bundleToDownload, true);
    }
  }, [messages, finalQasm, finalPython, finalJson, theta, phi]);

  // Copia dell'intero report/intervista negli appunti e download automatico in .txt
  const handleCopyInterview = () => {
    if (messages.length === 0) return;
    const hasCompleted =
      currentPhase === '5_done' ||
      Boolean(finalPython) ||
      Boolean(finalJson) ||
      messages.some(m => m.kind === 'sim_complete' || m.text.includes('[SIMULAZIONE COMPLETATA'));
    const exportStr = buildCompleteBundleTxt(messages);

    try {
      navigator.clipboard?.writeText(exportStr)?.catch(() => {});
    } catch {}

    downloadInterviewTxt(exportStr, hasCompleted);

    setCopiedInterview(true);
    setTimeout(() => setCopiedInterview(false), 2200);
  };

  const readUploadedFileToCsvString = (file: File): Promise<{ csv: string; sheetCount: number }> => {
    return new Promise((resolve, reject) => {
      const isExcel = /\.(xlsx|xls)$/i.test(file.name);
      if (isExcel) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const buffer = e.target?.result as ArrayBuffer;
            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            if (!firstSheetName) {
              reject(new Error('Il file Excel non contiene fogli di lavoro validi.'));
              return;
            }
            const sheet1 = workbook.Sheets[firstSheetName];
            const csv = (XLSX.utils.sheet_to_csv(sheet1) || '').replace(/^\uFEFF/, '');
            resolve({ csv, sheetCount: workbook.SheetNames.length });
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            resolve({ csv: e.target.result.replace(/^\uFEFF/, ''), sheetCount: 1 });
          } else {
            resolve({ csv: '', sheetCount: 1 });
          }
        };
        reader.onerror = reject;
        reader.readAsText(file);
      }
    });
  };

  // Gestione caricamento reale file CSV / Excel (.xlsx, .xls) con rilevamento esplicito file mancante
  const handleCsvUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);

    try {
      const loadedFiles = await Promise.all(
        filesArray.map(async (file) => {
          const { csv, sheetCount } = await readUploadedFileToCsvString(file);
          return {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            csv,
            sheetCount,
            kind: classifyUploadedCsv(csv, file.name),
          };
        })
      );

      let slot1: typeof loadedFiles[number] | null = null;
      let slot2: typeof loadedFiles[number] | null = null;

      if (loadedFiles.length === 1) {
        const single = loadedFiles[0];
        let kind = single.kind;
        if (kind === 'unknown') {
          const tryF1 = validaFileCaricato(single.csv, single.name, language);
          if (tryF1.valido) {
            kind = 'anagrafica';
          } else {
            const tryF2 = validaMatriceFile2(single.csv);
            if (tryF2.valido) kind = 'matrice';
          }
        }
        if (kind === 'matrice') {
          slot2 = single;
          if (!isDemoActive && customCsv1Content !== null && uploadedFile1Name) {
            slot1 = {
              name: uploadedFile1Name,
              size: uploadedFiles.find(u => u.name === uploadedFile1Name)?.size || 'in memoria',
              csv: customCsv1Content,
              sheetCount: 1,
              kind: 'anagrafica',
            };
          }
        } else {
          slot1 = single;
          if (!isDemoActive && customCsv2Content !== null && customCsv2Content.trim().length > 0 && uploadedFile2Name) {
            slot2 = {
              name: uploadedFile2Name,
              size: uploadedFiles.find(u => u.name === uploadedFile2Name)?.size || 'in memoria',
              csv: customCsv2Content,
              sheetCount: 1,
              kind: 'matrice',
            };
          }
        }
      } else {
        const anags = loadedFiles.filter(f => f.kind === 'anagrafica');
        const mats = loadedFiles.filter(f => f.kind === 'matrice');
        const unknowns = loadedFiles.filter(f => f.kind === 'unknown');

        if (anags.length >= 2 || mats.length >= 2) {
          setCsvValidation({ valido: false, messaggio: ui.csvDuplicateTypeErr });
          setMessages(prev => [
            ...prev,
            { role: 'model', text: `⚠️ **${ui.csvUploadBlockedTitle}**\n\n${ui.csvDuplicateTypeErr}` }
          ]);
          return;
        }

        if (anags.length === 1 && mats.length === 1) {
          slot1 = anags[0];
          slot2 = mats[0];
        } else if (anags.length === 1 && unknowns.length >= 1) {
          slot1 = anags[0];
          slot2 = unknowns[0];
        } else if (mats.length === 1 && unknowns.length >= 1) {
          slot1 = unknowns[0];
          slot2 = mats[0];
        } else {
          const tryFirstAsF1 = validaFileCaricato(loadedFiles[0].csv, loadedFiles[0].name, language);
          if (tryFirstAsF1.valido) {
            slot1 = loadedFiles[0];
            slot2 = loadedFiles[1];
          } else {
            slot1 = loadedFiles[1];
            slot2 = loadedFiles[0];
          }
        }
      }

      // Caso A: Solo File 1 presente (manca File 2 Matrice)
      if (slot1 && !slot2) {
        const check1 = validaFileCaricato(slot1.csv, slot1.name, language);
        if (!check1.valido) {
          setCsvValidation(check1);
          setMessages(prev => [
            ...prev,
            { role: 'user', text: `[CSV / EXCEL]\n• ${slot1!.name} (${slot1!.size})`, kind: 'csv_upload' },
            { role: 'model', text: `⚠️ **${ui.csvUploadBlockedTitle}**\n\n${check1.messaggio}\n\n*${ui.csvUploadBlockedHint}*` }
          ]);
          return;
        }

        setCustomCsv1Content(slot1.csv);
        setUploadedFile1Name(slot1.name);
        setCustomCsv2Content(null);
        setUploadedFile2Name('');
        setIsDemoActive(false);
        setUploadedFiles([{ name: slot1.name, size: slot1.size, rows: check1.righe || 0 }]);

        const missingMsg = ui.csvSingleMissingFile2Msg(slot1.name, check1.righe || 0, slot1.sheetCount);
        setCsvValidation({
          valido: false,
          partialMissing: 'file2',
          messaggio: missingMsg,
          righe: check1.righe,
          colonne: check1.colonne,
        });
        setMessages(prev => [
          ...prev,
          { role: 'user', text: `[CSV / EXCEL - 1/2]\n• ${slot1!.name} (${slot1!.size})`, kind: 'csv_upload' },
          { role: 'model', text: `⚠️ **${ui.csvSingleMissingFile2Header}**\n\n${missingMsg}` }
        ]);
        if (currentPhase === '0_cat' || currentPhase === '1_scen') {
          setCurrentPhase('2_csv');
        }
        return;
      }

      // Caso B: Solo File 2 presente (manca File 1 Anagrafica)
      if (!slot1 && slot2) {
        const check2 = validaMatriceFile2(slot2.csv);
        if (!check2.valido) {
          const f2Err = ui.csvFile2ErrorMsg(slot2.name, check2.reason);
          setCsvValidation({ valido: false, messaggio: f2Err });
          setMessages(prev => [
            ...prev,
            { role: 'user', text: `[CSV / EXCEL]\n• ${slot2!.name} (${slot2!.size})`, kind: 'csv_upload' },
            { role: 'model', text: `⚠️ **${ui.csvUploadBlockedTitle}**\n\n${f2Err}\n\n*${ui.csvUploadBlockedHint}*` }
          ]);
          return;
        }

        setCustomCsv1Content(null);
        setUploadedFile1Name('');
        setCustomCsv2Content(slot2.csv);
        setUploadedFile2Name(slot2.name);
        setIsDemoActive(false);
        setUploadedFiles([{ name: slot2.name, size: slot2.size, rows: check2.righe }]);

        const missingMsg = ui.csvSingleMissingFile1Msg(slot2.name, check2.righe, slot2.sheetCount);
        setCsvValidation({
          valido: false,
          partialMissing: 'file1',
          messaggio: missingMsg,
          righe: check2.righe,
          colonne: check2.colonne,
        });
        setMessages(prev => [
          ...prev,
          { role: 'user', text: `[CSV / EXCEL - 1/2]\n• ${slot2!.name} (${slot2!.size})`, kind: 'csv_upload' },
          { role: 'model', text: `⚠️ **${ui.csvSingleMissingFile1Header}**\n\n${missingMsg}` }
        ]);
        if (currentPhase === '0_cat' || currentPhase === '1_scen') {
          setCurrentPhase('2_csv');
        }
        return;
      }

      // Caso C: Entrambi File 1 e File 2 presenti
      if (slot1 && slot2) {
        const check1 = validaFileCaricato(slot1.csv, slot1.name, language);
        if (!check1.valido) {
          setCsvValidation(check1);
          setMessages(prev => [
            ...prev,
            { role: 'user', text: `[CSV / EXCEL]\n• ${slot1!.name} (${slot1!.size})`, kind: 'csv_upload' },
            { role: 'model', text: `⚠️ **${ui.csvUploadBlockedTitle}**\n\n${check1.messaggio}\n\n*${ui.csvUploadBlockedHint}*` }
          ]);
          return;
        }

        const { mappaQubit } = parseCsv1Deterministic(slot1.csv);
        const check2 = validaMatriceFile2(slot2.csv, mappaQubit);
        if (!check2.valido) {
          const f2Err = ui.csvFile2ErrorMsg(slot2.name, check2.reason);
          // Manteniamo il File 1 valido in memoria così l'utente deve ricaricare solo il File 2 corretto
          setCustomCsv1Content(slot1.csv);
          setUploadedFile1Name(slot1.name);
          setCustomCsv2Content(null);
          setUploadedFile2Name('');
          setIsDemoActive(false);
          setUploadedFiles([{ name: slot1.name, size: slot1.size, rows: check1.righe || 0 }]);
          setCsvValidation({
            valido: false,
            partialMissing: 'file2',
            messaggio: f2Err,
            righe: check1.righe,
            colonne: check1.colonne,
          });
          setMessages(prev => [
            ...prev,
            { role: 'user', text: `[CSV / EXCEL]\n• ${slot1!.name} (${slot1!.size})\n• ${slot2!.name} (${slot2!.size})`, kind: 'csv_upload' },
            { role: 'model', text: `⚠️ **${ui.csvUploadBlockedTitle}**\n\n${f2Err}` }
          ]);
          return;
        }

        const r1Count = check1.righe || 0;
        const r2Count = check2.relazioniAttive > 0 ? check2.relazioniAttive : check2.righe;

        setCustomCsv1Content(slot1.csv);
        setUploadedFile1Name(slot1.name);
        setCustomCsv2Content(slot2.csv);
        setUploadedFile2Name(slot2.name);
        setIsDemoActive(false);
        setCsvValidation({
          valido: true,
          messaggio: ui.csvValidSummary(r1Count, check1.colonne || 0),
          righe: r1Count,
          colonne: check1.colonne,
        });
        setUploadedFiles([
          { name: slot1.name, size: slot1.size, rows: r1Count },
          { name: slot2.name, size: slot2.size, rows: r2Count },
        ]);

        const uploadUserMsg = `[CSV / EXCEL]\n• ${slot1.name} (${slot1.size})\n• ${slot2.name} (${slot2.size})`;
        const uploadBotReply = ui.csvUploadOkReply(slot1.name, r1Count, slot2.name, r2Count);

        setMessages(prev => [
          ...prev,
          { role: 'user', text: uploadUserMsg, kind: 'csv_upload' },
          { role: 'model', text: uploadBotReply, kind: 'csv_confirm' }
        ]);

        if (currentPhase === '0_cat' || currentPhase === '1_scen' || currentPhase === '2_csv') {
          setCurrentPhase('3a_per');
        }
      }
    } catch (err: any) {
      console.error("Errore lettura file caricati:", err);
      const errMsg = err?.message || 'Errore durante la lettura del file CSV/Excel caricato.';
      setCsvValidation({ valido: false, messaggio: errMsg });
      setMessages(prev => [
        ...prev,
        { role: 'model', text: `⚠️ **${ui.csvUploadBlockedTitle}**\n\n${errMsg}\n\n*${ui.csvUploadBlockedHint}*` }
      ]);
    }
  };

  const handleProceedWithoutMatrix = () => {
    if (customCsv1Content === null) return;
    const rows1 = csvValidation?.righe || parseCsv1Deterministic(customCsv1Content).risorse.length;
    setCustomCsv2Content('');
    setUploadedFile2Name('nessuna_matrice_risorse_indipendenti.csv');
    setIsDemoActive(false);
    setCsvValidation({
      valido: true,
      messaggio: ui.csvValidSummary(rows1, csvValidation?.colonne || 2),
      righe: rows1,
      colonne: csvValidation?.colonne || 2,
    });
    setMessages(prev => [
      ...prev,
      { role: 'model', text: ui.csvProceedWithoutMatrixReply(uploadedFile1Name, rows1), kind: 'csv_confirm' }
    ]);
    if (currentPhase === '0_cat' || currentPhase === '1_scen' || currentPhase === '2_csv') {
      setCurrentPhase('3a_per');
    }
  };

  // Caricamento rapido dati CSV di esempio con download automatico per l'utente
  const handleDemoCsv = () => {
    // Resetta file custom caricati per usare il dataset demo dello scenario corrente
    setCustomCsv1Content(null);
    setCustomCsv2Content(null);
    setUploadedFile1Name("1_anagrafica_risorse_guida.csv");
    setUploadedFile2Name("2_matrice_connessioni_guida.csv");
    setIsDemoActive(true);

    // Valida positivamente il dataset demo predefinito
    setCsvValidation({
      valido: true,
      messaggio: ui.csvValidSummary(8, 6),
      righe: 8,
      colonne: 6
    });

    // 1. Trigger del download automatico di entrambi i file CSV di esempio con guida interna
    const { csv1, csv2 } = getDemoCsvBySector(selectedSector, selectedScenario?.id || "");
    triggerCsvDownload("1_anagrafica_risorse_guida.csv", csv1);
    triggerCsvDownload("2_matrice_connessioni_guida.csv", csv2);

    const demoFiles = [
      { name: "1_anagrafica_risorse_guida.csv", size: "2.4 KB", rows: 8 },
      { name: "2_matrice_connessioni_guida.csv", size: "1.9 KB", rows: 8 }
    ];
    setUploadedFiles(demoFiles);

    const uploadUserMsg = `[DEMO CSV]\n• ${demoFiles[0].name}\n• ${demoFiles[1].name}`;
    const uploadBotReply = ui.demoReplyBody;

    setMessages(prev => [
      ...prev,
      { role: 'user', text: uploadUserMsg, kind: 'csv_upload' },
      { role: 'model', text: uploadBotReply, kind: 'demo_csv' }
    ]);

    if (currentPhase === '0_cat' || currentPhase === '1_scen' || currentPhase === '2_csv') {
      setCurrentPhase('3a_per');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentPhase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let currentTheta = 0;
    let currentPhi = 0;
    let time = 0;

    const render = () => {
      currentTheta += (theta - currentTheta) * 0.05;
      currentPhi += (phi - currentPhi) * 0.05;
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

      const innerGrad = ctx.createRadialGradient(center - radius*0.3, center - radius*0.3, radius * 0.1, center, center, radius);
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

      const x3d = radius * Math.sin(radTheta) * Math.cos(radPhi);
      const y3d = radius * Math.sin(radTheta) * Math.sin(radPhi);
      const z3d = radius * Math.cos(radTheta);

      const targetX = center + x3d - y3d * 0.4;
      const targetY = center - z3d;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(targetX, targetY);
      ctx.strokeStyle = targetAlgoritmo === 'IDLE' ? '#334155' : (isQuantum ? '#f59e0b' : '#10b981');
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.shadowBlur = 15;
      ctx.shadowColor = targetAlgoritmo === 'IDLE' ? '#475569' : (isQuantum ? '#fbbf24' : '#34d399');

      ctx.beginPath();
      ctx.arc(targetX, targetY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = targetAlgoritmo === 'IDLE' ? '#475569' : (isQuantum ? '#fbbf24' : '#34d399');
      ctx.fill();

      if (targetAlgoritmo !== 'IDLE') {
        ctx.beginPath();
        const pX = center + (radius * 0.8) * Math.cos(time * 2);
        const pY = center + (radius * 0.8) * Math.sin(time * 2) * 0.3;
        ctx.arc(pX, pY, 2, 0, 2 * Math.PI);
        ctx.fillStyle = isQuantum ? '#fbbf24' : '#34d399';
        ctx.fill();
        
        ctx.beginPath();
        const pX2 = center + (radius * 0.8) * Math.cos(time * 2 + Math.PI);
        const pY2 = center + (radius * 0.8) * Math.sin(time * 2 + Math.PI) * 0.3;
        ctx.arc(pX2, pY2, 2, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theta, phi, targetAlgoritmo]);

  // Generate deterministic architectural replies faithful to promptText.txt and Taxonomic Engine V3
  const generateArchitectResponse = (phase: string, userInput: string, matchedSectorKey?: string, matchedScenario?: SectorScenario | null): string => {
    const activeSectorKey = matchedSectorKey || selectedSector;
    const activeScenario = matchedScenario !== undefined ? matchedScenario : selectedScenario;
    const taxSector = getTaxonomicSector(activeSectorKey, activeScenario?.id || "", language);

    if (phase === '0_cat') {
      const displaySector = getLocalizedSectorName(activeSectorKey, language);
      return ui.phase0Reply(displaySector);
    }

    if (phase === '1_scen') {
      const allScenarios = Object.values(SECTOR_DATA).flatMap(d => d.scenarios);
      const lowerInput = userInput.toLowerCase();
      const matched = activeScenario || allScenarios.find(s => {
        const locS = getLocalizedTestScenario(s, language);
        return (
          lowerInput.includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(lowerInput) ||
          lowerInput.includes(locS.name.toLowerCase()) ||
          locS.name.toLowerCase().includes(lowerInput)
        );
      });

      const locMatched = matched ? getLocalizedTestScenario(matched, language) : null;
      const scenDisplay = locMatched ? locMatched.name : userInput;
      const scenDesc = locMatched ? locMatched.description : userInput;
      return ui.phase1Reply(scenDisplay, scenDesc);
    }

    if (phase === '2_csv') {
      return ui.phase2Reply;
    }

    if (phase === '3a_per') {
      return ui.phase3aReply(userInput, taxSector.spiegazioneStrategia, taxSector.stratAggTitle, taxSector.stratPrudTitle);
    }

    if (phase === '3b_strat') {
      const isClassicalScenario = activeScenario?.type === 'classical';
      const locScen = activeScenario ? getLocalizedTestScenario(activeScenario, language) : null;
      const scenDisplay = locScen?.name || activeScenario?.name || '';

      if (isClassicalScenario) {
        const algoTarget = 'Python_HPC_' + (activeScenario?.modelCode || 'Pipeline');
        return `${ui.phase3bClassicalReply(userInput, scenDisplay)}

\`\`\`json
{
  "algoritmo_target": "${algoTarget}",
  "macro_scenario": "${activeScenario?.id || 'classico'}",
  "vincolo_stile": "nessun_vincolo",
  "periodo_target": "${selectedPeriod || ui.presets[1]?.val || '1 Trimestre'}",
  "conferma_avvio": true
}
\`\`\``;
      }

      const algoTarget = 'Qiskit_' + (activeScenario?.modelCode || 'QAOA');
      return `${ui.phase3bQuantumReply(userInput, scenDisplay)}

\`\`\`json
{
  "algoritmo_target": "${algoTarget}",
  "macro_scenario": "${activeScenario?.id || 'quantistico'}",
  "infrastruttura": "quantum",
  "periodo_target": "${selectedPeriod || ui.presets[1]?.val || '1 Trimestre'}",
  "conferma_avvio": true
}
\`\`\``;
    }

    if (phase === '4a_infra') {
      return ui.phase4cTitle;
    }

    if (phase === '4b_vinc') {
      const qPrefix = selectedInfra === 'quantum' ? 'Qiskit_' : 'Python_HPC_';
      const algoTarget = qPrefix + (activeScenario?.modelCode || 'QAOA');
      const msgLower = userInput.toLowerCase();

      const entProfile = getScenarioEntanglementProfile(activeSectorKey, activeScenario?.id || "", language);
      let style = entProfile.recommendedVincolo || 'blocco_rigido';

      if (msgLower.includes('nessun') || msgLower.includes('indipendent') || msgLower.includes('senza') || msgLower.includes('separabile') || msgLower.includes('none')) {
        style = 'nessun_vincolo';
      } else if (msgLower.includes('rigido') || msgLower.includes('hard')) {
        style = 'blocco_rigido';
      } else if (msgLower.includes('morbido') || msgLower.includes('soft')) {
        style = 'legame_morbido';
      } else if (msgLower.includes('applica') || msgLower.includes('entanglement') || msgLower.includes('vincol')) {
        style = 'blocco_rigido';
      }

      return `${ui.phase3bQuantumReply(userInput, activeScenario?.name || '')}

\`\`\`json
{
  "algoritmo_target": "${algoTarget}",
  "macro_scenario": "${activeScenario?.id || 'ottimizzazione'}",
  "vincolo_stile": "${style}",
  "periodo_target": "${selectedPeriod || ui.presets[1]?.val || '1 Trimestre'}",
  "conferma_avvio": true
}
\`\`\``;
    }

    return ui.phase5Banner;
  };

  const resolveSectorCanonicalKey = (text: string): string => {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();
    const keys = Object.keys(SECTOR_DATA);
    const exact = keys.find(k =>
      k.toLowerCase() === lower ||
      getLocalizedSectorName(k, language).toLowerCase() === lower
    );
    if (exact) return exact;
    const partial = keys.find(k =>
      lower.includes(k.toLowerCase()) ||
      lower.includes(getLocalizedSectorName(k, language).toLowerCase()) ||
      k.toLowerCase().includes(lower) ||
      getLocalizedSectorName(k, language).toLowerCase().includes(lower)
    );
    return partial || trimmed;
  };

  const resolveScenarioCanonical = (text: string): SectorScenario | null => {
    const lower = text.trim().toLowerCase();
    const allScenarios = Object.values(SECTOR_DATA).flatMap(d => d.scenarios);
    return allScenarios.find(s => {
      const locS = getLocalizedTestScenario(s, language);
      return (
        s.name.toLowerCase() === lower ||
        locS.name.toLowerCase() === lower ||
        lower.includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(lower) ||
        lower.includes(locS.name.toLowerCase()) ||
        locS.name.toLowerCase().includes(lower)
      );
    }) || null;
  };

  const executeSend = async (userMessage: string, forcePhaseNext?: '0_cat' | '1_scen' | '2_csv' | '3a_per' | '3b_strat' | '4a_infra' | '4b_vinc' | '4c_depth' | '4d_close' | '5_done') => {
    if (!userMessage.trim()) return;

    setInput('');
    const newMessages = [...messages, { role: 'user' as const, text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    const activePhase = currentPhase;
    let nextPhase = forcePhaseNext || currentPhase;
    let resolvedSectorForCall = selectedSector;
    let resolvedScenarioForCall = selectedScenario;
    let resolvedVincoloForCall: 'blocco_rigido' | 'legame_morbido' | 'nessun_vincolo' = selectedVincolo;

    if (activePhase === '0_cat') {
      const canonicalSector = resolveSectorCanonicalKey(userMessage);
      resolvedSectorForCall = canonicalSector;
      const isAllowed = isAgentAiCategoryAllowedForUser(liveUser, canonicalSector);
      const displaySector = getLocalizedSectorName(canonicalSector, language);
      if (!isAllowed) {
        setIsLoading(false);
        setCategoryDeniedModal({ isOpen: true, sectorName: displaySector });
        setMessages([
          ...messages,
          { role: 'user' as const, text: userMessage },
          { role: 'model' as const, text: ui.deniedChatMsg(displaySector) }
        ]);
        return;
      }
      setSelectedSector(canonicalSector);
      setAssetSector(canonicalSector);
      nextPhase = '1_scen';
    } else if (activePhase === '1_scen') {
      const matched = resolveScenarioCanonical(userMessage);
      resolvedScenarioForCall = matched;
      setSelectedScenario(matched);
      if (liveUser) {
        logUserAccess({
          userId: liveUser.id,
          username: liveUser.username,
          userRole: liveUser.role,
          type: 'view_page',
          actionName: `Visualizzazione Scenario: ${matched?.name || userMessage}`,
          viewDetail: `Modulo Agent AI: Categoria "${selectedSector}" - Scenario "${matched?.name || userMessage}"`,
          targetId: 'agent_ai_scenario',
          allowedIconsSnapshot: liveUser.allowedIcons,
          allowedCategoriesSnapshot: liveUser.allowedAgentAiCategories
        });
      }
      nextPhase = '2_csv';
    } else if (activePhase === '2_csv') {
      nextPhase = '3a_per';
    } else if (activePhase === '3a_per') {
      setSelectedPeriod(userMessage);
      nextPhase = '3b_strat';
    } else if (activePhase === '3b_strat') {
      setSelectedStrategy(userMessage);
      const isClassical = selectedScenario?.type === 'classical';
      if (isClassical) {
        resolvedVincoloForCall = 'nessun_vincolo';
        setSelectedInfra('classical');
        setSelectedVincolo('nessun_vincolo');
        setVincoloStile('nessun_vincolo');
        nextPhase = '5_done';
        setShowEndModal(true);
      } else {
        setSelectedInfra('quantum');
        const srcCsv1 = customCsv1Content ?? currentCsv1;
        const srcCsv2 = customCsv2Content ?? currentCsv2;
        let autoVincolo: 'blocco_rigido' | 'legame_morbido' | 'nessun_vincolo' = 'nessun_vincolo';
        if (srcCsv2) {
          try {
            const { risorse: rP, mappaQubit: mP } = parseCsv1Deterministic(srcCsv1);
            const mat = parseCsv2MatrixDeterministic(srcCsv2, rP, mP);
            let hasCrit = false;
            let hasSoft = false;
            for (let i = 0; i < mat.length; i++) {
              for (let j = 0; j < mat[i].length; j++) {
                if (i !== j) {
                  if (mat[i][j] >= 0.60) hasCrit = true;
                  else if (mat[i][j] > 0.0) hasSoft = true;
                }
              }
            }
            if (hasCrit) autoVincolo = 'blocco_rigido';
            else if (hasSoft) autoVincolo = 'legame_morbido';
            else autoVincolo = 'nessun_vincolo';
          } catch {
            autoVincolo = 'blocco_rigido';
          }
        }
        resolvedVincoloForCall = autoVincolo;
        setSelectedVincolo(autoVincolo);
        setVincoloStile(autoVincolo);
        nextPhase = '5_done';
        setShowEndModal(true);
      }
    } else if (
      activePhase === '4a_infra' ||
      activePhase === '4b_vinc' ||
      activePhase === '4c_depth' ||
      activePhase === '4d_close' ||
      userMessage === ui.phase4cBtn ||
      userMessage.includes('Avvia la simulazione') ||
      userMessage.includes('tutto perfetto')
    ) {
      nextPhase = '5_done';
      setShowEndModal(true);
    }

    const isStructuredSelection =
      (activePhase === '0_cat' && Boolean(userMessage)) ||
      (activePhase === '1_scen' && Boolean(userMessage)) ||
      (activePhase === '2_csv') ||
      (activePhase === '3a_per') ||
      (activePhase === '3b_strat') ||
      (activePhase === '4a_infra' || activePhase === '4b_vinc' || activePhase === '4c_depth' || activePhase === '4d_close' || userMessage === ui.phase4cBtn || userMessage.includes('Avvia la simulazione') || userMessage.includes('tutto perfetto'));

    if (isStructuredSelection) {
      if (activePhase === '3b_strat' || nextPhase === '5_done') {
        const currentStrategy = userMessage || selectedStrategy || 'Prudente';
        const targetAlgo = selectedScenario?.type === 'classical'
          ? 'Python_HPC_' + (selectedScenario?.modelCode || 'Pipeline')
          : 'Qiskit_' + (selectedScenario?.modelCode || 'QAOA');
        setTargetAlgoritmo(targetAlgo);
        const style = resolvedVincoloForCall || selectedVincolo || 'blocco_rigido';
        const finalExplanation = buildFinalOutcomeExplanation(
          targetAlgo,
          assetSector || selectedSector,
          style,
          selectedPeriod || ui.presets[1]?.val || '1 Trimestre',
          currentStrategy
        );
        setMessages(prev => [...prev, { role: 'model', text: finalExplanation, kind: 'sim_complete' }]);
        setCurrentPhase('5_done');
        setIsLoading(false);
        return;
      }

      const directReply = purgeParasiticStrings(generateArchitectResponse(activePhase, userMessage, resolvedSectorForCall, resolvedScenarioForCall));
      setMessages(prev => [...prev, { role: 'model', text: directReply }]);
      setCurrentPhase(nextPhase);
      setIsLoading(false);
      return;
    }

    try {
      const storedKey = getStoredApiKey();
      let replyText = '';

      const response = await axios.post('/api/test-chat', {
        messages: newMessages.map(({ role, text }) => ({ role, text })),
        systemPrompt: aiStudioPrompt,
        apiKey: storedKey,
        language
      });

      if (response.data && response.data.success && response.data.text) {
        replyText = response.data.text;
      } else {
        replyText = generateArchitectResponse(activePhase, userMessage, resolvedSectorForCall, resolvedScenarioForCall);
      }

      replyText = purgeParasiticStrings(replyText);

      let isSimDone = false;
      const jsonMatch = replyText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || replyText.match(/(\{[\s\S]*"algoritmo_target"[\s\S]*\})/);
      if (jsonMatch) {
        try {
          setFinalJson(jsonMatch[1]);
          const parsed = JSON.parse(jsonMatch[1]);
          const targetAlgo = parsed.algoritmo_target || (selectedInfra === 'quantum' ? 'Qiskit_QAOA' : 'Python_HPC_LSTM');
          const style = parsed.vincolo_stile || selectedVincolo || 'blocco_rigido';

          setTargetAlgoritmo(targetAlgo);
          setVincoloStile(style);

          const currentStrategy = (activePhase === '3b_strat' ? userMessage : selectedStrategy) || 'Prudente';
          const finalExplanation = buildFinalOutcomeExplanation(
            targetAlgo,
            assetSector || selectedSector,
            style,
            selectedPeriod || ui.presets[1]?.val || '1 Trimestre',
            currentStrategy
          );

          replyText = replyText.replace(jsonMatch[0], () => finalExplanation).replace(/```[\s\S]*?```/g, '').trim();
          nextPhase = '5_done';
          isSimDone = true;
          setShowEndModal(true);
        } catch (e) {
          // parsing error fallback
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: replyText, ...(isSimDone ? { kind: 'sim_complete' as const } : {}) }]);
      setCurrentPhase(nextPhase);
    } catch (error) {
      let fallbackReply = purgeParasiticStrings(generateArchitectResponse(activePhase, userMessage, resolvedSectorForCall, resolvedScenarioForCall));

      let isSimDone = false;
      const jsonMatch = fallbackReply.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || fallbackReply.match(/(\{[\s\S]*"algoritmo_target"[\s\S]*\})/);
      if (jsonMatch) {
        try {
          setFinalJson(jsonMatch[1]);
          const parsed = JSON.parse(jsonMatch[1]);
          const targetAlgo = parsed.algoritmo_target || (selectedInfra === 'quantum' ? 'Qiskit_QAOA' : 'Python_HPC_LSTM');
          const style = parsed.vincolo_stile || selectedVincolo || 'blocco_rigido';

          setTargetAlgoritmo(targetAlgo);
          setVincoloStile(style);

          const currentStrategy = (activePhase === '3b_strat' ? userMessage : selectedStrategy) || 'Prudente';
          const finalExplanation = buildFinalOutcomeExplanation(
            targetAlgo,
            assetSector || selectedSector,
            style,
            selectedPeriod || ui.presets[1]?.val || '1 Trimestre',
            currentStrategy
          );

          fallbackReply = fallbackReply.replace(jsonMatch[0], () => finalExplanation).replace(/```[\s\S]*?```/g, '').trim();
          nextPhase = '5_done';
          isSimDone = true;
          setShowEndModal(true);
        } catch (e) {
          // ignore
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: fallbackReply, ...(isSimDone ? { kind: 'sim_complete' as const } : {}) }]);
      setCurrentPhase(nextPhase);
    } finally {
      setIsLoading(false);
    }
  };

  const buildFinalOutcomeExplanation = (
    algo: string,
    sector: string,
    vincolo: string,
    periodo: string,
    stratOverride?: string
  ) => {
    const isNone = vincolo === 'nessun_vincolo' || vincolo.includes('nessun') || vincolo.includes('indipendent') || vincolo.includes('senza');
    const isHard = !isNone && (vincolo === 'blocco_rigido' || vincolo.includes('rigido') || vincolo.includes('hard'));

    const effectiveStrategy = stratOverride || selectedStrategy || 'Prudente';
    const effectiveSector = sector || selectedSector || 'Finanza e Mercati';
    const effectiveScenarioId = selectedScenario?.id || '';
    const isClassicalScenario = selectedScenario?.type === 'classical' || selectedInfra === 'classical' || algo.startsWith('Python_HPC_');

    const { csv1: genCsv1, csv2: genCsv2 } = getDemoCsvBySector(effectiveSector, effectiveScenarioId, vincolo, effectiveStrategy);
    const sourceCsv1 = customCsv1Content ?? genCsv1;
    const sourceCsv2 = customCsv2Content ?? genCsv2;
    const taxSector = getTaxonomicSector(effectiveSector, effectiveScenarioId, language);
    const localizedScenarioName = selectedScenario
      ? getLocalizedTestScenario(selectedScenario, language).name
      : taxSector.name;

    if (isClassicalScenario) {
      const classicalPyCode = generateClassicalHpcPythonCode(
        effectiveSector,
        effectiveScenarioId,
        'HPC / Classical Optimization Engine',
        sourceCsv1,
        sourceCsv2,
        effectiveStrategy,
        uploadedFile1Name,
        uploadedFile2Name,
        isDemoActive
      );
      setFinalQasm("");
      setFinalPython(classicalPyCode);
      setTheta(0);
      setPhi(0);

      const jsonObj = {
        settore: taxSector.name,
        scenario: localizedScenarioName,
        infrastruttura: "HPC / GPU / CPU Multi-Core",
        modello: selectedScenario?.modelCode || "Machine Learning / Pipeline Classica",
        strategia: effectiveStrategy,
        entanglement: "nessuno (calcolo convenzionale classico)",
        calcolo_quantistico: false,
        predisposizione_grafico: false
      };

      const jsonString = JSON.stringify(jsonObj, null, 2);
      setFinalJson(jsonString);
      pendingAutoDownloadRef.current = true;
      setShowEndModal(true);

      return ui.classicalDoneSummary(
        taxSector.name,
        localizedScenarioName,
        selectedScenario?.modelCode || 'HPC Pipeline',
        effectiveStrategy
      );
    }

    const qasmOut = generateQiskitCode(effectiveSector, sourceCsv1, sourceCsv2, vincolo, effectiveStrategy);
    // In TestPage.tsx, cerca la chiamata a generateQiskitPythonCode e aggiungi il parametro finale
    const pythonSnippet = generateQiskitPythonCode(
      effectiveSector,
      sourceCsv1,
      sourceCsv2,
      vincolo,
      effectiveStrategy,
      uploadedFile1Name,
      uploadedFile2Name,
      isDemoActive,
      selectedScenario?.modelCode || '' // <-- AGGIUNGI QUESTO
    );
    setFinalQasm(qasmOut);
    setFinalPython(pythonSnippet);

    let thetasArray: number[] = [];
    try {
      const { risorse } = parseCsv1Deterministic(sourceCsv1);
      thetasArray = risorse.slice(0, MAX_QUANTUM_QUBITS).map(r => {
        const p = Math.max(0.0, Math.min(1.0, r.peso));
        return parseFloat((2.0 * Math.asin(Math.sqrt(p))).toFixed(6));
      });
    } catch {
      thetasArray = [];
    }
    if (thetasArray.length === 0) {
      const qasmRyMatches = Array.from(qasmOut.matchAll(/^ry\(([\d.]+)\)\s+q\[\d+\];/gm)).map(m => parseFloat(parseFloat(m[1]).toFixed(6)));
      thetasArray = qasmRyMatches;
    }

    let thetaRad = thetasArray.length > 0 ? thetasArray[0] : 0.5;
    if (thetasArray.length === 0) {
      const matchPeso = pythonSnippet.match(/"peso":\s*([\d.]+)/);
      if (matchPeso) {
        const peso = parseFloat(matchPeso[1]);
        thetaRad = 2.0 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, peso))));
        thetasArray = [parseFloat(thetaRad.toFixed(6))];
      }
    }

    const angleTheta = Math.round((thetaRad * 180) / Math.PI);
    const anglePhi = (!isNone && !isHard) ? 90 : 0;
    setTheta(angleTheta);
    setPhi(anglePhi);

    const entanglementType = isNone ? "none" : (isHard ? "cx" : "cp");
    const phiRad = (anglePhi * Math.PI) / 180;

    const jsonObj = {
      settore: taxSector.name,
      scenario: localizedScenarioName,
      strategia: effectiveStrategy,
      entanglement: entanglementType,
      theta_radianti: parseFloat(thetaRad.toFixed(6)),
      thetas_radianti: thetasArray,
      phi_radianti: parseFloat(phiRad.toFixed(6)),
      predisposizione_grafico: true
    };

    const jsonString = JSON.stringify(jsonObj, null, 2);
    setFinalJson(jsonString);
    pendingAutoDownloadRef.current = true;
    setShowEndModal(true);

    if (liveUser) {
      logUserAccess({
        userId: liveUser.id,
        username: liveUser.username,
        userRole: liveUser.role,
        type: 'action',
        actionName: `Compilazione Quantistica (${taxSector.name} - ${selectedScenario?.name || 'Ottimizzazione'})`,
        viewDetail: `Generazione circuito quantistico Qiskit / OpenQASM 3.0 con strategia "${effectiveStrategy}" ed entanglement "${entanglementType}"`,
        targetId: 'quantum_compilation',
        allowedIconsSnapshot: liveUser.allowedIcons,
        allowedCategoriesSnapshot: liveUser.allowedAgentAiCategories
      });
    }

    const uiText = renderizzaInterfacciaUniversaleBlindata(jsonString, pythonSnippet, language);

    return `${uiText}

${ui.quantumFooterHint}`;
  };

  const handleSend = () => {
    executeSend(input);
  };

  const handleQuickClick = (text: string) => {
    executeSend(text);
  };

  const handleResetInterview = () => {
    pendingAutoDownloadRef.current = false;
    setMessages([{
      role: 'model',
      text: ui.welcomeMessage
    }]);
    setCurrentPhase('0_cat');
    setSelectedSector('');
    setSelectedScenario(null);
    setSelectedPeriod('');
    setSelectedStrategy('');
    setSelectedInfra('quantum');
    setSelectedVincolo('blocco_rigido');
    setTargetAlgoritmo('IDLE');
    setAssetSector('N/A');
    setCustomCsv1Content(null);
    setCustomCsv2Content(null);
    setUploadedFile1Name("1_anagrafica_risorse_guida.csv");
    setUploadedFile2Name("2_matrice_connessioni_guida.csv");
    setIsDemoActive(true);
    setCsvValidation(null);
    setUploadedFiles([]);
    setVincoloStile('N/A');
    setTheta(0);
    setPhi(0);
    setFinalQasm('');
    setFinalPython('');
    setFinalJson('');
    setShowEndModal(false);
  };

  const radTheta = (theta * Math.PI) / 180;
  const radPhi = (phi * Math.PI) / 180;
  const prob0 = Math.pow(Math.cos(radTheta / 2), 2);
  const prob1 = Math.pow(Math.sin(radTheta / 2), 2);
  const isQuantum = targetAlgoritmo.startsWith('Qiskit_');

  const getActionDescription = () => {
    if (targetAlgoritmo === 'IDLE') {
      return ui.idleBlochDesc;
    }
    const p0Pct = Math.round(prob0 * 100);
    const p1Pct = Math.round(prob1 * 100);
    const styleLabel = vincoloStile === 'blocco_rigido' ? ui.hardStyle : ui.softStyle;
    const displayAssetSector = assetSector && assetSector !== 'N/A'
      ? getLocalizedSectorName(assetSector, language)
      : ui.sectorsSummary;

    if (!isQuantum) {
      return ui.classicalBlochDesc(displayAssetSector, styleLabel);
    }
    if (theta === 0) {
      return ui.stableBlochDesc;
    }
    if (theta === 180) {
      return ui.alertBlochDesc;
    }
    return ui.activeBlochDesc(p0Pct, p1Pct, theta, phi, styleLabel);
  };

  const renderFormattedMessage = (text: string, msgKind?: 'csv_upload' | 'csv_confirm' | 'sim_complete' | 'demo_csv') => {
    const isCsvConfirm = msgKind === 'csv_confirm' || text.includes('[CONFERMA UFFICIALE: FILE CSV') || text.includes('[CONFERMA: DATASET CSV DEMO');
    const isSimulationComplete = msgKind === 'sim_complete' || text.includes('[SIMULAZIONE COMPLETATA');
    const isDemoCsvNotice = msgKind === 'demo_csv' || text.includes('[DEMO CSV]') || text.includes('Dataset Demo acquisito e scaricato sul tuo computer') || text.includes('[DATASET DEMO CSV CARICATO]');

    const parts = text.split(/(^\s*```[\s\S]*?```\s*$)/gm);
    const validParts = parts.filter(p => p.trim() !== '');
    const groupedParts = [];
    let currentGroup = [];

    for (let i = 0; i < validParts.length; i++) {
      const part = validParts[i];
      if (part.trim().startsWith('```') && part.trim().endsWith('```')) {
        currentGroup.push(part);
      } else {
        if (currentGroup.length > 0) {
          groupedParts.push({ type: 'code-group', blocks: currentGroup });
          currentGroup = [];
        }
        groupedParts.push({ type: 'text', content: part });
      }
    }
    if (currentGroup.length > 0) {
      groupedParts.push({ type: 'code-group', blocks: currentGroup });
    }

    return (
      <div className="flex flex-col gap-2.5">
        {isCsvConfirm && (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 font-bold text-xs uppercase tracking-wider shadow-sm">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>{ui.csvPassedHeader}</span>
          </div>
        )}
        {isDemoCsvNotice && (
          <div className="p-3 bg-cyan-950/70 border border-cyan-500/40 rounded-xl flex flex-col gap-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                <Download className="w-4 h-4 text-cyan-400" /> {ui.demoBannerTitle}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                {ui.demoBannerReady}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {ui.demoBannerHelp} <Copy className="inline w-3 h-3 text-slate-400" />:
            </p>
            <div className="p-2 mb-1 mt-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-300">
              💡 {ui.demoEntanglementNote}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <CsvButton filename="1_anagrafica_risorse_guida.csv" content={currentCsv1} label="1_anagrafica_risorse_guida.csv" />
              <CsvButton filename="2_matrice_connessioni_guida.csv" content={currentCsv2} label="2_matrice_connessioni_guida.csv" />
            </div>
          </div>
        )}
        {isSimulationComplete && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-300 font-bold text-xs uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{ui.simCompleteBanner}</span>
          </div>
        )}
        {groupedParts.map((group, idx) => {
          if (group.type === 'text') {
            return (
              <div key={idx} className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                {group.content}
              </div>
            );
          } else {
            return (
              <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch w-full">
                {group.blocks.map((part, bIdx) => {
                  const raw = part.trim().slice(3, -3).trim();
                  const firstNewline = raw.indexOf('\n');
                  let lang = 'code';
                  let codeContent = raw;
                  if (firstNewline !== -1) {
                    const possibleLang = raw.slice(0, firstNewline).trim();
                    if (/^[a-zA-Z0-9_-]+$/.test(possibleLang)) {
                      lang = possibleLang;
                      codeContent = raw.slice(firstNewline + 1);
                    }
                  }
                  let title = lang.toUpperCase();
                  if (lang.toLowerCase() === 'python') title = ui.codeBlockPythonTitle;
                  if (lang.toLowerCase() === 'qasm' || lang.toLowerCase().includes('qiskit')) title = ui.codeBlockQasmTitle;
                  if (lang.toLowerCase() === 'json') title = ui.codeBlockJsonTitle;

                  return (
                    <div key={bIdx} className="w-full min-w-0 h-full">
                      <CodeBlockWithCopy
                        code={codeContent}
                        language={lang}
                        title={title}
                      />
                    </div>
                  );
                })}
              </div>
            );
          }
        })}
      </div>
    );
  };

  const currentSectorData = selectedSector && SECTOR_DATA[selectedSector] ? SECTOR_DATA[selectedSector] : null;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full h-full text-white bg-slate-950 pb-12 sm:pb-14 overflow-hidden">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="px-3.5 py-1.5 border border-white/15 bg-white/5 hover:bg-white/10 text-white/90 rounded-md transition-all font-mono text-xs uppercase tracking-wider flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {ui.backHome}
          </button>
          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-sm font-semibold tracking-wide text-white">{ui.headerTitle}</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 ml-2">
              Gemini + Qiskit / HPC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {uploadedFiles.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{uploadedFiles.length} {ui.csvInMemory}</span>
              <label className="text-[10px] text-emerald-400 hover:text-emerald-200 underline cursor-pointer ml-1">
                {ui.replaceCsv}
                <input 
                  type="file" 
                  accept=".csv, .xlsx, .xls, .tsv, .txt" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => {
                    handleCsvUpload(e.target.files);
                    e.target.value = '';
                  }} 
                />
              </label>
            </div>
          )}
          <button
            onClick={handleCopyInterview}
            className="px-3 py-1.5 border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-cyan-200 rounded-md transition-all font-mono text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            title={ui.copyInterviewTooltip}
          >
            {copiedInterview ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="font-semibold">{copiedInterview ? ui.copiedInterview : ui.copyInterview}</span>
          </button>

          {(targetAlgoritmo !== 'IDLE' || currentPhase === '5_done') && (
            <>
              <button
                onClick={() => setShowEndModal(true)}
                className="px-3 py-1.5 border border-amber-500/60 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-md transition-all font-mono text-xs flex items-center gap-1.5 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)] cursor-pointer"
                title={ui.popupResultsTooltip}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{ui.popupResults}</span>
              </button>
              <button
                onClick={handleResetInterview}
                className="px-3 py-1.5 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-md transition-all font-mono text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {ui.newInterview}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden justify-center bg-slate-950/50 w-full px-4 py-2 sm:py-3">
        <div 
          style={{ maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}
          className="w-full max-w-4xl mx-auto h-full min-h-0 flex flex-col border border-white/15 rounded-2xl relative bg-slate-950/90 shadow-[0_10px_50px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          
          <div className={
            currentPhase === '0_cat'
              ? 'shrink-0 max-h-[30%] overflow-y-auto scrollbar-hide p-4 sm:p-5 flex flex-col gap-3'
              : 'flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3.5'
          }>
            {messages.map((msg, i) => {
              const isCsvUploadMsg = msg.kind === 'csv_upload' || msg.text.includes('[CARICAMENTO FILE CSV') || msg.text.includes('[CARICAMENTO DATASET DEMO');
              const isCsvConfirm = msg.kind === 'csv_confirm' || msg.text.includes('[CONFERMA UFFICIALE: FILE CSV') || msg.text.includes('[CONFERMA: DATASET CSV DEMO');
              const isSimComplete = msg.kind === 'sim_complete' || msg.text.includes('[SIMULAZIONE COMPLETATA');

              return (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-xl p-4 font-['Comfortaa'] font-light text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? isCsvUploadMsg 
                        ? 'bg-emerald-950/50 text-emerald-200 border-2 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40 shadow-sm' 
                      : isCsvConfirm
                        ? 'bg-emerald-950/30 text-slate-100 border-2 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : isSimComplete
                          ? 'bg-slate-900/95 text-slate-100 border-2 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                          : 'bg-slate-900/90 text-slate-100 border border-white/10 shadow-sm'
                  }`}>
                    {msg.role === 'model' && (
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10 text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
                        <span className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5" /> Solution Architect AI
                        </span>
                        {isCsvConfirm && (
                          <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-mono lowercase">
                            <CheckCircle2 className="w-3 h-3" /> {ui.csvValidatedBadge}
                          </span>
                        )}
                      </div>
                    )}
                    {renderFormattedMessage(msg.text, msg.kind)}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900/80 text-cyan-300 border border-cyan-500/30 rounded-xl px-4 py-3 font-mono text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> 
                  <span>{ui.processingArch}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={
            currentPhase === '0_cat'
              ? 'flex-1 min-h-0 border-t border-white/10 bg-slate-900/90 p-4 sm:p-5 flex flex-col justify-between gap-3 overflow-hidden'
              : 'shrink-0 max-h-[64vh] overflow-y-auto border-t border-white/10 bg-slate-900/90 p-3.5 sm:p-4 flex flex-col gap-2.5'
          }>
            
            {currentPhase === '0_cat' && (() => {
              const sectors = Object.keys(SECTOR_DATA);
              return (
                <div className="flex-1 min-h-0 flex flex-col gap-3">
                  <div className="shrink-0 flex items-center justify-between text-xs font-mono text-cyan-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> {ui.clickCategoryHeader}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">{ui.sectorsSummary}</span>
                  </div>
                  <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-4 gap-2.5 sm:gap-4 overflow-y-auto sm:overflow-visible scrollbar-hide">
                    {sectors.map((sector, idx) => {
                      const count = SECTOR_DATA[sector].scenarios.length;
                      const focusTags = Array.from(
                        new Set(SECTOR_DATA[sector].scenarios.map(s => getLocalizedTestScenario(s, language).focus))
                      ).slice(0, 3).join(' • ');
                      const localizedSectorName = getLocalizedSectorName(sector, language);
                      const isAllowed = isAgentAiCategoryAllowedForUser(liveUser, sector);
                      const isLastOdd = idx === sectors.length - 1 && sectors.length % 2 === 1;
                      return (
                        <button
                          key={sector}
                          onClick={() => {
                            if (!isAllowed) {
                              setCategoryDeniedModal({ isOpen: true, sectorName: localizedSectorName });
                              return;
                            }
                            handleQuickClick(localizedSectorName);
                          }}
                          disabled={isLoading}
                          className={`px-4 py-3 rounded-xl text-left font-mono text-xs transition-all flex items-center justify-between gap-3 group shadow-sm cursor-pointer ${
                            isLastOdd ? 'sm:col-span-2' : ''
                          } ${
                            isAllowed
                              ? 'bg-slate-800/90 hover:bg-cyan-950/80 hover:border-cyan-500/60 border border-white/15 text-white'
                              : 'bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-gray-300 opacity-80 hover:opacity-100 hover:border-red-500/60'
                          }`}
                          title={isAllowed ? `${ui.accessCategoryTitle} ${localizedSectorName}` : `${ui.restrictedCategoryTitle} ${localizedSectorName}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xl shrink-0">{SECTOR_DATA[sector].icon}</span>
                            <div className="flex flex-col min-w-0">
                              <span className={`truncate font-semibold text-xs sm:text-[13px] ${isAllowed ? 'group-hover:text-cyan-300 text-slate-100' : 'text-gray-400 group-hover:text-red-300'}`}>
                                {localizedSectorName}
                              </span>
                              <span className="truncate text-[10px] text-slate-400 font-normal mt-0.5">
                                {focusTags}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isAllowed && (
                              <span className="flex items-center gap-1 text-[9px] font-mono text-red-400 bg-red-500/15 border border-red-500/30 px-1.5 py-0.5 rounded font-bold">
                                <Lock className="w-2.5 h-2.5" />
                                <span className="hidden sm:inline">{ui.lockedBadge}</span>
                              </span>
                            )}
                            <span className="text-[10px] text-cyan-300/90 font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                              {count} {ui.scenariosCountWord}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {currentPhase === '1_scen' && currentSectorData && (() => {
              const query = scenarioSearch.toLowerCase().trim();
              const allScens = currentSectorData.scenarios.map(s => ({
                canonical: s,
                localized: getLocalizedTestScenario(s, language)
              }));
              const filteredScens = allScens.filter(({ canonical, localized }) => {
                return !query ||
                  localized.name.toLowerCase().includes(query) ||
                  localized.description.toLowerCase().includes(query) ||
                  localized.focus.toLowerCase().includes(query) ||
                  canonical.name.toLowerCase().includes(query) ||
                  canonical.modelCode.toLowerCase().includes(query);
              });
              const displaySelectedSector = getLocalizedSectorName(selectedSector, language);

              return (
                <div className="flex flex-col gap-2 max-h-72 sm:max-h-84 overflow-y-auto pr-1">
                  <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md py-1.5 z-10 flex flex-col gap-2 border-b border-white/10 pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-cyan-300 font-semibold gap-1">
                      <span className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-amber-400" /> {ui.chooseScenarioFor} {displaySelectedSector}:
                      </span>
                      <span className="text-[11px] text-amber-300/80 font-normal">
                        {ui.infraNote}
                      </span>
                    </div>

                    <div className="relative w-full">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={scenarioSearch}
                        onChange={(e) => setScenarioSearch(e.target.value)}
                        placeholder={`${ui.searchPlaceholderPrefix} ${displaySelectedSector} ${ui.searchPlaceholderExamples}`}
                        className="w-full bg-slate-950/90 border border-white/20 rounded-md pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                  
                  {filteredScens.length === 0 ? (
                    <div className="text-center py-6 text-xs font-mono text-slate-400">
                      {ui.noScenarioFound} "{scenarioSearch}".
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                      {filteredScens.map(({ canonical, localized }) => (
                        <button
                          key={canonical.id}
                          onClick={() => handleQuickClick(localized.name)}
                          disabled={isLoading}
                          className="px-3.5 py-2.5 bg-slate-800/85 hover:bg-slate-800 hover:border-cyan-500/60 border border-white/15 rounded-lg text-left font-mono text-xs text-white transition-all flex flex-col gap-1 group shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-100 group-hover:text-cyan-200 truncate">
                              {localized.name}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${
                                canonical.type === 'quantum'
                                  ? 'bg-purple-950/70 text-purple-300 border-purple-500/40'
                                  : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                              }`}>
                                {canonical.type === 'quantum' ? ui.quantumBadge : ui.classicalBadge}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-white/10 font-medium hidden sm:inline-block">
                                {localized.focus}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 group-hover:text-slate-300 line-clamp-1 leading-relaxed">
                            {localized.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {currentPhase === '2_csv' && (
              <div className="flex flex-col gap-2">
                <div className="text-xs font-mono text-cyan-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" /> {ui.phase2Title}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">{ui.phase2Privacy}</span>
                </div>

                {csvValidation && (
                  <div className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 shadow-md transition-all ${
                    csvValidation.valido
                      ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : csvValidation.partialMissing
                        ? 'bg-amber-950/70 border-amber-500/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                        : 'bg-red-950/70 border-red-500/80 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                  }`}>
                    {csvValidation.valido ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${csvValidation.partialMissing ? 'text-amber-400' : 'text-red-400'}`} />
                    )}
                    <div className="flex-1">
                      <div className="font-bold flex items-center justify-between gap-2">
                        <span>
                          {csvValidation.valido
                            ? ui.csvPassedHeader
                            : csvValidation.partialMissing === 'file2'
                              ? ui.csvSingleMissingFile2Header
                              : csvValidation.partialMissing === 'file1'
                                ? ui.csvSingleMissingFile1Header
                                : ui.csvFailedHeader}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider shrink-0 ${
                          csvValidation.valido
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : csvValidation.partialMissing
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-red-500/20 text-red-300'
                        }`}>
                          {csvValidation.valido
                            ? ui.csvPassedBadge
                            : csvValidation.partialMissing
                              ? ui.csvPartialBadge
                              : ui.csvFailedBadge}
                        </span>
                      </div>
                      <div className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                        {csvValidation.messaggio}
                      </div>
                      {csvValidation.valido && (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPhase('3a_per')}
                            className="px-3 py-1.5 bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 border border-emerald-400/50 rounded font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <span>{ui.proceedPhase3a}</span>
                          </button>
                        </div>
                      )}
                      {!csvValidation.valido && csvValidation.partialMissing === 'file2' && customCsv1Content !== null && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <button
                            onClick={handleProceedWithoutMatrix}
                            className="px-3 py-1.5 bg-amber-500/25 hover:bg-amber-500/40 text-amber-100 border border-amber-400/60 rounded font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <span>{ui.csvProceedWithoutMatrixBtn}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="px-4 py-3 bg-amber-500/25 hover:bg-amber-500/35 border-2 border-amber-500 text-amber-300 font-bold font-mono text-xs rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg animate-pulse">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span className="uppercase tracking-wider">{ui.uploadCsvBtn}</span>
                    <input 
                      type="file" 
                      accept=".csv, .xlsx, .xls, .tsv, .txt" 
                      multiple 
                      className="hidden" 
                      onChange={(e) => {
                        handleCsvUpload(e.target.files);
                        e.target.value = '';
                      }} 
                    />
                  </label>
                  <button
                    onClick={handleDemoCsv}
                    disabled={isLoading}
                    className="px-4 py-3 bg-cyan-950/80 hover:bg-cyan-900 border-2 border-cyan-500/70 text-cyan-200 hover:text-white font-bold font-mono text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/20"
                    title={ui.demoCsvTitle}
                  >
                    <Download className="w-4 h-4 text-cyan-400 animate-bounce" />
                    <span>{ui.demoCsvBtn}</span>
                  </button>
                </div>

                <div className="p-3 bg-gradient-to-r from-cyan-950/40 to-slate-900/60 border border-cyan-500/40 rounded-lg text-xs font-mono flex flex-col gap-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{ui.hwSpecTitle}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 leading-relaxed space-y-0.5">
                    <div>
                      • <strong className="text-cyan-200">{ui.hwSpecQuantumLabel}</strong> {ui.hwSpecQuantumBody}
                    </div>
                    <div>
                      • <strong className="text-emerald-300">{ui.hwSpecClassicalLabel}</strong> {ui.hwSpecClassicalBody}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-900/90 border border-white/10 rounded-lg text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{ui.downloadTemplatesPrompt}</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <CsvButton filename="1_anagrafica_risorse_guida.csv" content={currentCsv1} label="1_anagrafica.csv" />
                    <CsvButton filename="2_matrice_connessioni_guida.csv" content={currentCsv2} label="2_matrice.csv" />
                  </div>
                </div>
              </div>
            )}

            {currentPhase === '3a_per' && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> {ui.phase3aTitle}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">{ui.phase3aSub}</span>
                </div>

                <div className="p-3 bg-cyan-950/40 border-2 border-cyan-500/50 rounded-xl flex flex-col gap-2.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-cyan-400" /> {ui.calTitle}
                    </span>
                    {calculateDaysDifference(startDateInput, endDateInput) ? (
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                        ⚡ {calculateDaysDifference(startDateInput, endDateInput)} {ui.daysCalcSuffix}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {ui.dateErrBadge}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                        <span>{ui.startDateLabel}</span>
                        <span className="text-cyan-400 font-bold">({formatDateToIT(startDateInput)})</span>
                      </label>
                      <input
                        type="date"
                        value={startDateInput}
                        onChange={(e) => setStartDateInput(e.target.value)}
                        className="w-full bg-slate-950 border border-white/20 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs font-mono text-white cursor-pointer shadow-inner"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                        <span>{ui.endDateLabel}</span>
                        <span className="text-cyan-400 font-bold">({formatDateToIT(endDateInput)})</span>
                      </label>
                      <input
                        type="date"
                        value={endDateInput}
                        onChange={(e) => setEndDateInput(e.target.value)}
                        className="w-full bg-slate-950 border border-white/20 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs font-mono text-white cursor-pointer shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-cyan-500/20">
                    <span className="text-[11px] font-mono text-slate-300">
                      {ui.selectedRangePrefix} <strong className="text-cyan-300">{ui.fromWord} {formatDateToIT(startDateInput)} {ui.toWord} {formatDateToIT(endDateInput)}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyDateRange}
                      disabled={!calculateDaysDifference(startDateInput, endDateInput) || isLoading}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 disabled:opacity-40 text-slate-950 font-bold text-xs font-mono rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-slate-950" />
                      <span>{ui.confirmDatesPrefix} {ui.fromWord} {formatDateToIT(startDateInput)} {ui.toWord} {formatDateToIT(endDateInput)}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[11px] font-mono text-slate-400">{ui.orPresetWindow}</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ui.presets.map((p) => (
                      <button
                        key={p.val}
                        onClick={() => handleQuickClick(p.val)}
                        disabled={isLoading}
                        className="p-2.5 bg-slate-800/90 hover:bg-cyan-950 hover:border-cyan-500/60 border border-white/15 rounded-lg font-mono text-xs text-white transition-all text-left flex flex-col gap-0.5 group"
                      >
                        <span className="font-semibold text-cyan-200 group-hover:text-cyan-300">{p.label}</span>
                        <span className="text-[10px] text-slate-400">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-white/10 mt-0.5">
                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">{ui.orFreeText}</span>
                  <input
                    type="text"
                    value={customPeriodInput}
                    onChange={(e) => setCustomPeriodInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customPeriodInput.trim()) {
                        handleQuickClick(`${ui.customPeriodPrefix} ${customPeriodInput.trim()}`);
                        setCustomPeriodInput('');
                      }
                    }}
                    placeholder={ui.freeTextPlaceholder}
                    className="flex-1 bg-slate-950 border border-white/20 rounded-md px-3 py-1.5 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => {
                      if (customPeriodInput.trim()) {
                        handleQuickClick(`${ui.customPeriodPrefix} ${customPeriodInput.trim()}`);
                        setCustomPeriodInput('');
                      }
                    }}
                    disabled={!customPeriodInput.trim() || isLoading}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white font-bold text-xs font-mono rounded-md transition-all"
                  >
                    {ui.setBtn}
                  </button>
                </div>
              </div>
            )}

            {currentPhase === '3b_strat' && (
              (() => {
                const taxSector = getTaxonomicSector(selectedSector, selectedScenario?.id || "", language);

                return (
                  <div className="flex flex-col gap-2">
                    <div className="text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> {ui.phase3bTitle}
                    </div>
                    <div className="text-[11px] text-slate-300 italic mb-1">
                      {taxSector.spiegazioneStrategia}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => handleQuickClick(taxSector.stratAggTitle)}
                        disabled={isLoading}
                        className="px-3 py-2.5 bg-slate-800/90 hover:bg-amber-950/40 hover:border-amber-500/60 border border-amber-500/30 rounded-lg font-mono text-xs text-amber-200 transition-all text-left flex flex-col gap-0.5 shadow-sm"
                      >
                        <span className="font-bold">{taxSector.stratAggTitle}</span>
                        <span className="text-[10px] text-slate-400">{ui.stratAggDesc}</span>
                      </button>
                      <button
                        onClick={() => handleQuickClick(taxSector.stratPrudTitle)}
                        disabled={isLoading}
                        className="px-3 py-2.5 bg-slate-800/90 hover:bg-cyan-950/40 hover:border-cyan-500/60 border border-cyan-500/30 rounded-lg font-mono text-xs text-cyan-200 transition-all text-left flex flex-col gap-0.5 shadow-sm"
                      >
                        <span className="font-bold">{taxSector.stratPrudTitle}</span>
                        <span className="text-[10px] text-slate-400">{ui.stratPrudDesc}</span>
                      </button>
                    </div>
                  </div>
                );
              })()
            )}

            {currentPhase === '4c_close' && (
              <div className="flex flex-col gap-2">
                <div className="text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {ui.phase4cTitle}
                </div>
                <button
                  onClick={() => handleQuickClick(ui.phase4cBtn)}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {ui.phase4cBtn}
                </button>
              </div>
            )}

            {currentPhase === '5_done' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg gap-2 shadow-lg">
                <span className="text-xs font-mono text-emerald-300 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {ui.phase5Banner}
                </span>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowEndModal(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs font-mono rounded transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.25)] cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{ui.popupResults}</span>
                  </button>
                  {selectedScenario?.type !== 'classical' && selectedInfra !== 'classical' && (
                    <button
                      onClick={() => {
                        setShowEndModal(false);
                        const qCode = finalQasm || generateQiskitCode(assetSector || selectedSector || 'Finanza e Mercati', customCsv1Content ?? currentCsv1, customCsv2Content ?? currentCsv2, selectedVincolo, selectedStrategy || 'Prudente');
                        if (setSharedQasm) {
                          setSharedQasm(qCode);
                        }
                        if (onOpenIbm) {
                          onOpenIbm();
                        }
                      }}
                      className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs font-mono rounded border border-cyan-200 transition-all flex items-center gap-1.5 shadow-[0_0_18px_rgba(34,211,238,0.65)] animate-pulse cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{ui.sendToIbmBtn}</span>
                    </button>
                  )}
                  <button
                    onClick={handleResetInterview}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white rounded border border-white/20 transition-all cursor-pointer"
                  >
                    {ui.restartBtn}
                  </button>
                </div>
              </div>
            )}

            <div className="shrink-0 flex items-center gap-2 pt-1">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isLoading ? ui.inputPlaceholderLoading : ui.inputPlaceholderReady}
                className="flex-1 bg-slate-950 border border-white/20 rounded-lg px-4 py-2.5 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 font-semibold rounded-lg px-3.5 py-2.5 transition-all flex items-center gap-1 text-xs font-mono"
              >
                <Send className="w-3.5 h-3.5" /> {ui.sendBtn}
              </button>
            </div>
          </div>
        </div>
      </div>

      <EndInterviewModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        scenarioType={selectedScenario?.type || (selectedInfra === 'classical' ? 'classical' : 'quantum')}
        fonteDati={isDemoActive ? 'demo' : 'utente'}
        qasmCode={finalQasm || (selectedScenario?.type === 'classical' ? '' : generateQiskitCode(assetSector || selectedSector || 'Finanza e Mercati', customCsv1Content ?? currentCsv1, customCsv2Content ?? currentCsv2, selectedVincolo, selectedStrategy || 'Prudente'))}
        pythonCode={finalPython || (selectedScenario?.type === 'classical' 
        ? generateClassicalHpcPythonCode(assetSector || selectedSector || 'Finanza e Mercati', selectedScenario?.name || selectedScenario?.id || 'Scenario Classico', selectedScenario?.id || 'HPC-Model', customCsv1Content ?? currentCsv1, customCsv2Content ?? currentCsv2, selectedStrategy || 'Prudente', uploadedFile1Name, uploadedFile2Name, isDemoActive)
        : generateQiskitPythonCode(assetSector || selectedSector || 'Finanza e Mercati', customCsv1Content ?? currentCsv1, customCsv2Content ?? currentCsv2, selectedVincolo, selectedStrategy || 'Prudente', uploadedFile1Name, uploadedFile2Name, isDemoActive, selectedScenario?.modelCode || ''))}
        jsonCode={finalJson || JSON.stringify({
          settore: assetSector || selectedSector || 'Finanza e Mercati',
          scenario: selectedScenario?.name || 'Ottimizzazione',
          strategia: selectedStrategy || 'Prudente',
          entanglement: selectedVincolo === 'nessun_vincolo' ? 'none' : (selectedVincolo === 'blocco_rigido' ? 'cx' : 'cp'),
          theta_radianti: parseFloat(radTheta.toFixed(6)),
          thetas_radianti: [parseFloat(radTheta.toFixed(6))],
          phi_radianti: (phi * Math.PI) / 180,
          predisposizione_grafico: selectedScenario?.type !== 'classical'
        }, null, 2)}
        interviewText={fullInterviewText}
        onDownloadInterview={() => downloadInterviewTxt(buildCompleteBundleTxt(), true)}
        theta={theta}
        phi={phi}
        targetAlgoritmo={targetAlgoritmo !== 'IDLE' ? targetAlgoritmo : (selectedScenario?.type === 'classical' ? 'Python_HPC_' + (selectedScenario?.modelCode || 'Pipeline') : 'Qiskit_QAOA')}
        sector={assetSector || selectedSector || 'Finanza e Mercati'}
        onSendToIBM={() => {
          setShowEndModal(false);
          const qCode = finalQasm || generateQiskitCode(assetSector || selectedSector || 'Finanza e Mercati', customCsv1Content ?? currentCsv1, customCsv2Content ?? currentCsv2, selectedVincolo, selectedStrategy || 'Prudente');
          if (setSharedQasm) {
            setSharedQasm(qCode);
          }
          if (onOpenIbm) {
            onOpenIbm();
          }
        }}
      />

      {categoryDeniedModal?.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
          <div className="w-full max-w-md bg-[#0c1322] border-2 border-red-500/60 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.25)] flex flex-col text-white text-center items-center gap-4">
            <div className="p-3.5 bg-red-500/15 border border-red-500/40 rounded-2xl text-red-400">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold uppercase text-base sm:text-lg text-white">
                {ui.deniedModalTitle}
              </h3>
              <p className="text-xs font-mono text-gray-300 leading-relaxed">
                {ui.deniedModalDesc}
              </p>
              <div className="py-2 px-3 bg-red-500/10 border border-red-500/30 rounded-xl font-mono text-xs font-bold text-red-300">
                {categoryDeniedModal.sectorName}
              </div>
              <p className="text-[11px] font-sans text-gray-400 leading-relaxed">
                {ui.deniedModalNote}
              </p>
            </div>

            <button
              onClick={() => setCategoryDeniedModal(null)}
              className="w-full py-2.5 px-4 bg-red-600/80 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-lg cursor-pointer"
            >
              {ui.deniedModalBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function IbmQuantumComposerMockup({ targetAlgoritmo, getActionDescription }: { targetAlgoritmo: string, getActionDescription: () => string }) {
  const { language } = useTranslation();
  const ui = getAgentUi(language);
  return (
    <div className="bg-[#161616] border border-white/10 rounded-xl font-mono text-xs shadow-2xl flex flex-col relative overflow-hidden mt-4">
      <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 bg-[#1e1e1e] px-4 py-3">
        <Cpu className="w-4 h-4 text-[#33b1ff]" /> IBM Quantum Composer Visualizer
      </div>
      
      <div className="flex flex-col overflow-x-auto pb-8 pt-6 px-4 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="relative min-w-max px-2 flex flex-col gap-8">
          
          <div className="absolute top-[16px] left-6 right-0 h-[1px] bg-[#393939] z-0"></div>
          <div className="absolute top-[64px] left-6 right-0 h-[1px] bg-[#393939] z-0"></div>
          <div className="absolute top-[110px] left-6 right-0 h-[1px] bg-[#555] z-0"></div>
          <div className="absolute top-[114px] left-6 right-0 h-[1px] bg-[#555] z-0"></div>

          <div className="flex items-center gap-0 w-max relative z-10 h-8">
            <span className="font-sans text-[11px] text-[#8d96a0] w-6 text-right pr-3 shrink-0">0</span>
            
            <div className="flex items-center h-full">
              <div className="w-3"></div>
              <div className="w-8 h-8 flex items-center justify-center bg-[#ff5555] text-slate-900 font-sans font-medium text-[15px] shadow-sm">H</div>
              <div className="w-4"></div>
              <div className="w-8 flex justify-center relative">
                <div className="w-3 h-3 bg-[#33b1ff] rounded-full z-10 relative"></div>
                <div className="absolute top-1/2 left-1/2 w-[2px] h-[48px] bg-[#33b1ff] -translate-x-1/2 z-0"></div>
              </div>
              <div className="w-4"></div>
              <div className="w-8 h-8 flex flex-col items-center justify-center bg-[#8d96a0] text-slate-900 relative shadow-sm">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px] mt-0.5">
                   <path d="M12 15l-3-4m3 4v2m0-6a6 6 0 100 12 6 6 0 000-12z" stroke="none" fill="none"/>
                   <path d="M4 14a8 8 0 0116 0" />
                   <circle cx="12" cy="14" r="2" fill="currentColor"/>
                   <path d="M12 14l5-6" />
                 </svg>
                 <span className="absolute top-0 right-0.5 text-[8px] font-bold">z</span>
                 <div className="absolute top-full left-1/2 w-[1px] h-[64px] bg-[#8d96a0] -translate-x-1/2 z-0"></div>
                 <div className="absolute top-[calc(100%+60px)] left-1/2 border-l-[3px] border-r-[3px] border-t-[4px] border-transparent border-t-[#8d96a0] -translate-x-1/2"></div>
                 <span className="absolute top-[calc(100%+66px)] left-1/2 -translate-x-1/2 text-[10px] font-sans font-bold text-[#82cfff] bg-[#161616] px-1">0</span>
              </div>
              <div className="w-4"></div>
              <div className="w-8 h-8 flex items-center justify-center bg-[#ff7eb6] text-slate-900 font-sans font-medium text-[15px] shadow-sm">Y</div>
              <div className="w-4"></div>
              <div className="w-8 flex justify-center items-center relative">
                <div className="text-[#33b1ff] font-bold text-xl leading-none z-10 bg-[#161616] h-full flex items-center">✕</div>
                <div className="absolute top-1/2 left-1/2 w-[2px] h-[48px] bg-[#33b1ff] -translate-x-1/2 z-0"></div>
              </div>
              <div className="w-4"></div>
              <div className="w-8 h-8 flex items-center justify-center bg-[#82cfff] text-slate-900 font-sans font-medium text-[15px] shadow-sm">Z</div>
              <div className="w-4"></div>
              <div className="w-8 h-8 flex flex-col items-center justify-center bg-[#82cfff] text-slate-900 font-sans font-medium leading-[1.1] shadow-sm">
                <span className="text-[13px]">RZ</span>
                <span className="text-[8px] opacity-80">(π/2)</span>
              </div>
              <div className="w-4"></div>
              <div className="w-8 flex justify-center items-center relative">
                <div className="text-[#33b1ff] font-bold text-xl leading-none z-10 bg-[#161616] h-full flex items-center">✕</div>
                <div className="absolute top-1/2 left-1/2 w-[2px] h-[48px] bg-[#33b1ff] -translate-x-1/2 z-0"></div>
              </div>
              <div className="w-[116px]"></div>
              <div className="w-8 flex justify-center relative">
                <div className="w-3.5 h-3.5 bg-[#ff7eb6] rounded-full z-10 relative mt-2"></div>
                <div className="absolute top-1/2 left-1/2 w-[2px] h-[48px] bg-[#ff7eb6] -translate-x-1/2 z-0"></div>
                <div className="absolute top-full left-[calc(50%+6px)] text-[9px] text-[#ff7eb6] font-sans leading-[1] mt-1 whitespace-nowrap">
                  <div className="text-white">RZZ</div>
                  <div className="scale-90 origin-left mt-0.5">(π/2)</div>
                </div>
              </div>
              <div className="w-4"></div>
              <div className="w-8 h-8 flex items-center justify-center bg-[#ff7eb6] text-slate-900 font-sans font-medium text-[13px] shadow-sm">√X</div>
              <div className="w-4"></div>
              <div className="w-8 h-8 flex items-center justify-center bg-[#82cfff] text-slate-900 font-sans font-medium text-[15px] shadow-sm pt-1">S<sup className="-mt-2 text-[10px] font-bold">†</sup></div>
            </div>
          </div>

          <div className="flex items-center gap-0 w-max relative z-10 h-8">
            <span className="font-sans text-[11px] text-[#8d96a0] w-6 text-right pr-3 shrink-0">1</span>
            
            <div className="flex items-center h-full">
              <div className="w-[51px]"></div>
              <div className="w-8 flex justify-center relative z-10">
                <div className="w-[26px] h-[26px] bg-[#33b1ff] rounded-full flex items-center justify-center text-slate-900 font-medium text-2xl leading-none shadow-sm pb-0.5">+</div>
              </div>
              <div className="w-[44px]"></div>
              <div className="w-8 h-8 flex items-center justify-center bg-[#33b1ff] text-slate-900 font-sans font-medium text-[15px] shadow-sm">I</div>
              <div className="w-4"></div>
              <div className="w-8 flex justify-center items-center relative z-10">
                <div className="text-[#33b1ff] font-bold text-xl leading-none bg-[#161616] h-full flex items-center">✕</div>
              </div>
              <div className="w-[88px]"></div>
              <div className="w-8 flex justify-center items-center relative z-10">
                <div className="text-[#33b1ff] font-bold text-xl leading-none bg-[#161616] h-full flex items-center">✕</div>
              </div>
              <div className="w-4"></div>
              <div className="w-8 h-8 flex items-center justify-center bg-[#82cfff] text-slate-900 font-sans font-medium text-[15px] shadow-sm">S</div>
              <div className="w-4"></div>
              <div className="w-8 h-8 flex items-center justify-center bg-[#ff5555] text-slate-900 font-sans font-medium text-[15px] shadow-sm">H</div>
              <div className="w-4"></div>
              <div className="w-8 h-8 flex flex-col items-center justify-center bg-[#ff7eb6] text-slate-900 font-sans font-medium leading-[1.1] shadow-sm">
                <span className="text-[13px]">RY</span>
                <span className="text-[8px] opacity-80">(π/2)</span>
              </div>
              <div className="w-4"></div>
              <div className="w-8 flex justify-center relative z-10">
                <div className="w-3.5 h-3.5 bg-[#ff7eb6] rounded-full mt-2"></div>
              </div>
              <div className="w-4"></div>
              <div className="w-8 h-8 flex flex-col items-center justify-center bg-[#82cfff] text-slate-900 font-sans font-medium leading-[1.1] shadow-sm">
                <span className="text-[13px]">P</span>
                <span className="text-[8px] opacity-80">(π/2)</span>
              </div>
              <div className="w-4"></div>
              <div className="w-8 flex justify-center relative z-10">
                <div className="w-[26px] h-[26px] bg-[#33b1ff] rounded-full flex items-center justify-center text-slate-900 font-medium text-2xl leading-none shadow-sm pb-0.5">+</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-0 w-max relative z-10 h-6 mt-1">
            <span className="font-sans text-[11px] text-[#8d96a0] w-6 text-right pr-3 shrink-0">2</span>
            <div className="w-[600px]"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#1e1e1e] border-t border-white/5 p-3 px-4 flex justify-between items-center text-[11px] font-sans">
        <div className="text-slate-400 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${targetAlgoritmo !== 'IDLE' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse' : 'bg-slate-500'}`}></div>
          <span>{targetAlgoritmo !== 'IDLE' ? ui.composerCompiled : ui.composerIdle}</span>
        </div>
        <div className="text-slate-500 max-w-[60%] truncate text-right">
          {getActionDescription()}
        </div>
      </div>
    </div>
  );
}

export function IstogrammaQuantisticoUniversale({ theta_radianti, settore }: { theta_radianti: number; settore: string }) {
  const { language } = useTranslation();
  const ui = getAgentUi(language);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const p0 = Math.pow(Math.cos(theta_radianti / 2), 2);
  const p1 = Math.pow(Math.sin(theta_radianti / 2), 2);
  const count0 = Math.round(p0 * 1024);
  const count1 = Math.round(p1 * 1024);
  
  const h0 = Math.max(5, p0 * 100);
  const h1 = Math.max(5, p1 * 100);

  let label0 = ui.histDefault0;
  let label1 = ui.histDefault1;
  let gradientClass = "from-emerald-500 to-green-400";

  const taxId = getTaxonomicSector('', settore, language).id;
  const sLower = settore.toLowerCase();
  if (taxId === 'finanza' || sLower.includes("finanz")) {
    label0 = ui.histFin0;
    label1 = ui.histFin1;
    gradientClass = "from-emerald-500 to-green-400";
  } else if (taxId === 'chimica' || sLower.includes("chimic") || sLower.includes("farmaceutica") || sLower.includes("materiali")) {
    label0 = ui.histChem0;
    label1 = ui.histChem1;
    gradientClass = "from-purple-500 to-fuchsia-400";
  } else if (taxId === 'manifattura' || sLower.includes("produzion") || sLower.includes("manifattura")) {
    label0 = ui.histMan0;
    label1 = ui.histMan1;
    gradientClass = "from-blue-500 to-cyan-400";
  } else if (taxId === 'sicurezza' || sLower.includes("sicurezz") || sLower.includes("telecomunicazion") || sLower.includes("reti")) {
    label0 = ui.histSec0;
    label1 = ui.histSec1;
    gradientClass = "from-amber-500 to-orange-400";
  } else if (taxId === 'sanita' || sLower.includes("sanità") || sLower.includes("sanita") || sLower.includes("genomica")) {
    label0 = ui.histSan0;
    label1 = ui.histSan1;
    gradientClass = "from-rose-500 to-red-400";
  }

  return (
    <div className="bg-[#161616] border border-white/10 rounded-xl font-mono text-xs shadow-2xl flex flex-col mt-4 overflow-hidden">
      <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between border-b border-white/5 bg-[#1e1e1e] px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#33b1ff]" /> {ui.histTitle}
        </div>
      </div>
      
      <div className="p-5 flex flex-col h-[280px]">
        <div className="flex-1 flex items-end justify-center gap-16 pb-2 border-b border-white/20 relative">
          
          <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
            <div className="border-b border-white w-full h-0"></div>
            <div className="border-b border-white w-full h-0"></div>
            <div className="border-b border-white w-full h-0"></div>
            <div className="border-b border-white w-full h-0"></div>
            <div className="border-b border-white w-full h-0"></div>
          </div>

          <div className="flex flex-col items-center gap-2 z-10 w-24">
            <span className="text-cyan-300 font-bold">{count0}</span>
            <div className="w-full bg-slate-800 rounded-t-md flex items-end justify-center overflow-hidden h-[180px]">
              <div 
                className={`w-full bg-gradient-to-t ${gradientClass} transition-all duration-1000 ease-out rounded-t-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]`} 
                style={{ height: mounted ? `${h0}%` : '0%' }}
              ></div>
            </div>
            <div className="bg-slate-900 border border-white/10 px-2 py-1 rounded text-center min-h-[36px] flex flex-col justify-center w-32 -mx-4">
              <span className="text-white font-bold text-sm">|0⟩</span>
              <span className="text-[9px] text-slate-400 leading-tight mt-0.5">{label0}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 z-10 w-24">
            <span className="text-cyan-300 font-bold">{count1}</span>
            <div className="w-full bg-slate-800 rounded-t-md flex items-end justify-center overflow-hidden h-[180px]">
              <div 
                className={`w-full bg-gradient-to-t ${gradientClass} opacity-70 transition-all duration-1000 ease-out rounded-t-sm shadow-[0_0_10px_rgba(255,255,255,0.05)]`} 
                style={{ height: mounted ? `${h1}%` : '0%' }}
              ></div>
            </div>
            <div className="bg-slate-900 border border-white/10 px-2 py-1 rounded text-center min-h-[36px] flex flex-col justify-center w-32 -mx-4">
              <span className="text-white font-bold text-sm">|1⟩</span>
              <span className="text-[9px] text-slate-400 leading-tight mt-0.5">{label1}</span>
            </div>
          </div>
          
        </div>
      </div>
      
      <div className="bg-[#1e1e1e] border-t border-white/5 p-3 px-4 flex justify-between items-center text-[11px] font-sans">
        <div className="text-slate-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></div>
          <span>{ui.histCompleted}</span>
        </div>
      </div>
    </div>
  );
}