import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypewriterStep from './TypewriterStep';

function InteractiveDifferenceTable({ xVals, yVals, diffs, operatorSymbol, playbackState, speed, handleTypingComplete, getDuration, onExplain }) {
  const count = xVals.length;
  const numRows = 2 * count - 1;
  const cols = ['x', 'y', ...Array.from({ length: count - 1 }, (_, k) => `${operatorSymbol}${k + 1 > 1 ? `<sup>${k + 1}</sup>` : ''}`)];

  // Generate list of difference cells to animate in order
  const animatedCells = useMemo(() => {
    const cells = [];
    for (let c = 2; c <= count; c++) {
      for (let i = 0; i <= count - c; i++) {
        const r = (c - 1) + 2 * i;
        cells.push({
          c, // column index (0 to count)
          r, // row index in 2*N - 1 rows
          diffCol: c - 1,
          diffRow: i,
          val: diffs[c - 1][i],
          upperSrc: { c: c - 1, r: r - 1 },
          lowerSrc: { c: c - 1, r: r + 1 }
        });
      }
    }
    return cells;
  }, [count, diffs]);

  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(playbackState === 'PLAYING');
  
  const [typedFormula, setTypedFormula] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState(new Set());

  useEffect(() => {
    setIsPlaying(playbackState === 'PLAYING');
    if (playbackState === 'IDLE') {
      setCurrentStepIndex(-1);
      setRevealedKeys(new Set());
    } else if (playbackState === 'FINISHED') {
      setCurrentStepIndex(animatedCells.length - 1);
    }
  }, [playbackState, animatedCells.length]);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIndex >= animatedCells.length - 1) {
      // Completed construction
      handleTypingComplete();
      return;
    }

    const intervalTime = getDuration(1800); // 1.8 seconds per cell computation
    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => prev + 1);
    }, intervalTime);

    return () => clearTimeout(timer);
  }, [currentStepIndex, isPlaying, animatedCells.length, handleTypingComplete, getDuration]);

  // Typewriter effect for subtraction calculations
  useEffect(() => {
    if (currentStepIndex === -1) {
      setTypedFormula('');
      setTypingComplete(false);
      setRevealedKeys(new Set());
      return;
    }

    if (currentStepIndex >= 0 && currentStepIndex < animatedCells.length) {
      const cell = animatedCells[currentStepIndex];
      // Get values from already revealed source cells
      const upperVal = getCellValue(cell.upperSrc.c, cell.upperSrc.r);
      const lowerVal = getCellValue(cell.lowerSrc.c, cell.lowerSrc.r);
      const fullFormula = `${lowerVal} − ${upperVal} = ${cell.val}`;

      setTypingComplete(false);
      setTypedFormula('');

      let index = 0;
      const typeDelay = Math.max(15, 55 / speed);
      const intervalId = setInterval(() => {
        index++;
        setTypedFormula(fullFormula.slice(0, index));
        if (index >= fullFormula.length) {
          clearInterval(intervalId);
          setTypingComplete(true);
          setRevealedKeys(prev => {
            const next = new Set(prev);
            next.add(`${cell.c}-${cell.r}`);
            return next;
          });
        }
      }, typeDelay);

      return () => clearInterval(intervalId);
    }
  }, [currentStepIndex, animatedCells, speed]);

  // Handle dynamic trace explanations for each calculation
  useEffect(() => {
    if (!isPlaying || !onExplain) return;
    if (currentStepIndex === -1) {
      onExplain("Constructing the staggered difference table. We start with the given x and y columns.");
    } else if (currentStepIndex >= 0 && currentStepIndex < animatedCells.length) {
      const cell = animatedCells[currentStepIndex];
      const upperVal = getCellValue(cell.upperSrc.c, cell.upperSrc.r);
      const lowerVal = getCellValue(cell.lowerSrc.c, cell.lowerSrc.r);
      
      let colName = "";
      if (cell.c === 2) colName = "First Difference (Δ)";
      else if (cell.c === 3) colName = "Second Difference (Δ²)";
      else if (cell.c === 4) colName = "Third Difference (Δ³)";
      else if (cell.c === 5) colName = "Fourth Difference (Δ⁴)";
      else colName = `Difference (Δ^${cell.c - 1})`;

      const exp = `Compute the ${colName} cell at Row ${cell.diffRow + 1} by subtracting the upper-left source value ${upperVal} from the lower-left source value ${lowerVal}: ${lowerVal} − ${upperVal} = ${cell.val}.`;
      onExplain(exp);
    }
  }, [currentStepIndex, isPlaying, animatedCells, onExplain]);

  // Current active step calculation details
  const activeCell = currentStepIndex >= 0 && currentStepIndex < animatedCells.length ? animatedCells[currentStepIndex] : null;

  // Function to get value at cell (c, r) in grid
  const getCellValue = (c, r) => {
    if (c === 0) return r % 2 === 0 ? xVals[Math.floor(r / 2)].toString() : '';
    if (c === 1) return r % 2 === 0 ? yVals[Math.floor(r / 2)].toString() : '';
    
    const diffCol = c - 1;
    const i = (r - (c - 1)) / 2;
    // Find if this cell has been animated yet
    const cellIdx = animatedCells.findIndex(cell => cell.c === c && cell.r === r);
    if (cellIdx === -1) return '';
    
    const isFinished = playbackState === 'FINISHED';
    if (isFinished || revealedKeys.has(`${c}-${r}`) || cellIdx < currentStepIndex) {
      return diffs[diffCol][i]?.toString() || '';
    }
    return '';
  };

  // Check if a cell is currently highlighted as source or target
  const getCellHighlight = (c, r) => {
    if (!activeCell) return null;
    if (activeCell.c === c && activeCell.r === r) return 'target';
    if (activeCell.upperSrc.c === c && activeCell.upperSrc.r === r) return 'upperSrc';
    if (activeCell.lowerSrc.c === c && activeCell.lowerSrc.r === r) return 'lowerSrc';
    return null;
  };

  // Get subtraction text for the active calculation
  const getSubtractionText = () => {
    if (!activeCell) return '';
    // Find values of source cells
    const upperValStr = getCellValue(activeCell.upperSrc.c, activeCell.upperSrc.r);
    const lowerValStr = getCellValue(activeCell.lowerSrc.c, activeCell.lowerSrc.r);
    return `${lowerValStr} − ${upperValStr} = ${activeCell.val}`;
  };

  return (
    <div className="flex flex-col gap-4 w-full mt-3">
      {/* Subtraction steps animation banner */}
      <div className="h-14 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeCell && (
            <motion.div
              key={`calc-${currentStepIndex}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-between p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm text-sm w-full"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="font-semibold text-slate-500 dark:text-slate-400 font-sans">
                  Computing column {activeCell.c - 1} difference ({operatorSymbol}<sup>{activeCell.c - 1 > 1 ? activeCell.c - 1 : ''}</sup>):
                </span>
              </div>
              <div className="font-mono font-bold text-blue-600 dark:text-blue-400 text-base bg-white dark:bg-slate-900 px-3 py-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 flex items-center">
                <span>{typedFormula}</span>
                {!typingComplete && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="inline-block w-[3px] h-[1.1em] bg-blue-500 ml-1.5"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="overflow-x-auto w-full border border-[var(--db-card-border)] rounded-2xl bg-[var(--db-card-bg)] shadow-md p-4 relative">
        <div className="min-w-[500px] w-full">
          {/* Header row */}
          <div 
            className="grid gap-2 text-center pb-4 border-b border-[var(--db-card-border)] font-bold text-xs uppercase tracking-widest text-[var(--db-text-secondary)]"
            style={{ gridTemplateColumns: `repeat(${count + 1}, 1fr)` }}
          >
            {cols.map((colHeader, idx) => (
              <div key={idx} dangerouslySetInnerHTML={{ __html: colHeader }} className="py-2" />
            ))}
          </div>

          {/* Table body */}
          <div className="relative mt-4 flex flex-col">
            {Array.from({ length: numRows }).map((_, rIdx) => {
              const isEvenRow = rIdx % 2 === 0;
              return (
                <div 
                  key={rIdx} 
                  className="grid gap-2 items-center h-12 relative"
                  style={{ gridTemplateColumns: `repeat(${count + 1}, 1fr)` }}
                >
                  {Array.from({ length: count + 1 }).map((_, cIdx) => {
                    const val = getCellValue(cIdx, rIdx);
                    const highlight = getCellHighlight(cIdx, rIdx);
                    
                    // Show difference values staggered
                    const isVisibleCell = (cIdx === 0 || cIdx === 1) ? isEvenRow : (
                      (cIdx - 1) % 2 === 0 ? isEvenRow : !isEvenRow
                    );

                    // Skip cells that aren't part of the staggered layout
                    if (!isVisibleCell) {
                      return <div key={cIdx} className="h-full" />;
                    }

                    // Check if this cell is within the triangular bounds of the dataset
                    const diffCol = cIdx - 1;
                    const i = cIdx >= 2 ? (rIdx - (cIdx - 1)) / 2 : Math.floor(rIdx / 2);
                    const isValidDiffCell = cIdx >= 2 && i < count - diffCol;
                    const isValidXYCell = cIdx < 2 && rIdx < 2 * count;
                    const inTriangle = cIdx < 2 ? isValidXYCell : isValidDiffCell;

                    if (!inTriangle) {
                      return <div key={cIdx} className="h-full" />;
                    }

                    // Render connector lines for difference cells that are revealed or active
                    const cellIdx = animatedCells.findIndex(cell => cell.c === cIdx && cell.r === rIdx);
                    const showConnector = cIdx >= 2 && cellIdx !== -1 && cellIdx <= currentStepIndex;

                    return (
                      <div
                        key={cIdx}
                        className={`h-full flex items-center justify-center relative font-mono text-sm font-semibold transition-all duration-300 rounded-lg ${
                          highlight === 'target'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500 scale-110 z-20 shadow-md font-bold'
                            : highlight === 'lowerSrc'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/60 scale-105 z-10 font-bold'
                            : highlight === 'upperSrc'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/60 scale-105 z-10 font-bold'
                            : 'text-[var(--db-text-main)]'
                        }`}
                      >
                        {/* Subtle diagonal connector lines */}
                        {showConnector && (
                          <svg
                            className="absolute right-[50%] top-[-50%] w-full h-[200%] pointer-events-none stroke-slate-200 dark:stroke-slate-800 stroke-[1.5] fill-none z-0"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                          >
                            <path d="M 0 0 L 100 50 L 0 100" />
                          </svg>
                        )}
                        
                        {/* Number label container with a background mask to overlap lines cleanly */}
                        {val && (
                          <span className="relative z-10 px-2.5 py-1 rounded-md bg-[var(--db-card-bg)] border border-transparent shadow-sm">
                            {val}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const triggerConfetti = () => {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'];
  const particles = [];
  
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() * 40 - 20),
      y: canvas.height * 0.75 + (Math.random() * 40 - 20),
      vx: (Math.random() - 0.5) * 20,
      vy: -15 - Math.random() * 15,
      r: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2
    });
  }

  let animationFrameId;
  const startTime = Date.now();

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.5;
      p.vx *= 0.98;
      p.angle += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - (Date.now() - startTime) / 3000);

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
      ctx.restore();
    });

    if (Date.now() - startTime < 3500) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      window.removeEventListener('resize', resizeCanvas);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };

  animate();
};

export default function NotebookEngine({ 
  func, a, b, n, method, playbackState, speed, onExplain, onFinish, dataset, targetX, direction,
  bisectionProblemId, bisectionIterations, rkX0, rkY0, rkH, rkSteps, rkFuncId, matMulQuestion,
  onPlaybackStateChange
}) {
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [stepComplete, setStepComplete] = useState(false);
  const thinkingTimerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const getDuration = (base) => base / speed;

  // Factorial utility
  const factorial = (num) => {
    if (num <= 1) return 1;
    return num * factorial(num - 1);
  };

  // Calculate the sequence of mathematical steps
  const steps = useMemo(() => {
    const sequence = [];

    if (method === 'Bisection Method') {
      const isBis1 = bisectionProblemId === 'bis1';
      const numIters = parseInt(bisectionIterations) || 5;

      const f_expr = isBis1 ? (x) => x*x*x - x - 1 : (x) => x*x*x - 4*x - 9;
      const f_tex = isBis1 ? 'x³ - x - 1 = 0' : 'x³ - 4x - 9 = 0';

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Find the real root of the equation:\nf(x) = ${f_tex}\n\nMethod: Bisection Method\nIterations: Solve till ${numIters} iterations`,
        explanation: 'We start by locating the interval [a, b] where the function changes sign, meaning f(a) · f(b) < 0.'
      });

      // Find interval
      let a_val = 0, b_val = 0;
      let checkText = 'Testing initial values:\n';
      for (let i = 0; i <= 5; i++) {
        const val = f_expr(i);
        checkText += `f(${i}) = ${i}³ - ${isBis1 ? i : `4(${i})`} - ${isBis1 ? '1' : '9'} = ${val} (${val < 0 ? '-ve' : '+ve'})\n`;
        if (val < 0) {
          a_val = i;
        } else if (val > 0) {
          b_val = i;
          break;
        }
      }
      checkText += `\nSince f(${a_val}) is negative and f(${b_val}) is positive, a root lies between ${a_val} and ${b_val}.\nInitial boundaries: a = ${a_val}, b = ${b_val}`;

      sequence.push({
        type: 'math',
        title: 'STEP 1: FIND INITIAL BOUNDARIES [a, b]',
        content: checkText,
        explanation: `By intermediate value theorem, since f(${a_val}) < 0 and f(${b_val}) > 0, there exists at least one real root in the interval [${a_val}, ${b_val}].`
      });

      let a_curr = a_val;
      let b_curr = b_val;
      let x_mid = 0;
      const history = [];

      for (let k = 1; k <= numIters; k++) {
        const prev_a = a_curr;
        const prev_b = b_curr;
        x_mid = (a_curr + b_curr) / 2;
        const f_mid = f_expr(x_mid);
        const sign = f_mid < 0 ? '-ve' : '+ve';

        history.push({ iter: k, a: prev_a, b: prev_b, x_mid, f_mid, sign });

        let stepText = `Midpoint: x_${k-1} = (a + b) / 2\n`;
        stepText += `         x_${k-1} = (${prev_a} + ${prev_b}) / 2 = ${x_mid.toFixed(5)}\n\n`;
        stepText += `Function value at midpoint:\n`;
        stepText += `f(${x_mid.toFixed(5)}) = (${x_mid.toFixed(5)})³ - ${isBis1 ? `${x_mid.toFixed(5)}` : `4(${x_mid.toFixed(5)})`} - ${isBis1 ? '1' : '9'}\n`;
        stepText += `            = ${f_mid.toFixed(6)} (${sign})\n\n`;
        
        if (f_mid === 0) {
          stepText += `Since f(x_${k-1}) = 0, the exact root is found!`;
          a_curr = x_mid;
          b_curr = x_mid;
        } else if (f_mid < 0) {
          stepText += `Since f(${x_mid.toFixed(5)}) is negative, the root lies between ${x_mid.toFixed(5)} and ${prev_b}.\n`;
          stepText += `New boundaries: a = ${x_mid.toFixed(5)}, b = ${prev_b}`;
          a_curr = x_mid;
        } else {
          stepText += `Since f(${x_mid.toFixed(5)}) is positive, the root lies between ${prev_a} and ${x_mid.toFixed(5)}.\n`;
          stepText += `New boundaries: a = ${prev_a}, b = ${x_mid.toFixed(5)}`;
          b_curr = x_mid;
        }

        sequence.push({
          type: 'math',
          title: `ITERATION ${k}`,
          content: stepText,
          explanation: `In iteration ${k}, we compute the midpoint x_${k-1} = ${x_mid.toFixed(5)} and evaluate f(x_${k-1}). Since it is ${sign}, we replace the boundary with the same sign to bracket the root closer.`
        });
      }

      sequence.push({
        type: 'bisTable',
        title: 'CONVERGENCE TABLE',
        history,
        explanation: 'The bisection convergence table details the values of boundaries a, b, midpoint approximation, and function values at each iteration step.'
      });

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `Required root of f(x) = 0 is approximately:\nx ≈ ${x_mid.toFixed(5)}`,
        explanation: `After ${numIters} iterations of the Bisection Method, the estimated root is x ≈ ${x_mid.toFixed(5)}.`
      });
    }

    else if (method === 'Trapezoidal Rule') {
      const h_val = (b - a) / n;
      const functionLabel = func.label.split('=')[1].trim();

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Evaluate: I = ∫ [${a} to ${b}] ( ${functionLabel} ) dx\nMethod:   Trapezoidal Rule\nGiven:    y = f(x) = ${functionLabel}\nBounds:   a = ${a}, b = ${b}, n = ${n} intervals`,
        explanation: 'We start by identifying the problem. We know the function, the integration bounds, and the number of sub-intervals.'
      });

      sequence.push({
        type: 'math',
        title: 'STEP 1: COMPUTE STEP SIZE (h)',
        content: `h = (b - a) / n\nh = (${b} - ${a}) / ${n}\nh = ${h_val.toFixed(4)}`,
        explanation: 'We divide the total interval length (b - a) by the number of sub-intervals (n) to get the width of each strip.'
      });

      // Construct Data Table text
      let tableXStr = 'x   ';
      let tableYStr = 'y   ';
      const points = [];
      for (let i = 0; i <= n; i++) {
        const x = a + i * h_val;
        const y = func.expr(x);
        points.push(y);
        tableXStr += `${x.toFixed(2).padEnd(8)}`;
        tableYStr += `${y.toFixed(3).padEnd(8)}`;
      }
      const nodesStr = `Given that y = f(x) = ${functionLabel}\n\n${tableXStr}\n${tableYStr}`;

      sequence.push({
        type: 'math',
        title: 'STEP 2: CONSTRUCT DATA TABLE',
        content: nodesStr,
        explanation: 'We plug each node x₀, x₁, x₂... into f(x) to build the data table. Intermediate values are calculated to 3 decimal places.'
      });

      // Substitution Step
      let formulaStr = `I = ∫ [x₀ to xₙ] y dx = (h/2) × [ y₀ + 2·(y₁ + y₂ + ... + yₙ₋₁) + yₙ ]\n\n`;
      formulaStr += `I ≈ (${h_val.toFixed(4)}/2) × [ ${points[0].toFixed(3)}`;
      let innerSum = 0;
      if (n > 1) {
        formulaStr += ` + 2·(`;
        for (let i = 1; i < n; i++) {
          formulaStr += `${points[i].toFixed(3)}${i < n - 1 ? ' + ' : ''}`;
          innerSum += points[i];
        }
        formulaStr += `)`;
      }
      formulaStr += ` + ${points[n].toFixed(3)} ]`;

      sequence.push({
        type: 'math',
        title: 'STEP 3: INTEGRATION FORMULA & VALUES SUBSTITUTION',
        content: formulaStr,
        explanation: 'We substitute our x and y nodes into the Trapezoidal Rule formula. The first and last nodes have coefficient 1; all middle nodes are multiplied by 2.'
      });

      // Arithmetic step
      const h_div_2 = h_val / 2;
      const innerSumDouble = 2 * innerSum;
      const totalSum = points[0] + points[n] + innerSumDouble;
      const finalI = h_div_2 * totalSum;

      let calcStr = `I ≈ ${h_div_2.toFixed(4)} × [ ${points[0].toFixed(3)} + 2·(${innerSum.toFixed(3)}) + ${points[n].toFixed(3)} ]\n`;
      calcStr += `I ≈ ${h_div_2.toFixed(4)} × [ ${points[0].toFixed(3)} + ${innerSumDouble.toFixed(3)} + ${points[n].toFixed(3)} ]\n`;
      calcStr += `I ≈ ${h_div_2.toFixed(4)} × ${totalSum.toFixed(4)}\n`;
      calcStr += `I ≈ ${finalI.toFixed(6)}`;

      sequence.push({
        type: 'math',
        title: 'STEP 4: SOLVE ARITHMETIC',
        content: calcStr,
        explanation: 'We evaluate the inner sum, multiply it by 2, sum it with the outer boundary terms, and finally scale it by h/2.'
      });

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `I ≈ ${finalI.toFixed(4)}\n\nCorrect to 3 decimal places:\nI ≈ ${finalI.toFixed(3)}`,
        explanation: `The approximate area under the function is ${finalI.toFixed(3)}.`
      });
    } 

    else if (method === 'Simpson’s 1/3 Rule' || method === "Simpson's 1/3 Rule") {
      let isPredefined = dataset && dataset.id !== 'custom';
      let functionLabel = "";
      let a_val = 0;
      let b_val = 0;
      let n_val = 4;
      let h_val = 0;
      let points = [];
      let xPts = [];
      let questionText = "";
      
      if (isPredefined) {
        questionText = dataset.question;
        if (dataset.id === 's13_q1') {
          a_val = 0;
          b_val = 1;
          n_val = 2;
          h_val = 0.5;
          functionLabel = "sin(πx)";
          xPts = [0, 0.5, 1.0];
          points = [0, 1.0, 0];
        } else {
          // s13_q2
          a_val = 0;
          b_val = 1;
          n_val = 5;
          h_val = 0.2;
          functionLabel = "√(1 - x²)";
          xPts = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
          points = [1.0, 0.979, 0.916, 0.8, 0.6, 0];
        }
      } else {
        a_val = a !== undefined ? parseFloat(a) : 0;
        b_val = b !== undefined ? parseFloat(b) : 1;
        n_val = n !== undefined ? parseInt(n) : 4;
        h_val = (b_val - a_val) / n_val;
        functionLabel = func?.label ? func.label.split('=')[1].trim() : "1/(1+x)";
        questionText = `Evaluate: I = ∫ [${a_val} to ${b_val}] ( ${functionLabel} ) dx using Simpson's 1/3 Rule.`;
        const expr = func?.expr || ((x) => 1 / (1 + x));
        for (let i = 0; i <= n_val; i++) {
          const xi = a_val + i * h_val;
          xPts.push(xi);
          points.push(expr(xi));
        }
      }

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Evaluate: I = ∫ [${a_val} to ${b_val}] ( ${functionLabel} ) dx\nMethod:   Simpson's 1/3 Rule\nBounds:   a = ${a_val}, b = ${b_val}, n = ${n_val} intervals`,
        explanation: 'We identify the integration limit boundaries and interval width to approximate the area using parabolic segments.'
      });

      sequence.push({
        type: 'math',
        title: 'STEP 1: COMPUTE STEP SIZE (h)',
        content: `h = (b - a) / n\nh = (${b_val} - ${a_val}) / ${n_val}\nh = ${h_val.toFixed(4)}`,
        explanation: 'We divide the total interval length by the number of sub-intervals to get the strip step-size h.'
      });

      // Construct Data Table text
      let tableXStr = 'x_i | ';
      let tableYStr = 'y_i | ';
      xPts.forEach((x, i) => {
        tableXStr += `${x.toFixed(2).padEnd(8)}`;
        tableYStr += `${points[i].toFixed(4).padEnd(8)}`;
      });
      const nodesStr = `Given y = f(x) = ${functionLabel}\n\n${tableXStr}\n${tableYStr}`;

      sequence.push({
        type: 'math',
        title: 'STEP 2: CONSTRUCT DATA TABLE',
        content: nodesStr,
        explanation: 'Evaluate f(x) at each coordinate point from x₀ to xₙ to construct our data pairs.'
      });

      // Calculation of sums
      let sum1 = points[0] + points[points.length - 1]; // endpoints
      let sumOdd = 0;
      let sumEven = 0;
      
      // If dataset is s13_q2 (the specific odd-n photo question)
      if (dataset?.id === 's13_q2') {
        sumOdd = points[1] + points[3];
        sumEven = points[2] + points[4];
      } else {
        for (let i = 1; i < points.length - 1; i++) {
          if (i % 2 === 1) {
            sumOdd += points[i];
          } else {
            sumEven += points[i];
          }
        }
      }
      
      const finalI = (h_val / 3) * (sum1 + 4 * sumOdd + 2 * sumEven);

      let formulaStr = `I = ∫ y dx = (h/3) × [ y₀ + 4·(y₁ + y₃ + ...) + 2·(y₂ + y₄ + ...) + yₙ ]\n\n`;
      formulaStr += `I ≈ (${h_val.toFixed(4)}/3) × [ ${points[0].toFixed(4)}`;
      
      if (dataset?.id === 's13_q2') {
        formulaStr += ` + 4·(${points[1].toFixed(4)} + ${points[3].toFixed(4)}) + 2·(${points[2].toFixed(4)} + ${points[4].toFixed(4)}) + ${points[5].toFixed(4)} ]`;
      } else {
        if (n_val > 1) {
          let oddTerms = [];
          let evenTerms = [];
          for (let i = 1; i < points.length - 1; i++) {
            if (i % 2 === 1) oddTerms.push(points[i].toFixed(4));
            else evenTerms.push(points[i].toFixed(4));
          }
          if (oddTerms.length > 0) formulaStr += ` + 4·(${oddTerms.join(' + ')})`;
          if (evenTerms.length > 0) formulaStr += ` + 2·(${evenTerms.join(' + ')})`;
        }
        formulaStr += ` + ${points[points.length - 1].toFixed(4)} ]`;
      }

      sequence.push({
        type: 'math',
        title: 'STEP 3: VALUES SUBSTITUTION',
        content: formulaStr,
        explanation: 'Substitute boundary and interior nodes into Simpson\'s 1/3 Rule formula. Endpoints have coefficient 1, odd nodes coefficient 4, and even nodes coefficient 2.'
      });

      let calcStr = `I ≈ ${(h_val/3).toFixed(5)} × [ ${sum1.toFixed(4)} + 4·(${sumOdd.toFixed(4)}) + 2·(${sumEven.toFixed(4)}) ]\n`;
      calcStr += `I ≈ ${(h_val/3).toFixed(5)} × [ ${sum1.toFixed(4)} + ${(4*sumOdd).toFixed(4)} + ${(2*sumEven).toFixed(4)} ]\n`;
      calcStr += `I ≈ ${(h_val/3).toFixed(5)} × ${(sum1 + 4*sumOdd + 2*sumEven).toFixed(4)}\n`;
      calcStr += `I ≈ ${finalI.toFixed(6)}`;

      sequence.push({
        type: 'math',
        title: 'STEP 4: SOLVE ARITHMETIC',
        content: calcStr,
        explanation: 'Evaluate the coefficients, sum the groups, and scale by h/3.'
      });

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `I ≈ ${finalI.toFixed(6)}\n\nCorrect to 4 decimal places:\nI ≈ ${finalI.toFixed(4)}`,
        explanation: `The approximate area under the curve is ${finalI.toFixed(4)} using Simpson's 1/3 Rule.`
      });
    }

    else if (method === 'Simpson’s 3/8 Rule' || method === "Simpson's 3/8 Rule") {
      let isPredefined = dataset && dataset.id !== 'custom';
      let functionLabel = "";
      let a_val = 0;
      let b_val = 0;
      let n_val = 6;
      let h_val = 0;
      let points = [];
      let xPts = [];
      let questionText = "";
      
      if (isPredefined) {
        questionText = dataset.question;
        if (dataset.id === 's38_q1') {
          // cos(x), [0, 1], h = 0.2, n = 5
          a_val = 0;
          b_val = 1;
          n_val = 5;
          h_val = 0.2;
          functionLabel = "cos(x)";
          xPts = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
          points = [1.0, 0.98, 0.9210, 0.8253, 0.6967, 0.5403];
        } else {
          // s38_q2: sqrt(cos(theta)), [0, pi/2], n = 6
          a_val = 0;
          b_val = Math.PI / 2;
          n_val = 6;
          h_val = Math.PI / 12;
          functionLabel = "√(cos θ)";
          xPts = [0, Math.PI/12, Math.PI/6, Math.PI/4, Math.PI/3, 5*Math.PI/12, Math.PI/2];
          points = [1.0, 0.9828, 0.9306, 0.8409, 0.7071, 0.5087, 0];
        }
      } else {
        a_val = a !== undefined ? parseFloat(a) : 0;
        b_val = b !== undefined ? parseFloat(b) : 1;
        n_val = n !== undefined ? parseInt(n) : 6;
        h_val = (b_val - a_val) / n_val;
        functionLabel = func?.label ? func.label.split('=')[1].trim() : "1/(1+x)";
        questionText = `Evaluate: I = ∫ [${a_val} to ${b_val}] ( ${functionLabel} ) dx using Simpson's 3/8 Rule.`;
        const expr = func?.expr || ((x) => 1 / (1 + x));
        for (let i = 0; i <= n_val; i++) {
          const xi = a_val + i * h_val;
          xPts.push(xi);
          points.push(expr(xi));
        }
      }

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Evaluate: I = ∫ [${a_val} to ${b_val}] ( ${functionLabel} ) dx\nMethod:   Simpson's 3/8 Rule\nBounds:   a = ${a_val}, b = ${b_val}, n = ${n_val} intervals`,
        explanation: 'We identify the integration bounds and prepare to evaluate using Simpson\'s 3/8 Rule (cubic polynomial approximation).'
      });

      sequence.push({
        type: 'math',
        title: 'STEP 1: COMPUTE STEP SIZE (h)',
        content: `h = (b - a) / n\nh = (${b_val} - ${a_val}) / ${n_val}\nh = ${h_val.toFixed(4)}`,
        explanation: 'Compute step size h by dividing the interval bounds difference by the number of sub-intervals.'
      });

      // Construct Data Table text
      let tableXStr = 'x_i | ';
      let tableYStr = 'y_i | ';
      xPts.forEach((x, i) => {
        tableXStr += `${x.toFixed(2).padEnd(8)}`;
        tableYStr += `${points[i].toFixed(4).padEnd(8)}`;
      });
      const nodesStr = `Given y = f(x) = ${functionLabel}\n\n${tableXStr}\n${tableYStr}`;

      sequence.push({
        type: 'math',
        title: 'STEP 2: CONSTRUCT DATA TABLE',
        content: nodesStr,
        explanation: 'We evaluate y = f(x) at each division node x_i to get our data points.'
      });

      // Sums for Simpson's 3/8 Rule
      let sumEndpoints = points[0] + points[points.length - 1];
      let sumMult3 = 0;
      let sumOther = 0;

      if (dataset?.id === 's38_q1') {
        // specific n=5 formula from photo: y0 + 3(y1 + y2 + y4) + 2(y3) + y5
        sumOther = points[1] + points[2] + points[4];
        sumMult3 = points[3];
      } else {
        for (let i = 1; i < points.length - 1; i++) {
          if (i % 3 === 0) {
            sumMult3 += points[i];
          } else {
            sumOther += points[i];
          }
        }
      }

      const finalI = (3 * h_val / 8) * (sumEndpoints + 3 * sumOther + 2 * sumMult3);

      let formulaStr = `I = ∫ y dx = (3h/8) × [ y₀ + 3·(y₁ + y₂ + y₄ + ...) + 2·(y₃ + y₆ + ...) + yₙ ]\n\n`;
      formulaStr += `I ≈ (3·${h_val.toFixed(4)}/8) × [ ${points[0].toFixed(4)}`;

      if (dataset?.id === 's38_q1') {
        formulaStr += ` + 3·(${points[1].toFixed(4)} + ${points[2].toFixed(4)} + ${points[4].toFixed(4)}) + 2·(${points[3].toFixed(4)}) + ${points[5].toFixed(4)} ]`;
      } else {
        if (n_val > 1) {
          let otherTerms = [];
          let mult3Terms = [];
          for (let i = 1; i < points.length - 1; i++) {
            if (i % 3 === 0) mult3Terms.push(points[i].toFixed(4));
            else otherTerms.push(points[i].toFixed(4));
          }
          if (otherTerms.length > 0) formulaStr += ` + 3·(${otherTerms.join(' + ')})`;
          if (mult3Terms.length > 0) formulaStr += ` + 2·(${mult3Terms.join(' + ')})`;
        }
        formulaStr += ` + ${points[points.length - 1].toFixed(4)} ]`;
      }

      sequence.push({
        type: 'math',
        title: 'STEP 3: VALUES SUBSTITUTION',
        content: formulaStr,
        explanation: 'We plug the tabular values into Simpson\'s 3/8 Rule formula. Points at indices which are multiples of 3 are multiplied by 2, other interior points by 3.'
      });

      let calcStr = `I ≈ ${(3*h_val/8).toFixed(5)} × [ ${sumEndpoints.toFixed(4)} + 3·(${sumOther.toFixed(4)}) + 2·(${sumMult3.toFixed(4)}) ]\n`;
      calcStr += `I ≈ ${(3*h_val/8).toFixed(5)} × [ ${sumEndpoints.toFixed(4)} + ${(3*sumOther).toFixed(4)} + ${(2*sumMult3).toFixed(4)} ]\n`;
      calcStr += `I ≈ ${(3*h_val/8).toFixed(5)} × ${(sumEndpoints + 3*sumOther + 2*sumMult3).toFixed(4)}\n`;
      calcStr += `I ≈ ${finalI.toFixed(6)}`;

      sequence.push({
        type: 'math',
        title: 'STEP 4: SOLVE ARITHMETIC',
        content: calcStr,
        explanation: 'Solve intermediate sums and scale by 3h/8.'
      });

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `I ≈ ${finalI.toFixed(6)}\n\nCorrect to 4 decimal places:\nI ≈ ${finalI.toFixed(4)}`,
        explanation: `The approximate area under the curve is ${finalI.toFixed(4)} using Simpson's 3/8 Rule.`
      });
    }

    else if (method === 'RK4') {
      const RK_FUNCTIONS = {
        'y_minus_x': { label: "dy/dx = y - x", expr: (x, y) => y - x },
        'x_plus_y':  { label: "dy/dx = x + y", expr: (x, y) => x + y },
        'minus_2xy': { label: "dy/dx = -2xy",  expr: (x, y) => -2 * x * y },
        'y_plus_x2': { label: "dy/dx = y + x²", expr: (x, y) => y + x * x }
      };

      let isPredefined = dataset && dataset.id !== 'custom';
      let odeLabel = "";
      let expr = null;
      let x0_val = 0;
      let y0_val = 0;
      let h_val = 0.1;
      let steps_count = 1;

      if (isPredefined) {
        if (dataset.id === 'rk_q1') {
          odeLabel = "dy/dx = y - x";
          expr = (x, y) => y - x;
          x0_val = 0;
          y0_val = 2;
          h_val = 0.1;
          steps_count = 1;
        } else {
          // rk_q2
          odeLabel = "dy/dx = x + y";
          expr = (x, y) => x + y;
          x0_val = 0;
          y0_val = 1;
          h_val = 0.1;
          steps_count = 2;
        }
      } else {
        const funcKey = rkFuncId || 'y_minus_x';
        const fnObj = RK_FUNCTIONS[funcKey] || RK_FUNCTIONS['y_minus_x'];
        odeLabel = fnObj.label;
        expr = fnObj.expr;
        x0_val = rkX0 !== undefined ? parseFloat(rkX0) : 0;
        y0_val = rkY0 !== undefined ? parseFloat(rkY0) : 2;
        h_val = rkH !== undefined ? parseFloat(rkH) : 0.1;
        steps_count = rkSteps !== undefined ? parseInt(rkSteps) : 1;
      }

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Given Differential Equation:\n${odeLabel}\n\nInitial Conditions:\nx₀ = ${x0_val}, y₀ = ${y0_val}\nStep size h = ${h_val}\nTarget: Find y at x = ${(x0_val + steps_count * h_val).toFixed(2)} (${steps_count} step(s))`,
        explanation: 'We initialize the 4th-order Runge-Kutta parameters. RK4 evaluates four slopes per step to construct a highly accurate prediction.'
      });

      let currentX = x0_val;
      let currentY = y0_val;

      for (let s = 1; s <= steps_count; s++) {
        const x_start = currentX;
        const y_start = currentY;

        // compute k1, k2, k3, k4
        const k1 = h_val * expr(x_start, y_start);
        const k2 = h_val * expr(x_start + h_val / 2, y_start + k1 / 2);
        const k3 = h_val * expr(x_start + h_val / 2, y_start + k2 / 2);
        const k4 = h_val * expr(x_start + h_val, y_start + k3);

        const y_next = y_start + (k1 + 2 * k2 + 2 * k3 + k4) / 6;
        const x_next = x_start + h_val;

        // ── helpers to build detailed substitution strings ──────────────────
        const x2 = x_start + h_val / 2;
        const x4 = x_start + h_val;
        const yk2arg = y_start + k1 / 2;
        const yk3arg = y_start + k2 / 2;
        const yk4arg = y_start + k3;

        // f-value strings (the inner substitution, ODE-specific)
        let fv1, fv2, fv3, fv4;
        let subLine1, subLine2, subLine3, subLine4; // intermediate "= a op b" line
        if (odeLabel.includes("y - x")) {
          fv1 = `${y_start.toFixed(4)} - ${x_start.toFixed(4)}`;
          fv2 = `${yk2arg.toFixed(4)} - ${x2.toFixed(4)}`;
          fv3 = `${yk3arg.toFixed(4)} - ${x2.toFixed(4)}`;
          fv4 = `${yk4arg.toFixed(4)} - ${x4.toFixed(4)}`;
          subLine1 = `= ${h_val} × (${y_start.toFixed(4)} - ${x_start.toFixed(4)})`;
          subLine2 = `= ${h_val} × f(${x2.toFixed(4)}, ${yk2arg.toFixed(4)})\n           = ${h_val} × (${yk2arg.toFixed(4)} - ${x2.toFixed(4)})`;
          subLine3 = `= ${h_val} × f(${x2.toFixed(4)}, ${yk3arg.toFixed(4)})\n           = ${h_val} × (${yk3arg.toFixed(4)} - ${x2.toFixed(4)})`;
          subLine4 = `= ${h_val} × f(${x4.toFixed(4)}, ${yk4arg.toFixed(4)})\n           = ${h_val} × (${yk4arg.toFixed(4)} - ${x4.toFixed(4)})`;
        } else if (odeLabel.includes("x + y")) {
          fv1 = `${x_start.toFixed(4)} + ${y_start.toFixed(4)}`;
          fv2 = `${x2.toFixed(4)} + ${yk2arg.toFixed(4)}`;
          fv3 = `${x2.toFixed(4)} + ${yk3arg.toFixed(4)}`;
          fv4 = `${x4.toFixed(4)} + ${yk4arg.toFixed(4)}`;
          subLine1 = `= ${h_val} × (${x_start.toFixed(4)} + ${y_start.toFixed(4)})`;
          subLine2 = `= ${h_val} × f(${x2.toFixed(4)}, ${yk2arg.toFixed(4)})\n           = ${h_val} × (${x2.toFixed(4)} + ${yk2arg.toFixed(4)})`;
          subLine3 = `= ${h_val} × f(${x2.toFixed(4)}, ${yk3arg.toFixed(4)})\n           = ${h_val} × (${x2.toFixed(4)} + ${yk3arg.toFixed(4)})`;
          subLine4 = `= ${h_val} × f(${x4.toFixed(4)}, ${yk4arg.toFixed(4)})\n           = ${h_val} × (${x4.toFixed(4)} + ${yk4arg.toFixed(4)})`;
        } else if (odeLabel.includes("-2xy")) {
          fv1 = `-2 × ${x_start.toFixed(4)} × ${y_start.toFixed(4)}`;
          fv2 = `-2 × ${x2.toFixed(4)} × ${yk2arg.toFixed(4)}`;
          fv3 = `-2 × ${x2.toFixed(4)} × ${yk3arg.toFixed(4)}`;
          fv4 = `-2 × ${x4.toFixed(4)} × ${yk4arg.toFixed(4)}`;
          subLine1 = `= ${h_val} × (-2 × ${x_start.toFixed(4)} × ${y_start.toFixed(4)})`;
          subLine2 = `= ${h_val} × f(${x2.toFixed(4)}, ${yk2arg.toFixed(4)})\n           = ${h_val} × (-2 × ${x2.toFixed(4)} × ${yk2arg.toFixed(4)})`;
          subLine3 = `= ${h_val} × f(${x2.toFixed(4)}, ${yk3arg.toFixed(4)})\n           = ${h_val} × (-2 × ${x2.toFixed(4)} × ${yk3arg.toFixed(4)})`;
          subLine4 = `= ${h_val} × f(${x4.toFixed(4)}, ${yk4arg.toFixed(4)})\n           = ${h_val} × (-2 × ${x4.toFixed(4)} × ${yk4arg.toFixed(4)})`;
        } else {
          fv1 = `${y_start.toFixed(4)} + ${(x_start**2).toFixed(4)}`;
          fv2 = `${yk2arg.toFixed(4)} + ${(x2**2).toFixed(4)}`;
          fv3 = `${yk3arg.toFixed(4)} + ${(x2**2).toFixed(4)}`;
          fv4 = `${yk4arg.toFixed(4)} + ${(x4**2).toFixed(4)}`;
          subLine1 = `= ${h_val} × (${y_start.toFixed(4)} + ${(x_start**2).toFixed(4)})`;
          subLine2 = `= ${h_val} × f(${x2.toFixed(4)}, ${yk2arg.toFixed(4)})\n           = ${h_val} × (${yk2arg.toFixed(4)} + ${(x2**2).toFixed(4)})`;
          subLine3 = `= ${h_val} × f(${x2.toFixed(4)}, ${yk3arg.toFixed(4)})\n           = ${h_val} × (${yk3arg.toFixed(4)} + ${(x2**2).toFixed(4)})`;
          subLine4 = `= ${h_val} × f(${x4.toFixed(4)}, ${yk4arg.toFixed(4)})\n           = ${h_val} × (${yk4arg.toFixed(4)} + ${(x4**2).toFixed(4)})`;
        }

        // ── Stage header card ────────────────────────────────────────────────
        sequence.push({
          type: 'math',
          title: `STAGE ${s} — INITIAL VALUES`,
          content: `Step ${s}: Compute y at x = ${x_next.toFixed(4)}\n\n` +
                   `  x₀ = ${x_start.toFixed(4)}\n` +
                   `  y₀ = ${y_start.toFixed(4)}\n` +
                   `  h  = ${h_val}\n\n` +
                   `  f(x, y) = ${odeLabel.split('=')[1]?.trim() || odeLabel}`,
          explanation: `Stage ${s}: We begin with x₀ = ${x_start.toFixed(4)} and y₀ = ${y_start.toFixed(4)}. We will evaluate four slope estimates k₁, k₂, k₃, k₄.`
        });

        // ── k₁ card ──────────────────────────────────────────────────────────
        sequence.push({
          type: 'math',
          title: `STAGE ${s} — k₁ COMPUTATION`,
          content: `k₁ = h · f(x₀, y₀)\n` +
                   `   = ${h_val} × f(${x_start.toFixed(4)}, ${y_start.toFixed(4)})\n` +
                   `   ${subLine1}\n` +
                   `   = ${h_val} × ${(k1 / h_val).toFixed(4)}\n\n` +
                   `   ┌─────────────────────┐\n` +
                   `   │  k₁ = ${k1.toFixed(5)}       │\n` +
                   `   └─────────────────────┘`,
          explanation: `k₁ is the slope at the start of the interval. Here k₁ = ${k1.toFixed(5)}.`
        });

        // ── k₂ card ──────────────────────────────────────────────────────────
        sequence.push({
          type: 'math',
          title: `STAGE ${s} — k₂ COMPUTATION`,
          content: `k₂ = h · f(x₀ + h/2, y₀ + k₁/2)\n` +
                   `   = ${h_val} × f(${x_start.toFixed(4)} + ${(h_val/2).toFixed(4)}, ${y_start.toFixed(4)} + ${(k1/2).toFixed(4)})\n` +
                   `   ${subLine2}\n` +
                   `   = ${h_val} × ${(k2 / h_val).toFixed(4)}\n\n` +
                   `   ┌─────────────────────┐\n` +
                   `   │  k₂ = ${k2.toFixed(5)}       │\n` +
                   `   └─────────────────────┘`,
          explanation: `k₂ uses the midpoint x₀+h/2 = ${x2.toFixed(4)} with the k₁-corrected y value. k₂ = ${k2.toFixed(5)}.`
        });

        // ── k₃ card ──────────────────────────────────────────────────────────
        sequence.push({
          type: 'math',
          title: `STAGE ${s} — k₃ COMPUTATION`,
          content: `k₃ = h · f(x₀ + h/2, y₀ + k₂/2)\n` +
                   `   = ${h_val} × f(${x_start.toFixed(4)} + ${(h_val/2).toFixed(4)}, ${y_start.toFixed(4)} + ${(k2/2).toFixed(4)})\n` +
                   `   ${subLine3}\n` +
                   `   = ${h_val} × ${(k3 / h_val).toFixed(4)}\n\n` +
                   `   ┌─────────────────────┐\n` +
                   `   │  k₃ = ${k3.toFixed(5)}       │\n` +
                   `   └─────────────────────┘`,
          explanation: `k₃ again uses the midpoint but with the k₂-corrected y. k₃ = ${k3.toFixed(5)}.`
        });

        // ── k₄ card ──────────────────────────────────────────────────────────
        sequence.push({
          type: 'math',
          title: `STAGE ${s} — k₄ COMPUTATION`,
          content: `k₄ = h · f(x₀ + h, y₀ + k₃)\n` +
                   `   = ${h_val} × f(${x_start.toFixed(4)} + ${h_val}, ${y_start.toFixed(4)} + ${k3.toFixed(4)})\n` +
                   `   ${subLine4}\n` +
                   `   = ${h_val} × ${(k4 / h_val).toFixed(4)}\n\n` +
                   `   ┌─────────────────────┐\n` +
                   `   │  k₄ = ${k4.toFixed(5)}       │\n` +
                   `   └─────────────────────┘`,
          explanation: `k₄ is the slope at the end of the interval with a k₃-corrected y. k₄ = ${k4.toFixed(5)}.`
        });

        // ── y_next card ──────────────────────────────────────────────────────
        const weighted = k1 + 2*k2 + 2*k3 + k4;
        sequence.push({
          type: 'math',
          title: `STAGE ${s} — COMPUTE y${s}`,
          content: `y${s} = y₀ + (1/6)(k₁ + 2k₂ + 2k₃ + k₄)\n\n` +
                   `     k₁         = ${k1.toFixed(5)}\n` +
                   `     2 × k₂     = 2 × ${k2.toFixed(5)} = ${(2*k2).toFixed(5)}\n` +
                   `     2 × k₃     = 2 × ${k3.toFixed(5)} = ${(2*k3).toFixed(5)}\n` +
                   `     k₄         = ${k4.toFixed(5)}\n` +
                   `     ──────────────────────────────────\n` +
                   `     Sum         = ${weighted.toFixed(5)}\n\n` +
                   `y${s} = ${y_start.toFixed(5)} + (1/6) × ${weighted.toFixed(5)}\n` +
                   `     = ${y_start.toFixed(5)} + ${(weighted/6).toFixed(5)}\n\n` +
                   `   ╔═══════════════════════════╗\n` +
                   `   ║  y(${x_next.toFixed(2)}) ≈ ${y_next.toFixed(5)}     ║\n` +
                   `   ╚═══════════════════════════╝`,
          explanation: `Weighted combination: y${s} = ${y_start.toFixed(5)} + (1/6)(${k1.toFixed(5)} + 2×${k2.toFixed(5)} + 2×${k3.toFixed(5)} + ${k4.toFixed(5)}) = ${y_next.toFixed(5)}.`
        });

        currentX = x_next;
        currentY = y_next;
      }

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `At x = ${currentX.toFixed(2)}, the approximate value of y is:\ny ≈ ${currentY.toFixed(5)}\n\n(RK4 Method, h = ${h_val})`,
        explanation: `The fourth-order Runge-Kutta approximation at target x = ${currentX.toFixed(2)} yields y ≈ ${currentY.toFixed(5)}.`
      });
    }

    else if (method === 'Newton’s Interpolation') {
      const ds = dataset || {
        x: [1891, 1901, 1911, 1921, 1931],
        y: [46, 66, 81, 93, 101],
        question: 'Estimate value'
      };
      
      const xVals = ds.x;
      const yVals = ds.y;
      const count = xVals.length;
      const tX = targetX !== undefined ? targetX : 1895;
      const isForward = direction === 'Forward';

      // Compute difference table
      const diffs = [];
      diffs[0] = [...yVals];
      for (let col = 1; col < count; col++) {
        diffs[col] = [];
        for (let row = 0; row < count - col; row++) {
          diffs[col][row] = diffs[col - 1][row + 1] - diffs[col - 1][row];
        }
      }

      const h_val = xVals[1] - xVals[0];

      // Forward parameters
      const x0 = xVals[0];
      const y0 = yVals[0];
      const p_forward = (tX - x0) / h_val;

      // Backward parameters
      const xn = xVals[count - 1];
      const yn = yVals[count - 1];
      const p_backward = (tX - xn) / h_val;

      const p_val = isForward ? p_forward : p_backward;
      const operatorSymbol = isForward ? 'Δ' : '∇';

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `${ds.question}\n\nEstimate for x = ${tX} (using Newton's ${direction} formula)`,
        xVals,
        yVals,
        xLabel: ds.xLabel,
        yLabel: ds.yLabel,
        isNewton: true,
        explanation: `We identify the target estimate x = ${tX} and prepare for Newton's ${direction} difference interpolation.`
      });

      // HTML difference table step
      sequence.push({
        type: 'diffTable',
        title: 'STEP 1: WE FORM DIFFERENCE TABLE',
        xVals,
        yVals,
        diffs,
        operatorSymbol,
        explanation: `We build the difference table. For ${isForward ? 'Forward' : 'Backward'} interpolation, we will focus on values from the ${isForward ? 'top' : 'bottom'} diagonal.`
      });

      // Compute parameters step
      const paramText = isForward 
        ? `x₀ = ${x0}\ny₀ = ${y0}\nx  = ${tX}\nh  = ${h_val}\n\np = (x - x₀) / h\np = (${tX} - ${x0}) / ${h_val}\np = ${p_val.toFixed(2)}`
        : `xₙ = ${xn}\nyₙ = ${yn}\nx  = ${tX}\nh  = ${h_val}\n\np = (x - xₙ) / h\np = (${tX} - ${xn}) / ${h_val}\np = ${p_val.toFixed(2)}`;

      sequence.push({
        type: 'math',
        title: 'STEP 2: DEFINE PARAMETERS & CALCULATE p',
        content: paramText,
        explanation: `We extract the base values: ${isForward ? 'x₀, y₀' : 'xₙ, yₙ'} from the ${isForward ? 'beginning' : 'end'} of the dataset, and calculate parameter p.`
      });

      // Formula & substitution
      let formulaText = '';
      if (isForward) {
        formulaText += `yₙ(x) = y₀ + p·Δy₀ + [p(p-1)/2!]·Δ²y₀ + [p(p-1)(p-2)/3!]·Δ³y₀ + [p(p-1)(p-2)(p-3)/4!]·Δ⁴y₀\n\n`;
        formulaText += `Substituting values:\n`;
        formulaText += `y(${tX}) ≈ ${y0} + ${p_val.toFixed(2)}×(${diffs[1][0]}) + [${p_val.toFixed(2)}(${p_val.toFixed(2)}-1)/2]×(${diffs[2][0]}) + [${p_val.toFixed(2)}(${p_val.toFixed(2)}-1)(${p_val.toFixed(2)}-2)/6]×(${diffs[3][0]}) + [${p_val.toFixed(2)}(${p_val.toFixed(2)}-1)(${p_val.toFixed(2)}-2)(${p_val.toFixed(2)}-3)/24]×(${diffs[4][0] || 0})`;
      } else {
        const b_y = yVals[count - 1];
        const b_d1 = diffs[1][count - 2];
        const b_d2 = diffs[2][count - 3];
        const b_d3 = diffs[3][count - 4];
        const b_d4 = count > 4 ? diffs[4][count - 5] : 0;

        formulaText += `yₙ(x) = yₙ + p·∇yₙ + [p(p+1)/2!]·∇²yₙ + [p(p+1)(p+2)/3!]·∇³yₙ + [p(p+1)(p+2)(p+3)/4!]·∇⁴yₙ\n\n`;
        formulaText += `Substituting values:\n`;
        formulaText += `y(${tX}) ≈ ${b_y} + (${p_val.toFixed(2)})×(${b_d1}) + [(${p_val.toFixed(2)})(${p_val.toFixed(2)}+1)/2]×(${b_d2}) + [(${p_val.toFixed(2)})(${p_val.toFixed(2)}+1)(${p_val.toFixed(2)}+2)/6]×(${b_d3}) + [(${p_val.toFixed(2)})(${p_val.toFixed(2)}+1)(${p_val.toFixed(2)}+2)(${p_val.toFixed(2)}+3)/24]×(${b_d4})`;
      }

      sequence.push({
        type: 'math',
        title: `STEP 3: NEWTON’S ${direction.toUpperCase()} DIFFERENCE FORMULA`,
        content: formulaText,
        explanation: `Substitute the values of p and the respective ${isForward ? 'forward (top diagonal)' : 'backward (bottom diagonal)'} difference variables into the formula.`
      });

      // Terms calculation
      let finalVal = 0;
      let solveText = '';
      if (isForward) {
        const term0 = y0;
        const term1 = p_val * diffs[1][0];
        const term2 = (p_val * (p_val - 1) * diffs[2][0]) / 2;
        const term3 = (p_val * (p_val - 1) * (p_val - 2) * (diffs[3]?.[0] || 0)) / 6;
        const term4 = (p_val * (p_val - 1) * (p_val - 2) * (p_val - 3) * (diffs[4]?.[0] || 0)) / 24;
        finalVal = term0 + term1 + term2 + term3 + term4;

        solveText += `y(${tX}) ≈ ${term0} + ${term1.toFixed(4)} + [${(p_val * (p_val - 1)).toFixed(4)}/2]×(${diffs[2][0]}) + [${(p_val * (p_val - 1) * (p_val - 2)).toFixed(4)}/6]×(${diffs[3]?.[0] || 0}) + [${(p_val * (p_val - 1) * (p_val - 2) * (p_val - 3)).toFixed(4)}/24]×(${diffs[4]?.[0] || 0})\n\n`;
        solveText += `Evaluating terms:\n`;
        solveText += `y(${tX}) ≈ ${term0} + ${term1.toFixed(1)} + ${term2.toFixed(1)} + ${term3.toFixed(3)} + ${term4.toFixed(4)}\n`;
        solveText += `y(${tX}) ≈ ${finalVal.toFixed(4)}`;
      } else {
        const b_y = yVals[count - 1];
        const b_d1 = diffs[1][count - 2];
        const b_d2 = diffs[2][count - 3];
        const b_d3 = diffs[3][count - 4];
        const b_d4 = count > 4 ? diffs[4][count - 5] : 0;

        const term0 = b_y;
        const term1 = p_val * b_d1;
        const term2 = (p_val * (p_val + 1) * b_d2) / 2;
        const term3 = (p_val * (p_val + 1) * (p_val + 2) * b_d3) / 6;
        const term4 = (p_val * (p_val + 1) * (p_val + 2) * (p_val + 3) * b_d4) / 24;
        finalVal = term0 + term1 + term2 + term3 + term4;

        solveText += `y(${tX}) ≈ ${term0} + (${term1.toFixed(4)}) + [${(p_val * (p_val + 1)).toFixed(4)}/2]×(${b_d2}) + [${(p_val * (p_val + 1) * (p_val + 2)).toFixed(4)}/6]×(${b_d3}) + [${(p_val * (p_val + 1) * (p_val + 2) * (p_val + 3)).toFixed(4)}/24]×(${b_d4})\n\n`;
        solveText += `Evaluating terms:\n`;
        solveText += `y(${tX}) ≈ ${term0} + (${term1.toFixed(1)}) + ${term2.toFixed(2)} + ${term3.toFixed(3)} + ${term4.toFixed(4)}\n`;
        solveText += `y(${tX}) ≈ ${finalVal.toFixed(4)}`;
      }

      sequence.push({
        type: 'math',
        title: 'STEP 4: SOLVE ARITHMETIC',
        content: solveText,
        explanation: 'Evaluate each term step by step, keeping track of signs, and sum them to obtain the interpolated value.'
      });

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `y(${tX}) ≈ ${finalVal.toFixed(4)}`,
        explanation: `Using Newton’s ${direction} interpolation, the estimated value at x = ${tX} is ${finalVal.toFixed(4)}.`
      });
    }

    else if (method === 'Newton’s Difference') {
      const ds = dataset || {
        x: [0, 1, 2, 3, 4, 5, 6],
        y: [6.9897, 7.4036, 7.7815, 8.1291, 8.4510, 8.7506, 9.0309],
        question: 'Obtain derivatives'
      };

      const xVals = ds.x;
      const yVals = ds.y;
      const count = xVals.length;
      const tX = targetX !== undefined ? targetX : 1.2;
      const isForward = direction === 'Forward';

      // Compute difference table
      const diffs = [];
      diffs[0] = [...yVals];
      for (let col = 1; col < count; col++) {
        diffs[col] = [];
        for (let row = 0; row < count - col; row++) {
          diffs[col][row] = diffs[col - 1][row + 1] - diffs[col - 1][row];
        }
      }

      const h_val = xVals[1] - xVals[0];
      const operatorSymbol = isForward ? 'Δ' : '∇';

      // Find row index matching target x
      let idx0 = xVals.findIndex(v => Math.abs(v - tX) < 1e-5);
      if (idx0 === -1) idx0 = isForward ? 0 : count - 1;

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `${ds.question}\n\nTarget x = ${tX} (using Newton's ${direction} difference differentiation)`,
        xVals,
        yVals,
        xLabel: ds.xLabel,
        yLabel: ds.yLabel,
        isNewton: true,
        explanation: `We identify the evaluation target x = ${tX} and prepare for Numerical Differentiation.`
      });

      sequence.push({
        type: 'diffTable',
        title: 'STEP 1: WE FORM DIFFERENCE TABLE',
        xVals,
        yVals,
        diffs,
        operatorSymbol,
        explanation: `We construct the difference table. Differentiation will employ diagonal difference values originating at the matching node.`
      });

      // Define parameters step
      const paramText = `Target Node (x₀): ${tX} (index ${idx0})\nStep size (h): ${h_val}\n\nDifferences to use:\n` + (isForward 
        ? `Δy = ${diffs[1][idx0]?.toFixed(4) || 0}\nΔ²y = ${diffs[2][idx0]?.toFixed(4) || 0}\nΔ³y = ${diffs[3][idx0]?.toFixed(4) || 0}\nΔ⁴y = ${diffs[4][idx0]?.toFixed(4) || 0}\nΔ⁵y = ${diffs[5][idx0]?.toFixed(4) || 0}`
        : `∇y = ${diffs[1][idx0 - 1]?.toFixed(4) || 0}\n∇²y = ${diffs[2][idx0 - 2]?.toFixed(4) || 0}\n∇³y = ${diffs[3][idx0 - 3]?.toFixed(4) || 0}\n∇⁴y = ${diffs[4][idx0 - 4]?.toFixed(4) || 0}\n∇⁵y = ${diffs[5][idx0 - 5]?.toFixed(4) || 0}`);

      sequence.push({
        type: 'math',
        title: 'STEP 2: DEFINE PARAMETERS & EXTRACT DIFFERENCES',
        content: paramText,
        explanation: `Identify step size (h) and extract the diagonal forward/backward differences originating at node index ${idx0}.`
      });

      // Formulas step
      let formulasText = '';
      if (isForward) {
        formulasText += `First Derivative:\ndy/dx = (1/h) × [ Δy₀ - (1/2)·Δ²y₀ + (1/3)·Δ³y₀ - (1/4)·Δ⁴y₀ + (1/5)·Δ⁵y₀ ]\n\n`;
        formulasText += `Second Derivative:\nd²y/dx² = (1/h²) × [ Δ²y₀ - Δ³y₀ + (11/12)·Δ⁴y₀ - (5/6)·Δ⁵y₀ ]\n\n`;
        formulasText += `Substituting values:\n`;
        
        const d1 = diffs[1][idx0] || 0;
        const d2 = diffs[2][idx0] || 0;
        const d3 = diffs[3][idx0] || 0;
        const d4 = diffs[4][idx0] || 0;
        const d5 = diffs[5][idx0] || 0;

        formulasText += `dy/dx ≈ (1/${h_val}) × [ ${d1.toFixed(4)} - 0.5·(${d2.toFixed(4)}) + (1/3)·(${d3.toFixed(4)}) - 0.25·(${d4.toFixed(4)}) + 0.2·(${d5.toFixed(4)}) ]\n\n`;
        formulasText += `d²y/dx² ≈ (1/${(h_val * h_val).toFixed(2)}) × [ ${d2.toFixed(4)} - (${d3.toFixed(4)}) + (11/12)·(${d4.toFixed(4)}) - (5/6)·(${d5.toFixed(4)}) ]`;
      } else {
        formulasText += `First Derivative:\ndy/dx = (1/h) × [ ∇yₙ + (1/2)·∇²yₙ + (1/3)·∇³yₙ + (1/4)·∇⁴yₙ + (1/5)·∇⁵yₙ ]\n\n`;
        formulasText += `Second Derivative:\nd²y/dx² = (1/h²) × [ ∇²yₙ + ∇³yₙ + (11/12)·∇⁴yₙ + (5/6)·∇⁵yₙ ]\n\n`;
        formulasText += `Substituting values:\n`;

        const b_d1 = diffs[1][idx0 - 1] || 0;
        const b_d2 = diffs[2][idx0 - 2] || 0;
        const b_d3 = diffs[3][idx0 - 3] || 0;
        const b_d4 = diffs[4][idx0 - 4] || 0;
        const b_d5 = diffs[5][idx0 - 5] || 0;

        formulasText += `dy/dx ≈ (1/${h_val}) × [ ${b_d1.toFixed(4)} + 0.5·(${b_d2.toFixed(4)}) + (1/3)·(${b_d3.toFixed(4)}) + 0.25·(${b_d4.toFixed(4)}) + 0.2·(${b_d5.toFixed(4)}) ]\n\n`;
        formulasText += `d²y/dx² ≈ (1/${(h_val * h_val).toFixed(2)}) × [ ${b_d2.toFixed(4)} + (${b_d3.toFixed(4)}) + (11/12)·(${b_d4.toFixed(4)}) + (5/6)·(${b_d5.toFixed(4)}) ]`;
      }

      sequence.push({
        type: 'math',
        title: `STEP 3: NEWTON’S ${direction.toUpperCase()} DIFFERENTIATION FORMULAS`,
        content: formulasText,
        explanation: `Substitute the step size h and the selected diagonal difference parameters into the differentiation expansion formulas.`
      });

      // Arithmetic evaluation
      let solveText = '';
      let dy_val = 0;
      let dy2_val = 0;

      if (isForward) {
        const d1 = diffs[1][idx0] || 0;
        const d2 = diffs[2][idx0] || 0;
        const d3 = diffs[3][idx0] || 0;
        const d4 = diffs[4][idx0] || 0;
        const d5 = diffs[5][idx0] || 0;

        const term1 = d1;
        const term2 = -0.5 * d2;
        const term3 = d3 / 3;
        const term4 = -0.25 * d4;
        const term5 = 0.2 * d5;
        const sum1 = term1 + term2 + term3 + term4 + term5;
        dy_val = (1 / h_val) * sum1;

        const term2_1 = d2;
        const term2_2 = -d3;
        const term2_3 = (11 / 12) * d4;
        const term2_4 = -(5 / 6) * d5;
        const sum2 = term2_1 + term2_2 + term2_3 + term2_4;
        dy2_val = (1 / (h_val * h_val)) * sum2;

        solveText += `Evaluating dy/dx:\n`;
        solveText += `dy/dx ≈ (1/${h_val}) × [ ${term1.toFixed(4)} + (${term2.toFixed(4)}) + ${term3.toFixed(4)} + (${term4.toFixed(4)}) + ${term5.toFixed(4)} ]\n`;
        solveText += `dy/dx ≈ (1/${h_val}) × [ ${sum1.toFixed(6)} ]\n`;
        solveText += `dy/dx ≈ ${dy_val.toFixed(5)}\n\n`;

        solveText += `Evaluating d²y/dx²:\n`;
        solveText += `d²y/dx² ≈ (1/${(h_val*h_val).toFixed(2)}) × [ ${term2_1.toFixed(4)} + (${term2_2.toFixed(4)}) + ${term2_3.toFixed(4)} + (${term2_4.toFixed(4)}) ]\n`;
        solveText += `d²y/dx² ≈ (1/${(h_val*h_val).toFixed(2)}) × [ ${sum2.toFixed(6)} ]\n`;
        solveText += `d²y/dx² ≈ ${dy2_val.toFixed(4)}`;
      } else {
        const b_d1 = diffs[1][idx0 - 1] || 0;
        const b_d2 = diffs[2][idx0 - 2] || 0;
        const b_d3 = diffs[3][idx0 - 3] || 0;
        const b_d4 = diffs[4][idx0 - 4] || 0;
        const b_d5 = diffs[5][idx0 - 5] || 0;

        const term1 = b_d1;
        const term2 = 0.5 * b_d2;
        const term3 = b_d3 / 3;
        const term4 = 0.25 * b_d4;
        const term5 = 0.2 * b_d5;
        const sum1 = term1 + term2 + term3 + term4 + term5;
        dy_val = (1 / h_val) * sum1;

        const term2_1 = b_d2;
        const term2_2 = b_d3;
        const term2_3 = (11 / 12) * b_d4;
        const term2_4 = (5 / 6) * b_d5;
        const sum2 = term2_1 + term2_2 + term2_3 + term2_4;
        dy2_val = (1 / (h_val * h_val)) * sum2;

        solveText += `Evaluating dy/dx:\n`;
        solveText += `dy/dx ≈ (1/${h_val}) × [ ${term1.toFixed(4)} + ${term2.toFixed(4)} + ${term3.toFixed(4)} + ${term4.toFixed(4)} + ${term5.toFixed(4)} ]\n`;
        solveText += `dy/dx ≈ (1/${h_val}) × [ ${sum1.toFixed(6)} ]\n`;
        solveText += `dy/dx ≈ ${dy_val.toFixed(5)}\n\n`;

        solveText += `Evaluating d²y/dx²:\n`;
        solveText += `d²y/dx² ≈ (1/${(h_val*h_val).toFixed(2)}) × [ ${term2_1.toFixed(4)} + ${term2_2.toFixed(4)} + ${term2_3.toFixed(4)} + ${term2_4.toFixed(4)} ]\n`;
        solveText += `d²y/dx² ≈ (1/${(h_val*h_val).toFixed(2)}) × [ ${sum2.toFixed(6)} ]\n`;
        solveText += `d²y/dx² ≈ ${dy2_val.toFixed(4)}`;
      }

      sequence.push({
        type: 'math',
        title: 'STEP 4: SOLVE ARITHMETIC',
        content: solveText,
        explanation: `Perform sequential arithmetic summation of the derivative terms, then multiply by the scale factors 1/h and 1/h².`
      });

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `dy/dx | x = ${tX}  ≈ ${dy_val.toFixed(5)}\n\nd²y/dx² | x = ${tX} ≈ ${dy2_val.toFixed(4)}`,
        explanation: `The numerical derivatives at x = ${tX} are dy/dx ≈ ${dy_val.toFixed(5)} and d²y/dx² ≈ ${dy2_val.toFixed(4)}.`
      });
    }

    else if (method === 'Matrix Multiplication') {
      const q = matMulQuestion;
      if (!q) return sequence;

      const A = q.matA;
      const B = q.matB;
      const isSquare = q.type === 'square';
      const isOrthogonal2x2 = q.type === 'orthogonal_2x2';
      const isOrthogonal3x3 = q.type === 'orthogonal_3x3';

      const label = isOrthogonal2x2 ? 'AAᵀ' : isOrthogonal3x3 ? 'BBᵀ' : isSquare ? 'A²' : 'AB';
      const Blabel = isOrthogonal2x2 ? 'Aᵀ' : isOrthogonal3x3 ? 'Bᵀ' : isSquare ? 'A' : 'B';

      if (isOrthogonal2x2) {
        // Step 0 — Problem Statement
        sequence.push({
          type: 'header',
          title: 'PROBLEM STATEMENT',
          content: `Show that matrix A is orthogonal.\n\n` +
                   `Given:\n` +
                   `A = [  cos θ   -sin θ ]\n` +
                   `    [  sin θ    cos θ ]\n\n` +
                   `Definition: A square matrix is orthogonal if A × Aᵀ = Aᵀ × A = I.\n` +
                   `We swap rows and columns of A to find its transpose Aᵀ:\n` +
                   `Aᵀ = [  cos θ    sin θ ]\n` +
                   `     [ -sin θ    cos θ ]\n\n` +
                   `Let's compute AAᵀ and check if it equals the Identity Matrix I.`,
          explanation: 'An orthogonal matrix multiplied by its transpose yields the Identity Matrix. We check if AAᵀ = I.'
        });
        
        // Step 1: Set up multiplication
        sequence.push({
          type: 'math',
          title: 'STEP 1: SET UP THE MULTIPLICATION',
          content: `AAᵀ = [  cos θ   -sin θ ]   [  cos θ    sin θ ]\n` +
                   `     [  sin θ    cos θ ] × [ -sin θ    cos θ ]\n\n` +
                   `We will compute each element of the resulting 2×2 matrix C.`,
          explanation: 'Write A and Aᵀ side-by-side. The resulting matrix C is computed element by element using dot products.'
        });

        // Step 2: C[1][1]
        sequence.push({
          type: 'math',
          title: 'STEP 2: COMPUTE C[1][1]',
          content: `C[1][1] = (Row 1 of A) · (Col 1 of Aᵀ)\n` +
                   `        = (cos θ)×(cos θ) + (-sin θ)×(-sin θ)\n` +
                   `        = cos² θ + sin² θ\n` +
                   `        = 1`,
          explanation: 'Since cos² θ + sin² θ = 1, C[1][1] = 1.'
        });

        // Step 3: C[1][2]
        sequence.push({
          type: 'math',
          title: 'STEP 3: COMPUTE C[1][2]',
          content: `C[1][2] = (Row 1 of A) · (Col 2 of Aᵀ)\n` +
                   `        = (cos θ)×(sin θ) + (-sin θ)×(cos θ)\n` +
                   `        = cos θ sin θ - sin θ cos θ\n` +
                   `        = 0`,
          explanation: 'The opposite terms cancel out, so C[1][2] = 0.'
        });

        // Step 4: C[2][1]
        sequence.push({
          type: 'math',
          title: 'STEP 4: COMPUTE C[2][1]',
          content: `C[2][1] = (Row 2 of A) · (Col 1 of Aᵀ)\n` +
                   `        = (sin θ)×(cos θ) + (cos θ)×(-sin θ)\n` +
                   `        = sin θ cos θ - cos θ sin θ\n` +
                   `        = 0`,
          explanation: 'The terms cancel out here as well, so C[2][1] = 0.'
        });

        // Step 5: C[2][2]
        sequence.push({
          type: 'math',
          title: 'STEP 5: COMPUTE C[2][2]',
          content: `C[2][2] = (Row 2 of A) · (Col 2 of Aᵀ)\n` +
                   `        = (sin θ)×(sin θ) + (cos θ)×(cos θ)\n` +
                   `        = sin² θ + cos² θ\n` +
                   `        = 1`,
          explanation: 'By the fundamental trigonometric identity, sin² θ + cos² θ = 1, so C[2][2] = 1.'
        });

        // Step 6: Assemble
        sequence.push({
          type: 'math',
          title: 'STEP 6: ASSEMBLE THE RESULT MATRIX',
          content: `AAᵀ = [  C[1][1]   C[1][2] ]\n` +
                   `      [  C[2][1]   C[2][2] ]\n\n` +
                   `    = [  1   0 ]\n` +
                   `      [  0   1 ]\n` +
                   `    = I`,
          explanation: 'Substitute all computed values. The result matrix matches the 2×2 Identity Matrix.'
        });

        // Step 7: Final Answer
        sequence.push({
          type: 'result',
          title: 'FINAL ANSWER',
          content: `AAᵀ = [ 1  0 ] = I\n      [ 0  1 ]\n\nSince AAᵀ = I (and AᵀA = I), the matrix A is orthogonal!`,
          explanation: 'The verification shows that AAᵀ equals the Identity Matrix. Thus, A is orthogonal.'
        });
      }
      else if (isOrthogonal3x3) {
        // Step 0 — Problem Statement
        sequence.push({
          type: 'header',
          title: 'PROBLEM STATEMENT',
          content: `Show that matrix B is orthogonal.\n\n` +
                   `Given:\n` +
                   `B = [ -2/3   1/3   2/3 ]\n` +
                   `    [  2/3   2/3   1/3 ]\n` +
                   `    [  1/3  -2/3   2/3 ]\n\n` +
                   `Definition: A square matrix is orthogonal if B × Bᵀ = Bᵀ × B = I.\n` +
                   `We transpose matrix B to find Bᵀ:\n` +
                   `Bᵀ = [ -2/3   2/3   1/3 ]\n` +
                   `     [  1/3   2/3  -2/3 ]\n` +
                   `     [  2/3   1/3   2/3 ]\n\n` +
                   `Let's compute BBᵀ and verify that BBᵀ = I.`,
          explanation: 'An orthogonal matrix multiplied by its transpose yields the Identity Matrix. We set up BBᵀ.'
        });

        // Step 1: Set up multiplication
        sequence.push({
          type: 'math',
          title: 'STEP 1: SET UP THE MULTIPLICATION',
          content: `BBᵀ = [ -2/3   1/3   2/3 ]   [ -2/3   2/3   1/3 ]\n` +
                   `      [  2/3   2/3   1/3 ] × [  1/3   2/3  -2/3 ]\n` +
                   `      [  1/3  -2/3   2/3 ]   [  2/3   1/3   2/3 ]\n\n` +
                   `We will compute each element of the resulting 3×3 matrix C.`,
          explanation: 'Write B and Bᵀ side-by-side. The result matrix C has dimension 3×3.'
        });

        const details = [
          { r: 1, c: 1, expr: '(-2/3)×(-2/3) + (1/3)×(1/3) + (2/3)×(2/3)', sum: '4/9 + 1/9 + 4/9 = 9/9', val: '1' },
          { r: 1, c: 2, expr: '(-2/3)×(2/3) + (1/3)×(2/3) + (2/3)×(1/3)', sum: '-4/9 + 2/9 + 2/9', val: '0' },
          { r: 1, c: 3, expr: '(-2/3)×(1/3) + (1/3)×(-2/3) + (2/3)×(2/3)', sum: '-2/9 - 2/9 + 4/9', val: '0' },
          
          { r: 2, c: 1, expr: '(2/3)×(-2/3) + (2/3)×(1/3) + (1/3)×(2/3)', sum: '-4/9 + 2/9 + 2/9', val: '0' },
          { r: 2, c: 2, expr: '(2/3)×(2/3) + (2/3)×(2/3) + (1/3)×(1/3)', sum: '4/9 + 4/9 + 1/9 = 9/9', val: '1' },
          { r: 2, c: 3, expr: '(2/3)×(1/3) + (2/3)×(-2/3) + (1/3)×(2/3)', sum: '2/9 - 4/9 + 2/9', val: '0' },
          
          { r: 3, c: 1, expr: '(1/3)×(-2/3) + (-2/3)×(1/3) + (2/3)×(2/3)', sum: '-2/9 - 2/9 + 4/9', val: '0' },
          { r: 3, c: 2, expr: '(1/3)×(2/3) + (-2/3)×(2/3) + (2/3)×(1/3)', sum: '2/9 - 4/9 + 2/9', val: '0' },
          { r: 3, c: 3, expr: '(1/3)×(1/3) + (-2/3)×(-2/3) + (2/3)×(2/3)', sum: '1/9 + 4/9 + 4/9 = 9/9', val: '1' }
        ];

        details.forEach((cell, idx) => {
          sequence.push({
            type: 'math',
            title: `STEP ${idx + 2}: COMPUTE C[${cell.r}][${cell.c}]`,
            content: `C[${cell.r}][${cell.c}] = (Row ${cell.r} of B) · (Col ${cell.c} of Bᵀ)\n` +
                     `        = ${cell.expr}\n` +
                     `        = ${cell.sum}\n` +
                     `        = ${cell.val}`,
            explanation: `Compute the dot product of Row ${cell.r} of B and Column ${cell.c} of Bᵀ: result is ${cell.val}.`
          });
        });

        // Assemble step
        sequence.push({
          type: 'math',
          title: 'STEP 11: ASSEMBLE THE RESULT MATRIX',
          content: `BBᵀ = [ C[1][1]  C[1][2]  C[1][3] ]\n` +
                   `      [ C[2][1]  C[2][2]  C[2][3] ]\n` +
                   `      [ C[3][1]  C[3][2]  C[3][3] ]\n\n` +
                   `    = [  1   0   0 ]\n` +
                   `      [  0   1   0 ]\n` +
                   `      [  0   0   1 ]\n` +
                   `    = I`,
          explanation: 'Combine all nine values to form the result matrix, which is the 3×3 Identity Matrix I.'
        });

        // Final answer step
        sequence.push({
          type: 'result',
          title: 'FINAL ANSWER',
          content: `BBᵀ = [ 1  0  0 ] = I\n      [ 0  1  0 ]\n      [ 0  0  1 ]\n\nSince BBᵀ = I (and BᵀB = I), the matrix B is orthogonal!`,
          explanation: 'The product BBᵀ is indeed the Identity Matrix. Thus, B is orthogonal.'
        });
      }
      else {
        // Helper: format 2x2 matrix as text block
        const fmtMat = (M, name) => {
          const r0 = `[ ${M[0][0]}  ${M[0][1]} ]`;
          const r1 = `[ ${M[1][0]}  ${M[1][1]} ]`;
          return `${name} = ${r0}\n${' '.repeat(name.length + 3)}${r1}`;
        };

        // Compute result
        const C = [
          [A[0][0]*B[0][0] + A[0][1]*B[1][0],  A[0][0]*B[0][1] + A[0][1]*B[1][1]],
          [A[1][0]*B[0][0] + A[1][1]*B[1][0],  A[1][0]*B[0][1] + A[1][1]*B[1][1]]
        ];

        // Step 0 — Problem Statement
        const problemText =
          `${isSquare ? `Given: A = [ ${A[0][0]}  ${A[0][1]} ]    Find: ${label} = A \u00D7 A\n       ${' '.repeat(8)}[ ${A[1][0]}  ${A[1][1]} ]`
            : `Given: A = [ ${A[0][0]}  ${A[0][1]} ]    ${fmtMat(B, Blabel)}\n       ${' '.repeat(8)}[ ${A[1][0]}  ${A[1][1]} ]`}\n\nFind: ${label} = A \u00D7 ${Blabel}\n\nFormula: C[i][j] = \u03A3 A[i][k] \u00D7 ${Blabel}[k][j]   (k = 1 to 2)`;

        sequence.push({
          type: 'header',
          title: 'PROBLEM STATEMENT',
          content: problemText,
          explanation: `We are given ${isSquare ? 'matrix A and must compute A\u00B2 = A \u00D7 A' : 'matrices A and B and must compute their product AB'}. We apply the row \u00D7 column dot product rule.`
        });

        // Step 1 — Write out the multiplication
        const writeText =
          `A \u00D7 ${Blabel} = [ ${A[0][0]}  ${A[0][1]} ]   [ ${B[0][0]}  ${B[0][1]} ]\n` +
          `${' '.repeat(8)}[ ${A[1][0]}  ${A[1][1]} ] \u00D7 [ ${B[1][0]}  ${B[1][1]} ]\n\n` +
          `Result C is a 2\u00D72 matrix.\nWe compute each element C[i][j] using:\n  C[i][j] = (Row i of A) \u00B7 (Column j of ${Blabel})`;

        sequence.push({
          type: 'math',
          title: 'STEP 1: SET UP THE MULTIPLICATION',
          content: writeText,
          explanation: 'Write both matrices side by side. The result matrix C has the same number of rows as A and same columns as B.'
        });

        // Steps 2-5 — one step per element (all 4 cells)
        const cellLabels = [[1,1],[1,2],[2,1],[2,2]];
        cellLabels.forEach(([ri, ci], k) => {
          const i = ri - 1, j = ci - 1;
          const rowA = [A[i][0], A[i][1]];
          const colB = [B[0][j], B[1][j]];
          const products = rowA.map((v, idx) => `(${v} \u00D7 ${colB[idx]})`);
          const sums    = rowA.map((v, idx) =>  v * colB[idx]);
          const total   = sums.reduce((acc, v) => acc + v, 0);

          const cellText =
            `C[${ri}][${ci}] = Row ${ri} of A  \u00B7  Col ${ci} of ${Blabel}\n\n` +
            `     Row ${ri} of A : [ ${rowA[0]}  ${rowA[1]} ]\n` +
            `     Col ${ci} of ${Blabel} : [ ${colB[0]}  ${colB[1]} ]\n\n` +
            `C[${ri}][${ci}] = ${products.join(' + ')}\n` +
            `       = ${sums[0]} + ${sums[1]}\n` +
            `       = ${total}`;

          sequence.push({
            type: 'math',
            title: `STEP ${k + 2}: COMPUTE C[${ri}][${ci}]`,
            content: cellText,
            explanation: `C[${ri}][${ci}] is the dot product of Row ${ri} of A with Column ${ci} of ${Blabel}: ${products.join(' + ')} = ${sums[0]} + ${sums[1]} = ${total}.`
          });
        });

        // Step 6 — Assembled result
        const assembleText =
          `Substituting all computed values:\n\n` +
          `${label} = A \u00D7 ${Blabel}\n\n` +
          `   = [ ${C[0][0]}  ${C[0][1]} ]\n` +
          `     [ ${C[1][0]}  ${C[1][1]} ]`;

        sequence.push({
          type: 'math',
          title: 'STEP 6: ASSEMBLE THE RESULT MATRIX',
          content: assembleText,
          explanation: `Placing all four computed values into the result matrix gives us ${label}.`
        });

        // Step 7 — Final answer with interpretation
        const isIdentity = C[0][0]===1 && C[0][1]===0 && C[1][0]===0 && C[1][1]===1;
        const isZero     = C[0][0]===0 && C[0][1]===0 && C[1][0]===0 && C[1][1]===0;
        const note = isIdentity
          ? `\n\u2234 A\u00B2 = I  (Identity Matrix)\n   A is an Involutory Matrix (A\u00B2 = I)`
          : isZero
          ? `\n\u2234 AB = O  (Zero Matrix)\n   Note: AB = 0 even though A \u2260 0 and B \u2260 0`
          : '';

        sequence.push({
          type: 'result',
          title: 'FINAL ANSWER',
          content: `${label} = [ ${C[0][0]}  ${C[0][1]} ]\n${' '.repeat(label.length + 3)}[ ${C[1][0]}  ${C[1][1]} ]${note}`,
          explanation: `The product ${label} has been computed. ${isIdentity ? 'The result is the Identity Matrix — A is involutory.' : isZero ? 'The result is the Zero Matrix — AB = 0 despite A and B being non-zero.' : 'Matrix multiplication complete.'}`
        });
      }
    }
    else if (method === 'Symmetric & Skew Symmetric') {
      const q = matMulQuestion;
      if (q) {
        const is2x2 = q.type === 'symmetric_skew_2x2';

        if (is2x2) {
          // Step 0: Problem Statement
          sequence.push({
            type: 'header',
            title: 'PROBLEM STATEMENT',
            content: `Express the matrix A as the sum of a symmetric matrix B and a skew-symmetric matrix C.\n\n` +
                     `Given:\n` +
                     `A = [  3   5 ]\n` +
                     `    [  1  -1 ]\n\n` +
                     `Formulas:\n` +
                     `  • Symmetric part: B = ½(A + Aᵀ)\n` +
                     `  • Skew-Symmetric part: C = ½(A - Aᵀ)\n` +
                     `  • Verification: A = B + C`,
            explanation: 'We decompose matrix A into symmetric (B) and skew-symmetric (C) parts using transpose formulas.'
          });

          // Step 1: Compute Transpose
          sequence.push({
            type: 'math',
            title: 'STEP 1: COMPUTE TRANSPOSE Aᵀ',
            content: `Aᵀ is obtained by swapping rows with columns:\n\n` +
                     `Aᵀ = [  3   1 ]\n` +
                     `     [  5  -1 ]`,
            explanation: 'Rows of matrix A become the columns of Aᵀ.'
          });

          // Step 2: Compute A + Aᵀ
          sequence.push({
            type: 'math',
            title: 'STEP 2: COMPUTE A + Aᵀ',
            content: `A + Aᵀ = [  3+3    5+1  ]\n` +
                     `         [  1+5   -1+(-1) ]\n\n` +
                     `       = [  6   6 ]\n` +
                     `         [  6  -2 ]`,
            explanation: 'Add corresponding elements from A and Aᵀ.'
          });

          // Step 3: Compute Symmetric Matrix B
          sequence.push({
            type: 'math',
            title: 'STEP 3: COMPUTE SYMMETRIC MATRIX B = ½(A + Aᵀ)',
            content: `B = ½ × [  6   6 ]\n` +
                     `        [  6  -2 ]\n\n` +
                     `  = [  3   3 ]\n` +
                     `    [  3  -1 ]\n\n` +
                     `Check Symmetry: Bᵀ = B. Since row 1 equals col 1 and row 2 equals col 2, B is symmetric.`,
            explanation: 'Divide each element of A + Aᵀ by 2 to get B.'
          });

          // Step 4: Compute A - Aᵀ
          sequence.push({
            type: 'math',
            title: 'STEP 4: COMPUTE A - Aᵀ',
            content: `A - Aᵀ = [  3-3    5-1  ]\n` +
                     `         [  1-5   -1-(-1) ]\n\n` +
                     `       = [  0   4 ]\n` +
                     `         [ -4   0 ]`,
            explanation: 'Subtract elements of Aᵀ from corresponding elements of A.'
          });

          // Step 5: Compute Skew-Symmetric Matrix C
          sequence.push({
            type: 'math',
            title: 'STEP 5: COMPUTE SKEW-SYMMETRIC MATRIX C = ½(A - Aᵀ)',
            content: `C = ½ × [  0   4 ]\n` +
                     `        [ -4   0 ]\n\n` +
                     `  = [  0   2 ]\n` +
                     `    [ -2   0 ]\n\n` +
                     `Check Skew-Symmetry: Cᵀ = -C. Diagonal elements are 0, and C[1][2] = -C[2][1]. C is skew-symmetric.`,
            explanation: 'Divide each element of A - Aᵀ by 2 to get C.'
          });

          // Step 6: Verify B + C = A
          sequence.push({
            type: 'math',
            title: 'STEP 6: VERIFY DECOMPOSITION (B + C = A)',
            content: `B + C = [  3+0   3+2  ]\n` +
                     `        [  3-2  -1+0  ]\n\n` +
                     `      = [  3   5 ]\n` +
                     `        [  1  -1 ]\n\n` +
                     `      = A  (Verified!)`,
            explanation: 'Add the symmetric matrix B and skew-symmetric matrix C. The sum equals the original matrix A.'
          });

          // Step 7: Final Answer
          sequence.push({
            type: 'result',
            title: 'FINAL ANSWER',
            content: `Symmetric Matrix B:\n` +
                     `  B = [  3   3 ]\n` +
                     `      [  3  -1 ]\n\n` +
                     `Skew-Symmetric Matrix C:\n` +
                     `  C = [  0   2 ]\n` +
                     `      [ -2   0 ]\n\n` +
                     `Where A = B + C.`,
            explanation: 'The decomposition is complete. The sum of B and C equals matrix A.'
          });
        } else {
          // 3x3 Problem from image
          // Step 0: Problem Statement
          sequence.push({
            type: 'header',
            title: 'PROBLEM STATEMENT',
            content: `Express the matrix A as the sum of a symmetric matrix B and a skew-symmetric matrix C.\n\n` +
                     `Given:\n` +
                     `A = [  1   7   8 ]\n` +
                     `    [  6   2   9 ]\n` +
                     `    [  5   4   3 ]\n\n` +
                     `Formulas:\n` +
                     `  • Symmetric part: B = ½(A + Aᵀ)\n` +
                     `  • Skew-Symmetric part: C = ½(A - Aᵀ)\n` +
                     `  • Verification: A = B + C`,
            explanation: 'We decompose matrix A into symmetric (B) and skew-symmetric (C) parts using transpose formulas.'
          });

          // Step 1: Compute Transpose
          sequence.push({
            type: 'math',
            title: 'STEP 1: COMPUTE TRANSPOSE Aᵀ',
            content: `Aᵀ is obtained by swapping rows with columns:\n\n` +
                     `Aᵀ = [  1   6   5 ]\n` +
                     `     [  7   2   4 ]\n` +
                     `     [  8   9   3 ]`,
            explanation: 'Rows of matrix A become the columns of Aᵀ.'
          });

          // Step 2: Compute A + Aᵀ
          sequence.push({
            type: 'math',
            title: 'STEP 2: COMPUTE A + Aᵀ',
            content: `A + Aᵀ = [  1+1    7+6    8+5  ]\n` +
                     `         [  6+7    2+2    9+4  ]\n` +
                     `         [  5+8    4+9    3+3  ]\n\n` +
                     `       = [  2   13   13 ]\n` +
                     `         [ 13    4   13 ]\n` +
                     `         [ 13   13    6 ]`,
            explanation: 'Add corresponding elements from A and Aᵀ.'
          });

          // Step 3: Compute Symmetric Matrix B
          sequence.push({
            type: 'math',
            title: 'STEP 3: COMPUTE SYMMETRIC MATRIX B = ½(A + Aᵀ)',
            content: `B = ½ × [  2   13   13 ]\n` +
                     `        [ 13    4   13 ]\n` +
                     `        [ 13   13    6 ]\n\n` +
                     `  = [  1    13/2   13/2 ]\n` +
                     `    [ 13/2   2     13/2 ]\n` +
                     `    [ 13/2  13/2    3   ]\n\n` +
                     `Check Symmetry: Bᵀ = B. Since B[i][j] = B[j][i], B is symmetric.`,
            explanation: 'Divide each element of A + Aᵀ by 2 to get B.'
          });

          // Step 4: Compute A - Aᵀ
          sequence.push({
            type: 'math',
            title: 'STEP 4: COMPUTE A - Aᵀ',
            content: `A - Aᵀ = [  1-1    7-6    8-5  ]\n` +
                     `         [  6-7    2-2    9-4  ]\n` +
                     `         [  5-8    4-9    3-3  ]\n\n` +
                     `       = [  0    1    3 ]\n` +
                     `         [ -1    0    5 ]\n` +
                     `         [ -3   -5    0 ]`,
            explanation: 'Subtract elements of Aᵀ from corresponding elements of A.'
          });

          // Step 5: Compute Skew-Symmetric Matrix C
          sequence.push({
            type: 'math',
            title: 'STEP 5: COMPUTE SKEW-SYMMETRIC MATRIX C = ½(A - Aᵀ)',
            content: `C = ½ × [  0    1    3 ]\n` +
                     `        [ -1    0    5 ]\n` +
                     `        [ -3   -5    0 ]\n\n` +
                     `  = [   0    1/2   3/2 ]\n` +
                     `    [ -1/2    0    5/2 ]\n` +
                     `    [ -3/2  -5/2    0  ]\n\n` +
                     `Check Skew-Symmetry: Cᵀ = -C. Diagonal elements are 0, and C[i][j] = -C[j][i]. C is skew-symmetric.`,
            explanation: 'Divide each element of A - Aᵀ by 2 to get C.'
          });

          // Step 6: Verify B + C = A
          sequence.push({
            type: 'math',
            title: 'STEP 6: VERIFY DECOMPOSITION (B + C = A)',
            content: `B + C = [  1+0    13/2+1/2   13/2+3/2 ]\n` +
                     `        [ 13/2-1/2   2+0     13/2+5/2 ]\n` +
                     `        [ 13/2-3/2  13/2-5/2   3+0    ]\n\n` +
                     `      = [  1    14/2   16/2 ]\n` +
                     `        [ 12/2   2     18/2 ]\n` +
                     `        [ 10/2   8/2    3   ]\n\n` +
                     `      = [  1   7   8 ]\n` +
                     `        [  6   2   9 ]\n` +
                     `        [  5   4   3 ] = A  (Verified!)`,
            explanation: 'Add the symmetric matrix B and skew-symmetric matrix C. The sum equals the original matrix A.'
          });

          // Step 7: Final Answer
          sequence.push({
            type: 'result',
            title: 'FINAL ANSWER',
            content: `Symmetric Matrix B:\n` +
                     `  B = [  1    13/2   13/2 ]\n` +
                     `      [ 13/2   2     13/2 ]\n` +
                     `      [ 13/2  13/2    3   ]\n\n` +
                     `Skew-Symmetric Matrix C:\n` +
                     `  C = [   0    1/2   3/2 ]\n` +
                     `      [ -1/2    0    5/2 ]\n` +
                     `      [ -3/2  -5/2    0  ]\n\n` +
                     `Where A = B + C.`,
            explanation: 'The decomposition is complete. The sum of B and C equals matrix A.'
          });
        }
      }
    }
    else if (method === 'Inverse Matrix') {
      const q = matMulQuestion;
      if (q) {
        const isProblem1 = q.type === 'inverse_3x3_1';

        if (isProblem1) {
          // Step 0: Problem Statement
          sequence.push({
            type: 'header',
            title: 'PROBLEM STATEMENT',
            content: `Find the inverse of the matrix A using the adjoint method.\n\n` +
                     `Given:\n` +
                     `A = [  5  -2   4 ]\n` +
                     `    [ -2   1   1 ]\n` +
                     `    [  4   1   0 ]\n\n` +
                     `Formula:\n` +
                     `  A\u207B\u00B9 = (1 / |A|) \u00B7 adj A\n` +
                     `  where |A| is the determinant and adj A is the adjoint matrix (transpose of the cofactor matrix).`,
            explanation: 'We set up the matrix inversion problem and the required formulas.'
          });

          // Step 1: Compute Determinant
          sequence.push({
            type: 'math',
            title: 'STEP 1: COMPUTE DETERMINANT |A|',
            content: `|A| = 5\u00B7(1\u00B70 - 1\u00B71) - (-2)\u00B7((-2)\u00B70 - 1\u00B74) + 4\u00B7((-2)\u00B71 - 1\u00B74)\n` +
                     `    = 5\u00B7(0 - 1) + 2\u00B7(0 - 4) + 4\u00B7(-2 - 4)\n` +
                     `    = 5\u00B7(-1) + 2\u00B7(-4) + 4\u00B7(-6)\n` +
                     `    = -5 - 8 - 24\n` +
                     `    = -37\n\n` +
                     `Since |A| = -37 \u2260 0, the matrix A is non-singular and its inverse A\u207B\u00B9 exists.`,
            explanation: 'Expand the determinant along the first row. Since it is non-zero, the inverse exists.'
          });

          // Step 2: Cofactors of Row 1
          sequence.push({
            type: 'math',
            title: 'STEP 2: FIND COFACTORS OF ROW 1',
            content: `C\u2081\u2081 = +| 1  1 | = +(1\u00B70 - 1\u00B71) = -1\n` +
                     `       | 1  0 |\n\n` +
                     `C\u2081\u2082 = -| -2  1 | = -((-2)\u00B70 - 1\u00B74) = 4\n` +
                     `       |  4  0 |\n\n` +
                     `C\u2081\u2083 = +| -2  1 | = +((-2)\u00B71 - 1\u00B74) = -6\n` +
                     `       |  4  1 |`,
            explanation: 'Compute cofactors for row 1 elements using sign checkers (-1)^(i+j).'
          });

          // Step 3: Cofactors of Row 2
          sequence.push({
            type: 'math',
            title: 'STEP 3: FIND COFACTORS OF ROW 2',
            content: `C\u2082\u2081 = -| -2  4 | = -((-2)\u00B70 - 4\u00B71) = 4\n` +
                     `       |  1  0 |\n\n` +
                     `C\u2082\u2082 = +|  5  4 | = +(5\u00B70 - 4\u00B74) = -16\n` +
                     `       |  4  0 |\n\n` +
                     `C\u2082\u2083 = -|  5 -2 | = -(5\u00B71 - (-2)\u00B74) = -13\n` +
                     `       |  4  1 |`,
            explanation: 'Compute cofactors for row 2 elements.'
          });

          // Step 4: Cofactors of Row 3
          sequence.push({
            type: 'math',
            title: 'STEP 4: FIND COFACTORS OF ROW 3',
            content: `C\u2083\u2081 = +| -2  4 | = +((-2)\u00B71 - 4\u00B71) = -6\n` +
                     `       |  1  1 |\n\n` +
                     `C\u2083\u2082 = -|  5  4 | = -(5\u00B71 - 4\u00B7(-2)) = -13\n` +
                     `       | -2  1 |\n\n` +
                     `C\u2083\u2083 = +|  5 -2 | = +(5\u00B71 - (-2)\u00B7(-2)) = 1\n` +
                     `       | -2  1 |`,
            explanation: 'Compute cofactors for row 3 elements.'
          });

          // Step 5: Assemble Cofactor Matrix
          sequence.push({
            type: 'math',
            title: 'STEP 5: ASSEMBLE COFACTOR MATRIX',
            content: `cof(A) = [ C\u2081\u2081  C\u2081\u2082  C\u2081\u2083 ]\n` +
                     `         [ C\u2082\u2081  C\u2082\u2082  C\u2082\u2083 ]\n` +
                     `         [ C\u2083\u2081  C\u2083\u2082  C\u2083\u2083 ]\n\n` +
                     `       = [ -1    4   -6 ]\n` +
                     `         [  4  -16  -13 ]\n` +
                     `         [ -6  -13    1 ]`,
            explanation: 'Assemble all computed cofactors into a 3×3 matrix.'
          });

          // Step 6: Compute Adjoint Matrix
          sequence.push({
            type: 'math',
            title: 'STEP 6: COMPUTE ADJOINT MATRIX adj A = (cof A)ᵀ',
            content: `Transpose the cofactor matrix (rows become columns):\n\n` +
                     `adj A = [ -1    4   -6 ]\n` +
                     `        [  4  -16  -13 ]\n` +
                     `        [ -6  -13    1 ]`,
            explanation: 'The adjoint is the transpose of the cofactor matrix. Since cof(A) is symmetric, adj A is identical.'
          });

          // Step 7: Compute Inverse
          sequence.push({
            type: 'result',
            title: 'FINAL ANSWER',
            content: `A\u207B\u00B9 = (1 / |A|) \u00B7 adj A\n` +
                     `    = (1 / -37) \u00B7 [ -1    4   -6 ]\n` +
                     `                    [  4  -16  -13 ]\n` +
                     `                    [ -6  -13    1 ]\n\n` +
                     `    = [  1/37   -4/37    6/37  ]\n` +
                     `      [ -4/37   16/37   13/37  ]\n` +
                     `      [  6/37   13/37   -1/37  ]`,
            explanation: 'Multiply the scalar (1 / -37) by each element of the adjoint matrix to get A⁻¹.'
          });
        } else {
          // Problem 2
          // Step 0: Problem Statement
          sequence.push({
            type: 'header',
            title: 'PROBLEM STATEMENT',
            content: `Find the inverse of the matrix A using the adjoint method.\n\n` +
                     `Given:\n` +
                     `A = [  2   4   3 ]\n` +
                     `    [  0   1   1 ]\n` +
                     `    [  2   2  -1 ]\n\n` +
                     `Formula:\n` +
                     `  A\u207B\u00B9 = (1 / |A|) \u00B7 adj A\n` +
                     `  where |A| is the determinant and adj A is the adjoint matrix (transpose of the cofactor matrix).`,
            explanation: 'We set up the matrix inversion problem and the required formulas.'
          });

          // Step 1: Compute Determinant
          sequence.push({
            type: 'math',
            title: 'STEP 1: COMPUTE DETERMINANT |A|',
            content: `|A| = 2\u00B7(1\u00B7(-1) - 1\u00B72) - 4\u00B7(0\u00B7(-1) - 1\u00B72) + 3\u00B7(0\u00B72 - 1\u00B72)\n` +
                     `    = 2\u00B7(-1 - 2) - 4\u00B7(0 - 2) + 3\u00B7(0 - 2)\n` +
                     `    = 2\u00B7(-3) - 4\u00B7(-2) + 3\u00B7(-2)\n` +
                     `    = -6 + 8 - 6\n` +
                     `    = -4\n\n` +
                     `Since |A| = -4 \u2260 0, the matrix A is non-singular and its inverse A\u207B\u00B9 exists.`,
            explanation: 'Expand the determinant along the first row. Since it is non-zero, the inverse exists.'
          });

          // Step 2: Cofactors of Row 1
          sequence.push({
            type: 'math',
            title: 'STEP 2: FIND COFACTORS OF ROW 1',
            content: `C\u2081\u2081 = +| 1  1 | = +(1\u00B7(-1) - 1\u00B72) = -3\n` +
                     `       | 2 -1 |\n\n` +
                     `C\u2081\u2082 = -| 0  1 | = -(0\u00B7(-1) - 1\u00B72) = 2\n` +
                     `       | 2 -1 |\n\n` +
                     `C\u2081\u2083 = +| 0  1 | = +(0\u00B72 - 1\u00B72) = -2\n` +
                     `       | 2  2 |`,
            explanation: 'Compute cofactors for row 1 elements using sign checkers (-1)^(i+j).'
          });

          // Step 3: Cofactors of Row 2
          sequence.push({
            type: 'math',
            title: 'STEP 3: FIND COFACTORS OF ROW 2',
            content: `C\u2082\u2081 = -| 4  3 | = -(4\u00B7(-1) - 3\u00B72) = 10\n` +
                     `       | 2 -1 |\n\n` +
                     `C\u2082\u2082 = +| 2  3 | = +(2\u00B7(-1) - 3\u00B72) = -8\n` +
                     `       | 2 -1 |\n\n` +
                     `C\u2082\u2083 = -| 2  4 | = -(2\u00B72 - 4\u00B72) = 4\n` +
                     `       | 2  2 |`,
            explanation: 'Compute cofactors for row 2 elements.'
          });

          // Step 4: Cofactors of Row 3
          sequence.push({
            type: 'math',
            title: 'STEP 4: FIND COFACTORS OF ROW 3',
            content: `C\u2083\u2081 = +| 4  3 | = +(4\u00B71 - 3\u00B71) = 1\n` +
                     `       | 1  1 |\n\n` +
                     `C\u2083\u2082 = -| 2  3 | = -(2\u00B71 - 3\u00B70) = -2\n` +
                     `       | 0  1 |\n\n` +
                     `C\u2083\u2083 = +| 2  4 | = +(2\u00B71 - 4\u00B70) = 2\n` +
                     `       | 0  1 |`,
            explanation: 'Compute cofactors for row 3 elements.'
          });

          // Step 5: Assemble Cofactor Matrix
          sequence.push({
            type: 'math',
            title: 'STEP 5: ASSEMBLE COFACTOR MATRIX',
            content: `cof(A) = [ C\u2081\u2081  C\u2081\u2082  C\u2081\u2083 ]\n` +
                     `         [ C\u2082\u2081  C\u2082\u2082  C\u2082\u2083 ]\n` +
                     `         [ C\u2083\u2081  C\u2083\u2082  C\u2083\u2083 ]\n\n` +
                     `       = [ -3    2   -2 ]\n` +
                     `         [ 10   -8    4 ]\n` +
                     `         [  1   -2    2 ]`,
            explanation: 'Assemble all computed cofactors into a 3×3 matrix.'
          });

          // Step 6: Compute Adjoint Matrix
          sequence.push({
            type: 'math',
            title: 'STEP 6: COMPUTE ADJOINT MATRIX adj A = (cof A)ᵀ',
            content: `Transpose the cofactor matrix (rows become columns):\n\n` +
                     `adj A = [ -3   10    1 ]\n` +
                     `        [  2   -8   -2 ]\n` +
                     `        [ -2    4    2 ]`,
            explanation: 'The adjoint is the transpose of the cofactor matrix.'
          });

          // Step 7: Compute Inverse
          sequence.push({
            type: 'result',
            title: 'FINAL ANSWER',
            content: `A\u207B\u00B9 = (1 / |A|) \u00B7 adj A\n` +
                     `    = (1 / -4) \u00B7 [ -3   10    1 ]\n` +
                     `                   [  2   -8   -2 ]\n` +
                     `                   [ -2    4    2 ]\n\n` +
                     `    = [  3/4   -5/2   -1/4  ]\n` +
                     `      [ -1/2    2     1/2  ]\n` +
                     `      [  1/2   -1    -1/2  ]`,
            explanation: 'Multiply the scalar (1 / -4) by each element of the adjoint matrix to get A⁻¹.'
          });
        }
      }
    }
    else if (method === 'Gauss Elimination') {
      const q = matMulQuestion;
      if (q) {
        const isProblem1 = q.type === 'gauss_elim_1';

        if (isProblem1) {
          // Step 0: Problem Statement
          sequence.push({
            type: 'header',
            title: 'PROBLEM STATEMENT',
            content: `Solve the system of equations using Gauss Elimination:\n\n` +
                     `  2x +  y +  z = 10\n` +
                     `  3x + 2y + 3z = 18\n` +
                     `   x + 4y + 9z = 16\n\n` +
                     `Let's represent the system as an augmented matrix [A : B]:\n\n` +
                     `  [  2   1   1  |  10 ]\n` +
                     `  [  3   2   3  |  18 ]\n` +
                     `  [  1   4   9  |  16 ]`,
            explanation: 'Express the system of linear equations in augmented matrix format to prepare for elimination row operations.'
          });

          // Step 1: Eliminate x
          sequence.push({
            type: 'math',
            title: 'STEP 1: ELIMINATE X FROM ROW 2 AND ROW 3',
            content: `Create zeros in column 1 below the pivot A\u2081\u2081 = 2:\n` +
                     `  • R\u2082 \u2190 R\u2082 \u2212 (3/2)R\u2081  \u2192  R\u2082 \u2190 R\u2082 \u2212 1.5R\u2081\n` +
                     `  • R\u2083 \u2190 R\u2083 \u2212 (1/2)R\u2081  \u2192  R\u2083 \u2190 R\u2083 \u2212 0.5R\u2081\n\n` +
                     `Calculations:\n` +
                     `  R\u2082: [3-1.5(2),  2-1.5(1),  3-1.5(1) | 18-1.5(10)] = [0,  0.5,  1.5 | 3]\n` +
                     `  R\u2083: [1-0.5(2),  4-0.5(1),  9-0.5(1) | 16-0.5(10)] = [0,  3.5,  8.5 | 11]\n\n` +
                     `Augmented Matrix:\n` +
                     `  [  2    1    1   |  10 ]\n` +
                     `  [  0   0.5  1.5  |   3 ]\n` +
                     `  [  0   3.5  8.5  |  11 ]`,
            explanation: 'Eliminate x coefficient in row 2 and row 3 by subtracting multiples of the pivot row 1.'
          });

          // Step 2: Eliminate y
          sequence.push({
            type: 'math',
            title: 'STEP 2: ELIMINATE Y FROM ROW 3',
            content: `Create a zero in column 2 below the pivot A\u2082\u2082 = 0.5:\n` +
                     `  • R\u2083 \u2190 R\u2083 \u2212 (3.5/0.5)R\u2082  \u2192  R\u2083 \u2190 R\u2083 \u2212 7R\u2082\n\n` +
                     `Calculations:\n` +
                     `  R\u2083: [0-7(0),  3.5-7(0.5),  8.5-7(1.5) | 11-7(3)] = [0,  0,  -2 | -10]\n\n` +
                     `Row Echelon (Upper Triangular) Form:\n` +
                     `  [  2    1    1   |  10  ]\n` +
                     `  [  0   0.5  1.5  |   3  ]\n` +
                     `  [  0    0   -2   | -10  ]`,
            explanation: 'Eliminate y coefficient in row 3 by subtracting 7 times row 2.'
          });

          // Step 3: Back Substitution z
          sequence.push({
            type: 'math',
            title: 'STEP 3: SOLVE FOR Z (BACK SUBSTITUTION ROW 3)',
            content: `From Row 3:\n` +
                     `  -2z = -10\n` +
                     `    z = -10 / -2\n` +
                     `    z = 5`,
            explanation: 'Since row 3 only contains z, solve directly for z.'
          });

          // Step 4: Back Substitution y
          sequence.push({
            type: 'math',
            title: 'STEP 4: SOLVE FOR Y (BACK SUBSTITUTION ROW 2)',
            content: `From Row 2:\n` +
                     `  0.5y + 1.5z = 3\n\n` +
                     `Substitute z = 5:\n` +
                     `  0.5y + 1.5(5) = 3\n` +
                     `  0.5y + 7.5 = 3\n` +
                     `  0.5y = 3 - 7.5\n` +
                     `  0.5y = -4.5\n` +
                     `     y = -4.5 / 0.5\n` +
                     `     y = -9`,
            explanation: 'Substitute z into row 2 equation to solve for y.'
          });

          // Step 5: Back Substitution x
          sequence.push({
            type: 'math',
            title: 'STEP 5: SOLVE FOR X (BACK SUBSTITUTION ROW 1)',
            content: `From Row 1:\n` +
                     `  2x + y + z = 10\n\n` +
                     `Substitute y = -9 and z = 5:\n` +
                     `  2x + (-9) + 5 = 10\n` +
                     `  2x - 4 = 10\n` +
                     `  2x = 10 + 4\n` +
                     `  2x = 14\n` +
                     `   x = 14 / 2\n` +
                     `   x = 7`,
            explanation: 'Substitute y and z into row 1 equation to solve for x.'
          });

          // Step 6: Verification
          sequence.push({
            type: 'math',
            title: 'STEP 6: VERIFY THE SOLUTION',
            content: `Substitute x = 7, y = -9, z = 5 into original equations:\n` +
                     `  1) 2(7) + (-9) + 5 = 14 - 9 + 5 = 10  (Matches Eq 1!)\n` +
                     `  2) 3(7) + 2(-9) + 3(5) = 21 - 18 + 15 = 18  (Matches Eq 2!)\n` +
                     `  3) (7) + 4(-9) + 9(5) = 7 - 36 + 45 = 16  (Matches Eq 3!)\n\n` +
                     `All checks passed successfully!`,
            explanation: 'Verify the computed system values satisfy all three starting linear equations.'
          });

          // Step 7: Final Result
          sequence.push({
            type: 'result',
            title: 'FINAL ANSWER',
            content: `System solution found:\n` +
                     `  x = 7\n` +
                     `  y = -9\n` +
                     `  z = 5\n\n` +
                     `Decomposed augmented upper triangular system matrix:\n` +
                     `  [  2    1    1   |  10  ]\n` +
                     `  [  0   0.5  1.5  |   3  ]\n` +
                     `  [  0    0   -2   | -10  ]`,
            explanation: 'Gauss Elimination complete. The system coordinates have been successfully calculated.'
          });
        } else {
          // Problem 2
          // Step 0: Problem Statement
          sequence.push({
            type: 'header',
            title: 'PROBLEM STATEMENT',
            content: `Solve the system of equations using Gauss Elimination:\n\n` +
                     `   x +  y +  z = 6\n` +
                     `  2x -  y + 3z = 9\n` +
                     `   x + 2y -  z = 2\n\n` +
                     `Let's represent the system as an augmented matrix [A : B]:\n\n` +
                     `  [  1   1   1  |  6 ]\n` +
                     `  [  2  -1   3  |  9 ]\n` +
                     `  [  1   2  -1  |  2 ]`,
            explanation: 'Express the system of linear equations in augmented matrix format.'
          });

          // Step 1: Eliminate x
          sequence.push({
            type: 'math',
            title: 'STEP 1: ELIMINATE X FROM ROW 2 AND ROW 3',
            content: `Create zeros in column 1 below the pivot A\u2081\u2081 = 1:\n` +
                     `  • R\u2082 \u2190 R\u2082 \u2212 2R\u2081\n` +
                     `  • R\u2083 \u2190 R\u2083 \u2212 R\u2081\n\n` +
                     `Calculations:\n` +
                     `  R\u2082: [2-2(1),  -1-2(1),  3-2(1) | 9-2(6)] = [0,  -3,  1 | -3]\n` +
                     `  R\u2083: [1-1(1),   2-1(1),  -1-1(1) | 2-1(6)] = [0,   1, -2 | -4]\n\n` +
                     `Augmented Matrix:\n` +
                     `  [  1    1    1   |   6 ]\n` +
                     `  [  0   -3    1   |  -3 ]\n` +
                     `  [  0    1   -2   |  -4 ]`,
            explanation: 'Eliminate x coefficient in row 2 and row 3 by subtracting multiples of pivot row 1.'
          });

          // Step 2: Eliminate y
          sequence.push({
            type: 'math',
            title: 'STEP 2: ELIMINATE Y FROM ROW 3',
            content: `Create a zero in column 2 below pivot A\u2082\u2082 = -3:\n` +
                     `  • R\u2083 \u2190 R\u2083 \u2212 (1/-3)R\u2082  \u2192  R\u2083 \u2190 R\u2083 + (1/3)R\u2082\n\n` +
                     `Calculations:\n` +
                     `  R\u2083 Column 3: -2 + (1/3)(1) = -5/3\n` +
                     `  R\u2083 Constant: -4 + (1/3)(-3) = -5\n\n` +
                     `Row Echelon Form:\n` +
                     `  [  1    1    1   |   6  ]\n` +
                     `  [  0   -3    1   |  -3  ]\n` +
                     `  [  0    0  -5/3  |  -5  ]`,
            explanation: 'Eliminate y coefficient in row 3 by adding 1/3 of row 2.'
          });

          // Step 3: Back Substitution z
          sequence.push({
            type: 'math',
            title: 'STEP 3: SOLVE FOR Z (BACK SUBSTITUTION ROW 3)',
            content: `From Row 3:\n` +
                     `  (-5/3)z = -5\n` +
                     `        z = -5 \u00B7 (-3/5)\n` +
                     `        z = 3`,
            explanation: 'Solve for z using diagonal row 3 coefficient.'
          });

          // Step 4: Back Substitution y
          sequence.push({
            type: 'math',
            title: 'STEP 4: SOLVE FOR Y (BACK SUBSTITUTION ROW 2)',
            content: `From Row 2:\n` +
                     `  -3y + z = -3\n\n` +
                     `Substitute z = 3:\n` +
                     `  -3y + 3 = -3\n` +
                     `  -3y = -6\n` +
                     `    y = 2`,
            explanation: 'Substitute z into row 2 equation to solve for y.'
          });

          // Step 5: Back Substitution x
          sequence.push({
            type: 'math',
            title: 'STEP 5: SOLVE FOR X (BACK SUBSTITUTION ROW 1)',
            content: `From Row 1:\n` +
                     `  x + y + z = 6\n\n` +
                     `Substitute y = 2 and z = 3:\n` +
                     `  x + 2 + 3 = 6\n` +
                     `  x + 5 = 6\n` +
                     `  x = 1`,
            explanation: 'Substitute y and z into row 1 equation to solve for x.'
          });

          // Step 6: Verification
          sequence.push({
            type: 'math',
            title: 'STEP 6: VERIFY THE SOLUTION',
            content: `Substitute x = 1, y = 2, z = 3 into original equations:\n` +
                     `  1) (1) + (2) + (3) = 6  (Matches Eq 1!)\n` +
                     `  2) 2(1) - (2) + 3(3) = 2 - 2 + 9 = 9  (Matches Eq 2!)\n` +
                     `  3) (1) + 2(2) - (3) = 1 + 4 - 3 = 2  (Matches Eq 3!)\n\n` +
                     `All checks passed successfully!`,
            explanation: 'Verify the computed system values satisfy all starting linear equations.'
          });

          // Step 7: Final Result
          sequence.push({
            type: 'result',
            title: 'FINAL ANSWER',
            content: `System solution found:\n` +
                     `  x = 1\n` +
                     `  y = 2\n` +
                     `  z = 3\n\n` +
                     `Decomposed augmented upper triangular system matrix:\n` +
                     `  [  1    1    1   |   6  ]\n` +
                     `  [  0   -3    1   |  -3  ]\n` +
                     `  [  0    0  -5/3  |  -5  ]`,
            explanation: 'Gauss Elimination complete. The system coordinates have been successfully calculated.'
          });
        }
      }
    }
    else if (method === 'Gauss-Jordan Elimination') {
      const q = matMulQuestion;
      if (q) {
        const isProblem1 = q.type === 'gauss_jordan_1';

        if (isProblem1) {
          // Gauss-Jordan 3x3 Photo Problem
          // Step 0: Problem Statement
          sequence.push({
            type: 'header',
            title: 'PROBLEM STATEMENT',
            content: `Solve the system of equations using Gauss-Jordan Elimination:\n\n` +
                     `  2x +  y +  z = 10\n` +
                     `  3x + 2y + 3z = 18\n` +
                     `   x + 4y + 9z = 16\n\n` +
                     `Let's represent the system as an augmented matrix [A : B]:\n\n` +
                     `  [  2   1   1  |  10 ]\n` +
                     `  [  3   2   3  |  18 ]\n` +
                     `  [  1   4   9  |  16 ]`,
            explanation: 'Express the system of linear equations in augmented matrix format to prepare for Gauss-Jordan elimination.'
          });

          // Step 1: Eliminate x below the first pivot
          sequence.push({
            type: 'math',
            title: 'STEP 1: ELIMINATE X FROM ROW 2 AND ROW 3',
            content: `Create zeros in column 1 below the pivot A\u2081\u2081 = 2:\n` +
                     `  • R\u2082 \u2190 R\u2082 \u2212 (3/2)R\u2081  \u2192  R\u2082 \u2190 R\u2082 \u2212 1.5R\u2081\n` +
                     `  • R\u2083 \u2190 R\u2083 \u2212 (1/2)R\u2081  \u2192  R\u2083 \u2190 R\u2083 \u2212 0.5R\u2081\n\n` +
                     `Calculations:\n` +
                     `  R\u2082: [3-1.5(2),  2-1.5(1),  3-1.5(1) | 18-1.5(10)] = [0,  0.5,  1.5 | 3]\n` +
                     `  R\u2083: [1-0.5(2),  4-0.5(1),  9-0.5(1) | 16-0.5(10)] = [0,  3.5,  8.5 | 11]\n\n` +
                     `Augmented Matrix:\n` +
                     `  [  2    1    1   |  10 ]\n` +
                     `  [  0   0.5  1.5  |   3 ]\n` +
                     `  [  0   3.5  8.5  |  11 ]`,
            explanation: 'Perform row operations to eliminate the x variable from row 2 and row 3 using the first row as the pivot.'
          });

          // Step 2: Eliminate y above and below the second pivot
          sequence.push({
            type: 'math',
            title: 'STEP 2: ELIMINATE Y FROM ROW 1 AND ROW 3',
            content: `Create zeros in column 2 above and below the pivot A\u2082\u2082 = 0.5:\n` +
                     `  • R\u2081 \u2190 R\u2081 \u2212 (1/0.5)R\u2082  \u2192  R\u2081 \u2190 R\u2081 \u2212 2R\u2082\n` +
                     `  • R\u2083 \u2190 R\u2083 \u2212 (3.5/0.5)R\u2082  \u2192  R\u2083 \u2190 R\u2083 \u2212 7R\u2082\n\n` +
                     `Calculations:\n` +
                     `  R\u2081: [2-2(0),  1-2(0.5),  1-2(1.5) | 10-2(3)] = [2,  0,  -2 | 4]\n` +
                     `  R\u2083: [0-7(0),  3.5-7(0.5),  8.5-7(1.5) | 11-7(3)] = [0,  0,  -2 | -10]\n\n` +
                     `Augmented Matrix:\n` +
                     `  [  2    0   -2   |   4 ]\n` +
                     `  [  0   0.5  1.5  |   3 ]\n` +
                     `  [  0    0   -2   | -10 ]`,
            explanation: 'Eliminate the y variable from row 1 and row 3 using row 2 as the pivot. This is the key difference in Gauss-Jordan reduction.'
          });

          // Step 3: Eliminate z above the third pivot
          sequence.push({
            type: 'math',
            title: 'STEP 3: ELIMINATE Z FROM ROW 1 AND ROW 2',
            content: `Create zeros in column 3 above the pivot A\u2083\u2083 = -2:\n` +
                     `  • R\u2081 \u2190 R\u2081 \u2212 (-2/-2)R\u2083  \u2192  R\u2081 \u2190 R\u2081 \u2212 R\u2083\n` +
                     `  • R\u2082 \u2190 R\u2082 \u2212 (1.5/-2)R\u2083  \u2192  R\u2082 \u2190 R\u2082 + 0.75R\u2083\n\n` +
                     `Calculations:\n` +
                     `  R\u2081: [2-0,  0-0,  -2-(-2) | 4-(-10)] = [2,  0,  0 | 14]\n` +
                     `  R\u2082: [0+0,  0.5+0,  1.5+0.75(-2) | 3+0.75(-10)] = [0,  0.5,  0 | -4.5]\n\n` +
                     `Augmented Matrix (Diagonal Form):\n` +
                     `  [  2    0    0   |  14  ]\n` +
                     `  [  0   0.5   0   | -4.5 ]\n` +
                     `  [  0    0   -2   | -10  ]`,
            explanation: 'Eliminate the z variable from row 1 and row 2 using row 3 as the pivot, achieving a fully diagonal coefficient matrix.'
          });

          // Step 4: Simplify/Normalize diagonal elements
          sequence.push({
            type: 'math',
            title: 'STEP 4: SIMPLIFY TO FIND VARIABLES',
            content: `Divide each row by its diagonal element to find the variables:\n` +
                     `  • R\u2081 \u2190 R\u2081 / 2      \u2192  x = 14 / 2 = 7\n` +
                     `  • R\u2082 \u2190 R\u2082 / 0.5    \u2192  y = -4.5 / 0.5 = -9\n` +
                     `  • R\u2083 \u2190 R\u2083 / (-2)   \u2192  z = -10 / -2 = 5\n\n` +
                     `Reduced Row Echelon Form [I : Solution]:\n` +
                     `  [  1   0   0  |  7  ]\n` +
                     `  [  0   1   0  | -9  ]\n` +
                     `  [  0   0   1  |  5  ]`,
            explanation: 'Normalize the diagonal entries of the matrix to 1. The constant vector directly contains the solutions.'
          });

          // Step 5: Verification
          sequence.push({
            type: 'math',
            title: 'STEP 5: VERIFY THE SOLUTION',
            content: `Substitute x = 7, y = -9, z = 5 into original equations:\n` +
                     `  1) 2(7) + (-9) + 5 = 14 - 9 + 5 = 10  (Matches Eq 1!)\n` +
                     `  2) 3(7) + 2(-9) + 3(5) = 21 - 18 + 15 = 18  (Matches Eq 2!)\n` +
                     `  3) (7) + 4(-9) + 9(5) = 7 - 36 + 45 = 16  (Matches Eq 3!)\n\n` +
                     `All checks passed successfully!`,
            explanation: 'Substitute the computed solutions back into the original system of equations to verify correctness.'
          });

          // Step 6: Final Result
          sequence.push({
            type: 'result',
            title: 'FINAL ANSWER',
            content: `System solution found:\n` +
                     `  x = 7\n` +
                     `  y = -9\n` +
                     `  z = 5\n\n` +
                     `Decomposed diagonalized augmented system matrix:\n` +
                     `  [  1   0   0  |  7  ]\n` +
                     `  [  0   1   0  | -9  ]\n` +
                     `  [  0   0   1  |  5  ]`,
            explanation: 'Gauss-Jordan elimination complete. The variables have been successfully solved.'
          });
        } else {
          // Gauss-Jordan 3x3 Integer solution
          // Step 0: Problem Statement
          sequence.push({
            type: 'header',
            title: 'PROBLEM STATEMENT',
            content: `Solve the system of equations using Gauss-Jordan Elimination:\n\n` +
                     `   x +  y +  z = 6\n` +
                     `  2x -  y + 3z = 9\n` +
                     `   x + 2y -  z = 2\n\n` +
                     `Let's represent the system as an augmented matrix [A : B]:\n\n` +
                     `  [  1   1   1  |  6 ]\n` +
                     `  [  2  -1   3  |  9 ]\n` +
                     `  [  1   2  -1  |  2 ]`,
            explanation: 'Express the system of linear equations in augmented matrix format.'
          });

          // Step 1: Eliminate x below pivot A11 = 1
          sequence.push({
            type: 'math',
            title: 'STEP 1: ELIMINATE X FROM ROW 2 AND ROW 3',
            content: `Create zeros in column 1 below the pivot A\u2081\u2081 = 1:\n` +
                     `  • R\u2082 \u2190 R\u2082 \u2212 2R\u2081\n` +
                     `  • R\u2083 \u2190 R\u2083 \u2212 R\u2081\n\n` +
                     `Calculations:\n` +
                     `  R\u2082: [2-2(1),  -1-2(1),  3-2(1) | 9-2(6)] = [0,  -3,  1 | -3]\n` +
                     `  R\u2083: [1-1(1),   2-1(1),  -1-1(1) | 2-1(6)] = [0,   1, -2 | -4]\n\n` +
                     `Augmented Matrix:\n` +
                     `  [  1    1    1   |   6 ]\n` +
                     `  [  0   -3    1   |  -3 ]\n` +
                     `  [  0    1   -2   |  -4 ]`,
            explanation: 'Eliminate the x variable from row 2 and row 3 using row 1 as the pivot.'
          });

          // Step 2: Eliminate y above and below pivot A22 = -3
          sequence.push({
            type: 'math',
            title: 'STEP 2: ELIMINATE Y FROM ROW 1 AND ROW 3',
            content: `Create zeros in column 2 above and below the pivot A\u2082\u2082 = -3:\n` +
                     `  • R\u2081 \u2190 R\u2081 \u2212 (1/-3)R\u2082  \u2192  R\u2081 \u2190 R\u2081 + (1/3)R\u2082\n` +
                     `  • R\u2083 \u2190 R\u2083 \u2212 (1/-3)R\u2082  \u2192  R\u2083 \u2190 R\u2083 + (1/3)R\u2082\n\n` +
                     `Calculations:\n` +
                     `  R\u2081 Column 3: 1 + (1/3)(1) = 4/3\n` +
                     `  R\u2081 Constant: 6 + (1/3)(-3) = 5\n` +
                     `  R\u2083 Column 3: -2 + (1/3)(1) = -5/3\n` +
                     `  R\u2083 Constant: -4 + (1/3)(-3) = -5\n\n` +
                     `Augmented Matrix:\n` +
                     `  [  1    0   4/3  |   5  ]\n` +
                     `  [  0   -3    1   |  -3  ]\n` +
                     `  [  0    0  -5/3  |  -5  ]`,
            explanation: 'Eliminate the y variable from row 1 and row 3 using row 2 as the pivot.'
          });

          // Step 3: Eliminate z above pivot A33 = -5/3
          sequence.push({
            type: 'math',
            title: 'STEP 3: ELIMINATE Z FROM ROW 1 AND ROW 2',
            content: `Create zeros in column 3 above the pivot A\u2083\u2083 = -5/3:\n` +
                     `  • R\u2081 \u2190 R\u2081 \u2212 (4/3 / (-5/3))R\u2083  \u2192  R\u2081 \u2190 R\u2081 + 0.8R\u2083\n` +
                     `  • R\u2082 \u2190 R\u2082 \u2212 (1 / (-5/3))R\u2083     \u2192  R\u2082 \u2190 R\u2082 + 0.6R\u2083\n\n` +
                     `Calculations:\n` +
                     `  R\u2081 Constant: 5 + 0.8(-5) = 5 - 4 = 1\n` +
                     `  R\u2082 Constant: -3 + 0.6(-5) = -3 - 3 = -6\n\n` +
                     `Augmented Matrix (Diagonal Form):\n` +
                     `  [  1    0    0   |  1  ]\n` +
                     `  [  0   -3    0   | -6  ]\n` +
                     `  [  0    0  -5/3  | -5  ]`,
            explanation: 'Eliminate the z variable from row 1 and row 2 using row 3 as the pivot to diagonalize the coefficient matrix.'
          });

          // Step 4: Simplify/Normalize diagonal elements
          sequence.push({
            type: 'math',
            title: 'STEP 4: SIMPLIFY TO FIND VARIABLES',
            content: `Divide each row by its diagonal element to find the variables:\n` +
                     `  • R\u2081 \u2190 R\u2081 / 1      \u2192  x = 1 / 1 = 1\n` +
                     `  • R\u2082 \u2190 R\u2082 / (-3)   \u2192  y = -6 / -3 = 2\n` +
                     `  • R\u2083 \u2190 R\u2083 / (-5/3) \u2192  z = -5 / (-5/3) = 3\n\n` +
                     `Reduced Row Echelon Form [I : Solution]:\n` +
                     `  [  1   0   0  |  1  ]\n` +
                     `  [  0   1   0  |  2  ]\n` +
                     `  [  0   0   1  |  3  ]`,
            explanation: 'Normalize the diagonal entries of the matrix to 1. The constants now yield the solutions directly.'
          });

          // Step 5: Verification
          sequence.push({
            type: 'math',
            title: 'STEP 5: VERIFY THE SOLUTION',
            content: `Substitute x = 1, y = 2, z = 3 into original equations:\n` +
                     `  1) (1) + (2) + (3) = 6  (Matches Eq 1!)\n` +
                     `  2) 2(1) - (2) + 3(3) = 2 - 2 + 9 = 9  (Matches Eq 2!)\n` +
                     `  3) (1) + 2(2) - (3) = 1 + 4 - 3 = 2  (Matches Eq 3!)\n\n` +
                     `All checks passed successfully!`,
            explanation: 'Verify the computed system values satisfy all starting linear equations.'
          });

          // Step 6: Final Result
          sequence.push({
            type: 'result',
            title: 'FINAL ANSWER',
            content: `System solution found:\n` +
                     `  x = 1\n` +
                     `  y = 2\n` +
                     `  z = 3\n\n` +
                     `Decomposed diagonalized augmented system matrix:\n` +
                     `  [  1   0   0  |  1  ]\n` +
                     `  [  0   1   0  |  2  ]\n` +
                     `  [  0   0   1  |  3  ]`,
            explanation: 'Gauss-Jordan elimination complete. The variables have been successfully solved.'
          });
        }
      }
    }
    else if (method === "Taylor's Method") {
      const isQ1 = dataset?.id === 'taylor_q1';
      const isQ2 = dataset?.id === 'taylor_q2';

      let x0_val = 0;
      let y0_val = 1;
      let targetX_val = 0.1;
      let odeLabel = "";
      let dy1 = 0, dy2 = 0, dy3 = 0, dy4 = 0;
      let step1Text = "", step2Text = "", step3Text = "", step4Text = "";

      if (isQ1) {
        odeLabel = "dy/dx = x - y²";
        x0_val = 0;
        y0_val = 1;
        targetX_val = 0.1;
        
        dy1 = x0_val - y0_val * y0_val; // -1
        dy2 = 1 - 2 * y0_val * dy1; // 1 - 2(1)(-1) = 3
        dy3 = -2 * (dy1 * dy1 + y0_val * dy2); // -2(1 + 3) = -8
        dy4 = -2 * (3 * dy1 * dy2 + y0_val * dy3); // -2(3*-1*3 + 1*-8) = -2(-9 - 8) = 34

        step1Text = `y' = x - y²\nSubstitute x₀ = ${x0_val}, y₀ = ${y0_val}:\ny'₀ = ${x0_val} - (${y0_val})² = ${dy1}`;
        step2Text = `y'' = d/dx(x - y²) = 1 - 2y·y'\nSubstitute values:\ny''₀ = 1 - 2(${y0_val})(${dy1}) = ${dy2}`;
        step3Text = `y''' = d/dx(1 - 2y·y') = -2(y'·y' + y·y'') = -2((y')² + y·y'')\nSubstitute values:\ny'''₀ = -2((${dy1})² + (${y0_val})(${dy2})) = -2(1 + 3) = ${dy3}`;
        step4Text = `y⁽⁴⁾ = d/dx(-2(y')² - 2y·y'') = -2(2y'·y'' + y'·y'' + y·y''') = -2(3y'·y'' + y·y''')\nSubstitute values:\ny⁽⁴⁾₀ = -2(3(${dy1})(${dy2}) + (${y0_val})(${dy3})) = -2(-9 - 8) = ${dy4}`;
      } else if (isQ2) {
        odeLabel = "dy/dx = x - y";
        x0_val = 0;
        y0_val = 1;
        targetX_val = 0.1;

        dy1 = x0_val - y0_val; // -1
        dy2 = 1 - dy1; // 2
        dy3 = -dy2; // -2
        dy4 = -dy3; // 2

        step1Text = `y' = x - y\nSubstitute x₀ = ${x0_val}, y₀ = ${y0_val}:\ny'₀ = ${x0_val} - ${y0_val} = ${dy1}`;
        step2Text = `y'' = d/dx(x - y) = 1 - y'\nSubstitute values:\ny''₀ = 1 - (${dy1}) = ${dy2}`;
        step3Text = `y''' = d/dx(1 - y') = -y''\nSubstitute values:\ny'''₀ = -(${dy2}) = ${dy3}`;
        step4Text = `y⁽⁴⁾ = d/dx(-y'') = -y'''\nSubstitute values:\ny⁽⁴⁾₀ = -(${dy3}) = ${dy4}`;
      } else {
        // Custom ODE
        const funcKey = rkFuncId || 'y_minus_x';
        x0_val = rkX0 !== undefined ? parseFloat(rkX0) : 0;
        y0_val = rkY0 !== undefined ? parseFloat(rkY0) : 1;
        targetX_val = rkH !== undefined ? parseFloat(rkH) : 0.1;

        if (funcKey === 'y_minus_x') {
          odeLabel = "dy/dx = y - x";
          dy1 = y0_val - x0_val;
          dy2 = dy1 - 1;
          dy3 = dy2;
          dy4 = dy3;

          step1Text = `y' = y - x\nSubstitute x₀ = ${x0_val}, y₀ = ${y0_val}:\ny'₀ = ${y0_val} - ${x0_val} = ${dy1.toFixed(4)}`;
          step2Text = `y'' = d/dx(y - x) = y' - 1\nSubstitute values:\ny''₀ = ${dy1.toFixed(4)} - 1 = ${dy2.toFixed(4)}`;
          step3Text = `y''' = d/dx(y' - 1) = y''\nSubstitute values:\ny'''₀ = ${dy2.toFixed(4)}`;
          step4Text = `y⁽⁴⁾ = d/dx(y'') = y'''\nSubstitute values:\ny⁽⁴⁾₀ = ${dy3.toFixed(4)}`;
        } else if (funcKey === 'x_plus_y') {
          odeLabel = "dy/dx = x + y";
          dy1 = x0_val + y0_val;
          dy2 = 1 + dy1;
          dy3 = dy2;
          dy4 = dy3;

          step1Text = `y' = x + y\nSubstitute x₀ = ${x0_val}, y₀ = ${y0_val}:\ny'₀ = ${x0_val} + ${y0_val} = ${dy1.toFixed(4)}`;
          step2Text = `y'' = d/dx(x + y) = 1 + y'\nSubstitute values:\ny''₀ = 1 + ${dy1.toFixed(4)} = ${dy2.toFixed(4)}`;
          step3Text = `y''' = d/dx(1 + y') = y''\nSubstitute values:\ny'''₀ = ${dy2.toFixed(4)}`;
          step4Text = `y⁽⁴⁾ = d/dx(y'') = y'''\nSubstitute values:\ny⁽⁴⁾₀ = ${dy3.toFixed(4)}`;
        } else if (funcKey === 'minus_2xy') {
          odeLabel = "dy/dx = -2xy";
          dy1 = -2 * x0_val * y0_val;
          dy2 = -2 * y0_val - 2 * x0_val * dy1;
          dy3 = -4 * dy1 - 2 * x0_val * dy2;
          dy4 = -6 * dy2 - 2 * x0_val * dy3;

          step1Text = `y' = -2xy\nSubstitute x₀ = ${x0_val}, y₀ = ${y0_val}:\ny'₀ = -2(${x0_val})(${y0_val}) = ${dy1.toFixed(4)}`;
          step2Text = `y'' = d/dx(-2xy) = -2y - 2xy'\nSubstitute values:\ny''₀ = -2(${y0_val}) - 2(${x0_val})(${dy1.toFixed(4)}) = ${dy2.toFixed(4)}`;
          step3Text = `y''' = d/dx(-2y - 2xy') = -4y' - 2xy''\nSubstitute values:\ny'''₀ = -4(${dy1.toFixed(4)}) - 2(${x0_val})(${dy2.toFixed(4)}) = ${dy3.toFixed(4)}`;
          step4Text = `y⁽⁴⁾ = d/dx(-4y' - 2xy'') = -6y'' - 2xy'''\nSubstitute values:\ny⁽⁴⁾₀ = -6(${dy2.toFixed(4)}) - 2(${x0_val})(${dy3.toFixed(4)}) = ${dy4.toFixed(4)}`;
        } else if (funcKey === 'y_plus_x2') {
          odeLabel = "dy/dx = y + x²";
          dy1 = y0_val + x0_val * x0_val;
          dy2 = dy1 + 2 * x0_val;
          dy3 = dy2 + 2;
          dy4 = dy3;

          step1Text = `y' = y + x²\nSubstitute x₀ = ${x0_val}, y₀ = ${y0_val}:\ny'₀ = ${y0_val} + (${x0_val})² = ${dy1.toFixed(4)}`;
          step2Text = `y'' = d/dx(y + x²) = y' + 2x\nSubstitute values:\ny''₀ = ${dy1.toFixed(4)} + 2(${x0_val}) = ${dy2.toFixed(4)}`;
          step3Text = `y''' = d/dx(y' + 2x) = y'' + 2\nSubstitute values:\ny'''₀ = ${dy2.toFixed(4)} + 2 = ${dy3.toFixed(4)}`;
          step4Text = `y⁽⁴⁾ = d/dx(y'' + 2) = y'''\nSubstitute values:\ny⁽⁴⁾₀ = ${dy3.toFixed(4)}`;
        }
      }

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Given Differential Equation:\n${odeLabel}\n\n` +
                 `Initial Conditions: x₀ = ${x0_val}, y₀ = ${y0_val}\n` +
                 `Evaluate at target: x = ${targetX_val}\n\n` +
                 `Taylor Series Formula:\n` +
                 `y(x) = y₀ + (x - x₀)y'₀ + (x - x₀)²/2! · y''₀ + (x - x₀)³/3! · y'''₀ + (x - x₀)⁴/4! · y⁽⁴⁾₀ + ...`,
        explanation: "We set up Taylor's series expansion at x₀. We need to compute up to the 4th-order derivative at the initial point."
      });

      sequence.push({
        type: 'math',
        title: 'STEP 1: FIND FIRST DERIVATIVE y\'₀',
        content: step1Text,
        explanation: "Substitute the initial coordinates into the differential equation to find y'₀."
      });

      sequence.push({
        type: 'math',
        title: 'STEP 2: FIND SECOND DERIVATIVE y\'\'₀',
        content: step2Text,
        explanation: "Differentiate the ODE equation with respect to x using chain rule, then substitute the known values."
      });

      sequence.push({
        type: 'math',
        title: 'STEP 3: FIND THIRD DERIVATIVE y\'\'\'₀',
        content: step3Text,
        explanation: "Differentiate y'' with respect to x to obtain y''' and evaluate it at the initial point."
      });

      sequence.push({
        type: 'math',
        title: 'STEP 4: FIND FOURTH DERIVATIVE y⁽⁴⁾₀',
        content: step4Text,
        explanation: "Differentiate y''' with respect to x to obtain y⁽⁴⁾ and substitute the values."
      });

      // Calculate final answer terms
      const h_diff = targetX_val - x0_val;
      const term1 = h_diff * dy1;
      const term2 = (h_diff * h_diff * dy2) / 2;
      const term3 = (h_diff * h_diff * h_diff * dy3) / 6;
      const term4 = (h_diff * h_diff * h_diff * h_diff * dy4) / 24;
      const finalY = y0_val + term1 + term2 + term3 + term4;

      sequence.push({
        type: 'math',
        title: 'STEP 5: SUBSTITUTE INTO TAYLOR SERIES',
        content: `y(${targetX_val}) = ${y0_val} + (${h_diff})·(${typeof dy1 === 'number' ? dy1.toFixed(4) : dy1}) + \n` +
                 `         (${h_diff})²/2 · (${typeof dy2 === 'number' ? dy2.toFixed(4) : dy2}) + \n` +
                 `         (${h_diff})³/6 · (${typeof dy3 === 'number' ? dy3.toFixed(4) : dy3}) + \n` +
                 `         (${h_diff})⁴/24 · (${typeof dy4 === 'number' ? dy4.toFixed(4) : dy4})\n\n` +
                 `Terms evaluated:\n` +
                 `  T₁ = ${term1.toFixed(6)}\n` +
                 `  T₂ = ${term2.toFixed(6)}\n` +
                 `  T₃ = ${term3.toFixed(6)}\n` +
                 `  T₄ = ${term4.toFixed(6)}`,
        explanation: "Substitute all computed derivatives and the step size (x - x₀) into the Taylor series formula."
      });

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `y(${targetX_val}) ≈ ${y0_val} + (${term1.toFixed(6)}) + (${term2.toFixed(6)}) + (${term3.toFixed(6)}) + (${term4.toFixed(6)})\n\n` +
                 `y(${targetX_val}) ≈ ${finalY.toFixed(6)}\n\n` +
                 `Therefore, y(${targetX_val}) = ${finalY.toFixed(4)} (correct to 4 decimal places).`,
        explanation: "Sum up all terms in the series. Taylor's Series method computation complete."
      });
    }
    else if (method === "Euler's Method") {
      const isQ1 = dataset?.id === 'euler_q1';
      const isQ2 = dataset?.id === 'euler_q2';

      let x0_val = 0;
      let y0_val = 1;
      let h_val = 0.1;
      let steps_count = 1;
      let expr = (x, y) => y - x;
      let odeLabel = "dy/dx = y - x";

      if (isQ1) {
        odeLabel = "dy/dx = -y";
        expr = (x, y) => -y;
        x0_val = 0;
        y0_val = 1;
        h_val = 0.01;
        steps_count = 4;
      } else if (isQ2) {
        odeLabel = "dy/dx = x + y";
        expr = (x, y) => x + y;
        x0_val = 0;
        y0_val = 0;
        h_val = 0.2;
        steps_count = 3;
      } else {
        // Custom ODE
        const funcKey = rkFuncId || 'y_minus_x';
        if (funcKey === 'y_minus_x') {
          odeLabel = "dy/dx = y - x";
          expr = (x, y) => y - x;
        } else if (funcKey === 'x_plus_y') {
          odeLabel = "dy/dx = x + y";
          expr = (x, y) => x + y;
        } else if (funcKey === 'minus_2xy') {
          odeLabel = "dy/dx = -2xy";
          expr = (x, y) => -2 * x * y;
        } else if (funcKey === 'y_plus_x2') {
          odeLabel = "dy/dx = y + x²";
          expr = (x, y) => y + x * x;
        }
        x0_val = rkX0 !== undefined ? parseFloat(rkX0) : 0;
        y0_val = rkY0 !== undefined ? parseFloat(rkY0) : 1;
        h_val = rkH !== undefined ? parseFloat(rkH) : 0.1;
        steps_count = rkSteps !== undefined ? parseInt(rkSteps) : 1;
      }

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Given Differential Equation:\n  ${odeLabel}\n\n` +
                 `Initial Conditions: x₀ = ${x0_val}, y₀ = ${y0_val}\n` +
                 `Step size h = ${h_val}\n` +
                 `Target: Find y after ${steps_count} step(s) (at x = ${(x0_val + steps_count * h_val).toFixed(4)})\n\n` +
                 `Euler's Iterative Formula:\n` +
                 `  yₙ₊₁ = yₙ + h · f(xₙ, yₙ)`,
        explanation: "We set up Euler's method iteration parameters. Euler's method calculates the next y-value using the tangent slope at the current point."
      });

      let currentX = x0_val;
      let currentY = y0_val;
      let finalPoints = [];

      for (let s = 1; s <= steps_count; s++) {
        const x_start = currentX;
        const y_start = currentY;
        const slope = expr(x_start, y_start);
        const y_next = y_start + h_val * slope;
        const x_next = x_start + h_val;

        sequence.push({
          type: 'math',
          title: `STEP ${s}: COMPUTE y(${x_next.toFixed(4)})`,
          content: `Current Point: (x${s-1}, y${s-1}) = (${x_start.toFixed(4)}, ${y_start.toFixed(4)})\n` +
                   `Evaluate Slope f(x${s-1}, y${s-1}):\n` +
                   `  f(${x_start.toFixed(4)}, ${y_start.toFixed(4)}) = ${slope.toFixed(4)}\n\n` +
                   `Apply Euler's Formula:\n` +
                   `  y${s} = y${s-1} + h · f(x${s-1}, y${s-1})\n` +
                   `  y${s} = ${y_start.toFixed(4)} + ${h_val} · (${slope.toFixed(4)})\n` +
                   `  y${s} = ${y_start.toFixed(4)} + ${(h_val * slope).toFixed(6)}\n` +
                   `  y${s} = ${y_next.toFixed(6)}`,
          explanation: `We calculate the next estimate y${s} using the linear approximation starting at x = ${x_start.toFixed(4)}.`
        });

        currentX = x_next;
        currentY = y_next;
        finalPoints.push({ x: currentX, y: currentY });
      }

      // Final summary
      let summaryContent = `Euler's method completed successfully after ${steps_count} step(s).\n\nCalculated values:\n`;
      finalPoints.forEach((pt, idx) => {
        summaryContent += `  y(${pt.x.toFixed(4)}) ≈ ${pt.y.toFixed(4)} (exact: ${pt.y.toFixed(6)})\n`;
      });

      sequence.push({
        type: 'result',
        title: 'FINAL RESULT SUMMARY',
        content: summaryContent,
        explanation: "Euler's method simulation is now complete. The final calculated coordinate values are displayed above."
      });
    }
    else if (method === "Modified Euler's Method") {
      const isQ1 = dataset?.id === 'me_q1';
      const isQ2 = dataset?.id === 'me_q2';

      let x0_val = 0;
      let y0_val = 1;
      let h_val = 0.1;
      let steps_count = 1;
      let expr = (x, y) => y - x;
      let odeLabel = "dy/dx = y - x";

      if (isQ1) {
        odeLabel = "dy/dx = x² + y";
        expr = (x, y) => x * x + y;
        x0_val = 0;
        y0_val = 1;
        h_val = 0.05;
        steps_count = 2;
      } else if (isQ2) {
        odeLabel = "dy/dx = 2 + √xy";
        expr = (x, y) => 2 + Math.sqrt(x * y);
        x0_val = 1;
        y0_val = 1;
        h_val = 0.5;
        steps_count = 2;
      } else {
        // Custom ODE
        const funcKey = rkFuncId || 'y_minus_x';
        if (funcKey === 'y_minus_x') {
          odeLabel = "dy/dx = y - x";
          expr = (x, y) => y - x;
        } else if (funcKey === 'x_plus_y') {
          odeLabel = "dy/dx = x + y";
          expr = (x, y) => x + y;
        } else if (funcKey === 'minus_2xy') {
          odeLabel = "dy/dx = -2xy";
          expr = (x, y) => -2 * x * y;
        } else if (funcKey === 'y_plus_x2') {
          odeLabel = "dy/dx = y + x²";
          expr = (x, y) => y + x * x;
        } else if (funcKey === 'x2_plus_y') {
          odeLabel = "dy/dx = x² + y";
          expr = (x, y) => x * x + y;
        } else if (funcKey === 'two_plus_sqrt_xy') {
          odeLabel = "dy/dx = 2 + √xy";
          expr = (x, y) => 2 + Math.sqrt(x * y);
        }
        x0_val = rkX0 !== undefined ? parseFloat(rkX0) : 0;
        y0_val = rkY0 !== undefined ? parseFloat(rkY0) : 1;
        h_val = rkH !== undefined ? parseFloat(rkH) : 0.1;
        steps_count = rkSteps !== undefined ? parseInt(rkSteps) : 1;
      }

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Given Differential Equation:\n  ${odeLabel}\n\n` +
                 `Initial Conditions: x₀ = ${x0_val}, y₀ = ${y0_val}\n` +
                 `Step size h = ${h_val}\n` +
                 `Target: Find y after ${steps_count} step(s) (at x = ${(x0_val + steps_count * h_val).toFixed(4)})\n\n` +
                 `Modified Euler's Iterative Formula:\n` +
                 `  yₙ₊₁ = yₙ + h · f(xₙ + h/2, yₙ + (h/2)f(xₙ, yₙ))`,
        explanation: "We set up Modified Euler's method iteration parameters. This method approximates the solution by evaluating the slope at the midpoint of the step using an Euler prediction."
      });

      let currentX = x0_val;
      let currentY = y0_val;
      let finalPoints = [];

      for (let s = 1; s <= steps_count; s++) {
        const x_start = currentX;
        const y_start = currentY;
        
        // Evaluate tangent slope at starting point
        const f0 = expr(x_start, y_start);
        
        // Midpoint coordinates
        const x_mid = x_start + h_val / 2;
        const y_pred = y_start + (h_val / 2) * f0;
        
        // Evaluate slope at midpoint
        const f_mid = expr(x_mid, y_pred);
        
        // Corrector step
        const y_next = y_start + h_val * f_mid;
        const x_next = x_start + h_val;

        sequence.push({
          type: 'math',
          title: `STEP ${s}: COMPUTE y(${x_next.toFixed(4)})`,
          content: `Current Point: (x${s-1}, y${s-1}) = (${x_start.toFixed(4)}, ${y_start.toFixed(4)})\n` +
                   `1. Tangent slope f(x${s-1}, y${s-1}):\n` +
                   `   f(${x_start.toFixed(4)}, ${y_start.toFixed(4)}) = ${f0.toFixed(4)}\n\n` +
                   `2. Midpoint Coordinates:\n` +
                   `   x_mid = x${s-1} + h/2 = ${x_mid.toFixed(4)}\n` +
                   `   y_pred (Euler Prediction) = y${s-1} + (h/2) · f(x${s-1}, y${s-1})\n` +
                   `        = ${y_start.toFixed(4)} + (${h_val}/2) · (${f0.toFixed(4)})\n` +
                   `        = ${y_pred.toFixed(6)}\n\n` +
                   `3. Evaluate Midpoint Slope f(x_mid, y_pred):\n` +
                   `   f(${x_mid.toFixed(4)}, ${y_pred.toFixed(4)}) = ${f_mid.toFixed(4)}\n\n` +
                   `4. Apply Corrector Formula:\n` +
                   `   y${s} = y${s-1} + h · f(x_mid, y_pred)\n` +
                   `   y${s} = ${y_start.toFixed(4)} + ${h_val} · (${f_mid.toFixed(4)})\n` +
                   `   y${s} = ${y_next.toFixed(6)}`,
          explanation: `We predict y at the midpoint x_mid = ${x_mid.toFixed(4)} to be ${y_pred.toFixed(4)}. Then we evaluate the derivative at this midpoint to calculate the corrected next step y${s} = ${y_next.toFixed(4)}.`
        });

        currentX = x_next;
        currentY = y_next;
        finalPoints.push({ x: currentX, y: currentY });
      }

      // Final summary
      let summaryContent = `Modified Euler's method completed successfully after ${steps_count} step(s).\n\nCalculated values:\n`;
      finalPoints.forEach((pt, idx) => {
        summaryContent += `  y(${pt.x.toFixed(4)}) ≈ ${pt.y.toFixed(4)} (exact: ${pt.y.toFixed(6)})\n`;
      });

      sequence.push({
        type: 'result',
        title: 'FINAL RESULT SUMMARY',
        content: summaryContent,
        explanation: "Modified Euler's method simulation is now complete. The final calculated coordinate values are displayed above."
      });
    }

    return sequence;
  }, [func, a, b, n, method, dataset, targetX, direction, bisectionProblemId, bisectionIterations, rkX0, rkY0, rkH, rkSteps, rkFuncId, matMulQuestion]);

  // Reset on IDLE
  useEffect(() => {
    if (playbackState === 'IDLE') {
      setActiveStepIndex(-1);
      setStepComplete(false);
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
      onExplain('Waiting for execution to start...');
    }
  }, [playbackState]);

  // Confetti trigger on FINISHED
  useEffect(() => {
    if (playbackState === 'FINISHED') {
      triggerConfetti();
    }
  }, [playbackState]);

  // Handle NEXT, PREV, SKIP controls
  useEffect(() => {
    if (playbackState === 'NEXT') {
      if (activeStepIndex < steps.length - 1) {
        setStepComplete(false);
        setActiveStepIndex(prev => prev + 1);
      }
      onPlaybackStateChange?.('PAUSED');
    } else if (playbackState === 'PREV') {
      if (activeStepIndex > 0) {
        setStepComplete(false);
        setActiveStepIndex(prev => prev - 1);
      } else if (activeStepIndex === 0) {
        setStepComplete(false);
        setActiveStepIndex(-1);
      }
      onPlaybackStateChange?.('PAUSED');
    } else if (playbackState === 'SKIP') {
      setStepComplete(true);
      setActiveStepIndex(steps.length - 1);
      onPlaybackStateChange?.('FINISHED');
    }
  }, [playbackState, steps.length, activeStepIndex]);

  // Start first step
  useEffect(() => {
    if (playbackState === 'PLAYING' && activeStepIndex === -1) {
      setStepComplete(false);
      setActiveStepIndex(0);
      onExplain(steps[0]?.explanation || '');
    }
  }, [playbackState, activeStepIndex, steps, onExplain]);

  // Update explanation when step changes
  useEffect(() => {
    if (playbackState === 'PLAYING' && activeStepIndex >= 0 && activeStepIndex < steps.length) {
      onExplain(steps[activeStepIndex].explanation);
    }
  }, [activeStepIndex, playbackState, steps, onExplain]);

  // Auto-scroll to bottom of container on content/step change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activeStepIndex, stepComplete]);

  const handleTypingComplete = useCallback(() => {
    setStepComplete(true);

    thinkingTimerRef.current = setTimeout(() => {
      if (activeStepIndex < steps.length - 1) {
        setStepComplete(false);
        setActiveStepIndex(prev => prev + 1);
      } else {
        onFinish();
      }
    }, getDuration(1500));
  }, [activeStepIndex, steps, onFinish, speed]);

  // Render Difference Table Grid Component
  const renderDiffGrid = (xVals, yVals, diffs, operatorSymbol) => {
    return (
      <InteractiveDifferenceTable
        xVals={xVals}
        yVals={yVals}
        diffs={diffs}
        operatorSymbol={operatorSymbol}
        playbackState={playbackState}
        speed={speed}
        handleTypingComplete={handleTypingComplete}
        getDuration={getDuration}
        onExplain={onExplain}
      />
    );
  };

  // ─── Bisection convergence table ─────────────────────────────────────────
  const renderBisGrid = (history) => {
    // Call onComplete when table renders
    setTimeout(() => {
      if (playbackState === 'PLAYING' && !stepComplete) {
        handleTypingComplete();
      }
    }, getDuration(1000));

    if (!history || history.length === 0) return null;
    return (
      <div className="overflow-x-auto w-full border border-[var(--db-card-border)] rounded-xl bg-[var(--db-card-bg)] shadow-sm mt-3">
        <table className="w-full text-center border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-[var(--db-card-bg-elevated)] border-b border-[var(--db-card-border)]">
              {['Iter', 'a', 'b', 'x = (a+b)/2', 'f(a)', 'f(x)', 'Sign Check'].map((h, i) => (
                <th key={i} className="py-2.5 px-3 border-r border-[var(--db-card-border)] font-bold text-[var(--db-text-secondary)] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((row, rIdx) => (
              <tr key={rIdx} className={`${rIdx % 2 === 0 ? 'bg-[var(--db-card-bg)]' : 'bg-[var(--db-card-bg-elevated)]/40'} border-b border-[var(--db-card-border)]/50 hover:bg-[var(--db-card-bg-elevated)]/80 transition`}>
                <td className="py-1.5 px-3 border-r border-[var(--db-card-border)] font-bold text-emerald-500">{row.iter}</td>
                <td className="py-1.5 px-3 border-r border-[var(--db-card-border)] text-[var(--db-text-secondary)]">{row.a}</td>
                <td className="py-1.5 px-3 border-r border-[var(--db-card-border)] text-[var(--db-text-secondary)]">{row.b}</td>
                <td className="py-1.5 px-3 border-r border-[var(--db-card-border)] font-bold text-blue-500">{row.x}</td>
                <td className="py-1.5 px-3 border-r border-[var(--db-card-border)] text-[var(--db-text-secondary)]">{row.fa}</td>
                <td className="py-1.5 px-3 border-r border-[var(--db-card-border)] text-[var(--db-text-secondary)]">{row.fx}</td>
                <td className={`py-1.5 px-3 border-r border-[var(--db-card-border)] font-bold ${row.sign === 'Root!' ? 'text-emerald-500' : 'text-amber-500'}`}>{row.sign}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Progress bar width
  const progress = activeStepIndex >= 0 ? ((activeStepIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      
      {/* Top: Progress bar + step counter */}
      <div className="shrink-0 px-8 pt-6 pb-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {activeStepIndex >= 0 
              ? `Step ${activeStepIndex + 1} of ${steps.length}` 
              : 'Ready to execute'}
          </span>
          {playbackState === 'FINISHED' && (
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">✓ Complete</span>
          )}
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Scrollable container for step list */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scroll-smooth"
      >
        {activeStepIndex === -1 && playbackState === 'IDLE' && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-300 py-12">
            <div className="text-6xl mb-4">🧮</div>
            <p className="text-lg font-bold text-slate-400">Click "Start Solving" to begin</p>
            <p className="text-sm text-slate-300 mt-1">The AI notebook will write out each step live</p>
          </div>
        )}

        {steps.map((step, idx) => {
          // Only show steps that have been reached
          if (idx > activeStepIndex) return null;

          const isCurrent = idx === activeStepIndex;

          return (
            <motion.div
              key={`step-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl mx-auto"
            >
              {/* Step title */}
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">
                {step.title}
              </div>

              {/* Step content card */}
              {step.type === 'diffTable' ? (
                <div className="bg-[var(--db-card-bg)] p-6 rounded-2xl border-l-4 border-emerald-500 border-y border-r border-[var(--db-card-border)]/50 shadow-md">
                  <span className="text-xs font-bold text-[var(--db-text-secondary)] font-sans">Constructed Difference Grid:</span>
                  {renderDiffGrid(step.xVals, step.yVals, step.diffs, step.operatorSymbol)}
                </div>
              ) : step.type === 'bisTable' ? (
                <div className="bg-[var(--db-card-bg)] p-6 rounded-2xl border-l-4 border-emerald-500 border-y border-r border-[var(--db-card-border)]/50 shadow-md">
                  <span className="text-xs font-bold text-[var(--db-text-secondary)] font-sans">Bisection Convergence iterations Table:</span>
                  {renderBisGrid(step.history)}
                </div>
              ) : step.type === 'result' ? (
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl shadow-lg text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/30 relative overflow-hidden animate-pulse-subtle">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-bold text-lg animate-bounce">✓</span>
                    <span className="text-xs font-black tracking-[0.2em] uppercase text-emerald-100">Calculation Complete ✓</span>
                  </div>
                  <TypewriterStep
                    text={step.content}
                    isActive={isCurrent && playbackState === 'PLAYING' && !stepComplete}
                    speed={speed * 0.75}
                    isMath={false}
                    forceShowFullText={idx < activeStepIndex || playbackState === 'FINISHED'}
                    onComplete={handleTypingComplete}
                  />
                  <div className="mt-4 text-emerald-200 text-sm font-medium">
                    {method === 'Matrix Multiplication' || method === 'Symmetric & Skew Symmetric' || method === 'Inverse Matrix' || method === 'Gauss Elimination' || method === 'Gauss-Jordan Elimination' ? 'Linear Algebra complete.' : method.includes('Rule') ? 'Numerical integration complete.' : method.includes('Bisection') ? 'Bisection Method root finding complete.' : method.includes('Taylor') ? "Taylor's Method ODE solving complete." : method.includes('Modified Euler') ? "Modified Euler's Method ODE solving complete." : method.includes('Euler') ? "Euler's Method ODE solving complete." : 'Numerical interpolation/differentiation/ODE complete.'}
                  </div>
                </div>
              ) : step.type === 'header' ? (
                <div className="bg-gradient-to-br from-[var(--db-card-bg-elevated)] to-[var(--db-card-bg)] p-6 rounded-2xl border border-[var(--db-card-border)] shadow-sm flex flex-col gap-3">
                  <TypewriterStep
                    text={step.content}
                    isActive={isCurrent && playbackState === 'PLAYING' && !stepComplete}
                    speed={speed * 2}
                    isMath={false}
                    forceShowFullText={idx < activeStepIndex || playbackState === 'FINISHED'}
                    onComplete={handleTypingComplete}
                  />
                  {step.isNewton && (
                    <div className="overflow-x-auto w-full border border-[var(--db-card-border)] rounded-xl bg-[var(--db-card-bg)] shadow-sm mt-2">
                      <table className="w-full text-center border-collapse text-xs font-sans">
                        <tbody>
                          <tr className="border-b border-[var(--db-card-border)]">
                            <td className="py-2.5 px-3 bg-[var(--db-card-bg-elevated)] border-r border-[var(--db-card-border)] font-bold text-[var(--db-text-secondary)] min-w-[120px] text-left">{step.xLabel}</td>
                            {step.xVals.map((val, idx) => (
                              <td key={idx} className="py-2.5 px-3 border-r border-[var(--db-card-border)] font-semibold text-[var(--db-text-main)]">{val}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 bg-[var(--db-card-bg-elevated)] border-r border-[var(--db-card-border)] font-bold text-[var(--db-text-secondary)] min-w-[120px] text-left">{step.yLabel}</td>
                            {step.yVals.map((val, idx) => (
                              <td key={idx} className="py-2.5 px-3 border-r border-[var(--db-card-border)] font-semibold text-[var(--db-text-main)]">{val}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[var(--db-card-bg)] p-6 rounded-2xl border-l-4 border-emerald-500 border-y border-r border-[var(--db-card-border)]/50 shadow-md">
                  <TypewriterStep
                    text={step.content}
                    isActive={isCurrent && playbackState === 'PLAYING' && !stepComplete}
                    speed={speed}
                    isMath={true}
                    forceShowFullText={idx < activeStepIndex || playbackState === 'FINISHED'}
                    onComplete={handleTypingComplete}
                  />
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Thinking dots if currently computing the next step */}
        {stepComplete && playbackState === 'PLAYING' && activeStepIndex < steps.length - 1 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-slate-400 text-sm font-mono mt-4 max-w-2xl mx-auto pl-2"
          >
            <div className="flex gap-1">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-2 h-2 rounded-full bg-emerald-400" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }} className="w-2 h-2 rounded-full bg-emerald-400" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.6 }} className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            Computing next step...
          </motion.div>
        )}
      </div>
    </div>
  );
}
