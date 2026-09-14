import re

with open('src/components/MedicalScreening.tsx', 'r') as f:
    content = f.read()

target = """                <div className="mt-8 pt-6 flex justify-between items-center">
                  <button onClick={runScreening} disabled={!isDataReady || isAnalyzing} className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${isDataReady && !isAnalyzing ? 'bg-white text-black hover:scale-105' : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'}`}>
                    {isAnalyzing ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : null}
                    {isAnalyzing ? 'Elaborazione...' : 'Avvia Screening'}
                  </button>
                  <button 
                    onClick={() => { 
                      setDob('');
                      localStorage.removeItem('quantum_medical_dob');
                      setHistory([]); 
                      localStorage.removeItem('quantum_medical_history');
                      localStorage.removeItem('quantum_medical_gender');
                      setInputMethod('none');
                      setIsDataReady(false);
                      setHasRegistered(false); 
                    }} 
                    className="text-[10px] text-slate-600 hover:text-slate-400 underline decoration-slate-700 underline-offset-4"
                  >
                    Reset Profilo (Debug)
                  </button>
                </div>"""

new_buttons = """                <div className="mt-8 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex flex-wrap gap-4 items-center">
                    <button onClick={runScreening} disabled={!isDataReady || isAnalyzing} className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${isDataReady && !isAnalyzing ? 'bg-white text-black hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'}`}>
                      {isAnalyzing ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : null}
                      {isAnalyzing ? 'Elaborazione...' : 'Avvia Screening'}
                    </button>
                    
                    <button onClick={runScreening} disabled={isAnalyzing} className="px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest text-slate-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all">
                      Vedi Situazione Attuale
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => { 
                      setDob('');
                      localStorage.removeItem('quantum_medical_dob');
                      setHistory([]); 
                      localStorage.removeItem('quantum_medical_history');
                      localStorage.removeItem('quantum_medical_gender');
                      setInputMethod('none');
                      setIsDataReady(false);
                      setHasRegistered(false); 
                    }} 
                    className="text-[10px] text-slate-600 hover:text-slate-400 underline decoration-slate-700 underline-offset-4"
                  >
                    Reset Profilo (Debug)
                  </button>
                </div>"""

if target in content:
    content = content.replace(target, new_buttons)
    print("Patched buttons")
else:
    print("Target buttons not found")

with open('src/components/MedicalScreening.tsx', 'w') as f:
    f.write(content)
