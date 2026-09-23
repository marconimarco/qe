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
  },
  {
    id: 4,
    title: "Monitoraggio Carico di Lavoro, Sensori IMU & Biomeccanica Wearable (Smartwatch)",
    valore: "La quantificazione precisa del carico cinematico, dello stress muscoloscheletrico e della prevenzione infortuni via telemetria smartwatch.",
    obiettivo: "Prevenzione di sovrallenamento, lesioni miotendinee e rotture legamentose tramite incrocio di accelerometria, giroscopio, impatti tibiali e ratio ACWR.",
    urgenza: "🟡 Urgenza Dinamico-Traumatologica (Prevenzione attiva di infortuni da sovraccarico).",
    urgenzaTag: "Urgenza Dinamica Wearable",
    urgenzaDesc: "Se alterati o sbilanciati, i carichi meccanici innescano microfratture, periostite, cedimenti legamentosi ed esaurimento sistemico.",
    urgenzaBadgeColor: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    punti: [
      {
        t: "ACWR (Acute-to-Chronic Workload Ratio)",
        d: "Rapporto tra il carico di lavoro recente (acuto, 7 giorni) e il carico abituale (cronico, 28 giorni). Range 'Sweet Spot' ottimale: 0.8 - 1.3.",
        icon: "📊",
        seAlti: "ACWR >1.5: 'Danger Zone', rischio di infortunio muscoloscheletrico triplicato per spike di carico improvviso.",
        seBassi: "ACWR <0.8: 'Under-training', decondizionamento dei tessuti e vulnerabilità ai carichi futuri."
      },
      {
        t: "Carico Cumulativo (Cumulative Workload)",
        d: "Stress meccanico totale accumulato dall'atleta in giorni o settimane (espresso in Arbitrary Units AU).",
        icon: "📈",
        seAlti: "Sovraccarico cronico, esaurimento della sintesi del collagene e rischio di tendinopatia cronica o overtraining.",
        seBassi: "Volume insufficiente per mantenere gli adattamenti aerobici e neuromuscolari."
      },
      {
        t: "Carico Meccanico (Mechanical Load)",
        d: "Quantificazione delle forze fisiche esterne subite dall'apparato muscoloscheletrico ad ogni passo o impatto (kJ o AU).",
        icon: "⚙️",
        seAlti: "Forze d'impatto distruttive sul sistema osseo-cartilagineo, micro-lesioni sarcolemmali e rischio di rabdomiolisi.",
        seBassi: "Carico meccanico protettivo o rigenerativo a basso impatto articolare."
      },
      {
        t: "IMU (Inertial Measurement Units) & Stato Sensori",
        d: "Gruppo di sensori inerziali ad alta frequenza (100-200 Hz) che traccia il corpo in 3D nello spazio.",
        icon: "📡",
        seAlti: "Alta fedeltà di campionamento e tracciamento millimetrico.",
        seBassi: "Perdita di pacchetti o drift inerziale da ricalibrare."
      },
      {
        t: "Accelerometro Triassiale (Accelerometer Peak)",
        d: "Misurazione delle accelerazioni e decelerazioni brusche sui tre assi ortogonali (X, Y, Z).",
        icon: "⚡",
        seAlti: "Picchi di decelerazione violenti (>6g) correlati a elevato stress sui legamenti crociati.",
        seBassi: "Movimento fluido e assorbimento controllato dell'energia cinetica."
      },
      {
        t: "Giroscopio (Gyroscope Angular Velocity)",
        d: "Sensore che misura la velocità angolare e l'orientamento dei segmenti corporei (deg/s).",
        icon: "🔄",
        seAlti: "Instabilità torsionale, valgismo dinamico del ginocchio o rotazione anomala della caviglia.",
        seBassi: "Stabilità multiassiale e perfetto allineamento cinematico."
      },
      {
        t: "Impatti Ossei / Tibia (Tibial Impacts Force)",
        d: "Forza d'urto meccanica registrata sui segmenti ossei ad ogni appoggio (g-force).",
        icon: "💥",
        seAlti: "Impatti >11g: pericolo imminente di periostite tibiale e fratture da stress.",
        seBassi: "Forze d'urto ammortizzate fisiologicamente (<8g)."
      },
      {
        t: "Velocità & Distanza Percorsa",
        d: "Tasso di spostamento, rapidità del gesto atletico (km/h) e volume totale dello spostamento (km).",
        icon: "🏃",
        seAlti: "Velocità elevata con volume esteso: richiede massimo dispendio energetico e recupero prolungato.",
        seBassi: "Ritmo di rigenerazione o deambulazione standard."
      },
      {
        t: "Passi & Cadenza (Steps & Cadence)",
        d: "Conteggio e frequenza dei passi eseguiti (passi totali e cadenza passi al minuto spm).",
        icon: "👟",
        seAlti: "Oltre 20.000 passi: sovraccarico fasciale plantare e rischio tendinite achillea se la cadenza è bassa.",
        seBassi: "Sedentarietà (<5.000 passi) o fase di riposo clinico."
      },
      {
        t: "Alterazioni Biomeccaniche & Asimmetrie (AI Biomechanical Alterations)",
        d: "Asimmetrie tra lato destro e sinistro, variazioni della postura o dell'appoggio rilevate dall'algoritmo.",
        icon: "⚖️",
        seAlti: "Asimmetria >8-10%: indice evidente di compenso per micro-dolore o deficit propriocettivo.",
        seBassi: "Simmetria bilaterale ideale (<5% di deviazione tra gli arti)."
      },
      {
        t: "Indice di Fatica (Fatigue Index)",
        d: "Decadimento e perdita progressiva di efficienza del gesto atletico nel corso della sessione (%).",
        icon: "📉",
        seAlti: "Fatica >65%: cedimento neuromuscolare e incapacità di stabilizzare le articolazioni.",
        seBassi: "Efficienza neuromuscolare brillante e resistenza alla fatica ottimale."
      },
      {
        t: "Segnale Sentinella / Luce Gialla (Sentinel Signal)",
        d: "Deviazione statistica dal comportamento cinematico abituale prima dell'esordio del sintomo doloroso.",
        icon: "🟡",
        seAlti: "Luce Gialla o Rossa: allarme precoce di sovraccarico che anticipa la lesione clinica.",
        seBassi: "Luce Verde: cinematica coerente con lo storico dell'atleta."
      },
      {
        t: "Infortuni Muscoloscheletrici (Musculoskeletal Injuries Outcome)",
        d: "Dato clinico di tracciamento dell'evento lesivo da incrociare con la cronologia del carico e delle metriche.",
        icon: "🩹",
        seAlti: "Lesioni miotendinee o distorsioni attive che impongono riabilitazione guidata.",
        seBassi: "Assenza di lesioni pregresse o attive."
      }
    ],
    allarmi: "Spike improvviso di ACWR (>1.5), impatti tibiali superiori a 12g, comparsa del Segnale Sentinella (Luce Gialla), asimmetria tra gli arti superiore al 10%, indice di fatica >70% nei cambi di direzione.",
    cause: "Aumento troppo rapido del volume d'allenamento, scarpe scariche, terreno rigido, calo della reattività neuromuscolare per deprivazione di sonno o disidratazione.",
    consigli: "Programmazione rigorosa del carico con regola del 10% settimanale; esercizi di potenziamento eccentrico per tendini e polpacci; test periodici su pedana baropodometrica; de-escalation tempestiva alla comparsa della Luce Gialla.",
    interconnessione: "Il sovraccarico biomeccanico attiva mediatori infiammatori sistemici (hs-PCR e citochine) che aumentano la viscosità ematica e il carico cardiaco, oltre a rischiare rabdomiolisi da sforzo e sofferenza renale."
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
  },
  {
    id: "pancreatite_ipertrigliceridemia",
    titolo: "Pancreatite Acuta Necrotizzante da Ipertrigliceridemia & Lipotossicità",
    sottotitolo: "Incrocio: Trigliceridi > 500-1000 mg/dL + Lipasi/Amilasi Elevate + Acidosi Metabolica",
    urgenza: "🔴 Emergenza Addomino-Vascolare",
    rischioColore: "border-red-500/40 bg-red-500/5",
    parametriCoinvolti: [
      { nome: "Trigliceridi Sierici", categoria: "Parametri Metabolici", icon: "🧬" },
      { nome: "Lipasi ed Amilasi Pancreatica", categoria: "Funzionalità d'Organo", icon: "🔥" },
      { nome: "Proteina C-Reattiva (hs-PCR)", categoria: "Stato Infiammatorio", icon: "🧪" },
      { nome: "Calcio Sierico (Ca++)", categoria: "Parametri Vitali", icon: "💧" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Idrolisi Lipasica Tossica & Acidi Grassi Liberi",
        descrizione: "L'eccesso massivo di trigliceridi viene parzialmente scisso dalla lipasi endoteliale e pancreatica in acidi grassi liberi (FFA) non esterificati a concentrazioni citotossiche.",
        badge: "Lipotossicità Capillare",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Microtrombosi Capillare & Autodigestione Pancreatica",
        descrizione: "Gli acidi grassi liberi scatenano ischemia microvascolare nel parenchima del pancreas e attivano prematuramente il tripsinogeno in tripsina attiva all'interno degli acini ghiandolari.",
        badge: "Autodigestione Ghiandolare",
        badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Necrosi Pancreatica, Ipocalcemia & SIRS Sistemica",
        descrizione: "La saponificazione dei grassi peripancreatici consuma calcio (ipocalcemia severa) e la lipasi schizza a valori vertiginosi innescando una sindrome da risposta infiammatoria sistemica.",
        badge: "Necrosi & Shock",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Pancreatite acuta severa necrotizzante con versamento peripancreatico, ipocalcemia tetanica e rischio di insufficienza multiorgano (MOF).",
    indicazioniMediche: "Ricovero immediato con digiuno assoluto, infusione continua di insulina per stimolare la lipoproteinlipasi endoteliale, idratazione aggressiva endovenosa e plasmaferesi se trigliceridi > 1000 mg/dL."
  },
  {
    id: "iperuricemia_gotta_nefropatia",
    titolo: "Nefropatia Uratica Ostruente, Iperuricemia & Artrite Gottosa",
    sottotitolo: "Incrocio: Acido Urico Alto (>7 mg/dL) + eGFR in Declino + Creatinina Alta + Infiammazione (VES/PCR)",
    urgenza: "🟠 Rischio Reumato-Renale",
    rischioColore: "border-orange-500/40 bg-orange-500/5",
    parametriCoinvolti: [
      { nome: "Acido Urico Sierico", categoria: "Parametri Metabolici", icon: "💎" },
      { nome: "Creatinina ed eGFR", categoria: "Funzionalità d'Organo", icon: "💧" },
      { nome: "VES ed hs-PCR", categoria: "Stato Infiammatorio", icon: "🔥" },
      { nome: "Pressione Arteriosa", categoria: "Parametri Vitali", icon: "🩺" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Sovrasaturazione Sierica di Urato Monosodico",
        descrizione: "L'iperuricemia cronica (dovuta a dieta purinica, alcol, sindrome metabolica o ridotta escrezione) supera la soglia di solubilità tissutale di 6.8 mg/dL.",
        badge: "Sovrasaturazione Uratica",
        badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Precipitazione Intratubulare & Attivazione dell'Inflammasoma",
        descrizione: "I cristalli aghiformi di urato precipitano nei tubuli renali e nelle articolazioni, innescando il recettore NLRP3 e richiamando cascate flogistiche di interleuchina IL-1β.",
        badge: "Precipitazione a Cristalli",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Fibrosi Interstiziale Renale & Crisi Artritica Infiammatoria",
        descrizione: "L'infiammazione tubulo-interstiziale cronica riduce l'eGFR e accelera l'ipertensione nefrovascolare, accompagnata da tofi gottosi erosivi dolorosissimi.",
        badge: "Fibrosi Tubulare & Gotta",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Insufficienza renale cronica progressiva da nefropatia uratica, calcolosi radio-trasparente delle vie urinarie e artropatia gottosa distruttiva.",
    indicazioniMediche: "Idratazione abbondante (almeno 2-2.5L die), alcalinizzazione delle urine con citrato di potassio, inibitori della xantina ossidasi (allopurinolo o febuxostat) e dieta a basso contenuto di purine e fruttosio."
  },
  {
    id: "diabete_microangiopatia_nefropatia",
    titolo: "Nefropatia Diabetica & Microangiopatia Capillare Renale-Retinica",
    sottotitolo: "Incrocio: HbA1c > 7.5% + Microalbuminuria / eGFR Depresso + Ipertensione Glomerulare",
    urgenza: "🔴 Compromissione Nefronica Severa",
    rischioColore: "border-red-500/40 bg-red-500/5",
    parametriCoinvolti: [
      { nome: "Emoglobina Glicata (HbA1c)", categoria: "Parametri Metabolici", icon: "🍬" },
      { nome: "Microalbuminuria / Esame Urine", categoria: "Funzionalità d'Organo", icon: "🧪" },
      { nome: "Creatinina ed eGFR", categoria: "Funzionalità d'Organo", icon: "💧" },
      { nome: "Pressione Sistolica Differenziale", categoria: "Parametri Vitali", icon: "🩺" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Iperfiltrazione e Glicazione dei Podociti",
        descrizione: "L'iperglicemia cronica determina vasodilatazione dell'arteriola afferente renale provocando ipertensione capillare nei glomeruli e depositi di prodotti AGE.",
        badge: "Iperfiltrazione Glomerulare",
        badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Microalbuminuria & Ispessimento della Membrana Basale",
        descrizione: "La barriera di filtrazione perde le cariche negative proteiche: compare microalbuminuria nelle urine e comincia una progressiva glomerulosclerosi (lesioni di Kimmelstiel-Wilson).",
        badge: "Albuminuria Patologica",
        badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Sindrome Nefrosica & Declino Terminale dell'eGFR",
        descrizione: "La filtrazione crolla (eGFR < 45 mL/min), subentrano edemi declivi marcati, macro-proteinuria e ipertensione arteriosa refrattaria di origine renale.",
        badge: "Glomerulosclerosi Avanzata",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Insufficienza renale terminale uremica con necessità di dialisi o trapianto renale, associata a retinopatia diabetica proliferante.",
    indicazioniMediche: "Controllo glicemico rigoroso (SGLT2-inibitori nefroprotettivi), blocco del sistema renina-angiotensina con ACE-inibitori o sartanici (ARB) per ridurre la pressione intraglomerulare."
  },
  {
    id: "ipercalcemia_aritmia_calcoli",
    titolo: "Crisi Ipercalcemica, Accorciamento del QT & Litiasi Renale",
    sottotitolo: "Incrocio: Calcio Sierico (Ca++) > 10.8 mg/dL + Paratormone (PTH) / Vitamina D + Alterazioni ECG",
    urgenza: "🟠 Urgenza Elettrolitica & Ritmica",
    rischioColore: "border-orange-500/40 bg-orange-500/5",
    parametriCoinvolti: [
      { nome: "Calcio Sierico (Ca++)", categoria: "Funzionalità d'Organo", icon: "💧" },
      { nome: "Vitamina D e PTH", categoria: "Parametri Metabolici", icon: "☀️" },
      { nome: "Tracciato ECG / Intervallo QT", categoria: "Parametri Vitali", icon: "⚡" },
      { nome: "Creatinina ed Azotemia", categoria: "Funzionalità d'Organo", icon: "🔬" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Sovraccarico Osteoclastico o Iperassorbimento di Calcio",
        descrizione: "Un iperparatiroidismo primitivo, un'intossicazione da vitamina D o un'ipercalcemia neoplastica aumentano la concentrazione ionizzata di calcio nel siero extracellulare.",
        badge: "Ipercalcemia Sierica",
        badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Accorciamento dell'Intervallo QT & Diabete Insipido Nefrogenico",
        descrizione: "Il calcio in eccesso altera i canali ionici miocardici accorciando il potenziale d'azione ventricolare e blocca i recettori dell'aquaporina renale provocando poliuria e disidratazione.",
        badge: "Accorciamento QT ECG",
        badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Nefrocalcinosi, Blocco Renale & Aritmie Ventricolari Gravi",
        descrizione: "I sali di calcio precipitano nei tubuli renali (nefrocalcinosi parenchimale), la filtrazione renale collassa e insorgono aritmie cardiache da instabilità elettrica.",
        badge: "Nefrocalcinosi & Aritmia",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Insufficienza renale acuta parenchimale, arresto cardiaco aritmico ventricolare, letargia mentale e coma ipercalcemico.",
    indicazioniMediche: "Idratazione forzata immediata con soluzione fisiologica 0.9%, bifosfonati endovenosi (acido zoledronico) o denosumab, sospensione di integratori di calcio/vitamina D ed ECG continuo."
  },
  {
    id: "ipertrofia_cardiaca_scompenso_bnp",
    titolo: "Sovraccarico Emodinamico Ventricolare & Edema Polmonare",
    sottotitolo: "Incrocio: Pressione Sistolica > 160 mmHg + NT-proBNP Elevato + Frequenza Elevata / Dispnea",
    urgenza: "🔴 Emergenza Cardio-Respiratoria",
    rischioColore: "border-red-500/40 bg-red-500/5",
    parametriCoinvolti: [
      { nome: "NT-proBNP / BNP", categoria: "Parametri Vitali", icon: "⚡" },
      { nome: "Pressione Arteriosa Sistolica", categoria: "Parametri Vitali", icon: "🩺" },
      { nome: "Saturazione di Ossigeno (SpO2)", categoria: "Parametri Vitali", icon: "🫁" },
      { nome: "Frequenza Cardiaca (BPM)", categoria: "Parametri Vitali", icon: "💓" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Post-carico Eccessivo & Ipertrofia Miocardica Concentrica",
        descrizione: "L'ipertensione arteriosa cronica non trattata forza il ventricolo sinistro a generare pressioni elevate, ispessendo le pareti muscolari a scapito dell'elasticità.",
        badge: "Ipertrofia Ventricolare",
        badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Disfunzione Diastolica & Rilascio di NT-proBNP",
        descrizione: "Il ventricolo non riesce a distendersi nella diastole. La tensione di parete intracardiaca schizza in alto, inducendo i miociti a secernere NT-proBNP nel circolo ematico.",
        badge: "Picco Peptidi Natriuretici",
        badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Congestione Polmonare Retrograda & Edema Acuto",
        descrizione: "La pressione si trasmette all'atrio sinistro e ai capillari polmonari: il liquido trasuda negli alveoli causando dispnea ingravescente, tosse schiumosa e desaturazione (SpO2 < 90%).",
        badge: "Edema Polmonare Acuto",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Insufficienza cardiaca acuta a frazione d'eiezione preservata/ridotta (HFpEF/HFrEF), edema polmonare cardiogeno e ipossia sistemica.",
    indicazioniMediche: "Valutazione cardiologica urgente: diuretici dell'ansa per via endovenosa (furosemide), vasodilatatori venosi/arteriosi (nitrati), supporto CPAP respiratorio e titolazione ARNI/beta-bloccanti."
  },
  {
    id: "autoimmunita_tiroide_flogosi_poliglandolare",
    titolo: "Tiroidite Autoimmune Silente (Hashimoto) & Flogosi Vascolare Reattiva",
    sottotitolo: "Incrocio: TSH Elevato + Colesterolo LDL Alto + Anticorpi Autoimmuni (ANA/TRAb) + hs-PCR Mossa",
    urgenza: "🟠 Rischio Flogistico-Endocrino",
    rischioColore: "border-orange-500/40 bg-orange-500/5",
    parametriCoinvolti: [
      { nome: "TSH ed Ormoni Tiroidei (FT4/FT3)", categoria: "Parametri Metabolici", icon: "🦋" },
      { nome: "Anticorpi Autoimmuni (ANA / Anti-TPO)", categoria: "Stato Infiammatorio", icon: "⚔️" },
      { nome: "Colesterolo LDL e Trigliceridi", categoria: "Parametri Metabolici", icon: "🧬" },
      { nome: "Proteina C-Reattiva (hs-PCR)", categoria: "Stato Infiammatorio", icon: "🔥" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Infiltrazione Linfocitaria Tiroidea Autoimmune",
        descrizione: "Autoanticorpi e linfociti T autoreattivi attaccano i tireociti, riducendo gradualmente la biosintesi degli ormoni tiroidei e inducendo un aumento reattivo del TSH ipofisario.",
        badge: "Infiltrazione Linfocitaria",
        badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Rallentamento della Clearance Epatica del Colesterolo LDL",
        descrizione: "La carenza subclinica di ormoni tiroidei deprime la densità dei recettori epatici per le LDL: i livelli ematici di colesterolo e trigliceridi salgono vertiginosamente.",
        badge: "Ipercolesterolemia Secondaria",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Aterosclerosi Endoteliale & Astenia Polidisregolata",
        descrizione: "La combinazione di dislipidemia persistente e flogosi autoimmune cronica danneggia le coronarie, con astenia invalidante, bradicardia e intolleranza al freddo.",
        badge: "Aterosclerosi & Bradicardia",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Ipotiroidismo conclamato irreversibile con dislipidemia aterogena secondaria grave, versamento pericardico e accelerazione del decadimento cognitivo.",
    indicazioniMediche: "Ecografia tiroidea con color-Doppler, dosaggio anticorpi anti-TPO e anti-Tg, terapia ormonale sostitutiva con levotiroxina titolata sul TSH e monitoraggio dell'assetto lipidico."
  },
  {
    id: "acwr_impatti_frattura_stress",
    titolo: "Spike di Carico (ACWR), Forze d'Impatto & Frattura da Stress Tibiale",
    sottotitolo: "Incrocio: ACWR > 1.5 + Impatti Ossei/Tibia Elevati (>11g) + Alterazioni Biomeccaniche d'Appoggio (>8%)",
    urgenza: "🔴 Allerta Meccanica Ossea Critica",
    rischioColore: "border-red-500/50 bg-red-500/10",
    parametriCoinvolti: [
      { nome: "ACWR (Acute-to-Chronic Workload)", categoria: "Monitoraggio Carico Smartwatch", icon: "📊" },
      { nome: "Impatti Ossei / Tibia (g)", categoria: "Sensori Biomeccanici IMU", icon: "💥" },
      { nome: "Alterazioni Biomeccaniche / Asimmetria", categoria: "Metriche Avanzate AI", icon: "⚖️" },
      { nome: "Carico Meccanico Cumulativo", categoria: "Monitoraggio Carico Smartwatch", icon: "⚙️" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Spike di Carico Improvviso (ACWR Fuori Finestra)",
        descrizione: "Il carico acuto recente supera del 50% il volume cronico di adattamento. L'apparato muscoloscheletrico non ha completato il turnover rigenerativo osseo.",
        badge: "Spike di Volume",
        badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Accumulo Forze d'Impatto & Periostite Reattiva",
        descrizione: "I sensori IMU registrano accelerazioni d'impatto ripetute (>11g) con asimmetria tra arto destro e sinistro: l'osso corticale della tibia si infiamma con edema periostale doloroso.",
        badge: "Stress da Impatto Tibiale",
        badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Frattura da Fatica & Stop Forzato",
        descrizione: "Le microfratture trabecolari si fondono in una rima di frattura da stress sub-corticale con impotenza funzionale immediata e rischio di lesione permanente.",
        badge: "Frattura da Stress",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Frattura da stress della corticale tibiale, periostite invalidante e distacco micro-fasciale con stop agonistico prolungato (60-90 giorni).",
    indicazioniMediche: "Risonanza magnetica (MRI) della tibia mirata per edema intraspongioso; sospensione totale degli impatti; de-escalation dell'ACWR nel range verde (0.8 - 1.2) con lavoro a basso impatto (nuoto/ciclismo)."
  },
  {
    id: "fatica_giroscopio_rottura_lca",
    titolo: "Cedimento Neuromuscolare, Discontrollo Angolare & Rischio Lesione LCA/Menisco",
    sottotitolo: "Incrocio: Indice di Fatica > 65% + Deviazione Angolare Giroscopio + Decadimento Velocità",
    urgenza: "🔴 Allerta Traumatologica Articolare",
    rischioColore: "border-red-500/40 bg-red-500/5",
    parametriCoinvolti: [
      { nome: "Indice di Fatica (AI Synthesized)", categoria: "Metriche Avanzate AI", icon: "📉" },
      { nome: "Giroscopio (Velocità Angolare & Orientamento)", categoria: "Sensori Biomeccanici IMU", icon: "🔄" },
      { nome: "Accelerometro Triassiale (Picco Decelerazione)", categoria: "Sensori Biomeccanici IMU", icon: "⚡" },
      { nome: "Infortuni Muscoloscheletrici Precedenti", categoria: "Esiti Clinici", icon: "🩹" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Fatica Neuromuscolare & Ritardo Elettromiografico",
        descrizione: "L'indice di fatica elevato compromette la reattività dei fusi neuromuscolari. Il tempo di attivazione riflessa dei muscoli stabilizzatori del ginocchio aumenta drasticamente.",
        badge: "Depressione Riflessi",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Instabilità nei Piani di Flesso-Estensione (Giroscopio)",
        descrizione: "Il giroscopio rileva oscillazioni angolari caotiche nei cambi di direzione e salti: si manifesta il valgo dinamico del ginocchio, non più contrastato dai muscoli esausti.",
        badge: "Valgismo Dinamico Anomalo",
        badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Forza di Taglio Eccessiva & Rottura Capsulo-Legamentosa",
        descrizione: "La forza cinetica si scarica interamente sul legamento crociato anteriore (LCA) e sul corno posteriore del menisco provocando lesione o rottura traumatica acuta.",
        badge: "Rottura LCA / Meniscopatia",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Rottura acuta del legamento crociato anteriore (LCA) o distorsione capsulo-legamentosa di 3° grado con emartro e instabilità articolare cronica.",
    indicazioniMediche: "Test clinico di Lachman e Pivot-Shift; risonanza magnetica ad alto campo del ginocchio; interruzione immediata dell'attività ad alta intensità; protocollo neuromuscolare preventivo FIFA 11+."
  },
  {
    id: "carico_cumulativo_sentinella_overtraining",
    titolo: "Sovraccarico Cronico, Segnale Sentinella (Luce Gialla) & Tendinopatia Degenerativa",
    sottotitolo: "Incrocio: Carico Cumulativo Estremo + Segnale Sentinella Attivo (Luce Gialla) + HRV Depresso",
    urgenza: "🟠 Rischio Overtraining & Tendinopatia",
    rischioColore: "border-amber-500/40 bg-amber-500/5",
    parametriCoinvolti: [
      { nome: "Carico Cumulativo (Cumulative Workload)", categoria: "Monitoraggio Carico Smartwatch", icon: "📈" },
      { nome: "Segnale Sentinella / Luce Gialla", categoria: "Metriche Avanzate AI", icon: "🟡" },
      { nome: "Variabilità Cardiaca (HRV)", categoria: "Parametri Vitali Smartwatch", icon: "💓" },
      { nome: "Distanza Totale & Passi", categoria: "Sensori Biomeccanici IMU", icon: "👟" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Deviazione Statistica Silente (Luce Gialla)",
        descrizione: "L'algoritmo predittivo dello smartwatch intercetta il 'Segnale Sentinella': micro-alterazioni della cadenza e della frequenza passi prima ancora che l'atleta avverta dolore conscio.",
        badge: "Luce Sentinella Attiva",
        badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Infiammazione e Disorganizzazione del Collagene",
        descrizione: "Il carico cumulativo cronico non smaltito deprime il tono vagale (HRV basso) e innesca neo-angiogenesi caotica nelle fibre del tendine d'Achille o rotuleo.",
        badge: "Degenerazione Tendinea",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Sindrome da Sovrallenamento (OTS) & Lesione Inserzionale",
        descrizione: "Stato infiammatorio cronico subclinico con astenia sistemica e rottura parziale o totale del tendine sottocutaneo.",
        badge: "Rottura Tendinea / Overtraining",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Tendinopatia achillea/rotulea cronica con degenerazione mucoide fibro-elastica e sindrome da sovrallenamento sistemico (Overtraining Syndrome).",
    indicazioniMediche: "Eco-Color-Doppler tendineo per mappare neo-vascolarizzazioni anomale; riduzione del carico cumulativo del 40%; inserimento di esercizi isometrici ed eccentrici a carico controllato."
  },
  {
    id: "carico_meccanico_rabdomiolisi_renale",
    titolo: "Sovraccarico Meccanico Estremo, Volume Passi & Rischio Nefrotossico da Mioglobina",
    sottotitolo: "Incrocio: Carico Meccanico > 70 kJ + Passi Massivi (>22.000) + Disidratazione Emodinamica",
    urgenza: "🟠 Rischio Danno Renale Muscolare",
    rischioColore: "border-cyan-500/40 bg-cyan-500/5",
    parametriCoinvolti: [
      { nome: "Carico Meccanico (Mechanical Load)", categoria: "Monitoraggio Carico Smartwatch", icon: "⚙️" },
      { nome: "Passi & Distanza Percorsa", categoria: "Sensori Biomeccanici IMU", icon: "🏃" },
      { nome: "Creatinina ed eGFR", categoria: "Funzionalità d'Organo", icon: "💧" },
      { nome: "Pressione & Idratazione", categoria: "Parametri Vitali", icon: "🩺" }
    ],
    fasi: [
      {
        fase: "Fase 1",
        nome: "Stress Meccanico Estremo sulle Fibre Scheletriche",
        descrizione: "Sessioni di sforzo prolungato con volume di passi enorme generano centinaia di migliaia di micro-urti sul comparto muscolare antigravitazionale.",
        badge: "Sovraccarico Meccanico",
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
      },
      {
        fase: "Fase 2",
        nome: "Liberazione di Mioglobina ed Enzimi nel Plasma",
        descrizione: "La mioglobina rilasciata dal muscolo danneggiato supera la capacità di legame delle proteine plasmatiche e comincia ad accumularsi nei glomeruli renali.",
        badge: "Mioglobinemia da Esercizio",
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30"
      },
      {
        fase: "Fase 3",
        nome: "Ostruzione Tubulare & Sofferenza del Filtrato",
        descrizione: "In presenza di disidratazione e sudorazione abbondante, la mioglobina precipita nei tubuli formando cilindri ostruenti con caduta transitoria dell'eGFR.",
        badge: "Rischio Danno Tubulare",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
      }
    ],
    conseguenzaClinica: "Sofferenza renale acuta reversibile post-sforzo da precipitazione di pigmenti mioglobinurici con ipercreatininemia transitoria.",
    indicazioniMediche: "Idratazione idrosalina abbondante (almeno 3 litri die con elettroliti); controllo esame urine con stick mioglobina e dosaggio CPK e creatinina a 24-48 ore dallo sforzo."
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
