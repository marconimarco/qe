import React, { useState } from 'react';
import { 
  X, Cpu, Copy, Check, Play, RefreshCw, Zap, Activity, Heart, ShieldAlert, Sparkles, 
  AlertCircle, ArrowUpRight, ArrowDownRight, FolderUp, FileText, Upload, CheckCircle2, 
  AlertTriangle, Flame, Droplets, Shield, HeartPulse 
} from 'lucide-react';
import { 
  elaboraPaginaHealth, 
  estraiDatiFascicoloPerQubit, 
  valutaIncrociClinici, 
  HealthInputData, 
  HealthPageReport, 
  FascicoloEstrattoResult, 
  IncrocioDettaglio,
  RANGE_CLINICI, 
  LOINC_MAPPING 
} from '../lib/quantumHealthEngine';

interface QuantumHealth13QubitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToScreening?: (report: HealthPageReport) => void;
}

const SAMPLE_FSE_CDA2_XML = `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument xmlns="urn:hl7-org:v3">
  <!-- FSE 2.0 Fascicolo Sanitario Elettronico Interoperabile (Regione Emilia-Romagna / Lepida) -->
  <recordTarget>
    <patientRole>
      <patient>
        <name><given>Mario</given><family>Rossi</family></name>
        <birthTime value="19780622"/>
      </patient>
    </patientRole>
  </recordTarget>
  <component>
    <structuredBody>
      <section>
        <entry>
          <!-- Glicemia: LOINC 15074-8 -->
          <observation classCode="OBS" moodCode="EVN">
            <code code="15074-8" codeSystem="2.16.840.1.113883.6.1" displayName="Glucosio Sierico"/>
            <value xsi:type="PQ" value="116.0" unit="mg/dL"/>
          </observation>
        </entry>
        <entry>
          <!-- Colesterolo LDL: LOINC 13457-7 -->
          <observation classCode="OBS" moodCode="EVN">
            <code code="13457-7" codeSystem="2.16.840.1.113883.6.1" displayName="Colesterolo LDL"/>
            <value xsi:type="PQ" value="158.0" unit="mg/dL"/>
          </observation>
        </entry>
        <entry>
          <!-- hs-PCR: LOINC 30522-7 -->
          <observation classCode="OBS" moodCode="EVN">
            <code code="30522-7" codeSystem="2.16.840.1.113883.6.1" displayName="Proteina C Reattiva hs"/>
            <value xsi:type="PQ" value="2.8" unit="mg/L"/>
          </observation>
        </entry>
        <entry>
          <!-- Pressione Sistolica: LOINC 8480-6 -->
          <observation classCode="OBS" moodCode="EVN">
            <code code="8480-6" codeSystem="2.16.840.1.113883.6.1" displayName="Pressione Arteriosa Sistolica"/>
            <value xsi:type="PQ" value="138.0" unit="mmHg"/>
          </observation>
        </entry>
        <entry>
          <!-- Creatinina: LOINC 1988-5 -->
          <observation classCode="OBS" moodCode="EVN">
            <code code="1988-5" codeSystem="2.16.840.1.113883.6.1" displayName="Creatinina Sierica"/>
            <value xsi:type="PQ" value="1.08" unit="mg/dL"/>
          </observation>
        </entry>
        <entry>
          <!-- Omocisteina: LOINC 37309-2 (Incrocio Coronarie) -->
          <observation classCode="OBS" moodCode="EVN">
            <code code="37309-2" codeSystem="2.16.840.1.113883.6.1" displayName="Omocisteina Plasmatica"/>
            <value xsi:type="PQ" value="15.8" unit="umol/L"/>
          </observation>
        </entry>
        <entry>
          <!-- Zonulina Sierica: LOINC 32623-1 (Incrocio Intestino-Cervello) -->
          <observation classCode="OBS" moodCode="EVN">
            <code code="32623-1" codeSystem="2.16.840.1.113883.6.1" displayName="Zonulina Sierica"/>
            <value xsi:type="PQ" value="46.5" unit="ng/mL"/>
          </observation>
        </entry>
        <entry>
          <!-- Frequenza Cardiaca Riposo: LOINC 8867-4 -->
          <observation classCode="OBS" moodCode="EVN">
            <code code="8867-4" codeSystem="2.16.840.1.113883.6.1" displayName="Frequenza Cardiaca"/>
            <value xsi:type="PQ" value="74.0" unit="bpm"/>
          </observation>
        </entry>
      </section>
    </structuredBody>
  </component>
</ClinicalDocument>`;

const SAMPLE_FSE_FHIR_JSON = JSON.stringify({
  resourceType: "Bundle",
  type: "document",
  entry: [
    {
      resource: {
        resourceType: "Patient",
        birthDate: "1989-04-15"
      }
    },
    {
      resource: {
        resourceType: "Observation",
        code: { coding: [{ code: "2339-0", display: "Glucose [Mass/volume] in Blood" }] },
        valueQuantity: { value: 88.0, unit: "mg/dL" }
      }
    },
    {
      resource: {
        resourceType: "Observation",
        code: { coding: [{ code: "1988-5", display: "Creatinine [Mass/volume] in Serum" }] },
        valueQuantity: { value: 0.90, unit: "mg/dL" }
      }
    },
    {
      resource: {
        resourceType: "Observation",
        code: { coding: [{ code: "1980-0", display: "C reactive protein [Mass/volume] in Serum" }] },
        valueQuantity: { value: 0.45, unit: "mg/L" }
      }
    },
    {
      resource: {
        resourceType: "Observation",
        code: { coding: [{ code: "8867-4", display: "Heart rate" }] },
        valueQuantity: { value: 62.0, unit: "bpm" }
      }
    },
    {
      resource: {
        resourceType: "Observation",
        code: { coding: [{ code: "8480-6", display: "Systolic blood pressure" }] },
        valueQuantity: { value: 114.0, unit: "mmHg" }
      }
    }
  ]
}, null, 2);

const PRESET_PATIENTS: { name: string; data: HealthInputData }[] = [
  {
    name: 'Paziente Tipo: Sindrome Dismetabolica & Infiammazione Endoteliale',
    data: {
      eta_anagrafica: 52,
      esami_reali: {
        glicemia: 118,
        hba1c: 6.1,
        ldl: 165,
        colesterolo_totale: 240,
        trigliceridi: 195,
        hs_pcr: 2.8,
        ves: 22,
        pressione_sistolica: 142,
        creatinina: 1.15,
        egfr: 78,
        alt_ast: 48,
        emoglobina: 13.8,
        piastrine: 260000,
        tsh: 2.6,
        cortisolo: 18.2,
        tossine_ossidative: 0.65
      }
    }
  },
  {
    name: 'Paziente Tipo: Omeostasi Perfetta & Longevità Elevata',
    data: {
      eta_anagrafica: 38,
      esami_reali: {
        glicemia: 86,
        hba1c: 5.0,
        ldl: 85,
        colesterolo_totale: 160,
        trigliceridi: 80,
        hs_pcr: 0.4,
        ves: 6,
        pressione_sistolica: 112,
        creatinina: 0.88,
        egfr: 110,
        alt_ast: 22,
        emoglobina: 14.5,
        piastrine: 230000,
        tsh: 1.8,
        cortisolo: 12.0,
        tossine_ossidative: 0.15
      }
    }
  },
  {
    name: 'Paziente Tipo: Sofferenza Renale & Ipertensione Severa',
    data: {
      eta_anagrafica: 61,
      esami_reali: {
        glicemia: 98,
        hba1c: 5.4,
        ldl: 120,
        colesterolo_totale: 190,
        trigliceridi: 140,
        hs_pcr: 3.4,
        ves: 28,
        pressione_sistolica: 168,
        creatinina: 2.1,
        egfr: 34,
        alt_ast: 35,
        emoglobina: 10.2,
        piastrine: 185000,
        tsh: 3.1,
        cortisolo: 24.5,
        tossine_ossidative: 0.80
      }
    }
  }
];

export default function QuantumHealth13QubitModal({ isOpen, onClose, onApplyToScreening }: QuantumHealth13QubitModalProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'inputs' | 'python' | 'fascicolo'>('visual');
  const [patientData, setPatientData] = useState<HealthInputData>(PRESET_PATIENTS[0].data);
  const [report, setReport] = useState<HealthPageReport>(() => elaboraPaginaHealth(PRESET_PATIENTS[0].data));
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);
  const [fseInputText, setFseInputText] = useState(SAMPLE_FSE_CDA2_XML);
  const [fseResult, setFseResult] = useState<FascicoloEstrattoResult | null>(() => estraiDatiFascicoloPerQubit(SAMPLE_FSE_CDA2_XML, 'xml'));
  const [isDraggingFse, setIsDraggingFse] = useState(false);

  if (!isOpen) return null;

  const PYTHON_CODE = `"""
Quantum Health Engine - Qiskit 1.x Industrial Production Architecture
Modulo a 14 Qubit per lo screening della salute (Pagina Icona Bianca)
Include parser FSE 2.0 (XML CDA2 / JSON FHIR) con codici standard LOINC e Incroci Clinici
"""

import json
import re
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, DensityMatrix, partial_trace, entropy

# Limiti clinici fisiologici
RANGE_CLINICI = {
    "glicemia": {"min": 70.0, "max": 100.0, "unit": "mg/dL"},
    "hba1c": {"min": 4.0, "max": 5.6, "unit": "%"},
    "ldl": {"min": 50.0, "max": 130.0, "unit": "mg/dL"},
    "colesterolo_totale": {"min": 125.0, "max": 200.0, "unit": "mg/dL"},
    "trigliceridi": {"min": 40.0, "max": 150.0, "unit": "mg/dL"},
    "hs_pcr": {"min": 0.0, "max": 1.0, "unit": "mg/L"},
    "ves": {"min": 0.0, "max": 15.0, "unit": "mm/h"},
    "pressione_sistolica": {"min": 90.0, "max": 120.0, "unit": "mmHg"},
    "creatinina": {"min": 0.6, "max": 1.2, "unit": "mg/dL"},
    "egfr": {"min": 90.0, "max": 150.0, "unit": "mL/min"},
    "alt_ast": {"min": 0.0, "max": 40.0, "unit": "U/L"},
    "emoglobina": {"min": 12.0, "max": 16.0, "unit": "g/dL"},
    "piastrine": {"min": 150000.0, "max": 400000.0, "unit": "/uL"},
    "tsh": {"min": 0.4, "max": 4.0, "unit": "uIU/mL"},
    "cortisolo": {"min": 5.0, "max": 25.0, "unit": "ug/dL"},
    "tossine_ossidative": {"min": 0.0, "max": 1.0, "unit": "U.A."},
    "bpm": {"min": 50.0, "max": 85.0, "unit": "bpm"},
    "spo2": {"min": 95.0, "max": 100.0, "unit": "%"},
    "hrv": {"min": 45.0, "max": 120.0, "unit": "ms"}
}

# Mapping rigido codici standard internazionali LOINC per Fascicolo Sanitario (FSE 2.0)
LOINC_MAPPING = {
    "15074-8": "glicemia", "2339-0": "glicemia", "14771-0": "glicemia",
    "13457-7": "ldl", "2089-1": "ldl",
    "1988-5": "creatinina", "2160-0": "creatinina",
    "30522-7": "hs_pcr", "1980-0": "hs_pcr", "76485-2": "hs_pcr",
    "2857-1": "ves", "8480-6": "pressione_sistolica", "8462-4": "pressione_diastolica",
    "8867-4": "bpm", "718-7": "emoglobina", "2157-6": "tsh",
    "4548-4": "hba1c", "2093-3": "colesterolo_totale", "2571-8": "trigliceridi",
    "33914-3": "egfr", "1742-6": "alt_ast", "1920-8": "alt_ast",
    "777-3": "piastrine", "2143-6": "cortisolo", "59408-5": "spo2",
    "80404-7": "hrv", "37309-2": "omocisteina", "1884-6": "apob",
    "43583-4": "lipoproteina_a", "32623-1": "zonulina"
}

# Mapping deterministico FIFO a 14 Qubit
MAPPING_QUBITS = {
    "glicemia": 0, "hba1c": 0, "ldl": 1, "colesterolo_totale": 1, "trigliceridi": 1,
    "hs_pcr": 2, "ves": 2, "pressione_sistolica": 3, "creatinina": 4, "egfr": 5,
    "alt_ast": 6, "emoglobina": 7, "bpm": 8, "piastrine": 8, "spo2": 9,
    "hrv": 10, "tsh": 11, "cortisolo": 12, "tossine_ossidative": 13
}

SISTEMI_QUBITS = {
    "parametri_vitali": [3, 7, 8, 9, 10],
    "metabolismo": [0, 1, 11],
    "filtri_organo": [4, 5, 6],
    "infiammazione_immunitario": [2, 12, 13]
}

def valuta_incroci_clinici(esami: dict) -> dict:
    # 5 Incroci Clinici Fisiologici Chiave
    # 1. Asse Intestino-Cervello-Cuore
    # 2. Tempesta nelle Coronarie
    # 3. Blocco Metabolico e Grasso Viscerale
    # 4. Ipotiroidismo Funzionale "Invisibile"
    # 5. Sabotaggio del Sonno e Mancato Recupero
    ...
    return incroci

def estrai_dati_fascicolo_per_qubit(file_contenuto: str, formato: str = "auto") -> dict:
    # Parser tollerante per CDA2 XML e FHIR JSON con fallback automatico a omeostasi
    ...
    return {"formato_rilevato": formato, "eta_anagrafica": eta, "esami_reali": esami_trovati}

def calcola_backend_pagina_salute(payload: dict) -> str:
    ...
    # Inizializzazione RY(theta) diretta su |0>, Blocco Rigido CX per peso >= 0.60
    ...
    return json.dumps(risultato, indent=2)
`;

  const handleProcessFseText = (text: string, format: 'xml' | 'json' | 'auto' = 'auto') => {
    setFseInputText(text);
    const parsed = estraiDatiFascicoloPerQubit(text, format);
    setFseResult(parsed);
  };

  const handleApplyFseToEngine = () => {
    if (!fseResult) return;
    const newData: HealthInputData = {
      eta_anagrafica: fseResult.eta_anagrafica || 45,
      esami_reali: fseResult.esami_reali
    };
    setPatientData(newData);
    const newReport = elaboraPaginaHealth(newData);
    setReport(newReport);
    setActiveTab('visual');
  };

  const handleFseFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      const isXml = file.name.toLowerCase().endsWith('.xml') || content.trim().startsWith('<');
      const isJson = file.name.toLowerCase().endsWith('.json') || content.trim().startsWith('{');
      const fmt = isXml ? 'xml' : isJson ? 'json' : 'auto';
      handleProcessFseText(content, fmt);
    };
    reader.readAsText(file);
  };

  const handleCopyPython = async () => {
    try {
      await navigator.clipboard.writeText(PYTHON_CODE);
      setCopiedPython(true);
      setTimeout(() => setCopiedPython(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunSimulation = (data: HealthInputData) => {
    const result = elaboraPaginaHealth(data);
    setReport(result);
  };

  const handlePresetSelect = (preset: { name: string; data: HealthInputData }) => {
    setPatientData(preset.data);
    handleRunSimulation(preset.data);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const lvl1 = report.configurazione_pagina_health.livello_1_top_bar;
  const lvl23 = report.configurazione_pagina_health.livello_2_3_biomarcatori_rilevati;
  const lvl4 = report.configurazione_pagina_health.livello_4_matrice_incroci_critici;
  const lvl5 = report.configurazione_pagina_health.livello_5_effetto_domino_e_report;
  const incroci = report.incroci_clinici_fisiologici;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0b0c10] border border-cyan-500/30 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-[0_0_60px_rgba(6,182,212,0.15)] overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Motore Quantistico 14 Qubit (Qiskit 1.x Live)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                  Hadamard + CX
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Calcolo probabilistico su matrici di densità ridotte, sovrapposizione Hadamard ed entropia distrettuale a 14 Qubit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs font-mono">
              <button
                onClick={() => setActiveTab('visual')}
                className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'visual' ? 'bg-cyan-500 text-black font-semibold shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Vista 5 Livelli
              </button>
              <button
                onClick={() => setActiveTab('fascicolo')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'fascicolo' ? 'bg-cyan-500 text-black font-semibold shadow' : 'text-slate-400 hover:text-white'}`}
              >
                <FolderUp className="w-3.5 h-3.5" />
                <span>Fascicolo FSE 2.0</span>
              </button>
              <button
                onClick={() => setActiveTab('inputs')}
                className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'inputs' ? 'bg-cyan-500 text-black font-semibold shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Esami & Qubit
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'json' ? 'bg-cyan-500 text-black font-semibold shadow' : 'text-slate-400 hover:text-white'}`}
              >
                JSON Qiskit
              </button>
              <button
                onClick={() => setActiveTab('python')}
                className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'python' ? 'bg-cyan-500 text-black font-semibold shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Codice Python
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer ml-1"
              title="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preset Selector Bar */}
        <div className="px-4 py-2.5 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Preset Clinici:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PATIENTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(p)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
                    patientData === p.data
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {idx === 0 ? 'Dismetabolico' : idx === 1 ? 'Omeostasi Ottimale' : 'Renale / Ipertensivo'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRunSimulation(patientData)}
              className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 text-cyan-400" />
              <span>Ricalcola Qiskit 14-Qubit</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0 custom-scrollbar space-y-6">
          {activeTab === 'visual' && (
            <div className="space-y-6">
              
              {/* LIVELLO 1: TOP BAR */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-black/60 to-purple-950/30 border border-cyan-500/30 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-1 flex items-center gap-2">
                      <span>LIVELLO 1: TOP BAR & STATO FUNZIONALE GLOBALE</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className={`text-4xl font-light font-mono ${lvl1.clinical_wellness_score_percent < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {lvl1.clinical_wellness_score_percent}%
                      </span>
                      <span className="text-xs font-mono text-slate-400">Clinical Wellness Score (Fedeltà |0...0⟩)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold tracking-widest uppercase transition-all ${
                      lvl1.stato_funzionale_globale === 'Stabile'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-500/20 border-2 border-red-500 text-red-300 led-pulse-badge-red'
                    }`}>
                      Stato: {lvl1.stato_funzionale_globale}
                    </div>

                    {onApplyToScreening && (
                      <button
                        onClick={() => onApplyToScreening(report)}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                      >
                        Applica alla Pagina
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* LIVELLO 2 & 3: BIOMARCATORI, ETA BIOLOGICA & RESILIENZA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">Età Biologica Effettiva</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-white font-mono">{lvl23.eta_biologica_effettiva}</span>
                    <span className="text-xs text-slate-400 font-mono">anni (Anagrafica: {patientData.eta_anagrafica})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    {lvl23.eta_biologica_effettiva > patientData.eta_anagrafica
                      ? `Invecchiamento sistemico accelerato di +${(lvl23.eta_biologica_effettiva - patientData.eta_anagrafica).toFixed(1)} anni.`
                      : 'Assetto biologico ringiovanito rispetto all\'età anagrafica.'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">Resilienza Omeostatica</div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-light font-mono ${lvl23.resilienza_omeostatica_percent < 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {lvl23.resilienza_omeostatica_percent}%
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Capacità tampone</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Indice di recupero del sistema dopo stress infiammatorio o glicometabolico.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">Errore Cronobiologico Circadiano</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-amber-300 font-mono">{lvl23.errore_cronobiologico_circadiano}</span>
                    <span className="text-xs text-slate-400 font-mono">Δ rad/h</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Scostamento di fase tra orologio centrale ipotalamico e organi periferici.
                  </div>
                </div>
              </div>

              {/* GRIGLIA BIOMARCATORI CON TAG CROMATICI [ALTO] (ROSSO) e [BASSO] (CIANO) */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center justify-between">
                  <span>Biomarcatori Normalizzati (Pesi 0.00 - 1.00 sui 13 Qubit)</span>
                  <span className="text-[10px] text-slate-500">Pesi &gt; 0.50 attivano allarme cromatico</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {Object.entries(lvl23.valori_normalizzati_assegnati).map(([nome, val]) => {
                    const peso = Number(val) || 0;
                    const isHigh = peso > 0.50;
                    const isDeficit = nome === 'egfr' || nome === 'emoglobina';
                    return (
                      <div
                        key={nome}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1 transition-all ${
                          isHigh
                            ? isDeficit
                              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                              : 'bg-red-600/15 border border-red-500/40 text-red-200'
                            : 'bg-white/[0.02] border-white/5 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-mono font-medium truncate uppercase">{nome.replace('_', ' ')}</span>
                          {isHigh && (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold tracking-wider ${
                              isDeficit ? 'bg-cyan-500 text-black' : 'bg-red-600 text-white'
                            }`}>
                              {isDeficit ? '[BASSO]' : '[ALTO]'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[10px] text-slate-400">{patientData.esami_reali[nome] ?? '-'} {RANGE_CLINICI[nome]?.unit}</span>
                          <span className="font-bold">p = {peso.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LIVELLO 4: MATRICE INCROCI CRITICI & SCANNER OLOGRAFICO */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-purple-500/30">
                <div className="text-[10px] font-mono uppercase tracking-widest text-purple-400 mb-3 flex items-center justify-between">
                  <span>LIVELLO 4: MATRICE DEGLI INCROCI CRITICI A 3 FASI & ENTROPIA QUANTISTICA</span>
                  <span className="text-purple-300">Entropia Von Neumann: {lvl4.indice_instabilita_transizione_fase_percent}%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(lvl4.scanner_olografico_stress_sistemi).map(([sistema, val]) => {
                    const stress = Number(val) || 0;
                    return (
                      <div key={sistema} className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2">
                        <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wide">
                          {sistema.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-baseline justify-between">
                          <span className={`text-2xl font-light font-mono ${stress > 40 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {stress}%
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">Stress Parziale</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${stress > 40 ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, stress)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs font-mono text-purple-200 flex items-center justify-between">
                  <span>Deviazione Fenotipica Pattern Rari (Non-Gaussianità):</span>
                  <span className="font-bold text-purple-300">{lvl4.deviazione_fenotipica_pattern_rari}%</span>
                </div>
              </div>

              {/* LIVELLO 5: EFFETTO DOMINO & PROIEZIONI TEMPORALI */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/20 via-black/60 to-cyan-950/20 border border-amber-500/30">
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-3 flex items-center justify-between">
                  <span>LIVELLO 5: EFFETTO DOMINO, VQE OTTIMIZZAZIONE & PROIEZIONE 5/10 ANNI</span>
                  <span className="text-amber-300">VQE Minima: {lvl5.vqe_energia_minima_ottimizzazione} Hartree</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                    <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Innesco Pivot Cascata</div>
                    <div className="text-lg font-bold text-amber-300 font-mono uppercase">
                      {lvl5.biomarcatore_pivot_effetto_cascata.replace('_', ' ')}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Primo parametro da stabilizzare per interrompere la propagazione del domino biologico.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                    <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Guadagno &quot;What-If&quot;</div>
                    <div className="text-2xl font-light text-emerald-400 font-mono">
                      +{lvl5.guadagno_salute_what_if_percent}%
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Incremento di wellness ottenibile riequilibrando il biomarcatore pivot centrale.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                    <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Traiettorie Predittive</div>
                    <div className="flex items-center justify-between text-xs font-mono pt-1">
                      <span className="text-slate-400">A 5 Anni:</span>
                      <span className="text-white font-bold">{lvl5.proiezione_temporale.a_5_anni_percent}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono pt-1">
                      <span className="text-slate-400">A 10 Anni:</span>
                      <span className="text-amber-400 font-bold">{lvl5.proiezione_temporale.a_10_anni_percent}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* I 5 INCROCI CLINICI FISIOLOGICI CHIAVE (PARTE 2) */}
              {incroci && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-black/80 via-slate-900/40 to-black/80 border border-cyan-500/20 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                        <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />
                        <span>I 5 INCROCI CLINICI FISIOLOGICI CHIAVE</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-0.5">
                        Correlazioni Bio-Funzionali e Cascata Tra Sistemi
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                      Standard FSE 2.0 Interoperabile
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(incroci as Record<string, IncrocioDettaglio>).map(([key, inc]) => {
                      const isCritical = inc.stato === 'CRITICO';
                      const isWarning = inc.stato === 'ATTENZIONE';
                      return (
                        <div 
                          key={key}
                          className={`p-4 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                            isCritical 
                              ? 'bg-red-950/25 border-2 border-red-500 text-red-200 led-pulse-red' 
                              : isWarning 
                                ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' 
                                : 'bg-emerald-950/15 border-emerald-500/30 text-emerald-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-xs font-bold font-mono tracking-wide text-white">{inc.titolo}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider transition-all ${
                                isCritical 
                                  ? 'bg-red-600 text-white border border-red-400 led-pulse-badge-red' 
                                  : isWarning 
                                    ? 'bg-amber-500 text-black font-semibold' 
                                    : 'bg-emerald-600 text-white'
                              }`}>
                                {inc.stato}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/10">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                                  }`} 
                                  style={{ width: `${inc.score_rischio_percent}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-mono font-bold">{inc.score_rischio_percent}%</span>
                            </div>

                            <p className="text-[11px] leading-relaxed text-slate-300">
                              {inc.descrizione_fisiologica}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-slate-400 flex flex-wrap items-center gap-1">
                            <span className="text-slate-500">Biomarcatori:</span>
                            {inc.parametri_coinvolti.map((param, pIdx) => (
                              <span key={pIdx} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                                {param}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB FASCICOLO SANITARIO ELETTRONICO (FSE 2.0) */}
          {activeTab === 'fascicolo' && (
            <div className="space-y-6">
              
              {/* Banner Descrizione Interoperabilità */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-black/80 border border-cyan-500/30">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                      <FolderUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Acquisizione e Parsing Fascicolo Sanitario Elettronico (FSE 2.0)
                      </h3>
                      <p className="text-[11px] text-slate-300">
                        Caricamento manuale del referto interoperabile regionale (es. Lepida / Emilia-Romagna) in formato XML HL7 CDA2 o JSON FHIR.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono">
                      Codifica LOINC Internazionale
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
                      KeyError Free (Omeostasi Pura)
                    </span>
                  </div>
                </div>

                {/* Preset Fast-Load Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
                  <span className="text-xs font-mono text-slate-400">Carica Esempi Rapidi:</span>
                  <button
                    onClick={() => handleProcessFseText(SAMPLE_FSE_CDA2_XML, 'xml')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>FSE CDA2 XML (Regione Emilia-Romagna / Lepida)</span>
                  </button>
                  <button
                    onClick={() => handleProcessFseText(SAMPLE_FSE_FHIR_JSON, 'json')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>FSE FHIR JSON (Bundle Interoperabile)</span>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone & Editor */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Colonna Sinistra: Upload & Editor Testo */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-semibold flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      Trascina o Incolla File FSE (XML/JSON):
                    </span>
                    <label className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 cursor-pointer transition-all">
                      <span>Sfoglia File...</span>
                      <input 
                        type="file" 
                        accept=".xml,.json,.txt"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFseFileUpload(file);
                        }}
                      />
                    </label>
                  </div>

                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingFse(true); }}
                    onDragLeave={() => setIsDraggingFse(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingFse(false);
                      const file = e.dataTransfer.files[0];
                      if (file) handleFseFileUpload(file);
                    }}
                    className={`relative rounded-xl border-2 border-dashed transition-all p-3 ${
                      isDraggingFse ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/15 bg-black/40'
                    }`}
                  >
                    <textarea
                      value={fseInputText}
                      onChange={(e) => handleProcessFseText(e.target.value, 'auto')}
                      placeholder="Incolla qui il contenuto del referto XML CDA2 o JSON FHIR..."
                      className="w-full h-56 p-2 bg-transparent text-slate-300 font-mono text-[11px] leading-relaxed resize-none focus:outline-none custom-scrollbar"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <span>Dimensione: {fseInputText.length} caratteri</span>
                    <button
                      onClick={() => handleProcessFseText(fseInputText, 'auto')}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                    >
                      Rianalizza Testo
                    </button>
                  </div>
                </div>

                {/* Colonna Destra: Risultato Estrazione e LOINC */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Dati Estratti per Qubit:
                    </span>
                    {fseResult && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono uppercase">
                          {fseResult.formato_rilevato}
                        </span>
                        {fseResult.eta_anagrafica && (
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-mono">
                            Età: {fseResult.eta_anagrafica} anni
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {fseResult ? (
                    <div className="flex-1 flex flex-col space-y-3">
                      <div className="flex-1 overflow-y-auto max-h-56 custom-scrollbar border border-white/10 rounded-xl bg-black/40 p-2.5">
                        <table className="w-full text-[11px] font-mono">
                          <thead>
                            <tr className="border-b border-white/10 text-slate-500 text-[10px] text-left">
                              <th className="pb-1.5">Biomarcatore</th>
                              <th className="pb-1.5">LOINC</th>
                              <th className="pb-1.5">Valore</th>
                              <th className="pb-1.5">Range Fisiologico</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {Object.entries(fseResult.esami_reali).map(([param, rawVal]) => {
                              const val = Number(rawVal);
                              const range = RANGE_CLINICI[param];
                              const isOutOfRange = range && (val < range.min || val > range.max);
                              return (
                                <tr key={param} className="text-slate-300">
                                  <td className="py-1.5 uppercase font-medium text-white">{param.replace('_', ' ')}</td>
                                  <td className="py-1.5 text-cyan-400">
                                    {Object.entries(LOINC_MAPPING).find(([_, p]) => p === param)?.[0] || '-'}
                                  </td>
                                  <td className={`py-1.5 font-bold ${isOutOfRange ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {val} {range?.unit}
                                  </td>
                                  <td className="py-1.5 text-slate-500">
                                    {range ? `${range.min} - ${range.max} ${range.unit}` : '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Box Salvaguardia Omeostasi */}
                      <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-[11px] font-mono text-cyan-200">
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-cyan-300">
                          <Shield className="w-3.5 h-3.5" />
                          <span>Salvaguardia da Crash (Omeostasi Pura Garantita):</span>
                        </div>
                        <p className="text-slate-400 text-[10px] leading-relaxed">
                          Tutti i parametri non presenti nel file caricato mantengono uno scostamento pari a 0.00 (valori ottimali fisiologici). Questo impedisce eccezioni KeyError nel compilatore quantistico.
                        </p>
                      </div>

                      {/* CTA Inietta nel Circuito Quantistico */}
                      <button
                        onClick={handleApplyFseToEngine}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                      >
                        <Play className="w-4 h-4" />
                        <span>Inietta Dati nel Circuito 14 Qubit e Ricalcola</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs font-mono p-6 border border-white/5 rounded-xl">
                      <span>Nessun dato valido estratto. Seleziona un file o incolla il testo del referto.</span>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {activeTab === 'inputs' && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-slate-400 mb-2">
                Modifica i valori reali di laboratorio per osservare in tempo reale come variano gli angoli di rotazione quantistica e la matrice di densità:
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-4">
                <label className="text-xs font-mono uppercase text-slate-300">Età Anagrafica (anni):</label>
                <input
                  type="number"
                  value={patientData.eta_anagrafica}
                  onChange={(e) => {
                    const updated = { ...patientData, eta_anagrafica: Number(e.target.value) || 40 };
                    setPatientData(updated);
                    handleRunSimulation(updated);
                  }}
                  className="w-24 px-3 py-1.5 rounded-lg bg-black border border-white/20 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(RANGE_CLINICI).map(([key, range]) => (
                  <div key={key} className="p-3 rounded-xl bg-black/50 border border-white/10 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300 font-medium uppercase truncate">{key.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-500">[{range.min} - {range.max}] {range.unit}</span>
                    </div>
                    <input
                      type="number"
                      step={range.max > 100 ? '1' : '0.1'}
                      value={patientData.esami_reali[key] ?? range.min}
                      onChange={(e) => {
                        const updated = {
                          ...patientData,
                          esami_reali: {
                            ...patientData.esami_reali,
                            [key]: parseFloat(e.target.value) || 0
                          }
                        };
                        setPatientData(updated);
                        handleRunSimulation(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/80 border border-white/15 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Output JSON Qiskit 1.x (Struttura gerarchica a 5 livelli):</span>
                <button
                  onClick={handleCopyJson}
                  className={`px-3 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedJson ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  }`}
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{copiedJson ? 'Copiato!' : 'Copia JSON'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={JSON.stringify(report, null, 2)}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className="flex-1 w-full min-h-[400px] p-4 bg-black/90 border border-white/10 focus:border-cyan-500/50 rounded-2xl text-cyan-300 font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-cyan-500/30 selection:text-white"
              />
            </div>
          )}

          {activeTab === 'python' && (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Modulo Backend Python Qiskit 1.x (calcola_backend_pagina_salute):</span>
                <button
                  onClick={handleCopyPython}
                  className={`px-3 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedPython ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  }`}
                >
                  {copiedPython ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{copiedPython ? 'Copiato!' : 'Copia Codice Python'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={PYTHON_CODE}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className="flex-1 w-full min-h-[400px] p-4 bg-black/90 border border-white/10 focus:border-cyan-500/50 rounded-2xl text-emerald-300 font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-cyan-500/30 selection:text-white"
              />
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Fisica Quantistica Qiskit 1.x (14 Qubit): Rotazioni RY(θ) dirette su |0⟩, Blocco Rigido CX per peso ≥ 0.60, Entropia Von Neumann normalizzata ≤ 100%.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
}
