export type SectorId = 'finance' | 'insurance' | 'logistics' | 'energy' | 'telecom' | 'manufacturing' | 'mitigation' | 'translator' | 'crosscode' | 'quantumbi' | 'quantum_code' | 'pqc_group' | 'pqc_locker' | 'pqc_keygen' | 'pqc_chat' | 'realq' | 'large' | 'various' | 'send_to_ibm';

export interface Sector {
  id: SectorId;
  name: string;
  icon: string;
  description: string;
  focus: string;
  variablesLabel: string;
  stressEvent: string;
  placeholder?: string;
  isSpecial?: boolean;
}

export type LanguageCode = 'it' | 'en' | 'zh' | 'ja' | 'ko' | 'de' | 'fr' | 'es' | 'ru' | 'uk';

export const LANGUAGES: Array<{ code: LanguageCode; label: string }> = [
  { code: 'en', label: 'English (EN)' },
  { code: 'it', label: 'Italiano (IT)' },
  { code: 'zh', label: '中文 (ZH)' },
  { code: 'ja', label: '日本語 (JA)' },
  { code: 'ko', label: '한국어 (KO)' },
  { code: 'de', label: 'Deutsch (DE)' },
  { code: 'fr', label: 'Français (FR)' },
  { code: 'es', label: 'Español (ES)' },
  { code: 'ru', label: 'Русский (RU)' },
  { code: 'uk', label: 'Українська (UK)' },
];

export interface DeepInsight {
  label: string;
  value: string;
  description: string;
  type?: 'volatility' | 'confidence' | 'protection' | 'resolution';
}

export interface SimulationResult {
  summary: string;
  configSummary: {
    mode: 'File-Driven' | 'Manual' | 'Special';
    activeAssets: number;
    totalQubits: number;
  };
  quantumConfidence: number;
  recommendedAlgorithm: string;
  comparison: {
    classical: { label: string; value: number; unit: string };
    quantum: { label: string; value: number; unit: string };
    improvement: number;
  };
  matrix: Array<{ name: string; weight: number; insight: string }>;
  metrics: Array<{ label: string; value: number; unit: string; trend: 'up' | 'down' | 'neutral' }>;
  stressImpact: string;
  fidelity: number;
  speedup: number;
  deepInsights?: DeepInsight[];
  logisticsData?: {
    nodes: Array<{ name: string; x: number; y: number; type: 'hub' | 'delivery' }>;
    optimizedRoute: string[];
    routeExplanation: string;
  };
}

export const SECTORS: Sector[] = [
  {
    id: 'translator',
    name: 'Quantum Translator',
    icon: 'Languages',
    description: 'Translate between Python (Qiskit), OpenQASM, and Visual Composer.',
    focus: 'Quantum Code Translation',
    variablesLabel: 'Circuit Logic',
    stressEvent: 'Syntax Error',
    isSpecial: true,
  },
  {
    id: 'finance',
    name: 'Banking',
    icon: 'Landmark',
    description: 'Ultra-fast risk analysis and predictive scenarios. Portfolio optimization, derivative pricing, and fraud detection.',
    focus: 'Optimization & Risk Analysis',
    variablesLabel: 'Variables/Models',
    placeholder: 'e.g., Option Pricing, Fraud Pattern A, High-Yield Rebalancing...',
    stressEvent: 'USD Crash',
    isSpecial: true,
  },
  {
    id: 'insurance',
    name: 'Insurance',
    icon: 'ShieldCheck',
    description: 'Granular underwriting, catastrophe modeling, and Solvency II reserve optimization via Quantum ML.',
    focus: 'Risk Classification & ALM',
    variablesLabel: 'Risk Inputs',
    placeholder: 'e.g., Health IoT Data, Climate Models 2030, Solvency II Gap...',
    stressEvent: 'Catastrophic Loss Spike',
  },
  {
    id: 'logistics',
    name: 'Logistics',
    icon: 'Truck',
    description: 'Optimize Last-Mile routes and warehouse configurations among billions of possibilities in real time.',
    focus: 'Last-Mile & Route Opt',
    variablesLabel: 'Nodes/Routes',
    placeholder: 'e.g., Downtown Deliveries, Airport Hub, Zone 4 Couriers...',
    stressEvent: 'Global Supply Chain Disruption',
  },
  {
    id: 'telecom',
    name: 'Telecom',
    icon: 'Rss',
    description: 'Manage frequency and traffic in ultra-dense 6G networks to minimize latency.',
    focus: '6G Network Opt',
    variablesLabel: 'Frequencies/Cells',
    stressEvent: 'Solar Flare',
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: 'Factory',
    description: 'Optimize robotic assembly processes to eliminate idle time down to the millisecond.',
    focus: 'Robotic Assembly Opt',
    variablesLabel: 'Processes/Robots',
    stressEvent: 'Total Hardware Failure',
  },
  {
    id: 'energy',
    name: 'Energy',
    icon: 'Wand2',
    description: 'Balance the smart grid and renewable integration while managing weather volatility.',
    focus: 'Grid Balancing',
    variablesLabel: 'Grid Nodes',
    stressEvent: 'Total Grid Blackout',
  },
  {
    id: 'mitigation',
    name: 'Noise Management',
    icon: 'Zap',
    description: 'Clean NISQ noise and optimize code for real quantum hardware (IBM, Google).',
    focus: 'Quantum Error Mitigation',
    variablesLabel: 'Gates/Qubits',
    stressEvent: 'Thermal Decoherence',
    isSpecial: true,
  },
  {
    id: 'crosscode',
    name: 'Cross Code',
    icon: 'Terminal',
    description: 'Analysis and cross-compilation between quantum algorithms and high-performance classical code.',
    focus: 'Quantum-Classical Interop',
    variablesLabel: 'Hybrid Logic',
    stressEvent: 'Memory Leak',
    isSpecial: true,
  },
  {
    id: 'quantumbi',
    name: 'Quantum BI',
    icon: 'TableProperties',
    description: 'Quantum Business Intelligence: Analyze complex CSV files and transform data into optimization algorithms.',
    focus: 'Data-Driven Quantum Analysis',
    variablesLabel: 'CSV Columns',
    stressEvent: 'Data Corruption',
    isSpecial: true,
  },

  {
    id: 'pqc_group',
    name: 'Post-Quantum Cryptography',
    icon: 'ShieldCheck',
    description: 'Advanced post-quantum cryptography tools based on NIST standards.',
    focus: 'Quantum-Safe Security',
    variablesLabel: 'Security Params',
    stressEvent: 'Quantum Decryption',
    isSpecial: true,
  },
  {
    id: 'pqc_locker',
    name: 'PQC Crypto-Locker',
    icon: 'Lock',
    description: 'Post-Quantum Crypto-Locker: Encrypt files and text using NIST ML-KEM-768 standard.',
    focus: 'Quantum-Safe Encryption',
    variablesLabel: 'Payload Data',
    stressEvent: 'Brute Force Attack',
    isSpecial: true,
  },
  {
    id: 'pqc_keygen',
    name: 'PQC Key Generator',
    icon: 'Key',
    description: 'Lattice-based Quantum-Resistant keypair generator (ML-KEM).',
    focus: 'Quantum Key Management',
    variablesLabel: 'Security Level',
    stressEvent: 'Key Compromise',
    isSpecial: true,
  },
  {
    id: 'pqc_chat',
    name: 'PQC Chat',
    icon: 'MessageSquare',
    description: 'Secure disposable chat protected by post-quantum key exchanges.',
    focus: 'Secure Communication',
    variablesLabel: 'Session Entropy',
    stressEvent: 'Man-in-the-middle',
    isSpecial: true,
  },
  {
    id: 'realq',
    name: 'IBM Quantum Gateway',
    icon: 'HelpCircle',
    description: 'Hardware Gateway: Submit your circuits directly to IBM quantum processors and monitor jobs in real time.',
    focus: 'Quantum Hardware Integration',
    variablesLabel: 'Jobs/Qasm',
    stressEvent: 'Network Latency',
    isSpecial: true,
  },
  {
    id: 'large',
    name: 'Large Quantum B2B',
    icon: 'Cpu',
    description: 'Universal B2B Quantum Interface for processing macroeconomic scenarios and Qiskit code.',
    focus: 'Universal Code Generation',
    variablesLabel: 'Scenario Params',
    stressEvent: 'Quantum Collapse',
    isSpecial: true,
  },
  {
    id: 'various',
    name: 'Heterogeneous Quantum',
    icon: 'Globe',
    description: 'Heterogeneous Quantum Engine for global interconnection and butterfly effect analysis.',
    focus: 'Heterogeneous Entanglement',
    variablesLabel: 'Heterogeneous Sources',
    stressEvent: 'Butterfly Effect Peak',
    isSpecial: true,
  },
  {
    id: 'quantum_code',
    name: 'Write Q Code',
    icon: 'Code2',
    description: 'Access advanced quantum development and analysis tools.',
    focus: 'Quantum Development Suite',
    variablesLabel: 'Code Modules',
    stressEvent: 'Compilation Fail',
    isSpecial: true,
  },

];
