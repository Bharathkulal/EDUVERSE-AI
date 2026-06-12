import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Activity, Key, ShieldCheck, Database, RefreshCw, AlertCircle, Play, Info
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import './AdminApiSettings.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [safeMode, setSafeMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/system/dashboard');
      setData(res.data);
      if (res.data.health === 'Red') {
        toast.error('System health alert: Critical latency/error spikes detected!');
      }
    } catch (err) {
      toast.error('Failed to load system overview stats.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSafeMode = async () => {
    const nextMode = !safeMode;
    const confirmMsg = nextMode 
      ? 'Emergency Safe Mode will instantly DISABLE all AI connections. Proceed?' 
      : 'Restore standard AI access operations?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const { data } = await api.post('/admin/system/emergency-override', {
        action: nextMode ? 'SAFE_MODE' : 'NORMAL'
      });
      setSafeMode(nextMode);
      toast.success(data.message);
      fetchData();
    } catch (err) {
      toast.error('Emergency trigger failover failed.');
    }
  };

  if (loading && !data) {
    return (
      <div className="friday-premium-dashboard flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm tracking-wider uppercase">Syncing Enterprise Dashboard Matrix...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Students', value: data?.totalStudents || 0, icon: <Users />, color: 'text-blue-400', glow: 'glow-cyan' },
    { label: 'Active Now (LIVE)', value: data?.activeNow || 0, icon: <Activity className="animate-pulse" />, color: 'text-emerald-400', glow: 'glow-emerald' },
    { label: 'Total Requests', value: data?.totalRequests || 0, icon: <Database />, color: 'text-purple-400', glow: 'glow-purple' },
    { label: 'Remaining Quota', value: data?.remainingQuota || 0, icon: <Key />, color: 'text-amber-400', glow: 'text-amber-400' },
  ];

  return (
    <div className="friday-admin-container relative space-y-6">
      <div className="friday-grid-overlay" />
      <div className="friday-hud-scanline" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="friday-hud-logo text-2xl font-black text-white flex items-center gap-2 tracking-wider">
            ENTERPRISE OVERVIEW CONTROL
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest mt-0.5">Vercel Performance Metrics & OpenAI System Operations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSafeMode}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition flex items-center gap-2 ${
              safeMode 
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse' 
                : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            {safeMode ? 'SAFE MODE ACTIVE' : 'EMERGENCY SAFE MODE'}
          </button>
          <button onClick={fetchData} className="px-3.5 py-1.5 bg-slate-900 border border-white/5 text-xs text-cyan-300 rounded-lg hover:border-cyan-500/30 transition flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Synchronize
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="friday-cyber-card p-5 rounded-2xl flex items-center gap-4">
            <div className={`p-3 bg-white/5 border border-white/10 rounded-xl ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{kpi.label}</span>
              <span className={`text-xl font-black text-white ${kpi.glow}`}>{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* System Health Info Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Health panel */}
        <div className="friday-cyber-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">SYSTEM STABILITY MATRIX</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              Real-time server query analysis tracking API latency exceptions, system database pools, and failover status rates.
            </p>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-slate-950/60 border border-white/5 rounded-2xl justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-5 h-5 ${data?.health === 'Green' ? 'text-emerald-400' : data?.health === 'Yellow' ? 'text-amber-400' : 'text-rose-400'}`} />
              <span className="text-xs font-bold text-slate-300">Status Protocols</span>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded border uppercase ${
              data?.health === 'Green' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : data?.health === 'Yellow' 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {data?.health || 'Green'} STABLE
            </span>
          </div>
        </div>

        {/* API Quota Gauge */}
        <div className="friday-cyber-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">GLOBAL API QUOTA ALLOCATION</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              Consolidated bandwidth limits assigned daily across all students profile quotas. Reset daily at 00:00 UTC.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Bandwidth Exhausted</span>
              <span>
                {Math.round(((data?.totalLimit - data?.remainingQuota) / (data?.totalLimit || 1)) * 100)}%
              </span>
            </div>
            <div className="latency-gauge-bg">
              <div 
                className="latency-gauge-fill bg-gradient-to-r from-purple-500 to-cyan-500" 
                style={{ width: `${Math.min(100, ((data?.totalLimit - data?.remainingQuota) / (data?.totalLimit || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick actions panel */}
        <div className="friday-cyber-card p-5 rounded-2xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">CYBER ACTION MATRIX</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link to="/admin/students" className="p-3 bg-slate-950/40 border border-white/5 rounded-xl hover:border-cyan-500/30 text-center font-semibold transition block text-slate-300">👥 Students</Link>
            <Link to="/admin/api-settings" className="p-3 bg-slate-950/40 border border-white/5 rounded-xl hover:border-cyan-500/30 text-center font-semibold transition block text-slate-300">🔑 API Matrix</Link>
            <Link to="/admin/logs" className="p-3 bg-slate-950/40 border border-white/5 rounded-xl hover:border-cyan-500/30 text-center font-semibold transition block text-slate-300">📋 Logs console</Link>
            <Link to="/admin/ml" className="p-3 bg-slate-950/40 border border-white/5 rounded-xl hover:border-cyan-500/30 text-center font-semibold transition block text-slate-300">⚙️ ML Panel</Link>
          </div>
        </div>

      </div>

      {/* Real-time activity logs stream console */}
      <div className="friday-cyber-card p-5 rounded-2xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">REAL-TIME ACTIVITY FEED STREAM</h3>
        <div className="hologram-scan p-4 rounded-xl text-[10px] space-y-2.5 max-h-60 overflow-y-auto">
          {data?.logs && data.logs.length > 0 ? (
            data.logs.map((log) => (
              <div key={log.id} className="flex gap-2 items-start font-mono">
                <span className="text-slate-500">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                <span className="text-cyan-400 font-bold">[{log.module.toUpperCase()}]</span>
                <span className="text-white font-semibold">{log.user_name || 'System'}</span>
                <span className="text-slate-400">triggered action:</span>
                <span className="text-purple-400 font-semibold">"{log.action}"</span>
                {log.value && <span className="text-slate-500">value: "{log.value}"</span>}
              </div>
            ))
          ) : (
            <div className="text-slate-500 font-mono">No live system events detected. Query pipeline is idle.</div>
          )}
        </div>
      </div>

    </div>
  );
}
