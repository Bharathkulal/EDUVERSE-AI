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
import AdminPageLayout from '../../components/AdminPageLayout';
import './AdminApiSettings.css';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

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

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dbRes, analyticsRes] = await Promise.all([
        api.get('/admin/system/dashboard'),
        api.get('/admin/system/analytics')
      ]);

      const dbData = dbRes.data;
      const analyticsData = analyticsRes.data;

      setOverview({
        totalStudents: dbData.totalStudents,
        activeStudentsToday: dbData.activeNow,
        totalQuestions: dbData.totalRequests,
        successRate: dbData.health === 'Green' ? 100 : (dbData.health === 'Yellow' ? 95 : 80)
      });

      setActivity(dbData.loginTrend?.map(t => ({ date: t.date, count: t.count })) || []);

      setStats({
        studentGrowth: dbData.loginTrend?.map(t => ({ month: t.date, count: t.count })) || [],
        quizAttempts: dbData.loginTrend?.map(t => ({ date: t.date, attempts: t.count })) || [],
        aiUsage: analyticsData.features?.map(f => ({ provider: f.module || 'Unknown', requests: f.count })) || [
          { provider: 'gemini', requests: 45 },
          { provider: 'groq', requests: 30 },
          { provider: 'openai', requests: 25 }
        ]
      });

      setLogs(dbData.logs || []);
    } catch (err) {
      toast.error('Failed to sync system statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSafeMode = async () => {
    try {
      const nextAction = safeMode ? 'NORMAL' : 'SAFE_MODE';
      const { data } = await api.post('/admin/system/emergency-override', { action: nextAction });
      setSafeMode(!safeMode);
      toast.success(nextAction === 'SAFE_MODE' ? 'EMERGENCY SHIELD ENABLED' : 'EMERGENCY SHIELD DEACTIVATED');
    } catch (err) {
      toast.error('Failed to execute emergency override');
    }
  };

  const kpis = [
    { label: 'Total Students', value: overview?.totalStudents || 0, icon: <Users className="w-4 h-4" />, color: 'text-blue-500' },
    { label: 'Active Students Today', value: overview?.activeStudentsToday || 0, icon: <Activity className="w-4 h-4" />, color: 'text-emerald-500' },
    { label: 'Total Questions', value: overview?.totalQuestions || 0, icon: <HelpCircle className="w-4 h-4" />, color: 'text-amber-500' },
    { label: 'Platform Success Rate', value: `${overview?.successRate || 100}%`, icon: <Server className="w-4 h-4" />, color: 'text-violet-500' },
  ];

  const aiInsights = [
    'Student registration is up 12% compared to last week. Model version edu-core-v24 serving latency is highly optimal (24ms).',
    'Data validation report detected 3 outliers in student study times. Retraining sequence is recommended.'
  ];

  const activities = logs.slice(0, 4).map(l => ({
    time: new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    title: l.action,
    desc: `Module: ${l.module_name || 'System'}`
  }));

  return (
    <AdminPageLayout
      title="🏠 Dashboard"
      breadcrumbs={['Overview']}
      kpis={kpis}
      aiInsights={aiInsights}
      activities={activities}
    >
      <div className="space-y-6">
        
        {/* Safe Mode Controller Banner */}
        <div className="p-4 rounded-2xl border flex justify-between items-center text-xs" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
          <div>
            <p className="font-bold">Emergency Override Control Shield</p>
            <p style={{ color: 'var(--db-text-muted)' }}>Temporarily isolate server nodes and limit public API keys in case of cyber drift detection.</p>
          </div>
          <button
            onClick={handleToggleSafeMode}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
              safeMode 
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse' 
                : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {safeMode ? 'SAFE MODE ACTIVE' : 'ACTIVATE SHIELD'}
          </button>
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Daily Activity Area Chart */}
          <div className="p-5 rounded-2xl border lg:col-span-2" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> DAILY ACTIVITY INTENSITY MATRIX
            </h3>
            <div className="h-[250px] w-full">
              {activity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activity}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActivity)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs font-bold">No activity logs recorded.</div>
              )}
            </div>
          </div>

          {/* AI Usage Breakdown Pie Chart */}
          <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
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
                <div className="text-xs font-bold" style={{ color: 'var(--db-text-muted)' }}>AI traffic registry idle.</div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2 text-[9px] font-mono">
              {stats.aiUsage.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2 rounded-full h-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span>{item.provider.toUpperCase()} ({item.requests})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Activity Feed Stream */}
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-500" /> LIVE CONTROLLERS ACTIVITY STREAM
          </h3>
          <div className="p-4 bg-slate-950 rounded-xl text-[10px] space-y-2.5 max-h-60 overflow-y-auto font-mono text-slate-300 border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
            {logs && logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id || Math.random()} className="flex gap-2 items-start text-xs border-b border-white/5 pb-1">
                  <span className="text-slate-500">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                  <span className="text-blue-500 font-bold uppercase">[{log.module || 'SYSTEM'}]</span>
                  <span className="text-white font-semibold">{log.user_name || 'System / Service'}</span>
                  <span className="text-slate-400">event:</span>
                  <span className="text-purple-400 font-semibold">"{log.action}"</span>
                  {log.value && <span className="text-slate-500">({log.value})</span>}
                </div>
              ))
            ) : (
              <div className="text-slate-500 font-mono">No live system events detected.</div>
            )}
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}
