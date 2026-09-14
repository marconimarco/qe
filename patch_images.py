import re

with open('src/components/MedicalScreening.tsx', 'r') as f:
    content = f.read()

# Replace the left panel body visualization
body_visualization_pattern = re.compile(r'\<div className="relative w-full max-w-\[280px\] aspect-\[1\/2\.25\] mt-8"\>.*?\<\/div\>\n\s*\<div className="mt-8 text-\[10px\] text-slate-500 font-mono tracking-widest text-center"\>\n\s*Clicca sui nodi pulsanti per visualizzare i dettagli clinici\n\s*\<\/div\>', re.DOTALL)

new_body_visualization = """                <div className="relative w-full max-w-[320px] aspect-[3/4] mt-8 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  {activeCategory === null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 text-center p-6">
                      <p className="text-sm font-light text-slate-300 font-mono">Seleziona una categoria clinica a destra per analizzare i sistemi interni corrispondenti.</p>
                    </div>
                  )}
                  {activeCategory === 0 && <img src={scanVitali} alt="Vitali" className="w-full h-full object-cover animate-in fade-in duration-700" />}
                  {activeCategory === 1 && <img src={scanMetabolici} alt="Metabolici" className="w-full h-full object-cover animate-in fade-in duration-700" />}
                  {activeCategory === 2 && <img src={scanOrgano} alt="Organi" className="w-full h-full object-cover animate-in fade-in duration-700" />}
                  {activeCategory === 3 && <img src={scanInfiammatorio} alt="Infiammatorio" className="w-full h-full object-cover animate-in fade-in duration-700" />}
                  
                  {/* Default SVG when no category is selected just as a placeholder */}
                  {activeCategory === null && (
                    <svg viewBox="0 0 200 450" className="w-full h-full text-white/5 opacity-50">
                      <g fill="currentColor">
                        <path d="M 100 55 Q 120 55, 125 75 Q 125 110, 110 145 Q 135 180, 135 220 Q 135 270, 115 420 Q 108 430, 102 420 L 100 260 L 98 420 Q 92 430, 85 420 Q 65 270, 65 220 Q 65 180, 90 145 Q 75 110, 75 75 Q 80 55, 100 55 Z" />
                      </g>
                    </svg>
                  )}
                  <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-3xl mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />
                </div>"""

if body_visualization_pattern.search(content):
    content = body_visualization_pattern.sub(new_body_visualization, content, count=1)
    print("Patched left panel")
else:
    print("Could not find left panel to patch")

# Make the right panel categories clickable to set activeCategory
# Find this line: <div key={idx} className="bg-[#121212] border border-white/5 rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-white/10 transition-all">
category_div_target = """<div key={idx} className="bg-[#121212] border border-white/5 rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-white/10 transition-all">"""
category_div_replacement = """<div key={idx} onClick={() => setActiveCategory(idx)} className={`bg-[#121212] border rounded-3xl p-6 flex flex-col relative overflow-hidden group transition-all cursor-pointer ${activeCategory === idx ? 'border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-white/5 hover:border-white/15'}`}>"""

if category_div_target in content:
    content = content.replace(category_div_target, category_div_replacement)
    print("Patched right panel")
else:
    print("Could not find right panel to patch")

with open('src/components/MedicalScreening.tsx', 'w') as f:
    f.write(content)
