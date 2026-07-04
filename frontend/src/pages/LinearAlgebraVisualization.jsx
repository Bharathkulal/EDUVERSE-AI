import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function LinearAlgebraVisualization() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  // State
  const [selectedMethod, setSelectedMethod] = useState(null); // null means show selection cards
  const [showFormula, setShowFormula] = useState(false); // Formula intermediate page
  const [formulaPage, setFormulaPage] = useState(0); // Current formula page index
  
  // Question selection states
  const [matMulQuestionId, setMatMulQuestionId] = useState('mm_q5');

  // Execution Control State
  const [playbackState, setPlaybackState] = useState('IDLE');
  const [speed, setSpeed] = useState(1);
  const [currentExplanation, setCurrentExplanation] = useState('Waiting for execution to start...');

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
      id: 'Matrix Multiplication', 
      title: 'Matrix Multiplication', 
      desc: 'Compute products of matrices element-by-element using row-column dot product operations.', 
      status: 'Intermediate', 
      time: '15 mins', 
      xp: '120 XP', 
      progress: 55,
      tags: ['Linear Algebra', 'Dot Product', 'Row × Column'],
      colorTheme: 'indigo',
      btnClass: 'bg-indigo-500 hover:bg-indigo-600 text-white',
      badgeClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
      icon: '🔢'
    },
    { 
      id: 'Orthogonal Verification', 
      title: 'Orthogonal Verification', 
      desc: 'Verify if a square matrix is orthogonal by computing the product of the matrix and its transpose (AAᵀ = I).', 
      status: 'Intermediate', 
      time: '15 mins', 
      xp: '120 XP', 
      progress: 75,
      tags: ['Linear Algebra', 'Transpose', 'Orthogonality'],
      colorTheme: 'emerald',
      btnClass: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      badgeClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      icon: '📐'
    }
  ];

  const FORMULA_DATA = {
    'Matrix Multiplication': {
      features: [
        { icon: BookOpen, title: 'Row × Column Rule', desc: 'Each entry C[i][j] is the dot product of row i of A with column j of B.' },
        { icon: Target, title: 'Dimension Requirement', desc: 'A (m×n) × B (n×p) → C (m×p). Inner dimensions must match.' },
        { icon: Lightbulb, title: 'Standard Products', desc: 'Q5: Permutation matrix squaring. Q6: Idempotent matrix multiplication.' },
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
    'Orthogonal Verification': {
      features: [
        { icon: BookOpen, title: 'Identity Matrix Product', desc: 'An orthogonal matrix multiplied by its transpose yields the Identity matrix.' },
        { icon: Target, title: 'Transpose Properties', desc: 'Rows become columns and columns become rows. AAᵀ = I.' },
        { icon: Lightbulb, title: 'Orthogonal Classes', desc: 'Q7: Rotation matrices. Q8: 3x3 fractional orthogonal matrices.' },
      ],
      formulas: [
        {
          title: 'Orthogonal Matrix Definition',
          formula: 'A \u00D7 A\u1D40 = A\u1D40 \u00D7 A = I',
          variables: [
            { sym: 'A', def: 'A square matrix' },
            { sym: 'A\u1D40', def: 'Transpose of matrix A' },
            { sym: 'I', def: 'Identity Matrix' },
          ]
        }
      ]
    }
  };

  // Filter questions based on selected method
  const activeQuestions = MATRIX_MUL_QUESTIONS.filter(q => {
    if (selectedMethod === 'Orthogonal Verification') {
      return q.type.startsWith('orthogonal');
    } else {
      return q.type === 'square' || q.type === 'product';
    }
  });

  const activeMatMulQuestion = MATRIX_MUL_QUESTIONS.find(q => q.id === matMulQuestionId) || activeQuestions[0];

  useEffect(() => {
    if (selectedMethod === 'Orthogonal Verification') {
      setMatMulQuestionId('mm_q7');
    } else if (selectedMethod === 'Matrix Multiplication') {
      setMatMulQuestionId('mm_q5');
    }
  }, [selectedMethod]);

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
    if (selectedMethod === 'Matrix Multiplication' || selectedMethod === 'Orthogonal Verification') {
      return (
        <NotebookEngine
          matMulQuestion={activeMatMulQuestion}
          method="Matrix Multiplication"
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
    return activeMatMulQuestion?.question || 'Compute matrix product using row × column dot product rule.';
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
              <span className="text-emerald-500 font-bold">Linear Algebra</span>
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
                LINEAR ALGEBRA LAB
              </h1>
            </div>
            <p className="text-[var(--db-text-secondary)] text-lg mt-1">Select a linear algebra runtime engine to execute your solution live.</p>
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
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${card.colorTheme}-500/40 to-transparent`} />

                <div className="space-y-4">
                  {/* Top Row: Icon and Method Number + Title */}
                  <div className="flex gap-4 items-start text-left">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${card.badgeClass}`}>
                      <span className="text-xl">{card.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-widest font-extrabold text-[var(--db-text-muted)]">
                        TOPIC {index + 1}
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
                    <span className="px-2 py-0.5 rounded-full font-bold text-[9px] border bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
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
                        card.colorTheme === 'indigo' ? 'bg-indigo-500' : 'bg-emerald-500'
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
                        <feat.icon className="w-5 h-5 text-emerald-555" />
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
                      <FunctionSquare className="w-5 h-5 text-emerald-555" />
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
                        <span className="text-emerald-555 font-mono font-bold text-sm shrink-0 mt-0.5">• {v.sym}</span>
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
                <FunctionSquare className="w-5 h-5 text-emerald-555" /> Math Engine
              </h2>
              <p className="text-[var(--db-text-muted)] text-xs mt-1">Configure inputs and watch linear algebra methods solve live.</p>
            </div>

            {/* Method Selector */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Select Method</label>
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

            {/* Problem Selector */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1.5 font-sans">Select Problem</label>
              <select 
                value={matMulQuestionId}
                onChange={(e) => { setMatMulQuestionId(e.target.value); setPlaybackState('IDLE'); }}
                className="w-full text-sm font-bold rounded-xl px-4 py-2.5 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] focus:ring-2 focus:ring-indigo-500 outline-none text-[var(--db-text-main)]"
              >
                {activeQuestions.map(q => (
                  <option key={q.id} value={q.id}>{q.label}</option>
                ))}
              </select>
            </div>

            {activeMatMulQuestion && (
              <div className="rounded-xl p-4 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] space-y-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Matrix Preview</p>
                <div className="flex items-center gap-3 flex-wrap justify-center">
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
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-emerald-500/20"
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
                <Settings2 className="w-5 h-5 text-emerald-555" />
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
