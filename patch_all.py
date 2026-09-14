import re

with open('src/components/MedicalScreening.tsx', 'r') as f:
    content = f.read()

# 1. Update Imports
content = re.sub(
    r'import scanVitali from "../assets/images/.*?\nimport scanMetabolici from "../assets/images/.*?\nimport scanOrgano from "../assets/images/.*?\nimport scanInfiammatorio from "../assets/images/.*?\n',
    'import scanVitali from "../assets/images/scan_vitali_clean_1789332794984.jpg";\nimport scanMetabolici from "../assets/images/scan_metabolici_clean_1789332805433.jpg";\nimport scanOrgano from "../assets/images/scan_organo_clean_1789332814869.jpg";\nimport scanInfiammatorio from "../assets/images/scan_infiammatorio_clean_1789332823629.jpg";\nimport { X } from "lucide-react";\n',
    content
)

# 2. Add Detailed Content Constants & Expanded State
detailed_content = """
const CATEGORY_DETAILS = [
  {
    // 0: Vitali
    obiettivo: "Il controllo della propria sicurezza e stabilità immediata.",
    punti: [
      { t: "Monitoraggio Emodinamico", d: "Valutazione della pressione arteriosa (sistolica/diastolica) e della salute dei vasi." },
      { t: "Efficienza Respiratoria", d: "Livelli di saturazione dell'ossigeno nel sangue e frequenza respiratoria a riposo e sotto sforzo." },
      { t: "Cronotropismo e Ritmo", d: "Analisi della frequenza cardiaca a riposo (escludendo bradicardie o tachicardie) e variabilità cardiaca (HRV)." },
      { t: "Termoregolazione", d: "Stato del bilancio termico corporeo (segnali di infezioni o alterazioni ipotalamiche)." }
    ],
    allarmi: "Giramenti di testa improvvisi, stanchezza inspiegabile alzandosi in piedi, affanno anche a riposo, palpitazioni o sensazione di \\"battito mancato\\", estremità fredde.",
    cause: "Disidratazione, stress acuto, ansia, carenza di sonno, sedentarietà prolungata o sforzi fisici eccessivi senza adeguato allenamento.",
    consigli: "Tecniche di respirazione guidata (es. respirazione a cassetta per abbassare i battiti), corretto apporto di acqua giornaliero, monitoraggio autonomo a casa con strumenti certificati."
  },
  {
    // 1: Infiammatorio
    obiettivo: "La mappa delle proprie difese biologiche e dell'infiammazione silente.",
    punti: [
      { t: "Immunocompetenza", d: "Formula leucocitaria completa (linfociti, neutrofili, ecc.) per capire se il sistema immunitario è reattivo, esausto o sotto attacco." },
      { t: "Infiammazione Sistemica di Basso Grado", d: "Analisi della Proteina C-Reattiva ad alta sensibilità (hs-PCR), il biomarcatore principe per scovare le infiammazioni nascoste che danneggiano i tessuti." },
      { t: "Reattività Allergica e Autoimmune", d: "Presenza di anticorpi anomali o livelli di eosinofili legati a risposte immunitarie alterate." }
    ],
    allarmi: "Ammalarsi spesso (più di 3-4 influenze o raffreddori all'anno), dolori articolari o muscolari vaganti e senza una causa fisica, problemi cutanei improvvisi (sfoghi, dermatiti), sensazione di non recuperare mai le energie.",
    cause: "Infiammazione intestinale (la famosa disbiosi, poiché il 70% del sistema immunitario risiede nell'intestino), infezioni virali passate e mai del tutto smaltite, sonno di scarsa qualità.",
    consigli: "Assunzione di cibi antinfiammatori (ricchi di Omega-3 come il pesce azzurro o noci), cura del microbiota intestinale tramite fermenti lattici e cibi fermentati, esposizione solare controllata per la vitamina D."
  },
  {
    // 2: Metabolici
    obiettivo: "La chiave per la prevenzione dell'invecchiamento precoce e delle malattie croniche.",
    punti: [
      { t: "Glicolisi e Gestione Zuccheri", d: "Livelli di glicemia a digiuno ed emoglobina glicata (per capire se rischia l'insulino-resistenza o il diabete)." },
      { t: "Profilo Lipidico e Cardio-Rischio", d: "Bilancio tra colesterolo LDL, HDL e trigliceridi (salute delle arterie)." },
      { t: "Antropometria Clinica", d: "Analisi della composizione corporea (rapporto tra massa grassa, massa magra e soprattutto il livello di grasso viscerale addominale)." },
      { t: "Efficienza Mitocondriale", d: "Come il corpo converte il cibo in energia cellulare e la stabilità dei livelli energetici durante il giorno." }
    ],
    allarmi: "Sonnolenza post-prandiale (subito dopo mangiato), attacchi di fame chimica o desiderio continuo di dolci, aumento del girovita anche senza mangiare di più, difficoltà a perdere peso.",
    cause: "Dieta troppo ricca di zuccheri raffinati e cibi ultra-processati, mancanza di massa muscolare (il muscolo è il principale consumatore di zuccheri), stress cronico che alza il cortisolo.",
    consigli: "Inserire allenamenti di forza (pesi o corpo libero), strutturare i pasti iniziando dalle fibre (verdura) per bloccare i picchi glicemici, praticare il digiuno intermittente (se consigliato dal medico)."
  },
  {
    // 3: Organo
    obiettivo: "La certezza che i sistemi di purificazione e ossigenazione interni stiano reggendo il carico biologico.",
    punti: [
      { t: "Efficienza di Filtrazione Renale", d: "Esame della creatinina, dell'azotemia e del filtrato glomerulare (eGFR) per misurare la depurazione dei liquidi." },
      { t: "Funzione Epatica e Detossificazione", d: "Livelli delle transaminasi (ALT/AST) e bilirubina per verificare lo stato di salute del fegato." },
      { t: "Profilo Emopoietico (Emocromo)", d: "Conteggio dei globuli rossi, emoglobina e piastrine (diagnosi di anemie o problemi di coagulazione)." },
      { t: "Bilancio Elettrolitico", d: "Livelli di sodio, potassio e calcio nel sangue, fondamentali per la contrazione muscolare e il sistema nervoso." }
    ],
    allarmi: "Pallore del viso e delle mucose, unghie e capelli fragili, urine troppo scure o con molta schiuma, digestione estremamente lenta e pesantezza persistente nella zona destra dell'addome.",
    cause: "Abuso di farmaci da banco (es. troppi antinfiammatori o paracetamolo che affaticano fegato e reni), consumo frequente di alcol, carenza di ferro, vitamina B12 o acido folico nella dieta.",
    consigli: "Cicli di idratazione profonda, riduzione drastica di cibi tossici per il fegato, introduzione di alimenti ricchi di ferro biodisponibile o strategie per migliorare l'assorbimento gastrico."
  }
];
"""

# Insert before MedicalScreening component
content = content.replace("export default function MedicalScreening", detailed_content + "\nexport default function MedicalScreening")

# Add state for expanded category
content = content.replace("const [showTimeline, setShowTimeline] = useState(false);", "const [showTimeline, setShowTimeline] = useState(false);\n  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);")


# 3. Fix Timeline Modal 
target_timeline = """                {showTimeline && (
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
                )}"""

replacement_timeline = """                {showTimeline && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#121212] border border-white/10 p-8 rounded-3xl w-full max-w-4xl relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                      <button onClick={() => setShowTimeline(false)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
                        <X className="w-5 h-5" />
                      </button>
                      <h2 className="text-2xl font-light text-white mb-8">Storico Longevità (Trend Globale)</h2>
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[...history].reverse()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                            <XAxis 
                              dataKey="date" 
                              stroke="rgba(255,255,255,0.2)" 
                              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace' }} 
                              tickFormatter={(val) => val.split(',')[0]}
                              dy={10}
                            />
                            <YAxis 
                              stroke="rgba(255,255,255,0.2)" 
                              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace' }}
                              domain={[0, 100]} 
                              dx={-10}
                            />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const score = payload[0].value as number;
                                  return (
                                    <div className="bg-black/90 border border-white/10 p-4 rounded-xl backdrop-blur-md flex flex-col gap-2 shadow-xl">
                                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{label}</span>
                                      <span className={`text-3xl font-light leading-none ${score < 40 ? 'text-red-500' : score < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {score}%
                                      </span>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeDasharray: '4 4' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#10b981" 
                              strokeWidth={3} 
                              dot={{ r: 6, fill: '#121212', stroke: '#10b981', strokeWidth: 2 }}
                              activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}"""
content = content.replace(target_timeline, replacement_timeline)

# 4. Images Mapping Logic (we are changing the array order to put Organo and Metabolici on the same row)
# The order we want is: Vitali, Infiammatorio, Metabolici, Organo.
# Before: 
# {activeCategory === 0 && <img src={scanVitali} ... />}
# {activeCategory === 1 && <img src={scanMetabolici} ... />}
# {activeCategory === 2 && <img src={scanOrgano} ... />}
# {activeCategory === 3 && <img src={scanInfiammatorio} ... />}

content = content.replace("{activeCategory === 1 && <img src={scanMetabolici}", "{activeCategory === 1 && <img src={scanInfiammatorio}")
content = content.replace("{activeCategory === 2 && <img src={scanOrgano}", "{activeCategory === 2 && <img src={scanMetabolici}")
content = content.replace("{activeCategory === 3 && <img src={scanInfiammatorio}", "{activeCategory === 3 && <img src={scanOrgano}")
# Now:
# 0 -> Vitali
# 1 -> Infiammatorio
# 2 -> Metabolici
# 3 -> Organo


# 5. Right Panel - Expandable Cards
# Array mapping changed to match the new order!
target_map = """{[result.vitali, result.metabolici, result.organo, result.infiammatorio].map((cat, idx) => ("""
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

# We need to replace the entire map block. Since the exact string contains a lot of HTML, we can use a regex to match from `{[result.vitali` to the `</div>` that closes the map loop.
pattern_to_replace = re.compile(r'\{\[result\.vitali, result\.metabolici, result\.organo, result\.infiammatorio\]\.map\(\(cat, idx\) => \([\s\S]*?\)\n                  \}\)', re.DOTALL)
content = pattern_to_replace.sub(replacement_map, content)


with open('src/components/MedicalScreening.tsx', 'w') as f:
    f.write(content)
