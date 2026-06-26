import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Play, Code, CheckCircle, HelpCircle, FileText,
  ChevronRight, Award, Compass, Flame, TrendingUp, PlayCircle,
  Code2, Terminal, Info, RefreshCw, Layers, Database, Zap,
  BrainCircuit, ShieldAlert, Sparkles, Star, Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
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
  },
  {
    id: 99,
    title: 'Advanced Java',
    description: 'Master enterprise backend architectures: JDBC database connectivity, Java Servlets lifecycle routines, JSP views, ORM Hibernate structures, Spring Framework dependency injection, and REST API controllers.',
    difficulty: 'Advanced',
    duration: '45 hours',
    xp: 1500,
    accent: '#8B5CF6',
    icon: Trophy,
    progress: 40,
    topics: []
  }
];

export default function JavaLab({ subjectName }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (subjectName === 'Advanced Java') {
      setSelectedModule({ id: 99, title: 'Advanced Java' });
    } else {
      setSelectedModule(null);
    }
  }, [subjectName]);

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
          selectedModule.id === 99 ? (
            <AdvancedJavaLMS selectedModule={selectedModule} setSelectedModule={setSelectedModule} subjectName={subjectName} />
          ) : selectedModule.id === 1 ? (
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
                          <span className="text-slate-500">──(javac compiler)──&gt;</span>
                          <span className="p-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded">.class bytecode</span>
                          <span className="text-slate-500">──(JVM interpreter)──&gt;</span>
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

// ═══════════════════════════════════════════════════════════
// THEORY-FIRST CURRICULUM WORKSPACE MODULE COMPONENT (15 STEPS)
// ═══════════════════════════════════════════════════════════
function TheoryFirstModule({
  title,
  icon: Icon,
  introduction,
  theoryContent,
  aiExplanation,
  useCases,
  architectureDiagram,
  workflowDiagram,
  steps,
  interviewQuestions,
  importantNotes,
  visualization,
  simulator,
  practiceQuestions,
  codingExercise,
  miniProject,
  quiz
}) {
  const [expandedQA, setExpandedQA] = useState({});
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceFeedback, setPracticeFeedback] = useState({});
  const [code, setCode] = useState(codingExercise?.boilerplate || '');
  const [codeFeedback, setCodeFeedback] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  const toggleQA = (idx) => {
    setExpandedQA(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handlePracticeSubmit = (idx, selectedOpt) => {
    const isCorrect = selectedOpt === practiceQuestions[idx].correct;
    setPracticeAnswers(prev => ({ ...prev, [idx]: selectedOpt }));
    setPracticeFeedback(prev => ({
      ...prev,
      [idx]: {
        isCorrect,
        explanation: practiceQuestions[idx].explanation
      }
    }));
    if (isCorrect) {
      toast.success('Correct Answer! +10 XP');
    } else {
      toast.error('Incorrect. Read the explanation.');
    }
  };

  const checkCode = () => {
    if (!codingExercise) return;
    const testRegex = new RegExp(codingExercise.solutionRegex, 'i');
    if (testRegex.test(code)) {
      setCodeFeedback('✓ Code matches required pattern! Compilation successful.');
      toast.success('Coding exercise solved! +30 XP');
    } else {
      setCodeFeedback('✗ Solution check failed. Please ensure your implementation matches instructions.');
      toast.error('Check failed. Try again.');
    }
  };

  const handleQuizSubmit = () => {
    if (!quiz) return;
    let correctCount = 0;
    quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) correctCount++;
    });
    const score = Math.round((correctCount / quiz.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score >= 70) {
      toast.success(`Quiz passed with ${score}%! +50 XP`);
    } else {
      toast.error(`Score: ${score}%. Minimum 70% required to pass.`);
    }
  };

  return (
    <div className="space-y-12 text-left">
      {/* 1. INTRODUCTION */}
      <section className="card-glass p-6 rounded-[28px] border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-2xl">
            <Icon size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-purple-400">Step 1 of 15 • Introduction</span>
            <h2 className="text-2xl font-extrabold text-white">{title} Overview</h2>
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{introduction}</p>
      </section>

      {/* 2. THEORY EXPLANATION */}
      <section className="card-glass p-6 rounded-[28px] border border-white/10 space-y-4">
        <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400">Step 2 of 15 • Advanced Theory Deep-Dive</span>
        <div className="prose prose-invert text-slate-300 text-sm leading-relaxed space-y-4 font-normal">
          {theoryContent}
        </div>
      </section>

      {/* 3. AI SIMPLIFIED EXPLANATION */}
      <section className="p-6 rounded-[24px] bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-transparent border border-violet-500/20 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-violet-400">Step 3 of 15 • AI ELI5 Simplified Explanation</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs italic text-slate-300 leading-normal">
          {aiExplanation}
        </div>
      </section>

      {/* 4. REAL WORLD USE CASES */}
      <section className="card-glass p-6 rounded-[28px] border border-white/10 space-y-4">
        <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">Step 4 of 15 • Real-World Industry Application</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useCases.map((uc, i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
              <strong className="text-sm text-emerald-400 block font-bold">🚀 {uc.title}</strong>
              <p className="text-xs text-slate-400 leading-relaxed">{uc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5 & 6. DIAGRAMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="card-glass p-6 rounded-[28px] border border-white/10 space-y-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Step 5 of 15 • System Architecture Diagram</span>
          <div className="py-4 bg-slate-950 border border-white/5 rounded-xl flex items-center justify-center">
            {architectureDiagram}
          </div>
        </section>

        <section className="card-glass p-6 rounded-[28px] border border-white/10 space-y-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Step 6 of 15 • Request/Response Workflow Diagram</span>
          <div className="py-4 bg-slate-950 border border-white/5 rounded-xl flex items-center justify-center">
            {workflowDiagram}
          </div>
        </section>
      </div>

      {/* 7. STEP-BY-STEP CONCEPTS */}
      <section className="card-glass p-6 rounded-[28px] border border-white/10 space-y-4">
        <span className="text-[10px] uppercase tracking-widest font-bold text-purple-400">Step 7 of 15 • Step-by-Step Concepts</span>
        <div className="space-y-3">
          {steps.map((st, i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
              <div>
                <strong className="text-sm text-slate-200 block mb-1 font-semibold">{st.title}</strong>
                <p className="text-xs text-slate-400 leading-normal">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. INTERVIEW QUESTIONS */}
      <section className="card-glass p-6 rounded-[28px] border border-white/10 space-y-4">
        <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400">Step 8 of 15 • Top Interview Prep Q&A</span>
        <div className="space-y-3">
          {interviewQuestions.map((q, i) => {
            const isOpen = !!expandedQA[i];
            return (
              <div key={i} className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                <button
                  onClick={() => toggleQA(i)}
                  className="w-full text-left p-4 flex justify-between items-center text-xs font-bold text-white hover:bg-white/5 transition"
                >
                  <span>Q{i + 1}: {q.q}</span>
                  <span className="text-slate-400">{isOpen ? '▼' : '▶'}</span>
                </button>
                {isOpen && (
                  <div className="p-4 bg-black/35 border-t border-white/10 text-xs text-slate-300 leading-relaxed text-left">
                    {q.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. IMPORTANT NOTES */}
      <section className="p-6 rounded-[24px] bg-red-500/5 border border-red-500/20 space-y-3">
        <span className="text-[10px] uppercase tracking-widest font-bold text-red-400">Step 9 of 15 • Important Architectural Notes</span>
        <ul className="list-disc pl-5 text-xs text-slate-300 space-y-2 leading-relaxed">
          {importantNotes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      </section>

      {/* 10. INTERACTIVE VISUALIZATION */}
      <section className="card-glass p-6 rounded-[28px] border border-white/10 space-y-4">
        <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Step 10 of 15 • Interactive Memory/Runtime Visualization</span>
        <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl">
          {visualization}
        </div>
      </section>

      {/* 11. LIVE SIMULATOR */}
      <section className="card-glass p-6 rounded-[28px] border border-white/10 space-y-4">
        <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">Step 11 of 15 • Live Interactive Simulator Playground</span>
        <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl">
          {simulator}
        </div>
      </section>

      {/* 12. PRACTICE QUESTIONS */}
      <section className="card-glass p-6 rounded-[28px] border border-white/10 space-y-4">
        <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Step 12 of 15 • Daily Practice Challenge Checks</span>
        <div className="space-y-4">
          {practiceQuestions.map((pq, idx) => {
            const feedback = practiceFeedback[idx];
            const selected = practiceAnswers[idx];
            return (
              <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-300 block">Question {idx + 1}: {pq.q}</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {pq.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handlePracticeSubmit(idx, opt)}
                      className={`p-3 border rounded-xl text-left text-xs transition-all cursor-pointer ${
                        selected === opt 
                          ? (opt === pq.correct ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' : 'border-red-500 bg-red-500/10 text-red-400')
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {feedback && (
                  <div className="p-3 bg-black/45 rounded-xl border border-white/5 text-[11px] text-slate-300 leading-normal">
                    <span className={`font-bold block mb-1 ${feedback.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      {feedback.isCorrect ? '✓ Correct Answer!' : '✗ Try again!'}
                    </span>
                    {feedback.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 13. CODING EXERCISE */}
      {codingExercise && (
        <section className="card-glass p-6 rounded-[28px] border border-white/10 space-y-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400">Step 13 of 15 • Sandbox Coding Exercise</span>
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-slate-300 block">Task Instructions</span>
            <p className="text-xs text-slate-400 leading-relaxed">{codingExercise.instructions}</p>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-44 bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded-xl border border-white/10 outline-none focus:border-blue-500 resize-none"
            />
            
            <div className="flex gap-2">
              <button 
                onClick={checkCode}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Compile & Check Solution
              </button>
              <button 
                onClick={() => setCode(codingExercise.boilerplate)}
                className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset Boilerplate
              </button>
            </div>
            {codeFeedback && (
              <pre className={`p-3 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto ${
                codeFeedback.startsWith('✓') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {codeFeedback}
              </pre>
            )}
          </div>
        </section>
      )}

      {/* 14. MINI PROJECT */}
      {miniProject && (
        <section className="card-glass p-6 rounded-[28px] border border-white/10 space-y-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Step 14 of 15 • Portfolio Mini Project</span>
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
            <h4 className="text-sm font-bold text-white">{miniProject.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{miniProject.description}</p>
            <button
              onClick={() => {
                toast.success('Mini project template copied to workspace clipboard.');
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Initialize Project Workspace Template
            </button>
          </div>
        </section>
      )}

      {/* 15. MODULE QUIZ */}
      {quiz && (
        <section className="card-glass p-6 rounded-[28px] border border-white/10 space-y-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-purple-400">Step 15 of 15 • Final Module Evaluation Quiz</span>
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-4">
            {quiz.map((q, idx) => (
              <div key={idx} className="space-y-2 text-left">
                <span className="text-xs font-bold text-slate-300 block">{idx + 1}. {q.q}</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((opt) => {
                    const isSelected = quizAnswers[idx] === opt;
                    return (
                      <button
                        key={opt}
                        disabled={quizSubmitted}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [idx]: opt }))}
                        className={`p-3 border rounded-xl text-left text-xs transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-bold'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Submit Answers for Grading
              </button>
            ) : (
              <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl space-y-2 text-center">
                <span className="text-lg font-bold text-white block">Grading Complete</span>
                <span className={`text-xl font-black ${quizScore >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>{quizScore}% Score</span>
                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                    setQuizScore(null);
                  }}
                  className="mt-2 px-4 py-1.5 bg-white/5 border border-white/10 text-slate-300 text-xs rounded-xl cursor-pointer hover:bg-white/10"
                >
                  Retake Evaluation Quiz
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ADVANCED JAVA LEARNING MANAGEMENT SYSTEM (LMS) VIEW
// ═══════════════════════════════════════════════════════════
function AdvancedJavaLMS({ selectedModule, setSelectedModule, subjectName }) {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [modulesList, setModulesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Interactive Playgrounds State
  const [jdbcUrl, setJdbcUrl] = useState('jdbc:postgresql://localhost:5432/eduverse');
  const [jdbcStatus, setJdbcStatus] = useState('');
  const [crudSimRecords, setCrudSimRecords] = useState([
    { id: 1, name: 'Alice Student', course: 'Java Fundamentals' },
    { id: 2, name: 'Bob Engineer', course: 'Spring Boot APIs' }
  ]);
  const [newRecordName, setNewRecordName] = useState('');
  const [preparedSql, setPreparedSql] = useState('SELECT * FROM students WHERE id = ?');
  const [preparedVal, setPreparedVal] = useState('1');
  const [prepResult, setPrepResult] = useState('');
  const [transactionLog, setTransactionLog] = useState([]);
  const [connectionPool, setConnectionPool] = useState({ active: 2, idle: 8, total: 10 });
  const [sqlErrorQuery, setSqlErrorQuery] = useState('SELET * FROM users WHERE id = 1');
  const [aiSqlHint, setAiSqlHint] = useState('');

  // Servlet State
  const [servletMethod, setServletMethod] = useState('GET');
  const [servletOutput, setServletOutput] = useState('');
  const [sessionVal, setSessionVal] = useState('');
  const [reqDispatcherDest, setReqDispatcherDest] = useState('/dashboard');

  // JSP State
  const [jspCode, setJspCode] = useState('<%@ page language="java" %>\n<html>\n<body>\n  <h2>Welcome <%= request.getParameter("name") %></h2>\n</body>\n</html>');
  const [jspPreview, setJspPreview] = useState('');

  // Session State
  const [cookieSimKey, setCookieSimKey] = useState('JSESSIONID');
  const [cookieSimVal, setCookieSimVal] = useState('4F9D7C2B1A');
  const [sessionUser, setSessionUser] = useState('');
  const [sessionLogs, setSessionLogs] = useState([]);

  // Hibernate State
  const [entityMapping, setEntityMapping] = useState({ entity: 'Student', table: 'students', idType: 'Long' });
  const [relationshipType, setRelationshipType] = useState('One-To-Many');
  
  // Spring State
  const [starterGroup, setStarterGroup] = useState('com.eduverse');
  const [starterArtifact, setStarterArtifact] = useState('advanced-java-demo');
  const [springDeps, setSpringDeps] = useState(['web', 'jpa', 'postgresql']);

  // REST API Client State
  const [restMethod, setRestMethod] = useState('GET');
  const [restUrl, setRestUrl] = useState('/api/advanced-java/dashboard');
  const [restBody, setRestBody] = useState('{\n  "name": "Jane"\n}');
  const [restResCode, setRestResCode] = useState(200);
  const [restResBody, setRestResBody] = useState('');
  const [restResTime, setRestResTime] = useState(0);

  // Projects State
  const [projectsList, setProjectsList] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [projectCode, setProjectCode] = useState('public class StudentRegistry {\n  // Implement SMS code\n}');

  // Practice State
  const [practiceList, setPracticeList] = useState([]);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceFeedback, setPracticeFeedback] = useState({});

  // Coding Lab State
  const [sandboxCode, setSandboxCode] = useState('public class AdvancedSandbox {\n  public static void main(String[] args) {\n    System.out.println("Executing JVM sandbox...");\n  }\n}');
  const [sandboxConsole, setSandboxConsole] = useState('');
  const [aiSandboxAnalysis, setAiSandboxAnalysis] = useState('');

  // AI Mentor State
  const [weakAreas, setWeakAreas] = useState('Hibernate mapping optimization, Spring MVC routing parameters');
  const [interviewOutput, setInterviewOutput] = useState('');

  // Load backend data
  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/advanced-java/dashboard');
      setDashboardData(res.data);
      const mods = await api.get('/api/advanced-java/modules');
      setModulesList(mods.data);
      const projs = await api.get('/api/advanced-java/projects');
      setProjectsList(projs.data);
      const prac = await api.get('/api/advanced-java/practice');
      setPracticeList(prac.data);
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message || 'Failed to load dashboard records.';
      toast.error(`Failed to load dashboard records: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleMarkTopicComplete = async (topicId, complete) => {
    try {
      const res = await api.post('/api/advanced-java/topic/complete', { topicId, complete });
      toast.success(complete ? 'Topic marked complete! (+50 XP)' : 'Topic completion reverted.');
      loadDashboard();
    } catch (e) {
      toast.error('Failed to toggle completion.');
    }
  };

  const handleSaveNotes = async (topicId, notes) => {
    try {
      await api.post('/api/advanced-java/topic/notes', { topicId, notes });
      toast.success('Study notes synced to your cloud account.');
    } catch (e) {
      toast.error('Failed to save notes.');
    }
  };

  const handleClaimCertificate = async () => {
    try {
      const res = await api.post('/api/advanced-java/certificate/claim');
      toast.success('Congratulations! Your Certificate is issued.');
      loadDashboard();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Verification threshold not met yet.');
    }
  };

  const handleProjectSubmit = async (projectId) => {
    try {
      const res = await api.post('/api/advanced-java/project/submit', { projectId, code: projectCode });
      toast.success('Project submitted for AI review! (+200 XP)');
      loadDashboard();
    } catch (e) {
      toast.error('Project submission failed.');
    }
  };

  const handlePracticeSubmit = async (questionId, ans) => {
    try {
      const res = await api.post('/api/advanced-java/practice/submit', { questionId, answer: ans });
      setPracticeFeedback({ ...practiceFeedback, [questionId]: res.data });
      if (res.data.isCorrect) {
        toast.success('Correct answer! (+20 XP)');
      } else {
        toast.error('Incorrect. Review explanation.');
      }
      loadDashboard();
    } catch (e) {
      toast.error('Submit failed.');
    }
  };

  const testJdbcConnection = () => {
    setJdbcStatus('Testing database credentials...');
    setTimeout(() => {
      if (jdbcUrl.includes('eduverse')) {
        setJdbcStatus('✓ JDBC Connection Successful. PostgreSQL Database verified.');
        toast.success('Connection Active');
      } else {
        setJdbcStatus('✗ Connection Failed: Database schema not found.');
        toast.error('JDBC Dialect Mismatch');
      }
    }, 1200);
  };

  const runRestRequest = () => {
    setRestResTime(Math.floor(Math.random() * 200) + 40);
    if (restUrl.includes('dashboard')) {
      setRestResCode(200);
      setRestResBody(JSON.stringify({ status: 'success', data: dashboardData }, null, 2));
    } else {
      setRestResCode(404);
      setRestResBody('{\n  "message": "Resource endpoint not found."\n}');
    }
    toast.success('API Response Received');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 text-white text-sm font-bold gap-2">
        <RefreshCw className="animate-spin text-blue-500" /> Retrieving Database Records...
      </div>
    );
  }

  const progress = dashboardData?.progress || {};

  return (
    <div className="java-learning-path max-w-[1440px] mx-auto p-4 sm:p-8 space-y-6 text-slate-100 font-sans text-left">
      {activePanel === 'dashboard' ? (
        <div className="space-y-6">
          {/* HEADER BAR */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/subjects')} 
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition text-slate-400 hover:text-white cursor-pointer"
                >
                  <Compass className="transform rotate-180" size={16} />
                </button>
                <h1 className="text-3xl font-extrabold text-white">Advanced Java</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">Enterprise Backend Development & Java Web Technologies</p>
            </div>
          </div>

          {/* STAT CARDS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Total XP */}
            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl backdrop-blur-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <strong className="text-2xl font-black text-white">{progress.current_level * 1000 + 450}</strong>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mt-0.5">Total XP</span>
              </div>
            </div>

            {/* Card 2: Streak */}
            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl backdrop-blur-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Flame size={20} fill="currentColor" />
              </div>
              <div>
                <strong className="text-2xl font-black text-white">{progress.learning_streak} Days</strong>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mt-0.5">Streak</span>
              </div>
            </div>

            {/* Card 3: Modules Completed */}
            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl backdrop-blur-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Trophy size={20} />
              </div>
              <div>
                <strong className="text-2xl font-black text-white">{progress.completed_topics || 0}</strong>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mt-0.5">Modules Completed</span>
              </div>
            </div>
          </div>

          {/* CONTROL / SEARCH ROW */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-white/5">
            <p className="text-xs text-slate-400 leading-relaxed text-left">
              Choose a module to begin. Visualize concepts, run code, and simulate execution step-by-step.
            </p>
            <div className="relative min-w-[280px]">
              <input 
                type="text" 
                placeholder="Search Advanced Java modules..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[
              { id: 'jdbc', label: 'JDBC Database Connectivity', desc: 'Connect Java apps to SQL databases, manage drivers, construct statements, and read ResultSet cursors.', icon: Database, accent: '#3B82F6', index: 1 },
              { id: 'servlets', label: 'Java Servlets Lifecycle', desc: 'Process HTTP client requests on the web server side, and manage request-response handler hooks.', icon: Layers, accent: '#10B981', index: 2 },
              { id: 'jsp', label: 'Java Server Pages (JSP)', desc: 'Design template dynamic HTML layouts, bind data values, and build interactive container views.', icon: FileText, accent: '#8B5CF6', index: 3 },
              { id: 'session', label: 'Session Management', desc: 'Identify stateful clients across stateless HTTP requests using Cookies and HTTPSession memory bindings.', icon: ShieldAlert, accent: '#EF4444', index: 4 },
              { id: 'hibernate', label: 'Hibernate ORM Framework', desc: 'Map Java object entities to relational database tables, and configure dynamic query mappings.', icon: RefreshCw, accent: '#F59E0B', index: 5 },
              { id: 'spring-core', label: 'Spring Core & IoC', desc: 'Resolve object dependencies dynamically via Dependency Injection and configure Spring bean structures.', icon: Zap, accent: '#3B82F6', index: 6 },
              { id: 'spring-mvc', label: 'Spring MVC Routing', desc: 'Dispatch HTTP requests to annotation-driven handler controllers and configure DispatcherServlets.', icon: Compass, accent: '#06B6D4', index: 7 },
              { id: 'spring-boot', label: 'Spring Boot Orchestrator', desc: 'Build zero-XML standalone enterprise services utilizing auto-configurations and embedded Tomcat runtimes.', icon: Award, accent: '#14B8A6', index: 8 },
              { id: 'rest-api', label: 'REST APIs Services', desc: 'Design decoupled client-server web APIs utilizing path variables, query params, and JSON payloads.', icon: Terminal, accent: '#10B981', index: 9 },
              { id: 'spring-sec', label: 'Spring Security Chains', desc: 'Intercept incoming network routes using security filters and enforce method-level role authorization.', icon: ShieldAlert, accent: '#8B5CF6', index: 10 },
              { id: 'maven-gradle', label: 'Maven & Gradle Builds', desc: 'Automate compiling, packaging, testing, and dependency resolution of backend Java applications.', icon: Flame, accent: '#F97316', index: 11 },
              { id: 'microservices', label: 'Microservices & Discovery', desc: 'Deploy decentralized services, configure API Gateway routing, and register heartbeats with Eureka.', icon: Compass, accent: '#6366F1', index: 12 },
              { id: 'coding-lab', label: 'JVM Coding Lab Sandbox', desc: 'Compile and run advanced Java source code inside the terminal compiler workspace sandbox.', icon: PlayCircle, accent: '#38BDF8', index: 13, isTool: true },
              { id: 'practice', label: 'Curriculum Practice', desc: 'Solve multiple-choice challenges, view automated scoring, and study code explanations.', icon: Sparkles, accent: '#EC4899', index: 14, isTool: true },
              { id: 'mentor', label: 'AI Study Mentor Guidance', desc: 'Engage with custom AI study models for feedback, code verification, and real interview preparation.', icon: BrainCircuit, accent: '#A855F7', index: 15, isTool: true },
              { id: 'analytics', label: 'Performance Analytics', desc: 'Analyze dynamic progress graphs, strength distributions, and weak points tracking stats.', icon: TrendingUp, accent: '#10B981', index: 16, isTool: true },
              { id: 'achievements', label: 'Badges & Streak Rewards', desc: 'Earn badges, accumulate XP credits, track study streaks, and unlock certification steps.', icon: Trophy, accent: '#F59E0B', index: 17, isTool: true },
              { id: 'certification', label: 'Advanced Java Certificate', desc: 'Verify complete progress, claim credentials, and download export-ready PDF certificates.', icon: Award, accent: '#E11D48', index: 18, isTool: true }
            ]
              .filter(card => 
                card.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                card.desc.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((card) => {
                const CardIcon = card.icon;
                const completedCount = progress.completed_topics || 0;
                
                // Determine module status
                let percent = 0;
                let status = 'NOT STARTED';
                let badgeClass = 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
                
                if (card.isTool) {
                  status = 'ACTIVE';
                  percent = 100;
                  badgeClass = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
                } else {
                  if (completedCount >= card.index) {
                    percent = 100;
                    status = 'COMPLETED';
                    badgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                  } else if (completedCount + 1 === card.index) {
                    percent = 33;
                    status = 'ACTIVE';
                    badgeClass = 'bg-pink-500/10 text-pink-400 border border-pink-500/20';
                  }
                }

                return (
                  <div
                    key={card.id}
                    onClick={() => setActivePanel(card.id)}
                    className="bg-white/5 border border-white/10 rounded-[28px] hover:bg-white/10 transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer text-left hover:scale-[1.01] hover:border-white/20 group relative overflow-hidden"
                  >
                    {/* Top Row with Icon, Progress Ring, and Badge */}
                    <div className="flex justify-between items-center w-full mb-6">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: `${card.accent}12`, color: card.accent }}
                      >
                        <CardIcon size={20} />
                      </div>

                      {/* Small Progress Ring */}
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle className="text-white/10" strokeWidth="3" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                            <circle 
                              style={{ stroke: card.accent }}
                              strokeWidth="3" 
                              strokeDasharray="100" 
                              strokeDashoffset={100 - percent} 
                              strokeLinecap="round" 
                              stroke="currentColor" 
                              fill="transparent" 
                              r="16" 
                              cx="18" 
                              cy="18" 
                            />
                          </svg>
                          <span className="absolute text-[8px] font-black text-slate-300">{percent}%</span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}>
                          {status}
                        </span>
                      </div>
                    </div>

                    {/* Card Title & Desc */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                        {card.label}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {card.desc}
                      </p>
                    </div>

                    {/* Action footer */}
                    <div className="flex items-center justify-between mt-6 pt-3 border-t border-white/5 text-[10px] text-slate-500 font-bold uppercase">
                      <span>Course Module</span>
                      <span className="text-slate-300 group-hover:text-purple-400 transition-colors">Begin Study →</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* FULL SCREEN WORKSPACE VIEW HEADER WITH BACK BUTTON */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActivePanel('dashboard')}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                ← Back to Dashboard
              </button>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Advanced Java Developer Track</span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">Workspace Lab</h2>
              </div>
            </div>
          </div>

          {/* WORKSPACE CONTENT FULL WIDTH */}
          <div className="w-full">
          
          {/* DASHBOARD TAB */}
          {activePanel === 'dashboard' && (
            <div className="space-y-6 text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="text-left">
                  <h3 className="text-2xl font-black text-white">Advanced Java LMS Dashboard</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Bridge core Java fundamentals with enterprise backend architectures, persistent databases, and secure REST APIs.
                  </p>
                </div>
                {/* Claim certificate banner */}
                <div className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl flex items-center gap-3">
                  <span className="text-[10px] text-slate-300">Syllabus complete? Claim certificate!</span>
                  <button 
                    onClick={handleClaimCertificate}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[10px] font-bold rounded-lg cursor-pointer transition"
                  >
                    Claim Certificate
                  </button>
                </div>
              </div>

              {/* AI Study recommendation header card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">💡 AI Study Recommendation</span>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {dashboardData?.aiRecommendations?.recommendations || 'Focus on Spring Core IoC dependency injection lifecycles and JDBC DriverManager configurations to complete current daily tasks.'}
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-2 font-mono">Next Recommended Action: {dashboardData?.aiRecommendations?.next_best_action || 'Launch JDBC module and run prepared statement simulator.'}</span>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">🎯 Learning Strengths</span>
                  <ul className="text-xs text-slate-300 space-y-1.5 mt-2 list-disc pl-4">
                    <li>DriverManager and JDBC connection parameters</li>
                    <li>REST API controller method mappings</li>
                    <li>Tomcat Servlet runtime server hooks</li>
                  </ul>
                </div>
              </div>

              {/* DYNAMIC CURRICULUM SYLLABUS CARDS GRID */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left mb-4">LMS Course Curriculum Modules</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { id: 'jdbc', label: 'JDBC Database Connectivity', desc: 'Connect Java apps to SQL databases, manage drivers, construct statements, and read ResultSet cursors.', icon: Database, accent: '#3B82F6', type: 'Core Database' },
                    { id: 'servlets', label: 'Java Servlets Lifecycle', desc: 'Process HTTP client requests on the web server side, and manage request-response handler hooks.', icon: Layers, accent: '#10B981', type: 'Web Container' },
                    { id: 'jsp', label: 'Java Server Pages (JSP)', desc: 'Design template dynamic HTML layouts, bind data values, and build interactive container views.', icon: FileText, accent: '#8B5CF6', type: 'Views Template' },
                    { id: 'session', label: 'Session Management', desc: 'Identify stateful clients across stateless HTTP requests using Cookies and HTTPSession memory bindings.', icon: ShieldAlert, accent: '#EF4444', type: 'Security State' },
                    { id: 'hibernate', label: 'Hibernate ORM Framework', desc: 'Map Java object entities to relational database tables, and configure dynamic query mappings.', icon: RefreshCw, accent: '#F59E0B', type: 'ORM Persistency' },
                    { id: 'spring-core', label: 'Spring Core & IoC', desc: 'Resolve object dependencies dynamically via Dependency Injection and configure Spring bean structures.', icon: Zap, accent: '#3B82F6', type: 'IoC Engine' },
                    { id: 'spring-mvc', label: 'Spring MVC Routing', desc: 'Dispatch HTTP requests to annotation-driven handler controllers and configure DispatcherServlets.', icon: Compass, accent: '#06B6D4', type: 'Web MVC' },
                    { id: 'spring-boot', label: 'Spring Boot Orchestrator', desc: 'Build zero-XML standalone enterprise services utilizing auto-configurations and embedded Tomcat runtimes.', icon: Award, accent: '#14B8A6', type: 'Auto-Config Server' },
                    { id: 'rest-api', label: 'REST APIs Services', desc: 'Design decoupled client-server web APIs utilizing path variables, query params, and JSON payloads.', icon: Terminal, accent: '#10B981', type: 'API endpoints' },
                    { id: 'spring-sec', label: 'Spring Security Chains', desc: 'Intercept incoming network routes using security filters and enforce method-level role authorization.', icon: ShieldAlert, accent: '#8B5CF6', type: 'Security Filter' },
                    { id: 'maven-gradle', label: 'Maven & Gradle Builds', desc: 'Automate compiling, packaging, testing, and dependency resolution of backend Java applications.', icon: Flame, accent: '#F97316', type: 'Build Automation' },
                    { id: 'microservices', label: 'Microservices & Discovery', desc: 'Deploy decentralized services, configure API Gateway routing, and register heartbeats with Eureka.', icon: Compass, accent: '#6366F1', type: 'Cloud Infrastructure' },
                    { id: 'coding-lab', label: 'JVM Coding Lab Sandbox', desc: 'Compile and run advanced Java source code inside the terminal compiler workspace sandbox.', icon: PlayCircle, accent: '#38BDF8', type: 'Developer Console' },
                    { id: 'practice', label: 'Curriculum Practice', desc: 'Solve multiple-choice challenges, view automated scoring, and study code explanations.', icon: Sparkles, accent: '#EC4899', type: 'Evaluation Corner' },
                    { id: 'mentor', label: 'AI Study Mentor Guidance', desc: 'Engage with custom AI study models for feedback, code verification, and real interview preparation.', icon: BrainCircuit, accent: '#A855F7', type: 'Generative AI Tutor' },
                    { id: 'analytics', label: 'Performance Analytics', desc: 'Analyze dynamic progress graphs, strength distributions, and weak points tracking stats.', icon: TrendingUp, accent: '#10B981', type: 'Progress Reports' },
                    { id: 'achievements', label: 'Badges & Streak Rewards', desc: 'Earn badges, accumulate XP credits, track study streaks, and unlock certification steps.', icon: Trophy, accent: '#F59E0B', type: 'Milestone Rewards' },
                    { id: 'certification', label: 'Advanced Java Certificate', desc: 'Verify complete progress, claim credentials, and download export-ready PDF certificates.', icon: Award, accent: '#E11D48', type: 'Professional Credential' }
                  ].map((card) => {
                    const CardIcon = card.icon;
                    return (
                      <div
                        key={card.id}
                        onClick={() => setActivePanel(card.id)}
                        className="bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 p-4 flex flex-col justify-between cursor-pointer text-left hover:scale-[1.01] hover:border-white/20 group"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span 
                              className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                              style={{ background: `${card.accent}15`, color: card.accent }}
                            >
                              {card.type}
                            </span>
                            <div 
                              className="p-1.5 rounded-lg"
                              style={{ background: `${card.accent}12`, color: card.accent }}
                            >
                              <CardIcon size={16} />
                            </div>
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-purple-400 transition-colors">
                            {card.label}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                            {card.desc}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-2 border-t border-white/5 text-[10px] text-slate-500">
                          <span>Progress ready</span>
                          <span className="font-semibold text-slate-300 group-hover:text-purple-400 transition-colors">Launch Module →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
            <TheoryFirstModule
              title="Java Database Connectivity (JDBC)"
              icon={Database}
              introduction="Java Database Connectivity (JDBC) is the industry-standard Java API that enables Java applications to connect to, query, and manipulate relational databases. It provides a standard set of interfaces that abstract database-specific driver implementations, allowing you to write write-once database logic."
              theoryContent={
                <div className="space-y-4 text-left">
                  <p>
                    Relational databases form the backbone of modern enterprise storage. JDBC acts as a bridge between the object-oriented Java programming language and relational SQL databases. Before JDBC, developers had to write database-specific native code, making applications tightly coupled to a single vendor (e.g. Oracle, MySQL).
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white mb-2">Core JDBC Components:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      <li><strong>DriverManager:</strong> Manages the list of database drivers and establishes connections.</li>
                      <li><strong>Connection:</strong> Represents a physical session with the database.</li>
                      <li><strong>Statement:</strong> Interface used to execute static SQL statements and return results.</li>
                      <li><strong>PreparedStatement:</strong> Pre-compiles SQL queries on the server to prevent SQL Injection and optimize execution.</li>
                      <li><strong>ResultSet:</strong> A cursor pointing to the rows returned by an executed database query.</li>
                    </ul>
                  </div>
                  <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto">
{`// Classic JDBC Connection Lifecycle
Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/db", "user", "pass");
PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM students WHERE id = ?");
pstmt.setInt(1, 101);
ResultSet rs = pstmt.executeQuery();
while(rs.next()) {
    System.out.println("Student: " + rs.getString("name"));
}
conn.close();`}
                  </pre>
                </div>
              }
              aiExplanation="Think of JDBC like a universal adapter for databases. Imagine your Java program is a phone, and databases (Postgres, Oracle, MySQL) are different wall sockets worldwide. JDBC is the universal travel plug adapter that lets your phone charge from any socket without changing its charger cord!"
              useCases={[
                { title: "Enterprise Database Integrations", desc: "Connecting enterprise CRM or ERP platforms to centralized SQL data warehouses." },
                { title: "High-Throughput ETL Pipelines", desc: "Extracting transaction data batches from production servers and transforming them to analysis grids." }
              ]}
              architectureDiagram={
                <svg viewBox="0 0 400 160" className="w-full max-h-[140px]">
                  <rect x="10" y="10" width="380" height="30" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="2" />
                  <text x="200" y="30" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">Java Application (Java Code)</text>

                  <path d="M 200 40 L 200 65" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <rect x="10" y="65" width="380" height="30" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="200" y="85" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">JDBC API Wrapper (DriverManager)</text>

                  <path d="M 100 95 L 60 120" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 300 95 L 340 120" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <rect x="10" y="120" width="160" height="30" rx="6" fill="#0f172a" stroke="#10B981" strokeWidth="1.5" />
                  <text x="90" y="138" textAnchor="middle" fill="#10B981" fontSize="10">PostgreSQL Driver</text>

                  <rect x="230" y="120" width="160" height="30" rx="6" fill="#0f172a" stroke="#10B981" strokeWidth="1.5" />
                  <text x="310" y="138" textAnchor="middle" fill="#10B981" fontSize="10">MySQL Driver</text>
                </svg>
              }
              workflowDiagram={
                <svg viewBox="0 0 500 80" className="w-full max-h-[70px]">
                  <g transform="translate(10, 10)">
                    <rect x="0" y="0" width="80" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="1" />
                    <text x="40" y="24" textAnchor="middle" fill="#fff" fontSize="9">1. Connect</text>
                  </g>
                  <path d="M 95 30 L 125 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  
                  <g transform="translate(130, 10)">
                    <rect x="0" y="0" width="80" height="40" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="1" />
                    <text x="40" y="24" textAnchor="middle" fill="#fff" fontSize="9">2. Prepare SQL</text>
                  </g>
                  <path d="M 215 30 L 245 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(250, 10)">
                    <rect x="0" y="0" width="80" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1" />
                    <text x="40" y="24" textAnchor="middle" fill="#fff" fontSize="9">3. Execute</text>
                  </g>
                  <path d="M 335 30 L 365 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(370, 10)">
                    <rect x="0" y="0" width="110" height="40" rx="6" fill="#1e1b4b" stroke="#F59E0B" strokeWidth="1" />
                    <text x="55" y="24" textAnchor="middle" fill="#fff" fontSize="9">4. Read ResultSet</text>
                  </g>
                </svg>
              }
              steps={[
                { title: "Load Database Driver", desc: "Use Class.forName() to dynamically load the vendor-specific database driver class into the JVM memory space." },
                { title: "Establish Connection", desc: "Call DriverManager.getConnection() with connection string, username, and password credentials." },
                { title: "Compile PreparedStatement", desc: "Prepare and pre-compile SQL queries to optimize access execution paths on database server." },
                { title: "Execute Query & Read ResultSet", desc: "Execute query, scan row blocks, extract columns, and release connection resources in a finally block." }
              ]}
              interviewQuestions={[
                { q: "What is the difference between Statement and PreparedStatement?", a: "Statement compiles SQL queries at runtime on every execution. PreparedStatement pre-compiles query templates on the database server, enabling parameter binding, which drastically improves performance and prevents SQL injection attacks." },
                { q: "How do you handle transactions in JDBC?", a: "By default, JDBC operates in auto-commit mode where every statement commits immediately. To manage transactions manually, call conn.setAutoCommit(false), execute statements, and invoke conn.commit() on success or conn.rollback() on exceptions inside a catch block." }
              ]}
              importantNotes={[
                "Always close ResultSet, Statement, and Connection objects to prevent severe database connection leaks.",
                "Using connection pooling (e.g. HikariCP) is mandatory in production web services to avoid connection initiation latency."
              ]}
              visualization={
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300">Connection Pool Simulator State</h4>
                  <div className="flex justify-around items-center gap-2 p-3 bg-black/45 rounded-xl">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block">Active Connections</span>
                      <strong className="text-lg text-red-400 font-bold">{connectionPool.active}</strong>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block">Idle Connections</span>
                      <strong className="text-lg text-emerald-400 font-bold">{connectionPool.idle}</strong>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block">Total Pool Capacity</span>
                      <strong className="text-lg text-blue-400 font-bold">{connectionPool.total}</strong>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (connectionPool.idle > 0) {
                          setConnectionPool({ active: connectionPool.active + 1, idle: connectionPool.idle - 1, total: 10 });
                          toast.success('Connection leased from HikariCP Pool');
                        }
                      }}
                      className="px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Lease Connection
                    </button>
                    <button 
                      onClick={() => {
                        if (connectionPool.active > 0) {
                          setConnectionPool({ active: connectionPool.active - 1, idle: connectionPool.idle + 1, total: 10 });
                          toast.success('Connection returned to HikariCP Pool');
                        }
                      }}
                      className="px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Release Connection
                    </button>
                  </div>
                </div>
              }
              simulator={
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">Database Connection URL Configuration</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={jdbcUrl} 
                        onChange={(e) => setJdbcUrl(e.target.value)}
                        className="flex-grow px-3 py-1.5 bg-slate-850 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                      />
                      <button onClick={testJdbcConnection} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer transition">
                        Connect
                      </button>
                    </div>
                    {jdbcStatus && (
                      <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono leading-relaxed">
                        {jdbcStatus}
                      </pre>
                    )}
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-slate-300 block font-mono">PreparedStatement Parameter Binding</span>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder="SQL Input parameter" 
                        value={preparedVal} 
                        onChange={(e) => setPreparedVal(e.target.value)}
                        className="px-3 py-1.5 bg-slate-850 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                      />
                      <button 
                        onClick={() => {
                          setPrepResult(`Executing: ${preparedSql.replace('?', `'${preparedVal}'`)}\n\nQuery ResultSet:\n{ id: ${preparedVal}, name: 'Jane Doe', enrolled_course: 'Advanced Java' }`);
                          toast.success('Query executed safely');
                        }}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Bind & Execute Statement
                      </button>
                    </div>
                    {prepResult && (
                      <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono leading-relaxed">
                        {prepResult}
                      </pre>
                    )}
                  </div>
                </div>
              }
              practiceQuestions={[
                { q: "Which JDBC statement compiles SQL query templates on the database server?", options: ["Statement", "PreparedStatement", "CallableStatement", "ResultSet"], correct: "PreparedStatement", explanation: "PreparedStatement pre-compiles query templates on the database server." }
              ]}
              codingExercise={{
                instructions: "Complete the statement to retrieve database connection instance using DriverManager.",
                boilerplate: "Connection conn = DriverManager.________(\"jdbc:postgresql://localhost:5432/db\", \"user\", \"pass\");",
                solutionRegex: "getConnection"
              }}
              miniProject={{
                title: "Relational Student Directory Manager",
                description: "Implement a student record registry application executing direct SQL queries via PreparedStatement driver connections."
              }}
              quiz={[
                { q: "What exception is thrown when JDBC driver connection fails?", options: ["ConnectionException", "SQLException", "DatabaseException", "IOException"], correct: "SQLException", explanation: "SQLException handles failures occurring inside JDBC pipelines." }
              ]}
            />
          )}

          {/* SERVLETS TAB */}
          {activePanel === 'servlets' && (
            <TheoryFirstModule
              title="Java Servlets"
              icon={Layers}
              introduction="Java Servlets are server-side Java program modules that run inside a servlet container (such as Apache Tomcat) and dynamically handle client HTTP request-response lifecycles, forming the foundation of Java enterprise web architectures."
              theoryContent={
                <div className="space-y-4 text-left">
                  <p>
                    A Servlet is a Java class that extends `HttpServlet` and overrides methods like `doGet()` and `doPost()` to process user requests. The Servlet container manages the instantiation, execution, and destruction of servlets.
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white mb-2">Servlet Lifecycle Hooks:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      <li><strong>init():</strong> Invoked exactly once when the servlet is initialized by the container.</li>
                      <li><strong>service():</strong> Called for every incoming client request, dispatching to doGet/doPost.</li>
                      <li><strong>destroy():</strong> Called before the container removes the servlet from memory to clean resources.</li>
                    </ul>
                  </div>
                  <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto">
{`@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        resp.setContentType("text/html");
        PrintWriter out = resp.getWriter();
        out.println("<h1>Hello from Java Servlet Container!</h1>");
    }
}`}
                  </pre>
                </div>
              }
              aiExplanation="Think of a Web Servlet like a waiter at a restaurant. A customer (the browser) comes in and makes an order (HTTP GET request). The waiter (Servlet) goes to the kitchen (database/business logic), gets the food (data), and brings it back to the customer's table (HTTP response) formatted on a plate (HTML)!"
              useCases={[
                { title: "Dynamic HTML Generation", desc: "Serving personalized web page templates based on authenticated user session parameters." },
                { title: "Controller Router Layer", desc: "Interpreting route paths and forwarding requests to MVC backend workflows." }
              ]}
              architectureDiagram={
                <svg viewBox="0 0 400 160" className="w-full max-h-[140px]">
                  <rect x="10" y="10" width="100" height="140" rx="8" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="2" />
                  <text x="60" y="80" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">Client Browser</text>

                  <path d="M 110 50 L 190 50" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="150" y="42" textAnchor="middle" fill="#3B82F6" fontSize="9">GET /hello</text>

                  <path d="M 190 110 L 110 110" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="150" y="125" textAnchor="middle" fill="#10B981" fontSize="9">HTTP 200 (HTML)</text>

                  <rect x="200" y="10" width="190" height="140" rx="8" fill="#0f172a" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="295" y="30" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">Tomcat Servlet Container</text>

                  <rect x="215" y="55" width="160" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1.5" />
                  <text x="295" y="80" textAnchor="middle" fill="#10B981" fontSize="10">HelloServlet Instance</text>
                </svg>
              }
              workflowDiagram={
                <svg viewBox="0 0 500 80" className="w-full max-h-[70px]">
                  <g transform="translate(10, 10)">
                    <rect x="0" y="0" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="1" />
                    <text x="50" y="24" textAnchor="middle" fill="#fff" fontSize="9">init() - Startup</text>
                  </g>
                  <path d="M 115 30 L 145 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  
                  <g transform="translate(150, 10)">
                    <rect x="0" y="0" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="1" />
                    <text x="50" y="24" textAnchor="middle" fill="#fff" fontSize="9">service() - Dispatch</text>
                  </g>
                  <path d="M 255 30 L 285 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(290, 10)">
                    <rect x="0" y="0" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1" />
                    <text x="50" y="24" textAnchor="middle" fill="#fff" fontSize="9">doGet() / doPost()</text>
                  </g>
                  <path d="M 395 30 L 425 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(430, 10)">
                    <rect x="0" y="0" width="60" height="40" rx="6" fill="#1e1b4b" stroke="#EF4444" strokeWidth="1" />
                    <text x="30" y="24" textAnchor="middle" fill="#fff" fontSize="9">destroy()</text>
                  </g>
                </svg>
              }
              steps={[
                { title: "Servlet Loading", desc: "Servlet class file is loaded into the memory space by the ClassLoader of Tomcat Servlet Container." },
                { title: "Servlet Instantiation", desc: "Container instantiates the servlet class using default no-arg constructor." },
                { title: "Initialization (init)", desc: "init() method is called to configure setup states, such as database pooling setups." },
                { title: "Request Handling (service)", desc: "For every query request, service() intercepts it and delegates to corresponding HTTP handlers." }
              ]}
              interviewQuestions={[
                { q: "Are Java Servlets thread-safe?", a: "No. The servlet container creates only a single shared instance of a servlet class. Multiple concurrent threads access this instance, meaning local instance variables are not thread-safe. Keep all servlet operations stateless." },
                { q: "What is the difference between sendRedirect and RequestDispatcher?", a: "RequestDispatcher forwards the request internally on the server side without notifying the browser client (maintains URL). sendRedirect returns a 302 HTTP response instructing the browser to execute a fresh URL query request." }
              ]}
              importantNotes={[
                "Avoid using instance variables in servlet classes to prevent race conditions during concurrent user access.",
                "Register filters using @WebFilter annotations to handle session audits and authentication globally."
              ]}
              visualization={
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300">Tomcat Service Thread Simulator</h4>
                  <div className="p-3 bg-black/45 rounded-xl text-xs space-y-1 text-slate-300 font-mono">
                    <div>Active Request Dispatch Thread count: <b>4</b></div>
                    <div>JVM Heap Context Status: <b>Single Servlet Instance Leased</b></div>
                  </div>
                  <button 
                    onClick={() => {
                      toast.success('Simulation thread dispatched. doGet() callback triggered.');
                    }}
                    className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Simulate Client Concurrent Request
                  </button>
                </div>
              }
              simulator={
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">Servlet Request Method Simulator</span>
                    <div className="flex gap-2">
                      {['GET', 'POST'].map((m) => (
                        <button
                          key={m}
                          onClick={() => setServletMethod(m)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            servletMethod === m ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        setServletOutput(`HTTP/1.1 200 OK\nContent-Type: text/html\nDate: Jun 2026\n\n<h3>Servlet Executed Successfully</h3>\n<p>Response method: ${servletMethod}</p>`);
                        toast.success('Servlet request processed');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Fire Request to /hello
                    </button>
                    {servletOutput && (
                      <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono leading-relaxed">
                        {servletOutput}
                      </pre>
                    )}
                  </div>
                </div>
              }
              practiceQuestions={[
                { q: "Which class does a web developer extend to write user-defined servlets?", options: ["GenericServlet", "HttpServlet", "Servlet", "WebResponse"], correct: "HttpServlet", explanation: "HttpServlet handles all web request protocols directly." }
              ]}
              codingExercise={{
                instructions: "Override the standard HTTP GET request processing method hook header.",
                boilerplate: "protected void ________(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException",
                solutionRegex: "doGet"
              }}
              miniProject={{
                title: "Authentication Filter Gateway",
                description: "Implement a Web Filter checking session credentials before routing request dispatchers."
              }}
              quiz={[
                { q: "Which lifecycle method is invoked only once when the container initializes the servlet?", options: ["service()", "init()", "doGet()", "destroy()"], correct: "init()", explanation: "init() configures initialization variables once at startup." }
              ]}
            />
          )}

          {/* JSP TAB */}
          {activePanel === 'jsp' && (
            <TheoryFirstModule
              title="JavaServer Pages (JSP)"
              icon={FileText}
              introduction="JavaServer Pages (JSP) is a server-side presentation technology that allows developers to write template text (HTML, XML) integrated with dynamic Java scripting elements to build responsive web page views."
              theoryContent={
                <div className="space-y-4 text-left">
                  <p>
                    JSP files are essentially HTML documents with embedded Java code using JSP tags. When a request hits a JSP page, the container translates the `.jsp` file into a Java Servlet class compilation unit, compiles it, and executes it.
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white mb-2">Core JSP Scripting Elements:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      <li><strong>Scriptlets <code>{`<% ... %>`}</code>:</strong> Execute block statements.</li>
                      <li><strong>Expressions <code>{`<%= ... %>`}</code>:</strong> Evaluates and inserts values directly into HTML output streams.</li>
                      <li><strong>Declarations <code>{`<%! ... %>`}</code>:</strong> Declare instance variables and methods.</li>
                      <li><strong>Directives <code>{`<%@ ... %>`}</code>:</strong> Global page setups (import packages, session declarations).</li>
                    </ul>
                  </div>
                  <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto">
{`<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<body>
    <%-- JSP Comment: Dynamic date rendering --%>
    <h3>Current Time: <%= new java.util.Date() %></h3>
</body>
</html>`}
                  </pre>
                </div>
              }
              aiExplanation="Think of JSP like a fill-in-the-blank letter. The HTML is the pre-written text of the letter, and the JSP scriptlets are the blanks where Java dynamically fills in customized details (like user name) before sending the completed page to the user!"
              useCases={[
                { title: "Dashboard Client Rendering", desc: "Constructing user portals, inserting active profiles, table records, and notification banners dynamically." },
                { title: "Dynamic E-commerce Catalogs", desc: "Iterating through products array and populating HTML grid items on the server side." }
              ]}
              architectureDiagram={
                <svg viewBox="0 0 400 160" className="w-full max-h-[140px]">
                  <rect x="10" y="10" width="100" height="30" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="2" />
                  <text x="60" y="28" textAnchor="middle" fill="#fff" fontSize="10">index.jsp Source</text>
                  
                  <path d="M 110 25 L 150 25" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="130" y="18" textAnchor="middle" fill="#3B82F6" fontSize="8">Compile</text>

                  <rect x="160" y="10" width="100" height="30" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="210" y="28" textAnchor="middle" fill="#fff" fontSize="10">Servlet Class</text>

                  <path d="M 260 25 L 300 25" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="280" y="18" textAnchor="middle" fill="#10B981" fontSize="8">Execute</text>

                  <rect x="310" y="10" width="80" height="30" rx="6" fill="#0f172a" stroke="#10B981" strokeWidth="1.5" />
                  <text x="350" y="28" textAnchor="middle" fill="#10B981" fontSize="10">HTML Output</text>
                </svg>
              }
              workflowDiagram={
                <svg viewBox="0 0 500 80" className="w-full max-h-[70px]">
                  <g transform="translate(10, 10)">
                    <rect x="0" y="0" width="120" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="1" />
                    <text x="60" y="24" textAnchor="middle" fill="#fff" fontSize="9">Client Requests JSP</text>
                  </g>
                  <path d="M 135 30 L 165 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(170, 10)">
                    <rect x="0" y="0" width="120" height="40" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="1" />
                    <text x="60" y="24" textAnchor="middle" fill="#fff" fontSize="9">JSP -> Servlet Translation</text>
                  </g>
                  <path d="M 295 30 L 325 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(330, 10)">
                    <rect x="0" y="0" width="150" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1" />
                    <text x="75" y="24" textAnchor="middle" fill="#fff" fontSize="9">Response HTML returned</text>
                  </g>
                </svg>
              }
              steps={[
                { title: "Translation Phase", desc: "JSP container reads .jsp code and generates equivalent Java servlet source code." },
                { title: "Compilation Phase", desc: "Container compiles Java servlet file into executable bytecode .class file." },
                { title: "Instantiation & Initialization", desc: "Servlet class loaded, instance created, _jspInit() lifecycle method called." },
                { title: "Execution (_jspService)", desc: "For every query request, container calls _jspService() which dynamically pipes HTML response to client." }
              ]}
              interviewQuestions={[
                { q: "What are the implicit objects in JSP?", a: "Implicit objects are pre-defined Java variables available to developers inside scriptlets without declaration. Key implicit objects: request, response, out, session, application, config, pageContext, page, and exception." },
                { q: "Why should we avoid scriptlets in modern JSP?", a: "Scriptlets mix business code (Java) with view logic (HTML), making maintenance hard. Modern JSP uses JSTL (JSP Standard Tag Library) and EL (Expression Language) to keep views clean." }
              ]}
              importantNotes={[
                "First-time access to a JSP page has a compilation delay. Pre-compiling JSP before deployment is recommended.",
                "Always use Expression Language (EL) ${} instead of scriptlets to secure dynamic data fields."
              ]}
              visualization={
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300">JSP Engine Lifecycle Simulator</h4>
                  <div className="p-3 bg-black/45 rounded-xl text-xs space-y-1 text-slate-300 font-mono">
                    <div>Active translation buffer: <b>Ready</b></div>
                    <div>Cached compiled servlet classes: <b>index_jsp.class</b></div>
                  </div>
                  <button 
                    onClick={() => {
                      toast.success('JSP Engine triggered translation. Servlet compiled.');
                    }}
                    className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Force Translate & Compile
                  </button>
                </div>
              }
              simulator={
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-300">JSP Source Code Editor</span>
                      <textarea 
                        value={jspCode}
                        onChange={(e) => setJspCode(e.target.value)}
                        className="w-full h-40 bg-slate-950 text-slate-300 font-mono text-xs p-3 rounded-xl border border-white/10 outline-none focus:border-blue-500 resize-none"
                      />
                      <button 
                        onClick={() => {
                          setJspPreview('<div class="p-3 bg-white/5 rounded-xl border border-white/10"><h3>Welcome Admin User!</h3><p>Evaluated expression: <b>JSP Directives Active</b></p></div>');
                          toast.success('JSP compiled successfully');
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Compile & Run JSP
                      </button>
                    </div>

                    <div className="space-y-2 text-left">
                      <span className="text-xs font-bold text-slate-300">Live HTML Result Preview</span>
                      <div className="w-full h-40 bg-slate-950 border border-white/5 rounded-xl p-4 text-xs font-sans flex items-center justify-center">
                        {jspPreview ? (
                          <div dangerouslySetInnerHTML={{ __html: jspPreview }} />
                        ) : (
                          <span className="text-slate-500 text-[11px]">Hit "Compile & Run JSP" to run JSP engine.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              }
              practiceQuestions={[
                { q: "Which symbol denotes JSP expressions that print directly to the response output?", options: ["<%", "<%! ", "<%=", "<%@"], correct: "<%=", explanation: "Expressions dynamically print output values using <%= tag." }
              ]}
              codingExercise={{
                instructions: "Write the import directive syntax to import java.util.List class.",
                boilerplate: "<%@ page import=\"________\" %>",
                solutionRegex: "java.util.List"
              }}
              miniProject={{
                title: "Server-Side Dynamic User Directory",
                description: "Build a JSP page using JSTL loops to render lists of active server session user connections."
              }}
              quiz={[
                { q: "Which implicit object represents the servlet context application configuration?", options: ["request", "application", "session", "pageContext"], correct: "application", explanation: "application implicit object exposes general servlet context configurations." }
              ]}
            />
          )}

          {/* SESSION MANAGEMENT TAB */}
          {activePanel === 'session' && (
            <TheoryFirstModule
              title="Session Management"
              icon={ShieldAlert}
              introduction="Session Management is a security and state-preservation mechanism that allows HTTP servers to associate sequential client requests with individual users, transcending the inherently stateless nature of HTTP."
              theoryContent={
                <div className="space-y-4 text-left">
                  <p>
                    HTTP is a stateless protocol—each request is processed independently. Session tracking allows web applications to maintain state (e.g. login credentials, shopping carts) across multiple requests.
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white mb-2">Core Session Management Techniques:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      <li><strong>Cookies:</strong> Key-value tokens stored in client browsers, transmitted automatically in request headers.</li>
                      <li><strong>HttpSession API:</strong> Server-side memory storage linked to client-side JSESSIONID cookie identifiers.</li>
                      <li><strong>URL Rewriting:</strong> Appending session tokens directly to links (e.g. `;jsessionid=123`) when cookies are disabled.</li>
                      <li><strong>Hidden Form Fields:</strong> Passing session tokens inside HTML forms.</li>
                    </ul>
                  </div>
                  <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto">
{`// HttpSession state operations inside Servlet
HttpSession session = req.getSession(true); // Get or create
session.setAttribute("user", "Alice");
String user = (String) session.getAttribute("user");`}
                  </pre>
                </div>
              }
              aiExplanation="Imagine you go to a theme park. At the entrance, they check your ID and give you a wristband (the session cookie). For the rest of the day, when you ride the rollercoasters, you don't show your ID again—you just show your wristband (the cookie). The park workers look at the wristband and know exactly who you are!"
              useCases={[
                { title: "User Authentication State", desc: "Keeping users logged into web profiles as they navigate secured dashboard endpoints." },
                { title: "Distributed Shopping Carts", desc: "Caching e-commerce cart lists temporarily in server memory before checkout transactions." }
              ]}
              architectureDiagram={
                <svg viewBox="0 0 400 160" className="w-full max-h-[140px]">
                  <rect x="10" y="10" width="100" height="140" rx="8" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="2" />
                  <text x="60" y="80" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">Client Browser</text>

                  <path d="M 110 50 L 190 50" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="150" y="42" textAnchor="middle" fill="#3B82F6" fontSize="8">Request + Cookie</text>

                  <path d="M 190 110 L 110 110" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="150" y="125" textAnchor="middle" fill="#10B981" fontSize="8">Set-Cookie Header</text>

                  <rect x="200" y="10" width="190" height="140" rx="8" fill="#0f172a" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="295" y="30" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">Tomcat Server Application</text>

                  <rect x="215" y="55" width="160" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1.5" />
                  <text x="295" y="70" textAnchor="middle" fill="#10B981" fontSize="10">HttpSession Memory</text>
                  <text x="295" y="85" textAnchor="middle" fill="#94A3B8" fontSize="8">JSESSIONID: 4F9D7C2B</text>
                </svg>
              }
              workflowDiagram={
                <svg viewBox="0 0 500 80" className="w-full max-h-[70px]">
                  <g transform="translate(10, 10)">
                    <rect x="0" y="0" width="110" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="1" />
                    <text x="55" y="24" textAnchor="middle" fill="#fff" fontSize="9">Client First Connects</text>
                  </g>
                  <path d="M 125 30 L 155 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(160, 10)">
                    <rect x="0" y="0" width="120" height="40" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="1" />
                    <text x="60" y="24" textAnchor="middle" fill="#fff" fontSize="9">Server generates HttpSession</text>
                  </g>
                  <path d="M 285 30 L 315 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(320, 10)">
                    <rect x="0" y="0" width="160" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1" />
                    <text x="80" y="24" textAnchor="middle" fill="#fff" fontSize="9">Cookie JSESSIONID set in browser</text>
                  </g>
                </svg>
              }
              steps={[
                { title: "HttpSession Initiation", desc: "First request calls req.getSession(true) to instantiate thread-safe server session state." },
                { title: "Session ID Generation", desc: "Server allocates unique random ID string (e.g. JSESSIONID) to prevent session hijacking." },
                { title: "Set-Cookie Transmission", desc: "Server includes JSESSIONID cookie in Set-Cookie response header sent to client browser." },
                { title: "Subsequent Request Identification", desc: "On next queries, browser automatically attaches the cookie token, linking client to server session." }
              ]}
              interviewQuestions={[
                { q: "What happens if the browser disables cookies?", a: "If cookies are disabled, HttpSession fails to track requests because the browser won't store the JSESSIONID. To resolve this, developers use URL Rewriting, appending the session ID to every local hyperlink." },
                { q: "How do you invalidate a session?", a: "Call session.invalidate() to immediately clear the server-side memory session and delete all bound attributes." }
              ]}
              importantNotes={[
                "Configure HttpOnly and Secure flags on session cookies to mitigate Cross-Site Scripting (XSS) token theft.",
                "Define session timeout thresholds in web.xml (<session-timeout>) to prevent idle memory leakages."
              ]}
              visualization={
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300">Session Lifecycle Logger</h4>
                  {sessionLogs.length > 0 ? (
                    <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto">
                      {sessionLogs.join('\n')}
                    </pre>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono block">No active cookie headers logs registered yet.</span>
                  )}
                </div>
              }
              simulator={
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">Cookie Constructor Simulator</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 block">Cookie Name</label>
                        <input 
                          type="text" 
                          value={cookieSimKey} 
                          onChange={(e) => setCookieSimKey(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-850 border border-white/10 rounded-xl text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Cookie Value</label>
                        <input 
                          type="text" 
                          value={cookieSimVal} 
                          onChange={(e) => setCookieSimVal(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-850 border border-white/10 rounded-xl text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSessionLogs([...sessionLogs, `Set-Cookie: ${cookieSimKey}=${cookieSimVal}; Path=/; HttpOnly; Secure`]);
                        toast.success('Cookie injected successfully');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Inject Cookie Header
                    </button>
                  </div>
                </div>
              }
              practiceQuestions={[
                { q: "Which class method is invoked to invalidate HttpSession memory contexts?", options: ["session.close()", "session.invalidate()", "session.destroy()", "session.clear()"], correct: "session.invalidate()", explanation: "session.invalidate() clears session bindings immediately." }
              ]}
              codingExercise={{
                instructions: "Retrieve the active HttpSession or create one if none exists.",
                boilerplate: "HttpSession session = req.________(true);",
                solutionRegex: "getSession"
              }}
              miniProject={{
                title: "Server Session Access Auditor",
                description: "Develop a servlet listener tracking the number of active HTTP sessions and logging session lifecycles."
              }}
              quiz={[
                { q: "What identifier token does Tomcat default to for tracking browser sessions in cookies?", options: ["SESSION_ID", "JSESSIONID", "COOKIE_SESSION", "TOKENID"], correct: "JSESSIONID", explanation: "JSESSIONID is the default cookie name used by Java containers for session state tracking." }
              ]}
            />
          )}

          {/* HIBERNATE TAB */}
          {activePanel === 'hibernate' && (
            <TheoryFirstModule
              title="Hibernate Object-Relational Mapping (ORM)"
              icon={Database}
              introduction="Hibernate is an open-source object-relational mapping (ORM) framework for Java. It simplifies the development of Java applications to interact with the database by providing an abstraction layer over low-level JDBC SQL queries, mapping Java classes to database tables and Java data types to SQL data types."
              theoryContent={
                <div className="space-y-4 text-left">
                  <p>
                    In traditional enterprise development, object-oriented models in Java conflict with relational database models (known as the Object-Relational Impedance Mismatch). Hibernate solves this by automatically mapping entities, loading objects, managing database connections, caching data, and maintaining session states.
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white mb-2">Core Hibernate Concepts & Architecture:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      <li><strong>SessionFactory:</strong> A thread-safe, heavy object compiled once at application startup representing a single database configuration.</li>
                      <li><strong>Session:</strong> A lightweight, short-lived session wrapper object representing a physical connection to the database.</li>
                      <li><strong>Transaction:</strong> Wraps physical database transaction boundaries, ensuring ACID properties.</li>
                      <li><strong>Query / Criteria API:</strong> Allows querying database records using object-oriented JPQL (Java Persistence Query Language) or type-safe programmatic criteria.</li>
                      <li><strong>First-Level Cache:</strong> Enabled by default, session-level cache storing active transaction objects.</li>
                      <li><strong>Second-Level Cache:</strong> SessionFactory-level cache across sessions, configured using Ehcache or Redis.</li>
                    </ul>
                  </div>
                  <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto">
{`// Session and Transaction Management
SessionFactory factory = new Configuration().configure().buildSessionFactory();
Session session = factory.openSession();
Transaction tx = null;
try {
    tx = session.beginTransaction();
    Student student = new Student("John", "Doe");
    session.save(student); // persists in database
    tx.commit();
} catch (Exception e) {
    if (tx != null) tx.rollback();
} finally {
    session.close();
}`}
                  </pre>
                </div>
              }
              aiExplanation="Imagine Java classes and database tables speak two different languages. Java speaks 'Objects' and the database speaks 'Rows and Columns'. Hibernate is the fluent, real-time translator sitting between them. Whenever you create a new Java Object, Hibernate automatically translates it and writes it as database rows, and vice-versa, without you writing a single line of SQL translation!"
              useCases={[
                { title: "Enterprise Database Portals", desc: "Mapping thousands of database rows to secure, nested domain objects dynamically." },
                { title: "Multi-tenant E-Commerce Platforms", desc: "Leveraging Hibernate caching layers to handle heavy read traffic and transactions." }
              ]}
              architectureDiagram={
                <svg viewBox="0 0 400 160" className="w-full max-h-[140px]">
                  <rect x="10" y="10" width="380" height="30" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="2" />
                  <text x="200" y="30" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">Java Application Layer</text>

                  <path d="M 200 40 L 200 65" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <rect x="10" y="65" width="180" height="30" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="100" y="85" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="10">Session (1st Lvl Cache)</text>

                  <rect x="210" y="65" width="180" height="30" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="300" y="85" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="10">SessionFactory (2nd Cache)</text>

                  <path d="M 200 95 L 200 120" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <rect x="10" y="120" width="380" height="30" rx="6" fill="#0f172a" stroke="#10B981" strokeWidth="1.5" />
                  <text x="200" y="138" textAnchor="middle" fill="#10B981" fontSize="10">Database (JDBC / SQL Layer)</text>
                </svg>
              }
              workflowDiagram={
                <svg viewBox="0 0 500 80" className="w-full max-h-[70px]">
                  <g transform="translate(10, 10)">
                    <rect x="0" y="0" width="90" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="1" />
                    <text x="45" y="24" textAnchor="middle" fill="#fff" fontSize="9">1. Load Config</text>
                  </g>
                  <path d="M 105 30 L 135 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  
                  <g transform="translate(140, 10)">
                    <rect x="0" y="0" width="90" height="40" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="1" />
                    <text x="45" y="24" textAnchor="middle" fill="#fff" fontSize="9">2. Build Factory</text>
                  </g>
                  <path d="M 235 30 L 265 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(270, 10)">
                    <rect x="0" y="0" width="90" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1" />
                    <text x="45" y="24" textAnchor="middle" fill="#fff" fontSize="9">3. Open Session</text>
                  </g>
                  <path d="M 365 30 L 395 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(400, 10)">
                    <rect x="0" y="0" width="90" height="40" rx="6" fill="#1e1b4b" stroke="#F59E0B" strokeWidth="1" />
                    <text x="45" y="24" textAnchor="middle" fill="#fff" fontSize="9">4. Commit & Close</text>
                  </g>
                </svg>
              }
              steps={[
                { title: "Configuration", desc: "Read hibernate.cfg.xml settings describing database connections, credentials, dialect, and mapping configurations." },
                { title: "Compile SessionFactory", desc: "Build SessionFactory which acts as a heavy compilation metadata model for all mapped entities." },
                { title: "Open Session", desc: "Open short-lived Session which handles database CRUD calls and acts as First-Level Cache." },
                { title: "Begin & Commit Transactions", desc: "Use transaction.begin(), save or query entities, and transaction.commit() to run ACID storage operations." }
              ]}
              interviewQuestions={[
                { q: "What is the difference between openSession() and getCurrentSession()?", a: "openSession() always opens a new Session instance that you must explicitly close. getCurrentSession() retrieves the active Session bound to the current execution thread context, which is automatically closed when the transaction completes." },
                { q: "What are the states of a Hibernate Entity?", a: "Transient (not associated with any session or database row), Persistent (associated with active session and has a database row), and Detached (associated with a database row but session has closed)." }
              ]}
              importantNotes={[
                "Always close Sessions in a finally block to prevent connection leaks, unless using Spring's automatic transaction manager.",
                "Be cautious of the N+1 select problem; use JOIN FETCH or entity graphs to optimize relations fetch modes."
              ]}
              visualization={
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300">Hibernate ORM Entity Relationship State</h4>
                  <div className="p-3 bg-black/45 rounded-xl text-xs space-y-1 text-slate-300 font-mono">
                    <div>Active Entity Class: <b>{entityMapping.entity}</b></div>
                    <div>Target Database Table: <b>{entityMapping.table}</b></div>
                    <div>Configured Relation: <b>{relationshipType}</b></div>
                  </div>
                  <div className="flex gap-2">
                    {['One-To-One', 'One-To-Many', 'Many-To-One', 'Many-To-Many'].map(rel => (
                      <button 
                        key={rel}
                        onClick={() => setRelationshipType(rel)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer ${
                          relationshipType === rel ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>
              }
              simulator={
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">Hibernate Entity Class Schema Builder</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 block">Entity Class Name</label>
                        <input 
                          type="text" 
                          value={entityMapping.entity}
                          onChange={(e) => setEntityMapping({...entityMapping, entity: e.target.value})}
                          className="w-full px-3 py-1.5 bg-slate-850 border border-white/10 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Target DB Table Name</label>
                        <input 
                          type="text" 
                          value={entityMapping.table}
                          onChange={(e) => setEntityMapping({...entityMapping, table: e.target.value})}
                          className="w-full px-3 py-1.5 bg-slate-850 border border-white/10 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>
                    <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono whitespace-pre leading-relaxed overflow-x-auto">
{`@Entity
@Table(name = "${entityMapping.table}")
public class ${entityMapping.entity} {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @${relationshipType}
    private List<DataRecord> records;
}`}
                    </pre>
                  </div>
                </div>
              }
              practiceQuestions={[
                { q: "Which annotation is used to designate a Java class as an ORM database entity?", options: ["@Table", "@Entity", "@Id", "@DatabaseMapped"], correct: "@Entity", explanation: "@Entity is the standard JPA annotation that marks a class for database ORM mapping." }
              ]}
              codingExercise={{
                instructions: "Complete the annotation name to map a primary key identifier in Hibernate entities.",
                boilerplate: "________\n@GeneratedValue(strategy = GenerationType.IDENTITY)\nprivate Long id;",
                solutionRegex: "@Id"
              }}
              miniProject={{
                title: "Entity Relational Catalog System",
                description: "Map a Student entity to a Course entity using a One-to-Many relation mapping and run CRUD session transaction routines."
              }}
              quiz={[
                { q: "What is the N+1 SELECT query issue?", options: ["Loading 1 entity requires executing N+1 distinct SQL statements", "Caching 1 entity results in N+1 connection attempts", "A primary key requires N+1 validation checks", "Database connection pool timeout default value"], correct: "Loading 1 entity requires executing N+1 distinct SQL statements", explanation: "The N+1 problem occurs when fetching a parent entity initiates N separate queries to load its child relationships sequentially." }
              ]}
            />
          )}

          {/* SPRING CORE TAB */}
          {activePanel === 'spring-core' && (
            <TheoryFirstModule
              title="Spring Core Framework & IoC"
              icon={Layers}
              introduction="Spring Core is the fundamental module of the Spring Framework, providing Inversion of Control (IoC) and Dependency Injection (DI) features. It decouples the creation and lifecycle management of application objects from business logic, allowing for highly modular, testable enterprise code."
              theoryContent={
                <div className="space-y-4 text-left">
                  <p>
                    In conventional Java applications, objects manage their own dependencies via direct instantiation (e.g. <code>new ServiceImpl()</code>). This tight coupling makes code rigid and difficult to unit test. The Spring Container solves this by taking control of bean instantiations, configurations, and assembler lifecycles—a pattern known as Inversion of Control (IoC).
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white mb-2">Key Core Spring Concepts:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      <li><strong>ApplicationContext:</strong> The advanced Spring IoC Container interface that creates, configures, and manages the lifecycle of beans.</li>
                      <li><strong>Dependency Injection (DI):</strong> The mechanism where the container injects dependent objects into a bean via Constructor Injection or Setter Injection.</li>
                      <li><strong>Spring Beans:</strong> Objects managed by the Spring IoC container (instantiated, assembled, and managed).</li>
                      <li><strong>Bean Scopes:</strong> Singleton (one instance per container), Prototype (new instance per request), Request, Session, and Application.</li>
                      <li><strong>Stereotype Annotations:</strong> <code>@Component</code>, <code>@Service</code>, <code>@Repository</code>, and <code>@Controller</code>.</li>
                    </ul>
                  </div>
                  <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto">
{`@Configuration
public class AppConfig {
    @Bean
    public CourseService courseService() {
        return new CourseServiceImpl(dbConnector());
    }

    @Bean
    public DatabaseConnector dbConnector() {
        return new PostgreSQLConnector();
    }
}`}
                  </pre>
                </div>
              }
              aiExplanation="Imagine you're building a house. Instead of going to the store, buying the plumbing pipes, buying the sink, and manually assembling them inside the walls yourself (tight coupling), you hire a master builder (the Spring IoC Container). You just write down a list of what you need (Annotations/JavaConfig) and the builder automatically delivers, connects, and sets up all the components ready for you to use!"
              useCases={[
                { title: "Decoupled Business Logic Layer", desc: "Injecting data repository adapters into transaction services without hardcoding dependencies." },
                { title: "Enterprise Service Assembler", desc: "Configuring singleton beans like mail services, auditing modules, and security filters globally." }
              ]}
              architectureDiagram={
                <svg viewBox="0 0 400 160" className="w-full max-h-[140px]">
                  <rect x="10" y="10" width="110" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="2" />
                  <text x="65" y="34" textAnchor="middle" fill="#fff" fontSize="9">POJO / Java Classes</text>

                  <rect x="140" y="10" width="110" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="2" />
                  <text x="195" y="34" textAnchor="middle" fill="#fff" fontSize="9">Config (@Configuration)</text>

                  <path d="M 65 50 L 195 90" fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3" markerEnd="url(#arrow)" />
                  <path d="M 195 50 L 195 90" fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3" markerEnd="url(#arrow)" />

                  <rect x="100" y="90" width="200" height="35" rx="6" fill="#0f172a" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="200" y="112" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="10">Spring IoC Container</text>

                  <path d="M 200 125 L 200 145" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <text x="200" y="156" textAnchor="middle" fill="#10B981" fontWeight="bold" fontSize="9">Ready Managed Beans</text>
                </svg>
              }
              workflowDiagram={
                <svg viewBox="0 0 500 80" className="w-full max-h-[70px]">
                  <g transform="translate(10, 10)">
                    <rect x="0" y="0" width="90" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="1" />
                    <text x="45" y="24" textAnchor="middle" fill="#fff" fontSize="9">1. Instantiate Beans</text>
                  </g>
                  <path d="M 105 30 L 135 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(140, 10)">
                    <rect x="0" y="0" width="90" height="40" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="1" />
                    <text x="45" y="24" textAnchor="middle" fill="#fff" fontSize="9">2. Inject Dependencies</text>
                  </g>
                  <path d="M 235 30 L 265 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(270, 10)">
                    <rect x="0" y="0" width="90" height="40" rx="6" fill="#10B981" stroke="#10B981" strokeWidth="1" />
                    <text x="45" y="24" textAnchor="middle" fill="#fff" fontSize="9">3. PostProcessors</text>
                  </g>
                  <path d="M 365 30 L 395 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(400, 10)">
                    <rect x="0" y="0" width="90" height="40" rx="6" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1" />
                    <text x="45" y="24" textAnchor="middle" fill="#fff" fontSize="9">4. ready / destroy</text>
                  </g>
                </svg>
              }
              steps={[
                { title: "Locate Bean Definitions", desc: "Spring parses XML config or scans project folders search-mapping @Configuration, @Component classes." },
                { title: "Instantiate & Inject (DI)", desc: "Spring instantiates beans sequentially and injects required dependencies via constructors or field setters." },
                { title: "Initialization Hooks", desc: "Invoke BeanPostProcessors and call Custom Init methods (@PostConstruct or InitializingBean hooks)." },
                { title: "Destruction Registration", desc: "Register destruction callbacks (@PreDestroy or DisposableBean hooks) to gracefully free memory when context closes." }
              ]}
              interviewQuestions={[
                { q: "What is Inversion of Control (IoC)?", a: "IoC is a design principle where the control of object creation, configuration, and lifecycle is transferred from the application code to an external framework or container (Spring)." },
                { q: "Why is Constructor Injection preferred over Field Injection?", a: "Constructor Injection ensures dependencies are immutable, guarantees required fields are never null, and makes unit testing easier without needing reflection utilities." }
              ]}
              importantNotes={[
                "The default scope of a Spring bean is Singleton, meaning one shared instance exists per container. Avoid writing mutable state variables inside them.",
                "Avoid circular dependencies (Bean A needs Bean B, which needs Bean A) as it blocks context startup."
              ]}
              visualization={
                <div className="space-y-3 text-left">
                  <span className="text-xs font-bold text-slate-300 block">IoC Container Controller</span>
                  <div className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>ApplicationContext Status:</span>
                      <span className="text-emerald-400 font-bold">READY</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Beans in Context: [courseService, dbConnector, appConfig]</p>
                  </div>
                  <button 
                    onClick={() => {
                      toast.success('Spring Context Refreshed! Beans initialized.');
                    }}
                    className="w-full py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Refresh Context (BeanFactory)
                  </button>
                </div>
              }
              simulator={
                <div className="space-y-4 font-normal text-left">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-slate-300 block font-mono">Bean Configuration (AppConfig.java)</span>
                    <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono leading-relaxed text-left overflow-x-auto">
{`@Configuration
public class AppConfig {
    @Bean
    public CourseService courseService() {
        return new CourseServiceImpl(dbConnector());
    }

    @Bean
    public DatabaseConnector dbConnector() {
        return new PostgreSQLConnector();
    }
}`}
                    </pre>
                  </div>
                </div>
              }
              practiceQuestions={[
                { q: "Which scope initiates a new Bean instance every single time it is requested from the container?", options: ["Singleton", "Prototype", "Request", "Session"], correct: "Prototype", explanation: "Prototype scope ensures a fresh instance is created on every container lookup." }
              ]}
              codingExercise={{
                instructions: "Complete the annotation used to configure class-level dependency injection dynamically.",
                boilerplate: "@Component\npublic class Registry {\n  ________\n  private StudentRepository repo;\n}",
                solutionRegex: "@Autowired"
              }}
              miniProject={{
                title: "Decoupled Notification Dispatcher",
                description: "Assemble an SMS and Email notification system using constructor dependency injection configuration configurations."
              }}
              quiz={[
                { q: "Which ApplicationContext interface method retrieves a configured bean from Spring container?", options: ["getBean()", "lookup()", "findBean()", "instantiate()"], correct: "getBean()", explanation: "getBean() is used to programmatically query configured beans by name or type." }
              ]}
            />
          )}

          {/* SPRING MVC TAB */}
          {activePanel === 'spring-mvc' && (
            <TheoryFirstModule
              title="Spring MVC Routing & DispatcherServlet"
              icon={Layers}
              introduction="Spring MVC (Model-View-Controller) is a request-driven web framework built on the Servlet API. It uses a central front controller servlet, the DispatcherServlet, to coordinate and route HTTP requests to appropriate handlers and views."
              theoryContent={
                <div className="space-y-4 text-left">
                  <p>
                    In a classic servlet model, every path map requires registering a distinct servlet class. Spring MVC unifies this by deploying a single front controller called <code>DispatcherServlet</code>. It intercepts all incoming requests and delegates routing lookups to handler mappings, executing controller methods and serializing model returns to client views or JSON.
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white mb-2">Core Spring MVC Workflow Elements:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      <li><strong>DispatcherServlet:</strong> Intercepts every HTTP request and controls the processing pipeline workflow.</li>
                      <li><strong>HandlerMapping:</strong> Resolves the request URL path to find the appropriate Controller handler method.</li>
                      <li><strong>HandlerAdapter:</strong> Executes the mapped controller method with argument resolution (e.g. binding path variables).</li>
                      <li><strong>ViewResolver:</strong> Resolves logical view names (like "index") to actual template files (like JSP/Thymeleaf) if not using @ResponseBody.</li>
                      <li><strong>@RestController:</strong> Combines @Controller and @ResponseBody to automatically write object returns as JSON strings.</li>
                    </ul>
                  </div>
                </div>
              }
              aiExplanation="Think of Spring MVC like a major post office sorting center. The DispatcherServlet is the head mail sorter at the front desk. Instead of people hand-delivering letters directly to different offices, all mail goes to the front desk. The head sorter looks at the address (URL route) and immediately hands it over to the specific worker (Controller Method) trained to process that specific mail item!"
              useCases={[
                { title: "Enterprise REST API Gateways", desc: "Constructing JSON route controllers serving backend records to frontend clients." },
                { title: "Server-Side Rendered Web Portals", desc: "Routing pages using MVC models to bind databases into dynamic client views." }
              ]}
              architectureDiagram={
                <svg viewBox="0 0 400 160" className="w-full max-h-[140px]">
                  <rect x="10" y="55" width="80" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="1.5" />
                  <text x="50" y="80" textAnchor="middle" fill="#fff" fontSize="9">Client Query</text>

                  <path d="M 90 75 L 125 75" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <rect x="130" y="15" width="130" height="120" rx="8" fill="#0f172a" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="195" y="32" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="10">DispatcherServlet</text>

                  <rect x="140" y="50" width="110" height="25" rx="4" fill="#1e1b4b" stroke="#10B981" strokeWidth="1" />
                  <text x="195" y="66" textAnchor="middle" fill="#10B981" fontSize="8">HandlerMapping</text>

                  <rect x="140" y="85" width="110" height="25" rx="4" fill="#1e1b4b" stroke="#F59E0B" strokeWidth="1" />
                  <text x="195" y="101" textAnchor="middle" fill="#F59E0B" fontSize="8">HandlerAdapter</text>

                  <path d="M 260 75 L 305 75" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <rect x="310" y="55" width="80" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1.5" />
                  <text x="350" y="80" textAnchor="middle" fill="#fff" fontSize="9">Controller Bean</text>
                </svg>
              }
              workflowDiagram={
                <svg viewBox="0 0 500 80" className="w-full max-h-[70px]">
                  <g transform="translate(10, 10)">
                    <rect x="0" y="0" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="1" />
                    <text x="50" y="24" textAnchor="middle" fill="#fff" fontSize="8">HTTP Request</text>
                  </g>
                  <path d="M 115 30 L 145 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(150, 10)">
                    <rect x="0" y="0" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="1" />
                    <text x="50" y="24" textAnchor="middle" fill="#fff" fontSize="8">Front Dispatcher</text>
                  </g>
                  <path d="M 255 30 L 285 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(290, 10)">
                    <rect x="0" y="0" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1" />
                    <text x="50" y="24" textAnchor="middle" fill="#fff" fontSize="8">Execute Controller</text>
                  </g>
                  <path d="M 395 30 L 425 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(430, 10)">
                    <rect x="0" y="0" width="60" height="40" rx="6" fill="#1e1b4b" stroke="#F59E0B" strokeWidth="1" />
                    <text x="30" y="24" textAnchor="middle" fill="#fff" fontSize="8">JSON / HTML</text>
                  </g>
                </svg>
              }
              steps={[
                { title: "Intercept Request", desc: "DispatcherServlet intercepts the query URL sent by user client browser." },
                { title: "Resolve Handler Path", desc: "DispatcherServlet calls HandlerMapping to lookup which RestController class maps to route." },
                { title: "Execute Controller Handler", desc: "HandlerAdapter triggers the mapped method (e.g. @GetMapping) resolving path parameters." },
                { title: "Return Response Data", desc: "The method returns data, which is parsed to JSON using HttpMessageConverters and piped to response body." }
              ]}
              interviewQuestions={[
                { q: "What is the difference between @Controller and @RestController?", a: "@Controller maps classes to traditional MVC views (HTML/JSP) resolving logical view names. @RestController is a specialized controller that implicitly appends @ResponseBody to every handler method, serializing method returns directly to HTTP JSON bodies." },
                { q: "How do you capture path variables in Spring MVC?", a: "By using the @PathVariable annotation on method parameters, matching the dynamic path placeholders defined in request mapping annotations (e.g. @GetMapping('/courses/{id}'))." }
              ]}
              importantNotes={[
                "Always declare specific HTTP verb mappings (like @GetMapping or @PostMapping) instead of generic @RequestMapping to keep routes secure.",
                "Leverage @ControllerAdvice to intercept exceptions globally and return standardized error response bodies."
              ]}
              visualization={
                <div className="space-y-3 text-left">
                  <span className="text-xs font-bold text-slate-300 block">Spring MVC Dispatcher Request Pipeline</span>
                  <div className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-2 text-xs font-mono">
                    <div>Query Route: <span className="text-emerald-400 font-bold">GET /courses/101</span></div>
                    <div>Resolved Controller: CourseController.getCourse(101)</div>
                  </div>
                </div>
              }
              simulator={
                <div className="space-y-4 text-left">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">Simulate Request Endpoint Dispatch</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value="/courses/101" 
                        disabled
                        className="flex-grow px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-400 outline-none"
                      />
                      <button 
                        onClick={() => {
                          toast.success('DispatcherServlet routed successfully to CourseController');
                        }}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Dispatch
                      </button>
                    </div>
                    <pre className="p-3 bg-black rounded-xl text-xs font-mono text-emerald-400 min-h-[80px] overflow-x-auto">
{`GET /courses/101 HTTP/1.1\nHost: localhost:8080\n\nResponse 200 OK\n{\n  "id": 101,\n  "title": "Spring Framework Masterclass",\n  "status": "Active"\n}`}
                    </pre>
                  </div>
                </div>
              }
              practiceQuestions={[
                { q: "Which annotation binds request path placeholders dynamically to handler parameters?", options: ["@RequestParam", "@PathVariable", "@RequestBody", "@ModelAttribute"], correct: "@PathVariable", explanation: "@PathVariable captures dynamic route values defined inside curly brackets." }
              ]}
              codingExercise={{
                instructions: "Write the annotation that marks a class as a REST endpoint controller yielding direct serialized responses.",
                boilerplate: "________\n@RequestMapping(\"/api\")\npublic class ApiController {}",
                solutionRegex: "@RestController"
              }}
              miniProject={{
                title: "E-Commerce REST Catalog Endpoint",
                description: "Create a Product REST controller handling GET and POST routes, utilizing PathVariable and RequestBody bindings."
              }}
              quiz={[
                { q: "Which component acts as the main front controller orchestrator in Spring MVC?", options: ["HandlerMapping", "DispatcherServlet", "ViewResolver", "ServletConfig"], correct: "DispatcherServlet", explanation: "DispatcherServlet intercepts all inbound requests, serving as the front controller pattern driver." }
              ]}
            />
          )}

          {/* SPRING BOOT TAB */}
          {activePanel === 'spring-boot' && (
            <TheoryFirstModule
              title="Spring Boot Framework"
              icon={Layers}
              introduction="Spring Boot is an extension of the Spring Framework that simplifies the bootstrapping and development of new production-ready Spring applications. It eliminates complex XML/Java configurations by leveraging Auto-Configuration, Starter Dependencies, and an Embedded Web Server (Tomcat)."
              theoryContent={
                <div className="space-y-4 text-left">
                  <p>
                    Building a classic Spring application requires significant configuration (e.g. setting up transaction managers, data sources, servlet mappings, and view resolvers). Spring Boot automates this boilerplate using a 'convention-over-configuration' design model.
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white mb-2">Key Spring Boot Features:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      <li><strong>Auto-Configuration:</strong> Automatically configures Spring beans based on the classes present in the project classpath (e.g. if Hibernate jar is present, configure a database session factory automatically).</li>
                      <li><strong>Starter Dependencies:</strong> Grouped descriptors (like <code>spring-boot-starter-web</code>) that bundle required transitive dependencies.</li>
                      <li><strong>Embedded Server:</strong> Bundles Tomcat, Jetty, or Undertow servers directly into the executable JAR file.</li>
                      <li><strong>Actuator:</strong> Provides production-ready monitoring tools, health audits, metrics, and environment properties endpoints.</li>
                    </ul>
                  </div>
                </div>
              }
              aiExplanation="Imagine Spring Framework is a professional mechanics toolbox full of complex, unassembled engine parts. Spring Boot is like buying a pre-assembled, factory-tuned sports car. The keys are in the ignition, the engine is ready to start (Embedded Tomcat), and the car automatically adjusts itself to the road (Auto-Configuration) so you can just focus on driving!"
              useCases={[
                { title: "Standalone Microservices", desc: "Packaging self-contained web services running as direct executable JAR files on cloud servers." },
                { title: "Rapid MVP Prototypes", desc: "Initializing a complete web framework stack with security, databases, and controllers in minutes." }
              ]}
              architectureDiagram={
                <svg viewBox="0 0 400 160" className="w-full max-h-[140px]">
                  <rect x="10" y="10" width="380" height="30" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="2" />
                  <text x="200" y="30" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">Your Spring Boot Application Code</text>

                  <path d="M 200 40 L 200 65" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <rect x="10" y="65" width="180" height="30" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="100" y="85" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="10">Auto-Config Engine</text>

                  <rect x="210" y="65" width="180" height="30" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="300" y="85" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="10">Embedded Tomcat Server</text>

                  <path d="M 100 95 L 200 120" fill="none" stroke="#64748B" strokeWidth="1.5" markerEnd="url(#arrow)" />
                  <path d="M 300 95 L 200 120" fill="none" stroke="#64748B" strokeWidth="1.5" markerEnd="url(#arrow)" />

                  <rect x="110" y="120" width="180" height="30" rx="6" fill="#0f172a" stroke="#10B981" strokeWidth="1.5" />
                  <text x="200" y="138" textAnchor="middle" fill="#10B981" fontSize="10">Executable JAR Output</text>
                </svg>
              }
              workflowDiagram={
                <svg viewBox="0 0 500 80" className="w-full max-h-[70px]">
                  <g transform="translate(10, 10)">
                    <rect x="0" y="0" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="1" />
                    <text x="50" y="24" textAnchor="middle" fill="#fff" fontSize="8">1. Init Project</text>
                  </g>
                  <path d="M 115 30 L 145 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(150, 10)">
                    <rect x="0" y="0" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="1" />
                    <text x="50" y="24" textAnchor="middle" fill="#fff" fontSize="8">2. Resolve Starters</text>
                  </g>
                  <path d="M 255 30 L 285 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(290, 10)">
                    <rect x="0" y="0" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1" />
                    <text x="50" y="24" textAnchor="middle" fill="#fff" fontSize="8">3. AutoConfig Beans</text>
                  </g>
                  <path d="M 395 30 L 425 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(430, 10)">
                    <rect x="0" y="0" width="60" height="40" rx="6" fill="#1e1b4b" stroke="#F59E0B" strokeWidth="1" />
                    <text x="30" y="24" textAnchor="middle" fill="#fff" fontSize="8">4. Start Server</text>
                  </g>
                </svg>
              }
              steps={[
                { title: "Define Metadata", desc: "Establish Maven/Gradle group, artifact coordinates and select starter modules on Spring Initializr." },
                { title: "Scan Annotations", desc: "The @SpringBootApplication meta-annotation triggers component scanning, configuration resolution, and auto-configuration." },
                { title: "Run Auto-Config", desc: "Conditional bean checks evaluate classpath settings and configure databases/web components dynamically." },
                { title: "Startup Embedded Web Server", desc: "Deploy spring context, bind Tomcat listener to default port 8080, and process server requests." }
              ]}
              interviewQuestions={[
                { q: "What does the @SpringBootApplication annotation do?", a: "It is a meta-annotation that bundles three core annotations: @SpringBootConfiguration (declares class configurations), @EnableAutoConfiguration (triggers classpath conditional configurations), and @ComponentScan (scans all local components)." },
                { q: "What is Spring Boot Actuator?", a: "Actuator is a sub-module that exposes production-ready endpoints (like /actuator/health, /actuator/metrics, /actuator/env) to monitor and audit application runtime states." }
              ]}
              importantNotes={[
                "Never hardcode properties inside configurations; use application.properties or application.yml files and bind with @Value annotations.",
                "Exclude specific auto-configurations using @SpringBootApplication(exclude={DataSourceAutoConfiguration.class}) if database connections are not required."
              ]}
              visualization={
                <div className="space-y-3 text-left">
                  <span className="text-xs font-bold text-slate-300 block">Spring Boot Application Metadata Config</span>
                  <div className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-1 text-xs font-mono">
                    <div>Project Group: <b>{starterGroup}</b></div>
                    <div>Project Artifact: <b>{starterArtifact}</b></div>
                    <div>Active Starters: <b>{springDeps.join(', ')}</b></div>
                  </div>
                </div>
              }
              simulator={
                <div className="space-y-4 text-left font-normal">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-300 block">Project Initializr Metadata</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 block">Group</label>
                            <input 
                              type="text" 
                              value={starterGroup} 
                              onChange={(e) => setStarterGroup(e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-850 border border-white/10 rounded-xl text-xs text-white outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block">Artifact</label>
                            <input 
                              type="text" 
                              value={starterArtifact} 
                              onChange={(e) => setStarterArtifact(e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-850 border border-white/10 rounded-xl text-xs text-white outline-none"
                            />
                          </div>
                        </div>
                        
                        <span className="text-xs font-bold text-slate-300 block pt-2">Selected Dependencies</span>
                        <div className="flex flex-wrap gap-1.5">
                          {springDeps.map(dep => (
                            <span key={dep} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-semibold">
                              {dep}
                            </span>
                          ))}
                        </div>
                        
                        <button 
                          onClick={() => {
                            toast.success('Spring Boot Application compiled and auto-configured!');
                          }}
                          className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          🚀 Run Application Bootstrap
                        </button>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-300 block">MainApplication.java</span>
                        <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono leading-relaxed text-left overflow-x-auto">
{`package ${starterGroup};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${starterArtifact.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}Application {
    public static void main(String[] args) {
        SpringApplication.run(${starterArtifact.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}Application.class, args);
    }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              }
              practiceQuestions={[
                { q: "Which file coordinates application configurations globally in a Spring Boot application?", options: ["web.xml", "application.properties", "pom.xml", "spring.cfg.xml"], correct: "application.properties", explanation: "application.properties (or application.yml) hosts all environment property key-value configurations." }
              ]}
              codingExercise={{
                instructions: "Write the entry point method annotation to launch a Spring Boot application.",
                boilerplate: "________\npublic class Application {\n    public static void main(String[] args) {}\n}",
                solutionRegex: "@SpringBootApplication"
              }}
              miniProject={{
                title: "Autoconconfigured Embedded Catalog Service",
                description: "Bootstrap a standalone microservice using Spring Initializr, packaging an embedded web server running REST endpoint resources."
              }}
              quiz={[
                { q: "Which server is bundled as the default embedded container in Spring Boot starter web?", options: ["Jetty", "Wildfly", "Tomcat", "Glassfish"], correct: "Tomcat", explanation: "Tomcat is the default embedded servlet web container configured by spring-boot-starter-web." }
              ]}
            />
          )}


          {/* REST API TESTER TAB */}
          {activePanel === 'rest-api' && (
            <TheoryFirstModule
              title="RESTful Web Services API"
              icon={Layers}
              introduction="REST (Representational State Transfer) is an architectural style for designing distributed web services. RESTful APIs use HTTP methods (GET, POST, PUT, DELETE) to manage resources represented in standardized data formats like JSON."
              theoryContent={
                <div className="space-y-4 text-left">
                  <p>
                    In a RESTful architecture, every endpoint URI represents a resource. HTTP verbs specify the operations: <code>GET</code> retrieves resources, <code>POST</code> creates them, <code>PUT</code> updates them, and <code>DELETE</code> removes them. Controllers return serialized resources (usually JSON) with appropriate HTTP response status codes representing success or failure.
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white mb-2">Core REST Rules & Constraints:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      <li><strong>Statelessness:</strong> Every client request must contain all context information needed to process it; the server stores no session metadata.</li>
                      <li><strong>Resource-Oriented:</strong> URIs should target nouns rather than verbs (e.g. <code>/api/courses</code> instead of <code>/api/getCourses</code>).</li>
                      <li><strong>Standard Status Codes:</strong> 200 OK (Success), 201 Created (Success Post), 400 Bad Request (Client Error), 401 Unauthorized (Auth Needed), 404 Not Found, 500 Internal Error.</li>
                    </ul>
                  </div>
                </div>
              }
              aiExplanation="Imagine a REST API is like a vending machine. The items inside are resources (like courses). The request buttons are URIs (like /courses/101). The HTTP methods are actions: GET is pressing a button to look at an item, POST is restocking a slot with a new item, and DELETE is purchasing and clearing out the slot. The vending machine always returns a status (success green light or out-of-order red light)!"
              useCases={[
                { title: "Distributed Web APIs", desc: "Serving database resources to React, Vue, or iOS mobile client frontend applications." },
                { title: "Third-Party Service Integrations", desc: "Exposing public endpoints for external business platforms to query database catalog indexes." }
              ]}
              architectureDiagram={
                <svg viewBox="0 0 400 160" className="w-full max-h-[140px]">
                  <rect x="10" y="55" width="100" height="50" rx="8" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="2" />
                  <text x="60" y="84" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="10">React Frontend</text>

                  <path d="M 110 70 L 195 70" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="150" y="62" textAnchor="middle" fill="#3B82F6" fontSize="8">JSON Request</text>

                  <path d="M 195 90 L 110 90" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="150" y="105" textAnchor="middle" fill="#10B981" fontSize="8">JSON Response</text>

                  <rect x="200" y="20" width="190" height="120" rx="8" fill="#0f172a" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="295" y="42" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">Spring REST Controller</text>

                  <rect x="215" y="70" width="160" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1.5" />
                  <text x="295" y="94" textAnchor="middle" fill="#10B981" fontSize="9">Jackson Serializer</text>
                </svg>
              }
              workflowDiagram={
                <svg viewBox="0 0 500 80" className="w-full max-h-[70px]">
                  <g transform="translate(10, 10)">
                    <rect x="0" y="0" width="90" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="1" />
                    <text x="45" y="24" textAnchor="middle" fill="#fff" fontSize="8">HTTP Request</text>
                  </g>
                  <path d="M 105 30 L 135 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(140, 10)">
                    <rect x="0" y="0" width="90" height="40" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="1" />
                    <text x="45" y="24" textAnchor="middle" fill="#fff" fontSize="8">Route Mapping</text>
                  </g>
                  <path d="M 235 30 L 265 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(270, 10)">
                    <rect x="0" y="0" width="90" height="40" rx="6" fill="#10B981" stroke="#10B981" strokeWidth="1" />
                    <text x="45" y="24" textAnchor="middle" fill="#fff" fontSize="8">Read/Write DB</text>
                  </g>
                  <path d="M 365 30 L 395 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(400, 10)">
                    <rect x="0" y="0" width="90" height="40" rx="6" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1" />
                    <text x="45" y="24" textAnchor="middle" fill="#fff" fontSize="8">JSON Output</text>
                  </g>
                </svg>
              }
              steps={[
                { title: "Define Request Paths", desc: "Configure @RestController classes and assign HTTP verb mapping annotations for resources." },
                { title: "Parse Payload Body", desc: "Map inbound request bodies to domain objects using @RequestBody annotation and Jackson converters." },
                { title: "Process Business Logic", desc: "Interact with databases to load entities, format lists, or perform transaction queries." },
                { title: "Return Status Codes", desc: "Utilize ResponseEntity to assign status codes like 201 Created and write JSON payload responses." }
              ]}
              interviewQuestions={[
                { q: "What is the difference between PUT and PATCH HTTP methods?", a: "PUT is used to completely replace an existing resource with a new representation. PATCH is used to apply partial modifications or field updates to a resource." },
                { q: "What is idempotency in RESTful APIs?", a: "An HTTP method is idempotent if executing it multiple times yields the exact same server resource state (e.g. GET, PUT, and DELETE are idempotent; POST is not, as it creates duplicate resources)." }
              ]}
              importantNotes={[
                "Always return appropriate HTTP status codes (like 404 for missing entities) instead of generic 200 statuses containing error messages.",
                "Document REST APIs with Swagger/OpenAPI specifications to make integrations simple for developers."
              ]}
              visualization={
                <div className="space-y-3 text-left">
                  <span className="text-xs font-bold text-slate-300 block">REST Client Active Connection State</span>
                  <div className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-1 text-xs font-mono">
                    <div>Target URI: <b>{restUrl}</b></div>
                    <div>Request Method: <b className="text-blue-400">{restMethod}</b></div>
                  </div>
                </div>
              }
              simulator={
                <div className="space-y-4 text-left font-normal">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <div className="flex gap-2">
                      <select 
                        value={restMethod} 
                        onChange={(e) => setRestMethod(e.target.value)}
                        className="px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white outline-none"
                      >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                      </select>
                      
                      <input 
                        type="text" 
                        value={restUrl}
                        onChange={(e) => setRestUrl(e.target.value)}
                        className="flex-grow px-3 py-2 bg-slate-850 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                      />
                      
                      <button onClick={runRestRequest} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer">
                        Send
                      </button>
                    </div>

                    {restMethod !== 'GET' && (
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Request Body (JSON)</label>
                        <textarea 
                          value={restBody}
                          onChange={(e) => setRestBody(e.target.value)}
                          className="w-full h-20 bg-slate-900 text-xs text-slate-300 font-mono p-2 rounded-xl outline-none focus:border-blue-500 resize-none"
                        />
                      </div>
                    )}

                    {restResBody && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>Status Code: <b className={restResCode === 200 ? 'text-emerald-400' : 'text-red-400'}>{restResCode}</b></span>
                          <span>Response Time: <b>{restResTime} ms</b></span>
                        </div>
                        <pre className="p-3 bg-black rounded-xl text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto">
                          {restResBody}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              }
              practiceQuestions={[
                { q: "Which HTTP status code represents a resource successfully created on the server?", options: ["200 OK", "201 Created", "202 Accepted", "204 No Content"], correct: "201 Created", explanation: "201 Created is the standard response status for successful POST resource creation requests." }
              ]}
              codingExercise={{
                instructions: "Complete the annotation used to parse HTTP JSON request payloads into method variables.",
                boilerplate: "@PostMapping(\"/add\")\npublic ResponseEntity<User> addUser(________ User user) {}",
                solutionRegex: "@RequestBody"
              }}
              miniProject={{
                title: "Secured User Registry REST API",
                description: "Expose standard RESTful endpoints mapping GET, POST, and DELETE calls to manage catalog databases dynamically."
              }}
              quiz={[
                { q: "What does idempotency imply for the DELETE method?", options: ["Multiple identical requests yield same resource state without secondary deletions", "It must delete a new item every time", "It can only be executed once per session", "It does not delete anything"], correct: "Multiple identical requests yield same resource state without secondary deletions", explanation: "DELETE is idempotent because executing it multiple times on the same item leaves the system state identical after the first delete." }
              ]}
            />
          )}

          {/* SPRING SECURITY TAB */}
          {activePanel === 'spring-sec' && (
            <TheoryFirstModule
              title="Spring Security Filter Chain"
              icon={Layers}
              introduction="Spring Security is a powerful and highly customizable authentication and access-control framework for Java applications. It acts as a shield protecting web resources through a series of security filters that authenticate and authorize incoming requests."
              theoryContent={
                <div className="space-y-4 text-left">
                  <p>
                    Unlike simple authorization checks built directly into routes, Spring Security implements a DelegatingFilterProxy that intercepts requests before they ever reach the Spring MVC DispatcherServlet. It coordinates a Delegating SecurityFilterChain containing filters for CORS, CSRF, Session authentication, and Bearer token parsing (JWT).
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white mb-2">Core Security Filter Concepts:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      <li><strong>SecurityFilterChain:</strong> A list of filters matched against the request URL to decide if auth, CSRF, or headers apply.</li>
                      <li><strong>AuthenticationManager:</strong> The API that defines how Spring Security performs authentication checks.</li>
                      <li><strong>UserDetailsService:</strong> Core interface to load user-specific security data from databases.</li>
                      <li><strong>CORS (Cross-Origin Resource Sharing):</strong> Restricts cross-origin resource requests originating from frontend scripts.</li>
                      <li><strong>CSRF (Cross-Site Request Forgery):</strong> Protection token verifying requests originated from the genuine frontend interface.</li>
                    </ul>
                  </div>
                </div>
              }
              aiExplanation="Imagine Spring Security is like airport security. Before you can reach the boarding gates (DispatcherServlet / Controllers), you must walk through a single-file line of security checkpoints (Filter Chain). One officer checks your ID (Authentication), another checks your luggage contents (CORS/CSRF), and if you pass all of them, you are authorized to board the flight!"
              useCases={[
                { title: "OAuth2 & JWT Web Services", desc: "Securing microservice endpoints by validating signed JSON Web Tokens (JWT) in authorization headers." },
                { title: "Role-Based Access Portals", desc: "Restricting administration routes to accounts mapped with ADMIN authorities." }
              ]}
              architectureDiagram={
                <svg viewBox="0 0 400 160" className="w-full max-h-[140px]">
                  <rect x="10" y="55" width="80" height="50" rx="8" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="2" />
                  <text x="50" y="84" textAnchor="middle" fill="#fff" fontSize="9">Request</text>

                  <path d="M 90 80 L 130 80" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <rect x="135" y="15" width="130" height="130" rx="8" fill="#0f172a" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="200" y="32" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="10">Security Filter Chain</text>

                  <rect x="145" y="48" width="110" height="20" rx="4" fill="#1e1b4b" stroke="#EF4444" strokeWidth="1" />
                  <text x="200" y="61" textAnchor="middle" fill="#EF4444" fontSize="8">Cors/CsrfFilter</text>

                  <rect x="145" y="75" width="110" height="20" rx="4" fill="#1e1b4b" stroke="#F59E0B" strokeWidth="1" />
                  <text x="200" y="88" textAnchor="middle" fill="#F59E0B" fontSize="8">JwtAuthFilter</text>

                  <rect x="145" y="102" width="110" height="20" rx="4" fill="#1e1b4b" stroke="#10B981" strokeWidth="1" />
                  <text x="200" y="115" textAnchor="middle" fill="#10B981" fontSize="8">AuthzFilter</text>

                  <path d="M 265 80 L 305 80" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <rect x="310" y="55" width="80" height="50" rx="8" fill="#1e1b4b" stroke="#10B981" strokeWidth="1.5" />
                  <text x="350" y="84" textAnchor="middle" fill="#fff" fontSize="9">Spring Controller</text>
                </svg>
              }
              workflowDiagram={
                <svg viewBox="0 0 500 80" className="w-full max-h-[70px]">
                  <g transform="translate(10, 10)">
                    <rect x="0" y="0" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="1" />
                    <text x="50" y="24" textAnchor="middle" fill="#fff" fontSize="8">Request</text>
                  </g>
                  <path d="M 115 30 L 145 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(150, 10)">
                    <rect x="0" y="0" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="1" />
                    <text x="50" y="24" textAnchor="middle" fill="#fff" fontSize="8">JWT Authenticate</text>
                  </g>
                  <path d="M 255 30 L 285 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(290, 10)">
                    <rect x="0" y="0" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1" />
                    <text x="50" y="24" textAnchor="middle" fill="#fff" fontSize="8">Evaluate Roles</text>
                  </g>
                  <path d="M 395 30 L 425 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(430, 10)">
                    <rect x="0" y="0" width="60" height="40" rx="6" fill="#1e1b4b" stroke="#F59E0B" strokeWidth="1" />
                    <text x="30" y="24" textAnchor="middle" fill="#fff" fontSize="8">Allowed</text>
                  </g>
                </svg>
              }
              steps={[
                { title: "Intercept Request", desc: "DelegatingFilterProxy captures incoming query calls before hitting Tomcat Servlet Dispatcher." },
                { title: "Authenticate Credentials", desc: "Read authorization headers (JWT / Basic) and pass credential states to AuthenticationManager." },
                { title: "Resolve Authorities", desc: "Load active user roles (e.g. ROLE_USER, ROLE_ADMIN) and match against security routing rules." },
                { title: "Permit or Deny Entry", desc: "Allow requests to pass through to Controller mappings, or return 401/403 HTTP header exceptions." }
              ]}
              interviewQuestions={[
                { q: "What is the difference between Authentication and Authorization?", a: "Authentication is the process of verifying who a user is (identity check). Authorization is the process of verifying what access permissions and resource privileges the authenticated user holds." },
                { q: "What is the purpose of CSRF protection?", a: "CSRF protection ensures that malicious third-party sites cannot hijack user credentials or execute state-modifying requests on behalf of an authenticated browser session." }
              ]}
              importantNotes={[
                "Always disable CSRF only for stateless REST APIs using JWT tokens; session-based cookie web services must have CSRF enabled.",
                "Never store raw plaintext user passwords in database tables; configure BCryptPasswordEncoder to hash passwords."
              ]}
              visualization={
                <div className="space-y-3 text-left">
                  <span className="text-xs font-bold text-slate-300 block">Spring Security Filter Registry</span>
                  <div className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-1 text-xs font-mono">
                    <div>Stateful Context Session: <b className="text-red-400">STATELESS</b></div>
                    <div>CORS Policies: <b>Allowed Origin: *</b></div>
                    <div>CSRF Mode: <b className="text-slate-500">Disabled</b></div>
                  </div>
                </div>
              }
              simulator={
                <div className="space-y-4 text-left font-normal">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">Interactive Authorization Endpoint Checker</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        defaultValue="/api/secure-dashboard" 
                        id="secTestPath"
                        className="flex-grow px-3 py-1.5 bg-slate-850 border border-white/10 rounded-xl text-xs text-white outline-none"
                      />
                      <button 
                        onClick={() => {
                          const path = document.getElementById('secTestPath')?.value || '';
                          if (path.includes('public')) {
                            toast.success('HTTP 200 OK: Allowed public route');
                          } else {
                            toast.error('HTTP 401 Unauthorized: Bearer Token required');
                          }
                        }}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Authenticate
                      </button>
                    </div>
                  </div>
                </div>
              }
              practiceQuestions={[
                { q: "Which filter chain class interceptor defines authorization configurations programmatically?", options: ["UserDetailsService", "SecurityFilterChain", "AuthenticationProvider", "CorsConfiguration"], correct: "SecurityFilterChain", explanation: "SecurityFilterChain bean defines permitAll and authenticated rules matched against incoming URLs." }
              ]}
              codingExercise={{
                instructions: "Specify the password encoder bean implementation recommended for hashing database user secrets.",
                boilerplate: "@Bean\npublic PasswordEncoder passwordEncoder() {\n    return new ________();\n}",
                solutionRegex: "BCryptPasswordEncoder"
              }}
              miniProject={{
                title: "Secured JWT Endpoint Filter Chain",
                description: "Implement a custom JWT Filter reading Authorization headers, parsing payload claims, and setting SecurityContextHolder authentication."
              }}
              quiz={[
                { q: "What status code does Spring Security return when an unauthenticated query requests a secured route?", options: ["400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found"], correct: "401 Unauthorized", explanation: "401 Unauthorized signals that credentials were not provided or failed verification checks." }
              ]}
            />
          )}

          {/* MAVEN & GRADLE TAB */}
          {activePanel === 'maven-gradle' && (
            <TheoryFirstModule
              title="Maven & Gradle Build Automation"
              icon={Layers}
              introduction="Build automation tools compile source code, manage external library dependencies, execute test suites, and package Java projects into executable JAR or WAR artifacts."
              theoryContent={
                <div className="space-y-4 text-left">
                  <p>
                    Java build systems automate the lifecycle of software construction. Instead of manually downloading JAR files and compiling via <code>javac</code>, developers declare project dependencies and plugins in configuration files.
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white mb-2">Key Differences:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                      <li><strong>Maven (pom.xml):</strong> XML-based declarative configuration. Follows strict convention over configuration. Rigid build lifecycle.</li>
                      <li><strong>Gradle (build.gradle):</strong> Groovy or Kotlin DSL (Domain Specific Language). Highly customizable scripting. Incremental builds with superior performance caching.</li>
                    </ul>
                  </div>
                </div>
              }
              aiExplanation="Think of Maven like a pre-baked cake recipe kit where you must follow step 1, 2, and 3 exactly. Gradle is like a kitchen set with Lego blocks; you can follow a standard recipe, or easily build your own custom baking machinery!"
              useCases={[
                { title: "Dependency Management", desc: "Automating download, version alignment, and exclusion of external libraries from central repositories." },
                { title: "Packaging and Deployment", desc: "Compiling source files and building clean fat-JAR files containing all runtime dependencies." }
              ]}
              architectureDiagram={
                <svg viewBox="0 0 400 160" className="w-full max-h-[140px]">
                  <rect x="10" y="10" width="100" height="140" rx="8" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="2" />
                  <text x="60" y="80" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">Local Machine</text>
                  <text x="60" y="100" textAnchor="middle" fill="#94A3B8" fontSize="8">pom.xml / build.gradle</text>

                  <path d="M 110 50 L 190 50" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="150" y="42" textAnchor="middle" fill="#3B82F6" fontSize="8">1. Fetch Dependency</text>

                  <path d="M 190 110 L 110 110" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="150" y="125" textAnchor="middle" fill="#10B981" fontSize="8">2. Cache in ~/.m2</text>

                  <rect x="200" y="10" width="190" height="140" rx="8" fill="#0f172a" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="295" y="45" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">Maven Central Repo</text>
                  <text x="295" y="70" textAnchor="middle" fill="#94A3B8" fontSize="8">Remote Libraries & Metadata</text>
                </svg>
              }
              workflowDiagram={
                <svg viewBox="0 0 500 80" className="w-full max-h-[70px]">
                  <g transform="translate(10, 10)">
                    <rect x="0" y="0" width="70" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="1" />
                    <text x="35" y="24" textAnchor="middle" fill="#fff" fontSize="9">1. Clean</text>
                  </g>
                  <path d="M 85 30 L 105 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(110, 10)">
                    <rect x="0" y="0" width="80" height="40" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="1" />
                    <text x="40" y="24" textAnchor="middle" fill="#fff" fontSize="9">2. Compile</text>
                  </g>
                  <path d="M 195 30 L 215 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(220, 10)">
                    <rect x="0" y="0" width="70" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1" />
                    <text x="35" y="24" textAnchor="middle" fill="#fff" fontSize="9">3. Test</text>
                  </g>
                  <path d="M 295 30 L 315 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(320, 10)">
                    <rect x="0" y="0" width="80" height="40" rx="6" fill="#1e1b4b" stroke="#F59E0B" strokeWidth="1" />
                    <text x="40" y="24" textAnchor="middle" fill="#fff" fontSize="9">4. Package</text>
                  </g>
                  <path d="M 405 30 L 425 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(430, 10)">
                    <rect x="0" y="0" width="60" height="40" rx="6" fill="#1e1b4b" stroke="#EF4444" strokeWidth="1" />
                    <text x="30" y="24" textAnchor="middle" fill="#fff" fontSize="9">5. Install</text>
                  </g>
                </svg>
              }
              steps={[
                { title: "Clean Target", desc: "Deletes the target directory generated by previous builds to ensure fresh compilation." },
                { title: "Compile Source", desc: "Translates Java source files (*.java) into standard bytecode class files (*.class)." },
                { title: "Test Execution", desc: "Launches test suites (JUnit/TestNG) against compiled bytecode classes." },
                { title: "Package Bundling", desc: "Aggregates classes and resource assets into a distributable unit (.jar/.war file)." }
              ]}
              interviewQuestions={[
                { q: "What is a transitive dependency in Maven/Gradle?", a: "A transitive dependency is a dependency of a dependency. If your project depends on library A, and A depends on B, your project will automatically download and include B." },
                { q: "How do you exclude a specific transitive dependency in Maven?", a: "You use the <exclusions> tag nested inside the target <dependency> declaration to stop conflicting versions from loading." }
              ]}
              importantNotes={[
                "Always lock dependency versions in production builds (e.g. via dependencyManagement or version catalogs) to avoid unexpected builds from dynamic versions.",
                "Utilize gradle daemon settings in CI pipeline environments to optimize task execution speeds through JVM hot-start caching."
              ]}
              visualization={
                <div className="space-y-4 text-left">
                  <h4 className="text-xs font-bold text-slate-300">Local Dependency Cache (~/.m2)</h4>
                  <div className="p-3 bg-slate-950 rounded-xl space-y-2 border border-white/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-mono">~/.m2/repository/org/springframework/</span>
                      <span className="text-emerald-500 font-bold">2.4 MB</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-mono">~/.m2/repository/org/postgresql/postgresql/</span>
                      <span className="text-emerald-500 font-bold">1.1 MB</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-mono">~/.m2/repository/junit/junit/</span>
                      <span className="text-emerald-500 font-bold">380 KB</span>
                    </div>
                  </div>
                </div>
              }
              simulator={
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5 text-left">
                      <span className="text-xs font-bold text-white block">pom.xml (Maven Configuration)</span>
                      <pre className="p-2 bg-black rounded-lg text-[10px] text-emerald-400 font-mono leading-relaxed overflow-x-auto text-left">
{`<project>
  <groupId>com.eduverse</groupId>
  <artifactId>app</artifactId>
  <version>1.0.0</version>
</project>`}
                      </pre>
                      <button 
                        onClick={() => toast.success('mvn clean package: Compiled 12 classes. Generated app-1.0.0.jar')}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Run mvn clean package
                      </button>
                    </div>

                    <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5 text-left">
                      <span className="text-xs font-bold text-white block">build.gradle (Gradle Configuration)</span>
                      <pre className="p-2 bg-black rounded-lg text-[10px] text-[#8B5CF6] font-mono leading-relaxed overflow-x-auto text-left">
{`plugins { id 'java' }
group = 'com.eduverse'
version = '1.0.0'`}
                      </pre>
                      <button 
                        onClick={() => toast.success('gradle build: Executed 6 tasks. Build SUCCESS in 1.4s')}
                        className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Run gradle build
                      </button>
                    </div>
                  </div>
                </div>
              }
              practiceQuestions={[
                { q: "Which Maven lifecycle phase installs the package to the local repository?", options: ["package", "install", "deploy", "compile"], correct: "install", explanation: "The 'install' phase installs the built artifact into the local repository (~/.m2/repository)." }
              ]}
              codingExercise={{
                instructions: "Write the name of the root configuration file for Maven.",
                boilerplate: "File name: ________.xml",
                solutionRegex: "pom"
              }}
              miniProject={{
                title: "Build Automation Engine Integration",
                description: "Create a simple Maven build file declaring spring-boot-starter-web dependency and configure the maven-compiler-plugin to target Java 17."
              }}
              quiz={[
                { q: "What tool uses Groovy and Kotlin domain-specific languages for its build scripts?", options: ["Maven", "Ant", "Gradle", "Make"], correct: "Gradle", explanation: "Gradle builds are configured using Groovy or Kotlin DSL scripts." }
              ]}
            />
          )}

          {/* MICROSERVICES TAB */}
          {activePanel === 'microservices' && (
            <TheoryFirstModule
              title="Microservices Infrastructure"
              icon={Layers}
              introduction="Microservices break down monolithic backend structures into fine-grained, independently deployable web services communicating over lightweight protocols."
              theoryContent={
                <div className="space-y-4 text-left">
                  <p>
                    Distributed Java services require decentralized discovery, request routing, and reliability orchestration. Spring Cloud provides declarative wrappers around industry-standard components for service registration and api routing.
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-white mb-2">Core Microservices Components:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                      <li><strong>Eureka Server:</strong> A central lookup registry where service instances announce their location (IP and port) via heartbeats.</li>
                      <li><strong>Spring Cloud Gateway:</strong> The single entry-point that routes requests, verifies authentication, and performs rate limiting.</li>
                      <li><strong>Resilience4j / Circuit Breaker:</strong> Prevents cascading failures by opening circuits when downstream dependencies fail.</li>
                    </ul>
                  </div>
                </div>
              }
              aiExplanation="Imagine you run a hospital. Instead of one doctor doing everything (the monolith), you have a front desk (API Gateway) routing patients to specialized departments: Pediatrics, Cardiology, or Pharmacy (Microservices). A directory board (Eureka) keeps track of which rooms the doctors are currently in!"
              useCases={[
                { title: "Dynamic Scale Architecture", desc: "Spinning up dozens of instances of payment processors and automatically registering them with Eureka registries." },
                { title: "Fault Isolation boundaries", desc: "Wrapping user profile queries in circuit breakers so that profile page errors do not break catalog searches." }
              ]}
              architectureDiagram={
                <svg viewBox="0 0 600 200" className="w-full max-h-[160px]">
                  <rect x="20" y="70" width="100" height="60" rx="8" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="2" />
                  <text x="70" y="100" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">API Gateway</text>
                  
                  <path d="M 120 100 L 180 60" fill="none" stroke="#64748B" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
                  <path d="M 120 100 L 180 140" fill="none" stroke="#64748B" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
                  
                  <rect x="190" y="20" width="120" height="60" rx="8" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="250" y="50" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">Auth Service</text>
                  <text x="250" y="68" textAnchor="middle" fill="#10B981" fontSize="9">Port: 8081 [UP]</text>

                  <rect x="190" y="110" width="120" height="60" rx="8" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="2" />
                  <text x="250" y="140" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">Course Service</text>
                  <text x="250" y="158" textAnchor="middle" fill="#10B981" fontSize="9">Port: 8082 [UP]</text>

                  <path d="M 310 50 L 370 100" fill="none" stroke="#10B981" strokeWidth="2" />
                  <path d="M 310 140 L 370 100" fill="none" stroke="#10B981" strokeWidth="2" />

                  <rect x="380" y="70" width="160" height="60" rx="8" fill="#0c4a6e" stroke="#10B981" strokeWidth="2" />
                  <text x="460" y="100" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">Eureka Registry</text>
                  <text x="460" y="118" textAnchor="middle" fill="#38BDF8" fontSize="9">Discovery active</text>
                </svg>
              }
              workflowDiagram={
                <svg viewBox="0 0 500 80" className="w-full max-h-[70px]">
                  <g transform="translate(10, 10)">
                    <rect x="0" y="0" width="110" height="40" rx="6" fill="#1e1b4b" stroke="#3B82F6" strokeWidth="1" />
                    <text x="55" y="24" textAnchor="middle" fill="#fff" fontSize="9">User Request</text>
                  </g>
                  <path d="M 125 30 L 155 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(160, 10)">
                    <rect x="0" y="0" width="120" height="40" rx="6" fill="#1e1b4b" stroke="#8B5CF6" strokeWidth="1" />
                    <text x="60" y="24" textAnchor="middle" fill="#fff" fontSize="9">Gateway Authentication</text>
                  </g>
                  <path d="M 285 30 L 315 30" fill="none" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />

                  <g transform="translate(320, 10)">
                    <rect x="0" y="0" width="160" height="40" rx="6" fill="#1e1b4b" stroke="#10B981" strokeWidth="1" />
                    <text x="80" y="24" textAnchor="middle" fill="#fff" fontSize="9">Service Registry Routing lookup</text>
                  </g>
                </svg>
              }
              steps={[
                { title: "Service Startup Registration", desc: "Microservices start up and register their host address endpoints with the Eureka discovery registry." },
                { title: "Client Gateway Query", desc: "External requests hit Spring Cloud Gateway, which queries Eureka to locate live service node targets." },
                { title: "Load Balanced Call", desc: "The gateway forwards the payload using client-side load balancers like Spring Cloud LoadBalancer." }
              ]}
              interviewQuestions={[
                { q: "What is the role of a Eureka Server in Microservices?", a: "Eureka acts as a service discovery directory. Instead of hardcoding static IP addresses of multiple microservices, they register their dynamic IPs with Eureka on startup." },
                { q: "What happens when a service fails to send heartbeats?", a: "Eureka server detects the missing heartbeats and removes the failed instance from its registry to prevent routing traffic to a dead node." }
              ]}
              importantNotes={[
                "Always run multiple instances of Eureka Servers in high-availability peer-to-peer replication mode to avoid a single point of failure.",
                "Ensure circuit breakers are tuned correctly (failure rate threshold, slow call rate threshold) to prevent premature state changes."
              ]}
              visualization={
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 text-left">Eureka Service Registry Heartbeat Monitor</h4>
                  <div className="p-3 bg-slate-950 rounded-xl space-y-2 border border-white/5 text-left">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-semibold font-mono">AUTH-SERVICE:8081</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">UP (Last heartbeat: 3s ago)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-semibold font-mono">COURSE-SERVICE:8082</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">UP (Last heartbeat: 1s ago)</span>
                    </div>
                  </div>
                </div>
              }
              simulator={
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-slate-300 block text-left">Eureka Service Discoverer Simulator</span>
                    <div className="text-left">
                      <button 
                        onClick={() => {
                          toast.success('Heartbeat sync successful. Registered services: 2 [UP]');
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Sync Service Registry State
                      </button>
                    </div>
                  </div>
                </div>
              }
              practiceQuestions={[
                { q: "Which annotation registers a boot project as a Eureka Discovery Server?", options: ["@EnableDiscoveryClient", "@EnableEurekaServer", "@EnableRegistry", "@EurekaServer"], correct: "@EnableEurekaServer", explanation: "@EnableEurekaServer configures a Spring Boot app as the service lookup server." }
              ]}
              codingExercise={{
                instructions: "Enable service discovery client capabilities inside your microservice application starter.",
                boilerplate: "@________DiscoveryClient\n@SpringBootApplication\npublic class App {}",
                solutionRegex: "Enable"
              }}
              miniProject={{
                title: "API Routing Gateway Configurator",
                description: "Design a spring-cloud-gateway YAML configuration that routes all /api/v1/auth/** traffic to an auth-service instance dynamically."
              }}
              quiz={[
                { q: "What component handles rate limiting and authentication filters at the edge of microservices?", options: ["Eureka Server", "Spring Cloud Gateway", "Config Server", "Ribbon"], correct: "Spring Cloud Gateway", explanation: "Spring Cloud Gateway provides routing, request filtering, security checks, and rate limiting." }
              ]}
            />
          )}

          {/* PROJECTS TAB */}
          {activePanel === 'projects' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Enterprise Java Web Projects</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsList.map((p) => (
                  <div key={p.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <strong className="text-sm font-bold text-white">{p.title}</strong>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        p.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                        p.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {p.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Submission Status: <b>{p.status || 'Not Submitted'}</b></span>
                      <span>Quality: <b>{p.code_quality || 'N/A'}</b></span>
                    </div>

                    <button 
                      onClick={() => {
                        setActiveProject(p);
                        setProjectCode(p.code_boilerplate || 'public class Main {}');
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Load Project Editor
                    </button>
                  </div>
                ))}
              </div>

              {activeProject && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">Active Editor: {activeProject.title}</span>
                    <button 
                      onClick={() => handleProjectSubmit(activeProject.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Submit for AI Review
                    </button>
                  </div>
                  <textarea 
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    className="w-full h-64 bg-slate-900 text-slate-300 font-mono text-xs p-3 rounded-xl border border-white/10 outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* PRACTICE QUIZ TAB */}
          {activePanel === 'practice' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Topic Wise Questions & Timing</h3>
              
              {practiceList.map((pr) => {
                const feedback = practiceFeedback[pr.id];
                return (
                  <div key={pr.id} className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Format: <b>{pr.type.toUpperCase()}</b></span>
                      <span>Difficulty: <b>{pr.difficulty.toUpperCase()}</b></span>
                    </div>
                    <p className="text-sm font-bold text-slate-200">{pr.question}</p>

                    {pr.options ? (
                      <div className="grid grid-cols-2 gap-2">
                        {pr.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handlePracticeSubmit(pr.id, opt)}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left text-xs cursor-pointer"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          placeholder="Type answer code"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handlePracticeSubmit(pr.id, e.target.value);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs outline-none focus:border-blue-500 text-emerald-400 font-mono"
                        />
                      </div>
                    )}

                    {feedback && (
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                        <span className={`font-bold block ${feedback.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                          {feedback.isCorrect ? '✓ Correct Answer' : '✗ Incorrect'}
                        </span>
                        <p className="text-slate-400 mt-1">{feedback.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* CODING LAB TAB */}
          {activePanel === 'coding-lab' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Online Java Sandbox Compiler</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  <div className="bg-slate-900 rounded-t-xl px-4 py-2 border-b border-white/5 text-xs text-slate-500 font-mono flex justify-between items-center">
                    <span>Main.java</span>
                    <button 
                      onClick={() => {
                        setSandboxConsole('Compiling sandbox...\nLoading classpath modules...\nExecuting JVM bytecode...\n\nExecuting JVM sandbox...\nProcess finished with exit code 0.');
                        toast.success('Code Compiled Successfully');
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold cursor-pointer"
                    >
                      Compile & Run
                    </button>
                  </div>
                  <textarea 
                    value={sandboxCode}
                    onChange={(e) => setSandboxCode(e.target.value)}
                    className="w-full h-80 bg-slate-900 text-slate-300 font-mono text-xs p-3 rounded-b-xl border border-white/10 outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="bg-black/50 border border-white/10 p-4 rounded-2xl h-44 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Console Output</span>
                    <pre className="text-xs text-emerald-400 font-mono overflow-auto flex-grow mt-2">
                      {sandboxConsole || 'Click "Compile & Run" to execute code.'}
                    </pre>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-purple-400 block">AI Sandbox Analysis</span>
                    <button 
                      onClick={() => {
                        setAiSandboxAnalysis('Optimization Hint: Replace runtime output buffer with BufferedWriter to improve micro-benchmark latencies.');
                      }}
                      className="w-full py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Request AI Review
                    </button>
                    {aiSandboxAnalysis && (
                      <p className="text-[11px] text-slate-400 leading-normal">{aiSandboxAnalysis}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI MENTOR TAB */}
          {activePanel === 'mentor' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">AI Learning Coach System</h3>
              
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-300 block">Weak Areas Assessment</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Based on quiz results and compiler errors, here is the current improvement track:
                </p>
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-bold">
                  {weakAreas}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setInterviewOutput('AI Question: Explain the dirty read anomaly in JDBC transaction isolation levels, and how to prevent it.');
                      toast.success('Mock Interview Question Generated');
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Generate Mock Interview
                  </button>
                </div>

                {interviewOutput && (
                  <pre className="p-3 bg-black rounded-xl text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {interviewOutput}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activePanel === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Learning Performance Analytics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Weekly Study Time', value: '4.5 Hours' },
                  { label: 'Quiz Accuracy', value: '85%' },
                  { label: 'Completed Topics', value: '2' },
                  { label: 'Projects Done', value: '0' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">{item.label}</span>
                    <strong className="text-xl font-black text-white mt-1 block">{item.value}</strong>
                  </div>
                ))}
              </div>

              {/* Heatmap Grid */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-300 block">Study consistency heatmap (Past 7 Days)</span>
                <div className="grid grid-cols-7 gap-2">
                  {dashboardData?.analytics?.map((day) => (
                    <div key={day.date} className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-center">
                      <span className="text-[9px] text-slate-400 block">{day.date.split('-').slice(1).join('/')}</span>
                      <strong className="text-xs text-white block mt-1">{day.learning_time}m</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activePanel === 'achievements' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Auto Unlocked Achievements</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'JDBC Beginner', xp: 100, desc: 'Establish database connections with DriverManager.', unlocked: true },
                  { title: 'Servlet Explorer', xp: 150, desc: 'Setup custom web request handlings.', unlocked: true },
                  { title: 'JSP Specialist', xp: 150, desc: 'Implement directives and Expressions.', unlocked: false },
                  { title: 'Hibernate Master', xp: 200, desc: 'Map Java objects to relational columns.', unlocked: false },
                  { title: 'Spring Architect', xp: 300, desc: 'Setup DI beans and auto configurations.', unlocked: false }
                ].map((item) => (
                  <div key={item.title} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    item.unlocked ? 'bg-white/5 border-purple-500/30' : 'bg-white/[0.01] border-white/5 opacity-50'
                  }`}>
                    <div>
                      <strong className="text-sm font-bold text-white block">{item.title}</strong>
                      <span className="text-xs text-slate-400 block mt-1">{item.desc}</span>
                      <span className="text-[10px] text-slate-500 block mt-1 font-mono">XP Reward: +{item.xp} XP</span>
                    </div>
                    {item.unlocked && (
                      <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-[10px] text-purple-400 font-bold uppercase">
                        Unlocked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CERTIFICATION TAB */}
          {activePanel === 'certification' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Official Certificate Center</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upon completing the required Advanced Java course criteria, your certificate of excellence is generated automatically.
              </p>
              
              <div className="p-6 bg-white/5 border border-white/10 rounded-[28px] space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-violet-400" />
                    <span className="font-bold text-slate-100">Certificate Issuer</span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-widest \${
                    progress.completed_topics >= 5 ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-slate-500/10 border border-slate-500/30 text-slate-500'
                  }`}>
                    {progress.completed_topics >= 5 ? 'Eligible' : 'Locked'}
                  </span>
                </div>

                {progress.completed_topics >= 5 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-center space-y-2">
                      <span className="text-2xl">🏆</span>
                      <h4 className="text-sm font-bold text-white">Your Certificate is Ready!</h4>
                      <p className="text-xs text-slate-400">Click below to claim your official credentials.</p>
                      <button 
                        onClick={handleClaimCertificate}
                        className="mt-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl transition duration-300 transform hover:scale-105"
                      >
                        Claim Verified Credentials
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-950 border border-white/5 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 mx-auto">
                      🔒
                    </div>
                    <h4 className="text-sm font-bold text-white">Certificate Locked</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      You need to complete at least 5 syllabus modules to meet the qualification threshold. Current Progress: <b>{progress.completed_topics}/5</b>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
