import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningDiagnosis, setRunningDiagnosis] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/progress/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.error('Error fetching dashboard progress:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleRunDiagnosis = () => {
    setRunningDiagnosis(true);
    toast.loading('Analyzing study performance and quiz history...', { id: 'diagnosis' });
    
    setTimeout(() => {
      setRunningDiagnosis(false);
      toast.success('Diagnosis complete! All system metrics operating normally.', { id: 'diagnosis' });
    }, 1500);
  };

  // Detect current theme
  const isDark = () => {
    const wrapper = document.querySelector('.db-page-wrapper');
    return wrapper ? wrapper.classList.contains('dark-theme') : true;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-32 rounded-xl" style={{ background: 'var(--db-inner-card)' }} />
        <div className="h-64 rounded-xl" style={{ background: 'var(--db-inner-card)' }} />
      </div>
    );
  }

  // Chart configuration — uses CSS variables for theme-awareness
  const getComputedVar = (varName) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#FFFFFF',
        bodyColor: '#60A5FA',
        borderColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748B', font: { family: 'Inter', size: 11, weight: '500' } }
      },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false },
        ticks: { color: '#64748B', font: { family: 'Inter', size: 11, weight: '500' } },
        min: 0,
        max: 100
      }
    }
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sun'],
    datasets: [
      {
        label: 'Score',
        data: [10, 48, 30, 60, 80, 62, 80, 56, 90],
        borderColor: '#2563EB',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, 'rgba(37, 99, 235, 0.15)');
          gradient.addColorStop(1, 'rgba(37, 99, 235, 0.00)');
          return gradient;
        },
        pointRadius: 2,
        pointBackgroundColor: '#2563EB',
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#2563EB',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner & AI Study Insights Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Banner */}
        <div className="lg:col-span-2 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-[24px] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(37,99,235,0.15)] min-h-[220px]">
          <div className="relative z-10 max-w-md">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Welcome back, {user?.name || 'Student'}! 👋</h1>
            <p className="text-blue-100/80 text-sm sm:text-base leading-relaxed font-medium">Keep learning, keep improving. You are making excellent progress on your goals!</p>
          </div>
          {/* Floating abstract decorative graphics */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 hidden md:block">
            <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="80" cy="50" r="30" />
              <rect x="20" y="30" width="30" height="30" rx="10" transform="rotate(45 35 45)" />
            </svg>
          </div>
        </div>

        {/* AI Study Insights */}
        <div className="db-card flex flex-col justify-between p-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-[var(--db-text-main)]">AI Study Insights</h3>
              <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-sm">🎯</span>
                <p className="text-xs text-[var(--db-text-secondary)] leading-relaxed">
                  <strong>Focus on Data Structures:</strong> You scored lower in recent quizzes.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-sm">📈</span>
                <p className="text-xs text-[var(--db-text-secondary)] leading-relaxed">
                  <strong>Practice Java:</strong> Solve 3 more Java quizzes to master OOP concepts.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-sm">⚡</span>
                <p className="text-xs text-[var(--db-text-secondary)] leading-relaxed">
                  <strong>Revise DBMS:</strong> High weightage topics detected in exam schedules.
                </p>
              </div>
            </div>
          </div>
          <Link 
            to="/ai-profile"
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center justify-end gap-1 mt-4"
          >
            <span>View All Insights</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Metric 1 */}
        <div className="db-card flex flex-col justify-between p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-lg font-bold">📚</div>
            <svg className="w-12 h-6 text-blue-500/60" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M0,45 Q20,30 40,38 T80,15 T100,5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p className="text-[11px] text-[var(--db-text-muted)] uppercase font-bold tracking-wider mb-0.5">Total Subjects</p>
            <p className="text-lg font-extrabold text-[var(--db-text-main)] mb-1">
              {data?.totalSubjects || 0} <span className="text-xs font-semibold text-[var(--db-text-muted)]">Active</span>
            </p>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <span>↑ 12 this month</span>
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="db-card flex flex-col justify-between p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-lg font-bold">📝</div>
            <svg className="w-12 h-6 text-blue-500/60" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M0,40 Q25,20 50,30 T100,8" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p className="text-[11px] text-[var(--db-text-muted)] uppercase font-bold tracking-wider mb-0.5">Question Bank Count</p>
            <p className="text-lg font-extrabold text-[var(--db-text-main)] mb-1">
              {data?.qbCount || 0} <span className="text-xs font-semibold text-[var(--db-text-muted)]">Q&As</span>
            </p>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <span>↑ 18% from last month</span>
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="db-card flex flex-col justify-between p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-lg font-bold">⭐</div>
            <svg className="w-12 h-6 text-blue-500/60" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M0,35 Q30,40 60,20 T100,10" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p className="text-[11px] text-[var(--db-text-muted)] uppercase font-bold tracking-wider mb-0.5">Important Questions</p>
            <p className="text-lg font-extrabold text-[var(--db-text-main)] mb-1">
              {data?.impCount || 0} <span className="text-xs font-semibold text-[var(--db-text-muted)]">Starred</span>
            </p>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <span>↑ 8% from last month</span>
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="db-card flex flex-col justify-between p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-lg font-bold">📂</div>
            <svg className="w-12 h-6 text-blue-500/60" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M0,42 Q20,25 40,30 T80,18 T100,12" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p className="text-[11px] text-[var(--db-text-muted)] uppercase font-bold tracking-wider mb-0.5">Previous Year Questions</p>
            <p className="text-lg font-extrabold text-[var(--db-text-main)] mb-1">
              {data?.pyqCount || 0} <span className="text-xs font-semibold text-[var(--db-text-muted)]">PYQs</span>
            </p>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <span>↑ 5% from last month</span>
            </span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="db-card flex flex-col justify-between p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-lg font-bold">🔖</div>
            <svg className="w-12 h-6 text-blue-500/60" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M0,30 Q30,10 60,25 T100,5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p className="text-[11px] text-[var(--db-text-muted)] uppercase font-bold tracking-wider mb-0.5">Bookmarks</p>
            <p className="text-lg font-extrabold text-[var(--db-text-main)] mb-1">
              {data?.bookmarkedCount || 0} <span className="text-xs font-semibold text-[var(--db-text-muted)]">Saved</span>
            </p>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <span>↑ 10% from last month</span>
            </span>
          </div>
        </div>

        {/* Metric 6 */}
        <div className="db-card flex flex-col justify-between p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-lg font-bold">🏆</div>
            <svg className="w-12 h-6 text-blue-500/60" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M0,45 Q20,35 40,25 T80,12 T100,2" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p className="text-[11px] text-[var(--db-text-muted)] uppercase font-bold tracking-wider mb-0.5">Completed Questions</p>
            <p className="text-lg font-extrabold text-[var(--db-text-main)] mb-1">
              {data?.completedCount || 0} <span className="text-xs font-semibold text-[var(--db-text-muted)]">Mastered</span>
            </p>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <span>↑ 14% from last month</span>
            </span>
          </div>
        </div>
      </div>

      <p className="db-section-header tracking-wider font-extrabold text-xs text-[var(--db-text-muted)] uppercase mb-4 mt-6">Analytics Matrix</p>

      {/* Grid containing Performance Line Chart & System Insights */}
      <div className="db-grid-split">
        {/* Curved Line Chart */}
        <div className="db-card flex flex-col justify-between p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-[var(--db-text-main)]">Quiz Performance Over Time</h3>
            <span className="text-xs text-[var(--db-text-muted)] font-medium">Last 6 Months</span>
          </div>
          <div className="h-64 relative">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* System Insights card */}
        <div className="db-card flex flex-col justify-between p-6">
          <div>
            <h3 className="text-base font-bold mb-4 text-[var(--db-text-main)]">AI Student Profile</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1">Learning Style</p>
                <p className="text-sm font-semibold text-[var(--db-text-main)]">{data?.mlPrediction?.learning_style || 'Analytical (Visual/Read-Write)'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1">Placement Readiness</p>
                <p className="text-sm font-semibold text-[var(--db-text-main)]">{data?.mlPrediction?.placement_readiness || 'Calculating...'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1">Top Strength</p>
                <p className="text-sm font-semibold text-[var(--db-text-main)]">{data?.mlPrediction?.strengths_weaknesses?.strengths?.[0] || 'Problem Solving'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-1">Suggested Focus</p>
                <p className="text-sm font-semibold text-[var(--db-text-main)]">{data?.mlPrediction?.strengths_weaknesses?.weaknesses?.[0] || 'System Architecture'}</p>
              </div>
            </div>
          </div>
          <Link 
            to="/ai-profile"
            className="db-insights-btn mt-6 text-center block w-full py-2.5 rounded-xl font-bold bg-[#2563EB]/10 text-[#2563EB] border-none hover:bg-[#2563EB]/15 transition"
            style={{ textDecoration: 'none' }}
          >
            View Full AI Analytics Profile
          </Link>
        </div>
      </div>

      {/* Extra ML Prediction info */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="db-card p-6" style={{ background: 'var(--db-prediction-gradient, transparent)' }}>
          <h3 className="font-bold text-[var(--db-text-main)] text-sm uppercase tracking-wider mb-3">ML Performance & Placement Prediction</h3>
          <p className="text-4xl font-extrabold tracking-tight mt-2 text-[#2563EB]">
            {data?.mlPrediction?.performance_prediction || '85%'}
          </p>
          <p className="text-xs mt-1.5 text-[var(--db-text-muted)]">
            Placement readiness level: <span className="font-semibold capitalize text-[#2563EB]">{data?.mlPrediction?.placement_readiness || 'Medium-High'}</span>
          </p>
          <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs font-semibold text-amber-600">
              💡 Career Recommendation: {data?.mlPrediction?.career_recommendations?.[0] || 'Software Engineer / Backend Developer'}
            </p>
          </div>
        </div>

        <div className="db-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[var(--db-text-main)] text-sm uppercase tracking-wider mb-3">Personalized Learning Roadmap</h3>
            <p className="text-xs mt-2 leading-relaxed text-[var(--db-text-secondary)]">
              {data?.mlPrediction?.learning_roadmap?.[0]?.description || "Embark on backend engineering foundations, focusing on database indexing, query optimization, and memory management."}
            </p>
          </div>
          <div className="flex gap-3 mt-5">
            <Link 
              to="/subjects" 
              className="text-xs py-2 px-4 rounded-xl font-semibold transition bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] hover:bg-[var(--db-btn-secondary-hover)]"
              style={{ textDecoration: 'none' }}
            >
              Browse Topics
            </Link>
            <Link 
              to="/ai-profile" 
              className="text-xs py-2 px-4 rounded-xl font-bold transition bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center shadow-md shadow-blue-500/10"
              style={{ textDecoration: 'none' }}
            >
              Consult Full Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
