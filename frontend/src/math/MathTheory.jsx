import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RefreshCw, Volume2, Sparkles, AlertCircle, 
  HelpCircle, ChevronRight, CheckCircle, Award, BookOpen, 
  Activity, BarChart2, Compass, Layers, Zap, Info, ArrowRight, ArrowLeft,
  Search, RotateCcw, AlertTriangle, ArrowLeftRight, Bookmark, Edit3, Share2,
  Clock, Flame, HelpCircle as QuestionIcon, FileText, Check, X, ChevronDown, ChevronUp,
  Map, Lightbulb, GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MathTheory({ onBack }) {
  // Navigation & Sub-Tabs
  const [activeTab, setActiveTab] = useState('theory'); // 'theory', 'visual', 'examples', 'practice', 'aitutor', 'quiz', 'revision'
  const [activeTopic, setActiveTopic] = useState('calculus'); // 'calculus', 'matrices', 'numerical'

  // User Workspace States
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [progress, setProgress] = useState(35); // Animated percentage

  // 1. Expandable Cards State
  const [expandedCards, setExpandedCards] = useState({
    definition: true,
    concept: false,
    advantages: false,
    applications: false
  });

  // 2. Read Aloud Voice Engine
  const [isPlayingAloud, setIsPlayingAloud] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [voiceLang, setVoiceLang] = useState('en-US');

  // 3. Formula Explorer State
  const [selectedVar, setSelectedVar] = useState(null);

  // 4. Interactive Worked Example States
  const [exampleStep, setExampleStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [revealHint, setRevealHint] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);

  // 5. Flash Cards State
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const flashcards = [
    { front: "What is the limit definition of a derivative?", back: "f'(x) = lim (h→0) [f(x+h) - f(x)] / h. It represents the instantaneous slope rate." },
    { front: "What does the Newton-Raphson method find?", back: "It iteratively approximates the real roots of a real-valued function using tangent lines." },
    { front: "What is a matrix transformation geometrically?", back: "A linear mapping that stretches, rotates, or shears vector space basis coordinates." }
  ];

  // 6. AI Tutor Dialogue
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorResponse, setTutorResponse] = useState("Hi! I'm your interactive AI Tutor. Pick one of the quick actions below, or ask me any question about the topic.");
  const [isTutorLoading, setIsTutorLoading] = useState(false);

  // 7. Quiz Engine States
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});
  const quizQuestions = [
    { id: 1, type: 'mcq', question: "What is the derivative of f(x) = x³?", options: ["3x²", "2x³", "3x", "x²"], correct: "3x²" },
    { id: 2, type: 'tf', question: "True or False: The Bisection Method converges faster than Newton-Raphson.", options: ["True", "False"], correct: "False" },
    { id: 3, type: 'fib', question: "Substitute x=2 into the derivative of f(x)=x². The value is ____.", correct: "4" }
  ];

  // 8. Visual Plotter Coefficients
  const [coeffA, setCoeffA] = useState(1);
  const [coeffC, setCoeffC] = useState(0);

  // 9. Revision Intervals
  const [revisionInterval, setRevisionInterval] = useState('30s');

  const toggleExpand = (card) => {
    setExpandedCards(prev => ({ ...prev, [card]: !prev[card] }));
  };

  const handleTutorAction = (actionType) => {
    setIsTutorLoading(true);
    setTutorResponse("");
    setTimeout(() => {
      if (actionType === 'simple') {
        setTutorResponse("Think of a derivative like the speedometer in a car. Instead of looking at average speed over the whole trip (average rate), the speedometer tells you exactly how fast you are going at one single instant (instantaneous rate).");
      } else if (actionType === 'visual') {
        setTutorResponse("Imagine a curve. Place two points on it and draw a line. As you drag the second point closer and closer to the first, that line tilts and eventually touches the curve at just one point. That's the tangent line—its slope is the derivative!");
      } else if (actionType === 'math') {
        setTutorResponse("Formally: f'(x) = lim_{h → 0} [f(x+h) - f(x)] / h. We evaluate the ratio of vertical change (dy) to horizontal change (dx) as the horizontal interval approaches zero.");
      } else {
        setTutorResponse("For f(x) = x², f(x+h) = (x+h)². The numerator becomes x² + 2xh + h² - x² = 2xh + h². Divide by h to get 2x + h. As h goes to 0, only 2x remains!");
      }
      setIsTutorLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      
      {/* HEADER SECTION (Breadcrumb | Title | Difficulty | Estimated Time) */}
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-100 shrink-0 shadow-sm relative z-25">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-black text-slate-500 hover:text-slate-950 transition uppercase tracking-wider bg-transparent border-0 cursor-pointer"
          >
            <ArrowLeft size={14} strokeWidth={2.5} /> Back
          </button>
          <span className="text-slate-200">|</span>
          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            <span>Calculus</span>
            <ChevronRight size={12} />
            <span className="font-extrabold text-slate-800">Derivatives</span>
          </div>
          <span className="text-slate-200">|</span>
          <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-[10px] uppercase">Medium Difficulty</span>
          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Clock size={12} /> 25 mins estimated
          </span>
        </div>

        {/* Workspace Quick Actions */}
        <div className="flex items-center gap-4">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-emerald-500" />
            </div>
            <span className="text-xs font-black text-slate-700">{progress}%</span>
          </div>

          <button 
            onClick={() => { setIsBookmarked(!isBookmarked); toast.success(isBookmarked ? 'Bookmark removed' : 'Topic bookmarked'); }}
            className={`p-2 rounded-xl border transition ${isBookmarked ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-transparent border-slate-200 hover:bg-slate-50 text-slate-400'}`}
          >
            <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
          
          <button 
            onClick={() => setShowNotesPanel(!showNotesPanel)}
            className={`p-2 rounded-xl border transition ${showNotesPanel ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-transparent border-slate-200 hover:bg-slate-50 text-slate-400'}`}
          >
            <Edit3 size={15} />
          </button>

          <button 
            onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied to clipboard!'); }}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 transition"
          >
            <Share2 size={15} />
          </button>
        </div>
      </header>

      {/* TOP NAVIGATION TABS SWITCHER */}
      <nav className="h-12 bg-white border-b border-slate-150 shrink-0 flex items-center px-6 overflow-x-auto scrollbar-none gap-2">
        {[
          { id: 'theory', label: '📖 Theory Guide' },
          { id: 'visual', label: '📊 Visual Sandbox' },
          { id: 'examples', label: '✍️ Worked Examples' },
          { id: 'practice', label: '⚡ Interactive Practice' },
          { id: 'aitutor', label: '🤖 AI Tutor Bot' },
          { id: 'quiz', label: '🎯 Concept Check Quiz' },
          { id: 'revision', label: '🔄 Quick Revision' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 h-full text-xs font-extrabold transition-all border-b-2 whitespace-nowrap cursor-pointer uppercase tracking-wider ${activeTab === t.id ? 'border-emerald-500 text-emerald-600 bg-emerald-50/20' : 'border-transparent text-slate-500 hover:text-slate-850 hover:border-slate-300 bg-transparent'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* MAIN WORKSPACE CONTENT */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT COMPONENT WORKSPACE CANVAS */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* TAB: THEORY GUIDE */}
            {activeTab === 'theory' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* Introduction & Value Pitch */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">Introduction</span>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Instantaneous Rate of Change: The Derivative</h2>
                  <p className="text-sm text-slate-650 leading-relaxed font-medium">
                    How do we calculate speed at an exact snapshot moment? Ordinary algebra fails us because division by zero is mathematically impossible. A derivative bridges this gap by shrinking the boundary interval until it converges to zero.
                  </p>
                </div>

                {/* Read Aloud Controller */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsPlayingAloud(!isPlayingAloud)}
                      className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition active:scale-95 shadow-sm border-0 cursor-pointer"
                    >
                      {isPlayingAloud ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Theory Reader</span>
                      <span className="text-xs font-extrabold text-slate-850">Read Aloud Classroom Assistant</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      value={voiceSpeed}
                      onChange={e => setVoiceSpeed(parseFloat(e.target.value))}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none"
                    >
                      <option value="0.75">0.75x</option>
                      <option value="1">1.0x</option>
                      <option value="1.5">1.5x</option>
                    </select>
                  </div>
                </div>

                {/* Interactive Notion-style Expandable Cards */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Interactive Concept Breakdown</h3>
                  
                  {/* Card: Definition */}
                  <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm transition hover:border-slate-350">
                    <button 
                      onClick={() => toggleExpand('definition')}
                      className="w-full px-6 py-4 flex items-center justify-between font-extrabold text-sm text-slate-800 bg-transparent border-0 cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <BookOpen size={16} className="text-emerald-500" /> Defining the Tangent Limit
                      </span>
                      {expandedCards.definition ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <AnimatePresence>
                      {expandedCards.definition && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-6 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 font-medium">
                            The tangent line touches a function curve at precisely one boundary coordinate point. The slope of this line represents the first derivative.
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Card: Advantages */}
                  <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm transition hover:border-slate-350">
                    <button 
                      onClick={() => toggleExpand('advantages')}
                      className="w-full px-6 py-4 flex items-center justify-between font-extrabold text-sm text-slate-800 bg-transparent border-0 cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Zap size={16} className="text-emerald-500" /> Key Applications & Advantages
                      </span>
                      {expandedCards.advantages ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <AnimatePresence>
                      {expandedCards.advantages && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-6 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 font-medium">
                            Enables real-time optimization calculations, trajectory planning, speed predictions, physics modeling, and gradient descent inside deep learning neural network layers.
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Formula Explorer Block */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">Interactive Formula Explorer</span>
                  <h3 className="text-sm font-extrabold text-slate-850 mt-4 mb-2">Click any symbol below to examine its mathematical role:</h3>
                  
                  <div className="flex items-center justify-center p-8 bg-slate-50 border border-slate-150 rounded-xl text-xl font-mono text-slate-700 gap-1 select-none">
                    <span 
                      onClick={() => setSelectedVar('fprime')}
                      className={`cursor-pointer px-2.5 py-1 rounded font-black transition ${selectedVar === 'fprime' ? 'bg-emerald-500 text-white' : 'hover:bg-slate-200'}`}
                    >
                      f'(x)
                    </span>
                    <span>=</span>
                    <span 
                      onClick={() => setSelectedVar('lim')}
                      className={`cursor-pointer px-2.5 py-1 rounded font-black flex flex-col items-center leading-none transition ${selectedVar === 'lim' ? 'bg-emerald-500 text-white' : 'hover:bg-slate-200'}`}
                    >
                      <span>lim</span>
                      <span className="text-[9px] mt-0.5">h → 0</span>
                    </span>
                    
                    <div className="flex flex-col items-center ml-2 border-l border-slate-350 pl-2">
                      <span 
                        onClick={() => setSelectedVar('delta')}
                        className={`cursor-pointer px-2.5 py-1 rounded font-black border-b-2 border-slate-650 transition ${selectedVar === 'delta' ? 'bg-emerald-500 text-white' : 'hover:bg-slate-200'}`}
                      >
                        f(x + h) − f(x)
                      </span>
                      <span 
                        onClick={() => setSelectedVar('h')}
                        className={`cursor-pointer px-2.5 py-1 rounded font-black transition ${selectedVar === 'h' ? 'bg-emerald-500 text-white' : 'hover:bg-slate-200'}`}
                      >
                        h
                      </span>
                    </div>
                  </div>

                  {/* Explorer Explanation Panel */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-650 text-center min-h-[60px] flex items-center justify-center font-medium">
                    {selectedVar === 'fprime' && <p><strong>f'(x)</strong> represents the output derivative function representing slope dynamics at point x.</p>}
                    {selectedVar === 'lim' && <p><strong>Limit boundary</strong> represents interval projection when h approaches infinitely small ranges.</p>}
                    {selectedVar === 'delta' && <p><strong>f(x+h) - f(x)</strong> is the change in the output y values across horizontal interval width h.</p>}
                    {selectedVar === 'h' && <p><strong>h</strong> is the step coordinate increment interval along the horizontal x axis.</p>}
                    {!selectedVar && <p className="text-slate-450 font-semibold font-sans">Click on variables above to display dynamic visual breakdowns.</p>}
                  </div>
                </div>

                {/* Real-world applications grid */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Real-world applications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block mb-1">Machine learning</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">Backpropagation adjusts weight matrices variables using partial derivatives to minimize network prediction error margins.</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block mb-1">Computer graphics</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">Calculates surface tangents vectors and shading gradients vectors for authentic illumination shadows effects.</p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB: VISUAL SANDBOX */}
            {activeTab === 'visual' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">Interactive Geometry Graph</span>
                  <h2 className="text-base font-extrabold mt-3 text-slate-850">Live Tangent Parameterization Plotter</h2>
                  <p className="text-xs text-slate-500 mt-1 mb-5">Change parameters coefficient coefficients and watch the tangent slope evaluate dynamically.</p>
                  
                  {/* Desmos Simulation plot grid */}
                  <div className="h-[280px] bg-slate-950 border border-slate-850 rounded-xl relative overflow-hidden flex items-center justify-center p-4">
                    <svg className="w-full h-full absolute inset-0 opacity-10 pointer-events-none">
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                    
                    <svg viewBox="0 0 200 200" className="w-full h-full relative z-10">
                      <line x1="100" y1="0" x2="100" y2="200" stroke="#475569" strokeWidth="1.5" strokeDasharray="3" />
                      <line x1="0" y1="100" x2="200" y2="100" stroke="#475569" strokeWidth="1.5" strokeDasharray="3" />
                      
                      {/* Parabola curve */}
                      <path d="M 40 40 Q 100 160 160 40" fill="none" stroke="#10B981" strokeWidth="2.5" />
                      
                      {/* Dynamic Tangent line */}
                      <line x1="60" y1={140 - coeffC*10} x2="140" y2={60 - coeffC*10} stroke="#3B82F6" strokeWidth="2" />
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <span className="text-xs font-bold text-slate-700">Slope Width</span>
                      <input 
                        type="range" min="1" max="5" step="0.5" 
                        value={coeffA} onChange={e => setCoeffA(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700">Vertical Shift</span>
                      <input 
                        type="range" min="-3" max="3" step="1" 
                        value={coeffC} onChange={e => setCoeffC(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: WORKED EXAMPLES */}
            {activeTab === 'examples' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">Worked Example</span>
                  <h2 className="text-lg font-black mt-3 text-slate-850">Find the derivative of f(x) = x² at x=3</h2>
                  
                  {/* Staggered worked steps */}
                  <div className="space-y-4 mt-6">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 1: Choose Formula</span>
                      <p className="text-xs font-bold font-mono mt-1 text-slate-850">f'(x) = 2x (using general power rule constants)</p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 2: Substitute Values</span>
                      <p className="text-xs font-bold font-mono mt-1 text-slate-850">f'(3) = 2 * (3)</p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 3: Solve Result</span>
                      <p className="text-xs font-bold font-mono mt-1 text-emerald-600">f'(3) = 6</p>
                    </div>
                  </div>

                  {/* AI Insight Box */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl mt-6">
                    <h4 className="text-xs font-black text-emerald-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Lightbulb size={14} /> AI Insight Explanation
                    </h4>
                    <p className="text-xs text-slate-650 leading-relaxed mt-2 font-medium">
                      At domain coordinate point x=3, the slope of the tangent line touching the curve is exactly 6. This means for every unit we increment horizontally, the output height increments by 6 units locally.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: INTERACTIVE PRACTICE */}
            {activeTab === 'practice' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">Interactive Practice</span>
                  <h3 className="text-sm font-extrabold text-slate-850 mt-4 mb-2">Practice Exercise:</h3>
                  <p className="text-xs text-slate-500 mb-4 font-medium">Given the curve f(x) = x², find the tangent slope at coordinate point x=4.</p>
                  
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Enter numerical solution..." 
                      value={userAnswer}
                      onChange={e => setUserAnswer(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-850 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (userAnswer.trim() === '8') {
                            setFeedbackMsg("Correct! Excellent work. The derivative yields f'(x)=2x. For x=4, 2(4)=8.");
                          } else {
                            setFeedbackMsg("Incorrect. Review your formula steps again. Try derivative coefficient rules.");
                          }
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow-sm border-0 cursor-pointer"
                      >
                        Check Answer
                      </button>
                      <button 
                        onClick={() => setRevealHint(!revealHint)}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition active:scale-95 border-0 cursor-pointer"
                      >
                        Reveal Hint
                      </button>
                    </div>

                    {revealHint && (
                      <p className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200/50 p-3 rounded-lg leading-relaxed">
                        Hint: First find f'(x) for f(x)=x², then substitute x=4.
                      </p>
                    )}

                    {feedbackMsg && (
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 text-xs text-slate-750 rounded-xl font-medium leading-relaxed">
                        {feedbackMsg}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: AI TUTOR BOT */}
            {activeTab === 'aitutor' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">AI Tutor Interface</span>
                  
                  <div className="min-h-[140px] p-5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs leading-relaxed text-slate-700 mt-4 font-medium">
                    {isTutorLoading ? (
                      <div className="flex items-center justify-center h-full gap-2">
                        <RotateCcw className="animate-spin text-emerald-500" size={16} />
                        <span>AI Tutor is writing explanation...</span>
                      </div>
                    ) : (
                      <p>{tutorResponse}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-5">
                    <button 
                      onClick={() => handleTutorAction('simple')}
                      className="py-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-xs font-extrabold text-slate-700 transition cursor-pointer"
                    >
                      Simple English
                    </button>
                    <button 
                      onClick={() => handleTutorAction('visual')}
                      className="py-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-xs font-extrabold text-slate-700 transition cursor-pointer"
                    >
                      Explain Visually
                    </button>
                    <button 
                      onClick={() => handleTutorAction('math')}
                      className="py-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-xs font-extrabold text-slate-700 transition cursor-pointer"
                    >
                      Explain Mathematically
                    </button>
                    <button 
                      onClick={() => handleTutorAction('example')}
                      className="py-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-xs font-extrabold text-slate-700 transition cursor-pointer"
                    >
                      Give Another Example
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: CONCEPT CHECK QUIZ */}
            {activeTab === 'quiz' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">Quiz Mode</span>
                  
                  <div className="space-y-6 mt-4">
                    {quizQuestions.map((q, qIdx) => (
                      <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question {qIdx + 1}</span>
                        <p className="text-xs font-extrabold text-slate-800">{q.question}</p>
                        
                        {q.type === 'fib' ? (
                          <input 
                            type="text"
                            placeholder="Type answer..."
                            value={selectedQuizAnswers[q.id] || ''}
                            onChange={e => setSelectedQuizAnswers({...selectedQuizAnswers, [q.id]: e.target.value})}
                            className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
                          />
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map(opt => (
                              <button
                                key={opt}
                                onClick={() => setSelectedQuizAnswers({...selectedQuizAnswers, [q.id]: opt})}
                                className={`px-4 py-2 text-left rounded-lg text-xs font-extrabold border transition ${selectedQuizAnswers[q.id] === opt ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <button 
                      onClick={() => {
                        let score = 0;
                        quizQuestions.forEach(q => {
                          if ((selectedQuizAnswers[q.id] || '').trim().toLowerCase() === q.correct.toLowerCase()) {
                            score++;
                          }
                        });
                        setQuizScore(score);
                        setQuizSubmitted(true);
                        toast.success('Quiz score submitted!');
                      }}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition active:scale-95 border-0 cursor-pointer shadow-sm"
                    >
                      Submit Quiz Answers
                    </button>

                    {quizSubmitted && (
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 text-xs font-extrabold text-emerald-800 rounded-xl text-center">
                        Your Score: {quizScore} / {quizQuestions.length} ({(quizScore/quizQuestions.length*100).toFixed(0)}%)
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: QUICK REVISION */}
            {activeTab === 'revision' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                {/* 1. Revision Mode Segment tabs */}
                <div className="flex gap-2 p-1 bg-slate-100 border border-slate-200 rounded-xl max-w-sm">
                  {['30s', '2m', '5m'].map(sec => (
                    <button
                      key={sec}
                      onClick={() => setRevisionInterval(sec)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-0 ${revisionInterval === sec ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
                    >
                      {sec} Notes
                    </button>
                  ))}
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs leading-relaxed text-slate-700 font-medium">
                  {revisionInterval === '30s' && <p><strong>30-Second Summary:</strong> The derivative measures instantaneous rate of change and represents the tangent slope. Calculated using lim (h→0) [f(x+h) - f(x)] / h.</p>}
                  {revisionInterval === '2m' && <p><strong>2-Minute Revision:</strong> Calculus revolves around rates. Newton-Raphson approximates equation solutions iteratively. Mind maps connect polynomial limits to differentiation systems.</p>}
                  {revisionInterval === '5m' && <p><strong>5-Minute Overview:</strong> Detailed review checklist covers standard limits, power rules, matrix determinant coordinate shifts, trapezoidal integration grids, and error debugging margins.</p>}
                </div>

                {/* 2. Interactive Flash Cards */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">Interactive Flashcard Deck</span>
                  
                  <div className="flex flex-col items-center mt-6">
                    <div 
                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      className="w-full max-w-sm h-40 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center p-6 text-center cursor-pointer shadow-sm select-none"
                    >
                      {!flashcardFlipped ? (
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 block mb-1">Question</span>
                          <p className="text-sm font-extrabold text-slate-800">{flashcards[flashcardIdx].front}</p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 block mb-1">Answer explanation</span>
                          <p className="text-xs font-bold text-slate-650 leading-relaxed">{flashcards[flashcardIdx].back}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => { setFlashcardIdx(prev => (prev - 1 + flashcards.length) % flashcards.length); setFlashcardFlipped(false); }}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
                      >
                        Prev Card
                      </button>
                      <button
                        onClick={() => { setFlashcardIdx(prev => (prev + 1) % flashcards.length); setFlashcardFlipped(false); }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Next Card
                      </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

          </div>
        </div>

        {/* RIGHT SIDEBAR COMPONENT PANEL: Bookmark / Notes Widget */}
        {showNotesPanel && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            className="w-[320px] bg-white border-l border-slate-200 shrink-0 flex flex-col p-6 h-full shadow-lg relative z-20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Edit3 size={15} className="text-emerald-500" /> Student Notes Pad
              </h3>
              <button 
                onClick={() => setShowNotesPanel(false)}
                className="text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer"
              >
                Close
              </button>
            </div>
            <textarea
              placeholder="Jot down notes, derivations, formulas or questions here..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none leading-relaxed"
            />
            <button 
              onClick={() => {
                const element = document.createElement("a");
                const file = new Blob([notes], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = "MathTheoryNotes.txt";
                document.body.appendChild(element);
                element.click();
                toast.success('Notes exported successfully!');
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl mt-4 active:scale-95 transition cursor-pointer border-0"
            >
              Export Notes to .txt
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
