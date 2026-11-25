import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Cpu, 
  Key, 
  Play, 
  Terminal as TerminalIcon, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Copy, 
  Check, 
  Zap,
  HelpCircle,
  Clock,
  ExternalLink,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Download,
  Eye,
  EyeOff,
  Share2,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Layers
} from 'lucide-react';
import { useTranslation } from '../lib/TranslationContext';

interface Props {
  onBack: () => void;
  initialCode?: string;
}

export default function IBMQuantumInterface({ onBack, initialCode }: Props) {
  const { t } = useTranslation();
  const [circuitCode, setCircuitCode] = useState<string>(initialCode || `// Quantum Circuit Example (OpenQASM 2.0)
OPENQASM 2.0;
include "qelib1.inc";

qreg q[3];
creg c[3];

h q[0];
cx q[0], q[1];
cx q[1], q[2];

measure q -> c;`);

  const [apiToken, setApiToken] = useState<string>('');
  const [showApiToken, setShowApiToken] = useState<boolean>(false);
  const [tokenMissingError, setTokenMissingError] = useState<boolean>(false);
  const apiTokenInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string; type: 'info' | 'success' | 'warn' | 'error' | 'system' }>>([]);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [finalResults, setFinalResults] = useState<Record<string, number> | null>(null);
  const [pollingActive, setPollingActive] = useState<boolean>(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // --- REAL IBM QUANTUM RUNTIME STATES ---
  const [selectedBackend, setSelectedBackend] = useState<string>('auto');
  const [availableBackends, setAvailableBackends] = useState<Array<{
    name: string;
    isSimulator: boolean;
    status: string;
    isOnline: boolean;
    queueLength: number;
    qubits: number;
  }>>([]);
  const [isCheckingBackends, setIsCheckingBackends] = useState<boolean>(false);
  const [optionalCrn, setOptionalCrn] = useState<string>('');
  const [showAdvancedCrn, setShowAdvancedCrn] = useState<boolean>(false);
  const [activeBackendName, setActiveBackendName] = useState<string | null>(null);
  const [isRealHardware, setIsRealHardware] = useState<boolean | null>(null);
  const [isaQasmPreview, setIsaQasmPreview] = useState<string | null>(null);
  const [showIsaPreview, setShowIsaPreview] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [shotsCount, setShotsCount] = useState<number>(1024);
  const [validationState, setValidationState] = useState<{
    valid: boolean;
    qasmVersion?: string;
    numQubits?: number;
    gateCount?: number;
    warnings?: string[];
    error?: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [savedJobs, setSavedJobs] = useState<Array<{
    jobId: string;
    backend: string;
    isSimulator: boolean;
    crn: string;
    shots: number;
    numBits: number;
    status: string;
    errorReason?: string | null;
    counts?: Record<string, number> | null;
    totalShots?: number | null;
    createdAt: string;
    isaQasm?: string | null;
  }>>([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);

  const activeCrnRef = useRef<string>('');
  const activeApiKeyRef = useRef<string>('');
  const activeNumBitsRef = useRef<number>(3);
  const isPollingInFlightRef = useRef<boolean>(false);
  const lastLoggedStateRef = useRef<string>('');

  // --- PQC QUANTUM ENCRYPTION STATES ---
  const [usePqc, setUsePqc] = useState<boolean>(true);
  
  // Sent payload (Trasmissione Criptata)
  const [pqcTxData, setPqcTxData] = useState<{
    encryptedPayload: string;
    encapsulatedKey: string;
    unlockKey: string;
    algorithm: string;
  } | null>(null);

  // Received payload (Ricezione Criptata)
  const [pqcRxData, setPqcRxData] = useState<{
    encryptedPayload: string;
    encapsulatedKey: string;
    unlockKey: string;
    algorithm: string;
  } | null>(null);

  const [pqcDecryptedResults, setPqcDecryptedResults] = useState<any | null>(null);
  const [isDeciphering, setIsDeciphering] = useState<boolean>(false);
  const [showTxDetails, setShowTxDetails] = useState<boolean>(false);
  const [customUnlockKey, setCustomUnlockKey] = useState<string>('');

  useEffect(() => {
    if (initialCode) {
      setCircuitCode(initialCode);
      setValidationState(null);
    }
  }, [initialCode]);

  const fetchSavedJobs = async () => {
    try {
      const resp = await fetch('/api/ibm-quantum/jobs?limit=20');
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data.jobs)) {
          setSavedJobs(data.jobs);
        }
      }
    } catch {
      // Ignore network hiccup during history load
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    // Scroll to bottom of terminal when logs update
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' | 'system' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // Helper: Retrieve real corporate asset names and metadata for Qubits
  const getQubitLabels = (): Array<{ name: string; isAncilla?: boolean }> => {
    // 1. Try reading clean records from localStorage
    try {
      const raw = localStorage.getItem('quantum_latest_cleaned_records');
      if (raw) {
        const records = JSON.parse(raw);
        if (Array.isArray(records) && records.length > 0) {
          const labels: Array<{ name: string; isAncilla?: boolean }> = records.map((r: any) => ({
            name: r.article || r.name || 'Asset'
          }));
          // Check if ancilla comparator qubit exists in circuit (OpenQASM 2.0 or 3.0)
          if (circuitCode.includes(`qreg q[${records.length + 1}]`) || circuitCode.includes(`qubit[${records.length + 1}] q`)) {
            labels.push({ name: t('ibm_threshold_comparator'), isAncilla: true });
          }
          return labels;
        }
      }
    } catch {}

    // 2. Fallback: Parse from QASM 2.0 or OpenQASM 3.0 comments in circuitCode
    const parsedLabels: Array<{ name: string; isAncilla?: boolean }> = [];
    const lines = circuitCode.split('\n');
    for (const line of lines) {
      const match =
        line.match(/(?:mapping for|coordinate mapping for|wave mapping for|amplitude mapping for)\s+([A-Za-z0-9_\-\.]+)/i) ||
        line.match(/^\s*ry\([^)]+\)\s+q\[\d+\];\s*\/\/\s*([A-Za-z0-9_\-\.]+)/i);
      if (match && match[1]) {
        if (!parsedLabels.some(l => l.name === match[1])) {
          parsedLabels.push({ name: match[1] });
        }
      }
    }

    if (parsedLabels.length > 0) {
      if (
        circuitCode.includes(`qreg q[${parsedLabels.length + 1}]`) ||
        circuitCode.includes(`qubit[${parsedLabels.length + 1}] q`) ||
        circuitCode.includes('Ancilla') ||
        circuitCode.includes('comparator')
      ) {
        parsedLabels.push({ name: t('ibm_threshold_comparator'), isAncilla: true });
      }
      return parsedLabels;
    }

    // 3. Fallback to generic Qubit names (supports qreg q[N] and qubit[N] q)
    const qregMatch = circuitCode.match(/qreg\s+q\[(\d+)\]/) || circuitCode.match(/qubit\[(\d+)\]\s+q/);
    const numQubits = qregMatch ? parseInt(qregMatch[1], 10) : 3;
    for (let i = 0; i < numQubits; i++) {
      if (i === numQubits - 1 && circuitCode.includes('cry(')) {
        parsedLabels.push({ name: t('ibm_threshold_comparator'), isAncilla: true });
      } else {
        parsedLabels.push({ name: `Asset_${i + 1}` });
      }
    }
    return parsedLabels;
  };

  // Helper: Translate a measured bitstring like "010" into real asset names and operational states
  const translateBitstring = (state: string, labels: Array<{ name: string; isAncilla?: boolean }>): string => {
    // In OpenQASM/Qiskit, the bitstring is printed as c[N-1]...c[1]c[0] (rightmost is qubit 0)
    const bits = state.split('').reverse();
    const parts: string[] = [];

    bits.forEach((bit, idx) => {
      const labelObj = labels[idx] || { name: `Qubit ${idx}` };
      if (labelObj.isAncilla) {
        parts.push(`${labelObj.name}: ${bit === '1' ? t('ibm_bit_alarm') : t('ibm_bit_in_threshold')}`);
      } else {
        parts.push(`${labelObj.name}: ${bit === '1' ? t('ibm_bit_saturated') : t('ibm_bit_ok')}`);
      }
    });

    return parts.join(' | ');
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Pre-load various templates
  const loadTemplate = (type: 'qasm' | 'json' | 'bell' | 'qrng') => {
    if (type === 'qrng') {
      setCircuitCode(`// True Quantum Random Number Generator (QRNG) Circuit
// Superconducting Qubit Hadamard Superposition Collapse
OPENQASM 2.0;
include "qelib1.inc";

qreg q[5];
creg c[5];

// Apply Hadamard gate to create maximal superposition |+> = (|0>+|1>)/sqrt(2)
h q[0];
h q[1];
h q[2];
h q[3];
h q[4];

// Measure true non-deterministic quantum collapse entropy
measure q -> c;`);
      addLog(t('ibm_log_qrng'), "info");
    } else if (type === 'bell') {
      setCircuitCode(`// Bell State Circuit (Max entanglement)
OPENQASM 2.0;
include "qelib1.inc";

qreg q[2];
creg c[2];

h q[0];
cx q[0],q[1];

measure q -> c;`);
      addLog(t('ibm_log_bell'), "info");
    } else if (type === 'qasm') {
      setCircuitCode(`// Quantum Fourier Transform (QFT) 3 Qubits
OPENQASM 2.0;
include "qelib1.inc";

qreg q[3];
creg c[3];

h q[2];
cu1(pi/2) q[1],q[2];
h q[1];
cu1(pi/4) q[0],q[2];
cu1(pi/2) q[0],q[1];
h q[0];

measure q -> c;`);
      addLog(t('ibm_log_qft'), "info");
    } else if (type === 'json') {
      setCircuitCode(`{
  "circuit": "portfolio_optimization",
  "num_qubits": 3,
  "shots": 1024,
  "parameters": {
    "risk_factor": 0.5,
    "budget": 2,
    "expected_returns": [0.005, 0.002, 0.001]
  }
}`);
      addLog(t('ibm_log_json'), "info");
    }
  };

  // Decipher the PQC encrypted response received from IBM
  const handleDecipherRx = async () => {
    if (!pqcRxData) return;

    setIsDeciphering(true);
    addLog(t('ibm_log_decipher_start'), 'system');

    try {
      const keyToUse = customUnlockKey.trim() || pqcRxData.unlockKey;
      
      const res = await fetch('/api/pqc/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encryptedPayload: pqcRxData.encryptedPayload,
          encapsulatedKey: pqcRxData.encapsulatedKey,
          unlockKey: keyToUse
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || t('ibm_log_decipher_err'));
      }

      const data = await res.json();
      const parsedContent = JSON.parse(data.decryptedContent);
      
      setPqcDecryptedResults(parsedContent);
      setFinalResults(parsedContent.measurementCounts);
      
      addLog(t('ibm_log_decipher_ok'), "success");
      addLog(`${t('ibm_log_decipher_verified')} ${parsedContent.jobId}`, "success");
    } catch (err: any) {
      console.error("Decipher failed:", err);
      addLog(`${t('ibm_log_decipher_err')}: ${err.message}`, "error");
    } finally {
      setIsDeciphering(false);
    }
  };

  const handleCheckBackends = async () => {
    const key = apiToken.trim();
    if (!key) {
      setTokenMissingError(true);
      apiTokenInputRef.current?.focus();
      addLog(t('ibm_log_err_token'), 'error');
      return;
    }

    setTokenMissingError(false);
    setSubmitError(null);
    setIsCheckingBackends(true);
    addLog('Connessione a IBM Cloud IAM & Resource Controller per elenco QPU...', 'system');

    try {
      const resp = await fetch('/api/ibm-quantum/backends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: key,
          crn: optionalCrn.trim() || undefined,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || 'Impossibile recuperare le QPU IBM Quantum.');
      }

      if (data.crn) {
        activeCrnRef.current = data.crn;
      }
      const list = Array.isArray(data.backends) ? data.backends : [];
      setAvailableBackends(list);

      const onlineQpus = list.filter((b: any) => b.isOnline && !b.isSimulator);
      addLog(
        `Istanza rilevata: ${data.instanceName || 'IBM Quantum'} — ${onlineQpus.length} QPU reali online (${list.length} backend totali).`,
        'success'
      );
    } catch (err: any) {
      const msg = err?.message || 'Errore durante la verifica QPU IBM.';
      setSubmitError(msg);
      addLog(msg, 'error');
    } finally {
      setIsCheckingBackends(false);
    }
  };

  const handleValidateCircuit = async (): Promise<boolean> => {
    setIsValidating(true);
    setSubmitError(null);
    try {
      const resp = await fetch('/api/ibm-quantum/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: circuitCode, shots: shotsCount }),
      });
      const data = await resp.json().catch(() => ({}));
      setValidationState(data);
      if (!resp.ok || !data.valid) {
        const err = data?.error || 'Sintassi OpenQASM non valida.';
        setSubmitError(err);
        addLog(`VALIDAZIONE QASM FALLITA: ${err}`, 'error');
        return false;
      }
      addLog(
        `Validazione QASM superata (${data.qasmVersion} · ${data.numQubits} qubit · ${data.gateCount} gate · ${shotsCount} shots).`,
        'success'
      );
      return true;
    } catch (err: any) {
      addLog(`Errore verifica sintassi: ${err?.message || 'rete'}`, 'error');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleOpenSavedJob = async (job: any) => {
    setSubmitError(null);
    setPollingActive(false);
    setPqcRxData(null);
    setPqcDecryptedResults(null);
    setJobId(job.jobId);
    setActiveBackendName(job.backend);
    setIsRealHardware(!job.isSimulator);
    setIsaQasmPreview(job.isaQasm || null);
    activeCrnRef.current = job.crn || '';
    activeNumBitsRef.current = Number(job.numBits || 3);

    if (job.status === 'COMPLETED' && job.counts) {
      setJobStatus('COMPLETED');
      setFinalResults(job.counts);
      setIsLoading(false);
      setShowHistoryDrawer(false);
      addLog(`Caricati risultati reali salvati per ${job.jobId} (${job.backend}).`, 'success');
      return;
    }

    const cleanKey = apiToken.trim() || activeApiKeyRef.current;
    if (!cleanKey) {
      setTokenMissingError(true);
      apiTokenInputRef.current?.focus();
      addLog(`Inserisci la tua API Key IBM per riprendere il polling del job ${job.jobId}.`, 'warn');
      return;
    }

    activeApiKeyRef.current = cleanKey;
    setFinalResults(null);
    setJobStatus(job.status || 'QUEUED');
    setIsLoading(true);
    lastLoggedStateRef.current = '';
    setShowHistoryDrawer(false);
    addLog(`Ripresa monitoraggio reale per job ${job.jobId} su ${job.backend}...`, 'system');
    setPollingActive(true);
  };

  const handleDeleteSavedJob = async (targetJobId: string) => {
    try {
      await fetch(`/api/ibm-quantum/jobs/${encodeURIComponent(targetJobId)}`, { method: 'DELETE' });
      setSavedJobs((prev) => prev.filter((j) => j.jobId !== targetJobId));
    } catch {
      // ignore
    }
  };

  const executeSend = async () => {
    if (!circuitCode.trim()) {
      addLog(t('ibm_log_err_empty'), "error");
      return;
    }
    const cleanKey = apiToken.trim();
    if (!cleanKey) {
      setTokenMissingError(true);
      apiTokenInputRef.current?.focus();
      addLog(t('ibm_log_err_token'), "error");
      return;
    }
    setTokenMissingError(false);
    setSubmitError(null);
    setPollingActive(false);
    isPollingInFlightRef.current = false;
    lastLoggedStateRef.current = '';

    setIsLoading(true);
    setFinalResults(null);
    setJobId(null);
    setJobStatus('VALIDATING');
    setActiveBackendName(null);
    setIsRealHardware(null);
    setIsaQasmPreview(null);
    setLogs([]);
    setPqcTxData(null);
    setPqcRxData(null);
    setPqcDecryptedResults(null);

    addLog(t('ibm_log_handshake'), 'system');
    addLog(t('ibm_log_analyzing'), 'info');
    addLog(t('ibm_log_len').replace('{len}', circuitCode.length.toString()), 'info');

    // Step 0: Pre-flight QASM Syntax Validation before contacting IBM servers
    const isSyntaxOk = await handleValidateCircuit();
    if (!isSyntaxOk) {
      setJobStatus('ERROR');
      setIsLoading(false);
      return;
    }
    setJobStatus('SUBMITTING');

    // Step 1: PQC Encryption local audit envelope if enabled
    if (usePqc) {
      addLog(t('ibm_log_pqc_start'), 'system');
      try {
        const encRes = await fetch('/api/pqc/encrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: circuitCode })
        });

        if (encRes.ok) {
          const encData = await encRes.json();
          setPqcTxData({
            encryptedPayload: encData.encryptedPayload,
            encapsulatedKey: encData.encapsulatedKey,
            unlockKey: encData.unlockKey,
            algorithm: encData.algorithm || "ML-KEM-768 (Kyber) + AES-256-GCM"
          });
          addLog(t('ibm_log_pqc_ok'), 'success');
          addLog(`${t('ibm_log_pqc_encap')} ${encData.encapsulatedKey.substring(0, 32)}...`, 'info');
        }
      } catch {
        addLog(t('ibm_log_pqc_warn'), 'warn');
      }
    }

    // Step 2: Real submission to IBM Quantum Cloud REST API via backend proxy
    try {
      addLog('Autenticazione IBM Cloud IAM, rilevamento CRN e transpiling ISA verso QPU IBM...', 'system');

      const serverResponse = await fetch('/api/ibm-quantum/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: circuitCode,
          apiKey: cleanKey,
          backend: selectedBackend,
          crn: optionalCrn.trim() || undefined,
          usePQC: usePqc,
          shots: shotsCount
        })
      });

      const serverData = await serverResponse.json().catch(() => ({}));

      if (!serverResponse.ok) {
        const errMsg = serverData?.error || `Errore IBM Quantum HTTP ${serverResponse.status}`;
        throw new Error(errMsg);
      }

      activeApiKeyRef.current = cleanKey;
      activeCrnRef.current = serverData.crn;
      activeNumBitsRef.current = Number(serverData.numBits || 3);

      if (Array.isArray(serverData.allBackends) && serverData.allBackends.length > 0) {
        setAvailableBackends(serverData.allBackends);
      }
      setActiveBackendName(serverData.backend);
      setIsRealHardware(Boolean(serverData.realHardware));
      setIsaQasmPreview(serverData.isaQasm || null);

      const initialStatusUpper = String(serverData.status || 'Queued').toUpperCase();
      const mappedInitial = initialStatusUpper.includes('RUN') ? 'RUNNING' : 'QUEUED';
      lastLoggedStateRef.current = mappedInitial;

      setJobId(serverData.jobId);
      setJobStatus(mappedInitial);

      addLog(`Istanza IBM Quantum: ${serverData.instanceName || 'Attiva'}`, 'info');
      addLog(
        `Backend selezionato: ${serverData.backend} (${serverData.realHardware ? 'QPU Hardware Reale' : 'Simulatore IBM'}, ${serverData.backendQubits} qubit, coda: ${serverData.queueLength})`,
        'success'
      );
      addLog(
        `Circuito transpilato su ISA nativa (${Array.isArray(serverData.basisGates) ? serverData.basisGates.join(', ') : 'rz, sx, cz'} — ${serverData.gateCount} gate fisici)`,
        'info'
      );
      addLog(`Job reale inviato a IBM Quantum! ID: ${serverData.jobId}`, 'success');
      addLog('Job salvato nel database locale. Monitoraggio coda su IBM Quantum attivo...', 'warn');

      fetchSavedJobs();
      setPollingActive(true);
    } catch (err: any) {
      const msg = err?.message || 'Errore durante l\'invio reale a IBM Quantum.';
      setSubmitError(msg);
      setJobStatus('ERROR');
      setIsLoading(false);
      setPollingActive(false);
      addLog(`INVIO FALLITO: ${msg}`, 'error');
    }
  };

  const pollOnceNow = async () => {
    if (!jobId || !activeCrnRef.current || !activeApiKeyRef.current || isPollingInFlightRef.current) {
      return;
    }
    isPollingInFlightRef.current = true;

    try {
      const resp = await fetch('/api/ibm-quantum/job-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: activeApiKeyRef.current,
          jobId,
          crn: activeCrnRef.current,
          numBits: activeNumBitsRef.current,
          usePQC: usePqc
        })
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        addLog(`Errore polling IBM: ${data?.error || `HTTP ${resp.status}`}`, 'warn');
        return;
      }

      if (data.status === 'QUEUED') {
        setJobStatus('QUEUED');
        if (lastLoggedStateRef.current !== 'QUEUED') {
          lastLoggedStateRef.current = 'QUEUED';
          addLog(`Job ${jobId} in coda su ${data.backend || activeBackendName || 'IBM QPU'}...`, 'warn');
        }
      } else if (data.status === 'RUNNING') {
        setJobStatus('RUNNING');
        if (lastLoggedStateRef.current !== 'RUNNING') {
          lastLoggedStateRef.current = 'RUNNING';
          addLog(`Esecuzione fisica in corso su ${data.backend || activeBackendName || 'IBM QPU'} (1024 shots)...`, 'system');
        }
      } else if (data.status === 'COMPLETED') {
        setJobStatus('COMPLETED');
        lastLoggedStateRef.current = 'COMPLETED';
        addLog(`Esecuzione reale completata su ${data.backend || activeBackendName || 'IBM QPU'} (${data.totalShots || 1024} shots raccolti)!`, 'success');

        if (data.pqcEnabled && data.encryptedResults) {
          setPqcRxData(data.encryptedResults);
          setCustomUnlockKey(data.encryptedResults.unlockKey);
          addLog(t('ibm_log_rx_dl'), 'system');
          addLog(t('ibm_log_rx_prot'), 'warn');
          addLog(t('ibm_log_rx_hint'), 'info');
        } else if (data.measurementCounts) {
          setFinalResults(data.measurementCounts);
          addLog('Istogramma reale IBM Quantum caricato.', 'success');
        }

        setPollingActive(false);
        setIsLoading(false);
        fetchSavedJobs();
      } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
        setJobStatus(data.status);
        lastLoggedStateRef.current = data.status;
        const failReason = data.reason || `Job terminato con stato ${data.status} su IBM Quantum.`;
        setSubmitError(failReason);
        addLog(`${data.status}: ${failReason}`, 'error');
        setPollingActive(false);
        setIsLoading(false);
        fetchSavedJobs();
      }
    } catch (err: any) {
      addLog(`Connessione temporanea di polling interrotta: ${err?.message || 'riprovo'}`, 'warn');
    } finally {
      isPollingInFlightRef.current = false;
    }
  };

  // Real IBM Quantum polling loop
  useEffect(() => {
    if (!pollingActive || !jobId) return;

    const initialTimer = setTimeout(() => {
      pollOnceNow();
    }, 1500);

    const interval = setInterval(() => {
      pollOnceNow();
    }, 4000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [pollingActive, jobId, usePqc]);

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-2 sm:pt-3 pb-14 sm:pb-16 relative text-white overflow-hidden">
      {/* Title block */}
      <nav className="shrink-0 flex items-center justify-between mb-2 border-b border-white/5 pb-2">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-quantum-primary transition-colors py-1 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-[10px] sm:text-xs tracking-widest uppercase">{t('ibm_back_home')}</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-quantum-primary/10 border border-quantum-primary/30 rounded-full">
          <Cpu className="w-3.5 h-3.5 text-quantum-primary animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-quantum-primary">{t('ibm_system_status_ready')}</span>
        </div>
      </nav>

      <div className="shrink-0 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-xl sm:text-3xl font-display font-black tracking-tight text-white uppercase mb-0.5">
            <span className="quantum-gradient-text">IBM Quantum</span> {t('ibm_title')}
          </h1>
          <p className="text-[11px] text-gray-400 font-mono tracking-wide max-w-3xl leading-snug">
            {t('ibm_subtitle')}
          </p>
        </div>

        {/* PQC Global Mode Toggle */}
        <div className="bg-black/60 border border-quantum-primary/30 px-3 py-2 rounded-2xl backdrop-blur-md flex items-center justify-between gap-4 shrink-0 shadow-[0_0_25px_rgba(0,242,255,0.1)]">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border transition-all ${usePqc ? 'bg-quantum-primary/20 border-quantum-primary text-quantum-primary shadow-[0_0_15px_rgba(0,242,255,0.3)]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black uppercase text-white tracking-wider">{t('ibm_pqc_encryption')}</span>
                <span className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase font-bold ${usePqc ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-400'}`}>
                  {usePqc ? t('ibm_nist_fips') : 'OFF'}
                </span>
              </div>
              <p className="text-[9px] font-mono text-gray-400">{t('ibm_ml_kem_aes')}</p>
            </div>
          </div>

          <button 
            onClick={() => setUsePqc(!usePqc)}
            className={`w-12 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${usePqc ? 'bg-quantum-primary' : 'bg-white/20'}`}
          >
            <motion.div 
              animate={{ x: usePqc ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`w-4 h-4 rounded-full ${usePqc ? 'bg-black' : 'bg-white'}`}
            />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch overflow-y-auto lg:overflow-hidden scrollbar-hide">
        {/* Left column: Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
          <div className={`shrink-0 quantum-card bg-black/40 backdrop-blur-md relative overflow-hidden group transition-all p-3.5 sm:p-4 ${
            tokenMissingError
              ? 'border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
              : 'border-white/10 hover:border-quantum-primary/30'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-white font-mono flex items-center gap-2">
                <Key className="w-4 h-4 text-quantum-primary" />
                {t('ibm_api_key_token')}
              </h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCheckBackends}
                  disabled={isCheckingBackends}
                  className="text-[9px] font-mono px-2 py-0.5 rounded bg-quantum-primary/10 hover:bg-quantum-primary/20 border border-quantum-primary/30 text-quantum-primary transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isCheckingBackends ? 'animate-spin' : ''}`} />
                  {isCheckingBackends ? 'Verifica...' : 'Verifica QPU'}
                </button>
                <a 
                  href="https://quantum.cloud.ibm.com/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[9px] font-mono text-gray-400 hover:text-quantum-primary transition-colors flex items-center gap-1"
                >
                  {t('ibm_get_token')} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
            
            <div className="relative">
              <input 
                ref={apiTokenInputRef}
                type={showApiToken ? "text" : "password"}
                value={apiToken}
                onChange={(e) => {
                  setApiToken(e.target.value);
                  if (e.target.value.trim()) setTokenMissingError(false);
                  if (submitError) setSubmitError(null);
                }}
                placeholder={t('ibm_paste_token_placeholder')}
                className={`w-full bg-quantum-bg border rounded-xl px-4 py-2.5 pr-11 text-xs text-quantum-primary font-mono placeholder-gray-600 focus:outline-none transition-all ${
                  tokenMissingError
                    ? 'border-amber-500 focus:border-amber-400'
                    : 'border-white/10 focus:border-quantum-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowApiToken(!showApiToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-quantum-primary p-1 transition-colors cursor-pointer"
                title={showApiToken ? t('ibm_hide_token') : t('ibm_show_token')}
              >
                {showApiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span className="text-[9px] font-mono uppercase text-gray-400 shrink-0">QPU:</span>
                <select
                  value={selectedBackend}
                  onChange={(e) => setSelectedBackend(e.target.value)}
                  className="bg-black/70 border border-white/15 rounded-lg px-2 py-1 text-[10px] font-mono text-quantum-primary focus:border-quantum-primary focus:outline-none max-w-[215px]"
                >
                  <option value="auto">Auto (QPU Reale meno occupata)</option>
                  {availableBackends.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} ({b.isSimulator ? 'Sim' : 'QPU'} · {b.qubits}q · coda {b.queueLength}{b.isOnline ? '' : ' · offline'})
                    </option>
                  ))}
                </select>

                <span className="text-[9px] font-mono uppercase text-gray-400 shrink-0 ml-1">Shots:</span>
                <select
                  value={shotsCount}
                  onChange={(e) => setShotsCount(Number(e.target.value))}
                  className="bg-black/70 border border-white/15 rounded-lg px-2 py-1 text-[10px] font-mono text-white focus:border-quantum-primary focus:outline-none"
                >
                  <option value={256}>256</option>
                  <option value={512}>512</option>
                  <option value={1024}>1024</option>
                  <option value={2048}>2048</option>
                  <option value={4096}>4096</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvancedCrn(!showAdvancedCrn)}
                className="text-[9px] font-mono text-gray-500 hover:text-gray-300 underline cursor-pointer"
              >
                {showAdvancedCrn ? 'Nascondi CRN' : 'CRN manuale (opzionale)'}
              </button>
            </div>

            {showAdvancedCrn && (
              <div className="mt-2">
                <input
                  type="text"
                  value={optionalCrn}
                  onChange={(e) => setOptionalCrn(e.target.value)}
                  placeholder="crn:v1:bluemix:public:quantum-computing:... (lascia vuoto per rilevamento automatico)"
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-gray-200 font-mono placeholder-gray-600 focus:border-quantum-primary focus:outline-none"
                />
              </div>
            )}

            {submitError && (
              <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-[10px] text-red-300 font-mono flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {tokenMissingError ? (
              <p className="text-[10px] text-amber-400 font-mono mt-2 leading-relaxed font-semibold">
                {t('ibm_token_missing_alert')}
              </p>
            ) : (
              <p className="text-[10px] text-gray-500 font-mono mt-2 leading-relaxed">
                {t('ibm_token_note')}
              </p>
            )}
          </div>

          <div className="quantum-card bg-black/40 backdrop-blur-md border-white/10 p-3.5 sm:p-4 flex flex-col flex-1 min-h-0">
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-white font-mono flex items-center gap-2">
                <TerminalIcon className="w-4 h-4 text-quantum-primary" />
                {t('ibm_quantum_code_title')}
              </h3>
              
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button 
                  onClick={() => loadTemplate('qrng')} 
                  className="px-2 py-1 bg-quantum-primary/10 hover:bg-quantum-primary/20 border border-quantum-primary/30 text-[9px] font-mono rounded text-quantum-primary transition-colors flex items-center gap-1"
                >
                  <Zap className="w-2.5 h-2.5" />
                  {t('ibm_qrng_btn')}
                </button>
                <button 
                  onClick={() => loadTemplate('bell')} 
                  className="px-2 py-1 bg-white/5 hover:bg-white/15 border border-white/10 text-[9px] font-mono rounded text-gray-300 hover:text-white transition-colors"
                >
                  {t('ibm_bell_state')}
                </button>
                <button 
                  onClick={() => loadTemplate('qasm')} 
                  className="px-2 py-1 bg-white/5 hover:bg-white/15 border border-white/10 text-[9px] font-mono rounded text-gray-300 hover:text-white transition-colors"
                >
                  {t('ibm_qft_3qubits')}
                </button>
                <button 
                  onClick={() => loadTemplate('json')} 
                  className="px-2 py-1 bg-white/5 hover:bg-white/15 border border-white/10 text-[9px] font-mono rounded text-gray-300 hover:text-white transition-colors"
                >
                  {t('ibm_json_opt')}
                </button>
              </div>
            </div>

            <textarea 
              value={circuitCode}
              onChange={(e) => {
                setCircuitCode(e.target.value);
                if (validationState) setValidationState(null);
              }}
              placeholder={t('ibm_code_placeholder')}
              className="flex-1 min-h-0 w-full bg-quantum-bg border border-white/10 rounded-xl p-3 text-xs font-mono text-white leading-relaxed focus:border-quantum-primary focus:outline-none focus:ring-1 focus:ring-quantum-primary/20 resize-none scrollbar-hide"
            />

            {validationState && (
              <div className={`shrink-0 mt-2 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono flex items-center justify-between gap-2 ${
                validationState.valid
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                <span className="truncate">
                  {validationState.valid
                    ? `QASM ${validationState.qasmVersion} valido · ${validationState.numQubits} qubit · ${validationState.gateCount} gate`
                    : `Errore QASM: ${validationState.error}`}
                </span>
                {validationState.valid && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
              </div>
            )}

            <div className="shrink-0 mt-3 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-gray-500 uppercase">
                  {t('ibm_tag_circuit')} {circuitCode.includes('OPENQASM 3') ? 'OPENQASM 3.0' : (circuitCode.includes('OPENQASM') ? 'OPENQASM 2.0' : 'JSON SCHEMA')}
                </span>
                {usePqc && (
                  <span className="text-[9px] font-mono text-quantum-primary bg-quantum-primary/10 border border-quantum-primary/20 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {t('ibm_pqc_transmission_active')}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleValidateCircuit}
                  disabled={isValidating || isLoading}
                  className="px-3 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isValidating ? 'Verifica...' : 'Valida QASM'}
                </button>

                <button 
                  onClick={executeSend}
                  disabled={isLoading}
                  className="btn-quantum bg-quantum-primary/10 flex items-center justify-center gap-2 px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase font-black text-xs tracking-widest text-quantum-primary hover:text-quantum-bg font-mono cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-quantum-primary group-hover:text-quantum-bg" />
                  ) : (
                    <Play className="w-4 h-4 text-quantum-primary group-hover:text-quantum-bg fill-current" />
                  )}
                  {usePqc ? t('ibm_send_encrypted_btn') : t('ibm_send_code_btn')}
                </button>
              </div>
            </div>
          </div>

          {/* PQC Sent Vault Details Drawer */}
          {pqcTxData && (
            <div className="shrink-0 quantum-card bg-gradient-to-br from-quantum-primary/10 to-black/80 border-quantum-primary/30 p-3.5 space-y-2.5 max-h-44 overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-quantum-primary" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white font-mono">
                    {t('ibm_pqc_details_title')}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowTxDetails(!showTxDetails)}
                  className="text-[10px] font-mono text-quantum-primary hover:underline flex items-center gap-1"
                >
                  {showTxDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showTxDetails ? t('ibm_hide_vault') : t('ibm_inspect_vault')}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-mono">
                <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                  <span className="text-gray-500 block uppercase">{t('ibm_encryption_algorithm')}</span>
                  <span className="text-quantum-primary font-bold">{pqcTxData.algorithm}</span>
                </div>
                <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                  <span className="text-gray-500 block uppercase">{t('ibm_encapsulated_key_hex')}</span>
                  <span className="text-white font-bold truncate block">{pqcTxData.encapsulatedKey.substring(0, 28)}...</span>
                </div>
              </div>

              {showTxDetails && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 font-mono text-[10px] pt-2 border-t border-white/10"
                >
                  <div>
                    <span className="text-gray-400 uppercase block mb-1">{t('ibm_encrypted_payload_vault')}</span>
                    <div className="bg-black/70 p-3 rounded-xl text-gray-300 break-all max-h-24 overflow-y-auto border border-white/5">
                      {pqcTxData.encryptedPayload}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 uppercase block mb-1">{t('ibm_unlock_private_key')}</span>
                    <div className="relative">
                      <div className="bg-black/70 p-3 rounded-xl text-quantum-secondary break-all border border-white/5 pr-10">
                        {pqcTxData.unlockKey}
                      </div>
                      <button 
                        onClick={() => copyToClipboard(pqcTxData.unlockKey, 'tx_sk')}
                        className="absolute right-2 top-2 p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                        title={t('ibm_copy_key')}
                      >
                        {copiedType === 'tx_sk' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Logs & Results */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
          {/* Logs terminal */}
          <div className="quantum-card bg-black/70 border-white/10 p-3.5 sm:p-4 flex flex-col h-[195px] sm:h-[215px] shrink-0 relative">
            <div className="shrink-0 flex items-center justify-between mb-2 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-mono text-gray-400 ml-2 uppercase">{t('ibm_transmission_terminal')}</span>
              </div>
              <span className="text-[9px] font-mono text-quantum-primary/80 uppercase">
                {jobStatus || 'IDLE'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 font-mono text-[10px] scrollbar-hide">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2 opacity-50">
                  <TerminalIcon className="w-10 h-10 text-gray-600" />
                  <p className="uppercase tracking-widest text-[9px]">{t('ibm_awaiting_submission')}</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-1 p-0.5 leading-normal">
                    <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
                    <span className={`
                      ${log.type === 'error' ? 'text-red-500 font-bold' : ''}
                      ${log.type === 'warn' ? 'text-amber-500' : ''}
                      ${log.type === 'success' ? 'text-green-400 font-medium' : ''}
                      ${log.type === 'system' ? 'text-purple-400 font-bold' : ''}
                      ${log.type === 'info' ? 'text-gray-300' : ''}
                    `}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Job Details & Calculated Quantum Registers */}
          <div className="quantum-card bg-black/40 border-white/10 p-3.5 sm:p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="shrink-0 flex items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-white font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-quantum-primary" />
                {t('ibm_register_status_results')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  fetchSavedJobs();
                  setShowHistoryDrawer(!showHistoryDrawer);
                }}
                className="text-[9px] font-mono px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-quantum-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3 h-3" />
                {showHistoryDrawer ? 'Chiudi Cronologia' : `Job Salvati (${savedJobs.length})`}
              </button>
            </div>

            {showHistoryDrawer && (
              <div className="shrink-0 mb-3 p-2.5 rounded-xl bg-black/70 border border-quantum-primary/25 space-y-2 max-h-48 overflow-y-auto scrollbar-hide font-mono">
                <div className="flex items-center justify-between text-[9px] text-gray-400 uppercase border-b border-white/10 pb-1">
                  <span>Database Job IBM Quantum (SQLite)</span>
                  <button
                    type="button"
                    onClick={fetchSavedJobs}
                    className="text-quantum-primary hover:underline cursor-pointer"
                  >
                    Aggiorna lista
                  </button>
                </div>
                {savedJobs.length === 0 ? (
                  <p className="text-[10px] text-gray-500 py-2 text-center">Nessun job inviato finora.</p>
                ) : (
                  savedJobs.map((j) => (
                    <div
                      key={j.jobId}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[9px]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-quantum-primary font-bold truncate">{j.jobId}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              j.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : j.status === 'FAILED' || j.status === 'CANCELLED'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {j.status}
                          </span>
                        </div>
                        <p className="text-gray-400 truncate mt-0.5">
                          {j.backend} · {j.shots} shots · {new Date(j.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenSavedJob(j)}
                          className="px-2 py-1 rounded bg-quantum-primary/15 hover:bg-quantum-primary/30 text-quantum-primary font-bold cursor-pointer"
                        >
                          {j.status === 'COMPLETED' && j.counts ? 'Apri' : 'Riprendi'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedJob(j.jobId)}
                          className="px-1.5 py-1 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 cursor-pointer"
                          title="Elimina dalla cronologia"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-3 text-[10px] bg-white/5 p-3 rounded-lg border border-white/5">
                <div>
                  <p className="text-gray-500 uppercase">{t('ibm_generated_job_id')}</p>
                  <p className="text-quantum-primary font-bold overflow-hidden text-ellipsis whitespace-nowrap mt-0.5" title={jobId || 'N/A'}>
                    {jobId || 'N/A'}
                  </p>
                  {activeBackendName && (
                    <p className="text-[9px] text-emerald-400 mt-0.5 truncate">
                      {activeBackendName} ({isRealHardware ? 'QPU Reale' : 'Simulatore IBM'})
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-gray-500 uppercase">{t('ibm_calculation_queue')}</p>
                    {pollingActive && (
                      <button
                        type="button"
                        onClick={pollOnceNow}
                        className="text-[8px] text-quantum-primary hover:underline cursor-pointer"
                      >
                        Aggiorna
                      </button>
                    )}
                  </div>
                  <p className="text-white mt-0.5 font-bold">
                    {jobStatus === 'QUEUED' ? t('ibm_queue_pos') : jobStatus || t('ibm_queue_inactive')}
                  </p>
                  {isaQasmPreview && (
                    <button
                      type="button"
                      onClick={() => setShowIsaPreview(!showIsaPreview)}
                      className="text-[9px] text-gray-400 hover:text-quantum-primary underline mt-0.5 cursor-pointer"
                    >
                      {showIsaPreview ? 'Nascondi ISA QASM inviato' : 'Vedi ISA QASM inviato'}
                    </button>
                  )}
                </div>
              </div>

              {showIsaPreview && isaQasmPreview && (
                <pre className="bg-black/80 border border-quantum-primary/20 rounded-lg p-2.5 text-[9px] text-emerald-300 font-mono max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {isaQasmPreview}
                </pre>
              )}

              {/* PQC Received Encrypted Telemetry Card */}
              {pqcRxData && !pqcDecryptedResults && (
                <div className="p-4 bg-gradient-to-br from-amber-500/10 to-purple-950/30 border border-amber-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                        {t('ibm_encrypted_response_title')}
                      </span>
                    </div>
                    <span className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded uppercase">
                      {t('ibm_locked')}
                    </span>
                  </div>

                  <p className="text-[9px] text-gray-300 leading-relaxed">
                    {t('ibm_encrypted_response_desc')}
                  </p>

                  <div className="space-y-2">
                    <input 
                      type="password"
                      value={customUnlockKey}
                      onChange={(e) => setCustomUnlockKey(e.target.value)}
                      placeholder={t('ibm_unlock_key_placeholder')}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-quantum-primary font-mono placeholder-gray-600 focus:border-quantum-primary focus:outline-none"
                    />

                    <button 
                      onClick={handleDecipherRx}
                      disabled={isDeciphering}
                      className="w-full py-2.5 bg-quantum-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-quantum-secondary hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      {isDeciphering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                      {t('ibm_decapsulate_btn')}
                    </button>
                  </div>
                </div>
              )}

              {finalResults ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 uppercase font-mono">{t('ibm_state_measurement')} & {t('ibm_business_translation')}</span>
                    {pqcDecryptedResults ? (
                      <span className="text-[9px] text-green-400 font-bold flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/30 font-mono">
                        <ShieldCheck className="w-3 h-3" /> {t('ibm_pqc_verified')}
                      </span>
                    ) : (
                      <span className="text-[9px] text-quantum-primary font-bold font-mono">{t('ibm_system_measured')}</span>
                    )}
                  </div>
                  
                  {/* States distribution with real company asset labels */}
                  {(() => {
                    const qubitLabels = getQubitLabels();
                    const totalShots: number = (Object.values(finalResults) as number[]).reduce((sum, v) => sum + Number(v || 0), 0) || 1024;
                    const sortedEntries = Object.entries(finalResults).sort((a, b) => Number(b[1]) - Number(a[1]));

                    return (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-hide font-sans">
                        {sortedEntries.map(([state, shots]) => {
                          const percentage = (((shots as number) / totalShots) * 100).toFixed(1);
                          const translated = translateBitstring(state, qubitLabels);

                          return (
                            <div key={state} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 space-y-1.5 hover:border-quantum-primary/30 transition-all">
                              <div className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-mono font-bold">|ψ⟩ = |{state}⟩</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-quantum-secondary font-mono border border-white/5">
                                    {shots as number} {t('ibm_shots')}
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-quantum-primary text-[11px]">{percentage}%</span>
                              </div>

                              {/* Direct translation with real table asset names */}
                              <div className="text-[10px] text-gray-300 font-mono bg-[#070b14] px-2 py-1 rounded border border-white/5 flex items-center gap-1 overflow-x-auto scrollbar-hide">
                                <span className="text-quantum-primary font-bold">➔</span>
                                <span className="text-slate-300 whitespace-nowrap">{translated}</span>
                              </div>

                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, ease: 'easeOut' }}
                                  className="h-full bg-gradient-to-r from-quantum-primary to-quantum-secondary"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* 1. Comparison Box: Classical vs Quantum Computing */}
                  {(() => {
                    const qubitLabels = getQubitLabels();
                    const N = qubitLabels.filter(l => !l.isAncilla).length || 3;
                    const classicalCombinations = Math.pow(2, N);
                    const classicalFormatted = classicalCombinations.toLocaleString();

                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 rounded-xl border border-indigo-500/25 bg-gradient-to-br from-[#0e162b] to-[#080d19] space-y-2.5 font-sans shadow-md"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                              <Zap className="w-3.5 h-3.5" />
                            </div>
                            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                              {t('ibm_comp_title')}
                            </h4>
                          </div>
                          <span className="text-[9px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            N = {N} {t('ibm_comp_vars')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {/* Classical computing card */}
                          <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
                            <div className="flex items-center justify-between text-gray-400 font-mono text-[10px]">
                              <span>{t('ibm_comp_classical_title')}</span>
                              <span className="text-red-400 font-bold">{t('ibm_comp_seq')}</span>
                            </div>
                            <div className="text-lg font-mono font-black text-slate-200">
                              {classicalFormatted} <span className="text-[10px] font-normal text-gray-400">{t('ibm_comp_iters')}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-tight">
                              {t('ibm_comp_classical_desc')}
                            </p>
                          </div>

                          {/* Quantum computing card */}
                          <div className="p-2.5 rounded-lg bg-quantum-primary/10 border border-quantum-primary/25 space-y-1">
                            <div className="flex items-center justify-between text-quantum-primary font-mono text-[10px]">
                              <span>{t('ibm_comp_quantum_title')}</span>
                              <span className="text-emerald-400 font-bold">{t('ibm_comp_instant')}</span>
                            </div>
                            <div className="text-lg font-mono font-black text-quantum-primary flex items-center gap-1.5">
                              {t('ibm_comp_step_label')} <span className="text-[10px] font-normal text-emerald-300">({classicalFormatted} {t('ibm_comp_parallel_states')})</span>
                            </div>
                            <p className="text-[10px] text-gray-300 leading-tight">
                              {t('ibm_comp_quantum_desc').replace('{count}', classicalFormatted)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white/5 p-2 rounded-lg flex items-center justify-between text-[10px] font-mono">
                          <span className="text-gray-300">{t('ibm_comp_advantage_label')}</span>
                          <span className="text-emerald-400 font-bold">×{classicalFormatted} {t('ibm_comp_speedup_label')}</span>
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* 2. Elementary Explanation Module for the Client */}
                  {(() => {
                    const totalShots: number = (Object.values(finalResults) as number[]).reduce((sum, v) => sum + Number(v || 0), 0) || 1024;
                    const sortedStates = Object.entries(finalResults).sort((a, b) => (b[1] as number) - (a[1] as number));
                    const topState = sortedStates[0] ? sortedStates[0][0] : '000';
                    const topShots = sortedStates[0] ? sortedStates[0][1] : 0;
                    const topPercentage = (((topShots as number) / totalShots) * 100).toFixed(1);
                    const qubitLabels = getQubitLabels();
                    const topTranslated = translateBitstring(topState, qubitLabels);

                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-4 rounded-xl border border-quantum-primary/25 bg-gradient-to-br from-[#0c1527] to-[#060b14] space-y-3 font-sans text-left shadow-lg"
                      >
                        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                          <div className="p-1.5 rounded-lg bg-quantum-primary/15 text-quantum-primary">
                            <Lightbulb className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                              {t('ibm_elem_title')}
                            </h4>
                            <span className="text-[9px] text-gray-400 font-mono">
                              {t('ibm_elem_sub')}
                            </span>
                          </div>
                        </div>

                        {/* Top state badge with translation */}
                        <div className="bg-quantum-primary/10 border border-quantum-primary/30 p-2.5 rounded-lg space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-quantum-primary shrink-0 animate-pulse" />
                              <div>
                                <span className="text-[10px] font-mono text-gray-300 block">{t('ibm_elem_opt_state')}</span>
                                <span className="text-xs font-mono font-black text-quantum-primary">|ψ⟩ = |{topState}⟩</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                              {topPercentage}% {t('ibm_elem_prob_suffix')}
                            </span>
                          </div>

                          <div className="text-[10.5px] font-mono text-gray-200 bg-[#070b14] p-1.5 rounded border border-quantum-primary/20">
                            <span className="text-quantum-secondary font-bold mr-1">{t('ibm_elem_real_cfg')}</span>
                            {topTranslated}
                          </div>
                        </div>

                        {/* Elementary bullet points */}
                        <div className="space-y-2 text-[11px] text-gray-300 leading-relaxed font-sans">
                          <div className="flex items-start gap-2">
                            <span className="text-quantum-primary font-bold mt-0.5">•</span>
                            <p>
                              <strong className="text-white">{t('ibm_elem_p1_title')}</strong> {t('ibm_elem_p1_body').replace('{state}', topState)}
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-quantum-primary font-bold mt-0.5">•</span>
                            <p>
                              <strong className="text-white">{t('ibm_elem_p2_title')}</strong> {t('ibm_elem_p2_body')}
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-quantum-primary font-bold mt-0.5">•</span>
                            <p>
                              <strong className="text-white">{t('ibm_elem_p3_title')}</strong> {t('ibm_elem_p3_body')}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </div>
              ) : !pqcRxData && (
                <div className="border border-white/5 rounded-lg p-6 bg-white/5 flex flex-col items-center justify-center text-center opacity-40 min-h-[140px]">
                  <HelpCircle className="w-8 h-8 text-gray-500 mb-2" />
                  <p className="text-[10px] text-gray-400 uppercase">{t('ibm_waiting_results_desc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
