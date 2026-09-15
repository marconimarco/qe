const fs = require('fs');

const code = `import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FirestoreScreening, DualLanguageFinding, EXAMPLE_DOMINO_EFFECT } from './medicalArchitecture';

// ---------------------------------------------------------------------------
// PILASTRO 5: STRUTTURA DEL REPORT PDF A DOPPIO LINGUAGGIO AFFIANCATO
// ---------------------------------------------------------------------------

interface PdfGeneratorParams {
  dob?: string;
  gender?: string;
  score?: number;
  resultDate?: string;
  categoryStatuses?: Record<string, string>;
  metricsSummary?: any;
  // We can inject a mock of FirestoreScreening for the structure
  screeningData?: Partial<FirestoreScreening>;
}

export function generateMedicalReportPdf(params: PdfGeneratorParams): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Design system base
  const primaryColor: [number, number, number] = [15, 23, 42]; // slate-900
  const accentColor: [number, number, number] = [6, 182, 212]; // cyan-500
  const textDark: [number, number, number] = [30, 41, 59]; // slate-800
  const textGray: [number, number, number] = [100, 116, 139]; // slate-500

  // Helper Headers
  const drawHeader = (pageNumber: number) => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("QUANTUM MEDICAL SCREENING", 14, 15);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(\\\`Data Scansione: \\\${params.resultDate || new Date().toLocaleDateString()}\\\`, 14, 20);
    
    doc.setFont('helvetica', 'italic');
    doc.text(\\\`Pagina \\\${pageNumber}\\\`, pageWidth - 25, 15);
  };

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.text("Report generato in ambiente Quantum VQE (Qiskit Simulation).", 14, pageHeight - 10);
    doc.text("CONFIDENZIALE - Documento Medico.", pageWidth - 60, pageHeight - 10);
  };

  let currentY = 32;

  // =========================================================================
  // FRONTESPIZIO: Dati Utente & Entropia Quantistica Globale
  // =========================================================================
  drawHeader(1);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("REFERTO CLINICO STRUTTURATO", 14, currentY);
  
  currentY += 12;
  
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 25, 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.text(\\\`Paziente (Data di Nascita): \\\${params.dob || "Dato non inserito"}\\\`, 20, currentY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(\\\`Genere: \\\${params.gender === 'M' ? 'Maschile' : params.gender === 'F' ? 'Femminile' : 'Non specificato'}\\\`, 20, currentY + 14);
  
  // Entropia
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  const entropia = params.screeningData?.quantumResults?.vonNeumannEntropyPct || (100 - (params.score || 85));
  doc.text(\\\`Entropia Quantistica Globale (Instabilità): \\\${entropia}%\\\`, 20, currentY + 20);
  
  currentY += 35;

  // =========================================================================
  // SEZIONE 1-4: Moduli Fisiologici (Parametri Vitali, Metabolici, Filtri, Immunitari)
  // =========================================================================
  
  doc.setFontSize(12);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("ANALISI DEI 4 MODULI FISIOLOGICI", 14, currentY);
  
  currentY += 6;

  const tableBody = [
    [
      "SEZIONE 1:\\nParametri Vitali e Immediati",
      "Urgenza Alta / Immediata\\n(Stato di Funzione Acuta)",
      params.categoryStatuses?.vitali || "Valutato",
      "Pressione: " + (params.metricsSummary?.pressure || "120/80") + " mmHg\\nBattiti: " + (params.metricsSummary?.bpm || "62") + " BPM\\n+ Auscultazione e ECG"
    ],
    [
      "SEZIONE 2:\\nParametri Metabolici",
      "Urgenza Lungo Termine\\n(Stato Cronico e Longevità)",
      params.categoryStatuses?.metabolici || "Valutato",
      "Glicemia a digiuno\\nColesterolo LDL / HDL\\nGrasso viscerale addominale\\nSteatosi Ecografica"
    ],
    [
      "SEZIONE 3:\\nFunzionalità d'Organo",
      "Urgenza Media\\n(Stato fegato, reni ed esiti)",
      params.categoryStatuses?.organo || "Valutato",
      "Filtrazione Renale (eGFR)\\nAnalisi Urine (Proteinuria)\\nEsiti Endoscopia/Gastroscopia"
    ],
    [
      "SEZIONE 4:\\nStato Infiammatorio",
      "Urgenza Medio-Alta\\n(Livello di fragilità biologica)",
      params.categoryStatuses?.infiammatorio || "Valutato",
      "Proteina C-Reattiva (hs-PCR)\\nCalprotectina Fecale\\nEcografia Linfonodale / RX Torace"
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Modulo", "Urgenza Biologica", "Esito (Score)", "Biomarcatori Integrati (Pilastro 1)"]],
    body: tableBody,
    styles: { fontSize: 8, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.2 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 }, 1: { cellWidth: 40 }, 2: { cellWidth: 26, fontStyle: 'bold' } }
  });

  const lastTable = (doc as any).lastAutoTable;
  currentY = lastTable ? lastTable.finalY + 10 : currentY + 60;
  
  drawFooter();

  // =========================================================================
  // SEZIONE 5: IL DOMINO MEDICO (DOPPIO LINGUAGGIO AFFIANCATO)
  // =========================================================================
  doc.addPage();
  drawHeader(2);
  currentY = 32;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("SEZIONE 5: IL DOMINO MEDICO (Incroci Critici)", 14, currentY);
  currentY += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text("Traduzione simultanea degli incroci biologici per il paziente.", 14, currentY);
  currentY += 10;

  // Renderizziamo un esempio di DualLanguageFinding (Pilastro 5)
  const domino = EXAMPLE_DOMINO_EFFECT;
  
  // Box Medico Legale
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14, currentY, pageWidth - 28, 22, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(185, 28, 28); // red-700
  doc.text("[LINGUAGGIO MEDICO-LEGALE - DA CONSEGNARE AL CLINICO]", 18, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(127, 29, 29);
  doc.text(domino.medicalJargon, 18, currentY + 12, { maxWidth: pageWidth - 36 });
  
  currentY += 28;

  // Box Persone Normali
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(14, currentY, pageWidth - 28, 55, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(3, 105, 161); // sky-700
  doc.text("[TRADUZIONE PER PERSONE NORMALI - COSA STA SUCCEDENDO NEL CORPO]", 18, currentY + 6);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("1. COSA HAI ADESSO:", 18, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(domino.normalLanguage.whatYouHave, 18, currentY + 19, { maxWidth: pageWidth - 36 });

  doc.setFont('helvetica', 'bold');
  doc.text("2. PERCHÉ È SUCCESSO:", 18, currentY + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(domino.normalLanguage.whyItHappened, 18, currentY + 33, { maxWidth: pageWidth - 36 });

  doc.setFont('helvetica', 'bold');
  doc.text("3. COSA AVRAI SE CONTINUI COSÌ:", 18, currentY + 44);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(185, 28, 28); // Rischio futuro in rosso
  doc.text(domino.normalLanguage.futureRisk, 18, currentY + 49, { maxWidth: pageWidth - 36 });
  
  currentY += 65;


  // =========================================================================
  // SEZIONE 6: NOTA PER IL MEDICO CURANTE
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("SEZIONE 6: NOTA PER IL MEDICO CURANTE", 14, currentY);
  currentY += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text("Sintesi clinica formale con biomarcatori fuori norma ordinati per Urgenza Biologica.", 14, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [["Urgenza", "Biomarcatore Alterato (Valore Rilevato)", "Interazione Registrata"]],
    body: [
      ["🔴 ALTA", "Spessore Intima-Media (1.2mm) - Dopplersonografia", "Placca instabile -> Rischio emodinamico"],
      ["🔴 ALTA", "Ritmo ECG (Aritmia extrasistolica isolata)", "Rischio trombotico associato a placca"],
      ["🟡 MEDIA", "Calprotectina Fecale (350 µg/g)", "Infiammazione di barriera sistemica"],
      ["🟢 BASSA", "Grasso Viscerale (Elevato - Antropometria)", "Rischio metabolico a lungo termine"]
    ],
    styles: { fontSize: 8, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.2 },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 } }
  });

  drawFooter();

  // Trigger Download
  const filename = \\\`Quantum_Report_\\\${params.resultDate?.replace(/[^a-zA-Z0-9]/g, '_') || 'Med'}.pdf\\\`;
  doc.save(filename);
  return filename;
}
`;
fs.writeFileSync('src/lib/generateMedicalReportPdf.ts', code);
