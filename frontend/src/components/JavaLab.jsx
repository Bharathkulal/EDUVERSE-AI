import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Layers, Database, Filter, FolderOpen, Zap,
  Play, Pause, RotateCcw, Eye, Terminal, ArrowLeft, BookOpen,
  Monitor, Home, ArrowRight, Search, BrainCircuit, ShieldAlert
} from 'lucide-react';
import './JavaLab.css';

// ═══════════════════════════════════════════════════════════
// JAVA DATA SET
// ═══════════════════════════════════════════════════════════
const JAVA_DATA = [
  {
    id: 'servlets',
    title: 'Servlets',
    Icon: Layers,
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7B2CBF, #3F37C9)',
    description: 'Servlet Lifecycle, doGet(), doPost(), and RequestDispatcher.',
    difficulty: 'intermediate',
    duration: '20 min',
    xp: 200,
    topics: [
      {
        id: 'servlet-lifecycle',
        title: 'Servlet Lifecycle Visualizer',
        vizType: 'servletLifecycle',
        steps: 4,
        preview: 'Watch client requests map to init(), service(), doGet()/doPost(), and destroy() states.',
        code: `// Java Servlet Lifecycle\n@WebServlet("/hello")\npublic class HelloServlet extends HttpServlet {\n  \n  // Step 1: Called once during servlet startup\n  public void init() {\n    System.out.println("Servlet Initialized");\n  }\n  \n  // Step 2: Thread-safe doGet invocation\n  protected void doGet(HttpServletRequest req, HttpServletResponse resp) \n      throws IOException {\n    resp.getWriter().write("Hello World!");\n  }\n  \n  // Step 3: Called when container shuts down\n  public void destroy() {\n    System.out.println("Servlet Destroyed");\n  }\n}`,
        stepLabels: ['init()', 'service() thread', 'doGet() response', 'destroy()'],
        stepDescriptions: [
          'The servlet container instantiates the Servlet and invokes init() exactly once to configure resources.',
          'Upon client requests, separate worker threads invoke the service() method, routing to doGet() or doPost().',
          'doGet() parses request parameters, processes logic, and writes responses back to the socket buffer.',
          'When Tomcat/Glassfish shuts down, destroy() is invoked to release active file handlers and db pools.'
        ]
      }
    ]
  },
  {
    id: 'jdbc',
    title: 'JDBC',
    Icon: Database,
    color: '#059669',
    gradient: 'linear-gradient(135deg, #4CC9F0, #4895EF)',
    description: 'JDBC Architecture, PreparedStatements, and ResultSet cursors.',
    difficulty: 'intermediate',
    duration: '25 min',
    xp: 250,
    topics: [
      {
        id: 'jdbc-crud',
        title: 'JDBC PreparedStatements',
        vizType: 'jdbcCrud',
        steps: 5,
        preview: 'Simulate database drivers executing query binding and navigating result sets.',
        code: `// JDBC Driver statement execution\nString sql = "SELECT * FROM users WHERE id = ?";\ntry (PreparedStatement pstmt = conn.prepareStatement(sql)) {\n  \n  // Step 1: Bind placeholder parameter\n  pstmt.setInt(1, 101);\n  \n  // Step 2: Execute query against database driver\n  try (ResultSet rs = pstmt.executeQuery()) {\n    \n    // Step 3: Scan cursor row-by-row\n    while (rs.next()) {\n      String name = rs.getString("name");\n    }\n  }\n}`,
        stepLabels: ['Prepare SQL', 'Bind Parameter', 'Execute Query', 'Read Cursor', 'Close ResultSet'],
        stepDescriptions: [
          'PreparedStatement compiles the SQL query template first, preparing placeholders (?) on the DBMS server.',
          'Binding pstmt.setInt(1, 101) replaces the first wildcard safely, preventing sql-injection hacks.',
          'pstmt.executeQuery() sends the bound request. Database retrieves index records and compiles Cursor blocks.',
          'rs.next() advances the cursor buffer row-by-row. Data is fetched on-demand from driver arrays.',
          'Using-with-resources closes ResultSet and PreparedStatement structures, preventing memory leaks.'
        ]
      }
    ]
  },
  {
    id: 'session-mgmt',
    title: 'Session Management',
    Icon: Zap,
    color: '#DB2777',
    gradient: 'linear-gradient(135deg, #FF4D6D, #C9184A)',
    description: 'Cookies, HttpSession mapping, and tracking lifecycles.',
    difficulty: 'intermediate',
    duration: '15 min',
    xp: 180,
    topics: [
      {
        id: 'session-tracker',
        title: 'HttpSession & Session ID Tracker',
        vizType: 'sessionTracker',
        steps: 4,
        preview: 'Visualize how JSESSIONID is passed via headers to identify user-specific server maps.',
        code: `// Java Session Management\nprotected void doGet(HttpServletRequest req, HttpServletResponse resp) {\n  \n  // Step 1: Get or Create Session context\n  HttpSession session = req.getSession(true);\n  \n  // Step 2: Retrieve attributes\n  Integer count = (Integer) session.getAttribute("visitCount");\n  \n  // Step 3: Mutate attribute store\n  session.setAttribute("visitCount", (count == null ? 1 : count + 1));\n}`,
        stepLabels: ['Client Request', 'JSESSIONID Lookup', 'Session Found', 'Session SetAttribute'],
        stepDescriptions: [
          'Client initiates an HTTP request. Browser automatically appends cookies to request headers.',
          'Server scans headers for JSESSIONID. If empty, server allocates a fresh UUID block on JVM heap.',
          'If JSESSIONID matches an active session hashmap, server fetches user context variables.',
          'session.setAttribute updates the session context map. Changes are saved for subsequent requests.'
        ]
      }
    ]
  },
  {
    id: 'spring-boot',
    title: 'Spring Boot',
    Icon: BrainCircuit,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #9B5DE5, #F15BB5)',
    description: 'Dependency Injection, IoC Containers, and REST endpoints.',
    difficulty: 'advanced',
    duration: '30 min',
    xp: 300,
    topics: [
      {
        id: 'spring-di',
        title: 'Spring Boot IoC Container',
        vizType: 'springDi',
        steps: 4,
        preview: 'Inspect how beans are auto-wired and resolved within the IoC Registry.',
        code: `// Spring Dependency Injection\n@RestController\npublic class UserController {\n\n  // Autowired bean gets injected by Container registry\n  @Autowired\n  private UserService userService;\n\n  @GetMapping("/users")\n  public List<User> getUsers() {\n    return userService.getAllUsers();\n  }\n}`,
        stepLabels: ['Component Scan', 'Bean Instantiate', 'Auto-wiring Injection', 'Request Dispatch'],
        stepDescriptions: [
          'On startup, Spring Boot scans classpath annotations (@RestController, @Service, @Component).',
          'IoC Container instantiates beans and registers them inside the ApplicationContext bean registry.',
          '@Autowired signals the container to resolve dependencies, injecting the UserService bean instance.',
          'When client hits /users endpoint, dispatcher servlet routes call to bean method automatically.'
        ]
      }
    ]
  },
  {
    id: 'web-tech',
    title: 'Web Technologies',
    Icon: Code,
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #FF007F, #7B2CBF)',
    description: 'Java Web Fundamentals, HTTP Lifecycle, and architectures.',
    difficulty: 'beginner',
    duration: '10 min',
    xp: 100,
    locked: true,
    topics: []
  },
  {
    id: 'jsp',
    title: 'JSP',
    Icon: Monitor,
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #00B4D8, #0077B6)',
    description: 'JSP Basics, Expression Language (EL), and JSTL libraries.',
    difficulty: 'beginner',
    duration: 'Locked',
    xp: 150,
    locked: true,
    topics: []
  },
  {
    id: 'mvc-pattern',
    title: 'MVC Architecture',
    Icon: FolderOpen,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F15BB5, #EEEF20)',
    description: 'Model-View-Controller separation of concerns (Phase 2)',
    difficulty: 'advanced',
    duration: 'Locked',
    xp: 200,
    locked: true,
    topics: []
  },
  {
    id: 'security',
    title: 'Security & Auth',
    Icon: ShieldAlert,
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #FF9F1C, #FF4000)',
    description: 'Servlet filters, CSRF, OAuth flows (Phase 2)',
    difficulty: 'advanced',
    duration: 'Locked',
    xp: 300,
    locked: true,
    topics: []
  }
];

// ═══════════════════════════════════════════════════════════
// SVG INTERACTIVE VISUALIZATIONS
// ═══════════════════════════════════════════════════════════

// 1. Servlet Lifecycle
function ServletLifecycleViz({ step }) {
  return (
    <svg viewBox="0 0 500 280" className="db-viz-svg">
      <defs>
        <marker id="java-arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="var(--db-primary)" />
        </marker>
      </defs>
      
      {/* Container Box */}
      <rect x="180" y="20" width="300" height="240" rx="12" fill="var(--db-card)" stroke="var(--db-border)" strokeWidth="1.5" />
      <text x="330" y="42" textAnchor="middle" fill="var(--db-text-muted)" fontSize="11" fontWeight="700">Tomcat Servlet Container</text>

      {/* Client Client */}
      <rect x="20" y="110" width="100" height="60" rx="8" fill="var(--db-primary)" />
      <text x="70" y="145" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">HTTP Client</text>

      {/* Flows */}
      {step === 0 && (
        <g>
          <path d="M 120 140 L 220 140" fill="transparent" stroke="var(--db-primary)" strokeWidth="2.5" markerEnd="url(#java-arrow)" />
          <text x="170" y="125" textAnchor="middle" fill="var(--db-primary)" fontSize="9" fontWeight="700">Startup Request</text>
        </g>
      )}

      {/* Servlet Box */}
      {step >= 0 && (
        <g>
          <rect x="240" y="80" width="180" height="130" rx="10" fill="var(--db-card)" stroke={step === 1 ? "var(--db-success)" : "var(--db-border)"} strokeWidth={step === 1 ? 2.5 : 1.5} />
          <rect x="240" y="80" width="180" height="30" rx="10" fill="var(--db-primary)" />
          <text x="330" y="100" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">HelloServlet</text>
          
          <rect x="250" y="120" width="160" height="24" rx="4" fill={step === 0 ? "rgba(16, 185, 129, 0.15)" : "var(--db-card)"} stroke={step === 0 ? "var(--db-success)" : "var(--db-border)"} />
          <text x="330" y="136" textAnchor="middle" fill={step === 0 ? "var(--db-success)" : "var(--db-text)"} fontSize="10" fontWeight="700">1. init()</text>

          <rect x="250" y="150" width="160" height="24" rx="4" fill={step === 1 || step === 2 ? "rgba(37, 99, 235, 0.15)" : "var(--db-card)"} stroke={step === 1 || step === 2 ? "var(--db-primary)" : "var(--db-border)"} />
          <text x="330" y="166" textAnchor="middle" fill={step === 1 || step === 2 ? "var(--db-primary)" : "var(--db-text)"} fontSize="10" fontWeight="700">2. service() / doGet()</text>

          <rect x="250" y="180" width="160" height="24" rx="4" fill={step === 3 ? "rgba(239, 68, 68, 0.15)" : "var(--db-card)"} stroke={step === 3 ? "var(--db-danger)" : "var(--db-border)"} />
          <text x="330" y="196" textAnchor="middle" fill={step === 3 ? "var(--db-danger)" : "var(--db-text)"} fontSize="10" fontWeight="700">3. destroy()</text>
        </g>
      )}

      {/* Concurrent Threads */}
      {step === 1 && (
        <g>
          <path d="M 120 140 C 180 140, 180 162, 240 162" fill="transparent" stroke="var(--db-primary)" strokeWidth="2" markerEnd="url(#java-arrow)" />
          <text x="180" y="125" textAnchor="middle" fill="var(--db-primary)" fontSize="9" fontWeight="700">Thread Pool Req</text>
        </g>
      )}

      {step === 2 && (
        <g>
          <path d="M 240 162 L 120 162" fill="transparent" stroke="var(--db-success)" strokeWidth="2" markerEnd="url(#java-arrow)" />
          <text x="180" y="180" textAnchor="middle" fill="var(--db-success)" fontSize="9" fontWeight="700">"Hello World!" Response</text>
        </g>
      )}
    </svg>
  );
}

// 2. JDBC CRUD
function JdbcCrudViz({ step }) {
  return (
    <svg viewBox="0 0 500 280" className="db-viz-svg">
      <defs>
        <marker id="java-arrow2" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="var(--db-primary)" />
        </marker>
      </defs>
      
      {/* Code side statement compilation */}
      <rect x="10" y="20" width="220" height="230" rx="12" fill="var(--db-card)" stroke="var(--db-border)" strokeWidth="1.5" />
      <rect x="10" y="20" width="220" height="35" rx="12" fill="var(--db-primary)" />
      <text x="120" y="42" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">JVM PreparedStatement</text>

      <text x="25" y="80" fill="var(--db-text)" fontSize="10" fontFamily="Fira Code, monospace">sql = "SELECT * FROM users"</text>
      <text x="25" y="98" fill="var(--db-text)" fontSize="10" fontFamily="Fira Code, monospace">      "WHERE id = ?"</text>

      {step >= 1 && (
        <g>
          <rect x="20" y="125" width="200" height="36" rx="6" fill="rgba(37, 99, 235, 0.08)" stroke="var(--db-primary)" strokeWidth="1.5" />
          <text x="30" y="147" fill="var(--db-primary)" fontSize="10" fontWeight="700">pstmt.setInt(1, 101) ✓</text>
        </g>
      )}

      {/* DB Connection line */}
      {step === 2 && (
        <path d="M 230 140 L 330 140" fill="transparent" stroke="var(--db-success)" strokeWidth="2.5" markerEnd="url(#java-arrow2)" />
      )}

      {/* Database side ResultSet */}
      <g transform="translate(320, 20)">
        <rect x="0" y="0" width="160" height="230" rx="12" fill="var(--db-card)" stroke="var(--db-border)" strokeWidth="1.5" />
        <rect x="0" y="0" width="160" height="35" rx="12" fill="var(--db-accent)" />
        <text x="80" y="22" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">ResultSet Cache</text>

        <rect x="5" y="45" width="150" height="32" rx="4" fill={step === 3 ? "rgba(16, 185, 129, 0.12)" : "var(--db-card)"} stroke={step === 3 ? "var(--db-success)" : "var(--db-border)"} />
        <text x="15" y="65" fill="var(--db-text)" fontSize="9" fontWeight="700">id: 101 | Name: Alice</text>

        <rect x="5" y="85" width="150" height="32" rx="4" fill="var(--db-card)" stroke="var(--db-border)" />
        <text x="15" y="105" fill="var(--db-text)" fontSize="9">id: 102 | Name: Bob</text>

        {step === 4 && (
          <g>
            <line x1="10" y1="140" x2="150" y2="140" stroke="var(--db-danger)" strokeWidth="2" strokeDasharray="4,2" />
            <text x="80" y="165" textAnchor="middle" fill="var(--db-danger)" fontSize="9" fontWeight="700">rs.close() Invoked</text>
          </g>
        )}
      </g>
    </svg>
  );
}

// 3. Spring Boot DI
function SpringDiViz({ step }) {
  return (
    <svg viewBox="0 0 500 280" className="db-viz-svg">
      <defs>
        <marker id="java-arrow3" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="var(--db-primary)" />
        </marker>
      </defs>

      {/* Component scan */}
      {step === 0 && (
        <g>
          <circle cx="250" cy="140" r="100" fill="transparent" stroke="var(--db-accent)" strokeWidth="2" strokeDasharray="5,3" />
          <text x="250" y="255" textAnchor="middle" fill="var(--db-accent)" fontSize="11" fontWeight="700">Scanning beans...</text>
        </g>
      )}

      {/* Spring IoC ApplicationContext bean registry */}
      <rect x="150" y="30" width="200" height="220" rx="16" fill="var(--db-card)" stroke="var(--db-border)" strokeWidth="1.5" />
      <rect x="150" y="30" width="200" height="40" rx="16" fill="var(--db-primary)" />
      <text x="250" y="55" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">Spring ApplicationContext</text>

      {step >= 1 && (
        <g>
          <rect x="160" y="85" width="180" height="35" rx="8" fill="rgba(16, 185, 129, 0.08)" stroke="var(--db-success)" strokeWidth="1" />
          <text x="250" y="107" textAnchor="middle" fill="var(--db-success)" fontSize="10" fontWeight="750">Bean: UserService</text>
        </g>
      )}

      {step >= 2 && (
        <g>
          <rect x="160" y="130" width="180" height="35" rx="8" fill="rgba(37, 99, 235, 0.08)" stroke="var(--db-primary)" strokeWidth="1" />
          <text x="250" y="152" textAnchor="middle" fill="var(--db-primary)" fontSize="10" fontWeight="750">Bean: UserController</text>
        </g>
      )}

      {/* Autowired injection link */}
      {step === 2 && (
        <g>
          <path d="M 250 130 L 250 120" fill="transparent" stroke="var(--db-primary)" strokeWidth="2" markerEnd="url(#java-arrow3)" />
          <text x="290" y="128" fill="var(--db-primary)" fontSize="8.5" fontWeight="700">@Autowired Inject</text>
        </g>
      )}

      {/* Request mapping flow */}
      {step === 3 && (
        <g>
          <path d="M 20 180 L 140 180" fill="transparent" stroke="var(--db-accent)" strokeWidth="2.5" markerEnd="url(#java-arrow3)" />
          <text x="80" y="168" textAnchor="middle" fill="var(--db-accent)" fontSize="9" fontWeight="700">GET /users</text>
        </g>
      )}
    </svg>
  );
}

// 4. Session Tracking
function SessionTrackerViz({ step }) {
  return (
    <svg viewBox="0 0 500 280" className="db-viz-svg">
      <defs>
        <marker id="java-arrow4" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="var(--db-primary)" />
        </marker>
      </defs>

      {/* Client browser */}
      <g transform="translate(10, 50)">
        <rect x="0" y="0" width="150" height="150" rx="12" fill="var(--db-card)" stroke="var(--db-border)" />
        <rect x="0" y="0" width="150" height="30" rx="12" fill="var(--db-text-muted)" />
        <text x="75" y="18" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Client Browser</text>
        
        {step >= 1 && (
          <g>
            <rect x="10" y="45" width="130" height="40" rx="6" fill="rgba(245, 158, 11, 0.08)" stroke="var(--db-warning)" />
            <text x="20" y="65" fill="var(--db-text)" fontSize="8" fontWeight="700">Cookie: JSESSIONID</text>
            <text x="20" y="78" fill="var(--db-warning)" fontSize="7" fontWeight="700">UUID-99x88ff</text>
          </g>
        )}
      </g>

      {/* Server Context maps */}
      <g transform="translate(310, 50)">
        <rect x="0" y="0" width="180" height="150" rx="12" fill="var(--db-card)" stroke="var(--db-border)" />
        <rect x="0" y="0" width="180" height="30" rx="12" fill="var(--db-primary)" />
        <text x="90" y="18" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Server Session Context</text>

        {step >= 2 && (
          <g>
            <rect x="10" y="45" width="160" height="60" rx="6" fill="rgba(16, 185, 129, 0.08)" stroke="var(--db-success)" />
            <text x="18" y="65" fill="var(--db-success)" fontSize="8.5" fontWeight="750">Key: UUID-99x88ff</text>
            <text x="18" y="80" fill="var(--db-text)" fontSize="8">visitCount: {step === 3 ? '2' : '1'}</text>
          </g>
        )}
      </g>

      {/* Flows */}
      {step === 0 && (
        <path d="M 160 120 L 300 120" fill="transparent" stroke="var(--db-primary)" strokeWidth="2.5" markerEnd="url(#java-arrow4)" />
      )}

      {step === 1 && (
        <g>
          <path d="M 300 140 L 160 140" fill="transparent" stroke="var(--db-warning)" strokeWidth="2" markerEnd="url(#java-arrow4)" />
          <text x="230" y="160" textAnchor="middle" fill="var(--db-warning)" fontSize="8.5" fontWeight="700">Set-Cookie Header</text>
        </g>
      )}
    </svg>
  );
}

// Router switcher
function JavaVizComponent({ vizType, step }) {
  switch (vizType) {
    case 'servletLifecycle':
      return <ServletLifecycleViz step={step} />;
    case 'jdbcCrud':
      return <JdbcCrudViz step={step} />;
    case 'springDi':
      return <SpringDiViz step={step} />;
    case 'sessionTracker':
      return <SessionTrackerViz step={step} />;
    default:
      return <div className="text-center p-8 text-gray-400">Simulation not implemented</div>;
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT — follows exact DBMSLab.jsx structure
// ═══════════════════════════════════════════════════════════
export default function JavaLab() {
  const [level, setLevel] = useState('categories'); // 'categories', 'topics', 'concept'
  const [category, setCategory] = useState(null);
  const [topic, setTopic] = useState(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [xp, setXp] = useState(() => Number(localStorage.getItem('java_xp') || 0));
  const [completedTopics, setCompletedTopics] = useState(() => {
    const saved = localStorage.getItem('java_completed_topics');
    return saved ? JSON.parse(saved) : [];
  });

  const totalXP = xp;
  const streak = 5;
  const totalCompleted = completedTopics.length;

  const openCategory = (cat) => {
    if (cat.locked) return;
    setCategory(cat);
    setLevel('topics');
  };

  const openTopic = (t) => {
    setTopic(t);
    setStep(0);
    setPlaying(false);
    setLevel('concept');
  };

  const goHome = () => {
    setLevel('categories');
    setCategory(null);
    setTopic(null);
  };

  const goTopics = () => {
    setLevel('topics');
    setTopic(null);
  };

  // Autoplay handler
  useEffect(() => {
    let timer = null;
    if (playing && topic) {
      timer = setInterval(() => {
        setStep((currentStep) => {
          if (currentStep < topic.steps - 1) {
            return currentStep + 1;
          } else {
            setPlaying(false);
            // Award XP on complete topic
            if (!completedTopics.includes(topic.id)) {
              const newCompleted = [...completedTopics, topic.id];
              setCompletedTopics(newCompleted);
              localStorage.setItem('java_completed_topics', JSON.stringify(newCompleted));
              const newXP = xp + (category?.xp || 50);
              setXp(newXP);
              localStorage.setItem('java_xp', newXP.toString());
            }
            return currentStep;
          }
        });
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [playing, topic, completedTopics, category, xp]);

  // Compute circular progress
  const getCategoryProgress = (cat) => {
    if (!cat.topics || cat.topics.length === 0) return 0;
    const completedInCat = cat.topics.filter(t => completedTopics.includes(t.id)).length;
    return Math.round((completedInCat / cat.topics.length) * 100);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const filteredData = JAVA_DATA.filter(cat =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="java-lab p-6">

      {/* ─── Breadcrumbs ─── */}
      {level !== 'categories' && (
        <div className="db-breadcrumb">
          <button className="db-breadcrumb-btn" onClick={goHome}>
            <Home size={14} /> Java Lab
          </button>
          {level === 'topics' && (
            <>
              <span className="db-breadcrumb-sep">›</span>
              <span className="db-breadcrumb-current">{category?.title}</span>
            </>
          )}
          {level === 'concept' && (
            <>
              <span className="db-breadcrumb-sep">›</span>
              <button className="db-breadcrumb-btn" onClick={goTopics}>{category?.title}</button>
              <span className="db-breadcrumb-sep">›</span>
              <span className="db-breadcrumb-current">{topic?.title}</span>
            </>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* ─── LEVEL 1: DASHBOARD CATEGORIES ─── */}
        {level === 'categories' && (
          <motion.div key="categories" {...pageVariants}>

            {/* Top Stats bar */}
            <div className="db-stats-banner">
              <div className="db-stat-card">
                <div className="db-stat-icon-wrapper" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--db-primary)' }}>✨</div>
                <div className="db-stat-info">
                  <span className="db-stat-value">{totalXP}</span>
                  <span className="db-stat-label">Total XP</span>
                </div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--db-warning)' }}>🔥</div>
                <div className="db-stat-info">
                  <span className="db-stat-value">{streak} Days</span>
                  <span className="db-stat-label">Streak</span>
                </div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--db-success)' }}>🏆</div>
                <div className="db-stat-info">
                  <span className="db-stat-value">{totalCompleted}</span>
                  <span className="db-stat-label">Modules Completed</span>
                </div>
              </div>
            </div>

            <div className="db-header">
              <div className="db-title-area">
                <h1>☕ Advanced Java Lab</h1>
                <p>Master enterprise Java concepts through interactive JVM simulations.</p>
              </div>
              <div className="db-search-bar">
                <Search size={16} className="db-search-icon" />
                <input
                  type="text"
                  placeholder="Search Java modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="db-grid">
              {filteredData.map((cat) => {
                const progress = getCategoryProgress(cat);
                const radius = 16;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (progress / 100) * circumference;

                return (
                  <motion.div
                    key={cat.id}
                    className={`db-card-el ${cat.locked ? 'opacity-70' : ''}`}
                    style={{ '--card-color': cat.color, '--card-gradient': cat.gradient }}
                    whileTap={cat.locked ? {} : { scale: 0.98 }}
                  >
                    <div className="db-card-top">
                      <div className="db-card-icon" style={{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)`, color: cat.color }}>
                        <cat.Icon size={24} />
                      </div>

                      {!cat.locked && (
                        <div className="db-progress-ring-container">
                          <svg width="36" height="36">
                            <circle className="db-progress-ring-bg" cx="18" cy="18" r={radius} />
                            <circle
                              className="db-progress-ring-circle"
                              cx="18"
                              cy="18"
                              r={radius}
                              strokeDasharray={`${circumference} ${circumference}`}
                              strokeDashoffset={strokeDashoffset}
                              style={{ stroke: cat.color }}
                            />
                          </svg>
                          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '8px', fontWeight: 'bold' }}>
                            {progress}%
                          </span>
                        </div>
                      )}

                      {cat.locked && <span className="db-card-badge advanced" style={{ background: '#E2E8F0', color: '#64748B' }}>Locked</span>}
                      {!cat.locked && <span className={`db-card-badge ${cat.difficulty}`}>{cat.difficulty}</span>}
                    </div>

                    <h3 className="db-card-title">{cat.title}</h3>
                    <p className="db-card-desc">{cat.description}</p>

                    <div className="db-card-footer">
                      <div className="db-card-meta">
                        <span className="db-meta-item">⏱ {cat.duration}</span>
                        <span className="db-meta-item">💎 {cat.xp} XP</span>
                      </div>
                      <button
                        className="db-card-btn"
                        onClick={() => openCategory(cat)}
                        disabled={cat.locked}
                      >
                        <ArrowRight size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── LEVEL 2: TOPICS LIST ─── */}
        {level === 'topics' && category && (
          <motion.div key="topics" {...pageVariants}>
            <div className="db-header">
              <div className="db-title-area">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <category.Icon size={32} style={{ color: category.color }} />
                  {category.title}
                </h1>
                <p>{category.description}</p>
              </div>
              <button className="db-breadcrumb-btn" onClick={goHome} style={{ border: '1px solid var(--db-border)', padding: '10px 18px', borderRadius: '12px' }}>
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
            </div>

            <div className="db-grid" style={{ marginTop: '24px' }}>
              {category.topics.map((t, idx) => (
                <div key={t.id} className="db-card-el">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">Topic {idx + 1}</span>
                  <h3 className="db-card-title">{t.title}</h3>
                  <p className="db-card-desc">{t.preview}</p>
                  <div className="db-card-footer">
                    <button className="db-card-btn" onClick={() => openTopic(t)} style={{ background: category.color }}>
                      <Eye size={14} /> Visualize Lab
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── LEVEL 3: CONCEPT SIMULATOR ─── */}
        {level === 'concept' && topic && (
          <motion.div key="concept" {...pageVariants}>
            <div className="db-header">
              <div className="db-title-area">
                <h1>{topic.title}</h1>
                <p>Run JVM lifecycle simulations and step through thread state modifications.</p>
              </div>
              <button className="db-breadcrumb-btn" onClick={goTopics} style={{ border: '1px solid var(--db-border)', padding: '10px 18px', borderRadius: '12px' }}>
                <ArrowLeft size={16} /> Back to Topics
              </button>
            </div>

            <div className="db-lab-panel">
              {/* Visualization Canvas */}
              <div className="db-viz-panel">
                <div className="db-viz-topbar">
                  <span className="db-viz-title">
                    <span className="db-live-dot" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                    JVM Thread Canvas
                  </span>
                  <span className="db-viz-badge">Step {step + 1} / {topic.steps}</span>
                </div>
                <div className="db-viz-canvas">
                  <JavaVizComponent vizType={topic.vizType} step={step} />
                </div>
              </div>

              {/* Code/Concept Panel */}
              <div className="db-code-panel">
                <div className="db-code-topbar">
                  <div className="db-code-dots">
                    <span /><span /><span />
                  </div>
                  <span className="db-code-filename">App.java</span>
                  <span className="db-code-lang">Java</span>
                </div>
                <pre className="db-code-body">{topic.code}</pre>
              </div>
            </div>

            {/* Timeline Playback Controls */}
            <div className="db-timeline">
              <div className="db-timeline-label">⏱ JVM Execution Timeline</div>
              <div className="db-timeline-controls">
                <button className="db-tl-btn" title="Reset" onClick={() => { setStep(0); setPlaying(false); }}>
                  <RotateCcw size={15} />
                </button>
                <button className="db-tl-btn play-btn" title={playing ? 'Pause' : 'Play'} onClick={() => {
                  if (step >= topic.steps - 1) setStep(0);
                  setPlaying(!playing);
                }}>
                  {playing ? <Pause size={15} /> : <Play size={15} />}
                </button>
                <div className="db-tl-slider-wrap">
                  <input
                    type="range"
                    className="db-tl-slider"
                    min={0}
                    max={topic.steps - 1}
                    value={step}
                    style={{ '--progress': `${(step / (topic.steps - 1)) * 100}%` }}
                    onChange={e => { setStep(Number(e.target.value)); setPlaying(false); }}
                  />
                  <div className="db-tl-steps">
                    {topic.stepLabels.map((lbl, idx) => (
                      <span
                        key={idx}
                        className={`db-tl-step-label ${idx === step ? 'active' : ''}`}
                        onClick={() => { setStep(idx); setPlaying(false); }}
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step Explanation Card */}
            {topic.stepDescriptions?.[step] && (
              <motion.div
                key={`desc-${step}`}
                className="db-step-info"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h4>
                  <span className="db-step-num-badge">{step + 1}</span>
                  {topic.stepLabels?.[step]}
                </h4>
                <p>{topic.stepDescriptions[step]}</p>
              </motion.div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
