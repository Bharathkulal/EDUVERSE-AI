import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRightToLine, ArrowUpFromLine, Eye, 
  Trash2, XCircle, ChevronRight, Zap, Info, ShieldAlert,
  Play, RotateCcw, Pause, SkipBack, SkipForward
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import '../pages/DashboardTheme.css';

const MAX_CAPACITY = 6;

export default function StackVisualization() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isGameRotated, setIsGameRotated] = useState(localStorage.getItem('dsa_game_mode') === 'true');
  
  // State
  const [stack, setStack] = useState([]); // array of objects {id, value}
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState([]);
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState('Learn');
  const [activeLine, setActiveLine] = useState(null); // For code highlighting
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [underflow, setUnderflow] = useState(false);
  const [peekIndex, setPeekIndex] = useState(null);

  // Debugger Controller State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentOpIndex, setCurrentOpIndex] = useState(-1);
  const operationsQueue = [
    { type: 'push', value: 10 },
    { type: 'push', value: 20 },
    { type: 'push', value: 50 },
    { type: 'pop' },
    { type: 'peek' },
    { type: 'push', value: 100 }
  ];

  // Focus ref for input
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addHistory = (action) => {
    setHistory(prev => [action, ...prev].slice(0, 4));
  };

  const getDuration = (base) => base / speed;

  const applyOperationsUpToIndex = (targetIndex) => {
    if (targetIndex < 0) {
      setStack([]);
      setCurrentOpIndex(-1);
      return;
    }
    let tempStack = [];
    for (let i = 0; i <= targetIndex; i++) {
      const op = operationsQueue[i];
      if (op.type === 'push') {
        tempStack.push({ id: Date.now() + i, value: op.value });
      } else if (op.type === 'pop') {
        tempStack.pop();
      }
    }
    setStack(tempStack);
    setCurrentOpIndex(targetIndex);
  };

  const executeOperation = async (op) => {
    if (op.type === 'push') {
      setIsAnimating(true);
      setActiveLine('push_check');
      await new Promise(r => setTimeout(r, getDuration(400)));
      if (stack.length >= MAX_CAPACITY) {
        setActiveLine('push_overflow');
        setOverflow(true);
        addHistory(`Push(${op.value}) - Failed (Overflow)`);
        await new Promise(r => setTimeout(r, getDuration(1000)));
        setOverflow(false);
        setIsAnimating(false);
        setActiveLine(null);
        return;
      }
      setActiveLine('push_execute');
      const newId = Date.now();
      await new Promise(r => setTimeout(r, getDuration(800)));
      setStack(prev => [...prev, { id: newId, value: op.value }]);
      addHistory(`Push(${op.value})`);
      setIsAnimating(false);
      setActiveLine(null);
    } else if (op.type === 'pop') {
      setIsAnimating(true);
      setActiveLine('pop_check');
      await new Promise(r => setTimeout(r, getDuration(400)));
      if (stack.length === 0) {
        setActiveLine('pop_underflow');
        setUnderflow(true);
        addHistory(`Pop() - Failed (Underflow)`);
        await new Promise(r => setTimeout(r, getDuration(1000)));
        setUnderflow(false);
        setIsAnimating(false);
        setActiveLine(null);
        return;
      }
      setActiveLine('pop_execute');
      const poppedValue = stack[stack.length - 1].value;
      await new Promise(r => setTimeout(r, getDuration(800)));
      setStack(prev => prev.slice(0, -1));
      addHistory(`Pop() -> ${poppedValue}`);
      setIsAnimating(false);
      setActiveLine(null);
    } else if (op.type === 'peek') {
      setIsAnimating(true);
      setActiveLine('peek');
      if (stack.length > 0) {
        setPeekIndex(stack.length - 1);
        addHistory(`Peek() -> ${stack[stack.length - 1].value}`);
      } else {
        addHistory(`Peek() -> Empty`);
      }
      await new Promise(r => setTimeout(r, getDuration(1500)));
      setPeekIndex(null);
      setIsAnimating(false);
      setActiveLine(null);
    }
  };

  const handleNext = async () => {
    if (isAnimating) return;
    const nextIndex = currentOpIndex + 1;
    if (nextIndex < operationsQueue.length) {
      setCurrentOpIndex(nextIndex);
      await executeOperation(operationsQueue[nextIndex]);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (isAnimating) return;
    const prevIndex = currentOpIndex - 1;
    applyOperationsUpToIndex(prevIndex);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsAnimating(false);
    setActiveLine(null);
    setStack([]);
    setCurrentOpIndex(-1);
    addHistory('Reset Simulation');
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let playTimeout;
    if (isPlaying && !isAnimating) {
      if (currentOpIndex < operationsQueue.length - 1) {
        playTimeout = setTimeout(() => {
          handleNext();
        }, 1000);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(playTimeout);
  }, [isPlaying, isAnimating, currentOpIndex]);

  // Operations
  const handlePush = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setActiveLine('push_check');
    
    await new Promise(r => setTimeout(r, getDuration(400)));

    if (stack.length >= MAX_CAPACITY) {
      setActiveLine('push_overflow');
      setOverflow(true);
      addHistory(`Push(${inputValue}) - Failed (Overflow)`);
      setTimeout(() => {
        setOverflow(false);
        setIsAnimating(false);
        setActiveLine(null);
      }, getDuration(1000));
      return;
    }

    setActiveLine('push_execute');
    let newValue = parseInt(inputValue, 10);
    if (isNaN(newValue)) {
      newValue = Math.floor(Math.random() * 100) + 1; // Auto generate
    }
    const newId = Date.now();
    
    // Simulate animation delay
    setTimeout(() => {
      setStack(prev => [...prev, { id: newId, value: newValue }]);
      addHistory(`Push(${newValue})`);
      setInputValue('');
      inputRef.current?.focus();
      setIsAnimating(false);
      setActiveLine(null);
    }, getDuration(800));
  };

  const handlePop = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setActiveLine('pop_check');
    
    await new Promise(r => setTimeout(r, getDuration(400)));

    if (stack.length === 0) {
      setActiveLine('pop_underflow');
      setUnderflow(true);
      addHistory(`Pop() - Failed (Underflow)`);
      setTimeout(() => {
        setUnderflow(false);
        setIsAnimating(false);
        setActiveLine(null);
      }, getDuration(1000));
      return;
    }

    setActiveLine('pop_execute');
    // Pre-animation state (glow red, move up) is handled by framer-motion exit props
    const poppedValue = stack[stack.length - 1].value;
    
    setTimeout(() => {
      setStack(prev => prev.slice(0, -1));
      addHistory(`Pop() -> ${poppedValue}`);
      setIsAnimating(false);
      setActiveLine(null);
    }, getDuration(800)); // allow exit animation to play
  };

  const handlePeek = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setActiveLine('peek');
    
    if (stack.length > 0) {
      setPeekIndex(stack.length - 1);
      addHistory(`Peek() -> ${stack[stack.length - 1].value}`);
    } else {
      addHistory(`Peek() -> Empty`);
    }

    setTimeout(() => {
      setPeekIndex(null);
      setIsAnimating(false);
      setActiveLine(null);
    }, getDuration(1500));
  };

  const handleClear = () => {
    setStack([]);
    addHistory('Clear()');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handlePush();
    }
  };

  // UI Components
  const renderCode = () => {
    const lines = [
      { id: 'def', text: '#define MAX 6\n\nint stack[MAX];\nint top = -1;\n' },
      { id: 'push_def', text: 'void push(int value) {' },
      { id: 'push_check', text: '    if (top == MAX - 1) {' },
      { id: 'push_overflow', text: '        printf("Stack Overflow");\n        return;\n    }' },
      { id: 'push_execute', text: '\n    top++;\n    stack[top] = value;\n}\n' },
      { id: 'pop_def', text: 'int pop() {' },
      { id: 'pop_check', text: '    if (top == -1) {' },
      { id: 'pop_underflow', text: '        printf("Stack Underflow");\n        return -1;\n    }' },
      { id: 'pop_execute', text: '\n    return stack[top--];\n}\n' },
      { id: 'peek', text: 'int peek() {\n    return stack[top];\n}' }
    ];

    return (
      <pre className="font-mono text-sm leading-relaxed text-[var(--db-text-main)] bg-[var(--db-card-bg-elevated)]/50 p-6 rounded-xl border border-[var(--db-card-border)] overflow-hidden shadow-inner h-full">
        <code>
          {lines.map((line) => (
            <div 
              key={line.id} 
              className={`transition-colors duration-300 px-2 rounded ${activeLine === line.id ? 'bg-blue-500/20 text-blue-300 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
            >
              {line.text}
            </div>
          ))}
        </code>
      </pre>
    );
  };

  return (
    <div className={`w-full flex flex-col font-sans db-page-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'} ${isGameRotated ? 'rotate-landscape-mode' : 'min-h-screen lg:h-screen lg:overflow-hidden'}`} style={{ backgroundColor: 'var(--db-bg)', color: 'var(--db-text-main)' }}>
      
      {/* HEADER BREADCRUMB - 64px */}
      <header className="h-16 shrink-0 bg-[var(--db-card-bg)] border-b border-[var(--db-header-border)] flex items-center justify-between px-4 lg:px-8 shadow-sm relative z-10">
        <div className="flex items-center overflow-hidden">
          <button onClick={() => navigate(-1)} className="mr-2 lg:mr-4 p-2 hover:bg-[var(--db-btn-secondary-hover)] rounded-full transition shrink-0">
            <ArrowLeft className="w-5 h-5 text-[var(--db-text-main)]" />
          </button>
          <div className="flex items-center text-xs lg:text-sm font-medium text-[var(--db-text-muted)] gap-1.5 lg:gap-2 truncate">
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span> <ChevronRight className="w-3 h-3 lg:w-4 h-4 shrink-0" />
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/subjects')}>Subjects</span> <ChevronRight className="w-3 h-3 lg:w-4 h-4 shrink-0" />
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/dsa')}>DSA</span> <ChevronRight className="w-3 h-3 lg:w-4 h-4 shrink-0" />
            <span className="text-blue-500 font-bold">Stack</span> <ChevronRight className="w-3 h-3 lg:w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[var(--db-text-main)] truncate">Operations</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Game Mode Rotate Button */}
          <button 
            onClick={() => {
              const nextVal = !isGameRotated;
              setIsGameRotated(nextVal);
              localStorage.setItem('dsa_game_mode', nextVal ? 'true' : 'false');
            }}
            className="px-2.5 py-1.5 lg:px-3.5 lg:py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-[10px] lg:text-xs font-black shadow flex items-center gap-1 lg:gap-1.5 cursor-pointer"
          >
            <span>🎮 Game Mode</span>
          </button>
          {/* Theme Toggle Button */}
          <ThemeToggleButton />
        </div>
      </header>

      {/* MAIN CONTENT - responsive layouts */}
      <main className={`flex-1 p-4 lg:p-5 gap-5 flex max-w-[1920px] mx-auto w-full ${
        isGameRotated 
          ? 'flex-row h-[calc(100vw-64px)] overflow-hidden' 
          : 'flex-col lg:flex-row h-auto lg:h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden'
      }`}>
        
        {/* ==========================================
            LEFT PANEL: CONTROLS (25%)
        =========================================== */}
        <div className={`bg-[var(--db-card-bg)]/70 backdrop-blur-xl border border-[var(--db-card-border)] rounded-[24px] shadow-lg p-6 flex flex-col justify-between shrink-0 ${
          isGameRotated 
            ? 'w-1/4 min-w-[260px] h-full gap-2 p-4' 
            : 'w-full lg:w-1/4 lg:min-w-[300px] h-auto lg:h-full gap-6 lg:gap-0'
        }`}>
          
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-[var(--db-text-main)] flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-500" /> Try With My Value
              </h2>
              <p className="text-[var(--db-text-muted)] text-sm mt-1">Experiment with your own values and watch Stack operations live.</p>
            </div>

            {/* Input Card */}
            <div className="bg-[var(--db-card-bg-elevated)] p-4 rounded-2xl border border-[var(--db-card-border)] mb-6 shadow-inner">
              <input 
                ref={inputRef}
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Auto-value or type..."
                className="w-full text-center text-2xl font-bold bg-[var(--db-card-bg)] border-2 border-[var(--db-card-border)] rounded-xl py-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-[var(--db-text-main)] placeholder-[var(--db-text-muted)]"
              />
              <div className="flex justify-center gap-2 mt-4">
                {[10, 20, 50, 100].map(val => (
                  <button 
                    key={val} 
                    onClick={() => { setInputValue(val.toString()); inputRef.current?.focus(); }}
                    className="px-3 py-1 bg-[var(--db-card-bg)] border border-[var(--db-card-border)] rounded-lg text-sm font-bold text-[var(--db-text-secondary)] hover:border-blue-400 hover:text-blue-600 transition shadow-sm"
                  >
                    [{val}]
                  </button>
                ))}
              </div>
              <button 
                onClick={handlePush}
                disabled={isAnimating}
                className="w-full mt-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Push {inputValue ? `(${inputValue})` : '(Auto)'} 
                <span className="text-xs bg-blue-400 text-white px-2 py-1 rounded-md ml-2 flex items-center">↵ Enter</span>
              </button>
            </div>

            {/* Operation Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={handlePop} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-[#EF4444] border border-red-500/20 font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                <ArrowUpFromLine className="w-5 h-5" /> Pop
              </button>
              <button onClick={handlePeek} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                <Eye className="w-5 h-5" /> Peek
              </button>
              <button disabled className="flex items-center justify-center gap-2 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] text-[var(--db-text-muted)] font-bold py-3 rounded-xl opacity-70">
                IsEmpty
              </button>
              <button disabled className="flex items-center justify-center gap-2 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] text-[var(--db-text-muted)] font-bold py-3 rounded-xl opacity-70">
                IsFull
              </button>
              <button onClick={handleClear} disabled={isAnimating} className="col-span-2 flex items-center justify-center gap-2 bg-[var(--db-card-bg-elevated)] hover:bg-[var(--db-btn-secondary-hover)] border border-[var(--db-card-border)] text-[var(--db-text-secondary)] font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                <Trash2 className="w-5 h-5" /> Clear
              </button>
            </div>

            {/* Debugger Actions */}
            <div className="border-t pt-4 pb-2 space-y-3 border-[var(--db-card-border)]">
              <label className="block text-[10px] uppercase tracking-widest text-blue-500 font-bold">Debugger Controller</label>
              
              {/* Operations Steps Display */}
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                {operationsQueue.map((op, idx) => (
                  <span 
                    key={idx} 
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap border transition-all ${
                      currentOpIndex === idx 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-105' 
                        : idx < currentOpIndex
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-[var(--db-card-bg-elevated)] text-[var(--db-text-muted)] border-[var(--db-card-border)]'
                    }`}
                  >
                    {op.type === 'push' ? `Push(${op.value})` : op.type === 'pop' ? 'Pop()' : 'Peek()'}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-xl border border-[var(--db-card-border)] gap-1 bg-[var(--db-card-bg-elevated)]">
                <button onClick={handleReset} className="p-2 hover:bg-blue-500/10 rounded-lg transition text-slate-400 hover:text-blue-500" title="Reset Simulation">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={handlePrev} className="p-2 hover:bg-blue-500/10 rounded-lg transition text-slate-400 hover:text-blue-500" title="Previous Step">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button 
                  onClick={handlePlayPause} 
                  className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition shadow-lg shadow-blue-500/20" 
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button onClick={handleNext} className="p-2 hover:bg-blue-500/10 rounded-lg transition text-slate-400 hover:text-blue-500" title="Next Step">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Info: Speed & History */}
          <div>
            <div className="flex justify-between items-center bg-[var(--db-card-bg-elevated)] p-1 rounded-xl mb-4 border border-[var(--db-card-border)]">
              {[0.5, 1, 2].map(s => (
                <button 
                  key={s} 
                  onClick={() => setSpeed(s)}
                  className={`flex-1 py-1 text-sm font-bold rounded-lg transition-all ${speed === s ? 'bg-[var(--db-card-bg)] shadow text-blue-500' : 'text-[var(--db-text-muted)] hover:text-[var(--db-text-secondary)]'}`}
                >
                  {s}×
                </button>
              ))}
            </div>
            
            <div className="bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-xl p-4 h-32 overflow-hidden flex flex-col">
              <h4 className="text-xs font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-2">Recent History</h4>
              <div className="flex-1 flex flex-col gap-1">
                <AnimatePresence>
                  {history.map((h, i) => (
                    <motion.div 
                      key={i + h} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: i === 0 ? 1 : 0.6, x: 0 }} 
                      className={`text-sm font-mono ${i === 0 ? 'text-[var(--db-text-main)] font-bold' : 'text-[var(--db-text-muted)]'}`}
                    >
                      &gt; {h}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>


        {/* ==========================================
            CENTER PANEL: VISUALIZATION (40%)
        =========================================== */}
        <div className={`bg-[var(--db-card-bg)]/70 backdrop-blur-xl border border-[var(--db-card-border)] rounded-[24px] shadow-lg flex flex-col relative overflow-hidden shrink-0 ${
          isGameRotated 
            ? 'w-[40%] h-full' 
            : 'w-full lg:w-[40%] h-[580px] lg:h-full'
        }`}>
          
          {/* Header Stats */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
            <div className="bg-[var(--db-card-bg-elevated)]/80 backdrop-blur border border-[var(--db-card-border)] px-4 py-2 rounded-xl shadow-sm flex items-center gap-2">
              <span className="font-bold text-[var(--db-text-main)]">Elements:</span> 
              <span className="font-mono text-lg font-black text-blue-500">{stack.length} / {MAX_CAPACITY}</span>
            </div>
            <div className="flex gap-2">
              {['Learn', 'Practice', 'Challenge'].map(m => (
                <button 
                  key={m} onClick={() => setMode(m)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${mode === m ? 'bg-[var(--db-btn-secondary-bg)] text-[var(--db-text-main)] border border-[var(--db-card-border)]' : 'bg-[var(--db-card-bg-elevated)] text-[var(--db-text-muted)] hover:bg-[var(--db-btn-secondary-hover)]'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Underflow / Overflow Alerts */}
          <AnimatePresence>
            {overflow && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/30 text-red-400 font-bold px-6 py-2 rounded-full shadow-lg z-50 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Stack Overflow!
              </motion.div>
            )}
            {underflow && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold px-6 py-2 rounded-full shadow-lg z-50 flex items-center gap-2">
                <Info className="w-5 h-5" /> Stack Underflow!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero Stack Container */}
          <div className="flex-1 flex flex-col items-center justify-end pb-6 pt-16">
                    {/* The Stack structure */}
            <motion.div 
              animate={underflow ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`relative w-64 border-b-8 border-l-8 border-r-8 rounded-b-2xl flex flex-col-reverse justify-start p-2 gap-2 bg-[var(--db-card-bg-elevated)] shadow-inner transition-colors duration-300
                ${overflow ? 'border-red-500/50 bg-red-500/10' : underflow ? 'border-orange-500/50 bg-orange-500/10' : 'border-[var(--db-card-border)]'}
                ${isGameRotated ? 'h-[180px]' : 'h-[350px]'}`
              }
            >
              {/* Empty placehoder slots */}
              <div className="absolute inset-0 flex flex-col justify-end p-2 gap-2 z-0 pointer-events-none">
                {Array.from({ length: MAX_CAPACITY }).map((_, i) => (
                  <div key={`empty-${i}`} className={`w-full border-2 border-dashed border-[var(--db-card-border)] rounded-xl ${isGameRotated ? 'h-6' : 'h-12'}`} />
                ))}
              </div>
 
              <motion.div 
                animate={{ y: `calc(-${(stack.length * ((isGameRotated ? 24 : 48) + 8))}px)` }} // 24px/48px height + 8px gap
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="absolute -left-28 bottom-4 flex items-center gap-2 text-[#21F1A8] font-black tracking-widest z-20"
              >
                TOP <ArrowRightToLine className="w-6 h-6" />
              </motion.div>
 
              {/* Stack Elements */}
              <div className="relative z-10 flex flex-col-reverse justify-start gap-2 w-full h-full">
                <AnimatePresence initial={false}>
                  {stack.map((item, index) => {
                    const isTop = index === stack.length - 1;
                    const isPeeking = peekIndex === index;
 
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -400, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: isPeeking ? 1.05 : 1,
                          boxShadow: isPeeking ? '0 0 20px rgba(33, 241, 168, 0.8)' : '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        exit={{ opacity: 0, y: -50, scale: 1.1, rotateZ: 5, backgroundColor: '#EF4444' }}
                        transition={{ 
                          type: "spring",
                          stiffness: 120,
                          damping: 14,
                          mass: 0.8,
                          layout: { type: "spring", stiffness: 200, damping: 20 }
                        }}
                        className={`w-full rounded-xl flex items-center justify-center font-black relative shadow-lg shrink-0 transition-all duration-300
                          ${isGameRotated ? 'h-6 text-sm' : 'h-12 text-xl'}
                          ${isTop ? 'bg-[#21F1A8] text-[#171717] ring-4 ring-[#21F1A8]/50 ring-offset-2' : 'bg-[#171717] text-[#21F1A8] border border-[#21F1A8]/30'}`}
                      >
                        {item.value}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

            </motion.div>
            
            <div className="mt-4 mb-4 text-[var(--db-text-muted)] font-bold tracking-widest text-xl">BOTTOM</div>

            {/* Explanation Section Moved Here */}
            <div className="w-full max-w-sm bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700 rounded-[20px] shadow-xl p-5 text-white flex flex-col relative overflow-hidden shrink-0">
              <h3 className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-2 relative z-10 uppercase tracking-widest">
                <Info className="w-4 h-4" /> Step-by-Step Explanation
              </h3>
              <div className="flex-1 flex items-center relative z-10 min-h-[50px]">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={activeLine || 'default'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[15px] text-slate-200 leading-relaxed font-medium"
                  >
                    {activeLine === 'push_check' && "Step 1: First, we check if the stack is completely full. We can't add a new number if there is no space left!"}
                    {activeLine === 'push_overflow' && "Oops! The stack is completely full. We cannot add this number."}
                    {activeLine === 'push_execute' && "Step 2: There is space! We move the 'TOP' arrow up by one and place the new number in that slot."}
                    {activeLine === 'pop_check' && "Step 1: First, we check if the stack is empty. We can't remove anything from an empty stack!"}
                    {activeLine === 'pop_underflow' && "Oops! The stack is empty. There is nothing to remove."}
                    {activeLine === 'pop_execute' && "Step 2: We take the top number out, and then move the 'TOP' arrow down by one."}
                    {activeLine === 'peek' && "We are just looking at the top number without actually removing it."}
                    {!activeLine && "Click 'Push' or 'Pop' on the left to see how the stack works step-by-step!"}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>


        {/* ==========================================
            RIGHT PANEL: CODE (35%)
        =========================================== */}
        <div className={isGameRotated ? "flex flex-col gap-5 shrink-0 w-[35%] h-full" : "flex flex-col gap-5 shrink-0 w-full lg:w-[35%] h-auto lg:h-full"}>
          
          {/* C Code Section */}
          <div className="flex-1 bg-[var(--db-card-bg)]/70 backdrop-blur-xl border border-[var(--db-card-border)] rounded-[24px] shadow-lg p-6 flex flex-col">
            <h3 className="text-lg font-bold text-[var(--db-text-main)] mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-500" /> Live C Implementation
            </h3>
            {renderCode()}
          </div>

        </div>

      </main>
    </div>
  );
}

// Ensure icons used in render are imported
import { Code2, Terminal } from 'lucide-react';
