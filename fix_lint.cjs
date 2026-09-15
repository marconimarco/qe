const fs = require('fs');
let content = fs.readFileSync('src/components/MedicalScreening.tsx', 'utf8');

content = content.replace(
  "const handleUploadNewReport = (file: File, forceMethod?: 'photo' | 'mix') => {",
  "const handleUploadNewReport = (file: File, forceMethod?: 'photo' | 'mix' | 'smartwatch') => {"
);

fs.writeFileSync('src/components/MedicalScreening.tsx', content);
console.log("Lint fixed");
