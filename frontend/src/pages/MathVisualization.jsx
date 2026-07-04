import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ChevronRight, ChevronLeft, Play, Pause, RotateCcw, 
  Settings2, Activity, BrainCircuit, FunctionSquare, Rocket, X,
  Layers, BookOpen, Target, Lightbulb, Zap, ArrowRight
} from 'lucide-react';
import NotebookEngine from '../components/MathEngines/NotebookEngine';
import MathBackground from '../components/MathBackground';
import { useTheme } from '../context/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import './DashboardTheme.css';

export default function MathVisualization() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  
  // State
  const [selectedMethod, setSelectedMethod] = useState(() => {
    return location.state?.initialMethod || null;
  });

  useEffect(() => {
    if (location.state?.initialMethod) {
      setSelectedMethod(location.state.initialMethod);
    }
  }, [location.state]);
  
  const [showFormula, setShowFormula] = useState(false); // Formula intermediate page
  const [formulaPage, setFormulaPage] = useState(0); // Current formula page index
  const [funcId, setFuncId] = useState('reciprocal');
  const [a, setA] = useState('0');
  const [b, setB] = useState('1');
  const [n, setN] = useState('4');
  
  // Bisection Method States
  const [bisectionProblemId, setBisectionProblemId] = useState('bis1');
  const [bisectionIterations, setBisectionIterations] = useState('5');

  // Newton's Interpolation States
  const [newtonQuestionId, setNewtonQuestionId] = useState('q9');
  const [newtonDirection, setNewtonDirection] = useState('Forward');
  const [newtonTargetX, setNewtonTargetX] = useState('1895');

  // Newton's Difference (Differentiation) States
  const [newtonDiffQuestionId, setNewtonDiffQuestionId] = useState('qd12');
  const [newtonDiffDirection, setNewtonDiffDirection] = useState('Forward');
  const [newtonDiffTargetX, setNewtonDiffTargetX] = useState('1.2');

  // Simpson's 1/3 Rule States
  const [simpson13ProblemId, setSimpson13ProblemId] = useState('s13_q1');
  const [simpson13FuncId, setSimpson13FuncId] = useState('reciprocal');
  const [simpson13A, setSimpson13A] = useState('0');
  const [simpson13B, setSimpson13B] = useState('1');
  const [simpson13N, setSimpson13N] = useState('4');

  // Simpson's 3/8 Rule States
  const [simpson38ProblemId, setSimpson38ProblemId] = useState('s38_q1');
  const [simpson38FuncId, setSimpson38FuncId] = useState('reciprocal');
  const [simpson38A, setSimpson38A] = useState('0');
  const [simpson38B, setSimpson38B] = useState('1');
  const [simpson38N, setSimpson38N] = useState('6');

  // RK4 States
  const [rkProblemId, setRkProblemId] = useState('rk_q1');
  const [rkFuncId, setRkFuncId] = useState('y_minus_x');
  const [rkX0, setRkX0] = useState('0');
  const [rkY0, setRkY0] = useState('2');
  const [rkH, setRkH] = useState('0.1');
  const [rkSteps, setRkSteps] = useState('1');

  // Matrix Multiplication States
  const [matMulQuestionId, setMatMulQuestionId] = useState('mm_q5');

  // Execution Control State
  const [playbackState, setPlaybackState] = useState('IDLE');
  const [speed, setSpeed] = useState(1);
  const [currentExplanation, setCurrentExplanation] = useState('Waiting for execution to start...');

  const PREDEFINED_FUNCTIONS = [
    { id: 'reciprocal', label: 'f(x) = 1 / (1 + x)', expr: (x) => 1 / (1 + x), desc: 'Reciprocal rational function' },
    { id: 'sin', label: 'f(x) = sin(x) + 2', expr: (x) => Math.sin(x) + 2, desc: 'Smooth trigonometric curve' },
    { id: 'quadratic', label: 'f(x) = x² / 4 + 1', expr: (x) => (x * x) / 4 + 1, desc: 'Polynomial parabola' },
    { id: 'exponential', label: 'f(x) = e^(x/2)', expr: (x) => Math.exp(x / 2), desc: 'Exponential growth curve' },
  ];

  const NEWTON_QUESTIONS = [
    {
      id: 'q9',
      label: 'Q9: Census Population (1895 - Forward)',
      x: [1891, 1901, 1911, 1921, 1931],
      y: [46, 66, 81, 93, 101],
      xLabel: 'Year (x)',
      yLabel: 'Population (y) (in thousands)',
      defaultTarget: 1895,
      defaultDirection: 'Forward',
      question: '9. The population of a town in the decennial census was as given below. Estimate the population for the year 1895 using Newton\u2019s forward difference interpolation formula.'
    },
    {
      id: 'q10',
      label: 'Q10: Census Population (1925 - Backward)',
      x: [1891, 1901, 1911, 1921, 1931],
      y: [46, 66, 81, 93, 101],
      xLabel: 'Year (x)',
      yLabel: 'Population (y) (in thousands)',
      defaultTarget: 1925,
      defaultDirection: 'Backward',
      question: '10. The population of a town in the decennial census was as given below. Estimate the population for the year 1925 using Newton\u2019s backward difference interpolation formula.'
    },
    {
      id: 'q8',
      label: 'Q8: Cubic Polynomial y(4) (Forward)',
      x: [0, 1, 2, 3],
      y: [1, 0, 1, 10],
      xLabel: 'x',
      yLabel: 'y',
      defaultTarget: 4,
      defaultDirection: 'Forward',
      question: '8. Find the cubic polynomial which takes the following values y(0)=1, y(1)=0, y(2)=1 and y(3)=10. And obtain y(4) using Newton\u2019s forward difference interpolation formula.'
    },
    {
      id: 'q11',
      label: 'Q11: Series First Term (x=1 - Forward)',
      x: [3, 4, 5, 6, 7, 8, 9],
      y: [2.7, 6.4, 12.5, 21.6, 34.3, 51.2, 72.9],
      xLabel: 'X',
      yLabel: 'Y',
      defaultTarget: 1,
      defaultDirection: 'Forward',
      question: '11. In the table below the values of y are consecutive terms of a series of which the number 21.6 is the 6th term. Find the first term of the series (x=1) using Newton\u2019s forward difference interpolation formula.'
    }
  ];

  const NEWTON_DIFF_QUESTIONS = [
    {
      id: 'qd12',
      label: 'Q12: dy/dx & d\u00B2y/dx\u00B2 at x=1.2 (Forward)',
      x: [1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2],
      y: [2.7183, 3.3201, 4.0552, 4.9530, 6.0496, 7.3891, 7.0250],
      xLabel: 'x',
      yLabel: 'y',
      defaultTarget: 1.2,
      defaultDirection: 'Forward',
      question: 'From the following table of values of x and y, obtain dy/dx and d\u00B2y/dx\u00B2 for x = 1.2 using Newton\u2019s forward difference formula.'
    },
    {
      id: 'qd13',
      label: 'Q13: dy/dx & d\u00B2y/dx\u00B2 at x=6 (Backward)',
      x: [0, 1, 2, 3, 4, 5, 6],
      y: [6.9897, 7.4036, 7.7815, 8.1291, 8.4510, 8.7506, 9.0309],
      xLabel: 'x',
      yLabel: 'y',
      defaultTarget: 6,
      defaultDirection: 'Backward',
      question: 'From the following table of values of x and y, obtain dy/dx and d\u00B2y/dx\u00B2 for x = 6 using Newton\u2019s backward difference formula.'
    }
  ];

  const SIMPSON_13_QUESTIONS = [
    {
      id: 's13_q1',
      label: 'Q1: Evaluate ∫[0 to 1] sin(πx) dx (h = 0.5) (Photo Q3)',
      question: 'Evaluate: I = ∫ [0 to 1] ( sin(πx) ) dx using Simpson\'s 1/3rd Rule with h = 0.5.'
    },
    {
      id: 's13_q2',
      label: 'Q2: Evaluate ∫[0 to 1] √(1-x²) dx (h = 0.2) (Photo Q2a)',
      question: 'Evaluate: I = ∫ [0 to 1] ( √(1-x²) ) dx using Simpson\'s 1/3rd Rule with h = 0.2.'
    },
    {
      id: 'custom',
      label: 'Custom Equation',
      question: 'Custom Simpson\'s 1/3 Rule problem.'
    }
  ];

  const SIMPSON_38_QUESTIONS = [
    {
      id: 's38_q1',
      label: 'Q1: Evaluate ∫[0 to 1] cos(x) dx (h = 0.2) (Photo Q1)',
      question: 'Evaluate: I = ∫ [0 to 1] ( cos(x) ) dx using Simpson\'s 3/8th Rule when h = 0.2.'
    },
    {
      id: 's38_q2',
      label: 'Q2: Evaluate ∫[0 to π/2] √(cos θ) dθ (n = 6) (Photo Q2)',
      question: 'Find the approximate value of ∫ [0 to π/2] ( √(cos θ) ) dθ dividing the interval into 6 parts using Simpson\'s 3/8th Rule.'
    },
    {
      id: 'custom',
      label: 'Custom Equation',
      question: 'Custom Simpson\'s 3/8 Rule problem.'
    }
  ];

  const RK_QUESTIONS = [
    {
      id: 'rk_q1',
      label: 'Q1: dy/dx = y - x, y(0)=2, find y(0.1) (h = 0.1) (Photo Q1)',
      question: 'Given that dy/dx = y - x where y(0) = 2 and h = 0.1, find y(0.1) using Runge Kutta 4th order method.'
    },
    {
      id: 'rk_q2',
      label: 'Q2: dy/dx = x + y, y(0)=1, find y(0.2) (h = 0.1)',
      question: 'Given that dy/dx = x + y where y(0) = 1, find y(0.2) in 2 steps of h = 0.1 using Runge Kutta 4th order method.'
    },
    {
      id: 'custom',
      label: 'Custom ODE',
      question: 'Custom Runge-Kutta 4th order method problem.'
    }
  ];

  // Matrix Multiplication Questions (from photo)
  const MATRIX_MUL_QUESTIONS = [
    {
      id: 'mm_q5',
      label: 'Q5: A = [[0,1],[1,0]], Find A² (Photo Q5)',
      question: 'Given A = [[0,1],[1,0]], find A² = A × A using Matrix Multiplication.',
      type: 'square',
      matA: [[0,1],[1,0]],
      matB: [[0,1],[1,0]],
      description: 'A is a permutation matrix. Compute A² = A × A.'
    },
    {
      id: 'mm_q6',
      label: 'Q6: A = [[1,0],[0,0]], B = [[0,0],[1,1]], Find AB (Photo Q6)',
      question: 'Given A = [[1,0],[0,0]] and B = [[0,0],[1,1]], find the product AB using Matrix Multiplication.',
      type: 'product',
      matA: [[1,0],[0,0]],
      matB: [[0,0],[1,1]],
      description: 'A is an idempotent matrix. Compute the product AB.'
    },
    {
      id: 'mm_q7',
      label: 'Q7: Orthogonal - Rotation Matrix A (cos θ)',
      question: 'Given A = [[cos θ, -sin θ],[sin θ, cos θ]], show that A is orthogonal by verifying AAᵀ = I.',
      type: 'orthogonal_2x2',
      matA: [['cos θ', '-sin θ'], ['sin θ', 'cos θ']],
      matB: [['cos θ', 'sin θ'], ['-sin θ', 'cos θ']],
      description: 'A is a 2D rotation matrix. Multiply A by its transpose Aᵀ (since Aᵀ = A⁻¹ for orthogonal matrices) and verify it equals Identity Matrix I.'
    },
    {
      id: 'mm_q8',
      label: 'Q8: Orthogonal - 3x3 Fractional Matrix B',
      question: 'Given B = [[-2/3, 1/3, 2/3],[2/3, 2/3, 1/3],[1/3, -2/3, 2/3]], show that B is orthogonal by verifying BBᵀ = I.',
      type: 'orthogonal_3x3',
      matA: [[-2/3, 1/3, 2/3], [2/3, 2/3, 1/3], [1/3, -2/3, 2/3]],
      matB: [[-2/3, 2/3, 1/3], [1/3, 2/3, -2/3], [2/3, 1/3, 2/3]],
      description: 'B is a 3x3 matrix with fractional entries. Multiply B by its transpose Bᵀ and verify that the product is the 3x3 Identity Matrix I.'
    }
  ];

  const CARDS = [
    { 
      id: 'Bisection Method', 
      title: 'Bisection Method', 
      desc: 'Iteratively bracket and find root of a function using interval halving.', 
      status: 'Intermediate', 
      time: '15 mins', 
      xp: '100 XP', 
      progress: 80,
      tags: ['Root Finding', 'Interval Halving', 'f(a)·f(b) < 0'],
      colorTheme: 'blue',
      btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      badgeClass: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
      icon: '📐'
    },
    { 
      id: 'Newton\u2019s Interpolation', 
      title: 'Newton\u2019s Interpolation', 
      desc: 'Estimate values between data points using forward/backward difference polynomials.', 
      status: 'Intermediate', 
      time: '20 mins', 
      xp: '120 XP', 
      progress: 60,
      tags: ['Equal Intervals', 'Forward Diff', 'Backward Diff'],
      colorTheme: 'cyan',
      btnClass: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      badgeClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400',
      icon: '📈'
    },
    { 
      id: 'Newton\u2019s Difference', 
      title: 'Newton\u2019s Difference', 
      desc: 'Obtain first (dy/dx) and second (d\u00B2y/dx\u00B2) derivatives from difference tables.', 
      status: 'Advanced', 
      time: '15 mins', 
      xp: '150 XP', 
      progress: 40,
      tags: ['First Derivative', 'Second Derivative', 'Table Diff'],
      colorTheme: 'emerald',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badgeClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      icon: '📊'
    },
    { 
      id: 'Trapezoidal Rule', 
      title: 'Trapezoidal Rule', 
      desc: 'Calculate the approximate area under a curve using boundary nodes.', 
      status: 'Beginner', 
      time: '10 mins', 
      xp: '80 XP', 
      progress: 90,
      tags: ['Integration', 'Linear Segments', 'Area Approx'],
      colorTheme: 'violet',
      btnClass: 'bg-violet-600 hover:bg-violet-700 text-white',
      badgeClass: 'bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400',
      icon: '〰️'
    },
    { 
      id: 'Simpson\u2019s 1/3 Rule', 
      title: 'Simpson\u2019s 1/3 Rule', 
      desc: 'Higher accuracy quadratic polynomial area approximation.', 
      status: 'Intermediate', 
      time: '15 mins', 
      xp: '100 XP', 
      progress: 75,
      tags: ['Integration', 'Quadratic', 'Even n'],
      colorTheme: 'amber',
      btnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
      badgeClass: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
      icon: '📐'
    },
    { 
      id: 'Simpson\u2019s 3/8 Rule', 
      title: 'Simpson\u2019s 3/8 Rule', 
      desc: 'Cubic polynomial boundaries for high precision integration.', 
      status: 'Advanced', 
      time: '20 mins', 
      xp: '150 XP', 
      progress: 30,
      tags: ['Integration', 'Cubic', 'Multiple of 3'],
      colorTheme: 'rose',
      btnClass: 'bg-rose-500 hover:bg-rose-600 text-white',
      badgeClass: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
      icon: '🌀'
    },
    { 
      id: 'RK4', 
      title: 'RK4 Method', 
      desc: 'Solve ordinary differential equations step-by-step.', 
      status: 'Advanced', 
      time: '25 mins', 
      xp: '200 XP', 
      progress: 10,
      tags: ['ODE Solver', '4th Order', 'Single Step'],
      colorTheme: 'sky',
      btnClass: 'bg-sky-500 hover:bg-sky-600 text-white',
      badgeClass: 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400',
      icon: '🧪'
    }
  ];

  // Formula data for each method
  const FORMULA_DATA = {
    'Bisection Method': {
      features: [
        { icon: BookOpen, title: 'Interval Halving', desc: 'Guaranteed convergence for continuous functions.' },
        { icon: Target,   title: 'Root Finding',     desc: 'Finds real roots of f(x) = 0.' },
        { icon: Lightbulb, title: 'Photo Problem',    desc: 'Solve f(x) = x³ - x - 1 = 0.' },
      ],
      formulas: [
        {
          title: 'Bisection Formula',
          formula: 'x_n = (a + b) / 2',
          variables: [
            { sym: 'a, b', def: 'Interval boundaries where f(a) · f(b) < 0' },
            { sym: 'x_n',  def: 'Midpoint approximation of root' },
            { sym: 'f(x_n)', def: 'Function value. Sets new boundary matching sign.' },
          ]
        }
      ]
    },
    'Newton\u2019s Interpolation': {
      features: [
        { icon: BookOpen, title: 'Best for equal intervals', desc: 'Useful when data points are equally spaced.' },
        { icon: Target, title: 'High Accuracy', desc: 'Provides accurate results within the given range.' },
        { icon: Lightbulb, title: 'Applications', desc: 'Engineering, Physics, Economics, and many more.' },
      ],
      formulas: [
        {
          title: 'Newton\u2019s Forward Interpolation Formula',
          formula: 'P(x) = y\u2080 + u\u0394y\u2080 + u(u\u22121)/2! \u0394\u00B2y\u2080 + u(u\u22121)(u\u22122)/3! \u0394\u00B3y\u2080 + ...',
          variables: [
            { sym: 'u', def: '(x \u2212 x\u2080) / h' },
            { sym: 'x\u2080', def: 'First value of x' },
            { sym: 'h', def: 'Common difference between x values' },
            { sym: '\u0394y\u2080', def: 'First forward difference' },
            { sym: '\u0394\u00B2y\u2080', def: 'Second forward difference' },
            { sym: '\u0394\u00B3y\u2080', def: 'Third forward difference' },
          ]
        },
        {
          title: 'Newton\u2019s Backward Interpolation Formula',
          formula: 'P(x) = y\u2099 + u\u2207y\u2099 + u(u+1)/2! \u2207\u00B2y\u2099 + u(u+1)(u+2)/3! \u2207\u00B3y\u2099 + ...',
          variables: [
            { sym: 'u', def: '(x \u2212 x\u2099) / h' },
            { sym: 'x\u2099', def: 'Last value of x' },
            { sym: 'h', def: 'Common difference between x values' },
            { sym: '\u2207y\u2099', def: 'First backward difference' },
            { sym: '\u2207\u00B2y\u2099', def: 'Second backward difference' },
            { sym: '\u2207\u00B3y\u2099', def: 'Third backward difference' },
          ]
        },
      ]
    },
    'Newton\u2019s Difference': {
      features: [
        { icon: BookOpen, title: 'Differentiation from tables', desc: 'Compute derivatives from tabulated data.' },
        { icon: Target, title: 'Multiple orders', desc: 'Find first and second order derivatives.' },
        { icon: Lightbulb, title: 'Applications', desc: 'Rate of change, slope analysis, curve fitting.' },
      ],
      formulas: [
        {
          title: 'Newton\u2019s Forward Differentiation Formula',
          formula: 'dy/dx = 1/h [\u0394y\u2080 \u2212 1/2 \u0394\u00B2y\u2080 + 1/3 \u0394\u00B3y\u2080 \u2212 ...]',
          variables: [
            { sym: 'h', def: 'Step size (common difference)' },
            { sym: '\u0394y\u2080', def: 'First forward difference at x\u2080' },
            { sym: '\u0394\u00B2y\u2080', def: 'Second forward difference at x\u2080' },
            { sym: '\u0394\u00B3y\u2080', def: 'Third forward difference at x\u2080' },
          ]
        },
        {
          title: 'Newton\u2019s Backward Differentiation Formula',
          formula: 'dy/dx = 1/h [\u2207y\u2099 + 1/2 \u2207\u00B2y\u2099 + 1/3 \u2207\u00B3y\u2099 + ...]',
          variables: [
            { sym: 'h', def: 'Step size (common difference)' },
            { sym: '\u2207y\u2099', def: 'First backward difference at x\u2099' },
            { sym: '\u2207\u00B2y\u2099', def: 'Second backward difference at x\u2099' },
            { sym: '\u2207\u00B3y\u2099', def: 'Third backward difference at x\u2099' },
          ]
        },
      ]
    },
    'Trapezoidal Rule': {
      features: [
        { icon: BookOpen, title: 'Simple integration', desc: 'Approximates area using trapezoids.' },
        { icon: Target, title: 'First order accuracy', desc: 'Error is O(h\u00B2) for smooth functions.' },
        { icon: Lightbulb, title: 'Applications', desc: 'Area calculation, numerical integration.' },
      ],
      formulas: [
        {
          title: 'Trapezoidal Rule Formula',
          formula: '\u222Bf(x)dx \u2248 h/2 [f(x\u2080) + 2\u2211f(x\u1D62) + f(x\u2099)]',
          variables: [
            { sym: 'h', def: '(b \u2212 a) / n — Step size' },
            { sym: 'a, b', def: 'Lower and upper limits of integration' },
            { sym: 'n', def: 'Number of sub-intervals' },
            { sym: 'f(x\u2080)', def: 'Function value at first point' },
            { sym: 'f(x\u2099)', def: 'Function value at last point' },
            { sym: '\u2211f(x\u1D62)', def: 'Sum of function values at interior points' },
          ]
        },
      ]
    },
    'Simpson\u2019s 1/3 Rule': {
      features: [
        { icon: BookOpen, title: 'Quadratic approximation', desc: 'Uses parabolic arcs for higher accuracy.' },
        { icon: Target, title: 'Higher order accuracy', desc: 'Error is O(h\u2074) — better than Trapezoidal.' },
        { icon: Lightbulb, title: 'Requirement', desc: 'Number of intervals must be even.' },
      ],
      formulas: [
        {
          title: 'Simpson\u2019s 1/3 Rule Formula',
          formula: '\u222Bf(x)dx \u2248 h/3 [f(x\u2080) + 4\u2211f(x_odd) + 2\u2211f(x_even) + f(x\u2099)]',
          variables: [
            { sym: 'h', def: '(b \u2212 a) / n — Step size' },
            { sym: 'n', def: 'Number of sub-intervals (must be even)' },
            { sym: '\u2211f(x_odd)', def: 'Sum of function values at odd-indexed points' },
            { sym: '\u2211f(x_even)', def: 'Sum of function values at even-indexed points' },
          ]
        },
      ]
    },
    'Simpson\u2019s 3/8 Rule': {
      features: [
        { icon: BookOpen, title: 'Cubic approximation', desc: 'Uses cubic polynomial for precision.' },
        { icon: Target, title: 'High precision', desc: 'Better accuracy for smooth curves.' },
        { icon: Lightbulb, title: 'Requirement', desc: 'Number of intervals must be multiple of 3.' },
      ],
      formulas: [
        {
          title: 'Simpson\u2019s 3/8 Rule Formula',
          formula: '\u222Bf(x)dx \u2248 3h/8 [f(x\u2080) + 3\u2211f(x\u1D62\u22603n) + 2\u2211f(x\u1D62\u22610) + f(x\u2099)]',
          variables: [
            { sym: 'h', def: '(b \u2212 a) / n — Step size' },
            { sym: 'n', def: 'Number of sub-intervals (multiple of 3)' },
          ]
        },
      ]
    },
    'RK4': {
      features: [
        { icon: BookOpen, title: 'ODE Solver', desc: 'Solves ordinary differential equations numerically.' },
        { icon: Target, title: 'Fourth-order accuracy', desc: 'Error is O(h\u2075) per step.' },
        { icon: Lightbulb, title: 'Applications', desc: 'Physics simulations, population models.' },
      ],
      formulas: [
        {
          title: 'Runge-Kutta 4th Order Method',
          formula: 'y\u2099\u208A\u2081 = y\u2099 + (1/6)(k\u2081 + 2k\u2082 + 2k\u2083 + k\u2084)',
          variables: [
            { sym: 'k\u2081', def: 'h \u00B7 f(x\u2099, y\u2099)' },
            { sym: 'k\u2082', def: 'h \u00B7 f(x\u2099 + h/2, y\u2099 + k\u2081/2)' },
            { sym: 'k\u2083', def: 'h \u00B7 f(x\u2099 + h/2, y\u2099 + k\u2082/2)' },
            { sym: 'k\u2084', def: 'h \u00B7 f(x\u2099 + h, y\u2099 + k\u2083)' },
            { sym: 'h', def: 'Step size' },
          ]
        },
      ]
    },
    'Matrix Multiplication': {
      features: [
        { icon: BookOpen, title: 'Row × Column Rule', desc: 'Each entry C[i][j] is the dot product of row i of A with column j of B.' },
        { icon: Target, title: 'Dimension Requirement', desc: 'A (m×n) × B (n×p) → C (m×p). Inner dimensions must match.' },
        { icon: Lightbulb, title: 'Problems', desc: 'Q5-Q6: Matrix products. Q7-Q8: Orthogonal matrix verifications (AAᵀ = I).' },
      ],
      formulas: [
        {
          title: 'Matrix Multiplication Formula',
          formula: 'C[i][j] = \u03A3 A[i][k] \u00B7 B[k][j]  (k = 1 to n)',
          variables: [
            { sym: 'A', def: 'm \u00D7 n matrix (left operand)' },
            { sym: 'B', def: 'n \u00D7 p matrix (right operand)' },
            { sym: 'C', def: 'm \u00D7 p result matrix' },
            { sym: 'i', def: 'Row index of result matrix C' },
            { sym: 'j', def: 'Column index of result matrix C' },
            { sym: 'k', def: 'Summation index running from 1 to n' },
          ]
        },
        {
          title: 'Orthogonal Matrix Verification',
          formula: 'A \u00D7 A\u1D40 = A\u1D40 \u00D7 A = I',
          variables: [
            { sym: 'A', def: 'A square matrix' },
            { sym: 'A\u1D40', def: 'Transpose of matrix A (rows and columns swapped)' },
            { sym: 'I', def: 'Identity Matrix' },
          ]
        },
        {
          title: '2\u00D72 Matrix Multiplication (Expanded)',
          formula: '[[a,b],[c,d]] \u00D7 [[e,f],[g,h]] = [[ae+bg, af+bh],[ce+dg, cf+dh]]',
          variables: [
            { sym: 'C[1][1]', def: 'a\u00B7e + b\u00B7g  (Row 1 \u00B7 Col 1)' },
            { sym: 'C[1][2]', def: 'a\u00B7f + b\u00B7h  (Row 1 \u00B7 Col 2)' },
            { sym: 'C[2][1]', def: 'c\u00B7e + d\u00B7g  (Row 2 \u00B7 Col 1)' },
            { sym: 'C[2][2]', def: 'c\u00B7f + d\u00B7h  (Row 2 \u00B7 Col 2)' },
          ]
        },
      ]
    },
  };

  const activeFunction = PREDEFINED_FUNCTIONS.find(f => f.id === funcId);
  const activeQuestion = NEWTON_QUESTIONS.find(q => q.id === newtonQuestionId);
  const activeDiffQuestion = NEWTON_DIFF_QUESTIONS.find(qd => qd.id === newtonDiffQuestionId);
  const activeSimpson13Question = SIMPSON_13_QUESTIONS.find(q => q.id === simpson13ProblemId);
  const activeSimpson38Question = SIMPSON_38_QUESTIONS.find(q => q.id === simpson38ProblemId);
  const activeRKQuestion = RK_QUESTIONS.find(q => q.id === rkProblemId);
  const activeMatMulQuestion = MATRIX_MUL_QUESTIONS.find(q => q.id === matMulQuestionId);

  // Engine Event Handlers
  const handleExplanationUpdate = (text) => {
    setCurrentExplanation(text);
  };

  const handleExecutionFinished = () => {
    setPlaybackState('FINISHED');
  };

  const handlePlayPause = () => {
    if (playbackState === 'FINISHED' || playbackState === 'IDLE') {
      setPlaybackState('IDLE');
      setCurrentExplanation('Waiting for execution to start...');
      setTimeout(() => setPlaybackState('PLAYING'), 150);
    } else if (playbackState === 'PLAYING') {
      setPlaybackState('PAUSED');
    } else if (playbackState === 'PAUSED') {
      setPlaybackState('PLAYING');
    }
  };

  const handleReplay = () => {
    setPlaybackState('IDLE');
    setCurrentExplanation('Waiting for execution to start...');
    setTimeout(() => setPlaybackState('PLAYING'), 150);
  };

  const handleCardClick = (cardId) => {
    setSelectedMethod(cardId);
    setShowFormula(true);
    setFormulaPage(0);
  };

  const handleLaunchSimulator = () => {
    setShowFormula(false);
    setPlaybackState('IDLE');
  };

  const renderActiveEngine = () => {
    if (selectedMethod === 'Bisection Method') {
      return (
        <NotebookEngine
          method={selectedMethod}
          playbackState={playbackState}
          speed={speed}
          onExplain={handleExplanationUpdate}
          onFinish={handleExecutionFinished}
          bisectionProblemId={bisectionProblemId}
          bisectionIterations={bisectionIterations}
        />
      );
    } else if (selectedMethod === 'Trapezoidal Rule') {
      return (
        <NotebookEngine 
          func={activeFunction} 
          a={parseFloat(a)} 
          b={parseFloat(b)} 
          n={parseInt(n)} 
          method={selectedMethod}
          playbackState={playbackState}
          speed={speed}
          onExplain={handleExplanationUpdate}
          onFinish={handleExecutionFinished}
        />
      );
    } else if (selectedMethod === 'Newton\u2019s Interpolation') {
      return (
        <NotebookEngine
          dataset={activeQuestion}
          targetX={parseFloat(newtonTargetX)}
          direction={newtonDirection}
          method={selectedMethod}
          playbackState={playbackState}
          speed={speed}
          onExplain={handleExplanationUpdate}
          onFinish={handleExecutionFinished}
        />
      );
    } else if (selectedMethod === 'Newton\u2019s Difference') {
      return (
        <NotebookEngine
          dataset={activeDiffQuestion}
          targetX={parseFloat(newtonDiffTargetX)}
          direction={newtonDiffDirection}
          method={selectedMethod}
          playbackState={playbackState}
          speed={speed}
          onExplain={handleExplanationUpdate}
          onFinish={handleExecutionFinished}
        />
      );
    } else if (selectedMethod === 'Simpson\u2019s 1/3 Rule' || selectedMethod === "Simpson's 1/3 Rule") {
      return (
        <NotebookEngine
          dataset={activeSimpson13Question}
          func={activeFunction}
          a={parseFloat(simpson13A)}
          b={parseFloat(simpson13B)}
          n={parseInt(simpson13N)}
          method={selectedMethod}
          playbackState={playbackState}
          speed={speed}
          onExplain={handleExplanationUpdate}
          onFinish={handleExecutionFinished}
        />
      );
    } else if (selectedMethod === 'Simpson\u2019s 3/8 Rule' || selectedMethod === "Simpson's 3/8 Rule") {
      return (
        <NotebookEngine
          dataset={activeSimpson38Question}
          func={activeFunction}
          a={parseFloat(simpson38A)}
          b={parseFloat(simpson38B)}
          n={parseInt(simpson38N)}
          method={selectedMethod}
          playbackState={playbackState}
          speed={speed}
          onExplain={handleExplanationUpdate}
          onFinish={handleExecutionFinished}
        />
      );
    } else if (selectedMethod === 'RK4') {
      return (
        <NotebookEngine
          dataset={activeRKQuestion}
          rkX0={parseFloat(rkX0)}
          rkY0={parseFloat(rkY0)}
          rkH={parseFloat(rkH)}
          rkSteps={parseInt(rkSteps)}
          rkFuncId={rkFuncId}
          method={selectedMethod}
          playbackState={playbackState}
          speed={speed}
          onExplain={handleExplanationUpdate}
          onFinish={handleExecutionFinished}
        />
      );
    } else if (selectedMethod === 'Matrix Multiplication') {
      return (
        <NotebookEngine
          matMulQuestion={activeMatMulQuestion}
          method={selectedMethod}
          playbackState={playbackState}
          speed={speed}
          onExplain={handleExplanationUpdate}
          onFinish={handleExecutionFinished}
        />
      );
    }
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
        <Activity className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-xl font-bold">Engine Offline</p>
        <p className="text-sm">The {selectedMethod} notebook engine is currently under construction.</p>
      </div>
    );
  };

  const getTopQuestionText = () => {
    if (selectedMethod === 'Bisection Method') {
      return bisectionProblemId === 'bis1'
        ? 'Find the real root of the equation f(x) = x³ - x - 1 = 0'
        : 'Find the real root of the equation f(x) = x³ - 4x - 9 = 0';
    } else if (selectedMethod === 'Trapezoidal Rule') {
      return `Evaluate: I = \u222B [${a} to ${b}] ( ${activeFunction?.label?.split('=')[1]?.trim() || ''} ) dx using Trapezoidal Rule.`;
    } else if (selectedMethod === 'Newton\u2019s Interpolation') {
      return activeQuestion?.question || '';
    } else if (selectedMethod === 'Newton\u2019s Difference') {
      return activeDiffQuestion?.question || '';
    } else if (selectedMethod === 'Simpson\u2019s 1/3 Rule' || selectedMethod === "Simpson's 1/3 Rule") {
      if (simpson13ProblemId === 'custom') {
        return `Evaluate: I = \u222B [${simpson13A} to ${simpson13B}] ( ${activeFunction?.label?.split('=')[1]?.trim() || ''} ) dx using Simpson's 1/3 Rule.`;
      }
      return activeSimpson13Question?.question || '';
    } else if (selectedMethod === 'Simpson\u2019s 3/8 Rule' || selectedMethod === "Simpson's 3/8 Rule") {
      if (simpson38ProblemId === 'custom') {
        return `Evaluate: I = \u222B [${simpson38A} to ${simpson38B}] ( ${activeFunction?.label?.split('=')[1]?.trim() || ''} ) dx using Simpson's 3/8 Rule.`;
      }
      return activeSimpson38Question?.question || '';
    } else if (selectedMethod === 'RK4') {
      if (rkProblemId === 'custom') {
        const RK_FUNCTIONS = {
          'y_minus_x': "dy/dx = y - x",
          'x_plus_y':  "dy/dx = x + y",
          'minus_2xy': "dy/dx = -2xy",
          'y_plus_x2': "dy/dx = y + x\u00B2"
        };
        const odeStr = RK_FUNCTIONS[rkFuncId] || "dy/dx = y - x";
        return `Given ${odeStr}, y(${rkX0}) = ${rkY0}, find y(${ (parseFloat(rkX0) + parseInt(rkSteps) * parseFloat(rkH)).toFixed(2) }) in ${rkSteps} step(s) of h = ${rkH} using RK4.`;
      }
      return activeRKQuestion?.question || '';
    } else if (selectedMethod === 'Matrix Multiplication') {
      return activeMatMulQuestion?.question || 'Compute matrix product using row × column dot product rule.';
    }
    return `Solving math system using ${selectedMethod}.`;
  };

  // =============================================
  // VIEW 1: CARD SELECTION DASHBOARD
  // =============================================
  if (!selectedMethod) {
    return (
      <MathBackground>
        {/* Header breadcrumb */}
        <header className="h-16 flex items-center justify-between px-8 relative z-20 bg-[var(--db-card-bg)]/30 border-b border-[var(--db-card-border)] backdrop-blur-sm">
          <div className="flex items-center">
            <button onClick={() => navigate('/subjects/math-proto', { state: { activeView: 'practical' } })} className="mr-4 p-2 hover:bg-[var(--db-btn-secondary-hover)] rounded-full transition">
              <ArrowLeft className="w-5 h-5 text-[var(--db-text-main)]" />
            </button>
            <div className="flex items-center text-sm font-medium text-[var(--db-text-muted)] gap-2">
              <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span> <ChevronRight className="w-4 h-4" />
              <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/subjects')}>Subjects</span> <ChevronRight className="w-4 h-4" />
              <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/subjects/math-proto', { state: { activeView: 'practical' } })}>Mathematics</span> <ChevronRight className="w-4 h-4" />
              <span className="text-emerald-500 font-bold">Numerical Methods</span>
            </div>
          </div>
          <ThemeToggleButton />
        </header>

        <main className="max-w-7xl mx-auto w-full px-8 py-8 relative z-10">
          {/* Title Section */}
          <div className="mb-10 text-left flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/subjects/math-proto', { state: { activeView: 'practical' } })}
                className="p-3 bg-[var(--db-card-bg)] hover:bg-[var(--db-btn-secondary-hover)] border border-[var(--db-card-border)] rounded-2xl transition shadow-sm text-[var(--db-text-main)] flex items-center justify-center"
                title="Back to Mathematics Lab"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--db-text-main)]">
                NUMERICAL METHODS LAB
              </h1>
            </div>
            <p className="text-[var(--db-text-secondary)] text-lg mt-1">Select a mathematical runtime engine to execute your solution live.</p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CARDS.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => handleCardClick(card.id)}
                className="relative rounded-[24px] cursor-pointer group overflow-hidden border border-[var(--db-card-border)] bg-[var(--db-card-bg)] hover:bg-[var(--db-card-bg-elevated)] transition-all duration-300 shadow-md p-6 flex flex-col justify-between min-h-[380px]"
              >
                {/* Top border highlight */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${card.colorTheme === 'amber' ? 'amber-500' : card.colorTheme === 'emerald' ? 'emerald-500' : card.colorTheme}-500/40 to-transparent`} />

                <div className="space-y-4">
                  {/* Top Row: Icon and Method Number + Title */}
                  <div className="flex gap-4 items-start text-left">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${card.badgeClass}`}>
                      <span className="text-xl">{card.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-widest font-extrabold text-[var(--db-text-muted)]">
                        METHOD {index + 1}
                      </span>
                      <h3 className="text-base font-bold text-[var(--db-text-main)] mt-0.5 group-hover:text-emerald-450 transition-colors">
                        {card.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[var(--db-text-secondary)] text-xs leading-relaxed text-left line-clamp-2">
                    {card.desc}
                  </p>

                  {/* Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {card.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--db-card-border)] bg-[var(--db-card-bg-elevated)] text-[var(--db-text-secondary)]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Difficulty, Time, XP row */}
                  <div className="flex items-center gap-3 text-[11px] pt-1">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${
                      card.status === 'Beginner' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                      card.status === 'Intermediate' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' :
                      'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}>
                      {card.status}
                    </span>
                    <span className="text-[var(--db-text-muted)]">•</span>
                    <span className="text-[var(--db-text-secondary)] font-medium font-mono">{card.time}</span>
                    <span className="text-[var(--db-text-muted)]">•</span>
                    <span className="text-emerald-555 dark:text-emerald-400 font-bold font-mono">{card.xp}</span>
                  </div>
                </div>

                {/* Progress bar section */}
                <div className="mt-4 pt-3 border-t border-[var(--db-card-border)] space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[var(--db-text-muted)]">
                    <span>Progress</span>
                    <span>{card.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        card.colorTheme === 'blue' ? 'bg-blue-500' :
                        card.colorTheme === 'cyan' ? 'bg-cyan-500' :
                        card.colorTheme === 'emerald' ? 'bg-emerald-500' :
                        card.colorTheme === 'violet' ? 'bg-violet-500' :
                        card.colorTheme === 'amber' ? 'bg-amber-500' :
                        card.colorTheme === 'rose' ? 'bg-rose-500' :
                        'bg-sky-500'
                      }`}
                      style={{ width: `${card.progress}%` }} 
                    />
                  </div>
                </div>

                {/* Action button at bottom */}
                <button className={`w-full py-2.5 mt-5 font-bold rounded-xl text-xs transition duration-200 flex items-center justify-center gap-1.5 ${card.btnClass}`}>
                  <span>Launch Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </motion.div>
            ))}
          </div>
        </main>
      </MathBackground>
    );
  }

  // =============================================
  // VIEW 2: FORMULA INTERMEDIATE PAGE
  // =============================================
  if (showFormula && selectedMethod) {
    const methodFormulas = FORMULA_DATA[selectedMethod];
    const currentCard = CARDS.find(c => c.id === selectedMethod);
    const currentFormula = methodFormulas?.formulas?.[formulaPage] || methodFormulas?.formulas?.[0];
    const totalPages = methodFormulas?.formulas?.length || 1;

    return (
      <MathBackground>
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 relative z-20 bg-[var(--db-card-bg)]/30 border-b border-[var(--db-card-border)] backdrop-blur-sm">
          <div className="flex items-center">
            <button
              onClick={() => { setSelectedMethod(null); setShowFormula(false); }}
              className="px-4 py-1.5 hover:bg-[var(--db-btn-secondary-hover)] rounded-xl transition font-bold flex items-center gap-1.5 text-sm text-[var(--db-text-secondary)] border border-[var(--db-card-border)] bg-[var(--db-card-bg)]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Topics</span>
            </button>
          </div>
          <ThemeToggleButton />
        </header>

        <main className="max-w-7xl mx-auto w-full px-8 py-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* LEFT PANEL — Method Info Card */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 80 }}
                className="rounded-2xl p-8 h-full flex flex-col border border-[var(--db-card-border)] bg-[var(--db-card-bg)] shadow-md"
              >
                {/* Status Badge */}
                <span className="self-start text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-emerald-500/15 text-emerald-500 border-emerald-500/30 mb-6">
                  ONLINE
                </span>

                {/* Title */}
                <h2 className="text-3xl font-extrabold text-[var(--db-text-main)] mb-3">{currentCard?.title}</h2>
                <p className="text-[var(--db-text-secondary)] text-sm leading-relaxed mb-8">{currentCard?.desc}</p>

                {/* Features */}
                <div className="space-y-5 mb-8 flex-1">
                  {methodFormulas?.features?.map((feat, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 border border-emerald-500/25">
                        <feat.icon className="w-5 h-5 text-emerald-550" />
                      </div>
                      <div>
                        <h4 className="text-[var(--db-text-main)] font-bold text-sm">{feat.title}</h4>
                        <p className="text-[var(--db-text-muted)] text-xs">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Launch Button */}
                <button
                  onClick={handleLaunchSimulator}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-lg rounded-2xl flex items-center justify-center gap-3 transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98]"
                >
                  Launch Simulator <Rocket className="w-5 h-5" />
                </button>
              </motion.div>
            </div>

            {/* RIGHT PANEL — Formula Display */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 80, delay: 0.1 }}
                className="rounded-2xl p-8 h-full flex flex-col border border-[var(--db-card-border)] bg-[var(--db-card-bg)] shadow-md"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/25">
                      <FunctionSquare className="w-5 h-5 text-emerald-550" />
                    </div>
                    <span className="text-emerald-500 font-extrabold text-lg">Formula</span>
                  </div>
                  <button onClick={() => { setSelectedMethod(null); setShowFormula(false); }} className="p-2 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg transition text-[var(--db-text-muted)] hover:text-[var(--db-text-main)]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Formula Title */}
                <h3 className="text-xl font-bold text-[var(--db-text-main)] mb-6">{currentFormula?.title}</h3>

                {/* Formula Box */}
                <div className="rounded-xl p-6 mb-6 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)]">
                  <p className="text-emerald-600 dark:text-emerald-300 text-xl md:text-2xl font-mono text-center leading-relaxed tracking-wide">
                    {currentFormula?.formula}
                  </p>
                </div>

                {/* Variables */}
                <div className="flex-1">
                  <h4 className="text-[var(--db-text-main)] font-bold text-lg mb-4">Where:</h4>
                  <ul className="space-y-3">
                    {currentFormula?.variables?.map((v, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-emerald-550 font-mono font-bold text-sm shrink-0 mt-0.5">• {v.sym}</span>
                        <span className="text-[var(--db-text-secondary)] text-sm">= {v.def}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--db-card-border)]">
                    <button
                      onClick={() => setFormulaPage(Math.max(0, formulaPage - 1))}
                      disabled={formulaPage === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition border border-[var(--db-card-border)] ${formulaPage === 0 ? 'text-[var(--db-text-muted)] cursor-not-allowed' : 'text-[var(--db-text-secondary)] hover:bg-[var(--db-btn-secondary-hover)]'}`}
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setFormulaPage(i)}
                          className={`w-3 h-3 rounded-full transition ${i === formulaPage ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-[var(--db-text-muted)] hover:bg-[var(--db-text-secondary)]'}`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setFormulaPage(Math.min(totalPages - 1, formulaPage + 1))}
                      disabled={formulaPage === totalPages - 1}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${formulaPage === totalPages - 1 ? 'text-[var(--db-text-muted)] cursor-not-allowed border border-[var(--db-card-border)]' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'}`}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </main>
      </MathBackground>
    );
  }

  // =============================================
  // VIEW 3: VISUAL SOLVER LAYOUT (DYNAMIC THEME)
  // =============================================
  return (
    <div className={`h-screen w-full overflow-hidden flex flex-col font-sans db-page-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`} style={{ backgroundColor: 'var(--db-bg)', color: 'var(--db-text-main)' }}>
      
      {/* HEADER BREADCRUMB */}
      <header className="h-16 shrink-0 bg-[var(--db-card-bg)] border-b border-[var(--db-header-border)] flex items-center justify-between px-8 shadow-sm relative z-10">
        <div className="flex items-center">
          <button 
            onClick={() => {
              setSelectedMethod(null);
              setShowFormula(false);
              setPlaybackState('IDLE');
            }} 
            className="mr-4 px-3.5 py-1.5 rounded-xl transition font-bold flex items-center gap-1.5 text-xs bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] hover:bg-[var(--db-btn-secondary-hover)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Methods</span>
          </button>
          <div className="flex items-center text-sm font-medium text-[var(--db-text-muted)] gap-2">
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span> <ChevronRight className="w-4 h-4" />
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/subjects')}>Subjects</span> <ChevronRight className="w-4 h-4" />
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/subjects/math-proto', { state: { activeView: 'practical' } })}>Mathematics</span> <ChevronRight className="w-4 h-4" />
            <span className="text-emerald-500 font-bold">{selectedMethod}</span>
          </div>
        </div>
        <ThemeToggleButton />
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 gap-4 flex flex-row h-[calc(100vh-64px)] max-w-[1920px] mx-auto w-full overflow-hidden">
        
        {/* LEFT PANEL: INPUT SYSTEM */}
        <div className="w-full lg:w-1/4 lg:min-w-[280px] lg:h-full rounded-2xl flex flex-col shrink-0 overflow-hidden bg-[var(--db-card-bg)] border border-[var(--db-card-border)] shadow-md">
          
          <div className="flex-1 overflow-y-auto p-5 pb-2">
            <div className="mb-4">
              <h2 className="text-lg font-extrabold text-[var(--db-text-main)] flex items-center gap-2">
                <FunctionSquare className="w-5 h-5 text-emerald-500" /> Math Engine
              </h2>
              <p className="text-[var(--db-text-muted)] text-xs mt-1">Configure inputs and watch numerical methods solve live.</p>
            </div>

            {/* Method Selector */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Method</label>
              <select 
                value={selectedMethod}
                onChange={(e) => {
                  setSelectedMethod(e.target.value);
                  setPlaybackState('IDLE');
                }}
                className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
              >
                {CARDS.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* Conditional Input Rendering */}
            {selectedMethod === 'Bisection Method' ? (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Select Equation</label>
                  <select 
                    value={bisectionProblemId}
                    onChange={(e) => { setBisectionProblemId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
                  >
                    <option value="bis1">f(x) = x³ - x - 1 = 0</option>
                    <option value="bis2">f(x) = x³ - 4x - 9 = 0</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Iterations (Max 10)</label>
                  <input 
                    type="number" min="1" max="10" value={bisectionIterations} 
                    onChange={e => { setBisectionIterations(e.target.value); setPlaybackState('IDLE'); }} 
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
                  />
                </div>
              </>
            ) : selectedMethod === 'Trapezoidal Rule' ? (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Target Function f(x)</label>
                  <select 
                    value={funcId}
                    onChange={(e) => { setFuncId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
                  >
                    {PREDEFINED_FUNCTIONS.map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Lower [a]</label>
                    <input type="number" step="0.1" value={a} onChange={e => { setA(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Upper [b]</label>
                    <input type="number" step="0.1" value={b} onChange={e => { setB(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Steps (n)</label>
                    <input type="number" min="1" max="20" value={n} onChange={e => { setN(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                  </div>
                </div>
              </>
            ) : selectedMethod === 'Newton\u2019s Interpolation' ? (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Select Question</label>
                  <select 
                    value={newtonQuestionId}
                    onChange={(e) => {
                      setNewtonQuestionId(e.target.value);
                      const targetQ = NEWTON_QUESTIONS.find(q => q.id === e.target.value);
                      setNewtonTargetX(targetQ.defaultTarget.toString());
                      setNewtonDirection(targetQ.defaultDirection);
                      setPlaybackState('IDLE');
                    }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
                  >
                    {NEWTON_QUESTIONS.map(q => (
                      <option key={q.id} value={q.id}>{q.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Interpolation Direction</label>
                  <div className="flex p-1 rounded-xl bg-[var(--db-input-bg)] border border-[var(--db-input-border)]">
                    {['Forward', 'Backward'].map(dir => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => { setNewtonDirection(dir); setPlaybackState('IDLE'); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${newtonDirection === dir ? 'bg-emerald-500 text-white shadow' : 'text-[var(--db-text-secondary)] hover:text-[var(--db-text-main)]'}`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Estimate Value at (x)</label>
                  <input 
                    type="number" step="0.01" value={newtonTargetX} 
                    onChange={e => { setNewtonTargetX(e.target.value); setPlaybackState('IDLE'); }} 
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
                  />
                </div>
              </>
            ) : selectedMethod === 'Newton\u2019s Difference' ? (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Select Question</label>
                  <select 
                    value={newtonDiffQuestionId}
                    onChange={(e) => {
                      setNewtonDiffQuestionId(e.target.value);
                      const targetQ = NEWTON_DIFF_QUESTIONS.find(q => q.id === e.target.value);
                      setNewtonDiffTargetX(targetQ.defaultTarget.toString());
                      setNewtonDiffDirection(targetQ.defaultDirection);
                      setPlaybackState('IDLE');
                    }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
                  >
                    {NEWTON_DIFF_QUESTIONS.map(q => (
                      <option key={q.id} value={q.id}>{q.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Interpolation Direction</label>
                  <div className="flex p-1 rounded-xl bg-[var(--db-input-bg)] border border-[var(--db-input-border)]">
                    {['Forward', 'Backward'].map(dir => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => { setNewtonDiffDirection(dir); setPlaybackState('IDLE'); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${newtonDiffDirection === dir ? 'bg-emerald-500 text-white shadow' : 'text-[var(--db-text-secondary)] hover:text-[var(--db-text-main)]'}`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Evaluate Derivative at (x)</label>
                  <input 
                    type="number" step="0.01" value={newtonDiffTargetX} 
                    onChange={e => { setNewtonDiffTargetX(e.target.value); setPlaybackState('IDLE'); }} 
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
                  />
                </div>
              </>
            ) : selectedMethod === 'Simpson\u2019s 1/3 Rule' || selectedMethod === "Simpson's 1/3 Rule" ? (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Select Question</label>
                  <select 
                    value={simpson13ProblemId}
                    onChange={(e) => { setSimpson13ProblemId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
                  >
                    {SIMPSON_13_QUESTIONS.map(q => (
                      <option key={q.id} value={q.id}>{q.label}</option>
                    ))}
                  </select>
                </div>
                {simpson13ProblemId === 'custom' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Target Function f(x)</label>
                      <select 
                        value={funcId}
                        onChange={(e) => { setFuncId(e.target.value); setPlaybackState('IDLE'); }}
                        className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
                      >
                        {PREDEFINED_FUNCTIONS.map(f => (
                          <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Lower [a]</label>
                        <input type="number" step="0.1" value={simpson13A} onChange={e => { setSimpson13A(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Upper [b]</label>
                        <input type="number" step="0.1" value={simpson13B} onChange={e => { setSimpson13B(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Steps (n)</label>
                        <input type="number" min="2" max="20" step="2" value={simpson13N} onChange={e => { setSimpson13N(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : selectedMethod === 'Simpson\u2019s 3/8 Rule' || selectedMethod === "Simpson's 3/8 Rule" ? (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Select Question</label>
                  <select 
                    value={simpson38ProblemId}
                    onChange={(e) => { setSimpson38ProblemId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
                  >
                    {SIMPSON_38_QUESTIONS.map(q => (
                      <option key={q.id} value={q.id}>{q.label}</option>
                    ))}
                  </select>
                </div>
                {simpson38ProblemId === 'custom' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Target Function f(x)</label>
                      <select 
                        value={funcId}
                        onChange={(e) => { setFuncId(e.target.value); setPlaybackState('IDLE'); }}
                        className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
                      >
                        {PREDEFINED_FUNCTIONS.map(f => (
                          <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Lower [a]</label>
                        <input type="number" step="0.1" value={simpson38A} onChange={e => { setSimpson38A(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Upper [b]</label>
                        <input type="number" step="0.1" value={simpson38B} onChange={e => { setSimpson38B(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Steps (n)</label>
                        <input type="number" min="3" max="21" step="3" value={simpson38N} onChange={e => { setSimpson38N(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : selectedMethod === 'RK4' ? (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Select Question</label>
                  <select 
                    value={rkProblemId}
                    onChange={(e) => { setRkProblemId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
                  >
                    {RK_QUESTIONS.map(q => (
                      <option key={q.id} value={q.id}>{q.label}</option>
                    ))}
                  </select>
                </div>
                {rkProblemId === 'custom' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">ODE dy/dx = f(x,y)</label>
                      <select 
                        value={rkFuncId}
                        onChange={(e) => { setRkFuncId(e.target.value); setPlaybackState('IDLE'); }}
                        className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
                      >
                        <option value="y_minus_x">dy/dx = y - x</option>
                        <option value="x_plus_y">dy/dx = x + y</option>
                        <option value="minus_2xy">dy/dx = -2xy</option>
                        <option value="y_plus_x2">dy/dx = y + x\u00B2</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Initial x\u2080</label>
                        <input type="number" step="0.1" value={rkX0} onChange={e => { setRkX0(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Initial y\u2080</label>
                        <input type="number" step="0.1" value={rkY0} onChange={e => { setRkY0(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Step size (h)</label>
                        <input type="number" step="0.05" min="0.01" max="1" value={rkH} onChange={e => { setRkH(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Steps Count</label>
                        <input type="number" min="1" max="10" value={rkSteps} onChange={e => { setRkSteps(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : selectedMethod === 'Matrix Multiplication' ? (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Select Problem</label>
                  <select 
                    value={matMulQuestionId}
                    onChange={(e) => { setMatMulQuestionId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-indigo-500 outline-none text-[var(--db-text-main)]"
                  >
                    {MATRIX_MUL_QUESTIONS.map(q => (
                      <option key={q.id} value={q.id}>{q.label}</option>
                    ))}
                  </select>
                </div>
                {activeMatMulQuestion && (
                  <div className="rounded-xl p-4 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Matrix Preview</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-center">
                        <p className="text-[9px] text-[var(--db-text-muted)] mb-1 font-bold">Matrix A</p>
                        <div className="font-mono text-xs text-[var(--db-text-main)] border border-[var(--db-card-border)] rounded-lg p-2 bg-[var(--db-card-bg)]">
                          {activeMatMulQuestion.matA.map((row, i) => (
                            <div key={i} className="flex gap-2 justify-center">
                              {row.map((v, j) => <span key={j} className="min-w-[3.5rem] text-center inline-block">{v}</span>)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <span className="text-[var(--db-text-muted)] font-bold text-lg">×</span>
                      <div className="text-center">
                        <p className="text-[9px] text-[var(--db-text-muted)] mb-1 font-bold">Matrix B</p>
                        <div className="font-mono text-xs text-[var(--db-text-main)] border border-[var(--db-card-border)] rounded-lg p-2 bg-[var(--db-card-bg)]">
                          {activeMatMulQuestion.matB.map((row, i) => (
                            <div key={i} className="flex gap-2 justify-center">
                              {row.map((v, j) => <span key={j} className="min-w-[3.5rem] text-center inline-block">{v}</span>)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-[var(--db-text-muted)] leading-relaxed">{activeMatMulQuestion.description}</p>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Playback Controls */}
          <div className="p-4 pt-2 shrink-0 border-t border-[var(--db-card-border)]">
            <div className="rounded-2xl p-4 flex flex-col gap-3 bg-[var(--db-card-bg-elevated)]">
              <div className="flex justify-between items-center p-1 rounded-xl bg-[var(--db-input-bg)] border border-[var(--db-card-border)]">
                {[0.5, 1, 2].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSpeed(s)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${speed === s ? 'bg-emerald-500 text-white shadow' : 'text-[var(--db-text-muted)] hover:text-[var(--db-text-main)]'}`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePlayPause}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-655 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-emerald-500/20"
                >
                  {playbackState === 'PLAYING' ? <><Pause className="w-5 h-5"/> Pause</> : <><Play className="w-5 h-5"/> {playbackState === 'FINISHED' ? 'Restart' : 'Start Solving'}</>}
                </button>
                <button onClick={handleReplay} className="w-12 h-[48px] rounded-xl flex items-center justify-center transition active:scale-95 text-[var(--db-text-main)] hover:text-emerald-500 bg-[var(--db-input-bg)] border border-[var(--db-card-border)]">
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE PANEL: ANIMATION ENGINE */}
        <div className="w-full lg:flex-1 min-h-[400px] lg:h-full rounded-2xl flex flex-col relative overflow-hidden shrink-0 bg-[var(--db-card-bg)] border border-[var(--db-card-border)] shadow-md">
          {/* Question Display */}
          <div className="shrink-0 px-6 py-3 flex items-center gap-3 bg-[var(--db-card-bg-elevated)] border-b border-[var(--db-card-border)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="text-[12px] font-bold text-[var(--db-text-secondary)] font-sans tracking-wide">
              {getTopQuestionText()}
            </span>
          </div>

          {/* Status bar */}
          <div className="px-6 py-2 flex items-center gap-2 border-b border-[var(--db-card-border)]">
            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">
              {playbackState === 'IDLE' ? 'READY TO EXECUTE' : playbackState === 'PLAYING' ? 'EXECUTING...' : playbackState === 'PAUSED' ? 'PAUSED' : 'COMPLETE'}
            </span>
            <div className="flex-1 h-1 rounded-full overflow-hidden ml-2 bg-[var(--db-input-bg)] border border-[var(--db-card-border)]">
              <div className={`h-full bg-emerald-500 rounded-full transition-all ${playbackState === 'PLAYING' ? 'animate-pulse' : ''}`} style={{ width: playbackState === 'FINISHED' ? '100%' : playbackState === 'PLAYING' ? '60%' : '15%' }}></div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {renderActiveEngine()}
          </div>
        </div>

        {/* RIGHT PANEL: AI EXPLAINER */}
        <div className="w-full lg:w-1/4 lg:min-w-[280px] lg:h-full flex flex-col gap-4 shrink-0">
          <div className="flex-1 rounded-2xl p-5 text-[var(--db-text-main)] flex flex-col relative overflow-hidden bg-[var(--db-card-bg)] border border-[var(--db-card-border)] shadow-md">
            <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
              <BrainCircuit className="w-64 h-64 text-emerald-500" />
            </div>
            
            <div className="flex items-center gap-3 mb-5 relative z-10 pb-4 border-b border-[var(--db-card-border)]">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Settings2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--db-text-main)]">Execution Trace</h3>
                <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Live Interpreter</p>
              </div>
            </div>

            <div className="flex-1 relative z-10 font-mono text-[13px] leading-relaxed text-emerald-50 flex flex-col">
              <div className="mb-4 text-slate-500">
                &gt; Analyzing runtime parameters...<br/>
                &gt; Method: {selectedMethod}<br/>
                {selectedMethod === 'Trapezoidal Rule' ? (
                  <>&gt; Interval: [{a}, {b}], Steps: {n}<br/></>
                ) : (
                  <>&gt; Target X: {selectedMethod === 'Newton\u2019s Difference' ? newtonDiffTargetX : newtonTargetX}<br/></>
                )}
                &gt; Standby.
              </div>

              {playbackState !== 'IDLE' && (
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentExplanation}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-r-lg bg-emerald-500/10 border-l-2 border-emerald-500 text-[var(--db-text-main)]"
                  >
                    <span className="text-emerald-500 font-bold mb-1 block">CURRENT STEP:</span>
                    {currentExplanation}
                  </motion.div>
                </AnimatePresence>
              )}

              {playbackState === 'FINISHED' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-emerald-500 font-bold"
                >
                  &gt; Execution completed successfully.
                </motion.div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
