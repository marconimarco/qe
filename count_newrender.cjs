const newRender = `const parts = text.split(/(^\\s*\`\`\`[\\s\\S]*?\`\`\`\\s*$)/gm);

    // Filter out empty parts
    const validParts = parts.filter(p => p.trim() !== '');

    // Group code blocks if they are consecutive
    const groupedParts = [];
    let currentGroup = [];

    for (let i = 0; i < validParts.length; i++) {
      const part = validParts[i];
      if (part.trim().startsWith('\`\`\`') && part.trim().endsWith('\`\`\`')) {
        currentGroup.push(part);
      } else {
        if (currentGroup.length > 0) {
          groupedParts.push({ type: 'code-group', blocks: currentGroup });
          currentGroup = [];
        }
        groupedParts.push({ type: 'text', content: part });
      }
    }
    if (currentGroup.length > 0) {
      groupedParts.push({ type: 'code-group', blocks: currentGroup });
    }

    return (
      <div className="flex flex-col gap-2.5">
        {isCsvConfirm && (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 font-bold text-xs uppercase tracking-wider shadow-sm">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Notifica Ufficiale: File CSV Validati con Successo</span>
          </div>
        )}
        {isDemoCsvNotice && (
          <div className="p-3 bg-cyan-950/70 border border-cyan-500/40 rounded-xl flex flex-col gap-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                <Download className="w-4 h-4 text-cyan-400" /> Modelli CSV con Guida di Formattazione Scaricati
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                Pronti all'uso
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Se il tuo browser ha bloccato il download automatico, puoi scaricarli usando i pulsanti qui sotto o copiarne il contenuto negli appunti tramite l'icona <Copy className="inline w-3 h-3 text-slate-400" />:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <CsvButton filename="1_anagrafica_risorse_guida.csv" content={currentCsv1} label="1_anagrafica_risorse_guida.csv" />
              <CsvButton filename="2_matrice_connessioni_guida.csv" content={currentCsv2} label="2_matrice_connessioni_guida.csv" />
            </div>
          </div>
        )}
        {isSimulationComplete && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-300 font-bold text-xs uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Esito Finale dell'Ottimizzazione & Spiegazione Risultati</span>
          </div>
        )}
        {groupedParts.map((group, idx) => {
          if (group.type === 'text') {
            return (
              <div key={idx} className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                {group.content}
              </div>
            );
          } else {
            return (
              <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start w-full">
                {group.blocks.map((part, bIdx) => {
                  const raw = part.trim().slice(3, -3).trim();
                  const firstNewline = raw.indexOf('\\n');
                  let lang = 'code';
                  let codeContent = raw;
                  if (firstNewline !== -1) {
                    const possibleLang = raw.slice(0, firstNewline).trim();
                    if (/^[a-zA-Z0-9_-]+$/.test(possibleLang)) {
                      lang = possibleLang;
                      codeContent = raw.slice(firstNewline + 1);
                    }
                  }
                  let title = lang.toUpperCase();
                  if (lang.toLowerCase() === 'python') title = '🐍 SCRIPT (Python / Qiskit)';
                  if (lang.toLowerCase() === 'qasm' || lang.toLowerCase().includes('qiskit')) title = '⚛️ CIRCUITO QUANTISTICO (OpenQASM 3.0)';
                  if (lang.toLowerCase() === 'json') title = '📋 MANIFESTO DI CONFIGURAZIONE JSON';

                  return (
                    <div key={bIdx} className="w-full min-w-0">
                      <CodeBlockWithCopy
                        code={codeContent}
                        language={lang}
                        title={title}
                      />
                    </div>
                  );
                })}
              </div>
            );
          }
        })}
      </div>
    );
  };`;

  let open = 0;
  let close = 0;
  for (let char of newRender) {
    if (char === '{') open++;
    if (char === '}') close++;
  }
  console.log('NewRender Open:', open, 'Close:', close);
