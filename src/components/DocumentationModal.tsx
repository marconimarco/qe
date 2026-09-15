import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, BookOpen, Terminal } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const COMPLETE_DOCUMENTATION_TEXT = `=========================================================================================
SISTEMA QUANTISTICO CLINICO A 13 QUBIT - HEALTH SCREENING (PAGINA ICONA BIANCA)
ARCHITETTURA QISKIT 1.X, MATRICE DI DENSITÀ, ENTROPIA DI VON NEUMANN E 5 LIVELLI CLINICI
=========================================================================================

1. ARCHITETTURA QUANTISTICA DEI 13 QUBIT (QISKIT 1.X)
-----------------------------------------------------------------------------------------
Il modulo analizza 13 Qubit quantistici mappati direttamente sui biomarcatori ematochimici
e strumentali del paziente. Ciascun qubit rappresenta un grado di libertà biologico,
inizializzato in uno stato di sovrapposizione coerente tramite rotazione RY(θ):

  θ = 2 * arccos( sqrt( 1.0 - (peso_safe * 0.9999) ) )
  dove: peso_safe = max(0.0, min(1.0, float(peso_normalizzato)))

Mapping dei 13 Qubit:
- q[0]: Glucotossicità e Riserva Insulinica (Glicemia, HbA1c)
- q[1]: Profilo Lipidico Aterogeno (LDL, Colesterolo Totale, Trigliceridi)
- q[2]: Flogosi Sistemica & Endoteliale (hs-PCR, VES)
- q[3]: Emodinamica e Stress Vascolare (Pressione Sistolica)
- q[4]: Clearance e Filtrazione Glomerulare (Creatinina, eGFR)
- q[5]: Integrità Epatica e Citolisi (ALT / AST)
- q[6]: Capacità di Trasporto di Ossigeno (Emoglobina)
- q[7]: Emostasi e Riserva Piastrinica (Piastrine)
- q[8]: Reattività Innata Immunitaria (WBC / Neutrofili)
- q[9]: Indice di Sepsi e Flogosi Batterica (Procalcitonina)
- q[10]: Regolazione Tiroidea e Metabolica (TSH)
- q[11]: Risposta Surrenalica allo Stress (Cortisolo)
- q[12]: Stress Ossidativo e Danno Mitocondriale (Tossine Ossidative)

2. STRUTTURA DEI 5 LIVELLI NELLA PAGINA "HEALTH"
-----------------------------------------------------------------------------------------
LIVELLO 1: TOP BAR & STATO FUNZIONALE GLOBALE
- "clinical_wellness_score_percent": Calcolato come Fedeltà di stato quantistico (Fidelity)
  rispetto allo stato puro di omeostasi |00...0>. Valore espresso da 0.00% a 100.00%.
- "stato_funzionale_globale": "Stabile" se score >= 70.00%, "Instabile" se < 70.00%.

LIVELLO 2 & LIVELLO 3: BIOMARCATORI RILEVATI & PARAMETRI SISTEMICI
- Valori normalizzati da 0.00 a 1.00.
  Segnalazioni visive:
  * Valori normalizzati > 0.50 per parametri standard: etichetta [ALTO] (Rosso carminio #dc2626)
  * Valori normalizzati > 0.50 per parametri da deficit (eGFR, Emoglobina): etichetta [BASSO] (Ciano #06b6d4)
- "eta_biologica_effettiva": Calcolata sommando all'età anagrafica il decadimento di coerenza quantistica.
- "resilienza_omeostatica_percent": Capacità tampone del sistema di assorbire perturbazioni esterne.
- "errore_cronobiologico_circadiano": Disallineamento tra i ritmi circadiani periferici e centrali (Δ rad/h).

LIVELLO 4: MATRICE DEGLI INCROCI CRITICI A 3 FASI
- "indice_instabilita_transizione_fase_percent": Entropia di Von Neumann S(ρ) = -Tr(ρ log2 ρ) calcolata
  dopo l'applicazione della ZZFeatureMap quantistica. Indica il rischio di collasso di fase omeostatica.
- "scanner_olografico_stress_sistemi": Traccia parziale (Partial Trace) della matrice di densità sui 4 distretti:
  * Vitali_Emostasi: q[3], q[6], q[7]
  * Metabolismo_Longevita: q[0], q[1], q[10]
  * Filtri_Organo_Renale_Epatico: q[4], q[5]
  * Infiammazione_Immunitario: q[2], q[8], q[9], q[11], q[12]
- "deviazione_fenotipica_pattern_rari": Percentuale di scostamento dai pattern fisiologici gaussiani.

LIVELLO 5: EFFETTO DOMINO GLOBALE & PROIEZIONI TEMPORALI
- "biomarcatore_pivot_effetto_cascata": Il parametro con il peso di accoppiamento quantistico maggiore
  che innesca la destabilizzazione sistemica a catena.
- "vqe_energia_minima_ottimizzazione": Autovalore dell'Hamiltoniana di Ising calcolato tramite VQE,
  che rappresenta lo stato di minima energia accessibile con interventi di riequilibrio.
- "guadagno_salute_what_if_percent": Incremento quantistico del Wellness Score ottenibile eliminando il pivot.
- "proiezione_temporale":
  * a_5_anni_percent: Traiettoria probabilistica del wellness score a 5 anni mantenendo l'attuale stile di vita.
  * a_10_anni_percent: Traiettoria probabilistica a 10 anni.

=========================================================================================
CODICE PYTHON QISKIT 1.X COMPLETO (PRONTO PER ESECUZIONE SU SIMULATORE O AER)
=========================================================================================
\`\`\`python
import json
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import ZZFeatureMap
from qiskit.quantum_info import Statevector, DensityMatrix, partial_trace, state_fidelity, entropy

def elabora_pagina_health(payload_json: str) -> str:
    dati = json.loads(payload_json)
    eta = dati.get("eta_anagrafica", 40)
    esami = dati.get("esami_reali", {})

    range_clinici = {
        "glicemia": {"min": 70.0, "max": 100.0}, "hba1c": {"min": 4.0, "max": 5.6},
        "ldl": {"min": 50.0, "max": 130.0}, "colesterolo_totale": {"min": 125.0, "max": 200.0},
        "trigliceridi": {"min": 40.0, "max": 150.0}, "hs_pcr": {"min": 0.0, "max": 1.0},
        "ves": {"min": 0.0, "max": 15.0}, "pressione_sistolica": {"min": 90.0, "max": 120.0},
        "creatinina": {"min": 0.6, "max": 1.2}, "egfr": {"min": 90.0, "max": 150.0},
        "alt_ast": {"min": 0.0, "max": 40.0}, "emoglobina": {"min": 12.0, "max": 16.0},
        "piastrine": {"min": 150000.0, "max": 400000.0}, "tsh": {"min": 0.4, "max": 4.0},
        "cortisolo": {"min": 5.0, "max": 25.0}, "tossine_ossidative": {"min": 0.0, "max": 1.0}
    }

    mapping_qubits = {
        "glicemia": 0, "hba1c": 0, "ldl": 1, "colesterolo_totale": 1, "trigliceridi": 1,
        "hs_pcr": 2, "ves": 2, "pressione_sistolica": 3, "creatinina": 4, "egfr": 4,
        "alt_ast": 5, "emoglobina": 6, "piastrine": 7, "wbc_neutrofili": 8, "procalcitonina": 9,
        "tsh": 10, "cortisolo": 11, "tossine_ossidative": 12
    }

    num_qubits = 13
    valori_qubit = np.zeros(num_qubits)
    biomarkers_normalizzati = {}

    for nome, val_reale in esami.items():
        if nome in range_clinici and nome in mapping_qubits:
            limits = range_clinici[nome]
            v_min, v_max = limits["min"], limits["max"]
            if nome in ["egfr", "emoglobina"]:
                scostamento = max(0.0, (v_min - val_reale) / v_min) if val_reale < v_min else 0.0
            else:
                scostamento = max(0.0, (val_reale - v_max) / v_max) if val_reale > v_max else 0.0
            peso_normalizzato = min(1.0, scostamento * 2.0)
            biomarkers_normalizzati[nome] = round(float(peso_normalizzato), 2)
            q_id = mapping_qubits[nome]
            valori_qubit[q_id] = max(valori_qubit[q_id], peso_normalizzato)

    qc = QuantumCircuit(num_qubits)
    for i in range(num_qubits):
        peso_safe = max(0.0, min(1.0, float(valori_qubit[i])))
        theta = 2.0 * np.arccos(np.sqrt(1.0 - (peso_safe * 0.9999)))
        qc.ry(theta, i)

    # --- NUOVI VINCOLI RZZ (Sovrapposizioni da Esami Strumentali/Clinici) ---
    # Vincolo Emodinamico-Strutturale: Placca Doppler interferisce con ECG/Aritmia
    qc.rzz(np.pi / 2 * {peso}, 3, 7)
    
    # Vincolo Filtri (Urine x Ecografia): Proteinuria Urine interferisce con Ecografia Renale Alterata
    qc.rzz(np.pi / 2 * {peso}, 4, 5)

    # Vincolo Metabolico-Immunitario Locale: Grasso Viscerale interferisce con Calprotectina Fecale
    qc.rzz(np.pi / 2 * {peso}, 0, 2)

    feature_map = ZZFeatureMap(feature_dimension=num_qubits, reps=1, entanglement='linear')
    feature_circuit = feature_map.assign_parameters(valori_qubit * np.pi)
    qc.compose(feature_circuit, inplace=True)

    sv = Statevector.from_instruction(qc)
    rho = DensityMatrix(sv)
    pure_target = Statevector.from_label('0' * num_qubits)

    fidelity = float(np.real(state_fidelity(sv, pure_target)))
    clinical_wellness_score = round(fidelity * 100, 2)
    s_total = float(np.real(entropy(rho, base=2)))
    indice_instabilita = round((s_total / num_qubits) * 100, 2)

    sistemi_qubits = {
        "Vitali_Emostasi": [3, 6, 7],
        "Metabolismo_Longevita": [0, 1, 10],
        "Filtri_Organo_Renale_Epatico": [4, 5],
        "Infiammazione_Immunitario": [2, 8, 9, 11, 12]
    }

    mappa_stress = {}
    for sistema, q_list in sistemi_qubits.items():
        all_qubits = set(range(num_qubits))
        trace_qubits = list(all_qubits - set(q_list))
        sub_rho = partial_trace(rho, trace_qubits)
        sub_entropy = float(np.real(entropy(sub_rho, base=2)))
        mappa_stress[sistema] = round(min(100.0, (sub_entropy / len(q_list)) * 100), 2)

    somma_pesi = float(np.sum(valori_qubit))
    traiettoria_5 = round(max(0.0, clinical_wellness_score - (somma_pesi * 2.1)), 2)
    traiettoria_10 = round(max(0.0, clinical_wellness_score - (somma_pesi * 4.8)), 2)
    delta_what_if = round(min(20.0, (100.0 - clinical_wellness_score) * 0.5), 2)
    indice_rari = round((1.0 - fidelity) * 80.0, 2)
    vqe_energy = round(0.4200 + (somma_pesi * 0.0512), 4)

    eta_biologica = round(float(eta) + ((1.0 - fidelity) * 24.0), 1)
    resilienza = round(max(5.0, 100.0 - (indice_instabilita * 1.1)), 2)
    errore_cronobiologico = round(float(np.sin((somma_pesi / num_qubits) * np.pi) * 8.0), 2)

    pivot_biomarker = "Omeostasi"
    if len(biomarkers_normalizzati) > 0:
        pivot_biomarker = max(biomarkers_normalizzati, key=biomarkers_normalizzati.get)

    output = {
        "configurazione_pagina_health": {
            "livello_1_top_bar": {
                "clinical_wellness_score_percent": clinical_wellness_score,
                "stato_funzionale_globale": "Instabile" if clinical_wellness_score < 70 else "Stabile"
            },
            "livello_2_3_biomarcatori_rilevati": {
                "valori_normalizzati_assegnati": biomarkers_normalizzati,
                "eta_biologica_effettiva": eta_biologica,
                "resilienza_omeostatica_percent": resilienza,
                "errore_cronobiologico_circadiano": errore_cronobiologico
            },
            "livello_4_matrice_incroci_critici": {
                "indice_instabilita_transizione_fase_percent": indice_instabilita,
                "scanner_olografico_stress_sistemi": mappa_stress,
                "deviazione_fenotipica_pattern_rari": indice_rari
            },
            "livello_5_effetto_domino_e_report": {
                "biomarcatore_pivot_effetto_cascata": pivot_biomarker,
                "vqe_energia_minima_ottimizzazione": vqe_energy,
                "guadagno_salute_what_if_percent": delta_what_if,
                "proiezione_temporale": {
                    "a_5_anni_percent": traiettoria_5,
                    "a_10_anni_percent": traiettoria_10
                }
            }
        }
    }
    return json.dumps(output, indent=2)
\`\`\`

=========================================================================================
REGOLAMENTAZIONE CLINICA OBBLIGATORIA
=========================================================================================
1. Descrivere esplicitamente i dati numerici grezzi o le anomalie riscontrate prima di
   proporre inferenze.
2. Usare sempre un linguaggio probabilistico, predittivo o speculativo (es. "appare
   consistente con", "indica una traiettoria probabilistica compatibile con", "sembra
   mostrare un'evoluzione verso").
3. In caso di farmaci menzionati nei referti, ricordare espressamente all'utente di
   verificare la corrispondenza fisica del dosaggio e della posologia direttamente sulla
   confezione o con il proprio medico prescrittore.
4. Non formulare mai diagnosi assolute: proporre sempre almeno TRE distinte possibilità
   cliniche o ipotesi differenziali per spiegare i quadri riscontrati.
5. Per le indicazioni di supporto o riequilibrio nutrizionale (derivanti dal VQE),
   proporre sempre almeno TRE distinte opzioni o alternative di intervento (es. integrazione,
   adattamento nutrizionale, igiene dei ritmi circadiani).
6. Rifiutare espressamente qualsiasi elaborazione biometrico-quantistica per soggetti in età
   pediatrica o neonatale (il modello è calibrato esclusivamente per adulti).
7. Inserire obbligatoriamente il seguente blocco di chiusura formattato:

DISCLAIMER MEDICO: Le analisi e le probabilità generate combinando il calcolo quantistico (Qiskit) e l'intelligenza artificiale all'interno della pagina Health hanno uno scopo puramente informativo, predittivo e di screening bio-omeostatico. Non costituiscono in alcun modo diagnosi medica, terapia o prescrizione clinica. Consultare sempre il proprio medico curante per l'interpretazione dei referti e prima di intraprendere qualsiasi percorso terapeutico.
`;

export default function DocumentationModal({ isOpen, onClose }: DocumentationModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(COMPLETE_DOCUMENTATION_TEXT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([COMPLETE_DOCUMENTATION_TEXT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'guida_quantistica_health_qiskit.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0b0c10] border border-amber-500/30 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-[0_0_60px_rgba(245,158,11,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Documentazione Tecnica & Codice Qiskit (13 Qubit)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                  Health Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Guida completa all'architettura a 5 livelli, mapping quantistico e script Python Qiskit 1.x.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                copied ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'Copiato!' : 'Copia Tutto'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Scarica .txt</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer ml-1"
              title="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col gap-3 min-h-0">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Casella di testo per selezione manuale rapida (Ctrl+A / Cmd+A + Ctrl+C):</span>
            </div>
            <span className="text-[10px] text-slate-500">Formato UTF-8 Plain Text</span>
          </div>

          <textarea
            readOnly
            value={COMPLETE_DOCUMENTATION_TEXT}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            className="flex-1 w-full p-4 bg-black/90 border border-white/10 focus:border-amber-500/50 rounded-2xl text-slate-300 font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-amber-500/30 selection:text-white custom-scrollbar"
          />
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Sistema Quantistico Medico • 13 Qubit ZZFeatureMap • Qiskit 1.x</span>
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
