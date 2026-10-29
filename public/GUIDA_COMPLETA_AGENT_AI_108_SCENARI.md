# DOSSIER TECNICO COMPLETO: ARCHITETTURA AGENT AI, CALCOLI QUANTISTICI & CATALOGO DEI 108 SCENARI

**Versione:** 3.8.0 Production High-Performance  
**Data:** 29 Ottobre 2026  
**Autore:** Chief Quantum Architect & Lead Software Engineer  
**Piattaforma:** AI Studio Enterprise — Quantum Business Intelligence Engine  

---

## INDICE GENERALE
1. [Sintesi Esecutiva dei Problemi Risolti](#1-sintesi-esecutiva-dei-problemi-risolti)
2. [Architettura a Tre Teste (TypeScript + Google Gemini + Python)](#2-architettura-a-tre-teste)
3. [Risoluzione del Prelievo Dati (Excel, CSV, Formattazione Europea)](#3-risoluzione-del-prelievo-dati)
4. [Motore Matematico dei Calcoli Quantistici (Qiskit & OpenQASM 3.0)](#4-motore-matematico-dei-calcoli-quantistici)
5. [Motore Matematico Classico HPC (SciPy SLSQP & Markowitz)](#5-motore-matematico-classico-hpc)
6. [Resilienza e Integrazione Chat Google Gemini](#6-resilienza-e-integrazione-chat-google-gemini)
7. [Catalogo Sistematico dei 108 Scenari Aziendali (7 Categorie)](#7-catalogo-sistematico-dei-108-scenari-aziendali)
8. [Specifiche di Input File 1 e File 2 & Freno Hardware a 127 Qubit](#8-specifiche-di-input-file-1-e-file-2)
9. [Guida all'Esecuzione Locale e su Cloud IBM Quantum](#9-guida-allesecuzione-locale-e-su-cloud-ibm-quantum)

---

## 1. SINTESI ESECUTIVA DEI PROBLEMI RISOLTI

Durante il collaudo intensivo dell'Agent AI e la prova delle varie casistiche aziendali sono state individuate e risolte alla radice le seguenti criticità:

| Componente | Problema Riscontrato | Causa Tecnica Identificata | Soluzione Implementata |
| :--- | :--- | :--- | :--- |
| **Parsing Excel/CSV** | Prelievo dati fallito su decimali con virgola (`0,85`) o percentuali (`85%`); fallimento su file binari `.xlsx`. | In JavaScript nativo `parseFloat("0,85")` restituisce `0`. I file Excel venivano letti tramite `readAsText()` producendo testo corrotto. | Aggiunta libreria SheetJS (`xlsx`) per decodifica binaria diretta dei fogli `.xlsx`/`.xls`. Creato parser `cleanNumericValue` che converte virgole europee, punti migliaia e percentuali. |
| **Calcolo Angoli $\theta$** | Valori anomali tipo `Theta = 134.000 rad` sul pop-up e istogramma con barre sfasate. | Disallineamento unità di misura: l'angolo convertito in gradi (134°) veniva passato a componenti che richiedevano radianti, violando il limite fisico $\theta \le \pi$. | Rigorosa normalizzazione: $\theta$ è confinato nell'intervallo $[0, \pi]$ radianti. La UI visualizza contemporaneamente radianti e gradi: `Theta = 2.3462 rad (134.4°)`. |
| **Script Python Qiskit** | Errore a runtime `NameError: name 'io' is not defined` all'avvio dello script. | `pd.read_csv(io.StringIO(...))` veniva invocato senza includere l'istruzione `import io` negli header dello script generato. | Inserito `import io` all'inizio di tutti i generatori di codice Python Qiskit deterministici. |
| **Chat Google Gemini** | Blocchi o fallback automatico improvviso durante l'intervista guidata. | Utilizzo di alias deprecati (`gemini-2.5-flash`, `gemini-3.5-flash`) e mancata gestione del picco di carico (503 / 429). | Implementata pipeline resiliente a 3 livelli: `gemini-3.8-flash` (primario) $\rightarrow$ `gemini-3.1-flash-lite` (secondario) $\rightarrow$ `gemini-flash-latest` (terziario) con retry esponenziale. |
| **Entanglement Automatico** | Nessun vincolo applicato con file CSV europei. | Con pesi a `0` (causati dal bug di parsing della virgola), la soglia critica $\ge 0.60$ non veniva mai raggiunta. | Con il ripristino di `cleanNumericValue`, le connessioni $\ge 0.60$ generano regolarmente porte `qc.cx(q[i], q[j])` e quelle intermedie generano rotazioni `qc.cp(fase, q[i], q[j])`. |

---

## 2. ARCHITETTURA A TRE TESTE

L'ecosistema opera secondo una suddivisione rigorosa dei compiti:

```
┌─────────────────────────────────────────────────────────────┐
│                      1. CLIENT TYPESCRIPT                   │
│  - Interfaccia reattiva (React 19 + Tailwind CSS)            │
│  - Parsing deterministico file Excel (.xlsx) e CSV           │
│  - Mappatura sequenziale rigida FIFO (Riga 1 -> q[0])       │
│  - Rendering 3D Sfera di Bloch e Istogramma delle Ampiezze  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 2. BACKEND SERVER EXPRESS & GEMINI          │
│  - Server Node.js/Express (`server.ts`) su porta 3000       │
│  - Connessione sicura con Google GenAI SDK (@google/genai)  │
│  - Gestione intervista guidata a stati finiti (Fasi 0 -> 4)  │
│  - Pipeline a tolleranza di errore su 3 tier di modelli     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            3. GENERATORI DI CODICE DETERMINISTICO           │
│  - Ramo Quantistico: OpenQASM 3.0 + Python Qiskit 1.x/2.x   │
│  - Ramo Classico: SciPy SLSQP Markowitz su 108 scenari      │
│  - Zero allucinazioni: numeri derivati unicamente dai file  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. RISOLUZIONE DEL PRELIEVO DATI

### 3.1 Funzione Universale di Pulizia Numerica (`cleanNumericValue`)
Il sistema supporta qualsiasi convenzione numerica internazionale senza richiedere modifiche manuali da parte dell'utente:
* **Formato Italiano / Europeo:** `0,85` $\rightarrow$ `0.85`
* **Formato con Migliaia:** `1.250,50` $\rightarrow$ `1250.50`
* **Percentuali Dirette:** `85%` o `85,5%` $\rightarrow$ `0.85` o `0.855`
* **Simboli di Valuta e Spazi:** `€ 0,75 ` $\rightarrow$ `0.75`

### 3.2 Ingestione Nativa Fogli di Calcolo Excel (`.xlsx`, `.xls`)
Grazie al motore SheetJS integrato:
1. Il file binario viene letto come `ArrayBuffer`.
2. Il primo foglio di lavoro (`SheetNames[0]`) viene estratto e convertito in formato CSV tabulare.
3. Le righe vuote e i commenti preceduti da `#` vengono filtrati automaticamente.
4. Viene garantita la retrocompatibilità totale con file `.csv`, `.tsv`, `.txt`.

---

## 4. MOTORE MATEMATICO DEI CALCOLI QUANTISTICI

### 4.1 Formula Trigonometrica Unica per le Rotazioni RY
Per codificare il peso numerico normalizzato $p \in [0.0, 1.0]$ letto dal File 1 nell'ampiezza di probabilità del qubit, si applica esclusivamente la formula quantistica esatta:

$$\theta = 2.0 \cdot \arcsin\left(\sqrt{\max(0.0, \min(1.0, p))}\right)$$

* **Intervallo Fisico Valido:** $\theta \in [0.0, \pi] \text{ rad} \approx [0.0, 3.141593] \text{ rad}$.
* **Ampiezza Stato Base $|0\rangle$ (Stabilità/Riserva):** $P(|0\rangle) = \cos^2\left(\frac{\theta}{2}\right) = 1.0 - p$
* **Ampiezza Stato Eccitato $|1\rangle$ (Allocazione/Spinta/Rendimento):** $P(|1\rangle) = \sin^2\left(\frac{\theta}{2}\right) = p$

> **Esempio Reale:**
> Se l'asset ha un peso $p = 0.85$:
> $$\theta = 2 \cdot \arcsin(\sqrt{0.85}) = 2 \cdot \arcsin(0.921954) = 2 \cdot 1.173097 = 2.346194 \text{ rad} \quad (134.43^\circ)$$
> $$P(|1\rangle) = \sin^2(1.173097) = 0.85 \quad (85.0\%)$$
> $$P(|0\rangle) = \cos^2(1.173097) = 0.15 \quad (15.0\%)$$

### 4.2 Topologia dell'Entanglement Bifasico (File 2 CSV)
L'entanglement non richiede alcuna configurazione manuale da parte dell'utente:
1. **Blocco Rigido (Porta Controlled-NOT / CX):**
   Si attiva se il peso della relazione $w_{ij} \ge 0.60$.
   Sintassi Qiskit: `qc.cx(q[i], q[j])`  
   Sintassi OpenQASM 3.0: `cx q[i], q[j];`
2. **Legame Morbido Continuo (Porta Controlled-Phase / CP):**
   Si attiva se $0.00 < w_{ij} < 0.60$.
   Fase applicata: $\phi = \pi \cdot w_{ij}$
   Sintassi Qiskit: `qc.cp(np.pi * valore, q[i], q[j])`
3. **Risorse Indipendenti:**
   Se la matrice è a $0.00$ o non presenta connessioni, il circuito rimane a stato puro separabile.

### 4.3 Sfera di Bloch e Snapshot dello Statevector
Per evitare il "Paradosso di Bloch" (decoerenza grafica dopo l'entanglement che ridurrebbe il vettore interno alla sfera), lo snapshot vettoriale viene acquisito a stato puro tramite:
```python
stato_vettoriale_puro = Statevector.from_instruction(qc)
fig_bloch = plot_bloch_multivector(stato_vettoriale_puro)
```
Successivamente viene inserita una barriera di isolamento `qc.barrier()` prima delle porte di entanglement.

---

## 5. MOTORE MATEMATICO CLASSICO HPC (SCIPY SLSQP)

Per gli scenari industriali con dataset molto grandi ($>127$ righe) o che operano su architetture convenzionali CPU/GPU:
1. **Algoritmo:** Sequential Least Squares Programming (`scipy.optimize.minimize(..., method='SLSQP')`).
2. **Funzione Obiettivo:** Massimizzazione dello Sharpe Ratio reale di Markowitz:
   $$\max_{w} \text{SR} = \frac{w^T \mu - r_f}{\sqrt{w^T \Sigma w}}$$
   dove $\mu$ è il vettore dei rendimenti del File 1, $\Sigma$ è la matrice di covarianza/connessione del File 2, e $r_f = 0.02$ è il risk-free rate.
3. **Vincoli di Bilancio:**
   $$\sum_{i=1}^{N} w_i = 1.0, \quad 0 \le w_i \le 1.0 \quad \forall i$$
4. **Stress Test su 108 Scenari:** Il codice generato esegue la simulazione su 108 shock macroeconomici sintetici di volatilità per testare la robustezza dell'allocazione.

---

## 6. RESILIENZA E INTEGRAZIONE CHAT GOOGLE GEMINI

Le chiamate di backend alle API di Gemini in `server.ts` adottano ora un meccanismo di tolleranza di errore a tre stadi:

1. **Livello 1 (Primario):** `gemini-3.8-flash` — Modello di punta per compiti multimodali, generazione strutturata e massima aderenza alle direttive di sistema.
2. **Livello 2 (Fallback Bassa Latenza):** `gemini-3.1-flash-lite` — Attivato automaticamente in caso di picco di traffico (errore 503 Service Unavailable) o rate limit temporaneo.
3. **Livello 3 (Fallback Stabile):** `gemini-flash-latest` — Garantisce la continuità operativa in qualunque scenario di indisponibilità regionale.
4. **Strategia di Retry:** Exponential backoff progressivo su risposte HTTP 429 con intervalli di ritardo da 1200ms fino a 4800ms.

---

## 7. CATALOGO SISTEMATICO DEI 108 SCENARI AZIENDALI

L'Agent AI copre integralmente **108 scenari aziendali specializzati** raggruppati in **7 categorie industriali**, con modelli quantistici e classici dedicati:

### CATEGORIA 1: FINANZA E MERCATI (25 Scenari)
1. **Hedging Multilivello Cross-Asset:** Ottimizzazione combinatoria su derivati e copertura swap cross-asset (Qiskit_QUBO).
2. **Ottimizzazione Portafoglio con Vincoli di Cardinalità:** Risoluzione combinatoria per ribilanciamento pesi ed esclusione titoli (Qiskit_QUBO).
3. **Allocazione Capitali Basel IV:** Calcolo deterministico requisiti di capitale e buffer di riserva (Qiskit_QAE).
4. **Arbitraggio di Volatilità su Opzioni Index-Linked:** Mappatura su piano angolare dei delta di volatilità implicita (Qiskit_AngleOpt).
5. **Portafoglio Socialmente Responsabile (ESG):** Vincoli multipli di sostenibilità e massimizzazione Sharpe ratio (Qiskit_QAOA).
6. **Stress Testing di Liquidità Bancaria Sistemica:** Simulazione montecarlo quantistica di scenari di corsa agli sportelli (Qiskit_QMC).
7. **Pricing di Derivati Esotici Multivariati:** Calcolo ampiezze di prezzo per basket options e asian options (Qiskit_QAE).
8. **Stima del Value at Risk (VaR) e Conditional VaR:** Stima del rischio di coda su portafogli obbligazionari complessi (Qiskit_QAE).
9. **Rilevamento Frodi Transazionali e Antiriciclaggio (AML):** Classificazione di pattern anomali nei circuiti di pagamento interbancari (Qiskit_QSVM).
10. **Previsione del Default nei Mutui Subprime:** Classificazione predittiva non-lineare su profili creditizi ad alto rischio (Qiskit_VQC).
11. **Ribilanciamento Real-Time ad Alta Frequenza (HFT):** Risoluzione di micro-disallineamenti di book (Classico HPC / SLSQP).
12. **Analisi del Rischio Sovrano e Spread BTP-Bund:** Rilevamento divergenze macroeconomiche su debito governativo (Classico HPC).
13. **Calcolo Margini Iniziali per Clearing CCP:** Ottimizzazione collaterale impegnato su controparti centrali (Classico HPC).
14. **Credit Scoring Dinamico per PMI:** Valutazione del merito creditizio basata su flussi di cassa continui (Classico HPC).
15. **Pricing Polizze Parametriche Catastrofali:** Mappatura probabilistica di eventi meteo estremi su contratti riassicurativi (Qiskit_QAE).
16. **Ottimizzazione Flussi di Cassa Tesoreria Multinazionale:** Minimizzazione dei costi di conversione FX e vincoli di liquidità infragruppo (Qiskit_QUBO).
17. **Arbitraggio Triangolare su Mercati Valutari:** Ricerca dei cicli negativi nei grafi di cambio spot in tempo reale (Qiskit_Grover).
18. **Gestione del Rischio Longevità per Fondi Pensione:** Modellazione attuariale delle tavole di mortalità proiettate (Classico HPC).
19. **Selezione Attiva Titoli Growth vs Value:** Riconoscimento di regimi di mercato mediante kernel quantistici (Qiskit_QKS).
20. **Allocazione di Strumenti di Debito Privato (Private Debt):** Valutazione convenienza rischio-rendimento su crediti illiquidi (Classico HPC).
21. **Hedging di Inflazione con Titoli Real Estate:** Copertura dinamica del potere d'acquisto su indici CPI (Classico HPC).
22. **Ottimizzazione del Collaterale Repo e Security Lending:** Minimizzazione del costo di rifinanziamento giornaliero (Qiskit_QUBO).
23. **Analisi Sentiment Notizie Finanziarie con QNLP:** Elaborazione del linguaggio naturale applicata ai comunicati stampa di bilancio (Qiskit_QNLP).
24. **Stima Probabilità di Intervento Banche Centrali:** Rilevamento aspettative tassi d'interesse tramite superfici di probabilità (Qiskit_AngleOpt).
25. **Cartolarizzazione Crediti Non Performing (NPL):** Segmentazione in tranche senior, mezzanine e junior ottimizzata (Classico HPC).

---

### CATEGORIA 2: LOGISTICA E SUPPLY CHAIN (18 Scenari)
26. **Vehicle Routing con Finestre Temporali (VRPTW):** Ottimizzazione dei percorsi di flotte commerciali con vincoli orari perentori (Qiskit_QAOA).
27. **Pianificazione Flotte Droni per Ultimo Miglio:** Mappatura 3D dei corridoi aerei e gestione autonoma delle batterie (Qiskit_QUBO).
28. **Ottimizzazione Slotting in Magazzini Automatizzati:** Assegnazione delle posizioni di stoccaggio per minimizzare i tempi di picking AGV (Qiskit_QUBO).
29. **Instradamento Multi-Modale Merci Transcontinentali:** Selezione combinata treno-nave-gomma con vincoli di emissioni CO2 (Classico HPC / GIS).
30. **Bilanciamento Flussi di Resi nell'E-Commerce (Reverse Logistics):** Instradamento rapido delle merci rese verso centri di ricondizionamento (Classico HPC).
31. **Schedulazione Baie di Carico e Scarico Interportuali:** Prevenzione dei tempi di attesa per autotreni nei nodi strategici (Qiskit_QAOA).
32. **Gestione Scorte di Sicurezza con Domanda Altamente Volatile:** Calcolo dei livelli di riordino probabilistici per beni deperibili (Qiskit_QAE).
33. **Ottimizzazione Stivaggio Container su Navi Portacontainer:** Bilanciamento pesi, centro di gravità e ordine di scarico nei porti successivi (Qiskit_QUBO).
34. **Riorganizzazione Catena di Fornitura Post-Disruption:** Riassegnazione immediata degli ordini su fornitori secondari in caso di blocco geopolitico (Classico HPC).
35. **Pianificazione Turni di Conducenti e Macchinisti Ferroviari:** Risoluzione di vincoli sindacali, riposi obbligatori e abilitazioni tratte (Qiskit_QUBO).
36. **Instradamento Flotte Navali su Rotte Meteo-Ottimizzate:** Riduzione del consumo di combustibile bunker sfruttando correnti e venti (Classico HPC).
37. **Ottimizzazione Micro-Hub Urbani con Cargo Bike:** Ripartizione dei pacchi nei centri storici a traffico limitato (Qiskit_QAOA).
38. **Previsione dei Colli di Bottiglia nelle Dogane di Confine:** Riconoscimento pattern di congestione nei valichi di frontiera (Classico HPC).
39. **Sincronizzazione della Catena del Freddo Farmaceutica:** Monitoraggio delle scadenze e vincoli termici lungo tutta la catena distributiva (Qiskit_AngleOpt).
40. **Pianificazione Manutenzione Scali Ferroviari di Smistamento:** Massimizzazione della disponibilità dei binari di manovra (Classico HPC).
41. **Cross-Docking Dinamico in Piattaforme della GDO:** Trasbordo immediato delle merci da camion in arrivo a furgoni in partenza (Qiskit_QUBO).
42. **Allocazione Vettori Terzi (3PL) in Aste di Trasporto Spot:** Minimizzazione del costo di trasporto su mercati a pronti (Classico HPC).
43. **Ottimizzazione Circolazione Pallet e Contenitori Riutilizzabili:** Tracciamento e reintegro circolare degli imballaggi industriali (Qiskit_QAOA).

---

### CATEGORIA 3: CHIMICA, FARMACEUTICA E MATERIALI (16 Scenari)
44. **Calcolo Stato Fondamentale Molecolare (VQE):** Simulazione della struttura elettronica e dell'energia minima di composti organici (Qiskit_VQE).
45. **Screening Virtuale Farmaci per Docking Proteico:** Valutazione dell'affinità di legame tra molecole candidate e target biologici (Qiskit_VQE).
46. **Ottimizzazione Polimeri per Celle a Combustibile a Idrogeno:** Ricerca di membrane a scambio protonico ad altissima conducibilità (Qiskit_QAOA).
47. **Previsione Solubilità e Biodisponibilità Principi Attivi:** Classificazione quantum-enhanced delle proprietà farmacocinetiche (Qiskit_QSVM).
48. **Simulazione Dinamica Catalizzatori per Fissazione Azoto:** Abbattimento dell'energia di attivazione per processi industriali Haber-Bosch (Qiskit_VQE).
49. **Progettazione Leghe Metalliche Leggere per Aerospazio:** Mappatura dei reticoli cristallini per resistenza a fatica e alte temperature (Classico HPC).
50. **Sintesi Molecolare Guidata per Elettroliti allo Stato Solido:** Identificazione di composti per batterie di nuova generazione ad alta densità (Qiskit_VQE).
51. **Stabilità Termica ed Energetica di Complessi di Coordinazione:** Modellazione di composti metallorganici per fotovoltaico avanzato (Qiskit_VQE).
52. **Ottimizzazione Reticoli MOF (Metal-Organic Frameworks) per Cattura CO2:** Massimizzazione della capacità di adsorbimento gassoso selettivo (Qiskit_QUBO).
53. **Previsione Strutture Cristalline e Polimorfismo Farmaceutico:** Prevenzione di transizioni di fase indesiderate nei farmaci solidi (Classico HPC).
54. **Simulazione Reazioni di Fotodegradazione Inquinanti:** Studio dei percorsi fotochimici indotti da radiazione UV su microplastiche (Qiskit_VQE).
55. **Progettazione Molecole Fluorurate per Refrigeranti a Basso GWP:** Sostituzione dei gas fluorurati ad alto effetto serra (Classico HPC).
56. **Calcolo Spettri NMR e Risonanza Magnetica Molecolare:** Spettroscopia computazionale su molecole chirali complesse (Classico HPC).
57. **Ottimizzazione Forme Nanostrutturate per Drug Delivery:** Ingegnerizzazione di liposomi e nanoparticelle per rilascio mirato (Classico HPC).
58. **Simulazione Ossidazione ad Alta Temperatura in Turbine a Gas:** Studio dell'erosione superficiale delle superleghe a base nichel (Classico HPC).
59. **Design Computazionale di Inibitori Enzimatici Selettivi:** Minimizzazione degli effetti collaterali off-target in oncologia (Qiskit_VQE).

---

### CATEGORIA 4: MANIFATTURA E PRODUZIONE INDUSTRIALE (15 Scenari)
60. **Pianificazione Manutenzione Predittiva Impianti Complessi:** Schedulazione interventi tecnici prima del guasto critico dei cuscinetti (Qiskit_QUBO).
61. **Job Shop Scheduling Multi-Macchina con Precedenze:** Ottimizzazione dei tempi di attrezzaggio e sequenze di lavorazione CNC (Qiskit_QAOA).
62. **Controllo Qualità Ottico Real-Time su Linee di Montaggio:** Ispezione automatizzata di micro-difetti su lamiere e circuiti stampati (Classico HPC / CNN).
63. **Bilanciamento Dinamico Linee di Saldatura Robotizzate:** Assegnazione delle traiettorie per evitare collisioni e colli di bottiglia (Qiskit_QUBO).
64. **Ottimizzazione Taglio Lamiere e Pannelli (Cutting Stock Problem):** Minimizzazione degli sfridi metallici e di materiale composito (Qiskit_QUBO).
65. **Sincronizzazione Cinematica Nastri e Robot Scara di Confezionamento:** Azzeramento dei micro-fermi linea nel packaging ad altissima velocità (Classico HPC).
66. **Ottimizzazione Parametri di Stampaggio a Iniezione Plastica:** Prevenzione di ritiri e deformazioni termiche su scocche complesse (Classico HPC).
67. **Pianificazione Fabbisogni Materiali (MRP) con Lead Time Incerti:** Approvvigionamento componenti a ciclo chiuso (Classico HPC).
68. **Gestione Consumi Energetici di Picco in Fonderie Acciaierie:** Spostamento dei carichi termici nelle fasce a minor costo orario (Qiskit_QUBO).
69. **Calibrazione Automatica Macchine Utensili a 5 Assi:** Compensazione in tempo reale delle dilatazioni termiche strutturali (Classico HPC).
70. **Ottimizzazione Sequenze di Verniciatura Automotive:** Riduzione del lavaggio solventi e cambi colore in cabina (Qiskit_QAOA).
71. **Monitoraggio Usura Utensili tramite Riconoscimento Vibrazionale:** Segnalazione automatica sostituzione inserti di fresatura (Classico HPC).
72. **Pianificazione Layout di Reparto per Nuove Linee Produttive:** Minimizzazione delle distanze di movimentazione interna carrelli (Classico HPC).
73. **Bilanciamento Termico ed Elettrico di Server Farm Industriali:** Controllo predittivo HVAC per datacenter di fabbrica (Classico HPC).
74. **Ottimizzazione Assemblaggio Pacchi Batteria per Veicoli Elettrici:** Selezionamento celle litio per matching di resistenza interna (Qiskit_QUBO).

---

### CATEGORIA 5: TELECOMUNICAZIONI E RETI (12 Scenari)
75. **Allocazione Ottimale di Canali e Spettro Frequenziale 5G/6G:** Eliminazione delle interferenze co-canale nelle microcelle urbane (Qiskit_QAOA).
76. **Instradamento Pacchetti a Minima Latenza in Reti SDN:** Percorsi dinamici ottimali per flussi video e telemedicina (Qiskit_QUBO).
77. **Posizionamento Ottimale di Antenne e Ripetitori su Territorio Montuoso:** Massimizzazione della copertura con numero minimo di stazioni radio base (Qiskit_QUBO).
78. **Rilevamento e Mitigazione Attacchi DDoS Distribuiti:** Riconoscimento rapido di burst anomali e isolamento dei botnet (Qiskit_QSVM).
79. **Distribuzione Chiavi Quantistiche (Quantum Key Distribution - QKD):** Ottimizzazione del rate di fotoni singoli e tolleranza al rumore ottico (Qiskit_QKD).
80. **Bilanciamento del Traffico su Dorsali Sottomarine in Fibra:** Gestione della dispersione cromatica e dei canali DWDM transoceanici (Classico HPC).
81. **Previsione Disconnessioni in Roaming su Reti ad Alta Velocità:** Handover predittivo per passeggeri di treni AV e aerei (Classico HPC).
82. **Allocazione Risorse di Calcolo Multi-Access Edge Computing (MEC):** Offloading di carichi computazionali per auto a guida autonoma (Qiskit_QUBO).
83. **Riconfigurazione Automatica Reti Mesh in Casi di Emergenza:** Ripristino della connettività dopo catastrofi naturali (Qiskit_QAOA).
84. **Segmentazione di Rete (Network Slicing) con SLA Critici:** Garanzia di banda garantita e latenza deterministica per l'industria 4.0 (Classico HPC).
85. **Ottimizzazione Costellazioni Satellitari LEO per Internet Globale:** Puntamento fasci phased-array e prevenzione interferenze con l'orbita geostazionaria (Classico HPC).
86. **Rilevamento Anomalie e Guasti Fibra Tramite OTDR:** Localizzazione precisa di micro-curvature e rotture nei cavi interrati (Classico HPC).

---

### CATEGORIA 6: ENERGIA, RETI ELETTRICHE E UTILITIES (12 Scenari)
87. **Unit Commitment Idroelettrico e Termoelettrico:** Accensione e spegnimento orario delle centrali per soddisfare la curva di carico (Qiskit_QUBO).
88. **Ottimizzazione Flusso di Potenza Ottimale (Optimal Power Flow - OPF):** Mantenimento delle tensioni di nodo e contenimento perdite joule di linea (Classico HPC).
89. **Integrazione di Sistemi di Accumulo a Batteria (BESS) con Parchi Eolici:** Arbitraggio energetico intraday e attenuazione delle rampe di vento (Qiskit_QUBO).
90. **Pianificazione Ricarica Flotte Veicoli Elettrici (Smart Charging):** Prevenzione di sovraccarichi sulle cabine di media tensione cittadine (Qiskit_QAOA).
91. **Previsione Produzione Fotovoltaica con Copertura Nuvolosa Mobile:** Elaborazione di immagini satellitari e nowcasting a 15 minuti (Classico HPC).
92. **Ottimizzazione Pressione Reti Acquedottistiche e Rilevamento Perdite:** Regolazione valvole PRV per riduzione delle rotture di condotta (Classico HPC).
93. **Bilanciamento Flussi e Miscelazione Idrogeno in Reti Gas Metano:** Monitoraggio della compatibilità metallurgica e del potere calorifico (Classico HPC).
94. **Dislocazione Ottimale di Generazione Distribuita (Microgrid):** Autonomia energetica di distretti industriali e ospedalieri isolabili (Qiskit_QUBO).
95. **Gestione Flessibilità della Domanda (Demand Response) per Consumatori:** Remunerazione delle riduzioni di carico industriale durante i picchi di rete (Classico HPC).
96. **Pianificazione Taglio Vegetazione e Pulizia Linee Alta Tensione:** Prevenzione scariche verso terra e incendi boschivi (Classico HPC / GIS).
97. **Ottimizzazione Cicli di Ricarica Combustibile Nucleare:** Disposizione degli elementi di uranio nel nocciolo per massimizzare il burnup (Qiskit_QUBO).
98. **Localizzazione Guasti e Ripristino Automatico Reti di Distribuzione:** Isolamento rapido del tronco guasto e richiusura ad anello (Classico HPC).

---

### CATEGORIA 7: SANITÀ, GENOMICA E RICERCA CLINICA (10 Scenari)
99. **Allineamento Multiplo Sequenze Genomiche e DNA:** Mappatura di inserzioni, delezioni e mutazioni puntiformi su vasta scala (Qiskit_QUBO).
100. **Previsione Folding Proteico 3D da Sequenza Amminoacidica:** Determinazione della conformazione nativa a minima energia (Qiskit_VQE).
101. **Pianificazione Fasci di Radioterapia Conformazionale (IMRT):** Massimizzazione della dose tumorale preservando gli organi a rischio adiacenti (Qiskit_QAOA).
102. **Ottimizzazione Schedulazione Sale Operatorie d'Urgenza:** Gestione combinata di equipe chirurgiche, anestesisti e posti letto terapia intensiva (Qiskit_QUBO).
103. **Stratificazione Rischio Scompenso Cardiaco Acuto:** Analisi di correlazione non-lineare tra telemetrie ECG e parametri ematochimici (Classico HPC).
104. **Screening Poligenico del Rischio Oncologico Ereditario:** Calcolo del punteggio PRS su milioni di varianti genetiche (Classico HPC).
105. **Ottimizzazione Turni e Reperibilità Personale Medico Ospedaliero:** Rispetto delle direttive orarie europee e bilanciamento dei carichi di reparto (Qiskit_QUBO).
106. **Allocazione Risorse di Terapia Intensiva in Scenari Pandemici:** Distribuzione equa e razionale di ventilatori polmonari e presidi salvavita (Classico HPC).
107. **Previsione Sviluppo Resistenza agli Antibiotici in Terapia Intensiva:** Mappatura delle mutazioni batteriche e scelta del cocktail terapeutico (Classico HPC).
108. **Mappatura Connettomica Cerebrale e Diffusione Neurodegenerativa:** Modellazione della propagazione prionica di aggregati proteici (Tau/Beta-Amiloide) (Qiskit_VQC).

---

## 8. SPECIFICHE DI INPUT FILE 1 E FILE 2

Per garantire l'elaborazione deterministica senza errori di colonna, il parser si basa sulla **geometria posizionale**:

### File 1: Anagrafica Risorse (`1_anagrafica_risorse.csv`)
* **Colonna 0:** Identificativo alfanumerico univoco della risorsa (es. `asset_01`, `linea_a`, `enzima_x`, `nodo_milano`).
* **Colonna 1:** Descrizione / Nome commerciale leggibile.
* **Colonna 2:** Valore numerico di peso, probabilità o saturazione (es. `0.85` o `0,85` o `85%`).

```csv
id_risorsa,nome_commerciale,priorita_peso
asset_01,Titolo Governativo Benchmark,0.85
asset_02,Obbligazione Corporate Investment Grade,0.70
asset_03,Fondo Azionario High Alpha,0.60
asset_04,Derivato di Copertura Volatilità,0.90
```

### File 2: Matrice Connessioni / Covarianza (`2_matrice_connessioni.csv`)
* Matrice quadrata $N \times N$ simmetrica.
* L'intestazione di colonna deve contenere gli stessi identici ID del File 1.
* I valori sulle righe e colonne indicano il grado di interazione:
  * `0.00`: Risorse indipendenti.
  * Tra `0.01` e `0.59`: Legame morbido continuo (Porta CP / Sfasamento continuo).
  * $\ge 0.60$: Blocco rigido critico (Porta Controlled-NOT / CX).

```csv
id_risorsa,asset_01,asset_02,asset_03,asset_04
asset_01,1.00,0.40,0.65,0.15
asset_02,0.40,1.00,0.50,0.75
asset_03,0.65,0.50,1.00,0.30
asset_04,0.15,0.75,0.30,1.00
```

### Freno di Emergenza Hardware a 127 Qubit
I processori quantistici utility-scale IBM (chip Eagle ed Heron) supportano fisicamente un massimo di **127 qubit**.  
* Se il File 1 contiene fino a 127 righe, viene generato il circuito quantistico completo.
* Se il File 1 supera 127 righe, l'applicazione applica dinamicamente un freno di sicurezza a 127 qubit per il ramo quantistico (notificando l'utente) e commuta l'intero dataset sul **Ramo Classico HPC**, capace di elaborare matrici di milioni di righe con solver SLSQP vettorizzato.

---

## 9. GUIDA ALL'ESECUZIONE LOCALE E SU CLOUD IBM QUANTUM

### 9.1 Esecuzione Locale con Python
Per eseguire lo script generato sulla propria workstation:
```bash
# 1. Creare ambiente virtuale isolato
python3 -m venv venv_quantum
source venv_quantum/bin/activate

# 2. Installare le librerie scientifiche e quantistiche
pip install numpy pandas scipy matplotlib qiskit qiskit-aer

# 3. Posizionare i due file CSV nella stessa cartella dello script
# 1_anagrafica_risorse.csv
# 2_matrice_connessioni.csv

# 4. Eseguire la simulazione
python3 script_quantum_pepsight.py
```

### 9.2 Esecuzione su IBM Quantum Composer
1. Copiare il codice del **Circuito OpenQASM 3.0** dal pop-up dei risultati con il pulsante `Copia Codice`.
2. Accedere alla piattaforma cloud: [https://quantum.ibm.com/composer](https://quantum.ibm.com/composer).
3. Cliccare sulla vista codice **OpenQASM 3.0** e incollare il testo.
4. Il layout circuitale (porte RY, CX, CP e misure di collasso) verrà renderizzato istantaneamente e sarà pronto per l'invio su una QPU reale o sul simulatore cloud Aer.

---

*Documento generato e validato con successo dal motore deterministico Agent AI Pepsight.*
