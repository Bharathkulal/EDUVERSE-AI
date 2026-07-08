import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── helpers ────────────────────────────────────────────────────────────────
function multiply2x2(A, B) {
  return [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];
}

// Build all animation steps for a 2×2 multiplication
function buildSteps(matA, matB, question) {
  const C = multiply2x2(matA, matB);
  const isSquare = question?.type === 'square';
  const label = isSquare ? 'A²' : 'AB';
  const steps = [];

  // Step 0 — intro
  steps.push({
    phase: 'intro',
    activeRow: null,
    activeCol: null,
    revealedCells: [],
    explanation: `Starting Matrix Multiplication → computing ${label} = A × ${isSquare ? 'A' : 'B'}.`,
  });

  // Steps for each result cell C[i][j]
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const rowA = matA[i];
      const colB = [matB[0][j], matB[1][j]];
      const products = rowA.map((v, k) => `${v}×${colB[k]}`);
      const sums = rowA.map((v, k) => v * colB[k]);
      const total = sums.reduce((a, b) => a + b, 0);

      // Highlight step (show which row & col are being used)
      steps.push({
        phase: 'highlight',
        activeRow: i,
        activeCol: j,
        revealedCells: Array.from({ length: i * 2 + j }, (_, idx) => ({
          r: Math.floor(idx / 2),
          c: idx % 2,
          val: C[Math.floor(idx / 2)][idx % 2],
        })),
        currentCell: { r: i, c: j },
        dotProduct: null,
        explanation: `C[${i + 1}][${j + 1}]: Take Row ${i + 1} of A  ×  Col ${j + 1} of B`,
      });

      // Computation step (show the dot product)
      steps.push({
        phase: 'compute',
        activeRow: i,
        activeCol: j,
        revealedCells: Array.from({ length: i * 2 + j }, (_, idx) => ({
          r: Math.floor(idx / 2),
          c: idx % 2,
          val: C[Math.floor(idx / 2)][idx % 2],
        })),
        currentCell: { r: i, c: j },
        dotProduct: { products, sums, total, rowA, colB },
        explanation: `C[${i + 1}][${j + 1}] = ${products.join(' + ')} = ${sums.join(' + ')} = ${total}`,
      });

      // Reveal step (write the result into C)
      steps.push({
        phase: 'reveal',
        activeRow: i,
        activeCol: j,
        revealedCells: Array.from({ length: i * 2 + j + 1 }, (_, idx) => ({
          r: Math.floor(idx / 2),
          c: idx % 2,
          val: C[Math.floor(idx / 2)][idx % 2],
        })),
        currentCell: { r: i, c: j },
        dotProduct: { products, sums, total, rowA, colB },
        explanation: `✓ C[${i + 1}][${j + 1}] = ${total}  →  written into result matrix.`,
      });
    }
  }

  // Final step
  steps.push({
    phase: 'done',
    activeRow: null,
    activeCol: null,
    revealedCells: [
      { r: 0, c: 0, val: C[0][0] },
      { r: 0, c: 1, val: C[0][1] },
      { r: 1, c: 0, val: C[1][0] },
      { r: 1, c: 1, val: C[1][1] },
    ],
    result: C,
    explanation: `✅ ${label} = [[${C[0][0]}, ${C[0][1]}], [${C[1][0]}, ${C[1][1]}]]  — Multiplication complete!`,
  });

  return steps;
}

// ─── Matrix display sub-component ───────────────────────────────────────────
function MatrixBox({ label, data, highlightRow, highlightCol, isB, revealMap, currentCell, colorClass = 'emerald' }) {
  const colors = {
    emerald: { row: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300', col: 'bg-sky-500/20 border-sky-500/50 text-sky-300', cur: 'bg-indigo-500/30 border-indigo-400 text-white scale-110' },
    indigo:  { row: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300',   col: 'bg-amber-500/20 border-amber-500/50 text-amber-300', cur: 'bg-indigo-500/30 border-indigo-400 text-white scale-110' },
  }[colorClass] || {};

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] font-black uppercase tracking-widest text-[var(--db-text-muted)] mb-1">{label}</span>
      <div className="relative flex items-center">
        {/* Left bracket */}
        <div className="flex flex-col justify-between h-full mr-1">
          <span className="text-2xl font-thin text-[var(--db-text-muted)] leading-none">[</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {data.map((row, i) =>
            row.map((val, j) => {
              const isActiveRow = !isB && highlightRow === i;
              const isActiveCol = isB && highlightCol === j;
              const isCurrent = currentCell && currentCell.r === i && currentCell.c === j;
              const isRevealed = revealMap && revealMap[`${i},${j}`] !== undefined;

              let cellClass = 'w-12 h-12 rounded-xl flex items-center justify-center font-mono text-lg font-bold border transition-all duration-300 text-[var(--db-text-secondary)] border-[var(--db-card-border)] bg-[var(--db-card-bg-elevated)]';
              if (isCurrent) cellClass += ` ${colors.cur || ''} shadow-lg shadow-indigo-500/20`;
              else if (isActiveRow) cellClass += ` ${colors.row || ''} shadow-sm`;
              else if (isActiveCol) cellClass += ` ${colors.col || ''} shadow-sm`;

              return (
                <motion.div
                  key={`${i}-${j}`}
                  className={cellClass}
                  animate={isCurrent ? { scale: 1.15 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {isRevealed
                    ? <motion.span key={`rev-${i}-${j}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-400">{revealMap[`${i},${j}`]}</motion.span>
                    : val}
                </motion.div>
              );
            })
          )}
        </div>
        {/* Right bracket */}
        <div className="ml-1">
          <span className="text-2xl font-thin text-[var(--db-text-muted)] leading-none">]</span>
        </div>
      </div>
    </div>
  );
}

// ─── Result matrix ───────────────────────────────────────────────────────────
function ResultMatrix({ revealedCells, size = 2 }) {
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  revealedCells.forEach(({ r, c, val }) => { grid[r][c] = val; });

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] font-black uppercase tracking-widest text-[var(--db-text-muted)] mb-1">Result C</span>
      <div className="flex items-center">
        <span className="text-2xl font-thin text-[var(--db-text-muted)] mr-1">[</span>
        <div className="grid grid-cols-2 gap-2">
          {grid.map((row, i) =>
            row.map((val, j) => (
              <AnimatePresence key={`${i}-${j}`} mode="wait">
                {val !== null ? (
                  <motion.div
                    key={`filled-${i}-${j}`}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-mono text-lg font-bold border bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10"
                  >
                    {val}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`empty-${i}-${j}`}
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-mono text-lg font-bold border border-dashed border-[var(--db-card-border)] text-[var(--db-text-muted)]"
                  >
                    ?
                  </motion.div>
                )}
              </AnimatePresence>
            ))
          )}
        </div>
        <span className="text-2xl font-thin text-[var(--db-text-muted)] ml-1">]</span>
      </div>
    </div>
  );
}

// ─── Main Engine ─────────────────────────────────────────────────────────────
export default function MatrixMultiplicationEngine({ question, playbackState, speed, onExplain, onFinish }) {
  const [stepIdx, setStepIdx] = useState(0);
  const steps = useRef([]);
  const timerRef = useRef(null);

  // Rebuild steps whenever question changes
  useEffect(() => {
    if (!question) return;
    steps.current = buildSteps(question.matA, question.matB, question);
    setStepIdx(0);
  }, [question]);

  // Advance steps based on playback state
  useEffect(() => {
    clearInterval(timerRef.current);
    if (playbackState === 'PLAYING') {
      const delay = Math.round(1400 / (speed || 1));
      timerRef.current = setInterval(() => {
        setStepIdx(prev => {
          const next = prev + 1;
          if (next >= steps.current.length) {
            clearInterval(timerRef.current);
            onFinish?.();
            return prev;
          }
          return next;
        });
      }, delay);
    }
    return () => clearInterval(timerRef.current);
  }, [playbackState, speed, onFinish]);

  // Reset on IDLE
  useEffect(() => {
    if (playbackState === 'IDLE') {
      setStepIdx(0);
    }
  }, [playbackState]);

  // Fire explanation callback
  useEffect(() => {
    const step = steps.current[stepIdx];
    if (step) onExplain?.(step.explanation);
  }, [stepIdx, onExplain]);

  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--db-text-muted)]">
        <p>Select a question to begin.</p>
      </div>
    );
  }

  const allSteps = steps.current;
  const step = allSteps[stepIdx] || allSteps[0];
  if (!step) return null;

  const { matA, matB } = question;
  const isSquare = question.type === 'square';

  // Build revealMap for MatrixBox C column highlights
  const revealMap = {};
  (step.revealedCells || []).forEach(({ r, c, val }) => { revealMap[`${r},${c}`] = val; });

  // Computed result
  const C = multiply2x2(matA, matB);

  return (
    <div className="flex-1 flex flex-col overflow-auto p-5 gap-5 font-sans">

      {/* ── Top: question label ── */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          Linear Algebra · Matrix Multiplication
        </span>
        <span className="text-xs text-[var(--db-text-muted)]">{question.label}</span>
      </div>

      {/* ── Matrix Equation Row ── */}
      <div className="flex flex-wrap items-center justify-center gap-5 py-4">
        <MatrixBox
          label={isSquare ? 'A' : 'A'}
          data={matA}
          highlightRow={step.activeRow}
          highlightCol={null}
          isB={false}
          revealMap={{}}
          currentCell={null}
        />

        <div className="flex flex-col items-center">
          <span className="text-3xl font-thin text-[var(--db-text-muted)]">×</span>
        </div>

        <MatrixBox
          label={isSquare ? 'A' : 'B'}
          data={matB}
          highlightRow={null}
          highlightCol={step.activeCol}
          isB={true}
          revealMap={{}}
          currentCell={null}
        />

        <div className="flex flex-col items-center">
          <span className="text-3xl font-thin text-indigo-400">=</span>
        </div>

        <ResultMatrix revealedCells={step.revealedCells || []} />
      </div>

      {/* ── Dot Product Working Area ── */}
      <AnimatePresence mode="wait">
        {step.dotProduct && (
          <motion.div
            key={`dp-${stepIdx}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5"
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mb-3">
              Step-by-Step Computation — C[{step.activeRow + 1}][{step.activeCol + 1}]
            </p>

            {/* Row × Column visual */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Row of A */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-[var(--db-text-muted)] font-bold uppercase text-center">Row {step.activeRow + 1} of A</span>
                <div className="flex gap-2">
                  {step.dotProduct.rowA.map((v, k) => (
                    <div key={k} className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm font-bold border bg-emerald-500/20 border-emerald-500/40 text-emerald-300">
                      {v}
                    </div>
                  ))}
                </div>
              </div>

              <span className="text-xl text-[var(--db-text-muted)] font-thin">·</span>

              {/* Col of B */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-[var(--db-text-muted)] font-bold uppercase text-center">Col {step.activeCol + 1} of B</span>
                <div className="flex gap-2">
                  {step.dotProduct.colB.map((v, k) => (
                    <div key={k} className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm font-bold border bg-sky-500/20 border-sky-500/40 text-sky-300">
                      {v}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Arithmetic layout */}
            <div className="rounded-xl bg-[var(--db-card-bg)] border border-[var(--db-card-border)] p-4 font-mono text-sm space-y-1">
              {step.dotProduct.rowA.map((a, k) => {
                const b = step.dotProduct.colB[k];
                const product = step.dotProduct.sums[k];
                return (
                  <div key={k} className="flex items-center gap-2 text-[var(--db-text-secondary)]">
                    <span className="text-emerald-400 w-4">{k === 0 ? ' ' : '+'}</span>
                    <span className="text-emerald-300">{a}</span>
                    <span className="text-[var(--db-text-muted)]">×</span>
                    <span className="text-sky-300">{b}</span>
                    <span className="text-[var(--db-text-muted)]">=</span>
                    <span className="text-amber-300 font-bold">{product}</span>
                  </div>
                );
              })}
              <div className="border-t border-[var(--db-card-border)] pt-2 mt-2 flex items-center gap-2">
                <span className="text-[var(--db-text-muted)] text-xs">Total</span>
                <span className="text-white font-bold text-base ml-auto">= {step.dotProduct.total}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Final answer banner ── */}
      <AnimatePresence>
        {step.phase === 'done' && (
          <motion.div
            key="done-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center"
          >
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">
              {isSquare ? 'A²' : 'AB'} = Final Result
            </p>
            <div className="flex items-center justify-center gap-2 font-mono text-lg text-[var(--db-text-main)] mb-3">
              <span className="text-2xl text-[var(--db-text-muted)]">[</span>
              <div className="grid grid-cols-2 gap-3">
                {C.map((row, i) =>
                  row.map((val, j) => (
                    <motion.div
                      key={`f-${i}-${j}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (i * 2 + j) * 0.12 }}
                      className="w-14 h-14 rounded-xl flex items-center justify-center font-mono text-xl font-extrabold border bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10"
                    >
                      {val}
                    </motion.div>
                  ))
                )}
              </div>
              <span className="text-2xl text-[var(--db-text-muted)]">]</span>
            </div>

            {/* Interpretation note */}
            <div className="mt-3 text-xs text-[var(--db-text-muted)] space-y-1">
              {isSquare && C[0][0] === 1 && C[0][1] === 0 && C[1][0] === 0 && C[1][1] === 1 && (
                <p className="text-emerald-400 font-bold">
                  🎯 A² = I (Identity Matrix) — A is an involutory matrix!
                </p>
              )}
              {!isSquare && C[0][0] === 0 && C[0][1] === 0 && C[1][0] === 0 && C[1][1] === 0 && (
                <p className="text-amber-400 font-bold">
                  ⚠️ AB = O (Zero Matrix) — despite A ≠ 0 and B ≠ 0.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step progress indicator ── */}
      <div className="flex items-center gap-1 justify-center flex-wrap mt-auto pt-2">
        {allSteps.map((s, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === stepIdx
                ? 'w-6 bg-indigo-500'
                : idx < stepIdx
                ? 'w-2 bg-emerald-500'
                : 'w-2 bg-[var(--db-card-border)]'
            }`}
          />
        ))}
        <span className="ml-2 text-[10px] text-[var(--db-text-muted)] font-mono">
          {stepIdx + 1} / {allSteps.length}
        </span>
      </div>
    </div>
  );
}
