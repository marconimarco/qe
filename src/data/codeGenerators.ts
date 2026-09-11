export const generateQiskitCode = (sector: string, csv1: string, csv2: string, vincolo: string): string => {
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
    
    // Validazione e Push: mappa l'indice SOLO se il parse va a buon fine
    if (!isNaN(rawPeso) && rawPeso >= 0 && rawPeso <= 1.0) {
      const qubitIndex = parsedRisorse.length; 
      mappa_qubit.set(id, qubitIndex);
      parsedRisorse.push({ id, peso: rawPeso });
    }
  });
  
  const numItems = parsedRisorse.length;

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

        // FIX: Evita l'entanglement su se stessi e doppioni
        if (idxA === idxB) continue; 

        const peso = parseFloat(parts[j]);
        if (!isNaN(peso) && peso > 0.00 && idxA < idxB) {
          activeRelations.push({ id_controllo: idxA, id_target: idxB, valore_peso: peso });
        }
      }
    }
  }

  const geminiTemplate = {
    initQubit: `// Inizializzazione q[{id}] (Peso sicuro: {valore_iniettato_da_typescript})\nry({theta}) q[{id}];`,
    constraintHard: `cx q[{id_controllo}], q[{id_target}]; // Blocco Rigido (Peso correlazione: {valore_peso})`,
    constraintSoft: `cp({angolo_fase}) q[{id_controllo}], q[{id_target}]; // Legame Morbido (Peso correlazione: {valore_peso})`
  };

  const initBlocks = parsedRisorse.map((r, i) => {
    const pesoSafe = Math.max(0.0, Math.min(1.0, r.peso));
    const theta = (2 * Math.asin(Math.sqrt(pesoSafe))).toFixed(4);
    return geminiTemplate.initQubit
      .replace(/{id}/g, i.toString())
      .replace('{valore_iniettato_da_typescript}', r.peso.toString())
      .replace('{theta}', theta.toString());
  }).join('\n\n');

  const constraintBlocks = activeRelations.length > 0 ? activeRelations.map(rel => {
    if (vincolo === 'blocco_rigido') {
      return geminiTemplate.constraintHard
        .replace('{valore_peso}', rel.valore_peso.toString())
        .replace(/{id_controllo}/g, rel.id_controllo.toString())
        .replace(/{id_target}/g, rel.id_target.toString());
    } else {
      const phaseAngle = ((Math.PI / 4) * rel.valore_peso).toFixed(4);
      return geminiTemplate.constraintSoft
        .replace('{valore_peso}', rel.valore_peso.toString())
        .replace(/{id_controllo}/g, rel.id_controllo.toString())
        .replace(/{id_target}/g, rel.id_target.toString())
        .replace('{angolo_fase}', phaseAngle.toString());
    }
  }).join('\n') : '// Nessun vincolo attivo';

  return `OPENQASM 3.0;\ninclude "stdgates.inc";\n\n// OpenQASM 3.0 — Compilazione Circuito Quantistico per ${sector || 'Settore Aziendale'}\n// Creazione dei registri quantistici (${numItems} qubit mappati deterministicamente)\nqubit[${numItems}] q;\nbit[${numItems}] c;\n\n// 1. Encoding ampiezze: Inizializzazione sicura\n${initBlocks}\n\n// 2. Entanglement e Relazioni di Vincolo Dinamiche\n// Applicazione rigorosa operatore di sfasamento (Vincolo: ${vincolo === 'blocco_rigido' ? 'Hard' : 'Soft'})\n${constraintBlocks}\n\n// 3. Misurazione collasso nello spazio di Hilbert\nc = measure q;`;
};


export const generateQiskitPythonCode = (sector: string, csv1: string, csv2: string, vincolo: string): string => {
  const colId = 'id_risorsa';
  const colPeso = 'priorita_peso';

  const lines1 = csv1.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#'));
  const mappa_qubit = new Map<string, number>();
  const parsedRisorse: Array<{id: string, peso: number}> = [];
  
  let idColIndex = 0;
  let pesoColIndex = 1;
  
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
  
  const numItems = parsedRisorse.length > 0 ? parsedRisorse.length : 2;

  const lines2 = csv2.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#'));
  const activeRelations: Array<{id_controllo: number, id_target: number, valore_peso: number}> = [];
  
  if (lines2.length > 1) {
    const headerCols = lines2[0].split(',').map(h => h.trim());
    
    for (let i = 1; i < lines2.length; i++) {
      const parts = lines2[i].split(',').map(p => p.trim());
      const idControllo = parts[0]; // RICEVUTO FIX: Estratto correttamente il singolo ID stringa invece dell'intero array
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

  // GENERAZIONE STRINGA PYTHON QISKIT (RICEVUTO FIX SPECULARE AL QASM)
  let pyCode = `import numpy as np\n`;
  pyCode += `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\n`;
  pyCode += `from qiskit_aer import AerSimulator\n\n`;
  pyCode += `# Python (Qiskit) — Compilazione Circuito Quantistico per ${sector || 'Settore Aziendale'}\n`;
  pyCode += `q = QuantumRegister(${numItems}, name="q_risorse")\n`;
  pyCode += `c = ClassicalRegister(${numItems}, name="c_misura")\n`;
  pyCode += `qc = QuantumCircuit(q, c)\n\n`;

  pyCode += `# 1. Encoding ampiezze: Inizializzazione sicura\n`;
  parsedRisorse.forEach((r, i) => {
    const theta = (2 * Math.asin(Math.sqrt(r.peso))).toFixed(4);
    pyCode += `qc.ry(${theta}, q[${i}])  # Inizializzazione q[${i}] (Peso sicuro: ${r.peso})\n`;
  });

  pyCode += `\n# 2. Entanglement e Relazioni di Vincolo Dinamiche\n`;
  pyCode += `# Applicazione rigorosa operatore di sfasamento (Vincolo: ${vincolo === 'blocco_rigido' ? 'Hard' : 'Soft'})\n`;
  if (activeRelations.length > 0) {
    activeRelations.forEach(rel => {
      if (vincolo === 'blocco_rigido') {
        pyCode += `qc.cx(q[${rel.id_controllo}], q[${rel.id_target}])  # Blocco Rigido (Peso correlazione: ${rel.valore_peso})\n`;
      } else {
        const phaseAngle = ((Math.PI / 4) * rel.valore_peso).toFixed(4);
        pyCode += `qc.cp(${phaseAngle}, q[${rel.id_controllo}], q[${rel.id_target}])  # Legame Morbido (Peso correlazione: ${rel.valore_peso})\n`;
      }
    });
  } else {
    pyCode += `# Nessun vincolo attivo\n`;
  }

  pyCode += `\n# 3. Misurazione collasso nello spazio di Hilbert ed esecuzione\n`;
  pyCode += `qc.measure(q, c)\n\n`;
  pyCode += `simulator = AerSimulator()\n`;
  pyCode += `job = simulator.run(qc, shots=1024)\n`;
  pyCode += `print(job.result().get_counts())\n`;

  return pyCode;
};
