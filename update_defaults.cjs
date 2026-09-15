const fs = require('fs');
let content = fs.readFileSync('src/components/MedicalScreening.tsx', 'utf8');

content = content.replace("name: 'Esami Sangue (Lab. Sant\\'Anna)'", "name: 'Esami Sangue (Lab. Sant\\'Anna)', originalFilename: 'esami_sangue_completo_v2.pdf'");
content = content.replace("name: 'Risonanza Magnetica Encefalo'", "name: 'Risonanza Magnetica Encefalo', originalFilename: 'rm_encefalo_referto_finale.pdf'");
content = content.replace("name: 'Export Dati Apple Watch'", "name: 'Export Dati Apple Watch', originalFilename: 'health_data_export.csv'");

fs.writeFileSync('src/components/MedicalScreening.tsx', content);
console.log("Defaults updated.");
