export interface NoiseOptimizationMetrics {
  detectedFormat: 'OPENQASM_3' | 'OPENQASM_2' | 'PYTHON_QISKIT' | 'TEXT';
  originalGateCount: number;
  optimizedGateCount: number;
  gatesRemoved: number;
  rotationsMerged: number;
  registersAdjusted: boolean;
  passesApplied: string[];
  qubitsDeclared: number;
}

export interface NoiseOptimizationResponse {
  analysis: string;
  optimizedCode: string;
  guide: string;
  metrics?: NoiseOptimizationMetrics;
  aiUsed?: boolean;
  aiModel?: string | null;
  aiNote?: string | null;
}

export interface NoiseMitigationResponse {
  method: 'READOUT_MATRIX_INVERSION' | 'ZNE_RICHARDSON';
  numQubits: number;
  totalShots: number;
  error01: number;
  error10: number;
  original: Record<string, number>;
  mitigated: Record<string, number>;
  dominantState: string;
  rawDominantPct: number;
  mitigatedDominantPct: number;
  fidelityDeltaPct: number;
  l1ShiftPct: number;
  explanation: string;
  aiUsed?: boolean;
  aiModel?: string | null;
  aiNote?: string | null;
}

export async function optimizeQuantumCode(
  userCode: string,
  lang: string = 'it',
  useGemini: boolean = true
): Promise<NoiseOptimizationResponse> {
  const response = await fetch('/api/noise/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: userCode,
      language: lang,
      useGemini,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Errore durante la pulizia dal rumore del codice.');
  }

  return data;
}

export async function mitigateQuantumCounts(params: {
  counts?: Record<string, number>;
  error01?: number;
  error10?: number;
  method?: 'readout' | 'zne';
  zneRuns?: Array<{ scale: number; counts: Record<string, number> }>;
  language?: string;
  useGemini?: boolean;
}): Promise<NoiseMitigationResponse> {
  const response = await fetch('/api/noise/mitigate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Errore durante la mitigazione dei risultati.');
  }

  return data;
}
