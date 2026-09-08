function generateDeterministicOutput(json: any) {
    const elementi = json.elementi || [];
    const saturazioni = json.saturazioni || [];
    const n = elementi.length;
    
    if (n === 0) return "Nessun elemento fornito.";
    
    // CSV
    let csv = "Elemento,Saturazione (%),Theta (Rad)\n";
    const thetas = [];
    for(let i = 0; i < n; i++) {
        const P = saturazioni[i] || 0;
        const theta = (2 * Math.asin(Math.sqrt(P / 100))).toFixed(3);
        thetas.push(theta);
        csv += `${elementi[i]},${P},${theta}\n`;
    }
    
    // QASM
    let qasm = `OPENQASM 2.0;\ninclude "qelib1.inc";\n\n`;
    qasm += `// Registri per ${n} elementi + 1 ancilla (allarme)\n`;
    qasm += `qreg q[${n + 1}];\ncreg c[${n + 1}];\n\n`;
    
    qasm += `// Step 1: Encoding delle Ampiezze (Senza H iniziali che disturbano ry)\n`;
    for(let i = 0; i < n; i++) {
        qasm += `ry(${thetas[i]}) q[${i}]; // ${elementi[i]}\n`;
    }
    
    qasm += `\n// Step 2: Spartito Algoritmico (Entanglement e Allarme)\n`;
    for(let i = 0; i < n - 1; i++) {
        qasm += `cx q[${i}], q[${i+1}]; // Entanglement tra ${elementi[i]} e ${elementi[i+1]}\n`;
    }
    
    const thresholdTheta = (2 * Math.asin(Math.sqrt((json.soglia_allarme || 0) / 100))).toFixed(3);
    qasm += `ry(${thresholdTheta}) q[${n}]; // Ancilla soglia allarme (${json.soglia_allarme}%)\n`;
    qasm += `cx q[${n-1}], q[${n}]; // Propagazione allarme\n`;
    
    qasm += `\n// Step 3: Misurazione\n`;
    for(let i = 0; i <= n; i++) {
        qasm += `measure q[${i}] -> c[${i}];\n`;
    }

    let finalOutput = `Ecco l'elaborazione effettuata dal Server Quantistico Deterministic:\n\n`;
    finalOutput += `**Tabella Dati (CSV):**\n\`\`\`csv\n${csv}\`\`\`\n\n`;
    finalOutput += `**Codice OpenQASM 2.0:**\n\`\`\`qasm\n${qasm}\`\`\`\n`;
    
    return finalOutput;
}
