import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  User, Mail, Phone, BookOpen, Award, Flame, Brain, BarChart2, Shield, Calendar, 
  Map, Sparkles, Settings, FileText, Download, Share2, Eye, Key, Bell, Check, Laptop,
  Cpu, Code2, LineChart, CheckCircle2, ChevronRight, UploadCloud, EyeOff, Lock
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, ResponsiveContainer, XAxis, YAxis, Tooltip 
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './AIProfile.css';

export default function AIProfile() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user: authUser, logout } = useAuth();
  
  // API Data States
  const [profile, setProfile] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'analytics' | 'skills' | 'achievements' | 'history' | 'recommendations' | 'certificates' | 'settings'

  // Settings & Forms State
  const [editForm, setEditForm] = useState({
    name: '', phone_number: '', college_name: '', course: '', semester: '1'
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true, analyticsSharing: true
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true, pushNotifications: true
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, predRes, dashRes] = await Promise.all([
        api.get('/onboarding/profile').catch(() => ({ data: null })),
        api.get('/onboarding/predictions').catch(() => ({ data: null })),
        api.get('/progress/dashboard').catch(() => ({ data: null })),
      ]);

      const prof = profileRes.data || {};
      setProfile(prof);
      setPredictions(predRes.data);
      setDashData(dashRes.data);

      // Initialize forms
      setEditForm({
        name: prof.full_name || authUser?.name || '',
        phone_number: prof.phone_number || '',
        college_name: prof.college_name || '',
        course: prof.course || 'BCA',
        semester: prof.semester ? String(prof.semester) : '1'
      });
      
      setPrivacySettings({
        profileVisible: prof.privacy_profile_visible !== false,
        analyticsSharing: prof.privacy_analytics_sharing !== false
      });
    } catch (err) {
      toast.error('Failed to sync profile telemetry registry');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/auth/profile', editForm);
      toast.success('Profile details synchronized successfully');
      fetchProfileData();
    } catch (err) {
      toast.error('Profile synchronization failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setUpdatingPassword(true);
    try {
      await api.put('/auth/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Access credentials updated');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const shareCertificate = (certName) => {
    if (navigator.share) {
      navigator.share({
        title: `EduVerse AI Certificate: ${certName}`,
        text: `I just earned my certificate in ${certName} from EduVerse AI!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`I earned my ${certName} certificate on EduVerse AI!`);
      toast.success('Share link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="profile-dashboard-container p-6 space-y-6">
        <div className="profile-glass-card p-6 rounded-2xl animate-pulse flex items-center gap-4 bg-slate-900/10">
          <div className="w-20 h-20 bg-slate-500/20 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-500/20 rounded w-1/4" />
            <div className="h-3 bg-slate-500/20 rounded w-1/3" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="profile-glass-card h-40 rounded-2xl animate-pulse bg-slate-900/10" />
          ))}
        </div>
      </div>
    );
  }

  // Fallback calculations for analytics
  const studyHours = dashData?.studyHours || 0;
  const completedLessons = dashData?.completedLessons || 0;
  const enrolledLessons = dashData?.enrolledLessons || 0;
  const avgQuizScore = dashData?.quizScores?.average || 0;
  const xp = dashData?.profile?.xp || 0;
  const streak = dashData?.profile?.streak || 0;
  const level = Math.max(1, Math.floor(studyHours * 2.5 + completedLessons * 1.5 + avgQuizScore / 20));
  const attendanceRatio = 92; // Mock attendance
  const cgpa = profile?.cgpa || '8.8';

  // Chart data formatting
  const weeklyActivityData = [
    { name: 'Mon', hours: Math.round(studyHours * 0.1 * 10) / 10 },
    { name: 'Tue', hours: Math.round(studyHours * 0.15 * 10) / 10 },
    { name: 'Wed', hours: Math.round(studyHours * 0.25 * 10) / 10 },
    { name: 'Thu', hours: Math.round(studyHours * 0.2 * 10) / 10 },
    { name: 'Fri', hours: Math.round(studyHours * 0.1 * 10) / 10 },
    { name: 'Sat', hours: Math.round(studyHours * 0.12 * 10) / 10 },
    { name: 'Sun', hours: Math.round(studyHours * 0.08 * 10) / 10 },
  ];

  const skillradarData = [
    { subject: 'Programming', A: 85, B: 70, fullMark: 100 },
    { subject: 'Mathematics', A: 75, B: 80, fullMark: 100 },
    { subject: 'Communication', A: 90, B: 75, fullMark: 100 },
    { subject: 'Aptitude', A: 80, B: 85, fullMark: 100 },
    { subject: 'Problem Solving', A: 95, B: 80, fullMark: 100 },
  ];

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills', icon: <Laptop className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Award className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <Calendar className="w-4 h-4" /> },
    { id: 'recommendations', label: 'AI Recommends', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
    { id: 'certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="profile-dashboard-container p-6 space-y-6">
      
      {/* 1. PROFILE HEADER CARD */}
      <div className="profile-glass-card p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-bold font-mono text-white">
                {editForm.name ? editForm.name[0].toUpperCase() : 'U'}
              </div>
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-full cursor-pointer shadow-md transition group-hover:scale-105">
              <UploadCloud className="w-3.5 h-3.5" />
              <input type="file" className="hidden" accept="image/*" onChange={() => toast.success('Profile image updated successfully')} />
            </label>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {editForm.name}
              <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-mono font-bold">Student</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 justify-center sm:justify-start">
              <Mail className="w-3.5 h-3.5 text-slate-500" /> {profile.email || authUser?.email || 'student@eduverse.ai'}
            </p>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 justify-center sm:justify-start">
              <Phone className="w-3.5 h-3.5 text-slate-500" /> {editForm.phone_number || '+91 XXXXX XXXXX'}
            </p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start text-[10px] font-mono text-slate-300">
              <span className="px-2 py-0.5 bg-slate-800 rounded">{editForm.college_name || 'EduVerse University'}</span>
              <span className="px-2 py-0.5 bg-slate-800 rounded">{editForm.course} • Semester {editForm.semester}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setActiveTab('settings')}
          className="w-full md:w-auto px-4 py-2 border border-white/10 hover:border-blue-500/30 bg-slate-900/40 text-xs text-slate-200 rounded-xl hover:text-blue-400 transition flex items-center justify-center gap-1.5"
        >
          <Settings className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex gap-2 overflow-x-auto border-b border-white/5 pb-1 scrollbar-hide">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`profile-tab-btn flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === item.id 
                ? 'active text-blue-400 bg-blue-400/5' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT PANEL */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Academic Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Cumulative CGPA', val: cgpa, icon: '📊', color: 'from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/20' },
                  { label: 'Enrolled Courses', val: enrolledLessons || 4, icon: '📚', color: 'from-blue-500/10 to-indigo-500/10 text-blue-400 border-blue-500/20' },
                  { label: 'Completed Lessons', val: completedLessons || 0, icon: '✅', color: 'from-purple-500/10 to-pink-500/10 text-purple-400 border-purple-500/20' },
                  { label: 'Certificates Earned', val: completedLessons >= 1 ? 1 : 0, icon: '🏅', color: 'from-amber-500/10 to-orange-500/10 text-amber-400 border-amber-500/20' },
                  { label: 'Attendance Rate', val: `${attendanceRatio}%`, icon: '🗓️', color: 'from-cyan-500/10 to-blue-500/10 text-cyan-400 border-cyan-500/20' },
                ].map((card, i) => (
                  <div key={i} className={`profile-glass-card bg-gradient-to-tr ${card.color} border p-5 rounded-2xl flex flex-col justify-between h-28`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xl">{card.icon}</span>
                      <span className="text-xs uppercase tracking-wider opacity-60 font-semibold">EduSnapshot</span>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-lg font-black">{card.val}</h4>
                      <p className="text-[9px] uppercase tracking-wider opacity-70 mt-0.5">{card.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Summary */}
                <div className="lg:col-span-2 profile-glass-card p-6 rounded-3xl space-y-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <LineChart className="w-4 h-4 text-blue-500" /> Learning Analytics Summary
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl text-center">
                      <Flame className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Learning Streak</span>
                      <span className="text-lg font-bold text-white mt-1 block">{streak} Days</span>
                    </div>
                    <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl text-center">
                      <Clock className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Study intensity</span>
                      <span className="text-lg font-bold text-white mt-1 block">{studyHours} Hrs</span>
                    </div>
                    <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl text-center">
                      <Brain className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Avg Quiz Score</span>
                      <span className="text-lg font-bold text-white mt-1 block">{Math.round(avgQuizScore)}%</span>
                    </div>
                  </div>

                  {/* Recharts Area Chart */}
                  <div className="h-60 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyActivityData}>
                        <defs>
                          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="hours" name="Study Hours" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AI Performance Score Card */}
                <div className="profile-glass-card p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-500" /> AI Insights Performance
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">Calculated readiness score metrics based on active profile analytics</p>
                  </div>

                  <div className="my-6 flex justify-center">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      {/* SVG Circle Progress */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="64" stroke="rgba(255,255,255,0.03)" strokeWidth="12" fill="transparent" />
                        <circle cx="80" cy="80" r="64" stroke="url(#gradientScore)" strokeWidth="12" fill="transparent"
                          strokeDasharray={402} strokeDashoffset={402 - (402 * (predictions?.performance_score || 78)) / 100}
                          strokeLinecap="round" />
                        <defs>
                          <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-3xl font-black text-white">{predictions?.performance_score || 78}%</span>
                        <span className="text-[8px] text-slate-500 block uppercase tracking-wider mt-0.5">Ready score</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-white/5 p-3 rounded-2xl text-[10px] text-slate-400 leading-relaxed font-mono">
                    <p className="font-bold text-white uppercase mb-1">AI Placement Probability</p>
                    Your overall evaluation is calculated at <strong className="text-blue-400">{predictions?.placement_score || 82}%</strong>. Maintain streaks to build further credentials.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 profile-glass-card p-6 rounded-3xl space-y-6">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-blue-500" /> Weekly Activity Performance
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivityData}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0a0f1d', border: 'none', borderRadius: '12px' }} />
                      <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Study Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="profile-glass-card p-6 rounded-3xl space-y-6">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-500" /> Cognitive Skills Profile
                </h3>
                <div className="h-64 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillradarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                      <PolarRadiusAxis stroke="#64748b" fontSize={9} />
                      <Radar name="Student A" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === 'skills' && (
            <div className="profile-glass-card p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-blue-500" /> Academic & Technical Skills Registry
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Animated skill bar indicators representing overall topic success rates</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Programming & Logic (Java/Python)', pct: 85, color: 'bg-blue-500' },
                  { title: 'Mathematics & Numerical Analysis', pct: 75, color: 'bg-emerald-500' },
                  { title: 'Communication Skills', pct: 90, color: 'bg-purple-500' },
                  { title: 'Aptitude & Verbal Reasoning', pct: 80, color: 'bg-amber-500' },
                  { title: 'Problem Solving & DSA', pct: 95, color: 'bg-pink-500' },
                  { title: 'Database & SQL Querying', pct: 70, color: 'bg-cyan-500' },
                ].map((skill, idx) => (
                  <div key={idx} className="space-y-2 bg-slate-900/40 p-4 border border-white/5 rounded-2xl">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-slate-300">{skill.title}</span>
                      <span className="text-blue-400">{skill.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.pct}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${skill.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Achievements & Badges Drawer</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Unlock badges by completing courses, scoring above 80% on quizzes, and maintaining day-streaks.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { title: 'Top Learner', desc: 'Ranked top of leaderboard', unlocked: xp > 1000, icon: '🥇', color: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400' },
                  { title: 'Quiz Master', desc: 'Aced 3 quizzes in a row', unlocked: avgQuizScore >= 80, icon: '🔥', color: 'border-orange-500/20 bg-orange-500/5 text-orange-400' },
                  { title: 'Course Finisher', desc: 'Completed first syllabus unit', unlocked: completedLessons >= 1, icon: '🎓', color: 'border-purple-500/20 bg-purple-500/5 text-purple-400' },
                  { title: '7-Day Streak Badge', desc: 'Consecutive study logs', unlocked: streak >= 7, icon: '⚡', color: 'border-blue-500/20 bg-blue-500/5 text-blue-400' },
                  { title: 'AI Excellence', desc: 'Scored 90%+ in AI module', unlocked: predictions?.performance_score >= 90, icon: '🧠', color: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400' },
                ].map((badge, idx) => (
                  <div key={idx} className={`badge-item border p-5 rounded-2xl text-center space-y-2 flex flex-col justify-center items-center ${badge.color} ${!badge.unlocked ? 'opacity-30 grayscale' : ''}`}>
                    <span className="text-3xl">{badge.icon}</span>
                    <h4 className="text-xs font-bold text-white">{badge.title}</h4>
                    <p className="text-[9px] text-slate-400 font-mono leading-relaxed">{badge.desc}</p>
                    <span className={`text-[8px] uppercase tracking-wider font-mono border px-2 py-0.5 rounded ${badge.unlocked ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-slate-500/20 text-slate-400'}`}>
                      {badge.unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: HISTORY */}
          {activeTab === 'history' && (
            <div className="profile-glass-card p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" /> Logged Activities & History
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Audit timeline of recently compiled activities</p>
              </div>

              <div className="space-y-4">
                {[
                  { event: 'Enrolled in Syllabus Catalog', detail: `${profile.course} Semester ${profile.semester}`, time: 'Just Now', icon: '📚', color: 'bg-blue-500/10 text-blue-400' },
                  { event: 'Aced Module Evaluation Quiz', detail: `Score achieved: ${Math.round(avgQuizScore)}%`, time: '1 Day Ago', icon: '🏆', color: 'bg-emerald-500/10 text-emerald-400' },
                  { event: 'Synchronized Onboarding Telemetry', detail: 'Completed AI performance diagnostic survey', time: '3 Days Ago', icon: '🧠', color: 'bg-purple-500/10 text-purple-400' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start p-3 bg-slate-900/30 border border-white/5 rounded-2xl">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${item.color} flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-white truncate">{item.event}</h4>
                        <span className="text-[8px] text-slate-500 font-mono flex-shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recommended Career & Roadmap */}
              <div className="profile-glass-card p-6 rounded-3xl space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-blue-500" /> AI Career Projections
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Based on your onboarding diagnostic details</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(predictions?.career_recommendations || ['Software Engineer', 'Data Analyst']).map((career, idx) => (
                    <span key={idx} className="px-3.5 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase rounded-xl flex items-center gap-1.5">
                      💼 {career}
                    </span>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">Personalized Learning Roadmap</p>
                  <div className="space-y-3">
                    {(predictions?.roadmap || [
                      { phase: 'Phase 1: Core Foundation', duration: 'Weeks 1-4', subjects: ['Java basics', 'Calculus'] }
                    ]).map((phase, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/40 border border-white/5 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-white">{phase.phase}</span>
                          <span className="text-blue-400 font-mono">{phase.duration}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(phase.subjects || []).map((sub, sIdx) => (
                            <span key={sIdx} className="bg-slate-800 border border-white/5 text-slate-300 text-[9px] px-1.5 py-0.5 rounded font-mono">{sub}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learning Path Recommendations */}
              <div className="profile-glass-card p-6 rounded-3xl space-y-5">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Syllabus Weaknesses & Practice
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Recommended topics based on evaluation trends</p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase text-[#fb7185] tracking-wider font-mono">Weak Areas to Improve</p>
                  <div className="flex flex-wrap gap-2">
                    {(predictions?.weaknesses || ['Logical reasoning', 'Mock tests']).map((item, idx) => (
                      <span key={idx} className="bg-rose-500/10 border border-rose-500/20 text-[#fb7185] text-[10px] px-3 py-1 rounded-xl font-mono font-bold">
                        ⚠️ {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider font-mono">Top Strengths Registered</p>
                  <div className="flex flex-wrap gap-2">
                    {(predictions?.strengths || ['Analytical skills', 'Technical theory']).map((item, idx) => (
                      <span key={idx} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-3 py-1 rounded-xl font-mono font-bold">
                        ✅ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="profile-glass-card p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-500" /> Earned Certificates
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">View, download, or share your academic credentials and certificates</p>
              </div>

              {completedLessons >= 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-white/5 bg-slate-900/40 p-5 rounded-2xl flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-tr from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-400 text-xl font-bold font-mono">
                        JS
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">JavaScript Programming Fundamentals</h4>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">Issued: June 2026 • ID: EV-JS-8847</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => shareCertificate('JavaScript Programming')} className="p-2 bg-slate-800 border border-white/5 hover:border-blue-500/20 text-blue-400 rounded-xl transition" title="Share Certificate">
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toast.success('Downloading Certificate PDF...')} className="p-2 bg-slate-800 border border-white/5 hover:border-emerald-500/20 text-emerald-400 rounded-xl transition" title="Download PDF">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-white/5 rounded-2xl bg-slate-950/20 space-y-2">
                  <p>📜 No certificates earned yet.</p>
                  <p className="text-[10px] text-slate-600">Complete curriculum topics and maintain good scores to unlock certificates!</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Profile Details Form */}
              <div className="lg:col-span-2 profile-glass-card p-6 rounded-3xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-500" /> Update Student Details
                </h3>

                <form onSubmit={handleUpdateProfile} className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500/30" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Phone Number</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500/30" 
                        value={editForm.phone_number} 
                        onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">College/University</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500/30" 
                      value={editForm.college_name} 
                      onChange={(e) => setEditForm({ ...editForm, college_name: e.target.value })} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Course/Branch</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500/30" 
                        value={editForm.course} 
                        onChange={(e) => setEditForm({ ...editForm, course: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Semester</label>
                      <select 
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500/30" 
                        value={editForm.semester} 
                        onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={String(s)}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={savingProfile} 
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-xs font-bold text-slate-950 hover:brightness-110 transition flex items-center justify-center gap-1.5"
                  >
                    {savingProfile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Synchronize Profile'}
                  </button>
                </form>
              </div>

              {/* Password & Security */}
              <div className="space-y-6">
                <div className="profile-glass-card p-6 rounded-3xl space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-blue-500" /> Reset Password
                  </h3>

                  <form onSubmit={handleUpdatePassword} className="space-y-3">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Current Password</label>
                      <input 
                        type="password" 
                        required 
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500/30" 
                        value={passwordForm.currentPassword} 
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">New Password</label>
                      <input 
                        type="password" 
                        required 
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500/30" 
                        value={passwordForm.newPassword} 
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        required 
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500/30" 
                        value={passwordForm.confirmPassword} 
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={updatingPassword} 
                      className="w-full py-2 border border-white/5 text-xs text-slate-300 rounded-xl hover:border-blue-500/30 hover:text-white transition flex items-center justify-center gap-1.5"
                    >
                      {updatingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Update Password'}
                    </button>
                  </form>
                </div>

                {/* Switch Toggles for Notifications & Privacy */}
                <div className="profile-glass-card p-6 rounded-3xl space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-blue-500" /> Notifications & Theme
                  </h3>

                  <div className="space-y-3.5 text-xs font-mono text-slate-300">
                    <div className="flex justify-between items-center">
                      <span>Dark Theme Theme Toggle</span>
                      <button onClick={toggleTheme} className={`settings-toggle ${isDarkMode ? 'settings-toggle-checked' : ''}`}>
                        <span className="settings-toggle-inner" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Share Analytics Logs</span>
                      <button 
                        onClick={() => setPrivacySettings(prev => ({ ...prev, analyticsSharing: !prev.analyticsSharing }))}
                        className={`settings-toggle ${privacySettings.analyticsSharing ? 'settings-toggle-checked' : ''}`}
                      >
                        <span className="settings-toggle-inner" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
