import { z } from 'zod';

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

export const generateQiskitCode = (sector: string, csv1: string, csv2: string, vincolo: string): string => {
  // 2. TypeScript: Filtro Deterministico pre-generazione
  const lines1 = csv1.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#') && !l.startsWith('id_risorsa'));
  const mappa_qubit = new Map<string, number>();
  const parsedRisorse = [];
  
  lines1.forEach((l, idx) => {
    const parts = l.split(',');
    const id = parts[0];
    const rawPeso = parseFloat(parts[3] || '0.5');
    mappa_qubit.set(id, idx); // Mappatura ID -> Indice fisso
    try {
      parsedRisorse.push(Csv1Schema.parse({ id, peso: rawPeso }));
    } catch(e) {} // Ignora silently per robustezza Zod
  });
  
  const numItems = lines1.length;
  const lines2 = csv2.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#') && !l.startsWith('risorsa_a'));
  const activeRelations = [];
  
  lines2.forEach(l => {
    const parts = l.split(',');
    const a = parts[0];
    const b = parts[1];
    const peso = parseFloat(parts[2]);
    try {
      const valid = Csv2Schema.parse({ a, b, peso });
      const idxA = mappa_qubit.get(valid.a);
      const idxB = mappa_qubit.get(valid.b);
      // Evitiamo il Qubit Disconnesso verificando la mappa
      if (idxA !== undefined && idxB !== undefined) {
        activeRelations.push({ id_controllo: idxA, id_target: idxB, valore_peso: valid.peso });
      }
    } catch (e) {} // Scarta matematicamente ogni riga invalida o con peso <= 0.00
  });

  // 1. Gemini: Generatore di Stampi (Template parametrico vuoto)
  const geminiTemplate = {
    initQubit: `peso_safe_{id} = max(0.0, min(1.0, float({valore_iniettato_da_typescript})))\ntheta_{id} = 2 * np.arcsin(np.sqrt(peso_safe_{id}))\nqc.ry(theta_{id}, q[{id}])`,
    constraintHard: `qc.rzz(np.pi / 2 * {valore_peso}, q[{id_controllo}], q[{id_target}])`,
    constraintSoft: `qc.rzz(np.pi / 4 * {valore_peso}, q[{id_controllo}], q[{id_target}])`
  };

  // 2. TypeScript: Iniezione ciclica
  const initBlocks = parsedRisorse.map((r, i) => 
    geminiTemplate.initQubit
      .replace(/{id}/g, i.toString())
      .replace('{valore_iniettato_da_typescript}', r.peso.toString())
  ).join('\n\n');

  const constraintTemplate = vincolo === 'blocco_rigido' ? geminiTemplate.constraintHard : geminiTemplate.constraintSoft;
  
  const constraintBlocks = activeRelations.length > 0 ? activeRelations.map(rel => 
    constraintTemplate
      .replace('{valore_peso}', rel.valore_peso.toString())
      .replace('{id_controllo}', rel.id_controllo.toString())
      .replace('{id_target}', rel.id_target.toString())
  ).join('\n') : '# Nessun vincolo attivo (correlazioni filtrate da TypeScript)';

  return `# IBM Qiskit — Compilazione Circuito Quantistico per ${sector || 'Settore Aziendale'}
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

# Creazione dei registri quantistici (${numItems} qubit mappati deterministicamente)
q = QuantumRegister(${numItems}, name="q_risorse")
c = ClassicalRegister(${numItems}, name="c_misura")
qc = QuantumCircuit(q, c)

# 1. Encoding ampiezze: Inizializzazione sicura (Template Gemini injettato da TS)
${initBlocks}

# 2. Entanglement e Relazioni di Vincolo Dinamiche (Filtro > 0.00)
# Applicazione rigorosa operatore di sfasamento (Vincolo: ${vincolo === 'blocco_rigido' ? 'Hard' : 'Soft'})
${constraintBlocks}

# 3. Misurazione collasso nello spazio di Hilbert
qc.measure(q, c)
print(qc.draw())`;
};

export const generatePythonCode = (sector: string, csv1: string, csv2: string, vincolo: string): string => {
  const lines = csv1.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#') && !l.startsWith('id_risorsa'));
  const costi = lines.map(l => parseFloat(l.split(',')[3] || '0.5'));
  const cap = lines.map(l => parseFloat(l.split(',')[4] || '1.0'));
  
  return `# Python / HPC — Ottimizzazione Vettorializzata su Cluster per ${sector || 'Settore Aziendale'}
import numpy as np
from scipy.optimize import minimize

# Dati estratti deterministicamente (Nessun hardcode)
costi_risorse = np.array([${costi.join(', ')}])
limiti_capacita = np.array([${cap.join(', ')}])

def funzione_costo(pesi):
    # Calcolo costo totale con penalizzazione stringente (${vincolo.replace('_', ' ')})
    costo_base = np.dot(pesi, costi_risorse)
    penalita = np.sum(np.maximum(0, pesi - limiti_capacita)**2) * 1e4
    return costo_base + penalita

# Risoluzione classica con gradiente SLSQP multithread
bounds = [(0, 1) for _ in range(len(costi_risorse))]
x0 = [0.5 for _ in range(len(costi_risorse))]

risultato = minimize(funzione_costo, x0=x0, bounds=bounds, method='SLSQP')
print("Allocazione ottima calcolata:", np.round(risultato.x, 3))`;
};
