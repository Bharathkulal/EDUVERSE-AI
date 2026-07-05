import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Download, Filter, Search, RefreshCw, Terminal, Layers, ShieldAlert, Award } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import AdminTabBar from '../../components/AdminTabBar';
import './AdminApiSettings.css';

const LOG_TABS = [
  { id: 'activity', label: 'Activity Logs', icon: '📋' },
  { id: 'system', label: 'System Logs', icon: '💻' },
  { id: 'audit', label: 'Audit Logs', icon: '🔒' },
];

export default function AdminSystemLogs() {
  const [activeTab, setActiveTab] = useState('activity');
  const [logs, setLogs] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const liveTimer = useRef(null);

  useEffect(() => {
    fetchLogs();
    return () => clearInterval(liveTimer.current);
  }, []);

  useEffect(() => {
    if (isLive) {
      liveTimer.current = setInterval(fetchLogsSilent, 3000);
    } else {
      clearInterval(liveTimer.current);
    }
    return () => clearInterval(liveTimer.current);
  }, [isLive, filterModule, filterAction]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let query = `/admin/system/logs?limit=100`;
      if (filterModule) query += `&module=${filterModule}`;
      if (filterAction) query += `&action=${filterAction}`;

      const { data } = await api.get(query);
      setLogs(data);
    } catch (err) {
      toast.error('Failed to load system logs stream');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogsSilent = async () => {
    try {
      let query = `/admin/system/logs?limit=100`;
      if (filterModule) query += `&module=${filterModule}`;
      if (filterAction) query += `&action=${filterAction}`;

      const { data } = await api.get(query);
      setLogs(data);
    } catch (err) {
      console.warn('Silent log update failure');
    }
  };

  const getFilteredLogs = () => {
    return logs.filter(log => {
      const content = `${log.module_name} ${log.action_type} ${log.log_message} ${log.username || ''}`.toLowerCase();
      return content.includes(search.toLowerCase());
    });
  };

  const handleDownload = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(logs, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `eduverse_system_logs_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Logs exported successfully');
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="space-y-6" style={{ color: 'var(--db-text-main)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
            📋 Logs & Audit
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--db-text-muted)' }}>Check live engagement timelines, request actions, audit trails, and core diagnostics.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsLive(!isLive)} className="px-3.5 py-1.5 border text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}>
            {isLive ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-blue-500" />}
            {isLive ? 'Pause Stream' : 'Go Live'}
          </button>
          <button onClick={handleDownload} className="px-3.5 py-1.5 border text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}>
            <Download className="w-3.5 h-3.5 text-emerald-500" /> Export JSON
          </button>
        </div>
      </div>

      <AdminTabBar tabs={LOG_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Container */}
      <div className="space-y-6">
        
        {/* 1. Activity Logs */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Filter logs (IP, User, msg)..."
                className="px-3.5 py-1.5 border text-xs rounded-lg outline-none w-64"
                style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="px-3.5 py-1.5 border text-xs rounded-lg outline-none"
                style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
              >
                <option value="">All Modules</option>
                <option value="auth">Auth Module</option>
                <option value="content">Content Studio</option>
                <option value="quizzes">Quiz Intelligence</option>
                <option value="ml">ML Studio</option>
              </select>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border font-mono text-xs max-h-[500px] overflow-y-auto space-y-1.5 text-slate-300" style={{ borderColor: 'var(--db-sidebar-border)' }}>
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex flex-col md:flex-row justify-between hover:bg-white/5 p-2 rounded gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                    <span className="text-blue-400 font-bold">[{log.module_name}]</span>
                    <span className="font-bold text-amber-500">{log.action_type}</span>
                    <span>{log.log_message}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">{log.username || 'system'}</span>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <p className="text-center py-6 text-slate-500 italic">No activity logs matching filter.</p>
              )}
            </div>
          </div>
        )}

        {/* 2. System Logs */}
        {activeTab === 'system' && (
          <div className="p-5 rounded-2xl border space-y-3 text-left text-xs" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="font-bold">Core Server Metrics & Events</h3>
            {[
              { time: '11:02:40', level: 'INFO', msg: 'Node.js Express Server serving at http://localhost:5000', color: 'text-blue-500' },
              { time: '11:02:41', level: 'INFO', msg: 'Postgres database connection pool active (20/20 connections)', color: 'text-blue-500' },
              { time: '11:02:42', level: 'WARN', msg: 'Serving latency on /admin/system/logs exceeded threshold: 242ms', color: 'text-amber-500' },
              { time: '11:02:45', level: 'INFO', msg: 'ML Prediction serving engine cache warm (2 deployed versions)', color: 'text-blue-500' },
            ].map((sysLog, i) => (
              <div key={i} className="flex gap-3 font-mono">
                <span className="text-slate-500">[{sysLog.time}]</span>
                <span className={`font-bold ${sysLog.color}`}>[{sysLog.level}]</span>
                <span>{sysLog.msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* 3. Audit Logs */}
        {activeTab === 'audit' && (
          <div className="p-5 rounded-2xl border space-y-3 text-left text-xs" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="font-bold">Security & Administration Changes Audit Trail</h3>
            {[
              { date: '2026-07-05 09:30', user: 'admin@eduverse.ai', action: 'API_KEY_ROTATED', target: 'Gemini AI API Key', ip: '192.168.1.1' },
              { date: '2026-07-05 08:45', user: 'admin@eduverse.ai', action: 'STUDENT_SUSPENDED', target: 'Bob Smith (ID: #104)', ip: '192.168.1.1' },
              { date: '2026-07-04 14:15', user: 'admin@eduverse.ai', action: 'SYSTEM_SETTINGS_MODIFIED', target: 'Registration mode set to Open', ip: '192.168.1.1' },
            ].map((audit, i) => (
              <div key={i} className="p-3 bg-[var(--db-input-bg)] rounded-xl border flex justify-between items-center text-xs" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <div>
                  <p className="font-bold text-amber-500">{audit.action}</p>
                  <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>Target: {audit.target}</p>
                </div>
                <div className="text-right" style={{ color: 'var(--db-text-muted)' }}>
                  <p className="font-bold text-[var(--db-text-main)]">{audit.user}</p>
                  <p className="text-[9px]">{audit.date} • IP: {audit.ip}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
