const fs = require('fs');
let file = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

const target = `    const codeSnippet = isQ 
      ? generateQiskitCode(sector, currentCsv1, currentCsv2, vincolo) 
      : generateQiskitPythonCode(sector, currentCsv1, currentCsv2, vincolo);
    const codeLang = isQ ? 'qasm' : 'python';

    return \`\\n\\n🎉 **[SIMULAZIONE COMPLETATA — RISULTATI IN SINTESI]**
• **Settore & Scenario:** \${sector || 'Azienda'} (\${selectedScenario?.name || 'Ottimizzazione'})
• **Periodo:** \${periodo || '1 Trimestre'}
• **Algoritmo:** \\\`\${algo}\\\` (\${isQ ? 'Chip Quantistico' : 'Computer Classico'})
• **Regola Vincoli:** \${vincoloNome}
📊 **Cosa mostra la Sfera a destra:**
• **Stabilità (\${p0}%):** Solidità e sicurezza del piano trovato.
• **Rischio residuo (\${p1}%):** Margine da monitorare.
• **Angoli (θ=\${angleTheta}°, φ=\${anglePhi}°):** Posizione della soluzione calcolata.
Puoi esplorare la sfera 3D a destra per simulare variazioni. Qui sotto trovi il codice pronto per la tua infrastruttura:
\\\`\\\`\\\`\${codeLang}
\${codeSnippet}
\\\`\\\`\\\`\`;`;

const replacement = `    const qasmSnippet = generateQiskitCode(sector, currentCsv1, currentCsv2, vincolo);
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

### ⚛️ CIRCUITO QUANTISTICO (OpenQASM 3.0)
\\\`\\\`\\\`qasm
\${qasmSnippet}
\\\`\\\`\\\`

### 🐍 SCRIPT QUANTISTICO (Python / Qiskit)
\\\`\\\`\\\`python
\${pythonSnippet}
\\\`\\\`\\\`\`;`;

file = file.replace(target, replacement);

// check if successful
if (file.includes("generateQiskitPythonCode(sector, currentCsv1, currentCsv2, vincolo);\n\n    return")) {
    console.log("Success exact patch");
} else {
    // maybe newlines are different
    const parts = file.split("const codeSnippet = isQ");
    if (parts.length > 1) {
        const p2 = parts[1].split("  };\n\n  const handleSend")[0];
        file = file.replace("const codeSnippet = isQ" + p2, replacement);
        console.log("Success manual split patch");
    } else {
        console.log("Failed");
    }
}

fs.writeFileSync('src/components/TestPage.tsx', file);

