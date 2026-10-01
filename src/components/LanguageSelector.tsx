import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Check } from 'lucide-react';
import { LANGUAGES, LanguageCode } from '../types';

interface Props {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  direction?: 'up' | 'down';
}

export default function LanguageSelector({ currentLanguage, onLanguageChange, direction = 'down' }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const activeLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <div className="relative z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-quantum-primary hover:border-quantum-primary/50 transition-all font-mono text-[10px] sm:text-xs uppercase tracking-wider backdrop-blur-md cursor-pointer"
        title="Seleziona Lingua Interfaccia"
      >
        <Globe className="w-3.5 h-3.5 text-quantum-primary" />
        <span className="font-bold">{activeLang.code.toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click outside overlay */}
            <div 
              className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[1px]" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: direction === 'down' ? -5 : 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: direction === 'down' ? -5 : 5, scale: 0.95 }}
              className={`absolute right-0 ${
                direction === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'
              } w-44 sm:w-52 bg-slate-950/98 border border-cyan-400/40 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.95)] z-[9999] backdrop-blur-2xl ring-1 ring-cyan-500/20`}
            >
              <div className="py-1 max-h-64 overflow-y-auto scrollbar-hide divide-y divide-white/5">
                {LANGUAGES.map((lang) => {
                  const isSelected = lang.code === currentLanguage;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 sm:px-4 py-2 text-left text-[11px] sm:text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                        isSelected 
                          ? 'text-cyan-300 bg-cyan-500/15 font-bold border-l-2 border-cyan-400' 
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{lang.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
