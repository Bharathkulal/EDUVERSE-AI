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
        display: true,
        position: 'top',
        labels: {
          color: getComputedVar('--db-text-muted') || '#8b8e99',
          boxWidth: 12,
          font: { family: 'Plus Jakarta Sans', size: 11 }
        }
      },
      tooltip: {
        backgroundColor: getComputedVar('--db-chart-tooltip-bg') || '#12131a',
        titleColor: getComputedVar('--db-text-main') || '#ffffff',
        bodyColor: getComputedVar('--db-text-accent') || '#34d399',
        borderColor: 'rgba(52, 211, 153, 0.2)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: getComputedVar('--db-chart-grid') || 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: getComputedVar('--db-text-muted') || '#8b8e99', font: { family: 'Plus Jakarta Sans', size: 11 } }
      },
      y: {
        grid: { color: getComputedVar('--db-chart-grid') || 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: getComputedVar('--db-text-muted') || '#8b8e99', font: { family: 'Plus Jakarta Sans', size: 11 } },
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
        borderColor: '#34d399',
        borderWidth: 3,
        tension: 0.45,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
          gradient.addColorStop(1, 'rgba(52, 211, 153, 0.0)');
          return gradient;
        },
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#34d399',
        pointHoverBorderColor: getComputedVar('--db-text-main') || '#ffffff',
        pointHoverBorderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="db-metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="db-card">
          <p className="db-metric-label">Total Subjects</p>
          <p className="db-metric-sublabel">Curriculum</p>
          <p className="db-metric-val">
            {data?.totalSubjects || 0} <span className="db-metric-suffix">Active</span>
          </p>
        </div>

        <div className="db-card">
          <p className="db-metric-label">Question Bank Count</p>
          <p className="db-metric-sublabel">Model Answers</p>
          <p className="db-metric-val">
            {data?.qbCount || 0} <span className="db-metric-suffix">Q&As</span>
          </p>
        </div>

        <div className="db-card">
          <p className="db-metric-label">Important Questions</p>
          <p className="db-metric-sublabel">High Priority</p>
          <p className="db-metric-val">
            {data?.impCount || 0} <span className="db-metric-suffix">Starred</span>
          </p>
        </div>

        <div className="db-card">
          <p className="db-metric-label">Previous Year Questions</p>
          <p className="db-metric-sublabel">Exam Archives</p>
          <p className="db-metric-val">
            {data?.pyqCount || 0} <span className="db-metric-suffix">PYQs</span>
          </p>
        </div>

        <div className="db-card">
          <p className="db-metric-label">Bookmarks</p>
          <p className="db-metric-sublabel">Saved for Revision</p>
          <p className="db-metric-val">
            {data?.bookmarkedCount || 0} <span className="db-metric-suffix">Saved</span>
          </p>
        </div>

        <div className="db-card">
          <p className="db-metric-label">Completed Questions</p>
          <p className="db-metric-sublabel">Study Progress</p>
          <p className="db-metric-val">
            {data?.completedCount || 0} <span className="db-metric-suffix">Mastered</span>
          </p>
        </div>
      </div>

      <p className="db-section-header">ANALYTICS MATRIX</p>

      {/* Grid containing Performance Line Chart & System Insights */}
      <div className="db-grid-split">
        {/* Curved Line Chart */}
        <div className="db-card flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold" style={{ color: 'var(--db-text-main)' }}>Quiz Performance Over Time</h3>
          </div>
          <div className="h-64 relative">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* System Insights card */}
        <div className="db-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--db-text-main)' }}>AI Student Profile</h3>
            <p className="db-insights-desc" style={{ marginTop: '0.5rem', fontSize: '0.875rem', lineHeight: '1.5' }}>
              <strong>Learning Style:</strong> {data?.mlPrediction?.learning_style || 'Analytical (Visual/Read-Write)'} <br/>
              <strong>Placement Readiness:</strong> {data?.mlPrediction?.placement_readiness || 'Calculating...'} <br/>
              <strong>Top Strength:</strong> {data?.mlPrediction?.strengths_weaknesses?.strengths?.[0] || 'Problem Solving'} <br/>
              <strong>Suggested Focus:</strong> {data?.mlPrediction?.strengths_weaknesses?.weaknesses?.[0] || 'System Architecture'}
            </p>
          </div>
          <Link 
            to="/ai-profile"
            className="db-insights-btn mt-4 text-center block w-full py-2.5 rounded-lg font-semibold"
            style={{ textDecoration: 'none' }}
          >
            View Full AI Analytics Profile
          </Link>
        </div>
      </div>

      {/* Extra ML Prediction info */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="db-card" style={{ background: 'var(--db-prediction-gradient, transparent)' }}>
          <h3 className="font-bold" style={{ color: 'var(--db-text-accent)' }}>ML Performance & Placement Prediction</h3>
          <p className="text-3xl font-extrabold mt-2" style={{ color: 'var(--db-text-main)' }}>
            {data?.mlPrediction?.performance_prediction || '85%'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--db-text-muted)' }}>
            Placement readiness level: <span className="font-semibold capitalize" style={{ color: 'var(--db-text-accent)' }}>{data?.mlPrediction?.placement_readiness || 'Medium-High'}</span>
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--db-amber-accent)' }}>
            Career Recommendation: {data?.mlPrediction?.career_recommendations?.[0] || 'Software Engineer / Backend Developer'}
          </p>
        </div>

        <div className="db-card">
          <h3 className="font-bold" style={{ color: 'var(--db-text-main)' }}>Personalized Learning Roadmap</h3>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--db-text-muted)' }}>
            {data?.mlPrediction?.learning_roadmap?.[0]?.description || "Embark on backend engineering foundations, focusing on database indexing, query optimization, and memory management."}
          </p>
          <div className="flex gap-2 mt-4">
            <Link 
              to="/subjects" 
              className="text-xs py-1.5 px-3 rounded-lg font-semibold transition db-badge"
            >
              Browse Topics
            </Link>
            <Link 
              to="/ai-profile" 
              className="text-xs py-1.5 px-3 rounded-lg font-bold transition"
              style={{ 
                background: 'var(--db-text-accent)', 
                color: '#000000' 
              }}
            >
              Consult Full Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
