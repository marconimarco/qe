const fs = require('fs');

let file = fs.readFileSync('src/data/codeGenerators.ts', 'utf8');

const pythonQiskitCodeStr = `export const generateQiskitPythonCode = (sector: string, csv1: string, csv2: string, vincolo: string): string => {
  const config = getPipelineConfig(sector);
  const lines1 = csv1.split('\\n').filter(l => l.trim() !== '' && !l.startsWith('#') && !l.startsWith(config.colonna_id));
  
  const mappa_qubit = new Map<string, number>();
  const parsedRisorse: Array<{id: string, peso: number}> = [];
  
  let pesoColIndex = 3; 
  let idColIndex = 0;
  
  const firstLine = csv1.split('\\n').find(l => l.trim() !== '' && l.includes(config.colonna_id));
  if (firstLine) {
     const headers = firstLine.split(',').map(h => h.trim());
     idColIndex = Math.max(0, headers.indexOf(config.colonna_id));
     pesoColIndex = Math.max(0, headers.indexOf(config.colonna_peso));
  }

  lines1.forEach((l) => {
    if (l.includes(config.colonna_id)) return;
    const parts = l.split(',');
    const id = parts[idColIndex];
    const rawPeso = parseFloat(parts[pesoColIndex] || '0.5');
    const qubitIndex = parsedRisorse.length; 
    mappa_qubit.set(id, qubitIndex);
    if (!isNaN(rawPeso)) parsedRisorse.push({ id, peso: Math.max(0, Math.min(1, rawPeso)) });
  });
  
  const numItems = parsedRisorse.length;

  const lines2 = csv2.split('\\n').filter(l => l.trim() !== '' && !l.startsWith('#'));
  const activeRelations: Array<{id_controllo: number, id_target: number, valore_peso: number}> = [];
  
  if (lines2.length > 1) {
    const headerCols = lines2[0].split(',').map(h => h.trim());
    for (let i = 1; i < lines2.length; i++) {
      const parts = lines2[i].split(',');
      const idControllo = parts[0].trim();
      const idxA = mappa_qubit.get(idControllo);
      if (idxA === undefined) continue;
      for (let j = i + 1; j < parts.length; j++) {
        const idTarget = headerCols[j];
        const idxB = mappa_qubit.get(idTarget);
        if (idxB === undefined) continue;
        const peso = parseFloat(parts[j]);
        if (!isNaN(peso) && peso > 0.00) {
          activeRelations.push({ id_controllo: idxA, id_target: idxB, valore_peso: peso });
        }
      }
    }
  }

  const geminiTemplate = {
    initQubit: \`peso_safe_{id} = {valore_iniettato_da_typescript}\\ntheta_{id} = 2 * np.arcsin(np.sqrt(peso_safe_{id}))\\nqc.ry(theta_{id}, q[{id}])\`,
    constraintHard: \`qc.cx(q[{id_controllo}], q[{id_target}]) # Blocco Rigido ({valore_peso})\`,
    constraintSoft: \`qc.cp({angolo_fase}, q[{id_controllo}], q[{id_target}]) # Legame Morbido ({valore_peso})\`
  };

  const initBlocks = parsedRisorse.map((r, i) => 
    geminiTemplate.initQubit
      .replace(/{id}/g, i.toString())
      .replace('{valore_iniettato_da_typescript}', r.peso.toString())
  ).join('\\n\\n');

  const constraintBlocks = activeRelations.length > 0 ? activeRelations.map(rel => {
    if (vincolo === 'blocco_rigido') {
      return geminiTemplate.constraintHard
        .replace('{valore_peso}', rel.valore_peso.toString())
        .replace('{id_controllo}', rel.id_controllo.toString())
        .replace('{id_target}', rel.id_target.toString());
    } else {
      const phaseAngle = ((Math.PI / 4) * rel.valore_peso).toFixed(4);
      return geminiTemplate.constraintSoft
        .replace('{valore_peso}', rel.valore_peso.toString())
        .replace('{id_controllo}', rel.id_controllo.toString())
        .replace('{id_target}', rel.id_target.toString())
        .replace('{angolo_fase}', phaseAngle.toString());
    }
  }).join('\\n') : '# Nessun vincolo attivo';

  return \`# Python (Qiskit) — Compilazione Circuito Quantistico per \${sector || 'Settore Aziendale'}
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

# Creazione dei registri quantistici (\${numItems} qubit mappati deterministicamente)
q = QuantumRegister(\${numItems}, name="q_risorse")
c = ClassicalRegister(\${numItems}, name="c_misura")
qc = QuantumCircuit(q, c)

# 1. Encoding ampiezze: Inizializzazione sicura (Template Gemini iniettato da TS)
\${initBlocks}

# 2. Entanglement e Relazioni di Vincolo Dinamiche (Filtro > 0.00)
# Applicazione rigorosa operatore di sfasamento (Vincolo: \${vincolo === 'blocco_rigido' ? 'Hard' : 'Soft'})
\${constraintBlocks}

# 3. Misurazione collasso nello spazio di Hilbert
qc.measure(q, c)
print(qc.draw())\`;
};
`;

// replace generatePythonCode entirely
file = file.replace(/export const generatePythonCode =[\s\S]*/, pythonQiskitCodeStr);

// rename generateQiskitCode to generateQASMCode for clarity, though not strictly necessary
// let's leave generateQiskitCode named as is but I will use it as QASM and pythonQiskitCodeStr as python

fs.writeFileSync('src/data/codeGenerators.ts', file);
console.log("Updated codeGenerators.ts");
