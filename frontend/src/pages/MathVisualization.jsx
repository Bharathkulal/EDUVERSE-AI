import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ChevronRight, Play, Pause, RotateCcw, 
  Settings2, Activity, BrainCircuit, FunctionSquare
} from 'lucide-react';
import NotebookEngine from '../components/MathEngines/NotebookEngine';

export default function MathVisualization() {
  const navigate = useNavigate();
  
  // State
  const [selectedMethod, setSelectedMethod] = useState(null); // null means show the selection cards
  const [funcId, setFuncId] = useState('reciprocal');
  const [a, setA] = useState('0');
  const [b, setB] = useState('1');
  const [n, setN] = useState('4'); // Using n (intervals) instead of h (step size) as it's easier to visualize discrete steps
  
  // Newton's Interpolation States
  const [newtonQuestionId, setNewtonQuestionId] = useState('q9');
  const [newtonDirection, setNewtonDirection] = useState('Forward'); // Forward or Backward
  const [newtonTargetX, setNewtonTargetX] = useState('1895');

  // Newton's Difference (Differentiation) States
  const [newtonDiffQuestionId, setNewtonDiffQuestionId] = useState('qd12');
  const [newtonDiffDirection, setNewtonDiffDirection] = useState('Forward');
  const [newtonDiffTargetX, setNewtonDiffTargetX] = useState('1.2');

  // Execution Control State
  const [playbackState, setPlaybackState] = useState('IDLE'); // IDLE, PLAYING, PAUSED, FINISHED
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
      question: '9. The population of a town in the decennial census was as given below. Estimate the population for the year 1895 using Newton’s forward difference interpolation formula.'
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
      question: '10. The population of a town in the decennial census was as given below. Estimate the population for the year 1925 using Newton’s backward difference interpolation formula.'
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
      question: '8. Find the cubic polynomial which takes the following values y(0)=1, y(1)=0, y(2)=1 and y(3)=10. And obtain y(4) using Newton’s forward difference interpolation formula.'
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
      question: '11. In the table below the values of y are consecutive terms of a series of which the number 21.6 is the 6th term. Find the first term of the series (x=1) using Newton’s forward difference interpolation formula.'
    }
  ];

  const NEWTON_DIFF_QUESTIONS = [
    {
      id: 'qd12',
      label: 'Q12: dy/dx & d²y/dx² at x=1.2 (Forward)',
      x: [1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2],
      y: [2.7183, 3.3201, 4.0552, 4.9530, 6.0496, 7.3891, 7.0250],
      xLabel: 'x',
      yLabel: 'y',
      defaultTarget: 1.2,
      defaultDirection: 'Forward',
      question: 'From the following table of values of x and y, obtain dy/dx and d²y/dx² for x = 1.2 using Newton’s forward difference formula.'
    },
    {
      id: 'qd13',
      label: 'Q13: dy/dx & d²y/dx² at x=6 (Backward)',
      x: [0, 1, 2, 3, 4, 5, 6],
      y: [6.9897, 7.4036, 7.7815, 8.1291, 8.4510, 8.7506, 9.0309],
      xLabel: 'x',
      yLabel: 'y',
      defaultTarget: 6,
      defaultDirection: 'Backward',
      question: 'From the following table of values of x and y, obtain dy/dx and d²y/dx² for x = 6 using Newton’s backward difference formula.'
    }
  ];

  const CARDS = [
    { id: 'Newton’s Interpolation', title: 'Newton’s Interpolation', desc: 'Estimate values between data points using forward/backward difference polynomials.', status: 'Online', color: 'from-emerald-500 to-teal-600' },
    { id: 'Newton’s Difference', title: 'Newton’s Difference', desc: 'Obtain first (dy/dx) and second (d²y/dx²) derivatives from difference tables.', status: 'Online', color: 'from-violet-500 to-purple-600' },
    { id: 'Trapezoidal Rule', title: 'Trapezoidal Rule', desc: 'Calculate the approximate area under a curve using boundary nodes.', status: 'Online', color: 'from-blue-500 to-indigo-600' },
    { id: 'Simpson’s 1/3 Rule', title: 'Simpson’s 1/3 Rule', desc: 'Higher accuracy quadratic polynomial area approximation.', status: 'Offline', color: 'from-amber-500 to-orange-600' },
    { id: 'Simpson’s 3/8 Rule', title: 'Simpson’s 3/8 Rule', desc: 'Cubic polynomial boundaries for high precision integration.', status: 'Offline', color: 'from-pink-500 to-rose-600' },
    { id: 'RK4', title: 'RK4 Method', desc: 'Solve ordinary differential equations step-by-step.', status: 'Offline', color: 'from-sky-500 to-blue-600' }
  ];

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
    } else if (selectedMethod === 'Newton’s Interpolation') {
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
    } else if (selectedMethod === 'Newton’s Difference') {
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
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
        <Activity className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-xl font-bold">Engine Offline</p>
        <p className="text-sm">The {selectedMethod} notebook engine is currently under construction.</p>
      </div>
    );
  };

  const getTopQuestionText = () => {
    if (selectedMethod === 'Trapezoidal Rule') {
      return `Evaluate: I = ∫ [${a} to ${b}] ( ${activeFunction?.label?.split('=')[1]?.trim() || ''} ) dx using Trapezoidal Rule.`;
    } else if (selectedMethod === 'Newton’s Interpolation') {
      return activeQuestion?.question || '';
    } else if (selectedMethod === 'Newton’s Difference') {
      return activeDiffQuestion?.question || '';
    }
    return `Solving math system using ${selectedMethod}.`;
  };

  // If no method selected, render the selection dashboard
  if (!selectedMethod) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm">
          <button onClick={() => navigate('/subjects/math-proto')} className="mr-4 p-2 hover:bg-slate-100 rounded-full transition font-bold flex items-center gap-1 text-slate-600">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center text-sm font-medium text-slate-500 gap-2">
            <span>Home</span> <ChevronRight className="w-4 h-4" />
            <span>Subjects</span> <ChevronRight className="w-4 h-4" />
            <span>Mathematics</span> <ChevronRight className="w-4 h-4" />
            <span className="text-emerald-600 font-bold">Numerical Methods</span>
          </div>
        </header>

        {/* CARDS CONTAINER */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-10 overflow-y-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Numerical Methods Lab</h1>
            <p className="text-slate-500 text-lg mt-2">Select a mathematical runtime engine to execute your solution live.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CARDS.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setSelectedMethod(card.id)}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
              >
                {/* Background overlay accent */}
                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${card.color}`} />

                <div>
                  <div className="flex items-center justify-between mb-4 pl-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${card.status === 'Online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {card.status}
                    </span>
                    <span className="text-2xl group-hover:scale-110 transition duration-300">🧮</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-2 pl-2 group-hover:text-emerald-600 transition">{card.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 pl-2">{card.desc}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 pl-2">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-500 transition flex items-center gap-1">
                    Launch Simulator <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Render the visual solver layout
  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* HEADER BREADCRUMB - 64px */}
      <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm relative z-10">
        <button 
          onClick={() => {
            setSelectedMethod(null);
            setPlaybackState('IDLE');
          }} 
          className="mr-4 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition font-bold flex items-center gap-1.5 text-xs text-slate-600"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Back to Methods</span>
        </button>
        <div className="flex items-center text-sm font-medium text-slate-500 gap-2">
          <span>Home</span> <ChevronRight className="w-4 h-4" />
          <span>Subjects</span> <ChevronRight className="w-4 h-4" />
          <span>Mathematics</span> <ChevronRight className="w-4 h-4" />
          <span className="text-emerald-600 font-bold">{selectedMethod}</span>
        </div>
      </header>

      {/* MAIN CONTENT — 100vh - 64px, NO SCROLL */}
      <main className="flex-1 p-5 gap-5 flex flex-row h-[calc(100vh-64px)] max-w-[1920px] mx-auto w-full overflow-hidden">
        
        {/* ==========================================
            LEFT PANEL: INPUT SYSTEM (25%)
        =========================================== */}
        <div className="w-full lg:w-1/4 lg:min-w-[300px] lg:h-full bg-white/70 backdrop-blur-xl border border-[#E2E8F0] rounded-[24px] shadow-lg flex flex-col shrink-0 overflow-hidden">
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 pb-2">
            <div className="mb-4">
              <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                <FunctionSquare className="w-5 h-5 text-emerald-500" /> Math Engine
              </h2>
              <p className="text-[#64748B] text-xs mt-1">Configure inputs and watch numerical methods solve live.</p>
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
                className="w-full bg-white border border-slate-300 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                {CARDS.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* Conditional Input Rendering based on Method */}
            {selectedMethod === 'Trapezoidal Rule' ? (
              <>
                {/* Function Input */}
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Function f(x)</label>
                  <select 
                    value={funcId}
                    onChange={(e) => {
                      setFuncId(e.target.value);
                      setPlaybackState('IDLE');
                    }}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    {PREDEFINED_FUNCTIONS.map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>

                {/* Boundaries */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lower [a]</label>
                    <input type="number" step="0.1" value={a} onChange={e => { setA(e.target.value); setPlaybackState('IDLE'); }} className="w-full bg-white border border-slate-300 text-slate-800 text-sm font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Upper [b]</label>
                    <input type="number" step="0.1" value={b} onChange={e => { setB(e.target.value); setPlaybackState('IDLE'); }} className="w-full bg-white border border-slate-300 text-slate-800 text-sm font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Steps (n)</label>
                    <input type="number" min="1" max="20" value={n} onChange={e => { setN(e.target.value); setPlaybackState('IDLE'); }} className="w-full bg-white border border-slate-300 text-slate-800 text-sm font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              </>
            ) : selectedMethod === 'Newton’s Interpolation' ? (
              <>
                {/* Select Question Dropdown */}
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
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    {NEWTON_QUESTIONS.map(q => (
                      <option key={q.id} value={q.id}>{q.label}</option>
                    ))}
                  </select>
                </div>

                {/* Interpolation Direction Toggle */}
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Interpolation Direction</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['Forward', 'Backward'].map(dir => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => {
                          setNewtonDirection(dir);
                          setPlaybackState('IDLE');
                        }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${newtonDirection === dir ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimate Point */}
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Estimate Value at (x)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newtonTargetX} 
                    onChange={e => { setNewtonTargetX(e.target.value); setPlaybackState('IDLE'); }} 
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>
              </>
            ) : selectedMethod === 'Newton’s Difference' ? (
              <>
                {/* Select Question Dropdown */}
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
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    {NEWTON_DIFF_QUESTIONS.map(q => (
                      <option key={q.id} value={q.id}>{q.label}</option>
                    ))}
                  </select>
                </div>

                {/* Interpolation Direction Toggle */}
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Interpolation Direction</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['Forward', 'Backward'].map(dir => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => {
                          setNewtonDiffDirection(dir);
                          setPlaybackState('IDLE');
                        }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${newtonDiffDirection === dir ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimate Point */}
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Evaluate Derivative at (x)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newtonDiffTargetX} 
                    onChange={e => { setNewtonDiffTargetX(e.target.value); setPlaybackState('IDLE'); }} 
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>
              </>
            ) : null}
          </div>

          {/* STICKY Playback Controls — Always visible */}
          <div className="p-4 pt-2 border-t border-slate-200 bg-white/80 backdrop-blur shrink-0">
            <div className="bg-slate-900 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
              
              <div className="flex justify-between items-center bg-slate-800 p-1 rounded-xl">
                {[0.5, 1, 2].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSpeed(s)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${speed === s ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    {s}×
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePlayPause}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-emerald-500/30"
                >
                  {playbackState === 'PLAYING' ? <><Pause className="w-5 h-5"/> Pause</> : <><Play className="w-5 h-5"/> {playbackState === 'FINISHED' ? 'Restart' : '▶ Start Solving'}</>}
                </button>
                <button onClick={handleReplay} className="w-12 h-[48px] bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center transition active:scale-95">
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </div>


        {/* ==========================================
            MIDDLE PANEL: ANIMATION ENGINE (50%)
        =========================================== */}
        <div className="w-full lg:flex-1 min-h-[400px] lg:h-full bg-white/70 backdrop-blur-xl border border-[#E2E8F0] rounded-[24px] shadow-lg flex flex-col relative overflow-hidden shrink-0">
          {/* MIDDLE TOP QUESTION DISPLAY CARD */}
          <div className="shrink-0 bg-slate-50 border-b border-slate-200 px-8 py-3 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="text-[12px] font-bold text-slate-600 font-sans tracking-wide">
              {getTopQuestionText()}
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            {renderActiveEngine()}
          </div>
        </div>


        {/* ==========================================
            RIGHT PANEL: AI EXPLAINER (25%)
        =========================================== */}
        <div className="w-full lg:w-1/4 lg:min-w-[300px] lg:h-full flex flex-col gap-5 shrink-0">
          
          <div className="flex-1 bg-gradient-to-b from-[#0F172A] to-[#1E293B] border border-slate-700 rounded-[24px] shadow-xl p-6 text-white flex flex-col relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
              <BrainCircuit className="w-64 h-64 text-emerald-400" />
            </div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10 border-b border-slate-700 pb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Execution Trace</h3>
                <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Live Interpreter</p>
              </div>
            </div>

            <div className="flex-1 relative z-10 font-mono text-[13px] leading-relaxed text-emerald-50 flex flex-col">
              <div className="mb-4 text-slate-400">
                &gt; Analyzing runtime parameters...<br/>
                &gt; Method: {selectedMethod}<br/>
                {selectedMethod === 'Trapezoidal Rule' ? (
                  <>&gt; Interval: [{a}, {b}], Steps: {n}<br/></>
                ) : (
                  <>&gt; Target X: {newtonTargetX}<br/></>
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
                    className="p-4 bg-emerald-900/30 border-l-2 border-emerald-500 rounded-r-lg"
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
