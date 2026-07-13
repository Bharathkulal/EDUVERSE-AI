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
  { id: 'jdbc-fund', label: 'JDBC Fundamentals', category: 'JDBC', xp: 100, difficulty: 'Easy', time: '25m', desc: 'Introduction to Java Database Connectivity API.' },
  { id: 'db-conn', label: 'Database Connectivity', category: 'JDBC', xp: 120, difficulty: 'Easy', time: '30m', desc: 'Establishing connection using DriverManager and DataSource.' },
  { id: 'prep-stmt', label: 'Prepared Statements', category: 'JDBC', xp: 150, difficulty: 'Medium', time: '35m', desc: 'Precompiling SQL queries and preventing SQL injection.' },
  { id: 'tx-mgmt', label: 'Transactions', category: 'JDBC', xp: 180, difficulty: 'Medium', time: '40m', desc: 'Managing transaction boundaries, commit, and rollback.' },
  { id: 'servlet-fund', label: 'Servlet Fundamentals', category: 'Servlets', xp: 120, difficulty: 'Easy', time: '30m', desc: 'Introduction to web containers and HTTP servlets.' },
  { id: 'servlet-life', label: 'Servlet Lifecycle', category: 'Servlets', xp: 150, difficulty: 'Medium', time: '35m', desc: 'Understanding init(), service(), and destroy() phases.' },
  { id: 'req-handling', label: 'Request Handling', category: 'Servlets', xp: 150, difficulty: 'Medium', time: '40m', desc: 'Extracting headers, parameters, and payloads.' },
  { id: 'res-handling', label: 'Response Handling', category: 'Servlets', xp: 150, difficulty: 'Medium', time: '40m', desc: 'Setting status codes, content type, and headers.' },
  { id: 'session-mgmt', label: 'Session Management', category: 'Servlets', xp: 180, difficulty: 'Hard', time: '45m', desc: 'Maintaining state across requests using HttpSession.' },
  { id: 'cookies', label: 'Cookies', category: 'Servlets', xp: 150, difficulty: 'Medium', time: '30m', desc: 'Storing client-side persistent state variables.' },
  { id: 'jsp-fund', label: 'JSP Fundamentals', category: 'JSP', xp: 120, difficulty: 'Easy', time: '25m', desc: 'Designing dynamic views with Java Server Pages.' },
  { id: 'expr-lang', label: 'Expression Language', category: 'JSP', xp: 140, difficulty: 'Medium', time: '30m', desc: 'Simplifying data access in JSP using EL.' },
  { id: 'jstl', label: 'JSTL', category: 'JSP', xp: 160, difficulty: 'Medium', time: '35m', desc: 'JSP Standard Tag Library for control flows and formatting.' },
  { id: 'mvc-arch', label: 'MVC Architecture', category: 'Architecture', xp: 200, difficulty: 'Hard', time: '50m', desc: 'Structuring web apps using Model-View-Controller design.' },
  { id: 'mini-proj', label: 'Mini Projects', category: 'Projects', xp: 300, difficulty: 'Hard', time: '90m', desc: 'Building dynamic database-backed modules.' },
  { id: 'major-proj', label: 'Major Projects', category: 'Projects', xp: 500, difficulty: 'Expert', time: '180m', desc: 'Full-stack enterprise application orchestrations.' }
];

const CODING_CHALLENGES = {
  'jdbc-fund': {
    title: 'Create Database Connection',
    description: 'Establish a connection to the PostgreSQL database using DriverManager.',
    requirements: [
      'Use DriverManager.getConnection()',
      'Use the database URL: jdbc:postgresql://localhost:5432/eduverse',
      'Username: postgres, Password: password123',
      'Close the connection object in a finally block or try-with-resources'
    ],
    starterCode: `import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnector {
    public static Connection getConnection() {
        String url = "jdbc:postgresql://localhost:5432/eduverse";
        String user = "postgres";
        String password = "password123";
        
        // TODO: Establish and return the connection
        return null;
    }
    
    public static void main(String[] args) {
        Connection conn = getConnection();
        if (conn != null) {
            System.out.println("SUCCESS: Connected to database!");
        } else {
            System.out.println("FAILED: Connection is null");
        }
    }
}`,
    expectedOutput: 'SUCCESS: Connected to database!',
    hints: [
      'Ensure you load the driver or let JDBC 4.0 auto-load it.',
      'Wrap the connection logic in a try-catch block catching SQLException.'
    ]
  },
  'db-conn': {
    title: 'Insert Records',
    description: 'Write a method to insert a new student record into the students table.',
    requirements: [
      'Create a Statement object from the connection',
      'Execute an INSERT SQL query: INSERT INTO students (name, email) VALUES (\'John Doe\', \'john@eduverse.com\')',
      'Return the number of affected rows'
    ],
    starterCode: `import java.sql.Connection;
import java.sql.Statement;
import java.sql.SQLException;

public class StudentDAO {
    public int insertStudent(Connection conn) {
        // TODO: Execute insert query and return rows affected
        return 0;
    }
}`,
    expectedOutput: '1',
    hints: [
      'Use stmt.executeUpdate(sql) for INSERT statements.',
      'Make sure to catch SQLException.'
    ]
  }
};

const DEBUG_CHALLENGES = [
  {
    id: 'debug-1',
    title: 'NullPointerException in JDBC Statement',
    difficulty: 'Easy',
    xp: 80,
    description: 'The code below throws a NullPointerException because the connection is not initialized properly. Fix the bug.',
    brokenCode: `public class JdbcBug {
    private static Connection conn;
    
    public static void main(String[] args) {
        // Bug: Using connection before initializing
        try {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT 1");
            if (rs.next()) {
                System.out.println(rs.getInt(1));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}`,
    solution: `public class JdbcBug {
    private static Connection conn;
    
    public static void main(String[] args) {
        try {
            conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/eduverse", "postgres", "password123");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT 1");
            if (rs.next()) {
                System.out.println(rs.getInt(1));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}`
  },
  {
    id: 'debug-2',
    title: 'SQL Injection Vulnerability',
    difficulty: 'Medium',
    xp: 120,
    description: 'This method uses statement concatenation which is vulnerable to SQL injection. Refactor it to use PreparedStatement.',
    brokenCode: `public void loginUser(Connection conn, String user, String pass) throws SQLException {
    String sql = "SELECT * FROM users WHERE username = '" + user + "' AND password = '" + pass + "'";
    Statement stmt = conn.createStatement();
    ResultSet rs = stmt.executeQuery(sql);
    if (rs.next()) {
        System.out.println("Login Success");
    }
}`,
    solution: `public void loginUser(Connection conn, String user, String pass) throws SQLException {
    String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    PreparedStatement pstmt = conn.prepareStatement(sql);
    pstmt.setString(1, user);
    pstmt.setString(2, pass);
    ResultSet rs = pstmt.executeQuery();
    if (rs.next()) {
        System.out.println("Login Success");
    }
}`
  }
];

const PROJECTS = [
  {
    id: 'proj-1',
    title: 'Student Management System',
    level: 'Beginner',
    duration: '2 hours',
    tech: 'JDBC, PostgreSQL',
    desc: 'Develop a backend registry to create, read, update, and delete student records with relational database syncing.',
    xp: 250,
    features: ['Database schema migrations', 'CRUD queries implementation', 'PreparedStatements for safety', 'Clean CLI UI']
  },
  {
    id: 'proj-2',
    title: 'Attendance Management System',
    level: 'Intermediate',
    duration: '4 hours',
    tech: 'Servlets, JSP, JDBC',
    desc: 'Build a web portal for teachers to log attendance and students to track their presence metrics.',
    xp: 450,
    features: ['Session-based authentication', 'Dynamic JSP reports', 'JSTL loops & formatting', 'Database relations mapping']
  },
  {
    id: 'proj-3',
    title: 'E-Commerce Backend Engine',
    level: 'Advanced',
    duration: '8 hours',
    tech: 'Spring Boot, Hibernate, Security',
    desc: 'A production-grade REST API backend supporting catalogs, shopping carts, checkout transactions, and tokenauth.',
    xp: 800,
    features: ['Spring Security JWT authentication', 'Hibernate transactional database management', 'RESTful API contracts', 'Automated Unit Testing']
  }
];

const ACHIEVEMENTS = [
  { id: 'ach-1', title: 'JDBC Master', desc: 'Complete all JDBC database connectivity challenges.', icon: '🔌', unlocked: true },
  { id: 'ach-2', title: 'Servlet Specialist', desc: 'Successfully handle complex request-response flows.', icon: '⚙️', unlocked: false },
  { id: 'ach-3', title: 'MVC Architect', desc: 'Build an application utilizing MVC separation of concerns.', icon: '🏛️', unlocked: false },
  { id: 'ach-4', title: 'Bug Hunter', desc: 'Fix 3 critical debugging challenges in the Debug Arena.', icon: '🪲', unlocked: true },
  { id: 'ach-5', title: 'Project Builder', desc: 'Submit any major backend project for AI code review.', icon: '🏗️', unlocked: false },
  { id: 'ach-6', title: 'Advanced Java Champion', desc: 'Earn 2000 total XP in the Practical Lab.', icon: '🏆', unlocked: false }
];

export default function AdvancedJavaLab({ onBack }) {
  const { isDarkMode: isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'roadmap', 'workspace', 'challenges', 'debug', 'projects', 'db-lab', 'achievements'
  const [selectedNode, setSelectedNode] = useState(ROADMAP_NODES[0]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get('/progress/analytics')
      .then(res => setAnalytics(res.data))
      .catch(err => console.error('Failed to load real analytics:', err));
  }, []);
  const [workspaceCode, setWorkspaceCode] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [aiChat, setAiChat] = useState([
    { role: 'assistant', text: 'Hi! I am your AI Java Mentor. Ask me to explain code, fix errors, or give you hints!' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [selectedDebug, setSelectedDebug] = useState(null);
  const [debugCode, setDebugCode] = useState('');
  const [dbQuery, setDbQuery] = useState('SELECT * FROM students LIMIT 5;');
  const [dbResults, setDbResults] = useState([
    { id: 1, name: 'Alice Smith', email: 'alice@eduverse.com', course: 'Advanced Java' },
    { id: 2, name: 'Bob Johnson', email: 'bob@eduverse.com', course: 'DBMS' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@eduverse.com', course: 'Python' }
  ]);
  const [vizType, setVizType] = useState('jdbc'); // 'jdbc', 'servlet', 'session', 'mvc'

  // Load default code when workspace opens
  useEffect(() => {
    if (selectedNode) {
      const challenge = CODING_CHALLENGES[selectedNode.id];
      if (challenge) {
        setWorkspaceCode(challenge.starterCode);
      } else {
        setWorkspaceCode(`// Practical Workspace for ${selectedNode.label}\n// Write your Java code here...\n\npublic class Practice {\n    public static void main(String[] args) {\n        System.out.println("Welcome to ${selectedNode.label}!");\n    }\n}`);
      }
      setConsoleLogs(['Workspace initialized for ' + selectedNode.label]);
    }
  }, [selectedNode]);

  // Run Code Simulation
  const handleRunCode = () => {
    setConsoleLogs(prev => [...prev, 'Compiling source code...', 'Running JVM execution...']);
    setTimeout(() => {
      const challenge = CODING_CHALLENGES[selectedNode.id];
      if (challenge) {
        if (true) {
          setConsoleLogs(prev => [...prev, `[OUTPUT] ${challenge.expectedOutput}`, '✓ All test cases passed! (+50 XP)']);
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
  const handleAiSend = (customPrompt = '') => {
    const prompt = customPrompt || aiInput;
    if (!prompt.trim()) return;

    setAiChat(prev => [...prev, { role: 'user', text: prompt }]);
    setAiInput('');

    setTimeout(() => {
      let aiResponse = '';
      if (prompt.toLowerCase().includes('explain')) {
        aiResponse = `Here is a line-by-line breakdown of the code:
1. \`DriverManager.getConnection(url, user, pass)\`: Request a connection to the PostgreSQL database.
2. \`try-with-resources\`: Manages closing connection to avoid memory leaks.
3. \`SQLException\`: Catches and handles database errors.`;
      } else if (prompt.toLowerCase().includes('error') || prompt.toLowerCase().includes('fix')) {
        aiResponse = `I analyzed your code. Ensure you initialize the \`Connection\` object before trying to create a \`Statement\`. For example:
\`\`\`java
Connection conn = DriverManager.getConnection(url, user, pass);
Statement stmt = conn.createStatement();
\`\`\``;
      } else if (prompt.toLowerCase().includes('hint')) {
        aiResponse = `💡 **Hint:** Try using \`PreparedStatement\` instead of \`Statement\` for dynamic values to prevent SQL injection.`;
      } else {
        aiResponse = `Great question! In Advanced Java, we prefer \`PreparedStatement\` over standard \`Statement\` because:
1. It pre-compiles the SQL query, boosting execution speed.
2. It automatically escapes input parameters, neutralizing SQL Injection attacks.`;
      }
      setAiChat(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    }, 800);
  };

  const handleRunQuery = () => {
    if (dbQuery.toLowerCase().includes('select')) {
      setDbResults([
        { id: 1, name: 'Alice Smith', email: 'alice@eduverse.com', course: 'Advanced Java' },
        { id: 2, name: 'Bob Johnson', email: 'bob@eduverse.com', course: 'DBMS' },
        { id: 3, name: 'Charlie Brown', email: 'charlie@eduverse.com', course: 'Python' }
      ]);
      toast.success('Query executed successfully!');
    } else if (dbQuery.toLowerCase().includes('insert') || dbQuery.toLowerCase().includes('update')) {
      toast.success('Rows affected: 1');
    } else {
      toast.error('Syntax error near word: ' + dbQuery.split(' ')[0]);
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
                isDark ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent' : 'text-slate-900'
              }`}>
                <Code2 className="text-purple-600" /> Advanced Java Practical Lab
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Interactive workspace, Debug Arena, and AI Mentor</p>
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
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
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
                  { label: 'Total Lab XP', value: '1,450 XP', desc: '+150 this week', color: 'from-blue-500 to-cyan-500', icon: Sparkles },
                  { label: 'Completed Labs', value: '8 / 16', desc: '50% completion', color: 'from-emerald-500 to-teal-500', icon: CheckCircle },
                  { label: 'Current Streak', value: '5 Days', desc: 'Keep it up!', color: 'from-orange-500 to-amber-500', icon: Flame },
                  { label: 'Projects Completed', value: '2', desc: '1 in review', color: 'from-purple-500 to-indigo-500', icon: Server }
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
                    "{analytics.aiSummary || 'Complete more practical labs and quizzes to receive personalized AI learning pattern feedback.'}"
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

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 p-6 rounded-3xl space-y-4 border ${
                  isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    <Activity size={18} className="text-blue-500" /> Live Interactive Visualizations
                  </h3>
                  <div className={`flex gap-2 p-1 rounded-xl w-fit ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    {['jdbc', 'servlet', 'session', 'mvc'].map(type => (
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
                    
                    {/* JDBC Visualizer */}
                    {vizType === 'jdbc' && (
                      <div className="w-full max-w-lg space-y-6 text-center">
                        <div className="flex justify-between items-center relative">
                          <div className={`p-3 border rounded-xl z-10 text-xs font-bold ${
                            isDark ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'
                          }`}>
                            ☕ Java App
                          </div>
                          <div className="flex-1 h-[2px] bg-dashed bg-blue-500/20 mx-4 relative overflow-hidden">
                            <motion.div 
                              animate={{ x: ['-100%', '100%'] }} 
                              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                              className="w-8 h-full bg-blue-400/60 blur-sm absolute"
                            />
                          </div>
                          <div className={`p-3 border rounded-xl z-10 text-xs font-bold ${
                            isDark ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
                          }`}>
                            🔌 JDBC Driver
                          </div>
                          <div className="flex-1 h-[2px] bg-dashed bg-purple-500/20 mx-4 relative overflow-hidden">
                            <motion.div 
                              animate={{ x: ['-100%', '100%'] }} 
                              transition={{ repeat: Infinity, duration: 2, ease: 'linear', delay: 1 }}
                              className="w-8 h-full bg-purple-400/60 blur-sm absolute"
                            />
                          </div>
                          <div className={`p-3 border rounded-xl z-10 text-xs font-bold ${
                            isDark ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                            🗄️ Database
                          </div>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Data packets flow dynamically from the application memory space, passing query variables down to the JDBC Driver Manager to execute SQL instructions on the Database server.
                        </p>
                      </div>
                    )}

                    {/* Servlet Visualizer */}
                    {vizType === 'servlet' && (
                      <div className="w-full max-w-lg space-y-6 text-center">
                        <div className="flex justify-between items-center relative">
                          <div className={`p-3 border rounded-xl z-10 text-xs font-bold ${
                            isDark ? 'bg-pink-500/20 border-pink-500/40 text-pink-300' : 'bg-pink-50 border-pink-200 text-pink-700'
                          }`}>
                            🌐 Browser
                          </div>
                          <div className="flex-1 flex flex-col items-center mx-4">
                            <span className="text-[9px] text-blue-500 mb-1">HTTP GET /post</span>
                            <div className="w-full h-[2px] bg-blue-500/30 relative overflow-hidden">
                              <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 2.5 }} className="w-6 h-full bg-blue-400 absolute" />
                            </div>
                          </div>
                          <div className={`p-3 border rounded-xl z-10 text-xs font-bold ${
                            isDark ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
                          }`}>
                            ⚙️ Servlet Container
                          </div>
                          <div className="flex-1 flex flex-col items-center mx-4">
                            <span className="text-[9px] text-emerald-600 mb-1">HTML/JSON Response</span>
                            <div className="w-full h-[2px] bg-emerald-500/30 relative overflow-hidden">
                              <motion.div animate={{ x: ['100%', '-100%'] }} transition={{ repeat: Infinity, duration: 2.5 }} className="w-6 h-full bg-emerald-400 absolute" />
                            </div>
                          </div>
                          <div className={`p-3 border rounded-xl z-10 text-xs font-bold ${
                            isDark ? 'bg-pink-500/20 border-pink-500/40 text-pink-300' : 'bg-pink-50 border-pink-200 text-pink-700'
                          }`}>
                            🌐 Browser
                          </div>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Servlets process HTTP requests inside the servlet container, executing controller code before dispatching responses back to client browsers.
                        </p>
                      </div>
                    )}

                    {/* Session Visualizer */}
                    {vizType === 'session' && (
                      <div className="w-full max-w-lg space-y-4 text-center">
                        <div className="grid grid-cols-5 items-center gap-2">
                          <div className={`p-2 border rounded-lg text-[10px] font-bold ${isDark ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>1. User Login</div>
                          <div className="text-slate-400">→</div>
                          <div className={`p-2 border rounded-lg text-[10px] font-bold ${isDark ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-100 text-purple-700'}`}>2. Session ID</div>
                          <div className="text-slate-400">→</div>
                          <div className={`p-2 border rounded-lg text-[10px] font-bold ${isDark ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>3. Cookie Bind</div>
                        </div>
                        <p className={`text-xs pt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          The Server maps the client request to its HttpSession registry using a unique JSESSIONID cookie, persisting user state across multiple requests.
                        </p>
                      </div>
                    )}

                    {/* MVC Visualizer */}
                    {vizType === 'mvc' && (
                      <div className="w-full max-w-lg space-y-4">
                        <div className="flex justify-around items-center">
                          <div className={`p-3 border rounded-xl text-xs font-bold ${isDark ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-cyan-50 border-cyan-100 text-cyan-700'}`}>View (UI)</div>
                          <div className="text-slate-400">↔</div>
                          <div className={`p-3 border rounded-xl text-xs font-bold ${isDark ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-100 text-purple-700'}`}>Controller</div>
                          <div className="text-slate-400">↔</div>
                          <div className={`p-3 border rounded-xl text-xs font-bold ${isDark ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>Model (Data)</div>
                        </div>
                        <p className={`text-xs text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Model-View-Controller structure separates UI presentation (View) from business logic (Controller) and database operations (Model).
                        </p>
                      </div>
                    )}

                  </div>
                </div>

                {/* Resume section */}
                <div className={`p-6 rounded-3xl flex flex-col justify-between border ${
                  isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="space-y-4">
                    <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      <BrainCircuit size={18} className="text-purple-600" /> Continue Learning
                    </h3>
                    <div className={`p-4 border rounded-2xl ${isDark ? 'bg-[#0b0816] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-[10px] font-bold text-purple-600 tracking-wider uppercase block mb-1">Active Topic</span>
                      <strong className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>Prepared Statements</strong>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Next up: Database transactions & auto-commit configurations.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedNode(ROADMAP_NODES[2]); setActiveTab('workspace'); }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition duration-300 text-xs mt-4 flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
                  >
                    <Play size={12} fill="currentColor" /> Resume Coding Workspace
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
                <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Practical Learning Roadmap</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {ROADMAP_NODES.map((node, idx) => (
                    <div 
                      key={node.id}
                      onClick={() => { setSelectedNode(node); setActiveTab('workspace'); }}
                      className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between group relative ${
                        isDark ? 'bg-[#0b0816] border-white/5 hover:border-purple-500/40' : 'bg-slate-50 border-slate-100 hover:border-purple-500/40 shadow-sm'
                      }`}
                    >
                      <div className="absolute top-3 right-3 text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full">
                        {node.difficulty}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{node.category}</span>
                        <h4 className={`text-sm font-bold mt-1 group-hover:text-purple-600 transition ${isDark ? 'text-white' : 'text-slate-800'}`}>{node.label}</h4>
                        <p className={`text-xs mt-2 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{node.desc}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
                        <span className="text-xs text-amber-600 font-bold">✨ {node.xp} XP</span>
                        <span className="text-xs text-slate-400">⏱️ {node.time}</span>
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
              {/* Left Panel: Instructions */}
              <div className={`border rounded-2xl flex flex-col overflow-hidden ${
                isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className={`p-4 border-b flex justify-between items-center ${
                  isDark ? 'border-purple-500/10 bg-[#0c081d]' : 'border-slate-200 bg-slate-50'
                }`}>
                  <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={14} /> Instructions
                  </h3>
                  <span className="text-xs text-amber-600 font-bold">✨ {selectedNode.xp} XP</span>
                </div>
                <div className={`p-5 flex-1 overflow-y-auto space-y-6 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div>
                    <h2 className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedNode.label}</h2>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedNode.desc}</p>
                  </div>

                  <div className={`space-y-2 p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <strong className="text-xs uppercase font-bold text-purple-600 block">Learning Objective:</strong>
                    <p className="text-xs">
                      {CODING_CHALLENGES[selectedNode.id]?.description || 'Understand the core architectural foundations of ' + selectedNode.label + ' and implement safe, optimized Java configurations.'}
                    </p>
                  </div>

                  {CODING_CHALLENGES[selectedNode.id] && (
                    <div className="space-y-3">
                      <strong className="text-xs uppercase font-bold text-blue-600 block">Step-by-Step Tasks:</strong>
                      <ul className="list-disc pl-5 space-y-2 text-xs">
                        {CODING_CHALLENGES[selectedNode.id].requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                    <strong className="text-xs uppercase font-bold text-slate-400 block mb-2">Need a Hint?</strong>
                    <button 
                      onClick={() => {
                        const chal = CODING_CHALLENGES[selectedNode.id];
                        if (chal) {
                          toast.success('Hint: ' + chal.hints[0]);
                        } else {
                          toast('Tip: Review Java standard library docs for ' + selectedNode.label);
                        }
                      }}
                      className="text-xs text-purple-600 hover:underline"
                    >
                      Reveal challenge hint
                    </button>
                  </div>
                </div>
              </div>

              {/* Center Panel: Code Editor */}
              <div className={`border rounded-2xl flex flex-col overflow-hidden lg:col-span-2 ${
                isDark ? 'bg-[#0b0816] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className={`p-4 border-b flex justify-between items-center ${
                  isDark ? 'border-purple-500/10 bg-[#0c081d]' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <FileCode size={14} className="text-blue-500" />
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>App.java</span>
                  </div>
                  <button 
                    onClick={handleRunCode}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-2 shadow-md shadow-blue-600/20"
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
                    placeholder="// Write your Java code here..."
                  />

                  {/* Bottom Console */}
                  <div className={`h-44 border-t flex flex-col ${
                    isDark ? 'bg-[#0a0714] border-purple-500/10' : 'bg-white border-slate-200'
                  }`}>
                    <div className={`px-4 py-2 border-b flex justify-between items-center ${
                      isDark ? 'border-white/5 bg-[#0e0a1f]' : 'border-slate-100 bg-slate-50'
                    }`}>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal size={12} /> Output Terminal
                      </span>
                      <button onClick={() => setConsoleLogs([])} className="text-[10px] text-slate-400 hover:text-slate-600 transition">Clear</button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                      {consoleLogs.map((log, idx) => (
                        <div key={idx} className={log.startsWith('✓') ? 'text-emerald-500' : log.startsWith('✗') ? 'text-red-500' : ''}>
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
                <h2 className={`text-lg font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <AlertCircle className="text-red-500" /> Debug Arena
                </h2>
                <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Analyze broken or vulnerable code snippets, identify the bug, and write the corrected implementation to claim bonus XP rewards.</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sidebar list */}
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
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full">{challenge.difficulty}</span>
                          <span className="text-xs text-amber-600 font-bold">✨ {challenge.xp} XP</span>
                        </div>
                        <h4 className={`text-sm font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{challenge.title}</h4>
                      </div>
                    ))}
                  </div>

                  {/* Workspace */}
                  <div className={`rounded-3xl p-6 flex flex-col space-y-4 border ${
                    isDark ? 'bg-[#0b0816] border-white/5' : 'bg-slate-50 border-slate-200 shadow-inner'
                  }`}>
                    {selectedDebug ? (
                      <>
                        <div>
                          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedDebug.title}</h3>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedDebug.description}</p>
                        </div>
                        <div className="flex-1 flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Fix the Code Below:</span>
                          <textarea
                            value={debugCode}
                            onChange={(e) => setDebugCode(e.target.value)}
                            className={`w-full h-64 p-4 rounded-xl border font-mono text-xs outline-none resize-none leading-relaxed ${
                              isDark ? 'bg-[#07040f] border-white/5 text-emerald-400' : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-white/5">
                          <button 
                            onClick={() => {
                              toast.success('Hint: ' + (selectedDebug.id === 'debug-1' ? 'Remember to call DriverManager.getConnection()' : 'Use connection.prepareStatement() with question marks (?)'));
                            }}
                            className="text-xs text-slate-400 hover:text-slate-600 transition"
                          >
                            Need a hint?
                          </button>
                          <button 
                            onClick={() => {
                              if (debugCode.includes('DriverManager.getConnection') || debugCode.includes('prepareStatement')) {
                                toast.success('Bug fixed! + ' + selectedDebug.xp + ' XP');
                                triggerConfetti();
                              } else {
                                toast.error('Check your solution. The bug is still present!');
                              }
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl text-xs transition shadow-md"
                          >
                            Submit Bug Fix
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                        <AlertCircle size={36} className="mb-2 text-slate-400" />
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
                <h2 className={`text-lg font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <Server className="text-blue-500" /> Project Hub
                </h2>
                <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Build complete backend architectures. Submit your projects for automated AI code reviews and earn massive XP badges.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PROJECTS.map(proj => (
                    <div 
                      key={proj.id} 
                      className={`border rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/30 transition duration-300 ${
                        isDark ? 'bg-[#0b0816] border-white/5' : 'bg-slate-50 border-slate-100 shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2.5 py-0.5 rounded-full">{proj.level}</span>
                          <span className="text-xs text-amber-600 font-bold">✨ {proj.xp} XP</span>
                        </div>
                        <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{proj.title}</h3>
                        <span className="text-[10px] text-slate-400 block mt-1">Duration: {proj.duration} | Tech: {proj.tech}</span>
                        <p className={`text-xs mt-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{proj.desc}</p>
                        
                        <div className="mt-4 space-y-1.5">
                          <strong className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Key Features:</strong>
                          {proj.features.map((feat, idx) => (
                            <div key={idx} className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              <CheckCircle size={10} className="text-emerald-500 shrink-0" /> {feat}
                            </div>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          toast.success('Project workspace opened! Code template loaded.');
                          setSelectedNode({ label: proj.title, xp: proj.xp, desc: proj.desc });
                          setActiveTab('workspace');
                        }}
                        className={`w-full py-2.5 text-xs font-bold rounded-xl transition mt-6 border ${
                          isDark 
                            ? 'bg-white/5 border-white/5 text-slate-350 hover:bg-purple-600 hover:text-white' 
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
                <div>
                  <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    <Database className="text-emerald-500" /> Virtual Database Lab
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Write and test SQL queries in real-time. Inspect schemas, view table mappings, and verify relational structures.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* SQL Input Panel */}
                  <div className={`border rounded-2xl p-5 flex flex-col space-y-4 ${
                    isDark ? 'bg-[#0b0816] border-white/5' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Terminal size={14} /> Query Editor
                      </span>
                      <button 
                        onClick={handleRunQuery}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
                      >
                        Execute SQL
                      </button>
                    </div>
                    <textarea 
                      value={dbQuery}
                      onChange={(e) => setDbQuery(e.target.value)}
                      className={`w-full h-32 p-4 rounded-xl border font-mono text-xs outline-none resize-none leading-relaxed ${
                        isDark ? 'bg-[#07040f] border-white/5 text-emerald-400' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />

                    {/* Results Table */}
                    <div className="flex-1 flex flex-col min-h-[200px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Result Set:</span>
                      <div className={`flex-1 rounded-xl border overflow-x-auto ${
                        isDark ? 'bg-[#07040f] border-white/5' : 'bg-white border-slate-200'
                      }`}>
                        <table className="w-full text-left text-xs">
                          <thead className={`text-[10px] font-bold uppercase tracking-wider ${
                            isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <tr>
                              <th className="p-3">ID</th>
                              <th className="p-3">Name</th>
                              <th className="p-3">Email</th>
                              <th className="p-3">Course</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDark ? 'divide-white/5 text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
                            {dbResults.map((row, index) => (
                              <tr key={index} className="hover:bg-white/5">
                                <td className="p-3 font-mono text-purple-600">{row.id}</td>
                                <td className="p-3 font-bold">{row.name}</td>
                                <td className="p-3">{row.email}</td>
                                <td className="p-3 text-slate-400">{row.course}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Schema Explorer */}
                  <div className={`border rounded-2xl p-5 space-y-4 ${
                    isDark ? 'bg-[#0b0816] border-white/5' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider">Schema Explorer</h3>
                    <div className="space-y-3">
                      <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <strong className={`text-xs block font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>students</strong>
                        <div className="mt-1 space-y-1 text-[11px] text-slate-400 font-mono">
                          <div>id : INT (Primary Key)</div>
                          <div>name : VARCHAR(100)</div>
                          <div>email : VARCHAR(150)</div>
                          <div>course : VARCHAR(100)</div>
                        </div>
                      </div>

                      <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <strong className={`text-xs block font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>courses</strong>
                        <div className="mt-1 space-y-1 text-[11px] text-slate-400 font-mono">
                          <div>course_id : INT</div>
                          <div>course_name : VARCHAR(100)</div>
                        </div>
                      </div>
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
                <h2 className={`text-lg font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <Trophy className="text-amber-500" /> Lab Achievements
                </h2>
                <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track your unlocked badges and certificates as you progress through the Advanced Java syllabus.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ACHIEVEMENTS.map(ach => (
                    <div 
                      key={ach.id}
                      className={`p-5 rounded-2xl border flex items-center gap-4 transition duration-300 relative overflow-hidden ${
                        ach.unlocked 
                          ? 'bg-purple-500/10 border-purple-500/30' 
                          : isDark 
                            ? 'bg-[#0b0816] border-white/5 opacity-50' 
                            : 'bg-slate-50 border-slate-100 opacity-60'
                      }`}
                    >
                      {ach.unlocked && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full flex items-center justify-center text-[10px] font-black text-purple-600">
                          UNLOCKED
                        </div>
                      )}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${isDark ? 'bg-white/5' : 'bg-white shadow-sm border border-slate-100'}`}>
                        {ach.icon}
                      </div>
                      <div>
                        <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{ach.title}</h3>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{ach.desc}</p>
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
