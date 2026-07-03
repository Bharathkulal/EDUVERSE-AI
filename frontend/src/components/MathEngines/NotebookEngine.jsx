import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import TypewriterStep from './TypewriterStep';

export default function NotebookEngine({ 
  func, a, b, n, method, playbackState, speed, onExplain, onFinish, dataset, targetX, direction,
  bisectionProblemId, bisectionIterations, rkX0, rkY0, rkH, rkSteps, rkFuncId, matMulQuestion
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
      const label = isSquare ? 'A\u00B2' : 'AB';
      const Blabel = isSquare ? 'A' : 'B';

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
    }, getDuration(1000));

    return (
      <div className="overflow-x-auto w-full border border-[var(--db-card-border)] rounded-xl bg-[var(--db-card-bg)] shadow-sm mt-3">
        <table className="w-full text-center border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-[var(--db-card-bg-elevated)] border-b border-[var(--db-card-border)]">
              {cols.map((colHeader, idx) => (
                <th key={idx} className="py-2.5 px-3 border-r border-[var(--db-card-border)] font-bold text-[var(--db-text-secondary)]" dangerouslySetInnerHTML={{ __html: colHeader }} />
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, rIdx) => (
              <tr key={rIdx} className={`${rIdx % 2 === 0 ? 'bg-[var(--db-card-bg)]' : 'bg-[var(--db-card-bg-elevated)]/40'} border-b border-[var(--db-card-border)]/50 hover:bg-[var(--db-card-bg-elevated)]/80 transition`}>
                {row.map((val, cIdx) => (
                  <td key={cIdx} className="py-1 px-3 border-r border-[var(--db-card-border)] font-semibold text-[var(--db-text-main)] h-8 min-w-[70px]">
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
                    {method === 'Matrix Multiplication' ? 'Linear Algebra · Matrix multiplication complete.' : method.includes('Rule') ? 'Numerical integration complete.' : method.includes('Bisection') ? 'Bisection Method root finding complete.' : 'Numerical interpolation/differentiation complete.'}
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
