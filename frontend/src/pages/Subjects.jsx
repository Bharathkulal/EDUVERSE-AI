import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useHashNavigation } from '../utils/useHashNavigation';
import { useAuth } from '../context/AuthContext';
import { 
  Play, RotateCw, Save, Download, Upload, Terminal as TermIcon, Bot, 
  Settings, Keyboard, Sparkles, X, Maximize2, Minimize2, Plus, Trash2, 
  Check, Compass, Edit, BookOpen, Search, ArrowRight, LayoutGrid, Eye, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const subjectIcons = {
  FOC: '🔢', Java: '☕', 'Advanced Java': '⚡', DSA: '🌳', 'C#': '🔷',
  DBMS: '🗄️', Python: '🐍', 'Web Development': '🌐', Mathematics: '🧮', 'Machine Learning': '🤖',
};

const subjectBlobColors = {
  FOC: 'blob-foc',
  Java: 'blob-java',
  'Advanced Java': 'blob-advjava',
  DSA: 'blob-dsa',
  'C#': 'blob-csharp',
  DBMS: 'blob-dbms',
  Python: 'blob-python',
  'Web Development': 'blob-webdev',
  Mathematics: 'blob-python',
  'Machine Learning': 'blob-advjava',
};

const categories = [
  {
    id: 'programming',
    name: 'Programming & IDEs',
    icon: '💻',
    items: [
      { id: 'java-ide', name: 'Java IDE', desc: 'Write, compile, and run Java code with real-time AI error checking.', icon: '☕', defaultCode: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, EduVerse!");\n  }\n}' },
      { id: 'python-ide', name: 'Python IDE', desc: 'Execute Python scripts with visual debugger and syntax assistance.', icon: '🐍', defaultCode: 'print("Hello, EduVerse AI!")\n# Try writing a list comprehension!' },
      { id: 'c-ide', name: 'C IDE', desc: 'Standard C environment simulator with memory tracking.', icon: '⚡', defaultCode: '#include <stdio.h>\nint main() {\n    printf("Hello C!\\n");\n    return 0;\n}' },
      { id: 'cpp-ide', name: 'C++ IDE', desc: 'C++ template engine and modern STL debugging helper.', icon: '🚀', defaultCode: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello C++!" << endl;\n    return 0;\n}' },
      { id: 'js-ide', name: 'JavaScript IDE', desc: 'Run modern JS code with node runtime and sandbox visuals.', icon: '🟨', defaultCode: 'const greeting = "Hello JS!";\nconsole.log(greeting);\n// Try arrow functions!' },
      { id: 'ts-ide', name: 'TypeScript IDE', desc: 'Compile TS dynamically and explore types system structures.', icon: '🔷', defaultCode: 'interface Learner {\n  name: string;\n  xp: number;\n}\nconst user: Learner = { name: "Guest", xp: 120 };\nconsole.log(user);' },
      { id: 'go', name: 'Go Playground', desc: 'Compile Go routines and explore concurrency structures.', icon: '🐹', defaultCode: 'package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello Go!")\n}' },
      { id: 'rust', name: 'Rust Lab', desc: 'Explore safety, borrow checking, and compile warnings.', icon: '🦀', defaultCode: 'fn main() {\n    println!("Hello Rust!");\n}' },
      { id: 'swift', name: 'Swift Studio', desc: 'Write swift codes for app developments and layouts.', icon: '🍎', defaultCode: 'print("Hello Swift!")' },
      { id: 'sql-play', name: 'SQL Playground', desc: 'Simulate tables, schema definitions, and run select queries.', icon: '🗄️', defaultCode: 'SELECT * FROM students WHERE xp > 1500;' },
      { id: 'html-css', name: 'HTML/CSS Studio', desc: 'Live preview editor for layouts and vanilla styling grids.', icon: '🎨', defaultCode: '<h1>Welcome to EduVerse</h1>\n<p>Enjoy sandbox coding.</p>' },
      { id: 'react-studio', name: 'React Studio', desc: 'Component visualizer with real-time virtual DOM updates.', icon: '⚛️', defaultCode: 'function App() {\n  return <h1>Hello React!</h1>;\n}' }
    ]
  },
  {
    id: 'ai-assistant',
    name: 'AI Coding Assistant',
    icon: '🤖',
    items: [
      { id: 'ai-completion', name: 'AI Code Completion', desc: 'Autofill functions and lines using smart predictive weights.', icon: '🧠' },
      { id: 'ai-bug-finder', name: 'AI Bug Finder', desc: 'Scan files to isolate runtime exceptions and loop holes.', icon: '🐛' },
      { id: 'ai-debugger', name: 'AI Debugger', desc: 'Step-by-step logic checking and state trackers.', icon: '🔧' },
      { id: 'ai-explain', name: 'Explain Code', desc: 'Receive human-readable comments explaining deep logic blocks.', icon: '💬' },
      { id: 'ai-optimize', name: 'Optimize Code', desc: 'Refactor complexity algorithms to O(1) or O(log N).', icon: '⚡' }
    ]
  },
  {
    id: 'math',
    name: 'Mathematics Studio',
    icon: '🧮',
    items: [
      { id: 'equation-solver', name: 'AI Equation Solver', desc: 'Enter equations to obtain step-by-step derivations.', icon: '📐' },
      { id: 'graph-plotter', name: 'Graph Plotter', desc: 'Plot functions in 2D grids and view intersections.', icon: '📈' },
      { id: 'matrix-calc', name: 'Matrix Calculator', desc: 'Compute determinants, eigenvalues, and transpose forms.', icon: '🔢' },
      { id: 'calculus-solver', name: 'Calculus & Integration', desc: 'Simulate limits, derivatives, and definite integration areas.', icon: '∫' }
    ]
  },
  {
    id: 'science',
    name: 'Science Labs',
    icon: '🔬',
    items: [
      { id: 'physics-motion', name: 'Motion Simulator', desc: 'Adjust gravity, velocity, and drag coefficients live.', icon: '⚽' },
      { id: 'chemistry-periodic', name: 'Interactive Periodic Table', desc: 'Explore details, electron orbits, and atomic weights.', icon: '🧪' },
      { id: 'chemistry-balancer', name: 'Chemical Equation Balancer', desc: 'Input chemical formulas to balance coefficients.', icon: '⚗️' },
      { id: 'biology-anatomy', name: 'Human Anatomy 3D', desc: 'Inspect skeletal, muscle, and organ layers.', icon: '💀' }
    ]
  },
  {
    id: 'studios',
    name: 'Advanced Learning Studios',
    icon: '📚',
    items: [
      { id: 'whiteboard', name: 'AI Whiteboard Canvas', desc: 'Infinite canvas to sketch, write formulas, and generate diagrams.', icon: '✏️' },
      { id: 'pdf-studio', name: 'AI PDF Studio', desc: 'Upload study material PDFs to generate quizzes and study cards.', icon: '📄' },
      { id: 'video-learning', name: 'AI Video Learning', desc: 'Translate notes into visual scripts and text narrations.', icon: '🎥' },
      { id: 'image-learning', name: 'AI Image Solver', desc: 'Run OCR scan on uploaded diagrams or homework prompts.', icon: '🖼️' },
      { id: 'voice-classroom', name: 'Voice Classroom', desc: 'Ask doubts aloud and listen to synthesized verbal guides.', icon: '🎙️' }
    ]
  },
  {
    id: 'dsa-db',
    name: 'DSA Lab & Databases',
    icon: '🗄️',
    items: [
      { id: 'sorting-visualizer', name: 'Sorting Visualizer', desc: 'Watch bubbles, quick, and merge elements swap heights.', icon: '📊' },
      { id: 'db-studio', name: 'Database Studio', desc: 'Write SQL, inspect schemas, and auto-generate ER diagrams.', icon: '💾' }
    ]
  },
  {
    id: 'career-hub',
    name: 'Cloud & Career Sandbox',
    icon: '🔥',
    items: [
      { id: 'linux-term', name: 'Linux Terminal', desc: 'Simulate command line, paths, folders, and vim editors.', icon: '🐚' },
      { id: 'prompt-hub', name: 'AI Prompt Hub', desc: 'Build, test, and optimize prompts for multiple model engines.', icon: '🔌' },
      { id: 'interview-studio', name: 'AI Interview Studio', desc: 'Simulate technical rounds with voice assessments.', icon: '👔' },
      { id: 'resume-studio', name: 'Resume Studio', desc: 'Scan and format portfolios to align with ATS requirements.', icon: '📁' }
    ]
  }
];

export default function Subjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subjects');
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem('eduverse_bookmarks') || '[]'));
  const [dsaGameMode, setDsaGameMode] = useState(() => localStorage.getItem('dsa_game_mode') === 'true');

  const { user, guestAiRequests, decrementGuestAiRequests } = useAuth();
  
  // Guest Sandbox states
  const [subjectSubTab, setSubjectSubTab] = useState('sandbox');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sandboxSearch, setSandboxSearch] = useState('');
  
  // Interactive Workspace states
  const [selectedModule, setSelectedModule] = useState(null);
  const [workspaceCode, setWorkspaceCode] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState('editor'); // 'editor', 'visual'
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('DeepSeek R1');
  const [isSplitView, setIsSplitView] = useState(true);
  
  // Specific visualizer states
  const [mathInput, setMathInput] = useState('');
  const [mathSteps, setMathSteps] = useState([]);
  const [fileSummary, setFileSummary] = useState('');
  
  // Whiteboard drawing states
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [whiteboardTool, setWhiteboardTool] = useState('pencil');
  const [stickyNotes, setStickyNotes] = useState([]);

  // Canvas drawing hooks
  const startDrawing = (e) => {
    if (whiteboardTool === 'sticky') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = whiteboardTool === 'eraser' ? '#020617' : '#3B82F6';
    ctx.lineWidth = whiteboardTool === 'eraser' ? 30 : 3;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || whiteboardTool === 'sticky') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Sticky notes controls
  const handleAddStickyNote = () => {
    const newNote = {
      id: Date.now(),
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      text: ''
    };
    setStickyNotes(prev => [...prev, newNote]);
  };

  const handleUpdateSticky = (id, text) => {
    setStickyNotes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
  };

  const handleDeleteSticky = (id) => {
    setStickyNotes(prev => prev.filter(n => n.id !== id));
  };

  const filteredSandboxModules = categories.flatMap(cat => 
    cat.items.map(item => ({ ...item, catId: cat.id, catName: cat.name }))
  ).filter(item => {
    const matchesCat = selectedCategory === 'all' || item.catId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(sandboxSearch.toLowerCase()) || 
                          item.desc.toLowerCase().includes(sandboxSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenWorkspace = (item) => {
    setSelectedModule(item);
    setWorkspaceCode(item.defaultCode || '');
    setTerminalOutput('');
    setMathInput('');
    setMathSteps([]);
    setFileSummary('');
    setStickyNotes([]);
    setWorkspaceTab('editor');
    setAiMessages([
      { role: 'assistant', text: `Hi there! I am your AI Mentor configured with ${selectedModel}. How can I assist you in this ${item.name} workspace today?` }
    ]);
    
    if (item.id === 'whiteboard') {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = canvas.parentElement.clientWidth;
          canvas.height = canvas.parentElement.clientHeight || 500;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#020617';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }, 100);
    }
  };

  const handleExecuteCode = () => {
    setIsExecuting(true);
    setTimeout(() => {
      let output = `[Compiler running ${selectedModule.name}]\n`;
      
      const printRegex = /(?:print|console\.log|System\.out\.println)\s*\((["'`])(.*?)\1\)/g;
      let match;
      let matches = [];
      while ((match = printRegex.exec(workspaceCode)) !== null) {
        matches.push(match[2]);
      }
      
      if (matches.length > 0) {
        output += `Execution successful!\nOutput:\n` + matches.join('\n');
      } else {
        output += `Execution successful!\nProcess exited with status code 0 (success).`;
      }
      
      setTerminalOutput(output);
      setIsExecuting(false);
      toast.success('Execution completed!');
    }, 1000);
  };

  const handleSolveEquation = () => {
    if (!mathInput.trim()) {
      toast.error('Please enter a mathematical expression!');
      return;
    }
    
    let steps = [];
    if (mathInput.toLowerCase().includes('3x^2') || mathInput.toLowerCase().includes('3x²')) {
      steps = [
        `Parse target formula coordinate parameters: y = 3x² + 5x - 2`,
        `Apply general quadratic formula factors: a=3, b=5, c=-2`,
        `Compute delta Δ = b² - 4ac = 25 - (4 * 3 * -2) = 25 + 24 = 49`,
        `Extract coordinates roots: x = (-b ± √Δ) / 2a = (-5 ± 7) / 6`,
        `Isolate roots variables: Root 1: x = 1/3, Root 2: x = -2`
      ];
    } else if (mathInput.toLowerCase().includes('sin') || mathInput.toLowerCase().includes('cos')) {
      steps = [
        `Identify trigonometric limits: f(x) = sin(x) + cos(x)`,
        `Compute first derivative f'(x) = cos(x) - sin(x)`,
        `Evaluate critical point roots by setting f'(x) = 0`,
        `Isolate root tangent: tan(x) = 1 => critical point at x = π/4 + kπ`
      ];
    } else {
      steps = [
        `Parse mathematical expression: "${mathInput}"`,
        `Isolate operations priority hierarchy (PEMDAS rules)`,
        `Evaluate variables and integrate matching terms`,
        `Expression successfully solved: f(x) = calculated value`
      ];
    }
    
    setMathSteps(steps);
    toast.success('Equation solved successfully!');
  };

  const handleAnalyzeFile = () => {
    setFileSummary(
      `File parsed successfully via simulated OCR Vision API.\n\n` +
      `Summary Insights:\n` +
      `1. Principal topic breaks down logic parameters for ${selectedModule.name}.\n` +
      `2. Suggested Flashcard 1: Q: What is the primary algorithmic complexity? A: O(log N).\n` +
      `3. Suggested Flashcard 2: Q: How does memory allocation scale? A: Linearly with thread pools.`
    );
    toast.success('Insights generated!');
  };

  const handleSendAiMessage = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    
    const userMsg = { role: 'user', text: aiInput };
    setAiMessages(prev => [...prev, userMsg]);
    const currentInput = aiInput;
    setAiInput('');
    
    if (user?.isGuest) {
      if (guestAiRequests <= 0) {
        toast.error('AI Quota exhausted! Sign up to restore unlimited queries.');
        setAiMessages(prev => [...prev, { 
          role: 'assistant', 
          text: '⚠️ Guest AI Quota exhausted. Please create a free account to restore unlimited requests and continue learning!' 
        }]);
        return;
      }
      decrementGuestAiRequests();
    }
    
    setTimeout(() => {
      let botResponse = `I've analyzed your workspace input regarding "${currentInput}". `;
      if (selectedModule.id.endsWith('ide')) {
        botResponse += `To optimize this logic in the editor, ensure proper memory allocation and declare local types. Let me know if you would like me to rewrite it.`;
      } else if (selectedModule.id === 'equation-solver' || selectedModule.id === 'calculus-solver') {
        botResponse += `The step-by-step calculus formula outlines structural integration limits. Let me know if you need to plot another coordinate system.`;
      } else {
        botResponse += `Let's work together to complete this module. Let me know if you have any questions about the instructions or visual simulator features.`;
      }
      
      setAiMessages(prev => [...prev, { role: 'assistant', text: botResponse }]);
    }, 1000);
  };

  // Hash-based navigation from sidebar
  useHashNavigation({
    '#courses': 'subjects',
    '#roadmaps': 'roadmap',
    '#notes': 'notes',
    '#resources': 'resources',
    '#studio': 'subjects',
    '#bookmarks': 'bookmarks',
  }, setActiveTab);
  const [roadmapData, setRoadmapData] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    api.get('/subjects')
      .then(res => {
        const uniqueSubjects = [];
        const seen = new Set();
        for (const item of res.data) {
          if (!seen.has(item.subject_name)) {
            seen.add(item.subject_name);
            uniqueSubjects.push(item);
          }
        }
        // Inject Mathematics for prototype if not present
        if (!uniqueSubjects.find(s => s.subject_name === 'Mathematics')) {
          uniqueSubjects.push({
            id: 'math-proto',
            subject_name: 'Mathematics',
            description: 'Advanced numerical methods and calculus execution engines.',
            topic_count: 3,
            unit_count: 1
          });
        }
        setSubjects(uniqueSubjects);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Load roadmap data when tab changes
  useEffect(() => {
    if (activeTab === 'roadmap' && !roadmapData) {
      setRoadmapLoading(true);
      Promise.all([
        api.get('/progress/analytics'),
        api.get('/progress/roadmap/progress')
      ])
        .then(([analyticsRes, progressRes]) => {
          setRoadmapData({
            roadmap: analyticsRes.data.roadmap || [],
            subjectProgress: analyticsRes.data.subjectProgress || [],
            completedTopicIds: progressRes.data.completedTopicIds || [],
            activeTopicId: progressRes.data.activeTopicId
          });
        })
        .catch(err => console.error(err))
        .finally(() => setRoadmapLoading(false));
    }
  }, [activeTab, roadmapData]);

  // Load notes when tab changes
  useEffect(() => {
    if (activeTab === 'notes') {
      loadNotes();
    }
  }, [activeTab]);

  const loadNotes = () => {
    setNotesLoading(true);
    api.get('/notes')
      .then(res => setNotes(res.data))
      .catch(err => console.error(err))
      .finally(() => setNotesLoading(false));
  };

  // Notes CRUD handlers
  const handleSaveNote = async () => {
    if (!noteTitle.trim()) return;
    setSavingNote(true);
    try {
      if (editingNote) {
        const res = await api.put(`/notes/${editingNote.id}`, { title: noteTitle, content: noteContent });
        setNotes(prev => prev.map(n => n.id === editingNote.id ? res.data : n));
      } else {
        const res = await api.post('/notes', { title: noteTitle, content: noteContent });
        setNotes(prev => [res.data, ...prev]);
      }
      resetNoteEditor();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (note) => {
    try {
      const res = await api.put(`/notes/${note.id}`, { pinned: !note.pinned });
      setNotes(prev => prev.map(n => n.id === note.id ? res.data : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async (note) => {
    try {
      const res = await api.put(`/notes/${note.id}`, { favorite: !note.favorite });
      setNotes(prev => prev.map(n => n.id === note.id ? res.data : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiSummary = async (note) => {
    setSummaryLoading(true);
    setAiSummary(null);
    try {
      const res = await api.post(`/notes/${note.id}/summary`);
      setAiSummary({ noteId: note.id, text: res.data.summary });
    } catch (err) {
      console.error(err);
      setAiSummary({ noteId: note.id, text: 'Failed to generate summary. Try again later.' });
    } finally {
      setSummaryLoading(false);
    }
  };

  const editNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content || '');
    setShowNoteEditor(true);
  };

  const resetNoteEditor = () => {
    setShowNoteEditor(false);
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
  };

  // Roadmap actions
  const handleStartTopic = async (topicId) => {
    try {
      await api.post('/progress/roadmap/start', { topicId });
      setRoadmapData(prev => ({ ...prev, activeTopicId: topicId }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteTopic = async (topicId) => {
    try {
      await api.post('/progress/complete-topic', { topic_id: topicId, study_minutes: 30 });
      setRoadmapData(prev => ({
        ...prev,
        completedTopicIds: [...prev.completedTopicIds, topicId],
        activeTopicId: null
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBookmark = (subject) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.id === subject.id);
      const updated = exists ? prev.filter(b => b.id !== subject.id) : [...prev, subject];
      localStorage.setItem('eduverse_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const tabs = [
    { id: 'subjects', label: 'Learning Modules', icon: '📚' },
    { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'resources', label: 'Resources', icon: '📂' },
    { id: 'bookmarks', label: 'Bookmarks', icon: '🔖' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="h-[260px] bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-2xl w-full max-w-full overflow-x-auto scrollbar-none" style={{ backgroundColor: 'var(--db-input-bg)', border: '1px solid var(--db-sidebar-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
              activeTab === tab.id ? 'shadow-md' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--db-card-bg)' : 'transparent',
              color: activeTab === tab.id ? 'var(--db-text-accent)' : 'var(--db-text-muted)',
              border: activeTab === tab.id ? '1px solid var(--db-sidebar-border)' : '1px solid transparent'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── SUBJECTS TAB ─── */}
        {activeTab === 'subjects' && (
          <motion.div 
            key="subjects"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header and Sub-Tab Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Learning Center <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">AI Labs Active</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">Explore interactive sandboxes, IDEs, visualizers, and academic subjects</p>
              </div>

              {/* Sub tabs inside Learning Modules */}
              <div className="flex p-1 rounded-xl bg-slate-900 border border-white/5 w-fit">
                <button
                  onClick={() => setSubjectSubTab('sandbox')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                    subjectSubTab === 'sandbox'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-650 text-white shadow-lg'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  🧪 AI Sandbox Hub
                </button>
                <button
                  onClick={() => setSubjectSubTab('academic')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                    subjectSubTab === 'academic'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-650 text-white shadow-lg'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  🏫 Academic Subjects
                </button>
              </div>
            </div>

            {/* View 1: Sandbox tab */}
            {subjectSubTab === 'sandbox' && (
              <div className="space-y-6">
                {/* Category filters + Search */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  {/* Category Pill Filters */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/50 border border-white/5 overflow-x-auto max-w-full scrollbar-none py-1.5">
                    {['all', 'programming', 'ai-assistant', 'math', 'science', 'studios', 'dsa-db', 'career-hub'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer capitalize flex-shrink-0 border-0 ${
                          selectedCategory === cat
                            ? 'bg-white/10 text-white border border-white/10'
                            : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {cat.replace('-', ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full lg:w-72">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search AI Sandbox Modules..."
                      value={sandboxSearch}
                      onChange={(e) => setSandboxSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 text-white placeholder-slate-500 text-xs rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredSandboxModules.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenWorkspace(item)}
                      className="group relative rounded-3xl border border-white/5 bg-[#090d16] p-5 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:border-blue-500/35 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(59,130,246,0.15)] cursor-pointer"
                    >
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">{item.icon}</span>
                          <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/10">{item.catName}</span>
                        </div>
                        
                        <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-blue-400 transition-colors">{item.name}</h3>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-3">{item.desc}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                        <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                          <Sparkles size={9} className="text-amber-500" /> AI Powered
                        </span>
                        <span className="text-[10px] font-extrabold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Launch Lab <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View 2: Academic Subjects */}
            {subjectSubTab === 'academic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 premium-subjects-grid">
                {subjects.map((s) => (
                  <Link key={s.id} to={`/subjects/${s.id}`} className="subject-card group">
                    <div className={`subject-card-blob ${subjectBlobColors[s.subject_name] || 'blob-default'}`} />
                    <div className="subject-card-bg" />
                    <div className="subject-card-content flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800/40 border border-white/5 flex items-center justify-center text-2xl shadow-inner">
                            {subjectIcons[s.subject_name] || '📚'}
                          </div>
                          {s.subject_name === 'DSA' && (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate('/coding-battle');
                              }}
                              className="px-3 py-1.5 text-[10px] font-black text-white rounded-xl bg-gradient-to-r from-teal-400 to-indigo-650 hover:from-teal-500 hover:to-indigo-700 flex items-center gap-1 shadow-lg shadow-teal-500/25 active:scale-95 transition relative z-20 cursor-pointer border border-teal-400/20"
                            >
                              <span>🎮 Play Game</span>
                              <span className="text-[9px] font-bold">&gt;</span>
                            </button>
                          )}
                        </div>

                        <h3 className="font-extrabold text-lg text-[var(--db-text-main)] group-hover:text-emerald-500 transition-colors duration-300">
                          {s.subject_name}
                        </h3>

                        {s.subject_name === 'DSA' && (
                          <div 
                            className="mt-3 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/15 flex items-center justify-between text-[11px] cursor-pointer relative z-10 select-none transition" 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              e.stopPropagation(); 
                              const nextVal = !dsaGameMode;
                              setDsaGameMode(nextVal);
                              localStorage.setItem('dsa_game_mode', nextVal ? 'true' : 'false');
                            }}
                          >
                            <span className="font-bold text-purple-200 flex items-center gap-1.5">
                              🎮 Game Mode (Rotate)
                            </span>
                            <div className="relative flex items-center">
                              <div className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-300 ${
                                dsaGameMode 
                                  ? 'bg-gradient-to-r from-purple-500 to-indigo-650 shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                                  : 'bg-slate-800/80 border border-slate-700/65'
                              } flex items-center`}>
                                <div className={`w-4.5 h-4.5 rounded-full transition-all duration-300 ease-out transform ${
                                  dsaGameMode 
                                    ? 'translate-x-[18px] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.25)]' 
                                    : 'translate-x-0 bg-slate-400'
                                }`} />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-3.5 line-clamp-3 leading-relaxed">{s.description}</p>
                      </div>

                      <div className="flex gap-4 mt-6 text-xs font-semibold text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {s.topic_count || 0} topics
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {s.unit_count || 0} units
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── ROADMAP TAB ─── */}
        {activeTab === 'roadmap' && (
          <motion.div 
            key="roadmap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--db-text-main)' }}>Learning Roadmap</h1>
              <p style={{ color: 'var(--db-text-muted)' }}>Track your progress and complete topics sequentially</p>
            </div>

            {roadmapLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-t-violet-600 border-slate-700 animate-spin"></div>
              </div>
            ) : roadmapData ? (
              <div className="space-y-6">
                {/* Subject Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {roadmapData.subjectProgress.map((sp, i) => (
                    <div 
                      key={i} 
                      className="p-4 rounded-2xl border"
                      style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold" style={{ color: 'var(--db-text-main)' }}>{subjectIcons[sp.name] || '📚'} {sp.name}</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--db-text-accent)' }}>{sp.percentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-sidebar-border)' }}>
                        <motion.div 
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${sp.percentage}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                        />
                      </div>
                      <span className="text-[11px] mt-1 block" style={{ color: 'var(--db-text-muted)' }}>{sp.completedTopics}/{sp.totalTopics} topics</span>
                    </div>
                  ))}
                </div>

                {/* Roadmap Nodes */}
                <div 
                  className="p-6 rounded-2xl border space-y-4"
                  style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
                >
                  <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>Topic Nodes</h3>
                  <div className="space-y-3">
                    {roadmapData.roadmap.map((node, idx) => {
                      const isCompleted = roadmapData.completedTopicIds.includes(node.id);
                      const isActive = roadmapData.activeTopicId === node.id;
                      const prevAllCompleted = idx === 0 || roadmapData.roadmap.slice(0, idx).every(n => roadmapData.completedTopicIds.includes(n.id));
                      const canStart = !isCompleted && prevAllCompleted;

                      return (
                        <motion.div 
                          key={node.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center gap-4 p-3 rounded-xl border transition-all"
                          style={{ 
                            backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.05)' : isActive ? 'rgba(139, 92, 246, 0.05)' : 'var(--db-input-bg)', 
                            borderColor: isCompleted ? 'rgba(16, 185, 129, 0.2)' : isActive ? 'rgba(139, 92, 246, 0.3)' : 'var(--db-sidebar-border)'
                          }}
                        >
                          {/* Status indicator */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCompleted ? 'bg-emerald-600 text-white' : isActive ? 'bg-violet-600 text-white animate-pulse' : 'bg-slate-600 text-slate-300'
                          }`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold block" style={{ color: 'var(--db-text-main)' }}>{node.title}</span>
                            <span className="text-[11px]" style={{ color: 'var(--db-text-muted)' }}>{node.subject}</span>
                          </div>

                          {/* Status badge */}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                            isCompleted ? 'bg-emerald-500/10 text-emerald-500' : isActive ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-500/10 text-slate-400'
                          }`}>
                            {isCompleted ? 'Done' : isActive ? 'Active' : node.status}
                          </span>

                          {/* Action buttons */}
                          <div className="flex gap-2 shrink-0">
                            {canStart && !isActive && (
                              <button 
                                onClick={() => handleStartTopic(node.id)}
                                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Start
                              </button>
                            )}
                            {isActive && (
                              <button 
                                onClick={() => handleCompleteTopic(node.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Complete ✓
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* ─── NOTES TAB ─── */}
        {activeTab === 'notes' && (
          <motion.div 
            key="notes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--db-text-main)' }}>My Notes</h1>
                <p style={{ color: 'var(--db-text-muted)' }}>Create, manage, and summarize your study notes with AI</p>
              </div>
              <button 
                onClick={() => { resetNoteEditor(); setShowNoteEditor(true); }}
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-600/20"
              >
                <span className="text-lg">+</span> New Note
              </button>
            </div>

            {/* Note Editor Modal */}
            <AnimatePresence>
              {showNoteEditor && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-5 rounded-2xl border space-y-4"
                  style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>
                      {editingNote ? 'Edit Note' : 'Create New Note'}
                    </h3>
                    <button onClick={resetNoteEditor} className="text-xl cursor-pointer" style={{ color: 'var(--db-text-muted)' }}>✕</button>
                  </div>
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm font-semibold outline-none transition-all"
                    style={{ 
                      backgroundColor: 'var(--db-input-bg)', 
                      borderColor: 'var(--db-sidebar-border)', 
                      color: 'var(--db-text-main)' 
                    }}
                  />
                  <textarea
                    placeholder="Write your notes here..."
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-all"
                    style={{ 
                      backgroundColor: 'var(--db-input-bg)', 
                      borderColor: 'var(--db-sidebar-border)', 
                      color: 'var(--db-text-main)' 
                    }}
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSaveNote}
                      disabled={savingNote || !noteTitle.trim()}
                      className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      {savingNote ? 'Saving...' : editingNote ? 'Update Note' : 'Save Note'}
                    </button>
                    <button 
                      onClick={resetNoteEditor}
                      className="px-5 py-2.5 border rounded-xl text-sm font-bold transition-all cursor-pointer"
                      style={{ borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-muted)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notes Grid */}
            {notesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-t-violet-600 border-slate-700 animate-spin"></div>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <span className="text-5xl block">📝</span>
                <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>No notes yet</h3>
                <p className="text-sm" style={{ color: 'var(--db-text-muted)' }}>Create your first study note to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map(note => (
                  <motion.div 
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl border flex flex-col justify-between hover:shadow-lg transition-all group"
                    style={{ backgroundColor: 'var(--db-card-bg)', borderColor: note.pinned ? 'rgba(139, 92, 246, 0.3)' : 'var(--db-sidebar-border)' }}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
                          {note.pinned && <span className="text-violet-400">📌</span>}
                          {note.title}
                        </h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleTogglePin(note)} className="p-1 rounded-md hover:bg-white/10 transition cursor-pointer text-xs" title="Pin">
                            {note.pinned ? '📌' : '📍'}
                          </button>
                          <button onClick={() => handleToggleFavorite(note)} className="p-1 rounded-md hover:bg-white/10 transition cursor-pointer text-xs" title="Favorite">
                            {note.favorite ? '⭐' : '☆'}
                          </button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed line-clamp-4" style={{ color: 'var(--db-text-secondary)' }}>
                        {note.content || 'Empty note...'}
                      </p>
                      <span className="text-[11px] block" style={{ color: 'var(--db-text-muted)' }}>
                        {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* AI Summary display */}
                    {aiSummary?.noteId === note.id && (
                      <div className="mt-3 p-3 rounded-xl border" style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                        <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--db-text-accent)' }}>🤖 AI Summary</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--db-text-main)' }}>{aiSummary.text}</p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                      <button onClick={() => editNote(note)} className="flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer" style={{ backgroundColor: 'var(--db-input-bg)', color: 'var(--db-text-secondary)' }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleAiSummary(note)} disabled={summaryLoading} className="flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--db-text-accent)' }}>
                        {summaryLoading && aiSummary?.noteId !== note.id ? '...' : '🤖 AI Summary'}
                      </button>
                      <button onClick={() => handleDeleteNote(note.id)} className="py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer hover:bg-red-500/10" style={{ color: '#ef4444' }}>
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── RESOURCES TAB ─── */}
        {activeTab === 'resources' && (
          <motion.div 
            key="resources"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--db-text-main)' }}>Resource Library</h1>
              <p style={{ color: 'var(--db-text-muted)' }}>Curated learning resources for each subject</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Java Documentation', type: 'PDF', subject: 'Java', icon: '☕', color: 'from-orange-500 to-red-500', url: 'https://docs.oracle.com/en/java/' },
                { title: 'DSA Cheat Sheet', type: 'PDF', subject: 'DSA', icon: '🌳', color: 'from-green-500 to-emerald-500', url: 'https://quickref.me/dsa' },
                { title: 'Python Official Docs', type: 'Link', subject: 'Python', icon: '🐍', color: 'from-blue-500 to-cyan-500', url: 'https://docs.python.org/3/' },
                { title: 'C# Programming Guide', type: 'Link', subject: 'C#', icon: '🔷', color: 'from-purple-500 to-violet-500', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/' },
                { title: 'SQL Basics Tutorial', type: 'Video', subject: 'DBMS', icon: '🗄️', color: 'from-yellow-500 to-amber-500', url: 'https://www.w3schools.com/sql/' },
                { title: 'Web Dev Roadmap 2026', type: 'Article', subject: 'Web Dev', icon: '🌐', color: 'from-pink-500 to-rose-500', url: 'https://roadmap.sh/frontend' },
                { title: 'FOC Study Notes', type: 'PDF', subject: 'FOC', icon: '🔢', color: 'from-indigo-500 to-blue-500', url: 'https://www.geeksforgeeks.org/fundamentals-of-computer/' },
                { title: 'Numerical Methods Guide', type: 'PDF', subject: 'Mathematics', icon: '🧮', color: 'from-teal-500 to-cyan-500', url: 'https://en.wikipedia.org/wiki/Numerical_analysis' },
              ].map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl border flex flex-col gap-3 hover:shadow-lg transition-all group cursor-pointer"
                  style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${res.color} flex items-center justify-center text-lg text-white shadow-md`}>
                      {res.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--db-badge-bg)', color: 'var(--db-badge-text)' }}>
                      {res.type}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold group-hover:text-[var(--db-text-accent)] transition-colors" style={{ color: 'var(--db-text-main)' }}>{res.title}</h4>
                    <span className="text-[11px]" style={{ color: 'var(--db-text-muted)' }}>{res.subject}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--db-text-accent)' }}>
                    Open Resource →
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── BOOKMARKS TAB ─── */}
        {activeTab === 'bookmarks' && (
          <motion.div 
            key="bookmarks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--db-text-main)' }}>My Bookmarks</h1>
              <p style={{ color: 'var(--db-text-muted)' }}>Subjects you've saved for quick access</p>
            </div>
            {bookmarks.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <span className="text-5xl block">🔖</span>
                <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>No bookmarks yet</h3>
                <p className="text-sm" style={{ color: 'var(--db-text-muted)' }}>Go to Learning Modules and click the bookmark icon on any subject to save it here!</p>
                <button onClick={() => setActiveTab('subjects')} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer">
                  Browse Subjects
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {bookmarks.map((s) => (
                  <div key={s.id} className="p-5 rounded-2xl border flex flex-col gap-3 hover:shadow-lg transition-all" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                    <div className="flex justify-between items-start">
                      <div className="text-3xl">{subjectIcons[s.subject_name] || '📚'}</div>
                      <button onClick={() => toggleBookmark(s)} className="text-lg cursor-pointer hover:scale-110 transition-transform">🔖</button>
                    </div>
                    <h3 className="font-semibold text-base" style={{ color: 'var(--db-text-main)' }}>{s.subject_name}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--db-text-muted)' }}>{s.description}</p>
                    <Link to={`/subjects/${s.id}`} className="text-xs font-bold mt-auto pt-2" style={{ color: 'var(--db-text-accent)' }}>
                      Continue Learning →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Interactive AI Workspace Simulator */}
      {selectedModule && (
        <div className="fixed inset-0 z-[60] bg-[#05070f] text-white flex flex-col font-sans">
          {/* Header Toolbar */}
          <header className="h-14 border-b border-white/10 px-4 flex items-center justify-between bg-[#080b14]">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedModule(null)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition cursor-pointer border-0 bg-transparent"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedModule.icon}</span>
                <div>
                  <h3 className="text-xs font-black tracking-wide leading-none">{selectedModule.name}</h3>
                  <span className="text-[9px] uppercase font-extrabold text-blue-400 mt-1 inline-block">{selectedModule.catName}</span>
                </div>
              </div>
            </div>

            {/* AI Router Selector */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-bold hidden sm:inline flex items-center gap-1">
                <Bot size={11} className="text-blue-400 animate-pulse" /> AI Router:
              </span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-slate-900 border border-white/10 text-xs font-semibold rounded-lg px-2 py-1 text-white outline-none cursor-pointer focus:border-blue-500/55"
              >
                <option value="GPT-4o">OpenAI GPT-4o (Smart)</option>
                <option value="Gemini 1.5 Pro">Google Gemini 1.5 Pro</option>
                <option value="Claude 3.5 Sonnet">Anthropic Claude 3.5</option>
                <option value="DeepSeek R1">DeepSeek R1 (Reasoning)</option>
                <option value="Llama 3.1">Meta Llama 3.1 (Fast)</option>
                <option value="Groq LLaMA-70B">Groq LLaMA-70B (Instant)</option>
              </select>

              <div className="w-[1px] h-5 bg-white/10 hidden sm:block" />

              {/* Toolbar actions */}
              <button 
                onClick={() => setIsSplitView(!isSplitView)}
                className={`p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition cursor-pointer border-0 hidden md:inline-flex bg-transparent`}
                title="Toggle Split Panel Layout"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </header>

          {/* Split Pane Sandbox Area */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Pane: Editor, Visualizer, Interactive controls */}
            <div className={`flex-1 flex flex-col border-r border-white/10 overflow-hidden`}>
              
              {/* Tabs bar */}
              <div className="h-9 border-b border-white/10 bg-[#060810] flex items-center justify-between px-3">
                <div className="flex items-center gap-1 h-full">
                  <button
                    onClick={() => setWorkspaceTab('editor')}
                    className={`h-full px-4 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer border-0 ${
                      workspaceTab === 'editor' ? 'border-blue-500 text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-white bg-transparent'
                    }`}
                  >
                    Workspace Editor
                  </button>
                  <button
                    onClick={() => setWorkspaceTab('visual')}
                    className={`h-full px-4 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer border-0 ${
                      workspaceTab === 'visual' ? 'border-blue-500 text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-white bg-transparent'
                    }`}
                  >
                    Visual Simulator
                  </button>
                </div>

                {/* Sandbox Toolbar */}
                <div className="flex items-center gap-1.5">
                  {workspaceTab === 'editor' && selectedModule.id.endsWith('ide') && (
                    <button
                      onClick={handleExecuteCode}
                      disabled={isExecuting}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-650 text-white text-[10px] font-extrabold rounded flex items-center gap-1 hover:brightness-110 active:scale-95 transition cursor-pointer border-0"
                    >
                      {isExecuting ? <span className="w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={10} />}
                      Run Code
                    </button>
                  )}
                  <button
                    onClick={() => toast.success('Workspace progress auto-saved!')}
                    className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition border-0 cursor-pointer bg-transparent"
                    title="Save Project"
                  >
                    <Save size={12} />
                  </button>
                </div>
              </div>

              {/* Tab content space */}
              <div className="flex-1 overflow-auto bg-[#04060b] relative">
                
                {/* WORKSPACE TAB 1: Editor View */}
                {workspaceTab === 'editor' && (
                  <div className="w-full h-full flex flex-col">
                    {selectedModule.id.endsWith('ide') || selectedModule.id === 'db-studio' || selectedModule.id === 'linux-term' ? (
                      <>
                        <textarea
                          value={workspaceCode}
                          onChange={(e) => setWorkspaceCode(e.target.value)}
                          className="flex-1 w-full bg-[#03050a] text-emerald-400 font-mono text-xs p-5 outline-none resize-none leading-relaxed border-0"
                          placeholder="Write code or command queries here..."
                        />
                        {/* Terminal Output */}
                        <div className="h-44 border-t border-white/10 bg-[#020306] flex flex-col font-mono">
                          <div className="h-7 border-b border-white/5 px-4 flex items-center justify-between text-[9px] uppercase tracking-wider text-slate-500">
                            <span className="flex items-center gap-1"><TermIcon size={9} /> Terminal Output Console</span>
                            <button onClick={() => setTerminalOutput('')} className="hover:text-white cursor-pointer border-0 bg-transparent">Clear</button>
                          </div>
                          <pre className="flex-1 p-4 overflow-y-auto text-[11px] text-slate-300 leading-normal text-left whitespace-pre-wrap">{terminalOutput || '$ ready to compile...'}</pre>
                        </div>
                      </>
                    ) : selectedModule.id === 'equation-solver' || selectedModule.id === 'calculus-solver' ? (
                      <div className="p-8 max-w-xl mx-auto space-y-6 text-left">
                        <h4 className="text-xs font-black uppercase text-slate-400">🔢 Input Mathematical Formula:</h4>
                        <input 
                          type="text"
                          value={mathInput}
                          onChange={(e) => setMathInput(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-blue-500 text-white"
                          placeholder="e.g. y = 3x^2 + 5x - 2 or ∫(3x^2) dx"
                        />
                        <button 
                          onClick={handleSolveEquation}
                          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-650 rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition border-0 cursor-pointer text-white"
                        >
                          Solve Step-by-Step
                        </button>
                        
                        {/* Step-by-step solver visual output */}
                        {mathSteps.length > 0 && (
                          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-sans">
                            <h5 className="text-[11px] font-black uppercase tracking-wider text-blue-400">Step-by-step derivation:</h5>
                            {mathSteps.map((step, idx) => (
                              <div key={idx} className="text-xs text-slate-300 border-b border-white/5 pb-2 last:border-0">
                                <strong className="text-white block mb-0.5">Step {idx + 1}:</strong> {step}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : selectedModule.id === 'whiteboard' ? (
                      /* AI Whiteboard Canvas Simulator */
                      <div className="w-full h-full flex flex-col relative select-none">
                        <div className="absolute top-4 left-4 z-10 flex gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10">
                          {['pencil', 'eraser', 'sticky'].map(tool => (
                            <button
                              key={tool}
                              onClick={() => setWhiteboardTool(tool)}
                              className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition border-0 cursor-pointer ${
                                whiteboardTool === tool ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white bg-transparent'
                              }`}
                            >
                              {tool}
                            </button>
                          ))}
                        </div>
                        
                        {/* Sticky note generator in canvas */}
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                          <button
                            onClick={handleAddStickyNote}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-[10px] rounded-lg active:scale-95 transition border-0 cursor-pointer"
                          >
                            + Add Sticky Note
                          </button>
                        </div>

                        <canvas
                          ref={canvasRef}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          className="flex-1 bg-slate-950 cursor-crosshair w-full"
                        />
                        
                        {/* Sticky notes overlays */}
                        {stickyNotes.map(note => (
                          <div
                            key={note.id}
                            style={{ left: note.x, top: note.y }}
                            className="absolute w-36 h-36 bg-amber-400 text-slate-950 p-3 rounded-lg shadow-xl flex flex-col justify-between"
                          >
                            <textarea
                              value={note.text}
                              onChange={(e) => handleUpdateSticky(note.id, e.target.value)}
                              className="w-full h-24 bg-transparent border-0 outline-none resize-none font-bold text-xs text-slate-900 leading-normal"
                              placeholder="Write note..."
                            />
                            <div className="flex justify-between items-center border-t border-slate-900/10 pt-1.5">
                              <span className="text-[8px] font-black uppercase text-slate-700">Sticky Note</span>
                              <button onClick={() => handleDeleteSticky(note.id)} className="text-red-700 hover:text-red-900 border-0 bg-transparent text-[10px] cursor-pointer">✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : selectedModule.id === 'pdf-studio' || selectedModule.id === 'image-learning' ? (
                      /* File upload dropzone simulator */
                      <div className="p-8 max-w-xl mx-auto space-y-6 text-left">
                        <h4 className="text-xs font-black uppercase text-slate-400">📄 Upload File for AI Analysis:</h4>
                        <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition text-center space-y-3 cursor-pointer">
                          <Upload size={32} className="mx-auto text-slate-500 group-hover:text-white" />
                          <strong className="text-xs text-slate-300 block">Drag & drop your files here, or browse</strong>
                          <span className="text-[9px] text-slate-500">Supports PDF, PNG, JPG up to 10MB</span>
                        </div>
                        
                        <button 
                          onClick={handleAnalyzeFile}
                          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-650 rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition border-0 cursor-pointer text-white"
                        >
                          Summarize & Generate Insights
                        </button>
                        
                        {/* File explanation output */}
                        {fileSummary && (
                          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-sans">
                            <h5 className="text-[11px] font-black uppercase tracking-wider text-teal-400">File Summary & Flashcards:</h5>
                            <p className="text-xs text-slate-300 leading-relaxed">{fileSummary}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Default Interactive Control dashboard */
                      <div className="p-8 max-w-xl mx-auto space-y-6 text-left">
                        <h4 className="text-xs font-black uppercase text-slate-400">🛠️ Interactive Interface Sandbox:</h4>
                        <p className="text-xs text-slate-400 leading-normal">
                          This module provides a visual mockup simulator representing the interactive operations of the {selectedModule.name}. Customize sliders, toggle logic values, and query the split AI Mentor assistant.
                        </p>
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                          <h5 className="text-[11px] font-black uppercase text-blue-400">Simulate Variables:</h5>
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] text-slate-400 font-bold block mb-1">Target Speed Parameter (V):</label>
                              <input type="range" className="w-full accent-blue-500" min="0" max="100" defaultValue="45" />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 font-bold block mb-1">Coefficient Ratio (μ):</label>
                              <input type="range" className="w-full accent-blue-500" min="0" max="1" step="0.1" defaultValue="0.2" />
                            </div>
                          </div>
                          <button onClick={() => toast.success('Simulation recalculated successfully!')} className="px-4 py-2 bg-blue-600 text-white font-extrabold text-[10px] rounded-lg active:scale-95 transition cursor-pointer border-0 text-white">Recalculate</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* WORKSPACE TAB 2: Visual Simulator Tab */}
                {workspaceTab === 'visual' && (
                  <div className="w-full h-full flex flex-col justify-center items-center p-8 bg-[#030408] text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-4xl animate-pulse">
                      📊
                    </div>
                    <h4 className="text-sm font-black text-white">{selectedModule.name} Simulation View</h4>
                    <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                      Watch real-time data flow visual graphics, execution steps, and stack diagrams as code variables or mathematical parameters adapt.
                    </p>
                    
                    {/* Simulated sorting elements if sorting visualizer */}
                    {selectedModule.id === 'sorting-visualizer' ? (
                      <div className="flex items-end gap-2.5 h-36 max-w-xs mx-auto border-b border-white/10 px-4">
                        {[65, 30, 85, 45, 95, 20, 75, 50].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    ) : selectedModule.id === 'graph-plotter' ? (
                      /* Simulated Desmos plot curve */
                      <div className="w-60 h-40 border border-white/10 rounded-xl relative overflow-hidden bg-slate-950 flex items-center justify-center font-mono text-[9px] text-blue-400">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:15px_15px]" />
                        <svg className="absolute inset-0 w-full h-full" stroke="currentColor" strokeWidth="2" fill="none">
                          <path d="M 0 100 Q 75 20 150 100 T 300 100" />
                        </svg>
                        <span className="relative z-10 bg-slate-900/80 px-2 py-1 rounded">y = sin(x) + cos(x)</span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Recalculating visual state nodes...</span>
                    )}
                  </div>
                )}

              </div>

            </div>

            {/* Right Pane: AI Chatbot Assistant (if split view is enabled) */}
            {isSplitView && (
              <div className="w-full md:w-80 lg:w-96 flex flex-col bg-[#070a13] overflow-hidden">
                <div className="h-9 border-b border-white/10 bg-[#080b15] px-4 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Sparkles size={11} className="text-amber-500" /> AI Classroom Guide
                  </span>
                  <span className="text-[9px] font-bold text-slate-500">Online</span>
                </div>

                {/* AI messages list */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-sidebar-scroll flex flex-col justify-end">
                  <div className="flex-1 flex flex-col justify-start space-y-4">
                    {aiMessages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col text-xs text-left ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <span className="text-[9px] font-extrabold uppercase text-slate-500 mb-1">{msg.role === 'user' ? 'You' : `${selectedModel} Assistant`}</span>
                        <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Query Input Bar */}
                <form onSubmit={handleSendAiMessage} className="p-3.5 border-t border-white/10 bg-[#05070d] flex gap-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask the AI router a question..."
                    className="flex-1 bg-slate-900 border border-white/5 text-white placeholder-slate-500 text-xs rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500/50"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white transition cursor-pointer border-0 flex items-center justify-center"
                  >
                    <ArrowRight size={14} />
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
