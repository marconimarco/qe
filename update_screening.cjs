const fs = require('fs');

let content = fs.readFileSync('src/components/MedicalScreening.tsx', 'utf8');

const targetStr = `    const newRep: AcquiredReport = {
      id: \`rep-\${Date.now()}\`,
      name: file.name,
      date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      type: isPdf ? 'pdf' : isCsv ? 'csv' : 'photo',`;

const replacementStr = `    const docTypeLabel = methodToSet === 'mix' ? 'Referto Risonanza/TAC' : (isCsv ? 'Sync Dispositivo' : (isPdf ? 'Referto Analisi' : 'Foto Referto'));
    
    const newRep: AcquiredReport = {
      id: \`rep-\${Date.now()}\`,
      name: \`\${docTypeLabel} - \${new Date().toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}\`,
      originalFilename: file.name,
      date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      type: isPdf ? 'pdf' : isCsv ? 'csv' : 'photo',`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/MedicalScreening.tsx', content);
console.log("Updated handleUploadNewReport");
