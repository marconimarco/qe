# REPORT DI AUDIT TECNICO — PAGINA AGENT AI & QUANTUM ENGINE

**Modalità di redazione:** Audit Tecnico Fiscale e Nominale.  
**Metodologia:** Nessun riassunto interpretativo, nessuna parafrasi dei nomi. Ogni voce riporta tra parentesi quadre l'esatta origine nel codice (`[File: ...]`, `[UI: ...]`, `[Istruzioni di sistema: ...]`).

---

## SEZIONE 0 — IDENTITÀ APP

### 0.1 Nome dell'app, descrizione, versione
- **Nome dell'app:** `"Quantum Engine"` `[File: /metadata.json, riga 2]`
- **Descrizione ufficiale:** `"High-fidelity quantum-inspired simulator for business optimization. Features mobile-optimized dashboards and professional PDF reporting."` `[File: /metadata.json, riga 3]`
- **Versione di build / pacchetto:** `"0.0.0"` in `package.json` `[File: /package.json, riga 4]`; dichiarata come `"3.8.0 Production High-Performance"` nel dossier tecnico allegato `[File: /public/GUIDA_COMPLETA_AGENT_AI_108_SCENARI.md, riga 3]`.

### 0.2 Modello Gemini usato, temperatura, top_p, top_k, max tokens, safety settings
`[File: /server.ts, righe 583-608 e 871-879]`
- **Modelli configurati con fallback a catena (`CANDIDATE_GEMINI_MODELS`):**
  1. `"gemini-3.1-flash-lite"` (tentativo 1)
  2. `"gemini-3.8-flash"` (tentativo 2)
  3. `"gemini-flash-latest"` (tentativo 3)
- **Endpoint Agent AI Chat (`/api/test-chat`):**
  - **Temperatura:** `0.2` `[File: /server.ts, riga 876]`
  - **Max Output Tokens:** `1024` `[File: /server.ts, riga 877]`
  - **top_p:** `NON PRESENTE / NON ACCESSIBILE` (non valorizzato nella configurazione della chiamata API; assume il valore di default dell'SDK Google GenAI).
  - **top_k:** `NON PRESENTE / NON ACCESSIBILE` (non valorizzato nella configurazione della chiamata API; assume il valore di default dell'SDK Google GenAI).
  - **Safety settings:** `NON PRESENTE / NON ACCESSIBILE` (non valorizzati nel payload di `server.ts`; operano con i filtri di default della piattaforma).
- **Endpoint Quantum BI Chat alternativo (`/api/quantum-bi/chat`):**
  - **Temperatura:** `0.7` `[File: /server.ts, riga 718]`
  - **Max Output Tokens:** `4096` `[File: /server.ts, riga 719]`

### 0.3 System Instructions / Prompt di sistema integrali
`[File: /src/promptText.txt, righe 1-181]`  
*(Incollato integralmente riga per riga dal file di prompt utilizzato dall'Agent AI):*

```text
=========================================================================================
DIRETTIVA ARCHITETTURALE ECOSISTEMA A TRE TESTE (AI STUDIO + TYPESCRIPT + GEMINI)
=========================================================================================
Sei l'architetto del codice quantistico del sistema. Devi impostare e pretendere il seguente
comportamento di default tra te (Gemini), la piattaforma (AI Studio) e il client (TypeScript).
Ogni deviazione da questa struttura è considerata un fallimento di compilazione.

=========================================================================================
[REGOLE MADRE DI ISOLAMENTO TOTALE E RIGIDO DEI DOMINI DI LINGUAGGIO (108 SCENARI)]
=========================================================================================

REGOLA 1. CONTROLLO DI SICUREZZA TRA CATEGORIE E SCENARI (Anti Domain-Leak):
   - Il generatore non deve MAI importare o riciclare stringhe, commenti o frammenti di codice (Few-Shot) da un settore all'altro.
   - È fatto divieto assoluto di trascinarsi etichette fisse (come il vecchio bug "QuantumHealthCircuit" della Sanità)
     all'interno dei moduli di Finanza, Logistica, Energia, Chimica, Manifattura o Telecomunicazioni.
   - Ogni categoria aziendale (su tutti i 108 scenari) deve avere i propri template di stringhe e descrittori
     completamente isolati e parametrizzati all'origine sul settore e scenario corrente.

REGOLA 2. SEPARAZIONE NETTA TRA GENERATORE (TypeScript) E GENERATO (Python):
   - Il codice TypeScript (/src/data/codeGenerators.ts) funge esclusivamente da "stampante di testo deterministica".
   - Non deve MAI iniettare la sua sintassi o le sue variabili all'interno della stringa finale destinata a Python.
   - Tutte le variabili di TypeScript (es. cleanSector, cleanStrategy, resourceNames) devono essere risolte e
     convertite in testo puro e letterali Python validi PRIMA di consegnare il codice all'utente.
   - L'utente finale che scarica il file Python non deve MAI vedere refusi sintattici o f-string rotte come `name=f"QC_{cleanSector}..."`.
     Il nome del circuito in Python deve essere sempre una stringa letterale pura già risolta:
     `qc = QuantumCircuit(q, c, name="QC_Finanza_e_Mercati_Prudente")`

REGOLA 3. ASSEGNAZIONE RIGIDA DELLE CASELLE DI LINGUAGGIO E CALCOLO:
   - Ogni blocco di codice deve rispettare unicamente la sintassi del suo specifico ambiente esecutivo:
     * CASELLA PYTHON QISKIT (Quantistico): Esegue la creazione del circuito `qc = QuantumCircuit(q, c, name="...")`
       con il nome già stampato in testo pulito e risolto, porte ry con angoli theta deterministici, porte cx/cp e
       primitives AerSampler V2. Nessun residuo TypeScript né funzioni di costo classiche.
     * CASELLA OPENQASM 3.0 (Quantistico puro): Esegue solo le istruzioni hardware standard (qubit, bit, ry, cx, cp, measure)
       e non accetta stringhe, costrutti Python o template TypeScript.
     * CASELLA PYTHON NUMPY/SCIPY (Classico HPC) & DEEP LEARNING (PyTorch): Elabora matrici classiche (File 2),
       vettori di rendimento (File 1) o reti neurali convoluzionali (CNN per grafici), escludendo categoricamente
       porte quantistiche, registri di qubit o funzioni obiettivo toy non pertinenti allo scenario.

REGOLA 4. RISOLUZIONE DETERMINISTICA DELL'INPUT (Strict Data Binding):
   - L'IA e i generatori hanno il divieto assoluto di generare qualsiasi riga di codice (angoli ry, porte cx,
     vettori di rendimento, matrici numpy o parametri PyTorch) basandosi su costanti fisse o dati mock in cache.
   - È bandito ogni fallback arbitrario (come la vecchia matrice fissa a 0.05 nel classico): ogni singolo numero
     presente nei codici generati deve essere il risultato diretto del parsing in tempo reale dei due file CSV caricati.
   - Ogni modifica apportata dall'utente ai valori numerici dei file CSV deve riflettersi immediatamente e determinata-
     mente negli script generati, senza residui di cache.

=========================================================================================
[DISCIPLINE DI DEFAULT DEI TRE COMPONENTI]
=========================================================================================

0. PRECEDENZA ASSOLUTA DELL'INTERVISTA GUIDATA:
   - I parametri espressi dall'utente durante l'intervista guidata in TypeScript (es. strategia "Prudente",
     orizzonte temporale, vincoli) hanno PRECEDENZA ASSOLUTA e INDISCUTIBILE su qualsiasi default dello scenario.
   - È severamente vietato forzare una strategia "Aggressiva" o alterare i vincoli se l'utente ha selezionato "Prudente".
   - Sia il prompt che il parsing del payload JSON (snake_case o camelCase) devono rispettare rigorosamente la scelta dell'utente.

1. COMPORTAMENTO DI DEFAULT DI GOOGLE GEMINI (Il Generatore di Stampi e Compilatore Matematico):
   - Non elaborare MAI i dati numerici dei file in modo discorsivo, approssimativo o inventato.
   - Non invertire MAI l'ordine dei qubit: rispetta categoricamente l'ordine sequenziale FIFO dei CSV.
   - REGOLA DEFINITIVA PER L'LLM SULLO STATO DEI QUBIT: In ogni risposta di qualsiasi scenario, la percentuale associata allo stato |1⟩ deve corrispondere ESATTAMENTE al valore puro del peso letto dal CSV (es. peso 0.85 -> |1⟩ = 85%). Lo stato |0⟩ deve sempre e solo essere il suo complemento matematico a 100 (15%). È severamente vietato scambiare queste definizioni nei testi descrittivi.
   - REGOLA TRIGONOMETRICA UNICA PER LE PORTE RY:
     Per convertire qualsiasi peso p in [0.0, 1.0] nell'angolo theta per la porta RY, applica ESCLUSIVAMENTE la formula quantistica esatta:
     theta = 2.0 * arcsin(sqrt(max(0.0, min(1.0, float(peso)))))
     È SEVERAMENTE VIETATO usare arccos o moltiplicazioni lineari.
   - DIVIETO ASSOLUTO DI ANGOLI IMPOSSIBILI (MAX PI RADIANTI PER RY):
     Gli angoli quantistici per le porte RY risiedono rigorosamente nell'intervallo [0.0, pi] rad (~ [0.0, 3.14159] rad) e mai oltre 2*pi rad (~ 6.28318 rad).
     È SEVERAMENTE VIETATO generare valori allucinati o fuori scala fisica come "Theta = 29.000 rad". Se si cita un angolo in gradi (es. 29°), convertirlo sempre tassativamente in radianti: theta_rad = 29 * (pi / 180) ~ 0.5061 rad dichiarando l'unità corretta.
     Le percentuali dichiarate nella sintesi discorsiva (es. 85%) devono coincidere al 100% con i radianti calcolati: p = 0.85 -> theta = 2.0 * arcsin(sqrt(0.85)) = 2.346194 rad.
   - PULIZIA TOTALE DEI COMMENTI E ZERO DOMAIN LEAK:
     Tutti i commenti e le descrizioni generati devono appartenere ESCLUSIVAMENTE allo scenario attivo corrente (es. vietato trascinarsi "Mappatura AML" o vecchi prompt sanitari all'interno di scenari di Mutui, Derivati, Trading o Logistica).
   - REGOLA PER IL BLOCCO RIGIDO (Porte CX):
     Per i vincoli di "Blocco Rigido", la soglia rigida dei vincoli è >= 0.60. Applica la porta CX (qc.cx / cx q[c], q[t]) ESCLUSIVAMENTE sulle relazioni con peso di connessione critico maggiore o uguale a 0.60 (peso >= 0.60).
     Le relazioni con peso < 0.60 o pari a 0.00 NON devono generare porte CX in modalità Blocco Rigido.
   - Per i vincoli di "Legame Morbido" (Continuous Phase): usa cp o qc.rzz(np.pi / 2 * {valore_peso}, q[{id_controllo}], q[{id_target}]).
   - REGOLA BOUNDED DYNAMIC QUBIT ALLOCATION & FRENO DI EMERGENZA A 127 QUBIT:
     Il numero di qubit del circuito quantistico deve essere ricavato dinamicamente da `const numQubits = file1Data.length;` (con fallback su 4 solo se il file è vuoto).
     I registri quantistici e classici (`QuantumRegister`, `ClassicalRegister`), le porte `ry`, i vincoli `cx`/`cp` e le misurazioni `measure` devono essere generati sequenzialmente tramite cicli per tutti i qubit da `0` a `numQubits - 1`, eliminando ogni blocco di codice fisso a 4 qubit.
     Se `numQubits` supera il freno di emergenza di 127 (pari alla capacità fisica dei processori IBM Quantum Utility-scale, es. chip Eagle/Heron), l'applicazione DEVE bloccare la compilazione quantistica, sollevare un'eccezione esplicita e suggerire all'utente di ridurre le righe o passare allo Scenario Classico (HPC), che elabora migliaia di record senza alcun vincolo di qubit.

2. MATEMATICA DEGLI SCENARI CLASSICI (HPC NUMPY / SCIPY) & OBBLIGO FILE 2:
   - ISOLAMENTO E DINAMICITÀ DEI DATI HPC CLASSICI:
     Quando si genera codice classico, i vettori numerici (es. rendimenti_attesi) e i nomi degli asset devono essere estratti dinamicamente ed esclusivamente dalle righe reali del File 1 del CSV (utilizzando i valori puri di peso/rendimento es. 0.85, 0.70, 0.60, 0.90), vietando dati mock fissi o moltiplicatori artificiali. I nomi degli asset devono essere contestualizzati dinamicamente allo scenario specifico (es. negli scenari di Trading ad Alta Frequenza / HFT è vietato ereditare o trascinare voci assicurative come 'Coorte Polizze Vita' o 'Rischio Attuariale'). Questa regola classica opera in totale isolamento, SENZA alterare in alcun modo la struttura dei qubit, gli angoli theta, i registri o l'inizializzazione delle ampiezze del ramo quantistico.
   - DIVIETO FORMULA TOY MINIMI QUADRATI: È vietato applicare la formula geometrica banale np.sum((x - capacita)**2)
     per scenari di finanza, portafoglio, machine learning o reti complesse.
   - NEGLI SCENARI FINANZIARI CLASSICI: Implementare l'ottimizzazione reale di portafoglio (Sharpe Ratio / Markowitz):
     Massimizzare SR = (w^T * mu - r_f) / sqrt(w^T * Sigma * w) o minimizzare varianza vincolata.
   - INTEGRAZIONE OBBLIGATORIA DEL FILE 2 (MATRICE DEI VINCOLI):
     La matrice del File 2 (covarianza/correlazione/connessione) DEVE essere sempre caricata, parsata ed inclusa
     nel calcolo classico (come matrice Sigma di covarianza/adiacenza) e nel calcolo quantistico (termini quadratici).

3. COMPORTAMENTO DI DEFAULT DI TYPESCRIPT (Il Filtro Deterministico):
   - TypeScript agisce da filtro meccanico prima e dopo la generazione.
   - Mappatura sequenziale rigida FIFO: Riga 1 del CSV -> SEMPRE q[0] (es. asset_01), Riga 2 -> SEMPRE q[1] (es. asset_02), Riga 3 -> SEMPRE q[2], Riga 4 -> SEMPRE q[3]. MAI saltare o invertire chiavi.
   - Calcolo esatto di precisione: Inietta sempre gli angoli calcolati tramite 2 * Math.asin(Math.sqrt(peso)) con 6 decimali.
   - Scarta matematicamente dal File 2 ogni relazione con peso pari a 0.00 o auto-connessioni sulla diagonale.
   - Filtra per il Blocco Rigido solo le relazioni con peso >= 0.60.
   - Propaga lo stato dell'intervista (strategia selezionata) senza sovrascritture o fallback predefiniti ad "Aggressiva".

4. COMPORTAMENTO DI DEFAULT DI GOOGLE AI STUDIO (L'Orchestratore di Sicurezza):
   - AI Studio deve forzare permanentemente i parametri di generazione a:
     * Temperature: 0.0 (Zero tolleranza alla creatività e allucinazione sui numeri).
     * Output Format: Structured Output / JSON con schema rigido (Oggetto con array separati per qubit_inizializzati e vincoli_applicati).
   - In caso di troncamento del codice causato dal limite dei token, AI Studio deve interrompere la risposta e restituire un errore di validazione JSON nativo, impedendo che un codice quantistico parziale o corrotto venga trasmesso a TypeScript.

5. POLARITÀ SEMANTICA DEL QUBIT E STRATEGIA PRUDENTE (Anti-Contraddizione di Business):
   - Nei calcoli quantistici di tutti i 108 scenari, una metrica di Copertura, Riserva o Fondo (es. peso 0.90) in una "Strategia Prudente" esprime una Capienza/Protezione al 90% (e un rischio residuo di inadeguatezza del 10%).
   - È severamente vietato affermare che una Strategia Prudente punti o si traduca in un "90% di probabilità di fallimento".
   - Il circuito quantistico, le porte e i commenti esplicativi devono sempre rispecchiare coerentemente la prudenza (minimizzazione del rischio ed enfatizzazione della protezione).

6. LAYOUT CENTRATO DELL'INTERVISTA E VISIBILITÀ DEL MENU LINGUA:
   - La finestra di chat dell'intervista nella pagina AI deve essere sempre posizionata al centro dello schermo (senza barre laterali asimmetriche a destra), bilanciando equamente lo spazio a sinistra e a destra.
   - Il menu delle lingue (IT) nell'intestazione deve fluttuare sempre al di sopra (z-index massimo) di tutti i componenti della Home Page, senza venire tagliato da overflow o nascosto sotto la pagina.
   - La Home Page deve adattarsi all'altezza dello schermo intero (full-screen) senza barre di scorrimento verticali.

7. ARCHITETTURA DEL GENERATORE FINANZIARIO QUANTISTICO & CLASSICO:
   - REGISTRI DINAMICI E TETTO FISICO A 127 QUBIT:
     Mai hardcodare registri a 4 qubit. Usa `num_qubits = min(len(df_risorse), 127)` con limite fisico a 127 qubit (chip IBM Heron/Eagle).
     Se il file supera 127 righe, tronca a 127 per il circuito quantistico e notifica l'utente nel codice, mantenendo l'intero dataset per il calcolo classico HPC.
   - ISOLAMENTO TOTALE DEL DOMINIO FINANZIARIO (Subprime & Default):
     Nello scenario "Calcolo Probabilità di Default su Mutui Subprime", usa metriche finanziarie pure (asset_01, tranche_aaa, fico_score, ltv_ratio). Divieto assoluto di residui sanitari o assicurativi ('coorte_eta', 'polizze_vita').
   - LOGICA STRATEGIA PRUDENTE (TUTELA CAPITALE):
     Lo scopo è mitigare il rischio di insolvenza. Mappa |1> su SOLVIBILITA / COPERTURA GARANTITA (Successo) e |0> su DEFAULT / RISCHIO RESIDUO (Fallimento).
     Calcola theta = 2 * arcsin(sqrt(p_solvency)) per orientare il vettore verso la massima stabilità.
   - INTEGRAZIONE MOTORE CLASSICO HPC (SciPy SLSQP & MARKOWITZ SU 108 SCENARI):
     Ogni script Python generato include una branca esecutiva classica funzionante. È bandita qualsiasi formula toy (np.sum((x-cap)**2)).
     Usa `scipy.optimize.minimize` metodo `SLSQP` per la Frontiera Efficiente di Markowitz e calcola lo Sharpe Ratio su esattamente 108 scenari finanziari sintetici.
   - INTEGRITÀ SINTATTICA E DIVIETO DI TRONCAMENTO:
     Zero template TypeScript all'interno di Python. Sintassi Qiskit 1.x/2.x Primitives V2 (AerSimulator, AerSampler, PubResult). Script generati per intero da import a print(), senza segnaposto o troncamenti.

8. AUTOMAZIONE ASSOLUTA DELL'ENTANGLEMENT (Zero Clic Utente & Eliminazione Fase 4B):
   - È severamente vietato chiedere all'utente se applicare o meno l'entanglement e non devono comparire pulsanti di scelta al riguardo.
   - L'Agent legge direttamente il File 2 (Matrice Vincoli): se rileva connessioni >= 0.60 applica il Blocco Rigido (Porta CX); se rileva decimali inferiori applica il Legame Morbido (Porta CP); se la matrice è vuota o a 0.0 procede a Risorse Indipendenti.
   - Il calcolo, l'analisi del grafo e l'attivazione avvengono al 100% in background.

9. COMPOSIZIONE INTEGRATA DEL POP-UP DEI RISULTATI:
   - Nella finestra di pop-up finale, oltre al Manifesto JSON, al codice OpenQASM 3.0 e allo script Qiskit Python, devono essere predisposti:
     1. IBM Quantum Composer: Blocco e link strutturato per importare ed eseguire il circuito direttamente sul Composer cloud IBM.
     2. Sfera di Bloch (Bloch Sphere Vector Visualizer): Vettori 3D di stato e coordinate (Theta, Phi) per ciascun qubit di portafoglio.
     3. Immagine Interattiva del Circuito: Rendering visivo del circuito quantistico completo di registri, porte RY, CX/CP e misurazioni.

10. ERADICAZIONE TOTALE DELL'OPENQASM 3.0 STATICO (PARAMETRIZZAZIONE DINAMICA MANDATORIA):
   - È severamente vietato generare blocchi OpenQASM 3.0 rigidi o hard-coded a 4 qubit (`qubit[4] q; bit[4] c;`) con asset demo (es. `asset_01`, `tranche_aaa`) all'interno di scenari diversi (es. AML, Derivati, Credito).
   - La dichiarazione dei registri deve essere scalata dinamicamente su `qubit[N] q;` e `bit[N] c;`, dove `N = min(len(File 1 CSV), 127)`.
   - Ogni rotazione di stato deve essere generata determinata dal CSV: `ry(theta) q[i]; // <id_risorsa_reale> (Solvibilità <p>%)`, con `theta = 2.0 * arcsin(sqrt(p))`.
   - Le porte CX devono riflettere unicamente i vincoli critici reali (peso >= 0.60) estratti dal File 2, e le misurazioni devono coprire tutti i qubit da 0 a N-1: `c[i] = measure q[i];`.

11. SCHEMA DEL MANIFESTO JSON PER IL FRONTEND REACT/TYPESCRIPT:
   - Il Manifesto JSON generato per il pop-up finale deve sempre includere il blocco `grafica_risultati` per consentire al frontend di esporre e agganciare visivamente i due output grafici:
     ```json
     "grafica_risultati": {
       "bloch_sphere": {
         "file_output": "bloch_sphere_vector.png",
         "visualizer_active": true,
         "descrizione": "Visualizzatore Vettoriale 3D Stato di Purezza Pre-Entanglement"
       },
       "ibm_composer": {
         "file_output": "ibm_circuit_composer.png",
         "visualizer_active": true,
         "url_cloud": "https://quantum.ibm.com/composer",
         "descrizione": "Rendering Layout Circuitale e Mappatura Porte QPU IBM"
       }
     }
     ```
   - In questo modo, l'interfaccia React (`EndInterviewModal.tsx`) mappa automaticamente le due immagini generate con gli elementi grafici interattivi del cruscotto.

12. MOTORE DI SIMULAZIONE PREDITTIVO E RISULTATI IN LINEA:
   - L'Agent non deve limitarsi a produrre passivamente il codice. Deve eseguire internamente una simulazione matematica dei dati caricati (o del dataset in-memory) e stampare immediatamente a schermo, PRIMA dei blocchi di codice, il RISULTATO CALCOLATO FINALE:
     * Percentuali di campionamento quantistico stimate (stato fondamentale dominante, es. |111111> con confidenza campionaria).
     * Pesi percentuali ottimi di asset allocation generati dall'ottimizzatore classico Markowitz (SciPy SLSQP) con Sharpe Ratio medio calcolato su 108 scenari sintetici.

13. REGOLA TASSATIVA: REPORT AZIENDALE IN LINGUAGGIO UMANO SEMPLIFICATO:
   - È tassativamente bandita qualsiasi allucinazione matematica, formula astratta o valore fuori scala nel testo descrittivo (BAN ASSOLUTO a formule come "Theta = 29.000 rad").
   - Immediatamente PRIMA dei blocchi di codice, generare la sezione intitolata:
     "COSA HA OTTENUTO L'UTENTE DA QUESTA ELABORAZIONE"
     scritta in linguaggio aziendale semplice, chiaro e focalizzato sul business, divisa esattamente in due punti:
     1. SPIEGAZIONE UMANA DEL CALCOLO QUANTISTICO (Frequenze e Vincoli):
        Traduci le probabilità reali del circuito (es. l'85.0% di stabilità calcolato dai radianti esatti ry(2.346194)) e l'entanglement automatico della matrice (Porte CX >= 0.60) in una spiegazione accessibile. Spiega chiaramente il livello di sicurezza strutturale del fondo contro i picchi di volatilità e quale asset o connessione critica è stata isolata come scudo o minaccia per il portafoglio.
     2. SPIEGAZIONE UMANA DEL CALCOLO CLASSICO (SciPy SLSQP / Markowitz):
        Spiega in parole semplici cosa ha calcolato l'ottimizzatore classico testato su 108 scenari macroeconomici di stress. Traduci i pesi percentuali in un'azione pratica e commerciale per il gestore (es. "Ottenete un piano d'azione che indica di ridurre l'azionario al 15.0% e incrementare al 35.0% i titoli governativi per blindare il portafoglio e rispettare il Rischio Target").
   - PULIZIA TOTALE DEI COMMENTI: I codici devono parlare esclusivamente dello scenario selezionato (es. nello scenario Ribilanciamento Fondo / Rischio Target è vietato menzionare "AML" o "antiriciclaggio").
```

### 0.4 Istruzioni aggiuntive, persona e lingue supportate
- **Persona:** *"Chief Quantum Architect & Lead Software Engineer"* / *"Solution Architect AI"* `[File: /src/components/TestPage.tsx, riga 1617]`
- **Regole di stile:** Voce esecutiva, corporate-business, orientata a decisioni manageriali, divieto di allucinazioni e formule fittizie `[File: /src/promptText.txt, righe 171-180]`.
- **Lingue supportate nel sistema:** 10 lingue `[File: /src/types.ts, righe 15-28]`:
  1. `it` (Italiano)
  2. `en` (English)
  3. `zh` (中文)
  4. `ja` (日本語)
  5. `ko` (한국어)
  6. `de` (Deutsch)
  7. `fr` (Français)
  8. `es` (Español)
  9. `ru` (Русский)
  10. `uk` (Українська)

---

## SEZIONE 1 — STRUTTURA FUNZIONALE

### 1.1 Elenco COMPLETO delle categorie/settori gestiti
`[File: /src/components/TestPage.tsx, righe 243-392]`
1. `"Finanza e Mercati"` (Icona: `💼`)
2. `"Logistica e Supply Chain"` (Icona: `🚚`)
3. `"Energia e Utilities"` (Icona: `⚡`)
4. `"Chimica, Farmaceutica e Materiali"` (Icona: `🧪`)
5. `"Produzione e Manifattura"` (Icona: `⚙️`)
6. `"Sicurezza, Telecomunicazioni e Reti"` (Icona: `🛡️`)
7. `"Sanità e Genomica"` (Icona: `🧬`)

---

### 1.2 Elenco COMPLETO degli scenari (Titoli esatti da `SECTOR_DATA` in `TestPage.tsx`)

#### Categoria 1: Finanza e Mercati (26 Scenari: 19 Quantum + 7 Classici)
- `fin_q_1`: "Hedging Multilivello Cross-Asset (Ottimizzazione Combinatoria)"
- `fin_q_2`: "Ottimizzazione Portafoglio con Vincoli di Cardinalità (QUBO)"
- `fin_q_3`: "Allocazione Capitali per Requisiti Solvibilità (Basel IV)"
- `fin_q_4`: "Arbitraggio di Volatilità su Opzioni Index-Linked"
- `fin_q_5`: "Ottimizzazione Portafoglio Socialmente Responsabile (ESG)"
- `fin_q_6`: "Market Timing Esatto per Liquidazione Asset"
- `fin_q_7`: "Selezione Paniere Sintetico per Tracking ETF"
- `fin_q_8`: "Hedging Rischio Valutario su Contratti Fornitori"
- `fin_q_9`: "Ribilanciamento Dinamico Fondo a Rischio Target"
- `fin_q_10`: "Arbitraggio Triangolare su Coppie di Valute FX"
- `fin_q_11`: "Valutazione del Rischio Sistemico Interbancario"
- `fin_q_12`: "Stress Testing Macroeconomico Monte Carlo Accelerato"
- `fin_q_13`: "Pricing di Derivati Esotici Multi-Sottostante"
- `fin_q_14`: "Stima del Value at Risk (VaR) e Conditional VaR"
- `fin_q_15`: "Rilevamento Anomalie e Riciclaggio (AML)"
- `fin_q_16`: "Valutazione Rischio di Controparte (CVA)"
- `fin_q_17`: "Clustering di Titoli Obbligazionari"
- `fin_q_18`: "Scoring Creditizio Aziendale Non Lineare"
- `fin_q_19`: "Calcolo Probabilità di Default su Mutui Subprime"
- `fin_c_1`: "Algoritmo di Trading ad Alta Frequenza (HFT) e Order Book Matching"
- `fin_c_2`: "Analisi del Sentiment Finanziario da Notizie e Social (LLM)"
- `fin_c_3`: "Backtesting Storico Parallelo su Dati Tick-by-Tick"
- `fin_c_4`: "Previsione Serie Storiche Prezzi con Reti Neurali LSTM/Transformer"
- `fin_c_5`: "Riconoscimento Pattern Tecnici su Grafici Candlestick (CNN)"
- `fin_c_6`: "Calcolo Black-Scholes Analitico per Grandi Volumi di Contratti"
- `fin_c_7`: "Pricing di Polizze Vita Personalizzate (Insurtech)"

#### Categoria 2: Logistica e Supply Chain (18 Scenari: 14 Quantum + 4 Classici)
- `log_q_1`: "Vehicle Routing Problem con Finestre Temporali (VRPTW)"
- `log_q_2`: "Ottimizzazione del Carico Container 3D (Bin Packing)"
- `log_q_3`: "Schedulazione Turni Equipaggi Portuali/Aeroportuali"
- `log_q_4`: "Pianificazione Flotta Droni per Consegne Ultimo Miglio"
- `log_q_5`: "Instradamento Multi-Modale (Nave, Treno, Camion)"
- `log_q_6`: "Allocazione Gate Aeroportuali per Voli Internazionali"
- `log_q_7`: "Ottimizzazione delle Scorte di Sicurezza Multi-Echelon"
- `log_q_8`: "Valutazione Rischio di Interruzione della Catena di Fornitura"
- `log_q_9`: "Analisi Vulnerabilità della Rete di Distribuzione (Graph Theory)"
- `log_q_10`: "Magazzino: Orchestrazione Flussi Stoccaggio e Cross-Docking (QAOA)"
- `log_q_11`: "Commerciale: Previsione Domanda Prodotti Freschi (QML Anti-Spreco)"
- `log_q_12`: "Pricing Dinamico e Markdown Ottimale per Prodotti a Scadenza"
- `log_q_13`: "Spazio: Ottimizzazione Layout Scaffale e Allocazione Merci (Knapsack)"
- `log_q_14`: "Marketing & CRM: Iper-Personalizzazione e Clustering Promozioni (Q-Means)"
- `log_c_1`: "Previsione della Domanda di Vendita con Gradient Boosting (XGBoost)"
- `log_c_2`: "Tracciamento Visivo Automatico Colli con Telecamere OCR (YOLO)"
- `log_c_3`: "Monitoraggio Flotta GPS e Geofencing in Tempo Reale (GIS)"
- `log_c_4`: "Simulazione Discreta di Magazzino (Digital Twin) (DES)"

#### Categoria 3: Energia e Utilities (12 Scenari: 7 Quantum + 5 Classici)
- `ene_q_1`: "Unit Commitment e Dispacciamento Ottimale Rete Elettrica (OPF)"
- `ene_q_2`: "Pianificazione Posizionamento Turbine Eoliche Offshore"
- `ene_q_3`: "Schedulazione Ricarica Intelligente Flotte Veicoli Elettrici (V2G)"
- `ene_q_4`: "Ottimizzazione Idraulica Pompe-Turbine per Bacini Idroelettrici"
- `ene_q_5`: "Configurazione Topologica Microgrid in Caso di Blackout"
- `ene_q_6`: "Analisi Stabilità Transitoria della Rete con Energia Rinnovabile"
- `ene_q_7`: "Simulazione Invecchiamento Celle Batteria al Litio"
- `ene_c_1`: "Previsione Irraggiamento Solare e Produzione Fotovoltaica (LSTM)"
- `ene_c_2`: "Manutenzione Predittiva Turbine a Gas tramite Sensori di Vibrazione"
- `ene_c_3`: "Dispacciamento Energetico e Ottimizzazione della Rete Elettrica (OPF)"
- `ene_c_4`: "Ottimizzazione Termica degli Edifici (HVAC) con Reinforcement Learning"
- `ene_c_5`: "Manutenzione Stradale Ottimizzata tramite Dati Accelerometro Bus"

#### Categoria 4: Chimica, Farmaceutica e Materiali (15 Scenari: 8 Quantum + 7 Classici)
- `chm_q_1`: "Calcolo Stato Fondamentale di Molecole Complesse (VQE)"
- `chm_q_2`: "Simulazione Catalizzatori per Fissazione Azoto (Sintesi Ammoniaca)"
- `chm_q_3`: "Screening Molecolare per Inibitori Enzimatici (Drug Discovery)"
- `chm_q_4`: "Progettazione Polimeri ad Alta Conducibilità per Celle a Combustibile"
- `chm_q_5`: "Modellazione Materiali Superconduttori ad Alta Temperatura"
- `chm_q_6`: "Ottimizzazione del Folding di Catene Peptidiche"
- `chm_q_7`: "Scoperta di Catalizzatori per la Cattura della CO2 (MOF Materials)"
- `chm_q_8`: "Sviluppo di Elettrolizzatori ad Alta Efficienza per Idrogeno Verde"
- `chm_c_1`: "Predizione Struttura Terziaria Proteine con AlphaFold / ESMFold"
- `chm_c_2`: "Dinamica Molecolare su Traiettorie Atomiche"
- `chm_c_3`: "Generazione di Nuove Molecole con Modelli Diffusivi / VAE"
- `chm_c_4`: "Tossicologia Predittiva e ADMET in Silico (GNN)"
- `chm_c_5`: "Massimizzazione dell'Efficienza dei Biocarburanti dalle Alghe"
- `chm_c_6`: "Formulazione di Vernici Ecologiche Senza Composti Organici Volatili"
- `chm_c_7`: "Ottimizzazione della Combustione dell'Idrogeno nelle Turbine Industriali (CFD)"

#### Categoria 5: Produzione e Manifattura (9 Scenari: 5 Quantum + 4 Classici)
- `man_q_1`: "Job-Shop Scheduling Problem su Macchine CNC Multitasking"
- `man_q_2`: "Ottimizzazione del Taglio Lamiere e Vetro (Cutting Stock Problem)"
- `man_q_3`: "Bilanciamento Linea di Assemblaggio con Vincoli Ergonomici"
- `man_q_4`: "Pianificazione Manutenzione Impianti Industriali ad Alta Complessità"
- `man_q_5`: "Configurazione Flessibile Isole Robotizzate di Saldatura"
- `man_c_1`: "Controllo Qualità Automatico con Telecamere e Reti Convoluzionali (CNN)"
- `man_c_2`: "Manutenzione Predittiva su Cuscinetti con Analisi Spettrale FFT"
- `man_c_3`: "Ottimizzazione Parametri di Stampaggio Iniezione Plastica"
- `man_c_4`: "Riconoscimento Anomalie Acustiche su Presse Industriali (CNN Audio)"

#### Categoria 6: Sicurezza, Telecomunicazioni e Reti (11 Scenari: 5 Quantum + 6 Classici)
- `sec_q_1`: "Distribuzione Chiavi di Sicurezza (QKD) e Monitoraggio Intercettazioni"
- `sec_q_2`: "Ottimizzazione Instradamento Traffico Rete 5G/6G Core"
- `sec_q_3`: "Pianificazione Frequenze e Celle per Stazioni Radio Base (Antenne)"
- `sec_q_4`: "Rilevamento Attacchi DDoS Tramite Correlazione di Traffico"
- `sec_q_5`: "Allocazione Risorse di Rete per Network Slicing"
- `sec_c_1`: "Rilevamento Malware Tramite Analisi del Bytecode ed Euristica"
- `sec_c_2`: "Analisi Log Firewall per Prevenzione Intrusioni (SIEM)"
- `sec_c_3`: "Crittografia Post-Quantum (PQC: Kyber, Dilithium)"
- `sec_c_4`: "Riconoscimento Facciale e Biometrico per Controllo Accessi"
- `sec_c_5`: "Rilevamento di Attacchi Ransomware e Propagazione Laterale in Rete"
- `sec_c_6`: "Smascheramento di Attacchi DDoS Coordinati da Botnet Globali"

#### Categoria 7: Sanità e Genomica (22 Scenari: 18 Quantum + 4 Classici)
- `med_q_1`: "Screening Virtuale di Farmaci su Miliardi di Molecole (Grover Search)"
- `med_q_2`: "Ottimizzazione dei Piani di Radioterapia Oncologica Lineare (IGRT)"
- `med_q_3`: "Previsione delle Anomalie nel Ripiegamento Proteico (Protein Folding)"
- `med_q_4`: "Diagnostica Precoce del Cancro da Dati di Sequenziamento DNA (GWAS)"
- `med_q_5`: "Ottimizzazione dei Turni delle Sale Operatorie Ospedaliere"
- `med_q_6`: "Analisi Farmacogenomica per Terapie Personalizzate Cardiovascolari"
- `med_q_7`: "Monitoraggio e Previsione della Diffusione Epidemica (Modelli SIR)"
- `med_q_8`: "Elaborazione Ultrarapida di Immagini da Risonanza Magnetica (RMN)"
- `med_q_9`: "Ottimizzazione delle Catene di Distribuzione dei Vaccini a Breve Scadenza"
- `med_q_10`: "Identificazione di Biomarcatori Rari per Malattie Neurodegenerative"
- `med_q_11`: "Ottimizzazione dei Piani di Trattamento del Diabete tramite Microinfusori"
- `med_q_12`: "Modellazione delle Interazioni tra Microbioma Intestinale e Sistema Immunitario"
- `med_q_13`: "Progettazione di Scaffold Biocompatibili per la Stampa 3D di Organi"
- `med_q_14`: "Selezione dei Donatori per il Trapianto di Midollo Osseo (HLA)"
- `med_q_15`: "Ottimizzazione dei Parametri di Ventilazione Meccanica in Terapia Intensiva"
- `med_q_16`: "Ricerca di Nuovi Antibiotici contro i Superbatteri Resistenti (MRSA)"
- `med_q_17`: "Ottimizzazione dei Flussi di Pronto Soccorso tramite Triage Intelligente"
- `med_q_18`: "Analisi dei Dati di Espressione Genica su Singola Cellula (scRNA-seq)"
- `med_c_1`: "Diagnostica e Classificazione di Tumori da Immagini Radiografiche (CNN)"
- `med_c_2`: "Analisi Predittiva della Cartella Clinica Elettronica per Rischio Riammissioni"
- `med_c_3`: "Estrazione Informazioni Cliniche da Report Medici non Strutturati (NLP/LLM)"
- `med_c_4`: "Modellazione e Simulazione dell'Evoluzione Epidemica Territoriale"

---

### 1.3 Fasi dell'Intervista Guidata e Opzioni Selezionabili
`[File: /src/components/TestPage.tsx, righe 420 e 1645-2042]`
- **Fase `0_cat` (Selezione Categoria):**
  - Titolo UI: `"Clicca la tua Categoria Aziendale (Inizializzazione Qubit):"`
  - Opzioni: I 7 bottoni delle categorie aziendali.
- **Fase `1_scen` (Selezione Scenario):**
  - Titolo UI: `"Scegli lo Scenario per [Nome Settore] (Definizione Spazio degli Stati):"`
  - Opzioni: Bottoni per ciascun scenario filtrabili via barra di ricerca.
- **Fase `2_csv` (Caricamento Dati):**
  - Titolo UI: `"Caricamento Dati Locali (State Encoding & Mapping):"`
  - Opzioni:
    - `"Carica i Tuoi File (CSV / Excel)"`
    - `"Dataset Demo (Scarica e Testa)"`
    - Modelli guida: `"1_anagrafica.csv"` e `"2_matrice.csv"`.
- **Fase `3a_per` (Finestra Temporale):**
  - Titolo UI: `"Scegli la Finestra Temporale o Date Precise (Evoluzione Hamiltoniana):"`
  - Opzioni rapide:
    1. `"1 Mese (30 gg)"` — Breve termine / Urgenze
    2. `"1 Trimestre (3 Mesi)"` — Stagione operativa (Q1-Q4)
    3. `"1 Semestre (6 Mesi)"` — Medio termine aziendale
    4. `"1 Anno Intero (12 Mesi)"` — Pianificazione annuale
    5. Input Date Precise da Calendario: `startDateInput` (Dal) e `endDateInput` (Al).
    6. Campo testo libero custom.
- **Fase `3b_strat` (Strategia Operativa):**
  - Titolo UI: `"Imposta la Strategia Operativa (Hamiltoniana di Costo):"`
  - Opzioni contestualizzate da `getTaxonomicSector`:
    - Strategia Aggressiva: `stratAggTitle` (es. "Massima Spinta / Massimizzazione Rendimento")
    - Strategia Prudente: `stratPrudTitle` (es. "Prudente / Mitigazione Rischio / Copertura")
- **Fase `4a_infra` & `4b_vinc`:**
  - **AUTOMATIZZATE AL 100% IN BACKGROUND** (come imposto dalla Regola 8 del prompt: nessun clic richiesto all'utente; l'Agent passa direttamente da 3B a 5).
- **Fase `5_done` (Completamento & Pop-up Risultati):**
  - Output generati:
    1. **Spiegazione Umana Esecutiva** (traduzione semantica delle frequenze quantistiche e dell'ottimizzazione classica)
    2. **Script Python Qiskit** (QPU con Primitives V2 AerSampler)
    3. **Circuito OpenQASM 3.0** (standard hardware)
    4. **Script Python Classico HPC** (NumPy / SciPy SLSQP Markowitz)
    5. **Manifesto JSON Universale**
    6. **Sfera di Bloch 3D interattiva** (canvas vettoriale)
    7. **Layout Circuitale IBM Composer**

---

### 1.4 Mappatura File / Colonne / Formule
- **File 1 (`1_anagrafica_risorse.csv`):**
  - Fornisce $N$ righe in ordine FIFO.
  - Colonna indice 5 (`priorita_peso`): estratta e scalata a $p \in [0.0, 1.0]$.
  - Formula applicata: $\theta = 2.0 \cdot \arcsin(\sqrt{p})$.
- **File 2 (`2_matrice_connessioni.csv`):**
  - Fornisce matrice $N \times N$.
  - Celle $\ge 0.60 \rightarrow$ generano `qc.cx(q[i], q[j])` (Blocco Rigido).
  - Celle $0.0 < \text{valore} < 0.60 \rightarrow$ generano `qc.cp(pi * valore, q[i], q[j])` (Legame Morbido Continuo).
  - Celle $0.00 \rightarrow$ nessun gate (Risorse Indipendenti).

---

### 1.5 Differenze dichiarate tra Scenario Quantistico e Classico (HPC)
`[File: /src/components/TestPage.tsx, righe 1816-1823]`
- **Scenario Quantistico:**
  - Freno hardware di emergenza: **Massimo 127 righe / qubit** (limite chip fisici IBM Quantum Utility-scale Heron/Eagle).
  - Risoluzione combinatoria nello spazio di Hilbert $2^N$ tramite rotazioni RY ed entanglement CX/CP.
- **Scenario Classico (HPC):**
  - **Nessun limite hardware sui qubit**: elaborazione scalabile per file con migliaia di righe.
  - Risoluzione tramite algebra lineare numerica (NumPy) e programmazione non lineare quadratica sequenziale (SciPy SLSQP su matrice di rischio sistemico).

---

## SEZIONE 2 — FILE E FORMATI

### 2.1 Elenco COMPLETO dei file previsti
1. **File 1 (Anagrafica Risorse):**
   - Nome atteso dal codice: `"1_anagrafica_risorse.csv"` `[File: /src/data/codeGenerators.ts, riga 590]`
   - Formati accettati dal caricatore: `.csv`, `.xlsx`, `.xls`, `.tsv`, `.txt` `[File: /src/components/TestPage.tsx, riga 1793]`
2. **File 2 (Matrice delle Connessioni):**
   - Nome atteso dal codice: `"2_matrice_connessioni.csv"` `[File: /src/data/codeGenerators.ts, riga 612]`
   - Formati accettati dal caricatore: `.csv`, `.xlsx`, `.xls`, `.tsv`, `.txt`

---

### 2.2 Schema delle colonne attese

#### File 1 — Anagrafica Risorse:
- **Intestazione esatta:** `id_risorsa,nome_visualizzato,categoria,costo_unitario,quantita_disponibile,priorita_peso`
- **Separatore colonna:** Virgola `,` (supportato anche punto e virgola `;` tramite autodetection).
- **Separatore decimale:** Punto `.` (supportata la virgola `,` europea tramite `cleanNumericValue`).
- **Encoding:** UTF-8.
- **Righe di commento:** Tutte le righe che iniziano con `#` vengono ignorate dal parser.
- **Tipi e Range:**
  - `id_risorsa`: stringa alfanumerica minuscola con underscore (es. `asset_01`).
  - `nome_visualizzato`: stringa descrittiva.
  - `categoria`: stringa testuale.
  - `costo_unitario`: numero / float.
  - `quantita_disponibile`: intero o float.
  - `priorita_peso`: float compreso tra `0.00` e `1.00` (o percentuale `0% - 100%`).

#### File 2 — Matrice delle Connessioni:
- **Intestazione esatta:** `id_risorsa,<id_0>,<id_1>,<id_2>,...` (gli stessi ID del File 1).
- **Separatore colonna:** Virgola `,` (o `;`).
- **Valori:**
  - Diagonale principale: `1.00`.
  - Celle di relazione: float compreso tra `0.00` e `1.00`.

---

### 2.3 Dataset Demo: Contenuto esatto
`[File: /src/data/demoCsv.ts, righe 42-250]`

#### Esempio: "Finanza e Mercati" (Generale)
*File 1:*
```csv
id_risorsa,nome_visualizzato,categoria,costo_unitario,quantita_disponibile,priorita_peso
asset_01,Asset Azionario Alpha Core,titoli_equity,120.50,1500,0.85
asset_02,Asset Obbligazionario Governativo,reddito_fisso,98.20,2400,0.70
tranche_aaa,Tranche Obbligazionaria Senior AAA (Tutela Capitale),senior_debt,450.00,800,0.88
fondo_liquidita,Fondo di Riserva Liquidità Interbancaria,riserva_capitale,1000.00,100,0.90
```
*File 2:*
```csv
id_risorsa,asset_01,asset_02,tranche_aaa,fondo_liquidita
asset_01,1.00,0.40,0.60,0.00
asset_02,0.40,1.00,0.00,0.50
tranche_aaa,0.60,0.00,1.00,0.70
fondo_liquidita,0.00,0.50,0.70,1.00
```

---

### 2.4 Regole di validazione file
`[File: /src/data/codeGenerators.ts, righe 66-153 e 589-675]`
1. **File mancante all'esecuzione dello script Python generato:** scatta il blocco `except Exception:` che istanzia il dataset di fallback in-memory (`dati_in_memory_risorse` e `matrice_in_memory`).
2. **Commenti `#`:** ignorati sia dal parser TypeScript (`!l.startsWith('#')`) che da Pandas.
3. **Separatore `;` invece di `,`:** rilevato analizzando la prima riga (`sep = ';' if ';' in first_line else ','`).
4. **Righe con decimali italiani (`0,85`):** normalizzate dalla regex `cleanNumericValue` che converte la virgola in punto decimale.
5. **ID non allineati tra File 1 e File 2:**
   - Il codice cerca l'intersezione comune degli ID (`common_ids = [aid for aid in ids if aid in df2.index and aid in df2.columns]`).
   - Se fallisce, esegue il fallback posizionale numerico su `min_dim`.

---

### 2.5 Freno Hardware a 127 Qubit
`[File: /src/data/codeGenerators.ts, righe 203-218]`
- **Costante definita:** `export const MAX_QUANTUM_QUBITS = 127;`
- **Meccanismo di troncamento:**
  `const numQubits = Math.min(totalInputRows, MAX_QUANTUM_QUBITS);`
- **Comportamento oltre soglia:**
  - Nel circuito quantistico viene inserito il commento di warning:
    `// [WARNING HARDWARE BOUND] Rilevate ${totalInputRows} risorse. Circuito limitato a 127 qubit fisici (IBM Utility-scale).`
  - Solo i primi 127 elementi ricevono la rotazione `ry` e la misurazione.
  - Nel codice classico HPC non viene applicato alcun troncamento (elabora tutte le righe).

---

## SEZIONE 3 — LOGICA DI CALCOLO

### 3.1 Formule esatte applicate
`[File: /src/data/codeGenerators.ts, righe 226-249]`
1. **Rotazione RY (Preparazione di Stato):**
   $$\theta = 2.0 \cdot \arcsin(\sqrt{p}), \quad p = \max(0.0, \min(1.0, \text{peso}))$$
2. **Porta CX (Blocco Rigido):**
   Applicata se e solo se $\text{peso}_{ij} \ge 0.60$ con $i < j$.
3. **Porta CP (Legame Morbido Continuo):**
   Applicata se $0.0 < \text{peso}_{ij} < 0.60$ con fase $\phi = \pi \cdot \text{peso}_{ij}$.
4. **Misurazione:**
   `qc.measure(q[i], c[i])` sequenziale per ogni qubit $i \in [0, N-1]$.

---

### 3.2 Confronto tra Dichiarato ed Effettivamente Calcolato
1. **Nel Ramo Quantistico:**
   - *Dichiarato:* "Campionamento dello stato a minima energia tramite AerSampler V2".
   - *Effettivo:* Viene costruito il circuito parametrico con rotazioni `ry` e vincoli `cx`/`cp`. L'esecuzione reale su QPU fisica non avviene nel browser dell'utente, ma viene generato lo script eseguibile per Qiskit 1.x con `AerSimulator` e primitives V2 `AerSampler`.
2. **Nel Ramo Classico HPC:**
   - *Dichiarato:* "Ottimizzazione Markowitz / Sharpe Ratio di Rete con SciPy SLSQP".
   - *Effettivo:* Lo script genera ed esegue realmente la funzione obiettivo:
     $$\text{massimizzare } SR = \frac{w^T \mu - r_f}{\sqrt{w^T C w}}$$
     con vincoli $\sum w_i = 1$, $0 \le w_i \le 1$, $r_f = 0.02$, e matrice $C$ regolarizzata con autovalori $\max(\lambda, 10^{-5})$.

---

### 3.3 Uso effettivo delle colonne del File 1
- **`priorita_peso` (Colonna 5):** **USATA AL 100%** per l'angolo quantistico $\theta$ e il vettore di rendimenti classici $\mu$.
- **`id_risorsa` (Colonna 0):** **USATA** per l'ordinamento FIFO e il matching con la matrice.
- **`nome_visualizzato` (Colonna 1):** **USATA** per l'output descrittivo.
- **`categoria` (Colonna 2):** **IGNORATA** nei calcoli matematici.
- **`costo_unitario` (Colonna 3):** **IGNORATA** nei calcoli matematici attuali.
- **`quantita_disponibile` (Colonna 4):** **IGNORATA** nei calcoli matematici attuali.

---

### 3.4 Gestione Errori e Fallback
- I generatori Python includono blocchi `try ... except Exception` sia per la lettura di `1_anagrafica_risorse.csv` sia per `2_matrice_connessioni.csv`.
- Se i file non esistono nella cartella di esecuzione, lo script non va in crash ma ricorre all'oggetto letterale incorporato `dati_in_memory_risorse` e `matrice_in_memory`.

---

### 3.5 Coerenza QASM ↔ Python ↔ JSON
- **Pienamente Coerenti:** `generateQiskitCode` (QASM) e `generateQiskitPythonCode` (Python) condividono le medesime funzioni di parsing `parseCsv1Deterministic` e `parseCsv2Deterministic`. Entrambi estraggono gli stessi angoli $\theta$ con 6 cifre decimali e le stesse porte CX/CP.

---

## SEZIONE 4 — TOOL, KNOWLEDGE, CAPABILITIES

### 4.1 Elenco Tool abilitati nel Workspace
- `view_file`, `write_to_file`, `replace_file_content`, `multi_replace_file_content`, `delete_file`, `list_dir`, `compile_applet`, `lint_applet`, `run_command`, `restart_dev_server`, ecc.
- Nella runtime dell'app React finale per l'utente finale: nessun tool agentic è esposto all'utente (opera come Web Application autonoma).

### 4.2 Knowledge base / Documenti allegati
1. `/src/promptText.txt`: Direttiva architetturale master a tre teste.
2. `/public/GUIDA_COMPLETA_AGENT_AI_108_SCENARI.md`: Manuale tecnico scaricabile dall'interfaccia.

### 4.3 Capacità di eseguire Python
- **Esecuzione diretta in-browser:** `NO`. Il browser genera gli script Python completi scaricabili.
- **Esecuzione lato client:** L'utente può copiare o scaricare lo script ed eseguirlo in locale (`python script.py`) disponendo dell'ambiente Qiskit / SciPy.

### 4.4 Lettura file caricati dall'utente
- **Metodo:** `FileReader` HTML5 nativo lato client + parser SheetJS (`xlsx`) per file binari Excel `[File: /src/components/TestPage.tsx, righe 553-611]`.
- I dati risiedono nella memoria di stato React del client (`customCsv1Content`, `customCsv2Content`).

---

## SEZIONE 5 — UI / FLUSSO UTENTE

### 5.1 Flusso passo-passo
```
[FASE 0: Categoria Aziendale] 
            │
            ▼
[FASE 1: Scenario Settoriale]
            │
            ▼
[FASE 2: Caricamento File CSV / Excel o Dataset Demo]
            │
            ▼
[FASE 3A: Finestra Temporale / Calendario]
            │
            ▼
[FASE 3B: Strategia Operativa (Aggressiva vs Prudente)]
            │
            ▼ (Automatizzazione Entanglement & Calcolo)
[FASE 5: Risultato Esecutivo & Pop-up Risultati]
```

### 5.2 Testi esatti di bottoni e opzioni
- Header:
  - `"Back (Torna alla Home Page)"`
  - `"Copia Intervista"` / `"Intervista Copiata!"`
  - `"Guida 108 Scenari (.md)"`
  - `"Pop-up Risultati"`
  - `"Nuova Intervista"`
- Fase 2:
  - `"Carica i Tuoi File (CSV / Excel)"`
  - `"Dataset Demo (Scarica e Testa)"`
  - `"1_anagrafica.csv"`
  - `"2_matrice.csv"`
- Fase 3A:
  - `"Conferma Date: dal [Data] al [Data]"`
  - `"1 Mese (30 gg)"`
  - `"1 Trimestre (3 Mesi)"`
  - `"1 Semestre (6 Mesi)"`
  - `"1 Anno Intero (12 Mesi)"`
  - `"Imposta"` (testo libero)
- Fase 3B:
  - Strategia 1: Titolo dinamico da tassonomia (es. *"Massima Spinta / Massimizzazione Rendimento"*)
  - Strategia 2: Titolo dinamico da tassonomia (es. *"Prudente / Mitigazione Rischio / Copertura"*)

### 5.3 Cosa vede l'utente in caso di errore file / fallback / qubit > 127
- **In caso di file non validi:** Notifica a schermo nel log chat: `⚠️ Errore nel caricamento dei file` con indicazione della causa.
- **In caso di fallback AI:** L'interfaccia passa alla simulazione euristica deterministica senza interrompere l'intervista.
- **In caso di qubit > 127:** Card informativa che notifica che il circuito QPU è limitato a 127 qubit fisici, suggerendo il passaggio al calcolo Classico HPC.

---

## SEZIONE 6 — INCOERENZE E RISCHI RILEVABILI

### 6.1 Colonne del CSV dichiarate ma non computate
- **Criticità:** Minore.
- **Descrizione:** Nel File 1, le colonne `costo_unitario` e `quantita_disponibile` sono presenti nella specifica formale, ma la funzione di ottimizzazione matematica usa esclusivamente `priorita_peso`.
- **File coinvolti:** `src/data/codeGenerators.ts`.

### 6.2 Disallineamento semantico dei Dataset Demo non specializzati (Lista Nera)
- **Criticità:** Grave (Semantica).
- **Descrizione:** Poiché esistono 11 preset demo per 108 scenari, scenari verticali specifici (es. `med_q_5` Turni Sale Operatorie) ereditano il dataset demo generico della Sanità che include `catena_proteica` e `marcatore_dna`.
- **File coinvolti:** `src/data/demoCsv.ts`.

### 6.3 Esecuzione Qiskit simulata lato script vs esecuzione cloud
- **Criticità:** Minore (Documentale).
- **Descrizione:** Il pop-up dei risultati mostra un'anteprima visuale e fornisce il link structured verso IBM Quantum Composer, ma non effettua la chiamata REST diretta verso l'API Token IBM Quantum (lo script deve essere incollato o eseguito esternamente).
- **File coinvolti:** `src/components/EndInterviewModal.tsx`.

---

## TABELLA RIEPILOGATIVA DEI 108 SCENARI

| Categoria | N° Scenari (QPU / HPC) | File Richiesti | Formula Chiave | Output Prodotto | Criticità Note |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Finanza e Mercati** | 19 QPU / 7 HPC | `1_anagrafica_risorse.csv`<br>`2_matrice_connessioni.csv` | $\theta = 2\arcsin(\sqrt{p})$<br>SLSQP Markowitz: $\max \frac{w^T\mu - r_f}{\sqrt{w^T C w}}$ | OpenQASM 3.0, Qiskit Python, HPC Python, JSON, Bloch 3D | Dataset demo standard ha titoli equity anche per HFT e AML |
| **Logistica e Supply Chain** | 14 QPU / 4 HPC | `1_anagrafica_risorse.csv`<br>`2_matrice_connessioni.csv` | $\theta = 2\arcsin(\sqrt{p})$<br>Entanglement CX $\ge 0.60$ | OpenQASM 3.0, Qiskit Python, HPC Python, JSON, Bloch 3D | Dataset demo droni eredita container navali |
| **Energia e Utilities** | 7 QPU / 5 HPC | `1_anagrafica_risorse.csv`<br>`2_matrice_connessioni.csv` | $\theta = 2\arcsin(\sqrt{p})$<br>Coupling matrix $w^T C w$ | OpenQASM 3.0, Qiskit Python, HPC Python, JSON, Bloch 3D | Dataset idroelettrico eredita turbine a gas |
| **Chimica e Materiali** | 8 QPU / 7 HPC | `1_anagrafica_risorse.csv`<br>`2_matrice_connessioni.csv` | $\theta = 2\arcsin(\sqrt{p})$<br>Ansatz variazionale VQE | OpenQASM 3.0, Qiskit Python, HPC Python, JSON, Bloch 3D | Superconduttori ereditano reattore idrogeno |
| **Produzione e Manifattura** | 5 QPU / 4 HPC | `1_anagrafica_risorse.csv`<br>`2_matrice_connessioni.csv` | $\theta = 2\arcsin(\sqrt{p})$<br>Vincoli makespan | OpenQASM 3.0, Qiskit Python, HPC Python, JSON, Bloch 3D | Cutting stock eredita bracci robotici di saldatura |
| **Sicurezza e Telecomunicazioni** | 5 QPU / 6 HPC | `1_anagrafica_risorse.csv`<br>`2_matrice_connessioni.csv` | $\theta = 2\arcsin(\sqrt{p})$<br>Correlazione traffico | OpenQASM 3.0, Qiskit Python, HPC Python, JSON, Bloch 3D | Protocollo QKD eredita firewall software standard |
| **Sanità e Genomica** | 18 QPU / 4 HPC | `1_anagrafica_risorse.csv`<br>`2_matrice_connessioni.csv` | $\theta = 2\arcsin(\sqrt{p})$<br>Frequenze campionamento | OpenQASM 3.0, Qiskit Python, HPC Python, JSON, Bloch 3D | Turni ospedalieri ereditano molecole di folding proteico |
