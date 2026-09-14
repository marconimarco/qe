import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CATEGORY_DETAILS_ENRICHED, CROSS_PARAMETER_PROBLEMS } from '../data/medicalCategoriesData';

interface ReportParams {
  dob?: string;
  gender?: string;
  score: number;
  resultDate: string;
  categoryStatuses: {
    vitali: string;
    metabolici: string;
    organo: string;
    infiammatorio: string;
  };
  metricsSummary?: {
    bpm?: string;
    pressure?: string;
    spo2?: string;
    stress?: string;
  };
}

export function generateMedicalReportPdf(params: ReportParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Primary palette
  const primaryColor = [11, 23, 42]; // dark navy
  const accentCyan = [6, 182, 212];
  const accentRed = [225, 29, 72];
  const textDark = [30, 41, 59];
  const textGray = [100, 116, 139];

  // Helper Header
  const drawHeader = (pageNumber: number) => {
    // Top banner bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 26, 'F');

    doc.setFillColor(6, 182, 212);
    doc.rect(0, 26, pageWidth, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("QUANTUM MEDICAL SCREENING", 14, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Dossier Clinico Biometrico & Analisi Integrata Multidimensionale", 14, 20);

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Data Emissione: ${params.resultDate}`, pageWidth - 14, 13, { align: 'right' });
    doc.setTextColor(148, 163, 184);
    doc.text(`Pagina ${pageNumber}`, pageWidth - 14, 20, { align: 'right' });
  };

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    const footerText = "DOCUMENTO AD ESCLUSIVO USO MEDICO INFORMATIVO - NON SOSTITUISCE LA DIAGNOSI DEL MEDICO CURANTE O DELLO SPECIALISTA.";
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);
  };

  // PAGE 1: Panoramica Paziente e Valutazione delle 4 Macro-Categorie
  drawHeader(1);

  let currentY = 36;

  // Box Dati Paziente
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("PROFILO ANAGRAFICO & TENSIONE QUANTISTICA", 20, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);

  const genderLabel = params.gender === 'M' ? 'Maschio' : params.gender === 'F' ? 'Femmina' : 'Non specificato';
  doc.text(`Sesso Biologico: ${genderLabel}`, 20, currentY + 15);
  doc.text(`Data di Nascita: ${params.dob || 'Non specificata'}`, 20, currentY + 21);

  doc.text(`Pressione Rilevata: ${params.metricsSummary?.pressure || '120/80'} mmHg`, 90, currentY + 15);
  doc.text(`Frequenza Riposo: ${params.metricsSummary?.bpm || '62'} BPM`, 90, currentY + 21);

  // Score badge
  doc.setFillColor(params.score >= 70 ? 236 : 254, params.score >= 70 ? 253 : 242, params.score >= 70 ? 245 : 242);
  doc.setDrawColor(params.score >= 70 ? 16 : 225, params.score >= 70 ? 185 : 29, params.score >= 70 ? 129 : 72);
  doc.roundedRect(pageWidth - 65, currentY + 4, 46, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(params.score >= 70 ? 5 : 159, params.score >= 70 ? 150 : 18, params.score >= 70 ? 105 : 57);
  doc.text(`${params.score}%`, pageWidth - 42, currentY + 12, { align: 'center' });

  doc.setFontSize(7);
  doc.text("INDICE LONGEVITÀ", pageWidth - 42, currentY + 18, { align: 'center' });

  currentY += 34;

  // Intestazione Sezione Categorie
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("QUADRO CLINICO DELLE 4 MACRO-CATEGORIE BIOLOGICHE", 14, currentY);

  currentY += 4;

  const tableBody = [
    [
      "1. Parametri Vitali",
      "Urgenza Alta / Immediata\n(Pericolo acuto)",
      params.categoryStatuses.vitali,
      "Pressione: " + (params.metricsSummary?.pressure || "120/80") + " mmHg\nBattiti: " + (params.metricsSummary?.bpm || "62") + " BPM",
      "Allarmi: giramenti di testa, affanno a riposo, palpitazioni, estremità fredde."
    ],
    [
      "2. Parametri Metabolici\ne Longevità",
      "Urgenza Lungo Termine\n(Silenziosi, 5-10 anni)",
      params.categoryStatuses.metabolici,
      "Glicemia a digiuno\nColesterolo LDL / HDL\nGrasso viscerale addominale",
      "Allarmi: sonnolenza post-prandiale, picchi di fame di dolci, aumento girovita."
    ],
    [
      "3. Funzionalità d'Organo\ned Emocromo",
      "Urgenza Media\n(Resistenza filtri d'organo)",
      params.categoryStatuses.organo,
      "Filtrazione Renale (eGFR)\nTransaminasi Epatica (ALT/AST)\nEmocromo ed Elettroliti",
      "Allarmi: pallore viso/mucose, urine scure o schiumose, digestione rallentata."
    ],
    [
      "4. Stato Infiammatorio\ne Immunitario",
      "Urgenza Medio-Alta\n(Minaccia attiva silente)",
      params.categoryStatuses.infiammatorio,
      "Proteina C-Reattiva (hs-PCR)\nFormula Leucocitaria\nReattività Autoimmune",
      "Allarmi: influenze frequenti (>3/anno), dolori articolari vaganti, dermatiti."
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Macro-Categoria", "Urgenza Biologica", "Giudizio", "Biomarcatori Chiave", "Campanelli d'Allarme"]],
    body: tableBody,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 38 },
      1: { cellWidth: 34 },
      2: { cellWidth: 26, fontStyle: 'bold' },
      3: { cellWidth: 44 },
      4: { cellWidth: 44 }
    }
  });

  const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  currentY = lastTable ? lastTable.finalY + 8 : currentY + 65;

  // Box Effetto Domino Sintesi
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14, currentY, pageWidth - 28, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(185, 28, 28);
  doc.text("ATTENZIONE: IL CORPO UMANO FUNZIONA AD 'EFFETTO DOMINO'", 20, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(127, 29, 29);

  const dominoSummary = [
    "1. La Scintilla Iniziale (Metabolici): Zuccheri in eccesso e grasso viscerale provocano stress cellulare ed endoteliale.",
    "2. L'Incendio Silenzioso (Infiammatorio): Si attivano i globuli bianchi e la PCR si alza, instaurando infiammazione di basso grado.",
    "3. Il Logoramento dei Filtri (Organo): L'infiammazione bombarda fegato e reni, compromettendo la detossificazione del sangue.",
    "4. Il Crollo di Emergenza (Vitali): Le tossine e i vasi irrigiditi fanno schizzare la pressione e sforzano il muscolo cardiaco."
  ];

  dominoSummary.forEach((step, idx) => {
    doc.text(step, 20, currentY + 14 + (idx * 5.5));
  });

  drawFooter();

  // ================= PAGE 2: INCROCI DEI PARAMETRI E APPROFONDIMENTO CLINICO =================
  doc.addPage();
  drawHeader(2);

  currentY = 36;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("MATRICE DEGLI INCROCI DEI PARAMETRI & PATOLOGIE COMBINATE", 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text("Analisi molecolare di come l'interazione tra differenti biomarcatori innesca eventi acuti vascolari e d'organo.", 14, currentY + 5);

  currentY += 12;

  // INCROCIO #1 (Richiesto esplicitamente dal medico / utente): Glicemia + Colesterolo LDL -> Ictus Ischemico
  doc.setFillColor(255, 241, 242);
  doc.setDrawColor(244, 63, 94);
  doc.roundedRect(14, currentY, pageWidth - 28, 64, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(190, 18, 60);
  doc.text("INCROCIO CRITICO 1: Aterosclerosi Acelerata & Rischio Ictus Ischemico (o Ischemia)", 20, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("Parametri Incrociati: Glicemia a Digiuno/HbA1c  +  Colesterolo LDL Elevato  +  hs-PCR  +  Pressione Arteriosa", 20, currentY + 13);

  // Fasi dettagliate
  const fasiIctus = [
    {
      titolo: "Danno iniziale (Glicemia alta):",
      testo: "Il glucosio in eccesso nel sangue lesiona e infiamma il rivestimento interno dei vasi (endotelio), creando micro-fratture e rendendo la parete arteriosa ruvida e fragile."
    },
    {
      titolo: "Infiltrazione e deposito (Colesterolo LDL elevato):",
      testo: "Sfruttando queste lesioni dell'endotelio, il colesterolo LDL si insinua nello spessore della parete del vaso, ossidandosi e trasformandosi rapidamente in placche aterosclerotiche."
    },
    {
      titolo: "L'evento acuto (Azione combinata):",
      testo: "L'infiammazione cronica unita fa crescere la placca e la rende instabile. Quando la placca si spacca o si erode, il sangue a contatto con il suo interno attiva la coagulazione formando un trombo: se questo chiude un'arteria cerebrale, si scatena l'ictus ischemico (o ischemia)."
    }
  ];

  let faseY = currentY + 19;
  fasiIctus.forEach((fase) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(159, 18, 57);
    doc.text(fase.titolo, 20, faseY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(51, 65, 85);
    const splitText = doc.splitTextToSize(fase.testo, pageWidth - 42);
    doc.text(splitText, 20, faseY + 4);
    faseY += 13;
  });

  currentY += 70;

  // INCROCIO #2: Ipertensione + Infiammazione -> Scompenso Cardio-Renale
  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(251, 146, 60);
  doc.roundedRect(14, currentY, pageWidth - 28, 40, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(194, 65, 12);
  doc.text("INCROCIO 2: Scompenso Cardio-Renale & Rigidità Arteriosa", 20, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(67, 56, 202);
  doc.text("Parametri: Ipertensione Arteriosa Sistolica/Diastolica  x  hs-PCR  x  Filtrato Renale (eGFR)", 20, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const textRenale = "L'elevata pressione idraulica danneggia i capillari glomerulari renali, mentre le citochine infiammatorie bloccano i processi di riparazione tissutale. I reni perdono capacità filtrante, trattenendo sodio e liquidi: l'ipervolemia che ne consegue fa salire ulteriormente la pressione arteriosa, creando un circolo vizioso che sovraccarica pericolosamente il cuore.";
  const splitRenale = doc.splitTextToSize(textRenale, pageWidth - 42);
  doc.text(splitRenale, 20, currentY + 19);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(194, 65, 12);
  doc.text("Azione raccomandata: Dosaggio microalbuminuria 24h e monitoraggio pressorio holter.", 20, currentY + 34);

  currentY += 46;

  // Box per il Medico Curante / Firma
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, pageWidth - 28, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("SPAZIO RISERVATO ALLE NOTE E PRESCRIZIONI DEL MEDICO CURANTE:", 20, currentY + 7);

  doc.setDrawColor(226, 232, 240);
  doc.line(20, currentY + 14, pageWidth - 20, currentY + 14);
  doc.line(20, currentY + 20, pageWidth - 20, currentY + 20);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text("Timbro e Firma del Medico: _____________________________________", pageWidth - 100, currentY + 28);

  drawFooter();

  // Trigger Download
  const filename = `Quantum_Medical_Report_${params.resultDate.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
  return filename;
}
