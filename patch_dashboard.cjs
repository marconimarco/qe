const fs = require('fs');
const content = fs.readFileSync('src/components/QuantumDashboard.tsx', 'utf-8');

const replacement = `
      <nav className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 sm:mb-8 gap-3 sm:gap-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={resetSelection}
            className="flex items-center gap-2 text-gray-400 hover:text-quantum-primary transition-colors py-1"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 h-5" />
            <span className="font-mono text-[10px] sm:text-sm tracking-widest uppercase">{t('back')}</span>
          </button>
          {['pqc_locker', 'pqc_keygen', 'pqc_chat'].includes(sector.id) && (
            <button 
              onClick={() => onBack(true)}
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors py-1 px-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="font-mono text-[9px] sm:text-xs tracking-widest uppercase font-bold">Back to Home Page</span>
            </button>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 bg-black/20 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-white/5 sm:border-none">`;

const newContent = content.replace(
  /<nav className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 sm:mb-8 gap-3 sm:gap-0">\s*<button\s*onClick={resetSelection}\s*className="flex items-center gap-2 text-gray-400 hover:text-quantum-primary transition-colors py-1"\s*>\s*<ArrowLeft className="w-4 h-4 sm:w-5 h-5" \/>\s*<span className="font-mono text-\[10px\] sm:text-sm tracking-widest uppercase">{t\('back'\)}<\/span>\s*<\/button>\s*<div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 bg-black\/20 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-white\/5 sm:border-none">/g,
  replacement
);

fs.writeFileSync('src/components/QuantumDashboard.tsx', newContent);
