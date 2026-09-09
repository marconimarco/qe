import { z } from 'zod';
import { PIPELINE_ROUTER } from './pipelineConfig';

// Validazione e Parsing CSV
const Csv1Schema = z.object({
  id: z.string(),
  peso: z.number().min(0).max(1)
});

const Csv2Schema = z.object({
  a: z.string(),
  b: z.string(),
  peso: z.number().positive() // Rigorosamente > 0.00
});

// Helper for dynamic routing based on sector
function getPipelineConfig(sector: string) {
  const lowerSector = sector.toLowerCase();
  if (lowerSector.includes('finanza')) return PIPELINE_ROUTER['finanza_e_mercati'];
  if (lowerSector.includes('sanita') || lowerSector.includes('sanità') || lowerSector.includes('sanit')) return PIPELINE_ROUTER['sanita_e_medicina'];
  if (lowerSector.includes('chimica')) return PIPELINE_ROUTER['chimica_e_materiali'];
  if (lowerSector.includes('produzione') || lowerSector.includes('logistica')) return PIPELINE_ROUTER['produzione_e_automazione'];
  // Fallback default
  return PIPELINE_ROUTER['finanza_e_mercati'];
}

export const generateQiskitCode = (sector: string, csv1: string, csv2: string, vincolo: string): string => {
  const config = getPipelineConfig(sector);

  // 2. TypeScript: Filtro Deterministico pre-generazione
  const lines1 = csv1.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#') && !l.startsWith(config.colonna_id));
  
  const mappa_qubit = new Map<string, number>();
  const parsedRisorse: Array<{id: string, peso: number}> = [];
  
  // Trova l'indice della colonna peso dinamicamente se è presente un header, 
  // altrimenti usa l'indice 3 come fallback dai dati demo
  let pesoColIndex = 3; 
  let idColIndex = 0;
  
  const firstLine = csv1.split('\n').find(l => l.trim() !== '' && l.includes(config.colonna_id));
  if (firstLine) {
     const headers = firstLine.split(',').map(h => h.trim());
     const foundIdIdx = headers.indexOf(config.colonna_id);
     const foundPesoIdx = headers.indexOf(config.colonna_peso);
     if (foundIdIdx !== -1) idColIndex = foundIdIdx;
     if (foundPesoIdx !== -1) pesoColIndex = foundPesoIdx;
  }

  lines1.forEach((l, idx) => {
    // Se la riga è l'header stesso (in caso il filtro sopra non l'abbia presa), salta
    if (l.includes(config.colonna_id)) return;
    
    const parts = l.split(',');
    const id = parts[idColIndex];
    const rawPeso = parseFloat(parts[pesoColIndex] || '0.5');
    
    // Assegnazione in ordine progressivo (q[0], q[1]...) come richiesto
    const qubitIndex = parsedRisorse.length; 
    mappa_qubit.set(id, qubitIndex); // Mappatura ID -> Indice fisso
    
    try {
      parsedRisorse.push(Csv1Schema.parse({ id, peso: rawPeso }));
    } catch(e) {} // Ignora silently per robustezza Zod
  });
  
  const numItems = parsedRisorse.length;

  const lines2 = csv2.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#'));
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


  // 1. Gemini: Generatore di Stampi (Template parametrico vuoto)
  const geminiTemplate = {
    initQubit: `// Inizializzazione q[{id}] (Peso sicuro: {valore_iniettato_da_typescript})\nry({theta}) q[{id}];`,
    constraintHard: `cx q[{id_controllo}], q[{id_target}]; // Blocco Rigido (Peso correlazione: {valore_peso})`,
    constraintSoft: `cp({angolo_fase}) q[{id_controllo}], q[{id_target}]; // Legame Morbido (Peso correlazione: {valore_peso})`
  };

  // 2. TypeScript: Iniezione ciclica
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
  }).join('\n') : '// Nessun vincolo attivo (correlazioni filtrate da TypeScript)';

  return `OPENQASM 3.0;
include "stdgates.inc";

// OpenQASM 3.0 — Compilazione Circuito Quantistico per ${sector || 'Settore Aziendale'}

// Creazione dei registri quantistici (${numItems} qubit mappati deterministicamente)
qubit[${numItems}] q;
bit[${numItems}] c;

// 1. Encoding ampiezze: Inizializzazione sicura (Template Gemini iniettato da TS)
${initBlocks}

// 2. Entanglement e Relazioni di Vincolo Dinamiche (Filtro > 0.00)
// Applicazione rigorosa operatore di sfasamento (Vincolo: ${vincolo === 'blocco_rigido' ? 'Hard' : 'Soft'})
${constraintBlocks}

// 3. Misurazione collasso nello spazio di Hilbert
c = measure q;
`;
};

export const generateQiskitPythonCode = (sector: string, csv1: string, csv2: string, vincolo: string): string => {
  const config = getPipelineConfig(sector);
  const lines1 = csv1.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#') && !l.startsWith(config.colonna_id));
  
  const mappa_qubit = new Map<string, number>();
  const parsedRisorse: Array<{id: string, peso: number}> = [];
  
  let pesoColIndex = 3; 
  let idColIndex = 0;
  
  const firstLine = csv1.split('\n').find(l => l.trim() !== '' && l.includes(config.colonna_id));
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

  const lines2 = csv2.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#'));
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
    initQubit: `peso_safe_{id} = {valore_iniettato_da_typescript}\ntheta_{id} = 2 * np.arcsin(np.sqrt(peso_safe_{id}))\nqc.ry(theta_{id}, q[{id}])`,
    constraintHard: `qc.cx(q[{id_controllo}], q[{id_target}]) # Blocco Rigido ({valore_peso})`,
    constraintSoft: `qc.cp({angolo_fase}, q[{id_controllo}], q[{id_target}]) # Legame Morbido ({valore_peso})`
  };

  const initBlocks = parsedRisorse.map((r, i) => 
    geminiTemplate.initQubit
      .replace(/{id}/g, i.toString())
      .replace('{valore_iniettato_da_typescript}', r.peso.toString())
  ).join('\n\n');

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
  }).join('\n') : '# Nessun vincolo attivo';

  return `# Python (Qiskit) — Compilazione Circuito Quantistico per ${sector || 'Settore Aziendale'}
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

# Creazione dei registri quantistici (${numItems} qubit mappati deterministicamente)
q = QuantumRegister(${numItems}, name="q_risorse")
c = ClassicalRegister(${numItems}, name="c_misura")
qc = QuantumCircuit(q, c)

# 1. Encoding ampiezze: Inizializzazione sicura (Template Gemini iniettato da TS)
${initBlocks}

# 2. Entanglement e Relazioni di Vincolo Dinamiche (Filtro > 0.00)
# Applicazione rigorosa operatore di sfasamento (Vincolo: ${vincolo === 'blocco_rigido' ? 'Hard' : 'Soft'})
${constraintBlocks}

# 3. Misurazione collasso nello spazio di Hilbert
qc.measure(q, c)
print(qc.draw())`;
};
