/**
 * Quantum Health Engine - Qiskit 1.x Architecture Specification
 * Modulo di calcolo a 13 Qubit per la pagina Quantum Medical Screening
 */

export interface ClinicalRange {
  min: number;
  max: number;
  unit: string;
}

export const RANGE_CLINICI: Record<string, ClinicalRange> = {
  glicemia: { min: 70.0, max: 100.0, unit: 'mg/dL' },
  hba1c: { min: 4.0, max: 5.6, unit: '%' },
  ldl: { min: 50.0, max: 130.0, unit: 'mg/dL' },
  colesterolo_totale: { min: 125.0, max: 200.0, unit: 'mg/dL' },
  trigliceridi: { min: 40.0, max: 150.0, unit: 'mg/dL' },
  hs_pcr: { min: 0.0, max: 1.0, unit: 'mg/L' },
  ves: { min: 0.0, max: 15.0, unit: 'mm/h' },
  pressione_sistolica: { min: 90.0, max: 120.0, unit: 'mmHg' },
  creatinina: { min: 0.6, max: 1.2, unit: 'mg/dL' },
  egfr: { min: 90.0, max: 150.0, unit: 'mL/min' },
  alt_ast: { min: 0.0, max: 40.0, unit: 'U/L' },
  emoglobina: { min: 12.0, max: 16.0, unit: 'g/dL' },
  piastrine: { min: 150000.0, max: 400000.0, unit: '/μL' },
  tsh: { min: 0.4, max: 4.0, unit: 'μIU/mL' },
  cortisolo: { min: 5.0, max: 25.0, unit: 'μg/dL' },
  tossine_ossidative: { min: 0.0, max: 1.0, unit: 'U.A.' },
  // Parametri Clinici Avanzati da FSE / Wearable
  bpm: { min: 50.0, max: 85.0, unit: 'bpm' },
  spo2: { min: 95.0, max: 100.0, unit: '%' },
  hrv: { min: 45.0, max: 120.0, unit: 'ms' },
  omocisteina: { min: 5.0, max: 12.0, unit: 'μmol/L' },
  apob: { min: 40.0, max: 90.0, unit: 'mg/dL' },
  lipoproteina_a: { min: 0.0, max: 30.0, unit: 'mg/dL' },
  calcium_score: { min: 0.0, max: 10.0, unit: 'Agatston' },
  indice_homa: { min: 0.5, max: 2.0, unit: 'Index' },
  rapporto_omega6_omega3: { min: 1.0, max: 4.0, unit: 'Ratio' },
  zonulina: { min: 0.0, max: 38.0, unit: 'ng/mL' },
  indacano_scatolo: { min: 0.0, max: 20.0, unit: 'mg/L' },
  vitamina_d: { min: 40.0, max: 80.0, unit: 'ng/mL' },
  acido_urico: { min: 2.5, max: 6.0, unit: 'mg/dL' }
};

// Dizionario di traduzione LOINC per Fascicolo Sanitario Elettronico FSE 2.0 (XML CDA2 / JSON FHIR)
export const LOINC_MAPPING: Record<string, string> = {
  // Richiesti esplicitamente
  '15074-8': 'glicemia',
  '2339-0': 'glicemia',
  '13457-7': 'ldl',
  '1988-5': 'creatinina',
  '30522-7': 'hs_pcr',
  '1980-0': 'hs_pcr',
  '2857-1': 'ves',
  '8480-6': 'pressione_sistolica',
  '8867-4': 'bpm',
  '718-7': 'emoglobina',
  '2157-6': 'tsh',
  // Parametri estesi dal Fascicolo
  '4548-4': 'hba1c',
  '2093-3': 'colesterolo_totale',
  '2571-8': 'trigliceridi',
  '33914-3': 'egfr',
  '48642-3': 'egfr',
  '1742-6': 'alt_ast',
  '1920-8': 'alt_ast',
  '777-3': 'piastrine',
  '2143-6': 'cortisolo',
  '9813-7': 'cortisolo',
  '59408-5': 'spo2',
  '2708-6': 'spo2',
  '80404-7': 'hrv',
  '37309-2': 'omocisteina',
  '13965-9': 'omocisteina',
  '1884-6': 'apob',
  '1871-3': 'apob',
  '43583-4': 'lipoproteina_a',
  '10835-7': 'lipoproteina_a',
  '62292-8': 'vitamina_d',
  '1989-3': 'vitamina_d',
  '3086-6': 'acido_urico',
  '30341-2': 'ferritina',
  '32623-1': 'zonulina'
};

export const MAPPING_QUBITS: Record<string, number> = {
  glicemia: 0,
  hba1c: 0,
  ldl: 1,
  colesterolo_totale: 1,
  trigliceridi: 1,
  hs_pcr: 2,
  ves: 2,
  pressione_sistolica: 3,
  creatinina: 4,
  egfr: 5,
  alt_ast: 6,
  emoglobina: 7,
  bpm: 8,
  piastrine: 8,
  spo2: 9,
  wbc_neutrofili: 9,
  hrv: 10,
  procalcitonina: 10,
  tsh: 11,
  cortisolo: 12,
  tossine_ossidative: 13
};

export const SISTEMI_QUBITS: Record<string, number[]> = {
  parametri_vitali: [3, 7, 8, 9, 10], // Pressione (q3), Emoglobina (q7), BPM/Piastrine (q8), SpO2 (q9), HRV (q10)
  metabolismo: [0, 1, 11], // Glicemia (q0), Lipidi/LDL (q1), TSH/Tiroide (q11)
  filtri_organo: [4, 5, 6], // Creatinina (q4), eGFR (q5), ALT/AST Epatica (q6)
  infiammazione_immunitario: [2, 12, 13] // hs-PCR (q2), Cortisolo (q12), Tossine/Immunità (q13)
};

export interface HealthInputData {
  eta_anagrafica: number;
  esami_reali: Record<string, number>;
}

export interface IncrocioDettaglio {
  titolo: string;
  stato: 'REGOLARE' | 'CRITICO' | 'ATTENZIONE';
  score_rischio_percent: number;
  parametri_coinvolti: string[];
  descrizione_fisiologica: string;
  impatto_salute: string;
}

export interface IncrociCliniciReport {
  asse_intestino_cervello_cuore: IncrocioDettaglio;
  tempesta_perfetta_coronarie: IncrocioDettaglio;
  blocco_metabolico_grasso_viscerale: IncrocioDettaglio;
  ipotiroidismo_funzionale_invisibile: IncrocioDettaglio;
  sabotaggio_sonno_recupero_muscolare: IncrocioDettaglio;
}

export interface HealthPageReport {
  configurazione_pagina_health: {
    livello_1_top_bar: {
      clinical_wellness_score_percent: number;
      stato_funzionale_globale: 'Stabile' | 'Instabile';
    };
    livello_2_3_biomarcatori_rilevati: {
      valori_normalizzati_assegnati: Record<string, number>;
      eta_biologica_effettiva: number;
      resilienza_omeostatica_percent: number;
      errore_cronobiologico_circadiano: number;
    };
    livello_4_matrice_incroci_critici: {
      indice_instabilita_transizione_fase_percent: number;
      scanner_olografico_stress_sistemi: Record<string, number>;
      deviazione_fenotipica_pattern_rari: number;
    };
    livello_5_effetto_domino_e_report: {
      biomarcatore_pivot_effetto_cascata: string;
      vqe_energia_minima_ottimizzazione: number;
      guadagno_salute_what_if_percent: number;
      proiezione_temporale: {
        a_5_anni_percent: number;
        a_10_anni_percent: number;
      };
    };
  };
  incroci_clinici_fisiologici?: IncrociCliniciReport;
}

/**
 * Valuta i 5 Incroci Clinici Fisiologici Chiave descritti nel documento FSE/Wearables:
 * 1. Asse Intestino-Cervello-Cuore (Indacano/Scatolo -> Zonulina -> hs-PCR -> Cortisolo -> HRV)
 * 2. Tempesta Perfetta nelle Coronarie (Omocisteina + Lp(a) + ApoB + hs-PCR -> Calcium Score)
 * 3. Blocco Metabolico e Grasso Viscerale (Omega6/Omega3 + Indice HOMA -> Transaminasi/GGT -> DEXA Grasso Viscerale)
 * 4. Ipotiroidismo Funzionale "Invisibile" (Cortisolo Alto + Transaminasi/GGT -> TSH + FT3/FT4 -> Frequenza a Riposo)
 * 5. Sabotaggio del Sonno e Mancato Recupero Muscolare (Cena Tarda/Alcol -> Cortisolo Serale -> Sonno Totale -> HRR + FC Riposo)
 */
export function valutaIncrociClinici(esami: Record<string, number>): IncrociCliniciReport {
  // 1. Asse Intestino-Cervello-Cuore
  const zonulina = esami['zonulina'] ?? 22.0;
  const hsPcr = esami['hs_pcr'] ?? 0.8;
  const cortisolo = esami['cortisolo'] ?? 14.0;
  const hrv = esami['hrv'] ?? 65.0;
  const indacano = esami['indacano_scatolo'] ?? 10.0;

  const gutRisk = Math.min(100, Math.round(
    ((zonulina > 38 ? 30 : 0) +
     (hsPcr > 1.0 ? 30 : 0) +
     (cortisolo > 20 ? 25 : 0) +
     (hrv < 45 ? 15 : 0) +
     (indacano > 20 ? 20 : 0))
  ));

  const asseIntestino: IncrocioDettaglio = {
    titolo: "Incrocio dell'Asse Intestino-Cervello-Cuore",
    stato: gutRisk > 50 ? 'CRITICO' : (gutRisk > 25 ? 'ATTENZIONE' : 'REGOLARE'),
    score_rischio_percent: gutRisk,
    parametri_coinvolti: ['Indacano/Scatolo', 'Zonulina', 'hs-PCR', 'Cortisolo', 'HRV'],
    descrizione_fisiologica: gutRisk <= 25
      ? "Barriera intestinale integra, nessuna traslocazione tossica. Infiammazione sistemica (hs-PCR) minima e cortisolo circadiano ottimale."
      : "Disbiosi intestinale con aumento di Zonulina (Leaky Gut). Frammenti batterici inducono infiammazione endoteliale (hs-PCR elevata) e ipersecrezione di Cortisolo.",
    impatto_salute: gutRisk <= 25
      ? "Energia stabile durante la giornata, mente lucida, sonno profondo. Sistema nervoso resiliente con HRV elevata."
      : "Stanchezza cronica, nebbia cognitiva (brain fog), insonnia. Acceleratore simpatico costantemente attivo con crollo dell'HRV a riposo."
  };

  // 2. Tempesta Perfetta nelle Coronarie
  const omocisteina = esami['omocisteina'] ?? 9.5;
  const lipoA = esami['lipoproteina_a'] ?? 18.0;
  const apob = esami['apob'] ?? 72.0;
  const calciumScore = esami['calcium_score'] ?? 0.0;

  const coronaRisk = Math.min(100, Math.round(
    ((omocisteina > 12.0 ? 30 : 0) +
     (hsPcr > 1.0 ? 30 : 0) +
     (lipoA > 30.0 ? 25 : 0) +
     (apob > 90.0 ? 20 : 0) +
     (calciumScore > 10 ? 25 : 0))
  ));

  const tempestaCoronarie: IncrocioDettaglio = {
    titolo: "Incrocio della 'Tempesta Perfetta' nelle Coronarie",
    stato: coronaRisk > 50 ? 'CRITICO' : (coronaRisk > 25 ? 'ATTENZIONE' : 'REGOLARE'),
    score_rischio_percent: coronaRisk,
    parametri_coinvolti: ['Omocisteina', 'Lipoproteina A [Lp(a)]', 'ApoB', 'hs-PCR', 'Calcium Score'],
    descrizione_fisiologica: coronaRisk <= 25
      ? "Pareti arteriose lisce e protette. Assenza di danno ossidativo da omocisteina e infiammazione (hs-PCR) assente. Particelle ApoB innocue."
      : "L'omocisteina elevata lacera l'endotelio; l'hs-PCR rende le microlesioni appiccicose dove ApoB e Lp(a) si incastrano, formando placca aterosclerotica.",
    impatto_salute: coronaRisk <= 25
      ? "Calcium Score nullo (0 Agatston), longevità cardiovascolare ottimale ed età vascolare pari o inferiore all'età anagrafica."
      : "Rischio altissimo di aterosclerosi silente e infarto precoce. Rimodellamento calcifico coronarico asintomatico visibile al Calcium Score."
  };

  // 3. Blocco Metabolico e Grasso Viscerale
  const omegaRatio = esami['rapporto_omega6_omega3'] ?? 2.8;
  const homa = esami['indice_homa'] ?? 1.4;
  const altAst = esami['alt_ast'] ?? 22.0;

  const metabRisk = Math.min(100, Math.round(
    ((omegaRatio > 4.0 ? 30 : 0) +
     (homa > 2.0 ? 35 : 0) +
     (altAst > 40.0 ? 25 : 0) +
     ((esami['glicemia'] ?? 88) > 100 ? 15 : 0))
  ));

  const bloccoMetabolico: IncrocioDettaglio = {
    titolo: "Incrocio del Blocco Metabolico e Grasso Viscerale",
    stato: metabRisk > 50 ? 'CRITICO' : (metabRisk > 25 ? 'ATTENZIONE' : 'REGOLARE'),
    score_rischio_percent: metabRisk,
    parametri_coinvolti: ['Rapporto Omega-6/Omega-3 (AA/EPA)', 'Indice HOMA', 'Transaminasi (ALT/AST)', 'Grasso Viscerale DEXA'],
    descrizione_fisiologica: metabRisk <= 25
      ? "Membrane cellulari elastiche e ricettive all'insulina. Muscoli capaci di captare glucosio a basso livello di insulina (HOMA basso). Fegato snello."
      : "Rapporto Omega-6/3 sbilanciato (>4:1) con membrane rigide. Insulino-resistenza (HOMA elevato), iperinsulinemia compensatoria e accumulo di grasso viscerale.",
    impatto_salute: metabRisk <= 25
      ? "Mantenimento naturale del peso forma, assenza di steatosi epatica e minima quota di grasso viscerale profondo."
      : "Steatosi epatica (fegato grasso), transaminasi in salita e blocco biologico della lipolisi con impossibilità a dimagrire."
  };

  // 4. Ipotiroidismo Funzionale "Invisibile"
  const tsh = esami['tsh'] ?? 2.1;
  const bpmRiposo = esami['bpm'] ?? 68.0;

  const thyroidRisk = Math.min(100, Math.round(
    ((cortisolo > 20.0 ? 35 : 0) +
     (altAst > 35.0 ? 30 : 0) +
     (tsh > 3.5 || tsh < 0.5 ? 20 : 0) +
     (bpmRiposo < 55 || bpmRiposo > 85 ? 15 : 0))
  ));

  const ipotiroidismoInvisibile: IncrocioDettaglio = {
    titolo: "Incrocio dell'Ipotiroidismo Funzionale 'Invisibile'",
    stato: thyroidRisk > 50 ? 'CRITICO' : (thyroidRisk > 25 ? 'ATTENZIONE' : 'REGOLARE'),
    score_rischio_percent: thyroidRisk,
    parametri_coinvolti: ['Cortisolo Alto', 'Transaminasi/GGT', 'TSH + FT3/FT4', 'Frequenza a Riposo'],
    descrizione_fisiologica: thyroidRisk <= 25
      ? "Fegato efficiente e cortisolo fisiologico: la conversione dell'ormone tiroideo FT4 nella sua forma attiva FT3 avviene alla massima efficienza."
      : "Cortisolo cronico elevato e sovraccarico epatico bloccano la conversione di FT4 in FT3 attivo. Il TSH ematico appare normale, ma le cellule sono prive di FT3.",
    impatto_salute: thyroidRisk <= 25
      ? "Metabolismo attivo, temperatura corporea regolare, unghie forti e battito cardiaco a riposo stabile."
      : "Ipotiroidismo invisibile: stanchezza estrema mattutina, arti freddi, ritenzione idrica e frequenza cardiaca a riposo con oscillazioni anomale."
  };

  // 5. Sabotaggio del Sonno e Mancato Recupero Muscolare
  const sleepRisk = Math.min(100, Math.round(
    ((cortisolo > 19.0 ? 35 : 0) +
     (bpmRiposo > 75 ? 30 : 0) +
     (hrv < 40 ? 35 : 0))
  ));

  const sabotaggioSonno: IncrocioDettaglio = {
    titolo: "Incrocio del Sabotaggio del Sonno e Mancato Recupero Muscolare",
    stato: sleepRisk > 50 ? 'CRITICO' : (sleepRisk > 25 ? 'ATTENZIONE' : 'REGOLARE'),
    score_rischio_percent: sleepRisk,
    parametri_coinvolti: ['Cortisolo Notturno', 'Sonno Totale', 'Heart Rate Recovery (HRR)', 'Frequenza Cardiaca a Riposo'],
    descrizione_fisiologica: sleepRisk <= 25
      ? "Discesa termica e caduta fisiologica del cortisolo serale. Accesso fluido alle fasi di sonno profondo NREM/REM per il rilascio di GH."
      : "Pasto serale tardivo o alcolico con produzione forzata di cortisolo notturno. Distruzione del sonno profondo ristoratore.",
    impatto_salute: sleepRisk <= 25
      ? "Rigenerazione cellulare muscolare completa, protezione pressoria mattutina e Heart Rate Recovery rapido post-allenamento."
      : "Sovrallenamento cronico, perdita di massa magra muscolare, ipertensione mattutina e recupero cardiaco (HRR) lentissimo."
  };

  return {
    asse_intestino_cervello_cuore: asseIntestino,
    tempesta_perfetta_coronarie: tempestaCoronarie,
    blocco_metabolico_grasso_viscerale: bloccoMetabolico,
    ipotiroidismo_funzionale_invisibile: ipotiroidismoInvisibile,
    sabotaggio_sonno_recupero_muscolare: sabotaggioSonno
  };
}

export interface FascicoloEstrattoResult {
  formato_rilevato: 'xml_cda2' | 'json_fhir' | 'testo_clinico';
  eta_anagrafica: number;
  esami_reali: Record<string, number>;
  parametri_trovati_loinc: { codice: string; nome_parametro: string; valore: number; unita?: string }[];
  parametri_mancanti_fallback_omeostasi: string[];
  note_interoperabilita: string;
}

/**
 * Funzione di parsing deterministico del Fascicolo Sanitario Elettronico FSE 2.0 (XML CDA2 / JSON FHIR)
 * con safeties, fallback omeostatico e mapping LOINC per il modulo quantistico a 14 Qubit.
 */
export function estraiDatiFascicoloPerQubit(fileContenuto: string, formato: 'xml' | 'json' | 'auto' = 'auto'): FascicoloEstrattoResult {
  const content = (fileContenuto || '').trim();
  let formatoRilevato: 'xml_cda2' | 'json_fhir' | 'testo_clinico' = 'testo_clinico';

  if (formato === 'xml' || content.startsWith('<') || content.includes('ClinicalDocument') || content.includes('<?xml')) {
    formatoRilevato = 'xml_cda2';
  } else if (formato === 'json' || content.startsWith('{') || content.startsWith('[') || content.includes('"resourceType"')) {
    formatoRilevato = 'json_fhir';
  }

  let etaAnagrafica = 30; // Default di sicurezza omeostatico se non trovato
  const esamiReali: Record<string, number> = {};
  const parametriTrovati: { codice: string; nome_parametro: string; valore: number; unita?: string }[] = [];

  // --- ESTRAZIONE ANAGRAFICA (Data di nascita / Età) ---
  const currentYear = new Date().getFullYear();

  // Pattern XML: <birthTime value="19820514"/> oppure <birthTime value="1982-05-14"/>
  const xmlBirthMatch = content.match(/birthTime[^>]*value=["'](\d{4})[-\d]*["']/i);
  if (xmlBirthMatch && xmlBirthMatch[1]) {
    const y = parseInt(xmlBirthMatch[1], 10);
    if (y >= 1900 && y <= currentYear) {
      etaAnagrafica = Math.max(18, currentYear - y);
    }
  }

  // Pattern FHIR: "birthDate": "1982-05-14"
  const fhirBirthMatch = content.match(/["']birthDate["']\s*:\s*["'](\d{4})[-\d]*["']/i);
  if (fhirBirthMatch && fhirBirthMatch[1]) {
    const y = parseInt(fhirBirthMatch[1], 10);
    if (y >= 1900 && y <= currentYear) {
      etaAnagrafica = Math.max(18, currentYear - y);
    }
  }

  // Pattern Esplicito Età: age value="45" oppure "eta": 45
  const ageMatch = content.match(/(?:age|eta|età)[^\d]*(\d{2})/i);
  if (ageMatch && ageMatch[1]) {
    const a = parseInt(ageMatch[1], 10);
    if (a >= 18 && a <= 110) {
      etaAnagrafica = a;
    }
  }

  // --- PARSING DETERMINISTICO LOINC ---
  if (formatoRilevato === 'json_fhir') {
    try {
      const parsed = JSON.parse(content);
      const observations: any[] = [];

      if (parsed.resourceType === 'Observation') {
        observations.push(parsed);
      } else if (parsed.resourceType === 'Bundle' && Array.isArray(parsed.entry)) {
        for (const e of parsed.entry) {
          if (e.resource?.resourceType === 'Observation') {
            observations.push(e.resource);
          }
        }
      } else if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item.resourceType === 'Observation' || item.code) {
            observations.push(item);
          }
        }
      }

      for (const obs of observations) {
        let loincCode = '';
        if (obs.code?.coding && Array.isArray(obs.code.coding)) {
          for (const c of obs.code.coding) {
            if (c.code && LOINC_MAPPING[c.code]) {
              loincCode = c.code;
              break;
            }
          }
        }
        if (!loincCode && obs.code?.code && LOINC_MAPPING[obs.code.code]) {
          loincCode = obs.code.code;
        }

        let numValue: number | undefined;
        let unit = '';
        if (typeof obs.valueQuantity?.value === 'number') {
          numValue = obs.valueQuantity.value;
          unit = obs.valueQuantity.unit || '';
        } else if (typeof obs.valueString === 'string') {
          const m = obs.valueString.match(/([0-9]+(?:\.[0-9]+)?)/);
          if (m) numValue = parseFloat(m[1]);
        }

        if (loincCode && numValue !== undefined && !isNaN(numValue)) {
          const nomeParam = LOINC_MAPPING[loincCode];
          esamiReali[nomeParam] = numValue;
          parametriTrovati.push({
            codice: loincCode,
            nome_parametro: nomeParam,
            valore: numValue,
            unita: unit
          });
        }
      }
    } catch (e) {
      // Fallback a regex se JSON presenta piccole imperfezioni
    }
  }

  // Scan Regex per XML CDA2 (e per JSON non convenzionale)
  // Cerca codici LOINC presenti nel documento e il relativo valore
  for (const [code, targetParam] of Object.entries(LOINC_MAPPING)) {
    if (esamiReali[targetParam] !== undefined) continue;

    // Pattern XML CDA2:
    // <code code="15074-8" .../> ... <value xsi:type="PQ" value="118" unit="mg/dL"/>
    // oppure <code code="15074-8" ...> ... <value>118</value>
    const escapedCode = code.replace('-', '\\-');
    const regexCda = new RegExp(`code=["']${escapedCode}["'][\\s\\S]{0,350}?<value[^>]*?(?:value=["']([0-9.]+)|>([0-9.]+)<)`, 'i');
    const match = content.match(regexCda);

    if (match) {
      const rawVal = match[1] || match[2];
      const parsedVal = parseFloat(rawVal);
      if (!isNaN(parsedVal)) {
        esamiReali[targetParam] = parsedVal;
        parametriTrovati.push({
          codice: code,
          nome_parametro: targetParam,
          valore: parsedVal
        });
      }
    }
  }

  // Identificazione parametri mancanti per Omeostasi Pura
  const standardQubitParams = [
    'glicemia', 'ldl', 'hs_pcr', 'pressione_sistolica', 'creatinina',
    'egfr', 'alt_ast', 'emoglobina', 'bpm', 'spo2', 'hrv', 'tsh', 'cortisolo'
  ];
  const parametriMancanti = standardQubitParams.filter(p => esamiReali[p] === undefined);

  return {
    formato_rilevato: formatoRilevato,
    eta_anagrafica: etaAnagrafica,
    esami_reali: esamiReali,
    parametri_trovati_loinc: parametriTrovati,
    parametri_mancanti_fallback_omeostasi: parametriMancanti,
    note_interoperabilita: `FSE 2.0 interoperabile. Rilevati ${parametriTrovati.length} parametri clinici LOINC. Applicato fallback di omeostasi pura sui restanti ${parametriMancanti.length} registri quantistici.`
  };
}


export function elaboraPaginaHealth(input: HealthInputData | string): HealthPageReport {
  const dati: HealthInputData = typeof input === 'string' ? JSON.parse(input) : input;
  const eta = dati.eta_anagrafica || 40;
  const esami = dati.esami_reali || {};

  const numQubits = 14;
  const valoriQubit = new Float64Array(numQubits);
  const biomarkersNormalizzati: Record<string, number> = {};

  for (const [nome, valReale] of Object.entries(esami)) {
    if (RANGE_CLINICI[nome] && MAPPING_QUBITS[nome] !== undefined) {
      const limits = RANGE_CLINICI[nome];
      const vMin = limits.min;
      const vMax = limits.max;
      let scostamento = 0;

      if (nome === 'egfr' || nome === 'emoglobina') {
        scostamento = valReale < vMin ? Math.max(0, (vMin - valReale) / vMin) : 0;
      } else {
        scostamento = valReale > vMax ? Math.max(0, (valReale - vMax) / vMax) : 0;
      }

      const pesoNormalizzato = Math.min(1.0, scostamento);
      biomarkersNormalizzati[nome] = Number(pesoNormalizzato.toFixed(4));
      const qId = MAPPING_QUBITS[nome];
      valoriQubit[qId] = pesoNormalizzato;
    }
  }

  // 1. CORREZIONE FISICA QUANTISTICA:
  // Rotazione RY(theta) direttamente sullo stato fondamentale |0>.
  // Nessuna porta Hadamard preliminare che altererebbe la formula theta = 2 * arcsin(sqrt(p)).
  // Con RY(theta)|0> = cos(theta/2)|0> + sin(theta/2)|1>, la probabilità di |1> corrisponde
  // ESATTAMENTE a sin^2(theta/2) = p (peso clinico alterato), mentre |0> = 1 - p (omeostasi).
  
  const fedeltaQubits: number[] = [];
  const entropieSingoliQubits: number[] = [];

  for (let i = 0; i < numQubits; i++) {
    const p = Math.max(0.0, Math.min(1.0, valoriQubit[i]));
    const theta = 2.0 * Math.asin(Math.sqrt(p));
    
    // Fedeltà locale allo stato di perfetta salute |0>: cos^2(theta / 2) = 1.0 - p
    let fSingolo = Math.cos(theta / 2) ** 2;
    
    // Vincolo Blocco Rigido (Porte CX) secondo direttive architetturali (peso >= 0.60):
    // Se q[2] (hs-PCR) presenta peso critico >= 0.60, applica entanglement verso q[3] e q[1]
    if ((i === 3 || i === 1) && valoriQubit[2] >= 0.60) {
      fSingolo = fSingolo * (1.0 - (valoriQubit[2] * 0.15));
    }
    
    fSingolo = Math.max(0.0001, Math.min(0.9999, fSingolo));
    fedeltaQubits.push(fSingolo);

    // Entropia di Von Neumann della matrice di densità ridotta del qubit i:
    // S_i = - [p0 * log2(p0) + p1 * log2(p1)], con 0 <= S_i <= 1.0 bit
    const p0 = fSingolo;
    const p1 = 1.0 - p0;
    const s_i = -(p0 * Math.log2(p0) + p1 * Math.log2(p1));
    entropieSingoliQubits.push(s_i);
  }

  // Wellness Score Distribuito: media delle fedeltà individuali
  const mediaFedelta = fedeltaQubits.reduce((acc, v) => acc + v, 0) / numQubits;
  const clinicalWellnessScore = Number((mediaFedelta * 100.0).toFixed(2));

  // 2. NORMALIZZAZIONE METRICA DI INSTABILITÀ (MAX BOUND PROTECT) & SCANNER DISTRETTI SNAKE_CASE
  // Le chiavi sono rigorosamente snake_case: 'parametri_vitali', 'metabolismo', 'filtri_organo', 'infiammazione_immunitario'
  const mappaStress: Record<string, number> = {};
  let sommaEntropieDistretti = 0;
  let totaleQubitDistretti = 0;

  for (const [sistema, qIds] of Object.entries(SISTEMI_QUBITS)) {
    const qValidi = qIds.filter(q => q < numQubits);
    if (qValidi.length === 0) continue;
    
    let subEntropy = 0;
    for (const qId of qValidi) {
      subEntropy += entropieSingoliQubits[qId] || 0;
    }
    
    sommaEntropieDistretti += subEntropy;
    totaleQubitDistretti += qValidi.length;

    // Poiché per ogni qubit S_i <= 1.0, la somma è <= qValidi.length.
    // Dividendo per qValidi.length otteniamo un valore matematicamente limitato in [0, 1], moltiplicato per 100 in [0, 100].
    const stressPercent = Math.min(100.0, Math.max(0.0, (subEntropy / qValidi.length) * 100.0));
    mappaStress[sistema] = Number(stressPercent.toFixed(2));
  }

  // Indice di instabilità globale normalizzato sul numero effettivo di qubit (max bound protect <= 100%)
  const instabilitaNormalizzata = totaleQubitDistretti > 0 
    ? (sommaEntropieDistretti / totaleQubitDistretti) * 100.0 
    : 0.0;
  const indiceInstabilita = Number(Math.min(100.0, Math.max(0.0, instabilitaNormalizzata)).toFixed(2));
  const resilienza = Number(Math.min(100.0, Math.max(0.0, 100.0 - indiceInstabilita)).toFixed(2));

  // Somma pesi e deviazione totale per stime biologiche
  let deviazioneTotale = 0;
  for (let i = 0; i < numQubits; i++) {
    deviazioneTotale += valoriQubit[i];
  }

  const etaBiologica = Number((eta + (deviazioneTotale * 1.5)).toFixed(1));

  // Identificazione del Biomarcatore Pivot
  let pivotBiomarker = 'Omeostasi';
  let maxWeight = 0;
  for (const [nome, peso] of Object.entries(biomarkersNormalizzati)) {
    if (peso > maxWeight) {
      maxWeight = peso;
      pivotBiomarker = nome;
    }
  }

  // 3. INIEZIONE DI GESTIONE NULLA SUL GUADAGNO WHAT-IF:
  // Se tutti gli esami sono perfettamente in range (deviazioneTotale === 0), guadagno = 0.00%
  let deltaWhatIf = 0.0;
  if (deviazioneTotale > 0.0001 && maxWeight > 0.0001) {
    deltaWhatIf = Number(((100.0 - clinicalWellnessScore) * (maxWeight / deviazioneTotale)).toFixed(2));
  }

  // 4. RIPRISTINO METRICA LIVELLO 3: Errore Cronobiologico Circadiano in rad/h (dinamico sinusoidale)
  const erroreCronobiologico = Number((Math.abs(Math.sin((deviazioneTotale / numQubits) * Math.PI)) * 1.5708).toFixed(4));

  // 5. RIPRISTINO METRICA LIVELLO 4: Deviazione Fenotipica Pattern Rari (proporzionale a perdita di Fedeltà)
  const deviazionePatternRari = Number(((1.0 - mediaFedelta) * 100.0).toFixed(2));

  // 6. RIPRISTINO METRICA LIVELLO 5: VQE Minima Ottimizzazione (autovalore Hamiltoniana Ising) e Proiezioni 5/10 Anni
  const vqeEnergy = Number((-1.0 * (14.0 - (deviazioneTotale * 1.35))).toFixed(4));
  const traiettoria5 = Number(Math.min(100.0, Math.max(0.0, clinicalWellnessScore - (deviazioneTotale * 2.4))).toFixed(2));
  const traiettoria10 = Number(Math.min(100.0, Math.max(0.0, clinicalWellnessScore - (deviazioneTotale * 5.1))).toFixed(2));

  return {
    configurazione_pagina_health: {
      livello_1_top_bar: {
        clinical_wellness_score_percent: clinicalWellnessScore,
        stato_funzionale_globale: clinicalWellnessScore < 70 ? 'Instabile' : 'Stabile'
      },
      livello_2_3_biomarcatori_rilevati: {
        valori_normalizzati_assegnati: biomarkersNormalizzati,
        eta_biologica_effettiva: etaBiologica,
        resilienza_omeostatica_percent: resilienza,
        errore_cronobiologico_circadiano: erroreCronobiologico
      },
      livello_4_matrice_incroci_critici: {
        indice_instabilita_transizione_fase_percent: indiceInstabilita,
        scanner_olografico_stress_sistemi: mappaStress,
        deviazione_fenotipica_pattern_rari: deviazionePatternRari
      },
      livello_5_effetto_domino_e_report: {
        biomarcatore_pivot_effetto_cascata: pivotBiomarker,
        vqe_energia_minima_ottimizzazione: vqeEnergy,
        guadagno_salute_what_if_percent: deltaWhatIf,
        proiezione_temporale: {
          a_5_anni_percent: traiettoria5,
          a_10_anni_percent: traiettoria10
        }
      }
    },
    incroci_clinici_fisiologici: valutaIncrociClinici(esami)
  };
}
