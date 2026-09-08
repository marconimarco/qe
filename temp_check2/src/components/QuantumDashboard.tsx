import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Play, 
  Settings, 
  Activity, 
  Cpu, 
  Database, 
  TrendingUp,
  AlertTriangle,
  FileText,
  Layers,
  ChevronRight,
  Upload,
  Zap,
  BarChart2,
  CheckCircle2,
  Info,
  Download,
  Shield,
  HelpCircle,
  Search,
  Map as MapIcon,
  Navigation,
  Languages,
  Wand2
} from 'lucide-react';
import QuantumTranslator from './QuantumTranslator';
import OptimizeDenoise from './OptimizeDenoise';
import CrossCode from './CrossCode';
import QuantumBI from './QuantumBI';
import QuantumLocker from './pqc/QuantumLocker';
import QuantumKeyGen from './pqc/QuantumKeyGen';
import QuantumChat from './pqc/QuantumChat';
import LargeQuantumInterface from './LargeQuantumInterface';
import VariousQuantumInterface from './VariousQuantumInterface';


const LogisticsMap = ({ data }: { data: NonNullable<SimulationResult['logisticsData']> }) => {
  const { t } = useTranslation();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="quantum-card bg-black/40 backdrop-blur-md flex flex-col h-full min-h-[400px] sm:min-h-[500px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-2 sm:gap-0">
        <h3 className="flex items-center gap-2 text-white font-display font-semibold uppercase tracking-wider text-[11px] sm:text-sm">
          <MapIcon className="w-4 h-4 sm:w-5 h-5 text-quantum-primary" />
          {t('quantumMapTitle')}
        </h3>
        <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-quantum-primary/10 border border-quantum-primary/30 rounded-full">
          <Navigation className="w-2.5 h-2.5 sm:w-3 h-3 text-quantum-primary" />
          <span className="font-mono text-[8px] sm:text-[10px] text-quantum-primary uppercase">{t('optimizedItinerary')}</span>
        </div>
      </div>

      <div className="relative flex-1 bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden mb-4 md:mb-6 group min-h-[300px] sm:min-h-[350px]">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle, #00f2ff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 p-8">
          {/* Routes */}
          {data.optimizedRoute.map((nodeName, i) => {
            if (i === data.optimizedRoute.length - 1) return null;
            const fromNode = data.nodes.find(n => n.name === nodeName);
            const toNode = data.nodes.find(n => n.name === data.optimizedRoute[i + 1]);
            
            if (!fromNode || !toNode) return null;

            return (
              <motion.line
                key={`route-${i}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#00f2ff"
                strokeWidth="0.5"
                strokeDasharray="2 2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: 1.5, delay: 1 + (i * 0.3) }}
              />
            );
          })}

          {/* Connectors for visualization */}
          <motion.polyline
            points={data.optimizedRoute.map(name => {
              const node = data.nodes.find(n => n.name === name);
              return node ? `${node.x},${node.y}` : '';
            }).join(' ')}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 1, ease: "easeInOut" }}
          />

          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2ff" />
              <stop offset="100%" stopColor="#9d00ff" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Nodes */}
          {data.nodes.map((node, i) => (
            <motion.g 
              key={node.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              onMouseEnter={() => setHoveredNode(node.name)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
            >
              <circle 
                cx={node.x} 
                cy={node.y} 
                r={node.type === 'hub' ? 3 : 2} 
                fill={node.type === 'hub' ? '#9d00ff' : '#00f2ff'} 
                className={hoveredNode === node.name ? 'filter-glow' : ''}
              />
              <motion.circle 
                cx={node.x} 
                cy={node.y} 
                r={node.type === 'hub' ? 6 : 4} 
                fill="none" 
                stroke={node.type === 'hub' ? '#9d00ff' : '#00f2ff'} 
                strokeWidth="0.2"
                animate={{ r: [node.type === 'hub' ? 6 : 4, node.type === 'hub' ? 10 : 8], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <text 
                x={node.x} 
                y={node.y + 6} 
                textAnchor="middle" 
                fill="white" 
                fontSize="3" 
                className="font-mono uppercase pointer-events-none"
              >
                {node.name}
              </text>
            </motion.g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-black/60 p-3 rounded-lg border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-quantum-secondary" />
            <span className="text-[8px] text-gray-400 font-mono uppercase tracking-widest">{t('hub')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-quantum-primary" />
            <span className="text-[8px] text-gray-400 font-mono uppercase tracking-widest">{t('deliveryPoint')}</span>
          </div>
        </div>

        {/* Node Hover Info */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-4 right-4 bg-black/80 border border-quantum-primary/30 p-3 rounded-lg backdrop-blur-lg z-20 w-48"
            >
              <h4 className="text-quantum-primary font-bold text-[10px] uppercase mb-1">{hoveredNode}</h4>
              <p className="text-[9px] text-gray-400 leading-tight">
                {data.nodes.find(n => n.name === hoveredNode)?.type === 'hub' 
                   ? t('hubDesc')
                   : t('deliveryDesc')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-quantum-primary/5 border border-quantum-primary/20 rounded-xl">
          <h4 className="flex items-center gap-2 text-[10px] font-bold text-quantum-primary uppercase mb-2">
            <Shield className="w-3.5 h-3.5" /> {t('routeAnalysis')}
          </h4>
          <p className="text-[11px] text-gray-300 leading-relaxed italic">
            {data.routeExplanation}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {data.optimizedRoute.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] text-white font-mono uppercase">
                {step}
              </span>
              {i < data.optimizedRoute.length - 1 && <ChevronRight className="w-3 h-3 text-gray-600" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InfoTooltip = ({ content }: { content: string }) => (
  <div className="group relative inline-block ml-1">
    <HelpCircle className="w-3 h-3 text-gray-500 hover:text-quantum-primary cursor-help transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 border border-white/10 rounded text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl backdrop-blur-md">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/90" />
    </div>
  </div>
);

const QuantumParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-quantum-primary/20 rounded-full"
        initial={{ 
          x: Math.random() * 100 + "%", 
          y: Math.random() * 100 + "%",
          opacity: 0 
        }}
        animate={{ 
          y: [null, "-10%", "110%"],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: Math.random() * 10 + 5, 
          repeat: Infinity, 
          ease: "linear",
          delay: Math.random() * 5
        }}
      />
    ))}
  </div>
);
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Sector, SectorId, SimulationResult } from '../types';
import { generateQuantumStrategy } from '../services/quantumService';
import { ibmService, JobStatus } from '../services/ibmQuantumService';
import { useTranslation } from '../lib/TranslationContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Props {
  sector: Sector;
  onBack: () => void;
  onSectorChange?: (id: SectorId) => void;
  onOpenHelp?: () => void;
}

export default function QuantumDashboard({ sector, onBack, onSectorChange, onOpenHelp }: Props) {
  const { t, language } = useTranslation();
  const [mode, setMode] = useState<'File-Driven' | 'Manual' | 'Special' | null>(sector.isSpecial ? 'Special' : 'Manual');
  const [fileAssets, setFileAssets] = useState<string[]>([]);
  const [variables, setVariables] = useState(mode === 'File-Driven' ? fileAssets.length : 10);
  const [userPrompt, setUserPrompt] = useState("");
  const [assetQubits, setAssetQubits] = useState<Record<string, number>>({});
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState("2030-12-31");
  const [qubitsPerVar, setQubitsPerVar] = useState(2);
  const [assetVolatilities, setAssetVolatilities] = useState<Record<string, number>>({});
  const [globalVolatility, setGlobalVolatility] = useState(15);
  const [volatilityTarget, setVolatilityTarget] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<{ title: string; message: string; type: 'size' | 'format' | 'generic' } | null>(null);
  
  // Real Quantum Job State
  const [isRealQMode, setIsRealQMode] = useState(sector.id === 'realq');
  
  React.useEffect(() => {
    setIsRealQMode(sector.id === 'realq');
  }, [sector.id]);

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isSubmittingToIBM, setIsSubmittingToIBM] = useState(false);

  // Poll for job status if one is active
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJobId && jobStatus !== 'COMPLETED' && jobStatus !== 'FAILED') {
      interval = setInterval(async () => {
        const status = await ibmService.checkJobStatus(activeJobId);
        setJobStatus(status);
        if (status === 'COMPLETED') {
           // Basic notification simulation
           const notification = new Notification(t('notificationTitle'), {
             body: t('notificationBody')
           });
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeJobId, jobStatus]);

  const MAX_TOTAL_QUBITS = 30;
  const parseAssets = (input: string) => {
    // Delimiters: comma, ampersand, ' e ', ' and ', or multiple spaces
    return input
      .split(/[,&]|\s+e\s+|\s+and\s+|\s{2,}/i)
      .map(a => a.trim())
      .filter(a => a.length > 0);
  };
  const currentAssets = parseAssets(userPrompt);
  const totalQubitsUsed = mode === 'Manual' 
    ? currentAssets.reduce((sum, name) => sum + (assetQubits[name] || qubitsPerVar), 0)
    : (variables * qubitsPerVar);
  const allAvailableAssets = mode === 'Manual' ? currentAssets : fileAssets;

  const handleSimulate = async () => {
    let finalVariables = variables;
    let manualAssets: string[] = [];
    let finalQubits = qubitsPerVar;

    if (mode === 'Manual') {
      manualAssets = currentAssets;
      
      if (manualAssets.length === 0) {
        setError(t('manualError') || "Inserisci almeno un asset nel prompt (es. Asset1, Asset2).");
        return;
      }

      if (manualAssets.length > 10) {
        setError(t('limit10Error'));
        return;
      }

      if (totalQubitsUsed > MAX_TOTAL_QUBITS) {
        setError(t('qubitLimitError').replace('{used}', totalQubitsUsed.toString()).replace('{max}', MAX_TOTAL_QUBITS.toString()));
        return;
      }
      
      finalVariables = manualAssets.length;
      // Calculate average qubits per var to keep service compatibility
      finalQubits = Math.max(1, Math.round(totalQubitsUsed / manualAssets.length));
    }
    
    if (finalVariables > 50) {
      setError(t('variableLimitError'));
      return;
    }
    
    setError(null);
    setResult(null); // Clear previous result for re-animation
    setIsSimulating(true);
    
    // Construct time horizon string
    const range = t('analysisDates').replace('{start}', startDate).replace('{end}', endDate);

    const data = await generateQuantumStrategy(
      sector.id, 
      finalVariables, 
      totalQubitsUsed, 
      mode || 'Manual', 
      t(`s_${sector.id}_stress`),
      mode === 'Manual' ? manualAssets.join(', ') : undefined,
      mode === 'Manual' ? range : undefined,
      allAvailableAssets.length > 0 ? assetVolatilities : globalVolatility,
      volatilityTarget,
      language // Pass the current language code
    );
    
    // Add a small artificial delay to show the beautiful loader
    setTimeout(() => {
      setResult(data);
      setIsSimulating(false);
    }, 2000);
  };

  const handleIBMSubmit = async () => {
    if (!result) return;
    setIsSubmittingToIBM(true);
    try {
      // Create a dummy OpenQASM circuit based on the result
      const qasm = `OPENQASM 2.0; include "qelib1.inc"; qreg q[${result.configSummary.totalQubits}]; creg c[${result.configSummary.totalQubits}]; h q[0]; cx q[0], q[1]; measure q -> c;`;
      const jobId = await ibmService.submitJob(qasm);
      setActiveJobId(jobId);
      setJobStatus('PENDING');
      
      // Request notifications if supported
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    } catch (err) {
      setError(t('ibmError'));
    } finally {
      setIsSubmittingToIBM(false);
    }
  };

  const downloadReport = async () => {
    if (!result) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(10, 10, 11);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(t('pdfReportTitle'), 15, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t(`s_${sector.id}_name`).toUpperCase()} ${t('pdfAnalysis')}`, 15, 33);
    doc.text(`${t('pdfGenerated')}: ${new Date().toLocaleString()}`, pageWidth - 15, 33, { align: 'right' });

    // Section: Quantum KPIs
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(t('pdfKpiTitle'), 15, 55);
    doc.setDrawColor(0, 242, 255);
    doc.setLineWidth(1);
    doc.line(15, 58, 40, 58);

    const kpiData = [
      [t('pdfMetric'), t('pdfValue'), t('pdfContext')],
      [t('pdfConfidence'), `${result.quantumConfidence}%`, t('pdfConfidenceDesc')],
      [t('pdfGain'), `+${result.comparison.improvement}%`, t('pdfGainDesc')],
      [t('pdfFidelity'), `${result.fidelity}%`, t('pdfFidelityDesc')],
      [t('pdfSpeedup'), `${result.speedup}x`, t('pdfSpeedupDesc')]
    ];

    autoTable(doc, {
      startY: 65,
      head: [kpiData[0]],
      body: kpiData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [0, 242, 255], textColor: [0, 0, 0] },
      styles: { fontSize: 10 }
    });

    // Section: Matrix
    const matrixY = (doc as any).lastAutoTable.finalY + 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(t('pdfMatrixTitle'), 15, matrixY);
    doc.line(15, matrixY + 3, 40, matrixY + 3);

    const matrixData = result.matrix.map(a => [a.name, `${a.weight}%`, a.insight]);
    
    autoTable(doc, {
      startY: matrixY + 10,
      head: [[t('pdfAsset'), t('pdfWeight'), t('pdfInsight')]],
      body: matrixData,
      theme: 'striped',
      headStyles: { fillColor: [157, 0, 255], textColor: [255, 255, 255] },
      styles: { fontSize: 9 }
    });

    // Footer
    const finalFooterY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(t('pdfFooter'), pageWidth / 2, finalFooterY, { align: 'center' });

    doc.save(`Quantum_Report_${sector.id}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = async (file: File | undefined) => {
    if (!file) return;

        // 1. File size check (Max 5MB)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          setFileError({
            title: t('fileSizeError'),
            message: t('fileSizeMessage'),
            type: 'size'
          });
          return;
        }
    
        // 2. Extension check
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension !== 'csv' && extension !== 'json') {
          setFileError({
            title: t('unsupportedFormat'),
            message: t('unsupportedFormatMessage'),
            type: 'format'
          });
          return;
        }

    setIsSimulating(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lowerContent = content.toLowerCase();
      
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      
        if (extension === 'csv' && lines.length > 0) {
          const firstLineCols = lines[0].split(',').length;
          const isInconsistent = lines.slice(1, 5).some(line => line.split(',').length !== firstLineCols);
          
          if (isInconsistent || firstLineCols < 1) {
            setIsSimulating(false);
            setFileError({
              title: t('inconsistentData'),
              message: t('inconsistentDataMessage'),
              type: 'format'
            });
            return;
          }
        }

      const hasHeaders = lowerContent.includes('price') || lowerContent.includes('asset name') || lowerContent.includes('nome');
      
        setTimeout(() => {
          if (!hasHeaders && mode === 'File-Driven') {
             setError(t('missingColumns'));
             setIsSimulating(false);
             return;
          }
  
          setFileName(file.name);
          
          // Extract up to 10 asset names for the textarea
          const names = lines.slice(1, 11).map(line => {
            const parts = line.split(',');
            return parts[0].replace(/"/g, '').trim();
          }).filter(n => n.length > 0);
          
          if (names.length === 0) {
            setIsSimulating(false);
            setFileError({
              title: t('noDataFound'),
              message: t('noDataFoundMessage'),
              type: 'generic'
            });
            return;
          }

        if (mode === null) {
          setFileAssets(names);
          setMode('File-Driven');
        } else {
          setUserPrompt(names.join(', '));
        }
        setIsSimulating(false);
      }, 1500);
    };
    
      reader.onerror = () => {
        setIsSimulating(false);
        setFileError({
          title: t('fileReadError') || "Errore Lettura",
          message: t('fileReadMessage') || "Si è verificato un errore durante la lettura del file. Potrebbe essere danneggiato.",
          type: 'generic'
        });
      };

    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const resetSelection = () => {
    onBack();
  };

  // Remove intermediate screen
  
  return (
    <div className="min-h-screen p-3 sm:p-6 max-w-screen-2xl mx-auto pb-32">
      <nav className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 sm:mb-8 gap-3 sm:gap-0">
        <button 
          onClick={resetSelection}
          className="flex items-center gap-2 text-gray-400 hover:text-quantum-primary transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 h-5" />
          <span className="font-mono text-[10px] sm:text-sm tracking-widest uppercase">{t('back')}</span>
        </button>
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 bg-black/20 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-white/5 sm:border-none">
          <button 
            id="dashboard-help-btn"
            onClick={() => onOpenHelp ? onOpenHelp() : (onSectorChange ? onSectorChange('realq') : null)}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors py-1 group cursor-pointer"
            title="Help Center & Guide"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-mono text-[10px] sm:text-xs tracking-widest uppercase hidden md:inline">HELP</span>
          </button>
          {activeJobId && (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }}
              className={`flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full ${
                sector.id === 'realq' ? 'bg-red-500/20 border border-red-500/30' : 'bg-purple-500/20 border border-purple-500/30'
              }`}
            >
              <Cpu className={`w-2.5 h-2.5 sm:w-3 h-3 animate-pulse ${
                sector.id === 'realq' ? 'text-red-500' : 'text-purple-400'
              }`} />
              <span className={`font-mono text-[8px] sm:text-[10px] uppercase ${
                sector.id === 'realq' ? 'text-red-500' : 'text-purple-400'
              }`}>{t('realqActive')}</span>
            </motion.div>
          )}
        </div>
      </nav>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 items-start">
        {/* Sidebar Controls */}
        {!sector.isSpecial && sector.id !== 'quantumbi' && sector.id !== 'finance' && sector.id !== 'insurance' && (
          <div className="xl:col-span-1 space-y-4 sm:space-y-6 lg:sticky lg:top-6">
            <div className="quantum-card">
              <h3 className="flex items-center gap-2 text-white font-display font-semibold mb-3 sm:mb-6 uppercase tracking-wider text-[11px] sm:text-sm">
                <Settings className="w-4 h-4 sm:w-5 h-5 text-quantum-primary" />
                {t('controlPanel')}
              </h3>
                              <div className="space-y-6 sm:space-y-8">
                  {mode === 'File-Driven' && (
                    <div className="p-3 sm:p-4 bg-quantum-primary/5 border border-quantum-primary/20 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] sm:text-[10px] font-mono text-gray-500 uppercase">{t('fileLoaded')}</span>
                        <FileText className="w-3 h-3 text-quantum-primary" />
                      </div>
                      <p className="text-[11px] sm:text-xs text-white font-medium truncate">{fileName}</p>
                      <p className="text-[8px] sm:text-[9px] text-quantum-primary uppercase mt-1 font-mono">{t('datiCrossReferenced')}</p>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-red-200">{error}</p>
                    </div>
                  )}

                  {mode === 'Manual' ? (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] items-start sm:items-center font-mono text-[9px] uppercase text-gray-400 mb-2 gap-3 sm:gap-4">
                            <span className="max-w-[150px] sm:max-w-[100px] leading-tight">
                              {t(`s_${sector.id}_vlabel`)} ({t('max10')})
                            </span>
                            
                            <div className="flex justify-start sm:justify-center w-full sm:w-auto">
                              <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-quantum-primary/10 hover:bg-quantum-primary/20 border border-quantum-primary/30 hover:border-quantum-primary/50 rounded-full transition-all group shadow-[0_0_15px_rgba(0,242,255,0.1)]"
                                title={t('uploadFromCsv')}
                              >
                                <Upload className="w-3.5 h-3.5 text-quantum-primary group-hover:scale-110 transition-transform" />
                                <div className="flex flex-col items-start leading-none text-[7px] sm:text-[8px]">
                                  <span className="text-quantum-primary font-bold tracking-widest">{t('upload')}</span>
                                  <span className="text-quantum-primary/80 font-bold tracking-widest">{t('csv')}</span>
                                </div>
                              </button>
                              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".csv,.json" />
                            </div>
                            
                            <div className={`text-[8px] sm:text-[9px] font-bold font-mono transition-colors flex flex-col items-start sm:items-end leading-tight w-full sm:w-auto ${
                              currentAssets.length > 10 || totalQubitsUsed > MAX_TOTAL_QUBITS ? 'text-red-500' : 'text-quantum-primary/80'
                            }`}>
                              <span>{t('assetLabel')}: {currentAssets.length}/10</span>
                              <span>{t('qubitLabel')}: {totalQubitsUsed}/{MAX_TOTAL_QUBITS}</span>
                            </div>
                          </label>
                          
                          <div className="hidden">
                            <textarea
                              value={userPrompt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setUserPrompt(val);
                                // Cleanup assetQubits for removed assets
                                const newAssets = parseAssets(val);
                                const updatedQubits = { ...assetQubits };
                                Object.keys(updatedQubits).forEach(k => {
                                  if (!newAssets.includes(k)) delete updatedQubits[k];
                                });
                                setAssetQubits(updatedQubits);
                              }}
                            />
                          </div>

                          {currentAssets.length > 0 && (
                            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                              <p className="text-[8px] font-mono text-gray-500 uppercase mb-2">{t('individualDistribution')}</p>
                              {currentAssets.map((asset, idx) => (
                                <div key={`${asset}-${idx}`} className="flex flex-col gap-2 p-3 bg-white/5 border border-white/10 rounded-lg group hover:border-quantum-primary/30 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-white font-medium truncate max-w-[120px]">{asset}</span>
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => {
                                          const currentVal = assetQubits[asset] || qubitsPerVar;
                                          if (currentVal > 1) {
                                            setAssetQubits({ ...assetQubits, [asset]: currentVal - 1 });
                                          }
                                        }}
                                        className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-400 transition-colors hover:text-white"
                                      >
                                        -
                                      </button>
                                      <span className="text-[10px] font-mono text-quantum-primary w-4 text-center">{assetQubits[asset] || qubitsPerVar}</span>
                                      <button 
                                        disabled={totalQubitsUsed >= MAX_TOTAL_QUBITS}
                                        onClick={() => {
                                          const currentVal = assetQubits[asset] || qubitsPerVar;
                                          if (totalQubitsUsed < MAX_TOTAL_QUBITS) {
                                            setAssetQubits({ ...assetQubits, [asset]: currentVal + 1 });
                                          }
                                        }}
                                        className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:text-white"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1.5 mt-1 border-t border-white/5 pt-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{t('volatilityTitle')}</span>
                                      <span className="text-[9px] font-bold text-quantum-primary">{assetVolatilities[asset] ?? 15}%</span>
                                    </div>
                                    <input 
                                      type="range" min="0" max="100" step="1"
                                      value={assetVolatilities[asset] ?? 15}
                                      onChange={(e) => setAssetVolatilities({
                                        ...assetVolatilities,
                                        [asset]: parseInt(e.target.value)
                                      })}
                                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-quantum-primary"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-2 p-2 bg-quantum-primary/5 border border-quantum-primary/20 rounded flex items-start gap-2">
                            <Zap className="w-3 h-3 text-quantum-primary shrink-0 mt-0.5" />
                            <p className="text-[9px] text-gray-400 italic">
                              <strong>{t('distributionTitle')}:</strong> {t('distributionDesc')}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <label className="flex justify-between font-mono text-[9px] uppercase text-gray-400">
                            <span>{t('analysisHorizon')}</span>
                            <span className="text-quantum-primary text-[9px] font-bold font-mono">{t('dates')}</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white focus:border-quantum-primary transition-colors color-scheme-dark"
                            />
                            <input 
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white focus:border-quantum-primary transition-colors color-scheme-dark"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="flex justify-between font-mono text-[10px] uppercase text-gray-400 mb-2">
                        <span>{t('numberOf').replace('{label}', t(`s_${sector.id}_vlabel`))}</span>
                        <span className={variables > 50 ? 'text-red-500' : 'text-quantum-primary font-bold'}>
                          {variables} / 50
                        </span>
                      </label>
                      <input 
                        type="range" min="1" max={variables} step="1"
                        disabled={true}
                        value={variables}
                        onChange={(e) => setVariables(parseInt(e.target.value))}
                        className="w-full h-1 bg-quantum-border rounded-lg appearance-none cursor-not-allowed opacity-50"
                      />
                      <div className="flex justify-between mt-1 px-0.5">
                        <span className="text-[8px] text-gray-700 italic">{t('fileLockedSuggestion')}</span>
                      </div>
                    </div>
                  )}

                  {mode !== 'Manual' && (
                    <div>
                      <label className="flex justify-between font-mono text-[10px] uppercase text-gray-400 mb-2">
                        <span>{t('qubitsPer').replace('{label}', t(`s_${sector.id}_vlabel`).toLowerCase())}</span>
                        <span className="text-quantum-primary">{qubitsPerVar} / 4</span>
                      </label>
                      <input 
                        type="range" min="1" max="4" step="1"
                        value={qubitsPerVar}
                        onChange={(e) => setQubitsPerVar(parseInt(e.target.value))}
                        className="w-full h-1 bg-quantum-border rounded-lg appearance-none cursor-pointer accent-quantum-primary"
                      />
                      <div className="flex justify-between mt-2 px-1">
                        <span className="text-[8px] text-gray-600 font-mono">1 ({t('binary')})</span>
                        <span className="text-[8px] text-gray-600 font-mono">4 ({t('granular')})</span>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    className={`w-full btn-quantum flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs font-bold ${
                      sector.id === 'realq' ? 'from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse' : ''
                    }`}
                  >
                    {isSimulating ? (
                      <Activity className="w-5 h-5 animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5 fill-current" />
                    )}
                    {isSimulating ? t('loading').toUpperCase() : t('simulate')}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Main Simulation Area */}
        <div className={(sector.isSpecial || sector.id === 'quantumbi' || sector.id === 'finance' || sector.id === 'insurance') ? "xl:col-span-4" : "xl:col-span-3"}>
          <AnimatePresence mode="wait">
            {sector.id === 'translator' ? (
              <motion.div
                key="translator"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <QuantumTranslator />
              </motion.div>
            ) : sector.id === 'mitigation' ? (
              <motion.div
                key="mitigation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <OptimizeDenoise />
              </motion.div>
            ) : sector.id === 'crosscode' ? (
              <motion.div
                key="crosscode"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <CrossCode onSwitchToBI={() => onSectorChange?.('quantumbi')} />
              </motion.div>

            ) : (sector.id === 'quantumbi' || sector.id === 'finance' || sector.id === 'insurance') ? (
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <QuantumBI sectorId={sector.id} />
              </motion.div>
            ) : sector.id === 'pqc_locker' ? (
              <motion.div
                key="pqc_locker"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <QuantumLocker />
              </motion.div>
            ) : sector.id === 'pqc_keygen' ? (
              <motion.div
                key="pqc_keygen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <QuantumKeyGen />
              </motion.div>
            ) : sector.id === 'pqc_chat' ? (
              <motion.div
                key="pqc_chat"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <QuantumChat />
              </motion.div>
            ) : sector.id === 'large' ? (
              <motion.div
                key="large"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <LargeQuantumInterface />
              </motion.div>
            ) : sector.id === 'various' ? (
              <motion.div
                key="various"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <VariousQuantumInterface onBack={onBack} />
              </motion.div>
            ) : isSimulating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[600px] flex flex-col items-center justify-center quantum-card border-quantum-primary/30 relative overflow-hidden"
              >
                {/* Background Animation Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-quantum-primary/5 blur-[120px] rounded-full animate-pulse" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative w-40 h-40 mb-12">
                    {/* Rotating Rings */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-dashed border-quantum-primary/30 rounded-full"
                    />
                    <motion.div 
                      animate={{ rotate: -360 }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-4 border border-quantum-secondary/40 rounded-full"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-12 bg-quantum-primary/20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,242,255,0.4)]"
                    >
                      <Zap className="w-8 h-8 text-quantum-primary fill-quantum-primary animate-pulse" />
                    </motion.div>
                  </div>

                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-display font-medium text-white uppercase tracking-[0.3em] animate-pulse">
                      {t('quantumSimulation')}
                    </h3>
                    <div className="flex flex-col items-center gap-2">
                       <p className="text-[10px] font-mono text-quantum-primary/70 uppercase">
                         {t('engagingQubits').replace('{count}', totalQubitsUsed.toString())}
                       </p>
                       <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="h-full w-1/3 bg-gradient-to-r from-transparent via-quantum-primary to-transparent"
                          />
                       </div>
                    </div>
                    <div className="mt-8 px-4 py-1.5 rounded-full border border-purple-500/10 bg-purple-500/5 flex items-center gap-2">
                       <Cpu className="w-2.5 h-2.5 text-purple-400" />
                       <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest">{t('realqActiveInfra')}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Log Feed */}
                <div className="absolute bottom-8 left-8 right-8 h-20 overflow-hidden opacity-30 font-mono text-[9px] text-quantum-secondary">
                  <motion.div
                    animate={{ y: [0, -100] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="space-y-1"
                  >
                    <p>QUANTUM_CORE_PROCESSED_DATA_PACKET_091...</p>
                    <p>EXECUTING_QAOA_ALGORITHM_LAYER_04...</p>
                    <p>RESOLVING_ENTANGLEMENT_FOR_{variables}_ASSETS...</p>
                    <p>ERROR_CORRECTION_APPLIED_GATE_X_Y...</p>
                    <p>CALCULATING_PROBABILITY_AMPLITUDES...</p>
                    <p>NORMALIZING_STATE_VECTORS...</p>
                    <p>STRESS_TESTING_UNDER_{t(`s_${sector.id}_stress`).replace(/ /g, "_")}...</p>
                  </motion.div>
                </div>
              </motion.div>
            ) : !result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center min-h-[600px] border border-dashed border-quantum-border rounded-2xl bg-black/20"
              >
                <div className="relative mb-2">
                  <div className="absolute inset-0 bg-quantum-primary/10 blur-[80px] rounded-full" />
                  <Cpu className="relative w-16 h-16 text-quantum-primary/20" />
                </div>
                {sector.id === 'realq' ? (
                <div className="max-w-3xl text-center space-y-6 px-6">
                    <div className="space-y-4">
                      <p className="text-xs md:text-sm font-mono text-gray-400 leading-relaxed uppercase tracking-tighter sm:tracking-normal whitespace-pre-line">
                        {t('s_realq_intro')}
                      </p>
                    </div>
                    
                    <div className="max-w-lg mx-auto space-y-4 pt-4">
                      <div className="text-left space-y-2">
                        <label className="text-[8px] font-mono text-gray-500 uppercase tracking-widest ml-1">{t('problemRequest')}</label>
                        <textarea 
                          placeholder={t('problemPlaceholder')}
                          className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xs placeholder:text-gray-600 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all resize-none shadow-inner"
                        />
                      </div>
                      
                      <div className="p-1 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row gap-2">
                        <input 
                          type="email" 
                          placeholder={t('emailPlaceholder')}
                          className="flex-1 bg-transparent border-none focus:ring-0 text-white text-xs px-4 py-3 placeholder:text-gray-600"
                        />
                        <button 
                          onClick={() => alert(t('requestSent'))}
                          className="bg-red-500 hover:bg-red-400 text-white text-[10px] font-bold uppercase tracking-widest px-8 py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] whitespace-nowrap"
                        >
                          {t('send')}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <h3 className="text-2xl font-display font-medium text-gray-600 uppercase tracking-tighter">
                    {t('readyForProcessing')} {t(`s_${sector.id}_name`)}
                  </h3>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                className="space-y-6 relative"
              >
                <QuantumParticles />
                
                {/* Header Action Bar */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}
                  className="flex flex-col sm:flex-row justify-between items-center bg-white/[0.03] border border-white/10 p-4 rounded-xl backdrop-blur-sm shadow-2xl gap-4 sm:gap-0"
                >
                  <div className="flex items-center gap-3 text-white w-full sm:w-auto">
                    <div className="p-2 bg-quantum-primary/20 rounded-lg relative">
                      <TrendingUp className="w-5 h-5 text-quantum-primary" />
                      {jobStatus === 'COMPLETED' && (
                        <motion.div 
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" 
                        />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-display font-semibold uppercase tracking-wider">{t('strategyResults')}</h2>
                        {activeJobId && (
                           <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                             jobStatus === 'COMPLETED' ? 'bg-green-500/20 text-green-500' : 
                             jobStatus === 'FAILED' ? 'bg-red-500/20 text-red-500' : 
                             'bg-blue-500/20 text-blue-500 animate-pulse'
                           }`}>
                             RealQ: {t(jobStatus.toLowerCase())}
                           </div>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono uppercase">
                        {activeJobId ? `${t('jobID')} IBM: ${activeJobId}` : `${t('batchID')}: Q-BRAVO-NERO-119`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button 
                      onClick={handleIBMSubmit}
                      disabled={isSubmittingToIBM || !!activeJobId}
                      className={`flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold font-mono rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed
                        ${isRealQMode 
                          ? (sector.id === 'realq' 
                              ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:bg-red-400 animate-pulse' 
                              : 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:bg-purple-400') 
                          : 'bg-quantum-surface border border-quantum-primary/30 text-quantum-primary hover:bg-quantum-primary/10'}`}
                    >
                      <Cpu className={`w-4 h-4 ${isSubmittingToIBM ? 'animate-spin' : ''}`} />
                      {activeJobId ? t('jobSent') : (isRealQMode ? t('executeOnIbm') : t('activate_realq'))}
                    </button>
                    <button 
                      onClick={downloadReport}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-xs font-bold font-mono rounded hover:bg-quantum-primary hover:text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      {t('reportPdf')}
                    </button>
                  </div>
                </motion.div>

                {/* System Configuration Summary */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3"
                >
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white/[0.03] border border-white/5 rounded-lg flex flex-col">
                    <span className="text-[8px] sm:text-[10px] font-mono text-gray-500 uppercase">{t('mode')}</span>
                    <span className="text-xs sm:text-sm font-bold text-quantum-primary truncate">{t(result.configSummary.mode.toLowerCase())}</span>
                  </div>
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white/[0.03] border border-white/5 rounded-lg flex flex-col">
                    <span className="text-[8px] sm:text-[10px] font-mono text-gray-500 uppercase">{t('activeAssets')}</span>
                    <span className="text-xs sm:text-sm font-bold text-white">{result.configSummary.activeAssets}</span>
                  </div>
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white/[0.03] border border-white/5 rounded-lg flex flex-col col-span-2 sm:col-span-1">
                    <span className="text-[8px] sm:text-[10px] font-mono text-gray-500 uppercase">{t('totalQubits')}</span>
                    <span className="text-xs sm:text-sm font-bold text-quantum-secondary">{result.configSummary.totalQubits}</span>
                  </div>
                </motion.div>

                {/* Header Stats */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                >
                  <div className="quantum-card border-l-4 border-l-quantum-primary bg-black/40 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-mono text-[10px] uppercase text-gray-400">
                         {t('quantumConfidenceLabel')}
                         <InfoTooltip content={t('confidenceDesc')} />
                       </span>
                       <CheckCircle2 className="w-4 h-4 text-quantum-primary" />
                    </div>
                    <div className="text-3xl font-display font-bold text-white mb-1">
                      {result.quantumConfidence}%
                    </div>
                    <div className="h-1 w-full bg-quantum-border rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${result.quantumConfidence}%` }} 
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-quantum-primary shadow-[0_0_10px_rgba(0,242,255,0.5)]" 
                      />
                    </div>
                  </div>

                  <div className="quantum-card border-l-4 border-l-quantum-secondary bg-black/40 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-mono text-[10px] uppercase text-gray-400">
                         {t('recommendedAlgorithm')}
                       </span>
                       <Zap className="w-4 h-4 text-quantum-secondary" />
                    </div>
                    <div className="text-2xl font-display font-bold text-white mb-1">
                      {result.recommendedAlgorithm}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-tighter">
                      {t('optimizedVia')}
                    </div>
                  </div>

                  <div className="quantum-card border-l-4 border-l-green-500 bg-black/40 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-mono text-[10px] uppercase text-gray-400">
                         {t('quantumGainLabel')}
                         <InfoTooltip content={t('gainDesc')} />
                       </span>
                       <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-3xl font-display font-bold text-white mb-1">
                      +{result.comparison.improvement}%
                    </div>
                    <div className="text-[10px] text-green-500/70 uppercase tracking-tighter">
                      {t('gainIncrease')}
                    </div>
                  </div>
                </motion.div>

                {/* CENTER SECTION: Comparison & Logistics */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Logistics Map (Conditional) */}
                  {sector.id === 'logistics' && result.logisticsData ? (
                    <div className="md:col-span-2">
                      <LogisticsMap data={result.logisticsData} />
                    </div>
                  ) : null}

                  {/* Comparison: Classical vs Quantum */}
                  <div className="quantum-card bg-gradient-to-br from-quantum-surface to-black/40 md:col-span-2">
                    <h3 className="flex items-center gap-2 text-white font-display font-semibold mb-6">
                      <BarChart2 className="w-5 h-5 text-quantum-primary" />
                      {t('quantumBenchmark')}
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-gray-500 uppercase tracking-wider">{result.comparison.classical.label}</span>
                            <span className="text-gray-300">{result.comparison.classical.value}{result.comparison.classical.unit}</span>
                          </div>
                          <div className="h-4 w-full bg-gray-800 rounded-lg overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${result.comparison.classical.value}%` }}
                              transition={{ duration: 1 }}
                              className="h-full bg-gray-500/40"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-quantum-primary uppercase tracking-wider">{result.comparison.quantum.label}</span>
                            <span className="text-white font-bold">{result.comparison.quantum.value}{result.comparison.quantum.unit}</span>
                          </div>
                          <div className="h-8 w-full bg-quantum-primary/10 rounded-lg overflow-hidden border border-quantum-primary/30 relative">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${result.comparison.quantum.value}%` }}
                              transition={{ duration: 1.2, delay: 0.3 }}
                              className="h-full bg-gradient-to-r from-quantum-primary to-quantum-secondary"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-[10px] font-bold text-quantum-bg uppercase tracking-[0.2em] mix-blend-overlay">{t('quantumAdvantage')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                         <p className="text-xs text-gray-400 leading-relaxed italic">
                           {t('benchmarkNote').replace('{value}', result.comparison.quantum.value.toString()).replace('{event}', t(`s_${sector.id}_stress`))}
                         </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* DEEP INSIGHTS SECTION */}
                {result.deepInsights && result.deepInsights.length > 0 && (
                  <motion.div 
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
                    {result.deepInsights.map((insight, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        className="quantum-card bg-gradient-to-br from-quantum-surface/30 to-black/60 border-white/5 h-full"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          {insight.type === 'volatility' && <Zap className="w-4 h-4 text-orange-400" />}
                          {insight.type === 'confidence' && <Search className="w-4 h-4 text-quantum-primary" />}
                          {insight.type === 'protection' && <Shield className="w-4 h-4 text-quantum-secondary" />}
                          {insight.type === 'resolution' && <Cpu className="w-4 h-4 text-purple-400" />}
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-tighter">{insight.label}</h4>
                        </div>
                        <div className="text-lg font-display font-bold text-white mb-2">{insight.value}</div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          {insight.description}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* BOTTOM SECTION: Matrix & KPI */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-6"
                >
                  {/* Optimized Matrix */}
                  <div className="quantum-card bg-black/40 backdrop-blur-md">
                    <h3 className="flex items-center gap-2 text-white font-display font-semibold mb-6 uppercase tracking-wider text-sm">
                      <Layers className="w-5 h-5 text-quantum-primary" />
                      {t('optimizationMatrix')}
                      <InfoTooltip content={t('optimizationMatrixDesc')} />
                    </h3>
                    <div className="space-y-3">
                      {result.matrix.map((item, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (i * 0.1) }}
                          className="flex flex-col gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/5 transition-all duration-300 hover:bg-white/[0.05] hover:-translate-y-1"
                        >
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-200">{item.name}</span>
                            <span className="font-mono text-quantum-primary font-bold">{item.weight}%</span>
                          </div>
                          <div className="w-full bg-quantum-border h-1 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.weight}%` }}
                              transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                              className="h-full bg-gradient-to-r from-quantum-primary to-quantum-secondary"
                            />
                          </div>
                          <div className="flex items-start gap-2 mt-1">
                            <Info className="w-3 h-3 text-quantum-primary shrink-0 mt-0.5" />
                            <p className="text-[10px] text-gray-500 leading-tight">
                              {item.insight}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Visualization & Additional KPIs */}
                  <div className="quantum-card bg-black/40 backdrop-blur-md flex flex-col">
                    <h3 className="flex items-center gap-2 text-white font-display font-semibold mb-6 uppercase tracking-wider text-sm">
                      <Activity className="w-5 h-5 text-quantum-secondary" />
                      {t('kpiVisualization')}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <motion.div whileHover={{ scale: 1.05 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">{t('quantumFidelity')}</span>
                        <div className="text-2xl font-bold text-white">{result.fidelity}%</div>
                        <p className="text-[8px] text-gray-600 mt-1 uppercase text-left">{t('dataPrecision')}</p>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">{t('quantumGainLabel')}</span>
                        <div className="text-2xl font-bold text-quantum-secondary">+{result.comparison.improvement}{result.comparison.quantum.unit}</div>
                        <p className="text-[8px] text-gray-600 mt-1 uppercase text-left">{t('advantage')}</p>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">{t('speedup')}</span>
                        <div className="text-2xl font-bold text-quantum-primary">{result.speedup}x</div>
                        <p className="text-[8px] text-gray-600 mt-1 uppercase text-left">{t('vsClassical')}</p>
                      </motion.div>
                    </div>

                    <div className="flex-1 min-h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.matrix}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="#555" 
                            fontSize={10} 
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#555" 
                            fontSize={10} 
                            tickLine={false}
                            axisLine={false}
                            unit="%"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0A0A0B', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              fontSize: '11px'
                            }}
                          />
                          <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                            {result.matrix.map((_, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={index % 2 === 0 ? '#00f2ff' : '#9d00ff'} 
                                fillOpacity={0.8}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* File Upload Error Modal */}
      <AnimatePresence>
        {fileError && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFileError(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 pb-0 flex justify-between items-start">
                <div className={`p-3 rounded-xl bg-opacity-10 mb-4 ${
                  fileError.type === 'size' ? 'bg-amber-500 text-amber-500' : 
                  fileError.type === 'format' ? 'bg-red-500 text-red-500' : 'bg-quantum-primary text-quantum-primary'
                }`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => setFileError(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <Zap className="w-5 h-5 rotate-45" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 pb-8">
                <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-tight">
                  {fileError.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {fileError.message}
                </p>
                
                <div className="mt-8 p-4 bg-white/5 border border-white/5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">{t('systemSuggestion')}</p>
                  <p className="text-xs text-gray-400">
                    {fileError.type === 'size' ? t('sizeSuggestion') : 
                     fileError.type === 'format' ? t('formatSuggestion') :
                     t('genericSuggestion')}
                  </p>
                </div>

                <button 
                  onClick={() => setFileError(null)}
                  className="w-full mt-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-quantum-primary hover:text-black transition-all"
                >
                  {t('iUnderstand')}
                </button>
              </div>
              
              {/* Bottom accent bar */}
              <div className={`h-1.5 w-full ${
                fileError.type === 'size' ? 'bg-amber-500' : 
                fileError.type === 'format' ? 'bg-red-500' : 'bg-quantum-primary'
              }`} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
