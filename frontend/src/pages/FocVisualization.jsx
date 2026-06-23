import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Play, Pause, SkipForward, RotateCcw, 
  BookOpen, HelpCircle, CheckCircle, ChevronDown, 
  Layers, Volume2, ShieldAlert, Cpu, Database, 
  Binary, Terminal, RefreshCw, Send, Zap, Award, Edit3
} from 'lucide-react';

// Core topics
const FOC_TOPICS = [
  { id: 'number-system', title: 'Number System', icon: '🔢', desc: 'Decimal, binary, octal, hex conversion with farmer seeds.', diff: 'Medium', time: '15 mins', progress: 65, category: 'core', borderColor: 'border-blue-400/50 hover:border-blue-600' },
  { id: 'logic-gates', title: 'Logic Gates', icon: '⚡', desc: 'AND, OR, NOT, NAND, NOR, XOR logic gate simulation.', diff: 'Easy', time: '10 mins', progress: 80, category: 'core', borderColor: 'border-amber-400/50 hover:border-amber-600' },
  { id: 'ascii-unicode', title: 'ASCII & Unicode', icon: '🔤', desc: 'Character representation and encoding systems.', diff: 'Easy', time: '10 mins', progress: 40, category: 'core', borderColor: 'border-purple-400/50 hover:border-purple-600' },
  { id: 'flowcharts', title: 'Flowcharts', icon: '📋', desc: 'Visualize algorithm execution flow step-by-step.', diff: 'Medium', time: '15 mins', progress: 20, category: 'core', borderColor: 'border-emerald-400/50 hover:border-emerald-600' },
  { id: 'memory-org', title: 'Memory Organization', icon: '💾', desc: 'Cache, RAM, SSD, and HDD hierarchy simulation.', diff: 'Hard', time: '20 mins', progress: 10, category: 'core', borderColor: 'border-indigo-400/50 hover:border-indigo-600' },
  { id: 'computer-arch', title: 'Computer Architecture', icon: '🖥', desc: 'ALU, CPU, memory, and register pathways.', diff: 'Hard', time: '25 mins', progress: 0, category: 'core', borderColor: 'border-pink-400/50 hover:border-pink-600' },
  { id: 'os-basics', title: 'Operating System', icon: '⚙', desc: 'Kernel, processes, scheduler, and resource management.', diff: 'Medium', time: '15 mins', progress: 0, category: 'core', borderColor: 'border-cyan-400/50 hover:border-cyan-600' },
  { id: 'number-rep', title: 'Number Representation', icon: '🌐', desc: 'Sign-magnitude, 1\'s and 2\'s complement formats.', diff: 'Medium', time: '12 mins', progress: 0, category: 'core', borderColor: 'border-rose-400/50 hover:border-rose-600' }
];

const SPECIAL_CARDS = [
  { id: 'binary-playground', title: 'Binary Playground', icon: '🧠', desc: 'Interactive sandbox for binary arithmetic.', diff: 'Playground', time: 'Unlimited', progress: 90, category: 'special' },
  { id: 'debug-simulator', title: 'Debug Simulator', icon: '🐞', desc: 'Step through code processes to find execution bugs.', diff: 'Simulator', time: '15 mins', progress: 50, category: 'special' },
  { id: 'quiz-arena', title: 'Quiz Arena', icon: '🎯', desc: 'Test your understanding with real-time FOC questions.', diff: 'Quiz', time: '10 mins', progress: 30, category: 'special' },
  { id: 'animation-replay', title: 'Replay Studio', icon: '🎬', desc: 'Rewind and replay visual computing lessons.', diff: 'Studio', time: 'Unlimited', progress: 10, category: 'special' },
  { id: 'complexity-explorer', title: 'Complexity Explorer', icon: '📊', desc: 'Explore runtime complexity and big O notations.', diff: 'Explorer', time: '20 mins', progress: 0, category: 'special' },
  { id: 'practice-lab', title: 'Practice Lab', icon: '🧪', desc: 'Write expression logic and compile simulations.', diff: 'Lab', time: 'Unlimited', progress: 0, category: 'special' },
  { id: 'ai-tutor', title: 'AI Tutor Mode', icon: '🤖', desc: 'Get smart context-aware tips from the AI tutor.', diff: 'AI Assistant', time: 'Custom', progress: 95, category: 'special' }
];

export default function FocVisualization() {
  const navigate = useNavigate();
  
  // App states
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('explanation'); // explanation, steps, quiz, notes
  const [mode, setMode] = useState('normal'); // normal, slow-motion, debug, exam, ai-tutor
  
  // Visualizer states
  const [operation, setOperation] = useState('');
  const [inputValue, setInputValue] = useState('19');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  // Logic Gates states
  const [gateA, setGateA] = useState(true);
  const [gateB, setGateB] = useState(false);
  const [gateType, setGateType] = useState('AND');
  const [gateResult, setGateResult] = useState(false);
  
  // Flowchart states
  const [flowchartTopic, setFlowchartTopic] = useState('Even/Odd');
  
  // Memory & Arch states
  const [activeStorageIndex, setActiveStorageIndex] = useState(-1);

  // Quiz States
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);

  // Notes state
  const [userNotes, setUserNotes] = useState('Type your study notes here for reference...');

  // Setup operations when topic changes
  useEffect(() => {
    if (selectedTopic) {
      if (selectedTopic.id === 'number-system') {
        setOperation('decimal-binary');
        setInputValue('19');
      } else if (selectedTopic.id === 'logic-gates') {
        setOperation('AND');
        setGateType('AND');
      } else if (selectedTopic.id === 'flowcharts') {
        setOperation('Even/Odd');
        setFlowchartTopic('Even/Odd');
      } else if (selectedTopic.id === 'ascii-unicode') {
        setOperation('char-binary');
        setInputValue('A');
      } else if (selectedTopic.id === 'memory-org') {
        setOperation('hierarchy');
      } else if (selectedTopic.id === 'computer-arch') {
        setOperation('data-path');
      }
      setAnimationStep(0);
      setIsAnimating(false);
      setQuizIndex(0);
      setQuizAnswered(false);
      setSelectedAnswer(null);
    }
  }, [selectedTopic]);

  // Recalculate logic gates outputs
  useEffect(() => {
    let result = false;
    switch (gateType) {
      case 'AND': result = gateA && gateB; break;
      case 'OR': result = gateA || gateB; break;
      case 'NOT': result = !gateA; break;
      case 'NAND': result = !(gateA && gateB); break;
      case 'NOR': result = !(gateA || gateB); break;
      case 'XOR': result = gateA !== gateB; break;
      default: result = false;
    }
    setGateResult(result);
  }, [gateA, gateB, gateType]);

  // Handle animation play loop
  useEffect(() => {
    let timer;
    if (isAnimating) {
      const delay = (mode === 'slow-motion' ? 2000 : 1000) / playbackSpeed;
      timer = setTimeout(() => {
        setAnimationStep((prev) => {
          let maxSteps = 5;
          if (selectedTopic?.id === 'number-system') maxSteps = 6;
          if (selectedTopic?.id === 'logic-gates') maxSteps = 3;
          if (selectedTopic?.id === 'flowcharts') maxSteps = 6;
          if (selectedTopic?.id === 'ascii-unicode') maxSteps = 9;
          if (selectedTopic?.id === 'memory-org') maxSteps = 4;
          if (selectedTopic?.id === 'computer-arch') maxSteps = 5;

          if (prev >= maxSteps - 1) {
            setIsAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [isAnimating, animationStep, playbackSpeed, selectedTopic, mode]);

  // Helper values for number conversion representation
  const getBinaryBaskets = (valStr) => {
    const val = parseInt(valStr, 10) || 0;
    return [
      { name: '16', value: 16, active: (val & 16) > 0 },
      { name: '8', value: 8, active: (val & 8) > 0 },
      { name: '4', value: 4, active: (val & 4) > 0 },
      { name: '2', value: 2, active: (val & 2) > 0 },
      { name: '1', value: 1, active: (val & 1) > 0 },
    ];
  };

  const getExplanation = () => {
    if (selectedTopic?.id === 'number-system') {
      if (operation === 'decimal-binary') {
        const val = parseInt(inputValue, 10) || 0;
        const binary = val.toString(2).padStart(5, '0');
        const stepsList = [
          `Starting Decimal to Binary for ${val}.`,
          `Check 16: ${val} >= 16? Yes. Put 1 in 16's basket. Remainder = ${val - 16}.`,
          `Check 8: ${val - 16} >= 8? No. Put 0 in 8's basket.`,
          `Check 4: ${val - 16} >= 4? No. Put 0 in 4's basket.`,
          `Check 2: ${val - 16} >= 2? Yes. Put 1 in 2's basket. Remainder = ${(val - 16) - 2}.`,
          `Check 1: ${(val - 16) - 2} >= 1? Yes. Put 1 in 1's basket. Remainder = 0.`,
          `Conversion complete! Binary code is: ${binary}`
        ];
        return stepsList[Math.min(animationStep, stepsList.length - 1)];
      }
      return 'Simulating complementary bits logic.';
    }

    if (selectedTopic?.id === 'logic-gates') {
      return `Chickens representing inputs A (${gateA ? 'True' : 'False'}) and B (${gateB ? 'True' : 'False'}) pass through the ${gateType} gate. The output egg matches the operation result: ${gateResult ? 'True (Healthy Egg)' : 'False (Empty Shell)'}.`;
    }

    if (selectedTopic?.id === 'flowcharts') {
      return `Algorithm: ${flowchartTopic}. Flow chart starts, checks decision block, branches dynamically, and terminates at End state.`;
    }

    if (selectedTopic?.id === 'ascii-unicode') {
      const char = inputValue || 'A';
      const code = char.charCodeAt(0) || 0;
      const bin = code.toString(2).padStart(8, '0');
      return `Converting character '${char}' (ASCII decimal ${code}) to 8-bit binary representation: ${bin}. The farmer places seeds in the matching bit baskets.`;
    }

    return 'Explore computer basics dynamically.';
  };

  // Quizzes list
  const QUIZ_QUESTIONS = {
    'number-system': [
      { q: "What is the binary representation of decimal 19?", o: ["10011", "10101", "11001", "10001"], a: 0 },
      { q: "How is binary addition 1 + 1 calculated?", o: ["0 with carry 0", "1 with carry 1", "0 with carry 1", "2"], a: 2 }
    ],
    'logic-gates': [
      { q: "Which gate gives output 1 only when both inputs are 1?", o: ["OR", "AND", "XOR", "NAND"], a: 1 },
      { q: "NAND output is equivalent to which combination?", o: ["AND + NOT", "OR + NOT", "XOR + NOT", "None"], a: 0 }
    ],
    'flowcharts': [
      { q: "What shape represents a decision block in a flowchart?", o: ["Rectangle", "Oval", "Diamond", "Parallelogram"], a: 2 }
    ],
    'memory-org': [
      { q: "Which memory level is the fastest?", o: ["RAM", "SSD", "Hard Disk", "Cache"], a: 3 }
    ],
    'computer-arch': [
      { q: "What unit executes arithmetic operations in the CPU?", o: ["ALU", "Control Unit", "Registers", "Cache"], a: 0 }
    ]
  };

  const getQuizQuestions = () => {
    return QUIZ_QUESTIONS[selectedTopic?.id] || [
      { q: "What is the core unit of digital memory?", o: ["Byte", "Bit", "Kilobyte", "Word"], a: 1 }
    ];
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden bg-[#FAFAFA] text-black flex flex-col font-sans select-none relative">
      
      {/* Subtle light background dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0" />

      {/* TOP HEADER */}
      <header className="h-16 shrink-0 border-b border-neutral-200 flex items-center justify-between px-6 bg-white/95 backdrop-blur-xl relative z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (selectedTopic) setSelectedTopic(null);
              else navigate('/subjects');
            }} 
            className="p-2 hover:bg-neutral-100 border border-neutral-200 hover:border-black rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] tracking-widest text-neutral-500 font-bold uppercase">EduVerse AI Lab</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-black">Fundamentals of Computing</span>
              {selectedTopic && (
                <>
                  <span className="text-neutral-300">/</span>
                  <span className="text-black font-semibold flex items-center gap-1.5 bg-neutral-100 px-2.5 py-0.5 rounded-full text-xs border border-neutral-200">
                    {selectedTopic.icon} {selectedTopic.title}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick info status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Visual Engine Active
            </span>
          </div>

          {selectedTopic && (
            <div className="flex bg-neutral-100 border border-neutral-200 p-0.5 rounded-lg">
              {['normal', 'slow-motion', 'debug', 'ai-tutor'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                    mode === m 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
                  }`}
                >
                  {m.toUpperCase().replace('-', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* INTERACTIVE SCREENS CONTAINER */}
      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* LEVEL 1: DASHBOARD VIEW */}
          {!selectedTopic ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col p-6 overflow-hidden max-w-[1600px] mx-auto w-full justify-between"
            >
              <div>
                <div className="mb-4">
                  <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-black">
                    FOC Visualizer Laboratory
                  </h1>
                  <p className="text-neutral-500 text-sm mt-1 font-medium">
                    Interact, play, and comprehend the core fundamentals of computer science with visual farmer-themed simulations.
                  </p>
                </div>

                {/* Learning Roadmap Timeline */}
                <div className="mb-5 bg-white border border-neutral-200 rounded-2xl p-4 relative overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Learning Roadmap Timeline</h3>
                    <span className="text-[10px] text-neutral-400 font-mono">STEP-BY-STEP PROGRESSION</span>
                  </div>
                  
                  {/* Timeline path */}
                  <div className="relative flex items-center justify-between px-6 py-2">
                    {/* Connecting line background */}
                    <div className="absolute left-10 right-10 top-[22px] h-[2px] bg-neutral-100 z-0" />
                    {/* Active line fill */}
                    <div className="absolute left-10 top-[22px] h-[2px] bg-neutral-300 z-0" style={{ width: '40%' }} />

                    {FOC_TOPICS.slice(0, 6).map((topic, index) => {
                      const isCompleted = topic.progress === 100 || index < 2; 
                      
                      return (
                        <div 
                          key={topic.id} 
                          className="relative z-10 flex flex-col items-center group cursor-pointer" 
                          onClick={() => setSelectedTopic(topic)}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            isCompleted ? 'bg-neutral-100 border-neutral-400 text-neutral-600' :
                            'bg-white border-neutral-200 text-neutral-400 group-hover:border-neutral-400 group-hover:text-neutral-600'
                          }`}>
                            <span className="text-xs font-mono font-bold">{index + 1}</span>
                          </div>
                          <span className="text-[10.5px] mt-2 font-bold tracking-tight text-neutral-400 group-hover:text-neutral-600 transition-colors">
                            {topic.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Learning Modules grid */}
                <div>
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Learning Modules</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {FOC_TOPICS.map((topic) => (
                      <motion.div
                        key={topic.id}
                        whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}
                        onClick={() => setSelectedTopic(topic)}
                        className={`bg-white border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between group h-36 shadow-sm ${topic.borderColor}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="text-2xl transition-transform duration-300 group-hover:scale-125">{topic.icon}</div>
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[10px] bg-neutral-100 text-neutral-600 border border-neutral-200 px-2 py-0.5 rounded-full font-mono font-bold">
                              {topic.time}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              topic.diff === 'Easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              topic.diff === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {topic.diff}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-neutral-800 mt-2 group-hover:text-black transition-colors">
                            {topic.title}
                          </h4>
                          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1 leading-relaxed">
                            {topic.desc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100">
                          <div className="flex-1 mr-4">
                            <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-black transition-all duration-500" 
                                style={{ width: `${topic.progress}%` }} 
                              />
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-neutral-400 group-hover:text-black">
                            {topic.progress}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Special Learning Tools */}
              <div className="mt-4">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Specialized Simulations & Tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {SPECIAL_CARDS.map((card) => (
                    <motion.div
                      key={card.id}
                      whileHover={{ scale: 1.03, borderColor: '#000000', boxShadow: '0 0 15px rgba(0,0,0,0.04)' }}
                      onClick={() => {
                        const matched = FOC_TOPICS.find(t => t.id === 'number-system');
                        setSelectedTopic(matched);
                      }}
                      className="bg-white border border-neutral-200 rounded-xl p-3 cursor-pointer transition-all duration-300 flex flex-col justify-between group h-28 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-xl group-hover:rotate-12 transition-transform duration-300">{card.icon}</div>
                        <span className="text-[9px] bg-neutral-100 border border-neutral-200 text-neutral-500 px-1.5 py-0.2 rounded font-mono">
                          {card.diff}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-neutral-800 mt-2 line-clamp-1 group-hover:text-black">{card.title}</h4>
                        <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">{card.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

            </motion.div>
          ) : (
            
            /* LEVEL 2: THREE-PANEL INTERACTIVE VISUALIZER */
            <motion.div 
              key="visualizer"
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.3 }}
              className="h-full flex p-4 gap-4 overflow-hidden"
            >
              
              {/* LEFT PANEL: CONTROLS */}
              <div className="w-[300px] shrink-0 h-full bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                <div className="space-y-4">
                  {/* EduVerse AI Learning Card */}
                  <div className="bg-black text-white p-3.5 rounded-xl border border-neutral-900 space-y-1.5 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase">EduVerse AI Learning Card</span>
                      <span className="text-xs">✨</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black tracking-tight text-white">{selectedTopic.title}</h4>
                      <p className="text-[10px] text-neutral-400">Fundamentals of Computing</p>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-neutral-900 mt-1">
                      <span className="text-[9px] font-mono text-neutral-400">EST: {selectedTopic.time}</span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">DIFF: {selectedTopic.diff.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Operation Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-500 font-bold">SELECT OPERATION</label>
                    <div className="relative">
                      {selectedTopic.id === 'number-system' && (
                        <select 
                          value={operation}
                          onChange={(e) => setOperation(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
                        >
                          <option value="decimal-binary">➕ Decimal → Binary</option>
                          <option value="binary-decimal">➕ Binary → Decimal</option>
                          <option value="decimal-octal">➕ Decimal → Octal</option>
                          <option value="decimal-hex">➕ Decimal → Hexadecimal</option>
                          <option value="binary-addition">➕ Binary Addition</option>
                          <option value="ones-complement">➕ 1's Complement</option>
                          <option value="twos-complement">➕ 2's Complement</option>
                        </select>
                      )}

                      {selectedTopic.id === 'logic-gates' && (
                        <select 
                          value={gateType}
                          onChange={(e) => setGateType(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
                        >
                          <option value="AND">AND Gate</option>
                          <option value="OR">OR Gate</option>
                          <option value="NOT">NOT Gate</option>
                          <option value="NAND">NAND Gate</option>
                          <option value="NOR">NOR Gate</option>
                          <option value="XOR">XOR Gate</option>
                        </select>
                      )}

                      {selectedTopic.id === 'flowcharts' && (
                        <select 
                          value={flowchartTopic}
                          onChange={(e) => setFlowchartTopic(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
                        >
                          <option value="Even/Odd">Even/Odd Algorithm</option>
                          <option value="Prime Number">Prime Number Checker</option>
                          <option value="Factorial">Factorial Calculator</option>
                          <option value="Largest Among Three">Largest of Three</option>
                        </select>
                      )}

                      {selectedTopic.id === 'ascii-unicode' && (
                        <select 
                          value={operation}
                          onChange={(e) => setOperation(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
                        >
                          <option value="char-binary">➕ Character → Binary</option>
                          <option value="binary-char">➕ Binary → Character</option>
                        </select>
                      )}

                      {selectedTopic.id === 'memory-org' && (
                        <select 
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
                        >
                          <option>Cache → RAM → SSD → HDD</option>
                        </select>
                      )}

                      {selectedTopic.id === 'computer-arch' && (
                        <select 
                          className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-white transition-all appearance-none cursor-pointer"
                        >
                          <option>Full Architecture Pathways</option>
                        </select>
                      )}
                      
                      <div className="absolute right-3 top-3.5 pointer-events-none text-neutral-400">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Input Value */}
                  {selectedTopic.id === 'number-system' && (
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-500 font-bold">INPUT VALUE</label>
                      <input 
                        type="number" 
                        value={inputValue}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(31, parseInt(e.target.value, 10) || 0));
                          setInputValue(val.toString());
                        }}
                        className="w-full bg-neutral-50 border border-neutral-200 focus:border-black rounded-xl px-3 py-2.5 text-sm font-bold text-black focus:outline-none transition-all font-mono"
                        placeholder="Value (0-31)"
                      />
                    </div>
                  )}

                  {selectedTopic.id === 'ascii-unicode' && (
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-500 font-bold">INPUT CHARACTER</label>
                      <input 
                        type="text" 
                        maxLength={1}
                        value={inputValue}
                        onChange={(e) => {
                          const val = e.target.value || 'A';
                          setInputValue(val);
                        }}
                        className="w-full bg-neutral-50 border border-neutral-200 focus:border-black rounded-xl px-3 py-2.5 text-sm font-bold text-black focus:outline-none transition-all font-mono text-center text-xl font-black"
                        placeholder="A"
                      />
                    </div>
                  )}

                  {/* Gate Toggle Switch for logic gates */}
                  {selectedTopic.id === 'logic-gates' && (
                    <div className="space-y-3 bg-neutral-50 border border-neutral-200 p-3 rounded-xl">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Toggle Inputs</span>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold font-mono">Input A</span>
                        <button 
                          onClick={() => setGateA(!gateA)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${gateA ? 'bg-black' : 'bg-neutral-300'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${gateA ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {gateType !== 'NOT' && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold font-mono">Input B</span>
                          <button 
                            onClick={() => setGateB(!gateB)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${gateB ? 'bg-black' : 'bg-neutral-300'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${gateB ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Control Buttons Group */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button 
                      onClick={() => {
                        setIsAnimating(true);
                        setAnimationStep(0);
                      }}
                      disabled={isAnimating}
                      className="bg-black hover:bg-neutral-800 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-md disabled:opacity-40"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Run
                    </button>
                    <button 
                      onClick={() => setIsAnimating(false)}
                      className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs text-black"
                    >
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </button>
                    <button 
                      onClick={() => {
                        let maxSteps = 5;
                        setAnimationStep(prev => (prev + 1) % maxSteps);
                      }}
                      className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs text-black"
                    >
                      <SkipForward className="w-3.5 h-3.5" /> Step
                    </button>
                    <button 
                      onClick={() => {
                        setAnimationStep(0);
                        setIsAnimating(false);
                      }}
                      className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs text-black"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  </div>

                  {/* Speed slider */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] font-bold text-neutral-400">
                      <span>SPEED</span>
                      <span>{playbackSpeed}x</span>
                    </div>
                    <input 
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.25"
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      className="w-full accent-black"
                    />
                  </div>
                </div>

                {/* Extra buttons */}
                <div className="space-y-2 border-t border-neutral-200 pt-4">
                  <button 
                    onClick={() => setActiveTab('quiz')}
                    className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-black font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs text-black"
                  >
                    <Award className="w-3.5 h-3.5" /> Take Module Quiz
                  </button>
                  <button 
                    onClick={() => {
                      setAnimationStep(0);
                      setIsAnimating(true);
                    }}
                    className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-black font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs text-black"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Speech Explanation
                  </button>
                </div>
              </div>

              {/* CENTER PANEL: VISUALIZATION CANVAS */}
              <div className="flex-1 h-full bg-white border border-neutral-200 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 shadow-sm">
                
                {/* Farmer Theme Alert / Description */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3.5 py-1.5 rounded-full z-20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">Farmer Simulation Engine</span>
                </div>

                {/* 1. NUMBER SYSTEM MODULE ANIMATION */}
                {selectedTopic.id === 'number-system' && (
                  <div className="flex flex-col items-center justify-center w-full max-w-lg space-y-8">
                    <div className="text-center">
                      <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase block">FARMER SEED PLACEMENT</span>
                      <h4 className="text-2xl font-extrabold mt-1">Decimal {inputValue} to Binary</h4>
                    </div>

                    {/* Basket grid representation */}
                    <div className="flex justify-center items-end gap-5 h-48 relative w-full pt-8">
                      {getBinaryBaskets(inputValue).map((basket, index) => {
                        const isCurrentActive = animationStep > index;
                        return (
                          <div key={basket.name} className="flex flex-col items-center space-y-3 flex-1 max-w-[80px]">
                            {/* Seed placing anim / seed state */}
                            <div className="h-16 flex items-center justify-center relative w-full">
                              <AnimatePresence>
                                {isCurrentActive && basket.active && (
                                  <motion.div 
                                    initial={{ y: -60, opacity: 0, scale: 0.5 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    className="text-3xl filter drop-shadow-[0_0_10px_rgba(22,163,74,0.3)]"
                                  >
                                    🌾
                                  </motion.div>
                                )}
                                {isCurrentActive && !basket.active && (
                                  <motion.div 
                                    initial={{ y: -60, opacity: 0 }}
                                    animate={{ y: 0, opacity: 0.4 }}
                                    className="text-lg font-black text-red-500 font-mono"
                                  >
                                    ❌
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Basket UI */}
                            <motion.div 
                              animate={isCurrentActive && basket.active ? { 
                                borderColor: '#000000', 
                                boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' 
                              } : {}}
                              className="w-full h-16 border-2 border-neutral-300 rounded-b-xl rounded-t-sm flex flex-col items-center justify-center bg-neutral-50 relative"
                            >
                              <span className="text-xs font-mono font-bold text-neutral-400">Basket</span>
                              <span className="text-lg font-black font-mono">{basket.name}</span>
                            </motion.div>

                            {/* Binary Bit value */}
                            <div className="font-mono text-xl font-bold">
                              {isCurrentActive ? (basket.active ? '1' : '0') : '-'}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-center font-mono text-xl tracking-widest font-black text-neutral-600 pt-4">
                      BINARY CODE: {
                        getBinaryBaskets(inputValue)
                          .map((b, i) => (animationStep > i ? (b.active ? '1' : '0') : '-'))
                          .join(' ')
                      }
                    </div>
                  </div>
                )}

                {/* 2. LOGIC GATES MODULE ANIMATION */}
                {selectedTopic.id === 'logic-gates' && (
                  <div className="flex flex-col items-center justify-center w-full max-w-xl space-y-10">
                    <div className="text-center">
                      <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase block">CHICKEN LOGIC FLOW</span>
                      <h4 className="text-2xl font-extrabold mt-1">{gateType} Logic Gate</h4>
                    </div>

                    <div className="flex items-center justify-between w-full h-40 px-10 relative">
                      {/* Chicken inputs */}
                      <div className="flex flex-col gap-8 justify-center">
                        <motion.div 
                          animate={isAnimating ? { x: [0, 160, 160], opacity: [1, 1, 0] } : {}}
                          transition={{ duration: 2 }}
                          className="flex items-center gap-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200"
                        >
                          <span className="text-2xl">🐔</span>
                          <div className="flex flex-col">
                            <span className="text-[9px] text-neutral-500 font-bold uppercase">Input A</span>
                            <span className={`text-xs font-bold font-mono ${gateA ? 'text-emerald-600' : 'text-neutral-500'}`}>
                              {gateA ? 'TRUE (1)' : 'FALSE (0)'}
                            </span>
                          </div>
                        </motion.div>

                        {gateType !== 'NOT' && (
                          <motion.div 
                            animate={isAnimating ? { x: [0, 160, 160], opacity: [1, 1, 0] } : {}}
                            transition={{ duration: 2 }}
                            className="flex items-center gap-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200"
                          >
                            <span className="text-2xl">🐔</span>
                            <div className="flex flex-col">
                              <span className="text-[9px] text-neutral-500 font-bold uppercase">Input B</span>
                              <span className={`text-xs font-bold font-mono ${gateB ? 'text-emerald-600' : 'text-neutral-500'}`}>
                                {gateB ? 'TRUE (1)' : 'FALSE (0)'}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Gate Node */}
                      <div className="w-28 h-28 rounded-full border-2 border-neutral-300 bg-white flex items-center justify-center relative shadow-sm z-10">
                        <span className="font-black tracking-widest text-lg font-mono">{gateType}</span>
                        <div className={`absolute inset-0 rounded-full border-2 animate-ping opacity-25 ${
                          gateResult ? 'border-emerald-500' : 'border-red-500'
                        }`} />
                      </div>

                      {/* Output Egg */}
                      <div>
                        <motion.div 
                          animate={isAnimating ? { scale: [0.5, 1.2, 1] } : {}}
                          className={`flex items-center gap-3 p-3 rounded-2xl border ${
                            gateResult 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                              : 'bg-red-50 border-red-500 text-red-700 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                          }`}
                        >
                          <span className="text-3xl">{gateResult ? '🥚' : '🍳'}</span>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase text-neutral-500">Output</span>
                            <span className="text-sm font-black font-mono">
                              {gateResult ? 'TRUE (1)' : 'FALSE (0)'}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. FLOWCHARTS MODULE ANIMATION */}
                {selectedTopic.id === 'flowcharts' && (
                  <div className="flex flex-col items-center justify-center w-full max-w-md space-y-6">
                    <div className="text-center">
                      <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase block">LOGIC PATHWAY</span>
                      <h4 className="text-xl font-extrabold mt-1">{flowchartTopic} Flowchart</h4>
                    </div>

                    <div className="space-y-4 w-full flex flex-col items-center">
                      {/* START block */}
                      <div className={`px-5 py-2.5 rounded-full border text-xs font-mono font-bold transition-all ${
                        animationStep === 0 ? 'bg-black text-white border-black scale-105 shadow-md' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                      }`}>
                        [ START ]
                      </div>

                      <div className="w-0.5 h-6 bg-neutral-200" />

                      {/* INPUT block */}
                      <div className={`px-6 py-2.5 rounded-md border text-xs font-mono font-bold transition-all skew-x-12 ${
                        animationStep === 1 ? 'bg-black text-white border-black scale-105 shadow-md' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                      }`}>
                        Input Number N
                      </div>

                      <div className="w-0.5 h-6 bg-neutral-200" />

                      {/* DECISION block */}
                      <div className={`px-5 py-4 border text-xs font-mono font-bold transition-all rotate-45 flex items-center justify-center w-24 h-24 ${
                        animationStep === 2 ? 'bg-black text-white border-black scale-105 shadow-md' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                      }`}>
                        <span className="-rotate-45 text-center">N % 2 == 0?</span>
                      </div>

                      <div className="w-0.5 h-6 bg-neutral-200" />

                      {/* BRANCH blocks */}
                      <div className="flex justify-between w-full max-w-[280px]">
                        <div className={`px-4 py-2 rounded-md border text-[11px] font-mono transition-all ${
                          animationStep === 3 ? 'bg-emerald-500 text-white border-emerald-400 scale-105 shadow-sm' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                        }`}>
                          Print "Even"
                        </div>
                        <div className={`px-4 py-2 rounded-md border text-[11px] font-mono transition-all ${
                          animationStep === 4 ? 'bg-amber-500 text-white border-amber-400 scale-105 shadow-sm' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                        }`}>
                          Print "Odd"
                        </div>
                      </div>

                      <div className="w-0.5 h-6 bg-neutral-200" />

                      {/* END block */}
                      <div className={`px-5 py-2.5 rounded-full border text-xs font-mono font-bold transition-all ${
                        animationStep === 5 ? 'bg-black text-white border-black scale-105 shadow-sm' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                      }`}>
                        [ END ]
                      </div>
                    </div>
                  </div>
                )}

                {/* 3.5. ASCII & UNICODE MODULE ANIMATION */}
                {selectedTopic.id === 'ascii-unicode' && (
                  <div className="flex flex-col items-center justify-center w-full max-w-xl space-y-8">
                    <div className="text-center">
                      <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase block">ENCODING ENGINE</span>
                      <h4 className="text-2xl font-extrabold mt-1">Character representation for '{inputValue || 'A'}'</h4>
                    </div>

                    <div className="flex justify-around items-center w-full bg-neutral-50 border border-neutral-200 p-4 rounded-2xl">
                      <div className="text-center">
                        <span className="text-[10px] text-neutral-500 font-mono uppercase block">CHARACTER</span>
                        <span className="text-4xl font-extrabold text-black mt-1 block font-mono">'{inputValue || 'A'}'</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-neutral-500 font-mono uppercase block">ASCII DECIMAL</span>
                        <span className="text-3xl font-black text-emerald-600 mt-1 block font-mono">
                          {(inputValue || 'A').charCodeAt(0) || 0}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-neutral-500 font-mono uppercase block">UNICODE POINT</span>
                        <span className="text-3xl font-black text-blue-600 mt-1 block font-mono">
                          U+{((inputValue || 'A').charCodeAt(0) || 0).toString(16).toUpperCase().padStart(4, '0')}
                        </span>
                      </div>
                    </div>

                    {/* 8-bit seed baskets */}
                    <div className="flex justify-center items-end gap-3 h-32 relative w-full pt-4">
                      {Array.from({ length: 8 }).map((_, i) => {
                        const bitIndex = 7 - i;
                        const bitWeight = 1 << bitIndex;
                        const charCode = (inputValue || 'A').charCodeAt(0) || 0;
                        const bitActive = (charCode & bitWeight) > 0;
                        const isCurrentActive = animationStep > i;

                        return (
                          <div key={bitWeight} className="flex flex-col items-center space-y-2 flex-1 max-w-[60px]">
                            <div className="h-8 flex items-center justify-center relative w-full">
                              <AnimatePresence>
                                {isCurrentActive && bitActive && (
                                  <motion.div 
                                    initial={{ y: -30, opacity: 0, scale: 0.5 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    className="text-2xl filter drop-shadow-[0_0_8px_rgba(22,163,74,0.3)]"
                                  >
                                    🌾
                                  </motion.div>
                                )}
                                {isCurrentActive && !bitActive && (
                                  <motion.div 
                                    initial={{ y: -30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 0.4 }}
                                    className="text-sm font-black text-red-500 font-mono"
                                  >
                                    ❌
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Basket UI */}
                            <motion.div 
                              animate={isCurrentActive && bitActive ? { 
                                borderColor: '#000000', 
                                boxShadow: '0 0 10px rgba(0,0,0,0.1)' 
                              } : {}}
                              className="w-full h-12 border-2 border-neutral-300 rounded-b-lg rounded-t-sm flex flex-col items-center justify-center bg-neutral-50 relative"
                            >
                              <span className="text-[8px] font-mono text-neutral-500">{bitWeight}</span>
                            </motion.div>

                            {/* Binary Bit value */}
                            <div className="font-mono text-sm font-bold">
                              {isCurrentActive ? (bitActive ? '1' : '0') : '-'}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-center font-mono text-lg tracking-widest font-black text-neutral-500">
                      BINARY CODE: {
                        Array.from({ length: 8 }).map((_, i) => {
                          const bitIndex = 7 - i;
                          const bitWeight = 1 << bitIndex;
                          const charCode = (inputValue || 'A').charCodeAt(0) || 0;
                          const bitActive = (charCode & bitWeight) > 0;
                          return animationStep > i ? (bitActive ? '1' : '0') : '-';
                        }).join(' ')
                      }
                    </div>
                  </div>
                )}

                {/* 4. MEMORY ORGANIZATION ANIMATION */}
                {selectedTopic.id === 'memory-org' && (
                  <div className="flex flex-col items-center justify-center w-full max-w-xl space-y-8">
                    <div className="text-center">
                      <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase block">STORAGE HIERARCHY</span>
                      <h4 className="text-2xl font-extrabold mt-1">Speed vs. Capacity Model</h4>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                      {/* Pocket (Cache) */}
                      <motion.div 
                        onClick={() => setActiveStorageIndex(0)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          activeStorageIndex === 0 ? 'bg-neutral-100 border-black' : 'bg-white border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">👖</span>
                          <div>
                            <h5 className="font-bold text-sm text-black">Pocket (Cache Memory)</h5>
                            <p className="text-[10px] text-neutral-500">Extremely fast, but tiny storage capacity.</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-black">SPEED: 0.5ns | CAP: 32MB</span>
                      </motion.div>

                      {/* Bag (RAM) */}
                      <motion.div 
                        onClick={() => setActiveStorageIndex(1)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          activeStorageIndex === 1 ? 'bg-neutral-100 border-black' : 'bg-white border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎒</span>
                          <div>
                            <h5 className="font-bold text-sm text-black">Bag (RAM - Random Access)</h5>
                            <p className="text-[10px] text-neutral-500">Fast volatile memory for open applications.</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-black">SPEED: 15ns | CAP: 16GB</span>
                      </motion.div>

                      {/* Store Room (SSD) */}
                      <motion.div 
                        onClick={() => setActiveStorageIndex(2)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          activeStorageIndex === 2 ? 'bg-neutral-100 border-black' : 'bg-white border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🚪</span>
                          <div>
                            <h5 className="font-bold text-sm text-black">Store Room (Solid State Drive)</h5>
                            <p className="text-[10px] text-neutral-500">High-speed non-volatile storage.</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-black">SPEED: 100μs | CAP: 1TB</span>
                      </motion.div>

                      {/* Warehouse (Hard Disk) */}
                      <motion.div 
                        onClick={() => setActiveStorageIndex(3)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          activeStorageIndex === 3 ? 'bg-neutral-100 border-black' : 'bg-white border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏭</span>
                          <div>
                            <h5 className="font-bold text-sm text-black">Warehouse (Mechanical Hard Disk)</h5>
                            <p className="text-[10px] text-neutral-500">Huge capacity, slowest access times.</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-black">SPEED: 5ms | CAP: 16TB</span>
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* 5. COMPUTER ARCHITECTURE ANIMATION */}
                {selectedTopic.id === 'computer-arch' && (
                  <div className="flex flex-col items-center justify-center w-full max-w-2xl space-y-8">
                    <div className="text-center">
                      <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase block">HARDWARE DATA-PATHWAYS</span>
                      <h4 className="text-2xl font-extrabold mt-1">Bus Line Data Packet simulation</h4>
                    </div>

                    <div className="flex items-center justify-between w-full px-6 relative h-40">
                      {/* Keyboard */}
                      <div className="flex flex-col items-center gap-2 bg-neutral-50 border border-neutral-200 p-3 rounded-xl w-28">
                        <span className="text-3xl">⌨️</span>
                        <span className="text-xs font-bold font-mono">Keyboard</span>
                      </div>

                      {/* CPU / ALU */}
                      <div className="flex flex-col items-center gap-2 bg-neutral-50 border-2 border-black p-4 rounded-2xl w-36 shadow-sm relative">
                        <span className="text-3xl">⚙️</span>
                        <span className="text-xs font-extrabold font-mono">CPU Core</span>
                        <div className="text-[9px] text-neutral-500 bg-white border border-neutral-200 px-1.5 py-0.5 rounded font-mono">
                          ALU + Control Unit
                        </div>
                      </div>

                      {/* Memory */}
                      <div className="flex flex-col items-center gap-2 bg-neutral-50 border border-neutral-200 p-3 rounded-xl w-28">
                        <span className="text-3xl">💾</span>
                        <span className="text-xs font-bold font-mono">RAM</span>
                      </div>

                      {/* Monitor */}
                      <div className="flex flex-col items-center gap-2 bg-neutral-50 border border-neutral-200 p-3 rounded-xl w-28">
                        <span className="text-3xl">🖥️</span>
                        <span className="text-xs font-bold font-mono">Monitor</span>
                      </div>

                      {/* Glowing dot packet travel */}
                      <AnimatePresence>
                        {isAnimating && (
                          <motion.div 
                            initial={{ left: '10%' }}
                            animate={{ left: ['10%', '35%', '65%', '85%', '85%'] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-[45%] w-4 h-4 bg-black rounded-full border border-white shadow-sm"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* 6. GENERAL FALLBACK */}
                {['os-basics', 'number-rep'].includes(selectedTopic.id) && (
                  <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <span className="text-5xl">{selectedTopic.icon}</span>
                    <h4 className="text-2xl font-black">{selectedTopic.title}</h4>
                    <p className="text-neutral-500 max-w-md text-sm">
                      This specialized interactive model is fully configured. Use the tabs on the right side to read notes or take the mini quizzes.
                    </p>
                    <button 
                      onClick={() => setAnimationStep((prev) => prev + 1)}
                      className="px-4 py-2 bg-black text-white font-bold rounded-xl text-xs hover:bg-neutral-800 transition-all"
                    >
                      Cycle Animation Step
                    </button>
                  </div>
                )}

              </div>

              {/* RIGHT PANEL: EXPLANATIONS & TABS */}
              <div className="w-[340px] shrink-0 h-full bg-white border border-neutral-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                
                {/* Tabs selection */}
                <div className="flex border-b border-neutral-200 bg-neutral-50 p-1">
                  {['explanation', 'steps', 'quiz', 'notes'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                        activeTab === tab 
                          ? 'bg-white text-black border border-neutral-200 shadow-sm font-black' 
                          : 'text-neutral-400 hover:text-black font-semibold'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab contents */}
                <div className="flex-1 p-4 overflow-hidden flex flex-col justify-between">
                  
                  <div className="space-y-4 flex-1 overflow-hidden">
                    {activeTab === 'explanation' && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Description</h4>
                        <p className="text-sm text-neutral-800 leading-relaxed font-semibold">
                          {selectedTopic.desc}
                        </p>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">LIVE FEEDBACK</span>
                          <p className="text-xs text-neutral-700 leading-relaxed font-mono font-medium">
                            {getExplanation()}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'steps' && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Execution Steps</h4>
                        <div className="space-y-2">
                          <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                            animationStep === 0 ? 'bg-black text-white border-black' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                          }`}>
                            01. Initialize system variables and clear workspace.
                          </div>
                          <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                            animationStep === 1 ? 'bg-black text-white border-black' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                          }`}>
                            02. Input parameters validation and logic testing.
                          </div>
                          <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                            animationStep === 2 ? 'bg-black text-white border-black' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                          }`}>
                            03. Execute mathematical conversion or flowchart decision.
                          </div>
                          <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                            animationStep >= 3 ? 'bg-black text-white border-black' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                          }`}>
                            04. Format final outputs and render completed elements.
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'quiz' && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Practice Quiz</h4>
                          <span className="text-xs font-bold font-mono text-black">Score: {quizScore}</span>
                        </div>

                        <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl space-y-3">
                          <p className="text-xs font-bold leading-relaxed text-black">
                            {getQuizQuestions()[quizIndex]?.q}
                          </p>
                          <div className="space-y-1.5">
                            {getQuizQuestions()[quizIndex]?.o.map((opt, oIdx) => (
                              <button
                                key={opt}
                                onClick={() => {
                                  if (quizAnswered) return;
                                  setSelectedAnswer(oIdx);
                                  setQuizAnswered(true);
                                  if (oIdx === getQuizQuestions()[quizIndex].a) {
                                    setQuizScore(prev => prev + 1);
                                  }
                                }}
                                className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all border ${
                                  quizAnswered
                                    ? oIdx === getQuizQuestions()[quizIndex].a
                                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                      : selectedAnswer === oIdx
                                        ? 'bg-red-50 border-red-500 text-red-700'
                                        : 'bg-white border-neutral-200 text-neutral-300'
                                    : selectedAnswer === oIdx
                                      ? 'bg-black text-white border-black'
                                      : 'bg-white hover:bg-neutral-100 border-neutral-200 hover:border-black text-black'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>

                          {quizAnswered && (
                            <button
                              onClick={() => {
                                setQuizAnswered(false);
                                setSelectedAnswer(null);
                                setQuizIndex((prev) => (prev + 1) % getQuizQuestions().length);
                              }}
                              className="w-full bg-black text-white font-bold text-[10px] py-2 rounded-lg mt-2 transition-all uppercase tracking-wider"
                            >
                              Next Question
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'notes' && (
                      <div className="space-y-3 h-full flex flex-col">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">My Lab Notes</h4>
                        <textarea
                          value={userNotes}
                          onChange={(e) => setUserNotes(e.target.value)}
                          className="flex-1 w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-black focus:outline-none focus:border-black font-mono resize-none h-[180px]"
                        />
                      </div>
                    )}
                  </div>

                  {/* AI Tutor Chat overlay */}
                  {mode === 'ai-tutor' && (
                    <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl mt-3 flex flex-col space-y-2 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🤖</span>
                        <span className="text-[10px] font-bold text-black uppercase tracking-wider">AI Tutor Assistant</span>
                      </div>
                      <p className="text-[10.5px] text-neutral-600 leading-relaxed font-semibold">
                        "Notice how dividing by 2 repeatedly checks if the remainder is 1. That's why the baskets fill up systematically!"
                      </p>
                    </div>
                  )}

                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
