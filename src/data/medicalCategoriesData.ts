export interface MicroCategory {
  t: string;
  d: string;
  icon: string;
}

export interface CategoryData {
  id: number;
  title: string;
  valore: string;
  obiettivo: string;
  urgenza: string;
  urgenzaTag: string;
  urgenzaDesc: string;
  urgenzaBadgeColor: string;
  punti: MicroCategory[];
  allarmi: string;
  cause: string;
  consigli: string;
  interconnessione: string;
}

export const CATEGORY_DETAILS_ENRICHED: CategoryData[] = [
  {
    id: 0,
    title: "I Parametri Vitali",
    valore: "Il controllo della propria sicurezza e stabilità immediata.",
    obiettivo: "Il controllo della propria sicurezza e stabilità immediata.",
    urgenza: "🔴 Urgenza Alta / Immediata (Se alterati, il corpo è in pericolo adesso).",
    urgenzaTag: "Urgenza Alta / Immediata",
    urgenzaDesc: "Se alterati, il corpo è in pericolo adesso.",
    urgenzaBadgeColor: "bg-red-500/10 border-red-500/30 text-red-400",
    punti: [
      { t: "Monitoraggio Emodinamico", d: "Valutazione della pressione arteriosa (sistolica/diastolica) e della salute dei vasi.", icon: "🩺" },
      { t: "Efficienza Respiratoria", d: "Livelli di saturazione dell'ossigeno nel sangue e frequenza respiratoria a riposo e sotto sforzo.", icon: "🫁" },
      { t: "Cronotropismo e Ritmo", d: "Analisi della frequenza cardiaca a riposo e variabilità cardiaca (HRV).", icon: "💓" },
      { t: "Termoregolazione", d: "Stato del bilancio termico corporeo.", icon: "🌡️" }
    ],
    allarmi: "Giramenti di testa improvvisi, stanchezza inspiegabile alzandosi in piedi, affanno anche a riposo, palpitazioni, estremità fredde.",
    cause: "Disidratazione, stress acuto, ansia, carenza di sonno, sedentarietà o sforzi eccessivi.",
    consigli: "Tecniche di respirazione guidata, apporto di acqua giornaliero, monitoraggio autonomo a casa.",
    interconnessione: "Sapevi che un'alterazione improvvisa dei parametri vitali è spesso la risposta d'emergenza del corpo a uno stato infiammatorio acuto o a un improvviso blocco dei filtri d'organo?"
  },
  {
    id: 1,
    title: "I Parametri Metabolici e Longevità",
    valore: "La chiave per la prevenzione dell'invecchiamento precoce e delle malattie croniche.",
    obiettivo: "La chiave per la prevenzione dell'invecchiamento precoce e delle malattie croniche.",
    urgenza: "🟢 Urgenza a Lungo Termine (Silenziosi, determinano la salute tra 5 o 10 anni).",
    urgenzaTag: "Urgenza a Lungo Termine",
    urgenzaDesc: "Silenziosi, determinano la salute tra 5 o 10 anni.",
    urgenzaBadgeColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    punti: [
      { t: "Glicolisi e Gestione Zuccheri", d: "Livelli di glicemia a digiuno ed emoglobina glicata.", icon: "🍬" },
      { t: "Profilo Lipidico e Cardio-Rischio", d: "Bilancio tra colesterolo LDL, HDL e trigliceridi.", icon: "🧬" },
      { t: "Antropometria Clinica", d: "Analisi della composizione corporea e livello di grasso viscerale addominale.", icon: "⚖️" },
      { t: "Efficienza Mitocondriale", d: "Conversione del cibo in energia cellulare e stabilità energetica.", icon: "🔥" }
    ],
    allarmi: "Sonnolenza post-prandiale, attacchi di fame chimica/dolci, aumento del girovita, difficoltà a perdere peso.",
    cause: "Dieta troppo ricca di zuccheri raffinati, mancanza di massa muscolare, stress cronico (cortisolo).",
    consigli: "Allenamenti di forza, iniziare i pasti dalle fibre, praticare il digiuno intermittente (se consigliato).",
    interconnessione: "Sapevi che un'alterazione nei Parametri Metabolici (es. troppo zucchero nel sangue) è la causa principale dell'aumento dello Stato Infiammatorio, che a sua volta affatica la Funzionalità d'Organo (i reni)?"
  },
  {
    id: 2,
    title: "La Funzionalità d’Organo ed Emocromo",
    valore: "La certezza che i sistemi di purificazione e ossigenazione interni stiano reggendo il carico biologico.",
    obiettivo: "La certezza che i sistemi di purificazione e ossigenazione interni stiano reggendo il carico biologico.",
    urgenza: "🟡 Urgenza Media (Mostra come i filtri stanno reggendo lo stress sul momento).",
    urgenzaTag: "Urgenza Media",
    urgenzaDesc: "Mostra come i filtri stanno reggendo lo stress sul momento.",
    urgenzaBadgeColor: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    punti: [
      { t: "Efficienza di Filtrazione Renale", d: "Creatinina, azotemia e filtrato glomerulare (eGFR).", icon: "💧" },
      { t: "Funzione Epatica e Detossificazione", d: "Transaminasi (ALT/AST) e bilirubina.", icon: "🧪" },
      { t: "Profilo Emopoietico (Emocromo)", d: "Conteggio dei globuli rossi, emoglobina e piastrine.", icon: "🩸" },
      { t: "Bilancio Elettrolitico", d: "Livelli di sodio, potassio e calcio nel sangue.", icon: "💎" }
    ],
    allarmi: "Pallore del viso/mucose, unghie e capelli fragili, urine scure o con molta schiuma, digestione estremamente lenta.",
    cause: "Abuso di farmaci da banco, consumo frequente di alcol, carenza di ferro, B12 o acido folico.",
    consigli: "Cicli di idratazione profonda, riduzione di cibi tossici per il fegato, introduzione di alimenti ricchi di ferro bio-disponibile.",
    interconnessione: "Sapevi che se i filtri d'organo (fegato e reni) rallentano, le tossine si accumulano nel sangue, destabilizzando immediatamente i tuoi Parametri Vitali e aumentando lo Stato Infiammatorio?"
  },
  {
    id: 3,
    title: "Lo Stato Infiammatorio e Immunitario",
    valore: "La mappa delle proprie difese biologiche e dell'infiammazione silente.",
    obiettivo: "La mappa delle proprie difese biologiche e dell'infiammazione silente.",
    urgenza: "🟡 Urgenza Medio-Alta (Indica una minaccia attiva che va spenta prima che faccia danni).",
    urgenzaTag: "Urgenza Medio-Alta",
    urgenzaDesc: "Indica una minaccia attiva che va spenta prima che faccia danni.",
    urgenzaBadgeColor: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    punti: [
      { t: "Immunocompetenza", d: "Formula leucocitaria completa (linfociti, neutrofili, ecc.).", icon: "🛡️" },
      { t: "Infiammazione Sistemica di Basso Grado", d: "Analisi della Proteina C-Reattiva ad alta sensibilità (hs-PCR).", icon: "🔥" },
      { t: "Reattività Allergica e Autoimmune", d: "Presenza di anticorpi anomali o livelli di eosinofili.", icon: "🦠" }
    ],
    allarmi: "Ammalarsi spesso (più di 3-4 volte l'anno), dolori articolari o muscolari vaganti, problemi cutanei (sfoghi/dermatiti), stanchezza cronica.",
    cause: "Infiammazione intestinale (disbiosi), infezioni virali passate e mai smaltite, sonno di scarsa qualità.",
    consigli: "Cibi antinfiammatori (Omega-3), cura del microbiota intestinale, esposizione solare controllata (Vitamina D).",
    interconnessione: "Sapevi che un'alterazione cronica non rilevata attacca silenziosamente i tessuti interni, provocando nel tempo un declino precoce della Funzionalità d'Organo e compromettendo i Parametri Metabolici?"
  }
];

export interface CrossProblemStage {
  fase: string;
  nome: string;
  descrizione: string;
  badge: string;
  badgeColor: string;
}

export interface CrossParameterProblem {
  id: string;
  titolo: string;
  sottotitolo: string;
  urgenza: string;
  rischioColore: string;
  parametriCoinvolti: { nome: string; categoria: string; icon: string }[];
  fasi: CrossProblemStage[];
  conseguenzaClinica: string;
  indicazioniMediche: string;
}

export const CROSS_PARAMETER_PROBLEMS: CrossParameterProblem[] = [
  {
    id: "glicemia_colesterolo_ictus",
    titolo: "Aterosclerosi Acelerata & Rischio Ictus Ischemico",
    sottotitolo: "Incrocio Critico: Glicemia Elevata × Colesterolo LDL Alto × Parete Endoteliale",
    urgenza: "🔴 Pericolo Vascolare Critico",
    rischioColore: "border-red-500/40 bg-red-500/5",
    parametriCoinvolti: [
      { nome: "Glicemia a Digiuno / HbA1c", categoria: "Parametri Metabolici", icon: "🍬" },
      { nome: "Colesterolo LDL Ossidato", categoria: "Parametri Metabolici", icon: "🧬" },
      { nome: "Proteina C-Reattiva (hs-PCR)", categoria: "Stato Infiammatorio", icon: "🔥" },
      { nome: "Pressione Arteriosa", categoria: "Parametri Vitali", icon: "🩺" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Danno iniziale (Glicemia alta)",
        descrizione: "Il glucosio in eccesso nel sangue lesiona e infiamma il rivestimento interno dei vasi (endotelio), creando micro-fratture e rendendo la parete arteriosa ruvida e fragile.",
        badge: "Lesione Endoteliale",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Infiltrazione e deposito (Colesterolo LDL elevato)",
        descrizione: "Sfruttando queste lesioni dell'endotelio, il colesterolo LDL si insinua nello spessore della parete del vaso, ossidandosi e trasformandosi rapidamente in placche aterosclerotiche.",
        badge: "Placca Aterosclerotica",
        badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
      },
      {
        fase: "Fase 3",
        nome: "L'evento acuto (Azione combinata)",
        descrizione: "L'infiammazione cronica unita fa crescere la placca e la rende instabile. Quando la placca si spacca o si erode, il sangue a contatto con il suo interno attiva la coagulazione formando un trombo: se questo chiude un'arteria cerebrale, si scatena l'ictus ischemico (o ischemia).",
        badge: "Trombosi & Ictus",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Occlusione acuta del circolo cerebrale (Ictus Ischemico) o coronarico (Infarto del Miocardio) dovuta alla rottura della placca vulnerabile e conseguente trombo-embolia.",
    indicazioniMediche: "Controllo immediato del profilo glicidico (curva da carico / HbA1c), ecocolordoppler dei tronchi sovra-aortici (TSA) ed eventuale terapia protettiva endoteliale e ipolipemizzante."
  },
  {
    id: "ipertensione_infiammazione_rene",
    titolo: "Scompenso Nefro-Cardiovascolare & Ipertensione Refrattaria",
    sottotitolo: "Incrocio: Pressione Arteriosa Elevata × Infiammazione (PCR) × Filtrato Renale",
    urgenza: "🟠 Rischio di Scompenso Organico",
    rischioColore: "border-orange-500/40 bg-orange-500/5",
    parametriCoinvolti: [
      { nome: "Pressione Sistolica/Diastolica", categoria: "Parametri Vitali", icon: "🩺" },
      { nome: "Proteina C-Reattiva (hs-PCR)", categoria: "Stato Infiammatorio", icon: "🔥" },
      { nome: "Creatinina ed eGFR", categoria: "Funzionalità d'Organo", icon: "💧" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Iper-afflusso Emodinamico",
        descrizione: "La pressione arteriosa costantemente elevata esercita una forza meccanica abrasiva sui fragili glomeruli renali.",
        badge: "Stress Emodinamico",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Sclerosi e Perdita di Filtrazione",
        descrizione: "L'infiammazione sistemica (PCR alta) accelera la fibrosi tissutale: i nefroni muoiono e la clearance delle tossine crolla.",
        badge: "Declino Renale",
        badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Ritenzione Idrosalina & Sovraccarico Cardiaco",
        descrizione: "Il rene intasato trattiene sodio e liquidi. Il volume ematico aumenta, facendo schizzare la pressione a livelli di emergenza e affaticando il ventricolo sinistro del cuore.",
        badge: "Circolo Vizioso",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Insufficienza renale progressiva e ipertrofia miocardica con rischio di scompenso cardiaco congestizio.",
    indicazioniMediche: "Monitoraggio della microalbuminuria delle 24h, ottimizzazione terapeutica antipertensiva e dieta iposodica controllata."
  },
  {
    id: "grasso_viscerale_disbiosi_fegato",
    titolo: "Steatosi Epatica Metabolica (MASLD) & Esaurimento Mitocondriale",
    sottotitolo: "Incrocio: Grasso Viscerale × Disbiosi Intestinale × Transaminasi Alte",
    urgenza: "🟡 Invecchiamento Cellulare Accelerato",
    rischioColore: "border-yellow-500/40 bg-yellow-500/5",
    parametriCoinvolti: [
      { nome: "Circonferenza Addominale / Trigliceridi", categoria: "Parametri Metabolici", icon: "⚖️" },
      { nome: "Transaminasi ALT / AST / Gamma-GT", categoria: "Funzionalità d'Organo", icon: "🧪" },
      { nome: "Permeabilità Intestinale / Leucociti", categoria: "Stato Infiammatorio", icon: "🛡️" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Invasione di Tossine Batteriche",
        descrizione: "La disbiosi della barriera intestinale consente a frammenti batterici (lipopolisaccaridi LPS) di entrare nella vena porta verso il fegato.",
        badge: "Traslocazione",
        badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Infiammazione del Parenchima Epatico",
        descrizione: "Il fegato, già sovraccaricato da trigliceridi e zuccheri in eccesso, si infiamma provocando l'innalzamento delle transaminasi.",
        badge: "Steatoepatite",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Blocco Energetico e Letargia",
        descrizione: "Il fegato rallenta la detossificazione e i mitocondri cellulari subiscono un crollo di resa energetica: subentrano stanchezza cronica e nebbia cognitiva.",
        badge: "Astenia Sistemica",
        badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
      }
    ],
    conseguenzaClinica: "Progressione verso la fibrosi epatica, insulino-resistenza sistemica refrattaria e sindrome da affaticamento cronico.",
    indicazioniMediche: "Ecografia epatica superiore, dieta chetogenica o a basso carico glicemico, ripristino del microbiota e protocollo probiotico mirato."
  }
];

export const DOMINO_EFFECT_STEPS = [
  {
    step: 1,
    titolo: "La Scintilla Iniziale (Parametri Metabolici)",
    descrizione: "Se mangi troppi zuccheri o accumuli grasso viscerale, le tue cellule vanno in stress energetico.",
    icon: "🍬",
    color: "from-emerald-500 to-teal-500",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10"
  },
  {
    step: 2,
    titolo: "L'Incendio Silenzioso (Stato Infiammatorio)",
    descrizione: "Questo stress metabolico attiva i globuli bianchi e alza la Proteina C-Reattiva, creando un'infiammazione cronica nascosta.",
    icon: "🔥",
    color: "from-yellow-500 to-amber-500",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10"
  },
  {
    step: 3,
    titolo: "Il Logoramento dei Filtri (Funzionalità d'Organo)",
    descrizione: "L'infiammazione costante bombarda i reni e il fegato, riducendo la loro capacità di filtrare le tossine dal sangue.",
    icon: "🧪",
    color: "from-amber-500 to-orange-500",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10"
  },
  {
    step: 4,
    titolo: "Il Crollo di Emergenza (Parametri Vitali)",
    descrizione: "Con il sangue pieno di scorie biologiche e vasi sanguigni irrigiditi dall'infiammazione, il cuore è costretto a battere più forte e la pressione arteriosa schizza fuori controllo.",
    icon: "💓",
    color: "from-red-500 to-rose-600",
    border: "border-red-500/30",
    bg: "bg-red-500/10"
  }
];
