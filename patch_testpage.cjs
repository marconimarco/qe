const fs = require('fs');

let file = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

// 1. Replace import
file = file.replace(/generatePythonCode/g, 'generateQiskitPythonCode');

// 2. Remove infrastructure phase transition
// Replace:
// } else if (activePhase === '3b_strat') {
//   setSelectedStrategy(userMessage);
//   nextPhase = '4a_infra';
// } else if (activePhase === '4a_infra') {
//   const isQ = userMessage.toLowerCase().includes('quantistica') || userMessage.toLowerCase().includes('qiskit');
//   setSelectedInfra(isQ ? 'quantum' : 'classical');
//   nextPhase = '4b_vinc';
// }

const phaseTrans1 = `    } else if (activePhase === '3b_strat') {
      setSelectedStrategy(userMessage);
      nextPhase = '4a_infra';
    } else if (activePhase === '4a_infra') {
      const isQ = userMessage.toLowerCase().includes('quantistica') || userMessage.toLowerCase().includes('qiskit');
      setSelectedInfra(isQ ? 'quantum' : 'classical');
      nextPhase = '4b_vinc';
    }`;
const phaseTrans1New = `    } else if (activePhase === '3b_strat') {
      setSelectedStrategy(userMessage);
      setSelectedInfra('quantum'); // default to quantum since we output both
      nextPhase = '4b_vinc';
    } else if (activePhase === '4a_infra') {
      nextPhase = '4b_vinc'; // Fallback just in case
    }`;
file = file.replace(phaseTrans1, phaseTrans1New);

// 3. Remove infrastructure prompt
// Replace generateArchitectResponse phase 3b_strat and 4a_infra

file = file.replace(/if \(phase === '3b_strat'\) \{[\s\S]*?return reply;\n    \}/, `if (phase === '3b_strat') {
      let reply = \`Strategia scelta: **\${userInput}**.\\n\\n\`;
      reply += \`👉 **Fase 4B: Regola per le risorse collegate (entanglement)**\\n\`;
      reply += \`Nei tuoi dati ci sono elementi legati tra loro. Che regola usiamo?\\n\\n\`;
      reply += \`🔒 **1. Blocco Rigido (O l'uno o l'altro):**\\n\`;
      reply += \`\${dynTexts.vincHard}\\n\\n\`;
      reply += \`🔀 **2. Legame Morbido (Meglio insieme):**\\n\`;
      reply += \`\${dynTexts.vincSoft}\\n\\n\`;
      reply += \`Quale regola preferisci?\`;
      return reply;
    }`);

file = file.replace(/if \(phase === '4a_infra'\) \{[\s\S]*?return reply;\n    \}/, `if (phase === '4a_infra') {
      return "Procediamo con i vincoli."; // Skip
    }`);

// 4. Update buildFinalOutcomeExplanation
const finalOutcomeOld = `    const codeSnippet = isQ 
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

const finalOutcomeNew = `    const qasmSnippet = generateQiskitCode(sector, currentCsv1, currentCsv2, vincolo);
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

file = file.replace(finalOutcomeOld, finalOutcomeNew);

fs.writeFileSync('src/components/TestPage.tsx', file);
console.log("Updated TestPage.tsx");
