import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Progress() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/progress').then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="animate-pulse h-64 bg-slate-200 rounded-xl" />;

  const { progress, quizResults, codingResults } = data;

  const chartData = {
    labels: quizResults.slice(0, 8).reverse().map((_, i) => `Quiz ${i + 1}`),
    datasets: [
      {
        label: 'Quiz Scores',
        data: quizResults.slice(0, 8).reverse().map((q) => q.score),
        borderColor: '#6366f1',
        tension: 0.3,
      },
      {
        label: 'Coding Scores',
        data: codingResults.slice(0, 8).reverse().map((c) => c.score),
        borderColor: '#f59e0b',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Progress Tracking</h1>
        <p className="text-slate-500">Monitor your learning journey</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-slate-500 text-sm">Study Hours</p>
          <p className="text-2xl font-bold">{parseFloat(progress.study_hours || 0).toFixed(1)}h</p>
        </div>
        <div className="stat-card">
          <p className="text-slate-500 text-sm">Completed Topics</p>
          <p className="text-2xl font-bold">{progress.completed_topics || 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-slate-500 text-sm">Learning Time</p>
          <p className="text-2xl font-bold">{progress.learning_time_minutes || 0} min</p>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Score Trends</h2>
        <Line data={chartData} options={{ responsive: true }} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Quiz Results</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {quizResults.map((q) => (
              <div key={q.id} className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm">{q.title} ({q.subject_name})</span>
                <span className="font-medium text-primary-600">{q.score}%</span>
              </div>
            ))}
            {quizResults.length === 0 && <p className="text-slate-400 text-sm">No quiz results yet</p>}
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Coding Submissions</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {codingResults.map((c) => (
              <div key={c.id} className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm capitalize">{c.language}</span>
                <span className="font-medium text-orange-600">{c.score}%</span>
              </div>
            ))}
            {codingResults.length === 0 && <p className="text-slate-400 text-sm">No coding submissions yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
