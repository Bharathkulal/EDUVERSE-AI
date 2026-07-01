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
  const location = useLocation();

  // Hash-based navigation from sidebar
  useEffect(() => {
    const hash = location.hash;
    if (hash && HASH_TO_TAB[hash]) {
      setActiveTab(HASH_TO_TAB[hash]);
      if (HASH_TO_TAB[hash] === 'activity' && !heatmapData) {
        Promise.all([
          api.get('/progress/heatmap'),
          api.get('/progress/xp-timeline')
        ]).then(([heatRes, xpRes]) => {
          setHeatmapData(heatRes.data);
          setXpTimeline(xpRes.data);
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
                api.get('/progress/xp-timeline')
              ]).then(([heatRes, xpRes]) => {
                setHeatmapData(heatRes.data);
                setXpTimeline(xpRes.data);
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
                            className="rounded-sm transition-all hover:ring-1 hover:ring-violet-400 cursor-pointer"
                            style={{
                              width: '11px',
                              height: '11px',
                              backgroundColor: colors[intensity],
                              border: '1px solid rgba(139, 92, 246, 0.08)'
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
  const { stats, settings, updateSettings, isMuted, setIsMuted, speak, stopSpeech } = useVoiceAssistant();
  return (
    <motion.div
      key="voice-teacher"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 text-left"
    >
      <div className="relative overflow-hidden rounded-3xl p-8 border border-purple-500/20 bg-gradient-to-br from-[#130d2b] to-[#0a0718]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-full uppercase tracking-wider font-mono">
              Voice Teacher Stats
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-3 flex items-center gap-2">
              🎙️ AI Teacher Dashboard
            </h1>
            <p className="text-purple-200/70 text-sm mt-1">Track metrics from spoken lessons, voice commands, and speech rates.</p>
          </div>

          <button 
            onClick={() => speak("Voice system diagnostics check complete. All audio channels operating correctly.")}
            className="px-6 py-2.5 rounded-2xl bg-purple-650 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-lg hover:shadow-purple-500/20 border border-purple-500/20"
          >
            🔊 Speaker Test
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">Topics Explained</span>
            <span className="text-2xl font-black text-white mt-1 block">{stats.topicsExplainedCount}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">Listening Duration</span>
            <span className="text-2xl font-black text-white mt-1 block">{stats.listeningMinutes.toFixed(1)} mins</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">Language Mode</span>
            <span className="text-2xl font-black text-white mt-1 block capitalize">{settings.languageMode}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">Speaking Speed</span>
            <span className="text-2xl font-black text-white mt-1 block">{settings.rate}x</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">🛠️ System Control Panel</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Primary Mute</span>
                <span className="text-[10px] text-slate-500">Mutes voice teacher output universally</span>
              </div>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${isMuted ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Speech Rate</span>
                <span className="text-[10px] text-slate-500">Adjust target narration pace</span>
              </div>
              <div className="flex gap-1.5">
                {[0.75, 1.0, 1.25, 1.5].map(r => (
                  <button 
                    key={r}
                    onClick={() => updateSettings({ rate: r })}
                    className={`p-1.5 px-3 rounded-lg text-xs font-bold border transition ${settings.rate === r ? 'bg-purple-650 border-purple-650 text-white' : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-350'}`}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">🎧 Interactive Voice Commands</h3>
          <div className="p-3 bg-white/5 rounded-2xl text-[11px] leading-relaxed text-slate-400 space-y-2">
            <p>You can say the following phrases out loud to control your Voice Teacher dynamically:</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-purple-300">
              <div>• "Explain in Kannada"</div>
              <div>• "Speak faster"</div>
              <div>• "Slow down"</div>
              <div>• "Give example"</div>
              <div>• "Start quiz"</div>
              <div>• "Pause" / "Resume"</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

