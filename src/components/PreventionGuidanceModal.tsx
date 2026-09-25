import React, { useState } from 'react';
import { 
  X, Calendar, ShieldCheck, AlertTriangle, AlertCircle, Clock, 
  CheckCircle2, Plus, Sparkles, User, FileText, ChevronRight, Activity
} from 'lucide-react';
import { ScreeningResult } from './MedicalScreening';
import { CROSS_PARAMETER_PROBLEMS } from '../data/medicalCategoriesData';
import { getProblemSeverity } from './CrossParameterAnalysis';

export interface MedicalCheckupRecord {
  id: string;
  name: string;
  category: 'routine' | 'domino' | 'custom';
  targetGender: 'both' | 'male' | 'female';
  recommendedFrequencyMonths: number;
  lastDate?: string;
  nextDueDate?: string;
  status: 'completed' | 'pending' | 'urgent';
  notes?: string;
  doctorSpecialty: string;
  priorityLevel: 'routine' | 'recommended' | 'critical';
  reason: string;
}

interface PreventionGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ScreeningResult | null;
  patientGender?: 'MALE' | 'FEMALE';
  patientDob?: string;
}

export const PreventionGuidanceModal: React.FC<PreventionGuidanceModalProps> = ({
  isOpen,
  onClose,
  result,
  patientGender = 'MALE',
  patientDob,
}) => {
  if (!isOpen) return null;

  // Calcolo età approssimata
  let patientAge = 42;
  if (patientDob) {
    const birthYear = new Date(patientDob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (!isNaN(birthYear)) {
      patientAge = Math.max(18, currentYear - birthYear);
    }
  }

  // Chiave localStorage per visite registrate dell'utente
  const storageKey = 'quantum_medical_prevention_records';
  const [records, setRecords] = useState<MedicalCheckupRecord[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [activeTab, setActiveTab] = useState<'all' | 'domino' | 'routine'>('all');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

  // Calcolo anomalie attive dall'Effetto Domino
  const dominoIssues = result ? CROSS_PARAMETER_PROBLEMS.map(p => ({
    problem: p,
    severity: getProblemSeverity(p, result)
  })).filter(x => x.severity === 'red' || x.severity === 'orange') : [];

  // Esami di Routine Annuale/Periodica basati su Età e Sesso
  const routineScreenings: Omit<MedicalCheckupRecord, 'id' | 'status'>[] = [
    // Cardio & Generale (entrambi)
    {
      name: 'Elettrocardiogramma (ECG) a Riposo e Sotto Sforzo',
      category: 'routine',
      targetGender: 'both',
      recommendedFrequencyMonths: 12,
      doctorSpecialty: 'Cardiologia',
      priorityLevel: 'recommended',
      reason: 'Monitoraggio annuale del ritmo, conduzione atrioventricolare e riserva coronarica sotto sforzo.'
    },
    {
      name: 'Profilo Ematochimico Completo & Metabolismo Lipidico (ApoB, HbA1c)',
      category: 'routine',
      targetGender: 'both',
      recommendedFrequencyMonths: 12,
      doctorSpecialty: 'Medicina di Base / Laboratorio',
      priorityLevel: 'recommended',
      reason: 'Controllo sistemico di glicemia, emoglobina glicata, profilo lipidico aterogeno e clearance renale/epatica.'
    },
    // Uomo specifico
    ...(patientGender === 'MALE' ? [
      {
        name: patientAge >= 45 ? 'Dosaggio PSA Totale e Libero + Visita Urologica' : 'Visita Urologica di Prevenzione Andrologica',
        category: 'routine' as const,
        targetGender: 'male' as const,
        recommendedFrequencyMonths: 12,
        doctorSpecialty: 'Urologia / Andrologia',
        priorityLevel: (patientAge >= 50 ? 'critical' : 'recommended') as 'critical' | 'recommended',
        reason: patientAge >= 45
          ? 'Screening cardine della ghiandola prostatica e monitoraggio antigene prostatico specifico per prevenzione oncologica.'
          : 'Valutazione morfofunzionale uro-andrologica periodica.'
      },
    ] : []),
    // Donna specifica
    ...(patientGender === 'FEMALE' ? [
      {
        name: patientAge >= 40 ? 'Mammografia Bilaterale con Tomosintesi ed Ecografia Mammaria' : 'Ecografia Mammaria di Controllo',
        category: 'routine' as const,
        targetGender: 'female' as const,
        recommendedFrequencyMonths: patientAge >= 40 ? 12 : 24,
        doctorSpecialty: 'Senologia / Radiologia',
        priorityLevel: (patientAge >= 40 ? 'critical' : 'recommended') as 'critical' | 'recommended',
        reason: patientAge >= 40
          ? 'Screening senologico salvavita primario per identificazione precoce di microcalcificazioni o lesioni sub-cliniche.'
          : 'Sorveglianza parenchimale del tessuto ghiandolare mammario giovane.'
      },
      {
        name: 'Pap-Test / HPV-DNA Test + Visita Ginecologica',
        category: 'routine' as const,
        targetGender: 'female' as const,
        recommendedFrequencyMonths: 24,
        doctorSpecialty: 'Ginecologia',
        priorityLevel: 'recommended' as const,
        reason: 'Prevenzione delle lesioni precancerose della cervice uterina ed ecografia transvaginale di controllo ovarico/endometriale.'
      },
      ...(patientAge >= 50 ? [{
        name: 'Mineralometria Ossea Computerizzata (MOC DEXA)',
        category: 'routine' as const,
        targetGender: 'female' as const,
        recommendedFrequencyMonths: 24,
        doctorSpecialty: 'Reumatologia / Endocrinologia',
        priorityLevel: 'recommended' as const,
        reason: 'Valutazione densità minerale ossea (T-score) per diagnosi precoce di osteopenia/osteoporosi post-menopausale.'
      }] : [])
    ] : []),
    // Screening Gastroenterologico / Colon (Entrambi sopra i 45-50 anni)
    ...(patientAge >= 45 ? [{
      name: 'Ricerca Sangue Occulto nelle Feci (FIT Test su 3 Campioni)',
      category: 'routine' as const,
      targetGender: 'both' as const,
      recommendedFrequencyMonths: 12,
      doctorSpecialty: 'Gastroenterologia',
      priorityLevel: 'critical' as const,
      reason: 'Screening colon-retto per intercettazione di adenomi o micro-sanguinamenti prima della loro trasformazione.'
    }] : []),
    // Visita Dermatologica
    {
      name: 'Mappatura dei Nei ed Epiluminescenza Digitale',
      category: 'routine',
      targetGender: 'both',
      recommendedFrequencyMonths: 12,
      doctorSpecialty: 'Dermatologia',
      priorityLevel: 'recommended',
      reason: 'Sorveglianza periodica delle lesioni melanocitarie cutanee per la prevenzione del melanoma.'
    }
  ];

  // Esami Dinamici Suggeriti dalle Reazioni a Catena (Effetto Domino)
  const dominoPrescriptions: Omit<MedicalCheckupRecord, 'id' | 'status'>[] = [];

  dominoIssues.forEach(item => {
    const p = item.problem;
    const isRed = item.severity === 'red';
    const prio: 'critical' | 'recommended' = isRed ? 'critical' : 'recommended';

    if (p.id.includes('cardio') || p.id.includes('vitali') || p.titolo.toLowerCase().includes('cardio') || p.titolo.toLowerCase().includes('cuore')) {
      dominoPrescriptions.push({
        name: 'Ecocardiogramma Color Doppler ed Holter Pressorio 24h',
        category: 'domino',
        targetGender: 'both',
        recommendedFrequencyMonths: 3,
        doctorSpecialty: 'Cardiologia',
        priorityLevel: prio,
        reason: `Richiesto da allerta ${isRed ? 'CRITICA (Rosso)' : 'ATTENZIONE (Arancione)'} su "${p.titolo}": valutare frazione d'eiezione e rimodellamento ventricolare.`
      });
    }

    if (p.id.includes('metabol') || p.titolo.toLowerCase().includes('glicem') || p.titolo.toLowerCase().includes('metabol')) {
      dominoPrescriptions.push({
        name: 'Curva Glicemica/Insulinemica (OGTT) & Valutazione HOMA-IR',
        category: 'domino',
        targetGender: 'both',
        recommendedFrequencyMonths: 3,
        doctorSpecialty: 'Endocrinologia / Diabetologia',
        priorityLevel: prio,
        reason: `Richiesto da reazione domino "${p.titolo}": intercettare insulino-resistenza precoce e sovraccarico pancreatico.`
      });
    }

    if (p.id.includes('rene') || p.id.includes('fegato') || p.titolo.toLowerCase().includes('organo') || p.titolo.toLowerCase().includes('fegato')) {
      dominoPrescriptions.push({
        name: 'Ecografia Addome Completo ed Esame Urine con Microalbuminuria',
        category: 'domino',
        targetGender: 'both',
        recommendedFrequencyMonths: 6,
        doctorSpecialty: 'Medicina Interna / Nefrologia',
        priorityLevel: prio,
        reason: `Richiesto da sovraccarico funzionale "${p.titolo}": verificare steatosi epatica e filtrazione glomerulare renale.`
      });
    }

    if (p.id.includes('flogosi') || p.id.includes('infiamm') || p.titolo.toLowerCase().includes('infiamm')) {
      dominoPrescriptions.push({
        name: 'Pannello Citochine & Frazione hs-PCR di Precisione con Elettroforesi',
        category: 'domino',
        targetGender: 'both',
        recommendedFrequencyMonths: 3,
        doctorSpecialty: 'Immunologia Clinica',
        priorityLevel: prio,
        reason: `Richiesto da catena infiammatoria attiva "${p.titolo}": spegnere l'attrito citochinico prima che logori l'endotelio.`
      });
    }
  });

  // Rimuovi duplicati basati sul nome
  const combinedRecommendations: MedicalCheckupRecord[] = [];
  const seenNames = new Set<string>();

  // Prima quelli prioritari dell'effetto domino
  dominoPrescriptions.forEach((item, idx) => {
    if (!seenNames.has(item.name)) {
      seenNames.add(item.name);
      const existing = records.find(r => r.name === item.name);
      combinedRecommendations.push({
        id: existing?.id || `dom-${idx}-${Date.now()}`,
        ...item,
        status: existing?.status || 'urgent',
        lastDate: existing?.lastDate,
        nextDueDate: existing?.nextDueDate,
        notes: existing?.notes
      });
    }
  });

  // Poi quelli di routine
  routineScreenings.forEach((item, idx) => {
    if (!seenNames.has(item.name)) {
      seenNames.add(item.name);
      const existing = records.find(r => r.name === item.name);
      combinedRecommendations.push({
        id: existing?.id || `rout-${idx}-${Date.now()}`,
        ...item,
        status: existing?.status || 'pending',
        lastDate: existing?.lastDate,
        nextDueDate: existing?.nextDueDate,
        notes: existing?.notes
      });
    }
  });

  // Aggiungi eventuali esami personalizzati salvati dall'utente
  records.filter(r => r.category === 'custom').forEach(cust => {
    if (!seenNames.has(cust.name)) {
      seenNames.add(cust.name);
      combinedRecommendations.push(cust);
    }
  });

  // Filtra per tab
  const filteredRecords = combinedRecommendations.filter(rec => {
    if (activeTab === 'domino') return rec.category === 'domino';
    if (activeTab === 'routine') return rec.category === 'routine' || rec.category === 'custom';
    return true;
  });

  // Toggle completamento / registrazione data
  const handleToggleCompleted = (rec: MedicalCheckupRecord) => {
    const today = new Date().toISOString().split('T')[0];
    const isNowCompleted = rec.status !== 'completed';
    
    // Calcola prossima scadenza
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + rec.recommendedFrequencyMonths);
    const nextDueStr = nextDate.toISOString().split('T')[0];

    const updatedRecord: MedicalCheckupRecord = {
      ...rec,
      status: isNowCompleted ? 'completed' : (rec.category === 'domino' ? 'urgent' : 'pending'),
      lastDate: isNowCompleted ? today : undefined,
      nextDueDate: isNowCompleted ? nextDueStr : undefined
    };

    const newRecordsList = records.filter(r => r.name !== rec.name);
    newRecordsList.push(updatedRecord);
    setRecords(newRecordsList);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newRecordsList));
    } catch (e) {}
  };

  const handleAddCustomRecord = () => {
    if (!customName.trim()) return;
    const newCustom: MedicalCheckupRecord = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: 'custom',
      targetGender: 'both',
      recommendedFrequencyMonths: 12,
      lastDate: customDate,
      status: 'completed',
      doctorSpecialty: customSpecialty.trim() || 'Visita Specialistica',
      priorityLevel: 'recommended',
      reason: 'Visita specialistica registrata direttamente dall\'utente.'
    };
    const updated = [...records, newCustom];
    setRecords(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {}
    setCustomName('');
    setCustomSpecialty('');
    setShowAddCustom(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-[#0e1017] border border-cyan-500/30 w-full max-w-4xl max-h-[92vh] rounded-3xl flex flex-col shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden relative">
        
        {/* HEADER MODALE */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-[#111420] to-emerald-950/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.35)] shrink-0">
              <Calendar className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  Piano Annuale di Prevenzione & Screening
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-400/30 font-semibold">
                  Personalizzato
                </span>
              </div>
              <p className="text-xs text-slate-300 font-light mt-0.5">
                Profilo: <strong className="text-white font-medium">{patientGender === 'MALE' ? 'Uomo' : 'Donna'}</strong> (~{patientAge} anni) • Monitoraggio integrato con Biomarcatori ed Effetto Domino
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GUIDA SINTETICA RAPIDA */}
        <div className="px-5 sm:px-6 py-3 bg-white/[0.02] border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              La piattaforma memorizza data e ora di ogni esame svolto per calcolarne la validità e la prossima scadenza temporale.
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                activeTab === 'all' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Tutti ({combinedRecommendations.length})
            </button>
            <button
              onClick={() => setActiveTab('domino')}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'domino' 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold' 
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Da Effetto Domino ({dominoPrescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('routine')}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                activeTab === 'routine' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' 
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Routine Annuale
            </button>
          </div>
        </div>

        {/* CONTENUTO SCROLLABILE: ELENCO SCREENING */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          
          {/* BANNER REAZIONI A CATENA ATTIVE SE PRESENTI */}
          {dominoPrescriptions.length > 0 && activeTab !== 'routine' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/30 via-red-900/10 to-transparent border border-red-500/40 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-300 shrink-0">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-red-300 uppercase font-mono tracking-wide">
                  Screening Suggeriti dall'Effetto Domino ({dominoPrescriptions.length} Allerte)
                </h4>
                <p className="text-xs text-slate-300 font-light mt-0.5">
                  I tuoi biomarcatori hanno evidenziato quadranti arancioni o rossi: questi approfondimenti permettono di intercettare l'attrito prima che si traduca in un danno tissutale d'organo irreversibile.
                </p>
              </div>
            </div>
          )}

          {/* LISTA CARD DEGLI ESAMI */}
          <div className="flex flex-col gap-3">
            {filteredRecords.map((rec) => {
              const isCompleted = rec.status === 'completed';
              const isDomino = rec.category === 'domino';

              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isCompleted
                      ? 'bg-emerald-950/15 border-emerald-500/30'
                      : isDomino
                      ? 'bg-[#15121b] border-red-500/40 hover:border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isCompleted
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : isDomino
                        ? 'bg-red-500/20 border-red-500/40 text-red-300'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isDomino ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Activity className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                          isDomino 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}>
                          {isDomino ? 'Prioritario (Effetto Domino)' : 'Screening di Routine'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Specialità: <strong className="text-slate-200">{rec.doctorSpecialty}</strong>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Cadenza: ogni {rec.recommendedFrequencyMonths} mesi
                        </span>
                      </div>

                      <h3 className={`text-sm sm:text-[15px] font-semibold tracking-wide ${isCompleted ? 'text-emerald-300' : 'text-white'}`}>
                        {rec.name}
                      </h3>

                      <p className="text-xs text-slate-300 font-light mt-1 leading-relaxed">
                        {rec.reason}
                      </p>

                      {/* STATO E STORICO ESAME */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] font-mono">
                        {rec.lastDate ? (
                          <span className="text-emerald-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Ultimo svolto: <strong>{rec.lastDate}</strong>
                          </span>
                        ) : (
                          <span className="text-amber-400/90 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Non ancora registrato nell'anno
                          </span>
                        )}

                        {rec.nextDueDate && (
                          <span className="text-slate-400">
                            • Prossimo richiamo: <strong className="text-cyan-300">{rec.nextDueDate}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PULSANTE REGISTRAZIONE / STATO */}
                  <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleCompleted(rec)}
                      className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                          : isDomino
                          ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Eseguito</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Registra Esecuzione</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOX AGGIUNTA ESAME PERSONALIZZATO */}
          {showAddCustom ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-cyan-500/30 flex flex-col gap-3 animate-in fade-in duration-200">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-cyan-300">
                Aggiungi Visita o Controllo Specialistico Personalizzato
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nome dell'esame o visita (es. Visita Oculistica)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  placeholder="Specialità medica (es. Oculistica)"
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomRecord}
                  disabled={!customName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider font-mono disabled:opacity-50"
                >
                  Salva nel Diario Clinico
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddCustom(true)}
              className="p-3 rounded-xl border border-dashed border-white/15 hover:border-cyan-400/50 hover:bg-white/[0.02] text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Hai fatto un'altra visita specialistica? Registrala qui con data e referto</span>
            </button>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#090a0f] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 text-[11px]">
            * Le raccomandazioni si basano sulle linee guida internazionali di longevità e sul profilo fisiologico calcolato da Qiskit.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold transition-all cursor-pointer"
          >
            Chiudi Calendario
          </button>
        </div>

      </div>
    </div>
  );
};
