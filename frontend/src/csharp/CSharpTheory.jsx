import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, Zap, BookOpen, CheckCircle, Award, BarChart2,
  HelpCircle, MessageSquare, RefreshCw, Code2, Play, Sparkles, StickyNote,
  Volume2, ShieldAlert, Cpu, Database, ChevronRight, CornerDownRight,
  Sun, Moon, VolumeX, Pause, BrainCircuit, Activity, Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import CSharpSmartTVPlayer from './CSharpSmartTVPlayer';

const CSHARP_THEORY_LESSONS = [
  {
    id: 'intro',
    title: 'C# Fundamentals',
    slug: 'csharp-fundamentals',
    desc: 'Learn the core C# syntax, variables, primitive types, type casting, and console input/output operations.',
    difficulty: 'Beginner',
    time: '45 mins',
    xp: 150,
    accent: '#7C3AED',
    icon: '🔷',
    topics: ['.NET Runtime', 'Syntax', 'Primitive Types', 'Casting', 'Console I/O'],
    chapters: [
      { title: '1. Welcome to C#', content: 'C# is a modern, object-oriented, and type-safe programming language developed by Microsoft.' },
      { title: '2. Common Type System', content: 'In C#, variables are divided into Value Types (stored on stack) and Reference Types (stored on heap).' },
      { title: '3. Standard Input Output', content: 'Use Console.WriteLine() to output text, and Console.ReadLine() to capture user keyboard inputs.' }
    ],
    script: [
      { type: 'intro', text: "Welcome to C# Fundamentals. C# is a modern, object-oriented, and type-safe programming language developed by Microsoft as part of the .NET platform." },
      { type: 'concept', text: "C# runs on the Common Language Runtime, or CLR. Your C# source code is first compiled into Intermediate Language, then JIT-compiled into native machine code at runtime." },
      { type: 'concept', text: "In C#, the type system is divided into Value Types stored on the stack, like int, double, bool, and char, and Reference Types stored on the heap, like string, arrays, and objects." },
      { type: 'code', text: "To declare variables, specify the type followed by the name. For example: int age = 21; string name = \"Bharath\"; bool isActive = true; You can also use 'var' for implicit typing." },
      { type: 'concept', text: "Type casting in C# works in two ways. Implicit casting happens automatically for safe conversions like int to double. Explicit casting requires parentheses, like (int)myDouble, and may lose data." },
      { type: 'code', text: "Console.WriteLine() prints output to the terminal. Console.ReadLine() captures keyboard input as a string. Use Convert.ToInt32() or int.Parse() to convert string input to numbers." },
      { type: 'warn', text: "Important: Always validate user input before converting. Using int.Parse() on invalid text will throw a FormatException. Use int.TryParse() for safe conversion." },
      { type: 'quiz', text: "Quick Check! What is the difference between Value Types and Reference Types in C#? Value Types live on the stack, Reference Types live on the heap." },
      { type: 'congrats', text: "Excellent work! You have completed C# Fundamentals. You now understand variables, types, casting, and console I/O operations in the .NET runtime." },
      { type: 'summary', text: "In this module we covered: .NET CLR execution, Value vs Reference types, variable declarations, implicit and explicit casting, and Console input/output operations." }
    ]
  },
  {
    id: 'control-flow',
    title: 'Control Flow & Logic',
    slug: 'control-flow',
    desc: 'Master conditional branching, pattern-matching switch expressions, and loop iterations.',
    difficulty: 'Beginner',
    time: '40 mins',
    xp: 120,
    accent: '#10B981',
    icon: '🔁',
    topics: ['If Else', 'Switch Pattern', 'For Loop', 'While Loop', 'Foreach'],
    chapters: [
      { title: '1. Conditional Statements', content: 'Use if, else if, and else blocks to conditionally branch execution based on boolean expressions.' },
      { title: '2. Switch Expressions', content: 'C# switch expressions match pattern variables and return values directly in a clean declarative syntax.' },
      { title: '3. Iteration Loops', content: 'Implement for, while, do-while, and foreach loops to iterate through collections efficiently.' }
    ],
    script: [
      { type: 'intro', text: "Welcome to Control Flow and Logic. In this module, you will master how C# programs make decisions and repeat operations using branches and loops." },
      { type: 'concept', text: "The if-else statement evaluates a boolean condition. If the condition is true, the if block executes. Otherwise, the else or else-if block runs. You can chain multiple conditions together." },
      { type: 'code', text: "Example: if (score >= 90) grade = 'A'; else if (score >= 80) grade = 'B'; else grade = 'C'; The ternary operator provides a shorthand: var result = (x > 0) ? \"Positive\" : \"Negative\";" },
      { type: 'concept', text: "C# switch expressions use modern pattern matching. They match values, types, and even property patterns to return results in a clean, declarative syntax without fall-through behavior." },
      { type: 'code', text: "var message = dayOfWeek switch { DayOfWeek.Monday => \"Start of the week\", DayOfWeek.Friday => \"Almost weekend!\", _ => \"Regular day\" }; The underscore acts as a default case." },
      { type: 'concept', text: "The for loop runs a fixed number of times. The while loop checks a condition before each iteration. The do-while loop guarantees at least one execution before checking." },
      { type: 'code', text: "The foreach loop iterates over any IEnumerable collection: foreach (var student in students) { Console.WriteLine(student.Name); } This is the safest way to iterate collections." },
      { type: 'warn', text: "Warning: Avoid infinite loops by always ensuring your loop condition will eventually become false. A missing increment in a for loop or a never-changing while condition will freeze your program." },
      { type: 'quiz', text: "Quick Check! What does the underscore _ represent in a C# switch expression? It is the discard pattern, acting as the default catch-all case." },
      { type: 'congrats', text: "Great job! You have mastered control flow in C#. You can now write conditional logic, pattern-matching switches, and all types of iteration loops." },
      { type: 'summary', text: "In this module we covered: if-else branching, ternary operators, modern switch expressions with pattern matching, for, while, do-while, and foreach loops." }
    ]
  },
  {
    id: 'oop',
    title: 'Object-Oriented Programming',
    slug: 'oop-concepts',
    desc: 'Encapsulation, inheritance, polymorphism, classes, objects, and interface contracts.',
    difficulty: 'Intermediate',
    time: '60 mins',
    xp: 200,
    accent: '#8B5CF6',
    icon: '🏛️',
    topics: ['Classes & Objects', 'Encapsulation', 'Properties', 'Inheritance', 'Interfaces'],
    chapters: [
      { title: '1. Classes and Objects', content: 'Classes are blueprints containing fields, properties, and methods. Objects are active instances allocated in Heap memory.' },
      { title: '2. Encapsulation & Properties', content: 'Protect object state using private backing fields and expose them safely using public C# Properties.' },
      { title: '3. Inheritance & Polymorphism', content: 'Extend classes using a colon (:), override virtual methods, and enforce design contracts via Interfaces.' }
    ],
    script: [
      { type: 'intro', text: "Welcome to Object-Oriented Programming in C#. OOP is the backbone of enterprise .NET development, organizing code into reusable, maintainable structures." },
      { type: 'concept', text: "A class is a blueprint that defines fields, properties, and methods. An object is a live instance of that class, allocated on the managed heap and tracked by the garbage collector." },
      { type: 'code', text: "public class Student { public string Name { get; set; } public int Age { get; set; } } — Create objects using: var student = new Student { Name = \"Bharath\", Age = 21 };" },
      { type: 'concept', text: "Encapsulation hides internal object state using private fields and exposes controlled access through public properties. This protects data integrity and validates input." },
      { type: 'code', text: "private int _age; public int Age { get => _age; set { if (value < 0) throw new ArgumentException(); _age = value; } } — The setter validates before assignment." },
      { type: 'concept', text: "Inheritance lets a derived class extend a base class using the colon syntax. The derived class inherits all public and protected members and can override virtual methods." },
      { type: 'code', text: "public class Animal { public virtual void Speak() => Console.WriteLine(\"...\"); } public class Dog : Animal { public override void Speak() => Console.WriteLine(\"Woof!\"); }" },
      { type: 'concept', text: "Interfaces define contracts that classes must implement. A class can implement multiple interfaces, enabling polymorphism. Use interfaces to decouple dependencies in your architecture." },
      { type: 'warn', text: "Critical: C# does not support multiple class inheritance. Use interfaces instead to achieve polymorphic behavior across unrelated types. Prefer composition over deep inheritance chains." },
      { type: 'quiz', text: "Quick Check! What keyword makes a base class method overridable in C#? The 'virtual' keyword on the base method, combined with 'override' in the derived class." },
      { type: 'congrats', text: "Outstanding! You have mastered Object-Oriented Programming in C#. You understand classes, encapsulation, inheritance, polymorphism, and interface contracts." },
      { type: 'summary', text: "In this module we covered: Classes and objects, constructors, encapsulation with properties, single inheritance, method overriding with virtual/override, and interface contracts." }
    ]
  },
  {
    id: 'linq',
    title: 'LINQ Query Processing',
    slug: 'linq-queries',
    desc: 'Language Integrated Query structures for filtering, projection, and data manipulations.',
    difficulty: 'Intermediate',
    time: '50 mins',
    xp: 180,
    accent: '#EC4899',
    icon: '🔍',
    topics: ['Linq Basics', 'Query Syntax', 'Lambdas', 'Deferred Execution', 'Filtering'],
    chapters: [
      { title: '1. What is LINQ?', content: 'LINQ enables developer-friendly SQL-like querying directly inside C# code on any enumerable dataset.' },
      { title: '2. Query Syntax vs Method Syntax', content: 'Query syntax resembles SQL (from x in list select x), while Method syntax uses fluent lambdas (.Where(x => x.Active)).' },
      { title: '3. Lazy Evaluation', content: 'LINQ queries are not executed when defined. Execution is deferred until you iterate the query using foreach or .ToList().' }
    ],
    script: [
      { type: 'intro', text: "Welcome to LINQ Query Processing. LINQ, or Language Integrated Query, lets you write powerful SQL-like queries directly inside your C# code against any data source." },
      { type: 'concept', text: "LINQ works on any type that implements IEnumerable or IQueryable. This includes arrays, lists, dictionaries, database tables via Entity Framework, and even XML documents." },
      { type: 'code', text: "Query syntax looks like SQL: var results = from s in students where s.GPA > 3.5 orderby s.Name select s; This is compiled into method calls by the C# compiler." },
      { type: 'code', text: "Method syntax uses lambda expressions and extension methods: var results = students.Where(s => s.GPA > 3.5).OrderBy(s => s.Name).Select(s => s); Both produce identical results." },
      { type: 'concept', text: "Lambda expressions are anonymous functions used heavily in LINQ. The syntax is: (parameters) => expression. For example: x => x * 2 doubles a value, or (a, b) => a + b adds two values." },
      { type: 'warn', text: "Critical concept: LINQ uses deferred execution. The query is NOT executed when defined. It only runs when you iterate it with foreach, or call .ToList(), .ToArray(), or .Count()." },
      { type: 'code', text: "Common LINQ operations: .Where() for filtering, .Select() for projection, .OrderBy() for sorting, .GroupBy() for grouping, .Join() for combining, and .Aggregate() for reduction." },
      { type: 'concept', text: "LINQ to Entity Framework translates C# LINQ queries into actual SQL statements that execute on the database server. This means your C# code controls database queries without writing raw SQL." },
      { type: 'quiz', text: "Quick Check! When does a LINQ query actually execute? It executes only when the results are enumerated, not when the query variable is declared. This is called deferred execution." },
      { type: 'congrats', text: "Fantastic! You have mastered LINQ Query Processing. You can now filter, project, sort, group, and join data using both query and method syntax." },
      { type: 'summary', text: "In this module we covered: LINQ fundamentals, query syntax vs method syntax, lambda expressions, deferred execution, common operations like Where, Select, OrderBy, GroupBy, and LINQ to EF." }
    ]
  }
];

const BADGES = [
  { id: 'csharp-beginner', name: 'C# Beginner', icon: '🔷', desc: 'Completed C# Fundamentals' },
  { id: 'oop-explorer', name: 'OOP Explorer', icon: '🏛️', desc: 'Completed C# OOP' },
  { id: 'linq-expert', name: 'LINQ Expert', icon: '🔍', desc: 'Completed LINQ Queries' },
  { id: 'net-specialist', name: 'net Specialist', icon: '🌱', desc: 'Completed ASP.NET' }
];

export default function CSharpTheory() {
  const { isDarkMode } = useTheme();
  const isDark = isDarkMode;
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTalking, setIsTalking] = useState(false);
  const [activeLessonTab, setActiveLessonTab] = useState('learn');
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [voiceGender, setVoiceGender] = useState('female');
  const [notepad, setNotepad] = useState('');
  const [aiChat, setAiChat] = useState([
    { role: 'assistant', text: 'Ask me to explain this chapter, give examples, or create a practice task!' }
  ]);
  const [aiInput, setAiInput] = useState('');

  // Web Speech synthesis
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const handleSpeak = () => {
    if (!synth) return;
    synth.cancel();
    
    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
      return;
    }

    const currentText = selectedLesson.chapters[currentChapterIdx].content;
    const utterance = new SpeechSynthesisUtterance(currentText);
    utterance.rate = voiceSpeed;

    const voices = synth.getVoices();
    let voice = voices.find(v => v.name.toLowerCase().includes(voiceGender === 'female' ? 'zira' : 'david') || v.name.toLowerCase().includes(voiceGender));
    if (voice) utterance.voice = voice;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    synth.speak(utterance);
  };

  const handleStop = () => {
    if (synth) {
      synth.cancel();
      setIsPlaying(false);
    }
  };

  const handleCoachAction = (action) => {
    let responseText = '';
    const currentScriptStep = selectedLesson?.script?.[currentStep];
    const stepTitle = currentScriptStep?.text?.slice(0, 40) || selectedLesson?.chapters?.[currentChapterIdx]?.title || 'current topic';
    
    if (action === 'explain') {
      responseText = `Here is an in-depth breakdown of "${stepTitle}": This is a central architecture pattern in .NET development ensuring type safety and memory garbage collection by the CLR.`;
    } else if (action === 'example') {
      responseText = `Here is a practical code example for "${stepTitle}":\n\`\`\`csharp\n// Code snippet\nConsole.WriteLine("Executing runtime instruction...");\n\`\`\``;
    } else if (action === 'task') {
      responseText = `Try this practice task: Write a small console program that implements the concept we discussed in "${stepTitle}".`;
    } else if (action === 'bugs') {
      responseText = `Find the bug in this snippet:\n\`\`\`csharp\nint val = null; // Can an integer be null in C#?\n\`\`\``;
    }
    
    setAiChat(prev => [...prev, { role: 'assistant', text: responseText }]);
  };

  const sendUserMessage = () => {
    if (!aiInput.trim()) return;
    setAiChat(prev => [...prev, { role: 'user', text: aiInput }]);
    const query = aiInput;
    setAiInput('');

    setTimeout(() => {
      setAiChat(prev => [...prev, { role: 'assistant', text: `Got it! Understood your question: "${query}". In C# .NET, this is processed securely by the compilation pipeline.` }]);
    }, 800);
  };

  // Handle step change from SmartTV player
  const handleStepChange = useCallback((step) => {
    setCurrentStep(step);
    const script = selectedLesson?.script || [];
    if (step === script.length - 1) {
      toast.success(`🎉 Module Complete! +${selectedLesson.xp} XP earned!`, {
        icon: '🏆',
        style: { background: isDark ? '#0B1020' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#0F172A' }
      });
    }
  }, [selectedLesson, isDark]);

  const handleTalkingChange = useCallback((talking) => {
    setIsTalking(talking);
  }, []);

  // If a lesson is selected, show the Premium Learning Studio with SmartTV Player
  if (selectedLesson) {
    const script = selectedLesson.script || [];
    const totalSteps = script.length;
    const accentColor = selectedLesson.accent || '#7C3AED';
    const progress = totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0;

    const themeBg = isDark ? 'bg-[#050816] text-[#E2E8F0]' : 'bg-[#F8FAFC] text-[#1E293B]';
    const themeCard = isDark ? 'bg-[#0b1020]/75 border-white/5' : 'bg-white border-slate-200 shadow-sm shadow-slate-200/60';
    const themeTextMuted = isDark ? 'text-slate-400' : 'text-slate-600';
    const themeBorder = isDark ? 'border-white/5' : 'border-slate-200';

    return (
      <div className={`min-h-screen ${themeBg} selection:bg-purple-500/30 selection:text-white font-sans relative overflow-x-hidden pb-32 transition-colors duration-300`}>
        
        {/* Custom Styles */}
        <style>{`
          .csharp-glow {
            box-shadow: ${isDark 
              ? `0 0 50px -10px ${accentColor}30, 0 0 30px -15px ${accentColor}20`
              : `0 10px 40px -10px rgba(0, 0, 0, 0.04), 0 0 20px -5px ${accentColor}10`};
          }
          .neon-border {
            position: relative;
          }
          .neon-border::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 1px;
            background: ${isDark 
              ? `linear-gradient(135deg, ${accentColor}80, transparent 40%, rgba(255,255,255,0.05) 60%, ${accentColor}50)`
              : `linear-gradient(135deg, ${accentColor}40, transparent 40%, rgba(0,0,0,0.02) 60%, ${accentColor}30)`};
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
          }
          .glass-panel-cs {
            background: ${isDark ? 'rgba(11, 16, 32, 0.6)' : 'rgba(255, 255, 255, 0.85)'};
            backdrop-filter: blur(20px);
            border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'};
          }
        `}</style>

        {/* Decorative Orbs */}
        <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full ${isDark ? 'bg-purple-900/10' : 'bg-purple-500/5'} blur-[150px] pointer-events-none`} />
        <div className={`absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full ${isDark ? 'bg-indigo-950/10' : 'bg-indigo-500/5'} blur-[150px] pointer-events-none`} />

        <div className="max-w-[1550px] mx-auto px-4 md:px-8 pt-4 space-y-8 relative z-10">

          {/* ── HEADER — Premium Hero Card ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-6 md:p-8 glass-panel-cs relative overflow-hidden csharp-glow neon-border"
          >
            <div className={`absolute inset-0 ${isDark ? 'bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px)]'} bg-[size:32px_32px] pointer-events-none`} />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start md:items-center gap-5">
                <motion.div
                  whileHover={{ rotate: [0, 5, -5, 0] }}
                  className={`text-6xl p-4 rounded-2xl ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-100 border-slate-200'} border flex items-center justify-center backdrop-blur-md`}
                >
                  {selectedLesson.icon}
                </motion.div>
                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <button
                      onClick={() => { handleStop(); setSelectedLesson(null); setCurrentStep(0); }}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-650 transition-colors font-mono uppercase tracking-widest"
                    >
                      <ArrowLeft size={12} />
                      C# .NET
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">Module {selectedLesson.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-500 border-purple-500/20`}>
                      {selectedLesson.difficulty}
                    </span>
                  </div>
                  <h1 className={`text-2xl md:text-4xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                    {selectedLesson.title}
                  </h1>
                  <p className={`text-sm ${themeTextMuted} mt-1 max-w-2xl`}>{selectedLesson.desc}</p>
                </div>
              </div>

              {/* Top Right Mini Stats */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className={`rounded-2xl px-4 py-2.5 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-100 border-slate-200'} border flex items-center gap-2`}>
                  <Clock size={14} className="text-cyan-500" />
                  <span className={`text-xs font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{selectedLesson.time}</span>
                </div>
                <div className={`rounded-2xl px-4 py-2.5 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-100 border-slate-200'} border flex items-center gap-2`}>
                  <Zap size={14} className="text-amber-500" />
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-300">{selectedLesson.xp} XP</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(0)}
                  className="px-6 py-2.5 rounded-2xl text-xs font-black text-white transition-all shadow-lg hover:shadow-purple-500/20 font-mono tracking-wider uppercase border border-white/10"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
                >
                  Resume Module
                </motion.button>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className={`mt-6 pt-4 border-t ${themeBorder}`}>
              <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                <span className="font-medium tracking-wide uppercase font-mono">Module Mastery</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'} font-mono`}>{progress}% Complete</span>
              </div>
              <div className={`h-2 ${isDark ? 'bg-slate-900/60' : 'bg-slate-200'} rounded-full overflow-hidden border ${themeBorder} p-[1px]`}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${accentColor}, #A855F6, #EC4899)` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          </motion.div>

          {/* ── MAIN STUDIO LAYOUT — 70/30 SPLIT ── */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            
            {/* LEFT SIDE (70%): Smart TV Player & Content */}
            <div className="lg:col-span-7 space-y-8 min-w-0">
              
              {/* Smart TV Player */}
              <div 
                className={`rounded-[32px] overflow-hidden relative csharp-glow neon-border p-2 ${isDark ? 'bg-[#080b15]' : 'bg-slate-200'}`}
                style={{ height: '520px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-white/[0.03] pointer-events-none rounded-[32px] z-10" />
                <div className="w-full h-full rounded-[24px] overflow-hidden relative">
                  <CSharpSmartTVPlayer
                    lesson={selectedLesson}
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onStepChange={handleStepChange}
                    accentColor={accentColor}
                    onTalkingChange={handleTalkingChange}
                  />
                </div>
              </div>

              {/* Chapters Map */}
              <div className={`rounded-2xl p-4 ${themeCard} border`}>
                <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-500'} uppercase tracking-widest block mb-3 font-mono`}>Chapters Map</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {script.map((s, i) => {
                    const isActive = i === currentStep;
                    const isDone = i < currentStep;
                    return (
                      <button
                        key={i}
                        onClick={() => handleStepChange(i)}
                        className={`text-left text-xs px-3.5 py-2.5 rounded-xl border transition-all truncate flex items-center gap-2 ${
                          isActive
                            ? 'font-bold shadow-md'
                            : isDone
                            ? `border-transparent ${isDark ? 'text-slate-400 bg-white/[0.01]' : 'text-slate-600 bg-slate-100'}`
                            : `border-transparent ${isDark ? 'text-slate-500 hover:text-slate-300 bg-white/[0.005]' : 'text-slate-700 hover:text-slate-900 bg-slate-100/50'}`
                        }`}
                        style={isActive ? { borderColor: accentColor + '60', color: accentColor, background: (isDark ? accentColor + '10' : accentColor + '12') } : {}}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-current animate-pulse' : isDone ? 'bg-emerald-500' : (isDark ? 'bg-slate-600' : 'bg-slate-400')}`} />
                        <span className="truncate">{i + 1}. {s.text.slice(0, 22)}...</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Control Buttons */}
              <div className={`sticky top-4 z-40 p-1.5 ${isDark ? 'bg-[#0a0d1a]/85 border-white/5' : 'bg-white/95 border-slate-200'} border backdrop-blur-md rounded-2xl flex items-center gap-1.5 overflow-x-auto shadow-xl csharp-glow`}>
                {[
                  { id: 'learn', label: '🎬 Learn' },
                  { id: 'architecture', label: '💡 Architecture' },
                  { id: 'practice', label: '💻 Practice' },
                  { id: 'quiz', label: '🧠 Quiz' },
                  { id: 'projects', label: '🏆 Projects' }
                ].map(tab => {
                  const isActive = activeLessonTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveLessonTab(tab.id)}
                      className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                        isActive
                          ? 'shadow-lg border'
                          : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      style={isActive ? {
                        background: isDark ? accentColor + '20' : accentColor + '15',
                        borderColor: accentColor + '50',
                        color: isDark ? '#FFFFFF' : accentColor,
                        boxShadow: `0 4px 20px ${accentColor}20`
                      } : {}}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Content Panels */}
              <div className="space-y-8 min-h-[400px]">
                {activeLessonTab === 'learn' && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl p-8 ${themeCard} border`}>
                    <h4 className="text-base font-bold flex items-center gap-2 mb-4"><BookOpen size={16} /> Concept Deep Dive</h4>
                    <p className={`text-sm leading-relaxed ${themeTextMuted}`}>
                      {script[currentStep]?.text || 'Navigate through the slides above to explore C# concepts.'}
                    </p>
                    <p className={`text-xs mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      In C# .NET, this compiles directly into Intermediate Language (IL) metadata, which is executed safely inside the Virtual Common Language Runtime (CLR).
                    </p>
                  </motion.div>
                )}

                {activeLessonTab === 'architecture' && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl p-8 ${themeCard} border`}>
                    <h4 className="text-base font-bold flex items-center gap-2 mb-4"><BarChart2 size={16} /> Architecture Visualizer</h4>
                    <div className={`p-6 rounded-2xl border text-center ${isDark ? 'bg-[#050816]/60 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono">
                        <span className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">C# Compiler (csc)</span>
                        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>→</span>
                        <span className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">Intermediate Language (IL)</span>
                        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>→</span>
                        <span className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">CLR JIT (Machine Code)</span>
                      </div>
                      <p className={`text-[11px] mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Live C# execution flow visualization. Code runs securely managed by the .NET garbage collector.</p>
                    </div>
                  </motion.div>
                )}

                {activeLessonTab === 'practice' && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl p-8 ${themeCard} border`}>
                    <h4 className="text-base font-bold flex items-center gap-2 mb-4"><Code2 size={16} /> Interactive Practice Code</h4>
                    <pre className={`p-4 rounded-xl font-mono text-xs overflow-x-auto ${isDark ? 'bg-[#050816] text-emerald-400 border border-white/5' : 'bg-slate-50 text-slate-800 border border-slate-200'}`}>
{`using System;

public class ModulePractice
{
    public static void Main()
    {
        // Practice: ${selectedLesson.title}
        Console.WriteLine("Step ${currentStep + 1}: ${script[currentStep]?.text?.slice(0, 50) || 'Practice'}...");
    }
}`}
                    </pre>
                  </motion.div>
                )}

                {activeLessonTab === 'quiz' && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl p-8 ${themeCard} border`}>
                    <h4 className="text-base font-bold flex items-center gap-2 mb-4"><Award size={16} /> Chapter Assessment</h4>
                    <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#050816]/60 border-white/5' : 'bg-slate-50 border-slate-150'}`}>
                      <strong className="text-xs block mb-3">Which component compiles IL code into native machine code in the .NET framework?</strong>
                      <div className="space-y-2">
                        {['1. Roslyn Compiler', '2. JIT Compiler (Just-In-Time)', '3. MSBuild Engine', '4. CLR Garbage Collector'].map((opt, idx) => (
                          <button 
                            key={idx}
                            onClick={() => {
                              if (idx === 1) toast.success('Correct answer! +20 XP');
                              else toast.error('Incorrect. Try again!');
                            }}
                            className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition ${
                              isDark ? 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-750'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeLessonTab === 'projects' && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl p-8 ${themeCard} border`}>
                    <h4 className="text-base font-bold flex items-center gap-2 mb-4"><Trophy size={16} /> Module Project Milestones</h4>
                    <p className={`text-sm ${themeTextMuted}`}>
                      Build a full console implementation mapping out all the chapters of this module. Compile and check against the AI reviewer inside the Practical Lab.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE (30%): AI Coding Coach Sidebar */}
            <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-4">
              <div className={`p-6 rounded-3xl border space-y-4 ${themeCard}`}>
                <div className="flex items-center gap-2">
                  <BrainCircuit className="text-purple-500 animate-brain-pulse" size={20} />
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>AI Coding Coach</h3>
                </div>

                <div className={`h-48 overflow-y-auto p-3 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-[#050816]/60 border-white/5' : 'bg-slate-50 border-slate-150'
                }`}>
                  {aiChat.map((msg, idx) => (
                    <div key={idx} className={`text-xs p-2.5 rounded-xl ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white ml-auto max-w-[80%]' 
                        : isDark ? 'bg-white/5 text-slate-300' : 'bg-white text-slate-800 border border-slate-100 shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  ))}
                </div>

                {/* Coach actions */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                  <button onClick={() => handleCoachAction('explain')} className={`py-2 rounded-lg border transition ${isDark ? 'bg-white/5 border-white/5 text-slate-350 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-750 hover:bg-slate-100'}`}>Explain Again</button>
                  <button onClick={() => handleCoachAction('example')} className={`py-2 rounded-lg border transition ${isDark ? 'bg-white/5 border-white/5 text-slate-350 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-750 hover:bg-slate-100'}`}>Give Example</button>
                  <button onClick={() => handleCoachAction('task')} className={`py-2 rounded-lg border transition ${isDark ? 'bg-white/5 border-white/5 text-slate-350 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-750 hover:bg-slate-100'}`}>Practice Task</button>
                  <button onClick={() => handleCoachAction('bugs')} className={`py-2 rounded-lg border transition ${isDark ? 'bg-white/5 border-white/5 text-slate-350 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-750 hover:bg-slate-100'}`}>Correct Bugs</button>
                </div>

                {/* Notepad */}
                <div className={`pt-3 border-t ${themeBorder} flex flex-col`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mb-2 font-mono">Mentor Notepad</span>
                  <textarea 
                    placeholder="Record key concepts and notes..."
                    value={notepad}
                    onChange={(e) => setNotepad(e.target.value)}
                    className={`w-full h-20 p-3 rounded-xl border text-xs outline-none resize-none ${
                      isDark ? 'bg-[#050816] border-white/5 text-slate-300 placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Course Index page (identical index layout to Advanced Java index page)
  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDark ? 'bg-[#090514] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-[1280px] mx-auto space-y-8 pt-10">
        
        {/* Banner */}
        <div className={`p-8 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden ${
          isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {isDark && <div className="absolute top-0 right-0 w-64 h-64 bg-purple-650/10 rounded-full blur-[100px]" />}
          <div className="space-y-2 text-left z-10">
            <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">AI Architect Academy</span>
            <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>C# Theory Studio</h1>
            <p className={`text-xs max-w-xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Learn C# variables, logical control flow, Object-Oriented polymorphism, LINQ memory filters, and concurrent async-await frameworks inside an elite coding academy.
            </p>
          </div>

          <div className="flex items-center gap-4 z-10 shrink-0">
            <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
              <strong className="text-xl font-black block">4</strong>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Modules</span>
            </div>
            <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
              <strong className="text-xl font-black block">650</strong>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Total XP</span>
            </div>
          </div>
        </div>

        {/* Badges Collection */}
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>Badges Collection</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BADGES.map(badge => (
              <div key={badge.id} className={`p-4 rounded-2xl border flex items-center gap-3 ${
                isDark ? 'bg-[#0b0816] border-white/5' : 'bg-slate-50 border-slate-100 shadow-sm'
              }`}>
                <span className="text-2xl">{badge.icon}</span>
                <div className="text-left">
                  <strong className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>{badge.name}</strong>
                  <span className="text-[10px] text-slate-400">{badge.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Syllabus Course List */}
        <div className="space-y-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>Course Syllabus</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CSHARP_THEORY_LESSONS.map((lesson, idx) => (
              <div 
                key={lesson.id} 
                className={`p-6 rounded-3xl border flex flex-col justify-between h-full hover:border-purple-500/40 transition duration-300 ${
                  isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="text-left space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Module {idx + 1}</span>
                    <span className="text-xs text-purple-650 bg-purple-500/10 px-2 py-0.5 rounded-full font-bold">{lesson.difficulty}</span>
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-850'}`}>{lesson.title}</h3>
                    <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{lesson.desc}</p>
                    
                    {/* Topics badges */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {lesson.topics.map((t, idx) => (
                        <span key={idx} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-105 dark:border-white/5">
                  <span className="text-xs text-slate-400">⏱️ {lesson.time} | ✨ {lesson.xp} XP</span>
                  <button 
                    onClick={() => { setSelectedLesson(lesson); setCurrentChapterIdx(0); setActiveLessonTab('learn'); }}
                    className="px-4 py-2 bg-purple-650 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    Start Module
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
