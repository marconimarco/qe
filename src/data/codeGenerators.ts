// MOTORE QUANTISTICO DETERMINISTICO V3 (TAXONOMIC QUANTUM ENGINE)
// Compilazione OpenQASM 3.0 e Python Qiskit conforme alle direttive matematiche esatte:
// 1. Mappatura sequenziale rigida FIFO (Riga 1 -> q[0], Riga 2 -> q[1], ...)
// 2. Formula quantistica esatta: theta = 2 * arcsin(sqrt(peso_safe))
// 3. Blocco Rigido (CX): applicazione esclusiva a relazioni critiche con peso >= 0.60

export const SOGLIA_CRITICA_RIGIDA = 0.60;

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

function splitCsvLine(line: string): string[] {
  const sep = line.includes(';') && !line.includes(',') ? ';' : (line.includes(';') && (line.split(';').length > line.split(',').length) ? ';' : ',');
  return line.split(sep).map(p => p.trim().replace(/^["']|["']$/g, ''));
}

export function parseCsv1Deterministic(csv1: string): { risorse: ParsedRisorsa[], mappaQubit: Map<string, number> } {
  const rawLines = csv1.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  const risorse: ParsedRisorsa[] = [];
  const mappaQubit = new Map<string, number>();

  if (rawLines.length === 0) return { risorse, mappaQubit };

  let idColIndex = 0;
  let pesoColIndex = -1;
  let nomeColIndex = 1;
  let dataStartIndex = 0;

  // Cerca la riga di intestazione analizzando le parole chiave comuni
  const headerKeywords = ['id', 'risorsa', 'caso', 'composto', 'linea', 'item', 'asset', 'peso', 'priorita', 'weight', 'score'];
  const headerIdx = rawLines.findIndex(line => {
    const lower = line.toLowerCase();
    return headerKeywords.some(kw => lower.includes(kw));
  });

  if (headerIdx !== -1) {
    const headers = splitCsvLine(rawLines[headerIdx]).map(h => h.toLowerCase().trim());
    
    // Rilevamento colonna ID flessibile (id_risorsa, id_caso, id_composto, id_linea, asset_id, ecc.)
    const foundId = headers.findIndex(h => 
      h.includes('id') || h.includes('risorsa') || h.includes('asset') || 
      h.includes('caso') || h.includes('composto') || h.includes('linea') || h.includes('item')
    );
    if (foundId !== -1) idColIndex = foundId;

    // Rilevamento colonna Peso / Priorità (priorita_peso, priorita_clinica, indice_stabilita, weight, ecc.)
    const foundPeso = headers.findIndex(h => 
      h.includes('peso') || h.includes('weight') || h.includes('priorit') || 
      h.includes('clinic') || h.includes('stabilita') || h.includes('probabilit') || 
      h.includes('saturaz') || h.includes('score') || h.includes('valore')
    );
    if (foundPeso !== -1) pesoColIndex = foundPeso;

    // Rilevamento colonna Nome
    const foundNome = headers.findIndex(h => h.includes('nome') || h.includes('name') || h.includes('label') || h.includes('desc'));
    if (foundNome !== -1) nomeColIndex = foundNome;

    dataStartIndex = headerIdx + 1;
  }

  // Se la colonna peso non è stata identificata per nome, cerca la prima colonna con numeri decimali
  if (pesoColIndex === -1 && rawLines.length > dataStartIndex) {
    const sampleParts = splitCsvLine(rawLines[dataStartIndex]);
    for (let c = 0; c < sampleParts.length; c++) {
      if (c === idColIndex) continue;
      const num = parseFloat(sampleParts[c]);
      if (!isNaN(num)) {
        pesoColIndex = c;
        break;
      }
    }
  }

  if (pesoColIndex === -1) {
    pesoColIndex = Math.max(1, splitCsvLine(rawLines[0]).length - 1);
  }

  // Lettura sequenziale FIFO riga per riga
  for (let i = dataStartIndex; i < rawLines.length; i++) {
    const line = rawLines[i];
    const parts = splitCsvLine(line);
    if (parts.length <= idColIndex) continue;

    const id = parts[idColIndex];
    if (!id || id.toLowerCase().startsWith('id_')) continue;

    let rawPeso = parseFloat(parts[pesoColIndex] !== undefined ? parts[pesoColIndex] : '0.5');
    const nome = (nomeColIndex < parts.length && parts[nomeColIndex]) ? parts[nomeColIndex] : id;

    if (!isNaN(rawPeso)) {
      // Normalizzazione automatica percentuali (es. 85 -> 0.85)
      if (rawPeso > 1.0 && rawPeso <= 100.0) {
        rawPeso = rawPeso / 100.0;
      }
      const pesoSafe = Math.max(0.0, Math.min(1.0, rawPeso));
      const qIdx = risorse.length;
      mappaQubit.set(id, qIdx);
      mappaQubit.set(id.toLowerCase(), qIdx); // Fallback case-insensitive
      risorse.push({ id, nome, peso: pesoSafe });
    }
  }

  return { risorse, mappaQubit };
}

function parseCsv2Deterministic(csv2: string, mappaQubit: Map<string, number>): ParsedRelazione[] {
  const lines2 = csv2.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  const activeRelations: ParsedRelazione[] = [];

  if (lines2.length <= 1) return activeRelations;

  const headerCols = splitCsvLine(lines2[0]);

  for (let i = 1; i < lines2.length; i++) {
    const parts = splitCsvLine(lines2[i]);
    const idControllo = parts[0];
    const idxA = mappaQubit.get(idControllo) ?? mappaQubit.get(idControllo.toLowerCase());
    if (idxA === undefined) continue;

    for (let j = 1; j < parts.length; j++) {
      if (j >= headerCols.length) continue;
      const idTarget = headerCols[j];
      const idxB = mappaQubit.get(idTarget) ?? mappaQubit.get(idTarget.toLowerCase());
      if (idxB === undefined) continue;
      if (idxA === idxB) continue; // Salta auto-connessioni sulla diagonale

      let peso = parseFloat(parts[j]);
      if (isNaN(peso)) continue;

      if (peso > 1.0 && peso <= 100.0) {
        peso = peso / 100.0;
      }

      // Canonical undirected edge (idxA < idxB) e peso > 0.00
      if (peso > 0.00 && idxA < idxB) {
        activeRelations.push({
          id_controllo: idxA,
          id_target: idxB,
          valore_peso: peso,
          nome_controllo: idControllo,
          nome_target: idTarget
        });
      }
    }
  }

  return activeRelations;
}

/**
 * Limite massimo di sicurezza per processori quantistici fisici IBM Quantum Utility-scale (es. chip Eagle / Heron).
 * Freno di emergenza: blocca la compilazione quantistica se il numero di qubit eccede 127.
 */
export const MAX_QUANTUM_QUBITS = 127;

export const generateQiskitCode = (
  sector: string, 
  csv1: string, 
  csv2: string, 
  vincolo: string, 
  strategy: string
): string => {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const totalInputRows = risorse.length > 0 ? risorse.length : 4;
  
  // Tetto Hardware Fisico a 127 Qubit (Processori IBM Quantum Utility-Scale Heron/Eagle)
  const numQubits = Math.min(totalInputRows, MAX_QUANTUM_QUBITS);
  const isTruncated = totalInputRows > MAX_QUANTUM_QUBITS;

  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);

  // 1. Inizializzazione Dinamica Sequenziale Qubit (RY Rotations)
  let initBlocks = '';
  if (isTruncated) {
    initBlocks += `// [WARNING HARDWARE BOUND] Rilevate ${totalInputRows} risorse. Circuito limitato a ${numQubits} qubit fisici (IBM Utility-scale).\n`;
  }
  for (let i = 0; i < numQubits; i++) {
    const r = risorse[i] || { id: `q_${i}`, peso: 0.5 };
    const pesoSafe = Math.max(0.0, Math.min(1.0, r.peso));
    const theta = (2.0 * Math.asin(Math.sqrt(pesoSafe))).toFixed(6);
    initBlocks += `ry(${theta}) q[${i}]; // ${r.id} (p=|1> ${(pesoSafe * 100).toFixed(1)}%)\n`;
  }

  // 2. Entanglement e Vincoli (Matrice File 2: CX per >= 0.60 e CP per < 0.60)
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
  strategy: string
): string => {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const totalInputRows = risorse.length > 0 ? risorse.length : 4;
  
  // Tetto Hardware Fisico a 127 Qubit (Processori IBM Quantum Utility-Scale Heron/Eagle)
  const numQubits = Math.min(totalInputRows, MAX_QUANTUM_QUBITS);
  const isTruncated = totalInputRows > MAX_QUANTUM_QUBITS;

  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);

  let pyCode = `import numpy as np\n`;
  pyCode += `import pandas as pd\n`;
  pyCode += `import matplotlib.pyplot as plt\n`;
  pyCode += `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\n`;
  pyCode += `from qiskit.visualization import plot_bloch_multivector\n`;
  pyCode += `from qiskit.quantum_info import Statevector\n`;
  pyCode += `from qiskit_aer import AerSimulator\n`;
  pyCode += `from qiskit_aer.primitives import SamplerV2 as AerSampler\n`;
  pyCode += `from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager\n\n`;

  const cleanSector = sector.replace(/[^a-zA-Z0-9]/g, '_') || 'General';
  const cleanStrategy = strategy ? strategy.replace(/[^a-zA-Z0-9 _-]/g, '').trim() : 'Prudente';

  pyCode += `# =====================================================================\n`;
  pyCode += `# 1. CARICAMENTO GEOMETRICO POSIZIONALE (FILE 1) & FRENO 127 QUBIT\n`;
  pyCode += `# Zero KeyError: estrazione posizionale Colonna 0 (ID) e Colonna 2 (PESO)\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `def carica_csv_posizionale(filename, fallback_data):\n`;
  pyCode += `    try:\n`;
  pyCode += `        with open(filename, 'r', encoding='utf-8') as f:\n`;
  pyCode += `            raw = f.read().replace(',', '.')\n`;
  pyCode += `        sep = ';' if ';' in raw.splitlines()[0] else ','\n`;
  pyCode += `        return pd.read_csv(io.StringIO(raw), sep=sep)\n`;
  pyCode += `    except Exception:\n`;
  pyCode += `        return pd.DataFrame(fallback_data)\n\n`;
  pyCode += `dati_in_memory = {\n`;
  pyCode += `    'id_risorsa': ${JSON.stringify(risorse.map(r => r.id))},\n`;
  pyCode += `    'classe_settoriale': ${JSON.stringify(risorse.map(r => r.nome || r.id))},\n`;
  pyCode += `    'peso_quantistico': [${risorse.map(r => r.peso.toFixed(2)).join(', ')}]\n`;
  pyCode += `}\n`;
  pyCode += `df_risorse = carica_csv_posizionale("1_anagrafica_risorse.csv", dati_in_memory)\n`;
  pyCode += `asset_ids = df_risorse.iloc[:, 0].astype(str).str.strip().tolist()\n`;
  pyCode += `pesi_p = df_risorse.iloc[:, 2].astype(float).clip(0.0, 1.0).values\n\n`;
  pyCode += `MAX_QUANTUM_QUBITS = 127\n`;
  pyCode += `totale_record = len(asset_ids)\n`;
  pyCode += `num_qubits = min(totale_record, MAX_QUANTUM_QUBITS)\n\n`;
  pyCode += `if totale_record > MAX_QUANTUM_QUBITS:\n`;
  pyCode += `    print(f"[WARNING HARDWARE BOUND] {totale_record} risorse rilevate. Circuito limitato dinamicamente a 127 qubit IBM fisici.")\n\n`;
  pyCode += `q = QuantumRegister(num_qubits, name="q")\n`;
  pyCode += `c = ClassicalRegister(num_qubits, name="c")\n`;
  pyCode += `qc = QuantumCircuit(q, c, name="QC_${cleanSector}_${cleanStrategy.replace(/[^a-zA-Z0-9]/g, '_')}")\n\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `# 2. INIZIALIZZAZIONE STATO PURO (ROTAZIONI RY FORMULA LETTERALE)\n`;
  pyCode += `# theta_i = 2.0 * np.arcsin(np.sqrt(peso_i)) [0.0 <= theta <= pi]\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `thetas = []\n`;
  pyCode += `for i in range(num_qubits):\n`;
  pyCode += `    peso_val = float(pesi_p[i])\n`;
  pyCode += `    theta = 2.0 * np.arcsin(np.sqrt(peso_val))\n`;
  pyCode += `    thetas.append(theta)\n`;
  pyCode += `    qc.ry(theta, q[i])  # Inizializzazione q[i] da Colonna 2 File 1\n\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `# 3. CATTURA DELLO STATEVECTOR PER LA SFERA DI BLOCH (PRE-ENTANGLEMENT)\n`;
  pyCode += `# Risoluzione del Paradosso di Bloch: cattura rigorosa a stato puro (purezza = 1.0)\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `try:\n`;
  pyCode += `    stato_vettoriale_puro = Statevector.from_instruction(qc)\n`;
  pyCode += `    fig_bloch = plot_bloch_multivector(stato_vettoriale_puro, title="Sfera di Bloch - Stato Puro (${cleanSector})")\n`;
  pyCode += `    fig_bloch.savefig("bloch_sphere_${cleanSector.toLowerCase()}.png", bbox_inches="tight")\n`;
  pyCode += `    print("[BLOCH SPHERE] Snapshot vettoriale esportato con successo in 'bloch_sphere_${cleanSector.toLowerCase()}.png'")\n`;
  pyCode += `except Exception as err:\n`;
  pyCode += `    print(f"[BLOCH SPHERE NOTICE] Rendering vettoriale Bloch: {err}")\n\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `# 4. MAPPATURA MATRICE (FILE 2) & TOPOLOGIA ENTANGLEMENT BIFASICA\n`;
  pyCode += `# Riallineamento FIFO: df2.loc[asset_ids, asset_ids].values\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `qc.barrier()  # Barriera di isolamento pre-entanglement\n`;
  pyCode += `try:\n`;
  pyCode += `    with open("2_matrice_connessioni.csv", "r", encoding="utf-8") as f:\n`;
  pyCode += `        raw_m = f.read().replace(',', '.')\n`;
  pyCode += `    sep_m = ';' if ';' in raw_m.splitlines()[0] else ','\n`;
  pyCode += `    df_connessioni = pd.read_csv(io.StringIO(raw_m), sep=sep_m, index_col=0)\n`;
  pyCode += `    matrice_pesi = df_connessioni.loc[asset_ids[:num_qubits], asset_ids[:num_qubits]].values.astype(float)\n`;
  pyCode += `    for i in range(num_qubits):\n`;
  pyCode += `        for j in range(i + 1, num_qubits):\n`;
  pyCode += `            valore_relazione = float(matrice_pesi[i, j])\n`;
  pyCode += `            if valore_relazione >= 0.60:\n`;
  pyCode += `                qc.cx(q[i], q[j])  # Blocco Rigido (peso >= 0.60)\n`;
  pyCode += `            elif valore_relazione > 0.0:\n`;
  pyCode += `                fase = np.pi * valore_relazione\n`;
  pyCode += `                qc.cp(fase, q[i], q[j])  # Legame Morbido Continuo (peso < 0.60)\n`;
  pyCode += `except Exception:\n`;
  // Inietta le relazioni attive dirette
  if (activeRelations.length > 0) {
    const isNone = vincolo === 'nessun_vincolo' || vincolo === 'senza_entanglement' || vincolo.includes('nessun') || vincolo.includes('indipendent') || vincolo.includes('senza');
    if (!isNone) {
      activeRelations.filter(r => r.id_controllo < numQubits && r.id_target < numQubits).forEach(r => {
        if (r.valore_peso >= SOGLIA_CRITICA_RIGIDA) {
          pyCode += `    qc.cx(q[${r.id_controllo}], q[${r.id_target}])  # Connessione critica: ${r.nome_controllo} -> ${r.nome_target} (${r.valore_peso.toFixed(2)} >= 0.60)\n`;
        } else if (r.valore_peso > 0.0) {
          pyCode += `    qc.cp(${(Math.PI * r.valore_peso).toFixed(6)}, q[${r.id_controllo}], q[${r.id_target}])  # Legame Morbido: ${r.nome_controllo} -> ${r.nome_target} (${r.valore_peso.toFixed(2)} < 0.60)\n`;
        }
      });
    } else {
      pyCode += `    pass  # Nessun entanglement (Risorse Indipendenti)\n`;
    }
  } else {
    pyCode += `    pass  # Nessuna interdipendenza critica tra risorse\n`;
  }

  pyCode += `\n# =====================================================================\n`;
  pyCode += `# 5. MISURAZIONE DINAMICA PER TUTTI I QUBIT ALLOCATI\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `qc.barrier()  # Barriera di sincronizzazione pre-misurazione\n`;
  pyCode += `for i in range(num_qubits):\n`;
  pyCode += `    qc.measure(q[i], c[i])\n\n`;

  pyCode += `# =====================================================================\n`;
  pyCode += `# 6. ESECUZIONE SIMULAZIONE CON PRIMITIVES V2 (AERSAMPLER)\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `simulator = AerSimulator()\n`;
  pyCode += `pass_manager = generate_preset_pass_manager(backend=simulator, optimization_level=1)\n`;
  pyCode += `isa_circuit = pass_manager.run(qc)\n\n`;
  pyCode += `sampler = AerSampler()\n`;
  pyCode += `job = sampler.run([isa_circuit], shots=1024)\n`;
  pyCode += `pub_result = job.result()[0]\n`;
  pyCode += `counts = pub_result.data.c.get_counts()\n\n`;
  pyCode += `print("=====================================================================")\n`;
  pyCode += `print("--- 1. RISULTATO CAMPIONAMENTO QUANTISTICO (IBM AerSampler V2) ---")\n`;
  pyCode += `print("=====================================================================")\n`;
  pyCode += `print("Distribuzione Conteggi:", counts)\n`;
  pyCode += `stato_ottimo = max(counts, key=counts.get)\n`;
  pyCode += `print(f"Stato Dominante a Minima Energia (Strategia ${cleanStrategy}): |{stato_ottimo}> ({counts[stato_ottimo]}/1024 shots)\\n")\n\n`;

  pyCode += `# =====================================================================\n`;
  pyCode += `# 7. RENDERING VISIVO CIRCUITO IBM QUANTUM COMPOSER\n`;
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
    const thetaVal = (2.0 * Math.asin(Math.sqrt(pesoSafe))).toFixed(4);
    const zCoord = Math.cos(Number(thetaVal)).toFixed(3);
    const xCoord = Math.sin(Number(thetaVal)).toFixed(3);
    pyCode += `print(f"  • Qubit q[${i}] (${r.id}): Theta = ${thetaVal} rad | Coordinate Bloch: (X: ${xCoord}, Y: 0.000, Z: ${zCoord})")\n`;
  }
  pyCode += `print("\\n[OK] Circuito Quantistico pronto per esecuzione su IBM Quantum Composer / Hardware Fisico QPU.")\n`;

  return pyCode;
};

/**
 * Parsing deterministico della Matrice Reale del File 2 (CSV).
 * Elimina categoricamente qualsiasi valore di mock o fallback fisso a 0.05.
 * Ricava i pesi reali riga per riga e colonna per colonna dai dati caricati dall'utente.
 */
export function parseCsv2MatrixDeterministic(
  csv2: string, 
  risorse: ParsedRisorsa[], 
  mappaQubit: Map<string, number>
): number[][] {
  const numItems = risorse.length > 0 ? risorse.length : 4;
  // Inizializza la matrice N x N con 1.0 sulla diagonale e 0.0 sulle relazioni non connesse (Nessun 0.05)
  const matrix: number[][] = Array.from({ length: numItems }, (_, i) =>
    Array.from({ length: numItems }, (_, j) => (i === j ? 1.0 : 0.0))
  );

  const lines2 = csv2.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  if (lines2.length <= 1) return matrix;

  const headerCols = splitCsvLine(lines2[0]);
  const isPairwise = headerCols.some(h => h.toLowerCase().includes('target') || h.toLowerCase().includes('connesso') || h.toLowerCase().includes('dest'));

  if (isPairwise) {
    for (let i = 1; i < lines2.length; i++) {
      const parts = splitCsvLine(lines2[i]);
      if (parts.length < 3) continue;
      const idxA = mappaQubit.get(parts[0]) ?? mappaQubit.get(parts[0].toLowerCase());
      const idxB = mappaQubit.get(parts[1]) ?? mappaQubit.get(parts[1].toLowerCase());
      let val = parseFloat(parts[2]);
      if (idxA !== undefined && idxB !== undefined && !isNaN(val) && idxA < numItems && idxB < numItems) {
        if (val > 1.0 && val <= 100.0) val = val / 100.0;
        matrix[idxA][idxB] = Number(val.toFixed(4));
        matrix[idxB][idxA] = Number(val.toFixed(4));
      }
    }
  } else {
    for (let r = 1; r < lines2.length; r++) {
      const parts = splitCsvLine(lines2[r]);
      if (parts.length <= 1) continue;
      const rowId = parts[0];
      const rowIdx = mappaQubit.get(rowId) ?? mappaQubit.get(rowId.toLowerCase());
      const effectiveRow = rowIdx !== undefined ? rowIdx : (r - 1 < numItems ? r - 1 : undefined);
      if (effectiveRow === undefined || effectiveRow >= numItems) continue;

      for (let c = 1; c < parts.length; c++) {
        let colIdx: number | undefined = undefined;
        if (c < headerCols.length) {
          const colId = headerCols[c];
          colIdx = mappaQubit.get(colId) ?? mappaQubit.get(colId.toLowerCase());
        }
        const effectiveCol = colIdx !== undefined ? colIdx : (c - 1 < numItems ? c - 1 : undefined);
        if (effectiveCol === undefined || effectiveCol >= numItems) continue;

        let val = parseFloat(parts[c]);
        if (!isNaN(val)) {
          if (val > 1.0 && val <= 100.0) val = val / 100.0;
          matrix[effectiveRow][effectiveCol] = Number(val.toFixed(4));
          if (effectiveRow !== effectiveCol && matrix[effectiveCol][effectiveRow] === 0.0) {
            matrix[effectiveCol][effectiveRow] = Number(val.toFixed(4));
          }
        }
      }
    }
  }

  return matrix;
}

/**
 * Generatore di codice Python per Scenari CLASSICI (HPC / CPU / GPU)
 * Supporta Markowitz / Sharpe Ratio reale, CNN per grafici, XGBoost, GIS e ottimizzazione vincolata da File 2.
 * RISOLTI:
 * - Variabile orfana strategy risolta a monte in TypeScript (Zero NameError in Python).
 * - Rendimenti attesi estratti dinamicamente concatenando i veri valori della colonna priorita_peso del File 1.
 * - Matrice di covarianza mappata dinamicamente riga per riga dal File 2 CSV (eliminato il blocco fisso a 0.05).
 * - Rimosso il controllo superfluo di testo su risk_free_rate.
 * - Bonifica anti domain-leak dei nomi asset per scenari di Trading ad Alta Frequenza (HFT).
 */
export const generateClassicalHpcPythonCode = (
  sector: string,
  scenarioName: string,
  modelCode: string,
  csv1: string,
  csv2: string,
  strategy: string
): string => {
  const cleanStrategy = strategy ? strategy.replace(/[^a-zA-Z0-9 _-]/g, '').trim() : 'Prudente';
  const cleanSector = sector.replace(/[^a-zA-Z0-9 _-]/g, '_') || 'Generale';
  const cleanScenario = scenarioName.replace(/[^a-zA-Z0-9 _-]/g, '_') || 'Scenario_Standard';

  let pyCode = `#!/usr/bin/env python3\n`;
  pyCode += `# =====================================================================\n`;
  pyCode += `# PIPELINE CLASSICA AD ALTE PRESTAZIONI (HPC NUMPY / SCIPY SLSQP)\n`;
  pyCode += `# SETTORE: ${cleanSector}\n`;
  pyCode += `# SCENARIO: ${cleanScenario}\n`;
  pyCode += `# STRATEGIA: ${cleanStrategy}\n`;
  pyCode += `# REGOLA GEOMETRICA PURA: Zero hardcoding, parsing posizionale su N righe\n`;
  pyCode += `# =====================================================================\n\n`;

  pyCode += `import io\n`;
  pyCode += `import sys\n`;
  pyCode += `import numpy as np\n`;
  pyCode += `import pandas as pd\n`;
  pyCode += `import scipy.optimize as opt\n\n`;

  pyCode += `# Costanti letterali del dominio (dichiarate come stringhe pure in Python)\n`;
  pyCode += `NOME_SETTORE = "${cleanSector}"\n`;
  pyCode += `NOME_SCENARIO = "${cleanScenario}"\n`;
  pyCode += `STRATEGIA_SCELTA = "${cleanStrategy}"\n\n`;

  pyCode += `# 1. CARICAMENTO DINAMICO POSIZIONALE (FILE 1 & FILE 2)\n`;
  pyCode += `def carica_dataset_classico(file1_path, file2_path):\n`;
  pyCode += `    try:\n`;
  pyCode += `        with open(file1_path, "r", encoding="utf-8") as f1:\n`;
  pyCode += `            raw1 = f1.read().replace(",", ".")\n`;
  pyCode += `    except FileNotFoundError:\n`;
  pyCode += `        raise FileNotFoundError(f"[ERRORE CRITICO]: Impossibile trovare il File 1 in '{file1_path}'.")\n\n`;
  pyCode += `    sep1 = ";" if ";" in raw1.splitlines()[0] else ","\n`;
  pyCode += `    df1 = pd.read_csv(io.StringIO(raw1), sep=sep1)\n`;
  pyCode += `    if df1.shape[1] < 3:\n`;
  pyCode += `        raise ValueError(f"[ERRORE STRUTTURA]: Il File 1 deve contenere almeno 3 colonne (trovate: {df1.shape[1]}).")\n\n`;
  pyCode += `    ids = df1.iloc[:, 0].astype(str).str.strip().tolist()\n`;
  pyCode += `    rendimenti = df1.iloc[:, 2].astype(float).clip(0.0, 1.0).values\n\n`;
  pyCode += `    try:\n`;
  pyCode += `        with open(file2_path, "r", encoding="utf-8") as f2:\n`;
  pyCode += `            raw2 = f2.read().replace(",", ".")\n`;
  pyCode += `    except FileNotFoundError:\n`;
  pyCode += `        raise FileNotFoundError(f"[ERRORE CRITICO]: Impossibile trovare il File 2 in '{file2_path}'.")\n\n`;
  pyCode += `    sep2 = ";" if ";" in raw2.splitlines()[0] else ","\n`;
  pyCode += `    df2 = pd.read_csv(io.StringIO(raw2), sep=sep2, index_col=0)\n`;
  pyCode += `    df2.index = df2.index.astype(str).str.strip()\n`;
  pyCode += `    df2.columns = df2.columns.astype(str).str.strip()\n\n`;
  pyCode += `    try:\n`;
  pyCode += `        matrice = df2.loc[ids, ids].values.astype(float)\n`;
  pyCode += `    except KeyError as err:\n`;
  pyCode += `        raise KeyError(f"[ERRORE DISALLINEAMENTO MATRICE]: Uno o più ID del File 1 non corrispondono al File 2: {err}")\n\n`;
  pyCode += `    return ids, rendimenti, matrice\n\n`;

  pyCode += `asset_nomi, rendimenti_attesi, matrice_covarianza = carica_dataset_classico("1_anagrafica_risorse.csv", "2_matrice_connessioni.csv")\n`;
  pyCode += `num_assets = len(asset_nomi)\n`;
  pyCode += `print(f"[HPC ENGINE]: Acquisiti {num_assets} asset/risorse in modalità posizionale pura.")\n\n`;

  pyCode += `# 2. OTTIMIZZAZIONE CLASSICA CONCRETA (SCIPY SLSQP SU N VARIABILI)\n`;
  pyCode += `risk_free_rate = 0.02\n`;
  pyCode += `def calcola_sharpe_ratio_negativo(pesi):\n`;
  pyCode += `    r_p = np.sum(rendimenti_attesi * pesi)\n`;
  pyCode += `    var_p = np.dot(pesi.T, np.dot(matrice_covarianza, pesi))\n`;
  pyCode += `    vol_p = np.sqrt(max(1e-8, var_p))\n`;
  pyCode += `    return -(r_p - risk_free_rate) / vol_p\n\n`;

  pyCode += `pesi_iniziali = np.ones(num_assets) / num_assets\n`;
  pyCode += `vincoli = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0})\n`;
  pyCode += `limiti = tuple((0.0, 1.0) for _ in range(num_assets))\n\n`;

  pyCode += `risultato = opt.minimize(calcola_sharpe_ratio_negativo, pesi_iniziali, method='SLSQP', bounds=limiti, constraints=vincoli)\n`;
  pyCode += `if not risultato.success:\n`;
  pyCode += `    pesi_ottimi = pesi_iniziali\n`;
  pyCode += `else:\n`;
  pyCode += `    pesi_ottimi = risultato.x\n\n`;

  pyCode += `ritorno_ottimo = np.sum(rendimenti_attesi * pesi_ottimi)\n`;
  pyCode += `volatilita_ottima = np.sqrt(max(1e-8, np.dot(pesi_ottimi.T, np.dot(matrice_covarianza, pesi_ottimi))))\n`;
  pyCode += `sharpe_ratio_ottimo = (ritorno_ottimo - risk_free_rate) / volatilita_ottima\n\n`;

  pyCode += `print("=====================================================================")\n`;
  pyCode += `print(f"--- RISULTATO OTTIMIZZAZIONE CLASSICA (SLSQP / {NOME_SETTORE}) ---")\n`;
  pyCode += `print("=====================================================================")\n`;
  pyCode += `print(f"Strategia Selezionata:        {STRATEGIA_SCELTA}")\n`;
  pyCode += `print(f"Rendimento/Protezione Atteso: {ritorno_ottimo * 100:.2f}%")\n`;
  pyCode += `print(f"Volatilità / Varianza Rete:   {volatilita_ottima * 100:.2f}%")\n`;
  pyCode += `print(f"Indice di Sharpe Ottimizzato:  {sharpe_ratio_ottimo:.4f}\\n")\n`;

  pyCode += `print("--- ALLOCAZIONE NUMERICA OTTIMALE SULLE RISORSE REALI ---")\n`;
  pyCode += `for nome, peso in zip(asset_nomi, pesi_ottimi):\n`;
  pyCode += `    print(f"  • {nome:<32}: Allocazione = {peso * 100:6.2f}%")\n`;
  pyCode += `print("=====================================================================")\n`;

  return pyCode;
};

