import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import heroCharacter from '../assets/hero_character.png';

// ── Animated Counter Hook ──────────────────────────────
function CountUp({ end, duration = 800 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    if (end === 0) {
      setCount(0);
      return;
    }
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{Math.round(count)}</span>;
}

// ── Circular Progress Ring ─────────────────────────
function CircularProgress({ percentage, size = 70, strokeWidth = 6, color = '#a78bfa' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center flex flex-col justify-center items-center">
        <span className="text-base font-black" style={{ color: '#FFFFFF' }}>{percentage}%</span>
        <span className="text-[7px] uppercase tracking-wider font-bold leading-none" style={{ color: 'rgba(255,255,255,0.7)' }}>Overall</span>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dbData, setDbData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real database progress and analytics
  useEffect(() => {
    Promise.all([
      api.get('/progress/dashboard'),
      api.get('/progress/analytics')
    ])
      .then(([dashRes, analyticsRes]) => {
        setDbData(dashRes.data);
        setAnalytics(analyticsRes.data);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, []);

  // All values derived from real API data
  const totalXP = dbData?.profile?.xp || 0;
  const userStreak = dbData?.profile?.streak || 0;
  const userCoins = Math.round(totalXP * 0.1);
  const completedLessons = dbData?.completedLessons || 0;
  const studyHours = dbData?.studyHours || 0;
  const quizAvg = dbData?.quizScores?.average || 0;
  const codingAvg = dbData?.codingScores?.average || 0;

  // Level computed from real data
  const computedLevel = Math.max(1, Math.floor(studyHours * 2.5 + completedLessons * 1.5 + (quizAvg + codingAvg) / 20));

  // Analytics-derived values
  const currentSubject = analytics?.currentSubject || 'Not Started';
  const currentTopicName = analytics?.currentTopicName || 'Not Started';
  const nextRecommendedTopic = analytics?.nextRecommendedTopicName || 'Start your first topic';
  const completedTopicsCount = analytics?.completedTopicsCount || 0;
  const totalTopicsCount = analytics?.totalTopicsCount || 0;
  const overallProgress = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;
  const subjectProgress = analytics?.subjectProgress || [];
  const weaknesses = analytics?.weaknesses || 'None yet';
  const strengths = analytics?.strengths || 'None yet';
  const studyTimeChart = analytics?.studyTimeStats || { labels: [], data: [] };
  const roadmap = analytics?.roadmap || [];

  // Recent activity from XP history or roadmap — derived from real data
  const recentQuizzes = dbData?.recentQuizzes || [];

  // Greeting by hour
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  // Dynamic daily missions based on real activity
  const missions = [
    { id: 1, label: 'Solve a coding problem', xp: 50, done: (analytics?.codingStats?.total || 0) > 0 },
    { id: 2, label: 'Complete a theory topic', xp: 30, done: completedLessons > 0 },
    { id: 3, label: 'Take a quiz', xp: 20, done: (analytics?.quizStats?.attempts || 0) > 0 }
  ];
  const completedMissionsCount = missions.filter(m => m.done).length;

  // Continue Learning Path from real roadmap data
  const continuePathSteps = (() => {
    if (!roadmap || roadmap.length === 0) return [];
    // Group by subject, pick last completed + in-progress + next 2 locked per subject
    const uniqueSubjects = [...new Set(roadmap.map(r => r.subject))];
    const steps = [];
    for (const sub of uniqueSubjects) {
      const subNodes = roadmap.filter(r => r.subject === sub);
      for (const node of subNodes) {
        steps.push(node);
      }
    }
    // Show the most relevant 5 nodes centered around in-progress
    const inProgressIdx = steps.findIndex(s => s.status === 'In Progress');
    if (inProgressIdx === -1) return steps.slice(0, 5);
    const start = Math.max(0, inProgressIdx - 2);
    return steps.slice(start, start + 5);
  })();

  // Recent Activity from real quiz data
  const recentActivity = recentQuizzes.map((q) => ({
    label: `Scored ${q.score}% on ${q.title || 'Quiz'}`,
    xp: `+${Math.round(q.score / 5)} XP`,
    time: new Date(q.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    icon: '📝'
  }));

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-t-violet-600 border-slate-700 animate-spin"></div>
        <span className="text-sm font-semibold text-slate-400">Analyzing student analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <span className="text-4xl">⚠️</span>
        <span className="text-sm font-semibold text-red-400">{error}</span>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 pr-2">
      
      {/* ── HERO OVERVIEW SECTION ── */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-950/60 bg-gradient-to-r from-[#0b071a] via-[#120c2b] to-[#060412]">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-12 gap-6 items-center p-6 md:p-8">
          {/* Hero text & action */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div>
              <h1 className="text-3xl font-extrabold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
                {greeting}, {user?.name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Keep learning, keep growing. You're doing great! 🚀</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider" style={{ color: '#a78bfa' }}>
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping"></span>
                Continue Learning
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{currentTopicName}</h3>
                <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{currentSubject}</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                  <span>Progress</span>
                  <span>{overallProgress}% Complete ({completedTopicsCount}/{totalTopicsCount} topics)</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/subjects')} 
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20 cursor-pointer"
                style={{ color: '#FFFFFF' }}
              >
                <span>▶ Resume Learning</span>
              </button>
              <button 
                className="p-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-all bg-white/5 cursor-pointer"
                style={{ color: '#FFFFFF' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Hero 3D character illustration */}
          <div className="lg:col-span-3 flex justify-center">
            <img 
              src={heroCharacter} 
              alt="Student developer illustration" 
              className="max-h-[176px] object-contain drop-shadow-[0_10px_20px_rgba(139,92,246,0.3)]"
            />
          </div>

          {/* Hero overall progress gauge with REAL weekly study chart */}
          <div className="lg:col-span-3 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex flex-col justify-between h-full space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold" style={{ color: '#FFFFFF' }}>Your Progress</h4>
                <p className="text-[10px]" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>This Week</p>
              </div>
              <CircularProgress percentage={overallProgress} size={70} strokeWidth={6} color="#c084fc" />
            </div>

            {/* Real sparkline from study_sessions weekly data */}
            <div className="space-y-1">
              <div className="h-10 w-full flex items-end justify-between px-1">
                {(studyTimeChart.data.length > 0 ? studyTimeChart.data : [0,0,0,0,0,0,0]).map((val, i) => {
                  const maxVal = Math.max(...studyTimeChart.data, 1);
                  const heightPct = Math.round((val / maxVal) * 100);
                  return (
                    <div key={i} className="w-1 bg-violet-500/20 rounded-full flex flex-col justify-end" style={{ height: '100%' }}>
                      <div className="bg-violet-400 rounded-full" style={{ height: `${heightPct}%`, minHeight: val > 0 ? '2px' : '0' }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider px-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {(studyTimeChart.labels.length > 0 ? studyTimeChart.labels : ['M','T','W','T','F','S','S']).map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
            </div>

            <button 
              onClick={() => navigate('/progress')} 
              className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold transition-all border border-white/10 flex items-center justify-center gap-1 cursor-pointer"
              style={{ color: '#FFFFFF' }}
            >
              View Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* ── STATISTICS CARDS ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total XP */}
        <div 
          className="p-4 rounded-2xl border flex items-center gap-4 hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm" style={{ backgroundColor: 'var(--db-badge-bg)', color: 'var(--db-text-accent)' }}>
            XP
          </div>
          <div className="text-left">
            <span className="text-[12px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--db-text-muted)' }}>Total XP</span>
            <span className="text-2xl font-bold block leading-none mt-0.5" style={{ color: 'var(--db-text-main)' }}><CountUp end={totalXP} /></span>
            <span className="text-[12px] font-bold block mt-1" style={{ color: '#059669' }}>Level {computedLevel}</span>
          </div>
        </div>

        {/* Day Streak */}
        <div 
          className="p-4 rounded-2xl border flex items-center gap-4 hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg animate-pulse" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)' }}>
            🔥
          </div>
          <div className="text-left">
            <span className="text-[12px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--db-text-muted)' }}>Day Streak</span>
            <span className="text-2xl font-bold block leading-none mt-0.5" style={{ color: 'var(--db-text-main)' }}><CountUp end={userStreak} /></span>
            <span className="text-[12px] font-bold block mt-1" style={{ color: 'var(--db-amber-accent)' }}>{userStreak > 0 ? 'Keep it going! 🔥' : 'Start today!'}</span>
          </div>
        </div>

        {/* Coins */}
        <div 
          className="p-4 rounded-2xl border flex items-center gap-4 hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}>
            🪙
          </div>
          <div className="text-left">
            <span className="text-[12px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--db-text-muted)' }}>Coins</span>
            <span className="text-2xl font-bold block leading-none mt-0.5" style={{ color: 'var(--db-text-main)' }}><CountUp end={userCoins} /></span>
            <span className="text-[12px] font-bold block mt-1" style={{ color: '#059669' }}>From {totalXP} XP earned</span>
          </div>
        </div>

        {/* Study Hours */}
        <div 
          className="p-4 rounded-2xl border flex items-center gap-4 hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }}>
            ⏱️
          </div>
          <div className="text-left">
            <span className="text-[12px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--db-text-muted)' }}>Study Hours</span>
            <span className="text-2xl font-bold block leading-none mt-0.5" style={{ color: 'var(--db-text-main)' }}>{studyHours.toFixed(1)}h</span>
            <span className="text-[12px] font-bold block mt-1" style={{ color: '#2563EB' }}>{completedLessons} topics done</span>
          </div>
        </div>
      </div>

      {/* ── MIDDLE ROW split GRID ── */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Today's Mission */}
        <div 
          className="rounded-2xl p-5 border text-left flex flex-col justify-between hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--db-text-main)' }}>Today's Mission</h3>
              <span 
                className="text-xs px-2.5 py-1 font-bold rounded-lg border"
                style={{ backgroundColor: 'var(--db-badge-bg)', color: 'var(--db-badge-text)', borderColor: 'var(--db-badge-border)' }}
              >
                {completedMissionsCount}/{missions.length} Completed
              </span>
            </div>
            
            <div className="space-y-2">
              {missions.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-2.5 rounded-xl border"
                  style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${item.done ? 'bg-emerald-600' : 'bg-slate-500'}`}>
                      {item.done ? '✓' : '·'}
                    </span>
                    <span 
                      className={`text-[14px] font-semibold ${item.done ? 'line-through' : ''}`}
                      style={{ color: item.done ? 'var(--db-text-muted)' : 'var(--db-text-secondary)', opacity: item.done ? 0.6 : 1 }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--db-text-accent)' }}>+{item.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => navigate('/subjects')} className="w-full mt-4 text-xs font-bold text-center hover:opacity-85 transition-all cursor-pointer" style={{ color: 'var(--db-text-accent)' }}>
            View All Missions →
          </button>
        </div>

        {/* Daily Challenge - connected to real API data */}
        <div 
          className="rounded-2xl p-5 border text-left flex flex-col justify-between hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--db-text-main)' }}>Daily Challenge</h3>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: 'var(--db-amber-accent)' }}>
                {analytics?.codingStats?.total || 0} Solved
              </span>
            </div>

            <div>
              <h4 className="text-base font-extrabold" style={{ color: 'var(--db-text-main)' }}>
                {nextRecommendedTopic !== 'All Completed! Keep Practicing.' ? `Practice: ${currentSubject}` : 'All Caught Up! 🎉'}
              </h4>
              <p className="text-[14px] mt-1 leading-relaxed" style={{ color: 'var(--db-text-secondary)' }}>
                {analytics?.aiSummary ? analytics.aiSummary.substring(0, 120) + '...' : 'Complete topics and quizzes to unlock AI-powered challenge recommendations.'}
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 py-2 px-3 text-center rounded-xl border" style={{ backgroundColor: 'var(--db-badge-bg)', borderColor: 'var(--db-badge-border)' }}>
                <span className="text-sm font-bold block" style={{ color: 'var(--db-text-accent)' }}>+{Math.round((analytics?.codingStats?.solved || 0) * 50)}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: 'var(--db-text-muted)' }}>XP Earned</span>
              </div>
              <div className="flex-1 py-2 px-3 text-center rounded-xl border" style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.15)' }}>
                <span className="text-sm font-bold block" style={{ color: 'var(--db-amber-accent)' }}>{analytics?.codingStats?.successRate || 0}%</span>
                <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: 'var(--db-text-muted)' }}>Success Rate</span>
              </div>
            </div>
          </div>

          <button onClick={() => navigate('/practice')} className="w-full mt-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer">
            &lt;/&gt; Start Challenge
          </button>
        </div>

        {/* AI Coach - connected to real weaknesses/strengths */}
        <div 
          className="rounded-2xl p-5 border text-left flex flex-col justify-between hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🤖</span>
                <h3 className="text-[16px] font-bold" style={{ color: 'var(--db-text-main)' }}>AI Coach</h3>
              </div>
              <span 
                className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border"
                style={{ backgroundColor: 'var(--db-badge-bg)', color: 'var(--db-badge-text)', borderColor: 'var(--db-badge-border)' }}
              >
                Live
              </span>
            </div>

            <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <p className="text-[14px] leading-relaxed font-semibold" style={{ color: 'var(--db-text-main)' }}>
                {nextRecommendedTopic !== 'All Completed! Keep Practicing.'
                  ? <>I recommend focusing on <span style={{ color: 'var(--db-text-accent)' }}>{nextRecommendedTopic}</span> next!</>
                  : <>Amazing work! You've completed all available topics. Keep practicing to maintain your skills! 🎯</>
                }
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--db-text-muted)' }}>Performance Areas</p>
              <div className="flex flex-wrap gap-1.5">
                <span 
                  className="px-2.5 py-1 border text-[12px] font-bold rounded-lg"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                >
                  ✓ {strengths}
                </span>
                <span 
                  className="px-2.5 py-1 border text-[12px] font-bold rounded-lg"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                >
                  ↑ {weaknesses}
                </span>
              </div>
              {/* Subject breakdown from real data */}
              <div className="space-y-1 mt-2">
                {subjectProgress.slice(0, 3).map((sp, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold w-16 truncate" style={{ color: 'var(--db-text-muted)' }}>{sp.name}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-sidebar-border)' }}>
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${sp.percentage}%` }} />
                    </div>
                    <span className="text-[10px] font-bold w-8 text-right" style={{ color: 'var(--db-text-accent)' }}>{sp.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/ai-tutor')} 
            className="w-full mt-4 py-2 border rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
            style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-secondary)' }}
          >
            ✨ Chat with AI Coach →
          </button>
        </div>
      </div>

      {/* ── BOTTOM ROW: Continue Learning Path & Recent Activity ── */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Continue Learning Path — from real roadmap */}
        <div 
          className="md:col-span-2 rounded-2xl p-5 border text-left flex flex-col justify-between hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--db-text-main)' }}>Continue Learning Path</h3>
              <button onClick={() => navigate('/subjects')} className="text-xs font-bold hover:opacity-85 transition-all cursor-pointer" style={{ color: 'var(--db-text-accent)' }}>
                View Roadmap →
              </button>
            </div>

            {/* Path timeline from real roadmap */}
            <div className="relative flex justify-between items-center py-4 px-2">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0" style={{ backgroundColor: 'var(--db-sidebar-border)' }} />
              {continuePathSteps.length > 0 ? continuePathSteps.map((step, idx) => {
                const getStepStyle = () => {
                  if (step.status === 'Completed') return { bg: 'bg-emerald-600 text-white ring-4 ring-emerald-500/20', nameCol: 'var(--db-text-main)' };
                  if (step.status === 'In Progress') return { bg: 'bg-violet-600 text-white ring-4 ring-violet-500/20 font-bold', nameCol: 'var(--db-text-main)' };
                  return { bg: 'bg-slate-700 text-slate-400', nameCol: 'var(--db-text-muted)' };
                };
                const styleObj = getStepStyle();
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${styleObj.bg}`}>
                      {step.status === 'Completed' ? '✓' : idx + 1}
                    </div>
                    <span className="text-[11px] font-bold whitespace-nowrap max-w-[80px] truncate text-center" style={{ color: styleObj.nameCol }}>{step.title}</span>
                    <span className="text-[8px] font-extrabold uppercase tracking-widest leading-none" style={{ color: 'var(--db-text-muted)' }}>{step.subject}</span>
                  </div>
                );
              }) : (
                <div className="w-full text-center py-4 z-10">
                  <span className="text-sm font-semibold" style={{ color: 'var(--db-text-muted)' }}>Start a topic to see your learning path!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity — from real quiz results */}
        <div 
          className="rounded-2xl p-5 border text-left flex flex-col justify-between hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--db-text-main)' }}>Recent Activity</h3>
              <button onClick={() => navigate('/progress')} className="text-xs font-bold hover:text-white transition-all cursor-pointer" style={{ color: 'var(--db-text-muted)' }}>
                View All
              </button>
            </div>

            <div className="space-y-2">
              {recentActivity.length > 0 ? recentActivity.slice(0, 3).map((act, i) => (
                <div 
                  key={i} 
                  className="flex justify-between items-center p-2 rounded-xl border"
                  style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm">{act.icon}</span>
                    <div className="truncate text-left">
                      <span className="text-[12px] font-bold block leading-none" style={{ color: 'var(--db-text-main)' }}>{act.label}</span>
                      <span className="text-[10px] block mt-0.5" style={{ color: 'var(--db-text-muted)' }}>{act.time}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 shrink-0">{act.xp}</span>
                </div>
              )) : (
                <div className="text-center py-6">
                  <span className="text-3xl block mb-2">📊</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--db-text-muted)' }}>No activity yet. Take a quiz to get started!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
