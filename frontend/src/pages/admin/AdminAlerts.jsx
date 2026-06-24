import { useEffect, useState } from 'react';
import { 
  RefreshCw, Bell, ShieldAlert, CheckCircle, AlertTriangle, AlertCircle, XCircle,
  Cpu, Database, ShieldCheck, Terminal, Server, Key, Eye, Lock
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import './AdminApiSettings.css';

export default function AdminAlerts() {
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' | 'health' | 'security'
  const [alerts, setAlerts] = useState([]);
  const [health, setHealth] = useState(null);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    fetchCockpitData();
  }, [activeTab]);

  const fetchCockpitData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'alerts') {
        const { data } = await api.get('/admin/system/alerts');
        setAlerts(data);
      } else if (activeTab === 'health') {
        const { data } = await api.get('/system-health');
        setHealth(data);
      } else if (activeTab === 'security') {
        // Fetch audit logs as security logs
        const { data } = await api.get('/admin/system/logs?limit=50');
        // Filter for security related events
        const sec = data.filter(l => l.module === 'Auth' || l.action.includes('login') || l.action.includes('KEY'));
        setSecurityLogs(sec);
      }
    } catch (err) {
      toast.error('Failed to sync cockpit telemetry data');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await api.post('/admin/system/alerts/resolve', { id });
      toast.success('Alert resolved successfully.');
      fetchCockpitData();
    } catch (err) {
      toast.error('Failed to resolve alert');
    } finally {
      setResolvingId(null);
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'Critical':
        return { icon: <XCircle className="w-4 h-4" />, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
      case 'High':
        return { icon: <AlertCircle className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      case 'Medium':
        return { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
      default:
        return { icon: <Bell className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'Active');
  const resolvedAlerts = alerts.filter(a => a.status === 'Resolved');

  return (
    <div className="friday-admin-container relative space-y-6">
      <div className="friday-grid-overlay" />
      <div className="friday-hud-scanline" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="friday-hud-logo text-2xl font-black text-white flex items-center gap-2 tracking-wider">
            🚨 SYSTEM OPERATIONS COCKPIT
          </h1>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-0.5 font-mono font-bold">Monitor Infrastructure Health, Firewalls, Session audits, and Failover systems</p>
        </div>
        <button onClick={fetchCockpitData} className="px-3.5 py-1.5 bg-slate-900 border border-white/5 text-xs text-cyan-300 rounded-lg hover:border-cyan-500/30 transition flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Cockpit Tabs */}
      <div className="flex border-b border-white/5 gap-2">
        <button onClick={() => setActiveTab('alerts')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${activeTab === 'alerts' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-slate-400 hover:text-white'}`}>
          <Bell className="w-4 h-4" /> System Alerts
        </button>
        <button onClick={() => setActiveTab('health')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${activeTab === 'health' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-slate-400 hover:text-white'}`}>
          <Cpu className="w-4 h-4" /> Health Diagnostics
        </button>
        <button onClick={() => setActiveTab('security')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${activeTab === 'security' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-slate-400 hover:text-white'}`}>
          <Lock className="w-4 h-4" /> Security Firewall
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Tab 1: Alerts */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              
              {/* Stats summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="friday-cyber-card p-4 rounded-2xl flex items-center gap-4 bg-slate-950/40 border border-white/5">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active Alerts</span>
                    <span className="text-xl font-black text-rose-400">{activeAlerts.length}</span>
                  </div>
                </div>

                <div className="friday-cyber-card p-4 rounded-2xl flex items-center gap-4 bg-slate-950/40 border border-white/5">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Resolved</span>
                    <span className="text-xl font-black text-emerald-400">{resolvedAlerts.length}</span>
                  </div>
                </div>

                <div className="friday-cyber-card p-4 rounded-2xl flex items-center gap-4 bg-slate-950/40 border border-white/5">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Critical Thresholds</span>
                    <span className="text-xl font-black text-amber-400">
                      {activeAlerts.filter(a => a.priority === 'Critical').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Alerts */}
              {activeAlerts.length > 0 ? (
                <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" /> Active System Warnings
                  </h3>
                  <div className="space-y-3">
                    {activeAlerts.map((alert) => {
                      const config = getPriorityConfig(alert.priority);
                      return (
                        <div key={alert.id} className={`flex items-start gap-4 p-4 rounded-xl border ${config.bg} ${config.border}`}>
                          <div className={`mt-0.5 ${config.color}`}>{config.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-black uppercase ${config.color}`}>{alert.priority}</span>
                              <span className="text-[9px] text-slate-500 font-mono">
                                {new Date(alert.created_at).toLocaleString()}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{alert.message}</p>
                          </div>
                          <button
                            onClick={() => handleResolve(alert.id)}
                            disabled={resolvingId === alert.id}
                            className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold hover:border-emerald-500/40 transition flex items-center gap-1 shrink-0"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Resolve
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="friday-cyber-card p-10 rounded-2xl text-center border border-white/5 bg-slate-950/40">
                  <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-sm font-bold text-white mb-1">All Systems Nominal</h3>
                  <p className="text-[11px] text-slate-400">No active system warnings detected. Infrastructures secure.</p>
                </div>
              )}

              {/* Resolved Alerts */}
              {resolvedAlerts.length > 0 && (
                <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Resolved Alert Log History
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {resolvedAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center gap-3 p-3 bg-slate-950/40 border border-white/5 rounded-xl text-xs font-mono">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-white font-semibold">{alert.title}</span>
                          <span className="text-slate-500 text-[10px] ml-2">{alert.priority}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 shrink-0">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Tab 2: Health Diagnostics */}
          {activeTab === 'health' && health && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              {/* Telemetry overview */}
              <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" /> API Server Resources
                </h3>
                
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Server Uptime</span>
                    <span className="text-white font-bold">{health.uptime}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Response Latency</span>
                    <span className="text-cyan-400 font-bold">{health.latency}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">CPU Usage</span>
                    <span className="text-amber-500 font-bold">{health.hardware?.cpuUsage}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Memory Heap Used</span>
                    <span className="text-white font-bold">{health.hardware?.memoryUsage?.heapUsed} / {health.hardware?.memoryUsage?.heapTotal}</span>
                  </div>
                </div>
              </div>

              {/* Service list */}
              <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" /> Database & Core Services
                </h3>
                
                <div className="space-y-3 pt-2">
                  {Object.entries(health.services || {}).map(([srvName, srvInfo]) => (
                    <div key={srvName} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-slate-400 capitalize">{srvName}</span>
                      <div className="flex items-center gap-2">
                        {srvInfo.latency && <span className="text-[10px] text-slate-500 font-mono">({srvInfo.latency})</span>}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          srvInfo.status === 'Healthy' || srvInfo.status === 'Connected'
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {srvInfo.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Security Firewall */}
          {activeTab === 'security' && (
            <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" /> Access Controls & Security Activity Stream
              </h3>
              
              <div className="hologram-scan p-4 rounded-xl text-[10px] space-y-2.5 max-h-[500px] overflow-y-auto font-mono">
                {securityLogs.map((log) => (
                  <div key={log.id} className="flex gap-2 items-start text-xs border-b border-white/5 pb-1 last:border-0">
                    <span className="text-slate-500">[{new Date(log.created_at).toLocaleString()}]</span>
                    <span className="text-rose-400 font-bold uppercase">[{log.module.toUpperCase()}]</span>
                    <span className="text-white font-semibold">{log.user_name || 'System / Auto'}</span>
                    <span className="text-slate-300">action:</span>
                    <span className="text-purple-400 font-bold">"{log.action}"</span>
                    {log.value && <span className="text-slate-400">({log.value})</span>}
                  </div>
                ))}
                {securityLogs.length === 0 && (
                  <p className="text-slate-500 italic">No access security events recorded.</p>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
