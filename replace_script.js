const fs = require('fs');
const content = fs.readFileSync('src/components/MedicalScreening.tsx', 'utf8');

const startMarker = '{/* LATO DESTRO: I 4 MODULI TUTTI SULLA STESSA RIGA (LARGHEZZA RADDOPPIATA) */}';
const endMarker = '              </div>\n            </div>\n\n            {/* SEZIONE PROBLEMATICHE';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Markers not found.");
  process.exit(1);
}

const replacement = `              {/* LATO DESTRO: I 4 MODULI AD ACCORDION */}
              <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono uppercase tracking-widest px-1">
                  <span>Moduli Clinici di Valutazione</span>
                  <span className="text-[11px] text-slate-400">Clicca su un modulo per espanderlo</span>
                </div>

                <div className="flex flex-col gap-3 pb-4 pt-1 px-1">
                  {[result.vitali, result.metabolici, result.organo, result.infiammatorio].map((cat, idx) => {
                    const details = CATEGORY_DETAILS_ENRICHED[idx];
                    const isExpanded = expandedCategory === idx;
                    
                    return (
                      <div 
                        key={idx} 
                        className={\`bg-[#121212] border rounded-2xl relative overflow-hidden transition-all duration-300 w-full shrink-0 \${
                          isExpanded 
                            ? 'border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)] bg-white/[0.03]'
                            : 'border-white/5 hover:border-white/20 hover:bg-white/[0.01] cursor-pointer'
                        }\`}
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full transition-all" style={{ backgroundColor: cat.chartColor }} />
                        
                        {/* Header Cliccabile */}
                        <div 
                          className="p-4 pl-5 flex items-center justify-between"
                          onClick={() => {
                            if (!isExpanded) {
                              setActiveCategory(idx);
                              setExpandedCategory(idx);
                            } else {
                              setExpandedCategory(null);
                              setActiveCategory(null);
                            }
                          }}
                        >
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">MOD #{idx + 1}</span>
                              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: cat.chartColor }} />
                              <span className={\`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border \${details.urgenzaBadgeColor}\`}>
                                {details.urgenzaTag}
                              </span>
                            </div>
                            <h3 className={\`font-medium transition-colors \${isExpanded ? 'text-lg text-white' : 'text-sm text-slate-200'}\`}>
                              {cat.title}
                            </h3>
                            {isExpanded && (
                              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{cat.subtitle}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className={\`px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-widest uppercase flex-shrink-0 \${
                              cat.status === 'Idoneo'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }\`}>
                              {cat.status}
                            </div>
                            <button className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                              {isExpanded ? <X className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Contenuto Espanso */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                            {/* Status Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b border-white/5 mb-4">
                              <div className={\`px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-widest uppercase shrink-0 w-fit \${
                                cat.status === 'Idoneo'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'bg-red-500/10 border-red-500/30 text-red-400'
                              }\`}>
                                {cat.status}: {cat.statusText}
                              </div>
                              <div className="text-xs text-slate-300 leading-relaxed font-light">{cat.description}</div>
                            </div>

                            {/* 3 Box: Allarmi, Cause, Consigli */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 flex flex-col gap-1.5">
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                                  Campanelli d'allarme
                                </div>
                                <p className="text-[10px] text-red-200/80 leading-relaxed font-light">{details.allarmi}</p>
                              </div>
                              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex flex-col gap-1.5">
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Cause Frequenti di Alterazione
                                </div>
                                <p className="text-[10px] text-amber-200/80 leading-relaxed font-light">{details.cause}</p>
                              </div>
                              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 flex flex-col gap-1.5">
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                                  <div className="w-1.5 h-1.5 rounded-sm bg-emerald-500"></div>
                                  Consigli Pratici per l'Utente
                                </div>
                                <p className="text-[10px] text-emerald-200/80 leading-relaxed font-light">{details.consigli}</p>
                              </div>
                            </div>

                            {/* Box Interconnessione */}
                            <div className="bg-gradient-to-r from-red-950/30 via-amber-950/20 to-black/60 border border-red-500/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                              <div className="flex items-start gap-2">
                                <span className="text-amber-400 text-sm shrink-0">💡</span>
                                <p className="text-xs text-slate-200 leading-relaxed font-light max-w-xl">
                                  {details.interconnessione}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDominoModal(true);
                                }}
                                className="animate-pulse px-4 py-2 rounded-lg bg-gradient-to-r from-red-600/40 via-amber-600/30 to-red-600/40 border border-red-500/70 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:brightness-125 transition-all cursor-pointer shrink-0 shadow-lg"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-300" />
                                <span>Scopri la reazione a catena nel corpo</span>
                              </button>
                            </div>

                            {/* Grafico */}
                            <div className="h-[200px] w-full bg-white/[0.01] border border-white/5 rounded-xl p-4 relative mb-2">
                              <div className="absolute top-3 left-4 z-10 text-[10px] font-mono text-slate-500 uppercase tracking-widest">{cat.chartLabel} (Andamento Storico)</div>
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={cat.chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} />
                                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} />
                                  <Tooltip 
                                    content={({ active, payload }) => {
                                      if (active && payload && payload.length) {
                                        return (
                                          <div className="bg-black/90 border border-white/10 px-3 py-2 rounded-lg text-xs backdrop-blur-md shadow-xl flex flex-col gap-1">
                                            <span className="text-white/60 font-mono text-[9px] uppercase">{payload[0].payload.time}</span>
                                            <span className="text-white font-mono font-bold" style={{ color: cat.chartColor }}>{payload[0].value} {cat.chartLabel.split(' ')[0]}</span>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey={cat.chartKey} 
                                    stroke={cat.chartColor} 
                                    strokeWidth={3} 
                                    dot={{ fill: '#000', stroke: cat.chartColor, strokeWidth: 2, r: 3 }}
                                    activeDot={{ r: 6, fill: '#000', stroke: cat.chartColor, strokeWidth: 2 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            {/* CTA PDF */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/20 via-black/40 to-cyan-950/20 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
                              <div className="space-y-1 text-center md:text-left">
                                <h5 className="text-xs font-semibold text-white">Rilevi uno di questi segnali?</h5>
                                <p className="text-[10px] text-slate-300 font-light">
                                  Genera il tuo Report PDF personalizzato da mostrare al medico.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadPdf();
                                }}
                                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-lg shadow-cyan-500/20"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Report PDF</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('src/components/MedicalScreening.tsx', newContent);
console.log("Successfully replaced block.");
