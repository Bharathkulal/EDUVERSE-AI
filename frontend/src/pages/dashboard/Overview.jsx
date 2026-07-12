import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import heroCharacter from '../../assets/hero_character.png';
import MlPredictionCard from '../../components/MlPredictionCard';

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
function CircularProgress({ percentage, size = 70, strokeWidth = 6, color = 'var(--db-text-accent)' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--db-sidebar-border)"
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
        <span className="text-base font-black" style={{ color: 'var(--db-text-main)' }}>{percentage}%</span>
        <span className="text-[7px] uppercase tracking-wider font-bold leading-none" style={{ color: 'var(--db-text-muted)' }}>Overall</span>
      </div>
    </div>
  );
}

export default function Overview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dbData, setDbData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [mlDashboard, setMlDashboard] = useState(null);
  const [goals, setGoals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalPriority, setNewGoalPriority] = useState('medium');
  const [addingGoal, setAddingGoal] = useState(false);
  const [generatingGoals, setGeneratingGoals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Heatmap click details states
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState(null);
  const [selectedHeatmapActivities, setSelectedHeatmapActivities] = useState([]);
  const [fetchingHeatmapDetails, setFetchingHeatmapDetails] = useState(false);
  const [showHeatmapModal, setShowHeatmapModal] = useState(false);

  const handleHeatmapDayClick = async (day) => {
    if (day.count === 0) return; // ignore if zero count
    setSelectedHeatmapDay(day.date);
    setFetchingHeatmapDetails(true);
    setShowHeatmapModal(true);
    
    try {
      const res = await api.get(`/progress/heatmap/details?date=${day.fullDate}`);
      setSelectedHeatmapActivities(res.data.activities || []);
    } catch (err) {
      console.error('Error fetching heatmap details:', err);
      setSelectedHeatmapActivities([]);
    } finally {
      setFetchingHeatmapDetails(false);
    }
  };

  // Fetch real database progress and analytics
  const fetchAllData = () => {
    Promise.all([
      api.get('/progress/dashboard'),
      api.get('/progress/analytics'),
      api.get('/progress/goals'),
      api.get('/progress/leaderboard'),
      api.get('/progress/heatmap'),
      api.get('/predictions/modules/dashboard')
    ])
      .then(([dashRes, analyticsRes, goalsRes, leaderboardRes, heatmapRes, mlDashboardRes]) => {
        setDbData(dashRes.data);
        setAnalytics(analyticsRes.data);
        setGoals(goalsRes.data);
        setLeaderboard(leaderboardRes.data.leaderboard || []);
        setHeatmapData(heatmapRes.data.heatmapData || []);
        setMlDashboard(mlDashboardRes.data);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handle Goal CRUD
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || addingGoal) return;
    setAddingGoal(true);
    try {
      const res = await api.post('/progress/goals', {
        title: newGoalTitle,
        priority: newGoalPriority,
        xp_reward: newGoalPriority === 'high' ? 40 : newGoalPriority === 'medium' ? 20 : 10
      });
      setGoals([res.data, ...goals]);
      setNewGoalTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingGoal(false);
    }
  };

  const handleToggleGoal = async (id, currentCompleted) => {
    try {
      const res = await api.put(`/progress/goals/${id}`, {
        completed: !currentCompleted
      });
      setGoals(goals.map(g => g.id === id ? res.data : g));
      // Refresh user stats (XP, level) in background
      const dashRes = await api.get('/progress/dashboard');
      setDbData(dashRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.delete(`/progress/goals/${id}`);
      setGoals(goals.filter(g => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAiGoals = async () => {
    if (generatingGoals) return;
    setGeneratingGoals(true);
    try {
      const res = await api.post('/progress/goals/ai-generate');
      setGoals([...res.data.goals, ...goals]);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingGoals(false);
    }
  };

  // Values derived from database APIs
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
  const recentQuizzes = dbData?.recentQuizzes || [];

  // Heatmap generation for last 60 days
  const recentHeatmapDays = (() => {
    const days = [];
    const today = new Date();
    for (let i = 59; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const activity = heatmapData.find(h => {
        const itemDate = new Date(h.date).toISOString().split('T')[0];
        return itemDate === dateStr;
      });
      days.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dateStr,
        count: activity ? activity.count : 0
      });
    }
    return days;
  })();

  // Greeting by hour
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
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

  const isDataAvailable = totalXP > 0 || completedTopicsCount > 0 || recentQuizzes.length > 0;

  return (
    <div className="space-y-6 pb-12 pr-2 text-left">

      {/* ── HERO OVERVIEW SECTION ── */}
      <div
        className="relative overflow-hidden rounded-3xl border p-6 md:p-8"
        style={{ backgroundColor: 'var(--db-continue-bg)', borderColor: 'var(--db-continue-border)' }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div>
              <h1 className="text-3xl font-extrabold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
                {greeting}, {user?.name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--db-text-muted)' }}>Welcome to your AI Learning Command Center. Here is your dashboard overview.</p>
            </div>

            {completedTopicsCount > 0 ? (
              <div
                className="p-4 rounded-2xl border space-y-3"
                style={{ 
                  backgroundColor: 'var(--db-card-bg)', 
                  borderColor: 'var(--db-sidebar-border)' 
                }}
              >
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--db-continue-text)' }}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  Continue Learning
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>{currentTopicName}</h3>
                  <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>{currentSubject}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold" style={{ color: 'var(--db-text-muted)' }}>
                    <span>Progress</span>
                    <span>{overallProgress}% Complete ({completedTopicsCount}/{totalTopicsCount} topics)</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-sidebar-border)' }}>
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="p-4 rounded-2xl border space-y-2"
                style={{ 
                  backgroundColor: 'var(--db-card-bg)', 
                  borderColor: 'var(--db-sidebar-border)' 
                }}
              >
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--db-continue-text)' }}>
                  <span>⚡ Get Started</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--db-text-muted)' }}>Start exploring your learning modules to begin tracking your progress!</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/subjects')}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20 cursor-pointer text-white"
              >
                <span>▶ Resume Learning</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 flex justify-center items-end self-stretch pt-4 lg:pt-0">
            <img
              src={heroCharacter}
              alt="Student developer illustration"
              className="max-h-[240px] md:max-h-[260px] object-contain drop-shadow-[0_10px_25px_rgba(139,92,246,0.25)] transition-all duration-300 hover:scale-105"
            />
          </div>

          {/* Hero overall progress gauge */}
          <div
            className="lg:col-span-3 p-5 rounded-2xl border flex flex-col justify-between h-full space-y-4"
            style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold" style={{ color: 'var(--db-text-main)' }}>Your Progress</h4>
                <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>Overall Course</p>
              </div>
              <CircularProgress percentage={overallProgress} size={70} strokeWidth={6} color="var(--db-text-accent)" />
            </div>

            {/* Sparkline from study weekly data */}
            <div className="space-y-1">
              <div className="h-10 w-full flex items-end justify-between px-1">
                {(studyTimeChart.data.length > 0 ? studyTimeChart.data : [0, 0, 0, 0, 0, 0, 0]).map((val, i) => {
                  const maxVal = Math.max(...studyTimeChart.data, 1);
                  const heightPct = Math.round((val / maxVal) * 100);
                  return (
                    <div key={i} className="w-1 rounded-full flex flex-col justify-end" style={{ height: '100%', backgroundColor: 'var(--db-sidebar-border)' }}>
                      <div className="bg-violet-400 rounded-full" style={{ height: `${heightPct}%`, minHeight: val > 0 ? '2px' : '0' }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider px-0.5" style={{ color: 'var(--db-text-muted)' }}>
                {(studyTimeChart.labels.length > 0 ? studyTimeChart.labels : ['M', 'T', 'W', 'T', 'F', 'S', 'S']).map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/progress')}
              className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold transition-all border flex items-center justify-center gap-1 cursor-pointer"
              style={{ color: 'var(--db-text-main)', borderColor: 'var(--db-sidebar-border)' }}
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
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--db-text-muted)' }}>Total XP</span>
            <span className="text-2xl font-bold block leading-none mt-0.5" style={{ color: 'var(--db-text-main)' }}><CountUp end={totalXP} /></span>
            <span className="text-[12px] font-bold block mt-1 text-emerald-500">Level {computedLevel}</span>
          </div>
        </div>

        {/* Day Streak */}
        <div
          className="p-4 rounded-2xl border flex items-center gap-4 hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg animate-pulse" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: 'var(--db-amber-accent)' }}>
            🔥
          </div>
          <div>
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
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
            🪙
          </div>
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--db-text-muted)' }}>Coins</span>
            <span className="text-2xl font-bold block leading-none mt-0.5" style={{ color: 'var(--db-text-main)' }}><CountUp end={userCoins} /></span>
            <span className="text-[12px] font-bold block mt-1 text-emerald-500">Earned</span>
          </div>
        </div>

        {/* Study Hours */}
        <div
          className="p-4 rounded-2xl border flex items-center gap-4 hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
            ⏱️
          </div>
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--db-text-muted)' }}>Study Hours</span>
            <span className="text-2xl font-bold block leading-none mt-0.5" style={{ color: 'var(--db-text-main)' }}>{studyHours.toFixed(1)}h</span>
            <span className="text-[12px] font-bold block mt-1 text-blue-500">{completedLessons} topics done</span>
          </div>
        </div>
      </div>

      {/* ── 🧠 AI + MACHINE LEARNING COMMAND CENTER ── */}
      <div 
        className="p-6 rounded-3xl border text-left space-y-6"
        style={{
          background: 'var(--db-card-bg)',
          borderColor: 'var(--db-sidebar-border)',
          boxShadow: 'var(--db-card-shadow)'
        }}
      >
        <div className="flex justify-between items-center flex-wrap gap-3 border-b pb-4" style={{ borderColor: 'var(--db-sidebar-border)' }}>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
              🧠 AI + Machine Learning Command Center
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--db-text-muted)' }}>Real-time feature engineering & model prediction from active learner parameters.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-500 border-blue-500/20">
              Active Model: {mlDashboard?.modelVersion || 'edu-core-v24'}
            </span>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              Confidence: {mlDashboard?.confidence || '94.2'}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Learning Score */}
          <MlPredictionCard 
            title="Learning Score" 
            loading={!mlDashboard} 
            confidence={mlDashboard?.confidence} 
            modelVersion={mlDashboard?.modelVersion}
            lastUpdated={mlDashboard?.lastUpdated}
            icon="🏆"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold" style={{ color: 'var(--db-text-main)' }}>{mlDashboard?.prediction?.learningScore || '75.2'}</span>
                <span className="text-xs block mt-1" style={{ color: 'var(--db-text-muted)' }}>Adaptive capability index</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center font-bold text-xs" style={{ color: 'var(--db-text-main)' }}>
                {Math.round(mlDashboard?.prediction?.learningScore || 75)}%
              </div>
            </div>
          </MlPredictionCard>

          {/* AI Readiness Score */}
          <MlPredictionCard 
            title="AI Readiness" 
            loading={!mlDashboard} 
            confidence={mlDashboard?.confidence} 
            modelVersion={mlDashboard?.modelVersion}
            lastUpdated={mlDashboard?.lastUpdated}
            icon="⚡"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-extrabold" style={{ color: 'var(--db-text-main)' }}>{mlDashboard?.prediction?.aiReadiness || '82.0'}</span>
                <span className="text-xs font-bold text-blue-500">Match score</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${mlDashboard?.prediction?.aiReadiness || 82}%` }} />
              </div>
            </div>
          </MlPredictionCard>

          {/* Knowledge Score */}
          <MlPredictionCard 
            title="Knowledge Score" 
            loading={!mlDashboard} 
            confidence={mlDashboard?.confidence} 
            modelVersion={mlDashboard?.modelVersion}
            lastUpdated={mlDashboard?.lastUpdated}
            icon="📚"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold" style={{ color: 'var(--db-text-main)' }}>{mlDashboard?.prediction?.knowledgeScore || '68.5'}</span>
                <span className="text-xs block mt-1" style={{ color: 'var(--db-text-muted)' }}>Concepts mastery rate</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-violet-500 flex items-center justify-center font-bold text-xs" style={{ color: 'var(--db-text-main)' }}>
                {Math.round(mlDashboard?.prediction?.knowledgeScore || 68)}%
              </div>
            </div>
          </MlPredictionCard>

          {/* Productivity & Focus */}
          <MlPredictionCard 
            title="Daily Productivity" 
            loading={!mlDashboard} 
            confidence={mlDashboard?.confidence} 
            modelVersion={mlDashboard?.modelVersion}
            lastUpdated={mlDashboard?.lastUpdated}
            icon="📈"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-extrabold" style={{ color: 'var(--db-text-main)' }}>{mlDashboard?.prediction?.dailyProductivityScore || '91'}%</span>
                <span className="text-xs font-bold text-emerald-500">High efficiency</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${mlDashboard?.prediction?.dailyProductivityScore || 91}%` }} />
              </div>
            </div>
          </MlPredictionCard>
        </div>

        {/* Prediction Insights Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Chart/Forecast */}
          <div className="lg:col-span-2 p-5 rounded-2xl border text-left flex flex-col justify-between" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">Weekly Performance Forecast</h4>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--db-text-muted)' }}>ML predicted learning score capability for next 7 days.</p>
            </div>
            
            <div className="h-28 w-full flex items-end justify-between px-2 pt-4">
              {(mlDashboard?.prediction?.weeklyPerformanceForecast || []).map((forecast, i) => {
                const heightPct = Math.round((forecast.score / 100) * 100);
                return (
                  <div key={i} className="w-4 flex flex-col items-center gap-1.5">
                    <div className="w-2.5 rounded-full flex flex-col justify-end" style={{ height: '70px', backgroundColor: 'var(--db-sidebar-border)' }}>
                      <div className="bg-blue-500 rounded-full" style={{ height: `${heightPct}%`, minHeight: '2px' }} />
                    </div>
                    <span className="text-[8px] font-bold" style={{ color: 'var(--db-text-muted)' }}>{forecast.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Metrics & Recommendation */}
          <div className="p-5 rounded-2xl border text-left flex flex-col justify-between space-y-4" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--db-text-muted)' }}>Burnout Risk</span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full border ${mlDashboard?.prediction?.burnoutRisk > 50 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                  {mlDashboard?.prediction?.burnoutRisk || '22'}% Risk
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--db-text-muted)' }}>Completion Probability</span>
                <span className="text-xs font-extrabold" style={{ color: 'var(--db-text-main)' }}>
                  {mlDashboard?.prediction?.completionProbability || '94.5'}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold" style={{ color: 'var(--db-text-muted)' }}>Learning Trend</span>
                <span className="text-xs font-extrabold text-blue-500 flex items-center gap-1">
                  ↗ {mlDashboard?.prediction?.learningTrend || 'Increasing'}
                </span>
              </div>
            </div>
            
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <span className="text-[9px] text-blue-500 font-extrabold uppercase font-mono block">Smart Recommendation</span>
              <p className="text-[10px] mt-1" style={{ color: 'var(--db-text-main)' }}>{mlDashboard?.prediction?.smartRecommendation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MIDDLE ROW split GRID ── */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Interactive Daily Goals (Database Linked) */}
        <div
          className="rounded-2xl p-5 border flex flex-col justify-between hover:shadow-md transition-all md:col-span-2"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--db-text-main)' }}>Daily Learning Goals 🎯</h3>
              
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleGenerateAiGoals}
                  disabled={generatingGoals}
                  className="text-xs px-3 py-1.5 bg-violet-600/20 text-violet-400 border border-violet-500/30 rounded-xl font-bold hover:bg-violet-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {generatingGoals ? 'Generating...' : '✨ Auto-Generate'}
                </button>
              </div>
            </div>

            {/* Goals creation input */}
            <form onSubmit={handleAddGoal} className="flex gap-2">
              <input
                type="text"
                placeholder="What do you want to learn today?"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className="flex-1 border text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-violet-500"
                style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
              />
              <select
                value={newGoalPriority}
                onChange={(e) => setNewGoalPriority(e.target.value)}
                className="border text-sm rounded-xl px-2 focus:outline-none focus:border-violet-500"
                style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-secondary)' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                type="submit"
                disabled={addingGoal}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                Add
              </button>
            </form>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {goals.length > 0 ? (
                goals.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border"
                    style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        disabled={item.is_ai}
                        onChange={() => !item.is_ai && handleToggleGoal(item.id, item.completed)}
                        className={`w-4 h-4 rounded text-violet-600 bg-slate-700 border-slate-600 focus:ring-violet-500 focus:ring-2 ${item.is_ai ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                      />
                      <span
                        className={`text-sm font-semibold ${item.completed ? 'line-through opacity-50' : ''}`}
                        style={{ color: 'var(--db-text-secondary)' }}
                      >
                        {item.title} {item.is_ai && <span className="text-[10px] text-violet-400 font-bold ml-1.5 px-2 py-0.5 rounded-full bg-violet-600/10 border border-violet-500/20">🤖 AI Tracked</span>}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wider ${item.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                          item.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-blue-500/10 text-blue-400'
                        }`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-violet-400">+{item.xp_reward} XP</span>
                      <button
                        onClick={() => handleDeleteGoal(item.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors text-sm cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs" style={{ color: 'var(--db-text-muted)' }}>
                  No goals set for today. Type a goal above or hit Auto-Generate!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div
          className="rounded-2xl p-5 border flex flex-col justify-between hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🤖</span>
                <h3 className="text-[16px] font-bold" style={{ color: 'var(--db-text-main)' }}>AI Recommendations</h3>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border" style={{ backgroundColor: 'var(--db-badge-bg)', color: 'var(--db-badge-text)', borderColor: 'var(--db-badge-border)' }}>
                AI Coach
              </span>
            </div>

            {isDataAvailable ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--db-text-secondary)' }}>
                    Based on your analytics, you should focus on <span className="font-semibold" style={{ color: 'var(--db-text-accent)' }}>{nextRecommendedTopic}</span> next!
                  </p>
                </div>
                <div className="text-xs border-t pt-3" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <p className="font-bold uppercase text-[9px] mb-1" style={{ color: 'var(--db-text-muted)' }}>Coach Summary</p>
                  <p className="italic leading-normal" style={{ color: 'var(--db-text-main)' }}>
                    "{analytics?.aiSummary || 'Keep doing quizzes and study modules to get customized feedback.'}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-3xl block mb-2">📊</span>
                <span className="text-xs font-semibold block" style={{ color: 'var(--db-text-muted)' }}>No Data Available Yet</span>
                <p className="text-[11px] mt-1 max-w-[200px] mx-auto" style={{ color: 'var(--db-text-muted)' }}>Complete a quiz or log study time to generate dynamic AI coaching recommendations!</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/ai-tutor')}
            className="w-full mt-4 py-2 border rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
            style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-secondary)' }}
          >
            ✨ Consult AI Coach →
          </button>
        </div>
      </div>

      {/* ── BOTTOM GRID: Heatmap, Subject Performance & Leaderboard ── */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Streak Heatmap widget */}
        <div
          className="rounded-2xl p-5 border flex flex-col justify-between hover:shadow-md transition-all md:col-span-2"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--db-text-main)' }}>Streak & Activity Heatmap</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--db-text-muted)' }}>Your learning commitment over the last 60 days</p>
            </div>

            <div className="flex flex-wrap gap-1.5 py-3 justify-start max-w-full">
              {recentHeatmapDays.map((day, idx) => (
                <div
                  key={idx}
                  onClick={() => handleHeatmapDayClick(day)}
                  className={`w-[20px] h-[20px] rounded-[4px] relative group border transition-all duration-200 hover:scale-110 ${day.count === 0 ? 'bg-[var(--db-input-bg)] border-[var(--db-sidebar-border)] opacity-60 cursor-default' :
                      'cursor-pointer ' + (day.count === 1 ? 'bg-violet-400/30 border-violet-400/20' :
                        day.count <= 3 ? 'bg-violet-500/60 border-violet-500/30' :
                          'bg-violet-600 border-violet-600')
                    }`}
                >
                  {/* Tooltip */}
                  <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap z-30 border border-slate-800 shadow-md"
                    style={{ color: '#ffffff', backgroundColor: '#0f172a' }}
                  >
                    {day.date}: {day.count} action{day.count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 text-[10px] font-bold border-t pt-3" style={{ borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-muted)' }}>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)]"></span> No Activity</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-violet-400/30 border border-violet-400/20"></span> Light</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-violet-500/60 border border-violet-500/30"></span> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-violet-600 border border-violet-600"></span> High</span>
            </div>
          </div>
        </div>

        {/* Real-time Leaderboard widget */}
        <div
          className="rounded-2xl p-5 border flex flex-col justify-between hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--db-text-main)' }}>Top Students Leaderboard</h3>
              <button
                onClick={() => navigate('/quizzes')}
                className="text-xs font-bold hover:opacity-85 transition-all cursor-pointer"
                style={{ color: 'var(--db-text-accent)' }}
              >
                View Hub
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, 5).map((row, idx) => (
                  <div
                    key={row.id}
                    className={`flex justify-between items-center p-2 rounded-xl border ${row.isCurrentUser
                        ? 'bg-violet-600/10 border-violet-500/40 text-violet-200 font-bold'
                        : ''
                      }`}
                    style={{
                      backgroundColor: row.isCurrentUser ? '' : 'var(--db-input-bg)',
                      borderColor: 'var(--db-sidebar-border)',
                      color: 'var(--db-text-secondary)'
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                          idx === 1 ? 'bg-slate-400/20 text-slate-500' :
                            idx === 2 ? 'bg-amber-600/20 text-amber-700' :
                              'bg-slate-800/10 text-slate-500'
                        }`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold truncate max-w-[100px]" style={{ color: 'var(--db-text-main)' }}>{row.name}</span>
                      {row.isCurrentUser && <span className="text-[8px] bg-violet-600 text-white px-1 rounded uppercase">You</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>🔥 {row.streak}d</span>
                      <span className="text-xs font-bold text-emerald-500">{row.totalXp} XP</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs" style={{ color: 'var(--db-text-muted)' }}>
                  No students ranked yet. Start earning XP to rank up!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ADDITIONAL STATS: Subject Performance & Recent Activity ── */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Subject Performance */}
        <div
          className="rounded-2xl p-5 border flex flex-col justify-between hover:shadow-md transition-all md:col-span-2"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="space-y-4">
            <h3 className="text-[16px] font-bold" style={{ color: 'var(--db-text-main)' }}>Curriculum Subject Performance</h3>

            {subjectProgress.length > 0 ? (
              <div className="space-y-3">
                {subjectProgress.map((sp, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span style={{ color: 'var(--db-text-secondary)' }}>{sp.name}</span>
                      <span style={{ color: 'var(--db-text-accent)' }}>{sp.percentage}% ({sp.completedTopics}/{sp.totalTopics} topics)</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-sidebar-border)' }}>
                      <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full" style={{ width: `${sp.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-xs font-semibold block" style={{ color: 'var(--db-text-muted)' }}>No Data Available Yet</span>
                <p className="text-[11px] mt-1 max-w-[240px] mx-auto" style={{ color: 'var(--db-text-muted)' }}>Complete subject topics in the Learn section to populate this curriculum performance tracker.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div
          className="rounded-2xl p-5 border flex flex-col justify-between hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--db-text-main)' }}>Recent Activity Timeline</h3>
              <button
                onClick={() => navigate('/progress')}
                className="text-xs font-bold hover:text-white transition-all cursor-pointer"
                style={{ color: 'var(--db-text-muted)' }}
              >
                All Stats
              </button>
            </div>

            <div className="space-y-2">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 3).map((act, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-2 rounded-xl border"
                    style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm">{act.icon}</span>
                      <div className="truncate text-left">
                        <span className="text-[12px] font-bold block leading-none" style={{ color: 'var(--db-text-main)' }}>{act.label}</span>
                        <span className="text-[10px] block mt-1" style={{ color: 'var(--db-text-muted)' }}>{act.time}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-500 shrink-0">{act.xp}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <span className="text-3xl block mb-2">📊</span>
                  <span className="text-xs font-semibold block" style={{ color: 'var(--db-text-muted)' }}>No Data Available Yet</span>
                  <p className="text-[11px] mt-1 max-w-[180px] mx-auto" style={{ color: 'var(--db-text-muted)' }}>Take quizzes or solve coding problems to generate activity events.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Details Heatmap Modal */}
      <AnimatePresence>
        {showHeatmapModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4"
              style={{
                backgroundColor: 'var(--db-card-bg)',
                borderColor: 'var(--db-sidebar-border)',
                color: 'var(--db-text-main)'
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-[var(--db-header-border)] pb-3">
                <div className="text-left">
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    📅 Daily Activity
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--db-text-muted)' }}>
                    Actions performed on {selectedHeatmapDay}
                  </span>
                </div>
                <button
                  onClick={() => setShowHeatmapModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body Content */}
              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                {fetchingHeatmapDetails ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-t-violet-500 border-[var(--db-sidebar-border)] animate-spin"></div>
                    <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--db-text-muted)' }}>Retrieving actions...</span>
                  </div>
                ) : selectedHeatmapActivities.length > 0 ? (
                  selectedHeatmapActivities.map((act, i) => {
                    // Match visual icons for action types
                    let icon = '⚡';
                    if (act.action.toLowerCase().includes('quiz')) icon = '📝';
                    else if (act.action.toLowerCase().includes('code')) icon = '💻';
                    else if (act.action.toLowerCase().includes('topic')) icon = '📚';
                    else if (act.action.toLowerCase().includes('session')) icon = '⏱️';
                    else if (act.action.toLowerCase().includes('doubt')) icon = '💬';

                    return (
                      <div
                        key={i}
                        className="p-3 rounded-xl border flex items-start gap-3 transition hover:bg-[var(--db-input-bg)]"
                        style={{ borderColor: 'var(--db-sidebar-border)' }}
                      >
                        <span className="text-sm p-1.5 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">{icon}</span>
                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="text-xs font-bold" style={{ color: 'var(--db-text-main)' }}>{act.action}</span>
                            <span className="text-[9px] font-bold" style={{ color: 'var(--db-text-muted)' }}>{act.time}</span>
                          </div>
                          <span className="text-[10px] uppercase font-semibold tracking-wider block text-violet-400 mt-0.5">{act.module}</span>
                          {act.value && (
                            <p className="text-[11px] mt-1 break-words font-medium leading-relaxed" style={{ color: 'var(--db-text-muted)' }}>
                              {act.value}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10">
                    <span className="text-2xl block mb-1">🔍</span>
                    <span className="text-xs font-semibold block" style={{ color: 'var(--db-text-muted)' }}>No Action Data Found</span>
                    <p className="text-[10px] max-w-[200px] mx-auto mt-0.5" style={{ color: 'var(--db-text-muted)' }}>Could not query specific events log for this calendar date.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
