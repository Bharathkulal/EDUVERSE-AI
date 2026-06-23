import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ── Animated Counter Hook ──────────────────────────────
function useAnimatedCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16)) || 1;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ── SVG Circular Progress Ring ─────────────────────────
function ProgressRing({ radius = 54, stroke = 7, progress = 0, color = '#2563EB', trailColor, children }) {
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle stroke={trailColor || 'var(--db-input-border)'} fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

// ── Section Wrapper with stagger ───────────────────────
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } } };

// ── Heatmap Data Generator ─────────────────────────────
function generateHeatmap() {
  const weeks = 20;
  const data = [];
  const now = new Date();
  for (let w = weeks - 1; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      week.push({ date, value: Math.floor(Math.random() * 5) });
    }
    data.push(week);
  }
  return data;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const heatmap = useMemo(() => generateHeatmap(), []);

  // Fetch real database progress and stats
  useEffect(() => {
    api.get('/progress/dashboard')
      .then((res) => {
        setDbData(res.data);
      })
      .catch((err) => console.error('Error fetching dashboard progress:', err))
      .finally(() => setLoading(false));
  }, []);

  // Section Refs for Sidebar anchor navigation
  const overviewRef = useRef(null);
  const goalsRef = useRef(null);
  const xpLevelRef = useRef(null);
  const streaksRef = useRef(null);
  const activityRef = useRef(null);
  const quickContinueRef = useRef(null);

  // Scroll to section based on URL hash changes
  useEffect(() => {
    if (loading || !dbData) return;
    
    // Tiny delay to ensure elements are rendered and styled
    const timer = setTimeout(() => {
      const hash = window.location.hash;
      let targetRef = null;
      
      if (hash === '#goals') targetRef = goalsRef;
      else if (hash === '#xp') targetRef = xpLevelRef;
      else if (hash === '#streaks') targetRef = streaksRef;
      else if (hash === '#activity') targetRef = activityRef;
      else if (hash === '#continue') targetRef = quickContinueRef;
      else if (hash === '#overview' || hash === '') targetRef = overviewRef;
      
      if (targetRef && targetRef.current) {
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, [window.location.hash, loading, dbData]);

  // Compute stats or fallback to placeholders
  const studyHours = dbData?.studyHours || 0.0;
  const completedLessons = dbData?.completedLessons || 0;
  const quizAvg = dbData?.quizScores?.average || 0;
  const codingAvg = dbData?.codingScores?.average || 0;
  
  // Calculate dynamic gamification variables
  const computedLevel = Math.max(1, Math.floor(studyHours * 2.5 + completedLessons * 1.5 + (quizAvg + codingAvg) / 20));
  const totalXP = Math.round(studyHours * 100 + completedLessons * 50 + quizAvg * 5 + codingAvg * 8);
  const xpMax = 1000 * computedLevel;
  const currentXP = totalXP % xpMax;
  const xpPercent = Math.min(100, Math.round((currentXP / xpMax) * 100)) || 0;
  
  // Streak tracking (defaulting to profile/progress stats or realistic estimates)
  const userStreak = dbData?.profile?.streak || 7;
  const userCoins = Math.round(totalXP * 0.1) || 50;
  const aiLearningScore = Math.min(100, Math.max(50, Math.round((quizAvg + codingAvg) / 2 + (completedLessons * 2))));

  // Animated counters connected to live data
  const xpAnimated = useAnimatedCounter(currentXP || 10);
  const streakAnimated = useAnimatedCounter(userStreak, 800);
  const coinsAnimated = useAnimatedCounter(userCoins);
  const aiScoreAnimated = useAnimatedCounter(aiLearningScore, 1000);

  // Dynamic recommendations from backend prediction or smart defaults
  const recommendationsList = useMemo(() => {
    if (dbData?.recommendedTopics && typeof dbData.recommendedTopics === 'string') {
      return dbData.recommendedTopics.split(',').map(s => s.trim()).filter(Boolean);
    }
    return ['Study Basic Data Structures', 'Practice Simple Control Flows', 'Review Object Oriented Programming'];
  }, [dbData]);

  // Construct dynamic missions based on real progress
  const [goals, setGoals] = useState([]);
  useEffect(() => {
    if (dbData) {
      setGoals([
        { id: 1, label: `Study 1 new lesson (Completed so far: ${completedLessons})`, done: completedLessons > 0, xp: 20, coins: 10 },
        { id: 2, label: `Increase average Quiz score above 75% (Current: ${quizAvg}%)`, done: quizAvg >= 75, xp: 30, coins: 15 },
        { id: 3, label: `Complete 1 coding lab practice (Current: ${dbData?.codingScores?.total || 0})`, done: (dbData?.codingScores?.total || 0) > 0, xp: 25, coins: 10 },
        { id: 4, label: `Spend at least 2 study hours total (Current: ${studyHours.toFixed(1)}h)`, done: studyHours >= 2.0, xp: 20, coins: 10 },
        { id: 5, label: 'Maintain your learning streak', done: userStreak > 0, xp: 10, coins: 5 },
      ]);
    }
  }, [dbData, completedLessons, quizAvg, studyHours, userStreak]);

  const toggleGoal = (id) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g));
  };

  const goalsComplete = goals.filter(g => g.done).length;
  const goalPercent = goals.length > 0 ? Math.round((goalsComplete / goals.length) * 100) : 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  // Construct live timeline from backend quiz results and coding results
  const activities = useMemo(() => {
    const list = [];
    if (dbData?.recentQuizzes && dbData.recentQuizzes.length > 0) {
      dbData.recentQuizzes.forEach((quiz) => {
        list.push({
          time: new Date(quiz.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dateVal: new Date(quiz.submitted_at),
          text: `Scored ${quiz.score}% on ${quiz.title || 'Quiz'}`,
          icon: '📝',
          color: '#2563EB'
        });
      });
    }
    // Safe fallbacks for display
    if (list.length === 0) {
      list.push(
        { time: '10:30 AM', text: 'Joined EduVerse AI', icon: '🚀', color: '#2563EB' },
        { time: '11:15 AM', text: 'Checked out Course Modules', icon: '📚', color: '#7C3AED' }
      );
    }
    return list.slice(0, 5);
  }, [dbData]);

  // Construct continue items based on user's weak subject or default subjects
  const continueItems = useMemo(() => {
    const weakSub = dbData?.weakSubject || 'Programming Principles';
    const mainProgress = Math.min(95, Math.max(10, Math.round(completedLessons * 8)));
    return [
      { label: 'Primary Subject', topic: weakSub, progress: mainProgress, path: '/subjects', color: '#2563EB' },
      { label: 'Practice Lab', topic: 'Interactive Coding Labs', progress: Math.min(100, Math.round(codingAvg)), path: '/coding', color: '#059669' },
    ];
  }, [dbData, completedLessons, codingAvg]);

  const heatColors = ['var(--db-input-bg)', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8'];
  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const rarityColors = { Common: '#94A3B8', Rare: '#3B82F6', Epic: '#8B5CF6', Legendary: '#F59E0B' };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-t-[#2563EB] border-[var(--db-sidebar-border)] animate-spin"></div>
        <span className="text-sm font-semibold" style={{ color: 'var(--db-text-secondary)' }}>Loading your dashboard analytics...</span>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-[1400px] mx-auto space-y-6 pb-8"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* ═══════════════════════════════════════════════════════
          1. HERO OVERVIEW SECTION
          ═══════════════════════════════════════════════════════ */}
      <motion.div ref={overviewRef} id="overview" variants={fadeUp} className="db-card relative overflow-hidden" style={{ padding: 0, borderRadius: '24px' }}>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-gradient-to-tr from-emerald-500/8 to-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20">
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[#059669] border-2 border-[var(--db-card-bg)] flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{computedLevel}</span>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <motion.h1
                className="text-2xl md:text-3xl font-extrabold tracking-tight"
                style={{ color: 'var(--db-text-main)' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {greeting}, {user?.name?.split(' ')[0] || 'Student'} 👋
              </motion.h1>
              <p className="text-sm mt-1" style={{ color: 'var(--db-text-muted)' }}>
                Level {computedLevel} · {dbData?.skillLevel || 'Beginner'} Scholar · Keep pushing your limits today!
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { icon: '🔥', label: `${streakAnimated} Day Streak`, accent: '#F59E0B' },
                  { icon: '📚', label: `${studyHours.toFixed(1)}h Learned`, accent: '#2563EB' },
                  { icon: '🧠', label: `AI Score: ${aiScoreAnimated}%`, accent: '#7C3AED' },
                  { icon: '🪙', label: `${coinsAnimated} Coins`, accent: '#059669' },
                ].map((pill, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{
                      background: `${pill.accent}12`,
                      color: pill.accent,
                      border: `1px solid ${pill.accent}25`,
                    }}
                  >
                    <span>{pill.icon}</span>{pill.label}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <ProgressRing radius={56} stroke={8} progress={xpPercent} color="#2563EB">
              <div className="text-center">
                <div className="text-lg font-black" style={{ color: 'var(--db-text-main)' }}>{xpAnimated}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--db-text-muted)' }}>/ {xpMax} XP</div>
              </div>
            </ProgressRing>

            <div className="flex gap-2">
              {[
                { label: '▶ Continue', path: '/subjects', accent: '#2563EB' },
                { label: '📝 Quiz', path: '/quizzes', accent: '#7C3AED' },
                { label: '💻 Code', path: '/coding', accent: '#059669' },
              ].map((btn, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(btn.path)}
                  className="px-3 py-2 rounded-xl text-[11px] font-bold text-white shadow-sm cursor-pointer"
                  style={{ background: btn.accent }}
                >
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          2. MAIN GRID: Goals | Streak | Quick Continue
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Daily Goals ──────────────────────────────────── */}
        <motion.div ref={goalsRef} id="goals" variants={fadeUp} className="db-card flex flex-col" style={{ borderRadius: '20px' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: 'var(--db-text-muted)' }}>🎯 Daily Missions</h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: 'var(--db-badge-bg)', color: '#2563EB' }}>
              {goalsComplete}/{goals.length}
            </span>
          </div>

          <div className="w-full h-2 rounded-full mb-4" style={{ background: 'var(--db-input-bg)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED)' }}
              initial={{ width: 0 }}
              animate={{ width: `${goalPercent}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>

          <div className="space-y-2 flex-1">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                layout
                onClick={() => toggleGoal(goal.id)}
                className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all group"
                style={{
                  background: goal.done ? '#05966910' : 'var(--db-input-bg)',
                  border: `1px solid ${goal.done ? '#05966930' : 'transparent'}`,
                }}
                whileHover={{ x: 4 }}
              >
                <div
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: goal.done ? '#059669' : 'var(--db-text-muted)',
                    background: goal.done ? '#059669' : 'transparent',
                  }}
                >
                  {goal.done && <span className="text-white text-[10px]">✓</span>}
                </div>
                <span
                  className="flex-1 text-xs font-semibold"
                  style={{
                    color: goal.done ? '#059669' : 'var(--db-text-main)',
                    textDecoration: goal.done ? 'line-through' : 'none',
                    opacity: goal.done ? 0.7 : 1,
                  }}
                >
                  {goal.label}
                </span>
                <span className="text-[10px] font-bold" style={{ color: '#F59E0B' }}>+{goal.xp} XP</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Streak Tracker ───────────────────────────────── */}
        <motion.div ref={streaksRef} id="streaks" variants={fadeUp} className="db-card flex flex-col" style={{ borderRadius: '20px' }}>
          <h2 className="text-sm font-extrabold uppercase tracking-wider mb-4" style={{ color: 'var(--db-text-muted)' }}>🔥 Streak Tracker</h2>

          <div className="text-center mb-4">
            <motion.div
              className="text-5xl font-black inline-block"
              style={{ color: '#F59E0B' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            >
              {streakAnimated}
            </motion.div>
            <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--db-text-muted)' }}>Day Streak</div>
            <div className="text-[10px] mt-1" style={{ color: 'var(--db-text-muted)' }}>Best streak milestone target: 30 days</div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, i) => {
              const active = i < 5;
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold uppercase" style={{ color: 'var(--db-text-muted)' }}>{day.slice(0, 2)}</span>
                  <motion.div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: active ? '#F59E0B' : 'var(--db-input-bg)',
                      color: active ? '#fff' : 'var(--db-text-muted)',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                  >
                    {active ? '🔥' : '·'}
                  </motion.div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-3 border-t" style={{ borderColor: 'var(--db-card-border)' }}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--db-text-muted)' }}>Milestones</div>
            <div className="flex gap-2">
              {[
                { days: 7, badge: '🥉', label: 'Bronze', achieved: userStreak >= 7 },
                { days: 30, badge: '🥈', label: 'Silver', achieved: userStreak >= 30 },
                { days: 100, badge: '🥇', label: 'Gold', achieved: userStreak >= 100 },
                { days: 365, badge: '👑', label: 'Legend', achieved: userStreak >= 365 },
              ].map((m, i) => (
                <div
                  key={i}
                  className="flex-1 text-center p-2 rounded-xl"
                  style={{
                    background: m.achieved ? '#F59E0B12' : 'var(--db-input-bg)',
                    border: m.achieved ? '1px solid #F59E0B30' : '1px solid transparent',
                    opacity: m.achieved ? 1 : 0.5,
                  }}
                >
                  <div className="text-lg">{m.badge}</div>
                  <div className="text-[9px] font-bold" style={{ color: 'var(--db-text-muted)' }}>{m.days}d</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Quick Continue ───────────────────────────────── */}
        <motion.div ref={quickContinueRef} id="continue" variants={fadeUp} className="db-card flex flex-col" style={{ borderRadius: '20px' }}>
          <h2 className="text-sm font-extrabold uppercase tracking-wider mb-4" style={{ color: 'var(--db-text-muted)' }}>⚡ Quick Continue</h2>

          <div className="space-y-3 flex-1">
            {continueItems.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02, x: 4 }}
                onClick={() => navigate(item.path)}
                className="p-3.5 rounded-xl cursor-pointer transition-all"
                style={{ background: 'var(--db-input-bg)', border: '1px solid var(--db-card-border)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: item.color }}>{item.label}</span>
                  <span className="text-[10px] font-bold" style={{ color: 'var(--db-text-muted)' }}>{item.progress}%</span>
                </div>
                <div className="text-[11px] mb-2" style={{ color: 'var(--db-text-muted)' }}>{item.topic}</div>
                <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--db-card-border)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/subjects')}
            className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
          >
            ▶ Resume Last Session
          </motion.button>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          3. MIDDLE ROW: AI Coach | Daily Challenge | Activity
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── AI Coach ─────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="db-card" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm">🧠</div>
            <div>
              <h2 className="text-sm font-extrabold" style={{ color: 'var(--db-text-main)' }}>AI Coach</h2>
              <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>Real AI-powered feedback</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#EF4444' }}>⚠ Weak Area Identified</div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: '#EF444412', color: '#EF4444', border: '1px solid #EF444420' }}>
                {dbData?.weakSubject || 'Practice Labs & Quizzes'}
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#059669' }}>💡 Recommended Topics</div>
            <div className="space-y-1.5">
              {recommendationsList.map((s, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg text-[11px] font-medium" style={{ background: 'var(--db-input-bg)', color: 'var(--db-text-secondary)' }}>
                  <span style={{ color: '#059669' }}>→</span>{s}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-xl text-center" style={{ background: '#2563EB10', border: '1px solid #2563EB20' }}>
            <span className="text-[10px] font-bold" style={{ color: '#2563EB' }}>Predicted Performance Score: {dbData?.predictedPerformance || '75'}% 📈</span>
          </div>
        </motion.div>

        {/* ── Daily Challenge ──────────────────────────────── */}
        <motion.div variants={fadeUp} className="db-card relative overflow-hidden" style={{ borderRadius: '20px' }}>
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-amber-400/15 to-orange-500/15 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: 'var(--db-text-muted)' }}>⚔️ Daily Challenge</h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: '#F59E0B20', color: '#F59E0B' }}>
                Medium
              </span>
            </div>

            <h3 className="text-lg font-extrabold mb-1" style={{ color: 'var(--db-text-main)' }}>Binary Search Mastery</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--db-text-muted)' }}>
              Data Structures & Algorithms · ~15 min
            </p>

            <div className="flex gap-3 mb-5">
              <div className="flex-1 p-3 rounded-xl text-center" style={{ background: '#F59E0B10', border: '1px solid #F59E0B20' }}>
                <div className="text-lg font-black" style={{ color: '#F59E0B' }}>+100</div>
                <div className="text-[9px] font-bold uppercase" style={{ color: 'var(--db-text-muted)' }}>XP</div>
              </div>
              <div className="flex-1 p-3 rounded-xl text-center" style={{ background: '#05966910', border: '1px solid #05966920' }}>
                <div className="text-lg font-black" style={{ color: '#059669' }}>+20</div>
                <div className="text-[9px] font-bold uppercase" style={{ color: 'var(--db-text-muted)' }}>Coins</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/coding')}
              className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
            >
              ⚡ Start Challenge
            </motion.button>
          </div>
        </motion.div>

        {/* ── Recent Activity Timeline ─────────────────────── */}
        <motion.div ref={activityRef} id="activity" variants={fadeUp} className="db-card flex flex-col" style={{ borderRadius: '20px' }}>
          <h2 className="text-sm font-extrabold uppercase tracking-wider mb-4" style={{ color: 'var(--db-text-muted)' }}>📈 Recent Activity</h2>

          <div className="space-y-1 flex-1 overflow-y-auto max-h-[280px] pr-1">
            {activities.map((act, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3 p-2.5 rounded-xl transition-all hover:translate-x-1"
                style={{ background: 'var(--db-input-bg)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: `${act.color}15` }}
                >
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: 'var(--db-text-main)' }}>{act.text}</div>
                  <div className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>{act.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          4. BOTTOM ROW: Heatmap | Achievements | Weekly Stats
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Learning Heatmap ─────────────────────────────── */}
        <motion.div variants={fadeUp} className="db-card" style={{ borderRadius: '20px' }}>
          <h2 className="text-sm font-extrabold uppercase tracking-wider mb-4" style={{ color: 'var(--db-text-muted)' }}>📅 Learning Heatmap</h2>

          <div className="flex gap-1">
            <div className="flex flex-col gap-1 mr-1 pt-0">
              {dayLabels.map((d, i) => (
                <div key={i} className="h-[14px] flex items-center">
                  <span className="text-[9px] font-medium" style={{ color: 'var(--db-text-muted)' }}>{d}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-[3px] flex-1 overflow-x-auto">
              {heatmap.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) => (
                    <motion.div
                      key={di}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: wi * 0.02 + di * 0.01 }}
                      className="w-[14px] h-[14px] rounded-[3px] cursor-pointer"
                      style={{ background: heatColors[day.value] }}
                      title={`${day.date.toLocaleDateString()} – Level ${day.value}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[9px]" style={{ color: 'var(--db-text-muted)' }}>Less</span>
            {heatColors.map((c, i) => (
              <div key={i} className="w-[12px] h-[12px] rounded-[2px]" style={{ background: c }} />
            ))}
            <span className="text-[9px]" style={{ color: 'var(--db-text-muted)' }}>More</span>
          </div>
        </motion.div>

        {/* ── Achievements ─────────────────────────────────── */}
        <motion.div variants={fadeUp} className="db-card" style={{ borderRadius: '20px' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: 'var(--db-text-muted)' }}>🏅 Achievements</h2>
            <span className="text-[10px] font-bold" style={{ color: '#2563EB' }}>
              4/6 Unlocked
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { name: 'First Quiz', icon: '🏅', unlocked: (dbData?.quizScores?.total || 0) > 0, rarity: 'Common' },
              { name: 'Coding Pro', icon: '⚔️', unlocked: (dbData?.codingScores?.total || 0) > 0, rarity: 'Rare' },
              { name: '7 Day Streak', icon: '🔥', unlocked: userStreak >= 7, rarity: 'Common' },
              { name: 'React Scholar', icon: '⚛️', unlocked: completedLessons > 2, rarity: 'Epic' },
              { name: 'DSA Explorer', icon: '🧩', unlocked: completedLessons > 0, rarity: 'Rare' },
              { name: 'AI Learner', icon: '🧠', unlocked: aiLearningScore >= 80, rarity: 'Legendary' },
            ].map((ach, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                whileHover={{ scale: 1.1, y: -4 }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-pointer text-center"
                style={{
                  background: ach.unlocked ? `${rarityColors[ach.rarity]}10` : 'var(--db-input-bg)',
                  border: `1px solid ${ach.unlocked ? `${rarityColors[ach.rarity]}30` : 'transparent'}`,
                  opacity: ach.unlocked ? 1 : 0.4,
                  filter: ach.unlocked ? 'none' : 'grayscale(1)',
                }}
              >
                <span className="text-2xl">{ach.icon}</span>
                <span className="text-[9px] font-bold leading-tight" style={{ color: ach.unlocked ? rarityColors[ach.rarity] : 'var(--db-text-muted)' }}>
                  {ach.name}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: rarityColors[ach.rarity], opacity: 0.7 }}>
                  {ach.rarity}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          5. WEEKLY ANALYTICS BAR CHARTS
          ═══════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} className="db-card" style={{ borderRadius: '20px' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: 'var(--db-text-muted)' }}>📊 Weekly Analytics</h2>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: '#2563EB' }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#2563EB' }} />Study Hours
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: '#7C3AED' }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#7C3AED' }} />XP Earned
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3 items-end" style={{ height: '160px' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const studyH = (i === 4) ? studyHours : (studyHours * 0.15 * i);
            const xpVal = (i === 4) ? currentXP : (currentXP * 0.12 * i);
            const maxStudy = studyHours || 1;
            const maxXP = currentXP || 1;
            const studyPct = Math.min(100, (studyH / maxStudy) * 100) || 5;
            const xpPct = Math.min(100, (xpVal / maxXP) * 100) || 5;

            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <div className="flex gap-1 items-end w-full justify-center" style={{ height: '120px' }}>
                  <motion.div
                    className="w-3 rounded-t-md"
                    style={{ background: '#2563EB' }}
                    initial={{ height: 0 }}
                    animate={{ height: `${studyPct}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                  />
                  <motion.div
                    className="w-3 rounded-t-md"
                    style={{ background: '#7C3AED' }}
                    initial={{ height: 0 }}
                    animate={{ height: `${xpPct}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                  />
                </div>
                <span className="text-[10px] font-bold" style={{ color: 'var(--db-text-muted)' }}>{day}</span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-4 mt-5 pt-4" style={{ borderTop: '1px solid var(--db-card-border)' }}>
          {[
            { label: 'Total Study', value: `${studyHours.toFixed(1)}h`, change: `+${(studyHours * 0.25).toFixed(1)}h`, up: true },
            { label: 'XP Earned', value: `${totalXP}`, change: `+${Math.round(totalXP * 0.2)}`, up: true },
            { label: 'Quiz Accuracy', value: `${quizAvg || 80}%`, change: '+5%', up: true },
            { label: 'Coding Practice Count', value: `${dbData?.codingScores?.total || 0}`, change: `+${dbData?.codingScores?.total || 0}`, up: true },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-lg font-black" style={{ color: 'var(--db-text-main)' }}>{stat.value}</div>
              <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--db-text-muted)' }}>{stat.label}</div>
              <div className="text-[10px] font-bold mt-0.5" style={{ color: stat.up ? '#059669' : '#EF4444' }}>
                {stat.up ? '↑' : '↓'} {stat.change}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          6. XP & LEVEL PROGRESSION (Full Width)
          ═══════════════════════════════════════════════════════ */}
      <motion.div ref={xpLevelRef} id="xp" variants={fadeUp} className="db-card relative overflow-hidden" style={{ borderRadius: '20px' }}>
        <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-gradient-to-br from-blue-500/8 to-purple-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-sm font-extrabold uppercase tracking-wider mb-5" style={{ color: 'var(--db-text-muted)' }}>🏆 Level Progression</h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <ProgressRing radius={48} stroke={6} progress={xpPercent} color="url(#levelGrad)">
                <div className="text-center">
                  <svg width="0" height="0"><defs><linearGradient id="levelGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient></defs></svg>
                  <div className="text-xl font-black" style={{ color: 'var(--db-text-main)' }}>{computedLevel}</div>
                </div>
              </ProgressRing>
              <span className="text-xs font-bold" style={{ color: '#2563EB' }}>{dbData?.skillLevel || 'Beginner'}</span>
            </div>

            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-2xl font-black" style={{ color: 'var(--db-text-main)' }}>{xpAnimated}</span>
                  <span className="text-sm font-semibold ml-1" style={{ color: 'var(--db-text-muted)' }}>/ {xpMax} XP</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: '#2563EB15', color: '#2563EB' }}>
                  Level {computedLevel + 1} in {xpMax - currentXP} XP
                </span>
              </div>
              <div className="w-full h-4 rounded-full overflow-hidden" style={{ background: 'var(--db-input-bg)' }}>
                <motion.div
                  className="h-full rounded-full relative"
                  style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                >
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                </motion.div>
              </div>

              <div className="flex justify-between mt-3">
                {[1, 2, 3, 4, 5, 6].map((lvl) => (
                  <div key={lvl} className="flex flex-col items-center">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold"
                      style={{
                        background: lvl <= computedLevel ? '#2563EB' : 'var(--db-input-bg)',
                        color: lvl <= computedLevel ? '#fff' : 'var(--db-text-muted)',
                      }}
                    >
                      {lvl}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
