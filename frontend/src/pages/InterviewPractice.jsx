import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, AlertCircle, FileText, CheckCircle2, ChevronRight, Play, ArrowLeft,
  Timer, Star, Sparkles, BookOpen, Brain, MessageSquare, Award, ArrowRight,
  TrendingUp, RefreshCw, Upload, PlusCircle, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Interview Topics Database
const INTERVIEW_TOPICS = {
  'HR Interview': [
    {
      id: 'hr-1',
      title: 'Tell Me About Yourself',
      desc: 'Master the elevator pitch for introductions.',
      difficulty: 'Easy',
      questionsCount: 3,
      estimatedTime: '8 mins',
      questions: [
        {
          id: 'hrq1',
          question: 'How do you structure your self-introduction in 90 seconds?',
          type: 'HR',
          suggestedStructure: 'STAR method (Present, Past, Future): Current role/education -> Key achievement -> Why you are excited about this role.',
          commTip: 'Speak slowly, maintain a smile, and focus on achievements relevant to the target job description.',
          modelAnswer: 'Start with a brief summary of your current studies and projects, transition into 1-2 major technical achievements, and conclude by aligning your career goals with the team\'s mission.',
          explanation: 'It sets the tone of the interview and guides recruiters toward your strengths.',
          improvementTip: 'Avoid reciting your resume verbatim. Focus on the value you add.'
        }
      ]
    }
  ],
  'Technical Interview': [
    {
      id: 'tech-1',
      title: 'System Architecture',
      desc: 'Core server-client communication and cache systems.',
      difficulty: 'Hard',
      questionsCount: 3,
      estimatedTime: '15 mins',
      questions: [
        {
          id: 'techq1',
          question: 'Explain the difference between SQL database replication and partitioning.',
          type: 'Technical',
          suggestedStructure: 'Define replication (duplicate data across servers) vs partitioning (splitting table slices within servers).',
          commTip: 'Use a system diagram layout analogy to explain scale models.',
          modelAnswer: 'Replication duplicates entire datasets across hosts for high availability, while partitioning splits single tables horizontally or vertically to optimize search speed.',
          explanation: 'Replication provides redundancy; partitioning improves localized query throughput.',
          improvementTip: 'Clearly distinguish between availability and read performance.'
        }
      ]
    }
  ],
  'Java Interview': [
    {
      id: 'java-1',
      title: 'Memory Management',
      desc: 'Garbage collection cycles, stack vs heap allocations.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '10 mins',
      questions: [
        {
          id: 'javaq1',
          question: 'What is the role of Garbage Collection in Java, and how does JVM distinguish active references?',
          type: 'Technical',
          suggestedStructure: 'Discuss automated memory reclamation, Root Set tracing, and Reachability analysis.',
          commTip: 'Structure your explanation from nursery zones to old generation spaces.',
          modelAnswer: 'Garbage Collection automatically frees memory of unreferenced objects. JVM uses reachability algorithms (GC Roots) to verify if an object is still traceable from running stacks.',
          explanation: 'GC eliminates manual malloc/free actions, but introduces stop-the-world pauses.',
          improvementTip: 'Mention the difference between Minor GC and Major GC cycles.'
        }
      ]
    }
  ],
  'Python Interview': [
    {
      id: 'py-1',
      title: 'Decorators & Generators',
      desc: 'Learn closures, yield patterns, and memory efficient iterations.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '10 mins',
      questions: [
        {
          id: 'pyq1',
          question: 'What is a decorator in Python and when would you use it?',
          type: 'Technical',
          suggestedStructure: 'Explain wrapper functions, closure properties, and @syntax applications.',
          commTip: 'Emphasize the DRY (Don\'t Repeat Yourself) principle.',
          modelAnswer: 'A decorator is a function that takes another function as an argument and extends its behavior without modifying it explicitly. Used for logging, auth, and caching.',
          explanation: 'It leverages Python\'s first-class functions to achieve clean code modularity.',
          improvementTip: 'Mention how functools.wraps preserves the metadata of the original function.'
        }
      ]
    }
  ],
  'DSA Interview': [
    {
      id: 'dsa-1',
      title: 'Graph Traversals',
      desc: 'BFS and DFS applications, topological sorting models.',
      difficulty: 'Hard',
      questionsCount: 4,
      estimatedTime: '15 mins',
      questions: [
        {
          id: 'dsaq1',
          question: 'Compare Breadth-First Search (BFS) and Depth-First Search (DFS) in terms of space complexity.',
          type: 'Technical',
          suggestedStructure: 'Discuss queue storage constraints (BFS) vs recursion stack constraints (DFS).',
          commTip: 'State average case and worst case constraints clearly.',
          modelAnswer: 'BFS uses a Queue and takes O(W) space where W is max width of tree. DFS uses recursive Stack and takes O(H) space where H is height of tree.',
          explanation: 'Space usage depends on graph topology: wide graphs favor DFS; deep/thin graphs favor BFS.',
          improvementTip: 'Mention graph cycle detection using visitation markers.'
        }
      ]
    }
  ],
  'Database Interview': [
    {
      id: 'dbms-1',
      title: 'Transaction Management',
      desc: 'ACID properties, isolation levels, deadlock prevention.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '12 mins',
      questions: [
        {
          id: 'dbmsq1',
          question: 'What is transactional isolation, and what concurrency issues does it resolve?',
          type: 'Technical',
          suggestedStructure: 'Define Isolation (I in ACID). Describe read phenomena: dirty read, non-repeatable read, phantom read.',
          commTip: 'Explain using a chronological timeline execution example.',
          modelAnswer: 'Isolation ensures concurrent transactions execute without interference. Higher levels (like Serializable) prevent concurrency anomalies like Dirty Reads at the cost of execution performance.',
          explanation: 'Maintains consistent states under high concurrent client transaction rates.',
          improvementTip: 'Compare locking mechanisms vs Multi-Version Concurrency Control (MVCC).'
        }
      ]
    }
  ],
  'Aptitude': [
    {
      id: 'apt-1',
      title: 'Data Interpretation',
      desc: 'Formulate conclusions using charts, tables, and numeric trends.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '10 mins',
      questions: [
        {
          id: 'aptq1',
          question: 'How do you quickly estimate compound interest rates in logical reasoning?',
          type: 'Technical',
          suggestedStructure: 'Use baseline formulas, approximation shortcuts, and percentage rules.',
          commTip: 'Keep formulas clean and state calculation rounding assumptions.',
          modelAnswer: 'Use simple interest approximation for initial base, then add incremental compound factors based on compound cycles to skip long equations.',
          explanation: 'Helps solve questions within tight exam timers.',
          improvementTip: 'Round to nearby multiples of 5 or 10 to speed up calculations.'
        }
      ]
    }
  ],
  'Resume-Based Questions': [
    {
      id: 'res-1',
      title: 'Project Deep-Dive',
      desc: 'Justify architectural selections in your resume projects.',
      difficulty: 'Medium',
      questionsCount: 2,
      estimatedTime: '8 mins',
      questions: [
        {
          id: 'resq1',
          question: 'Why did you choose React/Node over other tech stacks in your capstone project?',
          type: 'Technical',
          suggestedStructure: 'Discuss framework selection, team skills compatibility, and database integration speed.',
          commTip: 'Express enthusiasm for the architecture and lessons learned.',
          modelAnswer: 'React offered rich client component modularity, while Node facilitated unified JavaScript syntax from database layer to user view, accelerating deployment.',
          explanation: 'Demonstrates design capability and engineering foresight.',
          improvementTip: 'Highlight real metrics like latency reductions or component reuse counts.'
        }
      ]
    }
  ]
};

import { useSearchParams } from 'react-router-dom';
export default function InterviewPractice({ onExit }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('HR Interview');
  const [topics, setTopics] = useState(INTERVIEW_TOPICS['HR Interview']);
  
  const topicId = searchParams.get('topic');
  const selectedTopic = topics.find(t => t.id === topicId) || null;
  const gameState = searchParams.get('state') || 'lobby';
  
  const setSelectedTopic = (topic) => {
    if (topic) {
      setSearchParams({ module: 'interview', topic: topic.id, state: 'lobby' });
    } else {
      setSearchParams({ module: 'interview', state: 'lobby' });
    }
  };

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submittedAnswers, setSubmittedAnswers] = useState({}); // { questionId: userAnswer }
  const [isRecording, setIsRecording] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  
  // Resume upload mock
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
  
  // Timer
  const [timerLeft, setTimerLeft] = useState(600); // 10 mins default
  const timerRef = useRef(null);

  // Scores
  const [scores, setScores] = useState({
    quality: 78,
    communication: 82,
    confidence: 80,
    practicedCount: 15,
    accuracy: 84
  });

  useEffect(() => {
    setTopics(INTERVIEW_TOPICS[selectedCategory] || []);
    setSearchParams({ module: 'interview', state: 'lobby' });
  }, [selectedCategory]);

  useEffect(() => {
    if (gameState === 'in-practice') {
      setTimerLeft(600);
      timerRef.current = setInterval(() => {
        setTimerLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const handleStartPractice = () => {
    if (!selectedTopic) return;
    setUserAnswer('');
    setSubmittedAnswers({});
    setCurrentIdx(0);
    setSearchParams({ module: 'interview', topic: selectedTopic.id, state: 'in-practice' });
  };

  const handleRecordVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate speech to text transcription
      const q = selectedTopic.questions[currentIdx];
      const mockTranscripts = {
        'hrq1': "So, when introducing myself, I usually talk about my degree first, then I tell them about my major project in React, and finally I explain that I want to join their team to build great software.",
        'techq1': "Well database partitioning divides big tables to make queries fast, but replication copies everything to other database servers to prevent data loss.",
        'javaq1': "Garbage collector scans JVM references from GC roots on execution stacks, freeing memory of dead objects while causing brief stop-the-world pauses.",
        'pyq1': "Decorators take wrappers inside Python closures, allowing us to modify method calls dynamically without editing their direct definition.",
        'dsaq1': "BFS uses a Queue and takes memory based on tree width, whereas DFS uses stack recursion frames, using memory depending on tree height.",
        'dbmsq1': "Transaction isolation levels resolve concurrency problems like dirty reads and phantom reads by managing resource locks.",
        'aptq1': "I calculate simple interest first as a benchmark, then approximate additional compound interest values.",
        'resq1': "I used React and Node because unified JavaScript makes full stack integration fast and easy."
      };
      const text = mockTranscripts[q.id] || "This is a simulated speech transcription of my answer.";
      setSpeechTranscript(text);
      setUserAnswer(text);
      toast.success("Voice transcribed successfully!");
    } else {
      setIsRecording(true);
      toast.success("Voice recording started... Speak clearly!");
    }
  };

  const handleAnswerSubmit = () => {
    if (!userAnswer.trim()) {
      toast.error("Please enter or record an answer first.");
      return;
    }
    const q = selectedTopic.questions[currentIdx];
    setSubmittedAnswers(prev => ({
      ...prev,
      [q.id]: userAnswer
    }));
    toast.success("Answer recorded!");
  };

  const handleSubmitSession = () => {
    clearInterval(timerRef.current);
    toast.success("Session completed! Reviewing feedback.");
    
    // Update stats slightly
    setScores(prev => ({
      ...prev,
      practicedCount: prev.practicedCount + selectedTopic.questions.length,
      confidence: Math.min(prev.confidence + 2, 98),
      quality: Math.min(prev.quality + 1, 95)
    }));

    setSearchParams({ module: 'interview', topic: selectedTopic.id, state: 'results' });
  };

  const handleResumeLastSession = () => {
    // Automatically select first topic and launch
    const categories = Object.keys(INTERVIEW_TOPICS);
    const cat = categories[0];
    setSelectedCategory(cat);
    const topic = INTERVIEW_TOPICS[cat][0];
    setSelectedTopic(topic);
    handleStartPractice();
    toast.success("Resumed last practice session!");
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFileName(file.name);
      setResumeUploaded(true);
      toast.success("Resume uploaded successfully! System customizer initialized.");
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (diff === 'Medium') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  return (
    <div className="quiz-arena-container h-full flex flex-col relative overflow-y-auto">
      {/* Glow backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#3b82f6]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#6366f1]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ───── LOBBY VIEW ───── */}
      {gameState === 'lobby' && (
        <div className="lobby-panel flex-1 flex flex-col justify-start">
          
          {/* Top Header Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-5 mt-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="lobby-title font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Interview Practice</h1>
              </div>
              <p className="text-slate-400 text-xs mt-1">Practice HR, technical, and mock placement interviews.</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleResumeLastSession}
                className="quiz-mode-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 hover:border-blue-500 hover:text-white"
              >
                <RefreshCw size={12} /> Resume Last
              </button>
              
              {/* Stats Chips */}
              <div className="flex gap-2">
                <div className="stat-chip bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl flex flex-col items-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Practiced</span>
                  <span className="text-xs font-extrabold text-blue-400">{scores.practicedCount}</span>
                </div>
                <div className="stat-chip bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl flex flex-col items-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Confidence</span>
                  <span className="text-xs font-extrabold text-indigo-400">{scores.confidence}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Three Column Layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            
            {/* Left Sidebar (3 columns) */}
            <div className="lg:col-span-3 flex flex-col gap-3 bg-slate-900/10 p-3 rounded-2xl border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold px-2">Interview Categories</span>
              <div className="space-y-1">
                {Object.keys(INTERVIEW_TOPICS).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      selectedCategory === category 
                        ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{category}</span>
                    <ChevronRight size={14} className={selectedCategory === category ? 'text-blue-400' : 'text-slate-600'} />
                  </button>
                ))}
              </div>

              {/* Mock Resume Upload Section */}
              <div className="mt-auto border-t border-white/5 pt-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block px-2 mb-2">Resume Scan</span>
                <label className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 transition-all cursor-pointer bg-slate-900/10">
                  <Upload size={18} className="text-blue-400 mb-1" />
                  <span className="text-[9px] text-slate-400 font-bold text-center block max-w-[120px]">
                    {resumeUploaded ? resumeFileName : 'Upload Resume (PDF)'}
                  </span>
                  <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                </label>
              </div>
            </div>

            {/* Center Main Content (6 columns) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-blue-400" /> Topics under {selectedCategory}
              </h2>
              
              <div className="space-y-3 overflow-y-auto max-h-[360px] pr-2 scrollbar-thin">
                {topics.map(topic => {
                  const isSelected = selectedTopic?.id === topic.id;
                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`quiz-card-item p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500/5' 
                          : 'border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getDifficultyColor(topic.difficulty)}`}>
                          {topic.difficulty}
                        </span>
                        <span className="text-[10px] text-slate-500">{topic.estimatedTime}</span>
                      </div>
                      
                      <h3 className="font-extrabold text-sm text-slate-100">{topic.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-1">{topic.desc}</p>
                      
                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                        <span>{topic.questionsCount} Questions</span>
                        <span className="text-blue-400 font-bold">Start Practice →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Sidebar - Analytics widget (3 columns) */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="quiz-detail-panel p-4 rounded-2xl border border-white/5 bg-slate-900/20 space-y-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Performance Summary</span>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Answer Quality</span>
                      <span className="font-bold text-blue-400">{scores.quality}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${scores.quality}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Communication</span>
                      <span className="font-bold text-indigo-400">{scores.communication}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${scores.communication}%` }} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 space-y-2">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Interview Tips</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Always use the **STAR Method** (Situation, Task, Action, Result) for behavioral answers.
                  </p>
                </div>
              </div>

              {selectedTopic && (
                <button
                  onClick={handleStartPractice}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <Play size={14} fill="white" /> Start practice session
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ───── IN-PRACTICE INTERVIEW SCREEN ───── */}
      {gameState === 'in-practice' && (
        <div className="in-practice-panel flex-1 flex flex-col justify-between p-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <span>Interview Practice</span>
                <ChevronRight size={10} />
                <span>{selectedCategory}</span>
                <ChevronRight size={10} />
                <span className="text-blue-400">{selectedTopic.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400">
                Question {currentIdx + 1} of {selectedTopic.questions.length}
              </span>
              <div className="timer-badge flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold">
                <Timer size={14} />
                <span>{formatTimer(timerLeft)}</span>
              </div>
            </div>
          </div>

          {/* Core Panel */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-0">
            
            {/* Left Main (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="quiz-question-box p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
                <span className="text-[10px] uppercase font-bold text-blue-400">Question {currentIdx + 1}</span>
                <h2 className="text-base font-extrabold text-slate-200 leading-relaxed">
                  {selectedTopic.questions[currentIdx].question}
                </h2>
              </div>

              {/* Answer input */}
              <div className="space-y-3">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your response here or click the Mic icon to simulate speech answer..."
                  className="w-full h-32 p-4 rounded-xl bg-slate-900/20 border border-white/10 text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-blue-500 resize-none"
                />

                {/* Voice Simulation Controls */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRecordVoice}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                        isRecording 
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse' 
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                      {isRecording ? 'Recording voice...' : 'Speak Answer'}
                    </button>
                    {speechTranscript && (
                      <span className="text-[10px] text-slate-500 italic">Transcribed voice input</span>
                    )}
                  </div>

                  <button
                    onClick={handleAnswerSubmit}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 cursor-pointer"
                  >
                    Submit Response
                  </button>
                </div>
              </div>

              {/* Bottom Feedback Section (renders immediately in Practice Mode) */}
              {submittedAnswers[selectedTopic.questions[currentIdx].id] && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-blue-400 text-xs flex items-center gap-1.5">
                      <Sparkles size={14} /> AI Evaluator Review
                    </div>
                    <span className="text-xs font-bold text-emerald-400">Score: 85/100</span>
                  </div>
                  
                  <div className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-slate-100">Model Answer Structure:</strong> {selectedTopic.questions[currentIdx].modelAnswer}
                  </div>

                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    <strong className="text-slate-100 font-bold">Feedback Advice:</strong> {selectedTopic.questions[currentIdx].improvementTip}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right side Tips sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="quiz-stats-sidebar p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
                <h4 className="text-[10px] text-slate-500 uppercase font-black">Practice Guides</h4>

                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] text-blue-400 uppercase font-bold block">Suggested Outline</span>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {selectedTopic.questions[currentIdx].suggestedStructure}
                    </p>
                  </div>

                  <div>
                    <span className="text-[9px] text-indigo-400 uppercase font-bold block">Communication Tips</span>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {selectedTopic.questions[currentIdx].commTip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
            <button
              disabled={currentIdx === 0}
              onClick={() => { setCurrentIdx(prev => prev - 1); setUserAnswer(submittedAnswers[selectedTopic.questions[currentIdx - 1].id] || ''); }}
              className="px-4 py-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              Previous
            </button>

            {currentIdx < selectedTopic.questions.length - 1 ? (
              <button
                onClick={() => { setCurrentIdx(prev => prev + 1); setUserAnswer(submittedAnswers[selectedTopic.questions[currentIdx + 1].id] || ''); }}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmitSession}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/25 cursor-pointer"
              >
                Complete Session
              </button>
            )}
          </div>
        </div>
      )}

      {/* ───── RESULTS SCREEN ───── */}
      {gameState === 'results' && (
        <div className="results-panel flex-1 flex flex-col justify-start p-4">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 rounded-3xl bg-slate-900/60 border border-white/5 mb-6 mt-2">
            <div className="text-center md:text-left flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/10 mx-auto md:mx-0 text-white">
                <Award size={32} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-100">Practice Session Done!</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Topic: {selectedTopic.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-black block">Answer Score</span>
                <span className="text-xl font-black text-slate-200">86/100</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-black block">Communication</span>
                <span className="text-xl font-black text-indigo-400">88%</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-black block">Confidence</span>
                <span className="text-xl font-black text-emerald-400">92%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleStartPractice}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-colors cursor-pointer"
              >
                Retake
              </button>
              <button
                onClick={() => setSelectedTopic(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-slate-300 font-extrabold text-xs transition-colors cursor-pointer"
              >
                To Lobby
              </button>
            </div>
          </div>

          {/* Strength Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5">
              <span className="text-[9px] text-emerald-400 uppercase font-black block mb-2">Technical Strengths</span>
              <p className="text-xs text-slate-300">
                You explained core architecture concepts clearly and used appropriate industry phrasing.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5">
              <span className="text-[9px] text-rose-400 uppercase font-black block mb-2">Weak Areas</span>
              <p className="text-xs text-slate-300">
                Try to decrease unnecessary pause fillers (um, like) to boost structural confidence ratings.
              </p>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Session Review</h3>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {selectedTopic.questions.map((q, idx) => {
                const answer = submittedAnswers[q.id];
                return (
                  <div key={q.id} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Question {idx + 1}</span>
                    <p className="text-sm font-bold text-slate-200">{q.question}</p>
                    
                    <div className="p-3 bg-slate-950 rounded-lg text-xs border border-white/5 space-y-1">
                      <strong className="text-blue-400 block text-[9px] uppercase">Your Response:</strong>
                      <p className="text-slate-300 leading-relaxed">{answer || 'Unanswered'}</p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-lg text-xs border border-white/5 space-y-1">
                      <strong className="text-emerald-400 block text-[9px] uppercase">Model Answer Outline:</strong>
                      <p className="text-slate-400 leading-relaxed">{q.modelAnswer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
