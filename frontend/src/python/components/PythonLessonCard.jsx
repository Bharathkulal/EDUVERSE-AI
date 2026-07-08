/**
 * PythonLessonCard — Premium glassmorphic card for Python course index page
 * Fully styled for both light and dark modes with backdrop blur and frosted accents.
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Zap, ChevronRight, Play } from 'lucide-react';
import usePythonStore from '../store/usePythonStore';

const DIFFICULTY_COLORS = {
  Beginner:     { light: { bg: '#dcfce7', text: '#16a34a', border: '#86efac' }, dark: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.3)' } },
  Intermediate: { light: { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' }, dark: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' } },
  Advanced:     { light: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' }, dark: { bg: 'rgba(239,68,68,0.15)',  text: '#f87171', border: 'rgba(239,68,68,0.3)'  } },
};

export default function PythonLessonCard({ lesson, index, isDark }) {
  const navigate    = useNavigate();
  const isCompleted = usePythonStore(s => s.isCompleted(lesson.slug));
  const progress    = usePythonStore(s => s.getProgress(lesson.slug));
  const quizScore   = usePythonStore(s => s.getQuizScore(lesson.slug));
  
  const dc = DIFFICULTY_COLORS[lesson.difficulty] || DIFFICULTY_COLORS.Beginner;
  const colors = isDark ? dc.dark : dc.light;

  const handleClick = () => navigate(`/python/course/${lesson.slug}`);

  // Glassmorphism styling based on theme
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
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 200 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="relative cursor-pointer rounded-2xl overflow-hidden group flex flex-col justify-between"
      style={cardStyle}
    >
      {/* Glow top border */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${lesson.accent}, transparent)` }}
      />

      {/* Completion badge */}
      {isCompleted && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2 py-0.5 z-10">
          <CheckCircle size={12} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500">DONE</span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row */}
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
                <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-450'} uppercase tracking-wider`}>
                  LESSON {lesson.id}
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

          {/* Topics */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {lesson.topics.map(t => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                style={{
                  color: lesson.accent,
                  background: isDark ? lesson.accent + '15' : lesson.accent + '10',
                  borderColor: isDark ? lesson.accent + '30' : lesson.accent + '25',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          {/* Stats row */}
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
              <span className={`ml-auto ${isDark ? 'text-amber-400' : 'text-amber-650'} font-bold`}>Quiz: {quizScore}%</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className={`flex justify-between text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'} mb-1 font-medium`}>
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className={`h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full overflow-hidden`}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: isCompleted ? '#10B981' : lesson.accent }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all text-white"
            style={{
              background: `linear-gradient(135deg, ${lesson.accent}CC, ${lesson.accent}88)`,
              boxShadow: `0 4px 20px ${lesson.accent}30`,
            }}
          >
            {progress > 0 && !isCompleted ? (
              <><Play size={14} fill="white" /> Resume</>
            ) : isCompleted ? (
              <><CheckCircle size={14} /> Review Lesson</>
            ) : (
              <><ChevronRight size={14} /> Start Lesson</>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
