export interface MicroCategory {
  t: string;
  d: string;
  icon: string;
  seAlti?: string;
  seBassi?: string;
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
    title: "I Parametri Vitali & Emostasi d'Emergenza",
    valore: "Il controllo della propria sicurezza e stabilità emodinamica immediata.",
    obiettivo: "Sorveglianza tempestiva dei circuiti di sopravvivenza: perfusione, ossigenazione, cinetica cardiaca e assetto coagulativo acuto.",
    urgenza: "🔴 Urgenza Alta / Immediata (Se alterati, il corpo è in pericolo adesso).",
    urgenzaTag: "Urgenza Alta / Immediata",
    urgenzaDesc: "Se alterati, il corpo è in pericolo acuto con rischio ischemico, ipossico o emorragico.",
    urgenzaBadgeColor: "bg-red-500/10 border-red-500/30 text-red-400",
    punti: [
      {
        t: "Monitoraggio Emodinamico & Pressione Arteriosa",
        d: "Pressione sistolica e diastolica; resistenza periferica e tono vascolare.",
        icon: "🩺",
        seAlti: "Ipertensione severa, rischio rottura aneurismi, ictus emorragico, sovraccarico ventricolare.",
        seBassi: "Ipotensione acuta, collasso emodinamico, shock ipovolemico o distributivo, lipotimia."
      },
      {
        t: "Cronotropismo & Biomarcatori di Danno Miocardico",
        d: "Frequenza cardiaca (BPM), variabilità HRV, Troponina I/T hs, CK-MB, Mioglobina.",
        icon: "💓",
        seAlti: "Troponina/CK-MB alti: necrosi miocardica (infarto STEMI/NSTEMI), miocardite, tachiaritmie maligne.",
        seBassi: "Bradicardia sintomatica severa, blocchi atrio-ventricolari, deficit di conduzione elettrica."
      },
      {
        t: "Coagulazione & Profilo Emostatico Rapido (PT/INR, aPTT, Fibrinogeno, D-Dimero)",
        d: "Velocità di coagulazione plasmatica e degradazione della fibrina vascolare.",
        icon: "🩸",
        seAlti: "INR/aPTT alti: emorragie spontanee, deficit fattori via estrinseca/intrinseca. D-Dimero alto: trombosi venosa profonda, embolia polmonare.",
        seBassi: "Fibrinogeno o Antitrombina III bassi: CID da consumo massivo, coagulopatia grave, rischio tromboembolico incontrollato."
      },
      {
        t: "Biomarcatori di Sovraccarico Ventricolare (NT-proBNP / BNP)",
        d: "Stiramento delle pareti dei ventricoli cardiaci ed espansione volumetrica intracardiaca.",
        icon: "⚡",
        seAlti: "Scompenso cardiaco congestizio, edema polmonare acuto, insufficienza ventricolare sinistra/destra.",
        seBassi: "Esclude con altissima specificità lo scompenso cardiaco in presenza di dispnea."
      },
      {
        t: "[Test Funzionali e Fisiologici] Elettrofisiologia Cardiaca",
        d: "ECG a riposo/sotto sforzo ed Holter Cardiaco 24/48h.",
        icon: "⚡"
      },
      {
        t: "[Test Funzionali e Fisiologici] Monitoraggio Pressorio Continuo",
        d: "Holter Pressorio.",
        icon: "📉"
      },
      {
        t: "[Diagnostica per Immagini] Dopplersonografia Carotidea ed Ecocardiografia",
        d: "EcoDoppler intima-media/placche e Frazione d'eiezione.",
        icon: "🔊"
      },
      {
        t: "[Esame Obiettivo / Valutazione Clinica] Semeiotica Cardiorespiratoria",
        d: "Auscultazione con stetofonendoscopio per soffi/rumori.",
        icon: "👂"
      }
    ],
    allarmi: "Dolore toracico oppressivo retrosternale irradiato al braccio o mandibola, affanno a riposo, improvvisa perdita di coscienza, emorragie cutanee a petecchie, arti cianotici freddi. Anomalie del tratto ST all'ECG, sbalzi pressori notturni (non-dipper), stenosi vascolare da Doppler, riscontro di soffi cardiaci.",
    cause: "Disidratazione massiva, rottura di placca aterosclerotica, aritmie ventricolari, shock ipovolemico o settico, sovradosaggio di anticoagulanti orali.",
    consigli: "Accesso immediato a pronto soccorso o monitoraggio continuo con elettrocardiogramma, ossigenoterapia e profilassi tromboembolica controllata dal cardiologo. Monitoraggio pressorio domiciliare, tecniche di biofeedback per la variabilità cardiaca (HRV).",
    interconnessione: "Un'alterazione improvvisa dei parametri vitali è spesso la fase finale di un Effetto Domino partito da un'infiammazione silente trascurata o da un blocco acuto dei filtri d'organo (rene e fegato)."
  },
  {
    id: 1,
    title: "I Parametri Metabolici, Glucidici & Longevità",
    valore: "La chiave per la prevenzione dell'invecchiamento precoce, aterosclerosi e diabete.",
    obiettivo: "Mantenimento dell'omeostasi cellulare, modulazione del glicometabolismo e protezione della parete vascolare endoteliale.",
    urgenza: "🟢 Urgenza a Lungo Termine (Silenziosi, determinano la salute tra 5 o 10 anni).",
    urgenzaTag: "Urgenza a Lungo Termine",
    urgenzaDesc: "Silenziosi nel breve periodo, ma se alterati erodono inesorabilmente vasi sanguigni, cuore e cervello.",
    urgenzaBadgeColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    punti: [
      {
        t: "Assetto Glucidico (Glicemia a Digiuno, HbA1c, Insulina, C-Peptide, HOMA-IR)",
        d: "Glucosio circolante, memoria glicemica trimestrale ed efficienza dei recettori insulinici.",
        icon: "🍬",
        seAlti: "Iperglicemia cronica, glicazione delle proteine endoteliali, micro e macroangiopatia, diabete mellito, acidosi chetoacidosica.",
        seBassi: "Ipoglicemia severa, neuroglicopenia, sudorazione algida, tremori, confusione mentale e coma ipoglicemico."
      },
      {
        t: "Assetto Lipidico Aterogeno (Colesterolo Totale, LDL, HDL, Trigliceridi)",
        d: "Equilibrio tra frazione aterogena (LDL) e frazione protettiva vascolare di ritorno al fegato (HDL).",
        icon: "🧬",
        seAlti: "Colesterolo LDL / Trigliceridi alti: infiltrazione e ossidazione sub-endoteliale, placche carotidee/coronariche, xantomi cutanei. Trigliceridi >1000: pancreatite acuta.",
        seBassi: "HDL depresso (<40 mg/dL): perdita dello spazzino naturale del colesterolo vascolare, aumento del rischio cardiovascolare."
      },
      {
        t: "Fattori Lipidici Genetici e Vascolari (ApoB, ApoA1, Lipoproteina(a) [Lp(a)])",
        d: "Conteggio reale delle particelle aterogene circolanti e fattore trombofilico genetico indipendente.",
        icon: "🔬",
        seAlti: "ApoB e Lp(a) elevate: rischio genetico elevatissimo di infarto precoce, stenosi aortica calcifica e trombofilia arteriosa.",
        seBassi: "Privo di significato patologico negativo, conferisce protezione cardiovascolare d'eccellenza."
      },
      {
        t: "Assetto Endocrino Tiroideo e Metabolismo Basale (TSH, FT3, FT4, TRAb)",
        d: "Regolazione ormonale del dispendio calorico, sintesi proteica e frequenza basale.",
        icon: "🦋",
        seAlti: "TSH alto + FT4 basso: Ipotiroidismo (Hashimoto), bradicardia, aumento ponderale, stipsi, mixedema. FT3/FT4 alti + TRAb: Ipertiroidismo (Graves), tireotossicosi, aritmie.",
        seBassi: "TSH azzerato: iperattivazione tiroidea; FT3/FT4 bassi: rallentamento severo del metabolismo energetico."
      },
      {
        t: "Ormoni dello Stress & Surrene (Cortisolo, ACTH, DHEA-S, Aldosterone)",
        d: "Risposta allo stress acuto/cronico, equilibrio elettrolitico e catabolismo tissutale.",
        icon: "⚖️",
        seAlti: "Cortisolo alto: Sindrome di Cushing, obesità addominale, ipertensione, diabete secondario. Aldosterone alto: Sindrome di Conn.",
        seBassi: "Cortisolo basso + ACTH alto: Crisi Addisoniana (insufficienza surrenalica), ipotensione refrattaria, iponatriemia e shock."
      },
      {
        t: "[Diagnostica per Immagini] Ecografia Addominale Superiore",
        d: "Valutazione fegato iperecogeno.",
        icon: "🔊"
      },
      {
        t: "[Esame Obiettivo / Valutazione Clinica Diretta] Antropometria Manuale e Strumentale",
        d: "Misurazione pliche, circonferenze, calcolo BMI e stima volumetrica del grasso viscerale addominale profondo.",
        icon: "📐"
      }
    ],
    allarmi: "Sonnolenza insostenibile post-prandiale, attacchi di fame incontrollata per zuccheri, depositi giallastri sulle palpebre (xantelasmi), aumento del grasso viscerale addominale. Accumulo critico di grasso viscerale, fegato iperecogeno (steatosico) alla sonda ecografica, alterazione del rapporto vita-fianchi (WHR).",
    cause: "Dieta ricca di zuccheri semplici e grassi idrogenati, sedentarietà prolungata, predisposizione poligenica, stress cronico elevato con ipercortisolemia.",
    consigli: "Attività anaerobica contro resistenza per riattivare i recettori GLUT4, alimentazione a basso carico glicemico ricca di fibre idrosolubili, controllo annuale di ApoB ed HbA1c. Esercizio contro resistenze per incrementare il tessuto muscolare (principale consumatore di glucosio).",
    interconnessione: "Se il glucosio e il colesterolo LDL rimangono alti, lesionano l'endotelio richiamando i globuli bianchi: questo scatena l'infiammazione silente (Stato Infiammatorio) che a catena logora i capillari renali ed epatici (Funzionalità d'Organo)."
  },
  {
    id: 2,
    title: "La Funzionalità d’Organo (Renale, Epatica, Pancreatica) ed Emocromo",
    valore: "La certezza che i filtri biologici e il trasporto di ossigeno reggano il carico metabolico.",
    obiettivo: "Valutazione dell'eliminazione delle tossine azotate, della funzione epato-biliare, della sintesi proteica e dell'emopoiesi midollare.",
    urgenza: "🟡 Urgenza Media (Mostra come i filtri stanno reggendo lo stress sul momento).",
    urgenzaTag: "Urgenza Media",
    urgenzaDesc: "Riflette l'usura e l'efficienza reale dei filtri depurativi e del midollo osseo.",
    urgenzaBadgeColor: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    punti: [
      {
        t: "Filtrazione Glomerulare & Elettroliti (Creatinina, Azotemia, eGFR, Na+, K+, Ca++)",
        d: "Capacità depurativa dei nefroni renali e conduzione ionica cellulare.",
        icon: "💧",
        seAlti: "Creatinina ed Azotemia alte (eGFR <15): uremia terminale, tossicità sistemica. Potassio K+ alto: arresto cardiaco in diastole, onde T aguzze all'ECG.",
        seBassi: "eGFR basso: insufficienza renale cronica. Potassio K+ basso: aritmie ventricolari mortali (torsione di punta). Calcio basso: tetania muscolare."
      },
      {
        t: "Necrosi Epatocellulare & Colestasi (ALT, AST, Gamma-GT, Fosfatasi Alcalina, Bilirubina)",
        d: "Integrità degli epatociti, deflusso della bile e detossificazione biologica.",
        icon: "🧪",
        seAlti: "ALT/AST >20x limiti: epatite acuta fulminante virale o tossica. GGT + ALP + Bilirubina diretta alta: ittero colestatico ostruttivo (calcoli o tumore pancreatico).",
        seBassi: "Colinesterasi (CHE) depressa: insufficienza sintetica epatica severa, cirrosi avanzata."
      },
      {
        t: "Pancreas Esocrino ed Enzimi Digestivi (Lipasi, Amilasi Pancreatica)",
        d: "Rilascio sistemico di enzimi litici in caso di autodigestione tissutale pancreatica.",
        icon: "🔥",
        seAlti: "Lipasi >3 volte il limite: pancreatite acuta necrotizzante emorragica, emergenza medica addominale.",
        seBassi: "Insufficienza pancreatica esocrina cronica con malassorbimento lipidico e steatorrea."
      },
      {
        t: "Serie Rossa & Trasporto di O2 (Globuli Rossi RBC, Emoglobina Hb, Ematocrito Ht, MCV, RDW)",
        d: "Ossigenazione periferica dei tessuti e morfologia volumetrica dei globuli rossi.",
        icon: "🩸",
        seAlti: "RBC/Hb/Ht alti: policitemia vera, iperviscosità ematica con cefalea, rischio elevato di trombosi venosa e ischemia.",
        seBassi: "Hb <8 g/dL: anemia grave con astenia profonda, dispnea da sforzo, ischemia miocardica da discrepanza, tachicardia da compenso."
      },
      {
        t: "Metabolismo Marziale e Riserve di Ferro (Sideremia, Ferritina, Transferrina, %Tsat)",
        d: "Disponibilità di ferro libero, capacità legante sierica e saturazione dei depositi midollari ed epatici.",
        icon: "🔩",
        seAlti: "Ferritina >1000 ng/mL + Tsat >50%: emocromatosi con accumulo tossico di ferro nel fegato, cuore e pancreas.",
        seBassi: "Ferritina depauperata + Tsat <15%: carenza marziale assoluta (anemia sideropenica) prima ancora del calo di emoglobina."
      },
      {
        t: "Serie Piastrinica (Piastrine PLT, MPV, PDW)",
        d: "Tampone primario emostatico e turnover midollare delle piastrine.",
        icon: "🩹",
        seAlti: "PLT >450.000/μL: trombocitosi con rischio tromboembolico acuto o disordine mieloproliferativo cronico.",
        seBassi: "PLT <50.000/μL: trombocitopenia severa con rischio di sanguinamenti spontanei cerebrali, emorragie digestive e porpora."
      },
      {
        t: "[Fluidi Corporei ed Escrezioni] Esame Chimico-Fisico delle Urine",
        d: "Proteinuria, microalbuminuria, peso specifico e sedimento.",
        icon: "🧪"
      },
      {
        t: "[Diagnostica per Immagini] Ecografia Renale ed Epatica",
        d: "Morfologia parenchimale, calcolosi, cisti o dilatazioni.",
        icon: "🔊"
      },
      {
        t: "[Diagnostica Endoscopica] Gastroscopia (EGDS) e Colonscopia",
        d: "Ispezione visiva diretta della mucosa per escludere lesioni o erosioni provocate dall'accumulo sistemico di tossine uremiche.",
        icon: "🔍"
      },
      {
        t: "[Esame Obiettivo / Valutazione Clinica] Palpazione e Percussione Addominale",
        d: "Valutazione manuale della consistenza, bordi d'organo e dolorabilità fegato/milza.",
        icon: "✋"
      }
    ],
    allarmi: "Urine scure color coca-cola o schiumose, ittero sclerale (occhi gialli), feci acoliche (chiare), pallore cereo, affaticamento anche a piccoli passi, gonfiore (edema) alle caviglie e gambe. Presenza di proteine o emazie nelle urine, alterazione morfologica del parenchima renale/epatico all'ecografia, riscontro visivo di gastro-duodenite o lesioni mucosali in endoscopia, epatomegalia alla palpazione.",
    cause: "Farmaci epatotossici (paracetamolo ad alte dosi), abuso di alcolici, epatiti virali B/C, glomerulonefriti, calcoli delle vie biliari, diete ipoproteiche o sanguinamenti gastrointestinali occulti.",
    consigli: "Ecografia addome completo, monitoraggio clearance renale, integrazione di ferro bisglicinato o folati se carenti, sospensione immediata di farmaci nefrotossici (FANS). Cicli di idratazione profonda, restrizione di molecole e farmaci epatotossici o nefrotossici da banco.",
    interconnessione: "Se i reni e il fegato non riescono a filtrare le scorie biologiche, i prodotti azotati e gli elettroliti sballati intossicano direttamente il cuore e il sistema nervoso, provocando aritmie e crisi ipertensive (Parametri Vitali)."
  },
  {
    id: 3,
    title: "Lo Stato Infiammatorio, Immunitario & Onco-Biologia",
    valore: "La mappa delle difese biologiche, dell'infiammazione silente e dei marcatori di proliferazione cellulare.",
    obiettivo: "Riconoscimento precoce di processi flogistici occulti, deficit immunitari, malattie autoimmuni e screening oncologico.",
    urgenza: "🟡 Urgenza Medio-Alta (Indica una minaccia attiva che va spenta prima che faccia danni permanenti).",
    urgenzaTag: "Urgenza Medio-Alta",
    urgenzaDesc: "Rileva infezioni batteriche fulminanti, autoimmunità sistemica o proliferazioni clonali cellulari.",
    urgenzaBadgeColor: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    punti: [
      {
        t: "Formula Leucocitaria Completa (WBC, Neutrofili, Linfociti, Monociti, Eosinofili, Basofili)",
        d: "Esercito immunitario cellulare contro batteri, virus, parassiti e microrganismi.",
        icon: "🛡️",
        seAlti: "WBC >100.000 o forme immature: leucemia mieloide/linfatica. Neutrofilia: infezione batterica purulenta. Eosinofilia: allergie severe o parassitosi.",
        seBassi: "Leucopenia e Neutropenia (<1000/μL): grave immunocompromissione con rischio di sepsi batteriche opportunistiche fatali."
      },
      {
        t: "Flogosi Sistemica & Sepsi Batterica (hs-PCR, VES, Procalcitonina PCT)",
        d: "Proteine di fase acuta e indicatore ultra-specifico di batteriemia sistemica.",
        icon: "🔥",
        seAlti: "Procalcitonina >2 ng/mL + hs-PCR altissima: Sepsi batterica generalizzata ad altissimo rischio di shock settico. VES alta: infiammazione cronica attiva.",
        seBassi: "Livelli ottimali escludono flogosi sistemica attiva e infezioni batteriche invasive in corso."
      },
      {
        t: "Screening Autoimmunità (ANA, ENA, Anti-dsDNA, Fattore Reumatico, Anti-CCP, C3/C4)",
        d: "Autoanticorpi diretti contro il proprio nucleo, articolazioni, DNA e consumo del complemento.",
        icon: "⚔️",
        seAlti: "ANA + Anti-dsDNA positivi con C3/C4 bassi: Lupus Eritematoso Sistemico attivo. Anti-CCP e FR alti: Artrite Reumatoide erosiva.",
        seBassi: "Assenza di reattività autoimmune e corretta tolleranza del sistema immunitario verso i tessuti self."
      },
      {
        t: "Immunoglobuline e Atopia (IgA, IgG, IgM, IgE Totali PRIST)",
        d: "Anticorpi umorali plasmatici e predisposizione alle reazioni allergiche immediate.",
        icon: "🦠",
        seAlti: "IgE molto alte: stato atopico severo, asma bronchiale, rischio anafilassi. Picco monoclonale di IgG/IgA: gammopatia monoclonale o mieloma multiplo.",
        seBassi: "Ipogammaglobulinemia congenita o secondaria, con infezioni respiratorie ricorrenti recidivanti."
      },
      {
        t: "Onco-Biologia & Marcatori Tumorali Sanguigni (PSA, CEA, CA 19-9, CA 15-3, CA 125, AFP)",
        d: "Glicoproteine e antigeni tumorali utilizzati per monitoraggio e supporto diagnostico d'organo.",
        icon: "🎯",
        seAlti: "PSA libero/totale <15%: sospetto adenocarcinoma prostatico. CA 19-9: vie biliari/pancreas. CA 125: ovaio. AFP: epatocarcinoma o tumori germinali.",
        seBassi: "Valori nei limiti attesi per la popolazione sana di riferimento (non escludono neoplasie precoci)."
      },
      {
        t: "[Fluidi Corporei ed Escrezioni] Screening Gastrico ed Intestinale",
        d: "Calprotectina fecale per infiammazione di barriera, sangue occulto.",
        icon: "💩"
      },
      {
        t: "[Diagnostica per Immagini] Ecografia Linfonodale",
        d: "Morfologia delle stazioni linfatiche superficiali.",
        icon: "🔊"
      },
      {
        t: "[Diagnostica per Immagini] Radiologia Digitale del Torace",
        d: "RX Torace per addensamenti infiammatori/parenchimali.",
        icon: "🩻"
      },
      {
        t: "[Esame Obiettivo / Valutazione Clinica] Esame dei Riflessi e Neurologia di Base",
        d: "Reattività pupillare, stabilità motoria e risposte agli stimoli per escludere neuro-infiammazione.",
        icon: "👁️"
      }
    ],
    allarmi: "Febbre persistente con brividi scuotenti, linfoadenopatia (linfonodi ingrossati non dolenti), dolori articolari mattutini con rigidità prolungata, perdita di peso rapida inspiegabile, sudorazioni notturne profuse. Linfonodi reattivi con perdita dell'ilo o tumefatti alla sonda, picchi di calprotectina fecale (disbiosi grave/MICI), opacità/addensamenti all'RX torace, asimmetria dei riflessi o risposte rallentate.",
    cause: "Focolai infettivi non drenati, disbiosi intestinale con traslocazione batterica, malattie reumatologiche croniche, patologie ematologiche mieloproliferative, neoplasie occulte.",
    consigli: "Consulto reumatologico o infettivologico d'urgenza, emocolture in picco febbrile, ecografia delle stazioni linfonodali ed elettroforesi sieroproteica capillare. Integrazione mirata per il microbiota intestinale, protocolli nutrizionali anti-infiammatori (Omega-3).",
    interconnessione: "Un'infiammazione silente (hs-PCR) mantenuta alta nel tempo accelera l'aterosclerosi nei vasi (Parametri Metabolici), logora la barriera glomerulare renale (Funzionalità d'Organo) e predispone a crisi vascolari improvvise (Parametri Vitali)."
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
    titolo: "Aterosclerosi Accelerata & Rischio Ictus Ischemico",
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
  },
  {
    id: "cid_coagulazione_disseminata",
    titolo: "Coagulazione Intravascolare Disseminata (CID) & Crisi Trombo-Emorragica",
    sottotitolo: "Incrocio Critico: PT/INR Prolungato + aPTT Lungo + Piastrine Basse + Fibrinogeno Basso + D-Dimero Altissimo",
    urgenza: "🔴 Emergenza Rianimatoria Massima",
    rischioColore: "border-red-500/50 bg-red-500/10",
    parametriCoinvolti: [
      { nome: "PT / INR e aPTT", categoria: "Parametri Vitali", icon: "🩸" },
      { nome: "Piastrine (PLT)", categoria: "Funzionalità d'Organo", icon: "🩹" },
      { nome: "Fibrinogeno Plasmarico", categoria: "Parametri Vitali", icon: "🧬" },
      { nome: "D-Dimero di Degradazione", categoria: "Parametri Vitali", icon: "⚡" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Iperattivazione e Formazione Microtrombi",
        descrizione: "Un fattore scatenante (sepsi, politrauma o neoplasia) rilascia fattore tessutale in circolo, avviando una cascata coagulativa incontrollata con milioni di micro-trombi nei capillari periferici.",
        badge: "Microangiopatia Trombotica",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Consumo Massivo dei Fattori (Coagulopatia da Consumo)",
        descrizione: "Tutte le scorte disponibili di piastrine e fibrinogeno vengono rapidamente esaurite. Il fegato non riesce a reintegrarle a tempo di record.",
        badge: "Deplezione Piastrinica",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Sindrome Emorragica Paradosso & D-Dimero a Picco",
        descrizione: "La contemporanea iperfibrinolisi secondaria produce frammenti D-Dimero altissimi, mentre il paziente manifesta emorragie diffuse incontrollate cutanee, mucose e viscerali.",
        badge: "Shock Emorragico",
        badgeColor: "bg-rose-500/30 text-rose-300 border-rose-500/40"
      }
    ],
    conseguenzaClinica: "Insufficienza multiorgano (MOF), shock ipovolemico emorragico ed ischemia tissutale diffusa con altissima mortalità se non trattata tempestivamente in terapia intensiva.",
    indicazioniMediche: "Ospedalizzazione immediata in rianimazione: trasfusione urgente di plasma fresco congelato, concentrati piastrinici, crioprecipitati e rimozione della causa primaria scatenante."
  },
  {
    id: "rabdomiolisi_danno_renale",
    titolo: "Rabdomiolisi Acuta & Sovraccarico Mioglobinurico Renale",
    sottotitolo: "Incrocio: CK Totale > 10.000 U/L + Mioglobina Alta + Creatinina Alta + Iperpotassiemia (K+)",
    urgenza: "🔴 Emergenza Tossico-Renale",
    rischioColore: "border-red-500/40 bg-red-500/5",
    parametriCoinvolti: [
      { nome: "Creatinchinasi Totale (CK)", categoria: "Parametri Vitali", icon: "⚡" },
      { nome: "Mioglobina Sierica/Urinaria", categoria: "Parametri Vitali", icon: "🥩" },
      { nome: "Creatinina ed Azotemia", categoria: "Funzionalità d'Organo", icon: "💧" },
      { nome: "Potassio Sierico (K+)", categoria: "Parametri Vitali", icon: "💓" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Lisi Massiva delle Fibre Muscolari",
        descrizione: "A causa di traumi da schiacciamento, sforzi fisici estremi o tossicità farmacologica (es. statine), le membrane delle cellule muscolari si rompono riversando nel sangue enzimi CK, mioglobina e potassio.",
        badge: "Rottura Muscolare",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Ostruzione dei Tubuli Renali (Mioglobinuria)",
        descrizione: "La mioglobina precipita nel lume dei tubuli renali acidi formando cilindri che occludono fisicamente i filtri dei nefroni ed esercitano tossicità citotossica diretta sulle cellule tubulari.",
        badge: "Necrosi Tubulare Acuta",
        badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Insufficienza Renale Acuta & Iperpotassiemia Letale",
        descrizione: "Il filtrato si azzera (oligo-anuria). La mancata escrezione renale di potassio (K+) provoca picchi iperkaliemici acuti con rischio immediato di arresto cardiaco in asistolia o fibrillazione ventricolare.",
        badge: "Arresto Elettrico Cardiaco",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Insufficienza renale acuta oligo-anurica con necrosi tubulare e rischio imminente di morte cardiaca improvvisa per aritmie da iperpotassiemia.",
    indicazioniMediche: "Idratazione endovenosa forzata immediata con soluzione fisiologica e bicarbonato per alcalinizzare le urine; monitoraggio continuo ECG; eventuale emodialisi d'urgenza."
  },
  {
    id: "sepsi_infezione_sistemica",
    titolo: "Sepsi Batterica Sistemica & Tempesta Citochinica Infettiva",
    sottotitolo: "Incrocio: Procalcitonina (PCT) > 2 ng/mL + hs-PCR Altissima + Leucocitosi Neutrofila Severa",
    urgenza: "🔴 Pericolo Infettivo Sistemico",
    rischioColore: "border-red-500/40 bg-red-500/5",
    parametriCoinvolti: [
      { nome: "Procalcitonina (PCT)", categoria: "Stato Infiammatorio", icon: "🔥" },
      { nome: "Proteina C-Reattiva (hs-PCR)", categoria: "Stato Infiammatorio", icon: "🧪" },
      { nome: "Formula Neutrofila (WBC)", categoria: "Stato Infiammatorio", icon: "🛡️" },
      { nome: "Pressione & Lattati", categoria: "Parametri Vitali", icon: "🩺" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Invasione Batterica e Risposta Disregolata",
        descrizione: "I batteri superano le barriere epiteliali ed entrano nel torrente circolatorio. I monociti e i macrofagi rilasciano massicce quantità di TNF-alfa, IL-1 e IL-6.",
        badge: "Batteriemia Invasiva",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Sindrome da Risposta Infiammatoria Sistemica (SIRS)",
        descrizione: "La PCR e la Procalcitonina schizzano a livelli vertiginosi. L'endotelio di tutti i vasi si vasodilata provocando permeabilità capillare generalizzata e ipotensione.",
        badge: "Vasodilatazione Sistemica",
        badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Shock Settico & Crollo della Perfusione Tessutale",
        descrizione: "La pressione arteriosa crolla al di sotto della soglia di autoregolazione cerebrale e renale; i livelli di lattato aumentano per ipossia anaerobica cellulare (Shock Settico).",
        badge: "Shock Settico",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Shock settico distributivo refrattario, ipoperfusione tissutale sistemica, acidosi lattica e collasso multiorgano.",
    indicazioniMediche: "Inizio immediato entro la prima ora di terapia antibiotica empirica ad ampio spettro per via endovenosa, riempimento volemico con cristalloidi e supporto con amine vasopressorie (noradrenalina)."
  },
  {
    id: "anemia_sideropenica_multiorgano",
    titolo: "Anemia Sideropenica Severa & Ipossia Tissutale Multiorgano",
    sottotitolo: "Incrocio: Emoglobina Bassa + Sideremia Bassa + Ferritina Depauperata + Transferrina Alta + MCV Basso",
    urgenza: "🟠 Sofferenza Ipossica Cronica",
    rischioColore: "border-orange-500/40 bg-orange-500/5",
    parametriCoinvolti: [
      { nome: "Emoglobina (Hb) & MCV", categoria: "Funzionalità d'Organo", icon: "🩸" },
      { nome: "Ferritina Sierica", categoria: "Funzionalità d'Organo", icon: "🔩" },
      { nome: "Sideremia & Transferrina", categoria: "Funzionalità d'Organo", icon: "🔬" },
      { nome: "Frequenza Cardiaca (BPM)", categoria: "Parametri Vitali", icon: "💓" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Esaurimento delle Riserve (Ferritina Bassa)",
        descrizione: "Le perdite ematiche croniche (cicli abbondanti, lesioni occulte intestinali) svuotano i depositi di ferritina nel fegato e nel midollo osseo, mentre il ferro circolante comincia a calare.",
        badge: "Carenza Latente",
        badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Eritropoiesi Carenziale (Microcitosi)",
        descrizione: "Il midollo produce globuli rossi sempre più piccoli (MCV basso) e poco colorati (ipocromici). L'emoglobina totale scende sotto la soglia di sicurezza fisiologica.",
        badge: "Microcitosi & Ipocromia",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Compenso Emodinamico & Ipertrofia Cardiaca",
        descrizione: "Per mantenere ossigenati gli organi nobili (cervello e reni), il cuore accelera il battito aumentando la gittata. A lungo andare si sviluppa cardiomegalia e insufficienza cardiaca ad alta gittata.",
        badge: "Sovraccarico Cardiaco",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Ipossia cerebrale cronica (cefalea, astenia invalidante, vertigini), ridotta immunità cellulare e cardiomiopatia dilatativa da compenso anemico.",
    indicazioniMediche: "Ricerca immediata della sede di perdita ematica (sangue occulto nelle feci, esofagogastroduodenoscopia, colonscopia, ecografia pelvica), terapia marziale orale o endovenosa protetta."
  },
  {
    id: "tiroide_tempesta_tireotossica",
    titolo: "Crisi Tireotossica Autoimmune & Sovraccarico Cardiovascolare",
    sottotitolo: "Incrocio: TSH Azzerato + FT3/FT4 Elevati + Anticorpi TRAb Positivi + Tachiaritmia",
    urgenza: "🟠 Urgenza Endocrino-Cardiaca",
    rischioColore: "border-orange-500/40 bg-orange-500/5",
    parametriCoinvolti: [
      { nome: "TSH ed Ormoni Liberi (FT3/FT4)", categoria: "Parametri Metabolici", icon: "🦋" },
      { nome: "Anticorpi Anti-Recettore TSH (TRAb)", categoria: "Stato Infiammatorio", icon: "⚔️" },
      { nome: "Frequenza Cardiaca & Ritmo", categoria: "Parametri Vitali", icon: "💓" },
      { nome: "Pressione Sistolica Differenziale", categoria: "Parametri Vitali", icon: "🩺" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Stimolazione Autoimmune Incessante",
        descrizione: "Gli autoanticorpi TRAb si legano stabilmente ai recettori del TSH sulla tiroide simulandone l'azione e forzando la ghiandola a secernere ormoni FT3 ed FT4 senza sosta.",
        badge: "Stimolazione Recettoriale",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Iperattivazione Simpatica & Tireotossicosi",
        descrizione: "Gli ormoni tiroidei aumentano esponenzialmente la sensibilità dei recettori beta-adrenergici del cuore alle catecolamine: insorgono tachicardia a riposo (>110 bpm), tremori e dimagrimento rapido.",
        badge: "Tireotossicosi Clinica",
        badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Fibrillazione Atriale & Tempesta Tiroidea",
        descrizione: "L'atrio cardiaco sovraccaricato va incontro a fibrillazione atriale con alto rischio cardioembolico cerebrale; in casi estremi si innesca la letale tempesta tiroidea con ipertermia maligna.",
        badge: "Fibrillazione Atriale",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Fibrillazione atriale parossistica o permanente ad alta risposta ventricolare, scompenso cardiaco ad alta portata e tireotossicosi acuta con ipertermia e psicosi.",
    indicazioniMediche: "Blocco della conversione periferica e della sintesi con tireostatici (Metimazolo/PTU), beta-bloccanti cardioselettivi (Propranololo/Atenololo) e monitoraggio ecocardiografico."
  },
  {
    id: "sindrome_metabolica_tripla",
    titolo: "Sindrome Metabolica Tripla & Aterotrombosi Coronarica Silente",
    sottotitolo: "Incrocio: Trigliceridi > 150 mg/dL + Colesterolo HDL < 40 + Glicemia a Digiuno > 100 + Pressione Alta",
    urgenza: "🟠 Rischio Cardiovascolare Triplicato",
    rischioColore: "border-orange-500/40 bg-orange-500/5",
    parametriCoinvolti: [
      { nome: "Trigliceridi e Colesterolo HDL", categoria: "Parametri Metabolici", icon: "🧬" },
      { nome: "Glicemia a Digiuno ed HOMA-IR", categoria: "Parametri Metabolici", icon: "🍬" },
      { nome: "Pressione Arteriosa", categoria: "Parametri Vitali", icon: "🩺" },
      { nome: "Grasso Viscerale", categoria: "Parametri Metabolici", icon: "⚖️" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Insulino-Resistenza Epatica & Muscolare",
        descrizione: "L'eccesso calorico e la carenza di attività fisica saturano i recettori insulinici. Il fegato reagisce sintetizzando quantità esagerate di lipoproteine ricche di trigliceridi (VLDL).",
        badge: "Insulino-Resistenza",
        badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Triade Lipidica Aterogena & Rigidità Arteriosa",
        descrizione: "I trigliceridi alti riducono il colesterolo buono HDL e trasformano il colesterolo LDL in particelle piccole e dense altamente permeabili e ossidabili nella tunica intima dei vasi sanguigni.",
        badge: "Dislipidemia Mista",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Trombofilia Endoteliale & Ischemia Silente",
        descrizione: "L'iperglicemia e l'ipertensione concomitanti inibiscono la sintesi di ossido nitrico (NO) e aumentano il PAI-1, rendendo il sangue denso e predisposto a occlusioni coronariche improvvise.",
        badge: "Cardiopatia Ischemica",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Aumento di 3-5 volte del rischio relativo di infarto miocardico acuto, coronaropatia multivasale e diabete di tipo 2 conclamato.",
    indicazioniMediche: "Modifica radicale dello stile di vita (dieta mediterranea ipocalorica, camminata veloce 150 min/settimana), statine a bersaglio LDL < 70 mg/dL e sensibilizzanti all'insulina (metformina)."
  }
];

export const DOMINO_EFFECT_STEPS = [
  {
    step: 1,
    titolo: "1. Scintilla Metabolica",
    descrizione: "L'eccesso di zuccheri o l'accumulo di grasso viscerale (valutato tramite antropometria ed ecografia) manda le cellule in stress energetico.",
    icon: "🍬",
    color: "from-emerald-500 to-teal-500",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10"
  },
  {
    step: 2,
    titolo: "2. Incendio Infiammatorio",
    descrizione: "Lo stress metabolico attiva i globuli bianchi, innalza la Proteina C-Reattiva e la calprotectina fecale, creando un'infiammazione cronica nascosta.",
    icon: "🔥",
    color: "from-yellow-500 to-amber-500",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10"
  },
  {
    step: 3,
    titolo: "3. Logoramento Filtri",
    descrizione: "L'infiammazione e le tossine bombardano fegato e reni, alterando l'esame delle urine e la struttura parenchimale visibile in ecografia e gastroscopia.",
    icon: "🧪",
    color: "from-amber-500 to-orange-500",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10"
  },
  {
    step: 4,
    titolo: "4. Crollo di Emergenza",
    descrizione: "Con i filtri d'organo sovraccarichi e i vasi irrigiditi (placche al Doppler), il cuore va in sofferenza elettrica (anomalie all'ECG) e la pressione all'Holter schizza fuori controllo.",
    icon: "💓",
    color: "from-red-500 to-rose-600",
    border: "border-red-500/30",
    bg: "bg-red-500/10"
  }
];
