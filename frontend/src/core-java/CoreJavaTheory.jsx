import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, VolumeX, Play, Pause, ArrowLeft, ArrowRight, Sparkles,
  BookOpen, Code2, HelpCircle, AlertTriangle, Lightbulb, CheckCircle2,
  ChevronRight, Award, Flame, RefreshCw, Cpu, BrainCircuit
} from 'lucide-react';
import { useVoiceAssistant } from '../context/VoiceContext';
import { useTheme } from '../context/ThemeContext';

export default function CoreJavaTheory({ lesson, onBack, onComplete }) {
  const { isDarkMode: isDark } = useTheme();
  const { speak, stopSpeech, activeState, subtitle, settings, updateSettings } = useVoiceAssistant();

  const [activeTab, setActiveTab] = useState('slides'); // 'slides', 'breakdown', 'memory', 'quiz', 'flash', 'revision'
  const [slideIndex, setSlideIndex] = useState(0);
  const [hoveredToken, setHoveredToken] = useState(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [aiAnswers, setAiAnswers] = useState([]);
  const [selectedQuizAns, setSelectedQuizAns] = useState(null);
  const [showQuizExplanation, setShowQuizExplanation] = useState(false);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [revisionMode, setRevisionMode] = useState('short'); // 'short', 'long'

  // Trigger voice assistant read on slide change
  useEffect(() => {
    if (activeTab === 'slides' && lesson.script[slideIndex]) {
      speak(lesson.script[slideIndex].text);
    } else {
      stopSpeech();
    }
    return () => stopSpeech();
  }, [slideIndex, activeTab, lesson]);

  const handleNextSlide = () => {
    if (slideIndex < lesson.script.length - 1) {
      setSlideIndex(prev => prev + 1);
    } else {
      setActiveTab('breakdown');
    }
  };

  const handlePrevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(prev => prev - 1);
    }
  };

  const handleAskAI = (prompt) => {
    let response = "";
    const lower = prompt.toLowerCase();
    if (lower.includes('again') || lower.includes('repeat')) {
      response = `Sure! Let's review: ${lesson.script[slideIndex]?.text || 'the current concepts'}.`;
    } else if (lower.includes('simple') || lower.includes('10')) {
      response = `Imagine a variable is like a labelled cardboard box. You write a label on it (type) and place a toy inside (value). You can open it or swap toys later!`;
    } else if (lower.includes('kannada') || lower.includes('language')) {
      response = `ಕನ್ನಡ ವಿವರಣೆ: ಈ ವಿಷಯವು ಪ್ರೋಗ್ರಾಮಿಂಗ್‌ನ ಮೂಲ ತತ್ವಗಳನ್ನು ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.`;
    } else if (lower.includes('interview')) {
      response = `Interviewer might ask: "Explain the stack vs heap memory difference in Java." Remember: primitives and refs live on stack, objects live on heap!`;
    } else {
      response = `Interesting question! In Java, this behaves according to JVM standards, allocating reference variables dynamically in active stack frames.`;
    }
    setAiAnswers(prev => [...prev, { q: prompt, a: response }]);
    setUserQuestion('');
    speak(response);
  };

  return (
    <div className={`min-h-[90vh] w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col font-sans text-left relative ${
      isDark ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* ── BACK BUTTON & NAV ── */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
        <button 
          onClick={() => { stopSpeech(); onBack(); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border cursor-pointer ${
            isDark ? 'bg-slate-900/60 border-white/10 hover:bg-white/5' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          ← Back to Hub
        </button>
        
        {/* Module Header Title */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Lesson</span>
          <h2 className="text-base font-extrabold text-purple-500">{lesson.title}</h2>
        </div>
      </div>

      {/* ── MODE TABS ── */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl w-full overflow-x-auto scrollbar-none mb-6 border border-slate-100 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/50">
        {[
          { id: 'slides', label: 'Interactive Slides', icon: BookOpen },
          { id: 'breakdown', label: 'Code Breakdown', icon: Code2 },
          { id: 'memory', label: 'Memory Visualizer', icon: Cpu },
          { id: 'quiz', label: 'Interactive Quiz', icon: HelpCircle },
          { id: 'flash', label: 'Flashcards', icon: Sparkles },
          { id: 'revision', label: 'Revision Notes', icon: RefreshCw }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { stopSpeech(); setActiveTab(tab.id); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-purple-650 text-white shadow-md' 
                : 'text-slate-450 hover:bg-slate-200/50 dark:hover:bg-white/5'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── THEORY BODY & LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        
        {/* Left Column: Interactive Display Frame */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {/* TAB: SLIDES */}
            {activeTab === 'slides' && (
              <motion.div 
                key="slides"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between min-h-[360px] ${
                  isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-2.5 py-0.5">
                      Slide {slideIndex + 1} of {lesson.script.length}
                    </span>
                    
                    {/* Speak status indicator */}
                    {activeState === 'speaking' && (
                      <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold animate-pulse">
                        <Volume2 size={12} /> Speaking
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black mb-4">
                    {lesson.topics[slideIndex] || 'Conceptual Core'}
                  </h3>
                  <p className={`text-base leading-relaxed ${isDark ? 'text-slate-350' : 'text-slate-700'}`}>
                    {lesson.script[slideIndex]?.text}
                  </p>

                  {/* Real World Comparison */}
                  {lesson.realWorldExamples[slideIndex] && (
                    <div className="mt-6 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/15 flex gap-3">
                      <Lightbulb className="text-orange-500 shrink-0" size={18} />
                      <div>
                        <span className="text-[10px] font-bold text-orange-500 block uppercase">Real-World Case ({lesson.realWorldExamples[slideIndex].area})</span>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-450' : 'text-slate-600'}`}>{lesson.realWorldExamples[slideIndex].desc}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                  <button 
                    onClick={handlePrevSlide}
                    disabled={slideIndex === 0}
                    className="px-4 py-2 border rounded-xl text-xs font-bold transition disabled:opacity-30 cursor-pointer"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={handleNextSlide}
                    className="px-5 py-2 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    {slideIndex === lesson.script.length - 1 ? 'Go to Code Breakdown' : 'Next'} <ChevronRight size={13} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB: CODE BREAKDOWN */}
            {activeTab === 'breakdown' && (
              <motion.div 
                key="breakdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 sm:p-8 rounded-3xl border ${
                  isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-extrabold">Java Code Breakdown</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-450' : 'text-slate-600'}`}>Hover over tokens in the code frame to view compile characteristics.</p>
                </div>

                {/* Interactive Token Snippet */}
                <div className="p-5 rounded-2xl bg-black/60 border border-slate-800 font-mono text-sm leading-relaxed overflow-x-auto text-white">
                  {lesson.codeBreakdown.code.split('\n').map((line, idx) => (
                    <div key={idx} className="whitespace-pre">
                      {line.split(/(\s+|,|\(|\)|"|;)/).map((word, wordIdx) => {
                        const cleanWord = word.trim();
                        const tokenMatch = lesson.codeBreakdown.tokens.find(t => t.word === cleanWord);
                        if (tokenMatch) {
                          return (
                            <span 
                              key={wordIdx}
                              onMouseEnter={() => setHoveredToken(tokenMatch)}
                              className="text-orange-400 font-bold border-b border-orange-500/20 hover:bg-orange-500/20 px-1 py-0.5 rounded cursor-help transition"
                            >
                              {word}
                            </span>
                          );
                        }
                        return <span key={wordIdx}>{word}</span>;
                      })}
                    </div>
                  ))}
                </div>

                {/* Token explanation panel */}
                <div className="mt-6 min-h-[90px] p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                  {hoveredToken ? (
                    <div>
                      <span className="text-[10px] font-black uppercase text-purple-400 block">{hoveredToken.type}</span>
                      <strong className="text-sm font-extrabold text-white block mt-0.5">{hoveredToken.word}</strong>
                      <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{hoveredToken.meaning}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 h-full py-4"><InfoIcon size={14} /> Hover over highlighted source keywords to trace compiling attributes.</span>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: MEMORY VISUALIZER */}
            {activeTab === 'memory' && (
              <motion.div 
                key="memory"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 sm:p-8 rounded-3xl border ${
                  isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-extrabold">JVM Memory Execution Simulator</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-450' : 'text-slate-600'}`}>See how variables are pushed onto the execution Stack and allocated in the Heap.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 my-6">
                  {/* Stack */}
                  <div className="p-4 rounded-2xl bg-black/35 border border-slate-800">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-3">Call Stack Frame</h4>
                    <div className="flex flex-col-reverse gap-2 h-44 overflow-y-auto">
                      {lesson.memorySteps[slideIndex % lesson.memorySteps.length].stack.map((item, i) => (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={i} 
                          className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-2.5 text-xs text-blue-300 font-mono text-center font-bold"
                        >
                          {item}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Heap */}
                  <div className="p-4 rounded-2xl bg-black/35 border border-slate-800">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-3">Heap Dynamic Memory</h4>
                    <div className="flex flex-col gap-2 h-44 overflow-y-auto">
                      {lesson.memorySteps[slideIndex % lesson.memorySteps.length].heap.length > 0 ? (
                        lesson.memorySteps[slideIndex % lesson.memorySteps.length].heap.map((item, i) => (
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            key={i} 
                            className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-2.5 text-xs text-purple-300 font-mono text-center font-bold"
                          >
                            {item}
                          </motion.div>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 block text-center py-10 font-bold">No Heap Object Instantiated</span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs p-3.5 rounded-xl bg-slate-900/80 border border-white/5 leading-relaxed text-slate-350">
                  <strong>{lesson.memorySteps[slideIndex % lesson.memorySteps.length].title}:</strong> {lesson.memorySteps[slideIndex % lesson.memorySteps.length].desc}
                </p>
              </motion.div>
            )}

            {/* TAB: QUIZ */}
            {activeTab === 'quiz' && (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 sm:p-8 rounded-3xl border ${
                  isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div className="mb-6">
                  <span className="text-[9px] font-black uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-2.5 py-0.5 mb-2 inline-block">Chapter Quiz</span>
                  <h3 className="text-lg font-black">{lesson.quiz.mcq[0].question}</h3>
                </div>

                <div className="space-y-3">
                  {lesson.quiz.mcq[0].options.map((opt) => {
                    const isSelected = selectedQuizAns === opt;
                    const isCorrect = opt === lesson.quiz.mcq[0].correct;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          setSelectedQuizAns(opt);
                          setShowQuizExplanation(true);
                        }}
                        className={`w-full p-4 rounded-2xl border text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                          showQuizExplanation
                            ? isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : isSelected
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : 'bg-transparent border-slate-800 text-slate-400'
                            : isSelected
                              ? 'bg-purple-500/15 border-purple-500 text-purple-400'
                              : 'bg-transparent border-slate-800 hover:bg-slate-800/20'
                        }`}
                      >
                        <span>{opt}</span>
                        {showQuizExplanation && isCorrect && <CheckCircle2 size={16} className="text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>

                {showQuizExplanation && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-xs"
                  >
                    <strong className="text-purple-400 block mb-1">🤖 AI Tutor Explanation</strong>
                    <p className={isDark ? 'text-slate-350' : 'text-slate-700'}>{lesson.quiz.mcq[0].explanation}</p>
                    <button 
                      onClick={() => {
                        stopSpeech();
                        onComplete();
                      }}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-bold rounded-xl text-[10px] cursor-pointer"
                    >
                      Complete & Get +{lesson.xp} XP
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* TAB: FLASHCARDS */}
            {activeTab === 'flash' && (
              <motion.div 
                key="flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`min-h-[220px] rounded-3xl border p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ${
                    isFlipped 
                      ? 'bg-purple-650 text-white border-purple-500/40 shadow-xl shadow-purple-950/20' 
                      : isDark ? 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60' : 'bg-white border-slate-200 shadow-md hover:shadow-lg'
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-4">{isFlipped ? 'Answer' : 'Question'}</span>
                  <h3 className="text-xl font-bold text-center max-w-md">
                    {isFlipped ? lesson.flashcards[flashcardIdx].a : lesson.flashcards[flashcardIdx].q}
                  </h3>
                  <span className="text-[10px] text-slate-400 mt-6 block">Click to flip card</span>
                </div>

                <div className="flex justify-between items-center max-w-xs mx-auto">
                  <button 
                    onClick={() => {
                      setIsFlipped(false);
                      setFlashcardIdx(prev => (prev > 0 ? prev - 1 : lesson.flashcards.length - 1));
                    }}
                    className="p-2 border rounded-xl hover:bg-white/5 transition"
                  >
                    ←
                  </button>
                  <span className="text-xs font-bold">{flashcardIdx + 1} / {lesson.flashcards.length}</span>
                  <button 
                    onClick={() => {
                      setIsFlipped(false);
                      setFlashcardIdx(prev => (prev < lesson.flashcards.length - 1 ? prev + 1 : 0));
                    }}
                    className="p-2 border rounded-xl hover:bg-white/5 transition"
                  >
                    →
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB: REVISION */}
            {activeTab === 'revision' && (
              <motion.div 
                key="revision"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 sm:p-8 rounded-3xl border ${
                  isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-extrabold">Instant Revision Mode</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setRevisionMode('short')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${revisionMode === 'short' ? 'bg-purple-600 text-white' : 'border border-slate-800'}`}
                    >
                      30s Summary
                    </button>
                    <button 
                      onClick={() => setRevisionMode('long')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${revisionMode === 'long' ? 'bg-purple-600 text-white' : 'border border-slate-800'}`}
                    >
                      5m Detailed
                    </button>
                  </div>
                </div>

                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {revisionMode === 'short' ? lesson.revision.short : lesson.revision.long}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Common Mistakes */}
          <div className={`p-6 rounded-3xl border ${
            isDark ? 'bg-slate-900/20 border-white/5' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="text-sm font-extrabold mb-4 flex items-center gap-1.5 text-red-400">
              <AlertTriangle size={16} /> Common Developer Mistakes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                <span className="text-[10px] text-red-500 font-bold block mb-1">❌ INCORRECT</span>
                <code className="text-red-300">{lesson.commonMistakes[0].wrong}</code>
              </div>
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <span className="text-[10px] text-emerald-500 font-bold block mb-1">✅ CORRECT</span>
                <code className="text-emerald-300">{lesson.commonMistakes[0].correct}</code>
              </div>
            </div>
            <p className={`text-xs mt-3 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>
              {lesson.commonMistakes[0].explanation}
            </p>
          </div>
        </div>

        {/* Right Column: AI Ask Me Anything & Subtitles */}
        <div className="space-y-6">
          {/* Subtitles Overlay Frame */}
          {subtitle && (
            <div className="p-4 rounded-2xl bg-purple-650/15 border border-purple-500/30 backdrop-blur-md">
              <span className="text-[9px] font-black uppercase text-purple-400 block mb-1">AI Teacher Narration (English/Kannada)</span>
              <p className="text-xs leading-relaxed text-slate-350">{subtitle}</p>
            </div>
          )}

          {/* AI Doubt solver */}
          <div className={`p-6 rounded-3xl border backdrop-blur-xl ${
            isDark ? 'bg-slate-900/60 border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <h3 className="font-extrabold text-base mb-3 flex items-center gap-2">
              <BrainCircuit className="text-purple-500" size={18} /> AI Doubt Assistant
            </h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ask the teacher details, request analogies, or explain code tokens.</p>

            <div className="space-y-3 max-h-56 overflow-y-auto mb-4 scrollbar-none">
              {aiAnswers.map((chat, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="text-right">
                    <span className="bg-slate-800 text-slate-100 px-3 py-1.5 rounded-2xl inline-block">{chat.q}</span>
                  </div>
                  <div>
                    <span className="bg-purple-600/20 text-purple-300 px-3 py-1.5 rounded-2xl inline-block border border-purple-500/10">{chat.a}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Ask doubt..."
                value={userQuestion}
                onChange={e => setUserQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskAI(userQuestion)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-xs bg-slate-900/50 border-slate-800 text-white outline-none"
              />
              <button 
                onClick={() => handleAskAI(userQuestion)}
                className="px-4 py-2.5 bg-purple-650 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Ask
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-800">
              {['Explain Simpler', 'Explain in Kannada', 'Analogy please'].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleAskAI(prompt)}
                  className="px-2.5 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold text-slate-400 hover:text-white transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
}
