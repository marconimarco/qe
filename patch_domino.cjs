const fs = require('fs');
let content = fs.readFileSync('src/components/DominoModal.tsx', 'utf-8');

// Reduce header padding
content = content.replace(/p-6 md:p-8/g, 'p-4 md:p-6');
content = content.replace(/text-2xl md:text-3xl/g, 'text-xl md:text-2xl');

// Content padding
content = content.replace(/p-6 md:p-8 pt-6/g, 'p-4 md:p-6 pt-4');

// Steps padding
content = content.replace(/p-5 md:p-6/g, 'p-4 md:p-5');

// Arrow spacing
content = content.replace(/my-3/g, 'my-2');

fs.writeFileSync('src/components/DominoModal.tsx', content);
