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
import DBMSSmartTVPlayer from './DBMSSmartTVPlayer';

const DBMS_THEORY_LESSONS = [
  {
    id: 'intro',
    title: 'Database Systems & DBMS',
    slug: 'dbms-fundamentals',
    desc: 'Understand three-schema architecture, logical independence, file systems vs databases, and structural keys.',
    difficulty: 'Beginner',
    time: '45 mins',
    xp: 150,
    accent: '#06B6D4',
    icon: '🗄️',
    topics: ['Database vs File System', '3-Schema Architecture', 'Data Independence', 'Primary & Foreign Keys', 'DBMS Schema'],
    chapters: [
      { title: '1. What is a DBMS?', content: 'A Database Management System (DBMS) is software that manages, stores, retrieves, and protects data.' },
      { title: '2. 3-Schema Architecture', content: 'Divides system views into External (user view), Conceptual (logical design), and Internal (physical files).' },
      { title: '3. Schema Keys', content: 'Primary Keys uniquely identify records. Foreign Keys represent references creating relationship links.' }
    ],
    script: [
      { type: 'intro', text: "Welcome to Database Systems and DBMS. A DBMS is a specialized software engine designed to define, store, manage, and protect structured data." },
      { type: 'concept', text: "Unlike basic file storage, a DBMS provides centralized data access, eliminates redundancy, prevents inconsistency, and guarantees concurrent user access controls." },
      { type: 'concept', text: "The ANSI SPARC 3-Schema Architecture separates database layers into three views: the External level for end-user interfaces, the Conceptual level for structural schemas, and the Internal level for physical disk blocks." },
      { type: 'concept', text: "This separation enables logical and physical Data Independence. You can modify physical storage device layouts without changing your logical application tables or SQL queries." },
      { type: 'code', text: "Tables represent relation models. Columns define schema attributes, and rows hold active entity data. Each table must declare a unique Primary Key attribute to avoid record replication." },
      { type: 'warn', text: "Security Warning: Always define Foreign Key constraints on your schemas. Without them, orphaned records can break referential integrity, creating logical database corruption." },
      { type: 'quiz', text: "Quick Check! What are the three levels of database SPARC architecture? External, Conceptual, and Internal schema layers." },
      { type: 'congrats', text: "Superb! You have completed DBMS fundamentals. You now understand schemas, data independence, drivers, and relation models." },
      { type: 'summary', text: "In this module, we covered: DBMS structures, ANSI SPARC 3-schema models, logical vs physical data independence, and primary/foreign relationship keys." }
    ]
  },
  {
    id: 'sql-relational',
    title: 'Relational Model & SQL queries',
    slug: 'sql-fundamentals',
    desc: 'Master SQL DDL, DML operations, nested subqueries, and advanced INNER, LEFT, RIGHT, FULL outer Joins.',
    difficulty: 'Intermediate',
    time: '60 mins',
    xp: 180,
    accent: '#0891B2',
    icon: '🔍',
    topics: ['SQL SELECT', 'INNER JOIN', 'LEFT & RIGHT JOINS', 'Subqueries', 'Aggregate Functions'],
    chapters: [
      { title: '1. Relational Algebra & SQL', content: 'Relational model structures data in tuples. SQL is the structured declarative language used to query relationships.' },
      { title: '2. SQL Join Algebra', content: 'INNER JOIN returns intersecting keys. LEFT/RIGHT OUTER JOINS preserve unmatched records from either table.' },
      { title: '3. Aggregation & Subqueries', content: 'GROUP BY segments datasets. HAVING filters aggregates, and Subqueries compute nested outputs.' }
    ],
    script: [
      { type: 'intro', text: "Welcome to Relational Model and SQL Queries. Here you will master standard relational querying to interact with production SQL engines." },
      { type: 'concept', text: "The Relational Model represents data in tables with attributes and domains. Structured Query Language, or SQL, lets you write declarative statements to manipulate these relations." },
      { type: 'code', text: "SELECT name, gpa FROM students WHERE gpa >= 9.0; -- This standard query filters students based on conditional criteria." },
      { type: 'concept', text: "Joins merge rows across tables. An INNER JOIN only returns rows with matching keys. A LEFT JOIN returns all rows from the left table, plus matching rows from the right." },
      { type: 'code', text: "SELECT s.name, c.course_name FROM students s LEFT JOIN enrollments e ON s.id = e.student_id LEFT JOIN courses c ON e.course_id = c.id;" },
      { type: 'warn', text: "Important: Always specify index-indexed keys inside your JOIN conditions. Querying non-indexed columns forces full table scans, slowing down production performance." },
      { type: 'quiz', text: "Quick Check! What is the difference between WHERE and HAVING in SQL? WHERE filters rows before aggregation; HAVING filters groups after aggregation." },
      { type: 'congrats', text: "Awesome! You have completed SQL Relational querying. You can now write complex subqueries, groupings, and outer relationship joins." },
      { type: 'summary', text: "In this module, we covered: relational query definitions, select filters, INNER/LEFT/RIGHT outer joins, group aggregations, and subquery filters." }
    ]
  },
  {
    id: 'acid-normal',
    title: 'Normalization & ACID Properties',
    slug: 'database-normalization',
    desc: 'Eliminate structural redundancies using 1NF, 2NF, 3NF, BCNF, and secure transactions with ACID rules.',
    difficulty: 'Advanced',
    time: '55 mins',
    xp: 200,
    accent: '#0E7490',
    icon: '🛡️',
    topics: ['1NF 2NF 3NF BCNF', 'Redundancy Anomalies', 'ACID Transactions', 'Concurrency Controls', 'SQL Locks'],
    chapters: [
      { title: '1. Normalization Normal Forms', content: 'Minimizes insert, update, and delete anomalies by splitting tables based on functional dependencies.' },
      { title: '2. ACID Transaction Rules', content: 'Guarantees transaction reliability: Atomicity, Consistency, Isolation, and Durability.' },
      { title: '3. Concurrency Lock Systems', content: 'Avoids race conditions like dirty reads and phantom reads using optimistic and pessimistic locks.' }
    ],
    script: [
      { type: 'intro', text: "Welcome to Normalization and ACID Properties. You will learn to design robust database schemas and protect data integrity during high-concurrency operations." },
      { type: 'concept', text: "Normalization eliminates update anomalies. First Normal Form requires atomic values. Second Normal Form removes partial dependencies. Third Normal Form removes transitive dependencies." },
      { type: 'code', text: "To normalize to 3NF, identify dependencies like: A determines B, and B determines C. Split them into separate tables: (A, B) and (B, C) to resolve anomalies." },
      { type: 'concept', text: "Database transactions must obey ACID. Atomicity ensures all-or-nothing execution. Consistency preserves integrity rules. Isolation shields concurrent runs, and Durability locks writes to disk." },
      { type: 'warn', text: "Critical Design Alert: Too much normalization increases the number of joins, which degrades query performance. Under high read volumes, consider denormalizing selectively." },
      { type: 'quiz', text: "Quick Check! What database isolation anomaly occurs when a transaction reads uncommitted changes from another transaction? A Dirty Read anomaly." },
      { type: 'congrats', text: "Outstanding! You have completed Normalization and ACID transactions. You can now design schema tables and secure relational databases." },
      { type: 'summary', text: "In this module, we covered: 1NF, 2NF, and 3NF normal forms, transactional anomalies, ACID properties, isolation levels, and concurrency lock strategies." }
    ]
  }
];

export default function DBMSTheory() {
  const { isDarkMode } = useTheme();
  const isDark = isDarkMode;
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTalking, setIsTalking] = useState(false);
  const [activeLessonTab, setActiveLessonTab] = useState('learn');
  const [notes, setNotes] = useState('');

  const accentColor = selectedLesson?.accent || '#06B6D4';

  const handleTalkingChange = useCallback((talking) => {
    setIsTalking(talking);
  }, []);

  const handleStepChange = useCallback((stepIdx) => {
    setCurrentStep(stepIdx);
  }, []);

  if (selectedLesson) {
    const totalSteps = selectedLesson.script.length;
    const currentScriptStep = selectedLesson.script[currentStep] || {};

    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#050816] text-[#E2E8F0]' : 'bg-[#F8FAFC] text-[#1E293B]'} pb-32 transition-colors duration-300 font-sans`}>
        
        {/* Custom Styles */}
        <style>{`
          .futuristic-glow-cyan {
            box-shadow: ${isDark 
              ? `0 0 50px -10px ${accentColor}30, 0 0 30px -15px ${accentColor}20`
              : `0 10px 40px -10px rgba(0, 0, 0, 0.04), 0 0 20px -5px ${accentColor}10`};
          }
          .glass-panel-cyan {
            background: ${isDark ? 'rgba(11, 16, 32, 0.6)' : 'rgba(255, 255, 255, 0.85)'};
            backdrop-filter: blur(20px);
            border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'};
          }
        `}</style>

        <div className="max-w-[1550px] mx-auto px-4 md:px-8 pt-6 space-y-6">
          {/* Header Back & Info Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-6 glass-panel-cyan relative overflow-hidden futuristic-glow-cyan"
          >
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedLesson(null)}
                  className={`p-2.5 rounded-xl border transition ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'}`}
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">
                    <span>DBMS Module</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{selectedLesson.difficulty}</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-black">{selectedLesson.title}</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-slate-400">{selectedLesson.time}</span>
                <span className="text-xs bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl font-mono text-cyan-400 font-bold">+{selectedLesson.xp} XP</span>
              </div>
            </div>
          </motion.div>

          {/* 70/30 Studio Split */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
            {/* Player Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl overflow-hidden glass-panel-cyan futuristic-glow-cyan p-1.5" style={{ height: '480px' }}>
                <DBMSSmartTVPlayer
                  lesson={selectedLesson}
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onStepChange={handleStepChange}
                  accentColor={accentColor}
                  onTalkingChange={handleTalkingChange}
                />
              </div>

              {/* Chapters timeline list below player */}
              <div className={`rounded-3xl p-5 glass-panel-cyan border ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest block mb-3 font-mono`}>Chapters Map</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedLesson.script.map((s, i) => {
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
                        <span className="truncate">{i + 1}. {s.text.slice(0, 20)}...</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Coach Column */}
            <div className="lg:col-span-3 space-y-6">
              {/* Coding Coach Box */}
              <div className={`rounded-3xl p-6 glass-panel-cyan futuristic-glow-cyan border relative ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={18} className="text-cyan-400" />
                    <span className="text-xs font-mono font-bold tracking-wider uppercase">DBMS Mentor</span>
                  </div>
                  <span className="flex h-2 w-2 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTalking ? 'bg-cyan-400' : 'bg-slate-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isTalking ? 'bg-cyan-500' : 'bg-slate-500'}`}></span>
                  </span>
                </div>
                <div className={`rounded-2xl p-4 min-h-[160px] flex items-center justify-center text-center relative overflow-hidden ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-100'} border`}>
                  <div className="z-10">
                    <div className="text-2xl mb-2">{isTalking ? '🗣️' : '🤖'}</div>
                    <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'} leading-relaxed font-mono`}>
                      {isTalking ? 'Speaking DBMS query rules...' : 'Ask your DBMS query logic doubt anytime! Double-tap screen to voice-query.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Syllabus Chapters Info list */}
              <div className={`rounded-3xl p-5 glass-panel-cyan border ${isDark ? 'border-white/5' : 'border-slate-200'} space-y-4`}>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Reference Guides</span>
                <div className="space-y-2">
                  {selectedLesson.chapters.map((chap, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentChapterIdx(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        currentChapterIdx === idx
                          ? isDark ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'
                          : isDark ? 'bg-white/[0.02] border-transparent hover:bg-white/5' : 'bg-slate-50 border-transparent hover:bg-slate-100'
                      }`}
                    >
                      <h4 className={`text-xs font-bold ${currentChapterIdx === idx ? 'text-cyan-400' : isDark ? 'text-slate-200' : 'text-slate-800'}`}>{chap.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{chap.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[80vh] ${isDark ? 'bg-[#070313] text-slate-100' : 'bg-slate-50 text-slate-900'} p-6 relative font-sans transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Banner Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className={`text-3xl font-black ${isDark ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent' : 'text-slate-900'}`}>
            DBMS Learning Modules
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Select a database topic. Learn schema constraints, standard SQL querying, and relational normal forms with our interactive AI Teacher.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DBMS_THEORY_LESSONS.map((les) => (
            <motion.div
              key={les.id}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`rounded-3xl p-6 border flex flex-col justify-between transition-all ${
                isDark 
                  ? 'bg-slate-900/60 border-white/5 hover:border-cyan-500/20' 
                  : 'bg-white border-slate-200 hover:shadow-lg'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{les.icon}</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase font-bold">{les.difficulty}</span>
                </div>
                <h3 className="text-base font-bold mb-1.5">{les.title}</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed mb-4`}>{les.desc}</p>
                
                {/* Topic Tags */}
                <div className="flex flex-wrap gap-1 mb-6">
                  {les.topics.slice(0, 3).map((top, idx) => (
                    <span key={idx} className={`text-[9px] font-mono px-2 py-0.5 rounded ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                      {top}
                    </span>
                  ))}
                  {les.topics.length > 3 && <span className="text-[9px] font-mono text-slate-500 px-1">+ {les.topics.length - 3} more</span>}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedLesson(les);
                  setCurrentStep(0);
                }}
                className="w-full py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>Start Learning</span>
                <ChevronRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
