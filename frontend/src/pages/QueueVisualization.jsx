import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRightToLine, ArrowUpFromLine, Eye, 
  Trash2, ChevronRight, Zap, Info, ShieldAlert,
  Play, Pause, RotateCcw, SkipBack, SkipForward,
  Timer, Heart, Trophy, AlertCircle, Sparkles, Code2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import '../pages/DashboardTheme.css';

const MAX_CAPACITY = 6;

// guided practice tasks definition
const PRACTICE_TASKS = [
  { step: 1, type: 'enqueue', value: 15, instruction: 'Enqueue 15 into the queue.', hint: 'Type 15 in the input box and click Enqueue (or press Enter).' },
  { step: 2, type: 'enqueue', value: 35, instruction: 'Enqueue 35 into the queue.', hint: 'Enter 35 and click Enqueue.' },
  { step: 3, type: 'dequeue', instruction: 'Dequeue the front element from the queue.', hint: 'Click the Dequeue button to remove the element at the FRONT pointer.' },
  { step: 4, type: 'peek', instruction: 'Peek the front element of the queue.', hint: 'Click the Peek button to view the FRONT element without removing it.' },
  { step: 5, type: 'enqueue', value: 45, instruction: 'Enqueue 45 into the queue.', hint: 'Enter 45 and click Enqueue.' },
  { step: 6, type: 'enqueue', value: 75, instruction: 'Enqueue 75 into the queue.', hint: 'Enter 75 and click Enqueue.' },
  { step: 7, type: 'dequeue', instruction: 'Dequeue another element.', hint: 'Click Dequeue to remove the next element.' },
  { step: 8, type: 'peek', instruction: 'Peek the front element again.', hint: 'Click Peek to check the new FRONT.' },
  { step: 9, type: 'enqueue', value: 99, instruction: 'Enqueue 99 into the queue.', hint: 'Enter 99 and click Enqueue.' },
  { step: 10, type: 'clear', instruction: 'Clear the entire queue.', hint: 'Click the Clear button to empty the queue and reset pointers.' }
];

// challenge level missions
const CHALLENGE_MISSIONS = [
  {
    level: 1,
    description: 'Enqueue 12, then Enqueue 24. What is the value at FRONT?',
    actions: [
      { type: 'enqueue', value: 12 },
      { type: 'enqueue', value: 24 }
    ],
    options: ['12', '24', 'None', '-1'],
    correct: '12'
  },
  {
    level: 2,
    description: 'Perform Enqueue 30, Enqueue 40, and Dequeue. What is the value at REAR?',
    actions: [
      { type: 'enqueue', value: 30 },
      { type: 'enqueue', value: 40 },
      { type: 'dequeue' }
    ],
    options: ['30', '40', '10', 'None'],
    correct: '40'
  },
  {
    level: 3,
    description: 'Enqueue 50, Enqueue 60, then Enqueue 70. Is the queue empty?',
    actions: [
      { type: 'enqueue', value: 50 },
      { type: 'enqueue', value: 60 },
      { type: 'enqueue', value: 70 }
    ],
    options: ['Yes', 'No', 'Overflow', 'Underflow'],
    correct: 'No'
  },
  {
    level: 4,
    description: 'Enqueue 80, Enqueue 90, Dequeue, and Dequeue. What is the size of the queue?',
    actions: [
      { type: 'enqueue', value: 80 },
      { type: 'enqueue', value: 90 },
      { type: 'dequeue' },
      { type: 'dequeue' }
    ],
    options: ['0', '1', '2', '3'],
    correct: '0'
  },
  {
    level: 5,
    description: 'Complete the operations: Enqueue 99, Peek. What is the peeked value?',
    actions: [
      { type: 'enqueue', value: 99 },
      { type: 'peek' }
    ],
    options: ['99', '0', 'None', 'Error'],
    correct: '99'
  }
];

export default function QueueVisualization() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isGameRotated, setIsGameRotated] = useState(localStorage.getItem('dsa_game_mode') === 'true');
  
  // Basic Queue Pointers
  const [queue, setQueue] = useState(Array(MAX_CAPACITY).fill(null));
  const [front, setFront] = useState(-1);
  const [rear, setRear] = useState(-1);

  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState([]);
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState('Learn');
  const [activeLine, setActiveLine] = useState(null);
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [underflow, setUnderflow] = useState(false);
  const [peekIndex, setPeekIndex] = useState(null);

  // Debugger Controller State
  const [operationsQueue, setOperationsQueue] = useState([]);
  const [currentOpIndex, setCurrentOpIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);

  // Practice Mode State
  const [practiceStep, setPracticeStep] = useState(0); 
  const [practiceXp, setPracticeXp] = useState(0);
  const [practiceAccuracy, setPracticeAccuracy] = useState(100);
  const [practiceAttempts, setPracticeAttempts] = useState(0);
  const [practiceCorrectCount, setPracticeCorrectCount] = useState(0);
  const [practiceFeedback, setPracticeFeedback] = useState(null);
  const [showHintIndex, setShowHintIndex] = useState(0);
  const [practiceFinished, setPracticeFinished] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [lastExplanation, setLastExplanation] = useState(null);

  // Challenge Mode State
  const [challengeStep, setChallengeStep] = useState(1);
  const [challengeXp, setChallengeXp] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(25);
  const [challengeFinished, setChallengeFinished] = useState(false);
  const [challengeFailed, setChallengeFailed] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSimulatingChallenge, setIsSimulatingChallenge] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addHistory = (action) => {
    setHistory(prev => [action, ...prev].slice(0, 4));
  };

  const getDuration = (base) => base / speed;

  // Challenge Mode Timer Loop
  useEffect(() => {
    let timer;
    if (mode === 'Challenge' && !challengeFinished && !challengeFailed && !isSimulatingChallenge) {
      if (timeLeft <= 0) {
        handleChallengeWrong();
      } else {
        timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      }
    }
    return () => clearTimeout(timer);
  }, [timeLeft, mode, challengeFinished, challengeFailed, isSimulatingChallenge]);

  // Mode Switch Reset
  useEffect(() => {
    handleReset();
    if (mode === 'Practice') {
      setPracticeStep(0);
      setPracticeFinished(false);
      setPracticeAttempts(0);
      setPracticeCorrectCount(0);
      setPracticeAccuracy(100);
      setPracticeXp(0);
      setPracticeFeedback(null);
      setShowHintIndex(0);
      setUnlockedBadges([]);
      setLastExplanation(null);
    } else if (mode === 'Challenge') {
      setChallengeStep(1);
      setChallengeFinished(false);
      setChallengeFailed(false);
      setLives(3);
      setTimeLeft(25);
      setChallengeXp(0);
      setSelectedOption(null);
      setIsSimulatingChallenge(false);
      setUnlockedAchievements([]);
    }
  }, [mode]);

  // Debugger Controller loop
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setTimeout(() => {
        if (currentOpIndex < operationsQueue.length - 1) {
          handleNext();
        } else {
          setIsPlaying(false);
        }
      }, 1500 / speed);
    } else {
      clearTimeout(playTimerRef.current);
    }
    return () => clearTimeout(playTimerRef.current);
  }, [isPlaying, currentOpIndex, operationsQueue]);

  // Direct Operations (For Simulator)
  const handleEnqueueDirect = (val) => {
    if (rear === MAX_CAPACITY - 1) return false;
    let newFront = front;
    if (front === -1) newFront = 0;
    const newRear = rear + 1;
    setFront(newFront);
    setRear(newRear);
    setQueue(prev => {
      const next = [...prev];
      next[newRear] = { id: Date.now() + Math.random(), value: val };
      return next;
    });
    return true;
  };

  const handleDequeueDirect = () => {
    if (front === -1 || front > rear) return false;
    setQueue(prev => {
      const next = [...prev];
      next[front] = null;
      return next;
    });
    const newFront = front + 1;
    setFront(newFront);
    if (newFront > rear) {
      setFront(-1);
      setRear(-1);
    }
    return true;
  };

  const handlePeekDirect = () => {
    if (front !== -1 && front <= rear) {
      setPeekIndex(front);
      setTimeout(() => setPeekIndex(null), 1000);
      return true;
    }
    return false;
  };

  const handleClearDirect = () => {
    setQueue(Array(MAX_CAPACITY).fill(null));
    setFront(-1);
    setRear(-1);
  };

  // Re-run debugger operations up to selected index
  const runOperationsUpToIndex = (index) => {
    handleClearDirect();
    let tempQueue = Array(MAX_CAPACITY).fill(null);
    let tempFront = -1;
    let tempRear = -1;

    for (let i = 0; i <= index; i++) {
      const op = operationsQueue[i];
      if (op.type === 'enqueue') {
        if (tempRear < MAX_CAPACITY - 1) {
          if (tempFront === -1) tempFront = 0;
          tempRear++;
          tempQueue[tempRear] = { id: i, value: op.value };
        }
      } else if (op.type === 'dequeue') {
        if (tempFront !== -1 && tempFront <= tempRear) {
          tempQueue[tempFront] = null;
          tempFront++;
          if (tempFront > tempRear) {
            tempFront = -1;
            tempRear = -1;
          }
        }
      } else if (op.type === 'clear') {
        tempQueue = Array(MAX_CAPACITY).fill(null);
        tempFront = -1;
        tempRear = -1;
      }
    }
    setQueue(tempQueue);
    setFront(tempFront);
    setRear(tempRear);
  };

  // Debugger Controller Buttons
  const handleReset = () => {
    setIsPlaying(false);
    setQueue(Array(MAX_CAPACITY).fill(null));
    setFront(-1);
    setRear(-1);
    setCurrentOpIndex(-1);
    setHistory([]);
  };

  const handlePrev = () => {
    if (currentOpIndex > 0) {
      const newIndex = currentOpIndex - 1;
      setCurrentOpIndex(newIndex);
      runOperationsUpToIndex(newIndex);
    } else if (currentOpIndex === 0) {
      handleReset();
    }
  };

  const handleNext = () => {
    if (currentOpIndex < operationsQueue.length - 1) {
      const nextIndex = currentOpIndex + 1;
      const op = operationsQueue[nextIndex];
      setCurrentOpIndex(nextIndex);
      
      if (op.type === 'enqueue') {
        handleEnqueueDirect(op.value);
        addHistory(`Enqueue(${op.value}) [Step]`);
      } else if (op.type === 'dequeue') {
        handleDequeueDirect();
        addHistory(`Dequeue() [Step]`);
      } else if (op.type === 'peek') {
        handlePeekDirect();
        addHistory(`Peek() [Step]`);
      } else if (op.type === 'clear') {
        handleClearDirect();
        addHistory(`Clear() [Step]`);
      }
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Standard user operations
  const handleEnqueue = async () => {
    if (isAnimating) return;
    
    let newValue = parseInt(inputValue, 10);
    if (isNaN(newValue)) {
      newValue = Math.floor(Math.random() * 100) + 1;
    }

    // Add to debugger queue
    const nextOp = { type: 'enqueue', value: newValue };
    const nextQueue = [...operationsQueue, nextOp];
    setOperationsQueue(nextQueue);
    setCurrentOpIndex(nextQueue.length - 1);

    if (mode === 'Practice') {
      validatePracticeAction('enqueue', newValue);
      return;
    }

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
    setTimeout(() => {
      handleEnqueueDirect(newValue);
      addHistory(`Enqueue(${newValue})`);
      setInputValue('');
      inputRef.current?.focus();
      setIsAnimating(false);
      setActiveLine(null);
    }, getDuration(800));
  };

  const handleDequeue = async () => {
    if (isAnimating) return;

    // Add to debugger queue
    const nextOp = { type: 'dequeue' };
    const nextQueue = [...operationsQueue, nextOp];
    setOperationsQueue(nextQueue);
    setCurrentOpIndex(nextQueue.length - 1);

    if (mode === 'Practice') {
      validatePracticeAction('dequeue');
      return;
    }

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
    const dequeuedValue = queue[front]?.value;
    setTimeout(() => {
      handleDequeueDirect();
      addHistory(`Dequeue() -> ${dequeuedValue}`);
      setIsAnimating(false);
      setActiveLine(null);
    }, getDuration(800));
  };

  const handlePeek = async () => {
    if (isAnimating) return;

    // Add to debugger queue
    const nextOp = { type: 'peek' };
    const nextQueue = [...operationsQueue, nextOp];
    setOperationsQueue(nextQueue);
    setCurrentOpIndex(nextQueue.length - 1);

    if (mode === 'Practice') {
      validatePracticeAction('peek');
      return;
    }

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
    // Add to debugger queue
    const nextOp = { type: 'clear' };
    const nextQueue = [...operationsQueue, nextOp];
    setOperationsQueue(nextQueue);
    setCurrentOpIndex(nextQueue.length - 1);

    if (mode === 'Practice') {
      validatePracticeAction('clear');
      return;
    }

    handleClearDirect();
    addHistory('Clear()');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEnqueue();
    }
  };

  // PRACTICE MODE LOGIC
  const validatePracticeAction = (actionType, val = null) => {
    const currentTask = PRACTICE_TASKS[practiceStep];
    const newAttempts = practiceAttempts + 1;
    setPracticeAttempts(newAttempts);

    if (actionType !== currentTask.type || (actionType === 'enqueue' && val !== currentTask.value)) {
      // Wrong Action
      const correctText = currentTask.type === 'enqueue' ? `Enqueue ${currentTask.value}` : currentTask.type;
      setPracticeFeedback({
        type: 'incorrect',
        msg: `Incorrect operation. Try performing "${correctText}".`,
        hint: currentTask.hint
      });
      setShowHintIndex(prev => Math.min(prev + 1, 3));
      const accuracy = Math.round((practiceCorrectCount / newAttempts) * 100);
      setPracticeAccuracy(accuracy);
    } else {
      // Correct Action
      setPracticeCorrectCount(prev => prev + 1);
      const accuracy = Math.round(((practiceCorrectCount + 1) / newAttempts) * 100);
      setPracticeAccuracy(accuracy);

      // Perform direct update
      if (actionType === 'enqueue') {
        handleEnqueueDirect(val);
        setLastExplanation({ op: `Enqueue(${val})`, text: `Value ${val} added at Rear index ${rear + 1}.`, time: 'O(1)', space: 'O(1)' });
      } else if (actionType === 'dequeue') {
        const valRemoved = queue[front]?.value;
        handleDequeueDirect();
        setLastExplanation({ op: 'Dequeue()', text: `Removed front value ${valRemoved}. Front pointer incremented.`, time: 'O(1)', space: 'O(1)' });
      } else if (actionType === 'peek') {
        handlePeekDirect();
        setLastExplanation({ op: 'Peek()', text: `Observed FRONT value ${queue[front]?.value} without modifying pointers.`, time: 'O(1)', space: 'O(1)' });
      } else if (actionType === 'clear') {
        handleClearDirect();
        setLastExplanation({ op: 'Clear()', text: 'Reset queue array and initialized FRONT/REAR to -1.', time: 'O(N)', space: 'O(1)' });
      }

      setPracticeXp(prev => prev + 15);
      setPracticeFeedback({
        type: 'correct',
        msg: `Superb! Successfully executed "${actionType === 'enqueue' ? `Enqueue(${val})` : actionType}".`,
        hint: null
      });
      setShowHintIndex(0);
      setInputValue('');

      // Unlock badges
      const newStep = practiceStep + 1;
      setPracticeStep(newStep);

      let badges = [...unlockedBadges];
      if (newStep === 1) badges.push('Queue Beginner');
      if (newStep === 5) badges.push('Enqueue Master');
      if (newStep === 10) badges.push('Perfect Queue Practice');
      setUnlockedBadges(badges);

      if (newStep >= PRACTICE_TASKS.length) {
        setPracticeFinished(true);
      }
    }
  };

  // CHALLENGE MODE LOGIC
  const startChallengeSimulation = async () => {
    if (isSimulatingChallenge) return;
    setIsSimulatingChallenge(true);
    handleReset();

    const currentMission = CHALLENGE_MISSIONS[challengeStep - 1];
    for (let op of currentMission.actions) {
      if (op.type === 'enqueue') {
        handleEnqueueDirect(op.value);
      } else if (op.type === 'dequeue') {
        handleDequeueDirect();
      } else if (op.type === 'peek') {
        handlePeekDirect();
      }
      await new Promise(r => setTimeout(r, 1200));
    }
    setIsSimulatingChallenge(false);
  };

  const handleChallengeAnswer = (answer) => {
    setSelectedOption(answer);
    const currentMission = CHALLENGE_MISSIONS[challengeStep - 1];
    
    if (answer === currentMission.correct) {
      setChallengeXp(prev => prev + 100);
      
      let achievements = [...unlockedAchievements];
      if (challengeStep === 1) achievements.push('Queue Apprentice');
      if (challengeStep === 3) achievements.push('Flow Controller');
      if (challengeStep === 5) achievements.push('Queue Master Champion');
      setUnlockedAchievements(achievements);

      setTimeout(() => {
        if (challengeStep < CHALLENGE_MISSIONS.length) {
          setChallengeStep(prev => prev + 1);
          setTimeLeft(25);
          setSelectedOption(null);
          handleReset();
        } else {
          setChallengeFinished(true);
        }
      }, 1000);
    } else {
      handleChallengeWrong();
    }
  };

  const handleChallengeWrong = () => {
    const nextLives = lives - 1;
    setLives(nextLives);
    if (nextLives <= 0) {
      setChallengeFailed(true);
    } else {
      setTimeLeft(25);
      setSelectedOption(null);
      handleReset();
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
            <span className="text-blue-500 font-bold">Queue</span> <ChevronRight className="w-3 h-3 lg:w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[var(--db-text-main)] truncate">Operations</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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

            {/* Debugger Actions */}
            <div className="border-t pt-4 pb-2 space-y-3 border-[var(--db-card-border)]">
              <label className="block text-[10px] uppercase tracking-widest text-blue-500 font-bold">Debugger Controller</label>
              
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
                    {op.type === 'enqueue' ? `Enq(${op.value})` : op.type === 'dequeue' ? 'Deq()' : op.type === 'peek' ? 'Peek()' : 'Clear()'}
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
            CENTER PANEL: VISUALIZATION (40% to 50%)
        =========================================== */}
        <div className={`bg-[var(--db-card-bg)]/70 backdrop-blur-xl border border-[var(--db-card-border)] rounded-[24px] shadow-lg flex flex-col relative overflow-hidden shrink-0 transition-all duration-300 ${
          isGameRotated 
            ? 'w-[40%] h-full' 
            : mode === 'Learn' 
              ? 'w-full lg:w-[40%] h-[580px] lg:h-full' 
              : 'w-full lg:w-[50%] h-[680px] lg:h-full'
        }`}>
          
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

          {/* LEARN MODE VIEW */}
          {mode === 'Learn' && (
            <div className="flex-1 flex flex-col items-center justify-center px-12 pt-16">
              <div className="flex items-center w-full justify-between mb-4">
                <div className="text-slate-400 font-bold tracking-widest text-xl">FRONT</div>
                <div className="text-slate-400 font-bold tracking-widest text-xl">REAR</div>
              </div>

              <motion.div 
                animate={underflow ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="relative w-full h-32 border-t-8 border-b-8 rounded-xl flex items-center p-2 gap-2 bg-[var(--db-card-bg-elevated)] shadow-inner border-[var(--db-card-border)]"
              >
                <div className="absolute inset-0 flex items-center p-2 gap-2 z-0 pointer-events-none">
                  {Array.from({ length: MAX_CAPACITY }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex-1 h-20 border-2 border-dashed border-[var(--db-card-border)] rounded-xl flex flex-col items-center justify-between py-1">
                      <span className="text-[10px] text-[var(--db-text-muted)] font-bold">{i}</span>
                    </div>
                  ))}
                </div>

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
                              className={`w-full h-full rounded-xl flex items-center justify-center font-black text-2xl shadow-lg shrink-0 z-10
                                ${isFront ? 'bg-gradient-to-br from-[#2563EB] to-[#60A5FA] text-white ring-4 ring-blue-300 ring-offset-2' : 'bg-slate-500 text-white'}`}
                            >
                              {item.value}
                            </motion.div>
                          )}
                        </AnimatePresence>

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
          )}

          {/* PRACTICE MODE VIEW */}
          {mode === 'Practice' && (
            <div className="flex-1 flex flex-col md:flex-row items-stretch justify-between p-6 pt-20 gap-6 overflow-y-auto">
              
              {/* Left Col: Queue Visualizer */}
              <div className="flex-1 flex flex-col items-center justify-center pb-4 border-r border-[var(--db-card-border)] pr-4">
                <div className="flex items-center w-full justify-between mb-4">
                  <div className="text-[var(--db-text-muted)] font-black text-xs">FRONT</div>
                  <div className="text-[var(--db-text-muted)] font-black text-xs">REAR</div>
                </div>

                <motion.div 
                  animate={underflow ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-24 border-t-4 border-b-4 rounded-xl flex items-center p-2 gap-2 bg-[var(--db-card-bg-elevated)] shadow-inner border-[var(--db-card-border)]"
                >
                  <div className="absolute inset-0 flex items-center p-2 gap-2 z-0 pointer-events-none">
                    {Array.from({ length: MAX_CAPACITY }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex-1 h-16 border border-dashed border-[var(--db-card-border)] rounded-lg flex flex-col items-center justify-between py-1">
                        <span className="text-[9px] text-[var(--db-text-muted)] font-bold">{i}</span>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 flex items-center gap-2 w-full h-full">
                    {queue.map((item, index) => {
                      const isFront = index === front;
                      const isRear = index === rear;
                      const isPeeking = peekIndex === index;
                      const hasItem = item !== null;

                      return (
                        <div key={`container-${index}`} className="flex-1 h-16 relative flex items-center justify-center">
                          <AnimatePresence>
                            {hasItem && (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: 30, scale: 0.8 }}
                                animate={{ 
                                  opacity: 1, 
                                  x: 0, 
                                  scale: isPeeking ? 1.05 : 1,
                                  boxShadow: isPeeking ? '0 0 15px rgba(96, 165, 250, 0.8)' : '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                exit={{ opacity: 0, x: -30, scale: 1.1, backgroundColor: '#EF4444' }}
                                className={`w-full h-full rounded-lg flex items-center justify-center font-black text-lg shadow shrink-0 z-10
                                  ${isFront ? 'bg-gradient-to-br from-[#2563EB] to-[#60A5FA] text-white' : 'bg-slate-600 text-white'}`}
                              >
                                {item.value}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {isFront && hasItem && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center text-blue-600 font-black text-[9px] z-20"
                              >
                                <ArrowUpFromLine className="w-3 h-3 mb-0.5" /> FR
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {isRear && hasItem && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center text-emerald-600 font-black text-[9px] z-20"
                              >
                                RR <ArrowRightToLine className="w-3 h-3 mt-0.5 rotate-90" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Right Col: Guided Practice details */}
              <div className="flex-1 flex flex-col justify-between gap-4 overflow-y-auto">
                {practiceFinished ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center items-center text-center p-4">
                    <Trophy className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
                    <h2 className="text-2xl font-black text-[var(--db-text-main)] mb-1">Practice Complete!</h2>
                    <p className="text-sm text-[var(--db-text-muted)] mb-6">You successfully completed all guided operations for Queue.</p>
                    
                    <div className="grid grid-cols-3 gap-3 w-full mb-6">
                      <div className="bg-[var(--db-card-bg-elevated)] p-3 rounded-xl border border-[var(--db-card-border)]">
                        <span className="block text-[10px] text-[var(--db-text-muted)]">XP Earned</span>
                        <span className="text-lg font-black text-blue-500">+{practiceXp} XP</span>
                      </div>
                      <div className="bg-[var(--db-card-bg-elevated)] p-3 rounded-xl border border-[var(--db-card-border)]">
                        <span className="block text-[10px] text-[var(--db-text-muted)]">Accuracy</span>
                        <span className="text-lg font-black text-emerald-500">{practiceAccuracy}%</span>
                      </div>
                      <div className="bg-[var(--db-card-bg-elevated)] p-3 rounded-xl border border-[var(--db-card-border)]">
                        <span className="block text-[10px] text-[var(--db-text-muted)]">Attempts</span>
                        <span className="text-lg font-black text-purple-500">{practiceAttempts}</span>
                      </div>
                    </div>

                    <div className="w-full mb-6 text-left">
                      <h4 className="text-xs font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-2">Unlocked Badges</h4>
                      <div className="flex flex-wrap gap-2">
                        {unlockedBadges.map((badge, idx) => (
                          <span key={idx} className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black px-3 py-1.5 rounded-full">
                            🎓 {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 w-full">
                      <button onClick={() => setMode('Practice')} className="flex-1 py-3 bg-[var(--db-card-bg-elevated)] hover:bg-[var(--db-btn-secondary-hover)] text-[var(--db-text-main)] font-black text-xs rounded-xl border border-[var(--db-card-border)]">
                        Restart
                      </button>
                      <button onClick={() => setMode('Challenge')} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-lg">
                        Start Challenge
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Top Stats */}
                    <div className="flex items-center justify-between border-b border-[var(--db-card-border)] pb-2">
                      <div>
                        <span className="text-[10px] font-black text-[var(--db-text-muted)] uppercase block">Question {practiceStep + 1} / 10</span>
                        <span className="text-xs font-black text-blue-500">+{practiceXp} XP</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-[var(--db-text-muted)] uppercase block">Accuracy</span>
                        <span className="text-xs font-black text-emerald-500">{practiceAccuracy}%</span>
                      </div>
                    </div>

                    {/* Task Mission Card */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-4 rounded-xl shadow-inner relative overflow-hidden">
                      <span className="absolute right-3 top-3 text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Mission {practiceStep + 1}</span>
                      <h4 className="text-xs text-[var(--db-text-secondary)] font-bold mb-1">Target Operation:</h4>
                      <p className="text-sm font-bold text-[var(--db-text-main)] leading-relaxed">
                        {PRACTICE_TASKS[practiceStep]?.instruction}
                      </p>
                    </div>

                    {/* Feedback & Hint Panels */}
                    {practiceFeedback && (
                      <div className={`p-3 rounded-xl border text-xs font-bold ${
                        practiceFeedback.type === 'correct' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        <div>{practiceFeedback.msg}</div>
                        {practiceFeedback.hint && <div className="mt-1 font-normal opacity-90">{practiceFeedback.hint}</div>}
                      </div>
                    )}

                    {/* Hint System */}
                    <div className="border border-[var(--db-card-border)] p-3 rounded-xl bg-[var(--db-card-bg)]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider">Guided Hints</span>
                        <button onClick={() => setShowHintIndex(prev => Math.min(prev + 1, 3))} className="text-[10px] text-blue-500 font-black hover:underline">Need Help? ({showHintIndex}/3)</button>
                      </div>
                      {showHintIndex > 0 && (
                        <div className="text-xs text-[var(--db-text-secondary)] font-medium italic">
                          💡 Hint: {PRACTICE_TASKS[practiceStep]?.hint}
                        </div>
                      )}
                    </div>

                    {/* Explanation Section */}
                    {lastExplanation && (
                      <div className="bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] p-3 rounded-xl space-y-1.5 text-xs text-[var(--db-text-secondary)]">
                        <div className="font-bold text-blue-400">Last Explanation: {lastExplanation.op}</div>
                        <div>{lastExplanation.text}</div>
                        <div className="flex gap-4 text-[10px] font-mono text-[var(--db-text-muted)] pt-1">
                          <span>Time: {lastExplanation.time}</span>
                          <span>Space: {lastExplanation.space}</span>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-[10px] font-bold text-[var(--db-text-muted)]">
                        <span>Progress: {practiceStep * 10}%</span>
                        <span>Accuracy: {practiceAccuracy}%</span>
                      </div>
                      <div className="w-full bg-[var(--db-card-bg-elevated)] h-1.5 rounded-full overflow-hidden border border-[var(--db-card-border)]">
                        <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${practiceStep * 10}%` }}></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          )}

          {/* CHALLENGE MODE VIEW */}
          {mode === 'Challenge' && (
            <div className="flex-1 flex flex-col md:flex-row items-stretch justify-between p-6 pt-20 gap-6 overflow-y-auto">
              
              {/* Left Col: Queue Visualizer */}
              <div className="flex-1 flex flex-col items-center justify-center pb-4 border-r border-[var(--db-card-border)] pr-4">
                <div className="flex items-center w-full justify-between mb-4">
                  <div className="text-[var(--db-text-muted)] font-black text-xs">FRONT</div>
                  <div className="text-[var(--db-text-muted)] font-black text-xs">REAR</div>
                </div>

                <motion.div 
                  animate={underflow ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-24 border-t-4 border-b-4 rounded-xl flex items-center p-2 gap-2 bg-[var(--db-card-bg-elevated)] shadow-inner border-[var(--db-card-border)]"
                >
                  <div className="absolute inset-0 flex items-center p-2 gap-2 z-0 pointer-events-none">
                    {Array.from({ length: MAX_CAPACITY }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex-1 h-16 border border-dashed border-[var(--db-card-border)] rounded-lg flex flex-col items-center justify-between py-1">
                        <span className="text-[9px] text-[var(--db-text-muted)] font-bold">{i}</span>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 flex items-center gap-2 w-full h-full">
                    {queue.map((item, index) => {
                      const isFront = index === front;
                      const isRear = index === rear;
                      const isPeeking = peekIndex === index;
                      const hasItem = item !== null;

                      return (
                        <div key={`container-${index}`} className="flex-1 h-16 relative flex items-center justify-center">
                          <AnimatePresence>
                            {hasItem && (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: 30, scale: 0.8 }}
                                animate={{ 
                                  opacity: 1, 
                                  x: 0, 
                                  scale: isPeeking ? 1.05 : 1,
                                  boxShadow: isPeeking ? '0 0 15px rgba(96, 165, 250, 0.8)' : '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                exit={{ opacity: 0, x: -30, scale: 1.1, backgroundColor: '#EF4444' }}
                                className={`w-full h-full rounded-lg flex items-center justify-center font-black text-lg shadow shrink-0 z-10
                                  ${isFront ? 'bg-gradient-to-br from-[#2563EB] to-[#60A5FA] text-white' : 'bg-slate-600 text-white'}`}
                              >
                                {item.value}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {isFront && hasItem && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center text-blue-600 font-black text-[9px] z-20"
                              >
                                <ArrowUpFromLine className="w-3 h-3 mb-0.5" /> FR
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {isRear && hasItem && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center text-emerald-600 font-black text-[9px] z-20"
                              >
                                RR <ArrowRightToLine className="w-3 h-3 mt-0.5 rotate-90" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Right Col: Guided Challenge Details */}
              <div className="flex-1 flex flex-col justify-between gap-4 overflow-y-auto">
                {challengeFailed ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center items-center text-center p-4">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
                    <h2 className="text-2xl font-black text-red-500 mb-1">Challenge Failed</h2>
                    <p className="text-sm text-[var(--db-text-muted)] mb-6">You ran out of lives. Review Queue operations and try again!</p>
                    <button onClick={() => setMode('Challenge')} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all">
                      Try Again
                    </button>
                  </motion.div>
                ) : challengeFinished ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center items-center text-center p-4">
                    <Trophy className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
                    <h2 className="text-2xl font-black text-[var(--db-text-main)] mb-1">Challenge Cleared!</h2>
                    <p className="text-sm text-[var(--db-text-muted)] mb-4">Superb! You are a Queue Champion!</p>
                    
                    <div className="bg-[var(--db-card-bg-elevated)] p-4 rounded-xl border border-[var(--db-card-border)] w-full mb-6">
                      <span className="block text-xs text-[var(--db-text-muted)]">Total score</span>
                      <span className="text-3xl font-black text-yellow-400">+{challengeXp} XP</span>
                    </div>

                    <div className="w-full mb-6 text-left">
                      <h4 className="text-xs font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-2">Unlocked Achievements</h4>
                      <div className="flex flex-wrap gap-2">
                        {unlockedAchievements.map((badge, idx) => (
                          <span key={idx} className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 text-[10px] font-black px-3 py-1.5 rounded-full">
                            ✨ {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 w-full">
                      <button onClick={() => setMode('Challenge')} className="flex-1 py-3 bg-[var(--db-card-bg-elevated)] hover:bg-[var(--db-btn-secondary-hover)] text-[var(--db-text-main)] font-black text-xs rounded-xl border border-[var(--db-card-border)]">
                        Retry
                      </button>
                      <button onClick={() => navigate('/subjects')} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs rounded-xl">
                        Main Dashboard
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Top Stats */}
                    <div className="flex items-center justify-between border-b border-[var(--db-card-border)] pb-2">
                      <div className="flex items-center gap-1.5">
                        <Timer className={`w-4 h-4 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`} />
                        <span className={`text-xs font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-[var(--db-text-main)]'}`}>{timeLeft}s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Heart key={i} className={`w-4 h-4 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-600'}`} />
                        ))}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-[var(--db-text-muted)] uppercase block">Level {challengeStep} / 5</span>
                        <span className="text-xs font-black text-yellow-400">+{challengeXp} XP</span>
                      </div>
                    </div>

                    {/* Mission Details */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-4 rounded-xl relative">
                      <span className="absolute right-3 top-3 text-[10px] bg-purple-500/20 text-purple-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Mission {challengeStep}</span>
                      <h4 className="text-xs text-[var(--db-text-secondary)] font-bold mb-1">Objective:</h4>
                      <p className="text-sm font-bold text-[var(--db-text-main)] leading-relaxed mb-4">
                        {CHALLENGE_MISSIONS[challengeStep - 1]?.description}
                      </p>
                      
                      {CHALLENGE_MISSIONS[challengeStep - 1]?.actions?.length > 0 && (
                        <button 
                          onClick={startChallengeSimulation} 
                          disabled={isSimulatingChallenge}
                          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Start Operations
                        </button>
                      )}
                    </div>

                    {/* MCQ Options */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {CHALLENGE_MISSIONS[challengeStep - 1]?.options?.map((opt, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleChallengeAnswer(opt)}
                          disabled={isSimulatingChallenge}
                          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border text-center ${
                            selectedOption === opt 
                              ? opt === CHALLENGE_MISSIONS[challengeStep - 1].correct 
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                : 'bg-red-500/20 border-red-500/50 text-red-400'
                              : 'bg-[var(--db-card-bg-elevated)] border-[var(--db-card-border)] text-[var(--db-text-secondary)] hover:border-purple-400 hover:text-purple-400'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {/* Mini Leaderboard */}
                    <div className="border border-[var(--db-card-border)] rounded-xl p-3 bg-[var(--db-card-bg)]">
                      <h5 className="text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-2">Global Live Leaderboard</h5>
                      <div className="space-y-1.5">
                        {[
                          { name: 'Alex', xp: '580 XP', acc: '100%' },
                          { name: 'Sarah', xp: '510 XP', acc: '95%' },
                          { name: 'You', xp: `${challengeXp} XP`, acc: `${lives === 3 ? '100%' : lives === 2 ? '66%' : '33%'}`, isMe: true }
                        ].map((user, idx) => (
                          <div key={idx} className={`flex items-center justify-between text-[11px] px-2 py-1 rounded-lg ${user.isMe ? 'bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20' : 'text-[var(--db-text-muted)]'}`}>
                            <span>{idx + 1}. {user.name}</span>
                            <span>{user.xp} | {user.acc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          )}
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
