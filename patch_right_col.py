import re
import sys

with open('src/components/MedicalScreening.tsx', 'r') as f:
    content = f.read()

parts = content.split("{/* Details Box */}")
if len(parts) == 2:
    part1 = parts[0]
    part2 = parts[1]
    
    end_marker = "              </div>\n            </div>\n\n            {/* FASE 3: STORICO TREND */}"
    
    if end_marker in part2:
        part2_after_details = end_marker + part2.split(end_marker, 1)[1]
        
        new_details_box = """{/* 4 Categories Alert List */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4" style={{ maxHeight: '700px' }}>
                  {[result.vitali, result.metabolici, result.organo, result.infiammatorio].map((cat, idx) => (
                    <div key={idx} className="bg-[#121212] border border-white/5 rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-white/10 transition-all">
                      <div className={`absolute top-0 left-0 w-1 h-full`} style={{ backgroundColor: cat.chartColor }} />
                      
                      <div className="pl-2 flex flex-col gap-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-lg font-light text-white mb-1">{cat.title}</h3>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{cat.subtitle}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase flex-shrink-0 ${
                            cat.status === 'Idoneo' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                              : 'bg-red-500/10 border-red-500/30 text-red-400'
                          }`}>
                            {cat.status}
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                          <div className="text-xs font-medium text-white mb-1">{cat.statusText}</div>
                          <div className="text-xs text-slate-400 leading-relaxed font-light">{cat.description}</div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 mt-2">
                          <div className="flex flex-col gap-4 justify-center sm:w-1/3">
                            {cat.metrics.map((m, i) => (
                              <div key={i}>
                                <div className="text-[9px] font-mono text-slate-500 uppercase">{m.label}</div>
                                <div className="text-lg font-light text-white">{m.value}</div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="h-[120px] sm:flex-1 w-full bg-white/[0.02] border border-white/5 rounded-xl p-3 relative">
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
                      </div>
                    </div>
                  ))}
                </div>\n"""
        
        content = part1 + new_details_box + part2_after_details
        
        with open('src/components/MedicalScreening.tsx', 'w') as f:
            f.write(content)
        print("Patched right col completely")
    else:
        print("End marker not found in part2")
        sys.exit(1)
else:
    print("Details box not found exactly once")
    sys.exit(1)
