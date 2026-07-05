import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Search, UserCheck, UserX, Key, Activity, RefreshCw, Plus, Edit, Trash2, 
  Eye, X, Award, Flame, BookOpen, Clock, Calendar, Shield, TrendingUp, Brain, BarChart3
} from 'lucide-react';
import api from '../../api/axios';
import AdminTabBar from '../../components/AdminTabBar';
import './AdminApiSettings.css';

const STUDENT_TABS = [
  { id: 'list', label: 'Student List', icon: '👥' },
  { id: 'performance', label: 'Performance', icon: '📊' },
  { id: 'progress', label: 'Progress', icon: '📈' },
  { id: 'insights', label: 'AI Insights', icon: '🧠' },
];

export default function AdminStudents() {
  const [activeTab, setActiveTab] = useState('list');
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [profileModal, setProfileModal] = useState(null); // student ID
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [crudModal, setCrudModal] = useState(null); // 'create' | 'edit' | null
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', api_limit: 100 });

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

  const handleOpenProfile = async (studentId) => {
    try {
      setProfileModal(studentId);
      setProfileLoading(true);
      const res = await api.get(`/admin/system/students/${studentId}`);
      setProfileData(res.data);
    } catch (err) {
      toast.error('Failed to retrieve student profile statistics.');
      setProfileModal(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleToggleBlock = async (student) => {
    const actionText = student.blocked ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${actionText} ${student.name}?`)) return;

    try {
      await api.put(`/admin/system/students/${student.id}`, {
        blocked: !student.blocked
      });
      toast.success(`Student ${student.name} ${student.blocked ? 'activated' : 'suspended'} successfully.`);
      fetchStudents();
    } catch (err) {
      toast.error('Action failed.');
    }
  };

  const handleUpdateLimit = async (id, name, limit) => {
    try {
      await api.put(`/admin/system/students/${id}`, {
        api_limit: limit
      });
      toast.success(`Quota limit updated for ${name}`);
      setStudents(prev => prev.map(s => s.id === id ? { ...s, api_limit: limit } : s));
    } catch (err) {
      toast.error('Failed to update quota limits');
    }
  };

  const handleOpenCreate = () => {
    setFormData({ name: '', email: '', password: '', role: 'student', api_limit: 100 });
    setEditingStudent(null);
    setCrudModal('create');
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({ 
      name: student.name, 
      email: student.email, 
      password: '', 
      role: student.role || 'student', 
      api_limit: student.api_limit || 100 
    });
    setCrudModal('edit');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE student ${name}?`)) return;
    try {
      await api.delete(`/admin/system/students/${id}`);
      toast.success('Account deleted successfully');
      fetchStudents();
    } catch (err) {
      toast.error('Error deleting student account');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (crudModal === 'create') {
        if (!formData.password) return toast.error('Password is required');
        await api.post('/admin/system/students', formData);
        toast.success('Student created successfully');
      } else {
        await api.put(`/admin/system/students/${editingStudent.id}`, formData);
        toast.success('Student updated successfully');
      }
      setCrudModal(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing request');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" style={{ color: 'var(--db-text-main)' }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
          👨‍🎓 Students
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--db-text-muted)' }}>Manage student accounts, track performance, and view AI-powered insights.</p>
      </div>

      <AdminTabBar tabs={STUDENT_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'list' && (
      <div className="space-y-6">
      {/* Original Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div />

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full bg-slate-950/60 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/30 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          </div>

          <button onClick={handleOpenCreate} className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-xs font-bold text-slate-950 rounded-lg hover:brightness-110 transition flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            <Plus className="w-4 h-4 text-slate-950" /> Add Profile
          </button>
          <button onClick={fetchStudents} className="p-2.5 bg-slate-900 border border-white/5 text-slate-300 rounded-lg hover:border-cyan-500/30 transition">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table grid */}
      <div className="friday-cyber-card p-5 rounded-2xl overflow-x-auto border border-white/5 bg-slate-950/40 backdrop-blur-xl">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : filteredStudents.length > 0 ? (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 border-b border-white/5 pb-2 uppercase tracking-widest text-[9px] font-mono">
                <th className="pb-3 pr-4">Student Profile</th>
                <th className="pb-3 pr-4">API Quota (Used / Limit)</th>
                <th className="pb-3 pr-4">Engagement Index</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Cyber Controls</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-cyan-400">
                        {s.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          {s.name}
                          {s.role !== 'student' && (
                            <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1 rounded uppercase font-mono">{s.role}</span>
                          )}
                        </div>
                        <div className="text-slate-500 font-mono text-[10px] mt-0.5">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 min-w-[180px]">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
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
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
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
                  <td className="py-4 pr-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[8px] font-bold uppercase ${
                      s.blocked 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      {s.blocked ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-1.5">
                    <button onClick={() => handleOpenProfile(s.id)} className="p-1.5 bg-slate-900 hover:border-cyan-500/30 text-cyan-400 rounded border border-white/5 transition" title="View Profile Analytics">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleOpenEdit(s)} className="p-1.5 bg-slate-900 hover:border-amber-500/30 text-amber-400 rounded border border-white/5 transition" title="Edit Student Profile">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleToggleBlock(s)} className={`p-1.5 rounded border border-white/5 transition ${s.blocked ? 'bg-emerald-500/10 text-emerald-400 hover:border-emerald-400/40' : 'bg-rose-500/10 text-rose-400 hover:border-rose-500/40'}`} title={s.blocked ? 'Activate' : 'Suspend'}>
                      {s.blocked ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 bg-slate-900 hover:border-rose-500/30 text-rose-500 rounded border border-white/5 transition" title="Delete Profile">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-slate-500 font-mono">No student profiles registered. Registry is empty.</div>
        )}
      </div>

      {/* CRUD Modal (Create / Edit) */}
      {crudModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full relative space-y-4">
            <button onClick={() => setCrudModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
              {crudModal === 'create' ? '⚡ CREATE STUDENT PROFILE' : '⚙️ MODIFY STUDENT ACCOUNT'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-500/30"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-500/30"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Password {crudModal === 'edit' && '(Leave blank to keep current)'}</label>
                <input
                  type="password"
                  required={crudModal === 'create'}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-500/30"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Role Allocation</label>
                  <select
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="student">Student</option>
                    <option value="moderator">Moderator</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Daily API Limit</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="5000"
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-500/30"
                    value={formData.api_limit}
                    onChange={(e) => setFormData({ ...formData, api_limit: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setCrudModal(null)} className="px-4 py-2 border border-white/5 rounded-xl text-xs text-slate-400 hover:text-white transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-xs font-bold text-slate-950 hover:brightness-110 transition">
                  {crudModal === 'create' ? 'Register Student' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Details Drawer / Modal */}
      {profileModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-slate-900 border-l border-white/10 w-full max-w-xl h-full flex flex-col relative">
            <button onClick={() => { setProfileModal(null); setProfileData(null); }} className="absolute right-4 top-4 text-slate-400 hover:text-white transition p-1.5 bg-slate-950/60 rounded-lg">
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 border-b border-white/5 bg-slate-950/20">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" /> STUDENT LOG PROFILE TELEMETRY
              </h2>
            </div>

            {profileLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            ) : profileData ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Profile Overview Card */}
                <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                  <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-xl font-black text-cyan-400 font-mono">
                    {profileData.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{profileData.user.name}</h3>
                    <p className="text-slate-400 text-xs font-mono">{profileData.user.email}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[9px] bg-slate-900 text-slate-400 border border-white/5 px-2 py-0.5 rounded font-mono uppercase">ID: {profileData.user.id}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${profileData.user.blocked ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {profileData.user.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Indicators */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950/20 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                    <Award className="w-5 h-5 text-cyan-400 mb-1" />
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Total XP</span>
                    <span className="text-sm font-black text-white mt-0.5">{profileData.totalXp} XP</span>
                  </div>
                  <div className="bg-slate-950/20 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                    <Flame className="w-5 h-5 text-amber-500 mb-1" />
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Streak</span>
                    <span className="text-sm font-black text-white mt-0.5">{profileData.streak} Days</span>
                  </div>
                  <div className="bg-slate-950/20 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                    <BookOpen className="w-5 h-5 text-purple-400 mb-1" />
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Topics Done</span>
                    <span className="text-sm font-black text-white mt-0.5">{profileData.progress?.completed_topics || 0}</span>
                  </div>
                </div>

                {/* Study Hours telemetry */}
                <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 uppercase text-[9px] tracking-wider font-mono">
                      <Clock className="w-4 h-4 text-cyan-400" /> Study Intensity Ratio
                    </span>
                    <span className="font-bold text-white">{profileData.progress?.study_hours || 0} Hours</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${Math.min(100, (profileData.progress?.study_hours || 0) * 10)}%` }} />
                  </div>
                </div>

                {/* Quiz performance */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Quiz Score Metrics (Last 10 Attempts)</h4>
                  <div className="space-y-1.5">
                    {profileData.quizPerformance.length > 0 ? (
                      profileData.quizPerformance.map((q, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-slate-950/10 border border-white/5 p-2 rounded-lg font-mono">
                          <div>
                            <span className="text-white font-bold">{q.quiz_title}</span>
                            <span className="text-slate-500 text-[10px] block mt-0.5">{q.subject_name}</span>
                          </div>
                          <span className={`font-bold px-2 py-0.5 rounded ${q.score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : q.score >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {q.score}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-xs italic">No quiz participations registered.</p>
                    )}
                  </div>
                </div>

                {/* Login History */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Security Logs (Login History)
                  </h4>
                  <div className="bg-slate-950/20 border border-white/5 rounded-xl p-3 text-xs font-mono space-y-1.5">
                    {profileData.loginHistory.length > 0 ? (
                      profileData.loginHistory.map((h, idx) => (
                        <div key={idx} className="flex justify-between text-slate-400 border-b border-white/5 pb-1 last:border-0 last:pb-0">
                          <span>{new Date(h.login_time).toLocaleString()}</span>
                          <span className="text-cyan-400">IP: {h.ip_address || '127.0.0.1'}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic text-[10px]">No login records detected.</p>
                    )}
                  </div>
                </div>

                {/* Live Activity Timeline */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Student Activity Feed Timeline</h4>
                  <div className="space-y-2 font-mono text-[10px] max-h-60 overflow-y-auto pr-1">
                    {profileData.timeline.length > 0 ? (
                      profileData.timeline.map((item, idx) => (
                        <div key={idx} className="bg-slate-950/40 border border-white/5 p-2 rounded-lg space-y-1">
                          <div className="flex justify-between text-slate-500">
                            <span>[{new Date(item.created_at).toLocaleTimeString()}]</span>
                            <span className="text-cyan-400 uppercase">[{item.module}]</span>
                          </div>
                          <div className="text-white">Action: <span className="text-purple-400">"{item.action}"</span></div>
                          {item.value && <div className="text-slate-400">Context: "{item.value}"</div>}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic">Timeline is empty.</p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">No profile details active.</div>
            )}
          </div>
        </div>
      )}
    </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Average GPA', value: '3.42', change: '+0.12', color: 'text-blue-500' },
              { label: 'Quiz Pass Rate', value: '78%', change: '+5%', color: 'text-emerald-500' },
              { label: 'Coding Accuracy', value: '64%', change: '+3%', color: 'text-violet-500' },
            ].map((metric) => (
              <div key={metric.label} className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <p className="text-xs font-bold uppercase" style={{ color: 'var(--db-text-muted)' }}>{metric.label}</p>
                <p className="text-3xl font-black mt-1" style={{ color: 'var(--db-text-main)' }}>{metric.value}</p>
                <p className={`text-xs font-bold mt-1 ${metric.color}`}>↗ {metric.change} this semester</p>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--db-text-main)' }}>📊 Performance Distribution</h3>
            <div className="grid grid-cols-5 gap-2">
              {['A+', 'A', 'B+', 'B', 'C'].map((grade, i) => (
                <div key={grade} className="text-center">
                  <div className="mx-auto w-8 rounded-t-lg bg-blue-500" style={{ height: `${[80, 60, 45, 30, 15][i]}px`, opacity: 1 - i * 0.15 }} />
                  <p className="text-xs font-bold mt-1" style={{ color: 'var(--db-text-muted)' }}>{grade}</p>
                  <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>{[32, 24, 18, 12, 6][i]}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Course Completion', value: '67%', desc: 'Average across all enrolled students' },
              { label: 'Active Learners', value: '142', desc: 'Students active in last 7 days' },
              { label: 'Avg Study Hours', value: '4.2h', desc: 'Daily average per student' },
              { label: 'Topics Mastered', value: '856', desc: 'Total across all students' },
            ].map((item) => (
              <div key={item.label} className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <p className="text-xs font-bold uppercase" style={{ color: 'var(--db-text-muted)' }}>{item.label}</p>
                <p className="text-3xl font-black mt-1" style={{ color: 'var(--db-text-main)' }}>{item.value}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--db-text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--db-text-main)' }}>📈 Weekly Progress Trend</h3>
            <div className="flex items-end gap-2 h-32">
              {[45, 52, 48, 60, 55, 72, 68].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-blue-500/80" style={{ height: `${v}%` }} />
                  <span className="text-[9px] font-bold" style={{ color: 'var(--db-text-muted)' }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '🧠', title: 'At-Risk Students', value: '12', desc: 'Students predicted to underperform', color: 'text-rose-500' },
              { icon: '⚡', title: 'High Potential', value: '28', desc: 'Students showing exceptional growth', color: 'text-emerald-500' },
              { icon: '📚', title: 'Knowledge Gaps', value: '45', desc: 'Topics with low mastery across cohort', color: 'text-amber-500' },
              { icon: '🎯', title: 'Placement Ready', value: '67%', desc: 'Students meeting placement criteria', color: 'text-blue-500' },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl border flex items-start gap-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-xs font-bold uppercase" style={{ color: 'var(--db-text-muted)' }}>{item.title}</p>
                  <p className={`text-2xl font-black mt-0.5 ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--db-text-muted)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--db-text-main)' }}>🤖 AI Recommendations</h3>
            <div className="space-y-3">
              {[
                'Assign extra practice sets to 12 at-risk students in Data Structures.',
                'Schedule 1-on-1 mentoring sessions for students below 50% quiz scores.',
                'Recommend advanced electives to 28 high-potential learners.',
              ].map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                  <span className="text-blue-500 font-bold text-xs mt-0.5">→</span>
                  <p className="text-xs" style={{ color: 'var(--db-text-main)' }}>{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
