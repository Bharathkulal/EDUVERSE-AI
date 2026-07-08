import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, Zap, BookOpen, CheckCircle, Award, 
  HelpCircle, MessageSquare, Code2, Play, Sparkles, 
  ChevronRight, Bookmark, ThumbsUp, Send, Check, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { DSA_LESSONS } from './data/dsaLessons';
import useDsaStore from './store/useDsaStore';

// Simple Syntax Highlighting fallback
function MiniSyntaxHighlighter({ code, language }) {
  return (
    <pre className="p-4 rounded-xl font-mono text-xs overflow-x-auto bg-[#090D1A] text-slate-300 border border-white/5">
      <code>{code}</code>
    </pre>
  );
}

// Mini interactive simulator inside Theory page to blow the user's mind!
function MiniTheoryVisualizer({ slug }) {
  const [elements, setElements] = useState([10, 20, 30]);
  const [inputValue, setInputValue] = useState('40');
  const [activeIdx, setActiveIdx] = useState(-1);

  const handlePush = () => {
    const val = parseInt(inputValue) || 50;
    if (elements.length >= 6) {
      toast.error('Stack Overflow!');
      return;
    }
    setElements([...elements, val]);
    setActiveIdx(elements.length);
    setTimeout(() => setActiveIdx(-1), 1000);
  };

  const handlePop = () => {
    if (elements.length === 0) {
      toast.error('Stack Underflow!');
      return;
    }
    setActiveIdx(elements.length - 1);
    setTimeout(() => {
      setElements(elements.slice(0, -1));
      setActiveIdx(-1);
    }, 500);
  };

  if (slug === 'stack') {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col items-center gap-4">
        <span className="text-xs font-bold text-slate-400">STACK LIVE LIFO SIMULATION</span>
        <div className="flex flex-col-reverse gap-2 w-32 border-2 border-dashed border-red-500/30 p-2 rounded-lg bg-black/30 min-h-[160px]">
          {elements.map((el, i) => (
            <motion.div
              layout
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              key={i}
              className={`py-2 text-center text-xs font-black rounded-lg ${
                activeIdx === i ? 'bg-blue-600 text-white' : 'bg-white text-slate-800'
              }`}
            >
              {el}
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2">
          <input 
            type="number" 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            className="w-16 px-2 py-1 text-xs bg-slate-950 border border-white/10 rounded text-center text-white"
          />
          <button onClick={handlePush} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded transition">
            Push
          </button>
          <button onClick={handlePop} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-black text-xs rounded transition">
            Pop
          </button>
        </div>
      </div>
    );
  }

  // Simple array representation fallback
  return (
    <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col items-center gap-4">
      <span className="text-xs font-bold text-slate-400">MEMORIES CONTIGUOUS SCANNING</span>
      <div className="flex gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
        {elements.map((el, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="p-3 bg-white text-slate-900 text-xs font-bold rounded-lg border border-slate-300">
              {el}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">0x0{i*4}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DsaLessonPage() {
  const { lessonSlug } = useParams();
  const navigate = useNavigate();
  const { isDarkMode: isDark } = useTheme();

  const lesson = DSA_LESSONS.find(l => l.slug === lessonSlug);

  const isCompleted = useDsaStore(s => s.isCompleted(lessonSlug));
  const progress    = useDsaStore(s => s.getProgress(lessonSlug));
  const xpEarned    = useDsaStore(s => s.getTotalXP());
  
  const updateProgress = useDsaStore(s => s.updateProgress);
  const completeLesson = useDsaStore(s => s.completeLesson);
  const saveQuizScore  = useDsaStore(s => s.saveQuizScore);

  const [activeTab, setActiveTab] = useState('theory'); // 'theory', 'code', 'quiz', 'interview'
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const currentLessonIndex = DSA_LESSONS.findIndex(l => l.slug === lessonSlug);
  const nextLesson = DSA_LESSONS[currentLessonIndex + 1];
  const prevLesson = DSA_LESSONS[currentLessonIndex - 1];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (progress < 40) {
      updateProgress(lessonSlug, 40);
    }
  }, [lessonSlug, progress, updateProgress]);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <h2 className="text-xl font-bold text-white">Module Not Found</h2>
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white">
          Back
        </button>
      </div>
    );
  }

  const handleCopyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setIsCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleQuizSubmit = (opt) => {
    setSelectedOption(opt);
    setShowExplanation(true);
    const mcq = lesson.quiz.mcq[0];
    if (opt === mcq.correct) {
      toast.success('Correct answer! +20 XP');
      saveQuizScore(lessonSlug, 100, 20);
      updateProgress(lessonSlug, 100);
      completeLesson(lessonSlug, lesson.xp);
    } else {
      toast.error('Incorrect option, review explanation.');
      saveQuizScore(lessonSlug, 50, 0);
    }
  };

  const handleAskAI = (promptText) => {
    toast.loading('AI Assistant thinking...');
    setTimeout(() => {
      toast.dismiss();
      if (promptText.includes('Simply')) {
        setAiResponse(`Here is ${lesson.title} explained simply:\nImagine a stack of books. You can only put a book on top, and you can only take the top book off. This is a LIFO (Last-In First-Out) structure!`);
      } else if (promptText.includes('Kannada')) {
        setAiResponse(`ಇದು ${lesson.title} ವಿವರಣೆ:\nಇದು ಕೊನೆಯದಾಗಿ ಬಂದ ವಸ್ತು ಮೊದಲು ಹೊರಹೋಗುವ (LIFO) ವ್ಯವಸ್ಥೆಯಾಗಿದೆ.`);
      } else {
        setAiResponse(`Notes generated for ${lesson.title}:\n- Core Concept: LIFO vs FIFO representation.\n- Time Complexity: O(1) for standard edits.\n- Applications: Undo operations, search maps.`);
      }
    }, 800);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#050816] text-[#E2E8F0]' : 'bg-[#F8FAFC] text-[#1E293B]'} relative pb-32 font-sans transition-colors duration-300`}>
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-6 relative z-10 grid lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN: 3/4 MAIN CONTENT */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Header breadcrumbs */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/subjects/DSA', { state: { activeView: 'theory' } })} className={`p-2 rounded-full transition-all border ${
              isDark ? 'hover:bg-white/5 text-slate-400 border-white/5' : 'hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                DSA PATHWAY
              </span>
              <span className="text-sm font-black">{lesson.title}</span>
            </div>
          </div>

          {/* Hero segment */}
          <div className={`p-8 rounded-3xl border relative overflow-hidden ${
            isDark ? 'bg-[#0b1020]/75 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {lesson.difficulty}
                </span>
                <h1 className="text-3xl font-black mt-2">{lesson.title}</h1>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">{lesson.description}</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold bg-slate-900/20 border border-white/5 p-3 rounded-xl">
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-500" /> {lesson.duration}</div>
                <div className="flex items-center gap-1.5" style={{ color: lesson.accent }}><Zap className="w-4 h-4" /> {lesson.xp} XP</div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex border-b border-white/5 gap-4">
            {['theory', 'code', 'interview', 'quiz'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs font-black capitalize tracking-wider transition-all relative ${
                  activeTab === tab ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'theory' ? '📘 Concept Theory' : tab === 'code' ? '💻 Implementation' : tab === 'interview' ? '🤝 Interview Prep' : '🧠 Quiz Challenge'}
                {activeTab === tab && (
                  <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500" />
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENT PANEL */}
          <div className={`p-6 rounded-3xl border min-h-[400px] ${
            isDark ? 'bg-[#0b1020]/75 border-white/5' : 'bg-white border-slate-200'
          }`}>
            <AnimatePresence mode="wait">
              {activeTab === 'theory' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  
                  {/* Introduction */}
                  <div>
                    <h3 className="text-lg font-black mb-2 text-blue-400">1. Introduction</h3>
                    <p className="text-sm leading-relaxed text-slate-300">{lesson.theory}</p>
                  </div>

                  {/* Real-Life Analogy */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-1">
                      💡 Real-Life Analogy: {lesson.analogy?.concept}
                    </h4>
                    <p className="text-xs text-slate-350">{lesson.analogy?.description}</p>
                  </div>

                  {/* Interactive Visual Block */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">
                      🎬 Dynamic Animation Simulator
                    </h4>
                    <MiniTheoryVisualizer slug={lesson.slug} />
                  </div>

                  {/* Algorithm & Pseudocode */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider mb-2">
                        📋 Step-by-Step Algorithm
                      </h4>
                      <ul className="list-decimal list-inside text-xs space-y-2 text-slate-300">
                        {lesson.algorithm.map((step, idx) => <li key={idx}>{step}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider mb-2">
                        📝 Pseudocode Model
                      </h4>
                      <pre className="p-3 bg-black/40 border border-white/5 rounded-xl text-[10px] font-mono text-slate-300 overflow-x-auto">
                        {lesson.pseudocode}
                      </pre>
                    </div>
                  </div>

                  {/* Complexity Analysis */}
                  <div>
                    <h3 className="text-sm font-black mb-2 text-blue-400">Complexity Analysis</h3>
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-500">
                          <th className="py-2">Operation</th>
                          <th className="py-2">Best Case</th>
                          <th className="py-2">Average Case</th>
                          <th className="py-2">Worst Case</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/5">
                          <td className="py-2 font-bold">Access / Scan</td>
                          <td className="py-2 text-emerald-400">{lesson.complexity?.time?.best || 'O(1)'}</td>
                          <td className="py-2 text-amber-400">{lesson.complexity?.time?.average || 'O(N)'}</td>
                          <td className="py-2 text-red-400">{lesson.complexity?.time?.worst || 'O(N)'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </motion.div>
              )}

              {activeTab === 'code' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="flex gap-2">
                    {['c', 'cpp', 'java', 'python', 'csharp'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                          selectedLanguage === lang ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => handleCopyCode(lesson.codeImplementation[selectedLanguage])}
                      className="absolute right-4 top-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <MiniSyntaxHighlighter code={lesson.codeImplementation[selectedLanguage]} language={selectedLanguage} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'interview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <h3 className="text-sm font-black text-blue-400">Top Interview Questions</h3>
                  {lesson.interviewQuestions.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/30 border border-white/5 space-y-2">
                      <div className="flex items-start gap-2">
                        <HelpCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-white">{q.question}</span>
                      </div>
                      <div className="pl-7 text-xs text-slate-450 border-l border-white/5">
                        {q.answer}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'quiz' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  {lesson.quiz.mcq.map((mcq, idx) => (
                    <div key={mcq.id} className="space-y-4">
                      <h4 className="text-sm font-black text-white">{mcq.question}</h4>
                      <div className="grid gap-2">
                        {mcq.options.map(opt => {
                          const isSel = selectedOption === opt;
                          const isCorr = opt === mcq.correct;
                          return (
                            <button
                              key={opt}
                              onClick={() => handleQuizSubmit(opt)}
                              disabled={showExplanation}
                              className={`p-3 text-left text-xs font-semibold rounded-xl border transition-all ${
                                showExplanation
                                  ? isCorr
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                    : isSel
                                      ? 'bg-red-500/20 border-red-500 text-red-400'
                                      : 'bg-[#090D1A] border-white/5 text-slate-500'
                                  : isSel
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                    : 'bg-[#090D1A]/50 border-white/5 text-slate-300 hover:border-slate-500'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {showExplanation && (
                        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                          <span className="text-xs font-black text-blue-400 block mb-1">Explanation</span>
                          <p className="text-xs text-slate-350">{mcq.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI ASSISTANT PANEL */}
          <div className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-[#0b1020]/75 border-white/5' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-black text-white">DSA Interactive AI Assistant</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleAskAI('Explain Simply')} className="px-3 py-1.5 bg-purple-600/15 border border-purple-500/20 text-purple-400 text-xs font-black rounded-lg transition hover:bg-purple-600/30">
                Explain Simply
              </button>
              <button onClick={() => handleAskAI('Explain in Kannada')} className="px-3 py-1.5 bg-blue-600/15 border border-blue-500/20 text-blue-400 text-xs font-black rounded-lg transition hover:bg-blue-600/30">
                Explain in Kannada
              </button>
              <button onClick={() => handleAskAI('Generate Notes')} className="px-3 py-1.5 bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 text-xs font-black rounded-lg transition hover:bg-emerald-600/30">
                Generate Notes
              </button>
            </div>

            {aiResponse && (
              <div className="p-4 rounded-2xl bg-[#090D1A] border border-white/5 text-xs text-slate-300 font-mono whitespace-pre-wrap">
                {aiResponse}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: STICKY PROGRESS PANEL */}
        <div className="space-y-6">
          
          {/* Progress Card */}
          <div className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-[#0b1020]/75 border-white/5' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Course Progress
            </h3>
            
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">XP EARNED</span>
              <span className="text-xl font-black text-blue-500">{xpEarned} XP</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block">TOPIC COMPLETIONS</span>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] text-emerald-400 font-bold block">{progress}% Complete</span>
            </div>
            
            <button
              onClick={() => {
                // Navigate directly to the corresponding interactive lab!
                if (['stack', 'queue', 'linked-list', 'tree', 'graph'].includes(lesson.slug)) {
                  navigate(`/dsa/${lesson.slug}`);
                } else {
                  navigate(`/dsa/stack`);
                }
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25"
            >
              <Play className="w-4 h-4 fill-slate-950" /> Go to Practical Lab
            </button>
          </div>

        </div>

      </div>

      {/* BOTTOM NAVIGATION SECTION */}
      <footer className={`fixed bottom-0 left-0 right-0 h-16 border-t backdrop-blur-xl z-30 flex items-center justify-between px-8 ${
        isDark ? 'bg-[#050816]/90 border-white/5' : 'bg-white/95 border-slate-200'
      }`}>
        <div className="flex gap-4">
          {prevLesson && (
            <button
              onClick={() => navigate(`/dsa/course/${prevLesson.slug}`)}
              className="text-xs font-bold text-slate-400 hover:text-slate-200 transition"
            >
              ← Previous: {prevLesson.title}
            </button>
          )}
        </div>
        <div className="flex gap-4">
          {nextLesson && (
            <button
              onClick={() => navigate(`/dsa/course/${nextLesson.slug}`)}
              className="text-xs font-bold text-blue-500 hover:text-blue-400 transition"
            >
              Next: {nextLesson.title} →
            </button>
          )}
        </div>
      </footer>

    </div>
  );
}
