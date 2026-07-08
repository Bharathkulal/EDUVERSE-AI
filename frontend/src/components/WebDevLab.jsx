import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Play, Code, CheckCircle, HelpCircle, FileText,
  ChevronRight, Award, Compass, Flame, TrendingUp, PlayCircle,
  Code2, Terminal, Info, RefreshCw, Layers, Database, Zap,
  BrainCircuit, ShieldAlert, Sparkles, Star, Trophy
} from 'lucide-react';
import './WebDevLab.css';

// ═══════════════════════════════════════════════════════════
// WEB DEVELOPMENT CURRICULUM DATA
// ═══════════════════════════════════════════════════════════
const WEB_DEV_MODULES = [
  {
    id: 1,
    title: 'Internet Fundamentals',
    description: 'Learn client-server architecture, browsers, DNS, HTTP/HTTPS protocols, and web security basics.',
    difficulty: 'Beginner',
    duration: '45 mins',
    xp: 100,
    accent: '#3B82F6',
    icon: Compass,
    progress: 100,
    topics: [
      { title: 'What is the Internet', content: 'The Internet is a global network of computers connected together to share data using standardized communication protocols (TCP/IP).' },
      { title: 'Client-Server Architecture', content: 'Clients (like your browser) request data, and Servers (remote computers storing files/APIs) process and respond with the requested resources.' },
      { title: 'How Browsers Work', content: 'Browsers parse HTML to build the DOM tree, parse CSS to build the CSSOM, combine them into a Render Tree, and paint elements onto the screen.' },
      { title: 'DNS & HTTP/HTTPS Protocols', content: 'DNS translates human-readable domain names (google.com) to numeric IP addresses. HTTP/HTTPS defines how request-response headers are structured safely.' }
    ],
    visualization: {
      title: 'DNS Resolution Flow',
      nodes: ['Browser', 'Resolver DNS', 'Root Server', 'TLD Server', 'Authoritative Server', 'Web Server']
    },
    practice: {
      task: 'Verify host routing rules',
      instruction: 'Use standard nslookup queries to trace target server IPs. Input a domain below to simulate DNS mapping.'
    },
    assignment: 'Explain step-by-step how YouTube loads a video over HTTPS compared to HTTP.',
    quiz: {
      question: 'Which DNS server is the first stop when resolving a domain name not cached locally?',
      options: [
        { id: 'a', text: 'Root Server' },
        { id: 'b', text: 'Recursive Resolver' },
        { id: 'c', text: 'TLD Server' },
        { id: 'd', text: 'Authoritative Nameserver' }
      ],
      correct: 'b',
      explanation: 'The Recursive Resolver is the server that receives the client request first and queries other DNS servers to locate the target IP.'
    },
    project: 'Draw and model a complete request-response cycle diagram for an interactive SaaS platform.'
  },
  {
    id: 2,
    title: 'HTML Foundations',
    description: 'Master semantic layout structures, forms, headings, accessibility controls, and SEO best practices.',
    difficulty: 'Beginner',
    duration: '50 mins',
    xp: 120,
    accent: '#10B981',
    icon: BookOpen,
    progress: 80,
    topics: [
      { title: 'HTML Structure & Semantics', content: 'Semantic tags like <header>, <main>, <footer>, <article> define clear meaning to search engines and screen readers.' },
      { title: 'Forms and Inputs', content: 'Forms gather user inputs using elements like <input type="text">, <select>, <textarea>, and <button>.' },
      { title: 'SEO & Accessibility Basics', content: 'Use descriptive alt attributes for images, proper meta tags, and structured heading hierarchies.' }
    ],
    visualization: {
      title: 'DOM Tree Structure',
      nodes: ['html', 'head (meta, title)', 'body', 'header (nav)', 'main (article, section)', 'footer']
    },
    practice: {
      task: 'Create a Profile Card Layout',
      instruction: 'Write a basic semantic outline for a user profile card containing an image, details, and dynamic social buttons.'
    },
    assignment: 'Recreate a Wikipedia-style article structure using semantic markup exclusively.',
    quiz: {
      question: 'Which tag is most appropriate for the main navigational links of a webpage?',
      options: [
        { id: 'a', text: '<div class="nav">' },
        { id: 'b', text: '<navigation>' },
        { id: 'c', text: '<nav>' },
        { id: 'd', text: '<section>' }
      ],
      correct: 'c',
      explanation: 'The <nav> tag is the standard HTML5 semantic element used to enclose navigation links.'
    },
    project: 'Create a fully structured personal portfolio page layout using only semantic HTML5 tags.'
  },
  {
    id: 3,
    title: 'CSS Masterclass',
    description: 'Deconstruct specificity rules, the Box Model, Flexbox layouts, Grid styling, and media query controls.',
    difficulty: 'Intermediate',
    duration: '90 mins',
    xp: 200,
    accent: '#EC4899',
    icon: Layers,
    progress: 50,
    topics: [
      { title: 'The Box Model & Selectors', content: 'Every HTML element behaves as a rectangular box consisting of Content, Padding, Border, and Margin.' },
      { title: 'Flexbox Layouts', content: 'Flexbox arranges child components along a single axis (row or column) with flexible sizes and distribution.' },
      { title: 'CSS Grid System', content: 'Grid creates bidimensional layouts with rows and columns, enabling complex responsive page flows.' }
    ],
    visualization: {
      title: 'Box Model Dimensions',
      nodes: ['Margin', 'Border', 'Padding', 'Content Box']
    },
    practice: {
      task: 'Center a Div using Flexbox',
      instruction: 'Apply styles to center elements horizontally and vertically within a viewport.'
    },
    assignment: 'Build a responsive pricing table showing 3 tiers which scales down cleanly on mobile devices.',
    quiz: {
      question: 'Which property is used in Flexbox to control how extra space is distributed along the cross-axis?',
      options: [
        { id: 'a', text: 'justify-content' },
        { id: 'b', text: 'align-items' },
        { id: 'c', text: 'flex-direction' },
        { id: 'd', text: 'flex-wrap' }
      ],
      correct: 'b',
      explanation: 'The align-items property defines the alignment of flex items along the cross-axis of the container.'
    },
    project: 'Design and deploy a fully responsive SaaS marketing landing page with interactive animation transitions.'
  },
  {
    id: 4,
    title: 'JavaScript Essentials',
    description: 'Learn variables, functional scope, DOM event captures, Async programming, and APIs.',
    difficulty: 'Intermediate',
    duration: '110 mins',
    xp: 250,
    accent: '#F59E0B',
    icon: Code2,
    progress: 30,
    topics: [
      { title: 'Variables, Scope & ES6', content: 'Modern JS uses let/const for block scoping. Destructuring and arrow functions optimize code syntax.' },
      { title: 'DOM Manipulations & Events', content: 'Use document.querySelector() to select elements, and add event listeners to capture user inputs.' },
      { title: 'Asynchronous JavaScript & Fetch', content: 'Promises and async/await handle asynchronous operations. Fetch API fetches network resources.' }
    ],
    visualization: {
      title: 'Event Loop Process',
      nodes: ['Call Stack', 'Web APIs', 'Callback Queue', 'Event Loop Selector']
    },
    practice: {
      task: 'Build a Counter Logic',
      instruction: 'Write functional logic to increment and decrement counter states, updating the DOM on user clicks.'
    },
    assignment: 'Create a digital clock updating time every second using JS setInterval callbacks.',
    quiz: {
      question: 'What keyword refers to the current executing context inside a JavaScript function?',
      options: [
        { id: 'a', text: 'this' },
        { id: 'b', text: 'scope' },
        { id: 'c', text: 'context' },
        { id: 'd', text: 'self' }
      ],
      correct: 'a',
      explanation: 'The "this" keyword references the context in which the current function is being executed.'
    },
    project: 'Build a weather app using weather APIs, with styling, interactive toggles, and localized storage caching.'
  },
  {
    id: 5,
    title: 'Git & GitHub',
    description: 'Manage collaborative codebases using branches, resolve merge conflicts, and manage PR reviews.',
    difficulty: 'Beginner',
    duration: '40 mins',
    xp: 120,
    accent: '#8B5CF6',
    icon: Terminal,
    progress: 10,
    topics: [
      { title: 'Version Control Systems', content: 'Git tracks historical revisions of local workspaces, allowing rollbacks and branch deviations.' },
      { title: 'Branching & Merging', content: 'Create branches for isolated features and merge updates cleanly into main releases.' }
    ],
    visualization: {
      title: 'Git Workflow Stages',
      nodes: ['Working Directory', 'Staging Area', 'Local Repository', 'Remote GitHub']
    },
    practice: {
      task: 'Initialize and commit code',
      instruction: 'Simulate git add . and git commit commands to commit changes.'
    },
    assignment: 'Detail the sequence of commands needed to pull updates, resolve conflicts, and push clean branch states.',
    quiz: {
      question: 'Which command is used to combine changes from a target branch into the current checked-out branch?',
      options: [
        { id: 'a', text: 'git pull' },
        { id: 'b', text: 'git merge' },
        { id: 'c', text: 'git branch' },
        { id: 'd', text: 'git checkout' }
      ],
      correct: 'b',
      explanation: 'git merge combines files and history from a specified branch into the currently active branch.'
    },
    project: 'Initialize a local git repository, commit files, create a GitHub repository, and push code.'
  },
  {
    id: 6,
    title: 'React JS',
    description: 'Understand modular JSX components, state/prop hooks, React routing, and Context API providers.',
    difficulty: 'Intermediate',
    duration: '100 mins',
    xp: 300,
    accent: '#06B6D4',
    icon: BrainCircuit,
    progress: 0,
    topics: [
      { title: 'Components & JSX', content: 'React components are reusable building blocks returning JSX markup styling templates.' },
      { title: 'State & Props hooks', content: 'Use useState hook to declare state scopes, and pass readonly parameters using props.' },
      { title: 'Context API state', content: 'Manage global application states cleanly without prop-drilling.' }
    ],
    visualization: {
      title: 'React Fiber Lifecycle',
      nodes: ['Trigger State Change', 'Render Virtual DOM', 'Diff reconciliation', 'Commit to DOM']
    },
    practice: {
      task: 'Build a Todo Component',
      instruction: 'Create React functional inputs to append list objects to a state array and render items dynamically.'
    },
    assignment: 'Explain React render cycles and state dependencies.',
    quiz: {
      question: 'Which Hook should you use to run side effects like API fetching in a functional component?',
      options: [
        { id: 'a', text: 'useState' },
        { id: 'b', text: 'useCallback' },
        { id: 'c', text: 'useEffect' },
        { id: 'd', text: 'useContext' }
      ],
      correct: 'c',
      explanation: 'useEffect performs side effects (API requests, event attachments) during specific component lifecycle stages.'
    },
    project: 'Build an interactive collaborative task management platform using global Context API providers.'
  },
  {
    id: 7,
    title: 'Backend (Node + Express)',
    description: 'Learn runtime Node triggers, custom HTTP servers, middleware flows, and REST API controllers.',
    difficulty: 'Advanced',
    duration: '80 mins',
    xp: 280,
    accent: '#F97316',
    icon: Database,
    progress: 0,
    topics: [
      { title: 'Node.js Core Runtimes', content: 'Node is an asynchronous, event-driven JavaScript engine running outside web browsers.' },
      { title: 'Express Routing & Controllers', content: 'Express simplifies building routing trees, middleware pipelines, and CRUD APIs.' }
    ],
    visualization: {
      title: 'HTTP Middleware Pipe',
      nodes: ['Client Request', 'Auth Middleware', 'Logging Middleware', 'Controller Handler', 'Response']
    },
    practice: {
      task: 'Build a GET routing logic',
      instruction: 'Instantiate Express servers and listen to endpoints returning JSON parameters.'
    },
    assignment: 'Design an Express route parsing parameters and returning standard HTTP status codes.',
    quiz: {
      question: 'What is the role of next() inside Express middleware functions?',
      options: [
        { id: 'a', text: 'Ends the request-response cycle' },
        { id: 'b', text: 'Passes control to the next middleware' },
        { id: 'c', text: 'Renders HTML outputs' },
        { id: 'd', text: 'Handles syntax errors' }
      ],
      correct: 'b',
      explanation: 'next() passes control to the next middleware function in the request-response stack.'
    },
    project: 'Create a complete CRUD API system to manage student profile registrations.'
  },
  {
    id: 8,
    title: 'Databases',
    description: 'Deconstruct SQL joins and NoSQL document stores (PostgreSQL, MongoDB).',
    difficulty: 'Advanced',
    duration: '90 mins',
    xp: 300,
    accent: '#EF4444',
    icon: Database,
    progress: 0,
    topics: [
      { title: 'SQL vs NoSQL databases', content: 'Relational (SQL) uses tables with strict schemas. NoSQL (MongoDB) utilizes flexible JSON-like documents.' },
      { title: 'SQL Joins & Indexing', content: 'Combine data across tables using Inner, Left, Right Joins and optimize searches with indexes.' }
    ],
    visualization: {
      title: 'Database Schema Join',
      nodes: ['Users Table', 'Primary Key link', 'Orders Table', 'Foreign Key link']
    },
    practice: {
      task: 'Write a basic INNER JOIN query',
      instruction: 'Query customer purchase details by joining the customer and transaction tables.'
    },
    assignment: 'Compare database scalability: scale-up (SQL) vs scale-out (NoSQL) databases.',
    quiz: {
      question: 'Which keyword is used in SQL to combine rows from multiple tables based on a related column?',
      options: [
        { id: 'a', text: 'MERGE' },
        { id: 'b', text: 'UNION' },
        { id: 'c', text: 'JOIN' },
        { id: 'd', text: 'GROUP BY' }
      ],
      correct: 'c',
      explanation: 'JOIN links related records from multiple database tables.'
    },
    project: 'Design and deploy a relational database schema for a digital library management system.'
  },
  {
    id: 9,
    title: 'Authentication',
    description: 'Learn secure password hashing, JSON Web Token (JWT) sessions, and OAuth workflows.',
    difficulty: 'Advanced',
    duration: '70 mins',
    xp: 250,
    accent: '#6366F1',
    icon: ShieldAlert,
    progress: 0,
    topics: [
      { title: 'Secure Passwords & Hashing', content: 'Always hash passwords with salt before database storage using bcrypt library APIs.' },
      { title: 'JWT Auth token structures', content: 'JWTs encode claims signed via secure key headers, stored on clients for authorization.' }
    ],
    visualization: {
      title: 'JWT Auth Flow',
      nodes: ['Login credentials', 'Server issues JWT', 'Client stores JWT', 'Client requests with JWT']
    },
    practice: {
      task: 'Parse Header Token Auth',
      instruction: 'Write validation filters analyzing incoming Authorization bearer tokens.'
    },
    assignment: 'Contrast security parameters: Session Cookies vs Local Storage JWT tokens.',
    quiz: {
      question: 'Where is the signature portion of a JWT token validated?',
      options: [
        { id: 'a', text: 'On the client device' },
        { id: 'b', text: 'By third-party DNS' },
        { id: 'c', text: 'On the backend server' },
        { id: 'd', text: 'Inside CSS templates' }
      ],
      correct: 'c',
      explanation: 'The backend validates JWT signatures using the server secret key to authorize clients.'
    },
    project: 'Build a secure registration and login system protecting dashboard views.'
  },
  {
    id: 10,
    title: 'Deployment',
    description: 'Configure environment variables, deploy static assets, and implement basic CI/CD pipelines.',
    difficulty: 'Intermediate',
    duration: '50 mins',
    xp: 150,
    accent: '#22C55E',
    icon: Trophy,
    progress: 0,
    topics: [
      { title: 'Environment Configs', content: 'Store API keys and database parameters securely inside environment variables.' },
      { title: 'Vercel, Netlify & Render', content: 'Deploy static web assets and server runtimes globally using cloud systems.' }
    ],
    visualization: {
      title: 'CI/CD Pipeline Flow',
      nodes: ['Push to GitHub', 'Build verification', 'Unit Test checks', 'Production Deploy']
    },
    practice: {
      task: 'Define an .env layout file',
      instruction: 'Build a configuration parameter blueprint listing API keys, URLs, and port mappings.'
    },
    assignment: 'Explain why configuration keys should not be pushed to Git repositories.',
    quiz: {
      question: 'Which of the following is best suited for hosting static frontend assets globally?',
      options: [
        { id: 'a', text: 'Vercel' },
        { id: 'b', text: 'Docker' },
        { id: 'c', text: 'Express' },
        { id: 'd', text: 'MongoDB' }
      ],
      correct: 'a',
      explanation: 'Vercel is a platform designed to deploy static frontends and serverless API endpoints.'
    },
    project: 'Deploy a full-stack dashboard system linking Vercel frontends to Render backend servers.'
  },
  {
    id: 11,
    title: 'System Design Basics',
    description: 'Learn load balancing, server scaling, caching layers, and database replica sets.',
    difficulty: 'Advanced',
    duration: '60 mins',
    xp: 220,
    accent: '#64748B',
    icon: Star,
    progress: 0,
    topics: [
      { title: 'Scalability Systems', content: 'Scalability is the ability of systems to handle growing traffic volumes smoothly.' },
      { title: 'Load Balancers & Caching', content: 'Load balancers distribute traffic across servers. Caches (like Redis) speed up read performance.' }
    ],
    visualization: {
      title: 'Scale Architecture',
      nodes: ['Client traffic', 'Load Balancer', 'Server Pool', 'Redis cache', 'Main Database']
    },
    practice: {
      task: 'Map Caching Strategy',
      instruction: 'Design a system caching data read patterns to optimize page load speeds.'
    },
    assignment: 'Draw and explain a multi-region distributed system layout design.',
    quiz: {
      question: 'Which component distributes incoming network traffic across multiple servers?',
      options: [
        { id: 'a', text: 'Reverse Cache' },
        { id: 'b', text: 'Load Balancer' },
        { id: 'c', text: 'DNS Server' },
        { id: 'd', text: 'API Gateway' }
      ],
      correct: 'b',
      explanation: 'Load balancers distribute user traffic across servers to optimize resource usage and prevent overloads.'
    },
    project: 'Design the system architecture for YouTube, detailing video storage layers and CDN delivery networks.'
  }
];

export default function WebDevLab() {
  const [selectedModule, setSelectedModule] = useState(null);
  
  useEffect(() => {
    const handleBack = (e) => {
      if (e.defaultPrevented) return;
      if (selectedModule !== null) {
        e.preventDefault();
        setSelectedModule(null);
      }
    };
    window.addEventListener('eduverse-back', handleBack);
    return () => window.removeEventListener('eduverse-back', handleBack);
  }, [selectedModule]);

  const [activeTab, setActiveTab] = useState('learn'); // learn, visualize, code, practice, assignment, quiz, project, mastery
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('Click "Run Code" to compile...');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(null);
  const [showAiHint, setShowAiHint] = useState(false);
  const [userAssignment, setUserAssignment] = useState('');
  const [userProjectNotes, setUserProjectNotes] = useState('');

  const handleOpenModule = (mod) => {
    setSelectedModule(mod);
    setSelectedTopicIdx(0);
    setActiveTab('learn');
    setQuizScore(null);
    setSelectedAnswer(null);
    setShowAiHint(false);
    setUserAssignment('');
    setUserProjectNotes('');
    
    // Set default boilerplate based on module
    if (mod.id === 2) {
      setUserCode(`<!-- HTML Challenge -->\n<div class="profile-card">\n  <h2>John Doe</h2>\n  <p>Web Developer</p>\n  <button>Contact</button>\n</div>`);
    } else if (mod.id === 3) {
      setUserCode(`/* CSS Styling challenge */\n.profile-card {\n  background: #ffffff;\n  padding: 24px;\n  border-radius: 12px;\n  box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n}`);
    } else if (mod.id === 4) {
      setUserCode(`// JavaScript Counter state\nlet count = 0;\nfunction increment() {\n  count++;\n  console.log("Count is now: " + count);\n}\nincrement();`);
    } else {
      setUserCode(`// Sample Workspace Code\nconsole.log("Welcome to ${mod.title}!");`);
    }
  };

  const handleRunCode = () => {
    if (selectedModule.id === 4 || selectedModule.id > 4) {
      // JavaScript evaluation simulation
      setConsoleOutput(`Running script...\n\n[Console Log]\nWelcome to ${selectedModule.title}!\nCount is now: 1\n\nExecution Finished successfully!`);
    } else {
      setConsoleOutput(`Rendering styling templates...\nOutput element parsed. View rendering tree visualizer inside output container.`);
    }
  };

  const handleQuizSubmit = (optId) => {
    setSelectedAnswer(optId);
    if (optId === selectedModule.quiz.correct) {
      setQuizScore(100);
    } else {
      setQuizScore(0);
    }
  };

  return (
    <div className="web-dev-lms max-w-[1440px] mx-auto p-4 sm:p-8">
      <AnimatePresence mode="wait">
        {!selectedModule ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* HERO PANEL */}
            <div className="wd-hero-section p-6 md:p-8 rounded-[28px] border border-[var(--db-card-border)] shadow-[var(--db-shadow)] relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-[var(--db-card-bg)]">
              <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-tr from-[#3B82F6]/5 to-[#10B981]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              
              <div className="space-y-4 max-w-xl z-10">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 bg-gradient-to-r from-[#3B82F6]/10 to-[#10B981]/10 border border-[#3B82F6]/20 rounded-full text-xs font-bold text-[#3B82F6] flex items-center gap-1">
                    <Sparkles size={12} /> Web Development LMS
                  </span>
                  <span className="text-xs text-[var(--db-text-muted)] font-medium">• 11 Curricular Modules</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--db-text-main)]">Full-Stack Web Architect</h1>
                <p className="text-[var(--db-text-secondary)] leading-relaxed text-sm">
                  Deconstruct web application ecosystems. Seamlessly integrate HTML structural semantics, responsive CSS architectures, async JS engines, server routers, and scale designs.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button className="px-5 py-3 rounded-2xl bg-[#3B82F6] text-white text-xs font-bold hover:bg-[#2563EB] transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10"
                    onClick={() => handleOpenModule(WEB_DEV_MODULES[1])}
                  >
                    Start HTML Foundations <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Progress Summary Ring */}
              <div className="flex items-center flex-wrap sm:flex-nowrap gap-6 w-full lg:w-auto bg-[var(--db-card-bg-elevated)] p-5 rounded-2xl border border-[var(--db-card-border)] z-10">
                <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-[var(--db-sidebar-border)]" strokeWidth="6" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                    <circle className="text-[#10B981]" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 21) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-[var(--db-text-main)]">21%</span>
                    <span className="text-[9px] text-[var(--db-text-muted)] font-bold">COMPLETE</span>
                  </div>
                </div>
                <div className="space-y-3 flex-grow">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                      <span className="text-[10px] text-[var(--db-text-muted)] block font-semibold uppercase">Course Level</span>
                      <strong className="text-lg font-bold text-[var(--db-text-main)]">04</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--db-text-muted)] block font-semibold uppercase">XP Earned</span>
                      <strong className="text-lg font-bold text-[var(--db-text-main)]">1.4k <span className="text-xs font-normal text-[var(--db-text-muted)]">/ 5k</span></strong>
                    </div>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-50/10 border border-[#10B981]/20 text-[9px] font-bold text-[#10B981]">CSS Ninja</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50/10 border border-[#3B82F6]/20 text-[9px] font-bold text-[#3B82F6]">HTML Coder</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CURRICULUM ROADMAP TIMELINE */}
            <div className="bg-[var(--db-card-bg)] p-6 rounded-[24px] border border-[var(--db-card-border)]">
              <h3 className="text-xs font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Compass size={14} /> Full Stack Web Development Path
              </h3>
              <div className="flex items-center justify-between gap-2 overflow-x-auto py-3">
                {WEB_DEV_MODULES.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{
                          background: item.progress === 100 ? `${item.accent}20` : (item.progress > 0 ? item.accent : 'var(--db-input-bg)'),
                          border: `2px solid ${item.progress > 0 ? item.accent : 'var(--db-card-border)'}`,
                          color: item.progress === 100 ? item.accent : (item.progress > 0 ? '#fff' : 'var(--db-text-muted)')
                        }}
                      >
                        {item.progress === 100 ? '✓' : idx + 1}
                      </div>
                      <span className={`text-xs font-semibold ${item.progress > 0 ? 'text-[var(--db-text-main)] font-bold' : 'text-[var(--db-text-secondary)]'}`}>
                        {item.title}
                      </span>
                    </div>
                    {idx < 5 && <span className="text-[var(--db-card-border)] font-bold px-2">→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* MODULES GRID */}
            <div>
              <h2 className="text-xl font-bold text-[var(--db-text-main)] mb-6">Learning Curriculum Modules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {WEB_DEV_MODULES.map((mod) => {
                  const ModIcon = mod.icon || BookOpen;
                  return (
                    <motion.div
                      key={mod.id}
                      onClick={() => handleOpenModule(mod)}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                      className="wd-module-card cursor-pointer group flex flex-col justify-between"
                      style={{ '--accent-color': mod.accent }}
                    >
                      <div className="wd-accent-border" />
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="wd-icon-wrapper" style={{ background: `${mod.accent}12`, color: mod.accent }}>
                            <ModIcon size={20} />
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            mod.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-500' :
                            mod.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-red-500/10 text-red-500'
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

                      <div className="mt-6 pt-4 border-t border-[var(--db-card-border)] flex items-center justify-between">
                        <span className="text-[10px] text-[var(--db-text-muted)] font-medium">{mod.duration}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${mod.progress}%` }}></div>
                          </div>
                          <span className="text-[9px] font-bold text-[var(--db-text-muted)]">{mod.progress}%</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* 3-PANEL INTERACTIVE WORKSPACE */
          <motion.div
            key="workspace"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col h-[calc(100vh-120px)] bg-[var(--db-card-bg)] border border-[var(--db-card-border)] rounded-[24px] overflow-hidden"
          >
            {/* WORKSPACE HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--db-card-border)] bg-[var(--db-card-bg-elevated)]">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedModule(null)}
                  className="p-2 hover:bg-[var(--db-sidebar-border)] rounded-xl transition text-[var(--db-text-muted)] hover:text-[var(--db-text-main)]"
                >
                  <ChevronRight size={20} className="transform rotate-180" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-[var(--db-text-main)]">{selectedModule.title}</h2>
                  <p className="text-[10px] text-[var(--db-text-muted)]">Course Workspace • Module {selectedModule.id}</p>
                </div>
              </div>
              
              {/* Workspace Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['learn', 'visualize', 'code', 'practice', 'assignment', 'quiz', 'project', 'mastery'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                      activeTab === tab 
                        ? 'bg-[#3B82F6] text-white' 
                        : 'text-[var(--db-text-muted)] hover:bg-[var(--db-sidebar-border)] hover:text-[var(--db-text-main)]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* THREE PANEL GRID */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
              
              {/* LEFT PANEL: THEORY & EXPLANATION */}
              <div className="lg:col-span-4 border-r border-[var(--db-card-border)] p-6 overflow-y-auto space-y-6">
                {activeTab === 'learn' && (
                  <div className="space-y-6">
                    <div>
                      <span className="px-2 py-0.5 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 rounded-md text-[9px] font-bold uppercase tracking-wider">Concept Study</span>
                      <h3 className="text-lg font-bold text-[var(--db-text-main)] mt-2">Theory Walkthrough</h3>
                    </div>

                    <div className="space-y-1">
                      {selectedModule.topics.map((topic, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedTopicIdx(i)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                            selectedTopicIdx === i 
                              ? 'border-[#3B82F6] bg-[#3B82F6]/5 text-[var(--db-text-main)] font-semibold' 
                              : 'border-transparent text-[var(--db-text-secondary)] hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <span>{topic.title}</span>
                          <ChevronRight size={14} className={selectedTopicIdx === i ? 'text-[#3B82F6]' : 'text-slate-400'} />
                        </button>
                      ))}
                    </div>

                    <div className="p-4 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-2xl text-xs space-y-3">
                      <h4 className="font-bold text-[var(--db-text-main)]">{selectedModule.topics[selectedTopicIdx]?.title}</h4>
                      <p className="text-[var(--db-text-secondary)] leading-relaxed">{selectedModule.topics[selectedTopicIdx]?.content}</p>
                    </div>

                    <div className="p-4 bg-emerald-50/10 border border-emerald-500/20 rounded-2xl text-xs space-y-2">
                      <span className="font-bold text-emerald-500 flex items-center gap-1"><Sparkles size={12} /> Real World Case</span>
                      <p className="text-[var(--db-text-secondary)] leading-relaxed">
                        Industry developers implement this framework configuration to optimize cache lookups, maintain clean state machines, and protect endpoints from server exploits.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'visualize' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-[var(--db-text-main)]">Simulation Graph</h3>
                    <p className="text-xs text-[var(--db-text-muted)]">Interact with state blocks detailing network flow patterns:</p>
                    <div className="wd-viz-container">
                      {selectedModule.visualization?.nodes.map((node, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="p-3 bg-[var(--db-card-bg-elevated)] border border-[#3B82F6]/30 text-[#3B82F6] rounded-xl text-xs font-bold text-center w-full shadow-sm">
                            {node}
                          </div>
                          {index < selectedModule.visualization.nodes.length - 1 && (
                            <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700 my-1 relative">
                              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-slate-400 text-[10px]">↓</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-[var(--db-text-main)]">Workspace Challenge</h3>
                    <p className="text-xs text-[var(--db-text-muted)]">Read current specs, structure classes, and execute configurations on the center panel code editor.</p>
                    <div className="p-4 bg-blue-50/10 border border-blue-500/20 rounded-2xl text-xs space-y-2">
                      <span className="font-bold text-[#3B82F6]">Developer Instructions:</span>
                      <p className="leading-relaxed">Complete structural parameters. Use functional declarations to handle data flow and press "Run Code" on the output pane to audit outputs.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'practice' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-[var(--db-text-main)]">Practical Task</h3>
                    <p className="text-xs text-[var(--db-text-secondary)]">{selectedModule.practice?.instruction}</p>
                    <div className="p-4 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-2xl text-xs">
                      <h4 className="font-bold mb-2">Goal:</h4>
                      <code className="text-[#3B82F6]">{selectedModule.practice?.task}</code>
                    </div>
                  </div>
                )}

                {activeTab === 'assignment' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-[var(--db-text-main)]">Module Assignment</h3>
                    <p className="text-xs text-[var(--db-text-secondary)]">{selectedModule.assignment}</p>
                    <textarea
                      placeholder="Write your explanation or code layout here..."
                      value={userAssignment}
                      onChange={(e) => setUserAssignment(e.target.value)}
                      className="w-full h-40 p-3 text-xs bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-xl outline-none focus:border-[#3B82F6]"
                    />
                    <button className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded-lg hover:bg-blue-600">
                      Submit Assignment
                    </button>
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-[var(--db-text-main)]">Module Quiz</h3>
                    <p className="text-xs text-[var(--db-text-secondary)]">{selectedModule.quiz.question}</p>
                    <div className="space-y-2">
                      {selectedModule.quiz.options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleQuizSubmit(opt.id)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                            selectedAnswer === opt.id 
                              ? (opt.id === selectedModule.quiz.correct ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10')
                              : 'border-[var(--db-card-border)] hover:bg-[var(--db-card-bg-elevated)]'
                          }`}
                        >
                          <span className="font-bold mr-2">{opt.id.toUpperCase()}.</span> {opt.text}
                        </button>
                      ))}
                    </div>
                    {quizScore !== null && (
                      <div className="p-4 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/40 space-y-2">
                        <span className={`font-bold ${quizScore === 100 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {quizScore === 100 ? '✓ Correct Answer!' : '✗ Incorrect. Try Again.'}
                        </span>
                        <p className="text-[var(--db-text-muted)]">{selectedModule.quiz.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'project' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-[var(--db-text-main)]">Project Work</h3>
                    <p className="text-xs text-[var(--db-text-secondary)]">{selectedModule.project}</p>
                    <textarea
                      placeholder="Map design parameters, hosting options, and database schemas here..."
                      value={userProjectNotes}
                      onChange={(e) => setUserProjectNotes(e.target.value)}
                      className="w-full h-40 p-3 text-xs bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-xl outline-none focus:border-[#3B82F6]"
                    />
                    <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500">
                      Save Project Progress
                    </button>
                  </div>
                )}

                {activeTab === 'mastery' && (
                  <div className="space-y-4 text-center py-6">
                    <Trophy className="mx-auto text-yellow-500" size={48} />
                    <h3 className="text-lg font-bold text-[var(--db-text-main)]">Mastery Certificate</h3>
                    <p className="text-xs text-[var(--db-text-muted)] max-w-sm mx-auto">
                      Complete all modules, compile required workspaces, submit assignments, and pass quizzes to unlock your Web Development certification.
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
                      <div className="h-full bg-emerald-500" style={{ width: `${selectedModule.progress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-[var(--db-text-muted)]">{selectedModule.progress}% Completed</span>
                  </div>
                )}
              </div>

              {/* CENTER PANEL: CODE EDITOR */}
              <div className="lg:col-span-5 border-r border-[var(--db-card-border)] flex flex-col min-h-0 bg-[#0F172A]">
                <div className="flex items-center justify-between p-3 border-b border-white/5 bg-[#090D16] text-[10px] text-slate-400 font-mono">
                  <span>workspace_editor.js</span>
                  <span>UTF-8</span>
                </div>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="flex-1 p-6 font-mono text-xs leading-relaxed text-[#F8FAFC] bg-transparent resize-none outline-none border-none"
                  style={{ fontFamily: '"Fira Code", monospace' }}
                />
                <div className="p-3 border-t border-white/5 bg-[#090D16] text-[10px] text-slate-400 font-mono flex justify-between">
                  <span>Lines: {userCode.split('\n').length}</span>
                  <span>Tab: 4 Spaces</span>
                </div>
              </div>

              {/* RIGHT PANEL: LIVE OUTPUT & AI TUTOR */}
              <div className="lg:col-span-3 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--db-text-main)] mb-3 flex items-center gap-1.5"><Terminal size={14} /> Output Terminal</h3>
                    <div className="wd-output-box">
                      {consoleOutput}
                    </div>
                    <button 
                      onClick={handleRunCode}
                      className="mt-3 w-full py-2.5 bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Play size={12} fill="currentColor" /> Run Environment Code
                    </button>
                  </div>

                  <div className="border-t border-[var(--db-card-border)] pt-4">
                    <h3 className="text-sm font-bold text-[var(--db-text-main)] mb-3 flex items-center gap-1.5"><BrainCircuit size={14} /> AI Tutor Assistant</h3>
                    <div className="p-4 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] rounded-2xl text-xs space-y-2">
                      <p className="text-[var(--db-text-secondary)] leading-relaxed">
                        Need tips? Ask the compiler tutor helper to analyze code structures.
                      </p>
                      {showAiHint ? (
                        <div className="pt-2 border-t border-[var(--db-card-border)] text-[var(--db-text-muted)] space-y-1">
                          <p>💡 <b>Tutor Hint:</b> Make sure to verify your variable declarations. Let or const are block-scoped; avoid using old var definitions.</p>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowAiHint(true)}
                          className="text-[#3B82F6] font-bold text-[11px] hover:underline flex items-center gap-1"
                        >
                          Request Code Review Hint →
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedModule(null)}
                  className="w-full py-2 border border-[var(--db-card-border)] rounded-xl text-xs text-[var(--db-text-muted)] hover:text-[var(--db-text-main)] transition"
                >
                  Return to Subject Modules
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
