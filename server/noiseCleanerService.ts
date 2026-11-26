export interface CodeNoiseCleanResult {
  detectedFormat: 'OPENQASM_3' | 'OPENQASM_2' | 'PYTHON_QISKIT' | 'TEXT';
  cleanedCode: string;
  originalGateCount: number;
  optimizedGateCount: number;
  gatesRemoved: number;
  rotationsMerged: number;
  registersAdjusted: boolean;
  passesApplied: string[];
  qubitsDeclared: number;
}

export interface ReadoutMitigationResult {
  method: 'READOUT_MATRIX_INVERSION' | 'ZNE_RICHARDSON';
  numQubits: number;
  totalShots: number;
  error01: number;
  error10: number;
  original: Record<string, number>;
  mitigated: Record<string, number>;
  dominantState: string;
  rawDominantPct: number;
  mitigatedDominantPct: number;
  fidelityDeltaPct: number;
  l1ShiftPct: number;
}

// =========================================================================
// SAFE ANGLE PARSER (NO eval) FOR GATE MERGING
// =========================================================================
function parseAngleSafe(exprRaw: string): number | null {
  const expr = exprRaw.trim().replace(/\s+/g, '').replace(/\bnp\.pi\b|\bmath\.pi\b/gi, 'pi');
  if (!expr) return null;
  let pos = 0;

  function parseExpression(): number {
    let val = parseTerm();
    while (pos < expr.length && (expr[pos] === '+' || expr[pos] === '-')) {
      const op = expr[pos++];
      const rhs = parseTerm();
      val = op === '+' ? val + rhs : val - rhs;
    }
    return val;
  }

  function parseTerm(): number {
    let val = parseFactor();
    while (pos < expr.length && (expr[pos] === '*' || expr[pos] === '/')) {
      const op = expr[pos++];
      const rhs = parseFactor();
      val = op === '*' ? val * rhs : val / rhs;
    }
    return val;
  }

  function parseFactor(): number {
    if (expr[pos] === '+') {
      pos++;
      return parseFactor();
    }
    if (expr[pos] === '-') {
      pos++;
      return -parseFactor();
    }
    if (expr[pos] === '(') {
      pos++;
      const val = parseExpression();
      if (expr[pos] !== ')') throw new Error('Unmatched paren');
      pos++;
      return val;
    }
    if (expr.slice(pos, pos + 3).toLowerCase() === 'tau') {
      pos += 3;
      return 2 * Math.PI;
    }
    if (expr.slice(pos, pos + 2).toLowerCase() === 'pi') {
      pos += 2;
      return Math.PI;
    }
    const match = expr.slice(pos).match(/^(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/);
    if (match) {
      pos += match[1].length;
      return parseFloat(match[1]);
    }
    throw new Error('Non-numeric token');
  }

  try {
    const val = parseExpression();
    if (pos !== expr.length || !Number.isFinite(val)) return null;
    return val;
  } catch {
    return null;
  }
}

function normalizeAngle(rad: number): number {
  let norm = rad % (2 * Math.PI);
  if (norm > Math.PI) norm -= 2 * Math.PI;
  if (norm <= -Math.PI) norm += 2 * Math.PI;
  return norm;
}

function isZeroAngle(rad: number): boolean {
  return Math.abs(normalizeAngle(rad)) < 1e-8;
}

function fmtRad(rad: number): string {
  const norm = normalizeAngle(rad);
  if (Math.abs(norm) < 1e-8) return '0';
  return Number(norm.toFixed(6)).toString();
}

// =========================================================================
// DETERMINISTIC OPENQASM 2.0 / 3.0 GATE NOISE OPTIMIZER
// =========================================================================
const SELF_INVERSE_1Q = new Set(['x', 'y', 'z', 'h']);
const SELF_INVERSE_2Q = new Set(['cx', 'cz', 'swap', 'ecr']);
const MERGEABLE_1Q = new Set(['rx', 'ry', 'rz', 'p', 'u1']);
const MERGEABLE_2Q = new Set(['cp', 'cu1', 'rzz', 'crz', 'cry']);
const ADJOINT_PAIRS: Record<string, string> = {
  s: 'sdg',
  sdg: 's',
  t: 'tdg',
  tdg: 't',
  sx: 'sxdg',
  sxdg: 'sx',
};

interface QasmNode {
  type: 'header' | 'qreg' | 'creg' | 'gate' | 'measure' | 'barrier' | 'reset' | 'other';
  raw: string;
  gateName?: string;
  params?: string[];
  numericParams?: (number | null)[];
  qubitTokens?: string[];
  qubitIndices?: number[];
  comment?: string;
}

function splitInlineComment(line: string): { code: string; comment: string } {
  const idx = line.indexOf('//');
  if (idx === -1) return { code: line.trim(), comment: '' };
  return { code: line.slice(0, idx).trim(), comment: line.slice(idx).trim() };
}

function optimizeOpenQasmCircuit(rawCode: string): CodeNoiseCleanResult {
  const isQasm2 = /OPENQASM\s+2/i.test(rawCode);
  const detectedFormat = isQasm2 ? 'OPENQASM_2' : 'OPENQASM_3';

  // Split by lines preserving structure and handling multi-statement lines cleanly
  const rawLines = rawCode.replace(/\r\n/g, '\n').split('\n');
  const nodes: QasmNode[] = [];
  const qregNames = new Map<string, number>();
  let maxQubitIdxReferenced = -1;
  let totalDeclaredQubits = 0;

  const extractQubitIndices = (args: string[]): number[] => {
    const out: number[] = [];
    for (const a of args) {
      const m = a.trim().match(/^(?:[a-zA-Z_]\w*\s*\[\s*(\d+)\s*\]|\$(\d+))$/);
      if (m) {
        const idx = Number(m[1] ?? m[2]);
        out.push(idx);
        maxQubitIdxReferenced = Math.max(maxQubitIdxReferenced, idx);
      }
    }
    return out;
  };

  for (const line of rawLines) {
    const { code, comment } = splitInlineComment(line);
    if (!code) {
      if (comment) {
        nodes.push({ type: 'other', raw: comment });
      }
      continue;
    }

    // Split multiple semicolon-separated statements on the same line
    const parts = code.split(';').map((s) => s.trim()).filter(Boolean);
    parts.forEach((stmt, idx) => {
      const attachedComment = idx === parts.length - 1 ? comment : '';

      if (/^OPENQASM\b/i.test(stmt) || /^include\b/i.test(stmt)) {
        nodes.push({ type: 'header', raw: `${stmt};`, comment: attachedComment });
        return;
      }

      let m = stmt.match(/^qreg\s+([a-zA-Z_]\w*)\s*\[\s*(\d+)\s*\]$/);
      if (m) {
        const size = Number(m[2]);
        qregNames.set(m[1], size);
        totalDeclaredQubits += size;
        nodes.push({ type: 'qreg', raw: `${stmt};`, comment: attachedComment });
        return;
      }

      m = stmt.match(/^qubit\s*\[\s*(\d+)\s*\]\s+([a-zA-Z_]\w*)$/);
      if (m) {
        const size = Number(m[1]);
        qregNames.set(m[2], size);
        totalDeclaredQubits += size;
        nodes.push({ type: 'qreg', raw: `${stmt};`, comment: attachedComment });
        return;
      }

      if (/^(?:creg|bit)\b/i.test(stmt)) {
        nodes.push({ type: 'creg', raw: `${stmt};`, comment: attachedComment });
        return;
      }

      if (/^barrier\b/i.test(stmt)) {
        nodes.push({ type: 'barrier', raw: `${stmt};`, comment: attachedComment });
        return;
      }

      if (/^measure\b/i.test(stmt) || /=\s*measure\b/i.test(stmt)) {
        const qMatches = Array.from(stmt.matchAll(/\b[a-zA-Z_]\w*\s*\[\s*(\d+)\s*\]|\$(\d+)/g));
        for (const qm of qMatches) {
          maxQubitIdxReferenced = Math.max(maxQubitIdxReferenced, Number(qm[1] ?? qm[2]));
        }
        nodes.push({ type: 'measure', raw: `${stmt};`, comment: attachedComment });
        return;
      }

      if (/^reset\b/i.test(stmt)) {
        nodes.push({ type: 'reset', raw: `${stmt};`, comment: attachedComment });
        return;
      }

      m = stmt.match(/^([a-zA-Z_]\w*)(?:\s*\(([^)]*)\))?\s+(.+)$/);
      if (m) {
        const gateName = m[1].toLowerCase();
        const params = m[2] ? m[2].split(',').map((p) => p.trim()).filter(Boolean) : [];
        const numericParams = params.map(parseAngleSafe);
        const qubitTokens = m[3].split(',').map((q) => q.trim()).filter(Boolean);
        const qubitIndices = extractQubitIndices(qubitTokens);

        nodes.push({
          type: 'gate',
          raw: `${stmt};`,
          gateName,
          params,
          numericParams,
          qubitTokens,
          qubitIndices,
          comment: attachedComment,
        });
        return;
      }

      nodes.push({ type: 'other', raw: stmt.endsWith(';') ? stmt : `${stmt};`, comment: attachedComment });
    });
  }

  const originalGateCount = nodes.filter((n) => n.type === 'gate').length;
  const passesApplied: string[] = [];
  let registersAdjusted = false;

  // Register consistency check
  if (maxQubitIdxReferenced >= 0 && totalDeclaredQubits > 0 && maxQubitIdxReferenced + 1 > totalDeclaredQubits) {
    const needed = maxQubitIdxReferenced + 1;
    let expanded = false;
    for (const node of nodes) {
      if (node.type === 'qreg' && !expanded) {
        node.raw = node.raw.replace(/\[\s*\d+\s*\]/, `[${needed}]`);
        expanded = true;
      } else if (node.type === 'creg' && !expanded) {
        // leave creg unless matched
      }
    }
    if (expanded) {
      registersAdjusted = true;
      totalDeclaredQubits = needed;
      passesApplied.push(`Allineamento registro qubit ampliato a ${needed} qubit`);
    }
  }

  // Iterative gate-level optimization passes (until fixed point)
  let working = [...nodes];
  let identityRemoved = 0;
  let inverseCancelled = 0;
  let rotationsMerged = 0;

  let changed = true;
  let guard = 0;
  while (changed && guard < 20) {
    changed = false;
    guard++;

    // Pass A: Remove identity gates ('id', 'i') and zero-angle rotations
    const afterIdentity: QasmNode[] = [];
    for (const node of working) {
      if (node.type === 'gate') {
        const g = node.gateName || '';
        if (g === 'id' || g === 'i') {
          identityRemoved++;
          changed = true;
          continue;
        }
        if (
          (MERGEABLE_1Q.has(g) || MERGEABLE_2Q.has(g)) &&
          node.numericParams &&
          node.numericParams.length === 1 &&
          node.numericParams[0] !== null &&
          isZeroAngle(node.numericParams[0])
        ) {
          identityRemoved++;
          changed = true;
          continue;
        }
      }
      afterIdentity.push(node);
    }
    working = afterIdentity;

    // Pass B: Cancel consecutive inverse pairs or merge consecutive parameterized rotations on the same qubit(s)
    // Track per-qubit last gate index to respect gate commutation / ordering barriers
    const nextWorking: (QasmNode | null)[] = working.map((n) => n);
    const lastGateOnQubit = new Map<string, number>();

    for (let i = 0; i < nextWorking.length; i++) {
      const curr = nextWorking[i];
      if (!curr) continue;

      if (curr.type === 'barrier' || curr.type === 'measure' || curr.type === 'reset') {
        lastGateOnQubit.clear();
        continue;
      }

      if (curr.type !== 'gate' || !curr.qubitTokens || curr.qubitTokens.length === 0) {
        continue;
      }

      const qKeys = curr.qubitTokens.map((t) => t.replace(/\s+/g, ''));

      // Check if ALL qubits of current gate share the exact same preceding gate index
      const prevIdxSet = new Set<number | undefined>();
      for (const qk of qKeys) {
        prevIdxSet.add(lastGateOnQubit.get(qk));
      }

      if (prevIdxSet.size === 1) {
        const prevIdx = Array.from(prevIdxSet)[0];
        if (prevIdx !== undefined && nextWorking[prevIdx]) {
          const prev = nextWorking[prevIdx]!;
          const prevQKeys = (prev.qubitTokens || []).map((t) => t.replace(/\s+/g, ''));
          const sameExactOrder =
            prevQKeys.length === qKeys.length && prevQKeys.every((val, k) => val === qKeys[k]);
          const symmetric2Q =
            qKeys.length === 2 &&
            prevQKeys.length === 2 &&
            ((prevQKeys[0] === qKeys[0] && prevQKeys[1] === qKeys[1]) ||
              (prevQKeys[0] === qKeys[1] && prevQKeys[1] === qKeys[0]));

          const gCurr = curr.gateName || '';
          const gPrev = prev.gateName || '';

          // 1. Self-inverse cancellation (X-X, H-H, CX-CX, CZ-CZ, SWAP-SWAP, ECR-ECR)
          const canSelfCancel =
            (SELF_INVERSE_1Q.has(gCurr) && gPrev === gCurr && sameExactOrder) ||
            (SELF_INVERSE_2Q.has(gCurr) &&
              gPrev === gCurr &&
              (gCurr === 'cz' || gCurr === 'swap' ? symmetric2Q : sameExactOrder));

          // 2. Adjoint pair cancellation (S-Sdg, T-Tdg, SX-SXdg)
          const canAdjointCancel = ADJOINT_PAIRS[gCurr] === gPrev && sameExactOrder;

          if (canSelfCancel || canAdjointCancel) {
            nextWorking[prevIdx] = null;
            nextWorking[i] = null;
            for (const qk of qKeys) {
              lastGateOnQubit.delete(qk);
            }
            inverseCancelled += 2;
            changed = true;
            continue;
          }

          // 3. Consecutive rotation merging (RZ + RZ, RY + RY, RX + RX, CP + CP, RZZ + RZZ)
          const isMergeable =
            gCurr === gPrev &&
            sameExactOrder &&
            (MERGEABLE_1Q.has(gCurr) || MERGEABLE_2Q.has(gCurr)) &&
            curr.numericParams?.[0] != null &&
            prev.numericParams?.[0] != null;

          if (isMergeable) {
            const combinedAngle = (prev.numericParams![0] as number) + (curr.numericParams![0] as number);
            nextWorking[i] = null;
            rotationsMerged++;
            changed = true;

            if (isZeroAngle(combinedAngle)) {
              nextWorking[prevIdx] = null;
              for (const qk of qKeys) {
                lastGateOnQubit.delete(qk);
              }
              identityRemoved++;
            } else {
              const formattedAngle = fmtRad(combinedAngle);
              prev.params = [formattedAngle];
              prev.numericParams = [normalizeAngle(combinedAngle)];
              prev.raw = `${gPrev}(${formattedAngle}) ${prev.qubitTokens!.join(', ')};`;
              prev.comment = prev.comment || curr.comment;
              for (const qk of qKeys) {
                lastGateOnQubit.set(qk, prevIdx);
              }
            }
            continue;
          }
        }
      }

      for (const qk of qKeys) {
        lastGateOnQubit.set(qk, i);
      }
    }

    working = nextWorking.filter((x): x is QasmNode => x !== null);
  }

  if (inverseCancelled > 0) {
    passesApplied.push(`Eliminati ${inverseCancelled} gate auto-inversi / aggiunti ridondanti`);
  }
  if (rotationsMerged > 0) {
    passesApplied.push(`Fuse ${rotationsMerged} coppie di rotazioni parametriche consecutive`);
  }
  if (identityRemoved > 0) {
    passesApplied.push(`Rimossi ${identityRemoved} gate identità o con angolo nullo`);
  }
  if (passesApplied.length === 0) {
    passesApplied.push('Circuito già compatto: nessuna ridondanza di gate rilevata');
  }

  const optimizedGateCount = working.filter((n) => n.type === 'gate').length;
  const cleanedLines = working.map((n) => (n.comment ? `${n.raw} ${n.comment}` : n.raw));

  return {
    detectedFormat,
    cleanedCode: cleanedLines.join('\n'),
    originalGateCount,
    optimizedGateCount,
    gatesRemoved: Math.max(0, originalGateCount - optimizedGateCount),
    rotationsMerged,
    registersAdjusted,
    passesApplied,
    qubitsDeclared: totalDeclaredQubits || Math.max(0, maxQubitIdxReferenced + 1),
  };
}

// =========================================================================
// DETERMINISTIC PYTHON QISKIT OPTIMIZER
// =========================================================================
function optimizePythonQiskitCode(rawCode: string): CodeNoiseCleanResult {
  const lines = rawCode.replace(/\r\n/g, '\n').split('\n');
  let circuitVar = 'qc';
  const varMatch = rawCode.match(/\b([a-zA-Z_]\w*)\s*=\s*QuantumCircuit\s*\(/);
  if (varMatch) circuitVar = varMatch[1];

  const gatePattern = new RegExp(
    `^(\\s*)${circuitVar}\\.(x|y|z|h|s|sdg|t|tdg|sx|sxdg|id|rx|ry|rz|p|cx|cz|cp|rzz|swap)\\s*\\(([^)]*)\\)\\s*$`
  );

  interface PyLine {
    raw: string;
    indent?: string;
    gate?: string;
    args?: string[];
    isZeroAngle?: boolean;
    numericAngle?: number | null;
    qubitsKey?: string;
  }

  const parsed: (PyLine | null)[] = lines.map((line) => {
    const m = line.match(gatePattern);
    if (!m) return { raw: line };
    const gate = m[2].toLowerCase();
    const args = m[3].split(',').map((s) => s.trim()).filter(Boolean);
    let numericAngle: number | null = null;
    let qubitsKey = args.join(',');
    if (MERGEABLE_1Q.has(gate) || MERGEABLE_2Q.has(gate)) {
      numericAngle = args[0] ? parseAngleSafe(args[0]) : null;
      qubitsKey = args.slice(1).join(',');
    }
    return {
      raw: line,
      indent: m[1],
      gate,
      args,
      numericAngle,
      isZeroAngle: numericAngle !== null && isZeroAngle(numericAngle),
      qubitsKey,
    };
  });

  const originalGateCount = parsed.filter((p) => p?.gate).length;
  const passesApplied: string[] = [];
  let removedCount = 0;
  let mergedCount = 0;

  let changed = true;
  let guard = 0;
  while (changed && guard < 15) {
    changed = false;
    guard++;

    // Remove id and zero-angle gates
    for (let i = 0; i < parsed.length; i++) {
      const p = parsed[i];
      if (p?.gate && (p.gate === 'id' || p.isZeroAngle)) {
        parsed[i] = null;
        removedCount++;
        changed = true;
      }
    }

    // Cancel adjacent identical self-inverse / adjoint gates on exact same target arguments
    let lastGateIdx: number | null = null;
    for (let i = 0; i < parsed.length; i++) {
      const curr = parsed[i];
      if (!curr) continue;
      if (!curr.gate) {
        if (curr.raw.trim() && !curr.raw.trim().startsWith('#')) {
          lastGateIdx = null;
        }
        continue;
      }
      if (lastGateIdx !== null && parsed[lastGateIdx]) {
        const prev = parsed[lastGateIdx]!;
        if (
          prev.gate &&
          prev.qubitsKey === curr.qubitsKey &&
          prev.indent === curr.indent &&
          ((prev.gate === curr.gate && (SELF_INVERSE_1Q.has(curr.gate) || SELF_INVERSE_2Q.has(curr.gate))) ||
            ADJOINT_PAIRS[curr.gate] === prev.gate)
        ) {
          parsed[lastGateIdx] = null;
          parsed[i] = null;
          lastGateIdx = null;
          removedCount += 2;
          changed = true;
          continue;
        }
        if (
          prev.gate === curr.gate &&
          prev.qubitsKey === curr.qubitsKey &&
          prev.indent === curr.indent &&
          (MERGEABLE_1Q.has(curr.gate) || MERGEABLE_2Q.has(curr.gate)) &&
          prev.numericAngle !== null &&
          prev.numericAngle !== undefined &&
          curr.numericAngle !== null &&
          curr.numericAngle !== undefined
        ) {
          const sum = prev.numericAngle + curr.numericAngle;
          parsed[i] = null;
          mergedCount++;
          changed = true;
          if (isZeroAngle(sum)) {
            parsed[lastGateIdx] = null;
            lastGateIdx = null;
            removedCount++;
          } else {
            const fmt = fmtRad(sum);
            prev.numericAngle = normalizeAngle(sum);
            prev.args = [fmt, ...(prev.args?.slice(1) || [])];
            prev.raw = `${prev.indent}${circuitVar}.${prev.gate}(${prev.args.join(', ')})`;
          }
          continue;
        }
      }
      lastGateIdx = i;
    }
  }

  let bodyLines = parsed.filter((p): p is PyLine => p !== null).map((p) => p.raw);
  let bodyText = bodyLines.join('\n');

  // Remove deprecated execute() call or replace legacy imports cleanly
  let upgradedRuntime = false;
  if (/\.execute\s*\(|\bexecute\s*\(/.test(bodyText)) {
    bodyText = bodyText.replace(/\bfrom\s+qiskit\s+import\s+execute\b/g, '# execute() rimosso: sostituito con SamplerV2');
    upgradedRuntime = true;
  }

  // Inject real Qiskit 1.x Runtime anti-noise configuration if not already present
  if (!bodyText.includes('resilience_level') && !bodyText.includes('SamplerV2')) {
    bodyText =
      bodyText.trimEnd() +
      `\n\n# --- Configurazione Anti-Rumore Qiskit 1.x (Resilience + Dynamical Decoupling XY4) ---\n` +
      `from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager\n` +
      `from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler\n\n` +
      `service = QiskitRuntimeService()\n` +
      `backend = service.least_busy(operational=True, simulator=False)\n` +
      `pm = generate_preset_pass_manager(backend=backend, optimization_level=3)\n` +
      `isa_circuit = pm.run(${circuitVar})\n\n` +
      `sampler = Sampler(mode=backend)\n` +
      `sampler.options.resilience_level = 1\n` +
      `sampler.options.dynamical_decoupling.enable = True\n` +
      `sampler.options.dynamical_decoupling.sequence_type = "XY4"\n` +
      `job = sampler.run([isa_circuit], shots=2048)\n` +
      `counts = job.result()[0].data.c.get_counts()\n`;
    upgradedRuntime = true;
  }

  if (removedCount > 0) passesApplied.push(`Eliminati ${removedCount} gate ridondanti o nulli dal circuito Python`);
  if (mergedCount > 0) passesApplied.push(`Fuse ${mergedCount} rotazioni consecutive`);
  if (upgradedRuntime) passesApplied.push('Aggiunto PassManager optimization_level=3 + SamplerV2 (XY4 + Resilience 1)');
  if (passesApplied.length === 0) passesApplied.push('Codice Qiskit già conforme allo standard anti-rumore 1.x');

  const optimizedGateCount = Math.max(0, originalGateCount - removedCount - mergedCount);

  return {
    detectedFormat: 'PYTHON_QISKIT',
    cleanedCode: bodyText,
    originalGateCount,
    optimizedGateCount,
    gatesRemoved: Math.max(0, originalGateCount - optimizedGateCount),
    rotationsMerged: mergedCount,
    registersAdjusted: false,
    passesApplied,
    qubitsDeclared: 0,
  };
}

export function cleanAndOptimizeQuantumCode(rawCode: string): CodeNoiseCleanResult {
  const trimmed = (rawCode || '').trim();
  if (!trimmed) {
    throw new Error('Inserisci un circuito OpenQASM o Python Qiskit da analizzare e pulire.');
  }

  const isOpenQasm =
    /\bOPENQASM\b/i.test(trimmed) ||
    /\bqreg\s+[a-zA-Z_]\w*\s*\[/i.test(trimmed) ||
    /\bqubit\s*\[\s*\d+\s*\]/i.test(trimmed);

  if (isOpenQasm) {
    return optimizeOpenQasmCircuit(trimmed);
  }

  const isPythonQiskit =
    /\bQuantumCircuit\b/.test(trimmed) ||
    /\bqiskit\b/i.test(trimmed) ||
    /\.[hxyz]\(\d+\)/.test(trimmed) ||
    /\.cx\(\d+/.test(trimmed);

  if (isPythonQiskit) {
    return optimizePythonQiskitCode(trimmed);
  }

  // Generic gate-list OpenQASM fallback
  return optimizeOpenQasmCircuit(trimmed);
}

// =========================================================================
// REAL READOUT MATRIX INVERSION & SMOLIN SIMPLEX PROJECTION + ZNE RICHARDSON
// =========================================================================

// Smolin, Gambetta, Smith (PRL 108, 070502, 2012) exact Euclidean projection onto probability simplex
function projectOntoSimplex(v: number[]): number[] {
  const n = v.length;
  const sorted = [...v].sort((a, b) => b - a);
  let sum = 0;
  let rho = 0;
  for (let i = 0; i < n; i++) {
    sum += sorted[i];
    const t = (sum - 1) / (i + 1);
    if (sorted[i] - t > 0) {
      rho = i + 1;
    }
  }
  const cumSum = sorted.slice(0, rho).reduce((acc, x) => acc + x, 0);
  const theta = (cumSum - 1) / Math.max(1, rho);
  return v.map((val) => Math.max(0, val - theta));
}

export function mitigateReadoutErrors(
  rawCounts: Record<string, number>,
  error01 = 0.025,
  error10 = 0.04
): ReadoutMitigationResult {
  const entries = Object.entries(rawCounts).filter(([, v]) => Number.isFinite(v) && v >= 0);
  if (entries.length === 0) {
    throw new Error('Nessun conteggio di misura valido fornito.');
  }

  const e01 = Math.max(0, Math.min(0.45, Number(error01)));
  const e10 = Math.max(0, Math.min(0.45, Number(error10)));
  const det = 1 - e01 - e10;
  if (det <= 0.05) {
    throw new Error('Matrice di calibrazione readout singolare (e01 + e10 >= 0.95).');
  }

  const bitWidth = Math.min(12, Math.max(1, ...entries.map(([k]) => k.trim().length)));
  const dim = 1 << bitWidth;
  const probVec = new Array<number>(dim).fill(0);

  let totalShots = 0;
  const normalizedOriginal: Record<string, number> = {};
  for (const [k, v] of entries) {
    const cleanKey = k.trim().replace(/[^01]/g, '').padStart(bitWidth, '0').slice(-bitWidth);
    const count = Math.round(Number(v));
    if (count > 0 || cleanKey in rawCounts) {
      const idx = parseInt(cleanKey, 2);
      probVec[idx] += count;
      normalizedOriginal[cleanKey] = (normalizedOriginal[cleanKey] || 0) + count;
      totalShots += count;
    }
  }

  if (totalShots <= 0) {
    throw new Error('Il totale degli shots deve essere maggiore di zero.');
  }

  for (let i = 0; i < dim; i++) {
    probVec[i] /= totalShots;
  }

  // Exact Kronecker matrix-vector product (M^{-1})^{\otimes n} * p_raw in O(n * 2^n)
  // M^{-1} = (1 / det) * [[1 - e10, -e10], [-e01, 1 - e01]]
  const m00 = (1 - e10) / det;
  const m01 = -e10 / det;
  const m10 = -e01 / det;
  const m11 = (1 - e01) / det;

  const quasi = [...probVec];
  for (let q = 0; q < bitWidth; q++) {
    const step = 1 << q;
    for (let base = 0; base < dim; base += step * 2) {
      for (let offset = 0; offset < step; offset++) {
        const i0 = base + offset;
        const i1 = i0 + step;
        const v0 = quasi[i0];
        const v1 = quasi[i1];
        quasi[i0] = m00 * v0 + m01 * v1;
        quasi[i1] = m10 * v0 + m11 * v1;
      }
    }
  }

  const mitigatedProbs = projectOntoSimplex(quasi);

  // Measure total L1 probability shift performed by matrix inversion
  let l1Diff = 0;
  for (let i = 0; i < dim; i++) {
    l1Diff += Math.abs(mitigatedProbs[i] - probVec[i]);
  }
  const l1ShiftPct = (l1Diff / 2) * 100;

  // Convert back to integer shots preserving totalShots exactly via largest remainder
  const rawExact = mitigatedProbs.map((p, idx) => ({
    idx,
    exact: p * totalShots,
    floor: Math.floor(p * totalShots),
  }));
  let remainder = totalShots - rawExact.reduce((a, b) => a + b.floor, 0);
  rawExact.sort((a, b) => (b.exact - b.floor) - (a.exact - a.floor));
  for (let i = 0; i < remainder; i++) {
    rawExact[i].floor += 1;
  }

  const mitigatedCounts: Record<string, number> = {};
  const allRelevantIndices = new Set<number>();
  for (let i = 0; i < dim; i++) {
    if (probVec[i] > 0) allRelevantIndices.add(i);
  }
  for (const item of rawExact) {
    if (item.floor > 0 || allRelevantIndices.has(item.idx)) {
      const bitStr = item.idx.toString(2).padStart(bitWidth, '0');
      mitigatedCounts[bitStr] = item.floor;
      if (!(bitStr in normalizedOriginal)) {
        normalizedOriginal[bitStr] = 0;
      }
    }
  }

  // Sort keys descending by mitigated counts
  const sortedKeys = Object.keys(mitigatedCounts).sort((a, b) => mitigatedCounts[b] - mitigatedCounts[a]);
  const sortedMitigated: Record<string, number> = {};
  const sortedOriginal: Record<string, number> = {};
  for (const k of sortedKeys) {
    sortedMitigated[k] = mitigatedCounts[k];
    sortedOriginal[k] = normalizedOriginal[k] || 0;
  }

  const dominantState = sortedKeys[0];
  const rawDominantPct = ((sortedOriginal[dominantState] || 0) / totalShots) * 100;
  const mitigatedDominantPct = ((sortedMitigated[dominantState] || 0) / totalShots) * 100;

  return {
    method: 'READOUT_MATRIX_INVERSION',
    numQubits: bitWidth,
    totalShots,
    error01: e01,
    error10: e10,
    original: sortedOriginal,
    mitigated: sortedMitigated,
    dominantState,
    rawDominantPct: Number(rawDominantPct.toFixed(2)),
    mitigatedDominantPct: Number(mitigatedDominantPct.toFixed(2)),
    fidelityDeltaPct: Number((mitigatedDominantPct - rawDominantPct).toFixed(2)),
    l1ShiftPct: Number(l1ShiftPct.toFixed(2)),
  };
}

export function extrapolateZneRichardson(
  runs: Array<{ scale: number; counts: Record<string, number> }>
): ReadoutMitigationResult {
  if (!Array.isArray(runs) || runs.length < 2) {
    throw new Error('Per la ZNE (Zero-Noise Extrapolation) servono almeno 2 esecuzioni a fattori di rumore diversi (es. scala 1 e scala 3).');
  }

  const sortedRuns = [...runs].sort((a, b) => a.scale - b.scale);
  for (let i = 1; i < sortedRuns.length; i++) {
    if (Math.abs(sortedRuns[i].scale - sortedRuns[i - 1].scale) < 1e-6) {
      throw new Error('I fattori di scala rumore ZNE devono essere distinti.');
    }
  }

  const allKeys = new Set<string>();
  let bitWidth = 1;
  for (const r of sortedRuns) {
    for (const k of Object.keys(r.counts)) {
      const clean = k.trim().replace(/[^01]/g, '');
      if (clean) {
        bitWidth = Math.max(bitWidth, clean.length);
      }
    }
  }
  bitWidth = Math.min(12, bitWidth);

  const runProbs = sortedRuns.map((r) => {
    const map: Record<string, number> = {};
    let total = 0;
    for (const [k, v] of Object.entries(r.counts)) {
      const clean = k.trim().replace(/[^01]/g, '').padStart(bitWidth, '0').slice(-bitWidth);
      const val = Math.max(0, Number(v || 0));
      map[clean] = (map[clean] || 0) + val;
      total += val;
      allKeys.add(clean);
    }
    if (total <= 0) throw new Error(`Totale shots nullo alla scala ${r.scale}.`);
    const probs: Record<string, number> = {};
    for (const key of Object.keys(map)) {
      probs[key] = map[key] / total;
    }
    return { scale: r.scale, total, rawCounts: map, probs };
  });

  const keys = Array.from(allKeys).sort();
  // Lagrange Richardson weights at lambda = 0: w_k = prod_{j != k} (-lambda_j) / (lambda_k - lambda_j)
  const weights = runProbs.map((r, k) => {
    let w = 1;
    for (let j = 0; j < runProbs.length; j++) {
      if (j !== k) {
        w *= (-runProbs[j].scale) / (r.scale - runProbs[j].scale);
      }
    }
    return w;
  });

  const extrapolatedVec = keys.map((key) =>
    runProbs.reduce((acc, r, k) => acc + weights[k] * (r.probs[key] || 0), 0)
  );
  const projected = projectOntoSimplex(extrapolatedVec);

  const baseRun = runProbs[0];
  const totalShots = baseRun.total;

  let l1Diff = 0;
  keys.forEach((key, idx) => {
    l1Diff += Math.abs(projected[idx] - (baseRun.probs[key] || 0));
  });

  const exactCounts = projected.map((p, idx) => ({
    key: keys[idx],
    exact: p * totalShots,
    floor: Math.floor(p * totalShots),
  }));
  let rem = totalShots - exactCounts.reduce((a, b) => a + b.floor, 0);
  exactCounts.sort((a, b) => (b.exact - b.floor) - (a.exact - a.floor));
  for (let i = 0; i < rem; i++) {
    exactCounts[i].floor += 1;
  }

  exactCounts.sort((a, b) => b.floor - a.floor);
  const mitigated: Record<string, number> = {};
  const original: Record<string, number> = {};
  for (const item of exactCounts) {
    mitigated[item.key] = item.floor;
    original[item.key] = baseRun.rawCounts[item.key] || 0;
  }

  const dominantState = exactCounts[0].key;
  const rawDominantPct = ((original[dominantState] || 0) / totalShots) * 100;
  const mitigatedDominantPct = ((mitigated[dominantState] || 0) / totalShots) * 100;

  return {
    method: 'ZNE_RICHARDSON',
    numQubits: bitWidth,
    totalShots,
    error01: 0,
    error10: 0,
    original,
    mitigated,
    dominantState,
    rawDominantPct: Number(rawDominantPct.toFixed(2)),
    mitigatedDominantPct: Number(mitigatedDominantPct.toFixed(2)),
    fidelityDeltaPct: Number((mitigatedDominantPct - rawDominantPct).toFixed(2)),
    l1ShiftPct: Number(((l1Diff / 2) * 100).toFixed(2)),
  };
}
