const fs = require('fs');
let file = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

const targetStr = `Qui sotto trovi il codice quantistico pronto nei due linguaggi principali:

### ⚛️ CIRCUITO QUANTISTICO (OpenQASM 3.0)
\\\`\\\`\\\`qasm
\${qasmSnippet}
\\\`\\\`\\\`

### 🐍 SCRIPT QUANTISTICO (Python / Qiskit)
\\\`\\\`\\\`python
\${pythonSnippet}
\\\`\\\`\\\`\`;`;

const newStr = `Qui sotto trovi i codici quantistici pronti, esportabili nei due linguaggi principali (OpenQASM puro e Python Qiskit). Sono separati in due moduli qui sotto:

\\\`\\\`\\\`qasm
\${qasmSnippet}
\\\`\\\`\\\`
\\\`\\\`\\\`python
\${pythonSnippet}
\\\`\\\`\\\`\`;`;

if (file.includes(targetStr)) {
  file = file.replace(targetStr, newStr);
  console.log("Success exact force string match");
} else {
  // Regex approach
  const regex = /Qui sotto trovi il codice quantistico pronto nei due linguaggi principali:[\s\S]*?```\`;/g;
  file = file.replace(regex, newStr);
  console.log("Regex fallback");
}

fs.writeFileSync('src/components/TestPage.tsx', file);
