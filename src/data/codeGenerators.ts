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

function parseCsv1Deterministic(csv1: string): { risorse: ParsedRisorsa[], mappaQubit: Map<string, number> } {
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

export const generateQiskitCode = (
  sector: string, 
  csv1: string, 
  csv2: string, 
  vincolo: string, 
  strategy: string
): string => {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const numItems = risorse.length > 0 ? risorse.length : 4;
  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);

  // 1. Inizializzazione Qubit (Formula quantistica esatta: theta = 2 * arcsin(sqrt(peso)))
  const initBlocks = risorse.map((r, i) => {
    const pesoSafe = Math.max(0.0, Math.min(1.0, r.peso));
    const theta = (2.0 * Math.asin(Math.sqrt(pesoSafe))).toFixed(6);
    return `ry(${theta}) q[${i}]; // ${r.id} (peso = ${pesoSafe.toFixed(2)})`;
  }).join('\n');

  // 2. Entanglement e Vincoli
  const isNone = vincolo === 'nessun_vincolo' || vincolo === 'senza_entanglement' || vincolo.includes('nessun') || vincolo.includes('indipendent') || vincolo.includes('senza');
  const isHard = !isNone && (vincolo === 'blocco_rigido' || vincolo.includes('rigido') || vincolo.includes('hard'));

  let constraintBlocks = '// Nessun vincolo attivo';
  if (isNone) {
    constraintBlocks = '// Nessun Entanglement (Risorse Indipendenti)';
  } else if (activeRelations.length > 0) {
    if (isHard) {
      // Regola del Blocco Rigido: solo connessioni critiche >= 0.60
      const criticalRelations = activeRelations.filter(rel => rel.valore_peso >= SOGLIA_CRITICA_RIGIDA);
      if (criticalRelations.length > 0) {
        constraintBlocks = criticalRelations.map(rel => {
          return `cx q[${rel.id_controllo}], q[${rel.id_target}]; // Blocco Rigido (${rel.nome_controllo} -> ${rel.nome_target}, peso = ${rel.valore_peso.toFixed(2)} >= ${SOGLIA_CRITICA_RIGIDA.toFixed(2)})`;
        }).join('\n');
      } else {
        constraintBlocks = `// Nessuna relazione critica sopra la soglia (>= ${SOGLIA_CRITICA_RIGIDA.toFixed(2)}) per Blocco Rigido`;
      }
    } else {
      // Legame Morbido (Continuous Phase)
      constraintBlocks = activeRelations.map(rel => {
        const phaseAngle = ((Math.PI / 4) * rel.valore_peso).toFixed(6);
        return `cp(${phaseAngle}) q[${rel.id_controllo}], q[${rel.id_target}]; // Legame Morbido (${rel.nome_controllo} -> ${rel.nome_target}, peso = ${rel.valore_peso.toFixed(2)})`;
      }).join('\n');
    }
  }

  let measureBlocks = '';
  for (let i = 0; i < numItems; i++) {
    measureBlocks += `measure q[${i}] -> c[${i}];\n`;
  }

  return `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[${numItems}] q;\nbit[${numItems}] c;\n\n// ==========================================\n// 1. INIZIALIZZAZIONE STATO (RY ROTATIONS)\n// Formula esatta: theta = 2 * arcsin(sqrt(peso))\n// ==========================================\n${initBlocks}\n\n// ==========================================\n// 2. VINCOLI ED ENTANGLEMENT\n// ==========================================\n${constraintBlocks}\n\n// ==========================================\n// 3. MISURAZIONE FINALE\n// ==========================================\n${measureBlocks.trim()}`;
};

export const generateQiskitPythonCode = (
  sector: string, 
  csv1: string, 
  csv2: string, 
  vincolo: string, 
  strategy: string
): string => {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const numItems = risorse.length > 0 ? risorse.length : 4;
  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);

  let pyCode = `import numpy as np\n`;
  pyCode += `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister, transpile\n`;
  pyCode += `from qiskit_aer import AerSimulator\n\n`;

  pyCode += `# 1. Definizione Registri Sequenziali (FIFO Rigido: riga CSV 1 -> q[0], riga 2 -> q[1], ...)\n`;
  pyCode += `q = QuantumRegister(${numItems}, name="q")\n`;
  pyCode += `c = ClassicalRegister(${numItems}, name="c")\n`;
  pyCode += `qc = QuantumCircuit(q, c)\n\n`;

  pyCode += `# 2. Inizializzazione Qubit (Amplitude Encoding)\n`;
  pyCode += `# Formula quantistica esatta: theta = 2.0 * np.arcsin(np.sqrt(peso_safe))\n`;
  risorse.forEach((r, i) => {
    const pesoSafe = Math.max(0.0, Math.min(1.0, r.peso));
    const theta = (2.0 * Math.asin(Math.sqrt(pesoSafe))).toFixed(6);
    pyCode += `qc.ry(${theta}, q[${i}])  # ${r.id} (peso = ${pesoSafe.toFixed(2)})\n`;
  });

  pyCode += `\n# 3. Entanglement e Relazioni di Vincolo\n`;
  const isNone = vincolo === 'nessun_vincolo' || vincolo === 'senza_entanglement' || vincolo.includes('nessun') || vincolo.includes('indipendent') || vincolo.includes('senza');
  const isHard = !isNone && (vincolo === 'blocco_rigido' || vincolo.includes('rigido') || vincolo.includes('hard'));

  if (isNone) {
    pyCode += `# Nessun Entanglement (Risorse Indipendenti)\n`;
  } else if (activeRelations.length > 0) {
    if (isHard) {
      const criticalRelations = activeRelations.filter(rel => rel.valore_peso >= SOGLIA_CRITICA_RIGIDA);
      if (criticalRelations.length > 0) {
        criticalRelations.forEach(rel => {
          pyCode += `qc.cx(q[${rel.id_controllo}], q[${rel.id_target}])  # Blocco Rigido (${rel.nome_controllo} -> ${rel.nome_target}, peso = ${rel.valore_peso.toFixed(2)} >= ${SOGLIA_CRITICA_RIGIDA.toFixed(2)})\n`;
        });
      } else {
        pyCode += `# Nessuna relazione critica sopra la soglia (>= ${SOGLIA_CRITICA_RIGIDA.toFixed(2)}) per Blocco Rigido\n`;
      }
    } else {
      activeRelations.forEach(rel => {
        const phaseAngle = ((Math.PI / 4) * rel.valore_peso).toFixed(6);
        pyCode += `qc.cp(${phaseAngle}, q[${rel.id_controllo}], q[${rel.id_target}])  # Legame Morbido (${rel.nome_controllo} -> ${rel.nome_target}, peso = ${rel.valore_peso.toFixed(2)})\n`;
      });
    }
  }

  pyCode += `\n# 4. Misurazione e Simulatore Locale AerSimulator\n`;
  pyCode += `qc.measure(q, c)\n`;
  pyCode += `simulator = AerSimulator()\n`;
  pyCode += `compiled_circuit = transpile(qc, simulator)\n`;
  pyCode += `job = simulator.run(compiled_circuit, shots=1024)\n`;
  pyCode += `print(job.result().get_counts())\n`;

  return pyCode;
};
