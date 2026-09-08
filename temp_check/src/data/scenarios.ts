export interface QuantumScenario {
  id: string;
  macroarea: string;
  technology: string;
  name: string;
  logicType: string;
  targetVariables: string;
  focus?: 'Entanglement' | 'Ampiezza' | 'Angolo';
}

export const QUANTUM_SCENARIOS: QuantumScenario[] = [
  // =========================================================================
  // SEZIONE 1: SCENARI PER COMPUTER QUANTISTICO (IBM QISKIT) - [71 SCENARI]
  // =========================================================================

  // 1.1 📊 Finanza e Mercati (19 Scenari)
  {
    id: "fin-q-1",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "1. Hedging Quantistico Multilivello Cross-Asset (Ottimizzazione Combinatoria)",
    logicType: "Ottimizzazione Combinatoria",
    targetVariables: "Volatilità_Implicita, Correlazione_Dinamica, Tassi_Cambio_Spot",
    focus: "Entanglement"
  },
  {
    id: "fin-q-2",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "2. Ottimizzazione Portafoglio con Vincoli di Cardinalità (QUBO)",
    logicType: "Ottimizzazione Combinatoria (QUBO)",
    targetVariables: "Matrice_Covarianza, Rendimento_Atteso, Budget_Massimo",
    focus: "Entanglement"
  },
  {
    id: "fin-q-3",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "3. Allocazione Capitali per Requisiti Solvibilità (Basel IV)",
    logicType: "Stima d'Ampiezza",
    targetVariables: "Attività_Ponderate_Rischio, Capitale_Tier_1, Esposizione_Lorda",
    focus: "Ampiezza"
  },
  {
    id: "fin-q-4",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "4. Arbitraggio di Volatilità su Opzioni Index-Linked",
    logicType: "Rotazione di Fase",
    targetVariables: "Smile_Volatilità, Delta, Gamma, Vega, Volumi_Scambio",
    focus: "Angolo"
  },
  {
    id: "fin-q-5",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "5. Ottimizzazione Portafoglio Socialmente Responsabile (ESG)",
    logicType: "Ottimizzazione Combinatoria",
    targetVariables: "Punteggio_ESG, Screening_Negativo, Tracking_Error",
    focus: "Entanglement"
  },
  {
    id: "fin-q-6",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "6. Market Timing Esatto per Liquidazione Asset",
    logicType: "Rotazione di Fase",
    targetVariables: "Impatto_Prezzo, Profondità_Book, Costo_Transazione",
    focus: "Angolo"
  },
  {
    id: "fin-q-7",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "7. Selezione Paniere Sintetico per Tracking ETF",
    logicType: "Ottimizzazione Combinatoria",
    targetVariables: "Beta_Atteso, Tracking_Difference, Liquidità_Media",
    focus: "Entanglement"
  },
  {
    id: "fin-q-8",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "8. Hedging Rischio Valutario su Contratti Fornitori",
    logicType: "Stima d'Ampiezza",
    targetVariables: "Tasso_Forward, Esposizione_Netta, Costo_Premio",
    focus: "Ampiezza"
  },
  {
    id: "fin-q-9",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "9. Ribilanciamento Dinamico Fondo a Rischio Target",
    logicType: "Ottimizzazione Combinatoria",
    targetVariables: "Volatilità_Realizzata, Turnover_Portafoglio, Limite_Drawdown",
    focus: "Entanglement"
  },
  {
    id: "fin-q-10",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "10. Arbitraggio Triangolare su Coppie di Valute FX",
    logicType: "Rotazione di Fase",
    targetVariables: "Bid_Ask_Spread, Latenza_Esecuzione, Saldo_Conto",
    focus: "Angolo"
  },
  {
    id: "fin-q-11",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "11. Valutazione del Rischio Sistemico Interbancario",
    logicType: "Entanglement di Rete",
    targetVariables: "Esposizione_Interbancaria, Grado_Connettività, Indice_Contagio",
    focus: "Entanglement"
  },
  {
    id: "fin-q-12",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "12. Stress Testing Macroeconomico Monte Carlo Accelerato (QAE)",
    logicType: "Quantum Amplitude Estimation (QAE)",
    targetVariables: "Scenario_Crisi, Shock_Tassi, Probabilità_Rovina",
    focus: "Ampiezza"
  },
  {
    id: "fin-q-13",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "13. Pricing di Derivati Esotici Multi-Sottostante (QAE)",
    logicType: "Quantum Amplitude Estimation (QAE)",
    targetVariables: "Prezzo_Sottostante_1, Prezzo_Sottostante_2, Strike_Price, Correlazione",
    focus: "Ampiezza"
  },
  {
    id: "fin-q-14",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "14. Stima del Value at Risk (VaR) e Conditional VaR (QAE)",
    logicType: "Quantum Amplitude Estimation (QAE)",
    targetVariables: "Livello_Confidenza, Perdita_Massima, Rendimenti_Storici",
    focus: "Ampiezza"
  },
  {
    id: "fin-q-15",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "15. Rilevamento Anomalie e Riciclaggio (AML) (QML)",
    logicType: "Quantum Machine Learning (QML)",
    targetVariables: "Pattern_Transazione, Frequenza_Operazioni, Rete_Societaria",
    focus: "Entanglement"
  },
  {
    id: "fin-q-16",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "16. Valutazione Rischio di Controparte (CVA) (QAE)",
    logicType: "Quantum Amplitude Estimation (QAE)",
    targetVariables: "Credit_Default_Swap, Esposizione_Futura_Attesa, Tasso_Recupero",
    focus: "Ampiezza"
  },
  {
    id: "fin-q-17",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "17. Clustering Quantistico di Titoli Obbligazionari (QML)",
    logicType: "Quantum Machine Learning (QML)",
    targetVariables: "Rating_Emittente, Duration_Modificata, Spread_Creditizio",
    focus: "Entanglement"
  },
  {
    id: "fin-q-18",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "18. Scoring Creditizio Aziendale Non Lineare (QML)",
    logicType: "Quantum Support Vector Machine (QSVM)",
    targetVariables: "Rapporto_Indebitamento, Flusso_Cassa_Operativo, Redditività_Capitale",
    focus: "Angolo"
  },
  {
    id: "fin-q-19",
    macroarea: "Finanza e Mercati",
    technology: "Computer Quantistico (QPU)",
    name: "19. Calcolo Probabilità di Default su Mutui Subprime (QAE)",
    logicType: "Quantum Amplitude Estimation (QAE)",
    targetVariables: "Punteggio_FICO, Loan_To_Value, Tasso_Disoccupazione_Locale",
    focus: "Ampiezza"
  },

  // 1.2 🚚 Logistica e Supply Chain (9 Scenari)
  {
    id: "log-q-1",
    macroarea: "Logistica e Supply Chain",
    technology: "Computer Quantistico (QPU)",
    name: "1. Vehicle Routing Problem con Finestre Temporali (VRPTW)",
    logicType: "Ottimizzazione Combinatoria",
    targetVariables: "Coordinate_Nodi, Finestra_Temporale, Capacità_Veicolo",
    focus: "Entanglement"
  },
  {
    id: "log-q-2",
    macroarea: "Logistica e Supply Chain",
    technology: "Computer Quantistico (QPU)",
    name: "2. Ottimizzazione del Carico Container 3D (Bin Packing)",
    logicType: "Rotazione e Spazio 3D",
    targetVariables: "Dimensioni_Pacco, Peso_Massimo, Centro_Gravità",
    focus: "Angolo"
  },
  {
    id: "log-q-3",
    macroarea: "Logistica e Supply Chain",
    technology: "Computer Quantistico (QPU)",
    name: "3. Schedulazione Turni Equipaggi Portuali/Aeroportuali",
    logicType: "Ottimizzazione Vincolata",
    targetVariables: "Ore_Riposo_Obbligatorie, Qualifiche_Personale, Slot_Volo",
    focus: "Entanglement"
  },
  {
    id: "log-q-4",
    macroarea: "Logistica e Supply Chain",
    technology: "Computer Quantistico (QPU)",
    name: "4. Pianificazione Flotta Droni per Consegne Ultimo Miglio",
    logicType: "Ottimizzazione Dinamica",
    targetVariables: "Autonomia_Batteria, Peso_Pacco, Zone_No_Fly",
    focus: "Entanglement"
  },
  {
    id: "log-q-5",
    macroarea: "Logistica e Supply Chain",
    technology: "Computer Quantistico (QPU)",
    name: "5. Instradamento Multi-Modale (Nave, Treno, Camion)",
    logicType: "Ottimizzazione di Rete",
    targetVariables: "Costo_Trasporto, Emissioni_CO2, Tempo_Transito",
    focus: "Entanglement"
  },
  {
    id: "log-q-6",
    macroarea: "Logistica e Supply Chain",
    technology: "Computer Quantistico (QPU)",
    name: "6. Allocazione Gate Aeroportuali per Voli Internazionali",
    logicType: "Ottimizzazione Combinatoria",
    targetVariables: "Orario_Arrivo, Tipo_Aeromobile, Flusso_Passeggeri",
    focus: "Entanglement"
  },
  {
    id: "log-q-7",
    macroarea: "Logistica e Supply Chain",
    technology: "Computer Quantistico (QPU)",
    name: "7. Ottimizzazione delle Scorte di Sicurezza Multi-Echelon",
    logicType: "Stima d'Ampiezza",
    targetVariables: "Livello_Servizio_Target, Variabilità_Domanda, Lead_Time",
    focus: "Ampiezza"
  },
  {
    id: "log-q-8",
    macroarea: "Logistica e Supply Chain",
    technology: "Computer Quantistico (QPU)",
    name: "8. Valutazione Rischio di Interruzione della Catena di Fornitura",
    logicType: "Entanglement di Rete",
    targetVariables: "Affidabilità_Fornitore, Rischio_Geopolitico, Scorte_Buffer",
    focus: "Entanglement"
  },
  {
    id: "log-q-9",
    macroarea: "Logistica e Supply Chain",
    technology: "Computer Quantistico (QPU)",
    name: "9. Analisi Vulnerabilità della Rete di Distribuzione (Graph Theory)",
    logicType: "Teoria dei Grafi Quantistica",
    targetVariables: "Centralità_Nodo, Ridondanza_Archi, Flusso_Critico",
    focus: "Entanglement"
  },

  // 1.3 ⚡ Energia e Utilities (7 Scenari)
  {
    id: "ene-q-1",
    macroarea: "Energia e Utilities",
    technology: "Computer Quantistico (QPU)",
    name: "1. Unit Commitment e Dispacciamento Ottimale Rete Elettrica (OPF)",
    logicType: "Ottimizzazione Vincolata",
    targetVariables: "Carico_Rete, Costo_Avviamento_Centrale, Limite_Emissione",
    focus: "Entanglement"
  },
  {
    id: "ene-q-2",
    macroarea: "Energia e Utilities",
    technology: "Computer Quantistico (QPU)",
    name: "2. Pianificazione Posizionamento Turbine Eoliche Offshore",
    logicType: "Geometria di Flusso",
    targetVariables: "Direzione_Vento_Prevalente, Effetto_Scia, Profondità_Fondali",
    focus: "Angolo"
  },
  {
    id: "ene-q-3",
    macroarea: "Energia e Utilities",
    technology: "Computer Quantistico (QPU)",
    name: "3. Schedulazione Ricarica Intelligente Flotte Veicoli Elettrici (V2G)",
    logicType: "Ottimizzazione Dinamica",
    targetVariables: "Tariffa_Oraria_Energia, Stato_Carica_Batteria, Orario_Partenza",
    focus: "Entanglement"
  },
  {
    id: "ene-q-4",
    macroarea: "Energia e Utilities",
    technology: "Computer Quantistico (QPU)",
    name: "4. Ottimizzazione Idraulica Pompe-Turbine per Bacini Idroelettrici",
    logicType: "Ottimizzazione Idrodinamica",
    targetVariables: "Livello_Invaso, Portata_Turbinata, Prezzo_Energia_Orario",
    focus: "Angolo"
  },
  {
    id: "ene-q-5",
    macroarea: "Energia e Utilities",
    technology: "Computer Quantistico (QPU)",
    name: "5. Configurazione Topologica Microgrid in Caso di Blackout",
    logicType: "Riconfigurazione di Rete",
    targetVariables: "Stato_Interruttori, Priorità_Carichi, Risorse_Generazione_Locale",
    focus: "Entanglement"
  },
  {
    id: "ene-q-6",
    macroarea: "Energia e Utilities",
    technology: "Computer Quantistico (QPU)",
    name: "6. Analisi Stabilità Transitoria della Rete con Energia Rinnovabile",
    logicType: "Analisi di Fase",
    targetVariables: "Inerzia_Sintetica, Variazione_Frequenza, Angolo_Rotore",
    focus: "Angolo"
  },
  {
    id: "ene-q-7",
    macroarea: "Energia e Utilities",
    technology: "Computer Quantistico (QPU)",
    name: "7. Simulazione Quantistica Invecchiamento Celle Batteria al Litio",
    logicType: "Simulazione Quantistica Molecolare",
    targetVariables: "Degrado_SEI, Resistenza_Interna, Cicli_Carica_Scarica",
    focus: "Entanglement"
  },

  // 1.4 🔬 Chimica, Farmaceutica e Materiali (8 Scenari)
  {
    id: "chem-q-1",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "Computer Quantistico (QPU)",
    name: "1. Calcolo Stato Fondamentale di Molecole Complesse (VQE)",
    logicType: "Variational Quantum Eigensolver (VQE)",
    targetVariables: "Hamiltoniana_Elettronica, Orbitali_Molecolari, Energia_Legame",
    focus: "Entanglement"
  },
  {
    id: "chem-q-2",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "Computer Quantistico (QPU)",
    name: "2. Simulazione Catalizzatori per Fissazione Azoto (Sintesi Ammoniaca)",
    logicType: "Simulazione Meccanica Quantistica",
    targetVariables: "Sito_Attivo_FeMoco, Barriera_Attivazione, Potenziale_Riduzione",
    focus: "Entanglement"
  },
  {
    id: "chem-q-3",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "Computer Quantistico (QPU)",
    name: "3. Screening Molecolare per Inibitori Enzimatici (Drug Discovery)",
    logicType: "Docking Molecolare Geometrico",
    targetVariables: "Forma_Tasca_Catalitica, Legami_Idrogeno, Costante_Affinità_Ki",
    focus: "Angolo"
  },
  {
    id: "chem-q-4",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "Computer Quantistico (QPU)",
    name: "4. Progettazione Polimeri ad Alta Conducibilità per Celle a Combustibile",
    logicType: "Simulazione Struttura a Bande",
    targetVariables: "Conducibilità_Protonica, Stabilità_Termica, Permeabilità_Gas",
    focus: "Entanglement"
  },
  {
    id: "chem-q-5",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "Computer Quantistico (QPU)",
    name: "5. Modellazione Materiali Superconduttori ad Alta Temperatura",
    logicType: "Modello di Hubbard",
    targetVariables: "Accoppiamento_Elettrone_Fonone, Temperatura_Critica_Tc, Gap_Superconduttivo",
    focus: "Entanglement"
  },
  {
    id: "chem-q-6",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "Computer Quantistico (QPU)",
    name: "6. Ottimizzazione del Folding di Catene Peptidiche (QUBO)",
    logicType: "QUBO Strutturale",
    targetVariables: "Angoli_Diedri_Phi_Psi, Energia_Lennard_Jones, Idrofobicità",
    focus: "Angolo"
  },
  {
    id: "chem-q-7",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "Computer Quantistico (QPU)",
    name: "7. Scoperta di Catalizzatori per la Cattura della CO2 (MOF Materials)",
    logicType: "Simulazione Nanostrutture",
    targetVariables: "Superficie_Specifica_BET, Calore_Adsorbimento, Selettività_CO2_N2",
    focus: "Entanglement"
  },
  {
    id: "chem-q-8",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "Computer Quantistico (QPU)",
    name: "8. Sviluppo di Elettrolizzatori ad Alta Efficienza per Idrogeno Verde",
    logicType: "Simulazione Elettrochimica",
    targetVariables: "Sovratensione_HER_OER, Durabilità_Catalizzatore, Densità_Corrente",
    focus: "Entanglement"
  },

  // 1.5 🏭 Produzione e Manifattura (5 Scenari)
  {
    id: "man-q-1",
    macroarea: "Produzione e Manifattura",
    technology: "Computer Quantistico (QPU)",
    name: "1. Job-Shop Scheduling Problem su Macchine CNC Multitasking",
    logicType: "Ottimizzazione Combinatoria",
    targetVariables: "Tempo_Lavorazione_Task, Vincoli_Precedenza, Setup_Utensili",
    focus: "Entanglement"
  },
  {
    id: "man-q-2",
    macroarea: "Produzione e Manifattura",
    technology: "Computer Quantistico (QPU)",
    name: "2. Ottimizzazione del Taglio Lamiere e Vetro (Cutting Stock Problem)",
    logicType: "Geometria di Taglio 2D/3D",
    targetVariables: "Dimensioni_Lastra, Sagome_Pezzi, Percentuale_Sfrido",
    focus: "Angolo"
  },
  {
    id: "man-q-3",
    macroarea: "Produzione e Manifattura",
    technology: "Computer Quantistico (QPU)",
    name: "3. Bilanciamento Linea di Assemblaggio con Vincoli Ergonomici",
    logicType: "Ottimizzazione Linee",
    targetVariables: "Tempo_Ciclo_Stazione, Carico_Posturale_Operatore, Sequenza_Pezzi",
    focus: "Entanglement"
  },
  {
    id: "man-q-4",
    macroarea: "Produzione e Manifattura",
    technology: "Computer Quantistico (QPU)",
    name: "4. Pianificazione Manutenzione Impianti Industriali ad Alta Complessità",
    logicType: "Ottimizzazione Schedulazione",
    targetVariables: "Tasso_Guasto_MTBF, Disponibilità_Ricambi, Finestra_Fermo_Impianto",
    focus: "Entanglement"
  },
  {
    id: "man-q-5",
    macroarea: "Produzione e Manifattura",
    technology: "Computer Quantistico (QPU)",
    name: "5. Configurazione Flessibile Isole Robotizzate di Saldatura",
    logicType: "Coordinamento Multi-Agente",
    targetVariables: "Traiettoria_Braccio_Robot, Prevenzione_Collisioni, Velocità_Avanzamento",
    focus: "Entanglement"
  },

  // 1.6 🛡️ Sicurezza, Telecomunicazioni e Reti (5 Scenari)
  {
    id: "sec-q-1",
    macroarea: "Sicurezza, Telecomunicazioni e Reti",
    technology: "Computer Quantistico (QPU)",
    name: "1. Distribuzione Chiavi Quantistiche (QKD) e Monitoraggio Intercettazioni",
    logicType: "Protocolli BB84/E91",
    targetVariables: "Quantum_Bit_Error_Rate_QBER, Visibilità_Fase, Tasso_Generazione_Chiavi",
    focus: "Angolo"
  },
  {
    id: "sec-q-2",
    macroarea: "Sicurezza, Telecomunicazioni e Reti",
    technology: "Computer Quantistico (QPU)",
    name: "2. Ottimizzazione Instradamento Traffico Rete 5G/6G Core",
    logicType: "Ottimizzazione Topologica",
    targetVariables: "Latenza_Pacchetto, Larghezza_Banda_Disponibile, Jitter",
    focus: "Entanglement"
  },
  {
    id: "sec-q-3",
    macroarea: "Sicurezza, Telecomunicazioni e Reti",
    technology: "Computer Quantistico (QPU)",
    name: "3. Pianificazione Frequenze e Celle per Stazioni Radio Base (Antenne)",
    logicType: "Colorazione Grafi & Angolazione",
    targetVariables: "Rapporto_Segnale_Interferenza_SINR, Copertura_Territoriale, Potenza_Trasmissione",
    focus: "Angolo"
  },
  {
    id: "sec-q-4",
    macroarea: "Sicurezza, Telecomunicazioni e Reti",
    technology: "Computer Quantistico (QPU)",
    name: "4. Rilevamento Attacchi DDoS Tramite Correlazione Quantistica del Traffico",
    logicType: "Quantum Correlation Sensing",
    targetVariables: "Entropia_Flusso_IP, Pattern_Richieste_SYN, Distribuzione_Pacchetti",
    focus: "Entanglement"
  },
  {
    id: "sec-q-5",
    macroarea: "Sicurezza, Telecomunicazioni e Reti",
    technology: "Computer Quantistico (QPU)",
    name: "5. Allocazione Risorse di Rete per Network Slicing",
    logicType: "Allocazione Risorse QUBO",
    targetVariables: "QoS_SLA_Garantito, Priorità_Fetta_Rete, Risorse_Calcolo_Edge",
    focus: "Entanglement"
  },

  // 1.7 🧬 Sanità e Genomica (18 Scenari)
  {
    id: "san-q-1",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "1. Screening Virtuale di Farmaci su Miliardi di Molecole (Grover Search)",
    logicType: "Grover Search & Amplitude Amplification",
    targetVariables: "Score_Farmacoforo, Tossicità_Prevista, Solubilità_LogP",
    focus: "Ampiezza"
  },
  {
    id: "san-q-2",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "2. Ottimizzazione dei Piani di Radioterapia Oncologica Lineare (IGRT)",
    logicType: "Ottimizzazione Angolare Fasci",
    targetVariables: "Dose_Tumore_GTV, Risparmio_Organi_Critici_OAR, Angoli_Gantry",
    focus: "Angolo"
  },
  {
    id: "san-q-3",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "3. Previsione delle Anomalie nel Ripiegamento Proteico (Protein Folding)",
    logicType: "Modellazione Conformativa 3D",
    targetVariables: "Struttura_Secondaria, Ponti_Disolfuro, Raggio_Girazione",
    focus: "Angolo"
  },
  {
    id: "san-q-4",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "4. Diagnostica Precoce del Cancro da Dati di Sequenziamento DNA (GWAS)",
    logicType: "Quantum Genetic Association",
    targetVariables: "Mutazioni_SNP, Espressione_Genica, Epigenetica_Metilazione",
    focus: "Entanglement"
  },
  {
    id: "san-q-5",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "5. Ottimizzazione dei Turni delle Sale Operatorie Ospedaliere",
    logicType: "Ottimizzazione Risorse Sanitarie",
    targetVariables: "Durata_Intervento_Prevista, Disponibilità_Chirurghi, Sterilizzazione",
    focus: "Entanglement"
  },
  {
    id: "san-q-6",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "6. Analisi Farmacogenomica per Terapie Personalizzate Cardiovascolari",
    logicType: "Quantum Correlation Matching",
    targetVariables: "Polimorfismo_CYP450, Dosaggio_Terapeutico, Rischio_Effetti_Avversi",
    focus: "Entanglement"
  },
  {
    id: "san-q-7",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "7. Monitoraggio e Previsione della Diffusione Epidemica (SIR Quantistici)",
    logicType: "Simulazione Dinamica Stocastica",
    targetVariables: "Tasso_Trasmissione_Beta, Tasso_Guarigione_Gamma, Indice_R0",
    focus: "Ampiezza"
  },
  {
    id: "san-q-8",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "8. Elaborazione Ultrarapida di Immagini da Risonanza Magnetica (RMN)",
    logicType: "Quantum Fourier Transform (QFT)",
    targetVariables: "Dati_K_Space, Tempo_Rilassamento_T1_T2, Risoluzione_Voxel",
    focus: "Angolo"
  },
  {
    id: "san-q-9",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "9. Ottimizzazione delle Catene di Distribuzione dei Vaccini a Breve Scadenza",
    logicType: "Logistica Criogenica QUBO",
    targetVariables: "Temperatura_Conservazione, Tempo_Decadimento_Dose, Domanda_Hub",
    focus: "Entanglement"
  },
  {
    id: "san-q-10",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "10. Identificazione di Biomarcatori Rari per Malattie Neurodegenerative",
    logicType: "Quantum Feature Selection",
    targetVariables: "Proteina_Tau, Beta_Amiloide, Dati_Neuroimaging_PET",
    focus: "Entanglement"
  },
  {
    id: "san-q-11",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "11. Ottimizzazione dei Piani di Trattamento del Diabete tramite Microinfusori",
    logicType: "Controllo Ottimo Quantistico",
    targetVariables: "Glicemia_Continua_CGM, Sensibilità_Insulinica, Apporto_Carboidrati",
    focus: "Ampiezza"
  },
  {
    id: "san-q-12",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "12. Modellazione delle Interazioni tra Microbioma Intestinale e Sistema Immunitario",
    logicType: "Reti Biologiche Quantistiche",
    targetVariables: "Abbondanza_Specie_Batteriche, Citochine_Infiammatorie, Permeabilità_Intestinale",
    focus: "Entanglement"
  },
  {
    id: "san-q-13",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "13. Progettazione di Scaffold Biocompatibili per la Stampa 3D di Organi",
    logicType: "Microstruttura e Geometria 3D",
    targetVariables: "Porosità_Materiale, Resistenza_Meccanica, Tasso_Proliferazione_Cellulare",
    focus: "Angolo"
  },
  {
    id: "san-q-14",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "14. Selezione Quantistica dei Donatori per il Trapianto di Midollo Osseo (HLA)",
    logicType: "Matching Genetico QUBO",
    targetVariables: "Compatibilità_HLA_A_B_C_DRB1, Età_Donatore, Rischio_GvHD",
    focus: "Entanglement"
  },
  {
    id: "san-q-15",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "15. Ottimizzazione dei Parametri di Ventilazione Meccanica in Terapia Intensiva",
    logicType: "Stima Continua Parametri",
    targetVariables: "Pressione_PEEP, Volume_Corrente_Vt, Frazione_FiO2",
    focus: "Ampiezza"
  },
  {
    id: "san-q-16",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "16. Ricerca di Nuovi Antibiotici contro i Superbatteri Resistenti (MRSA)",
    logicType: "Simulazione Target Batterico",
    targetVariables: "Inibizione_Sintesi_Pareti, Resistenza_Beta_Lattamasi, Permeabilità_Membrana",
    focus: "Entanglement"
  },
  {
    id: "san-q-17",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "17. Ottimizzazione dei Flussi di Pronto Soccorso tramite Triage Quantistico",
    logicType: "Prioritizzazione Dinamica QUBO",
    targetVariables: "Codice_Gravità, Parametri_Vitali, Disponibilità_Posti_Letto",
    focus: "Entanglement"
  },
  {
    id: "san-q-18",
    macroarea: "Sanità e Genomica",
    technology: "Computer Quantistico (QPU)",
    name: "18. Analisi dei Dati di Espressione Genica su Singola Cellula (scRNA-seq)",
    logicType: "Riduzione Dimensionale Quantistica (QPCA)",
    targetVariables: "Conteggio_Trascrizioni_UMI, Marcatori_Cellulari, Traiettoria_Differenziamento",
    focus: "Angolo"
  },

  // =========================================================================
  // SEZIONE 2: SCENARI PER COMPUTER CLASSICO (PYTHON / HPC) - [33 SCENARI]
  // =========================================================================

  // 2.1 📊 Finanza e Mercati (7 Scenari)
  {
    id: "fin-c-1",
    macroarea: "Finanza e Mercati",
    technology: "IA Classica / HPC",
    name: "1. Algoritmo di Trading ad Alta Frequenza (HFT) e Order Book Matching (HPC)",
    logicType: "Calcolo Parallelo & Matching Engine",
    targetVariables: "Profondità_Book_L3, Latenza_Microsecondi, Spread_Bid_Ask"
  },
  {
    id: "fin-c-2",
    macroarea: "Finanza e Mercati",
    technology: "IA Classica / HPC",
    name: "2. Analisi del Sentiment Finanziario da Notizie e Social (LLM) (NLP)",
    logicType: "Large Language Models (LLM) & NLP",
    targetVariables: "Polarità_Testo, Frequenza_Ticker, Entità_Finanziarie"
  },
  {
    id: "fin-c-3",
    macroarea: "Finanza e Mercati",
    technology: "IA Classica / HPC",
    name: "3. Backtesting Storico Parallelo su Dati Tick-by-Tick (HPC)",
    logicType: "Simulazione Distribuita HPC",
    targetVariables: "Serie_Prezzi_Tick, Slippage, Sharpe_Ratio, Max_Drawdown"
  },
  {
    id: "fin-c-4",
    macroarea: "Finanza e Mercati",
    technology: "IA Classica / HPC",
    name: "4. Previsione Serie Storiche Prezzi con Reti Neurali LSTM/Transformer (Deep Learning)",
    logicType: "Deep Learning & Sequenze Temporali",
    targetVariables: "Prezzo_Chiusura, Media_Mobile_200, Volatilità_Storica, RSI"
  },
  {
    id: "fin-c-5",
    macroarea: "Finanza e Mercati",
    technology: "IA Classica / HPC",
    name: "5. Riconoscimento Pattern Tecnici su Grafici Candlestick (CNN)",
    logicType: "Computer Vision & Reti Convoluzionali",
    targetVariables: "Immagine_Candlestick, Livelli_Supporto_Resistenza, Pattern_Class"
  },
  {
    id: "fin-c-6",
    macroarea: "Finanza e Mercati",
    technology: "IA Classica / HPC",
    name: "6. Calcolo Black-Scholes Analitico per Grandi Volumi di Contratti (AVX)",
    logicType: "Vettorializzazione CPU (AVX-512)",
    targetVariables: "Prezzo_Spot, Strike, Scadenza, Tasso_Risk_Free, Volatilità"
  },
  {
    id: "fin-c-7",
    macroarea: "Finanza e Mercati",
    technology: "IA Classica / HPC",
    name: "7. Pricing di Polizze Vita Personalizzate (Insurtech) (XGBoost)",
    logicType: "Gradient Boosting (XGBoost)",
    targetVariables: "Tavole_Mortalità, Indice_Massa_Corporea, Storico_Clinico, Età"
  },

  // 2.2 🚚 Logistica e Supply Chain (4 Scenari)
  {
    id: "log-c-1",
    macroarea: "Logistica e Supply Chain",
    technology: "IA Classica / HPC",
    name: "1. Previsione della Domanda di Vendita con Gradient Boosting (XGBoost)",
    logicType: "Machine Learning & Regressione",
    targetVariables: "Vendite_Storiche, Stagionalità, Campagne_Promozionali, Prezzo"
  },
  {
    id: "log-c-2",
    macroarea: "Logistica e Supply Chain",
    technology: "IA Classica / HPC",
    name: "2. Tracciamento Visivo Automatico Colli con Telecamere OCR (YOLO)",
    logicType: "Object Detection (YOLO) & OCR",
    targetVariables: "Bounding_Box, Codice_AB_Collo, Velocità_Nastro"
  },
  {
    id: "log-c-3",
    macroarea: "Logistica e Supply Chain",
    technology: "IA Classica / HPC",
    name: "3. Monitoraggio Flotta GPS e Geofencing in Tempo Reale (GIS)",
    logicType: "Elaborazione Spaziale & Stream Processing",
    targetVariables: "Latitudine, Longitudine, Velocità_Istantanea, Poligono_Geofence"
  },
  {
    id: "log-c-4",
    macroarea: "Logistica e Supply Chain",
    technology: "IA Classica / HPC",
    name: "4. Simulazione Discreta di Magazzino (Digital Twin) (DES)",
    logicType: "Discrete Event Simulation (DES)",
    targetVariables: "Tempo_Attraversamento, Utilizzo_Carrelli, Code_Picking"
  },

  // 2.3 ⚡ Energia e Utilities (5 Scenari)
  {
    id: "ene-c-1",
    macroarea: "Energia e Utilities",
    technology: "IA Classica / HPC",
    name: "1. Previsione Irraggiamento Solare e Produzione Fotovoltaica (LSTM)",
    logicType: "Deep Learning & Serie Temporali",
    targetVariables: "Copertura_Nuvolosa, Indice_UV, Temperatura_Pannello, Produzione_kW"
  },
  {
    id: "ene-c-2",
    macroarea: "Energia e Utilities",
    technology: "IA Classica / HPC",
    name: "2. Manutenzione Predittiva Turbine a Gas tramite Sensori di Vibrazione",
    logicType: "Analisi Segnali FFT & Machine Learning",
    targetVariables: "Spettro_Frequenze_Vibrazione, Pressione_Gas, Temperatura_Cuscinetto"
  },
  {
    id: "ene-c-3",
    macroarea: "Energia e Utilities",
    technology: "IA Classica / HPC",
    name: "3. Rilevamento Perdite nella Rete Idrica da Sensori di Flusso",
    logicType: "Anomaly Detection & Modelli Idraulici",
    targetVariables: "Pressione_Condotta, Portata_Volumetrica, Differenziale_Flusso"
  },
  {
    id: "ene-c-4",
    macroarea: "Energia e Utilities",
    technology: "IA Classica / HPC",
    name: "4. Ottimizzazione Termica degli Edifici (HVAC) con Reinforcement Learning",
    logicType: "Reinforcement Learning (RL)",
    targetVariables: "Temperatura_Ambiente, Umidità_Relativa, Occupazione_Stanze, Consumo_kWh"
  },
  {
    id: "ene-c-5",
    macroarea: "Energia e Utilities",
    technology: "IA Classica / HPC",
    name: "5. Manutenzione Stradale Ottimizzata tramite Dati Accelerometro Bus",
    logicType: "Edge Computing & Spatial Clustering",
    targetVariables: "Accelerazione_Asse_Z, Coordinate_GPS, Rugosità_Manto_Stradale"
  },

  // 2.4 🔬 Chimica, Farmaceutica e Materiali (7 Scenari)
  {
    id: "chem-c-1",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "IA Classica / HPC",
    name: "1. Predizione Struttura Terziaria Proteine con AlphaFold / ESMFold",
    logicType: "Deep Learning Strutturale",
    targetVariables: "Sequenza_Amminoacidica, Matrice_Distanze_Residui, Coordinate_PDB"
  },
  {
    id: "chem-c-2",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "IA Classica / HPC",
    name: "2. Dinamica Molecolare Classica (GROMACS/LAMMPS) su GPU (CUDA)",
    logicType: "Calcolo Parallelo GPU ad Alte Prestazioni",
    targetVariables: "Campi_Forza_AMBER_CHARMM, Traiettorie_Atomi, Passo_Temporale_fs"
  },
  {
    id: "chem-c-3",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "IA Classica / HPC",
    name: "3. Generazione di Nuove Molecole con Modelli Diffusivi / VAE (AI Generativa)",
    logicType: "Generative AI (Diffusion Models / VAE)",
    targetVariables: "Notazione_SMILES, Indice_QED, Peso_Molecolare, TPSA"
  },
  {
    id: "chem-c-4",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "IA Classica / HPC",
    name: "4. Tossicologia Predittiva e ADMET in Silico (GNN)",
    logicType: "Graph Neural Networks (GNN)",
    targetVariables: "Grafo_Molecolare, Assorbimento_Intestinale, Clearance_Epatica, Tossicità_hERG"
  },
  {
    id: "chem-c-5",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "IA Classica / HPC",
    name: "5. Massimizzazione dell'Efficienza dei Biocarburanti dalle Alghe",
    logicType: "Modellazione Cinetica & Machine Learning",
    targetVariables: "Concentrazione_Lipidi, Tasso_Crescita_Biomassa, Irraggiamento_Luminoso"
  },
  {
    id: "chem-c-6",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "IA Classica / HPC",
    name: "6. Formulazione di Vernici Ecologiche Senza Composti Organici Volatili",
    logicType: "Ottimizzazione Bayesiana",
    targetVariables: "Contenuto_VOC, Tempo_Essiccazione, Viscosità, Resistenza_UV"
  },
  {
    id: "chem-c-7",
    macroarea: "Chimica, Farmaceutica e Materiali",
    technology: "IA Classica / HPC",
    name: "7. Ottimizzazione della Combustione dell'Idrogeno nelle Turbine Industriali (CFD)",
    logicType: "Fluidodinamica Computazionale (CFD)",
    targetVariables: "Frazione_Miscela_H2_Gas, Temperatura_Fiamma, Emissioni_NOx"
  },

  // 2.5 🏭 Produzione e Manifattura (4 Scenari)
  {
    id: "man-c-1",
    macroarea: "Produzione e Manifattura",
    technology: "IA Classica / HPC",
    name: "1. Controllo Qualità Automatico con Telecamere e Reti Convoluzionali (CNN)",
    logicType: "Computer Vision & Reti Convoluzionali",
    targetVariables: "Risoluzione_Frame, Classe_Difetto_Superficie, Confidenza_Modello"
  },
  {
    id: "man-c-2",
    macroarea: "Produzione e Manifattura",
    technology: "IA Classica / HPC",
    name: "2. Manutenzione Predittiva su Cuscinetti con Analisi Spettrale FFT",
    logicType: "Analisi Segnali FFT & Machine Learning",
    targetVariables: "Frequenza_BPFO_BPFI, RMS_Accelerazione, Temperatura_Alloggiamento"
  },
  {
    id: "man-c-3",
    macroarea: "Produzione e Manifattura",
    technology: "IA Classica / HPC",
    name: "3. Ottimizzazione Parametri di Stampaggio Iniezione Plastica",
    logicType: "Machine Learning & Ottimizzazione Parametrica",
    targetVariables: "Pressione_Iniezione, Temperatura_Fuso, Tempo_Raffreddamento, Ritiro"
  },
  {
    id: "man-c-4",
    macroarea: "Produzione e Manifattura",
    technology: "IA Classica / HPC",
    name: "4. Riconoscimento Anomalie Acustiche su Presse Industriali (CNN Audio)",
    logicType: "Audio Deep Learning (Spettrogrammi)",
    targetVariables: "Mel_Spectrogram, Livello_Decibel, Distorsione_Armonica"
  },

  // 2.6 🛡️ Sicurezza, Telecomunicazioni e Reti (6 Scenari)
  {
    id: "sec-c-1",
    macroarea: "Sicurezza, Telecomunicazioni e Reti",
    technology: "IA Classica / HPC",
    name: "1. Rilevamento Malware Tramite Analisi del Bytecode ed Euristica",
    logicType: "Machine Learning & Static Analysis",
    targetVariables: "Opcode_Frequency, Dimensione_Sezioni_PE, Firme_Entropy"
  },
  {
    id: "sec-c-2",
    macroarea: "Sicurezza, Telecomunicazioni e Reti",
    technology: "IA Classica / HPC",
    name: "2. Analisi Log Firewall per Prevenzione Intrusioni (SIEM)",
    logicType: "Elaborazione Big Data & ML",
    targetVariables: "Porta_Destinazione, Frequenza_Tentativi, Indirizzo_Origine"
  },
  {
    id: "sec-c-3",
    macroarea: "Sicurezza, Telecomunicazioni e Reti",
    technology: "IA Classica / HPC",
    name: "3. Crittografia Post-Quantum (PQC: Kyber, Dilithium) su Processori Classici",
    logicType: "Crittografia Reticolare Vettorializzata",
    targetVariables: "Dimensione_Chiave, Tempo_Cifratura, Tempo_Decifratura"
  },
  {
    id: "sec-c-4",
    macroarea: "Sicurezza, Telecomunicazioni e Reti",
    technology: "IA Classica / HPC",
    name: "4. Riconoscimento Facciale e Biometrico per Controllo Accessi",
    logicType: "Deep Learning Embedding",
    targetVariables: "Vettore_Embedding, Distanza_Coseno, Soglia_Verifica"
  },
  {
    id: "sec-c-5",
    macroarea: "Sicurezza, Telecomunicazioni e Reti",
    technology: "IA Classica / HPC",
    name: "5. Rilevamento di Attacchi Ransomware e Propagazione Laterale in Rete",
    logicType: "Elaborazione Big Data & ML",
    targetVariables: "Volume_Scrittura_Disco, Tentativi_Login_Falliti, Estensione_File_Modificata"
  },
  {
    id: "sec-c-6",
    macroarea: "Sicurezza, Telecomunicazioni e Reti",
    technology: "IA Classica / HPC",
    name: "6. Smascheramento di Attacchi DDoS Coordinati da Botnet Globali",
    logicType: "Elaborazione Big Data & ML",
    targetVariables: "IP_Sorgente, Pacchetti_Secondo, Dimensione_Payload, Porta_Target"
  }
];
