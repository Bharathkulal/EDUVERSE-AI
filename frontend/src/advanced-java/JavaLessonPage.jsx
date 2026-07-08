/**
 * JavaLessonPage — Redesigned Learning Studio with Dynamic White/Dark Theme Toggle
 * Features a premium light "White Mode" by default.
 */
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
import { JAVA_LESSONS } from './data/javaLessons';
import useJavaStore from './store/useJavaStore';
import SmartTVPlayer from './components/SmartTVPlayer';
import AIAvatar from './components/AIAvatar';
import AITeacher from './components/AITeacher';
import JavaCodeEditor from './components/JavaCodeEditor';
import QuizEngine from './components/QuizEngine';
import AIChatSidebar from './components/AIChatSidebar';
import EnterpriseVisualizations from './components/EnterpriseVisualizations';

const DIFFICULTY_COLORS = {
  Beginner:     { bg: 'from-emerald-500/10 to-emerald-500/5', text: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/20' },
  Intermediate: { bg: 'from-amber-500/10 to-amber-500/5',   text: 'text-amber-600 dark:text-amber-400',   border: 'border-amber-500/20'   },
  Advanced:     { bg: 'from-red-500/10 to-red-500/5',      text: 'text-red-500 dark:text-red-400',     border: 'border-red-500/20'     },
  Expert:       { bg: 'from-purple-500/10 to-purple-500/5',   text: 'text-purple-500 dark:text-purple-400',  border: 'border-purple-500/20'  },
};

const NAV_TABS = [
  { id: 'learn',        label: '🎬 Learn',        icon: BookOpen },
  { id: 'architecture', label: '💡 Architecture', icon: BarChart2 },
  { id: 'practice',     label: '💻 Practice',     icon: CheckCircle },
  { id: 'quiz',         label: '🧠 Quiz',         icon: Award },
  { id: 'projects',     label: '🏆 Projects',     icon: Award },
];

export default function JavaLessonPage() {
  const { lessonSlug } = useParams();
  const navigate       = useNavigate();

  const lesson = JAVA_LESSONS.find(l => l.slug === lessonSlug);

  const isCompleted   = useJavaStore(s => s.isCompleted(lessonSlug));
  const progress      = useJavaStore(s => s.getProgress(lessonSlug));
  const bookmark      = useJavaStore(s => s.getBookmark(lessonSlug));
  const updateProgress= useJavaStore(s => s.updateProgress);
  const saveBookmark  = useJavaStore(s => s.saveBookmark);
  const completeLesson= useJavaStore(s => s.completeLesson);
  const localNotes    = useJavaStore(s => s.getNotes(lessonSlug));
  const saveNotes     = useJavaStore(s => s.saveNotes);
  const xpEarned      = useJavaStore(s => s.getTotalXP());

  const [currentStep, setCurrentStep] = useState(bookmark || 0);
  const [isTalking,   setIsTalking]   = useState(false);
  const [avatarEmotion, setAvatarEmotion] = useState('idle');
  const [activeTab, setActiveTab]       = useState('learn');
  const [notesText, setNotesText]       = useState(localNotes || '');
  
  // Theme: use global ThemeContext for consistent theming across app
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
  }, [lessonSlug, totalSteps, script, isCompleted, saveBookmark, updateProgress, completeLesson, lesson, isDarkMode]);

  const handleTalkingChange = useCallback((talking) => {
    setIsTalking(talking);
    if (talking) {
      setAvatarEmotion('talk');
    } else {
      setAvatarEmotion('idle');
    }
  }, []);

  const triggerQuickPrompt = (promptText) => {
    toast(`AI Architect: Analyzing "${promptText}"`, {
      icon: '🧠',
      style: {
        background: isDarkMode ? '#0B1020' : '#FFFFFF',
        color: '#8B5CF6',
        border: '1px solid rgba(139, 92, 246, 0.2)'
      }
    });
    const chatToggle = document.querySelector('button[title="Ask about Java architecture..."]');
    if (chatToggle) {
      chatToggle.click();
    }
  };

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="text-5xl">🔍</div>
        <h2 className="text-xl font-bold text-white">Module Not Found</h2>
        <p className="text-slate-450 text-sm">The module "{lessonSlug}" does not exist.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors"
        >
          ← Back to Syllabus
        </button>
      </div>
    );
  }

  // Theme-based style maps — strong contrast for both modes
  const themeBg = isDarkMode ? 'bg-[#050816] text-[#E2E8F0]' : 'bg-[#F8FAFC] text-[#1E293B]';
  const themeCard = isDarkMode ? 'bg-[#0b1020]/75 border-white/5' : 'bg-white border-slate-200 shadow-sm shadow-slate-200/60';
  const themeTextPrimary = isDarkMode ? 'text-slate-200' : 'text-slate-800';
  const themeTextMuted = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const themeTextLabel = isDarkMode ? 'text-slate-500' : 'text-slate-500';
  const themeBorder = isDarkMode ? 'border-white/5' : 'border-slate-200';
  const themeTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const themeBtnBg = isDarkMode ? 'bg-[#050816]/80' : 'bg-slate-100';
  const themeBtnText = isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900';
  const themeInputBg = isDarkMode ? 'bg-[#050816]/90' : 'bg-slate-50';
  const themeInputText = isDarkMode ? 'text-slate-300 placeholder-slate-600' : 'text-slate-800 placeholder-slate-400';

  return (
    <div className={`min-h-screen ${themeBg} selection:bg-blue-500/30 selection:text-white font-sans relative overflow-x-hidden pb-32 transition-colors duration-300`}>
      
      {/* Custom Styles */}
      <style>{`
        .futuristic-glow {
          box-shadow: ${isDarkMode 
            ? `0 0 50px -10px ${accentColor}30, 0 0 30px -15px ${accentColor}20`
            : `0 10px 40px -10px rgba(0, 0, 0, 0.04), 0 0 20px -5px ${accentColor}10`};
        }
        .neon-border-glow {
          position: relative;
        }
        .neon-border-glow::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: ${isDarkMode 
            ? `linear-gradient(135deg, ${accentColor}80, transparent 40%, rgba(255,255,255,0.05) 60%, ${accentColor}50)`
            : `linear-gradient(135deg, ${accentColor}40, transparent 40%, rgba(0,0,0,0.02) 60%, ${accentColor}30)`};
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .glass-panel {
          background: ${isDarkMode ? 'rgba(11, 16, 32, 0.6)' : 'rgba(255, 255, 255, 0.85)'};
          backdrop-filter: blur(20px);
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'};
        }
        .mentor-voice-bar {
          display: inline-block;
          width: 3px;
          height: 4px;
          background-color: ${accentColor};
          border-radius: 99px;
          margin: 0 1.5px;
        }
      `}</style>

      {/* Decorative Orbs */}
      <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full ${isDarkMode ? 'bg-blue-900/10' : 'bg-blue-500/5'} blur-[150px] pointer-events-none`} />
      <div className={`absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full ${isDarkMode ? 'bg-purple-950/10' : 'bg-purple-500/5'} blur-[150px] pointer-events-none`} />

      <div className="max-w-[1550px] mx-auto px-4 md:px-8 pt-4 space-y-8 relative z-10">

        {/* ─────────────────────────────────────────────────────────────
            HEADER — Premium Hero Card
        ───────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 md:p-8 glass-panel relative overflow-hidden futuristic-glow neon-border-glow"
        >
          {/* Subtle grid mesh background */}
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px)]'} bg-[size:32px_32px] pointer-events-none`} />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-5">
              <motion.div
                whileHover={{ rotate: [0, 5, -5, 0] }}
                className={`text-6xl p-4 rounded-2xl ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-100 border-slate-200'} border flex items-center justify-center backdrop-blur-md`}
              >
                {lesson.icon}
              </motion.div>
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-650 transition-colors font-mono uppercase tracking-widest"
                  >
                    <ArrowLeft size={12} />
                    Advanced Java
                  </button>
                  <span className="text-slate-350">|</span>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                      isDarkMode ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {isDarkMode ? <Sun size={12} /> : <Moon size={12} />}
                    <span className="font-mono text-[10px] font-bold uppercase">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">Module {lesson.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border bg-gradient-to-r ${dc.bg} ${dc.text} ${dc.border}`}>
                    {lesson.difficulty}
                  </span>
                  {isCompleted && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1 font-bold">
                      🏆 Completed
                    </span>
                  )}
                </div>
                <h1 className={`text-2xl md:text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                  {lesson.title}
                </h1>
                <p className={`text-sm ${themeTextMuted} mt-1 max-w-2xl`}>{lesson.description}</p>
              </div>
            </div>

            {/* Top Right Mini Stats */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className={`rounded-2xl px-4 py-2.5 ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-100 border-slate-200'} border flex items-center gap-2`}>
                <Clock size={14} className="text-cyan-500" />
                <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{lesson.duration}</span>
              </div>
              <div className={`rounded-2xl px-4 py-2.5 ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-100 border-slate-200'} border flex items-center gap-2 relative overflow-hidden group`}>
                <Zap size={14} className="text-amber-500" />
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-300">{lesson.xp} XP</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStepChange(bookmark || 0)}
                className="px-6 py-2.5 rounded-2xl text-xs font-black text-white transition-all shadow-lg hover:shadow-blue-500/20 font-mono tracking-wider uppercase border border-white/10"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
              >
                Resume Module
              </motion.button>
            </div>
          </div>

          {/* Progress Tracker Slider */}
          <div className={`mt-6 pt-4 border-t ${themeBorder}`}>
            <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
              <span className="font-medium tracking-wide uppercase font-mono">Module Mastery</span>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} font-mono`}>{progress}% Complete</span>
            </div>
            <div className={`h-2 ${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-200'} rounded-full overflow-hidden border ${themeBorder} p-[1px]`}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${accentColor}, #8B5CF6, #EC4899)` }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────────────────────
            MAIN STUDIO LAYOUT — 70/30 SPLIT
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
          
          {/* LEFT SIDE (70%): Smart TV Player & Main Content Arena */}
          <div className="lg:col-span-7 space-y-8 min-w-0">
            
            {/* 1. Smart TV Player Component Container */}
            <div 
              className={`rounded-[32px] overflow-hidden relative futuristic-glow neon-border-glow p-2 ${isDarkMode ? 'bg-[#080b15]' : 'bg-slate-200'}`}
              style={{ height: '520px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-white/[0.03] pointer-events-none rounded-[32px] z-10" />
              
              <div className="w-full h-full rounded-[24px] overflow-hidden relative">
                <SmartTVPlayer
                  lesson={lesson}
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onStepChange={handleStepChange}
                  accentColor={accentColor}
                  onTalkingChange={handleTalkingChange}
                />
              </div>
            </div>

            {/* Lesson Chapters timeline list below player */}
            <div className={`rounded-2xl p-4 ${themeCard} border`}>
              <span className={`text-[10px] font-bold ${themeTextLabel} uppercase tracking-widest block mb-3 font-mono`}>Chapters Map</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {script.map((s, i) => {
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
                          ? `border-transparent ${isDarkMode ? 'text-slate-400 bg-white/[0.01]' : 'text-slate-600 bg-slate-100'}`
                          : `border-transparent ${isDarkMode ? 'text-slate-500 hover:text-slate-300 bg-white/[0.005]' : 'text-slate-700 hover:text-slate-900 bg-slate-100/50'}`
                      }`}
                      style={isActive ? { borderColor: accentColor + '60', color: accentColor, background: (isDarkMode ? accentColor + '10' : accentColor + '12') } : {}}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-current animate-pulse' : isDone ? 'bg-emerald-500' : (isDarkMode ? 'bg-slate-600' : 'bg-slate-400')}`} />
                      <span className="truncate">{i + 1}. {s.text.slice(0, 20)}...</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Floating Tab Control Buttons */}
            <div className={`sticky top-4 z-40 p-1.5 ${isDarkMode ? 'bg-[#0a0d1a]/85 border-white/5' : 'bg-white/95 border-slate-200'} border backdrop-blur-md rounded-2xl flex items-center gap-1.5 overflow-x-auto shadow-xl futuristic-glow`}>
              {NAV_TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                      isActive
                        ? 'shadow-lg border'
                        : isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    style={isActive ? {
                      background: isDarkMode ? accentColor + '20' : accentColor + '15',
                      borderColor: accentColor + '50',
                      color: isDarkMode ? '#FFFFFF' : accentColor,
                      boxShadow: `0 4px 20px ${accentColor}20`
                    } : {}}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* 3-7. Content Panels */}
            <div className="space-y-8 min-h-[400px]">
              
              {/* Tab: Learn (AI Teacher Narration) */}
              {activeTab === 'learn' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-[850px] mx-auto space-y-4"
                >
                  <AITeacher lesson={lesson} currentStep={currentStep} />
                </motion.div>
              )}

              {/* Tab: Architecture Visualizations */}
              {activeTab === 'architecture' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <EnterpriseVisualizations lesson={lesson} />
                </motion.div>
              )}

              {/* Tab: Practice Lab (Compiler sandbox) */}
              {activeTab === 'practice' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <JavaCodeEditor lesson={lesson} accentColor={accentColor} />
                </motion.div>
              )}

              {/* Tab: Quiz Arena */}
              {activeTab === 'quiz' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-[900px] mx-auto space-y-4"
                >
                  <QuizEngine lesson={lesson} />
                </motion.div>
              )}

              {/* Tab: Projects Section */}
              {activeTab === 'projects' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-[850px] mx-auto space-y-4"
                >
                  <div className={`rounded-3xl border ${themeBorder} p-8 bg-gradient-to-b ${isDarkMode ? 'from-white/[0.02] to-transparent' : 'from-slate-50 to-transparent'} relative overflow-hidden`}>
                    <div className="absolute top-[-30px] right-[-30px] w-48 h-48 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />
                    
                    <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2 flex items-center gap-2 tracking-tight`}>
                      🎓 Enterprise Capstone Milestones
                    </h2>
                    <p className={`text-xs ${themeTextMuted} leading-relaxed mb-6`}>
                      Apply the architectural concepts of this module to building the core backend microservice systems.
                    </p>
                    
                    <div className="space-y-4">
                      {lesson.quiz?.scenario?.map((sc, index) => (
                        <div 
                          key={index}
                          className={`p-5 rounded-2xl border ${themeBorder} ${isDarkMode ? 'bg-white/[0.01]' : 'bg-slate-100/50'} hover:bg-slate-100 transition-colors relative group`}
                        >
                          <div className="flex items-start gap-3">
                            <CornerDownRight size={14} className="text-purple-500 mt-1 flex-shrink-0" />
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-650">Milestone Project {index + 1}</span>
                              <h4 className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mt-0.5 leading-snug`}>{sc.question}</h4>
                              <p className={`text-xs ${themeTextMuted} mt-3 font-mono leading-relaxed bg-[#050816]/10 p-3 rounded-xl border ${themeBorder}`}>
                                <span className="text-amber-600 font-bold">Hint:</span> {sc.hint}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

          </div>

          {/* RIGHT SIDE (30%): Sticky Mentor Panel (Hidden on tablet/mobile screens) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className={`sticky top-4 rounded-3xl p-6 ${themeCard} border backdrop-blur-xl space-y-6 futuristic-glow neon-border-glow`}>
              
              {/* Coach status */}
              <div className={`flex items-center justify-between border-b ${themeBorder} pb-3`}>
                <span className={`text-xs font-black font-mono uppercase tracking-widest ${themeTextLabel}`}>Coding Coach</span>
                <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className={`w-1.5 h-1.5 rounded-full ${isTalking ? 'bg-green-500 animate-ping' : 'bg-emerald-500'}`} />
                  <span className="text-[9px] text-emerald-600 font-mono font-bold uppercase">{isTalking ? 'speaking' : 'ready'}</span>
                </div>
              </div>

              {/* Avatar section */}
              <div className="flex flex-col items-center py-2 relative">
                {isTalking && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-blue-500/5 blur-xl animate-pulse pointer-events-none" />
                )}
                <AIAvatar
                  isTalking={isTalking}
                  emotion={avatarEmotion}
                  accentColor={accentColor}
                />
                
                {/* Voice status visualization */}
                {isTalking && (
                  <div className="flex items-center justify-center mt-3 h-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span
                        key={i}
                        className="mentor-voice-bar"
                        style={{
                          animation: `bounce 0.8s ease-in-out infinite alternate`,
                          animationDelay: `${i * 0.08}s`,
                          height: `${4 + Math.random() * 12}px`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Progress metrics */}
              <div className={`rounded-2xl border ${themeBorder} p-4 ${isDarkMode ? 'bg-white/[0.01]' : 'bg-slate-50'} space-y-3`}>
                <div className="flex justify-between items-center text-xs">
                  <span className={`${themeTextLabel} font-mono uppercase tracking-wider text-[10px]`}>XP Accumulation</span>
                  <span className="text-amber-600 font-mono font-bold">{xpEarned} XP</span>
                </div>
                <div className={`w-full ${isDarkMode ? 'bg-[#050816]' : 'bg-slate-200'} h-1.5 rounded-full overflow-hidden p-[1px] border ${themeBorder}`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" style={{ width: `${Math.min(100, (xpEarned / 1000) * 100)}%` }} />
                </div>
              </div>

              {/* Quick actions panel */}
              <div className="space-y-2">
                <span className={`text-[10px] uppercase font-bold ${themeTextLabel} tracking-widest font-mono block`}>Action Hotkeys</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Explain Again', text: 'Please explain this topic again differently.' },
                    { label: 'Give Example', text: 'Generate an enterprise code example.' },
                    { label: 'Practice Task', text: 'Give me a mock practice scenario challenge.' },
                    { label: 'Common Bugs', text: 'What are common production mistakes here?' },
                  ].map(qa => (
                    <button
                      key={qa.label}
                      onClick={() => triggerQuickPrompt(qa.text)}
                      className={`text-[10px] p-2.5 text-center rounded-xl border ${themeBorder} ${themeBtnBg} ${themeBtnText} transition-all font-mono font-semibold`}
                    >
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Notepad */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] uppercase font-bold ${themeTextLabel} tracking-widest font-mono block`}>Mentor Notepad</span>
                  <span className={`text-[9px] ${themeTextMuted} font-mono`}>auto-save</span>
                </div>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Record key architectural parameters..."
                  className={`w-full h-24 ${themeInputBg} border ${themeBorder} rounded-2xl p-3.5 text-xs ${themeInputText} focus:outline-none focus:border-purple-500/40 resize-none font-mono`}
                />
              </div>

            </div>
          </div>

        </div>

        {/* Sidebar wrapper placed below player for Tablet/Landscape layouts */}
        <div className="block lg:hidden mt-8">
          <div className={`rounded-3xl p-6 ${themeCard} border backdrop-blur-xl space-y-6`}>
            <div className={`flex items-center justify-between border-b ${themeBorder} pb-3`}>
              <span className={`text-xs font-black font-mono uppercase tracking-widest ${themeTextLabel}`}>Coding Coach</span>
              <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] text-emerald-600 font-mono font-bold uppercase">Ready</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center">
                <AIAvatar isTalking={isTalking} emotion={avatarEmotion} accentColor={accentColor} />
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => triggerQuickPrompt('Explain this concept differently')} className={`text-[10px] p-2.5 rounded-xl border ${themeBorder} ${themeBtnBg} ${themeBtnText} font-mono text-center font-semibold`}>Explain Again</button>
                  <button onClick={() => triggerQuickPrompt('Give an enterprise example')} className={`text-[10px] p-2.5 rounded-xl border ${themeBorder} ${themeBtnBg} ${themeBtnText} font-mono text-center font-semibold`}>Give Example</button>
                </div>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Record key notes..."
                  className={`w-full h-20 ${themeInputBg} border ${themeBorder} rounded-2xl p-3 text-xs ${themeInputText} font-mono`}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating ChatGPT style assistant chat sidebar */}
      <AIChatSidebar lesson={lesson} />

    </div>
  );
}
