import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const HASH_TO_TAB = {
  '#subscription': 'goals',
  '#theme': 'profile',
  '#notifications': 'goals',
  '#account': 'security',
};

export default function Settings() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');

  // Hash-based navigation from sidebar
  useEffect(() => {
    const hash = location.hash;
    if (hash && HASH_TO_TAB[hash]) {
      setActiveTab(HASH_TO_TAB[hash]);
    }
  }, [location.hash]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone_number: '',
    college_name: '',
    course: 'BCA',
    semester: 1,
    avatar_url: '',
    daily_study_hours_goal: 2,
    weekly_quiz_target: 3,
    subject_mastery_target: 80,
    privacy_profile_visible: true,
    privacy_analytics_sharing: true,
  });

  // Password data state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // Activity log state
  const [activity, setActivity] = useState({
    quizzes: [],
    coding: [],
  });

  // Load profile details on mount
  useEffect(() => {
    loadProfile();
    loadActivity();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setProfileData({
        name: data.name || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        college_name: data.college_name || '',
        course: data.course || 'BCA',
        semester: Number(data.semester) || 1,
        avatar_url: data.avatar_url || '',
        daily_study_hours_goal: Number(data.daily_study_hours_goal) || 2,
        weekly_quiz_target: Number(data.weekly_quiz_target) || 3,
        subject_mastery_target: Number(data.subject_mastery_target) || 80,
        privacy_profile_visible: data.privacy_profile_visible !== false,
        privacy_analytics_sharing: data.privacy_analytics_sharing !== false,
      });
    } catch (err) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      const { data } = await api.get('/auth/profile/activity');
      setActivity(data);
    } catch (err) {
      console.error('Failed to load activity logs', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name: profileData.name,
        phone_number: profileData.phone_number,
        college_name: profileData.college_name,
        course: profileData.course,
        semester: profileData.semester,
        avatar_url: profileData.avatar_url,
      });
      // Sync with context
      if (user) {
        login({ ...user, name: data.user.name });
      }
      toast.success('Profile details saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleGoalsUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile/goals', {
        daily_study_hours_goal: profileData.daily_study_hours_goal,
        weekly_quiz_target: profileData.weekly_quiz_target,
        subject_mastery_target: profileData.subject_mastery_target,
        privacy_profile_visible: profileData.privacy_profile_visible,
        privacy_analytics_sharing: profileData.privacy_analytics_sharing,
      });
      toast.success('Goals & privacy settings updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating goals');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmNewPassword) {
      return toast.error('Passwords do not match');
    }
    setSaving(true);
    try {
      await api.put('/auth/profile/password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      setPassData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleAccountDeletion = async () => {
    const confirmDelete = window.confirm(
      'Are you absolutely sure you want to delete your profile? This action is permanent and cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      await api.delete('/auth/profile');
      toast.success('Account deleted successfully');
      localStorage.removeItem('token');
      window.location.href = '/?login=true';
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Block */}
      <div className="card flex flex-col md:flex-row items-center gap-6 p-6 md:justify-between bg-gradient-to-r from-emerald-950/20 to-teal-950/10 border-emerald-500/10">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/30 flex items-center justify-center bg-slate-800 text-white text-3xl font-bold shadow-lg">
              {profileData.avatar_url ? (
                <img src={profileData.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials(profileData.name)
              )}
            </div>
          </div>
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-2xl font-bold text-[var(--db-text-main)]">{profileData.name}</h1>
            <p className="text-sm text-slate-400">{profileData.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {profileData.course || 'BCA'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Semester {profileData.semester || '1'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('profile')}
          className="btn-primary flex items-center gap-2 self-stretch md:self-auto justify-center"
        >
          ✏️ Edit Profile
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-[var(--db-card-border)] overflow-x-auto gap-2">
        {['profile', 'goals', 'activity', 'security'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'profile' ? 'Account Details' : tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'profile' && (
          <div className="card space-y-6">
            <h2 className="text-lg font-bold border-b border-[var(--db-card-border)] pb-3 text-[var(--db-text-main)]">
              Edit Profile Details
            </h2>
            <form onSubmit={handleProfileUpdate} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] p-2.5 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="w-full bg-slate-800/50 border border-[var(--db-input-border)] text-slate-500 p-2.5 rounded-lg cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={profileData.phone_number}
                  onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                  className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] p-2.5 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Avatar Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={profileData.avatar_url}
                  onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                  className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] p-2.5 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">College / Institution Name</label>
                <input
                  type="text"
                  placeholder="University CS Department"
                  value={profileData.college_name}
                  onChange={(e) => setProfileData({ ...profileData, college_name: e.target.value })}
                  className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] p-2.5 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Course</label>
                  <select
                    value={profileData.course}
                    onChange={(e) => setProfileData({ ...profileData, course: e.target.value })}
                    className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] p-2.5 rounded-lg outline-none focus:border-emerald-500"
                  >
                    <option value="BCA">BCA</option>
                    <option value="BSc CS">BSc CS</option>
                    <option value="B.Tech IT">B.Tech IT</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={profileData.semester}
                    onChange={(e) => setProfileData({ ...profileData, semester: Number(e.target.value) })}
                    className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] p-2.5 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="card space-y-6">
            <h2 className="text-lg font-bold border-b border-[var(--db-card-border)] pb-3 text-[var(--db-text-main)]">
              Student Learning Goals
            </h2>
            <form onSubmit={handleGoalsUpdate} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Daily hours */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex justify-between">
                    <span>Daily Study Target</span>
                    <span className="text-emerald-500 font-bold">{profileData.daily_study_hours_goal} Hrs</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="0.5"
                    value={profileData.daily_study_hours_goal}
                    onChange={(e) => setProfileData({ ...profileData, daily_study_hours_goal: Number(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                  <p className="text-xs text-slate-400">Total target time spent studying per day.</p>
                </div>

                {/* Quizzes target */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex justify-between">
                    <span>Weekly Quiz Target</span>
                    <span className="text-blue-500 font-bold">{profileData.weekly_quiz_target} Quizzes</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={profileData.weekly_quiz_target}
                    onChange={(e) => setProfileData({ ...profileData, weekly_quiz_target: Number(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                  <p className="text-xs text-slate-400">Target completed quizzes per week.</p>
                </div>

                {/* Subject Mastery */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex justify-between">
                    <span>Subject Mastery Goal</span>
                    <span className="text-purple-500 font-bold">{profileData.subject_mastery_target}%</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={profileData.subject_mastery_target}
                    onChange={(e) => setProfileData({ ...profileData, subject_mastery_target: Number(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                  <p className="text-xs text-slate-400">Desired mastery score in quiz metrics.</p>
                </div>
              </div>

              {/* Goal visual indicators */}
              <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-[var(--db-card-border)]">
                <div className="p-4 bg-slate-800/20 rounded-xl border border-slate-700/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Daily Study progress</span>
                    <h4 className="font-bold text-xl mt-1 text-[var(--db-text-main)]">0%</h4>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                </div>
                <div className="p-4 bg-slate-800/20 rounded-xl border border-slate-700/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Quiz Target Status</span>
                    <h4 className="font-bold text-xl mt-1 text-[var(--db-text-main)]">0 / {profileData.weekly_quiz_target}</h4>
                  </div>
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="p-4 bg-slate-800/20 rounded-xl border border-slate-700/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Target Mastery Level</span>
                    <h4 className="font-bold text-xl mt-1 text-[var(--db-text-main)]">Elite {profileData.subject_mastery_target}%</h4>
                  </div>
                  <span className="text-2xl">🎓</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Updating...' : 'Save Study Goals'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quiz history */}
            <div className="card space-y-4">
              <h2 className="text-lg font-bold border-b border-[var(--db-card-border)] pb-3 text-[var(--db-text-main)]">
                Recent Quiz Performance
              </h2>
              {activity.quizzes.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">No quizzes attempted yet.</p>
              ) : (
                <div className="space-y-3">
                  {activity.quizzes.map((q, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/25 rounded-lg border border-[var(--db-card-border)] flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-sm text-[var(--db-text-main)]">{q.quiz_title}</h4>
                        <span className="text-xs text-slate-400">{q.subject_name} • {new Date(q.submitted_at).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        (q.score / q.total_questions) >= 0.7 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {q.score} / {q.total_questions}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coding activity */}
            <div className="card space-y-4">
              <h2 className="text-lg font-bold border-b border-[var(--db-card-border)] pb-3 text-[var(--db-text-main)]">
                Recent Coding Submissions
              </h2>
              {activity.coding.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">No coding submissions found.</p>
              ) : (
                <div className="space-y-3">
                  {activity.coding.map((c, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/25 rounded-lg border border-[var(--db-card-border)] flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-sm text-[var(--db-text-main)]">{c.problem_title}</h4>
                        <span className="text-xs text-slate-400 font-medium capitalize text-slate-500">{c.language} • {new Date(c.submitted_at).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        c.score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        Score: {c.score}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Password edit */}
            <div className="card space-y-4">
              <h2 className="text-lg font-bold border-b border-[var(--db-card-border)] pb-3 text-[var(--db-text-main)]">
                Change Account Password
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passData.currentPassword}
                    onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                    className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] p-2.5 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">New Password</label>
                  <input
                    type="password"
                    required
                    value={passData.newPassword}
                    onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                    className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] p-2.5 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passData.confirmNewPassword}
                    onChange={(e) => setPassData({ ...passData, confirmNewPassword: e.target.value })}
                    className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] p-2.5 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>

                <button type="submit" className="btn-primary w-full" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Privacy settings and Account deletion */}
            <div className="card space-y-6">
              <h2 className="text-lg font-bold border-b border-[var(--db-card-border)] pb-3 text-[var(--db-text-main)]">
                Privacy & Account Controls
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--db-text-main)]">Public Study Profile</h4>
                    <p className="text-xs text-slate-500">Allow other students to view your quiz scores</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileData.privacy_profile_visible}
                    onChange={(e) =>
                      setProfileData({ ...profileData, privacy_profile_visible: e.target.checked })
                    }
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--db-text-main)]">AI Model Training Sharing</h4>
                    <p className="text-xs text-slate-500">Share anonymized metrics for ML prediction updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileData.privacy_analytics_sharing}
                    onChange={(e) =>
                      setProfileData({ ...profileData, privacy_analytics_sharing: e.target.checked })
                    }
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--db-card-border)] space-y-3">
                <h3 className="text-sm font-bold text-red-500">Danger Zone</h3>
                <p className="text-xs text-slate-500">
                  Deleting your profile will immediately revoke your access and wipe your history and ML predictions.
                </p>
                <button onClick={handleAccountDeletion} className="w-full bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600/20 p-2.5 rounded-lg text-sm font-bold transition-all">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
