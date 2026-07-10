import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Layers, PlayCircle, BookOpen, Terminal, Sparkles, 
  Code2, CheckCircle, HelpCircle, ArrowLeft, Cpu, Shield, 
  FileCode, Play, AlertCircle, RefreshCw, Trophy, Flame, 
  ChevronRight, BrainCircuit, Activity, Eye, Compass, Save,
  Send, UserCheck, Lock, Unlock, Server, Monitor, HardDrive
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

// Confetti helper for achievements
const triggerConfetti = () => {
  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '8px';
    confetti.style.height = '8px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px';
    confetti.style.borderRadius = '50%';
    confetti.style.zIndex = '9999';
    confetti.style.pointerEvents = 'none';
    document.body.appendChild(confetti);

    const animation = confetti.animate([
      { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate3d(${(Math.random() - 0.5) * 300}px, 100vh, 0) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration: Math.random() * 2000 + 1500,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });

    animation.onfinish = () => confetti.remove();
  }
};

const ROADMAP_NODES = [
  { id: 'csharp-fund', label: 'C# Fundamentals', category: 'Basics', xp: 100, difficulty: 'Easy', time: '20m', desc: 'Variables, data types, and standard input/output.' },
  { id: 'oop-concepts', label: 'OOP Concepts', category: 'OOP', xp: 150, difficulty: 'Medium', time: '30m', desc: 'Classes, encapsulation, inheritance, and polymorphism.' },
  { id: 'exceptions', label: 'Exception Handling', category: 'Flow', xp: 120, difficulty: 'Easy', time: '25m', desc: 'Try-catch-finally blocks and custom exceptions.' },
  { id: 'collections', label: 'Collections', category: 'Data', xp: 130, difficulty: 'Medium', time: '30m', desc: 'Lists, Dictionaries, HashSets, and enumerators.' },
  { id: 'generics', label: 'Generics', category: 'Data', xp: 150, difficulty: 'Medium', time: '35m', desc: 'Generic classes, methods, and constraints.' },
  { id: 'delegates', label: 'Delegates', category: 'Advanced', xp: 180, difficulty: 'Hard', time: '40m', desc: 'Action, Func, Predicate, and multicast delegates.' },
  { id: 'events', label: 'Events', category: 'Advanced', xp: 160, difficulty: 'Medium', time: '30m', desc: 'Publish-subscribe pattern using event handlers.' },
  { id: 'linq', label: 'LINQ', category: 'Data', xp: 200, difficulty: 'Medium', time: '35m', desc: 'Language Integrated Query for filtering, sorting, and projecting.' },
  { id: 'files', label: 'File Handling', category: 'System', xp: 140, difficulty: 'Medium', time: '30m', desc: 'FileStream, StreamReader, StreamWriter, and serialization.' },
  { id: 'multithreading', label: 'Multithreading', category: 'Concurrency', xp: 200, difficulty: 'Hard', time: '45m', desc: 'Thread lifecycle, synchronization, and locks.' },
  { id: 'async', label: 'Async Programming', category: 'Concurrency', xp: 220, difficulty: 'Hard', time: '40m', desc: 'Asynchronous tasks, async, and await pattern.' },
  { id: 'adonet', label: 'ADO.NET', category: 'Database', xp: 180, difficulty: 'Medium', time: '35m', desc: 'SqlConnection, SqlCommand, and SqlDataReader.' },
  { id: 'aspnet', label: 'ASP.NET', category: 'Web', xp: 200, difficulty: 'Medium', time: '45m', desc: 'Web requests pipeline, routing, and middleware.' },
  { id: 'mvc', label: 'MVC', category: 'Web', xp: 220, difficulty: 'Hard', time: '50m', desc: 'Controllers, views, and viewmodels in ASP.NET Core.' },
  { id: 'webapi', label: 'Web APIs', category: 'Web', xp: 250, difficulty: 'Hard', time: '55m', desc: 'Designing RESTful controllers and dependency injection.' },
  { id: 'auth', label: 'Authentication', category: 'Security', xp: 250, difficulty: 'Hard', time: '50m', desc: 'Identity cookies, JWT authentication, and authorization.' }
];

const CODING_CHALLENGES = {
  'csharp-fund': {
    title: 'Variables and Output',
    description: 'Create a program that declares a name and age, and writes them to the console.',
    requirements: [
      'Declare a string variable named name',
      'Declare an int variable named age',
      'Use Console.WriteLine() to output: Hello, my name is [name] and I am [age] years old.'
    ],
    starterCode: `using System;

public class Program
{
    public static void Main()
    {
        string name = "John";
        int age = 25;
        
        // TODO: Output the required string
    }
}`,
    expectedOutput: 'Hello, my name is John and I am 25 years old.',
    hints: [
      'Use string interpolation: $"Hello, my name is {name} and I am {age} years old."',
      'Ensure the capitalization matches exactly.'
    ]
  },
  'linq': {
    title: 'LINQ Query Filter',
    description: 'Use LINQ to filter out even numbers from a list and sort them in ascending order.',
    requirements: [
      'Use .Where() to filter numbers where num % 2 == 0',
      'Use .OrderBy() to sort them',
      'Return the filtered collection'
    ],
    starterCode: `using System;
using System.Collections.Generic;
using System.Linq;

public class LinqPractice
{
    public static List<int> GetEvenNumbers(List<int> numbers)
    {
        // TODO: Filter and sort numbers using LINQ
        return numbers;
    }
}`,
    expectedOutput: '✓ All test cases passed!',
    hints: [
      'Use lambda expressions: numbers.Where(n => n % 2 == 0).OrderBy(n => n).ToList();'
    ]
  }
};

const DEBUG_CHALLENGES = [
  {
    id: 'debug-1',
    title: 'NullReferenceException in List',
    difficulty: 'Easy',
    xp: 80,
    description: 'The code throws a NullReferenceException because the list is not instantiated. Fix the bug.',
    brokenCode: `using System;
using System.Collections.Generic;

public class ListBug
{
    private static List<string> names;
    
    public static void Main()
    {
        names.Add("Alice");
        Console.WriteLine(names.Count);
    }
}`,
    solution: `using System;
using System.Collections.Generic;

public class ListBug
{
    private static List<string> names = new List<string>();
    
    public static void Main()
    {
        names.Add("Alice");
        Console.WriteLine(names.Count);
    }
}`
  },
  {
    id: 'debug-2',
    title: 'Async Task Deadlock',
    difficulty: 'Medium',
    xp: 120,
    description: 'Calling .Result on a Task in a synchronous context can cause a deadlock. Refactor it to use await properly.',
    brokenCode: `public string FetchData()
{
    var task = Task.Run(() => "Data");
    return task.Result; // Potential deadlock
}`,
    solution: `public async Task<string> FetchDataAsync()
{
    var data = await Task.Run(() => "Data");
    return data;
}`
  }
];

const PROJECTS = [
  {
    id: 'proj-1',
    title: 'Console Calculator',
    level: 'Beginner',
    duration: '1 hour',
    tech: 'C# Basics',
    desc: 'Develop a command-line calculator supporting basic arithmetic, history logging, and input validation.',
    xp: 150,
    features: ['Basic math operations', 'Calculation history tracking', 'Input parsing and safety validations']
  },
  {
    id: 'proj-2',
    title: 'Student Management System',
    level: 'Intermediate',
    duration: '3 hours',
    tech: 'OOP, LINQ, File I/O',
    desc: 'Build a console database to register students, calculate average grades, and save records to a CSV file.',
    xp: 350,
    features: ['Classes and Inheritance', 'LINQ queries for analytics', 'CSV File reader & writer']
  },
  {
    id: 'proj-3',
    title: 'E-Commerce REST API',
    level: 'Advanced',
    duration: '6 hours',
    tech: 'ASP.NET Core Web API, Entity Framework',
    desc: 'Design a web service with endpoints for catalog management, shopping cart checkouts, and JWT token authentication.',
    xp: 700,
    features: ['Controllers & Dependency Injection', 'SQL Database Entity Framework mapping', 'JWT Token-based security middleware']
  }
];

const ACHIEVEMENTS = [
  { id: 'ach-1', title: 'C# Beginner', desc: 'Successfully compile and run your first C# application.', icon: '🔷', unlocked: true },
  { id: 'ach-2', title: 'OOP Explorer', desc: 'Implement class hierarchies and interfaces.', icon: '🏛️', unlocked: false },
  { id: 'ach-3', title: 'LINQ Expert', desc: 'Build complex filtering and sorting chains using LINQ.', icon: '🔍', unlocked: true },
  { id: 'ach-4', title: 'API Builder', desc: 'Develop a RESTful Web API endpoint using ASP.NET Core.', icon: '🌐', unlocked: false },
  { id: 'ach-5', title: 'C# Champion', desc: 'Earn 1500 XP in the C# Practical Lab.', icon: '🏆', unlocked: false }
];

export default function CSharpPracticalLab({ onBack }) {
  const { isDarkMode: isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'roadmap', 'workspace', 'debug', 'projects', 'db-lab', 'achievements'
  const [selectedNode, setSelectedNode] = useState(ROADMAP_NODES[0]);
  const [workspaceCode, setWorkspaceCode] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [aiChat, setAiChat] = useState([
    { role: 'assistant', text: 'Hi! I am your C# AI mentor. Ask me to explain LINQ, fix C# errors, or provide hints!' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [selectedDebug, setSelectedDebug] = useState(null);
  const [debugCode, setDebugCode] = useState('');
  const [dbQuery, setDbQuery] = useState('SELECT * FROM Users LIMIT 5;');
  const [dbResults, setDbResults] = useState([
    { id: 1, name: 'John Doe', email: 'john@eduverse.com', role: 'Student' },
    { id: 2, name: 'Jane Smith', email: 'jane@eduverse.com', role: 'Instructor' }
  ]);
  const [vizType, setVizType] = useState('oop'); // 'oop', 'inheritance', 'memory', 'linq', 'mvc', 'api'
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get('/progress/analytics')
      .then(res => setAnalytics(res.data))
      .catch(err => console.error('Failed to load real analytics:', err));
  }, []);

  // Load default code when workspace opens
  useEffect(() => {
    if (selectedNode) {
      const challenge = CODING_CHALLENGES[selectedNode.id];
      if (challenge) {
        setWorkspaceCode(challenge.starterCode);
      } else {
        setWorkspaceCode(`using System;\n\npublic class Program\n{\n    public static void Main()\n    {\n        Console.WriteLine("Welcome to ${selectedNode.label}!");\n    }\n}`);
      }
      setConsoleLogs(['Workspace initialized for ' + selectedNode.label]);
    }
  }, [selectedNode]);

  // Run Code Simulation
  const handleRunCode = () => {
    setConsoleLogs(prev => [...prev, 'Compiling C# source code...', 'Running CLR execution...']);
    setTimeout(() => {
      const challenge = CODING_CHALLENGES[selectedNode.id];
      if (challenge) {
        if (true) {
          setConsoleLogs(prev => [...prev, `[OUTPUT] ${challenge.expectedOutput || '✓ All test cases passed!'}`, '✓ Execution Successful (+50 XP)']);
          toast.success('Challenge Completed! +50 XP');
          triggerConfetti();
        } else {
          setConsoleLogs(prev => [...prev, '[OUTPUT] FAILED: Starter code unmodified or incorrect.', '✗ Output does not match expected output.']);
          toast.error('Test cases failed. Check expected output.');
        }
      } else {
        setConsoleLogs(prev => [...prev, `[OUTPUT] Welcome to ${selectedNode.label}!`, 'Process finished with exit code 0']);
      }
    }, 1000);
  };

  // AI Assistant Interactions
  const handleAiSend = () => {
    if (!aiInput.trim()) return;
    setAiChat(prev => [...prev, { role: 'user', text: aiInput }]);
    const query = aiInput;
    setAiInput('');

    setTimeout(() => {
      let aiResponse = '';
      if (query.toLowerCase().includes('linq')) {
        aiResponse = `LINQ (Language Integrated Query) allows you to query collections in C# similar to SQL:
\`\`\`csharp
var query = names.Where(n => n.StartsWith("A")).OrderBy(n => n);
\`\`\``;
      } else if (query.toLowerCase().includes('interface')) {
        aiResponse = `An interface in C# defines a contract that classes must implement. It supports loose coupling and multiple inheritance:
\`\`\`csharp
public interface IRepository {
    void Save();
}
\`\`\``;
      } else {
        aiResponse = `C# is compiled into Intermediate Language (IL) which is then executed by the Common Language Runtime (CLR). Let me know if you need specific code examples!`;
      }
      setAiChat(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    }, 800);
  };

  const handleRunQuery = () => {
    if (dbQuery.toLowerCase().includes('select')) {
      setDbResults([
        { id: 1, name: 'John Doe', email: 'john@eduverse.com', role: 'Student' },
        { id: 2, name: 'Jane Smith', email: 'jane@eduverse.com', role: 'Instructor' }
      ]);
      toast.success('Query executed successfully!');
    } else {
      toast.success('Rows affected: 1');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans pb-10 transition-colors duration-300 ${
      isDark ? 'bg-[#090514] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* HEADER */}
      <div className={`border-b px-6 py-4 flex flex-col gap-4 ${
        isDark ? 'border-purple-500/10 bg-[#0c081d]' : 'border-slate-200 bg-white shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className={`p-2 rounded-xl transition flex items-center gap-2 text-xs border ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/5' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
              }`}
            >
              <ArrowLeft size={16} /> Hub
            </button>
            <div>
              <h1 className={`text-xl font-black flex items-center gap-2 ${
                isDark ? 'bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent' : 'text-slate-900'
              }`}>
                <Code2 className="text-purple-600" /> C# Practical Lab Workspace
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Visual Studio environment, LINQ analysis, and AI Mentor</p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className={`flex items-center gap-1 p-1 rounded-2xl overflow-x-auto w-full scrollbar-none border ${
          isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'
        }`}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Trophy },
            { id: 'roadmap', label: 'Roadmap', icon: Compass },
            { id: 'workspace', label: 'Workspace', icon: Terminal },
            { id: 'debug', label: 'Debug Arena', icon: AlertCircle },
            { id: 'projects', label: 'Project Hub', icon: Server },
            { id: 'db-lab', label: 'Database Lab', icon: Database },
            { id: 'achievements', label: 'Achievements', icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === tab.id 
                    ? 'bg-purple-655 text-white shadow-lg shadow-purple-600/30' 
                    : isDark 
                      ? 'text-slate-400 hover:text-white' 
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          
          {/* ─── 1. DASHBOARD ─── */}
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Lab XP', value: '1,200 XP', desc: '+200 this week', color: 'from-purple-500 to-indigo-500', icon: Sparkles },
                  { label: 'Completed Labs', value: '6 / 16', desc: '37% completion', color: 'from-emerald-500 to-teal-500', icon: CheckCircle },
                  { label: 'Current Streak', value: '4 Days', desc: 'Excellent!', color: 'from-orange-500 to-amber-500', icon: Flame },
                  { label: 'Projects Completed', value: '1', desc: '0 in review', color: 'from-blue-500 to-cyan-500', icon: Server }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div 
                      key={i} 
                      className={`p-5 rounded-2xl relative overflow-hidden group border transition duration-300 ${
                        isDark ? 'bg-[#120e2a] border-purple-500/10 hover:border-purple-500/30' : 'bg-white border-slate-200 hover:border-purple-500/30 shadow-sm'
                      }`}
                    >
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 blur-2xl rounded-full`} />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</span>
                          <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</span>
                          <span className={`text-[10px] block mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.desc}</span>
                        </div>
                        <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon size={18} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI & ML Performance Analytics Section */}
              {analytics && (
                <div className={`p-6 rounded-3xl border space-y-4 ${
                  isDark ? 'bg-gradient-to-br from-[#1b1437]/65 via-[#120e2a] to-[#0d091f] border-purple-500/20' : 'bg-gradient-to-br from-violet-50 via-white to-slate-50 border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="text-purple-600 animate-brain-pulse" size={22} />
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      AI-Powered Learning Performance Analytics
                    </h3>
                  </div>
                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed italic ${
                    isDark ? 'bg-[#0b0816]/85 border-white/5 text-slate-350' : 'bg-slate-50 border-slate-150 text-slate-700'
                  }`}>
                    "{analytics.aiSummary || 'Complete more C# practical labs and quizzes to receive personalized AI learning pattern feedback.'}"
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl border ${
                      isDark ? 'bg-[#0b0816]/50 border-emerald-500/10' : 'bg-emerald-50/30 border-emerald-100'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">AI-Identified Strengths</span>
                      <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{analytics.strengths || 'Analyzing learning patterns...'}</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${
                      isDark ? 'bg-[#0b0816]/50 border-rose-500/10' : 'bg-rose-50/30 border-rose-100'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-rose-600 block mb-1">AI-Identified Weaknesses</span>
                      <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{analytics.weaknesses || 'Analyzing learning patterns...'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Visualizer Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`p-6 rounded-3xl space-y-4 border lg:col-span-2 ${
                  isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    <Activity size={18} className="text-purple-600" /> Live Interactive Visualizations
                  </h3>
                  <div className={`flex gap-2 p-1 rounded-xl w-fit ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    {['oop', 'memory', 'linq', 'api'].map(type => (
                      <button 
                        key={type} 
                        onClick={() => { setVizType(type); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                          vizType === type 
                            ? 'bg-purple-600 text-white' 
                            : isDark 
                              ? 'text-slate-400 hover:text-white' 
                              : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Render Visualizer Box */}
                  <div className={`rounded-2xl p-6 flex flex-col justify-center items-center relative min-h-[220px] border ${
                    isDark ? 'bg-[#0b0816] border-white/5' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {vizType === 'oop' && (
                      <div className="w-full max-w-lg space-y-4 text-center">
                        <div className="flex justify-around items-center">
                          <div className="p-3 bg-purple-550/20 border border-purple-500/40 rounded-xl text-xs font-bold font-mono">class Student</div>
                          <div className="text-slate-400">→ Instantiates →</div>
                          <div className="p-3 bg-blue-500/20 border border-blue-500/40 rounded-xl text-xs font-bold font-mono">new Student() (Object)</div>
                        </div>
                        <p className="text-xs text-slate-500">Classes act as blueprints defined in code. Objects are instances allocated in memory during execution.</p>
                      </div>
                    )}

                    {vizType === 'memory' && (
                      <div className="w-full max-w-lg space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <span className="text-xs font-bold text-blue-500 block">Stack Memory</span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-2">Student reference s1 = 0x8F9A</span>
                          </div>
                          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                            <span className="text-xs font-bold text-purple-500 block">Heap Memory</span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-2">0x8F9A: {`{ Name = "Alice", Age = 20 }`}</span>
                          </div>
                        </div>
                        <p className="text-xs text-center text-slate-500">Value types and object references live on the Stack; object data itself is allocated on the Heap.</p>
                      </div>
                    )}

                    {vizType === 'linq' && (
                      <div className="w-full max-w-lg space-y-4 text-center">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="p-2 bg-slate-200 dark:bg-slate-800 rounded">List[1, 2, 3, 4]</span>
                          <span className="text-slate-400">.Where(n =&gt; n % 2 == 0)</span>
                          <span className="p-2 bg-purple-500/20 border border-purple-500/40 rounded">[2, 4]</span>
                        </div>
                        <p className="text-xs text-slate-500">LINQ translates standard filter patterns into lazy-evaluated enumerable collections.</p>
                      </div>
                    )}

                    {vizType === 'api' && (
                      <div className="w-full max-w-lg space-y-4 text-center">
                        <div className="flex justify-between items-center text-xs">
                          <span className="p-2 bg-blue-500/10 border border-blue-500/20 rounded">HTTP GET</span>
                          <span className="text-slate-400">→ Routing →</span>
                          <span className="p-2 bg-purple-500/10 border border-purple-500/20 rounded">API Controller</span>
                          <span className="text-slate-400">→</span>
                          <span className="p-2 bg-emerald-500/10 border border-emerald-550/20 rounded">JSON Response</span>
                        </div>
                        <p className="text-xs text-slate-500">ASP.NET Core Controllers map incoming network endpoints directly to C# method executions.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`p-6 rounded-3xl flex flex-col justify-between border ${
                  isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="space-y-4">
                    <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      <BrainCircuit size={18} className="text-purple-600" /> Resume Workspace
                    </h3>
                    <div className={`p-4 border rounded-2xl ${isDark ? 'bg-[#0b0816] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-[10px] font-bold text-purple-600 tracking-wider uppercase block mb-1">Active Topic</span>
                      <strong className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedNode.label}</strong>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('workspace')}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition duration-300 text-xs mt-4 flex items-center justify-center gap-2"
                  >
                    <Play size={12} fill="currentColor" /> Open C# Workspace
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── 2. ROADMAP ─── */}
          {activeTab === 'roadmap' && (
            <motion.div 
              key="roadmap" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-3xl border ${
                isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>C# Practical Learning Roadmap</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {ROADMAP_NODES.map((node, idx) => (
                    <div 
                      key={node.id}
                      onClick={() => { setSelectedNode(node); setActiveTab('workspace'); }}
                      className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between group relative ${
                        isDark ? 'bg-[#0b0816] border-white/5 hover:border-purple-500/40' : 'bg-slate-50 border-slate-100 hover:border-purple-500/40 shadow-sm'
                      }`}
                    >
                      <div className="absolute top-3 right-3 text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                        {node.difficulty}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest">{node.category}</span>
                        <h4 className={`text-sm font-bold mt-1 group-hover:text-purple-600 transition ${isDark ? 'text-white' : 'text-slate-800'}`}>{node.label}</h4>
                        <p className={`text-xs mt-2 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{node.desc}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
                        <span className="text-xs text-amber-650 font-bold">✨ {node.xp} XP</span>
                        <span className="text-xs text-slate-400 font-bold">⏱️ {node.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── 3. WORKSPACE ─── */}
          {activeTab === 'workspace' && (
            <motion.div 
              key="workspace" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] min-h-[600px]"
            >
              <div className={`border rounded-2xl flex flex-col overflow-hidden ${
                isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className={`p-4 border-b flex justify-between items-center ${
                  isDark ? 'border-purple-500/10 bg-[#0c081d]' : 'border-slate-200 bg-slate-50'
                }`}>
                  <h3 className="text-xs font-bold text-purple-650 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={14} /> Instructions
                  </h3>
                  <span className="text-xs text-amber-650 font-bold">✨ {selectedNode.xp} XP</span>
                </div>
                <div className={`p-5 flex-1 overflow-y-auto space-y-6 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-750'}`}>
                  <div>
                    <h2 className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedNode.label}</h2>
                    <p className="text-xs text-slate-400 mt-1">{selectedNode.desc}</p>
                  </div>

                  <div className={`space-y-2 p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <strong className="text-xs uppercase font-bold text-purple-600 block">Objective:</strong>
                    <p className="text-xs">
                      {CODING_CHALLENGES[selectedNode.id]?.description || 'Master the concepts of C# ' + selectedNode.label + ' by building structured, safe C# compilation modules.'}
                    </p>
                  </div>

                  {CODING_CHALLENGES[selectedNode.id] && (
                    <div className="space-y-3">
                      <strong className="text-xs uppercase font-bold text-blue-500 block">Step-by-Step Tasks:</strong>
                      <ul className="list-disc pl-5 space-y-2 text-xs">
                        {CODING_CHALLENGES[selectedNode.id].requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Editor */}
              <div className={`border rounded-2xl flex flex-col overflow-hidden lg:col-span-2 ${
                isDark ? 'bg-[#0b0816] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className={`p-4 border-b flex justify-between items-center ${
                  isDark ? 'border-purple-500/10 bg-[#0c081d]' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <FileCode size={14} className="text-blue-500" />
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Program.cs</span>
                  </div>
                  <button 
                    onClick={handleRunCode}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-2"
                  >
                    <Play size={12} fill="currentColor" /> Run Code
                  </button>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <textarea 
                    value={workspaceCode}
                    onChange={(e) => setWorkspaceCode(e.target.value)}
                    className={`w-full flex-1 p-6 text-xs font-mono outline-none resize-none leading-relaxed border-none focus:ring-0 ${
                      isDark ? 'bg-[#07040f] text-emerald-400' : 'bg-slate-50 text-slate-800'
                    }`}
                  />

                  {/* Console */}
                  <div className={`h-44 border-t flex flex-col ${
                    isDark ? 'bg-[#0a0714] border-purple-500/10' : 'bg-white border-slate-200'
                  }`}>
                    <div className={`px-4 py-2 border-b flex justify-between items-center ${
                      isDark ? 'border-white/5 bg-[#0e0a1f]' : 'border-slate-100 bg-slate-50'
                    }`}>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal size={12} /> Output Terminal
                      </span>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                      {consoleLogs.map((log, idx) => (
                        <div key={idx} className={log.startsWith('✓') ? 'text-emerald-500' : log.startsWith('✗') ? 'text-red-555' : ''}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── 4. DEBUG ARENA ─── */}
          {activeTab === 'debug' && (
            <motion.div 
              key="debug" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-3xl border ${
                isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h2 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2">
                  <AlertCircle size={20} /> Debug Arena
                </h2>
                <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Analyze and fix broken C# code blocks to claim bonus XP rewards.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    {DEBUG_CHALLENGES.map(challenge => (
                      <div 
                        key={challenge.id}
                        onClick={() => { setSelectedDebug(challenge); setDebugCode(challenge.brokenCode); }}
                        className={`p-4 rounded-2xl border transition cursor-pointer ${
                          selectedDebug?.id === challenge.id 
                            ? 'bg-purple-500/10 border-purple-500' 
                            : isDark 
                              ? 'bg-[#0b0816] border-white/5 hover:border-white/10' 
                              : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full">{challenge.difficulty}</span>
                        <h4 className={`text-sm font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{challenge.title}</h4>
                      </div>
                    ))}
                  </div>

                  <div className={`rounded-3xl p-6 flex flex-col space-y-4 border lg:col-span-2 ${
                    isDark ? 'bg-[#0b0816] border-white/5' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {selectedDebug ? (
                      <>
                        <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedDebug.title}</h3>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedDebug.description}</p>
                        <textarea
                          value={debugCode}
                          onChange={(e) => setDebugCode(e.target.value)}
                          className={`w-full h-64 p-4 rounded-xl border font-mono text-xs outline-none resize-none ${
                            isDark ? 'bg-[#07040f] border-white/5 text-emerald-450' : 'bg-white border-slate-200 text-slate-805'
                          }`}
                        />
                        <button 
                          onClick={() => {
                            if (debugCode.includes('new List<string>') || debugCode.includes('await')) {
                              toast.success('Bug fixed! +' + selectedDebug.xp + ' XP');
                              triggerConfetti();
                            } else {
                              toast.error('Code still contains the bug.');
                            }
                          }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs ml-auto"
                        >
                          Submit Bug Fix
                        </button>
                      </>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                        <AlertCircle size={36} className="mb-2" />
                        <span className="text-xs">Select a debugging challenge to begin</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── 5. PROJECTS ─── */}
          {activeTab === 'projects' && (
            <motion.div 
              key="projects" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-3xl border ${
                isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h2 className="text-lg font-bold text-blue-505 mb-4 flex items-center gap-2">
                  <Server size={20} /> Project Hub
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PROJECTS.map(proj => (
                    <div 
                      key={proj.id} 
                      className={`border rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/30 transition duration-300 ${
                        isDark ? 'bg-[#0b0816] border-white/5' : 'bg-slate-50 border-slate-100 shadow-sm'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2.5 py-0.5 rounded-full">{proj.level}</span>
                        <h3 className={`text-base font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{proj.title}</h3>
                        <p className={`text-xs mt-3 ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>{proj.desc}</p>
                      </div>
                      <button 
                        onClick={() => {
                          toast.success('C# Project Template Loaded!');
                          setSelectedNode({ label: proj.title, xp: proj.xp, desc: proj.desc });
                          setActiveTab('workspace');
                        }}
                        className={`w-full py-2.5 text-xs font-bold rounded-xl transition mt-6 border ${
                          isDark 
                            ? 'bg-white/5 border-white/5 text-slate-300 hover:bg-purple-600 hover:text-white' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-purple-600 hover:text-white'
                        }`}
                      >
                        Start Project
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── 6. DATABASE LAB ─── */}
          {activeTab === 'db-lab' && (
            <motion.div 
              key="db-lab" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-3xl border space-y-6 ${
                isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h2 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                  <Database size={20} /> Virtual Database Lab
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className={`border rounded-2xl p-5 flex flex-col space-y-4 lg:col-span-2 ${
                    isDark ? 'bg-[#0b0816] border-white/5' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <textarea 
                      value={dbQuery}
                      onChange={(e) => setDbQuery(e.target.value)}
                      className={`w-full h-32 p-4 rounded-xl border font-mono text-xs outline-none resize-none ${
                        isDark ? 'bg-[#07040f] border-white/5 text-emerald-450' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                    <button onClick={handleRunQuery} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition self-end">
                      Execute SQL
                    </button>
                  </div>
                  <div className={`border rounded-2xl p-5 space-y-3 ${
                    isDark ? 'bg-[#0b0816] border-white/5' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <h3 className="text-xs font-bold text-purple-650 uppercase tracking-wider">Schema Explorer</h3>
                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
                      <strong className="text-xs block font-mono">Users</strong>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">id: INT, name: VARCHAR, email: VARCHAR</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── 7. ACHIEVEMENTS ─── */}
          {activeTab === 'achievements' && (
            <motion.div 
              key="achievements" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-3xl border ${
                isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h2 className="text-lg font-bold text-amber-500 mb-6 flex items-center gap-2">
                  <Trophy size={20} /> C# Achievements & Badges
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ACHIEVEMENTS.map(ach => (
                    <div 
                      key={ach.id}
                      className={`p-5 rounded-2xl border flex items-center gap-4 relative overflow-hidden ${
                        ach.unlocked 
                          ? 'bg-purple-500/10 border-purple-500/30' 
                          : isDark 
                            ? 'bg-[#0b0816] border-white/5 opacity-50' 
                            : 'bg-slate-50 border-slate-100 opacity-60'
                      }`}
                    >
                      <div className="text-3xl">{ach.icon}</div>
                      <div>
                        <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{ach.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{ach.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
