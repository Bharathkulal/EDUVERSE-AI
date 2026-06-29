/**
 * PythonLessonPage — Full AI-powered lesson experience
 * Route: /python/course/:lessonSlug
 *
 * Layout:
 *   Top    — Lesson header (title, badge, duration, XP, progress, resume btn)
 *   Center — SmartTVPlayer (left) + AIAvatar (right)
 *   Below  — AITeacher content
 *   Below  — PythonCodeEditor (practice)
 *   Below  — QuizEngine
 *   Float  — AIChatSidebar
 *   Bottom — Next Lesson button
 */
import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Zap, BookOpen, CheckCircle,
  ChevronRight, Play, Award, BarChart2
} from 'lucide-react';
import toast from 'react-hot-toast';

import { PYTHON_LESSONS } from './data/pythonLessons';
import usePythonStore from './store/usePythonStore';
import SmartTVPlayer from './components/SmartTVPlayer';
import AIAvatar from './components/AIAvatar';
import AITeacher from './components/AITeacher';
import PythonCodeEditor from './components/PythonCodeEditor';
import QuizEngine from './components/QuizEngine';
import AIChatSidebar from './components/AIChatSidebar';

const DIFFICULTY_COLORS = {
  Beginner:     { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Intermediate: { bg: 'bg-amber-500/20',   text: 'text-amber-400',   border: 'border-amber-500/30'   },
  Advanced:     { bg: 'bg-red-500/20',      text: 'text-red-400',     border: 'border-red-500/30'     },
};

const LESSON_SECTIONS = [
  { id: 'tv',       label: '📺 Lesson',     icon: Play },
  { id: 'content',  label: '💡 Content',    icon: BookOpen },
  { id: 'code',     label: '💻 Practice',   icon: CheckCircle },
  { id: 'quiz',     label: '🧠 Quiz',       icon: Award },
];

export default function PythonLessonPage() {
  const { lessonSlug } = useParams();
  const navigate       = useNavigate();

  const lesson = PYTHON_LESSONS.find(l => l.slug === lessonSlug);

  // Progress store
  const isCompleted   = usePythonStore(s => s.isCompleted(lessonSlug));
  const progress      = usePythonStore(s => s.getProgress(lessonSlug));
  const bookmark      = usePythonStore(s => s.getBookmark(lessonSlug));
  const updateProgress= usePythonStore(s => s.updateProgress);
  const saveBookmark  = usePythonStore(s => s.saveBookmark);
  const completeLesson= usePythonStore(s => s.completeLesson);

  // Local state
  const [currentStep, setCurrentStep] = useState(bookmark || 0);
  const [isTalking,   setIsTalking]   = useState(false);
  const [avatarEmotion, setAvatarEmotion] = useState('idle');
  const [activeSection, setActiveSection] = useState('tv');

  const script     = lesson?.script     || [];
  const totalSteps = script.length;
  const accentColor= lesson?.accent || '#3B82F6';
  const dc         = DIFFICULTY_COLORS[lesson?.difficulty] || DIFFICULTY_COLORS.Beginner;

  // Find next lesson
  const currentIdx = lesson ? PYTHON_LESSONS.findIndex(l => l.slug === lessonSlug) : -1;
  const nextLesson = currentIdx >= 0 && currentIdx < PYTHON_LESSONS.length - 1
    ? PYTHON_LESSONS[currentIdx + 1]
    : null;

  /* ── Handle step changes ── */
  const handleStepChange = useCallback((step) => {
    setCurrentStep(step);
    saveBookmark(lessonSlug, step);

    // Update progress
    const pct = Math.round(((step + 1) / totalSteps) * 100);
    updateProgress(lessonSlug, pct);

    // Avatar emotion based on step type
    const s = script[step] || {};
    if (s.type === 'congrats' || s.type === 'summary') setAvatarEmotion('congrats');
    else if (s.type === 'code') setAvatarEmotion('point');
    else if (step === 0) setAvatarEmotion('wave');
    else setAvatarEmotion('idle');

    // Mark complete when reaching last step
    if (step === totalSteps - 1 && !isCompleted) {
      setTimeout(() => {
        completeLesson(lessonSlug, lesson.xp);
        toast.success(`🎉 Lesson Complete! +${lesson.xp} XP earned!`, { duration: 4000 });
      }, 1500);
    }
  }, [lessonSlug, totalSteps, script, isCompleted, saveBookmark, updateProgress, completeLesson, lesson]);

  /* ── Handle talking change ── */
  const handleTalkingChange = useCallback((talking) => {
    setIsTalking(talking);
  }, []);

  /* ── Not found ── */
  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="text-5xl">🔍</div>
        <h2 className="text-xl font-bold text-white">Lesson Not Found</h2>
        <p className="text-slate-400 text-sm">The lesson "{lessonSlug}" doesn't exist yet.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors"
        >
          ← Back to Python
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* ─────────────────────────────────────────────────────────────
          TOP — Lesson Header
      ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border"
        style={{
          background: `linear-gradient(135deg, ${accentColor}15, #0a0c14)`,
          borderColor: accentColor + '40',
        }}
      >
        <div className="p-6">
          {/* Back button + breadcrumb */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-5 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Python Course
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon + Title */}
            <div className="flex items-center gap-4 flex-1">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl"
              >
                {lesson.icon}
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-500 font-mono">Lesson {lesson.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${dc.bg} ${dc.text} ${dc.border}`}>
                    {lesson.difficulty}
                  </span>
                  {isCompleted && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={10} /> Completed
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-black text-white">{lesson.title}</h1>
                <p className="text-sm text-slate-400 mt-1">{lesson.description}</p>
              </div>
            </div>

            {/* Meta stats */}
            <div className="grid grid-cols-3 gap-3 flex-shrink-0">
              {[
                { icon: Clock,    value: lesson.duration, label: 'Duration', color: '#06B6D4' },
                { icon: Zap,      value: `${lesson.xp} XP`, label: 'Reward',  color: '#F59E0B' },
                { icon: BarChart2,value: `${progress}%`,  label: 'Progress', color: accentColor },
              ].map(({ icon: Icon, value, label, color }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center border"
                  style={{ background: color + '10', borderColor: color + '30' }}
                >
                  <Icon size={14} style={{ color }} className="mx-auto mb-1" />
                  <div className="text-sm font-bold text-white">{value}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Lesson Progress</span>
              <span className="font-mono">Step {currentStep + 1} / {totalSteps}</span>
            </div>
            <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }}
                animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div
          className="flex border-t overflow-x-auto"
          style={{ borderColor: accentColor + '20', background: 'rgba(0,0,0,0.3)' }}
        >
          {LESSON_SECTIONS.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                activeSection === sec.id
                  ? 'border-current'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
              style={{ color: activeSection === sec.id ? accentColor : undefined, borderColor: activeSection === sec.id ? accentColor : 'transparent' }}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          CENTER — TV Player + Avatar
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeSection === 'tv' && (
          <motion.div
            key="tv"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-5 items-start"
          >
            {/* Smart TV Player */}
            <SmartTVPlayer
              lesson={lesson}
              currentStep={currentStep}
              totalSteps={totalSteps}
              onStepChange={handleStepChange}
              accentColor={accentColor}
              onTalkingChange={handleTalkingChange}
            />

            {/* AI Avatar */}
            <div className="flex flex-col items-center gap-4">
              <AIAvatar
                isTalking={isTalking}
                emotion={avatarEmotion}
                accentColor={accentColor}
              />

              {/* Step quick-nav */}
              <div className="w-full space-y-1.5">
                {script.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleStepChange(i)}
                    className={`w-full text-left text-[10px] px-2.5 py-1.5 rounded-lg border transition-all truncate ${
                      i === currentStep
                        ? 'border-current font-bold'
                        : i < currentStep
                        ? 'border-slate-700 text-slate-500 bg-slate-800/20'
                        : 'border-slate-800 text-slate-600'
                    }`}
                    style={i === currentStep ? { borderColor: accentColor, color: accentColor, background: accentColor + '15' } : {}}
                  >
                    {i + 1}. {s.text.slice(0, 30)}…
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── AITeacher Content ─── */}
        {activeSection === 'content' && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen size={18} style={{ color: accentColor }} />
              <h2 className="text-lg font-bold text-white">AI Teacher Content</h2>
            </div>
            <AITeacher lesson={lesson} currentStep={currentStep} />

            {/* All code examples */}
            {lesson.codeExamples.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">All Code Examples</h3>
                {lesson.codeExamples.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border p-5"
                    style={{ background: '#0d1117', borderColor: accentColor + '30' }}
                  >
                    <div className="text-sm font-bold mb-1" style={{ color: accentColor }}>{ex.title}</div>
                    <p className="text-xs text-slate-500 mb-3">{ex.explanation}</p>
                    <pre
                      className="text-sm font-mono bg-black/40 rounded-xl p-4 overflow-x-auto border border-slate-800 text-slate-200 whitespace-pre"
                    >
                      {ex.code}
                    </pre>
                    {ex.output && (
                      <div className="mt-3 p-3 bg-black/60 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Output</div>
                        <pre className="text-emerald-400 text-xs whitespace-pre-wrap font-mono">{ex.output}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Code Editor ─── */}
        {activeSection === 'code' && (
          <motion.div
            key="code"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle size={18} style={{ color: accentColor }} />
              <h2 className="text-lg font-bold text-white">Practice Editor</h2>
              <span className="text-xs text-slate-500">Write and run Python code instantly</span>
            </div>
            <PythonCodeEditor
              lesson={lesson}
              starterCode={lesson.quiz?.coding?.[0]?.starterCode}
            />
          </motion.div>
        )}

        {/* ─── Quiz ─── */}
        {activeSection === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Award size={18} style={{ color: accentColor }} />
              <h2 className="text-lg font-bold text-white">Knowledge Quiz</h2>
            </div>
            <QuizEngine lesson={lesson} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          LESSON SUMMARY
      ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-slate-800 p-5 bg-slate-900/40"
      >
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <BookOpen size={14} style={{ color: accentColor }} /> Lesson Summary
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">{lesson.summary}</p>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          NEXT LESSON BUTTON
      ───────────────────────────────────────────────────────────── */}
      {nextLesson && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl overflow-hidden border cursor-pointer group"
          style={{ borderColor: nextLesson.accent + '30', background: nextLesson.accent + '08' }}
          onClick={() => navigate(`/python/course/${nextLesson.slug}`)}
        >
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: nextLesson.accent + '20', border: `1px solid ${nextLesson.accent}40` }}
              >
                {nextLesson.icon}
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Up Next</div>
                <div className="font-bold text-white">{nextLesson.title}</div>
                <div className="text-xs text-slate-400">{nextLesson.duration} · {nextLesson.xp} XP</div>
              </div>
            </div>
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: nextLesson.accent + '25', border: `1px solid ${nextLesson.accent}50` }}
              whileHover={{ scale: 1.1, x: 3 }}
            >
              <ChevronRight size={18} style={{ color: nextLesson.accent }} />
            </motion.div>
          </div>
        </motion.div>
      )}

      {isCompleted && !nextLesson && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-8 text-center border border-emerald-500/30 bg-emerald-500/10"
        >
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-2xl font-black text-white mb-2">Course Complete!</h3>
          <p className="text-slate-400 text-sm mb-5">You've completed all 10 Python lessons. You're a Python pro now!</p>
          <button
            onClick={() => navigate('/certificates')}
            className="px-6 py-3 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 transition-all"
          >
            🎓 Claim Certificate
          </button>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          Floating AI Chat
      ───────────────────────────────────────────────────────────── */}
      <AIChatSidebar lesson={lesson} />
    </div>
  );
}
