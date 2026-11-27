import { LanguageCode } from '../types';

export interface QuantumBiInterviewState {
  detectedSector: string;
  sectorBrief: string;
  allEntities: string[];
  numCols: number;
  selectedColsCount: number;
  qubitPrecision: number;
  criticalThreshold: number;
  stressScenario: string;
}

type EngineLang = 'it' | 'en' | 'zh' | 'de' | 'fr' | 'ja';

function resolveBiLang(lang?: LanguageCode): EngineLang {
  if (lang === 'it' || lang === 'en' || lang === 'zh' || lang === 'de' || lang === 'fr' || lang === 'ja') {
    return lang;
  }
  return 'en';
}

export function generateQuantumBiLocalResponse(
  userText: string,
  history: { role: string; text: string }[],
  state: QuantumBiInterviewState,
  language: LanguageCode = 'it'
): {
  text: string;
  jsonCode?: string;
  pythonCode?: string;
  qasmCode?: string;
} {
  const lang = resolveBiLang(language);
  const cleanUser = (userText || '').trim();
  const upper = cleanUser.toUpperCase();

  const botQuestions = history.filter(h => h.role === 'bot' || h.role === 'model');
  const questionCount = botQuestions.length;

  const entities = state.allEntities.length > 0 ? state.allEntities : ['Asset_1', 'Asset_2', 'Asset_3'];
  const assetsSummary = entities.slice(0, 3).join(', ');
  const totalCols = Math.max(1, state.numCols || 3);

  // STEP 1 -> Ask Q2 (Qubit precision)
  if (questionCount <= 1) {
    let chosenCols = parseInt(cleanUser.replace(/[^\d]/g, ''), 10);
    if (isNaN(chosenCols) || chosenCols <= 0 || chosenCols > totalCols) {
      chosenCols = totalCols;
    }
    const q2Texts: Record<EngineLang, string> = {
      it: `✅ **Dimensioni Storiche Configurate**: Selezionate **${chosenCols}** colonne storiche su tutte le entità rilevate (${assetsSummary}).\n\n### DOMANDA 2: Risoluzione di Calcolo Quantistico\nQuale livello di risoluzione e accuratezza quantistica vuoi utilizzare per la codifica dei dati?\n• **[A] Risoluzione Standard (Calcolo Rapido)**: Usa 3 qubit per variabile. Ideale per esecuzione veloce ed elevata fedeltà su hardware NISQ.\n• **[B] Alta Precisione (Analisi Approfondita)**: Usa 5 qubit per variabile per una risoluzione più fine dello statevector.\n\n👉 *Rispondi con **A** (Standard) o **B** (Alta Precisione).*`,
      en: `✅ **Historical Dimensions Configured**: Selected **${chosenCols}** historical column(s) across all detected entities (${assetsSummary}).\n\n### QUESTION 2: Quantum Calculation Resolution\nWhat level of quantum resolution and accuracy do you want for the data encoding?\n• **[A] Standard Resolution (Fast Calculation)**: Uses 3 qubits per data variable. Ideal for fast execution and high gate fidelity on NISQ hardware.\n• **[B] High Precision (In-Depth Analysis)**: Uses 5 qubits per data variable for finer statevector resolution.\n\n👉 *Reply with **A** (Standard) or **B** (High Precision).*`,
      zh: `✅ **历史维度已配置**：已为所有检测实体（${assetsSummary}）选择 **${chosenCols}** 个历史数据列。\n\n### 第 2 题：量子计算精度\n您希望采用哪种量子编码分辨率与精度？\n• **[A] 标准分辨率（快速计算）**：每个变量使用 3 个量子比特，适合 NISQ 硬件快速运行与高保真度。\n• **[B] 高精度（深度分析）**：每个变量使用 5 个量子比特，获得更精细的态矢分辨率。\n\n👉 *请回复 **A** 或 **B**。*`,
      de: `✅ **Historische Dimensionen konfiguriert**: **${chosenCols}** historische Spalte(n) für alle erkannten Entitäten (${assetsSummary}) ausgewählt.\n\n### FRAGE 2: Quanten-Berechnungsauflösung\nWelche Auflösung wünschen Sie für die Datencodierung?\n• **[A] Standardauflösung (Schnell)**: 3 Qubits pro Variable.\n• **[B] Hohe Präzision (Tiefenanalyse)**: 5 Qubits pro Variable.\n\n👉 *Antworten Sie mit **A** oder **B**.*`,
      fr: `✅ **Dimensions historiques configurées** : **${chosenCols}** colonne(s) historique(s) sélectionnée(s) pour (${assetsSummary}).\n\n### QUESTION 2 : Résolution Quantique\nQuel niveau de précision souhaitez-vous ?\n• **[A] Résolution Standard (Rapide)** : 3 qubits par variable.\n• **[B] Haute Précision (Approfondie)** : 5 qubits par variable.\n\n👉 *Répondez par **A** ou **B**.*`,
      ja: `✅ **履歴次元を設定しました**：検出された全エンティティ（${assetsSummary}）に対し **${chosenCols}** 列を選択しました。\n\n### 質問 2：量子計算の解像度\nデータエンコーディングの精度を選択してください：\n• **[A] 標準解像度（高速）**：変数あたり 3 量子ビット\n• **[B] 高精度（詳細分析）**：変数あたり 5 量子ビット\n\n👉 ***A** または **B** で回答してください。*`,
    };
    return { text: q2Texts[lang] };
  }

  // STEP 2 -> Ask Q3 (Critical threshold %)
  if (questionCount === 2) {
    const isHigh = upper === 'B' || upper.includes('HIGH') || upper.includes('ALTA') || upper.includes('5');
    const precision = isHigh ? 5 : 3;
    const isFin = state.sectorBrief.toLowerCase().includes('fin');
    const q3Texts: Record<EngineLang, string> = {
      it: `✅ **Precisione Quantistica**: Impostati **${precision} qubit** per variabile.\n\n### DOMANDA 3: Soglia Critica / Tolleranza al Rischio (%)\n${isFin ? 'Qual è la tolleranza massima al rischio (limite VaR o tasso di default) in percentuale? (Consigliato: **1% - 5%**)' : 'Qual è la soglia critica di saturazione/allerta in percentuale? (Consigliato: **10% - 20%** o **75%**)'}`,
      en: `✅ **Quantum Precision**: Configured **${precision} qubits** per variable.\n\n### QUESTION 3: Critical Threshold / Risk Tolerance (%)\n${isFin ? 'What is your maximum risk tolerance (VaR limit or default rate) as a percentage? (Recommended: **1% - 5%**)' : 'What critical saturation or alert threshold percentage would you like to apply? (Recommended: **10% - 20%** or **75%**)'}`,
      zh: `✅ **量子精度已设定**：每个变量 **${precision} 个量子比特**。\n\n### 第 3 题：临界阈值 / 风险容忍度 (%)\n请输入百分比阈值（金融建议 **1% - 5%**，运营/网络建议 **70% - 85%**）。`,
      de: `✅ **Quanten-Präzision**: **${precision} Qubits** pro Variable festgelegt.\n\n### FRAGE 3: Kritischer Schwellenwert / Risikotoleranz (%)\nWie hoch ist der gewünschte Schwellenwert in Prozent? (Empfohlen: **1% - 5%** oder **70% - 85%**)`,
      fr: `✅ **Précision Quantique** : **${precision} qubits** par variable.\n\n### QUESTION 3 : Seuil Critique / Tolérance au Risque (%)\nQuel seuil critique en pourcentage souhaitez-vous appliquer ? (Recommandé : **1% - 5%** ou **70% - 85%**)`,
      ja: `✅ **量子精度を設定**：変数あたり **${precision} 量子ビット**。\n\n### 質問 3：臨界しきい値 / リスク許容度 (%)\nパーセンテージでしきい値を入力してください（推奨：**1% - 5%** または **70% - 85%**）。`,
    };
    return { text: q3Texts[lang] };
  }

  // STEP 3 -> Ask Q4 (Stress scenario)
  if (questionCount === 3) {
    const q4Texts: Record<EngineLang, string> = {
      it: `✅ **Soglia acquisita** (${cleanUser}).\n\n### DOMANDA 4: Scenario di Stress Test\nSeleziona lo scenario da simulare sul circuito:\n• **[Normale]** — Condizioni operative standard (fattore 1.0x)\n• **[Shock Geopolitico]** — Picco di volatilità e correlazioni (fattore 1.5x)\n• **[Iperinflazione / Blocco Fornitura]** — Stress estremo di sistema (fattore 2.0x)`,
      en: `✅ **Threshold configured** (${cleanUser}).\n\n### QUESTION 4: Stress Test Scenario\nChoose the stress scenario for circuit compilation:\n• **[Normal]** — Standard operating regime (1.0x factor)\n• **[Geopolitical Shock]** — Elevated volatility & correlation spike (1.5x factor)\n• **[Hyperinflation / Supply Disruption]** — Extreme systemic stress (2.0x factor)`,
      zh: `✅ **阈值已确认**（${cleanUser}）。\n\n### 第 4 题：压力测试情景\n请选择情景：**[Normal]**（1.0x）、**[Geopolitical Shock]**（1.5x）或 **[Hyperinflation / Supply Disruption]**（2.0x）。`,
      de: `✅ **Schwellenwert erfasst** (${cleanUser}).\n\n### FRAGE 4: Stresstest-Szenario\nWählen Sie: **[Normal]** (1.0x), **[Geopolitical Shock]** (1.5x) oder **[Hyperinflation / Supply Disruption]** (2.0x).`,
      fr: `✅ **Seuil enregistré** (${cleanUser}).\n\n### QUESTION 4 : Scénario de Stress\nChoisissez : **[Normal]** (1.0x), **[Geopolitical Shock]** (1.5x) ou **[Hyperinflation / Supply Disruption]** (2.0x).`,
      ja: `✅ **しきい値を設定しました**（${cleanUser}）。\n\n### 質問 4：ストレステスト・シナリオ\n選択してください：**[Normal]** (1.0x)、**[Geopolitical Shock]** (1.5x)、**[Hyperinflation / Supply Disruption]** (2.0x)。`,
    };
    return { text: q4Texts[lang] };
  }

  // STEP 4 -> Final deterministic compilation (OpenQASM 3.0 + Python Qiskit + JSON)
  const selectedCols = Math.max(1, Math.min(totalCols, state.selectedColsCount || totalCols));
  const precision = state.qubitPrecision === 5 ? 5 : 3;
  const rawThresh = state.criticalThreshold > 1 ? state.criticalThreshold / 100 : state.criticalThreshold;
  const safeThresh = Math.max(0.01, Math.min(1.0, rawThresh || 0.05));
  const stressLabel = cleanUser || state.stressScenario || 'Normal';
  const stressLow = stressLabel.toLowerCase();
  const stressMultiplier =
    stressLow.includes('iper') || stressLow.includes('hyper') || stressLow.includes('blocco') || stressLow.includes('disrup') || stressLow.includes('guasto')
      ? 2.0
      : stressLow.includes('shock') || stressLow.includes('picco') || stressLow.includes('peak')
      ? 1.5
      : 1.0;

  // Cap total qubits at IBM 127 utility-scale limit
  const dataQubits = Math.min(126, Math.max(2, entities.length * selectedCols * precision));
  const totalQubits = Math.min(127, dataQubits + 1);
  const thetaVal = 2 * Math.asin(Math.sqrt(Math.min(1, safeThresh * stressMultiplier)));
  const thetaFixed = thetaVal.toFixed(6);

  const entityWeights = entities.slice(0, Math.min(entities.length, 32)).map((name, idx) => {
    const baseP = Math.min(0.99, Math.max(0.05, safeThresh * stressMultiplier * (1 + (idx % 3) * 0.15)));
    return {
      id: name,
      peso: Number(baseP.toFixed(4)),
      theta_rad: Number((2 * Math.asin(Math.sqrt(baseP))).toFixed(6)),
    };
  });

  const jsonObj = {
    objective: 'Quantum Business Intelligence & Risk Estimation',
    sector: state.detectedSector,
    entities: entityWeights,
    selected_historical_columns: selectedCols,
    qubit_precision_per_variable: precision,
    critical_threshold: safeThresh,
    stress_scenario: stressLabel,
    stress_multiplier: stressMultiplier,
    total_qubits: totalQubits,
    ibm_utility_limit: 127,
  };
  const jsonCode = JSON.stringify(jsonObj, null, 2);

  // OpenQASM 3.0 compliant circuit (RY initialization + CX/CP entanglement)
  const qasmLines: string[] = [
    'OPENQASM 3.0;',
    'include "stdgates.inc";',
    `// Sector: ${state.detectedSector} | Stress: ${stressLabel} (${stressMultiplier.toFixed(1)}x)`,
    `qubit[${totalQubits}] q;`,
    `bit[${totalQubits}] c;`,
    '',
  ];
  for (let i = 0; i < totalQubits; i++) {
    const ent = entityWeights[i % entityWeights.length];
    const qTheta = ent ? ent.theta_rad.toFixed(6) : thetaFixed;
    qasmLines.push(`ry(${qTheta}) q[${i}]; // ${ent?.id || `Asset_${i}`}`);
  }
  qasmLines.push('');
  for (let i = 0; i < totalQubits - 1; i++) {
    if (safeThresh * stressMultiplier >= 0.6) {
      qasmLines.push(`cx q[${i}], q[${i + 1}];`);
    } else {
      const cpAngle = ((Math.PI / 2) * Math.min(1, safeThresh * stressMultiplier)).toFixed(6);
      qasmLines.push(`cp(${cpAngle}) q[${i}], q[${i + 1}];`);
    }
  }
  qasmLines.push('');
  for (let i = 0; i < totalQubits; i++) {
    qasmLines.push(`c[${i}] = measure q[${i}];`);
  }
  const qasmCode = qasmLines.join('\n');

  const pythonCode = `# Quantum BI Compiler (Qiskit 1.x/2.x Primitives V2)
# Sector: ${state.detectedSector} | Stress: ${stressLabel}
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.primitives import StatevectorSampler
from qiskit.qasm3 import dumps as qasm3_dumps

entities = ${JSON.stringify(entityWeights.map(e => e.id))}
thetas = ${JSON.stringify(entityWeights.map(e => e.theta_rad))}
num_qubits = ${totalQubits}
critical_threshold = ${safeThresh}
stress_multiplier = ${stressMultiplier}

qr = QuantumRegister(num_qubits, 'q')
cr = ClassicalRegister(num_qubits, 'c')
qc = QuantumCircuit(qr, cr, name="Quantum_BI_Pipeline")

for i in range(num_qubits):
    qc.ry(thetas[i % len(thetas)], qr[i])

for i in range(num_qubits - 1):
    if critical_threshold * stress_multiplier >= 0.60:
        qc.cx(qr[i], qr[i + 1])
    else:
        qc.cp((np.pi / 2.0) * min(1.0, critical_threshold * stress_multiplier), qr[i], qr[i + 1])

qc.measure(qr, cr)

sampler = StatevectorSampler()
job = sampler.run([qc], shots=1024)
counts = job.result()[0].data.c.get_counts()
print("Settore:", "${state.detectedSector}")
print("Qubit Allocati:", num_qubits)
print("Top Campioni Quantistici:", sorted(counts.items(), key=lambda kv: kv[1], reverse=True)[:5])
print(qasm3_dumps(qc))
`;

  const doneMsg: Record<EngineLang, string> = {
    it: `✅ **Configurazione Quantum BI completata!**\n\nHo compilato il modello deterministico per **${state.detectedSector}** su **${entities.length}** entità (${totalQubits} qubit allocati, soglia ${(safeThresh * 100).toFixed(1)}%, scenario **${stressLabel}**).\n\nI blocchi **JSON**, **Python Qiskit 1.x** e **OpenQASM 3.0** sono ora disponibili nei rispettivi pannelli di destra.`,
    en: `✅ **Quantum BI Configuration Complete!**\n\nCompiled deterministic pipeline for **${state.detectedSector}** across **${entities.length}** entities (${totalQubits} qubits, threshold ${(safeThresh * 100).toFixed(1)}%, scenario **${stressLabel}**).\n\nThe **JSON**, **Python Qiskit 1.x**, and **OpenQASM 3.0** artifacts are ready in the output tabs.`,
    zh: `✅ **Quantum BI 编译完成！**\n已为 **${state.detectedSector}** 生成完整 JSON、Python Qiskit 1.x 与 OpenQASM 3.0 输出（共 ${totalQubits} 个量子比特）。`,
    de: `✅ **Quantum BI-Konfiguration abgeschlossen!**\nDeterministische Pipeline für **${state.detectedSector}** mit **${totalQubits} Qubits** erstellt.`,
    fr: `✅ **Configuration Quantum BI terminée !**\nPipeline déterministe compilé pour **${state.detectedSector}** avec **${totalQubits} qubits**.`,
    ja: `✅ **Quantum BI コンパイル完了！**\n**${state.detectedSector}** 向けに **${totalQubits} 量子ビット**の回路・Python・JSON を生成しました。`,
  };

  return {
    text: doneMsg[lang],
    jsonCode,
    pythonCode,
    qasmCode,
  };
}
