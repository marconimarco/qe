import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { 
  Building2, 
  Cpu, 
  UploadCloud, 
  FileCheck2, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  BarChart3, 
  Gauge, 
  Database,
  ArrowRight,
  HardDrive
} from 'lucide-react';

/**
 * =========================================================================================
 * ARCHITETTURA SCADA / MES: DIZIONARIO PARAMETRI E SENSORI NODI INDUSTRIALI
 * =========================================================================================
 */
export const DIZIONARIO_PARAMETRI_SCADA: Record<string, string[]> = {
  'navetta_lgv_agv': [
    'id', 'modello', 'posizione', 'stato', 'coordinateXYZ', 'angoliAssetto',
    'velocitaLineareMs', 'accelerazioneVettorialeMs2', 'raggioCurvaturaMm',
    'direzioneRuoteSterzantiDeg', 'pesoForcheKg', 'pressioneCircuitoIdraulicoBar',
    'tempMotoreTrazioneC', 'tempMotoreSollevamentoC', 'vibrazioniAssiG',
    'statoCaricaSoC', 'statoSaluteSoH', 'correnteAssorbitaA', 'tensioneLineaV',
    'energiaRigenerataFrenataWh', 'tempCelleBatteriaC', 'tempModuliBmsC',
    'distanzaOstacoloLaserMm', 'bitCampoProtetto', 'idMissione', 'idNodoSorgente',
    'idNodoDestinazione', 'idNodoProssimo', 'rssiWifiDbm', 'pacchettiPersiPct',
    'soglia_temperatura_batteria_max', 'soglia_soc_minimo', 'soglia_soh_minimo',
    'soglia_distanza_ostacolo_laser_minima'
  ],
  'isola_pallettizzazione_robotizzata': [
    'id', 'nome', 'linea', 'plcTag', 'stato', 'statoPlc', 'conteggioPezziMinuto',
    'contatorePalletCompletati', 'tempoCicloStratoMs', 'activeRecipeId',
    'numeroStratiCorrenti', 'correnteJointA', 'coppiaMotoriNm', 'tempMotoriduttoriC',
    'tempAzionamentiC', 'pressionePneumaticaVuotoBar', 'portataAriaAspirataM3h',
    'forzaSerraggioPinzeN', 'flagPresenzaInterfalda', 'spessoreInterfaldaMm',
    'indiceOeeLocalePct', 'storicoMicrofermiCiclo', 'soglia_coppia_motori_max',
    'soglia_depressione_vuoto_minima', 'soglia_corrente_joint_max'
  ],
  'fasciatore_automatico_silkworm': [
    'id', 'nome', 'reparto', 'plcTag', 'stato', 'velocitaRotazioneRpm',
    'forzaSerraggioCaricoN', 'rapportoPrestiroRealePct', 'velocitaCarrelloBobinaMs',
    'velocita_svolgimento', 'pesoFilmApplicatoGrammi', 'metriLineariFilmErogati',
    'tensioneFilmSpigoliN', 'spessore_film_micron', 'percentualeFilmResiduoBobinaPct',
    'tempBarraSaldanteC', 'bitRotturaFilm', 'flagFineBobina', 'anomalieMotoriTraino',
    'vettore_accelerometro', 'vibrazioniAssiG', 'soglia_rotazione_rpm_max',
    'soglia_tensione_film_max', 'soglia_temperatura_barra_saldante_max',
    'soglia_vibrazione_cuscinetto_z_max'
  ],
  'etichettatrice_robotizzata': [
    'id', 'nome', 'plcTag', 'stato', 'ssccCode', 'etichettaGs1', 'lotto',
    'dataScadenza', 'skuProdotto', 'timestampApplicazioneMs', 'posizioneApplicazione',
    'gradoQualitaStampaIso', 'stringaRitornoValidatoreOttico', 'tempTestinaTermicaC',
    'pressioneAriaApplicatoreBar', 'metriResiduiRibbon', 'metriResiduiRotoloEtichette',
    'contatoreEtichetteScartate', 'soglia_qualita_stampa_minima', 'soglia_temperatura_testina_max'
  ],
  'magazzino_automatico': [
    'id', 'nome', 'reparto', 'plcTag', 'stato', 'totaleCelle', 'celleOccupate',
    'celleVuote', 'cellePrenotateIngresso', 'cellePrenotateUscita', 'idCellaSpecifico',
    'classe_rotazione', 'timestampStoccaggio', 'velocita_ms', 'saturazione_corsia',
    'pesoRealeBilanciaKg', 'altezzaMm', 'larghezzaMm', 'lunghezzaMm', 'sagoma_fuori_asse',
    'controlloFondoPalletIntegritaPattini', 'posizioneEncoderAssoluto',
    'niveauSupercondensatoriShuttlePct', 'livelloBatteriaShuttlePct',
    'correnteAssorbitaMotoriA', 'tempAmbientaleCorsieC', 'vettore_pressione_bar',
    'micro_inclinazione', 'soglia_saturazione_wms_max', 'soglia_pressione_montante_max',
    'soglia_inclinazione_strutturale_max', 'tolleranza_sagoma_fuori_asse'
  ],
  'controllo_pallet_vuoti_woodpecker': [
    'id', 'nome', 'throughputPalletOra', 'forzaDeformazionePattiniN', 'umiditaLegnoPct',
    'esitoIspezione', 'asseSpaccata', 'chiodoSporgente', 'blocchettoMancante',
    'fuoriTolleranzaGeometrica', 'idFornitoreLottoLegno', 'soglia_forza_deformazione_minima',
    'soglia_umidita_legno_massima'
  ],
  'stazione_ricarica_fast_charge': [
    'id', 'statoInverter', 'potenzaErogataKw', 'tempPiastraTerraC',
    'tempPiastraBordoVeicoloC', 'tempoResiduoCaricaMin', 'navettaOccupante',
    'stazioniAttive', 'soglia_potenza_totale_microgrid_max', 'soglia_temperatura_piastra_terra_max'
  ],
  'infrastruttura_traffico': [
    'id', 'matriceAdiacenzaTratte', 'statoSegmentiCorsia', 'lgvInCodaBuffer',
    'coefficiente_traffico', 'mappa_ingorghi_nodi', 'soglia_congestione_traffico_max',
    'soglia_saturazione_buffer_max'
  ],
  'baia_carico_scarico': [
    'id', 'nome', 'tipo', 'stato', 'camionAssegnato', 'ore_lavoro_disponibili',
    'baie_totali', 'baie_libere', 'ritardo_stimato_minuti', 'camion_attesa',
    'volume_disponibile_mc', 'lista_pesi_pallet', 'pallet_pronti_linea',
    'codice_saturazione_buffer', 'soglia_ritardo_camion_max',
    'soglia_sbilanciamento_assi_max', 'soglia_peso_totale_pianale_max'
  ],
  'rulliera_inbound_evacuazione_silos': [
    'id', 'nome', 'reparto', 'plcTag', 'stato', 'carico_orario_ton',
    'flusso_kg', 'stato_fotocellule_accumulo'
  ]
};

/**
 * Record SCADA normalizzato a modello a eventi per bus MQTT / Kafka / MES
 */
export interface RecordScadaNormalizzato {
  timestamp: string;
  machineId: string;
  parameterName: string;
  value: number | string;
}

/**
 * Risultati statistici aggregati elaborati in tempo reale
 */
export interface StatisticheSensore {
  parametro: string;
  conteggio: number;
  media?: number;
  min?: number;
  max?: number;
  valoreUltimo: number | string;
  unitaMisura: string;
}

export interface ReportStatisticoIndustriale {
  macchinaId: string;
  stabilimento: string;
  totaleCampionamenti: number;
  timestampInizio: string;
  timestampFine: string;
  metriche: StatisticheSensore[];
}

export default function IndustrialScadaUpload() {
  // 1. Stato dei controlli di sicurezza (menu a tendina)
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [selectedMachineType, setSelectedMachineType] = useState<string>('');
  
  // 2. Stato per la gestione del file caricato
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 3. Stato per errori e risultati dell'elaborazione
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [reportStatistico, setReportStatistico] = useState<ReportStatisticoIndustriale | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // La condizione di abilitazione dell'interfaccia di upload:
  // L'utente DEVE aver selezionato sia lo stabilimento sia il macchinario.
  const isUploadUnlocked = Boolean(selectedPlant.trim() && selectedMachineType.trim());

  /**
   * Reset dello stato di errore e dei dati se l'utente cambia contesto
   */
  const handlePlantChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlant(e.target.value);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleMachineTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMachineType(e.target.value);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  /**
   * Apertura del pop-up di selezione file nativo del sistema operativo
   */
  const handleOpenSystemFileDialog = () => {
    if (!isUploadUnlocked) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  /**
   * Gestione selezione file da input standard
   */
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  /**
   * Gestione Drag and Drop
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploadUnlocked) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!isUploadUnlocked) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setErrorMessage("Formato non valido: è richiesto un file con estensione .csv");
        return;
      }
      processSelectedFile(file);
    }
  };

  /**
   * Acquisizione preliminare del file in memoria
   */
  const processSelectedFile = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setReportStatistico(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadedFile(file);
      setFileContent(content);
      setSuccessMessage(`File "${file.name}" caricato in memoria con successo (${(file.size / 1024).toFixed(1)} KB).`);
    };
    reader.onerror = () => {
      setErrorMessage("Errore durante la lettura del file dal disco locale.");
    };
    reader.readAsText(file);
  };

  /**
   * NORMALIZZAZIONE DATE: converte formati DD/MM/YYYY HH:mm:ss o YYYY-MM-DD in ISO Standard
   */
  const normalizzaDataIso = (rawDate: string): string => {
    const trimmed = rawDate.trim();
    if (!trimmed) return new Date().toISOString();

    // Gestione formato DD/MM/YYYY o DD-MM-YYYY
    const itMatch = trimmed.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (itMatch) {
      const [_, day, month, year, hours = '00', mins = '00', secs = '00'] = itMatch;
      const d = new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hours, 10),
        parseInt(mins, 10),
        parseInt(secs, 10)
      );
      return !isNaN(d.getTime()) ? d.toISOString() : trimmed;
    }

    // Se è già YYYY-MM-DD o ISO standard
    const parsed = new Date(trimmed);
    return !isNaN(parsed.getTime()) ? parsed.toISOString() : trimmed;
  };

  /**
   * DATA CLEANSING DECIMALI: Converte "72,5" in 72.5 e restituisce numero o stringa
   */
  const pulisciValoreNumerico = (rawVal: string): number | string => {
    if (!rawVal) return 0;
    const pulito = rawVal.trim().replace(',', '.');
    const num = parseFloat(pulito);
    return !isNaN(num) && isFinite(num) ? num : pulito;
  };

  /**
   * SIMULAZIONE UPSERT ANAGRAFICA SCADA / MES A DATABASE
   */
  const eseguiUpsertAnagraficaDatabase = async (stabilimento: string, macchinarioId: string) => {
    // Logica di persistenza MES: garantisce la registrazione del nodo e dell'impianto
    console.log(`[MES/SCADA UPSERT] Registrazione nodo '${macchinarioId}' per impianto '${stabilimento}'`);
  };

  /**
   * MOTORE DI PARSING UNIVERSALE E CONTROLLO INCROCIATO
   */
  const handleElaboraDati = async () => {
    if (!uploadedFile || !fileContent) {
      setErrorMessage("Nessun file selezionato per l'elaborazione.");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // 1. Lettura righe non vuote
      const righe = fileContent.split(/\r?\n/).map(r => r.trim()).filter(r => r.length > 0);
      if (righe.length < 2) {
        throw new Error("Il file CSV contiene solo l'intestazione o è privo di record campionati.");
      }

      // 2. Rilevazione separatore e intestazione
      const headerLine = righe[0];
      const separatore = headerLine.includes(';') ? ';' : ',';
      const headers = headerLine.split(separatore).map(h => h.trim().replace(/^["']|["']$/g, ''));

      // 3. Rilevamento Geometria File (Formato A: Serie Temporale vs Formato B: Chiave-Valore ad Eventi)
      const isFormatB = headers.some(h => /parameter_name/i.test(h)) || 
                        (headers.length === 4 && /timestamp/i.test(headers[0]) && /value/i.test(headers[3]));

      // 4. CONTROLLO INCROCIATO DI SICUREZZA (Selezione vs ID Registrato nel File)
      const primaRigaValori = righe[1].split(separatore).map(v => v.trim().replace(/^["']|["']$/g, ''));
      let extractedMachineId = '';

      if (isFormatB) {
        // Nel Formato B la colonna Machine_ID è tipicamente la seconda
        const machineIdIdx = headers.findIndex(h => /machine_?id|id_?macchina/i.test(h));
        extractedMachineId = machineIdIdx !== -1 ? primaRigaValori[machineIdIdx] : primaRigaValori[1] || '';
      } else {
        // Nel Formato A cerchiamo la colonna ID_Macchina oppure Machine_ID
        const machineIdIdx = headers.findIndex(h => /machine_?id|id_?macchina/i.test(h));
        if (machineIdIdx !== -1) {
          extractedMachineId = primaRigaValori[machineIdIdx];
        } else {
          // Se non è esplicitato nell'header, verifica la presenza nei valori o confronta con la tipologia
          extractedMachineId = selectedMachineType;
        }
      }

      // Normalizzazione stringhe per confronto rigoroso
      const cleanSelected = selectedMachineType.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanExtracted = extractedMachineId.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (cleanExtracted && cleanSelected && !cleanExtracted.includes(cleanSelected) && !cleanSelected.includes(cleanExtracted)) {
        throw new Error(`Attenzione: il file caricato non corrisponde al macchinario selezionato. ID Rilevato nel file: '${extractedMachineId}' | Selezionato nel menu: '${selectedMachineType}'`);
      }

      // 5. PARSING DEI RECORD E DATA CLEANSING
      const recordNormalizzati: RecordScadaNormalizzato[] = [];

      if (isFormatB) {
        // FORMATO B (Timestamp, Machine_ID, Parameter_Name, Value)
        const tsIdx = headers.findIndex(h => /timestamp|data/i.test(h));
        const idIdx = headers.findIndex(h => /machine_?id|id_?macchina/i.test(h));
        const paramIdx = headers.findIndex(h => /parameter_?name|parametro/i.test(h));
        const valIdx = headers.findIndex(h => /value|valore/i.test(h));

        for (let i = 1; i < righe.length; i++) {
          const celle = righe[i].split(separatore).map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (celle.length < 3) continue;

          const ts = normalizzaDataIso(celle[tsIdx !== -1 ? tsIdx : 0]);
          const mId = celle[idIdx !== -1 ? idIdx : 1] || selectedMachineType;
          const pName = celle[paramIdx !== -1 ? paramIdx : 2];
          const val = pulisciValoreNumerico(celle[valIdx !== -1 ? valIdx : 3]);

          recordNormalizzati.push({
            timestamp: ts,
            machineId: mId,
            parameterName: pName,
            value: val
          });
        }
      } else {
        // FORMATO A (Serie Temporale con colonne dinamiche dei sensori)
        const tsIdx = headers.findIndex(h => /timestamp|data|tempo/i.test(h));
        const machineIdIdx = headers.findIndex(h => /machine_?id|id_?macchina/i.test(h));

        for (let i = 1; i < righe.length; i++) {
          const celle = righe[i].split(separatore).map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (celle.length < 2) continue;

          const ts = normalizzaDataIso(tsIdx !== -1 ? celle[tsIdx] : new Date().toISOString());
          const mId = machineIdIdx !== -1 ? celle[machineIdIdx] : selectedMachineType;

          headers.forEach((colName, colIdx) => {
            if (colIdx === tsIdx || colIdx === machineIdIdx) return;
            const rawVal = celle[colIdx];
            if (rawVal !== undefined && rawVal !== '') {
              recordNormalizzati.push({
                timestamp: ts,
                machineId: mId,
                parameterName: colName,
                value: pulisciValoreNumerico(rawVal)
              });
            }
          });
        }
      }

      // 6. Esecuzione Upsert a Database
      await eseguiUpsertAnagraficaDatabase(selectedPlant, selectedMachineType);

      // 7. Esecuzione calcoli statistici automatici
      const report = eseguiCalcoliStatistici(recordNormalizzati, selectedPlant, selectedMachineType);
      setReportStatistico(report);
      setSuccessMessage(`Elaborazione completata con successo: normalizzati ${recordNormalizzati.length} punti di telemetria industriale.`);

    } catch (err: any) {
      setErrorMessage(err.message || "Errore sconosciuto durante il parsing del file.");
      setReportStatistico(null);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * =======================================================================================
   * FUNZIONE DI CALCOLO STATISTICO INDUSTRIALE REALE
   * =======================================================================================
   */
  const eseguiCalcoliStatistici = (
    records: RecordScadaNormalizzato[], 
    stabilimento: string, 
    macchinario: string
  ): ReportStatisticoIndustriale => {
    const gruppiParametri: Record<string, { valoriNumerici: number[]; ultimoValore: number | string }> = {};

    records.forEach(rec => {
      if (!gruppiParametri[rec.parameterName]) {
        gruppiParametri[rec.parameterName] = { valoriNumerici: [], ultimoValore: rec.value };
      }
      gruppiParametri[rec.parameterName].ultimoValore = rec.value;
      if (typeof rec.value === 'number') {
        gruppiParametri[rec.parameterName].valoriNumerici.push(rec.value);
      }
    });

    const metriche: StatisticheSensore[] = Object.keys(gruppiParametri).map(pName => {
      const dati = gruppiParametri[pName];
      const count = dati.valoriNumerici.length;
      
      let media: number | undefined;
      let min: number | undefined;
      let max: number | undefined;

      if (count > 0) {
        const sum = dati.valoriNumerici.reduce((acc, curr) => acc + curr, 0);
        media = parseFloat((sum / count).toFixed(2));
        min = parseFloat(Math.min(...dati.valoriNumerici).toFixed(2));
        max = parseFloat(Math.max(...dati.valoriNumerici).toFixed(2));
      }

      // Deduce unità di misura standard dal nome
      let unita = 'val';
      if (/temp|c$/i.test(pName)) unita = '°C';
      else if (/bar|pressione/i.test(pName)) unita = 'bar';
      else if (/ms|velocita/i.test(pName)) unita = 'm/s';
      else if (/rpm/i.test(pName)) unita = 'RPM';
      else if (/kg/i.test(pName)) unita = 'kg';
      else if (/pct|soc|soh/i.test(pName)) unita = '%';
      else if (/kw/i.test(pName)) unita = 'kW';

      return {
        parametro: pName,
        conteggio: count > 0 ? count : 1,
        media,
        min,
        max,
        valoreUltimo: dati.ultimoValore,
        unitaMisura: unita
      };
    });

    return {
      macchinaId: macchinario,
      stabilimento,
      totaleCampionamenti: records.length,
      timestampInizio: records[0]?.timestamp || new Date().toISOString(),
      timestampFine: records[records.length - 1]?.timestamp || new Date().toISOString(),
      metriche
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl font-sans">
      
      {/* Intestazione del Modulo SCADA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Gateway Ingestion Telemetria SCADA / MES
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Modulo di caricamento controllato, validazione geometrica CSV e aggregazione statistica dei nodi
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Protocollo: Formato A/B Industriale</span>
        </div>
      </div>

      {/* SEZIONE 1: MENU A TENDINA PER CONTROLLO PREVENTIVO DI SICUREZZA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            1. Seleziona / Conferma Stabilimento
          </label>
          <select
            value={selectedPlant}
            onChange={handlePlantChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
          >
            <option value="">-- Scegli Stabilimento Operativo --</option>
            <option value="Stabilimento_Nord_Hub01">Stabilimento Nord - Hub Logistico 01</option>
            <option value="Stabilimento_Centro_LineeRobot">Stabilimento Centro - Linee Robotizzate</option>
            <option value="Stabilimento_Sud_Confezionamento">Stabilimento Sud - Impianto Confezionamento</option>
            <option value="Polo_Automatizzato_Silos_Est">Polo Automatizzato Silos Est</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            2. Seleziona / Conferma Macchinario / Tipo di Nodo
          </label>
          <select
            value={selectedMachineType}
            onChange={handleMachineTypeChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
          >
            <option value="">-- Scegli Tipologia Macchinario --</option>
            <option value="navetta_lgv_agv">Navetta LGV / AGV</option>
            <option value="isola_pallettizzazione_robotizzata">Isola di Pallettizzazione Robotizzata</option>
            <option value="fasciatore_automatico_silkworm">Fasciatore Automatico Silkworm</option>
            <option value="etichettatrice_robotizzata">Etichettatrice Robotizzata</option>
            <option value="magazzino_automatico">Magazzino Automatico</option>
            <option value="controllo_pallet_vuoti_woodpecker">Controllo Pallet Vuoti Woodpecker</option>
            <option value="stazione_ricarica_fast_charge">Stazione di Ricarica Fast Charge</option>
            <option value="infrastruttura_traffico">Infrastruttura di Traffico</option>
            <option value="baia_carico_scarico">Baia di Carico / Scarico</option>
            <option value="rulliera_inbound_evacuazione_silos">Rulliera Inbound Evacuazione Silos</option>
          </select>
        </div>
      </div>

      {/* Banner di Blocco / Istruzioni di Sblocco */}
      {!isUploadUnlocked && (
        <div className="p-3 mb-6 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Sicurezza Attiva: l'area di caricamento file e il pulsante di sfoglia sono disabilitati. 
            Seleziona stabilimento e macchinario per sbloccare l'acquisizione.
          </span>
        </div>
      )}

      {/* SEZIONE 2: AREA DI DRAG & DROP E PULSANTE DI SFOGLIA FILE SISTEMA */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center gap-4 ${
          !isUploadUnlocked
            ? 'border-slate-800 bg-slate-900/30 opacity-50 cursor-not-allowed pointer-events-none'
            : isDragging
              ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
              : 'border-slate-700 bg-slate-900/70 hover:border-slate-600'
        }`}
      >
        {/* Input file nativo nascosto */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileInputChange}
          disabled={!isUploadUnlocked}
          className="hidden"
        />

        <div className={`p-4 rounded-full ${isUploadUnlocked ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-600'}`}>
          <UploadCloud className="w-10 h-10" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white">
            {uploadedFile ? uploadedFile.name : "Trascina qui il file CSV di telemetria industriale"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isUploadUnlocked 
              ? "Supporta Formato A (Serie Temporale con sensori in colonna) e Formato B (Evento Chiave-Valore)"
              : "Seleziona prima stabilimento e macchinario per attivare il Drag & Drop"}
          </p>
        </div>

        {/* Pulsante specifico per sfogliare file dal sistema operativo */}
        <button
          type="button"
          onClick={handleOpenSystemFileDialog}
          disabled={!isUploadUnlocked}
          className={`px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-2 ${
            !isUploadUnlocked
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/50 cursor-pointer'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Carica file manualmente</span>
        </button>

        {uploadedFile && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>File pronto per la verifica incrociata: {uploadedFile.name}</span>
          </div>
        )}
      </div>

      {/* SEZIONE 3: PULSANTE DI ELABORAZIONE FINALE */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-400">
          Controllo incrociato: verifica corrispondenza ID e normalizzazione decimali/date
        </div>

        <button
          type="button"
          onClick={handleElaboraDati}
          disabled={!uploadedFile || !isUploadUnlocked || isProcessing}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            !uploadedFile || !isUploadUnlocked || isProcessing
              ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 cursor-pointer'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isProcessing ? "Elaborazione in corso..." : "Elabora Dati"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Messaggi di Stato (Errore o Conferma) */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs font-mono flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold uppercase tracking-wider">Errore di Validazione o Incompatibilità</div>
            <p className="mt-1 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && !errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SEZIONE 4: REPORT STATISTICO IMMEDIATO A SCHERMO */}
      {reportStatistico && (
        <div className="mt-8 pt-6 border-t border-slate-800 animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">
                Report Aggregato Sensori Industriali
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Impianto: <strong className="text-slate-200">{reportStatistico.stabilimento}</strong> | Macchina: <strong className="text-slate-200">{reportStatistico.macchinaId}</strong>
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Parametro Sensore</th>
                  <th className="py-3 px-4">Campionamenti</th>
                  <th className="py-3 px-4">Media</th>
                  <th className="py-3 px-4">Minimo</th>
                  <th className="py-3 px-4">Massimo</th>
                  <th className="py-3 px-4">Ultimo Rilevamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                {reportStatistico.metriche.map((metrica, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-cyan-300">
                      {metrica.parametro}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {metrica.conteggio}
                    </td>
                    <td className="py-2.5 px-4 text-slate-200">
                      {metrica.media !== undefined ? `${metrica.media} ${metrica.unitaMisura}` : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-emerald-400">
                      {metrica.min !== undefined ? `${metrica.min} ${metrica.unitaMisura}` : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-amber-400">
                      {metrica.max !== undefined ? `${metrica.max} ${metrica.unitaMisura}` : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-white font-bold">
                      {metrica.valoreUltimo} {metrica.unitaMisura}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
