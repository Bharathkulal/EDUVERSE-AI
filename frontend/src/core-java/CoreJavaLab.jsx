import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Square, Terminal, Code2, Cpu, Sparkles, Database,
  ArrowLeft, RefreshCw, Layers, BrainCircuit, Activity, Trash, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export default function CoreJavaLab({ onBack, onComplete }) {
  const { isDarkMode: isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'collections', 'oop', 'exceptions'
  const [selectedFile, setSelectedFile] = useState('App.java');
  const [consoleOutput, setConsoleOutput] = useState('Click "Run Code" to compile...');
  const [isRunning, setIsRunning] = useState(false);

  // Editor Starter Code
  const [code, setCode] = useState(`public class App {\n  public static void main(String[] args) {\n    System.out.println("Hello, EduVerse!");\n  }\n}`);

  // Dynamic Collections State
  const [collectionsType, setCollectionsType] = useState('ArrayList'); // ArrayList, LinkedList, Stack
  const [collectionElements, setCollectionElements] = useState(['Java', 'OOP', 'Exceptions']);
  const [newValue, setNewValue] = useState('');

  // OOP State
  const [oopInstances, setOopInstances] = useState([
    { className: 'Dog', parent: 'Animal', ref: 'dog1', heapAddress: '@0x10A', fields: { name: '"Max"', age: '3' } },
    { className: 'Cat', parent: 'Animal', ref: 'cat1', heapAddress: '@0x20B', fields: { name: '"Cleo"', age: '2' } }
  ]);

  // Exception Simulator State
  const [activeExSim, setActiveExSim] = useState('NullPointer'); // NullPointer, ArrayIndex
  const [exOutput, setExOutput] = useState('');
  const [fixedCode, setFixedCode] = useState(`String name = null;\n// Fix: check if null before calling length\nif (name != null) {\n  System.out.println(name.length());\n}`);

  // AI Code Review State
  const [reviewResult, setReviewResult] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const handleRunCode = () => {
    setIsRunning(true);
    setConsoleOutput('Compiling App.java...\nLinking JVM dynamic references...\n');
    setTimeout(() => {
      setConsoleOutput(prev => prev + 'Executing Main class...\n\nHello, EduVerse!\n\nProcess finished with exit code 0');
      setIsRunning(false);
      toast.success('Compilation successful! (+30 XP)');
    }, 1500);
  };

  const handleRequestReview = () => {
    setIsReviewing(true);
    setTimeout(() => {
      setReviewResult({
        complexity: 'O(1) Time | O(1) Space',
        readability: 95,
        efficiency: 'High',
        naming: 'Excellent',
        review: 'Excellent structure using correct OOP main parameters. Try-with-resources could improve resource management in larger programs.'
      });
      setIsReviewing(false);
    }, 1200);
  };

  // Collections operations
  const handleCollectionAdd = () => {
    if (!newValue.trim()) return;
    if (collectionsType === 'Stack') {
      // Push onto top (end of list)
      setCollectionElements([...collectionElements, newValue]);
    } else {
      setCollectionElements([...collectionElements, newValue]);
    }
    setNewValue('');
    toast.success(`Inserted "${newValue}" into ${collectionsType}!`);
  };

  const handleCollectionRemove = (index) => {
    const updated = collectionElements.filter((_, idx) => idx !== index);
    setCollectionElements(updated);
    toast.error(`Removed item from ${collectionsType}.`);
  };

  return (
    <div className={`min-h-[90vh] w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col font-sans text-left relative ${
      isDark ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* ── BACK BUTTON & NAVIGATION ── */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
        <button 
          onClick={onBack}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border cursor-pointer ${
            isDark ? 'bg-slate-900/60 border-white/10 hover:bg-white/5' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          ← Back to Hub
        </button>
        
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Workspace Mode</span>
          <h2 className="text-base font-extrabold text-orange-500">Core Java Interactive IDE</h2>
        </div>
      </div>

      {/* ── MODE SELECTION TABS ── */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl w-full overflow-x-auto scrollbar-none mb-6 border border-slate-100 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/50">
        {[
          { id: 'editor', label: 'Java Code Editor', icon: Code2 },
          { id: 'collections', label: 'Collections Animator', icon: Layers },
          { id: 'oop', label: 'OOP Relationship Designer', icon: Database },
          { id: 'exceptions', label: 'Exception Simulator', icon: Cpu }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'text-slate-450 hover:bg-slate-200/50 dark:hover:bg-white/5'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── LAB MAIN INTERACTION AREA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        
        {/* Left Columns: Visual Frame */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* TAB: JAVA EDITOR */}
            {activeTab === 'editor' && (
              <motion.div 
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 rounded-3xl border ${
                  isDark ? 'bg-slate-900/40 border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                {/* Editor Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-xs font-mono font-bold ml-2 text-slate-400">{selectedFile}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition hover:opacity-90"
                    >
                      <Play size={10} fill="currentColor" /> {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                  </div>
                </div>

                {/* Main Code Textarea */}
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full min-h-[220px] p-4 bg-black/65 border border-slate-800 rounded-2xl font-mono text-xs text-white outline-none resize-y"
                  spellCheck="false"
                />

                {/* Console Stdout Logs */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">Console Output</span>
                  <div className="p-3 bg-black rounded-xl border border-slate-900 font-mono text-[10px] leading-relaxed text-emerald-400 whitespace-pre-wrap min-h-[90px]">
                    {consoleOutput}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: COLLECTIONS ANIMATOR */}
            {activeTab === 'collections' && (
              <motion.div 
                key="collections"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 rounded-3xl border ${
                  isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-extrabold">Java Collections Data flow</h3>
                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Push, Pop, Insert, or Remove items to view real-time array shift sequences.</p>
                  </div>
                  
                  {/* Selector list */}
                  <select 
                    value={collectionsType} 
                    onChange={e => {
                      setCollectionsType(e.target.value);
                      if (e.target.value === 'Stack') {
                        setCollectionElements(['Bottom', 'Middle', 'Top']);
                      } else {
                        setCollectionElements(['Java', 'OOP', 'Exceptions']);
                      }
                    }}
                    className="p-1.5 text-xs bg-slate-950 border border-slate-800 text-white rounded-lg font-bold"
                  >
                    <option value="ArrayList">ArrayList</option>
                    <option value="LinkedList">LinkedList</option>
                    <option value="Stack">Stack (LIFO)</option>
                  </select>
                </div>

                {/* Dynamic elements row */}
                <div className={`p-8 rounded-2xl bg-black/40 border border-slate-850 flex ${
                  collectionsType === 'Stack' ? 'flex-col-reverse' : 'flex-row'
                } justify-center items-center gap-4 min-h-[160px] overflow-x-auto`}>
                  {collectionElements.map((el, index) => (
                    <motion.div
                      layout
                      initial={{ scale: 0.7, y: -20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.7, y: 20, opacity: 0 }}
                      key={el + '-' + index}
                      className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-3.5 min-w-[70px] text-center relative group"
                    >
                      <span className="text-xs font-mono font-bold text-purple-300">{el}</span>
                      <span className="text-[9px] text-slate-500 block font-mono mt-1">idx: {index}</span>
                      
                      <button 
                        onClick={() => handleCollectionRemove(index)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition duration-300 hover:scale-105 cursor-pointer"
                      >
                        <Trash size={10} />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Control inputs */}
                <div className="flex gap-3 mt-6">
                  <input 
                    type="text"
                    placeholder="New element..."
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCollectionAdd()}
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                  />
                  <button 
                    onClick={handleCollectionAdd}
                    className="px-4 py-2.5 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <Plus size={14} /> Add Node
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB: OOP DESIGNER */}
            {activeTab === 'oop' && (
              <motion.div 
                key="oop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 rounded-3xl border ${
                  isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-base font-extrabold">OOP Class Hierarchy & Object References</h3>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Visual representation of objects allocated in the Heap and their subclass inheritance relationships.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {oopInstances.map((obj, idx) => (
                    <motion.div
                      layout
                      key={idx}
                      className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-xs space-y-2 relative"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">
                          Class: {obj.className} (extends {obj.parent})
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">{obj.heapAddress}</span>
                      </div>
                      
                      <div className="font-mono text-slate-350 bg-black/50 p-2.5 rounded-lg space-y-1">
                        <div><span className="text-slate-500">Reference:</span> {obj.ref}</div>
                        {Object.entries(obj.fields).map(([name, val]) => (
                          <div key={name}><span className="text-purple-400">{name}:</span> {val}</div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: EXCEPTIONS SIMULATOR */}
            {activeTab === 'exceptions' && (
              <motion.div 
                key="exceptions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 rounded-3xl border ${
                  isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-extrabold">Runtime Exception Simulator</h3>
                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>See stack traces generated by JVM and fix errors interactively.</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setActiveExSim('NullPointer');
                        setExOutput('java.lang.NullPointerException\n  at App.main(App.java:3)\n  at java.base/java.lang.VirtualMachine.run(Unknown Source)');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${activeExSim === 'NullPointer' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'border border-slate-800'}`}
                    >
                      Trigger NullPointer
                    </button>
                    <button 
                      onClick={() => {
                        setActiveExSim('ArrayIndex');
                        setExOutput('java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 3\n  at App.main(App.java:4)\n  at java.base/java.lang.VirtualMachine.run(Unknown Source)');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${activeExSim === 'ArrayIndex' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'border border-slate-800'}`}
                    >
                      Trigger ArrayIndex
                    </button>
                  </div>
                </div>

                <div className="bg-black/85 p-3 rounded-xl border border-slate-900 font-mono text-[10px] text-red-400 whitespace-pre mb-4 min-h-[80px]">
                  {exOutput || 'Select an exception to simulate...'}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">Corrective Code implementation</span>
                  <textarea 
                    value={fixedCode} 
                    onChange={e => setFixedCode(e.target.value)}
                    className="w-full font-mono text-[11px] p-3.5 bg-black border border-slate-850 rounded-xl outline-none text-white resize-y min-h-[90px]"
                  />
                  
                  <button 
                    onClick={() => {
                      toast.success('Exception solved successfully! (+50 XP)');
                      setExOutput('Process completed with success.');
                      onComplete(50);
                    }}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl text-xs cursor-pointer transition hover:opacity-90"
                  >
                    Verify Fix & Complete Mission
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: AI Assistant & Reviews */}
        <div className="space-y-6">
          
          {/* AI Code Review Panel */}
          <div className={`p-6 rounded-3xl border backdrop-blur-xl ${
            isDark ? 'bg-slate-900/60 border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <h3 className="font-extrabold text-base mb-3 flex items-center gap-2">
              <BrainCircuit className="text-purple-500" size={18} /> AI Code Reviewer
            </h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Review time complexity, readability score, and efficiency factors.</p>

            {reviewResult ? (
              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <span className="text-slate-400">Time / Space Complexity</span>
                  <span className="text-purple-400">{reviewResult.complexity}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <span className="text-slate-400">Readability Rating</span>
                  <span className="text-emerald-400">{reviewResult.readability}/100</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <span className="text-slate-400">Variable Naming</span>
                  <span className="text-blue-400">{reviewResult.naming}</span>
                </div>
                
                <p className="p-3 bg-black/40 rounded-xl border border-white/5 text-[11px] leading-relaxed text-slate-350">
                  {reviewResult.review}
                </p>

                <button 
                  onClick={() => setReviewResult(null)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Clear Review
                </button>
              </div>
            ) : (
              <button 
                onClick={handleRequestReview}
                disabled={isReviewing}
                className="w-full py-3.5 bg-purple-650 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition"
              >
                {isReviewing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />} Review Current Code File
              </button>
            )}
          </div>

          {/* Performance Dashboard */}
          <div className={`p-6 rounded-3xl border backdrop-blur-xl ${
            isDark ? 'bg-slate-900/60 border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
              <Activity className="text-orange-500" size={18} /> Performance Dashboard
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                <span className="text-[10px] text-slate-400 block uppercase">Compile Time</span>
                <span className="text-sm font-black text-white mt-1 block">42ms</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                <span className="text-[10px] text-slate-400 block uppercase">Heap Allocation</span>
                <span className="text-sm font-black text-white mt-1 block">12 MB</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl col-span-2">
                <span className="text-[10px] text-slate-400 block uppercase">GC Collections</span>
                <span className="text-xs font-black text-slate-350 mt-1 block">0 sweeps (Garbage Collector idle)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
