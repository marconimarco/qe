import re
import sys

with open('src/components/MedicalScreening.tsx', 'r') as f:
    content = f.read()

# 1. Update Grid
content = content.replace(
    '<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">',
    '<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">'
)

# 2. Update Left Panel container
content = content.replace(
    '<div className="flex flex-col items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative min-h-[500px]">',
    '<div className="lg:col-span-4 lg:sticky lg:top-8 flex flex-col items-center justify-start p-6 bg-white/[0.02] border border-white/5 rounded-3xl relative h-fit">'
)

# Fix Left Panel Title
content = content.replace(
    '<h3 className="absolute top-8 left-8 text-xs font-mono uppercase tracking-widest text-slate-500">Scansione Olografica</h3>',
    '<h3 className="w-full text-left text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">Scansione Olografica</h3>'
)

# Change Image container margin
content = content.replace(
    '<div className="relative w-full max-w-[320px] aspect-[3/4] mt-8 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">',
    '<div className="relative w-full aspect-[3/4] mt-2 rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-black/50">'
)

# 3. Update Right Panel container
content = content.replace(
    '              {/* LATO DESTRO: DETTAGLI E SCORE */}\n              <div className="flex flex-col gap-6">',
    '              {/* LATO DESTRO: DETTAGLI E SCORE */}\n              <div className="lg:col-span-8 flex flex-col gap-6">'
)

# 4. Update Score Badge
content = content.replace(
    '<div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex items-center justify-between backdrop-blur-xl">',
    '<div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between backdrop-blur-xl">'
)
content = content.replace(
    '<span className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">Indice Longevità Globale</span>',
    '<span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">Indice Longevità Globale</span>'
)
# We need regex for the text-6xl part because the condition makes it variable
score_text_pattern = re.compile(r'text-6xl font-light tracking-tighter (.*?)">')
content = score_text_pattern.sub(r'text-4xl font-light tracking-tighter \1">', content)
content = content.replace(
    '<span className="text-3xl opacity-50">%</span>',
    '<span className="text-xl opacity-50">%</span>'
)
content = content.replace(
    '<div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-black/50">',
    '<div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/50">'
)
icon_pattern = re.compile(r'<Heart className={`w-8 h-8 (.*?)`} />')
content = icon_pattern.sub(r'<Heart className={`w-6 h-6 \1`} />', content)

# 5. Update Categories List Wrapper
content = content.replace(
    '<div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4" style={{ maxHeight: \'700px\' }}>',
    '<div className="flex flex-col gap-5">'
)

# 6. Update Category Card Inner Layout
# From:
# <div key={idx} onClick={() => setActiveCategory(idx)} className={`bg-[#121212] border rounded-3xl p-6 flex flex-col relative overflow-hidden group transition-all cursor-pointer ${activeCategory === idx ? 'border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-white/5 hover:border-white/15'}`}>
# <div className={`absolute top-0 left-0 w-1 h-full`} style={{ backgroundColor: cat.chartColor }} />
# <div className="pl-2 flex flex-col gap-4">

# To a better xl:flex-row layout
target_card_wrap = r'<div key={idx} onClick=\{\(\) => setActiveCategory\(idx\)\} className=\{`bg-\[\#121212\] border rounded-3xl p-6 flex flex-col relative overflow-hidden group transition-all cursor-pointer \$\{activeCategory === idx \? \'border-white\/30 shadow-\[0_0_20px_rgba\(255,255,255,0\.05\)\]\' : \'border-white\/5 hover:border-white\/15\'\}`\}>\s*<div className=\{`absolute top-0 left-0 w-1 h-full`\} style=\{\{ backgroundColor: cat\.chartColor \}\} \/>\s*<div className="pl-2 flex flex-col gap-4">'

replacement_card_wrap = """<div key={idx} onClick={() => setActiveCategory(idx)} className={`bg-[#121212] border rounded-2xl p-5 flex flex-col xl:flex-row relative overflow-hidden group transition-all cursor-pointer gap-6 ${activeCategory === idx ? 'border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)] bg-white/[0.02]' : 'border-white/5 hover:border-white/15'}`}>
                      <div className={`absolute top-0 left-0 w-1 h-full`} style={{ backgroundColor: cat.chartColor }} />
                      <div className="pl-1 flex-1 flex flex-col gap-4">"""

content = re.sub(target_card_wrap, replacement_card_wrap, content)

# The inner stats structure (flex flex-col sm:flex-row gap-6 mt-2) should just be changed to be the right column in xl
target_stats_block = re.compile(r'<div className="flex flex-col sm:flex-row gap-6 mt-2">\s*<div className="flex flex-col gap-4 justify-center sm:w-1/3">\s*\{cat\.metrics\.map\(\(m, i\) => \(\s*<div key=\{i\}>\s*<div className="text-\[9px\] font-mono text-slate-500 uppercase">\{m\.label\}<\/div>\s*<div className="text-lg font-light text-white">\{m\.value\}<\/div>\s*<\/div>\s*\)\)\}\s*<\/div>\s*<div className="h-\[120px\] sm:flex-1 w-full bg-white\/\[0\.02\] border border-white\/5 rounded-xl p-3 relative">')

replacement_stats_block = """</div>
                      <div className="xl:w-[280px] shrink-0 flex flex-col gap-3">
                        <div className="flex gap-3">
                          {cat.metrics.map((m, i) => (
                            <div key={i} className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                              <div className="text-[8px] font-mono text-slate-500 uppercase truncate mb-1">{m.label}</div>
                              <div className="text-[13px] font-medium text-white leading-none">{m.value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="h-[90px] w-full bg-white/[0.02] border border-white/5 rounded-lg p-2 relative">"""

content = target_stats_block.sub(replacement_stats_block, content)

# Also fix the closing div of the card to account for the removed wrapper div if necessary
# Before, it was:
#                       </div>
#                     </div>
#                   ))}
# Now, we closed `<div className="pl-1 flex-1 flex flex-col gap-4">` at the start of the replacement_stats_block. So the number of divs is correct.

with open('src/components/MedicalScreening.tsx', 'w') as f:
    f.write(content)
print("Layout patched successfully")
