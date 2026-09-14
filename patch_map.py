import re

with open('src/components/MedicalScreening.tsx', 'r') as f:
    content = f.read()

start_idx = content.find("{[result.vitali, result.metabolici, result.organo, result.infiammatorio].map((cat, idx) => (")
if start_idx != -1:
    end_marker = "                  ))}\n                </div>"
    end_idx = content.find(end_marker, start_idx)
    
    if end_idx != -1:
        # Include the end marker in the replacement or just replace up to it
        end_idx += len("                  ))}")
        
        old_map_block = content[start_idx:end_idx]
        
        replacement_map = """{[result.vitali, result.infiammatorio, result.metabolici, result.organo].map((cat, idx) => {
                    const isExpanded = expandedCategory === idx;
                    const details = CATEGORY_DETAILS[idx];
                    
                    if (expandedCategory !== null && expandedCategory !== idx) return null;
                    
                    return (
                      <div 
                        key={idx} 
                        onClick={() => {
                          if (expandedCategory === null) {
                            setActiveCategory(idx);
                            setExpandedCategory(idx);
                          }
                        }} 
                        className={`bg-[#121212] border rounded-2xl relative overflow-hidden transition-all duration-500 
                          ${isExpanded ? 'col-span-1 xl:col-span-2 row-span-2 p-8 shadow-[0_0_40px_rgba(255,255,255,0.05)] border-white/20 bg-white/[0.02] flex flex-col' : 'p-5 flex flex-col cursor-pointer gap-5 border-white/5 hover:border-white/15'}
                        `}
                      >
                        <div className={`absolute top-0 left-0 ${isExpanded ? 'w-2' : 'w-1'} h-full transition-all`} style={{ backgroundColor: cat.chartColor }} />
                        
                        {isExpanded && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedCategory(null);
                            }}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all z-20"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                        
                        <div className={`pl-2 flex-1 flex flex-col gap-4 ${isExpanded ? 'mb-8' : ''}`}>
                          <div className="flex justify-between items-start gap-4 pr-12">
                            <div>
                              <h3 className={`${isExpanded ? 'text-3xl' : 'text-lg'} font-light text-white mb-2 transition-all`}>{cat.title}</h3>
                              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{cat.subtitle}</p>
                            </div>
                            {!isExpanded && (
                              <div className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase flex-shrink-0 ${
                                cat.status === 'Idoneo' 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                  : 'bg-red-500/10 border-red-500/30 text-red-400'
                              }`}>
                                {cat.status}
                              </div>
                            )}
                          </div>

                          {!isExpanded && (
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                              <div className="text-xs font-medium text-white mb-1">{cat.statusText}</div>
                              <div className="text-xs text-slate-400 leading-relaxed font-light">{cat.description}</div>
                            </div>
                          )}
                          
                          {isExpanded && (
                            <div className="flex flex-col gap-8 mt-4 animate-in fade-in duration-700 delay-150 fill-mode-both">
                              
                              {/* Status Row */}
                              <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                                <div className={`px-4 py-2 rounded-full border text-xs font-bold tracking-widest uppercase flex-shrink-0 ${
                                  cat.status === 'Idoneo' 
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                                }`}>
                                  {cat.status}: {cat.statusText}
                                </div>
                                <div className="text-sm text-slate-300 leading-relaxed font-light flex-1">{cat.description}</div>
                              </div>
                              
                              {/* Cosa ottiene l'utente */}
                              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                                  Cosa ottieni da questa analisi
                                </h4>
                                <p className="text-lg font-light text-white mb-6">{details.obiettivo}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {details.punti.map((p, i) => (
                                    <div key={i} className="bg-black/30 p-4 rounded-xl border border-white/5">
                                      <div className="text-sm font-medium text-white mb-2">{p.t}</div>
                                      <div className="text-xs text-slate-400 leading-relaxed font-light">{p.d}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Grid for Alarms, Causes, Advices */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Campanelli d'allarme */}
                                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 flex flex-col gap-3">
                                  <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-widest mb-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    Campanelli d'allarme
                                  </div>
                                  <p className="text-xs text-red-200/70 leading-relaxed font-light">{details.allarmi}</p>
                                </div>
                                
                                {/* Cause Frequenti */}
                                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 flex flex-col gap-3">
                                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest mb-2">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Cause Frequenti
                                  </div>
                                  <p className="text-xs text-amber-200/70 leading-relaxed font-light">{details.cause}</p>
                                </div>
                                
                                {/* Consigli Pratici */}
                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex flex-col gap-3">
                                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">
                                    <div className="w-1.5 h-1.5 rounded-sm bg-emerald-500"></div>
                                    Consigli Pratici
                                  </div>
                                  <p className="text-xs text-emerald-200/70 leading-relaxed font-light">{details.consigli}</p>
                                </div>
                              </div>

                            </div>
                          )}
                        </div>

                        {!isExpanded && (
                          <div className="w-full shrink-0 flex flex-col gap-3">
                            <div className="flex gap-3">
                              {cat.metrics.map((m, i) => (
                                <div key={i} className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                                  <div className="text-[8px] font-mono text-slate-500 uppercase truncate mb-1">{m.label}</div>
                                  <div className="text-[13px] font-medium text-white leading-none">{m.value}</div>
                                </div>
                              ))}
                            </div>
                            <div className="h-[90px] w-full bg-white/[0.02] border border-white/5 rounded-lg p-2 relative">
                                <div className="absolute top-2 left-3 z-10 text-[9px] font-mono text-slate-500 uppercase tracking-widest">{cat.chartLabel}</div>
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={cat.chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                    <Tooltip 
                                      content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                          return (
                                            <div className="bg-black/90 border border-white/10 p-2 rounded-lg text-xs backdrop-blur-md">
                                              <span className="text-white font-mono">{payload[0].value}</span>
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeDasharray: '4 4' }}
                                    />
                                    <Line 
                                      type="monotone" 
                                      dataKey={cat.chartKey} 
                                      stroke={cat.chartColor} 
                                      strokeWidth={2} 
                                      dot={false}
                                      activeDot={{ r: 4, fill: '#000', stroke: cat.chartColor, strokeWidth: 2 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}"""
        
        content = content.replace(old_map_block, replacement_map)
        with open('src/components/MedicalScreening.tsx', 'w') as f:
            f.write(content)
        print("Successfully replaced map block!")
    else:
        print("End marker not found")
else:
    print("Start marker not found")
