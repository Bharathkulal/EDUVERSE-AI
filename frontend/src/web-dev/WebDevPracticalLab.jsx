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
import useWebDevStore from './store/useWebDevStore';

const ROADMAP_NODES = [
  { id: 'html-basics', label: 'HTML Structure Layout', category: 'HTML', xp: 100, difficulty: 'Easy', time: '20m', desc: 'Understanding tags, elements, body structures, and semantic headers' },
  { id: 'css-styling', label: 'CSS Selectors & Styling', category: 'CSS', xp: 120, difficulty: 'Easy', time: '25m', desc: 'Working with classes, IDs, colors, sizes, and layout margins' },
  { id: 'js-core', label: 'JavaScript Executions', category: 'JavaScript', xp: 150, difficulty: 'Medium', time: '30m', desc: 'Running local scripts, declaring operations, and controlling outputs' }
];

export default function WebDevPracticalLab({ onBack }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'roadmap', 'workspace', 'debug', 'project', 'achievements'
  const { isDarkMode: isDark } = useTheme();
  
  const [selectedNode, setSelectedNode] = useState(ROADMAP_NODES[0]);
  const [vizType, setVizType] = useState('dom'); // 'dom', 'flexbox', 'http'
  const [userCode, setUserCode] = useState(`<!DOCTYPE html>\n<html>\n<body>\n  <h1>Live Web Lab</h1>\n  <p>Modify HTML syntax live.</p>\n</body>\n</html>`);
  const [consoleOutput, setConsoleOutput] = useState('Console output idle. Make modifications and click Run.');
  const [isRunning, setIsRunning] = useState(false);

  // Stats from store
  const totalXP = useWebDevStore(s => s.xpEarned);
  const completed = useWebDevStore(s => s.completedLessons);
  const badges = useWebDevStore(s => s.badges);

  const handleRunCode = () => {
    setIsRunning(true);
    setConsoleOutput('Rendering frontend viewport...\n');
    setTimeout(() => {
      setConsoleOutput(prev => prev + 'HTML Dom successfully loaded.\nDocument title matching "Live Web Lab"\n\nRender viewport active.');
      setIsRunning(false);
      toast.success('Web elements rendered! (+50 XP)');
      useWebDevStore.getState().completeLesson(selectedNode.id, 50);
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
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-650'}`}>
                  Web Dev Lab
                </span>
              </div>
              <h1 className="text-2xl font-black">Frontend Developer Workspace</h1>
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
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
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
                  { title: 'Total Lab XP', value: `${totalXP + 950} XP`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/15 border-amber-500/30' },
                  { title: 'Completed Labs', value: `${completed.length} / 3`, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/15 border-emerald-500/30' },
                  { title: 'Current Streak', value: '7 Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/15 border-orange-500/30' },
                  { title: 'Projects Complete', value: '0 Done', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/15 border-purple-500/30' }
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
                      <Cpu className="text-blue-500" size={18} /> Live Interactive Visualizations
                    </h3>
                    <div className="flex gap-2 mb-6">
                      {['dom', 'flexbox', 'http'].map(type => (
                        <button
                          key={type}
                          onClick={() => setVizType(type)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${vizType === type ? 'bg-blue-500 text-white' : 'border border-slate-800 text-slate-400'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-center py-6 border border-slate-800/40 rounded-2xl bg-black/25">
                      {vizType === 'dom' && (
                        <div className="text-xs text-slate-350 space-y-2 text-center font-mono">
                          <div className="flex gap-2 items-center justify-center">
                            <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/25 rounded">html</span>
                            <span>→</span>
                            <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/25 rounded">body</span>
                            <span>→</span>
                            <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/25 rounded">h1 (Node)</span>
                          </div>
                          <p className="text-[11px] pt-4 text-slate-400">Interactive Document Object Model represents elements as structured nodes.</p>
                        </div>
                      )}

                      {vizType === 'flexbox' && (
                        <div className="text-xs text-slate-350 space-y-2 text-center font-mono">
                          <div className="flex gap-2 justify-center border border-dashed border-slate-700 p-4 rounded">
                            <div className="p-2 bg-blue-500/20 border border-blue-500/40 rounded">Box 1</div>
                            <div className="p-2 bg-blue-500/20 border border-blue-500/40 rounded">Box 2</div>
                            <div className="p-2 bg-blue-500/20 border border-blue-500/40 rounded">Box 3</div>
                          </div>
                          <p className="text-[11px] pt-4 text-slate-400">Flexbox alignment handles item distribution along row/column vectors.</p>
                        </div>
                      )}

                      {vizType === 'http' && (
                        <div className="text-xs text-slate-350 space-y-2 text-center font-mono">
                          <div className="flex gap-4 items-center">
                            <div className="p-2 border border-slate-850 rounded">Client Request</div>
                            <span className="text-blue-500">GET /index.html</span>
                            <div className="p-2 border border-slate-850 rounded">Server Response (200 OK)</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-slate-900/25 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div>
                    <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2">
                      <BrainCircuit className="text-blue-500" size={18} /> Continue Learning
                    </h3>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-900">
                      <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest block mb-1">Next Lesson Node</span>
                      <strong className="text-xs font-bold text-white block">HTML Structure Layout</strong>
                      <p className="text-[10px] text-slate-500 mt-1">Practice element tags, headers, and semantic structures.</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setSelectedNode(ROADMAP_NODES[0]); setActiveTab('workspace'); }}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition hover:opacity-95"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ROADMAP_NODES.map((node) => (
                    <div
                      key={node.id}
                      onClick={() => { setSelectedNode(node); setActiveTab('workspace'); }}
                      className="p-5 rounded-2xl border border-slate-800 bg-slate-900/20 hover:border-blue-500/40 transition cursor-pointer flex flex-col justify-between min-h-[170px]"
                    >
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400">{node.category}</span>
                        <h4 className="font-bold text-sm mt-1">{node.label}</h4>
                        <p className="text-[10px] text-slate-500 mt-1.5">{node.desc}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800">
                        <span className="text-[10px] font-bold text-blue-500">+{node.xp} XP</span>
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
                  <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen size={14} /> Mission Instructions
                  </h3>
                  <span className="text-xs font-bold text-blue-500">+{selectedNode.xp} XP</span>
                </div>
                <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
                  <h4 className="font-extrabold text-sm">{selectedNode.label}</h4>
                  <p className="text-slate-400 leading-relaxed">{selectedNode.desc}</p>
                  
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-1.5">
                    <strong className="text-[10px] uppercase font-bold text-blue-500 block">Task Details:</strong>
                    <p className="text-[10px] text-slate-350">Write standard HTML element tags, apply styles, and preview content inside the preview canvas.</p>
                  </div>
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className={`p-6 rounded-3xl border flex-1 flex flex-col justify-between ${isDark ? 'bg-slate-900/25 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-mono font-bold text-slate-400">index.html</span>
                      <button 
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer hover:opacity-95"
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
                <h3 className="font-extrabold text-sm mb-4">Frontend Debugging Arena</h3>
                <p className="text-xs text-slate-400 mb-6">Find and resolve layout style issues and syntax bugs.</p>
                
                <div className="p-4 bg-black rounded-xl border border-slate-900 font-mono text-red-400 text-[10px] leading-relaxed mb-4">
                  SyntaxError: Unexpected token '&lt;'<br />
                  &nbsp;&nbsp;at CSSStyleSheet.applyRules(styles.css:4)
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => toast.success('Correct! Unclosed selectors block document compiler runs. (+40 XP)')}
                    className="w-full p-4 rounded-xl border border-slate-800 bg-slate-900/20 text-left text-xs hover:border-blue-500/40 transition"
                  >
                    1. Fix: add closing bracket `}` to CSS selectors.
                  </button>
                  <button 
                    onClick={() => toast.error('Incorrect. Margin spacing changes display positioning but resolves no syntax checks.')}
                    className="w-full p-4 rounded-xl border border-slate-800 bg-slate-900/20 text-left text-xs hover:border-blue-500/40 transition"
                  >
                    2. Fix: adjust local margin values.
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'project' && (
            <motion.div key="project" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/25 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="font-extrabold text-sm mb-4">Portfolio Web Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Personal Portfolio Landing', desc: 'Create a responsive profile grid containing social blocks and work showcase cards using HTML & CSS.', xp: 200 },
                    { title: 'Interactive Calculator System', desc: 'Design a grid layout calculator carrying live digit operators click functions.', xp: 250 }
                  ].map((p, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-850 bg-slate-900/10 flex flex-col justify-between min-h-[150px]">
                      <div>
                        <h4 className="font-bold text-sm">{p.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1.5">{p.desc}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-[10px] font-bold text-blue-500">✨ {p.xp} XP Reward</span>
                        <button 
                          onClick={() => toast.success('Web project starter template loaded in workspace!')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-750 text-white rounded-lg text-[10px] font-bold cursor-pointer"
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
                    { id: 'html-master', label: 'HTML Master', icon: '🌐' },
                    { id: 'css-master', label: 'CSS Master', icon: '🎨' }
                  ].map(b => (
                    <div key={b.id} className="p-4 rounded-xl border border-blue-500/25 bg-blue-500/5 text-center">
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
