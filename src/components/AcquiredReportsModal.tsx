import React, { useState } from 'react';
import { X, FileText, Upload, Trash2, CheckCircle2, AlertCircle, Clock, Search, Filter, Cpu, Database, Eye } from 'lucide-react';

export interface AcquiredReport {
  id: string;
  name: string;
  date: string;
  type: 'pdf' | 'photo' | 'csv' | 'manual';
  originalFilename?: string;
  size: string;
  parametersCount: number;
  extractedBiomarkers: string[];
  status: 'Sincronizzato Qiskit' | 'Validato' | 'Archiviato';
  quantumTheta: string;
  quantumState: string;
  anomaliesDetected: number;
  summary: string;
}

interface AcquiredReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: AcquiredReport[];
  onDeleteReport: (id: string) => void;
  onUploadNew: (file: File) => void;
  onSelectReportForScreening?: (report: AcquiredReport) => void;
}

export default function AcquiredReportsModal({
  isOpen,
  onClose,
  reports,
  onDeleteReport,
  onUploadNew,
  onSelectReportForScreening
}: AcquiredReportsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'photo' | 'csv' | 'manual'>('all');
  const [selectedReportDetail, setSelectedReportDetail] = useState<AcquiredReport | null>(null);

  if (!isOpen) return null;

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.extractedBiomarkers.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onUploadNew(file);
    }
  };

  const getTypeBadge = (type: AcquiredReport['type']) => {
    switch (type) {
      case 'pdf':
        return { label: 'PDF CLINICO', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      case 'photo':
        return { label: 'FOTO / OCR', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      case 'csv':
        return { label: 'CSV IOT / WATCH', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'manual':
        return { label: 'MISURA MANUALE', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f0f11] border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* Header Modale */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Referti e Dati Acquisiti
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {reports.length} Documenti
                </span>
              </div>
              <p className="text-xs text-slate-400 font-light">
                Registro temporale dei referti ematochimici, tracciati IoT e file processati nel circuito quantistico.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra di Ricerca, Filtri e Caricamento Veloce */}
        <div className="p-4 sm:p-6 border-b border-white/5 bg-black/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus-within:border-cyan-500/60 transition-colors">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cerca referto, esame (es. Glicemia, Ferritina, PCR)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-white focus:outline-none placeholder:text-slate-500 text-xs"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl text-[11px] font-mono">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterType === 'all' ? 'bg-white/15 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                Tutti ({reports.length})
              </button>
              <button
                onClick={() => setFilterType('pdf')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterType === 'pdf' ? 'bg-rose-500/20 text-rose-300 font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                PDF
              </button>
              <button
                onClick={() => setFilterType('csv')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterType === 'csv' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                CSV / Watch
              </button>
              <button
                onClick={() => setFilterType('photo')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterType === 'photo' ? 'bg-purple-500/20 text-purple-300 font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                Foto OCR
              </button>
            </div>

            <label className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 border border-cyan-500/40 hover:border-cyan-400/60 text-cyan-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Carica Altro Referto</span>
              <input
                type="file"
                accept="application/pdf,image/*,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Corpo Elenco Documenti */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {filteredReports.length === 0 ? (
            <div className="text-center py-16 px-4 flex flex-col items-center justify-center gap-3">
              <FileText className="w-12 h-12 text-slate-600" />
              <div className="text-sm font-medium text-slate-400">Nessun referto o file trovato</div>
              <p className="text-xs text-slate-500 max-w-sm">
                Nessun file corrisponde alla ricerca corrente o non sono ancora stati caricati documenti. Usa il pulsante &quot;Carica Altro Referto&quot; per iniziare.
              </p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const badge = getTypeBadge(report.type);
              return (
                <div
                  key={report.id}
                  className="bg-black/40 border border-white/5 hover:border-cyan-500/30 rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col gap-3 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex flex-col gap-0.5">
                            <h4 className="text-sm font-semibold text-white tracking-wide">
                              {report.name}
                            </h4>
                            {report.originalFilename && (
                              <span className="text-[9px] text-slate-400 font-mono opacity-80" title="Nome file originale">
                                File: {report.originalFilename}
                              </span>
                            )}
                          </div>
                          <span className={`text-[9.5px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {report.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-light mt-0.5 line-clamp-1">
                          {report.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => setSelectedReportDetail(selectedReportDetail?.id === report.id ? null : report)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Vedi Dettaglio"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{selectedReportDetail?.id === report.id ? 'Chiudi' : 'Dettagli'}</span>
                      </button>

                      {onSelectReportForScreening && (
                        <button
                          onClick={() => {
                            onSelectReportForScreening(report);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Inietta i biomarcatori di questo referto nel calcolo del circuito Quantum principale."
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Applica al Modello</span>
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteReport(report.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="Elimina Documento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Parametri e Stato Quantistico */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-white/5 text-[11px] font-mono">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-500 text-[10px] uppercase tracking-wider mr-1">Biomarcatori ({report.parametersCount}):</span>
                      {report.extractedBiomarkers.map((bio, idx) => (
                        <span key={idx} className="bg-white/5 text-slate-300 border border-white/10 px-2 py-0.5 rounded text-[10px]">
                          {bio}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">Tensore:</span>
                      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                        {report.quantumTheta}
                      </span>
                      {report.anomaliesDetected > 0 ? (
                        <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {report.anomaliesDetected} {report.anomaliesDetected === 1 ? 'Anomalia' : 'Anomalie'}
                        </span>
                      ) : (
                        <span className="text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Tutto in range
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pannello Espanso di Dettaglio del Referto */}
                  {selectedReportDetail?.id === report.id && (
                    <div className="mt-2 p-4 rounded-xl bg-black/60 border border-cyan-500/20 text-xs font-light text-slate-300 space-y-2.5 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-3 border-b border-white/10 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Dimensione File:</span>
                          <span className="text-white font-medium">{report.size}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Stato Vettore Quantistico:</span>
                          <span className="text-emerald-400 font-medium">{report.quantumState}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Stato di Acquisizione:</span>
                          <span className="text-cyan-300 font-medium">{report.status}</span>
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-white block mb-1 text-[11px]">Sintesi Clinica del Documento:</span>
                        <p className="leading-relaxed text-slate-300">
                          {report.summary}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-200">
                        <span className="font-bold font-mono uppercase text-[10px] block text-cyan-400 mb-0.5">Ruolo nell&apos;Algoritmo Temporale:</span>
                        I valori estratti da questo documento vengono utilizzati sia come snapshot attuale (se è il più recente) sia come baseline per calcolare il gradiente di tendenza vettoriale ($\Delta \theta / \Delta t$) nei circuiti Qiskit storicizzati.
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Informativo di Spiegazione Quantistica */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>I dati storici mantengono la memoria biologica; i nuovi referti calcolano la rotazione di stato $\Delta \theta$.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors self-end sm:self-auto cursor-pointer"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
}
