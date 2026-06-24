import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Activity, Key, ShieldCheck, Database, RefreshCw, AlertCircle, 
  HelpCircle, Server, TrendingUp, TrendingDown, Layers, Terminal
} from 'lucide-react';
import { io } from 'socket.io-client';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import './AdminApiSettings.css';

const COLORS = ['#22d3ee', '#a78bfa', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState({ studentGrowth: [], quizAttempts: [], aiUsage: [] });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [safeMode, setSafeMode] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchData();

    // Establish WebSocket Connection
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '5000').replace('5174', '5000');
    socketRef.current = io(socketUrl);

    socketRef.current.on('new_log', (log) => {
      setLogs((prev) => [log, ...prev].slice(0, 15));
    });

    socketRef.current.on('new_alert', (alert) => {
      toast((t) => (
        <span className="flex items-center gap-2 text-xs font-semibold text-white">
          <AlertCircle className="w-4 h-4 text-rose-500 animate-bounce" />
          <div>
            <strong className="block text-rose-400">ALERT: {alert.title}</strong>
            {alert.message}
          </div>
        </span>
      ), {
        style: { background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px' }
      });
    });

    // Polling fallback every 10 seconds for real-time overview updates
    const timer = setInterval(() => {
      syncOverview();
    }, 10000);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      clearInterval(timer);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([syncOverview(), syncActivityAndStats()]);
    } catch (err) {
      toast.error('Failed to sync system statistics.');
    } finally {
      setLoading(false);
    }
  };

  const syncOverview = async () => {
    try {
      const res = await api.get('/dashboard/overview');
      setOverview(res.data);
      // Fetch system logs
      const logRes = await api.get('/admin/system/logs?limit=15');
      setLogs(logRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const syncActivityAndStats = async () => {
    try {
      const [actRes, statsRes] = await Promise.all([
        api.get('/dashboard/activity'),
        api.get('/dashboard/stats')
      ]);
      setActivity(actRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
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
      syncOverview();
    } catch (err) {
      toast.error('Emergency override toggle failed.');
    }
  };

  if (loading) {
    return (
      <div className="friday-premium-dashboard flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-xs tracking-wider uppercase">Loading Enterprise Dashboard Matrix...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Students', value: overview?.totalStudents || 0, icon: <Users />, color: 'text-cyan-400', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.15)]' },
    { label: 'Active Students Today', value: overview?.activeStudentsToday || 0, icon: <Activity className="animate-pulse" />, color: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
    { label: 'Total Questions', value: overview?.totalQuestions || 0, icon: <HelpCircle />, color: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' },
    { label: 'Success Rate (AI)', value: `${overview?.successRate || 100}%`, icon: <Server />, color: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(167,139,250,0.15)]' },
  ];

  return (
    <div className="friday-admin-container relative space-y-6">
      <div className="friday-grid-overlay" />
      <div className="friday-hud-scanline" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="friday-hud-logo text-2xl font-black text-white flex items-center gap-2 tracking-wider">
            ⚡ ENTERPRISE CONTROLS & TELEMETRY
          </h1>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-0.5">Real-time DB logs, custom AI routing, and system monitoring</p>
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
            {safeMode ? 'SAFE MODE ACTIVE' : 'EMERGENCY OVERRIDE'}
          </button>
          <button onClick={fetchData} className="px-3.5 py-1.5 bg-slate-900 border border-white/5 text-xs text-cyan-300 rounded-lg hover:border-cyan-500/30 transition flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Synchronize
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`friday-cyber-card p-5 rounded-2xl flex items-center gap-4 border border-white/5 bg-slate-950/40 backdrop-blur-xl ${kpi.glow}`}>
            <div className={`p-3 bg-white/5 border border-white/10 rounded-xl ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{kpi.label}</span>
              <span className="text-xl font-black text-white">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Activity Area Chart */}
        <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl lg:col-span-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> DAILY ACTIVITY INTENSITY MATRIX
          </h3>
          <div className="h-[250px] w-full">
            {activity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Area type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorActivity)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">No activity logged in the past week.</div>
            )}
          </div>
        </div>

        {/* AI Usage Breakdown Pie Chart */}
        <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" /> AI ROUTING DISTRIBUTIONS
          </h3>
          <div className="h-[200px] w-full flex items-center justify-center">
            {stats.aiUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.aiUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="requests"
                    nameKey="provider"
                  >
                    {stats.aiUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs">AI traffic registry idle.</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2 text-[9px] text-slate-300 font-mono">
            {stats.aiUsage.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{item.provider.toUpperCase()} ({item.requests})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Student Growth Chart */}
        <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> STUDENT SIGNUP GROWTH
          </h3>
          <div className="h-[220px] w-full">
            {stats.studentGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.studentGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fill="rgba(16,185,129,0.05)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">Waiting for student registry inputs.</div>
            )}
          </div>
        </div>

        {/* Quiz Attempts Chart */}
        <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" /> QUIZ PARTICIPATIONS (7D)
          </h3>
          <div className="h-[220px] w-full">
            {stats.quizAttempts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.quizAttempts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Bar dataKey="attempts" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                    {stats.quizAttempts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#f59e0b" fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">No quiz submissions logged.</div>
            )}
          </div>
        </div>

      </div>

      {/* Real-time Activity Feed Stream */}
      <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" /> LIVE TELEMETRY DEPLOYMENT ACTIVITY STREAM
        </h3>
        <div className="hologram-scan p-4 rounded-xl text-[10px] space-y-2.5 max-h-60 overflow-y-auto font-mono">
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id || Math.random()} className="flex gap-2 items-start text-xs border-b border-white/5 pb-1">
                <span className="text-slate-500">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                <span className="text-cyan-400 font-bold uppercase">[{log.module || 'SYSTEM'}]</span>
                <span className="text-white font-semibold">{log.user_name || 'System / Service'}</span>
                <span className="text-slate-400">event:</span>
                <span className="text-purple-400 font-semibold">"{log.action}"</span>
                {log.value && <span className="text-slate-500">({log.value})</span>}
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
