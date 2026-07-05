import { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, Clock, BarChart3, Layers, UserCheck, ShieldAlert, Award } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import AdminTabBar from '../../components/AdminTabBar';
import './AdminApiSettings.css';

const ANALYTICS_TABS = [
  { id: 'student', label: 'Student Analytics', icon: '👥' },
  { id: 'quiz', label: 'Quiz Analytics', icon: '📝' },
  { id: 'coding', label: 'Coding Analytics', icon: '💻' },
  { id: 'learning', label: 'Learning Analytics', icon: '📚' },
  { id: 'ai', label: 'AI Analytics', icon: '🧠' },
];

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState('student');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/system/analytics');
      setData(data);
    } catch (err) {
      toast.error('Failed to load analytics insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="friday-premium-dashboard flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm tracking-wider uppercase">Computing Analytics Matrix...</p>
        </div>
      </div>
    );
  }

  const maxTopicCount = data?.hotTopics?.length > 0 ? Math.max(...data.hotTopics.map(t => t.count)) : 1;
  const maxHourCount = data?.peakHours?.length > 0 ? Math.max(...data.peakHours.map(h => h.count)) : 1;
  const maxFeatureCount = data?.features?.length > 0 ? Math.max(...data.features.map(f => f.count)) : 1;
  const totalFeatureUsage = data?.features?.reduce((sum, f) => sum + f.count, 0) || 1;

  return (
    <div className="space-y-6" style={{ color: 'var(--db-text-main)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
            📊 Analytics
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--db-text-muted)' }}>Monitor student journeys, quiz intelligence metrics, coding performance, and AI feature usage.</p>
        </div>
        <button onClick={fetchAnalytics} className="px-3.5 py-1.5 border text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Insights
        </button>
      </div>

      <AdminTabBar tabs={ANALYTICS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Container */}
      <div className="space-y-6">
        
        {/* 1. Student Analytics */}
        {activeTab === 'student' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Engagement Funnel */}
            <div className="p-5 rounded-2xl border text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" /> Student Learning Journey Funnel
              </h3>
              <div className="space-y-3">
                {[
                  { stage: 'Account Created', pct: 100, color: 'bg-cyan-500' },
                  { stage: 'Profile Completed', pct: 72, color: 'bg-blue-500' },
                  { stage: 'AI Tutor Used', pct: 45, color: 'bg-purple-500' },
                  { stage: 'Quiz Taken', pct: 30, color: 'bg-amber-500' },
                  { stage: 'Goal Achievement', pct: 12, color: 'bg-emerald-500' },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-[10px] w-28 text-right shrink-0" style={{ color: 'var(--db-text-muted)' }}>{step.stage}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/5">
                      <div className={`h-full ${step.color}`} style={{ width: `${step.pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold w-10">{step.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Hours Heatmap */}
            <div className="p-5 rounded-2xl border text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Peak Usage Hours Heatmap
              </h3>
              <div className="grid grid-cols-6 gap-1.5 text-[9px] font-bold">
                {Array.from({ length: 24 }, (_, h) => {
                  const hourStr = `${String(h).padStart(2, '0')}:00`;
                  const match = data?.peakHours?.find(p => p.hour === hourStr);
                  const count = match ? match.count : 0;
                  const intensity = maxHourCount > 0 ? count / maxHourCount : 0;

                  return (
                    <div
                      key={h}
                      className="p-2 rounded-lg border text-center flex flex-col justify-between"
                      style={{
                        backgroundColor: intensity > 0.7 ? 'rgba(59, 130, 246, 0.2)' : 'var(--db-input-bg)',
                        borderColor: intensity > 0.7 ? 'rgba(59, 130, 246, 0.4)' : 'var(--db-sidebar-border)'
                      }}
                    >
                      <span style={{ color: 'var(--db-text-muted)' }}>{hourStr}</span>
                      <span className="font-bold text-[10px] mt-0.5">{count} hits</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. Quiz Analytics */}
        {activeTab === 'quiz' && (
          <div className="p-5 rounded-2xl border space-y-4 text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider">Quiz Performance Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="font-bold block">Average Quiz Score</span>
                <span className="block text-xl font-black text-blue-500 mt-1">74.2%</span>
                <span style={{ color: 'var(--db-text-muted)' }}>Across 1,240 submitted quizzes</span>
              </div>
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="font-bold block">First-Time Pass Rate</span>
                <span className="block text-xl font-black text-violet-500 mt-1">68.5%</span>
                <span style={{ color: 'var(--db-text-muted)' }}>Students scoring {'>'}= 50% on first run</span>
              </div>
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="font-bold block">Active Quiz Count</span>
                <span className="block text-xl font-black text-emerald-500 mt-1">45 quizzes</span>
                <span style={{ color: 'var(--db-text-muted)' }}>Currently deployed challenges</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Coding Analytics */}
        {activeTab === 'coding' && (
          <div className="p-5 rounded-2xl border space-y-4 text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider">Coding Performance Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="font-bold block">Compiler Pass Rate</span>
                <span className="block text-xl font-black text-emerald-500 mt-1">82.4%</span>
                <span style={{ color: 'var(--db-text-muted)' }}>Submissions compiling successfully</span>
              </div>
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="font-bold block">Average Attempt Limit</span>
                <span className="block text-xl font-black text-blue-500 mt-1">2.4 runs</span>
                <span style={{ color: 'var(--db-text-muted)' }}>Attempts before puzzle completion</span>
              </div>
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="font-bold block">Common Language</span>
                <span className="block text-xl font-black text-violet-500 mt-1">Python</span>
                <span style={{ color: 'var(--db-text-muted)' }}>Most used editor runtime environment</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Learning Analytics */}
        {activeTab === 'learning' && (
          <div className="p-5 rounded-2xl border text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" /> Most Searched Topics & AI Prompts
            </h3>
            <div className="space-y-3">
              {data?.hotTopics?.length > 0 ? data.hotTopics.map((topic, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold truncate max-w-[220px]">{topic.query || '(empty)'}</span>
                    <span className="text-blue-500 font-mono font-bold">{topic.count} hits</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${(topic.count / maxTopicCount) * 100}%` }}
                    />
                  </div>
                </div>
              )) : (
                <p className="text-xs italic" style={{ color: 'var(--db-text-muted)' }}>No search or prompt data recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* 5. AI Analytics */}
        {activeTab === 'ai' && (
          <div className="p-5 rounded-2xl border text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> AI Features Usage Analysis
            </h3>
            <div className="space-y-4">
              {data?.features?.length > 0 ? data.features.map((feat, idx) => {
                const percentage = totalFeatureUsage > 0 ? ((feat.count / totalFeatureUsage) * 100).toFixed(1) : 0;
                const colors = ['from-blue-500 to-indigo-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500'];
                return (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-[10px]">
                      <span className="font-bold uppercase">{feat.feature_name}</span>
                      <span style={{ color: 'var(--db-text-muted)' }}>{feat.count} times ({percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
                      <div
                        className={`h-full bg-gradient-to-r ${colors[idx % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }) : (
                <p className="text-xs italic" style={{ color: 'var(--db-text-muted)' }}>No feature usage logs found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
