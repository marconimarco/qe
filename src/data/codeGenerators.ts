// MOTORE QUANTISTICO DETERMINISTICO V3 (TAXONOMIC QUANTUM ENGINE)
// Compilazione OpenQASM 3.0 e Python Qiskit conforme alle direttive matematiche

export const generateQiskitCode = (
  sector: string, 
  csv1: string, 
  csv2: string, 
  vincolo: string, 
  strategy: string
): string => {
  const colId = 'id_risorsa';
  const colPeso = 'priorita_peso';

  const lines1 = csv1.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#') && !l.startsWith(colId));
  
  const mappa_qubit = new Map<string, number>();
  const parsedRisorse: Array<{id: string, peso: number}> = [];
  
  let pesoColIndex = 5; 
  let idColIndex = 0;
  
  const firstLine = csv1.split('\n').find(l => l.trim() !== '' && l.includes(colId));
  if (firstLine) {
     const headers = firstLine.split(',').map(h => h.trim());
     const foundIdIdx = headers.indexOf(colId);
     const foundPesoIdx = headers.indexOf(colPeso);
     if (foundIdIdx !== -1) idColIndex = foundIdIdx;
     if (foundPesoIdx !== -1) pesoColIndex = foundPesoIdx;
  }

  lines1.forEach((l) => {
    if (l.includes(colId)) return;
    const parts = l.split(',');
    if (parts.length <= Math.max(idColIndex, pesoColIndex)) return;

    const id = parts[idColIndex].trim();
    const rawPeso = parseFloat(parts[pesoColIndex] || '0.5');
    
    if (!isNaN(rawPeso) && rawPeso >= 0 && rawPeso <= 1.0) {
      const qubitIndex = parsedRisorse.length; 
      mappa_qubit.set(id, qubitIndex);
      parsedRisorse.push({ id, peso: rawPeso });
    }
  });
  
  const numItems = parsedRisorse.length > 0 ? parsedRisorse.length : 4;

  const lines2 = csv2.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#'));
  const activeRelations: Array<{id_controllo: number, id_target: number, valore_peso: number}> = [];
  
  if (lines2.length > 1) {
    const headerCols = lines2[0].split(',').map(h => h.trim());
    
    for (let i = 1; i < lines2.length; i++) {
      const parts = lines2[i].split(',').map(p => p.trim());
      const idControllo = parts[0];
      const idxA = mappa_qubit.get(idControllo);
      
      if (idxA === undefined) continue;

      for (let j = 1; j < parts.length; j++) {
        const idTarget = headerCols[j];
        const idxB = mappa_qubit.get(idTarget);
        
        if (idxB === undefined) continue;
        if (idxA === idxB) continue; 

        const peso = parseFloat(parts[j]);
        if (!isNaN(peso) && peso > 0.00 && idxA < idxB) {
          activeRelations.push({ id_controllo: idxA, id_target: idxB, valore_peso: peso });
        }
      }
    }
  }

  const stratLower = strategy.toLowerCase();
  const isAggressiva = stratLower.includes('aggressiva') || stratLower.includes('spinta') || stratLower.includes('massimizz') || stratLower.includes('sfruttamento') || stratLower.includes('alpha') || stratLower.includes('makespan') || stratLower.includes('throughput') || stratLower.includes('screening') || strategy.includes('⚡');
  const isPrudente = stratLower.includes('prudent') || stratLower.includes('conservazion') || stratLower.includes('tutela') || stratLower.includes('bilanciamento') || stratLower.includes('margin') || stratLower.includes('sharpe') || stratLower.includes('longevità') || stratLower.includes('riserve') || stratLower.includes('continuità') || strategy.includes('🛡️');

  // 1. Inizializzazione Qubit (Amplitude Encoding)
  const initBlocks = parsedRisorse.map((r, i) => {
    let adjustedPeso = r.peso;
    if (isAggressiva) {
      adjustedPeso = Math.min(1.0, r.peso * 1.15);
    } else if (isPrudente) {
      adjustedPeso = r.peso * 0.85;
    }
    const pesoSafe = Math.max(0.0, Math.min(1.0, adjustedPeso));
    const theta = (2 * Math.asin(Math.sqrt(pesoSafe))).toFixed(4);
    return `// Inizializzazione q[${i}]\nry(${theta}) q[${i}];`;
  }).join('\n');

  // 2. Entanglement e Vincoli
  const isNone = vincolo === 'nessun_vincolo' || vincolo === 'senza_entanglement' || vincolo.includes('nessun') || vincolo.includes('indipendent') || vincolo.includes('senza');
  const isHard = !isNone && (vincolo === 'blocco_rigido' || vincolo.includes('rigido') || vincolo.includes('hard'));

  let constraintBlocks = '// Nessun vincolo attivo';
  if (isNone) {
    constraintBlocks = '// Nessun Entanglement (Risorse Indipendenti)';
  } else if (activeRelations.length > 0) {
    constraintBlocks = activeRelations.map(rel => {
      if (isHard) {
        return `cx q[${rel.id_controllo}], q[${rel.id_target}]; // Blocco Rigido`;
      } else {
        const phaseAngle = ((Math.PI / 4) * rel.valore_peso).toFixed(4);
        return `cp(${phaseAngle}) q[${rel.id_controllo}], q[${rel.id_target}]; // Legame Morbido`;
      }
    }).join('\n');
  }

  let measureBlocks = '';
  for (let i = 0; i < numItems; i++) {
    measureBlocks += `measure q[${i}] -> c[${i}];\n`;
  }

  return `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[${numItems}] q;\nbit[${numItems}] c;\n\n${initBlocks}\n\n${constraintBlocks}\n\n${measureBlocks}`;
};

export const generateQiskitPythonCode = (
  sector: string, 
  csv1: string, 
  csv2: string, 
  vincolo: string, 
  strategy: string
): string => {
  const colId = 'id_risorsa';
  const colPeso = 'priorita_peso';

  const lines1 = csv1.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#'));
  const mappa_qubit = new Map<string, number>();
  const parsedRisorse: Array<{id: string, peso: number}> = [];
  
  let idColIndex = 0;
  let pesoColIndex = 5;
  
  const firstLine = lines1.find(l => l.includes(colId));
  if (firstLine) {
     const headers = firstLine.split(',').map(h => h.trim());
     const foundIdIdx = headers.indexOf(colId);
     const foundPesoIdx = headers.indexOf(colPeso);
     if (foundIdIdx !== -1) idColIndex = foundIdIdx;
     if (foundPesoIdx !== -1) pesoColIndex = foundPesoIdx;
  }

  lines1.forEach((l) => {
    if (l.includes(colId)) return;
    const parts = l.split(',');
    if (parts.length <= Math.max(idColIndex, pesoColIndex)) return;

    const id = parts[idColIndex].trim();
    const rawPeso = parseFloat(parts[pesoColIndex] || '0.5');
    
    if (!isNaN(rawPeso) && rawPeso >= 0 && rawPeso <= 1.0) {
      const qubitIndex = parsedRisorse.length; 
      mappa_qubit.set(id, qubitIndex);
      parsedRisorse.push({ id, peso: rawPeso });
    }
  });
  
  const numItems = parsedRisorse.length > 0 ? parsedRisorse.length : 4;

  const lines2 = csv2.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#'));
  const activeRelations: Array<{id_controllo: number, id_target: number, valore_peso: number}> = [];
  
  if (lines2.length > 1) {
    const headerCols = lines2[0].split(',').map(h => h.trim());
    
    for (let i = 1; i < lines2.length; i++) {
      const parts = lines2[i].split(',').map(p => p.trim());
      const idControllo = parts[0];
      const idxA = mappa_qubit.get(idControllo);
      
      if (idxA === undefined) continue;

      for (let j = 1; j < parts.length; j++) {
        const idTarget = headerCols[j];
        const idxB = mappa_qubit.get(idTarget);
        
        if (idxB === undefined) continue;
        if (idxA === idxB) continue; 

        const peso = parseFloat(parts[j]);
        if (!isNaN(peso) && peso > 0.00 && idxA < idxB) {
          activeRelations.push({ id_controllo: idxA, id_target: idxB, valore_peso: peso });
        }
      }
    }
  }

  const stratLower = strategy.toLowerCase();
  const isAggressiva = stratLower.includes('aggressiva') || stratLower.includes('spinta') || stratLower.includes('massimizz') || stratLower.includes('sfruttamento') || stratLower.includes('alpha') || stratLower.includes('makespan') || stratLower.includes('throughput') || stratLower.includes('screening') || strategy.includes('⚡');
  const isPrudente = stratLower.includes('prudent') || stratLower.includes('conservazion') || stratLower.includes('tutela') || stratLower.includes('bilanciamento') || stratLower.includes('margin') || stratLower.includes('sharpe') || stratLower.includes('longevità') || stratLower.includes('riserve') || stratLower.includes('continuità') || strategy.includes('🛡️');

  let pyCode = `import numpy as np\n`;
  pyCode += `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister, transpile\n`;
  pyCode += `from qiskit_aer import AerSimulator\n\n`;

  pyCode += `q = QuantumRegister(${numItems}, name="q")\n`;
  pyCode += `c = ClassicalRegister(${numItems}, name="c")\n`;
  pyCode += `qc = QuantumCircuit(q, c)\n\n`;

  // 1. Inizializzazione Qubit (Amplitude Encoding)
  parsedRisorse.forEach((r, i) => {
    let adjustedPeso = r.peso;
    if (isAggressiva) {
      adjustedPeso = Math.min(1.0, r.peso * 1.15);
    } else if (isPrudente) {
      adjustedPeso = r.peso * 0.85;
    }
    const pesoSafe = Math.max(0.0, Math.min(1.0, adjustedPeso));
    const theta = (2 * Math.asin(Math.sqrt(pesoSafe))).toFixed(4);
    pyCode += `qc.ry(${theta}, q[${i}])  # Inizializzazione q[${i}]\n`;
  });

  // 2. Entanglement e Relazioni di Vincolo
  pyCode += `\n`;
  const isNone = vincolo === 'nessun_vincolo' || vincolo === 'senza_entanglement' || vincolo.includes('nessun') || vincolo.includes('indipendent') || vincolo.includes('senza');
  const isHard = !isNone && (vincolo === 'blocco_rigido' || vincolo.includes('rigido') || vincolo.includes('hard'));

  if (isNone) {
    pyCode += `# Nessun Entanglement (Risorse Indipendenti)\n`;
  } else if (activeRelations.length > 0) {
    activeRelations.forEach(rel => {
      if (isHard) {
        pyCode += `qc.cx(q[${rel.id_controllo}], q[${rel.id_target}])  # Blocco Rigido\n`;
      } else {
        const phaseAngle = ((Math.PI / 4) * rel.valore_peso).toFixed(4);
        pyCode += `qc.cp(${phaseAngle}, q[${rel.id_controllo}], q[${rel.id_target}])  # Legame Morbido\n`;
      }
    });
  }

  // 3. Misurazione e Simulatore Locale AerSimulator
  pyCode += `\nqc.measure(q, c)\n`;
  pyCode += `simulator = AerSimulator()\n`;
  pyCode += `compiled_circuit = transpile(qc, simulator)\n`;
  pyCode += `job = simulator.run(compiled_circuit, shots=1024)\n`;
  pyCode += `print(job.result().get_counts())\n`;

  return pyCode;
};
