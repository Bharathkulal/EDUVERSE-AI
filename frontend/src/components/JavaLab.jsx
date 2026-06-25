import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Play, Code, CheckCircle, HelpCircle, FileText,
  ChevronRight, Award, Compass, Flame, TrendingUp, PlayCircle,
  Code2, Terminal, Info, RefreshCw, Layers, Database, Zap,
  BrainCircuit, ShieldAlert, Sparkles, Star, Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';
import './JavaLab.css';

const SUB_TOPICS = [
  'overview',
  'jdk-jre-jvm',
  'first-program',
  'syntax-basics',
  'variables-datatypes',
  'operators',
  'input-output',
  'expressions-statements',
  'control-flow',
  'practice-quiz'
];

const SUB_TOPIC_LABELS = {
  'overview': 'Lesson Overview',
  'jdk-jre-jvm': 'JDK / JRE / JVM',
  'first-program': 'First Java Program',
  'syntax-basics': 'Syntax Basics',
  'variables-datatypes': 'Variables & Data Types',
  'operators': 'Operators',
  'input-output': 'Input and Output',
  'expressions-statements': 'Expressions & Statements',
  'control-flow': 'Control Flow',
  'practice-quiz': 'Practice Quiz'
};

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

  // Guided Module 1 states
  const [subTopic, setSubTopic] = useState('overview');
  const [completedSubTopics, setCompletedSubTopics] = useState([]);
  const [runProgramState, setRunProgramState] = useState(false);
  const [scannerRun, setScannerRun] = useState(false);
  const [scannerInput, setScannerInput] = useState({ name: 'Alice', age: '20', marks: '95' });
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState({});
  const [codingAnswers, setCodingAnswers] = useState({ 0: '', 1: '' });
  const [codingFeedback, setCodingFeedback] = useState({});
  const [studentNotes, setStudentNotes] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [optAnswer1, setOptAnswer1] = useState(null);

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
          selectedModule.id === 1 ? (
            <motion.div
              key="guided-intro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-6 text-slate-200"
            >
              {/* TOP HEADER AREA */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedModule(null)}
                    className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-[#3B82F6] hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Compass size={18} className="transform rotate-180" />
                  </button>
                  <div className="text-left">
                    <h2 className="text-2xl font-extrabold text-white">Introduction to Java</h2>
                    <p className="text-xs text-slate-400 mt-1">Learn Java basics, JDK/JRE/JVM, and first programming steps.</p>
                  </div>
                </div>

                {/* Progress bar and controls */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-slate-400">Step Progress: {Math.round((completedSubTopics.length / 10) * 100)}%</span>
                    <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${(completedSubTopics.length / 10) * 100}%` }} />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!completedSubTopics.includes(subTopic)) {
                        setCompletedSubTopics([...completedSubTopics, subTopic]);
                      }
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    {completedSubTopics.includes(subTopic) ? '✓ Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>

              {/* DYNAMIC WORKSPACE GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT SIDE: TOPIC TABS */}
                <div className="lg:col-span-3 space-y-2 bg-white/[0.02] border border-white/10 p-4 rounded-3xl backdrop-blur-md">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1 text-left">Guided Syllabus</h4>
                  {[
                    { id: 'overview', label: '1. Lesson Overview' },
                    { id: 'jdk-jre-jvm', label: '2. JDK / JRE / JVM' },
                    { id: 'first-program', label: '3. First Java Program' },
                    { id: 'syntax-basics', label: '4. Syntax Basics' },
                    { id: 'variables-datatypes', label: '5. Variables & Data Types' },
                    { id: 'operators', label: '6. Operators' },
                    { id: 'input-output', label: '7. Input and Output' },
                    { id: 'expressions-statements', label: '8. Expressions & Statements' },
                    { id: 'control-flow', label: '9. Control Flow' },
                    { id: 'practice-quiz', label: '10. Practice Quiz' }
                  ].map((item) => {
                    const isActive = subTopic === item.id;
                    const isDone = completedSubTopics.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSubTopic(item.id);
                          setShowHint(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all border flex items-center justify-between cursor-pointer ${
                          isActive 
                            ? 'border-blue-500 bg-blue-500/10 text-white font-bold shadow-md shadow-blue-500/5' 
                            : 'border-transparent text-slate-400 hover:bg-white/[0.03] hover:text-white'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {isDone && <span className="text-emerald-500 text-xs font-black">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* CENTER: MAIN CONTENT AREA */}
                <div className="lg:col-span-6 bg-white/[0.02] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-6">
                  {subTopic === 'overview' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Guided Lesson</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">Java History & Core Overview</span>
                      </div>
                      <h3 className="text-xl font-bold text-white text-left">Introduction to Java</h3>
                      
                      <div className="space-y-3 text-sm text-slate-300 leading-relaxed text-left">
                        <p>
                          <strong>Java</strong> is a high-level, class-based, object-oriented programming language released by Sun Microsystems in 1995. Its core design philosophy is: <em>"Write Once, Run Anywhere" (WORA)</em>.
                        </p>
                        <p>
                          This means compiled Java code runs on any machine equipped with a Java Virtual Machine (JVM), without needing recompilation!
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
                          <span className="text-[10px] uppercase font-bold text-blue-400">Key Features</span>
                          <ul className="text-xs text-slate-400 space-y-1 mt-1.5 list-disc pl-4">
                            <li>Object-Oriented</li>
                            <li>Platform Independent</li>
                            <li>Robust & Secure</li>
                            <li>Multi-threaded</li>
                          </ul>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
                          <span className="text-[10px] uppercase font-bold text-purple-400">Real-World Uses</span>
                          <ul className="text-xs text-slate-400 space-y-1 mt-1.5 list-disc pl-4">
                            <li>Android Applications</li>
                            <li>Enterprise Web Apps</li>
                            <li>Big Data Processing</li>
                            <li>Financial Trading Systems</li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">🎓 Why learn this?</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                          Java is the foundational architecture powering billions of devices worldwide. Understanding Java establishes core object-oriented principles used in modern C#, C++, and TypeScript.
                        </p>
                      </div>
                    </div>
                  )}

                  {subTopic === 'jdk-jre-jvm' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Compiler Internals</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">Platform Components</span>
                      </div>
                      <h3 className="text-xl font-bold text-white text-left">JDK vs JRE vs JVM</h3>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
                          <strong className="text-sm text-blue-400 block font-bold">JDK</strong>
                          <span className="text-[10px] text-slate-500 block leading-tight">Java Development Kit</span>
                          <p className="text-[11px] text-slate-400 mt-2">Contains JRE, Javac compiler, debugger, and developer utility tools.</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
                          <strong className="text-sm text-purple-400 block font-bold">JRE</strong>
                          <span className="text-[10px] text-slate-500 block leading-tight">Java Runtime Env.</span>
                          <p className="text-[11px] text-slate-400 mt-2">Contains JVM and core libraries. Allows executing class bytecode files.</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
                          <strong className="text-sm text-emerald-400 block font-bold">JVM</strong>
                          <span className="text-[10px] text-slate-500 block leading-tight">Java Virtual Machine</span>
                          <p className="text-[11px] text-slate-400 mt-2">Executes bytecode step-by-step. Converts bytecode into native CPU instructions.</p>
                        </div>
                      </div>

                      {/* Visual flow chart */}
                      <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-3 tracking-widest">COMPILE & RUNTIME PIPELINE FLOW</span>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-[10px] font-mono">
                          <span className="p-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded">.java source</span>
                          <span className="text-slate-500">──(javac compiler)──></span>
                          <span className="p-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded">.class bytecode</span>
                          <span className="text-slate-500">──(JVM interpreter)──></span>
                          <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded">output execution</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-slate-300 leading-relaxed text-left">
                        <strong>💡 Key Difference:</strong> You need the **JDK** to write and compile programs, but you only need the **JRE** to run them. The **JVM** is the virtual processor that actually executes the bytecode.
                      </div>
                    </div>
                  )}

                  {subTopic === 'first-program' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Hello World</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">First Steps</span>
                      </div>
                      <h3 className="text-xl font-bold text-white text-left">Your First Java Program</h3>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-[#0F172A] px-4 py-2 rounded-t-2xl border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400">HelloWorld.java</span>
                          <button 
                            onClick={() => {
                              setRunProgramState(true);
                              setTimeout(() => setRunProgramState(false), 3000);
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded transition cursor-pointer"
                          >
                            ▶ Run Code
                          </button>
                        </div>
                        <pre className="bg-[#0F172A] p-4 text-xs font-mono rounded-b-2xl border border-t-0 border-slate-800 text-left text-slate-300 leading-relaxed">
{`public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`}
                        </pre>
                      </div>

                      {/* Run Console Simulator */}
                      <div className="p-3.5 bg-black rounded-2xl border border-white/5 text-left font-mono text-xs">
                        <span className="text-[10px] text-slate-500 block mb-1">CONSOLE OUTPUT:</span>
                        <pre className="text-emerald-400">
                          {runProgramState 
                            ? 'Compiling HelloWorld.java...\nExecuting main thread...\nHello, World!' 
                            : 'Click "Run Code" to compile and execute program.'
                          }
                        </pre>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-400 text-left">
                        <span className="font-bold text-slate-200">Explanation:</span>
                        <ul className="list-disc pl-4 space-y-1">
                          <li><strong>public class HelloWorld:</strong> In Java, every line of code must be inside a class. The class name must match the filename exactly.</li>
                          <li><strong>public static void main:</strong> The main method is the entry point of any Java application.</li>
                          <li><strong>System.out.println:</strong> Command used to print text to the console screen.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {subTopic === 'syntax-basics' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Grammar Rules</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">Syntax</span>
                      </div>
                      <h3 className="text-xl font-bold text-white text-left">Java Syntax Basics</h3>
                      
                      <div className="space-y-3 text-sm text-slate-300 leading-relaxed text-left">
                        <p>Java has strict grammar rules that you must follow, or the compiler will throw errors:</p>
                        <ul className="list-disc pl-5 space-y-2 text-xs text-slate-400">
                          <li><strong>Case Sensitivity:</strong> <code>myVariable</code> and <code>myvariable</code> are completely different.</li>
                          <li><strong>Statements ending:</strong> Every command statement must end with a semicolon (<code>;</code>).</li>
                          <li><strong>Braces:</strong> Curly braces <code>{"{ }"}</code> group blocks of code, like classes and methods.</li>
                          <li><strong>Comments:</strong> Use <code>//</code> for single-line comments and <code>/* */</code> for multi-line comments.</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-[#0F172A] px-4 py-2 rounded-t-2xl border border-slate-800 text-[10px] font-mono text-slate-400 text-left">
                          Syntax Example
                        </div>
                        <pre className="bg-[#0F172A] p-4 text-xs font-mono rounded-b-2xl border border-t-0 border-slate-800 text-left text-slate-300 leading-relaxed">
{`// This is a single-line comment
public class SyntaxDemo {
    public static void main(String[] args) {
        System.out.println("Java is case-sensitive!"); // Ends with semicolon
    }
}`}
                        </pre>
                      </div>
                    </div>
                  )}

                  {subTopic === 'variables-datatypes' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Memory Blocks</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">Data Storage</span>
                      </div>
                      <h3 className="text-xl font-bold text-white text-left">Variables and Data Types</h3>
                      
                      <div className="space-y-2 text-xs text-slate-300 leading-relaxed text-left">
                        <p>A <strong>variable</strong> is a container in memory that stores values. Java is statically-typed, meaning you must declare the variable's type before using it.</p>
                      </div>

                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                            <th className="pb-2">Data Type</th>
                            <th className="pb-2">Description</th>
                            <th className="pb-2">Example Decl.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          <tr>
                            <td className="py-2.5 font-mono text-blue-400">int</td>
                            <td className="py-2.5 text-slate-400">Stores integers (whole numbers)</td>
                            <td className="py-2.5 font-mono text-slate-300">int age = 21;</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-mono text-blue-400">double</td>
                            <td className="py-2.5 text-slate-400">Stores decimal numbers</td>
                            <td className="py-2.5 font-mono text-slate-300">double price = 19.99;</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-mono text-blue-400">boolean</td>
                            <td className="py-2.5 text-slate-400">Stores true or false values</td>
                            <td className="py-2.5 font-mono text-slate-300">boolean active = true;</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-mono text-blue-400">char</td>
                            <td className="py-2.5 text-slate-400">Stores a single quote char</td>
                            <td className="py-2.5 font-mono text-slate-300">char grade = 'A';</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-mono text-purple-400">String</td>
                            <td className="py-2.5 text-slate-400">Stores double quote text (Object)</td>
                            <td className="py-2.5 font-mono text-slate-300">String name = "Bob";</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {subTopic === 'operators' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Computations</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">Math & Logic</span>
                      </div>
                      <h3 className="text-xl font-bold text-white text-left">Java Operators</h3>

                      <div className="grid grid-cols-2 gap-4 text-xs text-left">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <span className="font-bold text-blue-400 block mb-1">Arithmetic</span>
                          <p className="text-slate-400"><code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>, <code>%</code> (modulo/remainder)</p>
                          <span className="text-[10px] text-slate-500 mt-2 block">Example: <code>10 % 3 = 1</code></span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <span className="font-bold text-purple-400 block mb-1">Relational</span>
                          <p className="text-slate-400"><code>==</code>, <code>!=</code>, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code></p>
                          <span className="text-[10px] text-slate-500 mt-2 block">Example: <code>5 != 2</code> (true)</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <span className="font-bold text-emerald-400 block mb-1">Logical</span>
                          <p className="text-slate-400"><code>&&</code> (AND), <code>||</code> (OR), <code>!</code> (NOT)</p>
                          <span className="text-[10px] text-slate-500 mt-2 block">Example: <code>true && false = false</code></span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <span className="font-bold text-amber-500 block mb-1">Inc. & Dec.</span>
                          <p className="text-slate-400"><code>++</code> (increment by 1), <code>--</code> (decrement by 1)</p>
                          <span className="text-[10px] text-slate-500 mt-2 block">Example: <code>x++</code></span>
                        </div>
                      </div>

                      {/* Mini Practice Box */}
                      <div className="p-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-left space-y-3">
                        <span className="text-xs font-bold text-violet-300">✏️ Mini Practice Check</span>
                        <p className="text-xs text-slate-300">If <code>int x = 5;</code>, what is the value of <code>x</code> after evaluating <code>x++</code>?</p>
                        
                        <div className="flex gap-2">
                          {[
                            { value: '5', isCorrect: false },
                            { value: '6', isCorrect: true },
                            { value: '4', isCorrect: false }
                          ].map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                if (opt.isCorrect) {
                                  setOptAnswer1('correct');
                                  toast.success('Correct!');
                                } else {
                                  setOptAnswer1('incorrect');
                                  toast.error('Try again!');
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs hover:bg-white/10 transition cursor-pointer"
                            >
                              {opt.value}
                            </button>
                          ))}
                        </div>
                        {optAnswer1 && (
                          <span className={`text-[10px] font-bold block ${optAnswer1 === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {optAnswer1 === 'correct' ? '✓ Correct! x becomes 6 after incrementing.' : '✗ Try again! Remember, ++ increases value by 1.'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {subTopic === 'input-output' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">User Dialog</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">Input/Output</span>
                      </div>
                      <h3 className="text-xl font-bold text-white text-left">Input and Output</h3>

                      <div className="space-y-3 text-xs text-slate-300 leading-relaxed text-left">
                        <p>To take inputs from a user, we use the <code>Scanner</code> class from <code>java.util</code> package. For outputs, we can use:</p>
                        <ul className="list-disc pl-5 space-y-1 text-slate-400">
                          <li><code>System.out.print()</code> — prints without appending a new line.</li>
                          <li><code>System.out.println()</code> — prints and appends a new line.</li>
                          <li><code>System.out.printf()</code> — prints formatted output (e.g. <code>%.2f</code>).</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-[#0F172A] px-4 py-2 rounded-t-2xl border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400">InputDemo.java</span>
                          <button 
                            onClick={() => {
                              setScannerRun(true);
                              setTimeout(() => setScannerRun(false), 4000);
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded transition cursor-pointer"
                          >
                            ▶ Run Input Simulator
                          </button>
                        </div>
                        <pre className="bg-[#0F172A] p-4 text-xs font-mono rounded-b-2xl border border-t-0 border-slate-800 text-left text-slate-300 leading-relaxed">
{`import java.util.Scanner;
public class InputDemo {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter name: ");
        String name = scanner.nextLine();
        System.out.print("Enter age: ");
        int age = scanner.nextInt();
        System.out.printf("Student: %s, Age: %d\\n", name, age);
    }
}`}
                        </pre>
                      </div>

                      {/* Interactive scanner parameters fields */}
                      <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 text-left space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Simulate Terminal Input</span>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-500 block">Name</label>
                            <input 
                              type="text" 
                              value={scannerInput.name} 
                              onChange={(e) => setScannerInput({...scannerInput, name: e.target.value})}
                              className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 block">Age</label>
                            <input 
                              type="text" 
                              value={scannerInput.age} 
                              onChange={(e) => setScannerInput({...scannerInput, age: e.target.value})}
                              className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 block">Marks</label>
                            <input 
                              type="text" 
                              value={scannerInput.marks} 
                              onChange={(e) => setScannerInput({...scannerInput, marks: e.target.value})}
                              className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Scanner Output Console */}
                        <div className="mt-2 p-2 bg-black rounded text-[10px] font-mono text-emerald-400">
                          {scannerRun ? (
                            `Enter name: ${scannerInput.name}\n` +
                            `Enter age: ${scannerInput.age}\n` +
                            `Enter marks: ${scannerInput.marks}\n` +
                            `[OUTPUT] Student: ${scannerInput.name}, Age: ${scannerInput.age}, Marks: ${scannerInput.marks}`
                          ) : (
                            'Click "Run Input Simulator" to feed inputs and print console output.'
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {subTopic === 'expressions-statements' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Structure Blocks</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">Statements</span>
                      </div>
                      <h3 className="text-xl font-bold text-white text-left">Expressions & Statements</h3>
                      
                      <div className="space-y-3 text-xs text-slate-300 leading-relaxed text-left">
                        <p>Understanding these three building blocks is vital:</p>
                        <ul className="space-y-2">
                          <li><strong>Expression:</strong> Evaluates to a single value. E.g. <code>x + 5</code> or <code>10.5 * factor</code>.</li>
                          <li><strong>Statement:</strong> Formulates a complete execution steps. Ends with a semicolon. E.g. <code>double bill = price * quantity;</code>.</li>
                          <li><strong>Block:</strong> Zero or more statements grouped within curly braces <code>{"{ ... }"}</code>.</li>
                        </ul>
                      </div>

                      {/* Visual Block grouping layout */}
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left space-y-2">
                        <span className="text-[10px] text-slate-500 font-bold block">CODE BLOCK GROUPING VISUALIZATION:</span>
                        <div className="p-3 border border-blue-500/30 rounded-xl bg-blue-500/5 font-mono text-[11px] space-y-2">
                          <span className="text-blue-400">// Start Block (Level 1)</span>
                          <div className="pl-4 border-l border-purple-500/30 space-y-1">
                            <div>int baseVal = 100;</div>
                            <div className="text-purple-400">int finalScore = baseVal + 45; // Expression baseVal + 45</div>
                            <div className="p-2 border border-emerald-500/30 bg-emerald-500/5 rounded-lg text-emerald-400">
                              System.out.println("Final Score: " + finalScore);
                            </div>
                          </div>
                          <span className="text-blue-400">// End Block</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {subTopic === 'control-flow' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Flow Control</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">Execution Path</span>
                      </div>
                      <h3 className="text-xl font-bold text-white text-left">Introduction to Control Flow</h3>

                      <div className="space-y-3 text-xs text-slate-300 leading-relaxed text-left">
                        <p>Java code executes line-by-line from top to bottom. Control flow constructs alter this path:</p>
                        <ul className="space-y-2 text-slate-400">
                          <li><strong>Conditionals (if, else, switch):</strong> Executing code paths based on Boolean comparisons.</li>
                          <li><strong>Loops (for, while, do-while):</strong> Repeating execution blocks multiple times while condition remains true.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-2xl flex items-center justify-between gap-4">
                        <div className="text-left">
                          <strong className="text-xs text-white block">Ready to go deeper?</strong>
                          <span className="text-[10px] text-slate-400 leading-normal block mt-0.5">Control Flow modules await. Take the loops challenge!</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedModule(JAVA_MODULES[1]); // Jumps to Control Flow
                            setSubTopic('overview');
                          }}
                          className="px-3.5 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10 whitespace-nowrap"
                        >
                          Proceed to Loops ➔
                        </button>
                      </div>
                    </div>
                  )}

                  {subTopic === 'practice-quiz' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Evaluation</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">Topic Quiz & Code Practice</span>
                      </div>
                      <h3 className="text-xl font-bold text-white text-left">Java Fundamentals Practice</h3>

                      {/* 3 MCQs */}
                      <div className="space-y-4 text-left font-sans">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Part 1: Multiple Choice Questions</h4>

                        {/* MCQ 1 */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-300">1. What is the extension of compiled Java bytecode files?</span>
                          <div className="grid grid-cols-2 gap-2">
                            {['.java', '.class', '.jar', '.exe'].map((opt) => {
                              const selected = quizAnswers[0] === opt;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    setQuizAnswers({...quizAnswers, 0: opt});
                                    setQuizSubmitted({...quizSubmitted, 0: true});
                                  }}
                                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                                    selected 
                                      ? (opt === '.class' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400' : 'border-red-500 bg-red-500/5 text-red-400')
                                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {quizSubmitted[0] && (
                            <span className="text-[10px] text-slate-400 leading-relaxed block">
                              {quizAnswers[0] === '.class' 
                                ? '✓ Correct! Source files are .java, compiled bytecodes are .class.' 
                                : '✗ Incorrect. Try .class (compiled files).'
                              }
                            </span>
                          )}
                        </div>

                        {/* MCQ 2 */}
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-bold text-slate-300">2. Which tool is used to compile Java code files?</span>
                          <div className="grid grid-cols-2 gap-2">
                            {['java', 'javac', 'jvm', 'jre'].map((opt) => {
                              const selected = quizAnswers[1] === opt;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    setQuizAnswers({...quizAnswers, 1: opt});
                                    setQuizSubmitted({...quizSubmitted, 1: true});
                                  }}
                                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                                    selected 
                                      ? (opt === 'javac' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400' : 'border-red-500 bg-red-500/5 text-red-400')
                                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {quizSubmitted[1] && (
                            <span className="text-[10px] text-slate-400 leading-relaxed block">
                              {quizAnswers[1] === 'javac' 
                                ? '✓ Correct! "javac" stands for Java Compiler.' 
                                : '✗ Incorrect. javac is the compiler program.'
                              }
                            </span>
                          )}
                        </div>

                        {/* MCQ 3 */}
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-bold text-slate-300">3. Which of the following is NOT a primitive data type?</span>
                          <div className="grid grid-cols-2 gap-2">
                            {['int', 'double', 'boolean', 'String'].map((opt) => {
                              const selected = quizAnswers[2] === opt;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    setQuizAnswers({...quizAnswers, 2: opt});
                                    setQuizSubmitted({...quizSubmitted, 2: true});
                                  }}
                                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                                    selected 
                                      ? (opt === 'String' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400' : 'border-red-500 bg-red-500/5 text-red-400')
                                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {quizSubmitted[2] && (
                            <span className="text-[10px] text-slate-400 leading-relaxed block">
                              {quizAnswers[2] === 'String' 
                                ? '✓ Correct! String is a class/reference object type, not a primitive.' 
                                : '✗ Incorrect. String is a Class type.'
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 2 Coding Exercises */}
                      <div className="space-y-4 text-left pt-4 border-t border-white/5 font-sans">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Part 2: Coding Exercises</h4>

                        {/* Exercise 1 */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-300">1. Fill in the blank to print to console:</span>
                          <pre className="p-3 bg-[#0F172A] border border-slate-800 rounded-xl text-xs font-mono">
                            {`System.out.`}
                            <input 
                              type="text" 
                              value={codingAnswers[0]} 
                              onChange={(e) => setCodingAnswers({...codingAnswers, 0: e.target.value})}
                              placeholder="________"
                              className="mx-1 px-1 bg-white/10 border-b border-slate-400 outline-none text-white text-xs font-mono w-24 text-center"
                            />
                            {`("Welcome");`}
                          </pre>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const ans = codingAnswers[0].trim().toLowerCase();
                                if (ans === 'print' || ans === 'println') {
                                  setCodingFeedback({...codingFeedback, 0: 'correct'});
                                } else {
                                  setCodingFeedback({...codingFeedback, 0: 'incorrect'});
                                }
                              }}
                              className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-blue-500"
                            >
                              Try Code
                            </button>
                            <button
                              onClick={() => {
                                setCodingAnswers({...codingAnswers, 0: ''});
                                setCodingFeedback({...codingFeedback, 0: null});
                              }}
                              className="px-3 py-1.5 bg-white/5 text-slate-400 text-xs font-bold rounded-xl cursor-pointer hover:bg-white/10 border border-white/10"
                            >
                              Reset
                            </button>
                          </div>
                          {codingFeedback[0] && (
                            <span className={`text-[10px] font-bold block ${codingFeedback[0] === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {codingFeedback[0] === 'correct' ? '✓ Correct! "println" or "print" works perfectly.' : '✗ Try again! Think about the standard printing methods.'}
                            </span>
                          )}
                        </div>

                        {/* Exercise 2 */}
                        <div className="space-y-2 pt-2 font-sans">
                          <span className="text-xs font-bold text-slate-300">2. Declare a variable to store rating value (4.8):</span>
                          <pre className="p-3 bg-[#0F172A] border border-slate-800 rounded-xl text-xs font-mono">
                            <input 
                              type="text" 
                              value={codingAnswers[1]} 
                              onChange={(e) => setCodingAnswers({...codingAnswers, 1: e.target.value})}
                              placeholder="________"
                              className="mr-1 px-1 bg-white/10 border-b border-slate-400 outline-none text-white text-xs font-mono w-24 text-center"
                            />
                            {`rating = 4.8;`}
                          </pre>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const ans = codingAnswers[1].trim().toLowerCase();
                                if (ans === 'double' || ans === 'float') {
                                  setCodingFeedback({...codingFeedback, 1: 'correct'});
                                } else {
                                  setCodingFeedback({...codingFeedback, 1: 'incorrect'});
                                }
                              }}
                              className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-blue-500"
                            >
                              Try Code
                            </button>
                            <button
                              onClick={() => {
                                setCodingAnswers({...codingAnswers, 1: ''});
                                setCodingFeedback({...codingFeedback, 1: null});
                              }}
                              className="px-3 py-1.5 bg-white/5 text-slate-400 text-xs font-bold rounded-xl cursor-pointer hover:bg-white/10 border border-white/10"
                            >
                              Reset
                            </button>
                          </div>
                          {codingFeedback[1] && (
                            <span className={`text-[10px] font-bold block ${codingFeedback[1] === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {codingFeedback[1] === 'correct' ? '✓ Correct! "double" (recommended) or "float" works for decimal values.' : '✗ Try again! Think about the variable type used for decimals.'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NAV CONTROL BUTTONS */}
                  <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-6">
                    <button
                      disabled={subTopic === 'overview'}
                      onClick={() => {
                        const idx = SUB_TOPICS.indexOf(subTopic);
                        if (idx > 0) setSubTopic(SUB_TOPICS[idx - 1]);
                        setShowHint(false);
                      }}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 text-xs font-bold rounded-xl hover:bg-white/10 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ◀ Back Topic
                    </button>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                      {SUB_TOPIC_LABELS[subTopic]}
                    </span>
                    <button
                      disabled={subTopic === 'practice-quiz'}
                      onClick={() => {
                        const idx = SUB_TOPICS.indexOf(subTopic);
                        if (idx < SUB_TOPICS.length - 1) setSubTopic(SUB_TOPICS[idx + 1]);
                        setShowHint(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next Topic ▶
                    </button>
                  </div>
                </div>

                {/* RIGHT SIDE: HELPER PANEL */}
                <div className="lg:col-span-3 space-y-4">
                  
                  {/* Quick Notes Card */}
                  <div className="bg-white/[0.02] border border-white/10 p-5 rounded-3xl backdrop-blur-md text-left space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">📝 Study Notepad</span>
                    <textarea 
                      value={studentNotes}
                      onChange={(e) => setStudentNotes(e.target.value)}
                      placeholder="Write notes about variables, operations, or syntaxes here. Save them to local cache..."
                      className="w-full h-24 bg-white/5 border border-white/10 text-xs rounded-xl p-2.5 text-white outline-none focus:border-blue-500 leading-normal resize-none"
                    />
                    <button 
                      onClick={() => {
                        toast.success('Notes saved successfully!');
                        localStorage.setItem(`eduverse-java-notes-${subTopic}`, studentNotes);
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Save Notes
                    </button>
                  </div>

                  {/* Hint box */}
                  <div className="bg-white/[0.02] border border-white/10 p-5 rounded-3xl backdrop-blur-md text-left space-y-3">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">💡 Help Panel Hints</span>
                    <button 
                      onClick={() => setShowHint(!showHint)}
                      className="w-full py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      {showHint ? 'Hide Hint' : 'Reveal Hint'}
                    </button>
                    {showHint && (
                      <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl text-[11px] text-slate-300 leading-relaxed">
                        {subTopic === 'overview' && '💡 Focus on platform independence (WORA). JVM is what enables compile-once capabilities.'}
                        {subTopic === 'jdk-jre-jvm' && '💡 Think: JDK is for developers, JRE is for users who run apps. JVM is the core executor.'}
                        {subTopic === 'first-program' && '💡 Class name must match the HelloWorld filename exactly. The main() method signature is static.'}
                        {subTopic === 'syntax-basics' && '💡 Watch out for missing semicolons (;) at the end of output printing statements.'}
                        {subTopic === 'variables-datatypes' && '💡 Double is preferred for decimals. Strings are encapsulated inside double quotes.'}
                        {subTopic === 'operators' && '💡 Pre-increment (x++) increments value by 1. Modulo (%) calculates the integer remainder.'}
                        {subTopic === 'input-output' && '💡 Scanner scanner = new Scanner(System.in) listens to CLI keystroke inputs.'}
                        {subTopic === 'expressions-statements' && '💡 A statement is a full instruction ending in semicolon. Blocks are wrapped in { }.'}
                        {subTopic === 'control-flow' && '💡 if blocks branch conditionally. loops repeat until boolean condition becomes false.'}
                        {subTopic === 'practice-quiz' && '💡 Review sections 2, 3, and 5 for quick answers.'}
                      </div>
                    )}
                  </div>

                  {/* Key Terms */}
                  <div className="bg-white/[0.02] border border-white/10 p-5 rounded-3xl backdrop-blur-md text-left space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">🔑 Key Terms</span>
                    <div className="space-y-2 text-[10px] text-slate-400">
                      {subTopic === 'overview' && (
                        <>
                          <div><strong>WORA:</strong> Write Once, Run Anywhere.</div>
                          <div><strong>Object-Oriented:</strong> Code organized around objects.</div>
                        </>
                      )}
                      {subTopic === 'jdk-jre-jvm' && (
                        <>
                          <div><strong>Bytecode:</strong> Compiled class code files.</div>
                          <div><strong>Compiler:</strong> Program that turns code into bytecode.</div>
                        </>
                      )}
                      {subTopic === 'first-program' && (
                        <>
                          <div><strong>class:</strong> Definition container of state and method.</div>
                          <div><strong>static:</strong> Class-level method needing no instantiation.</div>
                        </>
                      )}
                      {subTopic === 'syntax-basics' && (
                        <>
                          <div><strong>semicolon:</strong> Command terminator in Java.</div>
                          <div><strong>Case Sensitive:</strong> Differentiates lowercase vs uppercase characters.</div>
                        </>
                      )}
                      {subTopic === 'variables-datatypes' && (
                        <>
                          <div><strong>Primitive:</strong> Fundamental numeric/character types.</div>
                          <div><strong>Reference Type:</strong> Objects like String or User arrays.</div>
                        </>
                      )}
                      {subTopic === 'operators' && (
                        <>
                          <div><strong>Modulo (%):</strong> Returns division remainder.</div>
                          <div><strong>Logical AND (&&):</strong> True only if both conditions are true.</div>
                        </>
                      )}
                      {subTopic === 'input-output' && (
                        <>
                          <div><strong>Scanner:</strong> Utility used to parse input streams.</div>
                          <div><strong>println():</strong> Print statement that starts a new line.</div>
                        </>
                      )}
                      {subTopic === 'expressions-statements' && (
                        <>
                          <div><strong>Expression:</strong> Code fragment evaluating to single value.</div>
                          <div><strong>Block:</strong> Bracket-encapsulated execution groups.</div>
                        </>
                      )}
                      {subTopic === 'control-flow' && (
                        <>
                          <div><strong>Conditionals:</strong> Boolean check branching (if-else).</div>
                          <div><strong>Iteration:</strong> Loop execution repetitions (for/while).</div>
                        </>
                      )}
                      {subTopic === 'practice-quiz' && (
                        <>
                          <div><strong>Evaluation:</strong> Quiz checking your academic mastery.</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Related Topic Suggestions */}
                  <div className="bg-white/[0.02] border border-white/10 p-5 rounded-3xl backdrop-blur-md text-left space-y-3">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">🔗 Related Topics</span>
                    <div className="flex flex-col gap-2 text-xs text-slate-400">
                      <button onClick={() => setSelectedModule(JAVA_MODULES[1])} className="text-left hover:text-white transition cursor-pointer">
                        • Control Flow & Loops ➔
                      </button>
                      <button onClick={() => setSelectedModule(JAVA_MODULES[2])} className="text-left hover:text-white transition cursor-pointer">
                        • Arrays & Strings ➔
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          ) : (
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
                    className="p-2.5 rounded-xl border border-[var(--db-card-border)] text-[var(--db-text-muted)] hover:text-[#3B82F6] hover:bg-blue-50/15 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Compass size={18} className="transform rotate-180" />
                  </button>
                  <div className="text-left">
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
                    className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] text-white text-xs font-bold rounded-xl transition cursor-pointer"
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
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer ${
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
                      <h4 className="text-xs font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-3 text-left">Syllabus Topics</h4>
                      {selectedModule.topics?.map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedTopicIdx(idx)}
                          className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 cursor-pointer ${
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
                        <div className="text-left">
                          <span className="text-[10px] uppercase font-extrabold text-[#3B82F6] tracking-wider block">
                            Section {selectedTopicIdx + 1}
                          </span>
                          <h3 className="text-xl font-bold text-[var(--db-text-main)] mt-1">
                            {selectedModule.topics[selectedTopicIdx].title}
                          </h3>
                          <p className="text-sm text-[var(--db-text-secondary)] leading-relaxed whitespace-pre-wrap mt-2">
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
                        </div>
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
                    <div className="lg:col-span-1 card-glass p-5 rounded-2xl border border-[var(--db-card-border)] space-y-4 text-left">
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
                    <div className="lg:col-span-3 card-glass p-5 rounded-2xl border border-[var(--db-card-border)] space-y-4 text-left">
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
                          className="px-3 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
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
                        <div className="text-left">
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
                            className="w-full py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-xs font-bold text-[#8B5CF6] rounded-xl flex items-center justify-center gap-1 hover:from-purple-500/20 transition-all cursor-pointer"
                          >
                            <Sparkles size={12} /> AI Copilot Hints
                          </button>
                          {showAiHint && (
                            <div className="p-3 bg-purple-500/5 border border-purple-500/10 text-[10px] text-[var(--db-text-muted)] rounded-xl leading-relaxed text-left">
                              💡 Use <code>System.out.println()</code> blocks to write strings to console output.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'practice' && (
                  <div className="card-glass p-6 rounded-2xl border border-[var(--db-card-border)] space-y-6 text-left">
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
                        <button className="px-3.5 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded-xl hover:bg-[#2563EB] transition-colors cursor-pointer">
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
                  <div className="card-glass p-6 rounded-2xl border border-[var(--db-card-border)] max-w-xl mx-auto space-y-6 text-left">
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
                              className={`w-full text-left p-3.5 rounded-xl text-xs font-semibold border transition-all flex justify-between items-center cursor-pointer ${
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
                  <div className="card-glass p-6 rounded-2xl border border-[var(--db-card-border)] space-y-4 text-left">
                    <h3 className="text-lg font-bold text-[var(--db-text-main)]">Personal Study Notes</h3>
                    <textarea
                      placeholder="Capture key class constructs, exception handling syntaxes, or thread methods here. Notes are stored locally inside the profile..."
                      className="w-full h-40 bg-[var(--db-input-bg)] text-[var(--db-text-main)] text-xs p-4 rounded-xl border border-[var(--db-input-border)] focus:outline-none leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <button className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded-xl hover:bg-[#2563EB] transition-colors cursor-pointer">
                        Save Notes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
      
    </div>
  );
}
