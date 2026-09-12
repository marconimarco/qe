// DEMO CSV GENERATOR — TAXONOMIC QUANTUM ENGINE V3
// Mappatura esatta degli anagrafici e matrici di vincolo per i 7 settori industriali

export const getDemoCsvBySector = (
  sector: string, 
  scenario: string = "", 
  vincolo: string = "", 
  strategy: string = ""
) => {
  const stratLower = strategy.toLowerCase();
  const isAggressiva = stratLower.includes('aggressiva') || stratLower.includes('spinta') || stratLower.includes('massimizz') || stratLower.includes('sfruttamento') || stratLower.includes('alpha') || stratLower.includes('makespan') || stratLower.includes('throughput') || stratLower.includes('screening') || strategy.includes('⚡');
  const isPrudente = stratLower.includes('prudent') || stratLower.includes('conservazion') || stratLower.includes('tutela') || stratLower.includes('bilanciamento') || stratLower.includes('margin') || stratLower.includes('sharpe') || stratLower.includes('longevità') || stratLower.includes('riserve') || stratLower.includes('continuità') || strategy.includes('🛡️');

  const adjustPeso = (pesoBase: number) => {
    let adjusted = pesoBase;
    if (isAggressiva) {
      adjusted = Math.min(1.0, pesoBase * 1.15);
    } else if (isPrudente) {
      adjusted = pesoBase * 0.85;
    }
    return adjusted.toFixed(4);
  };

  const isNone = vincolo === 'nessun_vincolo' || vincolo === 'senza_entanglement' || vincolo.includes('nessun') || vincolo.includes('indipendent') || vincolo.includes('senza');
  const isHard = !isNone && (vincolo === 'blocco_rigido' || vincolo.includes('rigido') || vincolo.includes('hard'));

  const header1 = `# =========================================================================================\n# GUIDA ALLA COMPILAZIONE: FILE 1 - ANAGRAFICA RISORSE (Elementi, Costi, Scorte, Pesi)\n# =========================================================================================\n# 1. SEPARATORE DI COLONNA: Usa SEMPRE la VIRGOLA (,)\n# 2. SEPARATORE DECIMALE PER I NUMERI: Usa SEMPRE il PUNTO (.) (es. 100.50). MAI la virgola per i decimali.\n# 3. NOMI ID (id_risorsa): Scrivi tutto in MINUSCOLO, usa UNDERSCORE '_' (es. asset_01).\n# =========================================================================================\n`;
  const header2 = `# =========================================================================================\n# GUIDA ALLA COMPILAZIONE: FILE 2 - MATRICE DELLE CONNESSIONI, CORRELAZIONI E VINCOLI\n# =========================================================================================\n# 1. Prima colonna deve chiamarsi esplicitamente: id_risorsa\n# 2. Intestazioni di colonna successive = ID identici al File 1.\n# 3. Valori da 0.00 a 1.00. 0.00 (indipendente), 0.50 (legame morbido), 1.00 (blocco rigido/conflitto).\n# =========================================================================================\n`;

  const buildCsv1 = (data: {id: string, nome: string, cat: string, costo: string, qta: string, peso: number}[]) => {
    let lines = ['id_risorsa,nome_visualizzato,categoria,costo_unitario,quantita_disponibile,priorita_peso'];
    for (const d of data) {
      lines.push(`${d.id},${d.nome},${d.cat},${d.costo},${d.qta},${d.peso.toFixed(2)}`);
    }
    return header1 + lines.join('\n');
  };

  const buildCsv2 = (ids: string[], matrixBase: number[][]) => {
    let lines = [];
    lines.push(['id_risorsa', ...ids].join(','));
    for (let i = 0; i < ids.length; i++) {
      let row = [ids[i]];
      for (let j = 0; j < ids.length; j++) {
        let val = matrixBase[i] && matrixBase[i][j] !== undefined ? matrixBase[i][j] : 0.0;
        if (i === j) {
          val = 1.00;
        } else if (isNone) {
          val = 0.00;
        } else if (val > 0 && isHard) {
          val = 1.00;
        }
        row.push(val.toFixed(2));
      }
      lines.push(row.join(','));
    }
    return header2 + lines.join('\n');
  };

  const defaultMatrix4 = [
    [1.0, 0.4, 0.6, 0.0],
    [0.4, 1.0, 0.0, 0.5],
    [0.6, 0.0, 1.0, 0.7],
    [0.0, 0.5, 0.7, 1.0]
  ];

  const norm = (sector + " " + scenario).toLowerCase();

  // 1. FINANZA E MERCATI (Es. fin-q-1, fin-q-2, fin-q-7, fin-c-7 Insurtech)
  // ID: asset_01, asset_02, coorte_eta_01, rischio_attuariale
  if (norm.includes('finanz') || norm.includes('mercat') || norm.includes('fin-') || norm.includes('fin_') || norm.includes('insurtech')) {
    const data = [
      {id: 'asset_01', nome: 'Asset Azionario Alpha Core', cat: 'titoli_equity', costo: '120.50', qta: '1500', peso: 0.85},
      {id: 'asset_02', nome: 'Asset Obbligazionario Governativo', cat: 'reddito_fisso', costo: '98.20', qta: '2400', peso: 0.70},
      {id: 'coorte_eta_01', nome: 'Coorte Polizze Vita Standard', cat: 'portafoglio_insurtech', costo: '450.00', qta: '500', peso: 0.60},
      {id: 'rischio_attuariale', nome: 'Fondo Copertura Rischio Attuariale', cat: 'riserva_capitale', costo: '1000.00', qta: '100', peso: 0.90}
    ];
    return { csv1: buildCsv1(data), csv2: buildCsv2(data.map(d => d.id), defaultMatrix4) };
  }

  // 2. SICUREZZA, TELECOMUNICAZIONI E RETI (Es. sec-q-1, sec-q-2, sec-c-1 Malware)
  // ID: host_endpoint, processo_sospetto, database_core, nodo_wan
  if (norm.includes('sicurez') || norm.includes('telecom') || norm.includes('reti') || norm.includes('cyber') || norm.includes('sec-') || norm.includes('sec_') || norm.includes('malware')) {
    const data = [
      {id: 'host_endpoint', nome: 'Workstation Endpoint Rete', cat: 'endpoint_aziendale', costo: '1200.00', qta: '450', peso: 0.75},
      {id: 'processo_sospetto', nome: 'Vettore d\'Attacco Anomalo', cat: 'rilevamento_minaccia', costo: '0.00', qta: '1', peso: 0.95},
      {id: 'database_core', nome: 'Database Core Sensibile', cat: 'asset_critico', costo: '25000.00', qta: '1', peso: 1.00},
      {id: 'nodo_wan', nome: 'Gateway Nodo WAN Rete Primaria', cat: 'nodo_infrastruttura', costo: '4500.00', qta: '4', peso: 0.80}
    ];
    return { csv1: buildCsv1(data), csv2: buildCsv2(data.map(d => d.id), defaultMatrix4) };
  }

  // 3. LOGISTICA E SUPPLY CHAIN (Es. log-q-1 VRPTW, log-q-2 Bin Packing)
  // ID: hub_centrale, flotta_veicoli, container_3d, pallet_carico
  if (norm.includes('logistic') || norm.includes('supply') || norm.includes('log-') || norm.includes('log_') || norm.includes('flott') || norm.includes('vrptw') || norm.includes('bin packing')) {
    const data = [
      {id: 'hub_centrale', nome: 'Hub Deposito Centrale Smistamento', cat: 'infrastruttura_logistica', costo: '50000.00', qta: '1', peso: 0.95},
      {id: 'flotta_veicoli', nome: 'Flotta Automezzi Elettrici Consegne', cat: 'mezzi_trasporto', costo: '45000.00', qta: '25', peso: 0.80},
      {id: 'container_3d', nome: 'Container ISO Standard 3D', cat: 'spazio_carico', costo: '3500.00', qta: '12', peso: 0.85},
      {id: 'pallet_carico', nome: 'Pallet Carico Alta Densita', cat: 'merce_stoccaggio', costo: '300.00', qta: '150', peso: 0.65}
    ];
    return { csv1: buildCsv1(data), csv2: buildCsv2(data.map(d => d.id), defaultMatrix4) };
  }

  // 4. SANITÀ E BIOMEDICINA (Es. san-q-1, san-q-5 Turni, san-q-14)
  // ID: sala_operatoria, equipe_medica, catena_amminoacidica, marcatore_dna
  if (norm.includes('sanit') || norm.includes('biomed') || norm.includes('genom') || norm.includes('san-') || norm.includes('san_') || norm.includes('med_') || norm.includes('ospedal')) {
    const data = [
      {id: 'sala_operatoria', nome: 'Blocco Operatorio Chirurgico Alta Complessita', cat: 'infrastruttura_critica', costo: '7500.00', qta: '3', peso: 0.95},
      {id: 'equipe_medica', nome: 'Equipe Chirurgica Specialistica', cat: 'personale_sanitario', costo: '2200.00', qta: '6', peso: 0.85},
      {id: 'catena_amminoacidica', nome: 'Catena Polipeptidica Target (Folding)', cat: 'struttura_proteica', costo: '15.00', qta: '1000', peso: 0.70},
      {id: 'marcatore_dna', nome: 'Marcatore Genetico HLA Donatore', cat: 'profilo_genomico', costo: '120.00', qta: '250', peso: 0.80}
    ];
    return { csv1: buildCsv1(data), csv2: buildCsv2(data.map(d => d.id), defaultMatrix4) };
  }

  // 5. ENERGIA E UTILITIES (Es. ene-q-1 Unit Commitment, ene-q-5 Microgrid)
  // ID: turbina_gas, accumulo_bess, centrale_solare, linea_alta_tensione
  if (norm.includes('energi') || norm.includes('utilit') || norm.includes('grid') || norm.includes('ene-') || norm.includes('ene_')) {
    const data = [
      {id: 'turbina_gas', nome: 'Turbina a Gas Peaking ad Alto Rendimento', cat: 'generazione_dispacciabile', costo: '150.00', qta: '4', peso: 0.70},
      {id: 'accumulo_bess', nome: 'Sistema Accumulo Batterie BESS Grid-Scale', cat: 'stoccaggio_elettrochimico', costo: '300.00', qta: '8', peso: 0.90},
      {id: 'centrale_solare', nome: 'Centrale Fotovoltaica Rinnovabile', cat: 'generazione_verde', costo: '40.00', qta: '1', peso: 0.75},
      {id: 'linea_alta_tensione', nome: 'Dorsale Trasmissione Elettrica 380kV', cat: 'infrastruttura_rete', costo: '2000.00', qta: '1', peso: 1.00}
    ];
    return { csv1: buildCsv1(data), csv2: buildCsv2(data.map(d => d.id), defaultMatrix4) };
  }

  // 6. PRODUZIONE E MANIFATTURA (Es. man-q-1 Job-Shop, man-q-5)
  // ID: linea_montaggio, braccio_robotico_iot, isola_cnc, magazzino_jit
  if (norm.includes('manifattur') || norm.includes('produzion') || norm.includes('fabbric') || norm.includes('cnc') || norm.includes('man-') || norm.includes('man_')) {
    const data = [
      {id: 'linea_montaggio', nome: 'Linea Assemblaggio Meccanico Core', cat: 'impianto_produzione', costo: '12000.00', qta: '1', peso: 0.90},
      {id: 'braccio_robotico_iot', nome: 'Braccio Robotico Saldatura IoT 6 Assi', cat: 'automazione_industriale', costo: '48000.00', qta: '10', peso: 0.80},
      {id: 'isola_cnc', nome: 'Isola Fresatura e Tornitura CNC 5 Assi', cat: 'macchinario_precisione', costo: '85000.00', qta: '3', peso: 0.75},
      {id: 'magazzino_jit', nome: 'Stoccaggio Componenti Just-In-Time', cat: 'logistica_interna', costo: '4000.00', qta: '1', peso: 0.85}
    ];
    return { csv1: buildCsv1(data), csv2: buildCsv2(data.map(d => d.id), defaultMatrix4) };
  }

  // 7. CHIMICA, FARMACEUTICA E MATERIALI (Es. chem-q-1 VQE, chem-q-3)
  // ID: composto_catalizzatore, molecola_target, reattore_h2, solvente_puro
  const dataChem = [
    {id: 'composto_catalizzatore', nome: 'Composto Catalizzatore Metallorganico', cat: 'reagente_chimico', costo: '850.00', qta: '50', peso: 0.85},
    {id: 'molecola_target', nome: 'Molecola Target Farmacologica (Drug Discovery)', cat: 'target_molecolare', costo: '3500.00', qta: '5', peso: 0.95},
    {id: 'reattore_h2', nome: 'Reattore Idrogenazione Alta Pressione', cat: 'impianto_sintesi', costo: '45000.00', qta: '1', peso: 0.90},
    {id: 'solvente_puro', nome: 'Solvente Organico di Grado Puro', cat: 'materia_prima', costo: '45.00', qta: '800', peso: 0.60}
  ];
  return { csv1: buildCsv1(dataChem), csv2: buildCsv2(dataChem.map(d => d.id), defaultMatrix4) };
};
