import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../api/axios';
import { useVoiceAssistant } from '../context/VoiceContext';
import { 
  Mic, Play, Pause, TrendingUp, Clock, MessageSquare, BookOpenText, 
  Code, Target, Settings, Brain, Radio, Shield, Globe, Award, 
  Sparkles, ChevronRight, Copy, Share2, Bookmark, CheckCircle, AlertCircle, RefreshCw, Volume2
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HASH_TO_TAB = {
  '#skill-graph': 'subjects',
  '#heatmap': 'activity',
  '#reports': 'overview',
  '#achievements': 'overview',
  '#certificates': 'overview',
  '#ranking': 'overview',
};

function AnimatedProgressRing({ percentage, size = 120, strokeWidth = 8, color = '#8B5CF6' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(139, 92, 246, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
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
      <div className="absolute text-center">
        <span className="text-2xl font-bold text-white"><CountUp end={percentage} />%</span>
      </div>
    </div>
  );
}

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
  return <span>{Math.round(count * 10) / 10}</span>;
}

export default function Progress() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [heatmapData, setHeatmapData] = useState(null);
  const [xpTimeline, setXpTimeline] = useState(null);
  const [showTasksPanel, setShowTasksPanel] = useState(false);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateActivities, setDateActivities] = useState([]);
  const [fetchingDateDetails, setFetchingDateDetails] = useState(false);
  const location = useLocation();

  const handleCellClick = async (dateStr) => {
    setSelectedDate(dateStr);
    setShowTasksPanel(true);
    setFetchingDateDetails(true);
    try {
      const res = await api.get(`/progress/heatmap/details?date=${dateStr}`);
      setDateActivities(res.data.activities || []);
    } catch (err) {
      console.error('Error fetching date activities:', err);
      setDateActivities([]);
    } finally {
      setFetchingDateDetails(false);
    }
  };

  // Hash-based navigation from sidebar
  useEffect(() => {
    const hash = location.hash;
    if (hash && HASH_TO_TAB[hash]) {
      setActiveTab(HASH_TO_TAB[hash]);
      if (HASH_TO_TAB[hash] === 'activity' && !heatmapData) {
        Promise.all([
          api.get('/progress/heatmap'),
          api.get('/progress/xp-timeline'),
          api.get('/progress/dashboard')
        ]).then(([heatRes, xpRes, dashRes]) => {
          setHeatmapData(heatRes.data);
          setXpTimeline(xpRes.data);
          setRecentQuizzes(dashRes.data.recentQuizzes || []);
        }).catch(err => console.error(err));
      }
    }
  }, [location.hash]);

  const fetchAnalytics = () => {
    setLoading(true);
    api.get('/progress/analytics')
      .then((res) => {
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching analytics:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-violet-300 font-semibold animate-pulse">Analyzing your learning patterns...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-6 bg-[rgba(139,92,246,0.02)] border border-[rgba(139,92,246,0.1)] rounded-2xl">
        <span className="text-5xl mb-4">⚠️</span>
        <h2 className="text-2xl font-bold text-white mb-2">Failed to load analytics</h2>
        <p className="text-slate-400 mb-4">Make sure the backend server is running and database is accessible.</p>
        <button onClick={fetchAnalytics} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-all">
          Retry Loading
        </button>
      </div>
    );
  }

  const {
    userName,
    currentSubject,
    currentTopicName,
    completedTopicsCount,
    totalTopicsCount,
    solvedProblemsCount,
    totalProblemsCount,
    totalStudyHours,
    nextRecommendedTopicName,
    aiSummary,
    subjectProgress,
    roadmap,
    quizStats,
    codingStats,
    studyTimeStats,
    strengths,
    weaknesses
  } = analytics;

  // Chart configuration
  const studyHoursChartData = {
    labels: studyTimeStats.labels,
    datasets: [
      {
        fill: true,
        label: 'Study Hours',
        data: studyTimeStats.data,
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1e1b4b',
        titleColor: '#e0e7ff',
        bodyColor: '#c7d2fe',
        borderColor: 'rgba(139, 92, 246, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(139, 92, 246, 0.05)',
        },
        ticks: {
          color: '#a5b4fc',
          font: { size: 10 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#a5b4fc',
          font: { size: 10 }
        }
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 pr-1">
      {/* Navigation tabs */}
      <div className="flex border-b border-[rgba(139,92,246,0.15)] pb-px gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'overview' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview
          {activeTab === 'overview' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'subjects' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Curriculum Mastery
          {activeTab === 'subjects' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'roadmap' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Learning Roadmap
          {activeTab === 'roadmap' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('activity');
            if (!heatmapData) {
              Promise.all([
                api.get('/progress/heatmap'),
                api.get('/progress/xp-timeline'),
                api.get('/progress/dashboard')
              ]).then(([heatRes, xpRes, dashRes]) => {
                setHeatmapData(heatRes.data);
                setXpTimeline(xpRes.data);
                setRecentQuizzes(dashRes.data.recentQuizzes || []);
              }).catch(err => console.error(err));
            }
          }}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'activity' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Activity Heatmap
          {activeTab === 'activity' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('voice-teacher')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'voice-teacher' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          🎙️ AI Voice Teacher
          {activeTab === 'voice-teacher' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Hero Section: AI Learning Report */}
            <div className="relative overflow-hidden rounded-3xl p-8 border border-[rgba(139,92,246,0.2)] bg-gradient-to-br from-[#120e2a] via-[#1a143b] to-[#0f0b24]">
              {/* Glassmorphic overlays */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10 grid md:grid-cols-3 gap-8 items-center">
                {/* Greeting & Quick metrics */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <span className="px-3 py-1 bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold rounded-full uppercase tracking-wider">
                      AI Learning Insights
                    </span>
                    <h1 className="text-3xl font-extrabold text-white mt-3">
                      {getGreeting()}, {userName}
                    </h1>
                    <p className="text-indigo-200/70 text-sm mt-1">Here is a real-time status of your academic progress.</p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] backdrop-blur-md">
                    <p className="text-white font-semibold flex items-center gap-2 mb-2 text-sm">
                      <span className="text-violet-400">✨</span> AI-Generated Learning Summary:
                    </p>
                    <p className="text-indigo-200/80 text-[13px] leading-relaxed">
                      {aiSummary}
                    </p>
                  </div>

                  {/* Curated Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.1)] rounded-xl">
                      <p className="text-[10px] uppercase text-indigo-300/60 font-semibold">Study Time</p>
                      <p className="text-lg font-bold text-white mt-0.5"><CountUp end={totalStudyHours} />h</p>
                    </div>
                    <div className="p-3 bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.1)] rounded-xl">
                      <p className="text-[10px] uppercase text-indigo-300/60 font-semibold">Topics Completed</p>
                      <p className="text-lg font-bold text-white mt-0.5">
                        <CountUp end={completedTopicsCount} /> / {totalTopicsCount}
                      </p>
                    </div>
                    <div className="p-3 bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.1)] rounded-xl">
                      <p className="text-[10px] uppercase text-indigo-300/60 font-semibold">Problems Solved</p>
                      <p className="text-lg font-bold text-white mt-0.5">
                        <CountUp end={solvedProblemsCount} /> / {totalProblemsCount}
                      </p>
                    </div>
                    <div className="p-3 bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.1)] rounded-xl">
                      <p className="text-[10px] uppercase text-indigo-300/60 font-semibold">Quiz Accuracy</p>
                      <p className="text-lg font-bold text-white mt-0.5">
                        <CountUp end={quizStats.averageScore} />%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Path & Next Recommended */}
                <div className="p-6 rounded-2xl bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.2)] flex flex-col justify-between h-full space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-indigo-300/60 font-bold">Current Subject</p>
                    <p className="text-base font-bold text-white">{currentSubject}</p>
                    <p className="text-xs text-indigo-200/50 mt-0.5">Active Topic: {currentTopicName}</p>
                  </div>

                  <div className="border-t border-violet-500/10 my-1"></div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-indigo-300/60 font-bold">Recommended Next Topic</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping"></span>
                      <p className="text-sm font-semibold text-violet-300">{nextRecommendedTopicName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Metrics Columns */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Column: Learning Time Trend */}
              <div className="md:col-span-2 rounded-2xl p-6 border border-[rgba(139,92,246,0.12)] bg-[rgba(30,27,75,0.2)] backdrop-blur-md flex flex-col justify-between h-[340px]">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Study Activity</h3>
                    <p className="text-xs text-indigo-200/60">Session hours logged over past 7 days</p>
                  </div>
                  <span className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-semibold rounded-lg">
                    Real-time Logs
                  </span>
                </div>
                <div className="flex-1 min-h-[220px]">
                  <Line data={studyHoursChartData} options={chartOptions} />
                </div>
              </div>

              {/* Right Column: Key Details */}
              <div className="rounded-2xl p-6 border border-[rgba(139,92,246,0.12)] bg-[rgba(30,27,75,0.2)] backdrop-blur-md flex flex-col justify-between h-[340px]">
                <h3 className="text-base font-bold text-white mb-4">Cognitive Profile</h3>
                
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-center p-3.5 bg-[rgba(139,92,246,0.03)] border border-violet-500/10 rounded-xl">
                    <div>
                      <p className="text-xs font-semibold text-indigo-200/60">Primary Strength</p>
                      <p className="text-sm font-bold text-emerald-400 mt-0.5">{strengths}</p>
                    </div>
                    <span className="text-xl">🏆</span>
                  </div>

                  <div className="flex justify-between items-center p-3.5 bg-[rgba(239,68,68,0.03)] border border-red-500/10 rounded-xl">
                    <div>
                      <p className="text-xs font-semibold text-indigo-200/60">Weakest Area</p>
                      <p className="text-sm font-bold text-red-400 mt-0.5">{weaknesses}</p>
                    </div>
                    <span className="text-xl font-bold text-red-400">⚠️</span>
                  </div>

                  <div className="flex justify-between items-center p-3.5 bg-[rgba(59,130,246,0.03)] border border-blue-500/10 rounded-xl">
                    <div>
                      <p className="text-xs font-semibold text-indigo-200/60">Coding Performance</p>
                      <p className="text-sm font-bold text-blue-400 mt-0.5">
                        {codingStats.successRate}% Success
                      </p>
                    </div>
                    <span className="text-xl">💻</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Analytics Splits */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quiz Analytics Card */}
              <div className="rounded-2xl p-6 border border-[rgba(139,92,246,0.12)] bg-[rgba(30,27,75,0.2)] backdrop-blur-md space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>📝</span> Quiz Analytics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-violet-950/25 border border-violet-900/40 text-center">
                    <span className="text-[10px] text-indigo-300/50 font-semibold block uppercase">Total Quizzes</span>
                    <span className="text-2xl font-bold text-white"><CountUp end={quizStats.attempts} /></span>
                  </div>
                  <div className="p-4 rounded-xl bg-violet-950/25 border border-violet-900/40 text-center">
                    <span className="text-[10px] text-indigo-300/50 font-semibold block uppercase">Average Score</span>
                    <span className="text-2xl font-bold text-white"><CountUp end={quizStats.averageScore} />%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="flex justify-between text-xs text-indigo-200/60 p-2.5 border-b border-violet-900/20">
                    <span>Highest Score:</span>
                    <span className="font-bold text-white">{quizStats.maxScore}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-indigo-200/60 p-2.5 border-b border-violet-900/20">
                    <span>Lowest Score:</span>
                    <span className="font-bold text-white">{quizStats.minScore}%</span>
                  </div>
                </div>
              </div>

              {/* Coding Lab Submissions */}
              <div className="rounded-2xl p-6 border border-[rgba(139,92,246,0.12)] bg-[rgba(30,27,75,0.2)] backdrop-blur-md space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>💻</span> Coding Challenge Analytics
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(139,92,246,0.05)] text-center">
                    <span className="text-[9px] text-emerald-400/80 font-bold block uppercase">Easy</span>
                    <span className="text-xl font-bold text-white mt-1 block"><CountUp end={codingStats.easySolved} /></span>
                  </div>
                  <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(139,92,246,0.05)] text-center">
                    <span className="text-[9px] text-amber-400/80 font-bold block uppercase">Medium</span>
                    <span className="text-xl font-bold text-white mt-1 block"><CountUp end={codingStats.mediumSolved} /></span>
                  </div>
                  <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(139,92,246,0.05)] text-center">
                    <span className="text-[9px] text-rose-400/80 font-bold block uppercase">Hard</span>
                    <span className="text-xl font-bold text-white mt-1 block"><CountUp end={codingStats.hardSolved} /></span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-indigo-200/60 p-2 border-t border-violet-900/10 mt-1">
                  <span>Success Rate (Score &gt;= 90%):</span>
                  <span className="font-bold text-white">{codingStats.successRate}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'subjects' && (
          <motion.div
            key="subjects"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {subjectProgress.map((sub, idx) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="rounded-2xl p-6 border border-[rgba(139,92,246,0.12)] bg-[rgba(30,27,75,0.2)] backdrop-blur-md flex items-center justify-between gap-6 hover:border-[rgba(139,92,246,0.3)] transition-all"
              >
                <div className="space-y-3 flex-1">
                  <h4 className="text-base font-bold text-white">{sub.name}</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-indigo-200/50">
                      <span>Progress</span>
                      <span>{sub.completedTopics} / {sub.totalTopics} Topics</span>
                    </div>
                    {/* Custom progress bar */}
                    <div className="w-full h-2 bg-violet-950/45 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${sub.percentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-violet-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
                <AnimatedProgressRing percentage={sub.percentage} size={90} strokeWidth={6} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'roadmap' && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl p-6 border border-[rgba(139,92,246,0.12)] bg-[rgba(30,27,75,0.2)] backdrop-blur-md"
          >
            <div className="mb-6">
              <h3 className="text-base font-bold text-white">Curriculum Roadmap</h3>
              <p className="text-xs text-indigo-200/50">Complete topics systematically to build your foundations</p>
            </div>

            <div className="relative pl-6 border-l-2 border-violet-900/50 space-y-6">
              {roadmap.map((item, idx) => {
                const getStatusStyle = () => {
                  if (item.status === 'Completed') {
                    return {
                      bullet: 'bg-emerald-500 ring-4 ring-emerald-500/20',
                      text: 'text-indigo-200/60 line-through',
                      badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    };
                  }
                  if (item.status === 'In Progress') {
                    return {
                      bullet: 'bg-violet-500 ring-4 ring-violet-500/30 animate-pulse',
                      text: 'text-white font-bold',
                      badge: 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                    };
                  }
                  return {
                    bullet: 'bg-slate-700 ring-4 ring-slate-800',
                    text: 'text-indigo-200/35',
                    badge: 'bg-slate-800/10 border-slate-700/30 text-slate-500'
                  };
                };

                const style = getStatusStyle();

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.3 }}
                    className="relative flex items-center justify-between"
                  >
                    {/* Circle Bullet */}
                    <div className={`absolute -left-[31px] w-2.5 h-2.5 rounded-full ${style.bullet}`} />

                    <div className="flex flex-col">
                      <span className="text-[10px] text-violet-400/80 font-bold uppercase">{item.subject}</span>
                      <span className={`text-sm mt-0.5 ${style.text}`}>{item.title}</span>
                    </div>

                    <span className={`px-2.5 py-0.5 border text-[10px] font-semibold rounded-full uppercase tracking-wider ${style.badge}`}>
                      {item.status}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Activity Heatmap */}
            <div className="rounded-2xl p-6 border border-[rgba(139,92,246,0.12)] bg-[rgba(30,27,75,0.2)] backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🔥</span> Activity Heatmap
                  </h3>
                  <p className="text-xs text-indigo-200/50 mt-1">
                    {heatmapData ? `${heatmapData.totalActiveDays} active days in the past year` : 'Loading...'}
                  </p>
                </div>
                {/* Activity Log button */}
                <button
                  onClick={() => setShowTasksPanel(prev => !prev)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    showTasksPanel
                      ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-violet-600/20 hover:border-violet-500/40 hover:text-white'
                  }`}
                >
                  <span>📋</span>
                  <span>{showTasksPanel ? 'Hide' : 'Activity Log'}</span>
                </button>
              </div>

              {heatmapData ? (
                <div className="overflow-x-auto">
                  <div className="flex gap-[3px] flex-wrap" style={{ maxWidth: '100%' }}>
                    {(() => {
                      const cells = [];
                      const today = new Date();
                      const dateMap = {};
                      heatmapData.heatmapData.forEach(d => { dateMap[d.date] = d.count; });
                      const maxCount = Math.max(1, ...heatmapData.heatmapData.map(d => d.count));

                      for (let i = 364; i >= 0; i--) {
                        const d = new Date(today);
                        d.setDate(today.getDate() - i);
                        const dateStr = d.toISOString().split('T')[0];
                        const count = dateMap[dateStr] || 0;
                        const intensity = count === 0 ? 0 : Math.min(4, Math.ceil((count / maxCount) * 4));
                        const colors = [
                          'rgba(139, 92, 246, 0.05)',
                          'rgba(139, 92, 246, 0.25)',
                          'rgba(139, 92, 246, 0.45)',
                          'rgba(139, 92, 246, 0.65)',
                          'rgba(139, 92, 246, 0.9)'
                        ];

                        cells.push(
                          <div
                            key={dateStr}
                            title={`${dateStr}: ${count} activities`}
                            onClick={() => handleCellClick(dateStr)}
                            className={`rounded-sm transition-all hover:ring-1 hover:ring-violet-400 cursor-pointer ${
                              selectedDate === dateStr ? 'ring-1 ring-amber-400 scale-110 z-10' : ''
                            }`}
                            style={{
                              width: '11px',
                              height: '11px',
                              backgroundColor: colors[intensity],
                              border: selectedDate === dateStr ? '1px solid #fbbf24' : '1px solid rgba(139, 92, 246, 0.08)'
                            }}
                          />
                        );
                      }
                      return cells;
                    })()}
                  </div>
                  <div className="flex items-center gap-2 mt-3 justify-end">
                    <span className="text-[10px] text-indigo-200/40">Less</span>
                    {[0, 1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="rounded-sm"
                        style={{
                          width: '10px',
                          height: '10px',
                          backgroundColor: [
                            'rgba(139, 92, 246, 0.05)',
                            'rgba(139, 92, 246, 0.25)',
                            'rgba(139, 92, 246, 0.45)',
                            'rgba(139, 92, 246, 0.65)',
                            'rgba(139, 92, 246, 0.9)'
                          ][i]
                        }}
                      />
                    ))}
                    <span className="text-[10px] text-indigo-200/40">More</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 rounded-full border-3 border-t-violet-600 border-slate-700 animate-spin"></div>
                </div>
              )}
            </div>

            {/* Recent Completed Tasks Panel */}
            <AnimatePresence>
              {showTasksPanel && (() => {
                let activities = [];

                if (selectedDate) {
                  // Map activities loaded from dateDetails
                  activities = dateActivities.map(act => {
                    const isQuiz = act.action.includes('Quiz') || act.action.toLowerCase().includes('quiz');
                    const isCode = act.action.includes('Code') || act.action.toLowerCase().includes('code');
                    const isTopic = act.action.includes('Topic') || act.action.toLowerCase().includes('topic');
                    const isStudy = act.action.includes('Study') || act.action.toLowerCase().includes('study');

                    let icon = '🔔';
                    let color = 'from-slate-500 to-slate-600';
                    let xp = 'Insight';
                    if (isQuiz) {
                      icon = '📝';
                      color = 'from-violet-500 to-purple-600';
                      xp = '+20 XP';
                    } else if (isCode) {
                      icon = '💻';
                      color = 'from-cyan-500 to-blue-600';
                      xp = '+15 XP';
                    } else if (isTopic) {
                      icon = '📚';
                      color = 'from-emerald-500 to-teal-600';
                      xp = '+10 XP';
                    } else if (isStudy) {
                      icon = '⏱️';
                      color = 'from-indigo-500 to-blue-500';
                      xp = '+5 XP';
                    }

                    return {
                      icon,
                      label: `${act.action}: ${act.value}`,
                      subject: act.module || 'System',
                      xp,
                      time: act.time || 'Completed',
                      color,
                      badge: '🎯'
                    };
                  });
                } else {
                  // Build full activity list from available analytics data
                  // Quiz completions from dashboard recent quizzes
                  recentQuizzes.forEach(q => {
                    activities.push({
                      icon: '📝',
                      label: `Scored ${q.score}% on ${q.title || 'Quiz'}`,
                      subject: q.subject_name || 'General',
                      xp: `+${Math.round((q.score || 0) / 5)} XP`,
                      time: q.submitted_at ? new Date(q.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
                      color: 'from-violet-500 to-purple-600',
                      badge: q.score >= 80 ? '🏆' : q.score >= 50 ? '✅' : '📌'
                    });
                  });

                  // Topic completions from roadmap
                  if (analytics?.roadmap) {
                    analytics.roadmap
                      .filter(r => r.status === 'Completed')
                      .slice(0, 10)
                      .forEach(r => {
                        activities.push({
                          icon: '📚',
                          label: `Completed: ${r.title || r.topic}`,
                          subject: r.subject || '',
                          xp: '+10 XP',
                          time: 'Topic completed',
                          color: 'from-emerald-500 to-teal-600',
                          badge: '✅'
                        });
                      });
                  }

                  // Coding problems from codingStats
                  if (analytics?.codingStats?.solvedCount > 0) {
                    activities.push({
                      icon: '💻',
                      label: `Solved ${analytics.codingStats.solvedCount} Coding Problems`,
                      subject: 'Coding Lab',
                      xp: `+${analytics.codingStats.solvedCount * 15} XP`,
                      time: 'Session total',
                      color: 'from-cyan-500 to-blue-600',
                      badge: '🔥'
                    });
                  }

                  // Strengths from AI analysis
                  if (analytics?.strengths?.length > 0) {
                    analytics.strengths.slice(0, 3).forEach(s => {
                      activities.push({
                        icon: '⭐',
                        label: `Strength identified: ${s}`,
                        subject: 'AI Analysis',
                        xp: 'Skill Mastered',
                        time: 'Performance insight',
                        color: 'from-amber-500 to-yellow-600',
                        badge: '🌟'
                      });
                    });
                  }
                }

                return (
                  <motion.div
                    key="tasks-panel"
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[rgba(20,15,50,0.6)] backdrop-blur-md p-6 space-y-4">
                      {/* Panel Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm shadow-md shadow-violet-500/30">
                            📋
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {selectedDate ? `Activities on ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Completed Task Log'}
                            </h4>
                            <p className="text-[10px] text-indigo-200/50">
                              {selectedDate ? `${activities.length} activities on this day` : `${activities.length} total activities found`}
                            </p>
                          </div>
                        </div>
                        {selectedDate ? (
                          <button
                            onClick={() => setSelectedDate(null)}
                            className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-all cursor-pointer"
                          >
                            Show All
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider">
                            {completedTopicsCount} Topics Done
                          </span>
                        )}
                      </div>

                      {/* Activity Feed */}
                      {fetchingDateDetails ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                          <div className="w-6 h-6 rounded-full border-3 border-t-violet-500 border-slate-700 animate-spin"></div>
                          <span className="text-[10px] text-slate-400">Loading day's activities...</span>
                        </div>
                      ) : activities.length > 0 ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-sidebar-scroll pr-1">
                          {activities.map((act, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/20 transition-all group"
                            >
                              {/* Left icon strip */}
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${act.color} flex items-center justify-center text-sm shadow-sm flex-shrink-0`}>
                                {act.icon}
                              </div>

                              {/* Middle content */}
                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-bold text-white leading-tight truncate">{act.label}</span>
                                  <span className="text-xs flex-shrink-0">{act.badge}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {act.subject && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-indigo-300">
                                      {act.subject}
                                    </span>
                                  )}
                                  <span className="text-[9px] text-slate-500">{act.time}</span>
                                </div>
                              </div>

                              {/* Right: XP badge */}
                              <span className="text-[11px] font-bold text-emerald-400 shrink-0 group-hover:text-emerald-300 transition-colors">
                                {act.xp}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <span className="text-4xl block mb-3">🏃</span>
                          <span className="text-sm text-slate-400 font-semibold block">No completed tasks on this day</span>
                          <p className="text-[11px] text-slate-600 mt-1 max-w-[240px] mx-auto">
                            No study sessions, quiz submissions, or code solutions logged on this date.
                          </p>
                        </div>
                      )}

                      {/* Summary footer strip */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                        <div className="text-center p-2 rounded-xl bg-white/[0.02]">
                          <span className="text-lg font-black text-violet-400 block">{quizStats?.totalAttempted || 0}</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Quizzes</span>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-white/[0.02]">
                          <span className="text-lg font-black text-emerald-400 block">{completedTopicsCount}</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Topics</span>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-white/[0.02]">
                          <span className="text-lg font-black text-cyan-400 block">{solvedProblemsCount}</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Code</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* XP Growth Timeline */}
            <div className="rounded-2xl p-6 border border-[rgba(139,92,246,0.12)] bg-[rgba(30,27,75,0.2)] backdrop-blur-md">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <span>📈</span> XP Growth Timeline (Last 30 Days)
              </h3>
              {xpTimeline && xpTimeline.timeline.length > 0 ? (
                <div style={{ height: '250px' }}>
                  <Line
                    data={{
                      labels: xpTimeline.timeline.map(t => {
                        const d = new Date(t.date);
                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }),
                      datasets: [
                        {
                          fill: true,
                          label: 'Cumulative XP',
                          data: xpTimeline.timeline.map(t => t.cumulativeXp),
                          borderColor: '#a78bfa',
                          backgroundColor: 'rgba(167, 139, 250, 0.1)',
                          tension: 0.4,
                          pointBackgroundColor: '#8b5cf6',
                          pointBorderColor: '#fff',
                          pointHoverRadius: 6,
                        },
                        {
                          fill: false,
                          label: 'Daily XP',
                          data: xpTimeline.timeline.map(t => t.dailyXp),
                          borderColor: '#34d399',
                          backgroundColor: 'rgba(52, 211, 153, 0.1)',
                          tension: 0.4,
                          pointBackgroundColor: '#10b981',
                          borderDash: [5, 5],
                        }
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: true, labels: { color: '#a5b4fc', font: { size: 11 } } },
                        tooltip: {
                          backgroundColor: '#1e1b4b',
                          titleColor: '#e0e7ff',
                          bodyColor: '#c7d2fe',
                          borderColor: 'rgba(139, 92, 246, 0.2)',
                          borderWidth: 1,
                          padding: 12,
                          cornerRadius: 8,
                        }
                      },
                      scales: {
                        y: { grid: { color: 'rgba(139, 92, 246, 0.05)' }, ticks: { color: '#6366f1', font: { size: 10 } } },
                        x: { grid: { display: false }, ticks: { color: '#6366f1', font: { size: 10 }, maxRotation: 45 } }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-10">
                  <span className="text-3xl block mb-2">📊</span>
                  <span className="text-sm text-indigo-200/50">No XP data yet. Complete topics and challenges to see your growth!</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'voice-teacher' && (
          <VoiceTeacherTabPanel />
        )}
      </AnimatePresence>
    </div>
  );
}

function VoiceTeacherTabPanel() {
  const { stats, settings, updateSettings, isMuted, setIsMuted, speak } = useVoiceAssistant();
  const [personality, setPersonality] = useState('Friendly Teacher');
  const [language, setLanguage] = useState('English');
  const [voiceGender, setVoiceGender] = useState('Female');
  const [activeState, setActiveState] = useState('idle'); // idle, listening, thinking, speaking
  const [textInput, setTextInput] = useState('');
  const [conversation, setConversation] = useState([
    { role: 'ai', text: 'Hello! I am your personal AI study mentor. What concepts are we mastering today?', time: '10:05 AM' },
    { role: 'user', text: 'What is a binary search tree?', time: '10:06 AM' },
    { role: 'ai', text: 'A binary search tree is a node-based binary tree data structure where the left subtree contains values less than the root, and the right subtree contains values greater. Let me show you an example!', time: '10:06 AM' }
  ]);
  const [simulatedBars, setSimulatedBars] = useState(Array.from({ length: 18 }, () => 8));

  const handleSendText = () => {
    if (!textInput.trim()) return;
    const userText = textInput;
    setConversation(prev => [
      ...prev,
      { role: 'user', text: userText, time: 'Just now' }
    ]);
    setTextInput('');
    setActiveState('thinking');
    
    setTimeout(() => {
      let responseText = `I received your question about "${userText}". Let's master this concept together!`;
      if (userText.toLowerCase().trim() === 'hi' || userText.toLowerCase().trim() === 'hello') {
        responseText = "Hello! I am your personal AI study mentor. What concepts are we mastering today?";
      }
      setConversation(prev => [
        ...prev,
        { role: 'ai', text: responseText, time: 'Just now' }
      ]);
      setActiveState('speaking');
      speak(responseText);
      setTimeout(() => {
        setActiveState('idle');
      }, 4000);
    }, 1500);
  };

  // Speech orb bars simulation
  useEffect(() => {
    if (activeState === 'idle') {
      setSimulatedBars(Array.from({ length: 18 }, () => 8));
      return;
    }
    const interval = setInterval(() => {
      setSimulatedBars(Array.from({ length: 18 }, () => Math.floor(Math.random() * 28) + 6));
    }, 100);
    return () => clearInterval(interval);
  }, [activeState]);

  const handleMicClick = () => {
    if (activeState === 'idle') {
      setActiveState('listening');
      setTimeout(() => {
        setActiveState('thinking');
        setTimeout(() => {
          setConversation(prev => [
            ...prev,
            { role: 'user', text: 'Explain trees vs graphs.', time: 'Just now' },
            { role: 'ai', text: 'A tree is a connected acyclic graph. Every tree is a graph, but not every graph is a tree. Graphs can contain cycles and have multiple connections!', time: 'Just now' }
          ]);
          setActiveState('speaking');
          speak('A tree is a connected acyclic graph.');
          setTimeout(() => {
            setActiveState('idle');
          }, 3000);
        }, 1500);
      }, 3500);
    } else {
      setActiveState('idle');
    }
  };

  const QUICK_ACTIONS = [
    { label: 'Explain Topic', desc: 'Detail concepts', icon: '🧠', color: 'from-violet-500/20 to-indigo-500/10' },
    { label: 'Solve Code', desc: 'Get solutions', icon: '💻', color: 'from-blue-500/20 to-cyan-500/10' },
    { label: 'Debug Program', desc: 'Fix error stack', icon: '🐛', color: 'from-rose-500/20 to-pink-500/10' },
    { label: 'Generate Notes', desc: 'Summary PDF', icon: '📄', color: 'from-amber-500/20 to-orange-500/10' },
    { label: 'Create Quiz', desc: 'Test skills', icon: '📝', color: 'from-emerald-500/20 to-teal-500/10' },
    { label: 'Interview Me', desc: 'Mock practice', icon: '🎙️', color: 'from-indigo-500/20 to-violet-500/10' },
    { label: 'Teach in Kannada', desc: 'ಕನ್ನಡ ವಿವರಣೆ', icon: '🇮🇳', color: 'from-orange-500/20 to-red-500/10' },
    { label: 'Explain PDF', desc: 'Parse papers', icon: '📂', color: 'from-cyan-500/20 to-blue-500/10' }
  ];

  return (
    <motion.div
      key="voice-teacher"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 text-left"
    >
      {/* Title Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-purple-500/20 bg-gradient-to-br from-[#130d2b] to-[#0a0718] shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold rounded-full uppercase tracking-wider font-mono">
              Voice Assistant Core v3.8
            </span>
            <h1 className="text-3xl font-black text-white mt-3 flex items-center gap-2">
              🎙️ EduVerse AI Mentor
            </h1>
            <p className="text-purple-200/70 text-sm mt-1 max-w-xl">
              Talk naturally with your AI Teacher. Ask questions, learn concepts, solve coding problems, and prepare for interviews.
            </p>
          </div>
          
          <div className="flex gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 text-slate-400">
              Model: Gemini Pro Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Col: ChatGPT Voice Orb Hero */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-6 rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-md flex flex-col items-center justify-between text-center min-h-[380px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-full flex justify-between items-center z-10">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Voice Matrix</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  activeState === 'listening' ? 'bg-pink-500 animate-pulse' :
                  activeState === 'thinking' ? 'bg-purple-500 animate-pulse' :
                  activeState === 'speaking' ? 'bg-cyan-500' : 'bg-emerald-500'
                }`} />
                <span className="text-[10px] font-bold uppercase text-slate-300">
                  {activeState === 'listening' ? 'Listening' :
                   activeState === 'thinking' ? 'Thinking' :
                   activeState === 'speaking' ? 'Speaking' : 'Online'}
                </span>
              </div>
            </div>

            {/* Glowing Orb */}
            <div className="my-6 relative cursor-pointer group" onClick={handleMicClick}>
              {/* Outer halos */}
              <div className={`absolute inset-[-12px] rounded-full blur-xl opacity-40 transition-all duration-500 ${
                activeState === 'listening' ? 'bg-pink-500' :
                activeState === 'thinking' ? 'bg-purple-500' :
                activeState === 'speaking' ? 'bg-cyan-500' : 'bg-violet-600'
              }`} />
              
              <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center relative bg-slate-950/60 shadow-inner">
                <div className={`absolute inset-2 rounded-full border border-dashed border-violet-500/30 ${activeState !== 'idle' ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
                <div className={`absolute inset-4 rounded-full border border-dotted border-cyan-400/20 ${activeState !== 'idle' ? 'animate-spin' : ''}`} style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
                
                {/* Core */}
                <motion.div 
                  animate={activeState !== 'idle' ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                    activeState === 'listening' ? 'bg-pink-600' :
                    activeState === 'thinking' ? 'bg-purple-600' :
                    activeState === 'speaking' ? 'bg-cyan-600' : 'bg-violet-650 hover:bg-violet-600'
                  }`}
                >
                  <Mic className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </div>

            {/* Audio Waveform */}
            <div className="w-full space-y-3 z-10">
              <div className="flex gap-0.5 justify-center items-end h-8">
                {simulatedBars.map((h, i) => (
                  <div 
                    key={i} 
                    className="w-1 rounded-t bg-gradient-to-t from-violet-600 to-cyan-400 transition-all" 
                    style={{ height: `${h}px` }} 
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-500">Tap Orb or say <span className="font-bold text-violet-400">"Hey EduVerse"</span> to command</p>
            </div>
          </div>

          {/* AI Study Twin Score */}
          <div className="p-6 rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Brain className="w-4 h-4 text-violet-400" /> AI Study Twin</h3>
            <div className="flex items-center gap-4">
              <AnimatedProgressRing percentage={88} size={80} strokeWidth={6} color="#7c3aed" />
              <div className="space-y-1">
                <div className="text-sm font-bold text-white">Twin Score: Good</div>
                <div className="text-[10px] text-slate-400 leading-normal">Learn consistency is at 94% this week. Grade prediction is A+. Ideal hours: 4 PM - 6 PM.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Col: Chat panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-md flex flex-col h-[520px] justify-between">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><MessageSquare className="w-4 h-4 text-cyan-400" /> Conversation history</h3>
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">Hands-Free</span>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 va-scroll">
              {conversation.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed space-y-2 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white/3 border border-white/5 text-slate-200 rounded-tl-none'
                  }`}>
                    <p>{msg.text}</p>
                    <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-white/5 pt-1.5">
                      <span>{msg.time}</span>
                      {msg.role === 'ai' && (
                        <div className="flex gap-2">
                          <button className="hover:text-white" onClick={() => speak(msg.text)}><Volume2 className="w-3.5 h-3.5" /></button>
                          <button className="hover:text-white" onClick={() => { navigator.clipboard.writeText(msg.text); toast.success('Response copied!'); }}><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {activeState === 'thinking' && (
                <div className="flex justify-start">
                  <div className="p-3 bg-white/3 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Formulating explanation</span>
                    <div className="friday-typing-dots"><div className="friday-typing-dot" /><div className="friday-typing-dot" /><div className="friday-typing-dot" /></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-3 border-t border-white/5">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendText(); }}
                placeholder="Ask your AI Mentor something..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-violet-500"
              />
              <button 
                onClick={handleSendText}
                className="p-2.5 bg-violet-650 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Personality & Quick Settings */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* AI Personality Selector */}
          <div className="p-5 rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-md space-y-3">
            <p className="va-section-label">AI Personality</p>
            <div className="grid grid-cols-2 gap-2">
              {['Friendly Teacher', 'Interviewer', 'Coding Mentor', 'Motivational Coach'].map(p => (
                <button
                  key={p}
                  onClick={() => setPersonality(p)}
                  className={`p-2 rounded-xl text-[10px] font-bold text-center border transition ${
                    personality === p 
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' 
                      : 'bg-white/3 border-white/5 hover:bg-white/5 text-slate-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Settings */}
          <div className="p-5 rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-md space-y-4">
            <p className="va-section-label">Voice settings</p>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Gender preset</span>
                <div className="flex gap-1.5">
                  {['Female', 'Male'].map(g => (
                    <button
                      key={g}
                      onClick={() => setVoiceGender(g)}
                      className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                        voiceGender === g ? 'bg-violet-650 border-violet-650 text-white' : 'bg-white/3 border-white/5 text-slate-400'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Response Lang.</span>
                <select 
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-lg p-1 text-[10px] text-white"
                >
                  <option value="English">English</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Narration Speed</span>
                  <span className="font-bold text-violet-400">{settings.rate}x</span>
                </div>
                <input
                  type="range"
                  min="0.5" max="2" step="0.1"
                  value={settings.rate}
                  onChange={e => updateSettings({ rate: parseFloat(e.target.value) })}
                  className="va-slider"
                  style={{ accentColor: '#7c3aed' }}
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <div>
                  <span className="font-bold block text-white">Audio Output Mute</span>
                  <span className="text-[9px] text-slate-500">Silence synthesis</span>
                </div>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[10px] border transition ${
                    isMuted ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                  }`}
                >
                  {isMuted ? 'Muted' : 'Unmuted'}
                </button>
              </div>
            </div>
          </div>

          {/* AI Live Status */}
          <div className="p-5 rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-md space-y-3">
            <p className="va-section-label">AI Status Console</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {[
                { label: 'Latency', val: '45ms', color: 'text-cyan-400' },
                { label: 'Response', val: '0.8s', color: 'text-violet-400' },
                { label: 'Tokens', val: '241 / sec', color: 'text-emerald-400' },
                { label: 'Confidence', val: '98%', color: 'text-pink-400' }
              ].map((s, idx) => (
                <div key={idx} className="p-2 bg-white/2 rounded-xl border border-white/3">
                  <span className="text-slate-500 block">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Quick Launch Cards Section */}
      <div className="p-6 rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-md">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-400" /> Interactive Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((act, i) => (
            <div
              key={i}
              className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl cursor-pointer hover:border-violet-500/40 hover:shadow-lg transition flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-lg">{act.icon}</div>
              <div>
                <div className="font-bold text-xs text-white">{act.label}</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">{act.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}

