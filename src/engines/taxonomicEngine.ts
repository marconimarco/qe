import { LanguageCode } from '../types';
import { getLocalizedTaxonomicTexts, resolveAgentLang } from '../lib/agentAiTranslations';

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

export interface EntanglementProfile {
  recommendedVincolo: 'blocco_rigido' | 'legame_morbido' | 'nessun_vincolo';
  threshold: number;
  rationale: string;
}

export const TAXONOMIC_SECTORS: Record<string, TaxonomicSectorConfig> = {
  finanza: {
    id: 'finanza',
    name: 'Finanza e Mercati',
    aliases: ['finanza', 'mercati', 'fin', 'insurtech', 'banking', 'portafoglio', 'fin-q', 'fin-c', 'finance', 'markets', 'finanzen', 'marchés', '金融', '市場'],
    spiegazioneStrategia: "Modellazione del panorama delle probabilità di stabilità e copertura. L'approccio scava configurazioni ottimali per massimizzare l'alpha o tutelare la solidità attuariale del portafoglio.",
    spiegazioneVincolo: 'Correlazione tra asset finanziari o profili di rischio polizza. Un legame rigido esclude titoli speculari; un legame morbido introduce penalità di sfasamento su panieri bilanciati.',
    ids: ['asset_01', 'asset_02', 'tranche_aaa', 'bond_sovrano'],
    stratAggTitle: '⚡ Massima Spinta (Rendimento / Massimizzazione Alpha)',
    stratPrudTitle: '🛡️ Prudente (Tutela Capitale / Mitigazione Rischio / Copertura Garantita)',
  },
  sicurezza: {
    id: 'sicurezza',
    name: 'Sicurezza, Telecomunicazioni e Reti',
    aliases: ['sicurezza', 'telecomunicazioni', 'reti', 'cyber', 'cybersecurity', 'malware', 'sec-q', 'sec-c', 'network', 'security', 'telecom', 'sicherheit', 'sécurité', '安全', 'セキュリティ', '通信'],
    spiegazioneStrategia: "Scolpitura del panorama di contenimento delle minacce informatiche. L'algoritmo isola vettori d'attacco o ottimizza l'instradamento dei pacchetti nel core network.",
    spiegazioneVincolo: "Interdipendenza logica tra endpoint, server e nodi di rete. Un vincolo Hard impone la quarantena immediata ed esclusiva; un vincolo Soft modula la propagazione euristica del traffico.",
    ids: ['server_firewall', 'nodo_vpn', 'host_endpoint', 'database_core'],
    stratAggTitle: '⚡ Isolamento Immediato Minacce',
    stratPrudTitle: '🛡️ Euristica Continuità Operativa',
  },
  logistica: {
    id: 'logistica',
    name: 'Logistica e Supply Chain',
    aliases: ['logistica', 'supply chain', 'supply', 'vrptw', 'bin packing', 'log-q', 'log-c', 'flotte', 'trasporti', 'logistics', 'logistik', 'logistique', '物流', 'サプライチェーン'],
    spiegazioneStrategia: 'Ottimizzazione combinatoria del dispacciamento flotte e volumi merci. Riduce i tempi morti di percorrenza e azzera i vuoti spaziali nei container.',
    spiegazioneVincolo: 'Conflitti di allocazione mezzi, finestre orarie o incastri geometrici. Il blocco rigido vieta la sovrapposizione di tratte saturate; il legame morbido gestisce finestre di scarico flessibili.',
    ids: ['hub_centrale', 'flotta_veicoli', 'container_3d', 'pallet_carico'],
    stratAggTitle: '⚡ Saturazione Mezzi e Velocità',
    stratPrudTitle: '🛡️ Margini Sicurezza Flotte',
  },
  sanita: {
    id: 'sanita',
    name: 'Sanità e Genomica',
    aliases: ['sanità', 'sanita', 'biomedicina', 'genomica', 'medicina', 'ospedale', 'clinica', 'protein', 'san-q', 'san-c', 'med_', 'health', 'healthcare', 'biomed', 'gesundheit', 'santé', '医疗', '医療'],
    spiegazioneStrategia: 'Massimizzazione del throughput delle sale operatorie o modellazione del ripiegamento proteico (Protein Folding) per identificare stati di minima energia molecolare.',
    spiegazioneVincolo: 'Incompatibilità tra equipe cliniche o matching genetico HLA dei donatori. Un vincolo rigido impedisce collisioni orarie nei blocchi chirurgici; un vincolo morbido calcola le sinergie terapeutiche.',
    ids: ['sala_operatoria', 'equipe_medica', 'catena_proteica', 'marcatore_dna'],
    stratAggTitle: '⚡ Throughput Massimizzato Clinico',
    stratPrudTitle: '🛡️ Tutela Personale e Riserve',
  },
  energia: {
    id: 'energia',
    name: 'Energia e Utilities',
    aliases: ['energia', 'utilities', 'smart grid', 'unit commitment', 'microgrid', 'opf', 'rete elettrica', 'ene-q', 'ene-c', 'energy', 'energie', 'énergie', '能源', 'エネルギー'],
    spiegazioneStrategia: 'Bilanciamento dinamico del dispacciamento della rete elettrica (OPF) per accendere gli impianti minimizzando i costi di generazione.',
    spiegazioneVincolo: 'Immissione instabile di fonti rinnovabili (solare/eolico) e stoccaggio in accumulatori. Il blocco rigido evita la saturazione distruttiva delle linee; il legame morbido coordina le microgrid.',
    ids: ['turbina_gas', 'accumulo_bess', 'centrale_solare', 'linea_alta_tensione'],
    stratAggTitle: '⚡ Picco Generazione Impianti',
    stratPrudTitle: '🛡️ Bilanciamento e Longevità Rete',
  },
  manifattura: {
    id: 'manifattura',
    name: 'Produzione e Manifattura',
    aliases: ['produzione', 'manifattura', 'fabbrica', 'industria', 'job-shop', 'cnc', 'man-q', 'man-c', 'makespan', 'manufacturing', 'production', 'produktion', 'fertigung', 'industrie', '制造', '製造'],
    spiegazioneStrategia: 'Schedulazione delle linee di montaggio e delle macchine CNC multitasking per minimizzare i tempi di fermo impianto (Makespan).',
    spiegazioneVincolo: "Sincronizzazione di bracci robotici IoT e aree di stoccaggio Just-In-Time. Il blocco rigido vieta la presenza simultanea nell'isola di fresatura; il legame morbido ottimizza il flusso ottico di qualità.",
    ids: ['linea_montaggio', 'braccio_robotico_iot', 'isola_cnc', 'magazzino_jit'],
    stratAggTitle: '⚡ Minimizzazione Makespan / Ciclo',
    stratPrudTitle: '🛡️ Sincronizzazione Just-In-Time',
  },
  chimica: {
    id: 'chimica',
    name: 'Chimica, Farmaceutica e Materiali',
    aliases: ['chimica', 'farmaceutica', 'materiali', 'drug discovery', 'vqe', 'molecole', 'chem-q', 'chem-c', 'chemistry', 'pharma', 'materials', 'chemie', 'chimie', '化学', '製薬'],
    spiegazioneStrategia: 'Calcolo dello stato fondamentale orbitale di molecole complesse ab-initio e screening virtuale di farmaci (Drug Discovery).',
    spiegazioneVincolo: "Interazioni elettrostatiche, legami di torsione peptidica o affinità di inibitori enzimatici. Il blocco rigido impone l'ortogonalità degli stati; il legame morbido modula l'energia di legame flessibile.",
    ids: ['composto_catalizzatore', 'molecola_target', 'reattore_h2', 'solvente_puro'],
    stratAggTitle: '⚡ Screening Virtuale Rapido',
    stratPrudTitle: '🛡️ Modellazione Orbitale Minima Energia',
  },
};

export function getTaxonomicSector(
  sectorInput: string,
  scenarioId: string = '',
  language: LanguageCode = 'it'
): TaxonomicSectorConfig {
  const norm = `${sectorInput || ''} ${scenarioId || ''}`.toLowerCase();

  let base = TAXONOMIC_SECTORS.finanza;
  if (
    norm.includes('sicurez') ||
    norm.includes('cyber') ||
    norm.includes('telecom') ||
    norm.includes('reti') ||
    norm.includes('sec-') ||
    norm.includes('sec_') ||
    norm.includes('malware') ||
    norm.includes('security') ||
    norm.includes('sicherheit') ||
    norm.includes('sécurité') ||
    norm.includes('安全') ||
    norm.includes('セキュリティ')
  ) {
    base = TAXONOMIC_SECTORS.sicurezza;
  } else if (
    norm.includes('logistic') ||
    norm.includes('supply') ||
    norm.includes('flott') ||
    norm.includes('vrptw') ||
    norm.includes('log-') ||
    norm.includes('log_') ||
    norm.includes('bin packing') ||
    norm.includes('logistik') ||
    norm.includes('logistique') ||
    norm.includes('物流')
  ) {
    base = TAXONOMIC_SECTORS.logistica;
  } else if (
    norm.includes('sanit') ||
    norm.includes('biomed') ||
    norm.includes('genom') ||
    norm.includes('medicin') ||
    norm.includes('protein') ||
    norm.includes('san-') ||
    norm.includes('san_') ||
    norm.includes('med_') ||
    norm.includes('health') ||
    norm.includes('gesundheit') ||
    norm.includes('santé') ||
    norm.includes('医疗') ||
    norm.includes('医療')
  ) {
    base = TAXONOMIC_SECTORS.sanita;
  } else if (
    norm.includes('energi') ||
    norm.includes('utilit') ||
    norm.includes('grid') ||
    norm.includes('opf') ||
    norm.includes('ene-') ||
    norm.includes('ene_') ||
    norm.includes('energy') ||
    norm.includes('energie') ||
    norm.includes('énergie') ||
    norm.includes('能源') ||
    norm.includes('エネルギー')
  ) {
    base = TAXONOMIC_SECTORS.energia;
  } else if (
    norm.includes('produzion') ||
    norm.includes('manifattur') ||
    norm.includes('cnc') ||
    norm.includes('job-shop') ||
    norm.includes('makespan') ||
    norm.includes('man-') ||
    norm.includes('man_') ||
    norm.includes('manufactur') ||
    norm.includes('fertigung') ||
    norm.includes('industrie') ||
    norm.includes('制造') ||
    norm.includes('製造')
  ) {
    base = TAXONOMIC_SECTORS.manifattura;
  } else if (
    norm.includes('chimic') ||
    norm.includes('farmaceut') ||
    norm.includes('material') ||
    norm.includes('molecol') ||
    norm.includes('vqe') ||
    norm.includes('chem-') ||
    norm.includes('chem_') ||
    norm.includes('chemi') ||
    norm.includes('pharma') ||
    norm.includes('化学') ||
    norm.includes('製薬')
  ) {
    base = TAXONOMIC_SECTORS.chimica;
  }

  const localized = getLocalizedTaxonomicTexts(base.id, resolveAgentLang(language));
  return {
    ...base,
    name: localized.name,
    spiegazioneStrategia: localized.spiegazioneStrategia,
    spiegazioneVincolo: localized.spiegazioneVincolo,
    stratAggTitle: localized.stratAggTitle,
    stratPrudTitle: localized.stratPrudTitle,
  };
}

export function purgeParasiticStrings(text: string): string {
  if (!text) return '';
  return text
    .replace(/\[SIMULAZIONE[^\]]*\]/gi, '')
    .replace(/QuantumHealthCircuit/g, 'QuantumEnterpriseCircuit')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function getScenarioEntanglementProfile(
  sectorInput: string,
  scenarioId: string = '',
  language: LanguageCode = 'it'
): EntanglementProfile {
  const tax = getTaxonomicSector(sectorInput, scenarioId, language);
  const idLower = (scenarioId || '').toLowerCase();

  if (idLower.includes('-c-')) {
    return {
      recommendedVincolo: 'nessun_vincolo',
      threshold: 0,
      rationale: tax.spiegazioneVincolo,
    };
  }

  if (
    idLower.includes('fin-q-4') ||
    idLower.includes('fin-q-6') ||
    idLower.includes('fin-q-10') ||
    idLower.includes('chem-q-1') ||
    idLower.includes('chem-q-6')
  ) {
    return {
      recommendedVincolo: 'legame_morbido',
      threshold: 0.35,
      rationale: tax.spiegazioneVincolo,
    };
  }

  return {
    recommendedVincolo: 'blocco_rigido',
    threshold: 0.60,
    rationale: tax.spiegazioneVincolo,
  };
}
