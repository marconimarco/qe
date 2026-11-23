// MOTORE TAXONOMIC QUANTUM ENGINE V3
// Dizionario rigido delle metafore e configurazione settoriale deterministica
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

export const TAXONOMIC_SECTORS: Record<string, TaxonomicSectorConfig> = {
  finanza: {
    id: "finanza",
    name: "Finanza e Mercati",
    aliases: ["finanza", "mercati", "fin", "insurtech", "banking", "portafoglio", "fin-q", "fin-c", "finance", "markets", "finanzen", "marchés", "金融", "市場"],
    spiegazioneStrategia: "Modellazione del panorama delle probabilità di stabilità e copertura. L'approccio scava configurazioni ottimali per massimizzare l'alpha o tutelare la solidità attuariale del portafoglio.",
    spiegazioneVincolo: "Correlazione tra asset finanziari o profili di rischio polizza. Un legame rigido esclude titoli speculari; un legame morbido introduce penalità di sfasamento su panieri bilanciati.",
    ids: ["asset_01", "asset_02", "coorte_eta_01", "rischio_attuariale"],
    stratAggTitle: "⚡ Massima Spinta (Rendimento / Massimizzazione Alpha)",
    stratPrudTitle: "🛡️ Prudente (Tutela Capitale / Mitigazione Rischio / Copertura Garantita)"
  },
  sicurezza: {
    id: "sicurezza",
    name: "Sicurezza, Telecomunicazioni e Reti",
    aliases: ["sicurezza", "telecomunicazioni", "reti", "cyber", "cybersecurity", "malware", "sec-q", "sec-c", "network", "security", "telecom", "sicherheit", "sécurité", "安全", "セキュリティ", "通信"],
    spiegazioneStrategia: "Scolpitura del panorama di contenimento delle minacce informatiche. L'algoritmo isola vettori d'attacco o ottimizza l'instradamento dei pacchetti nel core network.",
    spiegazioneVincolo: "Interdipendenza logica tra endpoint, server e nodi di rete. Un vincolo Hard impone la quarantena immediata ed esclusiva; un vincolo Soft modula la propagazione euristica del traffico.",
    ids: ["server_firewall", "nodo_vpn", "host_endpoint", "database_core"],
    stratAggTitle: "⚡ Isolamento Immediato Minacce",
    stratPrudTitle: "🛡️ Euristica Continuità Operativa"
  },
  logistica: {
    id: "logistica",
    name: "Logistica e Supply Chain",
    aliases: ["logistica", "supply chain", "supply", "vrptw", "bin packing", "log-q", "log-c", "flotte", "trasporti", "logistics", "logistik", "logistique", "物流", "サプライチェーン"],
    spiegazioneStrategia: "Ottimizzazione combinatoria del dispacciamento flotte e volumi merci. Riduce i tempi morti di percorrenza e azzera i vuoti spaziali nei container.",
    spiegazioneVincolo: "Conflitti di allocazione mezzi, finestre orarie o incastri geometrici. Il blocco rigido vieta la sovrapposizione di tratte saturate; il legame morbido gestisce finestre di scarico flessibili.",
    ids: ["hub_centrale", "flotta_veicoli", "container_3d", "pallet_carico"],
    stratAggTitle: "⚡ Saturazione Mezzi e Velocità",
    stratPrudTitle: "🛡️ Margini Sicurezza Flotte"
  },
  sanita: {
    id: "sanita",
    name: "Sanità e Biomedicina",
    aliases: ["sanità", "sanita", "biomedicina", "genomica", "medicina", "ospedale", "clinica", "protein", "san-q", "san-c", "med_", "health", "healthcare", "biomed", "gesundheit", "santé", "医疗", "医療"],
    spiegazioneStrategia: "Massimizzazione del throughput delle sale operatorie o modellazione del ripiegamento proteico (Protein Folding) per identificare stati di minima energia molecolare.",
    spiegazioneVincolo: "Incompatibilità tra equipe cliniche o matching genetico HLA dei donatori. Un vincolo rigido impedisce collisioni orarie nei blocchi chirurgici; un vincolo morbido calcola le sinergie terapeutiche.",
    ids: ["sala_operatoria", "equipe_medica", "catena_proteica", "marcatore_dna"],
    stratAggTitle: "⚡ Throughput Massimizzato Clinico",
    stratPrudTitle: "🛡️ Tutela Personale e Riserve"
  },
  energia: {
    id: "energia",
    name: "Energia e Utilities",
    aliases: ["energia", "utilities", "smart grid", "unit commitment", "microgrid", "opf", "rete elettrica", "ene-q", "ene-c", "energy", "energie", "énergie", "能源", "エネルギー"],
    spiegazioneStrategia: "Bilanciamento dinamico del dispacciamento della rete elettrica (OPF) per accendere gli impianti minimizzando i costi di generazione.",
    spiegazioneVincolo: "Immissione instabile di fonti rinnovabili (solare/eolico) e stoccaggio in accumulatori. Il blocco rigido evita la saturazione distruttiva delle linee; il legame morbido coordina le microgrid.",
    ids: ["turbina_gas", "accumulo_bess", "centrale_solare", "linea_alta_tensione"],
    stratAggTitle: "⚡ Picco Generazione Impianti",
    stratPrudTitle: "🛡️ Bilanciamento e Longevità Rete"
  },
  manifattura: {
    id: "manifattura",
    name: "Produzione e Manifattura",
    aliases: ["produzione", "manifattura", "fabbrica", "industria", "job-shop", "cnc", "man-q", "man-c", "makespan", "manufacturing", "production", "produktion", "fertigung", "industrie", "制造", "製造"],
    spiegazioneStrategia: "Schedulazione delle linee di montaggio e delle macchine CNC multitasking per minimizzare i tempi di fermo impianto (Makespan).",
    spiegazioneVincolo: "Sincronizzazione di bracci robotici IoT e aree di stoccaggio Just-In-Time. Il blocco rigido vieta la presenza simultanea nell'isola di fresatura; il legame morbido ottimizza il flusso ottico di qualità.",
    ids: ["linea_montaggio", "braccio_robotico_iot", "isola_cnc", "magazzino_jit"],
    stratAggTitle: "⚡ Minimizzazione Makespan / Ciclo",
    stratPrudTitle: "🛡️ Sincronizzazione Just-In-Time"
  },
  chimica: {
    id: "chimica",
    name: "Chimica, Farmaceutica e Materiali",
    aliases: ["chimica", "farmaceutica", "materiali", "drug discovery", "vqe", "molecole", "chem-q", "chem-c", "chemistry", "pharma", "materials", "chemie", "chimie", "化学", "製薬"],
    spiegazioneStrategia: "Calcolo dello stato fondamentale orbitale di molecole complesse ab-initio e screening virtuale di farmaci (Drug Discovery).",
    spiegazioneVincolo: "Interazioni elettrostatiche, legami di torsione peptidica o affinità di inibitori enzimatici. Il blocco rigido impone l'ortogonalità degli stati; il legame morbido modula l'energia di legame flessibile.",
    ids: ["composto_catalizzatore", "molecola_target", "reattore_h2", "solvente_puro"],
    stratAggTitle: "⚡ Screening Virtuale Rapido",
    stratPrudTitle: "🛡️ Modellazione Orbitale Minima Energia"
  }
};

export function getTaxonomicSector(sectorInput: string, scenarioId: string = "", language: LanguageCode = 'it'): TaxonomicSectorConfig {
  const norm = (sectorInput + " " + scenarioId).toLowerCase();

  let base = TAXONOMIC_SECTORS.finanza;
  if (norm.includes("finanz") || norm.includes("mercat") || norm.includes("fin-") || norm.includes("fin_") || norm.includes("insurtech") || norm.includes("finance") || norm.includes("finanzen") || norm.includes("marchés") || norm.includes("金融")) {
    base = TAXONOMIC_SECTORS.finanza;
  } else if (norm.includes("sicurez") || norm.includes("cyber") || norm.includes("telecom") || norm.includes("reti") || norm.includes("sec-") || norm.includes("sec_") || norm.includes("malware") || norm.includes("security") || norm.includes("sicherheit") || norm.includes("sécurité") || norm.includes("安全") || norm.includes("セキュリティ")) {
    base = TAXONOMIC_SECTORS.sicurezza;
  } else if (norm.includes("logistic") || norm.includes("supply") || norm.includes("flott") || norm.includes("vrptw") || norm.includes("log-") || norm.includes("log_") || norm.includes("bin packing") || norm.includes("logistik") || norm.includes("logistique") || norm.includes("物流")) {
    base = TAXONOMIC_SECTORS.logistica;
  } else if (norm.includes("sanit") || norm.includes("biomed") || norm.includes("genom") || norm.includes("medicin") || norm.includes("protein") || norm.includes("san-") || norm.includes("san_") || norm.includes("med_") || norm.includes("health") || norm.includes("gesundheit") || norm.includes("santé") || norm.includes("医疗") || norm.includes("医療")) {
    base = TAXONOMIC_SECTORS.sanita;
  } else if (norm.includes("energi") || norm.includes("utilit") || norm.includes("grid") || norm.includes("unit commitment") || norm.includes("ene-") || norm.includes("ene_") || norm.includes("energy") || norm.includes("énergie") || norm.includes("能源") || norm.includes("エネルギー")) {
    base = TAXONOMIC_SECTORS.energia;
  } else if (norm.includes("chimic") || norm.includes("farmaceut") || norm.includes("material") || norm.includes("chem-") || norm.includes("chem_") || norm.includes("vqe") || norm.includes("drug") || norm.includes("chemistry") || norm.includes("chemie") || norm.includes("chimie") || norm.includes("化学") || norm.includes("製薬")) {
    base = TAXONOMIC_SECTORS.chimica;
  } else if (norm.includes("manifattur") || norm.includes("produzion") || norm.includes("fabbric") || norm.includes("cnc") || norm.includes("man-") || norm.includes("man_") || norm.includes("makespan") || norm.includes("manufacturing") || norm.includes("produktion") || norm.includes("fertigung") || norm.includes("制造") || norm.includes("製造")) {
    base = TAXONOMIC_SECTORS.manifattura;
  }

  const localized = getLocalizedTaxonomicTexts(base.id, language);
  if (!localized) return base;
  return {
    ...base,
    name: localized.name,
    spiegazioneStrategia: localized.spiegazioneStrategia,
    spiegazioneVincolo: localized.spiegazioneVincolo,
    stratAggTitle: localized.stratAggTitle,
    stratPrudTitle: localized.stratPrudTitle,
  };
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
  "fin-q-12", "fin-q-13", "fin-q-14", "fin-q-19", "fin-c-6", "fin-c-7",
  "san-q-1", "san-q-6", "san-q-8",
  "chem-q-3", "chem-c-4", "chem-c-6",
  "ene-c-2", "ene-c-3", "ene-q-7",
  "man-c-1", "man-c-2",
  "sec-c-1", "sec-q-1"
]);

export function getScenarioEntanglementProfile(sectorInput: string, scenarioId: string = "", language: LanguageCode = 'it'): EntanglementProfile {
  const normId = scenarioId.toLowerCase();
  const tax = getTaxonomicSector(sectorInput, scenarioId, language);
  const lang = resolveAgentLang(language);

  const isIndependent = INDEPENDENT_SCENARIO_IDS.has(normId) ||
    normId.includes("monte_carlo") ||
    normId.includes("pricing") ||
    normId.includes("screening") ||
    normId.includes("qae") ||
    normId.includes("sensor") ||
    normId.includes("var_");

  if (isIndependent) {
    const reasonMap: Record<string, string> = {
      it: `In questo scenario di ${tax.name}, ciascuna risorsa o traiettoria è logicamente autonoma (campionamento stocastico parallelo, screening individuale o diagnosi a canali isolati). Non vi è accoppiamento fisico o competizione diretta: l'entanglement quantistico NON è richiesto né raccomandato.`,
      en: `In this ${tax.name} scenario, each resource or trajectory is logically autonomous (parallel stochastic sampling, individual screening, or isolated diagnostics). There is no direct physical coupling: quantum entanglement is NOT required or recommended.`,
      zh: `在此「${tax.name}」场景中，每项资源或路径在逻辑上相互独立（并行随机采样、独立筛选或隔离通道诊断）。不存在直接物理耦合：不需要也不建议引入量子纠缠。`,
      de: `In diesem ${tax.name}-Szenario ist jede Ressource bzw. Trajektorie logisch eigenständig (paralleles stochastisches Sampling, Einzelsceening oder isolierte Diagnose). Es liegt keine direkte Kopplung vor: Quantenverschränkung ist NICHT erforderlich.`,
      fr: `Dans ce scénario ${tax.name}, chaque ressource ou trajectoire est logiquement autonome (échantillonnage stochastique parallèle, criblage individuel). Sans couplage physique direct, l'intrication quantique n'est PAS requise.`,
      ja: `この「${tax.name}」シナリオでは、各リソースや軌道は論理的に独立しています（並列確率サンプリング、個別スクリーニング、独立診断）。直接的な物理結合がないため、量子もつれは不要です。`,
    };
    const qMap: Record<string, string> = {
      it: `Dato che le risorse sono indipendenti, l'approccio computazionale ottimale è **Senza Entanglement (Stato Separabile Puro)**. Vuoi preservare l'indipendenza delle risorse (raccomandato) oppure forzare un legame di correlazione artificiale?`,
      en: `Since resources are independent, the optimal computational approach is **Without Entanglement (Pure Separable State)**. Keep resource independence (recommended) or force an artificial correlation link?`,
      zh: `由于资源相互独立，最佳计算模式为**无纠缠（纯可分量子态）**。是否保持资源独立性（推荐）或强制添加人工关联？`,
      de: `Da die Ressourcen unabhängig sind, ist **Ohne Verschränkung (Reiner separabler Zustand)** der optimale Ansatz. Unabhängigkeit beibehalten (empfohlen) oder künstliche Kopplung erzwingen?`,
      fr: `Les ressources étant indépendantes, l'approche optimale est **Sans Intrication (État Séparable Pur)**. Préserver l'indépendance (recommandé) ou forcer une corrélation artificielle ?`,
      ja: `リソースが独立しているため、最適な計算アプローチは**もつれなし（純粋分離可能状態）**です。独立性を維持（推奨）しますか、それとも相関リンクを強制しますか？`,
    };
    return {
      needsEntanglement: false,
      reason: reasonMap[lang] || reasonMap.en,
      question: qMap[lang] || qMap.en,
      recommendedVincolo: 'nessun_vincolo'
    };
  }

  const reasonDepMap: Record<string, string> = {
    it: `In questo scenario di ${tax.name}, le risorse sono vincolate da rigide interdipendenze, conflitti di simultaneità, finestre condivise o matrici di covarianza. L'entanglement quantistico è INDISPENSABILE per mappare le correlazioni simultanee nello spazio di Hilbert ed escludere configurazioni proibite.`,
    en: `In this ${tax.name} scenario, resources are bound by strict interdependencies, concurrency conflicts, shared windows, or covariance matrices. Quantum entanglement is ESSENTIAL to map simultaneous correlations in Hilbert space and exclude forbidden configurations.`,
    zh: `在此「${tax.name}」场景中，资源受严格相互依赖、并发冲突、共享窗口或协方差矩阵约束。量子纠缠对于在希尔伯特空间中映射同步相关性并排除禁止配置至关重要。`,
    de: `In diesem ${tax.name}-Szenario unterliegen die Ressourcen strengen Abhängigkeiten, Gleichzeitigkeitskonflikten oder Kovarianzmatrizen. Quantenverschränkung ist UNVERZICHTBAR, um Korrelationen im Hilbertraum abzubilden.`,
    fr: `Dans ce scénario ${tax.name}, les ressources sont liées par des interdépendances strictes, conflits de simultanéité ou matrices de covariance. L'intrication quantique est INDISPENSABLE pour cartographier ces corrélations dans l'espace de Hilbert.`,
    ja: `この「${tax.name}」シナリオでは、リソースが厳格な相互依存関係、同時性競合、共有ウィンドウ、または共分散行列によって制約されています。ヒルベルト空間で相関をマッピングし禁止構成を除外するため、量子もつれが不可欠です。`,
  };
  const qDepMap: Record<string, string> = {
    it: `Dato che le risorse competono o collaborano tra loro, quale tipologia di vincolo quantistico (entanglement) desideri applicare?`,
    en: `Since the resources compete or collaborate, which type of quantum constraint (entanglement) would you like to apply?`,
    zh: `鉴于资源之间存在竞争或协同关系，您希望应用哪种类型的量子约束（纠缠）？`,
    de: `Da die Ressourcen miteinander konkurrieren oder zusammenwirken, welche Art von Quanten-Einschränkung (Verschränkung) möchten Sie anwenden?`,
    fr: `Puisque les ressources sont en compétition ou en synergie, quel type de contrainte quantique (intrication) souhaitez-vous appliquer ?`,
    ja: `リソースが競合または協調しているため、どのタイプの量子制約（もつれ）を適用しますか？`,
  };
  return {
    needsEntanglement: true,
    reason: reasonDepMap[lang] || reasonDepMap.en,
    question: qDepMap[lang] || qDepMap.en,
    recommendedVincolo: 'blocco_rigido'
  };
}


