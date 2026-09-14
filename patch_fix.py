import re

with open('src/components/MedicalScreening.tsx', 'r') as f:
    content = f.read()

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
    print("Interface patched")

old_new_result = """      const newResult: ScreeningResult = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
        score: finalScore,
        headRisk: hRisk,
        heartRisk: cRisk,
        abdomenRisk: aRisk
      };"""

new_result_code = """      const mockTimeSeries = (base: number, variance: number, points: number = 7) => {
        return Array.from({length: points}).map((_, i) => ({
          time: `${i}d fa`,
          value: Math.round(base + (Math.random() * variance * 2 - variance))
        })).reverse();
      };

      const newResult: ScreeningResult = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
        score: finalScore,
        headRisk: hRisk,
        heartRisk: cRisk,
        abdomenRisk: aRisk,
        vitali: {
          title: "Parametri Vitali",
          subtitle: "Giudizio di \\"Stabilità Clinica ed Emergenza\\"",
          status: finalScore >= 50 ? 'Idoneo' : 'Non Idoneo',
          statusText: finalScore >= 50 ? 'Clinicamente Stabile / Compensato' : 'Instabile / Scompensato',
          description: finalScore >= 50 
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
          status: finalScore >= 70 ? 'Idoneo' : 'Non Idoneo',
          statusText: finalScore >= 70 ? 'Basso rischio cardiovascolare' : 'Idoneità con limitazioni',
          description: finalScore >= 70 
            ? "Profilo metabolico ottimale. Composizione corporea e lipidi/glucidi permettono attività senza rischi a lungo termine."
            : "Parametri fortemente alterati. Lavoratore/atleta limitato in attività ad alto impatto per preservare la salute.",
          metrics: [
            { label: "Passi Totali (Oggi)", value: "8.432" },
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
          status: finalScore >= 60 ? 'Idoneo' : 'Non Idoneo',
          statusText: finalScore >= 60 ? 'Sufficienza d\\'organo' : 'Insufficienza d\\'organo / Grave Anemia',
          description: finalScore >= 60 
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
          status: finalScore >= 65 ? 'Idoneo' : 'Non Idoneo',
          statusText: finalScore >= 65 ? 'Sistema Competente' : 'Immunodepresso / Stato di Fragilità',
          description: finalScore >= 65 
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
      };"""

if old_new_result in content:
    content = content.replace(old_new_result, new_result_code)
    print("Run screening patched")
else:
    print("Could not find old_new_result!")

with open('src/components/MedicalScreening.tsx', 'w') as f:
    f.write(content)
