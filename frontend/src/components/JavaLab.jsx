import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Play, Code, CheckCircle, HelpCircle, FileText,
  ChevronRight, Award, Compass, Flame, TrendingUp, PlayCircle,
  Code2, Terminal, Info, RefreshCw, Layers, Database, Zap,
  BrainCircuit, ShieldAlert, Sparkles, Star, Trophy
} from 'lucide-react';
import './JavaLab.css';

// ═══════════════════════════════════════════════════════════
// JAVA MODULES DATA
// ═══════════════════════════════════════════════════════════
const JAVA_MODULES = [
  {
    id: 1,
    title: 'Java Fundamentals',
    description: 'Master variables, data types, JVM internals, and basic input/output.',
    difficulty: 'Beginner',
    duration: '45 mins',
    xp: 100,
    accent: '#3B82F6',
    icon: Compass,
    progress: 100,
    topics: [
      { title: 'Introduction to Java', content: 'Java is a class-based, object-oriented programming language designed to have as few implementation dependencies as possible. It is write once, run anywhere (WORA).' },
      { title: 'JDK, JRE, JVM', content: 'JDK (Java Development Kit) is the development environment. JRE (Java Runtime Environment) provides the libraries and JVM to execute. JVM (Java Virtual Machine) executes the bytecode.' },
      { title: 'Variables & Data Types', content: 'Java has primitive types (int, float, double, char, boolean, etc.) and reference types (Strings, Arrays, Objects).' },
      { title: 'Operators', content: 'Arithmetic, relational, logical, bitwise, assignment, and ternary operators.' },
      { title: 'Input / Output', content: 'Reading input using Scanner or BufferedReader, and outputting via System.out.println().' }
    ]
  },
  {
    id: 2,
    title: 'Control Flow',
    description: 'Master conditionals, switch statements, and loop controls.',
    difficulty: 'Beginner',
    duration: '40 mins',
    xp: 120,
    accent: '#06B6D4',
    icon: Zap,
    progress: 100,
    topics: [
      { title: 'if / else', content: 'Conditional branch execution based on boolean expressions.' },
      { title: 'switch statement', content: 'Multi-way branching based on equality check of values.' },
      { title: 'for loop', content: 'Iteration structures when the number of cycles is known beforehand.' },
      { title: 'while & do-while', content: 'Pre-condition and post-condition loop controls.' },
      { title: 'break & continue', content: 'Alter loop flows: break exits a loop completely, continue jumps to next iteration.' }
    ]
  },
  {
    id: 3,
    title: 'Methods, Arrays & Strings',
    description: 'Write modular functions and manipulate multi-dimensional sequences.',
    difficulty: 'Beginner',
    duration: '50 mins',
    xp: 150,
    accent: '#14B8A6',
    icon: Code2,
    progress: 100,
    topics: [
      { title: 'Methods & Parameters', content: 'Defining functional blocks with return values and parameter list.' },
      { title: 'Method Overloading', content: 'Declaring multiple methods with same name but different signatures.' },
      { title: 'Arrays & 2D Arrays', content: 'Indexed collections of elements of the same type. Matrix structures.' },
      { title: 'Strings & StringBuilder', content: 'String is immutable. StringBuilder provides a mutable sequence of characters for optimal updates.' },
      { title: 'Recursion Basics', content: 'Methods calling themselves with base terminating conditions.' }
    ]
  },
  {
    id: 4,
    title: 'OOP Concepts',
    description: 'Classes, Objects, Inheritance, Polymorphism, Abstraction & Interfaces.',
    difficulty: 'Intermediate',
    duration: '90 mins',
    xp: 250,
    accent: '#8B5CF6',
    icon: Award,
    progress: 80,
    topics: [
      { title: 'Classes & Objects', content: 'Class is a blueprint. Object is an instance of a class containing state and behavior.' },
      { title: 'Constructors', content: 'Special methods invoked during instantiation to initialize variables.' },
      { title: 'Encapsulation', content: 'Hiding object internals using private variables and public getter/setter methods.' },
      { title: 'Inheritance & Polymorphism', content: 'IS-A relationship using extends. Overriding methods dynamically at runtime.' },
      { title: 'Abstraction & Interfaces', content: 'Defining contract methods using interfaces and abstract classes.' }
    ]
  },
  {
    id: 5,
    title: 'Exception Handling',
    description: 'Build robust applications using try, catch, finally, and custom exceptions.',
    difficulty: 'Intermediate',
    duration: '40 mins',
    xp: 120,
    accent: '#F97316',
    icon: ShieldAlert,
    progress: 60,
    topics: [
      { title: 'try-catch blocks', content: 'Intercepting throwables and preventing application crashes.' },
      { title: 'finally block', content: 'Executing cleanup operations regardless of whether exceptions were raised.' },
      { title: 'throw vs throws', content: 'throw triggers an exception. throws declares check exceptions in method signatures.' },
      { title: 'Custom Exceptions', content: 'Extending Exception or RuntimeException to create business-specific faults.' }
    ]
  },
  {
    id: 6,
    title: 'Collections Framework',
    description: 'ArrayList, LinkedList, Lists, Maps, Sets, and Iterator classes.',
    difficulty: 'Intermediate',
    duration: '80 mins',
    xp: 300,
    accent: '#10B981',
    icon: Layers,
    progress: 40,
    topics: [
      { title: 'List (ArrayList & LinkedList)', content: 'Dynamic indexing. ArrayList uses dynamic arrays. LinkedList uses double-linked nodes.' },
      { title: 'Set (HashSet & TreeSet)', content: 'Collections preventing duplicate elements. TreeSet maintains sorted order.' },
      { title: 'Map (HashMap & TreeMap)', content: 'Key-value maps. HashMap uses hashing. TreeMap uses red-black tree hierarchy.' }
    ]
  },
  {
    id: 7,
    title: 'File Handling',
    description: 'Read and write disk files using streams, writers, and serialization.',
    difficulty: 'Intermediate',
    duration: '45 mins',
    xp: 150,
    accent: '#64748B',
    icon: FileText,
    progress: 25,
    topics: [
      { title: 'Reader & Writer classes', content: 'FileReader and FileWriter for character stream operations.' },
      { title: 'Buffered Stream buffers', content: 'BufferedReader and BufferedWriter for optimal disk reading/writing.' },
      { title: 'Serialization', content: 'Writing object states to byte streams via Serializable interfaces.' }
    ]
  },
  {
    id: 8,
    title: 'Multithreading',
    description: 'Concurrent runtimes, thread lifecycles, synchronization, and executors.',
    difficulty: 'Advanced',
    duration: '90 mins',
    xp: 350,
    accent: '#F59E0B',
    icon: Zap,
    progress: 10,
    topics: [
      { title: 'Thread Class & Runnable', content: 'Creating threads by extending Thread or implementing Runnable.' },
      { title: 'Thread Lifecycle', content: 'New, Runnable, Blocked, Waiting, Timed Waiting, Terminated.' },
      { title: 'Synchronization & Locks', content: 'Using synchronized keywords and reentrant locks to prevent race conditions.' },
      { title: 'Deadlock', content: 'Circular wait blocks when multiple threads lock dependent resources.' }
    ]
  },
  {
    id: 9,
    title: 'GUI Programming',
    description: 'Build rich windows using Abstract Window Toolkit (AWT) and Swing.',
    difficulty: 'Intermediate',
    duration: '70 mins',
    xp: 300,
    accent: '#EC4899',
    icon: PlayCircle,
    progress: 0,
    topics: [
      { title: 'AWT Components', content: 'Operating system native widgets: Frame, Panel, Label, Button.' },
      { title: 'Swing Components', content: 'Platform independent widgets: JFrame, JPanel, JButton, JTable.' },
      { title: 'Event Handlers', content: 'Interceptors for user activity: ActionListener, MouseListener, KeyListener.' }
    ]
  },
  {
    id: 10,
    title: 'Applets',
    description: 'Legacy web-embedded graphics, lifecycle states, and draw routines.',
    difficulty: 'Optional',
    duration: 'Legacy',
    xp: 80,
    accent: '#9CA3AF',
    icon: Info,
    progress: 0,
    legacy: true,
    topics: [
      { title: 'Applet Lifecycle', content: 'Applets run inside browser wrappers. Standard hooks: init(), start(), paint(), stop(), destroy().' }
    ]
  },
  {
    id: 11,
    title: 'Networking Basics',
    description: 'Implement client/server sockets and fetch URL connection streams.',
    difficulty: 'Advanced',
    duration: '60 mins',
    xp: 250,
    accent: '#6366F1',
    icon: Compass,
    progress: 0,
    topics: [
      { title: 'Socket & ServerSocket', content: 'Establishing two-way TCP connections between hosts.' },
      { title: 'URL Connections', content: 'Fetching web resources and parsing headers programmatically.' }
    ]
  },
  {
    id: 12,
    title: 'JDBC Basics',
    description: 'Connect databases, compile statements, and scan cursors.',
    difficulty: 'Advanced',
    duration: '60 mins',
    xp: 300,
    accent: '#7C3AED',
    icon: Database,
    progress: 0,
    topics: [
      { title: 'Connection & PreparedStatement', content: 'Registering drivers, configuring endpoints, and binding query wildcards.' },
      { title: 'ResultSet Cursors', content: 'Scanning database queries dynamically and closing streams.' }
    ]
  },
  {
    id: 13,
    title: 'DSA with Java',
    description: 'Implement searching, sorting, linked lists, and tree structures in Java.',
    difficulty: 'Advanced',
    duration: '120 mins',
    xp: 500,
    accent: '#EF4444',
    icon: BrainCircuit,
    progress: 0,
    topics: [
      { title: 'Linked List implementation', content: 'Implementing dynamic single/double linked lists using node links.' },
      { title: 'Stack & Queue structures', content: 'LIFO and FIFO operations, node pointers, and collections mappings.' },
      { title: 'Binary Trees', content: 'Hierarchical node traversal: pre-order, in-order, post-order, and insert/delete operations.' }
    ]
  },
  {
    id: 14,
    title: 'Practice Hub',
    description: 'Solve daily code challenges, earn badges, and maintain streaks.',
    difficulty: 'Optional',
    duration: 'Daily',
    xp: 200,
    accent: '#0EA5E9',
    icon: Star,
    progress: 0,
    features: ['Daily Challenges', 'Timed Coding', 'AI Hints', 'Streak Rewards']
  },
  {
    id: 15,
    title: 'Quiz Arena',
    description: 'Compete in weekly leaderboards and test your skills.',
    difficulty: 'Optional',
    duration: 'Weekly',
    xp: 250,
    accent: '#F43F5E',
    icon: Trophy,
    progress: 0,
    features: ['Topic-wise Quizzes', 'Mock Tests', 'Leaderboards', 'XP Rewards']
  },
  {
    id: 16,
    title: 'Projects Lab',
    description: 'Build portfolio projects: Student Registry, Banking, and Chat application.',
    difficulty: 'Optional',
    duration: 'Portfolio',
    xp: 400,
    accent: '#22C55E',
    icon: Code,
    progress: 0,
    features: ['Calculator', 'Student Management System', 'Chat Application']
  },
  {
    id: 17,
    title: 'Progress Tracker',
    description: 'Detailed metrics of your accuracy, strength, and weak points.',
    difficulty: 'Optional',
    duration: 'Analytics',
    xp: 150,
    accent: '#8B5CF6',
    icon: TrendingUp,
    progress: 0,
    features: ['Topic Completion', 'XP Earned', 'Accuracy', 'Study Streak']
  }
];

export default function JavaLab() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeTab, setActiveTab] = useState('learn'); // 'learn', 'visualize', 'code', 'practice', 'quiz', 'notes'
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(0);
  const [userCode, setUserCode] = useState(`public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, EduVerse!");\n  }\n}`);
  const [consoleOutput, setConsoleOutput] = useState('Click "Run Code" to compile...');
  const [vizStep, setVizStep] = useState(0);
  const [showAiHint, setShowAiHint] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // MOCK COMPILER RUN
  const handleRunCode = () => {
    setConsoleOutput('Compiling App.java...\nLinking binaries...\nExecuting main method...\n\nHello, EduVerse!\n\nProcess completed (0ms)');
  };

  const handleOpenModule = (mod) => {
    setSelectedModule(mod);
    setSelectedTopicIdx(0);
    setActiveTab('learn');
    setVizStep(0);
    setQuizScore(null);
    setSelectedAnswer(null);
    setShowAiHint(false);
    
    // Set default mock code based on module
    if (mod.id === 1) {
      setUserCode(`public class Main {\n  public static void main(String[] args) {\n    int a = 5;\n    int b = 10;\n    System.out.println("Sum is: " + (a + b));\n  }\n}`);
    } else if (mod.id === 2) {
      setUserCode(`public class Loops {\n  public static void main(String[] args) {\n    for (int i = 1; i <= 5; i++) {\n      System.out.println("Count: " + i);\n    }\n  }\n}`);
    } else {
      setUserCode(`public class App {\n  public static void main(String[] args) {\n    System.out.println("Executing " + "${mod.title}");\n  }\n}`);
    }
  };

  // MOCK QUIZ DATA
  const mockQuiz = {
    question: "Which component of Java is responsible for executing bytecode class files?",
    options: [
      { id: 'a', text: 'JDK' },
      { id: 'b', text: 'JRE' },
      { id: 'c', text: 'JVM' },
      { id: 'd', text: 'JIT Compiler' }
    ],
    correct: 'c',
    explanation: 'JVM (Java Virtual Machine) acts as the engine that runs Java class bytecode files compiled by javac.'
  };

  const handleAnswerSubmit = (optionId) => {
    setSelectedAnswer(optionId);
    if (optionId === mockQuiz.correct) {
      setQuizScore(100);
    } else {
      setQuizScore(0);
    }
  };

  // SVG Visualizations rendering
  const renderVisualizer = () => {
    if (selectedModule.id === 13 || selectedModule.title.includes('DSA')) {
      // Linked List Visualization
      return (
        <div className="viz-box">
          <h4 className="text-sm font-bold mb-4 text-[var(--db-text-main)]">Singly Linked List Execution State</h4>
          <svg viewBox="0 0 500 150" className="w-full max-h-[140px]">
            {/* Node 1 */}
            <rect x="20" y="40" width="80" height="50" rx="8" fill="var(--db-card-bg-elevated)" stroke="#3B82F6" strokeWidth="2" />
            <text x="60" y="65" textAnchor="middle" fill="var(--db-text-main)" fontWeight="bold" fontSize="12">Data: 10</text>
            <text x="60" y="82" textAnchor="middle" fill="#3B82F6" fontSize="10">Next: Node2</text>
            
            {/* Arrow 1 */}
            <path d="M 100 65 L 140 65" fill="none" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrow)" />
            
            {/* Node 2 */}
            <rect x="150" y="40" width="80" height="50" rx="8" fill="var(--db-card-bg-elevated)" stroke="#8B5CF6" strokeWidth="2" />
            <text x="190" y="65" textAnchor="middle" fill="var(--db-text-main)" fontWeight="bold" fontSize="12">Data: 20</text>
            <text x="190" y="82" textAnchor="middle" fill="#8B5CF6" fontSize="10">Next: Node3</text>
            
            {/* Arrow 2 */}
            <path d="M 230 65 L 270 65" fill="none" stroke="#8B5CF6" strokeWidth="2" markerEnd="url(#arrow)" />
            
            {/* Node 3 */}
            <rect x="280" y="40" width="80" height="50" rx="8" fill="var(--db-card-bg-elevated)" stroke="#10B981" strokeWidth="2" />
            <text x="320" y="65" textAnchor="middle" fill="var(--db-text-main)" fontWeight="bold" fontSize="12">Data: 30</text>
            <text x="320" y="82" textAnchor="middle" fill="#10B981" fontSize="10">Next: null</text>

            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
              </marker>
            </defs>
          </svg>
          <div className="flex gap-4 mt-2 justify-center">
            <span className="text-xs text-[var(--db-text-muted)]"><b className="text-[#3B82F6]">Head:</b> Node 1</span>
            <span className="text-xs text-[var(--db-text-muted)]"><b className="text-[#10B981]">Tail:</b> Node 3</span>
            <span className="text-xs text-[var(--db-text-muted)]"><b>Length:</b> 3</span>
          </div>
        </div>
      );
    }

    if (selectedModule.id === 8 || selectedModule.title.includes('Multithreading')) {
      // Thread Lifecycle Visualization
      return (
        <div className="viz-box">
          <h4 className="text-sm font-bold mb-4 text-[var(--db-text-main)]">Thread State machine</h4>
          <div className="flex justify-between items-center gap-2 overflow-x-auto py-2">
            {[
              { label: 'NEW', desc: 'Thread instantiated' },
              { label: 'RUNNABLE', desc: 'Active execution' },
              { label: 'WAITING', desc: 'Awaiting lock' },
              { label: 'TERMINATED', desc: 'Finished execution' }
            ].map((st, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border text-center flex-1 min-w-[90px] transition-all duration-300 ${idx === vizStep ? 'border-[#3B82F6] bg-blue-50/10 shadow-[0_0_12px_rgba(59,130,246,0.15)]' : 'border-[var(--db-card-border)]'}`}
              >
                <div className={`text-xs font-bold ${idx === vizStep ? 'text-[#3B82F6]' : 'text-[var(--db-text-muted)]'}`}>{st.label}</div>
                <div className="text-[9px] text-[var(--db-text-muted)] mt-1">{st.desc}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <button 
              disabled={vizStep === 0} 
              onClick={() => setVizStep(prev => prev - 1)}
              className="px-3 py-1.5 rounded-lg border border-[var(--db-card-border)] text-xs text-[var(--db-text-main)] disabled:opacity-50"
            >
              Previous State
            </button>
            <button 
              disabled={vizStep === 3} 
              onClick={() => setVizStep(prev => prev + 1)}
              className="px-3 py-1.5 rounded-lg bg-[#3B82F6] text-white text-xs"
            >
              Next State
            </button>
          </div>
        </div>
      );
    }

    // Default Fallback Visualization
    return (
      <div className="viz-box text-center py-8">
        <Info className="mx-auto text-[#3B82F6] mb-3" size={32} />
        <h4 className="text-sm font-bold text-[var(--db-text-main)]">Interactive Simulation</h4>
        <p className="text-xs text-[var(--db-text-muted)] max-w-sm mx-auto mt-2">
          Step through internal memory models and runtime stacks. Press the play button to activate auto-compiled visual states.
        </p>
        <button className="mt-4 px-4 py-2 bg-[#3B82F6] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 mx-auto hover:bg-[#2563EB] transition-colors">
          <Play size={12} fill="currentColor" /> Activate Visual Engine
        </button>
      </div>
    );
  };

  return (
    <div className="java-learning-path max-w-[1440px] mx-auto p-4 sm:p-8">
      
      <AnimatePresence mode="wait">
        {!selectedModule ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="space-y-8"
          >
            {/* HERO SECTION */}
            <div className="db-hero-section card-glass p-6 md:p-8 rounded-[28px] border border-[var(--db-card-border)] shadow-[var(--db-shadow)] relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              {/* Background Glow */}
              <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-tr from-[#3B82F6]/5 to-[#8B5CF6]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              
              <div className="space-y-4 max-w-xl z-10">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10 border border-[#3B82F6]/20 rounded-full text-xs font-bold text-[#3B82F6] flex items-center gap-1">
                    <Sparkles size={12} /> Java Learning Path
                  </span>
                  <span className="text-xs text-[var(--db-text-muted)] font-medium">• 17 Interactive Modules</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--db-text-main)]">Java Developer Track</h1>
                <p className="text-[var(--db-text-secondary)] leading-relaxed text-sm">
                  A curated academic journey blending PowerPoint presentation structure with the power of Notion workspaces and interactive visual solvers. Master Core Java syntax, concurrency, datatypes, and DSA.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button className="px-5 py-3 rounded-2xl bg-[#3B82F6] text-white text-xs font-bold hover:bg-[#2563EB] transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10"
                    onClick={() => handleOpenModule(JAVA_MODULES[3])} // Quick jump to OOP Concepts
                  >
                    Continue Learning <ChevronRight size={14} />
                  </button>
                  <div className="text-xs text-[var(--db-text-muted)]">
                    Last opened: <strong className="text-[var(--db-text-main)] font-semibold">OOP Concepts</strong>
                  </div>
                </div>
              </div>

              {/* Progress Panel */}
              <div className="flex items-center flex-wrap sm:flex-nowrap gap-6 w-full lg:w-auto bg-[var(--db-card-bg-elevated)] p-5 rounded-2xl border border-[var(--db-card-border)] z-10">
                <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-[var(--db-sidebar-border)]" strokeWidth="6" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                    <circle className="text-[#3B82F6]" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 41) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-[var(--db-text-main)]">41%</span>
                    <span className="text-[9px] text-[var(--db-text-muted)] font-bold">COMPLETE</span>
                  </div>
                </div>
                <div className="space-y-3 flex-grow">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                      <span className="text-[10px] text-[var(--db-text-muted)] block font-semibold uppercase">Level</span>
                      <strong className="text-lg font-bold text-[var(--db-text-main)]">08</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--db-text-muted)] block font-semibold uppercase">XP Earned</span>
                      <strong className="text-lg font-bold text-[var(--db-text-main)]">3.2k <span className="text-xs font-normal text-[var(--db-text-muted)]">/ 5k</span></strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--db-text-muted)] block font-semibold uppercase">Streak</span>
                      <strong className="text-lg font-bold text-[#F59E0B] flex items-center gap-1">12 Days <Flame size={14} fill="#F59E0B" /></strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--db-text-muted)] block font-semibold uppercase">Completed</span>
                      <strong className="text-lg font-bold text-[var(--db-text-main)]">7 / 17</strong>
                    </div>
                  </div>
                  {/* Badges list */}
                  <div className="flex gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded bg-blue-50/10 border border-[#3B82F6]/20 text-[9px] font-bold text-[#3B82F6]">Speed Demon</span>
                    <span className="px-2 py-0.5 rounded bg-purple-50/10 border border-[#8B5CF6]/20 text-[9px] font-bold text-[#8B5CF6]">Ninja</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50/10 border border-[#10B981]/20 text-[9px] font-bold text-[#10B981]">Collector</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROADMAP TIMELINE */}
            <div className="card-glass p-6 rounded-[24px] border border-[var(--db-card-border)]">
              <h3 className="text-xs font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Compass size={14} /> Learning Roadmap Timeline
              </h3>
              <div className="flex items-center justify-between gap-2 overflow-x-auto py-3">
                {[
                  { name: 'Fundamentals', done: true, color: '#3B82F6' },
                  { name: 'Control Flow', done: true, color: '#06B6D4' },
                  { name: 'OOP', active: true, color: '#8B5CF6' },
                  { name: 'Collections', color: '#10B981' },
                  { name: 'DSA', color: '#EF4444' },
                  { name: 'Projects', color: '#22C55E' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{
                          background: item.done ? `${item.color}20` : (item.active ? item.color : 'var(--db-input-bg)'),
                          border: `2px solid ${item.done || item.active ? item.color : 'var(--db-card-border)'}`,
                          color: item.done ? item.color : (item.active ? '#fff' : 'var(--db-text-muted)')
                        }}
                      >
                        {item.done ? '✓' : idx + 1}
                      </div>
                      <span className={`text-xs font-semibold ${item.active ? 'text-[var(--db-text-main)] underline decoration-[#8B5CF6] decoration-2 underline-offset-4' : 'text-[var(--db-text-secondary)]'}`}>
                        {item.name}
                      </span>
                    </div>
                    {idx < 5 && <span className="text-[var(--db-card-border)] font-bold px-2">→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* MODULES GRID */}
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--db-text-main)]">Learning Modules</h2>
                  <p className="text-xs text-[var(--db-text-muted)] mt-1">Staggered academic paths matching all levels of expertise.</p>
                </div>
                <div className="text-xs text-[var(--db-text-muted)] font-medium">
                  Showing 17 modules
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {JAVA_MODULES.map((mod) => {
                  const ModIcon = mod.icon || BookOpen;
                  return (
                    <motion.div
                      key={mod.id}
                      onClick={() => handleOpenModule(mod)}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                      className="java-module-card cursor-pointer group flex flex-col justify-between"
                      style={{ '--accent-color': mod.accent }}
                    >
                      {/* Accent Top Border */}
                      <div className="mod-accent-border" />
                      
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="mod-icon-wrapper" style={{ background: `${mod.accent}12`, color: mod.accent }}>
                            <ModIcon size={20} />
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            mod.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-500' :
                            mod.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-500' :
                            mod.difficulty === 'Advanced' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'
                          }`}>
                            {mod.difficulty}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[var(--db-text-main)] group-hover:text-[#3B82F6] transition-colors leading-tight mb-2">
                          {mod.title}
                        </h3>
                        <p className="text-xs text-[var(--db-text-muted)] line-clamp-3 leading-relaxed">
                          {mod.description}
                        </p>
                      </div>

                      <div className="space-y-4 pt-4">
                        {/* Progress Bar */}
                        {!mod.features && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-[var(--db-text-muted)]">
                              <span>Progress</span>
                              <span>{mod.progress}%</span>
                            </div>
                            <div className="w-full bg-[var(--db-input-bg)] h-1.5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" 
                                style={{ width: `${mod.progress}%`, backgroundColor: mod.accent }}
                              />
                            </div>
                          </div>
                        )}

                        {mod.features && (
                          <div className="flex flex-wrap gap-1">
                            {mod.features.slice(0, 2).map((f, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 bg-[var(--db-input-bg)] text-[var(--db-text-muted)] rounded border border-[var(--db-card-border)]">
                                {f}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-[var(--db-card-border)] pt-3 text-[10px] text-[var(--db-text-muted)]">
                          <span className="flex items-center gap-1 font-medium">
                            ⏱ {mod.duration}
                          </span>
                          <span className="font-bold text-[var(--db-text-main)]">
                            💎 {mod.xp} XP
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* MODULE DETAIL VIEW */
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* BACK HEADER BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--db-card-border)] pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedModule(null)}
                  className="p-2.5 rounded-xl border border-[var(--db-card-border)] text-[var(--db-text-muted)] hover:text-[#3B82F6] hover:bg-blue-50/15 transition-all flex items-center justify-center"
                >
                  <Compass size={18} className="transform rotate-180" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-[#3B82F6] tracking-wider">Module {selectedModule.id}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--db-card-border)]" />
                    <span className="text-[10px] uppercase font-bold text-[var(--db-text-muted)] tracking-wider">{selectedModule.difficulty}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[var(--db-text-main)] leading-none mt-1">{selectedModule.title}</h2>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-xl bg-blue-50/10 border border-[#3B82F6]/20 text-xs font-bold text-[#3B82F6]">
                  💎 {selectedModule.xp} XP Available
                </span>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] text-white text-xs font-bold rounded-xl transition"
                >
                  Mark Complete
                </button>
              </div>
            </div>

            {/* TAB LIST */}
            <div className="flex items-center border-b border-[var(--db-card-border)] gap-2 overflow-x-auto py-1">
              {[
                { id: 'learn', label: 'Learn', icon: BookOpen },
                { id: 'visualize', label: 'Visualize', icon: PlayCircle },
                { id: 'code', label: 'Code Lab', icon: Code },
                { id: 'practice', label: 'Practice', icon: Sparkles },
                { id: 'quiz', label: 'Quiz', icon: HelpCircle },
                { id: 'notes', label: 'Notes', icon: FileText }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all ${
                      active 
                        ? 'border-[#3B82F6] text-[#3B82F6] bg-blue-50/5' 
                        : 'border-transparent text-[var(--db-text-muted)] hover:text-[var(--db-text-main)]'
                    }`}
                  >
                    <TabIcon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTAINER */}
            <div className="min-h-[400px]">
              {activeTab === 'learn' && (
                <div className="grid lg:grid-cols-4 gap-6">
                  {/* Left Column: Topics List */}
                  <div className="lg:col-span-1 space-y-2 card-glass p-4 rounded-2xl border border-[var(--db-card-border)]">
                    <h4 className="text-xs font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-3">Syllabus Topics</h4>
                    {selectedModule.topics?.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTopicIdx(idx)}
                        className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 ${
                          idx === selectedTopicIdx 
                            ? 'border-[#3B82F6] bg-blue-50/10 text-[#3B82F6]' 
                            : 'border-transparent text-[var(--db-text-secondary)] hover:bg-[var(--db-card-bg-elevated)]'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          idx === selectedTopicIdx ? 'bg-[#3B82F6] text-white' : 'bg-[var(--db-input-bg)] text-[var(--db-text-muted)]'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="truncate">{t.title}</span>
                      </button>
                    ))}
                    {!selectedModule.topics && (
                      <div className="text-xs text-[var(--db-text-muted)] p-2">Standard mock syllabus. Select visualizing or quiz tabs.</div>
                    )}
                  </div>

                  {/* Right Column: Content Detail */}
                  <div className="lg:col-span-3 card-glass p-6 rounded-2xl border border-[var(--db-card-border)] space-y-4">
                    {selectedModule.topics?.[selectedTopicIdx] ? (
                      <>
                        <span className="text-[10px] uppercase font-extrabold text-[#3B82F6] tracking-wider">
                          Section {selectedTopicIdx + 1}
                        </span>
                        <h3 className="text-xl font-bold text-[var(--db-text-main)] mt-1">
                          {selectedModule.topics[selectedTopicIdx].title}
                        </h3>
                        <p className="text-sm text-[var(--db-text-secondary)] leading-relaxed whitespace-pre-wrap">
                          {selectedModule.topics[selectedTopicIdx].content}
                        </p>
                        <div className="p-4 bg-[var(--db-card-bg-elevated)] rounded-xl border border-[var(--db-card-border)] flex items-start gap-3 mt-6">
                          <Info className="text-[#3B82F6] flex-shrink-0 mt-0.5" size={16} />
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-[var(--db-text-main)] block">Pro Tip</span>
                            <span className="text-xs text-[var(--db-text-muted)] leading-relaxed">
                              Run the "Code Lab" compiler side-by-side or launch the JVM visual diagram in the "Visualize" tab to watch variables alter memory registry blocks.
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 text-[var(--db-text-muted)] text-sm">
                        No syllabus topic loaded. Please click on other tabs.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'visualize' && (
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 card-glass p-6 rounded-2xl border border-[var(--db-card-border)]">
                    {renderVisualizer()}
                  </div>
                  <div className="lg:col-span-1 card-glass p-5 rounded-2xl border border-[var(--db-card-border)] space-y-4">
                    <h4 className="text-xs font-bold text-[var(--db-text-muted)] uppercase tracking-wider">Visual Instructions</h4>
                    <p className="text-xs text-[var(--db-text-secondary)] leading-relaxed">
                      This visual solver renders dynamic structures of JVM heaps, variable allocations, threads, and linked structures.
                    </p>
                    <div className="space-y-2.5 pt-2">
                      <div className="flex gap-2 items-start text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] mt-1.5 flex-shrink-0" />
                        <span className="text-[var(--db-text-muted)]">Blue borders indicate the active stack frames.</span>
                      </div>
                      <div className="flex gap-2 items-start text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 flex-shrink-0" />
                        <span className="text-[var(--db-text-muted)]">Green borders signify finished reference objects.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'code' && (
                <div className="grid lg:grid-cols-12 gap-6">
                  {/* Left Column: Description & Instructions */}
                  <div className="lg:col-span-3 card-glass p-5 rounded-2xl border border-[var(--db-card-border)] space-y-4">
                    <h4 className="text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Coding Workspace</h4>
                    <h3 className="text-sm font-bold text-[var(--db-text-main)]">Challenge: Syntax Compiler</h3>
                    <p className="text-xs text-[var(--db-text-secondary)] leading-relaxed">
                      Modify the code block in the editor to print details. When complete, hit the compilation button to run main threads.
                    </p>
                    <div className="p-3 bg-[var(--db-card-bg-elevated)] rounded-xl border border-[var(--db-card-border)]">
                      <span className="text-[10px] font-bold text-[#F59E0B] block">⚠️ Constraint</span>
                      <span className="text-[10px] text-[var(--db-text-muted)] leading-relaxed">
                        Ensure class name corresponds exactly to compiling parameters.
                      </span>
                    </div>
                  </div>

                  {/* Center Column: Live Editor */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="flex justify-between items-center bg-[#0F172A] px-4 py-2.5 rounded-t-2xl border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      </div>
                      <span className="text-xs font-mono text-slate-400">Main.java</span>
                      <button 
                        onClick={handleRunCode}
                        className="px-3 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Play size={10} fill="currentColor" /> Run Code
                      </button>
                    </div>
                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      className="w-full h-80 bg-[#0F172A] text-[#E2E8F0] font-mono text-xs p-4 rounded-b-2xl border border-t-0 border-slate-800 focus:outline-none focus:ring-0 resize-none leading-relaxed"
                      spellCheck="false"
                    />
                  </div>

                  {/* Right Column: Output & Hints */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="card-glass p-5 rounded-2xl border border-[var(--db-card-border)] flex flex-col h-full justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Terminal size={12} /> Execution Console
                        </h4>
                        <pre className="bg-[#0b0f19] text-xs font-mono p-3 rounded-xl border border-[var(--db-card-border)] text-emerald-400 min-h-[140px] whitespace-pre-wrap leading-relaxed">
                          {consoleOutput}
                        </pre>
                      </div>
                      
                      <div className="space-y-2">
                        <button 
                          onClick={() => setShowAiHint(!showAiHint)}
                          className="w-full py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-xs font-bold text-[#8B5CF6] rounded-xl flex items-center justify-center gap-1 hover:from-purple-500/20 transition-all"
                        >
                          <Sparkles size={12} /> AI Copilot Hints
                        </button>
                        {showAiHint && (
                          <div className="p-3 bg-purple-500/5 border border-purple-500/10 text-[10px] text-[var(--db-text-muted)] rounded-xl leading-relaxed">
                            💡 Use <code>System.out.println()</code> blocks to write strings to console output.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'practice' && (
                <div className="card-glass p-6 rounded-2xl border border-[var(--db-card-border)] space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--db-text-main)]">Daily Code Practice Arena</h3>
                    <p className="text-xs text-[var(--db-text-muted)] mt-1">Submit optimal code patterns to achieve performance badges.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-[var(--db-card-bg-elevated)] rounded-2xl border border-[var(--db-card-border)] space-y-3">
                      <span className="px-2 py-0.5 bg-blue-50/10 border border-[#3B82F6]/20 text-[9px] font-bold text-[#3B82F6] uppercase rounded">Optimal Method</span>
                      <h4 className="text-sm font-bold text-[var(--db-text-main)]">Recursive Fibonacci Algorithm</h4>
                      <p className="text-xs text-[var(--db-text-muted)] leading-relaxed">
                        Implement recursion techniques to print sequences. Run benchmarks to track complexity.
                      </p>
                      <button className="px-3.5 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded-xl hover:bg-[#2563EB] transition-colors">
                        Launch Practice Lab
                      </button>
                    </div>

                    <div className="p-4 bg-[var(--db-card-bg-elevated)] rounded-2xl border border-[var(--db-card-border)] space-y-3">
                      <span className="px-2 py-0.5 bg-purple-50/10 border border-[#8B5CF6]/20 text-[9px] font-bold text-[#8B5CF6] uppercase rounded">Benchmarks</span>
                      <h4 className="text-sm font-bold text-[var(--db-text-main)]">Time & Space Complexity</h4>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-[var(--db-input-bg)] p-2 rounded-lg border border-[var(--db-card-border)] text-center">
                          <span className="text-[9px] text-[var(--db-text-muted)] block">Time</span>
                          <strong className="text-xs text-[var(--db-text-main)] font-mono">O(2^N)</strong>
                        </div>
                        <div className="bg-[var(--db-input-bg)] p-2 rounded-lg border border-[var(--db-card-border)] text-center">
                          <span className="text-[9px] text-[var(--db-text-muted)] block">Space</span>
                          <strong className="text-xs text-[var(--db-text-main)] font-mono">O(N)</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="card-glass p-6 rounded-2xl border border-[var(--db-card-border)] max-w-xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--db-text-main)]">Topic Evaluation</h3>
                    <p className="text-xs text-[var(--db-text-muted)] mt-1">Submit the correct option to acquire XP points.</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-[var(--db-text-main)] leading-relaxed">
                      {mockQuiz.question}
                    </p>

                    <div className="space-y-2">
                      {mockQuiz.options.map((opt) => {
                        const selected = selectedAnswer === opt.id;
                        return (
                          <button
                            key={opt.id}
                            disabled={quizScore !== null}
                            onClick={() => handleAnswerSubmit(opt.id)}
                            className={`w-full text-left p-3.5 rounded-xl text-xs font-semibold border transition-all flex justify-between items-center ${
                              selected
                                ? (opt.id === mockQuiz.correct ? 'border-emerald-500 bg-emerald-50/5 text-emerald-500' : 'border-red-500 bg-red-50/5 text-red-500')
                                : 'border-[var(--db-card-border)] hover:bg-[var(--db-card-bg-elevated)] text-[var(--db-text-secondary)]'
                            }`}
                          >
                            <span>{opt.id.toUpperCase()}. {opt.text}</span>
                            {selected && opt.id === mockQuiz.correct && <CheckCircle size={14} className="text-emerald-500" />}
                          </button>
                        );
                      })}
                    </div>

                    {quizScore !== null && (
                      <div className="p-4 bg-[var(--db-card-bg-elevated)] rounded-xl border border-[var(--db-card-border)] space-y-2">
                        <span className={`text-xs font-bold block ${quizScore === 100 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {quizScore === 100 ? '🎉 Correct Answer! (+50 XP)' : '❌ Incorrect Answer.'}
                        </span>
                        <p className="text-xs text-[var(--db-text-muted)] leading-relaxed">
                          {mockQuiz.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="card-glass p-6 rounded-2xl border border-[var(--db-card-border)] space-y-4">
                  <h3 className="text-lg font-bold text-[var(--db-text-main)]">Personal Study Notes</h3>
                  <textarea
                    placeholder="Capture key class constructs, exception handling syntaxes, or thread methods here. Notes are stored locally inside the profile..."
                    className="w-full h-40 bg-[var(--db-input-bg)] text-[var(--db-text-main)] text-xs p-4 rounded-xl border border-[var(--db-input-border)] focus:outline-none leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded-xl hover:bg-[#2563EB] transition-colors">
                      Save Notes
                    </button>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
