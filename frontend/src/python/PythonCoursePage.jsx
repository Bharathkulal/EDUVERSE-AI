/**
 * PythonCoursePage — Course index shown when user opens the Python subject
 * Replaces the old single-compiler view with 10 beautiful glassmorphic lesson cards.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Zap, Trophy, TrendingUp, Star, Code2 } from 'lucide-react';
import PythonLessonCard from './components/PythonLessonCard';
import { PYTHON_LESSONS } from './data/pythonLessons';
import usePythonStore from './store/usePythonStore';
import { useTheme } from '../context/ThemeContext';

export default function PythonCoursePage() {
  const { isDarkMode: isDark } = useTheme();
  const xpEarned   = usePythonStore(s => s.getTotalXP());
  const completed  = usePythonStore(s => s.completedLessons);
  const overall    = usePythonStore(s => s.getOverallProgress(PYTHON_LESSONS));

  const totalXP    = useMemo(() => PYTHON_LESSONS.reduce((s, l) => s + l.xp, 0), []);
  const totalMins  = useMemo(() => PYTHON_LESSONS.reduce((s, l) => s + parseInt(l.duration), 0), []);

  // Reusable glass card styles
  const glassCard = isDark
    ? {
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }
    : {
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
      };

  return (
    <div className="space-y-8">
      {/* ─── Hero Banner ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-8"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #1a0533 0%, #0d1b2a 40%, #001f3f 100%)'
            : 'linear-gradient(135deg, #2e1065 0%, #1e1b4b 40%, #172554 100%)',
          border: isDark ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(99,102,241,0.4)',
          boxShadow: isDark
            ? '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 20px 60px rgba(30,27,75,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', top: '-100px', right: '-50px' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)', bottom: '-50px', left: '20%' }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Icon */}
          <motion.div
            animate={{ rotate: [0, 10, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="text-6xl"
          >
            🐍
          </motion.div>

          {/* Text */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-300 bg-blue-500/15 border border-blue-400/25 rounded-full px-2.5 py-0.5">
                Interactive Learning
              </span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Python Programming</h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Master Python from scratch with AI-powered lessons, live coding, animated teacher explanations,
              and real-time quizzes. From variables to dictionaries — one lesson at a time.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 flex-shrink-0 w-full md:w-auto">
            {[
              { icon: BookOpen,   label: 'Lessons',    value: PYTHON_LESSONS.length, color: '#60a5fa' },
              { icon: Zap,        label: 'Total XP',   value: totalXP,              color: '#fbbf24' },
              { icon: Trophy,     label: 'Completed',  value: completed.length,      color: '#34d399' },
              { icon: TrendingUp, label: 'Progress',   value: `${overall}%`,        color: '#a78bfa' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: `1px solid rgba(255,255,255,0.1)`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Icon size={16} style={{ color }} className="mx-auto mb-1" />
                <div className="text-sm font-black" style={{ color }}>{value}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="relative z-10 mt-6">
          <div className="flex justify-between text-xs text-slate-300 mb-2">
            <span className="font-medium">Course Progress</span>
            <span className="font-bold text-white">{overall}% Complete</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899)' }}
              initial={{ width: 0 }}
              animate={{ width: `${overall}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>{completed.length} lessons done</span>
            <span>{Math.round((totalMins / 60) * 10) / 10} hours total</span>
          </div>
        </div>
      </motion.div>

      {/* ─── XP Progress ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4"
        style={glassCard}
      >
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.2)'}`,
            }}
          >
            <Star size={18} className={isDark ? 'text-amber-400' : 'text-amber-505'} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1.5">
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-850'}`}>XP Earned</span>
              <span className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{xpEarned} / {totalXP} XP</span>
            </div>
            <div className={`h-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full overflow-hidden`}>
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (xpEarned / totalXP) * 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Feature Highlights ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: '📺', label: 'Smart TV Player', desc: 'Cinema-style learning' },
          { icon: '🤖', label: 'AI Avatar',        desc: 'Animated instructor' },
          { icon: '🎤', label: 'Voice Narration',  desc: 'Full TTS support' },
          { icon: '💻', label: 'Live Editor',       desc: 'Monaco Python IDE' },
        ].map(({ icon, label, desc }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-4 text-center"
            style={glassCard}
          >
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{label}</div>
            <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'} mt-0.5`}>{desc}</div>
          </motion.div>
        ))}
      </div>

      {/* ─── Course Cards ─── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <Code2 size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Course Modules</h2>
          <span
            className="text-xs font-semibold rounded-full px-2.5 py-0.5"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              color: isDark ? '#94a3b8' : '#475569',
            }}
          >
            {PYTHON_LESSONS.length} lessons
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PYTHON_LESSONS.map((lesson, index) => (
            <PythonLessonCard key={lesson.id} lesson={lesson} index={index} isDark={isDark} />
          ))}
        </div>
      </div>

      {/* ─── Bottom spacer for floating chat ─── */}
      <div className="h-20" />
    </div>
  );
}
