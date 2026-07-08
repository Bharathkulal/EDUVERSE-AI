import { useEffect, useState } from 'react';
import { 
  RefreshCw, Bell, ShieldAlert, CheckCircle, AlertTriangle, AlertCircle, XCircle,
  Cpu, Database, ShieldCheck, Terminal, Server, Key, Eye, Lock
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import AdminTabBar from '../../components/AdminTabBar';
import './AdminApiSettings.css';

const ALERT_TABS = [
  { id: 'system', label: 'System Alerts', icon: '🚨' },
  { id: 'dataset', label: 'Dataset Alerts', icon: '🗂' },
  { id: 'training', label: 'Training Alerts', icon: '🤖' },
];

export default function AdminAlerts() {
  const [activeTab, setActiveTab] = useState('system');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/system/alerts');
      setAlerts(data || []);
    } catch (err) {
      toast.error('Failed to sync cockpit telemetry alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await api.post(`/admin/system/alerts/${id}/resolve`);
      toast.success('Alert resolved and archive completed.');
      fetchAlerts();
    } catch (err) {
      toast.error('Error closing warning signal.');
    } finally {
      setResolvingId(null);
    }
  };

  // Filter alerts by active tab category
  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === 'dataset') {
      return alert.module?.toLowerCase().includes('data') || alert.module?.toLowerCase().includes('dataset');
    }
    if (activeTab === 'training') {
      return alert.module?.toLowerCase().includes('ml') || alert.module?.toLowerCase().includes('training');
    }
    // 'system' tab gets everything else
    return !alert.module?.toLowerCase().includes('data') && !alert.module?.toLowerCase().includes('ml');
  });

  return (
    <div className="space-y-6" style={{ color: 'var(--db-text-main)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
            🚨 Alerts Center
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--db-text-muted)' }}>Monitor active warnings, dataset drift alarms, and model training failure alerts.</p>
        </div>
        <button onClick={fetchAlerts} className="px-3.5 py-1.5 border text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}>
          <RefreshCw className="w-3.5 h-3.5" /> Synchronize Alerts
        </button>
      </div>

      <AdminTabBar tabs={ALERT_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Container */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.length > 0 ? (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 rounded-2xl border flex justify-between items-center text-xs text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {alert.severity === 'critical' ? (
                          <XCircle className="w-5 h-5 text-rose-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{alert.title}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${alert.severity === 'critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="mt-1" style={{ color: 'var(--db-text-muted)' }}>{alert.details}</p>
                        <p className="text-[9px] mt-1 font-mono" style={{ color: 'var(--db-text-muted)' }}>Module: {alert.module} • {new Date(alert.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    {alert.status !== 'resolved' && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={resolvingId === alert.id}
                        className="px-3.5 py-1.5 border text-xs font-bold text-emerald-500 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-lg cursor-pointer transition disabled:opacity-50"
                      >
                        Resolve Alert
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 rounded-2xl border text-center text-xs" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-muted)' }}>
                No active {activeTab} alerts detected. Platform status is fully operational.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
