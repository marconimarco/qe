/**
 * SCHEDA TECNICA: PARAMETRI E METRICHE WEARABLE (MONITORAGGIO CARICO & BIOMECCANICA IMU)
 * Interfaccia tipizzata per acquisizione dati smartwatch, calcolo metriche derivate ed effetti domino.
 */

export type SentinelStatus = 'verde' | 'gialla' | 'rossa';

export interface WearableWorkloadMetrics {
  // --- [1] METRICHE DI CARICO DI LAVORO (WORKLOAD PARAMETERS) ---
  /** ACWR (Acute-to-Chronic Workload Ratio) [Rapporto tra carico acuto e cronico, range ottimale: 0.8 - 1.3, >1.5 pericolo] */
  acwr: number;
  /** Carico cumulativo (Cumulative Workload) [Stress meccanico totale accumulato in giorni/settimane in AU] */
  cumulativeWorkload: number;
  /** Carico meccanico (Mechanical Load) [Quantificazione forze fisiche esterne apparato muscoloscheletrico in kJ o AU] */
  mechanicalLoad: number;

  // --- [2] SENSORI FISICI E PARAMETRI BIOMECCANICI (IMU METRICS) ---
  /** IMU (Inertial Measurement Units) [Stato e frequenza campionamento del gruppo sensori fisici triassiali] */
  imuStatus: 'Attivo (100Hz)' | 'Calibrato (200Hz)' | 'Risparmio Energetico (50Hz)' | 'Disconnesso';
  /** Accelerometro (Accelerometer) [Accelerazioni e decelerazioni sui 3 assi spaziali in g o m/s²] */
  accelerometerPeak: number;
  /** Giroscopio (Gyroscope) [Velocità angolare e orientamento segmenti corporei in deg/s] */
  gyroscopeAngularVelocity: number;
  /** Impatti (Impacts) [Forza d'urto meccanica registrata sui segmenti ossei, es. impatto tibia in g] */
  impactsTibia: number;
  /** Velocità (Velocity) [Tasso di spostamento e rapidità del gesto atletico in km/h] */
  velocity: number;
  /** Distanza percorsa (Distance) [Volume totale dello spostamento in km] */
  distance: number;
  /** Passi (Steps) [Conteggio totale e frequenza dei passi eseguiti] */
  steps: number;

  // --- [3] METRICHE AVANZATE DI SINTESI (AI & CLINICAL OUTCOMES) ---
  /** Alterazioni biomeccaniche (Biomechanic Alterations) [Asimmetrie e deviazioni postura/appoggio %] */
  biomechanicAlterations: number;
  /** Indice di fatica (Fatigue Index) [Decadimento ed efficienza del gesto nel tempo %] */
  fatigueIndex: number;
  /** Segnale Sentinella / Luce Gialla (Sentinel Signal) [Deviazione statistica dal comportamento abituale] */
  sentinelSignal: SentinelStatus;
  /** Infortuni muscoloscheletrici (Musculoskeletal Injuries Outcome) [Dato clinico di tracciamento dell'evento lesivo] */
  musculoskeletalInjuriesOutcome: string;
}

export const DEFAULT_WEARABLE_METRICS: WearableWorkloadMetrics = {
  acwr: 1.05,
  cumulativeWorkload: 680,
  mechanicalLoad: 42,
  imuStatus: 'Attivo (100Hz)',
  accelerometerPeak: 4.8,
  gyroscopeAngularVelocity: 260,
  impactsTibia: 7.2,
  velocity: 11.5,
  distance: 8.4,
  steps: 9200,
  biomechanicAlterations: 3.5,
  fatigueIndex: 28,
  sentinelSignal: 'verde',
  musculoskeletalInjuriesOutcome: 'Nessun evento lesivo attivo - Integrità muscoloscheletrica ottimale'
};

export interface WearableDominoAlert {
  id: string;
  titolo: string;
  livelloRischio: 'basso' | 'moderato' | 'critico';
  colore: string;
  badge: string;
  descrizione: string;
  incrocioParametri: string;
  fasiDomino: Array<{ fase: string; nome: string; descrizione: string }>;
  raccomandazioneClinica: string;
}

/**
 * Valuta gli incroci biomeccanici dei dati smartwatch e restituisce le allerte di Effetto Domino
 */
export function valutaEffettiDominoWearable(metrics: Partial<WearableWorkloadMetrics>): WearableDominoAlert[] {
  const m = { ...DEFAULT_WEARABLE_METRICS, ...metrics };
  const alerts: WearableDominoAlert[] = [];

  // Incrocio 1: ACWR > 1.45 + Impatti Tibia > 11g + Asimmetria Biomeccanica > 8%
  if (m.acwr >= 1.45 && m.impactsTibia >= 11 && m.biomechanicAlterations >= 8) {
    alerts.push({
      id: 'acwr_impatti_frattura_stress',
      titolo: 'Effetto Domino: Periostite & Frattura da Stress Tibiale',
      livelloRischio: 'critico',
      colore: 'border-red-500/50 bg-red-500/10 text-red-300',
      badge: 'Allerta Spike di Carico (ACWR > 1.45)',
      descrizione: `Lo spike improvviso di carico acuto (ACWR: ${m.acwr.toFixed(2)}) combinato ad impatti d'urto tibiali elevati (${m.impactsTibia}g) e asimmetria d'appoggio (${m.biomechanicAlterations}%) produce micro-lesioni trabecolari non riassorbite.`,
      incrocioParametri: `ACWR: ${m.acwr.toFixed(2)} | Impatti Tibia: ${m.impactsTibia}g | Asimmetria: ${m.biomechanicAlterations}%`,
      fasiDomino: [
        { fase: 'Fase 1', nome: 'Picco di Carico Non-Adattato', descrizione: 'Il volume acuto supera di oltre il 45% la tolleranza cronica dell’osso.' },
        { fase: 'Fase 2', nome: 'Micro-fessurazione Corticale', descrizione: 'Le forze d’urto localizzate sulla tibia superano il turnover osteoblastico inducendo periostite.' },
        { fase: 'Fase 3', nome: 'Frattura da Fatica', descrizione: 'Comparsa di edema osseo e frattura da stress sub-corticale con stop forzato dell’atleta.' }
      ],
      raccomandazioneClinica: 'Risonanza magnetica (MRI) della diafisi tibiale; scarico gravitazionale immediato e de-escalation del carico acuto (target ACWR < 1.15).'
    });
  }

  // Incrocio 2: Indice di Fatica > 65% + Asimmetria Biomeccanica > 9% + Giroscopio instabile
  if (m.fatigueIndex >= 65 && (m.biomechanicAlterations >= 9 || m.sentinelSignal !== 'verde')) {
    alerts.push({
      id: 'fatica_giroscopio_rottura_lca',
      titolo: 'Effetto Domino: Cedimento Neuromuscolare & Rischio Lesione Capsulo-Legamentosa (LCA/Menisco)',
      livelloRischio: 'critico',
      colore: 'border-orange-500/50 bg-orange-500/10 text-orange-300',
      badge: 'Fatica Neuromuscolare Eccessiva',
      descrizione: `L'elevato indice di fatica (${m.fatigueIndex}%) compromette il controllo motorio propriocettivo rilevato dal giroscopio, provocando valgo dinamico del ginocchio negli atterraggi e cambi di direzione.`,
      incrocioParametri: `Indice Fatica: ${m.fatigueIndex}% | Asimmetria: ${m.biomechanicAlterations}% | Segnale: ${m.sentinelSignal.toUpperCase()}`,
      fasiDomino: [
        { fase: 'Fase 1', nome: 'Latenza Riflesso Propriocettivo', descrizione: 'I motoneuroni affaticati ritardano la co-contrazione protettiva di ischiocrurali e quadricipite.' },
        { fase: 'Fase 2', nome: 'Instabilità Angolare (Giroscopio)', descrizione: 'Deviazione delle traiettorie angolari con perdita di assialità femoro-rotulea durante la fase di spinta.' },
        { fase: 'Fase 3', nome: 'Sollecitazione Taglio LCA', descrizione: 'Forze di taglio incontrollate sul legamento crociato anteriore e menischi con alto rischio lesivo.' }
      ],
      raccomandazioneClinica: 'Protocollo di scarico immediato, test di stabilità articolare (Lachman) e reinserimento progressivo con potenziamento propriocettivo.'
    });
  }

  // Incrocio 3: Carico Cumulativo Estremo (> 1400 AU) + Segnale Sentinella "Gialla/Rossa"
  if (m.cumulativeWorkload >= 1400 || m.sentinelSignal === 'gialla' || m.sentinelSignal === 'rossa') {
    alerts.push({
      id: 'carico_cumulativo_sentinella_overtraining',
      titolo: 'Effetto Domino: Segnale Sentinella (Luce Gialla) & Tendinopatia da Sovraccarico',
      livelloRischio: m.sentinelSignal === 'rossa' ? 'critico' : 'moderato',
      colore: m.sentinelSignal === 'rossa' ? 'border-red-500/50 bg-red-500/10 text-red-300' : 'border-amber-500/50 bg-amber-500/10 text-amber-300',
      badge: `Luce Sentinella ${m.sentinelSignal.toUpperCase()}`,
      descrizione: `L'algoritmo rileva una deviazione statistica dal comportamento abituale (Segnale Sentinella: ${m.sentinelSignal.toUpperCase()}) con carico cumulativo elevato (${m.cumulativeWorkload} AU). I tendini non completano la sintesi del collagene.`,
      incrocioParametri: `Carico Cumulativo: ${m.cumulativeWorkload} AU | Segnale: ${m.sentinelSignal} | Fatica: ${m.fatigueIndex}%`,
      fasiDomino: [
        { fase: 'Fase 1', nome: 'Segnale Sentinella Precose', descrizione: 'Piccoli cambiamenti nella cinematica e cadenza indicano sub-dolore o compensazione inconsapevole.' },
        { fase: 'Fase 2', nome: 'Degenerazione Mucoide del Tendine', descrizione: 'Le fibre di collagene del tendine d’Achille o rotuleo perdono l’architettura parallela.' },
        { fase: 'Fase 3', nome: 'Tendinopatia Cronica Inserzionale', descrizione: 'Ispessimento doloroso, neo-vascolarizzazione patologica e rischio di rottura parziale.' }
      ],
      raccomandazioneClinica: 'Ecocolordoppler tendineo; protocollo di scarico attivo (40% di volume in meno per 7 giorni) e fisioterapia eccentrica.'
    });
  }

  // Incrocio 4: Passi Massivi (> 22.000) + Carico Meccanico > 70 kJ
  if (m.steps >= 22000 && m.mechanicalLoad >= 70) {
    alerts.push({
      id: 'carico_meccanico_rabdomiolisi_renale',
      titolo: 'Effetto Domino: Sovraccarico Meccanico Estremo & Rischio Rabdomiolisi/Renale',
      livelloRischio: 'moderato',
      colore: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300',
      badge: 'Sollecitazione Meccanica Massiva',
      descrizione: `Volume di passi elevatissimo (${m.steps.toLocaleString('it-IT')}) unito a carico meccanico severo (${m.mechanicalLoad} kJ). Richiede monitoraggio di idratazione ed enzimi muscolari per scongiurare danni tubulari renali.`,
      incrocioParametri: `Passi: ${m.steps.toLocaleString('it-IT')} | Carico Meccanico: ${m.mechanicalLoad} kJ | Distanza: ${m.distance} km`,
      fasiDomino: [
        { fase: 'Fase 1', nome: 'Microlesioni Miofibrillari da Impatto', descrizione: 'Le contrazioni eccentriche ripetute causano lisi focale del sarcolemma muscolare.' },
        { fase: 'Fase 2', nome: 'Rilascio Mioglobina e CK', descrizione: 'La proteina mioglobina passa in circolo; se non idratati si concentra nei tubuli renali.' },
        { fase: 'Fase 3', nome: 'Sofferenza Nefronica', descrizione: 'Sovraccarico dei glomeruli con transitoria riduzione del filtrato renale e urine ipercromiche.' }
      ],
      raccomandazioneClinica: 'Idratazione osmotica abbondante con sali minerali; monitoraggio di azotemia, creatinina e CK sierica; riposo neuromuscolare.'
    });
  }

  return alerts;
}
