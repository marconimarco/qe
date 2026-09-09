const fs = require('fs');
let file = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

const regex = /Qui sotto trovi il codice quantistico pronto nei due linguaggi principali:[\s\S]*?```\`;/m;

const replacement = `Qui sotto trovi i codici quantistici pronti, esportabili nei due linguaggi principali (OpenQASM puro e Python Qiskit). Sono separati in due moduli qui sotto:

\`\`\`qasm
\${qasmSnippet}
\`\`\`
\`\`\`python
\${pythonSnippet}
\`\`\`\`;`;

file = file.replace(regex, replacement);
fs.writeFileSync('src/components/TestPage.tsx', file);
console.log("Patched outcome");
