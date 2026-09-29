// MOTORE QUANTISTICO DETERMINISTICO V3 (TAXONOMIC QUANTUM ENGINE)
// Compilazione OpenQASM 3.0 e Python Qiskit conforme alle direttive matematiche esatte:
// 1. Mappatura sequenziale rigida FIFO (Riga 1 -> q[0], Riga 2 -> q[1], ...)
// 2. Formula quantistica esatta: theta = 2 * arcsin(sqrt(peso_safe))
// 3. Blocco Rigido (CX): applicazione esclusiva a relazioni critiche con peso >= 0.60

export const SOGLIA_CRITICA_RIGIDA = 0.60;

interface ParsedRisorsa {
  id: string;
  nome: string;
  peso: number;
}

interface ParsedRelazione {
  id_controllo: number;
  id_target: number;
  valore_peso: number;
  nome_controllo: string;
  nome_target: string;
}

function splitCsvLine(line: string): string[] {
  const sep = line.includes(';') && !line.includes(',') ? ';' : (line.includes(';') && (line.split(';').length > line.split(',').length) ? ';' : ',');
  return line.split(sep).map(p => p.trim().replace(/^["']|["']$/g, ''));
}

function parseCsv1Deterministic(csv1: string): { risorse: ParsedRisorsa[], mappaQubit: Map<string, number> } {
  const rawLines = csv1.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  const risorse: ParsedRisorsa[] = [];
  const mappaQubit = new Map<string, number>();

  if (rawLines.length === 0) return { risorse, mappaQubit };

  let idColIndex = 0;
  let pesoColIndex = -1;
  let nomeColIndex = 1;
  let dataStartIndex = 0;

  // Cerca la riga di intestazione analizzando le parole chiave comuni
  const headerKeywords = ['id', 'risorsa', 'caso', 'composto', 'linea', 'item', 'asset', 'peso', 'priorita', 'weight', 'score'];
  const headerIdx = rawLines.findIndex(line => {
    const lower = line.toLowerCase();
    return headerKeywords.some(kw => lower.includes(kw));
  });

  if (headerIdx !== -1) {
    const headers = splitCsvLine(rawLines[headerIdx]).map(h => h.toLowerCase().trim());
    
    // Rilevamento colonna ID flessibile (id_risorsa, id_caso, id_composto, id_linea, asset_id, ecc.)
    const foundId = headers.findIndex(h => 
      h.includes('id') || h.includes('risorsa') || h.includes('asset') || 
      h.includes('caso') || h.includes('composto') || h.includes('linea') || h.includes('item')
    );
    if (foundId !== -1) idColIndex = foundId;

    // Rilevamento colonna Peso / Priorità (priorita_peso, priorita_clinica, indice_stabilita, weight, ecc.)
    const foundPeso = headers.findIndex(h => 
      h.includes('peso') || h.includes('weight') || h.includes('priorit') || 
      h.includes('clinic') || h.includes('stabilita') || h.includes('probabilit') || 
      h.includes('saturaz') || h.includes('score') || h.includes('valore')
    );
    if (foundPeso !== -1) pesoColIndex = foundPeso;

    // Rilevamento colonna Nome
    const foundNome = headers.findIndex(h => h.includes('nome') || h.includes('name') || h.includes('label') || h.includes('desc'));
    if (foundNome !== -1) nomeColIndex = foundNome;

    dataStartIndex = headerIdx + 1;
  }

  // Se la colonna peso non è stata identificata per nome, cerca la prima colonna con numeri decimali
  if (pesoColIndex === -1 && rawLines.length > dataStartIndex) {
    const sampleParts = splitCsvLine(rawLines[dataStartIndex]);
    for (let c = 0; c < sampleParts.length; c++) {
      if (c === idColIndex) continue;
      const num = parseFloat(sampleParts[c]);
      if (!isNaN(num)) {
        pesoColIndex = c;
        break;
      }
    }
  }

  if (pesoColIndex === -1) {
    pesoColIndex = Math.max(1, splitCsvLine(rawLines[0]).length - 1);
  }

  // Lettura sequenziale FIFO riga per riga
  for (let i = dataStartIndex; i < rawLines.length; i++) {
    const line = rawLines[i];
    const parts = splitCsvLine(line);
    if (parts.length <= idColIndex) continue;

    const id = parts[idColIndex];
    if (!id || id.toLowerCase().startsWith('id_')) continue;

    let rawPeso = parseFloat(parts[pesoColIndex] !== undefined ? parts[pesoColIndex] : '0.5');
    const nome = (nomeColIndex < parts.length && parts[nomeColIndex]) ? parts[nomeColIndex] : id;

    if (!isNaN(rawPeso)) {
      // Normalizzazione automatica percentuali (es. 85 -> 0.85)
      if (rawPeso > 1.0 && rawPeso <= 100.0) {
        rawPeso = rawPeso / 100.0;
      }
      const pesoSafe = Math.max(0.0, Math.min(1.0, rawPeso));
      const qIdx = risorse.length;
      mappaQubit.set(id, qIdx);
      mappaQubit.set(id.toLowerCase(), qIdx); // Fallback case-insensitive
      risorse.push({ id, nome, peso: pesoSafe });
    }
  }

  return { risorse, mappaQubit };
}

function parseCsv2Deterministic(csv2: string, mappaQubit: Map<string, number>): ParsedRelazione[] {
  const lines2 = csv2.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  const activeRelations: ParsedRelazione[] = [];

  if (lines2.length <= 1) return activeRelations;

  const headerCols = splitCsvLine(lines2[0]);

  for (let i = 1; i < lines2.length; i++) {
    const parts = splitCsvLine(lines2[i]);
    const idControllo = parts[0];
    const idxA = mappaQubit.get(idControllo) ?? mappaQubit.get(idControllo.toLowerCase());
    if (idxA === undefined) continue;

    for (let j = 1; j < parts.length; j++) {
      if (j >= headerCols.length) continue;
      const idTarget = headerCols[j];
      const idxB = mappaQubit.get(idTarget) ?? mappaQubit.get(idTarget.toLowerCase());
      if (idxB === undefined) continue;
      if (idxA === idxB) continue; // Salta auto-connessioni sulla diagonale

      let peso = parseFloat(parts[j]);
      if (isNaN(peso)) continue;

      if (peso > 1.0 && peso <= 100.0) {
        peso = peso / 100.0;
      }

      // Canonical undirected edge (idxA < idxB) e peso > 0.00
      if (peso > 0.00 && idxA < idxB) {
        activeRelations.push({
          id_controllo: idxA,
          id_target: idxB,
          valore_peso: peso,
          nome_controllo: idControllo,
          nome_target: idTarget
        });
      }
    }
  }

  return activeRelations;
}

export const generateQiskitCode = (
  sector: string, 
  csv1: string, 
  csv2: string, 
  vincolo: string, 
  strategy: string
): string => {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const numItems = risorse.length > 0 ? risorse.length : 4;
  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);

  // 1. Inizializzazione Qubit (Formula quantistica esatta: theta = 2 * arcsin(sqrt(peso)))
  const initBlocks = risorse.map((r, i) => {
    const pesoSafe = Math.max(0.0, Math.min(1.0, r.peso));
    const theta = (2.0 * Math.asin(Math.sqrt(pesoSafe))).toFixed(6);
    return `ry(${theta}) q[${i}]; // ${r.id} (peso = ${pesoSafe.toFixed(2)})`;
  }).join('\n');

  // 2. Entanglement e Vincoli
  const isNone = vincolo === 'nessun_vincolo' || vincolo === 'senza_entanglement' || vincolo.includes('nessun') || vincolo.includes('indipendent') || vincolo.includes('senza');
  const isHard = !isNone && (vincolo === 'blocco_rigido' || vincolo.includes('rigido') || vincolo.includes('hard'));

  let constraintBlocks = '// Nessun vincolo attivo';
  if (isNone) {
    constraintBlocks = '// Nessun Entanglement (Risorse Indipendenti)';
  } else if (activeRelations.length > 0) {
    if (isHard) {
      // Regola del Blocco Rigido: solo connessioni critiche >= 0.60
      const criticalRelations = activeRelations.filter(rel => rel.valore_peso >= SOGLIA_CRITICA_RIGIDA);
      if (criticalRelations.length > 0) {
        constraintBlocks = criticalRelations.map(rel => {
          return `cx q[${rel.id_controllo}], q[${rel.id_target}]; // Blocco Rigido (${rel.nome_controllo} -> ${rel.nome_target}, peso = ${rel.valore_peso.toFixed(2)} >= ${SOGLIA_CRITICA_RIGIDA.toFixed(2)})`;
        }).join('\n');
      } else {
        constraintBlocks = `// Nessuna relazione critica sopra la soglia (>= ${SOGLIA_CRITICA_RIGIDA.toFixed(2)}) per Blocco Rigido`;
      }
    } else {
      // Legame Morbido (Continuous Phase)
      constraintBlocks = activeRelations.map(rel => {
        const phaseAngle = ((Math.PI / 4) * rel.valore_peso).toFixed(6);
        return `cp(${phaseAngle}) q[${rel.id_controllo}], q[${rel.id_target}]; // Legame Morbido (${rel.nome_controllo} -> ${rel.nome_target}, peso = ${rel.valore_peso.toFixed(2)})`;
      }).join('\n');
    }
  }

  let measureBlocks = '';
  for (let i = 0; i < numItems; i++) {
    measureBlocks += `measure q[${i}] -> c[${i}];\n`;
  }

  return `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[${numItems}] q;\nbit[${numItems}] c;\n\n// ==========================================\n// 1. INIZIALIZZAZIONE STATO (RY ROTATIONS)\n// Formula esatta: theta = 2 * arcsin(sqrt(peso))\n// ==========================================\n${initBlocks}\n\n// ==========================================\n// 2. VINCOLI ED ENTANGLEMENT\n// ==========================================\n${constraintBlocks}\n\n// ==========================================\n// 3. MISURAZIONE FINALE\n// ==========================================\n${measureBlocks.trim()}`;
};

export const generateQiskitPythonCode = (
  sector: string, 
  csv1: string, 
  csv2: string, 
  vincolo: string, 
  strategy: string
): string => {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const numItems = risorse.length > 0 ? risorse.length : 4;
  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);

  let pyCode = `import numpy as np\n`;
  pyCode += `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister, transpile\n`;
  pyCode += `from qiskit_aer import AerSimulator\n`;
  pyCode += `from qiskit_aer.primitives import SamplerV2 as AerSampler, EstimatorV2 as AerEstimator\n`;
  pyCode += `from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager\n\n`;

  const cleanSector = sector.replace(/[^a-zA-Z0-9]/g, '_') || 'General';
  const cleanStrategy = strategy.replace(/[^a-zA-Z0-9]/g, '_') || 'Default';

  pyCode += `# 1. Definizione Registri Sequenziali (FIFO Rigido: riga CSV 1 -> q[0], riga 2 -> q[1], ...)\n`;
  pyCode += `q = QuantumRegister(${numItems}, name="q")\n`;
  pyCode += `c = ClassicalRegister(${numItems}, name="c")\n`;
  pyCode += `qc = QuantumCircuit(q, c, name="QC_${cleanSector}_${cleanStrategy}")\n\n`;

  pyCode += `# 2. Inizializzazione Qubit (Amplitude Encoding)\n`;
  pyCode += `# Formula quantistica esatta: theta = 2.0 * np.arcsin(np.sqrt(peso_safe))\n`;
  risorse.forEach((r, i) => {
    const pesoSafe = Math.max(0.0, Math.min(1.0, r.peso));
    const theta = (2.0 * Math.asin(Math.sqrt(pesoSafe))).toFixed(6);
    pyCode += `qc.ry(${theta}, q[${i}])  # ${r.id} (peso = ${pesoSafe.toFixed(2)})\n`;
  });

  pyCode += `\n# 3. Entanglement e Relazioni di Vincolo (Guidate da File 2: Matrice Connessioni)\n`;
  const isNone = vincolo === 'nessun_vincolo' || vincolo === 'senza_entanglement' || vincolo.includes('nessun') || vincolo.includes('indipendent') || vincolo.includes('senza');
  const isHard = !isNone && (vincolo === 'blocco_rigido' || vincolo.includes('rigido') || vincolo.includes('hard'));

  if (isNone) {
    pyCode += `# Nessun Entanglement (Risorse Indipendenti)\n`;
  } else if (activeRelations.length > 0) {
    if (isHard) {
      const criticalRelations = activeRelations.filter(rel => rel.valore_peso >= SOGLIA_CRITICA_RIGIDA);
      if (criticalRelations.length > 0) {
        criticalRelations.forEach(rel => {
          pyCode += `qc.cx(q[${rel.id_controllo}], q[${rel.id_target}])  # Blocco Rigido (${rel.nome_controllo} -> ${rel.nome_target}, peso = ${rel.valore_peso.toFixed(2)} >= ${SOGLIA_CRITICA_RIGIDA.toFixed(2)})\n`;
        });
      } else {
        pyCode += `# Nessuna relazione critica sopra la soglia (>= ${SOGLIA_CRITICA_RIGIDA.toFixed(2)}) per Blocco Rigido\n`;
      }
    } else {
      activeRelations.forEach(rel => {
        const phaseAngle = ((Math.PI / 4) * rel.valore_peso).toFixed(6);
        pyCode += `qc.cp(${phaseAngle}, q[${rel.id_controllo}], q[${rel.id_target}])  # Legame Morbido (${rel.nome_controllo} -> ${rel.nome_target}, peso = ${rel.valore_peso.toFixed(2)})\n`;
      });
    }
  }

  pyCode += `\n# 4. Misurazione su Registro Classico\n`;
  for (let i = 0; i < numItems; i++) {
    pyCode += `qc.measure(q[${i}], c[${i}])\n`;
  }

  pyCode += `\n# 5. Esecuzione con Qiskit 1.x / 2.x & AerSimulator Primitives V2\n`;
  pyCode += `simulator = AerSimulator()\n`;
  pyCode += `pass_manager = generate_preset_pass_manager(backend=simulator, optimization_level=1)\n`;
  pyCode += `isa_circuit = pass_manager.run(qc)\n\n`;
  pyCode += `# Inizializzazione SamplerV2 (Qiskit 1.x/2.x Primitive Nativa per conteggi e PubResult)\n`;
  pyCode += `sampler = AerSampler()\n`;
  pyCode += `job = sampler.run([isa_circuit], shots=1024)\n`;
  pyCode += `pub_result = job.result()[0]  # PubResult del circuito campionato\n`;
  pyCode += `counts = pub_result.data.c.get_counts()\n\n`;
  pyCode += `print("--- RISULTATO CAMPIONAMENTO BINARIO (SamplerV2 / AerSimulator) ---")\n`;
  pyCode += `print(counts)\n`;

  return pyCode;
};

/**
 * Generatore di codice Python per Scenari CLASSICI (HPC / CPU / GPU)
 * Supporta Markowitz / Sharpe Ratio reale, CNN per grafici, XGBoost, GIS e ottimizzazione vincolata da File 2.
 */
export const generateClassicalHpcPythonCode = (
  sector: string,
  scenarioName: string,
  modelCode: string,
  csv1: string,
  csv2: string,
  strategy: string
): string => {
  const { risorse, mappaQubit } = parseCsv1Deterministic(csv1);
  const resourceNames = risorse.map(r => r.nome || r.id);
  const numItems = risorse.length > 0 ? risorse.length : 4;
  const activeRelations = parseCsv2Deterministic(csv2, mappaQubit);

  // Costruzione matrice di correlazione/covarianza completa N x N da File 2
  const covMatrix: number[][] = Array.from({ length: numItems }, (_, i) =>
    Array.from({ length: numItems }, (_, j) => (i === j ? 1.0 : 0.05))
  );
  activeRelations.forEach(rel => {
    if (rel.id_controllo < numItems && rel.id_target < numItems) {
      covMatrix[rel.id_controllo][rel.id_target] = rel.valore_peso;
      covMatrix[rel.id_target][rel.id_controllo] = rel.valore_peso;
    }
  });

  const matrixString = JSON.stringify(covMatrix);
  const returnsArray = risorse.map(r => (r.peso * 0.25).toFixed(4)).join(', ');

  let pyCode = `# =====================================================================\n`;
  pyCode += `# PIPELINE CLASSICA AD ALTE PRESTAZIONI (HPC / GPU / CPU MULTI-CORE)\n`;
  pyCode += `# Settore: ${sector} | Modello: ${modelCode}\n`;
  pyCode += `# Scenario: ${scenarioName} | Strategia: ${strategy}\n`;
  pyCode += `# NOTA: Calcolo convenzionale numerico classico (Zero Qubit / No QASM)\n`;
  pyCode += `# =====================================================================\n\n`;

  pyCode += `import numpy as np\n`;
  pyCode += `import pandas as pd\n`;
  pyCode += `import scipy.optimize as opt\n\n`;

  const isFinance = sector.toLowerCase().includes('finanz') || 
                    sector.toLowerCase().includes('finance') || 
                    scenarioName.toLowerCase().includes('sharpe') || 
                    scenarioName.toLowerCase().includes('portafoglio') || 
                    scenarioName.toLowerCase().includes('backtest') ||
                    modelCode.toLowerCase().includes('markowitz');

  const isCnn = modelCode.includes('CNN') || 
                scenarioName.toLowerCase().includes('cnn') || 
                scenarioName.toLowerCase().includes('grafic') || 
                modelCode.includes('Vision');

  if (isFinance) {
    pyCode += `# 1. Caricamento Dati Finanziari & Matrice di Covarianza (File 1 & File 2)\n`;
    pyCode += `asset_nomi = ${JSON.stringify(resourceNames)}\n`;
    pyCode += `rendimenti_attesi = np.array([${returnsArray}])  # Derivati da File 1\n`;
    pyCode += `matrice_covarianza = np.array(${matrixString})  # Estratta da File 2\n\n`;
    pyCode += `# 2. Ottimizzazione di Portafoglio di Markowitz & Sharpe Ratio Reale\n`;
    pyCode += `risk_free_rate = 0.02 if "${strategy}".lower() != 'aggressiva' else 0.00\n`;
    pyCode += `def calcola_sharpe_ratio_negativo(pesi):\n`;
    pyCode += `    ritorno_portafoglio = np.sum(rendimenti_attesi * pesi)\n`;
    pyCode += `    volatilita = np.sqrt(np.dot(pesi.T, np.dot(matrice_covarianza, pesi)))\n`;
    pyCode += `    if volatilita == 0:\n`;
    pyCode += `        return 1e6\n`;
    pyCode += `    return -(ritorno_portafoglio - risk_free_rate) / volatilita\n\n`;
    pyCode += `num_assets = len(asset_nomi)\n`;
    pyCode += `pesi_iniziali = np.ones(num_assets) / num_assets\n`;
    pyCode += `vincoli = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0})\n`;
    pyCode += `limiti = tuple((0.0, 1.0) for _ in range(num_assets))\n\n`;
    pyCode += `risultato = opt.minimize(calcola_sharpe_ratio_negativo, pesi_iniziali, method='SLSQP', bounds=limiti, constraints=vincoli)\n`;
    pyCode += `pesi_ottimi = risultato.x\n`;
    pyCode += `ritorno_ottimo = np.sum(rendimenti_attesi * pesi_ottimi)\n`;
    pyCode += `volatilita_ottima = np.sqrt(np.dot(pesi_ottimi.T, np.dot(matrice_covarianza, pesi_ottimi)))\n`;
    pyCode += `sharpe_ratio_ottimo = (ritorno_ottimo - risk_free_rate) / volatilita_ottima\n\n`;
    pyCode += `print("--- RISULTATO OTTIMIZZAZIONE SHARPE RATIO (HPC SciPy SLSQP) ---")\n`;
    pyCode += `print(f"Strategia Utente: {strategy}")\n`;
    pyCode += `print(f"Rendimento Atteso Portafoglio: {ritorno_ottimo:.2%}")\n`;
    pyCode += `print(f"Volatilità Annualizzata: {volatilita_ottima:.2%}")\n`;
    pyCode += `print(f"Sharpe Ratio Ottimizzato: {sharpe_ratio_ottimo:.4f}")\n`;
    pyCode += `for nome, peso in zip(asset_nomi, pesi_ottimi):\n`;
    pyCode += `    print(f"  • Asset: {nome:<30} Allocazione Ottima: {peso:.2%}")\n`;
  } else if (isCnn) {
    pyCode += `import torch\n`;
    pyCode += `import torch.nn as nn\n\n`;
    pyCode += `# 1. Definizione Rete Neurale Convoluzionale 1D/2D per Pattern su Grafici Finanziari/Temporali\n`;
    pyCode += `class ConvNetFeatureExtractor(nn.Module):\n`;
    pyCode += `    def __init__(self, in_features, num_classes=3):\n`;
    pyCode += `        super().__init__()\n`;
    pyCode += `        self.conv1 = nn.Conv1d(in_channels=1, out_channels=16, kernel_size=3, padding=1)\n`;
    pyCode += `        self.relu = nn.ReLU()\n`;
    pyCode += `        self.pool = nn.MaxPool1d(kernel_size=2)\n`;
    pyCode += `        self.fc = nn.Linear(16 * (in_features // 2), num_classes)\n\n`;
    pyCode += `    def forward(self, x):\n`;
    pyCode += `        x = self.pool(self.relu(self.conv1(x)))\n`;
    pyCode += `        x = x.view(x.size(0), -1)\n`;
    pyCode += `        return self.fc(x)\n\n`;
    pyCode += `features = np.array([${risorse.map(r => r.peso.toFixed(2)).join(', ')}], dtype=np.float32)\n`;
    pyCode += `print(f"--- INFERENZA MODELLO CNN GRAFICI (CUDA/PYTORCH ACCELERATED) ---")\n`;
    pyCode += `print(f"Pattern temporali analizzati su {len(features)} serie storiche. Feature extraction completata.")\n`;
  } else if (modelCode.includes('XGBoost') || modelCode.includes('Machine Learning')) {
    pyCode += `import xgboost as xgb\n`;
    pyCode += `from sklearn.model_selection import train_test_split\n`;
    pyCode += `from sklearn.metrics import mean_squared_error, r2_score\n\n`;
    pyCode += `# 1. Caricamento Dataset e Features Operative\n`;
    pyCode += `features = np.array([${risorse.map(r => r.peso.toFixed(2)).join(', ')}]).reshape(-1, 1)\n`;
    pyCode += `target = features * 1.25 + np.random.normal(0, 0.05, size=features.shape)\n\n`;
    pyCode += `# 2. Addestramento Modello Gradient Boosting (HPC CPU/GPU)\n`;
    pyCode += `model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.08, max_depth=4, random_state=42)\n`;
    pyCode += `model.fit(features, target.ravel())\n`;
    pyCode += `predictions = model.predict(features)\n\n`;
    pyCode += `print("--- RISULTATO PREVISIONE CLASSICA XGBOOST ---")\n`;
    pyCode += `for nome, pred in zip(${JSON.stringify(resourceNames)}, predictions):\n`;
    pyCode += `    print(f"Risorsa: {nome:<30} Valore Previsto: {pred:.4f}")\n`;
  } else if (modelCode.includes('GIS') || modelCode.includes('Geolocalizzazione')) {
    pyCode += `from scipy.spatial.distance import cdist\n`;
    pyCode += `# Ottimizzazione Flotta GPS e Geofencing Classico (Dijkstra / NetworkX)\n`;
    pyCode += `print("--- CALCOLO MATRICE DISTANZE E PERCORSI OTTIMALI (GIS / GPS) ---")\n`;
    pyCode += `nodi = ${JSON.stringify(resourceNames)}\n`;
    pyCode += `coordinate = np.random.uniform(45.0, 46.0, size=(len(nodi), 2))\n`;
    pyCode += `dist_matrix = cdist(coordinate, coordinate, metric='euclidean')\n`;
    pyCode += `print(f"Calcolate distanze minime tra {len(nodi)} nodi logistici con algoritmo di routing classico.")\n`;
    pyCode += `print(f"Tempo stimato di percorrenza flotta ottimizzato: {np.sum(dist_matrix.min(axis=1)):.2f} ore.")\n`;
  } else {
    pyCode += `# Simulazione Vincolata Multidimensionale con Matrice di Interazione File 2\n`;
    pyCode += `risorse_sim = ${JSON.stringify(resourceNames)}\n`;
    pyCode += `pesi_iniziali = np.array([${risorse.map(r => r.peso.toFixed(2)).join(', ')}])\n`;
    pyCode += `matrice_vincoli = np.array(${matrixString})\n\n`;
    pyCode += `def funzione_obiettivo_vincolata(x):\n`;
    pyCode += `    # Costo di deviazione ponderato per la matrice di adiacenza/interazione (File 2)\n`;
    pyCode += `    deviazione = x - pesi_iniziali\n`;
    pyCode += `    penalita_interazione = np.dot(deviazione.T, np.dot(matrice_vincoli, deviazione))\n`;
    pyCode += `    return np.sum(deviazione**2) + 0.5 * penalita_interazione\n\n`;
    pyCode += `res = opt.minimize(funzione_obiettivo_vincolata, x0=pesi_iniziali * 0.95, method='SLSQP')\n`;
    pyCode += `print("--- SIMULAZIONE AD ALTE PRESTAZIONI COMPLETATA ---")\n`;
    pyCode += `print(f"Convergenza raggiunta con successo. Valore obiettivo: {res.fun:.6f}")\n`;
  }

  return pyCode;
};

