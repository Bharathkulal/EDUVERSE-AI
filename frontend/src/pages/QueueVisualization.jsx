import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRightToLine, ArrowUpFromLine, Eye, 
  Trash2, ChevronRight, Zap, Info, ShieldAlert
} from 'lucide-react';
import { Code2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import '../pages/DashboardTheme.css';

const MAX_CAPACITY = 6;

export default function QueueVisualization() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // State
  // The queue is an array of fixed size MAX_CAPACITY. We fill it from left to right.
  // We'll store objects: { id, value } or null.
  const [queue, setQueue] = useState(Array(MAX_CAPACITY).fill(null));
  const [front, setFront] = useState(-1);
  const [rear, setRear] = useState(-1);

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
  const handleEnqueue = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setActiveLine('enq_check');
    
    await new Promise(r => setTimeout(r, getDuration(400)));

    if (rear === MAX_CAPACITY - 1) {
      setActiveLine('enq_overflow');
      setOverflow(true);
      addHistory(`Enqueue() - Failed (Overflow)`);
      setTimeout(() => {
        setOverflow(false);
        setIsAnimating(false);
        setActiveLine(null);
      }, getDuration(1000));
      return;
    }

    setActiveLine('enq_execute');
    let newValue = parseInt(inputValue, 10);
    if (isNaN(newValue)) {
      newValue = Math.floor(Math.random() * 100) + 1; // Auto generate
    }
    const newId = Date.now();
    
    // Simulate animation delay
    setTimeout(() => {
      let newFront = front;
      if (front === -1) newFront = 0;
      
      const newRear = rear + 1;
      setFront(newFront);
      setRear(newRear);
      
      setQueue(prev => {
        const next = [...prev];
        next[newRear] = { id: newId, value: newValue };
        return next;
      });

      addHistory(`Enqueue(${newValue})`);
      setInputValue('');
      inputRef.current?.focus();
      setIsAnimating(false);
      setActiveLine(null);
    }, getDuration(800));
  };

  const handleDequeue = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setActiveLine('deq_check');
    
    await new Promise(r => setTimeout(r, getDuration(400)));

    if (front === -1 || front > rear) {
      setActiveLine('deq_underflow');
      setUnderflow(true);
      addHistory(`Dequeue() - Failed (Underflow)`);
      setTimeout(() => {
        setUnderflow(false);
        setIsAnimating(false);
        setActiveLine(null);
      }, getDuration(1000));
      return;
    }

    setActiveLine('deq_execute');
    const dequeuedValue = queue[front].value;
    
    setTimeout(() => {
      setQueue(prev => {
        const next = [...prev];
        next[front] = null;
        return next;
      });

      const newFront = front + 1;
      setFront(newFront);
      
      // If queue is empty after dequeue, reset pointers (optional standard behavior)
      if (newFront > rear) {
        setFront(-1);
        setRear(-1);
      }

      addHistory(`Dequeue() -> ${dequeuedValue}`);
      setIsAnimating(false);
      setActiveLine(null);
    }, getDuration(800));
  };

  const handlePeek = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setActiveLine('peek');
    
    if (front !== -1 && front <= rear) {
      setPeekIndex(front);
      addHistory(`Peek() -> ${queue[front].value}`);
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
    setQueue(Array(MAX_CAPACITY).fill(null));
    setFront(-1);
    setRear(-1);
    addHistory('Clear()');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEnqueue();
    }
  };

  // UI Components
  const renderCode = () => {
    const lines = [
      { id: 'def', text: '#define MAX 6\n\nint queue[MAX];\nint front = -1, rear = -1;\n' },
      { id: 'enq_def', text: 'void enqueue(int value) {' },
      { id: 'enq_check', text: '    if (rear == MAX - 1) {' },
      { id: 'enq_overflow', text: '        printf("Queue Overflow");\n        return;\n    }' },
      { id: 'enq_execute', text: '\n    if (front == -1) front = 0;\n    rear++;\n    queue[rear] = value;\n}\n' },
      { id: 'deq_def', text: 'int dequeue() {' },
      { id: 'deq_check', text: '    if (front == -1 || front > rear) {' },
      { id: 'deq_underflow', text: '        printf("Queue Underflow");\n        return -1;\n    }' },
      { id: 'deq_execute', text: '\n    int val = queue[front++];\n    if (front > rear) {\n        front = rear = -1;\n    }\n    return val;\n}\n' },
      { id: 'peek', text: 'int peek() {\n    return queue[front];\n}' }
    ];

    return (
      <pre className="font-mono text-[13px] leading-relaxed text-[var(--db-text-main)] bg-[var(--db-card-bg-elevated)]/50 p-6 rounded-xl border border-[var(--db-card-border)] overflow-hidden shadow-inner h-full overflow-y-auto">
        <code>
          {lines.map((line) => (
            <div 
              key={line.id} 
              className={`transition-colors duration-300 px-2 py-0.5 rounded ${activeLine === line.id ? 'bg-blue-500/20 text-blue-300 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
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
            <span className="text-blue-500 font-bold">Queue</span> <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-[var(--db-text-main)]">Operations</span>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggleButton />
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
              <p className="text-[var(--db-text-muted)] text-sm mt-1">Experiment with your own values and watch Queue operations live.</p>
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
                onClick={handleEnqueue}
                disabled={isAnimating}
                className="w-full mt-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Enqueue {inputValue ? `(${inputValue})` : '(Auto)'} 
                <span className="text-xs bg-blue-400 text-white px-2 py-1 rounded-md ml-2 flex items-center">↵ Enter</span>
              </button>
            </div>

            {/* Operation Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={handleDequeue} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-[#EF4444] border border-red-500/20 font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                <ArrowRightToLine className="w-5 h-5 rotate-180" /> Dequeue
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
              <span className="font-mono text-lg font-black text-blue-600">
                {front === -1 ? 0 : rear - front + 1} / {MAX_CAPACITY}
              </span>
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
                <ShieldAlert className="w-5 h-5" /> Queue Overflow!
              </motion.div>
            )}
            {underflow && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold px-6 py-2 rounded-full shadow-lg z-50 flex items-center gap-2">
                <Info className="w-5 h-5" /> Queue Underflow!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero Queue Container - HORIZONTAL */}
          <div className="flex-1 flex flex-col items-center justify-center px-12">
            
            <div className="flex items-center w-full justify-between mb-4">
              <div className="text-slate-400 font-bold tracking-widest text-xl">FRONT</div>
              <div className="text-slate-400 font-bold tracking-widest text-xl">REAR</div>
            </div>

            {/* The Queue structure */}
            <motion.div 
              animate={underflow ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`relative w-full h-32 border-t-8 border-b-8 rounded-xl flex items-center p-2 gap-2 bg-[#F8FAFC] shadow-inner transition-colors duration-300
                ${overflow ? 'border-red-400 bg-red-50' : underflow ? 'border-orange-400 bg-orange-50' : 'border-slate-300'}`
              }
            >
              {/* Empty placehoder slots */}
              <div className="absolute inset-0 flex items-center p-2 gap-2 z-0 pointer-events-none">
                {queue.map((_, i) => (
                  <div key={`empty-${i}`} className="flex-1 h-20 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-between py-1">
                    <span className="text-[10px] text-slate-300 font-bold">{i}</span>
                  </div>
                ))}
              </div>

              {/* Stack Elements - Rendered based on the full array */}
              <div className="relative z-10 flex items-center gap-2 w-full h-full">
                {queue.map((item, index) => {
                  
                  const isFront = index === front;
                  const isRear = index === rear;
                  const isPeeking = peekIndex === index;
                  const hasItem = item !== null;

                  return (
                    <div key={`container-${index}`} className="flex-1 h-20 relative flex items-center justify-center">
                      <AnimatePresence>
                        {hasItem && (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 50, scale: 0.8 }}
                            animate={{ 
                              opacity: 1, 
                              x: 0, 
                              scale: isPeeking ? 1.1 : 1,
                              boxShadow: isPeeking ? '0 0 20px rgba(96, 165, 250, 0.8)' : '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                            exit={{ opacity: 0, x: -50, scale: 1.1, backgroundColor: '#EF4444' }}
                            transition={{ 
                              duration: getDuration(0.5), 
                              type: "spring", stiffness: 200, damping: 20 
                            }}
                            className={`w-full h-full rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-lg shrink-0 z-10
                              ${isFront ? 'bg-gradient-to-br from-[#2563EB] to-[#60A5FA] ring-4 ring-blue-300 ring-offset-2' : 'bg-slate-500'}`}
                          >
                            {item.value}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* FRONT Pointer */}
                      <AnimatePresence>
                        {isFront && hasItem && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-blue-600 font-black text-xs z-20"
                          >
                            <ArrowUpFromLine className="w-4 h-4 mb-1" /> FRONT
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* REAR Pointer */}
                      <AnimatePresence>
                        {isRear && hasItem && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-emerald-600 font-black text-xs z-20"
                          >
                            REAR <ArrowRightToLine className="w-4 h-4 mt-1 rotate-90" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  );
                })}
              </div>

            </motion.div>

            {/* Explanation Section Moved Here */}
            <div className="mt-12 w-full max-w-sm bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700 rounded-[20px] shadow-xl p-5 text-white flex flex-col relative overflow-hidden shrink-0">
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
                    {activeLine === 'enq_check' && "Step 1: First, we check if the Queue is completely full by seeing if the REAR arrow has reached the end."}
                    {activeLine === 'enq_overflow' && "Oops! The Queue is completely full. We cannot add this person."}
                    {activeLine === 'enq_execute' && "Step 2: There is space! We move the 'REAR' arrow to the right and place the new number there."}
                    {activeLine === 'deq_check' && "Step 1: First, we check if the Queue is empty. We can't remove anything from an empty queue!"}
                    {activeLine === 'deq_underflow' && "Oops! The Queue is empty. There is nothing to dequeue."}
                    {activeLine === 'deq_execute' && "Step 2: We take out the number at the 'FRONT', and then move the 'FRONT' arrow one step to the right."}
                    {activeLine === 'peek' && "We are just looking at the FRONT number without actually removing it."}
                    {!activeLine && "Click 'Enqueue' or 'Dequeue' on the left to see how the Queue works step-by-step!"}
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
