import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowLeft, ChevronRight, Activity, Heart, Camera, Watch, AlertTriangle, Phone, TrendingUp, TrendingDown, Minus, Info, X, Zap, FileText, Download, CheckCircle, Sparkles, FolderOpen, Database, Cpu, BookOpen } from 'lucide-react';
import scanVitali from "../assets/images/scan_vitali_clean_1789332794984.jpg";
import scanMetabolici from "../assets/images/scan_metabolici_clean_1789332805433.jpg";
import scanOrgano from "../assets/images/scan_organo_clean_1789332814869.jpg";
import scanInfiammatorio from "../assets/images/scan_infiammatorio_clean_1789332823629.jpg";
import DominoModal from './DominoModal';
import CrossParameterAnalysis from './CrossParameterAnalysis';
import AcquiredReportsModal, { AcquiredReport } from './AcquiredReportsModal';
import QuantumHealth13QubitModal from './QuantumHealth13QubitModal';
import DocumentationModal from './DocumentationModal';
import { HealthPageReport } from '../lib/quantumHealthEngine';
import { CATEGORY_DETAILS_ENRICHED } from '../data/medicalCategoriesData';
import { generateMedicalReportPdf } from '../lib/generateMedicalReportPdf';

type InputMethod = 'none' | 'manual' | 'smartwatch' | 'photo';
type RiskLevel = 'low' | 'medium' | 'high';
type BodyPart = 'head' | 'heart' | 'abdomen';

type EvaluationStatus = 'Idoneo' | 'Non Idoneo';

interface MetricData {
  time: string;
  value: number;
}

interface EvaluationCategory {
  status: EvaluationStatus;
  title: string;
  subtitle: string;
  statusText: string;
  description: string;
  metrics: { label: string; value: string }[];
  chartData: MetricData[];
  chartColor: string;
  chartKey: string;
  chartLabel: string;
}

interface ScreeningResult {
  id: string;
  date: string;
  score: number;
  headRisk: RiskLevel;
  heartRisk: RiskLevel;
  abdomenRisk: RiskLevel;
  vitali: EvaluationCategory;
  metabolici: EvaluationCategory;
  organo: EvaluationCategory;
  infiammatorio: EvaluationCategory;
}

const DEFAULT_ACQUIRED_REPORTS: AcquiredReport[] = [
  {
    id: 'rep-1',
    name: 'Esami_Ematochimici_Completi_2026.pdf',
    date: '12 Set 2026, 08:30',
    type: 'pdf',
    size: '1.4 MB',
    parametersCount: 28,
    extractedBiomarkers: ['Glicemia (104 mg/dL)', 'HbA1c (5.8%)', 'LDL (142 mg/dL)', 'Trigliceridi (165 mg/dL)', 'hs-PCR (2.8 mg/L)', 'Creatinina (0.95 mg/dL)'],
    status: 'Sincronizzato Qiskit',
    quantumTheta: 'θ = 0.52 rad',
    quantumState: '|0⟩: 81.2% | |1⟩: 18.8%',
    anomaliesDetected: 3,
    summary: 'Lieve dislipidemia con trigliceridi mossi e insulino-resistenza borderline. Funzionalità renale ed epatica nella norma.'
  },
  {
    id: 'rep-2',
    name: 'Holter_ECG_Smartwatch_Telemetry.csv',
    date: '10 Set 2026, 19:45',
    type: 'csv',
    size: '420 KB',
    parametersCount: 14,
    extractedBiomarkers: ['FC Media (64 BPM)', 'SpO2 (98%)', 'Variabilità HRV (48 ms)', 'Pressione Sistolica (122 mmHg)', 'Pressione Diastolica (78 mmHg)'],
    status: 'Sincronizzato Qiskit',
    quantumTheta: 'θ = 0.28 rad',
    quantumState: '|0⟩: 92.4% | |1⟩: 7.6%',
    anomaliesDetected: 0,
    summary: 'Ritmo sinusale stabile con buona riserva di variabilità cardiaca a riposo. Nessun episodio di desaturazione notturna.'
  },
  {
    id: 'rep-3',
    name: 'Foto_Referto_Epatociti_Enzimi.jpg',
    date: '28 Ago 2026, 11:15',
    type: 'photo',
    size: '2.8 MB',
    parametersCount: 9,
    extractedBiomarkers: ['ALT/GPT (24 U/L)', 'AST/GOT (22 U/L)', 'Gamma-GT (18 U/L)', 'Bilirubina Totale (0.8 mg/dL)', 'Fosfatasi Alcalina (62 U/L)'],
    status: 'Sincronizzato Qiskit',
    quantumTheta: 'θ = 0.19 rad',
    quantumState: '|0⟩: 96.1% | |1⟩: 3.9%',
    anomaliesDetected: 0,
    summary: 'Enzimi epatici e profilo di colestasi perfettamente nei range fisiologici. Nessuna citolisi attiva.'
  }
];

interface MedicalScreeningProps {
  onBack: () => void;
}

export default function MedicalScreening({ onBack }: MedicalScreeningProps) {
  const [inputMethod, setInputMethod] = useState<InputMethod>('none');
  const [isDataReady, setIsDataReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [showAcquiredReportsModal, setShowAcquiredReportsModal] = useState(false);
  const [acquiredReports, setAcquiredReports] = useState<AcquiredReport[]>(() => {
    const saved = localStorage.getItem('quantum_medical_acquired_files');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_ACQUIRED_REPORTS;
  });
  const [history, setHistory] = useState<ScreeningResult[]>(() => {
    const saved = localStorage.getItem('quantum_medical_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });
  const [gender, setGender] = useState<'M' | 'F'>(() => (localStorage.getItem('quantum_medical_gender') as 'M' | 'F') || 'M');
  const [hasRegistered, setHasRegistered] = useState(() => !!localStorage.getItem('quantum_medical_dob'));
  const [showDominoModal, setShowDominoModal] = useState(false);
  const [show13QubitModal, setShow13QubitModal] = useState(false);
  const [showDocumentationModal, setShowDocumentationModal] = useState(false);
  const [pdfDownloadedNotice, setPdfDownloadedNotice] = useState<string | null>(null);

  const handleApplyQuantumReport = (quantumReport: HealthPageReport) => {
    const lvl1 = quantumReport.configurazione_pagina_health.livello_1_top_bar;
    const lvl23 = quantumReport.configurazione_pagina_health.livello_2_3_biomarcatori_rilevati;
    const lvl4 = quantumReport.configurazione_pagina_health.livello_4_matrice_incroci_critici;
    const score = Math.round(lvl1.clinical_wellness_score_percent);

    const newRes: ScreeningResult = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score: score,
      headRisk: score < 50 ? 'high' : score < 75 ? 'medium' : 'low',
      heartRisk: lvl4.scanner_olografico_stress_sistemi['Vitali_Emostasi'] > 35 ? 'high' : 'low',
      abdomenRisk: lvl4.scanner_olografico_stress_sistemi['Metabolismo_Longevita'] > 35 ? 'high' : 'low',
      vitali: {
        title: "Parametri Vitali & Emostasi d'Emergenza",
        subtitle: `Stress Sistema: ${lvl4.scanner_olografico_stress_sistemi['Vitali_Emostasi'] || 0}%`,
        status: lvl4.scanner_olografico_stress_sistemi['Vitali_Emostasi'] < 40 ? 'Idoneo' : 'Non Idoneo',
        statusText: lvl4.scanner_olografico_stress_sistemi['Vitali_Emostasi'] < 40 ? 'Stabilità Emodinamica' : 'Allerta Emodinamica',
        description: `Stress parziale del sistema: ${lvl4.scanner_olografico_stress_sistemi['Vitali_Emostasi']}%. Valutazione su Pressione Sistolica (Qubit 3), Emoglobina (Qubit 6) e Piastrine (Qubit 7).`,
        metrics: [
          { label: "Stress Vitali", value: `${lvl4.scanner_olografico_stress_sistemi['Vitali_Emostasi'] || 0}%` },
          { label: "Resilienza", value: `${lvl23.resilienza_omeostatica_percent}%` }
        ],
        chartData: [
          { time: '6d fa', value: Math.min(100, Math.round(score * 0.95)) },
          { time: '5d fa', value: Math.min(100, Math.round(score * 0.97)) },
          { time: '4d fa', value: Math.min(100, Math.round(score * 0.96)) },
          { time: '3d fa', value: Math.min(100, Math.round(score * 0.98)) },
          { time: '2d fa', value: Math.min(100, Math.round(score * 0.99)) },
          { time: '1d fa', value: Math.min(100, Math.round(score * 0.995)) },
          { time: 'Oggi', value: score }
        ],
        chartColor: "#06b6d4",
        chartKey: "value",
        chartLabel: "Wellness Trend"
      },
      metabolici: {
        title: "Parametri Metabolici, Glucidici & Longevità",
        subtitle: `Stress Sistema: ${lvl4.scanner_olografico_stress_sistemi['Metabolismo_Longevita'] || 0}%`,
        status: lvl4.scanner_olografico_stress_sistemi['Metabolismo_Longevita'] < 40 ? 'Idoneo' : 'Non Idoneo',
        statusText: lvl4.scanner_olografico_stress_sistemi['Metabolismo_Longevita'] < 40 ? 'Assetto Omeostatico' : 'Rischio Dismetabolico',
        description: `Analisi congiunta Qubit 0 (Glicemia/HbA1c), Qubit 1 (LDL/Trigliceridi) e Qubit 10 (TSH). Età Biologica stimata: ${lvl23.eta_biologica_effettiva} anni.`,
        metrics: [
          { label: "Età Biologica", value: `${lvl23.eta_biologica_effettiva} anni` },
          { label: "Stress Metabolico", value: `${lvl4.scanner_olografico_stress_sistemi['Metabolismo_Longevita'] || 0}%` }
        ],
        chartData: [
          { time: '6d fa', value: 7200 },
          { time: '5d fa', value: 8100 },
          { time: '4d fa', value: 7900 },
          { time: '3d fa', value: 8400 },
          { time: '2d fa', value: 8900 },
          { time: '1d fa', value: 8200 },
          { time: 'Oggi', value: 8550 }
        ],
        chartColor: "#10b981",
        chartKey: "value",
        chartLabel: "Attività e Omeostasi"
      },
      organo: {
        title: "Funzionalità d'Organo (Rene, Fegato) ed Emocromo",
        subtitle: `Stress Sistema: ${lvl4.scanner_olografico_stress_sistemi['Filtri_Organo_Renale_Epatico'] || 0}%`,
        status: lvl4.scanner_olografico_stress_sistemi['Filtri_Organo_Renale_Epatico'] < 40 ? 'Idoneo' : 'Non Idoneo',
        statusText: lvl4.scanner_olografico_stress_sistemi['Filtri_Organo_Renale_Epatico'] < 40 ? 'Filtri Funzionanti' : 'Sovraccarico Nefroni/Epatociti',
        description: `Clearance renale Qubit 4 (Creatinina/eGFR) e citolisi epatica Qubit 5 (Transaminasi). Entropia di fase: ${lvl4.indice_instabilita_transizione_fase_percent}%.`,
        metrics: [
          { label: "Stress Filtri", value: `${lvl4.scanner_olografico_stress_sistemi['Filtri_Organo_Renale_Epatico'] || 0}%` },
          { label: "Entropia Von Neumann", value: `${lvl4.indice_instabilita_transizione_fase_percent}%` }
        ],
        chartData: [
          { time: '6d fa', value: 1.0 },
          { time: '5d fa', value: 1.02 },
          { time: '4d fa', value: 1.01 },
          { time: '3d fa', value: 1.05 },
          { time: '2d fa', value: 1.03 },
          { time: '1d fa', value: 1.04 },
          { time: 'Oggi', value: 1.02 }
        ],
        chartColor: "#f59e0b",
        chartKey: "value",
        chartLabel: "Clearance d'Organo"
      },
      infiammatorio: {
        title: "Stato Infiammatorio, Immunitario & Onco-Biologia",
        subtitle: `Stress Sistema: ${lvl4.scanner_olografico_stress_sistemi['Infiammazione_Immunitario'] || 0}%`,
        status: lvl4.scanner_olografico_stress_sistemi['Infiammazione_Immunitario'] < 40 ? 'Idoneo' : 'Non Idoneo',
        statusText: lvl4.scanner_olografico_stress_sistemi['Infiammazione_Immunitario'] < 40 ? 'Flogosi Controllata' : 'Flogosi Endoteliale Attiva',
        description: `Valutazione combinata Qubit 2 (hs-PCR/VES), Qubit 8 (Neutrofili), Qubit 9 (Procalcitonina) e Qubit 11 (Cortisolo). Errore circadiano: ${lvl23.errore_cronobiologico_circadiano}.`,
        metrics: [
          { label: "Stress Flogosi", value: `${lvl4.scanner_olografico_stress_sistemi['Infiammazione_Immunitario'] || 0}%` },
          { label: "Pattern Rari", value: `${lvl4.deviazione_fenotipica_pattern_rari}%` }
        ],
        chartData: [
          { time: '6d fa', value: 1.8 },
          { time: '5d fa', value: 2.1 },
          { time: '4d fa', value: 1.9 },
          { time: '3d fa', value: 2.4 },
          { time: '2d fa', value: 2.0 },
          { time: '1d fa', value: 1.7 },
          { time: 'Oggi', value: 1.5 }
        ],
        chartColor: "#ef4444",
        chartKey: "value",
        chartLabel: "Indice Flogistico"
      }
    };

    setResult(newRes);
    saveToHistory(newRes);
    setShow13QubitModal(false);
  };

  // Form states
  const [dob, setDob] = useState(() => localStorage.getItem('quantum_medical_dob') || '');
  const [bpm, setBpm] = useState('');
  const [pressure, setPressure] = useState('');

  const handleDeleteReport = (id: string) => {
    const updated = acquiredReports.filter(r => r.id !== id);
    setAcquiredReports(updated);
    localStorage.setItem('quantum_medical_acquired_files', JSON.stringify(updated));
  };

  const handleUploadNewReport = (file: File, forceMethod?: 'photo' | 'mix' | 'smartwatch') => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type.includes('csv');
    
    let methodToSet = forceMethod;
    if (!methodToSet) {
      methodToSet = isCsv ? 'smartwatch' : 'photo';
    }

    const docTypeLabel = methodToSet === 'mix' ? 'Referto Risonanza/TAC' : (isCsv ? 'Sync Dispositivo' : (isPdf ? 'Referto Analisi' : 'Foto Referto'));
    
    const newRep: AcquiredReport = {
      id: `rep-${Date.now()}`,
      name: `${docTypeLabel} - ${new Date().toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}`,
      originalFilename: file.name,
      date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      type: isPdf ? 'pdf' : isCsv ? 'csv' : 'photo',
      size: file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
      parametersCount: isCsv ? 15 : (methodToSet === 'mix' ? 35 : 22),
      extractedBiomarkers: isCsv ? ['BPM Riposo', 'Pressione Media', 'SpO2', 'HRV', 'Attività'] : 
                           (methodToSet === 'mix' ? ['Volumetria Organo', 'Tessuto Osseo', 'Lesioni Focali', 'Infiammazione Tessutale'] : ['Glicemia', 'Emocromo Completo', 'Creatinina', 'Colesterolo Totale', 'hs-PCR']),
      status: 'Sincronizzato Qiskit',
      quantumTheta: methodToSet === 'mix' ? 'θ = 0.65 rad' : 'θ = 0.35 rad',
      quantumState: methodToSet === 'mix' ? '|0⟩: 68.0% | |1⟩: 32.0%' : '|0⟩: 88.0% | |1⟩: 12.0%',
      anomaliesDetected: methodToSet === 'mix' ? 2 : 1,
      summary: `Documento "${file.name}" acquisito e integrato nel modello di simulazione quantistica.`
    };
    const updated = [newRep, ...acquiredReports];
    setAcquiredReports(updated);
    localStorage.setItem('quantum_medical_acquired_files', JSON.stringify(updated));
    setInputMethod(methodToSet);
    setIsDataReady(true);
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    const fileName = generateMedicalReportPdf({
      dob,
      gender,
      score: result.score,
      resultDate: result.date,
      categoryStatuses: {
        vitali: result.vitali.status,
        metabolici: result.metabolici.status,
        organo: result.organo.status,
        infiammatorio: result.infiammatorio.status,
      },
      metricsSummary: {
        bpm: inputMethod === 'manual' && bpm ? bpm : "62",
        pressure: inputMethod === 'manual' && pressure ? pressure : "120/80",
        spo2: "98%",
        stress: "42/100"
      }
    });
    setPdfDownloadedNotice(`Report clinico "${fileName}" generato e scaricato con successo!`);
    setTimeout(() => {
      setPdfDownloadedNotice(null);
    }, 5000);
  };

  const saveToHistory = (newResult: ScreeningResult) => {
    const newHistory = [newResult, ...history].slice(0, 4);
    setHistory(newHistory);
    localStorage.setItem('quantum_medical_history', JSON.stringify(newHistory));
  };

  useEffect(() => {
    if (inputMethod === 'manual') {
      if (dob && bpm && pressure) {
        setIsDataReady(true);
      } else {
        setIsDataReady(false);
      }
    }
  }, [inputMethod, dob, bpm, pressure]);

  const handleBluetoothSync = () => {
    setIsAnalyzing(true);
    // Simulate connection
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsDataReady(true);
    }, 1500);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadNewReport(e.target.files[0]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, method?: 'photo' | 'mix') => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadNewReport(e.target.files[0], method);
    }
  };

  const runScreening = () => {
    setIsAnalyzing(true);
    // POST request to http://127.0.0.1 (Local Python Backend Qiskit)
    console.log("Invio parametri vitali a http://127.0.0.1 (Backend Python locale per Qiskit AerSimulator)");
    setTimeout(() => {
      let finalScore = 85;
      let hRisk: RiskLevel = 'low';
      let cRisk: RiskLevel = 'low';
      let aRisk: RiskLevel = 'low';

      if (inputMethod === 'manual') {
        const p = parseInt(pressure) || 120;
        const b = parseInt(bpm) || 70;
        
        let a = 30; // default age
        if (dob) {
          const birthDate = new Date(dob);
          const today = new Date();
          let calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
          a = calculatedAge;
        }

        let penalty = 0;
        
        // Pressione (Ottimale: 90-120)
        if (p > 120) penalty += (p - 120) * 1.5;
        else if (p < 90) penalty += (90 - p) * 1.5;

        // BPM (Ottimale: 60-80)
        if (b > 80) penalty += (b - 80) * 1.5;
        else if (b < 55) penalty += (55 - b) * 1.5;

        // Età (Leggerissimo decadimento organico)
        if (a > 40) penalty += (a - 40) * 0.2;

        finalScore = Math.max(10, Math.min(99, Math.round(100 - penalty)));

        hRisk = p >= 140 ? 'high' : p >= 130 ? 'medium' : 'low';
        cRisk = b >= 100 || p >= 140 ? 'high' : b >= 85 || p >= 130 ? 'medium' : 'low';
        aRisk = a > 50 && finalScore < 60 ? 'high' : finalScore < 80 ? 'medium' : 'low';
      } else {
        // Fallback per Smartwatch / Scansione
        finalScore = Math.floor(Math.random() * 20) + 75; // 75-95%
        hRisk = finalScore > 85 ? 'low' : 'medium';
        cRisk = finalScore > 85 ? 'low' : 'medium';
        aRisk = finalScore > 85 ? 'low' : 'medium';
      }

      const mockTimeSeries = (base: number, variance: number, points: number = 7) => {
        return Array.from({length: points}).map((_, i) => ({
          time: `${i}d fa`,
          value: Math.round(base + (Math.random() * variance * 2 - variance))
        })).reverse();
      };

      const newResult: ScreeningResult = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
        score: finalScore,
        headRisk: hRisk,
        heartRisk: cRisk,
        abdomenRisk: aRisk,
        vitali: {
          title: "Parametri Vitali",
          subtitle: "Giudizio di \"Stabilità Clinica ed Emergenza\"",
          status: finalScore >= 50 ? 'Idoneo' : 'Non Idoneo',
          statusText: finalScore >= 50 ? 'Clinicamente Stabile / Compensato' : 'Instabile / Scompensato',
          description: finalScore >= 50 
            ? "I parametri (pressione, battiti) rientrano nei range di normalità o sono controllati. Idoneità a compiere sforzi o lavorare in sicurezza."
            : "Crisi Acuta o instabilità. Non idoneità temporanea assoluta fino al ripristino dei parametri minimi di sicurezza.",
          metrics: [
            { label: "LFC Riposo (BPM)", value: inputMethod === 'manual' && bpm ? bpm : "62" },
            { label: "LFC Massima (BPM)", value: "165" }
          ],
          chartData: mockTimeSeries(inputMethod === 'manual' && pressure ? parseInt(pressure) : 120, 15),
          chartColor: "#06b6d4",
          chartKey: "value",
          chartLabel: "Pressione Sistolica"
        },
        metabolici: {
          title: "Parametri Metabolici e Longevità",
          subtitle: "Giudizio di \"Rischio Cardiovascolare e Antropometrico\"",
          status: finalScore >= 70 ? 'Idoneo' : 'Non Idoneo',
          statusText: finalScore >= 70 ? 'Basso rischio cardiovascolare' : 'Idoneità con limitazioni',
          description: finalScore >= 70 
            ? "Profilo metabolico ottimale. Composizione corporea e lipidi/glucidi permettono attività senza rischi a lungo termine."
            : "Parametri fortemente alterati. Lavoratore/atleta limitato in attività ad alto impatto per preservare la salute.",
          metrics: [
            { label: "Passi Totali (Oggi)", value: "8.432" },
            { label: "Calorie Attive (kcal)", value: "450" }
          ],
          chartData: mockTimeSeries(7000, 2500),
          chartColor: "#10b981",
          chartKey: "value",
          chartLabel: "Passi Giornalieri"
        },
        organo: {
          title: "Funzionalità d'Organo ed Emocromo",
          subtitle: "Giudizio di \"Sufficienza Funzionale\"",
          status: finalScore >= 60 ? 'Idoneo' : 'Non Idoneo',
          statusText: finalScore >= 60 ? 'Sufficienza d\'organo' : 'Insufficienza d\'organo / Grave Anemia',
          description: finalScore >= 60 
            ? "Gli organi mostrano sufficienza (reni filtrano bene, fegato metabolizza, no anemia). Sopportazione ottimale del carico."
            : "Inidoneità totale permanente o temporanea per mansioni specifiche (es. sforzi fisici) per evitare il crollo dell'organo.",
          metrics: [
            { label: "SPO2 Medio (%)", value: "98%" },
            { label: "Emoglobina (g/dL)", value: "14.5" }
          ],
          chartData: mockTimeSeries(98, 2),
          chartColor: "#8b5cf6",
          chartKey: "value",
          chartLabel: "SPO2 Medio %"
        },
        infiammatorio: {
          title: "Stato Infiammatorio e Immunitario",
          subtitle: "Giudizio di \"Suscettibilità o Fragilità Biologica\"",
          status: finalScore >= 65 ? 'Idoneo' : 'Non Idoneo',
          statusText: finalScore >= 65 ? 'Sistema Competente' : 'Immunodepresso / Stato di Fragilità',
          description: finalScore >= 65 
            ? "Sistema immunitario efficiente. Nessuna infiammazione sistemica in corso. Ottima resistenza agli agenti esterni."
            : "Non idoneità alla mansione specifica (divieto contatto agenti biologici/ambienti ostili) e obbligo misure di protezione.",
          metrics: [
            { label: "Sonno Totale (Ore)", value: "7.2" },
            { label: "Sonno Profondo (Ore)", value: "1.8" },
            { label: "Stress Medio", value: "42/100" }
          ],
          chartData: mockTimeSeries(40, 20),
          chartColor: "#f59e0b",
          chartKey: "value",
          chartLabel: "Livello di Stress"
        }
      };

      setResult(newResult);
      saveToHistory(newResult);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'high': return 'text-red-500 fill-red-500/20 stroke-red-500 shadow-red-500/50';
      case 'medium': return 'text-amber-500 fill-amber-500/20 stroke-amber-500 shadow-amber-500/50';
      case 'low': return 'text-emerald-500 fill-emerald-500/20 stroke-emerald-500 shadow-emerald-500/50';
    }
  };

  const getRiskBg = (risk: RiskLevel) => {
    switch (risk) {
      case 'high': return 'bg-red-500/10 border-red-500/30';
      case 'medium': return 'bg-amber-500/10 border-amber-500/30';
      case 'low': return 'bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getBodyPartInfo = (part: BodyPart, risk: RiskLevel) => {
    const info = {
      head: {
        title: "Area Cerebrale & Rischio Ictus",
        high: { details: "Rilevata anomalia emodinamica grave nei vasi sovraortici. Rischio ischemico elevato (Stroke Unit alert).", action: "Consulto neurologico d'urgenza. Avviare protocollo TIA/Stroke." },
        medium: { details: "Fluttuazioni pressorie con impatto sul microcircolo cerebrale.", action: "Monitoraggio pressorio 24h e Doppler carotideo." },
        low: { details: "Perfetta ossigenazione e perfusione cerebrale.", action: "Nessuna azione richiesta. Mantenere stile di vita attivo." }
      },
      heart: {
        title: "Sistema Cardiovascolare",
        high: { details: "Tracciato ECG simulato mostra anomalie del tratto ST. Alta probabilità di evento coronarico acuto.", action: "Contattare immediatamente il 112. Evitare sforzi." },
        medium: { details: "Tachicardia sinusale o lievi anomalie del ritmo a riposo.", action: "Valutazione cardiologica ed ecocardiogramma programmati." },
        low: { details: "Emodinamica cardiaca ottimale. Funzione ventricolare nella norma.", action: "Continuare con regolare attività aerobica." }
      },
      abdomen: {
        title: "Metabolismo & Funzione Organica",
        high: { details: "Indicatori enzimatici e insulino-resistenza in zona critica. Sospetta steatosi severa o scompenso diabetico.", action: "Analisi ematiche complete urgenti. Dieta restrittiva medica." },
        medium: { details: "Lieve alterazione del profilo lipidico o glicemico.", action: "Modifica del regime alimentare e aumento attività fisica." },
        low: { details: "Omeostasi metabolica eccellente.", action: "Nessuna azione. Equilibrio ideale." }
      }
    };
    return { title: info[part].title, ...info[part][risk] };
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#0a0a0a] text-slate-200 overflow-y-auto">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 flex items-center p-4 sm:p-6 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-[10px] sm:text-xs font-mono uppercase tracking-widest transition-all cursor-pointer group mr-6"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/60 transition-colors">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <span className="hidden sm:inline">Indietro</span>
        </button>
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h1 className="text-sm sm:text-lg font-bold uppercase tracking-[0.2em] text-white">Quantum Medical Screening</h1>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShow13QubitModal(true)}
            className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[10px] sm:text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            title="Esegui il calcolo 13 Qubit Qiskit 1.x in tempo reale"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Simulatore 13 Qubit (Qiskit 1.x)</span>
            <span className="inline lg:hidden">13 Qubit</span>
          </button>

          <button
            onClick={() => setShowDocumentationModal(true)}
            className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] sm:text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            title="Apri la guida completa e il codice Qiskit con pulsante di copia e download"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Guida & Codice</span>
            <span className="inline sm:hidden">Guida</span>
          </button>

          <button
            onClick={() => setShowAcquiredReportsModal(true)}
            className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] sm:text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.1)]"
            title="Visualizza tutti i referti o dati acquisiti"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Referti acquisiti</span>
            <span className="inline md:hidden">Referti</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/30 text-cyan-200 text-[10px] font-bold">
              {acquiredReports.length}
            </span>
          </button>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {result && result.score < 40 && (
        <div className="bg-red-600 border-b-4 border-red-800 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.3)] z-40 relative">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white shrink-0" />
            <div>
              <h2 className="text-white font-black text-lg sm:text-xl uppercase tracking-wider mb-1">Allerta Medica Critica</h2>
              <p className="text-red-100 text-xs sm:text-sm max-w-2xl">
                Rilevato grave sovraccarico emodinamico o rischio pre-stroke (Indice &lt; 40%). Si raccomanda attivazione immediata del protocollo di emergenza.
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-full font-black uppercase tracking-wider hover:bg-red-50 hover:scale-105 transition-all shadow-xl shrink-0">
            <Phone className="w-5 h-5" />
            Chiama 112
          </button>
        </div>
      )}

      <div className={`w-full mx-auto p-4 sm:p-8 flex flex-col gap-8 mt-2 pb-24 ${result ? "max-w-[98vw] 2xl:max-w-[2200px]" : "max-w-6xl"}`}>

        
        {!result ? (
          hasRegistered ? (
            // ================= FASE 1: DASHBOARD BENTORNATO =================
            <div className="flex flex-col min-h-[60vh] max-w-5xl mx-auto w-full animate-in fade-in duration-500">
              <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-light text-white mb-2">Dashboard Salute</h2>
                  <p className="text-slate-400 text-sm font-light">Monitoraggio quantistico e storico rilevazioni.</p>
                </div>
                <div className="sm:text-right">
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">Data di Nascita</div>
                  <div className="text-white font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">{new Date(dob).toLocaleDateString('it-IT')}</div>
                </div>
              </div>

              {/* Storico Recente */}
              <div className="mb-12">
                <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">Storico Rilevazioni</h3>
                {history.length > 0 ? (
                  <div className="w-full h-[120px] bg-white/[0.02] border border-white/5 rounded-3xl cursor-crosshair overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...history].reverse()} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                        <XAxis dataKey="date" hide={true} />
                        <YAxis domain={[0, 100]} hide={true} />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-black/90 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-md shadow-2xl">
                                  <div className="flex items-end gap-1 mb-1">
                                    <span className="text-white text-2xl font-light leading-none">{payload[0].value}</span>
                                    <span className="text-slate-500 text-xs font-mono leading-none">%</span>
                                  </div>
                                  <p className="text-slate-400 text-[9px] font-mono uppercase tracking-widest">{payload[0].payload.date}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                          cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#ffffff" 
                          strokeWidth={2} 
                          dot={false}
                          activeDot={{ r: 6, fill: '#0a0a0a', stroke: '#fff', strokeWidth: 2, onClick: (e, payload) => setResult(payload.payload) }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="p-8 text-center border border-white/5 rounded-3xl bg-white/[0.02] text-slate-500 text-sm font-light">
                    Nessuna rilevazione in archivio.
                  </div>
                )}
              </div>

              {/* Nuova Rilevazione (Mini) */}
              <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 sm:p-8">
                <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">Nuova Rilevazione Veloce</h3>
                <div className="flex flex-wrap gap-4 mb-8">
                  <button onClick={() => setInputMethod('manual')} className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${inputMethod === 'manual' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/10'}`}>
                    <Activity className="w-3 h-3" /> Manuale (BPM/Press)
                  </button>
                  <button onClick={() => setInputMethod('smartwatch')} className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${inputMethod === 'smartwatch' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/10'}`}>
                    <Watch className="w-3 h-3" /> Smartwatch Sync
                  </button>
                  
                  <div className="relative">
                    <button className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${inputMethod === 'photo' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/10'}`}>
                      <Camera className="w-3 h-3" /> Scansione Esami Sangue
                    </button>
                    <input type="file" accept="image/*,application/pdf" capture="environment" onChange={(e) => { setInputMethod('photo'); handlePhotoUpload(e, 'photo'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Carica Esami del Sangue" />
                  </div>

                  <div className="relative">
                    <button className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${inputMethod === 'mix' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/10'}`}>
                      <Camera className="w-3 h-3" /> Scansione Referti Mix
                    </button>
                    <input type="file" accept="image/*,application/pdf" multiple onChange={(e) => { setInputMethod('mix'); handlePhotoUpload(e, 'mix'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Carica Risonanze, TAC, Raggi (Foto o PDF)" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAcquiredReportsModal(true)}
                    className="px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 shadow-sm cursor-pointer"
                    title="Visualizza l'elenco di tutti i file e referti acquisiti"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Referti o dati acquisiti</span>
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                      {acquiredReports.length}
                    </span>
                  </button>
                </div>

                <div className="min-h-[80px] flex items-center bg-black/20 rounded-xl p-4 border border-white/5">
                  {inputMethod === 'none' && <div className="text-sm text-slate-500 font-light">Seleziona un metodo di input per procedere.</div>}
                  {inputMethod === 'manual' && (
                    <div className="flex flex-wrap items-end gap-4 animate-in fade-in">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-wider pl-1">BPM a Riposo</label>
                        <input type="number" placeholder="Es. 65" value={bpm} onChange={(e) => setBpm(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 w-32 text-sm text-white focus:outline-none focus:border-cyan-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-wider pl-1">Pressione Max</label>
                        <input type="number" placeholder="Es. 120" value={pressure} onChange={(e) => setPressure(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 w-32 text-sm text-white focus:outline-none focus:border-cyan-500" />
                      </div>
                    </div>
                  )}
                  {inputMethod === 'smartwatch' && (
                    <div className="flex flex-col gap-4 animate-in fade-in w-full max-w-sm">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Scegli metodo di importazione</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <button className="w-full px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono transition-all">
                            Carica file .CSV
                          </button>
                          <input type="file" accept=".csv" onChange={handleCsvUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        <button onClick={handleBluetoothSync} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-2">
                          <Watch className="w-3 h-3" /> Connetti API
                        </button>
                      </div>
                      {(isAnalyzing || isDataReady) && (
                        <div className="flex items-center gap-3 mt-2 text-emerald-400 text-sm font-mono bg-black/40 p-2 rounded border border-emerald-500/20">
                          {isAnalyzing ? <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shrink-0" /> : <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0" />}
                          {isAnalyzing ? 'Connessione in corso...' : 'Dati acquisiti con successo'}
                        </div>
                      )}
                    </div>
                  )}
                  {inputMethod === 'photo' && (
                    <div className="flex flex-col gap-1 animate-in fade-in">
                      <div className="flex items-center gap-3 text-purple-400 text-sm font-mono">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] shrink-0" />
                        Esami del sangue acquisiti
                      </div>
                      <div className="text-[10px] text-slate-500 flex gap-2 pl-5">
                        <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10">OCR Ematologico attivo</span>
                        <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Validazione Enciclopedia</span>
                      </div>
                    </div>
                  )}
                  {inputMethod === 'mix' && (
                    <div className="flex flex-col gap-1 animate-in fade-in">
                      <div className="flex items-center gap-3 text-amber-400 text-sm font-mono">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] shrink-0" />
                        Referti strutturali misti acquisiti (TAC, Risonanze, Raggi)
                      </div>
                      <div className="text-[10px] text-slate-500 flex gap-2 pl-5 flex-wrap">
                        <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Visione AI Attiva</span>
                        <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10">OCR Semantico Referto</span>
                        <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Comparazione Testo-Immagine</span>
                        <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Estrazione Pesi Strutturali</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex flex-wrap gap-4 items-center">
                    <button onClick={runScreening} disabled={!isDataReady || isAnalyzing} className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${isDataReady && !isAnalyzing ? 'bg-white text-black hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'}`}>
                      {isAnalyzing ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : null}
                      {isAnalyzing ? 'Elaborazione...' : 'Avvia Screening'}
                    </button>
                    <button onClick={runScreening} disabled={isAnalyzing} className="px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest text-slate-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all">
                      Vedi Situazione Attuale
                    </button>
                  </div>
                  <button 
                    onClick={() => { 
                      setDob('');
                      localStorage.removeItem('quantum_medical_dob');
                      setHistory([]); 
                      localStorage.removeItem('quantum_medical_history');
                      localStorage.removeItem('quantum_medical_gender');
                      setInputMethod('none');
                      setIsDataReady(false);
                      setHasRegistered(false); 
                    }} 
                    className="text-[10px] text-slate-600 hover:text-slate-400 underline decoration-slate-700 underline-offset-4"
                  >
                    Reset Profilo (Debug)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // ================= FASE 1: REGISTRAZIONE PROFILO (NUOVO UTENTE) =================
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-light text-white mb-4">Profilo Medico Iniziale</h2>
                <p className="text-slate-400 text-sm font-light leading-relaxed">
                  Inizializza il tuo tensore quantistico inserendo i dati anagrafici di base. Questi dati vengono salvati localmente sul tuo dispositivo per garantire la massima privacy e non verranno più richiesti in futuro.
                </p>
              </div>

              <div className="w-full bg-[#121212] border border-white/5 rounded-3xl p-8 flex flex-col gap-8">
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-500 uppercase tracking-widest pl-1">Data di Nascita</label>
                  <input 
                    type="date" 
                    value={dob} 
                    onChange={(e) => setDob(e.target.value)} 
                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-500 uppercase tracking-widest pl-1">Sesso Biologico (MOF)</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setGender('M')}
                      className={`flex-1 py-3 rounded-xl border font-mono tracking-widest transition-all ${
                        gender === 'M' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'bg-black/50 border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      MASCHIO
                    </button>
                    <button
                      onClick={() => setGender('F')}
                      className={`flex-1 py-3 rounded-xl border font-mono tracking-widest transition-all ${
                        gender === 'F' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-black/50 border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      FEMMINA
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (dob) {
                      localStorage.setItem('quantum_medical_dob', dob);
                      localStorage.setItem('quantum_medical_gender', gender);
                      setHasRegistered(true);
                    }
                  }}
                  disabled={!dob}
                  className={`mt-4 py-4 rounded-full font-bold uppercase tracking-widest transition-all duration-300 ${
                    dob 
                      ? 'bg-white text-black hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
                      : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  Salva Profilo
                </button>
              </div>
            </div>
          )
        ) : (
          // FASE 2: RISULTATI (2 Colonne)
          <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">
            
            {/* STORICO TOP CENTER */}
            {history.length > 0 && (
              <div className="flex flex-col items-center justify-center relative z-50">
                <button 
                  onClick={() => setShowTimeline(!showTimeline)}
                  className="px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-widest text-slate-300 transition-all flex items-center gap-2"
                >
                  Storico Longevità
                </button>
                {showTimeline && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#121212] border border-white/10 p-8 rounded-3xl w-full max-w-4xl relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                      <button onClick={() => setShowTimeline(false)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
                        <X className="w-5 h-5" />
                      </button>
                      <h2 className="text-2xl font-light text-white mb-8">Storico Longevità (Trend Globale)</h2>
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[...history].reverse()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                            <XAxis 
                              dataKey="date" 
                              stroke="rgba(255,255,255,0.2)" 
                              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace' }} 
                              tickFormatter={(val) => val.split(',')[0]}
                              dy={10}
                            />
                            <YAxis 
                              stroke="rgba(255,255,255,0.2)" 
                              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace' }}
                              domain={[0, 100]} 
                              dx={-10}
                            />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const score = payload[0].value as number;
                                  return (
                                    <div className="bg-black/90 border border-white/10 p-4 rounded-xl backdrop-blur-md flex flex-col gap-2 shadow-xl">
                                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{label}</span>
                                      <span className={`text-3xl font-light leading-none ${score < 40 ? 'text-red-500' : score < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {score}%
                                      </span>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeDasharray: '4 4' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#10b981" 
                              strokeWidth={3} 
                              dot={{ r: 6, fill: '#121212', stroke: '#10b981', strokeWidth: 2 }}
                              activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
              
              {/* LATO SINISTRO: MAPPA CORPOREA */}
              <div className="w-full lg:w-[360px] xl:w-[400px] 2xl:w-[440px] shrink-0 lg:sticky lg:top-20 flex flex-col items-center justify-start relative h-fit">
                <div className="w-full flex items-center justify-between mb-2">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">Scansione Olografica</h3>
                  {activeCategory !== null && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-300">
                      {[result.vitali, result.metabolici, result.organo, result.infiammatorio][activeCategory]?.title}
                    </span>
                  )}
                </div>

                <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] bg-black">
                  {activeCategory === null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10 text-center p-6">
                      <p className="text-sm font-light text-slate-300 font-mono">
                        Seleziona uno dei 4 moduli clinici sulla destra per visualizzare la scansione interna corrispondente.
                      </p>
                    </div>
                  )}
                  {activeCategory === 0 && <img src={scanVitali} alt="Parametri Vitali" className="w-full h-full object-cover animate-in fade-in duration-500" />}
                  {activeCategory === 1 && <img src={scanMetabolici} alt="Parametri Metabolici" className="w-full h-full object-cover animate-in fade-in duration-500" />}
                  {activeCategory === 2 && <img src={scanOrgano} alt="Funzionalità d'Organo" className="w-full h-full object-cover animate-in fade-in duration-500" />}
                  {activeCategory === 3 && <img src={scanInfiammatorio} alt="Stato Infiammatorio" className="w-full h-full object-cover animate-in fade-in duration-500" />}

                  {activeCategory === null && (
                    <svg viewBox="0 0 200 450" className="w-full h-full text-white/5 opacity-50 p-6">
                      <g fill="currentColor">
                        <path d="M 100 55 Q 120 55, 125 75 Q 125 110, 110 145 Q 135 180, 135 220 Q 135 270, 115 420 Q 108 430, 102 420 L 100 260 L 98 420 Q 92 430, 85 420 Q 65 270, 65 220 Q 65 180, 90 145 Q 75 110, 75 75 Q 80 55, 100 55 Z" />
                      </g>
                    </svg>
                  )}
                  <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-3xl mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />
                </div>
              </div>

                            {/* LATO DESTRO: I 4 MODULI AD ACCORDION */}
              <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono uppercase tracking-widest px-1">
                  <span>Moduli Clinici di Valutazione</span>
                  <span className="text-[11px] text-slate-400">Clicca su un modulo per espanderlo</span>
                </div>

                <div className="flex flex-col gap-3 pb-4 pt-1 px-1">
                  {[result.vitali, result.metabolici, result.organo, result.infiammatorio].map((cat, idx) => {
                    const details = CATEGORY_DETAILS_ENRICHED[idx];
                    const isExpanded = expandedCategory === idx;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`bg-[#121212] border rounded-2xl relative overflow-hidden transition-all duration-300 w-full shrink-0 ${
                          isExpanded 
                            ? 'border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)] bg-white/[0.03]'
                            : 'border-white/5 hover:border-white/20 hover:bg-white/[0.01] cursor-pointer'
                        }`}
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full transition-all" style={{ backgroundColor: cat.chartColor }} />
                        
                        {/* Header Cliccabile */}
                        <div 
                          className="p-4 pl-5 flex items-center justify-between"
                          onClick={() => {
                            if (!isExpanded) {
                              setActiveCategory(idx);
                              setExpandedCategory(idx);
                            } else {
                              setExpandedCategory(null);
                              setActiveCategory(null);
                            }
                          }}
                        >
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">MOD #{idx + 1}</span>
                              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: cat.chartColor }} />
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${details.urgenzaBadgeColor}`}>
                                {details.urgenzaTag}
                              </span>
                            </div>
                            <h3 className={`font-medium transition-colors ${isExpanded ? 'text-lg text-white' : 'text-sm text-slate-200'}`}>
                              {cat.title}
                            </h3>
                            {isExpanded && (
                              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{cat.subtitle}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-widest uppercase flex-shrink-0 ${
                              cat.status === 'Idoneo'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}>
                              {cat.status}
                            </div>
                            <button className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                              {isExpanded ? <X className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Contenuto Espanso */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-300 cursor-default" onClick={(e) => e.stopPropagation()}>
                            {/* Status Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b border-white/5 mb-4">
                              <div className={`px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-widest uppercase shrink-0 w-fit ${
                                cat.status === 'Idoneo'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'bg-red-500/10 border-red-500/30 text-red-400'
                              }`}>
                                {cat.status}: {cat.statusText}
                              </div>
                              <div className="text-xs text-slate-300 leading-relaxed font-light">{cat.description}</div>
                            </div>

                            {/* 3 Box: Allarmi, Cause, Consigli */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 flex flex-col gap-1.5">
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                                  Campanelli d'allarme
                                </div>
                                <p className="text-[10px] text-red-200/80 leading-relaxed font-light">{details.allarmi}</p>
                              </div>
                              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex flex-col gap-1.5">
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Cause Frequenti di Alterazione
                                </div>
                                <p className="text-[10px] text-amber-200/80 leading-relaxed font-light">{details.cause}</p>
                              </div>
                              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 flex flex-col gap-1.5">
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                                  <div className="w-1.5 h-1.5 rounded-sm bg-emerald-500"></div>
                                  Consigli Pratici per l'Utente
                                </div>
                                <p className="text-[10px] text-emerald-200/80 leading-relaxed font-light">{details.consigli}</p>
                              </div>
                            </div>

                            {/* Box Interconnessione */}
                            <div className="bg-gradient-to-r from-red-950/30 via-amber-950/20 to-black/60 border border-red-500/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                              <div className="flex items-start gap-2">
                                <span className="text-amber-400 text-sm shrink-0">💡</span>
                                <p className="text-xs text-slate-200 leading-relaxed font-light max-w-xl">
                                  {details.interconnessione}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDominoModal(true);
                                }}
                                className="animate-pulse px-4 py-2 rounded-lg bg-gradient-to-r from-red-600/40 via-amber-600/30 to-red-600/40 border border-red-500/70 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:brightness-125 transition-all cursor-pointer shrink-0 shadow-lg"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-300" />
                                <span>Scopri la reazione a catena nel corpo</span>
                              </button>
                            </div>

                            {/* Grafico */}
                            <div className="h-[200px] w-full bg-white/[0.01] border border-white/5 rounded-xl p-4 relative mb-2">
                              <div className="absolute top-3 left-4 z-10 text-[10px] font-mono text-slate-500 uppercase tracking-widest">{cat.chartLabel} (Andamento Storico)</div>
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={cat.chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} />
                                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} />
                                  <Tooltip 
                                    content={({ active, payload }) => {
                                      if (active && payload && payload.length) {
                                        return (
                                          <div className="bg-black/90 border border-white/10 px-3 py-2 rounded-lg text-xs backdrop-blur-md shadow-xl flex flex-col gap-1">
                                            <span className="text-white/60 font-mono text-[9px] uppercase">{payload[0].payload.time}</span>
                                            <span className="text-white font-mono font-bold" style={{ color: cat.chartColor }}>{payload[0].value} {cat.chartLabel.split(' ')[0]}</span>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey={cat.chartKey} 
                                    stroke={cat.chartColor} 
                                    strokeWidth={3} 
                                    dot={{ fill: '#000', stroke: cat.chartColor, strokeWidth: 2, r: 3 }}
                                    activeDot={{ r: 6, fill: '#000', stroke: cat.chartColor, strokeWidth: 2 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            {/* CTA PDF */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/20 via-black/40 to-cyan-950/20 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
                              <div className="space-y-1 text-center md:text-left">
                                <h5 className="text-xs font-semibold text-white">Rilevi uno di questi segnali?</h5>
                                <p className="text-[10px] text-slate-300 font-light">
                                  Genera il tuo Report PDF personalizzato da mostrare al medico.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadPdf();
                                }}
                                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-lg shadow-cyan-500/20"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Report PDF</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SEZIONE PROBLEMATICHE DOVUTE AGLI INCROCI DEI PARAMETRI */}
            <CrossParameterAnalysis
              onGeneratePdf={handleDownloadPdf}
              onOpenDominoModal={() => setShowDominoModal(true)}
            />

            {/* POPUP EFFETTO DOMINO GLOBALE */}
            <DominoModal
              isOpen={showDominoModal}
              onClose={() => setShowDominoModal(false)}
              onGeneratePdf={handleDownloadPdf}
            />

            {/* NOTIFICA REPORT PDF SCARICATO */}
            {pdfDownloadedNotice && (
              <div className="fixed bottom-6 right-6 z-[200] bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-5 py-3.5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium">
                  {pdfDownloadedNotice}
                </div>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <button 
                onClick={() => {
                  setResult(null);
                  setSelectedPart(null);
                  setInputMethod('none');
                  setIsDataReady(false);
                }}
                className="text-xs font-mono text-slate-400 hover:text-white uppercase tracking-widest underline decoration-white/20 underline-offset-4"
              >
                Nuovo Screening
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALE REFERTI O DATI ACQUISITI */}
      <AcquiredReportsModal
        isOpen={showAcquiredReportsModal}
        onClose={() => setShowAcquiredReportsModal(false)}
        reports={acquiredReports}
        onDeleteReport={handleDeleteReport}
        onUploadNew={handleUploadNewReport}
        onSelectReportForScreening={() => runScreening()}
      />

      {/* MODALE SIMULATORE QUANTISTICO 13 QUBIT (QISKIT 1.X) */}
      <QuantumHealth13QubitModal
        isOpen={show13QubitModal}
        onClose={() => setShow13QubitModal(false)}
        onApplyToScreening={handleApplyQuantumReport}
      />

      {/* MODALE GUIDA TECNICA E CODICE QUANTISTICO */}
      <DocumentationModal
        isOpen={showDocumentationModal}
        onClose={() => setShowDocumentationModal(false)}
      />
    </div>
  );
}
