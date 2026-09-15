const fs = require('fs');
let code = fs.readFileSync('src/lib/generateMedicalReportPdf.ts', 'utf8');

// Replace multiline double quoted strings with escaped newlines or just spaces
code = code.replace(/"SEZIONE 1:\nParametri Vitali e Immediati"/g, '"SEZIONE 1:\\nParametri Vitali e Immediati"');
code = code.replace(/"Urgenza Alta \/ Immediata\n\(Stato di Funzione Acuta\)"/g, '"Urgenza Alta / Immediata\\n(Stato di Funzione Acuta)"');
code = code.replace(/"Pressione: " \+ \(params.metricsSummary\?\.pressure \|\| "120\/80"\) \+ " mmHg\nBattiti: " \+ \(params.metricsSummary\?\.bpm \|\| "62"\) \+ " BPM\n\+ Auscultazione e ECG"/g, '"Pressione: " + (params.metricsSummary?.pressure || "120/80") + " mmHg\\nBattiti: " + (params.metricsSummary?.bpm || "62") + " BPM\\n+ Auscultazione e ECG"');

code = code.replace(/"SEZIONE 2:\nParametri Metabolici"/g, '"SEZIONE 2:\\nParametri Metabolici"');
code = code.replace(/"Urgenza Lungo Termine\n\(Stato Cronico e Longevità\)"/g, '"Urgenza Lungo Termine\\n(Stato Cronico e Longevità)"');
code = code.replace(/"Glicemia a digiuno\nColesterolo LDL \/ HDL\nGrasso viscerale addominale\nSteatosi Ecografica"/g, '"Glicemia a digiuno\\nColesterolo LDL / HDL\\nGrasso viscerale addominale\\nSteatosi Ecografica"');

code = code.replace(/"SEZIONE 3:\nFunzionalità d'Organo"/g, '"SEZIONE 3:\\nFunzionalità d\'Organo"');
code = code.replace(/"Urgenza Media\n\(Stato fegato, reni ed esiti\)"/g, '"Urgenza Media\\n(Stato fegato, reni ed esiti)"');
code = code.replace(/"Filtrazione Renale \(eGFR\)\nAnalisi Urine \(Proteinuria\)\nEsiti Endoscopia\/Gastroscopia"/g, '"Filtrazione Renale (eGFR)\\nAnalisi Urine (Proteinuria)\\nEsiti Endoscopia/Gastroscopia"');

code = code.replace(/"SEZIONE 4:\nStato Infiammatorio"/g, '"SEZIONE 4:\\nStato Infiammatorio"');
code = code.replace(/"Urgenza Medio-Alta\n\(Livello di fragilità biologica\)"/g, '"Urgenza Medio-Alta\\n(Livello di fragilità biologica)"');
code = code.replace(/"Proteina C-Reattiva \(hs-PCR\)\nCalprotectina Fecale\nEcografia Linfonodale \/ RX Torace"/g, '"Proteina C-Reattiva (hs-PCR)\\nCalprotectina Fecale\\nEcografia Linfonodale / RX Torace"');

fs.writeFileSync('src/lib/generateMedicalReportPdf.ts', code);
console.log("Fixed strings in PDF generator");
