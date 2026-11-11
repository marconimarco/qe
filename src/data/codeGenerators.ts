// MOTORE QUANTISTICO DETERMINISTICO V4 (TAXONOMIC QUANTUM ENGINE - PATCHED)
// Compilazione OpenQASM 3.0 e Python Qiskit conforme alle direttive matematiche esatte:
// 1. Mappatura sequenziale rigida FIFO (Riga 1 -> q[0], Riga 2 -> q[1], ...)
// 2. Formula quantistica esatta: theta = 2 * arcsin(sqrt(peso_safe))
// 3. Blocco Rigido (CX): applicazione esclusiva a relazioni critiche con peso >= 0.60
//
// [FIX 1] splitCsvLine robusto: separatore rilevato una volta su tutto il CSV + supporto quote
// [FIX 2] Fallback 0.5 bandito: errore esplicito su peso mancante/non numerico
// [FIX 3] pesoColIndex: match su nomi noti o errore bloccante (niente "ultima colonna")
// [FIX 4] Matrice File 2 simmetrizzata (media direzioni) + ordinamento deterministico
// [FIX 5] QASM e Python dallo stesso albero: pesi/relazioni iniettati da TypeScript
// [FIX 6] Log [DEMO]/[UPLOAD] espliciti in Python
// [FIX 7] parseCsv2MatrixDeterministic deprecata (delega a parseCsv2Deterministic)

export const SOGLIA_CRITICA_RIGIDA = 0.60;
export const MAX_QUANTUM_QUBITS = 127;

interface ParsedRisorsa {
  id: string;
  nome: string;
  peso: number;
}

interface ParsedRelazione {
  id_controllo: number;
  id_target: number;
  valore_peso: number;
  nome_controllo: string;
  nome_target: string;
}

export function cleanNumericValue(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
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
  const parsed = parseFloat(s);
  if (isNaN(parsed)) return null;
  if (isPercent) return parsed / 100.0;
  return parsed;
}

function detectSeparator(csv: string): string {
  const lines = csv.split('\n').map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));
  if (lines.length === 0) return ',';
  let countComma = 0, countSemi = 0;
  for (const line of lines.slice(0, 5)) {
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') inQuotes = !inQuotes;
      else if (!inQuotes) {
        if (ch === ',') countComma++;
        else if (ch === ';') countSemi++;
      }
    }
  }
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
  const SEP1 = detectSeparator(csv1);
  const rawLines = csv1.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  const risorse: ParsedRisorsa[] = [];
  const mappaQubit = new Map<string, number>();

  if (rawLines.length === 0) return { risorse, mappaQubit };

  let idColIndex = 0;
  let pesoColIndex = -1;
  let nomeColIndex = 1;
  let dataStartIndex = 0;

  const headerKeywords = ['id', 'risorsa', 'caso', 'composto', 'linea', 'item', 'asset', 'peso', 'priorita', 'weight', 'score'];
  const headerIdx = rawLines.findIndex(line => {
    const lower = line.toLowerCase();
    return headerKeywords.some(kw => lower.includes(kw));
  });

  if (headerIdx !== -1) {
    const headers = splitCsvLine(rawLines[headerIdx], SEP1).map(h => h.toLowerCase().trim());

    const foundId = headers.findIndex(h =>
      h.includes('id') || h.includes('risorsa') || h.includes('asset') ||
      h.includes('caso') || h.includes('composto') || h.includes('linea') || h.includes('item')
    );
    if (foundId !== -1) idColIndex = foundId;

    const foundPeso = headers.findIndex(h =>
      h.includes('peso') || h.includes('weight') || h.includes('priorit') ||
      h.includes('clinic') || h.includes('stabilita') || h.includes('probabilit') ||
      h.includes('saturaz') || h.includes('score') || h.includes('valore')
    );
    if (foundPeso !== -1) pesoColIndex = foundPeso;

    const foundNome = headers.findIndex(h => h.includes('nome') || h.includes('name') || h.includes('label') || h.includes('desc'));
    if (foundNome !== -1) nomeColIndex = foundNome;

    dataStartIndex = headerIdx + 1;
  }

  // [FIX 3] Match su nomi noti o errore bloccante (niente "ultima colonna")
  if (pesoColIndex === -1) {
    const firstHeaders = splitCsvLine(rawLines[0], SEP1).map(h => h.toLowerCase().trim());
    const knownWeights = ['priorita_peso', 'peso_quantistico', 'peso', 'weight', 'score', 'valore'];
    for (let c = 0; c < firstHeaders.length; c++) {
      if (knownWeights.some(k => firstHeaders[c].includes(k))) {
        pesoColIndex = c;
        break;
      }
    }
    if (pesoColIndex === -1) {
      throw new Error(
        `[FILE 1] Impossibile identificare la colonna del peso. ` +
        `Intestazioni lette: ${firstHeaders.join(' | ')}. ` +
        `Attesi nomi contenenti: priorita_peso, peso, weight, score, valore. ` +
        `Verifica che il CSV abbia una riga di intestazione valida.`
      );
    }
  }

  for (let i = dataStartIndex; i < rawLines.length; i++) {
    const line = rawLines[i];
    const parts = splitCsvLine(line, SEP1);
    if (parts.length <= idColIndex) continue;

    const id = parts[idColIndex];
    if (!id || id.toLowerCase().startsWith('id_')) continue;

    // [FIX 2] Errore esplicito invece di fallback 0.5
    const rawPesoCell = parts[pesoColIndex];
    const rawPeso = cleanNumericValue(rawPesoCell);
    if (rawPeso === null) {
      throw new Error(
        `[FILE 1 - RIGA ${i + 1}] Peso non numerico o mancante per id="${id}". ` +
        `Valore letto: "${rawPesoCell ?? ''}". ` +
        `Correggi il CSV: la colonna peso deve contenere un numero (es. 0.85 o 85%).`
      );
    }

    const nome = (nomeColIndex < parts.length && parts[nomeColIndex]) ? parts[nomeColIndex] : id;

    let pesoNormalizzato = rawPeso;
    if (pesoNormalizzato > 1.0 && pesoNormalizzato <= 100.0) {
      pesoNormalizzato = pesoNormalizzato / 100.0;
    }
    const pesoSafe = Math.max(0.0, Math.min(1.0, pesoNormalizzato));
    const qIdx = risorse.length;
    mappaQubit.set(id, qIdx);
    mappaQubit.set(id.toLowerCase(), qIdx);
    risorse.push({ id, nome, peso: pesoSafe });
  }

  return { risorse, mappaQubit };
}

// [FIX 4] Simmetrizzazione (media direzioni) + ordinamento deterministico
function parseCsv2Deterministic(csv2: string, mappaQubit: Map<string, number>): ParsedRelazione[] {
  const SEP2 = detectSeparator(csv2);
  const lines2 = csv2.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  const activeRelations: ParsedRelazione[] = [];

  if (lines2.length <= 1) return activeRelations;

  const headerCols = splitCsvLine(lines2[0], SEP2);
  const pairAccumulator = new Map<string, { i: number, j: number, nomeI: string, nomeJ: string, valori: number[] }>();

  for (let r = 1; r < lines2.length; r++) {
    const parts = splitCsvLine(lines2[r], SEP2);
    const idRow = parts[0];
    const idxRow = mappaQubit.get(idRow) ?? mappaQubit.get(idRow.toLowerCase());
    if (idxRow === undefined) continue;

    for (let c = 1; c < parts.length; c++) {
      if (c >= headerCols.length) continue;
      const idCol = headerCols[c];
      const idxCol = mappaQubit.get(idCol) ?? mappaQubit.get(idCol.toLowerCase());
      if (idxCol === undefined || idxRow === idxCol) continue;

      let peso = cleanNumericValue(parts[c]);
      if (peso === null) continue;
      if (peso > 1.0 && peso <= 100.0) peso = peso / 100.0;
      if (peso <= 0.0) continue;

      const lo = Math.min(idxRow, idxCol);
      const hi = Math.max(idxRow, idxCol);
      const key = `${lo}-${hi}`;
      if (!pairAccumulator.has(key)) {
        pairAccumulator.set(key, {
          i: lo, j: hi,
          nomeI: lo === idxRow ? idRow : idCol,
          nomeJ: hi === idxRow ? idRow : idCol,
          valori: []
        });
      }
      pairAccumulator.get(key)!.valori.push(peso);
    }
  }

  for (const [, entry] of pairAccumulator) {
    const media = entry.valori.reduce((a, b) => a + b, 0) / entry.valori.length;
    activeRelations.push({
      id_controllo: entry.i,
      id_target: entry.j,
      valore_peso: Number(media.toFixed(6)),
      nome_controllo: entry.nomeI,
      nome_target: entry.nomeJ
    });
  }

  activeRelations.sort((a, b) =>
    a.id_controllo !== b.id_controllo
      ? a.id_controllo - b.id_controllo
      : a.id_target - b.id_target
  );

  return activeRelations;
}

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

  // [FIX 5-bis] Pesi risolti in TS: stessa fonte del Python
const pesiRisoltiQasm: { id: string, peso: number }[] = [];
for (let i = 0; i < numQubits; i++) {
  const r = risorse[i] || { id: `q_${i}`, peso: 0.5 };
  pesiRisoltiQasm.push({ id: r.id, peso: Number(Math.max(0.0, Math.min(1.0, r.peso)).toFixed(6)) });
}

  let initBlocks = '';
  if (isTruncated) {
    initBlocks += `// [WARNING HARDWARE BOUND] Rilevate ${totalInputRows} risorse. Circuito limitato a ${numQubits} qubit fisici (IBM Utility-scale).\n`;
  }
  for (let i = 0; i < numQubits; i++) {
  const p = pesiRisoltiQasm[i];
  const theta = (2.0 * Math.asin(Math.sqrt(p.peso))).toFixed(6);
  initBlocks += `ry(${theta}) q[${i}]; // ${p.id} (p=|1> ${(p.peso * 100).toFixed(1)}%)\n`;
}

  const isNone = vincolo === 'nessun_vincolo' || vincolo === 'senza_entanglement' || vincolo.includes('nessun') || vincolo.includes('indipendent') || vincolo.includes('senza');

  let constraintBlocks = '// Nessun vincolo attivo (Risorse Indipendenti / Stato Separabile Puro)';
  if (!isNone && activeRelations.length > 0) {
    const validRelations = activeRelations.filter(rel => rel.id_controllo < numQubits && rel.id_target < numQubits);
    if (validRelations.length > 0) {
      constraintBlocks = validRelations.map(rel => {
        if (rel.valore_peso >= SOGLIA_CRITICA_RIGIDA) {
          return `cx q[${rel.id_controllo}], q[${rel.id_target}]; // Blocco Rigido (${rel.nome_controllo} -> ${rel.nome_target}, peso = ${rel.valore_peso.toFixed(2)} >= ${SOGLIA_CRITICA_RIGIDA.toFixed(2)})`;
        } else if (rel.valore_peso > 0.00) {
          const phaseAngle = (Math.PI * rel.valore_peso).toFixed(6);
          return `cp(${phaseAngle}) q[${rel.id_controllo}], q[${rel.id_target}]; // Legame Morbido Continuo (${rel.nome_controllo} -> ${rel.nome_target}, peso = ${rel.valore_peso.toFixed(2)} < ${SOGLIA_CRITICA_RIGIDA.toFixed(2)})`;
        }
        return '';
      }).filter(s => s.length > 0).join('\n');
    }
  }

  let measureBlocks = '';
  for (let i = 0; i < numQubits; i++) {
    measureBlocks += `measure q[${i}] -> c[${i}];\n`;
  }

  return `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[${numQubits}] q;\nbit[${numQubits}] c;\n\n// ==========================================\n// 1. INIZIALIZZAZIONE STATO DINAMICA (${numQubits} QUBIT)\n// Formula esatta: theta = 2 * arcsin(sqrt(peso))\n// ==========================================\n${initBlocks.trim()}\n\n// ------------------------------------------\n// SNAPSHOT SFERA DI BLOCH (STATO PURO FATTORIZZABILE)\n// Coordinate pure calcolate prima della perdita di coerenza locale\n// ------------------------------------------\nbarrier q;\n\n// ==========================================\n// 2. VINCOLI ED ENTANGLEMENT (MATRICE FILE 2)\n// Porte CX (peso >= 0.60) e Porte CP (0.0 < peso < 0.60)\n// ==========================================\n${constraintBlocks}\n\n// ==========================================\n// 3. MISURAZIONE FINALE SEQUENZIALE\n// ==========================================\nbarrier q;\n${measureBlocks.trim()}`;
};

export const generateQiskitPythonCode = (
  sector: string,
  csv1: string,
  csv2: string,
  vincolo: string,
  strategy: string,
  file1Name: string = "1_anagrafica_risorse.csv",
  file2Name: string = "2_matrice_connessioni.csv",
  isDemo: boolean = false
): string => {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const totalInputRows = risorse.length > 0 ? risorse.length : 4;
  const numQubits = Math.min(totalInputRows, MAX_QUANTUM_QUBITS);
  const isTruncated = totalInputRows > MAX_QUANTUM_QUBITS;

  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);

  // [FIX 5] Pesi e relazioni risolti in TypeScript: fonte unica per QASM e Python
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

  let pyCode = `import os\n`;
  pyCode += `import io\n`;
  pyCode += `import sys\n`;
  pyCode += `import numpy as np\n`;
  pyCode += `import pandas as pd\n`;
  pyCode += `import matplotlib.pyplot as plt\n`;
  pyCode += `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\n`;
  pyCode += `from qiskit.visualization import plot_bloch_multivector\n`;
  pyCode += `from qiskit.quantum_info import Statevector\n`;
  pyCode += `try:\n`;
  pyCode += `    from qiskit_aer import AerSimulator\n`;
  pyCode += `    from qiskit_aer.primitives import SamplerV2 as AerSampler\n`;
  pyCode += `    from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager\n`;
  pyCode += `    HAS_AER = True\n`;
  pyCode += `except ImportError:\n`;
  pyCode += `    from qiskit.primitives import StatevectorSampler as AerSampler\n`;
  pyCode += `    HAS_AER = False\n\n`;

  const cleanSector = sector.replace(/[^a-zA-Z0-9]/g, '_') || 'General';
  const cleanStrategy = strategy ? strategy.replace(/[^a-zA-Z0-9 _-]/g, '').trim() : 'Prudente';
  const safeFile1Name = file1Name.replace(/["\\]/g, '');
  const safeFile2Name = file2Name.replace(/["\\]/g, '');
  const pyPayload1 = JSON.stringify(csv1 || '');
  const pyPayload2 = JSON.stringify(csv2 || '');

  pyCode += `# =====================================================================\n`;
  pyCode += `# CONFIGURAZIONE DATASET E NOMI FILE DINAMICI\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `FILE_1_NAME = "${safeFile1Name}"\n`;
  pyCode += `FILE_2_NAME = "${safeFile2Name}"\n`;
  pyCode += `IS_DEMO_DATASET = ${isDemo ? 'True' : 'False'}\n\n`;
  pyCode += `CSV_1_PAYLOAD = ${pyPayload1}\n`;
  pyCode += `CSV_2_PAYLOAD = ${pyPayload2}\n\n`;

  // [FIX 5] Iniezione pesi/relazioni risolti da TypeScript
  pyCode += `# Pesi e relazioni RISOLTI IN TYPESCRIPT (fonte di verità unica, identica al QASM)\n`;
  pyCode += `PESI_RISOLTI = ${JSON.stringify(pesiRisolti)}\n`;
  pyCode += `RELAZIONI_RISOLTE = ${JSON.stringify(relazioniRisolte)}\n\n`;

  // [FIX 6] Log espliciti demo/upload
  pyCode += `# =====================================================================\n`;
  pyCode += `# LOG PROVENIENZA DATI (DEMO vs UPLOAD)\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `if IS_DEMO_DATASET:\n`;
  pyCode += `    print("[DEMO] Uso dataset demo incorporato (nessun file utente caricato).")\n`;
  pyCode += `elif os.path.exists(FILE_1_NAME):\n`;
  pyCode += `    print(f"[UPLOAD] File 1 letto da disco: {FILE_1_NAME}")\n`;
  pyCode += `else:\n`;
  pyCode += `    print("[UPLOAD] File 1 letto da payload di sessione (CSV_1_PAYLOAD).")\n\n`;

  pyCode += `MAX_QUANTUM_QUBITS = 127\n`;
  pyCode += `totale_record = len(PESI_RISOLTI)\n`;
  pyCode += `num_qubits = min(totale_record, MAX_QUANTUM_QUBITS)\n\n`;

  pyCode += `if totale_record > MAX_QUANTUM_QUBITS:\n`;
  pyCode += `    print(f"[WARNING HARDWARE BOUND] {totale_record} risorse rilevate. Circuito limitato dinamicamente a 127 qubit IBM fisici.")\n\n`;

  pyCode += `q = QuantumRegister(num_qubits, name="q")\n`;
  pyCode += `c = ClassicalRegister(num_qubits, name="c")\n`;
  pyCode += `qc = QuantumCircuit(q, c, name="QC_${cleanSector}_${cleanStrategy.replace(/[^a-zA-Z0-9]/g, '_')}")\n\n`;

  pyCode += `# =====================================================================\n`;
  pyCode += `# 1. INIZIALIZZAZIONE STATO PURO (PESI INIETTATI DA TYPESCRIPT)\n`;
  pyCode += `# theta_i = 2.0 * np.arcsin(np.sqrt(peso_i)) [0.0 <= theta <= pi]\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `thetas = []\n`;
  pyCode += `for i in range(num_qubits):\n`;
  pyCode += `    peso_val = float(PESI_RISOLTI[i]['peso'])\n`;
  pyCode += `    theta = 2.0 * np.arcsin(np.sqrt(peso_val))\n`;
  pyCode += `    thetas.append(theta)\n`;
  pyCode += `    qc.ry(theta, q[i])\n\n`;

  pyCode += `# =====================================================================\n`;
  pyCode += `# 2. CATTURA STATEVECTOR PER SFERA DI BLOCH (PRE-ENTANGLEMENT)\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `try:\n`;
  pyCode += `    try:\n`;
  pyCode += `        stato_vettoriale_puro = Statevector(qc)\n`;
  pyCode += `    except Exception:\n`;
  pyCode += `        stato_vettoriale_puro = Statevector.from_instruction(qc)\n`;
  pyCode += `    fig_bloch = plot_bloch_multivector(stato_vettoriale_puro, title="Sfera di Bloch - Stato Puro (${cleanSector})")\n`;
  pyCode += `    fig_bloch.savefig("bloch_sphere_${cleanSector.toLowerCase()}.png", bbox_inches="tight")\n`;
  pyCode += `    print("[BLOCH SPHERE] Snapshot vettoriale esportato con successo in 'bloch_sphere_${cleanSector.toLowerCase()}.png'")\n`;
  pyCode += `except Exception as err:\n`;
  pyCode += `    print(f"[BLOCH SPHERE NOTICE] Rendering vettoriale Bloch: {err}")\n\n`;

  pyCode += `# =====================================================================\n`;
  pyCode += `# 3. TOPOLOGIA ENTANGLEMENT (RELAZIONI INIETTATE DA TYPESCRIPT)\n`;
  pyCode += `# Identiche al QASM: CX >= 0.60, CP in (0, 0.60)\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `qc.barrier()\n`;
  pyCode += `for rel in RELAZIONI_RISOLTE:\n`;
  pyCode += `    i, j, peso = int(rel['i']), int(rel['j']), float(rel['peso'])\n`;
  pyCode += `    if i >= num_qubits or j >= num_qubits:\n`;
  pyCode += `        continue\n`;
  pyCode += `    if peso >= 0.60:\n`;
  pyCode += `        qc.cx(q[i], q[j])  # Blocco Rigido\n`;
  pyCode += `    elif peso > 0.0:\n`;
  pyCode += `        qc.cp(np.pi * peso, q[i], q[j])  # Legame Morbido\n\n`;

  pyCode += `# =====================================================================\n`;
  pyCode += `# 4. MISURAZIONE DINAMICA PER TUTTI I QUBIT ALLOCATI\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `qc.barrier()\n`;
  pyCode += `for i in range(num_qubits):\n`;
  pyCode += `    qc.measure(q[i], c[i])\n\n`;

  pyCode += `# =====================================================================\n`;
  pyCode += `# 5. ESECUZIONE SIMULAZIONE CON PRIMITIVES V2 (AERSAMPLER)\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `if HAS_AER:\n`;
  pyCode += `    simulator = AerSimulator()\n`;
  pyCode += `    pass_manager = generate_preset_pass_manager(backend=simulator, optimization_level=1)\n`;
  pyCode += `    isa_circuit = pass_manager.run(qc)\n`;
  pyCode += `    sampler = AerSampler()\n`;
  pyCode += `    job = sampler.run([isa_circuit], shots=1024)\n`;
  pyCode += `    pub_result = job.result()[0]\n`;
  pyCode += `    counts = pub_result.data.c.get_counts()\n`;
  pyCode += `else:\n`;
  pyCode += `    sampler = AerSampler()\n`;
  pyCode += `    job = sampler.run([qc], shots=1024)\n`;
  pyCode += `    pub_result = job.result()[0]\n`;
  pyCode += `    counts = pub_result.data.c.get_counts()\n\n`;

  pyCode += `print("=====================================================================")\n`;
  pyCode += `print("--- 1. RISULTATO CAMPIONAMENTO QUANTISTICO (IBM AerSampler V2) ---")\n`;
  pyCode += `print("=====================================================================")\n`;
  pyCode += `print("Distribuzione Conteggi:", counts)\n`;
  pyCode += `stato_ottimo = max(counts, key=counts.get)\n`;
  pyCode += `print(f"Stato Dominante (Campione più Frequente) (Strategia ${cleanStrategy}): |{stato_ottimo}> ({counts[stato_ottimo]}/1024 shots)\\n")\n\n`;

  pyCode += `# =====================================================================\n`;
  pyCode += `# 6. RENDERING VISIVO CIRCUITO IBM QUANTUM COMPOSER\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `try:\n`;
  pyCode += `    fig_circuit = qc.draw(output="matplotlib", style="iqp")\n`;
  pyCode += `    fig_circuit.savefig("ibm_circuit_composer.png", bbox_inches="tight")\n`;
  pyCode += `    print("[IMMAGINE CIRCUITO] Layout Circuito IBM Composer esportato con successo in 'ibm_circuit_composer.png'")\n`;
  pyCode += `except Exception as err:\n`;
  pyCode += `    print(f"[IMMAGINE CIRCUITO NOTICE] Schema circuito testuale IBM Composer generato: {err}")\n\n`;

  pyCode += `print("--- COORDINATE SFERA DI BLOCH (Vettori di Stato per Qubit) ---")\n`;
  for (let i = 0; i < numQubits; i++) {
    const r = risorse[i] || { id: `q_${i}`, peso: 0.5 };
    const pesoSafe = Math.max(0.0, Math.min(1.0, r.peso));
    const thetaVal = (2.0 * Math.asin(Math.sqrt(pesoSafe))).toFixed(6);
    const zCoord = Math.cos(Number(thetaVal)).toFixed(4);
    const xCoord = Math.sin(Number(thetaVal)).toFixed(4);
    pyCode += `print(f"  • Qubit q[${i}] (${r.id}): Theta = ${thetaVal} rad | Coordinate Bloch: (X: ${xCoord}, Y: 0.000, Z: ${zCoord})")\n`;
  }
  pyCode += `print("\\n[OK] Circuito Quantistico pronto per esecuzione su IBM Quantum Composer / Hardware Fisico QPU.")\n`;

  return pyCode;
};

/**
 * [FIX 7] DEPRECATA: mantenuta per compatibilità, delega a parseCsv2Deterministic
 * e costruisce la matrice N x N simmetrica dallo stesso parsing.
 * NON usare in nuovi generatori: usare parseCsv2Deterministic.
 */
export function parseCsv2MatrixDeterministic(
  csv2: string,
  risorse: ParsedRisorsa[],
  mappaQubit: Map<string, number>
): number[][] {
  const numItems = risorse.length > 0 ? risorse.length : 4;
  const matrix: number[][] = Array.from({ length: numItems }, (_, i) =>
    Array.from({ length: numItems }, (_, j) => (i === j ? 1.0 : 0.0))
  );
  const relazioni = parseCsv2Deterministic(csv2, mappaQubit);
  for (const rel of relazioni) {
    if (rel.id_controllo < numItems && rel.id_target < numItems) {
      matrix[rel.id_controllo][rel.id_target] = rel.valore_peso;
      matrix[rel.id_target][rel.id_controllo] = rel.valore_peso;
    }
  }
  return matrix;
}

/**
 * Generatore di codice Python per Scenari CLASSICI (HPC / CPU / GPU)
 * Supporta Markowitz / Sharpe Ratio reale, CNN per grafici, XGBoost, GIS e ottimizzazione vincolata da File 2.
 */
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
  const cleanStrategy = strategy ? strategy.replace(/[^a-zA-Z0-9 _-]/g, '').trim() : 'Prudente';
  const cleanSector = sector.replace(/[^a-zA-Z0-9 _-]/g, '_') || 'Generale';
  const cleanScenario = scenarioName.replace(/[^a-zA-Z0-9 _-]/g, '_') || 'Scenario_Standard';
  const safeFile1Name = file1Name.replace(/["\\]/g, '');
  const safeFile2Name = file2Name.replace(/["\\]/g, '');
  const pyPayload1 = JSON.stringify(csv1 || '');
  const pyPayload2 = JSON.stringify(csv2 || '');

  // [FIX 5] Pesi e relazioni risolti in TypeScript (stessa fonte del quantistico)
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);
  const pesiRisolti = risorse.map(r => ({ id: r.id, peso: Number(r.peso.toFixed(6)) }));
  const relazioniRisolte = activeRelations.map(rel => ({
    i: rel.id_controllo,
    j: rel.id_target,
    peso: Number(rel.valore_peso.toFixed(6)),
    nome_i: rel.nome_controllo,
    nome_j: rel.nome_target
  }));

  let pyCode = `#!/usr/bin/env python3\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `# PIPELINE CLASSICA AD ALTE PRESTAZIONI (HPC NUMPY / SCIPY SLSQP)\n`;
  pyCode += `# SETTORE: ${cleanSector}\n`;
  pyCode += `# SCENARIO: ${cleanScenario}\n`;
  pyCode += `# STRATEGIA: ${cleanStrategy}\n`;
  pyCode += `# Zero hardcoding: parsing posizionale su N righe + pesi iniettati\n`;
  pyCode += `# =====================================================================\n\n`;

  pyCode += `import os\n`;
  pyCode += `import io\n`;
  pyCode += `import sys\n`;
  pyCode += `import numpy as np\n`;
  pyCode += `import pandas as pd\n`;
  pyCode += `import scipy.optimize as opt\n\n`;

  pyCode += `NOME_SETTORE = "${cleanSector}"\n`;
  pyCode += `NOME_SCENARIO = "${cleanScenario}"\n`;
  pyCode += `STRATEGIA_SCELTA = "${cleanStrategy}"\n\n`;

  pyCode += `FILE_1_NAME = "${safeFile1Name}"\n`;
  pyCode += `FILE_2_NAME = "${safeFile2Name}"\n`;
  pyCode += `IS_DEMO_DATASET = ${isDemo ? 'True' : 'False'}\n\n`;
  pyCode += `CSV_1_PAYLOAD = ${pyPayload1}\n`;
  pyCode += `CSV_2_PAYLOAD = ${pyPayload2}\n\n`;

  // [FIX 5] Iniezione pesi/relazioni risolti
  pyCode += `# Pesi e relazioni RISOLTI IN TYPESCRIPT (fonte di verità unica)\n`;
  pyCode += `PESI_RISOLTI = ${JSON.stringify(pesiRisolti)}\n`;
  pyCode += `RELAZIONI_RISOLTE = ${JSON.stringify(relazioniRisolte)}\n\n`;

  // [FIX 6] Log demo/upload
  pyCode += `if IS_DEMO_DATASET:\n`;
  pyCode += `    print("[DEMO] Uso dataset demo incorporato.")\n`;
  pyCode += `elif os.path.exists(FILE_1_NAME):\n`;
  pyCode += `    print(f"[UPLOAD] File 1 letto da disco: {FILE_1_NAME}")\n`;
  pyCode += `else:\n`;
  pyCode += `    print("[UPLOAD] File 1 letto da payload di sessione.")\n\n`;

  pyCode += `asset_nomi = [p['id'] for p in PESI_RISOLTI]\n`;
  pyCode += `rendimenti_attesi = np.array([p['peso'] for p in PESI_RISOLTI], dtype=float)\n`;
  pyCode += `num_assets = len(asset_nomi)\n`;
  pyCode += `print(f"[HPC ENGINE]: Acquisiti {num_assets} asset/risorse (pesi iniettati).")\n\n`;

  pyCode += `# =====================================================================\n`;
  pyCode += `# MATRICE DI RISCHIO DI RETE (FILE 2) - Simmetrizzata\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `matrice_connessioni = np.eye(num_assets, dtype=float)\n`;
  pyCode += `for rel in RELAZIONI_RISOLTE:\n`;
  pyCode += `    i, j, peso = int(rel['i']), int(rel['j']), float(rel['peso'])\n`;
  pyCode += `    if i < num_assets and j < num_assets:\n`;
  pyCode += `        matrice_connessioni[i, j] = peso\n`;
  pyCode += `        matrice_connessioni[j, i] = peso\n\n`;

  pyCode += `matrice_simm = matrice_connessioni.copy()\n`;
  pyCode += `np.fill_diagonal(matrice_simm, 1.0)\n`;
  pyCode += `eigvals, eigvecs = np.linalg.eigh(matrice_simm)\n`;
  pyCode += `eigvals = np.maximum(eigvals, 1e-5)\n`;
  pyCode += `matrice_rischio_rete = eigvecs @ np.diag(eigvals) @ eigvecs.T\n\n`;

  pyCode += `risk_free_rate = 0.02\n`;
  pyCode += `def calcola_sharpe_sistemico_negativo(pesi):\n`;
  pyCode += `    r_p = np.sum(rendimenti_attesi * pesi)\n`;
  pyCode += `    var_rete = np.dot(pesi.T, np.dot(matrice_rischio_rete, pesi))\n`;
  pyCode += `    vol_rete = np.sqrt(max(1e-8, var_rete))\n`;
  pyCode += `    return -(r_p - risk_free_rate) / vol_rete\n\n`;

  pyCode += `pesi_iniziali = np.ones(num_assets) / num_assets\n`;
  pyCode += `vincoli = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0})\n`;
  pyCode += `limiti = tuple((0.0, 1.0) for _ in range(num_assets))\n\n`;

  pyCode += `risultato = opt.minimize(calcola_sharpe_sistemico_negativo, pesi_iniziali, method='SLSQP', bounds=limiti, constraints=vincoli)\n`;
  pyCode += `if not risultato.success or np.any(np.isnan(risultato.x)) or np.sum(risultato.x) <= 0:\n`;
  pyCode += `    pesi_ottimi = pesi_iniziali\n`;
  pyCode += `else:\n`;
  pyCode += `    pesi_ottimi = np.clip(risultato.x, 0.0, 1.0)\n`;
  pyCode += `    pesi_ottimi = pesi_ottimi / np.sum(pesi_ottimi)\n\n`;

  pyCode += `ritorno_ottimo = np.sum(rendimenti_attesi * pesi_ottimi)\n`;
  pyCode += `rischio_rete_ottimo = np.sqrt(max(1e-8, np.dot(pesi_ottimi.T, np.dot(matrice_rischio_rete, pesi_ottimi))))\n`;
  pyCode += `sharpe_sistemico_ottimo = (ritorno_ottimo - risk_free_rate) / rischio_rete_ottimo\n\n`;

  pyCode += `print("=====================================================================")\n`;
  pyCode += `print(f"--- RISULTATO OTTIMIZZAZIONE CLASSICA DI RETE (SLSQP / {NOME_SETTORE}) ---")\n`;
  pyCode += `print("=====================================================================")\n`;
  pyCode += `print(f"Strategia Selezionata:                 {STRATEGIA_SCELTA}")\n`;
  pyCode += `print(f"Rendimento/Protezione Atteso (mu):    {ritorno_ottimo * 100:.2f}%")\n`;
  pyCode += `print(f"Rischio Sistemico / Contagio Rete (C): {rischio_rete_ottimo * 100:.2f}%")\n`;
  pyCode += `print(f"Indice di Sharpe Sistemico di Rete:    {sharpe_sistemico_ottimo:.4f}\\n")\n`;
  pyCode += `print("--- ALLOCAZIONE NUMERICA OTTIMALE SULLE RISORSE REALI ---")\n`;
  pyCode += `for nome, peso in zip(asset_nomi, pesi_ottimi):\n`;
  pyCode += `    print(f"  • {nome:<32}: Allocazione = {peso * 100:6.2f}%")\n`;
  pyCode += `print("=====================================================================")\n`;

  return pyCode;
};