import axios from 'axios';
import crypto from 'crypto';

export interface IbmQuantumInstance {
  crn: string;
  name: string;
  state: string;
  regionId?: string;
}

export interface IbmBackendSummary {
  name: string;
  isSimulator: boolean;
  status: string;
  isOnline: boolean;
  queueLength: number;
  qubits: number;
}

export interface IbmBackendConfig {
  backendName: string;
  nQubits: number;
  basisGates: string[];
  couplingMap: [number, number][];
}

export interface ParsedCircuitInfo {
  numLogicalQubits: number;
  numClassicalBits: number;
  isaQasm: string;
  logicalToPhysical: number[];
  gateCount: number;
}

export interface QasmValidationResult {
  valid: boolean;
  qasmVersion: '2.0' | '3.0' | 'JSON';
  numQubits: number;
  numClassicalBits: number;
  gateCount: number;
  gatesUsed: string[];
  hasMeasurements: boolean;
  warnings: string[];
  error?: string;
}

const IBM_QUANTUM_API_BASE = 'https://quantum.cloud.ibm.com/api/v1';
const IBM_IAM_URL = 'https://iam.cloud.ibm.com/identity/token';
const IBM_RESOURCE_CONTROLLER_URL = 'https://resource-controller.cloud.ibm.com/v2/resource_instances';
const API_VERSION_CANDIDATES = ['2025-05-01', '2026-04-15', '2024-01-01'];

// Short-lived in-memory IAM token cache (never persisted to disk)
const iamCache = new Map<string, { token: string; expiresAt: number }>();

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function exchangeIamToken(apiKeyRaw: string): Promise<string> {
  const apiKey = (apiKeyRaw || '').trim();
  if (!apiKey) {
    throw new Error('API Key IBM Quantum mancante.');
  }

  // Allow direct IAM Bearer JWT if user pasted one
  if (apiKey.startsWith('eyJ') && apiKey.split('.').length === 3) {
    return apiKey;
  }

  const cacheKey = hashKey(apiKey);
  const cached = iamCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: apiKey,
    }).toString();

    const response = await axios.post(IBM_IAM_URL, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      timeout: 15000,
    });

    const accessToken = response.data?.access_token;
    const expiresIn = Number(response.data?.expires_in || 3600);
    if (!accessToken) {
      throw new Error('Risposta IAM IBM non valida (access_token assente).');
    }

    iamCache.set(cacheKey, {
      token: accessToken,
      expiresAt: Date.now() + Math.min(expiresIn, 3600) * 1000,
    });
    return accessToken;
  } catch (err: any) {
    const status = err?.response?.status;
    const detail = err?.response?.data?.errorMessage || err?.response?.data?.error || err?.message || 'Errore IAM';
    if (status === 400 || status === 401 || status === 403) {
      throw new Error(
        `Autenticazione IBM Cloud rifiutata (${status}): verifica di aver inserito una IBM Cloud API Key valida creata su quantum.cloud.ibm.com. Dettaglio: ${detail}`
      );
    }
    throw new Error(`Impossibile contattare IBM Cloud IAM (${detail}).`);
  }
}

export async function discoverQuantumInstances(bearerToken: string): Promise<IbmQuantumInstance[]> {
  try {
    const instances: IbmQuantumInstance[] = [];
    let nextUrl: string | null = `${IBM_RESOURCE_CONTROLLER_URL}?limit=100`;

    while (nextUrl && instances.length < 200) {
      const resp = await axios.get(nextUrl, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          Accept: 'application/json',
        },
        timeout: 15000,
      });

      const resources = Array.isArray(resp.data?.resources) ? resp.data.resources : [];
      for (const r of resources) {
        const crn: string = r?.crn || r?.id || '';
        const resId: string = String(r?.resource_id || '').toLowerCase();
        if (crn.includes(':quantum-computing:') || resId.includes('quantum')) {
          instances.push({
            crn,
            name: r?.name || 'IBM Quantum Instance',
            state: String(r?.state || 'unknown').toLowerCase(),
            regionId: r?.region_id,
          });
        }
      }

      const rawNext = resp.data?.next_url;
      if (rawNext && typeof rawNext === 'string') {
        nextUrl = rawNext.startsWith('http')
          ? rawNext
          : `https://resource-controller.cloud.ibm.com${rawNext}`;
      } else {
        nextUrl = null;
      }
    }

    instances.sort((a, b) => {
      if (a.state === 'active' && b.state !== 'active') return -1;
      if (a.state !== 'active' && b.state === 'active') return 1;
      return 0;
    });

    if (instances.length === 0) {
      throw new Error(
        'Nessuna istanza IBM Quantum ("quantum-computing") trovata su questo account IBM Cloud. Accedi a quantum.cloud.ibm.com e crea o verifica una istanza attiva (es. Open Plan).'
      );
    }

    return instances;
  } catch (err: any) {
    if (err?.message?.includes('Nessuna istanza IBM Quantum')) throw err;
    const status = err?.response?.status;
    const detail = err?.response?.data?.message || err?.message || 'Errore Resource Controller';
    throw new Error(
      `Impossibile rilevare automaticamente l'istanza IBM Quantum (${status || 'network'}: ${detail}). Verifica i permessi dell'API Key su IBM Cloud.`
    );
  }
}

export async function ibmQuantumRequest<T = any>(
  method: 'GET' | 'POST',
  path: string,
  bearerToken: string,
  serviceCrn: string,
  data?: any
): Promise<T> {
  let lastError: any = null;

  for (let i = 0; i < API_VERSION_CANDIDATES.length; i++) {
    const apiVersion = API_VERSION_CANDIDATES[i];
    try {
      const response = await axios.request<T>({
        method,
        url: `${IBM_QUANTUM_API_BASE}${path}`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`,
          'Service-CRN': serviceCrn,
          'IBM-API-Version': apiVersion,
        },
        data,
        timeout: 25000,
      });
      return response.data;
    } catch (err: any) {
      lastError = err;
      const status = err?.response?.status;
      const errBody = JSON.stringify(err?.response?.data || '');
      if (status === 400 && /IBM-API-Version|version/i.test(errBody) && i < API_VERSION_CANDIDATES.length - 1) {
        continue;
      }
      break;
    }
  }

  const status = lastError?.response?.status;
  const rawErr = lastError?.response?.data;
  const errMsg =
    rawErr?.errors?.[0]?.message ||
    rawErr?.message ||
    rawErr?.detail ||
    (typeof rawErr === 'string' ? rawErr : '') ||
    lastError?.message ||
    'Errore chiamata IBM Quantum API';
  throw new Error(`IBM Quantum API (${status || 'ERR'}): ${errMsg}`);
}

export async function listAvailableBackends(
  bearerToken: string,
  serviceCrn: string
): Promise<IbmBackendSummary[]> {
  const data = await ibmQuantumRequest<any>('GET', '/backends', bearerToken, serviceCrn);
  const rawList: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.devices)
      ? data.devices
      : Array.isArray(data?.backends)
        ? data.backends
        : [];

  return rawList
    .map((d: any): IbmBackendSummary => {
      const name = String(d?.name || d?.backend_name || '');
      const isSimulator = Boolean(
        d?.is_simulator ?? d?.simulator ?? name.toLowerCase().includes('simulator')
      );
      const statusStr =
        typeof d?.status === 'string'
          ? d.status
          : String(d?.status?.name || (d?.operational ? 'online' : 'offline'));
      const isOnline = statusStr.toLowerCase() === 'online' || d?.operational === true;
      const queueLength = Number(d?.queue_length ?? d?.pending_jobs ?? 0);
      const qubits = Number(d?.qubits ?? d?.n_qubits ?? 0);
      return { name, isSimulator, status: statusStr, isOnline, queueLength, qubits };
    })
    .filter((b) => Boolean(b.name));
}

export async function getBackendConfiguration(
  bearerToken: string,
  serviceCrn: string,
  backendName: string
): Promise<IbmBackendConfig> {
  const cfg = await ibmQuantumRequest<any>(
    'GET',
    `/backends/${encodeURIComponent(backendName)}/configuration`,
    bearerToken,
    serviceCrn
  );

  const nQubits = Number(cfg?.n_qubits ?? cfg?.qubits ?? 127);
  const basisGates: string[] = Array.isArray(cfg?.basis_gates) && cfg.basis_gates.length > 0
    ? cfg.basis_gates.map((g: any) => String(g).toLowerCase())
    : ['id', 'rz', 'sx', 'x', 'cz'];
  const couplingMap: [number, number][] = Array.isArray(cfg?.coupling_map)
    ? cfg.coupling_map
        .filter((pair: any) => Array.isArray(pair) && pair.length >= 2)
        .map((pair: any) => [Number(pair[0]), Number(pair[1])] as [number, number])
    : [];

  return {
    backendName,
    nQubits,
    basisGates,
    couplingMap,
  };
}

export async function selectTargetBackend(
  bearerToken: string,
  serviceCrn: string,
  requiredQubits: number,
  preferredBackend?: string
): Promise<{ summary: IbmBackendSummary; config: IbmBackendConfig; allBackends: IbmBackendSummary[] }> {
  const allBackends = await listAvailableBackends(bearerToken, serviceCrn);
  if (allBackends.length === 0) {
    throw new Error('Nessun backend IBM Quantum disponibile per questa istanza.');
  }

  let chosen: IbmBackendSummary | undefined;
  if (preferredBackend && preferredBackend !== 'auto') {
    chosen = allBackends.find((b) => b.name === preferredBackend);
    if (!chosen) {
      throw new Error(`Il backend selezionato "${preferredBackend}" non è disponibile su questa istanza.`);
    }
  } else {
    const onlineQpus = allBackends
      .filter((b) => b.isOnline && !b.isSimulator && (b.qubits === 0 || b.qubits >= requiredQubits))
      .sort((a, b) => a.queueLength - b.queueLength);

    const onlineSims = allBackends
      .filter((b) => b.isOnline && b.isSimulator && (b.qubits === 0 || b.qubits >= requiredQubits))
      .sort((a, b) => a.queueLength - b.queueLength);

    chosen = onlineQpus[0] || onlineSims[0] || allBackends.find((b) => b.isOnline) || allBackends[0];
  }

  const config = await getBackendConfiguration(bearerToken, serviceCrn, chosen.name);
  if (requiredQubits > config.nQubits) {
    throw new Error(
      `Il circuito richiede ${requiredQubits} qubit ma il backend "${chosen.name}" supporta al massimo ${config.nQubits} qubit.`
    );
  }

  return { summary: chosen, config, allBackends };
}

// =========================================================================
// SAFE MATH EXPRESSION PARSER (NO eval) FOR OPENQASM PARAMETERS
// =========================================================================
function evaluateQasmAngle(exprRaw: string): number {
  const expr = exprRaw.trim().replace(/\s+/g, '');
  let pos = 0;

  function parseExpression(): number {
    let val = parseTerm();
    while (pos < expr.length && (expr[pos] === '+' || expr[pos] === '-')) {
      const op = expr[pos++];
      const rhs = parseTerm();
      val = op === '+' ? val + rhs : val - rhs;
    }
    return val;
  }

  function parseTerm(): number {
    let val = parseFactor();
    while (pos < expr.length && (expr[pos] === '*' || expr[pos] === '/')) {
      const op = expr[pos++];
      const rhs = parseFactor();
      val = op === '*' ? val * rhs : val / rhs;
    }
    return val;
  }

  function parseFactor(): number {
    if (expr[pos] === '+') {
      pos++;
      return parseFactor();
    }
    if (expr[pos] === '-') {
      pos++;
      return -parseFactor();
    }
    if (expr[pos] === '(') {
      pos++;
      const val = parseExpression();
      if (expr[pos] === ')') pos++;
      return val;
    }
    if (expr.slice(pos, pos + 3).toLowerCase() === 'tau') {
      pos += 3;
      return 2 * Math.PI;
    }
    if (expr.slice(pos, pos + 2).toLowerCase() === 'pi') {
      pos += 2;
      return Math.PI;
    }
    const match = expr.slice(pos).match(/^(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/);
    if (match) {
      pos += match[1].length;
      return parseFloat(match[1]);
    }
    throw new Error(`Espressione angolare OpenQASM non valida: "${exprRaw}"`);
  }

  const result = parseExpression();
  if (!Number.isFinite(result)) {
    throw new Error(`Valore angolare OpenQASM non finito: "${exprRaw}"`);
  }
  return result;
}

// =========================================================================
// OPENQASM 2.0 / 3.0 -> IBM ISA OPENQASM 3.0 TRANSPILER
// =========================================================================
interface QasmOp {
  kind: '1q' | '2q' | 'measure' | 'reset';
  name: string;
  params: number[];
  qubits: number[];
  cbit?: number;
}

function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

export function normalizeCircuitInputToQasm(rawInput: string): string {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) {
    throw new Error('Il codice del circuito è vuoto.');
  }

  if (trimmed.startsWith('{')) {
    let parsed: any;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error('JSON del circuito non valido.');
    }
    const n = Math.min(127, Math.max(2, Number(parsed?.num_qubits || 3)));
    const returns: number[] = Array.isArray(parsed?.parameters?.expected_returns)
      ? parsed.parameters.expected_returns.map((v: any) => Number(v))
      : [];
    const lines = [
      'OPENQASM 3.0;',
      'include "stdgates.inc";',
      `qubit[${n}] q;`,
      `bit[${n}] c;`,
    ];
    for (let i = 0; i < n; i++) {
      const r = returns[i];
      const p = Number.isFinite(r) ? Math.max(0.05, Math.min(0.95, Math.abs(r) * 100)) : 0.5;
      const theta = (2 * Math.asin(Math.sqrt(p))).toFixed(6);
      lines.push(`ry(${theta}) q[${i}];`);
    }
    for (let i = 0; i < n - 1; i++) {
      lines.push(`cx q[${i}], q[${i + 1}];`);
    }
    for (let i = 0; i < n; i++) {
      lines.push(`measure q[${i}] -> c[${i}];`);
    }
    return lines.join('\n');
  }

  return trimmed;
}

export function extractNumQubitsQuick(rawInput: string): number {
  try {
    const qasm = normalizeCircuitInputToQasm(rawInput);
    const clean = stripComments(qasm);
    let total = 0;
    for (const m of clean.matchAll(/\b(?:qreg\s+[a-zA-Z_]\w*\s*\[\s*(\d+)\s*\]|qubit\s*\[\s*(\d+)\s*\]\s+[a-zA-Z_]\w*)\s*;/g)) {
      total += Number(m[1] || m[2] || 0);
    }
    if (total > 0) return total;
    const physRefs = Array.from(clean.matchAll(/\$(\d+)/g)).map((m) => Number(m[1]));
    if (physRefs.length > 0) return Math.max(...physRefs) + 1;
    return 4;
  } catch {
    return 4;
  }
}

function findConnectedLayout(nQubits: number, couplingMap: [number, number][], maxPhysQubits: number): number[] {
  if (!couplingMap || couplingMap.length === 0 || nQubits <= 1) {
    return Array.from({ length: nQubits }, (_, i) => i);
  }

  const adj = new Map<number, Set<number>>();
  for (const [u, v] of couplingMap) {
    if (u < maxPhysQubits && v < maxPhysQubits) {
      if (!adj.has(u)) adj.set(u, new Set());
      if (!adj.has(v)) adj.set(v, new Set());
      adj.get(u)!.add(v);
      adj.get(v)!.add(u);
    }
  }

  // Prefer starting near node 0 or highest-degree connected component
  const candidates = Array.from(adj.keys()).sort((a, b) => {
    const degDiff = (adj.get(b)?.size || 0) - (adj.get(a)?.size || 0);
    return degDiff !== 0 ? degDiff : a - b;
  });

  for (const start of candidates) {
    const visited: number[] = [];
    const seen = new Set<number>();
    const queue: number[] = [start];
    seen.add(start);
    while (queue.length > 0 && visited.length < nQubits) {
      const curr = queue.shift()!;
      visited.push(curr);
      const neighbors = Array.from(adj.get(curr) || []).sort((a, b) => a - b);
      for (const nxt of neighbors) {
        if (!seen.has(nxt)) {
          seen.add(nxt);
          queue.push(nxt);
        }
      }
    }
    if (visited.length >= nQubits) {
      return visited.slice(0, nQubits);
    }
  }

  return Array.from({ length: nQubits }, (_, i) => i);
}

function findShortestPath(src: number, dst: number, adj: Map<number, Set<number>>): number[] | null {
  if (src === dst) return [src];
  const prev = new Map<number, number | null>([[src, null]]);
  const queue = [src];
  while (queue.length > 0) {
    const u = queue.shift()!;
    for (const v of adj.get(u) || []) {
      if (!prev.has(v)) {
        prev.set(v, u);
        if (v === dst) {
          const path: number[] = [];
          let cur: number | null = dst;
          while (cur !== null) {
            path.unshift(cur);
            cur = prev.get(cur) ?? null;
          }
          return path;
        }
        queue.push(v);
      }
    }
  }
  return null;
}

function fmtAngle(rad: number): string {
  // Normalize to [-pi, pi] or keep clean precision
  let norm = rad % (2 * Math.PI);
  if (norm > Math.PI) norm -= 2 * Math.PI;
  if (norm <= -Math.PI) norm += 2 * Math.PI;
  if (Math.abs(norm) < 1e-9) return '0';
  return Number(norm.toFixed(8)).toString();
}

const SUPPORTED_1Q_GATES = new Set([
  'id', 'i', 'x', 'y', 'z', 'h', 's', 'sdg', 't', 'tdg',
  'sx', 'sxdg', 'rz', 'p', 'u1', 'ry', 'rx', 'u2', 'u3', 'u',
]);

const SUPPORTED_2Q_GATES = new Set([
  'cx', 'cz', 'cp', 'cu1', 'rzz', 'ecr', 'cry', 'crz', 'swap',
]);

interface ParsedQasmProgram {
  qasmVersion: '2.0' | '3.0' | 'JSON';
  totalLogicalQubits: number;
  totalClassicalBits: number;
  ops: QasmOp[];
  hasMeasurements: boolean;
  gatesUsed: string[];
  warnings: string[];
}

function parseQasmProgram(rawInput: string): ParsedQasmProgram {
  const trimmedRaw = (rawInput || '').trim();
  const isJsonInput = trimmedRaw.startsWith('{');
  const qasmSource = normalizeCircuitInputToQasm(trimmedRaw);
  const clean = stripComments(qasmSource);
  const statements = clean
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const qregs = new Map<string, { offset: number; size: number }>();
  const cregs = new Map<string, { offset: number; size: number }>();
  let totalLogicalQubits = 0;
  let totalClassicalBits = 0;
  let qasmVersion: '2.0' | '3.0' | 'JSON' = isJsonInput
    ? 'JSON'
    : /OPENQASM\s+2/i.test(clean)
      ? '2.0'
      : '3.0';

  const ops: QasmOp[] = [];
  const gatesUsedSet = new Set<string>();
  const warnings: string[] = [];
  let hasMeasurements = false;

  const resolveQubitArg = (arg: string): number[] => {
    const a = arg.trim();
    const physMatch = a.match(/^\$(\d+)$/);
    if (physMatch) {
      const idx = Number(physMatch[1]);
      totalLogicalQubits = Math.max(totalLogicalQubits, idx + 1);
      return [idx];
    }
    const idxMatch = a.match(/^([a-zA-Z_]\w*)\s*\[\s*(\d+)\s*\]$/);
    if (idxMatch) {
      const reg = qregs.get(idxMatch[1]);
      if (!reg) throw new Error(`Registro quantistico sconosciuto: "${idxMatch[1]}"`);
      const i = Number(idxMatch[2]);
      if (i >= reg.size) throw new Error(`Indice qubit fuori limiti: "${a}"`);
      return [reg.offset + i];
    }
    const wholeReg = qregs.get(a);
    if (wholeReg) {
      return Array.from({ length: wholeReg.size }, (_, i) => wholeReg.offset + i);
    }
    throw new Error(`Operando qubit non valido: "${a}"`);
  };

  const resolveCbitArg = (arg: string): number[] => {
    const a = arg.trim();
    const idxMatch = a.match(/^([a-zA-Z_]\w*)\s*\[\s*(\d+)\s*\]$/);
    if (idxMatch) {
      const reg = cregs.get(idxMatch[1]);
      if (!reg) throw new Error(`Registro classico sconosciuto: "${idxMatch[1]}"`);
      const i = Number(idxMatch[2]);
      if (i >= reg.size) throw new Error(`Indice bit fuori limiti: "${a}"`);
      return [reg.offset + i];
    }
    const wholeReg = cregs.get(a);
    if (wholeReg) {
      return Array.from({ length: wholeReg.size }, (_, i) => wholeReg.offset + i);
    }
    throw new Error(`Operando bit classico non valido: "${a}"`);
  };

  for (const stmt of statements) {
    if (/^OPENQASM\b/i.test(stmt)) {
      if (!isJsonInput) {
        qasmVersion = /OPENQASM\s+2/i.test(stmt) ? '2.0' : '3.0';
      }
      continue;
    }
    if (/^include\b/i.test(stmt) || /^barrier\b/i.test(stmt) || /^delay\b/i.test(stmt)) {
      continue;
    }

    // qreg q[N]
    let m = stmt.match(/^qreg\s+([a-zA-Z_]\w*)\s*\[\s*(\d+)\s*\]$/);
    if (m) {
      const size = Number(m[2]);
      qregs.set(m[1], { offset: totalLogicalQubits, size });
      totalLogicalQubits += size;
      continue;
    }

    // qubit[N] q or qubit q
    m = stmt.match(/^qubit(?:\s*\[\s*(\d+)\s*\])?\s+([a-zA-Z_]\w*)$/);
    if (m) {
      const size = m[1] ? Number(m[1]) : 1;
      qregs.set(m[2], { offset: totalLogicalQubits, size });
      totalLogicalQubits += size;
      continue;
    }

    // creg c[N]
    m = stmt.match(/^creg\s+([a-zA-Z_]\w*)\s*\[\s*(\d+)\s*\]$/);
    if (m) {
      const size = Number(m[2]);
      cregs.set(m[1], { offset: totalClassicalBits, size });
      totalClassicalBits += size;
      continue;
    }

    // bit[N] c or bit c
    m = stmt.match(/^bit(?:\s*\[\s*(\d+)\s*\])?\s+([a-zA-Z_]\w*)$/);
    if (m) {
      const size = m[1] ? Number(m[1]) : 1;
      cregs.set(m[2], { offset: totalClassicalBits, size });
      totalClassicalBits += size;
      continue;
    }

    // OpenQASM 2/3 measure q -> c
    m = stmt.match(/^measure\s+(.+?)\s*->\s*(.+)$/);
    if (m) {
      hasMeasurements = true;
      const qs = resolveQubitArg(m[1]);
      const cs = resolveCbitArg(m[2]);
      const count = Math.min(qs.length, cs.length);
      for (let i = 0; i < count; i++) {
        ops.push({ kind: 'measure', name: 'measure', params: [], qubits: [qs[i]], cbit: cs[i] });
      }
      continue;
    }

    // OpenQASM 3: c[i] = measure q[i]
    m = stmt.match(/^(.+?)\s*=\s*measure\s+(.+)$/);
    if (m) {
      hasMeasurements = true;
      const cs = resolveCbitArg(m[1]);
      const qs = resolveQubitArg(m[2]);
      const count = Math.min(qs.length, cs.length);
      for (let i = 0; i < count; i++) {
        ops.push({ kind: 'measure', name: 'measure', params: [], qubits: [qs[i]], cbit: cs[i] });
      }
      continue;
    }

    // Reset q[i]
    m = stmt.match(/^reset\s+(.+)$/);
    if (m) {
      const qs = resolveQubitArg(m[1]);
      for (const qIdx of qs) {
        ops.push({ kind: 'reset', name: 'reset', params: [], qubits: [qIdx] });
      }
      gatesUsedSet.add('reset');
      continue;
    }

    // Standard gates: name(p1, p2, ...) arg1, arg2
    m = stmt.match(/^([a-zA-Z_]\w*)(?:\s*\(([^)]*)\))?\s+(.+)$/);
    if (m) {
      const gateName = m[1].toLowerCase();
      const params = m[2]
        ? m[2].split(',').filter((x) => x.trim().length > 0).map(evaluateQasmAngle)
        : [];
      const args = m[3].split(',').map((a) => resolveQubitArg(a));

      // Support broadcast across registers (e.g. h q;)
      const maxLen = Math.max(...args.map((a) => a.length));
      for (let i = 0; i < maxLen; i++) {
        const qTuple = args.map((a) => a[a.length === 1 ? 0 : i]);
        if (qTuple.length === 1) {
          if (!SUPPORTED_1Q_GATES.has(gateName)) {
            throw new Error(`Gate 1-qubit non supportato dal transpiler: "${gateName}"`);
          }
          ops.push({ kind: '1q', name: gateName, params, qubits: qTuple });
          gatesUsedSet.add(gateName);
        } else if (qTuple.length === 2) {
          if (!SUPPORTED_2Q_GATES.has(gateName)) {
            throw new Error(`Gate 2-qubit non supportato dal transpiler: "${gateName}"`);
          }
          ops.push({ kind: '2q', name: gateName, params, qubits: qTuple });
          gatesUsedSet.add(gateName);
        } else {
          throw new Error(`Gate a ${qTuple.length} qubit "${gateName}" non supportato direttamente dal transpiler.`);
        }
      }
      continue;
    }

    throw new Error(`Istruzione OpenQASM non riconosciuta: "${stmt}"`);
  }

  if (totalLogicalQubits === 0) {
    throw new Error('Nessun qubit dichiarato nel circuito OpenQASM.');
  }
  if (totalLogicalQubits > 156) {
    throw new Error(
      `Il circuito richiede ${totalLogicalQubits} qubit, superando il limite fisico massimo dei processori IBM Quantum (156 qubit).`
    );
  }
  if (totalClassicalBits === 0) {
    totalClassicalBits = totalLogicalQubits;
    warnings.push('Nessun registro classico esplicito trovato: aggiunta misurazione automatica su tutti i qubit.');
    for (let i = 0; i < totalLogicalQubits; i++) {
      ops.push({ kind: 'measure', name: 'measure', params: [], qubits: [i], cbit: i });
    }
  } else if (!hasMeasurements) {
    warnings.push('Nessuna istruzione "measure" rilevata: aggiunta misurazione finale automatica per il Sampler IBM.');
    const count = Math.min(totalLogicalQubits, totalClassicalBits);
    for (let i = 0; i < count; i++) {
      ops.push({ kind: 'measure', name: 'measure', params: [], qubits: [i], cbit: i });
    }
  }

  return {
    qasmVersion,
    totalLogicalQubits,
    totalClassicalBits,
    ops,
    hasMeasurements,
    gatesUsed: Array.from(gatesUsedSet),
    warnings,
  };
}

export function validateOpenQasmSyntax(rawInput: string, shots = 1024): QasmValidationResult {
  try {
    if (!Number.isFinite(shots) || shots < 1 || shots > 10000) {
      throw new Error(`Numero di shots (${shots}) fuori dall'intervallo consentito da IBM Quantum (1 - 10000).`);
    }
    const parsed = parseQasmProgram(rawInput);
    const gateOpsCount = parsed.ops.filter((o) => o.kind === '1q' || o.kind === '2q').length;
    if (gateOpsCount === 0) {
      parsed.warnings.push('Il circuito non contiene gate quantistici prima della misurazione.');
    }
    return {
      valid: true,
      qasmVersion: parsed.qasmVersion,
      numQubits: parsed.totalLogicalQubits,
      numClassicalBits: parsed.totalClassicalBits,
      gateCount: gateOpsCount,
      gatesUsed: parsed.gatesUsed,
      hasMeasurements: parsed.hasMeasurements,
      warnings: parsed.warnings,
    };
  } catch (err: any) {
    return {
      valid: false,
      qasmVersion: '3.0',
      numQubits: 0,
      numClassicalBits: 0,
      gateCount: 0,
      gatesUsed: [],
      hasMeasurements: false,
      warnings: [],
      error: err?.message || 'Errore di sintassi OpenQASM.',
    };
  }
}

export function transpileOpenQasmToIsa(rawInput: string, config: IbmBackendConfig): ParsedCircuitInfo {
  const parsed = parseQasmProgram(rawInput);
  const { totalLogicalQubits, totalClassicalBits, ops } = parsed;

  if (totalLogicalQubits > config.nQubits) {
    throw new Error(
      `Il circuito usa ${totalLogicalQubits} qubit ma "${config.backendName}" ha ${config.nQubits} qubit.`
    );
  }

  // Build coupling graph
  const directedEdges = new Set<string>();
  const undirectedAdj = new Map<number, Set<number>>();
  for (const [u, v] of config.couplingMap) {
    directedEdges.add(`${u}->${v}`);
    if (!undirectedAdj.has(u)) undirectedAdj.set(u, new Set());
    if (!undirectedAdj.has(v)) undirectedAdj.set(v, new Set());
    undirectedAdj.get(u)!.add(v);
    undirectedAdj.get(v)!.add(u);
  }

  const logicalToPhys = findConnectedLayout(totalLogicalQubits, config.couplingMap, config.nQubits);
  const physToLogical = new Map<number, number>();
  logicalToPhys.forEach((p, l) => physToLogical.set(p, l));

  const hasBasis = (g: string) => config.basisGates.includes(g.toLowerCase());
  const native2q: 'cz' | 'ecr' | 'cx' = hasBasis('cz')
    ? 'cz'
    : hasBasis('ecr')
      ? 'ecr'
      : 'cx';
  const useBasis1q = hasBasis('rz') && hasBasis('sx');

  const isaLines: string[] = [
    'OPENQASM 3.0;',
    'include "stdgates.inc";',
    `bit[${totalClassicalBits}] c;`,
  ];
  let gateCount = 0;

  const qRef = (phys: number) => `$${phys}`;

  const emitRz = (phys: number, angle: number) => {
    const s = fmtAngle(angle);
    if (s === '0') return;
    if (!useBasis1q && hasBasis('u1')) {
      isaLines.push(`u1(${s}) ${qRef(phys)};`);
    } else if (!useBasis1q && hasBasis('u3')) {
      isaLines.push(`u3(0, 0, ${s}) ${qRef(phys)};`);
    } else {
      isaLines.push(`rz(${s}) ${qRef(phys)};`);
    }
    gateCount++;
  };

  const emitSx = (phys: number) => {
    if (!useBasis1q && hasBasis('u3')) {
      isaLines.push(`u3(${fmtAngle(Math.PI / 2)}, ${fmtAngle(-Math.PI / 2)}, ${fmtAngle(Math.PI / 2)}) ${qRef(phys)};`);
    } else {
      isaLines.push(`sx ${qRef(phys)};`);
    }
    gateCount++;
  };

  const emitX = (phys: number) => {
    if (hasBasis('x')) {
      isaLines.push(`x ${qRef(phys)};`);
      gateCount++;
    } else if (!useBasis1q && hasBasis('u3')) {
      isaLines.push(`u3(${fmtAngle(Math.PI)}, 0, ${fmtAngle(Math.PI)}) ${qRef(phys)};`);
      gateCount++;
    } else {
      emitSx(phys);
      emitSx(phys);
    }
  };

  const emitH = (phys: number) => {
    if (!useBasis1q && hasBasis('h')) {
      isaLines.push(`h ${qRef(phys)};`);
      gateCount++;
      return;
    }
    if (!useBasis1q && hasBasis('u3')) {
      isaLines.push(`u3(${fmtAngle(Math.PI / 2)}, 0, ${fmtAngle(Math.PI)}) ${qRef(phys)};`);
      gateCount++;
      return;
    }
    emitRz(phys, Math.PI / 2);
    emitSx(phys);
    emitRz(phys, Math.PI / 2);
  };

  const emitU = (phys: number, th: number, ph: number, la: number) => {
    if (!useBasis1q && hasBasis('u3')) {
      isaLines.push(`u3(${fmtAngle(th)}, ${fmtAngle(ph)}, ${fmtAngle(la)}) ${qRef(phys)};`);
      gateCount++;
      return;
    }
    // Verified identity: U(th, ph, la) = rz(la) -> sx -> rz(th + pi) -> sx -> rz(ph + pi)
    emitRz(phys, la);
    emitSx(phys);
    emitRz(phys, th + Math.PI);
    emitSx(phys);
    emitRz(phys, ph + Math.PI);
  };

  const emit1QGate = (phys: number, name: string, params: number[]) => {
    switch (name) {
      case 'id':
      case 'i':
        return;
      case 'x':
        emitX(phys);
        return;
      case 'y':
        emitRz(phys, Math.PI);
        emitX(phys);
        return;
      case 'z':
        emitRz(phys, Math.PI);
        return;
      case 'h':
        emitH(phys);
        return;
      case 's':
        emitRz(phys, Math.PI / 2);
        return;
      case 'sdg':
        emitRz(phys, -Math.PI / 2);
        return;
      case 't':
        emitRz(phys, Math.PI / 4);
        return;
      case 'tdg':
        emitRz(phys, -Math.PI / 4);
        return;
      case 'sx':
        emitSx(phys);
        return;
      case 'sxdg':
        emitRz(phys, Math.PI);
        emitSx(phys);
        emitRz(phys, Math.PI);
        return;
      case 'rz':
      case 'p':
      case 'u1':
        emitRz(phys, params[0] ?? 0);
        return;
      case 'ry': {
        const th = params[0] ?? 0;
        // Verified identity: RY(t) = sx -> rz(t + pi) -> sx -> rz(pi)
        emitSx(phys);
        emitRz(phys, th + Math.PI);
        emitSx(phys);
        emitRz(phys, Math.PI);
        return;
      }
      case 'rx': {
        const th = params[0] ?? 0;
        // Verified identity: RX(t) = rz(pi/2) -> sx -> rz(t + pi) -> sx -> rz(pi/2)
        emitRz(phys, Math.PI / 2);
        emitSx(phys);
        emitRz(phys, th + Math.PI);
        emitSx(phys);
        emitRz(phys, Math.PI / 2);
        return;
      }
      case 'u2':
        emitU(phys, Math.PI / 2, params[0] ?? 0, params[1] ?? 0);
        return;
      case 'u3':
      case 'u':
        emitU(phys, params[0] ?? 0, params[1] ?? 0, params[2] ?? 0);
        return;
      default:
        throw new Error(`Gate 1-qubit non supportato dal transpiler: "${name}"`);
    }
  };

  const emitNativeAdjacentCx = (pCtrl: number, pTarg: number) => {
    if (native2q === 'cz') {
      // CZ is symmetric: CX(c, t) = H(t) -> CZ(c, t) -> H(t)
      emitH(pTarg);
      isaLines.push(`cz ${qRef(pCtrl)}, ${qRef(pTarg)};`);
      gateCount++;
      emitH(pTarg);
      return;
    }

    if (native2q === 'ecr') {
      // Verified identity: CX(c, t) = X(c), SX(t) -> ECR(c, t) -> RZ(pi/2, c)
      const hasForward = directedEdges.size === 0 || directedEdges.has(`${pCtrl}->${pTarg}`);
      if (hasForward) {
        emitX(pCtrl);
        emitSx(pTarg);
        isaLines.push(`ecr ${qRef(pCtrl)}, ${qRef(pTarg)};`);
        gateCount++;
        emitRz(pCtrl, Math.PI / 2);
      } else {
        // Flip CX direction using Hadamards
        emitH(pCtrl);
        emitH(pTarg);
        emitX(pTarg);
        emitSx(pCtrl);
        isaLines.push(`ecr ${qRef(pTarg)}, ${qRef(pCtrl)};`);
        gateCount++;
        emitRz(pTarg, Math.PI / 2);
        emitH(pCtrl);
        emitH(pTarg);
      }
      return;
    }

    // Native CX
    const hasForward = directedEdges.size === 0 || directedEdges.has(`${pCtrl}->${pTarg}`);
    if (hasForward) {
      isaLines.push(`cx ${qRef(pCtrl)}, ${qRef(pTarg)};`);
      gateCount++;
    } else {
      emitH(pCtrl);
      emitH(pTarg);
      isaLines.push(`cx ${qRef(pTarg)}, ${qRef(pCtrl)};`);
      gateCount++;
      emitH(pCtrl);
      emitH(pTarg);
    }
  };

  const emitNativeAdjacentSwap = (pA: number, pB: number) => {
    emitNativeAdjacentCx(pA, pB);
    emitNativeAdjacentCx(pB, pA);
    emitNativeAdjacentCx(pA, pB);
    // Update logical <-> physical tracking if tracked
    const logA = physToLogical.get(pA);
    const logB = physToLogical.get(pB);
    if (logA !== undefined) {
      logicalToPhys[logA] = pB;
      physToLogical.set(pB, logA);
    } else {
      physToLogical.delete(pB);
    }
    if (logB !== undefined) {
      logicalToPhys[logB] = pA;
      physToLogical.set(pA, logB);
    } else {
      physToLogical.delete(pA);
    }
  };

  const emitAdjacent2Q = (pA: number, pB: number, name: string, params: number[]) => {
    switch (name) {
      case 'cx':
        emitNativeAdjacentCx(pA, pB);
        return;
      case 'cz':
        if (native2q === 'cz') {
          isaLines.push(`cz ${qRef(pA)}, ${qRef(pB)};`);
          gateCount++;
        } else {
          emitH(pB);
          emitNativeAdjacentCx(pA, pB);
          emitH(pB);
        }
        return;
      case 'cp':
      case 'cu1': {
        const phi = params[0] ?? 0;
        emitRz(pA, phi / 2);
        emitRz(pB, phi / 2);
        emitNativeAdjacentCx(pA, pB);
        emitRz(pB, -phi / 2);
        emitNativeAdjacentCx(pA, pB);
        return;
      }
      case 'rzz': {
        const theta = params[0] ?? 0;
        emitNativeAdjacentCx(pA, pB);
        emitRz(pB, theta);
        emitNativeAdjacentCx(pA, pB);
        return;
      }
      case 'ecr':
        if (native2q === 'ecr' && (directedEdges.size === 0 || directedEdges.has(`${pA}->${pB}`))) {
          isaLines.push(`ecr ${qRef(pA)}, ${qRef(pB)};`);
          gateCount++;
        } else {
          // ECR(a, b) via RZX(pi/4) X(a) RZX(-pi/4) = decompose into CX
          // RZX(t) = H(b) RZZ(t) H(b)
          emitH(pB);
          emitNativeAdjacentCx(pA, pB);
          emitRz(pB, -Math.PI / 4);
          emitNativeAdjacentCx(pA, pB);
          emitH(pB);
          emitX(pA);
          emitH(pB);
          emitNativeAdjacentCx(pA, pB);
          emitRz(pB, Math.PI / 4);
          emitNativeAdjacentCx(pA, pB);
          emitH(pB);
        }
        return;
      case 'cry': {
        const theta = params[0] ?? 0;
        // Verified identity: CRY(t, c, targ) = RY(t/2, targ) -> CX(c, targ) -> RY(-t/2, targ) -> CX(c, targ)
        emit1QGate(pB, 'ry', [theta / 2]);
        emitNativeAdjacentCx(pA, pB);
        emit1QGate(pB, 'ry', [-theta / 2]);
        emitNativeAdjacentCx(pA, pB);
        return;
      }
      case 'crz': {
        const theta = params[0] ?? 0;
        emitRz(pB, theta / 2);
        emitNativeAdjacentCx(pA, pB);
        emitRz(pB, -theta / 2);
        emitNativeAdjacentCx(pA, pB);
        return;
      }
      case 'swap':
        emitNativeAdjacentSwap(pA, pB);
        return;
      default:
        throw new Error(`Gate 2-qubit non supportato dal transpiler: "${name}"`);
    }
  };

  for (const op of ops) {
    if (op.kind === '1q') {
      const p = logicalToPhys[op.qubits[0]];
      emit1QGate(p, op.name, op.params);
    } else if (op.kind === '2q') {
      const lA = op.qubits[0];
      const lB = op.qubits[1];
      let pA = logicalToPhys[lA];
      let pB = logicalToPhys[lB];

      if (config.couplingMap.length > 0 && !undirectedAdj.get(pA)?.has(pB)) {
        const path = findShortestPath(pA, pB, undirectedAdj);
        if (!path || path.length < 2) {
          throw new Error(`Impossibile instradare i qubit fisici $${pA} e $${pB} su "${config.backendName}".`);
        }
        for (let i = 0; i < path.length - 2; i++) {
          emitNativeAdjacentSwap(path[i], path[i + 1]);
        }
        pA = logicalToPhys[lA];
        pB = logicalToPhys[lB];
      }

      emitAdjacent2Q(pA, pB, op.name, op.params);
    } else if (op.kind === 'reset') {
      const p = logicalToPhys[op.qubits[0]];
      isaLines.push(`reset ${qRef(p)};`);
    } else if (op.kind === 'measure') {
      const p = logicalToPhys[op.qubits[0]];
      const cbit = op.cbit ?? op.qubits[0];
      isaLines.push(`c[${cbit}] = measure ${qRef(p)};`);
    }
  }

  return {
    numLogicalQubits: totalLogicalQubits,
    numClassicalBits: totalClassicalBits,
    isaQasm: isaLines.join('\n'),
    logicalToPhysical: logicalToPhys,
    gateCount,
  };
}

// =========================================================================
// REAL IBM QUANTUM JOB SUBMISSION, POLLING & SAMPLER V2 RESULT EXTRACTION
// =========================================================================
export async function submitRealIbmJob(params: {
  apiKey: string;
  code: string;
  preferredBackend?: string;
  shots?: number;
  overrideCrn?: string;
}) {
  const shots = Number(params.shots || 1024);

  // 1. Pre-flight syntax & parameter validation BEFORE authenticating or hitting IBM servers
  const validation = validateOpenQasmSyntax(params.code, shots);
  if (!validation.valid) {
    throw new Error(`Validazione OpenQASM fallita: ${validation.error}`);
  }

  // 2. Authenticate IAM token & auto-discover active Quantum CRN instance
  const bearerToken = await exchangeIamToken(params.apiKey);

  let serviceCrn = (params.overrideCrn || '').trim();
  let instanceName = 'IBM Quantum Instance';
  let discoveredInstances: IbmQuantumInstance[] = [];
  if (!serviceCrn) {
    discoveredInstances = await discoverQuantumInstances(bearerToken);
    serviceCrn = discoveredInstances[0].crn;
    instanceName = discoveredInstances[0].name;
  }

  // 3. Select target backend (fallback across discovered instances if first has 0 backends)
  const requiredQubits = validation.numQubits;
  let selection: Awaited<ReturnType<typeof selectTargetBackend>> | null = null;
  if (discoveredInstances.length > 1 && !params.overrideCrn) {
    let lastSelectErr: any = null;
    for (const inst of discoveredInstances) {
      try {
        selection = await selectTargetBackend(bearerToken, inst.crn, requiredQubits, params.preferredBackend);
        serviceCrn = inst.crn;
        instanceName = inst.name;
        break;
      } catch (e: any) {
        lastSelectErr = e;
      }
    }
    if (!selection) {
      throw lastSelectErr;
    }
  } else {
    selection = await selectTargetBackend(bearerToken, serviceCrn, requiredQubits, params.preferredBackend);
  }

  const { summary, config, allBackends } = selection;

  // 4. Transpile logical OpenQASM to target QPU physical ISA
  const transpiled = transpileOpenQasmToIsa(params.code, config);

  const jobPayload = {
    program_id: 'sampler',
    backend: config.backendName,
    params: {
      pubs: [[transpiled.isaQasm, null, shots]],
      version: 2,
    },
  };

  const created = await ibmQuantumRequest<any>(
    'POST',
    '/jobs',
    bearerToken,
    serviceCrn,
    jobPayload
  );

  const jobId = created?.id || created?.job_id;
  if (!jobId) {
    throw new Error('IBM Quantum API non ha restituito un Job ID valido.');
  }

  return {
    jobId: String(jobId),
    backend: config.backendName,
    isSimulator: summary.isSimulator,
    queueLength: summary.queueLength,
    backendQubits: config.nQubits,
    basisGates: config.basisGates,
    serviceCrn,
    instanceName,
    isaQasm: transpiled.isaQasm,
    numBits: transpiled.numClassicalBits,
    numLogicalQubits: transpiled.numLogicalQubits,
    gateCount: transpiled.gateCount,
    shots,
    state: String(created?.state || created?.status || 'Queued'),
    allBackends,
  };
}

function parseSamplesToCounts(resultsPayload: any, numBitsFallback: number): {
  counts: Record<string, number>;
  totalShots: number;
} {
  const counts: Record<string, number> = {};
  let totalShots = 0;

  const firstResult = Array.isArray(resultsPayload?.results) ? resultsPayload.results[0] : null;
  const dataObj = firstResult?.data || resultsPayload?.data;

  if (dataObj && typeof dataObj === 'object') {
    // Find first classical register key (e.g., 'c', 'meas', etc.)
    const regKey = Object.keys(dataObj).find(
      (k) => Array.isArray(dataObj[k]?.samples) || dataObj[k]?.counts
    );
    const regData = regKey ? dataObj[regKey] : null;

    if (regData && Array.isArray(regData.samples)) {
      const bitWidth = Number(regData.num_bits || numBitsFallback || 2);
      for (const sample of regData.samples) {
        let bitstring: string;
        if (typeof sample === 'string') {
          const s = sample.trim();
          if (s.startsWith('0x') || s.startsWith('0X')) {
            const val = BigInt(s);
            bitstring = val.toString(2).padStart(bitWidth, '0');
          } else {
            bitstring = s.padStart(bitWidth, '0');
          }
        } else if (typeof sample === 'number') {
          bitstring = sample.toString(2).padStart(bitWidth, '0');
        } else {
          continue;
        }
        counts[bitstring] = (counts[bitstring] || 0) + 1;
        totalShots++;
      }
      if (totalShots > 0) {
        return { counts, totalShots };
      }
    }

    if (regData?.counts && typeof regData.counts === 'object') {
      const bitWidth = Number(regData.num_bits || numBitsFallback || 2);
      for (const [k, v] of Object.entries(regData.counts)) {
        const bs = k.startsWith('0x') || k.startsWith('0X')
          ? BigInt(k).toString(2).padStart(bitWidth, '0')
          : k.padStart(bitWidth, '0');
        const n = Number(v || 0);
        counts[bs] = (counts[bs] || 0) + n;
        totalShots += n;
      }
      if (totalShots > 0) {
        return { counts, totalShots };
      }
    }
  }

  // Fallback legacy quasidists / counts at top-level
  const rawCounts = resultsPayload?.counts || firstResult?.counts;
  if (rawCounts && typeof rawCounts === 'object') {
    for (const [k, v] of Object.entries(rawCounts)) {
      const bs = k.startsWith('0x') || k.startsWith('0X')
        ? BigInt(k).toString(2).padStart(numBitsFallback, '0')
        : k.padStart(numBitsFallback, '0');
      const n = Number(v || 0);
      counts[bs] = (counts[bs] || 0) + n;
      totalShots += n;
    }
  }

  if (totalShots === 0) {
    throw new Error('Risultati ricevuti da IBM Quantum in un formato non riconosciuto.');
  }

  return { counts, totalShots };
}

export async function pollRealIbmJobStatus(params: {
  apiKey: string;
  jobId: string;
  crn: string;
  numBits?: number;
}) {
  const bearerToken = await exchangeIamToken(params.apiKey);
  const jobInfo = await ibmQuantumRequest<any>(
    'GET',
    `/jobs/${encodeURIComponent(params.jobId)}`,
    bearerToken,
    params.crn
  );

  const rawState = String(
    typeof jobInfo?.state === 'string'
      ? jobInfo.state
      : jobInfo?.state?.status || jobInfo?.status || 'Queued'
  );
  const normalizedUpper = rawState.toUpperCase();
  const reason: string | null =
    jobInfo?.state?.reason || jobInfo?.reason || jobInfo?.error?.message || null;

  if (normalizedUpper === 'COMPLETED' || normalizedUpper === 'DONE') {
    const rawResults = await ibmQuantumRequest<any>(
      'GET',
      `/jobs/${encodeURIComponent(params.jobId)}/results`,
      bearerToken,
      params.crn
    );
    const { counts, totalShots } = parseSamplesToCounts(rawResults, params.numBits || 2);
    return {
      status: 'COMPLETED' as const,
      rawState,
      reason: null,
      backend: jobInfo?.backend || null,
      counts,
      totalShots,
    };
  }

  if (normalizedUpper === 'FAILED' || normalizedUpper === 'ERROR') {
    return {
      status: 'FAILED' as const,
      rawState,
      reason: reason || 'Esecuzione fallita su IBM Quantum.',
      backend: jobInfo?.backend || null,
      counts: null,
      totalShots: 0,
    };
  }

  if (normalizedUpper === 'CANCELLED' || normalizedUpper === 'CANCELED') {
    return {
      status: 'CANCELLED' as const,
      rawState,
      reason: reason || 'Job annullato su IBM Quantum.',
      backend: jobInfo?.backend || null,
      counts: null,
      totalShots: 0,
    };
  }

  const mappedStatus =
    normalizedUpper.includes('RUN') || normalizedUpper.includes('PROGRESS')
      ? ('RUNNING' as const)
      : ('QUEUED' as const);

  return {
    status: mappedStatus,
    rawState,
    reason,
    backend: jobInfo?.backend || null,
    counts: null,
    totalShots: 0,
  };
}
