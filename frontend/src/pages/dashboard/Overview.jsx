import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
  TrendingUp, Award, Calendar, Clock, BookOpen, AlertTriangle, 
  ArrowRight, Download, Brain, Flame, Star, CheckSquare
} from 'lucide-react';
import heroCharacter from '../../assets/hero_character.png';

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
        <span className="text-base font-black text-white">{percentage}%</span>
        <span className="text-[7px] uppercase tracking-wider font-bold leading-none text-slate-400">Overall</span>
      </div>
    </div>
  );
}

export default function Overview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dbData, setDbData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const totalXP = dbData?.profile?.xp || 0;
  const userStreak = dbData?.profile?.streak || 0;
  const userCoins = Math.round(totalXP * 0.1);
  const completedLessons = dbData?.completedLessons || 0;
  const studyHours = dbData?.studyHours || 0;
  const quizAvg = dbData?.quizScores?.average || 0;
  const codingAvg = dbData?.codingScores?.average || 0;
  const computedLevel = Math.max(1, Math.floor(studyHours * 2.5 + completedLessons * 1.5 + (quizAvg + codingAvg) / 20));

  const currentSubject = analytics?.currentSubject || 'Not Started';
  const currentTopicName = analytics?.currentTopicName || 'Not Started';
  const completedTopicsCount = analytics?.completedTopicsCount || 0;
  const totalTopicsCount = analytics?.totalTopicsCount || 0;
  const overallProgress = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;
  const subjectProgress = analytics?.subjectProgress || [];
  const weaknesses = analytics?.weaknesses || 'None yet';
  const strengths = analytics?.strengths || 'None yet';
  const studyTimeChart = analytics?.studyTimeStats || { labels: [], data: [] };

  const handleDownloadReport = () => {
    const reportData = {
      student: user?.name || 'Student',
      level: computedLevel,
      xp: totalXP,
      streak: userStreak,
      completedLessons,
      studyHours,
      strengths,
      weaknesses
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = (user?.name || 'Student').replace(/\s+/g, '_');
    link.download = `academic_report_${safeName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-t-violet-600 border-slate-700 animate-spin"></div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider animate-pulse">Syncing Telemetry...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <span className="text-sm font-semibold text-rose-400">{error}</span>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 pr-2">
      {/* Hero Overview */}
      <div className="friday-cyber-card friday-cyber-card-highlight relative overflow-hidden p-6 md:p-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-5 text-left">
            <div>
              <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest block font-mono">ACADEMIC HUB Overview</span>
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 mt-1">
                Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-sm text-slate-400 mt-1">Transform information into mastery with personalized recommendations.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Active Subject: {currentSubject}</span>
                <span className="text-[10px] text-slate-400">{overallProgress}% Complete</span>
              </div>
              <h3 className="text-base font-bold text-white">{currentTopicName}</h3>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/dashboard/continue')} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Smart Resume
              </button>
              <button onClick={handleDownloadReport} className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2">
                <Download className="w-4 h-4" /> Download Academic Report
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 flex justify-center">
            <img src={heroCharacter} alt="Character" className="max-h-[160px] object-contain drop-shadow-[0_8px_16px_rgba(139,92,246,0.25)]" />
          </div>

          {/* Quick Stats Panel */}
          <div className="friday-cyber-card lg:col-span-3 p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold text-white">Target Accuracy</h4>
                <p className="text-[10px] text-slate-400">Quizzes & Code</p>
              </div>
              <CircularProgress percentage={overallProgress} size={70} strokeWidth={6} color="#a78bfa" />
            </div>

            {/* Week Activity Sparkline */}
            <div className="space-y-1">
              <div className="h-10 w-full flex items-end justify-between px-1">
                {(studyTimeChart.data.length > 0 ? studyTimeChart.data : [0,0,0,0,0,0,0]).map((val, i) => {
                  const maxVal = Math.max(...studyTimeChart.data, 1);
                  const heightPct = Math.round((val / maxVal) * 100);
                  return (
                    <div key={i} className="w-1 bg-violet-500/20 rounded-full flex flex-col justify-end" style={{ height: '100%' }}>
                      <div className="bg-violet-400 rounded-full" style={{ height: `${heightPct}%` }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[8px] font-bold text-slate-500">
                {['M','T','W','T','F','S','S'].map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="friday-cyber-card p-4 text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Level Progress</span>
          <span className="text-2xl font-black text-white mt-1 block"><CountUp end={computedLevel} /></span>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 block">+{totalXP} Current XP</span>
        </div>

        <div className="friday-cyber-card p-4 text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Study Streaks</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block"><CountUp end={userStreak} /> Days</span>
          <span className="text-[10px] text-slate-400 block mt-1">Streak multiplier active</span>
        </div>

        <div className="friday-cyber-card p-4 text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Coins Wallet</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block"><CountUp end={userCoins} /> Coins</span>
          <span className="text-[10px] text-slate-400 block mt-1">Convertable in rewards market</span>
        </div>

        <div className="friday-cyber-card p-4 text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Learning Clock</span>
          <span className="text-2xl font-black text-indigo-400 mt-1 block">{studyHours.toFixed(1)}h</span>
          <span className="text-[10px] text-slate-400 block mt-1">{completedLessons} lessons processed</span>
        </div>
      </div>

      {/* Main Breakdown Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Subject completion chart */}
        <div className="friday-cyber-card lg:col-span-2 p-5 space-y-4 text-left">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-violet-400" /> Subject Curriculum progress
          </h3>
          <div className="space-y-4 pt-2">
            {subjectProgress.map((sp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">{sp.name}</span>
                  <span className="text-violet-400 font-bold">{sp.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${sp.percentage}%` }} />
                </div>
              </div>
            ))}
            {subjectProgress.length === 0 && (
              <p className="text-slate-500 text-xs italic">No subject catalog enrolled.</p>
            )}
          </div>
        </div>

        {/* AI Tutor Insights */}
        <div className="friday-cyber-card p-5 space-y-4 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-violet-400" /> AI Recommendations
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed bg-white/[0.02] border border-white/5 p-3.5 rounded-xl font-mono">
              {analytics?.aiSummary || "Curating your customized learning profile..."}
            </p>
          </div>

          <button onClick={() => navigate('/ai-tutor')} className="w-full py-2 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-violet-400 rounded-xl text-xs font-bold transition">
            Access Learning Studio
          </button>
        </div>
      </div>
    </div>
  );
}
