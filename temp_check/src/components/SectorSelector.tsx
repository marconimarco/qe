import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Landmark, 
  ShieldCheck, 
  Truck, 
  Zap, 
  Rss, 
  Factory, 
  Cpu, 
  Languages, 
  Wand2, 
  Terminal, 
  TableProperties, 
  Code2,
  Lock,
  Key,
  MessageSquare,
  HelpCircle,
  LucideIcon,
  ArrowLeft,
  Globe
} from 'lucide-react';
import { SECTORS, SectorId, Sector } from '../types';
import { useTranslation } from '../lib/TranslationContext';

const ICON_MAP: Record<string, LucideIcon> = {
  Landmark,
  ShieldCheck,
  Truck,
  Zap,
  Rss,
  Factory,
  Cpu,
  Languages,
  Wand2,
  Terminal,
  TableProperties,
  Code2,
  Lock,
  Key,
  MessageSquare,
  HelpCircle,
  Globe,
};

interface Props {
  onSelect: (id: SectorId) => void;
  initialSubMenu?: SectorId | null;
  onSubMenuToggle?: (isSub: boolean) => void;
  onOpenAgents?: () => void;
  onOpenIbm?: () => void;
  onOpenHelp?: () => void;
}

export default function SectorSelector({ onSelect, initialSubMenu = null, onSubMenuToggle, onOpenAgents, onOpenIbm, onOpenHelp }: Props) {
  const { t, language } = useTranslation();
  const [activeSubMenu, setActiveSubMenu] = useState<SectorId | null>(initialSubMenu);

  const [sectorRotationIndex, setSectorRotationIndex] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSectorRotationIndex(prev => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const cyclingSectors = [
    { name: "Banking", iconId: "Landmark", id: "finance" },
    { name: "Insurance", iconId: "ShieldCheck", id: "insurance" },
    { name: "Logistics", iconId: "Truck", id: "logistics" },
    { name: "Telecommunications", iconId: "Rss", id: "telecom" },
    { name: "Manufacturing", iconId: "Factory", id: "manufacturing" },
    { name: "Energy", iconId: "Zap", id: "energy" },
  ];

  const currentCycling = cyclingSectors[sectorRotationIndex % cyclingSectors.length];

  React.useEffect(() => {
    setActiveSubMenu(initialSubMenu);
  }, [initialSubMenu]);

  // Grouping logic
  const quantumCodeGroupIds: SectorId[] = ['crosscode', 'translator'];
  const pqcGroupIds: SectorId[] = ['pqc_locker', 'pqc_keygen', 'pqc_chat'];
  const subMenuIds: SectorId[] = [...quantumCodeGroupIds, ...pqcGroupIds];
  
  const excludedSectors = ['energy', 'manufacturing', 'telecom', 'logistics', 'insurance', 'finance'];
  const mainSectors = SECTORS.filter(s => 
    !subMenuIds.includes(s.id) && 
    !excludedSectors.includes(s.id) && 
    s.id !== 'quantumbi' &&
    s.id !== 'various' &&
    s.id !== 'large' &&
    s.id !== 'quantum_code'
  );
  
  const getSubSectors = () => {
    if (activeSubMenu === 'quantum_code') return SECTORS.filter(s => quantumCodeGroupIds.includes(s.id));
    if (activeSubMenu === 'pqc_group') return SECTORS.filter(s => pqcGroupIds.includes(s.id));
    return [];
  };

  const subSectors = getSubSectors();

  const handleSelect = (id: SectorId) => {
    if (id === 'quantum_code' || id === 'pqc_group') {
      setActiveSubMenu(id);
      onSubMenuToggle?.(true);
    } else if (id === 'realq') {
      if (onOpenHelp) {
        onOpenHelp();
      } else {
        onSelect(id);
      }
    } else {
      onSelect(id);
    }
  };

  const handleBackToMain = () => {
    setActiveSubMenu(null);
    onSubMenuToggle?.(false);
  };

  const isSubActive = activeSubMenu !== null;
  const displayedSectors = isSubActive 
    ? subSectors 
    : [
        ...mainSectors,
        {
          id: 'send_to_ibm' as SectorId,
          name: t('s_send_to_ibm_name'),
          icon: 'Terminal',
          description: t('s_send_to_ibm_desc'),
          focus: 'Quantum Hardware Integration',
          variablesLabel: 'Jobs/Qasm',
          stressEvent: 'Network Latency',
          isSpecial: true,
        }
      ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.05)_0%,transparent_70%)] pointer-events-none" />

      {isSubActive && (
        <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50">
          <button 
            onClick={handleBackToMain}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-black/40 border border-white/10 rounded-full text-gray-400 transition-all group backdrop-blur-xl ${
              activeSubMenu === 'pqc_group' 
                ? 'hover:text-emerald-400 hover:border-emerald-500/50' 
                : 'hover:text-quantum-primary hover:border-quantum-primary/50'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-[9px] sm:text-xs tracking-widest uppercase font-bold">{t('back')}</span>
          </button>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 md:mb-12 relative z-10 w-full px-4"
      >
        <AnimatePresence mode="wait">
          {isSubActive ? (
            <motion.div
              key="sub-title"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-2 uppercase tracking-tighter">
                {t(`s_${activeSubMenu}_name`)}
              </h1>
              <p className={`text-[9px] sm:text-xs font-mono uppercase tracking-[0.2em] sm:tracking-[0.3em] ${
                activeSubMenu === 'pqc_group' ? 'text-emerald-400' : 'text-quantum-primary'
              }`}>
                {activeSubMenu === 'pqc_group' ? t('pqc_cryptography') : t('advanced_dev_tools')}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="main-title"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-display font-bold quantum-gradient-text mb-2 md:mb-4 uppercase tracking-tighter">
                {t('title')}
              </h1>
              <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-4">
                {t('subtitle').split('\n').map((line, idx) => (
                  <span
                    key={idx}
                    className="block text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-400 font-mono uppercase tracking-[0.08em] sm:tracking-[0.15em] md:tracking-[0.2em] leading-relaxed text-center"
                  >
                    {line}
                  </span>
                ))}
              </div>
              <p className="text-[7px] sm:text-[10px] text-quantum-primary font-mono uppercase tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] mt-3 sm:mt-4 md:mt-6 animate-pulse">
                {t('chooseSector')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Centered layout for the orbital hub or active lists */}
      <div className="flex items-center justify-center w-full max-w-7xl px-4 z-10 my-4">
        
        {/* Container with better responsive sizing */}
        <div className="relative w-[90vmin] h-[90vmin] sm:w-[75vmin] sm:h-[75vmin] max-w-[550px] max-h-[550px] flex items-center justify-center mb-6 xl:mb-0 shrink-0">
        {/* Satellite Buttons / Button List for sub-menu */}
        <AnimatePresence mode="wait">
          {!isSubActive ? (
            <motion.div
              key="circular-layout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Solar System Orbiting Frame */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
              >
                {displayedSectors.map((sector, index) => {
                  const Icon = ICON_MAP[sector.icon] || Cpu;
                  const total = displayedSectors.length;
                  const angle = (index / total) * 360;
                  const radius = 42; // Percentage radius
                  
                  return (
                    <div
                      key={sector.id}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <motion.button
                        onClick={() => handleSelect(sector.id)}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          left: `${50 + Math.cos((angle * Math.PI) / 180) * radius}%`,
                          top: `${50 + Math.sin((angle * Math.PI) / 180) * radius}%`,
                          translateX: '-50%',
                          translateY: '-50%'
                        }}
                        transition={{ delay: index * 0.1, duration: 0.8, type: "spring" }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute flex flex-col items-center group z-20 pointer-events-auto"
                      >
                        {/* Opposite rotation wrapper to keep content perfectly upright */}
                        <motion.div
                          className="flex flex-col items-center select-none text-center"
                          animate={{ rotate: -360 }}
                          transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
                        >
                          <div className={`w-[12vmin] h-[12vmin] max-w-[55px] max-h-[55px] md:w-20 md:h-20 rounded-full border flex items-center justify-center mb-1 sm:mb-2 transition-all relative overflow-hidden ${
                            sector.id === 'translator' 
                              ? 'bg-quantum-secondary/20 border-quantum-secondary shadow-[0_0_20px_rgba(157,0,255,0.2)]' 
                            : sector.id === 'send_to_ibm'
                              ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)] group-hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] group-hover:border-cyan-400'
                            : sector.id === 'pqc_group'
                              ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)] group-hover:shadow-[0_0_35px_rgba(52,211,153,0.7)] group-hover:border-emerald-400'
                            : sector.id === 'realq'
                              ? 'bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'
                            : sector.id === 'mitigation'
                              ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                              : 'bg-black/80 border-white/10 group-hover:border-quantum-primary group-hover:shadow-[0_0_20px_rgba(0,242,255,0.15)]'
                          }`}>
                            <div className={`absolute inset-0 transition-colors ${
                              sector.id === 'translator' ? 'bg-quantum-secondary/10' : sector.id === 'send_to_ibm' ? 'bg-cyan-500/10' : sector.id === 'pqc_group' ? 'bg-emerald-500/10' : sector.id === 'realq' ? 'bg-red-500/10' : sector.id === 'mitigation' ? 'bg-amber-500/10' : 'bg-quantum-primary/0 group-hover:bg-quantum-primary/10'
                            }`} />
                            <Icon className={`w-[5vmin] h-[5vmin] max-w-[24px] max-h-[24px] md:w-8 md:h-8 transition-transform group-hover:scale-110 ${
                              sector.id === 'translator' ? 'text-quantum-secondary' : sector.id === 'send_to_ibm' ? 'text-cyan-400 animate-pulse' : sector.id === 'pqc_group' ? 'text-emerald-400' : sector.id === 'realq' ? 'text-red-500' : sector.id === 'mitigation' ? 'text-amber-500' : 'text-quantum-primary'
                            }`} />
                          </div>
                          <span className={`text-[6px] min-[400px]:text-[8px] md:text-xs font-mono font-bold uppercase tracking-tighter sm:tracking-widest bg-black/60 px-1 py-0.5 md:py-1 rounded border border-white/5 backdrop-blur-sm transition-colors whitespace-nowrap overflow-hidden ${
                            sector.id === 'translator' ? 'text-quantum-secondary border-quantum-secondary/30' : sector.id === 'send_to_ibm' ? 'text-cyan-400 border-cyan-500/30' : sector.id === 'pqc_group' ? 'text-emerald-400 border-emerald-500/30' : sector.id === 'realq' ? 'text-red-500 border-red-500/30' : sector.id === 'mitigation' ? 'text-amber-500 border-amber-500/30' : 'text-white group-hover:text-quantum-primary'
                          }`}>
                            {t(`s_${sector.id}_name`)}
                          </span>
                        </motion.div>
                      </motion.button>
                    </div>
                  );
                })}
              </motion.div>

              {/* Central Fixed Sun (Primary Portal - Quantum AI Agents) */}
              <div className="absolute w-[28vmin] h-[28vmin] max-w-[155px] max-h-[155px] sm:w-36 sm:h-36 rounded-full flex items-center justify-center z-30 pointer-events-auto">
                <motion.div
                  whileHover={{ scale: 1.1, boxShadow: "0 0 55px rgba(0,242,255,0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onOpenAgents?.()}
                  className="w-full h-full bg-black/95 border-2 border-quantum-primary hover:border-quantum-primary rounded-full flex flex-col items-center justify-center cursor-pointer shadow-[0_0_35px_rgba(0,242,255,0.25)] relative overflow-hidden backdrop-blur-xl group/hub"
                  title={t('ai_agents')}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-quantum-primary/10 to-transparent pointer-events-none animate-pulse" />
                  
                  <div className="flex flex-col items-center justify-center select-none p-3 text-center h-full w-full">
                    <div className="flex flex-col items-center justify-center">
                      <Cpu className="w-8 h-8 sm:w-10 sm:h-10 text-quantum-primary filter drop-shadow-[0_0_12px_rgba(0,242,255,0.6)] group-hover/hub:scale-110 transition-transform duration-300 animate-pulse" />
                      <span className="text-[10px] sm:text-[11px] md:text-xs font-display font-black uppercase tracking-widest text-white mt-1.5 group-hover/hub:text-quantum-primary transition-colors max-w-[125px]">
                        {t('ai_agents')}
                      </span>
                      <span className="text-[5px] sm:text-[7px] font-mono text-quantum-primary/60 uppercase tracking-widest mt-0.5 scale-90">
                        {t('launch_gateway')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Orbits and trails */}
              <div className="absolute inset-0 border border-white/5 rounded-full pointer-events-none scale-[0.55] opacity-20" />
              <div className="absolute inset-0 border border-white/5 rounded-full pointer-events-none scale-[0.84] opacity-30" />
              <div className="absolute inset-0 border border-white/5 rounded-full pointer-events-none scale-[1.0] opacity-10" />
            </motion.div>
          ) : (
            <motion.div
              key="button-list"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-6 p-2 sm:p-4 md:p-8"
            >
              {displayedSectors.map((sector, index) => {
                const Icon = ICON_MAP[sector.icon] || Cpu;
                const isPqcSub = activeSubMenu === 'pqc_group';
                return (
                  <motion.button
                    key={sector.id}
                    onClick={() => handleSelect(sector.id)}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full max-w-lg group relative"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${isPqcSub ? 'from-emerald-500/0 via-emerald-500/10' : 'from-quantum-primary/0 via-quantum-primary/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl sm:rounded-2xl`} />
                    <div className={`relative p-3 sm:p-5 md:p-6 bg-black/60 border border-white/10 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-5 md:gap-6 transition-all backdrop-blur-xl overflow-hidden ${
                      isPqcSub 
                        ? 'group-hover:border-emerald-500 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]' 
                        : 'group-hover:border-quantum-primary group-hover:shadow-[0_0_40px_rgba(0,242,255,0.2)]'
                    }`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${isPqcSub ? 'from-emerald-500/5' : 'from-quantum-primary/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <div className={`w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-lg sm:rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center transition-all shadow-inner relative z-10 ${
                        isPqcSub 
                          ? 'group-hover:border-emerald-500 group-hover:bg-emerald-500/10' 
                          : 'group-hover:border-quantum-primary group-hover:bg-quantum-primary/10'
                      }`}>
                        <Icon className={`w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 group-hover:scale-110 group-hover:rotate-6 transition-transform ${
                          isPqcSub ? 'text-emerald-400' : 'text-quantum-primary'
                        }`} />
                      </div>
                      <div className="flex-1 text-left min-w-0 relative z-10">
                        <h3 className={`text-[10px] sm:text-xs md:text-sm font-black text-white uppercase tracking-wider sm:tracking-widest mb-0.5 sm:mb-1 transition-colors ${
                          isPqcSub ? 'group-hover:text-emerald-400' : 'group-hover:text-quantum-primary'
                        }`}>
                          {t(`s_${sector.id}_name`)}
                        </h3>
                        <p className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 font-mono tracking-wider line-clamp-1 sm:line-clamp-2 leading-relaxed">
                          {t(`s_${sector.id}_desc`)}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-1 sm:pr-2 md:pr-4 relative z-10 hidden sm:block">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border flex items-center justify-center bg-black/45 ${
                          isPqcSub 
                            ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                            : 'border-quantum-primary/50 bg-quantum-primary/5 shadow-[0_0_15px_rgba(0,242,255,0.2)]'
                        }`}>
                          <ArrowLeft className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rotate-180 ${
                            isPqcSub ? 'text-emerald-400' : 'text-quantum-primary'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      </div>
    </div>
  );
}
