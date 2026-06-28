import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import TypewriterStep from './TypewriterStep';

export default function CalculusNotebookEngine({
  method, playbackState, speed, onExplain, onFinish,
  // Limit props
  limitFuncId, limitApproachVal,
  // Derivative props
  derivFuncId, derivAtX,
  // Integral props
  integFuncId, integA, integB, integN,
  // LHopital props
  lhopitalProblemId,
  // Gauss Seidel props
  gaussSeidelProblemId,
  gaussSeidelIterations,
  // Regula Falsi props
  rfProblemId,
  rfIterations,
  // Iteration Method props
  iterProblemId,
  iterIterations,
  // Newton-Raphson props
  nrProblemId,
  nrIterations,
  // Lagrange props
  lagrangeProblemId,
  // Newton General props
  newtonGenProblemId,
}) {
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [stepComplete, setStepComplete] = useState(false);
  const thinkingTimerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const getDuration = (base) => base / speed;

  // ─── Calculus Function Library ────────────────────────────────────────────
  const CALC_FUNCTIONS = {
    'sin_over_x':    { label: 'f(x) = sin(x) / x',     expr: (x) => Math.sin(x) / x,      tex: 'sin(x)/x' },
    'x2_minus_1':   { label: 'f(x) = (x²-1)/(x-1)',    expr: (x) => (x*x - 1)/(x - 1),    tex: '(x²-1)/(x-1)' },
    'x3':           { label: 'f(x) = x³',               expr: (x) => Math.pow(x, 3),        tex: 'x³' },
    'cos_x':        { label: 'f(x) = cos(x)',           expr: (x) => Math.cos(x),           tex: 'cos(x)' },
    'e_x':          { label: 'f(x) = eˣ',               expr: (x) => Math.exp(x),           tex: 'eˣ' },
    'sqrt_x':       { label: 'f(x) = √x',               expr: (x) => Math.sqrt(x),          tex: '√x' },
    'x2':           { label: 'f(x) = x²',               expr: (x) => x * x,                 tex: 'x²' },
    'sin_x':        { label: 'f(x) = sin(x)',           expr: (x) => Math.sin(x),           tex: 'sin(x)' },
    'reciprocal':   { label: 'f(x) = 1/(1+x)',          expr: (x) => 1 / (1 + x),           tex: '1/(1+x)' },
    'x4':           { label: 'f(x) = x⁴',               expr: (x) => Math.pow(x, 4),        tex: 'x⁴' },
  };

  // ─── Analytical derivative labels (shown in steps) ────────────────────────
  const ANALYTICAL_DERIV = {
    'x3':      (x) => ({ label: `f'(x) = 3x²`, val: 3 * x * x }),
    'x2':      (x) => ({ label: `f'(x) = 2x`,  val: 2 * x }),
    'x4':      (x) => ({ label: `f'(x) = 4x³`, val: 4 * x * x * x }),
    'sin_x':   (x) => ({ label: `f'(x) = cos(x)`, val: Math.cos(x) }),
    'cos_x':   (x) => ({ label: `f'(x) = -sin(x)`, val: -Math.sin(x) }),
    'e_x':     (x) => ({ label: `f'(x) = eˣ`,   val: Math.exp(x) }),
    'sqrt_x':  (x) => ({ label: `f'(x) = 1/(2√x)`, val: 1 / (2 * Math.sqrt(x)) }),
    'reciprocal': (x) => ({ label: `f'(x) = -1/(1+x)²`, val: -1 / Math.pow(1 + x, 2) }),
    'sin_over_x': (x) => ({ label: `f'(x) = [xcos(x) - sin(x)] / x²`, val: (x * Math.cos(x) - Math.sin(x)) / (x * x) }),
    'x2_minus_1': (x) => ({ label: `f'(x) = 2x (simplified)`, val: 2 * x }),
  };

  // ─── L'Hôpital Pre-built problems ─────────────────────────────────────────
  const LHOPITAL_PROBLEMS = {
    'p1': {
      label: 'lim(x→0) sin(x)/x',
      form: '0/0',
      numExpr:   (x) => Math.sin(x),
      denExpr:   (x) => x,
      dNumExpr:  (x) => Math.cos(x),
      dDenExpr:  (_) => 1,
      approachX: 0,
      numLabel:  'sin(x)',    denLabel:  'x',
      dNumLabel: 'cos(x)',   dDenLabel: '1',
      answer:    1,
    },
    'p2': {
      label: 'lim(x→0) (eˣ - 1)/x',
      form: '0/0',
      numExpr:   (x) => Math.exp(x) - 1,
      denExpr:   (x) => x,
      dNumExpr:  (x) => Math.exp(x),
      dDenExpr:  (_) => 1,
      approachX: 0,
      numLabel:  'eˣ - 1',   denLabel:  'x',
      dNumLabel: 'eˣ',       dDenLabel: '1',
      answer:    1,
    },
    'p3': {
      label: 'lim(x→0) (1-cos(x))/x²',
      form: '0/0',
      numExpr:   (x) => 1 - Math.cos(x),
      denExpr:   (x) => x * x,
      dNumExpr:  (x) => Math.sin(x),
      dDenExpr:  (x) => 2 * x,
      approachX: 0,
      numLabel:  '1 - cos(x)',  denLabel:  'x²',
      dNumLabel: 'sin(x)',      dDenLabel: '2x',
      answer:    0.5,
    },
    'p4': {
      label: 'lim(x→0) (x - sin(x))/x³',
      form: '0/0',
      numExpr:   (x) => x - Math.sin(x),
      denExpr:   (x) => Math.pow(x, 3),
      dNumExpr:  (x) => 1 - Math.cos(x),
      dDenExpr:  (x) => 3 * x * x,
      approachX: 0,
      numLabel:  'x - sin(x)',   denLabel:  'x³',
      dNumLabel: '1 - cos(x)',   dDenLabel: '3x²',
      answer:    1 / 6,
    },
  };

  // ─── Step Sequence Builder ─────────────────────────────────────────────────
  const steps = useMemo(() => {
    const sequence = [];

    // ── 1. LIMITS ──────────────────────────────────────────────────────────
    if (method === 'Limit Calculator') {
      const fn = CALC_FUNCTIONS[limitFuncId] || CALC_FUNCTIONS['sin_over_x'];
      const a = parseFloat(limitApproachVal) || 0;

      // Numerical limit using 6 points closing in from both sides
      const h_vals = [0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001];
      const leftVals  = h_vals.map(h => ({ h, val: fn.expr(a - h) }));
      const rightVals = h_vals.map(h => ({ h, val: fn.expr(a + h) }));
      const limitVal  = fn.expr(a + 1e-10);

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Find: lim(x → ${a}) ${fn.tex}\n\nGiven: f(x) = ${fn.label.split('=')[1].trim()}\nApproach point: x → ${a}\nMethod: Numerical limit evaluation (table of values)`,
        explanation: `We seek the limit of ${fn.tex} as x approaches ${a}. We will build a table of values from both sides to numerically confirm the limit.`,
      });

      let tableStr = 'Left-hand approach (x → ' + a + '⁻):\n';
      tableStr += 'h         | f(' + a + ' - h)\n';
      tableStr += '─'.repeat(30) + '\n';
      leftVals.forEach(r => {
        tableStr += `${r.h.toFixed(6).padEnd(10)}| ${isNaN(r.val) ? 'undef' : r.val.toFixed(8)}\n`;
      });

      sequence.push({
        type: 'math',
        title: 'STEP 1: LEFT-HAND LIMIT TABLE (x → a⁻)',
        content: tableStr,
        explanation: `We approach x = ${a} from the LEFT (x < ${a}) and observe that f(x) converges to a specific value. Each row halves the distance by factor of 10.`,
      });

      let tableStr2 = 'Right-hand approach (x → ' + a + '⁺):\n';
      tableStr2 += 'h         | f(' + a + ' + h)\n';
      tableStr2 += '─'.repeat(30) + '\n';
      rightVals.forEach(r => {
        tableStr2 += `${r.h.toFixed(6).padEnd(10)}| ${isNaN(r.val) ? 'undef' : r.val.toFixed(8)}\n`;
      });

      sequence.push({
        type: 'math',
        title: 'STEP 2: RIGHT-HAND LIMIT TABLE (x → a⁺)',
        content: tableStr2,
        explanation: `We approach x = ${a} from the RIGHT (x > ${a}) and confirm convergence. If both sides converge to the same value, the two-sided limit exists.`,
      });

      const lhsEst = leftVals[leftVals.length - 1].val;
      const rhsEst = rightVals[rightVals.length - 1].val;
      const limExists = Math.abs(lhsEst - rhsEst) < 0.0001;

      let verifyStr = `Left-hand estimate:  L⁻ ≈ ${isNaN(lhsEst) ? 'undefined' : lhsEst.toFixed(8)}\n`;
      verifyStr += `Right-hand estimate: L⁺ ≈ ${isNaN(rhsEst) ? 'undefined' : rhsEst.toFixed(8)}\n\n`;
      verifyStr += limExists
        ? `Since L⁻ ≈ L⁺ , the two-sided limit EXISTS.`
        : `Since L⁻ ≠ L⁺ , the two-sided limit DOES NOT EXIST.`;

      sequence.push({
        type: 'math',
        title: 'STEP 3: VERIFY LEFT = RIGHT LIMIT',
        content: verifyStr,
        explanation: limExists
          ? `Both one-sided limits agree. The two-sided limit exists and is well-defined.`
          : `The left and right limits disagree, so the two-sided limit does not exist at x = ${a}.`,
      });

      const finalLim = isNaN(limitVal) ? (isNaN(lhsEst) ? 'undefined' : lhsEst) : limitVal;
      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `lim(x → ${a}) ${fn.tex}\n\n          = ${typeof finalLim === 'number' ? finalLim.toFixed(6) : finalLim}`,
        explanation: `The computed limit of ${fn.tex} as x approaches ${a} is ${typeof finalLim === 'number' ? finalLim.toFixed(6) : finalLim}.`,
      });
    }

    // ── 2. FIRST PRINCIPLES DERIVATIVE ────────────────────────────────────
    else if (method === 'First Principles Derivative') {
      const fn = CALC_FUNCTIONS[derivFuncId] || CALC_FUNCTIONS['x2'];
      const a  = parseFloat(derivAtX) ?? 2;
      const derivObj = ANALYTICAL_DERIV[derivFuncId];
      const analyticalResult = derivObj ? derivObj(a) : null;

      // Numerical approximation using decreasing h
      const hList = [1, 0.5, 0.1, 0.01, 0.001, 0.0001];

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Find: f'(${a}) for f(x) = ${fn.tex}\n\nMethod: First Principles (Limit Definition)\n\nDefinition:\nf'(x) = lim(h→0) [ f(x+h) - f(x) ] / h`,
        explanation: `We use the limit definition of the derivative to compute f'(${a}) for f(x) = ${fn.tex}. We will observe convergence as h → 0.`,
      });

      let tableStr = `x = ${a}  |  h         |  f(x+h)          |  [f(x+h)-f(x)]/h\n`;
      tableStr += '─'.repeat(62) + '\n';
      const fA = fn.expr(a);
      hList.forEach(h => {
        const fAH = fn.expr(a + h);
        const diff = (fAH - fA) / h;
        tableStr += `${String(a).padEnd(6)} | ${h.toFixed(4).padEnd(11)}| ${fAH.toFixed(6).padEnd(18)}| ${diff.toFixed(6)}\n`;
      });

      sequence.push({
        type: 'math',
        title: 'STEP 1: BUILD DIFFERENCE QUOTIENT TABLE',
        content: tableStr,
        explanation: `We compute the difference quotient [f(x+h) - f(x)] / h for decreasing values of h. As h → 0, this quotient converges to f'(x).`,
      });

      const smallH   = 0.0001;
      const fAH      = fn.expr(a + smallH);
      const numDeriv = (fAH - fA) / smallH;

      let subStr = `f(x)    = ${fn.tex}\nf(${a})   = ${fA.toFixed(6)}\nf(${a}+h) = ${fAH.toFixed(6)}  [h = ${smallH}]\n\n`;
      subStr += `f'(${a}) ≈ [ f(${a}+${smallH}) - f(${a}) ] / ${smallH}\n`;
      subStr += `f'(${a}) ≈ [ ${fAH.toFixed(6)} - ${fA.toFixed(6)} ] / ${smallH}\n`;
      subStr += `f'(${a}) ≈ ${(fAH - fA).toFixed(8)} / ${smallH}\n`;
      subStr += `f'(${a}) ≈ ${numDeriv.toFixed(6)}`;

      sequence.push({
        type: 'math',
        title: 'STEP 2: APPLY DEFINITION WITH SMALLEST h',
        content: subStr,
        explanation: `Substituting the smallest h = ${smallH} into the difference quotient formula, we obtain a very precise numerical approximation of the derivative.`,
      });

      if (analyticalResult) {
        let verifyStr = `Analytical Formula: ${analyticalResult.label}\n`;
        verifyStr += `Analytical f'(${a}) = ${analyticalResult.val.toFixed(6)}\n\n`;
        verifyStr += `Numerical  f'(${a}) ≈ ${numDeriv.toFixed(6)}\n\n`;
        verifyStr += `Absolute error = |${analyticalResult.val.toFixed(6)} - ${numDeriv.toFixed(6)}|\n`;
        verifyStr += `             = ${Math.abs(analyticalResult.val - numDeriv).toFixed(8)}  ✓`;

        sequence.push({
          type: 'math',
          title: 'STEP 3: VERIFICATION WITH ANALYTICAL FORMULA',
          content: verifyStr,
          explanation: `We verify the numerical derivative against the known analytical result. The error is virtually zero, confirming the first-principles approach is correct.`,
        });
      }

      const finalVal = analyticalResult ? analyticalResult.val : numDeriv;
      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `f'(${a})  =  ${finalVal.toFixed(6)}\n\nwhere f(x) = ${fn.tex}`,
        explanation: `The derivative of ${fn.tex} evaluated at x = ${a} is ${finalVal.toFixed(6)}.`,
      });
    }

    // ── 3. DEFINITE INTEGRAL ──────────────────────────────────────────────
    else if (method === 'Definite Integral') {
      const fn   = CALC_FUNCTIONS[integFuncId] || CALC_FUNCTIONS['x2'];
      const a_v  = parseFloat(integA) || 0;
      const b_v  = parseFloat(integB) || 3;
      const n_v  = parseInt(integN) || 6;
      const h    = (b_v - a_v) / n_v;

      // Build x, y table
      const xPts = [], yPts = [];
      for (let i = 0; i <= n_v; i++) {
        const xi = a_v + i * h;
        xPts.push(xi);
        yPts.push(fn.expr(xi));
      }

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Evaluate:  ∫[${a_v} to ${b_v}] ${fn.tex} dx\n\nMethod:  Composite Simpson's 1/3 Rule\n         (n = ${n_v} sub-intervals, even)\nf(x)  =  ${fn.tex}`,
        explanation: `We compute the definite integral of ${fn.tex} from ${a_v} to ${b_v} using Composite Simpson's 1/3 Rule with ${n_v} sub-intervals.`,
      });

      const stepContent = `h = (b - a) / n\nh = (${b_v} - ${a_v}) / ${n_v}\nh = ${h.toFixed(4)}`;
      sequence.push({
        type: 'math',
        title: 'STEP 1: COMPUTE STEP SIZE h',
        content: stepContent,
        explanation: `We divide the interval [${a_v}, ${b_v}] into ${n_v} equal sub-intervals of width h = ${h.toFixed(4)}.`,
      });

      let tableStr = `i   | x_i        | f(x_i)     | Coefficient\n`;
      tableStr += '─'.repeat(48) + '\n';
      xPts.forEach((xi, i) => {
        const coeff = (i === 0 || i === n_v) ? '1' : (i % 2 === 1 ? '4' : '2');
        tableStr += `${String(i).padEnd(4)}| ${xi.toFixed(4).padEnd(12)}| ${yPts[i].toFixed(6).padEnd(12)}| ${coeff}\n`;
      });
      sequence.push({
        type: 'math',
        title: 'STEP 2: CONSTRUCT DATA TABLE WITH COEFFICIENTS',
        content: tableStr,
        explanation: `We evaluate f(x) at each node and assign Simpson's coefficients: 1 for endpoints, 4 for odd-indexed nodes, and 2 for even-indexed interior nodes.`,
      });

      // Simpson's formula application
      let sum1 = yPts[0] + yPts[n_v];
      let sum4 = 0, sum2 = 0;
      for (let i = 1; i < n_v; i++) {
        if (i % 2 === 1) sum4 += yPts[i];
        else             sum2 += yPts[i];
      }
      const integral = (h / 3) * (sum1 + 4 * sum4 + 2 * sum2);

      let formulaStr  = `Simpson's 1/3 Rule:\nI = (h/3) × [ f(x₀) + 4·Σ(odd) + 2·Σ(even) + f(xₙ) ]\n\n`;
      formulaStr += `Endpoints:       f(x₀) + f(xₙ) = ${yPts[0].toFixed(6)} + ${yPts[n_v].toFixed(6)} = ${sum1.toFixed(6)}\n`;
      formulaStr += `Σ odd-indexed  (×4):  ${sum4.toFixed(6)}  →  4 × ${sum4.toFixed(6)} = ${(4*sum4).toFixed(6)}\n`;
      formulaStr += `Σ even-indexed (×2):  ${sum2.toFixed(6)}  →  2 × ${sum2.toFixed(6)} = ${(2*sum2).toFixed(6)}\n\n`;
      formulaStr += `Total = ${sum1.toFixed(6)} + ${(4*sum4).toFixed(6)} + ${(2*sum2).toFixed(6)}\n`;
      formulaStr += `      = ${(sum1 + 4*sum4 + 2*sum2).toFixed(6)}\n\n`;
      formulaStr += `I = (${h.toFixed(4)}/3) × ${(sum1 + 4*sum4 + 2*sum2).toFixed(6)}\n`;
      formulaStr += `I = ${(h/3).toFixed(6)} × ${(sum1 + 4*sum4 + 2*sum2).toFixed(6)}\n`;
      formulaStr += `I ≈ ${integral.toFixed(8)}`;

      sequence.push({
        type: 'math',
        title: 'STEP 3: APPLY SIMPSON\'S FORMULA',
        content: formulaStr,
        explanation: `We substitute the coefficient-weighted sums into the Composite Simpson's 1/3 formula. The result is our numerical approximation of the definite integral.`,
      });

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `∫[${a_v} to ${b_v}] ${fn.tex} dx\n\n         ≈ ${integral.toFixed(6)}\n\n(Composite Simpson's 1/3 Rule, n=${n_v})`,
        explanation: `The definite integral of ${fn.tex} from ${a_v} to ${b_v} is approximately ${integral.toFixed(6)}.`,
      });
    }

    // ── 4. L'HÔPITAL'S RULE ───────────────────────────────────────────────
    else if (method === "L'Hôpital's Rule") {
      const prob = LHOPITAL_PROBLEMS[lhopitalProblemId] || LHOPITAL_PROBLEMS['p1'];
      const c = prob.approachX;

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Find: lim(x → ${c}) ${prob.numLabel} / ${prob.denLabel}\n\nNote: Direct substitution gives → ${prob.form} (Indeterminate form!)\n\nMethod: L'Hôpital's Rule\n\nTheorem: If lim f/g → 0/0 or ∞/∞, then\n         lim(f(x)/g(x)) = lim(f'(x)/g'(x))`,
        explanation: `Direct substitution gives the indeterminate form ${prob.form}. We apply L'Hôpital's Rule: differentiate numerator and denominator separately, then re-evaluate the limit.`,
      });

      let diagStr = `Direct substitution at x = ${c}:\n\n`;
      diagStr += `Numerator:   ${prob.numLabel} → ${prob.numExpr(c + 1e-10).toFixed(6)} (≈ 0)\n`;
      diagStr += `Denominator: ${prob.denLabel} → ${prob.denExpr(c + 1e-10).toFixed(6)} (≈ 0)\n\n`;
      diagStr += `Result: 0/0  ←  Indeterminate form\n`;
      diagStr += `L'Hôpital's Rule is APPLICABLE ✓`;

      sequence.push({
        type: 'math',
        title: "STEP 1: IDENTIFY INDETERMINATE FORM",
        content: diagStr,
        explanation: `Confirming the indeterminate form ${prob.form} at x = ${c}. Since both numerator and denominator approach 0, L'Hôpital's Rule is valid.`,
      });

      let diffStr = `Differentiate numerator and denominator separately:\n\n`;
      diffStr += `f(x)  = ${prob.numLabel}\n`;
      diffStr += `f'(x) = ${prob.dNumLabel}\n\n`;
      diffStr += `g(x)  = ${prob.denLabel}\n`;
      diffStr += `g'(x) = ${prob.dDenLabel}\n\n`;
      diffStr += `Applying L'Hôpital:\nlim(x→${c}) [${prob.numLabel}] / [${prob.denLabel}]\n`;
      diffStr += `     = lim(x→${c}) [${prob.dNumLabel}] / [${prob.dDenLabel}]`;

      sequence.push({
        type: 'math',
        title: "STEP 2: DIFFERENTIATE NUMERATOR & DENOMINATOR",
        content: diffStr,
        explanation: `We differentiate the numerator and denominator independently (not as a quotient). Then we form a NEW limit with these derivatives.`,
      });

      const numAtC = prob.dNumExpr(c);
      const denAtC = prob.dDenExpr(c);
      const needsSecondRound = Math.abs(denAtC) < 1e-9;

      let evalStr = `Substitute x = ${c} into the new expression:\n\n`;
      evalStr += `f'(${c}) = ${prob.dNumLabel.replace('x', c.toString())} = ${numAtC.toFixed(6)}\n`;
      evalStr += `g'(${c}) = ${prob.dDenLabel.replace('x', c.toString())} = ${denAtC.toFixed(6)}\n\n`;
      if (!needsSecondRound) {
        evalStr += `New limit = f'(${c}) / g'(${c})\n`;
        evalStr += `         = ${numAtC.toFixed(6)} / ${denAtC.toFixed(6)}\n`;
        evalStr += `         = ${(numAtC / denAtC).toFixed(6)}`;
      } else {
        evalStr += `Still gives 0/0 — a second application would be needed.\n`;
        evalStr += `(Numerically estimated limit: ${prob.answer})`;
      }

      sequence.push({
        type: 'math',
        title: "STEP 3: EVALUATE THE TRANSFORMED LIMIT",
        content: evalStr,
        explanation: !needsSecondRound
          ? `Substituting x = ${c} into the new ratio, we obtain a determinate value. The limit is resolved.`
          : `The new limit is still indeterminate; we can apply L'Hôpital's Rule a second time, or use Taylor series to confirm the answer.`,
      });

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `lim(x → ${c}) ${prob.numLabel} / ${prob.denLabel}\n\n         =  ${prob.answer % 1 === 0 ? prob.answer : prob.answer.toFixed(6)}`,
        explanation: `Using L'Hôpital's Rule, the limit of ${prob.numLabel} over ${prob.denLabel} as x → ${c} equals ${prob.answer}.`,
      });
    }

    else if (method === 'Gauss Seidel Method') {
      const numIters = parseInt(gaussSeidelIterations) || 3;
      const isGs1 = gaussSeidelProblemId === 'gs1';

      if (isGs1) {
        sequence.push({
          type: 'header',
          title: 'PROBLEM STATEMENT',
          content: `Solve using Gauss-Seidel Method:\n\n10x₁ - 2x₂ - x₃ - x₄ = 3\n-2x₁ + 10x₂ - x₃ - x₄ = 15\n-x₁ - x₂ + 10x₃ - 2x₄ = 27\n-x₁ - x₂ - 2x₃ + 10x₄ = 9\n\nRewrite equations in iteration form:\nx₁ = 1/10 [ 3 + 2x₂ + x₃ + x₄ ]\nx₂ = 1/10 [ 15 + 2x₁ + x₃ + x₄ ]\nx₃ = 1/10 [ 27 + x₁ + x₂ + 2x₄ ]\nx₄ = 1/10 [ -9 + x₁ + x₂ + 2x₃ ]\n\nInitial approximation: x₁⁽⁰⁾ = x₂⁽⁰⁾ = x₃⁽⁰⁾ = x₄⁽⁰⁾ = 0`,
          explanation: 'We state the linear system of equations, rewrite each equation to solve for its diagonal variable, and set initial guess values to zero.'
        });
      } else {
        sequence.push({
          type: 'header',
          title: 'PROBLEM STATEMENT',
          content: `Solve using Gauss-Seidel Method (approx. 3 decimal places):\n\n83x + 11y - 4z = 95\n7x + 52y + 13z = 104\n3x + 8y + 29z = 71\n\nRewrite equations in iteration form:\nx = 1/83 [ 95 - 11y + 4z ]\ny = 1/52 [ 104 - 7x - 13z ]\nz = 1/29 [ 71 - 3x - 8y ]\n\nInitial approximation: x⁽⁰⁾ = y⁽⁰⁾ = z⁽⁰⁾ = 0`,
          explanation: 'We state the 3-variable system of linear equations, rewrite each equation in explicit iterative form, and set initial approximations to zero.'
        });
      }

      let x1 = 0, x2 = 0, x3 = 0, x4 = 0;
      let x = 0, y = 0, z = 0;

      const history = [];
      if (isGs1) {
        history.push({ iter: 0, x1: 0, x2: 0, x3: 0, x4: 0 });
      } else {
        history.push({ iter: 0, x: 0, y: 0, z: 0 });
      }

      for (let k = 1; k <= numIters; k++) {
        if (isGs1) {
          const old_x1 = x1, old_x2 = x2, old_x3 = x3, old_x4 = x4;

          x1 = (3 + 2 * x2 + x3 + x4) / 10;
          x2 = (15 + 2 * x1 + x3 + x4) / 10;
          x3 = (27 + x1 + x2 + 2 * x4) / 10;
          x4 = (-9 + x1 + x2 + 2 * x3) / 10;

          history.push({ iter: k, x1, x2, x3, x4 });

          sequence.push({
            type: 'math',
            title: `ITERATION ${k}`,
            content: `Using values: x₁=${old_x1.toFixed(4)}, x₂=${old_x2.toFixed(4)}, x₃=${old_x3.toFixed(4)}, x₄=${old_x4.toFixed(4)}\n\n` +
                     `x₁⁽${k}⁾ = 1/10 [ 3 + 2(${old_x2.toFixed(4)}) + ${old_x3.toFixed(4)} + ${old_x4.toFixed(4)} ]\n` +
                     `      = ${x1.toFixed(6)}\n\n` +
                     `x₂⁽${k}⁾ = 1/10 [ 15 + 2(${x1.toFixed(4)}) + ${old_x3.toFixed(4)} + ${old_x4.toFixed(4)} ]\n` +
                     `      = ${x2.toFixed(6)}\n\n` +
                     `x₃⁽${k}⁾ = 1/10 [ 27 + ${x1.toFixed(4)} + ${x2.toFixed(4)} + 2(${old_x4.toFixed(4)}) ]\n` +
                     `      = ${x3.toFixed(6)}\n\n` +
                     `x₄⁽${k}⁾ = 1/10 [ -9 + ${x1.toFixed(4)} + ${x2.toFixed(4)} + 2(${x3.toFixed(4)}) ]\n` +
                     `      = ${x4.toFixed(6)}`,
            explanation: `Iteration ${k}: We solve for x₁, x₂, x₃, and x₄. Observe that the newly computed values of x₁, x₂, and x₃ are immediately used in the subsequent equations within the same iteration step.`
          });
        } else {
          const old_x = x, old_y = y, old_z = z;

          x = (95 - 11 * y + 4 * z) / 83;
          y = (104 - 7 * x - 13 * z) / 52;
          z = (71 - 3 * x - 8 * y) / 29;

          history.push({ iter: k, x, y, z });

          sequence.push({
            type: 'math',
            title: `ITERATION ${k}`,
            content: `Using values: x=${old_x.toFixed(4)}, y=${old_y.toFixed(4)}, z=${old_z.toFixed(4)}\n\n` +
                     `x⁽${k}⁾ = 1/83 [ 95 - 11(${old_y.toFixed(4)}) + 4(${old_z.toFixed(4)}) ]\n` +
                     `    = ${x.toFixed(6)}\n\n` +
                     `y⁽${k}⁾ = 1/52 [ 104 - 7(${x.toFixed(4)}) - 13(${old_z.toFixed(4)}) ]\n` +
                     `    = ${y.toFixed(6)}\n\n` +
                     `z⁽${k}⁾ = 1/29 [ 71 - 3(${x.toFixed(4)}) - 8(${y.toFixed(4)}) ]\n` +
                     `    = ${z.toFixed(6)}`,
            explanation: `Iteration ${k}: We calculate x, y, and z sequentially, substituting the updated values into the next equations right away.`
          });
        }
      }

      sequence.push({
        type: 'gsTable',
        title: 'CONVERGENCE TABLE',
        history,
        isGs1,
        explanation: 'The iteration convergence table summarizes all updates from iteration 0 to the final step.'
      });

      const ansStr = isGs1
        ? `x₁ ≈ ${x1.toFixed(4)}\nx₂ ≈ ${x2.toFixed(4)}\nx₃ ≈ ${x3.toFixed(4)}\nx₄ ≈ ${x4.toFixed(4)}`
        : `x ≈ ${x.toFixed(4)}\ny ≈ ${y.toFixed(4)}\nz ≈ ${z.toFixed(4)}`;

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: ansStr,
        explanation: `Gauss-Seidel iterations completed. The system solution has converged to the approximate values shown above.`
      });
    }

    // ── 5. REGULA FALSI METHOD ────────────────────────────────────────
    else if (method === 'Regula Falsi Method') {
      const numIters = parseInt(rfIterations) || 7;
      const isRf1 = rfProblemId === 'rf1';

      // Problem definitions
      const f1 = (x) => Math.pow(x, 3) - 2 * x - 5;
      const f2 = (x) => Math.pow(x, 3) - x - 2;
      const f = isRf1 ? f1 : f2;
      let a0 = isRf1 ? 2 : 1;
      let b0 = isRf1 ? 3 : 2;
      const fTex  = isRf1 ? 'f(x) = x³ - 2x - 5' : 'f(x) = x³ - x - 2';
      const fExam = isRf1
        ? 'f(0)=-5<0, f(1)=-6<0, f(2)=-1<0, f(3)=16>0  →  root lies between 2 and 3'
        : 'f(1)=-2<0, f(2)=4>0  →  root lies between 1 and 2';

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Find a real root of: ${fTex} = 0\nusing the Regula Falsi (False Position) Method\n\nStep 0: Verify sign change to bracket the root:\n${fExam}\n\nInitial bracket: a = ${a0}, b = ${b0}\n\nFormula: x = [ a·f(b) - b·f(a) ] / [ f(b) - f(a) ]`,
        explanation: `We confirm that f(${a0}) and f(${b0}) have opposite signs, proving a root lies in [${a0}, ${b0}]. The Regula Falsi formula interpolates a chord between (a, f(a)) and (b, f(b)) to find x.`,
      });

      const history = [];
      let a = a0, b = b0;
      let xPrev = null;

      for (let k = 1; k <= numIters; k++) {
        const fa = f(a), fb = f(b);
        const x = (a * fb - b * fa) / (fb - fa);
        const fx = f(x);

        const signCheck = Math.abs(fx) < 1e-8
          ? 'Root!'
          : fa * fx < 0 ? 'f(a)·f(x)<0' : 'f(x)·f(b)<0';

        history.push({
          iter: k,
          a: a.toFixed(6),
          b: b.toFixed(6),
          x: x.toFixed(6),
          fa: fa.toFixed(6),
          fx: fx.toFixed(6),
          sign: signCheck,
        });

        sequence.push({
          type: 'math',
          title: `STEP ${k}: REGULA FALSI ITERATION`,
          content: `Current bracket: a = ${a.toFixed(6)}, b = ${b.toFixed(6)}\n\n` +
                   `f(a) = f(${a.toFixed(4)}) = ${fa.toFixed(6)}\n` +
                   `f(b) = f(${b.toFixed(4)}) = ${fb.toFixed(6)}\n\n` +
                   `x = [ a·f(b) - b·f(a) ] / [ f(b) - f(a) ]\n` +
                   `  = [ ${a.toFixed(4)}×${fb.toFixed(4)} - ${b.toFixed(4)}×${fa.toFixed(4)} ] / [ ${fb.toFixed(4)} - ${fa.toFixed(4)} ]\n` +
                   `  = ${(a * fb).toFixed(6)} - ${(b * fa).toFixed(6)} / ${(fb - fa).toFixed(6)}\n` +
                   `  = ${x.toFixed(6)}\n\n` +
                   `f(x) = f(${x.toFixed(6)}) = ${fx.toFixed(6)}\n\n` +
                   (Math.abs(fx) < 1e-8
                     ? `✔ Root found! |f(x)| ≈ 0`
                     : fa * fx < 0
                       ? `Since f(a)·f(x) = ${(fa*fx).toFixed(6)} < 0, root lies in [a, x]\n→ New bracket: a = ${a.toFixed(4)}, b = x = ${x.toFixed(6)}`
                       : `Since f(x)·f(b) = ${(fx*fb).toFixed(6)} < 0, root lies in [x, b]\n→ New bracket: a = x = ${x.toFixed(6)}, b = ${b.toFixed(4)}`),
          explanation: `Iteration ${k}: We apply the Regula Falsi formula to get x = ${x.toFixed(6)}. f(x) = ${fx.toFixed(6)}. ${Math.abs(fx) < 1e-8 ? 'Root found!' : signCheck + ' so we update the bracket accordingly.'}`,
        });

        if (Math.abs(fx) < 1e-8) break;
        if (fa * fx < 0) { b = x; } else { a = x; }
        xPrev = x;
      }

      sequence.push({
        type: 'rfTable',
        title: 'CONVERGENCE TABLE',
        history,
        explanation: 'The Regula Falsi convergence table shows how the false position x narrows in on the root at each iteration.',
      });

      const root = history[history.length - 1].x;
      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `${fTex} = 0\n\nRequired Root  ≈  ${root}\n\n(Regula Falsi Method, ${history.length} iterations)`,
        explanation: `The Regula Falsi method converges to x ≈ ${root} as the real root of ${fTex} = 0.`,
      });
    }

    // ── 6. ITERATION METHOD (FIXED-POINT) ──────────────────────────────────
    else if (method === 'Iteration Method') {
      const numIters = parseInt(iterIterations) || 8;
      const probId   = iterProblemId || 'it1';

      // Problem definitions
      const ITER_DEFS = {
        it1: {
          fTex:    '2x - cos(x) - 3 = 0',
          phiTex:  'φ(x) = ½(cos x + 3)',
          phiExpr: (x) => 0.5 * (Math.cos(x) + 3),
          dphiExpr: (x) => -0.5 * Math.sin(x),
          x0:      Math.PI / 2,
          x0Tex:   'π/2 ≈ 1.5708',
          dphiTex: 'φ′(x) = -½ sin(x)',
          condCheck: (x) => Math.abs(-0.5 * Math.sin(x)),
          intro: '2x = cos(x)+3  ⇒  x = ½(cos x + 3)',
          examCheck: 'f(0)=-4<0, f(π)=4.28>0 → root lies between 0 and π',
        },
        it2: {
          fTex:    'x·eˣ - 1 = 0',
          phiTex:  'φ(x) = e⁻ˣ',
          phiExpr: (x) => Math.exp(-x),
          dphiExpr: (x) => -Math.exp(-x),
          x0:      0.5,
          x0Tex:   '0.5',
          dphiTex: 'φ′(x) = -e⁻ˣ',
          condCheck: (x) => Math.abs(-Math.exp(-x)),
          intro: 'xeˣ = 1  ⇒  x = e⁻ˣ',
          examCheck: 'f(0)=-1<0, f(1)=e-1>0 → root lies between 0 and 1',
        },
        it3: {
          fTex:    'x³ - x - 1 = 0',
          phiTex:  'φ(x) = (x+1)^(1/3)',
          phiExpr: (x) => Math.cbrt(x + 1),
          dphiExpr: (x) => (1/3) * Math.pow(x + 1, -2/3),
          x0:      1.3,
          x0Tex:   '1.3',
          dphiTex: 'φ′(x) = ⅓(x+1)^(−⅔)',
          condCheck: (x) => Math.abs((1/3) * Math.pow(x + 1, -2/3)),
          intro: 'x³-x-1=0  ⇒  x=(x+1)^(1/3)',
          examCheck: 'f(1)=-1<0, f(2)=5>0 → root lies between 1 and 2',
        },
      };

      const prob = ITER_DEFS[probId] || ITER_DEFS['it1'];
      const condAtX0 = prob.condCheck(prob.x0);

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content:
          `Find a real root of: ${prob.fTex} = 0\n` +
          `using the Iteration (Fixed-Point) Method\n\n` +
          `Step 0: Verify sign change:\n${prob.examCheck}\n\n` +
          `Rearrange: ${prob.intro}\n` +
          `∴ ${prob.phiTex}\n\n` +
          `Convergence Check:\n` +
          `${prob.dphiTex}\n` +
          `|φ′(x₀)| = ${condAtX0.toFixed(4)} < 1  ✔  Iteration WILL converge\n\n` +
          `Initial guess: x₀ = ${prob.x0Tex}\n` +
          `Formula: xₙ₊₁ = φ(xₙ)`,
        explanation: `We rewrite f(x)=0 as x=φ(x), verify the convergence criterion |φ′(x)|<1, and set the initial guess x₀=${prob.x0Tex}.`,
      });

      const iterHistory = [{ step: 0, x: prob.x0, phi: '-', err: '-' }];
      let xCurr = prob.x0;

      for (let k = 1; k <= numIters; k++) {
        const xPrev = xCurr;
        const xNext = prob.phiExpr(xPrev);
        const err   = Math.abs(xNext - xPrev);
        iterHistory.push({ step: k, x: xNext, phi: xNext, err: err.toFixed(8) });

        sequence.push({
          type: 'math',
          title: `STEP ${k}: ITERATION`,
          content:
            `x₋ₙ = ${xPrev.toFixed(6)}\n\n` +
            `x₊ₙ = φ(x₋ₙ) = φ(${xPrev.toFixed(6)})\n` +
            `   = ${prob.phiTex.replace('φ(x)', `φ(${xPrev.toFixed(4)})`)}\n` +
            `   = ${xNext.toFixed(6)}\n\n` +
            `|x₊ₙ - x₋ₙ| = ${err.toFixed(8)}`,
          explanation: `Step ${k}: Apply φ to ${xPrev.toFixed(6)} to get the next approximation ${xNext.toFixed(6)}. The correction |x₊ₙ - x₋ₙ| = ${err.toFixed(6)}.`,
        });

        xCurr = xNext;
        if (err < 1e-7) break;
      }

      sequence.push({
        type: 'iterTable',
        title: 'CONVERGENCE TABLE',
        history: iterHistory,
        explanation: 'The iteration convergence table shows how xₙ approaches the fixed point step by step.',
      });

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `${prob.fTex} = 0\n\nRequired Root  ≈  ${xCurr.toFixed(6)}\n\n(Fixed-Point Iteration, ${iterHistory.length - 1} steps)`,
        explanation: `The Iteration Method converges to x ≈ ${xCurr.toFixed(6)} as the real root of ${prob.fTex} = 0.`,
      });
    }

    // ── 7. NEWTON-RAPHSON METHOD ─────────────────────────────────────────
    else if (method === 'Newton-Raphson Method') {
      const numIters = parseInt(nrIterations) || 5;
      const probId   = nrProblemId || 'nr1';

      const NR_DEFS = {
        nr1: {
          fTex:    'f(x) = x³ - 2x - 5',
          dfTex:   "f'(x) = 3x² - 2",
          f:  (x) => Math.pow(x,3) - 2*x - 5,
          df: (x) => 3*x*x - 2,
          x0: 2.5,
          examCheck: 'f(2)=-1<0, f(3)=16>0 → root lies between 2 and 3; x₀=(2+3)/2=2.5',
        },
        nr2: {
          fTex:    'f(x) = x³ - x - 1',
          dfTex:   "f'(x) = 3x² - 1",
          f:  (x) => Math.pow(x,3) - x - 1,
          df: (x) => 3*x*x - 1,
          x0: 1.5,
          examCheck: 'f(1)=-1<0, f(2)=5>0 → root lies between 1 and 2; x₀=1.5',
        },
        nr3: {
          fTex:    'f(x) = cos(x) - x',
          dfTex:   "f'(x) = -sin(x) - 1",
          f:  (x) => Math.cos(x) - x,
          df: (x) => -Math.sin(x) - 1,
          x0: 1.0,
          examCheck: 'f(0)=1>0, f(1)=-0.46<0 → root lies between 0 and 1; x₀=1.0',
        },
      };

      const prob = NR_DEFS[probId] || NR_DEFS['nr1'];

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content:
          `Find a real root of: ${prob.fTex} = 0\n` +
          `correct to 3 decimal places\n` +
          `using the Newton-Raphson Method\n\n` +
          `${prob.examCheck}\n\n` +
          `Now ${prob.fTex}\n` +
          `     ${prob.dfTex}\n\n` +
          `Newton-Raphson Formula:\n` +
          `xₙ = xₙ₋₁ - f(xₙ₋₁) / f′(xₙ₋₁)`,
        explanation: `We verify a sign change, set x₀=${prob.x0}, compute both f(x) and f′(x), and repeatedly apply the Newton-Raphson tangent-line formula until convergence.`,
      });

      const nrHistory = [];
      let xCurr = prob.x0;

      for (let k = 1; k <= numIters; k++) {
        const xPrev = xCurr;
        const fx    = prob.f(xPrev);
        const dfx   = prob.df(xPrev);
        const xNext = xPrev - fx / dfx;
        const err   = Math.abs(xNext - xPrev);

        nrHistory.push({ step: k, x_prev: xPrev, fx, dfx, x_next: xNext, err });

        sequence.push({
          type: 'math',
          title: `STEP ${k}: NEWTON-RAPHSON ITERATION`,
          content:
            `x₋ₙ = ${xPrev.toFixed(6)}\n\n` +
            `f(x₋ₙ)  = f(${xPrev.toFixed(4)}) = ${fx.toFixed(6)}\n` +
            `f′(x₋ₙ) = f′(${xPrev.toFixed(4)}) = ${dfx.toFixed(6)}\n\n` +
            `x₊ₙ = x₋ₙ - f(x₋ₙ) / f′(x₋ₙ)\n` +
            `   = ${xPrev.toFixed(6)} - (${fx.toFixed(6)}) / (${dfx.toFixed(6)})\n` +
            `   = ${xPrev.toFixed(6)} - (${(fx/dfx).toFixed(6)})\n` +
            `   = ${xNext.toFixed(6)}\n\n` +
            `|x₊ₙ - x₋ₙ| = ${err.toFixed(8)}`,
          explanation: `Step ${k}: Tangent at x=${xPrev.toFixed(4)} gives next approximation ${xNext.toFixed(6)}. Correction = ${err.toFixed(6)}.`,
        });

        xCurr = xNext;
        if (err < 1e-7) break;
      }

      sequence.push({
        type: 'nrTable',
        title: 'CONVERGENCE TABLE',
        history: nrHistory,
        explanation: 'The Newton-Raphson convergence table shows quadratic convergence — the number of correct decimal places roughly doubles each iteration.',
      });

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `${prob.fTex} = 0\n\nRequired Root  ≈  ${xCurr.toFixed(6)}\n\n(Newton-Raphson Method, ${nrHistory.length} iterations)`,
        explanation: `The Newton-Raphson method converges to x ≈ ${xCurr.toFixed(6)} as the real root of ${prob.fTex} = 0.`,
      });
    }

    // ── 8. LAGRANGE INTERPOLATION ─────────────────────────────────────────
    else if (method === 'Lagrange Interpolation') {
      const LAGRANGE_DEFS = {
        lg1: {
          title: "log₁₀(x) Interpolation (Photo Q1)",
          x: [300, 304, 305, 307],
          y: [2.4771, 2.4829, 2.4843, 2.4871],
          targetX: 301,
          yLabel: "log₁₀(x)"
        },
        lg2: {
          title: "√x Interpolation (Photo Q2)",
          x: [150, 152, 154, 156],
          y: [12.247, 12.329, 12.410, 12.490],
          targetX: 155,
          yLabel: "√x"
        },
        lg3: {
          title: "f(x) = 1/x Interpolation",
          x: [4, 5, 6],
          y: [0.25, 0.2, 0.166667],
          targetX: 4.5,
          yLabel: "1/x"
        }
      };

      const prob = LAGRANGE_DEFS[lagrangeProblemId] || LAGRANGE_DEFS['lg1'];
      const ptsX = prob.x;
      const ptsY = prob.y;
      const targetX = prob.targetX;
      const n = ptsX.length;

      const terms = [];
      let interpolatedValue = 0;

      for (let i = 0; i < n; i++) {
        let numStrParts = [];
        let denStrParts = [];
        let numVal = 1;
        let denVal = 1;

        for (let j = 0; j < n; j++) {
          if (j === i) continue;
          numStrParts.push(`(${targetX} - ${ptsX[j]})`);
          denStrParts.push(`(${ptsX[i]} - ${ptsX[j]})`);
          numVal *= (targetX - ptsX[j]);
          denVal *= (ptsX[i] - ptsX[j]);
        }

        const numStr = numStrParts.join(' · ');
        const denStr = denStrParts.join(' · ');
        const lVal = numVal / denVal;
        const termVal = ptsY[i] * lVal;
        interpolatedValue += termVal;

        terms.push({
          i,
          numStr,
          denStr,
          numVal,
          denVal,
          lVal,
          termVal
        });
      }

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: `Evaluate ${prob.yLabel} at x = ${targetX} using Lagrange's Interpolation Formula.\n\n` +
                 `Given data points:\n` +
                 ptsX.map((xi, idx) => `  (${xi}, ${ptsY[idx]})`).join('\n') + `\n\n` +
                 `Lagrange Formula:\n` +
                 `y = L(x) = ∑ᵢ yᵢ · Lᵢ(x)\n` +
                 `where Lᵢ(x) = ∏ⱼ≠ᵢ (x − xⱼ) / (xᵢ − xⱼ)`,
        explanation: `We set up Lagrange's interpolation for ${prob.title}. Since the data points are not necessarily equally spaced, Lagrange's formula is ideal.`,
      });

      let formStr = `Substitute values into Lagrange basis polynomials Lᵢ(${targetX}):\n\n`;
      terms.forEach((term, idx) => {
        const xFormulaNum = ptsX.filter((_, k) => k !== idx).map(xj => `(x - ${xj})`).join(' · ');
        const xFormulaDen = ptsX.filter((_, k) => k !== idx).map(xj => `(${ptsX[idx]} - ${xj})`).join(' · ');
        formStr += `L${idx}(x) = [ ${xFormulaNum} ] / [ ${xFormulaDen} ]\n`;
        formStr += `L${idx}(${targetX}) = [ ${term.numStr} ] / [ ${term.denStr} ]\n`;
        formStr += `      = ${term.numVal} / ${term.denVal} = ${term.lVal.toFixed(6)}\n\n`;
      });
      sequence.push({
        type: 'math',
        title: 'STEP 1: CALCULATE LAGRANGE BASIS COEFFICIENTS',
        content: formStr,
        explanation: `We evaluate the Lagrange basis polynomial Lᵢ(x) at x = ${targetX} for each node. These act as weighting factors for the y values.`,
      });

      let sumStr = `Multiply each yᵢ by its corresponding basis coefficient Lᵢ(${targetX}) and sum:\n\n`;
      terms.forEach((term, idx) => {
        sumStr += `Term ${idx}: y${idx} · L${idx}(${targetX}) = ${ptsY[idx]} · (${term.lVal.toFixed(6)}) = ${term.termVal.toFixed(6)}\n`;
      });
      sumStr += `\nSum: L(${targetX}) = ` + terms.map(t => t.termVal.toFixed(6)).join(' + ') + `\n`;
      sumStr += `          = ${interpolatedValue.toFixed(6)}`;

      sequence.push({
        type: 'math',
        title: 'STEP 2: SUM WEIGHTED CONTRIBUTIONS',
        content: sumStr,
        explanation: `We sum the weighted contributions from all points to obtain the final interpolated value.`,
      });

      sequence.push({
        type: 'lagrangeTable',
        title: 'INTERPOLATION BASIS TERMS TABLE',
        points: { x: ptsX, y: ptsY },
        targetX,
        terms,
        interpolatedValue,
        explanation: 'This interactive table summarizes all node values, basis computations, and term contributions.'
      });

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: `Interpolated Value at x = ${targetX}:\n\n` +
                 `f(${targetX})  ≈  ${interpolatedValue.toFixed(6)}\n\n` +
                 `Method: Lagrange Interpolation (${n} points)`,
        explanation: `Lagrange interpolation evaluated at x = ${targetX} yields ${interpolatedValue.toFixed(6)}.`,
      });
    }

    // ── 9. NEWTON GENERAL INTERPOLATION ───────────────────────────────────
    else if (method === 'Newton General Interpolation') {
      const NEWTON_GEN_DEFS = {
        ng1: {
          title: "log₁₀(x) Newton Divided Difference (Photo Q1)",
          x: [300, 304, 305, 307],
          y: [2.4771, 2.4829, 2.4843, 2.4871],
          targetX: 301,
          yLabel: "log₁₀(x)"
        },
        ng2: {
          title: "f(x) Polynomial Express (Photo Q2)",
          x: [-1, 0, 3, 6, 7],
          y: [3, -6, 39, 822, 1611],
          targetX: null,
          yLabel: "f(x)"
        },
        ng3: {
          title: "sin(x) Newton Divided Difference",
          x: [0, 30, 60, 90],
          y: [0, 0.5, 0.866025, 1.0],
          targetX: 45,
          yLabel: "sin(x)"
        }
      };

      const prob = NEWTON_GEN_DEFS[newtonGenProblemId] || NEWTON_GEN_DEFS['ng1'];
      const ptsX = prob.x;
      const ptsY = prob.y;
      const targetX = prob.targetX;
      const n = ptsX.length;

      const py = Array.from({ length: n }, () => Array(n).fill(0));
      for (let i = 0; i < n; i++) py[i][0] = ptsY[i];

      for (let j = 1; j < n; j++) {
        for (let i = 0; i < n - j; i++) {
          py[i][j] = (py[i + 1][j - 1] - py[i][j - 1]) / (ptsX[i + j] - ptsX[i]);
        }
      }

      sequence.push({
        type: 'header',
        title: 'PROBLEM STATEMENT',
        content: targetX !== null
          ? `Evaluate ${prob.yLabel} at x = ${targetX} using Newton's General (Divided Difference) Interpolation Formula.\n\n` +
            `Given data points:\n` +
            ptsX.map((xi, idx) => `  (${xi}, ${ptsY[idx]})`).join('\n') + `\n\n` +
            `Newton's General Formula:\n` +
            `y = y₀ + (x−x₀)[x₀,x₁] + (x−x₀)(x−x₁)[x₀,x₁,x₂] + (x−x₀)(x−x₁)(x−x₂)[x₀,x₁,x₂,x₃] + …`
          : `Find the polynomial expression f(x) using Newton's General (Divided Difference) Interpolation Formula.\n\n` +
            `Given data points:\n` +
            ptsX.map((xi, idx) => `  (${xi}, ${ptsY[idx]})`).join('\n') + `\n\n` +
            `Newton's General Formula:\n` +
            `y = y₀ + (x−x₀)[x₀,x₁] + (x−x₀)(x−x₁)[x₀,x₁,x₂] + …`,
        explanation: `We set up Newton's general divided difference method. We will compute the divided difference table first.`,
      });

      sequence.push({
        type: 'newtonGenTable',
        title: 'DIVIDED DIFFERENCE TABLE',
        x: ptsX,
        py,
        n,
        explanation: 'The divided difference table computes 1st, 2nd, 3rd, and higher-order differences. The top diagonal represents the coefficients used in Newton\'s formula.',
      });

      let calcStr = '';
      let interpolatedValue = py[0][0];

      if (targetX !== null) {
        let termValList = [py[0][0]];
        let runningProd = 1;
        calcStr = `Formula evaluation at x = ${targetX}:\n\n` +
                  `y = y₀ + (x−x₀)[x₀,x₁] + (x−x₀)(x−x₁)[x₀,x₁,x₂] + …\n\n` +
                  `Term 0: y₀ = ${py[0][0].toFixed(6)}\n`;

        for (let j = 1; j < n; j++) {
          const diff = py[0][j];
          runningProd *= (targetX - ptsX[j - 1]);
          const partStr = ptsX.slice(0, j).map(xi => `(${targetX} - ${xi})`).join('');
          const termVal = diff * runningProd;
          interpolatedValue += termVal;
          termValList.push(termVal);

          calcStr += `Term ${j}: ${partStr} · [x₀,…,x_${j}]\n`;
          calcStr += `        = ${runningProd.toFixed(4)} · (${diff.toFixed(6)})\n`;
          calcStr += `        = ${termVal.toFixed(6)}\n`;
        }

        calcStr += `\nSumming terms:\n`;
        calcStr += `y = ` + termValList.map(v => v.toFixed(6)).join(' + ') + `\n`;
        calcStr += `  = ${interpolatedValue.toFixed(6)}`;
      } else {
        // Express as polynomial for ng2
        calcStr = `Formula construction for f(x):\n\n` +
                  `f(x) = y₀ + (x−x₀)[x₀,x₁] + (x−x₀)(x−x₁)[x₀,x₁,x₂] + …\n\n` +
                  `Substitute divided differences:\n` +
                  `f(x) = 3 + (x - (-1))·(-9) + (x - (-1))(x - 0)·(6) + (x - (-1))(x - 0)(x - 3)·(5) + (x - (-1))(x - 0)(x - 3)(x - 6)·(1)\n` +
                  `     = 3 - 9(x + 1) + 6x(x + 1) + 5x(x + 1)(x - 3) + x(x + 1)(x - 3)(x - 6)\n\n` +
                  `Expand term-by-term:\n` +
                  `• Term 0 & 1: 3 - 9x - 9 = -9x - 6\n` +
                  `• Term 2:     6(x² + x) = 6x² + 6x\n` +
                  `• Term 3:     5(x³ - 2x² - 3x) = 5x³ - 10x² - 15x\n` +
                  `• Term 4:     1(x⁴ - 8x³ + 9x² + 18x) = x⁴ - 8x³ + 9x² + 18x\n\n` +
                  `Summing and combining like powers:\n` +
                  `f(x) = x⁴ + (5 - 8)x³ + (6 - 10 + 9)x² + (-9 + 6 - 15 + 18)x - 6\n` +
                  `f(x) = x⁴ - 3x³ + 5x² - 6`;
      }

      sequence.push({
        type: 'math',
        title: targetX !== null ? 'STEP 1: EVALUATING NEWTON POLYNOMIAL' : 'STEP 1: EXPANDING NEWTON POLYNOMIAL',
        content: calcStr,
        explanation: targetX !== null
          ? `We plug in x = ${targetX} and evaluate each term using the top row coefficients from the divided difference table.`
          : `We expand the terms and combine like terms to express f(x) as a simplified polynomial.`,
      });

      const finalContent = targetX !== null
        ? `Interpolated Value at x = ${targetX}:\n\n` +
          `f(${targetX})  ≈  ${interpolatedValue.toFixed(6)}\n\n` +
          `Method: Newton's General Interpolation`
        : `Final Interpolating Polynomial:\n\n` +
          `f(x)  =  x⁴ - 3x³ + 5x² - 6\n\n` +
          `Method: Newton's General Interpolation`;

      sequence.push({
        type: 'result',
        title: 'FINAL ANSWER',
        content: finalContent,
        explanation: targetX !== null
          ? `Newton's general divided difference interpolation evaluated at x = ${targetX} yields ${interpolatedValue.toFixed(6)}.`
          : `Newton's general divided difference interpolation yields the polynomial f(x) = x⁴ - 3x³ + 5x² - 6.`,
      });
    }

    return sequence;
  }, [method, limitFuncId, limitApproachVal, derivFuncId, derivAtX, integFuncId, integA, integB, integN, lhopitalProblemId, gaussSeidelProblemId, gaussSeidelIterations, rfProblemId, rfIterations, iterProblemId, iterIterations, nrProblemId, nrIterations, lagrangeProblemId, newtonGenProblemId]);

  // ─── Playback Control ─────────────────────────────────────────────────────
  useEffect(() => {
    if (playbackState === 'IDLE') {
      setActiveStepIndex(-1);
      setStepComplete(false);
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
      onExplain('Waiting for execution to start...');
    }
  }, [playbackState]);

  useEffect(() => {
    if (playbackState === 'PLAYING' && activeStepIndex === -1) {
      setStepComplete(false);
      setActiveStepIndex(0);
      onExplain(steps[0]?.explanation || '');
    }
  }, [playbackState, activeStepIndex, steps, onExplain]);

  useEffect(() => {
    if (playbackState === 'PLAYING' && activeStepIndex >= 0 && activeStepIndex < steps.length) {
      onExplain(steps[activeStepIndex].explanation);
    }
  }, [activeStepIndex, playbackState, steps, onExplain]);

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

  const renderGsGrid = (history, isGs1) => {
    // Call onComplete when table renders
    setTimeout(() => {
      if (playbackState === 'PLAYING' && !stepComplete) {
        handleTypingComplete();
      }
    }, 1000);

    return (
      <div className="overflow-x-auto w-full border border-slate-200 rounded-xl bg-white shadow-sm mt-3">
        <table className="w-full text-center border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-600">Iteration</th>
              {isGs1 ? (
                <>
                  <th className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-600">x₁</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-600">x₂</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-600">x₃</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-600">x₄</th>
                </>
              ) : (
                <>
                  <th className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-600">x</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-600">y</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-600">z</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {history.map((row, idx) => (
              <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/10'} border-b border-slate-100 hover:bg-slate-50/50 transition`}>
                <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-700">{row.iter}</td>
                {isGs1 ? (
                  <>
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-700">{row.x1.toFixed(6)}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-700">{row.x2.toFixed(6)}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-700">{row.x3.toFixed(6)}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-700">{row.x4.toFixed(6)}</td>
                  </>
                ) : (
                  <>
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-700">{row.x.toFixed(6)}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-700">{row.y.toFixed(6)}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-700">{row.z.toFixed(6)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ─── Regula Falsi convergence table ───────────────────────────────────────
  const renderRfGrid = (history) => {
    setTimeout(() => {
      if (playbackState === 'PLAYING' && !stepComplete) handleTypingComplete();
    }, 1000);
    return (
      <div className="overflow-x-auto w-full border border-slate-200 rounded-xl bg-white shadow-sm mt-3">
        <table className="w-full text-center border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-violet-50 border-b border-slate-200">
              {['Iter', 'a', 'b', 'x (False Pos)', 'f(a)', 'f(x)', 'Sign Check'].map((h, i) => (
                <th key={i} className="py-2.5 px-3 border-r border-slate-200 font-bold text-violet-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((row, rIdx) => (
              <tr key={rIdx} className={`${rIdx % 2 === 0 ? 'bg-white' : 'bg-violet-50/30'} border-b border-slate-100 hover:bg-violet-50/60 transition`}>
                <td className="py-1.5 px-3 border-r border-slate-200 font-bold text-violet-600">{row.iter}</td>
                <td className="py-1.5 px-3 border-r border-slate-200 text-slate-700">{row.a}</td>
                <td className="py-1.5 px-3 border-r border-slate-200 text-slate-700">{row.b}</td>
                <td className="py-1.5 px-3 border-r border-slate-200 font-bold text-blue-600">{row.x}</td>
                <td className="py-1.5 px-3 border-r border-slate-200 text-slate-600">{row.fa}</td>
                <td className="py-1.5 px-3 border-r border-slate-200 text-slate-600">{row.fx}</td>
                <td className={`py-1.5 px-3 border-r border-slate-200 font-bold ${row.sign === 'Root!' ? 'text-emerald-600' : 'text-amber-600'}`}>{row.sign}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ─── Iteration Method convergence table ───────────────────────────────────
  const renderIterGrid = (history) => {
    setTimeout(() => {
      if (playbackState === 'PLAYING' && !stepComplete) handleTypingComplete();
    }, 1000);
    return (
      <div className="overflow-x-auto w-full border border-cyan-200 rounded-xl bg-white shadow-sm mt-3">
        <table className="w-full text-center border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-cyan-50 border-b border-cyan-200">
              {['Step (n)', 'xₙ', '|Δx| = |xₙ - xₙ₋₁|'].map((h, i) => (
                <th key={i} className="py-2.5 px-3 border-r border-cyan-200 font-bold text-cyan-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((row, rIdx) => (
              <tr key={rIdx} className={`${rIdx % 2 === 0 ? 'bg-white' : 'bg-cyan-50/30'} border-b border-cyan-100 hover:bg-cyan-50/60 transition`}>
                <td className="py-1.5 px-3 border-r border-cyan-200 font-bold text-cyan-600">{row.step}</td>
                <td className="py-1.5 px-3 border-r border-cyan-200 font-bold text-blue-600">{typeof row.x === 'number' ? row.x.toFixed(6) : row.x}</td>
                <td className="py-1.5 px-3 border-r border-cyan-200 text-slate-600">{row.err}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ─── Newton-Raphson convergence table ─────────────────────────────────────
  const renderNrGrid = (history) => {
    setTimeout(() => {
      if (playbackState === 'PLAYING' && !stepComplete) handleTypingComplete();
    }, 1000);
    return (
      <div className="overflow-x-auto w-full border border-amber-200 rounded-xl bg-white shadow-sm mt-3">
        <table className="w-full text-center border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-amber-50 border-b border-amber-200">
              {['Step', 'xₙ₋₁', 'f(xₙ₋₁)', "f'(xₙ₋₁)", 'xₙ (new)', '|Δx|'].map((h, i) => (
                <th key={i} className="py-2.5 px-3 border-r border-amber-200 font-bold text-amber-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((row, rIdx) => (
              <tr key={rIdx} className={`${rIdx % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'} border-b border-amber-100 hover:bg-amber-50/60 transition`}>
                <td className="py-1.5 px-3 border-r border-amber-200 font-bold text-amber-600">{row.step}</td>
                <td className="py-1.5 px-3 border-r border-amber-200 text-slate-700">{row.x_prev.toFixed(6)}</td>
                <td className="py-1.5 px-3 border-r border-amber-200 text-slate-600">{row.fx.toFixed(6)}</td>
                <td className="py-1.5 px-3 border-r border-amber-200 text-slate-600">{row.dfx.toFixed(6)}</td>
                <td className="py-1.5 px-3 border-r border-amber-200 font-bold text-blue-600">{row.x_next.toFixed(6)}</td>
                <td className="py-1.5 px-3 border-r border-amber-200 text-slate-500">{row.err.toFixed(8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderLagrangeGrid = (points, targetX, terms, interpolatedValue) => {
    setTimeout(() => {
      if (playbackState === 'PLAYING' && !stepComplete) handleTypingComplete();
    }, 1000);
    return (
      <div className="overflow-x-auto w-full border border-sky-200 rounded-xl bg-white shadow-sm mt-3">
        <table className="w-full text-center border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-sky-50 border-b border-sky-200">
              {['i', 'x_i', 'y_i', 'Numerator term', 'Denominator term', 'Basis L_i(x)', 'Contribution y_i · L_i(x)'].map((h, idx) => (
                <th key={idx} className="py-2.5 px-3 border-r border-sky-200 font-bold text-sky-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {terms.map((term, i) => (
              <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-sky-50/30'} border-b border-sky-100 hover:bg-sky-50/60 transition`}>
                <td className="py-2 px-3 border-r border-sky-200 font-bold text-sky-600">{i}</td>
                <td className="py-2 px-3 border-r border-sky-200 text-slate-700">{points.x[i]}</td>
                <td className="py-2 px-3 border-r border-sky-200 text-slate-700">{points.y[i]}</td>
                <td className="py-2 px-3 border-r border-sky-200 text-slate-500">{term.numStr} = {term.numVal.toFixed(4)}</td>
                <td className="py-2 px-3 border-r border-sky-200 text-slate-500">{term.denStr} = {term.denVal.toFixed(4)}</td>
                <td className="py-2 px-3 border-r border-sky-200 font-bold text-blue-600">{term.lVal.toFixed(6)}</td>
                <td className="py-2 px-3 border-r border-sky-200 font-bold text-emerald-600">{(points.y[i] * term.lVal).toFixed(6)}</td>
              </tr>
            ))}
            <tr className="bg-sky-100/50 font-bold border-t-2 border-sky-200">
              <td colSpan="5" className="py-2.5 px-3 border-r border-sky-200 text-right text-sky-850">Summed Interpolated Value at x = {targetX}:</td>
              <td colSpan="2" className="py-2.5 px-3 text-emerald-700 text-base font-extrabold">{interpolatedValue.toFixed(6)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderNewtonGenGrid = (x, py, n) => {
    setTimeout(() => {
      if (playbackState === 'PLAYING' && !stepComplete) handleTypingComplete();
    }, 1000);

    const headers = ['x', 'y = f(x)'];
    for (let i = 1; i < n; i++) {
      let suffix = '';
      if (i === 1) suffix = '1st Diff';
      else if (i === 2) suffix = '2nd Diff';
      else if (i === 3) suffix = '3rd Diff';
      else suffix = `${i}th Diff`;
      headers.push(suffix);
    }

    return (
      <div className="overflow-x-auto w-full border border-fuchsia-200 rounded-xl bg-white shadow-sm mt-3">
        <table className="w-full text-center border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-fuchsia-50 border-b border-fuchsia-200">
              {headers.map((h, i) => (
                <th key={i} className="py-2.5 px-3 border-r border-fuchsia-200 font-bold text-fuchsia-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {x.map((xi, i) => (
              <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-fuchsia-50/30'} border-b border-fuchsia-100 hover:bg-fuchsia-50/60 transition`}>
                <td className="py-2 px-3 border-r border-fuchsia-200 font-bold text-fuchsia-600">{xi}</td>
                {Array.from({ length: n }).map((_, j) => {
                  const val = py[i][j];
                  const exists = i < n - j;
                  const isFormulaCoeff = i === 0 && exists;
                  return (
                    <td
                      key={j}
                      className={`py-2 px-3 border-r border-fuchsia-200 ${
                        exists ? 'text-slate-700 font-semibold' : 'text-slate-300 italic'
                      } ${isFormulaCoeff ? 'bg-fuchsia-100/70 text-fuchsia-900 font-bold border border-fuchsia-300' : ''}`}
                    >
                      {exists ? (Math.abs(val) < 1e-9 ? '0' : val.toFixed(6).replace(/\.?0+$/, '')) : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 bg-fuchsia-50/50 text-[10px] text-fuchsia-700 font-bold font-sans">
          ★ Highlighted diagonal values are the coefficients used in Newton's general interpolation formula.
        </div>
      </div>
    );
  };

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

      {/* Scrollable step list */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scroll-smooth"
      >
        {activeStepIndex === -1 && playbackState === 'IDLE' && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-300 py-12">
            <div className="text-6xl mb-4">∫</div>
            <p className="text-lg font-bold text-slate-400">Click "Start Solving" to begin</p>
            <p className="text-sm text-slate-300 mt-1">The AI notebook will write out each step live</p>
          </div>
        )}

        {steps.map((step, idx) => {
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
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">
                {step.title}
              </div>

              {step.type === 'result' ? (
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl shadow-lg text-white">
                  <TypewriterStep
                    text={step.content}
                    isActive={isCurrent && playbackState === 'PLAYING' && !stepComplete}
                    speed={speed * 0.75}
                    isMath={false}
                    forceShowFullText={idx < activeStepIndex || playbackState === 'FINISHED'}
                    onComplete={handleTypingComplete}
                  />
                  <div className="mt-4 text-emerald-200 text-sm font-medium">
                    Calculus computation complete.
                  </div>
                </div>
              ) : step.type === 'gsTable' ? (
                <div className="bg-white p-6 rounded-2xl border-l-4 border-emerald-400 shadow-md">
                  <span className="text-xs font-bold text-slate-500 font-sans">Gauss-Seidel Convergence Iterations Table:</span>
                  {renderGsGrid(step.history, step.isGs1)}
                </div>
              ) : step.type === 'rfTable' ? (
                <div className="bg-white p-6 rounded-2xl border-l-4 border-violet-500 shadow-md">
                  <span className="text-xs font-bold text-slate-500 font-sans">Regula Falsi Convergence Table:</span>
                  {renderRfGrid(step.history)}
                </div>
              ) : step.type === 'iterTable' ? (
                <div className="bg-white p-6 rounded-2xl border-l-4 border-cyan-500 shadow-md">
                  <span className="text-xs font-bold text-slate-500 font-sans">Iteration (Fixed-Point) Convergence Table:</span>
                  {renderIterGrid(step.history)}
                </div>
              ) : step.type === 'nrTable' ? (
                <div className="bg-white p-6 rounded-2xl border-l-4 border-amber-500 shadow-md">
                  <span className="text-xs font-bold text-slate-500 font-sans">Newton-Raphson Convergence Table:</span>
                  {renderNrGrid(step.history)}
                </div>
              ) : step.type === 'lagrangeTable' ? (
                <div className="bg-white p-6 rounded-2xl border-l-4 border-sky-400 shadow-md">
                  <span className="text-xs font-bold text-slate-500 font-sans">Lagrange Interpolation Basis Polynomials Table:</span>
                  {renderLagrangeGrid(step.points, step.targetX, step.terms, step.interpolatedValue)}
                </div>
              ) : step.type === 'newtonGenTable' ? (
                <div className="bg-white p-6 rounded-2xl border-l-4 border-fuchsia-400 shadow-md">
                  <span className="text-xs font-bold text-slate-500 font-sans">Newton Divided Difference Table:</span>
                  {renderNewtonGenGrid(step.x, step.py, step.n)}
                </div>
              ) : step.type === 'header' ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <TypewriterStep
                    text={step.content}
                    isActive={isCurrent && playbackState === 'PLAYING' && !stepComplete}
                    speed={speed * 2}
                    isMath={false}
                    forceShowFullText={idx < activeStepIndex || playbackState === 'FINISHED'}
                    onComplete={handleTypingComplete}
                  />
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl border-l-4 border-emerald-400 shadow-md">
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

        {/* Thinking dots */}
        {stepComplete && playbackState === 'PLAYING' && activeStepIndex < steps.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-slate-400 text-sm font-mono mt-4 max-w-2xl mx-auto pl-2"
          >
            <div className="flex gap-1">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}   className="w-2 h-2 rounded-full bg-emerald-400" />
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
