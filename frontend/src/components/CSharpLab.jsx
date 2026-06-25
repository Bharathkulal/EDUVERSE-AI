import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Layers, Database, Filter, FolderOpen, Zap,
  Play, Pause, RotateCcw, Eye, Terminal, ArrowLeft, BookOpen,
  Monitor, Home, ArrowRight, Search, Sparkles, Flame, Trophy, Award,
  Shield, Network, Server, Cloud, Cpu, CheckCircle, AlertTriangle, PlayCircle,
  BrainCircuit, TrendingUp
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
            <div className="bg-white/[0.02] border border-white/10 p-5 rounded-3xl backdrop-blur-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <strong className="text-2xl font-black text-white">{xp} XP</strong>
                <span className="text-[10px] text-slate-500 block uppercase font-bold mt-0.5">Total XP Earned</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-5 rounded-3xl backdrop-blur-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Flame size={20} fill="currentColor" />
              </div>
              <div>
                <strong className="text-2xl font-black text-white">3 Days</strong>
                <span className="text-[10px] text-slate-500 block uppercase font-bold mt-0.5">Learning Streak</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-5 rounded-3xl backdrop-blur-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Trophy size={20} />
              </div>
              <div>
                <strong className="text-2xl font-black text-white">{completedCount} / 16</strong>
                <span className="text-[10px] text-slate-500 block uppercase font-bold mt-0.5">Modules Done</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-5 rounded-3xl backdrop-blur-md flex items-center gap-4">
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
                    className="bg-white/5 border border-white/10 rounded-[28px] hover:bg-white/10 transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer text-left hover:scale-[1.01] hover:border-white/20 group relative overflow-hidden"
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
                    className="bg-white/5 border border-white/10 rounded-[28px] hover:bg-white/10 transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer text-left hover:scale-[1.01] hover:border-white/20 group relative overflow-hidden"
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
            {CSHARP_MODULES.map((mod) => {
              if (activePanel !== mod.id) return null;
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
