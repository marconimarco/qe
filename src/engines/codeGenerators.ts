import { resolveSectorKey } from './demoCsv';

export const SOGLIA_CRITICA_RIGIDA = 0.60;
export const MAX_QUANTUM_QUBITS = 127;

export interface ParsedRisorsa {
  id: string;
  nome: string;
  peso: number;
}

export interface ParsedRelazione {
  id_controllo: number;
  id_target: number;
  valore_peso: number;
  nome_controllo: string;
  nome_target: string;
}

export interface MatrixValidationResult {
  valido: boolean;
  reason: string;
  righe: number;
  colonne: number;
  relazioniAttive: number;
}

export function cleanNumericValue(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return isNaN(val) || !isFinite(val) ? null : val;
  }
  let s = String(val).trim();
  if (!s) return null;
  s = s.replace(/^[€$£¥\s]+|[€$£¥\s]+$/g, '');
  const isPercent = s.includes('%');
  s = s.replace(/%/g, '').trim();
  if (s.includes(',') && s.includes('.')) {
    if (s.indexOf('.') < s.indexOf(',')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  if (!/^[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?$/.test(s)) return null;
  const parsed = parseFloat(s);
  if (isNaN(parsed) || !isFinite(parsed)) return null;
  return isPercent ? parsed / 100.0 : parsed;
}

function stripBom(s: string): string {
  return (s || '').replace(/^\uFEFF/, '');
}

function detectSeparator(csv: string): string {
  const lines = stripBom(csv)
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));
  if (lines.length === 0) return ',';
  let countComma = 0;
  let countSemi = 0;
  let countTab = 0;
  for (const line of lines.slice(0, 5)) {
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') inQuotes = !inQuotes;
      else if (!inQuotes) {
        if (ch === ',') countComma++;
        else if (ch === ';') countSemi++;
        else if (ch === '\t') countTab++;
      }
    }
  }
  if (countTab > countComma && countTab > countSemi) return '\t';
  return countSemi > countComma ? ';' : ',';
}

function splitCsvLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === sep && !inQuotes) {
      out.push(cur.trim().replace(/^["']|["']$/g, ''));
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim().replace(/^["']|["']$/g, ''));
  return out;
}

const KNOWN_ID_HEADERS = [
  'id_risorsa',
  'id',
  'risorsa',
  'asset',
  'asset_id',
  'codice',
  'code',
  'nodo',
  'node',
  'ticker',
  'item',
  'nome_risorsa',
  'nome',
  'name',
  'entity',
  'entita',
];

const KNOWN_WEIGHT_HEADERS = [
  'priorita_peso',
  'peso',
  'weight',
  'score',
  'punteggio',
  'probabilita',
  'probability',
  'prob',
  'rendimento',
  'return',
  'valore',
  'value',
  'rischio',
  'risk',
  'impatto',
  'impact',
  'copertura',
  'coverage',
  'priority',
  'importanza',
];

export function parseCsv1Deterministic(csv1: string): {
  risorse: ParsedRisorsa[];
  mappaQubit: Map<string, number>;
} {
  const clean = stripBom(csv1);
  const lines = clean
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));

  if (lines.length < 2) {
    throw new Error('File 1 CSV vuoto o privo di righe dati oltre all’intestazione.');
  }

  const sep = detectSeparator(clean);
  const headersRaw = splitCsvLine(lines[0], sep);
  const headers = headersRaw.map(h => h.toLowerCase().trim());

  let idColIndex = headers.findIndex(h => KNOWN_ID_HEADERS.includes(h));
  if (idColIndex === -1) {
    idColIndex = headers.findIndex(h =>
      KNOWN_ID_HEADERS.some(k => h.includes(k))
    );
  }
  if (idColIndex === -1) {
    idColIndex = 0;
  }

  let nomeColIndex = headers.findIndex(
    (h, idx) =>
      idx !== idColIndex &&
      (h.includes('nome') || h.includes('name') || h.includes('descriz') || h.includes('label'))
  );
  if (nomeColIndex === -1) {
    nomeColIndex = idColIndex;
  }

  let pesoColIndex = headers.findIndex(h => KNOWN_WEIGHT_HEADERS.includes(h));
  if (pesoColIndex === -1) {
    pesoColIndex = headers.findIndex(
      (h, idx) =>
        idx !== idColIndex &&
        KNOWN_WEIGHT_HEADERS.some(k => h.includes(k))
    );
  }
  if (pesoColIndex === -1) {
    throw new Error(
      `Colonna peso/priorità non riconosciuta nel File 1. Usa una colonna tra: ${KNOWN_WEIGHT_HEADERS.slice(0, 6).join(', ')}.`
    );
  }

  const risorse: ParsedRisorsa[] = [];
  const mappaQubit = new Map<string, number>();

  for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
    const cols = splitCsvLine(lines[rowIdx], sep);
    if (cols.every(c => c === '')) continue;

    const rawId = (cols[idColIndex] || '').trim();
    if (!rawId) {
      throw new Error(`Riga ${rowIdx + 1}: ID risorsa mancante.`);
    }

    const rawPeso = cols[pesoColIndex];
    const parsedPeso = cleanNumericValue(rawPeso);
    if (parsedPeso === null) {
      throw new Error(
        `Riga ${rowIdx + 1} (${rawId}): valore numerico non valido nella colonna "${headersRaw[pesoColIndex]}": "${rawPeso ?? ''}".`
      );
    }

    // Normalize 0..100 scale cleanly into [0, 1], otherwise clamp strictly to [0, 1]
    let normalizedPeso = parsedPeso;
    if (normalizedPeso > 1.0 && normalizedPeso <= 100.0) {
      normalizedPeso = normalizedPeso / 100.0;
    }
    normalizedPeso = Math.max(0.0, Math.min(1.0, normalizedPeso));

    const nome = (cols[nomeColIndex] || rawId).trim() || rawId;
    const qubitIndex = risorse.length;

    risorse.push({
      id: rawId,
      nome,
      peso: Number(normalizedPeso.toFixed(6)),
    });

    mappaQubit.set(rawId, qubitIndex);
    mappaQubit.set(rawId.toLowerCase(), qubitIndex);
  }

  if (risorse.length === 0) {
    throw new Error('Nessuna risorsa valida trovata nel File 1 CSV.');
  }

  return { risorse, mappaQubit };
}

export function classifyUploadedCsv(
  csv: string,
  fileName: string
): 'anagrafica' | 'matrice' | 'unknown' {
  const clean = stripBom(csv);
  const lines = clean
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));
  if (lines.length < 2) return 'unknown';

  const sep = detectSeparator(clean);
  const headers = splitCsvLine(lines[0], sep).map(h => h.toLowerCase().trim());

  const hasWeightHeader = headers.some(h =>
    KNOWN_WEIGHT_HEADERS.some(k => h === k || h.includes(k))
  );
  if (hasWeightHeader && !headers.some(h => h.includes('matrice'))) {
    return 'anagrafica';
  }

  // Check if square adjacency/correlation matrix: header IDs overlap row 0 IDs
  const colIds = headers.slice(1).filter(Boolean);
  const rowIds = lines
    .slice(1)
    .map(l => splitCsvLine(l, sep)[0]?.toLowerCase().trim())
    .filter(Boolean);

  if (colIds.length >= 2 && rowIds.length >= 2) {
    const overlap = rowIds.filter(r => colIds.includes(r)).length;
    if (overlap >= Math.min(2, rowIds.length)) {
      return 'matrice';
    }
  }

  const lowerName = (fileName || '').toLowerCase();
  if (
    lowerName.includes('matric') ||
    lowerName.includes('matrix') ||
    lowerName.includes('conness') ||
    lowerName.includes('correl') ||
    lowerName.includes('vincol') ||
    lowerName.includes('file2') ||
    lowerName.startsWith('2_')
  ) {
    return 'matrice';
  }
  if (
    lowerName.includes('anagraf') ||
    lowerName.includes('risors') ||
    lowerName.includes('asset') ||
    lowerName.includes('file1') ||
    lowerName.startsWith('1_')
  ) {
    return 'anagrafica';
  }

  return 'unknown';
}

export function validaMatriceFile2(
  csv2: string,
  mappaQubit?: Map<string, number>
): MatrixValidationResult {
  const clean = stripBom(csv2);
  const lines = clean
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));

  if (lines.length < 3) {
    return {
      valido: false,
      reason: 'La matrice File 2 deve contenere intestazione e almeno 2 righe di risorse.',
      righe: Math.max(0, lines.length - 1),
      colonne: 0,
      relazioniAttive: 0,
    };
  }

  const sep = detectSeparator(clean);
  const headerCols = splitCsvLine(lines[0], sep);
  if (headerCols.length < 3) {
    return {
      valido: false,
      reason: 'La matrice File 2 deve avere almeno 3 colonne (colonna ID + almeno 2 colonne risorsa).',
      righe: lines.length - 1,
      colonne: headerCols.length,
      relazioniAttive: 0,
    };
  }

  const colIds = headerCols.slice(1).map(c => c.trim());
  const dataRows = lines.slice(1);
  let relazioniAttive = 0;

  for (let r = 0; r < dataRows.length; r++) {
    const cells = splitCsvLine(dataRows[r], sep);
    const rowId = (cells[0] || '').trim();
    if (!rowId) {
      return {
        valido: false,
        reason: `Riga ${r + 2} della matrice File 2 priva di ID iniziale.`,
        righe: dataRows.length,
        colonne: headerCols.length,
        relazioniAttive: 0,
      };
    }

    if (mappaQubit && mappaQubit.size > 0 && !mappaQubit.has(rowId) && !mappaQubit.has(rowId.toLowerCase())) {
      return {
        valido: false,
        reason: `ID "${rowId}" presente nella matrice File 2 ma non trovato nel File 1 Anagrafica.`,
        righe: dataRows.length,
        colonne: headerCols.length,
        relazioniAttive: 0,
      };
    }

    for (let c = 1; c < headerCols.length; c++) {
      const val = cleanNumericValue(cells[c]);
      if (val === null) {
        return {
          valido: false,
          reason: `Valore non numerico alla riga "${rowId}", colonna "${colIds[c - 1] || c}".`,
          righe: dataRows.length,
          colonne: headerCols.length,
          relazioniAttive: 0,
        };
      }
      if (rowId.toLowerCase() !== (colIds[c - 1] || '').toLowerCase() && Math.abs(val) > 0) {
        relazioniAttive++;
      }
    }
  }

  return {
    valido: true,
    reason: 'OK',
    righe: dataRows.length,
    colonne: headerCols.length,
    relazioniAttive: Math.ceil(relazioniAttive / 2),
  };
}

export function parseCsv2MatrixDeterministic(
  csv2: string,
  risorse: ParsedRisorsa[],
  mappaQubit: Map<string, number>
): number[][] {
  const n = Math.min(risorse.length, MAX_QUANTUM_QUBITS);
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const clean = stripBom(csv2);
  if (!clean.trim() || n === 0) return matrix;

  const lines = clean
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));
  if (lines.length < 2) return matrix;

  const sep = detectSeparator(clean);
  const headers = splitCsvLine(lines[0], sep);

  for (let r = 1; r < lines.length; r++) {
    const cells = splitCsvLine(lines[r], sep);
    const rowId = (cells[0] || '').trim();
    const rowIdx = mappaQubit.get(rowId) ?? mappaQubit.get(rowId.toLowerCase());
    if (rowIdx === undefined || rowIdx >= n) continue;

    for (let c = 1; c < headers.length; c++) {
      const colId = (headers[c] || '').trim();
      const colIdx = mappaQubit.get(colId) ?? mappaQubit.get(colId.toLowerCase());
      if (colIdx === undefined || colIdx >= n || colIdx === rowIdx) continue;

      const parsed = cleanNumericValue(cells[c]);
      if (parsed === null || parsed === 0) continue;
      const absWeight = Math.min(1.0, Math.abs(parsed > 1 && parsed <= 100 ? parsed / 100 : parsed));
      matrix[rowIdx][colIdx] = absWeight;
    }
  }

  // Symmetrize matrix cleanly and zero diagonal
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 0;
    for (let j = i + 1; j < n; j++) {
      const a = matrix[i][j];
      const b = matrix[j][i];
      const sym = a > 0 && b > 0 ? (a + b) / 2 : Math.max(a, b);
      const rounded = Number(sym.toFixed(6));
      matrix[i][j] = rounded;
      matrix[j][i] = rounded;
    }
  }

  return matrix;
}

function extractRelations(
  risorse: ParsedRisorsa[],
  matrix: number[][]
): ParsedRelazione[] {
  const n = Math.min(risorse.length, matrix.length, MAX_QUANTUM_QUBITS);
  const rels: ParsedRelazione[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const w = matrix[i]?.[j] ?? 0;
      if (w > 0) {
        rels.push({
          id_controllo: i,
          id_target: j,
          valore_peso: w,
          nome_controllo: risorse[i].id,
          nome_target: risorse[j].id,
        });
      }
    }
  }
  return rels;
}

function sanitizePythonLabel(s: string): string {
  return (s || 'Enterprise')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48) || 'Enterprise';
}

export function generateQiskitCode(
  sector: string,
  csv1: string,
  csv2: string,
  vincolo: string,
  strategy: string
): string {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const activeRisorse = risorse.slice(0, MAX_QUANTUM_QUBITS);
  const N = activeRisorse.length;
  const matrix = parseCsv2MatrixDeterministic(csv2, activeRisorse, mappaQubit);
  const relations = extractRelations(activeRisorse, matrix);

  const isNone =
    vincolo === 'nessun_vincolo' ||
    vincolo.includes('nessun') ||
    vincolo.includes('none') ||
    relations.length === 0;
  const isHardMode =
    !isNone &&
    (vincolo === 'blocco_rigido' || vincolo.includes('rigido') || vincolo.includes('hard'));

  const lines: string[] = [
    'OPENQASM 3.0;',
    'include "stdgates.inc";',
    `// Settore: ${sector || 'Enterprise'} | Strategia: ${strategy || 'Prudente'}`,
    `// Qubit Allocati (FIFO File 1): ${N} (limite hardware IBM Utility: ${MAX_QUANTUM_QUBITS})`,
    `qubit[${N}] q;`,
    `bit[${N}] c;`,
    '',
    '// 1. Inizializzazione ampiezze tramite rotazione esatta theta = 2 * arcsin(sqrt(peso))',
  ];

  activeRisorse.forEach((r, idx) => {
    const p = Math.max(0.0, Math.min(1.0, r.peso));
    const theta = (2.0 * Math.asin(Math.sqrt(p))).toFixed(6);
    const pct = (p * 100).toFixed(2);
    lines.push(`ry(${theta}) q[${idx}]; // ${r.id} (Copertura/Peso ${pct}%)`);
  });

  lines.push('');
  if (isNone) {
    lines.push('// 2. Topologia vincoli: Risorse indipendenti (stato separabile puro)');
  } else if (isHardMode) {
    const hardRels = relations.filter(rel => rel.valore_peso >= SOGLIA_CRITICA_RIGIDA);
    lines.push(`// 2. Blocco Rigido (CX) su relazioni critiche con peso >= ${SOGLIA_CRITICA_RIGIDA.toFixed(2)}`);
    if (hardRels.length === 0) {
      lines.push('// Nessuna relazione >= 0.60 trovata nella Matrice File 2.');
    } else {
      hardRels.forEach(rel => {
        lines.push(
          `cx q[${rel.id_controllo}], q[${rel.id_target}]; // ${rel.nome_controllo} <-> ${rel.nome_target} (peso=${rel.valore_peso.toFixed(2)})`
        );
      });
    }
  } else {
    lines.push('// 2. Legame Morbido (CP - Continuous Phase) da Matrice File 2');
    relations.forEach(rel => {
      const phiAngle = ((Math.PI / 2.0) * rel.valore_peso).toFixed(6);
      lines.push(
        `cp(${phiAngle}) q[${rel.id_controllo}], q[${rel.id_target}]; // ${rel.nome_controllo} <-> ${rel.nome_target} (peso=${rel.valore_peso.toFixed(2)})`
      );
    });
  }

  lines.push('');
  lines.push('// 3. Misurazione finale su registro classico');
  for (let i = 0; i < N; i++) {
    lines.push(`c[${i}] = measure q[${i}];`);
  }

  return lines.join('\n');
}

export function generateQiskitPythonCode(
  sector: string,
  csv1: string,
  csv2: string,
  vincolo: string,
  strategy: string,
  file1Name: string = '1_anagrafica_risorse.csv',
  file2Name: string = '2_matrice_connessioni.csv',
  isDemo: boolean = true
): string {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const truncated = risorse.length > MAX_QUANTUM_QUBITS;
  const activeRisorse = risorse.slice(0, MAX_QUANTUM_QUBITS);
  const matrix = parseCsv2MatrixDeterministic(csv2, activeRisorse, mappaQubit);
  const relations = extractRelations(activeRisorse, matrix);

  const isNone =
    vincolo === 'nessun_vincolo' ||
    vincolo.includes('nessun') ||
    vincolo.includes('none') ||
    relations.length === 0;
  const isHardMode =
    !isNone &&
    (vincolo === 'blocco_rigido' || vincolo.includes('rigido') || vincolo.includes('hard'));

  const appliedRelations = isNone
    ? []
    : isHardMode
    ? relations.filter(r => r.valore_peso >= SOGLIA_CRITICA_RIGIDA)
    : relations;

  const circuitLiteral = `QC_${sanitizePythonLabel(sector)}_${sanitizePythonLabel(strategy)}`;
  const sourceTag = isDemo ? '[DEMO]' : '[UPLOAD]';
  const sectorKey = resolveSectorKey(sector);
  const weightsPayload = activeRisorse.map((r, idx) => ({
    qubit: idx,
    id: r.id,
    nome: r.nome,
    peso: r.peso,
    theta_rad: Number((2.0 * Math.asin(Math.sqrt(r.peso))).toFixed(6)),
  }));

  return `# ==============================================================================
# MOTORE QUANTISTICO DETERMINISTICO V4 (QISKIT 1.x/2.x PRIMITIVES V2 + MARKOWITZ SLSQP)
# Settore: ${sector} (${sectorKey}) | Strategia: ${strategy}
# Origine Dati ${sourceTag}: File 1="${file1Name}" | File 2="${file2Name || 'Nessuna matrice'}"
# ==============================================================================
import numpy as np
from scipy.optimize import minimize
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.primitives import StatevectorSampler
from qiskit.qasm3 import dumps as qasm3_dumps

${truncated ? `# AVVISO HARDWARE IBM (${MAX_QUANTUM_QUBITS} QUBIT): il dataset aveva ${risorse.length} righe, troncato a ${MAX_QUANTUM_QUBITS} qubit per la QPU mentre SLSQP elabora i dati estratti.` : ''}
risorse_input = ${JSON.stringify(weightsPayload, null, 2)}
sigma_matrix = np.array(${JSON.stringify(matrix)}, dtype=float)
relazioni_vincoli = ${JSON.stringify(appliedRelations)}
modalita_entanglement = "${isNone ? 'nessun_vincolo' : isHardMode ? 'blocco_rigido_cx' : 'legame_morbido_cp'}"

num_qubits = min(len(risorse_input), ${MAX_QUANTUM_QUBITS})
q = QuantumRegister(num_qubits, "q")
c = ClassicalRegister(num_qubits, "c")
qc = QuantumCircuit(q, c, name="${circuitLiteral}")

# 1. Inizializzazione deterministica RY: theta = 2 * arcsin(sqrt(peso))
thetas = [float(item["theta_rad"]) for item in risorse_input[:num_qubits]]
for idx, theta_val in enumerate(thetas):
    qc.ry(theta_val, q[idx])

# 2. Applicazione vincoli reali estratti dal File 2
if modalita_entanglement == "blocco_rigido_cx":
    for rel in relazioni_vincoli:
        qc.cx(q[rel["id_controllo"]], q[rel["id_target"]])
elif modalita_entanglement == "legame_morbido_cp":
    for rel in relazioni_vincoli:
        qc.cp((np.pi / 2.0) * float(rel["valore_peso"]), q[rel["id_controllo"]], q[rel["id_target"]])

qc.measure(q, c)

# 3. Esecuzione campionamento quantistico (Primitives V2)
sampler = StatevectorSampler()
job = sampler.run([qc], shots=1024)
pub_result = job.result()[0]
counts = pub_result.data.c.get_counts()
stato_dominante, freq_dominante = max(counts.items(), key=lambda kv: kv[1])

print(f"${sourceTag} Circuito compilato: {qc.name} | Qubit: {num_qubits}")
print(f"Stato Dominante (Campione piu Frequente su 1024 shots): |{stato_dominante}> ({freq_dominante / 10.24:.2f}%)")

# 4. Ottimizzazione Classica di Supporto (Markowitz / SLSQP su Matrice File 2)
mu = np.array([float(item["peso"]) for item in risorse_input[:num_qubits]], dtype=float)
cov = sigma_matrix + np.eye(num_qubits) * 0.15

def neg_sharpe(weights, mu_vec, cov_mat, rf=0.02):
    ret = float(np.dot(weights, mu_vec))
    vol = float(np.sqrt(max(1e-12, np.dot(weights.T, np.dot(cov_mat, weights)))))
    return -(ret - rf) / vol

x0 = np.ones(num_qubits) / num_qubits
bounds = tuple((0.0, 1.0) for _ in range(num_qubits))
constraints = ({"type": "eq", "fun": lambda w: np.sum(w) - 1.0},)
opt = minimize(neg_sharpe, x0, args=(mu, cov), method="SLSQP", bounds=bounds, constraints=constraints)
opt_weights = opt.x if opt.success else x0
sharpe_ratio = -neg_sharpe(opt_weights, mu, cov)

print(f"Sharpe Ratio Sistemico SLSQP: {sharpe_ratio:.4f}")
for item, w_opt in zip(risorse_input[:num_qubits], opt_weights):
    print(f"  - {item['id']}: peso_input={item['peso']:.4f} | allocazione_SLSQP={w_opt * 100:.2f}%")

print("\\n--- OPENQASM 3.0 ---")
print(qasm3_dumps(qc))
`;
}

export function generateClassicalHpcPythonCode(
  sector: string,
  scenarioName: string,
  scenarioId: string,
  csv1: string,
  csv2: string,
  strategy: string,
  file1Name: string = '1_anagrafica_risorse.csv',
  file2Name: string = '2_matrice_connessioni.csv',
  isDemo: boolean = true
): string {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const matrix = parseCsv2MatrixDeterministic(csv2, risorse, mappaQubit);
  const sourceTag = isDemo ? '[DEMO]' : '[UPLOAD]';
  const sectorKey = resolveSectorKey(sector, scenarioId);
  const isPrud =
    strategy.toLowerCase().includes('prudent') ||
    strategy.toLowerCase().includes('rischio') ||
    strategy.toLowerCase().includes('tutela');

  const recordsPayload = risorse.map(r => ({
    id: r.id,
    nome: r.nome,
    peso: r.peso,
  }));

  return `# ==============================================================================
# PIPELINE CLASSICA HPC NUMPY / SCIPY SLSQP (ZERO PORTE QUANTISTICHE)
# Settore: ${sector} (${sectorKey}) | Scenario: ${scenarioName} (${scenarioId})
# Strategia: ${strategy}
# Origine Dati ${sourceTag}: File 1="${file1Name}" | File 2="${file2Name || 'Nessuna matrice'}"
# ==============================================================================
import numpy as np
from scipy.optimize import minimize

risorse_reali = ${JSON.stringify(recordsPayload, null, 2)}
matrice_vincoli = np.array(${JSON.stringify(matrix)}, dtype=float)
strategia_prudente = ${isPrud ? 'True' : 'False'}

n = len(risorse_reali)
ids = [r["id"] for r in risorse_reali]
valori_input = np.array([float(r["peso"]) for r in risorse_reali], dtype=float)

# Costruzione matrice di covarianza / interdipendenza regolare dai dati reali
if matrice_vincoli.shape != (n, n):
    sigma = np.eye(n) * 0.20
else:
    sigma = matrice_vincoli * 0.35 + np.eye(n) * 0.20

def objective_fn(weights):
    port_return = float(np.dot(weights, valori_input))
    port_var = float(np.dot(weights.T, np.dot(sigma, weights)))
    port_vol = float(np.sqrt(max(1e-12, port_var)))
    if strategia_prudente:
        # Minimizzazione varianza sistemica pesata su esposizione residua
        return port_var - 0.15 * port_return
    # Massimizzazione Sharpe Ratio (Markowitz)
    return -(port_return - 0.02) / port_vol

x0 = np.ones(n) / max(1, n)
bounds = tuple((0.0, 1.0) for _ in range(n))
constraints = ({"type": "eq", "fun": lambda w: np.sum(w) - 1.0},)

result = minimize(objective_fn, x0, method="SLSQP", bounds=bounds, constraints=constraints)
pesi_ottimi = result.x if result.success else x0

rendimento_atteso = float(np.dot(pesi_ottimi, valori_input))
rischio_stimato = float(np.sqrt(max(1e-12, np.dot(pesi_ottimi.T, np.dot(sigma, pesi_ottimi)))))
sharpe = (rendimento_atteso - 0.02) / max(1e-9, rischio_stimato)

print(f"${sourceTag} Pipeline HPC Completata: ${scenarioName}")
print(f"Solver SLSQP Converged: {result.success} | Sharpe Ratio Sistemico: {sharpe:.4f}")
print(f"Score Medio Ponderato: {rendimento_atteso:.4f} | Volatilita Matrice File 2: {rischio_stimato:.4f}")
for rid, w_in, w_opt in zip(ids, valori_input, pesi_ottimi):
    print(f"  - {rid}: input={w_in:.4f} -> allocazione_ottima={w_opt * 100:.2f}%")
`;
}
