import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../api/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="animate-pulse h-64 bg-slate-200 rounded-xl" />;

  const stats = [
    { label: 'Total Students', value: data.totalStudents, color: 'text-blue-600' },
    { label: 'Total Subjects', value: data.totalSubjects, color: 'text-green-600' },
    { label: 'Total Quizzes', value: data.totalQuizzes, color: 'text-purple-600' },
    { label: 'Avg Performance', value: `${data.averagePerformance}%`, color: 'text-orange-600' },
  ];

  const chartData = {
    labels: data.recentStudents?.slice(0, 5).map((s) => s.name.split(' ')[0]) || [],
    datasets: [{ label: 'New Students', data: data.recentStudents?.slice(0, 5).map(() => 1) || [], backgroundColor: '#6366f1' }],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-500">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-slate-500 text-sm">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Recent Students</h2>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/students" className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 text-center">👥 Students</Link>
            <Link to="/admin/content" className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 text-center">📝 Content</Link>
            <Link to="/admin/quizzes" className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 text-center">✅ Quizzes</Link>
            <Link to="/admin/ml" className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 text-center">🧠 ML Training</Link>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-4">Recent Registrations</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {data.recentStudents?.map((s) => (
              <tr key={s.id} className="border-b border-slate-100">
                <td className="py-2">{s.name}</td>
                <td>{s.email}</td>
                <td className="text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
