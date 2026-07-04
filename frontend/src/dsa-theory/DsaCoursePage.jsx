import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Zap, Trophy, TrendingUp, Star, Code2, CheckCircle, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import { DSA_LESSONS } from './data/dsaLessons';
import useDsaStore from './store/useDsaStore';
import { useTheme } from '../context/ThemeContext';
import LearningHubBackground from '../components/LearningHubBackground';

const DIFFICULTY_COLORS = {
  Beginner:     { light: { bg: '#dcfce7', text: '#16a34a', border: '#86efac' }, dark: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.3)' } },
  Intermediate: { light: { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' }, dark: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' } },
  Advanced:     { light: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' }, dark: { bg: 'rgba(239,68,68,0.15)',  text: '#f87171', border: 'rgba(239,68,68,0.3)'  } }
};

function DsaLessonCard({ lesson, index, navigate, isDark }) {
  const isCompleted = useDsaStore(s => s.isCompleted(lesson.slug));
  const progress    = useDsaStore(s => s.getProgress(lesson.slug));
  const quizScore   = useDsaStore(s => s.getQuizScore(lesson.slug));
  const dc = DIFFICULTY_COLORS[lesson.difficulty] || DIFFICULTY_COLORS.Intermediate;
  const colors = isDark ? dc.dark : dc.light;

  const handleClick = () => navigate(`/dsa/course/${lesson.slug}`);

  const cardStyle = isDark
    ? {
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }
    : {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.4)' : 'rgba(0,0,0,0.06)'}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 200 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="relative cursor-pointer rounded-2xl overflow-hidden group flex flex-col justify-between"
      style={cardStyle}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${lesson.accent}, transparent)` }}
      />

      {isCompleted && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2 py-0.5 z-10">
          <CheckCircle size={12} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500">DONE</span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background: isDark ? lesson.accent + '20' : lesson.accent + '15',
                border: `1px solid ${isDark ? lesson.accent + '40' : lesson.accent + '30'}`,
                boxShadow: isDark ? `0 4px 12px ${lesson.accent}15` : `0 2px 8px ${lesson.accent}10`,
              }}
            >
              {lesson.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider`}>
                  TOPIC {lesson.id}
                </span>
              </div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} truncate leading-tight`}>
                {lesson.title}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1 line-clamp-2 leading-relaxed`}>
                {lesson.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {lesson.topics.map(t => (
              <span
                key={t}
                className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                style={{
                  color: lesson.accent,
                  background: isDark ? lesson.accent + '15' : lesson.accent + '10',
                  border: `1px solid ${isDark ? lesson.accent + '30' : lesson.accent + '25'}`,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className={`flex items-center gap-3 mb-4 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
            >
              {lesson.difficulty}
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <Clock size={11} /> {lesson.duration}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: lesson.accent }}>
              <Zap size={11} /> {lesson.xp} XP
            </span>
            {quizScore !== null && (
              <span className={`ml-auto ${isDark ? 'text-amber-400' : 'text-amber-600'} font-bold`}>Quiz: {quizScore}%</span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold">
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>PROGRESS</span>
              <span style={{ color: lesson.accent }}>{progress}%</span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: lesson.accent }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DsaCoursePage({ onBack }) {
  const navigate = useNavigate();
  const { isDarkMode: isDark } = useTheme();

  const completedCount = useDsaStore(s => s.completedLessons.length);
  const totalXp         = useDsaStore(s => s.getTotalXP());

  const progressPercent = useMemo(() => {
    return Math.round((completedCount / DSA_LESSONS.length) * 100);
  }, [completedCount]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#050816] text-[#E2E8F0]' : 'bg-[#F8FAFC] text-[#1E293B]'} relative pb-20 font-sans transition-colors duration-300`}>
      <LearningHubBackground isDark={isDark} />

      <div className="max-w-7xl mx-auto px-6 pt-6 relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
              isDark 
                ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-purple-500/20' 
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
            }`}
          >
            <ArrowLeft size={16} /> Back to DSA Hub
          </button>
        </div>

        {/* Hero Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              DSA Theory{' '}
              <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                Learning Studio
              </span>
            </h1>
            <p className={`text-sm leading-relaxed max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Master complex data structures, algorithmic design principles, and efficiency models through interactive visual dry runs, pseudocode engines, and live micro-modules.
            </p>
          </div>

          {/* Quick stats panel */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0b1020]/80 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-md'} flex flex-col justify-between`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="text-amber-400 w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-wider">DSA Scoreboard</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">Active</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className={`text-[10px] font-bold block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>TOTAL XP</span>
                <span className="text-2xl font-black text-blue-500">{totalXp} XP</span>
              </div>
              <div>
                <span className={`text-[10px] font-bold block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>COMPLETED</span>
                <span className="text-2xl font-black text-emerald-500">{completedCount} / 15</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Course Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        <h2 className="text-2xl font-black mb-6 tracking-wide">Course Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DSA_LESSONS.map((lesson, idx) => (
            <DsaLessonCard key={lesson.id} lesson={lesson} index={idx} navigate={navigate} isDark={isDark} />
          ))}
        </div>
      </div>
    </div>
  );
}
