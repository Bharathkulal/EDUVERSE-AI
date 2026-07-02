import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, ChevronLeft, Play, Pause, RotateCcw,
  Settings2, Activity, BrainCircuit, FunctionSquare, Rocket, X,
  BookOpen, Target, Lightbulb, ArrowRight
} from 'lucide-react';
import CalculusNotebookEngine from '../components/MathEngines/CalculusNotebookEngine';
import MathBackground from '../components/MathBackground';
import { useTheme } from '../context/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';

export default function CalculusVisualization() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // View state
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showFormula, setShowFormula] = useState(false);
  const [formulaPage, setFormulaPage] = useState(0);

  // Gauss Seidel inputs
  const [gaussSeidelProblemId, setGaussSeidelProblemId] = useState('gs1');
  const [gaussSeidelIterations, setGaussSeidelIterations] = useState('3');

  // Jacobi inputs
  const [jacobiProblemId, setJacobiProblemId] = useState('jb1');
  const [jacobiIterations, setJacobiIterations] = useState('3');

  // Fitting Straight Line inputs
  const [fslProblemId, setFslProblemId] = useState('fs1');

  // Regula Falsi inputs
  const [rfProblemId, setRfProblemId] = useState('rf1');
  const [rfIterations, setRfIterations] = useState('7');

  // Iteration Method inputs
  const [iterProblemId, setIterProblemId] = useState('it1');
  const [iterIterations, setIterIterations] = useState('8');

  // Newton-Raphson inputs
  const [nrProblemId, setNrProblemId] = useState('nr1');
  const [nrIterations, setNrIterations] = useState('5');

  // Lagrange Interpolation inputs
  const [lagrangeProblemId, setLagrangeProblemId] = useState('lg1');

  // Newton General Interpolation inputs
  const [newtonGenProblemId, setNewtonGenProblemId] = useState('ng1');

  // Playback control
  const [playbackState, setPlaybackState] = useState('IDLE');
  const [speed, setSpeed] = useState(1);
  const [currentExplanation, setCurrentExplanation] = useState('Waiting for execution to start...');

  const GAUSS_SEIDEL_PROBS = [
    { id: 'gs1', label: 'Gauss-Seidel: 4-Var System (Photo Q1)' },
    { id: 'gs2', label: 'Gauss-Seidel: 3-Var System (Photo Q2)' },
  ];

  const JACOBI_PROBS = [
    { id: 'jb1', label: 'Jacobi: 4-Var System (Photo Q1)' },
    { id: 'jb2', label: 'Jacobi: 3-Var System (Photo Q2)' },
  ];

  const FSL_PROBS = [
    { id: 'fs1', label: 'FSL: Copper rod T vs l (Photo Q1)' },
    { id: 'fs2', label: 'FSL: Experiment x vs y (Photo Q2)' },
  ];

  const RF_PROBS = [
    { id: 'rf1', label: 'f(x) = x³ - 2x - 5 = 0  [a=2, b=3] (Photo Q)' },
    { id: 'rf2', label: 'f(x) = x³ - x - 2 = 0  [a=1, b=2]' },
  ];

  const ITER_PROBS = [
    { id: 'it1', label: '2x = cos(x)+3  →  φ(x)=½(cos x+3) (Photo Q1)' },
    { id: 'it2', label: 'xeˣ = 1  →  φ(x)=e⁻ˣ (Photo Q2)' },
    { id: 'it3', label: 'x³ - x - 1 = 0  →  φ(x)=∛(x+1)' },
  ];

  const NR_PROBS = [
    { id: 'nr1', label: 'f(x) = x³ - 2x - 5 = 0  [x₀=2.5] (Photo Q)' },
    { id: 'nr2', label: 'f(x) = x³ - x - 1 = 0  [x₀=1.5]' },
    { id: 'nr3', label: 'f(x) = cos(x) - x = 0  [x₀=1.0]' },
  ];

  const LAGRANGE_PROBS = [
    { id: 'lg1', label: 'log₁₀(x): (300,304,305,307) → find log₁₀(301) (Photo Q1)' },
    { id: 'lg2', label: '√x: (150,152,154,156) → find √155 (Photo Q2)' },
    { id: 'lg3', label: 'f(x)=1/x: (4,5,6) → find f(4.5)' },
  ];

  const NEWTON_GEN_PROBS = [
    { id: 'ng1', label: 'log₁₀(x): (300,304,305,307) → find log₁₀(301) (Photo Q1)' },
    { id: 'ng2', label: 'f(x): (-1,0,3,6,7) → express as polynomial (Photo Q2)' },
    { id: 'ng3', label: 'f(x)=sin(x): (0°,30°,60°,90°) → find f(45°)' },
  ];

  const CARDS = [
    { 
      id: 'Gauss Seidel Method', 
      title: 'Gauss Seidel Method', 
      desc: 'Solve systems of linear equations iteratively using successive displacement.', 
      status: 'Advanced', 
      time: '20 mins', 
      xp: '150 XP', 
      progress: 40,
      tags: ['Linear Systems', 'Successive', 'Iterative'],
      colorTheme: 'rose',
      btnClass: 'bg-rose-500 hover:bg-rose-600 text-white',
      badgeClass: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
      icon: '📐'
    },
    { 
      id: 'Jacobi Method', 
      title: 'Jacobi Method', 
      desc: 'Solve systems of linear equations iteratively using simultaneous displacement.', 
      status: 'Intermediate', 
      time: '15 mins', 
      xp: '100 XP', 
      progress: 60,
      tags: ['Linear Systems', 'Simultaneous', 'Iterative'],
      colorTheme: 'purple',
      btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
      badgeClass: 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
      icon: '🧩'
    },
    { 
      id: 'Regula Falsi Method', 
      title: 'Regula Falsi Method', 
      desc: 'Find real roots of nonlinear equations using the false position (chord) method.', 
      status: 'Intermediate', 
      time: '15 mins', 
      xp: '120 XP', 
      progress: 50,
      tags: ['Root Finding', 'False Position', 'Brackets'],
      colorTheme: 'violet',
      btnClass: 'bg-violet-600 hover:bg-violet-700 text-white',
      badgeClass: 'bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400',
      icon: '🌀'
    },
    { 
      id: 'Iteration Method', 
      title: 'Iteration Method', 
      desc: 'Solve f(x)=0 by rewriting as x=φ(x) and repeatedly applying the mapping until convergence.', 
      status: 'Beginner', 
      time: '10 mins', 
      xp: '80 XP', 
      progress: 90,
      tags: ['Root Finding', 'x = φ(x)', 'Convergence'],
      colorTheme: 'teal',
      btnClass: 'bg-teal-600 hover:bg-teal-700 text-white',
      badgeClass: 'bg-teal-500/10 border-teal-500/20 text-teal-650 dark:text-teal-400',
      icon: '📊'
    },
    { 
      id: 'Newton-Raphson Method', 
      title: 'Newton-Raphson Method', 
      desc: 'Find roots of nonlinear equations using tangent lines for quadratic convergence.', 
      status: 'Advanced', 
      time: '15 mins', 
      xp: '150 XP', 
      progress: 70,
      tags: ['Root Finding', 'Tangent Lines', 'Quadratic'],
      colorTheme: 'amber',
      btnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
      badgeClass: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
      icon: '📐'
    },
    { 
      id: 'Lagrange Interpolation', 
      title: 'Lagrange Interpolation', 
      desc: 'Estimate f(x) at any point using a polynomial built from known data pairs.', 
      status: 'Intermediate', 
      time: '15 mins', 
      xp: '100 XP', 
      progress: 85,
      tags: ['Interpolation', 'Polynomials', 'Known Pairs'],
      colorTheme: 'blue',
      btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      badgeClass: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
      icon: '📈'
    },
    { 
      id: 'Newton General Interpolation', 
      title: "Newton's General Interpolation", 
      desc: 'Use divided differences to build a polynomial and interpolate at any argument.', 
      status: 'Advanced', 
      time: '20 mins', 
      xp: '150 XP', 
      progress: 30,
      tags: ['Interpolation', 'Divided Diff', 'Unequal spacing'],
      colorTheme: 'pink',
      btnClass: 'bg-pink-600 hover:bg-pink-700 text-white',
      badgeClass: 'bg-pink-500/10 border-pink-500/20 text-pink-600 dark:text-pink-400',
      icon: '🧪'
    },
    { 
      id: 'Fitting Straight Line', 
      title: 'Fitting Straight Line', 
      desc: 'Fit a straight line y = a₀ + a₁x to a set of data points using least squares.', 
      status: 'Beginner', 
      time: '12 mins', 
      xp: '90 XP', 
      progress: 95,
      tags: ['Least Squares', 'Curve Fitting', 'y = a₀ + a₁x'],
      colorTheme: 'sky',
      btnClass: 'bg-sky-500 hover:bg-sky-600 text-white',
      badgeClass: 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400',
      icon: '📏'
    }
  ];

  // ─── Formula data per method ──────────────────────────────────────────────
  const FORMULA_DATA = {
    'Gauss Seidel Method': {
      features: [
        { icon: BookOpen, title: 'Iterative Solver',     desc: 'Find solutions to system of linear equations.' },
        { icon: Target,   title: 'Successive Displacement', desc: 'Uses newly computed values immediately.' },
        { icon: Lightbulb, title: 'Photo Problem',        desc: 'Solve 10x₁ - 2x₂ - x₃ - x₄ = 3, etc.' },
      ],
      formulas: [
        {
          title: 'Gauss-Seidel Iteration Formula',
          formula: 'x_i^(k+1) = (1/a_ii) [ b_i − ∑(j<i) a_ij x_j^(k+1) − ∑(j>i) a_ij x_j^(k) ]',
          variables: [
            { sym: 'a_ii',       def: 'Diagonal coefficient for equation i' },
            { sym: 'b_i',        def: 'RHS constant term for equation i' },
            { sym: 'x_j^(k+1)',  def: 'New values computed in current iteration' },
            { sym: 'x_j^(k)',    def: 'Old values from previous iteration' },
          ],
        },
      ],
    },
    'Jacobi Method': {
      features: [
        { icon: BookOpen, title: 'Iterative Solver',     desc: 'Find solutions to system of linear equations.' },
        { icon: Target,   title: 'Simultaneous Displacement', desc: 'Uses old values from previous iteration.' },
        { icon: Lightbulb, title: 'Photo Problem',        desc: 'Solve 10x₁ - 2x₂ - x₃ - x₄ = 3, etc.' },
      ],
      formulas: [
        {
          title: 'Jacobi Iteration Formula',
          formula: 'x_i^(k+1) = (1/a_ii) [ b_i − ∑(j≠i) a_ij x_j^(k) ]',
          variables: [
            { sym: 'a_ii',       def: 'Diagonal coefficient for equation i' },
            { sym: 'b_i',        def: 'RHS constant term for equation i' },
            { sym: 'x_j^(k)',    def: 'Values from previous iteration' },
          ],
        },
      ],
    },
    'Regula Falsi Method': {
      features: [
        { icon: BookOpen,  title: 'False Position',        desc: 'Interpolate a chord between two bracket points to find the root.' },
        { icon: Target,    title: 'Guaranteed Convergence', desc: 'Always stays bracketed — root never escapes the interval.' },
        { icon: Lightbulb, title: 'Photo Problem',          desc: 'Solve f(x) = x³ - 2x - 5 = 0 from your exam notebook.' },
      ],
      formulas: [
        {
          title: 'Regula Falsi (False Position) Formula',
          formula: 'x = [ a·f(b) − b·f(a) ] / [ f(b) − f(a) ]',
          variables: [
            { sym: 'a, b', def: 'Current bracket endpoints where f(a)·f(b) < 0' },
            { sym: 'x',    def: 'New approximation (point where chord crosses x-axis)' },
            { sym: 'f(a)', def: 'Function value at left bracket a' },
            { sym: 'f(b)', def: 'Function value at right bracket b' },
          ],
        },
      ],
    },
    'Iteration Method': {
      features: [
        { icon: BookOpen,  title: 'Fixed-Point Iteration', desc: 'Rewrite f(x)=0 as x=φ(x) and iterate xₙ₊₁=φ(xₙ).' },
        { icon: Target,    title: 'Convergence Condition', desc: '|φ′(x)| < 1 in the interval ensures the iterations converge.' },
        { icon: Lightbulb, title: 'Photo Problems',        desc: 'Solve 2x=cos(x)+3 and xeˣ=1 from your exam notebook.' },
      ],
      formulas: [
        {
          title: 'Iteration (Fixed-Point) Formula',
          formula: 'xₙ₊₁ = φ(xₙ)',
          variables: [
            { sym: 'xₙ',    def: 'Current approximation at step n' },
            { sym: 'φ(x)',  def: 'Rearranged form: x = φ(x)  from f(x) = 0' },
            { sym: 'xₙ₊₁', def: 'Next approximation, obtained by applying φ to xₙ' },
            { sym: '|φ′|<1', def: 'Convergence criterion — derivative of φ must be < 1 in magnitude' },
          ],
        },
      ],
    },
    'Newton-Raphson Method': {
      features: [
        { icon: BookOpen,  title: 'Tangent Line Method',   desc: 'Use the tangent at xₙ to project to the x-axis for the next guess.' },
        { icon: Target,    title: 'Quadratic Convergence', desc: 'Doubles correct decimal places each step — very fast near the root.' },
        { icon: Lightbulb, title: 'Photo Problem',         desc: 'Solve f(x)=x³-2x-5=0 correct to 3 decimal places (x₀=2.5).' },
      ],
      formulas: [
        {
          title: 'Newton-Raphson Iteration Formula',
          formula: 'xₙ = xₙ₋₁ − f(xₙ₋₁) / f′(xₙ₋₁)',
          variables: [
            { sym: 'xₙ₋₁',     def: 'Previous approximation' },
            { sym: 'f(xₙ₋₁)',  def: 'Function value at current approximation' },
            { sym: 'f′(xₙ₋₁)', def: 'Derivative value at current approximation' },
            { sym: 'xₙ',       def: 'Improved approximation after applying the formula' },
          ],
        },
      ],
    },
    'Lagrange Interpolation': {
      features: [
        { icon: BookOpen,  title: 'Polynomial Fit',      desc: 'Constructs a unique polynomial through n+1 given data points.' },
        { icon: Target,    title: 'Works for Unequal h', desc: 'No need for equally-spaced nodes — works with any x values.' },
        { icon: Lightbulb, title: 'Photo Problems',      desc: 'Find log₁₀(301) and √155 from your exam notebook.' },
      ],
      formulas: [
        {
          title: "Lagrange's Interpolation Formula",
          formula: 'L(x) = Σᵢ yᵢ · ∏ⱼ≠ᵢ (x−xⱼ)/(xᵢ−xⱼ)',
          variables: [
            { sym: 'xᵢ, yᵢ', def: 'Known data point pairs (i = 0, 1, …, n)' },
            { sym: 'x',       def: 'The argument at which we interpolate' },
            { sym: 'Lᵢ(x)',   def: 'Lagrange basis polynomial for node i' },
            { sym: 'L(x)',    def: 'Final interpolated value at x' },
          ],
        },
      ],
    },
    'Newton General Interpolation': {
      features: [
        { icon: BookOpen,  title: 'Divided Differences', desc: 'Builds a difference table [x₀,x₁], [x₀,x₁,x₂], … recursively.' },
        { icon: Target,    title: 'Unequal Spacing OK',  desc: 'Works for any node spacing — more general than forward/backward.' },
        { icon: Lightbulb, title: 'Photo Problems',      desc: 'Find log₁₀(301) and express f(x) as a polynomial from notebook.' },
      ],
      formulas: [
        {
          title: "Newton's General (Divided Difference) Formula",
          formula: 'y = y₀ + (x−x₀)[x₀,x₁] + (x−x₀)(x−x₁)[x₀,x₁,x₂] + …',
          variables: [
            { sym: 'y₀',            def: 'Function value at x₀' },
            { sym: '[x₀,x₁]',       def: 'First divided difference = (y₁−y₀)/(x₁−x₀)' },
            { sym: '[x₀,x₁,x₂]',   def: 'Second divided difference (recursive)' },
            { sym: '(x−xᵢ)',        def: 'Product terms that weight each difference level' },
          ],
        },
      ],
    },
    'Fitting Straight Line': {
      features: [
        { icon: BookOpen,  title: 'Linear Regression',   desc: 'Find the best-fitting straight line through a set of data points.' },
        { icon: Target,    title: 'Least Squares Method', desc: 'Minimizes the sum of squared residuals (errors).' },
        { icon: Lightbulb, title: 'Photo Problems',      desc: 'Fit copper rod l vs T and experimental x vs y from your notebook.' },
      ],
      formulas: [
        {
          title: 'Fitting a Straight Line Formula',
          formula: 'y = a₀ + a₁x',
          variables: [
            { sym: 'a₀',         def: 'y-intercept of the line' },
            { sym: 'a₁',         def: 'Slope (coefficient of x) of the line' },
            { sym: 'Σy',         def: 'Sum of all y values' },
            { sym: 'Σx',         def: 'Sum of all x values' },
            { sym: 'Normal Eq 1', def: 'Σy = n·a₀ + a₁·Σx' },
            { sym: 'Normal Eq 2', def: 'Σxy = a₀·Σx + a₁·Σx²' },
          ],
        },
      ],
    },
  };

  // ─── Engine Event Handlers ────────────────────────────────────────────────
  const handleExplanationUpdate = (text) => setCurrentExplanation(text);
  const handleExecutionFinished = () => setPlaybackState('FINISHED');

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

  // ─── Active engine ────────────────────────────────────────────────────────
  const renderActiveEngine = () => {
    if (!selectedMethod) return null;

    const commonProps = {
      method: selectedMethod,
      playbackState,
      speed,
      onExplain: handleExplanationUpdate,
      onFinish: handleExecutionFinished,
      gaussSeidelProblemId,
      gaussSeidelIterations,
      jacobiProblemId,
      jacobiIterations,
      fslProblemId,
      rfProblemId,
      rfIterations,
      iterProblemId,
      iterIterations,
      nrProblemId,
      nrIterations,
      lagrangeProblemId,
      newtonGenProblemId,
    };

    return <CalculusNotebookEngine {...commonProps} />;
  };

  // ─── Top question text ────────────────────────────────────────────────────
  const getTopQuestionText = () => {
    if (selectedMethod === 'Gauss Seidel Method') {
      return gaussSeidelProblemId === 'gs1'
        ? 'Solve: 10x₁-2x₂-x₃-x₄=3, -2x₁+10x₂-x₃-x₄=15, -x₁-x₂+10x₃-2x₄=27, -x₁-x₂-2x₃+10x₄=9'
        : 'Solve: 83x + 11y - 4z = 95, 7x + 52y + 13z = 104, 3x + 8y + 29z = 71';
    }
    if (selectedMethod === 'Jacobi Method') {
      return jacobiProblemId === 'jb1'
        ? 'Solve (Jacobi): 10x₁-2x₂-x₃-x₄=3, -2x₁+10x₂-x₃-x₄=15, -x₁-x₂+10x₃-2x₄=27, -x₁-x₂-2x₃+10x₄=9'
        : 'Solve (Jacobi): 83x + 11y - 4z = 95, 7x + 52y + 13z = 104, 3x + 8y + 29z = 71';
    }
    if (selectedMethod === 'Regula Falsi Method') {
      return rfProblemId === 'rf1'
        ? 'Find real root: f(x) = x³ - 2x - 5 = 0  [a=2, b=3] using Regula Falsi'
        : 'Find real root: f(x) = x³ - x - 2 = 0  [a=1, b=2] using Regula Falsi';
    }
    if (selectedMethod === 'Iteration Method') {
      const labels = { it1: '2x = cos(x)+3  →  φ(x)=½(cos x+3), x₀=π/2', it2: 'xeˣ = 1  →  φ(x)=e⁻ˣ, x₀=0.5', it3: 'x³-x-1=0  →  φ(x)=∛(x+1), x₀=1.3' };
      return `Iteration Method: ${labels[iterProblemId] || iterProblemId}`;
    }
    if (selectedMethod === 'Newton-Raphson Method') {
      const labels = { nr1: 'f(x)=x³-2x-5=0, x₀=2.5 (Photo Q)', nr2: 'f(x)=x³-x-1=0, x₀=1.5', nr3: 'f(x)=cos(x)-x=0, x₀=1.0' };
      return `Newton-Raphson: ${labels[nrProblemId] || nrProblemId}`;
    }
    if (selectedMethod === 'Lagrange Interpolation') {
      const labels = { lg1: 'Find log₁₀(301) from log table (Photo Q1)', lg2: 'Find √155 from √x table (Photo Q2)', lg3: 'Find f(4.5) for f(x)=1/x' };
      return `Lagrange Interpolation: ${labels[lagrangeProblemId] || lagrangeProblemId}`;
    }
    if (selectedMethod === 'Newton General Interpolation') {
      const labels = { ng1: 'Find log₁₀(301) via divided differences (Photo Q1)', ng2: 'Express f(x) as polynomial — divided diff table (Photo Q2)', ng3: 'Find sin(45°) via divided differences' };
      return `Newton Divided Diff: ${labels[newtonGenProblemId] || newtonGenProblemId}`;
    }
    if (selectedMethod === 'Fitting Straight Line') {
      return fslProblemId === 'fs1'
        ? 'Fit straight line: Copper rod T vs l (Photo Q1)'
        : 'Fit straight line: Experiment x vs y (Photo Q2)';
    }
    return `Solving using ${selectedMethod}.`;
  };

  // ─── VIEW 1: CARD SELECTION DASHBOARD ─────────────────────────────────────
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
              <span className="text-emerald-500 font-bold">Calculus Simulator</span>
            </div>
          </div>
          <ThemeToggleButton />
        </header>

        <main className="max-w-7xl mx-auto w-full px-8 py-8 relative z-10">
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
                CALCULUS SIMULATOR
              </h1>
            </div>
            <p className="text-[var(--db-text-secondary)] text-lg mt-1">Select a calculus engine to solve limits, derivatives, and integrals live.</p>
          </div>

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
                      <h3 className="text-base font-bold text-[var(--db-text-main)] mt-0.5 group-hover:text-emerald-500 transition-colors">
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
                        card.colorTheme === 'purple' ? 'bg-purple-500' :
                        card.colorTheme === 'pink' ? 'bg-pink-500' :
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

  // ─── VIEW 2: FORMULA INTERMEDIATE PAGE ────────────────────────────────────
  if (showFormula && selectedMethod) {
    const methodFormulas = FORMULA_DATA[selectedMethod];
    const currentCard    = CARDS.find(c => c.id === selectedMethod);
    const currentFormula = methodFormulas?.formulas?.[formulaPage] || methodFormulas?.formulas?.[0];
    const totalPages     = methodFormulas?.formulas?.length || 1;

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

            {/* LEFT PANEL */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 80 }}
                className="rounded-2xl p-8 h-full flex flex-col border border-[var(--db-card-border)] bg-[var(--db-card-bg)] shadow-md"
              >

                <span className="self-start text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-emerald-500/15 text-emerald-500 border-emerald-500/30 mb-6">ONLINE</span>
                <h2 className="text-3xl font-extrabold text-[var(--db-text-main)] mb-3">{currentCard?.title}</h2>
                <p className="text-[var(--db-text-secondary)] text-sm leading-relaxed mb-8">{currentCard?.desc}</p>
                <div className="space-y-5 mb-8 flex-1">
                  {methodFormulas?.features?.map((feat, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 border border-emerald-500/25">
                        <feat.icon className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="text-[var(--db-text-main)] font-bold text-sm">{feat.title}</h4>
                        <p className="text-[var(--db-text-muted)] text-xs">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleLaunchSimulator}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-lg rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98]"
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/25">
                      <FunctionSquare className="w-5 h-5 text-emerald-555" />
                    </div>
                    <span className="text-emerald-550 font-extrabold text-lg">Formula</span>
                  </div>
                  <button onClick={() => { setSelectedMethod(null); setShowFormula(false); }} className="p-2 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg transition text-[var(--db-text-muted)] hover:text-[var(--db-text-main)]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-[var(--db-text-main)] mb-6">{currentFormula?.title}</h3>

                <div className="rounded-xl p-6 mb-6 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)]">
                  <p className="text-emerald-600 dark:text-emerald-300 text-xl md:text-2xl font-mono text-center leading-relaxed tracking-wide">
                    {currentFormula?.formula}
                  </p>
                </div>

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
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${formulaPage === totalPages - 1 ? 'text-[var(--db-text-muted)] cursor-not-allowed border border-[var(--db-card-border)]' : 'bg-emerald-500 hover:bg-emerald-656 text-white shadow-md shadow-emerald-500/20'}`}
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

  // ─── VIEW 3: VISUAL SOLVER LAYOUT ─────────────────────────────────────────
  return (
    <div className={`h-screen w-full overflow-hidden flex flex-col font-sans db-page-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`} style={{ backgroundColor: 'var(--db-bg)', color: 'var(--db-text-main)' }}>


      {/* HEADER */}
      <header className="h-16 flex items-center justify-between px-8 relative z-20 bg-[var(--db-card-bg)] border-b border-[var(--db-card-border)]">
        <div className="flex items-center">
          <button
            onClick={() => {
              setSelectedMethod(null);
              setShowFormula(false);
              setPlaybackState('IDLE');
            }}
            className="mr-4 px-3 py-1.5 rounded-xl transition font-bold flex items-center gap-1.5 text-xs text-[var(--db-text-secondary)] border border-[var(--db-card-border)] bg-[var(--db-card-bg)] hover:bg-[var(--db-btn-secondary-hover)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Topics</span>
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
                <FunctionSquare className="w-5 h-5 text-emerald-555" /> Calculus Engine
              </h2>
              <p className="text-[var(--db-text-muted)] text-xs mt-1">Configure inputs and watch calculus concepts solve live.</p>
            </div>

            {/* Method Selector */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Method</label>
              <select
                value={selectedMethod}
                onChange={(e) => { setSelectedMethod(e.target.value); setPlaybackState('IDLE'); }}
                className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]"
              >
                {CARDS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            {/* Conditional Inputs */}
            {selectedMethod === 'Gauss Seidel Method' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Equation System</label>
                  <select value={gaussSeidelProblemId} onChange={e => { setGaussSeidelProblemId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]">
                    {GAUSS_SEIDEL_PROBS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Iterations</label>
                  <input type="number" min="1" max="10" value={gaussSeidelIterations}
                    onChange={e => { setGaussSeidelIterations(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                </div>
              </>
            )}

            {selectedMethod === 'Jacobi Method' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Equation System</label>
                  <select value={jacobiProblemId} onChange={e => { setJacobiProblemId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]">
                    {JACOBI_PROBS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Iterations</label>
                  <input type="number" min="1" max="10" value={jacobiIterations}
                    onChange={e => { setJacobiIterations(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                </div>
              </>
            )}

            {selectedMethod === 'Regula Falsi Method' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Problem</label>
                  <select value={rfProblemId} onChange={e => { setRfProblemId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]">
                    {RF_PROBS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Iterations</label>
                  <input type="number" min="1" max="15" value={rfIterations}
                    onChange={e => { setRfIterations(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                </div>
              </>
            )}

            {selectedMethod === 'Iteration Method' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Problem</label>
                  <select value={iterProblemId} onChange={e => { setIterProblemId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]">
                    {ITER_PROBS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Iterations</label>
                  <input type="number" min="1" max="15" value={iterIterations}
                    onChange={e => { setIterIterations(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                </div>
              </>
            )}

            {selectedMethod === 'Newton-Raphson Method' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Problem</label>
                  <select value={nrProblemId} onChange={e => { setNrProblemId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]">
                    {NR_PROBS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Iterations</label>
                  <input type="number" min="1" max="10" value={nrIterations}
                    onChange={e => { setNrIterations(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                </div>
              </>
            )}

            {selectedMethod === 'Lagrange Interpolation' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Problem</label>
                  <select value={lagrangeProblemId} onChange={e => { setLagrangeProblemId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]">
                    {LAGRANGE_PROBS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </>
            )}

            {selectedMethod === 'Newton General Interpolation' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Problem</label>
                  <select value={newtonGenProblemId} onChange={e => { setNewtonGenProblemId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]">
                    {NEWTON_GEN_PROBS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </>
            )}

            {selectedMethod === 'Fitting Straight Line' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Dataset</label>
                  <select value={fslProblemId} onChange={e => { setFslProblemId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]">
                    {FSL_PROBS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </>
            )}
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
                  {playbackState === 'PLAYING' ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> {playbackState === 'FINISHED' ? 'Restart' : 'Start Solving'}</>}
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
            <span className="text-[12px] font-bold text-[var(--db-text-secondary)] tracking-wide font-sans">
              {getTopQuestionText()}
            </span>
          </div>

          {/* Status bar */}
          <div className="px-6 py-2 flex items-center gap-2 border-b border-[var(--db-card-border)]">
            <span className="text-emerald-550 text-[10px] font-black uppercase tracking-widest">
              {playbackState === 'IDLE' ? 'READY TO EXECUTE' : playbackState === 'PLAYING' ? 'EXECUTING...' : playbackState === 'PAUSED' ? 'PAUSED' : 'COMPLETE'}
            </span>
            <div className="flex-1 h-1 rounded-full overflow-hidden ml-2 bg-[var(--db-input-bg)] border border-[var(--db-card-border)]">
              <div className={`h-full bg-emerald-500 rounded-full transition-all ${playbackState === 'PLAYING' ? 'animate-pulse' : ''}`} style={{ width: playbackState === 'FINISHED' ? '100%' : playbackState === 'PLAYING' ? '60%' : '15%' }} />
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
                <Settings2 className="w-5 h-5 text-emerald-555" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--db-text-main)]">Execution Trace</h3>
                <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Live Interpreter</p>
              </div>
            </div>

            <div className="flex-1 relative z-10 font-mono text-[13px] leading-relaxed text-emerald-550 flex flex-col">
              <div className="mb-4 text-slate-500">
                &gt; Analyzing runtime parameters...<br />
                &gt; Method: {selectedMethod}<br />
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
                  className="mt-4 text-emerald-400 font-bold"
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
