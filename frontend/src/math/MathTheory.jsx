import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RefreshCw, Volume2, Sparkles, AlertCircle, 
  HelpCircle, ChevronRight, CheckCircle, Award, BookOpen, 
  Activity, BarChart2, Compass, Layers, Zap, Info, ArrowRight, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export default function MathTheory({ onBack }) {
  const { isDarkMode: isDark } = useTheme();

  // Selected Math Topic
  const [activeTopic, setActiveTopic] = useState('calculus'); // 'calculus', 'matrices', 'numerical', 'geometry', 'probability', 'statistics'
  
  // 1. AI Voice Teacher
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US'); // 'en-US', 'en-IN', 'kn-IN'
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [currentLine, setCurrentLine] = useState(0);

  const voiceScripts = {
    calculus: [
      { id: 0, text: "Let's explore the derivative of y equals x squared.", formula: "f'(x) = 2x" },
      { id: 1, text: "The derivative represents the instantaneous rate of change or the slope of the tangent line.", formula: "\\frac{dy}{dx} = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}" },
      { id: 2, text: "For y equals x squared, the rate of change is double the value of x at any given point.", formula: "2x" }
    ],
    matrices: [
      { id: 0, text: "Matrix multiplication maps linear transformations in multidimensional spaces.", formula: "C_{ij} = \\sum A_{ik} B_{kj}" }
    ]
  };

  // 3. Formula Breakdown Hover State
  const [hoveredSymbol, setHoveredSymbol] = useState(null);

  // 4. Step-by-Step Solution Engine State
  const [solverStep, setSolverStep] = useState(0);
  const solverSteps = [
    { label: 'Original Equation', equation: 'f(x) = x^2 - 4 = 0', desc: 'Find the root of the function.' },
    { label: 'Derivative Calculation', equation: "f'(x) = 2x", desc: 'Find f prime of x for Newton-Raphson iterations.' },
    { label: 'First Iteration x_1', equation: 'x_1 = 3 - f(3)/f\'(3) = 3 - 5/6 = 2.16', desc: 'Substitute x_0 = 3 into the Newton iteration formula.' },
    { label: 'Converged Root', equation: 'x \\approx 2.000', desc: 'Newton-Raphson converges to 2 after 4 steps.' }
  ];

  // 6. Interactive Graph Coefficient Sliders
  const [coeffA, setCoeffA] = useState(1);
  const [coeffB, setCoeffB] = useState(0);
  const [coeffC, setCoeffC] = useState(0);

  // 7. Matrix Transformation State
  const [matrixA, setMatrixA] = useState([[2, 1], [1, 3]]);

  // 8. Numerical Method Simulator State (Newton Raphson)
  const [nrIterations, setNrIterations] = useState([]);
  const [nrX0, setNrX0] = useState(3);

  // 9. Geometry Playground State (Triangle points/radius)
  const [geomRadius, setGeomRadius] = useState(5);

  // 10. Probability Simulator State
  const [coinTosses, setCoinTosses] = useState([]);
  
  // 11. Statistics Dashboard State
  const [statData, setStatData] = useState('10, 15, 20, 20, 25, 30');

  // 12. AI Formula Assistant State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // 13. Common Mistakes
  const [mistakeTopic, setMistakeTopic] = useState('power-rule');

  // 14. Flashcard State
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // 15. Quiz State
  const [quizScore, setQuizScore] = useState(null);
  const [selectedAns, setSelectedAns] = useState(null);

  // 16. Proofs Construction
  const [activeProofStep, setActiveProofStep] = useState(0);

  // 17. AI Revision state
  const [revisionMinutes, setRevisionMinutes] = useState(2);

  // Voice player simulation
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentLine(prev => {
          const scripts = voiceScripts[activeTopic] || [];
          if (prev >= scripts.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 3500 / voiceSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, voiceSpeed, activeTopic]);

  const handleAskAI = (prompt) => {
    setIsAsking(true);
    setAiAnswer('');
    setTimeout(() => {
      if (prompt.includes('Kannada') || prompt.includes('kannada')) {
        setAiAnswer("ಡೆರಿವೇಟಿವ್ (Derivative) ಎಂದರೆ ಒಂದು ನಿರ್ದಿಷ್ಟ ಬಿಂದುವಿನಲ್ಲಿ ವಕ್ರರೇಖೆಯ ಇಳಿಜಾರು ಅಥವಾ ಬದಲಾವಣೆಯ ದರವಾಗಿದೆ. ಉದಾಹರಣೆಗೆ y = x^2 ಆದರೆ dy/dx = 2x.");
      } else {
        setAiAnswer("The derivative of a function measures its instantaneous rate of change. Visually, it represents the slope of the tangent line touching the curve at that exact point ($x$, $f(x)$).");
      }
      setIsAsking(false);
    }, 1000);
  };

  const runNewtonRaphson = () => {
    let x = parseFloat(nrX0);
    const steps = [];
    for (let i = 0; i < 4; i++) {
      let fx = x * x - 4;
      let dfx = 2 * x;
      let nextX = x - fx / dfx;
      steps.push({ iter: i + 1, x: x.toFixed(4), fx: fx.toFixed(4), nextX: nextX.toFixed(4) });
      x = nextX;
    }
    setNrIterations(steps);
    toast.success('Convergence iterations calculated!');
  };

  const tossCoin = () => {
    const side = Math.random() > 0.5 ? 'Heads' : 'Tails';
    setCoinTosses([...coinTosses, side]);
  };

  const getStats = () => {
    const arr = statData.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
    if (arr.length === 0) return { mean: 0, median: 0 };
    const sum = arr.reduce((a, b) => a + b, 0);
    const mean = sum / arr.length;
    const sorted = [...arr].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    return { mean: mean.toFixed(2), median: median.toFixed(2), count: arr.length };
  };

  const stats = getStats();

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-[#050814] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-350' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650 shadow-sm'}`}
            >
              <ArrowLeft size={16} /> Back to Hub
            </button>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-650'}`}>
                Mathematics Theory
              </span>
              <h1 className="text-2xl font-black">AI-Powered Math Classroom</h1>
            </div>
          </div>
        </div>

        {/* TOPICS SELECTOR TABS */}
        <div className="flex gap-2 p-1 rounded-xl bg-slate-900/40 border border-slate-850 max-w-4xl overflow-x-auto scrollbar-none">
          {[
            { id: 'calculus', label: '📈 Calculus & Graphing' },
            { id: 'matrices', label: '🧮 Matrix Transformations' },
            { id: 'numerical', label: '⚡ Numerical Methods' },
            { id: 'geometry', label: '📐 Geometry Playground' },
            { id: 'probability', label: '🎲 Probability & Stats' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTopic(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTopic === tab.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* MAIN SPLIT CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: SIMULATORS & INTERACTIVE PLATFORMS (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. AI VOICE TEACHER */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm bg-[var(--db-card-bg)] border-[var(--db-card-border)]`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-sm flex items-center gap-2 text-[var(--db-text-main)]">
                  <Volume2 className="text-emerald-500" size={18} /> AI Voice Teacher
                </h3>
                <div className="flex items-center gap-2">
                  {/* Language Selector */}
                  <select 
                    value={voiceLang}
                    onChange={e => setVoiceLang(e.target.value)}
                    className="p-1 px-2.5 bg-[var(--db-input-bg)] border border-[var(--db-card-border)] text-[var(--db-text-main)] rounded-lg text-[10px] font-bold outline-none"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-IN">Indian English</option>
                    <option value="kn-IN">Kannada Voice</option>
                  </select>

                  {/* Playback speed */}
                  <select
                    value={voiceSpeed}
                    onChange={e => setVoiceSpeed(parseFloat(e.target.value))}
                    className="p-1 px-2.5 bg-[var(--db-input-bg)] border border-[var(--db-card-border)] text-[var(--db-text-main)] rounded-lg text-[10px] font-bold outline-none"
                  >
                    <option value="0.75">0.75x</option>
                    <option value="1">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                  </select>
                </div>
              </div>

              {/* Synchronized voice script lines */}
              <div className="space-y-2.5 p-5 rounded-2xl bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] min-h-[90px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {((voiceScripts[activeTopic] || []).map((script, idx) => (
                    idx === currentLine && (
                      <motion.div
                        key={script.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-center font-semibold text-xs leading-relaxed"
                      >
                        <p className="text-emerald-600 dark:text-emerald-450 font-bold text-sm">"{script.text}"</p>
                        {script.formula && (
                          <div className="mt-2 text-sm font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 py-1 px-3 rounded-lg border border-purple-500/20 inline-block">
                            {script.formula}
                          </div>
                        )}
                      </motion.div>
                    )
                  )))}
                </AnimatePresence>
              </div>

              <div className="flex gap-2 mt-4 justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />} {isPlaying ? 'Pause Voice' : 'Start Explanation'}
                </button>
              </div>
            </div>

            {/* TAB: CALCULUS & GRAPHING */}
            {activeTopic === 'calculus' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* 3. Formula Component Breakdown */}
                <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm bg-[var(--db-card-bg)] border-[var(--db-card-border)]`}>
                  <h3 className="font-extrabold text-sm mb-4 text-[var(--db-text-main)]">Formula Breakdown (Hover symbols)</h3>
                  <div className="flex gap-1 items-center justify-center p-6 border border-[var(--db-card-border)] rounded-2xl bg-[var(--db-card-bg-elevated)] font-mono text-lg mb-4 text-[var(--db-text-main)]">
                    <span 
                      onMouseEnter={() => setHoveredSymbol('derivative')}
                      onMouseLeave={() => setHoveredSymbol(null)}
                      className="cursor-pointer hover:text-emerald-500 transition font-bold px-2 py-0.5 rounded hover:bg-emerald-500/10"
                    >
                      f'(x)
                    </span>
                    <span className="mx-2">=</span>
                    <span 
                      onMouseEnter={() => setHoveredSymbol('limit')}
                      onMouseLeave={() => setHoveredSymbol(null)}
                      className="cursor-pointer hover:text-emerald-500 transition font-bold flex flex-col items-center leading-none px-2 py-0.5 rounded hover:bg-emerald-500/10"
                    >
                      <span>lim</span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-400 mt-1">h → 0</span>
                    </span>
                    
                    {/* Fraction */}
                    <div className="flex items-center gap-1.5 ml-2">
                      <div className="flex flex-col items-center">
                        <span 
                          onMouseEnter={() => setHoveredSymbol('delta')}
                          onMouseLeave={() => setHoveredSymbol(null)}
                          className="cursor-pointer hover:text-emerald-500 transition font-bold border-b border-[var(--db-text-main)] pb-1 px-2 rounded hover:bg-emerald-500/10"
                        >
                          f(x + h) − f(x)
                        </span>
                        <span 
                          onMouseEnter={() => setHoveredSymbol('increment')}
                          onMouseLeave={() => setHoveredSymbol(null)}
                          className="cursor-pointer hover:text-emerald-500 transition font-bold pt-1 px-2 rounded hover:bg-emerald-500/10"
                        >
                          h
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-[75px] p-4 rounded-xl bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] text-xs text-[var(--db-text-secondary)] flex items-center justify-center text-center">
                    {hoveredSymbol === 'derivative' && <p><strong>f'(x) (Derivative):</strong> Represents the instantaneous rate of change or the slope of the tangent line touching the function curve f(x).</p>}
                    {hoveredSymbol === 'limit' && <p><strong>lim (Limit boundary):</strong> Approaches an infinitely small interval where variable h converges to zero.</p>}
                    {hoveredSymbol === 'delta' && <p><strong>f(x+h) - f(x):</strong> Change in y values across the interval width h.</p>}
                    {hoveredSymbol === 'increment' && <p><strong>h (Step interval):</strong> Represents the step change delta x across the domain axes.</p>}
                    {!hoveredSymbol && <p className="text-slate-450 dark:text-slate-400">Hover over any formula symbol to view details.</p>}
                  </div>
                </div>

                {/* 6. Interactive Graph Visualizer */}
                <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/25 border-slate-850' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-extrabold text-sm mb-4">Interactive Parabola Graph Visualizer</h3>
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    
                    {/* Controls */}
                    <div className="space-y-4 flex-1 w-full">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Coefficient a (Width/Direction)</label>
                        <input 
                          type="range" min="-3" max="3" step="0.5" 
                          value={coeffA} onChange={e => setCoeffA(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold mt-1 block">a = {coeffA}</span>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Constant c (Vertical Shift)</label>
                        <input 
                          type="range" min="-5" max="5" step="1" 
                          value={coeffC} onChange={e => setCoeffC(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold mt-1 block">c = {coeffC}</span>
                      </div>
                    </div>

                    {/* Visual output */}
                    <div className="w-[180px] h-[180px] border border-slate-800/40 rounded-2xl bg-black flex items-center justify-center relative overflow-hidden">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10">
                        {Array.from({ length: 36 }).map((_, i) => <div key={i} className="border border-slate-350" />)}
                      </div>
                      {/* Axis */}
                      <div className="absolute w-full h-[1px] bg-slate-700/50" />
                      <div className="absolute h-full w-[1px] bg-slate-700/50" />

                      {/* Dynamic Parabola curve representation */}
                      <motion.div
                        animate={{ scaleY: coeffA, y: -coeffC * 10 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="w-20 h-20 border-t-2 border-emerald-500 rounded-t-full absolute pointer-events-none"
                      />
                      <span className="absolute bottom-2 right-2 text-[9px] font-mono text-emerald-400">y = {coeffA}x² + {coeffC}</span>
                    </div>

                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB: MATRIX TRANSFORMATIONS */}
            {activeTopic === 'matrices' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm bg-[var(--db-card-bg)] border-[var(--db-card-border)]`}>
                  <h3 className="font-extrabold text-sm mb-4 text-[var(--db-text-main)]">Matrix Operations and Transformations</h3>
                  
                  {/* Grid fields */}
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
                    {matrixA.map((row, rIdx) => row.map((val, cIdx) => (
                      <input
                        key={`${rIdx}-${cIdx}`}
                        type="number"
                        value={val}
                        onChange={e => {
                          const updated = [...matrixA];
                          updated[rIdx][cIdx] = parseFloat(e.target.value) || 0;
                          setMatrixA(updated);
                        }}
                        className="p-3 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl text-center font-mono text-[var(--db-text-main)] text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    )))}
                  </div>

                  {/* Calculations outputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-2xl text-xs space-y-2">
                      <span className="text-xs text-[var(--db-text-muted)] font-black tracking-wider block uppercase">Determinant (det A)</span>
                      <strong className="text-lg font-mono text-emerald-600 dark:text-emerald-400 block mt-1">
                        {(matrixA[0][0]*matrixA[1][1] - matrixA[0][1]*matrixA[1][0]).toFixed(2)}
                      </strong>
                    </div>

                    <div className="p-4 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-2xl text-xs space-y-2">
                      <span className="text-xs text-[var(--db-text-muted)] font-black tracking-wider block uppercase">Transpose Matrix</span>
                      <div className="font-mono text-emerald-600 dark:text-emerald-450 text-sm font-bold mt-1 leading-relaxed">
                        [{matrixA[0][0]}, {matrixA[1][0]}]<br />
                        [{matrixA[0][1]}, {matrixA[1][1]}]
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: NUMERICAL METHODS SIMULATOR */}
            {activeTopic === 'numerical' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* 4. Step-by-Step Solution Engine */}
                <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm bg-[var(--db-card-bg)] border-[var(--db-card-border)]`}>
                  <h3 className="font-extrabold text-sm mb-4 text-[var(--db-text-main)]">Step-by-Step Numerical Root-Finder</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[var(--db-text-secondary)]">Step {solverStep + 1} of {solverSteps.length}</span>
                      <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded">{solverSteps[solverStep].label}</span>
                    </div>

                    <div className="p-6 bg-[var(--db-card-bg-elevated)] rounded-2xl border border-[var(--db-card-border)] text-center">
                      <span className="text-xl font-mono text-[var(--db-text-main)] font-extrabold block mb-2">{solverSteps[solverStep].equation}</span>
                      <p className="text-xs text-[var(--db-text-secondary)]">{solverSteps[solverStep].desc}</p>
                    </div>

                    <div className="flex justify-between">
                      <button 
                        disabled={solverStep === 0}
                        onClick={() => setSolverStep(prev => prev - 1)}
                        className="px-4 py-2 bg-[var(--db-btn-secondary)] hover:bg-[var(--db-btn-secondary-hover)] border border-[var(--db-card-border)] text-[var(--db-text-main)] rounded-xl text-xs font-bold disabled:opacity-40 transition active:scale-95"
                      >
                        Previous Step
                      </button>
                      <button 
                        disabled={solverStep === solverSteps.length - 1}
                        onClick={() => setSolverStep(prev => prev + 1)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition active:scale-95 shadow-sm"
                      >
                        Next Step
                      </button>
                    </div>
                  </div>
                </div>

                {/* 8. Numerical Method Simulator: Newton-Raphson Iterations */}
                <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm bg-[var(--db-card-bg)] border-[var(--db-card-border)]`}>
                  <div className="mb-4">
                    <h3 className="font-extrabold text-sm text-[var(--db-text-main)]">Newton-Raphson Solver</h3>
                    <p className="text-xs text-[var(--db-text-secondary)] mt-0.5">Find the positive root of f(x) = x² - 4 = 0 using iterations.</p>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <input
                      type="number"
                      value={nrX0}
                      onChange={e => setNrX0(e.target.value)}
                      placeholder="Start value x0..."
                      className="flex-1 px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl text-sm text-[var(--db-text-main)] outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={runNewtonRaphson}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition active:scale-95 shadow-sm"
                    >
                      Run Iterations
                    </button>
                  </div>

                  {nrIterations.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-mono text-left">
                        <thead>
                          <tr className="border-b border-[var(--db-card-border)] text-[var(--db-text-muted)]">
                            <th className="py-2">Iteration</th>
                            <th className="py-2">x_n</th>
                            <th className="py-2">f(x_n)</th>
                            <th className="py-2">x_{'{n+1}'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nrIterations.map(row => (
                            <tr key={row.iter} className="border-b border-[var(--db-card-border)]/50">
                              <td className="py-2 text-[var(--db-text-main)]">{row.iter}</td>
                              <td className="py-2 text-[var(--db-text-main)] font-semibold">{row.x}</td>
                              <td className="py-2 text-rose-500 dark:text-rose-400 font-semibold">{row.fx}</td>
                              <td className="py-2 text-emerald-600 dark:text-emerald-450 font-bold">{row.nextX}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* TAB: GEOMETRY PLAYGROUND */}
            {activeTopic === 'geometry' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/25 border-slate-850' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-extrabold text-sm mb-4">Geometry Workspace (Dynamic Circle)</h3>
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="space-y-4 flex-1">
                      <div>
                        <label className="text-xs uppercase font-bold text-[var(--db-text-secondary)] block mb-1">Circle Radius (r)</label>
                        <input 
                          type="range" min="1" max="10" step="1" 
                          value={geomRadius} onChange={e => setGeomRadius(parseInt(e.target.value))}
                          className="w-full h-1 bg-[var(--db-card-border)] rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-mono font-bold mt-1 block text-[var(--db-text-main)]">Radius = {geomRadius} cm</span>
                      </div>

                      <div className="space-y-1 text-sm text-[var(--db-text-secondary)] font-medium">
                        <div>Area: <span className="font-mono text-emerald-600 dark:text-emerald-450 font-bold">{(Math.PI * geomRadius * geomRadius).toFixed(2)} cm²</span></div>
                        <div>Perimeter: <span className="font-mono text-emerald-600 dark:text-emerald-450 font-bold">{(2 * Math.PI * geomRadius).toFixed(2)} cm</span></div>
                      </div>
                    </div>

                    <div className="w-[180px] h-[180px] border border-[var(--db-card-border)] rounded-2xl bg-black flex items-center justify-center relative overflow-hidden">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10">
                        {Array.from({ length: 36 }).map((_, i) => <div key={i} className="border border-slate-300" />)}
                      </div>
                      <motion.div
                        animate={{ width: geomRadius * 15, height: geomRadius * 15 }}
                        transition={{ type: 'spring', stiffness: 150 }}
                        className="relative z-10 rounded-full border-2 border-emerald-500 bg-emerald-500/10"
                      />
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: PROBABILITY & STATISTICS */}
            {activeTopic === 'probability' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* 10. Probability Simulator */}
                <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm bg-[var(--db-card-bg)] border-[var(--db-card-border)]`}>
                  <h3 className="font-extrabold text-sm mb-4 text-[var(--db-text-main)]">Coin Toss Probability Simulator</h3>
                  
                  <div className="flex gap-3 mb-6">
                    <button 
                      onClick={tossCoin}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-sm"
                    >
                      Toss Coin
                    </button>
                    <button 
                      onClick={() => setCoinTosses([])}
                      className="px-4 py-2.5 bg-[var(--db-btn-secondary)] hover:bg-[var(--db-btn-secondary-hover)] border border-[var(--db-card-border)] text-[var(--db-text-main)] rounded-xl text-xs font-bold transition active:scale-95"
                    >
                      Reset Sim
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-2xl shadow-sm">
                      <span className="text-xs text-[var(--db-text-muted)] font-black tracking-wider block uppercase mb-1">Heads frequency</span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-450 block mt-1">
                        {coinTosses.filter(x => x === 'Heads').length} / {coinTosses.length || 0}
                      </span>
                    </div>
                    <div className="p-4 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-2xl shadow-sm">
                      <span className="text-xs text-[var(--db-text-muted)] font-black tracking-wider block uppercase mb-1">Probability %</span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-450 block mt-1">
                        {coinTosses.length > 0 ? ((coinTosses.filter(x => x === 'Heads').length / coinTosses.length) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 11. Statistics Dashboard */}
                <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm bg-[var(--db-card-bg)] border-[var(--db-card-border)]`}>
                  <h3 className="font-extrabold text-sm mb-4 text-[var(--db-text-main)]">Dataset Statistics Dashboard</h3>
                  
                  <div className="mb-4">
                    <label className="text-xs uppercase font-bold text-[var(--db-text-secondary)] block mb-1">Enter comma-separated values</label>
                    <input 
                      type="text" 
                      value={statData} 
                      onChange={e => setStatData(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl text-sm text-[var(--db-text-main)] outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs font-semibold font-mono text-center">
                    <div className="p-3.5 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-2xl shadow-sm">
                      <span className="text-[10px] text-[var(--db-text-muted)] font-black tracking-wider block uppercase">Mean</span>
                      <span className="text-base font-black text-[var(--db-text-main)] mt-1.5 block">{stats.mean}</span>
                    </div>
                    <div className="p-3.5 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-2xl shadow-sm">
                      <span className="text-[10px] text-[var(--db-text-muted)] font-black tracking-wider block uppercase">Median</span>
                      <span className="text-base font-black text-[var(--db-text-main)] mt-1.5 block">{stats.median}</span>
                    </div>
                    <div className="p-3.5 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-2xl shadow-sm">
                      <span className="text-[10px] text-[var(--db-text-muted)] font-black tracking-wider block uppercase">Total items</span>
                      <span className="text-base font-black text-[var(--db-text-main)] mt-1.5 block">{stats.count}</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* 13. COMMON MISTAKES DETECTOR */}
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/25 border-slate-850' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2">
                <AlertCircle className="text-red-500" size={18} /> Common Mistakes Detector
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest block mb-1">Wrong Solution Attempt</span>
                  <code className="text-xs font-mono text-red-300">d/dx(x^2) = 2</code>
                </div>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest block mb-1">Correct Mathematical Method</span>
                  <code className="text-xs font-mono text-emerald-300">d/dx(x^2) = 2x (Power rule says subtract 1 from exponential exponent value)</code>
                </div>
              </div>
            </div>

            {/* 14. FORMULA FLASHCARDS */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm bg-[var(--db-card-bg)] border-[var(--db-card-border)]`}>
              <h3 className="font-extrabold text-sm mb-4 text-[var(--db-text-main)]">Formula Flashcards</h3>
              
              <div 
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                className="perspective-1000 w-full min-h-[140px] cursor-pointer"
              >
                <motion.div
                  animate={{ rotateY: flashcardFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-full relative transform-style-3d border border-[var(--db-card-border)] bg-[var(--db-card-bg-elevated)] rounded-2xl p-6 flex flex-col justify-center items-center shadow-sm"
                >
                  {!flashcardFlipped ? (
                    <div className="text-center">
                      <span className="text-xs font-black text-emerald-500 block uppercase mb-1.5 tracking-wider">Front</span>
                      <h4 className="text-lg font-black text-[var(--db-text-main)]">Power Rule of Derivatives</h4>
                      <p className="text-xs text-[var(--db-text-secondary)] mt-1.5 font-medium">Tap to flip & view formula</p>
                    </div>
                  ) : (
                    <div className="text-center transform rotate-y-180">
                      <span className="text-xs font-black text-emerald-500 block uppercase mb-1.5 tracking-wider">Back</span>
                      <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-450 font-mono">d/dx (xⁿ) = n · xⁿ⁻¹</h4>
                      <p className="text-xs text-[var(--db-text-secondary)] mt-2 font-medium">Exam tip: Works for all real number exponents.</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

          </div>

          {/* RIGHT: AI ASSISTANT & REVISIONS (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 12. AI FORMULA ASSISTANT */}
            <div className={`p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 shadow-sm bg-[var(--db-card-bg)] border-[var(--db-card-border)]`}>
              <h3 className="font-extrabold text-sm mb-3 flex items-center gap-2 text-[var(--db-text-main)]">
                <Sparkles className="text-emerald-500" size={18} /> AI Formula Assistant
              </h3>
              <p className="text-xs text-[var(--db-text-muted)] mb-4">Ask why a formula works, shortcut tricks, or translate concepts to Kannada.</p>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Ask math question..."
                  value={aiQuestion}
                  onChange={e => setAiQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAskAI(aiQuestion)}
                  className="w-full px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl text-xs text-[var(--db-text-main)] outline-none focus:ring-2 focus:ring-emerald-500"
                />
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAskAI('Explain in Kannada')}
                    className="flex-1 py-1.5 bg-[var(--db-btn-secondary)] hover:bg-[var(--db-btn-secondary-hover)] text-[10px] font-bold text-[var(--db-text-main)] rounded-lg border border-[var(--db-card-border)] transition active:scale-95"
                  >
                    Translate Kannada
                  </button>
                  <button 
                    onClick={() => handleAskAI('Explain shortcut')}
                    className="flex-1 py-1.5 bg-[var(--db-btn-secondary)] hover:bg-[var(--db-btn-secondary-hover)] text-[10px] font-bold text-[var(--db-text-main)] rounded-lg border border-[var(--db-card-border)] transition active:scale-95"
                  >
                    Shortcut Trick
                  </button>
                </div>
              </div>

              {aiAnswer && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] leading-relaxed text-[var(--db-text-secondary)]">
                  {aiAnswer}
                </div>
              )}
            </div>

            {/* 17. AI REVISION MODE */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm bg-[var(--db-card-bg)] border-[var(--db-card-border)]`}>
              <h3 className="font-extrabold text-sm mb-3 text-[var(--db-text-main)]">AI Revision Notes</h3>
              <div className="flex gap-2 mb-4">
                {[30, 120, 300].map(sec => (
                  <button
                    key={sec}
                    onClick={() => setRevisionMinutes(sec)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 border ${revisionMinutes === sec ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-600 dark:text-emerald-400' : 'border-[var(--db-card-border)] bg-[var(--db-card-bg-elevated)] text-[var(--db-text-secondary)] hover:bg-[var(--db-btn-secondary-hover)]'}`}
                  >
                    {sec === 30 ? '30s Notes' : sec === 120 ? '2m Notes' : '5m Notes'}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-xl text-[11px] leading-relaxed text-[var(--db-text-secondary)] min-h-[72px] flex items-center">
                {revisionMinutes === 30 && <p><strong>30s Summary:</strong> The derivative represents slope rates. Power rule gives 2x. Newton-Raphson convergence finds root x using - f(x)/f'(x).</p>}
                {revisionMinutes === 120 && <p><strong>2m Core Guide:</strong> Calculus measures dynamic graphs curves. The limit definition is the foundation of calculus rates. Common mistakes involve forgetting boundary variables during integrals.</p>}
                {revisionMinutes === 300 && <p><strong>5m Comprehensive revision:</strong> Full list of formulas: Power rules, Chain rule, Matrix determinants, Trapezoidal area summation integrals and Euler numerical simulations step processes.</p>}
              </div>
            </div>

            {/* 15. INTERACTIVE QUIZ */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm bg-[var(--db-card-bg)] border-[var(--db-card-border)]`}>
              <h3 className="font-extrabold text-sm mb-4 text-[var(--db-text-main)]">Quick Concept Check</h3>
              
              <div className="space-y-3">
                <p className="text-xs font-bold text-[var(--db-text-main)]">What is the derivative of f(x) = x³?</p>
                {['3x²', '2x³', '3x', 'x²'].map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedAns(ans);
                      if (ans === '3x²') {
                        setQuizScore(100);
                        toast.success('Correct answer! (+30 XP)');
                      } else {
                        setQuizScore(0);
                        toast.error('Wrong! Use the power rule.');
                      }
                    }}
                    className={`w-full p-3 rounded-xl border border-[var(--db-card-border)] text-left text-xs transition duration-250 hover:bg-[var(--db-card-bg-elevated)] text-[var(--db-text-main)] hover:border-emerald-500/50 ${selectedAns === ans ? (ans === '3x²' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-450' : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400') : ''}`}
                  >
                    {ans}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
