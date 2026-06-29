/**
 * PythonLessonCard — Premium glass-morphism card for Python course index
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Zap, ChevronRight, Play } from 'lucide-react';
import usePythonStore from '../store/usePythonStore';

const DIFFICULTY_COLORS = {
  Beginner:     { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Intermediate: { bg: 'bg-amber-500/20',   text: 'text-amber-400',   border: 'border-amber-500/30'   },
  Advanced:     { bg: 'bg-red-500/20',      text: 'text-red-400',     border: 'border-red-500/30'     },
};

export default function PythonLessonCard({ lesson, index }) {
  const navigate    = useNavigate();
  const isCompleted = usePythonStore(s => s.isCompleted(lesson.slug));
  const progress    = usePythonStore(s => s.getProgress(lesson.slug));
  const quizScore   = usePythonStore(s => s.getQuizScore(lesson.slug));
  const dc          = DIFFICULTY_COLORS[lesson.difficulty] || DIFFICULTY_COLORS.Beginner;

  const handleClick = () => navigate(`/python/course/${lesson.slug}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 200 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="relative cursor-pointer rounded-2xl border bg-slate-900/60 backdrop-blur-xl overflow-hidden group"
      style={{ borderColor: isCompleted ? '#10B981' : lesson.accent + '40' }}
    >
      {/* Glow top border */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${lesson.accent}, transparent)` }}
      />

      {/* Completion badge */}
      {isCompleted && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2 py-0.5">
          <CheckCircle size={12} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400">DONE</span>
        </div>
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
            style={{ background: lesson.accent + '25', border: `1px solid ${lesson.accent}50` }}
          >
            {lesson.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-500">LESSON {lesson.id}</span>
            </div>
            <h3 className="text-base font-bold text-white truncate leading-tight">{lesson.title}</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{lesson.description}</p>
          </div>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {lesson.topics.map(t => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
              style={{ borderColor: lesson.accent + '40', color: lesson.accent, background: lesson.accent + '15' }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-4 text-xs text-slate-400">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${dc.bg} ${dc.text} ${dc.border}`}>
            {lesson.difficulty}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> {lesson.duration}
          </span>
          <span className="flex items-center gap-1" style={{ color: lesson.accent }}>
            <Zap size={11} /> {lesson.xp} XP
          </span>
          {quizScore !== null && (
            <span className="ml-auto text-amber-400 font-bold">Quiz: {quizScore}%</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
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
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all"
          style={{
            background: `linear-gradient(135deg, ${lesson.accent}CC, ${lesson.accent}88)`,
            color: '#fff',
            boxShadow: `0 4px 20px ${lesson.accent}40`,
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
    </motion.div>
  );
}
