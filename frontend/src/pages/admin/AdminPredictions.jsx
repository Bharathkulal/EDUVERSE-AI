import { useState } from 'react';
import { TrendingUp, Target, Briefcase, FileText, Brain, BarChart3, Users, Award, Play, Activity, Clock, ShieldAlert } from 'lucide-react';
import AdminTabBar from '../../components/AdminTabBar';
import AdminPageLayout from '../../components/AdminPageLayout';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'learning', label: 'Learning Prediction', icon: '📚' },
  { id: 'interview', label: 'Interview Prediction', icon: '🎤' },
  { id: 'placement', label: 'Placement Prediction', icon: '💼' },
  { id: 'quiz', label: 'Quiz Prediction', icon: '📝' },
  { id: 'coding', label: 'Coding Prediction', icon: '💻' },
  { id: 'resume', label: 'Resume Prediction', icon: '📄' },
  { id: 'recommendation', label: 'Recommendation Index', icon: '🎯' },
];

export default function AdminPredictions() {
  const [activeTab, setActiveTab] = useState('learning');
  const [latency, setLatency] = useState(24); // ms
  const [modelUsed, setModelUsed] = useState('edu-core-v24');
  
  // Predict form input simulation
  const [studentId, setStudentId] = useState('');
  const [cgpaInput, setCgpaInput] = useState('');
  const [studyHours, setStudyHours] = useState('');

  const [predictedScore, setPredictedScore] = useState(null);
  const [confidence, setConfidence] = useState(null);

  const runPredictionDiagnostic = (e) => {
    e.preventDefault();
    if (!studentId) return toast.error('Student Identifier key required');
    
    // Simulate inference latency variance
    setLatency(Math.floor(Math.random() * 15) + 12);
    setPredictedScore(Math.floor(Math.random() * 25) + 72);
    setConfidence(Math.floor(Math.random() * 8) + 91);
    toast.success('Inference query completed successfully!');
  };

  const predKpis = [
    { label: 'Active Prediction Endpoints', value: '7 APIs', icon: <Target className="w-4 h-4" />, color: 'text-blue-500' },
    { label: 'Average serving Latency', value: `${latency} ms`, icon: <Clock className="w-4 h-4" />, color: 'text-emerald-500' },
    { label: 'Deployment Accuracy Target', value: '94.2%', icon: <Award className="w-4 h-4" />, color: 'text-violet-500' },
    { label: 'Total Inferences run today', value: '1,420 queries', icon: <Activity className="w-4 h-4" />, color: 'text-amber-500' },
  ];

  const predInsights = [
    'Model output confidence scores average above 93% on current active student profiles.',
    'System detected warning latency spike on /api/predict/resume following cold start.'
  ];

  const predActivities = [
    { time: '11:02', title: 'Resume Score Predicted', desc: 'Diana L. resume ATS score evaluated at 92/100.' },
    { time: '10:45', title: 'Placement Probability Query', desc: 'Match verified for student Bob Smith.' }
  ];

  return (
    <AdminPageLayout
      title="📈 Prediction Center"
      breadcrumbs={['Prediction Center']}
      kpis={predKpis}
      aiInsights={predInsights}
      activities={predActivities}
    >
      <AdminTabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Diagnostic Form */}
        <div className="lg:col-span-1 p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider">Run Inference Diagnostic</h3>
          <form onSubmit={runPredictionDiagnostic} className="space-y-3 text-xs">
            <div>
              <label className="block mb-1 font-bold" style={{ color: 'var(--db-text-muted)' }}>Student ID key</label>
              <input
                type="text"
                placeholder="e.g. #1024"
                className="w-full px-3 py-1.5 border rounded-lg outline-none"
                style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-bold" style={{ color: 'var(--db-text-muted)' }}>Student Cumulative CGPA</label>
              <input
                type="text"
                placeholder="e.g. 8.42"
                className="w-full px-3 py-1.5 border rounded-lg outline-none"
                style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
                value={cgpaInput}
                onChange={(e) => setCgpaInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-bold" style={{ color: 'var(--db-text-muted)' }}>Average Study Hours Daily</label>
              <input
                type="text"
                placeholder="e.g. 6"
                className="w-full px-3 py-1.5 border rounded-lg outline-none"
                style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full py-2 bg-blue-500 text-white font-bold rounded-lg cursor-pointer hover:bg-blue-600 transition flex items-center justify-center gap-1.5">
              <Play className="w-3.5 h-3.5" /> Predict
            </button>
          </form>

          {predictedScore && (
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: 'var(--db-text-muted)' }}>Inference Output</span>
                <span className="font-bold text-blue-500">{predictedScore}% Score</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--db-text-muted)' }}>Confidence Score</span>
                <span className="font-bold text-emerald-500">{confidence}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Prediction Logs / History */}
        <div className="lg:col-span-2 p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider">Inference Query Log History</h3>
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
            <table className="w-full text-xs text-left">
              <thead style={{ backgroundColor: 'var(--db-input-bg)', color: 'var(--db-text-muted)' }}>
                <tr className="border-b" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <th className="py-2.5 px-4 font-bold">Query Date</th>
                  <th className="py-2.5 px-4 font-bold">Student</th>
                  <th className="py-2.5 px-4 font-bold">Prediction type</th>
                  <th className="py-2.5 px-4 font-bold">Inference Output</th>
                  <th className="py-2.5 px-4 font-bold">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '2026-07-05 11:02', student: 'Alice Johnson', type: 'Learning Speed', val: '87.4%', conf: '94%' },
                  { date: '2026-07-05 10:45', student: 'Bob Smith', type: 'Mock Interview Readiness', val: 'Needs improvement', conf: '91%' },
                  { date: '2026-07-04 15:32', student: 'Charlie K.', type: 'Placement Probability', val: '86% matched', conf: '95%' },
                  { date: '2026-07-03 09:12', student: 'Diana L.', type: 'ATS Resume Score', val: '92/100', conf: '97%' }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-[var(--db-input-bg)] transition" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                    <td className="py-2.5 px-4" style={{ color: 'var(--db-text-muted)' }}>{row.date}</td>
                    <td className="py-2.5 px-4 font-bold">{row.student}</td>
                    <td className="py-2.5 px-4">{row.type}</td>
                    <td className="py-2.5 px-4 font-bold text-blue-500">{row.val}</td>
                    <td className="py-2.5 px-4 text-emerald-500 font-bold">{row.conf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}
