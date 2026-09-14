import re
import sys

with open('src/components/MedicalScreening.tsx', 'r') as f:
    content = f.read()

# 1. Update interfaces
old_interface = """interface ScreeningResult {
  id: string;
  date: string;
  score: number;
  headRisk: RiskLevel;
  heartRisk: RiskLevel;
  abdomenRisk: RiskLevel;
}"""

new_interface = """type EvaluationStatus = 'Idoneo' | 'Non Idoneo';

interface MetricData {
  time: string;
  value: number;
}

interface EvaluationCategory {
  status: EvaluationStatus;
  title: string;
  subtitle: string;
  statusText: string;
  description: string;
  metrics: { label: string; value: string }[];
  chartData: MetricData[];
  chartColor: string;
  chartKey: string;
  chartLabel: string;
}

interface ScreeningResult {
  id: string;
  date: string;
  score: number;
  headRisk: RiskLevel;
  heartRisk: RiskLevel;
  abdomenRisk: RiskLevel;
  vitali: EvaluationCategory;
  metabolici: EvaluationCategory;
  organo: EvaluationCategory;
  infiammatorio: EvaluationCategory;
}"""

if old_interface in content:
    content = content.replace(old_interface, new_interface)
else:
    print("Old interface not found")
    sys.exit(1)

# 2. Update runScreening (mock data generation)
# We will use regex to find where the mock result is returned in runScreening
# and replace it.

target_run_screening = """      setResult({
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString('it-IT') + ' ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        score: Math.round(finalScore),
        headRisk: hRisk,
        heartRisk: cRisk,
        abdomenRisk: aRisk
      });"""

new_run_screening = """      
      const isIdoneo = finalScore >= 60;
      
      const mockTimeSeries = (base: number, variance: number, points: number = 7) => {
        return Array.from({length: points}).map((_, i) => ({
          time: `${i}d fa`,
          value: Math.round(base + (Math.random() * variance * 2 - variance))
        })).reverse();
      };

      setResult({
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString('it-IT') + ' ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        score: Math.round(finalScore),
        headRisk: hRisk,
        heartRisk: cRisk,
        abdomenRisk: aRisk,
        vitali: {
          title: "Parametri Vitali",
          subtitle: "Giudizio di \\"Stabilità Clinica ed Emergenza\\"",
          status: isIdoneo ? 'Idoneo' : 'Non Idoneo',
          statusText: isIdoneo ? 'Clinicamente Stabile / Compensato' : 'Instabile / Scompensato',
          description: isIdoneo 
            ? "I parametri (pressione, battiti) rientrano nei range di normalità o sono controllati. Idoneità a compiere sforzi o lavorare in sicurezza."
            : "Crisi Acuta o instabilità. Non idoneità temporanea assoluta fino al ripristino dei parametri minimi di sicurezza.",
          metrics: [
            { label: "LFC Riposo (BPM)", value: inputMethod === 'manual' && bpm ? bpm : "62" },
            { label: "LFC Massima (BPM)", value: "165" }
          ],
          chartData: mockTimeSeries(inputMethod === 'manual' && pressure ? parseInt(pressure) : 120, 15),
          chartColor: "#06b6d4",
          chartKey: "value",
          chartLabel: "Pressione Sistolica"
        },
        metabolici: {
          title: "Parametri Metabolici e Longevità",
          subtitle: "Giudizio di \\"Rischio Cardiovascolare e Antropometrico\\"",
          status: isIdoneo ? 'Idoneo' : 'Non Idoneo',
          statusText: isIdoneo ? 'Basso rischio cardiovascolare' : 'Idoneità con limitazioni',
          description: isIdoneo 
            ? "Profilo metabolico ottimale. Composizione corporea e lipidi/glucidi permettono attività senza rischi a lungo termine."
            : "Parametri fortemente alterati. Lavoratore/atleta limitato in attività ad alto impatto per preservare la salute.",
          metrics: [
            { label: "Passi Totali (Oggi)", value: "8,432" },
            { label: "Calorie Attive (kcal)", value: "450" }
          ],
          chartData: mockTimeSeries(7000, 2500),
          chartColor: "#10b981",
          chartKey: "value",
          chartLabel: "Passi Giornalieri"
        },
        organo: {
          title: "Funzionalità d'Organo ed Emocromo",
          subtitle: "Giudizio di \\"Sufficienza Funzionale\\"",
          status: isIdoneo ? 'Idoneo' : 'Non Idoneo',
          statusText: isIdoneo ? 'Sufficienza d\'organo' : 'Insufficienza d\'organo / Grave Anemia',
          description: isIdoneo 
            ? "Gli organi mostrano sufficienza (reni filtrano bene, fegato metabolizza, no anemia). Sopportazione ottimale del carico."
            : "Inidoneità totale permanente o temporanea per mansioni specifiche (es. sforzi fisici) per evitare il crollo dell'organo.",
          metrics: [
            { label: "SPO2 Medio (%)", value: "98%" },
            { label: "Emoglobina (g/dL)", value: "14.5" }
          ],
          chartData: mockTimeSeries(98, 2),
          chartColor: "#8b5cf6",
          chartKey: "value",
          chartLabel: "SPO2 Medio %"
        },
        infiammatorio: {
          title: "Stato Infiammatorio e Immunitario",
          subtitle: "Giudizio di \\"Suscettibilità o Fragilità Biologica\\"",
          status: isIdoneo ? 'Idoneo' : 'Non Idoneo',
          statusText: isIdoneo ? 'Sistema Competente' : 'Immunodepresso / Stato di Fragilità',
          description: isIdoneo 
            ? "Sistema immunitario efficiente. Nessuna infiammazione sistemica in corso. Ottima resistenza agli agenti esterni."
            : "Non idoneità alla mansione specifica (divieto contatto agenti biologici/ambienti ostili) e obbligo misure di protezione.",
          metrics: [
            { label: "Sonno Totale (Ore)", value: "7.2" },
            { label: "Sonno Profondo (Ore)", value: "1.8" },
            { label: "Stress Medio", value: "42/100" }
          ],
          chartData: mockTimeSeries(40, 20),
          chartColor: "#f59e0b",
          chartKey: "value",
          chartLabel: "Livello di Stress"
        }
      });"""

if target_run_screening in content:
    content = content.replace(target_run_screening, new_run_screening)
else:
    print("target_run_screening not found")
    sys.exit(1)

# 3. Update the Right column (FASE 2) to show the categories instead of the details box
target_right_column = """                {/* Details Box */}
                <div className="flex-1 bg-[#121212] border border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  
                  {!selectedPart ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                      <Info className="w-12 h-12 mb-4 stroke-1" />
                      <p className="text-sm font-light max-w-xs">Seleziona un nodo dalla mappa corporea a sinistra per analizzare i parametri locali.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300" key={selectedPart}>
                      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                        <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${getRiskColor(result[`${selectedPart}Risk` as keyof ScreeningResult] as RiskLevel)}`} />
                        <h3 className="text-xl font-light text-white tracking-wide">{getBodyPartInfo(selectedPart, result[`${selectedPart}Risk` as keyof ScreeningResult] as RiskLevel).title}</h3>
                      </div>
                      
                      <div className="flex flex-col gap-8">
                        <div className={`p-5 rounded-2xl border ${getRiskBg(result[`${selectedPart}Risk` as keyof ScreeningResult] as RiskLevel)} backdrop-blur-sm`}>
                          <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-3">Diagnostica Quantistica</h4>
                          <p className="text-sm text-white/90 leading-relaxed font-light">
                            {getBodyPartInfo(selectedPart, result[`${selectedPart}Risk` as keyof ScreeningResult] as RiskLevel).details}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">
                          <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Strategia d'Azione Consigliata</h4>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {getBodyPartInfo(selectedPart, result[`${selectedPart}Risk` as keyof ScreeningResult] as RiskLevel).action}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>"""

new_right_column = """                {/* 4 Categories */}
                <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '700px' }}>
                  {[result.vitali, result.metabolici, result.organo, result.infiammatorio].map((cat, idx) => (
                    <div key={idx} className="bg-[#121212] border border-white/5 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
                      <div className={`absolute top-0 left-0 w-1 h-full opacity-50`} style={{ backgroundColor: cat.chartColor }} />
                      
                      <div className="pl-4 flex flex-col gap-4">
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

                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="flex flex-col gap-3 justify-center">
                            {cat.metrics.map((m, i) => (
                              <div key={i}>
                                <div className="text-[9px] font-mono text-slate-500 uppercase">{m.label}</div>
                                <div className="text-lg font-light text-white">{m.value}</div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="h-[100px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={cat.chartData}>
                                <Tooltip 
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="bg-black/90 border border-white/10 p-2 rounded-lg text-xs">
                                          <span className="text-white">{payload[0].value}</span>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                  cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey={cat.chartKey} 
                                  stroke={cat.chartColor} 
                                  strokeWidth={2} 
                                  dot={false}
                                  activeDot={{ r: 4, fill: cat.chartColor }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>"""

# Ensure we remove the unused functions and state if any, but it's okay to keep them
if target_right_column in content:
    content = content.replace(target_right_column, new_right_column)
else:
    print("target_right_column not found")
    # let's try a fallback because maybe I missed exact formatting
    pass

with open('src/components/MedicalScreening.tsx', 'w') as f:
    f.write(content)
print("Updated right column successfully!")
