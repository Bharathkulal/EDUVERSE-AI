import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalBackButton from '../components/GlobalBackButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, ChevronLeft, Play, Pause, RotateCcw,
  Settings2, Activity, BrainCircuit, FunctionSquare, Rocket, X,
  BookOpen, Target, Lightbulb, ArrowRight,
  SkipBack, SkipForward, FastForward
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

  // L'Hopital inputs
  const [lhopitalProblemId, setLhopitalProblemId] = useState('p1');

  // Playback control
  const [playbackState, setPlaybackState] = useState('IDLE');
  const [speed, setSpeed] = useState(1);
  const [currentExplanation, setCurrentExplanation] = useState('Waiting for execution to start...');

  const CALC_FUNCTIONS = [
    { id: 'sin_over_x', label: 'f(x) = sin(x)/x' },
    { id: 'x2_minus_1', label: 'f(x) = (x²-1)/(x-1)' },
    { id: 'x3', label: 'f(x) = x³' },
    { id: 'cos_x', label: 'f(x) = cos(x)' },
    { id: 'e_x', label: 'f(x) = eˣ' },
    { id: 'sqrt_x', label: 'f(x) = √x' },
    { id: 'x2', label: 'f(x) = x²' },
    { id: 'sin_x', label: 'f(x) = sin(x)' },
    { id: 'reciprocal', label: 'f(x) = 1/(1+x)' },
    { id: 'x4', label: 'f(x) = x⁴' }
  ];

  const LHOPITAL_PROBS = [
    { id: 'p1', label: 'lim(x\u21920) sin(x)/x' },
    { id: 'p2', label: 'lim(x\u21920) (e\u1D5B - 1)/x' },
    { id: 'p3', label: 'lim(x\u21920) (1-cos(x))/x\u00B2' },
    { id: 'p4', label: 'lim(x\u21920) (x - sin(x))/x\u00B3' }
  ];

  const CARDS = [
    {
      id: 'Limit Calculator',
      title: 'Limit Calculator',
      desc: 'Evaluate the limit of a function as x approaches a value using numerical table analysis from left and right sides.',
      status: 'Beginner',
      time: '10 mins',
      xp: '80 XP',
      progress: 60,
      tags: ['Limits', 'Left-Hand Limit', 'Right-Hand Limit'],
      colorTheme: 'blue',
      btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      badgeClass: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
      icon: '→'
    },
    {
      id: 'First Principles Derivative',
      title: 'First Principles Derivative',
      desc: 'Find the derivative of a function at a point using the limit definition of the difference quotient.',
      status: 'Beginner',
      time: '12 mins',
      xp: '100 XP',
      progress: 50,
      tags: ['Derivative', 'First Principles', 'Limit Definition'],
      colorTheme: 'emerald',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badgeClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      icon: 'd/dx'
    },
    {
      id: 'Definite Integral',
      title: 'Definite Integral',
      desc: 'Evaluate definite integrals numerically using Composite Simpson\'s 1/3 Rule.',
      status: 'Intermediate',
      time: '15 mins',
      xp: '120 XP',
      progress: 70,
      tags: ['Integration', 'Simpson\'s Rule', 'Area Under Curve'],
      colorTheme: 'purple',
      btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
      badgeClass: 'bg-purple-500/10 border-purple-500/20 text-purple-650 dark:text-purple-400',
      icon: '∫'
    },
    {
      id: "L'Hôpital's Rule",
      title: "L'Hôpital's Rule",
      desc: "Resolve indeterminate limits of the form 0/0 or \u221E/\u221E by differentiating numerator and denominator.",
      status: 'Intermediate',
      time: '15 mins',
      xp: '120 XP',
      progress: 80,
      tags: ['Limits', 'Indeterminate Forms', 'Derivatives'],
      colorTheme: 'rose',
      btnClass: 'bg-rose-500 hover:bg-rose-600 text-white',
      badgeClass: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
      icon: 'H'
    }
  ];

  const FORMULA_DATA = {
    'Limit Calculator': {
      features: [
        { icon: BookOpen, title: 'Numerical Limit', desc: 'Build tables of values approaching target point from left and right.' },
        { icon: Target, title: 'Two-Sided Limit Check', desc: 'If L\u207B \u2248 L\u207A, the two-sided limit exists and equals that value.' },
        { icon: Lightbulb, title: 'Convergence', desc: 'Observe how step size h decreases to narrow in on the target.' },
      ],
      formulas: [
        {
          title: 'Two-Sided Limit definition',
          formula: 'lim(x \u2192 a) f(x) = L  \u27FA  lim(x \u2192 a\u207B) f(x) = lim(x \u2192 a\u207A) f(x) = L',
          variables: [
            { sym: 'a', def: 'The target value of x that we approach' },
            { sym: 'x \u2192 a\u207B', def: 'Left-Hand Limit (L\u207B) \u2014 approaching a from values less than a' },
            { sym: 'x \u2192 a\u207A', def: 'Right-Hand Limit (L\u207A) \u2014 approaching a from values greater than a' },
          ],
        },
      ],
    },
    'First Principles Derivative': {
      features: [
        { icon: BookOpen, title: 'Definition of Derivative', desc: 'Find derivative as limit of secant line slope as h approaches 0.' },
        { icon: Target, title: 'Difference Quotient', desc: 'Evaluate [f(x+h) - f(x)] / h for decreasing values of h.' },
        { icon: Lightbulb, title: 'Analytical Check', desc: 'Compare numerical approximation against exact analytical derivative.' },
      ],
      formulas: [
        {
          title: 'First Principles (Limit) Formula',
          formula: 'f\u2032(x) = lim(h \u2192 0) [ f(x + h) \u2212 f(x) ] / h',
          variables: [
            { sym: 'h', def: 'Small step interval (approaching 0)' },
            { sym: 'f(x+h) - f(x)', def: 'Change in function value' },
            { sym: 'f\u2032(x)', def: 'Slope of tangent line at point x' },
          ],
        },
      ],
    },
    'Definite Integral': {
      features: [
        { icon: BookOpen, title: 'Simpson\'s 1/3 Rule', desc: 'Approximate area under curve using quadratic parabolas.' },
        { icon: Target, title: 'Step Size', desc: 'Divide interval [a, b] into n equal subintervals of width h.' },
        { icon: Lightbulb, title: 'Even Subintervals', desc: 'Requires the number of intervals n to be even.' },
      ],
      formulas: [
        {
          title: 'Composite Simpson\'s 1/3 Rule',
          formula: 'I \u2248 (h / 3) [ f(x\u2080) + 4\u00B7\u2211(odd) + 2\u00B7\u2211(even) + f(x_n) ]',
          variables: [
            { sym: 'h', def: 'Subinterval width: (b \u2212 a) / n' },
            { sym: 'x_i', def: 'Nodes where function is evaluated: a + i\u00B7h' },
            { sym: 'n', def: 'Number of intervals (must be even)' },
          ],
        },
      ],
    },
    "L'Hôpital's Rule": {
      features: [
        { icon: BookOpen, title: 'Indeterminate Forms', desc: 'Apply to resolve limits of forms 0/0 or \u221E/\u221E.' },
        { icon: Target, title: 'Separate Differentiation', desc: 'Differentiate numerator and denominator independently.' },
        { icon: Lightbulb, title: 'Transformed Limit', desc: 'Find limit of f\'(x)/g\'(x) as x approaches a.' },
      ],
      formulas: [
        {
          title: "L'Hôpital's Rule Theorem",
          formula: 'lim(x \u2192 a) [ f(x) / g(x) ] = lim(x \u2192 a) [ f\u2032(x) / g\u2032(x) ]',
          variables: [
            { sym: 'a', def: 'Target approach point' },
            { sym: 'f\u2032(x), g\u2032(x)', def: 'First derivatives of numerator and denominator functions' },
          ],
        },
      ],
    },
  };

  // Engine Event Handlers
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

  const renderActiveEngine = () => {
    if (!selectedMethod) return null;

    const commonProps = {
      method: selectedMethod,
      playbackState,
      speed,
      onExplain: handleExplanationUpdate,
      onFinish: handleExecutionFinished,
      onPlaybackStateChange: setPlaybackState,
      // Limits
      limitFuncId,
      limitApproachVal,
      // Derivatives
      derivFuncId,
      derivAtX,
      // Integrals
      integFuncId,
      integA,
      integB,
      integN,
      // L'Hopital
      lhopitalProblemId
    };

    return <CalculusNotebookEngine {...commonProps} />;
  };

  const getTopQuestionText = () => {
    if (selectedMethod === 'Limit Calculator') {
      const fn = CALC_FUNCTIONS.find(f => f.id === limitFuncId);
      return `Find: lim(x \u2192 ${limitApproachVal}) [ ${fn ? fn.label.split('=')[1].trim() : 'f(x)'} ]`;
    }
    if (selectedMethod === 'First Principles Derivative') {
      const fn = CALC_FUNCTIONS.find(f => f.id === derivFuncId);
      return `Find: f'(${derivAtX}) for ${fn ? fn.label : 'f(x)'}`;
    }
    if (selectedMethod === 'Definite Integral') {
      const fn = CALC_FUNCTIONS.find(f => f.id === integFuncId);
      return `Evaluate: \u222B[${integA} to ${integB}] (${fn ? fn.label.split('=')[1].trim() : 'f(x)'}) dx using n=${integN} subintervals`;
    }
    if (selectedMethod === "L'Hôpital's Rule") {
      const prob = LHOPITAL_PROBS.find(p => p.id === lhopitalProblemId);
      return `Evaluate: ${prob ? prob.label : 'Limit'} using L'Hôpital's Rule`;
    }
    return `Solving using ${selectedMethod}.`;
  };

  // VIEW 1: CARD SELECTION DASHBOARD
  if (!selectedMethod) {
    return (
      <MathBackground>
        <header className="h-16 flex items-center justify-between px-8 relative z-20 bg-[var(--db-card-bg)]/30 border-b border-[var(--db-card-border)] backdrop-blur-sm">
          <div className="flex items-center">
            <GlobalBackButton className="mr-4" />
            <div className="flex items-center text-sm font-medium text-[var(--db-text-muted)] gap-2">
              <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span> <ChevronRight className="w-4 h-4" />
              <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/subjects')}>Subjects</span> <ChevronRight className="w-4 h-4" />
              <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/subjects/math-proto', { state: { activeView: 'practical' } })}>Mathematics</span> <ChevronRight className="w-4 h-4" />
              <span className="text-emerald-555 font-bold">Calculus Simulator</span>
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
                className="relative rounded-[24px] cursor-pointer group overflow-hidden border border-[var(--db-card-border)]/65 bg-[var(--db-card-bg)]/45 dark:bg-[var(--db-card-bg)]/70 backdrop-blur-xl hover:border-emerald-500/40 hover:scale-[1.01] transition-all duration-500 shadow-lg hover:shadow-emerald-500/5 p-6 flex flex-col justify-between min-h-[380px]"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-blue-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:via-blue-500/10 dark:to-teal-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-500 bg-loop" style={{ backgroundSize: '200% 200%' }} />

                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${card.colorTheme === 'amber' ? 'amber-500' : card.colorTheme === 'emerald' ? 'emerald-500' : card.colorTheme}-500/40 to-transparent`} />

                <div className="relative z-10 space-y-4">
                  <div className="flex gap-4 items-start text-left">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${card.badgeClass}`}>
                      <span className="text-xl">{card.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-widest font-extrabold text-[var(--db-text-muted)]">
                        METHOD {index + 1}
                      </span>
                      <h3 className="text-base font-bold text-[var(--db-text-main)] mt-0.5 group-hover:text-emerald-555 transition-colors">
                        {card.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-[var(--db-text-secondary)] text-xs leading-relaxed text-left line-clamp-2">
                    {card.desc}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {card.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--db-card-border)] bg-[var(--db-card-bg-elevated)]/50 text-[var(--db-text-secondary)]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] pt-1">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${card.status === 'Beginner' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
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

                <div className="relative z-10 mt-4 pt-3 border-t border-[var(--db-card-border)] space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[var(--db-text-muted)]">
                    <span>Progress</span>
                    <span>{card.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${card.colorTheme === 'blue' ? 'bg-blue-500' :
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

                <button className={`relative z-10 w-full py-2.5 mt-5 font-bold rounded-xl text-xs transition duration-200 flex items-center justify-center gap-1.5 ${card.btnClass}`}>
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

  // VIEW 2: FORMULA INTERMEDIATE PAGE
  if (showFormula && selectedMethod) {
    const methodFormulas = FORMULA_DATA[selectedMethod];
    const currentCard = CARDS.find(c => c.id === selectedMethod);
    const currentFormula = methodFormulas?.formulas?.[formulaPage] || methodFormulas?.formulas?.[0];
    const totalPages = methodFormulas?.formulas?.length || 1;

    return (
      <MathBackground>
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
                        <feat.icon className="w-5 h-5 text-emerald-555" />
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
                  <p className="text-emerald-650 dark:text-emerald-300 text-xl md:text-2xl font-mono text-center leading-relaxed tracking-wide">
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

  // VIEW 3: VISUAL SOLVER LAYOUT
  return (
    <div className={`h-screen w-full overflow-hidden flex flex-col font-sans db-page-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`} style={{ backgroundColor: 'var(--db-bg)', color: 'var(--db-text-main)' }}>
      {/* HEADER */}
      <header className="h-16 flex items-center justify-between px-8 relative z-20 bg-[var(--db-card-bg)] border-b border-[var(--db-card-border)]">
        <div className="flex items-center">
          <GlobalBackButton className="mr-4" />
          <div className="flex items-center text-sm font-medium text-[var(--db-text-muted)] gap-2">
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span> <ChevronRight className="w-4 h-4" />
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/subjects')}>Subjects</span> <ChevronRight className="w-4 h-4" />
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/subjects/math-proto', { state: { activeView: 'practical' } })}>Mathematics</span> <ChevronRight className="w-4 h-4" />
            <span className="text-emerald-555 font-bold">{selectedMethod}</span>
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
            {selectedMethod === 'Limit Calculator' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Function</label>
                  <select value={limitFuncId} onChange={e => { setLimitFuncId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]">
                    {CALC_FUNCTIONS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Approach Value (a)</label>
                  <input type="number" step="any" value={limitApproachVal}
                    onChange={e => { setLimitApproachVal(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                </div>
              </>
            )}

            {selectedMethod === 'First Principles Derivative' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Function</label>
                  <select value={derivFuncId} onChange={e => { setDerivFuncId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]">
                    {CALC_FUNCTIONS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Evaluate at x</label>
                  <input type="number" step="any" value={derivAtX}
                    onChange={e => { setDerivAtX(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                </div>
              </>
            )}

            {selectedMethod === 'Definite Integral' && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Integrand</label>
                  <select value={integFuncId} onChange={e => { setIntegFuncId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]">
                    {CALC_FUNCTIONS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Lower Limit (a)</label>
                  <input type="number" step="any" value={integA}
                    onChange={e => { setIntegA(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Upper Limit (b)</label>
                  <input type="number" step="any" value={integB}
                    onChange={e => { setIntegB(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Sub-intervals (n - must be even)</label>
                  <input type="number" step="2" min="2" max="20" value={integN}
                    onChange={e => { setIntegN(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]" />
                </div>
              </>
            )}

            {selectedMethod === "L'Hôpital's Rule" && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5">Select Limit Problem</label>
                  <select value={lhopitalProblemId} onChange={e => { setLhopitalProblemId(e.target.value); setPlaybackState('IDLE'); }}
                    className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--db-text-main)]">
                    {LHOPITAL_PROBS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Playback Controls */}
          <div className="p-4 pt-2 shrink-0 border-t border-[var(--db-card-border)]">
            <div className="rounded-2xl p-4 flex flex-col gap-3 bg-[var(--db-card-bg-elevated)] shadow-sm">
              <div className="flex justify-between items-center p-1 rounded-xl bg-[var(--db-input-bg)] border border-[var(--db-card-border)]">
                {[0.5, 1, 1.5, 2].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${speed === s ? 'bg-emerald-500 text-white shadow' : 'text-[var(--db-text-muted)] hover:text-[var(--db-text-main)]'}`}
                  >
                    {s}×
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setPlaybackState('PREV')}
                  disabled={playbackState === 'IDLE'}
                  title="Previous Step"
                  className="bg-[var(--db-input-bg)] border border-[var(--db-card-border)] hover:border-emerald-500/50 hover:bg-[var(--db-btn-secondary-hover)] text-[var(--db-text-main)] font-bold py-2.5 rounded-xl flex items-center justify-center transition active:scale-95 disabled:opacity-40"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePlayPause}
                  title={playbackState === 'PLAYING' ? 'Pause' : 'Play'}
                  className="col-span-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-500/10"
                >
                  {playbackState === 'PLAYING' ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5" />}
                  <span className="text-xs uppercase tracking-wider">{playbackState === 'PLAYING' ? 'Pause' : 'Solve'}</span>
                </button>

                <button
                  onClick={() => setPlaybackState('NEXT')}
                  disabled={playbackState === 'FINISHED' || playbackState === 'IDLE'}
                  title="Next Step"
                  className="bg-[var(--db-input-bg)] border border-[var(--db-card-border)] hover:border-emerald-500/50 hover:bg-[var(--db-btn-secondary-hover)] text-[var(--db-text-main)] font-bold py-2.5 rounded-xl flex items-center justify-center transition active:scale-95 disabled:opacity-40"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPlaybackState('SKIP')}
                  disabled={playbackState === 'FINISHED' || playbackState === 'IDLE'}
                  className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200/20 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wide uppercase transition active:scale-95 disabled:opacity-40"
                >
                  <FastForward className="w-3.5 h-3.5" /> Skip Animation
                </button>
                <button
                  onClick={handleReplay}
                  title="Replay Solution"
                  className="w-12 bg-[var(--db-input-bg)] border border-[var(--db-card-border)] hover:border-emerald-500/50 hover:bg-[var(--db-btn-secondary-hover)] text-[var(--db-text-main)] rounded-xl flex items-center justify-center transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
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
            <span className="text-emerald-555 text-[10px] font-black uppercase tracking-widest">
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
                    <span className="text-emerald-550 font-bold mb-1 block">CURRENT STEP:</span>
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
