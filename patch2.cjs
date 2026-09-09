const fs = require('fs');
let file = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

const regex = /const codeSnippet = isQ[\s\S]*?```\`;\n  \};/m;

const replacement = `const qasmSnippet = generateQiskitCode(sector, currentCsv1, currentCsv2, vincolo);
    const pythonSnippet = generateQiskitPythonCode(sector, currentCsv1, currentCsv2, vincolo);

    return \`\\n\\n🎉 **[SIMULAZIONE COMPLETATA — RISULTATI IN SINTESI]**

• **Settore & Scenario:** \${sector || 'Azienda'} (\${selectedScenario?.name || 'Ottimizzazione'})
• **Periodo:** \${periodo || '1 Trimestre'}
• **Regola Vincoli:** \${vincoloNome}

📊 **Cosa mostra la Sfera a destra:**
• **Stabilità (\${p0}%):** Solidità e sicurezza del piano trovato.
• **Rischio residuo (\${p1}%):** Margine da monitorare.
• **Angoli (θ=\${angleTheta}°, φ=\${anglePhi}°):** Posizione della soluzione calcolata.

Puoi esplorare la sfera 3D a destra per simulare variazioni.

Qui sotto trovi il codice quantistico pronto nei due linguaggi principali:

---
### ⚛️ CIRCUITO QUANTISTICO (OpenQASM 3.0)
\\\`\\\`\\\`qasm
\${qasmSnippet}
\\\`\\\`\\\`

---
### 🐍 SCRIPT QUANTISTICO (Python / Qiskit)
\\\`\\\`\\\`python
\${pythonSnippet}
\\\`\\\`\\\`
\`;
  };`;

file = file.replace(regex, replacement);
fs.writeFileSync('src/components/TestPage.tsx', file);
console.log("Replaced final outcome");
