// DEMO CSV GENERATOR — TAXONOMIC QUANTUM ENGINE V3
// Mappatura esatta e deterministica dei dataset nativi per ciascuno dei 7 settori industriali.
// Ogni settore ha tassativamente i propri file CSV demo con anagrafica e matrice connessioni.

export interface DemoResource {
  id: string;
  nome: string;
  cat: string;
  costo: string;
  qta: string;
  peso: number;
}

export interface SectorDemoData {
  sectorKey: string;
  categoryName: string;
  description: string;
  resources: DemoResource[];
  matrix: number[][];
}

// 1. GUIDA INTESTAZIONE DEI FILE CSV (Standard FIFO)
const header1Template = (catName: string) => 
  `# =========================================================================================\n` +
  `# GUIDA ALLA COMPILAZIONE: FILE 1 - ANAGRAFICA RISORSE [SETTORE: ${catName.toUpperCase()}]\n` +
  `# =========================================================================================\n` +
  `# 1. SEPARATORE DI COLONNA: Usa SEMPRE la VIRGOLA (,)\n` +
  `# 2. SEPARATORE DECIMALE PER I NUMERI: Usa SEMPRE il PUNTO (.) (es. 100.50). MAI la virgola per i decimali.\n` +
  `# 3. NOMI ID (id_risorsa): Scrivi tutto in MINUSCOLO, usa UNDERSCORE '_' (es. asset_01, hub_centrale).\n` +
  `# 4. Mappatura Qubit: Riga 1 -> q[0], Riga 2 -> q[1], Riga 3 -> q[2], Riga 4 -> q[3] (FIFO rigoroso)\n` +
  `# =========================================================================================\n`;

const header2Template = (catName: string) => 
  `# =========================================================================================\n` +
  `# GUIDA ALLA COMPILAZIONE: FILE 2 - MATRICE DELLE CONNESSIONI [SETTORE: ${catName.toUpperCase()}]\n` +
  `# =========================================================================================\n` +
  `# 1. Prima colonna deve chiamarsi esplicitamente: id_risorsa\n` +
  `# 2. Intestazioni di colonna successive = ID identici al File 1 in ordine FIFO.\n` +
  `# 3. Valori da 0.00 a 1.00: 0.00 (indipendente), < 0.60 (legame morbido / CP), >= 0.60 (blocco rigido / CX).\n` +
  `# =========================================================================================\n`;

export const SECTOR_DEMO_DATASETS: Record<string, SectorDemoData> = {
  // 1. FINANZA E MERCATI
  "Finanza e Mercati": {
    sectorKey: "finanza",
    categoryName: "Finanza e Mercati",
    description: "Portafoglio investimenti, coperture cross-asset e riserva attuariale",
    resources: [
      { id: 'asset_01', nome: 'Asset Azionario Alpha Core', cat: 'titoli_equity', costo: '120.50', qta: '1500', peso: 0.85 },
      { id: 'asset_02', nome: 'Asset Obbligazionario Governativo', cat: 'reddito_fisso', costo: '98.20', qta: '2400', peso: 0.70 },
      { id: 'coorte_eta_01', nome: 'Coorte Polizze Vita Standard', cat: 'portafoglio_insurtech', costo: '450.00', qta: '500', peso: 0.60 },
      { id: 'rischio_attuariale', nome: 'Fondo Copertura Rischio Attuariale', cat: 'riserva_capitale', costo: '1000.00', qta: '100', peso: 0.90 }
    ],
    matrix: [
      [1.00, 0.40, 0.60, 0.00],
      [0.40, 1.00, 0.00, 0.50],
      [0.60, 0.00, 1.00, 0.70],
      [0.00, 0.50, 0.70, 1.00]
    ]
  },

  // 2. LOGISTICA E SUPPLY CHAIN
  "Logistica e Supply Chain": {
    sectorKey: "logistica",
    categoryName: "Logistica e Supply Chain",
    description: "Nodi di smistamento, flotta di distribuzione, cross-docking e allocazione volumetrie",
    resources: [
      { id: 'hub_centrale', nome: 'Hub Logistico Principale', cat: 'nodi_smistamento', costo: '5000.00', qta: '5', peso: 0.95 },
      { id: 'flotta_veicoli', nome: 'Flotta Furgoni Elettrici', cat: 'vettori_trasporto', costo: '250.00', qta: '40', peso: 0.80 },
      { id: 'container_3d', nome: 'Container Intermodali High-Cube', cat: 'unita_carico', costo: '1200.00', qta: '15', peso: 0.85 },
      { id: 'pallet_carico', nome: 'Pallet Standard ISO', cat: 'supporti_movimentazione', costo: '15.00', qta: '800', peso: 0.65 }
    ],
    matrix: [
      [1.00, 0.35, 0.60, 0.00],
      [0.35, 1.00, 0.00, 0.45],
      [0.60, 0.00, 1.00, 0.70],
      [0.00, 0.45, 0.70, 1.00]
    ]
  },

  // 2B. LOGISTICA - CROSS DOCKING E MAGAZZINO
  "Logistica_CrossDocking": {
    sectorKey: "logistica",
    categoryName: "Logistica: Cross-Docking e Magazzino",
    description: "Banchine di scarico, linee di smistamento rapido e baie di carico outbound",
    resources: [
      { id: 'banchina_inbound_01', nome: 'Banchina Scarico Bilici Fresco', cat: 'gate_inbound', costo: '350.00', qta: '8', peso: 0.90 },
      { id: 'traslatore_cross_01', nome: 'Buffer Rulliera Smistamento Diretto', cat: 'linea_crossdock', costo: '120.00', qta: '16', peso: 0.75 },
      { id: 'banchina_outbound_nord', nome: 'Baia Carico Consegne Punti Vendita', cat: 'gate_outbound', costo: '400.00', qta: '12', peso: 0.85 },
      { id: 'slot_stoccaggio_temp', nome: 'Slot Refrigerato Stazionamento Zero', cat: 'area_polmone', costo: '85.00', qta: '60', peso: 0.60 }
    ],
    matrix: [
      [1.00, 0.75, 0.65, 0.20],
      [0.75, 1.00, 0.70, 0.40],
      [0.65, 0.70, 1.00, 0.15],
      [0.20, 0.40, 0.15, 1.00]
    ]
  },

  // 2C. LOGISTICA - PREVISIONE FRESCHI QML E PRICING DINAMICO
  "Logistica_RetailPricing": {
    sectorKey: "logistica",
    categoryName: "Logistica: Commerciale, Freschi & Dynamic Pricing",
    description: "Lotti deperibili a scadenza ravvicinata, tasso di rotazione e curva markdown",
    resources: [
      { id: 'lotto_latticini_fresco', nome: 'Lotto Latticini Scadenza 48h', cat: 'freschissimi_deperibili', costo: '1.80', qta: '1200', peso: 0.92 },
      { id: 'lotto_ortofrutta_bio', nome: 'Ortofrutta Selezionata Shelf-Life 24h', cat: 'ortofrutta_fresca', costo: '2.40', qta: '850', peso: 0.88 },
      { id: 'markdown_sconto_30', nome: 'Algoritmo Markdown Sconto Fascia A', cat: 'leva_prezzo_dinamica', costo: '0.45', qta: '500', peso: 0.70 },
      { id: 'markdown_sconto_50', nome: 'Curva Liquidazione Rapida Anti-Spreco', cat: 'leva_prezzo_aggressiva', costo: '0.20', qta: '300', peso: 0.65 }
    ],
    matrix: [
      [1.00, 0.45, 0.70, 0.60],
      [0.45, 1.00, 0.65, 0.75],
      [0.70, 0.65, 1.00, 0.30],
      [0.60, 0.75, 0.30, 1.00]
    ]
  },

  // 2D. LOGISTICA - KNAPSACK SPAZIO SCAFFALE E PLANOGRAMMA
  "Logistica_KnapsackScaffale": {
    sectorKey: "logistica",
    categoryName: "Logistica: Spazio Scaffale & Knapsack Planogramma",
    description: "Allocazione facciate espositive, rotazione volumetrica e redditività per metro lineare",
    resources: [
      { id: 'facing_ad_alta_rotaz', nome: 'Facing Top Seller Ad Alta Rotazione', cat: 'scaffale_livello_occhi', costo: '4.50', qta: '45', peso: 0.95 },
      { id: 'facing_alto_margine', nome: 'Prodotti Premium Ad Alto Margine', cat: 'scaffale_livello_mani', costo: '8.90', qta: '30', peso: 0.82 },
      { id: 'prodotto_ingombrante', nome: 'Confezioni Famiglia Bassa Densità Valore', cat: 'scaffale_livello_suolo', costo: '2.10', qta: '20', peso: 0.60 },
      { id: 'cluster_promo_testata', nome: 'Testata di Gondola Promozionale CRM', cat: 'display_promozionale', costo: '12.00', qta: '15', peso: 0.75 }
    ],
    matrix: [
      [1.00, 0.65, 0.40, 0.70],
      [0.65, 1.00, 0.30, 0.60],
      [0.40, 0.30, 1.00, 0.10],
      [0.70, 0.60, 0.10, 1.00]
    ]
  },

  // 3. SICUREZZA, TELECOMUNICAZIONI E RETI
  "Sicurezza, Telecomunicazioni e Reti": {
    sectorKey: "sicurezza",
    categoryName: "Sicurezza, Telecomunicazioni e Reti",
    description: "Perimetro di sicurezza informatica, nodi crittografici e database riservati",
    resources: [
      { id: 'server_firewall', nome: 'Firewall Perimetrale Hardware', cat: 'sicurezza_perimetro', costo: '4500.00', qta: '4', peso: 0.85 },
      { id: 'nodo_vpn', nome: 'Gateway Crittografico VPN', cat: 'infrastruttura_accesso', costo: '1800.00', qta: '12', peso: 0.70 },
      { id: 'host_endpoint', nome: 'Endpoint Workstation Critiche', cat: 'nodi_rete', costo: '850.00', qta: '350', peso: 0.60 },
      { id: 'database_core', nome: 'Database Centrale Riservato', cat: 'asset_sensibile', costo: '25000.00', qta: '2', peso: 0.90 }
    ],
    matrix: [
      [1.00, 0.40, 0.60, 0.00],
      [0.40, 1.00, 0.00, 0.50],
      [0.60, 0.00, 1.00, 0.75],
      [0.00, 0.50, 0.75, 1.00]
    ]
  },

  // 4. SANITÀ E GENOMICA
  "Sanità e Genomica": {
    sectorKey: "sanita",
    categoryName: "Sanità e Genomica",
    description: "Blocchi chirurgici, personale ospedaliero e sequenziamento genomico target",
    resources: [
      { id: 'sala_operatoria', nome: 'Blocco Operatorio Chirurgico Alta Complessita', cat: 'infrastruttura_ospedaliera', costo: '8500.00', qta: '4', peso: 0.95 },
      { id: 'equipe_medica', nome: 'Equipe Chirurgica Specialistica', cat: 'personale_sanitario', costo: '2400.00', qta: '8', peso: 0.85 },
      { id: 'catena_proteica', nome: 'Catena Polipeptidica Target (Folding)', cat: 'struttura_molecolare', costo: '18.50', qta: '500', peso: 0.70 },
      { id: 'marcatore_dna', nome: 'Marcatore Genomico HLA Donatore', cat: 'diagnostica_molecolare', costo: '150.00', qta: '120', peso: 0.65 }
    ],
    matrix: [
      [1.00, 0.45, 0.60, 0.00],
      [0.45, 1.00, 0.00, 0.35],
      [0.60, 0.00, 1.00, 0.70],
      [0.00, 0.35, 0.70, 1.00]
    ]
  },

  // 5. ENERGIA E UTILITIES
  "Energia e Utilities": {
    sectorKey: "energia",
    categoryName: "Energia e Utilities",
    description: "Impianti dispacciabili, parchi rinnovabili, accumuli BESS e trasmissione 380kV",
    resources: [
      { id: 'turbina_gas', nome: 'Turbina a Gas Peaking ad Alto Rendimento', cat: 'generazione_dispacciabile', costo: '18000.00', qta: '3', peso: 0.85 },
      { id: 'accumulo_bess', nome: 'Sistema Accumulo Batterie BESS Grid-Scale', cat: 'stoccaggio_elettrochimico', costo: '32000.00', qta: '6', peso: 0.75 },
      { id: 'centrale_solare', nome: 'Parco Fotovoltaico Rinnovabile', cat: 'generazione_verde', costo: '45.00', qta: '1200', peso: 0.65 },
      { id: 'linea_alta_tensione', nome: 'Dorsale Trasmissione Elettrica 380kV', cat: 'infrastruttura_rete', costo: '75000.00', qta: '2', peso: 0.90 }
    ],
    matrix: [
      [1.00, 0.40, 0.60, 0.00],
      [0.40, 1.00, 0.00, 0.50],
      [0.60, 0.00, 1.00, 0.70],
      [0.00, 0.50, 0.70, 1.00]
    ]
  },

  // 6. PRODUZIONE E MANIFATTURA
  "Produzione e Manifattura": {
    sectorKey: "manifattura",
    categoryName: "Produzione e Manifattura",
    description: "Linee di montaggio automatizzate, celle robotizzate IoT e macchine CNC 5 assi",
    resources: [
      { id: 'linea_montaggio', nome: 'Linea Assemblaggio Automatizzata Core', cat: 'impianto_produzione', costo: '35000.00', qta: '2', peso: 0.90 },
      { id: 'braccio_robotico_iot', nome: 'Braccio Robotico Saldatura IoT 6 Assi', cat: 'automazione_industriale', costo: '22000.00', qta: '8', peso: 0.80 },
      { id: 'isola_cnc', nome: 'Isola Fresatura e Tornitura CNC 5 Assi', cat: 'macchine_precisione', costo: '65000.00', qta: '4', peso: 0.75 },
      { id: 'magazzino_jit', nome: 'Stoccaggio Componenti Just-In-Time', cat: 'buffer_logistico', costo: '8000.00', qta: '3', peso: 0.65 }
    ],
    matrix: [
      [1.00, 0.45, 0.65, 0.00],
      [0.45, 1.00, 0.00, 0.35],
      [0.65, 0.00, 1.00, 0.70],
      [0.00, 0.35, 0.70, 1.00]
    ]
  },

  // 7. CHIMICA, FARMACEUTICA E MATERIALI
  "Chimica, Farmaceutica e Materiali": {
    sectorKey: "chimica",
    categoryName: "Chimica, Farmaceutica e Materiali",
    description: "Catalizzatori metallorganici, molecole target farmacologiche e sintesi ad alta pressione",
    resources: [
      { id: 'composto_catalizzatore', nome: 'Composto Catalizzatore Metallorganico', cat: 'reagenti_catalitici', costo: '1250.00', qta: '25', peso: 0.85 },
      { id: 'molecola_target', nome: 'Molecola Farmacologica Target (Inibitore)', cat: 'target_biologico', costo: '4500.00', qta: '5', peso: 0.95 },
      { id: 'reattore_h2', nome: 'Reattore Idrogenazione Alta Pressione', cat: 'impianti_sintesi', costo: '55000.00', qta: '2', peso: 0.75 },
      { id: 'solvente_puro', nome: 'Solvente Organico Supercritico Anidro', cat: 'reagenti_base', costo: '35.00', qta: '600', peso: 0.60 }
    ],
    matrix: [
      [1.00, 0.45, 0.60, 0.00],
      [0.45, 1.00, 0.00, 0.30],
      [0.60, 0.00, 1.00, 0.70],
      [0.00, 0.30, 0.70, 1.00]
    ]
  }
};

/**
 * Risolve la chiave del settore in modo deterministico e insensibile a maiuscole/minuscole.
 */
export function resolveSectorKey(sector: string, scenario: string = ""): string {
  const norm = (sector + " " + scenario).toLowerCase().trim();

  // Sub-scenari specializzati di Logistica & Retail Supply Chain
  if (norm.includes('cross-dock') || norm.includes('cross dock') || norm.includes('stoccaggio') || norm.includes('log_q_10')) {
    return "Logistica_CrossDocking";
  }
  if (norm.includes('fresch') || norm.includes('scarto') || norm.includes('markdown') || norm.includes('pricing') || norm.includes('log_q_11') || norm.includes('log_q_12')) {
    return "Logistica_RetailPricing";
  }
  if (norm.includes('knapsack') || norm.includes('scaffal') || norm.includes('planogram') || norm.includes('crm') || norm.includes('log_q_13') || norm.includes('log_q_14')) {
    return "Logistica_KnapsackScaffale";
  }

  if (norm.includes('logist') || norm.includes('supply') || norm.includes('flott') || norm.includes('vrptw') || norm.includes('bin packing') || norm.includes('log-') || norm.includes('log_')) {
    return "Logistica e Supply Chain";
  }
  if (norm.includes('sicur') || norm.includes('cyber') || norm.includes('telecom') || norm.includes('reti') || norm.includes('sec-') || norm.includes('sec_') || norm.includes('malware') || norm.includes('network')) {
    return "Sicurezza, Telecomunicazioni e Reti";
  }
  if (norm.includes('sanit') || norm.includes('biomed') || norm.includes('genom') || norm.includes('medicin') || norm.includes('ospedal') || norm.includes('protein') || norm.includes('san-') || norm.includes('san_') || norm.includes('med_')) {
    return "Sanità e Genomica";
  }
  if (norm.includes('energ') || norm.includes('utilit') || norm.includes('grid') || norm.includes('power') || norm.includes('solare') || norm.includes('ene-') || norm.includes('ene_')) {
    return "Energia e Utilities";
  }
  if (norm.includes('manifatt') || norm.includes('produz') || norm.includes('fabbric') || norm.includes('cnc') || norm.includes('makespan') || norm.includes('man-') || norm.includes('man_')) {
    return "Produzione e Manifattura";
  }
  if (norm.includes('chimic') || norm.includes('farmac') || norm.includes('material') || norm.includes('vqe') || norm.includes('drug') || norm.includes('chem-') || norm.includes('chem_')) {
    return "Chimica, Farmaceutica e Materiali";
  }
  if (norm.includes('finanz') || norm.includes('mercat') || norm.includes('fin-') || norm.includes('fin_') || norm.includes('insurtech') || norm.includes('banking') || norm.includes('portafoglio')) {
    return "Finanza e Mercati";
  }
  return "Finanza e Mercati";
}

const buildCsv1 = (resources: DemoResource[], catName: string): string => {
  const lines = ['id_risorsa,nome_visualizzato,categoria,costo_unitario,quantita_disponibile,priorita_peso'];
  for (const r of resources) {
    lines.push(`${r.id},${r.nome},${r.cat},${r.costo},${r.qta},${r.peso.toFixed(2)}`);
  }
  return header1Template(catName) + lines.join('\n');
};

const buildCsv2 = (ids: string[], matrixBase: number[][], isNone: boolean, catName: string): string => {
  const lines: string[] = [];
  lines.push(['id_risorsa', ...ids].join(','));
  for (let i = 0; i < ids.length; i++) {
    const row = [ids[i]];
    for (let j = 0; j < ids.length; j++) {
      let val = matrixBase[i] && matrixBase[i][j] !== undefined ? matrixBase[i][j] : 0.0;
      if (i === j) {
        val = 1.00;
      } else if (isNone) {
        val = 0.00;
      }
      row.push(val.toFixed(2));
    }
    lines.push(row.join(','));
  }
  return header2Template(catName) + lines.join('\n');
};

/**
 * Funzione principale esportata: scarica o ottiene il CSV corretto per il settore selezionato
 */
export const getDemoCsvBySector = (
  sector: string, 
  scenario: string = "", 
  vincolo: string = "", 
  strategy: string = ""
): { csv1: string; csv2: string; sectorKey: string; dataset: SectorDemoData } => {
  const canonicalSector = resolveSectorKey(sector, scenario);
  const dataset = SECTOR_DEMO_DATASETS[canonicalSector] || SECTOR_DEMO_DATASETS["Finanza e Mercati"];

  const isNone = vincolo === 'nessun_vincolo' || 
                 vincolo === 'senza_entanglement' || 
                 vincolo.includes('nessun') || 
                 vincolo.includes('indipendent') || 
                 vincolo.includes('senza') ||
                 vincolo.includes('separabile');

  const csv1 = buildCsv1(dataset.resources, dataset.categoryName);
  const csv2 = buildCsv2(dataset.resources.map(r => r.id), dataset.matrix, isNone, dataset.categoryName);

  return { csv1, csv2, sectorKey: canonicalSector, dataset };
};
