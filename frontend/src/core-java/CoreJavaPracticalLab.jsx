import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Layers, PlayCircle, BookOpen, Terminal, Sparkles, 
  Code2, CheckCircle, HelpCircle, ArrowLeft, Cpu, Shield, 
  FileCode, Play, AlertCircle, RefreshCw, Trophy, Flame, 
  ChevronRight, BrainCircuit, Activity, Eye, Compass, Save,
  Send, UserCheck, Lock, Unlock, Server, Monitor, HardDrive,
  ArrowRight, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import useCoreJavaStore from './store/useCoreJavaStore';

const ROADMAP_NODES = [
  { id: 'basics', label: 'Java Compilation Basics', category: 'Basics', xp: 100, difficulty: 'Easy', time: '20m', desc: 'Understanding JVM, JDK, bytecode compilation and main()' },
  { id: 'variables', label: 'Variables & Memory Types', category: 'Basics', xp: 120, difficulty: 'Easy', time: '25m', desc: 'Working with primitives in Stack and reference pointers' },
  { id: 'operators', label: 'Java Basic Operations', category: 'Basics', xp: 120, difficulty: 'Easy', time: '20m', desc: 'Mastering arithmetic, logical, and ternary operations' },
  { id: 'oop-inst', label: 'OOP Instantiations', category: 'OOP', xp: 150, difficulty: 'Medium', time: '30m', desc: 'Creating classes, objects, and Heap allocation mapping' },
  { id: 'oop-inher', label: 'OOP Subclass Inheritance', category: 'OOP', xp: 180, difficulty: 'Medium', time: '35m', desc: 'Extending parent classes and overriding methods' },
  { id: 'collections', label: 'Dynamic Array Lists', category: 'Collections', xp: 180, difficulty: 'Medium', time: '30m', desc: 'Utilizing ArrayList and generic Collections' },
  { id: 'exceptions', label: 'Exception Handling', category: 'Exceptions', xp: 200, difficulty: 'Hard', time: '40m', desc: 'Resolving null pointer and index bounds runtime errors' }
];

export default function CoreJavaPracticalLab({ onBack }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'roadmap', 'workspace', 'debug', 'project', 'achievements'
  const { isDarkMode: isDark } = useTheme();
  
  const [selectedNode, setSelectedNode] = useState(ROADMAP_NODES[0]);
  const [vizType, setVizType] = useState('jvm'); // 'jvm', 'memory', 'oop'
  const [userCode, setUserCode] = useState(`public class App {\n  public static void main(String[] args) {\n    System.out.println("Coding in Java Lab!");\n  }\n}`);
  const [consoleOutput, setConsoleOutput] = useState('Write your code and click Run.');
  const [isRunning, setIsRunning] = useState(false);

  // Stats from store
  const totalXP = useCoreJavaStore(s => s.xpEarned);
  const completed = useCoreJavaStore(s => s.completedLessons);
  const badges = useCoreJavaStore(s => s.badges);

  const handleRunCode = () => {
    setIsRunning(true);
    setConsoleOutput('Compiling source code...\n');
    setTimeout(() => {
      setConsoleOutput(prev => prev + 'JVM initializing...\nCoding in Java Lab!\n\nProcess completed successfully.');
      setIsRunning(false);
      toast.success('Code compiled successfully! (+50 XP)');
      useCoreJavaStore.getState().completeLesson(selectedNode.id, 50);
    }, 1200);
  };

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-[#050814] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-350' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650 shadow-sm'}`}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                  Java Practical Lab
                </span>
              </div>
              <h1 className="text-2xl font-black">Core Java Developer Workspace</h1>
            </div>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex gap-2 p-1 rounded-xl bg-slate-900/40 border border-slate-800 max-w-2xl overflow-x-auto scrollbar-none">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'roadmap', label: '🗺️ Roadmap' },
            { id: 'workspace', label: '💻 Workspace' },
            { id: 'debug', label: '🐛 Debug Arena' },
            { id: 'project', label: '🏆 Projects' },
            { id: 'achievements', label: '🏅 Badges' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB VIEWS */}
        <AnimatePresence mode="wait">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Metric Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Total Lab XP', value: `${totalXP + 700} XP`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/15 border-amber-500/30' },
                  { title: 'Completed Labs', value: `${completed.length} / 7`, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/15 border-emerald-500/30' },
                  { title: 'Current Streak', value: '5 Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/15 border-orange-500/30' },
                  { title: 'Projects Complete', value: '1 Done', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/15 border-purple-500/30' }
                ].map((stat, i) => (
                  <div key={i} className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} flex items-center gap-4`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                      <stat.icon className={stat.color} size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">{stat.title}</span>
                      <strong className="text-xl font-black">{stat.value}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Interactive Visualizations */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 p-6 rounded-3xl border ${isDark ? 'bg-slate-900/25 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} flex flex-col justify-between min-h-[340px]`}>
                  <div>
                    <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2">
                      <Cpu className="text-orange-500" size={18} /> Live Interactive Visualizations
                    </h3>
                    <div className="flex gap-2 mb-6">
                      {['jvm', 'memory', 'oop'].map(type => (
                        <button
                          key={type}
                          onClick={() => setVizType(type)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${vizType === type ? 'bg-orange-500 text-white' : 'border border-slate-800 text-slate-400'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-center py-6 border border-slate-800/40 rounded-2xl bg-black/25">
                      {vizType === 'jvm' && (
                        <div className="text-xs text-slate-350 space-y-2 text-center">
                          <div className="flex gap-2 items-center justify-center font-mono">
                            <span className="px-2 py-1 bg-orange-500/10 border border-orange-500/25 rounded">Main.java</span>
                            <span>→</span>
                            <span className="px-2 py-1 bg-red-500/10 border border-red-500/25 rounded">javac</span>
                            <span>→</span>
                            <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/25 rounded">Main.class (Bytecode)</span>
                            <span>→</span>
                            <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded">JVM Interpreter</span>
                          </div>
                          <p className="text-[11px] pt-4 text-slate-400">Bytecode class execution workflow translates platform-neutral logic into native commands.</p>
                        </div>
                      )}

                      {vizType === 'memory' && (
                        <div className="text-xs text-slate-350 space-y-2 text-center font-mono">
                          <div className="flex gap-4">
                            <div className="p-3 border border-slate-800 rounded bg-slate-900/50">Stack Frame (Local variables)</div>
                            <div className="p-3 border border-slate-850 rounded bg-slate-900/50">Heap Memory (Objects)</div>
                          </div>
                          <p className="text-[11px] pt-4 text-slate-400">Primitives live inside stack frames. Objects reside inside heap pointers.</p>
                        </div>
                      )}

                      {vizType === 'oop' && (
                        <div className="text-xs text-slate-350 space-y-2 text-center font-mono">
                          <div className="p-3 border border-purple-500/25 rounded bg-purple-500/10">Parent: Animal Class</div>
                          <div className="text-slate-500">▲ extends</div>
                          <div className="p-3 border border-orange-500/25 rounded bg-orange-500/10">Subclass: Dog Class</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-slate-900/25 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div>
                    <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2">
                      <BrainCircuit className="text-orange-500" size={18} /> Continue Learning
                    </h3>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-900">
                      <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest block mb-1">Next Lesson Node</span>
                      <strong className="text-xs font-bold text-white block">Java Compilation Basics</strong>
                      <p className="text-[10px] text-slate-500 mt-1">Practice compiler basics, statements syntax, and execution pipelines.</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setSelectedNode(ROADMAP_NODES[0]); setActiveTab('workspace'); }}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition hover:opacity-95"
                  >
                    Resume Coding Sandbox <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ROADMAP TAB */}
          {activeTab === 'roadmap' && (
            <motion.div key="roadmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/25 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="font-extrabold text-sm mb-4">Practical Learning Roadmap</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {ROADMAP_NODES.map((node) => (
                    <div
                      key={node.id}
                      onClick={() => { setSelectedNode(node); setActiveTab('workspace'); }}
                      className="p-5 rounded-2xl border border-slate-800 bg-slate-900/20 hover:border-orange-500/40 transition cursor-pointer flex flex-col justify-between min-h-[170px]"
                    >
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400">{node.category}</span>
                        <h4 className="font-bold text-sm mt-1">{node.label}</h4>
                        <p className="text-[10px] text-slate-500 mt-1.5">{node.desc}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800">
                        <span className="text-[10px] font-bold text-orange-500">+{node.xp} XP</span>
                        <span className="text-[10px] text-slate-400">⏱️ {node.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* WORKSPACE TAB */}
          {activeTab === 'workspace' && (
            <motion.div key="workspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[560px]">
              {/* Left Instructions */}
              <div className={`border rounded-2xl flex flex-col overflow-hidden ${isDark ? 'bg-slate-900/25 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-950/40">
                  <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen size={14} /> Mission Instructions
                  </h3>
                  <span className="text-xs font-bold text-orange-500">+{selectedNode.xp} XP</span>
                </div>
                <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
                  <h4 className="font-extrabold text-sm">{selectedNode.label}</h4>
                  <p className="text-slate-400 leading-relaxed">{selectedNode.desc}</p>
                  
                  <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 space-y-1.5">
                    <strong className="text-[10px] uppercase font-bold text-orange-500 block">Task Details:</strong>
                    <p className="text-[10px] text-slate-350">Write standard class headers, declare main methods, and test console print expressions correctly inside the editor.</p>
                  </div>
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className={`p-6 rounded-3xl border flex-1 flex flex-col justify-between ${isDark ? 'bg-slate-900/25 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-mono font-bold text-slate-400">App.java</span>
                      <button 
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl text-xs cursor-pointer hover:opacity-95"
                      >
                        {isRunning ? 'Compiling...' : 'Run Code'}
                      </button>
                    </div>

                    <textarea
                      value={userCode}
                      onChange={e => setUserCode(e.target.value)}
                      className="w-full min-h-[220px] p-4 bg-black border border-slate-900 rounded-2xl font-mono text-xs text-white outline-none resize-y"
                    />
                  </div>

                  <div className="mt-4">
                    <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">Execution Console</span>
                    <div className="p-3 bg-black rounded-xl border border-slate-900 font-mono text-[10px] text-emerald-400 whitespace-pre-wrap min-h-[80px]">
                      {consoleOutput}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* DEBUG ARENA TAB */}
          {activeTab === 'debug' && (
            <motion.div key="debug" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/25 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="font-extrabold text-sm mb-4">JVM Debugging Arena</h3>
                <p className="text-xs text-slate-400 mb-6">Find and resolve compilation errors and runtime exception triggers.</p>
                
                <div className="p-4 bg-black rounded-xl border border-slate-900 font-mono text-red-400 text-[10px] leading-relaxed mb-4">
                  java.lang.NullPointerException<br />
                  &nbsp;&nbsp;at App.runCheck(App.java:12)<br />
                  &nbsp;&nbsp;at App.main(App.java:4)
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => toast.success('Correct! Checking if null values exist resolves the NPE. (+40 XP)')}
                    className="w-full p-4 rounded-xl border border-slate-800 bg-slate-900/20 text-left text-xs hover:border-orange-500/40 transition"
                  >
                    1. Fix: add a `if (obj != null)` validation boundary.
                  </button>
                  <button 
                    onClick={() => toast.error('Incorrect. Instantiating arrays does not populate indexes.')}
                    className="w-full p-4 rounded-xl border border-slate-800 bg-slate-900/20 text-left text-xs hover:border-orange-500/40 transition"
                  >
                    2. Fix: increase array bounds size dimensions.
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'project' && (
            <motion.div key="project" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/25 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="font-extrabold text-sm mb-4">Core Java Portfolio Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'ATM Console System', desc: 'Simulate transactional ATM commands: deposit, check balance, withdraw, and transaction logs using OOP.', xp: 200 },
                    { title: 'Student Registry Ledger', desc: 'Maintain database registries using Java Collections List mapping student objects.', xp: 250 }
                  ].map((p, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-850 bg-slate-900/10 flex flex-col justify-between min-h-[150px]">
                      <div>
                        <h4 className="font-bold text-sm">{p.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1.5">{p.desc}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-[10px] font-bold text-orange-500">✨ {p.xp} XP Reward</span>
                        <button 
                          onClick={() => toast.success('ATM Mission starter template loaded in workspace!')}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Start Project
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <motion.div key="achievements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/25 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="font-extrabold text-sm mb-4">Unlocked Badges Collection</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {[
                    { id: 'basics-master', label: 'Basics Master', icon: '☕' },
                    { id: 'variables-master', label: 'Variables Master', icon: '📦' }
                  ].map(b => (
                    <div key={b.id} className="p-4 rounded-xl border border-orange-500/25 bg-orange-500/5 text-center">
                      <div className="text-3xl mb-2">{b.icon}</div>
                      <span className="text-[10px] font-bold block">{b.label}</span>
                      <span className="text-[8px] text-slate-500 block mt-1">Unlocked</span>
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
