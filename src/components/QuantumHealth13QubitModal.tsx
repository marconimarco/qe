import React, { useState } from 'react';
import { X, Cpu, Copy, Check, Play, RefreshCw, Zap, Activity, Heart, ShieldAlert, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { elaboraPaginaHealth, HealthInputData, HealthPageReport, RANGE_CLINICI } from '../lib/quantumHealthEngine';

interface QuantumHealth13QubitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToScreening?: (report: HealthPageReport) => void;
}

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
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'inputs'>('visual');
  const [patientData, setPatientData] = useState<HealthInputData>(PRESET_PATIENTS[0].data);
  const [report, setReport] = useState<HealthPageReport>(() => elaboraPaginaHealth(PRESET_PATIENTS[0].data));
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

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
              <span>Ricalcola Qiskit 13-Qubit</span>
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
                    <div className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold tracking-widest uppercase ${
                      lvl1.stato_funzionale_globale === 'Stabile'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/40 text-red-300 animate-pulse'
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
                              : 'bg-red-600/15 border-red-500/40 text-red-200'
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
        </div>

        {/* Footer Disclaimer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Computazione probabilistica su matrice densità (ZZFeatureMap, 13 Qubit). Solo per soggetti adulti.</span>
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
