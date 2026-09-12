// MOTORE TAXONOMIC QUANTUM ENGINE V3
// Dizionario rigido delle metafore e configurazione settoriale deterministica

export interface TaxonomicSectorConfig {
  id: string;
  name: string;
  aliases: string[];
  spiegazioneStrategia: string;
  spiegazioneVincolo: string;
  ids: string[];
  stratAggTitle: string;
  stratPrudTitle: string;
}

export const TAXONOMIC_SECTORS: Record<string, TaxonomicSectorConfig> = {
  finanza: {
    id: "finanza",
    name: "Finanza e Mercati",
    aliases: ["finanza", "mercati", "fin", "insurtech", "banking", "portafoglio", "fin-q", "fin-c"],
    spiegazioneStrategia: "Modellazione del panorama dei rendimenti e dello Sharpe Ratio. L'approccio scava valli energetiche per massimizzare l'alpha di portafoglio o mitigare il rischio di svalutazione attuariale.",
    spiegazioneVincolo: "Correlazione tra asset finanziari o profili di rischio polizza. Un legame rigido esclude titoli speculari; un legame morbido introduce penalità di sfasamento su panieri bilanciati.",
    ids: ["asset_01", "asset_02", "coorte_eta_01", "rischio_attuariale"],
    stratAggTitle: "⚡ Massima Spinta (Alpha / Rendimenti)",
    stratPrudTitle: "🛡️ Prudente (Tutela Capitale / Sharpe Ratio)"
  },
  sicurezza: {
    id: "sicurezza",
    name: "Sicurezza, Telecomunicazioni e Reti",
    aliases: ["sicurezza", "telecomunicazioni", "reti", "cyber", "cybersecurity", "malware", "sec-q", "sec-c", "network"],
    spiegazioneStrategia: "Scolpitura del panorama di contenimento delle minacce informatiche. L'algoritmo isola vettori d'attacco o ottimizza l'instradamento dei pacchetti nel core network.",
    spiegazioneVincolo: "Interdipendenza logica tra endpoint, server e nodi di rete. Un vincolo Hard impone la quarantena immediata ed esclusiva; un vincolo Soft modula la propagazione euristica del traffico.",
    ids: ["host_endpoint", "processo_sospetto", "database_core", "nodo_wan"],
    stratAggTitle: "⚡ Isolamento Immediato Minacce",
    stratPrudTitle: "🛡️ Euristica Continuità Operativa"
  },
  logistica: {
    id: "logistica",
    name: "Logistica e Supply Chain",
    aliases: ["logistica", "supply chain", "supply", "vrptw", "bin packing", "log-q", "log-c", "flotte", "trasporti"],
    spiegazioneStrategia: "Ottimizzazione combinatoria del dispacciamento flotte e volumi merci. Riduce i tempi morti di percorrenza e azzera i vuoti spaziali nei container.",
    spiegazioneVincolo: "Conflitti di allocazione mezzi, finestre orarie o incastri geometrici. Il blocco rigido vieta la sovrapposizione di tratte saturate; il legame morbido gestisce finestre di scarico flessibili.",
    ids: ["hub_centrale", "flotta_veicoli", "container_3d", "pallet_carico"],
    stratAggTitle: "⚡ Saturazione Mezzi e Velocità",
    stratPrudTitle: "🛡️ Margini Sicurezza Flotte"
  },
  sanita: {
    id: "sanita",
    name: "Sanità e Biomedicina",
    aliases: ["sanità", "sanita", "biomedicina", "genomica", "medicina", "ospedale", "clinica", "protein", "san-q", "san-c", "med_"],
    spiegazioneStrategia: "Massimizzazione del throughput delle sale operatorie o modellazione del ripiegamento proteico (Protein Folding) per identificare stati di minima energia molecolare.",
    spiegazioneVincolo: "Incompatibilità tra equipe cliniche o matching genetico HLA dei donatori. Un vincolo rigido impedisce collisioni orarie nei blocchi chirurgici; un vincolo morbido calcola le sinergie terapeutiche.",
    ids: ["sala_operatoria", "equipe_medica", "catena_amminoacidica", "marcatore_dna"],
    stratAggTitle: "⚡ Throughput Massimizzato Clinico",
    stratPrudTitle: "🛡️ Tutela Personale e Riserve"
  },
  energia: {
    id: "energia",
    name: "Energia e Utilities",
    aliases: ["energia", "utilities", "smart grid", "unit commitment", "microgrid", "opf", "rete elettrica", "ene-q", "ene-c"],
    spiegazioneStrategia: "Bilanciamento dinamico del dispacciamento della rete elettrica (OPF) per accendere gli impianti minimizzando i costi di generazione.",
    spiegazioneVincolo: "Immissione instabile di fonti rinnovabili (solare/eolico) e stoccaggio in accumulatori. Il blocco rigido evita la saturazione distruttiva delle linee; il legame morbido coordina le microgrid.",
    ids: ["turbina_gas", "accumulo_bess", "centrale_solare", "linea_alta_tensione"],
    stratAggTitle: "⚡ Picco Generazione Impianti",
    stratPrudTitle: "🛡️ Bilanciamento e Longevità Rete"
  },
  manifattura: {
    id: "manifattura",
    name: "Produzione e Manifattura",
    aliases: ["produzione", "manifattura", "fabbrica", "industria", "job-shop", "cnc", "man-q", "man-c", "makespan"],
    spiegazioneStrategia: "Schedulazione delle linee di montaggio e delle macchine CNC multitasking per minimizzare i tempi di fermo impianto (Makespan).",
    spiegazioneVincolo: "Sincronizzazione di bracci robotici IoT e aree di stoccaggio Just-In-Time. Il blocco rigido vieta la presenza simultanea nell'isola di fresatura; il legame morbido ottimizza il flusso ottico di qualità.",
    ids: ["linea_montaggio", "braccio_robotico_iot", "isola_cnc", "magazzino_jit"],
    stratAggTitle: "⚡ Minimizzazione Makespan / Ciclo",
    stratPrudTitle: "🛡️ Sincronizzazione Just-In-Time"
  },
  chimica: {
    id: "chimica",
    name: "Chimica, Farmaceutica e Materiali",
    aliases: ["chimica", "farmaceutica", "materiali", "drug discovery", "vqe", "molecole", "chem-q", "chem-c"],
    spiegazioneStrategia: "Calcolo dello stato fondamentale orbitale di molecole complesse ab-initio e screening virtuale di farmaci (Drug Discovery).",
    spiegazioneVincolo: "Interazioni elettrostatiche, legami di torsione peptidica o affinità di inibitori enzimatici. Il blocco rigido impone l'ortogonalità degli stati; il legame morbido modula l'energia di legame flessibile.",
    ids: ["composto_catalizzatore", "molecola_target", "reattore_h2", "solvente_puro"],
    stratAggTitle: "⚡ Screening Virtuale Rapido",
    stratPrudTitle: "🛡️ Modellazione Orbitale Minima Energia"
  }
};

export function getTaxonomicSector(sectorInput: string, scenarioId: string = ""): TaxonomicSectorConfig {
  const norm = (sectorInput + " " + scenarioId).toLowerCase();

  if (norm.includes("finanz") || norm.includes("mercat") || norm.includes("fin-") || norm.includes("fin_") || norm.includes("insurtech")) {
    return TAXONOMIC_SECTORS.finanza;
  }
  if (norm.includes("sicurez") || norm.includes("cyber") || norm.includes("telecom") || norm.includes("reti") || norm.includes("sec-") || norm.includes("sec_") || norm.includes("malware")) {
    return TAXONOMIC_SECTORS.sicurezza;
  }
  if (norm.includes("logistic") || norm.includes("supply") || norm.includes("flott") || norm.includes("vrptw") || norm.includes("log-") || norm.includes("log_") || norm.includes("bin packing")) {
    return TAXONOMIC_SECTORS.logistica;
  }
  if (norm.includes("sanit") || norm.includes("biomed") || norm.includes("genom") || norm.includes("medicin") || norm.includes("protein") || norm.includes("san-") || norm.includes("san_") || norm.includes("med_")) {
    return TAXONOMIC_SECTORS.sanita;
  }
  if (norm.includes("energi") || norm.includes("utilit") || norm.includes("grid") || norm.includes("unit commitment") || norm.includes("ene-") || norm.includes("ene_")) {
    return TAXONOMIC_SECTORS.energia;
  }
  if (norm.includes("chimic") || norm.includes("farmaceut") || norm.includes("material") || norm.includes("chem-") || norm.includes("chem_") || norm.includes("vqe") || norm.includes("drug")) {
    return TAXONOMIC_SECTORS.chimica;
  }
  if (norm.includes("manifattur") || norm.includes("produzion") || norm.includes("fabbric") || norm.includes("cnc") || norm.includes("man-") || norm.includes("man_") || norm.includes("makespan")) {
    return TAXONOMIC_SECTORS.manifattura;
  }

  // Fallback default
  return TAXONOMIC_SECTORS.finanza;
}

// Rimuove qualsiasi stringa parassita residua dal testo
export function purgeParasiticStrings(text: string): string {
  if (!text) return "";
  return text
    .replace(/Confermo che da ora in poi genererò solo stampi vuoti[^.\n]*\.?/gi, "")
    .replace(/Confermo che da ora in poi genererò solo stampi vuoti parametrici e rigidi in formato JSON[^.\n]*\.?/gi, "")
    .trim();
}

export interface EntanglementProfile {
  needsEntanglement: boolean;
  reason: string;
  question: string;
  recommendedVincolo: 'blocco_rigido' | 'legame_morbido' | 'nessun_vincolo';
}

// Scenari specifici in cui le risorse sono indipendenti o campionate in parallelo (zero necessità di entanglement)
export const INDEPENDENT_SCENARIO_IDS = new Set<string>([
  // Finanza
  "fin_q_12", // Stress Testing Macroeconomico Monte Carlo Accelerato
  "fin_q_13", // Pricing di Derivati Esotici Multi-Sottostante
  "fin_q_14", // Stima del Value at Risk (VaR) e Conditional VaR
  "fin_q_19", // Calcolo Probabilità di Default su Mutui Subprime
  "fin_c_6",  // Calcolo Black-Scholes Analitico per Grandi Volumi di Contratti
  "fin_c_7",  // Pricing di Polizze Vita Personalizzate (Insurtech)
  // Sanità
  "med_q_1",  // Screening Virtuale di Farmaci su Miliardi di Molecole (Grover)
  "med_q_6",  // Analisi Farmacogenomica per Terapie Personalizzate Cardiovascolari
  "med_q_8",  // Elaborazione Ultrarapida di Immagini da Risonanza Magnetica (RMN)
  "med_c_2",  // Analisi Predittiva della Cartella Clinica Elettronica per Rischio Riammissioni
  // Chimica
  "chm_q_3",  // Screening Molecolare per Inibitori Enzimatici (Drug Discovery)
  "chm_c_4",  // Tossicologia Predittiva e ADMET in Silico (GNN)
  "chm_c_6",  // Formulazione di Vernici Ecologiche Senza Composti Organici Volatili
  // Energia
  "ene_c_2",  // Manutenzione Predittiva Turbine a Gas tramite Sensori di Vibrazione
  "ene_c_3",  // Rilevamento Perdite nella Rete Idrica da Sensori di Flusso
  "ene_q_7",  // Simulazione Invecchiamento Celle Batteria al Litio
  // Manifattura
  "man_c_1",  // Controllo Qualità Automatico con Telecamere e Reti Convoluzionali (CNN)
  "man_c_2",  // Manutenzione Predittiva su Cuscinetti con Analisi Spettrale FFT
  // Sicurezza
  "sec_c_1",  // Rilevamento Malware Tramite Analisi del Bytecode ed Euristica
  "sec_q_1"   // Distribuzione Chiavi di Sicurezza (QKD) e Monitoraggio Intercettazioni
]);

export function getScenarioEntanglementProfile(sectorInput: string, scenarioId: string = ""): EntanglementProfile {
  const normId = scenarioId.toLowerCase();
  const tax = getTaxonomicSector(sectorInput, scenarioId);

  const isIndependent = INDEPENDENT_SCENARIO_IDS.has(normId) ||
    normId.includes("monte_carlo") ||
    normId.includes("pricing") ||
    normId.includes("screening") ||
    normId.includes("qae") ||
    normId.includes("sensor") ||
    normId.includes("var_");

  if (isIndependent) {
    return {
      needsEntanglement: false,
      reason: `In questo scenario di ${tax.name}, ciascuna risorsa o traiettoria è logicamente autonoma (campionamento stocastico parallelo, screening individuale o diagnosi a canali isolati). Non vi è accoppiamento fisico o competizione diretta: l'entanglement quantistico NON è richiesto né raccomandato, poiché l'inserimento di porte a due qubit introdurrebbe correlazioni spurie e rumore quantistico superfluo.`,
      question: `Dato che le risorse sono indipendenti, l'approccio computazionale ottimale è **Senza Entanglement (Stato Separabile Puro)**. Vuoi preservare l'indipendenza delle risorse (raccomandato) oppure forzare un legame di correlazione artificiale?`,
      recommendedVincolo: 'nessun_vincolo'
    };
  }

  return {
    needsEntanglement: true,
    reason: `In questo scenario di ${tax.name}, le risorse sono vincolate da rigide interdipendenze, conflitti di simultaneità, finestre condivise o matrici di covarianza. L'entanglement quantistico è INDISPENSABILE per mappare le correlazioni simultanee nello spazio di Hilbert ed escludere configurazioni proibite.`,
    question: `Dato che le risorse competono o collaborano tra loro, quale tipologia di vincolo quantistico (entanglement) desideri applicare?`,
    recommendedVincolo: 'blocco_rigido'
  };
}

