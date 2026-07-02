import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Zap, Trophy, TrendingUp, Star, Code2, CheckCircle, Clock, ChevronRight, Play } from 'lucide-react';
import { WEB_DEV_LESSONS } from './data/webDevLessons';
import useWebDevStore from './store/useWebDevStore';
import { useTheme } from '../context/ThemeContext';

const DIFFICULTY_COLORS = {
  Beginner:     { light: { bg: '#dcfce7', text: '#16a34a', border: '#86efac' }, dark: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.3)' } },
  Intermediate: { light: { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' }, dark: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' } },
  Advanced:     { light: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' }, dark: { bg: 'rgba(239,68,68,0.15)',  text: '#f87171', border: 'rgba(239,68,68,0.3)'  } },
};

const BADGES_INFO = [
  { id: 'html-master', name: 'HTML Master', icon: '🌐', desc: 'Completed HTML Structure' },
  { id: 'css-master', name: 'CSS Master', icon: '🎨', desc: 'Completed CSS Box Model' },
  { id: 'js-master', name: 'JavaScript Master', icon: '⚙️', desc: 'Completed JavaScript Core' }
];

function WebDevLessonCard({ lesson, index, navigate, isDark }) {
  const isCompleted = useWebDevStore(s => s.isCompleted(lesson.slug));
  const progress    = useWebDevStore(s => s.getProgress(lesson.slug));
  const quizScore   = useWebDevStore(s => s.getQuizScore(lesson.slug));
  const dc = DIFFICULTY_COLORS[lesson.difficulty] || DIFFICULTY_COLORS.Intermediate;
  const colors = isDark ? dc.dark : dc.light;

  const handleClick = () => navigate(`/web-dev/course/${lesson.slug}`);

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
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 200 }}
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
                  MODULE {lesson.id}
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
                  color: isDark ? lesson.accent : lesson.accent,
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
              <><CheckCircle size={14} /> Review Module</>
            ) : (
              <><ChevronRight size={14} /> Start Module</>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function WebDevCoursePage() {
  const navigate = useNavigate();
  const { isDarkMode: isDark } = useTheme();
  const xpEarned   = useWebDevStore(s => s.xpEarned);
  const completed  = useWebDevStore(s => s.completedLessons);
  const badges     = useWebDevStore(s => s.badges);
  const overall    = useWebDevStore(s => s.getOverallProgress(WEB_DEV_LESSONS));

  const totalXP    = useMemo(() => WEB_DEV_LESSONS.reduce((s, l) => s + l.xp, 0), []);
  const totalMins  = useMemo(() => WEB_DEV_LESSONS.reduce((s, l) => s + parseInt(l.duration), 0), []);

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-8"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #071930 0%, #0d1b2a 40%, #031c38 100%)'
            : 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 40%, #1d4ed8 100%)',
          border: isDark ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(59,130,246,0.4)',
          boxShadow: isDark
            ? '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 20px 60px rgba(30,58,138,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', top: '-100px', right: '-50px' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #06B6D4, transparent)', bottom: '-50px', left: '20%' }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="text-6xl"
          >
            🌐
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-300 bg-blue-500/15 border border-blue-400/25 rounded-full px-2.5 py-0.5">
                Frontend Academy
              </span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Web Development Core</h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Master semantic HTML structure, dynamic CSS responsive models, layout flexboxes, 
              DOM element manipulations, and React view components.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-shrink-0 w-full md:w-auto">
            {[
              { icon: BookOpen,   label: 'Modules',    value: WEB_DEV_LESSONS.length, color: '#60a5fa' },
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

        <div className="relative z-10 mt-6">
          <div className="flex justify-between text-xs text-slate-300 mb-2">
            <span className="font-medium">Academy Milestones</span>
            <span className="font-bold text-white">{overall}% Mastered</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #3B82F6, #06B6D4, #EC4899)' }}
              initial={{ width: 0 }}
              animate={{ width: `${overall}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>{completed.length} modules done</span>
            <span>{Math.round((totalMins / 60) * 10) / 10} hours total content</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4"
        style={glassCard}
      >
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.1)',
              border: `1px solid ${isDark ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.2)'}`,
            }}
          >
            <Star size={18} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1.5">
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Academy XP Score</span>
              <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{xpEarned} XP</span>
            </div>
            <div className={`h-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full overflow-hidden`}>
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (xpEarned / totalXP) * 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>

        {overall === 100 && (
          <button
            onClick={() => navigate('/certificates')}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-750 text-white font-bold rounded-xl transition duration-300 transform hover:scale-105 active:scale-95 shadow-md shadow-blue-500/20 whitespace-nowrap text-sm flex items-center gap-2"
          >
            🎓 Claim Web Dev Certificate
          </button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-5"
        style={glassCard}
      >
        <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-4 flex items-center gap-2`}>
          <Trophy size={16} className={isDark ? 'text-blue-400' : 'text-blue-500'} /> Badges Collection
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BADGES_INFO.map(badge => {
            const hasBadge = badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3 rounded-xl text-center transition-all ${!hasBadge ? 'opacity-40' : ''}`}
                style={hasBadge
                  ? {
                      background: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.06)',
                      border: `1px solid ${isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.25)'}`,
                    }
                  : {
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}`,
                    }
                }
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className={`text-[10px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'} leading-tight truncate`}>{badge.name}</div>
                <div className={`text-[8px] ${isDark ? 'text-slate-500' : 'text-slate-550'} leading-normal mt-0.5`}>{badge.desc}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div>
        <div className="flex items-center gap-3 mb-5">
          <Code2 size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Course Syllabus</h2>
          <span
            className="text-xs font-semibold rounded-full px-2.5 py-0.5"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              color: isDark ? '#94a3b8' : '#475569',
            }}
          >
            {WEB_DEV_LESSONS.length} modules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WEB_DEV_LESSONS.map((lesson, index) => (
            <WebDevLessonCard key={lesson.id} lesson={lesson} index={index} navigate={navigate} isDark={isDark} />
          ))}
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}
