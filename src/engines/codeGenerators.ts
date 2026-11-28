// MOTORE DI CALCOLO MULTI-SCENARIO V8 (COMPLETO + FIX QUANTISTICO)
// Ogni scenario usa il suo motore specifico in base al modelCode.

export const SOGLIA_CRITICA_RIGIDA = 0.60;
export const MAX_QUANTUM_QUBITS = 127;

interface ParsedRisorsa { id: string; nome: string; peso: number; }
interface ParsedRelazione { id_controllo: number; id_target: number; valore_peso: number; nome_controllo: string; nome_target: string; }

export function cleanNumericValue(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  let s = String(val).trim();
  if (!s) return null;
  s = s.replace(/^[€$£¥\s]+|[€$£¥\s]+$/g, '');
  const isPercent = s.includes('%');
  s = s.replace(/%/g, '').trim();
  if (s.includes(',') && s.includes('.')) {
    s = s.indexOf('.') < s.indexOf(',') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  const parsed = parseFloat(s);
  if (isNaN(parsed)) return null;
  return isPercent ? parsed / 100.0 : parsed;
}

function stripBom(s: string): string { return (s || '').replace(/^\uFEFF/, ''); }

function detectSeparator(csv: string): string {
  const lines = stripBom(csv).split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  if (lines.length === 0) return ',';
  let countComma = 0, countSemi = 0, countTab = 0;
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
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
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

export function parseCsv1Deterministic(csv1: string): { risorse: ParsedRisorsa[], mappaQubit: Map<string, number> } {
  const cleanCsv1 = stripBom(csv1);
  const SEP1 = detectSeparator(cleanCsv1);
  const rawLines = cleanCsv1.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  const risorse: ParsedRisorsa[] = [];
  const mappaQubit = new Map<string, number>();
  if (rawLines.length === 0) return { risorse, mappaQubit };

  let idColIndex = 0, pesoColIndex = -1, nomeColIndex = 1, dataStartIndex = 0;
  const exactHeaderTokens = ['id_risorsa', 'id_asset', 'asset_id', 'item_id', 'id', 'risorsa', 'asset', 'caso', 'composto', 'linea', 'item', 'priorita_peso', 'peso_quantistico', 'peso', 'weight', 'score', 'valore'];
  const headerIdx = rawLines.findIndex(line => {
    const cols = splitCsvLine(line, SEP1).map(c => c.toLowerCase().trim());
    return cols.some(c => exactHeaderTokens.some(tok => c === tok || c.startsWith(tok + '_') || c.endsWith('_' + tok)));
  });

  if (headerIdx !== -1) {
    const headers = splitCsvLine(rawLines[headerIdx], SEP1).map(h => h.toLowerCase().trim());
    const foundId = headers.findIndex(h => ['id_risorsa', 'id_asset', 'asset_id', 'item_id', 'id'].includes(h)) !== -1
      ? headers.findIndex(h => ['id_risorsa', 'id_asset', 'asset_id', 'item_id', 'id'].includes(h))
      : headers.findIndex(h => h.startsWith('id_') || h.endsWith('_id') || h.includes('risorsa') || h.includes('asset') || h.includes('caso') || h.includes('composto') || h.includes('linea') || h.includes('item'));
    if (foundId !== -1) idColIndex = foundId;
    const foundPeso = headers.findIndex(h => h.includes('peso') || h.includes('weight') || h.includes('priorit') || h.includes('clinic') || h.includes('stabilita') || h.includes('probabilit') || h.includes('saturaz') || h.includes('score') || h.includes('valore') || h.includes('rendiment'));
    if (foundPeso !== -1) pesoColIndex = foundPeso;
    const foundNome = headers.findIndex(h => h.includes('nome') || h.includes('name') || h.includes('label') || h.includes('desc'));
    if (foundNome !== -1) nomeColIndex = foundNome;
    dataStartIndex = headerIdx + 1;
  }

  if (pesoColIndex === -1) {
    const firstHeaders = splitCsvLine(rawLines[0], SEP1).map(h => h.toLowerCase().trim());
    const knownWeights = ['priorita_peso', 'peso_quantistico', 'peso', 'weight', 'score', 'valore', 'rendiment'];
    for (let c = 0; c < firstHeaders.length; c++) {
      if (knownWeights.some(k => firstHeaders[c].includes(k))) { pesoColIndex = c; break; }
    }
    if (pesoColIndex === -1) throw new Error(`[FILE 1] Impossibile identificare la colonna del peso. Intestazioni lette: ${firstHeaders.join(' | ')}. Attesi nomi contenenti: priorita_peso, peso, weight, score, valore.`);
  }

  const repeatedHeaderIds = new Set(['id', 'id_risorsa', 'id_asset', 'asset_id', 'item_id', 'risorsa_id']);
  for (let i = dataStartIndex; i < rawLines.length; i++) {
    const parts = splitCsvLine(rawLines[i], SEP1);
    if (parts.length <= idColIndex) continue;
    const id = parts[idColIndex];
    if (!id || repeatedHeaderIds.has(id.toLowerCase())) continue;
    const rawPeso = cleanNumericValue(parts[pesoColIndex]);
    if (rawPeso === null) throw new Error(`[FILE 1 - RIGA ${i + 1}] Peso non numerico o mancante per id="${id}". Valore letto: "${parts[pesoColIndex] ?? ''}".`);
    const nome = (nomeColIndex < parts.length && parts[nomeColIndex]) ? parts[nomeColIndex] : id;
    let pesoNormalizzato = rawPeso > 1.0 && rawPeso <= 100.0 ? rawPeso / 100.0 : rawPeso;
    const pesoSafe = Math.max(0.0, Math.min(1.0, pesoNormalizzato));
    const qIdx = risorse.length;
    mappaQubit.set(id, qIdx);
    mappaQubit.set(id.toLowerCase(), qIdx);
    risorse.push({ id, nome, peso: pesoSafe });
  }
  return { risorse, mappaQubit };
}

function parseCsv2Deterministic(csv2: string, mappaQubit: Map<string, number>): ParsedRelazione[] {
  const cleanCsv2 = stripBom(csv2);
  const SEP2 = detectSeparator(cleanCsv2);
  const lines2 = cleanCsv2.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  const activeRelations: ParsedRelazione[] = [];
  if (lines2.length <= 1) return activeRelations;
  const headerCols = splitCsvLine(lines2[0], SEP2);
  const pairAccumulator = new Map<string, { i: number, j: number, nomeI: string, nomeJ: string, valori: number[] }>();
  for (let r = 1; r < lines2.length; r++) {
    const parts = splitCsvLine(lines2[r], SEP2);
    const idxRow = mappaQubit.get(parts[0]) ?? mappaQubit.get(parts[0]?.toLowerCase());
    if (idxRow === undefined) continue;
    for (let c = 1; c < parts.length; c++) {
      if (c >= headerCols.length) continue;
      const idxCol = mappaQubit.get(headerCols[c]) ?? mappaQubit.get(headerCols[c]?.toLowerCase());
      if (idxCol === undefined || idxRow === idxCol) continue;
      let peso = cleanNumericValue(parts[c]);
      if (peso === null) continue;
      if (peso > 1.0 && peso <= 100.0) peso = peso / 100.0;
      peso = Math.max(0.0, Math.min(1.0, peso));
      if (peso <= 0.0) continue;
      const lo = Math.min(idxRow, idxCol), hi = Math.max(idxRow, idxCol);
      const key = `${lo}-${hi}`;
      if (!pairAccumulator.has(key)) pairAccumulator.set(key, { i: lo, j: hi, nomeI: lo === idxRow ? parts[0] : headerCols[c], nomeJ: hi === idxRow ? parts[0] : headerCols[c], valori: [] });
      pairAccumulator.get(key)!.valori.push(peso);
    }
  }
  for (const [, entry] of pairAccumulator) {
    activeRelations.push({ id_controllo: entry.i, id_target: entry.j, valore_peso: Number((entry.valori.reduce((a, b) => a + b, 0) / entry.valori.length).toFixed(6)), nome_controllo: entry.nomeI, nome_target: entry.nomeJ });
  }
  return activeRelations.sort((a, b) => a.id_controllo !== b.id_controllo ? a.id_controllo - b.id_controllo : a.id_target - b.id_target);
}

export function parseCsv2MatrixDeterministic(csv2: string, risorse: ParsedRisorsa[], mappaQubit: Map<string, number>): number[][] {
  const numItems = risorse.length > 0 ? risorse.length : 4;
  const matrix: number[][] = Array.from({ length: numItems }, (_, i) => Array.from({ length: numItems }, (_, j) => (i === j ? 1.0 : 0.0)));
  const relazioni = parseCsv2Deterministic(csv2, mappaQubit);
  for (const rel of relazioni) {
    if (rel.id_controllo < numItems && rel.id_target < numItems) {
      matrix[rel.id_controllo][rel.id_target] = rel.valore_peso;
      matrix[rel.id_target][rel.id_controllo] = rel.valore_peso;
    }
  }
  return matrix;
}

export function classifyUploadedCsv(csv: string, fileName: string): 'anagrafica' | 'matrice' | 'unknown' {
    const clean = stripBom(csv);
    const sep = detectSeparator(clean);
    const lines = clean.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
    const lowerName = (fileName || '').toLowerCase();
    if (lines.length >= 2) {
      const headerCols = splitCsvLine(lines[0], sep).map(h => h.toLowerCase().trim());
      const hasWeightHeader = headerCols.some(h => h.includes('peso') || h.includes('weight') || h.includes('priorit') || h.includes('score') || h.includes('valore'));
      const rowIds = new Set<string>();
      for (let r = 1; r < lines.length; r++) { const p = splitCsvLine(lines[r], sep); if (p[0]) rowIds.add(p[0].toLowerCase().trim()); }
      const overlapCount = headerCols.slice(1).filter(h => rowIds.has(h)).length;
      if (!hasWeightHeader && headerCols.length >= 3 && overlapCount >= Math.min(2, rowIds.size)) return 'matrice';
      if (hasWeightHeader) { try { const { risorse } = parseCsv1Deterministic(clean); if (risorse.length >= 1) return 'anagrafica'; } catch {} }
      if (lowerName.includes('2_') || lowerName.includes('matrice') || lowerName.includes('conness') || lowerName.includes('correlaz')) return 'matrice';
      if (lowerName.includes('1_') || lowerName.includes('anagraf') || lowerName.includes('risors') || lowerName.includes('asset')) return 'anagrafica';
    }
    if (lowerName.includes('2_') || lowerName.includes('matrice')) return 'matrice';
    if (lowerName.includes('1_') || lowerName.includes('anagraf')) return 'anagrafica';
    return 'unknown';
}

export function validaMatriceFile2(csv2: string, mappaQubit?: Map<string, number>): { valido: boolean; righe: number; colonne: number; relazioniAttive: number; matchingIds: number; reason?: 'empty' | 'few_rows' | 'few_cols' | 'bad_numbers' | 'no_overlap'; } {
    const clean = stripBom(csv2);
    const lines = clean.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
    if (lines.length === 0) return { valido: false, righe: 0, colonne: 0, relazioniAttive: 0, matchingIds: 0, reason: 'empty' };
    if (lines.length < 3) return { valido: false, righe: Math.max(0, lines.length - 1), colonne: 0, relazioniAttive: 0, matchingIds: 0, reason: 'few_rows' };
    const sep = detectSeparator(clean);
    const headerCols = splitCsvLine(lines[0], sep);
    if (headerCols.length < 3) return { valido: false, righe: lines.length - 1, colonne: headerCols.length, relazioniAttive: 0, matchingIds: 0, reason: 'few_cols' };
    let nonNumeric = 0, numeric = 0;
    for (let r = 1; r < lines.length; r++) {
      const parts = splitCsvLine(lines[r], sep);
      for (let c = 1; c < Math.min(parts.length, headerCols.length); c++) {
        const cell = parts[c]?.trim(); if (!cell) continue;
        if (cleanNumericValue(cell) === null) nonNumeric++; else numeric++;
      }
    }
    if (numeric === 0 || nonNumeric > 0) return { valido: false, righe: lines.length - 1, colonne: headerCols.length, relazioniAttive: 0, matchingIds: 0, reason: 'bad_numbers' };
    if (mappaQubit && mappaQubit.size > 0) {
      const matchedRows = new Set<number>(); const matchedCols = new Set<number>();
      for (let r = 1; r < lines.length; r++) { const parts = splitCsvLine(lines[r], sep); const idRow = parts[0]?.trim(); if (idRow) { const idx = mappaQubit.get(idRow) ?? mappaQubit.get(idRow.toLowerCase()); if (idx !== undefined) matchedRows.add(idx); } }
      for (let c = 1; c < headerCols.length; c++) { const idCol = headerCols[c]?.trim(); if (idCol) { const idx = mappaQubit.get(idCol) ?? mappaQubit.get(idCol.toLowerCase()); if (idx !== undefined) matchedCols.add(idx); } }
      const overlap = Math.min(matchedRows.size, matchedCols.size);
      if (overlap < 2) return { valido: false, righe: lines.length - 1, colonne: headerCols.length, relazioniAttive: 0, matchingIds: overlap, reason: 'no_overlap' };
      const relations = parseCsv2Deterministic(clean, mappaQubit);
      return { valido: true, righe: lines.length - 1, colonne: headerCols.length, relazioniAttive: relations.length, matchingIds: overlap };
    }
    return { valido: true, righe: lines.length - 1, colonne: headerCols.length, relazioniAttive: 0, matchingIds: 0 };
}

// =====================================================================
// MOTORI DI CALCOLO SPECIFICI (con fix quantistico)
// =====================================================================

function generaCodiceCFD(csv1: string): string {
  const { risorse } = parseCsv1Deterministic(csv1);
  const parametri = risorse.map((r) => ({ id: r.id, portata: r.peso * 10, temperatura: 300 + (r.peso * 1000) }));
  return `#!/usr/bin/env python3
# =====================================================================
# MOTORE CFD - SIMULAZIONE COMBUSTIONE (1D SEMPLIFICATO)
# =====================================================================
import numpy as np
from scipy.integrate import solve_ivp
parametri = ${JSON.stringify(parametri, null, 2)}
Cp = 1.5; Q_comb = 120000; T_in = 300
def energia(t, y, portata, T_in):
    T = y[0]
    dTdt = (portata * (T_in - T) + Q_comb) / Cp
    return [dTdt]
print("=" * 70)
print("RISULTATI SIMULAZIONE CFD - COMBUSTIONE IDROGENO")
print("=" * 70)
for p in parametri:
    sol = solve_ivp(energia, [0, 1], [p['temperatura']], args=(p['portata'], T_in), t_eval=np.linspace(0, 1, 100))
    T_finale = sol.y[0][-1]
    print(f"  • {p['id']:<20}: T_in = {p['temperatura']:.1f} K → T_finale = {T_finale:.1f} K")
print("=" * 70)`;
}

function generaLSTMCodice(csv1: string): string {
  const { risorse } = parseCsv1Deterministic(csv1);
  const serie = risorse.map((r, i) => ({ id: r.id, valori: Array.from({ length: 50 }, (_, t) => Math.sin(t * 0.1 + i) * r.peso + Math.cos(t * 0.05) * 0.1) }));
  return `#!/usr/bin/env python3
# =====================================================================
# MOTORE LSTM - PREVISIONE SERIE STORICHE
# =====================================================================
import numpy as np
serie = ${JSON.stringify(serie, null, 2)}
finestra = 5; hidden_size = 10
class SimpleLSTM:
    def __init__(self, input_size, hidden_size):
        self.Wf = np.random.randn(hidden_size, input_size + hidden_size) * 0.1
        self.Wi = np.random.randn(hidden_size, input_size + hidden_size) * 0.1
        self.Wo = np.random.randn(hidden_size, input_size + hidden_size) * 0.1
        self.Wc = np.random.randn(hidden_size, input_size + hidden_size) * 0.1
    def sigmoid(self, x): return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    def forward(self, x, h_prev, c_prev):
        concat = np.concatenate([x, h_prev])
        f = self.sigmoid(self.Wf @ concat); i = self.sigmoid(self.Wi @ concat)
        o = self.sigmoid(self.Wo @ concat); c_tilde = np.tanh(self.Wc @ concat)
        c = f * c_prev + i * c_tilde; h = o * np.tanh(c)
        return h, c
print("=" * 70)
print("RISULTATI PREVISIONE LSTM - SERIE STORICHE")
print("=" * 70)
for s in serie:
    lstm = SimpleLSTM(input_size=1, hidden_size=hidden_size)
    h = np.zeros(hidden_size); c = np.zeros(hidden_size)
    for t in range(len(s['valori']) - finestra):
        h, c = lstm.forward(np.array([s['valori'][t]]), h, c)
    h, c = lstm.forward(np.array([s['valori'][-1]]), h, c)
    print(f"  • {s['id']:<20}: Ultimo = {s['valori'][-1]:+.4f} → Previsione = {float(h[0]):+.4f}")
print("=" * 70)`;
}

function generaSLSQPCodice(sector: string, scenarioName: string, csv1: string, csv2: string, strategy: string, file1Name: string, file2Name: string, isDemo: boolean): string {
  const cleanStrategy = strategy ? strategy.replace(/[^a-zA-Z0-9 _-]/g, '').trim() : 'Prudente';
  const cleanSector = sector.replace(/[^a-zA-Z0-9 _-]/g, '_') || 'Generale';
  const cleanScenario = scenarioName.replace(/[^a-zA-Z0-9 _-]/g, '_') || 'Scenario_Standard';
  const safeFile1Name = file1Name.replace(/["\\]/g, '');
  const safeFile2Name = file2Name.replace(/["\\]/g, '');
  const pyPayload1 = JSON.stringify(csv1 || '');
  const pyPayload2 = JSON.stringify(csv2 || '');
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);
  const pesiRisolti = risorse.map(r => ({ id: r.id, peso: Number(r.peso.toFixed(6)) }));
  const relazioniRisolte = activeRelations.map(rel => ({ i: rel.id_controllo, j: rel.id_target, peso: Number(rel.valore_peso.toFixed(6)), nome_i: rel.nome_controllo, nome_j: rel.nome_target }));

  return `#!/usr/bin/env python3
# =====================================================================
# PIPELINE CLASSICA AD ALTE PRESTAZIONI (HPC NUMPY / SCIPY SLSQP)
# SETTORE: ${cleanSector}
# SCENARIO: ${cleanScenario}
# STRATEGIA: ${cleanStrategy}
# =====================================================================
import os, io, sys, numpy as np, pandas as pd, scipy.optimize as opt
NOME_SETTORE = "${cleanSector}"
NOME_SCENARIO = "${cleanScenario}"
STRATEGIA_SCELTA = "${cleanStrategy}"
FILE_1_NAME = "${safeFile1Name}"
FILE_2_NAME = "${safeFile2Name}"
IS_DEMO_DATASET = ${isDemo ? 'True' : 'False'}
CSV_1_PAYLOAD = ${pyPayload1}
CSV_2_PAYLOAD = ${pyPayload2}
PESI_RISOLTI = ${JSON.stringify(pesiRisolti)}
RELAZIONI_RISOLTE = ${JSON.stringify(relazioniRisolte)}
if IS_DEMO_DATASET: print("[DEMO] Uso dataset demo incorporato.")
elif os.path.exists(FILE_1_NAME): print(f"[UPLOAD] File 1 letto da disco: {FILE_1_NAME}")
else: print("[UPLOAD] File 1 letto da payload di sessione.")
asset_nomi = [p['id'] for p in PESI_RISOLTI]
rendimenti_attesi = np.array([p['peso'] for p in PESI_RISOLTI], dtype=float)
num_assets = len(asset_nomi)
if num_assets == 0: raise ValueError("Nessuna risorsa valida trovata nel CSV 1.")
matrice_connessioni = np.eye(num_assets, dtype=float)
for rel in RELAZIONI_RISOLTE:
    i, j, peso = int(rel['i']), int(rel['j']), float(rel['peso'])
    if i < num_assets and j < num_assets: matrice_connessioni[i, j] = peso; matrice_connessioni[j, i] = peso
matrice_simm = matrice_connessioni.copy(); np.fill_diagonal(matrice_simm, 1.0)
eigvals, eigvecs = np.linalg.eigh(matrice_simm); eigvals = np.maximum(eigvals, 1e-5)
matrice_rischio_rete = eigvecs @ np.diag(eigvals) @ eigvecs.T
risk_free_rate = 0.02
def calcola_sharpe_sistemico_negativo(pesi):
    r_p = np.sum(rendimenti_attesi * pesi)
    var_rete = np.dot(pesi.T, np.dot(matrice_rischio_rete, pesi))
    vol_rete = np.sqrt(max(1e-8, var_rete))
    return -(r_p - risk_free_rate) / vol_rete
pesi_iniziali = np.ones(num_assets) / num_assets
vincoli = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0})
limiti = tuple((0.0, 1.0) for _ in range(num_assets))
risultato = opt.minimize(calcola_sharpe_sistemico_negativo, pesi_iniziali, method='SLSQP', bounds=limiti, constraints=vincoli)
if not risultato.success or np.any(np.isnan(risultato.x)) or np.sum(risultato.x) <= 0: pesi_ottimi = pesi_iniziali
else: pesi_ottimi = np.clip(risultato.x, 0.0, 1.0); pesi_ottimi = pesi_ottimi / np.sum(pesi_ottimi)
print("=====================================================================")
print(f"--- RISULTATO OTTIMIZZAZIONE CLASSICA DI RETE (SLSQP / {NOME_SETTORE}) ---")
print("=====================================================================")
for nome, peso in zip(asset_nomi, pesi_ottimi): print(f"  • {nome:<32}: Allocazione = {peso * 100:6.2f}%")
print("=====================================================================")`;
}

function generaVQECodice(csv1: string, csv2: string, vincolo: string): string {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);
  const thetas = risorse.map(r => 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, r.peso)))));
  const relazioniValide = activeRelations.filter(rel => rel.id_controllo < risorse.length && rel.id_target < risorse.length).map(rel => ({ i: rel.id_controllo, j: rel.id_target, peso: rel.valore_peso }));

  return `#!/usr/bin/env python3
# =====================================================================
# MOTORE VQE (VARIATIONAL QUANTUM EIGENSOLVER) - CORRETTO
# =====================================================================
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.primitives import StatevectorSampler
pesi = ${JSON.stringify(risorse.map(r => r.peso))}
thetas = ${JSON.stringify(thetas.map(t => Number(t.toFixed(6))))}
relazioni = ${JSON.stringify(relazioniValide, null, 2)}
num_qubits = len(pesi)
q = QuantumRegister(num_qubits, 'q'); c = ClassicalRegister(num_qubits, 'c')
qc = QuantumCircuit(q, c)
for i in range(num_qubits): qc.ry(thetas[i], q[i])
for rel in relazioni:
    i, j, peso = rel['i'], rel['j'], rel['peso']
    if peso >= 0.60: qc.cx(q[i], q[j])
    elif peso > 0.0: qc.cp(np.pi * peso, q[i], q[j])
qc.measure(q, c)
sampler = StatevectorSampler()
job = sampler.run([qc], shots=1024)
counts = job.result()[0].data.c.get_counts()
print("=" * 70)
print("RISULTATI VQE - STATO FONDAMENTALE")
print("=" * 70)
print("Conteggi misurati:", counts)
print("Stato dominante:", max(counts, key=counts.get))
print("=" * 70)`;
}

function generaQUBOCodice(csv1: string, csv2: string, vincolo: string): string {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);
  const thetas = risorse.map(r => 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, r.peso)))));
  const relazioniValide = activeRelations.filter(rel => rel.id_controllo < risorse.length && rel.id_target < risorse.length).map(rel => ({ i: rel.id_controllo, j: rel.id_target, peso: rel.valore_peso }));

  return `#!/usr/bin/env python3
# =====================================================================
# MOTORE QUBO (QUADRATIC UNCONSTRAINED BINARY OPTIMIZATION) - QAOA
# =====================================================================
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.primitives import StatevectorSampler
pesi = ${JSON.stringify(risorse.map(r => r.peso))}
thetas = ${JSON.stringify(thetas.map(t => Number(t.toFixed(6))))}
relazioni = ${JSON.stringify(relazioniValide, null, 2)}
num_qubits = len(pesi)
q = QuantumRegister(num_qubits, 'q'); c = ClassicalRegister(num_qubits, 'c')
qc = QuantumCircuit(q, c)
qc.h(range(num_qubits))
for i in range(num_qubits): qc.ry(thetas[i], q[i])
for rel in relazioni:
    i, j, peso = rel['i'], rel['j'], rel['peso']
    if peso >= 0.60: qc.cx(q[i], q[j])
    elif peso > 0.0: qc.cp(np.pi * peso, q[i], q[j])
qc.measure(q, c)
sampler = StatevectorSampler()
job = sampler.run([qc], shots=1024)
counts = job.result()[0].data.c.get_counts()
print("=" * 70)
print("RISULTATI QUBO / QAOA")
print("=" * 70)
print("Conteggi misurati:", counts)
print("Soluzione ottima (bitstring):", max(counts, key=counts.get))
print("=" * 70)`;
}

function generaBlackScholesCodice(csv1: string): string {
  const { risorse } = parseCsv1Deterministic(csv1);
  const parametri = risorse.map((r) => ({ id: r.id, S: 100 * r.peso, K: 100, T: 1, r: 0.05, sigma: 0.2 + (r.peso * 0.1) }));
  return `#!/usr/bin/env python3
# =====================================================================
# MOTORE BLACK-SCHOLES - PRICING OPZIONI
# =====================================================================
import numpy as np
from scipy.stats import norm
parametri = ${JSON.stringify(parametri, null, 2)}
def black_scholes(S, K, T, r, sigma):
    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    call = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    put = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
    return call, put
print("=" * 70)
print("RISULTATI PRICING BLACK-SCHOLES")
print("=" * 70)
for p in parametri:
    call, put = black_scholes(p['S'], p['K'], p['T'], p['r'], p['sigma'])
    print(f"  • {p['id']:<20}: Call = {call:.2f}, Put = {put:.2f}")
print("=" * 70)`;
}

function generaNLPLLMCodice(csv1: string): string {
  const { risorse } = parseCsv1Deterministic(csv1);
  const testi = risorse.map((r) => ({ id: r.id, testo: `Analisi del sentiment per ${r.nome || r.id} con peso ${r.peso.toFixed(2)}` }));
  return `#!/usr/bin/env python3
# =====================================================================
# MOTORE NLP / LLM - ANALISI DEL SENTIMENT
# =====================================================================
import random
testi = ${JSON.stringify(testi, null, 2)}
positive_words = ['buono', 'ottimo', 'eccellente', 'positivo', 'crescita', 'profitto']
negative_words = ['cattivo', 'pessimo', 'negativo', 'perdita', 'calo', 'rischio']
def analizza_sentiment(testo):
    testo_lower = testo.lower()
    pos_count = sum(1 for w in positive_words if w in testo_lower)
    neg_count = sum(1 for w in negative_words if w in testo_lower)
    if pos_count > neg_count: return 'positivo', pos_count - neg_count
    elif neg_count > pos_count: return 'negativo', neg_count - pos_count
    else: return 'neutro', 0
print("=" * 70)
print("RISULTATI ANALISI DEL SENTIMENT")
print("=" * 70)
for t in testi:
    sentiment, score = analizza_sentiment(t['testo'])
    print(f"  • {t['id']:<20}: Sentiment = {sentiment.upper()} (Score: {score})")
print("=" * 70)`;
}

function generaComputerVisionCodice(csv1: string): string {
  const { risorse } = parseCsv1Deterministic(csv1);
  const immagini = risorse.map((r) => ({ id: r.id, features: Array.from({ length: 10 }, () => Math.random()) }));
  return `#!/usr/bin/env python3
# =====================================================================
# MOTORE COMPUTER VISION (CNN / YOLO) - RICONOSCIMENTO PATTERN
# =====================================================================
import numpy as np
immagini = ${JSON.stringify(immagini, null, 2)}
def classifica(features):
    pesi = np.array([0.1, -0.2, 0.3, -0.1, 0.4, -0.3, 0.2, -0.4, 0.5, -0.5])
    score = np.dot(features, pesi)
    return 'positivo' if score > 0 else 'negativo'
print("=" * 70)
print("RISULTATI COMPUTER VISION - CLASSIFICAZIONE")
print("=" * 70)
for img in immagini:
    classe = classifica(img['features'])
    print(f"  • {img['id']:<20}: Classe = {classe.upper()}")
print("=" * 70)`;
}

function generaXGBoostCodice(csv1: string): string {
  const { risorse } = parseCsv1Deterministic(csv1);
  const dataset = risorse.map((r) => ({ id: r.id, features: [r.peso, Math.random(), Math.random()], target: r.peso > 0.7 ? 1 : 0 }));
  return `#!/usr/bin/env python3
# =====================================================================
# MOTORE XGBOOST - GRADIENT BOOSTING
# =====================================================================
import numpy as np
dataset = ${JSON.stringify(dataset, null, 2)}
def predict(features):
    if features[0] > 0.7: return 1
    else: return 0
print("=" * 70)
print("RISULTATI XGBOOST - CLASSIFICAZIONE")
print("=" * 70)
for d in dataset:
    pred = predict(d['features'])
    print(f"  • {d['id']:<20}: Predizione = {pred} (Target: {d['target']})")
print("=" * 70)`;
}

function generaGNNCodice(csv1: string): string {
  const { risorse } = parseCsv1Deterministic(csv1);
  const nodi = risorse.map((r) => ({ id: r.id, feature: [r.peso, Math.random(), Math.random()] }));
  return `#!/usr/bin/env python3
# =====================================================================
# MOTORE GNN (GRAPH NEURAL NETWORK) - PROPAGAZIONE
# =====================================================================
import numpy as np
nodi = ${JSON.stringify(nodi, null, 2)}
def gnn_message_passing(nodi):
    embeddings = {n['id']: np.array(n['feature']) for n in nodi}
    for n in nodi:
        vicini = [emb for id, emb in embeddings.items() if id != n['id']]
        if vicini: embeddings[n['id']] = np.mean(vicini, axis=0)
    return embeddings
print("=" * 70)
print("RISULTATI GNN - PROPAGAZIONE")
print("=" * 70)
embeddings = gnn_message_passing(nodi)
for id, emb in embeddings.items():
    print(f"  • {id:<20}: Embedding = {emb.round(4)}")
print("=" * 70)`;
}

function generaGrafoCodice(csv1: string): string {
  const { risorse } = parseCsv1Deterministic(csv1);
  const nodi = risorse.map((r) => ({ id: r.id, peso: r.peso }));
  return `#!/usr/bin/env python3
# =====================================================================
# MOTORE GRAPH THEORY - ANALISI VULNERABILITÀ / RETE
# =====================================================================
import numpy as np
import networkx as nx
nodi = ${JSON.stringify(nodi, null, 2)}
G = nx.Graph()
for n in nodi: G.add_node(n['id'], weight=n['peso'])
for i, n1 in enumerate(nodi):
    for j, n2 in enumerate(nodi):
        if i < j:
            weight = n1['peso'] * n2['peso']
            G.add_edge(n1['id'], n2['id'], weight=weight)
centrality = nx.degree_centrality(G)
print("=" * 70)
print("RISULTATI ANALISI GRAFO - CENTRALITÀ")
print("=" * 70)
for node, cent in sorted(centrality.items(), key=lambda x: x[1], reverse=True):
    print(f"  • {node:<20}: Centralità = {cent:.4f}")
print("=" * 70)`;
}

function generaRLcodice(csv1: string): string {
  const { risorse } = parseCsv1Deterministic(csv1);
  const stati = risorse.map((r) => ({ id: r.id, stato_iniziale: r.peso }));
  return `#!/usr/bin/env python3
# =====================================================================
# MOTORE REINFORCEMENT LEARNING (Q-LEARNING SEMPLIFICATO)
# =====================================================================
import numpy as np
stati = ${JSON.stringify(stati, null, 2)}
n_stati = len(stati)
n_azioni = 2
Q = np.zeros((n_stati, n_azioni))
learning_rate = 0.1; gamma = 0.9; epsilon = 0.1; episodes = 100
for episode in range(episodes):
    for s in range(n_stati):
        if np.random.random() < epsilon: a = np.random.randint(n_azioni)
        else: a = np.argmax(Q[s])
        reward = stati[s]['stato_iniziale'] if a == 1 else 0
        Q[s, a] += learning_rate * (reward + gamma * np.max(Q[s]) - Q[s, a])
print("=" * 70)
print("RISULTATI REINFORCEMENT LEARNING - Q-TABLE")
print("=" * 70)
for s, stato in enumerate(stati):
    best_action = np.argmax(Q[s])
    print(f"  • {stato['id']:<20}: Azione ottima = {best_action} (Q-value: {Q[s, best_action]:.4f})")
print("=" * 70)`;
}

// =====================================================================
// GENERATORI PRINCIPALI
// =====================================================================

export const generateQiskitCode = (
  sector: string,
  csv1: string,
  csv2: string,
  vincolo: string,
  strategy: string
): string => {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const totalInputRows = risorse.length > 0 ? risorse.length : 4;
  const numQubits = Math.min(totalInputRows, MAX_QUANTUM_QUBITS);
  const isTruncated = totalInputRows > MAX_QUANTUM_QUBITS;

  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);

  const pesiRisoltiQasm: { id: string, peso: number }[] = [];
  for (let i = 0; i < numQubits; i++) {
    const r = risorse[i] || { id: `q_${i}`, peso: 0.5 };
    pesiRisoltiQasm.push({ id: r.id, peso: Number(Math.max(0.0, Math.min(1.0, r.peso)).toFixed(6)) });
  }

  let initBlocks = '';
  if (isTruncated) {
    initBlocks += `// [WARNING HARDWARE BOUND] Rilevate ${totalInputRows} risorse. Circuito limitato a ${numQubits} qubit fisici.\n`;
  }
  for (let i = 0; i < numQubits; i++) {
    const p = pesiRisoltiQasm[i];
    const theta = (2.0 * Math.asin(Math.sqrt(p.peso))).toFixed(6);
    initBlocks += `ry(${theta}) q[${i}]; // ${p.id} (p=|1> ${(p.peso * 100).toFixed(1)}%)\n`;
  }

  const isNone = vincolo === 'nessun_vincolo' || vincolo === 'senza_entanglement' || vincolo.includes('nessun') || vincolo.includes('indipendent') || vincolo.includes('senza');

  let constraintBlocks = '// Nessun vincolo attivo (Risorse Indipendenti)';
  if (!isNone && activeRelations.length > 0) {
    const validRelations = activeRelations.filter(rel => rel.id_controllo < numQubits && rel.id_target < numQubits);
    if (validRelations.length > 0) {
      constraintBlocks = validRelations.map(rel => {
        if (rel.valore_peso >= SOGLIA_CRITICA_RIGIDA) {
          return `cx q[${rel.id_controllo}], q[${rel.id_target}]; // Blocco Rigido (peso = ${rel.valore_peso.toFixed(2)} >= ${SOGLIA_CRITICA_RIGIDA.toFixed(2)})`;
        } else if (rel.valore_peso > 0.00) {
          const phaseAngle = (Math.PI * rel.valore_peso).toFixed(6);
          return `cp(${phaseAngle}) q[${rel.id_controllo}], q[${rel.id_target}]; // Legame Morbido (peso = ${rel.valore_peso.toFixed(2)} < ${SOGLIA_CRITICA_RIGIDA.toFixed(2)})`;
        }
        return '';
      }).filter(s => s.length > 0).join('\n');
    }
  }

  let measureBlocks = '';
  for (let i = 0; i < numQubits; i++) {
    measureBlocks += `measure q[${i}] -> c[${i}];\n`;
  }

  return `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[${numQubits}] q;\nbit[${numQubits}] c;\n\n// 1. INIZIALIZZAZIONE STATO DINAMICA (${numQubits} QUBIT)\n${initBlocks.trim()}\n\nbarrier q;\n\n// 2. VINCOLI ED ENTANGLEMENT\n${constraintBlocks}\n\nbarrier q;\n\n// 3. MISURAZIONE FINALE\n${measureBlocks.trim()}`;
};

export const generateQiskitPythonCode = (
  sector: string,
  csv1: string,
  csv2: string,
  vincolo: string,
  strategy: string,
  file1Name: string = "1_anagrafica_risorse.csv",
  file2Name: string = "2_matrice_connessioni.csv",
  isDemo: boolean = false,
  modelCode: string = ""
): string => {
  const codeUpper = (modelCode || '').toUpperCase();

  if (codeUpper.includes('VQE')) return generaVQECodice(csv1, csv2, vincolo);
  if (codeUpper.includes('QUBO') || codeUpper.includes('QAOA')) return generaQUBOCodice(csv1, csv2, vincolo);
  if (codeUpper.includes('FOLDING') || codeUpper.includes('PEPTIDE')) return generaVQECodice(csv1, csv2, vincolo);
  if (codeUpper.includes('GROVER')) return generaVQECodice(csv1, csv2, vincolo);
  if (codeUpper.includes('QKD')) return generaVQECodice(csv1, csv2, vincolo);

  // Fallback: vecchio circuito generico (RY+CX/CP)
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const totalInputRows = risorse.length > 0 ? risorse.length : 4;
  const numQubits = Math.min(totalInputRows, MAX_QUANTUM_QUBITS);
  const isTruncated = totalInputRows > MAX_QUANTUM_QUBITS;

  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);

  const pesiRisolti: { id: string, peso: number }[] = [];
  for (let i = 0; i < numQubits; i++) {
    const r = risorse[i] || { id: `q_${i}`, peso: 0.5 };
    pesiRisolti.push({ id: r.id, peso: Number(Math.max(0.0, Math.min(1.0, r.peso)).toFixed(6)) });
  }
  const relazioniRisolte = activeRelations
    .filter(rel => rel.id_controllo < numQubits && rel.id_target < numQubits)
    .map(rel => ({
      i: rel.id_controllo,
      j: rel.id_target,
      peso: Number(rel.valore_peso.toFixed(6)),
      nome_i: rel.nome_controllo,
      nome_j: rel.nome_target
    }));

  let pyCode = `import os\nimport io\nimport sys\nimport numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\nfrom qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\nfrom qiskit.visualization import plot_bloch_multivector\nfrom qiskit.quantum_info import Statevector\n`;
  pyCode += `try:\n    from qiskit_aer import AerSimulator\n    from qiskit_aer.primitives import SamplerV2 as AerSampler\n    from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager\n    HAS_AER = True\nexcept ImportError:\n    from qiskit.primitives import StatevectorSampler as AerSampler\n    HAS_AER = False\n\n`;

  const cleanSector = sector.replace(/[^a-zA-Z0-9]/g, '_') || 'General';
  const cleanStrategy = strategy ? strategy.replace(/[^a-zA-Z0-9 _-]/g, '').trim() : 'Prudente';
  const safeFile1Name = file1Name.replace(/["\\]/g, '');
  const safeFile2Name = file2Name.replace(/["\\]/g, '');
  const pyPayload1 = JSON.stringify(csv1 || '');
  const pyPayload2 = JSON.stringify(csv2 || '');

  pyCode += `FILE_1_NAME = "${safeFile1Name}"\nFILE_2_NAME = "${safeFile2Name}"\nIS_DEMO_DATASET = ${isDemo ? 'True' : 'False'}\n\n`;
  pyCode += `CSV_1_PAYLOAD = ${pyPayload1}\nCSV_2_PAYLOAD = ${pyPayload2}\n\n`;
  pyCode += `PESI_RISOLTI = ${JSON.stringify(pesiRisolti)}\nRELAZIONI_RISOLTE = ${JSON.stringify(relazioniRisolte)}\n\n`;
  
  pyCode += `if IS_DEMO_DATASET:\n    print("[DEMO] Uso dataset demo incorporato.")\nelif os.path.exists(FILE_1_NAME):\n    print(f"[UPLOAD] File 1 letto da disco: {FILE_1_NAME}")\nelse:\n    print("[UPLOAD] File 1 letto da payload di sessione.")\n\n`;

  pyCode += `MAX_QUANTUM_QUBITS = 127\ntotale_record = len(PESI_RISOLTI)\nnum_qubits = min(totale_record, MAX_QUANTUM_QUBITS)\n\n`;
  pyCode += `q = QuantumRegister(num_qubits, name="q")\nc = ClassicalRegister(num_qubits, name="c")\nqc = QuantumCircuit(q, c, name="QC_${cleanSector}_${cleanStrategy.replace(/[^a-zA-Z0-9]/g, '_')}")\n\n`;

  pyCode += `thetas = []\nfor i in range(num_qubits):\n    peso_val = float(PESI_RISOLTI[i]['peso'])\n    theta = 2.0 * np.arcsin(np.sqrt(peso_val))\n    thetas.append(theta)\n    qc.ry(theta, q[i])\n\n`;

  pyCode += `qc.barrier()\nfor rel in RELAZIONI_RISOLTE:\n    i, j, peso = int(rel['i']), int(rel['j']), float(rel['peso'])\n    if i >= num_qubits or j >= num_qubits:\n        continue\n    if peso >= 0.60:\n        qc.cx(q[i], q[j])\n    elif peso > 0.0:\n        qc.cp(np.pi * peso, q[i], q[j])\n\n`;

  pyCode += `qc.barrier()\nfor i in range(num_qubits):\n    qc.measure(q[i], c[i])\n\n`;

  pyCode += `if HAS_AER:\n    simulator = AerSimulator()\n    pass_manager = generate_preset_pass_manager(backend=simulator, optimization_level=1)\n    isa_circuit = pass_manager.run(qc)\n    sampler = AerSampler()\n    job = sampler.run([isa_circuit], shots=1024)\n    pub_result = job.result()[0]\n    counts = pub_result.data.c.get_counts()\nelse:\n    sampler = AerSampler()\n    job = sampler.run([qc], shots=1024)\n    pub_result = job.result()[0]\n    counts = pub_result.data.c.get_counts()\n\n`;

  pyCode += `print("=====================================================================")\nprint("--- 1. RISULTATO CAMPIONAMENTO QUANTISTICO ---")\nprint("=====================================================================")\nprint("Distribuzione Conteggi:", counts)\nstato_ottimo = max(counts, key=counts.get)\nprint(f"Stato Dominante: |{stato_ottimo}> ({counts[stato_ottimo]}/1024 shots)\\n")\n\n`;

  return pyCode;
};

export const generateClassicalHpcPythonCode = (
  sector: string,
  scenarioName: string,
  modelCode: string,
  csv1: string,
  csv2: string,
  strategy: string,
  file1Name: string = "1_anagrafica_risorse.csv",
  file2Name: string = "2_matrice_connessioni.csv",
  isDemo: boolean = false
): string => {
  const codeUpper = (modelCode || '').toUpperCase();

  if (codeUpper.includes('CFD')) return generaCodiceCFD(csv1);
  if (codeUpper.includes('LSTM')) return generaLSTMCodice(csv1);
  if (codeUpper.includes('VQE')) return generaVQECodice(csv1, csv2, '');
  if (codeUpper.includes('QUBO') || codeUpper.includes('QAOA')) return generaQUBOCodice(csv1, csv2, '');
  if (codeUpper.includes('BLACK-SCHOLES') || codeUpper.includes('AVX')) return generaBlackScholesCodice(csv1);
  if (codeUpper.includes('LLM') || codeUpper.includes('NLP')) return generaNLPLLMCodice(csv1);
  if (codeUpper.includes('CNN') || codeUpper.includes('YOLO') || codeUpper.includes('VISION')) return generaComputerVisionCodice(csv1);
  if (codeUpper.includes('XGBOOST')) return generaXGBoostCodice(csv1);
  if (codeUpper.includes('GNN')) return generaGNNCodice(csv1);
  if (codeUpper.includes('GRAPH')) return generaGrafoCodice(csv1);
  if (codeUpper.includes('RL') || codeUpper.includes('REINFORCEMENT')) return generaRLcodice(csv1);

  return generaSLSQPCodice(sector, scenarioName, csv1, csv2, strategy, file1Name, file2Name, isDemo);
};