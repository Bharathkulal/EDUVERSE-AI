import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Layers, Database, Filter, FolderOpen, Zap,
  Play, Pause, RotateCcw, Eye, Terminal, ArrowLeft, BookOpen,
  Monitor, Home, ArrowRight, Search, Sparkles, Flame, Trophy, Award,
  Shield, Network, Server, Cloud, Cpu, CheckCircle, AlertTriangle, PlayCircle,
  BrainCircuit, TrendingUp, Volume2, Clock, HelpCircle, Edit3, FileText, Trash2, Clipboard, Save, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import './CSharpLab.css';

// ═══════════════════════════════════════════════════════════
// DATA & INTERACTIVE CONTENT
// ═══════════════════════════════════════════════════════════
const CSHARP_MODULES = [
  {
    id: 'fundamentals',
    label: 'C# Fundamentals',
    desc: 'Declare variables, primitive data types, arithmetic operators, type casting, and handle system console I/O.',
    accent: '#3B82F6',
    type: 'Core Syntax',
    index: 1,
    topics: ['Variables', 'Data Types', 'Operators', 'Type Conversion', 'Input Output'],
    theory: 'Variables act as named storage locations in memory. C# is a strongly-typed language, meaning every variable must have a declared type (like int, double, string). Value types hold data directly on the stack, while reference types store memory addresses pointing to objects allocated on the heap.',
    aiExplanation: 'Imagine computer memory is a shelf of postboxes. Declaring a variable is like renting a box, labeling it (like "age"), and specifying what size/shape of items can go inside (integers, text). When you change the value, you are simply replacing the object inside that box!',
    useCases: 'Storing user input settings, calculating arithmetic totals, and converting database record string attributes into working numeric types.',
    simulatorType: 'memory',
    quiz: {
      q: 'Which memory segment allocates value types (like int and struct) in C#?',
      options: ['Heap memory', 'Stack memory', 'Global register', 'Disk virtual buffer'],
      correct: 'Stack memory',
      explanation: 'Value types are stored directly on the stack because their size is fixed and known at compile time, leading to extremely fast access.'
    }
  },
  {
    id: 'control-flow',
    label: 'Control Flow',
    desc: 'Master conditional if/else blocks, switch expressions, and iteration constructs like for, while, and foreach.',
    accent: '#10B981',
    type: 'Logical Branching',
    index: 2,
    topics: ['If Else', 'Switch', 'For Loop', 'While Loop', 'Do While', 'Foreach'],
    theory: 'Control flow structures direct the execution path of C# code. Decision blocks evaluate boolean expressions to branch runtimes, while loops execute code blocks repeatedly while a condition remains true. C# switch expressions (C# 8+) offer a streamlined declarative syntax returning direct values.',
    aiExplanation: 'Think of control flow like driving using a GPS map. An "if" block is a crossroads where you go left or right depending on a traffic light. A "loop" is like going around a roundabout until you find your exit number!',
    useCases: 'Validating form submissions before processing payments, and iterating arrays to calculate statistics.',
    simulatorType: 'loops',
    quiz: {
      q: 'Which loop is guaranteed to run its execution block at least once?',
      options: ['for loop', 'while loop', 'do-while loop', 'foreach loop'],
      correct: 'do-while loop',
      explanation: 'A do-while loop evaluates its termination condition at the end of the block, ensuring the body executes at least once.'
    }
  },
  {
    id: 'oop',
    label: 'OOP Concepts',
    desc: 'Classes, Objects, Encapsulation, inheritance structures, polymorphism methods, abstraction, and interfaces.',
    accent: '#8B5CF6',
    type: 'Object Orientation',
    index: 3,
    topics: ['Classes', 'Objects', 'Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction', 'Interfaces'],
    theory: 'Object-Oriented Programming (OOP) models software around real-world objects. Classes act as blueprints. Encapsulation hides state behind public APIs. Inheritance promotes code reuse. Polymorphism allows dynamic runtime method dispatching.',
    aiExplanation: 'If a cookie cutter is a class, the cookies are objects. Encapsulation is the chocolate coating hiding the dough. Inheritance is using the shape to bake cookies with new flavors. Polymorphism is taking a bite and enjoying different flavors depending on the cookie type!',
    useCases: 'Designing enterprise business models, structuring repository access classes, and building decoupled UI rendering components.',
    simulatorType: 'oop-concepts',
    quiz: {
      q: 'Which keyword is used to inheritance-extend a base class or implement an interface in C#?',
      options: ['extends', 'implements', 'colon (:)', 'using'],
      correct: 'colon (:)',
      explanation: 'C# uses a single colon (:) for both extending a base class and implementing interfaces.'
    }
  },
  {
    id: 'collections',
    label: 'Collections & Generics',
    desc: 'Manage type-safe lists, dictionaries, queues, stacks, hashsets, and customize generic classes.',
    accent: '#EC4899',
    type: 'Data Management',
    index: 4,
    topics: ['List', 'Dictionary', 'Queue', 'Stack', 'HashSet', 'Generics'],
    theory: 'Collections organize and store sets of data. Generic collections (System.Collections.Generic) guarantee type safety and prevent performance penalties from runtime boxing/unboxing operations. Dictionaries offer O(1) key lookups via hashing.',
    aiExplanation: 'Collections are like storage cabinets. A list is a row of folders where you add items at the end. A dictionary is a roll of labeled keys that open specific drawers instantly. Generics let you buy a drawer unit and specify that it should hold only shoes or only shirts!',
    useCases: 'Caching in-memory lookup maps, maintaining sequential message queues, and defining type-safe repositories.',
    simulatorType: 'collections-sim',
    quiz: {
      q: 'Which collection provides first-in, first-out (FIFO) access behaviors?',
      options: ['List<T>', 'Stack<T>', 'Queue<T>', 'HashSet<T>'],
      correct: 'Queue<T>',
      explanation: 'Queue<T> processes elements in First-In-First-Out order via Enqueue and Dequeue operations.'
    }
  },
  {
    id: 'exceptions',
    label: 'Exception Handling',
    desc: 'Deploy try/catch/finally code blocks, throw custom business errors, and recover applications safely.',
    accent: '#EF4444',
    type: 'System Reliability',
    index: 5,
    topics: ['Try', 'Catch', 'Finally', 'Throw', 'Custom Exceptions'],
    theory: 'Exception handling intercepts runtime anomalies. The try block contains error-prone code. Catch blocks intercept specific Exception types top-down. The finally block is guaranteed to execute, making it ideal for cleaning up database connections or system files.',
    aiExplanation: 'Imagine ordering pizza. The "try" is calling the shop. The "catch" is handling a scenario where they are out of pepperoni (you order cheese instead). The "finally" is paying the delivery person no matter what pizza they bring you!',
    useCases: 'Gracefully handling network connection timeouts, database failures, and validating inputs to prevent application crashes.',
    simulatorType: 'exceptions-sim',
    quiz: {
      q: 'Does a finally block execute if an exception is caught and handled inside a catch block?',
      options: ['Only if no return statement exists', 'No, it skips on success', 'Yes, it always executes', 'Only on network systems'],
      correct: 'Yes, it always executes',
      explanation: 'The finally block is guaranteed to run after exiting try/catch scopes, regardless of whether exceptions were raised or caught.'
    }
  },
  {
    id: 'file-handling',
    label: 'File Handling',
    desc: 'Read, write, and append disk files using File stream buffers, StreamReaders, and path classes.',
    accent: '#06B6D4',
    type: 'Disk Storage',
    index: 6,
    topics: ['File Class', 'Streams', 'Read Write Operations'],
    theory: 'System.IO enables access to storage systems. The static File class offers rapid text helper read/write utilities. Streams operate on raw byte arrays, preventing memory bottlenecks by buffering large files in sequential blocks.',
    aiExplanation: 'Reading a large file without streams is like trying to drink a whole swimming pool in one gulp. Using streams is like drinking water through a straw — taking small, manageable sips line-by-line!',
    useCases: 'Logging runtime application errors, loading CSV data files into entities, and exporting analytics reports to local folders.',
    simulatorType: 'file-sim',
    quiz: {
      q: 'Which block ensures file handles and StreamReaders are immediately disposed to prevent memory leaks?',
      options: ['using statement/block', 'finally catch statement', 'File.Delete()', 'lock block'],
      correct: 'using statement/block',
      explanation: 'The C# using statement compiles into a try/finally block that automatically calls Dispose() on the resource, releasing file locks.'
    }
  },
  {
    id: 'linq',
    label: 'LINQ Queries',
    desc: 'Query, transform, aggregate, and join in-memory data collections with declarative SQL-like syntax.',
    accent: '#F59E0B',
    type: 'Data Pipelines',
    index: 7,
    topics: ['Where', 'Select', 'GroupBy', 'OrderBy', 'Joins'],
    theory: 'Language Integrated Query (LINQ) brings data querying directly into C#. Using lambda expressions, LINQ operators run lazily (deferred execution), executing only when collections are iterated (e.g. via Tolist() or foreach).',
    aiExplanation: 'Imagine standing in front of a conveyor belt of fruits. LINQ is a series of assistants: Assistant 1 filters out bad apples (Where). Assistant 2 peels them (Select). Assistant 3 packs them in baskets (GroupBy). Nothing happens until you pick up a basket to eat (deferred execution)!',
    useCases: 'Filtering student records based on search keywords, grouping transaction totals by category, and sorting products by price.',
    simulatorType: 'linq-sim',
    quiz: {
      q: 'What is deferred execution in LINQ?',
      options: ['Queries run immediately on declaration', 'Queries run only when the result is enumerated', 'Compiler compiles queries to C++ speed', 'Queries execute in separate threads'],
      correct: 'Queries run only when the result is enumerated',
      explanation: 'Deferred execution means a LINQ query is not executed when created, but rather when the query results are actually iterated.'
    }
  },
  {
    id: 'delegates',
    label: 'Delegates & Events',
    desc: 'Define delegates, trigger events, configure callbacks, and write clean inline lambda expressions.',
    accent: '#8B5CF6',
    type: 'Event-Driven Code',
    index: 8,
    topics: ['Delegates', 'Events', 'Lambda Expressions'],
    theory: 'Delegates are type-safe function pointers that store references to methods with specific signatures. Events are wrappers around multicast delegates that allow classes to notify other classes when actions occur, promoting decoupled publisher-subscriber patterns.',
    aiExplanation: 'Imagine subscribing to a magazine. The magazine company is the publisher (Event). You are the subscriber (Subscriber method). The mail carrier delivering the copy to your address is the delegate (Function pointer)!',
    useCases: 'Handling button clicks in UI frameworks, raising telemetry events, and structuring decoupled pipeline architectures.',
    simulatorType: 'delegates-sim',
    quiz: {
      q: 'Which standard delegate represents a method that takes parameters and returns a value?',
      options: ['Action<T>', 'Func<T, TResult>', 'Predicate<T>', 'EventHandler'],
      correct: 'Func<T, TResult>',
      explanation: 'Func represents a delegate that returns a value. Action is used for void methods, and Predicate returns a boolean.'
    }
  },
  {
    id: 'async',
    label: 'Async Programming',
    desc: 'Write non-blocking asynchronous code using async/await, Task Parallel Library (TPL), and concurrency threads.',
    accent: '#EC4899',
    type: 'Concurrency',
    index: 9,
    topics: ['Async', 'Await', 'Tasks', 'Multithreading'],
    theory: 'Asynchronous programming avoids thread starvation. The await keyword yields execution back to the caller while a task completes in the background. Once the task finishes, the runtime resumes execution on the captured thread context.',
    aiExplanation: 'Imagine boiling pasta and making sauce. A synchronous cook boils water and stands still watching it for 10 minutes (blocking). An asynchronous cook turns on the stove (Task), starts chopping onions (Non-blocking), and returns to the pasta when the timer beeps!',
    useCases: 'Fetching remote HTTP API payloads, writing large database transactions without locking desktops, and running image processing concurrently.',
    simulatorType: 'async-sim',
    quiz: {
      q: 'What does the await keyword do when a thread encounters it during execution?',
      options: ['It blocks the thread completely', 'It releases the thread to execute other work', 'It restarts the computer', 'It translates code to assembly'],
      correct: 'It releases the thread to execute other work',
      explanation: 'Await returns control to the thread pool, allowing the thread to perform other tasks while the awaited operation completes.'
    }
  },
  {
    id: 'ado-net',
    label: 'ADO.NET Database Access',
    desc: 'Establish database connections, build SqlCommands, prevent SQL injection, and read result streams.',
    accent: '#3B82F6',
    type: 'Relational Access',
    index: 10,
    topics: ['SqlConnection', 'SqlCommand', 'DataReader', 'DataAdapter'],
    theory: 'ADO.NET is the fundamental database access layer in .NET. It uses SqlConnections to bind endpoints, SqlCommands to dispatch SQL queries, and SqlDataReaders to stream cursors forward-only with high efficiency.',
    aiExplanation: 'Think of ADO.NET like a train line. SqlConnection is the rail tracks. SqlCommand is the train car carrying cargo (SQL queries). SqlDataReader is the offloading crew taking items off the train one-by-one!',
    useCases: 'Direct database querying, migrating old systems, and processing raw tabular reports directly from SQL servers.',
    simulatorType: 'ado-sim',
    quiz: {
      q: 'Which ADO.NET object provides high-speed, read-only, forward-only access to query results?',
      options: ['SqlDataAdapter', 'DataSet', 'SqlDataReader', 'SqlConnection'],
      correct: 'SqlDataReader',
      explanation: 'SqlDataReader reads database streams sequentially with minimal memory overhead, making it incredibly fast.'
    }
  },
  {
    id: 'ef-core',
    label: 'Entity Framework Core',
    desc: 'Map database schemas using ORMs, write DbContext models, declare DbSets, and run migration scripts.',
    accent: '#10B981',
    type: 'Object-Relational Mapping',
    index: 11,
    topics: ['ORM', 'DbContext', 'DbSet', 'Relationships', 'Migrations'],
    theory: 'EF Core is a lightweight, extensible ORM that simplifies SQL operations. Instead of writing queries, developers query DbSets using LINQ. EF Core translates LINQ nodes to optimized SQL dialect queries at runtime.',
    aiExplanation: 'EF Core is a translator. Your C# code speaks French (Objects), and SQL database speaks Chinese (Tables). DbContext acts as the translator translating "Add Student" to "INSERT INTO Students" automatically!',
    useCases: 'Speedy backend development, structuring persistent application data models, and automating database migrations.',
    simulatorType: 'ef-sim',
    quiz: {
      q: 'Which class holds database sessions and manages entity state mappings in EF Core?',
      options: ['DbSet', 'DbContext', 'ModelBuilder', 'MigrationBuilder'],
      correct: 'DbContext',
      explanation: 'DbContext represents a database session, allowing query execution and saving entities using SaveChanges().'
    }
  },
  {
    id: 'aspnet-mvc',
    label: 'ASP.NET Core MVC',
    desc: 'Structure web applications with MVC architectures, configure Controllers, route requests, and render views.',
    accent: '#8B5CF6',
    type: 'Web Framework',
    index: 12,
    topics: ['MVC Architecture', 'Controllers', 'Models', 'Views', 'Routing'],
    theory: 'ASP.NET Core MVC separates concerns: Models map states, Views render UI pages, and Controllers intercept incoming route requests to fetch models and dispatch matching page views.',
    aiExplanation: 'MVC is like a restaurant. The View is the menu you look at. The Controller is the waiter taking your order. The Model is the chef in the kitchen preparing the food (data)!',
    useCases: 'Building enterprise portal web applications, rendering dynamic customer panels, and configuring custom middlewares.',
    simulatorType: 'mvc-sim',
    quiz: {
      q: 'What is the role of a Controller in MVC architectures?',
      options: ['Hold database connection strings', 'Handle user inputs and return action results', 'Style HTML layouts', 'Cache static assets'],
      correct: 'Handle user inputs and return action results',
      explanation: 'Controllers intercept incoming HTTP requests, coordinate domain data processing, and return ActionResults (like Views or JSON).'
    }
  },
  {
    id: 'web-api',
    label: 'ASP.NET Core Web APIs',
    desc: 'Develop RESTful APIs, configure GET/POST controllers, bind parameters, and test with Swagger UI.',
    accent: '#06B6D4',
    type: 'API Services',
    index: 13,
    topics: ['REST APIs', 'GET', 'POST', 'PUT', 'DELETE', 'Swagger'],
    theory: 'Web APIs expose business logic over standard HTTP. Controllers use attributes like [HttpGet] and [HttpPost] to route requests and return serialized JSON payloads to client frameworks.',
    aiExplanation: 'Think of a web API like a power outlet. Instead of generating electricity yourself, you plug in your phone cord (HTTP request) to extract power (JSON data) in a standard format!',
    useCases: 'Powering React/Angular frontend dashboards, building backend systems for mobile applications, and structuring microservices.',
    simulatorType: 'api-sim',
    quiz: {
      q: 'Which HTTP method should be used to create a new resource on the server?',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      correct: 'POST',
      explanation: 'POST is designed to create new resources, while PUT is used to update existing resources, and GET retrieves them.'
    }
  },
  {
    id: 'auth',
    label: 'Security & Auth',
    desc: 'Implement ASP.NET Identity, sign tokens with JWT, assign roles, and enforce protected route policies.',
    accent: '#EF4444',
    type: 'Access Control',
    index: 14,
    topics: ['Identity Framework', 'JWT', 'Roles', 'Claims'],
    theory: 'Authentication verifies user identities. Authorization checks access permissions. JSON Web Tokens (JWT) store cryptographically signed claims (e.g. user ID, role), letting clients access protected endpoints stateless-ly.',
    aiExplanation: 'Authentication is showing your ID badge at the office door. Authorization is checking if your badge has permission to enter the server room (Role), or just the lunchroom!',
    useCases: 'Locking down customer invoice pages, generating temporary API keys, and managing user profiles with Identity tables.',
    simulatorType: 'auth-sim',
    quiz: {
      q: 'What does the signature part of a JWT protect against?',
      options: ['Data encryption speed leaks', 'Payload tampering and editing', 'Password theft', 'SQL database injection'],
      correct: 'Payload tampering and editing',
      explanation: 'The JWT signature is created using a server secret. If a client tampers with the token claims, the signature verification fails.'
    }
  },
  {
    id: 'blazor',
    label: 'Blazor UI Development',
    desc: 'Build web user interfaces using C# instead of JavaScript, create components, and bind states.',
    accent: '#F59E0B',
    type: 'Frontend C#',
    index: 15,
    topics: ['Components', 'Routing', 'State Management'],
    theory: 'Blazor is Microsofts frontend framework. Blazor WebAssembly runs compiled C# code directly in browser runtimes using WebAssembly (Wasm). Blazor Server runs logic on the server, dispatching UI updates over SignalR.',
    aiExplanation: 'Blazor is like coding a website using C# instead of JavaScript! You write components with HTML markup and C# event methods combined in one file (.razor), and the browser executes it smoothly!',
    useCases: 'C#-only full-stack developer applications, building responsive admin panels, and reducing JavaScript dependencies.',
    simulatorType: 'blazor-sim',
    quiz: {
      q: 'Which Blazor mode executes C# bytecode directly in the client browser utilizing Wasm runtimes?',
      options: ['Blazor Server', 'Blazor WebAssembly', 'Blazor Hybrid', 'Blazor Razor Pages'],
      correct: 'Blazor WebAssembly',
      explanation: 'Blazor WebAssembly compiles C# code to WebAssembly bytecode that runs natively inside browser sandboxes.'
    }
  },
  {
    id: 'azure',
    label: 'Azure & Cloud Services',
    desc: 'Deploy web apps to App Services, set up Azure SQL databases, and configure cloud file storages.',
    accent: '#3B82F6',
    type: 'Cloud Deployment',
    index: 16,
    topics: ['Azure App Services', 'Azure SQL', 'Storage', 'Deployment'],
    theory: 'Azure is Microsofts cloud ecosystem. App Services provide scalable web hosting. Azure SQL supplies managed database runtimes, and Azure Blob Storage handles structured cloud document file buffers.',
    aiExplanation: 'Instead of buying a server computer, setting it up in your closet, and paying for electricity, you rent virtual slots inside Microsofts massive datacenters (the Cloud) and run your C# apps there instantly!',
    useCases: 'Scaling web backends to handle million-user peaks, hosting corporate databases safely, and deploying global microservices.',
    simulatorType: 'azure-sim',
    quiz: {
      q: 'Which Azure service offers managed serverless hosting for hosting standard C# web apps?',
      options: ['Azure SQL', 'Azure Blob Storage', 'Azure App Services', 'Azure Active Directory'],
      correct: 'Azure App Services',
      explanation: 'Azure App Services provides managed serverless PaaS hosting for ASP.NET Core web applications.'
    }
  }
];

// ═══════════════════════════════════════════════════════════
// MAIN INTERACTIVE C# LAB
// ═══════════════════════════════════════════════════════════
export default function CSharpLab() {
  const [activePanel, setActivePanel] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [xp, setXp] = useState(() => Number(localStorage.getItem('csharp_xp') || 0));
  const [completedCount, setCompletedCount] = useState(() => Number(localStorage.getItem('csharp_completed') || 2));
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizScores, setQuizScores] = useState({});
  const [compilerCode, setCompilerCode] = useState(`using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, EduVerse C#!");\n    }\n}`);
  const [compilerOutput, setCompilerOutput] = useState('Click "Run Code" to compile C# compiler...');
  const [aiReviewOutput, setAiReviewOutput] = useState('');

  // Simulator Variable States
  const [fundamentalsVal, setFundamentalsVal] = useState('20');
  const [loopStep, setLoopStep] = useState(0);
  const [oopClassName, setOopClassName] = useState('Student');
  const [collectionsItems, setCollectionsItems] = useState(['10', '20']);
  const [collectionsAction, setCollectionsAction] = useState('stack');
  const [exceptionState, setExceptionState] = useState('Normal');
  const [virtualFiles, setVirtualFiles] = useState({ 'log.txt': 'App started.' });
  const [activeFile, setActiveFile] = useState('log.txt');
  const [linqFilter, setLinqFilter] = useState('All');
  const [delegatesLogs, setDelegatesLogs] = useState([]);
  const [asyncTasks, setAsyncTasks] = useState([
    { id: 1, name: 'Fetch Data', status: 'Idle', progress: 0 },
    { id: 2, name: 'Process DB', status: 'Idle', progress: 0 }
  ]);
  const [adoStatus, setAdoStatus] = useState('Closed');
  const [efEntities, setEfEntities] = useState([{ name: 'Student', table: 'students' }]);
  const [mvcStep, setMvcStep] = useState('Request');
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiLogs, setApiLogs] = useState([]);
  const [jwtToken, setJwtToken] = useState('');
  const [blazorState, setBlazorState] = useState('Idle');
  const [azureStatus, setAzureStatus] = useState('Healthy');

  // Local storage trackers
  const updateXP = (amount) => {
    const nextXp = xp + amount;
    setXp(nextXp);
    localStorage.setItem('csharp_xp', nextXp.toString());
  };

  const handleMarkComplete = (index) => {
    if (completedCount < index) {
      setCompletedCount(index);
      localStorage.setItem('csharp_completed', index.toString());
      updateXP(150);
      toast.success(`Module Completed! +150 XP`);
    } else {
      toast.success('Module reviewed.');
    }
  };

  const handleCompilerRun = () => {
    setCompilerOutput('Compiling App.cs utilizing Roslyn compiler...\nLinking references...\n\n[STDOUT]\nHello, EduVerse C#!\n\nProcess finished with exit code 0.');
    updateXP(50);
  };

  const handleCompilerAi = (mode) => {
    if (mode === 'debug') {
      setAiReviewOutput('AI Debugger: No syntax compilation errors detected. The Roslyn compiler confirms a valid Main entry point.');
    } else if (mode === 'review') {
      setAiReviewOutput('AI Review: 10/10. The code adheres to .NET 8 Top-Level statement guidelines and utilizes clean static methods.');
    } else {
      setAiReviewOutput('AI Optimization: Replacing Console output stream with a StringBuilder can optimize high-throughput CLI benchmarks.');
    }
    updateXP(30);
  };

  return (
    <div className="csharp-lab max-w-[1440px] mx-auto p-4 sm:p-8 space-y-6 font-sans text-left min-h-screen">
      {activePanel === 'dashboard' ? (
        <div className="space-y-6">
          
          {/* HEADER BAR */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-white/10">
            <div>
              <h1 className="text-3xl font-extrabold text-white">C# Developer Track</h1>
              <p className="text-xs text-slate-400 mt-1">Microsoft .NET Core Enterprise Systems & Cloud Architectures</p>
            </div>
            {completedCount >= 12 && (
              <div className="p-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl flex items-center gap-2">
                <span className="text-[10px] text-slate-300">Syllabus complete! Claim Certificate</span>
                <button 
                  onClick={() => {
                    toast.success('Certificate verified and issued!');
                    setActivePanel('certification');
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  Claim Certificate
                </button>
              </div>
            )}
          </div>

          {/* OVERVIEW STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="csharp-stats-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <strong className="text-2xl font-black text-white">{xp} XP</strong>
                <span className="text-[10px] text-slate-500 block uppercase font-bold mt-0.5">Total XP Earned</span>
              </div>
            </div>

            <div className="csharp-stats-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Flame size={20} fill="currentColor" />
              </div>
              <div>
                <strong className="text-2xl font-black text-white">3 Days</strong>
                <span className="text-[10px] text-slate-500 block uppercase font-bold mt-0.5">Learning Streak</span>
              </div>
            </div>

            <div className="csharp-stats-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Trophy size={20} />
              </div>
              <div>
                <strong className="text-2xl font-black text-white">{completedCount} / 16</strong>
                <span className="text-[10px] text-slate-500 block uppercase font-bold mt-0.5">Modules Done</span>
              </div>
            </div>

            <div className="csharp-stats-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <Award size={20} />
              </div>
              <div>
                <strong className="text-2xl font-black text-white">{Math.round((completedCount / 16) * 100)}%</strong>
                <span className="text-[10px] text-slate-500 block uppercase font-bold mt-0.5">Course Progress</span>
              </div>
            </div>
          </div>

          {/* ROADMAP ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => {
                const nextMod = CSHARP_MODULES.find(m => m.index === completedCount + 1) || CSHARP_MODULES[0];
                setActivePanel(nextMod.id);
                toast.success(`Resuming module: ${nextMod.label}`);
              }}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
            >
              ▶ Continue Learning
            </button>
            <button 
              onClick={() => {
                toast.success('Visual roadmap loaded at the bottom of the page.');
              }}
              className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              📚 View Roadmap
            </button>
            <button 
              onClick={() => setActivePanel('mentor')}
              className="px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              🧠 Ask AI Mentor
            </button>
          </div>

          {/* SEARCH AND DESCRIPTIONS CONTROL */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-white/5">
            <p className="text-xs text-slate-400 leading-relaxed text-left">
              Choose a module to begin. Visualize concepts, run code, and simulate execution step-by-step.
            </p>
            <div className="relative min-w-[280px]">
              <input 
                type="text" 
                placeholder="Search C# modules..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* CURRICULUM GRID */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left mb-4">Course Curriculum Modules</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CSHARP_MODULES.filter(m => 
                m.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                m.desc.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((mod) => {
                const percent = completedCount >= mod.index ? 100 : (completedCount + 1 === mod.index ? 33 : 0);
                const status = completedCount >= mod.index ? 'COMPLETED' : (completedCount + 1 === mod.index ? 'ACTIVE' : 'LOCKED');
                const badgeClass = status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : (status === 'ACTIVE' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20');
                
                return (
                  <div 
                    key={mod.id}
                    onClick={() => setActivePanel(mod.id)}
                    className="csharp-glass-card p-6 flex flex-col justify-between cursor-pointer text-left hover:scale-[1.02] group relative overflow-hidden"
                    style={{ '--card-glow-color': mod.accent }}
                  >
                    <div className="flex justify-between items-center w-full mb-6">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: `${mod.accent}12`, color: mod.accent }}
                      >
                        <Code size={20} />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle className="text-white/10" strokeWidth="3" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                            <circle 
                              style={{ stroke: mod.accent }}
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

                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                        {mod.label}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {mod.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-3 border-t border-white/5 text-[10px] text-slate-500 font-bold uppercase">
                      <span>{mod.type}</span>
                      <span className="text-slate-300 group-hover:text-purple-400 transition-colors">Launch Module →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FEATURED TOOLS GRID */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left mb-4 mt-8">Interactive Coding Tools & Labs</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'coding-lab', label: 'JVM / Roslyn Coding Lab', desc: 'Online dynamic Roslyn compiler workspace sandbox with AI analysis, reviews, and optimizer diagnostics.', icon: PlayCircle, accent: '#38BDF8', tag: 'Compiler Console' },
                { id: 'practice', label: 'Evaluation Practice Hub', desc: 'Study multiple-choice questions, debugging errors, mock tests, and top interview questions.', icon: Sparkles, accent: '#EC4899', tag: 'Quiz Area' },
                { id: 'projects', label: 'Enterprise Portfolios Projects', desc: 'Start or review SMS registries, Banking backends, Hospital schedulers, and E-commerce channels.', icon: FolderOpen, accent: '#A855F7', tag: 'Project Center' },
                { id: 'mentor', label: 'Generative AI Mentor Coach', desc: 'Ask custom AI mentor engines for simple ELI10 summaries, personalized study guides, and notes.', icon: BrainCircuit, accent: '#F59E0B', tag: 'AI Assistant' },
                { id: 'analytics', label: 'Study Analytics Dashboard', desc: 'Track study durations, weekly metrics, accuracy rates, and domain mastery values.', icon: TrendingUp, accent: '#10B981', tag: 'Progress Reports' },
                { id: 'certification', label: 'Professional Certificate Center', desc: 'Claim and export secure PDF graduation credentials once criteria thresholds are met.', icon: Award, accent: '#EF4444', tag: 'Credentials' }
              ].map((tool) => {
                const ToolIcon = tool.icon || Code;
                return (
                  <div 
                    key={tool.id}
                    onClick={() => setActivePanel(tool.id)}
                    className="csharp-glass-card p-6 flex flex-col justify-between cursor-pointer text-left hover:scale-[1.02] group relative overflow-hidden"
                    style={{ '--card-glow-color': tool.accent }}
                  >
                    <div className="flex justify-between items-center w-full mb-6">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: `${tool.accent}12`, color: tool.accent }}
                      >
                        <ToolIcon size={20} />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {tool.tag}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                        {tool.label}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {tool.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-3 border-t border-white/5 text-[10px] text-slate-500 font-bold uppercase">
                      <span>Interactive Tool</span>
                      <span className="text-slate-300 group-hover:text-purple-400 transition-colors">Launch Tool →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* WORKSPACE HEADER */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActivePanel('dashboard')}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                ← Back to Dashboard
              </button>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">C# Visual Learning Ecosystem</span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">Workspace Lab</h2>
              </div>
            </div>
          </div>

          {/* WORKSPACE CONTENT */}
          <div className="w-full">
            {activePanel === 'fundamentals' ? (
              <CSharpFundamentalsDetail 
                setSelectedModule={setActivePanel} 
                completedCount={completedCount}
                handleMarkComplete={handleMarkComplete}
                updateXP={updateXP}
                xp={xp}
              />
            ) : activePanel === 'control-flow' ? (
              <CSharpControlFlowDetail 
                setSelectedModule={setActivePanel} 
                completedCount={completedCount}
                handleMarkComplete={handleMarkComplete}
                updateXP={updateXP}
                xp={xp}
              />
            ) : activePanel === 'oop' ? (
              <CSharpOOPDetail 
                setSelectedModule={setActivePanel} 
                completedCount={completedCount}
                handleMarkComplete={handleMarkComplete}
                updateXP={updateXP}
                xp={xp}
              />
            ) : CSHARP_MODULES.filter(m => m.id === activePanel).map((mod) => {
              const hasAnswered = selectedAnswers[mod.id] !== undefined;
              const isCorrect = selectedAnswers[mod.id] === mod.quiz.correct;

              return (
                <div key={mod.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Theory & Evaluation (60% width) */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Introduction & Theory */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                      <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-bold">
                        {mod.type}
                      </span>
                      <h3 className="text-2xl font-black text-white">{mod.label}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed text-left">{mod.theory}</p>
                      
                      <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left">
                        <span className="text-xs font-bold text-purple-400 block">💡 AI ELI10 ("Explain Like I'm 10") Summary</span>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{mod.aiExplanation}</p>
                      </div>

                      <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left">
                        <span className="text-xs font-bold text-emerald-400 block">🌍 Real-World Industry Application</span>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{mod.useCases}</p>
                      </div>
                    </div>

                    {/* Interactive Quiz & Practice questions */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block text-left">Evaluation Corner</span>
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-3">
                        <span className="text-xs font-bold text-white block">Topic Assessment: {mod.quiz.q}</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {mod.quiz.options.map((opt) => {
                            const isSelected = selectedAnswers[mod.id] === opt;
                            return (
                              <button
                                key={opt}
                                disabled={hasAnswered}
                                onClick={() => {
                                  setSelectedAnswers({ ...selectedAnswers, [mod.id]: opt });
                                  if (opt === mod.quiz.correct) {
                                    setQuizScores({ ...quizScores, [mod.id]: 100 });
                                    updateXP(100);
                                    toast.success('Correct! +100 XP');
                                  } else {
                                    setQuizScores({ ...quizScores, [mod.id]: 0 });
                                    toast.error('Incorrect. Review theory.');
                                  }
                                }}
                                className={`w-full text-left p-3.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                                  isSelected 
                                    ? (opt === mod.quiz.correct ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-red-500/10 border-red-500 text-red-400')
                                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {hasAnswered && (
                          <div className="mt-3 p-3 bg-white/5 rounded-xl text-[11px] text-slate-400 leading-relaxed">
                            <strong className="text-slate-300 block mb-1">
                              {isCorrect ? '✓ Correct Answer' : '✗ Incorrect'}
                            </strong>
                            {mod.quiz.explanation}
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => handleMarkComplete(mod.index)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl cursor-pointer transition"
                      >
                        Mark Module Complete
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Visual Simulator / Animation Workspace (40% width) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="p-6 bg-slate-900 border border-white/10 rounded-3xl space-y-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block text-left">Interactive Simulator & Animation</span>
                      
                      {/* Visual Component Render */}
                      <div className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 min-h-[220px] flex items-center justify-center overflow-hidden">
                        {mod.simulatorType === 'memory' && (
                          <div className="space-y-4 w-full">
                            <h5 className="text-xs font-bold text-slate-400">Stack Memory Allocation</h5>
                            <div className="flex gap-4 items-center justify-center">
                              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center w-28">
                                <span className="text-[10px] text-slate-500 block">Identifier</span>
                                <strong className="text-xs text-white">age</strong>
                              </div>
                              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-center w-28">
                                <span className="text-[10px] text-slate-500 block">Value</span>
                                <strong className="text-xs text-white">{fundamentalsVal}</strong>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-slate-500 block">Modify Value (int age)</label>
                              <input 
                                type="number" 
                                value={fundamentalsVal}
                                onChange={(e) => setFundamentalsVal(e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-850 border border-white/10 rounded-xl text-xs text-white outline-none"
                              />
                            </div>
                          </div>
                        )}

                        {mod.simulatorType === 'loops' && (
                          <div className="space-y-4 w-full">
                            <h5 className="text-xs font-bold text-slate-400">Loop Iteration Simulator</h5>
                            <div className="flex gap-2 justify-center">
                              {[0, 1, 2, 3, 4].map((step) => (
                                <div 
                                  key={step}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                                    loopStep === step ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'
                                  }`}
                                >
                                  i={step}
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setLoopStep((loopStep + 1) % 5)}
                                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                              >
                                Step Next Iteration
                              </button>
                            </div>
                          </div>
                        )}

                        {mod.simulatorType === 'oop-concepts' && (
                          <div className="space-y-4 w-full">
                            <h5 className="text-xs font-bold text-slate-400">Blueprint Object Instance Creator</h5>
                            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-center">
                              <span className="text-[10px] text-slate-500 block">class Blueprint</span>
                              <strong className="text-xs text-white">{oopClassName}</strong>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-slate-500 block">Change Class Name</label>
                              <input 
                                type="text" 
                                value={oopClassName}
                                onChange={(e) => setOopClassName(e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-850 border border-white/10 rounded-xl text-xs text-white outline-none"
                              />
                            </div>
                          </div>
                        )}

                        {mod.simulatorType === 'collections-sim' && (
                          <div className="space-y-4 w-full">
                            <h5 className="text-xs font-bold text-slate-400">Collection Data Structure ({collectionsAction})</h5>
                            <div className="flex gap-2 justify-center py-2">
                              {collectionsItems.map((item, i) => (
                                <div key={i} className="px-3 py-1.5 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-xl text-xs font-bold">
                                  {item}
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setCollectionsItems([...collectionsItems, Math.floor(Math.random() * 90 + 10).toString()])}
                                className="w-full py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                              >
                                Push / Add
                              </button>
                              <button 
                                onClick={() => setCollectionsItems(collectionsItems.slice(0, -1))}
                                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                              >
                                Pop / Remove
                              </button>
                            </div>
                          </div>
                        )}

                        {mod.simulatorType === 'exceptions-sim' && (
                          <div className="space-y-4 w-full">
                            <h5 className="text-xs font-bold text-slate-400">Program Flow Catch Recovery</h5>
                            <div className={`p-4 rounded-xl text-center font-bold text-xs ${
                              exceptionState === 'Normal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}>
                              System State: {exceptionState}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setExceptionState(exceptionState === 'Normal' ? 'Exception Caught!' : 'Normal')}
                                className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                              >
                                Toggle Exception State
                              </button>
                            </div>
                          </div>
                        )}

                        {mod.simulatorType === 'file-sim' && (
                          <div className="space-y-4 w-full">
                            <h5 className="text-xs font-bold text-slate-400">Virtual File System Explorer</h5>
                            <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-left space-y-1">
                              {Object.entries(virtualFiles).map(([name, data]) => (
                                <div 
                                  key={name} 
                                  onClick={() => setActiveFile(name)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                                    activeFile === name ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400'
                                  }`}
                                >
                                  📄 {name}
                                </div>
                              ))}
                            </div>
                            <button 
                              onClick={() => {
                                const newName = `notes_${Object.keys(virtualFiles).length + 1}.txt`;
                                setVirtualFiles({ ...virtualFiles, [newName]: 'New text file stream.' });
                                setActiveFile(newName);
                                toast.success('File created successfully.');
                              }}
                              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Create new file stream
                            </button>
                          </div>
                        )}

                        {mod.simulatorType === 'linq-sim' && (
                          <div className="space-y-4 w-full">
                            <h5 className="text-xs font-bold text-slate-400">LINQ Query Pipeline</h5>
                            <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-xs space-y-1">
                              <div><strong>Source:</strong> [10, 25, 45, 60, 80, 95]</div>
                              <div><strong>Query:</strong> numbers.Where(n =&gt; n &gt; 50)</div>
                              <div><strong>Result:</strong> [60, 80, 95]</div>
                            </div>
                            <button 
                              onClick={() => toast.success('LINQ filter evaluated.')}
                              className="w-full py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Run LINQ Filter
                            </button>
                          </div>
                        )}

                        {mod.simulatorType === 'delegates-sim' && (
                          <div className="space-y-4 w-full">
                            <h5 className="text-xs font-bold text-slate-400">Button Click Delegate Callback</h5>
                            <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-left max-h-24 overflow-y-auto font-mono text-[9px] text-purple-400 space-y-1">
                              {delegatesLogs.length > 0 ? delegatesLogs.map((log, i) => (
                                <div key={i}>{log}</div>
                              )) : <div>Click below to trigger callback...</div>}
                            </div>
                            <button 
                              onClick={() => {
                                setDelegatesLogs([...delegatesLogs, `Delegate invoked on ${new Date().toLocaleTimeString()}`]);
                                toast.success('Delegate invoked');
                              }}
                              className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Trigger Delegate
                            </button>
                          </div>
                        )}

                        {mod.simulatorType === 'async-sim' && (
                          <div className="space-y-4 w-full">
                            <h5 className="text-xs font-bold text-slate-400">Task Timeline</h5>
                            <div className="p-3 bg-slate-900 border border-white/5 rounded-xl space-y-2 text-left">
                              {asyncTasks.map(t => (
                                <div key={t.id} className="text-xs">
                                  <div className="flex justify-between font-bold text-[10px]">
                                    <span>{t.name}</span>
                                    <span className="text-pink-400">{t.status}</span>
                                  </div>
                                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                                    <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${t.progress}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <button 
                              onClick={() => {
                                setAsyncTasks([
                                  { id: 1, name: 'Fetch Data', status: 'Completed', progress: 100 },
                                  { id: 2, name: 'Process DB', status: 'Completed', progress: 100 }
                                ]);
                                toast.success('All tasks completed asynchronously!');
                              }}
                              className="w-full py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Execute async Tasks
                            </button>
                          </div>
                        )}

                        {mod.simulatorType === 'ado-sim' && (
                          <div className="space-y-4 w-full text-left">
                            <h5 className="text-xs font-bold text-slate-400">SqlConnection Manager</h5>
                            <div className="flex justify-between items-center text-xs">
                              <span>Connection state:</span>
                              <strong className={adoStatus === 'Open' ? 'text-emerald-400' : 'text-slate-400'}>{adoStatus}</strong>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setAdoStatus('Open');
                                  toast.success('SqlConnection opened successfully.');
                                }}
                                className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                              >
                                conn.Open()
                              </button>
                              <button 
                                onClick={() => {
                                  setAdoStatus('Closed');
                                  toast.success('SqlConnection closed.');
                                }}
                                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                              >
                                conn.Close()
                              </button>
                            </div>
                          </div>
                        )}

                        {mod.simulatorType === 'ef-sim' && (
                          <div className="space-y-4 w-full">
                            <h5 className="text-xs font-bold text-slate-400">DbContext DbSet Mapper</h5>
                            <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-left space-y-1">
                              {efEntities.map((ent, i) => (
                                <div key={i} className="text-xs flex justify-between font-mono text-emerald-400">
                                  <span>public DbSet&lt;{ent.name}&gt; {ent.name}s</span>
                                  <span>→ table: {ent.table}</span>
                                </div>
                              ))}
                            </div>
                            <button 
                              onClick={() => {
                                setEfEntities([...efEntities, { name: 'Course', table: 'courses' }]);
                                toast.success('DbContext model schema migrated.');
                              }}
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Add DbSet Map
                            </button>
                          </div>
                        )}

                        {mod.simulatorType === 'mvc-sim' && (
                          <div className="space-y-4 w-full text-left">
                            <h5 className="text-xs font-bold text-slate-400">Request Lifecycle Visualizer</h5>
                            <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-xs text-center font-bold text-purple-400">
                              Active Stage: {mvcStep}
                            </div>
                            <div className="flex gap-2">
                              {['Request', 'Controller', 'Model', 'View'].map(s => (
                                <button 
                                  key={s}
                                  onClick={() => setMvcStep(s)}
                                  className={`flex-1 py-1 text-[10px] font-bold rounded ${
                                    mvcStep === s ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {mod.simulatorType === 'api-sim' && (
                          <div className="space-y-4 w-full text-left">
                            <h5 className="text-xs font-bold text-slate-400">Swagger API Client</h5>
                            <div className="flex gap-2">
                              <select 
                                value={apiMethod} 
                                onChange={(e) => setApiMethod(e.target.value)}
                                className="px-2 py-1 bg-slate-850 border border-white/10 rounded-lg text-xs text-white outline-none"
                              >
                                <option>GET</option>
                                <option>POST</option>
                                <option>DELETE</option>
                              </select>
                              <input 
                                type="text" 
                                placeholder="/api/v1/courses" 
                                className="flex-grow px-3 py-1 bg-slate-850 border border-white/10 rounded-lg text-xs text-white outline-none"
                              />
                            </div>
                            <button 
                              onClick={() => {
                                setApiLogs([...apiLogs, `[${apiMethod}] ${new Date().toLocaleTimeString()} -> Status 200 OK`]);
                                toast.success('API request finished');
                              }}
                              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Send API Request
                            </button>
                            <div className="p-2 bg-slate-900 rounded-lg font-mono text-[9px] text-cyan-400 max-h-16 overflow-y-auto">
                              {apiLogs.map((l, i) => <div key={i}>{l}</div>)}
                            </div>
                          </div>
                        )}

                        {mod.simulatorType === 'auth-sim' && (
                          <div className="space-y-4 w-full text-left">
                            <h5 className="text-xs font-bold text-slate-400">JWT Payload Token Generator</h5>
                            <button 
                              onClick={() => {
                                setJwtToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsInJvbGUiOiJBZG1pbiJ9');
                                toast.success('JWT Token Generated successfully!');
                              }}
                              className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Generate JWT Token
                            </button>
                            {jwtToken && (
                              <pre className="p-2 bg-slate-900 rounded-lg font-mono text-[9px] text-red-400 whitespace-pre-wrap break-all">
                                {jwtToken}
                              </pre>
                            )}
                          </div>
                        )}

                        {mod.simulatorType === 'blazor-sim' && (
                          <div className="space-y-4 w-full text-left">
                            <h5 className="text-xs font-bold text-slate-400">Blazor Component Lifecycle</h5>
                            <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-center text-xs font-bold text-yellow-400">
                              Active Lifecycle Stage: {blazorState}
                            </div>
                            <div className="flex gap-2">
                              {['OnInitialized', 'OnParametersSet', 'OnAfterRender'].map(st => (
                                <button 
                                  key={st}
                                  onClick={() => {
                                    setBlazorState(st);
                                    toast.success(`${st} fired.`);
                                  }}
                                  className="flex-grow py-1 bg-slate-800 hover:bg-slate-700 text-[9px] font-bold text-slate-300 rounded"
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {mod.simulatorType === 'azure-sim' && (
                          <div className="space-y-4 w-full text-left">
                            <h5 className="text-xs font-bold text-slate-400">Azure WebApp Infrastructure Status</h5>
                            <div className="flex justify-between items-center text-xs">
                              <span>Service health status:</span>
                              <strong className="text-emerald-400">{azureStatus}</strong>
                            </div>
                            <button 
                              onClick={() => {
                                setAzureStatus('Syncing nodes...');
                                setTimeout(() => {
                                  setAzureStatus('Healthy');
                                  toast.success('Azure SQL and App Services status synced successfully!');
                                }, 1000);
                              }}
                              className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Sync Azure Topology
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* SPECIAL TOOLS WORKSPACES */}
            {activePanel === 'coding-lab' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-[28px] space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Online Roslyn C# Compiler</span>
                    <textarea 
                      value={compilerCode}
                      onChange={(e) => setCompilerCode(e.target.value)}
                      rows={10}
                      className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-xs font-mono text-emerald-400 outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCompilerRun}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Run Code
                      </button>
                      <button 
                        onClick={() => handleCompilerAi('debug')}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        AI Debugger
                      </button>
                      <button 
                        onClick={() => handleCompilerAi('review')}
                        className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        AI Review
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 bg-slate-900 border border-white/10 rounded-[28px] space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Compiler Outputs</span>
                    <pre className="p-4 bg-slate-950 border border-white/5 rounded-2xl text-xs font-mono text-slate-300 whitespace-pre-wrap">
                      {compilerOutput}
                    </pre>
                    {aiReviewOutput && (
                      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                        <span className="text-xs font-bold text-purple-400 block">AI Analysis Result</span>
                        <p className="text-xs text-slate-300 mt-1">{aiReviewOutput}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activePanel === 'practice' && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-[28px] text-left space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Practice Hub Challenges</span>
                <p className="text-xs text-slate-400">Master C# logic through quiz bank challenges and mock questions.</p>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                  <strong className="text-sm text-white block">Q1: How do you register transient service dependencies in ASP.NET Core?</strong>
                  <p className="text-xs text-slate-400">A: builder.Services.AddTransient&lt;IService, Service&gt;();</p>
                  <button 
                    onClick={() => {
                      updateXP(20);
                      toast.success('Challenge completed successfully! +20 XP');
                    }}
                    className="mt-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg"
                  >
                    Submit Practice Answer
                  </button>
                </div>
              </div>
            )}

            {activePanel === 'projects' && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-[28px] text-left space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Enterprise Portfolio Projects</span>
                <p className="text-xs text-slate-400 font-medium">Develop corporate portals to enhance your resume strengths.</p>
                <div className="space-y-3">
                  {['Student Registry System', 'Banking Service API', 'Hospital Management Portal', 'E-Commerce Wasm Platform'].map((proj, idx) => (
                    <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                      <div>
                        <strong className="text-sm font-bold text-white block">{proj}</strong>
                        <span className="text-[10px] text-slate-400 mt-1">Difficulty: Intermediate • .NET 8 SDK</span>
                      </div>
                      <button 
                        onClick={() => {
                          updateXP(100);
                          toast.success(`Project initialized: ${proj}!`);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Start Project
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePanel === 'mentor' && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-[28px] text-left space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">AI Mentor Guidance</span>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-purple-400 block">Personalized Study Planner</span>
                  <p className="text-xs text-slate-300">"Your consistency scores are optimal. Prioritize completing Exception Handling and LINQ Queries to meet the intermediate certificate criteria."</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      updateXP(20);
                      toast.success('Study notes compiled and copied to clipboard.');
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl"
                  >
                    Generate AI Study Notes
                  </button>
                </div>
              </div>
            )}

            {activePanel === 'analytics' && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-[28px] text-left space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Learning Analytics</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Weekly Study Hours</span>
                    <strong className="text-xl text-white block mt-1">4.2 Hours</strong>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Coding Accuracy</span>
                    <strong className="text-xl text-white block mt-1">94%</strong>
                  </div>
                </div>
              </div>
            )}

            {activePanel === 'achievements' && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-[28px] text-left space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Unlocked Badges</span>
                <div className="grid grid-cols-2 gap-3">
                  {['C# Beginner', 'OOP Explorer', 'LINQ Master', 'ASP.NET Developer', 'Azure Explorer', 'C# Expert'].map((b, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                      <strong className="text-xs text-white">{b}</strong>
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[9px] font-bold rounded">Unlocked</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePanel === 'certification' && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-[28px] text-left space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Official Certificate Center</span>
                <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-slate-500 mx-auto text-xl">
                    🏆
                  </div>
                  <h4 className="text-sm font-bold text-white">Advanced C# Developer Credentials</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Upon completing the syllabus modules, your credential is issued securely.
                  </p>
                  <button 
                    onClick={() => toast.success('Certificate download initialized...')}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Download Certificate PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// C# FUNDAMENTALS COMPLETE INTERACTIVE DIGITAL CLASSROOM
// ═══════════════════════════════════════════════════════════
export function CSharpFundamentalsDetail({ setSelectedModule, completedCount, handleMarkComplete, updateXP, xp }) {
  const [activeTab, setActiveTab] = useState('theory');
  
  // Analytics Telemetry States
  const [completedTopics, setCompletedTopics] = useState(() => {
    const saved = localStorage.getItem('cs_fund_completed');
    return saved ? JSON.parse(saved) : {};
  });
  const [labCompilesCount, setLabCompilesCount] = useState(() => {
    return parseInt(localStorage.getItem('cs_fund_compiles') || '0', 10);
  });
  
  // Code Lab States
  const presets = {
    hello: {
      name: "Hello World",
      code: `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, EduVerse AI!");\n        Console.WriteLine("Welcome to C# Fundamentals.");\n    }\n}`
    },
    variables: {
      name: "Stack vs Heap (Value vs Reference)",
      code: `using System;\n\nclass Program {\n    static void Main() {\n        // Value types (Stack)\n        int x = 10;\n        int y = x;\n        y = 25;\n        Console.WriteLine($"Stack - x: {x}, y: {y}");\n\n        // Reference Type simulated\n        int[] array1 = new int[] { 1, 2, 3 };\n        int[] array2 = array1;\n        array2[0] = 99;\n        Console.WriteLine($"Heap - array1[0]: {array1[0]} (Changed via array2!)");\n    }\n}`
    },
    casting: {
      name: "Type Casting & Range Safety",
      code: `using System;\n\nclass Program {\n    static void Main() {\n        double salaryDouble = 85450.75;\n        // Explicit Casting (Potential loss of precision)\n        int salaryInt = (int)salaryDouble;\n        \n        Console.WriteLine("Double value: " + salaryDouble);\n        Console.WriteLine("Casted Int value: " + salaryInt);\n    }\n}`
    }
  };
  
  const [code, setCode] = useState(presets.hello.code);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [copilotMessage, setCopilotMessage] = useState('');
  const [copilotType, setCopilotType] = useState('info'); // info, debug, success
  
  // Visual Memory Model Walkthrough
  const [memoryStep, setMemoryStep] = useState(0);
  const memorySteps = [
    {
      title: "1. Empty Scope Initialized",
      desc: "The thread enters static void Main(). The JIT compiler sets up call stack frames.",
      stack: [],
      heap: []
    },
    {
      title: "2. Value Type Allocation (int age = 22)",
      desc: "Variable 'age' is allocated directly inside the stack frame. No heap space is used.",
      stack: [{ name: "age", val: "22 (int)", type: "value" }],
      heap: []
    },
    {
      title: "3. Reference Type Allocation (string name = \"Ali\")",
      desc: "Reference types allocate a reference pointer on the stack, which points to the actual string object residing on the garbage-collected heap.",
      stack: [
        { name: "age", val: "22 (int)", type: "value" },
        { name: "name", val: "0x7F4A (Reference)", type: "ref" }
      ],
      heap: [{ addr: "0x7F4A", val: "\"Ali\" (System.String)", type: "string" }]
    },
    {
      title: "4. Pointer Reassignment",
      desc: "If we create another variable pointing to name, only the stack address pointer is copied. Both variables now refer to the exact same heap memory object.",
      stack: [
        { name: "age", val: "22 (int)", type: "value" },
        { name: "name", val: "0x7F4A (Reference)", type: "ref" },
        { name: "alias", val: "0x7F4A (Reference)", type: "ref" }
      ],
      heap: [{ addr: "0x7F4A", val: "\"Ali\" (System.String)", type: "string" }]
    }
  ];

  // Visual JIT/CLR pipeline animation state
  const [clrStep, setClrStep] = useState('source'); // source -> cil -> jit -> machine
  
  // Code Explainer Line Highlight State
  const [explainerLine, setExplainerLine] = useState(null);
  const explainerLines = [
    { text: "using System;", desc: "Includes the core System namespace containing basic classes like Console, Math, and String." },
    { text: "", desc: "Empty spaces enhance readability. The compiler ignores white spaces." },
    { text: "namespace EduVerseApp {", desc: "Namespaces organize your classes into logical scopes, preventing class naming conflicts." },
    { text: "    class Program {", desc: "A class definition. In C#, all executing code must be encapsulated inside a Class structure." },
    { text: "        static void Main(string[] args) {", desc: "The Application Entry Point. The CLR executes this method first. static = no object instantiation needed, void = returns nothing." },
    { text: "            int userScore = 95;", desc: "Stack allocation: Declares a 32-bit signed integer named 'userScore' and initializes it." },
    { text: "            Console.WriteLine(\"Score: \" + userScore);", desc: "Calls the WriteLine method of the Console class inside System namespace to print details to terminal stdout." },
    { text: "        }", desc: "Closes the Main method. The local stack frame for userScore is popped and destroyed." },
    { text: "    }", desc: "Closes class Program." },
    { text: "}", desc: "Closes namespace EduVerseApp." }
  ];
  
  // Interactive Practice State
  const [quizScore, setQuizScore] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizAnswerChecked, setQuizAnswerChecked] = useState(false);
  const [dragItems, setDragItems] = useState(["double", "int", "float", "char"]);
  const [droppedSlots, setDroppedSlots] = useState({ 0: null, 1: null, 2: null });
  const [matchingSuccess, setMatchingSuccess] = useState(null);

  // Exam Writing Practice State
  const [examAnswer, setExamAnswer] = useState('');
  const [examTimer, setExamTimer] = useState(300); // 5 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [examGrading, setExamGrading] = useState(false);
  const [examResult, setExamResult] = useState(null);

  // Interview & Viva Telemetry
  const [activeInterviewIndex, setActiveInterviewIndex] = useState(0);
  const [interviewQuestions] = useState([
    { q: "What is the difference between Managed Code and Unmanaged Code?", a: "Managed code runs under the control of the Common Language Runtime (CLR), providing features like garbage collection and memory safety. Unmanaged code runs directly by the OS outside the runtime environment (e.g., C/C++ pointers)." },
    { q: "Explain Stack vs Heap memory allocation in C#.", a: "Stack is used for static memory allocation and value types (e.g., int, struct). It works on LIFO (Last-In-First-Out) and is managed directly by the CPU. Heap is used for dynamic memory allocation and reference types (e.g., classes, arrays). Memory is reclaimed by the Garbage Collector." },
    { q: "What is boxing and unboxing, and why is it expensive?", a: "Boxing converts a value type (stack) to a reference type (heap object). Unboxing converts it back. It is expensive because boxing requires dynamic memory allocation on the heap and metadata wrapping, while unboxing requires casting checks." }
  ]);
  const [showInterviewAnswer, setShowInterviewAnswer] = useState(false);
  const [isRecordingViva, setIsRecordingViva] = useState(false);
  const [vivaResponse, setVivaResponse] = useState('');

  // Study Notes and Cheat Sheet
  const [notesList, setNotesList] = useState(() => {
    const saved = localStorage.getItem('cs_fund_notes');
    return saved ? JSON.parse(saved) : [
      { id: 1, color: '#fef08a', text: 'Important: C# is strongly-typed. Value types are stored on the stack.' },
      { id: 2, color: '#bfdbfe', text: 'Garbage Collector manages reference type instances on the Heap.' }
    ];
  });
  const [newNoteText, setNewNoteText] = useState('');
  const [noteColor, setNoteColor] = useState('#fef08a');
  const [cheatFilter, setCheatFilter] = useState('');

  // Save notes to localStorage helper
  const saveNotes = (updated) => {
    setNotesList(updated);
    localStorage.setItem('cs_fund_notes', JSON.stringify(updated));
  };

  // Exam timer logic
  useEffect(() => {
    let interval = null;
    if (timerActive && examTimer > 0) {
      interval = setInterval(() => {
        setExamTimer((prev) => prev - 1);
      }, 1000);
    } else if (examTimer === 0) {
      setTimerActive(false);
      toast.error("Time is up! Exam auto-submitted.");
      handleSubmitExam();
    }
    return () => clearInterval(interval);
  }, [timerActive, examTimer]);

  // Save completed state to localstorage helper
  const markTopicComplete = (topicName, rewardXP) => {
    if (completedTopics[topicName]) {
      toast.success("Topic already completed! Keep exploring.");
      return;
    }
    const updated = { ...completedTopics, [topicName]: true };
    setCompletedTopics(updated);
    localStorage.setItem('cs_fund_completed', JSON.stringify(updated));
    updateXP(rewardXP);
    toast.success(`+${rewardXP} XP Earned for mastering ${topicName}!`);
  };

  // Compile runner simulation
  const handleExecuteCode = () => {
    setIsCompiling(true);
    setConsoleOutput(["[Compiler] Initializing C# Roslyn Compiler instance...", "[Compiler] Generating Assembly manifests...", "[CLR] Loading Virtual Address space..."]);
    
    setTimeout(() => {
      let output = [];
      if (code.includes("Hello, EduVerse AI!")) {
        output = [
          "Hello, EduVerse AI!",
          "Welcome to C# Fundamentals.",
          "",
          "Process completed with exit code 0."
        ];
      } else if (code.includes("array1[0]")) {
        output = [
          "Stack - x: 10, y: 25",
          "Heap - array1[0]: 99 (Changed via array2!)",
          "",
          "Process completed with exit code 0."
        ];
      } else if (code.includes("salaryInt")) {
        output = [
          "Double value: 85450.75",
          "Casted Int value: 85450",
          "",
          "Process completed with exit code 0."
        ];
      } else {
        // Custom parser simulation
        output = ["[Output] Code compiled successfully."];
        const lines = code.split('\n');
        let printOutputs = [];
        lines.forEach(l => {
          if (l.includes("Console.WriteLine")) {
            const match = l.match(/WriteLine\(([^)]+)\)/);
            if (match) {
              let inner = match[1].replace(/\"/g, "").replace(/\$/g, "");
              printOutputs.push(inner);
            }
          }
        });
        if (printOutputs.length > 0) {
          output = output.concat(printOutputs);
        } else {
          output.push("Hello! Write Console.WriteLine(\"...\") to see outputs here.");
        }
        output.push("", "Process completed with exit code 0.");
      }
      setConsoleOutput(output);
      setIsCompiling(false);
      
      const newCompileCount = labCompilesCount + 1;
      setLabCompilesCount(newCompileCount);
      localStorage.setItem('cs_fund_compiles', newCompileCount.toString());
      
      if (newCompileCount === 1) {
        updateXP(50);
        toast.success("+50 XP: First C# compilation successful!");
      }
    }, 1500);
  };

  const handleCopilotAction = (actionType) => {
    setCopilotType('info');
    if (actionType === 'explain') {
      setCopilotMessage("Analyzing structure... This is a C# Console Application. The Main() method acts as the entry point. Console.WriteLine sends standard output characters into the system stream buffer.");
    } else if (actionType === 'debug') {
      if (code.includes(";") === false) {
        setCopilotType('debug');
        setCopilotMessage("Syntax Alert: Semicolon missing at end of line. Every executable statement in C# requires a semicolon (;) terminator.");
      } else {
        setCopilotType('success');
        setCopilotMessage("Code validation: 0 syntax errors detected. Type cast ranges are safe. Stack bounds are memory protected.");
      }
    } else if (actionType === 'optimize') {
      setCopilotMessage("Performance note: If using intensive string operations, switch from string concatenation to System.Text.StringBuilder to avoid excessive heap allocations.");
    }
  };

  // Practice Matcher Quiz logic
  const handleVerifyMatching = () => {
    // 0: double (salaryDouble), 1: int (truncatedPi), 2: char (letterGrade)
    // Correct order should map to types:
    // Slot 0 holds double, Slot 1 holds int, Slot 2 holds char
    if (droppedSlots[0] === 'double' && droppedSlots[1] === 'int' && droppedSlots[2] === 'char') {
      setMatchingSuccess(true);
      markTopicComplete('Type Casting Matcher', 100);
    } else {
      setMatchingSuccess(false);
      toast.error("Incorrect types placed in slots. Try again!");
    }
  };

  // Exam Practice Grading Simulator
  const handleSubmitExam = () => {
    if (!examAnswer.trim()) {
      toast.error("Please write an answer before submitting.");
      return;
    }
    setExamGrading(true);
    setTimerActive(false);
    
    setTimeout(() => {
      const charCount = examAnswer.length;
      let score = 5;
      let feedback = [];
      let corrections = [];
      
      if (examAnswer.toLowerCase().includes("garbage collector") || examAnswer.toLowerCase().includes("gc")) {
        score += 2;
        feedback.push("Good inclusion of the Garbage Collector (GC) mechanism on reference types.");
      } else {
        feedback.push("Add details about how Garbage Collection handles Heap memory cleanup.");
      }
      
      if (examAnswer.toLowerCase().includes("stack") && examAnswer.toLowerCase().includes("heap")) {
        score += 2;
        feedback.push("Clearly differentiated between Stack (LIFO, fast) and Heap (dynamic, variable size).");
      } else {
        feedback.push("Be sure to explicitly compare value types on Stack with reference types on Heap.");
      }
      
      if (charCount > 250) {
        score += 1;
      } else {
        feedback.push("Your answer length is somewhat short. Expand on code structure diagrams to secure a perfect 10 marks.");
      }
      
      score = Math.min(score, 10);
      
      setExamResult({
        score,
        grade: score >= 9 ? 'A+' : score >= 7 ? 'A' : score >= 5 ? 'B' : 'F',
        feedback,
        corrections: charCount < 100 ? ["Provide actual C# snippet declarations for better clarity."] : []
      });
      setExamGrading(false);
      markTopicComplete('10-Mark Exam Mode', 150);
    }, 2000);
  };

  // Mock Viva Voice Telemetry Simulation
  const handleStartVivaRecording = () => {
    setIsRecordingViva(true);
    toast.success("Voice capture simulated. Speak into your microphone...");
    
    setTimeout(() => {
      setIsRecordingViva(false);
      setVivaResponse("In C#, compilation occurs in two stages. First, source code is converted by the compiler into Common Intermediate Language (CIL). Then, the JIT compiler inside the CLR converts the CIL into native machine assembly instructions at runtime execution.");
      markTopicComplete('Viva Voice Prep', 80);
      toast.success("Speech-to-Text translation completed! AI analysis calculated below.");
    }, 3500);
  };

  // Notebook sticky notes
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
      id: Date.now(),
      color: noteColor,
      text: newNoteText
    };
    const updated = [...notesList, newNote];
    saveNotes(updated);
    setNewNoteText('');
    toast.success("Note pinned to study space!");
  };

  const handleDeleteNote = (id) => {
    const updated = notesList.filter(n => n.id !== id);
    saveNotes(updated);
    toast.success("Note removed.");
  };

  // Completion calculation
  const topicsToComplete = [
    'Theory Concepts', 
    'Memory JIT Flow', 
    'Roslyn Code Execution', 
    'Type Casting Matcher', 
    '10-Mark Exam Mode', 
    'Viva Voice Prep'
  ];
  
  const completedList = Object.keys(completedTopics).filter(k => completedTopics[k]);
  const progressPercent = Math.round((completedList.length / topicsToComplete.length) * 100);

  return (
    <div className="space-y-6">
      
      {/* ──────────────── PREMIUM HERO SECTION ──────────────── */}
      <div className="relative overflow-hidden p-6 sm:p-8 cs-fun-dark-card border border-white/10 rounded-[32px] text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] uppercase font-bold tracking-widest rounded-full">
                Beginner Track
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] uppercase font-bold tracking-widest rounded-full flex items-center gap-1">
                <Flame size={10} className="text-orange-400" /> +380 XP Total
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              C# Fundamentals
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore structural programming components, runtime compiler processes, type safety, JIT pipeline configurations, and dynamic stack versus heap pointer architectures.
            </p>
            
            <div className="flex items-center gap-4 pt-2">
              <button 
                onClick={() => {
                  markTopicComplete('Theory Concepts', 50);
                  setActiveTab('visuals');
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <Zap size={14} /> Start Interactive Path
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Time Est: </span>
                <span className="text-xs text-white font-bold">2.5 Hours</span>
              </div>
            </div>
          </div>

          {/* Gamified Meter Card */}
          <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl w-full md:w-80 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Track Completion</span>
              <span className="text-blue-400 font-extrabold">{progressPercent}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-center pt-1">
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 block">Mastery Score</span>
                <strong className="text-sm text-white">{completedList.length}/{topicsToComplete.length}</strong>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 block">Total XP Gained</span>
                <strong className="text-sm text-purple-400 font-extrabold">+{completedList.length * 50} XP</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── 12 TABS INTERACTIVE NAVIGATION MENU ──────────────── */}
      <div className="flex items-center overflow-x-auto pb-2 border-b border-white/10 gap-1.5 scrollbar-thin scrollbar-thumb-white/10">
        {[
          { id: 'theory', label: 'Theory & JIT', icon: BookOpen },
          { id: 'visuals', label: 'Visuals & Analogy', icon: Layers },
          { id: 'codelab', label: 'Roslyn Code Lab', icon: Code },
          { id: 'explainer', label: 'Code Explainer', icon: Eye },
          { id: 'practice', label: 'Practice & Quizzes', icon: CheckCircle },
          { id: 'exam', label: 'Exam Mode (10M)', icon: Award },
          { id: 'pyqs', label: 'PYQs (University)', icon: FileText },
          { id: 'interview', label: 'Interview Prep', icon: HelpCircle },
          { id: 'viva', label: 'Viva Voice Simulation', icon: Volume2 },
          { id: 'notes', label: 'Study Sticky Notes', icon: Edit3 },
          { id: 'cheatsheet', label: 'Quick Cheat Sheet', icon: Clipboard },
          { id: 'analytics', label: 'Telemetry Analytics', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                  : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ──────────────── TAB WORKSPACE CONTAINERS ──────────────── */}
      <div className="min-h-[450px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="w-full"
          >
            
            {/* 1. THEORY TAB */}
            {activeTab === 'theory' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 space-y-6">
                  {/* Detailed Description */}
                  <div className="cs-fun-card space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Academic Theory Overview</span>
                      <button 
                        onClick={() => markTopicComplete('Theory Concepts', 50)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          completedTopics['Theory Concepts'] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                        }`}
                      >
                        {completedTopics['Theory Concepts'] ? '✓ Mastered' : 'Mark Topic Mastered'}
                      </button>
                    </div>
                    <h2 className="text-xl font-bold text-white">Understanding C# & CLR Architecture</h2>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      C# is a highly robust, modern, object-oriented programming language designed by Microsoft running on the <strong>Common Language Runtime (CLR)</strong>. In C#, code compiles not to machine assembly codes, but to a compiler-independent <strong>Common Intermediate Language (CIL)</strong>. 
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      At runtime, the CLR's <strong>Just-In-Time (JIT) Compiler</strong> translates this bytecode into optimized native machine instructions specific to the host CPU processor architecture.
                    </p>

                    <div className="border-t border-white/5 pt-4">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">ELI10: Explain Like I'm 10</h4>
                      <div className="cs-fun-inner-card">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Imagine you write a recipe in English (C# code). Instead of giving it directly to a baker, you translate it to a secret global drawing code (Intermediate Language). When a baker in France wants to bake it, they translate the drawing into French instructions instantly just before baking (JIT compilation)!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Advantages & Disadvantages Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                      <strong className="text-xs text-emerald-400 uppercase tracking-wider block mb-2">Core Advantages</strong>
                      <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                        <li>Automatic memory handling via Garbage Collection (GC).</li>
                        <li>Type safety prevents reading random system memory slots.</li>
                        <li>Platform independence through compilation down to generic standard CIL bytecode.</li>
                      </ul>
                    </div>
                    <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                      <strong className="text-xs text-rose-400 uppercase tracking-wider block mb-2">Disadvantages & Tradeoffs</strong>
                      <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                        <li>Higher initial startup time delay due to JIT runtime compiling on application boot.</li>
                        <li>Higher memory footprint than compiled native code systems (C/C++).</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Technical Sidepanel */}
                <div className="space-y-6">
                  <div className="cs-fun-card space-y-4">
                    <strong className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Quick Reference parameters</strong>
                    
                    <div className="space-y-3">
                      <div className="cs-fun-inner-card flex justify-between items-center">
                        <span className="text-xs text-slate-400">Garbage Collector</span>
                        <span className="text-xs font-bold text-white">Automatic</span>
                      </div>
                      <div className="cs-fun-inner-card flex justify-between items-center">
                        <span className="text-xs text-slate-400">Memory Protection</span>
                        <span className="text-xs font-bold text-emerald-400">Type-Safe</span>
                      </div>
                      <div className="cs-fun-inner-card flex justify-between items-center">
                        <span className="text-xs text-slate-400">Standard Compiler</span>
                        <span className="text-xs font-bold text-white">Roslyn (.NET CLI)</span>
                      </div>
                    </div>
                  </div>

                  <div className="cs-fun-card text-center space-y-3">
                    <span className="text-2xl block">💡</span>
                    <h4 className="text-sm font-bold text-white">JIT Modes</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Normal JIT compiles code blocks only when called. Eager JIT compiles all methods in an assembly at load-time to save runtime delays later.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. VISUALS & ANALOGY TAB */}
            {activeTab === 'visuals' && (
              <div className="space-y-6 text-left">
                <div className="cs-fun-card space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Interactive JIT & CLR Execution Pipeline</h3>
                    <p className="text-xs text-slate-400 mt-1">Click the stages to trace how your code goes from a text document to machine instructions executed on the CPU.</p>
                  </div>

                  {/* Visual Flow chart steps */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                    {[
                      { id: 'source', label: '1. C# Source Code', desc: 'Written in code files (.cs). Highly readable text format.' },
                      { id: 'cil', label: '2. CIL Bytecode (EXE/DLL)', desc: 'Roslyn compiles Source Code into Common Intermediate Language (CIL) binaries.' },
                      { id: 'jit', label: '3. CLR JIT Compiler', desc: 'When executed, CLR loads intermediate code and invokes Just-In-Time Compiler.' },
                      { id: 'machine', label: '4. Native Machine Assembly', desc: 'CPU executes binary instructions. Blazing fast hardware level execution.' }
                    ].map((step) => (
                      <button
                        key={step.id}
                        onClick={() => setClrStep(step.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          clrStep === step.id 
                            ? 'bg-blue-600 border-blue-400 shadow-md shadow-blue-500/20 text-white' 
                            : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/20 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <strong className="text-xs block mb-1">{step.label}</strong>
                        <p className={`text-[10px] leading-relaxed ${clrStep === step.id ? 'text-blue-100' : 'text-slate-500'}`}>
                          {step.desc}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Flow chart visualization canvas */}
                  <div className="p-6 cs-fun-dark-card rounded-2xl border border-white/5 flex items-center justify-center min-h-[160px]">
                    {clrStep === 'source' && (
                      <div className="text-center space-y-2 max-w-sm">
                        <strong className="text-xs font-bold text-white block">C# Editor</strong>
                        <code className="text-[10px] text-blue-400 block bg-slate-900 p-2.5 rounded border border-white/10">
                          {"int x = 45;\nConsole.WriteLine(x);"}
                        </code>
                      </div>
                    )}
                    {clrStep === 'cil' && (
                      <div className="text-center space-y-2 max-w-sm">
                        <strong className="text-xs font-bold text-purple-400 block">Intermediate Bytecode (ILDASM View)</strong>
                        <code className="text-[10px] text-slate-400 block bg-slate-900 p-2.5 rounded border border-white/10">
                          {"ldc.i4.s 45\nstloc.0\nldloc.0\ncall void [System.Console]::WriteLine(int32)"}
                        </code>
                      </div>
                    )}
                    {clrStep === 'jit' && (
                      <div className="text-center space-y-3">
                        <strong className="text-xs font-bold text-yellow-400 block">JIT compilation loading...</strong>
                        <div className="flex gap-2 justify-center">
                          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce" />
                          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                    {clrStep === 'machine' && (
                      <div className="text-center space-y-2 max-w-sm">
                        <strong className="text-xs font-bold text-emerald-400 block">CPU Machine Instructions (x86_64)</strong>
                        <code className="text-[10px] text-emerald-300 block bg-slate-900 p-2.5 rounded border border-white/10">
                          {"mov dword ptr [rsp+20h], 2Dh\nmov edx, dword ptr [rsp+20h]\ncall Console::WriteLine"}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stack vs Heap interactive simulator */}
                <div className="cs-fun-card space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">Stack vs Heap Memory Model Allocation</h3>
                      <p className="text-xs text-slate-400 mt-1">Trace variable allocations step-by-step to visualize how C# holds objects and variables in memory frames.</p>
                    </div>
                    <button 
                      onClick={() => markTopicComplete('Memory JIT Flow', 80)}
                      className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs rounded-lg font-bold"
                    >
                      Unlock Memory badge
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Controller */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {memorySteps.map((step, idx) => (
                          <button
                            key={idx}
                            onClick={() => setMemoryStep(idx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                              memoryStep === idx 
                                ? 'bg-purple-600 border-purple-400 text-white font-bold' 
                                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {step.title}
                          </button>
                        ))}
                      </div>

                      <div className="cs-fun-inner-card text-xs text-slate-400 leading-relaxed">
                        <strong className="text-white block mb-1">Step Details:</strong>
                        {memorySteps[memoryStep].desc}
                      </div>
                    </div>

                    {/* Stack segment representation */}
                    <div className="p-5 cs-fun-dark-card text-center space-y-3">
                      <span className="text-xs font-bold text-white uppercase tracking-widest block border-b border-white/10 pb-1.5">
                        Call Stack Memory (Fast, LIFO)
                      </span>
                      
                      <div className="space-y-2 min-h-[160px] flex flex-col justify-end">
                        {memorySteps[memoryStep].stack.length === 0 ? (
                          <div className="text-slate-500 text-xs my-auto">Frame is empty. Declaring variables fills stack memory.</div>
                        ) : (
                          memorySteps[memoryStep].stack.map((item, idx) => (
                            <div key={idx} className="p-2.5 bg-indigo-950/80 border border-indigo-500/30 rounded-xl text-left space-y-0.5 animate-fadeIn">
                              <span className="text-[10px] text-indigo-300 block font-bold">{item.name} ({item.type === 'ref' ? 'Pointer' : 'Value'})</span>
                              <strong className="text-xs text-white block font-mono">{item.val}</strong>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Heap segment representation */}
                    <div className="p-5 cs-fun-dark-card text-center space-y-3">
                      <span className="text-xs font-bold text-white uppercase tracking-widest block border-b border-white/10 pb-1.5">
                        Dynamic Heap Memory (Objects, GC)
                      </span>
                      
                      <div className="space-y-2 min-h-[160px] flex flex-col justify-center">
                        {memorySteps[memoryStep].heap.length === 0 ? (
                          <div className="text-slate-500 text-xs my-auto">Heap allocation is empty. Instantiate classes via "new" keyword to store here.</div>
                        ) : (
                          memorySteps[memoryStep].heap.map((item, idx) => (
                            <div key={idx} className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-left space-y-0.5 animate-fadeIn">
                              <span className="text-[10px] text-emerald-400 font-mono block">Address: {item.addr}</span>
                              <strong className="text-xs text-white block font-mono">{item.val}</strong>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CODE LAB TAB */}
            {activeTab === 'codelab' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Code editor pane */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="p-4 cs-fun-card flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Roslyn Compiler Lab Editor</span>
                    
                    <div className="flex items-center gap-2">
                      <select 
                        onChange={(e) => setCode(presets[e.target.value].code)}
                        className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="hello">Hello World Template</option>
                        <option value="variables">Stack vs Heap Example</option>
                        <option value="casting">Explicit Casting Template</option>
                      </select>

                      <button 
                        onClick={() => {
                          setCode(presets.hello.code);
                          setConsoleOutput([]);
                        }}
                        className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                        title="Reset code editor"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full h-80 p-4 font-mono text-xs cs-fun-dark-card text-emerald-400 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
                    />
                    
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      <button
                        onClick={() => handleCopilotAction('explain')}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 rounded border border-white/5 cursor-pointer"
                      >
                        💡 AI Explain
                      </button>
                      <button
                        onClick={() => handleCopilotAction('debug')}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 rounded border border-white/5 cursor-pointer"
                      >
                        🔧 AI Debug
                      </button>
                      <button
                        onClick={() => handleCopilotAction('optimize')}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 rounded border border-white/5 cursor-pointer"
                      >
                        ⚡ AI Optimize
                      </button>
                    </div>
                  </div>

                  {/* Execute trigger */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">Ctrl+Enter to compile and run</span>
                    
                    <button
                      onClick={handleExecuteCode}
                      disabled={isCompiling}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      {isCompiling ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Compiling C#...
                        </>
                      ) : (
                        <>
                          <Play size={13} />
                          Execute Program
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Output Console and Copilot Helper */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Console Log screen */}
                  <div className="p-5 cs-fun-dark-card border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Terminal size={11} /> C# Console output
                      </span>
                      <button 
                        onClick={() => setConsoleOutput([])}
                        className="text-[9px] text-slate-500 hover:text-white uppercase"
                      >
                        Clear log
                      </button>
                    </div>

                    <div className="font-mono text-[11px] text-slate-300 space-y-1 min-h-[140px] max-h-[160px] overflow-y-auto">
                      {consoleOutput.length === 0 ? (
                        <div className="text-slate-600 text-center pt-8">Click "Execute Program" to compile.</div>
                      ) : (
                        consoleOutput.map((line, idx) => (
                          <div 
                            key={idx} 
                            className={
                              line.startsWith('[Compiler]') ? 'text-indigo-400' :
                              line.startsWith('[CLR]') ? 'text-purple-400' :
                              line.startsWith('[Output]') ? 'text-slate-400 font-bold' :
                              'text-emerald-400'
                            }
                          >
                            {line}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* AI Copilot Panel */}
                  <div className="p-5 cs-fun-card border border-indigo-500/20 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                      <BrainCircuit size={14} /> AI Copilot Helper
                    </span>

                    {copilotMessage ? (
                      <div className={`p-3 rounded-xl text-xs leading-relaxed border ${
                        copilotType === 'debug' ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300' :
                        copilotType === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' :
                        'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-300'
                      }`}>
                        {copilotMessage}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Use the Copilot assistant buttons inside the editor for fast, real-time code explanations, syntax checks, and optimizations.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. CODE EXPLAINER TAB */}
            {activeTab === 'explainer' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                {/* Program code lines to click */}
                <div className="lg:col-span-2 p-6 cs-fun-dark-card border border-white/10 rounded-3xl space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Line-by-Line Code Explainer</h3>
                    <p className="text-xs text-slate-400 mt-1">Select any line of the C# code sample below to reveal its exact purpose, runtime allocation, and compiler characteristics.</p>
                  </div>

                  <div className="font-mono text-xs space-y-1 cs-fun-dark-card p-4 border border-white/5 overflow-x-auto select-none">
                    {explainerLines.map((line, idx) => (
                      <div
                        key={idx}
                        onClick={() => setExplainerLine(idx)}
                        className={`p-2 rounded-lg cursor-pointer transition-all flex gap-3 items-center ${
                          explainerLine === idx 
                            ? 'bg-blue-600/30 border border-blue-500/50 text-white' 
                            : 'hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <span className="w-5 text-slate-600 text-right">{idx + 1}</span>
                        <pre className="font-mono m-0 flex-1 whitespace-pre-wrap">{line.text || " "}</pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation text card */}
                <div className="p-6 cs-fun-card space-y-4 flex flex-col justify-center min-h-[300px]">
                  {explainerLine === null ? (
                    <div className="text-center space-y-2">
                      <span className="text-2xl">👉</span>
                      <strong className="text-xs text-slate-400 block font-bold">Select a code line on the left to begin exploration.</strong>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded">
                          Line {explainerLine + 1}
                        </span>
                        <span className="text-xs text-slate-500 font-bold uppercase">C# Architecture Analysis</span>
                      </div>
                      
                      <h4 className="text-sm font-bold font-mono cs-fun-inner-card p-2.5 rounded border">
                        {explainerLines[explainerLine].text || "[Empty Space]"}
                      </h4>
                      
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {explainerLines[explainerLine].desc}
                      </p>

                      <div className="border-t border-white/5 pt-3">
                        <button
                          onClick={() => {
                            markTopicComplete('Roslyn Code Execution', 50);
                            setExplainerLine(null);
                          }}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition"
                        >
                          I understand this line!
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. PRACTICE & QUIZ TAB */}
            {activeTab === 'practice' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Topic Assessment Multiple Choice */}
                <div className="lg:col-span-7 p-6 cs-fun-card space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Multiple Choice Checkpoint</span>
                  <h3 className="text-base font-bold text-white">Which of the following is true regarding "Implicit Casting" in C#?</h3>
                  
                  <div className="space-y-2">
                    {[
                      { text: "It requires the target data type to be surrounded by brackets, e.g. (int)pi.", correct: false },
                      { text: "It occurs automatically when copying a smaller data type size range into a larger one without losing bytes.", correct: true },
                      { text: "It converts a reference type class on the heap directly into a stack-based structure.", correct: false },
                      { text: "It can trigger runtime overflow exceptions if data numbers are too large.", correct: false }
                    ].map((opt, idx) => {
                      const isSelected = selectedQuizOption === idx;
                      return (
                        <button
                          key={idx}
                          disabled={quizAnswerChecked}
                          onClick={() => setSelectedQuizOption(idx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition ${
                            quizAnswerChecked
                              ? opt.correct 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                : isSelected 
                                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                  : 'bg-white/5 border-transparent text-slate-500'
                              : isSelected
                                ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>

                  {!quizAnswerChecked ? (
                    <button
                      onClick={() => {
                        if (selectedQuizOption === null) {
                          toast.error("Please pick an option.");
                          return;
                        }
                        setQuizAnswerChecked(true);
                        if (selectedQuizOption === 1) {
                          updateXP(40);
                          toast.success("+40 XP: Correct Answer!");
                        } else {
                          toast.error("Incorrect. Let's study the answer.");
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Submit Evaluation Answer
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-slate-400">
                        {selectedQuizOption === 1 
                          ? "Excellent! Implicit cast converts smaller ranges like int (32-bit) safely into larger slots like double (64-bit)."
                          : "Remember, casting a larger type into a smaller one requires explicit cast brackets (e.g. (int)doubleVar) to authorize compiler compile processes."
                        }
                      </p>
                      <button
                        onClick={() => {
                          setSelectedQuizOption(null);
                          setQuizAnswerChecked(false);
                        }}
                        className="px-3 py-1.5 bg-white/5 text-slate-300 text-[10px] font-bold rounded hover:bg-white/10"
                      >
                        Retry Quiz
                      </button>
                    </div>
                  )}
                </div>

                {/* Drag and Drop Syntax Matcher */}
                <div className="lg:col-span-5 p-6 cs-fun-card space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Type Matcher Puzzle</span>
                  <h3 className="text-xs text-slate-300 leading-relaxed">
                    Tap the appropriate C# types in the items bin to fill the empty variable slots correctly.
                  </h3>

                  {/* Variable equations to place tokens in */}
                  <div className="space-y-3 pt-2 text-xs">
                    <div className="flex items-center gap-2 p-3 cs-fun-inner-card">
                      <button
                        onClick={() => setDroppedSlots({ ...droppedSlots, 0: null })}
                        className="w-20 h-7 rounded border border-dashed border-white/20 flex items-center justify-center text-[10px] bg-slate-900 text-purple-400 font-bold"
                      >
                        {droppedSlots[0] || "[Slot double]"}
                      </button>
                      <span className="text-slate-400">salary = 45000.50;</span>
                    </div>

                    <div className="flex items-center gap-2 p-3 cs-fun-inner-card">
                      <button
                        onClick={() => setDroppedSlots({ ...droppedSlots, 1: null })}
                        className="w-20 h-7 rounded border border-dashed border-white/20 flex items-center justify-center text-[10px] bg-slate-900 text-blue-400 font-bold"
                      >
                        {droppedSlots[1] || "[Slot int]"}
                      </button>
                      <span className="text-slate-400">age = (int)salary;</span>
                    </div>

                    <div className="flex items-center gap-2 p-3 cs-fun-inner-card">
                      <button
                        onClick={() => setDroppedSlots({ ...droppedSlots, 2: null })}
                        className="w-20 h-7 rounded border border-dashed border-white/20 flex items-center justify-center text-[10px] bg-slate-900 text-emerald-400 font-bold"
                      >
                        {droppedSlots[2] || "[Slot char]"}
                      </button>
                      <span className="text-slate-400">gradeLetter = 'A';</span>
                    </div>
                  </div>

                  {/* Items bin selection list */}
                  <div className="flex gap-2 flex-wrap pt-2">
                    {dragItems.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          // Find empty slot to insert
                          if (droppedSlots[0] === null) {
                            setDroppedSlots({ ...droppedSlots, 0: item });
                          } else if (droppedSlots[1] === null) {
                            setDroppedSlots({ ...droppedSlots, 1: item });
                          } else if (droppedSlots[2] === null) {
                            setDroppedSlots({ ...droppedSlots, 2: item });
                          } else {
                            toast.error("Slots are full! Click a slot to empty it.");
                          }
                        }}
                        className="px-3 py-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded text-[11px] font-mono border border-slate-200 dark:border-white/5"
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setDroppedSlots({ 0: null, 1: null, 2: null })}
                      className="text-[10px] text-slate-500 hover:text-white uppercase font-bold"
                    >
                      Clear slots
                    </button>

                    <button
                      onClick={handleVerifyMatching}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-xl cursor-pointer"
                    >
                      Verify matching
                    </button>
                  </div>

                  {matchingSuccess !== null && (
                    <div className={`p-3 rounded-xl text-center text-xs font-bold ${
                      matchingSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {matchingSuccess ? "🎉 Matching Success! +100 XP Earned!" : "❌ Verification mismatch. Check cast logic rules."}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. EXAM WRITING MODE TAB */}
            {activeTab === 'exam' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Writing board */}
                <div className="lg:col-span-7 p-6 cs-fun-card space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div>
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">University Semester Exam Module</span>
                      <h3 className="text-sm font-bold text-white mt-1">Q: Write a descriptive answer analyzing Stack and Heap variables allocation in .NET. (10 Marks)</h3>
                    </div>
                    
                    {/* Timer interface */}
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5">
                      <Clock size={12} className="text-red-400 animate-pulse" />
                      <span className="text-xs font-mono text-white font-bold">
                        {Math.floor(examTimer / 60)}:{(examTimer % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => setTimerActive(!timerActive)}
                        className="p-0.5 hover:bg-white/5 rounded"
                      >
                        {timerActive ? <Pause size={10} /> : <Play size={10} />}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={examAnswer}
                    onChange={(e) => setExamAnswer(e.target.value)}
                    placeholder="Enter your university level description answer here (explain value types, reference allocation structures, JIT stack frames pointer mapping, garbage collectors, etc.)..."
                    className="w-full h-64 p-4 text-xs bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed"
                  />

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setExamTimer(300)}
                      className="text-[10px] text-slate-500 hover:text-white uppercase font-bold"
                    >
                      Reset Timer
                    </button>

                    <button
                      onClick={handleSubmitExam}
                      disabled={examGrading}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      {examGrading ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          AI Grading Answer...
                        </>
                      ) : (
                        "Submit Answer for AI Grading"
                      )}
                    </button>
                  </div>
                </div>

                {/* Score panel / AI Evaluator */}
                <div className="lg:col-span-5 space-y-6">
                  {examResult === null ? (
                    <div className="p-6 cs-fun-card h-full flex flex-col justify-center text-center space-y-3 min-h-[300px]">
                      <span className="text-3xl">📋</span>
                      <h4 className="text-sm font-bold text-white">AI Examiner waiting for submission...</h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Submit your text explanation. The AI system evaluates key terms, syntax depth, and references to verify concepts correctness.
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 cs-fun-card space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Scorecard Metrics</span>
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-black rounded-lg border border-purple-500/20">
                          Grade {examResult.grade}
                        </span>
                      </div>

                      <div className="text-center py-2">
                        <strong className="text-4xl font-extrabold text-white">{examResult.score}</strong>
                        <span className="text-slate-500 text-xs font-semibold"> / 10 Marks</span>
                      </div>

                      {/* Feedback bullets */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">AI Evaluator Feedback:</span>
                        
                        {examResult.feedback.map((fb, idx) => (
                          <div key={idx} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                            <span className="text-emerald-400">✓</span>
                            <span>{fb}</span>
                          </div>
                        ))}
                        
                        {examResult.corrections.map((corr, idx) => (
                          <div key={idx} className="flex gap-2 text-xs text-slate-400 leading-relaxed">
                            <span className="text-orange-400">⚡</span>
                            <span>{corr}</span>
                          </div>
                        ))}
                      </div>

                      {/* Side-by-side comparison selector toggle */}
                      <div className="border-t border-white/5 pt-4">
                        <strong className="text-xs font-bold text-white block mb-1.5">Model Exam Answer Reference:</strong>
                        <div className="p-3 bg-white/5 rounded-xl text-[10px] text-slate-400 leading-relaxed font-mono max-h-36 overflow-y-auto">
                          <strong>Value Types (Stack):</strong> Allocates memory directly on the CPU thread stack frame. Int, char, bool, structures. LIFO execution means fast cleanups.<br/><br/>
                          <strong>Reference Types (Heap):</strong> Stores instance objects on the system heap. Allocates pointer reference addresses on the stack. Reclaimed dynamically by garbage collector processes.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. PREVIOUS YEAR QUESTIONS (PYQs) TAB */}
            {activeTab === 'pyqs' && (
              <div className="p-6 cs-fun-card text-left space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Previous Year University Questions</h3>
                  <p className="text-xs text-slate-400 mt-1">Examine authentic board and term exam questions covering structural C# concepts.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { marks: "2 Marks", q: "What is the function of the Just-In-Time (JIT) compiler in .NET?", a: "The JIT compiler translates Common Intermediate Language (CIL) bytecode into native machine instructions (CPU level binary) at runtime when a method is invoked." },
                    { marks: "5 Marks", q: "Differentiate between value types and reference types in C# with syntax examples.", a: "Value types store data directly in stack variables (e.g. int age = 22). Reference types allocate the pointer on the stack, while creating objects on the heap (e.g. int[] nums = new int[5]). Value type copy creates duplicate value; reference type copy duplicates pointer." },
                    { marks: "10 Marks", q: "Describe the architecture of Common Language Runtime (CLR) and detail its core execution pipeline components.", a: "CLR runtime controls application executions. 1. Code compile (C# to CIL assemblies). 2. Loading assembly class loader. 3. Code verification checks. 4. JIT compilation to machine code. 5. Threading, security, and Garbage Collection execution control." }
                  ].map((pyq, idx) => (
                    <div key={idx} className="p-4 cs-fun-inner-card space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded">
                          {pyq.marks}
                        </span>
                        <span className="text-xs font-bold text-white">{pyq.q}</span>
                      </div>
                      <p className="text-xs text-slate-400 pl-4 border-l border-white/10 leading-relaxed">
                        <strong className="text-slate-300 text-[10px] block uppercase font-bold mb-1">Standard Solution Model:</strong>
                        {pyq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. INTERVIEW PREP TAB */}
            {activeTab === 'interview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 p-6 cs-fun-card space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">C# Interview Prep Cards</span>
                    <span className="text-xs text-slate-400 font-bold">
                      Question {activeInterviewIndex + 1} of {interviewQuestions.length}
                    </span>
                  </div>

                  {/* Active Question Panel */}
                  <div className="p-6 cs-fun-dark-card rounded-2xl border border-white/5 min-h-[160px] flex flex-col justify-center">
                    <h3 className="text-base font-bold text-white text-center">
                      {interviewQuestions[activeInterviewIndex].q}
                    </h3>
                  </div>

                  {/* Reveal Answers */}
                  {showInterviewAnswer && (
                    <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-2xl text-xs text-slate-300 leading-relaxed animate-fadeIn">
                      <strong className="text-blue-400 block mb-1 uppercase font-bold text-[10px]">AI Reference Answer:</strong>
                      {interviewQuestions[activeInterviewIndex].a}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setShowInterviewAnswer(!showInterviewAnswer)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl text-slate-300 cursor-pointer"
                    >
                      {showInterviewAnswer ? "Hide Answer" : "Reveal Answer"}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowInterviewAnswer(false);
                          setActiveInterviewIndex((prev) => (prev > 0 ? prev - 1 : interviewQuestions.length - 1));
                        }}
                        className="px-3 py-1.5 bg-slate-900 border border-white/10 text-xs font-bold rounded-lg text-white"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => {
                          setShowInterviewAnswer(false);
                          setActiveInterviewIndex((prev) => (prev < interviewQuestions.length - 1 ? prev + 1 : 0));
                        }}
                        className="px-3 py-1.5 bg-slate-900 border border-white/10 text-xs font-bold rounded-lg text-white"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-6 cs-fun-card flex flex-col justify-center space-y-3">
                  <span className="text-3xl text-center">💼</span>
                  <h4 className="text-sm font-bold text-white text-center">HR & Technical Round Tips</h4>
                  <p className="text-xs text-slate-500 leading-relaxed text-left">
                    When asked about garbage collection, always explain memory cleanups as dynamic sweep cycles that target reference types on the Heap segment, but don't interfere with stack-stored items.
                  </p>
                </div>
              </div>
            )}

            {/* 9. VIVA QUESTIONS TAB */}
            {activeTab === 'viva' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 p-6 cs-fun-card space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white font-black">Viva Oral Q&A Simulation</h3>
                    <p className="text-xs text-slate-400 mt-1">Practice explaining C# architecture verbally. Click record and answer the question aloud.</p>
                  </div>

                  {/* Active Question */}
                  <div className="p-4 cs-fun-dark-card rounded-xl border border-white/5">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Examiner Oral Question:</span>
                    <strong className="text-sm text-white block mt-1.5">"Trace how a C# program gets compiled and executed by the JIT compiler inside CLR."</strong>
                  </div>

                  {/* Waveform graphic animation */}
                  {isRecordingViva && (
                    <div className="py-6 flex items-center justify-center gap-1.5">
                      {[1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                        <span 
                          key={i} 
                          className="w-1 bg-purple-500 rounded-full animate-pulse"
                          style={{ height: `${h * 4}px`, animationDelay: `${i * 0.05}s` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Voice capture trigger */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleStartVivaRecording}
                      disabled={isRecordingViva}
                      className={`px-6 py-3 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
                        isRecordingViva ? 'bg-red-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      <Volume2 size={14} className={isRecordingViva ? 'animate-bounce' : ''} />
                      {isRecordingViva ? 'Simulating capture (Speaking)...' : 'Start Mock Speech Recording'}
                    </button>
                  </div>

                  {vivaResponse && (
                    <div className="p-4 cs-fun-inner-card text-xs space-y-2 animate-fadeIn">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Transcribed voice:</span>
                      <p className="text-slate-300 italic">"{vivaResponse}"</p>
                      
                      <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-bold">Concept coverage: 95% Match</span>
                        <span className="text-slate-500">Perfect academic structure</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Telemetry telemetry parameters */}
                <div className="p-6 cs-fun-card space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Voice telemetry metrics</span>
                  
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-white/5 rounded-xl flex justify-between">
                      <span className="text-slate-400">Speech Clarity</span>
                      <strong className="text-white">High (92%)</strong>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl flex justify-between">
                      <span className="text-slate-400">Filler Words count</span>
                      <strong className="text-emerald-400">None detected</strong>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl flex justify-between">
                      <span className="text-slate-400">Concept Accuracy</span>
                      <strong className="text-white">Exceptional</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 10. STUDY STICKY NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="space-y-6 text-left">
                <div className="p-6 cs-fun-card space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Study Notes Notebook</h3>
                    <p className="text-xs text-slate-400 mt-1">Keep temporary summaries, syntax snippets, and study warnings. Syncs instantly to browser storage.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Type a new revision note card details..."
                      className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500/50"
                    />

                    <div className="flex items-center gap-2">
                      {/* Note Color Pickers */}
                      {['#fef08a', '#bfdbfe', '#bbf7d0', '#fbcfe8'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setNoteColor(c)}
                          className="w-6 h-6 rounded-full border border-white/10"
                          style={{ 
                            backgroundColor: c, 
                            transform: noteColor === c ? 'scale(1.2)' : 'none',
                            outline: noteColor === c ? '2px solid white' : 'none'
                          }}
                        />
                      ))}

                      <button
                        onClick={handleAddNote}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save size={12} /> Pin Note
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid layout list of notes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {notesList.map((note) => (
                    <div 
                      key={note.id} 
                      className="p-5 rounded-2xl shadow-lg flex flex-col justify-between min-h-[140px] text-slate-900 relative"
                      style={{ backgroundColor: note.color }}
                    >
                      <p className="text-xs font-medium leading-relaxed">
                        {note.text}
                      </p>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-black/5 mt-3">
                        <span className="text-[9px] opacity-60">Personal study pin</span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 hover:bg-black/10 rounded text-slate-700 hover:text-red-700 transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {notesList.length === 0 && (
                    <div className="col-span-3 text-center py-10 text-slate-500 text-xs">No notes pinned. Write some note details above to save!</div>
                  )}
                </div>
              </div>
            )}

            {/* 11. QUICK CHEAT SHEET TAB */}
            {activeTab === 'cheatsheet' && (
              <div className="p-6 cs-fun-card text-left space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Syntax & Operations Cheat Sheet</h3>
                    <p className="text-xs text-slate-400 mt-1">Quick-access tables for operators, casting limits, and structures.</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search keywords (e.g. cast, int)..."
                    value={cheatFilter}
                    onChange={(e) => setCheatFilter(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500/50 w-full sm:w-64"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primitive Data types table */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">Data Types & Limits</span>
                    <div className="overflow-x-auto rounded-xl border border-white/15">
                      <table className="w-full text-xs text-slate-300">
                        <thead className="bg-slate-950 text-white font-bold border-b border-white/15">
                          <tr>
                            <th className="p-2.5 text-left">Type</th>
                            <th className="p-2.5 text-left">Size</th>
                            <th className="p-2.5 text-left">Copy Logic</th>
                            <th className="p-2.5 text-left">Memory Segment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {[
                            { type: "int", size: "32-bit", logic: "Value type copy", seg: "Stack" },
                            { type: "double", size: "64-bit", logic: "Value type copy", seg: "Stack" },
                            { type: "char", size: "16-bit unicode", logic: "Value type copy", seg: "Stack" },
                            { type: "string", size: "Dynamic", logic: "Pointer reference duplicate", seg: "Heap" },
                            { type: "int[] array", size: "Dynamic", logic: "Pointer reference duplicate", seg: "Heap" }
                          ].filter(row => 
                            row.type.toLowerCase().includes(cheatFilter.toLowerCase()) ||
                            row.seg.toLowerCase().includes(cheatFilter.toLowerCase())
                          ).map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02]">
                              <td className="p-2.5 font-mono text-white">{row.type}</td>
                              <td className="p-2.5">{row.size}</td>
                              <td className="p-2.5 text-[11px]">{row.logic}</td>
                              <td className="p-2.5 font-bold text-blue-400">{row.seg}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Casting limits table */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block">Casting Operations</span>
                    <div className="overflow-x-auto rounded-xl border border-white/15">
                      <table className="w-full text-xs text-slate-300">
                        <thead className="bg-slate-950 text-white font-bold border-b border-white/15">
                          <tr>
                            <th className="p-2.5 text-left">Casting Mode</th>
                            <th className="p-2.5 text-left">Direction</th>
                            <th className="p-2.5 text-left">Syntax Example</th>
                            <th className="p-2.5 text-left">Safety</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {[
                            { mode: "Implicit cast", dir: "Small to Large", syntax: "double salary = 4000;", safety: "Safe, compiler automates" },
                            { mode: "Explicit cast", dir: "Large to Small", syntax: "int x = (int)45.75;", safety: "Unsafe (truncates decimal)" },
                            { mode: "Boxing", dir: "Value to Object", syntax: "object o = 100;", safety: "Generates heap allocation" },
                            { mode: "Unboxing", dir: "Object to Value", syntax: "int val = (int)o;", safety: "Requires runtime type match check" }
                          ].filter(row => 
                            row.mode.toLowerCase().includes(cheatFilter.toLowerCase()) ||
                            row.dir.toLowerCase().includes(cheatFilter.toLowerCase())
                          ).map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02]">
                              <td className="p-2.5 font-bold text-white">{row.mode}</td>
                              <td className="p-2.5">{row.dir}</td>
                              <td className="p-2.5 font-mono text-[10px] text-purple-300">{row.syntax}</td>
                              <td className="p-2.5 text-[11px] text-slate-400">{row.safety}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 12. TELEMETRY ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                {/* Compile counts */}
                <div className="p-5 cs-fun-card">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Compiler executions</span>
                  <strong className="text-3xl text-white block mt-2">{labCompilesCount} Runs</strong>
                  <p className="text-[11px] text-slate-400 mt-1">Total Roslyn execution assemblies compiled inside this browser session.</p>
                </div>

                {/* Topics solved progress */}
                <div className="p-5 cs-fun-card">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Topics Mastered</span>
                  <strong className="text-3xl text-blue-400 block mt-2">{completedList.length} / {topicsToComplete.length}</strong>
                  <p className="text-[11px] text-slate-400 mt-1">Interactive modules successfully completed with XP rewards claimed.</p>
                </div>

                {/* Quiz score indicator */}
                <div className="p-5 cs-fun-card">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Casting Quiz accuracy</span>
                  <strong className="text-3xl text-purple-400 block mt-2">
                    {matchingSuccess === true ? "100%" : matchingSuccess === false ? "0% (Struggling)" : "Not Evaluated"}
                  </strong>
                  <p className="text-[11px] text-slate-400 mt-1">Verification success rate on data casting structure mappings.</p>
                </div>

                {/* Exam mode submission status */}
                <div className="p-5 cs-fun-card">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Exam Grades achieved</span>
                  <strong className="text-3xl text-emerald-400 block mt-2">
                    {examResult ? `${examResult.score}/10 (${examResult.grade})` : "Not Attempted"}
                  </strong>
                  <p className="text-[11px] text-slate-400 mt-1">Score achieved on the 10-Mark Stack vs Heap academic simulator essay.</p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Workspace exit controller */}
      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <button
          onClick={() => setSelectedModule('dashboard')}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
        >
          ← Exit Fundamentals Panel
        </button>

        <button
          onClick={() => {
            if (progressPercent === 100) {
              handleMarkComplete('fundamentals');
              toast.success("Congratulations! You have completed the C# Fundamentals Track!");
            } else {
              toast.error(`Please complete all activities first. Current progress: ${progressPercent}%`);
            }
          }}
          className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          {completedCount > 0 ? "Track Completed ✓" : "Claim Course Completion Badge"}
        </button>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// C# CONTROL FLOW COMPLETE INTERACTIVE DIGITAL CLASSROOM
// ═══════════════════════════════════════════════════════════
export function CSharpControlFlowDetail({ setSelectedModule, completedCount, handleMarkComplete, updateXP, xp }) {
  const [activeTab, setActiveTab] = useState('theory');
  
  // Analytics Telemetry States
  const [completedTopics, setCompletedTopics] = useState(() => {
    const saved = localStorage.getItem('cs_flow_completed');
    return saved ? JSON.parse(saved) : {};
  });
  const [labCompilesCount, setLabCompilesCount] = useState(() => {
    return parseInt(localStorage.getItem('cs_flow_compiles') || '0', 10);
  });
  
  // Code Lab States
  const presets = {
    traffic: {
      name: "Traffic Signal (Decision)",
      code: `using System;\n\nclass Program {\n    static void Main() {\n        string signal = "Yellow";\n        \n        if (signal == "Red") {\n            Console.WriteLine("STOP immediately!");\n        } else if (signal == "Yellow") {\n            Console.WriteLine("Caution: Slow down, preparing to stop.");\n        } else {\n            Console.WriteLine("GO: Safe to proceed.");\n        }\n    }\n}`
    },
    loops: {
      name: "For Loop Iteration",
      code: `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Loop start:");\n        for (int i = 1; i <= 3; i++) {\n            Console.WriteLine($"Running loop step {i}");\n        }\n        Console.WriteLine("Loop completed.");\n    }\n}`
    },
    patternMatch: {
      name: "C# Modern Pattern Matching",
      code: `using System;\n\nclass Program {\n    static void Main() {\n        object data = 45;\n        \n        string message = data switch {\n            int age when age >= 18 => "Eligible Adult age",\n            int age => "Minor age category",\n            string text => $"Text input size: {text.Length}",\n            _ => "Unknown type payload"\n        };\n        \n        Console.WriteLine("Result: " + message);\n    }\n}`
    }
  };
  
  const [code, setCode] = useState(presets.traffic.code);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [copilotMessage, setCopilotMessage] = useState('');
  const [copilotType, setCopilotType] = useState('info');

  // Interactive Decision Tree simulator
  const [treeAge, setTreeAge] = useState(17);
  const [treeLicense, setTreeLicense] = useState(false);
  
  // Interactive Loop Iteration counter simulation
  const [loopStep, setLoopStep] = useState(0);
  const loopMaxSteps = 4;
  const loopIterations = [
    { step: 0, i: "Uninitialized", condition: "Pending", stdout: "Loop start:", stack: "i = ?" },
    { step: 1, i: "1", condition: "1 <= 3 (True)", stdout: "Running loop step 1", stack: "i = 1" },
    { step: 2, i: "2", condition: "2 <= 3 (True)", stdout: "Running loop step 2", stack: "i = 2" },
    { step: 3, i: "3", condition: "3 <= 3 (True)", stdout: "Running loop step 3", stack: "i = 3" },
    { step: 4, i: "4", condition: "4 <= 3 (False)", stdout: "Loop completed.", stack: "i = 4 (Exited)" }
  ];

  // Code Explainer Line Highlight State
  const [explainerLine, setExplainerLine] = useState(null);
  const explainerLines = [
    { text: "if (userAge >= 18) {", desc: "If condition checks the boolean evaluation result. If true, program branches into block." },
    { text: "    hasAccess = true;", desc: "Statement inside the if block. Executes only if age is 18 or older." },
    { text: "} else {", desc: "Else block captures all fallback execution paths where the condition evaluates to false." },
    { text: "    hasAccess = false;", desc: "Executes if userAge is less than 18. Prevents unauthorized entry." },
    { text: "}", desc: "Closes the conditional structure. Sequential flow execution resumes below." }
  ];
  
  // Interactive Practice States
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizAnswerChecked, setQuizAnswerChecked] = useState(false);
  const [droppedSlots, setDroppedSlots] = useState({ 0: null, 1: null });
  const [matchingSuccess, setMatchingSuccess] = useState(null);

  // Exam Writing Practice States
  const [examAnswer, setExamAnswer] = useState('');
  const [examTimer, setExamTimer] = useState(300); // 5 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [examGrading, setExamGrading] = useState(false);
  const [examResult, setExamResult] = useState(null);

  // Interview & Viva Telemetry
  const [activeInterviewIndex, setActiveInterviewIndex] = useState(0);
  const [interviewQuestions] = useState([
    { q: "What is the difference between if-else and switch statements?", a: "if-else evaluates ranges, logical criteria, and multiple distinct variables. switch evaluates equality matches against a single expression. switch statements are often pre-compiled into jump tables, making them much faster for multiple constant choices." },
    { q: "Explain the difference between break, continue, and return statements.", a: "break terminates the immediate enclosing loop or switch block. continue skips the remaining statements in the current iteration and jumps to the next cycle. return immediately exits the entire method block and optionally returns a value." },
    { q: "What is yield return in C#?", a: "yield return is a jump statement that provides custom stateful iterator updates. It returns elements one by one dynamically without creating a collection in memory, supporting custom lazy-loaded enumerators." }
  ]);
  const [showInterviewAnswer, setShowInterviewAnswer] = useState(false);
  const [isRecordingViva, setIsRecordingViva] = useState(false);
  const [vivaResponse, setVivaResponse] = useState('');

  // Study Notes and Cheat Sheet
  const [notesList, setNotesList] = useState(() => {
    const saved = localStorage.getItem('cs_flow_notes');
    return saved ? JSON.parse(saved) : [
      { id: 1, color: '#fef08a', text: 'Important: Switch statements compile to jump tables (fast O(1) performance).' },
      { id: 2, color: '#bbf7d0', text: 'Off-by-one errors are common in loops. Verify index start and end bounds.' }
    ];
  });
  const [newNoteText, setNewNoteText] = useState('');
  const [noteColor, setNoteColor] = useState('#fef08a');
  const [cheatFilter, setCheatFilter] = useState('');

  // Save notes helper
  const saveNotes = (updated) => {
    setNotesList(updated);
    localStorage.setItem('cs_flow_notes', JSON.stringify(updated));
  };

  // Exam timer logic
  useEffect(() => {
    let interval = null;
    if (timerActive && examTimer > 0) {
      interval = setInterval(() => {
        setExamTimer((prev) => prev - 1);
      }, 1000);
    } else if (examTimer === 0) {
      setTimerActive(false);
      toast.error("Time is up! Exam auto-submitted.");
      handleSubmitExam();
    }
    return () => clearInterval(interval);
  }, [timerActive, examTimer]);

  // Save completed state to localstorage helper
  const markTopicComplete = (topicName, rewardXP) => {
    if (completedTopics[topicName]) {
      toast.success("Topic already completed! Keep exploring.");
      return;
    }
    const updated = { ...completedTopics, [topicName]: true };
    setCompletedTopics(updated);
    localStorage.setItem('cs_flow_completed', JSON.stringify(updated));
    updateXP(rewardXP);
    toast.success(`+${rewardXP} XP Earned for mastering ${topicName}!`);
  };

  // Compile runner simulation
  const handleExecuteCode = () => {
    setIsCompiling(true);
    setConsoleOutput(["[Compiler] Resolving C# Assembly symbols...", "[Compiler] Translating intermediate IL tables...", "[CLR] Starting execution runtime pipeline..."]);
    
    setTimeout(() => {
      let output = [];
      if (code.includes("Yellow")) {
        output = [
          "Caution: Slow down, preparing to stop.",
          "",
          "Process completed with exit code 0."
        ];
      } else if (code.includes("for (int i = 1")) {
        output = [
          "Loop start:",
          "Running loop step 1",
          "Running loop step 2",
          "Running loop step 3",
          "Loop completed.",
          "",
          "Process completed with exit code 0."
        ];
      } else if (code.includes("age when age")) {
        output = [
          "Result: Eligible Adult age",
          "",
          "Process completed with exit code 0."
        ];
      } else {
        output = [
          "[Output] Code executed successfully.",
          "Check compiler presets for custom logic."
        ];
      }
      setConsoleOutput(output);
      setIsCompiling(false);
      
      const newCompileCount = labCompilesCount + 1;
      setLabCompilesCount(newCompileCount);
      localStorage.setItem('cs_flow_compiles', newCompileCount.toString());
      
      if (newCompileCount === 1) {
        updateXP(50);
        toast.success("+50 XP: First C# Control Flow program execution!");
      }
    }, 1200);
  };

  const handleCopilotAction = (actionType) => {
    setCopilotType('info');
    if (actionType === 'explain') {
      setCopilotMessage("This snippet uses control structures to modify execution logic path. if/else provides branching checks, switch maps constant keys, and loops repeat code blocks.");
    } else if (actionType === 'debug') {
      if (code.includes("=") && !code.includes("==") && code.includes("if (")) {
        setCopilotType('debug');
        setCopilotMessage("Common mistake: Assignment operator (=) used inside boolean check instead of equivalence comparator (==). Fix to compile.");
      } else {
        setCopilotType('success');
        setCopilotMessage("Code verified. Logical flow scopes are safe. Loop boundaries are clean.");
      }
    } else if (actionType === 'optimize') {
      setCopilotMessage("Optimization: Switch keys are faster than nested if/else ladders. If comparing constant literals, refactor to switch.");
    }
  };

  // Drag and Drop Matcher logic
  const handleVerifyMatching = () => {
    if (droppedSlots[0] === 'if' && droppedSlots[1] === 'else') {
      setMatchingSuccess(true);
      markTopicComplete('Control Flow Matcher', 100);
    } else {
      setMatchingSuccess(false);
      toast.error("Incorrect flow syntax order. Try again!");
    }
  };

  // Exam Practice Grading Simulator
  const handleSubmitExam = () => {
    if (!examAnswer.trim()) {
      toast.error("Please enter an answer before submitting.");
      return;
    }
    setExamGrading(true);
    setTimerActive(false);
    
    setTimeout(() => {
      const charCount = examAnswer.length;
      let score = 5;
      let feedback = [];
      
      if (examAnswer.toLowerCase().includes("jump tables") || examAnswer.toLowerCase().includes("switch")) {
        score += 2;
        feedback.push("Excellent mention of compilation to jump tables inside switch constructs.");
      } else {
        feedback.push("Mention compilation mechanisms like jump tables to secure higher marks.");
      }
      
      if (examAnswer.toLowerCase().includes("off-by-one") || examAnswer.toLowerCase().includes("infinite")) {
        score += 2;
        feedback.push("Good highlight of common mistakes like off-by-one errors and infinite iterations.");
      } else {
        feedback.push("Include common mistakes like infinite loops for complete answer context.");
      }
      
      if (charCount > 250) score += 1;
      score = Math.min(score, 10);
      
      setExamResult({
        score,
        grade: score >= 9 ? 'A+' : score >= 7 ? 'A' : score >= 5 ? 'B' : 'F',
        feedback,
        corrections: charCount < 100 ? ["Expand code definitions with C# example fragments."] : []
      });
      setExamGrading(false);
      markTopicComplete('10-Mark Exam Mode', 150);
    }, 2000);
  };

  // Mock Viva Voice Telemetry Simulation
  const handleStartVivaRecording = () => {
    setIsRecordingViva(true);
    toast.success("Recording mock speech telemetry...");
    
    setTimeout(() => {
      setIsRecordingViva(false);
      setVivaResponse("Control flow structures alter sequential execution. Decision-making blocks check boolean conditions, whereas iterations execute blocks multiple times while a condition remains true.");
      markTopicComplete('Viva Voice Prep', 80);
      toast.success("Voice transcribed! Analytics updated below.");
    }, 3000);
  };

  // Notebook handlers
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
      id: Date.now(),
      color: noteColor,
      text: newNoteText
    };
    const updated = [...notesList, newNote];
    saveNotes(updated);
    setNewNoteText('');
    toast.success("Sticky note pinned!");
  };

  const handleDeleteNote = (id) => {
    const updated = notesList.filter(n => n.id !== id);
    saveNotes(updated);
    toast.success("Note removed.");
  };

  const topicsToComplete = [
    'Theory Concepts', 
    'Decision Flow Map', 
    'Roslyn Code Execution', 
    'Control Flow Matcher', 
    '10-Mark Exam Mode', 
    'Viva Voice Prep'
  ];
  
  const completedList = Object.keys(completedTopics).filter(k => completedTopics[k]);
  const progressPercent = Math.round((completedList.length / topicsToComplete.length) * 100);

  return (
    <div className="space-y-6">
      
      {/* ──────────────── PREMIUM HERO SECTION ──────────────── */}
      <div className="relative overflow-hidden p-6 sm:p-8 cs-fun-dark-card border border-white/10 rounded-[32px] text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] uppercase font-bold tracking-widest rounded-full">
                Beginner Track
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] uppercase font-bold tracking-widest rounded-full flex items-center gap-1">
                <Flame size={10} className="text-orange-400" /> +380 XP Total
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              C# Control Flow
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Master decisions, conditionals, switches, loops, iteration structures, pattern matching operators, and jump sequences (break, continue, return, goto, yield return).
            </p>
            
            <div className="flex items-center gap-4 pt-2">
              <button 
                onClick={() => {
                  markTopicComplete('Theory Concepts', 50);
                  setActiveTab('visuals');
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <Zap size={14} /> Start Flow Visualizer
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Time Est: </span>
                <span className="text-xs text-white font-bold">3.0 Hours</span>
              </div>
            </div>
          </div>

          {/* Gamified Meter Card */}
          <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl w-full md:w-80 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Track Completion</span>
              <span className="text-blue-400 font-extrabold">{progressPercent}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-center pt-1">
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 block">Mastery Score</span>
                <strong className="text-sm text-white">{completedList.length}/{topicsToComplete.length}</strong>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 block">Total XP Gained</span>
                <strong className="text-sm text-purple-400 font-extrabold">+{completedList.length * 50} XP</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── 12 TABS INTERACTIVE NAVIGATION MENU ──────────────── */}
      <div className="flex items-center overflow-x-auto pb-2 border-b border-white/10 gap-1.5 scrollbar-thin scrollbar-thumb-white/10">
        {[
          { id: 'theory', label: 'Theory & Logic', icon: BookOpen },
          { id: 'visuals', label: 'Visuals & Analogy', icon: Layers },
          { id: 'codelab', label: 'Roslyn Code Lab', icon: Code },
          { id: 'explainer', label: 'Code Explainer', icon: Eye },
          { id: 'practice', label: 'Practice & Quizzes', icon: CheckCircle },
          { id: 'exam', label: 'Exam Mode (10M)', icon: Award },
          { id: 'pyqs', label: 'PYQs (University)', icon: FileText },
          { id: 'interview', label: 'Interview Prep', icon: HelpCircle },
          { id: 'viva', label: 'Viva Voice Simulation', icon: Volume2 },
          { id: 'notes', label: 'Study Sticky Notes', icon: Edit3 },
          { id: 'cheatsheet', label: 'Quick Cheat Sheet', icon: Clipboard },
          { id: 'analytics', label: 'Telemetry Analytics', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                  : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ──────────────── TAB WORKSPACE CONTAINERS ──────────────── */}
      <div className="min-h-[450px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="w-full"
          >
            
            {/* 1. THEORY TAB */}
            {activeTab === 'theory' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 space-y-6">
                  {/* Detailed Description */}
                  <div className="cs-fun-card space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Academic Theory Overview</span>
                      <button 
                        onClick={() => markTopicComplete('Theory Concepts', 50)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          completedTopics['Theory Concepts'] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                        }`}
                      >
                        {completedTopics['Theory Concepts'] ? '✓ Mastered' : 'Mark Topic Mastered'}
                      </button>
                    </div>
                    <h2 className="text-xl font-bold text-white">How Program Flow Works</h2>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      By default, a C# program executes statements **sequentially** from top to bottom. **Control Flow** mechanisms alter this behavior using decisions (branching) and loops (iteration).
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Conditionals like `if-else` and `switch` evaluate boolean expressions to branch code paths, while loops repeat executable blocks. Modern C# features pattern matching switch blocks to verify type patterns alongside constant keys.
                    </p>

                    <div className="border-t border-white/5 pt-4">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">ELI10 / Beginner Analogy</h4>
                      <div className="cs-fun-inner-card">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          <strong>Traffic Signal Example:</strong> Control flow is like a traffic signal logic checker. The driver approaches the signal (sequential program). If the light is Red, they STOP (decision branch 1). Else if the light is Yellow, they slow down (decision branch 2). Otherwise, they GO (fallback branch).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Advantages & Disadvantages Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                      <strong className="text-xs text-emerald-400 uppercase tracking-wider block mb-2">Branching Logic Pros</strong>
                      <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                        <li>Allows dynamic user decisions and state validations.</li>
                        <li>Switch tables provide high-efficiency assembly routes.</li>
                        <li>Avoids duplicating duplicate code blocks using iteration statements.</li>
                      </ul>
                    </div>
                    <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                      <strong className="text-xs text-rose-400 uppercase tracking-wider block mb-2">Common Pitfalls</strong>
                      <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                        <li>Off-by-one errors lead to out of bounds exception crashes.</li>
                        <li>Missing loop updates trigger infinite loops locking application CPU cores.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Technical Sidepanel */}
                <div className="space-y-6">
                  <div className="cs-fun-card space-y-4">
                    <strong className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Quick Control Types</strong>
                    
                    <div className="space-y-3">
                      <div className="cs-fun-inner-card flex justify-between items-center">
                        <span className="text-xs text-slate-400">Decisions</span>
                        <span className="text-xs font-bold text-white">if, else, switch</span>
                      </div>
                      <div className="cs-fun-inner-card flex justify-between items-center">
                        <span className="text-xs text-slate-400">Iterations</span>
                        <span className="text-xs font-bold text-emerald-400">for, while, foreach</span>
                      </div>
                      <div className="cs-fun-inner-card flex justify-between items-center">
                        <span className="text-xs text-slate-400">Jump logic</span>
                        <span className="text-xs font-bold text-white">break, continue, return</span>
                      </div>
                    </div>
                  </div>

                  <div className="cs-fun-card text-center space-y-3">
                    <span className="text-2xl block">💡</span>
                    <h4 className="text-sm font-bold text-white">Switch Compiler Advantage</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      For large numbers of constant targets, C# compiles switches into highly optimized branch tables rather than processing top-to-bottom sequential steps.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. VISUALS & ANALOGY TAB */}
            {activeTab === 'visuals' && (
              <div className="space-y-6 text-left">
                
                {/* Decision Tree Simulator */}
                <div className="cs-fun-card space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">Interactive Decision Tree Explorer</h3>
                      <p className="text-xs text-slate-400 mt-1">Tap the values to alter conditional states and watch how branching trees direct execution paths.</p>
                    </div>
                    <button 
                      onClick={() => markTopicComplete('Decision Flow Map', 80)}
                      className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs rounded-lg font-bold"
                    >
                      Unlock flow badge
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Controls */}
                    <div className="space-y-4 cs-fun-inner-card">
                      <strong className="text-xs text-white block uppercase font-bold">Change Input variables:</strong>
                      
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1">User Age: {treeAge}</label>
                          <input 
                            type="range" 
                            min="10" 
                            max="30" 
                            value={treeAge} 
                            onChange={(e) => setTreeAge(parseInt(e.target.value))}
                            className="w-full accent-blue-500"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-slate-400">Holds Valid Driver License?</span>
                          <input 
                            type="checkbox" 
                            checked={treeLicense}
                            onChange={(e) => setTreeLicense(e.target.checked)}
                            className="w-4 h-4 rounded accent-purple-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Visual tree nodes */}
                    <div className="col-span-2 p-6 cs-fun-dark-card flex flex-col items-center justify-center space-y-4 border rounded-2xl min-h-[220px]">
                      <div className="text-center space-y-1">
                        <div className="px-4 py-2 bg-indigo-950 border border-indigo-500/30 rounded-xl font-bold text-xs text-white">
                          Condition 1: Age >= 18?
                        </div>
                        <span className="text-xs text-slate-500 block">Current Age: {treeAge} (Result: {treeAge >= 18 ? "Yes" : "No"})</span>
                      </div>

                      {/* Branching display */}
                      {treeAge >= 18 ? (
                        <div className="flex flex-col items-center space-y-3 animate-fadeIn">
                          <span className="text-slate-500 text-xs font-bold">↓ Yes Branch</span>
                          <div className="px-4 py-2 bg-purple-950 border border-purple-500/30 rounded-xl font-bold text-xs text-white">
                            Condition 2: Has Driver License?
                          </div>
                          <span className="text-xs text-slate-500 block">Result: {treeLicense ? "Yes" : "No"}</span>
                          
                          <div className="flex gap-2 pt-1">
                            <span className={`px-3 py-1 rounded text-[10px] font-bold ${treeLicense ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                              {treeLicense ? "AUTHORIZED DRIVER" : "UNAUTHORIZED LICENSE MISSING"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-1 animate-fadeIn">
                          <span className="text-slate-500 text-xs font-bold">↓ No Branch</span>
                          <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[10px] font-bold">
                            REJECTED: UNDERAGE FOR LICENSE
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Iteration Counter Stepper */}
                <div className="cs-fun-card space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Iteration counter Loop Debugger Analogy</h3>
                    <p className="text-xs text-slate-400 mt-1">Walk step-by-step through a C# standard for-loop to trace memory stack frame and print output shifts.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Controls */}
                    <div className="md:col-span-4 space-y-4 cs-fun-inner-card text-xs">
                      <strong className="text-xs text-white block uppercase font-bold">Loop execution steps:</strong>
                      <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5 font-mono text-[11px] text-white">
                        <span>Step index:</span>
                        <span>{loopStep + 1} of {loopMaxSteps + 1}</span>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          disabled={loopStep === 0}
                          onClick={() => setLoopStep(prev => prev - 1)}
                          className="flex-1 py-2 bg-slate-900 border border-white/10 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg font-bold text-xs"
                        >
                          ← Prev step
                        </button>
                        <button 
                          disabled={loopStep === loopMaxSteps}
                          onClick={() => setLoopStep(prev => prev + 1)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs"
                        >
                          Next step →
                        </button>
                      </div>
                    </div>

                    {/* Debug visual panels */}
                    <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Code highlighter box */}
                      <div className="p-4 cs-fun-dark-card border rounded-xl flex flex-col justify-between text-[11px] font-mono">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Execution Pointer:</span>
                        <div className="space-y-1.5 pt-3">
                          <div className={loopStep === 0 ? 'text-purple-400 font-bold bg-white/5 p-1 rounded' : 'text-slate-400'}>{"for (int i = 1;"}</div>
                          <div className={(loopStep > 0 && loopStep < 4) ? 'text-blue-400 font-bold bg-white/5 p-1 rounded' : 'text-slate-400'}>{"i <= 3;"}</div>
                          <div className={(loopStep > 0 && loopStep < 4) ? 'text-emerald-400 font-bold bg-white/5 p-1 rounded' : 'text-slate-400'}>{"Console.WriteLine(...);"}</div>
                          <div className={loopStep === 4 ? 'text-red-400 font-bold bg-white/5 p-1 rounded' : 'text-slate-400'}>{"i++)"}</div>
                        </div>
                      </div>

                      {/* Memory values stack */}
                      <div className="p-4 cs-fun-dark-card border rounded-xl space-y-3">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Stack Variable:</span>
                        
                        <div className="space-y-2 pt-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Loop check:</span>
                            <span className="font-mono text-purple-400 font-bold">{loopIterations[loopStep].condition}</span>
                          </div>
                          <div className="flex justify-between border-t border-white/5 pt-2">
                            <span className="text-slate-400">Memory Frame:</span>
                            <span className="font-mono text-emerald-400 font-bold">{loopIterations[loopStep].stack}</span>
                          </div>
                        </div>
                      </div>

                      {/* Simulated Print Terminal output */}
                      <div className="p-4 cs-fun-dark-card border rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Stdout print:</span>
                        
                        <div className="font-mono text-[10px] text-emerald-300 space-y-1 pt-3 min-h-[60px]">
                          {loopIterations.slice(0, loopStep + 1).map((item, idx) => (
                            <div key={idx}>{item.stdout}</div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 3. CODE LAB TAB */}
            {activeTab === 'codelab' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Editor container */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="p-4 cs-fun-card flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Roslyn Compiler Control Flow Editor</span>
                    
                    <div className="flex items-center gap-2">
                      <select 
                        onChange={(e) => setCode(presets[e.target.value].code)}
                        className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="traffic">If/Else Signal Template</option>
                        <option value="loops">For Loop Step Template</option>
                        <option value="patternMatch">Pattern switch Template</option>
                      </select>

                      <button 
                        onClick={() => {
                          setCode(presets.traffic.code);
                          setConsoleOutput([]);
                        }}
                        className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                        title="Reset code editor"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full h-80 p-4 font-mono text-xs cs-fun-dark-card text-emerald-400 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
                    />
                    
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      <button
                        onClick={() => handleCopilotAction('explain')}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 rounded border border-white/5 cursor-pointer"
                      >
                        💡 AI Explain
                      </button>
                      <button
                        onClick={() => handleCopilotAction('debug')}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 rounded border border-white/5 cursor-pointer"
                      >
                        🔧 AI Debug
                      </button>
                      <button
                        onClick={() => handleCopilotAction('optimize')}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 rounded border border-white/5 cursor-pointer"
                      >
                        ⚡ AI Optimize
                      </button>
                    </div>
                  </div>

                  {/* Executes */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">Ctrl+Enter to compile and run</span>
                    
                    <button
                      onClick={handleExecuteCode}
                      disabled={isCompiling}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      {isCompiling ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play size={13} />
                          Execute flow
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Output & AI Copilot info */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Console Log screen */}
                  <div className="p-5 cs-fun-dark-card border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Terminal size={11} /> C# Console output
                      </span>
                      <button 
                        onClick={() => setConsoleOutput([])}
                        className="text-[9px] text-slate-500 hover:text-white uppercase"
                      >
                        Clear log
                      </button>
                    </div>

                    <div className="font-mono text-[11px] text-slate-300 space-y-1 min-h-[140px] max-h-[160px] overflow-y-auto">
                      {consoleOutput.length === 0 ? (
                        <div className="text-slate-600 text-center pt-8">Click "Execute flow" to trace outcomes.</div>
                      ) : (
                        consoleOutput.map((line, idx) => (
                          <div 
                            key={idx} 
                            className={
                              line.startsWith('[Compiler]') ? 'text-indigo-400' :
                              line.startsWith('[CLR]') ? 'text-purple-400' :
                              line.startsWith('[Output]') ? 'text-slate-400 font-bold' :
                              'text-emerald-400'
                            }
                          >
                            {line}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* AI Copilot Panel */}
                  <div className="p-5 cs-fun-card border border-indigo-500/20 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                      <BrainCircuit size={14} /> AI Copilot Helper
                    </span>

                    {copilotMessage ? (
                      <div className={`p-3 rounded-xl text-xs leading-relaxed border ${
                        copilotType === 'debug' ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300' :
                        copilotType === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' :
                        'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-300'
                      }`}>
                        {copilotMessage}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Use the Copilot assistant buttons inside the editor for fast, real-time code explanations, syntax checks, and optimizations.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. CODE EXPLAINER TAB */}
            {activeTab === 'explainer' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                {/* Program code lines to click */}
                <div className="lg:col-span-2 p-6 cs-fun-dark-card border border-white/10 rounded-3xl space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Line-by-Line Branch Explainer</h3>
                    <p className="text-xs text-slate-400 mt-1">Select any line of the C# code sample below to reveal its exact purpose, runtime allocation, and compiler characteristics.</p>
                  </div>

                  <div className="font-mono text-xs space-y-1 cs-fun-dark-card p-4 border border-white/5 overflow-x-auto select-none">
                    {explainerLines.map((line, idx) => (
                      <div
                        key={idx}
                        onClick={() => setExplainerLine(idx)}
                        className={`p-2 rounded-lg cursor-pointer transition-all flex gap-3 items-center ${
                          explainerLine === idx 
                            ? 'bg-blue-600/30 border border-blue-500/50 text-white' 
                            : 'hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <span className="w-5 text-slate-600 text-right">{idx + 1}</span>
                        <pre className="font-mono m-0 flex-1 whitespace-pre-wrap">{line.text || " "}</pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation text card */}
                <div className="p-6 cs-fun-card space-y-4 flex flex-col justify-center min-h-[300px]">
                  {explainerLine === null ? (
                    <div className="text-center space-y-2">
                      <span className="text-2xl">👉</span>
                      <strong className="text-xs text-slate-400 block font-bold">Select a code line on the left to begin exploration.</strong>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded">
                          Line {explainerLine + 1}
                        </span>
                        <span className="text-xs text-slate-500 font-bold uppercase">C# Architecture Analysis</span>
                      </div>
                      
                      <h4 className="text-sm font-bold font-mono cs-fun-inner-card p-2.5 rounded border">
                        {explainerLines[explainerLine].text || "[Empty Space]"}
                      </h4>
                      
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {explainerLines[explainerLine].desc}
                      </p>

                      <div className="border-t border-white/5 pt-3">
                        <button
                          onClick={() => {
                            markTopicComplete('Roslyn Code Execution', 50);
                            setExplainerLine(null);
                          }}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition"
                        >
                          I understand this line!
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. PRACTICE & QUIZ TAB */}
            {activeTab === 'practice' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Topic Assessment Multiple Choice */}
                <div className="lg:col-span-7 p-6 cs-fun-card space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Multiple Choice Checkpoint</span>
                  <h3 className="text-base font-bold text-white">Which loop is guaranteed to execute its body at least once?</h3>
                  
                  <div className="space-y-2">
                    {[
                      { text: "while loop", correct: false },
                      { text: "for loop", correct: false },
                      { text: "do-while loop", correct: true },
                      { text: "foreach loop", correct: false }
                    ].map((opt, idx) => {
                      const isSelected = selectedQuizOption === idx;
                      return (
                        <button
                          key={idx}
                          disabled={quizAnswerChecked}
                          onClick={() => setSelectedQuizOption(idx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition ${
                            quizAnswerChecked
                              ? opt.correct 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                : isSelected 
                                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                  : 'bg-white/5 border-transparent text-slate-500'
                              : isSelected
                                ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>

                  {!quizAnswerChecked ? (
                    <button
                      onClick={() => {
                        if (selectedQuizOption === null) {
                          toast.error("Please select an answer.");
                          return;
                        }
                        setQuizAnswerChecked(true);
                        if (selectedQuizOption === 2) {
                          updateXP(40);
                          toast.success("+40 XP: Correct Answer!");
                        } else {
                          toast.error("Incorrect. Let's study the answer.");
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Submit Evaluation Answer
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-slate-400">
                        {selectedQuizOption === 2 
                          ? "Correct! The do-while loop evaluates its termination statement at the bottom, guaranteeing at least one execution."
                          : "Remember, while and for loops check their conditions at the entry top, meaning they can execute 0 times."
                        }
                      </p>
                      <button
                        onClick={() => {
                          setSelectedQuizOption(null);
                          setQuizAnswerChecked(false);
                        }}
                        className="px-3 py-1.5 bg-white/5 text-slate-300 text-[10px] font-bold rounded hover:bg-white/10"
                      >
                        Retry Quiz
                      </button>
                    </div>
                  )}
                </div>

                {/* Drag and Drop Syntax Matcher */}
                <div className="lg:col-span-5 p-6 cs-fun-card space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Branch syntax matcher</span>
                  <h3 className="text-xs text-slate-300 leading-relaxed">
                    Place structural tokens to form a valid conditional branch.
                  </h3>

                  {/* Variable equations to place tokens in */}
                  <div className="space-y-3 pt-2 text-xs font-mono">
                    <div className="flex items-center gap-2 p-3 cs-fun-inner-card">
                      <button
                        onClick={() => setDroppedSlots({ ...droppedSlots, 0: null })}
                        className="w-20 h-7 rounded border border-dashed border-white/20 flex items-center justify-center text-[10px] bg-slate-900 text-purple-400 font-bold"
                      >
                        {droppedSlots[0] || "[Slot 1]"}
                      </button>
                      <span className="text-slate-400">{"(x > 5) {"}</span>
                    </div>

                    <div className="flex items-center gap-2 p-3 cs-fun-inner-card">
                      <span className="text-slate-400">{"} "}</span>
                      <button
                        onClick={() => setDroppedSlots({ ...droppedSlots, 1: null })}
                        className="w-20 h-7 rounded border border-dashed border-white/20 flex items-center justify-center text-[10px] bg-slate-900 text-blue-400 font-bold"
                      >
                        {droppedSlots[1] || "[Slot 2]"}
                      </button>
                      <span className="text-slate-400">{" {"}</span>
                    </div>
                  </div>

                  {/* Items bin */}
                  <div className="flex gap-2 flex-wrap pt-2">
                    {['if', 'else', 'while', 'switch'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          if (droppedSlots[0] === null) {
                            setDroppedSlots({ ...droppedSlots, 0: item });
                          } else if (droppedSlots[1] === null) {
                            setDroppedSlots({ ...droppedSlots, 1: item });
                          } else {
                            toast.error("Slots are full! Click a slot to empty it.");
                          }
                        }}
                        className="px-3 py-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded text-[11px] font-mono border border-slate-200 dark:border-white/5"
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setDroppedSlots({ 0: null, 1: null })}
                      className="text-[10px] text-slate-500 hover:text-white uppercase font-bold"
                    >
                      Clear slots
                    </button>

                    <button
                      onClick={handleVerifyMatching}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-xl cursor-pointer"
                    >
                      Verify matching
                    </button>
                  </div>

                  {matchingSuccess !== null && (
                    <div className={`p-3 rounded-xl text-center text-xs font-bold ${
                      matchingSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {matchingSuccess ? "🎉 Matching Success! +100 XP!" : "❌ Error: Invalid block sequence structure."}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. EXAM WRITING MODE TAB */}
            {activeTab === 'exam' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Writing board */}
                <div className="lg:col-span-7 p-6 cs-fun-card space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div>
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">University Semester Exam Module</span>
                      <h3 className="text-sm font-bold text-white mt-1">Q: Compare if-else vs switch statement compiling advantages in C#. (10 Marks)</h3>
                    </div>
                    
                    {/* Timer */}
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5">
                      <Clock size={12} className="text-red-400 animate-pulse" />
                      <span className="text-xs font-mono text-white font-bold">
                        {Math.floor(examTimer / 60)}:{(examTimer % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => setTimerActive(!timerActive)}
                        className="p-0.5 hover:bg-white/5 rounded"
                      >
                        {timerActive ? <Pause size={10} /> : <Play size={10} />}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={examAnswer}
                    onChange={(e) => setExamAnswer(e.target.value)}
                    placeholder="Enter your university level description answer here (compare execution methods, jump table compilation, case matches, logical ranges, etc.)...."
                    className="w-full h-64 p-4 text-xs bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed"
                  />

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setExamTimer(300)}
                      className="text-[10px] text-slate-500 hover:text-white uppercase font-bold"
                    >
                      Reset Timer
                    </button>

                    <button
                      onClick={handleSubmitExam}
                      disabled={examGrading}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      {examGrading ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          AI Grading...
                        </>
                      ) : (
                        "Submit Answer for AI Grading"
                      )}
                    </button>
                  </div>
                </div>

                {/* Score panel / AI Evaluator */}
                <div className="lg:col-span-5 space-y-6">
                  {examResult === null ? (
                    <div className="p-6 cs-fun-card h-full flex flex-col justify-center text-center space-y-3 min-h-[300px]">
                      <span className="text-3xl">📋</span>
                      <h4 className="text-sm font-bold text-white">AI Examiner waiting for submission...</h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Submit your text explanation. The AI system evaluates key terms, syntax depth, and references to verify concepts correctness.
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 cs-fun-card space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Scorecard Metrics</span>
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-black rounded-lg border border-purple-500/20">
                          Grade {examResult.grade}
                        </span>
                      </div>

                      <div className="text-center py-2">
                        <strong className="text-4xl font-extrabold text-white">{examResult.score}</strong>
                        <span className="text-slate-500 text-xs font-semibold"> / 10 Marks</span>
                      </div>

                      <div className="space-y-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">AI Evaluator Feedback:</span>
                        {examResult.feedback.map((fb, idx) => (
                          <div key={idx} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                            <span className="text-emerald-400">✓</span>
                            <span>{fb}</span>
                          </div>
                        ))}
                      </div>

                      {/* Side-by-side comparison */}
                      <div className="border-t border-white/5 pt-4">
                        <strong className="text-xs font-bold text-white block mb-1.5">Model Answer Reference:</strong>
                        <div className="p-3 bg-white/5 rounded-xl text-[10px] text-slate-400 leading-relaxed font-mono max-h-36 overflow-y-auto">
                          <strong>if-else:</strong> Evaluates variable conditions sequentially. Best for logical expressions (e.g. x &gt; y).<br/><br/>
                          <strong>switch:</strong> Performs direct value tests. Compiles to O(1) complexity jump tables when matches are dense integers.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. PREVIOUS YEAR QUESTIONS (PYQs) TAB */}
            {activeTab === 'pyqs' && (
              <div className="p-6 cs-fun-card text-left space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Previous Year University Questions</h3>
                  <p className="text-xs text-slate-400 mt-1">Examine authentic board and term exam questions covering structural C# concepts.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { marks: "2 Marks", q: "Why is a goto statement discouraged in structured languages like C#?", a: "A goto statement creates unconstrained jumps (spaghetti code), making application logic flow extremely hard to read, maintain, and compile optimize." },
                    { marks: "5 Marks", q: "Compare break and continue statements with code examples.", a: "break terminates loop execution completely and jumps to sequential instructions below. continue skips the remaining statements in the loop body, transferring execution directly to the next loop boundary condition checks." },
                    { marks: "10 Marks", q: "Write an essay detail explaining C# switch statements including Pattern Matching features introduced in C# 7/8.", a: "Introduces standard switch cases. C# 7/8 modern syntax allows type pattern checks: case int val when val &gt; 100. Leverages type matching patterns and when checks on general objects payload dynamically." }
                  ].map((pyq, idx) => (
                    <div key={idx} className="p-4 cs-fun-inner-card space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded">
                          {pyq.marks}
                        </span>
                        <span className="text-xs font-bold text-white">{pyq.q}</span>
                      </div>
                      <p className="text-xs text-slate-400 pl-4 border-l border-white/10 leading-relaxed">
                        <strong className="text-slate-300 text-[10px] block uppercase font-bold mb-1">Standard Solution Model:</strong>
                        {pyq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. INTERVIEW PREP TAB */}
            {activeTab === 'interview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 p-6 cs-fun-card space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">C# Interview Prep Cards</span>
                    <span className="text-xs text-slate-400 font-bold">
                      Question {activeInterviewIndex + 1} of {interviewQuestions.length}
                    </span>
                  </div>

                  {/* Active Question Panel */}
                  <div className="p-6 cs-fun-dark-card rounded-2xl border border-white/5 min-h-[160px] flex flex-col justify-center">
                    <h3 className="text-base font-bold text-white text-center">
                      {interviewQuestions[activeInterviewIndex].q}
                    </h3>
                  </div>

                  {/* Reveal Answers */}
                  {showInterviewAnswer && (
                    <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-2xl text-xs text-slate-300 leading-relaxed animate-fadeIn">
                      <strong className="text-blue-400 block mb-1 uppercase font-bold text-[10px]">AI Reference Answer:</strong>
                      {interviewQuestions[activeInterviewIndex].a}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setShowInterviewAnswer(!showInterviewAnswer)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl text-slate-300 cursor-pointer"
                    >
                      {showInterviewAnswer ? "Hide Answer" : "Reveal Answer"}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowInterviewAnswer(false);
                          setActiveInterviewIndex((prev) => (prev > 0 ? prev - 1 : interviewQuestions.length - 1));
                        }}
                        className="px-3 py-1.5 bg-slate-900 border border-white/10 text-xs font-bold rounded-lg text-white"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => {
                          setShowInterviewAnswer(false);
                          setActiveInterviewIndex((prev) => (prev < interviewQuestions.length - 1 ? prev + 1 : 0));
                        }}
                        className="px-3 py-1.5 bg-slate-900 border border-white/10 text-xs font-bold rounded-lg text-white"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-6 cs-fun-card flex flex-col justify-center space-y-3">
                  <span className="text-3xl text-center">💼</span>
                  <h4 className="text-sm font-bold text-white text-center">Interviewer Focus Tips</h4>
                  <p className="text-xs text-slate-500 leading-relaxed text-left">
                    Expect scenario questions asking to refactor complex nested `if-else` blocks into clean switch statements or ternary operations.
                  </p>
                </div>
              </div>
            )}

            {/* 9. VIVA QUESTIONS TAB */}
            {activeTab === 'viva' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 p-6 cs-fun-card space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white font-black">Viva Oral Q&A Simulator</h3>
                    <p className="text-xs text-slate-400 mt-1">Answer the viva question below aloud to simulate oral examination conditions.</p>
                  </div>

                  {/* Active Question */}
                  <div className="p-4 cs-fun-dark-card rounded-xl border border-white/5">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Examiner Oral Question:</span>
                    <strong className="text-sm text-white block mt-1.5">"Why does the compiler complain if a break statement is omitted in a switch case containing instructions in C#?"</strong>
                  </div>

                  {/* Waveform graphic animation */}
                  {isRecordingViva && (
                    <div className="py-6 flex items-center justify-center gap-1.5">
                      {[1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                        <span 
                          key={i} 
                          className="w-1 bg-purple-500 rounded-full animate-pulse"
                          style={{ height: `${h * 4}px`, animationDelay: `${i * 0.05}s` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Voice capture trigger */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleStartVivaRecording}
                      disabled={isRecordingViva}
                      className={`px-6 py-3 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
                        isRecordingViva ? 'bg-red-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      <Volume2 size={14} className={isRecordingViva ? 'animate-bounce' : ''} />
                      {isRecordingViva ? 'Speaking...' : 'Start Mock Speech Recording'}
                    </button>
                  </div>

                  {vivaResponse && (
                    <div className="p-4 cs-fun-inner-card text-xs space-y-2 animate-fadeIn">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Transcribed Voice:</span>
                      <p className="text-slate-300 italic">"{vivaResponse}"</p>
                      
                      <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-bold">Concept coverage: 92% Match</span>
                        <span className="text-slate-500">Structured Response</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Telemetry metrics */}
                <div className="p-6 cs-fun-card space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Voice telemetry metrics</span>
                  
                  <div className="space-y-3 text-xs">
                    <div className="p-3 cs-fun-inner-card flex justify-between">
                      <span className="text-slate-400">Speech Clarity</span>
                      <strong className="text-white">Exceptional (95%)</strong>
                    </div>
                    <div className="p-3 cs-fun-inner-card flex justify-between">
                      <span className="text-slate-400">Logical Depth</span>
                      <strong className="text-emerald-400">92/100 Marks</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 10. STUDY STICKY NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="space-y-6 text-left">
                <div className="p-6 cs-fun-card space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Study Notes Notebook</h3>
                    <p className="text-xs text-slate-400 mt-1">Keep temporary summaries, syntax snippets, and study warnings. Syncs instantly to browser storage.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Type a new revision note card details..."
                      className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500/50"
                    />

                    <div className="flex items-center gap-2">
                      {['#fef08a', '#bfdbfe', '#bbf7d0', '#fbcfe8'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setNoteColor(c)}
                          className="w-6 h-6 rounded-full border border-white/10"
                          style={{ 
                            backgroundColor: c, 
                            transform: noteColor === c ? 'scale(1.2)' : 'none',
                            outline: noteColor === c ? '2px solid white' : 'none'
                          }}
                        />
                      ))}

                      <button
                        onClick={handleAddNote}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save size={12} /> Pin Note
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sticky notes list grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {notesList.map((note) => (
                    <div 
                      key={note.id} 
                      className="p-5 rounded-2xl shadow-lg flex flex-col justify-between min-h-[140px] text-slate-900 relative"
                      style={{ backgroundColor: note.color }}
                    >
                      <p className="text-xs font-medium leading-relaxed">
                        {note.text}
                      </p>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-black/5 mt-3">
                        <span className="text-[9px] opacity-60">Personal study pin</span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 hover:bg-black/10 rounded text-slate-700 hover:text-red-700 transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 11. QUICK CHEAT SHEET TAB */}
            {activeTab === 'cheatsheet' && (
              <div className="p-6 cs-fun-card text-left space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Branching & Iteration Syntax Cheat Sheet</h3>
                    <p className="text-xs text-slate-400 mt-1">Quick syntax summaries for control statements and logical operators.</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search keywords (e.g. for, loop)..."
                    value={cheatFilter}
                    onChange={(e) => setCheatFilter(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500/50 w-full sm:w-64"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Syntax reference */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">Structural Syntax</span>
                    <div className="overflow-x-auto rounded-xl border border-white/15">
                      <table className="w-full text-xs text-slate-300">
                        <thead className="bg-slate-950 text-white font-bold border-b border-white/15">
                          <tr>
                            <th className="p-2.5 text-left">Statement</th>
                            <th className="p-2.5 text-left">C# Syntax Example</th>
                            <th className="p-2.5 text-left">Key Property</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {[
                            { name: "if / else", example: "if (x > y) { } else { }", prop: "Branching choice" },
                            { name: "for loop", example: "for (int i=0; i<5; i++)", prop: "Index iterate" },
                            { name: "while loop", example: "while (condition) { }", prop: "Conditional loop" },
                            { name: "switch", example: "switch(x) { case 1: break; }", prop: "Constant match" }
                          ].filter(row => 
                            row.name.toLowerCase().includes(cheatFilter.toLowerCase()) ||
                            row.prop.toLowerCase().includes(cheatFilter.toLowerCase())
                          ).map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02]">
                              <td className="p-2.5 font-bold text-white">{row.name}</td>
                              <td className="p-2.5 font-mono text-[10px] text-purple-300">{row.example}</td>
                              <td className="p-2.5 text-slate-400">{row.prop}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Jump statements syntax table */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block">Jump Statements</span>
                    <div className="overflow-x-auto rounded-xl border border-white/15">
                      <table className="w-full text-xs text-slate-300">
                        <thead className="bg-slate-950 text-white font-bold border-b border-white/15">
                          <tr>
                            <th className="p-2.5 text-left">Jump Statement</th>
                            <th className="p-2.5 text-left">Usage Syntax</th>
                            <th className="p-2.5 text-left">Safety</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {[
                            { name: "break", example: "break;", prop: "Terminates enclosing loop/switch" },
                            { name: "continue", example: "continue;", prop: "Skips to next loop check" },
                            { name: "return", example: "return value;", prop: "Immediately exits current method" },
                            { name: "goto", example: "goto label;", prop: "Discouraged: causes unstructured jumps" }
                          ].filter(row => 
                            row.name.toLowerCase().includes(cheatFilter.toLowerCase())
                          ).map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02]">
                              <td className="p-2.5 font-bold text-white">{row.name}</td>
                              <td className="p-2.5 font-mono text-[10px] text-purple-300">{row.example}</td>
                              <td className="p-2.5 text-slate-400">{row.prop}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 12. TELEMETRY ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                <div className="p-5 cs-fun-card">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Compiler Runs</span>
                  <strong className="text-3xl text-white block mt-2">{labCompilesCount} Runs</strong>
                  <p className="text-[11px] text-slate-400 mt-1">Total Roslyn execution cycles tracked in active session.</p>
                </div>

                <div className="p-5 cs-fun-card">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Topics Mastered</span>
                  <strong className="text-3xl text-blue-400 block mt-2">{completedList.length} / {topicsToComplete.length}</strong>
                  <p className="text-[11px] text-slate-400 mt-1">Percentage completion: {progressPercent}% of syllabus metrics.</p>
                </div>

                <div className="p-5 cs-fun-card">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Evaluation Accuracy</span>
                  <strong className="text-3xl text-purple-400 block mt-2">
                    {matchingSuccess === true ? "100%" : matchingSuccess === false ? "0%" : "Not Tested"}
                  </strong>
                  <p className="text-[11px] text-slate-400 mt-1">Verification score matching conditions drag-and-drop slots.</p>
                </div>

                <div className="p-5 cs-fun-card">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">University Grade</span>
                  <strong className="text-3xl text-emerald-400 block mt-2">
                    {examResult ? `${examResult.score}/10 (${examResult.grade})` : "Not Attempted"}
                  </strong>
                  <p className="text-[11px] text-slate-400 mt-1">Estimated exam grading outcome by the JIT evaluation system.</p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Exit control */}
      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <button
          onClick={() => setSelectedModule('dashboard')}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
        >
          ← Exit Control Flow Panel
        </button>

        <button
          onClick={() => {
            if (progressPercent === 100) {
              handleMarkComplete('control-flow');
              toast.success("Congratulations! You have completed the C# Control Flow Module!");
            } else {
              toast.error(`Please complete all activities first. Current progress: ${progressPercent}%`);
            }
          }}
          className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          {completedCount > 1 ? "Track Completed ✓" : "Claim Control Flow Completion Badge"}
        </button>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// C# OBJECT-ORIENTED PROGRAMMING (OOP) INTERACTIVE DIGITAL CLASSROOM
// ═══════════════════════════════════════════════════════════
export function CSharpOOPDetail({ setSelectedModule, completedCount, handleMarkComplete, updateXP, xp }) {
  const [activeTab, setActiveTab] = useState('theory');
  
  // Analytics Telemetry States
  const [completedTopics, setCompletedTopics] = useState(() => {
    const saved = localStorage.getItem('cs_oop_completed');
    return saved ? JSON.parse(saved) : {};
  });
  const [labCompilesCount, setLabCompilesCount] = useState(() => {
    return parseInt(localStorage.getItem('cs_oop_compiles') || '0', 10);
  });
  
  // Code Lab Presets
  const presets = {
    classObj: {
      name: "Class & Object Declaration",
      code: `using System;\n\nclass House {\n    public string Color;\n    // Constructor\n    public House(string color) {\n        Color = color;\n    }\n    public void ShowDetails() {\n        Console.WriteLine($"This house has a beautiful {Color} color.");\n    }\n}\n\nclass Program {\n    static void Main() {\n        House myHouse = new House("Royal Blue");\n        myHouse.ShowDetails();\n    }\n}`
    },
    polymorphism: {
      name: "Polymorphism (Overrides)",
      code: `using System;\n\nclass Vehicle {\n    public virtual void StartEngine() {\n        Console.WriteLine("Vehicle engine is starting...");\n    }\n}\n\nclass Car : Vehicle {\n    public override void StartEngine() {\n        Console.WriteLine("Car engine roars to life silently (Electric)!");\n    }\n}\n\nclass Program {\n    static void Main() {\n        Vehicle v = new Car(); // Polymorphic call\n        v.StartEngine();\n    }\n}`
    },
    interfaces: {
      name: "Interfaces (Universal Charger)",
      code: `using System;\n\ninterface ICharger {\n    void ChargeDevice();\n}\n\nclass PhoneCharger : ICharger {\n    public void ChargeDevice() {\n        Console.WriteLine("Charging device with high-speed USB-C charging protocol.");\n    }\n}\n\nclass Program {\n    static void Main() {\n        ICharger charger = new PhoneCharger();\n        charger.ChargeDevice();\n    }\n}`
    }
  };
  
  const [code, setCode] = useState(presets.classObj.code);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [copilotMessage, setCopilotMessage] = useState('');
  const [copilotType, setCopilotType] = useState('info');

  // Interactive Visual Diagram States
  const [visualStep, setVisualStep] = useState(0);
  const [simBalance, setSimBalance] = useState(1000);
  const [simInputAmount, setSimInputAmount] = useState('200');
  
  // Stack and Heap memory model tracing step-by-step
  const memorySteps = [
    { step: 0, stack: "Args = null", heap: "Empty", desc: "Before initialization: No object resides on the heap. Stack frames are clean." },
    { step: 1, stack: "myHouse = 0x5FF1", heap: "0x5FF1: House { Color: 'Royal Blue' }", desc: "Object instantiated on the Heap with memory address 0x5FF1. Pointer variable resides on the Stack." },
    { step: 2, stack: "myHouse = 0x5FF1", heap: "0x5FF1: House { Color: 'Royal Blue' }", desc: "Method ShowDetails() is pushed onto the stack frame. Read reference color from heap address 0x5FF1." }
  ];

  // Code Explainer Line Highlight State
  const [explainerLine, setExplainerLine] = useState(null);
  const explainerLines = [
    { text: "House myHouse = new House(\"Royal Blue\");", desc: "Declares a reference variable 'myHouse' on the stack, allocates space for a new House object on the heap, executes its constructor, and binds the reference address." },
    { text: "public class House {", desc: "Defines the object blueprint, containing variables (fields) and functions (methods) representing state and behavior." },
    { text: "    public string Color; // Field", desc: "Field that stores the internal state value. In a production app, we would encapsulate this using a Property with getter/setter methods." },
    { text: "    public House(string color) {", desc: "Constructor method called immediately upon object creation. Initializes member fields with values." },
    { text: "        Color = color;", desc: "Binds the passed parameter to the object instance's color attribute." }
  ];
  
  // Interactive Practice States
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizAnswerChecked, setQuizAnswerChecked] = useState(false);
  const [droppedSlots, setDroppedSlots] = useState({ 0: null, 1: null });
  const [matchingSuccess, setMatchingSuccess] = useState(null);

  // Exam Writing Practice States
  const [examAnswer, setExamAnswer] = useState('');
  const [examTimer, setExamTimer] = useState(300); // 5 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [examGrading, setExamGrading] = useState(false);
  const [examResult, setExamResult] = useState(null);

  // Interview & Viva Telemetry
  const [activeInterviewIndex, setActiveInterviewIndex] = useState(0);
  const [interviewQuestions] = useState([
    { q: "What is the difference between Abstract Class and Interface in C#?", a: "Abstract classes can contain default implementations, fields, and constructors. Interfaces only describe contracts (though modern C# allows default interface methods), do not maintain instance fields, and support multiple inheritance since a C# class can implement multiple interfaces but only inherit from one base class." },
    { q: "Explain the four pillars of OOP.", a: "1. Encapsulation (hiding state using access modifiers and properties). 2. Abstraction (exposing only essential interfaces, hiding implementation details). 3. Inheritance (subclasses extending parent classes for reuse). 4. Polymorphism (providing multiple behaviors through virtual/override methods)." },
    { q: "What is the difference between Method Overloading and Method Overriding?", a: "Overloading happens at compile-time (same method name, different signatures). Overriding happens at runtime (re-defining base virtual method in a derived class using override keyword)." }
  ]);
  const [showInterviewAnswer, setShowInterviewAnswer] = useState(false);
  const [isRecordingViva, setIsRecordingViva] = useState(false);
  const [vivaResponse, setVivaResponse] = useState('');

  // Study Notes and Cheat Sheet
  const [notesList, setNotesList] = useState(() => {
    const saved = localStorage.getItem('cs_oop_notes');
    return saved ? JSON.parse(saved) : [
      { id: 1, color: '#fef08a', text: 'Tip: Prefer composition over inheritance to avoid tight coupling in class structures.' },
      { id: 2, color: '#bbf7d0', text: 'Interfaces should be highly segregated according to SOLID guidelines.' }
    ];
  });
  const [newNoteText, setNewNoteText] = useState('');
  const [noteColor, setNoteColor] = useState('#fef08a');
  const [cheatFilter, setCheatFilter] = useState('');

  // Save notes helper
  const saveNotes = (updated) => {
    setNotesList(updated);
    localStorage.setItem('cs_oop_notes', JSON.stringify(updated));
  };

  // Exam timer logic
  useEffect(() => {
    let interval = null;
    if (timerActive && examTimer > 0) {
      interval = setInterval(() => {
        setExamTimer((prev) => prev - 1);
      }, 1000);
    } else if (examTimer === 0) {
      setTimerActive(false);
      toast.error("Time is up! Exam auto-submitted.");
      handleSubmitExam();
    }
    return () => clearInterval(interval);
  }, [timerActive, examTimer]);

  // Save completed state to localstorage helper
  const markTopicComplete = (topicName, rewardXP) => {
    if (completedTopics[topicName]) {
      toast.success("Topic already completed! Keep exploring.");
      return;
    }
    const updated = { ...completedTopics, [topicName]: true };
    setCompletedTopics(updated);
    localStorage.setItem('cs_oop_completed', JSON.stringify(updated));
    updateXP(rewardXP);
    toast.success(`+${rewardXP} XP Earned for mastering ${topicName}!`);
  };

  // Compile runner simulation
  const handleExecuteCode = () => {
    setIsCompiling(true);
    setConsoleOutput(["[Compiler] Instantiating Roslyn C# compiler environment...", "[Compiler] Resolving references and class namespaces...", "[CLR] Creating heap instances..."]);
    
    setTimeout(() => {
      let output = [];
      if (code.includes("House")) {
        output = [
          "This house has a beautiful Royal Blue color.",
          "",
          "Process completed with exit code 0."
        ];
      } else if (code.includes("override")) {
        output = [
          "Car engine roars to life silently (Electric)!",
          "",
          "Process completed with exit code 0."
        ];
      } else if (code.includes("Universal Charger")) {
        output = [
          "Charging device with high-speed USB-C charging protocol.",
          "",
          "Process completed with exit code 0."
        ];
      } else {
        output = [
          "[Output] OOP application built successfully.",
          "Check OOP presets to inspect class instantiations."
        ];
      }
      setConsoleOutput(output);
      setIsCompiling(false);
      
      const newCompileCount = labCompilesCount + 1;
      setLabCompilesCount(newCompileCount);
      localStorage.setItem('cs_oop_compiles', newCompileCount.toString());
      
      if (newCompileCount === 1) {
        updateXP(50);
        toast.success("+50 XP: First C# OOP program execution!");
      }
    }, 1200);
  };

  const handleCopilotAction = (actionType) => {
    setCopilotType('info');
    if (actionType === 'explain') {
      setCopilotMessage("This class acts as a blueprint. Using the 'new' keyword creates a structural object on the heap, returns its memory reference, and triggers its constructor.");
    } else if (actionType === 'debug') {
      if (code.includes("class PhoneCharger : ICharger") && !code.includes("public void ChargeDevice")) {
        setCopilotType('debug');
        setCopilotMessage("Error: PhoneCharger implements interface ICharger but does not implement required interface method 'ChargeDevice'.");
      } else {
        setCopilotType('success');
        setCopilotMessage("UML structural compliance verified. Encapsulation levels look correct.");
      }
    } else if (actionType === 'optimize') {
      setCopilotMessage("Optimization: Expose properties (get; set;) rather than raw public fields. This preserves encapsulation.");
    }
  };

  // Drag and Drop Matcher logic
  const handleVerifyMatching = () => {
    if (droppedSlots[0] === 'override' && droppedSlots[1] === 'virtual') {
      setMatchingSuccess(true);
      markTopicComplete('OOP Syntax Matcher', 100);
    } else {
      setMatchingSuccess(false);
      toast.error("Incorrect syntax keywords. derived class overrides a virtual base method.");
    }
  };

  // Exam Practice Grading Simulator
  const handleSubmitExam = () => {
    if (!examAnswer.trim()) {
      toast.error("Please enter an answer before submitting.");
      return;
    }
    setExamGrading(true);
    setTimerActive(false);
    
    setTimeout(() => {
      const charCount = examAnswer.length;
      let score = 5;
      let feedback = [];
      
      if (examAnswer.toLowerCase().includes("contract") || examAnswer.toLowerCase().includes("multiple inheritance")) {
        score += 2;
        feedback.push("Good mention of interface contracts and solving multiple inheritance constraints.");
      } else {
        feedback.push("Discuss multiple inheritance behaviors to earn higher marks.");
      }
      
      if (examAnswer.toLowerCase().includes("default implementation") || examAnswer.toLowerCase().includes("constructor")) {
        score += 2;
        feedback.push("Excellent highlighting of abstract class constructor capabilities and state preservation.");
      } else {
        feedback.push("Include constructor characteristics of abstract classes for full marks.");
      }
      
      if (charCount > 250) score += 1;
      score = Math.min(score, 10);
      
      setExamResult({
        score,
        grade: score >= 9 ? 'A+' : score >= 7 ? 'A' : score >= 5 ? 'B' : 'F',
        feedback,
        corrections: charCount < 100 ? ["Add code examples of concrete class implementation."] : []
      });
      setExamGrading(false);
      markTopicComplete('10-Mark Exam Mode', 150);
    }, 2000);
  };

  // Mock Viva Voice Telemetry Simulation
  const handleStartVivaRecording = () => {
    setIsRecordingViva(true);
    toast.success("Recording mock voice signals...");
    
    setTimeout(() => {
      setIsRecordingViva(false);
      setVivaResponse("Encapsulation is the process of binding data variables and methods together into a single unit, usually a Class, and shielding access to inner states using private access modifiers and public properties.");
      markTopicComplete('Viva Voice Prep', 80);
      toast.success("Voice transcribed! Audio feedback analytics updated below.");
    }, 3000);
  };

  // Notebook handlers
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
      id: Date.now(),
      color: noteColor,
      text: newNoteText
    };
    const updated = [...notesList, newNote];
    saveNotes(updated);
    setNewNoteText('');
    toast.success("Sticky note pinned!");
  };

  const handleDeleteNote = (id) => {
    const updated = notesList.filter(n => n.id !== id);
    saveNotes(updated);
    toast.success("Note removed.");
  };

  const topicsToComplete = [
    'Theory Concepts', 
    'Memory Architecture Model', 
    'Roslyn Code Execution', 
    'OOP Syntax Matcher', 
    '10-Mark Exam Mode', 
    'Viva Voice Prep'
  ];
  
  const completedList = Object.keys(completedTopics).filter(k => completedTopics[k]);
  const progressPercent = Math.round((completedList.length / topicsToComplete.length) * 100);

  return (
    <div className="space-y-6">
      
      {/* ──────────────── PREMIUM HERO SECTION ──────────────── */}
      <div className="relative overflow-hidden p-6 sm:p-8 cs-fun-dark-card border border-white/10 rounded-[32px] text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] uppercase font-bold tracking-widest rounded-full">
                Intermediate Track
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] uppercase font-bold tracking-widest rounded-full flex items-center gap-1">
                <Flame size={10} className="text-orange-400" /> +380 XP Total
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              C# OOP Concepts
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Build scalable and reusable applications using objects and classes. Master classes, encapsulation, inheritance polymorphism, abstractions, and SOLID design patterns.
            </p>
            
            <div className="flex items-center gap-4 pt-2">
              <button 
                onClick={() => {
                  markTopicComplete('Theory Concepts', 50);
                  setActiveTab('visuals');
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <Zap size={14} /> Start UML Visualizer
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Time Est: </span>
                <span className="text-xs text-white font-bold">4.5 Hours</span>
              </div>
            </div>
          </div>

          {/* Gamified Meter Card */}
          <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl w-full md:w-80 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Track Completion</span>
              <span className="text-blue-400 font-extrabold">{progressPercent}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-center pt-1">
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 block">Mastery Score</span>
                <strong className="text-sm text-white">{completedList.length}/{topicsToComplete.length}</strong>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 block">Total XP Gained</span>
                <strong className="text-sm text-purple-400 font-extrabold">+{completedList.length * 50} XP</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── 12 TABS INTERACTIVE NAVIGATION MENU ──────────────── */}
      <div className="flex items-center overflow-x-auto pb-2 border-b border-white/10 gap-1.5 scrollbar-thin scrollbar-thumb-white/10">
        {[
          { id: 'theory', label: 'Theory & Logic', icon: BookOpen },
          { id: 'visuals', label: 'Visuals & Analogy', icon: Layers },
          { id: 'codelab', label: 'Roslyn Code Lab', icon: Code },
          { id: 'explainer', label: 'Code Explainer', icon: Eye },
          { id: 'practice', label: 'Practice & Quizzes', icon: CheckCircle },
          { id: 'exam', label: 'Exam Mode (10M)', icon: Award },
          { id: 'pyqs', label: 'PYQs (University)', icon: FileText },
          { id: 'interview', label: 'Interview Prep', icon: HelpCircle },
          { id: 'viva', label: 'Viva Voice Simulation', icon: Volume2 },
          { id: 'notes', label: 'Study Sticky Notes', icon: Edit3 },
          { id: 'cheatsheet', label: 'Quick Cheat Sheet', icon: Clipboard },
          { id: 'analytics', label: 'Telemetry Analytics', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                  : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ──────────────── TAB WORKSPACE CONTAINERS ──────────────── */}
      <div className="min-h-[450px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="w-full"
          >
            
            {/* 1. THEORY TAB */}
            {activeTab === 'theory' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 space-y-6">
                  {/* Detailed Description */}
                  <div className="cs-fun-card space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Academic Theory Overview</span>
                      <button 
                        onClick={() => markTopicComplete('Theory Concepts', 50)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          completedTopics['Theory Concepts'] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                        }`}
                      >
                        {completedTopics['Theory Concepts'] ? '✓ Mastered' : 'Mark Topic Mastered'}
                      </button>
                    </div>
                    <h2 className="text-xl font-bold text-white">Understand Object-Oriented Programming (OOP)</h2>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Object-Oriented Programming is a software paradigm centered around **Objects**—instances containing data properties (fields/properties) and function codes (methods).
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      C# is a fully object-oriented language. Everything must reside within a class. OOP simplifies complex code management through four core tenants: **Encapsulation** (shielding state), **Abstraction** (contract structures), **Inheritance** (reusability hierarchies), and **Polymorphism** (dynamic behavior overrides).
                    </p>

                    <div className="border-t border-white/5 pt-4">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Real-Life Analogy</h4>
                      <div className="cs-fun-inner-card">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          <strong>House Blueprint vs Built House:</strong> A Class is like a blueprint drawn on paper. It holds details but you cannot live in it. An Object is the actual house built from that blueprint. The constructor is the foundation work. Encapsulation is the outer wall hiding inner wire pipes (internal fields).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Advantages & Disadvantages Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                      <strong className="text-xs text-emerald-400 uppercase tracking-wider block mb-2">OOP Design Pros</strong>
                      <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                        <li>Encapsulation prevents global variables from corrupting system states.</li>
                        <li>Polymorphism helps swap implementation algorithms without rewriting callers.</li>
                        <li>Promotes modular, dry (Don't Repeat Yourself) components.</li>
                      </ul>
                    </div>
                    <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                      <strong className="text-xs text-rose-400 uppercase tracking-wider block mb-2">Common Criticisms</strong>
                      <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                        <li>Slight performance overhead due to virtual tables lookup (Polymorphism).</li>
                        <li>Over-engineered nesting hierarchies lead to tight class coupling.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Technical Sidepanel */}
                <div className="space-y-6">
                  <div className="cs-fun-card space-y-4">
                    <strong className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Core Pillars</strong>
                    
                    <div className="space-y-3">
                      <div className="cs-fun-inner-card flex justify-between items-center">
                        <span className="text-xs text-slate-400">Encapsulation</span>
                        <span className="text-xs font-bold text-white">Access Modifiers & Properties</span>
                      </div>
                      <div className="cs-fun-inner-card flex justify-between items-center">
                        <span className="text-xs text-slate-400">Abstraction</span>
                        <span className="text-xs font-bold text-emerald-400">Abstract classes & Interfaces</span>
                      </div>
                      <div className="cs-fun-inner-card flex justify-between items-center">
                        <span className="text-xs text-slate-400">Polymorphism</span>
                        <span className="text-xs font-bold text-white">virtual / override overrides</span>
                      </div>
                    </div>
                  </div>

                  <div className="cs-fun-card text-center space-y-3">
                    <span className="text-2xl block">💡</span>
                    <h4 className="text-sm font-bold text-white">Garbage Collection (GC)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Unlike C/C++, C# uses an automatic garbage collector. It periodically runs in the CLR to free heap objects that have lost all reference pointers.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. VISUALS & ANALOGY TAB */}
            {activeTab === 'visuals' && (
              <div className="space-y-6 text-left">
                
                {/* UML Object Instantiation Stepper */}
                <div className="cs-fun-card space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">Step-by-Step Memory Reference Tracing</h3>
                      <p className="text-xs text-slate-400 mt-1">Simulate instantiating a House class, trace stack reference assignment, and track heap structures.</p>
                    </div>
                    <button 
                      onClick={() => markTopicComplete('Memory Architecture Model', 80)}
                      className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs rounded-lg font-bold"
                    >
                      Unlock memory badge
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Controls */}
                    <div className="md:col-span-4 space-y-4 cs-fun-inner-card text-xs">
                      <strong className="text-xs text-white block uppercase font-bold">Memory Instantiation steps:</strong>
                      <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5 font-mono text-[11px] text-white">
                        <span>Current Frame:</span>
                        <span>Step {visualStep + 1} of 3</span>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          disabled={visualStep === 0}
                          onClick={() => setVisualStep(prev => prev - 1)}
                          className="flex-1 py-2 bg-slate-900 border border-white/10 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg font-bold text-xs"
                        >
                          ← Prev State
                        </button>
                        <button 
                          disabled={visualStep === 2}
                          onClick={() => setVisualStep(prev => prev + 1)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs"
                        >
                          Next State →
                        </button>
                      </div>
                    </div>

                    {/* Stack vs Heap visualizer */}
                    <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Code Execution Marker */}
                      <div className="p-4 cs-fun-dark-card border rounded-xl flex flex-col justify-between text-[11px] font-mono">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Execution Line:</span>
                        <div className="space-y-1.5 pt-3">
                          <div className={visualStep === 0 ? 'text-purple-400 font-bold bg-white/5 p-1 rounded' : 'text-slate-500'}>{"House myHouse;"}</div>
                          <div className={visualStep === 1 ? 'text-blue-400 font-bold bg-white/5 p-1 rounded' : 'text-slate-500'}>{"myHouse = new House(\"Royal Blue\");"}</div>
                          <div className={visualStep === 2 ? 'text-emerald-400 font-bold bg-white/5 p-1 rounded' : 'text-slate-500'}>{"myHouse.ShowDetails();"}</div>
                        </div>
                      </div>

                      {/* Stack Segment */}
                      <div className="p-4 cs-fun-dark-card border rounded-xl space-y-2">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Stack Variable:</span>
                        <div className="font-mono text-xs text-purple-300 pt-2">
                          <strong className="text-[10px] text-slate-500 block uppercase">Reference registers:</strong>
                          {memorySteps[visualStep].stack}
                        </div>
                      </div>

                      {/* Heap Segment */}
                      <div className="p-4 cs-fun-dark-card border rounded-xl space-y-2">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Heap Memory:</span>
                        <div className="font-mono text-[10px] text-emerald-300 pt-2">
                          <strong className="text-[10px] text-slate-500 block uppercase">Allocated instances:</strong>
                          {memorySteps[visualStep].heap}
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="p-4 cs-fun-inner-card text-xs text-slate-400 leading-relaxed border-t border-white/5">
                    <strong>Technical explanation: </strong> {memorySteps[visualStep].desc}
                  </div>
                </div>

                {/* Bank Account Object Simulation */}
                <div className="cs-fun-card space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Interactive Encapsulation Simulator</h3>
                    <p className="text-xs text-slate-400 mt-1">Interact with a BankAccount class instance. Deposit/Withdraw funds using encapsulated methods, preventing direct variable corruption.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 cs-fun-inner-card space-y-4">
                      <strong className="text-xs text-white block uppercase">Invoke Encapsulated Methods</strong>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Transaction Value ($)</label>
                          <input 
                            type="number"
                            value={simInputAmount}
                            onChange={(e) => setSimInputAmount(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const amt = parseFloat(simInputAmount);
                              if (isNaN(amt) || amt <= 0) {
                                toast.error("Enter a valid deposit amount.");
                                return;
                              }
                              setSimBalance(prev => prev + amt);
                              toast.success(`Deposited $${amt} via public Deposit() method.`);
                            }}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                          >
                            Deposit()
                          </button>
                          <button
                            onClick={() => {
                              const amt = parseFloat(simInputAmount);
                              if (isNaN(amt) || amt <= 0) {
                                toast.error("Enter a valid withdrawal amount.");
                                return;
                              }
                              if (amt > simBalance) {
                                toast.error("Declined: Insufficient balance state.");
                                return;
                              }
                              setSimBalance(prev => prev - amt);
                              toast.success(`Withdrew $${amt} via public Withdraw() method.`);
                            }}
                            className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold"
                          >
                            Withdraw()
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 p-5 cs-fun-dark-card border rounded-2xl flex flex-col justify-between">
                      <strong className="text-xs text-slate-500 block uppercase">Object Instance Schema in Memory</strong>
                      
                      <div className="font-mono text-xs space-y-2 py-4">
                        <div><span className="text-purple-400">class</span> <span className="text-white">BankAccount</span> {"{"}</div>
                        <div className="pl-4 text-slate-500">{"// Private fields - Shielded from direct writes!"}</div>
                        <div className="pl-4"><span className="text-blue-400">private double</span> _balance = <span className="text-emerald-400 font-bold">${simBalance.toFixed(2)}</span>;</div>
                        <br/>
                        <div className="pl-4 text-slate-500">{"// Public property - Exposes read-only access"}</div>
                        <div className="pl-4"><span className="text-blue-400">public double</span> Balance {"=>"} _balance;</div>
                        <div>{"}"}</div>
                      </div>

                      <span className="text-[10px] text-slate-500">Encapsulation allows public actions (Deposit/Withdraw) while keeping the raw balance variable private to protect data integrity.</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 3. CODE LAB TAB */}
            {activeTab === 'codelab' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Editor container */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="p-4 cs-fun-card flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Roslyn Compiler OOP Playground</span>
                    
                    <div className="flex items-center gap-2">
                      <select 
                        onChange={(e) => setCode(presets[e.target.value].code)}
                        className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="classObj">Class & Object Declaration</option>
                        <option value="polymorphism">Polymorphism (Overrides)</option>
                        <option value="interfaces">Interfaces (Universal Charger)</option>
                      </select>

                      <button 
                        onClick={() => {
                          setCode(presets.classObj.code);
                          setConsoleOutput([]);
                        }}
                        className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                        title="Reset code editor"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full h-80 p-4 font-mono text-xs cs-fun-dark-card text-emerald-400 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
                    />
                    
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      <button
                        onClick={() => handleCopilotAction('explain')}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 rounded border border-white/5 cursor-pointer"
                      >
                        💡 AI Explain
                      </button>
                      <button
                        onClick={() => handleCopilotAction('debug')}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 rounded border border-white/5 cursor-pointer"
                      >
                        🔧 AI Debug
                      </button>
                      <button
                        onClick={() => handleCopilotAction('optimize')}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 rounded border border-white/5 cursor-pointer"
                      >
                        ⚡ AI Optimize
                      </button>
                    </div>
                  </div>

                  {/* Executes */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">Ctrl+Enter to compile and run</span>
                    
                    <button
                      onClick={handleExecuteCode}
                      disabled={isCompiling}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      {isCompiling ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play size={13} />
                          Execute Blueprint
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Output & AI Copilot info */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Console Log screen */}
                  <div className="p-5 cs-fun-dark-card border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Terminal size={11} /> C# Console output
                      </span>
                      <button 
                        onClick={() => setConsoleOutput([])}
                        className="text-[9px] text-slate-500 hover:text-white uppercase"
                      >
                        Clear log
                      </button>
                    </div>

                    <div className="font-mono text-[11px] text-slate-300 space-y-1 min-h-[140px] max-h-[160px] overflow-y-auto">
                      {consoleOutput.length === 0 ? (
                        <div className="text-slate-600 text-center pt-8">Click "Execute Blueprint" to trace instantiations.</div>
                      ) : (
                        consoleOutput.map((line, idx) => (
                          <div 
                            key={idx} 
                            className={
                              line.startsWith('[Compiler]') ? 'text-indigo-400' :
                              line.startsWith('[CLR]') ? 'text-purple-400' :
                              line.startsWith('[Output]') ? 'text-slate-400 font-bold' :
                              'text-emerald-400'
                            }
                          >
                            {line}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* AI Copilot Panel */}
                  <div className="p-5 cs-fun-card border border-indigo-500/20 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                      <BrainCircuit size={14} /> AI Copilot Helper
                    </span>

                    {copilotMessage ? (
                      <div className={`p-3 rounded-xl text-xs leading-relaxed border ${
                        copilotType === 'debug' ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300' :
                        copilotType === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' :
                        'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-300'
                      }`}>
                        {copilotMessage}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Use the Copilot assistant buttons inside the editor for fast, real-time code explanations, syntax checks, and optimizations.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. CODE EXPLAINER TAB */}
            {activeTab === 'explainer' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                {/* Program code lines to click */}
                <div className="lg:col-span-2 p-6 cs-fun-dark-card border border-white/10 rounded-3xl space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Line-by-Line Object Allocation</h3>
                    <p className="text-xs text-slate-400 mt-1">Select any line of the C# blueprint definition below to trace execution path, memory allocations, and constructors.</p>
                  </div>

                  <div className="font-mono text-xs space-y-1 cs-fun-dark-card p-4 border border-white/5 overflow-x-auto select-none">
                    {explainerLines.map((line, idx) => (
                      <div
                        key={idx}
                        onClick={() => setExplainerLine(idx)}
                        className={`p-2 rounded-lg cursor-pointer transition-all flex gap-3 items-center ${
                          explainerLine === idx 
                            ? 'bg-blue-600/30 border border-blue-500/50 text-white' 
                            : 'hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <span className="w-5 text-slate-600 text-right">{idx + 1}</span>
                        <pre className="font-mono m-0 flex-1 whitespace-pre-wrap">{line.text || " "}</pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation text card */}
                <div className="p-6 cs-fun-card space-y-4 flex flex-col justify-center min-h-[300px]">
                  {explainerLine === null ? (
                    <div className="text-center space-y-2">
                      <span className="text-2xl">👉</span>
                      <strong className="text-xs text-slate-400 block font-bold">Select a code line on the left to begin memory analysis.</strong>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded">
                          Line {explainerLine + 1}
                        </span>
                        <span className="text-xs text-slate-500 font-bold uppercase">C# OOP Memory Analysis</span>
                      </div>
                      
                      <h4 className="text-sm font-bold font-mono cs-fun-inner-card p-2.5 rounded border">
                        {explainerLines[explainerLine].text || "[Empty Space]"}
                      </h4>
                      
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {explainerLines[explainerLine].desc}
                      </p>

                      <div className="border-t border-white/5 pt-3">
                        <button
                          onClick={() => {
                            markTopicComplete('Roslyn Code Execution', 50);
                            setExplainerLine(null);
                          }}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition"
                        >
                          I understand this line!
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. PRACTICE & QUIZ TAB */}
            {activeTab === 'practice' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Topic Assessment Multiple Choice */}
                <div className="lg:col-span-7 p-6 cs-fun-card space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Multiple Choice Checkpoint</span>
                  <h3 className="text-base font-bold text-white">Which access modifier limits member access exclusively to the defining class and its subclasses?</h3>
                  
                  <div className="space-y-2">
                    {[
                      { text: "private", correct: false },
                      { text: "protected", correct: true },
                      { text: "internal", correct: false },
                      { text: "public", correct: false }
                    ].map((opt, idx) => {
                      const isSelected = selectedQuizOption === idx;
                      return (
                        <button
                          key={idx}
                          disabled={quizAnswerChecked}
                          onClick={() => setSelectedQuizOption(idx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition ${
                            quizAnswerChecked
                              ? opt.correct 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                : isSelected 
                                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                  : 'bg-white/5 border-transparent text-slate-500'
                              : isSelected
                                ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>

                  {!quizAnswerChecked ? (
                    <button
                      onClick={() => {
                        if (selectedQuizOption === null) {
                          toast.error("Please select an answer.");
                          return;
                        }
                        setQuizAnswerChecked(true);
                        if (selectedQuizOption === 1) {
                          updateXP(40);
                          toast.success("+40 XP: Correct Answer!");
                        } else {
                          toast.error("Incorrect. Let's study the answer.");
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Submit Evaluation Answer
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-slate-400">
                        {selectedQuizOption === 1 
                          ? "Correct! The 'protected' keyword makes a member accessible within its class and by derived class instances."
                          : "Remember, 'private' blocks derived classes completely, and 'internal' limits access to files in the same assembly."
                        }
                      </p>
                      <button
                        onClick={() => {
                          setSelectedQuizOption(null);
                          setQuizAnswerChecked(false);
                        }}
                        className="px-3 py-1.5 bg-white/5 text-slate-300 text-[10px] font-bold rounded hover:bg-white/10"
                      >
                        Retry Quiz
                      </button>
                    </div>
                  )}
                </div>

                {/* Drag and Drop Syntax Matcher */}
                <div className="lg:col-span-5 p-6 cs-fun-card space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">UML syntax matcher</span>
                  <h3 className="text-xs text-slate-300 leading-relaxed">
                    Assemble keywords to implement runtime polymorphic overrides.
                  </h3>

                  {/* Variable equations to place tokens in */}
                  <div className="space-y-3 pt-2 text-xs font-mono">
                    <div className="flex items-center gap-2 p-3 cs-fun-inner-card">
                      <span className="text-slate-400">class Child : Parent {"{"}</span>
                    </div>

                    <div className="flex items-center gap-2 p-3 cs-fun-inner-card">
                      <span className="text-slate-400">public</span>
                      <button
                        onClick={() => setDroppedSlots({ ...droppedSlots, 0: null })}
                        className="w-20 h-7 rounded border border-dashed border-white/20 flex items-center justify-center text-[10px] bg-slate-900 text-purple-400 font-bold"
                      >
                        {droppedSlots[0] || "[Slot 1]"}
                      </button>
                      <span className="text-slate-400">void GetInfo() {"{"} ... {"}"}</span>
                    </div>

                    <div className="flex items-center gap-2 p-3 cs-fun-inner-card">
                      <span className="text-slate-400">{"// Base method was: public"}</span>
                      <button
                        onClick={() => setDroppedSlots({ ...droppedSlots, 1: null })}
                        className="w-20 h-7 rounded border border-dashed border-white/20 flex items-center justify-center text-[10px] bg-slate-900 text-blue-400 font-bold"
                      >
                        {droppedSlots[1] || "[Slot 2]"}
                      </button>
                      <span className="text-slate-400">void GetInfo()</span>
                    </div>
                  </div>

                  {/* Items bin */}
                  <div className="flex gap-2 flex-wrap pt-2">
                    {['override', 'virtual', 'abstract', 'sealed'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          if (droppedSlots[0] === null) {
                            setDroppedSlots({ ...droppedSlots, 0: item });
                          } else if (droppedSlots[1] === null) {
                            setDroppedSlots({ ...droppedSlots, 1: item });
                          } else {
                            toast.error("Slots are full! Click a slot to empty it.");
                          }
                        }}
                        className="px-3 py-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded text-[11px] font-mono border border-slate-200 dark:border-white/5"
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setDroppedSlots({ 0: null, 1: null })}
                      className="text-[10px] text-slate-500 hover:text-white uppercase font-bold"
                    >
                      Clear slots
                    </button>

                    <button
                      onClick={handleVerifyMatching}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-xl cursor-pointer"
                    >
                      Verify matching
                    </button>
                  </div>

                  {matchingSuccess !== null && (
                    <div className={`p-3 rounded-xl text-center text-xs font-bold ${
                      matchingSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {matchingSuccess ? "🎉 Matching Success! +100 XP!" : "❌ Error: A derived override matches a virtual base method."}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. EXAM WRITING MODE TAB */}
            {activeTab === 'exam' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Writing board */}
                <div className="lg:col-span-7 p-6 cs-fun-card space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div>
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">University Semester Exam Module</span>
                      <h3 className="text-sm font-bold text-white mt-1">Q: Contrast Abstract Classes vs Interfaces in C#. Detail the architectural use-cases. (10 Marks)</h3>
                    </div>
                    
                    {/* Timer */}
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5">
                      <Clock size={12} className="text-red-400 animate-pulse" />
                      <span className="text-xs font-mono text-white font-bold">
                        {Math.floor(examTimer / 60)}:{(examTimer % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => setTimerActive(!timerActive)}
                        className="p-0.5 hover:bg-white/5 rounded"
                      >
                        {timerActive ? <Pause size={10} /> : <Play size={10} />}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={examAnswer}
                    onChange={(e) => setExamAnswer(e.target.value)}
                    placeholder="Enter your university level description answer here (explain interface contracts, abstract default members, inheritance constraints, constructors, multiple implementations, etc.)...."
                    className="w-full h-64 p-4 text-xs bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed"
                  />

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setExamTimer(300)}
                      className="text-[10px] text-slate-500 hover:text-white uppercase font-bold"
                    >
                      Reset Timer
                    </button>

                    <button
                      onClick={handleSubmitExam}
                      disabled={examGrading}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      {examGrading ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          AI Grading...
                        </>
                      ) : (
                        "Submit Answer for AI Grading"
                      )}
                    </button>
                  </div>
                </div>

                {/* Score panel / AI Evaluator */}
                <div className="lg:col-span-5 space-y-6">
                  {examResult === null ? (
                    <div className="p-6 cs-fun-card h-full flex flex-col justify-center text-center space-y-3 min-h-[300px]">
                      <span className="text-3xl">📋</span>
                      <h4 className="text-sm font-bold text-white">AI Examiner waiting for submission...</h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Submit your text explanation. The AI system evaluates key terms, syntax depth, and references to verify concepts correctness.
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 cs-fun-card space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Scorecard Metrics</span>
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-black rounded-lg border border-purple-500/20">
                          Grade {examResult.grade}
                        </span>
                      </div>

                      <div className="text-center py-2">
                        <strong className="text-4xl font-extrabold text-white">{examResult.score}</strong>
                        <span className="text-slate-500 text-xs font-semibold"> / 10 Marks</span>
                      </div>

                      <div className="space-y-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">AI Evaluator Feedback:</span>
                        {examResult.feedback.map((fb, idx) => (
                          <div key={idx} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                            <span className="text-emerald-400">✓</span>
                            <span>{fb}</span>
                          </div>
                        ))}
                      </div>

                      {/* Side-by-side comparison */}
                      <div className="border-t border-white/5 pt-4">
                        <strong className="text-xs font-bold text-white block mb-1.5">Model Answer Reference:</strong>
                        <div className="p-3 bg-white/5 rounded-xl text-[10px] text-slate-400 leading-relaxed font-mono max-h-36 overflow-y-auto">
                          <strong>Abstract Class:</strong> Can contain constructors and state fields. Limits derived classes to single inheritance.<br/><br/>
                          <strong>Interface:</strong> Strict behavior contract. Supports multiple implementation chains, serving as a universal connector API.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. PREVIOUS YEAR QUESTIONS (PYQs) TAB */}
            {activeTab === 'pyqs' && (
              <div className="p-6 cs-fun-card text-left space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Previous Year University Questions</h3>
                  <p className="text-xs text-slate-400 mt-1">Examine authentic board and term exam questions covering C# OOP class architectures.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { marks: "2 Marks", q: "Define a constructor in C# and its main purpose.", a: "A constructor is a special member method of a class carrying the exact class name. It executes automatically during object instantiation (via the new keyword) to allocate and initialize heap field values." },
                    { marks: "5 Marks", q: "Distinguish between Encapsulation and Abstraction.", a: "Encapsulation wraps state fields and logic methods into a single class entity, hiding variable data access via modifiers. Abstraction exposes high-level behaviors while concealing implementation details behind abstract classes or interfaces." },
                    { marks: "10 Marks", q: "Explain Polymorphism in C#. Differentiate static polymorphism from dynamic polymorphism with code models.", a: "Static polymorphism resolves method signatures at compile time via method overloading. Dynamic polymorphism resolves classes at runtime using virtual base methods overridden in derived subclasses using override keywords." }
                  ].map((pyq, idx) => (
                    <div key={idx} className="p-4 cs-fun-inner-card space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded">
                          {pyq.marks}
                        </span>
                        <span className="text-xs font-bold text-white">{pyq.q}</span>
                      </div>
                      <p className="text-xs text-slate-400 pl-4 border-l border-white/10 leading-relaxed">
                        <strong className="text-slate-300 text-[10px] block uppercase font-bold mb-1">Standard Solution Model:</strong>
                        {pyq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. INTERVIEW PREP TAB */}
            {activeTab === 'interview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 p-6 cs-fun-card space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">C# Interview Prep Cards</span>
                    <span className="text-xs text-slate-400 font-bold">
                      Question {activeInterviewIndex + 1} of {interviewQuestions.length}
                    </span>
                  </div>

                  {/* Active Question Panel */}
                  <div className="p-6 cs-fun-dark-card rounded-2xl border border-white/5 min-h-[160px] flex flex-col justify-center">
                    <h3 className="text-base font-bold text-white text-center">
                      {interviewQuestions[activeInterviewIndex].q}
                    </h3>
                  </div>

                  {/* Reveal Answers */}
                  {showInterviewAnswer && (
                    <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-2xl text-xs text-slate-300 leading-relaxed animate-fadeIn">
                      <strong className="text-blue-400 block mb-1 uppercase font-bold text-[10px]">AI Reference Answer:</strong>
                      {interviewQuestions[activeInterviewIndex].a}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setShowInterviewAnswer(!showInterviewAnswer)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl text-slate-300 cursor-pointer"
                    >
                      {showInterviewAnswer ? "Hide Answer" : "Reveal Answer"}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowInterviewAnswer(false);
                          setActiveInterviewIndex((prev) => (prev > 0 ? prev - 1 : interviewQuestions.length - 1));
                        }}
                        className="px-3 py-1.5 bg-slate-900 border border-white/10 text-xs font-bold rounded-lg text-white"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => {
                          setShowInterviewAnswer(false);
                          setActiveInterviewIndex((prev) => (prev < interviewQuestions.length - 1 ? prev + 1 : 0));
                        }}
                        className="px-3 py-1.5 bg-slate-900 border border-white/10 text-xs font-bold rounded-lg text-white"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-6 cs-fun-card flex flex-col justify-center space-y-3">
                  <span className="text-3xl text-center">💼</span>
                  <h4 className="text-sm font-bold text-white text-center">Interviewer Focus Tips</h4>
                  <p className="text-xs text-slate-500 leading-relaxed text-left">
                    Expect intermediate scenario-based coding assignments asking you to implement the Open-Closed Principle (OCP) or Liskov Substitution Principle (LSP) using interfaces.
                  </p>
                </div>
              </div>
            )}

            {/* 9. VIVA QUESTIONS TAB */}
            {activeTab === 'viva' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 p-6 cs-fun-card space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white font-black">Viva Oral Q&A Simulator</h3>
                    <p className="text-xs text-slate-400 mt-1">Answer the viva question below aloud to simulate oral examination conditions.</p>
                  </div>

                  {/* Active Question */}
                  <div className="p-4 cs-fun-dark-card rounded-xl border border-white/5">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Examiner Oral Question:</span>
                    <strong className="text-sm text-white block mt-1.5">"Why does C# disallow multiple inheritance for classes, and how do Interfaces solve this architectural limitation?"</strong>
                  </div>

                  {/* Waveform graphic animation */}
                  {isRecordingViva && (
                    <div className="py-6 flex items-center justify-center gap-1.5">
                      {[1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                        <span 
                          key={i} 
                          className="w-1 bg-purple-500 rounded-full animate-pulse"
                          style={{ height: `${h * 4}px`, animationDelay: `${i * 0.05}s` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Voice capture trigger */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleStartVivaRecording}
                      disabled={isRecordingViva}
                      className={`px-6 py-3 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
                        isRecordingViva ? 'bg-red-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      <Volume2 size={14} className={isRecordingViva ? 'animate-bounce' : ''} />
                      {isRecordingViva ? 'Speaking...' : 'Start Mock Speech Recording'}
                    </button>
                  </div>

                  {vivaResponse && (
                    <div className="p-4 cs-fun-inner-card text-xs space-y-2 animate-fadeIn">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Transcribed Voice:</span>
                      <p className="text-slate-300 italic">"{vivaResponse}"</p>
                      
                      <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-bold">Concept coverage: 95% Match</span>
                        <span className="text-slate-500">Structured Response</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Telemetry metrics */}
                <div className="p-6 cs-fun-card space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Voice telemetry metrics</span>
                  
                  <div className="space-y-3 text-xs">
                    <div className="p-3 cs-fun-inner-card flex justify-between">
                      <span className="text-slate-400">Speech Clarity</span>
                      <strong className="text-white">Exceptional (97%)</strong>
                    </div>
                    <div className="p-3 cs-fun-inner-card flex justify-between">
                      <span className="text-slate-400">Logical Depth</span>
                      <strong className="text-emerald-400">95/100 Marks</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 10. STUDY STICKY NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="space-y-6 text-left">
                <div className="p-6 cs-fun-card space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Study Notes Notebook</h3>
                    <p className="text-xs text-slate-400 mt-1">Keep temporary summaries, syntax snippets, and study warnings. Syncs instantly to browser storage.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Type a new revision note card details..."
                      className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500/50"
                    />

                    <div className="flex items-center gap-2">
                      {['#fef08a', '#bfdbfe', '#bbf7d0', '#fbcfe8'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setNoteColor(c)}
                          className="w-6 h-6 rounded-full border border-white/10"
                          style={{ 
                            backgroundColor: c, 
                            transform: noteColor === c ? 'scale(1.2)' : 'none',
                            outline: noteColor === c ? '2px solid white' : 'none'
                          }}
                        />
                      ))}

                      <button
                        onClick={handleAddNote}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save size={12} /> Pin Note
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sticky notes list grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {notesList.map((note) => (
                    <div 
                      key={note.id} 
                      className="p-5 rounded-2xl shadow-lg flex flex-col justify-between min-h-[140px] text-slate-900 relative"
                      style={{ backgroundColor: note.color }}
                    >
                      <p className="text-xs font-medium leading-relaxed">
                        {note.text}
                      </p>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-black/5 mt-3">
                        <span className="text-[9px] opacity-60">Personal study pin</span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 hover:bg-black/10 rounded text-slate-700 hover:text-red-700 transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 11. QUICK CHEAT SHEET TAB */}
            {activeTab === 'cheatsheet' && (
              <div className="p-6 cs-fun-card text-left space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">UML & OOP Syntax Cheat Sheet</h3>
                    <p className="text-xs text-slate-400 mt-1">Quick syntax summaries for constructors, modifiers, and access guidelines.</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search keywords (e.g. interface, static)..."
                    value={cheatFilter}
                    onChange={(e) => setCheatFilter(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500/50 w-full sm:w-64"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Syntax reference */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">Core OOP Syntax</span>
                    <div className="overflow-x-auto rounded-xl border border-white/15">
                      <table className="w-full text-xs text-slate-300">
                        <thead className="bg-slate-950 text-white font-bold border-b border-white/15">
                          <tr>
                            <th className="p-2.5 text-left">Concept</th>
                            <th className="p-2.5 text-left">C# Syntax Example</th>
                            <th className="p-2.5 text-left">Key Property</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {[
                            { name: "Class Decl", example: "class Dog : Animal { }", prop: "Inherits Animal" },
                            { name: "Constructor", example: "public Dog(string name) : base(name) { }", prop: "Triggers parent constructor" },
                            { name: "Property", example: "public string Name { get; set; }", prop: "Auto properties" },
                            { name: "Interface", example: "interface IUniversal { void Connect(); }", prop: "Describe contract" }
                          ].filter(row => 
                            row.name.toLowerCase().includes(cheatFilter.toLowerCase()) ||
                            row.prop.toLowerCase().includes(cheatFilter.toLowerCase())
                          ).map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02]">
                              <td className="p-2.5 font-bold text-white">{row.name}</td>
                              <td className="p-2.5 font-mono text-[10px] text-purple-300">{row.example}</td>
                              <td className="p-2.5 text-slate-400">{row.prop}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Access Modifier syntax table */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block">Access Modifiers</span>
                    <div className="overflow-x-auto rounded-xl border border-white/15">
                      <table className="w-full text-xs text-slate-300">
                        <thead className="bg-slate-950 text-white font-bold border-b border-white/15">
                          <tr>
                            <th className="p-2.5 text-left">Modifier</th>
                            <th className="p-2.5 text-left">Usage Range</th>
                            <th className="p-2.5 text-left">Safety Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {[
                            { name: "public", example: "Accessible everywhere", prop: "No restriction" },
                            { name: "private", example: "Defining class only", prop: "Maximum privacy" },
                            { name: "protected", example: "Class and subclass derived chains", prop: "Encapsulation safe" },
                            { name: "internal", example: "Same assembly compilation output", prop: "Project restricted" }
                          ].filter(row => 
                            row.name.toLowerCase().includes(cheatFilter.toLowerCase())
                          ).map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02]">
                              <td className="p-2.5 font-bold text-white">{row.name}</td>
                              <td className="p-2.5 font-mono text-[10px] text-purple-300">{row.example}</td>
                              <td className="p-2.5 text-slate-400">{row.prop}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 12. TELEMETRY ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                <div className="p-5 cs-fun-card">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Compiler Runs</span>
                  <strong className="text-3xl text-white block mt-2">{labCompilesCount} Runs</strong>
                  <p className="text-[11px] text-slate-400 mt-1">Total Roslyn execution cycles tracked in active session.</p>
                </div>

                <div className="p-5 cs-fun-card">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Topics Mastered</span>
                  <strong className="text-3xl text-blue-400 block mt-2">{completedList.length} / {topicsToComplete.length}</strong>
                  <p className="text-[11px] text-slate-400 mt-1">Percentage completion: {progressPercent}% of syllabus metrics.</p>
                </div>

                <div className="p-5 cs-fun-card">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Evaluation Accuracy</span>
                  <strong className="text-3xl text-purple-400 block mt-2">
                    {matchingSuccess === true ? "100%" : matchingSuccess === false ? "0%" : "Not Tested"}
                  </strong>
                  <p className="text-[11px] text-slate-400 mt-1">Verification score matching conditions drag-and-drop slots.</p>
                </div>

                <div className="p-5 cs-fun-card">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">University Grade</span>
                  <strong className="text-3xl text-emerald-400 block mt-2">
                    {examResult ? `${examResult.score}/10 (${examResult.grade})` : "Not Attempted"}
                  </strong>
                  <p className="text-[11px] text-slate-400 mt-1">Estimated exam grading outcome by the JIT evaluation system.</p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Exit control */}
      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <button
          onClick={() => setSelectedModule('dashboard')}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
        >
          ← Exit OOP Panel
        </button>

        <button
          onClick={() => {
            if (progressPercent === 100) {
              handleMarkComplete('oop');
              toast.success("Congratulations! You have completed the C# OOP Module!");
            } else {
              toast.error(`Please complete all activities first. Current progress: ${progressPercent}%`);
            }
          }}
          className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          {completedCount > 2 ? "Track Completed ✓" : "Claim OOP Completion Badge"}
        </button>
      </div>

    </div>
  );
}

