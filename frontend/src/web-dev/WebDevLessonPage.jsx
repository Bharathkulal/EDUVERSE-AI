import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Zap, BookOpen, CheckCircle, Award, BarChart2,
  HelpCircle, MessageSquare, RefreshCw, Code2, Play, Sparkles, StickyNote,
  Volume2, ShieldAlert, Cpu, Database, ChevronRight, CornerDownRight,
  Sun, Moon
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useTheme } from '../context/ThemeContext';
import { WEB_DEV_LESSONS } from './data/webDevLessons';
import useWebDevStore from './store/useWebDevStore';
import SmartTVPlayer from '../advanced-java/components/SmartTVPlayer';
import AIAvatar from '../advanced-java/components/AIAvatar';
import AITeacher from '../advanced-java/components/AITeacher';
import JavaCodeEditor from '../advanced-java/components/JavaCodeEditor';
import QuizEngine from '../advanced-java/components/QuizEngine';
import AIChatSidebar from '../advanced-java/components/AIChatSidebar';

const DIFFICULTY_COLORS = {
  Beginner:     { bg: 'from-emerald-500/10 to-emerald-500/5', text: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/20' },
  Intermediate: { bg: 'from-amber-500/10 to-amber-500/5',   text: 'text-amber-600 dark:text-amber-400',   border: 'border-amber-500/20'   },
  Advanced:     { bg: 'from-red-500/10 to-red-500/5',      text: 'text-red-500 dark:text-red-400',     border: 'border-red-500/20'     },
};

const NAV_TABS = [
  { id: 'learn',        label: '🎬 Learn',        icon: BookOpen },
  { id: 'practice',     label: '💻 Practice',     icon: CheckCircle },
  { id: 'quiz',         label: '🧠 Quiz',         icon: Award }
];

export default function WebDevLessonPage() {
  const { lessonSlug } = useParams();
  const navigate       = useNavigate();

  const lesson = WEB_DEV_LESSONS.find(l => l.slug === lessonSlug);

  const isCompleted   = useWebDevStore(s => s.isCompleted(lessonSlug));
  const progress      = useWebDevStore(s => s.getProgress(lessonSlug));
  const bookmark      = useWebDevStore(s => s.getBookmark(lessonSlug));
  const updateProgress= useWebDevStore(s => s.updateProgress);
  const saveBookmark  = useWebDevStore(s => s.saveBookmark);
  const completeLesson= useWebDevStore(s => s.completeLesson);
  const localNotes    = useWebDevStore(s => s.getNotes(lessonSlug));
  const saveNotes     = useWebDevStore(s => s.saveNotes);
  const xpEarned      = useWebDevStore(s => s.xpEarned);

  const [currentStep, setCurrentStep] = useState(bookmark || 0);
  const [isTalking,   setIsTalking]   = useState(false);
  const [avatarEmotion, setAvatarEmotion] = useState('idle');
  const [activeTab, setActiveTab]       = useState('learn');
  const [notesText, setNotesText]       = useState(localNotes || '');
  
  const { isDarkMode, toggleTheme } = useTheme();

  const script     = lesson?.script || [];
  const totalSteps = script.length;
  const accentColor= lesson?.accent || '#3B82F6';
  const dc         = DIFFICULTY_COLORS[lesson?.difficulty] || DIFFICULTY_COLORS.Intermediate;

  useEffect(() => {
    saveNotes(lessonSlug, notesText);
  }, [notesText, lessonSlug, saveNotes]);

  const handleStepChange = useCallback((step) => {
    setCurrentStep(step);
    saveBookmark(lessonSlug, step);

    const pct = Math.round(((step + 1) / totalSteps) * 100);
    updateProgress(lessonSlug, pct);

    const s = script[step] || {};
    if (s.type === 'congrats' || s.type === 'summary') setAvatarEmotion('congrats');
    else if (s.type === 'code') setAvatarEmotion('point');
    else if (step === 0) setAvatarEmotion('wave');
    else setAvatarEmotion('idle');

    if (step === totalSteps - 1 && !isCompleted) {
      setTimeout(() => {
        completeLesson(lessonSlug, lesson.xp);
        toast.success(`🎉 Module Complete! +${lesson.xp} XP earned!`, {
          icon: '🏆',
          style: {
            background: isDarkMode ? '#0B1020' : '#FFFFFF',
            color: isDarkMode ? '#FFFFFF' : '#0F172A',
            border: '1px solid rgba(0,0,0,0.06)',
          }
        });
      }, 1500);
    }
  }, [totalSteps, lessonSlug, saveBookmark, updateProgress, script, completeLesson, lesson?.xp, isCompleted, isDarkMode]);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert size={48} className="text-red-500" />
        <h2 className="text-xl font-bold">Lesson Not Found</h2>
        <button onClick={() => navigate('/subjects')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  // Create mock lesson with code starter for Web Dev
  const webLesson = {
    ...lesson,
    starterCode: lesson.slug === 'html-basics' 
      ? `<!DOCTYPE html>\n<html>\n<head>\n  <title>HTML Studio</title>\n</head>\n<body>\n  <h1>My Webpage</h1>\n</body>\n</html>`
      : lesson.slug === 'css-styling'
      ? `body {\n  background: #f0f4f8;\n  color: #333;\n  font-family: sans-serif;\n}`
      : `console.log("Hello JS Core!");`
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#050814] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-350' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650 shadow-sm'}`}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-650'}`}>
                  Web Dev Academy
                </span>
                <span className="text-slate-400">•</span>
                <span className={`text-[10px] font-bold uppercase ${dc.text}`}>{lesson.difficulty}</span>
              </div>
              <h1 className="text-2xl font-black">{lesson.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <Zap size={14} className="text-amber-500" />
              <span className="text-xs font-bold">{xpEarned} XP Total</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-yellow-400' : 'bg-white border-slate-200 text-indigo-650'}`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/20 border-slate-800/60' : 'bg-white border-slate-200/80 shadow-sm'}`}>
          <div className="flex items-center gap-3">
            <Clock size={20} style={{ color: accentColor }} />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Lesson Duration</span>
              <span className="text-sm font-extrabold">{lesson.duration}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap size={20} style={{ color: '#F59E0B' }} />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Completion XP</span>
              <span className="text-sm font-extrabold">{lesson.xp} XP</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BookOpen size={20} style={{ color: '#10B981' }} />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Concept Steps</span>
              <span className="text-sm font-extrabold">{totalSteps} units</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award size={20} style={{ color: '#8B5CF6' }} />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Badge Reward</span>
              <span className="text-sm font-extrabold">Web Dev Core Credentials</span>
            </div>
          </div>
        </div>

        {/* WORKSPACE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CONTENT / TABS (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Nav Tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-slate-900/40 border border-slate-800 max-w-md">
              {NAV_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'learn' && (
                  <div className="space-y-6">
                    <SmartTVPlayer
                      script={script}
                      currentStep={currentStep}
                      onStepChange={handleStepChange}
                      isTalking={isTalking}
                      onTalkingChange={setIsTalking}
                      accentColor={accentColor}
                    />

                    {/* Lesson Notes */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/35 border-slate-850' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <h3 className="font-extrabold text-sm mb-3 flex items-center gap-2">
                        <StickyNote size={16} style={{ color: accentColor }} /> Student Notebook
                      </h3>
                      <textarea
                        value={notesText}
                        onChange={e => setNotesText(e.target.value)}
                        placeholder="Write down key takeaways or code syntax snippets here..."
                        rows={4}
                        className="w-full p-4 rounded-xl border text-xs font-medium bg-transparent outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'practice' && (
                  <JavaCodeEditor 
                    lesson={webLesson} 
                    isDarkMode={isDarkMode} 
                    accentColor={accentColor} 
                  />
                )}

                {activeTab === 'quiz' && (
                  <QuizEngine 
                    lesson={lesson} 
                    isDarkMode={isDarkMode} 
                    accentColor={accentColor} 
                    saveQuizScore={(score, xp) => useWebDevStore.getState().saveQuizScore(lessonSlug, score, xp)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: AI ASSISTANT / AVATAR (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* AIAvatar and AITeacher Container */}
            <div className={`p-6 rounded-2xl border flex flex-col items-center text-center ${isDarkMode ? 'bg-slate-900/25 border-slate-800' : 'bg-white border-slate-200/80 shadow-md'}`}>
              <AIAvatar isTalking={isTalking} emotion={avatarEmotion} />
              
              <div className="mt-4 w-full">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">AI Personal Guide</span>
                <h3 className="text-base font-extrabold">Web Dev Assistant</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  I will narrate concepts, debug HTML/CSS code, and explain DOM relationships.
                </p>
              </div>

              <div className="w-full mt-6 border-t border-slate-100 dark:border-slate-850 pt-6">
                <AITeacher
                  script={script}
                  currentStep={currentStep}
                  isTalking={isTalking}
                  onTalkingChange={setIsTalking}
                />
              </div>
            </div>

            {/* AI Doubt Solver Button */}
            <AIChatSidebar lesson={lesson} accentColor={accentColor} isDarkMode={isDarkMode} />
          </div>
        </div>

      </div>
    </div>
  );
}
