import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// ============================================================================
// PILASTRO 2: MOTORE DI CONVALIDA E SICUREZZA DATI (Filtro Deterministico)
// ============================================================================

export interface RangeConstraint {
  min: number;
  max: number;
  unit: string;
}

export const BIOLOGICAL_RANGES: Record<string, RangeConstraint> = {
  bpm: { min: 30, max: 250, unit: 'bpm' },
  pressureSys: { min: 60, max: 240, unit: 'mmHg' },
  pressureDia: { min: 40, max: 140, unit: 'mmHg' },
  glucose: { min: 30, max: 500, unit: 'mg/dL' },
  hba1c: { min: 3.5, max: 15, unit: '%' },
  cholesterol: { min: 100, max: 400, unit: 'mg/dL' },
  creatinine: { min: 0.2, max: 10.0, unit: 'mg/dL' },
  egfr: { min: 5, max: 150, unit: 'mL/min' },
  pcr: { min: 0.0, max: 100.0, unit: 'mg/L' },
  calprotectin: { min: 0, max: 2000, unit: 'µg/g' },
};

export function validateBiologicalRange(param: string, value: number): boolean {
  const range = BIOLOGICAL_RANGES[param];
  if (!range) return true; // Se non abbiamo un range hardcoded, lascia passare (o gestisci diversamente)
  if (value < range.min || value > range.max) {
    console.error(`[BLOCCO SISTEMA] Valore ${param} (${value} ${range.unit}) fuori dal limite biologico consentito [${range.min}-${range.max}].`);
    return false;
  }
  return true;
}

type GradoGravita = 'Ottimale' | 'Lieve' | 'Moderato' | 'Severo' | 'Critico';

export function normalizeToQuantumWeight(grado: GradoGravita): number {
  const pesi: Record<GradoGravita, number> = {
    'Ottimale': 0.00,
    'Lieve': 0.25,
    'Moderato': 0.50,
    'Severo': 0.75,
    'Critico': 1.00
  };
  return pesi[grado];
}

export interface QuantumPayloadItem {
  id: string;
  weight: number; // Tra 0.00 e 1.00
}

export function filterZeroWeights(payload: QuantumPayloadItem[]): QuantumPayloadItem[] {
  // Il filtro degli zeri: organi sani (peso = 0.00) non occupano qubit
  return payload.filter(item => item.weight > 0.00);
}


// ============================================================================
// PILASTRO 3: ARCHITETTURA DI MAPPATURA FIRESTORE (Firebase v9+)
// ============================================================================

export interface FirestoreUser {
  uid: string;
  email: string;
  createdAt: any; // Timestamp
}

export interface FirestoreScreening {
  screeningId: string;
  userId: string;
  timestamp: any; // Timestamp
  
  // 1. Dati Originali
  rawData: {
    manualBpm?: number;
    manualPressureSys?: number;
    manualPressureDia?: number;
    source: 'manual' | 'csv' | 'ocr';
  };

  // 2. Nuovi Dati Strumentali (Pesi [0.00, 1.00])
  instrumentalData: {
    placcaCarotidea: number;
    ecografiaRenale: number;
    grassoViscerale: number;
    calprotectina: number;
    proteinuria: number;
    // ... e tutti gli altri test funzionali/immagini validati
  };

  // 3. Risultati del Calcolo Quantistico
  quantumResults: {
    qubitConfiguration: Record<string, string>; // Es. { "q0": "Cuore", "q1": "Reni" }
    rzzConstraints: {
      sourceQubit: string;
      targetQubit: string;
      weight: number; // Il peso finale calcolato
    }[];
    vonNeumannEntropyPct: number; // Es. 74
  };
}

// Esempio di Query SDK Firebase (TypeScript)
export async function getLatestValidScreening(db: any, userId: string): Promise<FirestoreScreening | null> {
  const screeningsRef = collection(db, `users/\${userId}/health_screenings`);
  // Prendi l'ultimo screening in ordine cronologico
  const q = query(screeningsRef, orderBy('timestamp', 'desc'), limit(1));
  
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as FirestoreScreening;
  }
  return null;
}


// ============================================================================
// PILASTRO 4: ESPANSIONE DEI VINCOLI QUANTISTICI (Qiskit Python - Backend)
// ============================================================================
export const QISKIT_NEW_CONSTRAINTS_TEMPLATE = `
# [BLOCCO PYTHON/QISKIT SUL BACKEND]
# Inizializzazione sicura e applicazione dei vincoli RZZ (Entanglement Medico)

# 1. Vincolo Emodinamico-Strutturale (Placca Doppler x ECG/Aritmia)
peso_emodinamico_safe = max(0.0, min(1.0, float({peso_doppler_ecg})))
if peso_emodinamico_safe > 0:
    qc.rzz(np.pi / 2 * peso_emodinamico_safe, q[{qubit_doppler}], q[{qubit_ecg}])

# 2. Vincolo Filtri (Proteinuria Urine x Ecografia Renale Alterata)
peso_filtri_safe = max(0.0, min(1.0, float({peso_proteinuria_ecoreno})))
if peso_filtri_safe > 0:
    qc.rzz(np.pi / 2 * peso_filtri_safe, q[{qubit_urine}], q[{qubit_rene}])

# 3. Vincolo Metabolico-Immunitario Locale (Grasso Viscerale x Calprotectina Fecale)
peso_immunitario_safe = max(0.0, min(1.0, float({peso_grasso_calprotectina})))
if peso_immunitario_safe > 0:
    qc.rzz(np.pi / 2 * peso_immunitario_safe, q[{qubit_grasso}], q[{qubit_intestino}])
`;


// ============================================================================
// PILASTRO 5: STRUTTURA DEL REPORT PDF E DOPPIO LINGUAGGIO
// ============================================================================

export interface DualLanguageFinding {
  medicalJargon: string;
  normalLanguage: {
    whatYouHave: string; // COSA HAI ADESSO
    whyItHappened: string; // PERCHÉ È SUCCESSO
    futureRisk: string; // COSA AVRAI SE CONTINUI COSÌ
  };
  urgencyColor: 'red' | 'yellow' | 'green';
}

export const EXAMPLE_DOMINO_EFFECT: DualLanguageFinding = {
  medicalJargon: "Rischio Aterosclerotico Accelerato con instabilità di placca carotidea e concomitante picco di hs-PCR e steatosi epatica.",
  normalLanguage: {
    whatYouHave: "I tuoi vasi sanguigni si stanno restringendo e indurendo più del dovuto a causa dell'infiammazione.",
    whyItHappened: "Il fegato affaticato (steatosi) non smaltisce bene i grassi, e l'infiammazione attiva (PCR alta) rende i depositi nei vasi fragili.",
    futureRisk: "Se questa catena non si ferma, c'è un alto rischio di ostruzione improvvisa dei vasi, che può portare a un infarto o a un ictus."
  },
  urgencyColor: 'red' // 🔴 Urgenza Alta
};

export function generateDualLanguagePDFStructure(screeningData: any) {
  // Pseudocodice Strutturale del PDF:
  //
  // 1. FRONTESPIZIO:
  //    - Nome Paziente, Data, Entropia Quantistica Globale (Es. 74%).
  //
  // 2. SEZIONE 1: PARAMETRI VITALI E IMMEDIATI
  //    - Esiti ECG, Holter, Auscultazione (Linguaggio medico + Normale).
  //
  // 3. SEZIONE 2: PARAMETRI METABOLICI E LONGEVITÀ
  //    - Grasso Viscerale, Steatosi, BMI (Linguaggio medico + Normale).
  //
  // 4. SEZIONE 3: FUNZIONALITÀ D'ORGANO E FILTRI
  //    - Analisi urine (Proteinuria), Eco reni, Fegato (Linguaggio medico + Normale).
  //
  // 5. SEZIONE 4: STATO INFIAMMATORIO E IMMUNITARIO
  //    - Calprotectina, Linfonodi, PCR (Linguaggio medico + Normale).
  //
  // 6. SEZIONE 5: IL DOMINO MEDICO (Incroci Critici)
  //    - Renderizza gli oggetti 'DualLanguageFinding' con l'effetto domino calcolato dal VQE.
  //
  // 7. SEZIONE 6: NOTA PER IL MEDICO CURANTE
  //    - Tabella rigorosa senza linguaggio 'normale', solo i biomarcatori fuori norma 
  //      ordinati per 🔴 Alta, 🟡 Media, 🟢 Bassa, da consegnare al clinico.
  
  console.log("Generazione PDF Strutturato in corso...");
  // Return jsPDF blob or trigger download
}
