import React, { useState, useMemo } from 'react';
import { 
  X, Calendar, ShieldCheck, AlertTriangle, AlertCircle, Clock, 
  CheckCircle2, Plus, Sparkles, User, FileText, ChevronRight, Activity,
  Search, Filter, Syringe, Building2, Check, Stethoscope, HeartPulse,
  Edit2
} from 'lucide-react';
import { ScreeningResult } from './MedicalScreening';
import { CROSS_PARAMETER_PROBLEMS } from '../data/medicalCategoriesData';
import { getProblemSeverity } from './CrossParameterAnalysis';
import { 
  AGE_BRACKETS, 
  AgeBracketId, 
  getAgeBracketForAge, 
  NATIONAL_HEALTH_PLAN_DATABASE, 
  NationalHealthPlanItem, 
  evaluateParamTag,
  ParamTagStatus
} from '../data/nationalHealthPlanData';

export interface MedicalCheckupRecord {
  id: string;
  name: string;
  category: 'routine' | 'domino' | 'custom';
  screeningType?: 'lea' | 'routine' | 'vaccine_mandatory' | 'vaccine_recommended' | 'domino_cascade';
  targetGender: 'both' | 'male' | 'female';
  ageBracket?: AgeBracketId;
  recommendedFrequencyMonths: number;
  lastDate?: string;
  nextDueDate?: string;
  status: 'completed' | 'pending' | 'urgent';
  notes?: string;
  doctorSpecialty: string;
  priorityLevel: 'routine' | 'recommended' | 'critical';
  reason: string;
  paramTags?: string[];
  paramTagEvaluations?: ParamTagStatus[];
  dominoTriggerReason?: string;
  isPregnancyOnly?: boolean;
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

  // Stato data di nascita e sesso con persistenza
  const [currentDob, setCurrentDob] = useState<string>(() => {
    return patientDob || localStorage.getItem('quantum_medical_dob') || '1984-05-15';
  });

  const [currentGender, setCurrentGender] = useState<'MALE' | 'FEMALE'>(() => {
    const saved = localStorage.getItem('quantum_medical_gender');
    if (saved === 'M') return 'MALE';
    if (saved === 'F') return 'FEMALE';
    return patientGender || 'MALE';
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Calcolo età esatta del paziente
  const patientAge = useMemo(() => {
    if (!currentDob) return 42;
    const birthDate = new Date(currentDob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) || age < 0 ? 42 : age;
  }, [currentDob]);

  // Fascia d'età calcolata rigorosamente in base all'età dell'utente
  const activeAgeBracketId = useMemo(() => getAgeBracketForAge(patientAge), [patientAge]);
  const activeBracketInfo = useMemo(() => AGE_BRACKETS.find(b => b.id === activeAgeBracketId), [activeAgeBracketId]);

  // Filtri UI secondari
  const [activeTab, setActiveTab] = useState<'all' | 'domino' | 'routine'>('all');
  const [screeningTypeFilter, setScreeningTypeFilter] = useState<'all' | 'lea' | 'routine' | 'vaccine'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modale esame personalizzato
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

  // Chiave localStorage per visite registrate dell'utente
  const storageKey = 'quantum_medical_prevention_records';
  const [records, setRecords] = useState<MedicalCheckupRecord[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Gestione aggiornamento data di nascita o sesso
  const handleUpdateDob = (newDob: string) => {
    setCurrentDob(newDob);
    try {
      localStorage.setItem('quantum_medical_dob', newDob);
    } catch (e) {}
  };

  const handleUpdateGender = (newGender: 'MALE' | 'FEMALE') => {
    setCurrentGender(newGender);
    try {
      localStorage.setItem('quantum_medical_gender', newGender === 'MALE' ? 'M' : 'F');
    } catch (e) {}
  };

  // Calcolo anomalie attive dall'Effetto Domino Clinico (biomarcatori del paziente)
  const dominoIssues = useMemo(() => {
    return result ? CROSS_PARAMETER_PROBLEMS.map(p => ({
      problem: p,
      severity: getProblemSeverity(p, result)
    })).filter(x => x.severity === 'red' || x.severity === 'orange') : [];
  }, [result]);

  // Esami Dinamici generati dall'Effetto Domino Primario
  const dominoSpecialPrescriptions = useMemo<Omit<MedicalCheckupRecord, 'id' | 'status'>[]>(() => {
    const list: Omit<MedicalCheckupRecord, 'id' | 'status'>[] = [];

    dominoIssues.forEach(item => {
      const p = item.problem;
      const isRed = item.severity === 'red';
      const prio: 'critical' | 'recommended' = isRed ? 'critical' : 'recommended';

      if (p.id.includes('cardio') || p.id.includes('vitali') || p.titolo.toLowerCase().includes('cardio') || p.titolo.toLowerCase().includes('cuore')) {
        list.push({
          name: 'Ecocardiogramma Color Doppler ed Holter Pressorio 24h',
          category: 'domino',
          screeningType: 'domino_cascade',
          targetGender: 'both',
          recommendedFrequencyMonths: 3,
          doctorSpecialty: 'Cardiologia',
          priorityLevel: prio,
          paramTags: ['Pressione_Arteriosa', 'ECG', 'Rischio_Cardiovascolare'],
          dominoTriggerReason: `Allerta ${isRed ? 'CRITICA (Rosso)' : 'ATTENZIONE (Arancione)'} su "${p.titolo}": monitoraggio della frazione d'eiezione e del rimodellamento miocardico.`,
          reason: `Richiesto da sovraccarico emodinamico attivo: valutazione volumetrica delle camere cardiache e profilo pressorio circadiano.`
        });
      }

      if (p.id.includes('metabol') || p.titolo.toLowerCase().includes('glicem') || p.titolo.toLowerCase().includes('metabol')) {
        list.push({
          name: 'Curva Glicemica/Insulinemica (OGTT) & Valutazione HOMA-IR',
          category: 'domino',
          screeningType: 'domino_cascade',
          targetGender: 'both',
          recommendedFrequencyMonths: 3,
          doctorSpecialty: 'Endocrinologia / Diabetologia',
          priorityLevel: prio,
          paramTags: ['Glicemia', 'HOMA_IR', 'Insulina'],
          dominoTriggerReason: `Innescato dalla reazione metabolica "${p.titolo}": contrastare l'esaurimento insulare delle cellule beta pancreatiche.`,
          reason: `Intercettazione precoce dell'insulino-resistenza sistemica prima della glicotossicità vascolare.`
        });
      }

      if (p.id.includes('rene') || p.id.includes('fegato') || p.titolo.toLowerCase().includes('organo') || p.titolo.toLowerCase().includes('fegato')) {
        list.push({
          name: 'Ecografia Addome Completo ed Esame Urine con Microalbuminuria',
          category: 'domino',
          screeningType: 'domino_cascade',
          targetGender: 'both',
          recommendedFrequencyMonths: 6,
          doctorSpecialty: 'Medicina Interna / Nefrologia',
          priorityLevel: prio,
          paramTags: ['Creatinina', 'Transaminasi', 'Funzionalita_Renale'],
          dominoTriggerReason: `Attivato da sovraccarico parenchimale "${p.titolo}": verificare filtrazione glomerulare e parenchima epatico.`,
          reason: `Studio ecografico morfo-funzionale degli organi addominali e sorveglianza della barriera glomerulare renale.`
        });
      }

      if (p.id.includes('flogosi') || p.id.includes('infiamm') || p.titolo.toLowerCase().includes('infiamm')) {
        list.push({
          name: 'Pannello Citochine & Frazione hs-PCR di Precisione con Elettroforesi',
          category: 'domino',
          screeningType: 'domino_cascade',
          targetGender: 'both',
          recommendedFrequencyMonths: 3,
          doctorSpecialty: 'Immunologia Clinica',
          priorityLevel: prio,
          paramTags: ['Ferritina', 'hs_PCR', 'Citochine'],
          dominoTriggerReason: `Richiesto dal circuito infiammatorio "${p.titolo}": estinguere l'attrito endoteliale prima del danno tissutale.`,
          reason: `Misurazione quantitativa della proteina C-reattiva ad alta sensibilità e citochine infiammatorie circolanti.`
        });
      }
    });

    return list;
  }, [dominoIssues]);

  // COSTRUZIONE DEL PIANO IPER-PERSONALIZZATO:
  // Mostra ESCLUSIVAMENTE gli esami pertinenti alla fascia d'età e al sesso dell'utente
  const personalizedScreeningRecords = useMemo<MedicalCheckupRecord[]>(() => {
    const list: MedicalCheckupRecord[] = [];
    const seenNames = new Set<string>();

    const targetUserGender = currentGender === 'MALE' ? 'male' : 'female';

    // 1. Inserisci le prescrizioni cliniche prioritare dell'Effetto Domino
    dominoSpecialPrescriptions.forEach((item, idx) => {
      const normalizedName = item.name.trim().toLowerCase();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        const existing = records.find(r => r.name.trim().toLowerCase() === normalizedName);
        list.push({
          id: existing?.id || `dom-cascade-${idx}-${Date.now()}`,
          ...item,
          status: existing?.status || 'urgent',
          lastDate: existing?.lastDate,
          nextDueDate: existing?.nextDueDate,
          notes: existing?.notes
        });
      }
    });

    // 2. Filtra il database nazionale: SOLO elementi appartenenti alla FASCIA D'ETÀ ATTIVA dell'utente e al suo sesso!
    NATIONAL_HEALTH_PLAN_DATABASE.forEach((item, idx) => {
      // FILTRO RIGIDO SULLA FASCIA D'ETÀ: ESCLUDI qualsiasi esame di altre fasce!
      if (item.ageBracket !== activeAgeBracketId) return;

      // FILTRO RIGIDO SUL SESSO: ESCLUDI esami specifici dell'altro sesso
      if (item.targetGender !== 'both' && item.targetGender !== targetUserGender) return;

      const normalizedName = item.name.trim().toLowerCase();
      if (seenNames.has(normalizedName)) return;

      // Valuta i tag di parametro associati per verificare se vi siano anomalie nei dati inseriti
      const tagEvaluations = item.paramTags.map(tag => evaluateParamTag(tag, result, dominoIssues));
      const abnormalTags = tagEvaluations.filter(t => t.isAbnormal);
      const isTriggeredByParams = abnormalTags.length > 0;

      // Se un parametro è alterato, l'esame viene promosso alla categoria prioritaria "domino"
      const category: 'routine' | 'domino' = isTriggeredByParams ? 'domino' : 'routine';
      const priorityLevel: 'critical' | 'recommended' | 'routine' = isTriggeredByParams 
        ? 'critical' 
        : item.screeningType === 'lea' 
        ? 'recommended' 
        : 'routine';

      const dominoTriggerReason = isTriggeredByParams
        ? `⚠️ Promosso a PRIORITÀ per Effetto Domino: riscontrata anomalia sul parametro [PARAM: ${abnormalTags[0].tag}] (${abnormalTags[0].alertReason})`
        : undefined;

      const existing = records.find(r => r.name.trim().toLowerCase() === normalizedName);
      seenNames.add(normalizedName);

      list.push({
        id: existing?.id || `nat-${item.id}-${idx}`,
        name: item.name,
        category,
        screeningType: item.screeningType,
        targetGender: item.targetGender,
        ageBracket: item.ageBracket,
        recommendedFrequencyMonths: item.recommendedFrequencyMonths,
        doctorSpecialty: item.doctorSpecialty,
        priorityLevel,
        reason: item.reason,
        paramTags: item.paramTags,
        paramTagEvaluations: tagEvaluations,
        dominoTriggerReason,
        isPregnancyOnly: item.isPregnancyOnly,
        status: existing?.status || (category === 'domino' ? 'urgent' : 'pending'),
        lastDate: existing?.lastDate,
        nextDueDate: existing?.nextDueDate,
        notes: existing?.notes
      });
    });

    // 3. Aggiungi eventuali esami personalizzati salvati dall'utente
    records.filter(r => r.category === 'custom').forEach(cust => {
      const normalizedName = cust.name.trim().toLowerCase();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        list.push(cust);
      }
    });

    return list;
  }, [activeAgeBracketId, currentGender, dominoSpecialPrescriptions, result, dominoIssues, records]);

  // Conteggi per i badge
  const dominoCount = useMemo(() => personalizedScreeningRecords.filter(r => r.category === 'domino').length, [personalizedScreeningRecords]);
  const routineCount = useMemo(() => personalizedScreeningRecords.filter(r => r.category === 'routine' || r.category === 'custom').length, [personalizedScreeningRecords]);

  // Applicazione filtri di visualizzazione utente (Tab, Tipologia e Ricerca)
  const filteredRecords = useMemo(() => {
    return personalizedScreeningRecords.filter(rec => {
      // 1. Filtro Tab (Tutti / Effetto Domino / Routine)
      if (activeTab === 'domino' && rec.category !== 'domino') return false;
      if (activeTab === 'routine' && rec.category !== 'routine' && rec.category !== 'custom') return false;

      // 2. Filtro Tipologia
      if (screeningTypeFilter === 'lea' && rec.screeningType !== 'lea') return false;
      if (screeningTypeFilter === 'routine' && rec.screeningType !== 'routine' && rec.screeningType !== 'domino_cascade') return false;
      if (screeningTypeFilter === 'vaccine' && rec.screeningType !== 'vaccine_mandatory' && rec.screeningType !== 'vaccine_recommended') return false;

      // 3. Ricerca per testo
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = rec.name.toLowerCase().includes(q);
        const matchSpecialty = rec.doctorSpecialty.toLowerCase().includes(q);
        const matchReason = rec.reason.toLowerCase().includes(q);
        const matchTag = rec.paramTags?.some(t => t.toLowerCase().includes(q)) ?? false;
        if (!matchName && !matchSpecialty && !matchReason && !matchTag) return false;
      }

      return true;
    });
  }, [personalizedScreeningRecords, activeTab, screeningTypeFilter, searchQuery]);

  // Toggle completamento / registrazione data
  const handleToggleCompleted = (rec: MedicalCheckupRecord) => {
    const today = new Date().toISOString().split('T')[0];
    const isNowCompleted = rec.status !== 'completed';
    
    // Calcola prossima scadenza
    const nextDate = new Date();
    const months = rec.recommendedFrequencyMonths > 0 ? rec.recommendedFrequencyMonths : 12;
    nextDate.setMonth(nextDate.getMonth() + months);
    const nextDueStr = nextDate.toISOString().split('T')[0];

    const updatedRecord: MedicalCheckupRecord = {
      ...rec,
      status: isNowCompleted ? 'completed' : (rec.category === 'domino' ? 'urgent' : 'pending'),
      lastDate: isNowCompleted ? today : undefined,
      nextDueDate: isNowCompleted ? nextDueStr : undefined
    };

    const newRecordsList = records.filter(r => r.name.trim().toLowerCase() !== rec.name.trim().toLowerCase());
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
      reason: 'Controllo specialistico registrato direttamente dal paziente nel Diario di Prevenzione.'
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-1.5 sm:p-4 md:p-6 animate-in fade-in duration-300">
      <div className="bg-[#0b0d14] border border-cyan-500/30 w-full max-w-5xl max-h-[96vh] sm:max-h-[94vh] rounded-2xl sm:rounded-3xl flex flex-col shadow-[0_0_70px_rgba(6,182,212,0.25)] overflow-hidden relative">
        
        {/* HEADER MODALE */}
        <div className="p-3 sm:p-5 border-b border-white/10 bg-gradient-to-r from-cyan-950/50 via-[#0e111a] to-emerald-950/40 flex items-start sm:items-center justify-between gap-2.5 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.35)] shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-cyan-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-lg font-bold text-white tracking-wide truncate max-w-[200px] min-[400px]:max-w-[260px] sm:max-w-none">
                  Piano di Prevenzione & Screening
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] sm:text-[10px] font-mono border border-cyan-400/40 font-bold whitespace-nowrap">
                  {activeBracketInfo?.label}
                </span>
                {dominoCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[9px] sm:text-[10px] font-mono border border-red-500/40 font-bold flex items-center gap-1 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    {dominoCount} Domino
                  </span>
                )}
              </div>
              <p className="text-[10.5px] sm:text-xs text-slate-300 font-light mt-0.5 truncate sm:whitespace-normal">
                Per: <strong className="text-white font-medium">{currentGender === 'MALE' ? 'Uomo ♂️' : 'Donna ♀️'}</strong> di <strong className="text-cyan-300 font-mono font-bold">{patientAge} anni</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-2 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-mono transition-all cursor-pointer min-h-[32px] sm:min-h-[36px]"
              title="Modifica età o data di nascita per ricalcolare lo screening"
            >
              <Edit2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Modifica Età/Sesso</span>
              <span className="inline sm:hidden">Modifica</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BOX EDIT PROFILO (QUICK AGE/GENDER ADJUSTER) */}
        {isEditingProfile && (
          <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-cyan-950/30 border-b border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center gap-2 text-cyan-200 text-[11px] sm:text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Imposta la data di nascita o sesso per adattare il piano clinico:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <span className="text-slate-400 text-[10px] sm:text-[11px] font-mono">Nascita:</span>
                <input
                  type="date"
                  value={currentDob}
                  onChange={(e) => handleUpdateDob(e.target.value)}
                  className="bg-black/60 border border-cyan-500/40 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 w-full sm:w-auto"
                />
              </div>

              <div className="flex items-center bg-black/60 rounded-lg p-0.5 border border-cyan-500/30 font-mono text-[10px] sm:text-[11px]">
                <button
                  type="button"
                  onClick={() => handleUpdateGender('MALE')}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    currentGender === 'MALE' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Uomo ♂️
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateGender('FEMALE')}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    currentGender === 'FEMALE' ? 'bg-purple-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Donna ♀️
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 font-mono text-xs font-bold cursor-pointer"
              >
                Applica
              </button>
            </div>
          </div>
        )}

        {/* BANNER INFORMATIVO DI IPER-PERSONALIZZAZIONE E CONTROLLI */}
        <div className="px-3 sm:px-5 py-2.5 bg-white/[0.02] border-b border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          
          {/* TABS: TUTTI / EFFETTO DOMINO / ROUTINE */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar w-full md:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-mono text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                activeTab === 'all' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span>Tutti ({personalizedScreeningRecords.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('domino')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-mono text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                activeTab === 'domino' 
                  ? 'bg-red-500/25 text-red-200 border border-red-500/50 font-bold shadow-[0_0_15px_rgba(239,68,68,0.25)]' 
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
              <span>⚡ Domino ({dominoCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('routine')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-mono text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                activeTab === 'routine' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>🛡️ Routine & LEA ({routineCount})</span>
            </button>
          </div>

          {/* FILTRO TIPO & CERCA */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={screeningTypeFilter}
              onChange={(e) => setScreeningTypeFilter(e.target.value as any)}
              className="bg-black/50 border border-white/10 text-slate-300 text-[10.5px] sm:text-[11px] rounded-xl px-2 sm:px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-400 shrink-0"
            >
              <option value="all">Tutti i Tipi</option>
              <option value="lea">Screening LEA</option>
              <option value="routine">Routine Clinica</option>
              <option value="vaccine">Piano Vaccinale</option>
            </select>

            <div className="relative flex-1 min-w-0 md:min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cerca esame o [PARAM]..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* CORPO PRINCIPALE SCROLLABILE */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          
          {/* BANNER EFFETTO DOMINO SE ATTIVO */}
          {dominoCount > 0 && activeTab !== 'routine' && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-red-900/15 to-transparent border border-red-500/40 flex items-start gap-3 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-300 shrink-0">
                <AlertCircle className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-red-300 uppercase font-mono tracking-wide flex items-center gap-2">
                  <span>Approfondimenti Clinici Prioritari per la tua Condizione ({dominoCount})</span>
                </h4>
                <p className="text-xs text-slate-300 font-light mt-0.5 leading-relaxed">
                  L'algoritmo ha confrontato i tuoi biomarcatori con la tua età ({patientAge} anni): gli esami contrassegnati con <strong className="text-red-300">⚡ EFFETTO DOMINO</strong> presentano valori alterati o sovraccarico d'organo e devono avere precedenza sulla routine annuale.
                </p>
              </div>
            </div>
          )}

          {/* LISTA CARD ESAMI */}
          {filteredRecords.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <Sparkles className="w-8 h-8 text-cyan-400/50 mb-2" />
              <h3 className="text-sm font-bold text-white">Nessun esame corrispondente alla ricerca</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Tutti i controlli mostrati sono già rigorosamente filtrati per la tua età ({patientAge} anni) e per il tuo sesso.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredRecords.map((rec) => {
                const isCompleted = rec.status === 'completed';
                const isDomino = rec.category === 'domino';
                const isLea = rec.screeningType === 'lea';
                const isVaccine = rec.screeningType === 'vaccine_mandatory' || rec.screeningType === 'vaccine_recommended';

                return (
                  <div
                    key={rec.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5 ${
                      isCompleted
                        ? 'bg-emerald-950/15 border-emerald-500/30'
                        : isDomino
                        ? 'bg-gradient-to-r from-[#170e13] via-[#120d18] to-black/60 border-red-500/40 hover:border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.12)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      
                      {/* ICONA DECORATIVA */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isCompleted
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : isDomino
                          ? 'bg-red-500/20 border-red-500/40 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                          : isLea
                          ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                          : isVaccine
                          ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                          : 'bg-white/5 border-white/10 text-slate-300'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isDomino ? (
                          <AlertTriangle className="w-4 h-4 animate-pulse" />
                        ) : isLea ? (
                          <Building2 className="w-4 h-4" />
                        ) : isVaccine ? (
                          <Syringe className="w-4 h-4" />
                        ) : (
                          <Stethoscope className="w-4 h-4" />
                        )}
                      </div>

                      {/* DETTAGLI ESAME */}
                      <div className="min-w-0 flex-1">
                        
                        {/* BADGE DI CLASSIFICAZIONE */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          
                          {/* BADGE CATEGORIA */}
                          {isDomino ? (
                            <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-red-500/25 text-red-300 border border-red-500/40 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                              ⚡ Prioritario (Effetto Domino)
                            </span>
                          ) : isLea ? (
                            <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              🏛️ Screening Nazionale LEA
                            </span>
                          ) : rec.screeningType === 'vaccine_mandatory' ? (
                            <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              🔴 Vaccino Obbligatorio
                            </span>
                          ) : rec.screeningType === 'vaccine_recommended' ? (
                            <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              🟢 Vaccino Raccomandato Gratuito
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                              📅 Controllo di Routine ({patientAge} Anni)
                            </span>
                          )}

                          {/* SPECIALITÀ */}
                          <span className="text-[10px] font-mono text-slate-400">
                            Spec: <strong className="text-slate-200">{rec.doctorSpecialty}</strong>
                          </span>

                          {/* FREQUENZA */}
                          <span className="text-[10px] font-mono text-slate-400">
                            • Cadenza: <strong className="text-cyan-300">{rec.recommendedFrequencyMonths === 0 ? 'Una Tantum' : `ogni ${rec.recommendedFrequencyMonths} mesi`}</strong>
                          </span>
                        </div>

                        {/* TITOLO ESAME */}
                        <h3 className={`text-sm sm:text-[14px] font-semibold tracking-wide ${isCompleted ? 'text-emerald-300' : 'text-white'}`}>
                          {rec.name}
                        </h3>

                        {/* MOTIVAZIONE CLINICA */}
                        <p className="text-xs text-slate-300 font-light mt-1 leading-relaxed">
                          {rec.reason}
                        </p>

                        {/* AVVISO DI EFFETTO DOMINO TRIGGERATO */}
                        {rec.dominoTriggerReason && (
                          <div className="mt-1.5 p-2 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 text-xs font-mono leading-relaxed">
                            {rec.dominoTriggerReason}
                          </div>
                        )}

                        {/* TAG DI PARAMETRO [PARAM: ...] */}
                        {rec.paramTags && rec.paramTags.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                              Parametri:
                            </span>
                            {rec.paramTags.map(tag => {
                              const evalObj = rec.paramTagEvaluations?.find(e => e.tag === tag);
                              const isAbnormal = evalObj?.isAbnormal;

                              return (
                                <span
                                  key={tag}
                                  className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                    isAbnormal
                                      ? 'bg-red-500/25 text-red-300 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                                      : 'bg-white/5 text-slate-400 border border-white/10'
                                  }`}
                                  title={evalObj?.alertReason || 'Parametro fisiologico o non ancora caricato'}
                                >
                                  {isAbnormal ? (
                                    <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                                  )}
                                  [PARAM: {tag}]
                                  {isAbnormal && <span className="text-[8px] uppercase tracking-wider text-red-400 font-bold ml-0.5">Allerta</span>}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* STATO E STORICO ESAME */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono">
                          {rec.lastDate ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Ultimo eseguito: <strong>{rec.lastDate}</strong>
                            </span>
                          ) : (
                            <span className="text-amber-400/90 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Non registrato per il periodo corrente
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

                    {/* PULSANTE REGISTRAZIONE ESAME */}
                    <div className="shrink-0 flex items-center gap-2 w-full lg:w-auto justify-end lg:justify-center pt-2 lg:pt-0 border-t border-white/5 lg:border-t-0">
                      <button
                        type="button"
                        onClick={() => handleToggleCompleted(rec)}
                        className={`w-full sm:w-auto px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[36px] ${
                          isCompleted
                            ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                            : isDomino
                            ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Eseguito</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Registra Esecuzione</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* BOX AGGIUNTA ESAME PERSONALIZZATO */}
          {showAddCustom ? (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/30 flex flex-col gap-3 animate-in fade-in duration-200">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-cyan-300">
                Aggiungi Visita o Controllo Specialistico Personalizzato
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  placeholder="Nome dell'esame o visita (es. Visita Oculistica)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <input
                  type="text"
                  placeholder="Specialità medica (es. Oculistica)"
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
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
              className="p-3 rounded-xl border border-dashed border-white/15 hover:border-cyan-400/50 hover:bg-white/[0.02] text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
            >
              <Plus className="w-4 h-4" />
              <span>Hai eseguito un'altra visita o controllo specialistico? Registralo qui nel tuo diario</span>
            </button>
          )}

        </div>

        {/* FOOTER MODALE */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-[#090b10] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Mostra unicamente gli screening della tua fascia anagrafica ({activeBracketInfo?.label}) e le allerte attive dai tuoi biomarcatori.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold transition-all cursor-pointer"
          >
            Chiudi Calendario
          </button>
        </div>

      </div>
    </div>
  );
};
