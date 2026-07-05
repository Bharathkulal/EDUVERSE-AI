import { useState } from 'react';
import { TrendingUp, Target, Briefcase, FileText, Brain, BarChart3, Users, Award } from 'lucide-react';
import AdminTabBar from '../../components/AdminTabBar';

const TABS = [
  { id: 'learning', label: 'Learning Prediction', icon: '📚' },
  { id: 'interview', label: 'Interview Prediction', icon: '🎤' },
  { id: 'placement', label: 'Placement Prediction', icon: '💼' },
  { id: 'resume', label: 'Resume Prediction', icon: '📄' },
];

const StatCard = ({ icon, title, value, desc, color = 'text-blue-500' }) => (
  <div className="p-5 rounded-2xl border flex items-start gap-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="text-xs font-bold uppercase" style={{ color: 'var(--db-text-muted)' }}>{title}</p>
      <p className={`text-2xl font-black mt-0.5 ${color}`}>{value}</p>
      <p className="text-[10px] mt-0.5" style={{ color: 'var(--db-text-muted)' }}>{desc}</p>
    </div>
  </div>
);

const PredictionTable = ({ headers, rows }) => (
  <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--db-sidebar-border)' }}>
    <table className="w-full text-xs">
      <thead>
        <tr style={{ backgroundColor: 'var(--db-input-bg)' }}>
          {headers.map((h) => <th key={h} className="text-left py-3 px-4 font-bold uppercase" style={{ color: 'var(--db-text-muted)' }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t" style={{ borderColor: 'var(--db-sidebar-border)' }}>
            {row.map((cell, j) => <td key={j} className="py-3 px-4" style={{ color: 'var(--db-text-main)' }}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function AdminPredictions() {
  const [activeTab, setActiveTab] = useState('learning');

  return (
    <div className="space-y-6" style={{ color: 'var(--db-text-main)' }}>
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
          📈 Prediction Center
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--db-text-muted)' }}>ML-powered predictions for learning outcomes, interviews, placements, and resume scoring.</p>
      </div>

      <AdminTabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'learning' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon="🏆" title="Avg Learning Score" value="78.4" desc="Across all active students" color="text-blue-500" />
            <StatCard icon="📈" title="Predicted Pass Rate" value="86%" desc="Next semester estimate" color="text-emerald-500" />
            <StatCard icon="⚠️" title="At-Risk Learners" value="18" desc="Students below 50% score" color="text-rose-500" />
          </div>
          <PredictionTable
            headers={['Student', 'Current Score', 'Predicted Score', 'Confidence', 'Trend']}
            rows={[
              ['Alice Johnson', '82', '87', '94%', '↗ Improving'],
              ['Bob Smith', '45', '42', '88%', '↘ Declining'],
              ['Charlie K.', '71', '75', '91%', '↗ Improving'],
              ['Diana L.', '93', '95', '96%', '→ Stable'],
              ['Eve M.', '38', '35', '85%', '↘ Declining'],
            ]}
          />
        </div>
      )}

      {activeTab === 'interview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon="🎤" title="Interview Ready" value="67%" desc="Students meeting criteria" color="text-violet-500" />
            <StatCard icon="💬" title="Communication Score" value="7.2/10" desc="Average across mock interviews" color="text-blue-500" />
            <StatCard icon="🧠" title="Technical Score" value="6.8/10" desc="DSA + System Design avg" color="text-amber-500" />
          </div>
          <PredictionTable
            headers={['Student', 'Technical', 'Communication', 'Overall', 'Readiness']}
            rows={[
              ['Alice Johnson', '8.5', '7.8', '8.2', '✅ Ready'],
              ['Bob Smith', '5.2', '6.0', '5.6', '⚠️ Needs Work'],
              ['Charlie K.', '7.0', '7.5', '7.3', '✅ Ready'],
              ['Diana L.', '9.1', '8.5', '8.8', '✅ Excellent'],
              ['Eve M.', '4.1', '5.5', '4.8', '❌ Not Ready'],
            ]}
          />
        </div>
      )}

      {activeTab === 'placement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon="💼" title="Placement Rate" value="73%" desc="Predicted for current batch" color="text-emerald-500" />
            <StatCard icon="🏢" title="Top Company Match" value="Google" desc="Most matched employer" color="text-blue-500" />
            <StatCard icon="💰" title="Avg Package" value="₹12.4 LPA" desc="Predicted average offer" color="text-amber-500" />
          </div>
          <PredictionTable
            headers={['Student', 'Skills Match', 'Company Fit', 'Package Est.', 'Probability']}
            rows={[
              ['Alice Johnson', '92%', 'Google', '₹18 LPA', '88%'],
              ['Bob Smith', '61%', 'TCS', '₹6 LPA', '72%'],
              ['Charlie K.', '78%', 'Microsoft', '₹14 LPA', '81%'],
              ['Diana L.', '95%', 'Amazon', '₹22 LPA', '93%'],
              ['Eve M.', '48%', 'Wipro', '₹4.5 LPA', '55%'],
            ]}
          />
        </div>
      )}

      {activeTab === 'resume' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon="📄" title="Avg Resume Score" value="72/100" desc="ATS compatibility average" color="text-blue-500" />
            <StatCard icon="✅" title="ATS Pass Rate" value="64%" desc="Resumes passing ATS filters" color="text-emerald-500" />
            <StatCard icon="📝" title="Needs Improvement" value="38" desc="Resumes scoring below 60" color="text-rose-500" />
          </div>
          <PredictionTable
            headers={['Student', 'ATS Score', 'Keywords', 'Format', 'Recommendation']}
            rows={[
              ['Alice Johnson', '88', '✅ Strong', '✅ Clean', 'Add leadership section'],
              ['Bob Smith', '52', '⚠️ Weak', '✅ Clean', 'Add project descriptions'],
              ['Charlie K.', '74', '✅ Good', '⚠️ Fix spacing', 'Optimize keywords'],
              ['Diana L.', '95', '✅ Excellent', '✅ Perfect', 'Ready to submit'],
              ['Eve M.', '41', '❌ Missing', '❌ Poor', 'Major rewrite needed'],
            ]}
          />
        </div>
      )}
    </div>
  );
}
