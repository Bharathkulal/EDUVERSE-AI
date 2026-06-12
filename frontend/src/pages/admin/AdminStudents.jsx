import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, UserCheck, UserX, Key, Activity, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import './AdminApiSettings.css';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/system/students');
      setStudents(data);
    } catch (err) {
      toast.error('Failed to load students list');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (student) => {
    const actionText = student.blocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${actionText} ${student.name}?`)) return;

    try {
      await api.post('/admin/system/students/control', {
        id: student.id,
        blocked: !student.blocked
      });
      toast.success(`Student ${student.name} ${student.blocked ? 'unblocked' : 'blocked'} successfully.`);
      fetchStudents();
    } catch (err) {
      toast.error('Control action failed.');
    }
  };

  const handleUpdateLimit = async (id, name, limit) => {
    try {
      await api.post('/admin/system/students/control', {
        id,
        api_limit: limit
      });
      toast.success(`Quota limit updated for ${name}`);
      fetchStudents();
    } catch (err) {
      toast.error('Failed to update quota limits');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && students.length === 0) {
    return (
      <div className="friday-premium-dashboard flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm tracking-wider uppercase">Loading Student Profiles...</p>
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
            STUDENTS MATRIX MANAGEMENT
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest mt-0.5">Control Access restrictions and Daily AI prompt quotas</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Filter by name or email..."
            className="w-full bg-slate-950/60 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/30 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Table grid */}
      <div className="friday-cyber-card p-5 rounded-2xl overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-slate-400 border-b border-white/5 pb-2 uppercase tracking-widest text-[9px]">
              <th className="pb-3 pr-4">Student Profile</th>
              <th className="pb-3 pr-4">Quota (Used / Limit)</th>
              <th className="pb-3 pr-4">Engagement Rate</th>
              <th className="pb-3 pr-4">Status Protocols</th>
              <th className="pb-3 text-right">Cyber Controls</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition">
                
                {/* Profile column */}
                <td className="py-4 pr-4">
                  <div className="font-bold text-white text-sm">{s.name}</div>
                  <div className="text-slate-500 font-mono mt-0.5">{s.email}</div>
                </td>

                {/* Quota slider controls */}
                <td className="py-4 pr-4 min-w-[200px]">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Used: {s.api_used_today || 0}</span>
                    <span>Limit: {s.api_limit}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={s.api_limit}
                    onChange={(e) => handleUpdateLimit(s.id, s.name, parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 outline-none"
                  />
                </td>

                {/* Engagement rating */}
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full ${
                          s.engagementScore > 80 ? 'bg-emerald-400' : s.engagementScore > 50 ? 'bg-amber-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${s.engagementScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 font-bold">{s.engagementScore}%</span>
                  </div>
                </td>

                {/* Status dot */}
                <td className="py-4 pr-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase ${
                    s.blocked 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {s.blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>

                {/* Actions Block button */}
                <td className="py-4 text-right">
                  <button
                    onClick={() => handleToggleBlock(s)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition inline-flex items-center gap-1.5 ${
                      s.blocked 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:border-emerald-400/40' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:border-rose-500/40'
                    }`}
                  >
                    {s.blocked ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" /> Unblock Student
                      </>
                    ) : (
                      <>
                        <UserX className="w-3.5 h-3.5" /> Suspend Student
                      </>
                    )}
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
