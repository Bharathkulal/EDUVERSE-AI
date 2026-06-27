import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, ChevronLeft, Play, Pause, RotateCcw,
  Settings2, Activity, BrainCircuit, FunctionSquare, Rocket, X,
  BookOpen, Target, Lightbulb,
} from 'lucide-react';
import CalculusNotebookEngine from '../components/MathEngines/CalculusNotebookEngine';
import MathBackground from '../components/MathBackground';

export default function CalculusVisualization() {
  const navigate = useNavigate();

  // View state
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showFormula, setShowFormula] = useState(false);
  const [formulaPage, setFormulaPage] = useState(0);

  // Limit inputs
  const [limitFuncId, setLimitFuncId] = useState('sin_over_x');
  const [limitApproachVal, setLimitApproachVal] = useState('0');

  // Derivative inputs
  const [derivFuncId, setDerivFuncId] = useState('x2');
  const [derivAtX, setDerivAtX] = useState('2');

  // Integral inputs
  const [integFuncId, setIntegFuncId] = useState('x2');
  const [integA, setIntegA] = useState('0');
  const [integB, setIntegB] = useState('3');
  const [integN, setIntegN] = useState('6');

  // L'Hôpital input
  const [lhopitalProblemId, setLhopitalProblemId] = useState('p1');

  // Playback control
  const [playbackState, setPlaybackState] = useState('IDLE');
  const [speed, setSpeed] = useState(1);
  const [currentExplanation, setCurrentExplanation] = useState('Waiting for execution to start...');

  // ─── Function / Problem Library labels ───────────────────────────────────
  const LIMIT_FUNCS = [
    { id: 'sin_over_x',   label: 'f(x) = sin(x) / x'   },
    { id: 'x2_minus_1',   label: 'f(x) = (x²-1)/(x-1)' },
    { id: 'x3',           label: 'f(x) = x³'            },
    { id: 'cos_x',        label: 'f(x) = cos(x)'        },
    { id: 'e_x',          label: 'f(x) = eˣ'            },
  ];

  const DERIV_FUNCS = [
    { id: 'x2',       label: 'f(x) = x²'      },
    { id: 'x3',       label: 'f(x) = x³'      },
    { id: 'x4',       label: 'f(x) = x⁴'      },
    { id: 'sin_x',    label: 'f(x) = sin(x)'  },
    { id: 'cos_x',    label: 'f(x) = cos(x)'  },
    { id: 'e_x',      label: 'f(x) = eˣ'      },
    { id: 'sqrt_x',   label: 'f(x) = √x'      },
    { id: 'reciprocal', label: 'f(x) = 1/(1+x)' },
  ];

  const INTEG_FUNCS = [
    { id: 'x2',       label: 'f(x) = x²'      },
    { id: 'x3',       label: 'f(x) = x³'      },
    { id: 'sin_x',    label: 'f(x) = sin(x)'  },
    { id: 'cos_x',    label: 'f(x) = cos(x)'  },
    { id: 'e_x',      label: 'f(x) = eˣ'      },
    { id: 'sqrt_x',   label: 'f(x) = √x'      },
    { id: 'reciprocal', label: 'f(x) = 1/(1+x)' },
  ];

  const LHOPITAL_PROBS = [
    { id: 'p1', label: 'lim(x→0) sin(x)/x'          },
    { id: 'p2', label: 'lim(x→0) (eˣ-1)/x'          },
    { id: 'p3', label: 'lim(x→0) (1-cos x)/x²'      },
    { id: 'p4', label: 'lim(x→0) (x - sin x)/x³'    },
  ];

  // ─── Cards ────────────────────────────────────────────────────────────────
  const CARDS = [
    { id: 'Limit Calculator',          title: 'Limit Calculator',          desc: 'Numerically approach a limit from both sides and verify convergence via table of values.',       color: 'from-emerald-500 to-teal-600'   },
    { id: 'First Principles Derivative', title: 'First Principles Derivative', desc: 'Derive f\'(x) from the limit definition of the derivative step-by-step.',                    color: 'from-violet-500 to-purple-600'  },
    { id: 'Definite Integral',         title: 'Definite Integral',         desc: 'Evaluate ∫f(x)dx with Composite Simpson\'s 1/3 Rule and full coefficient breakdown.',           color: 'from-blue-500 to-indigo-600'    },
    { id: "L'Hôpital's Rule",          title: "L'Hôpital's Rule",          desc: 'Resolve 0/0 and ∞/∞ indeterminate forms by differentiating numerator and denominator.', color: 'from-amber-500 to-orange-600'   },
  ];

  // ─── Formula data per method ──────────────────────────────────────────────
  const FORMULA_DATA = {
    'Limit Calculator': {
      features: [
        { icon: BookOpen, title: 'Two-sided approach',  desc: 'Verify L⁻ = L⁺ from both left and right.' },
        { icon: Target,   title: 'Numerical precision', desc: 'h decreases by factors of 10 for accuracy.' },
        { icon: Lightbulb, title: 'Applications',       desc: 'Continuity checks, derivative foundations.' },
      ],
      formulas: [
        {
          title: 'Two-sided Limit Definition',
          formula: 'lim(x→a) f(x) = L  iff  lim(x→a⁻) f(x) = lim(x→a⁺) f(x) = L',
          variables: [
            { sym: 'a',   def: 'The approach point (x → a)' },
            { sym: 'L',   def: 'The limit value' },
            { sym: 'a⁻',  def: 'Left-hand limit (x < a)' },
            { sym: 'a⁺',  def: 'Right-hand limit (x > a)' },
          ],
        },
        {
          title: 'Epsilon-Delta (ε-δ) Formal Definition',
          formula: '∀ε>0, ∃δ>0 : 0 < |x − a| < δ  ⟹  |f(x) − L| < ε',
          variables: [
            { sym: 'ε',  def: 'Tolerance around the limit value L' },
            { sym: 'δ',  def: 'Tolerance around the approach point a' },
          ],
        },
      ],
    },

    'First Principles Derivative': {
      features: [
        { icon: BookOpen, title: 'Limit definition',     desc: 'f\'(x) = lim(h→0) [f(x+h) - f(x)] / h.' },
        { icon: Target,   title: 'Numerical convergence', desc: 'Observe the quotient as h → 0.' },
        { icon: Lightbulb, title: 'Applications',         desc: 'Slope of tangent, rate of change.' },
      ],
      formulas: [
        {
          title: 'First Principles (Limit) Definition',
          formula: "f'(x) = lim(h→0) [ f(x + h) − f(x) ] / h",
          variables: [
            { sym: 'h',        def: 'Small increment (h → 0)' },
            { sym: 'f(x+h)',   def: 'Function evaluated at x + h' },
            { sym: 'f(x)',     def: 'Function evaluated at x' },
            { sym: "f'(x)",    def: 'Derivative of f at point x' },
          ],
        },
        {
          title: 'Common Derivative Rules (Reference)',
          formula: "d/dx [xⁿ] = n·xⁿ⁻¹  |  d/dx [sin x] = cos x  |  d/dx [eˣ] = eˣ",
          variables: [
            { sym: 'n',    def: 'Any real exponent' },
            { sym: 'sin x', def: 'Sine function' },
            { sym: 'eˣ',   def: 'Natural exponential function' },
          ],
        },
      ],
    },

    'Definite Integral': {
      features: [
        { icon: BookOpen, title: 'Composite Simpson',  desc: 'Uses parabolic arcs over n/2 sub-panels.' },
        { icon: Target,   title: 'O(h⁴) accuracy',    desc: 'High-order error: O(h⁴) for smooth f(x).' },
        { icon: Lightbulb, title: 'Requirement',       desc: 'Number of sub-intervals n must be even.' },
      ],
      formulas: [
        {
          title: "Composite Simpson's 1/3 Rule",
          formula: '∫[a,b] f(x)dx ≈ (h/3)[f(x₀) + 4Σf(x_odd) + 2Σf(x_even) + f(xₙ)]',
          variables: [
            { sym: 'h',        def: '(b − a)/n — sub-interval width' },
            { sym: 'n',        def: 'Number of sub-intervals (even)' },
            { sym: 'Σf(x_odd)', def: 'Sum of f at odd-indexed nodes' },
            { sym: 'Σf(x_even)', def: 'Sum of f at even-indexed interior nodes' },
          ],
        },
      ],
    },

    "L'Hôpital's Rule": {
      features: [
        { icon: BookOpen, title: '0/0 or ∞/∞ forms', desc: 'Applicable only to indeterminate forms.' },
        { icon: Target,   title: 'Differentiate separately', desc: 'Numerator and denominator differentiated independently.' },
        { icon: Lightbulb, title: 'Applications',     desc: 'Limits, asymptotic analysis, Taylor expansions.' },
      ],
      formulas: [
        {
          title: "L'Hôpital's Rule",
          formula: "If lim f(x)/g(x) → 0/0 or ∞/∞ then lim f(x)/g(x) = lim f'(x)/g'(x)",
          variables: [
            { sym: 'f(x)',    def: 'Numerator function' },
            { sym: 'g(x)',    def: 'Denominator function' },
            { sym: "f'(x)",   def: 'Derivative of numerator' },
            { sym: "g'(x)",   def: 'Derivative of denominator' },
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
      limitFuncId,
      limitApproachVal,
      derivFuncId,
      derivAtX,
      integFuncId,
      integA,
      integB,
      integN,
      lhopitalProblemId,
    };

    return <CalculusNotebookEngine {...commonProps} />;
  };

  // ─── Top question text ────────────────────────────────────────────────────
  const getTopQuestionText = () => {
    if (selectedMethod === 'Limit Calculator') {
      const labels = { 'sin_over_x': 'sin(x)/x', 'x2_minus_1': '(x²-1)/(x-1)', 'x3': 'x³', 'cos_x': 'cos(x)', 'e_x': 'eˣ' };
      return `Find: lim(x → ${limitApproachVal}) ${labels[limitFuncId] || 'f(x)'}`;
    }
    if (selectedMethod === 'First Principles Derivative') {
      const fn = DERIV_FUNCS.find(f => f.id === derivFuncId);
      return `Find: f'(${derivAtX}) where ${fn?.label || 'f(x)'}  using First Principles`;
    }
    if (selectedMethod === 'Definite Integral') {
      const fn = INTEG_FUNCS.find(f => f.id === integFuncId);
      const fnLabel = fn?.label?.split('=')[1]?.trim() || integFuncId;
      return `Evaluate: ∫[${integA} to ${integB}] ( ${fnLabel} ) dx`;
    }
    if (selectedMethod === "L'Hôpital's Rule") {
      const prob = LHOPITAL_PROBS.find(p => p.id === lhopitalProblemId);
      return `Evaluate: ${prob?.label || "L'Hôpital's limit"}`;
    }
    return `Solving using ${selectedMethod}.`;
  };

  // ─── VIEW 1: CARD SELECTION DASHBOARD ─────────────────────────────────────
  if (!selectedMethod) {
    return (
      <MathBackground>
        <header className="h-14 flex items-center px-8 relative z-20">
          <button onClick={() => navigate('/subjects/math-proto')} className="mr-4 p-2 hover:bg-white/5 rounded-full transition font-bold flex items-center gap-1 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center text-sm font-medium text-slate-500 gap-2">
            <span className="hover:text-slate-300 cursor-pointer">Home</span> <ChevronRight className="w-4 h-4" />
            <span className="hover:text-slate-300 cursor-pointer">Subjects</span> <ChevronRight className="w-4 h-4" />
            <span className="hover:text-slate-300 cursor-pointer">Mathematics</span> <ChevronRight className="w-4 h-4" />
            <span className="text-emerald-400 font-bold">Calculus Simulator</span>
          </div>
        </header>

        <main className="max-w-7xl mx-auto w-full px-8 py-6 relative z-10">
          <div className="mb-10 text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-3 flex items-baseline flex-wrap gap-3">
              <span>
                <span className="bg-gradient-to-br from-emerald-400 via-emerald-300 to-teal-500 bg-clip-text text-transparent text-7xl md:text-8xl font-black leading-none" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>C</span>
                <span className="text-white/90">ALCULUS</span>
              </span>
              <span>
                <span className="bg-gradient-to-br from-emerald-400 via-emerald-300 to-teal-500 bg-clip-text text-transparent text-7xl md:text-8xl font-black leading-none" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>S</span>
                <span className="text-white/90">IMULATOR</span>
              </span>
            </h1>
            <p className="text-slate-400 text-lg mt-1">Select a calculus engine to solve limits, derivatives, and integrals live.</p>
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
                className="relative rounded-2xl cursor-pointer group overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(8, 16, 38, 0.95) 0%, rgba(12, 22, 50, 0.9) 50%, rgba(16, 28, 58, 0.85) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.12)',
                  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                }}
              >
                <div className={`h-1 w-full bg-gradient-to-r ${card.color}`} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center top, rgba(16, 185, 129, 0.08) 0%, transparent 70%)' }} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                      ONLINE
                    </span>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(20, 184, 166, 0.08))', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                      <span className="text-lg">∫</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white/90 mb-2 group-hover:text-emerald-300 transition-colors duration-300">{card.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{card.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400/80 text-xs font-bold tracking-wide group-hover:text-emerald-300 transition-colors">Launch Simulator</span>
                    <button className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-extrabold rounded-lg transition-all shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40">GO</button>
                  </div>
                </div>
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

            {/* LEFT PANEL */}
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
                <span className="self-start text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] mb-6">ONLINE</span>
                <h2 className="text-3xl font-extrabold text-white mb-3">{currentCard?.title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">{currentCard?.desc}</p>
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

                <h3 className="text-xl font-bold text-white mb-6">{currentFormula?.title}</h3>

                <div className="rounded-xl p-6 mb-6" style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                  <p className="text-emerald-300 text-xl md:text-2xl font-mono text-center leading-relaxed tracking-wide">
                    {currentFormula?.formula}
                  </p>
                </div>

                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg mb-4">Where:</h4>
                  <ul className="space-y-3">
                    {currentFormula?.variables?.map((v, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-emerald-300 font-mono font-bold text-sm shrink-0 mt-0.5">• {v.sym}</span>
                        <span className="text-slate-400 text-sm">= {v.def}</span>
                      </li>
                    ))}
                  </ul>
                </div>

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

  // ─── VIEW 3: VISUAL SOLVER LAYOUT ─────────────────────────────────────────
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col font-sans" style={{ background: '#050B18' }}>

      {/* HEADER */}
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
          <span>Back to Topics</span>
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
                <FunctionSquare className="w-5 h-5 text-emerald-400" /> Calculus Engine
              </h2>
              <p className="text-slate-500 text-xs mt-1">Configure inputs and watch calculus concepts solve live.</p>
            </div>

            {/* Method Selector */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Method</label>
              <select
                value={selectedMethod}
                onChange={(e) => { setSelectedMethod(e.target.value); setPlaybackState('IDLE'); }}
                className="w-full text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }}
              >
                {CARDS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            {/* Conditional Inputs */}
            {selectedMethod === 'Limit Calculator' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Function f(x)</label>
                  <select value={limitFuncId} onChange={e => { setLimitFuncId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }}>
                    {LIMIT_FUNCS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Approach Value (a)</label>
                  <input type="number" step="0.1" value={limitApproachVal}
                    onChange={e => { setLimitApproachVal(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }} />
                </div>
              </>
            )}

            {selectedMethod === 'First Principles Derivative' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Function f(x)</label>
                  <select value={derivFuncId} onChange={e => { setDerivFuncId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }}>
                    {DERIV_FUNCS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Evaluate at x =</label>
                  <input type="number" step="0.5" value={derivAtX}
                    onChange={e => { setDerivAtX(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }} />
                </div>
              </>
            )}

            {selectedMethod === 'Definite Integral' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Function f(x)</label>
                  <select value={integFuncId} onChange={e => { setIntegFuncId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }}>
                    {INTEG_FUNCS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lower [a]</label>
                    <input type="number" step="0.5" value={integA} onChange={e => { setIntegA(e.target.value); setPlaybackState('IDLE'); }}
                      className="w-full text-sm font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                      style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Upper [b]</label>
                    <input type="number" step="0.5" value={integB} onChange={e => { setIntegB(e.target.value); setPlaybackState('IDLE'); }}
                      className="w-full text-sm font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                      style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">n (even)</label>
                    <input type="number" min="2" step="2" value={integN} onChange={e => { setIntegN(e.target.value); setPlaybackState('IDLE'); }}
                      className="w-full text-sm font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                      style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }} />
                  </div>
                </div>
              </>
            )}

            {selectedMethod === "L'Hôpital's Rule" && (
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Problem</label>
                <select value={lhopitalProblemId} onChange={e => { setLhopitalProblemId(e.target.value); setPlaybackState('IDLE'); }}
                  className="w-full text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  style={{ background: '#0c1426', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#e2e8f0' }}>
                  {LHOPITAL_PROBS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
            )}
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
                    {s}×
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayPause}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-emerald-500/30"
                >
                  {playbackState === 'PLAYING' ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> {playbackState === 'FINISHED' ? 'Restart' : 'Start Solving'}</>}
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
              <div className={`h-full bg-emerald-500 rounded-full transition-all ${playbackState === 'PLAYING' ? 'animate-pulse' : ''}`} style={{ width: playbackState === 'FINISHED' ? '100%' : playbackState === 'PLAYING' ? '60%' : '15%' }} />
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
