import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ChevronRight, ChevronLeft, Play, Pause, RotateCcw, 
  Settings2, Activity, BrainCircuit, FunctionSquare, Rocket, X,
  Layers, BookOpen, Target, Lightbulb, Zap
} from 'lucide-react';
import NotebookEngine from '../components/MathEngines/NotebookEngine';
import MathBackground from '../components/MathBackground';

export default function MathVisualization() {
  const navigate = useNavigate();
  
  // State
  const [selectedMethod, setSelectedMethod] = useState(null); // null means show the selection cards
  const [showFormula, setShowFormula] = useState(false); // Formula intermediate page
  const [formulaPage, setFormulaPage] = useState(0); // Current formula page index
  const [funcId, setFuncId] = useState('reciprocal');
  const [a, setA] = useState('0');
  const [b, setB] = useState('1');
  const [n, setN] = useState('4');
  
  // Newton's Interpolation States
  const [newtonQuestionId, setNewtonQuestionId] = useState('q9');
  const [newtonDirection, setNewtonDirection] = useState('Forward');
  const [newtonTargetX, setNewtonTargetX] = useState('1895');

  // Newton's Difference (Differentiation) States
  const [newtonDiffQuestionId, setNewtonDiffQuestionId] = useState('qd12');
  const [newtonDiffDirection, setNewtonDiffDirection] = useState('Forward');
  const [newtonDiffTargetX, setNewtonDiffTargetX] = useState('1.2');

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

  const CARDS = [
    { id: 'Newton\u2019s Interpolation', title: 'Newton\u2019s Interpolation', desc: 'Estimate values between data points using forward/backward difference polynomials.', status: 'Online', color: 'from-emerald-500 to-teal-600' },
    { id: 'Newton\u2019s Difference', title: 'Newton\u2019s Difference', desc: 'Obtain first (dy/dx) and second (d\u00B2y/dx\u00B2) derivatives from difference tables.', status: 'Online', color: 'from-violet-500 to-purple-600' },
    { id: 'Trapezoidal Rule', title: 'Trapezoidal Rule', desc: 'Calculate the approximate area under a curve using boundary nodes.', status: 'Online', color: 'from-blue-500 to-indigo-600' },
    { id: 'Simpson\u2019s 1/3 Rule', title: 'Simpson\u2019s 1/3 Rule', desc: 'Higher accuracy quadratic polynomial area approximation.', status: 'Online', color: 'from-amber-500 to-orange-600' },
    { id: 'Simpson\u2019s 3/8 Rule', title: 'Simpson\u2019s 3/8 Rule', desc: 'Cubic polynomial boundaries for high precision integration.', status: 'Online', color: 'from-pink-500 to-rose-600' },
    { id: 'RK4', title: 'RK4 Method', desc: 'Solve ordinary differential equations step-by-step.', status: 'Online', color: 'from-sky-500 to-blue-600' }
  ];

  // Formula data for each method
  const FORMULA_DATA = {
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
  };

  const activeFunction = PREDEFINED_FUNCTIONS.find(f => f.id === funcId);
  const activeQuestion = NEWTON_QUESTIONS.find(q => q.id === newtonQuestionId);
  const activeDiffQuestion = NEWTON_DIFF_QUESTIONS.find(qd => qd.id === newtonDiffQuestionId);

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
    if (selectedMethod === 'Trapezoidal Rule') {
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
    if (selectedMethod === 'Trapezoidal Rule') {
      return `Evaluate: I = \u222B [${a} to ${b}] ( ${activeFunction?.label?.split('=')[1]?.trim() || ''} ) dx using Trapezoidal Rule.`;
    } else if (selectedMethod === 'Newton\u2019s Interpolation') {
      return activeQuestion?.question || '';
    } else if (selectedMethod === 'Newton\u2019s Difference') {
      return activeDiffQuestion?.question || '';
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
        <header className="h-14 flex items-center px-8 relative z-20">
          <button onClick={() => navigate('/subjects/math-proto')} className="mr-4 p-2 hover:bg-white/5 rounded-full transition font-bold flex items-center gap-1 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center text-sm font-medium text-slate-500 gap-2">
            <span className="hover:text-slate-300 cursor-pointer">Home</span> <ChevronRight className="w-4 h-4" />
            <span className="hover:text-slate-300 cursor-pointer">Subjects</span> <ChevronRight className="w-4 h-4" />
            <span className="hover:text-slate-300 cursor-pointer">Mathematics</span> <ChevronRight className="w-4 h-4" />
            <span className="text-emerald-400 font-bold">Numerical Methods</span>
          </div>
        </header>

        <main className="max-w-7xl mx-auto w-full px-8 py-6 relative z-10">
          {/* Title Section */}
          <div className="mb-10 text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-3 flex items-baseline flex-wrap gap-3">
              <span>
                <span className="bg-gradient-to-br from-emerald-400 via-emerald-300 to-teal-500 bg-clip-text text-transparent text-7xl md:text-8xl font-black leading-none" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>N</span>
                <span className="text-white/90">UMERICAL</span>
              </span>
              <span>
                <span className="bg-gradient-to-br from-emerald-400 via-emerald-300 to-teal-500 bg-clip-text text-transparent text-7xl md:text-8xl font-black leading-none" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>M</span>
                <span className="text-white/90">ETHODS</span>
              </span>
              <span>
                <span className="bg-gradient-to-br from-emerald-400 via-emerald-300 to-teal-500 bg-clip-text text-transparent text-7xl md:text-8xl font-black leading-none" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>L</span>
                <span className="text-white/90">AB</span>
              </span>
            </h1>
            <p className="text-slate-400 text-lg mt-1">Select a mathematical runtime engine to execute your solution live.</p>
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
                className="relative rounded-2xl cursor-pointer group overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(8, 16, 38, 0.95) 0%, rgba(12, 22, 50, 0.9) 50%, rgba(16, 28, 58, 0.85) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.12)',
                  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                }}
              >
                {/* Top gradient border */}
                <div className={`h-1 w-full bg-gradient-to-r ${card.color}`} />
                
                {/* Card glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center top, rgba(16, 185, 129, 0.08) 0%, transparent 70%)' }} />
                
                <div className="p-6">
                  {/* Status & Icon Row */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                      ONLINE
                    </span>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(20, 184, 166, 0.08))', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                      <span className="text-lg">🧮</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white/90 mb-2 group-hover:text-emerald-300 transition-colors duration-300">{card.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{card.desc}</p>

                  {/* Launch + GO Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400/80 text-xs font-bold tracking-wide group-hover:text-emerald-300 transition-colors">
                      Launch Simulator
                    </span>
                    <button className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-extrabold rounded-lg transition-all shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40">
                      GO
                    </button>
                  </div>
                </div>
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
        <header className="h-14 flex items-center px-8 relative z-20">
          <button
            onClick={() => { setSelectedMethod(null); setShowFormula(false); }}
            className="px-4 py-1.5 hover:bg-white/5 rounded-full transition font-bold flex items-center gap-1.5 text-sm text-slate-400 hover:text-white border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Topics</span>
          </button>
        </header>

        <main className="max-w-7xl mx-auto w-full px-8 py-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* LEFT PANEL — Method Info Card */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 80 }}
                className="rounded-2xl p-8 h-full flex flex-col"
                style={{
                  background: 'linear-gradient(145deg, rgba(8, 16, 38, 0.95) 0%, rgba(12, 22, 50, 0.9) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4)',
                }}
              >
                {/* Status Badge */}
                <span className="self-start text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] mb-6">
                  ONLINE
                </span>

                {/* Title */}
                <h2 className="text-3xl font-extrabold text-white mb-3">{currentCard?.title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">{currentCard?.desc}</p>

                {/* Features */}
                <div className="space-y-5 mb-8 flex-1">
                  {methodFormulas?.features?.map((feat, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                        <feat.icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">{feat.title}</h4>
                        <p className="text-slate-400 text-xs">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Launch Button */}
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
                className="rounded-2xl p-8 h-full flex flex-col"
                style={{
                  background: 'linear-gradient(145deg, rgba(8, 16, 38, 0.95) 0%, rgba(12, 22, 50, 0.9) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4)',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                      <FunctionSquare className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-emerald-400 font-extrabold text-lg">Formula</span>
                  </div>
                  <button onClick={() => { setSelectedMethod(null); setShowFormula(false); }} className="p-2 hover:bg-white/5 rounded-lg transition text-slate-500 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Formula Title */}
                <h3 className="text-xl font-bold text-white mb-6">{currentFormula?.title}</h3>

                {/* Formula Box */}
                <div className="rounded-xl p-6 mb-6" style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                  <p className="text-emerald-300 text-xl md:text-2xl font-mono text-center leading-relaxed tracking-wide">
                    {currentFormula?.formula}
                  </p>
                </div>

                {/* Variables */}
                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg mb-4">Where:</h4>
                  <ul className="space-y-3">
                    {currentFormula?.variables?.map((v, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-emerald-300 font-mono font-bold text-sm shrink-0 mt-0.5">\u2022 {v.sym}</span>
                        <span className="text-slate-400 text-sm">= {v.def}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                    <button
                      onClick={() => setFormulaPage(Math.max(0, formulaPage - 1))}
                      disabled={formulaPage === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition border border-white/10 ${formulaPage === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setFormulaPage(i)}
                          className={`w-3 h-3 rounded-full transition ${i === formulaPage ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-600 hover:bg-slate-500'}`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setFormulaPage(Math.min(totalPages - 1, formulaPage + 1))}
                      disabled={formulaPage === totalPages - 1}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${formulaPage === totalPages - 1 ? 'text-slate-600 cursor-not-allowed border border-white/10' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'}`}
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
  // VIEW 3: VISUAL SOLVER LAYOUT (DARK THEME)
  // =============================================
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col font-sans" style={{ background: '#050B18' }}>
      
      {/* HEADER BREADCRUMB */}
      <header className="h-14 shrink-0 flex items-center px-8 relative z-10" style={{ background: 'rgba(8, 14, 30, 0.95)', borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
        <button 
          onClick={() => {
            setSelectedMethod(null);
            setShowFormula(false);
            setPlaybackState('IDLE');
          }} 
          className="mr-4 px-3 py-1.5 rounded-full transition font-bold flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Methods</span>
        </button>
        <div className="flex items-center text-sm font-medium text-slate-500 gap-2">
          <span>Home</span> <ChevronRight className="w-4 h-4" />
          <span>Subjects</span> <ChevronRight className="w-4 h-4" />
          <span>Mathematics</span> <ChevronRight className="w-4 h-4" />
          <span className="text-emerald-400 font-bold">{selectedMethod}</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 gap-4 flex flex-row h-[calc(100vh-56px)] max-w-[1920px] mx-auto w-full overflow-hidden">
        
        {/* LEFT PANEL: INPUT SYSTEM */}
        <div className="w-full lg:w-1/4 lg:min-w-[280px] lg:h-full rounded-2xl flex flex-col shrink-0 overflow-hidden" style={{ background: 'rgba(8, 14, 30, 0.95)', border: '1px solid rgba(16, 185, 129, 0.08)' }}>
          
          <div className="flex-1 overflow-y-auto p-5 pb-2">
            <div className="mb-4">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <FunctionSquare className="w-5 h-5 text-emerald-400" /> Math Engine
              </h2>
              <p className="text-slate-500 text-xs mt-1">Configure inputs and watch numerical methods solve live.</p>
            </div>

            {/* Method Selector */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Method</label>
              <select 
                value={selectedMethod}
                onChange={(e) => {
                  setSelectedMethod(e.target.value);
                  setPlaybackState('IDLE');
                }}
                className="w-full text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }}
              >
                {CARDS.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* Conditional Input Rendering */}
            {selectedMethod === 'Trapezoidal Rule' ? (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Function f(x)</label>
                  <select 
                    value={funcId}
                    onChange={(e) => { setFuncId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }}
                  >
                    {PREDEFINED_FUNCTIONS.map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lower [a]</label>
                    <input type="number" step="0.1" value={a} onChange={e => { setA(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Upper [b]</label>
                    <input type="number" step="0.1" value={b} onChange={e => { setB(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Steps (n)</label>
                    <input type="number" min="1" max="20" value={n} onChange={e => { setN(e.target.value); setPlaybackState('IDLE'); }} className="w-full text-sm font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }} />
                  </div>
                </div>
              </>
            ) : selectedMethod === 'Newton\u2019s Interpolation' ? (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Select Question</label>
                  <select 
                    value={newtonQuestionId}
                    onChange={(e) => {
                      setNewtonQuestionId(e.target.value);
                      const targetQ = NEWTON_QUESTIONS.find(q => q.id === e.target.value);
                      setNewtonTargetX(targetQ.defaultTarget.toString());
                      setNewtonDirection(targetQ.defaultDirection);
                      setPlaybackState('IDLE');
                    }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }}
                  >
                    {NEWTON_QUESTIONS.map(q => (
                      <option key={q.id} value={q.id}>{q.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Interpolation Direction</label>
                  <div className="flex p-1 rounded-xl" style={{ background: '#0c1426' }}>
                    {['Forward', 'Backward'].map(dir => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => { setNewtonDirection(dir); setPlaybackState('IDLE'); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${newtonDirection === dir ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Estimate Value at (x)</label>
                  <input 
                    type="number" step="0.01" value={newtonTargetX} 
                    onChange={e => { setNewtonTargetX(e.target.value); setPlaybackState('IDLE'); }} 
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }}
                  />
                </div>
              </>
            ) : selectedMethod === 'Newton\u2019s Difference' ? (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Select Question</label>
                  <select 
                    value={newtonDiffQuestionId}
                    onChange={(e) => {
                      setNewtonDiffQuestionId(e.target.value);
                      const targetQ = NEWTON_DIFF_QUESTIONS.find(q => q.id === e.target.value);
                      setNewtonDiffTargetX(targetQ.defaultTarget.toString());
                      setNewtonDiffDirection(targetQ.defaultDirection);
                      setPlaybackState('IDLE');
                    }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }}
                  >
                    {NEWTON_DIFF_QUESTIONS.map(q => (
                      <option key={q.id} value={q.id}>{q.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Interpolation Direction</label>
                  <div className="flex p-1 rounded-xl" style={{ background: '#0c1426' }}>
                    {['Forward', 'Backward'].map(dir => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => { setNewtonDiffDirection(dir); setPlaybackState('IDLE'); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${newtonDiffDirection === dir ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Evaluate Derivative at (x)</label>
                  <input 
                    type="number" step="0.01" value={newtonDiffTargetX} 
                    onChange={e => { setNewtonDiffTargetX(e.target.value); setPlaybackState('IDLE'); }} 
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }}
                  />
                </div>
              </>
            ) : null}
          </div>

          {/* Playback Controls */}
          <div className="p-4 pt-2 shrink-0" style={{ borderTop: '1px solid rgba(16, 185, 129, 0.08)' }}>
            <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#060d1e' }}>
              <div className="flex justify-between items-center p-1 rounded-xl" style={{ background: '#0a1428' }}>
                {[0.5, 1, 2].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSpeed(s)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${speed === s ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {s}\u00D7
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePlayPause}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-emerald-500/30"
                >
                  {playbackState === 'PLAYING' ? <><Pause className="w-5 h-5"/> Pause</> : <><Play className="w-5 h-5"/> {playbackState === 'FINISHED' ? 'Restart' : 'Start Solving'}</>}
                </button>
                <button onClick={handleReplay} className="w-12 h-[48px] rounded-xl flex items-center justify-center transition active:scale-95 text-white hover:text-emerald-300" style={{ background: '#0a1428' }}>
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE PANEL: ANIMATION ENGINE */}
        <div className="w-full lg:flex-1 min-h-[400px] lg:h-full rounded-2xl flex flex-col relative overflow-hidden shrink-0" style={{ background: 'rgba(8, 14, 30, 0.95)', border: '1px solid rgba(16, 185, 129, 0.08)' }}>
          {/* Question Display */}
          <div className="shrink-0 px-6 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.08)', background: 'rgba(8, 14, 30, 0.98)' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="text-[12px] font-bold text-slate-300 font-sans tracking-wide">
              {getTopQuestionText()}
            </span>
          </div>

          {/* Status bar */}
          <div className="px-6 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.05)' }}>
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              {playbackState === 'IDLE' ? 'READY TO EXECUTE' : playbackState === 'PLAYING' ? 'EXECUTING...' : playbackState === 'PAUSED' ? 'PAUSED' : 'COMPLETE'}
            </span>
            <div className="flex-1 h-1 rounded-full overflow-hidden ml-2" style={{ background: '#0c1426' }}>
              <div className={`h-full bg-emerald-500 rounded-full transition-all ${playbackState === 'PLAYING' ? 'animate-pulse' : ''}`} style={{ width: playbackState === 'FINISHED' ? '100%' : playbackState === 'PLAYING' ? '60%' : '15%' }}></div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {renderActiveEngine()}
          </div>
        </div>

        {/* RIGHT PANEL: AI EXPLAINER */}
        <div className="w-full lg:w-1/4 lg:min-w-[280px] lg:h-full flex flex-col gap-4 shrink-0">
          <div className="flex-1 rounded-2xl p-5 text-white flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(8, 14, 30, 0.98) 0%, rgba(5, 11, 24, 0.95) 100%)', border: '1px solid rgba(16, 185, 129, 0.08)' }}>
            <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
              <BrainCircuit className="w-64 h-64 text-emerald-400" />
            </div>
            
            <div className="flex items-center gap-3 mb-5 relative z-10 pb-4" style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.08)' }}>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Execution Trace</h3>
                <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Live Interpreter</p>
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
                    className="p-4 rounded-r-lg"
                    style={{ background: 'rgba(16, 185, 129, 0.06)', borderLeft: '2px solid #10b981' }}
                  >
                    <span className="text-emerald-400 font-bold mb-1 block">CURRENT STEP:</span>
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
