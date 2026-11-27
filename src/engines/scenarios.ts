export interface QuantumScenario {
  id: string;
  macroarea: string;
  technology: string;
  name: string;
  logicType: string;
  targetVariables: string;
  focus?: 'Entanglement' | 'Ampiezza' | 'Angolo';
}

export const QUANTUM_SCENARIOS: QuantumScenario[] = [
  {
    id: 'fin-q-1',
    macroarea: 'Finanza e Mercati',
    technology: 'Computer Quantistico (QPU)',
    name: 'Hedging Quantistico Multilivello Cross-Asset (Ottimizzazione Combinatoria)',
    logicType: 'Ottimizzazione Combinatoria',
    targetVariables: 'Volatilità_Implicita, Correlazione_Dinamica, Tassi_Cambio_Spot',
    focus: 'Entanglement',
  },
  {
    id: 'fin-q-2',
    macroarea: 'Finanza e Mercati',
    technology: 'Computer Quantistico (QPU)',
    name: 'Ottimizzazione Portafoglio con Vincoli di Cardinalità (QUBO)',
    logicType: 'Ottimizzazione Combinatoria (QUBO)',
    targetVariables: 'Matrice_Covarianza, Rendimento_Atteso, Budget_Massimo',
    focus: 'Entanglement',
  },
  {
    id: 'log-q-1',
    macroarea: 'Logistica e Supply Chain',
    technology: 'Computer Quantistico (QPU)',
    name: 'Vehicle Routing Problem con Finestre Temporali (VRPTW)',
    logicType: 'Ottimizzazione Combinatoria',
    targetVariables: 'Flotta_Veicoli, Finestre_Orarie, Capacità_Carico',
    focus: 'Entanglement',
  },
  {
    id: 'ene-q-1',
    macroarea: 'Energia e Utilities',
    technology: 'Computer Quantistico (QPU)',
    name: 'Unit Commitment e Dispacciamento Ottimale Rete Elettrica (OPF)',
    logicType: 'Ottimizzazione Combinatoria',
    targetVariables: 'Carico_Rete, Generazione_Rinnovabile, Limiti_Linee',
    focus: 'Entanglement',
  },
  {
    id: 'chem-q-1',
    macroarea: 'Chimica, Farmaceutica e Materiali',
    technology: 'Computer Quantistico (QPU)',
    name: 'Calcolo Stato Fondamentale di Molecole Complesse (VQE)',
    logicType: 'VQE Variational Eigensolver',
    targetVariables: 'Hamiltoniana_Molecolare, Orbitali, Energia_Legame',
    focus: 'Angolo',
  },
  {
    id: 'man-q-1',
    macroarea: 'Produzione e Manifattura',
    technology: 'Computer Quantistico (QPU)',
    name: 'Job-Shop Scheduling Problem su Macchine CNC Multitasking',
    logicType: 'Ottimizzazione Combinatoria',
    targetVariables: 'Makespan, Sequenza_Macchine, Setup_Time',
    focus: 'Entanglement',
  },
  {
    id: 'sec-q-1',
    macroarea: 'Sicurezza, Telecomunicazioni e Reti',
    technology: 'Computer Quantistico (QPU)',
    name: 'Distribuzione Chiavi di Sicurezza (QKD) e Monitoraggio Intercettazioni',
    logicType: 'Crittografia Quantistica',
    targetVariables: 'QBER, Polarizzazione_Fotonica, Canale_Sicuro',
    focus: 'Angolo',
  },
  {
    id: 'san-q-1',
    macroarea: 'Sanità e Genomica',
    technology: 'Computer Quantistico (QPU)',
    name: 'Screening Virtuale di Farmaci su Miliardi di Molecole (Grover Search)',
    logicType: 'Ampiezza & Ricerca Quantistica',
    targetVariables: 'Affinità_Legame, Bersaglio_Proteico, Libreria_Molecole',
    focus: 'Ampiezza',
  },
];
