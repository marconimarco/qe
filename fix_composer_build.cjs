const fs = require('fs');
let file = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

// The file now contains the new composer AND the leftover old status bar.
// Let's find the new composer and the leftover parts.
const startIndex = file.indexOf('{/* Composer IBM Quantum (Mockup) */}');
if (startIndex !== -1) {
  // Let's just find the end of the leftover status bar which ends with:
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  
  // We want to replace from startIndex all the way down to just before the final closing tags of the component.
  // Actually, we can just grab from `{/* Composer IBM Quantum (Mockup) */}` to the end of the file, and rebuild it.
  
  const restOfFile = file.slice(startIndex);
  // Re-build it cleanly
  const cleanEnding = `        </div>
      </div>
    </div>
  );
}`;

  const newComposerFull = `{/* Composer IBM Quantum (Mockup) */}
          <div className="bg-[#161616] border border-white/10 rounded-xl font-mono text-xs shadow-2xl flex flex-col relative overflow-hidden mt-4">
            <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 bg-[#1e1e1e] px-4 py-3">
              <Cpu className="w-4 h-4 text-[#33b1ff]" /> IBM Quantum Composer Visualizer
            </div>
            
            <div className="flex flex-col overflow-x-auto pb-8 pt-6 px-4 scrollbar-thin scrollbar-thumb-slate-700">
              <div className="relative min-w-max px-2 flex flex-col gap-8">
                
                {/* Wires Background */}
                <div className="absolute top-[16px] left-6 right-0 h-[1px] bg-[#393939] z-0"></div>
                <div className="absolute top-[64px] left-6 right-0 h-[1px] bg-[#393939] z-0"></div>
                {/* Classical Register Wires (Double line) */}
                <div className="absolute top-[110px] left-6 right-0 h-[1px] bg-[#555] z-0"></div>
                <div className="absolute top-[114px] left-6 right-0 h-[1px] bg-[#555] z-0"></div>

                {/* Qubit 0 */}
                <div className="flex items-center gap-0 w-max relative z-10 h-8">
                  <span className="font-sans text-[11px] text-[#8d96a0] w-6 text-right pr-3 shrink-0">0</span>
                  
                  {/* Gates for Q0 */}
                  <div className="flex items-center h-full">
                    <div className="w-3"></div>
                    {/* H */}
                    <div className="w-8 h-8 flex items-center justify-center bg-[#ff5555] text-slate-900 font-sans font-medium text-[15px] shadow-sm">H</div>
                    <div className="w-4"></div>
                    {/* CX Control */}
                    <div className="w-8 flex justify-center relative">
                      <div className="w-3 h-3 bg-[#33b1ff] rounded-full z-10 relative"></div>
                      <div className="absolute top-1/2 left-1/2 w-[2px] h-[48px] bg-[#33b1ff] -translate-x-1/2 z-0"></div>
                    </div>
                    <div className="w-4"></div>
                    {/* Measure */}
                    <div className="w-8 h-8 flex flex-col items-center justify-center bg-[#8d96a0] text-slate-900 relative shadow-sm">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px] mt-0.5">
                         <path d="M12 15l-3-4m3 4v2m0-6a6 6 0 100 12 6 6 0 000-12z" stroke="none" fill="none"/>
                         <path d="M4 14a8 8 0 0116 0" />
                         <circle cx="12" cy="14" r="2" fill="currentColor"/>
                         <path d="M12 14l5-6" />
                       </svg>
                       <span className="absolute top-0 right-0.5 text-[8px] font-bold">z</span>
                       {/* Down arrow to classical */}
                       <div className="absolute top-full left-1/2 w-[1px] h-[64px] bg-[#8d96a0] -translate-x-1/2 z-0"></div>
                       <div className="absolute top-[calc(100%+60px)] left-1/2 border-l-[3px] border-r-[3px] border-t-[4px] border-transparent border-t-[#8d96a0] -translate-x-1/2"></div>
                       <span className="absolute top-[calc(100%+66px)] left-1/2 -translate-x-1/2 text-[10px] font-sans font-bold text-[#82cfff] bg-[#161616] px-1">0</span>
                    </div>
                    <div className="w-4"></div>
                    {/* Y */}
                    <div className="w-8 h-8 flex items-center justify-center bg-[#ff7eb6] text-slate-900 font-sans font-medium text-[15px] shadow-sm">Y</div>
                    <div className="w-4"></div>
                    {/* SWAP top */}
                    <div className="w-8 flex justify-center items-center relative">
                      <div className="text-[#33b1ff] font-bold text-xl leading-none z-10 bg-[#161616] h-full flex items-center">✕</div>
                      <div className="absolute top-1/2 left-1/2 w-[2px] h-[48px] bg-[#33b1ff] -translate-x-1/2 z-0"></div>
                    </div>
                    <div className="w-4"></div>
                    {/* Z */}
                    <div className="w-8 h-8 flex items-center justify-center bg-[#82cfff] text-slate-900 font-sans font-medium text-[15px] shadow-sm">Z</div>
                    <div className="w-4"></div>
                    {/* RZ */}
                    <div className="w-8 h-8 flex flex-col items-center justify-center bg-[#82cfff] text-slate-900 font-sans font-medium leading-[1.1] shadow-sm">
                      <span className="text-[13px]">RZ</span>
                      <span className="text-[8px] opacity-80">(π/2)</span>
                    </div>
                    <div className="w-4"></div>
                    {/* SWAP 2 top */}
                    <div className="w-8 flex justify-center items-center relative">
                      <div className="text-[#33b1ff] font-bold text-xl leading-none z-10 bg-[#161616] h-full flex items-center">✕</div>
                      <div className="absolute top-1/2 left-1/2 w-[2px] h-[48px] bg-[#33b1ff] -translate-x-1/2 z-0"></div>
                    </div>
                    <div className="w-[116px]"></div>
                    {/* RZZ top */}
                    <div className="w-8 flex justify-center relative">
                      <div className="w-3.5 h-3.5 bg-[#ff7eb6] rounded-full z-10 relative mt-2"></div>
                      <div className="absolute top-1/2 left-1/2 w-[2px] h-[48px] bg-[#ff7eb6] -translate-x-1/2 z-0"></div>
                      <div className="absolute top-full left-[calc(50%+6px)] text-[9px] text-[#ff7eb6] font-sans leading-[1] mt-1 whitespace-nowrap">
                        <div className="text-white">RZZ</div>
                        <div className="scale-90 origin-left mt-0.5">(π/2)</div>
                      </div>
                    </div>
                    <div className="w-4"></div>
                    {/* √X */}
                    <div className="w-8 h-8 flex items-center justify-center bg-[#ff7eb6] text-slate-900 font-sans font-medium text-[13px] shadow-sm">√X</div>
                    <div className="w-4"></div>
                    {/* S† */}
                    <div className="w-8 h-8 flex items-center justify-center bg-[#82cfff] text-slate-900 font-sans font-medium text-[15px] shadow-sm pt-1">S<sup className="-mt-2 text-[10px] font-bold">†</sup></div>
                  </div>
                </div>

                {/* Qubit 1 */}
                <div className="flex items-center gap-0 w-max relative z-10 h-8">
                  <span className="font-sans text-[11px] text-[#8d96a0] w-6 text-right pr-3 shrink-0">1</span>
                  
                  <div className="flex items-center h-full">
                    <div className="w-[51px]"></div> {/* Skip H */}
                    {/* CX Target */}
                    <div className="w-8 flex justify-center relative z-10">
                      <div className="w-[26px] h-[26px] bg-[#33b1ff] rounded-full flex items-center justify-center text-slate-900 font-medium text-2xl leading-none shadow-sm pb-0.5">+</div>
                    </div>
                    <div className="w-[44px]"></div> {/* Skip Measure */}
                    {/* I */}
                    <div className="w-8 h-8 flex items-center justify-center bg-[#33b1ff] text-slate-900 font-sans font-medium text-[15px] shadow-sm">I</div>
                    <div className="w-4"></div>
                    {/* SWAP bottom */}
                    <div className="w-8 flex justify-center items-center relative z-10">
                      <div className="text-[#33b1ff] font-bold text-xl leading-none bg-[#161616] h-full flex items-center">✕</div>
                    </div>
                    <div className="w-[88px]"></div> {/* Skip Z, RZ */}
                    {/* SWAP 2 bottom */}
                    <div className="w-8 flex justify-center items-center relative z-10">
                      <div className="text-[#33b1ff] font-bold text-xl leading-none bg-[#161616] h-full flex items-center">✕</div>
                    </div>
                    <div className="w-4"></div>
                    {/* S */}
                    <div className="w-8 h-8 flex items-center justify-center bg-[#82cfff] text-slate-900 font-sans font-medium text-[15px] shadow-sm">S</div>
                    <div className="w-4"></div>
                    {/* H */}
                    <div className="w-8 h-8 flex items-center justify-center bg-[#ff5555] text-slate-900 font-sans font-medium text-[15px] shadow-sm">H</div>
                    <div className="w-4"></div>
                    {/* RY */}
                    <div className="w-8 h-8 flex flex-col items-center justify-center bg-[#ff7eb6] text-slate-900 font-sans font-medium leading-[1.1] shadow-sm">
                      <span className="text-[13px]">RY</span>
                      <span className="text-[8px] opacity-80">(π/2)</span>
                    </div>
                    <div className="w-4"></div>
                    {/* RZZ bottom */}
                    <div className="w-8 flex justify-center relative z-10">
                      <div className="w-3.5 h-3.5 bg-[#ff7eb6] rounded-full mt-2"></div>
                    </div>
                    <div className="w-4"></div>
                    {/* P */}
                    <div className="w-8 h-8 flex flex-col items-center justify-center bg-[#82cfff] text-slate-900 font-sans font-medium leading-[1.1] shadow-sm">
                      <span className="text-[13px]">P</span>
                      <span className="text-[8px] opacity-80">(π/2)</span>
                    </div>
                    <div className="w-4"></div>
                    {/* CX Target isolated (just for flavor) */}
                    <div className="w-8 flex justify-center relative z-10">
                      <div className="w-[26px] h-[26px] bg-[#33b1ff] rounded-full flex items-center justify-center text-slate-900 font-medium text-2xl leading-none shadow-sm pb-0.5">+</div>
                    </div>
                  </div>
                </div>
                
                {/* Classical */}
                <div className="flex items-center gap-0 w-max relative z-10 h-6 mt-1">
                  <span className="font-sans text-[11px] text-[#8d96a0] w-6 text-right pr-3 shrink-0">2</span>
                  <div className="w-[600px]"></div>
                </div>
              </div>
            </div>
            
            {/* Status Bar */}
            <div className="bg-[#1e1e1e] border-t border-white/5 p-3 px-4 flex justify-between items-center text-[11px] font-sans">
              <div className="text-slate-400 flex items-center gap-2">
                <div className={\`w-2 h-2 rounded-full \${targetAlgoritmo !== 'IDLE' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse' : 'bg-slate-500'}\`}></div>
                <span>{targetAlgoritmo !== 'IDLE' ? 'Circuit Compiled & Optimized' : 'Idle State'}</span>
              </div>
              <div className="text-slate-500 max-w-[60%] truncate text-right">
                {getActionDescription()}
              </div>
            </div>
          </div>
`;

  file = file.slice(0, startIndex) + newComposerFull + '\n' + cleanEnding + '\n';
  fs.writeFileSync('src/components/TestPage.tsx', file);
  console.log("Fixed JSX balance by replacing the end of the file completely.");
}
