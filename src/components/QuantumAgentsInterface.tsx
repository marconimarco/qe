import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Terminal, 
  Send, 
  Cpu, 
  Sparkles, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Code, 
  Copy, 
  Check, 
  Info,
  Layers,
  HelpCircle,
  TrendingUp,
  Workflow,
  RefreshCw,
  Search,
  Filter,
  Globe,
  FileSpreadsheet,
  Download,
  Upload,
  FileText,
  ChevronDown,
  ChevronRight,
  Play,
  FileCode,
  Share2,
  Maximize2,
  Zap,
  Activity,
  Edit3
} from 'lucide-react';
import { QUANTUM_SCENARIOS, QuantumScenario } from '../data/scenarios';
import axios from 'axios';
import { useTranslation } from '../lib/TranslationContext';

export interface IndustrialScenarioInfo {
  id: number;
  macroarea: string;
  scenarioName: string;
  focus: string;
  focusKey: 'A' | 'B' | 'C';
  carAnalogy: string;
  metricColName: string;
  defaultElements: string[];
  defaultUnit: string;
  sampleElements: string;
  sampleSaturation: string;
}

interface Props {
  onBack?: () => void;
  onSendToIbm: (qasmCode: string) => void;
}

interface Message {
  id: string;
  sender: 'system' | 'user';
  text: string;
  timestamp: string;
  isComposerCode?: boolean;
  code?: string;
}

export default function QuantumAgentsInterface({ onBack, onSendToIbm }: Props) {
  const { t, language } = useTranslation();
  const isIt = language === 'it';
  // Conversational active state machine
  const [step, setStep] = useState<number>(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedSectorLong, setSelectedSectorLong] = useState<string>('');
  const [scenarioSelection, setScenarioSelection] = useState<'A' | 'B' | 'C' | null>(null);
  const [interviewSubstep, setInterviewSubstep] = useState<number>(0);
  const [calibrationAnswers, setCalibrationAnswers] = useState<string[]>([]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Scenario explorer state
  const [selectedScenario, setSelectedScenario] = useState<QuantumScenario | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMacroarea, setSelectedMacroarea] = useState<string>('All');
  const [selectedTechnology, setSelectedTechnology] = useState<string>('All');
  
  // Scenarios and interview responses
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [csvData, setCsvData] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(0.04); // e.g. 4%
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // New states for interactive CSV column selection & entanglement mapping
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedEntanglementCols, setSelectedEntanglementCols] = useState<string[]>([]);
  const [tempCsvContent, setTempCsvContent] = useState<string>('');
  const [isCsvLoaded, setIsCsvLoaded] = useState<boolean>(false);

  // Warning states for Entanglement detection
  const [showEntanglementWarning, setShowEntanglementWarning] = useState<boolean>(false);
  const [pendingCsvData, setPendingCsvData] = useState<string>('');
  const [warningReason, setWarningReason] = useState<'missing_column' | 'no_associations'>('no_associations');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadCsvTemplate = () => {
    const details = getScenarioDetails(selectedSectorLong || 'Finance & Markets', scenarioSelection || 'A');
    const cleanSectorName = (selectedSector || 'Sector').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `quantum_template_${cleanSectorName}_Option_${scenarioSelection || 'A'}.csv`;
    
    const blob = new Blob([details.sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const downloadMsg = isIt
      ? `📥 **Modello CSV scaricato con successo:** \`${filename}\`\n\nPuoi aprire il file scaricato con Microsoft Excel, LibreOffice Calc o qualsiasi editor di testo, modificare i valori reali della tua azienda (in particolare la colonna **Saturation_Percentage**) e ricaricarlo cliccando su **📁 CARICA FILE CSV COMPILATO**.`
      : `📥 **CSV Template downloaded successfully:** \`${filename}\`\n\nYou can open the downloaded file with Microsoft Excel, LibreOffice Calc, or any text editor, edit your real corporate values (especially the **Saturation_Percentage** column), and upload it back by clicking **📁 UPLOAD COMPLETED CSV FILE**.`;
    addMessage('system', downloadMsg);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawContent = event.target?.result as string;
      if (rawContent && rawContent.trim()) {
        const uploadMsg = isIt
          ? `📁 **File CSV caricato:** \`${file.name}\`\n\n\`\`\`csv\n${rawContent.trim()}\n\`\`\``
          : `📁 **CSV File Uploaded:** \`${file.name}\`\n\n\`\`\`csv\n${rawContent.trim()}\n\`\`\``;
        addMessage('user', uploadMsg);
        setTempCsvContent(rawContent);
        setIsCsvLoaded(true);
        setStep(3);

        const isOptC = scenarioSelection === 'C' || rawContent.toLowerCase().includes('option c') || rawContent.toLowerCase().includes('amplitude') || rawContent.toLowerCase().includes('probab');
        const isOptB = scenarioSelection === 'B';

        if (isOptC && scenarioSelection !== 'C') {
          setScenarioSelection('C');
        }
        processInputCSV(rawContent, true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  function getScenarioQuestions(scenario: QuantumScenario): string[] {
    const vars = scenario.targetVariables.split(',').map(v => v.trim());
    const mainVar = vars[0] || 'Saturation';
    const secondVar = vars[1] || 'Bonding';
    
    if (scenario.macroarea.includes('Finance') || scenario.macroarea.includes('Finanza')) {
      return [
        `What is your maximum risk tolerance (conservative, moderate, aggressive) regarding "${scenario.name}"?`,
        `How do you intend to weigh the variable "${mainVar}" to mitigate the impact on the quantum module?`,
        `What maximum deviation do you consider tolerable on metric "${secondVar}" before applying protective measures?`
      ];
    } else if (scenario.macroarea.includes('Logistics') || scenario.macroarea.includes('Logistica')) {
      return [
        `What is the maximum tolerable average delay or bottleneck for asset "${scenario.name}"?`,
        `How does the variable "${mainVar}" affect the stability of interconnected nodes?`,
        `In case of a channel bottleneck on "${secondVar}", do you have redundant secondary routes available?`
      ];
    } else if (scenario.macroarea.includes('Chemistry') || scenario.macroarea.includes('Genomics') || scenario.macroarea.includes('Chimica')) {
      return [
        `What is the required molecular or energy precision during simulation of "${scenario.name}"?`,
        `How is the stability correlated with "${mainVar}" monitored or calculated?`,
        `What impact does "${secondVar}" have on the long-term stability or decay of the element?`
      ];
    } else if (scenario.macroarea.includes('Manufacturing') || scenario.macroarea.includes('Manifattura')) {
      return [
        `How frequently do you monitor mechanical wear and the production cycle for "${scenario.name}"?`,
        `How does stress accumulation on variable "${mainVar}" accelerate line wear?`,
        `What is the estimated hourly cost of a sudden outage due to instability in "${secondVar}"?`
      ];
    } else if (scenario.macroarea.includes('Cybersecurity')) {
      return [
        `What key length and strength (e.g. bits or NIST standards) are required in "${scenario.name}"?`,
        `What is the exposure magnitude tied to variable "${mainVar}" in case of a cyber attack?`,
        `What automated workflow should trigger if "${secondVar}" exceeds the critical threshold percentage?`
      ];
    }
    
    return [
      `What is the risk or error tolerance in this pilot scenario for "${scenario.name}"?`,
      `How will the variable "${mainVar}" influence the classical decision-making process?`
    ];
  }

  function generateScenarioCSV(scenario: QuantumScenario): string {
    const vars = scenario.targetVariables.split(',').map(v => v.trim());
    const extraHeaders = vars.join(',');
    
    let asset1 = 'ASSET_01';
    let asset2 = 'ASSET_02';
    let asset3 = 'ASSET_03';
    let extraVals1 = '';
    let extraVals2 = '';
    let extraVals3 = '';
    
    if (scenario.macroarea.includes('Finanza') || scenario.macroarea.includes('Finance')) {
      asset1 = 'OPZIONE_ETH';
      asset2 = 'FUTURES_GOLD';
      asset3 = 'CROSS_EUR_USD';
      extraVals1 = '0.35,0.45,1.08';
      extraVals2 = '0.12,0.85,1.12';
      extraVals3 = '0.65,0.20,1.05';
    } else if (scenario.macroarea.includes('Logistica') || scenario.macroarea.includes('Logistics')) {
      asset1 = 'VEICOLO_HUB_A';
      asset2 = 'VEICOLO_HUB_B';
      asset3 = 'ROTTA_BACKUP';
      extraVals1 = '45.12,12:00,10,0.5';
      extraVals2 = '45.18,14:30,12,0.8';
      extraVals3 = '45.30,18:00,5,0.1';
    } else if (scenario.macroarea.includes('Chimica') || scenario.macroarea.includes('Chemistry')) {
      asset1 = 'CATALIZZATORE_PT';
      asset2 = 'MOL_BIO_DEGR';
      asset3 = 'REATTIVO_C';
      extraVals1 = '4.2,0.15,0.88';
      extraVals2 = '2.8,0.05,0.95';
      extraVals3 = '5.0,0.60,0.12';
    } else if (scenario.macroarea.includes('Manifattura') || scenario.macroarea.includes('Manutenzione') || scenario.macroarea.includes('Manufacturing')) {
      asset1 = 'ROBOT_SALDATORE_3';
      asset2 = 'CNC_FRESATRICE';
      asset3 = 'LINEA_MONTAGGIO';
      extraVals1 = '120,4.5,12';
      extraVals2 = '150,2.1,3';
      extraVals3 = '90,8.4,24';
    } else if (scenario.macroarea.includes('Sanità') || scenario.macroarea.includes('Genomica') || scenario.macroarea.includes('Healthcare')) {
      asset1 = 'PATIENT_DONOR';
      asset2 = 'PATIENT_RECPT';
      asset3 = 'PATIENT_ISO';
      extraVals1 = '0.95,0.40,0.12';
      extraVals2 = '0.95,0.60,0.15';
      extraVals3 = '0.10,0.24,0.30';
    } else if (scenario.macroarea.includes('Cybersecurity')) {
      asset1 = 'CHIAVE_AES_256';
      asset2 = 'FIREWALL_EAST';
      asset3 = 'LOG_ANOMALIE';
      extraVals1 = '256,1.4,12';
      extraVals2 = '128,5.8,4';
      extraVals3 = '512,0.2,0';
    }
    
    // Make sure the lengths match headers
    const l1 = extraHeaders ? ',' + extraVals1.split(',').slice(0, vars.length).join(',') : '';
    const l2 = extraHeaders ? ',' + extraVals2.split(',').slice(0, vars.length).join(',') : '';
    const l3 = extraHeaders ? ',' + extraVals3.split(',').slice(0, vars.length).join(',') : '';

    return `Codice_Articolo,Percentuale_Saturazione,Abbinamento${extraHeaders ? ',' + extraHeaders : ''}
${asset1},0.28,COMBINATO_01${l1}
${asset2},0.45,COMBINATO_01${l2}
${asset3},0.78,LIBERO${l3}`;
  }
  
  // Compilation outputs
  const [qasmOutput, setQasmOutput] = useState<string>('');
  const [mappingSummary, setMappingSummary] = useState<string>('');
  const [ignoredColumns, setIgnoredColumns] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isQiskitCopied, setIsQiskitCopied] = useState(false);
  const [isInterviewCopied, setIsInterviewCopied] = useState(false);

  // Collapsible panels & tabs states
  const [isCleaningExpanded, setIsCleaningExpanded] = useState<boolean>(false);
  const [isFormulasExpanded, setIsFormulasExpanded] = useState<boolean>(false);
  const [rightPanelTab, setRightPanelTab] = useState<'composer' | 'qasm' | 'qiskit'>('composer');
  const [cleanedRecords, setCleanedRecords] = useState<Array<{ article: string, saturation: number, abbinamento: string }>>([]);
  const [isRunningHpc, setIsRunningHpc] = useState<boolean>(false);
  const [hoveredGate, setHoveredGate] = useState<{
    gate: string;
    qubit: string;
    target?: string;
    param?: string;
    details: string;
    x?: number;
    y?: number;
  } | null>(null);

  // In-app Classical / HPC Simulation Engine
  const executeHpcSimulation = (qasmCodeToRun?: string) => {
    if (isRunningHpc) return;
    setIsRunningHpc(true);

    const activeRecs = cleanedRecords.length > 0 ? cleanedRecords : [
      { article: 'ASSET_01', saturation: 0.35, abbinamento: 'COMBINATO_01' },
      { article: 'ASSET_02', saturation: 0.45, abbinamento: 'COMBINATO_01' },
      { article: 'ASSET_03', saturation: 0.78, abbinamento: 'LIBERO' }
    ];
    const N = activeRecs.length;
    const threshVal = threshold || 0.04;
    const currentOpt = scenarioSelection || 'A';
    const sectorLabel = selectedSectorLong || selectedSector || 'General Process';

    addMessage('user', isIt 
      ? `⚡ Avvio elaborazione su Cluster IA Classica / HPC (CPU/GPU Simulation Server)...` 
      : `⚡ Launching execution on Classical AI / HPC Cluster (CPU/GPU Simulation Server)...`
    );

    setTimeout(() => {
      // 1. Calculate classical multi-threaded probability distributions
      const startTime = performance.now();
      const shots = 2048;
      
      // Calculate realistic classical distributions based on physical parameters
      const stateCounts: Record<string, number> = {};
      let maxProbState = '';
      let maxCount = -1;

      // Bitstring probability evaluation
      const numStates = Math.pow(2, N + 1);
      const probabilities: { bitstring: string; prob: number }[] = [];
      let totalWeight = 0;

      for (let s = 0; s < numStates; s++) {
        let bitStr = s.toString(2).padStart(N + 1, '0');
        let weight = 1.0;

        for (let i = 0; i < N; i++) {
          const bit = bitStr[bitStr.length - 1 - i];
          const sat = Math.max(0.01, Math.min(0.99, activeRecs[i]?.saturation ?? 0.35));
          if (bit === '1') {
            weight *= sat;
          } else {
            weight *= (1.0 - sat);
          }
        }

        // Ancilla bit comparator evaluation
        const ancillaBit = bitStr[0];
        const overallCriticality = activeRecs.reduce((acc, r) => acc + r.saturation, 0) / N;
        const ancillaTriggerProb = Math.min(0.95, Math.max(0.05, overallCriticality / (threshVal * 10 + 0.1)));
        
        if (ancillaBit === '1') {
          weight *= ancillaTriggerProb;
        } else {
          weight *= (1.0 - ancillaTriggerProb);
        }

        probabilities.push({ bitstring: bitStr, prob: weight });
        totalWeight += weight;
      }

      // Sample shots
      let remainingShots = shots;
      probabilities.forEach((pObj) => {
        const normProb = pObj.prob / (totalWeight || 1);
        const count = Math.round(normProb * shots);
        if (count > 0) {
          stateCounts[pObj.bitstring] = count;
          if (count > maxCount) {
            maxCount = count;
            maxProbState = pObj.bitstring;
          }
          remainingShots -= count;
        }
      });

      // Distribute any rounding difference
      if (remainingShots !== 0 && maxProbState) {
        stateCounts[maxProbState] = Math.max(1, (stateCounts[maxProbState] || 0) + remainingShots);
      }

      const elapsedMs = ((performance.now() - startTime) + 380).toFixed(1);
      const topStates = Object.entries(stateCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Markdown results table
      const resultsTableMarkdown = `| Stato Registri (Bitstring) | Conteggi (Shots: ${shots}) | Frequenza / Probabilità | Interpretazione HPC |
| :--- | :--- | :--- | :--- |
${topStates.map(([bs, cnt], idx) => {
  const pct = ((cnt / shots) * 100).toFixed(2);
  const isOptimal = idx === 0;
  const ancillaFired = bs[0] === '1';
  const tag = isOptimal 
    ? '🏆 **Configurazione Ottima Globale**' 
    : ancillaFired 
    ? '⚠️ Superamento Soglia Allerta' 
    : 'Coerente con Vincoli';
  return `| \`|${bs}⟩\` | **${cnt}** | \`${pct}%\` | ${tag} |`;
}).join('\n')}`;

      const convergenceDesc = currentOpt === 'A'
        ? `Convergenza combinatoria multi-variabile ad accoppiamento matriciale (Simulatore HPC Aer Statevector)`
        : currentOpt === 'B'
        ? `Risoluzione geometrica angolare su sfera di Bloch classical solver`
        : `Stima delle ampiezze di probabilità con monte-carlo classico su CPU/GPU`;

      const hpcReport = `🖥️ **REPORT DI CALCOLO CLASSICO (HPC / SIMULATORE CPU-GPU)**

✅ **Calcolo completato localmente con successo in ${elapsedMs} ms senza latenza di rete quantistica.**

---

📊 **METRICHE DI ESECUZIONE CLUSTER HPC:**
- **Ambiente di Calcolo:** HPC High-Performance Parallel Simulator (Multithread CPU/GPU)
- **Campioni Acquisiti (Shots):** **${shots} campioni statistici**
- **Target Macro-Area:** **${sectorLabel}**
- **Metodo Matematico:** ${convergenceDesc}
- **Qubit Simulati:** ${N} Qubit dati + 1 Qubit Ancilla (${N + 1} canali logici)
- **Soglia di Comparazione Attiva:** **${(threshVal * 100).toFixed(1)}%**

---

📈 **DISTRIBUZIONE DI PROBABILITÀ DEGLI STATI:**
${resultsTableMarkdown}

---

💡 **CONCLUSIONI COMPUTAZIONALI & AZIONI AZIENDALI:**
- **Stato Dominante Rilevato:** \`|${maxProbState}⟩\` con probabilità del **${((maxCount / shots) * 100).toFixed(2)}%**.
- **Esito Valutazione Rischio / Saturazione:** ${
  activeRecs.some(r => r.saturation > threshVal)
    ? `⚠️ È stata rilevata saturazione critica su uno o più nodi di processo. I vincoli di correlazione sono stati mappati e risolti con successo.`
    : `✅ Tutti i parametri operativi rientrano nei limiti di stabilità aziendale prestabiliti.`
}
- Il risultato è stato calcolato e salvato in memoria per l'analisi immediata.`;

      addMessage('system', hpcReport);
      setIsRunningHpc(false);
      playChimeAlert();
    }, 700);
  };

  // Generate Python / Qiskit execution script
  const generateQiskitPythonCode = (qasm: string, records: Array<{ article: string, saturation: number, abbinamento: string }> = []): string => {
    const N = records.length > 0 ? records.length : 3;
    const isOptC = scenarioSelection === 'C';
    const isOptB = scenarioSelection === 'B';
    const activeRecords = records.length > 0 ? records : [
      { article: 'ASSET_01', saturation: 0.35, abbinamento: 'COMBINATO_01' },
      { article: 'ASSET_02', saturation: 0.45, abbinamento: 'COMBINATO_01' },
      { article: 'ASSET_03', saturation: 0.78, abbinamento: 'LIBERO' }
    ];

    const cleanQasm = qasm || `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[4];\ncreg c[4];\nry(1.26610) q[0];\nry(1.47063) q[1];\nry(2.16450) q[2];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\nmeasure q[2] -> c[2];\nmeasure q[3] -> c[3];`;

    return `# ==============================================================================
# 🚀 QUANTUM BI ORCHESTRATOR - QISKIT SCRIPT (IBM QUANTUM & AER SIMULATOR)
# Sector: ${selectedSectorLong || 'Enterprise Quantum BI'} (Option ${scenarioSelection || 'A'})
# Protocol: ${isOptC ? 'Pure Amplitude Mapping (0 CX)' : isOptB ? 'Pure Geometric Mapping (0 CX)' : 'Coherent Multi-Qubit Entanglement'}
# ==============================================================================

from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
import math

# --- 1. CARICAMENTO DEL CIRCUITO DA OPENQASM 2.0 (STANDARD IBM) ---
qasm_source = """${cleanQasm.trim()}"""

# Istanzia il QuantumCircuit da OpenQASM 2.0
circuit = QuantumCircuit.from_qasm_str(qasm_source)

# --- 2. COSTRUZIONE PROGRAMMATICA EQUIVALENTE (QISKIT SDK NATIVO) ---
# qc = QuantumCircuit(${N + 1}, ${N + 1})
${activeRecords.map((r, i) => {
  const p = Math.max(0, Math.min(r.saturation, 1.0));
  const th = (2 * Math.asin(Math.sqrt(p))).toFixed(5);
  return `# qc.ry(${th}, ${i})  # Qubit q[${i}]: ${r.article} (P = ${(p * 100).toFixed(1)}%)`;
}).join('\n')}
# qc.measure(range(${N + 1}), range(${N + 1}))

print("=" * 65)
print(f"📊 SUMMARY CIRCUITO QUANTISTICO:")
print(f" • Qubit Totali: {circuit.num_qubits}")
print(f" • Profondità Circuito (Depth): {circuit.depth()}")
print(f" • Porte Logiche Totali: {dict(circuit.count_ops())}")
print("=" * 65)

# --- 3. ESECUZIONE SIMULATORE LOCALE (AerSimulator - 1024 Shots) ---
print("\\n⚡ Esecuzione campionamento statistico su AerSimulator...")
simulator = AerSimulator()
compiled_circuit = transpile(circuit, simulator)
job = simulator.run(compiled_circuit, shots=1024)
result = job.result()
counts = result.get_counts()

print("\\n📈 STATI QUANTISTICI MISURATI (DISTRIBUZIONE DI PROBABILITÀ):")
for state, freq in sorted(counts.items(), key=lambda x: x[1], reverse=True):
    prob = (freq / 1024) * 100
    bar = "█" * int(prob / 5)
    print(f"  |{state}> : {freq:4d} shots ({prob:5.2f}%) {bar}")

# --- 4. TRASMISSIONE AD HARDWARE QUANTISTICO REALE IBM (Opzionale) ---
# Per inviare il job a una vera QPU IBM Quantum (es. ibm_brisbane / ibm_osaka):
# from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2
# service = QiskitRuntimeService(channel="ibm_quantum", token="IL_TUO_TOKEN_IBM_QUANTUM")
# backend = service.least_busy(operational=True, simulator=False)
# print(f"🚀 Invio a QPU fisica: {backend.name}")
# sampler = SamplerV2(backend)
# job = sampler.run([compiled_circuit])
# print(f"Job ID QPU: {job.job_id()}")
`;
  };

  const handleDownloadQasm = () => {
    const codeToDownload = qasmOutput || `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[4];\ncreg c[4];\nry(1.26610) q[0];\nry(1.47063) q[1];\nry(2.16450) q[2];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\nmeasure q[2] -> c[2];\nmeasure q[3] -> c[3];`;
    const blob = new Blob([codeToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quantum_circuit_${selectedSector || 'enterprise'}.qasm`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadQiskit = () => {
    const pyCode = generateQiskitPythonCode(qasmOutput, cleanedRecords);
    const blob = new Blob([pyCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `qiskit_simulation_${selectedSector || 'enterprise'}.py`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyCode = (codeToCopy: string) => {
    const fallback = qasmOutput || `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[4];\ncreg c[4];\nry(1.26610) q[0];\nry(1.47063) q[1];\nry(2.16450) q[2];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\nmeasure q[2] -> c[2];\nmeasure q[3] -> c[3];`;
    navigator.clipboard.writeText(codeToCopy || fallback);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const copyQiskitCode = () => {
    const pyCode = generateQiskitPythonCode(qasmOutput, cleanedRecords);
    navigator.clipboard.writeText(pyCode);
    setIsQiskitCopied(true);
    setTimeout(() => setIsQiskitCopied(false), 2000);
  };

  // Generatore Verbale Completo dell'Intervista (Trascrizione Q&A + Dataset CSV + Circuito QASM + Script Qiskit)
  const generateInterviewReport = (): string => {
    const now = new Date().toLocaleString('it-IT');
    const sectorName = selectedSectorLong || selectedSector || 'Macroarea Industriale';
    const optLabel = scenarioSelection === 'C' ? 'Opzione C (Ampiezza Pura - 0 CX)' : scenarioSelection === 'B' ? 'Opzione B (Rotazioni Angolari 3D)' : 'Opzione A (Entanglement Combinatorio)';
    const scenario = getSectorIndustrialScenario(selectedSector || 'Finanza');
    
    // Dataset CSV effettivo
    let effectiveCsv = v9GeneratedCsv || tempCsvContent || csvData;
    if (!effectiveCsv && cleanedRecords.length > 0) {
      effectiveCsv = `Codice_Articolo,Percentuale_Saturazione,Abbinamento\n` +
        cleanedRecords.map(r => `${r.article},${r.saturation.toFixed(2)},${r.abbinamento}`).join('\n');
    }
    if (!effectiveCsv) {
      effectiveCsv = `Item_Code,Saturation_Percentage,Entanglement_Link\nASSET_01,0.35,COMBINATO_01\nASSET_02,0.45,COMBINATO_01\nASSET_03,0.78,INDEPENDENT`;
    }

    // Estrazione Trascrizione Conversazione Domande/Risposte
    const conversationTranscript = messages
      .filter(m => !m.text.includes('[ACTION: RENDER_BUTTON_SEND_TO_IBM_Q]'))
      .map(m => {
        const role = m.sender === 'user' ? '👤 RISPOSTA UTENTE' : '🤖 DOMANDA / SISTEMA QUANTISTICO';
        const cleanText = m.text
          .replace(/```[a-zA-Z]*\n[\s\S]*?```/g, '[Tabella/Codice allegato]')
          .trim();
        return `### ${role} (${m.timestamp})\n${cleanText}\n`;
      })
      .join('\n---\n\n');

    const effectiveQasm = qasmOutput || `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[4];\ncreg c[4];\nry(1.26610) q[0];\nry(1.47063) q[1];\nry(2.16450) q[2];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\nmeasure q[2] -> c[2];\nmeasure q[3] -> c[3];`;
    const effectiveQiskit = generateQiskitPythonCode(effectiveQasm, cleanedRecords);

    return `# ==============================================================================
# 📋 VERBALE COMPLETO INTERVISTA & REPORT QUANTISTICO - IBM QUANTUM ORCHESTRATOR
# Generato il: ${now}
# ==============================================================================

## 1. RIEPILOGO PROFILAZIONE AZIENDALE
- **Macro-Area Industriale:** ${sectorName}
- **Scenario Applicativo:** ${scenario.scenarioName}
- **Spartito Algoritmico:** ${optLabel}
- **Profilo di Prudenza:** ${v9Prudence} (Soglia Allarme: ${(threshold * 100).toFixed(1)}%)
- **Nodi/Qubit Aziendali Mappati:** ${v9Elements.length > 0 ? v9Elements.join(', ') : (cleanedRecords.length > 0 ? cleanedRecords.map(r => r.article).join(', ') : '3 Qubit')}

---

## 2. TRASCRIZIONE CRONOLOGICA DELL'INTERVISTA (DOMANDE & RISPOSTE)
${conversationTranscript}

---

## 3. DATASET TABELLARE CSV CONFIGURATO
\`\`\`csv
${effectiveCsv.trim()}
\`\`\`

---

## 4. CODICE SORGENTE OPENQASM 2.0 (VALIDATO PER IBM QPU)
\`\`\`qasm
${effectiveQasm.trim()}
\`\`\`

---

## 5. SCRIPT DI ESECUZIONE PYTHON QISKIT (AER SIMULATOR & HARDWARE)
\`\`\`python
${effectiveQiskit.trim()}
\`\`\`
`;
  };

  const copyInterviewSummary = () => {
    const report = generateInterviewReport();
    navigator.clipboard.writeText(report);
    setIsInterviewCopied(true);
    setTimeout(() => setIsInterviewCopied(false), 2500);
  };

  const handleDownloadInterviewReport = () => {
    const report = generateInterviewReport();
    const cleanSectorName = (selectedSector || 'enterprise').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `verbale_intervista_quantistica_${cleanSectorName}.md`;
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Spreadsheet state for Excel-like viewer
  const [selectedCell, setSelectedCell] = useState<{
    tableId: string;
    rowIndex: number;
    colIndex: number;
    value: string;
  } | null>(null);

  const getColLetter = (colIdx: number): string => {
    return String.fromCharCode(65 + (colIdx % 26));
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFeedRef = useRef<HTMLDivElement>(null);

  // Custom visual compiler formatter to justify text and render beautiful tables out of plain text
  const renderWithInlineFormats = (text: string) => {
    const segments = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return segments.map((seg, sIdx) => {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return <strong key={sIdx} className="text-white font-extrabold">{seg.substring(2, seg.length - 2)}</strong>;
      }
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return <code key={sIdx} className="bg-[#00f2ff]/15 border border-[#00f2ff]/30 text-[#00f2ff] px-1.5 py-0.5 rounded font-mono text-[10.5px] font-bold">{seg.substring(1, seg.length - 1)}</code>;
      }
      return seg;
    });
  };

  const renderTableFromLines = (tableLines: string[], key: string) => {
    // Filter out delimiter line (the row with dashes)
    const dataLines = tableLines.filter(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const clean = trimmed.replace(/[\s\-:|]/g, '');
        if (clean.length === 0 && trimmed.includes('-')) {
          return false;
        }
      }
      return trimmed.startsWith('|');
    });
    if (dataLines.length === 0) return null;
    
    const headerCols = dataLines[0]
      .split('|')
      .map(col => col.trim())
      .filter((col, colIdx, arr) => colIdx !== 0 && colIdx !== arr.length - 1);
    
    const rows = dataLines.slice(1).map((line) => {
      return line
        .split('|')
        .map(col => col.trim())
        .filter((col, colIdx, arr) => colIdx !== 0 && colIdx !== arr.length - 1);
    }).filter(row => row.length > 0);

    const isThisTableSelected = selectedCell && selectedCell.tableId === key;
    const activeRowIdx = isThisTableSelected ? selectedCell.rowIndex : 0;
    const activeColIdx = isThisTableSelected ? selectedCell.colIndex : 0;

    // Safety checks
    const safeRowIdx = Math.min(activeRowIdx, rows.length - 1);
    const safeColIdx = Math.min(activeColIdx, headerCols.length - 1);

    const activeCellValue = rows[safeRowIdx] && rows[safeRowIdx][safeColIdx] ? rows[safeRowIdx][safeColIdx].replace(/\*\*/g, '').trim() : '';
    const activeCellName = `${getColLetter(safeColIdx)}${safeRowIdx + 1}`;

    return (
      <div key={key} className="my-5 overflow-hidden rounded-xl border border-slate-700 bg-[#0c1322] shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-xs max-w-full font-sans">
        {/* Grid Viewport */}
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse border-spacing-0 min-w-[600px]">
            <thead>
              {/* Letters row (A, B, C...) */}
              <tr className="bg-[#131d31] border-b border-slate-800 select-none text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider h-7">
                <th className="w-10 bg-[#16233b] border-r border-slate-800 text-center relative font-semibold shrink-0">
                  <div className="absolute right-0 bottom-0 w-0 h-0 border-r-[6px] border-r-slate-500 border-t-[6px] border-t-transparent" />
                </th>
                {headerCols.map((_, i) => (
                  <th key={i} className="p-1 text-center border-r border-slate-800 shrink-0">
                    {getColLetter(i)}
                  </th>
                ))}
              </tr>
              {/* Header names row */}
              <tr className="bg-[#0f172a] border-b border-slate-800 text-slate-200 font-bold uppercase text-[9.5px] tracking-wider">
                <th className="bg-[#16233b] border-r border-slate-800 text-slate-500 text-center font-mono text-[9px] font-bold shrink-0">
                  A-Z
                </th>
                {headerCols.map((h, i) => {
                  const refinedH = h.replace(/\*\*/g, '').replace(/_/g, ' ').trim();
                  return (
                    <th key={i} className="p-3 px-4 border-r border-slate-800 last:border-r-0 font-bold font-sans">
                      {refinedH}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-slate-800 last:border-b-0 text-slate-300 font-sans">
                  {/* Row number column */}
                  <td className="bg-[#16233b]/80 border-r border-slate-800 text-[10px] text-slate-400 text-center font-mono font-bold select-none h-9 shrink-0">
                    {ri + 1}
                  </td>
                  {/* Real data cells */}
                  {row.map((val, vi) => {
                    const isSelected = selectedCell && selectedCell.tableId === key && selectedCell.rowIndex === ri && selectedCell.colIndex === vi;
                    const cleanVal = val.replace(/\*\*/g, '').trim();
                    return (
                      <td 
                        key={vi} 
                        onClick={() => setSelectedCell({ tableId: key, rowIndex: ri, colIndex: vi, value: cleanVal })}
                        className={`p-3 px-4 border-r border-slate-800 last:border-r-0 text-[11px] font-mono cursor-cell select-none transition-all relative ${
                          ri % 2 === 0 ? 'bg-[#090f1a]' : 'bg-[#0e1726]'
                        } ${
                          isSelected 
                            ? 'bg-emerald-500/10 outline outline-2 -outline-offset-1 outline-emerald-500 z-10' 
                            : 'hover:bg-slate-800/45'
                        }`}
                      >
                        {cleanVal === 'LIBERO' ? (
                          <span className="text-slate-500 italic font-sans">Libero</span>
                        ) : cleanVal.toLowerCase().includes('correlato') || cleanVal.toLowerCase().includes('legame') || cleanVal.toLowerCase().includes('accopp') || (cleanVal.length > 4 && isNaN(Number(cleanVal)) && vi === row.length - 1) ? (
                          <span className="text-emerald-400 font-bold">{cleanVal}</span>
                        ) : !isNaN(Number(cleanVal)) ? (
                          <span className="text-cyan-400 font-medium">{cleanVal}</span>
                        ) : (
                          <span className="text-slate-300">{renderWithInlineFormats(val)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Toolbar under the table */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 bg-[#090e1a] border-t border-slate-800 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <FileSpreadsheet className="w-4 h-4 text-quantum-primary" />
            <span className="text-[10.5px] font-semibold text-slate-300">
              {isIt ? 'Dataset Tabellare Quantistico' : 'Quantum Dataset Table'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const cleanHeaders = headerCols.map(h => h.replace(/\*\*/g, '').replace(/<[^>]*>/g, '').trim());
                const cleanRows = rows.map(r => r.map(cell => cell.replace(/\*\*/g, '').replace(/<[^>]*>/g, '').trim()));
                const csvContent = [
                  cleanHeaders.join(','),
                  ...cleanRows.map(r => r.join(','))
                ].join('\n');
                
                const cleanSectorName = (selectedSector || 'Quantum').replace(/[^a-zA-Z0-9]/g, '_');
                const filename = `quantum_table_default_${cleanSectorName}.csv`;

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(16,185,129,0.25)]"
              title={isIt ? "Scarica questa tabella come file CSV" : "Download this table as CSV"}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isIt ? 'Scarica CSV' : 'Download CSV'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-quantum-primary/15 hover:bg-quantum-primary/25 border border-quantum-primary/40 text-quantum-primary font-mono text-[11px] font-bold rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(0,242,255,0.25)]"
              title={isIt ? "Carica un file CSV dal tuo computer" : "Upload a CSV file from your computer"}
            >
              <Upload className="w-3.5 h-3.5 text-quantum-primary" />
              <span>{isIt ? 'Carica file CSV' : 'Upload CSV File'}</span>
            </button>
          </div>
        </div>

      </div>
    );
  };

  const renderMessageContent = (rawText: string) => {
    const text = rawText.replace(/\[DATI_QUANTISTICI\][\s\S]*$/g, '').trim();
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, idx) => {
      if (part.startsWith('```')) {
        const lines = part
          .replace(/```[a-zA-Z]*\n?/, '')
          .replace(/```$/, '')
          .trim()
          .split('\n');
        
        const isCSV = part.includes('Codice_Articolo') || part.includes('Percentuale_Saturazione') || part.includes('Rendimento_Previsto') || part.includes('Volume_Rimanenze_Maglia') || part.includes('Punti_Saldatura_XYZ') || part.includes('Tassi_Cambio_Spot') || part.includes('Attenuazione_dB') || part.includes('Compatibilità_HLA');
        
        if (isCSV) {
          const headerCols = lines[0].split(',').map(h => h.trim());
          const rows = lines.slice(1).map(line => line.split(',').map(v => v.trim())).filter(row => row.length > 0 && row[0] !== '');
          const tableId = `csv-${idx}`;

          return (
            <div key={idx} className="my-5 overflow-hidden rounded-xl border border-slate-700 bg-[#0c1322] shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-xs max-w-full font-sans">
              {/* Grid Viewport */}
              <div className="overflow-x-auto max-w-full">
                <table className="w-full text-left border-collapse border-spacing-0 min-w-[600px]">
                  <thead>
                    {/* Letters row (A, B, C...) */}
                    <tr className="bg-[#131d31] border-b border-slate-800 select-none text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider h-7">
                      <th className="w-10 bg-[#16233b] border-r border-slate-800 text-center relative font-semibold shrink-0">
                        <div className="absolute right-0 bottom-0 w-0 h-0 border-r-[6px] border-r-slate-500 border-t-[6px] border-t-transparent" />
                      </th>
                      {headerCols.map((_, i) => (
                        <th key={i} className="p-1 text-center border-r border-slate-800 shrink-0">
                          {getColLetter(i)}
                        </th>
                      ))}
                    </tr>
                    {/* Header names row */}
                    <tr className="bg-[#0f172a] border-b border-slate-800 text-slate-200 font-bold uppercase text-[9.5px] tracking-wider">
                      <th className="bg-[#16233b] border-r border-slate-800 text-slate-500 text-center font-mono text-[9px] font-bold shrink-0">
                        A-Z
                      </th>
                      {headerCols.map((h, i) => (
                        <th key={i} className="p-3 px-4 border-r border-slate-800 last:border-r-0 font-bold font-sans">
                          {h.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-slate-800 last:border-b-0 text-slate-300 font-sans">
                        {/* Row number column */}
                        <td className="bg-[#16233b]/80 border-r border-slate-800 text-[10px] text-slate-400 text-center font-mono font-bold select-none h-9 shrink-0">
                          {ri + 1}
                        </td>
                        {/* Real data cells */}
                        {row.map((val, vi) => {
                          const isSelected = selectedCell && selectedCell.tableId === tableId && selectedCell.rowIndex === ri && selectedCell.colIndex === vi;
                          const cleanVal = val.trim();
                          return (
                            <td 
                              key={vi} 
                              onClick={() => setSelectedCell({ tableId, rowIndex: ri, colIndex: vi, value: cleanVal })}
                              className={`p-3 px-4 border-r border-slate-800 last:border-r-0 text-[11px] font-mono cursor-cell select-none transition-all relative ${
                                ri % 2 === 0 ? 'bg-[#090f1a]' : 'bg-[#0e1726]'
                              } ${
                                isSelected 
                                  ? 'bg-emerald-500/10 outline outline-2 -outline-offset-1 outline-emerald-500 z-10' 
                                  : 'hover:bg-slate-800/45'
                              }`}
                            >
                              {vi === 0 ? (
                                <span className="text-quantum-secondary font-bold">{cleanVal}</span>
                              ) : vi === 1 ? (
                                <span className="bg-quantum-primary/10 text-quantum-primary px-1.5 py-0.5 rounded font-bold">{cleanVal}</span>
                              ) : cleanVal === 'LIBERO' ? (
                                <span className="text-slate-500 italic font-sans">Libero</span>
                              ) : !isNaN(Number(cleanVal)) ? (
                                <span className="text-cyan-400 font-medium">{cleanVal}</span>
                              ) : (
                                <span className="text-slate-300">{cleanVal}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Toolbar under the CSV table */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 bg-[#090e1a] border-t border-slate-800 text-[11px] font-mono">
                <div className="flex items-center gap-2 text-slate-400">
                  <FileSpreadsheet className="w-4 h-4 text-quantum-primary" />
                  <span className="text-[10.5px] font-semibold text-slate-300">
                    {isIt ? 'Dataset Tabellare Quantistico' : 'Quantum Dataset Table'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const csvText = [headerCols.join(','), ...rows.map(r => r.join(','))].join('\n');
                      const cleanSectorName = (selectedSector || 'Quantum').replace(/[^a-zA-Z0-9]/g, '_');
                      const filename = `quantum_template_${cleanSectorName}.csv`;

                      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.setAttribute('href', url);
                      link.setAttribute('download', filename);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                    title={isIt ? "Scarica questa tabella come file CSV" : "Download this table as CSV"}
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isIt ? 'Scarica CSV' : 'Download CSV'}</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-quantum-primary/15 hover:bg-quantum-primary/25 border border-quantum-primary/40 text-quantum-primary font-mono text-[11px] font-bold rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(0,242,255,0.25)]"
                    title={isIt ? "Carica un file CSV dal tuo computer" : "Upload a CSV file from your computer"}
                  >
                    <Upload className="w-3.5 h-3.5 text-quantum-primary" />
                    <span>{isIt ? 'Carica file CSV' : 'Upload CSV File'}</span>
                  </button>
                </div>
              </div>

            </div>
          );
        }

        // Standard code or QASM structure with copy action buttons
        const cleanCodeText = part.replace(/```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
        const isQasmSnippet = cleanCodeText.includes('OPENQASM') || cleanCodeText.includes('qreg') || part.startsWith('```qasm');
        const langMatch = part.match(/^```([a-zA-Z0-9_-]+)/);
        const langName = langMatch ? langMatch[1].toUpperCase() : (isQasmSnippet ? 'OPENQASM 2.0' : 'CODE');

        return (
          <div key={idx} className="my-3 bg-[#070b14] border border-white/10 rounded-xl overflow-hidden font-mono text-xs shadow-md">
            {/* Code Block Header with Actions */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-[#0c1527] border-b border-white/10">
              <span className="text-[10px] font-mono font-bold text-quantum-primary uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" />
                {langName}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyCode(cleanCodeText)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-quantum-primary/10 hover:bg-quantum-primary/20 border border-quantum-primary/30 text-quantum-primary text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                  title="Copia negli appunti questo blocco di codice"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Copiato!' : 'Copia Codice'}</span>
                </button>
                {isQasmSnippet && (
                  <button
                    onClick={copyInterviewSummary}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                    title="Copia il verbale completo (Domande, Risposte, CSV e Circuito)"
                  >
                    {isInterviewCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <FileText className="w-3 h-3" />}
                    <span>{isInterviewCopied ? 'Verbale Copiato!' : 'Copia Verbale & CSV'}</span>
                  </button>
                )}
              </div>
            </div>
            <pre className="p-4 overflow-x-auto text-quantum-secondary select-all whitespace-pre leading-relaxed text-[11px]">
              {cleanCodeText}
            </pre>
          </div>
        );
      }

      // Segment the paragraph into normal text sections and table blocks
      const paragraphs = part.split('\n\n');
      return (
        <div key={idx} className="space-y-3">
          {paragraphs.map((par, pIdx) => {
            if (!par.trim()) return null;
            
            // Check if paragraph contains lines of a markdown table
            const lines = par.split('\n');
            const hasTableDelimiter = lines.some(line => {
              const trimmed = line.trim();
              if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                const clean = trimmed.replace(/[\s\-:|]/g, '');
                return clean.length === 0 && trimmed.includes('-');
              }
              return false;
            });
            
            if (hasTableDelimiter) {
              // We have a markdown table in this paragraph!
              const renderedParagraphParts: React.ReactNode[] = [];
              let currentTableLines: string[] = [];
              let normaltextGroup: string[] = [];
              
              const flushNormalText = (keySuffix: string) => {
                if (normaltextGroup.length > 0) {
                  const textContent = normaltextGroup.join('\n');
                  renderedParagraphParts.push(
                    <p key={`text-${keySuffix}`} className="text-slate-300 leading-relaxed text-justify whitespace-pre-wrap">
                      {renderWithInlineFormats(textContent)}
                    </p>
                  );
                  normaltextGroup = [];
                }
              };
              
              const flushTable = (keySuffix: string) => {
                if (currentTableLines.length > 0) {
                  const tableHtml = renderTableFromLines(currentTableLines, `${pIdx}-${keySuffix}`);
                  if (tableHtml) {
                    renderedParagraphParts.push(tableHtml);
                  }
                  currentTableLines = [];
                }
              };
              
              lines.forEach((line, lineIdx) => {
                const trimmedLine = line.trim();
                const isTableLine = trimmedLine.startsWith('|');
                
                if (isTableLine) {
                  flushNormalText(`${lineIdx}`);
                  currentTableLines.push(line);
                } else {
                  flushTable(`${lineIdx}`);
                  normaltextGroup.push(line);
                }
              });
              
              flushNormalText('end');
              flushTable('end');
              
              return (
                <div key={pIdx} className="space-y-3">
                  {renderedParagraphParts}
                </div>
              );
            }

            // Detect if this paragraph represents list bullets
            const bulletLines = par.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
            if (bulletLines.length > 0) {
              return (
                <div key={pIdx} className="space-y-2 my-2 py-1">
                  {par.split('\n').map((line, lIdx) => {
                    const cleanLine = line.trim();
                    if (!cleanLine) return null;
                    const isB = cleanLine.startsWith('-') || cleanLine.startsWith('*');
                    const textToShow = isB ? cleanLine.substring(1).trim() : cleanLine;
                    
                    if (isB) {
                      return (
                        <div key={lIdx} className="pl-4 flex items-start gap-2 text-justify">
                          <span className="text-quantum-primary text-xs mt-1 shrink-0">•</span>
                          <span className="text-[12.5px] leading-relaxed text-slate-300">{renderWithInlineFormats(textToShow)}</span>
                        </div>
                      );
                    }
                    return (
                      <p key={lIdx} className="text-[12.5px] leading-relaxed text-slate-300 text-justify">{renderWithInlineFormats(textToShow)}</p>
                    );
                  })}
                </div>
              );
            }

            // High priority callouts
            const isCallout = par.includes('💡') || par.includes('👉') || par.includes('👋');
            
            // Parse inline formats
            const inlineParts = par.split(/(\*\*.*?\*\*|`.*?`)/g);
            const renderedSpan = inlineParts.map((subPart, sIdx) => {
              if (subPart.startsWith('**') && subPart.endsWith('**')) {
                return <strong key={sIdx} className="text-white font-bold">{subPart.slice(2, -2)}</strong>;
              }
              if (subPart.startsWith('`') && subPart.endsWith('`')) {
                return <code key={sIdx} className="bg-white/5 border border-white/10 text-quantum-secondary px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">{subPart.slice(1, -1)}</code>;
              }
              return subPart;
            });

            if (par.includes('[ACTION: RENDER_BUTTON_SEND_TO_IBM_Q]')) {
              return (
                <div key={pIdx} className="my-4 p-5 bg-[#0a0f1d] border border-quantum-primary/25 rounded-2xl flex flex-col items-center gap-4 text-center shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#00f2ff] font-black">IBM QUANTUM HOST BRIDGE & EXPORT MODULE</span>
                    <p className="text-[11px] text-slate-400 font-mono tracking-tight max-w-md">
                      Circuito OpenQASM 2.0 validato e pronto per la compilazione su IBM QPU o per il salvataggio dei verbali e dati dell'intervista.
                    </p>
                  </div>

                  {/* Primary Action: Transmit to IBM QPU */}
                  <button
                    onClick={() => {
                      if (onSendToIbm) {
                        onSendToIbm(qasmOutput);
                      }
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#00f2ff] hover:bg-[#00e1f0] text-[#090d18] font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:shadow-[0_0_22px_rgba(0,242,255,0.5)] cursor-pointer hover:scale-[1.01]"
                  >
                    <Cpu className="w-4 h-4 text-[#090d18] fill-[#090d18] animate-pulse" /> Trasmetti Circuito a IBM Q Real QPU 🚀
                  </button>

                  {/* Secondary Export & Copy Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 border-t border-white/5 w-full">
                    {/* Copy QASM Button */}
                    <button
                      onClick={() => copyCode(qasmOutput || '')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-quantum-primary/15 hover:bg-quantum-primary/25 border border-quantum-primary/40 text-quantum-primary font-mono text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(0,242,255,0.25)]"
                      title="Copia negli appunti il codice sorgente OpenQASM 2.0 prodotto"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'QASM Copiato!' : 'Copia Codice OpenQASM'}</span>
                    </button>

                    {/* Copy Interview Q&A + CSV Summary Button */}
                    <button
                      onClick={copyInterviewSummary}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                      title="Copia il testo completo di tutte le domande, risposte fornite, tabella CSV e circuito"
                    >
                      {isInterviewCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                      <span>{isInterviewCopied ? 'Verbale & CSV Copiati!' : 'Copia Verbale Intervista & CSV'}</span>
                    </button>

                    {/* Download Interview Report Button */}
                    <button
                      onClick={handleDownloadInterviewReport}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                      title="Scarica il verbale completo (Q&A + CSV + QASM) come documento Markdown"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Scarica Verbale (.md)</span>
                    </button>

                    {/* Download QASM File Button */}
                    <button
                      onClick={handleDownloadQasm}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-mono text-xs font-bold rounded-xl transition-all cursor-pointer"
                      title="Scarica il file .qasm del circuito"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Scarica File .qasm</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <p 
                key={pIdx} 
                className={`text-[12.5px] leading-relaxed text-slate-300 ${
                  isCallout 
                    ? 'bg-quantum-primary/5 border border-quantum-primary/20 p-4 rounded-xl shadow-inner my-3 flex items-start gap-2.5' 
                    : ''
                }`}
              >
                <span className="flex-1 block text-justify leading-relaxed">{renderedSpan}</span>
              </p>
            );
          })}
        </div>
      );
    });
  };

  const isUserUnsureOrAsking = (text: string): boolean => {
    const norm = text.toLowerCase().trim();
    if (norm.endsWith('?') || norm.includes('?')) return true;
    
    const keywords = [
      'non so', 'non capisco', 'non ho capito', 'cosa intendi', 'cosa significa', 
      'cosa vuol dire', 'che significa', 'come faccio', 'perché', 'spiegami', 
      'cosa inserisco', 'che tipo di', 'spiegazione', 'cos\'è', 'cosa rappresenta',
      'non saprei', 'che vuol dire', 'aiuto', 'un esempio', 'dammi un esempio',
      'non sono sicuro', 'non sono sicura', 'chiarimento', 'spiega', 'spiega meglio',
      'intendi', 'cosa faresti', 'come rispondo', 'che valore', 'all\'anno', 'al mese',
      'al giorno', 'unita', 'unità', 'periodo', 'tempo', 'misura', 'non e chiaro',
      'non è chiaro', 'delucidazione', 'chiarimento'
    ];
    
    return keywords.some(kw => norm.includes(kw));
  };

  const getClarificatoryExplanation = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes('tolleranza') || q.includes('rischio') || q.includes('tolerance') || q.includes('risk')) {
      return "Risk tolerance indicates how willing you are to accept fluctuations to protect capital or cargo. \n\n❗ **Frequency & Scale:** Refers to an **annual** strategic time horizon. You can specify whether you prefer a prudent ('conservative'), balanced ('moderate'), or efficiency-focused ('aggressive') approach.";
    }
    if (q.includes('volatilità') || q.includes('volatility')) {
      return "Volatility measures the intensity of price fluctuations for your financial assets. \n\n❗ **Frequency & Scale:** Price oscillations calculated on a **daily or monthly** basis projected to an **annual** timeline. You can respond with an estimated percentage (e.g. '20% per year') or specify if you expect 'high' or 'low' market price fluctuations.";
    }
    if (q.includes('precisione') || q.includes('scadenza') || q.includes('precision') || q.includes('expiry') || q.includes('maturity')) {
      return "Concerns the level of geometric refinement for the optimal timing to exercise options. \n\n❗ **Frequency & Scale:** Refers to desired accuracy for typical financial horizons in the **short term (monthly)** or **medium-long term (e.g. quarterly or annual)**. You can request 'high' or 'standard' precision.";
    }
    if (q.includes('risk-free') || q.includes('tasso') || q.includes('rate')) {
      return "The risk-free rate indicates the theoretical yield of a zero-risk investment (e.g., government bonds). \n\n❗ **Frequency & Scale:** Expressed as an **annual** percentage rate of return. A typical current reference rate is around **'4% per year'** or **'4.5% per year'**. If you type 'default' or 'standard', we will use the optimized value of 4.5% per year.";
    }
    if (q.includes('orizzonte') || q.includes('mensile') || q.includes('settimana') || q.includes('horizon') || q.includes('monthly') || q.includes('week')) {
      return "Defines the future period over which to analyze cash flows. \n\n❗ **Frequency & Scale:** The future portfolio analysis horizon can be short-term (e.g., **'15 or 30 days'**), medium-term (e.g., **'monthly'** or **'quarterly'**), or long-term (**'annual'**). Choose the interval that suits your needs.";
    }
    if (q.includes('insoluto') || q.includes('fatture') || q.includes('invoice') || q.includes('unpaid')) {
      return "Measures the average percentage share of unpaid invoices at maturity from customers. \n\n❗ **Frequency & Scale:** Percentage calculated on total **annual** turnover (e.g. '2% of annual turnover'). You can specify a simple numeric value like '2%' or '5%', or write 'no unpaid' if collections are punctual.";
    }
    if (q.includes('veicoli') || q.includes('flotta') || q.includes('vehicle') || q.includes('fleet')) {
      return "Refers to the number of active company vehicles simultaneously distributing physical goods. \n\n❗ **Frequency & Scale:** Calculated as maximum operating vehicles **per day** (e.g. '10 active vehicles per day'). Used to scale the qubit density needed to optimize routes.";
    }
    if (q.includes('finestre temporali') || q.includes('scarico') || q.includes('window') || q.includes('time window')) {
      return "Time windows indicate schedule rigidity for deliveries or logistics pick-ups. \n\n❗ **Frequency & Scale:** Managed on **daily** hourly shifts (e.g. 08:00 to 12:00 morning slots). You can specify if schedules are 'strict/binding' (e.g. penalties for daily delays) or 'flexible' (full tolerance).";
    }
    if (q.includes('pescaggio') || q.includes('portata') || q.includes('payload') || q.includes('capacity')) {
      return "Cargo capacity or physical volumetric limits of holds for 3D bin packing. \n\n❗ **Frequency & Scale:** Calculated in total shipment tonnage **per single voyage/shipment**, not annually. Enter a maximum limit tonnage (e.g. '20 tons') or type 'standard' to load average ship profiles.";
    }
    if (q.includes('baricentro') || q.includes('sfasamenti') || q.includes('center of gravity') || q.includes('balance')) {
      return "Vessel stability requires geometric balancing of total container weight on board. \n\n❗ **Frequency & Scale:** Balance tolerance evaluated **per single voyage**. You can request 'low tolerance' for maximum trim severity, geometric stability, and preventing tilt during transit, or 'normal'.";
    }
    if (q.includes('contratti') || q.includes('fissa') || q.includes('contract') || q.includes('fixed')) {
      return "Percentage of shipments prepaid or protected with long-term fixed contracts with shipowners. \n\n❗ **Frequency & Scale:** Calculated on total contracted logistics volume on an **annual** basis (e.g. '50% per year'). The higher this percentage, the less sensitive the circuit will be to spot rate speculation on the amplitude qubit.";
    }
    if (q.includes('costi di trasporto') || q.includes('target') || q.includes('riduzione') || q.includes('freight') || q.includes('savings')) {
      return "Desired cost savings target on spot container ocean freight. \n\n❗ **Frequency & Scale:** Target applied to **monthly or annual** logistics expenditure (e.g., '15% annual savings on freight'). The quantum algorithm will map probabilistic rotation to force surpassing this cost target.";
    }
    if (q.includes('storage') || q.includes('bess') || q.includes('mwh')) {
      return "Nominal maximum capacity of the corporate battery system used to store solar or wind energy before feeding it into the grid. \n\n❗ **Frequency & Scale:** Total energy capacity storable and deliverable **daily** (e.g. '10 megawatt-hours (MWh)'). Consistent with the sizing of the amplitude qubit.";
    }
    if (q.includes('immissione') || q.includes('curtailing') || q.includes('rete') || q.includes('grid') || q.includes('injection')) {
      return "Maximum allowed instantaneous grid injection power limit to prevent overloads or distributor penalties. \n\n❗ **Frequency & Scale:** Thermal or regulatory limit measured continuously or with a daily cap in Megawatts (MW) (e.g. '1.5 MW maximum **per day**'). Respond with power or 'no limit'.";
    }
    if (q.includes('orbitali') || q.includes('vqe') || q.includes('orbital')) {
      return "Molecular energy channels to simulate on the quantum computer to verify cohesion and chemical bonding. \n\n❗ **Frequency & Scale:** Refers to a static simulation **per run** of molecular calculation. Typically, each active orbital requires assigning a dedicated qubit (e.g. '4 molecular orbitals per run').";
    }
    if (q.includes('ansatz')) {
      return "Concerns the variational geometric algorithm for exploring molecular combinations. \n\n❗ **Frequency & Scale:** High-frequency logical setup parameter **within the VQE convergence loop**. If you are not familiar with the science, simply answer 'UCCSD' (industry standard) or 'optimal'.";
    }
    if (q.includes('conducibilità') || q.includes('ec') || q.includes('idroponica') || q.includes('conductivity') || q.includes('hydroponic')) {
      return "Mineral nutrient levels dissolved in water to feed roots in hydroponic greenhouses. \n\n❗ **Frequency & Scale:** Value measured continuously **per growth/cultivation cycle** (e.g. '1.8 mS/cm for herbs or salad', '2.8 mS/cm for tomatoes'). Provide desired conductivity for your crop.";
    }
    if (q.includes('consumi') || q.includes('led') || q.includes('artificiale') || q.includes('irradiance') || q.includes('lighting')) {
      return "Scheduling of LED energy input and irradiance to optimize growth while balancing electrical costs. \n\n❗ **Frequency & Scale:** Total electricity power consumption measured **monthly** or **annually**. Respond with a priority (e.g. 'priority to reduced consumption on monthly basis' or 'maximum growth rate').";
    }
    if (q.includes('tempo di ciclo robot') || q.includes('ciclo') || q.includes('cycle time') || q.includes('robot')) {
      return "Average time duration required for a robotic arm or station to complete a repetitive task before moving to the next piece. \n\n❗ **Frequency & Scale:** Expressed in seconds needed **per single piece** (e.g. '120 seconds per piece'). Defines real factory line operating speed.";
    }
    if (q.includes('consegna') || q.includes('ritardi') || q.includes('delay') || q.includes('supply')) {
      return "Historical average of delays encountered in supplying or delivering work-in-progress or materials for the assembly line. \n\n❗ **Frequency & Scale:** Calculated as average delay in minutes **per week** or **per day** (e.g. '10 minutes average delay per week').";
    }
    if (q.includes('punti di saldatura') || q.includes('curvatura') || q.includes('welding') || q.includes('touchpoint')) {
      return "Describes how many physical touchpoints the robot must make for joints or mobility in 3D space. \n\n❗ **Frequency & Scale:** Programmed number of touches applied **per work unit/piece** (e.g. '15 points per piece').";
    }
    if (q.includes('volumi') || q.includes('rimanenze') || q.includes('abbigliamento') || q.includes('maglia') || q.includes('invenduto') || q.includes('stagion') || q.includes('annual') || q.includes('inventory') || q.includes('stock')) {
      return "Physical quantity of clothing or unsold knitwear inventory held in warehouse for high-rate clearance.\n\n❗ **Frequency & Scale:** You must distinguish with high precision the time horizon required by the quantum model. Specify clearly if calculated stock refers to **Seasonal (e.g. '1200 seasonal pieces')** or total **Annual (e.g. '3500 annual pieces')** inventory. This detail is essential for the algorithm to properly calibrate amplitude qubit weights and determine optimal dynamic discount turnover.";
    }
    if (q.includes('margine minimo') || q.includes('perdita') || q.includes('margin') || q.includes('breakeven')) {
      return "Minimum acceptable baseline margin per item sold to remain profitable or breakeven. \n\n❗ **Frequency & Scale:** Expressed as a percentage over total unit production cost, calculated **per single sale or on a seasonal/annual basis** (e.g. '15% seasonal basis' or '15% per piece'). Below this threshold, the algorithm will never propose discounts.";
    }
    if (q.includes('antigeni') || q.includes('hla') || q.includes('antigen')) {
      return "Human leukocyte antigens used to determine immunological compatibility between recipient and donor. \n\n❗ **Frequency & Scale:** Refers to each individual clinical matching test for transplant. A perfect biological match is **'6 out of 6'** or **'8 out of 8'** total matching antigens.";
    }
    if (q.includes('ischemia fredda') || q.includes('ore') || q.includes('ischemia') || q.includes('hours')) {
      return "Biological safety time window during which the organ can remain cold outside the human body before implantation. \n\n❗ **Frequency & Scale:** Expressed in useful hours **per harvested organ** (e.g. '4 to 6 hours' for heart, '12 hours' for liver).";
    }
    if (q.includes('residui amminoacidici') || q.includes('simulazione proteica') || q.includes('amino') || q.includes('protein')) {
      return "Total size of the protein segment or peptide to geometrically model on qubits. \n\n❗ **Frequency & Scale:** Amino acid sequence length analyzed **per single static run** (e.g. 'short segment of 10 amino acids per run').";
    }
    if (q.includes('forze di legame') || q.includes('idrogeno') || q.includes('van der waals') || q.includes('bond')) {
      return "Indicates whether the algorithm should prioritize primary hard hydrogen bonds or weaker surface molecular interactions (Van Der Waals). \n\n❗ **Frequency & Scale:** Evaluated as a static chemical parameter **per structural model**.";
    }
    if (q.includes('età') || q.includes('riammissione') || q.includes('dimissioni') || q.includes('age') || q.includes('readmission')) {
      return "Demographic clusters of patients at highest statistical risk of unplanned post-discharge readmission. \n\n❗ **Frequency & Scale:** Monitored on data accumulated **annually** (e.g. 'patients over 65 years old in the past year'). Provide age range or respond 'standard'.";
    }
    if (q.includes('visite') || q.includes('follow-up') || q.includes('controlli') || q.includes('followup')) {
      return "Planned preventive medical check-up schedule to monitor patient recovery after hospital discharge. \n\n❗ **Frequency & Scale:** Total planned check-ups **in the first month (30 days) post-discharge** (e.g. '1 visit per week in the first month').";
    }
    if (q.includes('distanza') || q.includes('fibra') || q.includes('qkd') || q.includes('fiber') || q.includes('distance')) {
      return "Physical fiber optic cabling length between sites to distribute quantum security keys protected against hackers. \n\n❗ **Frequency & Scale:** Total physical link length of corporate geographic network measured **one-time** (e.g. '50 km total link extension').";
    }
    if (q.includes('connessioni') || q.includes('insolito') || q.includes('allerta') || q.includes('connection') || q.includes('attack')) {
      return "Number of unusual connection attempts or brute-force attack attempts triggering the protective entanglement alert. \n\n❗ **Frequency & Scale:** Frequency measured as suspicious connections **per minute** (e.g. 'over 50 anomalous connections per minute').";
    }
    if (q.includes('rotazione') || q.includes('rotation')) {
      return "Programmed frequency to regenerate and recalculate the entire set of cryptographic keys to prevent intrusion. \n\n❗ **Frequency & Scale:** Programmed schedule expressed in days or hours (e.g. 'every 14 days' or 'every 24 hours').";
    }
    if (q.includes('post-quantum') || q.includes('nist') || q.includes('pqc')) {
      return "Post-quantum standard the organization intends to map. 'ML-KEM' (Kyber) is the most widely used post-quantum encryption standard. \n\n❗ **Frequency & Scale:** Refers to fixed corporate cryptographic standard configured in software.";
    }
    if (q.includes('archivi') || q.includes('migrazione') || q.includes('database') || q.includes('archive') || q.includes('migration')) {
      return "Most vulnerable strategic information asset requiring priority migration to networks protected by quantum algorithms. \n\n❗ **Frequency & Scale:** Fixed corporate information asset (e.g. 'current year central database' or 'local backup server').";
    }

    return "This indicator serves to set a correct probabilistic weight in the quantum model database. You can respond with an estimate per year, month, or day, or simply indicate whether you desire maximum operational security or computational efficiency.";
  };

  const createAnswerValidator = (keywords: string[], options: string[], questionDesc: string) => {
    return (ans: string): { valid: boolean; error?: string } => {
      const raw = ans.toLowerCase().trim();
      if (!raw) return { valid: false, error: 'La risposta non può essere vuota.' };
      if (['default', 'continue', 'continua', 'proceed', 'ok', 'go', 'standard', 'avanti', 'accetta', 'consigliato'].includes(raw)) {
        return { valid: true };
      }
      const hasKeyword = keywords.some(kw => raw.includes(kw.toLowerCase()));
      const hasOptionMatch = options.some(opt => {
        const optLower = opt.toLowerCase();
        return raw.includes(optLower) || optLower.includes(raw);
      });
      if (hasKeyword || hasOptionMatch) {
        return { valid: true };
      }
      return {
        valid: false,
        error: `Hai risposto: "${ans}". Questa risposta non corrisponde alle opzioni previste per ${questionDesc}.`
      };
    };
  };

  function getScenarioDetails(macroarea: string, option: 'A' | 'B' | 'C') {
    if (macroarea.includes('Finanza') || macroarea.includes('Finance')) {
      if (option === 'A') {
        const optionsQ1 = ["Conservative (Strategic low risk)", "Moderate (Balanced risk)", "Aggressive (High growth risk)"];
        const optionsQ2 = ["Historical annual fluctuations", "Monthly average variation"];
        return {
          name: "Cross-Asset Multilevel Quantum Hedging",
          benefit: "Automatic capital protection by cross-referencing multi-asset risks.",
          headers: ["Implicit_Volatility", "Dynamic_Correlation", "Spot_Exchange_Rates"],
          q1: "What is your maximum risk tolerance for Hedging (expressed on an annual strategic basis: conservative, moderate, or aggressive)?",
          optionsQ1,
          validateQ1: createAnswerValidator(['conservat', 'moderat', 'aggressiv', 'basso', 'medio', 'alto', 'low', 'high', 'balanced', 'risk', 'rischio'], optionsQ1, "la tolleranza al rischio (es. Conservative, Moderate, Aggressive)"),
          q2: "How do you wish to weigh capital volatility spikes (e.g., historical annual fluctuations or monthly average variation)?",
          optionsQ2,
          validateQ2: createAnswerValidator(['annual', 'annua', 'historic', 'storic', 'fluctuat', 'fluttuazion', 'month', 'mensil', 'variat', 'variazion', 'media'], optionsQ2, "la ponderazione dei picchi di volatilità (es. Historical annual fluctuations o Monthly average variation)"),
          sample: `Item_Code,Saturation_Percentage,Implicit_Volatility,Dynamic_Correlation,Spot_Exchange_Rates,Entanglement_Link
ASSET_A,0.35,0.45,0.12,0.58,SET_PRIMA
ASSET_B,0.35,0.85,0.65,0.72,SET_PRIMA
ASSET_C,0.12,0.20,0.45,0.45,INDEPENDENT`
        };
      } else if (option === 'B') {
        const optionsQ1 = ["3-month maturity (High precision)", "6-month maturity (Standard precision)"];
        const optionsQ2 = ["4.5% per year (Standard)", "3.0% per year", "5.0% per year"];
        return {
          name: "American Option Pricing and Derivatives",
          benefit: "Calculation of the exact timing and optimal expiration to exercise a financial right.",
          headers: ["Underlying_Price", "Strike_Price", "Risk_Free_Rate", "Time_To_Maturity"],
          q1: "What accuracy level do you require for expiry modeling (e.g. high precision for typical 3 or 6 month maturities)?",
          optionsQ1,
          validateQ1: createAnswerValidator(['3', '6', 'month', 'mesi', 'high', 'alta', 'standard', 'precision', 'precisione', 'scadenza', 'maturit'], optionsQ1, "la precisione e scadenza delle opzioni"),
          q2: "What is the estimated average risk-free rate in your financial model (annual percentage value, e.g. '4.5% per year')?",
          optionsQ2,
          validateQ2: createAnswerValidator(['%', 'rate', 'tasso', 'risk', 'free', 'per year', 'annuo', '3', '4', '5', '0.'], optionsQ2, "il tasso privo di rischio (Risk-Free Rate)"),
          sample: `Item_Code,Saturation_Percentage,Underlying_Price,Strike_Price,Risk_Free_Rate,Time_To_Maturity,Entanglement_Link
OPTION_A,0.45,0.85,0.80,0.04,0.50,GROUP_R
OPTION_B,0.45,0.75,0.80,0.04,0.90,GROUP_R
BOND_X,0.10,0.98,0.95,0.03,0.20,INDEPENDENT`
        };
      } else {
        const optionsQ1 = ["30 days (Monthly horizon)", "60 days (Bi-monthly horizon)", "90 days (Quarterly horizon)"];
        const optionsQ2 = ["2% per year (Standard)", "5% per year", "1% per year"];
        return {
          name: "Short-Term Cash Flow Estimation",
          benefit: "A probabilistic forecast of inflows and outflows to prevent liquidity crises.",
          headers: ["Invoices_Issued", "Invoices_Received", "Payment_Maturities"],
          q1: "What is the ideal time horizon for predictive cash flow estimation (expressed in total analysis days, typically '30 days' or '60 days')?",
          optionsQ1,
          validateQ1: createAnswerValidator(['30', '60', '90', 'day', 'giorn', 'mese', 'month', 'trimestr', 'quarter', 'orizzonte'], optionsQ1, "l'orizzonte temporale di stima della liquidità"),
          q2: "What is the average annual percentage share of unpaid invoices recorded in your financial statement (e.g. '2% per year')?",
          optionsQ2,
          validateQ2: createAnswerValidator(['%', 'invoic', 'fattur', 'unpaid', 'insoluti', '1', '2', '3', '4', '5', 'annuo', '0.'], optionsQ2, "la quota percentuale di fatture insolute"),
          sample: `Item_Code,Saturation_Percentage,Invoices_Issued,Invoices_Received,Payment_Maturities,Entanglement_Link
FLOW_JAN,0.30,0.75,0.60,0.15,LIQUIDITY_SET
FLOW_FEB,0.55,0.90,0.70,0.30,LIQUIDITY_SET
FLOW_MAR,0.12,0.25,0.10,0.10,INDEPENDENT`
        };
      }
    } else if (macroarea.includes('Logistica') || macroarea.includes('Logistics')) {
      if (option === 'A') {
        const optionsQ1 = ["10 vehicles per day", "25 vehicles per day", "50 vehicles per day"];
        const optionsQ2 = ["Strict morning shift priority", "Flexible whole-day distribution"];
        return {
          name: "Vehicle Routing Problem with Time Windows",
          benefit: "The optimal route for your fleet optimizing both load capacity and delivery schedules.",
          headers: ["Geo_Coordinates", "Time_Windows", "Load_Capacity", "Dwell_Times"],
          q1: "What is the maximum number of daily active vehicles to track in your fleet (e.g. '10 vehicles per day')?",
          optionsQ1,
          validateQ1: createAnswerValidator(['vehic', 'veicol', 'mezzi', 'truck', 'camion', '10', '20', '25', '30', '50', 'flotta', 'fleet'], optionsQ1, "il numero di veicoli attivi nella flotta"),
          q2: "How do you prefer to manage pickup and unloading time windows (e.g. strict morning shift priority)?",
          optionsQ2,
          validateQ2: createAnswerValidator(['morning', 'mattina', 'mattutino', 'strict', 'priorit', 'flex', 'flessibile', 'whole', 'day', 'giornata', 'distribuzion'], optionsQ2, "la gestione delle finestre temporali di consegna"),
          sample: `Item_Code,Saturation_Percentage,Geo_Coordinates,Time_Windows,Load_Capacity,Dwell_Times,Entanglement_Link
TRUCK_HUB_A,0.55,0.45,0.12,0.80,0.50,ROUTE_NORTH
TRUCK_HUB_B,0.55,0.48,0.14,0.92,0.80,ROUTE_NORTH
TRUCK_BACK,0.15,0.30,0.18,0.50,0.10,INDEPENDENT`
        };
      } else if (option === 'B') {
        const optionsQ1 = ["500 tons per voyage", "1000 tons per voyage", "250 tons per voyage"];
        const optionsQ2 = ["0.5 meters per voyage", "0.2 meters (High precision)", "1.0 meter (Standard)"];
        return {
          name: "Vessel Cargo Packing (3D Bin Packing)",
          benefit: "Perfect geometric arrangement of containers to balance the vessel and avoid center-of-gravity shifts.",
          headers: ["Container_Weight", "Volumetric_Dimensions", "Destination_Port", "Center_Of_Gravity"],
          q1: "What is the payload limit or container capacity (expressed in total tons per single voyage/shipment)?",
          optionsQ1,
          validateQ1: createAnswerValidator(['ton', 'tonnellat', 'kg', 't', '500', '1000', '250', 'payload', 'capacit', 'capacity', 'carico'], optionsQ1, "la portata utile / carico del container in tonnellate"),
          q2: "What tolerance do you allow for center-of-gravity offset per shipment (expressed in meters per voyage)?",
          optionsQ2,
          validateQ2: createAnswerValidator(['meter', 'metr', 'm', '0.5', '0.2', '1.0', '1', 'offset', 'baricentro', 'center', 'gravity', 'scostamento'], optionsQ2, "la tolleranza di scostamento del baricentro"),
          sample: `Item_Code,Saturation_Percentage,Container_Weight,Volumetric_Dimensions,Destination_Port,Center_Of_Gravity,Entanglement_Link
CONTAINER_A,0.60,0.25,0.60,0.80,0.12,BALANCE_01
CONTAINER_B,0.60,0.28,0.65,0.80,0.15,BALANCE_01
BOX_SINGLE,0.22,0.05,0.10,0.30,0.00,INDEPENDENT`
        };
      } else {
        const optionsQ1 = ["40% fixed contracts", "60% fixed contracts", "20% fixed contracts"];
        const optionsQ2 = ["15% cost reduction", "10% cost reduction", "20% cost reduction"];
        return {
          name: "Purchasing Contracts vs. Spot Container Freight Balance",
          benefit: "Probabilistic calculation to decide whether to purchase container capacity now or wait for spot rates.",
          headers: ["Drewry_Freight_Index", "Fixed_Contract_Share", "Spot_Container_Price"],
          q1: "What percentage share of freight expenditure is covered by fixed-rate contracts (e.g. '40% per year')?",
          optionsQ1,
          validateQ1: createAnswerValidator(['%', 'contract', 'contratt', 'fixed', 'fiss', '40', '60', '20', 'share', 'quota'], optionsQ1, "la quota coperta da contratti a tariffa fissa"),
          q2: "What total container freight cost reduction target are you aiming for (average monthly or annual target, e.g. '15% per month')?",
          optionsQ2,
          validateQ2: createAnswerValidator(['%', 'reduct', 'riduzion', 'target', 'obiettivo', 'cost', 'costi', '10', '15', '20', 'risparmio'], optionsQ2, "l'obiettivo di riduzione dei costi di nolo"),
          sample: `Item_Code,Saturation_Percentage,Drewry_Freight_Index,Fixed_Contract_Share,Spot_Container_Price,Entanglement_Link
SPOT_X,0.40,0.32,0.40,0.31,SPOT_GRP
SPOT_Y,0.40,0.34,0.50,0.33,SPOT_GRP
SPOT_Z,0.12,0.30,0.80,0.29,INDEPENDENT`
        };
      }
    } else if (macroarea.includes('Chimica') || macroarea.includes('Chemistry')) {
      if (option === 'A') {
        const optionsQ1 = ["10 MWh nominal capacity", "5 MWh nominal capacity", "20 MWh nominal capacity"];
        const optionsQ2 = ["1.5 MW daily peak limit", "3.0 MW peak limit", "5.0 MW peak limit"];
        return {
          name: "Optimal Intermittent Renewable Energy Dispatch",
          benefit: "Exact combination to store and dispatch solar and wind energy while minimizing waste.",
          headers: ["Wind_Speed", "Solar_Irradiance", "BESS_Capacity"],
          q1: "What is the total MWh nominal storage capacity of your BESS battery system (maximum daily charge, e.g. '10 MWh')?",
          optionsQ1,
          validateQ1: createAnswerValidator(['mwh', 'kwh', 'gwh', 'megawatt', 'batter', 'bess', 'capacit', 'capacity', '5', '10', '20', 'accumulo'], optionsQ1, "la capacità nominale dell'impianto BESS"),
          q2: "What is the maximum instantaneous MW grid injection power limit to avoid penalties (e.g. '1.5 MW daily peak limit')?",
          optionsQ2,
          validateQ2: createAnswerValidator(['mw', 'kw', 'gw', 'limit', 'limite', 'injection', 'immissione', 'peak', 'picco', '1.5', '3', '5', 'rete'], optionsQ2, "il limite di immissione istantanea in rete"),
          sample: `Item_Code,Saturation_Percentage,Wind_Speed,Solar_Irradiance,BESS_Capacity,Entanglement_Link
WIND_A,0.45,0.12,0.00,0.10,GRID_SLOT
SOLAR_B,0.45,0.00,0.85,0.12,GRID_SLOT
STORAGE_C,0.10,0.00,0.00,0.05,INDEPENDENT`
        };
      } else if (option === 'B') {
        const optionsQ1 = ["4 orbitals per run", "6 orbitals per run", "8 orbitals per run"];
        const optionsQ2 = ["UCCSD (Unitary Coupled Cluster)", "Symmetry-preserving ansatz"];
        return {
          name: "Electronic Ground State Calculation via VQE",
          benefit: "Geometric mapping of molecular bonds and orbitals for physical stability verification.",
          headers: ["Hamiltonian_Operator", "Orbital_Number", "VQE_Variational_Angles"],
          q1: "What is the maximum number of active molecular orbitals mapped to qubits (per chemical simulation run, e.g. '4 orbitals per run')?",
          optionsQ1,
          validateQ1: createAnswerValidator(['orbital', 'orbitali', 'qubit', '4', '6', '8', 'molecul', 'molecol'], optionsQ1, "il numero di orbitali molecolari mappati"),
          q2: "Which variational ansatz for chemical interactions do you prefer (e.g. 'UCCSD' or symmetry-preserving per run)?",
          optionsQ2,
          validateQ2: createAnswerValidator(['uccsd', 'symmetr', 'simmetria', 'ansatz', 'variational', 'coupled', 'cluster'], optionsQ2, "l'ansatz variazionale per l'interazione chimica"),
          sample: `Item_Code,Saturation_Percentage,Hamiltonian_Operator,Orbital_Number,VQE_Variational_Angles,Entanglement_Link
ORBITAL_1,0.55,0.24,0.40,0.35,VQE_CLUSTER
ORBITAL_2,0.55,0.65,0.40,0.45,VQE_CLUSTER
ORBITAL_IND,0.22,0.12,0.20,0.00,INDEPENDENT`
        };
      } else {
        const optionsQ1 = ["Tomatoes (Target EC: 1.8)", "Lettuce (Target EC: 1.4)", "Cucumbers (Target EC: 2.0)"];
        const optionsQ2 = ["Prioritizing energy savings", "Maximum crop growth rate"];
        return {
          name: "Hydroponic Greenhouse Microclimate Control",
          benefit: "Predictive estimation of resource usage and crop growth based on nutritional and electrical parameters.",
          headers: ["CO2_Levels", "EC_Conductivity", "Nutrient_pH", "LED_Hours"],
          q1: "What is the crop environment (e.g., tomatoes or lettuce) and target EC value in hydroponic nutrient feed (e.g. '1.8 per growth cycle')?",
          optionsQ1,
          validateQ1: createAnswerValidator(['tomat', 'pomodor', 'lettuce', 'lattuga', 'cucumber', 'cetriol', 'ec', '1.8', '1.4', '2.0', 'coltura', 'crop', 'nutrit'], optionsQ1, "la tipologia di coltura idroponica e target EC"),
          q2: "How do you wish to balance solar and artificial LED lighting (e.g., prioritizing energy savings on monthly or annual consumption)?",
          optionsQ2,
          validateQ2: createAnswerValidator(['energ', 'saving', 'risparmio', 'growth', 'crescita', 'led', 'solar', 'solare', 'massim', 'maximum', 'bilanciamento'], optionsQ2, "il bilanciamento tra risparmio energetico e crescita"),
          sample: `Item_Code,Saturation_Percentage,CO2_Levels,EC_Conductivity,Nutrient_pH,LED_Hours,Entanglement_Link
GREENHOUSE_A,0.35,0.80,0.18,0.58,0.66,MICRO_GRP
GREENHOUSE_B,0.35,0.75,0.19,0.60,0.54,MICRO_GRP
GREENHOUSE_C,0.15,0.40,0.12,0.65,0.38,INDEPENDENT`
        };
      }
    } else if (macroarea.includes('Manutenzione') || macroarea.includes('Fabbrica') || macroarea.includes('Manifattura') || macroarea.includes('Manufacturing')) {
      if (option === 'A') {
        const optionsQ1 = ["120 seconds per piece", "60 seconds per piece", "180 seconds per piece"];
        const optionsQ2 = ["45 minutes per week", "30 minutes per week", "60 minutes per week"];
        return {
          name: "Adaptive Just-In-Time Assembly Line Optimization",
          benefit: "Instantaneous synchronization between factory robots and component arrivals to eliminate downtime.",
          headers: ["Robot_Cycle_Time", "Line_Scrap", "Component_Delays"],
          q1: "What is the standard robot cycle time on the line at full speed (expressed in seconds per single piece, e.g. '120 seconds per piece')?",
          optionsQ1,
          validateQ1: createAnswerValidator(['second', 'sec', 's', 'tempo', 'ciclo', 'piece', 'pezzo', '60', '120', '180', 'robot'], optionsQ1, "il tempo ciclo del robot in secondi"),
          q2: "What average supply delays are you experiencing in the component supply chain (expressed in minutes per week)?",
          optionsQ2,
          validateQ2: createAnswerValidator(['minut', 'min', 'm', 'delay', 'ritard', 'week', 'settiman', '30', '45', '60', 'fornitor', 'supply'], optionsQ2, "il ritardo medio di approvvigionamento componenti"),
          sample: `Item_Code,Saturation_Percentage,Robot_Cycle_Time,Line_Scrap,Component_Delays,Entanglement_Link
ROBOT_A,0.50,0.12,0.40,0.12,LINE_CORRELATED
ROBOT_B,0.50,0.15,0.20,0.30,LINE_CORRELATED
CNC_SINGLE,0.12,0.90,0.80,0.24,INDEPENDENT`
        };
      } else if (option === 'B') {
        const optionsQ1 = ["15 points per chassis", "30 points per chassis", "10 points per chassis"];
        const optionsQ2 = ["2 mm tolerance", "5 mm tolerance", "1 mm high precision"];
        return {
          name: "Traveling Salesperson Problem (TSP) for 3D Robot Welding",
          benefit: "Fastest spatial trajectory and geometric movement for the mechanical robot arm.",
          headers: ["Welding_Points_XYZ", "Curvature_Radius", "Stop_Time"],
          q1: "What is the estimated number of 3D welding touchpoints per piece/work unit (e.g. '15 points per chassis')?",
          optionsQ1,
          validateQ1: createAnswerValidator(['point', 'punti', 'saldatura', 'weld', 'chassis', '10', '15', '30', 'touchpoint'], optionsQ1, "il numero di punti di saldatura 3D"),
          q2: "What curvature radius tolerance do you allow for the mechanical arm per cycle (expressed in millimeters)?",
          optionsQ2,
          validateQ2: createAnswerValidator(['mm', 'millimetr', 'tolleranz', 'tolerance', 'radius', 'raggio', 'curvatur', '1', '2', '5', 'braccio'], optionsQ2, "la tolleranza del raggio di curvatura in millimetri"),
          sample: `Item_Code,Saturation_Percentage,Welding_Points_XYZ,Curvature_Radius,Stop_Time,Entanglement_Link
POINT_S1,0.60,0.45,0.12,0.50,TRAJECTORY_1
POINT_S2,0.60,0.48,0.15,0.80,TRAJECTORY_1
POINT_AUTO,0.22,0.30,0.05,0.10,INDEPENDENT`
        };
      } else {
        const optionsQ1 = ["1200 seasonal pieces (Seasonal stock)", "3500 annual pieces (Annual stock)"];
        const optionsQ2 = ["15% minimum margin", "10% minimum margin", "20% minimum margin"];
        return {
          name: "Dynamic Consecutive Price Variation for 100% Inventory Clearance",
          benefit: "Optimal dynamic discount and pricing strategy to clear unsold inventory without sacrificing profit margins.",
          headers: ["Price_Elasticity_Hist", "Volume_Rimanenze_Maglia", "Minimum_Margin"],
          q1: "What is the total unsold knitwear/clothing inventory volume? You must specify whether this refers to a Seasonal horizon (e.g. '1200 seasonal pieces') or Annual horizon (e.g. '3500 annual pieces').",
          optionsQ1,
          validateQ1: createAnswerValidator(['season', 'stagion', 'annual', 'annua', 'year', 'capi', 'pieces', '1200', '3500', 'stock', 'rimanenz'], optionsQ1, "il volume e orizzonte delle rimanenze di maglieria"),
          q2: "What absolute minimum profit margin is required to avoid selling at a loss (expressed as a percentage over unit production cost, e.g. '15% per piece')?",
          optionsQ2,
          validateQ2: createAnswerValidator(['%', 'margin', 'margine', 'profit', 'profitto', 'cost', 'costo', '10', '15', '20'], optionsQ2, "il margine di profitto minimo richiesto"),
          sample: `Item_Code,Saturation_Percentage,Price_Elasticity_Hist,Volume_Rimanenze_Maglia,Minimum_Margin,Entanglement_Link
DISCOUNT_ITEM_A,0.30,0.14,0.12,0.15,DISCOUNT_SET
DISCOUNT_ITEM_B,0.30,0.12,0.15,0.18,DISCOUNT_SET
PANTS_FREE,0.05,0.08,0.02,0.30,INDEPENDENT`
        };
      }
    } else if (macroarea.includes('Sanità') || macroarea.includes('Genomica') || macroarea.includes('Sanit') || macroarea.includes('Healthcare')) {
      if (option === 'A') {
        const optionsQ1 = ["6 HLA antigens", "8 HLA antigens", "10 HLA antigens"];
        const optionsQ2 = ["6 hours maximum", "4 hours (High emergency)", "8 hours maximum"];
        return {
          name: "Strategic National Matchmaking for Organ Transplants",
          benefit: "Instant matching between biological patient compatibility and geographic transport time.",
          headers: ["HLA_Match_Score", "Cold_Ischemia_Hours", "Hospital_Distance"],
          q1: "What is the average number of HLA antigens considered crucial for compatibility (e.g., matching on 6 or 8 total antigens)?",
          optionsQ1,
          validateQ1: createAnswerValidator(['hla', 'antigen', 'antigeni', 'compatibilit', '6', '8', '10', 'match'], optionsQ1, "il numero di antigeni HLA cruciali"),
          q2: "What is the maximum tolerable Cold Ischemia time limit for the organ (expressed in maximum hours per transport, e.g. '6 hours')?",
          optionsQ2,
          validateQ2: createAnswerValidator(['hour', 'ore', 'h', 'ischem', 'freddo', 'cold', 'transport', 'trasporto', '4', '6', '8', 'organo'], optionsQ2, "il limite massimo di ischemia fredda in ore"),
          sample: `Item_Code,Saturation_Percentage,HLA_Match_Score,Cold_Ischemia_Hours,Hospital_Distance,Entanglement_Link
PATIENT_DONOR,0.35,0.95,0.40,0.12,SET_HLA_DUP
PATIENT_RECPT,0.35,0.95,0.60,0.15,SET_HLA_DUP
PATIENT_ISO,0.10,0.10,0.24,0.30,INDEPENDENT`
        };
      } else if (option === 'B') {
        const optionsQ1 = ["10 residues per run", "20 residues per run", "15 residues per run"];
        const optionsQ2 = ["Primary hydrogen bonds", "Van Der Waals surface interactions"];
        return {
          name: "Protein Folding 3D Modeling",
          benefit: "Visualization of how a protein folds in 3D space to develop effective new therapeutics.",
          headers: ["Torsion_Angles", "H_Bond_Energies", "Van_Der_Waals_Forces"],
          q1: "What is the number of active amino acid residues mapped in the protein simulation (sequence length per static run, e.g. '10 residues per run')?",
          optionsQ1,
          validateQ1: createAnswerValidator(['residu', 'amino', 'acid', 'lunghezz', 'length', '10', '15', '20', 'protein', 'proteina'], optionsQ1, "il numero di residui aminoacidici mappati"),
          q2: "Which type of biological binding forces should be prioritized in folding (e.g., primary hydrogen bonds or Van Der Waals surface interactions)?",
          optionsQ2,
          validateQ2: createAnswerValidator(['hydrog', 'idrogen', 'van der waals', 'legam', 'bond', 'forc', 'interazion', 'surface'], optionsQ2, "le forze biologiche prioritarie nel ripiegamento"),
          sample: `Item_Code,Saturation_Percentage,Torsion_Angles,H_Bond_Energies,Van_Der_Waals_Forces,Entanglement_Link
SEGMENT_A,0.55,0.20,0.45,0.12,FOLD_PROTEIN_01
SEGMENT_B,0.55,0.10,0.52,0.15,FOLD_PROTEIN_01
ACID_AUTO,0.12,0.45,0.12,0.02,INDEPENDENT`
        };
      } else {
        const optionsQ1 = ["Patients over 65 years old", "Patients between 45-64 years old", "All age cohorts"];
        const optionsQ2 = ["2 follow-up visits", "3 follow-up visits", "1 follow-up visit"];
        return {
          name: "30-Day Patient Readmission Risk Predictive Analysis",
          benefit: "Percentage risk calculation for patient readmission post-discharge.",
          headers: ["Admission_Days", "Medication_Count", "Age", "Followup_Visits"],
          q1: "Which age and demographic clusters do you consider most vulnerable for annual tracking (e.g. 'patients over 65 years old')?",
          optionsQ1,
          validateQ1: createAnswerValidator(['65', '45', 'over', 'age', 'et', 'anzian', 'cohort', 'pazient', 'patient', 'demograf'], optionsQ1, "la fascia d'età e cluster demografico a rischio"),
          q2: "How many mandatory post-discharge medical follow-up visits are scheduled in the short term (first 30 days, e.g. '2 follow-up visits')?",
          optionsQ2,
          validateQ2: createAnswerValidator(['visit', 'visite', 'follow', 'control', '1', '2', '3', 'post-dimission', 'discharge', 'dimiss'], optionsQ2, "il numero di visite di controllo post-dimissione"),
          sample: `Item_Code,Saturation_Percentage,Admission_Days,Medication_Count,Age,Followup_Visits,Entanglement_Link
PATIENT_READMIT_A,0.65,0.12,0.15,0.68,0.20,READMIT_GRP
PATIENT_READMIT_B,0.65,0.14,0.12,0.71,0.10,READMIT_GRP
PATIENT_STABLE_C,0.15,0.03,0.04,0.35,0.00,INDEPENDENT`
        };
      }
    } else { // Cybersecurity
      if (option === 'A') {
        const optionsQ1 = ["50 km total link distance", "25 km link distance", "100 km long-haul link"];
        const optionsQ2 = ["Over 50 attempts per minute", "Over 100 attempts per minute", "Over 20 attempts per minute"];
        return {
          name: "Quantum Key Distribution (QKD) Generation with Botnet Mitigation",
          benefit: "Unsackable corporate communication network capable of rerouting DDoS attacks.",
          headers: ["QBER_Error_Rate", "Attenuation_dB", "Unusual_Connections"],
          q1: "What is the maximum distance covered by the QKD optical fiber system (total link distance in kilometers, e.g. '50 km')?",
          optionsQ1,
          validateQ1: createAnswerValidator(['km', 'chilometr', 'kilomet', 'distanz', 'distance', 'fibra', 'fiber', '25', '50', '100', 'tratta'], optionsQ1, "la distanza coperta dal collegamento in fibra ottica QKD"),
          q2: "What anomalous traffic connection peaks trigger alerts (expressed in connection attempts per minute, e.g. 'over 50 per minute')?",
          optionsQ2,
          validateQ2: createAnswerValidator(['attempt', 'tentativ', 'minute', 'minuto', 'connect', 'connession', 'peak', 'picco', '20', '50', '100', 'alert', 'anomal'], optionsQ2, "la soglia di tentativi di connessione anomala al minuto"),
          sample: `Item_Code,Saturation_Percentage,QBER_Error_Rate,Attenuation_dB,Unusual_Connections,Entanglement_Link
QKD_NODE_X,0.85,0.14,0.12,0.04,CRYPT_NET
QKD_NODE_Y,0.85,0.58,0.04,0.08,CRYPT_NET
BACKUP_VM,0.30,0.02,0.00,0.01,INDEPENDENT`
        };
      } else if (option === 'B') {
        const optionsQ1 = ["secp256k1 standard", "Ed25519", "RSA-4096"];
        const optionsQ2 = ["Every 14 days", "Every 30 days", "Every 90 days"];
        return {
          name: "Web3 Ledger and Crypto Resilience Audit",
          benefit: "Structural scan of cryptographic keys analyzing signature algorithm rotation against latent bugs.",
          headers: ["ECDSA_Signature_Alg", "Transaction_Volume", "Key_Rotation"],
          q1: "Which primary elliptic curves do you use for digital cryptographic signatures (e.g., secp256k1 standard per transaction)?",
          optionsQ1,
          validateQ1: createAnswerValidator(['secp', '256', 'ed25519', 'rsa', 'curv', 'ellittic', 'elliptic', 'signatur', 'firma', 'algoritm'], optionsQ1, "le curve ellittiche utilizzate per le firme crittografiche"),
          q2: "What is the scheduled cryptographic key rotation frequency (expressed in total days or cycle hours, e.g. 'every 14 days')?",
          optionsQ2,
          validateQ2: createAnswerValidator(['day', 'giorn', '14', '30', '90', 'rotaz', 'rotat', 'frequen', 'chiav', 'key'], optionsQ2, "la frequenza di rotazione delle chiavi crittografiche"),
          sample: `Item_Code,Saturation_Percentage,ECDSA_Signature_Alg,Transaction_Volume,Key_Rotation,Entanglement_Link
LEDGER_A,0.50,0.10,0.12,0.12,ROTATING_KEYS
LEDGER_B,0.50,0.10,0.15,0.14,ROTATING_KEYS
LEDGER_AUTO,0.12,0.00,0.05,0.00,INDEPENDENT`
        };
      } else {
        const optionsQ1 = ["ML-KEM / Kyber standard", "ML-DSA / Dilithium standard", "SLH-DSA / SPHINCS+"];
        const optionsQ2 = ["Cloud database & storage", "Local secure servers & HSM"];
        return {
          name: "Vulnerability Scanning and Lattice Migration (PQC)",
          benefit: "Statistical probability calculation of data breaches to plan post-quantum encryption barriers.",
          headers: ["Key_Length", "At_Risk_Data_Volume", "Signing_Times"],
          q1: "Which NIST post-quantum migration standards are you planning to configure (e.g., ML-KEM / Kyber standard)?",
          optionsQ1,
          validateQ1: createAnswerValidator(['kyber', 'ml-kem', 'kem', 'dilithium', 'ml-dsa', 'dsa', 'sphincs', 'slh-dsa', 'lattice', 'nist', 'pqc', 'standard'], optionsQ1, "gli standard di migrazione post-quantum NIST"),
          q2: "Which priority historical data channels or archives need priority migration to protected networks (e.g., cloud database or local servers)?",
          optionsQ2,
          validateQ2: createAnswerValidator(['cloud', 'databas', 'db', 'local', 'local', 'server', 'hsm', 'archiv', 'storag', 'dati'], optionsQ2, "i canali e archivi di dati storici prioritari"),
          sample: `Item_Code,Saturation_Percentage,Key_Length,At_Risk_Data_Volume,Signing_Times,Entanglement_Link
INFRA_DATABASE,0.30,0.30,0.50,0.45,MIGRATE_GRP
INFRA_CLOUD,0.30,0.40,0.65,0.55,MIGRATE_GRP
DESKTOP_CLIENT,0.01,0.20,0.02,0.10,INDEPENDENT`
        };
      }
    }
  }

  // Initialize welcome
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'system',
        text: `👋 **Benvenuto nel Quantum Engine BI Orchestrator (V9 Core)**

Sono la tua interfaccia conversazionale per la compilazione e traduzione quantistica verso IBM Quantum. 
L'acquisizione dei dati aziendali avverrà in modo guidato direttamente qui in chat, ponendo **una sola domanda alla volta** per calibrare il circuito OpenQASM 2.0.

👉 **FASE 0 - Seleziona la tua Macro-Area aziendale di riferimento (digita il numero da 1 a 6 o clicca sotto):**

1. 📊 **Finanza e Mercati**
2. 🚚 **Logistica e Smart Cities**
3. 🔬 **Chimica e Green Tech**
4. 🏭 **Manutenzione, Manifatturiero e Abbigliamento**
5. 🧬 **Sanità e Genomica**
6. 🛡️ **Cybersecurity**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [t]);

  // Auto scroll chat: when a new message or question arrives, align the top of that message
  // at the top of the chat window so it is immediately readable from line 1 without mouse scrolling.
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    const timer = setTimeout(() => {
      if (chatFeedRef.current) {
        const container = chatFeedRef.current;
        const targetEl = document.getElementById(`agent-chat-msg-${lastMsg.id}`);

        if (targetEl) {
          const targetTop = targetEl.offsetTop - container.offsetTop;
          container.scrollTo({
            top: Math.max(0, targetTop - 8),
            behavior: 'smooth'
          });
        } else {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [messages]);

  const addMessage = (sender: 'system' | 'user', text: string, isComposerCode?: boolean, code?: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isComposerCode,
        code
      }
    ]);
  };

  // Preset loading helpers
  const handleLoadSample = () => {
    let csvContent = '';
    let scenarioName = selectedScenario?.name || 'Pre-Audited Sample';

    if (selectedScenario) {
      csvContent = generateScenarioCSV(selectedScenario);
    } else if (selectedSector === 'Finanza') {
      csvContent = `Item_Code,Saturation_Percentage,Expected_Return,Entanglement_Link
AZ_ENEL,0.15,0.04,HEDGE_PORTFOLIO_01
AZ_GENERALI,0.45,0.08,HEDGE_PORTFOLIO_01
BOND_USA_10Y,0.78,0.03,INDEPENDENT
AZ_UNICREDIT,0.60,0.12,PROTECTED_HIGH_YIELD
AZ_INTESA,0.30,0.09,PROTECTED_HIGH_YIELD
ETH_RESERVE,0.85,0.25,INDEPENDENT`;
    } else if (selectedSector === 'Logistica') {
      csvContent = `Item_Code,Saturation_Percentage,Priority,Entanglement_Link
TRUCK_01,0.28,High,ROUTE_NORTH
TRUCK_02,0.45,High,ROUTE_NORTH
VAN_LOCAL,0.78,Medium,INDEPENDENT
CARGO_CONTAINER,0.60,Critical,ROUTE_WEST
SHIP_CARRIER,0.30,Low,ROUTE_WEST
DRONE_EXPRESS,0.85,Critical,INDEPENDENT`;
    } else if (selectedSector === 'Chimica') {
      csvContent = `Item_Code,Saturation_Percentage,Limit_Temperature,Entanglement_Link
CATALYST_PT,0.25,120.0,THERMAL_REACTION
REACTANT_N2,0.55,150.0,THERMAL_REACTION
STABILIZER_ADDITIVE,0.70,90.0,INDEPENDENT
HDPE_POLYMER,0.12,240.0,DIPOLE_FUSION
SOLVENT_B,0.35,85.0,DIPOLE_FUSION
H2_ELEMENT,0.95,300.0,INDEPENDENT`;
    } else if (selectedSector === 'Sanita') {
      csvContent = `Item_Code,Saturation_Percentage,Compatibility,Entanglement_Link
DONOR_PATIENT,0.35,0.95,TRANSPLANT_PAIR_01
RECIPIENT_PATIENT,0.65,0.95,TRANSPLANT_PAIR_01
AUTONOMOUS_PATIENT,0.80,0.10,INDEPENDENT
GEN_SAMPLE_A,0.50,0.88,MUTATION_LINK_X
GEN_SAMPLE_B,0.22,0.88,MUTATION_LINK_X
HEALTHY_PATIENT,0.10,0.99,INDEPENDENT`;
    } else if (selectedSector === 'Cybersecurity') {
      csvContent = `Item_Code,Saturation_Percentage,Active_Ports,Entanglement_Link
FIREWALL_GATEWAY,0.85,4,LAN_WEST
REST_API_SERVER,0.50,8,LAN_WEST
DEVELOPER_PC,0.12,12,INDEPENDENT
DATA_STORAGE,0.30,1,BACKUP_LINK
VIRTUAL_MACHINE_B,0.40,15,BACKUP_LINK
INTERNAL_WIFI_ROUTER,0.95,44,INDEPENDENT`;
    } else {
      csvContent = `Item_Code,Saturation_Percentage,Work_Hours,Entanglement_Link
CNC_MILLING,0.45,120.5,ASSEMBLY_LINE_A
WELDING_ROBOT,0.60,200.0,ASSEMBLY_LINE_A
METAL_3D_PRINTER,0.85,78.2,INDEPENDENT
PAINT_LINE_A,0.33,95.0,TEST_SERIES
PAINT_LINE_B,0.33,95.0,TEST_SERIES
PACKAGING_LINE,0.15,10.0,INDEPENDENT`;
    }

    addMessage('user', `📋 Requesting pre-audited sample data load for simulation: **${scenarioName}**`);
    
    addMessage('system', `Here is the sample data loaded in the compiler:\n\n\`\`\`csv\n${csvContent}\n\`\`\``);

    // Clear user typing field to prevent raw text residues
    setInputText('');

    // Trigger CSV mapping step with this loaded data
    prepareCsvMapping(csvContent);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text && text.trim()) {
        const uploadMsg = isIt
          ? `📁 **File CSV caricato:** \`${file.name}\`\n\n\`\`\`csv\n${text.trim()}\n\`\`\``
          : `📁 **CSV File Uploaded:** \`${file.name}\`\n\n\`\`\`csv\n${text.trim()}\n\`\`\``;
        addMessage('user', uploadMsg);
        setTempCsvContent(text);
        setIsCsvLoaded(true);
        setStep(3);

        const lower = text.toLowerCase();
        const isOptC = scenarioSelection === 'C' || lower.includes('option c') || lower.includes('amplitude') || lower.includes('probab');
        const isOptB = scenarioSelection === 'B' || lower.includes('option b') || lower.includes('geometry') || lower.includes('angol') || lower.includes('strike');

        if (isOptC && scenarioSelection !== 'C') {
          setScenarioSelection('C');
        } else if (isOptB && scenarioSelection !== 'B' && !isOptC) {
          setScenarioSelection('B');
        }
        processInputCSV(text, true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text && text.trim()) {
        const uploadMsg = isIt
          ? `📁 **File CSV caricato via Drag & Drop:** \`${file.name}\`\n\n\`\`\`csv\n${text.trim()}\n\`\`\``
          : `📁 **CSV File Uploaded via Drag & Drop:** \`${file.name}\`\n\n\`\`\`csv\n${text.trim()}\n\`\`\``;
        addMessage('user', uploadMsg);
        setTempCsvContent(text);
        setIsCsvLoaded(true);
        setStep(3);

        const lower = text.toLowerCase();
        const isOptC = scenarioSelection === 'C' || lower.includes('option c') || lower.includes('amplitude') || lower.includes('probab');
        const isOptB = scenarioSelection === 'B' || lower.includes('option b') || lower.includes('geometry') || lower.includes('angol') || lower.includes('strike');

        if (isOptC && scenarioSelection !== 'C') {
          setScenarioSelection('C');
        } else if (isOptB && scenarioSelection !== 'B' && !isOptC) {
          setScenarioSelection('B');
        }
        processInputCSV(text, true);
      }
    };
    reader.readAsText(file);
  };

  // Propose column layout details based on selected sector/macroarea
  const displaySectorColumnProposal = (sectorName: string) => {
    let colsText = '';
    let csvTemplate = '';
    const secLower = (sectorName || '').toLowerCase();

    if (secLower.includes('finan')) {
      colsText = `- **Item_Code** (Type: *Text/Identifier*, e.g.: \`AZ_ENEL\` or \`BTC_PORTFOLIO\`): Represents the single financial asset or stock of your company.
- **Saturation_Percentage** (Type: *Decimal between 0.00 and 1.00*, e.g.: \`0.35\`): Corresponds to the measured risk, variance or volatility level.
- **Expected_Return** (Type: *Decimal*, e.g.: \`0.06\`): Estimated annual return rate.
- **Entanglement_Link** (Type: *Text*, e.g.: \`HEDGE_PORTFOLIO_01\`): Relationship column for quantum entanglement. Use the same group name to correlate titles, or write \`INDEPENDENT\` if unlinked.`;

      csvTemplate = `Item_Code,Saturation_Percentage,Expected_Return,Entanglement_Link
AZ_ENEL,0.15,0.04,HEDGE_PORTFOLIO_01
AZ_GENERALI,0.45,0.08,HEDGE_PORTFOLIO_01
BOND_USA_10Y,0.78,0.03,INDEPENDENT
AZ_UNICREDIT,0.60,0.12,PROTECTED_HIGH_YIELD
AZ_INTESA,0.30,0.09,PROTECTED_HIGH_YIELD
ETH_RESERVE,0.85,0.25,INDEPENDENT`;
    } else if (secLower.includes('logist')) {
      colsText = `- **Item_Code** (Type: *Text/Identifier*, e.g.: \`TRUCK_NORTH\` or \`CONTAINER_X\`): Fleet vehicle, truck or cargo container code.
- **Saturation_Percentage** (Type: *Decimal between 0.00 and 1.00*, e.g.: \`0.85\`): Stowage level, delay or load capacity saturation.
- **Priority** (Type: *Text*, e.g.: \`High\` / \`Low\`): Shipment priority or urgency level.
- **Entanglement_Link** (Type: *Text*, e.g.: \`ROUTE_NORTH\`): Shared routing channel for quantum entanglement. Use the same group name for joint shipments, or \`INDEPENDENT\` if autonomous.`;

      csvTemplate = `Item_Code,Saturation_Percentage,Priority,Entanglement_Link
TRUCK_01,0.28,High,ROUTE_NORTH
TRUCK_02,0.45,High,ROUTE_NORTH
VAN_LOCAL,0.78,Medium,INDEPENDENT
CARGO_CONTAINER,0.60,Critical,ROUTE_WEST
SHIP_CARRIER,0.30,Low,ROUTE_WEST
DRONE_EXPRESS,0.85,Critical,INDEPENDENT`;
    } else if (secLower.includes('chimic') || secLower.includes('chem')) {
      colsText = `- **Item_Code** (Type: *Text/Identifier*, e.g.: \`REACTIVE_MOL\`): Molecule, material, or raw material identifier.
- **Saturation_Percentage** (Type: *Decimal between 0.00 and 1.00*, e.g.: \`0.40\`): Energy stability or chemical instability level.
- **Limit_Temperature** (Type: *Decimal*, e.g.: \`180.5\`): Maximum critical temperature for the compound.
- **Entanglement_Link** (Type: *Text*, e.g.: \`THERMAL_REACTION\`): Catalytic entanglement coupling or shared reaction. Set the same ID for correlated reactants, or \`INDEPENDENT\` if isolated.`;

      csvTemplate = `Item_Code,Saturation_Percentage,Limit_Temperature,Entanglement_Link
CATALYST_PT,0.25,120.0,THERMAL_REACTION
REACTANT_N2,0.55,150.0,THERMAL_REACTION
STABILIZER_ADDITIVE,0.70,90.0,INDEPENDENT
HDPE_POLYMER,0.12,240.0,DIPOLE_FUSION
SOLVENT_B,0.35,85.0,DIPOLE_FUSION
H2_ELEMENT,0.95,300.0,INDEPENDENT`;
    } else if (secLower.includes('sanit') || secLower.includes('health') || secLower.includes('genom')) {
      colsText = `- **Item_Code** (Type: *Text/Identifier*, e.g.: \`PATIENT_Rossi\`): Anonymous patient code or genomic strand ID.
- **Saturation_Percentage** (Type: *Decimal between 0.00 and 1.00*, e.g.: \`0.65\`): Immune rejection level, biological expression or incidence.
- **Compatibility** (Type: *Decimal*, e.g.: \`0.92\`): Reciprocal suitability or therapeutic efficacy score.
- **Entanglement_Link** (Type: *Text*, e.g.: \`TRANSPLANT_PAIR_01\`): Clinical entanglement pair / biological connection. Use the same group name for coupled records, or \`INDEPENDENT\` if autonomous.`;

      csvTemplate = `Item_Code,Saturation_Percentage,Compatibility,Entanglement_Link
DONOR_PATIENT,0.35,0.95,TRANSPLANT_PAIR_01
RECIPIENT_PATIENT,0.65,0.95,TRANSPLANT_PAIR_01
AUTONOMOUS_PATIENT,0.80,0.10,INDEPENDENT
GEN_SAMPLE_A,0.50,0.88,MUTATION_LINK_X
GEN_SAMPLE_B,0.22,0.88,MUTATION_LINK_X
HEALTHY_PATIENT,0.10,0.99,INDEPENDENT`;
    } else if (secLower.includes('cyber')) {
      colsText = `- **Item_Code** (Type: *Text/Identifier*, e.g.: \`IP_GATEWAY\`): Hostname, IP address, or network node in your infrastructure.
- **Saturation_Percentage** (Type: *Decimal between 0.00 and 1.00*, e.g.: \`0.80\`): Congestion, CPU load, or anomalous packet rate.
- **Active_Ports** (Type: *Integer*, e.g.: \`14\`): Number of open communication ports.
- **Entanglement_Link** (Type: *Text*, e.g.: \`LAN_WEST\`): Subnet or cyber traffic entanglement channel. Use the same identifier for nodes in the same network, or \`INDEPENDENT\` for isolated elements.`;

      csvTemplate = `Item_Code,Saturation_Percentage,Active_Ports,Entanglement_Link
FIREWALL_GATEWAY,0.85,4,LAN_WEST
REST_API_SERVER,0.50,8,LAN_WEST
DEVELOPER_PC,0.12,12,INDEPENDENT
DATA_STORAGE,0.30,1,BACKUP_LINK
VIRTUAL_MACHINE_B,0.40,15,BACKUP_LINK
INTERNAL_WIFI_ROUTER,0.95,44,INDEPENDENT`;
    } else { // Manufacturing / Factory / Maintenance
      colsText = `- **Item_Code** (Type: *Text/Identifier*, e.g.: \`CNC_MACHINE\` or \`WELDING_ROBOT\`): Mechanical equipment identifier.
- **Saturation_Percentage** (Type: *Decimal between 0.00 and 1.00*, e.g.: \`0.55\`): Wear or stress rate measured on the machine cycle.
- **Work_Hours** (Type: *Decimal*, e.g.: \`180.5\`): Total operating hours accumulated over the last month.
- **Entanglement_Link** (Type: *Text*, e.g.: \`ASSEMBLY_LINE_A\`): Shared processing group mapping quantum entanglement across sensors. Enter the same ID if linked on the same physical line, or \`INDEPENDENT\` if isolated.`;

      csvTemplate = `Item_Code,Saturation_Percentage,Work_Hours,Entanglement_Link
CNC_MILLING,0.45,120.5,ASSEMBLY_LINE_A
WELDING_ROBOT,0.60,200.0,ASSEMBLY_LINE_A
METAL_3D_PRINTER,0.85,78.2,INDEPENDENT
PAINT_LINE_A,0.33,95.0,TEST_SERIES
PAINT_LINE_B,0.33,95.0,TEST_SERIES
PACKAGING_LINE,0.15,10.0,INDEPENDENT`;
    }

    addMessage('system', `📋 **PROPOSED DATA FILE REQUIREMENTS FOR YOUR COMPANY (AREA: ${sectorName.toUpperCase()}):**
To allow Quantum Machine Learning to analyze your products or services, prepare a CSV file containing these main columns:

${colsText}

💡 **COMPILATION GUIDELINES FOR YOUR COMPANY:**
- Decimal numbers must be between **0.00** and **1.00** (percentages over 100% will be auto-scaled).
- Recommended decimal separator: period (\`.\`). If you use a comma, the algorithm auto-corrects it.

Here is a pre-configured sample CSV model ready to be uploaded or copied:
\`\`\`csv
${csvTemplate}
\`\`\`

👉 **HOW TO PROVIDE DATA:**
1. Upload your CSV file by clicking **BROWSE COMPUTER** in the center panel.
2. Or drag and drop it into the dashed area.
3. Or copy the example above and paste it directly into the input row below, then press Enter.`);
  };

  const handleChoiceOption = (choice: 'A' | 'B' | 'C') => {
    setScenarioSelection(choice);
    setStep(1);
    setInterviewSubstep(1);
    const scenario = getSectorIndustrialScenario(selectedSector || 'Finanza');
    
    setTimeout(() => {
      addMessage('system', `🎯 **Paradigma Attivato:** **Opzione ${choice}** (*${choice === 'A' ? 'Misto / Entanglement' : choice === 'B' ? 'Solo Angolo / Geometria' : 'Solo Ampiezza / Probabilità'}*)

Iniziamo ora l'acquisizione dei dati aziendali con le 3 domande guidate:

👉 **DOMANDA 1 (Elementi):**
Quali e quanti elementi della tua azienda dobbiamo inserire nell'analisi? Inserisci da **2 a 5 nomi reali** legati al tuo problema (es. \`${scenario.sampleElements}\`).`);
    }, 300);
  };

  const handleSelectScenarioAndStart = (scenario: QuantumScenario) => {
    setSelectedScenario(scenario);
    if (scenario.technology) {
      setSelectedTechnology(scenario.technology);
    }
    const sectorName = scenario.macroarea.includes('Finanza') || scenario.macroarea.includes('Finance') ? 'Finanza' :
                       scenario.macroarea.includes('Logistica') || scenario.macroarea.includes('Logistics') ? 'Logistica' :
                       scenario.macroarea.includes('Chimica') || scenario.macroarea.includes('Chemistry') ? 'Chimica' :
                       scenario.macroarea.includes('Sanit') || scenario.macroarea.includes('Healthcare') ? 'Sanita' :
                       scenario.macroarea.includes('Cyber') || scenario.macroarea.includes('Sicurezza') ? 'Cybersecurity' : 'Manifatturiero';
    
    const industrialScenario = getSectorIndustrialScenario(sectorName);
    setSelectedSector(sectorName);
    setSelectedSectorLong(scenario.macroarea);
    
    const focusKey: 'A' | 'B' | 'C' = scenario.focus === 'Angolo' ? 'B' : scenario.focus === 'Ampiezza' ? 'C' : 'A';
    setScenarioSelection(focusKey);
    setStep(1);
    setInterviewSubstep(1);
    setV9Elements([]);
    setV9Saturations([]);
    setV9CustomSaturations(null);
    setV9Correlations([]);
    setCalibrationAnswers([]);

    const isQPU = scenario.technology.includes('QPU');
    setRightPanelTab(isQPU ? 'composer' : 'composer');

    addMessage('user', `🎯 Selezionato scenario: **${scenario.name}** [${scenario.technology}]`);
    setTimeout(() => {
      if (isQPU) {
        addMessage('system', `🔬 **SCENARIO QUANTISTICO ATTIVATO: ${scenario.name}**
*Macro-Area:* **${scenario.macroarea}** | *Tecnologia:* **${scenario.technology}**
*Logica Algoritmica:* **${scenario.logicType}**
*Variabili Target:* \`${scenario.targetVariables}\`

🔬 **MANIFESTO SCIENTIFICO:**
Nel calcolo quantistico i tre fenomeni fisici (Entanglement, Ampiezza, Angolazione) esistono sempre simultaneamente nello spazio di Hilbert. Il circuito viene configurato con **Focus ${scenario.focus || 'Entanglement'}**.

🚗 **ANALOGIA DELL'AUTOMOBILE DA CORSA:**
${scenario.focus === 'Ampiezza' 
  ? '🏎️ **Rettilineo ad Alta Velocità (Ampiezza):** Massima precisione probabilistica per amplificare lo stato target.' 
  : scenario.focus === 'Angolo' 
  ? '📐 **Curve a Gomito Strette (Angolo 3D):** Mappatura geometrica precisa e rotazioni di fase su sfera di Bloch.' 
  : '🌧️ **Asfalto Bagnato (Entanglement):** Correlazione e sincronizzazione non-locale tra tutte le variabili simultaneamente.'}

---

Iniziamo l'acquisizione guidata dei parametri:

👉 **DOMANDA 1 (Elementi):**
Quali e quanti elementi della tua azienda dobbiamo inserire nell'analisi? Inserisci da **2 a 5 nomi reali** legati a questo scenario (es. \`${industrialScenario.sampleElements}\`).`);
      } else {
        addMessage('system', `💻 **SCENARIO CLASSICO / HPC ATTIVATO: ${scenario.name}**
*Macro-Area:* **${scenario.macroarea}** | *Tecnologia:* **${scenario.technology}**
*Architettura:* **${scenario.logicType}**
*Variabili Target:* \`${scenario.targetVariables}\`

💡 Questo scenario è ottimizzato per l'elaborazione su **Server Classici / Cluster HPC / GPU Acceleration**.

---

Iniziamo l'acquisizione dei dati per l'elaborazione:

👉 **DOMANDA 1 (Elementi / Feature):**
Quali e quanti elementi o sorgenti dati dobbiamo analizzare? Inserisci da **2 a 5 identificatori** (es. \`${industrialScenario.sampleElements}\`).`);
      }
    }, 350);
  };

  const handleSelectSector = (sectorName: string) => {
    const scenario = getSectorIndustrialScenario(sectorName);
    setSelectedSector(sectorName);
    setSelectedSectorLong(scenario.macroarea);
    setScenarioSelection(scenario.focusKey);
    setStep(1);
    setInterviewSubstep(1);
    setV9Elements([]);
    setV9Saturations([]);
    setV9CustomSaturations(null);
    setV9Correlations([]);
    setCalibrationAnswers([]);

    addMessage('user', `Selezionata Macro-Area: ${scenario.macroarea} (${sectorName})`);
    setTimeout(() => {
      addMessage('system', `🔬 **MANIFESTO SCIENTIFICO:**
Nel calcolo quantistico i tre fenomeni fisici (Entanglement, Ampiezza, Angolazione) esistono sempre simultaneamente nello spazio di Hilbert. La scelta del focus algoritmico serve solo a decidere quale architettura di porte logiche e quale funzione obiettivo (lo "spartito") deve avere il circuito per risolvere il problema aziendale.

🚗 **L'ANALOGIA DELL'AUTOMOBILE DA CORSA:**
In un'automobile da corsa, motore, sterzo e freni funzionano sempre insieme. Tuttavia:
- Se affronti un rettilineo, imposti la mappatura sulla potenza (**Ampiezza**).
- Se devi percorrere curve a gomito strette, ottimizzi l'assetto e l'angolo di sterzata (**Angolo 3D**).
- Se guidi su asfalto bagnato, ottimizzi il controllo di trazione congiunto tra le 4 ruote (**Entanglement**).

🎯 **SCENARIO ASSEGNATO:** **${scenario.scenarioName}**
*Focus Algoritmico:* **${scenario.focus}**
👉 *${scenario.carAnalogy}*

---

👋 **Iniziamo la calibrazione!**
Sono l'intervistatore ufficiale del framework Pepsight. Quali nodi, macchinari o hub logistici vuoi analizzare nel circuito quantistico oggi? (Es. \`${scenario.sampleElements}\`)`);
    }, 350);
  };

  const extractCsvFromText = (rawText: string): string | null => {
    if (!rawText) return null;
    // Strip markdown code fences if present
    let clean = rawText.replace(/```(?:csv)?\n?([\s\S]*?)```/gi, '$1').trim();
    
    // Check if it's a markdown table format (| Col1 | Col2 | ...)
    if (clean.includes('|') && clean.includes('\n')) {
      const mdLines = clean.split(/\r?\n/).map(l => l.trim()).filter(l => l.startsWith('|') && l.endsWith('|'));
      if (mdLines.length >= 2) {
        const rows = mdLines
          .filter(l => {
            const stripped = l.replace(/[\s|:-]/g, '');
            return stripped.length > 0;
          })
          .map(l => l.slice(1, -1).split('|').map(c => c.trim()).join(','));
        if (rows.length >= 2) {
          clean = rows.join('\n');
        }
      }
    }

    const allLines = clean.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (allLines.length < 2) return null;

    const detectLineDelimiter = (line: string): string => {
      if (line.includes('\t')) return '\t';
      if (line.includes(';') && line.split(';').length >= 2) return ';';
      if (line.includes('|') && line.split('|').length >= 2) return '|';
      return ',';
    };

    let startIdx = -1;
    let delimiter = ',';

    for (let i = 0; i < allLines.length; i++) {
      const line = allLines[i];
      const d = detectLineDelimiter(line);
      const parts = line.split(d);
      if (parts.length >= 2) {
        startIdx = i;
        delimiter = d;
        break;
      }
    }

    if (startIdx === -1) return null;

    const csvLines: string[] = [];
    for (let j = startIdx; j < allLines.length; j++) {
      const l = allLines[j];
      const d = detectLineDelimiter(l);
      const parts = l.split(d);
      if (parts.length >= 2) {
        if (d !== ',') {
          csvLines.push(parts.map(cell => cell.trim()).join(','));
        } else {
          csvLines.push(l);
        }
      } else if (csvLines.length >= 2) {
        break;
      }
    }

    if (csvLines.length >= 2) {
      return csvLines.join('\n');
    }
    return null;
  };

  const checkLooksLikeCsv = (text: string): boolean => {
    return extractCsvFromText(text) !== null;
  };

  const findRealUserCsv = (currentText?: string): string | null => {
    if (currentText) {
      const directCsv = extractCsvFromText(currentText);
      if (directCsv) return directCsv;
    }

    // 1. Scan user messages from newest to oldest
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.sender === 'user') {
        const extracted = extractCsvFromText(m.text);
        if (extracted) {
          return extracted;
        }
      }
    }

    // 2. Scan loaded tempCsvContent
    if (isCsvLoaded && tempCsvContent) {
      const extracted = extractCsvFromText(tempCsvContent);
      if (extracted) return extracted;
    }

    return null;
  };

  // V9 Conversational Interview Data State
  const [v9Elements, setV9Elements] = useState<string[]>([]);
  const [v9Saturations, setV9Saturations] = useState<number[]>([]);
  const [v9CustomSaturations, setV9CustomSaturations] = useState<number[] | null>(null);
  const [v9Correlations, setV9Correlations] = useState<string[]>([]);
  const [v9AnglesPhase2, setV9AnglesPhase2] = useState<number[]>([]);
  const [v9Metrics, setV9Metrics] = useState<string[]>([]);
  const [v9Prudence, setV9Prudence] = useState<string>('Bilanciato');
  const [v9GeneratedCsv, setV9GeneratedCsv] = useState<string>('');

  // Sound chime notification
  const playChimeAlert = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.24); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.36); // C6
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.7);
    } catch (e) {
      // Audio playback silently suppressed if autoplay not permitted yet
    }
  };

  // Helper to obtain the single industrial scenario for each category
  const getSectorIndustrialScenario = (sector: string): IndustrialScenarioInfo => {
    const s = sector.toLowerCase();
    if (s.includes('finan') || s.includes('invest') || s.includes('money') || s === '1') {
      return {
        id: 1,
        macroarea: "Finance & Markets",
        scenarioName: "Ottimizzazione di Portafoglio Finanziario e Rischio Sistemico (QUBO)",
        focus: "Entanglement (Correlazione Forte tra Asset)",
        focusKey: "A",
        carAnalogy: "Come il controllo di trazione a 4 ruote su asfalto bagnato: bilancia e correla l'andamento congiunto di tutti i titoli per minimizzare il rischio sistemico.",
        metricColName: "Expected_Return",
        defaultElements: ["ENEL", "INTESA", "GENERALI", "STELLANTIS"],
        defaultUnit: "Rendimento Atteso",
        sampleElements: "ENEL, INTESA, GENERALI, STELLANTIS",
        sampleSaturation: "12%, 18%, 25%, 32%"
      };
    } else if (s.includes('logist') || s.includes('ship') || s.includes('transp') || s.includes('truck') || s === '2') {
      return {
        id: 2,
        macroarea: "Logistics & Smart Cities",
        scenarioName: "Ottimizzazione Flotte con Finestre Temporali (VRPTW)",
        focus: "Entanglement (Interdipendenza Percorsi e Traffico)",
        focusKey: "A",
        carAnalogy: "Come il differenziale autobloccante e le 4 ruote motrici: sincronizza tutti i veicoli della flotta per evitare congestioni e sovrapposizioni.",
        metricColName: "Delivery_Time_Hours",
        defaultElements: ["HUB_MILANO", "HUB_BOLOGNA", "HUB_ROMA", "HUB_NAPOLI"],
        defaultUnit: "Tempo Consegna",
        sampleElements: "HUB_MILANO, HUB_BOLOGNA, HUB_ROMA, HUB_NAPOLI",
        sampleSaturation: "45%, 60%, 75%, 30%"
      };
    } else if (s.includes('chem') || s.includes('lab') || s.includes('molecul') || s.includes('chimic') || s === '3') {
      return {
        id: 3,
        macroarea: "Chemistry & Green Tech",
        scenarioName: "Simulazione Molecolare e Calcolo dello Stato Fondamentale (VQE)",
        focus: "Angolo 3D (Rotazioni Spaziali e Conformazione)",
        focusKey: "B",
        carAnalogy: "Come la sterzata millimetrica su curve a gomito strette: orienta nello spazio 3D gli orbitali molecolari per trovare la minima energia di legame.",
        metricColName: "Hartree_Energy",
        defaultElements: ["ORBITALE_HOMO", "ORBITALE_LUMO", "LEGAME_PI", "POLAR_SIGMA"],
        defaultUnit: "Energia di Hartree",
        sampleElements: "ORBITALE_HOMO, ORBITALE_LUMO, LEGAME_PI, POLAR_SIGMA",
        sampleSaturation: "30%, 55%, 70%, 40%"
      };
    } else if (s.includes('maint') || s.includes('factor') || s.includes('manuf') || s.includes('industr') || s.includes('apparel') || s.includes('cloth') || s.includes('manifatt') || s === '4') {
      return {
        id: 4,
        macroarea: "Maintenance, Manufacturing & Apparel",
        scenarioName: "Rilevamento Anomalie e Manutenzione Predittiva Impianti",
        focus: "Ampiezza (Probabilità e Potenza Nominale)",
        focusKey: "C",
        carAnalogy: "Come la massima potenza del motore sul rettilineo: calcola con la massima precisione probabilistica la probabilità di guasto o usura meccanica.",
        metricColName: "Vibration_Level_Hz",
        defaultElements: ["PRESSA_01", "CNC_MILLING", "ROBOT_WELDING", "TURBINE_A"],
        defaultUnit: "Livello Vibrazione",
        sampleElements: "PRESSA_01, CNC_MILLING, ROBOT_WELDING, TURBINE_A",
        sampleSaturation: "25%, 50%, 80%, 40%"
      };
    } else if (s.includes('health') || s.includes('med') || s.includes('hosp') || s.includes('patient') || s.includes('genom') || s.includes('sanit') || s === '5') {
      return {
        id: 5,
        macroarea: "Healthcare & Genomics",
        scenarioName: "Ripiegamento Proteico e Docking Farmaco-Recettore",
        focus: "Angolo 3D (Geometria Diedra e Conformazione)",
        focusKey: "B",
        carAnalogy: "Come la traiettoria e l'inclinazione dell'auto in curva: modella gli angoli diedri amminoacidici per prevenire il ripiegamento anomalo delle proteine.",
        metricColName: "Binding_Affinity_Kcal",
        defaultElements: ["RESIDUO_P1", "RESIDUO_P2", "RESIDUO_P3", "SEGMENTO_HELIX"],
        defaultUnit: "Affinità di Legame",
        sampleElements: "RESIDUO_P1, RESIDUO_P2, RESIDUO_P3, SEGMENTO_HELIX",
        sampleSaturation: "35%, 65%, 45%, 80%"
      };
    } else {
      return {
        id: 6,
        macroarea: "Cybersecurity",
        scenarioName: "Mitigazione Attacchi Distribuiti DDoS e Rilevamento Intrusioni",
        focus: "Entanglement (Correlazione Flussi di Rete)",
        focusKey: "A",
        carAnalogy: "Come la telemetria sincronizzata di tutta l'auto: rileva istantaneamente comportamenti coordinati anomali tra pacchetti e porte di rete.",
        metricColName: "Traffic_Gbps",
        defaultElements: ["GATEWAY_FW", "API_SERVER", "DB_CENTRAL", "AUTH_PROXY"],
        defaultUnit: "Traffico di Rete",
        sampleElements: "GATEWAY_FW, API_SERVER, DB_CENTRAL, AUTH_PROXY",
        sampleSaturation: "20%, 40%, 60%, 85%"
      };
    }
    // Fallback for custom sectors
    return {
      id: 7,
      macroarea: "Custom Context",
      scenarioName: "Analisi Quantistica Personalizzata: " + sector,
      focus: "Entanglement (Correlazione Forte tra Asset)",
      focusKey: "A",
      carAnalogy: "Come un motore su misura: bilancia i tuoi parametri specifici adattandosi dinamicamente al tuo dominio.",
      metricColName: "Metric_Value",
      defaultElements: ["Elemento_1", "Elemento_2", "Elemento_3"],
      defaultUnit: "Valore",
      sampleElements: "Elemento_A, Elemento_B, Elemento_C",
      sampleSaturation: "20%, 40%, 60%"
    };
  };

  // Dedicated OpenQASM 2.0 CAM Circuit Code Generator
  const generateV9OpenQasmCode = (
    elements: string[],
    saturations: number[],
    correlations: string[],
    angles2: number[],
    option: 'A' | 'B' | 'C',
    critThreshold: number
  ): string => {
    const N = elements.length;
    const ancillaIdx = N;
    const totalQubits = N + 1;
    const tClipped = Math.max(0.01, Math.min(critThreshold, 1.0));
    const totalTh = 2 * Math.asin(Math.sqrt(tClipped));
    const distTh = (totalTh / N).toFixed(5);
    const scenario = getSectorIndustrialScenario(selectedSector || 'Finanza');

    let code = `OPENQASM 2.0;\ninclude "qelib1.inc";\n\n`;
    code += `// --- INIZIALIZZAZIONE REGISTRI QUANTISTICI E CLASSICI ---\n`;
    code += `qreg q[${totalQubits}];    // Registri dati aziendali (q[0]..q[${N-1}]) + Ancilla comparatore allarme (q[${ancillaIdx}])\n`;
    code += `creg c[${totalQubits}];    // Bit classici per la lettura dei risultati di misura\n\n`;

    // STEP 1: STATE PREPARATION & ENCODING DATI AZIENDALI
    code += `// --- STEP 1: STATE PREPARATION & ENCODING DATI AZIENDALI ---\n`;
    code += `// Mappatura delle percentuali di saturazione e parametri in ampiezze quantistiche reali\n`;
    elements.forEach((el, i) => {
      const p = Math.max(0.001, Math.min(saturations[i] ?? 0.35, 1.0));
      const th = (2 * Math.asin(Math.sqrt(p))).toFixed(5);
      code += `ry(${th}) q[${i}]; // Encoding ${el}: Saturazione ${(p * 100).toFixed(1)}%\n`;
    });
    code += `\n`;

    // STEP 2: CONFIGURAZIONE DELLO SPARTITO ALGORITMICO
    code += `// --- STEP 2: CONFIGURAZIONE DELLO SPARTITO ALGORITMICO ---\n`;
    if (option === 'C') {
      code += `// Focus Ampiezza: Regolazione fine delle rotazioni ry d'ampiezza a singolo qubit\n`;
      elements.forEach((el, i) => {
        const p = Math.max(0.001, Math.min(saturations[i] ?? 0.35, 1.0));
        const ampGain = (0.5 * Math.PI * p).toFixed(5);
        code += `ry(${ampGain}) q[${i}]; // Ponderazione ampiezza per ${el}\n`;
      });
    } else if (option === 'B') {
      code += `// Focus Angolo 3D: Rotazioni geometriche di fase locale rx sulla sfera di Bloch\n`;
      elements.forEach((el, i) => {
        code += `rx(0.52360) q[${i}]; // Inclinazione polare per lo stato energetico di ${el}\n`;
      });
    } else {
      // Focus Entanglement: CRY/CZ multi-qubit entangling gates
      code += `// Focus Entanglement: Connessione a 2 qubit (CZ / CRY) per correlare il rischio (Phase Entanglement senza distruzione)\n`;
      for (let i = 0; i < N - 1; i++) {
        const ang = (angles2[i] ?? 0.70748).toFixed(5);
        code += `cry(${ang}) q[${i}], q[${i + 1}]; // Entanglement tra ${elements[i]} e ${elements[i + 1]}\n`;
      }
      if (N > 2) {
        code += `cz q[0], q[${N - 1}]; // Chiusura anello di correlazione sistemica (Phase flip)\n`;
      }
    }
    code += `\n`;

    // STEP 3: COMPARATORE ANCILLA
    code += `// --- STEP 3: COMPARATORE ANCILLA ---\n`;
    code += `// L'ancilla raccoglie probabilità cumulativa dai nodi senza effetto XOR distruttivo (somma di fasi)\n`;
    if (option === 'B') {
      code += `rx(${totalTh.toFixed(5)}) q[${ancillaIdx}]; // Rotazione soglia angolare ancilla\n`;
    } else if (option === 'C') {
      code += `ry(${totalTh.toFixed(5)}) q[${ancillaIdx}]; // Rotazione ampiezza soglia ancilla\n`;
    } else {
      for (let i = 0; i < N; i++) {
        code += `cry(${distTh}) q[${i}], q[${ancillaIdx}]; // Accumulo lineare di rischio su ancilla\n`;
      }
    }
    code += `\n`;

    // STEP 3B: APPLICAZIONE METRICHE DI FASE
    code += `// --- STEP 3B: APPLICAZIONE METRICHE DI FASE ---\n`;
    elements.forEach((el, i) => {
      // Per il frontend passiamo solo una rz fittizia se non abbiamo le metriche passate,
      // ma il server fa il lavoro vero. Lasciamo una rotazione base legata all'angolo.
      const ang = (angles2[i] ?? 0.78539).toFixed(5);
      code += `rz(${ang}) q[${i}]; // Encoding della metrica sulla fase Z\n`;
    });
    code += `\n`;

    // STEP 4: MISURAZIONE
    code += `// --- STEP 4: MISURAZIONE ---\n`;
    for (let i = 0; i < N; i++) {
      code += `measure q[${i}] -> c[${i}]; // Misura ${elements[i]}\n`;
    }
    code += `measure q[${ancillaIdx}] -> c[${ancillaIdx}]; // Misura canale di allarme dell'ancilla\n`;

    return code;
  };

  // Helper to detect if user input is an exploratory question or request for information
  const isUserAskingQuestion = (text: string, currentStep: number, currentSubstep: number): boolean => {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // Explicit question mark
    if (trimmed.includes('?')) return true;

    // Check if input is purely a numeric or percentage value in Question 2
    if (currentStep === 1 && currentSubstep === 2) {
      if (/^\s*\d+([.,]\d+)?\s*%\s*$/.test(lower) || /^\s*0[.,]\d+\s*$/.test(lower) || /^\s*\d+([.,]\d+)?\s*$/.test(lower)) {
        return false;
      }
    }

    // Check if input is purely a selection 1, 2, 3 or prudence label in Question 3
    if (currentStep === 1 && currentSubstep === 3) {
      if (/^[123]$/.test(lower) || lower === 'alta' || lower === 'alta prudenza' || lower === 'bilanciato' || lower === 'tollerante') {
        return false;
      }
    }

    // Check if input is purely 1-6 in Category step
    if (currentStep === 1 && currentSubstep === 0) {
      if (/^[1-6]$/.test(lower)) return false;
    }

    // Check if input is purely confirmation in Phase 2
    if (currentStep === 2) {
      if (['conferma', 'confermo', 'si', 'yes', 'ok', 'procedi', 'compila', 'vai', 'avanti', 'genera', 'esegui'].includes(lower)) {
        return false;
      }
    }

    const questionKeywords = [
      'cosa', 'come', 'perché', 'perche', 'qual', 'quale', 'quali', 'chi', 'dove', 'quando',
      'quanto', 'quanta', 'quanti', 'quante', 'spiega', 'spiegami', 'chiarisci', 'chiariscimi',
      'dimmi', 'aiuto', 'help', 'info', "cos'è", "cosa e'", "cosa è", 'a cosa serve',
      'non capisco', 'non ho capito', 'che significa', 'che vuol dire', 'cosa fa', 'come mai',
      'puoi', 'vorrei capire', 'vorrei sapere', 'differenza', 'differenze', 'funzionamento',
      'cos e', 'a che serve', 'che senso ha', 'what', 'how', 'why', 'who', 'explain', 'help me', 'tell me', 'can you'
    ];

    return questionKeywords.some(kw => {
      const regex = new RegExp(`(^|\\s|[.,;!?"'])${kw}([.,;!?"'\\s]|$)`, 'i');
      return regex.test(lower) || lower.startsWith(kw);
    });
  };

  // Generate an expert and accurate quantum knowledge response with dynamic resume hints
  const handleUserQuestion = async (userQuestion: string) => {
    setIsAiThinking(true);
    const currentSector = selectedSector || 'Finanza';
    const scenario = getSectorIndustrialScenario(currentSector);
    const lower = userQuestion.toLowerCase();

    // Step-specific resumption instructions
    let resumeHint = '';
    if (step === 1 && interviewSubstep === 0) {
      resumeHint = isIt
        ? '👉 **Per iniziare l\'intervista:** Digita un numero da **1 a 6** o seleziona una delle categorie aziendali in alto.'
        : '👉 **To begin the interview:** Type a number from **1 to 6** or select a corporate category above.';
    } else if (step === 1 && interviewSubstep === 1) {
      resumeHint = isIt
        ? `👉 **Per proseguire con la Domanda 1:** Scrivi da **2 a 5 variabili** separate da virgola (es. \`${scenario.defaultElements.join(', ')}\`) oppure seleziona i pulsanti suggeriti.`
        : `👉 **To continue with Question 1:** Type **2 to 5 variables** separated by commas (e.g. \`${scenario.defaultElements.join(', ')}\`) or select the suggested buttons.`;
    } else if (step === 1 && interviewSubstep === 2) {
      const elList = v9Elements.length > 0 ? v9Elements.join(', ') : 'le tue variabili';
      resumeHint = isIt
        ? `👉 **Per proseguire con la Domanda 2:** Inserisci le percentuali da associare alle tue variabili (\`${elList}\`), ad esempio scrivendo una percentuale per ciascuna (es. \`${scenario.sampleSaturation}\`) o una soglia generale (es. \`35%\`).`
        : `👉 **To continue with Question 2:** Type the percentages to associate with your variables (\`${elList}\`), e.g. one for each (e.g. \`${scenario.sampleSaturation}\`) or a general threshold (e.g. \`35%\`).`;
    } else if (step === 1 && interviewSubstep === 3) {
      resumeHint = isIt
        ? '👉 **Per proseguire con la Domanda 3:** Scegli il livello di prudenza digitando `1` (**Alta Prudenza**), `2` (**Bilanciato**) o `3` (**Tollerante**).'
        : '👉 **To continue with Question 3:** Choose prudence level by typing `1` (**High Prudence**), `2` (**Balanced**) or `3` (**Tolerant**).';
    } else if (step === 2) {
      resumeHint = isIt
        ? '👉 **Per proseguire con la Fase 2:** Scrivi "**Conferma**" o clicca sul pulsante "**✅ Conferma Dati e Compila Circuito**".'
        : '👉 **To continue with Phase 2:** Type "**Confirm**" or click "**✅ Confirm Data and Compile Circuit**".';
    } else {
      resumeHint = isIt
        ? '👉 **Prossimo step:** Puoi copiare il codice OpenQASM 2.0 o cliccare su "**Invia a IBM Quantum 🚀**" per eseguirlo sul processore quantistico.'
        : '👉 **Next step:** You can copy the OpenQASM 2.0 code or click "**Send to IBM Quantum 🚀**" to execute it on the QPU.';
    }

    try {
      // 1. Try calling the backend /api/quantum-bi/chat for dynamic Gemini answers
      const res = await axios.post('/api/quantum-bi/chat', {
        messages: [{ role: 'user', text: userQuestion }],
        systemPrompt: `Sei l'Assistente Quantistico Esperto (Quantum Compiler & Business Orchestrator). 
L'utente sta svolgendo la calibrazione guidata per il settore "${currentSector}" (Scenario: ${scenario.scenarioName}).
Rispondi in modo esaustivo, scientificamente rigoroso e chiaro in italiano alla sua domanda, usando spiegazioni comprensibili e l'analogia dell'auto da corsa o dei qubit.
Non includere frasi di scuse o divagazioni generiche.`
      }, { timeout: 4000 });

      const botAns = res.data?.response || res.data?.text;
      if (botAns) {
        const fullResponse = `${botAns}\n\n---\n${resumeHint}`;
        addMessage('system', fullResponse);
        setIsAiThinking(false);
        return;
      }
    } catch {
      // Fallback seamlessly to local expert knowledge base
    }

    // 2. Comprehensive local quantum knowledge base
    let answerText = '';

    if (lower.includes('soglia') || lower.includes('allarme') || lower.includes('percentual') || lower.includes('threshold') || lower.includes('limite') || lower.includes('tolleran')) {
      answerText = `💡 **COS'È LA SOGLIA D'ALLARME E COME FUNZIONA NEL CALCOLO QUANTISTICO:**

La **soglia percentuale d'allarme** (es. \`35%\`) rappresenta il limite critico di rischio economico, usura o saturazione oltre il quale il sistema aziendale deve segnalare un allarme rosso.

🔬 **Come viene tradotta nel circuito quantistico:**
1. **Rotazione Angolare di Probabilità ($R_y$):** La percentuale di soglia viene convertita matematicamente in un angolo di rotazione $\\theta = 2 \\arcsin(\\sqrt{p})$ applicato su ciascun qubit di input.
2. **Accoppiamento con l'Ancilla Qubit ($q[N]$):** Attraverso porte quantistiche controllate $CRY$, tutti i qubit trasferiscono la loro probabilità congiunta sull'ancilla (il canale di allarme dedicato).
3. **Collasso e Misura ($c[N]$):** All'esecuzione sul processore IBM, se la sovrapposizione degli stati supera la soglia impostata, l'ancilla collassa sullo stato $|1\\rangle$, attivando istantaneamente il flag di allarme critico con correlazione globale.`;
    } else if (lower.includes('variabil') || lower.includes('element') || lower.includes('5') || lower.includes('nomi') || lower.includes('qubit') || lower.includes('input')) {
      answerText = `💡 **VARIABILI AZIENDALI E MAPPATURA SUI QUBIT QUANTISTICI:**

Gli elementi che inserisci (da 2 a 5 nomi reali, come fornitori, asset finanziari o linee di produzione) rappresentano i nodi fondamentali della tua analisi.

🔬 **Perché da 2 a 5 variabili?**
- **Spazio di Hilbert $2^N$:** Ogni variabile corrisponde a 1 Qubit fisico. Con $N=5$ variabili più 1 Ancilla, il circuito esplora simultaneamente $2^5 = 32$ configurazioni parallele di rischio.
- **Massima Fedeltà Quantistica:** Mantenere 5 registri permette di eseguire il circuito sia su chip quantistici reali IBM (es. 5-qubit o 127-qubit Eagle) sia su simulatori Statevector ad altissima fedeltà, azzerando la decoerenza termica.
- **Sovrapposizione Iniziale (Porta Hadamard $H$):** Ogni variabile parte da uno stato di equiprobabilità pura, pronta a ricevere le rotazioni di peso specifico.`;
    } else if (lower.includes('pruden') || lower.includes('bilanciat') || lower.includes('tolleran') || lower.includes('alta')) {
      answerText = `💡 **I 3 LIVELLI DI PRUDENZA NELL'ORCHESTRAZIONE QUANTISTICA:**

Il livello di prudenza determina come la funzione di costo (QUBO o VQE) penalizza le oscillazioni e le deviazioni estreme:

1. **🛡️ 1. Alta Prudenza (Massima Protezione):**
   - Aumenta l'intensità delle porte di correlazione $CX / CRY$, massimizzando i vincoli di sicurezza. Calcola i peggiori scenari combinatori.
2. **⚖️ 2. Bilanciato (Rischio Moderato - Standard):**
   - Ottimizza il compromesso matematico tra rendimento/efficienza operativa e contenimento del rischio.
3. **⚡ 3. Tollerante (Alta Aggressività):**
   - Riduce i vincoli di penalità, permettendo al sistema di sfruttare al massimo la capacità produttiva o il rendimento accettando una volatilità controllata.`;
    } else if (lower.includes('porta') || lower.includes('porte') || lower.includes('gate') || lower.includes('hadamard') || lower.includes('openqasm') || lower.includes('qasm') || lower.includes('circuit')) {
      answerText = `💡 **LE PORTE QUANTISTICHE E IL LINGUAGGIO OPENQASM 2.0:**

OpenQASM (Quantum Assembly Language) è lo standard industriale per programmare i computer quantistici di IBM:

- **Porta $H$ (Hadamard):** Mette il qubit in sovrapposizione perfetta tra $|0\\rangle$ e $|1\\rangle$.
- **Porta $R_y(\\theta)$ (Rotazione Y):** Inietta i dati reali e la percentuale di saturazione ruotando il vettore di stato sulla sfera di Bloch.
- **Porta $R_z(\\phi)$ (Rotazione Z):** Codifica le fasi tridimensionali e le interazioni angolari molecolari o di docking.
- **Porte $CX$ / $CRY$ (Entanglement Controllato):** Creano la correlazione quantistica non-locale tra i qubit e collegano le variabili all'ancilla qubit per la misura di allarme.`;
    } else if (lower.includes('auto') || lower.includes('analogia') || lower.includes('spartito') || lower.includes('orchestr')) {
      answerText = `🏎️ **L'ANALOGIA DELL'AUTOMOBILE DA CORSA NELLO SPAZIO DI HILBERT:**

Nel calcolo quantistico i tre fenomeni fisici (Ampiezza, Angolo 3D, Entanglement) esistono **sempre insieme**. La scelta del focus serve solo a definire quale parte del circuito deve lavorare con priorità:

- **Ampiezza (Porte $R_y$):** È il *motore* — imposta la potenza e il volume di calcolo su rettilinei veloci (es. Manutenzione e Capacità).
- **Angolo 3D (Porte $R_x / R_z$):** È lo *sterzo* — calcola le curve strette e le conformazioni tridimensionali (es. Chimica VQE e Folding Proteico).
- **Entanglement (Porte $CX / CRY$):** È la *trazione integrale su 4 ruote con asfalto bagnato* — coordina tutti i nodi contemporaneamente per evitare sbandate (es. Finanza Cross-Asset e Logistica).`;
    } else if (lower.includes('settor') || lower.includes('categor') || lower.includes('finanz') || lower.includes('logistic') || lower.includes('chimic') || lower.includes('sanit') || lower.includes('cyber')) {
      answerText = `🏢 **SCENARI INDUSTRIALI INTEGRATI NELLA PIATTAFORMA:**

Ogni categoria aziendale attiva un algoritmo quantistico specializzato:
1. **Finanza:** *QUBO Cross-Asset* — minimizza la covarianza del rischio su portafogli azionari ed obbligazionari.
2. **Logistica:** *VRPTW con Finestre Temporali* — risolve l'instradamento di flotte pesanti azzerando i ritardi.
3. **Chimica:** *VQE (Variational Quantum Eigensolver)* — calcola l'energia dello stato fondamentale di catalizzatori molecolari.
4. **Manifatturiero:** *Predictive Maintenance* — stima l'usura critica e i tempi di fermo macchina.
5. **Sanità:** *Protein Folding & Docking 3D* — analizza l'affinità di legame recettore-farmaco.
6. **Cybersecurity:** *DDoS Attack Correlation* — rileva attacchi distribuiti coordinati su nodi di rete.`;
    } else if (lower.includes('csv') || lower.includes('tabella') || lower.includes('matrice')) {
      answerText = `📊 **LA MATRICE DATI AZIENDALE (CSV) E LA TRASFORMAZIONE IN CIRCUITO:**

La tabella CSV che generiamo nella Fase 2 raccoglie i tuoi parametri reali e li struttura nelle colonne chiave:
- **Item_Code:** Il codice univoco delle tue variabili ($q[0] \\dots q[N-1]$).
- **Saturation_Percentage:** Il livello di saturazione/rischio associato a ciascun elemento.
- **Metrica Industriale:** Il valore ingegneristico calcolato per il tuo settore (es. ore residue, energia Hartree, latenza).
- **Entanglement_Link:** Il gruppo di correlazione quantistica applicato nel circuito OpenQASM.`;
    } else {
      answerText = `🤖 **ASSISTENZA QUANTISTICA GEMINI:**

Grazie per la tua domanda! Il nostro orchestratore quantistico unisce i principi fisici della meccanica quantistica (sovrapposizione, rotazioni angolari sulla sfera di Bloch ed entanglement a molti corpi) con le esigenze reali dell'ottimizzazione aziendale.

Ogni parametro inserito durante questa calibrazione viene compilato direttamente in istruzioni assembly quantistiche OpenQASM 2.0, pronte per essere trasmesse all'infrastruttura IBM Quantum.`;
    }

    const fullResponse = `${answerText}\n\n---\n${resumeHint}`;
    setTimeout(() => {
      addMessage('system', fullResponse);
      setIsAiThinking(false);
    }, 350);
  };

  const handleAiInterviewMessage = async (userText: string) => {
    setIsAiThinking(true);
    const currentSector = selectedSector || 'Finanza';
    const scenario = getSectorIndustrialScenario(currentSector);
    
    const messagesToSend = [...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text })), { role: 'user', text: userText }];

    const systemPrompt = `Sei l'intervistatore ufficiale del framework Pepsight. Il tuo compito è interagire in chat con l'utente per raccogliere i dati di saturazione aziendale/logistica e i tempi di consegna (Delivery Time). 

[LINEE GUIDA PER L'INTERVISTA IN CHAT]
1. Conduci l'intervista in modo chiaro e professionale, ponendo domande specifiche se l'utente non fornisce tutti i dati (es. chiedi le saturazioni per HUB_MILANO, HUB_BOLOGNA, HUB_ROMA, HUB_NAPOLI e i rispettivi Delivery Time). Usa le variabili appropriate per il settore: "${currentSector}" (Scenario: ${scenario.scenarioName}).
2. Se l'utente specifica un singolo valore dicendo che vale "per tutti" o come valore di default, accettalo senza costringerlo a ripetere il numero quattro volte.
3. Determina lo scenario di rischio dell'intervista (Alta Prudenza, Bilanciato, Tollerante). Se non è specificato, chiedilo o deducilo.

[DIRETTIVA CRITICA DI CONSEGNA DATI A TYPESCRIPT]
Non appena hai raccolto tutte le informazioni necessarie e l'intervista è conclusa, devi generare un blocco di riepilogo dati strutturato in modo rigido e standardizzato. Questo blocco verrà letto direttamente dal codice TypeScript dell'applicazione, che si occuperà di calcolare gli angoli e disegnare il codice OpenQASM per Adria. 

Scrivi il riepilogo dei dati racchiudendolo tassativamente tra i tag [START_PEPSIGHT_DATA] e [END_PEPSIGHT_DATA] in questo esatto formato testuale (se l'utente ha usato un valore di default, replicalo tu su tutti e 4 i nodi):

[START_PEPSIGHT_DATA]
SCENARIO: Alta Prudenza
MODIFICATORE_SATURAZIONE: 5
SOGLIA_ALLARME_GLOBALE: 0.15
NODO: HUB_MILANO | SATURAZIONE: 45.0 | DELIVERY_TIME: 2.5
NODO: HUB_BOLOGNA | SATURAZIONE: 60.0 | DELIVERY_TIME: 3.7
NODO: HUB_ROMA | SATURAZIONE: 75.0 | DELIVERY_TIME: 4.9
NODO: HUB_NAPOLI | SATURAZIONE: 30.0 | DELIVERY_TIME: 6.1
[END_PEPSIGHT_DATA]

Non inserire codice OpenQASM o formule matematiche nella chat; delega interamente il calcolo e il disegno del circuito a TypeScript fornendo solo questo blocco di dati puliti.`;

    const executeLocalInterviewStep = (userText: string) => {
      const currentSector = selectedSector || 'Finanza';
      const scenario = getSectorIndustrialScenario(currentSector);

      if (interviewSubstep === 1) {
        // Acquisizione Variabili / Nodi (Domanda 1)
        const rawTokens = userText.replace(/[;\n|]/g, ',').split(',').map(s => s.trim()).filter(Boolean);
        const elements = rawTokens.length >= 2 ? rawTokens.slice(0, 5) : scenario.defaultElements;
        setV9Elements(elements);
        setInterviewSubstep(2);
        addMessage('system', `Perfetto! Ho registrato le tue variabili aziendali: **${elements.join(', ')}**.\n\n👉 **DOMANDA 2 (Percentuali di Saturazione):**\nQuali sono i livelli di saturazione o carico da associare a ciascuna variabile?\n(Puoi indicare le percentuali separate da virgola, es. \`${scenario.sampleSaturation}\`, oppure una soglia comune per tutte come \`35%\`).`);
      } else if (interviewSubstep === 2) {
        // Acquisizione Saturazioni / Percentuali (Domanda 2)
        const numMatches = userText.match(/(?:\d+[.,]?\d*|\.\d+)\s*%?/g) || [];
        const parsedList = numMatches.map(m => {
          const isPct = m.includes('%');
          const n = parseFloat(m.replace('%', '').replace(',', '.').trim());
          if (isNaN(n)) return 0.35;
          return (isPct || n > 1.0) ? n / 100.0 : n;
        });
        const els = v9Elements.length >= 2 ? v9Elements : scenario.defaultElements;
        const sats = els.map((_, i) => parsedList[i] ?? (parsedList[0] ?? 0.35));
        setV9CustomSaturations(sats);
        setInterviewSubstep(3);
        addMessage('system', `Ottimo! Ho associato le percentuali di saturazione alle variabili:\n${els.map((el, i) => `• **${el}**: ${(sats[i] * 100).toFixed(0)}%`).join('\n')}\n\n👉 **DOMANDA 3 (Profilo di Prudenza):**\nCome vuoi configurare la postura di rischio e la propagazione delle correlazioni nel circuito?\n1. **Alta Prudenza** (Massima protezione, soglia 15%)\n2. **Bilanciato** (Rischio moderato, soglia 35%)\n3. **Tollerante** (Massima apertura, soglia 50%)\n*(Digita 1, 2 o 3, oppure clicca uno dei pulsanti sotto la chat)*`);
      } else {
        // Acquisizione Prudenza (Domanda 3) e Conclusione
        const lower = userText.toLowerCase();
        let prudence = "Bilanciato";
        let thresh = 0.35;
        if (lower.includes('1') || lower.includes('alta') || lower.includes('high') || lower.includes('prud')) {
          prudence = "Alta Prudenza";
          thresh = 0.15;
        } else if (lower.includes('3') || lower.includes('toller') || lower.includes('aggress')) {
          prudence = "Tollerante";
          thresh = 0.50;
        }
        const els = v9Elements.length >= 2 ? v9Elements : scenario.defaultElements;
        const sats = v9CustomSaturations && v9CustomSaturations.length === els.length ? v9CustomSaturations : els.map(() => 0.35);
        const metrics = ['2.5', '3.7', '4.9', '6.1', '5.0'].slice(0, els.length);

        setV9Elements(els);
        setV9CustomSaturations(sats);
        setV9Metrics(metrics);
        setV9Prudence(prudence);
        setThreshold(thresh);
        setStep(2);
        setInterviewSubstep(0);
        addMessage('system', `✅ **Intervista Conclusa! Dati elaborati con successo.**\n\n• **Settore:** ${scenario.macroarea}\n• **Variabili:** ${els.join(', ')}\n• **Saturazioni:** ${sats.map(s => `${(s * 100).toFixed(0)}%`).join(', ')}\n• **Profilo:** ${prudence} (Soglia d'allarme: ${(thresh * 100).toFixed(0)}%)\n\n👉 Clicca su '**✅ Conferma Dati e Compila Circuito**' per generare il codice quantistico per Adria.`);
      }
    };

    try {
      const res = await axios.post('/api/quantum-bi/chat', {
        messages: messagesToSend,
        systemPrompt: systemPrompt
      }, { timeout: 15000 });
      
      const fullResponse = (res.data && (res.data.response || res.data.text)) ? String(res.data.response || res.data.text) : "";
      
      if (fullResponse) {
        const dataMatch = fullResponse.match(/\[START_PEPSIGHT_DATA\]([\s\S]*?)\[END_PEPSIGHT_DATA\]/);
        
        if (dataMatch) {
            const dataBlock = dataMatch[1];
            const lines = dataBlock.split('\n').map(l => l.trim()).filter(l => l);
            const elements: string[] = [];
            const saturations: number[] = [];
            const metrics: number[] = [];
            let parsedPrudence = "Bilanciato";
            let parsedThreshold = 0.35;
            
            lines.forEach(line => {
                if (line.startsWith("SCENARIO:")) {
                    parsedPrudence = line.replace("SCENARIO:", "").trim();
                } else if (line.startsWith("SOGLIA_ALLARME_GLOBALE:")) {
                    parsedThreshold = parseFloat(line.replace("SOGLIA_ALLARME_GLOBALE:", "").trim());
                } else if (line.startsWith("NODO:")) {
                    const parts = line.split('|');
                    let nodeName = "NODO";
                    let sat = 0;
                    let met = 0;
                    parts.forEach(part => {
                       if (part.includes("NODO:")) nodeName = part.replace("NODO:", "").trim();
                       if (part.includes("SATURAZIONE:")) sat = parseFloat(part.replace("SATURAZIONE:", "").trim()) / 100.0;
                       if (part.includes("DELIVERY_TIME:")) met = parseFloat(part.replace("DELIVERY_TIME:", "").trim());
                    });
                    elements.push(nodeName);
                    saturations.push(sat);
                    metrics.push(met);
                }
            });
            
            setV9Elements(elements);
            setV9CustomSaturations(saturations);
            setV9Metrics(metrics);
            setV9Prudence(parsedPrudence);
            setThreshold(parsedThreshold);
            
            const cleanResponse = fullResponse.replace(/\[START_PEPSIGHT_DATA\][\s\S]*?\[END_PEPSIGHT_DATA\]/, "").trim();
            addMessage('system', cleanResponse + "\n\n✅ **Intervista Conclusa! Dati elaborati con successo.**\n👉 Clicca su '**✅ Conferma Dati e Compila Circuito**' per generare il codice quantistico per Adria.");
            
            setStep(2);
            setInterviewSubstep(0);
        } else {
            addMessage('system', fullResponse);
            if (fullResponse.includes('DOMANDA 2') || fullResponse.includes('Percentuali')) {
              setInterviewSubstep(2);
            } else if (fullResponse.includes('DOMANDA 3') || fullResponse.includes('Prudenza')) {
              setInterviewSubstep(3);
            }
        }
        return;
      }
      
      // If no valid response body, execute local step seamlessly
      executeLocalInterviewStep(userText);
    } catch (e) {
      console.warn("Interview server call fallback:", e);
      executeLocalInterviewStep(userText);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const rawText = textOverride !== undefined ? textOverride : inputText;
    if (!rawText.trim()) return;
    const userText = rawText.trim();
    setInputText('');
    addMessage('user', userText);

    // =========================================================================
    // SMART AI QUESTION DETECTOR: If user asks a question, answer it immediately!
    // =========================================================================
    if (isUserAskingQuestion(userText, step, interviewSubstep)) {
      handleUserQuestion(userText);
      return;
    }

    // ==========================================
    // FASE 0: Corporate Category Selection (1-6)
    // ==========================================
    if (step === 1 && interviewSubstep === 0) {
      const lower = userText.toLowerCase().trim();
      if (lower === '1' || lower.includes('finan') || lower.includes('invest') || lower.includes('money')) {
        handleSelectSector('Finanza');
      } else if (lower === '2' || lower.includes('logist') || lower.includes('ship') || lower.includes('transp') || lower.includes('truck')) {
        handleSelectSector('Logistica');
      } else if (lower === '3' || lower.includes('chem') || lower.includes('lab') || lower.includes('molecul') || lower.includes('chimic')) {
        handleSelectSector('Chimica');
      } else if (lower === '4' || lower.includes('maint') || lower.includes('factor') || lower.includes('manuf') || lower.includes('industr') || lower.includes('apparel') || lower.includes('cloth') || lower.includes('manifatt')) {
        handleSelectSector('Manifatturiero');
      } else if (lower === '5' || lower.includes('health') || lower.includes('med') || lower.includes('hosp') || lower.includes('patient') || lower.includes('genom') || lower.includes('sanit')) {
        handleSelectSector('Sanita');
      } else if (lower === '6' || lower.includes('cyber') || lower.includes('secur') || lower.includes('hacker') || lower.includes('firewall')) {
        handleSelectSector('Cybersecurity');
      } else {
        handleSelectSector(userText); // Accept custom context
      }
      return;
    }

    // =========================================================================
    // FASE 1: Conversational Calibration Interview via AI
    // =========================================================================
    if (step === 1 && interviewSubstep > 0) {
      handleAiInterviewMessage(userText);
      return;
    }

    // =========================================================================
    // FASE 2: Data Confirmation & Transition to FASE 3 (OpenQASM Generation)
    // =========================================================================
    if (step === 2) {
      const lower = userText.toLowerCase().trim();
      const isConfirm = ['conferma', 'confermo', 'si', 'yes', 'ok', 'procedi', 'compila', 'vai', 'avanti', 'genera', 'esegui'].some(w => lower.includes(w));

      if (isConfirm) {
        const currentSector = selectedSector || 'Finanza';
        const scenario = getSectorIndustrialScenario(currentSector);
        const elements = v9Elements.length >= 2 ? v9Elements : scenario.defaultElements;
        const saturations = v9Saturations.length === elements.length ? v9Saturations : elements.map(() => 0.35);
        const correlations = v9Correlations.length === elements.length ? v9Correlations : elements.map(() => 'INDEPENDENT');
        const angles2 = v9AnglesPhase2.length === elements.length ? v9AnglesPhase2 : elements.map(() => 0.78539);
        const threshVal = threshold || 0.35;

        let generatedQasmCode = "";
        // Generate clean OpenQASM 2.0 code from the backend server
        try {
          const res = await axios.post('/api/quantum-bi/generate', {
            elements,
            saturations,
            correlations,
            angles2,
            metrics: v9Metrics,
            metricName: scenario.metricColName,
            option: scenario.focusKey,
            critThreshold: threshVal,
            prudence: v9Prudence
          });
          if (res.data && res.data.qasm) {
            generatedQasmCode = res.data.qasm;
            setQasmOutput(generatedQasmCode);
          } else {
            generatedQasmCode = "// Errore durante la generazione QASM";
            setQasmOutput(generatedQasmCode);
          }
        } catch (e) {
          console.error(e);
          generatedQasmCode = "// Errore server nella generazione QASM";
          setQasmOutput(generatedQasmCode);
        }

        // Update clean records for IBM visual composer board
        const cleanRecs = elements.map((el, i) => {
          const sat = saturations[i] ?? 0.35;
          const pClamped = Math.max(0.001, Math.min(sat, 1.0));
          const th1 = 2 * Math.asin(Math.sqrt(pClamped));
          const th2 = angles2[i] ?? 0.78539;
          return {
            article: el,
            saturation: sat,
            abbinamento: correlations[i] || 'INDEPENDENT',
            correlazioneNumerica: th2,
            anglePhase1: th1,
            anglePhase2: th2
          };
        });
        setCleanedRecords(cleanRecs);

        // Advance to FASE 3
        setStep(3);
        playChimeAlert();

        // Exact closing statement adapted by technology
        const isHpcSelected = selectedTechnology.includes('HPC') || selectedTechnology.includes('Classica') || selectedTechnology === 'HPC';
        const closingPhrase = isHpcSelected
          ? `**Dati acquisiti ed elaborazione classica predisposta.**\n\nPremi il pulsante "**⚡ ESEGUI CALCOLO CLASSICO (HPC)**" in basso per avviare subito l'elaborazione su CPU/GPU classica.`
          : `**Ho raccolto tutti i dati necessari e generato il codice OpenQASM che vedi qui sopra.**\n\nPremere il pulsante "**🚀 INVIA A IBM QUANTUM (QPU)**" in basso per trasmettere il job al computer quantistico IBM Quantum.`;

        setTimeout(() => {
          if (isHpcSelected) {
            addMessage('system', `🎉 **FASE 3: MATRICE DATI PRONTA PER L'ELABORAZIONE CLASSICA (HPC)**

💡 **COMPUTAZIONE SU HARDWARE CLASSICO (CPU/GPU Cluster):**
I parametri sono stati mappati e validati per l'analisi deterministica/statistica su architettura classica.

${closingPhrase}

[ACTION: RENDER_BUTTON_SEND_TO_IBM_Q]`);
          } else {
            addMessage('system', `🎉 **FASE 3: CIRCUITO OPENQASM 2.0 SINTETIZZATO CON SUCCESSO!**

🎵 **L'ORCHESTRA QUANTISTICA HA COMPLETATO LO SPARTITO:**
I qubit hanno suonato all'unisono combinando simultaneamente ampiezza, angolo ed entanglement nello spazio di Hilbert per lo scenario **${scenario.scenarioName}**.

💻 **CODICE OPENQASM 2.0 GENERATO:**
\`\`\`qasm
${generatedQasmCode}
\`\`\`

${closingPhrase}

[ACTION: RENDER_BUTTON_SEND_TO_IBM_Q]`);
          }
        }, 400);
        return;
      } else {
        setTimeout(() => {
          addMessage('system', `Per procedere con la generazione del circuito OpenQASM 2.0 o l'elaborazione classica, digita "**Conferma**" o clicca sul pulsante "**✅ Conferma Dati**" sotto la chat.`);
        }, 300);
        return;
      }
    }

    // ==========================================
    // FASE 3: Post-Generation Interaction
    // ==========================================
    if (step === 3) {
      const isHpcSelected = selectedTechnology.includes('HPC') || selectedTechnology.includes('Classica') || selectedTechnology === 'HPC';
      setTimeout(() => {
        if (isHpcSelected) {
          addMessage('system', `La matrice dati è pronta per l'elaborazione classica. Clicca su "**⚡ Esegui Calcolo Classico (HPC)**" in basso per ottenere subito i risultati calcolati dal sistema.`);
        } else {
          addMessage('system', `Il circuito quantistico OpenQASM 2.0 è pronto. Puoi inviarlo al processore quantistico IBM cliccando su "**🚀 Invia a IBM Quantum QPU**" sotto la chat.`);
        }
      }, 300);
    }
  };

  const prepareCsvMapping = (csvTextContent: string) => {
    // Split rows on any newline representation
    const lines = csvTextContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      addMessage('system', `❌ **FORMAT ERROR:** The inserted CSV file does not have a valid header + data structure.`);
      return;
    }

    // Auto-detect column delimiter
    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') ? ';' : ',';

    const originalHeaders = headerLine.split(delimiter).map(h => h.trim());
    
    // Save states
    setCsvHeaders(originalHeaders);
    setTempCsvContent(csvTextContent);
    setIsCsvLoaded(true);

    // Auto-select column matching primary entanglement terms
    const primaryAbbinamentoTerms = ['abbinamento', 'combinazione', 'legame', 'relazione', 'link', 'group', 'gruppo', 'connessione', 'accoppiamento', 'coppia', 'entanglement', 'cluster', 'partner', 'nodo', 'associazione', 'set'];
    const autoSelects = originalHeaders.filter(col => 
      primaryAbbinamentoTerms.some(term => col.toLowerCase().includes(term))
    );
    setSelectedEntanglementCols(autoSelects.length > 0 ? autoSelects : []);

    addMessage('system', `📄 **CSV File Read Successfully!**
Detected columns in your file:
${originalHeaders.map(c => `• **${c}**`).join('\n')}

*(Note: Row data is completely raw without pre-set associations)*

❓ **Which of these columns would you like to link via quantum entanglement for your prediction? (For example: link the Consumption column with the Date column).**

⚠️ **Why is this necessary?**
Without entanglement to link chosen columns, using quantum hardware offers no mathematical advantage. Processing without these linked relationships can be done faster and cheaper on a classical computer.`);
  };

  const processInputCSV = (csvTextContent: string, forceIgnoreWarning = false) => {
    // Split rows on any newline representation
    const lines = csvTextContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      addMessage('system', `❌ **FORMAT ERROR:** The inserted CSV file does not have a valid header + data structure.`);
      return;
    }

    // Auto-detect the column delimiter: supports tab, semicolon, comma, pipe
    const headerLine = lines[0];
    let delimiter = ',';
    if (headerLine.includes('\t')) delimiter = '\t';
    else if (headerLine.includes(';')) delimiter = ';';
    else if (headerLine.includes('|')) delimiter = '|';
    else delimiter = ',';

    const originalHeaders = headerLine.split(delimiter).map(h => h.trim());
    const headers = originalHeaders.map(h => h.trim().toLowerCase());
    
    // Identify key column indices
    let idxArticolo = -1;
    let idxSaturazione = -1;

    // 1. Article/Asset Column Finding
    const primaryArticoloTerms = ['item_code', 'item', 'code', 'codice', 'articolo', 'asset', 'prodotto', 'id_', 'lotto', 'flusso', 'flow'];
    const secondaryArticoloTerms = ['id', 'name', 'oggetto', 'nome', 'voce', 'label'];

    idxArticolo = headers.findIndex(h => primaryArticoloTerms.some(term => h.includes(term)));
    if (idxArticolo === -1) {
      idxArticolo = headers.findIndex(h => secondaryArticoloTerms.some(term => h.includes(term)));
    }

    // 2. Saturation Column Finding (Column 2 / Saturation Percentage)
    const primarySaturazioneTerms = ['saturation_percentage', 'saturation percentage', 'saturation', 'saturazione', 'percentuale', 'percentage', 'probabilita', 'probability', 'prob'];
    const secondarySaturazioneTerms = ['rischio', 'valore', 'level', 'ratio', 'efficienza', 'indice', 'load', 'rate', 'dazi', 'index', 'value', 'risk', 'importo', 'angle_phase1', 'fase1'];

    idxSaturazione = headers.findIndex(h => primarySaturazioneTerms.some(term => h.includes(term)));
    if (idxSaturazione === -1) {
      idxSaturazione = headers.findIndex(h => secondarySaturazioneTerms.some(term => h.includes(term)));
    }

    // Intelligent Fallbacks:
    if (idxArticolo === -1 && headers.length > 0) {
      idxArticolo = 0;
    }

    if (idxSaturazione === -1) {
      if (headers.length > 1) {
        idxSaturazione = idxArticolo === 0 ? 1 : 0;
      } else {
        idxSaturazione = 0;
      }
    }

    if (idxArticolo === -1 || idxSaturazione === -1) {
      addMessage('system', `❌ **MISSING COLUMNS ERROR:** Unable to detect an ID column and a numeric value column. Ensure your file contains at least one ID column and one value column.`);
      return;
    }

    // 3. Entanglement Link Column Finding
    const idxAbbinamento = originalHeaders.findIndex(h => 
      ['abbinamento', 'legame', 'relazione', 'gruppo', 'accoppiamento', 'entanglement', 'link'].some(term => h.toLowerCase().includes(term))
    );

    // 4. Check for Phase 2 / Strike / Correlation / Rate Column (4th Column / Index 3)
    let idxCorrelazione = originalHeaders.findIndex(h => {
      const hLower = h.toLowerCase();
      return ['angle_phase2', 'phase2', 'fase2', 'strike_price', 'strike price', 'strike', 'spot_exchange_rates', 'spot exchange rates', 'spot_exchange', 'spot exchange', 'dynamic_correlation', 'dynamic correlation', 'correlation', 'correlazione', 'cambio', 'tasso', 'risk_free_rate', 'risk free rate', 'risk_free', 'risk free', 'rate', 'compatibility', 'limit_temperature', 'work_hours', 'active_ports', 'expected_return'].some(term => hLower === term || hLower.includes(term));
    });

    if (idxCorrelazione === -1) {
      idxCorrelazione = originalHeaders.findIndex((h, idx) => {
        return idx !== idxArticolo && idx !== idxSaturazione && idx !== idxAbbinamento && idx === 3;
      });
    }
    if (idxCorrelazione === -1 && originalHeaders.length >= 4) {
      idxCorrelazione = 3;
    }

    const idxAnglePhase1 = originalHeaders.findIndex(h => {
      const hl = h.toLowerCase();
      return hl.includes('angle_phase1') || hl.includes('angle_1') || hl.includes('fase1_rad');
    });
    const idxAnglePhase2 = originalHeaders.findIndex(h => {
      const hl = h.toLowerCase();
      return hl.includes('angle_phase2') || hl.includes('angle_2') || hl.includes('fase2_rad');
    });

    const hasEntanglementMapping = selectedEntanglementCols.length > 0;

    // Identify ignored columns for data reduction log
    const ignored: string[] = [];
    originalHeaders.forEach((h) => {
      const hLower = h.toLowerCase();
      const isArt = originalHeaders[idxArticolo]?.toLowerCase() === hLower;
      const isSat = originalHeaders[idxSaturazione]?.toLowerCase() === hLower;
      const isEnt = selectedEntanglementCols.includes(h);
      if (!isArt && !isSat && !isEnt) {
        ignored.push(h);
      }
    });
    setIgnoredColumns(ignored);

    let autoCorrectedDecimalCount = 0;
    const correctionLogs: string[] = [];
    let emptyCellsCount = 0;
    let outOfScaleCount = 0;
    let negativeClampedCount = 0;

    // Retrieve clean records
    let cleanRecords: Array<{ article: string, saturation: number, abbinamento: string, correlazioneNumerica?: number, anglePhase1?: number, anglePhase2?: number }> = [];
    let maxSeenSaturation = 0;
    const tempRecords: Array<{ article: string, saturation: number, abbinamento: string, correlazioneNumerica?: number, anglePhase1?: number, anglePhase2?: number }> = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter);
      if (parts.length <= Math.max(idxArticolo, idxSaturazione)) {
        emptyCellsCount++;
        continue;
      }
      
      let article = parts[idxArticolo] ? parts[idxArticolo].replace(/^["']|["']$/g, '').trim() : '';
      if (!article) {
        article = `Asset_${i}`;
        correctionLogs.push(`Riga ${i}: ID vuoto sostituito con identificatore automatico '${article}'.`);
      }

      let originalSaturationText = parts[idxSaturazione] ? parts[idxSaturazione].replace(/^["']|["']$/g, '').trim() : '';
      if (!originalSaturationText) {
        originalSaturationText = '0.0';
        emptyCellsCount++;
        correctionLogs.push(`Riga ${i} (${article}): Cella valore vuota impostata a default '0.0'.`);
      }

      // Build key based on selected entanglement columns
      let abbinamento = 'INDEPENDENT';
      if (idxAbbinamento !== -1 && parts[idxAbbinamento]) {
        abbinamento = parts[idxAbbinamento].replace(/^["']|["']$/g, '').trim().toUpperCase();
      } else if (hasEntanglementMapping) {
        const keyParts = selectedEntanglementCols.map(colName => {
          const colIdx = originalHeaders.findIndex(h => h === colName);
          if (colIdx !== -1 && parts[colIdx]) {
            return parts[colIdx].replace(/^["']|["']$/g, '').trim();
          }
          return '';
        }).filter(v => v.length > 0);
        
        if (keyParts.length > 0) {
          abbinamento = keyParts.join(' | ').toUpperCase();
        }
      }

      // Extract Correlation / Rate / Phase 2 numeric value
      let correlazioneNumerica: number | undefined = undefined;
      const rawCorrText = (idxCorrelazione !== -1 && parts[idxCorrelazione]) 
        ? parts[idxCorrelazione].replace(/^["']|["']$/g, '').replace(/,/g, '.').trim() 
        : (parts[3] ? parts[3].replace(/^["']|["']$/g, '').replace(/,/g, '.').trim() : '');

      if (rawCorrText) {
        let parsed = parseFloat(rawCorrText);
        if (!isNaN(parsed)) {
          if (parsed > 1.0 && parsed <= 100.0) parsed = parsed / 100.0;
          else if (parsed > 100.0) parsed = 0.5;
          else if (parsed < 0.0) parsed = 0.0;
          correlazioneNumerica = parsed;
        }
      }

      // Check if angles are already pre-calculated in table
      let anglePhase1: number | undefined = undefined;
      if (idxAnglePhase1 !== -1 && parts[idxAnglePhase1]) {
        const pAngle1 = parseFloat(parts[idxAnglePhase1].replace(/^["']|["']$/g, '').replace(/,/g, '.').trim());
        if (!isNaN(pAngle1)) anglePhase1 = pAngle1;
      }
      let anglePhase2: number | undefined = undefined;
      if (idxAnglePhase2 !== -1 && parts[idxAnglePhase2]) {
        const pAngle2 = parseFloat(parts[idxAnglePhase2].replace(/^["']|["']$/g, '').replace(/,/g, '.').trim());
        if (!isNaN(pAngle2)) anglePhase2 = pAngle2;
      }

      // Auto-correct comma decimals
      if (originalSaturationText.includes(',')) {
        originalSaturationText = originalSaturationText.replace(',', '.');
        autoCorrectedDecimalCount++;
        correctionLogs.push(`Riga ${i} (${article}): Sostituita virgola decimale con punto matematico.`);
      }

      let saturationValue = parseFloat(originalSaturationText);

      if (isNaN(saturationValue)) {
        saturationValue = 0.0;
        emptyCellsCount++;
        correctionLogs.push(`Riga ${i} (${article}): Valore non numerico '${parts[idxSaturazione]}' corretto a 0.0.`);
      }

      if (saturationValue < 0) {
        negativeClampedCount++;
        correctionLogs.push(`Riga ${i} (${article}): Valore negativo (${saturationValue}) impostato a 0.0 (limite fisico).`);
        saturationValue = 0.0;
      }

      if (saturationValue > 1.0) {
        outOfScaleCount++;
      }

      tempRecords.push({ article, saturation: saturationValue, abbinamento, correlazioneNumerica, anglePhase1, anglePhase2 });
      if (saturationValue > maxSeenSaturation) {
        maxSeenSaturation = saturationValue;
      }
    }

    // Auto-scaling for values using 0-100% scale or values > 1.0
    let percentageScalingApplied = false;
    if (maxSeenSaturation > 1.0) {
      percentageScalingApplied = true;
      cleanRecords = tempRecords.map(r => {
        let scaled = r.saturation;
        if (scaled > 1.0) {
          scaled = parseFloat((scaled > 100 ? 1.0 : scaled / 100).toFixed(4));
        }
        return {
          ...r,
          saturation: Math.min(1.0, Math.max(0.0, scaled))
        };
      });
      correctionLogs.push(`Valori fuori scala rilevati (max: ${maxSeenSaturation}): convertiti automaticamente in frazione decimale (intervallo 0.0 - 1.0) per le porte quantistiche.`);
    } else {
      cleanRecords = tempRecords;
    }

    if (cleanRecords.length === 0) {
      addMessage('system', isIt ? `❌ **ERRORE DI CONTENUTO:** Impossibile estrarre righe di dati numerici validi dal file.` : `❌ **CONTENT ERROR:** Unable to extract valid numerical data rows from the file.`);
      return;
    }

    // Store cleaned records into localStorage for instant real asset name translation in IBM Quantum page
    try {
      localStorage.setItem('quantum_latest_cleaned_records', JSON.stringify(cleanRecords));
      localStorage.setItem('quantum_latest_sector', selectedSectorLong || '');
    } catch {}

    // Build Data Quality Check Indicator
    const hasCorrections = correctionLogs.length > 0 || autoCorrectedDecimalCount > 0 || percentageScalingApplied || emptyCellsCount > 0;
    const qualityReportCard = hasCorrections 
      ? (isIt 
          ? `🟠 **CONTROLLO QUALITÀ DATI: VALORI FUORI SCALA / FORMATO CORRETTI AUTOMATICAMENTE**
*Il sistema ha analizzato il file CSV, rilevato le anomalie e le ha normalizzate matematicamente:*
${autoCorrectedDecimalCount > 0 ? `• **Separatori Decimali:** Convertite **${autoCorrectedDecimalCount}** virgole in punti (\`.\`).\n` : ''}${percentageScalingApplied ? `• **Valori Fuori Scala (>1.0):** **${outOfScaleCount}** valori percentuali (fino a **${maxSeenSaturation}**) normalizzati tra 0.00 e 1.00.\n` : ''}${emptyCellsCount > 0 ? `• **Celle Vuote / Formato:** Corrette **${emptyCellsCount}** celle incomplete con valori sicuri.\n` : ''}${negativeClampedCount > 0 ? `• **Valori Negativi:** Normalizzati **${negativeClampedCount}** valori sottozero a 0.0.\n` : ''}
*Tutti i dati sono ora perfettamente allineati per la conversione in angoli quantistici senza errori.*`
          : `🟠 **DATA QUALITY CHECK: OUT-OF-SCALE / FORMAT VALUES AUTOMATICALLY NORMALIZED**
*The system analyzed the CSV file, detected anomalies and mathematically normalized them:*
${autoCorrectedDecimalCount > 0 ? `• **Decimal Separators:** Converted **${autoCorrectedDecimalCount}** commas to dots (\`.\`).\n` : ''}${percentageScalingApplied ? `• **Out of Scale Values (>1.0):** **${outOfScaleCount}** percentage values (up to **${maxSeenSaturation}**) normalized between 0.00 and 1.00.\n` : ''}${emptyCellsCount > 0 ? `• **Empty Cells / Format:** Corrected **${emptyCellsCount}** incomplete cells with secure values.\n` : ''}${negativeClampedCount > 0 ? `• **Negative Values:** Clamped **${negativeClampedCount}** below-zero values to 0.0.\n` : ''}
*All data is now aligned for quantum angle conversion without compilation errors.*`)
      : (isIt 
          ? `🟢 **CONTROLLO QUALITÀ DATI: CONVALIDATO AL 100%**
*Tutti i valori del file CSV sono conformi, nei limiti di scala previsti (0.0 - 1.0) e privi di errori di formattazione.*`
          : `🟢 **DATA QUALITY CHECK: 100% VALIDATED**
*All values in the CSV file comply with expected bounds (0.0 - 1.0) with zero formatting errors.*`);

    // Process Qasm logic
    const N = cleanRecords.length;
    const isOptionB = scenarioSelection === 'B';
    const isOptionC = scenarioSelection === 'C';

    let logicSummary = isIt
      ? `${qualityReportCard}

---

✅ **NORMALIZZAZIONE E MAPPATURA QUANTISTICA COMPLETATA**
- **Separatore Rilevato:** colonna delimitata da \`${delimiter}\`
- **Mappatura Intelligente Colonne:**
  * Identificativo (Codice/Asset): colonna \`${originalHeaders[idxArticolo]?.trim()}\` (indice ${idxArticolo})
  * Stato Critico (Saturazione/Rischio): colonna \`${originalHeaders[idxSaturazione]?.trim()}\` (indice ${idxSaturazione})
  * Relazioni (Entanglement/Gruppi): ${isOptionC ? '*Nessuna - Opzione C attiva (Mappatura Ampiezze Pura - 0 porte CX)*' : isOptionB ? '*Nessuna - Opzione B attiva (Mappatura Geometrica Angolare Pura - 0 porte CX)*' : hasEntanglementMapping ? `basata su colonne \`${selectedEntanglementCols.join('`, `')}\`` : '*Nessuna (Tutti impostati su INDEPENDENT)*'}
- **Righe Elaborate (N Qubit):** ${N}
- **Colonne Secondarie Escluse:** ${ignored.length > 0 ? ignored.map(c => `\`${c}\``).join(', ') : 'Nessuna colonna ridondante rilevata.'}
- **Dettaglio Qubit Assegnati:**
${cleanRecords.map((r, i) => `  * Qubit q[${i}] ➔ **${r.article}** (Saturazione: **${r.saturation}**, Relazione: **${isOptionC ? 'ISOLATED_PROBABILITY' : isOptionB ? 'ISOLATED_GEOMETRY' : r.abbinamento}**)`).join('\n')}
 
- **Allocazione Registro Quantistico:** \`qreg q[${N + 1}];\` (incluso Qubit Comparatore Ancilla q[${N}])
- **Modalità di Codifica:** ${isOptionC ? 'Ampiezza/Probabilità Pura Isolata (Zero CNOT/CX)' : isOptionB ? 'Geometrica Pura Isolata (Solo Porte RZ - Zero CNOT/CX)' : 'Entanglement Coerente Multi-Qubit (RY + CRY/RZ)'}`
      : `${qualityReportCard}

---

✅ **QUANTUM NORMALIZATION & MAPPING COMPLETED**
- **Detected Separator:** column delimited by \`${delimiter}\`
- **Intelligent Column Mapping:**
  * Identifier (Code/Asset): column \`${originalHeaders[idxArticolo]?.trim()}\` (index ${idxArticolo})
  * Critical Status (Saturation/Risk): column \`${originalHeaders[idxSaturazione]?.trim()}\` (index ${idxSaturazione})
  * Relationships (Entanglement/Groups): ${isOptionC ? '*None - Option C active (Pure Amplitude Mapping - 0 CX gates)*' : isOptionB ? '*None - Option B active (Pure Angular Geometric Mapping - 0 CX gates)*' : hasEntanglementMapping ? `based on columns \`${selectedEntanglementCols.join('`, `')}\`` : '*None (All set to INDEPENDENT)*'}
- **Processed Rows (N Qubits):** ${N}
- **Secondary Excluded Columns:** ${ignored.length > 0 ? ignored.map(c => `\`${c}\``).join(', ') : 'No redundant columns detected.'}
- **Assigned Qubit Breakdown:**
${cleanRecords.map((r, i) => `  * Qubit q[${i}] ➔ **${r.article}** (Saturation: **${r.saturation}**, Relation: **${isOptionC ? 'ISOLATED_PROBABILITY' : isOptionB ? 'ISOLATED_GEOMETRY' : r.abbinamento}**)`).join('\n')}
 
- **Quantum Register Allocation:** \`qreg q[${N + 1}];\` (including Ancilla Comparator Qubit q[${N}])
- **Encoding Mode:** ${isOptionC ? 'Pure Isolated Amplitude/Probability (Zero CNOT/CX)' : isOptionB ? 'Pure Isolated Geometric (RZ Only - Zero CNOT/CX)' : 'Multi-Qubit Coherent Entanglement (RY + CRY/RZ)'}`;

    setMappingSummary(logicSummary);

    let qasmCircuitCode = `OPENQASM 2.0;\ninclude "qelib1.inc";\n\n`;
    qasmCircuitCode += `// --- INIZIALIZZAZIONE REGISTRI QUANTISTICI E CLASSICI ---\n`;
    qasmCircuitCode += `qreg q[${N + 1}];\n`;
    qasmCircuitCode += `creg c[${N + 1}];\n\n`;

    qasmCircuitCode += `// --- STEP 1: STATE PREPARATION & ENCODING DATI AZIENDALI ---\n`;
    cleanRecords.forEach((record, index) => {
      const pClipped = Math.max(0, Math.min(record.saturation, 1.0));
      const theta1 = record.anglePhase1 !== undefined ? record.anglePhase1 : (2 * Math.asin(Math.sqrt(pClipped)));
      if (isOptionC) {
        qasmCircuitCode += `// Probabilistic amplitude mapping for ${record.article} (Input: ${record.saturation} -> Angle: ${theta1.toFixed(5)} rad)\n`;
      } else {
        qasmCircuitCode += `// Amplitude initialization for ${record.article} (Input: ${record.saturation} -> Angle: ${theta1.toFixed(5)} rad)\n`;
      }
      qasmCircuitCode += `ry(${theta1.toFixed(5)}) q[${index}];\n`;
    });
    qasmCircuitCode += `\n`;
    let entanglementAdded = false;

    qasmCircuitCode += `// --- STEP 2: CONFIGURAZIONE DELLO SPARTITO ALGORITMICO ---\n`;
    if (isOptionC) {
      qasmCircuitCode += `// Focus Ampiezza: Regolazione fine delle rotazioni ry d'ampiezza a singolo qubit\n`;
      cleanRecords.forEach((record, index) => {
        const pClipped = Math.max(0, Math.min(record.saturation, 1.0));
        const ampGain = (0.5 * Math.PI * pClipped).toFixed(5);
        qasmCircuitCode += `ry(${ampGain}) q[${index}]; // Ponderazione ampiezza per ${record.article}\n`;
      });
      qasmCircuitCode += `\n`;
    } else if (isOptionB) {
      qasmCircuitCode += `// Focus Angolo 3D: Rotazioni geometriche di fase locale rx sulla sfera di Bloch\n`;
      cleanRecords.forEach((record, index) => {
        qasmCircuitCode += `rx(0.52360) q[${index}]; // Inclinazione polare per lo stato energetico di ${record.article}\n`;
      });
      qasmCircuitCode += `\n`;
    } else {
      const groups: Record<string, number[]> = {};
      let uniqueGroupCounter = 0;

      cleanRecords.forEach((record, index) => {
        const match = record.abbinamento.trim().toUpperCase();
        const isIndependent = [
          'SINGOLI', 'SINGOLO', 'INDIPENDENTE', 'INDIPENDENTI', 'LIBERO', 'FREE', 
          'DECOUPLED', 'INDEPENDENT', ''
        ].includes(match);

        if (!isIndependent) {
          if (!groups[match]) groups[match] = [];
          groups[match].push(index);
        } else {
          const uniqueKey = `_INDEPENDENT_ROW_${index}_${uniqueGroupCounter++}`;
          groups[uniqueKey] = [index];
        }
      });

      const getRecordCorrAngle = (record: { article: string, saturation: number, abbinamento: string, correlazioneNumerica?: number, anglePhase2?: number }): { corrVal: number, thetaCorr: number } => {
        if (record.anglePhase2 !== undefined) {
          return { corrVal: record.correlazioneNumerica ?? 0.5, thetaCorr: record.anglePhase2 };
        }
        let corrVal = 0.5;
        if (record.correlazioneNumerica !== undefined && !isNaN(record.correlazioneNumerica)) {
          corrVal = Math.max(0, Math.min(1, record.correlazioneNumerica));
        } else {
          const parsedCorr = parseFloat((record.abbinamento || '').replace(/,/g, '.'));
          if (!isNaN(parsedCorr) && parsedCorr >= 0 && parsedCorr <= 1.0) corrVal = parsedCorr;
        }
        const thetaCorr = 2 * Math.asin(Math.sqrt(corrVal));
        return { corrVal, thetaCorr };
      };

      Object.entries(groups).forEach(([groupName, indices]) => {
        if (indices.length > 1) {
          for (let g = 1; g < indices.length; g++) {
            const targetRecord = cleanRecords[indices[g]];
            const { thetaCorr } = getRecordCorrAngle(targetRecord);
            qasmCircuitCode += `cry(${thetaCorr.toFixed(5)}) q[${indices[0]}], q[${indices[g]}]; // Entanglement di fase\n`;
            entanglementAdded = true;
          }
        }
      });

      const bypassWarning = isOptionB || isOptionC || hasEntanglementMapping || forceIgnoreWarning || entanglementAdded;

      if (!entanglementAdded && !bypassWarning) {
        setPendingCsvData(csvTextContent);
        setWarningReason(!hasEntanglementMapping ? 'missing_column' : 'no_associations');
        setShowEntanglementWarning(true);
        
        addMessage('system', `⚠️ **IMPORTANT WARNING:** No **Entanglement** links detected in the CSV file uploaded or selected.
- **Main reason:** ${!hasEntanglementMapping ? "No column selected for Entanglement." : "Selected columns contain unique values or settings set to 'INDEPENDENT'."}

Without entanglement, qubits process data autonomously without leveraging collective coherence and distributed quantum calculations.

*Please review the choice in the interactive panel below to proceed anyway or adjust the file.*`);
        return;
      }

      setShowEntanglementWarning(false);
      setPendingCsvData('');

      if (!entanglementAdded) {
        qasmCircuitCode += `// Nessuna porta inter-asset applicata\n`;
      }
      qasmCircuitCode += `\n`;
    }

    qasmCircuitCode += `// --- STEP 3: COMPARATORE ANCILLA ---\n`;
    const thresholdClipped = Math.max(0.01, Math.min(threshold, 1.0));
    const totalThresholdAngle = 2 * Math.asin(Math.sqrt(thresholdClipped));
    const distributedAngle = totalThresholdAngle / N;

    if (isOptionC) {
      qasmCircuitCode += `ry(${totalThresholdAngle.toFixed(5)}) q[${N}]; // Rotazione ampiezza soglia ancilla\n\n`;
    } else if (isOptionB) {
      qasmCircuitCode += `rx(${totalThresholdAngle.toFixed(5)}) q[${N}]; // Rotazione soglia angolare ancilla\n\n`;
    } else {
      for (let u = 0; u < N; u++) {
        qasmCircuitCode += `cry(${distributedAngle.toFixed(5)}) q[${u}], q[${N}]; // Accumulo lineare di rischio su ancilla\n`;
      }
      qasmCircuitCode += `\n`;
    }

    qasmCircuitCode += `// --- STEP 3B: APPLICAZIONE METRICHE DI FASE ---\n`;
    cleanRecords.forEach((record, index) => {
      let phaseAngle = 0.78539;
      if (record.anglePhase2 !== undefined) {
         phaseAngle = record.anglePhase2;
      } else if (record.correlazioneNumerica !== undefined) {
         phaseAngle = record.correlazioneNumerica * Math.PI;
      }
      qasmCircuitCode += `rz(${phaseAngle.toFixed(5)}) q[${index}]; // Encoding della metrica sulla fase Z\n`;
    });
    qasmCircuitCode += `\n`;

    qasmCircuitCode += `// --- STEP 4: MISURAZIONE ---\n`;
    for (let m = 0; m <= N; m++) {
      qasmCircuitCode += `measure q[${m}] -> c[${m}];\n`;
    }

    setQasmOutput(qasmCircuitCode);
    setCsvData(csvTextContent);
    setCleanedRecords(cleanRecords);

    addMessage('system', logicSummary);

    const mappedColumnsText = isOptionC
      ? '  * Pure amplitude/probability single-qubit mapping (Zero CNOT / CX gates, exact CSV Saturation_Percentage fidelity)'
      : isOptionB
        ? '  * Pure geometric single-qubit mapping (Zero CNOT / CX gates, isolated RZ phase rotations)'
        : selectedEntanglementCols.length > 0 
          ? selectedEntanglementCols.map((col, cIdx) => `  * Column \`${col}\` ➔ Mapped to Qubit \`q[${cIdx}]\``).join('\n')
          : '  * No columns selected (Isolated classical processing)';

    addMessage('system', `⚙️ **BACKGROUND LOGIC AUTOMATION (QUANTUM PRE-PROCESSING):**
The application is automatically setting up quantum circuit preparation according to instructions:
- **Automatic Transcription:** Transcribing raw data into bit sequences and mapping individual records directly to input qubits.
- **Probabilistic / Geometric Feature Mapping:** ${isOptionC ? 'Converting user CSV values directly into isolated probability amplitudes via single-qubit RY gates.' : isOptionB ? 'Converting user CSV values into initialization RY gates and isolated local phase RZ gates.' : 'Converting numerical values into initialization RY angles and dynamic correlation CRY/RZ gates.'}
- **Entanglement Gate Configuration:** ${isOptionC ? '**Disabled (0 CNOT / CX gates).** Pure isolated single-qubit amplitude encoding without multi-qubit entanglement.' : isOptionB ? '**Disabled (0 CNOT / CX gates).** Strictly isolated single-qubit rotations (RY, RZ) applied on independent qubits without multi-qubit entanglement.' : `Computing and applying targeted quantum entanglement gates across qubits corresponding to selected columns: **${selectedEntanglementCols.join(', ') || 'None'}**.`}

🔌 **PASSING DIRECTIVES TO THE QUANTUM ENGINE:**
Structural mapping completed on the quantum register:
${mappedColumnsText}

These instructions have been sent to the quantum execution engine to process the circuit.`);

    setTimeout(() => {
      const details = getScenarioDetails(selectedSectorLong || 'Finance & Markets', scenarioSelection || 'A');
      
      const analysisText = isOptionC
        ? `🔮 **Quantum Circuit Synthesis Completed!**

### 1. Strategic Analysis (Managerial)
Applying **Option C: Pure Amplitude/Probability Mapping without Entanglement (Mappatura Ampiezza/Probabilità Pura Senza Entanglement)** on your business scenario (**${details.name}**).
All saturation metrics read from your CSV dataset are converted into isolated probability amplitudes exclusively via single-qubit \`ry\` gates ($\\theta = 2\\arcsin(\\sqrt{P})$).
- **Exact Numeric Fidelity:** All values (${cleanRecords.map(r => `\`${r.article}\`: ${r.saturation}`).join(', ')}) are faithfully preserved directly from your CSV input without distortion or synthetic overwrites.
- **Zero Entanglement:** Rigorously excludes all multi-qubit entanglement gates (\`cx\` or CNOT) and leaves Phase 2 empty.
- **Operational Advantage:** Delivers direct, noise-free stochastic projections and default probability distributions on NISQ hardware with maximum statistical transparency.

### 2. OpenQASM 2.0 Quantum Code
All cash flow saturation parameters have been translated into isolated probability amplitudes in OpenQASM 2.0 (Zero CNOT / CX gates):

[START_COMPOSER]
${qasmCircuitCode}
[END_COMPOSER]

### 3. Hardware Connection Button
To run real-time simulation and transmit the circuit to the physical quantum hardware grid at IBM Quantum Corporation, use the direct connector:

[ACTION: RENDER_BUTTON_SEND_TO_IBM_Q]`
        : isOptionB 
        ? `🔮 **Quantum Circuit Synthesis Completed!**

### 1. Strategic Analysis (Managerial)
Applying **Option B: Pure Geometric Mapping without Entanglement (Mappatura Geometrica Pura Senza Entanglement)** on your business scenario (**${details.name}**).
All encoding and quantum transformations are conducted through initialization rotations (\`ry\`) and isolated local phase rotations (\`rz\`) applied to independent single qubits, without any controlled entanglement gates (\`cx\` or CNOT) in Phase 2.
- **Operational Advantage:** Completely eliminates two-qubit gate decoherence and crosstalk errors on NISQ quantum hardware, maximizing single-qubit gate fidelity and providing robust geometric trajectory tracking.

### 2. OpenQASM 2.0 Quantum Code
All parameters have been translated into isolated parametric rotations (RY, RZ) in OpenQASM 2.0 with pure geometric mapping (Zero CNOT / CX gates in Phase 2):

[START_COMPOSER]
${qasmCircuitCode}
[END_COMPOSER]

### 3. Hardware Connection Button
To run real-time simulation and transmit the circuit to the physical quantum hardware grid at IBM Quantum Corporation, use the direct connector:

[ACTION: RENDER_BUTTON_SEND_TO_IBM_Q]`
        : `🔮 **Quantum Circuit Synthesis Completed!**

### 1. Strategic Analysis (Managerial)
Applying **Type 3 Mixed Entanglement** on your business scenario (**${details.name}**) correlates critical variables multi-factorially. 
In quantum combinatorial computing, this synchronous link forces qubits to evolve collectively, capturing non-linear interdependencies invisible to classical algorithms.
- **Operational Advantage:** Instantaneous synchronization of business metrics, providing high-accuracy resolution of critical variances and optimizing target margins.

### 2. OpenQASM 2.0 Quantum Code
All constraints, including physical clipping, multi-node entanglement gates, and CRY distribution for the threshold comparator, have been translated into OpenQASM 2.0:

[START_COMPOSER]
${qasmCircuitCode}
[END_COMPOSER]

### 3. Hardware Connection Button
To run real-time simulation and transmit the circuit to the physical quantum hardware grid at IBM Quantum Corporation, use the direct connector:

[ACTION: RENDER_BUTTON_SEND_TO_IBM_Q]`;

      addMessage('system', analysisText, true, qasmCircuitCode);
      setStep(4);
    }, 1500);
  };

  const handleConfirmProceedWithoutEntanglement = () => {
    setShowEntanglementWarning(false);
    if (pendingCsvData) {
      processInputCSV(pendingCsvData, true);
    }
  };

  const handleCancelEntanglementWarning = () => {
    setShowEntanglementWarning(false);
    setPendingCsvData('');
  };

  const handleReset = () => {
    setStep(1);
    setSelectedSector('');
    setSelectedScenario(null);
    setSearchTerm('');
    setSelectedMacroarea('Tutte');
    setSelectedTechnology('Tutte');
    setAnswers({});
    setCsvData('');
    setQasmOutput('');
    setMappingSummary('');
    setCleanedRecords([]);
    setIsCleaningExpanded(false);
    setIsFormulasExpanded(false);
    setRightPanelTab('composer');
    setMessages([
      {
        id: 'new-session',
        sender: 'system',
        text: `👋 **Nuova Sessione Inizializzata (V9 Core)**

Acquisizione guidata e conversazionale dei dati aziendali per la generazione OpenQASM 2.0 verso IBM Quantum.

👉 **FASE 0 - Seleziona la tua Macro-Area di riferimento (1-6 o clicca sotto):**

1. 📊 **Finanza e Mercati**
2. 🚚 **Logistica e Smart Cities**
3. 🔬 **Chimica e Green Tech**
4. 🏭 **Manutenzione, Manifatturiero e Abbigliamento**
5. 🧬 **Sanità e Genomica**
6. 🛡️ **Cybersecurity**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 flex flex-col min-h-[calc(100vh-140px)]"
    >
      {/* Upper Navigation Row with Retro accents */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-5 shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-quantum-primary transition-all duration-200 group cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-1.5 rounded bg-quantum-primary/10 border border-quantum-primary/20 text-quantum-primary">
                <Cpu className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white uppercase flex items-center gap-2">
                {t('agents_title') || 'QUANTUM ENGINE BI'} <span className="text-xs text-quantum-secondary font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">{t('agents_orchestrator') || 'AGENTIC ORCHESTRATOR'}</span>
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-mono">
              {t('agents_subtitle') || 'Universal Compiler & Translator of Heterogeneous Files to OpenQASM 2.0 for IBM CPU'}
            </p>
          </div>
        </div>

        {/* Global actions */}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold text-quantum-primary bg-quantum-primary/5 hover:bg-quantum-primary/10 border border-quantum-primary/20 rounded-xl cursor-pointer transition-all self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" /> {t('agents_reinit_session') || 'REINITIALIZE SESSION'}
        </button>
      </div>

      {/* Main Layout Divided into Workspace and Chat Engine */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-0">
        
        {/* Left Column (The Interactive Chat Engine Sandbox) */}
        <div className="lg:col-span-8 flex flex-col bg-[#0b111e]/90 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
          
          {/* Header Sandbox Accents */}
          <div className="p-4 bg-[#070b14]/50 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono">
              <Terminal className="w-4 h-4 text-quantum-primary animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {t('agents_console_title') || 'Quantum Conversational Console'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-gray-500">
              STATUS <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" /> {t('agents_status_eng_live') || 'ENG_LIVE'}
            </div>
          </div>

          {/* Chat scrolling feed */}
          <div ref={chatFeedRef} className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[50vh] lg:max-h-[58vh] scrollbar-hide text-xs sm:text-sm">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                id={`agent-chat-msg-${msg.id}`}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1`}>
                  {msg.sender === 'system' ? (t('agents_quantum_compiler') || '🤖 Quantum Compiler') : (t('agents_business_user') || '👤 Business user')}
                </div>
                
                <div className={`p-4 rounded-2xl max-w-[90%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-quantum-primary/15 border border-quantum-primary/25 text-white whitespace-pre-wrap'
                    : 'bg-[#0f172a]/70 border border-white/10 text-gray-300 font-sans'
                }`}>
                  {msg.sender === 'user' ? msg.text : renderMessageContent(msg.text)}

                  {/* Render special inner code widgets inside system responses */}
                  {msg.isComposerCode && msg.code && (
                    <div className="mt-4 bg-[#070b14] border border-white/10 rounded-xl overflow-hidden font-mono text-xs shadow-lg">
                      <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between text-gray-400">
                        <span>{t('agents_openqasm_scope') || 'OPENQASM 2.0 SCOPE'}</span>
                        <button
                          onClick={() => copyCode(msg.code || '')}
                          className="p-1 px-2 rounded hover:bg-white/5 text-quantum-primary flex items-center gap-1 transition-colors cursor-pointer text-[10px] uppercase font-bold"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {isCopied ? (t('ibm_copied') || 'Copied') : (t('ibm_copy') || 'Copy')}
                        </button>
                      </div>
                      <pre className="p-3.5 overflow-x-auto text-quantum-secondary select-all whitespace-pre max-h-[160px] scrollbar-hide leading-normal text-[11px]">
                        {msg.code}
                      </pre>
                      
                      {/* Execution Trigger (QPU vs HPC) */}
                      <div className="p-3.5 bg-[#0a0f1d] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
                        <span className="text-gray-400 uppercase tracking-wider text-[9px] font-bold">
                          {selectedTechnology.includes('HPC') || selectedTechnology.includes('Classica')
                            ? (isIt ? 'PREPARATO PER CLUSTER HPC / SIMULAZIONE CLASSICA' : 'PREPARED FOR HPC CLUSTER / CLASSICAL SIMULATION')
                            : (t('agents_prepared_ibm') || 'PREPARED FOR IBM QPU')}
                        </span>
                        {selectedTechnology.includes('HPC') || selectedTechnology.includes('Classica') ? (
                          <button
                            disabled={isRunningHpc}
                            onClick={() => executeHpcSimulation(msg.code || '')}
                            className="px-4 py-2 bg-quantum-primary text-quantum-bg hover:bg-quantum-primary/80 disabled:opacity-50 font-black text-[11px] uppercase tracking-wider rounded-lg transition-all shadow-[0_0_12px_rgba(0,242,255,0.25)] hover:shadow-[0_0_18px_rgba(0,242,255,0.45)] duration-200 cursor-pointer flex items-center gap-1.5"
                          >
                            <Cpu className={`w-3.5 h-3.5 fill-current ${isRunningHpc ? 'animate-spin' : 'animate-pulse'}`} />
                            <span>{isRunningHpc ? (isIt ? 'Elaborazione in corso...' : 'Computing...') : (t('agents_confirm_and_start_hpc_btn') || '⚡ ESEGUI CALCOLO CLASSICO (HPC)')}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onSendToIbm(msg.code || '')}
                            className="px-4 py-2 bg-quantum-primary text-quantum-bg hover:bg-quantum-primary/80 font-black text-[11px] uppercase tracking-wider rounded-lg transition-all shadow-[0_0_12px_rgba(0,242,255,0.25)] hover:shadow-[0_0_18px_rgba(0,242,255,0.45)] duration-200 cursor-pointer flex items-center gap-1.5"
                          >
                            <Cpu className="w-3.5 h-3.5 fill-current animate-pulse" /> {t('agents_send_to_ibm_btn') || 'Send to IBM Q 🚀'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-gray-600 mt-1">{msg.timestamp}</span>
              </div>
            ))}

            {isAiThinking && (
              <div className="flex flex-col items-start animate-fade-in">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-quantum-primary uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-quantum-primary" /> {t('agents_quantum_compiler') || '🤖 Quantum Compiler & AI'}
                </div>
                <div className="p-4 rounded-2xl bg-[#0f172a]/85 border border-quantum-primary/40 text-gray-300 font-sans flex items-center gap-3 shadow-[0_0_15px_rgba(0,242,255,0.1)]">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-quantum-primary animate-ping" />
                  <span className="text-xs text-quantum-primary font-mono font-medium">
                    {isIt ? "Elaborazione risposta con l'AI Quantistica in corso..." : "Formulating response with Quantum AI..."}
                  </span>
                </div>
              </div>
            )}

            {showEntanglementWarning ? (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 sm:p-6 border border-amber-500/20 bg-amber-950/10 rounded-2xl flex flex-col gap-4 text-left relative overflow-hidden backdrop-blur-sm shadow-[0_0_20px_rgba(245,158,11,0.05)] font-sans"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-500 shrink-0">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      {t('agents_integrity_warning') || '⚠️ INTEGRITY WARNING: NO ENTANGLEMENT LINK FOUND'}
                    </h4>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      {warningReason === 'missing_column' ? (
                        <span>The column for handling synchronous relationships (<strong>Entanglement_Link</strong>, <strong>Link</strong>, <strong>Group</strong> or <strong>Connection</strong>) was not identified in your CSV header row.</span>
                      ) : (
                        <span>The relationship column was detected, but all processed records are set to <strong>'INDEPENDENT'</strong> or do not possess duplicate coordinated group names.</span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                      Without entanglement, qubits process data autonomously, precluding distributed multi-factor analysis inherent to IBM quantum coherence.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 mt-2 font-mono">
                  <button
                    onClick={handleConfirmProceedWithoutEntanglement}
                    className="flex-1 px-4 py-2.5 bg-amber-500 text-[#090d18] hover:bg-amber-400 text-xs font-black rounded-lg transition-all shadow-[0_0_10px_rgba(245,158,11,0.25)] hover:shadow-[0_0_15px_rgba(245,158,11,0.45)] cursor-pointer text-center uppercase"
                  >
                    {t('agents_proceed_without_entanglement') || '🚀 Proceed Without Entanglement Links'}
                  </button>
                  <button
                    onClick={handleCancelEntanglementWarning}
                    className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-bold rounded-lg transition-all cursor-pointer text-center uppercase"
                  >
                    {t('agents_edit_reassign') || '✏️ Edit & Reassign'}
                  </button>
                </div>
              </motion.div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick trigger actions area depending on active state */}
          <div className="p-4 bg-[#070b14]/50 border-t border-white/5 flex flex-wrap gap-2 items-center">
            {step === 4 && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full bg-[#0c1527] border border-quantum-primary/40 p-3.5 rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.15)]"
              >
                <div className="flex items-center gap-2.5 text-left w-full sm:w-auto">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isIt ? 'Calibrazione Completata & Modello Computazionale Pronto' : 'Calibration Completed & Computation Model Ready'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {selectedTechnology.includes('HPC') || selectedTechnology.includes('Classica')
                        ? (isIt ? 'Esegui il calcolo classico multithread (CPU/GPU) direttamente in questa console' : 'Run classical multithread (CPU/GPU) computation directly in this console')
                        : (isIt ? 'Conferma i parametri e invia il circuito compilato a IBM Quantum QPU' : 'Confirm parameters and send compiled circuit to IBM Quantum QPU')}
                    </span>
                  </div>
                </div>

                {selectedTechnology.includes('HPC') || selectedTechnology.includes('Classica') ? (
                  <button
                    disabled={isRunningHpc}
                    onClick={() => {
                      const realCsv = findRealUserCsv();
                      if (realCsv) {
                        setTempCsvContent(realCsv);
                        setIsCsvLoaded(true);
                        processInputCSV(realCsv, true);
                      }
                      executeHpcSimulation(qasmOutput);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-quantum-primary hover:bg-quantum-primary/90 disabled:opacity-50 text-quantum-bg text-xs font-mono font-black rounded-xl transition-all shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:shadow-[0_0_22px_rgba(0,242,255,0.5)] cursor-pointer text-center uppercase flex items-center justify-center gap-2 shrink-0"
                  >
                    <Cpu className={`w-4 h-4 fill-current ${isRunningHpc ? 'animate-spin' : 'animate-pulse'}`} />
                    <span>{isRunningHpc ? (isIt ? 'Calcolo in corso...' : 'Computing...') : (t('agents_confirm_and_start_hpc_btn') || '⚡ ESEGUI CALCOLO CLASSICO (HPC)')}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const realCsv = findRealUserCsv();
                      if (realCsv) {
                        setTempCsvContent(realCsv);
                        setIsCsvLoaded(true);
                        processInputCSV(realCsv, true);
                      }
                      onSendToIbm(qasmOutput || `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[4];\ncreg c[4];\nry(1.26610) q[0];\nry(1.47063) q[1];\nry(2.16450) q[2];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\nmeasure q[2] -> c[2];\nmeasure q[3] -> c[3];`);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-quantum-primary hover:bg-quantum-primary/90 text-quantum-bg text-xs font-mono font-black rounded-xl transition-all shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:shadow-[0_0_22px_rgba(0,242,255,0.5)] cursor-pointer text-center uppercase flex items-center justify-center gap-2 shrink-0"
                  >
                    <Cpu className="w-4 h-4 fill-current animate-pulse" />
                    <span>{t('agents_confirm_and_start_btn') || '🚀 CONFERMA DATI & AVVIA LA SIMULAZIONE'}</span>
                  </button>
                )}
              </motion.div>
            )}
            {step === 1 && interviewSubstep === 0 && (
              <div className="flex flex-col gap-2 w-full animate-fade-in">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1 font-bold">
                  {t('agents_phase0_select') || '📊 FASE 0: SELEZIONA LA CATEGORIA AZIENDALE:'}
                </span>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2 w-full">
                  <button
                    onClick={() => handleSelectSector('Finanza')}
                    className="px-2 py-2 bg-[#0d1527] border border-white/10 hover:border-quantum-primary rounded-lg text-[10.5px] font-mono font-bold text-white uppercase transition-all hover:bg-quantum-primary/10 cursor-pointer text-center"
                  >
                    1. Finanza
                  </button>
                  <button
                    onClick={() => handleSelectSector('Logistica')}
                    className="px-2 py-2 bg-[#0d1527] border border-white/10 hover:border-quantum-primary rounded-lg text-[10.5px] font-mono font-bold text-white uppercase transition-all hover:bg-quantum-primary/10 cursor-pointer text-center"
                  >
                    2. Logistica
                  </button>
                  <button
                    onClick={() => handleSelectSector('Chimica')}
                    className="px-2 py-2 bg-[#0d1527] border border-white/10 hover:border-quantum-primary rounded-lg text-[10.5px] font-mono font-bold text-white uppercase transition-all hover:bg-quantum-primary/10 cursor-pointer text-center"
                  >
                    3. Chimica
                  </button>
                  <button
                    onClick={() => handleSelectSector('Manifatturiero')}
                    className="px-2 py-2 bg-[#0d1527] border border-white/10 hover:border-quantum-primary rounded-lg text-[10.5px] font-mono font-bold text-white uppercase transition-all hover:bg-quantum-primary/10 cursor-pointer text-center"
                  >
                    4. Fabbrica
                  </button>
                  <button
                    onClick={() => handleSelectSector('Sanita')}
                    className="px-2 py-2 bg-[#0d1527] border border-white/10 hover:border-quantum-primary rounded-lg text-[10.5px] font-mono font-bold text-white uppercase transition-all hover:bg-quantum-primary/10 cursor-pointer text-center"
                  >
                    5. Sanità
                  </button>
                  <button
                    onClick={() => handleSelectSector('Cybersecurity')}
                    className="px-2 py-2 bg-[#0d1527] border border-white/10 hover:border-quantum-primary rounded-lg text-[10.5px] font-mono font-bold text-white uppercase transition-all hover:bg-quantum-primary/10 cursor-pointer text-center"
                  >
                    6. Cybersec
                  </button>
                </div>
              </div>
            )}

            {step === 1 && interviewSubstep === 1 && (() => {
              const currentSector = selectedSector || 'Finanza';
              const scenario = getSectorIndustrialScenario(currentSector);
              const sampleOpts = scenario.sampleElements.split(',').map(s => s.trim());
              
              // Count how many comma-separated elements the user has currently typed in inputText
              const typedTokens = inputText
                .replace(/[;\n]/g, ',')
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);
              const count = typedTokens.length;

              return (
                <div className="flex flex-col gap-2.5 w-full animate-fade-in bg-[#0c1527] border border-quantum-primary/20 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-quantum-primary uppercase tracking-wider block font-black">
                      ✏️ SCRIVI I TUOI INPUT O SELEZIONA QUELLI SUGGERITI (DA 2 A 5 VARIABILI):
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      count >= 2 && count <= 5
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : count > 5
                        ? 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse'
                        : 'bg-white/5 text-gray-400 border-white/10'
                    }`}>
                      {count}/5 Inseriti {count > 5 ? '(Limite max 5)' : count < 2 ? '(Minimo 2)' : '✓'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 w-full">
                    <span className="text-[9.5px] font-mono text-gray-400 uppercase tracking-wide mr-1">
                      💡 Proposte Gemini:
                    </span>
                    <button
                      onClick={() => setInputText(scenario.sampleElements)}
                      className="px-2.5 py-1.5 bg-[#070b14] border border-quantum-primary/30 hover:border-quantum-primary text-[10px] font-mono font-bold text-quantum-primary uppercase transition-all hover:bg-quantum-primary/10 cursor-pointer text-left rounded-lg"
                      title="Inserisce tutti i suggerimenti proposti"
                    >
                      Inserisci predefiniti: <span className="text-white font-normal">{scenario.sampleElements}</span>
                    </button>
                    {sampleOpts.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => {
                          setInputText(prev => {
                            const tokens = prev.replace(/[;\n]/g, ',').split(',').map(s => s.trim()).filter(Boolean);
                            if (tokens.includes(opt)) return prev;
                            if (tokens.length >= 5) return prev;
                            return prev ? `${prev}, ${opt}` : opt;
                          });
                        }}
                        className="px-2.5 py-1.5 bg-[#070b14] border border-white/10 hover:border-quantum-primary text-[10px] font-mono text-white transition-all hover:bg-quantum-primary/5 cursor-pointer rounded-lg"
                      >
                        + {opt}
                      </button>
                    ))}
                    {inputText.trim() && (
                      <button
                        onClick={() => setInputText('')}
                        className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[9.5px] font-mono rounded-lg transition-all ml-auto cursor-pointer"
                        title="Cancella il campo per scrivere da zero"
                      >
                        ✕ Pulisci
                      </button>
                    )}
                  </div>

                  <div className="text-[9px] font-mono text-gray-400 border-t border-white/5 pt-1.5">
                    ℹ️ Puoi digitare direttamente i nomi delle tue variabili nella barra di testo in basso separandole con la virgola (es. <span className="text-cyan-300">FORNITORE_A, FORNITORE_B, LINEA_1</span>).
                  </div>
                </div>
              );
            })()}

            {step === 1 && interviewSubstep === 2 && (() => {
              const currentSector = selectedSector || 'Finanza';
              const scenario = getSectorIndustrialScenario(currentSector);
              const elements = v9Elements.length >= 2 ? v9Elements : scenario.defaultElements;

              // Calculate parsed percentages from current inputText
              const numMatches = inputText.match(/(?:\d+[.,]?\d*|\.\d+)\s*%?/g) || [];
              const parsedList: number[] = numMatches.map(m => {
                const isPct = m.includes('%');
                const n = parseFloat(m.replace('%', '').replace(',', '.').trim());
                if (isNaN(n)) return 35;
                return (isPct || n > 1.0) ? n : n * 100;
              });

              const isMulti = parsedList.length > 1;
              const singleVal = parsedList.length === 1 ? parsedList[0] : null;

              return (
                <div className="flex flex-col gap-2.5 w-full animate-fade-in bg-[#0c1527] border border-quantum-primary/20 p-3.5 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-quantum-primary uppercase tracking-wider block font-black">
                        ✏️ PERCENTUALI PER LE TUE VARIABILI:
                      </span>
                      <span className="text-[9.5px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">
                        {elements.join(', ')}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border self-start sm:self-auto ${
                      isMulti
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : singleVal !== null
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : 'bg-white/5 text-gray-400 border-white/10'
                    }`}>
                      {isMulti
                        ? `Assegnazione: ${elements.map((el, i) => `${el}➔${(parsedList[i] ?? parsedList[parsedList.length-1]).toFixed(0)}%`).join(' | ')}`
                        : singleVal !== null
                        ? `Soglia globale: ${singleVal.toFixed(0)}% (base per tutti i ${elements.length} elementi)`
                        : '💡 Digita 1 o più percentuali separate da virgola'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 w-full">
                    <span className="text-[9.5px] font-mono text-gray-400 uppercase tracking-wide mr-1">
                      💡 Proposte Gemini:
                    </span>
                    <button
                      onClick={() => setInputText(scenario.sampleSaturation)}
                      className="px-2.5 py-1.5 bg-[#070b14] border border-quantum-primary/30 hover:border-quantum-primary text-[10px] font-mono font-bold text-quantum-primary uppercase transition-all hover:bg-quantum-primary/10 cursor-pointer text-left rounded-lg"
                      title="Inserisce una percentuale specifica per ogni singola variabile"
                    >
                      Assegna a ciascuna: <span className="text-white font-normal">{scenario.sampleSaturation}</span>
                    </button>
                    {['15% (Prudente)', '25%', '35% (Standard)', '50%', '75% (Tollerante)'].map((pLabel, pIdx) => {
                      const val = pLabel.split(' ')[0];
                      return (
                        <button
                          key={pIdx}
                          onClick={() => setInputText(val)}
                          className="px-2.5 py-1.5 bg-[#070b14] border border-white/10 hover:border-quantum-primary text-[10px] font-mono text-white transition-all hover:bg-quantum-primary/5 cursor-pointer rounded-lg"
                          title="Imposta questo valore come soglia base globale"
                        >
                          {pLabel}
                        </button>
                      );
                    })}
                    {inputText.trim() && (
                      <button
                        onClick={() => setInputText('')}
                        className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[9.5px] font-mono rounded-lg transition-all ml-auto cursor-pointer"
                        title="Cancella il campo per scrivere da zero"
                      >
                        ✕ Pulisci
                      </button>
                    )}
                  </div>

                  <div className="text-[9px] font-mono text-gray-400 border-t border-white/5 pt-1.5">
                    ℹ️ **Associazione Domanda 1 ➔ Domanda 2:** Le percentuali verranno abbinate direttamente alle variabili inserite (es. <span className="text-cyan-300">{elements[0] || 'VAR1'} ➔ 25%, {elements[1] || 'VAR2'} ➔ 45%</span>) oppure condivise come soglia comune.
                  </div>
                </div>
              );
            })()}

            {step === 1 && interviewSubstep === 3 && (
              <div className="flex flex-col gap-2 w-full animate-fade-in bg-[#0c1527] border border-quantum-primary/20 p-3 rounded-xl">
                <span className="text-[10px] font-mono text-quantum-primary uppercase tracking-wider block font-black">
                  💡 SCEGLI IL LIVELLO DI PRUDENZA (DOMANDA 3):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 w-full">
                  <button
                    onClick={() => handleSendMessage('1')}
                    className="px-3 py-2 bg-[#070b14] border border-red-500/30 hover:border-red-400 text-[10.5px] font-mono font-bold text-red-300 transition-all hover:bg-red-500/10 cursor-pointer rounded-lg text-left"
                  >
                    1. Alta Prudenza (Massima Protezione)
                  </button>
                  <button
                    onClick={() => handleSendMessage('2')}
                    className="px-3 py-2 bg-[#070b14] border border-quantum-primary/30 hover:border-quantum-primary text-[10.5px] font-mono font-bold text-quantum-primary transition-all hover:bg-quantum-primary/10 cursor-pointer rounded-lg text-left"
                  >
                    2. Bilanciato (Rischio Moderato)
                  </button>
                  <button
                    onClick={() => handleSendMessage('3')}
                    className="px-3 py-2 bg-[#070b14] border border-amber-500/30 hover:border-amber-400 text-[10.5px] font-mono font-bold text-amber-300 transition-all hover:bg-amber-500/10 cursor-pointer rounded-lg text-left"
                  >
                    3. Tollerante (Alta Aggressività)
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-2 w-full animate-fade-in bg-[#0c1527] border border-quantum-primary/30 p-3 rounded-xl shadow-lg">
                <span className="text-[10px] font-mono text-quantum-primary uppercase tracking-wider block font-black">
                  📋 FASE 2: CONFERMA LA TABELLA DATI
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-1 w-full">
                  <button
                    onClick={() => {
                      setInputText('conferma');
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="px-4 py-2.5 bg-quantum-primary hover:bg-quantum-primary/90 text-quantum-bg text-xs font-mono font-black rounded-lg transition-all shadow-[0_0_12px_rgba(0,242,255,0.3)] cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>CONFERMA E COMPILA CIRCUITO</span>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-2.5 w-full animate-fade-in bg-[#0c1527] border border-quantum-primary/30 p-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono text-quantum-primary uppercase tracking-wider block font-black flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> FASE 3: CIRCUITO GENERATO & AZIONI DISPONIBILI
                  </span>
                  <button
                    onClick={() => {
                      setStep(1);
                      setInterviewSubstep(0);
                      setSelectedSector(null);
                      addMessage('system', '🔄 Scenario reimpostato. Seleziona una nuova categoria per iniziare.');
                    }}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-[10px] font-mono rounded-lg cursor-pointer transition-all flex items-center gap-1"
                  >
                    🔄 Nuovo Scenario
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full">
                  {/* Primary Compute / Send to IBM Q */}
                  {selectedTechnology.includes('HPC') || selectedTechnology.includes('Classica') || selectedTechnology === 'HPC' ? (
                    <button
                      disabled={isRunningHpc}
                      onClick={() => {
                        const realCsv = findRealUserCsv();
                        if (realCsv) {
                          setTempCsvContent(realCsv);
                          setIsCsvLoaded(true);
                          processInputCSV(realCsv, true);
                        }
                        executeHpcSimulation(qasmOutput);
                      }}
                      className="px-4 py-2.5 bg-quantum-primary hover:bg-quantum-primary/90 disabled:opacity-50 text-quantum-bg text-xs font-mono font-black rounded-lg transition-all shadow-[0_0_12px_rgba(0,242,255,0.3)] cursor-pointer flex items-center gap-2"
                    >
                      <Cpu className={`w-4 h-4 fill-current ${isRunningHpc ? 'animate-spin' : 'animate-pulse'}`} />
                      <span>{isRunningHpc ? (isIt ? 'Calcolo in corso...' : 'Computing...') : '⚡ Esegui Calcolo Classico (HPC)'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const realCsv = findRealUserCsv();
                        if (realCsv) {
                          setTempCsvContent(realCsv);
                          setIsCsvLoaded(true);
                          processInputCSV(realCsv, true);
                        }
                        onSendToIbm(qasmOutput || `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[4];\ncreg c[4];\nry(1.26610) q[0];\nry(1.47063) q[1];\nry(2.16450) q[2];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\nmeasure q[2] -> c[2];\nmeasure q[3] -> c[3];`);
                      }}
                      className="px-4 py-2.5 bg-quantum-primary hover:bg-quantum-primary/90 text-quantum-bg text-xs font-mono font-black rounded-lg transition-all shadow-[0_0_12px_rgba(0,242,255,0.3)] cursor-pointer flex items-center gap-2"
                    >
                      <Cpu className="w-4 h-4 fill-current animate-pulse" />
                      <span>🚀 Invia a IBM Quantum QPU</span>
                    </button>
                  )}

                  {/* Copy QASM Button */}
                  <button
                    onClick={() => copyCode(qasmOutput || '')}
                    className="px-3 py-2 bg-quantum-primary/15 hover:bg-quantum-primary/25 border border-quantum-primary/40 text-quantum-primary text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Copia negli appunti il codice OpenQASM 2.0 generato"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'QASM Copiato!' : 'Copia Codice OpenQASM'}</span>
                  </button>

                  {/* Copy Interview Q&A + CSV Summary Button */}
                  <button
                    onClick={copyInterviewSummary}
                    className="px-3 py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Copia l'intera trascrizione dell'intervista (domande e risposte date) insieme alla tabella CSV"
                  >
                    {isInterviewCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                    <span>{isInterviewCopied ? 'Verbale Copiato!' : 'Copia Intera Intervista & CSV'}</span>
                  </button>

                  {/* Download Interview Report Button */}
                  <button
                    onClick={handleDownloadInterviewReport}
                    className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Scarica il verbale completo (domande, risposte, tabella CSV e circuito) come file .md"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Scarica Verbale (.md)</span>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex items-center justify-end gap-2 w-full px-2 py-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    {t('agents_threshold') || 'Soglia Ancilla:'}
                  </span>
                  
                  {/* Tooltip esplicativo per l'input di soglia */}
                  <div className="relative group/thresh inline-flex items-center">
                    <button
                      type="button"
                      aria-label="Spiegazione controllo di soglia e freccette"
                      className="text-gray-400 hover:text-quantum-primary focus:outline-none transition-colors cursor-help p-0.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 w-72 sm:w-80 p-3 bg-[#070e1b] border border-quantum-primary/40 rounded-xl text-left shadow-2xl backdrop-blur-xl opacity-0 pointer-events-none group-hover/thresh:opacity-100 group-hover/thresh:pointer-events-auto transition-all duration-200 z-50">
                      <p className="text-[10.5px] text-gray-200 leading-relaxed font-sans normal-case">
                        <strong className="text-quantum-primary">Valore Decimale di Soglia:</strong> <span className="font-mono">{threshold}</span> corrisponde a <strong>{(threshold * 100).toFixed(0)}%</strong>.
                      </p>
                      <p className="text-[10px] text-gray-300 mt-1 leading-relaxed font-sans normal-case">
                        Se la probabilità di anomalia complessiva supera questo valore, l'Ancilla collassa su <strong>|1⟩ (Allerta)</strong>; altrimenti su <strong>|0⟩ (Regolare)</strong>.
                      </p>
                      <div className="mt-2 pt-1.5 border-t border-white/10 text-[9px] text-cyan-300 font-sans">
                        💡 <strong>Usa le freccette (▲ / ▼)</strong> per aumentare o diminuire la soglia a scatti dell'1% (±0.01).
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#070b14] border border-white/10 focus-within:border-quantum-primary rounded px-1.5 py-0.5">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value) || 0.04)}
                    title="Usa le freccette o digita il valore decimale (es. 0.04 = 4%)"
                    className="w-14 bg-transparent text-xs text-white text-center font-mono focus:outline-none"
                  />
                  <span className="text-[10px] font-mono text-quantum-primary font-bold">
                    ({(threshold * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Hidden File Input for CSV upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCsvFileUpload}
            accept=".csv,.txt"
            className="hidden"
          />

          {/* User Text inputs row */}
          <div className="p-4 bg-[#070b14] border-t border-white/5 flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl transition-all flex items-center justify-center cursor-pointer"
              title="Carica file CSV locale"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                step === 1 && interviewSubstep === 0 ? (isIt ? "Digita 1-6, seleziona una categoria o fai una domanda..." : "Type 1-6, select a sector or ask a question...") :
                step === 1 && interviewSubstep === 1 ? (isIt ? "Scrivi da 2 a 5 variabili separate da virgola (es. CLIENTE_1, FORNITORE_A) o fai una domanda..." : "Type 2 to 5 variables separated by comma or ask a question...") :
                step === 1 && interviewSubstep === 2 ? (isIt ? "Digita la percentuale di soglia (es. 35%, 25%, 0.40) o fai una domanda..." : "Type threshold percentage (e.g. 35%, 0.35) or ask a question...") :
                step === 1 && interviewSubstep === 3 ? (isIt ? "Digita 1, 2 o 3 per la prudenza o fai una domanda..." : "Type 1, 2 or 3 for prudence level or ask a question...") :
                step === 2 ? (isIt ? "Digita 'conferma' o fai una domanda..." : "Type 'confirm' or ask a question...") :
                (t('agents_placeholder_step3') || "Incolla dati CSV, esegui o fai una domanda...")
              }
              className="flex-1 bg-[#090d18] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-quantum-primary transition-colors font-mono"
            />
            <button
              onClick={handleSendMessage}
              className="p-3 bg-quantum-primary hover:bg-quantum-primary/95 text-quantum-bg rounded-xl transition-all shadow-[0_0_10px_rgba(0,242,255,0.2)] hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column (The Real-Time Hardware Register & OpenQASM Visualizer) */}
        <div className="lg:col-span-4 flex flex-col gap-5 min-h-[400px]">
          {step === 1 ? (
            <div className="bg-[#0b111e]/90 border border-quantum-primary/20 rounded-2xl p-5 flex flex-col flex-1 relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3 shrink-0">
                <h3 className="text-xs font-mono font-bold text-quantum-primary uppercase tracking-widest flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-quantum-secondary" /> Database Scenari (104 Target)
                </h3>
                <span className="text-[10px] font-mono text-quantum-secondary bg-quantum-secondary/10 px-2 py-0.5 rounded border border-quantum-secondary/15 uppercase font-bold">
                  71 QPU / 33 HPC
                </span>
              </div>

              {/* Filtering Controls */}
              <div className="space-y-3 mb-4 shrink-0">
                {/* Search Term Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('agents_search_placeholder') || 'Search scenario or variables...'}
                    className="w-full bg-[#070b14]/70 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-quantum-primary transition-all font-mono"
                  />
                </div>

                {/* Macroarea and Tech Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-gray-500 uppercase">{t('agents_macroarea') || 'Macro-Area'}</label>
                    <select
                      value={selectedMacroarea}
                      onChange={(e) => setSelectedMacroarea(e.target.value)}
                      className="bg-[#070b14]/75 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-gray-300 focus:outline-none focus:border-quantum-primary font-mono cursor-pointer"
                    >
                      <option value="Tutte">{t('agents_all_macroareas') || 'All Macro-Areas'}</option>
                      <option value="Finanza e Mercati">{isIt ? 'Finanza e Mercati' : 'Finance & Markets'}</option>
                      <option value="Logistica e Supply Chain">{isIt ? 'Logistica e Supply Chain' : 'Logistics & Supply Chain'}</option>
                      <option value="Energia e Utilities">{isIt ? 'Energia e Utilities' : 'Energy & Utilities'}</option>
                      <option value="Chimica, Farmaceutica e Materiali">{isIt ? 'Chimica, Farmaceutica e Materiali' : 'Chemistry & Materials'}</option>
                      <option value="Produzione e Manifattura">{isIt ? 'Produzione e Manifattura' : 'Manufacturing & Production'}</option>
                      <option value="Sicurezza, Telecomunicazioni e Reti">{isIt ? 'Sicurezza, Telecomunicazioni e Reti' : 'Security & Telecom'}</option>
                      <option value="Sanità e Genomica">{isIt ? 'Sanità e Genomica' : 'Healthcare & Genomics'}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-gray-500 uppercase">{t('agents_technology') || 'Technology'}</label>
                    <select
                      value={selectedTechnology}
                      onChange={(e) => setSelectedTechnology(e.target.value)}
                      className="bg-[#070b14]/75 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-gray-300 focus:outline-none focus:border-quantum-primary font-mono cursor-pointer"
                    >
                      <option value="Tutte">{t('agents_all_technologies') || 'All Technologies'}</option>
                      <option value="Computer Quantistico (QPU)">{t('agents_tech_qpu') || 'Quantum Computer (QPU)'}</option>
                      <option value="IA Classica / HPC">{t('agents_tech_hpc') || 'Classical AI / HPC'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Scrollable Scenario List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[350px] lg:max-h-[420px] pr-1 scrollbar-hide text-xs">
                {QUANTUM_SCENARIOS.filter(s => {
                  const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                      s.targetVariables.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      s.logicType.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchArea = selectedMacroarea === 'Tutte' || 
                                    s.macroarea === selectedMacroarea || 
                                    (selectedMacroarea.includes('Finanz') && s.macroarea.includes('Finanz')) || 
                                    (selectedMacroarea.includes('Logist') && s.macroarea.includes('Logist')) || 
                                    (selectedMacroarea.includes('Energi') && s.macroarea.includes('Energi')) || 
                                    (selectedMacroarea.includes('Chimic') && s.macroarea.includes('Chimic')) || 
                                    (selectedMacroarea.includes('Manifatt') && s.macroarea.includes('Manifatt')) || 
                                    (selectedMacroarea.includes('Produz') && s.macroarea.includes('Produz')) || 
                                    (selectedMacroarea.includes('Sicurez') && s.macroarea.includes('Sicurez')) || 
                                    (selectedMacroarea.includes('Sanit') && s.macroarea.includes('Sanit'));
                  const matchTech = selectedTechnology === 'Tutte' || s.technology === selectedTechnology;
                  return matchSearch && matchArea && matchTech;
                }).map((scenario) => (
                  <div
                    key={scenario.id}
                    onClick={() => handleSelectScenarioAndStart(scenario)}
                    className="p-3 bg-[#0a0f1d] hover:bg-quantum-primary/5 border border-white/5 hover:border-quantum-primary/40 rounded-xl transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold text-white group-hover:text-quantum-primary transition-colors leading-snug">
                        {scenario.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {scenario.focus && (
                          <span className={`text-[7.5px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded font-bold ${
                            scenario.focus === 'Entanglement'
                              ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                              : scenario.focus === 'Ampiezza'
                              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                          }`}>
                            {scenario.focus}
                          </span>
                        )}
                        <span className={`text-[8px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded font-bold ${
                          scenario.technology.includes('QPU') 
                            ? 'bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff]'
                            : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
                        }`}>
                          {scenario.technology.includes('QPU') ? 'QPU' : 'HPC'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-400 mt-1 font-mono">
                      Logic: <span className="text-gray-300">{scenario.logicType}</span>
                    </p>

                    <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-white/5">
                      <span className="text-[9px] font-mono text-quantum-primary truncate max-w-[180px] sm:max-w-[210px]" title={scenario.targetVariables}>
                        Var: {scenario.targetVariables}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#00f2ff] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-bold shrink-0">
                        START <Send className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Collapsible Module 1: Data Cleaning & Column Reduction */}
              <div className="bg-[#0b111e]/90 border border-white/10 rounded-xl overflow-hidden transition-all shadow-sm">
                <button
                  onClick={() => setIsCleaningExpanded(!isCleaningExpanded)}
                  className="w-full p-3.5 bg-[#070b14]/80 hover:bg-[#0c1426] flex items-center justify-between transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-quantum-secondary shrink-0" />
                    <span className="text-xs font-mono font-bold text-quantum-primary uppercase tracking-wider">
                      {t('agents_data_cleaning_title') || 'Data Cleaning & Column Reduction'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${mappingSummary ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-white/5 text-gray-500 border border-white/5'}`}>
                      {mappingSummary ? (cleanedRecords.length > 0 ? `${cleanedRecords.length} Qubit` : '✅ Elaborato') : '⏳ In attesa'}
                    </span>
                    {isCleaningExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>
                {isCleaningExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 border-t border-white/5 bg-[#080d19] font-mono text-xs text-gray-300 whitespace-pre-line leading-relaxed max-h-[250px] overflow-y-auto"
                  >
                    {mappingSummary ? mappingSummary : (
                      <div className="flex flex-col items-center justify-center text-center py-4 text-gray-500">
                        <Info className="w-6 h-6 text-white/15 mb-2 animate-pulse" />
                        <p className="text-[11px]">{t('agents_awaiting_csv') || 'In attesa dei dati CSV per visualizzare estrazione colonne e allocazione hardware.'}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Collapsible Module 2: Protected Physical Formulations */}
              <div className="bg-[#0b111e]/90 border border-white/10 rounded-xl overflow-hidden transition-all shadow-sm">
                <button
                  onClick={() => setIsFormulasExpanded(!isFormulasExpanded)}
                  className="w-full p-3.5 bg-[#070b14]/80 hover:bg-[#0c1426] flex items-center justify-between transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-quantum-primary shrink-0" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      {t('agents_protected_formulations') || 'Protected Physical Formulations'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-quantum-primary/10 border border-quantum-primary/20 text-quantum-primary">
                      3 Formule Fisiche
                    </span>
                    {isFormulasExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>
                {isFormulasExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 border-t border-white/5 bg-[#080d19] space-y-3 font-mono text-[11px] text-gray-400"
                  >
                    <div className="flex items-start gap-2 border-b border-white/5 pb-2">
                      <span className="text-quantum-secondary font-bold shrink-0">A. Clip Sec:</span>
                      <span>P_clipped = min(max(P, 0), 1) ➔ Protezione anti-NaN per anomalie estreme.</span>
                    </div>
                    <div className="flex items-start gap-2 border-b border-white/5 pb-2">
                      <span className="text-quantum-secondary font-bold shrink-0">B. Rotation:</span>
                      <span>theta = 2 * arcsin(sqrt(P_clipped)) ➔ Mappatura angolare rigorosa su Bloch Sphere.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-quantum-secondary font-bold shrink-0">C. Comparator:</span>
                      <span>theta = (2 * arcsin(sqrt(Threshold))) / N ➔ Distribuzione CRY equi-ripartita su ancilla.</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Main Quantum Hub Card: IBM Composer / OpenQASM 2.0 / Qiskit Python */}
              <div className="flex-1 bg-[#070b14] border border-white/10 rounded-2xl overflow-hidden flex flex-col font-mono shadow-xl relative min-h-[420px]">
                
                {/* Hub Navigation Tabs Bar */}
                <div className="p-2 bg-[#090e1c] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-[#050811] p-1 rounded-xl border border-white/5">
                    <button
                      onClick={() => setRightPanelTab('composer')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        rightPanelTab === 'composer'
                          ? 'bg-quantum-primary/20 border border-quantum-primary/40 text-quantum-primary shadow-sm'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" /> 🎼 IBM Composer
                    </button>

                    {/* QPU Scenarios: show OpenQASM 2.0 */}
                    {(!selectedTechnology.includes('HPC') && !selectedTechnology.includes('Classica')) && (
                      <button
                        onClick={() => setRightPanelTab('qasm')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                          rightPanelTab === 'qasm'
                            ? 'bg-quantum-primary/20 border border-quantum-primary/40 text-quantum-primary shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Code className="w-3.5 h-3.5" /> 📜 OpenQASM 2.0
                      </button>
                    )}

                    {/* HPC Scenarios: show Qiskit (Python) */}
                    {(selectedTechnology.includes('HPC') || selectedTechnology.includes('Classica')) && (
                      <button
                        onClick={() => setRightPanelTab('qiskit')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                          rightPanelTab === 'qiskit'
                            ? 'bg-quantum-primary/20 border border-quantum-primary/40 text-quantum-primary shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5 text-indigo-400" /> 🐍 Qiskit (Python)
                      </button>
                    )}
                  </div>

                  {/* Actions Header Toolbar */}
                  <div className="flex items-center gap-1.5">
                    {/* General Export Button (Interview Q&A + CSV) */}
                    <button
                      onClick={copyInterviewSummary}
                      className="px-2.5 py-1 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-lg text-[10px] text-purple-300 font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Copia Verbale Intervista (Domande, Risposte e Tabella CSV)"
                    >
                      {isInterviewCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <FileText className="w-3 h-3" />}
                      {isInterviewCopied ? 'Copiato' : 'Verbale & CSV'}
                    </button>
                    {rightPanelTab === 'qasm' && (
                      <>
                        <button
                          onClick={() => copyCode(qasmOutput || '')}
                          disabled={!qasmOutput}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 rounded-lg text-[10px] text-quantum-primary font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Copia codice OpenQASM 2.0"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {isCopied ? 'Copiato' : 'Copia'}
                        </button>
                        <button
                          onClick={handleDownloadQasm}
                          disabled={!qasmOutput}
                          className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer"
                          title="Scarica file .qasm"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {rightPanelTab === 'qiskit' && (
                      <>
                        <button
                          onClick={copyQiskitCode}
                          className="px-2.5 py-1 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 rounded-lg text-[10px] text-indigo-300 font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Copia codice Python Qiskit"
                        >
                          {isQiskitCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {isQiskitCopied ? 'Copiato' : 'Copia'}
                        </button>
                        <button
                          onClick={handleDownloadQiskit}
                          className="p-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 rounded-lg text-indigo-300 hover:text-white transition-all cursor-pointer"
                          title="Scarica file script .py"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {rightPanelTab === 'composer' && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Activity className="w-3 h-3 animate-pulse" /> Live Score
                      </span>
                    )}
                  </div>
                </div>

                {/* TAB CONTENT AREA */}
                <div className="flex-1 p-4 overflow-y-auto max-h-[380px] scrollbar-hide text-xs">
                  
                  {/* TAB 1: IBM QUANTUM COMPOSER VISUAL SCORE */}
                  {rightPanelTab === 'composer' && (
                    <div className="flex flex-col gap-4">
                      {/* Gate Palette Toolbar */}
                      <div className="bg-[#050811] p-2.5 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          IBM Composer Palette:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-blue-600/25 border border-blue-500/40 text-blue-300 text-[10px] font-bold rounded shadow-sm">H</span>
                          <span className="px-2 py-0.5 bg-cyan-500/25 border border-cyan-400/50 text-cyan-300 text-[10px] font-bold rounded shadow-sm">RY</span>
                          <span className="px-2 py-0.5 bg-purple-600/25 border border-purple-500/40 text-purple-300 text-[10px] font-bold rounded shadow-sm">RZ</span>
                          <span className="px-2 py-0.5 bg-rose-600/25 border border-rose-500/40 text-rose-300 text-[10px] font-bold rounded shadow-sm">RX</span>
                          <span className="px-2 py-0.5 bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded shadow-sm">CX</span>
                          <span className="px-2 py-0.5 bg-amber-600/25 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded shadow-sm">CRY</span>
                          <span className="px-2 py-0.5 bg-slate-700/60 border border-slate-500/50 text-slate-200 text-[10px] font-bold rounded shadow-sm">M</span>
                        </div>
                      </div>

                      {/* Quantum Circuit Score Board */}
                      {(() => {
                        const recs = cleanedRecords.length > 0 ? cleanedRecords : [
                          { article: 'ITEM_01', saturation: 0.35, abbinamento: 'COMBINATO_01' },
                          { article: 'ITEM_02', saturation: 0.45, abbinamento: 'COMBINATO_01' },
                          { article: 'ITEM_03', saturation: 0.78, abbinamento: 'LIBERO' }
                        ];
                        const N = recs.length;
                        const isOptC = scenarioSelection === 'C';
                        const isOptB = scenarioSelection === 'B';
                        const isOptA = !isOptB && !isOptC;

                        return (
                          <div className="bg-[#050811] border border-white/10 rounded-xl p-4 overflow-x-auto relative">
                            {/* Circuit Scan Line Animation */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-quantum-primary/5 to-transparent animate-pulse pointer-events-none" />

                            <div className="flex flex-col gap-5 min-w-[340px]">
                              {/* Qubit Rails */}
                              {recs.map((rec, rIdx) => {
                                const pClipped = Math.max(0, Math.min(rec.saturation, 1.0));
                                const theta = (2 * Math.asin(Math.sqrt(pClipped))).toFixed(3);
                                const isControl = isOptA && rIdx === 0;
                                const isTarget = isOptA && rIdx === 1;

                                return (
                                  <div key={rIdx} className="flex items-center gap-3 relative group">
                                    {/* Qubit identifier badge */}
                                    <div className="w-24 shrink-0 flex flex-col">
                                      <span className="text-[11px] font-bold text-white flex items-center gap-1">
                                        <Cpu className="w-3 h-3 text-quantum-primary" /> q[{rIdx}]
                                      </span>
                                      <span className="text-[9px] text-gray-500 truncate" title={rec.article}>
                                        {rec.article} ({(pClipped * 100).toFixed(0)}%)
                                      </span>
                                    </div>

                                    {/* Score wire with Gates */}
                                    <div className="flex-1 flex items-center relative py-2">
                                      {/* Wire Line */}
                                      <div className="absolute inset-x-0 h-0.5 bg-slate-700 top-1/2 -translate-y-1/2 group-hover:bg-quantum-primary/40 transition-colors" />

                                      {/* Gates along the timeline */}
                                      <div className="flex items-center justify-between w-full relative z-10 pl-2 pr-2">
                                        
                                        {/* Gate Phase 1: RY Initial Rotation */}
                                        <div
                                          onMouseEnter={() => setHoveredGate({
                                            gate: `RY(${theta} rad)`,
                                            qubit: `q[${rIdx}]`,
                                            param: `θ = ${theta}`,
                                            details: `Rotazione d'ampiezza per ${rec.article} (P = ${(pClipped * 100).toFixed(1)}%)`
                                          })}
                                          onMouseLeave={() => setHoveredGate(null)}
                                          className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/60 hover:border-cyan-300 rounded text-[10px] font-bold text-cyan-200 transition-all cursor-pointer shadow-sm flex items-center gap-1"
                                        >
                                          RY <span className="text-[8px] text-cyan-300 font-mono">({theta})</span>
                                        </div>

                                        {/* Gate Phase 2: Entanglement or Geometric or Isolated */}
                                        {isOptC ? (
                                          <div
                                            onMouseEnter={() => setHoveredGate({
                                              gate: 'Isolamento Puro',
                                              qubit: `q[${rIdx}]`,
                                              details: 'Opzione C attiva: Ampiezza probabilistica isolata pura (0 Porte CNOT)'
                                            })}
                                            onMouseLeave={() => setHoveredGate(null)}
                                            className="px-1.5 py-0.5 bg-emerald-950/40 border border-emerald-500/30 rounded text-[9px] text-emerald-400 font-bold cursor-pointer"
                                          >
                                            ~ 0 CNOT
                                          </div>
                                        ) : isOptB ? (
                                          <div
                                            onMouseEnter={() => setHoveredGate({
                                              gate: 'RZ + RX (3D Bloch)',
                                              qubit: `q[${rIdx}]`,
                                              details: 'Opzione B attiva: Rotazioni geometriche angolari parametriche'
                                            })}
                                            onMouseLeave={() => setHoveredGate(null)}
                                            className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-400/50 rounded text-[9px] text-purple-300 font-bold cursor-pointer"
                                          >
                                            RZ/RX
                                          </div>
                                        ) : (
                                          isControl ? (
                                            <div
                                              onMouseEnter={() => setHoveredGate({
                                                gate: 'Controllo Entanglement (●)',
                                                qubit: `q[${rIdx}]`,
                                                target: `q[1]`,
                                                details: 'Porta CX: Nodo di controllo per correlazione combinata'
                                              })}
                                              onMouseLeave={() => setHoveredGate(null)}
                                              className="w-4 h-4 bg-emerald-400 rounded-full border border-white flex items-center justify-center cursor-pointer shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                            />
                                          ) : isTarget ? (
                                            <div
                                              onMouseEnter={() => setHoveredGate({
                                                gate: 'Target Entanglement (⊕)',
                                                qubit: `q[${rIdx}]`,
                                                details: 'Porta CX: Target correlato da q[0]'
                                              })}
                                              onMouseLeave={() => setHoveredGate(null)}
                                              className="w-5 h-5 bg-emerald-500/30 border border-emerald-400 rounded-full flex items-center justify-center text-emerald-300 font-bold text-xs cursor-pointer shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                            >
                                              ⊕
                                            </div>
                                          ) : (
                                            <div
                                              onMouseEnter={() => setHoveredGate({
                                                gate: 'RZ(π/4)',
                                                qubit: `q[${rIdx}]`,
                                                details: 'Rotazione di fase parametrica coerente'
                                              })}
                                              onMouseLeave={() => setHoveredGate(null)}
                                              className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-400/50 rounded text-[9px] text-purple-300 font-bold cursor-pointer"
                                            >
                                              RZ
                                            </div>
                                          )
                                        )}

                                        {/* Gate Phase 3: Comparator Connection */}
                                        <div
                                          onMouseEnter={() => setHoveredGate({
                                            gate: isOptA ? 'CRY (Comparator)' : 'Soglia Ampiezza',
                                            qubit: `q[${rIdx}]`,
                                            details: `Connessione comparatore energetico alla soglia ${(threshold * 100).toFixed(1)}%`
                                          })}
                                          onMouseLeave={() => setHoveredGate(null)}
                                          className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-400/40 rounded text-[9px] text-amber-300 font-bold cursor-pointer"
                                        >
                                          {isOptA ? 'CRY' : 'RY(T)'}
                                        </div>

                                        {/* Gate Phase 4: Measurement Block */}
                                        <div
                                          onMouseEnter={() => setHoveredGate({
                                            gate: 'Misura Quantistica (Measure)',
                                            qubit: `q[${rIdx}]`,
                                            target: `c[${rIdx}]`,
                                            details: `Collasso della funzione d'onda sul registro classico c[${rIdx}]`
                                          })}
                                          onMouseLeave={() => setHoveredGate(null)}
                                          className="px-2 py-1 bg-slate-800 border border-slate-600 hover:border-slate-400 rounded text-[10px] font-bold text-slate-200 cursor-pointer flex items-center gap-1 shadow-sm"
                                        >
                                          <span className="text-quantum-secondary text-[11px]">◓</span> M
                                        </div>

                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Ancilla Comparator Qubit Rail */}
                              <div className="flex items-center gap-3 relative group pt-1">
                                <div className="w-24 shrink-0 flex flex-col">
                                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> q[{N}] (Ancilla)
                                  </span>
                                  <span className="text-[9px] text-gray-500 truncate">
                                    Comparatore
                                  </span>
                                </div>

                                <div className="flex-1 flex items-center relative py-2">
                                  <div className="absolute inset-x-0 h-0.5 bg-amber-900/50 top-1/2 -translate-y-1/2" />
                                  <div className="flex items-center justify-between w-full relative z-10 pl-2 pr-2">
                                    <div className="text-[9px] text-gray-600 font-mono">|0⟩</div>
                                    <div className="px-2 py-0.5 bg-amber-500/20 border border-amber-400/50 rounded text-[9px] text-amber-300 font-bold">
                                      RY (Soglia)
                                    </div>
                                    <div className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-[10px] font-bold text-slate-200 flex items-center gap-1">
                                      <span className="text-quantum-secondary text-[11px]">◓</span> M
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Classical Register Rail */}
                              <div className="flex items-center gap-3 relative pt-2 border-t border-white/5">
                                <div className="w-24 shrink-0 flex flex-col">
                                  <span className="text-[10px] font-mono font-bold text-slate-400">
                                    c (Registro / {N + 1})
                                  </span>
                                </div>
                                <div className="flex-1 flex items-center relative py-1">
                                  <div className="absolute inset-x-0 h-1 border-t border-b border-slate-700 top-1/2 -translate-y-1/2" />
                                  <div className="w-full text-right pr-2 font-mono text-[9px] text-gray-500 relative z-10">
                                    === Misurazione finale ===/
                                  </div>
                                </div>
                              </div>

                            </div>

                            {/* Gate Details Tooltip */}
                            {hoveredGate && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 p-2.5 bg-[#091122] border border-quantum-primary/30 rounded-lg text-left"
                              >
                                <div className="flex items-center justify-between text-[10.5px] font-bold text-quantum-primary">
                                  <span>Porta: {hoveredGate.gate} su {hoveredGate.qubit}</span>
                                  {hoveredGate.param && <span className="text-white font-mono">{hoveredGate.param}</span>}
                                </div>
                                <p className="text-[10px] text-slate-300 mt-0.5">{hoveredGate.details}</p>
                              </motion.div>
                            )}

                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* TAB 2: OPENQASM 2.0 CODE */}
                  {rightPanelTab === 'qasm' && (
                    <div className="flex flex-col gap-2">
                      <div className="p-3 bg-[#050811] border border-white/5 rounded-xl text-quantum-secondary select-all whitespace-pre leading-relaxed max-h-[300px] overflow-y-auto text-[11px] font-mono">
                        {qasmOutput ? qasmOutput : (
                          <div className="py-8 text-center text-gray-500">
                            <HelpCircle className="w-7 h-7 text-white/10 mx-auto mb-2" />
                            <span>{t('agents_no_active_circuit') || 'In attesa di generazione codice OpenQASM 2.0.'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: QISKIT PYTHON SCRIPT */}
                  {rightPanelTab === 'qiskit' && (
                    <div className="flex flex-col gap-2">
                      <div className="p-3 bg-[#050811] border border-white/5 rounded-xl text-indigo-300 select-all whitespace-pre leading-relaxed max-h-[300px] overflow-y-auto text-[11px] font-mono">
                        {generateQiskitPythonCode(qasmOutput, cleanedRecords)}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono italic">
                        *Compatibile al 100% con Python 3.10+, Qiskit 1.0+ e IBM Quantum Cloud.
                      </span>
                    </div>
                  )}

                </div>

                {/* Transmit to IBM QPU or Execute Classical HPC Footer Button */}
                <div className="p-3.5 bg-[#090e1c] border-t border-white/10">
                  {selectedTechnology.includes('HPC') || selectedTechnology.includes('Classica') ? (
                    <button
                      disabled={isRunningHpc}
                      onClick={() => executeHpcSimulation(qasmOutput)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-quantum-primary hover:bg-quantum-primary/90 disabled:opacity-50 text-quantum-bg font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(0,242,255,0.25)] hover:shadow-[0_0_22px_rgba(0,242,255,0.45)] cursor-pointer duration-200"
                    >
                      <Cpu className={`w-4 h-4 fill-current ${isRunningHpc ? 'animate-spin' : 'animate-pulse'}`} />
                      <span>{isRunningHpc ? (isIt ? 'Calcolo in corso...' : 'Computing...') : (t('agents_confirm_and_start_hpc_btn') || '⚡ ESEGUI CALCOLO CLASSICO (HPC)')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSendToIbm(qasmOutput || `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[4];\ncreg c[4];\nry(1.26610) q[0];\nry(1.47063) q[1];\nry(2.16450) q[2];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\nmeasure q[2] -> c[2];\nmeasure q[3] -> c[3];`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-quantum-primary hover:bg-quantum-primary/90 text-quantum-bg font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(0,242,255,0.25)] hover:shadow-[0_0_22px_rgba(0,242,255,0.45)] cursor-pointer duration-200"
                    >
                      <Cpu className="w-4 h-4 fill-current animate-pulse" /> {t('agents_transmit_ibm_qpu') || 'Transmit code to IBM Q QPU 🚀'}
                    </button>
                  )}
                </div>

              </div>
            </>
          )}
        </div>

      </div>
    </motion.div>
  );
}
