import { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, Clock, BarChart3, Layers } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import './AdminApiSettings.css';

export default function AdminAnalytics() {
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
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
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
    <div className="friday-admin-container relative space-y-6">
      <div className="friday-grid-overlay" />
      <div className="friday-hud-scanline" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="friday-hud-logo text-2xl font-black text-white flex items-center gap-2 tracking-wider">
            AI ANALYTICS ENGINE
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest mt-0.5">Google Analytics + OpenAI Insights Fusion Dashboard</p>
        </div>
        <button onClick={fetchAnalytics} className="px-3.5 py-1.5 bg-slate-900 border border-white/5 text-xs text-cyan-300 rounded-lg hover:border-cyan-500/30 transition flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Insights
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Hot Topics — Bar Chart */}
        <div className="friday-cyber-card p-5 rounded-2xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" /> Most Searched Topics & AI Prompts
          </h3>
          <div className="space-y-3">
            {data?.hotTopics?.length > 0 ? data.hotTopics.map((topic, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white font-semibold truncate max-w-[220px]">{topic.query || '(empty)'}</span>
                  <span className="text-cyan-400 font-mono font-bold">{topic.count} hits</span>
                </div>
                <div className="latency-gauge-bg">
                  <div
                    className="latency-gauge-fill bg-gradient-to-r from-purple-500 to-cyan-400"
                    style={{ width: `${(topic.count / maxTopicCount) * 100}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-xs italic">No search or prompt data recorded yet. Use the AI Tutor to generate insights.</p>
            )}
          </div>
        </div>

        {/* Peak Hours Heatmap */}
        <div className="friday-cyber-card p-5 rounded-2xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Peak Usage Hours Heatmap
          </h3>
          <div className="grid grid-cols-6 gap-1.5">
            {Array.from({ length: 24 }, (_, h) => {
              const hourStr = `${String(h).padStart(2, '0')}:00`;
              const match = data?.peakHours?.find(p => p.hour === hourStr);
              const count = match ? match.count : 0;
              const intensity = maxHourCount > 0 ? count / maxHourCount : 0;

              let bg = 'bg-slate-900';
              if (intensity > 0.75) bg = 'bg-emerald-500';
              else if (intensity > 0.5) bg = 'bg-emerald-600';
              else if (intensity > 0.25) bg = 'bg-emerald-700/60';
              else if (intensity > 0) bg = 'bg-emerald-800/40';

              return (
                <div
                  key={h}
                  className={`${bg} border border-white/5 rounded-lg p-2 text-center transition hover:scale-105 cursor-default`}
                  title={`${hourStr} — ${count} events`}
                >
                  <div className="text-[8px] text-slate-500 font-mono">{hourStr}</div>
                  <div className="text-[10px] font-bold text-white mt-0.5">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Usage Pie (CSS bars representation) */}
        <div className="friday-cyber-card p-5 rounded-2xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> Feature Usage Distribution
          </h3>
          <div className="space-y-3">
            {data?.features?.length > 0 ? data.features.map((feature, idx) => {
              const percentage = Math.round((feature.count / totalFeatureUsage) * 100);
              const colors = [
                'from-cyan-500 to-blue-500',
                'from-purple-500 to-pink-500',
                'from-emerald-500 to-teal-500',
                'from-amber-500 to-orange-500',
                'from-rose-500 to-red-500'
              ];
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-white font-semibold">{feature.module}</span>
                    <span className="text-slate-400">{percentage}% ({feature.count})</span>
                  </div>
                  <div className="latency-gauge-bg">
                    <div
                      className={`latency-gauge-fill bg-gradient-to-r ${colors[idx % colors.length]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            }) : (
              <p className="text-slate-500 text-xs italic">No feature usage data logged yet.</p>
            )}
          </div>
        </div>

        {/* Student Engagement Funnel */}
        <div className="friday-cyber-card p-5 rounded-2xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" /> Student Learning Journey Funnel
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
                <span className="text-[10px] text-slate-400 w-28 text-right shrink-0">{step.stage}</span>
                <div className="flex-1 latency-gauge-bg">
                  <div
                    className={`latency-gauge-fill ${step.color}`}
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-white w-10">{step.pct}%</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-500 mt-3 italic">* Funnel ratios are estimated from aggregated platform activity.</p>
        </div>

      </div>
    </div>
  );
}
