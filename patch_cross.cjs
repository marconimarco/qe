const fs = require('fs');
let content = fs.readFileSync('src/components/CrossParameterAnalysis.tsx', 'utf-8');

// Reduce main container padding
content = content.replace(/p-4 md:p-5 mt-6/g, 'p-3 md:p-4 mt-4');
content = content.replace(/mb-5 space-y-2/g, 'mb-3 space-y-1');
content = content.replace(/text-xl md:text-2xl/g, 'text-lg md:text-xl');

// Card padding
content = content.replace(/p-3 md:p-4/g, 'p-3');
content = content.replace(/text-base md:text-lg/g, 'text-sm md:text-base');

fs.writeFileSync('src/components/CrossParameterAnalysis.tsx', content);
