import re

with open('src/components/MedicalScreening.tsx', 'r') as f:
    content = f.read()

# 1. State for history timeline
state_injection = """  const [showTimeline, setShowTimeline] = useState(false);"""
# find "const [activeCategory" and insert after
if "const [showTimeline" not in content:
    content = content.replace(
        "const [activeCategory, setActiveCategory] = useState<number | null>(null);",
        "const [activeCategory, setActiveCategory] = useState<number | null>(null);\n  const [showTimeline, setShowTimeline] = useState(false);"
    )


# 2. Main structure: Add top center timeline
target_phase_2 = """          // FASE 2: RISULTATI (2 Colonne)
          <div className="flex flex-col gap-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">"""

replacement_phase_2 = """          // FASE 2: RISULTATI (2 Colonne)
          <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">
            
            {/* STORICO TOP CENTER */}
            {history.length > 0 && (
              <div className="flex flex-col items-center justify-center relative z-50">
                <button 
                  onClick={() => setShowTimeline(!showTimeline)}
                  className="px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-widest text-slate-300 transition-all flex items-center gap-2"
                >
                  Storico Longevità
                </button>
                {showTimeline && (
                  <div className="absolute top-full mt-4 flex gap-4 bg-[#121212] p-4 rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-top-2">
                    {history.map((item, idx) => (
                      <div key={item.id} className="relative group cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/5 transition-all min-w-[80px]">
                        <span className="text-[10px] font-mono text-slate-400">{item.date.split(',')[0]}</span>
                        <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-3 py-1 rounded text-xs font-bold whitespace-nowrap z-50">
                          <span className={item.score < 40 ? 'text-red-500' : item.score < 75 ? 'text-amber-400' : 'text-emerald-400'}>{item.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">"""

content = content.replace(target_phase_2, replacement_phase_2)

# 3. Left Panel (Hologram)
# From: <div className="lg:col-span-4 lg:sticky lg:top-8 flex flex-col items-center justify-start p-6 bg-white/[0.02] border border-white/5 rounded-3xl relative h-fit">
# To: <div className="lg:col-span-6 lg:sticky lg:top-8 flex flex-col items-center justify-start relative h-fit">

target_left = """<div className="lg:col-span-4 lg:sticky lg:top-8 flex flex-col items-center justify-start p-6 bg-white/[0.02] border border-white/5 rounded-3xl relative h-fit">"""
replacement_left = """<div className="lg:col-span-6 lg:sticky lg:top-8 flex flex-col items-center justify-start relative h-fit">"""
content = content.replace(target_left, replacement_left)

# From: <div className="relative w-full aspect-[3/4] mt-2 rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-black/50">
# To: <div className="relative w-full aspect-[4/5] mt-2 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-black/50">
target_img_container = """<div className="relative w-full aspect-[3/4] mt-2 rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-black/50">"""
replacement_img_container = """<div className="relative w-full aspect-[4/5] mt-2 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-black/50">"""
content = content.replace(target_img_container, replacement_img_container)

# 4. Right Panel (Categories)
# From: lg:col-span-8 To: lg:col-span-6
target_right = """<div className="lg:col-span-8 flex flex-col gap-6">"""
replacement_right = """<div className="lg:col-span-6 flex flex-col gap-6">"""
content = content.replace(target_right, replacement_right)

# 5. Remove Score Badge
score_badge_pattern = re.compile(r'\{\/\* Score Badge \*\/\}.*?<\/div>\s*<\/div>', re.DOTALL)
content = score_badge_pattern.sub('', content)

# 6. Change Categories List to Grid 2x2
target_list_container = """<div className="flex flex-col gap-5">"""
replacement_list_container = """<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">"""
content = content.replace(target_list_container, replacement_list_container)

# 7. Category Card styling (revert from xl:flex-row back to flex-col because of the 2x2 grid)
target_card = r'<div key=\{idx\} onClick=\{\(\) => setActiveCategory\(idx\)\} className=\{`bg-\[\#121212\] border rounded-2xl p-5 flex flex-col xl:flex-row relative overflow-hidden group transition-all cursor-pointer gap-6 \$\{activeCategory === idx \? \'border-white\/30 shadow-\[0_0_20px_rgba\(255,255,255,0\.05\)\] bg-white\/\[0\.02\]\' : \'border-white\/5 hover:border-white\/15\'\}`\}>\s*<div className=\{`absolute top-0 left-0 w-1 h-full`\} style=\{\{ backgroundColor: cat\.chartColor \}\} \/>\s*<div className="pl-1 flex-1 flex flex-col gap-4">'

replacement_card = """<div key={idx} onClick={() => setActiveCategory(idx)} className={`bg-[#121212] border rounded-2xl p-5 flex flex-col relative overflow-hidden group transition-all cursor-pointer gap-5 ${activeCategory === idx ? 'border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)] bg-white/[0.02]' : 'border-white/5 hover:border-white/15'}`}>
                      <div className={`absolute top-0 left-0 w-1 h-full`} style={{ backgroundColor: cat.chartColor }} />
                      <div className="pl-1 flex-1 flex flex-col gap-4">"""

content = re.sub(target_card, replacement_card, content)

# Remove the xl:w-[280px] shrink-0 constraint from the inner stats block
target_inner_stats = r'<\/div>\s*<div className="xl:w-\[280px\] shrink-0 flex flex-col gap-3">'
replacement_inner_stats = """</div>
                      <div className="w-full shrink-0 flex flex-col gap-3">"""

content = re.sub(target_inner_stats, replacement_inner_stats, content)


# 8. Remove Bottom History entirely
bottom_history_pattern = re.compile(r'\{\/\* FASE 3: STORICO TREND \*\/\}\s*\{history\.length > 0 && \(\s*<div className="mt-8">.*?<\/div>\s*\)\}', re.DOTALL)
content = bottom_history_pattern.sub('', content)


with open('src/components/MedicalScreening.tsx', 'w') as f:
    f.write(content)

