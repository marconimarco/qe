const fs = require('fs');
let file = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

// 1. Change the text "Puoi esplorare..."
file = file.replace('Puoi esplorare la sfera 3D a destra per simulare variazioni.', 'Puoi visionare il risultato dalla sfera 3D a destra.');

// 2. Add explanation of what they will get
const outcomeText = `Puoi visionare il risultato dalla sfera 3D a destra.

### 🎯 Cosa ottieni eseguendo questi codici?
Questi script sono il "motore" pronto all'uso del tuo progetto. Eseguendoli (su un computer normale o su uno quantistico IBM), la macchina leggerà i tuoi file CSV e ti restituirà **la lista esatta delle decisioni ottimali da prendere** (es. quali asset attivare o quali rotte scegliere) con la massima efficienza matematica. In parole povere: ti dirà esattamente cosa fare per massimizzare il risultato rispettando i vincoli!`;

file = file.replace('Puoi visionare il risultato dalla sfera 3D a destra.', outcomeText);

// 3. Add explanation to Demo CSV Notice about entanglement
const csvDemoText = `Se il tuo browser ha bloccato il download automatico, puoi scaricarli usando i pulsanti qui sotto o copiarne il contenuto negli appunti tramite l'icona <Copy className="inline w-3 h-3 text-slate-400" />:
            </p>
            <div className="p-2 mb-1 mt-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-300">
              💡 <strong>Dove si trova l'Entanglement?</strong> L'Entanglement (ovvero il vincolo e l'interazione tra due risorse) viene definito esclusivamente nel file <strong>2_matrice_connessioni</strong>. Nello specifico, si crea quando inserisci un valore numerico (es. 0.5 o 1.0) nella colonna corrispondente all'incrocio tra due ID diversi (es. riga "asset_01", colonna "asset_02").
            </div>`;

file = file.replace('Se il tuo browser ha bloccato il download automatico, puoi scaricarli usando i pulsanti qui sotto o copiarne il contenuto negli appunti tramite l\'icona <Copy className="inline w-3 h-3 text-slate-400" />:\n            </p>', csvDemoText);

fs.writeFileSync('src/components/TestPage.tsx', file);
