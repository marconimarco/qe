const fs = require('fs');
let content = fs.readFileSync('src/components/MedicalScreening.tsx', 'utf-8');

// 1. Reduced view (grid): hide metrics and subtitles
// Find the grid rendering block
const reducedViewRegex = /className=\{`p-4 rounded-xl border flex flex-col gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg \$\{[\s\S]*?\}\`\}([\s\S]*?)<\/div>\s*\);\s*\}\)}\s*<\/div>/;

// Wait, I can just replace the specific sections.
content = content.replace(
  /<div className="text-xs text-slate-300 line-clamp-1 opacity-80">\s*\{details\.obiettivo\}\s*<\/div>/g,
  '{/* <div className="text-xs text-slate-300 line-clamp-1 opacity-80">{details.obiettivo}</div> */}'
);

content = content.replace(
  /<div className="flex gap-2 pt-1">\s*\{cat\.metrics\.map\(\(m, i\) => \([\s\S]*?\}\)\}\s*<\/div>/,
  '{/* Metrics hidden in reduced view */}'
);

// Reduce sizes in expanded view
// <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
content = content.replace(/<div className="bg-white\/\[0\.02\] border border-white\/5 rounded-xl p-4">/g, '<div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">');

// <p className="text-sm font-light text-white mb-4 leading-relaxed">{details.obiettivo}</p>
content = content.replace(/<p className="text-sm font-light text-white mb-4 leading-relaxed">\{details\.obiettivo\}<\/p>/g, '<p className="text-xs font-light text-white mb-3 leading-relaxed">{details.obiettivo}</p>');

// <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex flex-col gap-1">
content = content.replace(/<div className="bg-black\/40 p-3 rounded-lg border border-white\/5 flex flex-col gap-1">/g, '<div className="bg-black/40 p-2 rounded-lg border border-white/5 flex flex-col gap-1">');

// <span className="text-sm">{p.icon}</span>
content = content.replace(/<span className="text-sm">\{p\.icon\}<\/span>/g, '<span className="text-xs">{p.icon}</span>');

// <div className="text-xs font-medium text-white flex items-center gap-1.5">
content = content.replace(/<div className="text-xs font-medium text-white flex items-center gap-1\.5">/g, '<div className="text-[11px] font-medium text-white flex items-center gap-1.5">');

// <div className="text-[11px] text-slate-400 leading-relaxed font-light pl-5">{p.d}</div>
content = content.replace(/<div className="text-\[11px\] text-slate-400 leading-relaxed font-light pl-5">\{p\.d\}<\/div>/g, '<div className="text-[9px] text-slate-400 leading-relaxed font-light pl-5">{p.d}</div>');

// <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
// <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex flex-col gap-2">
content = content.replace(/rounded-xl p-4 flex flex-col gap-2/g, 'rounded-lg p-3 flex flex-col gap-1.5');
content = content.replace(/<div className="flex items-center gap-1\.5 text-[a-z]+-400 font-bold text-\[10px\] uppercase tracking-widest mb-0\.5">/g, '<div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">');
content = content.replace(/<p className="text-\[11px\] text-[a-z]+-200\/80 leading-relaxed font-light">\{details\.allarmi\}<\/p>/g, '<p className="text-[10px] text-red-200/80 leading-relaxed font-light">{details.allarmi}</p>');
content = content.replace(/<p className="text-\[11px\] text-[a-z]+-200\/80 leading-relaxed font-light">\{details\.cause\}<\/p>/g, '<p className="text-[10px] text-amber-200/80 leading-relaxed font-light">{details.cause}</p>');
content = content.replace(/<p className="text-\[11px\] text-[a-z]+-200\/80 leading-relaxed font-light">\{details\.consigli\}<\/p>/g, '<p className="text-[10px] text-emerald-200/80 leading-relaxed font-light">{details.consigli}</p>');

fs.writeFileSync('src/components/MedicalScreening.tsx', content);
