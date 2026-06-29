import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
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
        <span className="text-base font-black text-white">{percentage}%</span>
        <span className="text-[7px] uppercase tracking-wider font-bold leading-none text-white/70">Overall</span>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dbData, setDbData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [goals, setGoals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  
  // Local state for goals management
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalPriority, setNewGoalPriority] = useState('medium');
  const [addingGoal, setAddingGoal] = useState(false);
  const [generatingGoals, setGeneratingGoals] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real database progress and analytics
  const fetchAllData = () => {
    Promise.all([
      api.get('/progress/dashboard'),
      api.get('/progress/analytics'),
      api.get('/progress/goals'),
      api.get('/progress/leaderboard'),
      api.get('/progress/heatmap')
    ])
      .then(([dashRes, analyticsRes, goalsRes, leaderboardRes, heatmapRes]) => {
        setDbData(dashRes.data);
        setAnalytics(analyticsRes.data);
        setGoals(goalsRes.data);
        setLeaderboard(leaderboardRes.data.leaderboard || []);
        setHeatmapData(heatmapRes.data.heatmapData || []);
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
      // Update goals list state
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

  // Continue Learning Path from real roadmap data
  const continuePathSteps = (() => {
    if (!roadmap || roadmap.length === 0) return [];
    const steps = [];
    const uniqueSubjects = [...new Set(roadmap.map(r => r.subject))];
    for (const sub of uniqueSubjects) {
      const subNodes = roadmap.filter(r => r.subject === sub);
      for (const node of subNodes) {
        steps.push(node);
      }
    }
    const inProgressIdx = steps.findIndex(s => s.status === 'In Progress');
    if (inProgressIdx === -1) return steps.slice(0, 5);
    const start = Math.max(0, inProgressIdx - 2);
    return steps.slice(start, start + 5);
  })();

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
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#161720]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-12 gap-6 items-center p-6 md:p-8">
          <div className="lg:col-span-6 space-y-5">
            <div>
              <h1 className="text-3xl font-extrabold flex items-center gap-2 text-white">
                {greeting}, {user?.name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-sm mt-1 text-slate-400">Welcome to your AI Learning Command Center. Here is your dashboard overview.</p>
            </div>

            {completedTopicsCount > 0 ? (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-violet-400">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping"></span>
                  Continue Learning
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{currentTopicName}</h3>
                  <p className="text-xs text-slate-400">{currentSubject}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Progress</span>
                    <span>{overallProgress}% Complete ({completedTopicsCount}/{totalTopicsCount} topics)</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-violet-400">
                  <span>⚡ Get Started</span>
                </div>
                <p className="text-sm text-slate-400">Start exploring your learning modules to begin tracking your progress!</p>
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
          <div className="lg:col-span-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between h-full space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold text-white">Your Progress</h4>
                <p className="text-[10px] text-slate-400">Overall Course</p>
              </div>
              <CircularProgress percentage={overallProgress} size={70} strokeWidth={6} color="#c084fc" />
            </div>

            {/* Sparkline from study weekly data */}
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
              <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider px-0.5 text-slate-400">
                {(studyTimeChart.labels.length > 0 ? studyTimeChart.labels : ['M','T','W','T','F','S','S']).map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
            </div>

            <button 
              onClick={() => navigate('/progress')} 
              className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold transition-all border border-white/10 flex items-center justify-center gap-1 cursor-pointer text-white"
            >
              View Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* ── STATISTICS CARDS ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total XP */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-[#161720] flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm bg-violet-500/10 text-violet-400">
            XP
          </div>
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider block text-slate-400">Total XP</span>
            <span className="text-2xl font-bold block leading-none mt-0.5 text-white"><CountUp end={totalXP} /></span>
            <span className="text-[12px] font-bold block mt-1 text-emerald-500">Level {computedLevel}</span>
          </div>
        </div>

        {/* Day Streak */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-[#161720] flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-amber-500/10 text-amber-500">
            🔥
          </div>
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider block text-slate-400">Day Streak</span>
            <span className="text-2xl font-bold block leading-none mt-0.5 text-white"><CountUp end={userStreak} /></span>
            <span className="text-[12px] font-bold block mt-1 text-amber-500">{userStreak > 0 ? 'Keep it going! 🔥' : 'Start today!'}</span>
          </div>
        </div>

        {/* Coins */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-[#161720] flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-emerald-500/10 text-emerald-500">
            🪙
          </div>
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider block text-slate-400">Coins</span>
            <span className="text-2xl font-bold block leading-none mt-0.5 text-white"><CountUp end={userCoins} /></span>
            <span className="text-[12px] font-bold block mt-1 text-emerald-500">Earned</span>
          </div>
        </div>

        {/* Study Hours */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-[#161720] flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-blue-500/10 text-blue-500">
            ⏱️
          </div>
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider block text-slate-400">Study Hours</span>
            <span className="text-2xl font-bold block leading-none mt-0.5 text-white">{studyHours.toFixed(1)}h</span>
            <span className="text-[12px] font-bold block mt-1 text-blue-500">{completedLessons} topics done</span>
          </div>
        </div>
      </div>

      {/* ── MIDDLE ROW split GRID ── */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Interactive Daily Goals (Database Linked) */}
        <div className="rounded-2xl p-5 border border-slate-800 bg-[#161720] flex flex-col justify-between hover:shadow-md transition-all md:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-white">Daily Learning Goals</h3>
              <button 
                onClick={handleGenerateAiGoals}
                disabled={generatingGoals}
                className="text-xs px-2.5 py-1 bg-violet-600/20 text-violet-400 border border-violet-500/30 rounded-lg font-bold hover:bg-violet-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {generatingGoals ? 'Generating...' : '✨ Auto-Generate Goals'}
              </button>
            </div>

            {/* Goals creation input */}
            <form onSubmit={handleAddGoal} className="flex gap-2">
              <input 
                type="text"
                placeholder="What do you want to learn today?"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className="flex-1 bg-white/5 border border-slate-800 text-white placeholder-slate-500 text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-violet-500"
              />
              <select 
                value={newGoalPriority}
                onChange={(e) => setNewGoalPriority(e.target.value)}
                className="bg-white/5 border border-slate-800 text-slate-300 text-sm rounded-xl px-2 focus:outline-none focus:border-violet-500"
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
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/80 bg-white/[0.01]"
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
                        className={`text-sm font-medium ${item.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}
                      >
                        {item.title} {item.is_ai && <span className="text-[10px] text-violet-400 font-bold ml-1.5 px-2 py-0.5 rounded-full bg-violet-600/10 border border-violet-500/20">🤖 AI Tracked</span>}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wider ${
                        item.priority === 'high' ? 'bg-red-500/10 text-red-400' :
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
                <div className="text-center py-6 text-slate-500 text-xs">
                  No goals set for today. Type a goal above or hit Auto-Generate!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="rounded-2xl p-5 border border-slate-800 bg-[#161720] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🤖</span>
                <h3 className="text-[16px] font-bold text-white">AI Recommendations</h3>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-violet-600/10 text-violet-400 border border-violet-500/20">
                AI Coach
              </span>
            </div>

            {isDataAvailable ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-800 bg-white/[0.01]">
                  <p className="text-sm leading-relaxed text-slate-300">
                    Based on your analytics, you should focus on <span className="text-violet-400 font-semibold">{nextRecommendedTopic}</span> next!
                  </p>
                </div>
                <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <p className="font-bold uppercase text-[9px] mb-1">Coach Summary</p>
                  <p className="italic leading-normal">
                    "{analytics?.aiSummary || 'Keep doing quizzes and study modules to get customized feedback.'}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-3xl block mb-2">📊</span>
                <span className="text-xs text-slate-500 font-semibold">No Data Available Yet</span>
                <p className="text-[11px] text-slate-600 mt-1 max-w-[200px] mx-auto">Complete a quiz or log study time to generate dynamic AI coaching recommendations!</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => navigate('/ai-tutor')} 
            className="w-full mt-4 py-2 border border-slate-800 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
          >
            ✨ Consult AI Coach →
          </button>
        </div>
      </div>

      {/* ── BOTTOM GRID: Heatmap, Subject Performance & Leaderboard ── */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Streak Heatmap widget */}
        <div className="rounded-2xl p-5 border border-slate-800 bg-[#161720] flex flex-col justify-between hover:shadow-md transition-all md:col-span-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-[16px] font-bold text-white">Streak & Activity Heatmap</h3>
              <p className="text-xs text-slate-400 mt-1">Your learning commitment over the last 60 days</p>
            </div>

            <div className="grid grid-cols-10 gap-2.5 py-2">
              {recentHeatmapDays.map((day, idx) => (
                <div 
                  key={idx} 
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center relative group border ${
                    day.count === 0 ? 'bg-white/[0.02] border-slate-900/60' :
                    day.count === 1 ? 'bg-violet-900/40 border-violet-800/40 text-violet-300' :
                    day.count <= 3 ? 'bg-violet-700/60 border-violet-600/40 text-violet-200' :
                    'bg-violet-500 border-violet-400/50 text-white'
                  }`}
                >
                  <span className="text-[10px] font-extrabold">{day.count}</span>
                  {/* Tooltip */}
                  <div
                    className="absolute bottom-full mb-1 hidden group-hover:block text-[9px] px-2 py-1 rounded whitespace-nowrap z-30 border border-slate-800 shadow-md"
                    style={{ color: '#ffffff', backgroundColor: '#000000' }}
                  >
                    {day.date}: {day.count} action{day.count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 text-[10px] text-slate-400 font-bold border-t border-slate-800/80 pt-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-white/[0.02] border border-slate-900"></span> No Activity</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-violet-900/40 border border-violet-800/40"></span> Light</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-violet-700/60 border border-violet-600/40"></span> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-violet-500 border border-violet-400"></span> High</span>
            </div>
          </div>
        </div>

        {/* Real-time Leaderboard widget */}
        <div className="rounded-2xl p-5 border border-slate-800 bg-[#161720] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[16px] font-bold text-white">Top Students Leaderboard</h3>
              <button 
                onClick={() => navigate('/quizzes')} 
                className="text-xs font-bold text-violet-400 hover:opacity-85 transition-all cursor-pointer"
              >
                View Hub
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, 5).map((row, idx) => (
                  <div 
                    key={row.id} 
                    className={`flex justify-between items-center p-2 rounded-xl border ${
                      row.isCurrentUser 
                        ? 'bg-violet-600/10 border-violet-500/40 text-violet-200' 
                        : 'bg-white/[0.01] border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                        idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                        idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold truncate max-w-[100px]">{row.name}</span>
                      {row.isCurrentUser && <span className="text-[8px] bg-violet-600 text-white px-1 rounded uppercase">You</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">🔥 {row.streak}d</span>
                      <span className="text-xs font-bold text-emerald-500">{row.totalXp} XP</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
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
        <div className="rounded-2xl p-5 border border-slate-800 bg-[#161720] flex flex-col justify-between hover:shadow-md transition-all md:col-span-2">
          <div className="space-y-4">
            <h3 className="text-[16px] font-bold text-white">Curriculum Subject Performance</h3>
            
            {subjectProgress.length > 0 ? (
              <div className="space-y-3">
                {subjectProgress.map((sp, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">{sp.name}</span>
                      <span className="text-violet-400">{sp.percentage}% ({sp.completedTopics}/{sp.totalTopics} topics)</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full" style={{ width: `${sp.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-xs text-slate-500 font-semibold block">No Data Available Yet</span>
                <p className="text-[11px] text-slate-600 mt-1 max-w-[240px] mx-auto">Complete subject topics in the Learn section to populate this curriculum performance tracker.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="rounded-2xl p-5 border border-slate-800 bg-[#161720] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[16px] font-bold text-white">Recent Activity Timeline</h3>
              <button 
                onClick={() => navigate('/progress')} 
                className="text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                All Stats
              </button>
            </div>

            <div className="space-y-2">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 3).map((act, i) => (
                  <div 
                    key={i} 
                    className="flex justify-between items-center p-2 rounded-xl border border-slate-800 bg-white/[0.01]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm">{act.icon}</span>
                      <div className="truncate text-left">
                        <span className="text-[12px] font-bold block text-white leading-none">{act.label}</span>
                        <span className="text-[10px] block mt-1 text-slate-500">{act.time}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-500 shrink-0">{act.xp}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <span className="text-3xl block mb-2">📊</span>
                  <span className="text-xs text-slate-500 font-semibold block">No Data Available Yet</span>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-[180px] mx-auto">Take quizzes or solve coding problems to generate activity events.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
