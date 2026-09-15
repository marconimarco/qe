const fs = require('fs');

// Fix generateMedicalReportPdf.ts
let pdfFile = fs.readFileSync('src/lib/generateMedicalReportPdf.ts', 'utf8');
pdfFile = pdfFile.replace(/\\`/g, '`');
fs.writeFileSync('src/lib/generateMedicalReportPdf.ts', pdfFile);

// Fix medicalArchitecture.ts
let archFile = fs.readFileSync('src/lib/medicalArchitecture.ts', 'utf8');
archFile = archFile.replace(/\\`/g, '`');
fs.writeFileSync('src/lib/medicalArchitecture.ts', archFile);

