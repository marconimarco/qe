const fs = require('fs');

let modal = fs.readFileSync('src/components/AcquiredReportsModal.tsx', 'utf8');

// Add originalFilename to interface
modal = modal.replace("type: 'pdf' | 'photo' | 'csv' | 'manual';", "type: 'pdf' | 'photo' | 'csv' | 'manual';\n  originalFilename?: string;");

// Update the rendering of the report name to include the original filename
const nameBlock = `                          <h4 className="text-sm font-semibold text-white tracking-wide">
                            {report.name}
                          </h4>`;
const newNameBlock = `                          <h4 className="text-sm font-semibold text-white tracking-wide">
                            {report.name}
                          </h4>
                          {report.originalFilename && (
                            <span className="text-[10px] text-slate-400 border border-slate-700 bg-slate-800/50 px-2 py-0.5 rounded flex items-center gap-1" title="Nome file originale">
                              📄 {report.originalFilename}
                            </span>
                          )}`;
modal = modal.replace(nameBlock, newNameBlock);

// Update the "Simula Qiskit" button to explain its action better
const buttonBlock = `title="Usa per il calcolo quantistico"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Simula Qiskit</span>`;
const newButtonBlock = `title="Invia i dati estratti da questo file al motore Quantum (PySkypy) per l'analisi nella dashboard principale."
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Applica al Modello</span>`;
modal = modal.replace(buttonBlock, newButtonBlock);

fs.writeFileSync('src/components/AcquiredReportsModal.tsx', modal);
console.log("Updated Modal.");
