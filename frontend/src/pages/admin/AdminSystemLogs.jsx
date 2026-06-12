import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Download, Filter, Search, RefreshCw, Terminal } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import './AdminApiSettings.css';

export default function AdminSystemLogs() {
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
      console.warn('Silent logs fetch failed');
    }
  };

  const exportData = (format) => {
    if (logs.length === 0) {
      toast.error('No log records available to export.');
      return;
    }

    let fileContent = '';
    let mimeType = 'text/plain';
    let fileName = `eduverse_system_logs_${Date.now()}`;

    if (format === 'json') {
      fileContent = JSON.stringify(logs, null, 2);
      mimeType = 'application/json';
      fileName += '.json';
    } else {
      // CSV
      const headers = ['ID', 'User', 'Action', 'Module', 'Value', 'API Used', 'Timestamp'];
      const rows = logs.map(l => [
        l.id,
        l.user_name || 'System',
        l.action,
        l.module,
        l.value?.replace(/,/g, ' ') || '',
        l.api_used ? 'TRUE' : 'FALSE',
        l.created_at
      ]);
      fileContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      mimeType = 'text/csv';
      fileName += '.csv';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    toast.success(`Exported logs as ${format.toUpperCase()}`);
  };

  const filteredLogs = logs.filter(l => 
    l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.value?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="friday-admin-container relative space-y-6">
      <div className="friday-grid-overlay" />
      <div className="friday-hud-scanline" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="friday-hud-logo text-2xl font-black text-white flex items-center gap-2 tracking-wider">
            REAL-TIME LOGS CONSOLE
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest mt-0.5">Vercel-style developer output stream logging core</p>
        </div>

        {/* Live controls & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${
              isLive 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-900 border-white/5 text-slate-400'
            }`}
          >
            {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isLive ? 'STREAMING' : 'PAUSED'}
          </button>
          
          <button
            onClick={() => exportData('csv')}
            className="px-3 py-1.5 bg-slate-900 border border-white/5 text-xs text-slate-300 rounded-lg hover:border-white/10 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> CSV Export
          </button>

          <button
            onClick={() => exportData('json')}
            className="px-3 py-1.5 bg-slate-900 border border-white/5 text-xs text-slate-300 rounded-lg hover:border-white/10 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> JSON Export
          </button>

          <button onClick={fetchLogs} className="p-1.5 bg-slate-900 border border-white/5 rounded-lg text-cyan-400 hover:border-cyan-500/30">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="friday-cyber-card p-4 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search logs instantly..."
            className="w-full bg-slate-950 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/30 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
        </div>

        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none cursor-pointer"
        >
          <option value="">All Modules</option>
          <option value="Auth">Authentication</option>
          <option value="AI Tutor">AI Tutor Chatbot</option>
          <option value="Question Bank">Question Bank Manager</option>
          <option value="Subjects">Subjects Module</option>
        </select>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none cursor-pointer"
        >
          <option value="">All Actions</option>
          <option value="login">User Logins</option>
          <option value="ai_prompt">AI Prompts</option>
          <option value="search">Search Queries</option>
        </select>
      </div>

      {/* Terminal logs stream container */}
      <div className="friday-cyber-card p-5 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-cyan-400" /> STREAM OUTPUT CONSOLE
        </div>
        
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="hologram-scan p-4 rounded-xl text-[10px] space-y-2.5 max-h-[500px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex gap-2 items-start font-mono leading-relaxed">
                <span className="text-slate-500 select-none">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                <span className="text-cyan-400 font-bold">[{log.module.toUpperCase()}]</span>
                <span className="text-purple-400 font-bold select-none">{log.action.toUpperCase()}</span>
                <span className="text-white font-semibold">{log.user_name || 'System'}</span>
                <span className="text-slate-300">- {log.value}</span>
                {log.api_used && (
                  <span className="bg-cyan-500/10 text-cyan-400 text-[8px] px-1 rounded border border-cyan-500/20 font-bold">API</span>
                )}
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="text-slate-600 font-mono italic">No console logs matching current search filters...</div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
