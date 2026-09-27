export type AgeBracketId = '0_14' | '15_24' | '25_39' | '40_49' | '50_64' | '65_74' | '75_plus';

export interface AgeBracketDef {
  id: AgeBracketId;
  label: string;
  minAge: number;
  maxAge: number;
  subtitle: string;
}

export const AGE_BRACKETS: AgeBracketDef[] = [
  { id: '0_14', label: '0 – 14 Anni', minAge: 0, maxAge: 14, subtitle: 'Infanzia e Pubertà' },
  { id: '15_24', label: '15 – 24 Anni', minAge: 15, maxAge: 24, subtitle: 'Sviluppo e Gioventù' },
  { id: '25_39', label: '25 – 39 Anni', minAge: 25, maxAge: 39, subtitle: 'Età Adulta' },
  { id: '40_49', label: '40 – 49 Anni', minAge: 40, maxAge: 49, subtitle: 'Prevenzione Cardiovascolare e Oncologica Mirata' },
  { id: '50_64', label: '50 – 64 Anni', minAge: 50, maxAge: 64, subtitle: 'Screening Oncologici LEA e Monitoraggio Metabolico/Osseo' },
  { id: '65_74', label: '65 – 74 Anni', minAge: 65, maxAge: 74, subtitle: 'Invecchiamento Attivo e Prevenzione della Fragilità' },
  { id: '75_plus', label: '75 – 100 Anni', minAge: 75, maxAge: 120, subtitle: 'Longevità e Monitoraggio Funzionale Multidimensionale' }
];

export function getAgeBracketForAge(age: number): AgeBracketId {
  if (age <= 14) return '0_14';
  if (age <= 24) return '15_24';
  if (age <= 39) return '25_39';
  if (age <= 49) return '40_49';
  if (age <= 64) return '50_64';
  if (age <= 74) return '65_74';
  return '75_plus';
}

export type ScreeningType = 'lea' | 'routine' | 'vaccine_mandatory' | 'vaccine_recommended';

export interface NationalHealthPlanItem {
  id: string;
  name: string;
  ageBracket: AgeBracketId;
  targetGender: 'both' | 'male' | 'female';
  screeningType: ScreeningType;
  recommendedFrequencyMonths: number;
  doctorSpecialty: string;
  reason: string;
  paramTags: string[];
  isPregnancyOnly?: boolean;
}

export const NATIONAL_HEALTH_PLAN_DATABASE: NationalHealthPlanItem[] = [
  // =========================================================================
  // FASCIA 0 – 14 ANNI (Infanzia e Pubertà)
  // =========================================================================
  // MASCHIO & FEMMINA - SCREENING LEA
  {
    id: 'lea_neonatale_0_14',
    name: 'Screening Neonatali Obbligatori alla Nascita (Malattie Metaboliche Ereditarie)',
    ageBracket: '0_14',
    targetGender: 'both',
    screeningType: 'lea',
    recommendedFrequencyMonths: 0,
    doctorSpecialty: 'Neonatologia / Pediatria',
    reason: 'Screening precoce alla nascita su goccia di sangue per ipotiroidismo congenito, fibrosi cistica, fenilchetonuria e oltre 40 errori congeniti del metabolismo.',
    paramTags: ['Percentili_Crescita', 'Screening_Neonatale']
  },
  // ROUTINE PEDIATRICA
  {
    id: 'ped_bilanci_salute_0_14',
    name: 'Bilanci di Salute Pediatrici Periodici (Crescita, Neurosviluppo, Postura, Testicoli/Colonna)',
    ageBracket: '0_14',
    targetGender: 'both',
    screeningType: 'routine',
    recommendedFrequencyMonths: 6,
    doctorSpecialty: 'Pediatria di Libera Scelta',
    reason: 'Valutazione delle curve auxologiche di crescita (altezza, peso, BMI), sviluppo neuropsicomotorio, simmetria della colonna vertebrale e discesa testicolare nei maschi.',
    paramTags: ['Percentili_Crescita', 'BMI']
  },
  {
    id: 'ped_oculistica_udito_0_14',
    name: "Visita Oculistica & Screening dell'Udito / Ortottico (3-6 Anni)",
    ageBracket: '0_14',
    targetGender: 'both',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Oculistica Pediatrica / Ortottica',
    reason: "Intercettazione precoce dell'ambliopia (occhio pigro), difetti di refrazione e deficit uditivi prima dell'inizio della scuola primaria.",
    paramTags: ['Vista_Udito']
  },
  {
    id: 'ped_dentistica_ortodontica_0_14',
    name: 'Valutazione Odontoiatrica ed Ortodontica Periodica (dai 4 Anni)',
    ageBracket: '0_14',
    targetGender: 'both',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Odontoiatria Pediatrica / Ortodonzia',
    reason: 'Controllo precoce della permuta dentaria, prevenzione carie della prima infanzia e diagnosi di malocclusioni o morso incrociato.',
    paramTags: ['Odontoiatria']
  },
  // VACCINI 0-14
  {
    id: 'vac_esavalente_0_14',
    name: 'Vaccino Esavalente (Poliomielite, Difterite, Tetano, Pertosse, Epatite B, Hib)',
    ageBracket: '0_14',
    targetGender: 'both',
    screeningType: 'vaccine_mandatory',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Centro Vaccinale / Igiene Pubblica',
    reason: 'Immunizzazione primaria obbligatoria per legge nel primo anno di vita con richiamo a 5-6 anni.',
    paramTags: ['Vaccino_Esavalente']
  },
  {
    id: 'vac_tetravalente_0_14',
    name: 'Vaccino Tetravalente (Morbillo, Parotite, Rosolia, Varicella - MPRV)',
    ageBracket: '0_14',
    targetGender: 'both',
    screeningType: 'vaccine_mandatory',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Centro Vaccinale / Pediatria',
    reason: 'Immunizzazione obbligatoria per legge (prima dose a 12-15 mesi, seconda dose a 5-6 anni).',
    paramTags: ['Vaccino_MPRV']
  },
  {
    id: 'vac_rotavirus_meningococco_0_14',
    name: 'Vaccini Anti-Rotavirus, Anti-Pneumococco, Anti-Meningococco B e ACWY',
    ageBracket: '0_14',
    targetGender: 'both',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Centro Vaccinale',
    reason: 'Immunizzazioni raccomandate e gratuite dal Piano Nazionale Prevenzione Vaccinale contro infezioni invasive batteriche e gastroenteriti gravi.',
    paramTags: ['Vaccini_Raccomandati']
  },
  {
    id: 'vac_hpv_preadolescenti_0_14',
    name: 'Vaccino Anti-HPV (Papillomavirus Umano - Offerto attivamente a 11-12 Anni)',
    ageBracket: '0_14',
    targetGender: 'both',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Centro Vaccinale / Medicina Preventiva',
    reason: 'Offerto attivamente a maschi e femmine prima del debutto sessuale per prevenire tumori della cervice, anogenitali e dell\'orofaringe.',
    paramTags: ['Vaccino_HPV']
  },

  // =========================================================================
  // FASCIA 15 – 24 ANNI (Sviluppo e Gioventù)
  // =========================================================================
  // MASCHIO
  {
    id: 'm_testicolo_15_24',
    name: 'Autopalpazione Testicolare Mensile (Prevenzione Neoplasia Testicolare)',
    ageBracket: '15_24',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 1,
    doctorSpecialty: 'Andrologia / Autoesame',
    reason: 'Il tumore del testicolo ha il suo picco di incidenza tra i 15 e i 35 anni. L\'autopalpazione mensile sotto la doccia consente la diagnosi precoce di noduli o asimmetrie.',
    paramTags: ['Autopalpazione_Testicolare']
  },
  {
    id: 'm_visita_andrologica_15_24',
    name: 'Prima Visita Andrologica (Varicocele, Fimosi, Sviluppo Puberale)',
    ageBracket: '15_24',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Andrologia / Urologia',
    reason: 'Screening fondamentale post-abolizione della visita di leva militare: valuta varicocele (causa principale di infertilità maschile futura), fimosi e sviluppo genitale.',
    paramTags: ['Visita_Andrologica']
  },
  {
    id: 'm_pressione_15_24',
    name: 'Controllo Periodico della Pressione Arteriosa (Uomo)',
    ageBracket: '15_24',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Medicina Generale',
    reason: 'Rilevazione precoce di ipertensione giovanile essenziale o secondaria.',
    paramTags: ['Pressione_Arteriosa']
  },
  {
    id: 'm_esami_ematici_15_24',
    name: 'Esami Ematici Base di Controllo (Emocromo, Glicemia, Profilo Lipidico)',
    ageBracket: '15_24',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Medicina di Base / Laboratorio',
    reason: 'Controllo generale di globuli rossi, globuli bianchi, glicemia a digiuno e assetto lipidico per escludere familiarità per dislipidemie precoci.',
    paramTags: ['Esami_Ematici_Base', 'Glicemia', 'Colesterolo_Totale']
  },
  {
    id: 'm_test_ist_15_24',
    name: 'Test di Screening Infezioni Sessualmente Trasmissibili (HIV, Sifilide, Chlamydia, Gonorrea)',
    ageBracket: '15_24',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Infettivologia / Dermatologia',
    reason: 'Screening periodico raccomandato per soggetti sessualmente attivi per interrompere catene di trasmissione silenti.',
    paramTags: ['Test_IST']
  },
  {
    id: 'm_recupero_vaccini_15_24',
    name: 'Recupero Vaccini Mancanti dell\'Infanzia (HPV, Meningococco ACWY/B)',
    ageBracket: '15_24',
    targetGender: 'male',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Igiene Pubblica / Centro Vaccinale',
    reason: 'Recupero dosi vaccinali non eseguite in preadolescenza con offerta agevolata.',
    paramTags: ['Vaccino_HPV']
  },
  // FEMMINA
  {
    id: 'f_seno_autopalpazione_15_24',
    name: 'Autopalpazione Mensile del Seno (Post-Flusso Mestruale)',
    ageBracket: '15_24',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 1,
    doctorSpecialty: 'Senologia / Autoesame',
    reason: 'Eseguire a fine ciclo mestruale quando il parenchima è più morbido per prendere confidenza con l\'anatomia e intercettare nodularità o fibroadenomi.',
    paramTags: ['Autopalpazione_Seno']
  },
  {
    id: 'f_visita_ginecologica_15_24',
    name: 'Prima Visita Ginecologica & Consulenza Post-Menarca / Contraccezione',
    ageBracket: '15_24',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Ginecologia',
    reason: 'Valutazione della regolarità mestruale, dismenorrea, ovaio policistico (PCOS) e consulenza per contraccezione consapevole.',
    paramTags: ['Visita_Ginecologica']
  },
  {
    id: 'f_pressione_15_24',
    name: 'Controllo Periodico della Pressione Arteriosa (Donna)',
    ageBracket: '15_24',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Medicina Generale',
    reason: 'Monitoraggio pressorio, particolarmente raccomandato in caso di inizio di estroprogestinici (pillola anticoncezionale).',
    paramTags: ['Pressione_Arteriosa']
  },
  {
    id: 'f_esami_ematici_ferro_15_24',
    name: 'Esami Ematici di Routine (Emocromo, Sideremia, Ferritina per Perdite da Ciclo)',
    ageBracket: '15_24',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Medicina di Base / Laboratorio',
    reason: 'Prevenzione dell\'anemia sideropenica da flussi mestruali abbondanti e controllo riserve di ferro (ferritina circolante).',
    paramTags: ['Esami_Ematici_Base', 'Ferritina']
  },
  {
    id: 'f_test_ist_chlamydia_15_24',
    name: 'Screening IST con Focus su Chlamydia Trachomatis (Prevenzione Sterilità Tubarica)',
    ageBracket: '15_24',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Ginecologia / Malattie Infettive',
    reason: 'La Chlamydia è frequentemente asintomatica nella donna e rappresenta la prima causa prevenibile di malattia infiammatoria pelvica e sterilità tubarica.',
    paramTags: ['Test_IST']
  },
  {
    id: 'f_recupero_hpv_15_24',
    name: 'Recupero Vaccino Anti-HPV (Gratuito fino ai 25 Anni in molte Regioni)',
    ageBracket: '15_24',
    targetGender: 'female',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Centro Vaccinale / Consultorio',
    reason: 'Vaccinazione nonavalente fondamentale contro i ceppi oncogeni HPV 16, 18, 31, 33, 45, 52, 58.',
    paramTags: ['Vaccino_HPV', 'Screening_Cervice']
  },

  // =========================================================================
  // FASCIA 25 – 39 ANNI (Età Adulta)
  // =========================================================================
  // MASCHIO
  {
    id: 'm_pressione_25_39',
    name: 'Controllo Annuale della Pressione Arteriosa (Uomo 25-39)',
    ageBracket: '25_39',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Medicina Generale / Cardiologia',
    reason: 'Sorveglianza per ipertensione arteriosa silente, primo fattore di rischio aterosclerotico precoce.',
    paramTags: ['Pressione_Arteriosa']
  },
  {
    id: 'm_esami_completi_25_39',
    name: 'Esami del Sangue e Urine Completi (Emocromo, Glicemia, Lipidi Tot/HDL/LDL, Trigliceridi, Creatinina, Transaminasi)',
    ageBracket: '25_39',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 36,
    doctorSpecialty: 'Medicina di Base / Laboratorio',
    reason: 'Check-up metabolico triennale per glicemia a digiuno, dislipidemie aterogene, filtrazione glomerulare e citolisi epatica.',
    paramTags: ['Glicemia', 'Colesterolo_Totale', 'Trigliceridi', 'Creatinina', 'Transaminasi']
  },
  {
    id: 'm_dermatologia_nei_25_39',
    name: 'Mappatura dei Nei (Dermatoscopia Digitale ad Epiluminescenza)',
    ageBracket: '25_39',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Dermatologia',
    reason: 'Controllo delle lesioni melanocitarie cutanee ogni 2 anni (annuale in caso di fototipo chiaro o familiarità positiva per melanoma).',
    paramTags: ['Familiarita_Melanoma']
  },
  {
    id: 'm_dentista_igiene_25_39',
    name: 'Visita Odontoiatrica di Controllo & Igiene Orale Professionale',
    ageBracket: '25_39',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Odontoiatria',
    reason: 'Rimozione tartaro e prevenzione gengivite / parodontite, correlata a infiammazione sistemica di basso grado.',
    paramTags: ['Odontoiatria']
  },
  {
    id: 'm_bmi_circonferenza_25_39',
    name: 'Monitoraggio dell\'Indice di Massa Corporea (BMI) & Circonferenza Addominale',
    ageBracket: '25_39',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Nutrizione Clinica / Medicina Preventiva',
    reason: 'Prevenzione dell\'accumulo di grasso viscerale aterogeno (target < 94-102 cm per uomo).',
    paramTags: ['BMI', 'Circonferenza_Addominale']
  },
  {
    id: 'm_richiamo_dtpa_25_39',
    name: 'Richiamo Vaccinale Difterite-Tetano-Pertosse Acellulare (dTPa ogni 10 Anni)',
    ageBracket: '25_39',
    targetGender: 'male',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 120,
    doctorSpecialty: 'Igiene Pubblica / Centro Vaccinale',
    reason: 'Mantenimento dell\'immunità protettiva antitetanica e antipertossica decennale nell\'adulto.',
    paramTags: ['Vaccino_dTPa']
  },
  // FEMMINA
  {
    id: 'f_pap_test_lea_25_39',
    name: 'Pap-Test Triennale (Screening Nazionale LEA per Cervice Uterina dai 25 Anni)',
    ageBracket: '25_39',
    targetGender: 'female',
    screeningType: 'lea',
    recommendedFrequencyMonths: 36,
    doctorSpecialty: 'Ginecologia / Centro Screening LEA',
    reason: 'Screening oncologico organizzato dal Servizio Sanitario Nazionale (SSN) offerto gratuitamente ogni 3 anni per donne tra i 25 e i 30 anni.',
    paramTags: ['Screening_Cervice']
  },
  {
    id: 'f_hpv_dna_lea_25_39',
    name: 'HPV-DNA Test Quinquennale (Screening Nazionale LEA dai 30-34 Anni)',
    ageBracket: '25_39',
    targetGender: 'female',
    screeningType: 'lea',
    recommendedFrequencyMonths: 60,
    doctorSpecialty: 'Ginecologia / Screening LEA',
    reason: 'Test molecolare di elezione che sostituisce il Pap-test a partire dai 30-34 anni, con intervallo di sicurezza prolungato a 5 anni in caso di negatività.',
    paramTags: ['Screening_Cervice']
  },
  {
    id: 'f_visita_ginecologica_eco_25_39',
    name: 'Visita Ginecologica Annuale con Ecografia Pelvica / Transvaginale',
    ageBracket: '25_39',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Ginecologia',
    reason: 'Valutazione annuale della morfologia uterina ed ovarica (esclusione cisti, miomi o iperplasia endometriale).',
    paramTags: ['Visita_Ginecologica']
  },
  {
    id: 'f_ecografia_mammaria_25_39',
    name: 'Ecografia Mammaria Annuale (Tessuto Ghiandolare Giovane e Denso)',
    ageBracket: '25_39',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Senologia / Radiologia',
    reason: 'Metodica non invasiva e priva di radiazioni, gold standard per il seno denso under 40 per identificare formazioni nodulari e cistiche.',
    paramTags: ['Ecografia_Mammaria', 'Screening_Mammografia']
  },
  {
    id: 'f_pressione_25_39',
    name: 'Controllo Annuale della Pressione Arteriosa (Donna 25-39)',
    ageBracket: '25_39',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Medicina Generale',
    reason: 'Sorveglianza periodica del tono vascolare e della gittata cardiaca.',
    paramTags: ['Pressione_Arteriosa']
  },
  {
    id: 'f_esami_completi_25_39',
    name: 'Esami Sangue e Urine Completi (Assetto Lipidico, Glicemia, Renale, Epatica, Assetto Marziale)',
    ageBracket: '25_39',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 36,
    doctorSpecialty: 'Laboratorio Analisi / Medicina di Base',
    reason: 'Monitoraggio triennale di profilo metabolico, transaminasi, creatinina e sideremia/ferritina.',
    paramTags: ['Glicemia', 'Colesterolo_Totale', 'Transaminasi', 'Creatinina', 'Ferritina']
  },
  {
    id: 'f_dermatologia_nei_25_39',
    name: 'Mappatura dei Nei (Dermatoscopia) ogni 2 Anni (Donna)',
    ageBracket: '25_39',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Dermatologia',
    reason: 'Sorveglianza dermatoscopica per intercettazione precoce di lesioni melanocitarie atipiche.',
    paramTags: ['Familiarita_Melanoma']
  },
  {
    id: 'f_dentista_igiene_25_39',
    name: 'Visita Odontoiatrica di Controllo ed Igiene Orale Annuale (Donna)',
    ageBracket: '25_39',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Odontoiatria',
    reason: 'Prevenzione parodontopatie e demineralizzazione dello smalto.',
    paramTags: ['Odontoiatria']
  },
  {
    id: 'f_richiamo_dtpa_25_39',
    name: 'Richiamo Vaccino dTPa (Difterite-Tetano-Pertosse ogni 10 Anni)',
    ageBracket: '25_39',
    targetGender: 'female',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 120,
    doctorSpecialty: 'Centro Vaccinale',
    reason: 'Richiamo decennale raccomandato per tutta la popolazione adulta.',
    paramTags: ['Vaccino_dTPa']
  },
  {
    id: 'f_gravidanza_vaccini_25_39',
    name: 'Vaccinazione dTPa in Gravidanza (Settimana 27-36) + Antinfluenzale Stagionale',
    ageBracket: '25_39',
    targetGender: 'female',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 9,
    doctorSpecialty: 'Ostetricia / Centro Vaccinale',
    reason: 'Raccomandato ad ogni gestazione tra la 27a e 36a settimana per trasmettere anticorpi materni transplacentari contro la pertosse al neonato.',
    paramTags: ['Stato_Gravidanza', 'Vaccino_dTPa'],
    isPregnancyOnly: true
  },

  // =========================================================================
  // FASCIA 40 – 49 ANNI (Prevenzione Cardiovascolare e Oncologica Mirata)
  // =========================================================================
  // MASCHIO
  {
    id: 'm_esami_annuali_40_49',
    name: 'Esami del Sangue e Urine Completi Annuali (Profilo Metabolico, Lipidico, Renale, Epatico)',
    ageBracket: '40_49',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Medicina di Base / Laboratorio',
    reason: 'Dai 40 anni il controllo ematochimico diventa annuale: monitoraggio di glicemia a digiuno, colesterolo totale/HDL/LDL, trigliceridi, creatinina, azotemia, AST, ALT, GGT.',
    paramTags: ['Glicemia', 'Colesterolo_Totale', 'Creatinina', 'Transaminasi', 'Trigliceridi']
  },
  {
    id: 'm_rischio_cv_ecg_40_49',
    name: 'Valutazione Globale del Rischio Cardiovascolare (Carta del Rischio + ECG Basale)',
    ageBracket: '40_49',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Cardiologia',
    reason: 'Stima del rischio di eventi cardiovascolari a 10 anni (progetto Cuore ISS) associata a tracciato elettrocardiografico a riposo per escludere ipertrofia ventricolare o turbe del ritmo.',
    paramTags: ['Rischio_Cardiovascolare', 'ECG', 'Pressione_Arteriosa']
  },
  {
    id: 'm_psa_prostata_40_49',
    name: 'Dosaggio Antigene Prostatico Specifico (PSA Totale e Libero) dai 45 Anni (40 se Familiarità)',
    ageBracket: '40_49',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Urologia / Laboratorio',
    reason: 'Valutazione del PSA sierico con eventuale visita urologica specialistica per diagnosi precoce dell\'adenocarcinoma prostatico (anticipato a 40 anni con parenti di primo grado affetti).',
    paramTags: ['PSA', 'Familiarita_Prostata']
  },
  {
    id: 'm_glaucoma_tonometria_40_49',
    name: 'Screening del Glaucoma tramite Tonometria Oculare (Pressione Intraoculare ogni 2 Anni)',
    ageBracket: '40_49',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Oculistica',
    reason: 'Misurazione della pressione intraoculare con esame del fondo oculare per prevenire danni asintomatici e irreversibili al nervo ottico.',
    paramTags: ['Tonometria_Glaucoma', 'Vista_Udito']
  },
  {
    id: 'm_dermatologia_annuale_40_49',
    name: 'Visita Dermatologica Annuale con Epiluminescenza per Controllo Nei',
    ageBracket: '40_49',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Dermatologia',
    reason: 'Controllo annuale delle lesioni cutanee esposte al foto-danneggiamento cronico.',
    paramTags: ['Familiarita_Melanoma']
  },
  {
    id: 'm_vitamina_d_acido_urico_40_49',
    name: 'Controllo Livelli Ematici di Vitamina D e Acido Urico Sierico',
    ageBracket: '40_49',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Medicina Interna',
    reason: 'L\'iperuricemia è un fattore di rischio cardiovascolare e renale indipendente. La Vitamina D è fondamentale per apparato muscolo-scheletrico e modulazione immunitaria.',
    paramTags: ['Vitamina_D', 'Acido_Urico']
  },
  {
    id: 'm_richiamo_dtpa_40_49',
    name: 'Verifica Richiamo Vaccino dTPa (Difterite-Tetano-Pertosse ogni 10 Anni)',
    ageBracket: '40_49',
    targetGender: 'male',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 120,
    doctorSpecialty: 'Igiene Pubblica',
    reason: 'Controllo dello stato vaccinale antitetanico decennale.',
    paramTags: ['Vaccino_dTPa']
  },
  // FEMMINA
  {
    id: 'f_mammografia_ecografia_40_49',
    name: 'Mammografia Bilaterale con Tomosintesi ed Ecografia Mammaria (Annuale o Biennale dai 40 Anni)',
    ageBracket: '40_49',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Senologia / Radiologia',
    reason: 'Dai 40 anni è fortemente raccomandata l\'introduzione della mammografia clinica bilaterale associata a ecografia per lo screening precoce del carcinoma mammario.',
    paramTags: ['Screening_Mammografia', 'Ecografia_Mammaria']
  },
  {
    id: 'f_screening_cervice_40_49',
    name: 'Screening Cervice Uterina (HPV-DNA Test ogni 5 Anni o Pap-Test ogni 3 Anni)',
    ageBracket: '40_49',
    targetGender: 'female',
    screeningType: 'lea',
    recommendedFrequencyMonths: 60,
    doctorSpecialty: 'Ginecologia / Screening LEA',
    reason: 'Screening oncologico di popolazione LEA per la prevenzione primaria e secondaria del tumore del collo dell\'utero.',
    paramTags: ['Screening_Cervice']
  },
  {
    id: 'f_rischio_cv_ecg_40_49',
    name: 'Valutazione Globale del Rischio Cardiovascolare ed ECG Basale a Riposo',
    ageBracket: '40_49',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Cardiologia',
    reason: 'Valutazione del profilo lipidico ed emodinamico nella fase di transizione ormonale.',
    paramTags: ['Rischio_Cardiovascolare', 'ECG', 'Pressione_Arteriosa']
  },
  {
    id: 'f_esami_annuali_40_49',
    name: 'Esami del Sangue e Urine Annuali (Lipidi, Glicemia, Funzionalità Renale ed Epatica)',
    ageBracket: '40_49',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Laboratorio / Medicina Generale',
    reason: 'Screening metabolico annuale completo per intercettare sindrome metabolica o alterazioni transaminasiche.',
    paramTags: ['Glicemia', 'Colesterolo_Totale', 'Creatinina', 'Transaminasi']
  },
  {
    id: 'f_perimenopausa_ormoni_40_49',
    name: 'Valutazione Ginecologica di Transizione & Assetto Ormonale Perimenopausale',
    ageBracket: '40_49',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Ginecologia / Endocrinologia',
    reason: 'Dosaggio FSH, 17-beta estradiolo e TSH in presenza di irregolarità del ciclo, vampate o sintomatologia climaterica.',
    paramTags: ['Assetto_Ormonale_Menopausa']
  },
  {
    id: 'f_glaucoma_dermatologia_40_49',
    name: 'Tonometria Oculare (Screening Glaucoma) ogni 2 Anni & Mappatura Nei Annuale',
    ageBracket: '40_49',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Oculistica / Dermatologia',
    reason: 'Sorveglianza della pressione oculare e monitoraggio delle lesioni neviche.',
    paramTags: ['Tonometria_Glaucoma', 'Familiarita_Melanoma']
  },
  {
    id: 'f_richiamo_dtpa_40_49',
    name: 'Verifica Richiamo Vaccino dTPa (Difterite-Tetano-Pertosse ogni 10 Anni)',
    ageBracket: '40_49',
    targetGender: 'female',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 120,
    doctorSpecialty: 'Centro Vaccinale',
    reason: 'Richiamo decennale raccomandato dal PNPV.',
    paramTags: ['Vaccino_dTPa']
  },

  // =========================================================================
  // FASCIA 50 – 64 ANNI (Screening Oncologici di Popolazione LEA e Monitoraggio Metabolico/Osseo)
  // =========================================================================
  // MASCHIO
  {
    id: 'm_colon_fit_lea_50_64',
    name: 'Screening Colon-Retto: Ricerca Sangue Occulto nelle Feci (FIT / SOF Biennale LEA)',
    ageBracket: '50_64',
    targetGender: 'male',
    screeningType: 'lea',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Gastroenterologia / Screening LEA',
    reason: 'Screening oncologico salvavita primario offerto gratuitamente ogni 2 anni per intercettare adenomi e lesioni pre-neoplastiche prima che evolvano in carcinoma colorettale.',
    paramTags: ['Screening_Colon']
  },
  {
    id: 'm_psa_visita_urologica_50_64',
    name: 'Dosaggio Annuale del PSA (Totale e Libero) con Visita Urologica Preventiva',
    ageBracket: '50_64',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Urologia',
    reason: 'Sorveglianza dell\'ipertrofia prostatica benigna (IPB) e intercettazione precoce di neoplasia prostatica con esplorazione rettale specialistica.',
    paramTags: ['PSA', 'Familiarita_Prostata']
  },
  {
    id: 'm_ecocolordoppler_tsa_50_64',
    name: 'Ecocolordoppler TSA (Tronchi Sovra-Aortici / Carotidi)',
    ageBracket: '50_64',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Angiologia / Chirurgia Vascolare',
    reason: 'Valutazione dello spessore intima-media carotideo (IMT) e ricerca di placche aterosclerotiche steno-ostruenti per la prevenzione primaria dell\'ictus cerebrale ischemico.',
    paramTags: ['TSA', 'Rischio_Cardiovascolare']
  },
  {
    id: 'm_metabolico_hba1c_50_64',
    name: 'Profilo Glicometabolico Avanzato (Glicemia, HbA1c Emoglobina Glicata, ApoB, Creatinina, eGFR)',
    ageBracket: '50_64',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Medicina Interna / Diabetologia',
    reason: 'Controllo stretto dell\'assetto glicemico a lungo termine (HbA1c), delle particelle aterogene e della riserva funzionale dei nefroni renale.',
    paramTags: ['Glicemia', 'Colesterolo_Totale', 'Creatinina']
  },
  {
    id: 'm_vista_udito_50_64',
    name: 'Controllo Oculistico Completo (Fondo Oculare, Tonometria) ed Esame Audiometrico',
    ageBracket: '50_64',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Oculistica / Otorinolaringoiatria',
    reason: 'Valutazione della microcircolazione retinica, pressione oculare e presbiacusia incipiente.',
    paramTags: ['Vista_Udito', 'Tonometria_Glaucoma']
  },
  {
    id: 'm_dermatologia_50_64',
    name: 'Mappatura dei Nei Annuale ed Epiluminescenza Digitale',
    ageBracket: '50_64',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Dermatologia',
    reason: 'Controllo dermatologico annuale per prevenzione melanoma e carcinomi spinocellulari/basocellulari.',
    paramTags: ['Familiarita_Melanoma']
  },
  {
    id: 'm_vaccino_zoster_50_64',
    name: 'Vaccinazione Anti-Herpes Zoster (Fuoco di Sant\'Antonio) & Antinfluenzale Annuale',
    ageBracket: '50_64',
    targetGender: 'male',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Igiene Pubblica / Centro Vaccinale',
    reason: 'Vaccino ricombinante adiuvato offerto attivamente dai 50-65 anni per prevenire nevralgia post-erpetica cronica invalidante.',
    paramTags: ['Vaccino_Zoster']
  },
  // FEMMINA
  {
    id: 'f_mammografia_lea_50_64',
    name: 'Screening Mammografico Biennale di Popolazione (Programma Attivo LEA 50-69 Anni)',
    ageBracket: '50_64',
    targetGender: 'female',
    screeningType: 'lea',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Senologia / Screening LEA',
    reason: 'Pilastro dei Livelli Essenziali di Assistenza con doppia lettura radiologica indipendente: riduce la mortalità specifica per carcinoma mammario di oltre il 30%.',
    paramTags: ['Screening_Mammografia']
  },
  {
    id: 'f_colon_fit_lea_50_64',
    name: 'Screening Colon-Retto: Ricerca Sangue Occulto nelle Feci (FIT / SOF Biennale LEA)',
    ageBracket: '50_64',
    targetGender: 'female',
    screeningType: 'lea',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Gastroenterologia / Screening LEA',
    reason: 'Screening gratuito ogni 2 anni per intercettare precocemente polipi adenomatosi intestinali.',
    paramTags: ['Screening_Colon']
  },
  {
    id: 'f_hpv_dna_lea_50_64',
    name: 'Screening Cervice Uterina con HPV-DNA Test ogni 5 Anni (Fino a 64 Anni)',
    ageBracket: '50_64',
    targetGender: 'female',
    screeningType: 'lea',
    recommendedFrequencyMonths: 60,
    doctorSpecialty: 'Ginecologia / Screening LEA',
    reason: 'Completamento del ciclo di screening con test molecolare HPV per la salute del collo dell\'utero.',
    paramTags: ['Screening_Cervice']
  },
  {
    id: 'f_moc_dexa_50_64',
    name: 'Mineralometria Ossea Computerizzata (MOC DEXA Colonna Lombare e Femore)',
    ageBracket: '50_64',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Reumatologia / Endocrinologia',
    reason: 'Valutazione della densità minerale ossea (T-Score) post-menopausale: diagnosi precoce di osteopenia e osteoporosi prima del verificarsi di fratture da fragilità.',
    paramTags: ['MOC_DEXA', 'Vitamina_D']
  },
  {
    id: 'f_ecocolordoppler_tsa_50_64',
    name: 'Ecocolordoppler TSA (Tronchi Sovra-Aortici) & Valutazione Cardiovascolare',
    ageBracket: '50_64',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Angiologia / Cardiologia',
    reason: 'Dopo la menopausa viene meno la protezione estrogenica vascolare: essenziale il controllo delle carotidi e dell\'elettrocardiogramma.',
    paramTags: ['TSA', 'Rischio_Cardiovascolare', 'ECG']
  },
  {
    id: 'f_metabolico_vitd_50_64',
    name: 'Pannello Metabolico & Assetto Fosfo-Calcico (Glicemia, Lipidi, Creatinina, Vitamina D, Calcemia)',
    ageBracket: '50_64',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Medicina Generale / Laboratorio',
    reason: 'Controllo annuale integrato per sindrome metabolica e supporto al rimodellamento osseo.',
    paramTags: ['Glicemia', 'Colesterolo_Totale', 'Vitamina_D', 'Creatinina']
  },
  {
    id: 'f_vaccino_zoster_50_64',
    name: 'Vaccinazione Anti-Herpes Zoster & Antinfluenzale Stagionale',
    ageBracket: '50_64',
    targetGender: 'female',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Igiene Pubblica',
    reason: 'Protezione attiva contro l\'infezione da virus varicella-zoster riattivato e complicanze respiratorie.',
    paramTags: ['Vaccino_Zoster']
  },

  // =========================================================================
  // FASCIA 65 – 74 ANNI (Invecchiamento Attivo e Prevenzione della Fragilità)
  // =========================================================================
  // MASCHIO
  {
    id: 'm_colon_fit_65_74',
    name: 'Screening Colon-Retto: FIT su Feci ogni 2 Anni (Fino a 74 Anni LEA)',
    ageBracket: '65_74',
    targetGender: 'male',
    screeningType: 'lea',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Gastroenterologia / Screening LEA',
    reason: 'Continuazione del programma di screening di popolazione fino ai 74 anni per massimizzare la sopravvivenza oncologica.',
    paramTags: ['Screening_Colon']
  },
  {
    id: 'm_eco_aorta_addominale_65_74',
    name: 'Screening Aneurisma Aorta Addominale (Eco-Color-Doppler Aorta Addominale Una Tantum)',
    ageBracket: '65_74',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 36,
    doctorSpecialty: 'Chirurgia Vascolare / Angiologia',
    reason: 'Screening ecografico fondamentale una tantum per uomini dai 65 anni in su (particolarmente fumatori o ex-fumatori) per diagnosticare aneurismi silenti prima della rottura fatale.',
    paramTags: ['Screening_Aorta', 'Rischio_Cardiovascolare']
  },
  {
    id: 'm_cardiologia_ecg_65_74',
    name: 'Visita Cardiologica Annuale con ECG a Riposo e Controllo Holter Pressorio',
    ageBracket: '65_74',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Cardiologia',
    reason: 'Monitoraggio della funzione contrattile, fibrillazione atriale silente, scompensa cardiaco e pressione diurna/notturna.',
    paramTags: ['ECG', 'Pressione_Arteriosa', 'Rischio_Cardiovascolare']
  },
  {
    id: 'm_psa_urologia_65_74',
    name: 'Dosaggio PSA Totale/Libero & Visita Urologica Specialistica Annuale',
    ageBracket: '65_74',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Urologia',
    reason: 'Monitoraggio annuale del parenchima prostatico e del residuo urinario post-minzionale.',
    paramTags: ['PSA']
  },
  {
    id: 'm_cataratta_oct_udito_65_74',
    name: 'Screening Oculistico per Cataratta e Maculopatia (OCT Retinico) + Controllo Audiometrico',
    ageBracket: '65_74',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Oculistica / Audiologia',
    reason: 'Prevenzione della degenerazione maculare senile (DMS), opacità del cristallino e ipoacusia (fattore indipendente di decadimento cognitivo).',
    paramTags: ['Vista_Udito']
  },
  {
    id: 'm_moc_dexa_65_74',
    name: 'MOC DEXA per Valutazione Densità Ossea e Rischio Fratture nel Maschio Senile',
    ageBracket: '65_74',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Reumatologia / Geriatria',
    reason: 'L\'osteoporosi senile colpisce anche l\'uomo dopo i 65 anni con elevata mortalità per fratture di femore.',
    paramTags: ['MOC_DEXA', 'Vitamina_D']
  },
  {
    id: 'm_screening_cognitivo_65_74',
    name: 'Screening Decadimento Cognitivo e Funzione Esecutiva (MMSE / Test dell\'Orologio)',
    ageBracket: '65_74',
    targetGender: 'male',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Neurologia / Geriatria (CDCD)',
    reason: 'Valutazione basale delle funzioni mnestiche per intercettare tempestivamente il Mild Cognitive Impairment (MCI).',
    paramTags: ['Screening_Cognitivo']
  },
  {
    id: 'm_vaccini_senior_65_74',
    name: 'Vaccinazioni Anti-Pneumococco (PCV20), Anti-Zoster, Antinfluenzale ad Alto Dosaggio',
    ageBracket: '65_74',
    targetGender: 'male',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Igiene Pubblica / Centro Vaccinale',
    reason: 'Protezione salvavita contro polmoniti pneumococciche invasive e infezioni virali stagionali.',
    paramTags: ['Vaccino_Pneumococco', 'Vaccino_Zoster']
  },
  // FEMMINA
  {
    id: 'f_colon_fit_65_74',
    name: 'Screening Colon-Retto: FIT su Feci ogni 2 Anni (Fino a 74 Anni LEA)',
    ageBracket: '65_74',
    targetGender: 'female',
    screeningType: 'lea',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Gastroenterologia / Screening LEA',
    reason: 'Sorveglianza colon-rettale fino al limite superiore dei protocolli LEA nazionali.',
    paramTags: ['Screening_Colon']
  },
  {
    id: 'f_mammografia_lea_65_74',
    name: 'Screening Mammografico (Estensione Gratuita fino a 74 Anni nei Protocolli Regionali)',
    ageBracket: '65_74',
    targetGender: 'female',
    screeningType: 'lea',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Senologia / Radiologia',
    reason: 'Mantenimento dello screening biennale raccomandato dalle linee guida europee per la fascia 70-74 anni.',
    paramTags: ['Screening_Mammografia']
  },
  {
    id: 'f_moc_dexa_65_74',
    name: 'MOC DEXA Biennale di Controllo & Monitoraggio Terapia Osteoporotica',
    ageBracket: '65_74',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Reumatologia / Endocrinologia',
    reason: 'Valutazione dell\'efficacia terapeutica anti-riassorbitiva (bisfosfonati/denosumab) e rischio fratturativo.',
    paramTags: ['MOC_DEXA', 'Vitamina_D']
  },
  {
    id: 'f_cardiologia_ecg_65_74',
    name: 'Visita Cardiologica con ECG Annuale & Monitoraggio Pressione Arteriosa',
    ageBracket: '65_74',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Cardiologia',
    reason: 'Controllo della compliance arteriosa e prevenzione dello scompenso cardiaco a frazione d\'eiezione preservata (HFpEF).',
    paramTags: ['ECG', 'Pressione_Arteriosa', 'Rischio_Cardiovascolare']
  },
  {
    id: 'f_vista_oct_udito_65_74',
    name: 'Screening Oculistico (OCT Maculare, Pressione Oculare, Cataratta) & Udito',
    ageBracket: '65_74',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Oculistica / Audiologia',
    reason: 'Preservazione dell\'autonomia sensoriale e prevenzione dell\'isolamento sociale.',
    paramTags: ['Vista_Udito']
  },
  {
    id: 'f_screening_cognitivo_65_74',
    name: 'Screening Cognitivo e Memoria (MMSE / Test Orologio)',
    ageBracket: '65_74',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 24,
    doctorSpecialty: 'Geriatria / Neurologia',
    reason: 'Monitoraggio dell\'efficienza mnestica e delle funzioni visuo-spaziali.',
    paramTags: ['Screening_Cognitivo']
  },
  {
    id: 'f_esami_b12_folati_vitd_65_74',
    name: 'Profilo Ematochimico Annuale con Vitamina B12, Acido Folico e Vitamina D',
    ageBracket: '65_74',
    targetGender: 'female',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Laboratorio / Medicina Generale',
    reason: 'Ricerca di ipovitaminosi B12 e D frequenti nell\'anziano a causa di acloridria gastrica o ridotta sintesi cutanea.',
    paramTags: ['Vitamina_D', 'Esami_Ematici_Base']
  },
  {
    id: 'f_vaccini_senior_65_74',
    name: 'Vaccinazioni Anti-Pneumococco, Anti-Herpes Zoster e Antinfluenzale Annuale',
    ageBracket: '65_74',
    targetGender: 'female',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Centro Vaccinale',
    reason: 'Immunizzazione essenziale per l\'invecchiamento in salute.',
    paramTags: ['Vaccino_Pneumococco', 'Vaccino_Zoster']
  },

  // =========================================================================
  // FASCIA 75 – 100 ANNI (Longevità, Multimorbidità e Monitoraggio Funzionale)
  // =========================================================================
  // MASCHIO & FEMMINA
  {
    id: 'ger_vmd_75_plus',
    name: 'Valutazione Multidimensionale Geriatrica (VMD: Stato Nutrizionale, Rischio Cadute, ADL/IADL)',
    ageBracket: '75_plus',
    targetGender: 'both',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Geriatria',
    reason: 'Valutazione olistica delle capacità funzionali residue, autonomia nelle attività di base (ADL) e strumentali (IADL), forza muscolare (sarcopenia) e stabilità posturale.',
    paramTags: ['VMD', 'Percentili_Crescita']
  },
  {
    id: 'ger_cardiovascolare_ecg_75_plus',
    name: 'Monitoraggio Cardiopolmonare ed ECG Periodico (Verifica Ipotensione Ortostatica)',
    ageBracket: '75_plus',
    targetGender: 'both',
    screeningType: 'routine',
    recommendedFrequencyMonths: 6,
    doctorSpecialty: 'Cardiologia / Geriatria',
    reason: 'Controllo semestrale di ritmo sinusale/extrasistolia e misurazione della pressione clino/ortostatica per prevenire cadute da ipotensione posturale.',
    paramTags: ['ECG', 'Pressione_Arteriosa', 'Rischio_Cardiovascolare']
  },
  {
    id: 'ger_clearance_farmaci_75_plus',
    name: 'Monitoraggio Clearance Renale ed Epatica per Adeguamento Farmacologico (eGFR, Creatinina, Elettroliti)',
    ageBracket: '75_plus',
    targetGender: 'both',
    screeningType: 'routine',
    recommendedFrequencyMonths: 6,
    doctorSpecialty: 'Medicina Interna / Nefrologia',
    reason: 'Nel paziente over 75 con politerapia, il filtrato glomerulare ridotto richiede un ricalcolo periodico del dosaggio di farmaci eliminati per via renale.',
    paramTags: ['Creatinina', 'Funzionalita_Renale']
  },
  {
    id: 'ger_emocromo_malassorbimento_75_plus',
    name: 'Esami Ematochimici per Anemia Senile e Malnutrizione (Emocromo, Ferritina, Folati, B12, Albumina)',
    ageBracket: '75_plus',
    targetGender: 'both',
    screeningType: 'routine',
    recommendedFrequencyMonths: 6,
    doctorSpecialty: 'Laboratorio Analisi / Geriatria',
    reason: 'Identificazione tempestiva di anemie multifattoriali (da infiammazione cronica, sideropenica o megaloblastica) e ipoalbuminemia.',
    paramTags: ['Esami_Ematici_Base', 'Ferritina']
  },
  {
    id: 'ger_oculistica_protesi_75_plus',
    name: 'Visita Oculistica Periodica (Glaucoma, Maculopatia, Retinopatia) & Revisione Ausili Acustici',
    ageBracket: '75_plus',
    targetGender: 'both',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Oculistica / Audiologia',
    reason: 'Sorveglianza della vista e dell\'udito, cardini insostituibili per prevenire disorientamento spazio-temporale e deficit cognitivi secondari.',
    paramTags: ['Vista_Udito']
  },
  {
    id: 'ger_igiene_orale_deglutizione_75_plus',
    name: 'Controllo Odontoiatrico & Screening della Deglutizione (Prevenzione Polmoniti Ab Ingestis)',
    ageBracket: '75_plus',
    targetGender: 'both',
    screeningType: 'routine',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Odontoiatria Geriatrica / Foniatria',
    reason: 'Igiene del cavo orale e controllo delle protesi dentarie per prevenire infezioni batteriche respiratorie ab ingestis e disfagia senile.',
    paramTags: ['Odontoiatria']
  },
  {
    id: 'ger_vaccinazioni_annuali_75_plus',
    name: 'Vaccinazioni Annuali: Antinfluenzale ad Alto Dosaggio, Anti-Covid, Anti-Pneumococco',
    ageBracket: '75_plus',
    targetGender: 'both',
    screeningType: 'vaccine_recommended',
    recommendedFrequencyMonths: 12,
    doctorSpecialty: 'Medicina Generale / Igiene Pubblica',
    reason: 'Copertura vaccinale annuale intensificata per proteggere il sistema immunitario immunosenescente.',
    paramTags: ['Vaccino_Pneumococco']
  }
];

// Funzione di diagnostica e aggancio con i parametri dello screening
export interface ParamTagStatus {
  tag: string;
  isAbnormal: boolean;
  alertReason?: string;
}

export function evaluateParamTag(
  tag: string,
  result: any,
  dominoIssues: { problem: any; severity: string }[]
): ParamTagStatus {
  if (!result) return { tag, isAbnormal: false };

  const normTag = tag.toLowerCase();

  // Controllo Glicemia
  if (normTag.includes('glicem')) {
    const isMetabBad = result.metabolici?.status === 'Non Idoneo';
    const hasMetabDomino = dominoIssues.some(d => d.problem.id.includes('metabol') || d.problem.titolo.toLowerCase().includes('glicem'));
    if (isMetabBad || hasMetabDomino) {
      return {
        tag,
        isAbnormal: true,
        alertReason: 'Anomalia rilevata nel profilo glicometabolico / insulino-resistenza.'
      };
    }
  }

  // Controllo Colesterolo / Lipidi / Trigliceridi
  if (normTag.includes('colesterol') || normTag.includes('triglicerid') || normTag.includes('lipid')) {
    const isMetabBad = result.metabolici?.status === 'Non Idoneo';
    const hasDomino = dominoIssues.some(d => d.problem.id.includes('colesterolo') || d.problem.titolo.toLowerCase().includes('lipidi'));
    if (isMetabBad || hasDomino) {
      return {
        tag,
        isAbnormal: true,
        alertReason: 'Alterazione dell\'assetto lipidico aterogeno o dislipidemia rilevata.'
      };
    }
  }

  // Controllo Pressione Arteriosa / Rischio Cardiovascolare / ECG
  if (normTag.includes('pression') || normTag.includes('cardio') || normTag.includes('ecg')) {
    const isVitaliBad = result.vitali?.status === 'Non Idoneo';
    const isHeartHigh = result.heartRisk === 'high' || result.heartRisk === 'medium';
    const hasCardioDomino = dominoIssues.some(d => d.problem.id.includes('cardio') || d.problem.titolo.toLowerCase().includes('pressione'));
    if (isVitaliBad || isHeartHigh || hasCardioDomino) {
      return {
        tag,
        isAbnormal: true,
        alertReason: 'Allerta pressoria / sovraccarico ventricolare attivo nei Parametri Vitali.'
      };
    }
  }

  // Controllo Creatinina / Funzionalità Renale / Transaminasi (Organi)
  if (normTag.includes('creatinin') || normTag.includes('renal') || normTag.includes('transaminas') || normTag.includes('fegato') || normTag.includes('psa')) {
    const isOrganoBad = result.organo?.status === 'Non Idoneo';
    const hasOrganoDomino = dominoIssues.some(d => d.problem.id.includes('rene') || d.problem.id.includes('fegato') || d.problem.titolo.toLowerCase().includes('organo'));
    if (isOrganoBad || hasOrganoDomino) {
      return {
        tag,
        isAbnormal: true,
        alertReason: 'Stress funzionale parenchimale evidenziato nel modulo Organi.'
      };
    }
  }

  // Controllo Ferritina / Infiammazione
  if (normTag.includes('ferritin') || normTag.includes('infiamm') || normTag.includes('flogosi')) {
    const isInfiammBad = result.infiammatorio?.status === 'Non Idoneo';
    const hasInfiammDomino = dominoIssues.some(d => d.problem.id.includes('flogosi') || d.problem.id.includes('infiamm'));
    if (isInfiammBad || hasInfiammDomino) {
      return {
        tag,
        isAbnormal: true,
        alertReason: 'Indice flogistico sistemico o attrito citochinico attivo.'
      };
    }
  }

  // Controllo TSA (Carotidi)
  if (normTag.includes('tsa')) {
    if (result.vitali?.status === 'Non Idoneo' && result.metabolici?.status === 'Non Idoneo') {
      return {
        tag,
        isAbnormal: true,
        alertReason: 'Co-presenza di ipertensione e dislipidemia con aumentato rischio vascolare TSA.'
      };
    }
  }

  // Controllo Aorta Addominale
  if (normTag.includes('aorta')) {
    if (result.vitali?.status === 'Non Idoneo' && (result.heartRisk === 'high' || result.score < 60)) {
      return {
        tag,
        isAbnormal: true,
        alertReason: 'Pressione vascolare elevata: sorveglianza d\'organo raccomandata.'
      };
    }
  }

  // Controllo BMI / Addominale
  if (normTag.includes('bmi') || normTag.includes('addominale')) {
    if (result.metabolici?.status === 'Non Idoneo' || (result.score !== undefined && result.score < 65)) {
      return {
        tag,
        isAbnormal: true,
        alertReason: 'Profilo metabolico a rischio: richiesta verifica parametri antropometrici.'
      };
    }
  }

  return { tag, isAbnormal: false };
}
