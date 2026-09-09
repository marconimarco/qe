const fs = require('fs');
let file = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

file = file.replace(/  \};\n  \};\n\n  \/\/ Current active scenarios/, '  };\n\n  // Current active scenarios');
fs.writeFileSync('src/components/TestPage.tsx', file);
