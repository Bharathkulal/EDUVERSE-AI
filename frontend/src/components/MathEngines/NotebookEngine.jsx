import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import TypewriterStep from './TypewriterStep';

export default function NotebookEngine({ 
  func, a, b, n, method, playbackState, speed, onExplain, onFinish, dataset, targetX, direction 
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

    if (method === 'Trapezoidal Rule') {
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

    return sequence;
  }, [func, a, b, n, method, dataset, targetX, direction]);

  // Reset on IDLE
  useEffect(() => {
    if (playbackState === 'IDLE') {
      setActiveStepIndex(-1);
      setStepComplete(false);
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
      onExplain('Waiting for execution to start...');
    }
  }, [playbackState]);

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
    const count = xVals.length;
    const numRows = 2 * count - 1;
    const cols = ['x', 'y', ...Array.from({ length: count - 1 }, (_, k) => `${operatorSymbol}${k + 1 > 1 ? `<sup>${k + 1}</sup>` : ''}`)];

    const grid = [];
    for (let r = 0; r < numRows; r++) {
      const row = [];
      const isEvenRow = r % 2 === 0;
      const i = Math.floor(r / 2);

      for (let col = 0; col <= count; col++) {
        if (col === 0) {
          row.push(isEvenRow ? xVals[i].toString() : '');
        } else if (col === 1) {
          row.push(isEvenRow ? yVals[i].toString() : '');
        } else {
          const diffCol = col - 1;
          const isDiffColEven = diffCol % 2 === 0;
          
          if (isEvenRow && isDiffColEven) {
            row.push(i < count - diffCol ? diffs[diffCol][i].toString() : '');
          } else if (!isEvenRow && !isDiffColEven) {
            row.push(i < count - diffCol ? diffs[diffCol][i].toString() : '');
          } else {
            row.push('');
          }
        }
      }
      grid.push(row);
    }

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
              {cols.map((colHeader, idx) => (
                <th key={idx} className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-600" dangerouslySetInnerHTML={{ __html: colHeader }} />
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, rIdx) => (
              <tr key={rIdx} className={`${rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/10'} border-b border-slate-100 hover:bg-slate-50/50 transition`}>
                {row.map((val, cIdx) => (
                  <td key={cIdx} className="py-1 px-3 border-r border-slate-200 font-semibold text-slate-700 h-8 min-w-[70px]">
                    {val}
                  </td>
                ))}
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
                <div className="bg-white p-6 rounded-2xl border-l-4 border-emerald-400 shadow-md">
                  <span className="text-xs font-bold text-slate-500 font-sans">Constructed Difference Grid:</span>
                  {renderDiffGrid(step.xVals, step.yVals, step.diffs, step.operatorSymbol)}
                </div>
              ) : step.type === 'result' ? (
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
                    {method.includes('Rule') ? 'Numerical integration complete.' : 'Numerical interpolation/differentiation complete.'}
                  </div>
                </div>
              ) : step.type === 'header' ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                  <TypewriterStep
                    text={step.content}
                    isActive={isCurrent && playbackState === 'PLAYING' && !stepComplete}
                    speed={speed * 2}
                    isMath={false}
                    forceShowFullText={idx < activeStepIndex || playbackState === 'FINISHED'}
                    onComplete={handleTypingComplete}
                  />
                  {step.isNewton && (
                    <div className="overflow-x-auto w-full border border-slate-200 rounded-xl bg-white shadow-sm mt-2">
                      <table className="w-full text-center border-collapse text-xs font-sans">
                        <tbody>
                          <tr className="border-b border-slate-200">
                            <td className="py-2.5 px-3 bg-slate-50 border-r border-slate-200 font-bold text-slate-600 min-w-[120px] text-left">{step.xLabel}</td>
                            {step.xVals.map((val, idx) => (
                              <td key={idx} className="py-2.5 px-3 border-r border-slate-200 font-semibold text-slate-800">{val}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 bg-slate-50 border-r border-slate-200 font-bold text-slate-600 min-w-[120px] text-left">{step.yLabel}</td>
                            {step.yVals.map((val, idx) => (
                              <td key={idx} className="py-2.5 px-3 border-r border-slate-200 font-semibold text-slate-800">{val}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
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
