import { useEffect, useState } from 'react';
import { RefreshCw, Bell, ShieldAlert, CheckCircle, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import './AdminApiSettings.css';

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/system/alerts');
      setAlerts(data);
    } catch (err) {
      toast.error('Failed to load system alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.post('/admin/system/alerts/resolve', { id });
      toast.success('Alert resolved successfully.');
      fetchAlerts();
    } catch (err) {
      toast.error('Failed to resolve alert');
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

  if (loading && alerts.length === 0) {
    return (
      <div className="friday-premium-dashboard flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm tracking-wider uppercase">Scanning Alert Signals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="friday-admin-container relative space-y-6">
      <div className="friday-grid-overlay" />
      <div className="friday-hud-scanline" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="friday-hud-logo text-2xl font-black text-white flex items-center gap-2 tracking-wider">
            SYSTEM ALERTS MONITOR
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest mt-0.5">Real-time infrastructure monitoring and auto-resolution tracking</p>
        </div>
        <button onClick={fetchAlerts} className="px-3.5 py-1.5 bg-slate-900 border border-white/5 text-xs text-cyan-300 rounded-lg hover:border-cyan-500/30 transition flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Alerts
        </button>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="friday-cyber-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active Alerts</span>
            <span className="text-xl font-black text-rose-400">{activeAlerts.length}</span>
          </div>
        </div>

        <div className="friday-cyber-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Resolved</span>
            <span className="text-xl font-black text-emerald-400">{resolvedAlerts.length}</span>
          </div>
        </div>

        <div className="friday-cyber-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Critical Priority</span>
            <span className="text-xl font-black text-amber-400">
              {activeAlerts.filter(a => a.priority === 'Critical').length}
            </span>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="friday-cyber-card p-5 rounded-2xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" /> Active System Alerts
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
                    className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold hover:border-emerald-500/40 transition flex items-center gap-1 shrink-0"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Resolve
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolved Alerts Timeline */}
      {resolvedAlerts.length > 0 && (
        <div className="friday-cyber-card p-5 rounded-2xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Resolved Alert History
          </h3>
          <div className="space-y-2">
            {resolvedAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-3 bg-slate-950/40 border border-white/5 rounded-xl text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-white font-semibold">{alert.title}</span>
                  <span className="text-slate-500 text-[10px] ml-2">{alert.priority}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono shrink-0">
                  {new Date(alert.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {alerts.length === 0 && (
        <div className="friday-cyber-card p-10 rounded-2xl text-center">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-white mb-1">All Systems Nominal</h3>
          <p className="text-[11px] text-slate-400">No system alerts detected. Monitoring is active and running.</p>
        </div>
      )}
    </div>
  );
}
