import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import CSharpHub from '../csharp/CSharpHub';
import DBMSHub from '../dbms/DBMSHub';
import DBMSLab from '../components/DBMSLab';
import DSALab from '../components/DSALab';
import WebDevLab from '../components/WebDevLab';
import PythonCoursePage from '../python/PythonCoursePage';
import PythonPracticalLab from '../python/PythonPracticalLab';
import JavaHub from '../advanced-java/JavaHub';
import CoreJavaHub from '../core-java/CoreJavaHub';
import WebDevHub from '../web-dev/WebDevHub';
import MathHub from '../math/MathHub';
import FocVisualization from './FocVisualization';
import TechVerse from './TechVerse';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Layers, List, GitCommit, GitMerge, Share2, PlayCircle, CheckCircle2, ArrowLeft, ArrowRight, Trophy } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import LearningHubBackground from '../components/LearningHubBackground';

const SUBJECT_HUB_METADATA = {
  'Python': {
    icon: '🐍',
    accentFrom: 'from-blue-500',
    accentTo: 'to-purple-600',
    accentText: 'from-blue-400 via-purple-400 to-pink-400',
    level: 'Level 3 — Coder',
    xp: '950 XP',
    completion: 35,
    theoryDesc: 'Learn variables, control flow, functions, lists, dictionaries, and object-oriented Python.',
    theoryPills: ['AI Tutor', 'Interactive Lessons', 'Visual Notebooks', 'Quizzes', 'Code Tasks'],
    labDesc: 'Compile and run custom Python scripts, test code snippets, and build console utilities.',
    labPills: ['Python 3 REPL', 'Smart Compiler', 'Interactive Console', 'Custom Scripts', 'Error Debugger']
  },
  'Java': {
    icon: '☕',
    accentFrom: 'from-orange-500',
    accentTo: 'to-red-600',
    accentText: 'from-orange-400 via-red-400 to-pink-400',
    level: 'Level 2 — Explorer',
    xp: '700 XP',
    completion: 25,
    theoryDesc: 'Learn Core Java programming: variables, data types, Java operations (arithmetic, logical, bitwise), control flow, methods, arrays, OOP, exceptions, and collections.',
    theoryPills: ['Java Operations', 'Variables & Data Types', 'Control Flow', 'OOP Pillars', 'Exceptions', 'Collections Framework', 'File Handling'],
    labDesc: 'Practice Core Java operations, compile code, build classes, execute loops, and catch exceptions in the interactive lab.',
    labPills: ['Java Operations Compiler', 'Operators Sandbox', 'OOP Constructor Labs', 'Exception Handlers', 'Collections Tester', 'Interactive Console']
  },
  'DBMS': {
    icon: '🗄️',
    accentFrom: 'from-cyan-500',
    accentTo: 'to-teal-600',
    accentText: 'from-cyan-400 via-teal-400 to-emerald-400',
    level: 'Level 4 — DB Admin',
    xp: '1,150 XP',
    completion: 40,
    theoryDesc: 'Learn entity-relationship diagrams, schema normalization, ACID transactions, and indexing.',
    theoryPills: ['ER Modeling', 'Normalization', 'ACID Rules', 'SQL Syntax', 'Visual Diagrams'],
    labDesc: 'Write and run live SQL commands, create tables, query data, and perform joins in an SQLite compiler.',
    labPills: ['SQLite Compiler', 'Interactive Tables', 'Query Analyzer', 'Console Output', 'DB Schema Viewer']
  },
  'Web Development': {
    icon: '🌐',
    accentFrom: 'from-blue-500',
    accentTo: 'to-indigo-600',
    accentText: 'from-blue-400 via-indigo-400 to-purple-400',
    level: 'Level 5 — Fullstack Eng',
    xp: '1,600 XP',
    completion: 60,
    theoryDesc: 'Understand client-server architecture, DOM structures, Flexbox/Grid layouts, React components, and routing.',
    theoryPills: ['DNS Flow', 'DOM Semantics', 'Flexbox & Grid', 'React Hooks', 'Express Routing'],
    labDesc: 'Write client-side templates, run Express routes, compile CSS styling rules, and preview web pages.',
    labPills: ['Web Dev IDE', 'Live DOM Preview', 'Interactive CSS', 'Express Server REPL', 'AI Tutor Guide']
  },
  'DSA': {
    icon: '🌳',
    accentFrom: 'from-indigo-500',
    accentTo: 'to-violet-600',
    accentText: 'from-indigo-400 via-violet-400 to-pink-400',
    level: 'Level 4 — Algo Expert',
    xp: '1,350 XP',
    completion: 50,
    theoryDesc: 'Study Big-O complexity, stack/queue operations, node linking, and binary trees/graph search algorithms.',
    theoryPills: ['Big-O Analysis', 'Recursion', 'Memory Trees', 'Search Algorithms', 'Mock Interviews'],
    labDesc: 'Visualize data structures step-by-step and interact with visual memory grids for trees and graphs.',
    labPills: ['Live Memory Solver', 'Stack Visualizer', 'Queue Simulator', 'BST Solver', 'Graph Traversals']
  },
  'Mathematics': {
    icon: '🧮',
    accentFrom: 'from-emerald-500',
    accentTo: 'to-teal-600',
    accentText: 'from-emerald-400 via-teal-400 to-cyan-400',
    level: 'Level 3 — Math Modeler',
    xp: '850 XP',
    completion: 30,
    theoryDesc: 'Explore algebraic structures, limits, derivative definitions, matrix theories, and integration formulas.',
    theoryPills: ['Calculus Rules', 'Linear Equations', 'Vector Spaces', 'Probability', 'Mathematical Proofs'],
    labDesc: 'Execute numerical calculations, Gauss-Seidel equations, and Simpson integration formulas live.',
    labPills: ['Gauss Solver', 'RK4 Simulator', 'Simpson Rules', 'Bisection Rooter', 'Matrix Transform']
  },
  'FOC': {
    icon: '🔢',
    accentFrom: 'from-blue-600',
    accentTo: 'to-indigo-700',
    accentText: 'from-blue-400 via-indigo-400 to-purple-400',
    level: 'Level 1 — Novice',
    xp: '400 XP',
    completion: 10,
    theoryDesc: 'Learn basic computer systems, number system conversions, logic gates, operating systems, and computer architecture.',
    theoryPills: ['Number Systems', 'Logic Gates', 'ASCII & Unicode', 'Flowcharts', 'CPU Architecture'],
    labDesc: 'Interact with visual computing simulators, logic gate boards, and CPU instruction datapath tracing.',
    labPills: ['Logic Simulators', 'Number Converter', 'CPU datapath trace', 'Gate Playgrounds', 'Interactive Quizzes']
  }
};

function SubjectHub({ subjectName, description, isDark, onSelectView }) {
  const meta = SUBJECT_HUB_METADATA[subjectName] || {
    icon: '📚',
    accentFrom: 'from-blue-500',
    accentTo: 'to-purple-600',
    accentText: 'from-blue-400 via-purple-400 to-pink-400',
    level: 'Level 1 — Learner',
    xp: '100 XP',
    completion: 10,
    theoryDesc: 'Learn concepts, explanations, and key definitions.',
    theoryPills: ['Concepts', 'Definitions', 'Assessments'],
    labDesc: 'Practice coding and run applications interactively.',
    labPills: ['Interactive Editor', 'Live Output', 'AI Assistant']
  };

  return (
    <div className={`min-h-[85vh] flex flex-col justify-center items-center font-sans p-6 relative overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#070313] text-slate-100' : 'bg-slate-50/50 text-slate-900'
    }`}>
      {/* Background patterns */}
      <LearningHubBackground isDark={isDark} />

      {/* TOP SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl space-y-4 mb-12 z-10"
      >
        <div className="flex justify-center items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${meta.accentFrom} ${meta.accentTo} flex items-center justify-center text-3xl shadow-lg shadow-purple-500/20 text-white font-bold`}>
            {meta.icon}
          </div>
        </div>
        <h1 className={`text-4xl md:text-5xl font-black ${
          isDark 
            ? `bg-gradient-to-r ${meta.accentText} bg-clip-text text-transparent` 
            : 'text-slate-900'
        }`}>
          {subjectName} Hub
        </h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {description}
        </p>

        {/* Progress bar */}
        <div className={`max-w-md mx-auto pt-4 flex items-center justify-between gap-4 p-4 rounded-2xl border ${
          isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <Trophy className="text-amber-500" size={18} />
            <div className="text-left">
              <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Level</span>
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{meta.level}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-600">{meta.xp}</span>
            <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>|</span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{meta.completion}% Complete</span>
          </div>
        </div>
      </motion.div>

      {/* CENTER: TWO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full z-10">
        
        {/* LEFT CARD: THEORY */}
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="relative group cursor-pointer p-[1px] rounded-3xl overflow-hidden"
          onClick={() => onSelectView('theory')}
        >
          <div className={`absolute inset-0 bg-gradient-to-b ${meta.accentFrom}/40 to-transparent opacity-50 group-hover:opacity-100 transition duration-300 pointer-events-none`} />
          <div className={`relative p-8 rounded-3.5xl flex flex-col justify-between h-full border min-h-[360px] ${
            isDark ? 'bg-[#120e2a]/90 border-white/5' : 'bg-white border-slate-200 shadow-md group-hover:shadow-lg transition-shadow'
          }`}>
            <div className="space-y-6 text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-50 border border-blue-100 text-blue-600'
              }`}>
                📚
              </div>
              <div>
                <h2 className={`text-2xl font-black group-hover:text-blue-500 transition ${isDark ? 'text-white' : 'text-slate-800'}`}>Theory Learning</h2>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {meta.theoryDesc}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {meta.theoryPills.map((feat, idx) => (
                  <span key={idx} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300' : 'bg-blue-50 border border-blue-100 text-blue-600'
                  }`}>
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold rounded-xl transition duration-300 mt-8 flex items-center justify-center gap-2 group-hover:gap-3">
              Continue Theory <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* RIGHT CARD: PRACTICAL LAB */}
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="relative group cursor-pointer p-[1px] rounded-3xl overflow-hidden"
          onClick={() => onSelectView('practical')}
        >
          <div className={`absolute inset-0 bg-gradient-to-b ${meta.accentTo}/40 to-transparent opacity-50 group-hover:opacity-100 transition duration-300 pointer-events-none`} />
          <div className={`relative p-8 rounded-3.5xl flex flex-col justify-between h-full border min-h-[360px] ${
            isDark ? 'bg-[#120e2a]/90 border-white/5' : 'bg-white border-slate-200 shadow-md group-hover:shadow-lg transition-shadow'
          }`}>
            <div className="space-y-6 text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                isDark ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' : 'bg-purple-50 border border-purple-100 text-purple-600'
              }`}>
                💻
              </div>
              <div>
                <h2 className={`text-2xl font-black group-hover:text-purple-500 transition ${isDark ? 'text-white' : 'text-slate-800'}`}>Practical Lab</h2>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {meta.labDesc}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {meta.labPills.map((feat, idx) => (
                  <span key={idx} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isDark ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300' : 'bg-purple-50 border border-purple-100 text-purple-600'
                  }`}>
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-purple-600 hover:bg-purple-750 text-white text-xs font-bold rounded-xl transition duration-300 mt-8 flex items-center justify-center gap-2 group-hover:gap-3">
              Enter Practical Lab <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode: isDark } = useTheme();
  const [subject, setSubject] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [activeView, setActiveView] = useState(() => {
    return location.state?.activeView || 'hub';
  });

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  const [isCompleted, setIsCompleted] = useState(false);
  const [certId, setCertId] = useState(null);

  const fetchSubject = () => {
    setLoading(true);
    setError(null);

    if (id === 'math-proto') {
      setSubject({
        id: 'math-proto',
        subject_name: 'Mathematics',
        description: 'Advanced numerical methods and calculus execution engines.',
        topics: []
      });
      setLoading(false);
      return;
    }
    api.get(`/subjects/${id}`).then((res) => {
      setSubject(res.data);
      if (res.data.topics?.length) setActiveTopic(res.data.topics[0]);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError(err.response?.status === 404 ? 'Subject not found' : 'Failed to load subject. Please check your connection and try again.');
      setLoading(false);
    });

    api.get('/progress/certificates').then((res) => {
      const matched = res.data.certificates?.find(c => String(c.subjectId) === String(id));
      if (matched && matched.status === 'Completed') {
        setIsCompleted(true);
        setCertId(matched.certId);
      }
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSubject();
    setActiveView(location.state?.activeView || 'hub');
  }, [id, location.state?.activeView]);

  const markComplete = async (topicId) => {
    try {
      await api.post('/progress/complete-topic', { topic_id: topicId, study_minutes: 20 });
      toast.success('Topic marked as completed!');
    } catch {
      toast.error('Could not update progress');
    }
  };

  const renderTheoryTopics = () => {
    return (
      <div className="space-y-6 relative">
        <button 
          onClick={() => setActiveView('hub')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border mb-4 ${
            isDark 
              ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-purple-500/20' 
              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
          }`}
        >
          ← Back to Hub
        </button>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 card h-fit">
            <h2 className="font-semibold mb-3">Topics</h2>
            <ul className="space-y-1">
              {subject.topics?.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveTopic(t)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeTopic?.id === t.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                    {t.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 card">
            {activeTopic ? (
              <>
                <h2 className="text-xl font-semibold">{activeTopic.title}</h2>
                <div className="prose prose-slate mt-4 max-w-none dark:prose-invert">
                  <p className="text-slate-705 dark:text-slate-300 whitespace-pre-wrap">{activeTopic.content}</p>
                  {activeTopic.notes && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/30">
                      <h3 className="font-medium text-amber-800 dark:text-amber-300">Notes</h3>
                      <p className="text-amber-900 dark:text-amber-200 mt-1">{activeTopic.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  {activeTopic.pdf_url && (
                    <a href={activeTopic.pdf_url} target="_blank" rel="noreferrer" className="btn-secondary text-sm">📄 View PDF</a>
                  )}
                  {activeTopic.video_url && (
                    <a href={activeTopic.video_url} target="_blank" rel="noreferrer" className="btn-secondary text-sm">🎥 Watch Video</a>
                  )}
                  <button onClick={() => markComplete(activeTopic.id)} className="btn-primary text-sm">Mark as Completed</button>
                </div>
              </>
            ) : (
              <p className="text-slate-500">Select a topic to view content</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-slate-200 animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium animate-pulse">Loading subject...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-3xl">⚠️</div>
        <h2 className="text-xl font-bold text-slate-700">{error}</h2>
        <p className="text-sm text-slate-400">Something went wrong while loading this subject.</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate('/subjects')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition"
          >
            ← Back to Subjects
          </button>
          <button
            onClick={fetchSubject}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!subject) return null;

  // Python — Full AI-powered learning platform
  if (subject.subject_name === 'Python') {
    if (activeView === 'hub') {
      return (
        <SubjectHub
          subjectName="Python"
          description={subject.description}
          isDark={isDark}
          onSelectView={setActiveView}
        />
      );
    }

    if (activeView === 'theory') {
      return (
        <div className="relative">
          <button 
            onClick={() => setActiveView('hub')}
            className={`absolute top-4 left-4 z-50 px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
              isDark 
                ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-purple-500/20' 
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
            }`}
          >
            ← Back to Hub
          </button>
          <div className="pt-16">
            <PythonCoursePage />
          </div>
        </div>
      );
    }

    if (activeView === 'practical') {
      return <PythonPracticalLab onBack={() => setActiveView('hub')} />;
    }
  }

  // Web Development gets the interactive premium platform
  if (subject.subject_name === 'Web Development') {
    return (
      <div>
        {isCompleted && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-blue-500/20 via-indigo-600/10 to-transparent border border-blue-500/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-900/10 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-200">Congratulations! Subject Completed</h3>
                <p className="text-sm text-slate-300">You have successfully mastered all topics in this subject. Your official certificate is ready!</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/certificates')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-750 text-slate-900 font-bold rounded-xl transition duration-300 transform hover:scale-105 active:scale-95 shadow-md shadow-blue-500/20 whitespace-nowrap text-sm flex items-center gap-2"
            >
              🎓 Claim Certificate
            </button>
          </div>
        )}
        <WebDevHub />
      </div>
    );
  }

  // DBMS gets the premium AI-powered learning platform
  if (subject.subject_name === 'DBMS') {
    return (
      <div>
        {isCompleted && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-teal-600/10 to-transparent border border-cyan-500/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-cyan-900/10 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 text-cyan-400">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-cyan-200">Congratulations! Subject Completed</h3>
                <p className="text-sm text-slate-300">You have successfully mastered all topics in this subject. Your official certificate is ready!</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/certificates')}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-slate-900 font-bold rounded-xl transition duration-300 transform hover:scale-105 active:scale-95 shadow-md shadow-cyan-500/20 whitespace-nowrap text-sm flex items-center gap-2"
            >
              🎓 Claim Certificate
            </button>
          </div>
        )}
        <DBMSHub />
      </div>
    );
  }

  // Advanced Java gets the premium AI-powered learning platform
  if (subject.subject_name === 'Advanced Java') {
    return (
      <div>
        {isCompleted && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-600/10 to-transparent border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-900/10 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-200">Congratulations! Subject Completed</h3>
                <p className="text-sm text-slate-300">You have successfully mastered all topics in this subject. Your official certificate is ready!</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/certificates')}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold rounded-xl transition duration-300 transform hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20 whitespace-nowrap text-sm flex items-center gap-2"
            >
              🎓 Claim Certificate
            </button>
          </div>
        )}
        <JavaHub />
      </div>
    );
  }

  // Core Java gets the interactive premium platform
  if (subject.subject_name === 'Java') {
    return (
      <div>
        {isCompleted && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-600/10 to-transparent border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-900/10 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-200">Congratulations! Subject Completed</h3>
                <p className="text-sm text-slate-300">You have successfully mastered all topics in this subject. Your official certificate is ready!</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/certificates')}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold rounded-xl transition duration-300 transform hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20 whitespace-nowrap text-sm flex items-center gap-2"
            >
              🎓 Claim Certificate
            </button>
          </div>
        )}
        <CoreJavaHub />
      </div>
    );
  }

  // C# gets the interactive lab experience
  if (subject.subject_name === 'C#') {
    return (
      <div>
        {isCompleted && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-600/10 to-transparent border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-900/10 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-200">Congratulations! Subject Completed</h3>
                <p className="text-sm text-slate-300">You have successfully mastered all topics in this subject. Your official certificate is ready!</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/certificates')}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold rounded-xl transition duration-300 transform hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20 whitespace-nowrap text-sm flex items-center gap-2"
            >
              🎓 Claim Certificate
            </button>
          </div>
        )}
        <CSharpHub />
      </div>
    );
  }

  // --- NEW FRAMER MOTION FOC PROTOTYPE ---
  if (subject.subject_name === 'FOC') {
    if (activeView === 'hub') {
      return (
        <SubjectHub
          subjectName="FOC"
          description={subject.description}
          isDark={isDark}
          onSelectView={setActiveView}
        />
      );
    }

    if (activeView === 'theory') {
      return (
        <div className="relative w-full h-full min-h-screen">
          <button 
            onClick={() => setActiveView('hub')}
            className={`absolute top-4 left-4 z-50 px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
              isDark 
                ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-purple-500/20' 
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
            }`}
          >
            ← Back to Hub
          </button>
          <div className="pt-16 h-full w-full">
            <FocVisualization />
          </div>
        </div>
      );
    }

    if (activeView === 'practical') {
      return (
        <div className={`relative w-full h-full min-h-screen overflow-y-auto pb-20 transition-colors ${
          isDark ? 'bg-[#070313]' : 'bg-[#F8FAFC]'
        }`}>
          <button 
            onClick={() => setActiveView('hub')}
            className={`absolute top-4 left-4 z-50 px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
              isDark 
                ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-purple-500/20' 
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
            }`}
          >
            {/* L100: Back button */}
            ← Back to Hub
          </button>
          
          <div className="pt-20 w-full flex flex-col px-6">
            <div className="mb-6">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-850'}`}>
                🔮 Integrated 3D TechVerse Sandbox
              </h2>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Inspect physical components, CPU register flow, and trace custom memory architectures interactively.
              </p>
            </div>
            <TechVerse />
          </div>
        </div>
      );
    }
  }

  // --- NEW FRAMER MOTION DSA PROTOTYPE ---
  if (subject.subject_name === 'DSA') {
    if (activeView === 'hub') {
      return (
        <SubjectHub
          subjectName="DSA"
          description={subject.description}
          isDark={isDark}
          onSelectView={setActiveView}
        />
      );
    }

    if (activeView === 'theory') {
      return renderTheoryTopics();
    }

    if (activeView === 'practical') {
      const categories = [
        { id: 'stack', title: 'Stack', icon: Layers, desc: 'LIFO data structure. Ideal for undo/redo and recursion.', progress: 100 },
        { id: 'queue', title: 'Queue', icon: List, desc: 'FIFO data structure. Great for task scheduling and BFS.', progress: 40 },
        { id: 'linked-list', title: 'Linked List', icon: GitCommit, desc: 'Dynamic memory allocation with O(1) insertions.', progress: 0 },
        { id: 'tree', title: 'Tree', icon: GitMerge, desc: 'Hierarchical structure. Essential for databases and search.', progress: 0 },
        { id: 'graph', title: 'Graph', icon: Share2, desc: 'Nodes and edges representing networks and paths.', progress: 0 },
      ];

      const containerVars = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      };

      const cardVars = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100 } }
      };

      return (
        <div className="min-h-screen pb-20 relative">
          <button 
            onClick={() => setActiveView('hub')}
            className={`absolute top-4 left-4 z-50 px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
              isDark 
                ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-purple-500/20' 
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
            }`}
          >
            ← Back to Hub
          </button>

          <motion.div 
            style={{ y, opacity }}
            className="relative h-64 bg-gradient-to-r from-blue-600 to-indigo-700 flex flex-col justify-center px-8 sm:px-16 text-white overflow-hidden rounded-b-[40px] shadow-lg shadow-blue-500/20 pt-10"
          >
            <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10 max-w-7xl mx-auto w-full">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Data Structures</h1>
              <p className="text-blue-100 text-lg max-w-xl font-medium">Master the foundational building blocks of efficient algorithms and software design.</p>
            </div>
          </motion.div>

          <div className="max-w-7xl mx-auto px-6 mt-8 relative z-20">
            {isCompleted && (
              <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-600/10 to-transparent border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-900/10 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-200">Congratulations! Subject Completed</h3>
                    <p className="text-sm text-slate-300">You have successfully mastered all topics in this subject. Your official certificate is ready!</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/certificates')}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold rounded-xl transition duration-300 transform hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20 whitespace-nowrap text-sm flex items-center gap-2"
                >
                  🎓 Claim Certificate
                </button>
              </div>
            )}

            <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-bold text-slate-850 dark:text-slate-200">Learning Modules</h2>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVars}
              initial="hidden"
              animate="visible"
            >
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  variants={cardVars}
                  whileHover={{ scale: 1.03, y: -5 }}
                  onClick={() => {
                    if (cat.id === 'stack') navigate('/dsa/stack');
                    if (cat.id === 'queue') navigate('/dsa/queue');
                    if (cat.id === 'linked-list') navigate('/dsa/linked-list');
                    if (cat.id === 'tree') navigate('/dsa/tree');
                    if (cat.id === 'graph') navigate('/dsa/graph');
                  }}
                  className={`card-glass cursor-pointer flex flex-col justify-between ${['stack', 'queue', 'linked-list', 'tree', 'graph'].includes(cat.id) ? 'ring-2 ring-blue-500 shadow-blue-500/20' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                      <cat.icon className="w-6 h-6" />
                    </div>
                    {cat.progress === 100 && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{cat.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">{cat.desc}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cat.progress}%` }}></div>
                      </div>
                    </div>
                    <button className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                      <PlayCircle className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      );
    }
  }

  // --- NEW FRAMER MOTION MATHEMATICS PROTOTYPE ---
  if (subject.subject_name === 'Mathematics') {
    if (activeView === 'hub' || activeView === 'theory') {
      return (
        <MathHub 
          onSelectView={setActiveView} 
        />
      );
    }

    if (activeView === 'practical') {
      const categories = [
        { id: 'numerical-methods', title: 'Numerical Methods', icon: Layers, desc: 'Trapezoidal, Simpson’s, RK4, and Interpolation runtimes.', progress: 80 },
        { id: 'calculus', title: 'Calculus Simulator', icon: Share2, desc: 'Gauss-Seidel iterative solver and Bisection root-finding engines.', progress: 20 },
        { id: 'linear-algebra', title: 'Linear Algebra', icon: GitMerge, desc: 'Matrix transformations, Eigenvalues, and Vector Spaces.', progress: 60 },
      ];

      const containerVars = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      };

      const cardVars = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100 } }
      };

      return (
        <div className="min-h-screen pb-20 relative">
          <button 
            onClick={() => setActiveView('hub')}
            className={`absolute top-4 left-4 z-50 px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
              isDark 
                ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-purple-500/20' 
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
            }`}
          >
            ← Back to Hub
          </button>

          <motion.div 
            style={{ y, opacity }}
            className="relative h-64 bg-gradient-to-r from-emerald-600 to-teal-700 flex flex-col justify-center px-8 sm:px-16 text-white overflow-hidden rounded-b-[40px] shadow-lg shadow-emerald-500/20 pt-10"
          >
            <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-start">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Mathematics Lab</h1>
              <p className="text-teal-100 text-lg max-w-xl font-medium">Watch mathematical formulas execute live like a programming runtime.</p>
            </div>
          </motion.div>

          <div className="max-w-7xl mx-auto px-6 mt-8 relative z-20">
            {isCompleted && (
              <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-600/10 to-transparent border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-900/10 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-200">Congratulations! Subject Completed</h3>
                    <p className="text-sm text-slate-300">You have successfully mastered all topics in this subject. Your official certificate is ready!</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/certificates')}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold rounded-xl transition duration-300 transform hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20 whitespace-nowrap text-sm flex items-center gap-2"
                >
                  🎓 Claim Certificate
                </button>
              </div>
            )}

            <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-bold text-slate-850 dark:text-slate-200">Visual Solver Engines</h2>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVars}
              initial="hidden"
              animate="visible"
            >
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  variants={cardVars}
                  whileHover={{ scale: 1.03, y: -5 }}
                  onClick={() => {
                    if (cat.id === 'numerical-methods') navigate('/mathematics/numerical-methods');
                    if (cat.id === 'calculus') navigate('/mathematics/calculus');
                    if (cat.id === 'linear-algebra') navigate('/mathematics/linear-algebra');
                  }}
                  className={`card-glass cursor-pointer flex flex-col justify-between ${cat.id === 'numerical-methods' || cat.id === 'calculus' || cat.id === 'linear-algebra' ? 'ring-2 ring-emerald-500 shadow-emerald-500/20' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                      <cat.icon className="w-6 h-6" />
                    </div>
                    {cat.progress === 100 && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{cat.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">{cat.desc}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cat.progress}%` }}></div>
                      </div>
                    </div>
                    <button className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition">
                      <PlayCircle className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      );
    }
  }

  // Generic fallback UI for all other subjects
  return (
    <div className="space-y-6">
      {isCompleted && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-600/10 to-transparent border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-900/10 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-200">Congratulations! Subject Completed</h3>
              <p className="text-sm text-slate-300">You have successfully mastered all topics in this subject. Your official certificate is ready!</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/certificates')}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold rounded-xl transition duration-300 transform hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20 whitespace-nowrap text-sm flex items-center gap-2"
          >
            🎓 Claim Certificate
          </button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">{subject.subject_name}</h1>
        <p className="text-slate-500">{subject.description}</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 card h-fit">
          <h2 className="font-semibold mb-3">Topics</h2>
          <ul className="space-y-1">
            {subject.topics?.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setActiveTopic(t)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeTopic?.id === t.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
                >
                  {t.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3 card">
          {activeTopic ? (
            <>
              <h2 className="text-xl font-semibold">{activeTopic.title}</h2>
              <div className="prose prose-slate mt-4 max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap">{activeTopic.content}</p>
                {activeTopic.notes && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h3 className="font-medium text-amber-800">Notes</h3>
                    <p className="text-amber-900 mt-1">{activeTopic.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                {activeTopic.pdf_url && (
                  <a href={activeTopic.pdf_url} target="_blank" rel="noreferrer" className="btn-secondary text-sm">📄 View PDF</a>
                )}
                {activeTopic.video_url && (
                  <a href={activeTopic.video_url} target="_blank" rel="noreferrer" className="btn-secondary text-sm">🎥 Watch Video</a>
                )}
                <button onClick={() => markComplete(activeTopic.id)} className="btn-primary text-sm">Mark as Completed</button>
              </div>
            </>
          ) : (
            <p className="text-slate-500">Select a topic to view content</p>
          )}
        </div>
      </div>
    </div>
  );
}
