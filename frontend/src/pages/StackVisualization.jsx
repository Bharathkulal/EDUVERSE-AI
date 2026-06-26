import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRightToLine, ArrowUpFromLine, Eye, 
  Trash2, XCircle, ChevronRight, Zap, Info, ShieldAlert,
  Play, RotateCcw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import '../pages/DashboardTheme.css';

const MAX_CAPACITY = 6;

export default function StackVisualization() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
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

  // Focus ref for input
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addHistory = (action) => {
    setHistory(prev => [action, ...prev].slice(0, 4));
  };

  const getDuration = (base) => base / speed;

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
      <pre className="font-mono text-sm leading-relaxed text-slate-800 bg-white/50 p-6 rounded-xl border border-slate-200 overflow-hidden shadow-inner h-full">
        <code>
          {lines.map((line) => (
            <div 
              key={line.id} 
              className={`transition-colors duration-300 px-2 rounded ${activeLine === line.id ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
            >
              {line.text}
            </div>
          ))}
        </code>
      </pre>
    );
  };

  return (
    <div className={`h-screen w-full overflow-hidden flex flex-col font-sans db-page-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`} style={{ backgroundColor: 'var(--db-bg)', color: 'var(--db-text-main)' }}>
      
      {/* HEADER BREADCRUMB - 64px */}
      <header className="h-16 shrink-0 bg-[var(--db-card-bg)] border-b border-[var(--db-header-border)] flex items-center justify-between px-8 shadow-sm relative z-10">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-[var(--db-btn-secondary-hover)] rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-[var(--db-text-main)]" />
          </button>
          <div className="flex items-center text-sm font-medium text-[var(--db-text-muted)] gap-2">
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span> <ChevronRight className="w-4 h-4" />
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/subjects')}>Subjects</span> <ChevronRight className="w-4 h-4" />
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/dsa')}>DSA</span> <ChevronRight className="w-4 h-4" />
            <span className="text-blue-500 font-bold">Stack</span> <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-[var(--db-text-main)]">Operations</span>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="db-theme-toggle-switch" 
          style={{
            background: 'var(--db-input-bg)',
            border: '1.5px solid var(--db-input-border)',
            cursor: 'pointer',
            padding: '2px',
            height: '32px',
            width: '58px',
            borderRadius: '9999px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 300ms ease-in-out',
            boxShadow: 'var(--db-shadow-sm)'
          }}
          aria-label="Toggle Bright/Dark Theme"
          title={isDarkMode ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
        >
          <span
            style={{
              transform: isDarkMode ? 'translateX(26px)' : 'translateX(2px)',
              width: '24px',
              height: '24px',
              background: 'var(--db-text-accent)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), background-color 300ms ease-in-out'
            }}
          >
            {isDarkMode ? (
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </span>
        </button>
      </header>

      {/* MAIN CONTENT - 100vh - 64px */}
      <main className="flex-1 p-5 gap-5 flex h-[calc(100vh-64px)] max-w-[1920px] mx-auto w-full">
        
        {/* ==========================================
            LEFT PANEL: CONTROLS (25%)
        =========================================== */}
        <div className="w-1/4 min-w-[300px] h-full bg-[var(--db-card-bg)]/70 backdrop-blur-xl border border-[var(--db-card-border)] rounded-[24px] shadow-lg p-6 flex flex-col justify-between">
          
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
        <div className="w-[40%] h-full bg-[var(--db-card-bg)]/70 backdrop-blur-xl border border-[var(--db-card-border)] rounded-[24px] shadow-lg flex flex-col relative overflow-hidden">
          
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
              className={`relative w-64 h-[350px] border-b-8 border-l-8 border-r-8 rounded-b-2xl flex flex-col-reverse justify-start p-2 gap-2 bg-[var(--db-card-bg-elevated)] shadow-inner transition-colors duration-300
                ${overflow ? 'border-red-500/50 bg-red-500/10' : underflow ? 'border-orange-500/50 bg-orange-500/10' : 'border-[var(--db-card-border)]'}`
              }
            >
              {/* Empty placehoder slots */}
              <div className="absolute inset-0 flex flex-col justify-end p-2 gap-2 z-0 pointer-events-none">
                {Array.from({ length: MAX_CAPACITY }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-full h-12 border-2 border-dashed border-[var(--db-card-border)] rounded-xl" />
                ))}
              </div>

              {/* TOP Pointer */}
              <motion.div 
                animate={{ y: `calc(-${(stack.length * (48 + 8))}px)` }} // 48px height + 8px gap
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="absolute -left-28 bottom-4 flex items-center gap-2 text-blue-500 font-black tracking-widest z-20"
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
                        initial={{ opacity: 0, y: -200, scale: 0.5 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: isPeeking ? 1.05 : 1,
                          boxShadow: isPeeking ? '0 0 20px rgba(96, 165, 250, 0.8)' : '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        exit={{ opacity: 0, y: -50, scale: 1.1, rotateZ: 5, backgroundColor: '#EF4444' }}
                        transition={{ 
                          duration: getDuration(0.5), 
                          layout: { type: "spring", stiffness: 200, damping: 20 }
                        }}
                        className={`w-full h-12 rounded-xl flex items-center justify-center font-black text-xl text-white relative shadow-lg shrink-0
                          ${isTop ? 'bg-gradient-to-r from-[#2563EB] to-[#60A5FA] ring-4 ring-blue-300 ring-offset-2' : 'bg-slate-500'}`}
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
        <div className="w-[35%] h-full flex flex-col gap-5">
          
          {/* C Code Section */}
          <div className="flex-1 bg-white/70 backdrop-blur-xl border border-[#E2E8F0] rounded-[24px] shadow-lg p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
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
