import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  User, 
  Bot, 
  RotateCcw,
  Code2,
  FileCode,
  Copy,
  Check,
  BrainCircuit,
  UploadCloud,
  FileJson,
  BarChart4,
  Terminal,
  Info,
  ChevronRight,
  AlertCircle,
  Download,
  Landmark,
  Shield,
  Truck,
  Radio,
  Factory,
  Zap
} from 'lucide-react';
import { useTranslation } from '../lib/TranslationContext';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { generateQuantumBiLocalResponse } from '../engines/quantumBiEngine';

interface Props {
  onSwitchToCross?: () => void;
  sectorId?: string;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  type?: 'code' | 'json' | 'normal';
}

const SYSTEM_PROMPT = `You are the Specialized Quantum Business Intelligence Engine focused exclusively on Banking, Asset Portfolios, and Financial Risk Analytics.

CRITICAL APPLICATION CONTEXT (UI & CHAT LIFECYCLE):
You operate entirely inside a SINGLE, PRE-EXISTING WEB PAGE of the application. This page contains an active chat interface where you ask the user specific questions, and the user provides answers or asks for clarifications. 
- You must drive this chat conversation step-by-step.
- Once the user has no more questions, and you have collected all necessary inputs (no more questions to ask), the application will dynamically transition.
- Upon this lifecycle completion, the UI will display TWO COLUMNS containing the two requested code outputs ([START_PYTHON] and [START_COMPOSER]) directly below or alongside a full row summarizing the entire text history of the questions and answers exchanged between the user and you.
Act as a strict, clean backend pipeline component during code emission. Do not output any conversational text or prose outside of the specific tags during code generation.

MANDATORY CONVERSATIONAL RULES (IN ENGLISH):
1. ALWAYS RESPOND IN ENGLISH. Conduct the interview by asking ONE SINGLE QUESTION AT A TIME. Never overload the user with multiple questions simultaneously. Be extremely concise and brief in every single answer.
2. Be polite, precise, direct, and data-oriented.
3. When the user enters percentages or rates in chat, accept the input and sanitize it internally into pure decimal format with a dot (e.g. 0.05 for 5%).
4. NEVER show internal quantum technical parameters (such as Qubits or QUBO Multipliers) to the user during the interview, except when explicitly requested for resource configuration.
5. SINGLE SOURCE OF TRUTH: Use EXCLUSIVELY column names and data detected in the user's CSV. Do not invent asset names, tickers, or dates not present in the file.

---

PHASE 0: CSV FILE PREREQUISITES AND INITIAL ANALYSIS
At the beginning of the interview, when you receive headers and data sample:
- Identify date column and Asset columns (columns with numeric asset values).
- Report identified asset list to user for confirmation.
- Propose mapping and move to Step 1.

---

DECISION TREE STRUCTURE

STEP 1: RESEARCH OBJECTIVE
Be extremely concise. Ask the user to select the objective by typing 'A' or 'B':
* **[A] Risk Analysis** (Quantum Value at Risk / qVaR & Quantum Amplitude Estimation)
* **[B] Portfolio Optimization** (Portfolio Optimization with QAOA)
Explicitly write: "Type A or B to answer."

---

[BRANCH A]: PURE RISK ANALYSIS (Quantum Amplitude Estimation & qVaR)
Follow this order asking ONE QUESTION AT A TIME:
1. TIME HORIZON: Simulation in days (e.g., 30 days).
2. RESOURCE ALLOCATION (QUBITS) PER ASSET: List assets found and ask how many qubits to assign to each (e.g. 2 to 5).
3. METRIC CHOICE PER ASSET: Ask metric for each asset (e.g. 'Mean' or 'Standard Deviation').
4. RISK TOLERANCE (VaR): Ask max tolerance rate or VaR limit (e.g. 3%).
5. STATISTICAL CONFIDENCE: "95% (Standard)" or "99% (Extreme)".
6. STRESS TESTING: "Normal", "Geopolitical Shock", "Hyperinflation".

---

[BRANCH B]: PORTFOLIO OPTIMIZATION (Portfolio Optimization with QAOA)
Follow this order asking ONE QUESTION AT A TIME:
1. Maximum asset selection budget.
2. Risk/return preference factor (risk factor from 0 to 1).
3. Qubit allocation per asset.

---

FINAL OUTPUT (CODE EMISSION):
At the end of interview data collection, state that you will compile the physical configuration on the IBM Quantum Processor and emit codes enclosed inside these exact tags (with no prose outside tags):

[START_PYTHON]
# Python Qiskit 1.x code configured with user parameters
import numpy as np
# ...
[END_PYTHON]

[START_COMPOSER]
// OpenQASM 2.0 code circuit
OPENQASM 2.0;
include "qelib1.inc";
// ...
[END_COMPOSER]
`;

const SYSTEM_PROMPT_INSURANCE = `You are the Enterprise AI Assistant for Quantum Business Intelligence specialized in Insurance Risk and Claims. Your goal is to guide the user in an interactive decision-tree interview in English, analyzing columns of an uploaded CSV to gather parameters for a quantum-actuarial model.

MANDATORY CONVERSATIONAL RULES:
1. ALWAYS RESPOND IN ENGLISH. Ask ONE SINGLE QUESTION AT A TIME. Be extremely concise and brief.
2. Be polite, precise, and direct.
3. Sanitize inputs internally to decimal format (e.g. 0.05 for 5%).
4. Do not show internal quantum tech parameters unless asked.
5. EXCLUSIVELY use column names from the uploaded CSV.

If you detect commas or semicolons in numeric inputs, ask the user to use DOT (.) as decimal separator.

---

PHASE 0: INITIAL CSV ANALYSIS
When user uploads a valid CSV file, respond in English asking what they want to analyze with quantum computing.

---

CODE GENERATION RULES:
- No prose outside tags.
- Generate Python Qiskit 1.x and OpenQASM 2.0 inside [START_PYTHON]...[END_PYTHON] and [START_COMPOSER]...[END_COMPOSER].
- Include English comments in code.
`;

export default function QuantumBI({ onSwitchToCross, sectorId = 'finance' }: Props) {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number>(0);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  // Final Results
  const [jsonConfig, setJsonConfig] = useState<string>('');
  const [pythonCode, setPythonCode] = useState<string>('');
  const [qasmCode, setQasmCode] = useState<string>('');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'json' | 'python' | 'qasm'>('json');

  // Sector and structural parsing states
  const [detectedSector, setDetectedSector] = useState<string>('Finanza / Commodity / Mercati');
  const [sectorBrief, setSectorBrief] = useState<string>('Finanza');
  const [numCols, setNumCols] = useState<number>(3);
  const [firstEntityName, setFirstEntityName] = useState<string>('Asset_1');
  const [allEntities, setAllEntities] = useState<string[]>([]);

  // Rotating bank icon and sector labels
  const [sectorRotationIndex, setSectorRotationIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSectorRotationIndex(prev => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const cyclingSectorKeys = [
    'finance',
    'insurance',
    'logistics',
    'telecom',
    'manufacturing',
    'energy'
  ] as const;
  const currentSectorKey = cyclingSectorKeys[sectorRotationIndex % cyclingSectorKeys.length];
  const currentCyclingSector = t(`qbi_sec_${currentSectorKey}`);

  const getSubtextForSector = (sectorKey: string) => {
    return t(`qbi_sub_${sectorKey}` as any) || t('qbi_sub_default');
  };

  const getIconForSector = (sectorKey: string) => {
    switch (sectorKey) {
      case 'finance':
        return <Landmark className="w-8 h-8 text-quantum-primary" />;
      case 'insurance':
        return <Shield className="w-8 h-8 text-quantum-primary" />;
      case 'logistics':
        return <Truck className="w-8 h-8 text-quantum-primary" />;
      case 'telecom':
        return <Radio className="w-8 h-8 text-quantum-primary" />;
      case 'manufacturing':
        return <Factory className="w-8 h-8 text-quantum-primary" />;
      case 'energy':
        return <Zap className="w-8 h-8 text-quantum-primary" />;
      default:
        return <BrainCircuit className="w-8 h-8 text-quantum-primary" />;
    }
  };

  const getDynamicSystemPrompt = () => {
    const assetListBrief = allEntities.length > 0 ? allEntities.slice(0, 3).join(', ') : 'Oro, Platino, Petrolio';
    return `You are the Specialized Quantum Business Intelligence Engine and an Expert in Quantum Financial Data Engineering & Portfolio Management with Qiskit 1.x.

AUTOMATIC SECTOR CALIBRATION AND DATA METADATA:
- Calibrated Sector: "${detectedSector}" (Brief: "${sectorBrief}")
- Number of Columns in CSV: ${numCols}
- First Entity Name: "${firstEntityName}"
- All Entities Detected (from Colonna 0): ${allEntities.length > 0 ? JSON.stringify(allEntities) : '["Tech Giant A", "Global Index Fund", "Green Energy Bond"]'}

CRITICAL INSTRUCTIONS FOR CHAT CONVERSATION LIFE-CYCLE:
- YOU MUST ALWAYS RESPOND AND CONDUCT THE INTERVIEW ENTIRELY IN ENGLISH.
- POST ONE SINGLE CONCISE QUESTION AT A TIME. DO NOT send multiple questions at once.
- Use the exact terminology of the detected sector "${detectedSector}" as mapped below.

CONVERSATIONAL INTERVIEW FLOW (ENGLISH) - RESPECT THIS ORDER FOR QUESTIONS:
1. **QUESTION 1 (Historical Phases/Dimensions)**:
   - "I detected your financial assets, which will ALL be analyzed in parallel (${assetListBrief}). For each of them there are ${numCols} historical columns available. QUESTION 1: How many of these ${numCols} sequential historical columns (starting from the left) do you want to include in the current quantum simulation? Choose a number from 1 to ${numCols}."
   - Never isolate a single asset. The question must apply collectively to all entities in parallel.

2. **QUESTION 2 (Simplified Calculation Resolution)**:
   - "What level of quantum resolution and accuracy do you want for the data analysis? Type [A] for Standard (Fast calculation) or [B] for High Precision (In-depth calculation)."

3. **QUESTION 3 (Adaptive Percentage Threshold)**:
   - If Finance/Banking/Insurance (sectorBrief="Finance"): "What is the maximum risk tolerance (Value at Risk - VaR limit or default rate) in percentage? (Recommended: 1% - 5%)"
   - If Logistics/Infrastructure/Telecom (sectorBrief="Logistics" or "Telecom"): "What is the capacity threshold or critical saturation limit to trigger the alert? (Recommended: 70% - 85%)"
   - In other cases: "What is the critical threshold as a percentage of your desired limit? (Recommended: 10% - 20%)"

4. **QUESTION 4 (Adaptive Stress Scenario)**:
   - If Finance/Banking/Insurance: "Choose the scenario: [Normal], [Geopolitical Shock], [Hyperinflation]."
   - If Logistics/Supply Chain: "Choose the scenario: [Normal], [Customs Hold / Strike], [Seasonal Peak / Black Friday]."
   - If Telecom/IT: "Choose the scenario: [Normal], [Peak Saturation], [Channel Failure / Fiber Cut]."
   - Other cases: "Choose the stress scenario: [Normal], [Seasonal Peak], [Supply Disruption]."

CODE GENERATION RULES (CRITICAL - DO NOT FAIL UNDER ANY CIRCUMSTANCES):
Once all 4 questions have been answered, announce that you are compiling the configuration and output the codes inside EXACT tags:

[START_JSON]
{
  "objective": "Risk Analysis",
  "sector": "${detectedSector}",
  "confidence_level": 0.95,
  "stress_test_scenario": "..."
}
[END_JSON]

[START_PYTHON]
# Code MUST be fully written in Qiskit 1.x with these rules:
# 1. Standard local simulation MUST use:
#    from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
#    from qiskit.primitives import StatevectorSampler
# 2. Allocate variables register of N size (N = sum of precision qubits for the variables) and a comparator qubit at index N:
#    qr = QuantumRegister(N + 1, 'q')
#    cr = ClassicalRegister(1, 'c')
#    qc = QuantumCircuit(qr, cr)
# 3. Calculate historical mapping rotational angles with:
#    theta = 2 * np.arcsin(np.sqrt(np.clip(P, 0, 1)))
#    Print mappings to console: "[Entità] -> [Colonna] -> Angolo calcolato: [X] rad"
# 4. Critical threshold angle calculation must use arcoseno:
#    threshold_angle = 2 * np.arcsin(np.sqrt(np.clip(soglia, 0, 1)))
# 5. Apply wave shift via controlled RY rotations (cry) from each of the N asset/variable qubits (qr[i]) to the comparator target qubit (qr[N]) using fractioned weight:
#    for i in range(N):
#        qc.cry(threshold_angle / N, qr[i], qr[N])
# 6. Measure EXCLUSIVELY the final target qubit (index N) into the 1-bit classical register (cr[0]):
#    qc.measure(qr[N], cr[0])
# 7. Standard local simulation MUST use StatevectorSampler stable Qiskit 1.x V2 syntax to retrieve job result counts:
#    sampler = StatevectorSampler()
#    job = sampler.run([qc], shots=1000)
#    pub_result = job.result()[0]
#    counts = pub_result.data.c.get_counts()
#    voci_attive = counts.get('1', 0)
#    probabilita_superamento = (voci_attive / 1000) * 100
# 8. NEVER use np.arccos or older dict result formats. Always prevent domain errors with np.clip(..., 0, 1).
# 9. DO NOT write hardcoded static OpenQASM text. Generate OpenQASM 2.0 dynamically in Python utilizing:
#    from qiskit.qasm2 import dumps as qasm2_dumps
#    stringa_qasm = qasm2_dumps(qc)
#    print(stringa_qasm)
# 10. Avoid any other text outside [START_...] tags on code emission.
[END_PYTHON]

[START_COMPOSER]
// Dynamic OpenQASM 2.0 representation reflecting the correct circuit configuration with N variable qubits and 1 comparator qubit.
[END_COMPOSER]
`;
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const parsedParams = React.useMemo(() => {
    let assets = allEntities.length > 0 
      ? allEntities
      : (sectorId === 'insurance'
          ? ['Premi_Medi_Rca', 'Costo_Sinistri_Cat', 'Soglia_Frode_Alert']
          : ['Tech Giant A', 'Global Index Fund', 'Green Energy Bond']);

    let goal: 'A' | 'B' = 'A'; // Defaults to branch A (Risk) since it's the requested starting point
    let selectedColsCount = numCols;
    let qubitPrecision = 3;
    let criticalThreshold = 0.04;
    let stressScenario = 'Normale';

    const qubitsMap: Record<string, number> = {};
    const metricsMap: Record<string, string> = {};
    const varToleranceMap: Record<string, number> = {};

    // Initialize defaults per asset
    assets.forEach((asset) => {
      qubitsMap[asset] = 3;
      metricsMap[asset] = 'Media';
      varToleranceMap[asset] = 0.04;
    });

    // Clean messages: exclude system/API error messages from index scanning
    const cleanMessages = messages.filter(msg => {
      if (msg.role === 'user') return true;
      const t = msg.text;
      if (t.includes('[ERRORE') || t.includes('[ERRORE AI]') || t.includes('Si è verificato un errore') || t.includes('La risposta dell\'IA non è valida') || t.includes('Token non rilevato')) {
        return false;
      }
      return true;
    });

    cleanMessages.forEach((msg, index) => {
      if (msg.role === 'user') {
        const text = msg.text.trim();
        const upperText = text.toUpperCase();
        const userTurnIndex = cleanMessages.slice(0, index + 1).filter(m => m.role === 'user').length;

        let prevBotMsg: any = null;
        for (let j = index - 1; j >= 0; j--) {
          if (cleanMessages[j].role === 'bot') {
            prevBotMsg = cleanMessages[j];
            break;
          }
        }

        const prevBotText = (prevBotMsg?.text || '').toUpperCase();

        // Question 1: Historical columns (multilingual + positional fallback)
        if (userTurnIndex === 1 || prevBotText.includes('COLONNE') || prevBotText.includes('COLUMNS') || prevBotText.includes('HISTORICAL') || prevBotText.includes('SPALTEN') || prevBotText.includes('COLONNES') || prevBotText.includes('列') || prevBotText.includes('STORICO') || prevBotText.includes('DOMANDA 1') || prevBotText.includes('QUESTION 1')) {
          const num = parseInt(text.replace(/[^\d]/g, ''), 10);
          if (num > 0 && num <= 20) {
            selectedColsCount = num;
          }
        }

        // Question 2: Resolution A vs B
        if (userTurnIndex === 2 || prevBotText.includes('RISOLUZIONE') || prevBotText.includes('RESOLUTION') || prevBotText.includes('AUFLÖSUNG') || prevBotText.includes('RÉSOLUTION') || prevBotText.includes('解像度') || prevBotText.includes('精度') || prevBotText.includes('QUESTION 2') || prevBotText.includes('DOMANDA 2')) {
          if (upperText.includes('B') || upperText.includes('ALTA') || upperText.includes('HIGH') || upperText.includes('PRECISION') || upperText.includes('HOCH') || upperText.includes('HAUTE') || upperText.includes('高精') || upperText.includes('5')) {
            qubitPrecision = 5;
          } else {
            qubitPrecision = 3;
          }
        }

        // Question 3: Critical threshold
        if (userTurnIndex === 3 || prevBotText.includes('SOGLIA') || prevBotText.includes('THRESHOLD') || prevBotText.includes('SCHWELLENWERT') || prevBotText.includes('SEUIL') || prevBotText.includes('阈值') || prevBotText.includes('しきい値') || prevBotText.includes('VAR')) {
          const percentMatch = text.match(/([0-9]+(?:[.,][0-9]+)?)\s*%/);
          let val = 0.04;
          if (percentMatch) {
            val = parseFloat(percentMatch[1].replace(',', '.')) / 100;
          } else {
            const numVal = parseFloat(text.replace(',', '.').replace(/[^\d.]/g, ''));
            if (!isNaN(numVal)) {
              if (numVal >= 0 && numVal <= 1) {
                val = numVal;
              } else if (numVal > 1 && numVal <= 100) {
                val = numVal / 100;
              }
            }
          }
          criticalThreshold = val;
          assets.forEach(a => { varToleranceMap[a] = val; });
        }

        // Question 4: Stress Scenario
        if (userTurnIndex >= 4 || prevBotText.includes('SCENARIO') || prevBotText.includes('SZENARIO') || prevBotText.includes('SCÉNARIO') || prevBotText.includes('STRESS') || prevBotText.includes('情景') || prevBotText.includes('シナリオ')) {
          if (upperText.includes('2') || upperText.includes('GEOPOLITIC') || upperText.includes('SHOCK') || upperText.includes('SCHOCK') || upperText.includes('CHOC') || upperText.includes('PICCO') || upperText.includes('地缘') || upperText.includes('地政')) {
            stressScenario = 'Shock Geopolitico';
          } else if (upperText.includes('3') || upperText.includes('INFLAZ') || upperText.includes('HYPER') || upperText.includes('BOTTLENECK') || upperText.includes('SUPPLY') || upperText.includes('GUASTO') || upperText.includes('ENGPASS') || upperText.includes('GOULOT') || upperText.includes('通胀') || upperText.includes('ボトルネック')) {
            stressScenario = 'Iperinflazione';
          } else if (upperText.includes('BLACK FRIDAY') || upperText.includes('STAGIONALE')) {
            stressScenario = 'Picco Stagionale / Black Friday';
          } else if (upperText.includes('DOGANALE') || upperText.includes('SCIOPERO')) {
            stressScenario = 'Blocco Doganale / Sciopero';
          } else if (upperText.includes('SATURAZIONE')) {
            stressScenario = 'Saturazione di Picco';
          } else if (upperText.includes('CANALE') || upperText.includes('FIBRA')) {
            stressScenario = 'Guasto di Canale / Interruzione Fibra';
          } else {
            stressScenario = 'Normale';
          }
        }
      }
    });

    return {
      goal,
      assets,
      selectedColsCount,
      qubitPrecision,
      criticalThreshold,
      stressScenario,
      qubitsMap,
      metricsMap,
      varToleranceMap
    };
  }, [messages, csvHeaders, allEntities, numCols, sectorId]);

  const dynamicCodes = React.useMemo(() => {
    const p = parsedParams;

    // 1. Compute JSON String Configurations
    const json = JSON.stringify({
      objective: "Quantum Prediction Analysis",
      sector: detectedSector,
      selected_historical_columns: p.selectedColsCount,
      qubits_resolution: p.qubitPrecision,
      critical_threshold: p.criticalThreshold,
      stress_scenario: p.stressScenario,
      entities_count: p.assets.length
    }, null, 2);

    // 2. Pure dynamic Qiskit 1.x script reflecting all constraints
    const python = `# =====================================================================
# WORKSPACE CODICE PYTHON (QISKIT 1.x) - PURE QUANTUM ENGINE MOTOR
# SECTOR: ${detectedSector}
# =====================================================================
import pandas as pd
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.primitives import StatevectorSampler
from qiskit.qasm2 import dumps as qasm2_dumps

# 1. READ DATASET (CSV o Excel .xlsx/.xls)
DATASET_FILE = "${(currentFile?.name || 'dataset.csv').replace(/["\\]/g, '')}"
try:
    if DATASET_FILE.lower().endswith(('.xlsx', '.xls')):
        df = pd.read_excel(DATASET_FILE)
    else:
        df = pd.read_csv(DATASET_FILE)
        if df.shape[1] == 1:
            df = pd.read_csv(DATASET_FILE, sep=';')
except Exception:
    # Fallback robusto con dati allineati per il settore ${detectedSector}
    entities_fallback = ${JSON.stringify(p.assets)}
    data = {
        'Principale': entities_fallback,
        'Fase_1': [82.5, 45.2, 12.3] * (len(entities_fallback) // 3 + 1),
        'Fase_2': [88.1, 48.9, 14.5] * (len(entities_fallback) // 3 + 1),
        'Fase_3': [78.4, 42.1, 11.0] * (len(entities_fallback) // 3 + 1),
    }
    # taglia alle dimensioni reali delle entità
    for k in data.keys():
        data[k] = data[k][:len(entities_fallback)]
    df = pd.DataFrame(data)

# SCANSIONE SEMANTICA FLESSIBILE SULL'INTERO DATASET
date_cols = []
numeric_cols = []
entity_cols = []

for col in df.columns:
    col_lower = str(col).lower()
    looks_like_date = False
    for val in df[col].dropna().head(5):
        val_str = str(val).strip()
        if '-' in val_str or '/' in val_str:
            if any(char.isdigit() for char in val_str):
                looks_like_date = True
                break
    
    if 'date' in col_lower or 'data' in col_lower or 'time' in col_lower or 'giorno' in col_lower or 'index' in col_lower or 'id' in col_lower or looks_like_date:
        date_cols.append(col)
    else:
        try:
            non_na = df[col].dropna()
            numeric_count = pd.to_numeric(non_na.astype(str).str.replace(r'[\\s$%€]', '', regex=True), errors='coerce').notna().sum()
            ratio = numeric_count / len(non_na) if len(non_na) > 0 else 0
            if ratio >= 0.6:
                numeric_cols.append(col)
            else:
                entity_cols.append(col)
        except Exception:
            entity_cols.append(col)

if entity_cols:
    entita_rilevate = []
    for ecol in entity_cols:
        entita_rilevate.extend(df[ecol].dropna().astype(str).tolist())
    entita_rilevate = list(dict.fromkeys(entita_rilevate))
else:
    entita_rilevate = [str(c) for c in numeric_cols]

colonne_numeriche = [c for c in numeric_cols]

print(f"[SISTEMA: Rilevato settore '${detectedSector}' dal contenuto delle righe]")
print(f"Entità identificate: {entita_rilevate}")
print(f"Colonne temporali/storiche disponibili per l'analisi: {colonne_numeriche}")

# Applica moltiplicatore di volatilità/stress in base allo scenario
stress_scenario = "${p.stressScenario}"
multiplier = 1.0
if stress_scenario in ["Shock Geopolitico", "Picco Stagionale / Black Friday", "Saturazione di Picco"]:
    multiplier = 1.5
elif stress_scenario in ["Iperinflazione", "Blocco Fornitura", "Guasto di Canale"]:
    multiplier = 2.0

print(f"Scenario caricato: {stress_scenario} -> Moltiplicatore Stress: {multiplier}")

# 2. ARCHITECTURE & NORMALIZATION
num_entita = len(entita_rilevate)
num_colonne_selezionate = min(len(colonne_numeriche), ${p.selectedColsCount})
colonne_per_analisi = colonne_numeriche[:num_colonne_selezionate]

sub_df = df[colonne_per_analisi] if colonne_per_analisi else df
if colonne_per_analisi:
    cleaned_series = pd.Series(sub_df.values.flatten()).astype(str).str.replace(r'[\\s$%€£¥]', '', regex=True).str.replace(',', '.', regex=False)
    valori_numerici = pd.to_numeric(cleaned_series, errors='coerce').to_numpy()
else:
    valori_numerici = np.array([100.0])
cifra_massima = np.nanmax(valori_numerici) if len(valori_numerici) > 0 and not np.isnan(np.nanmax(valori_numerici)) else 100.0
if cifra_massima <= 0:
    cifra_massima = 1.0

# 3. TRASFORMAZIONE E LOG DEI RADIANTI (Formula con arcoseno e clip preventivo)
angoli_mappatura = {}
print("\\n--- [LOG DI MAPPATURA QUANTISTICA IN RADIANTI] ---")
for entita in entita_rilevate:
    angoli_mappatura[entita] = {}
    for col in colonne_per_analisi:
        cifra_specifica = 0.0
        if entity_cols:
            row_match = df[df[entity_cols[0]].astype(str) == entita]
            if not row_match.empty:
                val = row_match[col].iloc[0]
                try:
                    raw_clean = str(val).replace('%', '').replace('€', '').replace('$', '').replace('£', '').replace(' ', '')
                    if ',' in raw_clean and '.' in raw_clean:
                        raw_clean = raw_clean.replace('.', '').replace(',', '.') if raw_clean.index('.') < raw_clean.index(',') else raw_clean.replace(',', '')
                    elif ',' in raw_clean:
                        raw_clean = raw_clean.replace(',', '.')
                    cifra_specifica = float(raw_clean)
                except Exception:
                    cifra_specifica = 0.0
        else:
            val = df[entita].mean() if entita in df.columns else 0.0
            try:
                cifra_specifica = float(val)
            except Exception:
                cifra_specifica = 0.0

        P = (cifra_specifica / max(1e-9, cifra_massima)) * multiplier
        P_clipped = np.clip(P, 0, 1)
        theta = 2 * np.arcsin(np.sqrt(P_clipped))
        angoli_mappatura[entita][col] = theta
        print(f"[{entita}] -> [{col}] -> Angolo calcolato: {theta:.6f} rad")
print("--------------------------------------------------\\n")

# 4. QUANTUM CIRCUIT SETUP (Qiskit 1.x Quantum Comparator Core, capped at 127 IBM qubits)
qubits_per_col = ${p.qubitPrecision}
# N: Somma dei qubit di precisione scelti per le variabili analizzate (max 126 data + 1 comparator = 127)
N = min(126, len(entita_rilevate) * len(colonne_per_analisi) * qubits_per_col)

if N == 0:
    N = 3 # Safe minimal boundary

# Alloca un qubit aggiuntivo alla fine del registro (Indice N) come Comparatore Quantistico
qr = QuantumRegister(N + 1, 'q')
cr = ClassicalRegister(1, 'c')
qc = QuantumCircuit(qr, cr)

# Inizializza i qubit d'asset tramite rotazioni RY/RZ
qubit_idx = 0
for entita in entita_rilevate:
    for col in colonne_per_analisi:
        theta = angoli_mappatura[entita][col]
        for q_p in range(qubits_per_col):
            if qubit_idx < N:
                qc.ry(theta, qr[qubit_idx])
                qc.rz(theta / 2.0, qr[qubit_idx])
                qubit_idx += 1

# 5. ABILITAZIONE SOGLIA CRITICA E PORTE CRY SFASATE DI COMPARATORE (Sfasamento d'onda)
soglia_utente = ${p.criticalThreshold}
soglia_clipped = np.clip(soglia_utente, 0, 1)
threshold_angle = 2 * np.arcsin(np.sqrt(soglia_clipped))

print(f"Soglia Critica / Tolleranza impostata: {soglia_utente * 100:.2f}% (Angolo: {threshold_angle:.6f} rad)")

# Applica lo sfasamento d'onda tramite porte 'cry' controllate da ciascun d'asset verso l'unico qubit target (Indice N)
for i in range(N):
    qc.cry(threshold_angle / N, qr[i], qr[N])

# 6. MISURAZIONE ESCLUSIVA TARGET (Indice N nel registro classico a 1 solo bit)
qc.measure(qr[N], cr[0])

# 7. EXECUTION (Sintassi universale standard Qiskit 1.x / V2 - StatevectorSampler)
sampler = StatevectorSampler()
job = sampler.run([qc], shots=1000)
pub_result = job.result()[0]
counts = pub_result.data.c.get_counts()
voci_attive = counts.get('1', 0)
probabilita_superamento = (voci_attive / 1000) * 100

print("\\n┌────────────────────────────────────────────────────────┐")
print("│            RISULTATO COMPILATORE QUANTISTICO BI        │")
print("└────────────────────────────────────────────────────────┘")
print(f"Scenario Analizzato:       {stress_scenario}")
print(f"Istanze Totali Analizzate: {num_entita}")
print(f"Saturazione Superata (Jobs): {voci_attive} su 1000 shot ({voci_attive / 10:.2f}%)")
print("──────────────────────────────────────────────────────────")

# 8. OPENQASM EXPORT DINAMICO (dumps di qiskit.qasm2)
try:
    stringa_qasm = qasm2_dumps(qc)
    print("\\n[START_COMPOSER] OPENQASM DINAMICO COMPILATO:")
    print(stringa_qasm)
except Exception as e:
    print("Errore dumps OpenQASM:", e)
`;

    const dynamic_N = Math.min(126, Math.max(3, p.assets.length * p.selectedColsCount * p.qubitPrecision));
    const safeThresh = Math.min(1, Math.max(0, p.criticalThreshold));
    const threshTheta = 2 * Math.asin(Math.sqrt(safeThresh));
    const cryAngle = (threshTheta / dynamic_N).toFixed(6);
    let qasmRyGates = '';
    let qasmCryGates = '';
    for (let i = 0; i < dynamic_N; i++) {
      const assetLabel = p.assets[i % Math.max(1, p.assets.length)] || `Asset_${i + 1}`;
      qasmRyGates += `ry(${threshTheta.toFixed(6)}) q[${i}]; // amplitude mapping for ${assetLabel}\n`;
      qasmCryGates += `cry(${cryAngle}) q[${i}], q[${dynamic_N}];\n`;
    }
    const qasm = `// =====================================================================
// CIRCUITO OPENQASM IBM ENGINE - SECTOR: ${detectedSector}
// =====================================================================
OPENQASM 2.0;
include "qelib1.inc";

// Alloca registro q di dimensioni N + 1 (${dynamic_N} variabili d'asset + 1 Comparatore, max 127 qubit)
qreg q[${dynamic_N + 1}];
creg c[1]; // Registro classico per la misurazione di 1 solo bit

// Soglia critica: ${(safeThresh * 100).toFixed(2)}% | Angolo d'onda: ${threshTheta.toFixed(6)} rad
// 1. Inizializzazione degli asset sui qubit principali
${qasmRyGates.trim()}

// 2. Porte controllate CRY verso l'unico qubit target (Indice ${dynamic_N})
${qasmCryGates.trim()}

// 3. Misurazione esclusiva del Qubit target finale nel registro classico c[0]
measure q[${dynamic_N}] -> c[0];
`;

    return { json, python, qasm };
  }, [parsedParams, detectedSector, currentFile]);

  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].id === 'start')) {
      setMessages([{ id: 'start', role: 'bot', text: t('qbi_greeting') }]);
    }
  }, [messages.length, sectorId, language]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (retryCountdown > 0) {
      timer = setInterval(() => {
        setRetryCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [retryCountdown]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (role: 'user' | 'bot', text: string) => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text }]);
  };

  const handleSend = async (overrideText?: string) => {
    const messageText = overrideText || input.trim();
    if (!messageText || isProcessing) return;

    // Persist exact last user prompt regardless of source, so retrying can't loop errors
    setLastUserMessage(messageText);
    setInput('');
    
    // Clear previous error on new attempt
    setErrorStatus(null);
    
    // Only add to UI if it's not a retry of the exact same message that's already visible
    const isRetry = messages.length > 0 && messages[messages.length - 1].role === 'user' && messages[messages.length - 1].text === messageText;
    
    if (!isRetry) {
      addMessage('user', messageText);
    }
    
    setIsProcessing(true);

    try {
      // Filter out system, error, and rate-limiting messages from history to prevent polluting context
      const cleanedHistory = messages.filter(m => {
        const text = m.text.trim();
        return !text.startsWith('[ERRORE') && !text.includes('Quota esaurita') && !text.includes('Riprova tra');
      });

      // In case of retry, we don't want to double count the last message in history
      const historyToPass = isRetry ? cleanedHistory : [...cleanedHistory, { role: 'user', text: messageText }];
      
      const activePrompt = getDynamicSystemPrompt();
      const response = await axios.post('/api/quantum-bi/chat', {
        messages: historyToPass,
        systemPrompt: activePrompt,
        language
      });

      // Check if the response contains HTML startup page
      if (typeof response.data === 'string' && (response.data.includes('<!doctype html>') || response.data.includes('Starting Server...'))) {
        throw new Error("SERVER_STARTING");
      }

      const botText = response.data?.text;
      
      if (!botText || typeof botText !== 'string' || botText.trim() === "") {
        console.error("Invalid AI Response payload:", response.data);
        throw new Error(t('qbi_ai_error_fallback'));
      }

      addMessage('bot', botText);

      // Extract JSON, Python, and QASM if available (Safely and robustly)
      try {
        const extractCode = (text: string, lang: string): string => {
          // Custom tag extraction first
          if (lang === 'python') {
            const pythonTagMatch = text.match(/\[START_PYTHON\]([\s\S]*?)\[END_PYTHON\]/i);
            if (pythonTagMatch) return pythonTagMatch[1].trim();
          }
          if (lang === 'qasm') {
            const composerTagMatch = text.match(/\[START_COMPOSER\]([\s\S]*?)\[END_COMPOSER\]/i);
            if (composerTagMatch) {
              const inside = composerTagMatch[1];
              const qasmMatch = inside.match(/```(?:qasm|openqasm)?[\s\S]*?\n([\s\S]*?)\n```/i);
              if (qasmMatch) return qasmMatch[1].trim();
              return inside.trim();
            }
          }
          if (lang === 'json') {
            const jsonTagMatch = text.match(/\[START_JSON\]([\s\S]*?)\[END_JSON\]/i) || text.match(/BLOCCO 1: CONFIGURAZIONE JSON\s*\n*```json([\s\S]*?)```/i);
            if (jsonTagMatch) return jsonTagMatch[1].trim();
          }

          // 1. Try a complete match with ending backticks
          const fullRegex = new RegExp('```' + lang + '[\\s\\S]*?\\n([\\s\\S]*?)\\n```', 'i');
          const fullMatch = text.match(fullRegex);
          if (fullMatch) return fullMatch[1].trim();

          // 2. Try partial match if truncated (lacks ending backticks)
          const partialRegex = new RegExp('```' + lang + '[\\s\\S]*?\\n([\\s\\S]*)', 'i');
          const partialMatch = text.match(partialRegex);
          if (partialMatch) {
            let part = partialMatch[1];
            const nextBlock = part.indexOf('```');
            if (nextBlock !== -1) {
              part = part.substring(0, nextBlock);
            }
            return part.trim();
          }
          return '';
        };

        const jsonExtracted = extractCode(botText, 'json');
        const pythonExtracted = extractCode(botText, 'python');
        const qasmExtracted = extractCode(botText, 'qasm');

        if (jsonExtracted) setJsonConfig(jsonExtracted);
        if (pythonExtracted) setPythonCode(pythonExtracted);
        if (qasmExtracted) setQasmCode(qasmExtracted);
      } catch (parseErr) {
        console.warn("Could not parse code blocks from AI response", parseErr);
      }

    } catch (error: any) {
      console.warn("AI Backend unavailable or key error, executing resilient local quantum intelligence engine:", error);
      
      try {
        const localFallback = generateQuantumBiLocalResponse(messageText, messages, {
          detectedSector,
          sectorBrief,
          allEntities,
          numCols,
          selectedColsCount: parsedParams.selectedColsCount,
          qubitPrecision: parsedParams.qubitPrecision,
          criticalThreshold: parsedParams.criticalThreshold,
          stressScenario: parsedParams.stressScenario
        }, language);

        addMessage('bot', localFallback.text);

        if (localFallback.jsonCode) setJsonConfig(localFallback.jsonCode);
        if (localFallback.pythonCode) setPythonCode(localFallback.pythonCode);
        if (localFallback.qasmCode) setQasmCode(localFallback.qasmCode);
        setErrorStatus(null);
      } catch (fallbackErr) {
        console.error("Local engine error:", fallbackErr);
        addMessage('bot', t('qbi_err_generic'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const LIMITE_PESO_MB = 5;
    const LIMITE_PESO_BYTES = LIMITE_PESO_MB * 1024 * 1024;

    const outputMessaggio = document.getElementById("messaggio-sistema");
    if (outputMessaggio) {
      outputMessaggio.innerHTML = "";
    }

    const isExcelFile = /\.(xlsx|xls)$/i.test(file.name);
    const isCsvFile = /\.csv$/i.test(file.name) || file.type === "text/csv";
    if (!isExcelFile && !isCsvFile) {
      const errText = t('qbi_err_format');
      if (outputMessaggio) {
        outputMessaggio.innerHTML = `<span>${errText}</span>`;
      }
      addMessage('bot', errText);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > LIMITE_PESO_BYTES) {
      const errText = t('qbi_err_size');
      if (outputMessaggio) {
        outputMessaggio.innerHTML = `<span>${errText}</span>`;
      }
      addMessage('bot', errText);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const splitQuotedRow = (line: string, sep: string): string[] => {
      const out: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
          else inQuotes = !inQuotes;
        } else if (ch === sep && !inQuotes) {
          out.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += ch;
        }
      }
      out.push(cur.trim().replace(/^"|"$/g, ''));
      return out;
    };

    const parseNumericBiCell = (rawCell: string): number | null => {
      let s = rawCell.replace(/[\s$%€£¥]/g, '');
      if (!s) return null;
      if (s.includes(',') && s.includes('.')) {
        s = s.indexOf('.') < s.indexOf(',') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
      } else if (s.includes(',')) {
        s = s.replace(',', '.');
      }
      if (!/^[-+]?\d*\.?\d+$/.test(s)) return null;
      const n = parseFloat(s);
      return isFinite(n) ? n : null;
    };

    const reader = new FileReader();
    reader.onerror = () => {
      addMessage('bot', t('qbi_err_read'));
    };

    reader.onload = (event) => {
      try {
        let text = '';
        if (isExcelFile) {
          const buffer = event.target?.result as ArrayBuffer;
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          if (!firstSheet) throw new Error(t('qbi_err_empty'));
          text = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet]);
        } else {
          text = (event.target?.result as string) || '';
        }
        text = text.replace(/^\uFEFF/, '');
        if (!text.trim()) throw new Error(t('qbi_err_empty'));

        const allLines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        if (allLines.length > 0) {
          // Detect delimiter (comma, semicolon, or tab)
          const firstLine = allLines[0];
          const commaCount = (firstLine.match(/,/g) || []).length;
          const semiCount = (firstLine.match(/;/g) || []).length;
          const tabCount = (firstLine.match(/\t/g) || []).length;
          const delimiter = tabCount > commaCount && tabCount > semiCount ? '\t' : (semiCount > commaCount ? ';' : ',');

          const headers = splitQuotedRow(firstLine, delimiter);
          setCsvHeaders(headers);
          setCurrentFile(file);

          // 1. ISPEZIONE TOTAL-DATASET & CLASSIFICAZIONE SEMANTICA FLESSIBILE
          const numColumns = headers.length;
          const dateCols: string[] = [];
          const numericCols: string[] = [];
          const entityCols: string[] = [];

          // Scan cell values column-by-column across up to 50 rows
          for (let colIdx = 0; colIdx < numColumns; colIdx++) {
            const header = headers[colIdx];
            const lowerHeader = header.toLowerCase();

            const cells: string[] = [];
            for (let i = 1; i < Math.min(allLines.length, 50); i++) {
              const row = allLines[i].trim();
              if (row === "") continue;
              const cols = splitQuotedRow(row, delimiter);
              if (colIdx < cols.length) {
                cells.push(cols[colIdx]);
              }
            }

            const isDateHeader = lowerHeader.includes('date') || lowerHeader.includes('data') || lowerHeader.includes('tempo') || lowerHeader.includes('time') || lowerHeader.includes('timestamp') || lowerHeader.includes('giorno') || lowerHeader.includes('index') || lowerHeader === 'id';
            const looksLikeDate = cells.some(cell => {
              return /^\d{4}[-/]\d{2}[-/]\d{2}$/.test(cell) || /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(cell);
            });

            if (isDateHeader || looksLikeDate) {
              dateCols.push(header);
              continue;
            }

            let numericCount = 0;
            let nonNumericCount = 0;

            cells.forEach(cell => {
              if (cell === "") return;
              if (parseNumericBiCell(cell) !== null) {
                numericCount++;
              } else {
                nonNumericCount++;
              }
            });

            const totalCells = numericCount + nonNumericCount;
            const numericRatio = totalCells > 0 ? numericCount / totalCells : 0;

            if (numericRatio >= 0.6) {
              numericCols.push(header);
            } else {
              entityCols.push(header);
            }
          }

          // Distinct descriptive entities
          let parsedEntities: string[] = [];
          if (entityCols.length > 0) {
            entityCols.forEach(colName => {
              const colIdx = headers.indexOf(colName);
              if (colIdx !== -1) {
                for (let i = 1; i < allLines.length; i++) {
                  const row = allLines[i].trim();
                  if (row === "") continue;
                  const cols = splitQuotedRow(row, delimiter);
                  if (colIdx < cols.length) {
                    const val = cols[colIdx];
                    if (val !== "") {
                      parsedEntities.push(val);
                    }
                  }
                }
              }
            });
          }

          // Support CSV files that are organized with entities as column headers
          if (parsedEntities.length === 0) {
            parsedEntities = [...numericCols];
          }

          const uniqueEntities = Array.from(new Set(parsedEntities)).filter(x => x !== "");
          setAllEntities(uniqueEntities);

          const fallbackEntity = uniqueEntities.length > 0 ? uniqueEntities[0] : "Asset_1";
          setFirstEntityName(fallbackEntity);

          // Num of quantitative variables
          const numNumericColumns = entityCols.length > 0 ? numericCols.length : Math.max(1, headers.length - dateCols.length);
          setNumCols(numNumericColumns);

          // Automatic Sector Classification (Search inside all words of file)
          const sampleText = text.toLowerCase();
          let sectorStr = "Finance / Commodities / Markets";
          let sectorBriefStr = "Finance";

          const hasFin = sampleText.includes("gold") || sampleText.includes("platinum") || sampleText.includes("oil") || sampleText.includes("bitcoin") || sampleText.includes("eni") || sampleText.includes("aapl") || sampleText.includes("bank") || sampleText.includes("risk") || sampleText.includes("var") || sampleText.includes("return") || sampleText.includes("asset");
          const hasRet = sampleText.includes("shirt") || sampleText.includes("pants") || sampleText.includes("shoes") || sampleText.includes("jacket") || sampleText.includes("t-shirt") || sampleText.includes("dress") || sampleText.includes("jeans") || sampleText.includes("retail") || sampleText.includes("clothing") || sampleText.includes("inventory") || sampleText.includes("stock") || sampleText.includes("sales");
          const hasTel = sampleText.includes("router") || sampleText.includes("antenna") || sampleText.includes("ip") || sampleText.includes("switch") || sampleText.includes("fiber") || sampleText.includes("bandwidth") || sampleText.includes("ping") || sampleText.includes("network") || sampleText.includes("telecom");
          const hasLog = sampleText.includes("hub") || sampleText.includes("truck") || sampleText.includes("shipping") || sampleText.includes("container") || sampleText.includes("fleet") || sampleText.includes("logistics") || sampleText.includes("delivery") || sampleText.includes("carrier");

          if (hasFin) {
            sectorStr = t('qbi_loc_fin_sec');
            sectorBriefStr = t('qbi_sec_finance');
          } else if (hasRet) {
            sectorStr = t('qbi_loc_ret_sec');
            sectorBriefStr = "Retail";
          } else if (hasTel) {
            sectorStr = t('qbi_loc_tel_sec');
            sectorBriefStr = t('qbi_sec_telecom');
          } else if (hasLog) {
            sectorStr = t('qbi_loc_log_sec');
            sectorBriefStr = t('qbi_sec_logistics');
          } else {
            sectorStr = t('qbi_loc_uni_sec');
            sectorBriefStr = "Universal";
          }

          setDetectedSector(sectorStr);
          setSectorBrief(sectorBriefStr);

          const dataSample = allLines.slice(1, 4).join('\n');
          const noneLabel = t('qbi_none');

          const fileInfoMsg = `[${t('qbi_scan_header')}]

• ${t('qbi_scan_sector')}: **${sectorStr}**
• ${t('qbi_scan_col_map')}:
  - *${t('qbi_scan_date_cols')}*: ${dateCols.length > 0 ? dateCols.join(', ') : noneLabel}
  - *${t('qbi_scan_entity_cols')}*: ${entityCols.length > 0 ? entityCols.join(', ') : t('qbi_scan_entity_fallback')}
  - *${t('qbi_scan_num_cols')}*: ${numericCols.length > 0 ? numericCols.join(', ') : noneLabel}
• ${t('qbi_scan_items')}: ${uniqueEntities.slice(0, 8).join(', ')}${uniqueEntities.length > 8 ? '...' : ''} (${t('qbi_scan_total')}: ${uniqueEntities.length})

${t('qbi_scan_sample', { n: 3 })}:
${dataSample}

---

**${t('qbi_scan_done', { rows: allLines.length - 1 })}**
${t('qbi_scan_proceeding')}

**${t('qbi_q1_label')}:** ${t('qbi_q1_prompt')}`;

          // Clear file input so it can be re-uploaded if needed
          if (fileInputRef.current) fileInputRef.current.value = '';

          handleSend(fileInfoMsg);
        } else {
          addMessage('bot', t('qbi_err_empty'));
        }
      } catch (err) {
        console.error("CSV Parse error:", err);
        addMessage('bot', t('qbi_err_parse'));
      }
    };
    if (isExcelFile) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const resetAll = () => {
    setMessages([]);
    setJsonConfig('');
    setPythonCode('');
    setQasmCode('');
    setCsvHeaders([]);
    setCurrentFile(null);
    // Remove reload to stay in the component
  };

  const isInterviewComplete = !!(jsonConfig || pythonCode || qasmCode);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-700 max-w-7xl mx-auto pb-12 px-4 sm:px-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-black/60 p-6 rounded-3xl border border-white/10 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <motion.div 
            animate={{ rotate: sectorRotationIndex * 360 }}
            transition={{ type: "spring", stiffness: 60, damping: 12 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-quantum-primary/10 rounded-2xl border border-quantum-primary/20 flex items-center justify-center shadow-lg shadow-quantum-primary/5 shrink-0 cursor-pointer"
            onClick={() => setSectorRotationIndex(prev => prev + 1)}
            title={t('qbi_cycle_tooltip')}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSectorKey}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                {getIconForSector(currentSectorKey)}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tighter flex items-center gap-x-2">
              <span className="relative inline-block min-w-[130px] sm:min-w-[170px] h-[32px] overflow-hidden align-middle">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={currentSectorKey}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center"
                  >
                    {currentCyclingSector}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="text-quantum-primary font-normal">
                {currentSectorKey === 'insurance' ? t('qbi_risk_engine') : t('qbi_advisor')}
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-gray-500 font-mono text-[9px] uppercase tracking-widest min-h-[14px] flex items-center">
                {getSubtextForSector(currentSectorKey)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            className="p-2 bg-red-500/20 rounded-lg border border-red-500/50 animate-pulse group relative"
            title={t('qbi_guide_tooltip')}
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div className="absolute hidden group-hover:block top-full right-0 mt-2 w-64 p-3 bg-black/90 border border-red-500/30 rounded-xl z-50 text-[10px] text-gray-300 normal-case">
              {t('qbi_guide_hover')}
            </div>
          </button>
          <button 
            onClick={resetAll}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/5 transition-all flex items-center gap-2 text-[10px] font-bold uppercase"
          >
            <RotateCcw className="w-4 h-4" /> {t('qbi_reset')}
          </button>
        </div>
      </div>

      {/* Copia Registro Intervista Completa - Compact single line banner */}
      {messages.length > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-2xl text-[10px] sm:text-xs font-mono text-gray-400 transition-all select-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-quantum-primary animate-pulse" />
            <span className="uppercase text-white font-bold tracking-wider">{t('qbi_dialog_log')}</span>
            <span className="opacity-60">| {messages.filter(m => m.id !== 'start').length} {t('qbi_qas_count')}</span>
          </div>
          <button
            onClick={() => {
              const textContent = messages
                .filter(m => {
                  const txt = m.text.trim();
                  return !txt.startsWith('[ERRORE') && !txt.includes('Quota esaurita') && !txt.includes('Riprova tra');
                })
                .map(m => `[${m.role === 'user' ? t('qbi_user_tag') : t('qbi_assistant_tag')}]\n${m.text}`)
                .join('\n\n');
              copyToClipboard(textContent, 'interview');
            }}
            className="flex items-center gap-2 px-3 py-1 bg-quantum-primary/10 hover:bg-quantum-primary/20 text-quantum-primary border border-quantum-primary/30 rounded-xl transition-all font-bold uppercase text-[9px] tracking-wide cursor-pointer"
            title={t('qbi_copy_dialog_title')}
          >
            {copiedType === 'interview' ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                {t('qbi_copied_interview')}
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                {t('qbi_copy_dialog')}
              </>
            )}
          </button>
        </div>
      )}

      {isInterviewComplete ? (
        <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">
          
          {/* RIGA INTERA: SINTESI E TRASCRITTO COMPLETO DELL'INTERVISTA */}
          <div className="bg-black/60 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 backdrop-blur-3xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-4 gap-2">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-quantum-primary animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-widest">{t('qbi_history_title')}</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>{t('qbi_success_badge')}</span>
              </div>
            </div>
            
            {/* Scrollable conversation log inside the row */}
            <div className="max-h-[250px] overflow-y-auto pr-2 space-y-3 scrollbar-hide">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-4 p-4 rounded-2xl text-[12px] leading-relaxed border ${
                    m.role === 'user'
                      ? 'bg-quantum-secondary/5 border-quantum-secondary/20 text-quantum-secondary ml-12'
                      : 'bg-white/[0.02] border-white/10 text-gray-300 mr-12'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg h-fit shrink-0 ${m.role === 'user' ? 'bg-quantum-secondary/10' : 'bg-quantum-primary/10'}`}>
                    {m.role === 'user' ? <User className="w-3.5 h-3.5 text-quantum-secondary" /> : <Bot className="w-3.5 h-3.5 text-quantum-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-[9px] text-gray-500 uppercase mb-1">{m.role === 'user' ? t('qbi_user_role') : t('qbi_assistant_role')}</p>
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TWO COLUMNS CONTAINER */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* INVASO 1: CODICE PYTHON / QISKIT */}
            <div className="flex flex-col bg-black shadow-2xl rounded-3xl overflow-hidden border border-quantum-primary/30 min-h-[500px] max-h-[700px]">
              <div className="border-b border-white/10 bg-white/5 flex items-center justify-between p-4 px-6">
                <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-quantum-primary" />
                  {t('qbi_python_header')}
                </span>
                <button
                  onClick={() => copyToClipboard(pythonCode || dynamicCodes.python, 'python')}
                  className="p-2 bg-black/60 hover:bg-white/10 rounded-xl text-gray-400 hover:text-quantum-primary transition-all border border-white/10 flex items-center gap-2 text-[10px] font-mono"
                  title={t('qbi_copy_python_title')}
                >
                  {copiedType === 'python' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      {t('qbi_copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      {t('qbi_copy')}
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 flex-1 overflow-auto bg-black/40 font-mono text-[11px] leading-relaxed text-quantum-primary/90 scrollbar-hide">
                <pre className="whitespace-pre">
                  <code>{pythonCode || dynamicCodes.python}</code>
                </pre>
              </div>
            </div>

            {/* INVASO 2: CIRCUITO OPENQASM / COMPOSER */}
            <div className="flex flex-col bg-black shadow-2xl rounded-3xl overflow-hidden border border-amber-500/30 min-h-[500px] max-h-[700px]">
              <div className="border-b border-white/10 bg-white/5 flex items-center justify-between p-4 px-6">
                <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-500" />
                  {t('qbi_qasm_header')}
                </span>
                <button
                  onClick={() => copyToClipboard(qasmCode || dynamicCodes.qasm, 'qasm')}
                  className="p-2 bg-black/60 hover:bg-white/10 rounded-xl text-gray-400 hover:text-amber-500 transition-all border border-white/10 flex items-center gap-2 text-[10px] font-mono"
                  title={t('qbi_copy_qasm_title')}
                >
                  {copiedType === 'qasm' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      {t('qbi_copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      {t('qbi_copy')}
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 flex-1 overflow-auto bg-black/40 font-mono text-[11px] leading-relaxed text-amber-500/90 scrollbar-hide">
                <pre className="whitespace-pre">
                  <code>{qasmCode || dynamicCodes.qasm}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full animate-in fade-in duration-500">
          {/* CHAT INTERVIEW AREA */}
          <div className="h-[650px] flex flex-col bg-black/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-quantum-primary" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('qbi_interview_title')}</span>
              </div>
              {currentFile && (
                <div className="flex items-center gap-2 px-3 py-1 bg-quantum-primary/10 rounded-full border border-quantum-primary/20 animate-in zoom-in-95 duration-250">
                  <BarChart4 className="w-3 h-3 text-quantum-primary" />
                  <span className="text-[9px] text-quantum-primary font-mono uppercase truncate max-w-[120px]">{currentFile.name}</span>
                  <button
                    onClick={() => {
                      const url = URL.createObjectURL(currentFile);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = currentFile.name;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="p-1 hover:bg-white/10 rounded text-quantum-primary hover:text-white transition-all ml-1 border border-white/5 bg-black/40"
                    title={t('qbi_download_csv_title')}
                  >
                    <Download className="w-3 h-3 animate-pulse" />
                  </button>
                </div>
              )}
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide min-h-0"
            >
              <AnimatePresence>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-4 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`p-2.5 rounded-xl h-fit shrink-0 ${m.role === 'user' ? 'bg-quantum-secondary/20' : 'bg-quantum-primary/20'}`}>
                        {m.role === 'user' ? <User className="w-4 h-4 text-quantum-secondary" /> : <Bot className="w-4 h-4 text-quantum-primary" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-[12px] leading-relaxed relative ${
                        m.role === 'user' 
                          ? 'bg-quantum-secondary/10 border border-quantum-secondary/30 text-quantum-secondary' 
                          : 'bg-white/5 border border-white/10 text-gray-300'
                      }`}>
                        <p className="whitespace-pre-line">{m.text}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isProcessing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="flex gap-4">
                      <div className="p-2.5 rounded-xl bg-quantum-primary/20 h-fit">
                        <Bot className="w-4 h-4 text-quantum-primary animate-pulse" />
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-3">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-quantum-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-quantum-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-quantum-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono italic">{t('qbi_ai_processing')}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                {errorStatus && !isProcessing && messages.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className={`flex ${messages[messages.length-1].role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        onClick={() => {
                          const safeMessage = lastUserMessage || messages.filter(m => m.role === 'user').pop()?.text;
                          if (safeMessage) {
                            handleSend(safeMessage);
                          }
                        }}
                        disabled={retryCountdown > 0 || isProcessing}
                        className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 text-[10px] font-bold uppercase ${
                          retryCountdown > 0 
                            ? 'bg-gray-500/20 border-gray-500/30 text-gray-500 cursor-not-allowed' 
                            : 'bg-quantum-primary/20 hover:bg-quantum-primary text-quantum-primary hover:text-black border-quantum-primary/50'
                        }`}
                      >
                        <RotateCcw className={`w-3 h-3 ${retryCountdown > 0 ? '' : 'animate-spin-slow'}`} /> 
                        {retryCountdown > 0 ? t('qbi_wait_s', { s: retryCountdown }) : t('qbi_retry_now')}
                      </button>
                      {errorStatus === 429 && retryCountdown > 0 && (
                        <span className="text-[9px] text-gray-500 font-mono italic animate-pulse shadow-sm">
                          {t('qbi_syncing')}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 bg-black/40 border-t border-white/10 space-y-4 shrink-0">
              {/* MESSAGGIO SISTEMA - Front-end standard feedback output banner */}
              <div id="messaggio-sistema" className="font-mono text-center text-[10px] tracking-wider transition-all duration-300"></div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-400 transition-all hover:text-quantum-primary group"
                  title={t('qbi_upload_csv_title')}
                >
                  <UploadCloud className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
                </button>
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={currentFile ? t('qbi_reply_placeholder') : t('qbi_begin_placeholder')}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-quantum-primary/50 transition-all"
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isProcessing}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-quantum-primary text-black rounded-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-30"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
